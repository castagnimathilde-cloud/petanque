import { useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';

const DEFAULTS = {
  nom: '',
  cat: 'adultes',
  date: '',
  heure: '',
  eqMin: 4,
  eqMax: 16,
  joueursParEq: 2,
  scoreCible: 13,
  matchNulAutorise: false,
  nbTours: 3,
  nbTerrains: 4,
  googleFormUrl: '',
};

export default function TournoiForm({ onCancel, onCreated }) {
  const { createTournoi, selectTournoi } = useTournamentStore();
  const [form, setForm] = useState(DEFAULTS);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.nom.trim()) { setError('Le nom du tournoi est obligatoire'); return; }
    if (form.eqMin < 2) { setError('Minimum 2 équipes'); return; }
    if (form.eqMax < form.eqMin) { setError('Le max doit être ≥ au min'); return; }
    try {
      const id = createTournoi(form);
      selectTournoi(id);
      onCreated?.(id);
    } catch (err) {
      setError('Erreur lors de la création : ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          className="text-gray-500 hover:text-navy-600 transition-colors"
          onClick={onCancel}
          aria-label="Retour"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-navy-600">Nouveau tournoi</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Informations générales */}
        <div className="card">
          <h2 className="font-semibold text-navy-600 mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nom du tournoi *</label>
              <input
                className="input-field"
                placeholder="Ex: Pétanque du camping"
                value={form.nom}
                onChange={(e) => set('nom', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select
                className="input-field"
                value={form.cat}
                onChange={(e) => set('cat', e.target.value)}
              >
                <option value="adultes">Adultes</option>
                <option value="enfants">Enfants</option>
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input
                className="input-field"
                placeholder="Ex: 14/07/2025"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Heure de début</label>
              <input
                className="input-field"
                placeholder="Ex: 14h00"
                value={form.heure}
                onChange={(e) => set('heure', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Paramètres sportifs */}
        <div className="card">
          <h2 className="font-semibold text-navy-600 mb-4">Paramètres sportifs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Équipes minimum</label>
              <input
                type="number"
                className="input-field"
                min={2}
                value={form.eqMin}
                onChange={(e) => set('eqMin', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Équipes maximum</label>
              <input
                type="number"
                className="input-field"
                min={2}
                value={form.eqMax}
                onChange={(e) => set('eqMax', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Joueurs par équipe</label>
              <select
                className="input-field"
                value={form.joueursParEq}
                onChange={(e) => set('joueursParEq', Number(e.target.value))}
              >
                <option value={1}>1 — Tête-à-tête</option>
                <option value={2}>2 — Doublette</option>
                <option value={3}>3 — Triplette</option>
              </select>
            </div>
            <div>
              <label className="label">Score cible par match</label>
              <select
                className="input-field"
                value={form.scoreCible}
                onChange={(e) => set('scoreCible', Number(e.target.value))}
              >
                <option value={7}>7 points</option>
                <option value={11}>11 points</option>
                <option value={13}>13 points</option>
              </select>
            </div>
            <div>
              <label className="label">Nombre de tours</label>
              <select
                className="input-field"
                value={form.nbTours}
                onChange={(e) => set('nbTours', Number(e.target.value))}
              >
                <option value={3}>3 tours</option>
                <option value={4}>4 tours</option>
                <option value={5}>5 tours</option>
              </select>
            </div>
            <div>
              <label className="label">Terrains disponibles</label>
              <input
                type="number"
                className="input-field"
                min={1}
                value={form.nbTerrains}
                onChange={(e) => set('nbTerrains', Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="matchNul"
                className="w-4 h-4 rounded"
                checked={form.matchNulAutorise}
                onChange={(e) => set('matchNulAutorise', e.target.checked)}
              />
              <label htmlFor="matchNul" className="text-sm font-medium text-gray-700">
                Match nul autorisé
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn-primary">
            Créer le tournoi →
          </button>
        </div>
      </form>
    </div>
  );
}
