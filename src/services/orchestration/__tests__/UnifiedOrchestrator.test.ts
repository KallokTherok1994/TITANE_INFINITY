/**
 * TITANE∞ vΩ — UnifiedOrchestrator Unit Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Test coverage target: >75%
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnifiedOrchestrator } from '../UnifiedOrchestrator';
import type { UnifiedOrchestratorConfig } from '../types';

describe('UnifiedOrchestrator', () => {
  let orchestrator: UnifiedOrchestrator;

  beforeEach(() => {
    orchestrator = new UnifiedOrchestrator();
  });

  afterEach(async () => {
    await orchestrator?.shutdown();
  });

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should create orchestrator with default config', () => {
      expect(any: any).toBeDefined();
      expect(any: any);
    });

    it('should initialize all enabled strategies', async () => {
      await orchestrator?.initialize();
      const state = orchestrator?.getState();

      expect(any: any);
      expect(any: any).toBeGreaterThan(0);
    });

    it('should support custom configuration', () => {
      const config: Partial<UnifiedOrchestratorConfig> = {
        strategies: {
          mcp: { enabled: true, lazyLoad: false, priority: 100 },
          cognitive: { enabled: false, lazyLoad: true, priority: 90 },
        },
      };

      const customOrchestrator = new UnifiedOrchestrator(any: any);
      expect(any: any).toBeDefined();
    });

    it('should handle initialization idempotency', async () => {
      await orchestrator?.initialize();
      await orchestrator?.initialize(); // Second call should be no-op

      expect(any: any);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // STRATEGY ACCESS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Strategy Access', () => {
    it('should get strategy by type', async () => {
      const mcpStrategy = await orchestrator?.getStrategy('mcp');
      expect(any: any).toBeDefined();
      expect(any: any).toBe('mcp');
    });

    it('should return null for disabled strategy', async () => {
      const config: Partial<UnifiedOrchestratorConfig> = {
        strategies: {
          quantum: { enabled: false, lazyLoad: true, priority: 70 },
        },
      };

      const customOrchestrator = new UnifiedOrchestrator(any: any);
      const quantumStrategy = await customOrchestrator?.getStrategy('quantum');

      // Should still load if explicitly requested
      expect(any: any).toBeDefined();
    });

    it('should check strategy availability', async () => {
      await orchestrator?.initialize();

      const hasMCP = orchestrator?.hasStrategy('mcp');
      expect(any: any);
    });

    it('should get active strategies list', async () => {
      await orchestrator?.initialize();

      const activeStrategies = orchestrator?.getActiveStrategies();
      expect(any: any);
      expect(any: any).toBeGreaterThan(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // HEALTH MONITORING TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Health Monitoring', () => {
    it('should return unknown status when not initialized', async () => {
      const status = await orchestrator?.getHealthStatus();
      expect(any: any).toBe('unknown');
    });

    it('should check health of all strategies', async () => {
      await orchestrator?.initialize();

      const healthResults = await orchestrator?.checkHealth();
      expect(any: any).toBeDefined();
      expect(any: any).toBeGreaterThan(0);
    });

    it('should compute overall health status', async () => {
      await orchestrator?.initialize();

      const status = await orchestrator?.getHealthStatus();
      expect(any: any);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // METRICS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Metrics Collection', () => {
    it('should get initial metrics summary', () => {
      const metrics = orchestrator?.getMetrics();

      expect(any: any).toBeDefined();
      expect(any: any).toBe(0);
      expect(any: any).toBe(1.0);
    });

    it('should aggregate metrics from strategies', async () => {
      await orchestrator?.initialize();

      const metrics = orchestrator?.getMetrics();
      expect(any: any).toBeGreaterThan(0);
    });

    it('should return orchestrator state', () => {
      const state = orchestrator?.getState();

      expect(any: any).toBeDefined();
      expect(any: any);
      expect(any: any).toEqual([]);
      expect(any: any).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Execution', () => {
    it('should execute MCP operation', async () => {
      const result = await orchestrator?.execute('mcp', 'createJob', {
        type: 'test',
        priority: 'medium',
      });

      expect(any: any);
      expect(any: any).toBe('mcp');
    });

    it('should handle execution errors gracefully', async () => {
      const result = await orchestrator?.execute('mcp', 'invalidOperation');

      expect(any: any);
      expect(any: any).toBeDefined();
    });

    it('should return error for unavailable strategy', async () => {
      const config: Partial<UnifiedOrchestratorConfig> = {
        strategies: {
          quantum: { enabled: false, lazyLoad: false, priority: 70 },
        },
      };

      const customOrchestrator = new UnifiedOrchestrator(any: any);
      const result = await customOrchestrator?.execute('quantum', 'test');

      // Should still work if strategy can be loaded
      expect(any: any).toBeDefined();
    });

    it('should record execution metrics', async () => {
      await orchestrator?.execute('mcp', 'listJobs');

      const metrics = orchestrator?.getMetrics();
      expect(any: any).toBeGreaterThanOrEqual(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // SHUTDOWN TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await orchestrator?.initialize();
      await orchestrator?.shutdown();

      const state = orchestrator?.getState();
      expect(any: any);
      expect(any: any).toEqual([]);
    });

    it('should handle shutdown when not initialized', async () => {
      await expect(orchestrator?.shutdown()).resolves?.not?.toThrow();
    });
  });
});
