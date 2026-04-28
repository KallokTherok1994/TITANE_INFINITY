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
// Browser-mode DDG Lite HTML parser
// Mirrors the Rust parse_ddg_lite_html logic.
// ─────────────────────────────────────────────────────────────────

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

function extractAttr(tag: string, attr: string): string | null {
  const search = `${attr}="`;
  const startIdx = tag.indexOf(search);
  if (startIdx === -1) return null;
  const valueStart = startIdx + search.length;
  const valueEnd = tag.indexOf('"', valueStart);
  if (valueEnd === -1) return null;
  return tag.slice(valueStart, valueEnd);
}

function parseDDGLiteHtml(html: string, maxResults: number): WebSearchResult[] {
  const results: WebSearchResult[] = [];
  let remaining = html;

  while (results.length < maxResults) {
    const linkStart = remaining.indexOf('class="result-link"');
    if (linkStart === -1) break;

    const before = remaining.slice(0, linkStart);
    const aStart = before.lastIndexOf('<');
    if (aStart === -1) {
      remaining = remaining.slice(linkStart + 1);
      continue;
    }

    const tagSlice = remaining.slice(aStart);
    const href = extractAttr(tagSlice, 'href') ?? '';
    const tagEnd = tagSlice.indexOf('>');
    if (tagEnd === -1) {
      remaining = remaining.slice(linkStart + 1);
      continue;
    }

    const afterTag = tagSlice.slice(tagEnd + 1);
    const titleEndIdx = afterTag.indexOf('</a>');
    const titleRaw = titleEndIdx !== -1 ? afterTag.slice(0, titleEndIdx) : afterTag.slice(0, 200);
    const title = stripTags(titleRaw).trim();

    const snippetMarker = 'result-snippet';
    let snippet = '';
    const snipStart = afterTag.indexOf(snippetMarker);
    if (snipStart !== -1) {
      const snipSlice = afterTag.slice(snipStart);
      const snipTagEnd = snipSlice.indexOf('>');
      if (snipTagEnd !== -1) {
        const snipContent = snipSlice.slice(snipTagEnd + 1);
        const snipClose = snipContent.indexOf('<');
        const snipRaw = snipClose !== -1 ? snipContent.slice(0, snipClose) : snipContent.slice(0, 300);
        snippet = stripTags(snipRaw).trim();
      }
    }

    if (href && title) {
      results.push({ title, url: href, snippet });
    }

    remaining = remaining.slice(linkStart + 1);
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────
// Browser-mode HTTP fallback (Vite proxy → DDG Lite)
// Called only when Tauri IPC is unavailable (browser/network HTTP mode).
// Route: /api/ddg-search?q=... → Vite proxy → https://lite.duckduckgo.com/lite/
// One Door compliance: proxy is server-side, governed by vite.config.ts.
// ─────────────────────────────────────────────────────────────────

export async function browserWebSearch(
  query: string,
  maxResults = 10
): Promise<WebSearchResponse> {
  try {
    const url = `/api/ddg-search?q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'text/html' },
    });
    if (!resp.ok) {
      return {
        ok: false,
        content: null,
        error: { code: 'DDG_HTTP_ERROR', message: `DDG Lite HTTP ${resp.status}` },
      };
    }
    const html = await resp.text();
    const results = parseDDGLiteHtml(html, maxResults);
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

/**
 * Invoke the `web_research` Tauri command (full research pipeline).
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

  return tauri<ResearchReport>('web_research', { query, options });
}

