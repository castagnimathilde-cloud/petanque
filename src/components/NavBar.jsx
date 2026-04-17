import { useTournamentStore } from '../store/useTournamentStore';

const TABS = [
  { id: 'equipes',    label: '👥 Équipes',       requireStarted: false },
  { id: 'tour',       label: '🎯 Tour en cours',  requireStarted: true  },
  { id: 'classement', label: '📊 Classement',     requireStarted: true  },
  { id: 'resultats',  label: '🏆 Résultats',      requireFinished: true },
];

export default function NavBar({ onDashboard }) {
  const { activeScreen, setScreen, goToDashboard, getActiveTournoi } = useTournamentStore();
  const tournoi = getActiveTournoi();

  const visibleTabs = TABS.filter((tab) => {
    if (!tournoi) return false;
    if (tab.requireFinished) return tournoi.finished;
    if (tab.requireStarted) return tournoi.started;
    return true;
  });

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center overflow-x-auto">
          {/* Logo / Dashboard tab */}
          <button
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-black whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeScreen === 'dashboard'
                ? 'border-navy-600 text-navy-600'
                : 'border-transparent text-gray-400 hover:text-navy-600 hover:border-navy-200'
            }`}
            onClick={() => { goToDashboard(); onDashboard?.(); }}
          >
            🎯 <span className="hidden sm:inline">Tournois</span>
          </button>

          {/* Separator */}
          {visibleTabs.length > 0 && (
            <div className="h-5 w-px bg-gray-200 mx-1 shrink-0" />
          )}

          {/* Tournament tabs */}
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3.5 text-sm font-bold whitespace-nowrap transition-all border-b-2 shrink-0 ${
                activeScreen === tab.id
                  ? 'border-navy-600 text-navy-600'
                  : 'border-transparent text-gray-400 hover:text-navy-600 hover:border-navy-200'
              }`}
              onClick={() => setScreen(tab.id)}
            >
              {tab.label}
            </button>
          ))}

          {/* Tournament status chip */}
          {tournoi && activeScreen !== 'dashboard' && (
            <div className="ml-auto flex items-center gap-2 shrink-0 pr-1">
              <span className="hidden sm:block text-xs text-gray-400 font-medium truncate max-w-[8rem]">{tournoi.nom}</span>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap ${
                tournoi.finished
                  ? 'bg-emerald-100 text-emerald-700'
                  : tournoi.started
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {tournoi.finished ? '🏆 Terminé' : tournoi.started ? `Tour ${tournoi.tourActuel}/${tournoi.nbTours}` : '📝 Inscriptions'}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
