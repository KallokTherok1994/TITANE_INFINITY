import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ResearchReport } from '../../types/research';

const tauriMock = vi.fn();
const isTauriAvailableMock = vi.fn(() => true);
const safeInvokeCanonicalMock = vi.fn();
const windowRecord = window as unknown as Record<string, unknown>;

vi.mock('@/api/tauriClient', () => ({
  tauri: (...args: unknown[]) => tauriMock(...args),
  isTauriAvailable: () => isTauriAvailableMock(),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: (...args: unknown[]) => safeInvokeCanonicalMock(...args),
}));

describe('webResearchService', () => {
  beforeEach(() => {
    tauriMock.mockReset();
    isTauriAvailableMock.mockReturnValue(true);
    safeInvokeCanonicalMock.mockReset();
    delete windowRecord.__TITANE_E2E_WEB_RESEARCH_MOCK__;
    delete windowRecord.__TITANE_E2E_WEB_RESEARCH_REPORT__;
  });

  it('returns the injected E2E mock report when the browser flag is enabled', async () => {
    const mockReport: ResearchReport = {
      answer: {
        answer: 'Synthèse mock citations',
        citations: [
          {
            url: 'https://example.com/source-a',
            title: 'Source A',
            excerpt: 'Extrait A',
            accessed_at: '2026-04-18T10:00:00Z',
            locator_text: 'p=2, c≈40',
          },
        ],
        limitations: [],
        trace_id: 'trace-mock-inline-citations',
        sources_count: 1,
        retrieved_passages_count: 1,
      },
      trace: {
        trace_id: 'trace-mock-inline-citations',
        markers: ['M_CITATIONS_BUILD_OK', 'VERDICT_PASS'],
        errors: [],
      },
    };

    windowRecord.__TITANE_E2E_WEB_RESEARCH_MOCK__ = true;
    windowRecord.__TITANE_E2E_WEB_RESEARCH_REPORT__ = mockReport;

    const { webResearch } = await import('../webResearchService');
    const result = await webResearch(
      { question: 'recherche web test' },
      { mode: 'WEB_LIVE' }
    );

    expect(result).toEqual(mockReport);
    expect(tauriMock).not.toHaveBeenCalled();
  });

  it('falls back to the canonical tauri IPC call when no E2E mock is injected', async () => {
    const ipcReport: ResearchReport = {
      answer: {
        answer: 'IPC report',
        citations: [],
        limitations: [],
        trace_id: 'trace-ipc',
        sources_count: 0,
        retrieved_passages_count: 0,
      },
      trace: {
        trace_id: 'trace-ipc',
        markers: ['VERDICT_PASS'],
        errors: [],
      },
    };
    tauriMock.mockResolvedValueOnce(ipcReport);

    const { webResearch } = await import('../webResearchService');
    const result = await webResearch(
      { question: 'recherche web test' },
      { mode: 'WEB_LIVE' }
    );

    expect(tauriMock).toHaveBeenCalledWith('web_research', {
      query: { question: 'recherche web test' },
      options: { mode: 'WEB_LIVE' },
    });
    expect(result).toEqual(ipcReport);
  });
});

// ─────────────────────────────────────────────────────────────────
// webSearch — Tauri mode vs browser mode (v31.2.31)
// ─────────────────────────────────────────────────────────────────

describe('webSearch — Tauri mode', () => {
  beforeEach(() => {
    isTauriAvailableMock.mockReturnValue(true);
    safeInvokeCanonicalMock.mockReset();
  });

  it('calls safeInvokeCanonical(web_search) and returns results', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({
      ok: true,
      content: [{ title: 'TITANE', url: 'https://titane.ai', snippet: 'About TITANE' }],
      error: null,
    });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('TITANE', 3);

    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('web_search', {
      query: 'TITANE',
      max_results: 3,
    });
    expect(result.ok).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content![0].title).toBe('TITANE');
  });

  it('propagates IPC error when backend fails', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({
      ok: false,
      content: null,
      error: { code: 'BACKEND_ERROR', message: 'SearXNG unreachable' },
    });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('error test', 5);

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('BACKEND_ERROR');
  });
});

describe('webSearch — browser mode (no Tauri)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    isTauriAvailableMock.mockReturnValue(false);
    safeInvokeCanonicalMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls /api/wiki-search proxy and returns parsed Wikipedia results', async () => {
    const wikiJson = {
      query: {
        search: [
          { pageid: 1, title: 'Example Page 1', snippet: 'Snippet about <b>example</b> page one.' },
          { pageid: 2, title: 'Example Page 2', snippet: 'Snippet about example page two.' },
        ],
      },
    };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => wikiJson,
    });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('test browser search', 5);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/wiki-search?srsearch=test%20browser%20search&srlimit=5',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result.ok).toBe(true);
    expect(result.content).toBeDefined();
    expect(result.content!.length).toBe(2);
    expect(result.content![0].url).toBe('https://en.wikipedia.org/wiki/Example_Page_1');
    expect(result.content![0].title).toBe('Example Page 1');
    expect(result.content![0].snippet).toBe('Snippet about example page one.');
    expect(safeInvokeCanonicalMock).not.toHaveBeenCalled();
  });

  it('returns ok:false when Wikipedia proxy returns HTTP error', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('failing query', 5);

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('WIKI_HTTP_ERROR');
  });

  it('returns ok:false when fetch throws a network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network failure'));

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('network error test', 5);

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('BROWSER_SEARCH_FAILED');
  });
});

// ─────────────────────────────────────────────────────────────────
// browserWebSearch — Wikipedia JSON parser edge cases
// ─────────────────────────────────────────────────────────────────

describe('browserWebSearch — Wikipedia JSON parser', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    isTauriAvailableMock.mockReturnValue(false);
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('respects maxResults limit', async () => {
    const search = Array.from({ length: 10 }, (_, i) => ({
      pageid: i + 1,
      title: `Result ${i + 1}`,
      snippet: `Snippet ${i + 1}`,
    }));
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ query: { search } }) });

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('test', 3);

    expect(result.ok).toBe(true);
    expect(result.content!.length).toBeLessThanOrEqual(3);
  });

  it('returns empty results when Wikipedia has no search results', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ query: { search: [] } }),
    });

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('no results', 5);

    expect(result.ok).toBe(true);
    expect(result.content).toEqual([]);
  });

  it('strips HTML tags from Wikipedia snippets', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        query: {
          search: [{ pageid: 42, title: 'Test', snippet: '<span>clean</span> &amp; simple' }],
        },
      }),
    });

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('test', 5);

    expect(result.content![0].snippet).toBe('clean & simple');
  });
});

