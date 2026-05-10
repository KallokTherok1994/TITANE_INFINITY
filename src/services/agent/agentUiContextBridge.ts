/**
 * TITANE∞ v49 — Agent/Chat UI Context Bridge
 *
 * Provides a unified context surface for both the agent subsystem and the chat
 * conversational engine. Built on top of moduleRouteContext (the canonical
 * route-context truth bus) to guarantee a single source of truth for UI state.
 *
 * Exports:
 *   - getActiveUiContextForAgent()   — agent-optimised view
 *   - getActiveUiContextForChat()    — chat-optimised view
 *   - buildUnifiedTitaneContext()    — full unified context shape
 *   - UnifiedTitaneContext           — canonical type
 */

import {
  readActiveModuleContext,
  readRecentModuleContexts,
  type ModuleRouteContext,
  type ModuleDataTruthClass,
} from '@/services/chat/moduleRouteContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SurfaceStatus =
  | 'LIVE'
  | 'LIVE_WITH_FALLBACK'
  | 'MIXED'
  | 'SIMULATED'
  | 'GOVERNED'
  | 'BRIDGE'
  | 'UNKNOWN';

export interface UnifiedContextContinuity {
  sequence: number;
  changeType: 'initial' | 'same-module' | 'module-switch';
  fromRoute?: string;
  fromModuleId?: string;
}

export interface UnifiedContextProofState {
  lastUpdatedAt: number | null;
  sourceType: 'localStorage' | 'fallback';
  contextVersion: 'v1';
}

export interface RecentModuleSummary {
  moduleId: string;
  moduleName: string;
  route: string;
  updatedAt: number;
}

/** Full unified TITANE context shared by agent and chat subsystems. */
export interface UnifiedTitaneContext {
  // Route & page identity
  route: string;
  fullRoute: string;
  pageState?: string;
  aliasResolvedFrom?: string;

  // Module classification
  moduleId: string;
  moduleName: string;
  moduleType: string;
  pageTitle: string;

  // Truth classification
  truthClass: ModuleDataTruthClass;
  surfaceStatus: SurfaceStatus;

  // Capabilities & constraints
  capabilities: string[];
  actions: string[];
  limits: string[];
  memoryKeys: string[];

  // Continuity chain
  continuity: UnifiedContextContinuity;

  // Proof state
  proofState: UnifiedContextProofState;

  // Navigation history (last N modules)
  recentModules: RecentModuleSummary[];

  // Derived helpers
  blockers: string[];
  isSimulated: boolean;
  isLive: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const FALLBACK_CONTEXT: UnifiedTitaneContext = {
  route: '/',
  fullRoute: '/',
  moduleId: 'unknown_module',
  moduleName: 'Unknown Module',
  moduleType: 'unknown',
  pageTitle: 'Unknown',
  truthClass: 'MIXED_LIVE_AND_STATIC',
  surfaceStatus: 'UNKNOWN',
  capabilities: ['navigation'],
  actions: ['navigate'],
  limits: ['no-canonical-registry-entry'],
  memoryKeys: ['unknown_context'],
  continuity: { sequence: 0, changeType: 'initial' },
  proofState: { lastUpdatedAt: null, sourceType: 'fallback', contextVersion: 'v1' },
  recentModules: [],
  blockers: ['no-active-context-in-storage'],
  isSimulated: false,
  isLive: false,
};

function resolveSurfaceStatus(truthClass: ModuleDataTruthClass): SurfaceStatus {
  switch (truthClass) {
    case 'LIVE_TAURI':
      return 'LIVE';
    case 'LIVE_TAURI_WITH_FALLBACK':
      return 'LIVE_WITH_FALLBACK';
    case 'MIXED_LIVE_AND_STATIC':
      return 'MIXED';
    case 'SIMULATED_UI':
      return 'SIMULATED';
    case 'LIVE_TAURI_GOVERNED':
      return 'GOVERNED';
    case 'LIVE_TAURI_SERVICE_BRIDGE':
      return 'BRIDGE';
    case 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI':
      return 'LIVE_WITH_FALLBACK';
    default:
      return 'UNKNOWN';
  }
}

function deriveBlockers(ctx: ModuleRouteContext): string[] {
  const blockers: string[] = [];
  if (ctx.dataTruthClass === 'SIMULATED_UI') {
    blockers.push('module-is-simulated-ui');
  }
  if (ctx.limits.some(l => l.includes('fallback'))) {
    blockers.push('fallback-possible');
  }
  return blockers;
}

function toRecentSummary(ctx: ModuleRouteContext): RecentModuleSummary {
  return {
    moduleId: ctx.moduleId,
    moduleName: ctx.moduleName,
    route: ctx.route,
    updatedAt: ctx.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Core builder
// ---------------------------------------------------------------------------

/**
 * Build a UnifiedTitaneContext from a live ModuleRouteContext.
 * Returns the FALLBACK_CONTEXT when no active context is present.
 */
export function buildUnifiedTitaneContext(historyLimit = 8): UnifiedTitaneContext {
  const active = readActiveModuleContext();

  if (!active) {
    return { ...FALLBACK_CONTEXT };
  }

  const recent = readRecentModuleContexts(historyLimit + 1)
    .filter(r => r.moduleId !== active.moduleId || r.updatedAt !== active.updatedAt)
    .slice(-historyLimit)
    .map(toRecentSummary);

  const surfaceStatus = resolveSurfaceStatus(active.dataTruthClass);
  const blockers = deriveBlockers(active);

  return {
    route: active.route,
    fullRoute: active.fullRoute ?? active.route,
    pageState: active.pageState,
    aliasResolvedFrom: active.aliasResolvedFrom,

    moduleId: active.moduleId,
    moduleName: active.moduleName,
    moduleType: active.moduleType,
    pageTitle: active.pageTitle,

    truthClass: active.dataTruthClass,
    surfaceStatus,

    capabilities: [...active.capabilities],
    actions: [...active.actions],
    limits: [...active.limits],
    memoryKeys: [...active.memoryKeys],

    continuity: { ...active.continuity },

    proofState: {
      lastUpdatedAt: active.updatedAt,
      sourceType: 'localStorage',
      contextVersion: 'v1',
    },

    recentModules: recent,
    blockers,
    isSimulated: active.dataTruthClass === 'SIMULATED_UI',
    isLive:
      active.dataTruthClass === 'LIVE_TAURI' ||
      active.dataTruthClass === 'LIVE_TAURI_GOVERNED' ||
      active.dataTruthClass === 'LIVE_TAURI_SERVICE_BRIDGE',
  };
}

// ---------------------------------------------------------------------------
// Agent-optimised view
// ---------------------------------------------------------------------------

/**
 * Returns a unified context optimised for the agent subsystem.
 * Agents use moduleId, truthClass, capabilities, and blockers to decide routing.
 */
export function getActiveUiContextForAgent(): UnifiedTitaneContext {
  return buildUnifiedTitaneContext(8);
}

// ---------------------------------------------------------------------------
// Chat-optimised view
// ---------------------------------------------------------------------------

/**
 * Returns a unified context optimised for the conversational engine.
 * Chat uses pageTitle, moduleName, capabilities, and recentModules for context injection.
 */
export function getActiveUiContextForChat(): UnifiedTitaneContext {
  return buildUnifiedTitaneContext(5);
}
