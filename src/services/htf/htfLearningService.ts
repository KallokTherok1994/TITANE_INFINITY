// HTF Module — L'Humain à tout faire
// Apprentissage continu — boucle estimation vs. réel

import type { HTFLearningEntry } from './types';

const STORAGE_KEY = 'titane_htf_learning';

function load(): HTFLearningEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as HTFLearningEntry[];
  } catch {
    return [];
  }
}

function save(entries: HTFLearningEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function recordEstimate(entry: Omit<HTFLearningEntry, 'id' | 'facteurCorrection'>): HTFLearningEntry {
  const entries = load();
  const newEntry: HTFLearningEntry = {
    ...entry,
    id: `htf-learn-${Date.now()}`,
    facteurCorrection: entry.coutReel > 0 ? entry.coutReel / entry.coutEstime : 1,
  };
  entries.push(newEntry);
  save(entries);
  return newEntry;
}

export function recordCompletedJob(
  soumissionId: string,
  coutReel: number,
  heuresReelles: number
): void {
  const entries = load();
  const idx = entries.findIndex(e => e.soumissionId === soumissionId);
  const entry = idx !== -1 ? entries[idx] : undefined;
  if (entry && entry.coutEstime > 0) {
    entry.coutReel = coutReel;
    entry.heuresReelles = heuresReelles;
    entry.facteurCorrection = coutReel / entry.coutEstime;
    save(entries);
  }
}

export function getLearningInsights(): {
  facteurMoyenGlobal: number;
  nbrEntrees: number;
  facteurParType: Record<string, number>;
} {
  const entries = load();
  if (entries.length === 0) {
    return { facteurMoyenGlobal: 1, nbrEntrees: 0, facteurParType: {} };
  }

  const valid = entries.filter(e => e.facteurCorrection > 0 && e.coutReel > 0);
  const facteurMoyenGlobal = valid.length > 0
    ? valid.reduce((acc, e) => acc + e.facteurCorrection, 0) / valid.length
    : 1;

  const byType: Record<string, number[]> = {};
  for (const e of valid) {
    const arr = byType[e.typeService] ?? [];
    arr.push(e.facteurCorrection);
    byType[e.typeService] = arr;
  }

  const facteurParType: Record<string, number> = {};
  for (const [type, factors] of Object.entries(byType)) {
    facteurParType[type] = (factors.reduce((a, b) => a + b, 0)) / factors.length;
  }

  return { facteurMoyenGlobal, nbrEntrees: valid.length, facteurParType };
}

export function getAllLearningEntries(): HTFLearningEntry[] {
  return load();
}
