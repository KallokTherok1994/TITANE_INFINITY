/**
 * Tests HTFPage — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HTFPage } from '@/pages/HTFPage';

vi.mock('@/stores/useHTFStore', () => {
  const mockStore = { submissions: [], loadAll: vi.fn(), activeEstimation: null };
  const fn = vi.fn((selector?: (s: typeof mockStore) => unknown) =>
    selector ? selector(mockStore) : mockStore
  );
  return { useHTFStore: fn };
});

vi.mock('@/components/htf/HTFDashboard', () => ({
  HTFDashboard: () => <div data-testid="htf-dashboard-mock" />,
}));
vi.mock('@/components/htf/HTFSubmissionWizard', () => ({
  HTFSubmissionWizard: () => <div />,
}));
vi.mock('@/components/htf/HTFClientPanel', () => ({ HTFClientPanel: () => <div /> }));
vi.mock('@/components/htf/HTFEstimationResult', () => ({
  HTFEstimationResult: () => <div />,
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi
    .fn()
    .mockResolvedValue({ ok: false, content: null, error: null }),
  safeInvoke: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

vi.mock('@/services/htf/installHtfSkill', () => ({
  installHtfSkillIfAbsent: vi.fn().mockResolvedValue(undefined),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <HTFPage />
    </MemoryRouter>
  );
}

describe('HTFPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('htf-module-page')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant when no submissions', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
