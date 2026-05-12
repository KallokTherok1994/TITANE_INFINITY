/**
 * Tests CreationStudio — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge DISPLAY_ONLY (UI 100% statique)
 * AH-v88-PAGES-BADGE-STABILIZE-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreationStudio } from '@/pages/CreationStudio';

// ── Tests ────────────────────────────────────────────────────────
describe('CreationStudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    render(
      <MemoryRouter>
        <CreationStudio />
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-creation-studio')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with DISPLAY_ONLY variant', () => {
    render(
      <MemoryRouter>
        <CreationStudio />
      </MemoryRouter>
    );
    expect(screen.getByTestId('surface-truth-badge-display_only')).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(
      <MemoryRouter>
        <CreationStudio />
      </MemoryRouter>
    );
    expect(screen.getByText('Creation Studio')).toBeInTheDocument();
  });
});
