/**
 * TITANE∞ v49 — agentUiContextBridge unit tests
 *
 * Validates:
 *   - Fallback when no localStorage context
 *   - /titane → titane_core
 *   - /time → time_center
 *   - SIMULATED_UI routes flagged correctly
 *   - Alias resolution propagated to context
 *   - Agent view and Chat view return same moduleId/truthClass (single truth source)
 *   - No mutation of returned object
 *   - proofState.sourceType is 'fallback' when empty, 'localStorage' when present
 *   - recentModules trimmed to historyLimit
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// We mock the whole moduleRouteContext module so tests are deterministic
// (no real localStorage access in jsdom or node environments).
vi.mock('@/services/chat/moduleRouteContext', () => ({
  readActiveModuleContext: vi.fn(),
  readRecentModuleContexts: vi.fn(),
}));

import {
  buildUnifiedTitaneContext,
  getActiveUiContextForAgent,
  getActiveUiContextForChat,
  type UnifiedTitaneContext,
} from '../agentUiContextBridge';

import {
  readActiveModuleContext,
  readRecentModuleContexts,
} from '@/services/chat/moduleRouteContext';

const mockedReadActive = vi.mocked(readActiveModuleContext);
const mockedReadRecent = vi.mocked(readRecentModuleContexts);

function makeMockCtx(overrides: Partial<{
  route: string;
  moduleId: string;
  moduleName: string;
  moduleType: string;
  pageTitle: string;
  dataTruthClass: string;
  capabilities: string[];
  actions: string[];
  limits: string[];
  memoryKeys: string[];
  updatedAt: number;
  continuity: object;
}> = {}) {
  return {
    route: overrides.route ?? '/titane',
    fullRoute: overrides.route ?? '/titane',
    moduleId: overrides.moduleId ?? 'titane_core',
    moduleName: overrides.moduleName ?? 'Titane Core',
    moduleType: overrides.moduleType ?? 'core-chat',
    pageTitle: overrides.pageTitle ?? 'TITANE',
    dataTruthClass: overrides.dataTruthClass ?? 'MIXED_LIVE_AND_STATIC',
    capabilities: overrides.capabilities ?? ['chat', 'provider-routing'],
    actions: overrides.actions ?? ['send_message', 'switch_mode'],
    limits: overrides.limits ?? ['provider-quality-conditional'],
    memoryKeys: overrides.memoryKeys ?? ['titane_chat_mode_*'],
    updatedAt: overrides.updatedAt ?? 1234567890000,
    continuity: overrides.continuity ?? {
      sequence: 1,
      changeType: 'initial',
      fromRoute: undefined,
      fromModuleId: undefined,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedReadRecent.mockReturnValue([]);
});

// ---------------------------------------------------------------------------
// Fallback when no active context
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — fallback', () => {
  it('returns FALLBACK_CONTEXT when readActiveModuleContext returns null', () => {
    mockedReadActive.mockReturnValue(null);

    const ctx = buildUnifiedTitaneContext();

    expect(ctx.route).toBe('/');
    expect(ctx.moduleId).toBe('unknown_module');
    expect(ctx.proofState.sourceType).toBe('fallback');
    expect(ctx.proofState.lastUpdatedAt).toBeNull();
    expect(ctx.blockers).toContain('no-active-context-in-storage');
    expect(ctx.recentModules).toHaveLength(0);
    expect(ctx.isSimulated).toBe(false);
    expect(ctx.isLive).toBe(false);
  });

  it('fallback surfaceStatus is UNKNOWN', () => {
    mockedReadActive.mockReturnValue(null);
    const ctx = buildUnifiedTitaneContext();
    expect(ctx.surfaceStatus).toBe('UNKNOWN');
  });
});

// ---------------------------------------------------------------------------
// /titane → titane_core
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — /titane', () => {
  it('returns titane_core for /titane route', () => {
    mockedReadActive.mockReturnValue(makeMockCtx({ route: '/titane', moduleId: 'titane_core' }) as ReturnType<typeof readActiveModuleContext>);

    const ctx = buildUnifiedTitaneContext();
    expect(ctx.route).toBe('/titane');
    expect(ctx.moduleId).toBe('titane_core');
    expect(ctx.proofState.sourceType).toBe('localStorage');
    expect(ctx.proofState.lastUpdatedAt).toBe(1234567890000);
  });

  it('/titane surfaceStatus is MIXED (MIXED_LIVE_AND_STATIC)', () => {
    mockedReadActive.mockReturnValue(makeMockCtx({ dataTruthClass: 'MIXED_LIVE_AND_STATIC' }) as ReturnType<typeof readActiveModuleContext>);
    const ctx = buildUnifiedTitaneContext();
    expect(ctx.surfaceStatus).toBe('MIXED');
    expect(ctx.isSimulated).toBe(false);
    expect(ctx.isLive).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// /time → time_center
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — /time', () => {
  it('returns time_center for /time route', () => {
    mockedReadActive.mockReturnValue(makeMockCtx({
      route: '/time',
      moduleId: 'time_center',
      moduleName: 'Time Center',
      dataTruthClass: 'MIXED_LIVE_AND_STATIC',
    }) as ReturnType<typeof readActiveModuleContext>);

    const ctx = buildUnifiedTitaneContext();
    expect(ctx.route).toBe('/time');
    expect(ctx.moduleId).toBe('time_center');
    expect(ctx.moduleName).toBe('Time Center');
  });
});

// ---------------------------------------------------------------------------
// SIMULATED_UI routes
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — SIMULATED_UI', () => {
  it('flags isSimulated=true for SIMULATED_UI truthClass', () => {
    mockedReadActive.mockReturnValue(makeMockCtx({
      route: '/orchestration-intelligence',
      moduleId: 'orchestration_intelligence',
      dataTruthClass: 'SIMULATED_UI',
    }) as ReturnType<typeof readActiveModuleContext>);

    const ctx = buildUnifiedTitaneContext();
    expect(ctx.isSimulated).toBe(true);
    expect(ctx.isLive).toBe(false);
    expect(ctx.surfaceStatus).toBe('SIMULATED');
    expect(ctx.blockers).toContain('module-is-simulated-ui');
  });
});

// ---------------------------------------------------------------------------
// LIVE_TAURI routes
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — LIVE_TAURI', () => {
  it('flags isLive=true for LIVE_TAURI truthClass', () => {
    mockedReadActive.mockReturnValue(makeMockCtx({
      route: '/memory',
      moduleId: 'memory_page',
      dataTruthClass: 'LIVE_TAURI_SERVICE_BRIDGE',
    }) as ReturnType<typeof readActiveModuleContext>);

    const ctx = buildUnifiedTitaneContext();
    expect(ctx.isLive).toBe(true);
    expect(ctx.surfaceStatus).toBe('BRIDGE');
    expect(ctx.isSimulated).toBe(false);
  });

  it('LIVE_TAURI_GOVERNED → GOVERNED status', () => {
    mockedReadActive.mockReturnValue(makeMockCtx({
      dataTruthClass: 'LIVE_TAURI_GOVERNED',
    }) as ReturnType<typeof readActiveModuleContext>);
    const ctx = buildUnifiedTitaneContext();
    expect(ctx.surfaceStatus).toBe('GOVERNED');
    expect(ctx.isLive).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Same moduleId/truthClass for Agent and Chat (single truth source)
// ---------------------------------------------------------------------------

describe('Agent vs Chat — single truth source', () => {
  it('getActiveUiContextForAgent and getActiveUiContextForChat return same moduleId and truthClass', () => {
    const mock = makeMockCtx({
      route: '/admin',
      moduleId: 'admin_center',
      dataTruthClass: 'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
    });
    mockedReadActive.mockReturnValue(mock as ReturnType<typeof readActiveModuleContext>);

    const agentCtx = getActiveUiContextForAgent();
    const chatCtx = getActiveUiContextForChat();

    expect(agentCtx.moduleId).toBe('admin_center');
    expect(chatCtx.moduleId).toBe('admin_center');
    expect(agentCtx.truthClass).toBe(chatCtx.truthClass);
    expect(agentCtx.surfaceStatus).toBe(chatCtx.surfaceStatus);
  });
});

// ---------------------------------------------------------------------------
// No mutation of returned object
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — immutability', () => {
  it('mutating returned capabilities does not affect next call', () => {
    const mock = makeMockCtx({ capabilities: ['chat', 'provider-routing'] });
    mockedReadActive.mockReturnValue(mock as ReturnType<typeof readActiveModuleContext>);

    const ctx1 = buildUnifiedTitaneContext();
    ctx1.capabilities.push('MUTATED');

    const ctx2 = buildUnifiedTitaneContext();
    expect(ctx2.capabilities).not.toContain('MUTATED');
  });
});

// ---------------------------------------------------------------------------
// recentModules trimmed to historyLimit
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — recentModules', () => {
  it('trims recentModules to historyLimit', () => {
    mockedReadActive.mockReturnValue(makeMockCtx() as ReturnType<typeof readActiveModuleContext>);

    const manyContexts = Array.from({ length: 20 }, (_, i) =>
      makeMockCtx({ moduleId: `mod_${i}`, route: `/route-${i}`, updatedAt: i * 1000 })
    );
    mockedReadRecent.mockReturnValue(manyContexts as ReturnType<typeof readRecentModuleContexts>);

    const ctx = buildUnifiedTitaneContext(5);
    expect(ctx.recentModules.length).toBeLessThanOrEqual(5);
  });

  it('returns empty recentModules when history is empty', () => {
    mockedReadActive.mockReturnValue(makeMockCtx() as ReturnType<typeof readActiveModuleContext>);
    mockedReadRecent.mockReturnValue([]);

    const ctx = buildUnifiedTitaneContext();
    expect(ctx.recentModules).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Alias resolution
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — alias', () => {
  it('preserves aliasResolvedFrom when present', () => {
    mockedReadActive.mockReturnValue({
      ...makeMockCtx(),
      aliasResolvedFrom: '/chat',
    } as ReturnType<typeof readActiveModuleContext>);

    const ctx = buildUnifiedTitaneContext();
    expect(ctx.aliasResolvedFrom).toBe('/chat');
  });

  it('aliasResolvedFrom is undefined when not present', () => {
    mockedReadActive.mockReturnValue(makeMockCtx() as ReturnType<typeof readActiveModuleContext>);
    const ctx = buildUnifiedTitaneContext();
    expect(ctx.aliasResolvedFrom).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// proofState.contextVersion
// ---------------------------------------------------------------------------

describe('buildUnifiedTitaneContext — proofState', () => {
  it('always sets contextVersion to v1', () => {
    mockedReadActive.mockReturnValue(makeMockCtx() as ReturnType<typeof readActiveModuleContext>);
    const ctx = buildUnifiedTitaneContext();
    expect(ctx.proofState.contextVersion).toBe('v1');
  });
});
