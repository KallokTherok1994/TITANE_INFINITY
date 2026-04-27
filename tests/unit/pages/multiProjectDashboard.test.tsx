/**
 * TITANE∞ — MultiProjectDashboard unit tests
 * Rule 16: new UI page requires Vitest + data-testid tests.
 * Covers: initial render, rollup display, project list, create form,
 *         archive/delete actions, health refresh.
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ─────────────────────────────────────────────
const mockListProjects = vi.hoisted(() => vi.fn(() => []));
const mockGetMultiProjectRollup = vi.hoisted(() =>
  vi.fn(() => ({
    total: 0,
    active: 0,
    paused: 0,
    archived: 0,
    blocked: 0,
    healthyCount: 0,
    failingCount: 0,
    computedAt: new Date().toISOString(),
  }))
);
const mockGetMultiProjectAgentStatus = vi.hoisted(() =>
  vi.fn(() => ({
    id: 'multiproject' as const,
    title: 'Multi-Project Management Agent',
    summary: 'Manages projects',
    testId: 'multiproject-dashboard',
    readiness: 'planned' as const,
    readinessLabel: 'PLANNED',
    serviceState: 'Registry empty',
    evidence: ['CRUD implemented'],
    blockers: ['No projects yet'],
    nextStep: 'Create a project',
  }))
);
const mockCreateProject = vi.hoisted(() => vi.fn());
const mockArchiveProject = vi.hoisted(() => vi.fn(() => true));
const mockDeleteProject = vi.hoisted(() => vi.fn(() => true));
const mockRefreshProjectHealth = vi.hoisted(() => vi.fn());
const mockResetRegistry = vi.hoisted(() => vi.fn());

vi.mock('@/services/multiproject', () => ({
  listProjects: mockListProjects,
  getMultiProjectRollup: mockGetMultiProjectRollup,
  getMultiProjectAgentStatus: mockGetMultiProjectAgentStatus,
  createProject: mockCreateProject,
  archiveProject: mockArchiveProject,
  deleteProject: mockDeleteProject,
  refreshProjectHealth: mockRefreshProjectHealth,
  resetMultiProjectRegistryForTests: mockResetRegistry,
}));

// ── Import under test ─────────────────────────────────────────
import MultiProjectDashboard from '@/pages/MultiProjectDashboard';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_FIXTURE = {
  id: 'proj-test-001',
  name: 'Projet Alpha',
  description: 'Test de gestion multi-projet',
  status: 'active' as const,
  priority: 3,
  tags: ['IA', 'test'],
  resources: [],
  dependsOn: [],
  healthSnapshot: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const PROJECT_WITH_HEALTH = {
  ...PROJECT_FIXTURE,
  id: 'proj-test-002',
  name: 'Projet Beta',
  healthSnapshot: {
    verdict: 'PASS' as const,
    verdicts: { monitoring: 'PASS' },
    blockers: [],
    computedAt: new Date().toISOString(),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('MultiProjectDashboard — initial render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListProjects.mockReturnValue([]);
  });

  it('renders root with data-testid=multiproject-dashboard', () => {
    render(<MultiProjectDashboard />);
    expect(screen.getByTestId('multiproject-dashboard')).toBeDefined();
  });

  it('renders the page title', () => {
    render(<MultiProjectDashboard />);
    expect(screen.getByText('Gestion Multi-Projets')).toBeDefined();
  });

  it('renders rollup card with data-testid=multiproject-rollup', () => {
    render(<MultiProjectDashboard />);
    expect(screen.getByTestId('multiproject-rollup')).toBeDefined();
  });

  it('renders agent status card with data-testid=multiproject-agent-status', () => {
    render(<MultiProjectDashboard />);
    expect(screen.getByTestId('multiproject-agent-status')).toBeDefined();
  });

  it('renders project list container with data-testid=multiproject-project-list', () => {
    render(<MultiProjectDashboard />);
    expect(screen.getByTestId('multiproject-project-list')).toBeDefined();
  });

  it('shows empty state message when no projects', () => {
    render(<MultiProjectDashboard />);
    expect(screen.getByText(/aucun projet actif/i)).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rollup display
// ─────────────────────────────────────────────────────────────────────────────

describe('MultiProjectDashboard — rollup display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays total count from rollup', () => {
    mockGetMultiProjectRollup.mockReturnValue({
      total: 7,
      active: 5,
      paused: 0,
      archived: 2,
      blocked: 0,
      healthyCount: 3,
      failingCount: 1,
      computedAt: new Date().toISOString(),
    });
    mockListProjects.mockReturnValue([]);
    render(<MultiProjectDashboard />);
    const rollup = screen.getByTestId('multiproject-rollup');
    expect(rollup.textContent).toContain('7');
  });

  it('displays active count from rollup', () => {
    mockGetMultiProjectRollup.mockReturnValue({
      total: 5,
      active: 4,
      paused: 0,
      archived: 1,
      blocked: 0,
      healthyCount: 2,
      failingCount: 0,
      computedAt: new Date().toISOString(),
    });
    mockListProjects.mockReturnValue([]);
    render(<MultiProjectDashboard />);
    const rollup = screen.getByTestId('multiproject-rollup');
    expect(rollup.textContent).toContain('4');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Agent status display
// ─────────────────────────────────────────────────────────────────────────────

describe('MultiProjectDashboard — agent status', () => {
  beforeEach(() => vi.clearAllMocks());

  it('displays agent title', () => {
    mockListProjects.mockReturnValue([]);
    render(<MultiProjectDashboard />);
    expect(screen.getByText('Multi-Project Management Agent')).toBeDefined();
  });

  it('displays PLANNED readiness label when no projects', () => {
    mockListProjects.mockReturnValue([]);
    render(<MultiProjectDashboard />);
    expect(screen.getByTestId('multiproject-agent-status').textContent).toContain(
      'PLANNED'
    );
  });

  it('displays evidence from agent status', () => {
    mockGetMultiProjectAgentStatus.mockReturnValue({
      id: 'multiproject' as const,
      title: 'Multi-Project Management Agent',
      summary: '',
      testId: 'multiproject-dashboard',
      readiness: 'qualified' as const,
      readinessLabel: 'QUALIFIED',
      serviceState: '3 projets actifs',
      evidence: ['Preuve clé disponible'],
      blockers: [],
      nextStep: 'Étendre la persistence',
    });
    mockListProjects.mockReturnValue([]);
    render(<MultiProjectDashboard />);
    expect(screen.getByTestId('multiproject-agent-status').textContent).toContain(
      'Preuve clé disponible'
    );
  });

  it('displays blockers when present', () => {
    mockGetMultiProjectAgentStatus.mockReturnValue({
      id: 'multiproject' as const,
      title: 'Multi-Project Management Agent',
      summary: '',
      testId: 'multiproject-dashboard',
      readiness: 'planned' as const,
      readinessLabel: 'PLANNED',
      serviceState: 'Registry empty',
      evidence: [],
      blockers: ['No active projects in registry'],
      nextStep: 'Create a project',
    });
    mockListProjects.mockReturnValue([]);
    render(<MultiProjectDashboard />);
    expect(screen.getByTestId('multiproject-agent-status').textContent).toContain(
      'No active projects in registry'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Project list
// ─────────────────────────────────────────────────────────────────────────────

describe('MultiProjectDashboard — project list', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders project card with correct data-testid', () => {
    mockListProjects.mockReturnValue([PROJECT_FIXTURE]);
    render(<MultiProjectDashboard />);
    expect(
      screen.getByTestId(`multiproject-project-card-${PROJECT_FIXTURE.id}`)
    ).toBeDefined();
  });

  it('displays project name in card', () => {
    mockListProjects.mockReturnValue([PROJECT_FIXTURE]);
    render(<MultiProjectDashboard />);
    expect(screen.getByText('Projet Alpha')).toBeDefined();
  });

  it('displays project tags', () => {
    mockListProjects.mockReturnValue([PROJECT_FIXTURE]);
    render(<MultiProjectDashboard />);
    expect(screen.getByText('IA')).toBeDefined();
    expect(screen.getByText('test')).toBeDefined();
  });

  it('displays health badge with PASS verdict when snapshot exists', () => {
    mockListProjects.mockReturnValue([PROJECT_WITH_HEALTH]);
    render(<MultiProjectDashboard />);
    const badge = screen.getByTestId(
      `multiproject-health-badge-${PROJECT_WITH_HEALTH.id}`
    );
    expect(badge.textContent).toBe('PASS');
  });

  it('displays dash for missing health snapshot', () => {
    mockListProjects.mockReturnValue([PROJECT_FIXTURE]);
    render(<MultiProjectDashboard />);
    const badge = screen.getByTestId(`multiproject-health-badge-${PROJECT_FIXTURE.id}`);
    expect(badge.textContent).toBe('—');
  });

  it('renders multiple project cards', () => {
    const p2 = { ...PROJECT_FIXTURE, id: 'proj-002', name: 'Projet Beta' };
    mockListProjects.mockReturnValue([PROJECT_FIXTURE, p2]);
    render(<MultiProjectDashboard />);
    expect(screen.getByTestId('multiproject-project-card-proj-test-001')).toBeDefined();
    expect(screen.getByTestId('multiproject-project-card-proj-002')).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Create form
// ─────────────────────────────────────────────────────────────────────────────

describe('MultiProjectDashboard — create form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListProjects.mockReturnValue([]);
  });

  it('shows "Nouveau projet" button initially', () => {
    render(<MultiProjectDashboard />);
    expect(screen.getByText('Nouveau projet')).toBeDefined();
  });

  it('shows form when "Nouveau projet" is clicked', async () => {
    render(<MultiProjectDashboard />);
    const btn = screen.getByText('Nouveau projet');
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(screen.getByTestId('multiproject-create-form')).toBeDefined();
  });

  it('calls createProject on form submit', async () => {
    const newProject = { ...PROJECT_FIXTURE, id: 'proj-new-001', name: 'Nouveau' };
    mockCreateProject.mockReturnValue(newProject);
    mockListProjects.mockReturnValue([newProject]);

    render(<MultiProjectDashboard />);
    await act(async () => {
      fireEvent.click(screen.getByText('Nouveau projet'));
    });

    const nameInput = screen.getByLabelText(/Nom \*/i);
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Nouveau' } });
    });

    const submitBtn = screen.getByTestId('multiproject-create-submit');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockCreateProject).toHaveBeenCalledOnce();
    const callArg = mockCreateProject.mock.calls[0][0];
    expect(callArg.name).toBe('Nouveau');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Actions: archive, delete, refresh health
