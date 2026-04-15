import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useTournamentStore } from '../store/useTournamentStore';
import { importFromSheet } from '../utils/matchmaking';

// ── Kiosk mode ────────────────────────────────────────────────────────────────

function KioskMode({ tournoi, onClose }) {
  const { addEquipe } = useTournamentStore();
  const [form, setForm] = useState({ nom: '', j1: '', j2: '', empl: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nomRef = useRef();

  useEffect(() => {
    nomRef.current?.focus();
  }, []);

  const setField = (f, v) => setForm((s) => ({ ...s, [f]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.nom.trim()) { setError('Le nom de l\'équipe est obligatoire'); return; }
    if (!form.j1.trim()) { setError('Le joueur 1 est obligatoire'); return; }

    const result = addEquipe(tournoi.id, form);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(`✅ Équipe "${form.nom}" inscrite !`);
    setForm({ nom: '', j1: '', j2: '', empl: '' });
    setTimeout(() => {
      setSuccess('');
      nomRef.current?.focus();
    }, 3000);
  };

  const equipesList = tournoi.equipes;

  return (
    <div className="fixed inset-0 z-50 bg-navy-600 flex flex-col overflow-auto">
      <div className="flex items-center justify-between px-6 py-4 bg-navy-800">
        <h1 className="text-white text-2xl font-bold">🎯 Inscription — {tournoi.nom}</h1>
        <button
          className="text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          onClick={onClose}
        >
          ✕ Fermer la borne
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-5xl mx-auto w-full">
        {/* Form */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-navy-600 mb-6">Inscrire une équipe</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-base">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-base font-semibold">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Nom de l'équipe *
                </label>
                <input
                  ref={nomRef}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-navy-600"
                  placeholder="Ex: Les Cigales"
                  value={form.nom}
                  onChange={(e) => setField('nom', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Joueur 1 *
                </label>
                <input
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-navy-600"
                  placeholder="Prénom Nom"
                  value={form.j1}
                  onChange={(e) => setField('j1', e.target.value)}
                />
              </div>
              {tournoi.joueursParEq >= 2 && (
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Joueur 2
                  </label>
                  <input
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-navy-600"
                    placeholder="Prénom Nom (optionnel)"
                    value={form.j2}
                    onChange={(e) => setField('j2', e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Emplacement camping
                </label>
                <input
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-navy-600"
                  placeholder="Ex: n°42 (optionnel)"
                  value={form.empl}
                  onChange={(e) => setField('empl', e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-navy-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-navy-700 transition-colors mt-2"
              >
                S'inscrire →
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              {equipesList.length}/{tournoi.eqMax} équipes inscrites
            </div>
          </div>
        </div>

        {/* Teams list */}
        <div className="lg:w-72">
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3 text-lg">
              Équipes inscrites ({equipesList.length})
            </h3>
            <div className="overflow-y-auto max-h-96 flex flex-col gap-2">
              {equipesList.length === 0 && (
                <p className="text-white/60 text-sm italic">Aucune équipe pour l'instant</p>
              )}
              {equipesList.map((eq, i) => (
                <div key={eq.id} className="bg-white/20 rounded-xl px-3 py-2">
                  <div className="text-white font-semibold text-sm">
                    {i + 1}. {eq.nom}
                  </div>
                  <div className="text-white/70 text-xs">
                    {eq.j1}{eq.j2 ? ` & ${eq.j2}` : ''}{eq.empl ? ` — ${eq.empl}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Manual add form ───────────────────────────────────────────────────────────

function ManualAddForm({ tournoi, onAdded }) {
  const { addEquipe } = useTournamentStore();
  const [form, setForm] = useState({ nom: '', j1: '', j2: '', empl: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const setField = (f, v) => setForm((s) => ({ ...s, [f]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = addEquipe(tournoi.id, form);
    if (result.error) { setError(result.error); return; }
    setSuccess(`Équipe "${form.nom}" ajoutée`);
    setForm({ nom: '', j1: '', j2: '', empl: '' });
    setTimeout(() => setSuccess(''), 2000);
    onAdded?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</div>}
      {success && <div className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded">{success}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Nom équipe *</label>
          <input className="input-field" placeholder="Les Cigales" value={form.nom} onChange={(e) => setField('nom', e.target.value)} />
        </div>
        <div>
          <label className="label">Joueur 1 *</label>
          <input className="input-field" placeholder="Prénom Nom" value={form.j1} onChange={(e) => setField('j1', e.target.value)} />
        </div>
        {tournoi.joueursParEq >= 2 && (
          <div>
            <label className="label">Joueur 2</label>
            <input className="input-field" placeholder="Prénom Nom (optionnel)" value={form.j2} onChange={(e) => setField('j2', e.target.value)} />
          </div>
        )}
        <div>
          <label className="label">Emplacement</label>
          <input className="input-field" placeholder="n°42 (optionnel)" value={form.empl} onChange={(e) => setField('empl', e.target.value)} />
        </div>
      </div>
      <button type="submit" className="btn-primary self-start">+ Ajouter</button>
    </form>
  );
}

// ── Main Equipes screen ───────────────────────────────────────────────────────

export default function Equipes() {
  const { getActiveTournoi, updateTournoiParams, importEquipes, removeEquipe, startTournoi, openKiosk, setScreen, kioskOpen, closeKiosk } = useTournamentStore();
  const tournoi = getActiveTournoi();

  const [sheetText, setSheetText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [startError, setStartError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!tournoi) return null;

  const handleImport = () => {
    if (!sheetText.trim()) return;
    const { equipes, added, skipped } = importFromSheet(sheetText, tournoi);
    importEquipes(tournoi.id, equipes);
    setImportResult({ added, skipped });
    setSheetText('');
  };

  const handleUrlChange = (url) => {
    updateTournoiParams(tournoi.id, { googleFormUrl: url });
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(tournoi.googleFormUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = () => {
    setStartError('');
    const result = startTournoi(tournoi.id);
    if (result.error) {
      setStartError(result.error);
      return;
    }
    setScreen('tour');
  };

  const qrValue = tournoi.googleFormUrl || 'https://forms.google.com';
  const canStart = tournoi.equipes.length >= 2 && !tournoi.started;

  return (
    <>
      {kioskOpen && <KioskMode tournoi={tournoi} onClose={closeKiosk} />}

      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-600">
            Inscription — {tournoi.nom}
          </h2>
          <span className="text-sm text-gray-500">
            {tournoi.equipes.length}/{tournoi.eqMax} équipes
          </span>
        </div>

        {/* QR Code section */}
        <div className="card">
          <h3 className="font-semibold text-navy-600 mb-3">QR Code & Inscription autonome</h3>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div style={{ background: '#FFFFFF', padding: 12, display: 'inline-block', borderRadius: 8 }}>
                <QRCode value={qrValue} size={160} level="M" />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-3 w-full">
              <div>
                <label className="label">URL de votre Google Form</label>
                <input
                  className="input-field"
                  placeholder="https://docs.google.com/forms/..."
                  value={tournoi.googleFormUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
                {tournoi.googleFormUrl && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500 truncate flex-1">{tournoi.googleFormUrl}</span>
                    <button
                      className="text-xs text-navy-600 border border-navy-200 px-2 py-1 rounded hover:bg-navy-50"
                      onClick={handleCopyLink}
                    >
                      {copied ? '✓ Copié' : 'Copier le lien'}
                    </button>
                  </div>
                )}
              </div>
              <button
                className="btn-primary"
                onClick={openKiosk}
              >
                📟 Ouvrir la borne d'inscription
              </button>
            </div>
          </div>
        </div>

        {/* Import from Sheets */}
        <div className="card">
          <h3 className="font-semibold text-navy-600 mb-3">Import depuis Google Sheets</h3>
          <p className="text-sm text-gray-500 mb-3">
            Copiez-collez les données depuis Google Sheets (colonnes : Nom équipe | Joueur 1 | Joueur 2 | Emplacement)
          </p>
          <textarea
            className="input-field min-h-[100px] font-mono text-sm"
            placeholder="Les Cigales&#9;Jean Dupont&#9;Marie Martin&#9;n°42&#10;Les Boules d'Or&#9;Pierre Martin&#9;&#9;n°15"
            value={sheetText}
            onChange={(e) => setSheetText(e.target.value)}
          />
          {importResult && (
            <div className="text-sm mt-2 text-green-700 bg-green-50 px-3 py-2 rounded">
              ✓ {importResult.added} équipe{importResult.added !== 1 ? 's' : ''} importée{importResult.added !== 1 ? 's' : ''}
              {importResult.skipped > 0 && `, ${importResult.skipped} ignorée${importResult.skipped !== 1 ? 's' : ''}`}
            </div>
          )}
          <button
            className="btn-secondary mt-3"
            onClick={handleImport}
            disabled={!sheetText.trim()}
          >
            Importer
          </button>
        </div>

        {/* Manual add */}
        {!tournoi.started && (
          <div className="card">
            <details>
              <summary className="font-semibold text-navy-600 cursor-pointer select-none">
                ➕ Ajout manuel d'une équipe
              </summary>
              <div className="mt-4">
                <ManualAddForm tournoi={tournoi} />
              </div>
            </details>
          </div>
        )}

        {/* Teams list */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-navy-600">
              Équipes inscrites
              <span className="ml-2 bg-navy-50 text-navy-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {tournoi.equipes.length}
              </span>
            </h3>
            {!tournoi.started && (
              <div className="flex gap-2 items-center">
                {startError && <span className="text-red-600 text-sm">{startError}</span>}
                <button
                  className="btn-primary disabled:opacity-50"
                  onClick={handleStart}
                  disabled={!canStart}
                >
                  🚀 Lancer le tournoi
                </button>
              </div>
            )}
          </div>

          {tournoi.equipes.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-4">
              Aucune équipe inscrite
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {tournoi.equipes.map((eq) => (
                <div
                  key={eq.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${eq.forfait ? 'bg-red-50 opacity-60' : 'bg-gray-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold ${eq.forfait ? 'line-through text-red-500' : 'text-gray-800'}`}>
                      {eq.nom}
                    </span>
                    {eq.forfait && <span className="ml-2 text-xs text-red-500">Forfait</span>}
                    <div className="text-gray-500 text-xs mt-0.5">
                      {eq.j1}{eq.j2 ? ` & ${eq.j2}` : ''}{eq.empl ? ` — ${eq.empl}` : ''}
                    </div>
                  </div>
                  {!tournoi.started && (
                    <button
                      className="text-red-500 hover:text-red-700 text-sm shrink-0"
                      onClick={() => removeEquipe(tournoi.id, eq.id)}
                    >
                      Retirer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
