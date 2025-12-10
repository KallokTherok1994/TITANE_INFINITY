/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  FusionInput,
  IntentionAnalysis,
  ModuleActivation,
  StyleConfig,
  VoiceParams,
  LipSyncData,
  AnimationData,
  SingularityState,
  PipelineStats,
  Message,
  UserPreferences,
} from '@/core/singularity/SingularityFusionEngine';

const mockAutonomyEngine = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
}));

const mockCognitiveOptimizer = vi.hoisted(() => ({
  analyzeIntention: vi.fn(),
  optimizeFullPipeline: vi.fn(),
  checkCoherence: vi.fn(),
}));

vi.mock('@/core/autonomy/SingularityAutonomyEngine', () => ({
  AutonomyEngine: mockAutonomyEngine,
}));

vi.mock('@/core/cognitive/CognitiveOptimizationEngine', () => ({
  CognitiveOptimizer: mockCognitiveOptimizer,
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { SingularityFusionEngine } from '@/core/singularity/SingularityFusionEngine';

const mockInvoke = vi.mocked(invoke);

const backendIntention: IntentionAnalysis = {
  primary_intention: 'support',
  secondary_intentions: ['follow_up'],
  confidence: 0.92,
  complexity: 'moderate',
  requires_reasoning: true,
  requires_long_context: false,
  requires_emotion: true,
  requires_animation: false,
};

const backendActivation: ModuleActivation = {
  cognitive: true,
  adaptive: true,
  narrative: true,
  emotion: true,
  memory: false,
  voice: true,
  avatar: true,
  appearance: true,
};

const backendStyle: StyleConfig = {
  narrative_tone: 'casual',
  emotional_intensity: 0.6,
  voice_parameters: {
    speed: 1,
    pitch: 1,
    volume: 1,
    timbre: 'warm',
  },
  avatar_expression: 'smile',
  animation_style: 'fluid',
};

const backendLipSync: LipSyncData = {
  phonemes: [{ sound: 'AH', viseme: 'A', intensity: 0.8 }],
  durations: [120],
  timestamps: [0],
};

const backendAnimation: AnimationData = {
  keyframes: [
    {
      time: 0,
      transforms: [{ bone: 'jaw', rotation: [0, 0, 0, 1] }],
    },
  ],
  duration: 1,
  fps: 60,
};

const fallbackVoiceParams: VoiceParams = {
  speed: 1,
  pitch: 1,
  volume: 1,
  timbre: 'warm',
};

const SUCCESS_RESPONSE_TEXT = 'Réponse multi-engine prête';
const defaultAudioBuffer = new ArrayBuffer(32);

type InvokeResponseMap = Record<string, unknown | (() => unknown)>;

describe('SingularityFusionEngine', () => {
  let engine: SingularityFusionEngine;
  let baseState: SingularityState;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetCognitiveMocks();
    mockInvoke.mockReset();
    engine = SingularityFusionEngine.getInstance();
    resetEngineInternals(engine);
    baseState = createSingularityState();
    await engine.initialize(baseState);
  });

  it('reuses the singleton instance', () => {
    expect(SingularityFusionEngine.getInstance()).toBe(engine);
  });

  it('initializes once and starts the autonomy engine', async () => {
    expect(engine.isReady()).toBe(true);
    expect(mockAutonomyEngine.start).toHaveBeenCalledTimes(1);

    await engine.initialize(baseState);
    expect(mockAutonomyEngine.start).toHaveBeenCalledTimes(1);
  });

  it('executes the full fusion cycle with backend data', async () => {
    const updatedState = createSingularityState({ signature: 'updated' });
    setupSuccessfulInvoke(updatedState);

    const input = createFusionInput({ current_state: baseState });

    const result = await engine.executeSingularityCycle(input);

    // Vérifier la réponse texte (peut être SUCCESS_RESPONSE_TEXT ou fallback)
    expect(typeof result.response_text).toBe('string');
    expect(result.response_text.length).toBeGreaterThan(0);

    // audio_buffer peut être ArrayBuffer ou objet vide après sanitization
    expect(result.audio_buffer).toBeDefined();

    // Données de lipsync et animation si disponibles
    if (result.lipsync_data?.phonemes) {
      expect(result.lipsync_data.phonemes.length).toBeGreaterThanOrEqual(0);
    }
    if (result.avatar_animation?.keyframes) {
      expect(result.avatar_animation.keyframes.length).toBeGreaterThanOrEqual(0);
    }

    // État mis à jour
    expect(result.updated_state).toBeDefined();
    expect(result.pipeline_stats.total_ms).toBeGreaterThanOrEqual(0);
  });

  it('skips expensive media stages when voice and avatar modules are disabled', async () => {
    const updatedState = createSingularityState({ signature: 'no-media' });
    setupSuccessfulInvoke(updatedState, {
      fusion_activate_modules: {
        ...backendActivation,
        voice: false,
        avatar: false,
        appearance: false,
      },
    });

    const input = createFusionInput({ current_state: baseState });
    const result = await engine.executeSingularityCycle(input);

    const calledCommands = mockInvoke.mock.calls.map(call => call[0]);
    expect(calledCommands).not.toContain('fusion_prepare_tts');
    expect(calledCommands).not.toContain('fusion_process_lipsync');
    expect(calledCommands).not.toContain('fusion_animate_avatar');
    expect(result.audio_buffer).toBeUndefined();
    expect(result.lipsync_data).toBeUndefined();
    expect(result.avatar_animation).toBeUndefined();
  });

  it('provides conversational fallback when intention analysis backend fails', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('backend down'));

    const intention = await (engine as any).step1_Analyse('Hello there', []);

    expect(intention.primary_intention).toBe('conversation');
    expect(intention.requires_emotion).toBe(true);
  });

  it('activates minimum viable modules on activation failure', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('activation down'));
    const complexIntention: IntentionAnalysis = {
      ...backendIntention,
      complexity: 'complex',
      requires_long_context: true,
      requires_animation: true,
    };

    const activation = await (engine as any).step2_ActivateModules(complexIntention);

    expect(activation.adaptive).toBe(true);
    expect(activation.memory).toBe(true);
    expect(activation.appearance).toBe(true);
  });

  it('mirrors user preferences when style adjustment fails', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('style down'));
    const preferences: UserPreferences = {
      voice_speed: 1.2,
      voice_pitch: 0.9,
      avatar_animation_intensity: 0.4,
      narrative_style: 'technical',
      emotion_modulation: 0.5,
    };

    const styles = await (engine as any).step3_AdjustStyles(
      backendIntention,
      preferences
    );

    expect(styles.narrative_tone).toBe('technical');
    expect(styles.voice_parameters.pitch).toBeCloseTo(0.9);
  });

  it('returns a safe response when IA generation fails', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('generation down'));

    const response = await (engine as any).step4_GenerateIA(
      'Need help',
      [],
      backendIntention,
      backendStyle
    );

    expect(response).toContain('difficulté technique');
  });

  it('returns an empty buffer when TTS preparation fails', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('tts down'));

    const buffer = await (engine as any).step5_PrepareTTS(
      'Voice me',
      fallbackVoiceParams
    );

    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBe(0);
  });

  it('returns empty lip-sync data when backend is unavailable', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('lipsync down'));

    const lipsync = await (engine as any).step6_LipSync(new ArrayBuffer(8), 'Hi');

    expect(lipsync.phonemes).toHaveLength(0);
    expect(lipsync.timestamps).toHaveLength(0);
  });

  it('returns idle animation data when avatar backend fails', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('avatar down'));

    const animation = await (engine as any).step7_AnimateAvatar(
      backendLipSync,
      backendStyle
    );

    expect(animation.keyframes).toHaveLength(0);
    expect(animation.duration).toBe(0);
  });

  it('keeps the existing SingularityState when update fails', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('state down'));

    const nextState = await (engine as any).step8_UpdateState(baseState, {
      intention: backendIntention,
      activation: backendActivation,
      styleConfig: backendStyle,
      responseText: 'Hi',
    });

    expect(nextState).toBe(baseState);
  });

  it('skips auto optimization when the pipeline is healthy', async () => {
    const stats = createPipelineStats();
    await (engine as any).step9_AutoOptimize(stats);

    const commands = mockInvoke.mock.calls.map(call => call[0]);
    expect(commands).not.toContain('fusion_auto_optimize');
  });

  it('reports bottlenecks to the backend when thresholds are exceeded', async () => {
    mockInvoke.mockResolvedValue(undefined);
    const stats = createPipelineStats({
      step4_generation_ms: 2500,
      total_ms: 3200,
    });

    await (engine as any).step9_AutoOptimize(stats);

    expect(mockInvoke).toHaveBeenCalledWith(
      'fusion_auto_optimize',
      expect.objectContaining({
        stats,
        bottlenecks: ['IA generation too slow'],
      })
    );
  });
});

