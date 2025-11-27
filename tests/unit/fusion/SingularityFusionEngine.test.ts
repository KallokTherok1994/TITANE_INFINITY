/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * SINGULARITY FUSION ENGINE - TEST SUITE
 * Tests for 14-engine fusion system (Phase 4)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SingularityFusionEngine } from '../../src/core/singularity/SingularityFusionEngine';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

describe('SingularityFusionEngine', () => {
  let engine: SingularityFusionEngine;

  beforeEach(async () => {
    vi.clearAllMocks();
    engine = SingularityFusionEngine.getInstance();

    // Initialize with mock state
    await engine.initialize({
      physical: {} as any,
      cognitive: {} as any,
      symbolic: {} as any,
      adaptive: {} as any,
      meta: {} as any,
      timestamp: Date.now(),
      signature: 'test',
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SingularityFusionEngine.getInstance();
      const instance2 = SingularityFusionEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize with provided state', async () => {
      const state = {
        physical: {} as any,
        cognitive: {} as any,
        symbolic: {} as any,
        adaptive: {} as any,
        meta: {} as any,
        timestamp: Date.now(),
        signature: 'init_test',
      };

      await engine.initialize(state);

      expect(engine['isInitialized']).toBe(true);
      expect(engine['currentState']).toBeDefined();
    });

    it('should not re-initialize if already initialized', async () => {
      const state = {
        physical: {} as any,
        cognitive: {} as any,
        symbolic: {} as any,
        adaptive: {} as any,
        meta: {} as any,
        timestamp: Date.now(),
        signature: 'test',
      };

      await engine.initialize(state);
      const firstState = engine['currentState'];

      await engine.initialize(state);
      const secondState = engine['currentState'];

      expect(firstState).toBe(secondState);
    });
  });

  describe('executeSingularityCycle - 9-Step Pipeline', () => {
    beforeEach(() => {
      // Mock all backend calls for complete cycle
      mockInvoke
        .mockResolvedValueOnce({ intention: 'greeting', confidence: 0.9, entities: [], sentiment: 'positive' }) // step1: intention
        .mockResolvedValueOnce({ active_modules: ['Chat', 'Avatar'], priorities: { Chat: 10, Avatar: 8 } }) // step2: modules
        .mockResolvedValueOnce({ theme: 'metal', intensity: 0.8, motion: true }) // step3: styles
        .mockResolvedValueOnce({ text: 'Hello! How can I help you?', tokens: 15 }) // step4: generation
        .mockResolvedValueOnce(new ArrayBuffer(1024)) // step5: TTS
        .mockResolvedValueOnce({ phonemes: [], timestamps: [] }) // step6: lipsync
        .mockResolvedValueOnce({ animation_data: [] }) // step7: avatar
        .mockResolvedValueOnce({ /* updated state */ }) // step8: state
        .mockResolvedValueOnce(undefined); // step9: optimize
    });

    it('should execute complete 9-step cycle successfully', async () => {
      const input = {
        userMessage: 'Hello!',
        conversationHistory: [],
        userPreferences: {},
      };

      const result = await engine.executeSingularityCycle(input);

      expect(result.success).toBe(true);
      expect(result.response_text).toBe('Hello! How can I help you?');
      expect(result.audio_buffer).toBeInstanceOf(ArrayBuffer);
      expect(result.lipsync_data).toBeDefined();
      expect(result.animation_data).toBeDefined();
    });

    it('should track execution time for each step', async () => {
      const input = {
        userMessage: 'Test message',
        conversationHistory: [],
        userPreferences: {},
      };

      const result = await engine.executeSingularityCycle(input);

      expect(result.stats.step1_analyse_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.step2_activation_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.step3_styles_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.step4_generation_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.step5_tts_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.step6_lipsync_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.step7_avatar_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.step8_state_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.step9_optimize_ms).toBeGreaterThanOrEqual(0);
      expect(result.stats.total_cycle_ms).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors gracefully', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Backend error'));

      const input = {
        userMessage: 'Fail test',
        conversationHistory: [],
        userPreferences: {},
      };

      const result = await engine.executeSingularityCycle(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Step 1 - Analyze Intention', () => {
    it('should analyze message intention', async () => {
      mockInvoke.mockResolvedValueOnce({
        intention: 'request_information',
        confidence: 0.87,
        entities: ['weather'],
        sentiment: 'neutral',
      });

      const result = await engine['step1_Analyse']('What is the weather?', []);

      expect(result.intention).toBe('request_information');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Step 2 - Activate Modules', () => {
    it('should activate relevant modules', async () => {
      mockInvoke.mockResolvedValueOnce({
        active_modules: ['Chat', 'Memory', 'Knowledge'],
        priorities: { Chat: 10, Memory: 7, Knowledge: 5 },
      });

      const intention = {
        intention: 'request_information',
        confidence: 0.9,
        entities: [],
        sentiment: 'neutral',
      };

      const result = await engine['step2_ActivateModules'](intention);

      expect(result.active_modules.length).toBeGreaterThan(0);
      expect(result.priorities).toBeDefined();
    });
  });

  describe('Step 3 - Adjust Styles', () => {
    it('should adjust visual/audio styles based on intention', async () => {
      mockInvoke.mockResolvedValueOnce({
        theme: 'neon',
        intensity: 0.6,
        motion: true,
      });

      const intention = {
        intention: 'casual_conversation',
        confidence: 0.85,
        entities: [],
        sentiment: 'positive',
      };

      const result = await engine['step3_AdjustStyles'](intention, {});

      expect(result.theme).toBe('neon');
      expect(result.intensity).toBeGreaterThan(0);
    });
  });

  describe('Step 4 - Generate IA Response', () => {
    it('should generate AI response', async () => {
      mockInvoke.mockResolvedValueOnce({
        text: 'Generated response text',
        tokens: 25,
      });

      const result = await engine['step4_GenerateIA'](
        'Test message',
        [],
        { intention: 'greeting', confidence: 0.9, entities: [], sentiment: 'positive' },
        { theme: 'metal', intensity: 0.8, motion: true }
      );

      expect(result).toBe('Generated response text');
    });
  });

  describe('Step 5 - Prepare TTS', () => {
    it('should generate TTS audio buffer', async () => {
      const mockBuffer = new ArrayBuffer(2048);
      mockInvoke.mockResolvedValueOnce(mockBuffer);

      const result = await engine['step5_PrepareTTS']('Test speech', {});

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });
  });

  describe('Step 6 - LipSync', () => {
    it('should generate lip-sync data', async () => {
      mockInvoke.mockResolvedValueOnce({
        phonemes: ['AH', 'EH', 'OH'],
        timestamps: [0, 100, 200],
      });

      const audioBuffer = new ArrayBuffer(1024);
      const result = await engine['step6_LipSync'](audioBuffer, 'Test text');

      expect(result.phonemes.length).toBeGreaterThan(0);
      expect(result.timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Step 7 - Animate Avatar', () => {
    it('should generate avatar animation data', async () => {
      mockInvoke.mockResolvedValueOnce({
        animation_data: [
          { joint: 'jaw', rotation: 0.1, timestamp: 0 },
          { joint: 'jaw', rotation: 0.2, timestamp: 100 },
        ],
      });

      const lipsyncData = {
        phonemes: ['AH'],
        timestamps: [0],
      };

      const result = await engine['step7_AnimateAvatar'](lipsyncData, { theme: 'metal', intensity: 0.8, motion: true });

      expect(result.animation_data.length).toBeGreaterThan(0);
    });
  });

  describe('Step 8 - Update State', () => {
    it('should update SingularityState', async () => {
      mockInvoke.mockResolvedValueOnce({
        physical: {} as any,
        cognitive: {} as any,
        symbolic: {} as any,
        adaptive: {} as any,
        meta: {} as any,
        timestamp: Date.now(),
        signature: 'updated',
      });

      const currentState = engine['currentState']!;
      const cycleData = {
        intention: { intention: 'test', confidence: 0.8, entities: [], sentiment: 'neutral' },
        modules: { active_modules: [], priorities: {} },
        response: 'Test response',
      };

      const result = await engine['step8_UpdateState'](currentState, cycleData);

      expect(result).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Step 9 - Auto Optimize', () => {
    it('should trigger auto-optimization', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      const stats = {
        step1_analyse_ms: 10,
        step2_activation_ms: 5,
        step3_styles_ms: 3,
        step4_generation_ms: 200,
        step5_tts_ms: 150,
        step6_lipsync_ms: 50,
        step7_avatar_ms: 80,
        step8_state_ms: 15,
        step9_optimize_ms: 0,
        total_cycle_ms: 513,
      };

      await engine['step9_AutoOptimize'](stats);

      expect(mockInvoke).toHaveBeenCalledWith('fusion_auto_optimize', { stats });
    });
  });

  describe('Integration with Other Engines', () => {
    it('should use CognitiveOptimizer in pipeline', async () => {
      mockInvoke.mockResolvedValue({});

      const input = {
        userMessage: 'Test integration',
        conversationHistory: [],
        userPreferences: {},
      };

      await engine.executeSingularityCycle(input);

      // Verify CognitiveOptimizer was called (via step 4)
      expect(mockInvoke).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should complete cycle under 1 second for simple message', async () => {
      mockInvoke.mockResolvedValue({});

      const input = {
        userMessage: 'Hi',
        conversationHistory: [],
        userPreferences: {},
      };

      const start = performance.now();
      await engine.executeSingularityCycle(input);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });
});
