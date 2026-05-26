import { describe, it, expect, beforeEach, vi } from 'vitest';
import { moduleContextRegistry } from '../moduleContextRegistry';

describe('moduleContextRegistry', () => {
  beforeEach(() => {
    // Clear registry between tests by getting all and verifying it doesn't throw
    vi.useFakeTimers();
  });

  it('publishes and retrieves a snapshot', () => {
    moduleContextRegistry.publish('test.module', {
      moduleId: 'test.module',
      route: '/test',
      title: 'Test Module',
      status: 'live',
      source: 'tauri_ipc',
      capabilities: ['read_data'],
      visibleMetrics: { count: 5 },
      actions: [{ id: 'refresh', label: 'Refresh', status: 'wired' }],
      warnings: [],
    });

    const snap = moduleContextRegistry.get('test.module');
    expect(snap).not.toBeNull();
    expect(snap!.moduleId).toBe('test.module');
    expect(snap!.status).toBe('live');
    expect(snap!.visibleMetrics.count).toBe(5);
  });

  it('returns null for unknown module', () => {
    expect(moduleContextRegistry.get('nonexistent.module.xyz')).toBeNull();
  });

  it('getOrDegraded returns degraded placeholder for unknown module', () => {
    const snap = moduleContextRegistry.getOrDegraded('missing.module.abc');
    expect(snap.status).toBe('unknown');
    expect(snap.warnings).toContain('Module snapshot not yet published');
  });

  it('notifies listeners on publish', () => {
    const listener = vi.fn();
    const unsub = moduleContextRegistry.subscribe(listener);

    moduleContextRegistry.publish('listener.test', {
      moduleId: 'listener.test',
      route: '/test',
      title: 'Test',
      status: 'partial',
      source: 'local_cache',
      capabilities: [],
      visibleMetrics: {},
      actions: [],
      warnings: [],
    });

    expect(listener).toHaveBeenCalledWith(
      'listener.test',
      expect.objectContaining({ status: 'partial' })
    );
    unsub();
  });

  it('buildChatContext returns prompt-safe string', () => {
    moduleContextRegistry.publish('chat.context.test', {
      moduleId: 'chat.context.test',
      route: '/titane',
      title: 'Chat',
      status: 'live',
      source: 'tauri_ipc',
      capabilities: ['send_message'],
      visibleMetrics: { messages: 42, level: 5 },
      actions: [],
      warnings: [],
    });

    const ctx = moduleContextRegistry.buildChatContext();
    expect(ctx).toContain('[MODULE_CONTEXT]');
    expect(ctx).toContain('chat.context.test');
    expect(ctx).toContain('status=live');
    expect(ctx).toContain('[/MODULE_CONTEXT]');
    // Should not contain raw API keys or secrets
    expect(ctx).not.toMatch(/api_key|secret|token|password/i);
  });
});
