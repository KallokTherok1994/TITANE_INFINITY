/**
 * TITANE∞ — webResearchService — Suite de tests complète et avancée v31.2.32
 *
 * Couverture:
 *   1. webResearch()      — Tauri IPC, mock E2E, gestion d'erreurs, options avancées
 *   2. webSearch()        — Routage Tauri vs browser, contrat IPC, propagation d'erreurs
 *   3. browserWebSearch() — Proxy Wikipedia, parseur JSON, cas limites, sécurité
 *   4. Scénarios avancés  — injection XSS/SQL, concurrence, Unicode, edge cases
 *   5. Contrat de réponse — structure WebSearchResponse garantie
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ResearchReport } from '../../types/research';

// ─────────────────────────────────────────────────────────────────
// Mocks globaux
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function makeResearchReport(overrides: Partial<ResearchReport> = {}): ResearchReport {
  return {
    answer: {
      answer: 'Synthèse de test',
      citations: [],
      limitations: [],
      trace_id: 'trace-test',
      sources_count: 0,
      retrieved_passages_count: 0,
      ...(overrides.answer ?? {}),
    },
    trace: {
      trace_id: 'trace-test',
      markers: ['VERDICT_PASS'],
      errors: [],
      ...(overrides.trace ?? {}),
    },
    ...overrides,
  };
}

function makeWikiJson(
  items: Array<{ pageid?: number; title: string; snippet: string }>
) {
  return {
    query: {
      search: items.map((it, i) => ({
        pageid: it.pageid ?? i + 1,
        title: it.title,
        snippet: it.snippet,
      })),
    },
  };
}

function makeFetchSuccess(json: unknown) {
  return { ok: true, json: async () => json };
}

function makeFetchError(status: number) {
  return { ok: false, status };
}

// ═══════════════════════════════════════════════════════════════════
// 1. webResearch() — E2E mock injection
// ═══════════════════════════════════════════════════════════════════

describe('webResearch — E2E mock injection', () => {
  beforeEach(() => {
    tauriMock.mockReset();
    isTauriAvailableMock.mockReturnValue(true);
    safeInvokeCanonicalMock.mockReset();
    delete windowRecord.__TITANE_E2E_WEB_RESEARCH_MOCK__;
    delete windowRecord.__TITANE_E2E_WEB_RESEARCH_REPORT__;
  });

  it('retourne le rapport injecté quand le flag E2E est true strict', async () => {
    const report = makeResearchReport({
      answer: {
        answer: 'Mock E2E',
        citations: [{
          url: 'https://example.com', title: 'Source', excerpt: 'Extrait',
          accessed_at: '2026-04-28T10:00:00Z', locator_text: 'p=1',
        }],
        limitations: [],
        trace_id: 'trace-e2e',
        sources_count: 1,
        retrieved_passages_count: 1,
      },
      trace: { trace_id: 'trace-e2e', markers: ['VERDICT_PASS'], errors: [] },
    });
    windowRecord.__TITANE_E2E_WEB_RESEARCH_MOCK__ = true;
    windowRecord.__TITANE_E2E_WEB_RESEARCH_REPORT__ = report;

    const { webResearch } = await import('../webResearchService');
    const result = await webResearch({ question: 'test' }, { mode: 'WEB_LIVE' });

    expect(result).toEqual(report);
    expect(tauriMock).not.toHaveBeenCalled();
  });

  it("n'utilise pas le mock si le flag est truthy mais pas true strict (valeur 1)", async () => {
    windowRecord.__TITANE_E2E_WEB_RESEARCH_MOCK__ = 1;
    const report = makeResearchReport();
    tauriMock.mockResolvedValueOnce(report);

    const { webResearch } = await import('../webResearchService');
    await webResearch({ question: 'test' }, { mode: 'WEB_LIVE' });

    expect(tauriMock).toHaveBeenCalledOnce();
  });

  it("n'utilise pas le mock si le rapport injecté est null", async () => {
    windowRecord.__TITANE_E2E_WEB_RESEARCH_MOCK__ = true;
    windowRecord.__TITANE_E2E_WEB_RESEARCH_REPORT__ = null;
    const report = makeResearchReport();
    tauriMock.mockResolvedValueOnce(report);

    const { webResearch } = await import('../webResearchService');
    const result = await webResearch({ question: 'test' }, { mode: 'WEB_LIVE' });

    expect(result).toEqual(report);
    expect(tauriMock).toHaveBeenCalledOnce();
  });

  it("n'utilise pas le mock si le rapport injecté est une chaîne (non-objet)", async () => {
    windowRecord.__TITANE_E2E_WEB_RESEARCH_MOCK__ = true;
    windowRecord.__TITANE_E2E_WEB_RESEARCH_REPORT__ = 'invalid-report';
    const report = makeResearchReport();
    tauriMock.mockResolvedValueOnce(report);

    const { webResearch } = await import('../webResearchService');
    await webResearch({ question: 'test' }, { mode: 'WEB_LIVE' });

    expect(tauriMock).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. webResearch() — Tauri IPC
// ═══════════════════════════════════════════════════════════════════

describe('webResearch — Tauri IPC', () => {
  beforeEach(() => {
    tauriMock.mockReset();
    isTauriAvailableMock.mockReturnValue(true);
    delete windowRecord.__TITANE_E2E_WEB_RESEARCH_MOCK__;
    delete windowRecord.__TITANE_E2E_WEB_RESEARCH_REPORT__;
  });

  it('appelle tauri("web_research") avec query + options et retourne le rapport', async () => {
    const report = makeResearchReport();
    tauriMock.mockResolvedValueOnce(report);

    const { webResearch } = await import('../webResearchService');
    const result = await webResearch(
      { question: 'recherche avancée', locale: 'fr' },
      { mode: 'WEB_LIVE', max_sources: 5 }
    );

    expect(tauriMock).toHaveBeenCalledWith('web_research', {
      query: { question: 'recherche avancée', locale: 'fr' },
      options: { mode: 'WEB_LIVE', max_sources: 5 },
    });
    expect(result).toEqual(report);
  });

  it('propage le rejet Tauri (IPC_TIMEOUT)', async () => {
    tauriMock.mockRejectedValueOnce(new Error('IPC_TIMEOUT'));

    const { webResearch } = await import('../webResearchService');
    await expect(
      webResearch({ question: 'test' }, { mode: 'WEB_LIVE' })
    ).rejects.toThrow('IPC_TIMEOUT');
  });

  it("appelle tauri en mode OFFLINE sans lever d'erreur", async () => {
    const report = makeResearchReport();
    tauriMock.mockResolvedValueOnce(report);

    const { webResearch } = await import('../webResearchService');
    const result = await webResearch({ question: 'local only' }, { mode: 'OFFLINE' });

    expect(tauriMock).toHaveBeenCalledWith('web_research', {
      query: { question: 'local only' },
      options: { mode: 'OFFLINE' },
    });
    expect(result).toEqual(report);
  });

  it('transmet domain_allowlist + timeout_ms + respect_robots intacts', async () => {
    const report = makeResearchReport();
    tauriMock.mockResolvedValueOnce(report);

    const { webResearch } = await import('../webResearchService');
    await webResearch(
      { question: 'sécurité' },
      {
        mode: 'WEB_LIVE',
        domain_allowlist: ['wikipedia.org', 'arxiv.org'],
        timeout_ms: 5000,
        max_requests: 3,
        respect_robots: true,
      }
    );

    const callArg = tauriMock.mock.calls[0][1] as { options: Record<string, unknown> };
    expect(callArg.options.domain_allowlist).toEqual(['wikipedia.org', 'arxiv.org']);
    expect(callArg.options.timeout_ms).toBe(5000);
    expect(callArg.options.respect_robots).toBe(true);
    expect(callArg.options.max_requests).toBe(3);
  });

  it('appelle tauri avec intent et locale dans la query', async () => {
    const report = makeResearchReport();
    tauriMock.mockResolvedValueOnce(report);

    const { webResearch } = await import('../webResearchService');
    await webResearch(
      { question: 'IA', intent: 'synthèse', locale: 'fr' },
      { mode: 'LOCAL_INDEX' }
    );

    const callArg = tauriMock.mock.calls[0][1] as { query: Record<string, unknown> };
    expect(callArg.query.intent).toBe('synthèse');
    expect(callArg.query.locale).toBe('fr');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. webSearch() — mode Tauri (IPC)
// ═══════════════════════════════════════════════════════════════════

describe('webSearch — mode Tauri (IPC)', () => {
  beforeEach(() => {
    isTauriAvailableMock.mockReturnValue(true);
    safeInvokeCanonicalMock.mockReset();
  });

  it('appelle safeInvokeCanonical("web_search") avec query + max_results', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({
      ok: true,
      content: [{ title: 'TITANE', url: 'https://titane.ai', snippet: 'OS cognitif' }],
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
    expect(result.content![0].url).toBe('https://titane.ai');
    expect(result.content![0].snippet).toBe('OS cognitif');
  });

  it('transmet max_results=undefined quand non spécifié', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({ ok: true, content: [], error: null });

    const { webSearch } = await import('../webResearchService');
    await webSearch('test sans limite');

    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('web_search', {
      query: 'test sans limite',
      max_results: undefined,
    });
  });

  it("propage l'erreur IPC dans le champ error", async () => {
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
    expect(result.error?.message).toBe('SearXNG unreachable');
  });

  it('retourne content:null quand IPC retourne null', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({ ok: true, content: null, error: null });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('vide');

    expect(result.ok).toBe(true);
    expect(result.content).toBeNull();
    expect(result.error).toBeNull();
  });

  it('préserve l\'ordre des résultats multiples', async () => {
    const items = [
      { title: 'A', url: 'https://a.com', snippet: 'Premier' },
      { title: 'B', url: 'https://b.com', snippet: 'Deuxième' },
      { title: 'C', url: 'https://c.com', snippet: 'Troisième' },
    ];
    safeInvokeCanonicalMock.mockResolvedValueOnce({ ok: true, content: items, error: null });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('multi résultats', 10);

    expect(result.content).toHaveLength(3);
    expect(result.content!.map(r => r.title)).toEqual(['A', 'B', 'C']);
  });

  it("n'appelle pas fetch() en mode Tauri", async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    safeInvokeCanonicalMock.mockResolvedValueOnce({ ok: true, content: [], error: null });

    const { webSearch } = await import('../webResearchService');
    await webSearch('tauri mode');

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. webSearch() — mode browser (Tauri indisponible)
// ═══════════════════════════════════════════════════════════════════

describe('webSearch — mode browser (Tauri indisponible)', () => {
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

  it('appelle /api/wiki-search et retourne les résultats Wikipedia parsés', async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchSuccess(makeWikiJson([
        { title: 'Intelligence artificielle', snippet: 'Capacité des <b>systèmes</b> computationnels.' },
        { title: 'Machine learning', snippet: "Sous-domaine de l'IA." },
      ]))
    );

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('intelligence artificielle', 5);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/wiki-search?srsearch=intelligence%20artificielle&srlimit=5',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result.ok).toBe(true);
    expect(result.content!.length).toBe(2);
    expect(result.content![0].title).toBe('Intelligence artificielle');
    expect(result.content![0].url).toBe('https://en.wikipedia.org/wiki/Intelligence_artificielle');
    expect(result.content![0].snippet).toBe('Capacité des systèmes computationnels.');
    expect(safeInvokeCanonicalMock).not.toHaveBeenCalled();
  });

  it('utilise maxResults=10 par défaut', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { webSearch } = await import('../webResearchService');
    await webSearch('test défaut');

    const calledUrl = (fetchMock.mock.calls[0] as [string, unknown])[0];
    expect(calledUrl).toContain('srlimit=10');
  });

  it('encode les caractères spéciaux dans la requête', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { webSearch } = await import('../webResearchService');
    await webSearch('quantum & AI > 2024', 5);

    const calledUrl = (fetchMock.mock.calls[0] as [string, unknown])[0];
    expect(calledUrl).toContain('%26');
    expect(calledUrl).not.toContain(' & ');
  });

  it('retourne WIKI_HTTP_ERROR si le proxy renvoie HTTP 503', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchError(503));

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('erreur HTTP', 5);

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('WIKI_HTTP_ERROR');
    expect(result.error?.message).toContain('503');
  });

  it('retourne BROWSER_SEARCH_FAILED si fetch lève une TypeError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('erreur réseau', 5);

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('BROWSER_SEARCH_FAILED');
    expect(result.error?.message).toContain('Failed to fetch');
  });

  it('retourne BROWSER_SEARCH_FAILED si fetch lève une AbortError', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('aborted', 5);

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('BROWSER_SEARCH_FAILED');
  });

  it('retourne ok:true avec content:[] si Wikipedia retourne search:[]', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess({ query: { search: [] } }));

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('introuvable xyz123', 5);

    expect(result.ok).toBe(true);
    expect(result.content).toEqual([]);
    expect(result.error).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. browserWebSearch() — parseur JSON Wikipedia avancé
// ═══════════════════════════════════════════════════════════════════

describe('browserWebSearch — parseur Wikipedia JSON', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    isTauriAvailableMock.mockReturnValue(false);
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('respecte la limite maxResults (3 sur 10 disponibles)', async () => {
    const search = Array.from({ length: 10 }, (_, i) => ({
      pageid: i + 1, title: `Article ${i + 1}`, snippet: `Contenu ${i + 1}`,
    }));
    fetchMock.mockResolvedValueOnce(makeFetchSuccess({ query: { search } }));

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('test limite', 3);

    expect(result.ok).toBe(true);
    expect(result.content!.length).toBe(3);
    expect(result.content![0].title).toBe('Article 1');
    expect(result.content![2].title).toBe('Article 3');
  });

  it('retourne tous les résultats si maxResults >= disponibles', async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchSuccess(makeWikiJson([{ title: 'Seul', snippet: 'Unique' }]))
    );

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('seul', 100);

    expect(result.content!.length).toBe(1);
  });

  it('génère les URLs Wikipedia correctement (espaces → underscores)', async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchSuccess(makeWikiJson([{ title: 'Réseau de neurones', snippet: 'Modèle.' }]))
    );

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('neurones', 5);

    expect(result.content![0].url).toContain('wikipedia.org/wiki/');
    expect(result.content![0].url).toContain('neurones');
  });

  it('strip les balises HTML des snippets (<b>, <span>, <em>)', async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchSuccess(makeWikiJson([{
        title: 'Test',
        snippet: '<b>Important</b> concept in <em>machine</em> <span class="match">learning</span>.',
      }]))
    );

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('test', 5);

    expect(result.content![0].snippet).toBe('Important concept in machine learning.');
    expect(result.content![0].snippet).not.toContain('<');
  });

  it('decode les entités HTML (&amp; &quot; &#039; &lt; &gt;)', async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchSuccess(makeWikiJson([{
        title: 'Entités',
        snippet: 'A &amp; B &quot;cité&quot; &#039;simple&#039; &lt;tag&gt;',
      }]))
    );

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('entites', 5);

    expect(result.content![0].snippet).toBe(`A & B "cité" 'simple' <tag>`);
  });

  it('retourne [] si query.search est absent dans la réponse', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess({ query: {} }));

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('malformé', 5);

    expect(result.ok).toBe(true);
    expect(result.content).toEqual([]);
  });

  it('retourne [] si query est absent (JSON malformé)', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess({}));

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('vide total', 5);

    expect(result.ok).toBe(true);
    expect(result.content).toEqual([]);
  });

  it('retourne WIKI_HTTP_ERROR sur HTTP 404', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchError(404));

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('404 test', 5);

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('WIKI_HTTP_ERROR');
    expect(result.error?.message).toContain('404');
  });

  it('retourne WIKI_HTTP_ERROR sur HTTP 429 (rate limit)', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchError(429));

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('rate limit', 5);

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('WIKI_HTTP_ERROR');
  });

  it('encode les parenthèses dans le titre → URL Wikipedia correcte', async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchSuccess(makeWikiJson([
        { pageid: 5117, title: 'Python (programming language)', snippet: 'High-level language.' }
      ]))
    );

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('python', 1);

    expect(result.content![0].url).toContain('Python');
    expect(result.content![0].url).toContain('wikipedia.org/wiki/');
  });

  it('construit l\'URL fetch avec srlimit correct', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { browserWebSearch } = await import('../webResearchService');
    await browserWebSearch('test srlimit', 7);

    const calledUrl = (fetchMock.mock.calls[0] as [string, unknown])[0];
    expect(calledUrl).toContain('srlimit=7');
    expect(calledUrl).toContain('srsearch=');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. Scénarios de sécurité
// ═══════════════════════════════════════════════════════════════════

describe('webSearch — scénarios de sécurité', () => {
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

  it("encode les tentatives d'injection XSS dans la requête URL", async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { webSearch } = await import('../webResearchService');
    await webSearch('<script>alert(1)</script>', 5);

    const calledUrl = (fetchMock.mock.calls[0] as [string, unknown])[0];
    expect(calledUrl).not.toContain('<script>');
    expect(calledUrl).toContain('%3C');
  });

  it("encode les tentatives SQL injection dans la requête URL", async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { webSearch } = await import('../webResearchService');
    await webSearch("' OR 1=1; DROP TABLE users; --", 5);

    const calledUrl = (fetchMock.mock.calls[0] as [string, unknown])[0];
    // ';' doit être encodé en %3B (SQL injection caractère clé)
    expect(calledUrl).not.toContain(';');
    expect(calledUrl).toContain('%3B');
  });

  it('strip le markup XSS injecté via snippet Wikipedia', async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchSuccess(makeWikiJson([{
        title: 'XSS',
        snippet: '<img src=x onerror="alert(1)"><script>evil()</script>texte propre',
      }]))
    );

    const { browserWebSearch } = await import('../webResearchService');
    const result = await browserWebSearch('xss', 5);

    expect(result.content![0].snippet).not.toContain('onerror');
    expect(result.content![0].snippet).not.toContain('script');
    expect(result.content![0].snippet).toContain('texte propre');
  });

  it('ne passe pas de credentials ni Authorization dans les headers', async () => {
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { browserWebSearch } = await import('../webResearchService');
    await browserWebSearch('test sécurité', 5);

    const callOptions = (fetchMock.mock.calls[0] as [string, RequestInit])[1];
    expect(callOptions.credentials).toBeUndefined();
    const headers = callOptions.headers as Record<string, string> | undefined;
    expect(headers?.['Authorization']).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. Concurrence et edge cases
// ═══════════════════════════════════════════════════════════════════

describe('webSearch — concurrence et edge cases', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    safeInvokeCanonicalMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deux appels Tauri simultanés sont indépendants', async () => {
    isTauriAvailableMock.mockReturnValue(true);
    safeInvokeCanonicalMock
      .mockResolvedValueOnce({ ok: true, content: [{ title: 'A', url: 'https://a.com', snippet: 'A' }], error: null })
      .mockResolvedValueOnce({ ok: true, content: [{ title: 'B', url: 'https://b.com', snippet: 'B' }], error: null });

    const { webSearch } = await import('../webResearchService');
    const [r1, r2] = await Promise.all([webSearch('requête A', 1), webSearch('requête B', 1)]);

    expect(r1.content![0].title).toBe('A');
    expect(r2.content![0].title).toBe('B');
    expect(safeInvokeCanonicalMock).toHaveBeenCalledTimes(2);
  });

  it('requête vide en mode Tauri est passée telle quelle', async () => {
    isTauriAvailableMock.mockReturnValue(true);
    safeInvokeCanonicalMock.mockResolvedValueOnce({ ok: true, content: [], error: null });

    const { webSearch } = await import('../webResearchService');
    await webSearch('', 5);

    expect(safeInvokeCanonicalMock).toHaveBeenCalledWith('web_search', { query: '', max_results: 5 });
  });

  it('requête vide en mode browser encode srsearch= sans erreur', async () => {
    isTauriAvailableMock.mockReturnValue(false);
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { webSearch } = await import('../webResearchService');
    await webSearch('', 5);

    const calledUrl = (fetchMock.mock.calls[0] as [string, unknown])[0];
    expect(calledUrl).toContain('srsearch=');
    expect(calledUrl).toContain('srlimit=5');
  });

  it('requête très longue (1000 chars) envoyée sans erreur', async () => {
    isTauriAvailableMock.mockReturnValue(false);
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('a'.repeat(1000), 5);

    expect(result).toBeDefined();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('Unicode japonais est encodé en URL', async () => {
    isTauriAvailableMock.mockReturnValue(false);
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { webSearch } = await import('../webResearchService');
    await webSearch('人工知能', 5);

    const calledUrl = (fetchMock.mock.calls[0] as [string, unknown])[0];
    expect(calledUrl).toContain('%E4%BA%BA');
  });

  it('Unicode arabe est encodé (pas de caractères raw dans URL)', async () => {
    isTauriAvailableMock.mockReturnValue(false);
    fetchMock.mockResolvedValueOnce(makeFetchSuccess(makeWikiJson([])));

    const { webSearch } = await import('../webResearchService');
    await webSearch('ذكاء اصطناعي', 5);

    const calledUrl = (fetchMock.mock.calls[0] as [string, unknown])[0];
    expect(calledUrl).not.toContain('ذكاء');
    expect(calledUrl).toContain('srsearch=');
  });

  it('bascule Tauri→browser automatiquement selon isTauriAvailable()', async () => {
    isTauriAvailableMock.mockReturnValueOnce(true);
    safeInvokeCanonicalMock.mockResolvedValueOnce({
      ok: true, content: [{ title: 'Tauri', url: 'https://t.com', snippet: '' }], error: null,
    });

    isTauriAvailableMock.mockReturnValueOnce(false);
    fetchMock.mockResolvedValueOnce(
      makeFetchSuccess(makeWikiJson([{ title: 'Browser', snippet: '' }]))
    );

    const { webSearch } = await import('../webResearchService');
    const r1 = await webSearch('test tauri', 1);
    const r2 = await webSearch('test browser', 1);

    expect(r1.content![0].title).toBe('Tauri');
    expect(r2.content![0].title).toBe('Browser');
    expect(safeInvokeCanonicalMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. Contrat de réponse WebSearchResponse
// ═══════════════════════════════════════════════════════════════════

describe('webSearch — contrat de réponse WebSearchResponse', () => {
  beforeEach(() => {
    isTauriAvailableMock.mockReturnValue(true);
    safeInvokeCanonicalMock.mockReset();
  });

  it('réponse success: ok:true, content:array, error:null', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({
      ok: true,
      content: [{ title: 'T', url: 'https://x.com', snippet: 'S' }],
      error: null,
    });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('contrat success');

    expect(result.ok).toBe(true);
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.error).toBeNull();
    expect(typeof result.ok).toBe('boolean');
  });

  it('réponse error: ok:false, content:null, error.code + error.message', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({
      ok: false,
      content: null,
      error: { code: 'SEARXNG_TIMEOUT', message: 'Connexion expirée' },
    });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('contrat erreur');

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('SEARXNG_TIMEOUT');
    expect(typeof result.error?.message).toBe('string');
  });

  it('chaque WebSearchResult a title, url, snippet (tous string)', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({
      ok: true,
      content: [{ title: 'Test Article', url: 'https://example.com', snippet: 'Un snippet.' }],
      error: null,
    });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('structure');

    const item = result.content![0];
    expect(typeof item.title).toBe('string');
    expect(typeof item.url).toBe('string');
    expect(typeof item.snippet).toBe('string');
  });

  it('ok:false implique toujours content:null', async () => {
    safeInvokeCanonicalMock.mockResolvedValueOnce({
      ok: false, content: null, error: { code: 'ERR', message: 'fail' },
    });

    const { webSearch } = await import('../webResearchService');
    const result = await webSearch('cohérence');

    if (!result.ok) {
      expect(result.content).toBeNull();
    }
  });
});

