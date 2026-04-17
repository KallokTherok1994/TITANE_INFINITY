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

  it('redirects /memory-evolution to /titane (fusionné dans Transform)', () => {
    const context = publishActiveModuleContext('/memory-evolution');

    // /memory-evolution is now aliased to /titane via fusion
    expect(context.moduleId).toBe('titane_core');
    expect(context.route).toBe('/titane');
  });

  it('normalizes redirected routes to their real active destinations', () => {
    const xpContext = publishActiveModuleContext('/xp');
    const cognitiveContext = publishActiveModuleContext('/cognitive');

    expect(xpContext.route).toBe('/experience');
    expect(xpContext.moduleId).not.toBe('unknown_module');
    expect(cognitiveContext.route).toBe('/dev');
    expect(cognitiveContext.moduleId).toBe('dev_center');
  });

  it('normalizes legacy identity and twins aliases to the dedicated /twins route', () => {
    const identityContext = publishActiveModuleContext('/identity');
    const twinsContext = publishActiveModuleContext('/twins');

    expect(identityContext.route).toBe('/twins');
    expect(identityContext.pageState).toBeUndefined();
    expect(identityContext.fullRoute).toBe('/twins');

    expect(twinsContext.route).toBe('/twins');
    expect(twinsContext.pageState).toBeUndefined();
    expect(twinsContext.fullRoute).toBe('/twins');
    expect(twinsContext.continuity.changeType).toBe('same-module');
  });

  it('preserves tab state for query-driven pages while keeping the canonical route', () => {
    const audioContext = publishActiveModuleContext('/admin?tab=audio');
    const governanceContext = publishActiveModuleContext('/admin?tab=governance');

    expect(audioContext.route).toBe('/admin');
    expect(audioContext.pageState).toBe('tab=audio');
    expect(audioContext.fullRoute).toBe('/admin?tab=audio');
    expect(audioContext.moduleId).toBe('admin_center');

    expect(governanceContext.route).toBe('/admin');
    expect(governanceContext.pageState).toBe('tab=governance');
    expect(governanceContext.fullRoute).toBe('/admin?tab=governance');
    expect(governanceContext.continuity.changeType).toBe('same-module');
    expect(readActiveModuleContext()?.fullRoute).toBe('/admin?tab=governance');
  });

  it('keeps legacy aliases aligned with their canonical query-driven destinations', () => {
    const chatContext = publishActiveModuleContext('/chat');
    const devtoolsContext = publishActiveModuleContext('/devtools?source=f12');
    const monitoringContext = publishActiveModuleContext('/monitoring');
    const statsContext = publishActiveModuleContext('/stats');
    const evolutionCenterContext = publishActiveModuleContext('/evolution-center');

    expect(chatContext.route).toBe('/titane');
    expect(chatContext.pageState).toBe('tab=conversation');
    expect(chatContext.fullRoute).toBe('/titane?tab=conversation');
    expect(chatContext.aliasResolvedFrom).toBe('/chat');

    expect(devtoolsContext.route).toBe('/admin');
    expect(devtoolsContext.pageState).toBe('tab=system&systemTab=devtools&source=f12');
    expect(devtoolsContext.fullRoute).toBe(
      '/admin?tab=system&systemTab=devtools&source=f12'
    );
    expect(devtoolsContext.aliasResolvedFrom).toBe('/devtools');

    expect(monitoringContext.route).toBe('/dev');
    expect(monitoringContext.pageState).toBe('tab=diagnostics');
    expect(monitoringContext.fullRoute).toBe('/dev?tab=diagnostics');
    expect(monitoringContext.aliasResolvedFrom).toBe('/monitoring');

    expect(statsContext.route).toBe('/dev');
    expect(statsContext.pageState).toBe('tab=diagnostics');
    expect(statsContext.fullRoute).toBe('/dev?tab=diagnostics');
    expect(statsContext.aliasResolvedFrom).toBe('/stats');

    expect(evolutionCenterContext.route).toBe('/titane');
    expect(evolutionCenterContext.pageState).toBeUndefined();
    expect(evolutionCenterContext.fullRoute).toBe('/titane');
    expect(evolutionCenterContext.aliasResolvedFrom).toBe('/evolution-center');
  });
});
