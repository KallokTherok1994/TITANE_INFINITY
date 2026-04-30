/**
 * KB Enricher — runtime enrichment of knowledge base context from web research results.
 * Stores enrichments in sessionStorage only (ephemeral, secure).
 * Ring 3 — no direct network access; enrichment data comes from webResearchService.
 */

const KB_ENRICHMENT_SESSION_KEY = 'titane_research_enricher_history';
const KB_ENRICHMENT_MAX_ITEMS = 10;
const KB_ENRICHMENT_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export interface RuntimeKBEnrichment {
  id: string;
  query: string;
  timestamp: number;
  summary: string;
  categories: string[];
  confidence: number;
  source: 'web' | 'rag' | 'hybrid';
}

function generateEnrichmentId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `enrich-${ts}-${rand}`;
}

/**
 * Stores a new runtime enrichment in sessionStorage.
 */
export function addRuntimeEnrichment(enrichment: Omit<RuntimeKBEnrichment, 'id'>): RuntimeKBEnrichment {
  const full: RuntimeKBEnrichment = { ...enrichment, id: generateEnrichmentId() };

  if (typeof window === 'undefined') {
    return full;
  }

  try {
    const existing = getRuntimeEnrichments();
    const next = [full, ...existing].slice(0, KB_ENRICHMENT_MAX_ITEMS);
    window.sessionStorage.setItem(KB_ENRICHMENT_SESSION_KEY, JSON.stringify(next));
  } catch {
    // sessionStorage unavailable — degraded silently
  }

  return full;
}

/**
 * Retrieves all stored runtime enrichments from sessionStorage.
 */
export function getRuntimeEnrichments(): RuntimeKBEnrichment[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(KB_ENRICHMENT_SESSION_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (e: unknown): e is RuntimeKBEnrichment =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as RuntimeKBEnrichment).id === 'string' &&
        typeof (e as RuntimeKBEnrichment).timestamp === 'number'
    );
  } catch {
    return [];
  }
}

/**
 * Removes enrichments older than maxAge milliseconds.
 */
export function clearOldEnrichments(maxAgeMs = KB_ENRICHMENT_MAX_AGE_MS): void {
  if (typeof window === 'undefined') {
    return;
  }

  const cutoff = Date.now() - maxAgeMs;
  const fresh = getRuntimeEnrichments().filter(e => e.timestamp >= cutoff);

  try {
    window.sessionStorage.setItem(KB_ENRICHMENT_SESSION_KEY, JSON.stringify(fresh));
  } catch {
    // ignore
  }
}

/**
 * Clears all enrichments (for tests and resets).
 */
export function clearAllEnrichments(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.removeItem(KB_ENRICHMENT_SESSION_KEY);
}

/**
 * Creates a RuntimeKBEnrichment from a query and web results string.
 */
export function enrichKBFromResearch(
  query: string,
  results: string,
  categories: string[] = [],
  confidence = 0.7,
  source: RuntimeKBEnrichment['source'] = 'web'
): RuntimeKBEnrichment {
  const summary = results.slice(0, 500).trim();
  return addRuntimeEnrichment({
    query,
    timestamp: Date.now(),
    summary,
    categories,
    confidence,
    source,
  });
}

/**
 * Merges existing KB context string with fresh runtime enrichments relevant to the query.
 * Returns an enriched context string for LLM injection.
 */
export function mergeWithKBContext(
  kbContext: string,
  enrichments: RuntimeKBEnrichment[],
  query: string
): string {
  if (enrichments.length === 0) {
    return kbContext;
  }

  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2);

  // Select enrichments relevant to the current query
  const relevant = enrichments
    .filter(e => {
      const hay = (e.query + ' ' + e.summary).toLowerCase();
      return queryTerms.some(term => hay.includes(term));
    })
    .slice(0, 3);

  if (relevant.length === 0) {
    return kbContext;
  }

  const enrichedSection = relevant
    .map(
      e =>
        `[Recherche: "${e.query}" | Source: ${e.source} | Confiance: ${Math.round(e.confidence * 100)}%]\n${e.summary}`
    )
    .join('\n---\n');

  return [kbContext, `\n--- Enrichissements web runtime ---\n${enrichedSection}\n---`].join('\n');
}
