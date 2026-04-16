import { useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';

const DEFAULTS = {
  nom: '', cat: 'adultes', date: '', heure: '',
  eqMin: 4, eqMax: 16, eqUnlimited: false, joueursParEq: 2,
  scoreCible: 13, matchNulAutorise: false,
  nbTours: 3, nbTerrains: 4,
};

function Toggle({ label, hint, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 cursor-pointer select-none group w-full text-left"
    >
      <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? 'bg-navy-600' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
      <div>
        <span className="text-sm font-bold text-gray-700">{label}</span>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
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
    <div className="max-w-2xl mx-auto p-4 pb-10">
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
                  autoFocus
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

        {/* Équipes */}
        <div className="card">
          <h2 className="section-title">👥 Équipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Minimum" hint="Requis pour lancer le tournoi">
              <input
                type="number" className="input-field" min={2}
                value={form.eqMin}
                onChange={(e) => set('eqMin', Number(e.target.value))}
              />
            </Field>
            <Field label="Maximum">
              <input
                type="number" className="input-field" min={2}
                value={form.eqMax}
                disabled={form.eqUnlimited}
                onChange={(e) => set('eqMax', Number(e.target.value))}
              />
            </Field>
            <div className="sm:col-span-2 bg-gray-50 rounded-2xl px-4 py-3">
              <Toggle
                label="Inscriptions illimitées"
                hint="Aucun plafond sur le nombre d'équipes"
                checked={form.eqUnlimited}
                onChange={(v) => set('eqUnlimited', v)}
              />
            </div>
            <Field label="Format">
              <select className="input-field" value={form.joueursParEq} onChange={(e) => set('joueursParEq', Number(e.target.value))}>
                <option value={1}>1 joueur — Tête-à-tête</option>
                <option value={2}>2 joueurs — Doublette</option>
                <option value={3}>3 joueurs — Triplette</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Paramètres sportifs */}
        <div className="card">
          <h2 className="section-title">⚙️ Paramètres sportifs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <Field label="Terrains disponibles" hint="Utilisé pour l'affichage des terrains">
              <input type="number" className="input-field" min={1} value={form.nbTerrains} onChange={(e) => set('nbTerrains', Number(e.target.value))} />
            </Field>
            <div className="flex items-end">
              <div className="bg-gray-50 rounded-2xl px-4 py-3 w-full">
                <Toggle
                  label="Match nul autorisé"
                  hint="Un match peut se terminer à égalité"
                  checked={form.matchNulAutorise}
                  onChange={(v) => set('matchNulAutorise', v)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button type="submit" className="btn-primary px-8 text-base">Créer le tournoi →</button>
        </div>
      </form>
    </div>
  );
}