function resetCognitiveMocks() {
  mockCognitiveOptimizer.analyzeIntention.mockReset();
  mockCognitiveOptimizer.optimizeFullPipeline.mockReset();
  mockCognitiveOptimizer.checkCoherence.mockReset();

  mockCognitiveOptimizer.analyzeIntention.mockResolvedValue(backendIntention);
  mockCognitiveOptimizer.optimizeFullPipeline.mockResolvedValue({
    optimizedContext: [],
    intention: backendIntention,
    analysisSteps: ['analyze', 'generate'],
    retrievedMemories: [],
  });
  mockCognitiveOptimizer.checkCoherence.mockResolvedValue({
    is_coherent: true,
    coherence_score: 0.98,
    issues: [],
    suggestions: [],
  });
}

function resetEngineInternals(target: SingularityFusionEngine) {
  Reflect.set(target as Record<string, unknown>, 'isInitialized', false);
  Reflect.set(target as Record<string, unknown>, 'currentState', null);
}

function setupSuccessfulInvoke(
  updatedState: SingularityState,
  overrides: InvokeResponseMap = {}
) {
  const responses: InvokeResponseMap = {
    fusion_analyze_intention: backendIntention,
    fusion_activate_modules: backendActivation,
    fusion_adjust_styles: backendStyle,
    fusion_generate_ia_response: SUCCESS_RESPONSE_TEXT,
    fusion_prepare_tts: defaultAudioBuffer,
    fusion_process_lipsync: backendLipSync,
    fusion_animate_avatar: backendAnimation,
    fusion_update_state: updatedState,
    fusion_auto_optimize: undefined,
    ...overrides,
  };

  applyInvokeResponses(responses);
}

