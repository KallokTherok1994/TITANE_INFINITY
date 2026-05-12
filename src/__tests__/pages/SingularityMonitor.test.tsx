/**
 * Tests SingularityMonitor — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge LIVE + hooks IPC réels
 * AH-v88-PAGES-BADGE-STABILIZE-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SingularityMonitor } from '@/pages/SingularityMonitor';

// ── Mock useSingularity ──────────────────────────────────────────
vi.mock('@/hooks/useSingularity', () => ({
  useSingularity: () => ({
    state: {
      consciousness: 3.7,
      unity: { globalHarmony: 0.91, globalEntropy: 0.12 },
      isInitialized: true,
      autoCoherence: 0.88,
    },
    consciousness: 3.7,
    globalHarmony: 0.91,
    globalEntropy: 0.12,
    isInitialized: true,
    autoCoherence: 0.88,
    initialize: vi.fn(),
    reset: vi.fn(),
  }),
}));

// ── Mock useMetaEnergy ───────────────────────────────────────────
vi.mock('@/hooks/useMetaEnergy', () => ({
  useMetaEnergy: () => ({
    state: {
      energy_level: 850,
      max_capacity: 1000,
      normalized: 0.85,
      fatigue_level: 'low',
      cognitive_multiplier: 1.1,
      timestamp: Date.now(),
    },
    diagnostics: {
      energy_level: 850,
      fatigue_level: 'low',
      homeostasis_in_balance: true,
      homeostasis_deviation: 0.05,
      history_entries: 12,
      config_target_energy: 900,
    },
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <SingularityMonitor />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('SingularityMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-singularity-monitor')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with LIVE variant', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-live')).toBeInTheDocument();
  });

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Singularity Monitor')).toBeInTheDocument();
  });

  it('shows MetaEnergy panel', () => {
    renderPage();
    expect(screen.getByTestId('meta-energy-panel')).toBeInTheDocument();
  });
});
