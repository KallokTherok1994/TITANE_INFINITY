/**
 * TITANE∞ — NEXUS v36 Route Index (GATE 12 Surface Migration)
 *
 * Typed runtime route classification derived from the Gate 7 Surface Decision Matrix.
 * This is a pure data file — no runtime side effects.
 *
 * Used by:
 *   - Command Palette (filtering by mode)
 *   - NexusShell (mode-aware nav)
 *   - TruthBadge (surface truth class — wired in Gate 13)
 *
 * Source: docs/nexus-v36/07_SURFACE_DECISION_MATRIX.json (Gate 7, 30/30 classified)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TruthClass =
  | 'LIVE_TAURI'
  | 'LIVE_TAURI_WITH_FALLBACK'
  | 'LIVE_TAURI_GOVERNED'
  | 'LIVE_TAURI_SERVICE_BRIDGE'
  | 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI'
  | 'MIXED_LIVE_AND_STATIC'
  | 'SIMULATED_UI'
  | 'DISPLAY_ONLY';

export type SurfaceDecision =
  | 'KEEP_DAILY'
  | 'KEEP_SYSTEM'
  | 'KEEP_DEV'
  | 'KEEP_SIMULATED'
  | 'KEEP_DISPLAY_ONLY';

export interface RouteEntry {
  readonly route: string;
  readonly pageId: string;
  readonly component: string;
  readonly navOwner: string | null;
  readonly truthClass: TruthClass;
  readonly decision: SurfaceDecision;
  readonly inDailyMode: boolean;
  readonly aliasCount: number;
}

// ─── Route Index (30/30 classified) ──────────────────────────────────────────

export const ROUTE_INDEX: ReadonlyArray<RouteEntry> = [
  // ── KEEP_DAILY (11 routes) ───────────────────────────────────────────────
  {
    route: '/titane',
    pageId: 'titane_core',
    component: 'TitanePage',
    navOwner: 'titane',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 12,
  },
  {
    route: '/experience',
    pageId: 'experience_page',
    component: 'Experience',
    navOwner: 'titane',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 1,
  },
  {
    route: '/time',
    pageId: 'time_center',
    component: 'TimePage',
    navOwner: 'time',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 3,
  },
  {
    route: '/memory',
    pageId: 'memory_page',
    component: 'Memory',
    navOwner: 'titane',
    truthClass: 'LIVE_TAURI_SERVICE_BRIDGE',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 0,
  },
  {
    route: '/twins',
    pageId: 'twins_page',
    component: 'TwinsPage',
    navOwner: 'twins',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 4,
  },
  {
    route: '/research',
    pageId: 'research_page',
    component: 'ResearchPage',
    navOwner: 'titane',
    truthClass: 'LIVE_TAURI_GOVERNED',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 0,
  },
  {
    route: '/multiproject',
    pageId: 'multiproject_dashboard',
    component: 'MultiProjectDashboard',
    navOwner: 'projects',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 0,
  },
  {
    route: '/skills',
    pageId: 'skill_os',
    component: 'SkillManager',
    navOwner: 'titane',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 0,
  },
  {
    route: '/knowledge',
    pageId: 'knowledge_page',
    component: 'KnowledgeFusionPage',
    navOwner: 'titane',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 0,
  },
  {
    route: '/creation',
    pageId: 'creation_studio',
    component: 'CreationStudio',
    navOwner: 'titane',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 0,
  },
  {
    route: '/evolution',
    pageId: 'evolution_monitor',
    component: 'EvolutionMonitor',
    navOwner: 'titane',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_DAILY',
    inDailyMode: true,
    aliasCount: 0,
  },
  // ── KEEP_SYSTEM (14 routes) ──────────────────────────────────────────────
  {
    route: '/admin',
    pageId: 'admin_center',
    component: 'AdminPage',
    navOwner: 'admin',
    truthClass: 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 17,
  },
  {
    route: '/fusion',
    pageId: 'fusion_center',
    component: 'PerfectFusionDashboard',
    navOwner: 'fusion',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 0,
  },
  {
    route: '/optimization',
    pageId: 'optimization_center',
    component: 'UltimateOptimizationDashboard',
    navOwner: 'optimization',
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 0,
  },
  {
    route: '/orchestration-center',
    pageId: 'orchestration_meta',
    component: 'OrchestrationMetaCenter',
    navOwner: 'dev',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 6,
  },
  {
    route: '/reality-center',
    pageId: 'reality_center',
    component: 'RealityCenter',
    navOwner: 'fusion',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 2,
  },
  {
    route: '/hyper-center',
    pageId: 'hyper_center',
    component: 'HyperCenter',
    navOwner: 'fusion',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 2,
  },
  {
    route: '/cloud',
    pageId: 'cloud_center',
    component: 'CloudCenter',
    navOwner: 'fusion',
    truthClass: 'LIVE_TAURI',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 2,
  },
  {
    route: '/doc-center',
    pageId: 'doc_center',
    component: 'DocCenterPage',
    navOwner: null,
    truthClass: 'LIVE_TAURI_GOVERNED',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 1,
  },
  {
    route: '/singularity',
    pageId: 'singularity_monitor',
    component: 'SingularityMonitor',
    navOwner: 'dev',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 0,
  },
  {
    route: '/sentinel',
    pageId: 'sentinel_guard',
    component: 'Sentinel',
    navOwner: 'dev',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 0,
  },
  {
    route: '/watchdog',
    pageId: 'watchdog_monitor',
    component: 'Watchdog',
    navOwner: 'dev',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 0,
  },
  {
    route: '/selfheal',
    pageId: 'selfheal_engine',
    component: 'SelfHeal',
    navOwner: 'dev',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 0,
  },
  {
    route: '/adaptive',
    pageId: 'adaptive_engine',
    component: 'AdaptiveEngine',
    navOwner: 'dev',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 0,
  },
  {
    route: '/htf',
    pageId: 'htf_page',
    component: 'HTFPage',
    navOwner: null,
    truthClass: 'MIXED_LIVE_AND_STATIC',
    decision: 'KEEP_SYSTEM',
    inDailyMode: false,
    aliasCount: 0,
  },
  // ── KEEP_DEV (2 routes) ──────────────────────────────────────────────────
  {
    route: '/dev',
    pageId: 'dev_center',
    component: 'DevPage',
    navOwner: 'dev',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_DEV',
    inDailyMode: false,
    aliasCount: 13,
  },
  {
    route: '/total-dev',
    pageId: 'total_dev_center',
    component: 'TotalDevPage',
    navOwner: 'total-dev',
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    decision: 'KEEP_DEV',
    inDailyMode: false,
    aliasCount: 0,
  },
  // ── KEEP_DISPLAY_ONLY (1 route) ──────────────────────────────────────────
  {
    route: '/performance',
    pageId: 'performance_test',
    component: 'PerformanceTest',
    navOwner: 'optimization',
    truthClass: 'DISPLAY_ONLY',
    decision: 'KEEP_DISPLAY_ONLY',
    inDailyMode: false,
    aliasCount: 0,
  },
  // ── KEEP_SIMULATED (2 routes) ────────────────────────────────────────────
  {
    route: '/orchestration-intelligence',
    pageId: 'orchestration_intelligence',
    component: 'OrchestrationIntelligenceCenter',
    navOwner: 'dev',
    truthClass: 'SIMULATED_UI',
    decision: 'KEEP_SIMULATED',
    inDailyMode: false,
    aliasCount: 1,
  },
  {
    route: '/quantum-center',
    pageId: 'quantum_center',
    component: 'QuantumCenter',
    navOwner: 'fusion',
    truthClass: 'SIMULATED_UI',
    decision: 'KEEP_SIMULATED',
    inDailyMode: false,
    aliasCount: 1,
  },
] as const;

// ─── Derived lookup helpers ───────────────────────────────────────────────────

/** All routes by decision category */
export const DAILY_ENTRIES = ROUTE_INDEX.filter(r => r.decision === 'KEEP_DAILY');
export const SYSTEM_ENTRIES = ROUTE_INDEX.filter(r => r.decision === 'KEEP_SYSTEM');
export const DEV_ENTRIES = ROUTE_INDEX.filter(r => r.decision === 'KEEP_DEV');
export const SIMULATED_ENTRIES = ROUTE_INDEX.filter(r => r.decision === 'KEEP_SIMULATED');
export const DISPLAY_ONLY_ENTRIES = ROUTE_INDEX.filter(r => r.decision === 'KEEP_DISPLAY_ONLY');

/** Look up a route entry by path (strips query string). Returns undefined if unclassified. */
export function getRouteEntry(pathname: string): RouteEntry | undefined {
  const clean = pathname.split('?')[0] ?? pathname;
  return ROUTE_INDEX.find(r => r.route === clean);
}

/** True if the route is classified as SIMULATED_UI (must show badge, never in Daily nav). */
export function isSimulatedEntry(pathname: string): boolean {
  return getRouteEntry(pathname)?.decision === 'KEEP_SIMULATED';
}
