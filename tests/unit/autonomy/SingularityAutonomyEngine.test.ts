/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * SINGULARITY AUTONOMY ENGINE - TEST SUITE
 * Tests for autonomous maintenance system (Phase 1)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SingularityAutonomyEngine } from '../../src/core/autonomy/SingularityAutonomyEngine';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

describe('SingularityAutonomyEngine', () => {
  let engine: SingularityAutonomyEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = SingularityAutonomyEngine.getInstance();
  });

  afterEach(() => {
    engine.stop();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SingularityAutonomyEngine.getInstance();
      const instance2 = SingularityAutonomyEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Lifecycle Management', () => {
    it('should start autonomy cycle successfully', () => {
      engine.start();
      expect(engine['scanIntervalId']).not.toBeNull();
    });

    it('should stop autonomy cycle successfully', () => {
      engine.start();
      engine.stop();
      expect(engine['scanIntervalId']).toBeNull();
    });

    it('should not restart if already running', () => {
      engine.start();
      const firstIntervalId = engine['scanIntervalId'];
      engine.start();
      expect(engine['scanIntervalId']).toBe(firstIntervalId);
    });
  });

  describe('auto_scan', () => {
    it('should perform backend scan successfully', async () => {
      mockInvoke.mockResolvedValueOnce({
        backend_health: 95,
        frontend_health: 90,
        issues_found: 2,
        scan_duration_ms: 150,
      });

      const result = await engine.auto_scan();

      expect(mockInvoke).toHaveBeenCalledWith('autonomy_scan_backend');
      expect(result.backend_health).toBeGreaterThanOrEqual(0);
      expect(result.backend_health).toBeLessThanOrEqual(100);
      expect(result.issues_found).toBe(2);
    });

    it('should handle scan errors gracefully', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Backend unavailable'));

      const result = await engine.auto_scan();

      expect(result.backend_health).toBe(0);
      expect(result.issues_found).toBeGreaterThan(0);
    });
  });

  describe('auto_detect', () => {
    it('should detect anomalies from scan results', async () => {
      const scanResult = {
        backend_health: 75,
        frontend_health: 80,
        issues_found: 5,
        scan_duration_ms: 200,
      };

      mockInvoke.mockResolvedValueOnce({
        anomalies: [
          { type: 'memory_leak', severity: 'high', location: 'ChatPanel' },
          { type: 'performance_degradation', severity: 'medium', location: 'AvatarEngine' },
        ],
        critical_count: 1,
        warnings_count: 1,
      });

      const result = await engine.auto_detect(scanResult);

      expect(mockInvoke).toHaveBeenCalledWith('autonomy_detect_anomalies', { scanResult });
      expect(result.anomalies.length).toBeGreaterThan(0);
      expect(result.critical_count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('auto_fix', () => {
    it('should fix detected anomalies', async () => {
      const detectionResult = {
        anomalies: [
          { type: 'memory_leak', severity: 'high', location: 'ChatPanel' },
        ],
        critical_count: 1,
        warnings_count: 0,
      };

      mockInvoke.mockResolvedValueOnce({
        fixed_issues: ['memory_leak in ChatPanel'],
        success_count: 1,
        failed_count: 0,
        fix_duration_ms: 300,
      });

      const result = await engine.auto_fix(detectionResult);

      expect(mockInvoke).toHaveBeenCalledWith('autonomy_fix_issues', { detectionResult });
      expect(result.success_count).toBe(1);
      expect(result.fixed_issues.length).toBeGreaterThan(0);
    });

    it('should report failed fixes', async () => {
      const detectionResult = {
        anomalies: [
          { type: 'critical_error', severity: 'critical', location: 'Core' },
        ],
        critical_count: 1,
        warnings_count: 0,
      };

      mockInvoke.mockResolvedValueOnce({
        fixed_issues: [],
        success_count: 0,
        failed_count: 1,
        fix_duration_ms: 100,
      });

      const result = await engine.auto_fix(detectionResult);

      expect(result.failed_count).toBe(1);
      expect(result.success_count).toBe(0);
    });
  });

  describe('auto_heal', () => {
    it('should heal system state', async () => {
      const detectionResult = {
        anomalies: [],
        critical_count: 0,
        warnings_count: 3,
      };

      mockInvoke.mockResolvedValueOnce({
        healed_components: ['StateManager', 'MemoryCache'],
        health_improvement: 15,
        heal_duration_ms: 250,
      });

      const result = await engine.auto_heal(detectionResult);

      expect(result.healed_components.length).toBeGreaterThan(0);
      expect(result.health_improvement).toBeGreaterThan(0);
    });
  });

  describe('auto_optimize', () => {
    it('should optimize system performance', async () => {
      mockInvoke.mockResolvedValueOnce({
        optimizations: ['Memory compaction', 'Cache cleanup', 'Dead code removal'],
        performance_gain: 20,
        optimization_duration_ms: 400,
      });

      const result = await engine.auto_optimize();

      expect(mockInvoke).toHaveBeenCalledWith('autonomy_optimize_system');
      expect(result.optimizations.length).toBeGreaterThan(0);
      expect(result.performance_gain).toBeGreaterThanOrEqual(0);
    });
  });

  describe('auto_evolve', () => {
    it('should evolve system capabilities', async () => {
      mockInvoke.mockResolvedValueOnce({
        new_capabilities: ['Enhanced memory', 'Better caching'],
        evolution_level: 2,
        evolution_duration_ms: 500,
      });

      const result = await engine.auto_evolve();

      expect(result.new_capabilities.length).toBeGreaterThanOrEqual(0);
      expect(result.evolution_level).toBeGreaterThanOrEqual(0);
    });
  });

  describe('auto_test', () => {
    it('should run automated tests', async () => {
      mockInvoke.mockResolvedValueOnce({
        tests_passed: 45,
        tests_failed: 2,
        coverage: 87,
        test_duration_ms: 3000,
      });

      const result = await engine.auto_test();

      expect(result.tests_passed).toBeGreaterThanOrEqual(0);
      expect(result.coverage).toBeGreaterThanOrEqual(0);
      expect(result.coverage).toBeLessThanOrEqual(100);
    });
  });

  describe('auto_shield', () => {
    it('should activate protective measures', async () => {
      mockInvoke.mockResolvedValueOnce({
        threats_blocked: 3,
        shield_strength: 95,
        shield_duration_ms: 150,
      });

      const result = await engine.auto_shield();

      expect(result.threats_blocked).toBeGreaterThanOrEqual(0);
      expect(result.shield_strength).toBeGreaterThanOrEqual(0);
    });
  });

  describe('auto_analyse', () => {
    it('should analyze detection results', async () => {
      const detectionResult = {
        anomalies: [
          { type: 'memory_leak', severity: 'high', location: 'ChatPanel' },
        ],
        critical_count: 1,
        warnings_count: 0,
      };

      mockInvoke.mockResolvedValueOnce({
        root_causes: ['Uncleared event listeners'],
        recommendations: ['Add cleanup in useEffect'],
        priority: 'high',
        analysis_duration_ms: 200,
      });

      const result = await engine.auto_analyse(detectionResult);

      expect(result.root_causes.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.priority).toBeDefined();
    });
  });

  describe('State Tracking', () => {
    it('should track autonomy state correctly', async () => {
      mockInvoke.mockResolvedValue({
        backend_health: 95,
        frontend_health: 90,
        issues_found: 0,
        scan_duration_ms: 100,
      });

      await engine.auto_scan();

      const state = engine['autonomyState'];
      expect(state.health_score).toBeGreaterThan(0);
      expect(state.stability_index).toBeGreaterThan(0);
    });

    it('should update metrics after operations', async () => {
      mockInvoke.mockResolvedValue({
        optimizations: ['Test optimization'],
        performance_gain: 10,
        optimization_duration_ms: 200,
      });

      const initialOptimizations = engine['autonomyState'].optimizations_applied;
      await engine.auto_optimize();

      expect(engine['autonomyState'].optimizations_applied).toBeGreaterThan(initialOptimizations);
    });
  });

  describe('Integration', () => {
    it('should complete full autonomy cycle', async () => {
      // Mock all backend calls
      mockInvoke
        .mockResolvedValueOnce({ backend_health: 95, frontend_health: 90, issues_found: 1, scan_duration_ms: 100 }) // scan
        .mockResolvedValueOnce({ anomalies: [], critical_count: 0, warnings_count: 0 }) // detect
        .mockResolvedValueOnce({ fixed_issues: [], success_count: 0, failed_count: 0, fix_duration_ms: 0 }) // fix
        .mockResolvedValueOnce({ healed_components: [], health_improvement: 0, heal_duration_ms: 0 }) // heal
        .mockResolvedValueOnce({ optimizations: [], performance_gain: 5, optimization_duration_ms: 50 }) // optimize
        .mockResolvedValueOnce({ new_capabilities: [], evolution_level: 0, evolution_duration_ms: 0 }) // evolve
        .mockResolvedValueOnce({ tests_passed: 10, tests_failed: 0, coverage: 80, test_duration_ms: 500 }) // test
        .mockResolvedValueOnce({ threats_blocked: 0, shield_strength: 100, shield_duration_ms: 50 }) // shield
        .mockResolvedValueOnce({ root_causes: [], recommendations: [], priority: 'low', analysis_duration_ms: 100 }); // analyse

      await engine['autonomousCycle']();

      expect(mockInvoke).toHaveBeenCalledTimes(9); // 8 functions + 1 report
      expect(engine['autonomyState'].cycle_count).toBeGreaterThan(0);
    });
  });
});
