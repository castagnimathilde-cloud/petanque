import { useState, useEffect, useRef } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';

function RoundDots({ nbTours, tourActuel }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: nbTours }, (_, i) => {
        const n = i + 1;
        let cls = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ';
        if (n < tourActuel)  cls += 'bg-emerald-500 text-white shadow-sm';
        else if (n === tourActuel) cls += 'bg-blue-600 text-white shadow-md ring-4 ring-blue-200 scale-110';
        else cls += 'bg-gray-200 text-gray-400';
        return <div key={n} className={cls}>{n < tourActuel ? '✓' : n}</div>;
      })}
    </div>
  );
}

function MatchCard({ match, matchIndex, tournoi }) {
  const { setScore } = useTournamentStore();
  const [sA, setSA] = useState(match.sA !== null ? String(match.sA) : '');
  const [sB, setSB] = useState(match.sB !== null ? String(match.sB) : '');
  const [error, setError] = useState('');
  const [justWon, setJustWon] = useState(false);
  const [medalSide, setMedalSide] = useState(null); // 'A' | 'B' | null
  const prevDone = useRef(match.done);

  useEffect(() => {
    if (!prevDone.current && match.done) {
      setJustWon(true);
      setMedalSide(match.sA > match.sB ? 'A' : match.sB > match.sA ? 'B' : null);
      const t = setTimeout(() => { setJustWon(false); setMedalSide(null); }, 1400);
      return () => clearTimeout(t);
    }
    prevDone.current = match.done;
  }, [match.done, match.sA, match.sB]);

  const teamA = tournoi.equipes.find((e) => e.id === match.A);
  const teamB = match.B ? tournoi.equipes.find((e) => e.id === match.B) : null;

  if (match.bye) {
    return (
      <div className="card border-dashed border-gray-200 bg-gray-50/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-lg shrink-0">💤</div>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-gray-700 truncate block">{teamA?.nom}</span>
          <p className="text-gray-400 text-xs mt-0.5">Exempt ce tour — victoire automatique</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-emerald-600 font-black text-lg">+{tournoi.scoreCible}</span>
          <p className="text-gray-400 text-xs">pts</p>
        </div>
      </div>
    );
  }

  const numA = parseInt(sA, 10);
  const numB = parseInt(sB, 10);
  const bothFilled = sA !== '' && sB !== '' && !isNaN(numA) && !isNaN(numB) && numA >= 0 && numB >= 0;
  const tieBlocked = bothFilled && !tournoi.matchNulAutorise && numA === numB;
  const isValid = bothFilled && !tieBlocked;

  const preview = bothFilled && !match.done ? (
    numA > numB ? `${teamA?.nom} gagne` :
    numB > numA ? `${teamB?.nom} gagne` :
    '⚖️ Match nul'
  ) : null;

  const handleValidate = () => {
    setError('');
    const result = setScore(tournoi.id, matchIndex, numA, numB);
    if (result.error) setError(result.error);
  };

  const winnerA = match.done && match.sA > match.sB;
  const winnerB = match.done && match.sB > match.sA;
  const terrainLabel = match.terrain ? `Terrain ${match.terrain}` : null;

  return (
    <div className={`card relative transition-all duration-200 ${justWon ? 'animate-winner-flash' : match.done ? 'bg-emerald-50 border-emerald-200' : 'bg-white hover:shadow-md'}`}>
      {/* Terrain + status */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {terrainLabel && (
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-navy-50 text-navy-600 border border-navy-100">
            {terrainLabel}
          </span>
        )}
        {match.done
          ? <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">✓ Validé</span>
          : <span className="text-xs font-medium text-navy-400 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-100">✏️ À saisir</span>
        }
        {error && <span className="text-red-500 text-xs ml-auto font-medium animate-slide-up">⚠️ {error}</span>}
      </div>

      {/* Teams + scores */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Team A */}
        <div className="flex-1 min-w-0 text-right relative">
          {medalSide === 'A' && (
            <span className="absolute right-0 -top-1 text-xl pointer-events-none animate-float-medal">🏅</span>
          )}
          <span className={`font-black truncate block text-sm sm:text-base leading-tight ${winnerA ? 'text-emerald-700' : 'text-gray-800'} ${justWon && medalSide === 'A' ? 'animate-winner-bounce' : ''}`}>
            {winnerA && '🏅 '}{teamA?.nom || '?'}
          </span>
          {teamA?.j1 && (
            <span className="text-xs text-gray-400 truncate block">
              {teamA.j1}{teamA.j2 ? ` · ${teamA.j2}` : ''}{teamA.j3 ? ` · ${teamA.j3}` : ''}
            </span>
          )}
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number" min="0" inputMode="numeric"
            className={`w-14 h-14 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none transition-colors ${
              match.done
                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                : winnerA
                  ? 'border-emerald-400 bg-emerald-50 focus:border-emerald-500'
                  : 'border-gray-200 hover:border-navy-300 focus:border-navy-500 focus:bg-blue-50/30'
            }`}
            value={sA}
            onChange={(e) => !match.done && setSA(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') document.getElementById(`score-b-${matchIndex}`)?.focus();
            }}
            readOnly={match.done}
            placeholder="–"
          />
          <span className="text-gray-300 font-black text-xl select-none">:</span>
          <input
            id={`score-b-${matchIndex}`}
            type="number" min="0" inputMode="numeric"
            className={`w-14 h-14 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none transition-colors ${
              match.done
                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                : winnerB
                  ? 'border-emerald-400 bg-emerald-50 focus:border-emerald-500'
                  : 'border-gray-200 hover:border-navy-300 focus:border-navy-500 focus:bg-blue-50/30'
            }`}
            value={sB}
            onChange={(e) => !match.done && setSB(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && isValid) handleValidate(); }}
            readOnly={match.done}
            placeholder="–"
          />
        </div>

        {/* Team B */}
        <div className="flex-1 min-w-0 relative">
          {medalSide === 'B' && (
            <span className="absolute left-0 -top-1 text-xl pointer-events-none animate-float-medal">🏅</span>
          )}
          <span className={`font-black truncate block text-sm sm:text-base leading-tight ${winnerB ? 'text-emerald-700' : 'text-gray-800'} ${justWon && medalSide === 'B' ? 'animate-winner-bounce' : ''}`}>
            {winnerB && '🏅 '}{teamB?.nom || '?'}
          </span>
          {teamB?.j1 && (
            <span className="text-xs text-gray-400 truncate block">
              {teamB.j1}{teamB.j2 ? ` · ${teamB.j2}` : ''}{teamB.j3 ? ` · ${teamB.j3}` : ''}
            </span>
          )}
        </div>

        {/* Validate button */}
        {!match.done && (
          <button
            className={`shrink-0 w-12 h-12 rounded-2xl font-black text-lg transition-all ${
              isValid
                ? 'bg-navy-600 text-white hover:bg-navy-700 active:scale-90 shadow-sm'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            onClick={handleValidate}
            disabled={!isValid}
            title={tieBlocked ? 'Égalité non autorisée' : isValid ? 'Valider (Entrée)' : 'Saisissez les deux scores'}
          >
            ✓
          </button>
        )}
      </div>

      {/* Live preview / tie warning */}
      {!match.done && (preview || tieBlocked) && (
        <div className={`mt-2.5 text-center text-xs font-bold py-1.5 px-3 rounded-xl animate-slide-up ${
          tieBlocked
            ? 'bg-amber-50 text-amber-600 border border-amber-200'
            : 'bg-emerald-50 text-emerald-600'
        }`}>
          {tieBlocked ? '⚠️ Égalité non autorisée dans ce tournoi' : `🏆 ${preview}`}
        </div>
      )}
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
  const realMatches    = currentMatches.filter((m) => !m.bye);
  const byeMatches     = currentMatches.filter((m) => m.bye);
  const doneCount      = currentMatches.filter((m) => m.done).length;
  const allDone        = currentMatches.length > 0 && doneCount === currentMatches.length;
  const isLastTour     = tournoi.tourActuel >= tournoi.nbTours;
  const progress       = currentMatches.length ? Math.round((doneCount / currentMatches.length) * 100) : 0;

  const handleNext = () => {
    setNextError('');
    const result = nextTour(tournoi.id);
    if (result?.error) { setNextError(result.error); return; }
    if (result?.finished) setScreen('resultats');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      {/* Header */}
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
          <div className="text-right shrink-0">
            <div className="text-3xl font-black">{doneCount}<span className="text-blue-300 text-xl">/{currentMatches.length}</span></div>
            <div className="text-blue-200 text-xs">matchs validés</div>
            <div className="mt-2 flex items-center gap-2 justify-end">
              <div className="bg-white/20 rounded-full h-2 w-28">
                <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-white/70 text-xs font-bold tabular-nums w-8 text-right">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matches */}
      {currentMatches.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">Aucun match pour ce tour</div>
      ) : (
        <div className="flex flex-col gap-3">
          {realMatches.map((m) => (
            <MatchCard
              key={`${m.tour}-${m.A}-${m.B}`}
              match={m}
              matchIndex={tournoi.matchs.findIndex((mm) => mm === m)}
              tournoi={tournoi}
            />
          ))}
          {byeMatches.map((m) => (
            <MatchCard
              key={`bye-${m.A}`}
              match={m}
              matchIndex={tournoi.matchs.findIndex((mm) => mm === m)}
              tournoi={tournoi}
            />
          ))}
        </div>
      )}

      {/* All done celebration */}
      {allDone && (
        <div className={`card text-center py-5 animate-pop-in ${
          isLastTour
            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
        }`}>
          <p className={`font-black text-xl ${isLastTour ? 'text-amber-700' : 'text-emerald-700'}`}>
            {isLastTour ? '🏆 Dernière manche terminée !' : '🎉 Tous les matchs sont validés !'}
          </p>
          <p className={`text-sm mt-1 ${isLastTour ? 'text-amber-600' : 'text-emerald-500'}`}>
            {isLastTour ? 'Prêt à découvrir le classement final ?' : 'Passez au tour suivant quand vous êtes prêt.'}
          </p>
        </div>
      )}

      {/* Back to registration (tour 1 only) */}
      {tournoi.tourActuel === 1 && (
        confirmReset ? (
          <div className="card border-2 border-orange-200 bg-orange-50 animate-slide-up">
            <p className="text-orange-800 font-bold text-sm mb-3">
              ⚠️ Revenir aux inscriptions annulera le tour en cours et effacera tous les scores. Continuer ?
            </p>
            <div className="flex gap-2">
              <button
                className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-orange-600 transition-colors active:scale-95"
                onClick={() => resetToRegistration(tournoi.id)}
              >
                Oui, revenir aux inscriptions
              </button>
              <button className="btn-secondary text-sm" onClick={() => setConfirmReset(false)}>
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
          {nextError && <span className="text-red-500 text-sm font-medium animate-slide-up">⚠️ {nextError}</span>}
          {allDone ? (
            <button className="btn-primary px-6 text-base active:scale-95" onClick={handleNext}>
              {isLastTour ? '🏆 Résultats finaux' : 'Tour suivant →'}
            </button>
          ) : (
            <span className="bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-xl">
              ⏳ {currentMatches.length - doneCount} match{currentMatches.length - doneCount > 1 ? 's' : ''} restant{currentMatches.length - doneCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
