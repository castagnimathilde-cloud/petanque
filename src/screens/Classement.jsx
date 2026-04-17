import { useTournamentStore } from '../store/useTournamentStore';
import { getRankedTeams } from '../utils/standings';

export default function Classement() {
  const { getActiveTournoi, setScreen } = useTournamentStore();
  const tournoi = getActiveTournoi();
  if (!tournoi) return null;

  const ranked      = getRankedTeams(tournoi);
  const totalMatchs = tournoi.matchs.filter((m) => m.done && !m.bye).length;
  const leader      = ranked[0];
  const maxPts      = leader ? Math.max(leader.pts, 1) : 1;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-navy-600">Classement</h2>
          <p className="text-gray-400 text-sm">{tournoi.nom}</p>
        </div>
        {tournoi.started && !tournoi.finished && (
          <button className="btn-secondary text-sm" onClick={() => setScreen('tour')}>
            ← Tour en cours
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="text-3xl font-black text-navy-600">{tournoi.equipes.length}</div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Équipes</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-black text-blue-600">
            {tournoi.tourActuel}<span className="text-lg text-gray-300">/{tournoi.nbTours}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Tour actuel</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-black text-emerald-600">{totalMatchs}</div>
          <div className="text-xs text-gray-400 mt-1 font-medium">Matchs joués</div>
        </div>
      </div>

      {/* Rankings */}
      <div className="card p-0 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[2rem_1fr_2.5rem_3.5rem] sm:grid-cols-[2.5rem_1fr_2.5rem_2.5rem_3.5rem_3.5rem_3.5rem] bg-gradient-to-r from-navy-600 to-blue-700 text-white text-xs font-bold px-2 py-3">
          <div className="text-center">#</div>
          <div className="pl-2">Équipe</div>
          <div className="text-center">V</div>
          <div className="hidden sm:block text-center">D</div>
          <div className="hidden sm:block text-center">Pts+</div>
          <div className="hidden sm:block text-center">Pts−</div>
          <div className="text-center">Diff</div>
        </div>

        {ranked.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">Aucune équipe inscrite</p>
        )}

        {ranked.map((team, i) => {
          const diff    = team.pts - team.ptsCont;
          const isFirst = i === 0;
          const behind  = leader && i > 0 ? leader.v - team.v : 0;

          return (
            <div
              key={team.id}
              className={`border-t border-gray-100 transition-colors ${
                isFirst ? 'bg-amber-50' : i === 1 ? 'bg-gray-50/60' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              } ${team.forfait ? 'opacity-50' : ''}`}
            >
              <div className="grid grid-cols-[2rem_1fr_2.5rem_3.5rem] sm:grid-cols-[2.5rem_1fr_2.5rem_2.5rem_3.5rem_3.5rem_3.5rem] items-center px-2 py-3">
                {/* Rank */}
                <div className="text-center text-lg">
                  {i < 3 ? medals[i] : <span className="text-gray-400 font-bold text-sm">{i + 1}</span>}
                </div>

                {/* Team name + players + bar */}
                <div className="pl-2 min-w-0">
                  <div className={`font-black text-sm leading-tight truncate ${isFirst ? 'text-navy-700' : 'text-gray-800'} ${team.forfait ? 'line-through' : ''}`}>
                    {team.nom}
                    {team.forfait && <span className="ml-1 text-xs text-red-400 font-bold normal-case no-underline">Forfait</span>}
                  </div>
                  {(team.j1) && (
                    <div className="text-xs text-gray-400 truncate mt-0.5">
                      {team.j1}{team.j2 ? ` · ${team.j2}` : ''}{team.j3 ? ` · ${team.j3}` : ''}
                    </div>
                  )}
                  {/* Points bar */}
                  {team.pts > 0 && (
                    <div className="mt-1.5 h-1 rounded-full bg-gray-100 w-full max-w-[120px]">
                      <div
                        className={`h-1 rounded-full transition-all duration-700 ${isFirst ? 'bg-amber-400' : 'bg-blue-300'}`}
                        style={{ width: `${Math.round((team.pts / maxPts) * 100)}%` }}
                      />
                    </div>
                  )}
                  {behind > 0 && (
                    <div className="text-xs text-gray-300 mt-0.5">{behind.toFixed(1)} V derrière</div>
                  )}
                </div>

                {/* V */}
                <div className="text-center font-black text-emerald-600 text-sm">
                  {team.v % 1 === 0 ? team.v : team.v.toFixed(1)}
                </div>
                {/* D — hidden on mobile */}
                <div className="hidden sm:block text-center font-bold text-red-400 text-sm">{team.d}</div>
                {/* Pts+ — hidden on mobile */}
                <div className="hidden sm:block text-center text-gray-600 text-sm font-medium">{team.pts}</div>
                {/* Pts− — hidden on mobile */}
                <div className="hidden sm:block text-center text-gray-400 text-sm">{team.ptsCont}</div>
                {/* Diff */}
                <div className={`text-center font-black text-sm ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {diff > 0 ? '+' : ''}{diff}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tournoi.started && !tournoi.finished && (
        <p className="text-center text-gray-400 text-xs">Classement mis à jour en temps réel</p>
      )}
    </div>
  );
}
