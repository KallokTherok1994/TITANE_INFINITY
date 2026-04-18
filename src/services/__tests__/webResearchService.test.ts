import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ResearchReport } from '../../types/research';

const tauriMock = vi.fn();
const windowRecord = window as unknown as Record<string, unknown>;

vi.mock('@/api/tauriClient', () => ({
  tauri: (...args: unknown[]) => tauriMock(...args),
}));

describe('webResearchService', () => {
  beforeEach(() => {
    tauriMock.mockReset();
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
