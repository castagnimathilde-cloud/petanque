import { useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';

function RoundDots({ nbTours, tourActuel }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: nbTours }, (_, i) => {
        const n = i + 1;
        let cls = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ';
        if (n < tourActuel) cls += 'bg-emerald-500 text-white shadow-sm';
        else if (n === tourActuel) cls += 'bg-blue-600 text-white shadow-md ring-4 ring-blue-200 scale-110';
        else cls += 'bg-gray-200 text-gray-400';
        return (
          <div key={n} className={cls}>
            {n < tourActuel ? '✓' : n}
          </div>
        );
      })}
    </div>
  );
}

function MatchCard({ match, matchIndex, tournoi }) {
  const { setScore } = useTournamentStore();
  const [sA, setSA] = useState(match.sA !== null ? String(match.sA) : '');
  const [sB, setSB] = useState(match.sB !== null ? String(match.sB) : '');
  const [error, setError] = useState('');

  const teamA = tournoi.equipes.find((e) => e.id === match.A);
  const teamB = match.B ? tournoi.equipes.find((e) => e.id === match.B) : null;

  if (match.bye) {
    return (
      <div className="card bg-gray-50 flex items-center gap-3 opacity-70">
        <span className="text-xs font-black px-2 py-1 rounded-lg bg-gray-200 text-gray-500">BYE</span>
        <div className="flex-1">
          <span className="font-bold text-gray-600">{teamA?.nom}</span>
          <p className="text-gray-400 text-xs mt-0.5">Exempt ce tour — {tournoi.scoreCible} pts offerts</p>
        </div>
        <span className="text-emerald-600 font-black text-lg">+{tournoi.scoreCible}</span>
      </div>
    );
  }

  const handleValidate = () => {
    setError('');
    const a = parseInt(sA, 10);
    const b = parseInt(sB, 10);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) { setError('Scores invalides'); return; }
    const result = setScore(tournoi.id, matchIndex, a, b);
    if (result.error) setError(result.error);
  };

  const handleKeyDown = (e, next) => {
    if (e.key === 'Enter' && next) next.focus();
  };

  const numA = parseInt(sA, 10);
  const numB = parseInt(sB, 10);
  const isValid = !isNaN(numA) && !isNaN(numB) && numA >= 0 && numB >= 0
    && (tournoi.matchNulAutorise || numA !== numB);
  const terrainLabel = match.terrain ? `Terrain ${match.terrain}` : 'Sans terrain';
  const winnerA = match.done && match.sA > match.sB;
  const winnerB = match.done && match.sB > match.sA;

  return (
    <div className={`card transition-all ${match.done ? 'bg-emerald-50 border-emerald-200' : 'bg-white hover:shadow-md'}`}>
      {/* Terrain + status row */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${match.terrain ? 'bg-navy-50 text-navy-600 border border-navy-100' : 'bg-gray-100 text-gray-400'}`}>
          {terrainLabel}
        </span>
        {match.done
          ? <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">✓ Validé</span>
          : <span className="text-xs text-gray-400">Saisir le score</span>
        }
        {error && <span className="text-red-500 text-xs ml-auto font-medium">⚠️ {error}</span>}
      </div>

      {/* Teams + scores */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Team A */}
        <div className="flex-1 min-w-0 text-right">
          <span className={`font-black truncate block text-sm sm:text-base leading-tight ${winnerA ? 'text-emerald-700' : 'text-gray-800'}`}>
            {winnerA && '🏅 '}{teamA?.nom || '?'}
          </span>
          {teamA?.j1 && <span className="text-xs text-gray-400 truncate block">{teamA.j1}{teamA.j2 ? ` · ${teamA.j2}` : ''}{teamA.j3 ? ` · ${teamA.j3}` : ''}</span>}
        </div>

        {/* Scores */}
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number" min="0" inputMode="numeric"
            className={`w-14 h-14 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none transition-colors ${
              match.done ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : winnerA ? 'border-emerald-400 bg-emerald-50 focus:border-emerald-500' : 'border-gray-200 hover:border-navy-300 focus:border-navy-500'
            }`}
            value={sA}
            onChange={(e) => !match.done && setSA(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, document.getElementById(`score-b-${matchIndex}`))}
            readOnly={match.done}
            placeholder="–"
          />
          <span className="text-gray-300 font-black">:</span>
          <input
            id={`score-b-${matchIndex}`}
            type="number" min="0" inputMode="numeric"
            className={`w-14 h-14 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none transition-colors ${
              match.done ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : winnerB ? 'border-emerald-400 bg-emerald-50 focus:border-emerald-500' : 'border-gray-200 hover:border-navy-300 focus:border-navy-500'
            }`}
            value={sB}
            onChange={(e) => !match.done && setSB(e.target.value)}
            readOnly={match.done}
            placeholder="–"
          />
        </div>

        {/* Team B */}
        <div className="flex-1 min-w-0">
          <span className={`font-black truncate block text-sm sm:text-base leading-tight ${winnerB ? 'text-emerald-700' : 'text-gray-800'}`}>
            {winnerB && '🏅 '}{teamB?.nom || '?'}
          </span>
          {teamB?.j1 && <span className="text-xs text-gray-400 truncate block">{teamB.j1}{teamB.j2 ? ` · ${teamB.j2}` : ''}{teamB.j3 ? ` · ${teamB.j3}` : ''}</span>}
        </div>

        {/* Validate button */}
        {!match.done && (
          <button
            className={`shrink-0 w-12 h-12 rounded-2xl font-black text-lg transition-all ${
              isValid ? 'bg-navy-600 text-white hover:bg-navy-700 active:scale-95 shadow-sm' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            onClick={handleValidate}
            disabled={!isValid}
            title="Valider le score"
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
}

export default function TourEnCours() {
  const { getActiveTournoi, nextTour, setScreen, resetToRegistration } = useTournamentStore();
  const tournoi = getActiveTournoi();
  const [nextError, setNextError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!tournoi) return null;

  const currentMatches = tournoi.matchs.filter((m) => m.tour === tournoi.tourActuel);
  const doneCount = currentMatches.filter((m) => m.done).length;
  const allDone = currentMatches.length > 0 && doneCount === currentMatches.length;
  const isLastTour = tournoi.tourActuel >= tournoi.nbTours;
  const progress = currentMatches.length ? Math.round((doneCount / currentMatches.length) * 100) : 0;

  const handleNext = () => {
    setNextError('');
    const result = nextTour(tournoi.id);
    if (result?.error) { setNextError(result.error); return; }
    if (result?.finished) setScreen('resultats');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      {/* Header card */}
      <div className="card bg-gradient-to-r from-navy-600 to-blue-700 border-0 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-0.5">Tour en cours</p>
            <h2 className="text-xl font-black">{tournoi.nom}</h2>
            <div className="flex items-center gap-3 mt-2">
              <RoundDots nbTours={tournoi.nbTours} tourActuel={tournoi.tourActuel} />
              <span className="text-blue-200 text-sm">Tour {tournoi.tourActuel}/{tournoi.nbTours}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{doneCount}/{currentMatches.length}</div>
            <div className="text-blue-200 text-xs">matchs validés</div>
            {/* Progress bar */}
            <div className="mt-2 bg-white/20 rounded-full h-2 w-32 ml-auto">
              <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Matches */}
      {currentMatches.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">Aucun match pour ce tour</div>
      ) : (
        <div className="flex flex-col gap-3">
          {currentMatches.filter((m) => !m.bye).map((m) => (
            <MatchCard
              key={`${m.tour}-${m.A}-${m.B}`}
              match={m}
              matchIndex={tournoi.matchs.findIndex((mm) => mm === m)}
              tournoi={tournoi}
            />
          ))}
          {currentMatches.filter((m) => m.bye).map((m) => (
            <MatchCard
              key={`bye-${m.A}`}
              match={m}
              matchIndex={tournoi.matchs.findIndex((mm) => mm === m)}
              tournoi={tournoi}
            />
          ))}
        </div>
      )}

      {/* Back to registration (tour 1 only) */}
      {tournoi.tourActuel === 1 && (
        confirmReset ? (
          <div className="card border-2 border-orange-200 bg-orange-50">
            <p className="text-orange-800 font-bold text-sm mb-3">
              ⚠️ Revenir aux inscriptions va annuler le tour en cours et effacer tous les scores. Continuer ?
            </p>
            <div className="flex gap-2">
              <button
                className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-orange-600 transition-colors"
                onClick={() => resetToRegistration(tournoi.id)}
              >
                Oui, revenir aux inscriptions
              </button>
              <button
                className="btn-secondary text-sm"
                onClick={() => setConfirmReset(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-ghost text-sm text-orange-500 hover:bg-orange-50 self-start"
            onClick={() => setConfirmReset(true)}
          >
            ↩ Revenir aux inscriptions
          </button>
        )
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button className="btn-secondary" onClick={() => setScreen('classement')}>
          📊 Classement
        </button>
        <div className="flex items-center gap-3">
          {nextError && <span className="text-red-500 text-sm font-medium">⚠️ {nextError}</span>}
          {allDone && (
            <button className="btn-primary px-6" onClick={handleNext}>
              {isLastTour ? '🏆 Résultats finaux' : 'Tour suivant →'}
            </button>
          )}
          {!allDone && (
            <span className="text-gray-400 text-sm">
              {currentMatches.length - doneCount} match{currentMatches.length - doneCount > 1 ? 's' : ''} restant{currentMatches.length - doneCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
