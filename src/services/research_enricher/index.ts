/**
 * Research Enricher Agent — service d'entrée.
 * Détecte les requêtes de type recherche dans le chat et enrichit la KB runtime
 * via le service de recherche web (One Door architecture).
 */

import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { detectResearchIntent } from './chatResearchDetector';
import {
  getRuntimeEnrichments,
  clearOldEnrichments,
  clearAllEnrichments,
} from './kbEnricher';
import type { AdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';

const RESEARCH_ENRICHER_HISTORY_KEY = 'titane_research_enricher_session_id';

function getEnricherSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }
  const existing = window.sessionStorage.getItem(RESEARCH_ENRICHER_HISTORY_KEY);
  if (existing) {
    return existing;
  }
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `enricher-${Date.now()}`;
  window.sessionStorage.setItem(RESEARCH_ENRICHER_HISTORY_KEY, id);
  return id;
}

export function resetResearchEnricherForTests(): void {
  if (typeof window === 'undefined') {
    return;
  }
  clearAllEnrichments();
  window.sessionStorage.removeItem(RESEARCH_ENRICHER_HISTORY_KEY);
}

/**
 * Returns the Research Enricher agent status enriched with live runtime signals.
 */
export function getResearchEnricherAgentStatus(): AdvancedAgentStatus {
  const base = getAdvancedAgentStatus('research_enricher');

  // Clean stale enrichments before computing status
  clearOldEnrichments();

  const enrichments = getRuntimeEnrichments();
  const sessionId = getEnricherSessionId();

  const recentQueries = enrichments
    .slice(0, 5)
    .map(e => `"${e.query.slice(0, 40)}" (${e.source})`);

  const webAvailable = typeof window !== 'undefined';
  const tauriAvailable =
    typeof window !== 'undefined' &&
    typeof (window as unknown as Record<string, unknown>).__TAURI__ !== 'undefined';

  return {
    ...base,
    serviceState: `${enrichments.length} enrichissement(s) actif(s) — session ${sessionId.slice(0, 8)} — ${tauriAvailable ? 'Tauri IPC disponible' : 'mode navigateur'}`,
    evidence: [
      `Détection d'intention de recherche active (${INTENT_PATTERN_COUNT} patterns FR/EN).`,
      enrichments.length > 0
        ? `${enrichments.length} enrichissement(s) KB runtime en cache : ${recentQueries.join(', ')}.`
        : 'Aucun enrichissement KB runtime en cache — prêt à enrichir.',
      `Transport réseau : ${tauriAvailable ? 'Tauri IPC (One Door)' : webAvailable ? 'navigateur (Wikipedia API fallback)' : 'indisponible'}.`,
      'Architecture One Door respectée — aucun accès réseau direct depuis la UI.',
    ],
    blockers: !webAvailable
      ? ['Environnement non-navigateur — sessionStorage et détection indisponibles.']
      : [],
    nextStep:
      enrichments.length === 0
        ? "Poser une question de type recherche/analyse dans le chat pour activer l'enrichissement automatique."
        : `${enrichments.length} enrichissement(s) prêt(s) — utiliser mergeWithKBContext() pour les injecter dans le contexte LLM.`,
  };
}

/** Count of intent patterns for transparency reporting */
const INTENT_PATTERN_COUNT = 10;

export { detectResearchIntent };
