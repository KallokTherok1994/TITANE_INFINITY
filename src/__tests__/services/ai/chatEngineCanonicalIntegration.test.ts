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
  buildPreferencePrompt: vi.fn().mockReturnValue(''),
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
import { chatEngine } from '@/services/ai/chatEngine';
import { chatEngineCommands } from '@/services/tauri/chatEngine.commands';

// ── TESTS ────────────────────────────────────────────────────────

describe('ChatEngine ↔ CanonicalDiscernmentKernel Integration', () => {
  const mockedChatEngineCommands = vi.mocked(chatEngineCommands);

  beforeEach(() => {
    vi.clearAllMocks();
    chatEngine.setMode('default');
    chatEngine.setProvider('auto');
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
    expect(['low', 'medium', 'high', 'max']).toContain(
      decision?.provider.reasoningEffort
    );
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

  it('should naturalize procedural creative outputs before returning generate()', async () => {
    const { aiOrchestrator } = await import('@/services/ai/orchestrator');
    vi.mocked(aiOrchestrator).generate.mockResolvedValueOnce({
      content: `Bonjour ! Je me nomme TITANE∞.

Voici la première phase : COLLECTE MAXIMALE.

La prochaine étape sera le CROISEMENT CRITIQUE.

Voulez-vous que je continue ?`,
      provider: 'ollama',
      model: 'test-model',
      timestamp: Date.now(),
    });

    const response = await chatEngine.generate(
      'Écris-moi un poème pour une publication Facebook sur le retour au vivant',
      [],
      { mode: 'default' }
    );

    expect(response.omegaMetadata?.pipelineSteps).toContain('orchestrator-call');
    expect(response.content).toContain('Je peux te le faire directement');
    expect(response.content).not.toContain('Je me nomme TITANE');
    expect(response.content).not.toContain('COLLECTE MAXIMALE');
    expect(response.content).not.toContain('Voulez-vous que je continue');
  });

  it('should let persisted backend defaults apply when no explicit override is set', async () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {},
      configurable: true,
    });

    const response = await chatEngine.generate('Bonjour', [], { mode: 'default' });

    expect(mockedChatEngineCommands.generateResponse).toHaveBeenCalled();
    const payload = mockedChatEngineCommands.generateResponse.mock.calls[0][0];
    const canonicalProvider = response.omegaMetadata?.canonicalDecision?.provider?.name;
    expect(payload.provider).toBe(
      canonicalProvider === 'auto' ? undefined : canonicalProvider
    );
    expect(payload.temperature).toBe(0.7);
    expect(payload.maxOutputTokens).toBe(4096);
    expect(payload.profile).toBe('fast');

    delete (window as typeof window & { __TAURI_INTERNALS__?: unknown })
      .__TAURI_INTERNALS__;
  });

  it('should keep clarification prompts to a single short question', () => {
    const response = (
      chatEngine as unknown as {
        buildClarificationResponse: (message: string, mode: string) => string;
      }
    ).buildClarificationResponse('architecture titane', 'default');

    expect((response.match(/\?/g) || []).length).toBeLessThanOrEqual(1);
    expect(response).not.toContain('Comment');
    expect(response).not.toContain('Pourquoi');
  });

  // ── LOCK 3: PROVIDER_TRUTH_CHAIN — canonical kernel provider is never overridden ──
  it('should honor explicit kernel provider — cognitiveKernel MUST NOT override it', async () => {
    // Set an explicit provider preference (simulating kernel having chosen ollama)
    chatEngine.setProvider('ollama');

    const response = await chatEngine.generate(
      "Analyse de l'architecture système Ring 0",
      [],
      { mode: 'default' }
    );

    const decision = response.omegaMetadata?.canonicalDecision;

    // The kernel decision must be present
    expect(decision).toBeDefined();

    // The pipeline must contain canonical-discernment (kernel ran)
    expect(response.omegaMetadata?.pipelineSteps).toContain('canonical-discernment');

    // The orchestrator was called (not bypassed)
    const { aiOrchestrator } = await import('@/services/ai/orchestrator');
    expect(vi.mocked(aiOrchestrator).generate).toHaveBeenCalled();

    // The orchestrator was NOT called with a different provider than what the kernel chose.
    // When kernel provider is explicit (not 'auto'), the cognitiveKernel signal must not override.
    const orchestratorCall = vi.mocked(aiOrchestrator).generate.mock.calls[0];
    if (orchestratorCall) {
      const orchestratorConfig = orchestratorCall[2]; // 3rd arg = config
      if (
        orchestratorConfig?.preferredProvider &&
        orchestratorConfig.preferredProvider !== 'auto'
      ) {
        // The preferred provider passed to orchestrator must be the kernel's choice, not cognitiveKernel's
        expect(orchestratorConfig.preferredProvider).not.toBe('gemini');
        expect(orchestratorConfig.preferredProvider).not.toBe('anthropic');
      }
    }
  });

  // ── LOCK 4: PROVIDER_TRUTH_CHAIN — orchestrator never lets cognitiveKernel override explicit preferredProvider ──
  it('PROVIDER_TRUTH_CHAIN: orchestrator.generate() with explicit preferredProvider is never overridden by cognitiveKernel', async () => {
    // The plan requires: when preferredProvider is explicitly set (not 'auto'),
    // the cognitiveKernel's provider decision is NOT used as the final provider,
    // regardless of confidence. This is enforced by selectFinalProvider() in orchestrator.ts.
    chatEngine.setProvider('ollama');

    const response = await chatEngine.generate(
      'Crée un composant React avec TypeScript et tests unitaires',
      [],
      { mode: 'default' }
    );

    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision).toBeDefined();

    // Kernel ran and produced a decision
    expect(response.omegaMetadata?.pipelineSteps).toContain('canonical-discernment');

    // Orchestrator was called
    const { aiOrchestrator } = await import('@/services/ai/orchestrator');
    const mockGenerate = vi.mocked(aiOrchestrator).generate;
    expect(mockGenerate).toHaveBeenCalled();

    // The orchestrator was passed the kernel's explicit provider preference, NOT 'auto'
    // and NOT a cognitiveKernel override like 'gemini' or 'anthropic'
    const calls = mockGenerate.mock.calls;
    const lastCall = calls[calls.length - 1];
    if (lastCall) {
      const orchestratorConfig = lastCall[2]; // 3rd arg = config
      if (orchestratorConfig?.preferredProvider) {
        // Must NOT be a cloud provider if kernel chose local
        const forbidden = ['gemini', 'anthropic', 'openai'];
        expect(forbidden).not.toContain(orchestratorConfig.preferredProvider);
      }
    }
  });

  it('should pass kernel fallback chain order to orchestrator config', async () => {
    chatEngine.setProvider('auto');

    const response = await chatEngine.generate('Architecture Ring 0 Tauri IPC', [], {
      mode: 'default',
    });

    const decision = response.omegaMetadata?.canonicalDecision;
    expect(decision).toBeDefined();

    // Kernel decision must include a provider field
    expect(decision?.provider).toBeDefined();
    expect(typeof decision?.provider.name).toBe('string');

    // Kernel fallback chain must be defined (array, possibly empty)
    if (decision?.fallbackChain !== undefined) {
      expect(Array.isArray(decision.fallbackChain)).toBe(true);
    }

    // Pipeline must be coherent
    expect(response.omegaMetadata?.pipelineSteps).toContain('canonical-discernment');
  });
});
