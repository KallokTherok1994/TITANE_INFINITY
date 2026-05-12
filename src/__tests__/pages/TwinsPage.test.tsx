/**
 * Tests TwinsPage — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge PARTIAL + page container landmark
 * AH-v89-RULE16-ENGINE-PAGES-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TwinsPage } from '@/pages/TwinsPage';

// ── Mock useTwinIdentity ─────────────────────────────────────────
vi.mock('../hooks/useTwinIdentity', () => ({
  useTwinIdentity: () => ({
    identity: null,
    isLoading: false,
    coreValues: [],
    humanStyle: null,
    fusionIndex: 0,
  }),
}));

// ── Mock useTwinEvolution ────────────────────────────────────────
vi.mock('../hooks/useTwinEvolution', () => ({
  useTwinEvolution: () => ({
    evolutionProfile: null,
    isLoading: false,
    recalculateFusion: vi.fn(),
    transitionPhase: vi.fn(),
    reinforceValue: vi.fn(),
    adjustTrait: vi.fn(),
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <TwinsPage />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('TwinsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-twins')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
