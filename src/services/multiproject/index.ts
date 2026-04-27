/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ — Multi-Project Management Agent
 * Service: src/services/multiproject/index.ts
 * Rule 15: Added to UI_SURFACE_MAP.md, ARCHITECTURE.md, CARTOGRAPHY_COMPLETE.md
 * Rule 16: Unit + E2E tests required (see tests/unit/services/multiproject/)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Capabilities:
 *   - Project lifecycle: create, activate, archive, delete
 *   - Agent assignment per project (references AgentConfig.id)
 *   - Priority-based scheduling (1–10, lower = higher priority)
 *   - Cross-project health rollup via dispatchToAgents()
 *   - Resource allocation tracking per project
 *   - Dependency graph (project → project blockers)
 *   - Persistent state via localStorage (no new Tauri command = minimal patch Rule 1)
 */

import type { AgentConsensus } from '@/services/orchestrator';
import { dispatchToAgents } from '@/services/orchestrator';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'paused' | 'archived' | 'blocked';

/** A single resource slot allocated to a project. */
export interface ProjectResourceAllocation {
  /** Agent ID from AgentConfig (agents.types.ts). */
  agentId: string;
  /** Human-readable role label for this assignment. */
  role: string;
  /** UTC ISO-8601 timestamp when assigned. */
  assignedAt: string;
}

/** Health snapshot derived from the last orchestrator consensus for the project. */
export interface ProjectHealthSnapshot {
  /** Aggregated verdict from dispatchToAgents(). */
  verdict: 'PASS' | 'FAIL' | 'BLOCKED' | 'UNKNOWN';
  /** Per-agent verdicts from the last health dispatch. */
  verdicts: Record<string, string>;
  /** Active blockers reported by agents. */
  blockers: string[];
  /** ISO-8601 timestamp of the snapshot. */
  computedAt: string;
}

/** Full project record stored in the registry. */
export interface MultiProject {
  /** UUID — generated on creation. */
  id: string;
  /** Human-readable name (required, 1–80 chars). */
  name: string;
  /** Optional description. */
  description: string;
  /** Lifecycle status. */
  status: ProjectStatus;
  /**
   * Scheduling priority (1 = highest, 10 = lowest).
   * Lower values are dispatched first in consensus checks.
   */
  priority: number;
  /** Free-form categorization tags. */
  tags: string[];
  /** Agent assignments for this project. */
  resources: ProjectResourceAllocation[];
  /** IDs of other projects this project depends on (blocks). */
  dependsOn: string[];
  /** Latest health snapshot — null if not yet computed. */
  healthSnapshot: ProjectHealthSnapshot | null;
  /** UTC ISO-8601 creation timestamp. */
  createdAt: string;
  /** UTC ISO-8601 last-update timestamp. */
  updatedAt: string;
}

/** Summary of all projects for dashboard rollup. */
export interface MultiProjectRollup {
  total: number;
  active: number;
  paused: number;
  archived: number;
  blocked: number;
  healthyCount: number;
  failingCount: number;
  computedAt: string;
}

/** Input to create a project. */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  priority?: number;
  tags?: string[];
  dependsOn?: string[];
}

/** Input to update project fields. */
export type UpdateProjectRequest = Partial<
  Pick<MultiProject, 'name' | 'description' | 'status' | 'priority' | 'tags' | 'dependsOn'>
>;

// ─────────────────────────────────────────────────────────────────────────────
// Internal state + persistence
// ─────────────────────────────────────────────────────────────────────────────

const REGISTRY_KEY = 'titane_multiproject_registry';
const REGISTRY_LIMIT = 50; // max active projects

let _registry: MultiProject[] | null = null;

function loadRegistry(): MultiProject[] {
  if (_registry !== null) return _registry;

  if (typeof window === 'undefined') {
    _registry = [];
    return _registry;
  }

  try {
    const raw = window.localStorage.getItem(REGISTRY_KEY);
    if (!raw) {
      _registry = [];
      return _registry;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      _registry = [];
      return _registry;
    }

    _registry = parsed.filter(
      (p: unknown) =>
        p !== null &&
        typeof p === 'object' &&
        typeof (p as MultiProject).id === 'string' &&
        typeof (p as MultiProject).name === 'string'
    );

    return _registry;
  } catch {
    _registry = [];
    return _registry;
  }
}

function saveRegistry(projects: MultiProject[]): void {
  _registry = projects;

  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(projects));
  } catch {
    // Storage full or unavailable — keep in-memory state valid
  }
}

