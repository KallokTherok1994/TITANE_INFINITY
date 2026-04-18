/**
 * TITANE∞ — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — WEB RESEARCH SERVICE (Ring 3 — UI bridge)
 *   One Door: UI → IPC → Rust → SearXNG → return
 * ═══════════════════════════════════════════════════════════════════
 *
 * INVARIANT: aucun fetch/HTTP ici. Tout passe par invoke Tauri.
 */

import { safeInvokeCanonical } from '@/utils/invoke';
import type { IpcErrorPayload } from '@/utils/invoke';
import { tauri } from '@/api/tauriClient';
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

/**
 * Perform a web search via the Tauri `web_search` command.
 *
 * One Door governance: search goes through IPC → Rust → SearXNG.
 * No direct network access from the UI.
 *
 * The search API endpoint is configurable via `TITANE_SEARCH_API_URL`
 * environment variable in the Rust backend (default: SearXNG at http://127.0.0.1:8888/search).
 */
export async function webSearch(
  query: string,
  maxResults?: number
): Promise<WebSearchResponse> {
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
