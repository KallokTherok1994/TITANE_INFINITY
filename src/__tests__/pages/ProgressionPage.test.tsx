/**
 * Tests ProgressionPage — Rule 16 coverage (AH-v99 Phase 7.D)
 * Render + SurfaceTruthBadge ajouté
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockExperience = {
  totalXp: 1500,
  level: 4,
  xpForNextLevel: 2500,
  domains: [],
  isLoading: false,
};

vi.mock('@/hooks/useExperience', () => ({
  useExperience: () => mockExperience,
}));

vi.mock('@features/progression', () => ({
  XPProgressBar: () => <div data-testid="xp-progress-bar" />,
}));

vi.mock('@/components/progression/KnowledgeDomains', () => ({
  KnowledgeDomains: () => <div data-testid="knowledge-domains" />,
}));

vi.mock('@/components/AgentDashboardsPanel', () => ({
  default: () => <div data-testid="agent-dashboards-panel" />,
}));

import { ProgressionPage } from '@/pages/ProgressionPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <ProgressionPage />
    </MemoryRouter>
  );
}

describe('ProgressionPage (Phase 7.D — badge added)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExperience.isLoading = false;
    mockExperience.level = 4;
  });

  it('renders the page container with test id', () => {
    renderPage();
    expect(screen.getByTestId('page-progression')).toBeInTheDocument();
  });

  it('shows LIVE badge when experience loaded and level > 0', () => {
    mockExperience.isLoading = false;
    mockExperience.level = 4;
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-live')).toBeInTheDocument();
  });

  it('shows PARTIAL badge when experience loaded but level is 0', () => {
    mockExperience.isLoading = false;
    mockExperience.level = 0;
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
