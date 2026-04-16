import { useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';

const DEFAULTS = {
  nom: '', cat: 'adultes', date: '', heure: '',
  eqMin: 4, eqMax: 16, eqUnlimited: false, joueursParEq: 2,
  scoreCible: 13, matchNulAutorise: false,
  nbTours: 3, nbTerrains: 4,
};

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

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
    if (!form.eqUnlimited && form.eqMax < form.eqMin) { setError('Le max doit être ≥ au min'); return; }
    try {
      const id = createTournoi({ ...form, eqMax: form.eqUnlimited ? 9999 : form.eqMax });
      selectTournoi(id);
      onCreated?.(id);
    } catch (err) {
      setError('Erreur : ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button className="btn-ghost" onClick={onCancel}>← Retour</button>
        <div>
          <h1 className="text-2xl font-black text-navy-600">Nouveau tournoi</h1>
          <p className="text-gray-400 text-sm">Configurez les paramètres puis invitez les équipes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Informations générales */}
        <div className="card">
          <h2 className="section-title">📋 Informations générales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Nom du tournoi *">
                <input
                  className="input-field text-lg font-bold"
                  placeholder="Ex : Pétanque du camping"
                  value={form.nom}
                  onChange={(e) => set('nom', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Catégorie">
              <select className="input-field" value={form.cat} onChange={(e) => set('cat', e.target.value)}>
                <option value="adultes">🧑 Adultes</option>
                <option value="enfants">👶 Enfants</option>
              </select>
            </Field>
            <Field label="Date">
              <input className="input-field" placeholder="14/07/2025" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
            <Field label="Heure de début">
              <input className="input-field" placeholder="14h00" value={form.heure} onChange={(e) => set('heure', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Paramètres sportifs */}
        <div className="card">
          <h2 className="section-title">⚙️ Paramètres sportifs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Équipes minimum">
              <input type="number" className="input-field" min={2} value={form.eqMin} onChange={(e) => set('eqMin', Number(e.target.value))} />
            </Field>
            <Field label="Équipes maximum">
              <div className="flex items-center gap-2">
                <input
                  type="number" className="input-field"
                  min={2} value={form.eqMax}
                  disabled={form.eqUnlimited}
                  onChange={(e) => set('eqMax', Number(e.target.value))}
                />
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.eqUnlimited}
                    onChange={(e) => set('eqUnlimited', e.target.checked)}
                    className="w-4 h-4 accent-navy-600"
                  />
                  <span className="text-sm font-bold text-gray-700">Illimité</span>
                </label>
              </div>
            </Field>
            <Field label="Format">
              <select className="input-field" value={form.joueursParEq} onChange={(e) => set('joueursParEq', Number(e.target.value))}>
                <option value={1}>1 joueur — Tête-à-tête</option>
                <option value={2}>2 joueurs — Doublette</option>
                <option value={3}>3 joueurs — Triplette</option>
              </select>
            </Field>
            <Field label="Score cible">
              <select className="input-field" value={form.scoreCible} onChange={(e) => set('scoreCible', Number(e.target.value))}>
                <option value={7}>7 points</option>
                <option value={11}>11 points</option>
                <option value={13}>13 points</option>
              </select>
            </Field>
            <Field label="Nombre de tours">
              <select className="input-field" value={form.nbTours} onChange={(e) => set('nbTours', Number(e.target.value))}>
                <option value={3}>3 tours</option>
                <option value={4}>4 tours</option>
                <option value={5}>5 tours</option>
              </select>
            </Field>
            <Field label="Terrains disponibles">
              <input type="number" className="input-field" min={1} value={form.nbTerrains} onChange={(e) => set('nbTerrains', Number(e.target.value))} />
            </Field>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-12 h-6 rounded-full transition-colors ${form.matchNulAutorise ? 'bg-navy-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform m-0.5 ${form.matchNulAutorise ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-bold text-gray-700">Match nul autorisé</span>
              </label>
              <input type="checkbox" className="sr-only" checked={form.matchNulAutorise} onChange={(e) => set('matchNulAutorise', e.target.checked)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button type="submit" className="btn-primary px-6">Créer le tournoi →</button>
        </div>
      </form>
    </div>
  );
}
