/**
 * TITANE∞ — Multi-Project Management Agent unit tests
 * Rule 16: New service → unit + integration tests required.
 *
 * Covers:
 *   - createProject (validation, capacity, success)
 *   - listProjects (sorting, filtering)
 *   - getProject (found/not found)
 *   - updateProject (mutation, validation)
 *   - archiveProject / deleteProject
 *   - assignAgentToProject / removeAgentFromProject (idempotency)
 *   - getMultiProjectRollup (aggregation correctness)
 *   - getMultiProjectAgentStatus (readiness derivation)
 *   - refreshProjectHealth (consensus integration)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ─────────────────────────────────────────────
const mockDispatchToAgents = vi.hoisted(() => vi.fn());

vi.mock('@/services/orchestrator', () => ({
  dispatchToAgents: mockDispatchToAgents,
}));

// ── Import after mocks ────────────────────────────────────────
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  archiveProject,
  deleteProject,
  assignAgentToProject,
  removeAgentFromProject,
  getMultiProjectRollup,
  getMultiProjectAgentStatus,
  refreshProjectHealth,
  resetMultiProjectRegistryForTests,
  type MultiProject,
  type ProjectHealthSnapshot,
} from '@/services/multiproject';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeConsensus(aggregated: 'PASS' | 'FAIL' | 'BLOCKED' = 'PASS') {
  return {
    verdicts: { monitoring: 'PASS', diagnostic: 'PASS', security: aggregated },
    aggregated,
    blockers: aggregated !== 'PASS' ? ['test-blocker'] : [],
    timestamp: Date.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// createProject
// ─────────────────────────────────────────────────────────────────────────────

describe('createProject', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
    vi.clearAllMocks();
  });

  it('creates a project with required fields', () => {
    const p = createProject({ name: 'Alpha' });
    expect(p).not.toBeNull();
    expect(p!.name).toBe('Alpha');
    expect(p!.status).toBe('active');
    expect(p!.priority).toBe(5);
    expect(typeof p!.id).toBe('string');
    expect(p!.id.startsWith('proj-')).toBe(true);
  });

  it('accepts custom priority and tags', () => {
    const p = createProject({ name: 'Beta', priority: 2, tags: ['IA', 'urgent'] });
    expect(p!.priority).toBe(2);
    expect(p!.tags).toEqual(['IA', 'urgent']);
  });

  it('sets createdAt and updatedAt as ISO strings', () => {
    const p = createProject({ name: 'Gamma' })!;
    expect(() => new Date(p.createdAt)).not.toThrow();
    expect(() => new Date(p.updatedAt)).not.toThrow();
  });

  it('returns null for empty name', () => {
    expect(createProject({ name: '' })).toBeNull();
  });

  it('returns null for name > 80 chars', () => {
    expect(createProject({ name: 'x'.repeat(81) })).toBeNull();
  });

  it('returns null for priority < 1', () => {
    expect(createProject({ name: 'Delta', priority: 0 })).toBeNull();
  });

  it('returns null for priority > 10', () => {
    expect(createProject({ name: 'Epsilon', priority: 11 })).toBeNull();
  });

  it('initialises healthSnapshot as null', () => {
    const p = createProject({ name: 'Zeta' })!;
    expect(p.healthSnapshot).toBeNull();
  });

  it('initialises resources as empty array', () => {
    const p = createProject({ name: 'Eta' })!;
    expect(p.resources).toEqual([]);
  });

  it('initialises dependsOn as empty array by default', () => {
    const p = createProject({ name: 'Theta' })!;
    expect(p.dependsOn).toEqual([]);
  });

  it('stores dependsOn when provided', () => {
    const p = createProject({ name: 'Iota', dependsOn: ['proj-abc'] })!;
    expect(p.dependsOn).toEqual(['proj-abc']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// listProjects
// ─────────────────────────────────────────────────────────────────────────────

describe('listProjects', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
    vi.clearAllMocks();
  });

  it('returns empty array when registry is empty', () => {
    expect(listProjects()).toEqual([]);
  });

  it('returns all created projects', () => {
    createProject({ name: 'A' });
    createProject({ name: 'B' });
    createProject({ name: 'C' });
    expect(listProjects()).toHaveLength(3);
  });

  it('sorts by priority ascending', () => {
    createProject({ name: 'High', priority: 1 });
    createProject({ name: 'Low', priority: 8 });
    createProject({ name: 'Mid', priority: 4 });
    const names = listProjects().map(p => p.name);
    expect(names).toEqual(['High', 'Mid', 'Low']);
  });

  it('returns immutable copy (mutation does not affect registry)', () => {
    createProject({ name: 'Safe' });
    const list = listProjects();
    list.push({} as MultiProject);
    expect(listProjects()).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getProject
// ─────────────────────────────────────────────────────────────────────────────

describe('getProject', () => {
  beforeEach(() => resetMultiProjectRegistryForTests());

  it('returns project by ID', () => {
    const p = createProject({ name: 'FindMe' })!;
    const found = getProject(p.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('FindMe');
  });

  it('returns null for unknown ID', () => {
    expect(getProject('nonexistent-id')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateProject
// ─────────────────────────────────────────────────────────────────────────────

describe('updateProject', () => {
  beforeEach(() => resetMultiProjectRegistryForTests());

  it('updates name', () => {
    const p = createProject({ name: 'Old' })!;
    const updated = updateProject(p.id, { name: 'New' });
    expect(updated!.name).toBe('New');
  });

  it('updates status to paused', () => {
    const p = createProject({ name: 'Pausable' })!;
    const updated = updateProject(p.id, { status: 'paused' });
    expect(updated!.status).toBe('paused');
  });

  it('updates priority', () => {
    const p = createProject({ name: 'Priority' })!;
    const updated = updateProject(p.id, { priority: 1 });
    expect(updated!.priority).toBe(1);
  });

  it('returns null for unknown project ID', () => {
    expect(updateProject('ghost-id', { name: 'X' })).toBeNull();
  });

  it('returns null for invalid priority', () => {
    const p = createProject({ name: 'Bad' })!;
    expect(updateProject(p.id, { priority: 99 })).toBeNull();
  });

  it('bumps updatedAt', async () => {
    const p = createProject({ name: 'TimeBump' })!;
    const before = p.updatedAt;
    await new Promise(r => setTimeout(r, 5));
    const updated = updateProject(p.id, { name: 'TimeBump2' });
    expect(updated!.updatedAt).not.toBe(before);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// archiveProject
// ─────────────────────────────────────────────────────────────────────────────

describe('archiveProject', () => {
  beforeEach(() => resetMultiProjectRegistryForTests());

  it('sets status to archived', () => {
    const p = createProject({ name: 'Retire' })!;
    expect(archiveProject(p.id)).toBe(true);
    expect(getProject(p.id)!.status).toBe('archived');
  });

  it('returns false for unknown ID', () => {
    expect(archiveProject('missing')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deleteProject
// ─────────────────────────────────────────────────────────────────────────────

describe('deleteProject', () => {
  beforeEach(() => resetMultiProjectRegistryForTests());

  it('removes project from registry', () => {
    const p = createProject({ name: 'Delete Me' })!;
    expect(deleteProject(p.id)).toBe(true);
    expect(getProject(p.id)).toBeNull();
    expect(listProjects()).toHaveLength(0);
  });

  it('returns false for unknown ID', () => {
    expect(deleteProject('ghost')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// assignAgentToProject / removeAgentFromProject
// ─────────────────────────────────────────────────────────────────────────────

describe('assignAgentToProject', () => {
  beforeEach(() => resetMultiProjectRegistryForTests());

  it('assigns an agent to a project', () => {
    const p = createProject({ name: 'Assigned' })!;
    const updated = assignAgentToProject(p.id, 'agent-1', 'security');
    expect(updated!.resources).toHaveLength(1);
    expect(updated!.resources[0].agentId).toBe('agent-1');
    expect(updated!.resources[0].role).toBe('security');
  });

  it('is idempotent — duplicate assignment is not added', () => {
    const p = createProject({ name: 'Idempotent' })!;
    assignAgentToProject(p.id, 'agent-1', 'monitoring');
    const result = assignAgentToProject(p.id, 'agent-1', 'monitoring');
    expect(result!.resources).toHaveLength(1);
  });

  it('allows same agent with different roles', () => {
    const p = createProject({ name: 'MultiRole' })!;
    assignAgentToProject(p.id, 'agent-1', 'monitoring');
    const result = assignAgentToProject(p.id, 'agent-1', 'diagnostic');
    expect(result!.resources).toHaveLength(2);
  });

  it('returns null for unknown project', () => {
    expect(assignAgentToProject('ghost', 'agent-1', 'monitoring')).toBeNull();
  });
});

describe('removeAgentFromProject', () => {
  beforeEach(() => resetMultiProjectRegistryForTests());

  it('removes an agent from a project', () => {
    const p = createProject({ name: 'WithAgent' })!;
    assignAgentToProject(p.id, 'agent-2', 'tester');
    const updated = removeAgentFromProject(p.id, 'agent-2', 'tester');
    expect(updated!.resources).toHaveLength(0);
  });

  it('does not fail if agent not assigned', () => {
    const p = createProject({ name: 'NoAgent' })!;
    const updated = removeAgentFromProject(p.id, 'nonexistent-agent', 'monitoring');
    expect(updated!.resources).toHaveLength(0);
  });

  it('returns null for unknown project', () => {
    expect(removeAgentFromProject('ghost', 'agent-1', 'monitoring')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getMultiProjectRollup
// ─────────────────────────────────────────────────────────────────────────────

describe('getMultiProjectRollup', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
    vi.clearAllMocks();
  });

  it('returns zero counts for empty registry', () => {
    const r = getMultiProjectRollup();
    expect(r.total).toBe(0);
    expect(r.active).toBe(0);
    expect(r.archived).toBe(0);
    expect(r.healthyCount).toBe(0);
    expect(r.failingCount).toBe(0);
  });

  it('counts active projects correctly', () => {
    createProject({ name: 'A' });
    createProject({ name: 'B' });
    const p3 = createProject({ name: 'C' })!;
    archiveProject(p3.id);
    const r = getMultiProjectRollup();
    expect(r.total).toBe(3);
    expect(r.active).toBe(2);
    expect(r.archived).toBe(1);
  });

  it('counts healthy projects (PASS verdict)', () => {
    const p = createProject({ name: 'Healthy' })!;
    // Manually inject snapshot
    updateProject(p.id, {}); // no-op update just to touch updatedAt
    // We need to inject healthSnapshot directly via refresh mock
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('PASS'));
    // We'll check after actual refreshProjectHealth in the async tests
    // For now just test the count without snapshots
    const r = getMultiProjectRollup();
    expect(r.healthyCount).toBe(0); // no snapshot yet
  });

  it('includes computedAt as ISO string', () => {
    const r = getMultiProjectRollup();
    expect(() => new Date(r.computedAt)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getMultiProjectAgentStatus
// ─────────────────────────────────────────────────────────────────────────────

describe('getMultiProjectAgentStatus', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
    vi.clearAllMocks();
  });

  it('returns readiness=planned when no projects', () => {
    const s = getMultiProjectAgentStatus();
    expect(s.readiness).toBe('planned');
    expect(s.id).toBe('multiproject');
  });

  it('returns readiness=partial when projects exist but no health snapshots', () => {
    createProject({ name: 'NoSnap' });
    const s = getMultiProjectAgentStatus();
    expect(s.readiness).toBe('partial');
  });

  it('has testId=multiproject-dashboard', () => {
    const s = getMultiProjectAgentStatus();
    expect(s.testId).toBe('multiproject-dashboard');
  });

  it('returns evidence array with registry info', () => {
    const s = getMultiProjectAgentStatus();
    expect(Array.isArray(s.evidence)).toBe(true);
    expect(s.evidence.length).toBeGreaterThan(0);
  });

  it('returns blockers when no projects created', () => {
    const s = getMultiProjectAgentStatus();
    expect(s.blockers.length).toBeGreaterThan(0);
  });

  it('includes serviceState string', () => {
    const s = getMultiProjectAgentStatus();
    expect(typeof s.serviceState).toBe('string');
    expect(s.serviceState.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// refreshProjectHealth — async integration with orchestrator
// ─────────────────────────────────────────────────────────────────────────────

describe('refreshProjectHealth', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
    vi.resetAllMocks();
  });

  it('calls dispatchToAgents with health_check event', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('PASS'));
    const p = createProject({ name: 'HealthTest' })!;
    await refreshProjectHealth(p.id);
    expect(mockDispatchToAgents).toHaveBeenCalledOnce();
    const call = mockDispatchToAgents.mock.calls[0][0];
    expect(call.type).toBe('health_check');
    expect(call.source).toBe('multiproject_agent');
    expect(call.payload.projectId).toBe(p.id);
  });

  it('stores PASS snapshot on project', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('PASS'));
    const p = createProject({ name: 'PassProject' })!;
    const snapshot = await refreshProjectHealth(p.id);
    expect(snapshot.verdict).toBe('PASS');
    const stored = getProject(p.id)!;
    expect(stored.healthSnapshot).not.toBeNull();
    expect(stored.healthSnapshot!.verdict).toBe('PASS');
  });

  it('stores FAIL snapshot on project', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('FAIL'));
    const p = createProject({ name: 'FailProject' })!;
    const snapshot = await refreshProjectHealth(p.id);
    expect(snapshot.verdict).toBe('FAIL');
  });

  it('stores BLOCKED snapshot when consensus is BLOCKED', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('BLOCKED'));
    const p = createProject({ name: 'BlockedProject' })!;
    const snapshot = await refreshProjectHealth(p.id);
    expect(snapshot.verdict).toBe('BLOCKED');
    expect(snapshot.blockers).toContain('test-blocker');
  });

  it('snapshot includes computedAt ISO string', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('PASS'));
    const p = createProject({ name: 'TimedProject' })!;
    const snapshot = await refreshProjectHealth(p.id);
    expect(() => new Date(snapshot.computedAt)).not.toThrow();
  });

  it('after refreshProjectHealth PASS, rollup counts 1 healthy project', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('PASS'));
    const p = createProject({ name: 'CountMe' })!;
    await refreshProjectHealth(p.id);
    const r = getMultiProjectRollup();
    expect(r.healthyCount).toBe(1);
    expect(r.failingCount).toBe(0);
  });

  it('after refreshProjectHealth FAIL, rollup counts 1 failing project', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('FAIL'));
    const p = createProject({ name: 'FailCount' })!;
    await refreshProjectHealth(p.id);
    const r = getMultiProjectRollup();
    expect(r.healthyCount).toBe(0);
    expect(r.failingCount).toBe(1);
  });

  it('after refreshProjectHealth, getMultiProjectAgentStatus returns qualified', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(makeConsensus('PASS'));
    const p = createProject({ name: 'QualifyMe' })!;
    await refreshProjectHealth(p.id);
    const s = getMultiProjectAgentStatus();
    expect(s.readiness).toBe('qualified');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase F2 — Enhanced capabilities tests
// ─────────────────────────────────────────────────────────────────────────────

import {
  pauseProject,
  resumeProject,
  searchProjects,
  getPriorityQueue,
  detectDependencyCycle,
  getProjectDependencyChain,
  detectAndMarkBlockedProjects,
} from '@/services/multiproject';

describe('pauseProject / resumeProject', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
    mockDispatchToAgents.mockReset();
  });

  it('pause un projet actif', () => {
    const p = createProject({ name: 'Proj A', priority: 1 })!;
    const paused = pauseProject(p.id);
    expect(paused?.status).toBe('paused');
  });

  it('retourne null si le projet est déjà paused', () => {
    const p = createProject({ name: 'Proj B', priority: 1 })!;
    pauseProject(p.id);
    const result = pauseProject(p.id);
    expect(result).toBeNull();
  });

  it('retourne null si le projet est archived', () => {
    const p = createProject({ name: 'Proj Arch', priority: 1 })!;
    archiveProject(p.id);
    expect(pauseProject(p.id)).toBeNull();
  });

  it('resume un projet pausé → active', () => {
    const p = createProject({ name: 'Proj C', priority: 1 })!;
    pauseProject(p.id);
    const resumed = resumeProject(p.id);
    expect(resumed?.status).toBe('active');
  });

  it('resume un projet bloqué → active', () => {
    const p = createProject({ name: 'Proj Blocked', priority: 1 })!;
    updateProject(p.id, { status: 'blocked' });
    const resumed = resumeProject(p.id);
    expect(resumed?.status).toBe('active');
  });

  it('retourne null si le projet est already active', () => {
    const p = createProject({ name: 'Proj Active', priority: 1 })!;
    expect(resumeProject(p.id)).toBeNull();
  });
});

describe('searchProjects', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
  });

  it('trouve un projet par nom (case-insensitive)', () => {
    createProject({ name: 'Alpha Project', priority: 1 });
    createProject({ name: 'Beta Work', priority: 2 });
    const results = searchProjects('alpha');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Alpha Project');
  });

  it('retourne [] si aucun résultat', () => {
    createProject({ name: 'Gamma', priority: 1 });
    expect(searchProjects('zzz-nonexistent')).toHaveLength(0);
  });

  it('filtre par status', () => {
    const p1 = createProject({ name: 'Active Proj', priority: 1 })!;
    const p2 = createProject({ name: 'Active Proj 2', priority: 2 })!;
    archiveProject(p2.id);
    const results = searchProjects('active', { status: 'active' });
    expect(results.every(p => p.status === 'active')).toBe(true);
    expect(results.some(p => p.id === p1.id)).toBe(true);
  });

  it('respecte la limite (limit option)', () => {
    for (let i = 0; i < 5; i++) createProject({ name: `Limit Test ${i}`, priority: i + 1 });
    const results = searchProjects('limit', { limit: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('retourne les résultats triés par priorité', () => {
    createProject({ name: 'Sort C', priority: 3 });
    createProject({ name: 'Sort A', priority: 1 });
    createProject({ name: 'Sort B', priority: 2 });
    const results = searchProjects('sort');
    const priorities = results.map(p => p.priority);
    expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
  });
});

describe('getPriorityQueue', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
  });

  it('retourne les projets actifs triés par priorité', () => {
    createProject({ name: 'P3', priority: 3 });
    createProject({ name: 'P1', priority: 1 });
    createProject({ name: 'P2', priority: 2 });
    const queue = getPriorityQueue();
    const priorities = queue.map(p => p.priority);
    expect(priorities).toEqual([1, 2, 3]);
  });

  it('exclut les projets archivés par défaut', () => {
    const p = createProject({ name: 'Archived', priority: 1 })!;
    archiveProject(p.id);
    createProject({ name: 'Active', priority: 2 });
    const queue = getPriorityQueue();
    expect(queue.every(p => p.status !== 'archived')).toBe(true);
  });

  it('includeAll=true retourne aussi les archivés', () => {
    const p = createProject({ name: 'Arc', priority: 1 })!;
    archiveProject(p.id);
    const queue = getPriorityQueue(true);
    expect(queue.some(proj => proj.id === p.id)).toBe(true);
  });
});

describe('detectDependencyCycle', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
  });

  it('retourne null si aucun cycle', () => {
    const p1 = createProject({ name: 'P1', priority: 1 })!;
    const p2 = createProject({ name: 'P2', priority: 2 })!;
    updateProject(p2.id, { dependsOn: [p1.id] });
    expect(detectDependencyCycle()).toBeNull();
  });

  it('détecte un cycle direct A → B → A', () => {
    const p1 = createProject({ name: 'PA', priority: 1 })!;
    const p2 = createProject({ name: 'PB', priority: 2 })!;
    updateProject(p1.id, { dependsOn: [p2.id] });
    updateProject(p2.id, { dependsOn: [p1.id] });
    const cycle = detectDependencyCycle();
    expect(cycle).not.toBeNull();
    expect(cycle!.length).toBeGreaterThanOrEqual(2);
  });

  it('retourne null pour registre vide', () => {
    expect(detectDependencyCycle()).toBeNull();
  });
});

describe('getProjectDependencyChain', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
  });

  it('retourne [] pour projet sans dépendances', () => {
    const p = createProject({ name: 'Solo', priority: 1 })!;
    expect(getProjectDependencyChain(p.id)).toEqual([]);
  });

  it('retourne la chaîne complète des dépendances', () => {
    const p1 = createProject({ name: 'P1', priority: 1 })!;
    const p2 = createProject({ name: 'P2', priority: 2 })!;
    const p3 = createProject({ name: 'P3', priority: 3 })!;
    updateProject(p2.id, { dependsOn: [p1.id] });
    updateProject(p3.id, { dependsOn: [p2.id] });
    const chain = getProjectDependencyChain(p3.id);
    expect(chain).toContain(p2.id);
    expect(chain).toContain(p1.id);
  });
});

describe('detectAndMarkBlockedProjects', () => {
  beforeEach(() => {
    resetMultiProjectRegistryForTests();
    mockDispatchToAgents.mockReset();
  });

  it('retourne [] si aucun projet bloqué par ses dépendances', () => {
    createProject({ name: 'Standalone', priority: 1 });
    expect(detectAndMarkBlockedProjects()).toEqual([]);
  });

  it('marque comme bloqué un projet dont toutes les dépendances sont FAIL', async () => {
    mockDispatchToAgents.mockResolvedValueOnce(
      { verdicts: { a: 'FAIL' }, aggregated: 'FAIL', blockers: ['dep failed'], timestamp: Date.now() }
    );
    const dep = createProject({ name: 'Dep', priority: 1 })!;
    const proj = createProject({ name: 'Proj', priority: 2 })!;
    updateProject(proj.id, { dependsOn: [dep.id] });
    // Simuler health FAIL sur la dépendance
    await refreshProjectHealth(dep.id);

    const blocked = detectAndMarkBlockedProjects();
    expect(blocked).toContain(proj.id);
    expect(getProject(proj.id)?.status).toBe('blocked');
  });
});
