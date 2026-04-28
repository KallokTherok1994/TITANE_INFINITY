/**
 * TITANE∞ v31.2.33 — MemoryWebEnricher
 * Enrichit les entrées mémoire long-terme avec des résultats Wikipedia en arrière-plan.
 * Inspiré de HippoRAG (Guo et al., 2024): enrichissement passif des nœuds de connaissance.
 *
 * Design:
 * - Queue interne avec dedup par entry.id
 * - requestIdleCallback (timeout 5000ms) pour enrichissement non-bloquant
 * - One Door: fetch via /api/wiki-search uniquement
 * - Résultats stockés dans localStorage key: titane_web_enrichment_v1
 */

import { browserWebSearch } from '@/services/webResearchService';

// ─────────────────────────────────────────────────────────────────
// STORAGE KEY
// ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'titane_web_enrichment_v1';
const MAX_ENRICHED_ENTRIES = 200;
const ENRICHMENT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const ENRICHMENT_TIMEOUT_MS = 5000;

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface EnrichmentSource {
  title: string;
  url: string;
  snippet: string;
  fetchedAt: number;
}

export interface EnrichedEntry {
  entryId: string;
  concept: string;
  sources: EnrichmentSource[];
  enrichedAt: number;
  expiresAt: number;
}

export interface EnrichmentStore {
  entries: Record<string, EnrichedEntry>;
  lastPruned: number;
}

// Minimal interface compatible avec StructuredMemoryEntry et saveInteraction data
export interface EnrichableEntry {
  id?: string;
  summary?: string;
  content?: string;
  userMessage?: string;
  aiResponse?: string;
}

// ─────────────────────────────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────

function loadStore(): EnrichmentStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: {}, lastPruned: 0 };
    return JSON.parse(raw) as EnrichmentStore;
  } catch {
    return { entries: {}, lastPruned: 0 };
  }
}

function saveStore(store: EnrichmentStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full — silently ignore
  }
}

function pruneExpired(store: EnrichmentStore): EnrichmentStore {
  const now = Date.now();
  const entries = Object.fromEntries(
    Object.entries(store.entries).filter(([, e]) => e.expiresAt > now)
  );
  // Limit entries
  const keys = Object.keys(entries);
  if (keys.length > MAX_ENRICHED_ENTRIES) {
    const toKeep = keys
      .sort((a, b) => (entries[b]?.enrichedAt ?? 0) - (entries[a]?.enrichedAt ?? 0))
      .slice(0, MAX_ENRICHED_ENTRIES);
      return { entries: Object.fromEntries(toKeep.map(k => [k, entries[k]!])) as Record<string, EnrichedEntry>, lastPruned: now };
  }
  return { entries: entries as Record<string, EnrichedEntry>, lastPruned: now };
}

// ─────────────────────────────────────────────────────────────────
// CONCEPT EXTRACTION
// ─────────────────────────────────────────────────────────────────

/** Extrait le concept principal d'un texte pour la recherche Wikipedia */
export function extractMainConcept(text: string): string {
  // Supprimer mots vides et prendre les 5 premiers mots substantiels
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'au', 'je',
    'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'que', 'qui', 'est', 'sont', 'a',
    'the', 'is', 'are', 'was', 'and', 'or', 'of', 'to', 'a', 'an', 'in', 'on',
  ]);
  const words = text
    .replace(/[^\w\séàùèêâîôûäëïöü'-]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()))
    .slice(0, 5);
  return words.join(' ').substring(0, 80);
}

// ─────────────────────────────────────────────────────────────────
// ENRICHER CLASS
// ─────────────────────────────────────────────────────────────────

class MemoryWebEnricherService {
  private queue: Set<string> = new Set();
  private processing = false;

  /**
   * Planifie l'enrichissement d'une entrée mémoire en arrière-plan.
   * Utilise requestIdleCallback si disponible, sinon setTimeout(5000).
   */
  scheduleEnrichment(entry: EnrichableEntry): void {
    const id = entry.id || this._deriveId(entry);
    if (!id || this.queue.has(id)) return;

    // Check already enriched and not expired
    const store = loadStore();
    const existing = store.entries[id];
    if (existing && existing.expiresAt > Date.now()) return;

    this.queue.add(id);

    const run = () => {
      this._processEntry(entry, id).catch(() => {
        // Non-bloquant — ignore erreurs
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: ENRICHMENT_TIMEOUT_MS });
    } else {
      setTimeout(run, 1000);
    }
  }

  /**
   * Enrichit une liste d'entrées mémoire en arrière-plan (batch).
   */
  startIdleEnrichment(entries: EnrichableEntry[]): void {
    entries.forEach(e => this.scheduleEnrichment(e));
  }

  /**
   * Récupère les sources enrichies pour une entrée (null si non enrichie).
   */
  getEnrichment(entryId: string): EnrichedEntry | null {
    const store = loadStore();
    const entry = store.entries[entryId];
    if (!entry || entry.expiresAt < Date.now()) return null;
    return entry;
  }

  /**
   * Retourne toutes les entrées enrichies non-expirées.
   */
  getAllEnrichments(): EnrichedEntry[] {
    const store = pruneExpired(loadStore());
    return Object.values(store.entries);
  }

  private async _processEntry(entry: EnrichableEntry, id: string): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const text =
        entry.summary ||
        entry.content ||
        entry.userMessage ||
        entry.aiResponse ||
        '';
      if (!text.trim()) return;

      const concept = extractMainConcept(text);
      if (!concept) return;

      const result = await Promise.race([
        browserWebSearch(concept, 3),
        new Promise<null>(resolve => setTimeout(() => resolve(null), ENRICHMENT_TIMEOUT_MS)),
      ]);

      if (!result || !result.ok || !result.content?.length) return;

      const sources: EnrichmentSource[] = result.content.slice(0, 3).map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        fetchedAt: Date.now(),
      }));

      const now = Date.now();
      let store = loadStore();
      if (store.lastPruned < now - 24 * 60 * 60 * 1000) {
        store = pruneExpired(store);
      }

      store.entries[id] = {
        entryId: id,
        concept,
        sources,
        enrichedAt: now,
        expiresAt: now + ENRICHMENT_TTL_MS,
      };

      saveStore(store);
    } finally {
      this.queue.delete(id);
      this.processing = false;
    }
  }

  private _deriveId(entry: EnrichableEntry): string {
    const text = entry.summary || entry.content || entry.userMessage || '';
    return `enrichment_${text.substring(0, 40).replace(/\s+/g, '_')}`;
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────

export const memoryWebEnricher = new MemoryWebEnricherService();