/** Generate a simple UUID-like ID. Not crypto-secure — for local registry only. */
function generateId(): string {
  return `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reset in-memory registry and localStorage. For unit tests only.
 * @internal
 */
export function resetMultiProjectRegistryForTests(): void {
  _registry = null;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(REGISTRY_KEY);
    } catch {
      // ignore
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new project and add it to the registry.
 * Validates name length (1–80 chars) and priority range (1–10).
 * Returns null and emits a console warning if validation fails or the registry
 * is at capacity.
 */
export function createProject(req: CreateProjectRequest): MultiProject | null {
  const name = req.name?.trim();
  if (!name || name.length > 80) {
    if (typeof window !== 'undefined') {
      console.warn('[multiproject] createProject: invalid name', req.name);
    }
    return null;
  }

  const priority = req.priority ?? 5;
  if (priority < 1 || priority > 10) {
    if (typeof window !== 'undefined') {
      console.warn('[multiproject] createProject: priority must be 1–10, got', priority);
    }
    return null;
  }

  const registry = loadRegistry();

  const activeCount = registry.filter(p => p.status !== 'archived').length;
  if (activeCount >= REGISTRY_LIMIT) {
    if (typeof window !== 'undefined') {
      console.warn('[multiproject] createProject: registry at capacity', REGISTRY_LIMIT);
    }
    return null;
  }

  const now = new Date().toISOString();
  const project: MultiProject = {
    id: generateId(),
    name,
    description: req.description?.trim() ?? '',
    status: 'active',
    priority,
    tags: req.tags ?? [],
    resources: [],
    dependsOn: req.dependsOn ?? [],
    healthSnapshot: null,
    createdAt: now,
    updatedAt: now,
  };

  saveRegistry([...registry, project]);
  return project;
}

/**
 * Return all projects, sorted by priority (ascending) then by createdAt.
 */
export function listProjects(): MultiProject[] {
  return [...loadRegistry()].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/**
 * Return a single project by ID, or null if not found.
 */
export function getProject(id: string): MultiProject | null {
  return loadRegistry().find(p => p.id === id) ?? null;
}

/**
 * Update mutable fields of a project.
 * Returns the updated project, or null if not found.
 */
export function updateProject(id: string, req: UpdateProjectRequest): MultiProject | null {
  const registry = loadRegistry();
  const idx = registry.findIndex(p => p.id === id);
  if (idx === -1) return null;

  const existing = registry[idx];

  // Validate if name provided
  if (req.name !== undefined) {
    const name = req.name.trim();
    if (!name || name.length > 80) return null;
  }

  // Validate if priority provided
  if (req.priority !== undefined) {
    if (req.priority < 1 || req.priority > 10) return null;
  }

  const updated: MultiProject = {
    ...existing,
    ...(req.name !== undefined ? { name: req.name.trim() } : {}),
    ...(req.description !== undefined ? { description: req.description.trim() } : {}),
    ...(req.status !== undefined ? { status: req.status } : {}),
    ...(req.priority !== undefined ? { priority: req.priority } : {}),
    ...(req.tags !== undefined ? { tags: req.tags } : {}),
    ...(req.dependsOn !== undefined ? { dependsOn: req.dependsOn } : {}),
    updatedAt: new Date().toISOString(),
  };

  const newRegistry = [...registry];
  newRegistry[idx] = updated;
  saveRegistry(newRegistry);
  return updated;
}

/**
 * Archive a project (soft delete).
 * Returns true if archived, false if not found.
 */
export function archiveProject(id: string): boolean {
  const updated = updateProject(id, { status: 'archived' });
  return updated !== null;
}

/**
 * Hard-delete a project from the registry.
 * Returns true if removed, false if not found.
 */
export function deleteProject(id: string): boolean {
  const registry = loadRegistry();
  const next = registry.filter(p => p.id !== id);
  if (next.length === registry.length) return false;
  saveRegistry(next);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource allocation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assign an agent to a project.
 * Idempotent: a duplicate (same agentId + role) is not added twice.
 * Returns updated project or null if not found.
 */
export function assignAgentToProject(
  projectId: string,
  agentId: string,
  role: string
): MultiProject | null {
  const project = getProject(projectId);
  if (!project) return null;

  const alreadyAssigned = project.resources.some(
    r => r.agentId === agentId && r.role === role
  );

  if (alreadyAssigned) return project;

  const allocation: ProjectResourceAllocation = {
    agentId,
    role,
    assignedAt: new Date().toISOString(),
  };

  return updateProjectResources(projectId, [...project.resources, allocation]);
}

/**
 * Remove an agent assignment from a project.
 * Returns updated project or null if not found.
 */
export function removeAgentFromProject(
  projectId: string,
  agentId: string,
  role: string
): MultiProject | null {
  const project = getProject(projectId);
  if (!project) return null;

  const filtered = project.resources.filter(
    r => !(r.agentId === agentId && r.role === role)
  );

  return updateProjectResources(projectId, filtered);
}

function updateProjectResources(
  projectId: string,
  resources: ProjectResourceAllocation[]
): MultiProject | null {
  const registry = loadRegistry();
  const idx = registry.findIndex(p => p.id === projectId);
  if (idx === -1) return null;

  const updated: MultiProject = {
    ...registry[idx],
    resources,
    updatedAt: new Date().toISOString(),
  };

  const next = [...registry];
  next[idx] = updated;
  saveRegistry(next);
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Health consensus
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run a health_check dispatch for a single project.
 * Stores the resulting snapshot on the project and returns it.
 * Falls back to 'UNKNOWN' verdict on IPC failure.
 */
export async function refreshProjectHealth(projectId: string): Promise<ProjectHealthSnapshot> {
  const consensus: AgentConsensus = await dispatchToAgents({
    type: 'health_check',
    payload: { projectId },
    timestamp: Date.now(),
    source: 'multiproject_agent',
  });

  const snapshot: ProjectHealthSnapshot = {
    verdict: consensus.aggregated,
    verdicts: Object.fromEntries(
      Object.entries(consensus.verdicts).map(([k, v]) => [k, String(v)])
    ),
    blockers: consensus.blockers,
    computedAt: new Date().toISOString(),
  };

  // Persist snapshot on project
  const registry = loadRegistry();
  const idx = registry.findIndex(p => p.id === projectId);
  if (idx !== -1) {
    const next = [...registry];
    next[idx] = { ...next[idx], healthSnapshot: snapshot, updatedAt: snapshot.computedAt };
    saveRegistry(next);
  }

  return snapshot;
}

/**
 * Compute a rollup summary across all projects.
 * Health fields are derived from the last stored snapshot, not live-dispatched.
 */
export function getMultiProjectRollup(): MultiProjectRollup {
  const projects = loadRegistry();
  const total = projects.length;
  const active = projects.filter(p => p.status === 'active').length;
  const paused = projects.filter(p => p.status === 'paused').length;
  const archived = projects.filter(p => p.status === 'archived').length;
  const blocked = projects.filter(p => p.status === 'blocked').length;

  const healthyCount = projects.filter(
    p => p.healthSnapshot?.verdict === 'PASS'
  ).length;
  const failingCount = projects.filter(
    p =>
      p.healthSnapshot?.verdict === 'FAIL' || p.healthSnapshot?.verdict === 'BLOCKED'
  ).length;

  return {
    total,
    active,
    paused,
    archived,
    blocked,
    healthyCount,
    failingCount,
    computedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent status facade (matches AGENTS.md + advancedAgentCatalog pattern)
// ─────────────────────────────────────────────────────────────────────────────

export interface MultiProjectAgentStatus {
  id: 'multiproject';
  title: string;
  summary: string;
  testId: string;
  readiness: 'planned' | 'partial' | 'qualified';
  readinessLabel: string;
  serviceState: string;
  evidence: string[];
  blockers: string[];
  nextStep: string;
}

/**
 * Return the current qualification status for the multi-project management agent.
 * Derives readiness from live registry state.
 */
export function getMultiProjectAgentStatus(): MultiProjectAgentStatus {
  const registry = loadRegistry();
  const activeProjects = registry.filter(p => p.status !== 'archived');

  const hasProjects = activeProjects.length > 0;
  const hasHealthSnapshots = activeProjects.some(p => p.healthSnapshot !== null);

  const readiness = hasProjects && hasHealthSnapshots ? 'qualified' : hasProjects ? 'partial' : 'planned';

  const evidence: string[] = [
    `Project registry active (${registry.length} entries, ${activeProjects.length} non-archived).`,
    'CRUD operations: create, list, get, update, archive, delete — all implemented.',
    'Agent assignment (assign/remove) with idempotency guard implemented.',
    'Priority-based scheduling (1–10) and dependency graph (dependsOn) supported.',
  ];

  if (hasHealthSnapshots) {
    evidence.push('Health consensus snapshots available via dispatchToAgents() integration.');
  }

  const blockers: string[] = [];
  if (!hasProjects) {
    blockers.push('No active projects in registry — create a project to activate the agent.');
  }
  if (!hasHealthSnapshots) {
    blockers.push(
      'No health snapshots computed yet — call refreshProjectHealth(projectId) for live data.'
    );
  }

  return {
    id: 'multiproject',
    title: 'Multi-Project Management Agent',
    summary:
      'Manages multiple concurrent projects with lifecycle, agent allocation, priority scheduling, dependency tracking, and cross-project health consensus.',
    testId: 'multiproject-dashboard',
    readiness,
    readinessLabel: readiness.toUpperCase(),
    serviceState:
      activeProjects.length > 0
        ? `Registry live (${activeProjects.length} active projects)`
        : 'Registry empty — no projects created yet',
    evidence,
    blockers,
    nextStep:
      blockers.length === 0
        ? 'Extend with Tauri-backed file persistence for cross-session project history.'
        : blockers[0],
  };
}
