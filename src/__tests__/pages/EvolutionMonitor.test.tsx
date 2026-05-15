/**
 * Tests EvolutionMonitor — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge + store live values
 * AH-v88-PAGES-BADGE-STABILIZE-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EvolutionMonitor } from '@/pages/EvolutionMonitor';

// ── Mock store Zustand ───────────────────────────────────────────
vi.mock('@/stores/evolutionStore', () => ({
  useEvolutionStore: () => ({
    state: {
      total_evolutions: 42,
      last_evolution: {
        health_score: 0.87,
        timestamp: Date.now(),
      },
    },
    lastReport: null,
    health: 'healthy',
    running: false,
    loading: false,
    error: null,
    fetchState: vi.fn(),
    runEvolution: vi.fn(),
    quickHealthCheck: vi.fn(),
    reset: vi.fn(),
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <EvolutionMonitor />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('EvolutionMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-evolution-monitor')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Evolution Monitor')).toBeInTheDocument();
  });

  it('keeps evolution meta labels above low-contrast tokens', () => {
    renderPage();

    expect(screen.getAllByText(/sur \d+ versions/i)[0]).toHaveClass('text-gray-300');
    expect(screen.getByText('Cycles')).toHaveClass('text-gray-300');
    expect(screen.getByText('Version')).toHaveClass('text-gray-300');
  });
});
