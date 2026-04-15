import { useTournamentStore } from '../store/useTournamentStore';
import { getRankedTeams } from '../utils/standings';

export default function Classement() {
  const { getActiveTournoi, setScreen } = useTournamentStore();
  const tournoi = getActiveTournoi();

  if (!tournoi) return null;

  const ranked = getRankedTeams(tournoi);
  const totalMatches = tournoi.matchs.filter((m) => m.done).length;

  const DiffCell = ({ val }) => {
    const n = Math.round(val);
    if (n > 0) return <td className="px-3 py-2 text-center font-semibold text-green-600">+{n}</td>;
    if (n < 0) return <td className="px-3 py-2 text-center font-semibold text-red-500">{n}</td>;
    return <td className="px-3 py-2 text-center text-gray-500">0</td>;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy-600">Classement</h2>
        {tournoi.started && !tournoi.finished && (
          <button className="btn-secondary text-sm" onClick={() => setScreen('tour')}>
            ← Tour en cours
          </button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-3xl font-bold text-navy-600">{tournoi.equipes.length}</div>
          <div className="text-xs text-gray-500 mt-1">Équipes</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{tournoi.tourActuel}/{tournoi.nbTours}</div>
          <div className="text-xs text-gray-500 mt-1">Tour actuel</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{totalMatches}</div>
          <div className="text-xs text-gray-500 mt-1">Matchs joués</div>
        </div>
      </div>

      {/* Ranking table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="bg-navy-600 text-white">
              <th className="px-3 py-3 text-center w-8">#</th>
              <th className="px-3 py-3 text-left">Équipe</th>
              <th className="px-3 py-3 text-center w-12">V</th>
              <th className="px-3 py-3 text-center w-12">D</th>
              <th className="px-3 py-3 text-center w-16">Pts +</th>
              <th className="px-3 py-3 text-center w-16">Pts −</th>
              <th className="px-3 py-3 text-center w-16">Diff</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((team, i) => {
              const isFirst = i === 0;
              const diff = team.pts - team.ptsCont;
              return (
                <tr
                  key={team.id}
                  className={`border-t border-gray-100 ${isFirst ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-3 py-2 text-center">
                    {i === 0 && '🥇'}
                    {i === 1 && '🥈'}
                    {i === 2 && '🥉'}
                    {i > 2 && <span className="text-gray-500 font-medium">{i + 1}</span>}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`${isFirst ? 'font-bold text-navy-600' : 'font-medium text-gray-800'} ${team.forfait ? 'line-through text-red-400' : ''}`}>
                      {team.nom}
                    </span>
                    {team.forfait && <span className="ml-1 text-xs text-red-400">Forfait</span>}
                    {team.byeRecu && !team.forfait && (
                      <span className="ml-1 text-xs text-gray-400 italic">bye</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center font-semibold text-green-700">
                    {team.v % 1 === 0 ? team.v : team.v.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center text-red-500">{team.d}</td>
                  <td className="px-3 py-2 text-center">{team.pts}</td>
                  <td className="px-3 py-2 text-center">{team.ptsCont}</td>
                  <DiffCell val={diff} />
                </tr>
              );
            })}
          </tbody>
        </table>
        {ranked.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucune équipe</p>
        )}
      </div>
    </div>
  );
}
