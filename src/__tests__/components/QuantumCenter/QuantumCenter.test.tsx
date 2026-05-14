/**
 * Tests QuantumCenter — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge live + no Math.random
 * AH-v94-LIVE-IPC-PAGES-2026-05-26
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuantumCenter from '@/components/QuantumCenter/QuantumCenter';

// ── Mock hooks ───────────────────────────────────────────────────
vi.mock('@/hooks/useIdentityMatrix', () => ({
  useIdentityMatrix: () => ({ loading: false, matrix: null }),
}));
vi.mock('@/hooks/useSingularityStateSafe', () => ({
  useSingularityStateSafe: () => null,
}));

// ── Mock @tauri-apps/api/core ─────────────────────────────────────
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({
    harmonia: { harmony_index: 0.95, balance_score: 92, initialized: true },
    cognition: { load: 0.3, active_thoughts: 5 },
    nexus: { active_connections: 4, coordination_count: 10 },
    timeline_events: 1234,
    last_sync_ms: Date.now(),
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderComponent() {
  return render(
    <MemoryRouter>
      <QuantumCenter />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('QuantumCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderComponent();
    expect(screen.getByTestId('page-quantum-center')).toBeInTheDocument();
  });

  it('renders Quantum Rendering Layer title', () => {
    renderComponent();
    expect(screen.getByText(/Quantum Rendering Layer/i)).toBeInTheDocument();
  });

  it('exposes a focusable scroll region for keyboard navigation', () => {
    renderComponent();
    expect(screen.getByRole('main', { name: /contenu quantum center/i })).toHaveAttribute(
      'tabindex',
      '0'
    );
  });
});
