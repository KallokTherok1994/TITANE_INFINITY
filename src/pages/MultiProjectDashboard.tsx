/**
 * TITANE∞ — Multi-Project Management Dashboard
 * Page: src/pages/MultiProjectDashboard.tsx
 *
 * Rule 15: Added to UI_SURFACE_MAP.md + CARTOGRAPHY_COMPLETE.md
 * Rule 16: E2E test required (e2e/), unit test in tests/unit/pages/
 * data-testid canonical anchors:
 *   - multiproject-dashboard       (page root)
 *   - multiproject-rollup          (summary card)
 *   - multiproject-project-list    (project list container)
 *   - multiproject-project-card-{id} (individual project card)
 *   - multiproject-create-form     (create form)
 *   - multiproject-create-submit   (create button)
 *   - multiproject-health-badge-{id} (health badge per project)
 *   - multiproject-agent-status    (agent status block)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createProject,
  listProjects,
  archiveProject,
  deleteProject,
  assignAgentToProject,
  refreshProjectHealth,
  getMultiProjectRollup,
  getMultiProjectAgentStatus,
  resetMultiProjectRegistryForTests,
  type MultiProject,
  type MultiProjectRollup,
  type MultiProjectAgentStatus,
  type CreateProjectRequest,
} from '../services/multiproject';
import { Activity, Archive, PlusCircle, RefreshCw, Trash2, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function verdictColor(verdict: string | undefined): string {
  if (verdict === 'PASS') return 'text-green-400';
  if (verdict === 'FAIL') return 'text-red-400';
  if (verdict === 'BLOCKED') return 'text-yellow-400';
  return 'text-slate-400';
}

function statusBadgeClass(status: MultiProject['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-700/30 text-green-300 border border-green-600/40';
    case 'paused':
      return 'bg-yellow-700/30 text-yellow-300 border border-yellow-600/40';
    case 'blocked':
      return 'bg-red-700/30 text-red-300 border border-red-600/40';
    case 'archived':
      return 'bg-slate-700/30 text-slate-400 border border-slate-600/40';
    default:
      return 'bg-slate-700/30 text-slate-400';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface RollupCardProps {
  rollup: MultiProjectRollup;
}

const RollupCard: React.FC<RollupCardProps> = ({ rollup }) => (
  <div
    data-testid="multiproject-rollup"
    className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
  >
    <div className="text-center">
      <div className="text-2xl font-bold text-slate-100">{rollup.total}</div>
      <div className="text-xs text-slate-400 mt-1">Total</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-green-400">{rollup.active}</div>
      <div className="text-xs text-slate-400 mt-1">Actifs</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-green-300">{rollup.healthyCount}</div>
      <div className="text-xs text-slate-400 mt-1">Sains</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-red-400">{rollup.failingCount}</div>
      <div className="text-xs text-slate-400 mt-1">En échec</div>
    </div>
  </div>
);

interface AgentStatusCardProps {
  status: MultiProjectAgentStatus;
}

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ status }) => (
  <div
    data-testid="multiproject-agent-status"
    className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 mb-4"
  >
    <div className="flex items-center gap-2 mb-2">
      <Zap size={16} className="text-cyan-400" />
      <span className="text-sm font-semibold text-slate-200">{status.title}</span>
      <span
        className={`ml-auto text-xs px-2 py-0.5 rounded font-mono ${
          status.readiness === 'qualified'
            ? 'bg-green-700/40 text-green-300'
            : status.readiness === 'partial'
            ? 'bg-yellow-700/40 text-yellow-300'
            : 'bg-slate-700/40 text-slate-400'
        }`}
      >
        {status.readinessLabel}
      </span>
    </div>
    <p className="text-xs text-slate-400 mb-2">{status.serviceState}</p>
    {status.evidence.length > 0 && (
      <ul className="text-xs text-slate-500 space-y-0.5 list-disc list-inside">
        {status.evidence.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    )}
    {status.blockers.length > 0 && (
      <div className="mt-2 text-xs text-yellow-400 space-y-0.5">
        {status.blockers.map((b, i) => (
          <div key={i}>⚠ {b}</div>
        ))}
      </div>
    )}
  </div>
);

interface ProjectCardProps {
  project: MultiProject;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRefreshHealth: (id: string) => void;
  refreshingId: string | null;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onArchive,
  onDelete,
  onRefreshHealth,
  refreshingId,
}) => {
  const isRefreshing = refreshingId === project.id;
  const verdict = project.healthSnapshot?.verdict;

  return (
    <div
      data-testid={`multiproject-project-card-${project.id}`}
      className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 flex flex-col gap-2"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100 truncate">{project.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${statusBadgeClass(
                project.status
              )}`}
            >
              {project.status}
            </span>
            <span className="text-xs text-slate-500">P{project.priority}</span>
          </div>
          {project.description && (
            <p className="text-xs text-slate-400 mt-1 truncate">{project.description}</p>
          )}
        </div>

        {/* Health badge */}
        <div
          data-testid={`multiproject-health-badge-${project.id}`}
          className={`text-xs font-mono font-bold shrink-0 ${verdictColor(verdict)}`}
        >
          {verdict ?? '—'}
        </div>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Resources */}
      {project.resources.length > 0 && (
        <div className="text-xs text-slate-500">
          {project.resources.length} agent(s) assigné(s)
        </div>
      )}

      {/* Blockers */}
      {project.healthSnapshot && project.healthSnapshot.blockers.length > 0 && (
        <div className="text-xs text-yellow-400">
          {project.healthSnapshot.blockers.slice(0, 2).map((b, i) => (
            <div key={i}>⚠ {b}</div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-1 flex-wrap">
        <button
          aria-label={`Rafraîchir la santé du projet ${project.name}`}
          onClick={() => onRefreshHealth(project.id)}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          Santé
        </button>

        {project.status !== 'archived' && (
          <button
            aria-label={`Archiver le projet ${project.name}`}
            onClick={() => onArchive(project.id)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 transition-colors"
          >
            <Archive size={12} />
            Archiver
          </button>
        )}

        <button
          aria-label={`Supprimer le projet ${project.name}`}
          onClick={() => onDelete(project.id)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-900/40 hover:bg-red-800/60 text-red-300 transition-colors"
        >
          <Trash2 size={12} />
          Supprimer
        </button>
      </div>

      <div className="text-xs text-slate-600 mt-1">
        Créé {new Date(project.createdAt).toLocaleString('fr-FR')}
      </div>
    </div>
  );
};

interface CreateFormProps {
  onCreated: (project: MultiProject) => void;
}

const CreateForm: React.FC<CreateFormProps> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(5);
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const req: CreateProjectRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        priority,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      };

      const created = createProject(req);
      if (!created) {
        setError('Nom invalide ou registre plein (max 50 projets).');
        return;
      }

      setName('');
      setDescription('');
      setPriority(5);
      setTags('');
      setOpen(false);
      onCreated(created);
    },
    [name, description, priority, tags, onCreated]
  );

  if (!open) {
    return (
      <button
        data-testid="multiproject-create-submit"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-cyan-700/40 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-700/40 transition-colors mb-4"
      >
        <PlusCircle size={16} />
        Nouveau projet
      </button>
    );
  }

  return (
    <form
      data-testid="multiproject-create-form"
      onSubmit={handleSubmit}
      className="rounded-xl border border-cyan-700/40 bg-slate-800/80 p-4 mb-4 space-y-3"
    >
      <div className="font-semibold text-slate-200 text-sm mb-1">Nouveau projet</div>

      {error && <div className="text-xs text-red-400">{error}</div>}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400" htmlFor="mp-name">
          Nom *
        </label>
        <input
          id="mp-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nom du projet (1–80 caractères)"
          maxLength={80}
          className="bg-slate-700/60 border border-slate-600/50 rounded px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-600/60"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400" htmlFor="mp-desc">
          Description
        </label>
        <input
          id="mp-desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description optionnelle"
          className="bg-slate-700/60 border border-slate-600/50 rounded px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-600/60"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-slate-400" htmlFor="mp-priority">
            Priorité (1–10)
          </label>
          <input
            id="mp-priority"
            type="number"
            min={1}
            max={10}
            value={priority}
            onChange={e => setPriority(Number(e.target.value))}
            className="bg-slate-700/60 border border-slate-600/50 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-600/60 w-20"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-slate-400" htmlFor="mp-tags">
            Tags (virgule)
          </label>
          <input
            id="mp-tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="ex: frontend, IA, urgent"
            className="bg-slate-700/60 border border-slate-600/50 rounded px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-600/60"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          data-testid="multiproject-create-submit"
          className="px-4 py-1.5 rounded bg-cyan-700/60 hover:bg-cyan-600/70 text-cyan-100 text-sm font-medium transition-colors"
        >
          Créer
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-1.5 rounded bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 text-sm transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const MultiProjectDashboard: React.FC = () => {
  const [projects, setProjects] = useState<MultiProject[]>([]);
  const [rollup, setRollup] = useState<MultiProjectRollup | null>(null);
  const [agentStatus, setAgentStatus] = useState<MultiProjectAgentStatus | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    setProjects(listProjects());
    setRollup(getMultiProjectRollup());
    setAgentStatus(getMultiProjectAgentStatus());
  }, []);

  useEffect(() => {
    refresh();

    // Auto-refresh every 5 minutes (no health dispatch on mount — explicit only)
    autoRefreshRef.current = setInterval(() => {
      setProjects(listProjects());
      setRollup(getMultiProjectRollup());
      setAgentStatus(getMultiProjectAgentStatus());
    }, 5 * 60 * 1000);

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [refresh]);

  const handleCreated = useCallback(
    (_project: MultiProject) => {
      refresh();
    },
    [refresh]
  );

  const handleArchive = useCallback(
    (id: string) => {
      archiveProject(id);
      refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteProject(id);
      refresh();
    },
    [refresh]
  );

  const handleRefreshHealth = useCallback(
    async (id: string) => {
      setRefreshingId(id);
      try {
        await refreshProjectHealth(id);
        refresh();
      } finally {
        setRefreshingId(null);
      }
    },
    [refresh]
  );

  const nonArchivedProjects = projects.filter(p => p.status !== 'archived');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  return (
    <div
      data-testid="multiproject-dashboard"
      className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="text-cyan-400" size={24} />
          <div>
            <h1 className="text-xl font-bold text-slate-100">Gestion Multi-Projets</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Agent de coordination et allocation des ressources agents
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          aria-label="Rafraîchir le tableau de bord"
          className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Agent status */}
      {agentStatus && <AgentStatusCard status={agentStatus} />}

      {/* Rollup */}
      {rollup && <RollupCard rollup={rollup} />}

      {/* Create form */}
      <CreateForm onCreated={handleCreated} />

      {/* Project list */}
      <div data-testid="multiproject-project-list">
        {nonArchivedProjects.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-12">
            Aucun projet actif. Créez votre premier projet pour commencer.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nonArchivedProjects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRefreshHealth={handleRefreshHealth}
                refreshingId={refreshingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archived section */}
      {archivedProjects.length > 0 && (
        <details className="mt-6">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
            {archivedProjects.length} projet(s) archivé(s)
          </summary>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
            {archivedProjects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRefreshHealth={handleRefreshHealth}
                refreshingId={refreshingId}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default MultiProjectDashboard;
