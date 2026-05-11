/**
 * TITANE_INFINITY — UI Surface Registry Schema
 * Source of truth types for UI route/page certification.
 * Generated: 2026-05-09 | Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46
 */

/** Page lifecycle classification */
export type SurfaceStatus =
  | 'ACTIVE_SYNCED' // Live backend, runtime proof available
  | 'ACTIVE_PARTIAL' // Live backend, some tabs/actions partial
  | 'ACTIVE_FALLBACK' // Live UI, backend fallback in effect
  | 'DISPLAY_ONLY' // Static display, no backend write actions
  | 'SIMULATED_UI' // Mock/simulated data, no real backend
  | 'LEGACY_ALIAS' // Redirect alias to canonical route
  | 'DEPRECATED_KEEP' // Deprecated but kept for compat
  | 'REBUILD_REQUIRED' // Requires structural rebuild
  | 'DELETE_CANDIDATE' // Candidate for removal
  | 'UNKNOWN'; // Unclassified — must not remain on canonical routes

/** Runtime data truth class */
export type RuntimeTruthClass =
  | 'LIVE_TAURI' // Full live Tauri IPC, no fallback expected
  | 'LIVE_TAURI_WITH_FALLBACK' // Live IPC with graceful fallback
  | 'LIVE_REMOTE' // Remote gateway, authenticated
  | 'LIVE_REMOTE_STRICT' // Remote, strict auth required
  | 'MIXED_LIVE_AND_STATIC' // Mix of live signals and static curated data
  | 'SIMULATED_UI' // All data is mock/simulated
  | 'STATIC_CURATED' // Static content, no runtime signal
  | 'LIVE_TAURI_GOVERNED' // Tauri, with policy/permission gates
  | 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI' // Container lazy-loading panels with fallback
  | 'LIVE_TAURI_SERVICE_BRIDGE' // Tauri via service bridge abstraction
  | 'SERVICE_BRIDGE' // Generic service bridge
  | 'NOT_WIRED'; // No backend connection declared

/** Proof lane types for runtime certification */
export type ProofLane =
  | 'STATIC_TYPESCRIPT' // TypeScript/lint/registry parity check
  | 'VITEST_UNIT' // Vitest unit test
  | 'VITEST_INTEGRATION' // Vitest integration test
  | 'E2E_DESKTOP_WDIO' // WebdriverIO desktop E2E
  | 'E2E_PLAYWRIGHT' // Playwright E2E
  | 'IPC_CONTRACT_TEST' // tauri-ipc-contract.test.ts
  | 'REMOTE_STRICT' // TITANE_E2E_REMOTE_STRICT=1 Playwright
  | 'ANDROID_BROWSER' // Android browser test
  | 'MANUAL_CAPTURE'; // Manual screenshot/log proof

/** Action wiring classification */
export type ActionWiringStatus =
  | 'WIRED_LIVE' // Action triggers real IPC command, live data
  | 'WIRED_FALLBACK' // Action triggers IPC but falls back gracefully
  | 'TEMPLATE_ONLY' // Action UI exists, no backend wiring yet
  | 'DISPLAY_ONLY' // Read-only display action
  | 'BLOCKED_BY_RUNTIME' // Would wire but runtime unavailable
  | 'BLOCKED_BY_PERMISSION' // Gate/permission prevents action
  | 'NOT_WIRED' // No backend connection at all
  | 'DEPRECATED'; // Action deprecated

/** Tab definition for a UI page */
export interface UiSurfaceTab {
  tabId: string;
  label: string;
  testId: string; // data-testid selector
  selector?: string; // full CSS selector if different
  status: SurfaceStatus;
  truthClass: RuntimeTruthClass;
  backendCommands?: string[];
  notes?: string;
}

/** Visible user action on a page */
export interface UiSurfaceAction {
  actionId: string;
  label: string;
  wiringStatus: ActionWiringStatus;
  ipcCommand?: string; // Tauri IPC command name if wired
  notes?: string;
}

/** Legacy route alias definition */
export interface UiSurfaceAlias {
  from: string; // Legacy/alias route
  to: string; // Canonical target (may include query params)
  notes?: string;
}

/** Deprecation policy for deprecated routes */
export interface DeprecationPolicy {
  since: string; // Version when deprecated
  reason: string;
  removalTarget?: string; // Version when removal planned
  replacement?: string; // Replacement route
}

/** Full UI surface definition */
export interface UiSurfaceDefinition {
  /** Canonical route path */
  route: string;

  /** Route aliases that redirect here */
  aliases: UiSurfaceAlias[];

  /** Whether this is the canonical route (not an alias itself) */
  canonical: boolean;

  /** TopNav section that owns this route */
  navOwner: string | null;

  /** Unique page identifier */
  pageId: string;

  /** React component name (string, not import — avoids circular deps) */
  pageComponent: string;

  /** Root data-testid selector for E2E */
  rootTestId: string;

  /** Tab definitions */
  tabs: UiSurfaceTab[];

  /** Runtime data truth class */
  truthClass: RuntimeTruthClass;

  /** Page lifecycle status */
  status: SurfaceStatus;

  /** Tauri IPC commands this page uses */
  backendCommands: string[];

  /** Visible user actions and their wiring status */
  visibleActions: UiSurfaceAction[];

  /** Required proof lanes for runtime certification */
  requiredProofLanes: ProofLane[];

  /** Fallback policy description */
  fallbackPolicy: string;

  /** Staleness threshold in ms (0 = no staleness tracking) */
  staleAfterMs: number;

  /** If true, ACTIVE_SYNCED cannot be claimed without runtime proof */
  canClaimSyncedWithoutRuntime: boolean;

  /** Whether visible in top navigation */
  visibleInNav: boolean;

  /** Whether deprecated */
  deprecated: boolean;

  /** Deprecation policy if deprecated */
  deprecationPolicy?: DeprecationPolicy;

  /** Source files (relative paths) */
  sourceFiles: string[];

  /** Notes on status, blockers, or classification rationale */
  notes: string;

  /**
   * For SIMULATED_UI routes: true if a PageHealthBanner or equivalent
   * disclosure component has been applied to the component source.
   * Verified by the parity gate via sourceFiles inspection.
   */
  simulationDisclosureApplied?: boolean;
}
