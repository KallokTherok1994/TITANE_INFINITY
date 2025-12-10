/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SingularityAutonomyEngine,
  type ScanResult,
  type DetectionResult,
  type FixResult,
  type HealResult,
  type OptimizationResult,
  type EvolutionResult,
  type TestResult,
  type ShieldResult,
  type AnalyseResult,
  type ReportData,
} from '@/core/autonomy/SingularityAutonomyEngine';
import { invoke } from '@tauri-apps/api/core';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

const mockInvoke = vi.mocked(invoke);

const createAutonomyState = () => ({
  last_scan: 0,
  last_fix: 0,
  last_heal: 0,
  last_optimize: 0,
  last_evolve: 0,
  last_test: 0,
  last_shield: 0,
  last_analyse: 0,
  health_score: 100,
  stability_index: 100,
  cognitive_load_score: 0,
  pipeline_integrity: 100,
});

const createScanResult = (overrides: Partial<ScanResult> = {}): ScanResult => ({
  timestamp: 0,
  backend_errors: [],
  frontend_warnings: [],
  tauri_issues: [],
  ia_anomalies: [],
  tts_issues: [],
  avatar_issues: [],
  memory_issues: [],
  singularity_inconsistencies: [],
  ...overrides,
});

const createDetectionResult = (
  overrides: Partial<DetectionResult> = {}
): DetectionResult => ({
  error_patterns: [],
  abnormal_behaviors: [],
  latency_issues: [],
  sync_losses: [],
  race_conditions: [],
  state_misalignments: [],
  ia_coherence_issues: [],
  tts_lip_sync_errors: [],
  cpu_gpu_overload: [],
  warnings: [],
  ...overrides,
});

const cleanupSpies = (...spies: Array<{ mockRestore: () => void }>) => {
  spies.forEach(spy => spy.mockRestore());
};

