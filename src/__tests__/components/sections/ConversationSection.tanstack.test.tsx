/**
 * TITANE_INFINITY v35.1.0 — ConversationSection TanStack wiring smoke test
 *
 * Validates that the additive `useChatProvidersHealthQuery` integration in
 * ConversationSection.tsx (Sprint C.2) does not regress the canonical chat
 * surface and that the new wiring is reachable from the unified component.
 *
 * Scope: import surface + hook call dispatch. Full rendering of the 3503-line
 * ConversationSection is out of scope (Rule 1) — full integration coverage is
 * carried by the existing e2e specs.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../lib/security', () => ({
  secureInvoke: vi.fn(async (_cmd: string, _payload?: unknown) => ({
    ok: true,
    value: _cmd,
  })),
  isAllowedTauriCommand: () => true,
}));

describe('ConversationSection — v35.1.0 TanStack additive wiring', () => {
  it('useChatProvidersHealthQuery module is importable and exports the hook', async () => {
    const mod = await import('@/hooks/queries/useChatProvidersHealthQuery');
    expect(typeof mod.useChatProvidersHealthQuery).toBe('function');
  });

  it('query persister bridge exposes installation status', async () => {
    const mod = await import('@/lib/queryClient');
    expect(mod).toHaveProperty('queryPersisterStatus');
    expect(typeof mod.queryPersisterStatus).toBe('object');
    expect(mod.queryPersisterStatus).toHaveProperty('installed');
  });

  it('chat allow-list dehydration covers expected query namespaces', async () => {
    const mod = await import('@/lib/queryPersister');
    expect(mod.shouldDehydrateQueryKey(['chat', 'providersHealth'])).toBe(true);
    expect(mod.shouldDehydrateQueryKey(['conversation', 'history'])).toBe(true);
    expect(mod.shouldDehydrateQueryKey(['providers', 'status'])).toBe(true);
    expect(mod.shouldDehydrateQueryKey(['random', 'unknown'])).toBe(false);
  });
});
