/**
 * Tests MultiProjectDashboard — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MultiProjectDashboard from '@/pages/MultiProjectDashboard';
import * as multiprojectService from '@/services/multiproject';

vi.mock('@/services/multiproject', () => ({
  getMultiProjectRollup: vi.fn().mockReturnValue(null),
  getMultiProjectAgentStatus: vi.fn().mockReturnValue({
    id: 'multiproject',
    title: 'Multi-Project Management Agent',
    summary: 'Test summary',
    testId: 'multiproject-dashboard',
    readiness: 'planned',
    readinessLabel: 'PLANNED',
    serviceState: 'Registry empty',
    evidence: [],
    blockers: [],
    nextStep: 'Create a project.',
  }),
  createProject: vi.fn().mockReturnValue(null),
  deleteProject: vi.fn().mockReturnValue(true),
  archiveProject: vi.fn().mockReturnValue(true),
  listProjects: vi.fn().mockReturnValue([]),
  assignAgentToProject: vi.fn().mockReturnValue(null),
  refreshProjectHealth: vi.fn().mockResolvedValue(null),
  resetMultiProjectRegistryForTests: vi.fn(),
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi
    .fn()
    .mockResolvedValue({ ok: false, content: null, error: null }),
  safeInvoke: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <MultiProjectDashboard />
    </MemoryRouter>
  );
}

describe('MultiProjectDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('multiproject-dashboard')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant when rollup is null', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });

  it('keeps empty state and evidence text above the low-contrast slate token', () => {
    vi.mocked(multiprojectService.getMultiProjectAgentStatus).mockReturnValueOnce({
      id: 'multiproject',
      title: 'Multi-Project Management Agent',
      summary: 'Test summary',
      testId: 'multiproject-dashboard',
      readiness: 'planned',
      readinessLabel: 'PLANNED',
      serviceState: 'Registry empty',
      evidence: ['Synchronisation registry ready'],
      blockers: [],
      nextStep: 'Create a project.',
    });

    renderPage();

    expect(screen.getByText(/Aucun projet actif/i)).toHaveClass('text-titanium-text-secondary');
    expect(screen.getByText(/Synchronisation registry ready/i).closest('ul')).toHaveClass(
      'text-titanium-text-secondary'
    );
  });
});
