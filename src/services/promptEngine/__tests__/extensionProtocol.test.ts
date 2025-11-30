/**
 * =============================================================================
 * TITANE∞ PROMPT ENGINE — Extension Protocol Tests
 * =============================================================================
 *
 * @file        extensionProtocol.test.ts
 * @version     vΩ∞Ω
 * @phase       D.3 — Tests du protocole d'extension
 *
 * =============================================================================
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ExtensionRegistry,
  BasePromptExtension,
  type ExtensionMetadata,
  type ExtensionConfig,
  type IContextSourceExtension,
  type CollectionContext,
  type ContextCollectionResult,
  type ILifecycleHookExtension,
  type HookContext,
  type HookResult,
  type LifecycleHookPoint,
  type ContextSourceType,
  type LayerId,
} from '../extensions/extensionProtocol';

// =============================================================================
// MOCK EXTENSIONS
// =============================================================================

/**
 * Extension de contexte mock pour tests
 */
class MockContextSourceExtension
  extends BasePromptExtension
  implements IContextSourceExtension
{
  readonly metadata: ExtensionMetadata = {
    id: 'mock-context-source',
    name: 'Mock Context Source',
    version: '1.0.0',
    author: 'TITANE∞',
    description: 'Mock context source for testing',
    type: 'context-source',
    priority: 'normal',
  };

  readonly sourceType: ContextSourceType = 'memory_session';
  readonly targetLayer: LayerId = 'cognitive';

  private available = true;

  setAvailable(available: boolean): void {
    this.available = available;
  }

  async collect(_context: CollectionContext): Promise<ContextCollectionResult> {
    const result = await this.executeWithStats(async () => {
      const mockNode = {
        id: 'mock-node-1',
        type: 'memory' as const,
        layerId: 'cognitive' as LayerId,
        content: 'Mock context content',
        priority: 'medium' as const,
        relevance: 0.8,
        timestamp: Date.now(),
        source: {
          type: 'memory_session' as ContextSourceType,
          engine: 'mock',
          timestamp: Date.now(),
          reliability: 1,
          ttl: 60000,
        },
        metadata: {
          compressed: false,
          tags: [],
          linkedNodes: [],
        },
        hash: 'mock-hash',
      };

      return {
        sourceId: this.metadata.id,
        nodes: [mockNode],
        metadata: {
          fetchTime: 10,
          cached: false,
          stale: false,
        },
      };
    });
    return result.data as unknown as ContextCollectionResult;
  }

  async isAvailable(): Promise<boolean> {
    return this.available;
  }

  invalidateCache(): void {
    // No-op for mock
  }
}

/**
 * Extension de hook lifecycle mock
 */
class MockLifecycleHookExtension
  extends BasePromptExtension
  implements ILifecycleHookExtension
{
  readonly metadata: ExtensionMetadata = {
    id: 'mock-lifecycle-hook',
    name: 'Mock Lifecycle Hook',
    version: '1.0.0',
    author: 'TITANE∞',
    description: 'Mock lifecycle hook for testing',
    type: 'lifecycle-hook',
    priority: 'high',
  };

  readonly hookPoints: LifecycleHookPoint[] = ['pre-parse', 'post-parse', 'on-complete'];
  executionLog: string[] = [];

  async execute(context: HookContext): Promise<HookResult> {
    this.executionLog.push(context.hookPoint);
    return {
      modified: false,
      data: context.data,
    };
  }

  shouldExecute(context: HookContext): boolean {
    return this.hookPoints.includes(context.hookPoint);
  }

  clearLog(): void {
    this.executionLog = [];
  }
}

// =============================================================================
// TESTS - EXTENSION REGISTRY
// =============================================================================

