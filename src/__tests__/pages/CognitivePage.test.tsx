/**
 * Tests CognitivePage — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge (PARTIAL — static data)
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CognitivePage } from '@/pages/CognitivePage';

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi
    .fn()
    .mockResolvedValue({ ok: false, content: null, error: null }),
  safeInvoke: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

vi.mock('@features/cognitive', () => ({
  HeliosVisualization: () => <div data-testid="helios-viz" />,
  NexusGraph: () => <div data-testid="nexus-graph" />,
  HarmoniaPatterns: () => <div data-testid="harmonia-patterns" />,
  MemoryTimeline: () => <div data-testid="memory-timeline" />,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CognitivePage />
    </MemoryRouter>
  );
}

describe('CognitivePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-cognitive')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant (static data)', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });

  it('renders cognitive page title', () => {
    renderPage();
    expect(screen.getByText('État Cognitif')).toBeInTheDocument();
  });
});
