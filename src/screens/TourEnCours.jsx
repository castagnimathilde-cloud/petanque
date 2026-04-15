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
      <div className="card bg-gray-50 flex items-center gap-3 opacity-75">
        <span className="badge bg-gray-200 text-gray-500 font-mono">BYE</span>
        <span className="font-bold text-gray-600">{teamA?.nom}</span>
        <span className="text-gray-400 text-sm flex-1">— Exempt ce tour</span>
        <span className="badge bg-emerald-100 text-emerald-700">+{tournoi.scoreCible} pts</span>
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

  const isValid = sA !== '' && sB !== '';
  const terrainLabel = match.terrain ? `T${match.terrain}` : null;
  const winnerA = match.done && match.sA > match.sB;
  const winnerB = match.done && match.sB > match.sA;

  return (
    <div className={`card ${match.done ? 'bg-emerald-50 border-emerald-100' : 'bg-white'}`}>
      {/* Terrain + status row */}
      <div className="flex items-center gap-2 mb-3">
        {terrainLabel ? (
          <span className="badge bg-navy-50 text-navy-600 border border-navy-200 font-mono font-black">
            {terrainLabel}
          </span>
        ) : (
          <span className="badge bg-yellow-50 text-yellow-600 border border-yellow-200">En attente</span>
        )}
        {match.done && <span className="badge bg-emerald-100 text-emerald-700">✓ Validé</span>}
        {error && <span className="text-red-500 text-xs ml-auto font-medium">⚠️ {error}</span>}
      </div>

      {/* Teams + scores */}
      <div className="flex items-center gap-3">
        {/* Team A */}
        <div className={`flex-1 min-w-0 text-right ${winnerA ? 'text-emerald-700' : ''}`}>
          <span className={`font-black truncate block text-sm sm:text-base ${winnerA ? 'text-emerald-700' : 'text-gray-800'}`}>
            {teamA?.nom || '?'}
          </span>
          {teamA?.j1 && <span className="text-xs text-gray-400 truncate block">{teamA.j1}{teamA.j2 ? ` · ${teamA.j2}` : ''}{teamA.j3 ? ` · ${teamA.j3}` : ''}</span>}
        </div>

        {/* Scores */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number" min="0"
            className={`w-14 h-14 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none focus:border-navy-500 transition-colors ${
              match.done ? 'bg-gray-100 border-gray-200 opacity-70 cursor-not-allowed' : winnerA ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-navy-300'
            }`}
            value={sA}
            onChange={(e) => !match.done && setSA(e.target.value)}
            readOnly={match.done}
            placeholder="0"
          />
          <span className="text-gray-300 font-black text-lg">–</span>
          <input
            type="number" min="0"
            className={`w-14 h-14 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none focus:border-navy-500 transition-colors ${
              match.done ? 'bg-gray-100 border-gray-200 opacity-70 cursor-not-allowed' : winnerB ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-navy-300'
            }`}
            value={sB}
            onChange={(e) => !match.done && setSB(e.target.value)}
            readOnly={match.done}
            placeholder="0"
          />
        </div>

        {/* Team B */}
        <div className={`flex-1 min-w-0 ${winnerB ? 'text-emerald-700' : ''}`}>
          <span className={`font-black truncate block text-sm sm:text-base ${winnerB ? 'text-emerald-700' : 'text-gray-800'}`}>
            {teamB?.nom || '?'}
          </span>
          {teamB?.j1 && <span className="text-xs text-gray-400 truncate block">{teamB.j1}{teamB.j2 ? ` · ${teamB.j2}` : ''}{teamB.j3 ? ` · ${teamB.j3}` : ''}</span>}
        </div>

        {/* Validate */}
        {!match.done && (
          <button
            className="btn-primary shrink-0 py-2 px-3 text-sm"
            onClick={handleValidate}
            disabled={!isValid}
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
}

export default function TourEnCours() {
  const { getActiveTournoi, nextTour, setScreen } = useTournamentStore();
  const tournoi = getActiveTournoi();
  const [nextError, setNextError] = useState('');

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
