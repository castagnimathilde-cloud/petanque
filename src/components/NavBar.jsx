import { useTournamentStore } from '../store/useTournamentStore';

const TABS = [
  { id: 'equipes', label: 'Équipes', requireStarted: false },
  { id: 'tour', label: 'Tour en cours', requireStarted: true },
  { id: 'classement', label: 'Classement', requireStarted: true },
  { id: 'resultats', label: 'Résultat final', requireFinished: true },
];

export default function NavBar({ onDashboard }) {
  const { activeScreen, setScreen, goToDashboard, getActiveTournoi } = useTournamentStore();
  const tournoi = getActiveTournoi();

  const visibleTabs = TABS.filter((tab) => {
    if (!tournoi) return false;
    if (tab.requireFinished) return tournoi.finished;
    if (tab.requireStarted) return tournoi.started;
    return true; // equipes — always visible when tournoi selected
  });

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-0 overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeScreen === 'dashboard'
                ? 'border-navy-600 text-navy-600'
                : 'border-transparent text-gray-500 hover:text-navy-600 hover:border-navy-200'
            }`}
            onClick={() => { goToDashboard(); onDashboard?.(); }}
          >
            🎯 Tournois
          </button>

          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeScreen === tab.id
                  ? 'border-navy-600 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-navy-600 hover:border-navy-200'
              }`}
              onClick={() => setScreen(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
