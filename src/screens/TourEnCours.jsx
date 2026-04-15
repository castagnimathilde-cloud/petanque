import { useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';

function RoundDots({ nbTours, tourActuel }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: nbTours }, (_, i) => {
        const num = i + 1;
        let cls = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ';
        if (num < tourActuel) cls += 'bg-green-500 text-white';
        else if (num === tourActuel) cls += 'bg-blue-500 text-white ring-2 ring-blue-300';
        else cls += 'bg-gray-200 text-gray-500';
        return (
          <div key={num} className={cls} title={`Tour ${num}`}>
            {num < tourActuel ? '✓' : num}
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
      <div className="card flex items-center gap-3 opacity-70">
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-mono">BYE</span>
        <span className="font-semibold text-gray-700">{teamA?.nom || '?'}</span>
        <span className="text-gray-400 text-sm">— Exempt ce tour</span>
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
          +{tournoi.scoreCible} pts
        </span>
      </div>
    );
  }

  const handleValidate = () => {
    setError('');
    const a = parseInt(sA, 10);
    const b = parseInt(sB, 10);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) {
      setError('Scores invalides');
      return;
    }
    const result = setScore(tournoi.id, matchIndex, a, b);
    if (result.error) {
      setError(result.error);
    }
  };

  const terrainLabel = match.terrain ? `T${match.terrain}` : null;

  return (
    <div className={`card flex flex-col gap-2 ${match.done ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {terrainLabel ? (
          <span className="text-xs bg-navy-50 text-navy-600 border border-navy-100 px-2 py-0.5 rounded font-mono font-bold">
            {terrainLabel}
          </span>
        ) : (
          <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded font-mono">
            En attente
          </span>
        )}
        {match.done && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
            ✓ OK
          </span>
        )}
        {error && <span className="text-xs text-red-600 ml-auto">{error}</span>}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Team A */}
        <div className="flex-1 min-w-0">
          <span className={`font-semibold truncate block ${teamA?.forfait ? 'line-through text-red-400' : 'text-gray-800'}`}>
            {teamA?.nom || '?'}
          </span>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min="0"
            className={`w-14 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-navy-600 ${
              match.done ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' : 'border-gray-300'
            }`}
            value={sA}
            onChange={(e) => !match.done && setSA(e.target.value)}
            readOnly={match.done}
            placeholder="0"
          />
          <span className="text-gray-400 font-bold text-sm">vs</span>
          <input
            type="number"
            min="0"
            className={`w-14 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-navy-600 ${
              match.done ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' : 'border-gray-300'
            }`}
            value={sB}
            onChange={(e) => !match.done && setSB(e.target.value)}
            readOnly={match.done}
            placeholder="0"
          />
        </div>

        {/* Team B */}
        <div className="flex-1 min-w-0 text-right">
          <span className={`font-semibold truncate block ${teamB?.forfait ? 'line-through text-red-400' : 'text-gray-800'}`}>
            {teamB?.nom || '?'}
          </span>
        </div>

        {/* Validate button */}
        {!match.done && (
          <button
            className="btn-primary shrink-0 py-1 px-3 text-sm"
            onClick={handleValidate}
            disabled={sA === '' || sB === ''}
          >
            ✓ Valider
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
  const [nextSuccess, setNextSuccess] = useState('');

  if (!tournoi) return null;

  const currentMatches = tournoi.matchs.filter((m) => m.tour === tournoi.tourActuel);
  const allDone = currentMatches.length > 0 && currentMatches.every((m) => m.done);
  const isLastTour = tournoi.tourActuel >= tournoi.nbTours;

  const handleNext = () => {
    setNextError('');
    const result = nextTour(tournoi.id);
    if (result?.error) {
      setNextError(result.error);
      return;
    }
    if (result?.finished) {
      setNextSuccess('Tournoi terminé !');
      setTimeout(() => setScreen('resultats'), 800);
    } else {
      setNextSuccess('Tour suivant généré !');
      setTimeout(() => setNextSuccess(''), 2000);
    }
  };

  const nonByeMatches = currentMatches.filter((m) => !m.bye);
  const byeMatches = currentMatches.filter((m) => m.bye);

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-navy-600">
            {tournoi.nom} — Tour {tournoi.tourActuel}/{tournoi.nbTours}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {allDone ? '✅ Tous les matchs sont validés' : `${currentMatches.filter((m) => m.done).length}/${currentMatches.length} matchs validés`}
          </p>
        </div>
        <RoundDots nbTours={tournoi.nbTours} tourActuel={tournoi.tourActuel} />
      </div>

      {currentMatches.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">Aucun match pour ce tour</div>
      ) : (
        <div className="flex flex-col gap-3">
          {nonByeMatches.map((m) => {
            const globalIdx = tournoi.matchs.findIndex((mm) => mm === m);
            return (
              <MatchCard
                key={`${m.tour}-${m.A}-${m.B}`}
                match={m}
                matchIndex={globalIdx}
                tournoi={tournoi}
              />
            );
          })}
          {byeMatches.map((m) => {
            const globalIdx = tournoi.matchs.findIndex((mm) => mm === m);
            return (
              <MatchCard
                key={`bye-${m.A}`}
                match={m}
                matchIndex={globalIdx}
                tournoi={tournoi}
              />
            );
          })}
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          className="btn-secondary"
          onClick={() => setScreen('classement')}
        >
          Voir classement
        </button>
        <div className="flex items-center gap-3">
          {nextError && <span className="text-red-600 text-sm">{nextError}</span>}
          {nextSuccess && <span className="text-green-600 text-sm font-semibold">{nextSuccess}</span>}
          {allDone && (
            <button className="btn-primary" onClick={handleNext}>
              {isLastTour ? '🏆 Voir les résultats finaux' : 'Tour suivant →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
