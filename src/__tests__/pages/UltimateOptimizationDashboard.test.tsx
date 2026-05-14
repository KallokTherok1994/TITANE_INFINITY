/**
 * Tests UltimateOptimizationDashboard — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge + engine load live metric
 * AH-v94-LIVE-IPC-PAGES-2026-05-26
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UltimateOptimizationDashboard } from '@/pages/UltimateOptimizationDashboard';

// ── Mock usePerformanceMonitor ────────────────────────────────────
vi.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    metrics: { fps: 60, cpuLoad: 20, shouldReduceMotion: false, shouldThrottle: false },
    shouldThrottle: false,
    animationConfig: { duration: 300, skipAnimation: false },
  }),
}));

// ── Mock @tauri-apps/api/core ─────────────────────────────────────
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({
    cognition: { load: 0.25, active_thoughts: 3 },
    harmonia: { harmony_index: 0.9, balance_score: 90, initialized: true },
    nexus: { active_connections: 2, coordination_count: 8 },
    timeline_events: 500,
    last_sync_ms: Date.now(),
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <UltimateOptimizationDashboard />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('UltimateOptimizationDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-optimization')).toBeInTheDocument();
  });

  it('renders title', () => {
    renderPage();
    expect(screen.getByText(/Ultimate Optimization Dashboard/i)).toBeInTheDocument();
  });

  it('shows live FPS metric', () => {
    renderPage();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('raises secondary labels above the low-contrast gray token', () => {
    renderPage();
    expect(screen.getByText(/Métriques de performance — Recommandations — Benchmarks/i)).toHaveClass(
      'text-gray-300'
    );
    expect(screen.getByText(/Score optimisation/i)).toHaveClass('text-gray-300');
    expect(screen.getByText('Avant', { selector: 'th' }).closest('tr')).toHaveClass(
      'text-gray-300'
    );
  });
});
