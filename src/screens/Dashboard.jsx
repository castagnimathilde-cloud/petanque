import { useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';

function TournoiCard({ tournoi, onSelect, onDelete }) {
  const statusBadge = () => {
    if (tournoi.finished) return <span className="badge-termine">Terminé</span>;
    if (tournoi.started)
      return (
        <span className="badge-tour">
          Tour {tournoi.tourActuel}/{tournoi.nbTours}
        </span>
      );
    return <span className="badge-inscriptions">Inscriptions</span>;
  };

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(tournoi.id)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-navy-600 text-lg truncate">{tournoi.nom}</span>
          {statusBadge()}
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
            {tournoi.cat}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {tournoi.date && <span>📅 {tournoi.date}</span>}
          {tournoi.heure && <span>⏰ {tournoi.heure}</span>}
          <span>👥 {tournoi.equipes.length} équipe{tournoi.equipes.length !== 1 ? 's' : ''}</span>
          <span>🎯 {tournoi.nbTours} tours</span>
        </div>
      </div>
      <button
        className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded border border-red-200 hover:border-red-400 transition-colors self-start sm:self-center"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Supprimer "${tournoi.nom}" ?`)) onDelete(tournoi.id);
        }}
      >
        Supprimer
      </button>
    </div>
  );
}

export default function Dashboard({ onCreateNew }) {
  const { tournois, selectTournoi, deleteTournoi } = useTournamentStore();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">🎯 Pétanque Tournois</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos tournois hebdomadaires</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={onCreateNew}
        >
          <span className="text-lg">+</span> Nouveau tournoi
        </button>
      </div>

      {tournois.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-500 text-lg mb-2">Aucun tournoi créé</p>
          <p className="text-gray-400 text-sm mb-6">Créez votre premier tournoi pour commencer</p>
          <button className="btn-primary" onClick={onCreateNew}>
            + Créer un tournoi
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tournois.map((t) => (
            <TournoiCard
              key={t.id}
              tournoi={t}
              onSelect={selectTournoi}
              onDelete={deleteTournoi}
            />
          ))}
        </div>
      )}
    </div>
  );
}
