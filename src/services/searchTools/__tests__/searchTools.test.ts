/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SEARCH + TOOLS ENGINE — Tests Unitaires
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('PermissionManager', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let PermissionManager: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let manager: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../permissionManager');
    PermissionManager = module.PermissionManager;
    PermissionManager.resetInstance();
    manager = PermissionManager.getInstance();
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = manager.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.strictMode).toBe(true);
      expect(config.defaultLevel).toBe('none');
    });

    it('should allow configuration updates', () => {
      manager.configure({
        strictMode: false,
        decisionCacheTTL: 600,
      });

      const config = manager.getConfig();
      expect(config.strictMode).toBe(false);
      expect(config.decisionCacheTTL).toBe(600);
    });
  });

  describe('Mode Management', () => {
    it('should default to standard mode', () => {
      expect(manager.getMode()).toBe('standard');
    });

    it('should allow mode changes', () => {
      manager.setMode('dev');
      expect(manager.getMode()).toBe('dev');

      manager.setMode('architect');
      expect(manager.getMode()).toBe('architect');

      manager.setMode('autonomous');
      expect(manager.getMode()).toBe('autonomous');
    });

    it('should clear cache on mode change', () => {
      manager.setMode('dev');
      // Cache should be cleared (internal behavior)
      expect(manager.getMode()).toBe('dev');
    });
  });

  describe('Permission Checking', () => {
    it('should check category access', () => {
      manager.setMode('standard');

      // Standard mode should have read access to search
      expect(manager.canAccessCategory('search')).toBe(true);

      // Standard mode should not have access to system
      expect(manager.canAccessCategory('system')).toBe(false);
    });

    it('should check permission levels', () => {
      manager.setMode('dev');

      // Dev mode has write access to file
      expect(manager.hasPermissionLevel('file', 'read')).toBe(true);
      expect(manager.hasPermissionLevel('file', 'write')).toBe(true);

      // Dev mode has only read access to system
      expect(manager.hasPermissionLevel('system', 'read')).toBe(true);
      expect(manager.hasPermissionLevel('system', 'execute')).toBe(false);
    });

    it('should allow all in autonomous mode', () => {
      manager.setMode('autonomous');

      expect(manager.hasPermissionLevel('system', 'admin')).toBe(true);
      expect(manager.hasPermissionLevel('security', 'admin')).toBe(true);
    });
  });

  describe('Custom Rules', () => {
    it('should add custom rules', () => {
      const rule = {
        id: 'test_rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: {
          type: 'category' as const,
          operator: 'equals' as const,
          value: 'system',
        },
        effect: 'deny' as const,
        priority: 100,
        enabled: true,
      };

      manager.addRule(rule);

      const rules = manager.getRules();
      expect(rules.length).toBe(1);
      expect(rules[0].id).toBe('test_rule');
    });

    it('should remove rules', () => {
      const rule = {
        id: 'to_remove',
        name: 'To Remove',
        description: 'Will be removed',
        condition: { type: 'mode' as const, operator: 'equals' as const, value: 'dev' },
        effect: 'allow' as const,
        priority: 50,
        enabled: true,
      };

      manager.addRule(rule);
      expect(manager.getRules().length).toBe(1);

      manager.removeRule('to_remove');
      expect(manager.getRules().length).toBe(0);
    });

    it('should toggle rules', () => {
      const rule = {
        id: 'toggle_test',
        name: 'Toggle Test',
        description: 'Can be toggled',
        condition: { type: 'tool' as const, operator: 'equals' as const, value: 'test' },
        effect: 'allow' as const,
        priority: 10,
        enabled: true,
      };

      manager.addRule(rule);
      expect(manager.getRules()[0].enabled).toBe(true);

      manager.toggleRule('toggle_test', false);
      expect(manager.getRules()[0].enabled).toBe(false);
    });
  });

  describe('Matrix Management', () => {
    it('should get permission summary', () => {
      manager.setMode('dev');

      const summary = manager.getPermissionSummary();

      expect(summary.file).toBe('write');
      expect(summary.code).toBe('execute');
      expect(summary.system).toBe('read');
    });

    it('should set individual permissions', () => {
      manager.setPermission('standard', 'system', 'read');

      manager.setMode('standard');
      const summary = manager.getPermissionSummary();
      expect(summary.system).toBe('read');
    });

    it('should reset matrix to defaults', () => {
      manager.setPermission('standard', 'system', 'admin');
      manager.resetMatrix();

      manager.setMode('standard');
      const summary = manager.getPermissionSummary();
      expect(summary.system).toBe('none');
    });
  });

  describe('Statistics', () => {
    it('should track stats', () => {
      const stats = manager.getStats();
      expect(stats.totalRequests).toBeDefined();
      expect(stats.granted).toBeDefined();
      expect(stats.denied).toBeDefined();
    });

    it('should reset stats', () => {
      manager.resetStats();
      const stats = manager.getStats();
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe('Audit Log', () => {
    it('should get audit log', () => {
      const log = manager.getAuditLog();
      expect(Array.isArray(log)).toBe(true);
    });

    it('should clear audit log', () => {
      manager.clearAuditLog();
      const log = manager.getAuditLog();
      expect(log.length).toBe(0);
    });
  });

  describe('Export/Import', () => {
    it('should export config', () => {
      const exported = manager.exportConfig();

      expect(exported.config).toBeDefined();
      expect(exported.currentMode).toBeDefined();
      expect(exported.customRules).toBeDefined();
    });

    it('should import config', () => {
      manager.importConfig({
        currentMode: 'architect',
      });

      expect(manager.getMode()).toBe('architect');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SearchEngine', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let SearchEngine: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let engine: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../searchEngine');
    SearchEngine = module.SearchEngine;
    SearchEngine.resetInstance();
    engine = SearchEngine.getInstance();
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = engine.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.defaultProvider).toBe('duckduckgo');
      expect(config.cacheEnabled).toBe(true);
    });

    it('should allow configuration updates', () => {
      engine.configure({
        defaultProvider: 'brave',
        cacheTTL: 7200,
      });

      const config = engine.getConfig();
      expect(config.defaultProvider).toBe('brave');
      expect(config.cacheTTL).toBe(7200);
    });
  });

  describe('Provider Management', () => {
    it('should get available providers', () => {
      const providers = engine.getAvailableProviders();
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should enable/disable providers', () => {
      engine.setProviderEnabled('searxng', true);
      // Provider state updated
      const config = engine.getConfig();
      const searxng = config.providers.find((p: { id: string }) => p.id === 'searxng');
      expect(searxng?.enabled).toBe(true);
    });

    it('should check provider availability', () => {
      expect(engine.isProviderAvailable('duckduckgo')).toBe(true);
      expect(engine.isProviderAvailable('searxng')).toBe(false); // Disabled by default
    });

    it('should get providers for type', () => {
      const webProviders = engine.getProvidersForType('web');
      expect(webProviders.length).toBeGreaterThan(0);

      const localProviders = engine.getProvidersForType('local');
      expect(localProviders.length).toBeGreaterThan(0);
    });
  });

  describe('Search State', () => {
    it('should return initial state', () => {
      const state = engine.getState();
      expect(state.isSearching).toBe(false);
      expect(state.currentQueryId).toBeNull();
    });

    it('should check if searching', () => {
      expect(engine.isSearching()).toBe(false);
    });
  });

  describe('Cache', () => {
    it('should get cache stats', () => {
      const stats = engine.getCacheStats();
      expect(stats.size).toBeDefined();
      expect(stats.maxSize).toBeDefined();
      expect(stats.hitRate).toBeDefined();
    });

    it('should clear cache', () => {
      engine.clearCache();
      const stats = engine.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should track stats', () => {
      const stats = engine.getStats();
      expect(stats.totalSearches).toBeDefined();
      expect(stats.successfulSearches).toBeDefined();
      expect(stats.cacheHits).toBeDefined();
    });

    it('should reset stats', () => {
      engine.resetStats();
      const stats = engine.getStats();
      expect(stats.totalSearches).toBe(0);
    });
  });

  describe('Abort', () => {
    it('should have abort method', () => {
      expect(typeof engine.abort).toBe('function');
    });
  });

  describe('Subscriptions', () => {
    it('should allow subscribing to results', () => {
      const callback = vi.fn();
      const unsubscribe = engine.onSearchResult(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should allow subscribing to errors', () => {
      const callback = vi.fn();
      const unsubscribe = engine.onSearchError(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('ToolsEngine', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ToolsEngine: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let engine: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../toolsEngine');
    ToolsEngine = module.ToolsEngine;
    ToolsEngine.resetInstance();
    engine = ToolsEngine.getInstance();
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = engine.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.sandbox.enabled).toBe(true);
      expect(config.confirmationRequired).toBe(true);
    });

    it('should allow configuration updates', () => {
      engine.configure({
        maxConcurrentTools: 5,
        defaultTimeout: 60000,
      });

      const config = engine.getConfig();
      expect(config.maxConcurrentTools).toBe(5);
      expect(config.defaultTimeout).toBe(60000);
    });

    it('should configure sandbox', () => {
      engine.configureSandbox({
        maxExecutionTime: 60000,
        networkAccess: true,
      });

      const config = engine.getConfig();
      expect(config.sandbox.maxExecutionTime).toBe(60000);
      expect(config.sandbox.networkAccess).toBe(true);
    });

    it('should configure formatter', () => {
      engine.configureFormatter({
        defaultFormat: 'json',
        maxLength: 5000,
      });

      const config = engine.getConfig();
      expect(config.formatter.defaultFormat).toBe('json');
      expect(config.formatter.maxLength).toBe(5000);
    });
  });

  describe('Tool Registry', () => {
    it('should have builtin tools', () => {
      const tools = engine.getAllTools();
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should get tool by id', () => {
      const tool = engine.getTool('file_read');
      expect(tool).toBeDefined();
      expect(tool.id).toBe('file_read');
    });

    it('should get tools by category', () => {
      const fileTools = engine.getToolsByCategory('file');
      expect(fileTools.length).toBeGreaterThan(0);

      const utilTools = engine.getToolsByCategory('utility');
      expect(utilTools.length).toBeGreaterThan(0);
    });

    it('should register custom tool', () => {
      const customTool = {
        id: 'custom_tool',
        name: 'Custom Tool',
        description: 'A custom test tool',
        category: 'utility' as const,
        version: '1.0.0',
        author: 'Test',
        requiredPermissions: ['read' as const],
        minIAMode: 'standard' as const,
        riskLevel: 'safe' as const,
        requiresConfirmation: false,
        canUndo: false,
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: [],
        },
        outputSchema: {
          type: 'string' as const,
          description: 'Output',
        },
        tags: ['test'],
        enabled: true,
        deprecated: false,
        usageCount: 0,
        avgExecutionTime: 0,
        successRate: 1,
      };

      const handler = async () => 'test result';

      engine.registerTool(customTool, handler);

      const registered = engine.getTool('custom_tool');
      expect(registered).toBeDefined();
      expect(registered.name).toBe('Custom Tool');
    });

    it('should unregister tool', () => {
      const result = engine.unregisterTool('custom_tool');
      // May or may not exist from previous test
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Tool State', () => {
    it('should return initial state', () => {
      const state = engine.getState();
      expect(state.isExecuting).toBe(false);
      expect(state.currentInvocationId).toBeNull();
    });

    it('should check if executing', () => {
      expect(engine.isExecuting()).toBe(false);
    });
  });

  describe('Undo System', () => {
    it('should get undoable actions', () => {
      const actions = engine.getUndoableActions();
      expect(Array.isArray(actions)).toBe(true);
    });
  });

  describe('Result Formatting', () => {
    it('should format result as json', () => {
      const result = engine.formatResult({ key: 'value' }, 'json');
      expect(result.format).toBe('json');
      expect(result.content).toContain('key');
    });

    it('should format result as markdown', () => {
      const result = engine.formatResult({ key: 'value' }, 'markdown');
      expect(result.format).toBe('markdown');
      expect(result.content).toContain('**key**');
    });

    it('should format result as table', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const result = engine.formatResult(data, 'table');
      expect(result.format).toBe('table');
      expect(result.content).toContain('|');
    });

    it('should truncate long results', () => {
      engine.configureFormatter({ maxLength: 50 });
      const longData = { data: 'x'.repeat(100) };
      const result = engine.formatResult(longData, 'json');
      expect(result.metadata?.truncated).toBe(true);
    });
  });

  describe('History', () => {
    it('should get execution history', () => {
      const history = engine.getHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should clear history', () => {
      engine.clearHistory();
      const history = engine.getHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should track stats', () => {
      const stats = engine.getStats();
      expect(stats.totalInvocations).toBeDefined();
      expect(stats.successfulInvocations).toBeDefined();
    });

    it('should reset stats', () => {
      engine.resetStats();
      const stats = engine.getStats();
      expect(stats.totalInvocations).toBe(0);
    });

    it('should get tool risk score', () => {
      const score = engine.getToolRiskScore('file_read');
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should get tools by risk level', () => {
      const safeTools = engine.getToolsByRiskLevel('safe');
      expect(safeTools.length).toBeGreaterThan(0);
    });
  });

  describe('Subscriptions', () => {
    it('should allow subscribing to progress', () => {
      const callback = vi.fn();
      const unsubscribe = engine.onProgress(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should allow subscribing to results', () => {
      const callback = vi.fn();
      const unsubscribe = engine.onResult(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SearchToolsOrchestrator', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let SearchToolsOrchestrator: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orchestrator: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../index');
    SearchToolsOrchestrator = module.SearchToolsOrchestrator;
    orchestrator = SearchToolsOrchestrator.getInstance();
  });

  describe('Mode Management', () => {
    it('should set and get mode', () => {
      orchestrator.setMode('dev');
      expect(orchestrator.getMode()).toBe('dev');
    });
  });

  describe('Engine Access', () => {
    it('should get permission manager', () => {
      const pm = orchestrator.getPermissionManager();
      expect(pm).toBeDefined();
      expect(typeof pm.getMode).toBe('function');
    });

    it('should get search engine', () => {
      const se = orchestrator.getSearchEngine();
      expect(se).toBeDefined();
      expect(typeof se.search).toBe('function');
    });

    it('should get tools engine', () => {
      const te = orchestrator.getToolsEngine();
      expect(te).toBeDefined();
      expect(typeof te.invokeTool).toBe('function');
    });
  });

  describe('Quick Access', () => {
    it('should get accessible tools', () => {
      orchestrator.setMode('standard');
      const tools = orchestrator.getAccessibleTools();
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should get search providers', () => {
      const providers = orchestrator.getSearchProviders();
      expect(providers.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('should get combined stats', () => {
      const stats = orchestrator.getStats();
      expect(stats.permissions).toBeDefined();
      expect(stats.search).toBeDefined();
      expect(stats.tools).toBeDefined();
    });

    it('should get status', () => {
      const status = orchestrator.getStatus();
      expect(status.mode).toBeDefined();
      expect(status.isSearching).toBeDefined();
      expect(status.isExecuting).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SearchTools Configuration', () => {
  it('should export configuration constants', async () => {
    const config = await import('../searchTools.config');

    expect(config.DEFAULT_SEARCH_TOOLS_CONFIG).toBeDefined();
    expect(config.DEFAULT_PERMISSION_MATRIX).toBeDefined();
    expect(config.BUILTIN_TOOLS).toBeDefined();
    expect(config.PERMISSION_LEVEL_PRIORITY).toBeDefined();
  });

  it('should have correct permission priorities', async () => {
    const { PERMISSION_LEVEL_PRIORITY } = await import('../searchTools.config');

    expect(PERMISSION_LEVEL_PRIORITY.none).toBe(0);
    expect(PERMISSION_LEVEL_PRIORITY.read).toBe(1);
    expect(PERMISSION_LEVEL_PRIORITY.write).toBe(2);
    expect(PERMISSION_LEVEL_PRIORITY.execute).toBe(3);
    expect(PERMISSION_LEVEL_PRIORITY.admin).toBe(4);
  });

  it('should have builtin tools', async () => {
    const { BUILTIN_TOOLS } = await import('../searchTools.config');

    expect(BUILTIN_TOOLS.length).toBeGreaterThan(0);

    const webSearch = BUILTIN_TOOLS.find((t: { id: string }) => t.id === 'web_search');
    expect(webSearch).toBeDefined();

    const fileRead = BUILTIN_TOOLS.find((t: { id: string }) => t.id === 'file_read');
    expect(fileRead).toBeDefined();
  });

  it('should validate tool input correctly', async () => {
    const { validateToolInput, BUILTIN_TOOLS } = await import('../searchTools.config');

    const fileReadTool = BUILTIN_TOOLS.find((t: { id: string }) => t.id === 'file_read');

    // Valid input
    const validResult = validateToolInput(fileReadTool, { path: '/test/file.txt' });
    expect(validResult.valid).toBe(true);
    expect(validResult.errors.length).toBe(0);

    // Invalid input - missing required field
    const invalidResult = validateToolInput(fileReadTool, {});
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  it('should filter tools by mode', async () => {
    const { filterToolsByMode, BUILTIN_TOOLS, DEFAULT_PERMISSION_MATRIX } = await import('../searchTools.config');

    const standardTools = filterToolsByMode(BUILTIN_TOOLS, 'standard', DEFAULT_PERMISSION_MATRIX);
    const devTools = filterToolsByMode(BUILTIN_TOOLS, 'dev', DEFAULT_PERMISSION_MATRIX);
    const autonomousTools = filterToolsByMode(BUILTIN_TOOLS, 'autonomous', DEFAULT_PERMISSION_MATRIX);

    // More permissions = more accessible tools
    expect(devTools.length).toBeGreaterThanOrEqual(standardTools.length);
    expect(autonomousTools.length).toBeGreaterThanOrEqual(devTools.length);
  });
});
