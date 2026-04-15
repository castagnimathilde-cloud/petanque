const STORAGE_KEY = 'petanque_app';

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { tournois: [] };
  } catch {
    return { tournois: [] };
  }
}

export function saveData(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('localStorage save failed', e);
  }
}

export function genId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}
