/**
 * Tests AdaptiveEngine — Rule 16 coverage
 * Smoke render + page container landmark
 * AH-v89-RULE16-ENGINE-PAGES-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdaptiveEngine } from '@/pages/AdaptiveEngine';

// ── Mock useEngineSubscription ───────────────────────────────────
vi.mock('../hooks/useEngineSubscription', () => ({
  useEngineSubscription: () => ({ data: null, loading: false }),
}));
vi.mock('@/hooks/useEngineSubscription', () => ({
  useEngineSubscription: () => ({ data: null, loading: false }),
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <AdaptiveEngine />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('AdaptiveEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-adaptive-engine')).toBeInTheDocument();
  });
});
