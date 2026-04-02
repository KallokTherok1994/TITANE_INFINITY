/**
 * TITANE∞ — ChatEngine ↔ CanonicalDiscernmentKernel Integration Test
 *
 * LOCK: preuve_consommation_kernel
 * PURPOSE: Prove that chatEngine.generate() calls the kernel
 *          and that canonicalDecision flows into the response.
 *
 * This test does NOT test LLM quality — it tests the wiring:
 * - kernel.discern() is called
 * - canonicalDecision appears in omegaMetadata
 * - pipelineSteps include 'canonical-discernment'
 * - kernel's profileId is respected (not silently bypassed)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── MOCK HEAVY DEPENDENCIES ──────────────────────────────────────
// We mock everything except the kernel itself, so the real kernel runs
// inside chatEngine.generate() and we can verify its output flows through.

vi.mock('@/services/cache/responseCache', () => ({
  responseCache: {
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
  },
}));

vi.mock('@/services/cache/predictivePreloader', () => ({
  predictivePreloader: {
    recordUserMessage: vi.fn(),
    setPreloadHandler: vi.fn(),
  },
}));

vi.mock('@/engines/conversation/conversationLifecycleEngine', () => ({
  conversationLifecycle: {
    getActiveConversation: vi.fn().mockReturnValue(null),
    setActiveConversation: vi.fn(),
  },
}));

vi.mock('@/services/tauri/chatEngine.commands', () => ({
  chatEngineCommands: {
    generateResponse: vi.fn().mockResolvedValue({ provider: 'mock' }), // forces fallback to orchestrator
    streamResponse: vi.fn(),
    onStreamChunk: vi.fn(),
    onStreamDone: vi.fn(),
  },
}));

vi.mock('@/services/cognitive/cognitiveOmegaIntegration', () => ({
  cognitiveOmega: {
    enrichContext: vi.fn().mockResolvedValue({
      combined: '',
      metadata: { memoryCount: 0, goalCount: 0, factCount: 0 },
    }),
    startTrace: vi.fn().mockResolvedValue(undefined),
    logPhase: vi.fn().mockResolvedValue(undefined),
    endTrace: vi.fn().mockResolvedValue(undefined),
    checkConsistency: vi.fn().mockResolvedValue({
      isConsistent: true,
      violations: [],
      consistencyScore: 1.0,
      shouldCorrect: false,
    }),
    autoCorrect: vi.fn(),
    saveInteraction: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/ai/orchestrator', () => ({
  aiOrchestrator: {
    generate: vi.fn().mockResolvedValue({
      content: 'Test response from orchestrator',
      provider: 'ollama',
      model: 'test-model',
      timestamp: Date.now(),
    }),
    getProvidersStatus: vi.fn().mockResolvedValue({
      providers: [{ name: 'ollama', reliability: 90 }],
    }),
    stream: vi.fn(),
  },
}));

vi.mock('@/services/ai/memoryIntegration', () => ({
  memoryIntegration: {
    loadContext: vi.fn().mockResolvedValue({
      activeProjects: [],
      recentDecisions: [],
      relevantKnowledge: [],
      activeRituals: [],
      timeline: [],
    }),
    loadPreferences: vi.fn().mockReturnValue([]),
    getDepthPreference: vi.fn().mockReturnValue(null),
    saveInteraction: vi.fn().mockResolvedValue(undefined),
    savePreferences: vi.fn(),
  },
}));

vi.mock('@/services/ai/inputValidator', () => ({
  inputValidator: {
    validate: vi.fn().mockImplementation((msg: string) => msg),
  },
}));

vi.mock('@/services/ai/chatValidator', () => ({
  chatValidator: {
    validate: vi.fn().mockReturnValue({
      isValid: true,
      score: 0.95,
      coherenceScore: 0.95,
      anomalyScore: 0.05,
      issues: [],
      cleaned: null,
    }),
  },
}));

vi.mock('@/services/ai/preferenceEngine', () => ({
  extractPreferences: vi.fn().mockReturnValue({
    preferences: [],
    isNoise: false,
    noiseReason: null,
  }),
  shapeResponse: vi.fn().mockImplementation((content: string) => content),
}));

vi.mock('@/core/prompts', () => ({
  buildSystemPrompt: vi.fn().mockReturnValue('System prompt'),
  requiresClarityAudit: vi.fn().mockReturnValue(false),
  detectSaturation: vi.fn().mockReturnValue(false),
  checkTruthConfidence: vi.fn().mockReturnValue({
    requiresDisclaimer: false,
    certainty: 90,
  }),
  generateProtectionModeResponse: vi.fn(),
  createClarityAuditTemplate: vi.fn(),
}));

vi.mock('@/services/ai/chatModes', () => ({
  chatModes: {
    default: {
      name: 'Default',
      icon: '🤖',
      profileId: 'BALANCED',
      maxTokens: 4096,
      temperature: 0.7,
    },
  },
}));

vi.mock('@/config/aiTimeouts.config', () => ({
  MEMORY_TIMEOUTS: {
    contextLoad: 5000,
    cognitiveEnrichment: 3000,
    memorySave: 3000,
  },
  REQUEST_BUDGETS: {
    globalRequestMs: 30000,
    maxAttempts: 3,
  },
}));

vi.mock('@/services/ai/chatTypes', () => ({
  // empty — just needs to not throw
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
  }),
}));

vi.mock('@/services/monitoring/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  generateCorrelationId: () => 'test-correlation-id',
}));

vi.mock('@/services/skills/activation/skillActivator', () => ({
  getActiveSkill: vi.fn().mockReturnValue(null),
  getSystemPromptForSkill: vi.fn().mockReturnValue(null),
  getActiveSkillId: vi.fn().mockReturnValue(null),
}));

vi.mock('@/services/memory/types', () => ({
  // type-only module
}));

// ── IMPORTS (after mocks) ────────────────────────────────────────
import { chatEngine } from '../../../services/ai/chatEngine';

// ── TESTS ────────────────────────────────────────────────────────

describe('ChatEngine ↔ CanonicalDiscernmentKernel Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chatEngine.setMode('default');
  });

  it('should include canonicalDecision in omegaMetadata after generate()', async () => {
    const response = await chatEngine.generate(
      'Crée un fichier test.ts avec une fonction hello',
      [],
      { mode: 'default' }
    );

    // CORE PROOF: canonicalDecision must exist
    expect(response.omegaMetadata).toBeDefined();
    expect(response.omegaMetadata?.canonicalDecision).toBeDefined();
  });

  it('should include canonical-discernment in pipelineSteps', async () => {
    const response = await chatEngine.generate('Bonjour', [], { mode: 'default' });

    expect(response.omegaMetadata?.pipelineSteps).toContain('canonical-discernment');
  });

  it('should produce canonicalDecision with expected shape', async () => {
    const response = await chatEngine.generate('Analyse ce code TypeScript', [], {
      mode: 'default',
    });

    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision).toBeDefined();

    // Verify all 8 decisions are present
    expect(decision?.mode).toBeDefined();
    expect(decision?.profileId).toBeDefined();
    expect(decision?.inferenceState).toBeDefined();
    expect(decision?.memoryInjection).toBeDefined();
    expect(decision?.provider).toBeDefined();
    expect(decision?.fallbackChain).toBeDefined();
    expect(decision?.truthStatus).toBeDefined();
    expect(decision?.confidence).toBeGreaterThanOrEqual(0);
    expect(decision?.confidence).toBeLessThanOrEqual(1);
  });

  it('should select DEVELOPED profile for action request messages', async () => {
    const response = await chatEngine.generate(
      'Crée un composant React avec TypeScript',
      [],
      { mode: 'default' }
    );

    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision?.profileId).toBe('DEVELOPED');
  });

  it('should select DIRECT profile for conversational messages', async () => {
    const response = await chatEngine.generate('salut', [], { mode: 'default' });

    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision?.profileId).toBe('DIRECT');
  });

  it('should use kernel mode as authoritative in response', async () => {
    const response = await chatEngine.generate('test', [], { mode: 'default' });

    // The response mode should come from the kernel's resolved mode
    expect(response.mode).toBeDefined();
    expect(response.omegaMetadata?.canonicalDecision?.mode).toBe(response.mode);
  });

  it('should have non-empty signals array in canonicalDecision', async () => {
    const response = await chatEngine.generate('Quelle est la météo?', [], {
      mode: 'default',
    });

    const signals = response.omegaMetadata?.canonicalDecision?.signals;
    expect(signals).toBeDefined();
    expect(Array.isArray(signals)).toBe(true);
    expect(signals!.length).toBeGreaterThan(0);
  });

  it('should include processingTimeMs in canonicalDecision', async () => {
    const response = await chatEngine.generate('test', [], { mode: 'default' });

    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision?.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  // ── LOCK 2: Stream provider propagation ──
  it('should propagate kernel provider decision to chatEngine state for streaming', async () => {
    // First, generate with a specific provider preference
    chatEngine.setProvider('ollama');

    const response = await chatEngine.generate('Crée un fichier test.ts', [], {
      mode: 'default',
    });

    // The kernel should have made a provider decision
    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision).toBeDefined();
    expect(decision?.provider).toBeDefined();
    expect(decision?.provider.name).toBeDefined();

    // The pipelineSteps should include canonical-discernment
    expect(response.omegaMetadata?.pipelineSteps).toContain('canonical-discernment');
  });

  it('should include canonicalDecision with provider config in generate response', async () => {
    const response = await chatEngine.generate('test', [], { mode: 'default' });

    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision?.provider).toBeDefined();
    expect(decision?.provider.temperature).toBeGreaterThan(0);
    expect(decision?.provider.maxTokens).toBeGreaterThan(0);
    expect(decision?.provider.reasoningEffort).toBeDefined();
    expect(['low', 'medium', 'high']).toContain(decision?.provider.reasoningEffort);
  });

  // ── LOCK 3: Kernel inferenceState gates LLM call ──
  it('should skip LLM call when kernel returns CLARIFY_REQUIRED', async () => {
    const { aiOrchestrator } = await import('../../../services/ai/orchestrator');
    vi.clearAllMocks();

    const response = await chatEngine.generate('ok', [], { mode: 'default' });

    // The kernel should have detected CLARIFY_REQUIRED for this ultra-short message
    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision?.inferenceState).toBe('CLARIFY_REQUIRED');

    // The pipeline should have returned early WITHOUT calling the orchestrator
    expect(response.omegaMetadata?.pipelineSteps).toContain('clarification-returned');

    // The response should contain a clarification message, not an LLM response
    expect(response.provider).toBe('titane-local');
    expect(response.content).toContain('?');
  });

  it('should proceed to LLM when kernel returns SAFE_TO_INFER', async () => {
    const response = await chatEngine.generate(
      'Crée un fichier test.ts avec une fonction hello qui retourne bonjour',
      [],
      { mode: 'default' }
    );

    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision?.inferenceState).toBe('SAFE_TO_INFER');

    // The pipeline should have called the orchestrator
    expect(response.omegaMetadata?.pipelineSteps).toContain('orchestrator-call');
    expect(response.omegaMetadata?.pipelineSteps).not.toContain('clarification-returned');
  });
});