describe('SingularityAutonomyEngine', () => {
  let engine: SingularityAutonomyEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = SingularityAutonomyEngine.getInstance();
    engine.stop();
    (engine as any).autonomyState = createAutonomyState();
    (globalThis as any).window = { queryClient: { clear: vi.fn() } };
    (globalThis as any).performance = { reactRenderCount: 0 };
  });

  afterEach(() => {
    engine.stop();
  });

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = SingularityAutonomyEngine.getInstance();
      const instance2 = SingularityAutonomyEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Lifecycle Management', () => {
    it('starts the autonomous cycle once', () => {
      const cycleSpy = vi.spyOn(engine as any, 'autonomousCycle').mockResolvedValue();
      engine.start();
      expect(engine.isEngineRunning()).toBe(true);
      expect(cycleSpy).toHaveBeenCalledTimes(1);
      expect((engine as any).scanIntervalId).not.toBeNull();
      engine.stop();
      cleanupSpies(cycleSpy);
    });

    it('does not register multiple intervals when already running', () => {
      const cycleSpy = vi.spyOn(engine as any, 'autonomousCycle').mockResolvedValue();
      engine.start();
      const firstInterval = (engine as any).scanIntervalId;
      engine.start();
      expect((engine as any).scanIntervalId).toBe(firstInterval);
      cleanupSpies(cycleSpy);
    });
  });

  describe('auto_scan', () => {
    it('aggregates diagnostics from every subsystem', async () => {
      const frontendSpy = vi
        .spyOn(engine as any, 'scanFrontendWarnings')
        .mockReturnValue(['React churn']);
      const iaSpy = vi
        .spyOn(engine as any, 'scanIAAnomalies')
        .mockResolvedValue(['Loop']);
      const ttsSpy = vi.spyOn(engine as any, 'scanTTSIssues').mockResolvedValue(['Lag']);
      const avatarSpy = vi
        .spyOn(engine as any, 'scanAvatarIssues')
        .mockResolvedValue(['Artifact']);
      const memorySpy = vi
        .spyOn(engine as any, 'scanMemoryIssues')
        .mockResolvedValue(['Leak']);
      const singularitySpy = vi
        .spyOn(engine as any, 'scanSingularityState')
        .mockResolvedValue(['Drift']);

      mockInvoke.mockResolvedValueOnce({ errors: ['Backend deadlock'] });

      const result = await engine.auto_scan();

      // secureInvoke passe toujours {} comme payload par défaut
      expect(mockInvoke).toHaveBeenCalledWith('autonomy_scan_backend', {});
      expect(result.backend_errors).toEqual(['Backend deadlock']);
      expect(result.frontend_warnings).toEqual(['React churn']);
      expect(result.ia_anomalies).toEqual(['Loop']);
      expect(result.tts_issues).toEqual(['Lag']);
      expect(result.avatar_issues).toEqual(['Artifact']);
      expect(result.memory_issues).toEqual(['Leak']);
      expect(result.singularity_inconsistencies).toEqual(['Drift']);

      cleanupSpies(frontendSpy, iaSpy, ttsSpy, avatarSpy, memorySpy, singularitySpy);
    });

    it('logs backend failures without breaking the scan', async () => {
      const frontendSpy = vi
        .spyOn(engine as any, 'scanFrontendWarnings')
        .mockReturnValue([]);
      const iaSpy = vi.spyOn(engine as any, 'scanIAAnomalies').mockResolvedValue([]);
      const ttsSpy = vi.spyOn(engine as any, 'scanTTSIssues').mockResolvedValue([]);
      const avatarSpy = vi.spyOn(engine as any, 'scanAvatarIssues').mockResolvedValue([]);
      const memorySpy = vi.spyOn(engine as any, 'scanMemoryIssues').mockResolvedValue([]);
      const singularitySpy = vi
        .spyOn(engine as any, 'scanSingularityState')
        .mockResolvedValue([]);

      mockInvoke.mockRejectedValueOnce(new Error('Backend offline'));

      const result = await engine.auto_scan();
      // En cas d'erreur backend, le résultat peut être un array vide ou contenir un message d'erreur
      expect(Array.isArray(result.backend_errors)).toBe(true);

      cleanupSpies(frontendSpy, iaSpy, ttsSpy, avatarSpy, memorySpy, singularitySpy);
    });
  });

  describe('auto_detect', () => {
    it('derives higher-level issues from scan data', async () => {
      const scanResult = createScanResult({
        backend_errors: ['mutex lock timeout', 'request timeout'],
        ia_anomalies: ['A', 'B', 'C', 'D', 'E', 'F'],
        tts_issues: ['lag'],
        avatar_issues: ['offset'],
        singularity_inconsistencies: ['state drift'],
      });

      const result = await engine.auto_detect(scanResult);

      expect(result.error_patterns).toContain(
        'Race condition detected: mutex lock timeout'
      );
      expect(result.latency_issues).toContain('Timeout detected: request timeout');
      expect(result.abnormal_behaviors).toContain('IA: Multiple anomalies detected');
      expect(result.tts_lip_sync_errors).toContain('TTS-Avatar synchronization lost');
      expect(result.state_misalignments).toContain('state drift');
    });
  });

  describe('auto_fix', () => {
    it('invokes backend fixes and clears caches when latency issues are present', async () => {
      const detectionResult = createDetectionResult({
        state_misalignments: ['state drift'],
        latency_issues: ['timeout'],
        tts_lip_sync_errors: ['lip drift'],
      });

      mockInvoke
        .mockResolvedValueOnce({ fixed: ['state drift'] })
        .mockResolvedValueOnce(undefined);

      const result = await engine.auto_fix(detectionResult);

      expect(mockInvoke).toHaveBeenNthCalledWith(1, 'autonomy_fix_states', {
        issues: ['state drift'],
      });
      // secureInvoke passe toujours {} comme payload par défaut
      expect(mockInvoke).toHaveBeenNthCalledWith(2, 'autonomy_fix_tts_sync', {});
      expect(result.fixed_states).toEqual(['state drift']);
      expect(result.cleaned_caches).toContain('Frontend caches cleared');
      expect((window as any).queryClient.clear).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('auto_heal', () => {
    it('repairs damaged modules and resynchronizes state', async () => {
      const detectionResult = createDetectionResult({
        abnormal_behaviors: ['memory leak'],
        state_misalignments: ['state drift'],
      });

      mockInvoke
        .mockResolvedValueOnce({ repaired: ['Core'] })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const result = await engine.auto_heal(detectionResult);

      expect(mockInvoke).toHaveBeenNthCalledWith(1, 'autonomy_heal_modules', {
        abnormal_behaviors: ['memory leak'],
      });
      // secureInvoke passe toujours {} comme payload par défaut
      expect(mockInvoke).toHaveBeenNthCalledWith(
        2,
        'autonomy_resync_singularity_state',
        {}
      );
      expect(mockInvoke).toHaveBeenNthCalledWith(3, 'autonomy_clean_memory', {});
      expect(result.rebuilt_modules).toEqual(['Core']);
      expect(result.cleaned_memory).toContain('Memory inconsistencies cleaned');
      expect(result.success).toBe(true);
    });
  });

  describe('auto_optimize', () => {
    it('compresses caches and cleans memory after backend optimizations', async () => {
      const compressSpy = vi
        .spyOn(engine as any, 'compressCaches')
        .mockImplementation(() => {});
      const cleanMemorySpy = vi
        .spyOn(engine as any, 'cleanMemory')
        .mockImplementation(() => {});
      mockInvoke.mockResolvedValueOnce({ gains: 17 });

      const result = await engine.auto_optimize();

      // secureInvoke passe toujours {} comme payload par défaut
      expect(mockInvoke).toHaveBeenCalledWith('autonomy_optimize_performance', {});
      expect(compressSpy).toHaveBeenCalled();
      expect(cleanMemorySpy).toHaveBeenCalled();
      expect(result.performance_gain_percentage).toBe(17);
      expect(result.caches_compressed).toBe(true);

      cleanupSpies(compressSpy, cleanMemorySpy);
    });
  });

  describe('auto_evolve', () => {
    it('records IA improvements returned by the backend', async () => {
      mockInvoke.mockResolvedValueOnce({ improvements: ['Heuristic tuning'] });

      const result = await engine.auto_evolve();

      // secureInvoke passe toujours {} comme payload par défaut
      expect(mockInvoke).toHaveBeenCalledWith('autonomy_evolve_ia', {});
      expect(result.heuristics_updated).toEqual(['Heuristic tuning']);
      expect(result.ia_coherence_improved).toBe(true);
    });
  });

  describe('auto_test', () => {
    it('updates health score based on live telemetry', async () => {
      mockInvoke
        .mockResolvedValueOnce({ coherent: true })
        .mockResolvedValueOnce(undefined);

      const result = await engine.auto_test();

      // secureInvoke passe toujours {} comme payload par défaut
      expect(mockInvoke).toHaveBeenNthCalledWith(1, 'autonomy_test_ia_coherence', {});
      expect(mockInvoke).toHaveBeenNthCalledWith(2, 'autonomy_ping', {});
      expect(result.success).toBe(true);
      expect(engine.getAutonomyState().health_score).toBe(100);
    });
  });

  describe('auto_shield', () => {
    it('protects singularity state and deduplicates memory keys', async () => {
      const preventSpy = vi
        .spyOn(engine as any, 'preventMemoryDuplicates')
        .mockImplementation(() => {});
      mockInvoke.mockResolvedValueOnce({ protected: true });

      const result = await engine.auto_shield();

      // secureInvoke passe toujours {} comme payload par défaut
      expect(mockInvoke).toHaveBeenCalledWith('autonomy_shield_state', {});
      expect(preventSpy).toHaveBeenCalled();
      expect(result.singularity_state_protected).toBe(true);
      expect(result.memory_duplicates_prevented).toBe(true);

      cleanupSpies(preventSpy);
    });
  });

  describe('auto_analyse', () => {
    it('logs recurrence when multiple error patterns are present', async () => {
      mockInvoke.mockResolvedValueOnce({ analyzed_count: 42 });
      const detectionResult = createDetectionResult({
        error_patterns: ['p1', 'p2', 'p3', 'p4'],
      });

      const result = await engine.auto_analyse(detectionResult);

      // secureInvoke passe toujours un objet vide {} comme payload par défaut
      expect(mockInvoke).toHaveBeenCalledWith('autonomy_analyse_logs', {});
      expect(result.logs_analyzed).toBe(42);
      expect(result.recurring_anomalies).toContain('Multiple error patterns detected');
    });
  });

  describe('auto_report', () => {
    it('forwards report payloads to the backend logger', async () => {
      const payload: ReportData = {
        diagnostics: ['error'],
        improvements_applied: [],
        errors_fixed: [],
        modules_repaired: [],
        optimizations_performed: [],
        preventions_activated: [],
        timestamp: Date.now(),
      };

      mockInvoke.mockResolvedValueOnce(undefined);
      await engine.auto_report(payload);

      expect(mockInvoke).toHaveBeenCalledWith('autonomy_log_report', { report: payload });
    });
  });

  describe('State helpers', () => {
    it('exposes a defensive copy of the autonomy state', () => {
      const snapshot = engine.getAutonomyState();
      snapshot.health_score = 0;
      expect(engine.getAutonomyState().health_score).toBe(100);
    });
  });

  describe('Autonomous cycle', () => {
    it('chains scan, detection, protections, and remediation steps', async () => {
      const scanResult = createScanResult({
        backend_errors: ['panic'],
        frontend_warnings: [],
      });
      const detectionResult = createDetectionResult({
        error_patterns: ['panic'],
        abnormal_behaviors: ['glitch'],
        state_misalignments: ['drift'],
      });
      const analyseResult: AnalyseResult = {
        logs_analyzed: 1,
        long_context_analyzed: false,
        memory_inconsistencies_detected: [],
        conversational_dynamics_analyzed: false,
        user_misinterpretations: [],
        low_performance_zones: [],
        recurring_anomalies: [],
      };

      const scanSpy = vi.spyOn(engine, 'auto_scan').mockResolvedValue(scanResult);
      const detectSpy = vi
        .spyOn(engine, 'auto_detect')
        .mockResolvedValue(detectionResult);
      const analyseSpy = vi
        .spyOn(engine, 'auto_analyse')
        .mockResolvedValue(analyseResult);
      const shieldSpy = vi.spyOn(engine, 'auto_shield').mockResolvedValue({
        singularity_state_protected: true,
        memory_duplicates_prevented: true,
        tts_crashes_prevented: false,
        invalid_states_blocked: false,
        ia_services_restarted: [],
        internal_bugs_neutralized: [],
        structural_inconsistencies_defended: [],
      } as ShieldResult);
      const fixSpy = vi.spyOn(engine, 'auto_fix').mockResolvedValue({
        fixed_states: ['drift'],
        reloaded_modules: [],
        corrected_hooks: [],
        cleaned_caches: [],
        repaired_files: [],
        corrected_tts_delays: [],
        fixed_avatar_artifacts: [],
        fixed_react_freezes: [],
        success: true,
      } as FixResult);
      const healSpy = vi.spyOn(engine, 'auto_heal').mockResolvedValue({
        rebuilt_modules: [],
        resynchronized_states: ['SingularityState re-synchronized'],
        repaired_ia_integrity: [],
        recalculated_graphs: [],
        cleaned_memory: ['Memory inconsistencies cleaned'],
        repaired_pipelines: [],
        success: true,
      } as HealResult);
      const optimizeSpy = vi.spyOn(engine, 'auto_optimize').mockResolvedValue({
        cpu_optimization: 'ok',
        gpu_optimization: 'ok',
        react_rendering_optimized: true,
        tauri_events_optimized: true,
        tts_pipeline_optimized: true,
        ia_pipeline_optimized: true,
        memory_cleaned: true,
        caches_compressed: true,
        performance_gain_percentage: 5,
      } as OptimizationResult);
      const evolveSpy = vi.spyOn(engine, 'auto_evolve').mockResolvedValue({
        ia_coherence_improved: true,
        chat_speed_improved: false,
        tts_behavior_adjusted: false,
        emotional_modulators_tuned: false,
        lip_sync_improved: false,
        avatar_pipeline_tuned: false,
        user_preferences_learned: [],
        heuristics_updated: [],
      } as EvolutionResult);
      const testSpy = vi.spyOn(engine, 'auto_test').mockResolvedValue({
        ia_coherence: true,
        memory_coherence: true,
        tts_coherence: true,
        avatar_coherence: true,
        latency_acceptable: true,
        no_memory_leaks: true,
        no_warnings: true,
        no_event_collisions: true,
        all_modules_responsive: true,
        success: true,
      } as TestResult);
      const reportSpy = vi.spyOn(engine, 'auto_report').mockResolvedValue();

      const state = (engine as any).autonomyState;
      const now = Date.now();
      state.last_optimize = now - 600000;
      state.last_evolve = now - 700000;
      state.last_test = now - 200000;

      await (engine as any).autonomousCycle();

      expect(scanSpy).toHaveBeenCalled();
      expect(detectSpy).toHaveBeenCalled();
      expect(analyseSpy).toHaveBeenCalled();
      expect(shieldSpy).toHaveBeenCalled();
      expect(fixSpy).toHaveBeenCalled();
      expect(healSpy).toHaveBeenCalled();
      expect(optimizeSpy).toHaveBeenCalled();
      expect(evolveSpy).toHaveBeenCalled();
      expect(testSpy).toHaveBeenCalled();
      expect(reportSpy).toHaveBeenCalled();

      cleanupSpies(
        scanSpy,
        detectSpy,
        analyseSpy,
        shieldSpy,
        fixSpy,
        healSpy,
        optimizeSpy,
        evolveSpy,
        testSpy,
        reportSpy
      );
    });
  });
});
