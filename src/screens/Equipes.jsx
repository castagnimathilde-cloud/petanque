import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useTournamentStore } from '../store/useTournamentStore';
import { importFromSheet } from '../utils/matchmaking';

// ── Helpers ───────────────────────────────────────────────────────────────────

function playerFields(joueursParEq) {
  return Array.from({ length: joueursParEq }, (_, i) => i + 1);
}

// ── Kiosk / Projection screen ─────────────────────────────────────────────────

function KioskMode({ tournoi, onClose }) {
  const { addEquipe } = useTournamentStore();
  const [form, setForm] = useState({ nom: '', j1: '', j2: '', j3: '', empl: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nomRef = useRef();

  useEffect(() => { nomRef.current?.focus(); }, []);

  const nb = tournoi.joueursParEq || 2;
  const setField = (f, v) => setForm((s) => ({ ...s, [f]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.nom.trim()) { setError("Le nom de l'équipe est obligatoire"); return; }
    if (!form.j1.trim()) { setError('Le joueur 1 est obligatoire'); return; }
    if (nb >= 2 && !form.j2.trim()) { setError('Le joueur 2 est obligatoire'); return; }
    if (nb >= 3 && !form.j3.trim()) { setError('Le joueur 3 est obligatoire'); return; }

    const result = addEquipe(tournoi.id, form);
    if (result.error) { setError(result.error); return; }
    setSuccess(`✅ Équipe "${form.nom}" inscrite !`);
    setForm({ nom: '', j1: '', j2: '', j3: '', empl: '' });
    setTimeout(() => { setSuccess(''); nomRef.current?.focus(); }, 3000);
  };

  const qrUrl = `${window.location.origin}/?register=${tournoi.id}`;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-navy-800 to-blue-900 flex flex-col overflow-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <div>
            <h1 className="text-white text-xl font-black">{tournoi.nom}</h1>
            <p className="text-blue-300 text-xs">Borne d'inscription</p>
          </div>
        </div>
        <button
          className="text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/30"
          onClick={onClose}
        >
          ✕ Fermer la borne
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-6xl mx-auto w-full">
        {/* QR Code side */}
        <div className="lg:w-72 flex flex-col gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center border border-white/20">
            <p className="text-white font-bold mb-4 text-lg">📱 Inscription sur votre téléphone</p>
            <div className="bg-white rounded-2xl p-4 inline-block shadow-xl">
              <QRCode value={qrUrl} size={180} level="M" />
            </div>
            <p className="text-blue-200 text-xs mt-3">Scannez avec votre appareil photo</p>
            <p className="text-white/40 text-xs mt-1 break-all">{qrUrl}</p>
          </div>

          {/* Teams list */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20 flex-1">
            <h3 className="text-white font-bold mb-3">
              Inscrits ({tournoi.equipes.length}/{tournoi.eqMax})
            </h3>
            <div className="overflow-y-auto max-h-64 flex flex-col gap-2">
              {tournoi.equipes.length === 0 && (
                <p className="text-white/40 text-sm italic">Aucune équipe pour l'instant</p>
              )}
              {tournoi.equipes.map((eq, i) => (
                <div key={eq.id} className="bg-white/20 rounded-xl px-3 py-2">
                  <span className="text-white font-bold text-sm">{i + 1}. {eq.nom}</span>
                  <div className="text-white/60 text-xs">{eq.j1}{eq.j2 ? ` & ${eq.j2}` : ''}{eq.j3 ? ` & ${eq.j3}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration form */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-navy-600 mb-6">Inscrire mon équipe ici</h2>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4 font-medium">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-2 border-green-300 text-green-700 px-4 py-4 rounded-2xl mb-4 font-bold text-lg text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🏅 Nom de l'équipe *</label>
                <input
                  ref={nomRef}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-navy-600 transition-colors"
                  placeholder="Ex : Les Cigales"
                  value={form.nom}
                  onChange={(e) => setField('nom', e.target.value)}
                />
              </div>
              {playerFields(nb).map((n) => (
                <div key={n}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">👤 Joueur {n} *</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-navy-600 transition-colors"
                    placeholder="Prénom Nom"
                    value={form[`j${n}`]}
                    onChange={(e) => setField(`j${n}`, e.target.value)}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🏕️ Emplacement camping</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-navy-600 transition-colors"
                  placeholder="n°42 (optionnel)"
                  value={form.empl}
                  onChange={(e) => setField('empl', e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-navy-600 to-blue-700 text-white py-4 rounded-2xl text-xl font-black hover:from-navy-700 hover:to-blue-800 transition-all shadow-lg mt-2"
              >
                S'inscrire →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Manual add form ───────────────────────────────────────────────────────────

function ManualAddForm({ tournoi }) {
  const { addEquipe } = useTournamentStore();
  const nb = tournoi.joueursParEq || 2;
  const [form, setForm] = useState({ nom: '', j1: '', j2: '', j3: '', empl: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const setField = (f, v) => setForm((s) => ({ ...s, [f]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.nom.trim()) { setError("Nom obligatoire"); return; }
    if (!form.j1.trim()) { setError("Joueur 1 obligatoire"); return; }
    if (nb >= 2 && !form.j2.trim()) { setError("Joueur 2 obligatoire"); return; }
    if (nb >= 3 && !form.j3.trim()) { setError("Joueur 3 obligatoire"); return; }
    const result = addEquipe(tournoi.id, form);
    if (result.error) { setError(result.error); return; }
    setSuccess(`Équipe "${form.nom}" ajoutée`);
    setForm({ nom: '', j1: '', j2: '', j3: '', empl: '' });
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
      {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-xl border border-red-200">{error}</div>}
      {success && <div className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-xl border border-green-200">{success}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Nom équipe *</label>
          <input className="input-field" placeholder="Les Cigales" value={form.nom} onChange={(e) => setField('nom', e.target.value)} />
        </div>
        {playerFields(nb).map((n) => (
          <div key={n}>
            <label className="label">Joueur {n} *</label>
            <input className="input-field" placeholder="Prénom Nom" value={form[`j${n}`]} onChange={(e) => setField(`j${n}`, e.target.value)} />
          </div>
        ))}
        <div>
          <label className="label">Emplacement</label>
          <input className="input-field" placeholder="n°42" value={form.empl} onChange={(e) => setField('empl', e.target.value)} />
        </div>
      </div>
      <button type="submit" className="btn-primary self-start">+ Ajouter l'équipe</button>
    </form>
  );
}

// ── Main Equipes screen ───────────────────────────────────────────────────────

export default function Equipes() {
  const { getActiveTournoi, importEquipes, removeEquipe, startTournoi, openKiosk, setScreen, kioskOpen, closeKiosk } = useTournamentStore();
  const tournoi = getActiveTournoi();

  const [startError, setStartError] = useState('');
  const [pendingRegs, setPendingRegs] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const lastTsRef = useRef(0);

  const qrUrl = tournoi ? `${window.location.origin}/?register=${tournoi.id}` : '';

  // Push tournoi info to server so InscriptionPage can fetch it
  useEffect(() => {
    if (!tournoi || tournoi.started) return;
    fetch(`/api/tournoi/${tournoi.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: tournoi.nom,
        joueursParEq: tournoi.joueursParEq,
        eqMax: tournoi.eqMax,
        scoreCible: tournoi.scoreCible,
      }),
    }).catch(() => {});
  }, [tournoi?.id, tournoi?.started]);

  // Poll for new registrations from participants' phones
  useEffect(() => {
    if (!tournoi || tournoi.started) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/registrations/${tournoi.id}?since=${lastTsRef.current}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPendingRegs((prev) => {
            const existingIds = new Set(prev.map((r) => r._id));
            const newOnes = data.filter((r) => !existingIds.has(r._id));
            return [...prev, ...newOnes];
          });
          lastTsRef.current = Math.max(...data.map((r) => r._ts));
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [tournoi?.id, tournoi?.started]);

  if (!tournoi) return null;

  const handleImportPending = async () => {
    if (pendingRegs.length === 0) return;
    setImporting(true);
    let added = 0, skipped = 0;
    const newEquipes = [...tournoi.equipes];
    const ids = [];

    for (const reg of pendingRegs) {
      ids.push(reg._id);
      if (newEquipes.length >= tournoi.eqMax) { skipped++; continue; }
      if (newEquipes.find((e) => e.nom.toLowerCase() === reg.nom.toLowerCase())) { skipped++; continue; }
      newEquipes.push({
        id: Date.now() + Math.random(),
        nom: reg.nom, j1: reg.j1, j2: reg.j2 || '', j3: reg.j3 || '', empl: reg.empl || '',
        v: 0, d: 0, pts: 0, ptsCont: 0, matchsJoues: 0, adversaires: [], byeRecu: false, forfait: false,
      });
      added++;
    }
    importEquipes(tournoi.id, newEquipes);
    await fetch('/api/registrations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }).catch(() => {});
    setPendingRegs([]);
    setImportMsg(`✓ ${added} équipe${added !== 1 ? 's' : ''} importée${added !== 1 ? 's' : ''}${skipped > 0 ? `, ${skipped} ignorée${skipped !== 1 ? 's' : ''}` : ''}`);
    setTimeout(() => setImportMsg(''), 4000);
    setImporting(false);
  };

  const handleStart = () => {
    setStartError('');
    const result = startTournoi(tournoi.id);
    if (result.error) { setStartError(result.error); return; }
    setScreen('tour');
  };

  const canStart = tournoi.equipes.length >= 2 && !tournoi.started;

  return (
    <>
      {kioskOpen && <KioskMode tournoi={tournoi} onClose={closeKiosk} />}

      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-navy-600">Inscription des équipes</h2>
            <p className="text-gray-500 text-sm">{tournoi.nom}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${tournoi.equipes.length >= tournoi.eqMin ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {tournoi.equipes.length}/{tournoi.eqMax} équipes
            </span>
          </div>
        </div>

        {/* QR Code card — hero section */}
        <div className="card bg-gradient-to-br from-navy-600 to-blue-700 border-0 text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* QR */}
            <div className="flex-shrink-0 text-center">
              <div className="bg-white rounded-2xl p-3 inline-block shadow-xl">
                <QRCode value={qrUrl} size={150} level="M" />
              </div>
              <p className="text-blue-200 text-xs mt-2">Scannez pour s'inscrire</p>
            </div>
            {/* Info */}
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <h3 className="font-black text-lg">📱 Inscription par QR Code</h3>
                <p className="text-blue-200 text-sm mt-1">
                  Projetez cet écran ou ouvrez la borne. Les participants scannent le QR code et s'inscrivent directement depuis leur téléphone.
                </p>
              </div>
              <div className="bg-white/10 rounded-xl px-3 py-2 text-xs text-blue-200 font-mono break-all">
                {qrUrl}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-white text-navy-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors"
                  onClick={openKiosk}
                >
                  📟 Ouvrir la borne plein écran
                </button>
                <button
                  className="bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-white/30 transition-colors border border-white/30"
                  onClick={() => navigator.clipboard?.writeText(qrUrl)}
                >
                  Copier le lien
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pending registrations from phones */}
        {pendingRegs.length > 0 && (
          <div className="card border-2 border-blue-300 bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-blue-800">
                  📲 {pendingRegs.length} inscription{pendingRegs.length > 1 ? 's' : ''} en attente
                </h3>
                <p className="text-blue-600 text-xs mt-0.5">Reçues depuis les téléphones des participants</p>
              </div>
              <button
                className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleImportPending}
                disabled={importing}
              >
                {importing ? 'Import...' : '✓ Valider tout'}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {pendingRegs.map((r) => (
                <div key={r._id} className="bg-white rounded-xl px-3 py-2 text-sm flex items-center gap-2">
                  <span className="font-bold text-gray-800">{r.nom}</span>
                  <span className="text-gray-400">—</span>
                  <span className="text-gray-600">{r.j1}{r.j2 ? `, ${r.j2}` : ''}{r.j3 ? `, ${r.j3}` : ''}</span>
                  {r.empl && <span className="text-gray-400 text-xs ml-auto">{r.empl}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {importMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
            {importMsg}
          </div>
        )}

        {/* Manual add */}
        {!tournoi.started && (
          <div className="card">
            <details>
              <summary className="font-bold text-navy-600 cursor-pointer select-none flex items-center gap-2">
                <span>➕ Ajouter une équipe manuellement</span>
              </summary>
              <ManualAddForm tournoi={tournoi} />
            </details>
          </div>
        )}

        {/* Teams list */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy-600">
              Équipes inscrites
              <span className="ml-2 bg-navy-50 text-navy-600 text-xs font-black px-2 py-0.5 rounded-full border border-navy-100">
                {tournoi.equipes.length}
              </span>
            </h3>
            {!tournoi.started && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {startError && <span className="text-red-600 text-sm">{startError}</span>}
                <button
                  className="btn-primary disabled:opacity-40"
                  onClick={handleStart}
                  disabled={!canStart}
                  title={!canStart ? `Minimum ${tournoi.eqMin} équipes requis` : ''}
                >
                  🚀 Lancer le tournoi
                </button>
              </div>
            )}
          </div>

          {tournoi.equipes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-400 text-sm">Aucune équipe inscrite</p>
              <p className="text-gray-300 text-xs mt-1">Utilisez le QR code ou ajoutez manuellement</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tournoi.equipes.map((eq, i) => (
                <div
                  key={eq.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${eq.forfait ? 'bg-red-50 opacity-60' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                >
                  <span className="text-gray-400 font-bold text-sm w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`font-bold ${eq.forfait ? 'line-through text-red-400' : 'text-gray-800'}`}>
                      {eq.nom}
                    </span>
                    {eq.forfait && <span className="ml-2 text-xs text-red-400 font-semibold">Forfait</span>}
                    <div className="text-gray-500 text-xs mt-0.5">
                      👤 {eq.j1}{eq.j2 ? ` · ${eq.j2}` : ''}{eq.j3 ? ` · ${eq.j3}` : ''}
                      {eq.empl && <span className="ml-2">🏕️ {eq.empl}</span>}
                    </div>
                  </div>
                  {!tournoi.started && (
                    <button
                      className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      onClick={() => removeEquipe(tournoi.id, eq.id)}
                    >
                      Retirer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!tournoi.started && tournoi.equipes.length < tournoi.eqMin && (
            <p className="text-center text-orange-500 text-xs mt-3 font-medium">
              ⚠️ Minimum {tournoi.eqMin} équipes pour lancer ({tournoi.eqMin - tournoi.equipes.length} manquante{tournoi.eqMin - tournoi.equipes.length > 1 ? 's' : ''})
            </p>
          )}
        </div>
      </div>
    </>
  );
}
