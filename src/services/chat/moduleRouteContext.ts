/**
 * TITANE∞ v44 — Module Route Context Bridge
 * Tracks active module/route context for chat contextual binding and continuity.
 */

export type ModuleDataTruthClass =
  | 'LIVE_TAURI'
  | 'LIVE_TAURI_WITH_FALLBACK'
  | 'MIXED_LIVE_AND_STATIC'
  | 'SIMULATED_UI'
  | 'LIVE_TAURI_GOVERNED'
  | 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI'
  | 'LIVE_TAURI_SERVICE_BRIDGE';

export interface ModuleRouteContext {
  route: string;
  aliasResolvedFrom?: string;
  moduleId: string;
  moduleName: string;
  moduleType: string;
  pageTitle: string;
  capabilities: string[];
  dataTruthClass: ModuleDataTruthClass;
  actions: string[];
  limits: string[];
  memoryKeys: string[];
  updatedAt: number;
  continuity: {
    sequence: number;
    changeType: 'initial' | 'same-module' | 'module-switch';
    fromRoute?: string;
    fromModuleId?: string;
  };
}

interface ModuleRouteDefinition {
  moduleId: string;
  moduleName: string;
  moduleType: string;
  pageTitle: string;
  capabilities: string[];
  dataTruthClass: ModuleDataTruthClass;
  actions: string[];
  limits: string[];
  memoryKeys: string[];
}

const STORAGE_ACTIVE_KEY = 'titane_chat_active_module_context_v1';
const STORAGE_HISTORY_KEY = 'titane_chat_module_context_history_v1';
const HISTORY_MAX = 40;

const ROUTE_ALIASES: Record<string, string> = {
  '/': '/titane',
  '/chat': '/titane',
  '/camera': '/titane',
  '/evo': '/titane',
  '/dashboard': '/titane',
  '/cognitive-evolution': '/titane',
  '/identity-memory-evolution': '/titane',
  '/progression': '/titane',
  '/xp': '/titane',
  '/cognitive': '/stats',
  '/temporal-center': '/time',
  '/agenda': '/time',
  '/time-navigator': '/time',
  '/system-center': '/admin',
  '/diagnostics': '/admin',
  '/devtools': '/admin',
  '/cluster': '/admin',
  '/introspection': '/admin',
  '/hypervision': '/admin',
  '/configuration': '/admin',
  '/design-center': '/admin',
  '/design-system': '/admin',
  '/settings': '/admin',
  '/governance-center': '/admin',
  '/governance': '/admin',
  '/secure': '/admin',
  '/audio-center': '/admin',
  '/audio': '/admin',
  '/voice': '/admin',
  '/tts': '/admin',
  '/meta': '/orchestration-center',
  '/meta-center': '/orchestration-center',
  '/multi-ai-dashboard': '/orchestration-center',
  '/nexus-engine': '/orchestration-center',
  '/harmonia-engine': '/orchestration-center',
  '/cognitive-state': '/orchestration-center',
  '/orchestration': '/orchestration-intelligence',
  '/one-core': '/dev',
  '/command-center': '/dev',
  '/unified': '/dev',
  '/qa-monitoring': '/dev',
  '/qa': '/dev',
  '/monitoring': '/dev',
  '/tests': '/dev',
  '/developer-mode': '/dev',
  '/dev-mode': '/dev',
  '/devmode': '/dev',
  '/ia-dev': '/dev',
  '/reality': '/reality-center',
  '/renderer': '/reality-center',
  '/hyper': '/hyper-center',
  '/intelligence': '/hyper-center',
  '/quantum': '/quantum-center',
  '/identity': '/identity-center',
  '/persona': '/identity-center',
  '/memory-evo': '/memory-evolution',
  '/cloud-sync': '/cloud',
  '/vault': '/cloud',
};

