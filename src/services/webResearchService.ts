/**
 * TITANE∞ — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — WEB RESEARCH SERVICE (Ring 3 — UI bridge)
 *   One Door: UI → IPC → Rust → SearXNG → return (Tauri mode)
 *         or: UI → /api/ddg-search Vite proxy → DDG Lite (browser mode)
 * ═══════════════════════════════════════════════════════════════════
 *
 * INVARIANT Tauri mode: aucun fetch/HTTP direct. Tout passe par invoke Tauri.
 * BROWSER mode: fallback via Vite proxy /api/ddg-search (server-side, governed).
 */

import { safeInvokeCanonical } from '@/utils/invoke';
import type { IpcErrorPayload } from '@/utils/invoke';
import { tauri, isTauriAvailable } from '@/api/tauriClient';
import type { ResearchOptions, ResearchQuery, ResearchReport } from '@/types/research';

const E2E_WEB_RESEARCH_MOCK_FLAG = '__TITANE_E2E_WEB_RESEARCH_MOCK__';
const E2E_WEB_RESEARCH_REPORT_FLAG = '__TITANE_E2E_WEB_RESEARCH_REPORT__';

type WindowRecord = Record<string, unknown>;

function getWindowRecord(): WindowRecord | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window as unknown as WindowRecord;
}

function getE2EWebResearchMockReport(): ResearchReport | null {
  const win = getWindowRecord();
  if (!win || win[E2E_WEB_RESEARCH_MOCK_FLAG] !== true) {
    return null;
  }

  const report = win[E2E_WEB_RESEARCH_REPORT_FLAG];
  return report && typeof report === 'object' ? (report as ResearchReport) : null;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchResponse {
  ok: boolean;
  content: WebSearchResult[] | null;
  error: IpcErrorPayload | null;
}

// ─────────────────────────────────────────────────────────────────
// Browser-mode Wikipedia Search JSON parser
// Maps Wikipedia search results to WebSearchResult[].
// ─────────────────────────────────────────────────────────────────

interface WikiSearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

interface WikiSearchResponse {
  query?: { search?: WikiSearchResult[] };
}

function stripHtmlTags(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function parseWikiSearchJson(data: WikiSearchResponse, maxResults: number): WebSearchResult[] {
  const items = data?.query?.search ?? [];
  return items.slice(0, maxResults).map(item => ({
    title: item.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
    snippet: stripHtmlTags(item.snippet),
  }));
}

// ─────────────────────────────────────────────────────────────────
// Browser-mode HTTP fallback (Vite proxy → Wikipedia Search API)
// Called only when Tauri IPC is unavailable (browser/network HTTP mode).
// Route: /api/wiki-search?srsearch=... → Vite proxy → Wikipedia JSON API
// One Door compliance: proxy is server-side, governed by vite.config.ts.
// Wikipedia Search API: free, JSON, no auth, no bot-challenge.
// ─────────────────────────────────────────────────────────────────

export async function browserWebSearch(
  query: string,
  maxResults = 10
): Promise<WebSearchResponse> {
  try {
    const url = `/api/wiki-search?srsearch=${encodeURIComponent(query)}&srlimit=${maxResults}`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) {
      return {
        ok: false,
        content: null,
        error: { code: 'WIKI_HTTP_ERROR', message: `Wikipedia Search HTTP ${resp.status}` },
      };
    }
    const data: WikiSearchResponse = await resp.json();
    const results = parseWikiSearchJson(data, maxResults);
    return { ok: true, content: results, error: null };
  } catch (err) {
    return {
      ok: false,
      content: null,
      error: { code: 'BROWSER_SEARCH_FAILED', message: String(err) },
    };
  }
}

/**
 * Perform a web search.
 *
 * - Tauri mode: IPC → Rust → SearXNG → DDG Lite fallback (One Door).
 * - Browser mode: Vite proxy /api/ddg-search → DDG Lite HTML (governed).
 */
export async function webSearch(
  query: string,
  maxResults?: number
): Promise<WebSearchResponse> {
  if (!isTauriAvailable()) {
    return browserWebSearch(query, maxResults ?? 10);
  }
  const response = await safeInvokeCanonical<WebSearchResult[]>('web_search', {
    query,
    max_results: maxResults,
  });
  return {
    ok: response.ok,
    content: response.content ?? null,
    error: response.error,
  };
}

// ─────────────────────────────────────────────────────────────────
// Browser-mode full research fallback (Wikipedia → ResearchReport)
// Called when Tauri is unavailable. Constructs a governed ResearchReport
// from Wikipedia Search results so ConversationSection renders real content.
// ─────────────────────────────────────────────────────────────────

async function browserWebResearchFallback(question: string): Promise<ResearchReport> {
  const traceId = `browser-wiki-${Date.now()}`;
  const searchResp = await browserWebSearch(question, 8);

  if (!searchResp.ok || !searchResp.content || searchResp.content.length === 0) {
    const errorMsg = searchResp.error?.message ?? 'Aucun résultat Wikipedia.';
    return {
      answer: {
        answer: `Aucun résultat trouvé pour : "${question}". ${errorMsg}`,
        citations: [],
        confidence: 0,
        limitations: ['Résultats Wikipedia vides ou proxy indisponible'],
        trace_id: traceId,
        sources_count: 0,
        retrieved_passages_count: 0,
      },
      trace: {
        trace_id: traceId,
        markers: ['VERDICT_PASS', 'BROWSER_WIKI_EMPTY'],
        errors: [errorMsg],
      },
    };
  }

  const citations = searchResp.content.map(r => ({
    url: r.url,
    title: r.title,
    excerpt: r.snippet,
    accessed_at: new Date().toISOString(),
    locator_text: r.snippet.slice(0, 100),
  }));

  const summaryParts = searchResp.content
    .slice(0, 5)
    .map(r => `**${r.title}** : ${r.snippet}`)
    .join('\n\n');

  // v31.2.33: Persist web findings for long-term memory enrichment (dynamic import avoids circular dep)
  setTimeout(() => {
    import('@/services/memory/memoryWebEnricher').then(({ memoryWebEnricher }) => {
      memoryWebEnricher.scheduleEnrichment({
        id: `web_research_${Date.now()}`,
        content: summaryParts,
      });
    }).catch(() => { /* non-blocking */ });
  }, 0);

  return {
    answer: {
      answer: summaryParts,
      citations,
      confidence: 0.7,
      limitations: [],
      trace_id: traceId,
      sources_count: citations.length,
      retrieved_passages_count: citations.length,
    },
    trace: {
      trace_id: traceId,
      markers: ['VERDICT_PASS', 'BROWSER_WIKI_OK'],
      errors: [],
    },
  };
}

/**
 * Invoke the `web_research` Tauri command (full research pipeline).
 *
 * - Tauri mode: IPC → Rust → full research pipeline (One Door).
 * - Browser mode: Wikipedia proxy fallback → governed ResearchReport.
 *
 * Returns a `ResearchReport` with full trace and markers.
 */
export async function webResearch(
  query: ResearchQuery,
  options: ResearchOptions
): Promise<ResearchReport> {
  const e2eMockReport = getE2EWebResearchMockReport();
  if (e2eMockReport) {
    return e2eMockReport;
  }

  // Browser mode fallback: Wikipedia proxy (no Tauri runtime available)
  if (!isTauriAvailable()) {
    return browserWebResearchFallback(query.question);
  }

  return tauri<ResearchReport>('web_research', { query, options });
}

