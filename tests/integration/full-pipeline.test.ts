/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * FULL PIPELINE INTEGRATION TESTS
 * Tests complete autonomous system integration
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { SingularityAutonomyEngine } from '../../../src/core/autonomy/SingularityAutonomyEngine';
import { CognitiveOptimizationEngine } from '../../../src/core/cognitive/CognitiveOptimizationEngine';
import { SingularityFusionEngine } from '../../../src/core/singularity/SingularityFusionEngine';
import { RealTimeExecutionEngine } from '../../../src/core/realtime/RealTimeExecutionEngine';
import { LongContextOptimizer } from '../../../src/core/context/LongContextOptimizer';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

describe('Full Pipeline Integration Tests', () => {
  let autonomyEngine: SingularityAutonomyEngine;
  let cognitiveEngine: CognitiveOptimizationEngine;
  let fusionEngine: SingularityFusionEngine;
  let realtimeEngine: RealTimeExecutionEngine;
  let contextOptimizer: LongContextOptimizer;

  beforeAll(async () => {
    autonomyEngine = SingularityAutonomyEngine.getInstance();
    cognitiveEngine = CognitiveOptimizationEngine.getInstance();
    fusionEngine = SingularityFusionEngine.getInstance();
    realtimeEngine = RealTimeExecutionEngine.getInstance();
    contextOptimizer = LongContextOptimizer.getInstance();

    // Initialize fusion engine
    await fusionEngine.initialize({
      physical: {} as any,
      cognitive: {} as any,
      symbolic: {} as any,
      adaptive: {} as any,
      meta: {} as any,
      timestamp: Date.now(),
      signature: 'test_integration',
    });

    // Start realtime engine
    realtimeEngine.start(60);
  });

  afterAll(() => {
    autonomyEngine.stop();
    realtimeEngine.stop();
  });

  describe('Complete Message Processing Pipeline', () => {
    it('should process message through all engines', async () => {
      // Setup: Mock all backend calls
      mockInvoke
        .mockResolvedValueOnce({ intention: 'greeting', confidence: 0.9, entities: [], sentiment: 'positive' }) // cognitive: intention
        .mockResolvedValueOnce({ relevant_memories: [], threshold: 0.7, retrieved_count: 0 }) // cognitive: memory
        .mockResolvedValueOnce({ compressed_messages: [], compression_ratio: 1.0, tokens_saved: 0, semantic_preservation: 1.0 }) // context: compress
        .mockResolvedValueOnce({ active_modules: ['Chat'], priorities: {} }) // fusion: modules
        .mockResolvedValueOnce({ theme: 'metal', intensity: 0.8, motion: true }) // fusion: styles
        .mockResolvedValueOnce({ text: 'Hello! How can I help?', tokens: 10 }) // fusion: generation
        .mockResolvedValueOnce(new ArrayBuffer(1024)) // fusion: TTS
        .mockResolvedValueOnce({ phonemes: [], timestamps: [] }) // fusion: lipsync
        .mockResolvedValueOnce({ animation_data: [] }) // fusion: avatar
        .mockResolvedValueOnce({ /* updated state */ }) // fusion: state
        .mockResolvedValueOnce(undefined); // fusion: optimize

      // 1. Cognitive optimization
      const cognitiveResult = await cognitiveEngine.optimizeFullPipeline('Hello', []);
      expect(cognitiveResult.intention).toBeDefined();

      // 2. Context optimization
      const contextResult = await contextOptimizer.optimizeFullContext(
        cognitiveResult.optimized_context.messages
      );
      expect(contextResult.compressed_messages).toBeDefined();

      // 3. Fusion cycle
      const fusionResult = await fusionEngine.executeSingularityCycle({
        userMessage: 'Hello',
        conversationHistory: contextResult.compressed_messages,
        userPreferences: {},
      });
      expect(fusionResult.success).toBe(true);

      // 4. Real-time audio scheduling
      realtimeEngine.enqueueAudio(fusionResult.audio_buffer, {});
      realtimeEngine.enqueueAvatar(fusionResult.animation_data, {});

      expect(realtimeEngine['taskQueue'].size()).toBeGreaterThan(0);
    });

    it('should handle long context with compression', async () => {
      const longHistory = Array.from({ length: 200 }, (_, i) => ({
        id: `msg_${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        tokens: 250,
        timestamp: Date.now(),
        importance: 0.5,
      }));

      mockInvoke
        .mockResolvedValueOnce({ intention: 'request', confidence: 0.8, entities: [], sentiment: 'neutral' })
        .mockResolvedValueOnce({ relevant_memories: [], threshold: 0.7, retrieved_count: 0 })
        .mockResolvedValueOnce({
          compressed_messages: longHistory.slice(0, 30),
          original_tokens: 50000,
          compressed_tokens: 7500,
          compression_ratio: 0.15,
          semantic_preservation: 0.93,
          removed_noise: [],
          prioritized_segments: [],
          execution_time_ms: 300,
        });

      const result = await cognitiveEngine.optimizeFullPipeline('Continue', longHistory);

      expect(result.optimized_context.total_tokens).toBeLessThan(10000);
      expect(result.optimized_context.compression_ratio).toBeLessThan(0.2);
    });
  });

  describe('Autonomous System Operations', () => {
    it('should run autonomous cycle without blocking UI', async () => {
      mockInvoke
        .mockResolvedValue({ backend_health: 95, frontend_health: 90, issues_found: 0, scan_duration_ms: 50 })
        .mockResolvedValue({ anomalies: [], critical_count: 0, warnings_count: 0 })
        .mockResolvedValue({ fixed_issues: [], success_count: 0, failed_count: 0, fix_duration_ms: 0 })
        .mockResolvedValue({ healed_components: [], health_improvement: 0, heal_duration_ms: 0 })
        .mockResolvedValue({ optimizations: [], performance_gain: 0, optimization_duration_ms: 0 })
        .mockResolvedValue({ new_capabilities: [], evolution_level: 0, evolution_duration_ms: 0 })
        .mockResolvedValue({ tests_passed: 10, tests_failed: 0, coverage: 90, test_duration_ms: 100 })
        .mockResolvedValue({ threats_blocked: 0, shield_strength: 100, shield_duration_ms: 20 })
        .mockResolvedValue({ root_causes: [], recommendations: [], priority: 'low', analysis_duration_ms: 50 });

      const startTime = performance.now();

      // Run autonomy cycle
      await autonomyEngine['autonomousCycle']();

      const duration = performance.now() - startTime;

      // Should complete quickly (non-blocking)
      expect(duration).toBeLessThan(500);
      expect(autonomyEngine['autonomyState'].cycle_count).toBeGreaterThan(0);
    });

    it('should auto-fix detected issues', async () => {
      mockInvoke
        .mockResolvedValueOnce({ backend_health: 70, frontend_health: 80, issues_found: 3, scan_duration_ms: 100 })
        .mockResolvedValueOnce({
          anomalies: [
            { type: 'memory_leak', severity: 'medium', location: 'ChatPanel' },
          ],
          critical_count: 0,
          warnings_count: 1,
        })
        .mockResolvedValueOnce({
          fixed_issues: ['memory_leak in ChatPanel'],
          success_count: 1,
          failed_count: 0,
          fix_duration_ms: 150,
        });

      const scanResult = await autonomyEngine.auto_scan();
      const detectionResult = await autonomyEngine.auto_detect(scanResult);
      const fixResult = await autonomyEngine.auto_fix(detectionResult);

      expect(fixResult.success_count).toBe(1);
      expect(fixResult.fixed_issues.length).toBeGreaterThan(0);
    });
  });

  describe('Real-Time Performance', () => {
    it('should maintain 60 FPS during concurrent operations', async () => {
      vi.useFakeTimers();
      mockInvoke.mockResolvedValue(undefined);

      // Simulate concurrent operations
      for (let i = 0; i < 10; i++) {
        realtimeEngine.enqueueAudio(new ArrayBuffer(512), {});
        realtimeEngine.enqueueAvatar({ joint: 'jaw', rotation: 0.1 * i }, {});
        realtimeEngine.enqueueUIEvent({ type: 'click', id: i }, {});

        vi.advanceTimersByTime(16.67); // 60 FPS
        await vi.runOnlyPendingTimersAsync();
      }

      const fps = realtimeEngine['metrics'].fps;
      expect(fps).toBeGreaterThan(50); // Allow 10 FPS variance

      vi.useRealTimers();
    });

    it('should prioritize critical audio tasks', async () => {
      mockInvoke.mockResolvedValue(undefined);

      const executionOrder: string[] = [];

      // Enqueue mixed priority tasks
      realtimeEngine.enqueueNetwork({ url: 'test' }, {});
      realtimeEngine.enqueueUIEvent({ type: 'click' }, {});
      realtimeEngine.enqueueAudio(new ArrayBuffer(256), {});
      realtimeEngine.enqueueAvatar({ joint: 'jaw' }, {});

      // Process all
      while (!realtimeEngine['taskQueue'].isEmpty()) {
        const task = realtimeEngine['taskQueue'].dequeue();
        if (task) {
          executionOrder.push(task.type);
        }
      }

      // Audio should execute first (critical priority)
      expect(executionOrder[0]).toBe('audio');
    });
  });

  describe('Cognitive Optimization', () => {
    it('should optimize context before fusion', async () => {
      const messages = Array.from({ length: 50 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        tokens: 30,
        importance: Math.random(),
      }));

      mockInvoke
        .mockResolvedValueOnce({ intention: 'conversation', confidence: 0.85, entities: [], sentiment: 'neutral' })
        .mockResolvedValueOnce({ relevant_memories: [], threshold: 0.7, retrieved_count: 0 })
        .mockResolvedValueOnce({
          compressed_messages: messages.slice(0, 20),
          compression_ratio: 0.4,
          tokens_saved: 900,
          semantic_preservation: 0.94,
        })
        .mockResolvedValueOnce({ clusters: [] })
        .mockResolvedValueOnce({ cleaned_messages: messages.slice(0, 20), removed_count: 0, removal_reasons: [] });

      const result = await cognitiveEngine.optimizeFullPipeline('Continue conversation', messages);

      expect(result.optimized_context.messages.length).toBeLessThan(messages.length);
      expect(result.optimized_context.compression_ratio).toBeLessThan(1.0);
    });

    it('should check coherence of responses', async () => {
      mockInvoke.mockResolvedValueOnce({
        is_coherent: true,
        coherence_score: 0.92,
        inconsistencies: [],
        corrected_response: null,
      });

      const result = await cognitiveEngine.checkCoherence(
        'This is a coherent response',
        { messages: [], total_tokens: 20, compression_ratio: 1.0 }
      );

      expect(result.is_coherent).toBe(true);
      expect(result.coherence_score).toBeGreaterThan(0.85);
    });
  });

  describe('Context Management', () => {
    it('should compress large contexts efficiently', async () => {
      const largeContext = Array.from({ length: 150 }, (_, i) => ({
        id: `msg_${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i} with substantial content here`,
        tokens: 60,
        timestamp: Date.now() - (150 - i) * 1000,
        importance: Math.random(),
      }));

      mockInvoke.mockResolvedValueOnce({
        original_messages: largeContext,
        compressed_messages: largeContext.slice(0, 30),
        original_tokens: 9000,
        compressed_tokens: 1800,
        compression_ratio: 0.2,
        semantic_preservation: 0.95,
        removed_noise: [],
        prioritized_segments: [],
        execution_time_ms: 200,
      });

      const result = await contextOptimizer.compressContext(largeContext, {
        maxTokens: 2000,
        targetRatio: 0.2,
      });

      expect(result.compressed_messages.length).toBeLessThan(largeContext.length);
      expect(result.compression_ratio).toBeCloseTo(0.2, 1);
      expect(result.semantic_preservation).toBeGreaterThan(0.9);
    });

    it('should remove noise from conversations', async () => {
      const noisyMessages = [
        { id: '1', role: 'user', content: 'Hello', tokens: 5, timestamp: Date.now(), importance: 0.8 },
        { id: '2', role: 'user', content: 'Hello', tokens: 5, timestamp: Date.now(), importance: 0.8 }, // duplicate
        { id: '3', role: 'user', content: 'Test', tokens: 3, timestamp: Date.now(), importance: 0.1 }, // low importance
        { id: '4', role: 'assistant', content: 'Hi!', tokens: 5, timestamp: Date.now(), importance: 0.9 },
      ];

      mockInvoke.mockResolvedValueOnce({
        original_messages: noisyMessages,
        cleaned_messages: [noisyMessages[0], noisyMessages[3]],
        removed_duplicates: 1,
        removed_low_relevance: 1,
        removed_contradictions: 0,
        removed_circular: 0,
      });

      const result = await contextOptimizer.removeNoise(noisyMessages);

      expect(result.cleaned_messages.length).toBe(2);
      expect(result.removed_duplicates + result.removed_low_relevance).toBe(2);
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should gracefully handle backend failures', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Backend unavailable'));

      const result = await autonomyEngine.auto_scan();

      // Should return fallback result
      expect(result.backend_health).toBeDefined();
      expect(result.issues_found).toBeGreaterThan(0);
    });

    it('should continue operation after partial failures', async () => {
      mockInvoke
        .mockResolvedValueOnce({ backend_health: 90, frontend_health: 85, issues_found: 1, scan_duration_ms: 100 })
        .mockRejectedValueOnce(new Error('Detection failed')) // detection fails
        .mockResolvedValueOnce({ fixed_issues: [], success_count: 0, failed_count: 0, fix_duration_ms: 0 }); // fix continues

      const scanResult = await autonomyEngine.auto_scan();
      expect(scanResult.backend_health).toBe(90);

      const detectionResult = await autonomyEngine.auto_detect(scanResult);
      expect(detectionResult).toBeDefined(); // Fallback result

      const fixResult = await autonomyEngine.auto_fix(detectionResult);
      expect(fixResult).toBeDefined();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete full pipeline under 2 seconds', async () => {
      mockInvoke.mockResolvedValue({});

      const start = performance.now();

      // Complete pipeline
      await cognitiveEngine.analyzeIntention('Test message');
      await contextOptimizer.compressContext([]);
      await fusionEngine.executeSingularityCycle({
        userMessage: 'Test',
        conversationHistory: [],
        userPreferences: {},
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(2000);
    });

    it('should handle 100 messages without performance degradation', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg_${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        tokens: 20,
        timestamp: Date.now(),
        importance: 0.5,
      }));

      mockInvoke.mockResolvedValue({
        compressed_messages: messages.slice(0, 20),
        compression_ratio: 0.2,
        semantic_preservation: 0.92,
      });

      const start = performance.now();
      await contextOptimizer.compressContext(messages);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