const MODULE_REGISTRY: Record<string, ModuleRouteDefinition> = {
  '/titane': {
    moduleId: 'titane_core',
    moduleName: 'Titane Core',
    moduleType: 'core-chat',
    pageTitle: 'TITANE',
    capabilities: ['chat', 'provider-routing', 'runtime-truth', 'research-handoff'],
    dataTruthClass: 'MIXED_LIVE_AND_STATIC',
    actions: ['send_message', 'switch_mode', 'switch_provider', 'refresh_runtime_truth'],
    limits: ['provider-quality-conditional', 'module-context-not-global-by-default'],
    memoryKeys: ['titane_chat_mode_*', 'conversationId', 'runtime.providerMeta'],
  },
  '/stats': {
    moduleId: 'stats_cognitive',
    moduleName: 'Stats Cognitive',
    moduleType: 'analytics',
    pageTitle: 'Stats',
    capabilities: ['orchestration-cognitive-state', 'engine-subscriptions'],
    dataTruthClass: 'LIVE_TAURI',
    actions: ['read_cognitive_state'],
    limits: ['read-mostly-module'],
    memoryKeys: ['cognitive_metrics_cache'],
  },
  '/time': {
    moduleId: 'time_center',
    moduleName: 'Time Center',
    moduleType: 'planning',
    pageTitle: 'Time',
    capabilities: ['snapshot-list', 'restore', 'travel-stats'],
    dataTruthClass: 'MIXED_LIVE_AND_STATIC',
    actions: ['list_snapshots', 'restore_snapshot', 'delete_snapshot', 'force_snapshot'],
    limits: ['contains-mock-timeline-block'],
    memoryKeys: ['time_page_filters', 'snapshot_selection'],
  },
  '/admin': {
    moduleId: 'admin_center',
    moduleName: 'Admin Center',
    moduleType: 'administration',
    pageTitle: 'Admin',
    capabilities: ['system-controls', 'governance-panels', 'design/audio panels'],
    dataTruthClass: 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
    actions: ['load_admin_panels'],
    limits: ['panel-content-varies-by-lazy-module'],
    memoryKeys: ['admin_panel_state'],
  },
  '/dev': {
    moduleId: 'dev_center',
    moduleName: 'Dev Center',
    moduleType: 'operations',
    pageTitle: 'Dev',
    capabilities: ['qa-monitoring', 'orchestration-unified-state'],
    dataTruthClass: 'LIVE_TAURI_WITH_FALLBACK',
    actions: ['refresh_dev_state', 'run_suite'],
    limits: ['fallback-mock-orchestration-possible'],
    memoryKeys: ['dev_active_section', 'qa_filters'],
  },
  '/orchestration-center': {
    moduleId: 'orchestration_meta',
    moduleName: 'Orchestration Meta Center',
    moduleType: 'orchestration',
    pageTitle: 'Orchestration',
    capabilities: ['orchestrator-state', 'multi-ai-state', 'run-cycle'],
    dataTruthClass: 'LIVE_TAURI_WITH_FALLBACK',
    actions: ['orchestrator_get_state', 'orchestrator_set_mode', 'orchestrator_run_cycle'],
    limits: ['fallback-default-state-when-backend-unavailable'],
    memoryKeys: ['orchestration_meta_state'],
  },
  '/orchestration-intelligence': {
    moduleId: 'orchestration_intelligence',
    moduleName: 'Orchestration Intelligence Center',
    moduleType: 'dashboard',
    pageTitle: 'Orchestration Intelligence',
    capabilities: ['overview', 'meta-tabs', 'multi-ia-visualization'],
    dataTruthClass: 'SIMULATED_UI',
    actions: ['switch_tab'],
    limits: ['primarily-static-representation'],
    memoryKeys: ['orchestration_intelligence_tab'],
  },
  '/reality-center': {
    moduleId: 'reality_center',
    moduleName: 'Reality Center',
    moduleType: 'simulation',
    pageTitle: 'Reality',
    capabilities: ['render-frame', 'physics-toggle', 'entity-actions'],
    dataTruthClass: 'LIVE_TAURI_WITH_FALLBACK',
    actions: ['reality_get_state', 'reality_render_frame', 'reality_set_config'],
    limits: ['init-fallback-when-state-missing'],
    memoryKeys: ['reality_render_config'],
  },
  '/hyper-center': {
    moduleId: 'hyper_center',
    moduleName: 'Hyper Center',
    moduleType: 'reasoning',
    pageTitle: 'Hyper',
    capabilities: ['think', 'reason', 'imagine', 'insight'],
    dataTruthClass: 'LIVE_TAURI_WITH_FALLBACK',
    actions: ['hyper_think', 'hyper_reason', 'hyper_imagine', 'hyper_generate_insight'],
    limits: ['init-fallback-possible'],
    memoryKeys: ['hyper_mode', 'hyper_prompts_recent'],
  },
  '/quantum-center': {
    moduleId: 'quantum_center',
    moduleName: 'Quantum Center',
    moduleType: 'rendering',
    pageTitle: 'Quantum',
    capabilities: ['ui-metrics-simulation', 'cache-visualization'],
    dataTruthClass: 'SIMULATED_UI',
    actions: ['toggle_quantum_runtime_ui'],
    limits: ['mock-driven-metrics'],
    memoryKeys: ['quantum_tab'],
  },
  '/identity-center': {
    moduleId: 'identity_center',
    moduleName: 'Identity Center',
    moduleType: 'identity',
    pageTitle: 'Identity',
    capabilities: ['identity-matrix', 'voice-profiles', 'mode-rules'],
    dataTruthClass: 'LIVE_TAURI_WITH_FALLBACK',
    actions: ['identity_set_mode', 'identity_toggle_rule'],
    limits: ['dev-mock-block-present'],
    memoryKeys: ['identity_mode', 'voice_profile'],
  },
  '/memory-evolution': {
    moduleId: 'memory_evolution',
    moduleName: 'Memory Evolution',
    moduleType: 'memory',
    pageTitle: 'Memory Evolution',
    capabilities: ['hierarchy-health', 'clustering', 'repair', 'backup'],
    dataTruthClass: 'LIVE_TAURI',
    actions: ['memory_parse', 'memory_synthesize', 'memory_check_repair'],
    limits: ['operation-latency-variable'],
    memoryKeys: ['memory_evolution_pipeline_state'],
  },
  '/memory': {
    moduleId: 'memory_page',
    moduleName: 'Memory Page',
    moduleType: 'memory',
    pageTitle: 'Memory',
    capabilities: ['memory-list', 'memory-save', 'memory-clear'],
    dataTruthClass: 'LIVE_TAURI_SERVICE_BRIDGE',
    actions: ['memory_get_state', 'save_chat_interaction', 'memory_clear'],
    limits: ['legacy-memory-endpoints-coexist'],
    memoryKeys: ['memory_entries_ui_state'],
  },
  '/research': {
    moduleId: 'research_page',
    moduleName: 'Research Page',
    moduleType: 'research',
    pageTitle: 'Research',
    capabilities: ['web_research_governed', 'trace_markers', 'citation_view'],
    dataTruthClass: 'LIVE_TAURI_GOVERNED',
    actions: ['web_research'],
    limits: ['web-live-can-be-blocked-by-policy-or-credentials'],
    memoryKeys: ['research_last_query', 'research_last_trace'],
  },
  '/cloud': {
    moduleId: 'cloud_center',
    moduleName: 'Cloud Center',
    moduleType: 'sync',
    pageTitle: 'Cloud',
    capabilities: ['cloud_status', 'sync_push', 'sync_pull', 'vault_integrity'],
    dataTruthClass: 'LIVE_TAURI',
    actions: ['cloud_get_status', 'cloud_sync_push', 'cloud_sync_pull', 'cloud_verify_integrity'],
    limits: ['requires-initialization-and-passphrase'],
    memoryKeys: ['cloud_sync_status', 'device_identity'],
  },
};

