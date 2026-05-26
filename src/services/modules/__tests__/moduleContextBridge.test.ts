import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildModuleContextInjection,
  getActiveModuleContext,
} from '../moduleContextBridge';
import { moduleContextRegistry } from '../moduleContextRegistry';

describe('moduleContextBridge', () => {
  beforeEach(() => {
    // Seed registry with known snapshots
    moduleContextRegistry.publish('titane.chat', {
      moduleId: 'titane.chat',
      route: '/titane?tab=conversation',
      title: 'Chat',
      status: 'live',
      source: 'tauri_ipc',
      capabilities: ['send_message', 'provider_routing'],
      visibleMetrics: { messageCount: 42, selectedProvider: 'ollama' },
      actions: [{ id: 'send', label: 'Envoyer', status: 'wired' }],
      warnings: [],
    });

    moduleContextRegistry.publish('titane.memory', {
      moduleId: 'titane.memory',
      route: '/titane?tab=memory-map',
      title: 'Memory',
      status: 'partial',
      source: 'tauri_ipc',
      capabilities: ['stm-read', 'ltm-read'],
      visibleMetrics: { stmCount: 10, ltmCount: 5 },
      actions: [],
      warnings: ['Memory loading'],
    });
  });

  it('builds a prompt-safe block containing all modules', () => {
    const { promptBlock, includedModules } = buildModuleContextInjection({});
    expect(promptBlock).toContain('[TITANE_MODULE_CONTEXT]');
    expect(promptBlock).toContain('titane.chat');
    expect(promptBlock).toContain('[/TITANE_MODULE_CONTEXT]');
    expect(includedModules).toContain('titane.chat');
    // No secrets
    expect(promptBlock).not.toMatch(/api_key|secret|password|token/i);
  });

  it('prioritises active route module first', () => {
    const { includedModules } = buildModuleContextInjection({
      activeRoute: '/titane?tab=conversation',
    });
    expect(includedModules[0]).toBe('titane.chat');
  });

  it('respects moduleFilter', () => {
    const { includedModules } = buildModuleContextInjection({
      moduleFilter: ['titane.chat'],
    });
    expect(includedModules).toEqual(['titane.chat']);
  });

  it('respects maxChars limit', () => {
    const { charCount } = buildModuleContextInjection({ maxChars: 200 });
    expect(charCount).toBeLessThanOrEqual(200);
  });

  it('returns empty string for unknown module', () => {
    const ctx = getActiveModuleContext('nonexistent.module.xyz.abc');
    expect(ctx).toBe('');
  });

  it('returns formatted context for known module', () => {
    const ctx = getActiveModuleContext('titane.chat');
    expect(ctx).toContain('titane.chat');
    expect(ctx).toContain('status=live');
  });
});
