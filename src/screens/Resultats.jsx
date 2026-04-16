import { useTournamentStore } from '../store/useTournamentStore';
import { getRankedTeams } from '../utils/standings';

function PodiumBlock({ team, position, height }) {
  const config = {
    1: { medal: '🥇', bg: 'bg-gradient-to-b from-amber-300 to-amber-500', text: 'text-amber-900', border: 'border-amber-400' },
    2: { medal: '🥈', bg: 'bg-gradient-to-b from-gray-200 to-gray-400', text: 'text-gray-700', border: 'border-gray-300' },
    3: { medal: '🥉', bg: 'bg-gradient-to-b from-amber-600 to-amber-800', text: 'text-amber-100', border: 'border-amber-700' },
  }[position];

  if (!team) return <div style={{ height }} className="w-28" />;

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-2 px-2">
        <div className="text-3xl mb-1">{config.medal}</div>
        <div className="font-black text-navy-600 text-sm leading-tight max-w-28 text-center">{team.nom}</div>
        <div className="text-xs text-gray-500 mt-1">
          {team.v % 1 === 0 ? team.v : team.v.toFixed(1)}V · {team.pts > team.ptsCont ? '+' : ''}{team.pts - team.ptsCont}
        </div>
      </div>
      <div
        className={`w-24 rounded-t-2xl border-2 ${config.bg} ${config.border} flex items-end justify-center pb-3 shadow-lg`}
        style={{ height }}
      >
        <span className={`text-3xl font-black ${config.text}`}>{position}</span>
      </div>
    </div>
  );
}

export default function Resultats() {
  const { getActiveTournoi, goToDashboard } = useTournamentStore();
  const tournoi = getActiveTournoi();
  if (!tournoi) return null;

  const ranked = getRankedTeams(tournoi);
  const [winner, second, third] = ranked;

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-5">
      {/* Winner banner */}
      {winner && (
        <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-400 border-2 border-amber-500 p-8 text-center shadow-2xl">
          <div className="text-6xl mb-3 animate-bounce">🏆</div>
          <div className="text-4xl font-black text-amber-900 mb-2">{winner.nom}</div>
          <div className="text-amber-700 font-bold text-lg">
            {winner.v % 1 === 0 ? winner.v : winner.v.toFixed(1)} victoires
            {' · '}{winner.pts} points marqués
          </div>
          <div className="text-amber-600 text-sm mt-2 font-medium">{tournoi.nom}</div>
        </div>
      )}

      {/* Podium */}
      {ranked.length >= 2 && (
        <div className="card text-center">
          <h3 className="section-title text-center">🎖️ Podium</h3>
          <div className="flex items-end justify-center gap-3 mt-4">
            <PodiumBlock team={second} position={2} height={90} />
            <PodiumBlock team={winner} position={1} height={120} />
            <PodiumBlock team={third || null} position={3} height={65} />
          </div>
        </div>
      )}

      {/* Full standings */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-navy-600">Classement final</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-navy-600 to-blue-700 text-white">
              <th className="px-4 py-3 text-center w-10 font-bold">#</th>
              <th className="px-4 py-3 text-left font-bold">Équipe</th>
              <th className="px-4 py-3 text-center w-10 font-bold">V</th>
              <th className="px-4 py-3 text-center w-16 font-bold">Diff</th>
              <th className="px-4 py-3 text-center w-20 font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((team, i) => {
              const diff = team.pts - team.ptsCont;
              const medals = ['🥇','🥈','🥉'];
              return (
                <tr
                  key={team.id}
                  className={`border-t border-gray-100 ${i < 3 ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="px-4 py-3 text-center text-lg">
                    {i < 3 ? medals[i] : <span className="text-gray-400 font-bold text-sm">{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${i < 3 ? 'text-navy-600 font-black' : 'text-gray-800'}`}>{team.nom}</span>
                    <div className="text-xs text-gray-400">{team.j1}{team.j2 ? ` · ${team.j2}` : ''}{team.j3 ? ` · ${team.j3}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-black text-emerald-600">
                    {team.v % 1 === 0 ? team.v : team.v.toFixed(1)}
                  </td>
                  <td className={`px-4 py-3 text-center font-black ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 font-bold">{team.pts}</td>
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
