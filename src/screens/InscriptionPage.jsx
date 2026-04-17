import { useState, useEffect } from 'react';
import { UNLIMITED_EQ_MAX } from '../utils/storage';

const TIPS = [
  "Gardez vos boules fraîches à l'ombre ☀️",
  "Le pointeur vise, le tireur élimine 🎯",
  "On dit « cochonnet », pas « but » ! 🐷",
  "La pétanque se joue autant dans la tête que dans les bras 🧠",
  "Bonne chance — et que le meilleur gagne ! 🏆",
];

function BouncingDots() {
  return (
    <div className="flex gap-2.5 justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full bg-white animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  );
}

export default function InscriptionPage({ tournoiId }) {
  const [tournoi, setTournoi]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [form, setForm]             = useState({ nom: '', j1: '', j2: '', j3: '' });
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch(`/api/tournoi/${tournoiId}`, { signal: controller.signal })
      .then(async (r) => {
        clearTimeout(timeout);
        const data = await r.json();
        if (!r.ok || data.error) setError(data.error || `Erreur serveur (${r.status})`);
        else setTournoi(data);
        setLoading(false);
      })
      .catch((e) => {
        clearTimeout(timeout);
        setError(e.name === 'AbortError'
          ? 'Le serveur met trop de temps à répondre. Vérifiez votre connexion.'
          : 'Impossible de joindre le serveur. Vérifiez votre connexion internet.');
        setLoading(false);
      });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [tournoiId]);

  const setField = (f, v) => setForm((s) => ({ ...s, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.nom.trim()) { setSubmitError("Le nom de l'équipe est obligatoire"); return; }
    if (!form.j1.trim())  { setSubmitError("Le joueur 1 est obligatoire"); return; }
    if (tournoi.joueursParEq >= 2 && !form.j2.trim()) { setSubmitError("Le joueur 2 est obligatoire"); return; }
    if (tournoi.joueursParEq >= 3 && !form.j3.trim()) { setSubmitError("Le joueur 3 est obligatoire"); return; }

    setSubmitting(true);
    try {
      const res  = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournoiId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) setSubmitError(data.error || "Erreur lors de l'inscription");
      else         setSubmitted(true);
    } catch {
      setSubmitError("Impossible de contacter le serveur. Vérifiez votre WiFi.");
    }
    setSubmitting(false);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-600 to-blue-800 flex flex-col items-center justify-center gap-6">
        <span className="text-6xl">🎯</span>
        <BouncingDots />
        <p className="text-white/60 text-sm">Chargement du tournoi…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    const isNotFound  = error.toLowerCase().includes('introuvable');
    const isConnError = error.toLowerCase().includes('connexion') || error.toLowerCase().includes('serveur');
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-600 to-blue-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-pop-in">
          <div className="text-5xl mb-4">{isNotFound ? '🔍' : '⚠️'}</div>
          <h2 className="text-xl font-black text-gray-800 mb-2">
            {isNotFound ? 'Tournoi introuvable' : 'Connexion impossible'}
          </h2>
          <p className="text-gray-500 text-sm">{error}</p>

          <div className="mt-4 bg-gray-50 rounded-2xl p-4 text-left text-xs text-gray-400 space-y-1">
            {isNotFound ? (
              <>
                <p>• L'organisateur doit ouvrir l'écran <strong>Équipes</strong> sur son appareil.</p>
                <p>• Vérifiez que vous utilisez le bon QR code.</p>
              </>
            ) : isConnError ? (
              <>
                <p>• Vérifiez votre connexion WiFi ou données mobiles.</p>
                <p>• L'organisateur doit configurer <code className="bg-gray-100 px-1 rounded">REDIS_URL</code> dans Vercel si vous êtes en production.</p>
              </>
            ) : (
              <p>• Vérifiez votre connexion internet et réessayez.</p>
            )}
          </div>

          <button
            className="mt-5 bg-navy-600 text-white font-bold px-6 py-3 rounded-2xl text-sm hover:bg-navy-700 transition-colors active:scale-95"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitted) {
    const nbJ = tournoi.joueursParEq || 2;
    const players = [form.j1, form.j2, form.j3].slice(0, nbJ).filter(Boolean);
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-pop-in">
          <div className="text-7xl mb-3">🎉</div>
          <h2 className="text-2xl font-black text-emerald-600 mb-1">Inscription envoyée !</h2>
          <p className="text-gray-500 text-sm mb-5">L'organisateur va valider votre inscription.</p>

          {/* Team recap */}
          <div className="bg-emerald-50 rounded-2xl p-4 mb-4 text-left">
            <p className="text-emerald-800 font-black text-base mb-2">🏅 {form.nom}</p>
            <div className="flex flex-col gap-1">
              {players.map((p, i) => (
                <p key={i} className="text-emerald-700 text-sm font-medium">
                  👤 Joueur {i + 1} : {p}
                </p>
              ))}
            </div>
            <p className="text-emerald-600 text-xs mt-2 font-medium">🎯 {tournoi.nom}</p>
          </div>

          {/* Next steps */}
          <div className="text-left text-xs text-gray-400 space-y-1.5 mb-5">
            <p className="flex items-start gap-2"><span className="text-emerald-400 font-black shrink-0">1.</span> Attendez la confirmation de l'organisateur.</p>
            <p className="flex items-start gap-2"><span className="text-emerald-400 font-black shrink-0">2.</span> Rendez-vous sur le terrain à l'heure prévue.</p>
            <p className="flex items-start gap-2"><span className="text-emerald-400 font-black shrink-0">3.</span> Préparez vos boules et bonne partie !</p>
          </div>

          <p className="text-gray-300 text-xs italic">💡 {tip}</p>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  const nbJoueurs   = tournoi.joueursParEq || 2;
  const formatLabel = nbJoueurs === 1 ? 'Tête-à-tête' : nbJoueurs === 2 ? 'Doublette' : 'Triplette';
  const eqLabel     = tournoi.eqMax >= UNLIMITED_EQ_MAX ? '∞' : tournoi.eqMax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-600 to-blue-800 flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-600 to-blue-700 px-6 py-6 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-white text-xl font-black leading-tight">{tournoi.nom}</h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{formatLabel}</span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">🎯 {tournoi.scoreCible} pts</span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">max {eqLabel}</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium animate-slide-up">
              ⚠️ {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-1.5">
                🏅 Nom de l'équipe <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white"
                placeholder="Ex : Les Cigales"
                value={form.nom}
                onChange={(e) => setField('nom', e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>

            {[1, 2, 3].slice(0, nbJoueurs).map((n) => (
              <div key={n}>
                <label className="block text-sm font-black text-gray-700 mb-1.5">
                  👤 Joueur {n} <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white"
                  placeholder={`Ex : ${['Jean Martin', 'Marie Dupont', 'Paul Durand'][n - 1]}`}
                  value={form[`j${n}`]}
                  onChange={(e) => setField(`j${n}`, e.target.value)}
                  autoComplete="off"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-navy-600 to-blue-700 text-white py-4 rounded-2xl text-lg font-black hover:from-navy-700 hover:to-blue-800 transition-all disabled:opacity-60 shadow-lg mt-1 active:scale-95"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Envoi en cours…
                </span>
              ) : "S'inscrire →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
