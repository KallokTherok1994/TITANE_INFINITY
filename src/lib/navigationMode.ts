/**
 * TITANE∞ — Navigation Mode Constants (NEXUS v36 Gate 11)
 *
 * Defines the four navigation modes and their associated route sets.
 * This is a pure constants/helper file — no runtime side effects.
 * It does NOT replace existing call sites; it provides the canonical
 * classification referenced by Gate 11+ navigation mode enforcement.
 */

// ─── Mode Types ───────────────────────────────────────────────────────────────

export const NAV_MODES = ['DAILY', 'SYSTEM', 'DEV', 'SIMULATED'] as const;
export type NavMode = (typeof NAV_MODES)[number];

// ─── Route Sets (canonical from Gate 7 Surface Decision Matrix) ───────────────

/** Routes visible in primary Daily user flow (KEEP_DAILY — 11 routes) */
export const DAILY_ROUTES = [
  '/titane',
  '/experience',
  '/time',
  '/memory',
  '/twins',
  '/research',
  '/multiproject',
  '/skills',
  '/knowledge',
  '/creation',
  '/evolution',
] as const;

/**
 * System/infrastructure routes — accessible via /admin or direct URL (KEEP_SYSTEM — 14 routes).
 * Not shown in primary Daily nav.
 */
export const SYSTEM_ROUTES = [
  '/admin',
  '/fusion',
  '/optimization',
  '/orchestration-center',
  '/reality-center',
  '/hyper-center',
  '/cloud',
  '/doc-center',
  '/singularity',
  '/sentinel',
  '/watchdog',
  '/selfheal',
  '/adaptive',
  '/htf',
] as const;

/**
 * Developer-only routes — explicitly gated, never in product Daily nav (KEEP_DEV — 2 routes).
 * /total-dev uses qwen3.5:9b IPC (ALLOWED_DEV_SURFACE).
 */
export const DEV_ROUTES = ['/dev', '/total-dev'] as const;

/**
 * SIMULATED_UI routes — must show badge at all times; never in any nav (KEEP_SIMULATED — 2 routes).
 * Rule SIM-03: SIMULATED routes must not be registered in Daily, System, or Dev primary nav.
 */
export const SIMULATED_ROUTES = ['/orchestration-intelligence', '/quantum-center'] as const;

/** Display-only route — no write actions (KEEP_DISPLAY_ONLY — 1 route) */
export const DISPLAY_ONLY_ROUTES = ['/performance'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the NavMode for a given pathname, or null if unclassified.
 * Strips query strings before comparison.
 */
export function getRouteNavMode(pathname: string): NavMode | null {
  const clean = pathname.split('?')[0] ?? pathname;
  if ((SIMULATED_ROUTES as readonly string[]).includes(clean)) return 'SIMULATED';
  if ((DEV_ROUTES as readonly string[]).includes(clean)) return 'DEV';
  if ((SYSTEM_ROUTES as readonly string[]).includes(clean)) return 'SYSTEM';
  if ((DAILY_ROUTES as readonly string[]).includes(clean)) return 'DAILY';
  return null;
}

/** True if the route is a SIMULATED_UI surface (must show badge, never in nav). */
export function isSimulatedRoute(pathname: string): boolean {
  return getRouteNavMode(pathname) === 'SIMULATED';
}

/** True if the route belongs to Daily mode primary surfaces. */
export function isDailyRoute(pathname: string): boolean {
  return getRouteNavMode(pathname) === 'DAILY';
}
