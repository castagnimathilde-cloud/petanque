/**
 * Fisher-Yates shuffle — mutates array in place, returns it
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sort teams by ranking criteria:
 * 1. Wins DESC
 * 2. Goal-average (pts - ptsCont) DESC
 * 3. Points scored DESC
 * 4. Random on tie
 */
export function sortByRanking(teams) {
  return [...teams].sort((a, b) => {
    if (b.v !== a.v) return b.v - a.v;
    const gaA = a.pts - a.ptsCont;
    const gaB = b.pts - b.ptsCont;
    if (gaB !== gaA) return gaB - gaA;
    if (b.pts !== a.pts) return b.pts - a.pts;
    return Math.random() - 0.5;
  });
}

/**
 * Pick which team gets the bye for this round.
 * Prefer teams that haven't had a bye yet; otherwise take last in sorted list.
 */
function pickByeTeam(sortedActive) {
  // Search from end of sorted list (weakest first)
  for (let i = sortedActive.length - 1; i >= 0; i--) {
    if (!sortedActive[i].byeRecu) return sortedActive[i];
  }
  return sortedActive[sortedActive.length - 1];
}

/**
 * Pair teams using swiss system with anti-rematch logic.
 * Returns array of { A: teamId, B: teamId }.
 */
function pairTeams(sortedTeams) {
  const remaining = [...sortedTeams];
  const pairs = [];

  while (remaining.length >= 2) {
    const teamA = remaining.shift();
    // Try to find opponent not yet faced
    let opponentIdx = remaining.findIndex(
      (t) => !teamA.adversaires.includes(t.id)
    );
    // Fallback: allow rematch if no fresh opponent found
    if (opponentIdx === -1) opponentIdx = 0;
    const [teamB] = remaining.splice(opponentIdx, 1);
    pairs.push({ A: teamA.id, B: teamB.id });
  }

  return pairs;
}

/**
 * Generate all matches for a given round.
 *
 * @param {object} tournoi - full tournament object
 * @param {number} tourNumber - 1-based round number
 * @returns {object[]} array of match objects to append to tournoi.matchs
 */
export function generateRound(tournoi, tourNumber) {
  const { scoreCible, nbTerrains, matchNulAutorise } = tournoi;
  const activeTeams = tournoi.equipes.filter((e) => !e.forfait);
  let teamsToUse;
  const newMatches = [];

  if (tourNumber === 1) {
    teamsToUse = shuffle([...activeTeams]);
  } else {
    teamsToUse = sortByRanking(activeTeams);
  }

  // Handle odd number — give bye before pairing
  if (teamsToUse.length % 2 !== 0) {
    const byeTeam = pickByeTeam(teamsToUse);
    teamsToUse = teamsToUse.filter((t) => t.id !== byeTeam.id);
    newMatches.push({
      tour: tourNumber,
      A: byeTeam.id,
      B: null,
      sA: scoreCible,
      sB: 0,
      done: true,
      terrain: null,
      bye: true,
    });
    // Do NOT mutate team objects here — recalculateStandings is the single source of truth.
  }

  const pairs = pairTeams(teamsToUse);

  pairs.forEach(({ A, B }, idx) => {
    const terrain = idx < nbTerrains ? idx + 1 : null;
    newMatches.push({
      tour: tourNumber,
      A,
      B,
      sA: null,
      sB: null,
      done: false,
      terrain,
      bye: false,
    });
  });

  return newMatches;
}

/**
 * Recalculate all team stats from scratch based on completed matches.
 * Returns a new array of team objects with updated stats.
 */
export function recalculateStandings(tournoi) {
  const teams = tournoi.equipes.map((e) => ({
    ...e,
    v: 0,
    d: 0,
    pts: 0,
    ptsCont: 0,
    matchsJoues: 0,
    adversaires: [],
    // preserve byeRecu and forfait
  }));

  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));

  for (const m of tournoi.matchs) {
    if (!m.done) continue;

    if (m.bye) {
      // This is the single place bye stats are counted — recalculate is authoritative.
      const tA = teamById[m.A];
      if (tA) {
        tA.v += 1;
        tA.pts += m.sA;
        tA.matchsJoues += 1;
        tA.byeRecu = true;
      }
      continue;
    }

    const tA = teamById[m.A];
    const tB = teamById[m.B];
    if (!tA || !tB) continue;

    tA.pts += m.sA;
    tA.ptsCont += m.sB;
    tA.matchsJoues += 1;
    if (!tA.adversaires.includes(m.B)) tA.adversaires.push(m.B);

    tB.pts += m.sB;
    tB.ptsCont += m.sA;
    tB.matchsJoues += 1;
    if (!tB.adversaires.includes(m.A)) tB.adversaires.push(m.A);

    if (m.sA > m.sB) {
      tA.v += 1;
      tB.d += 1;
    } else if (m.sB > m.sA) {
      tB.v += 1;
      tA.d += 1;
    } else if (tournoi.matchNulAutorise) {
      tA.v += 0.5;
      tB.v += 0.5;
    }
  }

  return teams;
}

/**
 * Import raw pasted text from Google Sheets (tab-separated).
 */
export function importFromSheet(rawText, tournoi) {
  const lines = rawText.trim().split('\n');
  let added = 0;
  let skipped = 0;

  const newEquipes = [...tournoi.equipes];

  lines.forEach((line) => {
    if (!line.trim()) return;
    const cols = line.split('\t');
    const nom = (cols[0] || '').trim();
    const j1 = (cols[1] || '').trim();
    if (!nom || !j1) { skipped++; return; }
    if (newEquipes.find((e) => e.nom.toLowerCase() === nom.toLowerCase())) {
      skipped++;
      return;
    }
    if (newEquipes.length >= tournoi.eqMax) { skipped++; return; }
    newEquipes.push({
      id: Date.now() + Math.random(),
      nom,
      j1,
      j2: (cols[2] || '').trim(),
      j3: (cols[3] || '').trim(),
      empl: (cols[4] || '').trim(),
      v: 0, d: 0, pts: 0, ptsCont: 0,
      matchsJoues: 0, adversaires: [], byeRecu: false, forfait: false,
    });
    added++;
  });

  return { equipes: newEquipes, added, skipped };
}
