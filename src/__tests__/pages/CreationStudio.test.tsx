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

  it('keeps creation meta labels above low-contrast tokens', () => {
    render(
      <MemoryRouter>
        <CreationStudio />
      </MemoryRouter>
    );

    const toolsLabel = screen.getByText('Outils de création');
    expect(toolsLabel).toHaveClass('text-titanium-text-secondary');
    expect(toolsLabel).not.toHaveClass('text-gray-500');

    const activeRow = screen.getByText('Studio actif').parentElement;
    expect(activeRow).not.toBeNull();
    expect(activeRow).toHaveClass('text-titanium-text-secondary');

    const statsLabel = screen.getByText('Statistiques');
    expect(statsLabel).toHaveClass('text-titanium-text-secondary');
    expect(statsLabel).not.toHaveClass('text-gray-500');
  });
});
