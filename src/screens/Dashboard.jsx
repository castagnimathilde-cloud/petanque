import { useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';

function StatusBadge({ tournoi }) {
  if (tournoi.finished) return <span className="badge-termine">✓ Terminé</span>;
  if (tournoi.started)  return <span className="badge-tour">Tour {tournoi.tourActuel}/{tournoi.nbTours}</span>;
  return <span className="badge-inscriptions">Inscriptions</span>;
}

function formatDate(d) {
  if (!d) return '';
  const parts = d.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
}

function TournoiCard({ tournoi, onSelect, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const catLabel = tournoi.cat === 'enfants' ? '👶 Enfants' : '🧑 Adultes';

  return (
    <div
      className="card-hover group relative animate-slide-up cursor-pointer"
      onClick={() => !confirmDelete && onSelect(tournoi.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-black text-gray-800 text-lg truncate">{tournoi.nom}</span>
            <StatusBadge tournoi={tournoi} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
            <span>{catLabel}</span>
            {tournoi.date  && <span>📅 {formatDate(tournoi.date)}</span>}
            {tournoi.heure && <span>⏰ {tournoi.heure}</span>}
            <span>👥 {tournoi.equipes.length} équipe{tournoi.equipes.length !== 1 ? 's' : ''}</span>
            <span>🔄 {tournoi.nbTours} tours · 🎯 {tournoi.scoreCible} pts</span>
          </div>
          {/* Hover affordance — desktop only */}
          {!confirmDelete && (
            <span className="hidden sm:inline-block text-navy-500 text-xs font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Ouvrir →
            </span>
          )}
        </div>

        {/* Delete — inline confirmation */}
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 animate-slide-up">
              <button
                className="text-xs bg-red-500 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-red-600 transition-colors active:scale-95"
                onClick={() => { onDelete(tournoi.id); setConfirmDelete(false); }}
              >
                Supprimer
              </button>
              <button
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setConfirmDelete(false)}
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
              onClick={() => setConfirmDelete(true)}
              title="Supprimer ce tournoi"
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onCreateNew }) {
  const { tournois, selectTournoi, deleteTournoi } = useTournamentStore();

  const enCours      = tournois.filter((t) => t.started && !t.finished);
  const inscriptions = tournois.filter((t) => !t.started);
  const termines     = tournois.filter((t) => t.finished);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Hero */}
      <div className="card bg-gradient-to-br from-navy-600 to-blue-700 border-0 text-white mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <img src="/logo-lescale.jpg" alt="L'Escale" className="h-14 w-14 rounded-full object-cover shadow-lg border-2 border-white/30 shrink-0" />
              <div>
                <h1 className="text-2xl font-black leading-tight">Pétanque Tournois</h1>
                <p className="text-blue-200 text-xs font-medium">Camping Caravaning L'Escale</p>
              </div>
            </div>
            <p className="text-blue-200 text-sm mt-1">Organisez vos tournois facilement</p>
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
              { label: 'En cours',     value: enCours.length,      dot: 'bg-blue-300 animate-pulse' },
              { label: 'Inscriptions', value: inscriptions.length, dot: 'bg-amber-300' },
              { label: 'Terminés',     value: termines.length,     dot: 'bg-emerald-300' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition-colors">
                <div className="text-2xl font-black">{s.value}</div>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                  <span className="text-blue-200 text-xs">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {tournois.length === 0 ? (
        <div className="card text-center py-16 animate-pop-in">
          <div className="text-7xl mb-5">🎯</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Prêt à jouer ?</h2>
          <p className="text-gray-500 text-base mb-1">Créez votre premier tournoi en 30 secondes.</p>
          <p className="text-gray-400 text-sm mb-8">QR code d'inscription · scores en direct · classement automatique</p>
          <button
            className="bg-gradient-to-r from-navy-600 to-blue-600 text-white font-black px-8 py-3.5 rounded-2xl text-base hover:from-navy-700 hover:to-blue-700 transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
            onClick={onCreateNew}
          >
            🎯 Créer un tournoi
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {enCours.length > 0 && (
            <section>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
                En cours
              </p>
              <div className="flex flex-col gap-2">
                {enCours.map((t) => <TournoiCard key={t.id} tournoi={t} onSelect={selectTournoi} onDelete={deleteTournoi} />)}
              </div>
            </section>
          )}
          {inscriptions.length > 0 && (
            <section>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Inscriptions ouvertes
              </p>
              <div className="flex flex-col gap-2">
                {inscriptions.map((t) => <TournoiCard key={t.id} tournoi={t} onSelect={selectTournoi} onDelete={deleteTournoi} />)}
              </div>
            </section>
          )}
          {termines.length > 0 && (
            <section>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Terminés
              </p>
              <div className="flex flex-col gap-2">
                {termines.map((t) => <TournoiCard key={t.id} tournoi={t} onSelect={selectTournoi} onDelete={deleteTournoi} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
