/**
 * TITANE_INFINITY — UI Surface Registry
 * Single source of truth for all routes, pages, tabs, actions, backend sync.
 * Generated: 2026-05-09 | Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46
 *
 * Rules:
 * - No ACTIVE_SYNCED without runtime proof (canClaimSyncedWithoutRuntime = false)
 * - No silent fallback: fallbackPolicy must be explicit
 * - SIMULATED_UI must be honestly labelled
 * - Every alias must resolve to a known canonical route
 */

import type { UiSurfaceDefinition, UiSurfaceAlias } from './uiSurfaceRegistry.schema';

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL SURFACE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const SURFACES: UiSurfaceDefinition[] = [
  // ══════════════════════════════════════════════════════
  // /titane — Core Chat + Vision + EVO
  // ══════════════════════════════════════════════════════
  {
    route: '/titane',
    canonical: true,
    navOwner: 'titane',
    pageId: 'titane_core',
    pageComponent: 'TitanePage',
    rootTestId: 'page-titane',
    aliases: [
      { from: '/', to: '/titane', notes: 'Root redirect' },
      { from: '/titane.sh', to: '/titane', notes: 'Shell alias' },
      { from: '/chat', to: '/titane?tab=conversation', notes: 'Legacy chat alias' },
      { from: '/camera', to: '/titane', notes: 'Legacy camera alias' },
      { from: '/evo', to: '/titane', notes: 'Legacy evo alias' },
      { from: '/dashboard', to: '/titane', notes: 'Legacy dashboard alias' },
      { from: '/evolution-center', to: '/titane', notes: 'Legacy evolution center' },
      { from: '/cognitive-evolution', to: '/titane', notes: 'Legacy cognitive evo' },
      {
        from: '/identity-memory-evolution',
        to: '/titane',
        notes: 'Legacy identity-memory-evo',
      },
      { from: '/progression', to: '/titane', notes: 'Legacy progression alias' },
      {
        from: '/memory-evo',
        to: '/titane?tab=transformation',
        notes: 'Memory evo → transformation tab',
      },
      {
        from: '/memory-evolution',
        to: '/titane?tab=transformation',
        notes: 'Memory evolution → transformation tab',
      },
    ],
    tabs: [
      {
        tabId: 'conversation',
        label: 'Conversation',
        testId: 'tab-conversation',
        selector: '[data-testid="tab-conversation"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'MIXED_LIVE_AND_STATIC',
        backendCommands: [
          'ai_get_response',
          'ai_generate_local_stream',
          'ai_send_prompt',
        ],
        notes: 'Live AI chat via OMEGA pipeline; provider quality conditional',
      },
      {
        tabId: 'overview',
        label: 'Overview',
        testId: 'tab-overview',
        selector: '[data-testid="tab-overview"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'MIXED_LIVE_AND_STATIC',
        backendCommands: [],
        notes: 'Overview panel; mix of live status and static metrics',
      },
      {
        tabId: 'vision',
        label: 'Vision',
        testId: 'tab-vision',
        selector: '[data-testid="tab-vision"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
        backendCommands: ['analyze_image', 'analyze_image_path'],
        notes: 'Camera/image analysis via Tauri; fallback when camera unavailable',
      },
      {
        tabId: 'memory',
        label: 'Memory',
        testId: 'tab-memory',
        selector: '[data-testid="tab-memory"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_SERVICE_BRIDGE',
        backendCommands: ['persistent_memory_read', 'persistent_memory_get_stats'],
        notes: 'Memory sub-tabs: overview, dashboard, tree, search',
      },
      {
        tabId: 'progression',
        label: 'Progression',
        testId: 'tab-progression',
        selector: '[data-testid="tab-progression"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'MIXED_LIVE_AND_STATIC',
        backendCommands: [],
        notes: 'XP/level progression; mostly derived from local state',
      },
      {
        tabId: 'transformation',
        label: 'Transformation',
        testId: 'tab-transformation',
        selector: '[data-testid="tab-transformation"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI',
        backendCommands: [
          'memory_get_clusters',
          'memory_get_status',
          'persistent_memory_get_stats',
        ],
        notes: 'Memory evolution / transform — formerly /memory-evolution',
      },
    ],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'ai_get_response',
      'ai_generate_local_stream',
      'ai_send_prompt',
      'ai_check_ollama_status',
      'analyze_image',
      'analyze_image_path',
      'persistent_memory_read',
      'persistent_memory_get_stats',
      'memory_get_clusters',
      'memory_get_status',
    ],
    visibleActions: [
      {
        actionId: 'send_message',
        label: 'Send message',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'ai_get_response',
      },
      {
        actionId: 'switch_provider',
        label: 'Switch AI provider',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'ai_set_model',
      },
      {
        actionId: 'analyze_image',
        label: 'Analyze image',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'analyze_image',
      },
      { actionId: 'switch_tab', label: 'Switch tab', wiringStatus: 'DISPLAY_ONLY' },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'VITEST_UNIT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Provider quality conditional; browser mode shows BackendDownIndicator',
    staleAfterMs: 30000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/TitanePage.tsx'],
    notes:
      'Core page. ACTIVE_PARTIAL: chat live, some tabs partial. Transformation tab receives /memory-evo aliases.',
  },

  // ══════════════════════════════════════════════════════
  // /experience — XP Progression
  // ══════════════════════════════════════════════════════
  {
    route: '/experience',
    canonical: true,
    navOwner: 'titane',
    pageId: 'experience_page',
    pageComponent: 'Experience',
    rootTestId: 'page-experience',
    aliases: [{ from: '/xp', to: '/experience', notes: 'Legacy XP alias' }],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [],
    visibleActions: [
      {
        actionId: 'read_progression',
        label: 'Read XP state',
        wiringStatus: 'DISPLAY_ONLY',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Read-mostly dashboard; no destructive write actions',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/Experience.tsx'],
    notes:
      'XP progression page. ACTIVE_PARTIAL: live progression data from store, no direct IPC writes.',
  },

  // ══════════════════════════════════════════════════════
  // /time — Temporal Center
  // ══════════════════════════════════════════════════════
  {
    route: '/time',
    canonical: true,
    navOwner: 'time',
    pageId: 'time_center',
    pageComponent: 'TimePage',
    rootTestId: 'page-time',
    aliases: [
      { from: '/temporal-center', to: '/time', notes: 'Legacy temporal center' },
      { from: '/agenda', to: '/time', notes: 'Legacy agenda alias' },
      { from: '/time-navigator', to: '/time', notes: 'Legacy time navigator' },
    ],
    tabs: [
      {
        tabId: 'time-now',
        label: 'Now',
        testId: 'tab-time-now',
        selector: '[data-testid="tab-time-now"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'MIXED_LIVE_AND_STATIC',
        backendCommands: ['read_time_runtime_context'],
      },
      {
        tabId: 'time-agenda',
        label: 'Agenda',
        testId: 'tab-time-agenda',
        selector: '[data-testid="tab-time-agenda"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
        backendCommands: [
          'agenda_load_events',
          'agenda_save_event',
          'agenda_delete_event',
          'agenda_sync',
        ],
      },
      {
        tabId: 'time-timeline',
        label: 'Timeline',
        testId: 'tab-time-timeline',
        selector: '[data-testid="tab-time-timeline"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'MIXED_LIVE_AND_STATIC',
        notes: 'Timeline mixes live agenda + static history blocks',
      },
      {
        tabId: 'time-snapshots',
        label: 'Snapshots',
        testId: 'tab-time-snapshots',
        selector: '[data-testid="tab-time-snapshots"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
        backendCommands: [
          'list_snapshots',
          'restore_snapshot',
          'delete_snapshot',
          'force_snapshot',
        ],
      },
      {
        tabId: 'time-cognitive',
        label: 'Cognitive',
        testId: 'tab-time-cognitive',
        selector: '[data-testid="tab-time-cognitive"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'MIXED_LIVE_AND_STATIC',
        notes: 'Cognitive flow sync; mix of live state and derived metrics',
      },
    ],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'agenda_load_events',
      'agenda_save_event',
      'agenda_delete_event',
      'agenda_sync',
      'list_snapshots',
      'restore_snapshot',
      'delete_snapshot',
      'force_snapshot',
      'add_timeline_event',
    ],
    visibleActions: [
      {
        actionId: 'read_time_context',
        label: 'Read time context',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'agenda_load_events',
      },
      {
        actionId: 'save_event',
        label: 'Save agenda event',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'agenda_save_event',
      },
      {
        actionId: 'delete_event',
        label: 'Delete agenda event',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'agenda_delete_event',
      },
      {
        actionId: 'restore_snapshot',
        label: 'Restore snapshot',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'restore_snapshot',
      },
      {
        actionId: 'force_snapshot',
        label: 'Force snapshot',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'force_snapshot',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'VITEST_UNIT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Timeline shows static history when live data unavailable; snapshots degrade gracefully',
    staleAfterMs: 60000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/TimePage.tsx'],
    notes:
      'Temporal hub. ACTIVE_PARTIAL: live agenda + snapshots IPC; timeline has static fallback.',
  },

  // ══════════════════════════════════════════════════════
  // /admin — Admin Center
  // ══════════════════════════════════════════════════════
  {
    route: '/admin',
    canonical: true,
    navOwner: 'admin',
    pageId: 'admin_center',
    pageComponent: 'AdminPage',
    rootTestId: 'page-admin',
    aliases: [
      { from: '/system-center', to: '/admin?tab=system', notes: 'System center alias' },
      {
        from: '/diagnostics',
        to: '/admin?tab=production-health',
        notes: 'Diagnostics alias',
      },
      {
        from: '/devtools',
        to: '/admin?tab=system&systemTab=devtools',
        notes: 'DevTools alias',
      },
      { from: '/cluster', to: '/admin?tab=production-health', notes: 'Cluster alias' },
      { from: '/introspection', to: '/admin?tab=system', notes: 'Introspection alias' },
      { from: '/hypervision', to: '/admin?tab=system', notes: 'Hypervision alias' },
      { from: '/configuration', to: '/admin?tab=config', notes: 'Configuration alias' },
      { from: '/design-center', to: '/admin?tab=design', notes: 'Design center alias' },
      { from: '/design-system', to: '/admin?tab=design', notes: 'Design system alias' },
      { from: '/settings', to: '/admin?tab=config', notes: 'Settings alias' },
      {
        from: '/governance-center',
        to: '/admin?tab=governance',
        notes: 'Governance center alias',
      },
      { from: '/governance', to: '/admin?tab=governance', notes: 'Governance alias' },
      {
        from: '/secure',
        to: '/admin?tab=governance',
        notes: 'Secure alias → governance',
      },
      { from: '/audio-center', to: '/admin?tab=audio', notes: 'Audio center alias' },
      { from: '/audio', to: '/admin?tab=audio', notes: 'Audio alias' },
      { from: '/voice', to: '/admin?tab=audio', notes: 'Voice alias' },
      { from: '/tts', to: '/admin?tab=audio', notes: 'TTS alias' },
    ],
    tabs: [
      {
        tabId: 'admin-system',
        label: 'System',
        testId: 'tab-admin-system',
        selector: '[data-testid="tab-admin-system"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
      },
      {
        tabId: 'admin-config',
        label: 'Config',
        testId: 'tab-admin-config',
        selector: '[data-testid="tab-admin-config"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
      },
      {
        tabId: 'admin-audio',
        label: 'Audio',
        testId: 'tab-admin-audio',
        selector: '[data-testid="tab-admin-audio"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
        backendCommands: ['audio_list_devices', 'analyze_audio'],
      },
      {
        tabId: 'admin-design',
        label: 'Design',
        testId: 'tab-admin-design',
        selector: '[data-testid="tab-admin-design"]',
        status: 'DISPLAY_ONLY',
        truthClass: 'STATIC_CURATED',
      },
      {
        tabId: 'admin-governance',
        label: 'Governance',
        testId: 'tab-admin-governance',
        selector: '[data-testid="tab-admin-governance"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
      },
      {
        tabId: 'admin-production-health',
        label: 'Production Health',
        testId: 'tab-admin-production-health',
        selector: '[data-testid="tab-admin-production-health"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
        backendCommands: ['ai_check_ollama_status'],
      },
    ],
    truthClass: 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'audio_list_devices',
      'audio_capture_start',
      'audio_capture_stop',
      'analyze_audio',
      'ai_check_ollama_status',
    ],
    visibleActions: [
      {
        actionId: 'load_panels',
        label: 'Load admin panels',
        wiringStatus: 'WIRED_FALLBACK',
      },
      {
        actionId: 'audio_devices',
        label: 'List audio devices',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'audio_list_devices',
      },
      {
        actionId: 'check_ollama',
        label: 'Check Ollama status',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'ai_check_ollama_status',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'VITEST_UNIT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Container lazy-loads panels; each panel degrades independently with its own fallback',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/AdminPage.tsx'],
    notes:
      'ACTIVE_PARTIAL: container page, panels lazy-loaded with independent fallbacks.',
  },

  // ══════════════════════════════════════════════════════
  // /dev — Dev Center
  // ══════════════════════════════════════════════════════
  {
    route: '/dev',
    canonical: true,
    navOwner: 'dev',
    pageId: 'dev_center',
    pageComponent: 'DevPage',
    rootTestId: 'page-dev',
    aliases: [
      {
        from: '/cognitive',
        to: '/dev?tab=diagnostics',
        notes: 'Cognitive → diagnostics tab',
      },
      { from: '/stats', to: '/dev?tab=diagnostics', notes: 'Stats → diagnostics tab' },
      { from: '/one-core', to: '/dev?tab=overview', notes: 'One-core alias' },
      {
        from: '/command-center',
        to: '/dev?tab=operations',
        notes: 'Command center alias',
      },
      { from: '/unified', to: '/dev?tab=overview', notes: 'Unified alias' },
      { from: '/qa-monitoring', to: '/dev?tab=validation', notes: 'QA monitoring alias' },
      { from: '/qa', to: '/dev?tab=validation', notes: 'QA alias' },
      { from: '/monitoring', to: '/dev?tab=diagnostics', notes: 'Monitoring alias' },
      { from: '/tests', to: '/dev?tab=validation', notes: 'Tests alias' },
      {
        from: '/developer-mode',
        to: '/dev?tab=operations',
        notes: 'Developer mode alias',
      },
      { from: '/dev-mode', to: '/dev?tab=operations', notes: 'Dev mode alias' },
      { from: '/devmode', to: '/dev?tab=operations', notes: 'Devmode alias' },
      { from: '/ia-dev', to: '/dev?tab=operations', notes: 'IA-dev alias' },
    ],
    tabs: [
      {
        tabId: 'dev-overview',
        label: 'Overview',
        testId: 'tab-dev-overview',
        selector: '[data-testid="tab-dev-overview"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
      },
      {
        tabId: 'dev-diagnostics',
        label: 'Diagnostics',
        testId: 'tab-dev-diagnostics',
        selector: '[data-testid="tab-dev-diagnostics"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
        backendCommands: ['ai_check_ollama_status', 'autofix_detect_typescript_errors'],
      },
      {
        tabId: 'dev-operations',
        label: 'Operations',
        testId: 'tab-dev-operations',
        selector: '[data-testid="tab-dev-operations"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
      },
      {
        tabId: 'dev-validation',
        label: 'Validation',
        testId: 'tab-dev-validation',
        selector: '[data-testid="tab-dev-validation"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
      },
      {
        tabId: 'dev-security',
        label: 'Security',
        testId: 'tab-dev-security',
        selector: '[data-testid="tab-dev-security"]',
        status: 'ACTIVE_PARTIAL',
        truthClass: 'LIVE_TAURI_WITH_FALLBACK',
      },
    ],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'ai_check_ollama_status',
      'autofix_detect_typescript_errors',
      'autofix_detect_rust_warnings',
      'autofix_fix_all',
      'autofix_get_stats',
      'autofix_get_history',
    ],
    visibleActions: [
      {
        actionId: 'refresh_dev_state',
        label: 'Refresh dev state',
        wiringStatus: 'WIRED_FALLBACK',
      },
      {
        actionId: 'run_autofix',
        label: 'Run autofix',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'autofix_fix_all',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'VITEST_UNIT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Fallback mock orchestration possible when backend unavailable',
    staleAfterMs: 30000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/DevPage.tsx'],
    notes:
      'ACTIVE_PARTIAL: live IPC for diagnostics and autofix; orchestration can fallback to mock.',
  },

  // ══════════════════════════════════════════════════════
  // /fusion — Fusion Dashboard
  // ══════════════════════════════════════════════════════
  {
    route: '/fusion',
    canonical: true,
    navOwner: 'fusion',
    pageId: 'fusion_center',
    pageComponent: 'PerfectFusionDashboard',
    rootTestId: 'page-fusion',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['ai_check_ollama_status'],
    visibleActions: [
      {
        actionId: 'refresh_fusion',
        label: 'Refresh fusion state',
        wiringStatus: 'WIRED_FALLBACK',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Dashboard health degrades gracefully when backend unavailable',
    staleAfterMs: 30000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/PerfectFusionDashboard.tsx'],
    notes:
      'ACTIVE_PARTIAL: observability dashboard. Backend/frontend health requires runtime for full truth.',
  },

  // ══════════════════════════════════════════════════════
  // /optimization — Ultimate Optimization
  // ══════════════════════════════════════════════════════
  {
    route: '/optimization',
    canonical: true,
    navOwner: 'optimization',
    pageId: 'optimization_center',
    pageComponent: 'UltimateOptimizationDashboard',
    rootTestId: 'page-optimization',
    aliases: [],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [],
    visibleActions: [
      {
        actionId: 'refresh_metrics',
        label: 'Refresh performance metrics',
        wiringStatus: 'WIRED_FALLBACK',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Some panels derive from local metrics; no destructive writes',
    staleAfterMs: 60000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/UltimateOptimizationDashboard.tsx'],
    notes:
      'ACTIVE_PARTIAL: performance dashboard; local metrics primary, some live signals.',
  },

  // ══════════════════════════════════════════════════════
  // /total-dev — Total Dev (GOD DEV Space)
  // ══════════════════════════════════════════════════════
  {
    route: '/total-dev',
    canonical: true,
    navOwner: 'total-dev',
    pageId: 'total_dev_center',
    pageComponent: 'TotalDevPage',
    rootTestId: 'page-total-dev',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['ai_get_response', 'ai_generate_local_stream'],
    visibleActions: [
      {
        actionId: 'dev_chat',
        label: 'Dev AI chat',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'ai_generate_local_stream',
        notes: 'Uses qwen2.5-coder, not PROD model',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Restricted surface; access gated. Fallback when backend unavailable.',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/TotalDevPage.tsx'],
    notes:
      'ACTIVE_PARTIAL: GOD DEV space; unlock-gated. DEV model (qwen2.5-coder), not PROD model.',
  },

  // ══════════════════════════════════════════════════════
  // /orchestration-intelligence
  // ══════════════════════════════════════════════════════
  {
    route: '/orchestration-intelligence',
    canonical: true,
    navOwner: 'dev',
    pageId: 'orchestration_intelligence',
    pageComponent: 'OrchestrationIntelligenceCenter',
    rootTestId: 'page-orchestration-intelligence',
    aliases: [
      {
        from: '/orchestration',
        to: '/orchestration-intelligence',
        notes: 'Orchestration alias',
      },
    ],
    tabs: [],
    truthClass: 'SIMULATED_UI',
    status: 'SIMULATED_UI',
    backendCommands: [],
    visibleActions: [
      { actionId: 'switch_tab', label: 'Switch tab', wiringStatus: 'DISPLAY_ONLY' },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Primarily static representation; no live backend. Must show SIMULATED badge.',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: true,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/modules/OrchestrationIntelligenceCenter.tsx'],
    simulationDisclosureApplied: true, // PageHealthBanner applied — verified 2026-05-09
    notes:
      'SIMULATED_UI: multi-IA/meta visualization. No live backend. Must visibly show SIMULATED_UI status.',
  },

  // ══════════════════════════════════════════════════════
  // /orchestration-center
  // ══════════════════════════════════════════════════════
  {
    route: '/orchestration-center',
    canonical: true,
    navOwner: 'dev',
    pageId: 'orchestration_meta',
    pageComponent: 'OrchestrationMetaCenter',
    rootTestId: 'page-orchestration-meta-center',
    aliases: [
      { from: '/meta-center', to: '/orchestration-center', notes: 'Meta center alias' },
      { from: '/meta', to: '/orchestration-center', notes: 'Meta alias' },
      {
        from: '/multi-ai-dashboard',
        to: '/orchestration-center',
        notes: 'Multi-AI dashboard alias',
      },
      { from: '/nexus-engine', to: '/orchestration-center', notes: 'Nexus engine alias' },
      {
        from: '/harmonia-engine',
        to: '/orchestration-center',
        notes: 'Harmonia engine alias',
      },
      {
        from: '/cognitive-state',
        to: '/orchestration-center',
        notes: 'Cognitive state alias',
      },
    ],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'orchestrator_get_state',
      'orchestrator_set_mode',
      'orchestrator_run_cycle',
    ],
    visibleActions: [
      {
        actionId: 'get_orchestrator_state',
        label: 'Get orchestrator state',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'orchestrator_get_state',
      },
      {
        actionId: 'run_cycle',
        label: 'Run orchestration cycle',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'orchestrator_run_cycle',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Default state shown when backend unavailable; fallback clearly indicated',
    staleAfterMs: 30000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/OrchestrationMetaCenter.tsx'],
    notes:
      'ACTIVE_PARTIAL: live orchestrator IPC with fallback. Fallback-default-state when backend unavailable.',
  },

  // ══════════════════════════════════════════════════════
  // /reality-center
  // ══════════════════════════════════════════════════════
  {
    route: '/reality-center',
    canonical: true,
    navOwner: 'fusion',
    pageId: 'reality_center',
    pageComponent: 'RealityCenter',
    rootTestId: 'page-reality-center',
    aliases: [
      { from: '/reality', to: '/reality-center', notes: 'Reality alias' },
      { from: '/renderer', to: '/reality-center', notes: 'Renderer alias' },
    ],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['reality_get_state', 'reality_render_frame', 'reality_set_config'],
    visibleActions: [
      {
        actionId: 'render_frame',
        label: 'Render frame',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'reality_render_frame',
      },
      {
        actionId: 'toggle_physics',
        label: 'Toggle physics',
        wiringStatus: 'WIRED_FALLBACK',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Init fallback when state missing; IPC degrades gracefully',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/RealityCenter.tsx'],
    notes: 'ACTIVE_PARTIAL: reality rendering IPC with fallback init state.',
  },

  // ══════════════════════════════════════════════════════
  // /hyper-center
  // ══════════════════════════════════════════════════════
  {
    route: '/hyper-center',
    canonical: true,
    navOwner: 'fusion',
    pageId: 'hyper_center',
    pageComponent: 'HyperCenter',
    rootTestId: 'page-hyper-center',
    aliases: [
      { from: '/hyper', to: '/hyper-center', notes: 'Hyper alias' },
      { from: '/intelligence', to: '/hyper-center', notes: 'Intelligence alias' },
    ],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'hyper_think',
      'hyper_reason',
      'hyper_imagine',
      'hyper_generate_insight',
    ],
    visibleActions: [
      {
        actionId: 'think',
        label: 'Hyper Think',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'hyper_think',
      },
      {
        actionId: 'reason',
        label: 'Hyper Reason',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'hyper_reason',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Init fallback possible; IPC commands degrade gracefully',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/components/HyperCenter/HyperCenter.tsx'],
    notes:
      'ACTIVE_PARTIAL: hyper-intelligence IPC with fallback. Commands may not exist in all builds.',
  },

  // ══════════════════════════════════════════════════════
  // /quantum-center — SIMULATED
  // ══════════════════════════════════════════════════════
  {
    route: '/quantum-center',
    canonical: true,
    navOwner: 'fusion',
    pageId: 'quantum_center',
    pageComponent: 'QuantumCenter',
    rootTestId: 'page-quantum-center',
    aliases: [{ from: '/quantum', to: '/quantum-center', notes: 'Quantum alias' }],
    tabs: [],
    truthClass: 'SIMULATED_UI',
    status: 'SIMULATED_UI',
    backendCommands: [],
    visibleActions: [
      {
        actionId: 'toggle_runtime',
        label: 'Toggle quantum runtime UI',
        wiringStatus: 'DISPLAY_ONLY',
        notes: 'UI only toggle, no backend',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'All data is mock/simulated. Must show SIMULATED_UI badge clearly.',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: true,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/components/QuantumCenter/QuantumCenter.tsx'],
    simulationDisclosureApplied: true, // PageHealthBanner applied — verified 2026-05-09
    notes:
      'SIMULATED_UI: mock-driven metrics and cache visualization. No real backend. Must visibly show SIMULATED_UI.',
  },

  // ══════════════════════════════════════════════════════
  // /twins — Digital Twin
  // ══════════════════════════════════════════════════════
  {
    route: '/twins',
    canonical: true,
    navOwner: 'twins',
    pageId: 'twins_page',
    pageComponent: 'TwinsPage',
    rootTestId: 'page-twins',
    aliases: [
      { from: '/identity-center', to: '/twins', notes: 'Identity center alias' },
      { from: '/identity', to: '/twins', notes: 'Identity alias' },
      { from: '/persona', to: '/twins', notes: 'Persona alias' },
      { from: '/twin', to: '/twins', notes: 'Twin singular alias' },
    ],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [],
    visibleActions: [
      { actionId: 'load_twins', label: 'Load twins page', wiringStatus: 'DISPLAY_ONLY' },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Static/curated twin data with live sync where available',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/TwinsPage.tsx'],
    notes:
      'ACTIVE_PARTIAL: identity/twin dashboard; mix live identity + static curation.',
  },

  // ══════════════════════════════════════════════════════
  // /cloud — Cloud Center
  // ══════════════════════════════════════════════════════
  {
    route: '/cloud',
    canonical: true,
    navOwner: 'fusion',
    pageId: 'cloud_center',
    pageComponent: 'CloudCenter',
    rootTestId: 'page-cloud-center',
    aliases: [
      { from: '/cloud-sync', to: '/cloud', notes: 'Cloud sync alias' },
      { from: '/vault', to: '/cloud', notes: 'Vault alias' },
    ],
    tabs: [],
    truthClass: 'LIVE_TAURI',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'cloud_get_status',
      'cloud_sync_push',
      'cloud_sync_pull',
      'cloud_verify_integrity',
    ],
    visibleActions: [
      {
        actionId: 'get_status',
        label: 'Get cloud status',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'cloud_get_status',
      },
      {
        actionId: 'sync_push',
        label: 'Sync push',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'cloud_sync_push',
        notes: 'Requires passphrase initialization',
      },
      {
        actionId: 'sync_pull',
        label: 'Sync pull',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'cloud_sync_pull',
        notes: 'Requires passphrase initialization',
      },
      {
        actionId: 'verify_integrity',
        label: 'Verify integrity',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'cloud_verify_integrity',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'VITEST_UNIT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Requires initialization and passphrase; shows blocked state when not initialized',
    staleAfterMs: 60000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/CloudCenter.tsx'],
    notes:
      'ACTIVE_PARTIAL: LIVE_TAURI cloud sync; blocked when not initialized or passphrase missing.',
  },

  // ══════════════════════════════════════════════════════
  // /memory — Memory Page
  // ══════════════════════════════════════════════════════
  {
    route: '/memory',
    canonical: true,
    navOwner: 'titane',
    pageId: 'memory_page',
    pageComponent: 'Memory',
    rootTestId: 'page-memory',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_SERVICE_BRIDGE',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'persistent_memory_read',
      'persistent_memory_get_stats',
      'persistent_memory_write_entry',
      'persistent_memory_delete_entry',
    ],
    visibleActions: [
      {
        actionId: 'read_memory',
        label: 'Read memory entries',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'persistent_memory_read',
      },
      {
        actionId: 'write_entry',
        label: 'Write memory entry',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'persistent_memory_write_entry',
      },
      {
        actionId: 'delete_entry',
        label: 'Delete memory entry',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'persistent_memory_delete_entry',
      },
      {
        actionId: 'get_stats',
        label: 'Get memory stats',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'persistent_memory_get_stats',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'VITEST_UNIT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Search disabled when no persistent entries; bootstrap latency visible',
    staleAfterMs: 30000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/Memory.tsx'],
    notes:
      'ACTIVE_PARTIAL: live persistent memory IPC; bootstrap latency and empty state visible.',
  },

  // ══════════════════════════════════════════════════════
  // /research — Research Page
  // ══════════════════════════════════════════════════════
  {
    route: '/research',
    canonical: true,
    navOwner: 'titane',
    pageId: 'research_page',
    pageComponent: 'ResearchPage',
    rootTestId: 'research-page',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_GOVERNED',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['web_research'],
    visibleActions: [
      {
        actionId: 'run_research',
        label: 'Run web research',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'web_research',
        notes: 'Governed; can be blocked by policy or missing credentials',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'VITEST_UNIT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Web-live can be blocked by policy or credentials; shows explicit block state',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/ResearchPage.tsx'],
    notes: 'ACTIVE_PARTIAL: governed web research IPC; may be blocked by policy.',
  },

  // ══════════════════════════════════════════════════════
  // /doc-center — Document Center
  // ══════════════════════════════════════════════════════
  {
    route: '/doc-center',
    canonical: true,
    navOwner: null,
    pageId: 'doc_center',
    pageComponent: 'DocCenterPage',
    rootTestId: 'doc-center-page',
    aliases: [{ from: '/doc', to: '/doc-center', notes: 'Doc alias' }],
    tabs: [],
    truthClass: 'LIVE_TAURI_GOVERNED',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['export_docx_file'],
    visibleActions: [
      {
        actionId: 'export_docx',
        label: 'Export DOCX',
        wiringStatus: 'WIRED_LIVE',
        ipcCommand: 'export_docx_file',
        notes: 'Browser mode shows visible IPC error',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'VITEST_UNIT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Requires Tauri runtime; browser mode shows explicit IPC error (not silent)',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: false,
    deprecated: false,
    sourceFiles: ['src/pages/DocCenterPage.tsx'],
    notes:
      'ACTIVE_PARTIAL: direct URL surface (no TopNav owner). DOCX export via Tauri; browser mode fails visibly.',
  },

  // ══════════════════════════════════════════════════════
  // /singularity — Singularity Monitor
  // ══════════════════════════════════════════════════════
  {
    route: '/singularity',
    canonical: true,
    navOwner: 'dev',
    pageId: 'singularity_monitor',
    pageComponent: 'SingularityMonitor',
    rootTestId: 'page-singularity-monitor',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['singularity_get_state', 'singularity_sync_state'],
    visibleActions: [
      {
        actionId: 'get_state',
        label: 'Get singularity state',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'singularity_get_state',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy:
      'Visualization mixes live hooks and derived edges; fallback to empty state',
    staleAfterMs: 30000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/SingularityMonitor.tsx'],
    notes: 'ACTIVE_PARTIAL: convergence metrics with live Tauri fallback.',
  },

  // ══════════════════════════════════════════════════════
  // /sentinel — Sentinel Guard
  // ══════════════════════════════════════════════════════
  {
    route: '/sentinel',
    canonical: true,
    navOwner: 'dev',
    pageId: 'sentinel_guard',
    pageComponent: 'Sentinel',
    rootTestId: 'page-sentinel',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['sentinel_subscribe'],
    visibleActions: [
      {
        actionId: 'subscribe',
        label: 'Subscribe sentinel events',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'sentinel_subscribe',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Engine subscription can fallback to empty state',
    staleAfterMs: 15000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/Sentinel.tsx'],
    notes:
      'ACTIVE_PARTIAL: integrity monitoring via engine subscription; fallback to empty state.',
  },

  // ══════════════════════════════════════════════════════
  // /watchdog — Watchdog Monitor
  // ══════════════════════════════════════════════════════
  {
    route: '/watchdog',
    canonical: true,
    navOwner: 'dev',
    pageId: 'watchdog_monitor',
    pageComponent: 'Watchdog',
    rootTestId: 'page-watchdog',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['watchdog_subscribe'],
    visibleActions: [
      {
        actionId: 'subscribe',
        label: 'Subscribe watchdog events',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'watchdog_subscribe',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Engine subscription can fallback to empty state',
    staleAfterMs: 15000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/Watchdog.tsx'],
    notes:
      'ACTIVE_PARTIAL: health monitoring and anomaly detection via engine subscription.',
  },

  // ══════════════════════════════════════════════════════
  // /selfheal — SelfHeal Engine
  // ══════════════════════════════════════════════════════
  {
    route: '/selfheal',
    canonical: true,
    navOwner: 'dev',
    pageId: 'selfheal_engine',
    pageComponent: 'SelfHeal',
    rootTestId: 'page-selfheal',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: ['selfheal_subscribe'],
    visibleActions: [
      {
        actionId: 'subscribe',
        label: 'Subscribe selfheal events',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'selfheal_subscribe',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Engine subscription can fallback to empty state',
    staleAfterMs: 15000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/SelfHeal.tsx'],
    notes: 'ACTIVE_PARTIAL: repair queue and auto-correction via engine subscription.',
  },

  // ══════════════════════════════════════════════════════
  // /adaptive — Adaptive Engine
  // ══════════════════════════════════════════════════════
  {
    route: '/adaptive',
    canonical: true,
    navOwner: 'dev',
    pageId: 'adaptive_engine',
    pageComponent: 'AdaptiveEngine',
    rootTestId: 'page-adaptive-engine',
    aliases: [],
    tabs: [],
    truthClass: 'LIVE_TAURI_WITH_FALLBACK',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'adaptive_subscribe',
      'adaptive_get_profile',
      'adaptive_get_summary',
    ],
    visibleActions: [
      {
        actionId: 'subscribe',
        label: 'Subscribe adaptive events',
        wiringStatus: 'WIRED_FALLBACK',
        ipcCommand: 'adaptive_subscribe',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Engine subscription can fallback to empty state',
    staleAfterMs: 15000,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/AdaptiveEngine.tsx'],
    notes: 'ACTIVE_PARTIAL: adaptive optimization via engine subscription.',
  },

  // ══════════════════════════════════════════════════════
  // /skills — Skill OS
  // ══════════════════════════════════════════════════════
  {
    route: '/skills',
    canonical: true,
    navOwner: 'titane',
    pageId: 'skill_os',
    pageComponent: 'SkillManager',
    rootTestId: 'page-skills',
    aliases: [],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [
      'list_skills',
      'activate_skill',
      'deactivate_skill',
      'install_skill',
    ],
    visibleActions: [
      { actionId: 'list_skills', label: 'List skills', wiringStatus: 'WIRED_FALLBACK' },
      {
        actionId: 'activate_skill',
        label: 'Activate skill',
        wiringStatus: 'WIRED_FALLBACK',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Local skill registry can be empty; degrades gracefully',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/ui/pages/Skills/SkillManager.tsx'],
    notes: 'ACTIVE_PARTIAL: skill lifecycle management; local registry may be empty.',
  },

  // ══════════════════════════════════════════════════════
  // /knowledge — Knowledge Fusion
  // ══════════════════════════════════════════════════════
  {
    route: '/knowledge',
    canonical: true,
    navOwner: 'titane',
    pageId: 'knowledge_page',
    pageComponent: 'KnowledgeFusionPage',
    rootTestId: 'page-knowledge',
    aliases: [],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [],
    visibleActions: [
      {
        actionId: 'knowledge_refresh',
        label: 'Refresh knowledge',
        wiringStatus: 'TEMPLATE_ONLY',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Lazy-loaded page; no destructive writes',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/ui/pages/KnowledgeFusionPage.tsx'],
    notes: 'ACTIVE_PARTIAL: knowledge import/fusion; no direct IPC commands mapped yet.',
  },

  // ══════════════════════════════════════════════════════
  // /creation — Creation Studio
  // ══════════════════════════════════════════════════════
  {
    route: '/creation',
    canonical: true,
    navOwner: 'titane',
    pageId: 'creation_studio',
    pageComponent: 'CreationStudio',
    rootTestId: 'page-creation-studio',
    aliases: [],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [],
    visibleActions: [
      {
        actionId: 'creation_refresh',
        label: 'Refresh creation',
        wiringStatus: 'TEMPLATE_ONLY',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Lazy-loaded page; asset generation may use local or backend',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/CreationStudio.tsx'],
    notes: 'ACTIVE_PARTIAL: creation/asset studio; no direct IPC commands mapped yet.',
  },

  // ══════════════════════════════════════════════════════
  // /evolution — Evolution Monitor
  // ══════════════════════════════════════════════════════
  {
    route: '/evolution',
    canonical: true,
    navOwner: 'titane',
    pageId: 'evolution_monitor',
    pageComponent: 'EvolutionMonitor',
    rootTestId: 'page-evolution-monitor',
    aliases: [],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [],
    visibleActions: [
      {
        actionId: 'evolution_refresh',
        label: 'Refresh evolution',
        wiringStatus: 'TEMPLATE_ONLY',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Lazy-loaded monitoring page; no destructive writes',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: true,
    deprecated: false,
    sourceFiles: ['src/pages/EvolutionMonitor.tsx'],
    notes: 'ACTIVE_PARTIAL: evolution overview; no direct IPC commands mapped yet.',
  },

  // ══════════════════════════════════════════════════════
  // /performance — Performance Test
  // ══════════════════════════════════════════════════════
  {
    route: '/performance',
    canonical: true,
    navOwner: 'optimization',
    pageId: 'performance_test',
    pageComponent: 'PerformanceTest',
    rootTestId: 'page-performance-test',
    aliases: [],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'DISPLAY_ONLY',
    backendCommands: [],
    visibleActions: [
      {
        actionId: 'run_probe',
        label: 'Run performance probe',
        wiringStatus: 'TEMPLATE_ONLY',
      },
    ],
    requiredProofLanes: ['STATIC_TYPESCRIPT', 'E2E_DESKTOP_WDIO'],
    fallbackPolicy: 'Diagnostic-only page; no backend writes',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: true,
    visibleInNav: false,
    deprecated: false,
    sourceFiles: ['src/pages/PerformanceTest.tsx'],
    notes: 'DISPLAY_ONLY: performance probe UI; diagnostic only, no backend writes.',
  },

  // ══════════════════════════════════════════════════════
  // /htf — HTF Module (L'Humain à tout faire)
  // ══════════════════════════════════════════════════════
  {
    route: '/htf',
    canonical: true,
    navOwner: null,
    pageId: 'htf_page',
    pageComponent: 'HTFPage',
    rootTestId: 'htf-module-page', // v52 fix: aligns with actual data-testid in HTFPage.tsx
    aliases: [],
    tabs: [],
    truthClass: 'MIXED_LIVE_AND_STATIC',
    status: 'ACTIVE_PARTIAL',
    backendCommands: [],
    visibleActions: [],
    requiredProofLanes: ['STATIC_TYPESCRIPT'],
    fallbackPolicy: 'Direct URL surface; no TopNav owner',
    staleAfterMs: 0,
    canClaimSyncedWithoutRuntime: false,
    visibleInNav: false,
    deprecated: false,
    sourceFiles: ['src/pages/HTFPage.tsx'],
    notes:
      'ACTIVE_PARTIAL: HTF module; direct URL only, no TopNav. Not in uiPages.po.js — excluded from E2E matrix.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY ACCESSORS
// ─────────────────────────────────────────────────────────────────────────────

/** All canonical surface definitions */
export const UI_SURFACE_REGISTRY: ReadonlyArray<UiSurfaceDefinition> = SURFACES;

/** All alias definitions (flattened) */
export const UI_ALIAS_REGISTRY: ReadonlyArray<
  UiSurfaceAlias & { canonicalRoute: string }
> = SURFACES.flatMap(s => s.aliases.map(a => ({ ...a, canonicalRoute: s.route })));

/** Look up a surface by route */
export function getSurface(route: string): UiSurfaceDefinition | undefined {
  return SURFACES.find(s => s.route === route);
}

/** Look up surfaces by status */
export function getSurfacesByStatus(
  status: UiSurfaceDefinition['status']
): UiSurfaceDefinition[] {
  return SURFACES.filter(s => s.status === status);
}

/** Look up surfaces by truth class */
export function getSurfacesByTruthClass(
  truthClass: UiSurfaceDefinition['truthClass']
): UiSurfaceDefinition[] {
  return SURFACES.filter(s => s.truthClass === truthClass);
}

/** Get all simulated surfaces */
export function getSimulatedSurfaces(): UiSurfaceDefinition[] {
  return SURFACES.filter(
    s => s.truthClass === 'SIMULATED_UI' || s.status === 'SIMULATED_UI'
  );
}

/** Get all alias routes */
export function getAliasRoutes(): string[] {
  return SURFACES.flatMap(s => s.aliases.map(a => a.from));
}

/** Get all canonical routes */
export function getCanonicalRoutes(): string[] {
  return SURFACES.map(s => s.route);
}

/** Registry statistics */
export function getRegistryStats() {
  const canonical = SURFACES.length;
  const aliases = UI_ALIAS_REGISTRY.length;
  const tabs = SURFACES.reduce((n, s) => n + s.tabs.length, 0);
  const actions = SURFACES.reduce((n, s) => n + s.visibleActions.length, 0);
  const simulated = getSimulatedSurfaces().length;
  const byStatus = Object.fromEntries(
    [
      'ACTIVE_SYNCED',
      'ACTIVE_PARTIAL',
      'ACTIVE_FALLBACK',
      'DISPLAY_ONLY',
      'SIMULATED_UI',
      'LEGACY_ALIAS',
      'DEPRECATED_KEEP',
      'REBUILD_REQUIRED',
      'DELETE_CANDIDATE',
      'UNKNOWN',
    ].map(s => [s, SURFACES.filter(p => p.status === s).length])
  );
  return { canonical, aliases, tabs, actions, simulated, byStatus };
}
