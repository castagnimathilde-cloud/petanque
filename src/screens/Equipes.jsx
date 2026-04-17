import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useTournamentStore } from '../store/useTournamentStore';
import { UNLIMITED_EQ_MAX } from '../utils/storage';

function playerFields(joueursParEq) {
  return Array.from({ length: joueursParEq }, (_, i) => i + 1);
}

// ── QR Zoom modal ──────────────────────────────────────────────────────────────

function QRZoomModal({ url, tournoi, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-navy-600 font-black text-lg text-center">{tournoi.nom}</p>
        <div className="bg-white border-4 border-navy-100 rounded-2xl p-4">
          <QRCode value={url} size={240} level="H" />
        </div>
        <p className="text-gray-500 text-sm text-center">Scannez avec l'appareil photo</p>
        <button
          className="btn-secondary w-full text-center"
          onClick={onClose}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ── Share sheet ────────────────────────────────────────────────────────────────

function ShareSheet({ url, tournoi, onClose }) {
  const [copied, setCopied] = useState(false);
  const msg = `Inscris ton équipe au tournoi "${tournoi.nom}" 🎯\n${url}`;

  const copy = async () => {
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const actions = [
    {
      label: copied ? '✓ Lien copié !' : 'Copier le lien',
      icon: copied ? '✓' : '📋',
      color: copied ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      onClick: copy,
    },
    {
      label: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100',
      href: `https://wa.me/?text=${encodeURIComponent(msg)}`,
    },
    {
      label: 'E-mail',
      icon: '✉️',
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      href: `mailto:?subject=${encodeURIComponent(`Inscription – ${tournoi.nom}`)}&body=${encodeURIComponent(msg)}`,
    },
    {
      label: 'SMS',
      icon: '📱',
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      href: `sms:?body=${encodeURIComponent(msg)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-black text-gray-800">Envoyer le lien d'inscription</h3>
          <p className="text-gray-400 text-sm mt-0.5">{tournoi.nom}</p>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {actions.map((a) =>
            a.href ? (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border font-bold text-sm transition-colors ${a.color}`}
                onClick={onClose}
              >
                <span className="text-xl w-7 text-center">{a.icon}</span>
                {a.label}
              </a>
            ) : (
              <button
                key={a.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border font-bold text-sm transition-colors ${a.color}`}
                onClick={a.onClick}
              >
                <span className="text-xl w-7 text-center">{a.icon}</span>
                {a.label}
              </button>
            )
          )}
        </div>
        <div className="px-4 pb-4">
          <button className="w-full py-3 rounded-2xl text-gray-400 text-sm font-bold hover:bg-gray-50 transition-colors" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Kiosk / Projection screen ─────────────────────────────────────────────────

function KioskMode({ tournoi, onClose }) {
  const { addEquipe } = useTournamentStore();
  const [form, setForm] = useState({ nom: '', j1: '', j2: '', j3: '' });
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
    setForm({ nom: '', j1: '', j2: '', j3: '' });
    setTimeout(() => { setSuccess(''); nomRef.current?.focus(); }, 3000);
  };

  const qrUrl = `${window.location.origin}/?register=${tournoi.id}`;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-navy-800 to-blue-900 flex flex-col overflow-auto">
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
        <div className="lg:w-72 flex flex-col gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center border border-white/20">
            <p className="text-white font-bold mb-4 text-lg">📱 Inscription sur votre téléphone</p>
            <div className="bg-white rounded-2xl p-4 inline-block shadow-xl">
              <QRCode value={qrUrl} size={180} level="M" />
            </div>
            <p className="text-blue-200 text-xs mt-3">Scannez avec votre appareil photo</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20 flex-1">
            <h3 className="text-white font-bold mb-3">
              Inscrits ({tournoi.equipes.length}/{tournoi.eqMax >= UNLIMITED_EQ_MAX ? '∞' : tournoi.eqMax})
            </h3>
            <div className="overflow-y-auto max-h-64 flex flex-col gap-2">
              {tournoi.equipes.length === 0 && (
                <p className="text-white/40 text-sm italic">Aucune équipe pour l'instant</p>
              )}
              {tournoi.equipes.map((eq, i) => (
                <div key={eq.id} className="bg-white/20 rounded-xl px-3 py-2">
                  <span className="text-white font-bold text-sm">{i + 1}. {eq.nom}</span>
                  <div className="text-white/60 text-xs">{eq.j1}{eq.j2 ? ` · ${eq.j2}` : ''}{eq.j3 ? ` · ${eq.j3}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
  const [form, setForm] = useState({ nom: '', j1: '', j2: '', j3: '' });
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
    setForm({ nom: '', j1: '', j2: '', j3: '' });
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
      </div>
      <button type="submit" className="btn-primary self-start">+ Ajouter l'équipe</button>
    </form>
  );
}

// ── Main Equipes screen ───────────────────────────────────────────────────────

export default function Equipes() {
  const { getActiveTournoi, importEquipes, removeEquipe, startTournoi, openKiosk, setScreen, kioskOpen, closeKiosk, setForfait } = useTournamentStore();
  const tournoi = getActiveTournoi();

  const [startError, setStartError] = useState('');
  const [pendingRegs, setPendingRegs] = useState([]);
  const [selectedRegs, setSelectedRegs] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown');
  const [qrZoomed, setQrZoomed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const lastTsRef = useRef(0);

  const qrUrl = tournoi ? `${window.location.origin}/?register=${tournoi.id}` : '';

  useEffect(() => {
    if (!tournoi || tournoi.started) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(`/api/tournoi/${tournoi.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        nom: tournoi.nom,
        joueursParEq: tournoi.joueursParEq,
        eqMax: tournoi.eqMax,
        scoreCible: tournoi.scoreCible,
      }),
    })
      .then(async (r) => {
        clearTimeout(timeout);
        if (r.ok) {
          setApiStatus('ok');
        } else {
          const data = await r.json().catch(() => ({}));
          setApiStatus('error:' + (data.error || `HTTP ${r.status}`));
        }
      })
      .catch((e) => {
        clearTimeout(timeout);
        setApiStatus('error:' + (e.name === 'AbortError' ? 'Délai dépassé (8s)' : e.message));
      });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [tournoi?.id, tournoi?.started]);

  useEffect(() => {
    if (!tournoi || tournoi.started) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/registrations/${tournoi.id}?since=${lastTsRef.current}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setPendingRegs((prev) => {
              const existingIds = new Set(prev.map((r) => r._id));
              const newOnes = data.filter((r) => !existingIds.has(r._id));
              return [...prev, ...newOnes];
            });
            lastTsRef.current = Math.max(...data.map((r) => r._ts));
          } else {
            lastTsRef.current = Date.now();
          }
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [tournoi?.id, tournoi?.started]);

  if (!tournoi) return null;

  const handleImportRegs = async (regsToImport) => {
    if (regsToImport.length === 0) return;
    setImporting(true);
    let added = 0, skipped = 0;
    const newEquipes = [...tournoi.equipes];
    const ids = [];
    const isUnlimited = tournoi.eqMax >= UNLIMITED_EQ_MAX;

    for (const reg of regsToImport) {
      ids.push(reg._id);
      if (!isUnlimited && newEquipes.length >= tournoi.eqMax) { skipped++; continue; }
      if (newEquipes.find((e) => e.nom.toLowerCase() === reg.nom.toLowerCase())) { skipped++; continue; }
      newEquipes.push({
        id: Date.now() + Math.random(),
        nom: reg.nom, j1: reg.j1, j2: reg.j2 || '', j3: reg.j3 || '',
        v: 0, d: 0, pts: 0, ptsCont: 0, matchsJoues: 0, adversaires: [], byeRecu: false, forfait: false,
      });
      added++;
    }
    importEquipes(tournoi.id, newEquipes);
    await fetch(`/api/registrations/${tournoi.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }).catch(() => {});
    setPendingRegs((prev) => prev.filter((r) => !ids.includes(r._id)));
    setSelectedRegs(new Set());
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

  const canStart = tournoi.equipes.length >= tournoi.eqMin && !tournoi.started;
  const eqMaxLabel = tournoi.eqMax >= UNLIMITED_EQ_MAX ? '∞' : tournoi.eqMax;

  return (
    <>
      {kioskOpen && <KioskMode tournoi={tournoi} onClose={closeKiosk} />}
      {qrZoomed && <QRZoomModal url={qrUrl} tournoi={tournoi} onClose={() => setQrZoomed(false)} />}
      {shareOpen && <ShareSheet url={qrUrl} tournoi={tournoi} onClose={() => setShareOpen(false)} />}

      <div className={`max-w-3xl mx-auto p-4 flex flex-col gap-4 ${canStart ? 'pb-28' : ''}`}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-navy-600">Inscription des équipes</h2>
            <p className="text-gray-500 text-sm">{tournoi.nom}</p>
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${tournoi.equipes.length >= tournoi.eqMin ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {tournoi.equipes.length} / {eqMaxLabel}
          </span>
        </div>

        {/* QR Code card */}
        <div className="card bg-gradient-to-br from-navy-600 to-blue-700 border-0 text-white">
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* QR — clickable zoom */}
            <button
              className="flex-shrink-0 group relative focus:outline-none"
              onClick={() => setQrZoomed(true)}
              title="Agrandir le QR code"
            >
              <div className="bg-white rounded-2xl p-3 shadow-xl transition-transform group-hover:scale-105 group-active:scale-95">
                <QRCode value={qrUrl} size={130} level="M" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-lg">🔍 Agrandir</span>
              </div>
            </button>

            {/* Info + actions */}
            <div className="flex-1 flex flex-col gap-3 w-full">
              <div>
                <h3 className="font-black text-lg leading-tight">📱 Inscription par QR Code</h3>
                <p className="text-blue-200 text-sm mt-1">
                  Les participants scannent et s'inscrivent depuis leur téléphone.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="flex items-center gap-2 bg-white text-navy-600 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-sm"
                  onClick={openKiosk}
                >
                  📟 Borne plein écran
                </button>
                <button
                  className="flex items-center gap-2 bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-white/30 transition-colors border border-white/30"
                  onClick={() => setShareOpen(true)}
                >
                  ↗ Envoyer le lien
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API error */}
        {apiStatus.startsWith('error') && !tournoi.started && (
          <div className="card border-2 border-amber-300 bg-amber-50">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-800">QR code non fonctionnel en production</h3>
                <p className="text-amber-700 text-sm mt-1">
                  L'API serveur ne répond pas — les participants ne peuvent pas s'inscrire via QR code sur Vercel.
                </p>
                {apiStatus.length > 6 && (
                  <p className="text-amber-800 text-xs mt-2 font-mono bg-amber-100 rounded-lg px-2 py-1">
                    {apiStatus.replace('error:', '')}
                  </p>
                )}
                <p className="text-amber-600 text-xs mt-2">
                  Vérifiez que <code className="font-mono bg-amber-100 px-1 rounded">REDIS_URL</code> est configuré dans Vercel → Settings → Environment Variables.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pending registrations */}
        {pendingRegs.length > 0 && (
          <div className="card border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-blue-800">
                  📲 {pendingRegs.length} inscription{pendingRegs.length > 1 ? 's' : ''} en attente
                </h3>
                <p className="text-blue-500 text-xs mt-0.5">Reçues depuis les téléphones</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedRegs.size > 0 && (
                  <button
                    className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    onClick={() => handleImportRegs(pendingRegs.filter((r) => selectedRegs.has(r._id)))}
                    disabled={importing}
                  >
                    ✓ Valider la sélection ({selectedRegs.size})
                  </button>
                )}
                <button
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  onClick={() => handleImportRegs(pendingRegs)}
                  disabled={importing}
                >
                  {importing ? 'Import...' : '✓ Valider tout'}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {pendingRegs.map((r) => {
                const checked = selectedRegs.has(r._id);
                return (
                  <label
                    key={r._id}
                    className={`bg-white rounded-xl px-3 py-2.5 text-sm flex items-center gap-3 cursor-pointer transition-colors ${checked ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-white/80'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setSelectedRegs((prev) => {
                        const next = new Set(prev);
                        if (next.has(r._id)) next.delete(r._id); else next.add(r._id);
                        return next;
                      })}
                      className="w-4 h-4 accent-blue-600 shrink-0"
                    />
                    <span className="font-bold text-gray-800 flex-1">{r.nom}</span>
                    <span className="text-gray-400 text-xs">{r.j1}{r.j2 ? ` · ${r.j2}` : ''}{r.j3 ? ` · ${r.j3}` : ''}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {importMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm font-medium">
            {importMsg}
          </div>
        )}

        {/* Manual add */}
        {!tournoi.started && (
          <div className="card">
            <details>
              <summary className="font-bold text-navy-600 cursor-pointer select-none">
                ➕ Ajouter une équipe manuellement
              </summary>
              <ManualAddForm tournoi={tournoi} />
            </details>
          </div>
        )}

        {/* Teams list */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy-600 flex items-center gap-2">
              Équipes inscrites
              <span className="bg-navy-50 text-navy-600 text-xs font-black px-2 py-0.5 rounded-full border border-navy-100">
                {tournoi.equipes.length}
              </span>
            </h3>
            {!tournoi.started && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {startError && <span className="text-red-600 text-sm font-medium">{startError}</span>}
                <button
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
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
            <div className="text-center py-10">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-gray-500 font-medium">Aucune équipe inscrite</p>
              <p className="text-gray-400 text-sm mt-1">Partagez le QR code ou ajoutez manuellement</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tournoi.equipes.map((eq, i) => (
                <div
                  key={eq.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${eq.forfait ? 'bg-red-50 opacity-60' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <span className="text-gray-300 font-bold text-sm w-6 text-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`font-bold ${eq.forfait ? 'line-through text-red-400' : 'text-gray-800'}`}>
                      {eq.nom}
                    </span>
                    {eq.forfait && <span className="ml-2 text-xs text-red-400 font-semibold">Forfait</span>}
                    <div className="text-gray-400 text-xs mt-0.5">
                      {eq.j1}{eq.j2 ? ` · ${eq.j2}` : ''}{eq.j3 ? ` · ${eq.j3}` : ''}
                    </div>
                  </div>
                  {!tournoi.started ? (
                    <button
                      className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      onClick={() => removeEquipe(tournoi.id, eq.id)}
                    >
                      Retirer
                    </button>
                  ) : !tournoi.finished ? (
                    <button
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 ${eq.forfait ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                      onClick={() => setForfait(tournoi.id, eq.id, !eq.forfait)}
                    >
                      {eq.forfait ? '↩ Réintégrer' : '🚫 Forfait'}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {!tournoi.started && tournoi.equipes.length < tournoi.eqMin && (
            <p className="text-center text-orange-500 text-xs mt-4 font-medium">
              ⚠️ Minimum {tournoi.eqMin} équipes pour lancer
              {' '}({tournoi.eqMin - tournoi.equipes.length} manquante{tournoi.eqMin - tournoi.equipes.length > 1 ? 's' : ''})
            </p>
          )}
        </div>
      </div>

      {/* Sticky launch CTA */}
      {canStart && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl p-4 animate-slide-up">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-navy-600">{tournoi.equipes.length} équipes prêtes 🎯</p>
              <p className="text-gray-400 text-xs">Tout est bon pour lancer !</p>
            </div>
            <div className="flex items-center gap-3">
              {startError && <span className="text-red-600 text-sm font-medium">{startError}</span>}
              <button className="btn-primary px-6 text-base active:scale-95" onClick={handleStart}>
                🚀 Lancer le tournoi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
