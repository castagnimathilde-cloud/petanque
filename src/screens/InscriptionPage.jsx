import { useState, useEffect } from 'react';

export default function InscriptionPage({ tournoiId }) {
  const [tournoi, setTournoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nom: '', j1: '', j2: '', j3: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch(`/api/tournoi/${tournoiId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.error) {
          setError(data.error || `Erreur serveur (${r.status})`);
        } else {
          setTournoi(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de joindre le serveur. Vérifiez votre connexion internet.");
        setLoading(false);
      });
  }, [tournoiId]);

  const setField = (f, v) => setForm((s) => ({ ...s, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.nom.trim()) { setSubmitError("Le nom de l'équipe est obligatoire"); return; }
    if (!form.j1.trim()) { setSubmitError("Le joueur 1 est obligatoire"); return; }
    if (tournoi.joueursParEq >= 2 && !form.j2.trim()) { setSubmitError("Le joueur 2 est obligatoire"); return; }
    if (tournoi.joueursParEq >= 3 && !form.j3.trim()) { setSubmitError("Le joueur 3 est obligatoire"); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournoiId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || "Erreur lors de l'inscription"); }
      else { setSubmitted(true); }
    } catch {
      setSubmitError("Impossible de contacter le serveur. Vérifiez votre WiFi.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (error) {
    const isNotFound = error.toLowerCase().includes('introuvable');
    const isApiConfig = error.toLowerCase().includes('configurée') || error.toLowerCase().includes('redis');
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-600 to-blue-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-5xl mb-4">{isNotFound ? '🔍' : '⚠️'}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {isNotFound ? 'Tournoi introuvable' : 'Connexion impossible'}
          </h2>
          <p className="text-gray-500 text-sm">{error}</p>
          {isApiConfig ? (
            <p className="text-gray-400 text-xs mt-4 bg-gray-50 rounded-xl p-3">
              L'organisateur doit configurer les variables Redis dans Vercel (UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN).
            </p>
          ) : isNotFound ? (
            <p className="text-gray-400 text-xs mt-4">
              L'organisateur doit ouvrir l'écran "Équipes" sur son appareil pour activer les inscriptions.
            </p>
          ) : (
            <p className="text-gray-400 text-xs mt-4">
              Vérifiez votre connexion internet et réessayez.
            </p>
          )}
          <button
            className="mt-5 text-sm text-blue-600 underline"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-green-600 mb-2">Inscription envoyée !</h2>
          <p className="text-gray-600 mb-1">
            L'équipe <span className="font-bold text-gray-800">"{form.nom}"</span> est en attente de validation.
          </p>
          <p className="text-gray-500 text-sm mt-3">L'organisateur va confirmer votre inscription.</p>
          <div className="mt-6 bg-green-50 rounded-2xl p-4">
            <p className="text-green-700 font-semibold text-sm">🎯 {tournoi.nom}</p>
          </div>
        </div>
      </div>
    );
  }

  const nbJoueurs = tournoi.joueursParEq || 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-600 to-blue-700 px-6 py-5 text-center">
          <div className="text-3xl mb-1">🎯</div>
          <h1 className="text-white text-xl font-black">{tournoi.nom}</h1>
          <p className="text-blue-200 text-sm mt-1">
            {nbJoueurs === 1 ? 'Tête-à-tête' : nbJoueurs === 2 ? 'Doublette' : 'Triplette'}
            {' · '}Inscription en ligne
          </p>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
              ⚠️ {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Team name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Nom de l'équipe <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base font-medium focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                placeholder="Ex : Les Cigales"
                value={form.nom}
                onChange={(e) => setField('nom', e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>

            {/* Players */}
            {[1, 2, 3].slice(0, nbJoueurs).map((n) => (
              <div key={n}>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Joueur {n} <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base font-medium focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                  placeholder="Prénom Nom"
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
              {submitting ? '⏳ Envoi en cours...' : "S'inscrire →"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-1">
            🎯 Score cible : {tournoi.scoreCible} pts · max {tournoi.eqMax >= 9999 ? '∞' : tournoi.eqMax} équipes
          </p>
        </div>
      </div>
    </div>
  );
}
