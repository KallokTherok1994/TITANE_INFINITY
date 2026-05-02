/**
 * Knowledge Manager Agent — service d'entrée.
 * Enrichit le catalogue statique avec des signaux runtime réels :
 * nombre de catégories KB chargées, couverture thématique, santé mémoire.
 */

import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { getAllEntries, listCategories } from '@/services/api/defaultKnowledgeBase';
import {
  clusterByTheme,
  detectKnowledgeGaps,
  getKBStats,
  type KBEntry,
} from './knowledgeOrganizer';
import { computeMemoryHealthScore } from './memoryOptimizer';
import type { AdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';

const KB_MANAGER_TIMELINE_KEY = 'titane_kb_manager_history';
const KB_MANAGER_TIMELINE_LIMIT = 8;

interface KBManagerTimelinePoint {
  timestamp: number;
  categoriesCount: number;
  entriesCount: number;
  gapsCount: number;
  healthScore: number;
}

function loadKBManagerTimeline(): KBManagerTimelinePoint[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(KB_MANAGER_TIMELINE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (p: unknown) => p && typeof (p as KBManagerTimelinePoint).timestamp === 'number'
    );
  } catch {
    return [];
  }
}

function saveKBManagerTimeline(history: KBManagerTimelinePoint[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(KB_MANAGER_TIMELINE_KEY, JSON.stringify(history));
}

function appendKBManagerSnapshot(point: KBManagerTimelinePoint): void {
  const history = loadKBManagerTimeline();
  const next = [...history, point].slice(-KB_MANAGER_TIMELINE_LIMIT);
  saveKBManagerTimeline(next);
}

export function resetKBManagerTimelineForTests(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(KB_MANAGER_TIMELINE_KEY);
}

/**
 * Returns the Knowledge Manager agent status enriched with live runtime signals.
 */
export async function getKnowledgeManagerAgentStatus(): Promise<AdvancedAgentStatus> {
  const base = getAdvancedAgentStatus('knowledge_manager');

  try {
    const [categories, entries] = await Promise.all([listCategories(), getAllEntries()]);

    const kbEntries: KBEntry[] = entries.map(e => ({
      category: e.category,
      description: e.description,
      retrieval_triggers: e.retrieval_triggers,
    }));

    const stats = getKBStats(kbEntries);
    const gaps = detectKnowledgeGaps(kbEntries);
    const clustered = clusterByTheme(kbEntries);
    const coveredThemes = (Object.keys(clustered) as (keyof typeof clustered)[]).filter(
      t => clustered[t].length > 0 && t !== 'autre'
    );
    const health = computeMemoryHealthScore(
      entries.map(e => ({ id: e.category, content: JSON.stringify(e) }))
    );

    const snapshot: KBManagerTimelinePoint = {
      timestamp: Date.now(),
      categoriesCount: categories.length,
      entriesCount: entries.length,
      gapsCount: gaps.length,
      healthScore: health.healthScore,
    };
    appendKBManagerSnapshot(snapshot);

    const timeline = loadKBManagerTimeline();

    return {
      ...base,
      serviceState: `${entries.length} entrées KB chargées — ${categories.length} catégories — santé mémoire ${health.healthScore}/100`,
      evidence: [
        `${entries.length} entrées KB disponibles en cache runtime (${categories.length} catégories).`,
        `Couverture thématique : ${coveredThemes.length} domaines actifs (${coveredThemes.slice(0, 4).join(', ')}${coveredThemes.length > 4 ? '...' : ''}).`,
        `Score santé mémoire : ${health.healthScore}/100 — ${health.staleCount} entrées potentiellement obsolètes.`,
        `Avg triggers/entrée : ${stats.avgTriggersPerEntry.toFixed(1)} — top triggers : ${stats.topTriggers.slice(0, 3).join(', ')}.`,
        timeline.length > 0
          ? `Historique timeline : ${timeline.length} point(s) depuis la 1ère activation.`
          : 'Première activation de ce panneau.',
      ],
      blockers:
        gaps.length > 0
          ? [
              `${gaps.length} domaine(s) KB sous-représenté(s) détecté(s) : ${gaps.slice(0, 3).join(', ')}${gaps.length > 3 ? '...' : ''}.`,
            ]
          : [],
      nextStep:
        gaps.length > 0
          ? `Ajouter des entrées KB pour couvrir les domaines manquants : ${gaps[0]}.`
          : 'Couverture thématique complète. Enrichir les triggers pour améliorer la pertinence du matching.',
    };
  } catch (err) {
    return {
      ...base,
      serviceState: 'KB non chargée — initialisation en cours',
      evidence: [
        'Service Knowledge Manager initialisé — données KB non encore disponibles.',
      ],
      blockers: [
        `Données KB non disponibles : ${err instanceof Error ? err.message : 'erreur inconnue'}`,
      ],
      nextStep: 'Attendre le chargement complet de la base de connaissances.',
    };
  }
}
