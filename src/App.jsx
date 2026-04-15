import { useState } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './screens/Dashboard';
import TournoiForm from './screens/TournoiForm';
import Equipes from './screens/Equipes';
import TourEnCours from './screens/TourEnCours';
import Classement from './screens/Classement';
import Resultats from './screens/Resultats';
import { useTournamentStore } from './store/useTournamentStore';
import './index.css';

export default function App() {
  const { activeScreen, activeTournoiId, setScreen } = useTournamentStore();
  const [showNewForm, setShowNewForm] = useState(false);

  const handleCreateNew = () => setShowNewForm(true);
  const handleCancelCreate = () => setShowNewForm(false);
  const handleCreated = () => {
    setShowNewForm(false);
    setScreen('equipes');
  };
  // Allow NavBar to close the form when navigating away
  const handleNavDashboard = () => setShowNewForm(false);

  const renderContent = () => {
    if (showNewForm) {
      return (
        <TournoiForm
          onCancel={handleCancelCreate}
          onCreated={handleCreated}
        />
      );
    }

    if (!activeTournoiId || activeScreen === 'dashboard') {
      return <Dashboard onCreateNew={handleCreateNew} />;
    }

    switch (activeScreen) {
      case 'equipes':
        return <Equipes />;
      case 'tour':
        return <TourEnCours />;
      case 'classement':
        return <Classement />;
      case 'resultats':
        return <Resultats />;
      default:
        return <Dashboard onCreateNew={handleCreateNew} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar onDashboard={handleNavDashboard} />
      <main className="py-6">
        {renderContent()}
      </main>
    </div>
  );
}
