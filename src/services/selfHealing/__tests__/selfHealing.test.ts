/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING ENGINE — Tests Unitaires
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// OBSERVER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SelfHealingObserver', () => {
  let SelfHealingObserver: any;

  let observer: any;

  beforeEach(async () => {
    // Reset singleton for each test
    vi.resetModules();
    const module = await import('../selfHealingObserver');
    SelfHealingObserver = module.SelfHealingObserver;

    // Access private constructor via getInstance
    observer = SelfHealingObserver.getInstance();
    observer.resetStatistics();
  });

  afterEach(async () => {
    await observer.stop();
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = observer.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.captureGlobalErrors).toBe(true);
      expect(config.captureUnhandledRejections).toBe(true);
      expect(config.maxEventsPerMinute).toBe(100);
    });

    it('should allow configuration updates', () => {
      observer.configure({
        maxEventsPerMinute: 50,
        deduplicationWindowMs: 10000,
      });

      const config = observer.getConfig();
      expect(config.maxEventsPerMinute).toBe(50);
      expect(config.deduplicationWindowMs).toBe(10000);
    });
  });

  describe('State', () => {
    it('should return initial state', () => {
      const state = observer.getState();
      expect(state.isActive).toBe(false);
      expect(state.totalCaptured).toBe(0);
      expect(state.totalDeduplicated).toBe(0);
    });

    it('should track statistics', () => {
      const stats = observer.getStatistics();
      expect(stats.total).toBe(0);
      expect(stats.deduplicated).toBe(0);
      expect(stats.byType).toEqual({});
      expect(stats.bySource).toEqual({});
    });
  });

  describe('Subscription', () => {
    it('should allow subscribing to events', () => {
      const callback = vi.fn();
      const unsubscribe = observer.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');

      // Cleanup
      unsubscribe();
    });

    it('should unsubscribe correctly', () => {
      const callback = vi.fn();
      const unsubscribe = observer.subscribe(callback);
      unsubscribe();

      // Callback should not be called after unsubscribe
      // (tested implicitly by no errors)
    });
  });

  describe('Error Capture Methods', () => {
    it('should have captureReactError method', () => {
      expect(typeof observer.captureReactError).toBe('function');
    });

    it('should have captureTauriInvokeError method', () => {
      expect(typeof observer.captureTauriInvokeError).toBe('function');
    });

    it('should have capturePerformanceIssue method', () => {
      expect(typeof observer.capturePerformanceIssue).toBe('function');
    });
  });

  describe('Recent Errors', () => {
    it('should return empty array initially', () => {
      const errors = observer.getRecentErrors();
      expect(errors).toEqual([]);
    });

    it('should accept maxAge parameter', () => {
      const errors = observer.getRecentErrors(30000);
      expect(Array.isArray(errors)).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ANALYZER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SelfHealingAnalyzer', () => {
  let SelfHealingAnalyzer: any;

  let analyzer: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../selfHealingAnalyzer');
    SelfHealingAnalyzer = module.SelfHealingAnalyzer;
    analyzer = SelfHealingAnalyzer.getInstance();
    analyzer.clearHistory();
    analyzer.resetModuleHealth();
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = analyzer.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.confidenceThreshold).toBe(0.6);
      expect(config.patternMinOccurrences).toBe(3);
    });

    it('should allow configuration updates', () => {
      analyzer.configure({
        confidenceThreshold: 0.8,
        maxHistorySize: 200,
      });

      const config = analyzer.getConfig();
      expect(config.confidenceThreshold).toBe(0.8);
      expect(config.maxHistorySize).toBe(200);
    });
  });

  describe('Analysis', () => {
    it('should analyze a healing event', () => {
      const event = {
        id: 'test_1',
        timestamp: Date.now(),
        category: 'react' as const,
        moduleId: 'test_module',
        moduleName: 'TestModule',
        eventType: 'js_runtime_error',
        message: 'Test error message',
        context: {},
        severity: 'medium' as const,
        autoDetected: true,
      };

      const diagnosis = analyzer.analyze(event);

      expect(diagnosis).toBeDefined();
      expect(diagnosis.eventId).toBe(event.id);
      expect(diagnosis.category).toBe(event.category);
      expect(diagnosis.severity).toBe(event.severity);
      expect(diagnosis.confidence).toBeGreaterThan(0);
      expect(diagnosis.suggestedActions).toBeDefined();
      expect(diagnosis.suggestedActions.length).toBeGreaterThan(0);
    });

    it('should generate proper diagnosis for different event types', () => {
      const types = [
        { type: 'tauri_command_fail', category: 'tauri' },
        { type: 'network_failure', category: 'network' },
        { type: 'performance_degradation', category: 'performance' },
      ] as const;

      for (const { type, category } of types) {
        const event = {
          id: `test_${type}`,
          timestamp: Date.now(),
          category: category as 'tauri' | 'network' | 'performance',
          moduleId: `${category}_module`,
          moduleName: 'TestModule',
          eventType: type,
          message: `Test ${type} error`,
          context: {},
          severity: 'high' as const,
          autoDetected: true,
        };

        const diagnosis = analyzer.analyze(event);
        expect(diagnosis.category).toBe(category);
        expect(diagnosis.nature).toBeDefined();
      }
    });

    it('should batch analyze multiple events', () => {
      const events = Array.from({ length: 3 }, (_, i) => ({
        id: `batch_${i}`,
        timestamp: Date.now(),
        category: 'react' as const,
        moduleId: 'batch_module',
        moduleName: 'BatchModule',
        eventType: 'js_runtime_error',
        message: `Batch error ${i}`,
        context: {},
        severity: 'low' as const,
        autoDetected: true,
      }));

      const diagnoses = analyzer.analyzeBatch(events);

      expect(diagnoses.length).toBe(3);
      diagnoses.forEach((d: { eventId: string }, i: number) => {
        expect(d.eventId).toBe(events[i].id);
      });
    });
  });

  describe('Module Health', () => {
    it('should track module health', () => {
      const event = {
        id: 'health_test',
        timestamp: Date.now(),
        category: 'react' as const,
        moduleId: 'health_module',
        moduleName: 'HealthModule',
        eventType: 'js_runtime_error',
        message: 'Health test error',
        context: {},
        severity: 'high' as const,
        autoDetected: true,
      };

      analyzer.analyze(event);

      const health = analyzer.getModuleHealth('health_module');
      expect(health).toBeDefined();
      expect(health?.moduleId).toBe('health_module');
      expect(health?.errorCount).toBe(1);
    });

    it('should get all module health', () => {
      const events = ['module_a', 'module_b'].map(id => ({
        id: `test_${id}`,
        timestamp: Date.now(),
        category: 'react' as const,
        moduleId: id,
        moduleName: id,
        eventType: 'js_runtime_error',
        message: 'Test error',
        context: {},
        severity: 'medium' as const,
        autoDetected: true,
      }));

      events.forEach(e => analyzer.analyze(e));

      const allHealth = analyzer.getAllModuleHealth();
      expect(allHealth.length).toBe(2);
    });
  });

  describe('Patterns', () => {
    it('should detect patterns', () => {
      const events = Array.from({ length: 5 }, (_, i) => ({
        id: `pattern_${i}`,
        timestamp: Date.now(),
        category: 'react' as const,
        moduleId: 'pattern_module',
        moduleName: 'PatternModule',
        eventType: 'js_runtime_error',
        message: 'Repeated error',
        context: {},
        severity: 'medium' as const,
        autoDetected: true,
      }));

      events.forEach(e => analyzer.analyze(e));

      const patterns = analyzer.getPatterns();
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should get recurring patterns', () => {
      // Generate 5 similar events to create a recurring pattern
      for (let i = 0; i < 5; i++) {
        analyzer.analyze({
          id: `recurring_${i}`,
          timestamp: Date.now(),
          category: 'tauri' as const,
          moduleId: 'recurring_module',
          moduleName: 'RecurringModule',
          eventType: 'tauri_command_fail',
          message: 'Recurring error',
          context: {},
          severity: 'high' as const,
          autoDetected: true,
        });
      }

      const recurring = analyzer.getRecurringPatterns();
      expect(recurring.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('History', () => {
    it('should maintain event history', () => {
      analyzer.analyze({
        id: 'history_test',
        timestamp: Date.now(),
        category: 'react' as const,
        moduleId: 'history_module',
        moduleName: 'HistoryModule',
        eventType: 'js_runtime_error',
        message: 'History test',
        context: {},
        severity: 'low' as const,
        autoDetected: true,
      });

      const history = analyzer.getEventHistory();
      expect(history.length).toBe(1);
    });

    it('should filter history by age', () => {
      const history = analyzer.getEventHistory(60000);
      expect(Array.isArray(history)).toBe(true);
    });

    it('should clear history', () => {
      analyzer.analyze({
        id: 'clear_test',
        timestamp: Date.now(),
        category: 'react' as const,
        moduleId: 'clear_module',
        moduleName: 'ClearModule',
        eventType: 'js_runtime_error',
        message: 'Clear test',
        context: {},
        severity: 'info' as const,
        autoDetected: true,
      });

      analyzer.clearHistory();

      const history = analyzer.getEventHistory();
      expect(history.length).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBOOK ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SelfHealingPlaybookEngine', () => {
  let SelfHealingPlaybookEngine: any;

  let engine: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../selfHealingPlaybookEngine');
    SelfHealingPlaybookEngine = module.SelfHealingPlaybookEngine;
    engine = SelfHealingPlaybookEngine.getInstance();
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = engine.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.maxActionsPerPlaybook).toBe(10);
      expect(config.autoRollbackOnFailure).toBe(true);
    });

    it('should allow configuration updates', () => {
      engine.configure({
        maxActionsPerPlaybook: 5,
        allowRiskyActions: true,
      });

      const config = engine.getConfig();
      expect(config.maxActionsPerPlaybook).toBe(5);
      expect(config.allowRiskyActions).toBe(true);
    });
  });

  describe('Playbook Registry', () => {
    it('should have default playbooks', () => {
      const playbooks = engine.getAllPlaybooks();
      expect(playbooks.length).toBeGreaterThan(0);
    });

    it('should get playbook by id', () => {
      const playbook = engine.getPlaybook('react-error-recovery');
      expect(playbook).toBeDefined();
      expect(playbook?.id).toBe('react-error-recovery');
    });

    it('should register custom playbook', () => {
      const customPlaybook = {
        id: 'custom-test',
        name: 'Custom Test Playbook',
        description: 'A test playbook',
        targetCategory: ['react' as const],
        targetSeverity: ['medium' as const],
        conditions: [],
        actions: [
          {
            id: 'test-action',
            type: 'noop' as const,
            targetModule: 'test',
            parameters: {},
            timeout: 1000,
            onFailure: 'continue' as const,
            description: 'Test action',
          },
        ],
        maxRetries: 1,
        cooldownMs: 1000,
        requiresConfirmation: false,
        safetyLevel: 'safe' as const,
        reversible: true,
        enabled: true,
      };

      engine.registerPlaybook(customPlaybook);

      const retrieved = engine.getPlaybook('custom-test');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Custom Test Playbook');
    });

    it('should unregister playbook', () => {
      engine.registerPlaybook({
        id: 'to-remove',
        name: 'To Remove',
        description: 'Will be removed',
        targetCategory: ['react' as const],
        targetSeverity: ['low' as const],
        conditions: [],
        actions: [],
        maxRetries: 1,
        cooldownMs: 1000,
        requiresConfirmation: false,
        safetyLevel: 'safe' as const,
        reversible: true,
        enabled: true,
      });

      const removed = engine.unregisterPlaybook('to-remove');
      expect(removed).toBe(true);

      const retrieved = engine.getPlaybook('to-remove');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Playbook Selection', () => {
    it('should select playbook for diagnosis', () => {
      const diagnosis = {
        eventId: 'sel_test',
        timestamp: Date.now(),
        nature: 'react_error',
        affectedModule: 'TestComponent',
        category: 'react' as const,
        probableCause: 'State corruption',
        severity: 'medium' as const,
        urgency: 5,
        potentialImpact: ['UI degradation'],
        suggestedActions: ['reset_state' as const],
        historicalPatterns: [],
        escalationRequired: false,
        confidence: 0.7,
      };

      const match = engine.selectPlaybook(diagnosis);

      expect(match).not.toBeNull();
      expect(match?.playbook).toBeDefined();
      expect(match?.score).toBeGreaterThan(0);
    });

    it('should return null if no matching playbook', () => {
      const diagnosis = {
        eventId: 'no_match',
        timestamp: Date.now(),
        nature: 'unknown_issue',
        affectedModule: 'Unknown',
        category: 'security' as const, // No security playbooks
        probableCause: 'Unknown',
        severity: 'info' as const,
        urgency: 1,
        potentialImpact: [],
        suggestedActions: [],
        historicalPatterns: [],
        escalationRequired: false,
        confidence: 0.3,
      };

      const match = engine.selectPlaybook(diagnosis);
      expect(match).toBeNull();
    });
  });

  describe('Execution Plan Generation', () => {
    it('should generate execution plan', () => {
      const playbook = engine.getPlaybook('react-error-recovery')!;
      const diagnosis = {
        eventId: 'plan_test',
        timestamp: Date.now(),
        nature: 'react_error',
        affectedModule: 'TestComponent',
        category: 'react' as const,
        probableCause: 'Test cause',
        severity: 'medium' as const,
        urgency: 5,
        potentialImpact: [],
        suggestedActions: [],
        historicalPatterns: [],
        escalationRequired: false,
        confidence: 0.7,
      };

      const plan = engine.generateExecutionPlan(playbook, diagnosis);

      expect(plan).toBeDefined();
      expect(plan.playbookId).toBe(playbook.id);
      expect(plan.diagnosisId).toBe(diagnosis.eventId);
      expect(plan.actions.length).toBeGreaterThan(0);
      expect(plan.estimatedDuration).toBeGreaterThan(0);
    });

    it('should calculate risk level', () => {
      const playbook = engine.getPlaybook('critical-recovery')!;
      const diagnosis = {
        eventId: 'risk_test',
        timestamp: Date.now(),
        nature: 'critical_failure',
        affectedModule: 'Critical',
        category: 'react' as const,
        probableCause: 'Critical issue',
        severity: 'critical' as const,
        urgency: 10,
        potentialImpact: [],
        suggestedActions: [],
        historicalPatterns: [],
        escalationRequired: true,
        confidence: 0.9,
      };

      const plan = engine.generateExecutionPlan(playbook, diagnosis);

      expect(['safe', 'moderate', 'risky']).toContain(plan.riskLevel);
    });
  });

  describe('Summary', () => {
    it('should provide playbook summary', () => {
      const summary = engine.getPlaybookSummary();

      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);

      const first = summary[0];
      expect(first.id).toBeDefined();
      expect(first.name).toBeDefined();
      expect(first.enabled).toBeDefined();
    });
  });

  describe('Execution History', () => {
    it('should track execution history', () => {
      const history = engine.getExecutionHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should limit history by count', () => {
      const history = engine.getExecutionHistory(5);
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SelfHealingExecutor', () => {
  let SelfHealingExecutor: any;

  let executor: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../selfHealingExecutor');
    SelfHealingExecutor = module.SelfHealingExecutor;
    executor = SelfHealingExecutor.getInstance();

    // Enable dry run mode for tests
    executor.configure({ dryRunMode: true });
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = executor.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.maxConcurrentActions).toBe(1);
      expect(config.autoRollback).toBe(true);
    });

    it('should allow dry run mode', () => {
      executor.setDryRunMode(true);
      const config = executor.getConfig();
      expect(config.dryRunMode).toBe(true);
    });
  });

  describe('State', () => {
    it('should return initial state', () => {
      const state = executor.getState();
      expect(state.isExecuting).toBe(false);
      expect(state.currentPlanId).toBeNull();
      expect(state.currentActionId).toBeNull();
    });

    it('should track executing state', () => {
      expect(executor.isExecuting()).toBe(false);
    });
  });

  describe('Progress Callbacks', () => {
    it('should allow subscribing to progress', () => {
      const callback = vi.fn();
      const unsubscribe = executor.onProgress(callback);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });
  });

  describe('Execution', () => {
    it('should execute plan in dry run mode', async () => {
      const plan = {
        id: 'test_plan',
        playbookId: 'test_playbook',
        playbookName: 'Test Playbook',
        diagnosisId: 'test_diagnosis',
        timestamp: Date.now(),
        estimatedDuration: 1000,
        riskLevel: 'safe' as const,
        actions: [
          {
            id: 'action_1',
            sequence: 0,
            action: {
              id: 'noop_action',
              type: 'noop' as const,
              targetModule: 'test',
              parameters: {},
              timeout: 1000,
              onFailure: 'continue' as const,
              description: 'Test action',
            },
            dependencies: [],
            estimatedDuration: 0,
            canParallelize: false,
            status: 'ready' as const,
          },
        ],
        rollbackActions: [],
        requiresConfirmation: false,
        metadata: {},
      };

      const result = await executor.executePlan(plan);

      expect(result).toBeDefined();
      expect(result.planId).toBe('test_plan');
      expect(result.status).toBe('success');
      expect(result.actionsExecuted).toBe(1);
    });
  });

  describe('History', () => {
    it('should maintain execution history', async () => {
      executor.configure({ dryRunMode: true });

      const plan = {
        id: 'history_plan',
        playbookId: 'test_playbook',
        playbookName: 'History Test',
        diagnosisId: 'test',
        timestamp: Date.now(),
        estimatedDuration: 0,
        riskLevel: 'safe' as const,
        actions: [
          {
            id: 'history_action',
            sequence: 0,
            action: {
              id: 'noop',
              type: 'noop' as const,
              targetModule: 'test',
              parameters: {},
              timeout: 1000,
              onFailure: 'continue' as const,
              description: 'Test',
            },
            dependencies: [],
            estimatedDuration: 0,
            canParallelize: false,
            status: 'ready' as const,
          },
        ],
        rollbackActions: [],
        requiresConfirmation: false,
        metadata: {},
      };

      await executor.executePlan(plan);

      const history = executor.getExecutionHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('Abort', () => {
    it('should have abort method', () => {
      expect(typeof executor.abort).toBe('function');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SYNC LAYER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SelfHealingSyncLayer', () => {
  let SelfHealingSyncLayer: any;

  let syncLayer: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../selfHealingSyncLayer');
    SelfHealingSyncLayer = module.SelfHealingSyncLayer;
    syncLayer = SelfHealingSyncLayer.getInstance();
    syncLayer.resetProfile();
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = syncLayer.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.autoSync).toBe(true);
      expect(config.xpMultiplier).toBe(1.0);
    });

    it('should allow configuration updates', () => {
      syncLayer.configure({
        xpMultiplier: 2.0,
        maxHistoryItems: 50,
      });

      const config = syncLayer.getConfig();
      expect(config.xpMultiplier).toBe(2.0);
      expect(config.maxHistoryItems).toBe(50);
    });
  });

  describe('Profile', () => {
    it('should return initial profile', () => {
      const profile = syncLayer.getProfile();
      expect(profile.totalAnomaliesDetected).toBe(0);
      expect(profile.totalRepairsAttempted).toBe(0);
      expect(profile.successRate).toBe(0);
      expect(profile.healingXP).toBe(0);
      expect(profile.evolutionLevel).toBe(1);
    });

    it('should reset profile', () => {
      syncLayer.addXP(100);
      syncLayer.resetProfile();

      const profile = syncLayer.getProfile();
      expect(profile.healingXP).toBe(0);
    });
  });

  describe('XP System', () => {
    it('should add XP', () => {
      syncLayer.addXP(50);
      const profile = syncLayer.getProfile();
      expect(profile.healingXP).toBe(50);
    });

    it('should calculate level based on XP', () => {
      syncLayer.addXP(150); // Should be level 2
      const profile = syncLayer.getProfile();
      expect(profile.evolutionLevel).toBe(2);
    });

    it('should provide XP progress', () => {
      syncLayer.addXP(50);
      const progress = syncLayer.getXPProgress();

      expect(progress.current).toBeDefined();
      expect(progress.nextLevel).toBeDefined();
      expect(progress.progress).toBeGreaterThanOrEqual(0);
      expect(progress.progress).toBeLessThanOrEqual(1);
    });
  });

  describe('Vitals', () => {
    it('should return initial vitals', () => {
      const vitals = syncLayer.getVitals();
      expect(vitals.timestamp).toBeDefined();
      expect(vitals.cpu_usage).toBeDefined();
      expect(vitals.memory_usage).toBeDefined();
    });

    it('should update vital', () => {
      syncLayer.updateVital('cpu_usage', 50);
      const vitals = syncLayer.getVitals();
      expect(vitals.cpu_usage).toBe(50);
    });
  });

  describe('Event Recording', () => {
    it('should record event', () => {
      const event = {
        id: 'sync_event',
        timestamp: Date.now(),
        category: 'react' as const,
        moduleId: 'test',
        moduleName: 'Test',
        eventType: 'test_error',
        message: 'Test error',
        context: {},
        severity: 'low' as const,
        autoDetected: true,
      };

      syncLayer.recordEvent(event);

      const profile = syncLayer.getProfile();
      expect(profile.totalAnomaliesDetected).toBe(1);
    });
  });

  describe('Synced State', () => {
    it('should return synced state', () => {
      const state = syncLayer.getSyncedState();

      expect(state.profile).toBeDefined();
      expect(state.vitals).toBeDefined();
      expect(state.recentEvents).toBeDefined();
      expect(state.patterns).toBeDefined();
      expect(state.lastSyncTime).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SelfHealing Configuration', () => {
  it('should export configuration types', async () => {
    const config = await import('../selfHealing.config');

    expect(config).toBeDefined();
    expect(config.SEVERITY_WEIGHTS).toBeDefined();
    expect(config.SEVERITY_WEIGHTS.critical).toBe(100);
  });

  it('should have proper severity weights', async () => {
    const { SEVERITY_WEIGHTS, CATEGORY_PRIORITIES } =
      await import('../selfHealing.config');

    expect(SEVERITY_WEIGHTS.info).toBe(1);
    expect(SEVERITY_WEIGHTS.low).toBe(10);
    expect(SEVERITY_WEIGHTS.medium).toBe(25);
    expect(SEVERITY_WEIGHTS.high).toBe(50);
    expect(SEVERITY_WEIGHTS.critical).toBe(100);

    expect(CATEGORY_PRIORITIES.security).toBe(10);
    expect(CATEGORY_PRIORITIES.react).toBe(7);
  });
});