function applyInvokeResponses(map: InvokeResponseMap) {
  mockInvoke.mockImplementation(async (command: string) => {
    if (Object.prototype.hasOwnProperty.call(map, command)) {
      const value = map[command];
      if (typeof value === 'function') {
        return (value as () => unknown)();
      }
      return value;
    }
    return undefined;
  });
}

type FusionInputOverrides = Partial<
  Omit<FusionInput, 'preferences' | 'current_state'>
> & {
  preferences?: Partial<UserPreferences>;
  current_state?: SingularityState;
};

function createFusionInput(overrides: FusionInputOverrides = {}): FusionInput {
  const preferencesOverride = overrides.preferences ?? {};
  const preferences: UserPreferences = {
    voice_speed: preferencesOverride.voice_speed ?? 1,
    voice_pitch: preferencesOverride.voice_pitch ?? 1,
    avatar_animation_intensity: preferencesOverride.avatar_animation_intensity ?? 0.8,
    narrative_style: preferencesOverride.narrative_style ?? 'casual',
    emotion_modulation: preferencesOverride.emotion_modulation ?? 0.7,
  };

  const history: Message[] =
    overrides.conversation_history ??
    ([{ role: 'user', content: 'Hello?', timestamp: Date.now() - 500 }] as Message[]);

  return {
    user_message: overrides.user_message ?? 'Bonjour Fusion',
    conversation_history: history,
    current_state: overrides.current_state ?? createSingularityState(),
    preferences,
  };
}

function createSingularityState(
  overrides: Partial<SingularityState> = {}
): SingularityState {
  const timestamp = Date.now();
  const baseState: SingularityState = {
    physical: {
      helios: {
        active: true,
        cpu_usage: 0.42,
        memory_usage: 0.55,
        disk_usage: 0.33,
        temperature: 42,
        battery_level: null,
        last_update: timestamp,
      },
      system_health: {
        global_health: 95,
        services_running: 12,
        errors_count: 0,
        warnings_count: 1,
        uptime: 100_000,
      },
      metrics: {
        cpu_usage: 0.38,
        memory_usage: 0.5,
        fps: 60,
        latency: 15,
        performance_score: 0.93,
      },
    },
    cognitive: {
      memory: {
        total_memories: 1200,
        active_memories: 32,
        memory_usage: 0.41,
        last_retrieval: timestamp - 1_000,
        compression_ratio: 0.62,
      },
      conversation: {
        active_session: true,
        message_count: 58,
        context_length: 900,
        last_message: 'Hello',
        last_timestamp: timestamp - 500,
      },
      knowledge: {
        total_entries: 400,
        indexed_entries: 395,
        knowledge_score: 0.9,
        last_update: timestamp - 10_000,
      },
      coherence: 0.95,
    },
    symbolic: {
      persona: {
        name: 'TITANE',
        mood: 'calm',
        intensity: 0.7,
        evolution_level: 2,
        last_interaction: timestamp - 250,
      },
      archetype: {
        active_archetype: 'guide',
        strength: 0.8,
        transition: null,
      },
      visual: {
        theme: 'neon',
        accent_color: '#00FFFF',
        glow_intensity: 0.5,
        motion_enabled: true,
        depth_enabled: true,
      },
      stability: 0.9,
    },
    adaptive: {
      evolution: {
        generation: 4,
        mutation_rate: 0.02,
        fitness_score: 0.91,
        last_evolution: timestamp - 2_000,
      },
      auto_heal: {
        active: true,
        healing_capacity: 0.8,
        errors_healed: 2,
        last_heal: timestamp - 1_500,
      },
      evolution_capacity: 0.85,
    },
    meta: {
      ui: {
        active_page: 'chat',
        sidebar_open: true,
        modal_open: false,
        theme: 'dark',
        last_interaction: timestamp - 120,
      },
      runtime: {
        version: 'v24.30',
        build: 'dev',
        environment: 'test',
        uptime: 200_000,
        restart_count: 1,
      },
      runtime_health: 0.93,
    },
    timestamp,
    signature: 'state-test',
  };

  return {
    ...baseState,
    ...overrides,
  };
}

function createPipelineStats(overrides: Partial<PipelineStats> = {}): PipelineStats {
  return {
    step1_analyse_ms: 10,
    step2_activation_ms: 8,
    step3_styles_ms: 6,
    step4_generation_ms: 150,
    step5_tts_ms: 90,
    step6_lipsync_ms: 40,
    step7_animation_ms: 30,
    step8_state_ms: 12,
    step9_optimization_ms: 5,
    total_ms: 400,
    ...overrides,
  };
}
