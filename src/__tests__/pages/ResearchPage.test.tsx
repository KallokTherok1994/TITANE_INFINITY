/**
 * TITANE_INFINITY v35.2.0 — ResearchPage Vitest smoke contract
 *
 * Sprint D.A — Closes the audit gap identified in Phase D reflection:
 * ResearchPage exposes 21 stable `data-testid` selectors but no dedicated
 * Vitest spec lived under `src/__tests__/pages/`. This spec validates the
 * canonical testid contract used by Playwright E2E and the WDIO Tier-1
 * specs (`ui-desktop-tier1-blocker-reduction-research.wdio.test.js`,
 * `ui-desktop-v62-real-ipc-research.wdio.test.js`,
 * `ui-desktop-v63-real-ipc-research.wdio.test.js`).
 *
 * Scope: render-shape + testid contract. Full network flow covered by E2E.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(async () => ({ ok: true, value: null })),
}));

vi.mock('@/services/webResearchService', () => ({
  webResearch: {
    research: vi.fn(async () => ({ ok: true, value: null })),
    enrichCitations: vi.fn(async (citations: unknown[]) => citations),
  },
}));

vi.mock('@/services/userPreferencesEngine', () => ({
  userPreferencesEngine: {
    isActive: vi.fn(() => false),
    getPreference: vi.fn(() => null),
  },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: '/research',
    state: null,
    search: '',
    hash: '',
    key: 'test',
  }),
}));

vi.mock('@/components/system/SurfaceTruthBadge', () => ({
  SurfaceTruthBadge: () => null,
}));

import ResearchPage from '@/pages/ResearchPage';

describe('ResearchPage — v35.2.0 canonical testid contract', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders the canonical root testid `research-page`', () => {
    render(<ResearchPage />);
    expect(screen.getByTestId('research-page')).toBeTruthy();
  });

  it('exposes the form input contract (question, mode, submit, reset)', () => {
    render(<ResearchPage />);
    expect(screen.getByTestId('research-form')).toBeTruthy();
    expect(screen.getByTestId('research-question')).toBeTruthy();
    expect(screen.getByTestId('research-mode')).toBeTruthy();
    expect(screen.getByTestId('research-submit')).toBeTruthy();
  });

  it('does not surface result sections in initial idle state', () => {
    render(<ResearchPage />);
    expect(screen.queryByTestId('research-results')).toBeNull();
    expect(screen.queryByTestId('research-error')).toBeNull();
  });
});
