import { useTournamentStore } from '../store/useTournamentStore';
import { getRankedTeams } from '../utils/standings';

export default function Classement() {
  const { getActiveTournoi, setScreen } = useTournamentStore();
  const tournoi = getActiveTournoi();
  if (!tournoi) return null;

  const ranked = getRankedTeams(tournoi);
  const totalMatchs = tournoi.matchs.filter((m) => m.done && !m.bye).length;

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-navy-600">Classement</h2>
          <p className="text-gray-400 text-sm">{tournoi.nom}</p>
        </div>
        {tournoi.started && !tournoi.finished && (
          <button className="btn-secondary text-sm" onClick={() => setScreen('tour')}>← Tour en cours</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="text-3xl font-black text-navy-600">{tournoi.equipes.length}</div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Équipes</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-black text-blue-600">{tournoi.tourActuel}<span className="text-lg text-gray-400">/{tournoi.nbTours}</span></div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Tour actuel</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-black text-emerald-600">{totalMatchs}</div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Matchs joués</div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-navy-600 to-blue-700 text-white">
              <th className="px-4 py-3 text-center w-10 font-bold">#</th>
              <th className="px-4 py-3 text-left font-bold">Équipe</th>
              <th className="px-4 py-3 text-center w-10 font-bold">V</th>
              <th className="px-4 py-3 text-center w-10 font-bold">D</th>
              <th className="px-4 py-3 text-center w-14 font-bold">Pts+</th>
              <th className="px-4 py-3 text-center w-14 font-bold">Pts−</th>
              <th className="px-4 py-3 text-center w-16 font-bold">Diff</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((team, i) => {
              const diff = team.pts - team.ptsCont;
              const isFirst = i === 0;
              const medals = ['🥇','🥈','🥉'];
              return (
                <tr
                  key={team.id}
                  className={`border-t border-gray-100 ${isFirst ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="px-4 py-3 text-center text-lg">
                    {i < 3 ? medals[i] : <span className="text-gray-400 font-bold text-sm">{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${isFirst ? 'text-navy-600' : 'text-gray-800'} ${team.forfait ? 'line-through opacity-50' : ''}`}>
                      {team.nom}
                    </span>
                    {team.forfait && <span className="ml-1 badge bg-red-100 text-red-500">Forfait</span>}
                    {team.byeRecu && !team.forfait && <span className="ml-1 text-xs text-gray-300">bye</span>}
                  </td>
                  <td className="px-4 py-3 text-center font-black text-emerald-600">
                    {team.v % 1 === 0 ? team.v : team.v.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-red-400">{team.d}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{team.pts}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{team.ptsCont}</td>
                  <td className={`px-4 py-3 text-center font-black ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {ranked.length === 0 && (
          <p className="text-center text-gray-400 py-10">Aucune équipe inscrite</p>
        )}
      </div>
    </div>
  );
}