const UNKNOWN_DEFINITION: ModuleRouteDefinition = {
  moduleId: 'unknown_module',
  moduleName: 'Unknown Module',
  moduleType: 'unknown',
  pageTitle: 'Unknown',
  capabilities: ['navigation'],
  dataTruthClass: 'MIXED_LIVE_AND_STATIC',
  actions: ['navigate'],
  limits: ['no-canonical-registry-entry'],
  memoryKeys: ['unknown_context'],
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors: context sync remains best-effort.
  }
}

function normalizeRoute(pathname: string): { route: string; aliasResolvedFrom?: string } {
  const route = pathname.split('?')[0] || '/';
  const canonical = ROUTE_ALIASES[route];

  if (!canonical) {
    return { route };
  }

  return { route: canonical, aliasResolvedFrom: route };
}

function getDefinition(route: string): ModuleRouteDefinition {
  return MODULE_REGISTRY[route] || UNKNOWN_DEFINITION;
}

export function readActiveModuleContext(): ModuleRouteContext | null {
  return readJson<ModuleRouteContext>(STORAGE_ACTIVE_KEY);
}

export function readRecentModuleContexts(limit = 8): ModuleRouteContext[] {
  const history = readJson<ModuleRouteContext[]>(STORAGE_HISTORY_KEY) || [];
  if (limit <= 0) return [];
  return history.slice(-limit);
}

export function publishActiveModuleContext(pathname: string): ModuleRouteContext {
  const previous = readActiveModuleContext();
  const normalized = normalizeRoute(pathname);
  const definition = getDefinition(normalized.route);
  const now = Date.now();

  const changeType: ModuleRouteContext['continuity']['changeType'] = !previous
    ? 'initial'
    : previous.moduleId === definition.moduleId
      ? 'same-module'
      : 'module-switch';

  const context: ModuleRouteContext = {
    route: normalized.route,
    aliasResolvedFrom: normalized.aliasResolvedFrom,
    moduleId: definition.moduleId,
    moduleName: definition.moduleName,
    moduleType: definition.moduleType,
    pageTitle: definition.pageTitle,
    capabilities: definition.capabilities,
    dataTruthClass: definition.dataTruthClass,
    actions: definition.actions,
    limits: definition.limits,
    memoryKeys: definition.memoryKeys,
    updatedAt: now,
    continuity: {
      sequence: (previous?.continuity.sequence || 0) + 1,
      changeType,
      fromRoute: previous?.route,
      fromModuleId: previous?.moduleId,
    },
  };

  writeJson(STORAGE_ACTIVE_KEY, context);

  const history = readJson<ModuleRouteContext[]>(STORAGE_HISTORY_KEY) || [];
  const nextHistory = [...history, context].slice(-HISTORY_MAX);
  writeJson(STORAGE_HISTORY_KEY, nextHistory);

  return context;
}