// ─────────────────────────────────────────────────────────────────────────────

describe('MultiProjectDashboard — project actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListProjects.mockReturnValue([PROJECT_FIXTURE]);
    mockRefreshProjectHealth.mockResolvedValue({
      verdict: 'PASS',
      verdicts: {},
      blockers: [],
      computedAt: new Date().toISOString(),
    });
  });

  it('calls archiveProject when Archive button clicked', async () => {
    render(<MultiProjectDashboard />);
    const archiveBtn = screen.getByLabelText(
      `Archiver le projet ${PROJECT_FIXTURE.name}`
    );
    await act(async () => {
      fireEvent.click(archiveBtn);
    });
    expect(mockArchiveProject).toHaveBeenCalledWith(PROJECT_FIXTURE.id);
  });

  it('calls deleteProject when Delete button clicked', async () => {
    render(<MultiProjectDashboard />);
    const deleteBtn = screen.getByLabelText(
      `Supprimer le projet ${PROJECT_FIXTURE.name}`
    );
    await act(async () => {
      fireEvent.click(deleteBtn);
    });
    expect(mockDeleteProject).toHaveBeenCalledWith(PROJECT_FIXTURE.id);
  });

  it('calls refreshProjectHealth when Santé button clicked', async () => {
    render(<MultiProjectDashboard />);
    const healthBtn = screen.getByLabelText(
      `Rafraîchir la santé du projet ${PROJECT_FIXTURE.name}`
    );
    await act(async () => {
      fireEvent.click(healthBtn);
    });
    await waitFor(() => {
      expect(mockRefreshProjectHealth).toHaveBeenCalledWith(PROJECT_FIXTURE.id);
    });
  });
});
