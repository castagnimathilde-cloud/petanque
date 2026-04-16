import { create } from 'zustand';
import { loadData, saveData, genId } from '../utils/storage';
import { generateRound, recalculateStandings } from '../utils/matchmaking';

const persist = (fn) => (...args) => {
  fn(...args);
};

function getInitialState() {
  const data = loadData();
  return {
    tournois: data.tournois || [],
    activeTournoiId: null,
    activeScreen: 'dashboard', // dashboard | equipes | tour | classement | resultats
    kioskOpen: false,
  };
}

export const useTournamentStore = create((set, get) => ({
  ...getInitialState(),

  // ── Helpers ──────────────────────────────────────────────────────────────

  _save() {
    saveData({ tournois: get().tournois });
  },

  getTournoi(id) {
    return get().tournois.find((t) => t.id === (id ?? get().activeTournoiId));
  },

  getActiveTournoi() {
    return get().getTournoi(get().activeTournoiId);
  },

  // ── Navigation ────────────────────────────────────────────────────────────

  selectTournoi(id) {
    const t = get().getTournoi(id);
    if (!t) return;
    let screen = 'equipes';
    if (t.finished) screen = 'resultats';
    else if (t.started) screen = 'tour';
    set({ activeTournoiId: id, activeScreen: screen });
  },

  setScreen(screen) {
    set({ activeScreen: screen });
  },

  goToDashboard() {
    set({ activeTournoiId: null, activeScreen: 'dashboard' });
  },

  // ── Kiosk ─────────────────────────────────────────────────────────────────

  openKiosk() { set({ kioskOpen: true }); },
  closeKiosk() { set({ kioskOpen: false }); },

  // ── Tournament CRUD ───────────────────────────────────────────────────────

  createTournoi(params) {
    const t = {
      id: genId(),
      nom: params.nom,
      date: params.date || '',
      heure: params.heure || '',
      cat: params.cat || 'adultes',
      eqMin: Number(params.eqMin) || 4,
      eqMax: Number(params.eqMax) || 16,
      joueursParEq: Number(params.joueursParEq) || 2,
      scoreCible: Number(params.scoreCible) || 13,
      matchNulAutorise: Boolean(params.matchNulAutorise),
      nbTours: Number(params.nbTours) || 3,
      nbTerrains: Number(params.nbTerrains) || 4,
      googleFormUrl: params.googleFormUrl || '',
      equipes: [],
      matchs: [],
      tourActuel: 0,
      started: false,
      finished: false,
    };
    set((s) => ({ tournois: [t, ...s.tournois] }));
    get()._save();
    return t.id;
  },

  updateTournoiParams(id, params) {
    set((s) => ({
      tournois: s.tournois.map((t) =>
        t.id === id ? { ...t, ...params } : t
      ),
    }));
    get()._save();
  },

  deleteTournoi(id) {
    set((s) => ({
      tournois: s.tournois.filter((t) => t.id !== id),
      activeTournoiId: s.activeTournoiId === id ? null : s.activeTournoiId,
      activeScreen: s.activeTournoiId === id ? 'dashboard' : s.activeScreen,
    }));
    get()._save();
  },

  // ── Team management ───────────────────────────────────────────────────────

  addEquipe(tournoiId, equipeData) {
    const t = get().getTournoi(tournoiId);
    if (!t) return { error: 'Tournoi introuvable' };
    if (t.started) return { error: 'Le tournoi est déjà démarré' };
    if (t.equipes.length >= t.eqMax) return { error: `Maximum ${t.eqMax} équipes atteint` };
    const nom = equipeData.nom.trim();
    if (!nom) return { error: 'Le nom est obligatoire' };
    if (t.equipes.find((e) => e.nom.toLowerCase() === nom.toLowerCase()))
      return { error: 'Ce nom d\'équipe est déjà utilisé' };

    const equipe = {
      id: genId(),
      nom,
      j1: equipeData.j1 || '',
      j2: equipeData.j2 || '',
      j3: equipeData.j3 || '',
      v: 0, d: 0, pts: 0, ptsCont: 0,
      matchsJoues: 0, adversaires: [], byeRecu: false, forfait: false,
    };

    set((s) => ({
      tournois: s.tournois.map((tt) =>
        tt.id === tournoiId
          ? { ...tt, equipes: [...tt.equipes, equipe] }
          : tt
      ),
    }));
    get()._save();
    return { success: true, equipe };
  },

  removeEquipe(tournoiId, equipeId) {
    set((s) => ({
      tournois: s.tournois.map((t) =>
        t.id === tournoiId
          ? { ...t, equipes: t.equipes.filter((e) => e.id !== equipeId) }
          : t
      ),
    }));
    get()._save();
  },

  importEquipes(tournoiId, equipes) {
    set((s) => ({
      tournois: s.tournois.map((t) =>
        t.id === tournoiId ? { ...t, equipes } : t
      ),
    }));
    get()._save();
  },

  setForfait(tournoiId, equipeId, forfait) {
    set((s) => ({
      tournois: s.tournois.map((t) => {
        if (t.id !== tournoiId) return t;
        const equipes = t.equipes.map((e) =>
          e.id === equipeId ? { ...e, forfait } : e
        );
        // If forfait: auto-win pending matches for opponents
        let matchs = [...t.matchs];
        if (forfait) {
          matchs = matchs.map((m) => {
            if (m.done || m.bye) return m;
            if (m.A === equipeId)
              return { ...m, sA: 0, sB: t.scoreCible, done: true };
            if (m.B === equipeId)
              return { ...m, sA: t.scoreCible, sB: 0, done: true };
            return m;
          });
        }
        const updated = { ...t, equipes, matchs };
        const recalc = recalculateStandings(updated);
        return { ...updated, equipes: recalc };
      }),
    }));
    get()._save();
  },

  // ── Tournament flow ───────────────────────────────────────────────────────

  resetToRegistration(tournoiId) {
    set((s) => ({
      tournois: s.tournois.map((t) => {
        if (t.id !== tournoiId) return t;
        return {
          ...t,
          started: false,
          tourActuel: 0,
          matchs: [],
          equipes: t.equipes.map((e) => ({
            ...e,
            v: 0, d: 0, pts: 0, ptsCont: 0,
            matchsJoues: 0, adversaires: [], byeRecu: false,
          })),
        };
      }),
    }));
    get()._save();
    set({ activeScreen: 'equipes' });
  },

  startTournoi(tournoiId) {
    const t = get().getTournoi(tournoiId);
    if (!t) return { error: 'Tournoi introuvable' };
    if (t.equipes.length < 2) return { error: 'Il faut au moins 2 équipes' };

    const newMatches = generateRound(t, 1);

    set((s) => ({
      tournois: s.tournois.map((tt) => {
        if (tt.id !== tournoiId) return tt;
        const withMatches = { ...tt, matchs: newMatches, tourActuel: 1, started: true };
        // recalculateStandings is the single source of truth for all team stats
        const recalcEquipes = recalculateStandings(withMatches);
        const mergedEquipes = tt.equipes.map((e) => {
          const r = recalcEquipes.find((x) => x.id === e.id);
          return r ? { ...e, ...r } : e;
        });
        return { ...withMatches, equipes: mergedEquipes };
      }),
    }));
    get()._save();
    return { success: true };
  },

  nextTour(tournoiId) {
    const t = get().getTournoi(tournoiId);
    if (!t) return { error: 'Tournoi introuvable' };

    // Verify all matches of current round are done
    const currentRoundMatches = t.matchs.filter((m) => m.tour === t.tourActuel);
    if (currentRoundMatches.some((m) => !m.done)) {
      return { error: 'Tous les matchs du tour en cours doivent être saisis' };
    }

    const nextTourNum = t.tourActuel + 1;
    const isLast = nextTourNum > t.nbTours;

    if (isLast) {
      set((s) => ({
        tournois: s.tournois.map((tt) =>
          tt.id === tournoiId ? { ...tt, finished: true } : tt
        ),
      }));
      get()._save();
      set({ activeScreen: 'resultats' });
      return { success: true, finished: true };
    }

    // Generate next round using current standings (adversaires, byeRecu already recalculated)
    const updatedT = get().getTournoi(tournoiId);
    const newMatches = generateRound(updatedT, nextTourNum);

    set((s) => ({
      tournois: s.tournois.map((tt) => {
        if (tt.id !== tournoiId) return tt;
        const allMatches = [...tt.matchs, ...newMatches];
        const withMatches = { ...tt, matchs: allMatches, tourActuel: nextTourNum };
        const recalcEquipes = recalculateStandings(withMatches);
        const mergedEquipes = tt.equipes.map((e) => {
          const r = recalcEquipes.find((x) => x.id === e.id);
          return r ? { ...e, ...r } : e;
        });
        return { ...withMatches, equipes: mergedEquipes };
      }),
    }));
    get()._save();
    return { success: true, finished: false };
  },

  // ── Score entry ───────────────────────────────────────────────────────────

  setScore(tournoiId, matchIndex, sA, sB) {
    const t = get().getTournoi(tournoiId);
    if (!t) return { error: 'Tournoi introuvable' };
    const m = t.matchs[matchIndex];
    if (!m) return { error: 'Match introuvable' };
    if (m.done) return { error: 'Match déjà validé' };
    if (m.bye) return { error: 'Bye automatique' };

    const scoreA = Number(sA);
    const scoreB = Number(sB);

    if (!t.matchNulAutorise && scoreA === scoreB) {
      return { error: 'Match nul non autorisé dans ce tournoi' };
    }

    set((s) => ({
      tournois: s.tournois.map((tt) => {
        if (tt.id !== tournoiId) return tt;
        const matchs = tt.matchs.map((mm, i) => {
          if (i !== matchIndex) return mm;
          return { ...mm, sA: scoreA, sB: scoreB, done: true };
        });
        const updated = { ...tt, matchs };
        // Recalculate all standings from scratch
        const equipes = recalculateStandings(updated);
        // Preserve adversaires from recalc and other fields
        const mergedEquipes = tt.equipes.map((e) => {
          const recalced = equipes.find((r) => r.id === e.id);
          return recalced ? { ...e, ...recalced } : e;
        });
        return { ...updated, equipes: mergedEquipes };
      }),
    }));
    get()._save();
    return { success: true };
  },
}));