describe('🔌 Extension Registry Tests', () => {
  beforeEach(() => {
    ExtensionRegistry.resetInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('📝 Registration', () => {
    it('should register an extension successfully', async () => {
      const registry = ExtensionRegistry.getInstance();
      const extension = new MockContextSourceExtension();

      await registry.register(extension);

      expect(registry.get(extension.metadata.id)).toBe(extension);
      expect(extension.state).toBe('registered');
    });

    it('should reject duplicate registration', async () => {
      const registry = ExtensionRegistry.getInstance();
      const extension1 = new MockContextSourceExtension();
      const extension2 = new MockContextSourceExtension();

      await registry.register(extension1);

      await expect(registry.register(extension2)).rejects.toThrow(
        'Extension already registered'
      );
    });

    it('should unregister an extension', async () => {
      const registry = ExtensionRegistry.getInstance();
      const extension = new MockContextSourceExtension();

      await registry.register(extension);
      await registry.unregister(extension.metadata.id);

      expect(registry.get(extension.metadata.id)).toBeUndefined();
      expect(extension.state).toBe('unloaded');
    });

    it('should handle unregistering non-existent extension gracefully', async () => {
      const registry = ExtensionRegistry.getInstance();

      await expect(registry.unregister('non-existent')).resolves.not.toThrow();
    });
  });

  describe('🔍 Query', () => {
    it('should get all registered extensions', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext1 = new MockContextSourceExtension();
      const ext2 = new MockLifecycleHookExtension();

      // Modifier l'ID pour éviter les conflits
      (ext2.metadata as { id: string }).id = 'mock-lifecycle-hook-2';

      await registry.register(ext1);
      await registry.register(ext2);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
    });

    it('should filter extensions by type', async () => {
      const registry = ExtensionRegistry.getInstance();
      const contextSource = new MockContextSourceExtension();
      const lifecycleHook = new MockLifecycleHookExtension();

      await registry.register(contextSource);
      await registry.register(lifecycleHook);

      const contextSources = registry.getByType('context-source');
      expect(contextSources).toHaveLength(1);
      expect(contextSources[0].metadata.type).toBe('context-source');

      const hooks = registry.getByType('lifecycle-hook');
      expect(hooks).toHaveLength(1);
      expect(hooks[0].metadata.type).toBe('lifecycle-hook');
    });

    it('should get active extensions only', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext1 = new MockContextSourceExtension();
      const ext2 = new MockLifecycleHookExtension();

      await registry.register(ext1);
      await registry.register(ext2);

      // Activer seulement ext1
      await ext1.activate();

      const active = registry.getActive();
      expect(active).toHaveLength(1);
      expect(active[0].metadata.id).toBe(ext1.metadata.id);
    });
  });

  describe('🔄 Lifecycle', () => {
    it('should activate all extensions', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext1 = new MockContextSourceExtension();
      const ext2 = new MockLifecycleHookExtension();

      await registry.register(ext1);
      await registry.register(ext2);
      await registry.activateAll();

      expect(ext1.state).toBe('active');
      expect(ext2.state).toBe('active');
    });

    it('should deactivate all extensions', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext1 = new MockContextSourceExtension();

      await registry.register(ext1);
      await ext1.activate();
      await registry.deactivateAll();

      expect(ext1.state).toBe('disabled');
    });

    it('should activate in priority order', async () => {
      const registry = ExtensionRegistry.getInstance();
      const normalExt = new MockContextSourceExtension();
      const highExt = new MockLifecycleHookExtension();

      // High priority should activate first
      normalExt.config.priority = 'normal';
      highExt.config.priority = 'high';

      await registry.register(normalExt);
      await registry.register(highExt);

      const activationOrder: string[] = [];
      const originalActivate1 = normalExt.activate.bind(normalExt);
      const originalActivate2 = highExt.activate.bind(highExt);

      normalExt.activate = async () => {
        activationOrder.push('normal');
        return originalActivate1();
      };
      highExt.activate = async () => {
        activationOrder.push('high');
        return originalActivate2();
      };

      await registry.activateAll();

      expect(activationOrder[0]).toBe('high');
      expect(activationOrder[1]).toBe('normal');
    });
  });

  describe('📊 Health & Stats', () => {
    it('should perform health check on all extensions', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext1 = new MockContextSourceExtension();
      const ext2 = new MockLifecycleHookExtension();

      await registry.register(ext1);
      await registry.register(ext2);
      await registry.activateAll();

      const health = await registry.healthCheck();

      expect(health.get(ext1.metadata.id)).toBe(true);
      expect(health.get(ext2.metadata.id)).toBe(true);
    });

    it('should collect stats from all extensions', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext = new MockContextSourceExtension();

      await registry.register(ext);
      await ext.activate();

      // Trigger some executions
      await ext.collect({
        mode: 'standard',
        sessionId: 'test',
        timestamp: Date.now(),
      });

      const stats = registry.getStats();
      const extStats = stats.get(ext.metadata.id);

      expect(extStats).toBeDefined();
      expect(extStats?.totalExecutions).toBeGreaterThan(0);
    });
  });

  describe('📢 Events', () => {
    it('should emit events on registration', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext = new MockContextSourceExtension();
      const listener = vi.fn();

      registry.on('registered', listener);
      await registry.register(ext);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'registered',
          extensionId: ext.metadata.id,
        })
      );
    });

    it('should emit events on activation', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext = new MockContextSourceExtension();
      const listener = vi.fn();

      await registry.register(ext);
      registry.on('activated', listener);
      await registry.activateAll();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should allow removing event listeners', async () => {
      const registry = ExtensionRegistry.getInstance();
      const ext = new MockContextSourceExtension();
      const listener = vi.fn();

      registry.on('registered', listener);
      registry.off('registered', listener);
      await registry.register(ext);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});

// =============================================================================
// TESTS - BASE EXTENSION
// =============================================================================

