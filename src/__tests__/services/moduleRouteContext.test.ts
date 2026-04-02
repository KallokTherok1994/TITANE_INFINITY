import { beforeEach, describe, expect, it } from 'vitest';

import {
  publishActiveModuleContext,
  readActiveModuleContext,
  readRecentModuleContexts,
} from '@/services/chat/moduleRouteContext';

describe('moduleRouteContext memory route', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('publishes /memory with persistent memory actions instead of legacy endpoints', () => {
    const context = publishActiveModuleContext('/memory');

    expect(context.moduleId).toBe('memory_page');
    expect(context.actions).toEqual([
      'persistent_memory_read',
      'persistent_memory_get_stats',
      'persistent_memory_write_entry',
      'persistent_memory_delete_entry',
    ]);
    expect(context.actions).not.toContain('memory_get_state');
    expect(context.actions).not.toContain('memory_clear');
    expect(context.limits).toContain('persistent-bootstrap-latency-visible');
    expect(context.limits).toContain('search-disabled-when-no-persistent-entries');
  });

  it('persists the aligned /memory context in localStorage history', () => {
    publishActiveModuleContext('/memory');

    const active = readActiveModuleContext();
    const history = readRecentModuleContexts();

    expect(active?.route).toBe('/memory');
    expect(active?.actions).toContain('persistent_memory_read');
    expect(history.at(-1)?.moduleId).toBe('memory_page');
  });

  it('publishes /memory-evolution as an isolated legacy bridge, not as active repair', () => {
    const context = publishActiveModuleContext('/memory-evolution');

    expect(context.moduleId).toBe('memory_evolution');
    expect(context.capabilities).toEqual([
      'hierarchy-health',
      'cluster-observability',
      'persistent-bridge-visibility',
    ]);
    expect(context.actions).toEqual([
      'memory_get_clusters',
      'memory_get_status',
      'persistent_memory_get_stats',
    ]);
    expect(context.actions).not.toContain('memory_check_repair');
    expect(context.limits).toContain(
      'legacy-memory-evolution-isolated-from-persistent-ltm'
    );
    expect(context.limits).toContain(
      'write-actions-blocked-until-persistent-bridge-exists'
    );
  });
});
