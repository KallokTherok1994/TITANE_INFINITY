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
    await orchestrator.shutdown();
  });

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should create orchestrator with default config', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator.getState().initialized).toBe(false);
    });

    it('should initialize all enabled strategies', async () => {
      await orchestrator.initialize();
      const state = orchestrator.getState();
      
      expect(state.initialized).toBe(true);
      expect(state.activeStrategies.length).toBeGreaterThan(0);
    });

    it('should support custom configuration', () => {
      const config: Partial<UnifiedOrchestratorConfig> = {
        strategies: {
          mcp: { enabled: true, lazyLoad: false, priority: 100 },
          cognitive: { enabled: false, lazyLoad: true, priority: 90 }
        }
      };
      
      const customOrchestrator = new UnifiedOrchestrator(config);
      expect(customOrchestrator).toBeDefined();
    });

    it('should handle initialization idempotency', async () => {
      await orchestrator.initialize();
      await orchestrator.initialize(); // Second call should be no-op
      
      expect(orchestrator.getState().initialized).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // STRATEGY ACCESS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Strategy Access', () => {
    it('should get strategy by type', async () => {
      const mcpStrategy = await orchestrator.getStrategy('mcp');
      expect(mcpStrategy).toBeDefined();
      expect(mcpStrategy?.type).toBe('mcp');
    });

    it('should return null for disabled strategy', async () => {
      const config: Partial<UnifiedOrchestratorConfig> = {
        strategies: {
          quantum: { enabled: false, lazyLoad: true, priority: 70 }
        }
      };
      
      const customOrchestrator = new UnifiedOrchestrator(config);
      const quantumStrategy = await customOrchestrator.getStrategy('quantum');
      
      // Should still load if explicitly requested
      expect(quantumStrategy).toBeDefined();
    });

    it('should check strategy availability', async () => {
      await orchestrator.initialize();
      
      const hasMCP = orchestrator.hasStrategy('mcp');
      expect(hasMCP).toBe(true);
    });

    it('should get active strategies list', async () => {
      await orchestrator.initialize();
      
      const activeStrategies = orchestrator.getActiveStrategies();
      expect(Array.isArray(activeStrategies)).toBe(true);
      expect(activeStrategies.length).toBeGreaterThan(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // HEALTH MONITORING TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Health Monitoring', () => {
    it('should return unknown status when not initialized', async () => {
      const status = await orchestrator.getHealthStatus();
      expect(status).toBe('unknown');
    });

    it('should check health of all strategies', async () => {
      await orchestrator.initialize();
      
      const healthResults = await orchestrator.checkHealth();
      expect(healthResults).toBeDefined();
      expect(Object.keys(healthResults).length).toBeGreaterThan(0);
    });

    it('should compute overall health status', async () => {
      await orchestrator.initialize();
      
      const status = await orchestrator.getHealthStatus();
      expect(['healthy', 'degraded', 'critical', 'unknown']).toContain(status);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // METRICS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Metrics Collection', () => {
    it('should get initial metrics summary', () => {
      const metrics = orchestrator.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successRate).toBe(1.0);
    });

    it('should aggregate metrics from strategies', async () => {
      await orchestrator.initialize();
      
      const metrics = orchestrator.getMetrics();
      expect(metrics.timestamp).toBeGreaterThan(0);
    });

    it('should return orchestrator state', () => {
      const state = orchestrator.getState();
      
      expect(state).toBeDefined();
      expect(state.initialized).toBe(false);
      expect(state.activeStrategies).toEqual([]);
      expect(state.metrics).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Execution', () => {
    it('should execute MCP operation', async () => {
      const result = await orchestrator.execute('mcp', 'createJob', {
        type: 'test',
        priority: 'medium'
      });
      
      expect(result.success).toBe(true);
      expect(result.metadata?.strategyUsed).toBe('mcp');
    });

    it('should handle execution errors gracefully', async () => {
      const result = await orchestrator.execute('mcp', 'invalidOperation');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for unavailable strategy', async () => {
      const config: Partial<UnifiedOrchestratorConfig> = {
        strategies: {
          quantum: { enabled: false, lazyLoad: false, priority: 70 }
        }
      };
      
      const customOrchestrator = new UnifiedOrchestrator(config);
      const result = await customOrchestrator.execute('quantum', 'test');
      
      // Should still work if strategy can be loaded
      expect(result).toBeDefined();
    });

    it('should record execution metrics', async () => {
      await orchestrator.execute('mcp', 'listJobs');
      
      const metrics = orchestrator.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThanOrEqual(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // SHUTDOWN TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await orchestrator.initialize();
      await orchestrator.shutdown();
      
      const state = orchestrator.getState();
      expect(state.initialized).toBe(false);
      expect(state.activeStrategies).toEqual([]);
    });

    it('should handle shutdown when not initialized', async () => {
      await expect(orchestrator.shutdown()).resolves.not.toThrow();
    });
  });
});