describe('🧩 Base Extension Tests', () => {
  describe('📈 Stats Tracking', () => {
    it('should track successful executions', async () => {
      const ext = new MockContextSourceExtension();
      await ext.activate();

      await ext.collect({
        mode: 'standard',
        sessionId: 'test',
        timestamp: Date.now(),
      });

      const stats = ext.getStats();
      expect(stats.totalExecutions).toBe(1);
      expect(stats.successfulExecutions).toBe(1);
      expect(stats.failedExecutions).toBe(0);
    });

    it('should calculate average execution time', async () => {
      const ext = new MockContextSourceExtension();
      await ext.activate();

      // Multiple executions
      for (let i = 0; i < 5; i++) {
        await ext.collect({
          mode: 'standard',
          sessionId: 'test',
          timestamp: Date.now(),
        });
      }

      const stats = ext.getStats();
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
      expect(stats.totalExecutions).toBe(5);
    });
  });

  describe('🔄 Lifecycle', () => {
    it('should transition through lifecycle states', async () => {
      const ext = new MockContextSourceExtension();

      expect(ext.state).toBe('registered');

      await ext.initialize();
      expect(ext.state).toBe('registered');

      await ext.activate();
      expect(ext.state).toBe('active');

      await ext.deactivate();
      expect(ext.state).toBe('disabled');

      await ext.dispose();
      expect(ext.state).toBe('unloaded');
    });

    it('should not activate from error state', async () => {
      const ext = new MockContextSourceExtension();
      ext.state = 'error';

      await expect(ext.activate()).rejects.toThrow('Cannot activate extension in error state');
    });
  });

  describe('❤️ Health Check', () => {
    it('should report healthy when active and enabled', async () => {
      const ext = new MockContextSourceExtension();
      await ext.activate();

      const healthy = await ext.healthCheck();
      expect(healthy).toBe(true);
    });

    it('should report unhealthy when disabled', async () => {
      const ext = new MockContextSourceExtension();
      await ext.activate();
      ext.config.enabled = false;

      const healthy = await ext.healthCheck();
      expect(healthy).toBe(false);
    });

    it('should report unhealthy when not active', async () => {
      const ext = new MockContextSourceExtension();
      // Not activated

      const healthy = await ext.healthCheck();
      expect(healthy).toBe(false);
    });
  });
});

// =============================================================================
// TESTS - CONTEXT SOURCE EXTENSION
// =============================================================================

describe('📦 Context Source Extension Tests', () => {
  it('should collect context nodes', async () => {
    const ext = new MockContextSourceExtension();
    await ext.activate();

    const result = await ext.collect({
      mode: 'standard',
      sessionId: 'test-session',
      timestamp: Date.now(),
    });

    expect(result.sourceId).toBe(ext.metadata.id);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].content).toBe('Mock context content');
  });

  it('should report availability', async () => {
    const ext = new MockContextSourceExtension();

    expect(await ext.isAvailable()).toBe(true);

    ext.setAvailable(false);
    expect(await ext.isAvailable()).toBe(false);
  });

  it('should have correct source type and target layer', () => {
    const ext = new MockContextSourceExtension();

    expect(ext.sourceType).toBe('memory_session');
    expect(ext.targetLayer).toBe('cognitive');
  });
});

// =============================================================================
// TESTS - LIFECYCLE HOOK EXTENSION
// =============================================================================

describe('🪝 Lifecycle Hook Extension Tests', () => {
  it('should execute hook at correct points', async () => {
    const ext = new MockLifecycleHookExtension();
    await ext.activate();

    await ext.execute({
      hookPoint: 'pre-parse',
      timestamp: Date.now(),
      mode: 'standard',
      data: { input: 'test' },
    });

    await ext.execute({
      hookPoint: 'post-parse',
      timestamp: Date.now(),
      mode: 'standard',
      data: { parsed: true },
    });

    expect(ext.executionLog).toContain('pre-parse');
    expect(ext.executionLog).toContain('post-parse');
  });

  it('should determine if hook should execute', () => {
    const ext = new MockLifecycleHookExtension();

    expect(
      ext.shouldExecute({
        hookPoint: 'pre-parse',
        timestamp: Date.now(),
        mode: 'standard',
        data: {},
      })
    ).toBe(true);

    expect(
      ext.shouldExecute({
        hookPoint: 'pre-collect',
        timestamp: Date.now(),
        mode: 'standard',
        data: {},
      })
    ).toBe(false);
  });

  it('should have correct hook points defined', () => {
    const ext = new MockLifecycleHookExtension();

    expect(ext.hookPoints).toContain('pre-parse');
    expect(ext.hookPoints).toContain('post-parse');
    expect(ext.hookPoints).toContain('on-complete');
    expect(ext.hookPoints).not.toContain('pre-collect');
  });
});

// =============================================================================
// TESTS - SINGLETON
// =============================================================================

describe('🔒 Singleton Pattern Tests', () => {
  beforeEach(() => {
    ExtensionRegistry.resetInstance();
  });

  it('should return same instance', () => {
    const instance1 = ExtensionRegistry.getInstance();
    const instance2 = ExtensionRegistry.getInstance();

    expect(instance1).toBe(instance2);
  });

  it('should create new instance after reset', () => {
    const instance1 = ExtensionRegistry.getInstance();
    ExtensionRegistry.resetInstance();
    const instance2 = ExtensionRegistry.getInstance();

    expect(instance1).not.toBe(instance2);
  });

  it('should clear extensions on reset', async () => {
    const registry = ExtensionRegistry.getInstance();
    const ext = new MockContextSourceExtension();

    await registry.register(ext);
    expect(registry.getAll()).toHaveLength(1);

    ExtensionRegistry.resetInstance();
    const newRegistry = ExtensionRegistry.getInstance();

    expect(newRegistry.getAll()).toHaveLength(0);
  });
});
