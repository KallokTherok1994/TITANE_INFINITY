/**
 * Tests OrchestrationMetaCenter — Rule 16 coverage
 * Smoke render + page container landmark
 * AH-v89-RULE16-ENGINE-PAGES-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OrchestrationMetaCenter } from '@/pages/OrchestrationMetaCenter';

// ── Mock useIdentityMatrix ───────────────────────────────────────
vi.mock('@/hooks/useIdentityMatrix', () => ({
  useIdentityMatrix: () => ({
    matrix: null,
    isLoaded: false,
    isFallback: false,
    loading: true,
    error: null,
  }),
}));

// ── Mock useSingularityStateSafe ─────────────────────────────────
vi.mock('@/hooks/useSingularityStateSafe', () => ({
  useSingularityStateSafe: () => null,
  useEngineData: () => null,
  useEngineState: () => null,
  useViewMode: () => ['list', vi.fn()],
  useStatusSummary: () => [null, null, false],
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <OrchestrationMetaCenter />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('OrchestrationMetaCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-orchestration-meta-center')).toBeInTheDocument();
  });
});
