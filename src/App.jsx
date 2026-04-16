import { useState } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './screens/Dashboard';
import TournoiForm from './screens/TournoiForm';
import Equipes from './screens/Equipes';
import TourEnCours from './screens/TourEnCours';
import Classement from './screens/Classement';
import Resultats from './screens/Resultats';
import InscriptionPage from './screens/InscriptionPage';
import { useTournamentStore } from './store/useTournamentStore';
import './index.css';

// Check if URL contains ?register=ID (participant scanning QR code)
const urlParams = new URLSearchParams(window.location.search);
const registerTournoiId = urlParams.get('register');

export default function App() {
  const { activeScreen, activeTournoiId, setScreen } = useTournamentStore();
  const [showNewForm, setShowNewForm] = useState(false);

  // Participant scanned QR code — show standalone registration page
  if (registerTournoiId) {
    return <InscriptionPage tournoiId={registerTournoiId} />;
  }

  const handleCreateNew = () => setShowNewForm(true);
  const handleCancelCreate = () => setShowNewForm(false);
  const handleCreated = () => { setShowNewForm(false); setScreen('equipes'); };
  const handleNavDashboard = () => setShowNewForm(false);

  const renderContent = () => {
    if (showNewForm) {
      return <TournoiForm onCancel={handleCancelCreate} onCreated={handleCreated} />;
    }
    if (!activeTournoiId || activeScreen === 'dashboard') {
      return <Dashboard onCreateNew={handleCreateNew} />;
    }
    switch (activeScreen) {
      case 'equipes':   return <Equipes />;
      case 'tour':      return <TourEnCours />;
      case 'classement':return <Classement />;
      case 'resultats': return <Resultats />;
      default:          return <Dashboard onCreateNew={handleCreateNew} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar onDashboard={handleNavDashboard} />
      <main className="py-6">{renderContent()}</main>
    </div>
  );
}
