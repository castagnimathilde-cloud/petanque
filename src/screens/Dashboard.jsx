import { useTournamentStore } from '../store/useTournamentStore';

function StatusBadge({ tournoi }) {
  if (tournoi.finished) return <span className="badge-termine">✓ Terminé</span>;
  if (tournoi.started) return <span className="badge-tour">Tour {tournoi.tourActuel}/{tournoi.nbTours}</span>;
  return <span className="badge-inscriptions">Inscriptions</span>;
}

function TournoiCard({ tournoi, onSelect, onDelete }) {
  const catLabel = tournoi.cat === 'enfants' ? '👶 Enfants' : '🧑 Adultes';
  return (
    <div
      className="card-hover group"
      onClick={() => onSelect(tournoi.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-black text-gray-800 text-lg truncate">{tournoi.nom}</span>
            <StatusBadge tournoi={tournoi} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span>{catLabel}</span>
            {tournoi.date && <span>📅 {tournoi.date}</span>}
            {tournoi.heure && <span>⏰ {tournoi.heure}</span>}
            <span>👥 {tournoi.equipes.length} équipe{tournoi.equipes.length !== 1 ? 's' : ''}</span>
            <span>🔄 {tournoi.nbTours} tours · 🎯 {tournoi.scoreCible} pts</span>
          </div>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all text-sm shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Supprimer "${tournoi.nom}" ?`)) onDelete(tournoi.id);
          }}
          title="Supprimer"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ onCreateNew }) {
  const { tournois, selectTournoi, deleteTournoi } = useTournamentStore();

  const enCours = tournois.filter((t) => t.started && !t.finished);
  const termines = tournois.filter((t) => t.finished);
  const inscriptions = tournois.filter((t) => !t.started);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Hero header */}
      <div className="card bg-gradient-to-br from-navy-600 to-blue-700 border-0 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">🎯</span>
              <h1 className="text-2xl font-black">Pétanque Tournois</h1>
            </div>
            <p className="text-blue-200 text-sm">Gérez vos tournois hebdomadaires du camping</p>
          </div>
          <button
            className="bg-white text-navy-600 font-black px-5 py-3 rounded-2xl text-sm hover:bg-blue-50 transition-all shadow-lg shrink-0 active:scale-95"
            onClick={onCreateNew}
          >
            + Nouveau
          </button>
        </div>

        {tournois.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'En cours', value: enCours.length, color: 'bg-blue-500' },
              { label: 'Inscriptions', value: inscriptions.length, color: 'bg-amber-400' },
              { label: 'Terminés', value: termines.length, color: 'bg-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-blue-200 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {tournois.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-xl font-black text-gray-700 mb-2">Aucun tournoi créé</h2>
          <p className="text-gray-400 text-sm mb-6">Créez votre premier tournoi pour commencer !</p>
          <button className="btn-primary mx-auto" onClick={onCreateNew}>
            + Créer un tournoi
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enCours.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">En cours</p>
              {enCours.map((t) => <TournoiCard key={t.id} tournoi={t} onSelect={selectTournoi} onDelete={deleteTournoi} />)}
            </div>
          )}
          {inscriptions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Inscriptions ouvertes</p>
              {inscriptions.map((t) => <TournoiCard key={t.id} tournoi={t} onSelect={selectTournoi} onDelete={deleteTournoi} />)}
            </div>
          )}
          {termines.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Terminés</p>
              {termines.map((t) => <TournoiCard key={t.id} tournoi={t} onSelect={selectTournoi} onDelete={deleteTournoi} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
