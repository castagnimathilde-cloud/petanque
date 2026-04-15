import { useTournamentStore } from '../store/useTournamentStore';
import { getRankedTeams } from '../utils/standings';

function PodiumBlock({ team, position, height }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const colors = {
    1: 'bg-amber-400 border-amber-500',
    2: 'bg-gray-300 border-gray-400',
    3: 'bg-amber-700 border-amber-800',
  };
  const textColors = {
    1: 'text-amber-900',
    2: 'text-gray-700',
    3: 'text-amber-900',
  };

  if (!team) return <div style={{ height }} />;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-center">
        <div className="text-2xl">{medals[position]}</div>
        <div className="font-bold text-navy-600 text-sm max-w-24 text-center leading-tight">
          {team.nom}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {team.v % 1 === 0 ? team.v : team.v.toFixed(1)} V
          {' · '}
          {team.pts > team.ptsCont ? '+' : ''}{team.pts - team.ptsCont} diff
        </div>
      </div>
      <div
        className={`w-24 rounded-t-lg border-2 flex items-end justify-center pb-2 ${colors[position]}`}
        style={{ height }}
      >
        <span className={`text-2xl font-black ${textColors[position]}`}>{position}</span>
      </div>
    </div>
  );
}

export default function Resultats() {
  const { getActiveTournoi, goToDashboard } = useTournamentStore();
  const tournoi = getActiveTournoi();

  if (!tournoi) return null;

  const ranked = getRankedTeams(tournoi);
  const winner = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-5">
      {/* Winner banner */}
      {winner && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 border-2 border-amber-500 p-6 text-center shadow-lg">
          <div className="text-5xl mb-2">🏆</div>
          <div className="text-3xl font-black text-amber-900 mb-1">{winner.nom}</div>
          <div className="text-amber-700 font-medium">
            {winner.v % 1 === 0 ? winner.v : winner.v.toFixed(1)} victoires
            {' · '}
            {winner.pts} pts marqués
            {' · '}
            {winner.pts > winner.ptsCont ? '+' : ''}{winner.pts - winner.ptsCont} diff
          </div>
          <div className="text-amber-600 text-sm mt-1">{tournoi.nom}</div>
        </div>
      )}

      {/* Podium */}
      {ranked.length >= 2 && (
        <div className="card">
          <h3 className="font-semibold text-navy-600 mb-6 text-center">Podium</h3>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd place (left) */}
            <PodiumBlock team={second} position={2} height={80} />
            {/* 1st place (center, tallest) */}
            <PodiumBlock team={winner} position={1} height={110} />
            {/* 3rd place (right) */}
            <PodiumBlock team={third || null} position={3} height={55} />
          </div>
        </div>
      )}

      {/* Full standings */}
      <div className="card overflow-x-auto p-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-navy-600">Classement final</h3>
        </div>
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="bg-navy-600 text-white">
              <th className="px-3 py-3 text-center w-8">#</th>
              <th className="px-3 py-3 text-left">Équipe</th>
              <th className="px-3 py-3 text-center w-14">V</th>
              <th className="px-3 py-3 text-center w-16">Diff</th>
              <th className="px-3 py-3 text-center w-20">Pts marqués</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((team, i) => {
              const diff = team.pts - team.ptsCont;
              const isTop3 = i < 3;
              return (
                <tr
                  key={team.id}
                  className={`border-t border-gray-100 ${isTop3 ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-3 py-2 text-center">
                    {i === 0 && '🥇'}
                    {i === 1 && '🥈'}
                    {i === 2 && '🥉'}
                    {i > 2 && <span className="text-gray-500 font-medium">{i + 1}</span>}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-medium ${isTop3 ? 'font-bold text-navy-600' : 'text-gray-800'} ${team.forfait ? 'line-through text-red-400' : ''}`}>
                      {team.nom}
                    </span>
                    {team.forfait && <span className="ml-1 text-xs text-red-400">Forfait</span>}
                    <div className="text-xs text-gray-400">{team.j1}{team.j2 ? ` & ${team.j2}` : ''}</div>
                  </td>
                  <td className="px-3 py-2 text-center font-semibold text-green-700">
                    {team.v % 1 === 0 ? team.v : team.v.toFixed(1)}
                  </td>
                  <td className={`px-3 py-2 text-center font-semibold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </td>
                  <td className="px-3 py-2 text-center">{team.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button className="btn-secondary self-start" onClick={goToDashboard}>
        ← Retour aux tournois
      </button>
    </div>
  );
}
