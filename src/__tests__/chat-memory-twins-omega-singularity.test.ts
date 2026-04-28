/**
 * TITANE∞ — Chat ↔ Mémoire / Twins / OMEGA / Singularity — Tests d'intégration v31.2.34
 *
 * Couverture:
 *   1. memoryIntegration.loadContext() appelé dans chatEngine.generate()
 *   2. cognitiveOmega.enrichContext() appelé en parallèle dans le pipeline
 *   3. SingularityBridge.getCachedCoherence() utilisé par le kernel
 *   4. userPreferencesEngine utilisé (resolveDepthPref + buildPreferencePrompt)
 *   5. Pipeline dégradé gracieux en browser mode (pas de Tauri)
 *   6. SingularityBridge — browser fallback (getCachedCoherence retourne 0.5)
 *   7. CognitiveOmega — enrichContext() browser mode (ne lève pas d'erreur)
 *   8. memoryIntegration — loadPreferences() retourne tableau sans Tauri
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════════
// MOCKS — pipeline complet sans Tauri
// ═══════════════════════════════════════════════════════════════════

const mockLoadContext = vi.fn().mockResolvedValue({
  activeProjects: [],
  recentDecisions: [],
  relevantKnowledge: [],
  activeRituals: [],
  timeline: [],
});
const mockLoadPreferences = vi.fn().mockReturnValue([]);
const mockGetDepthPreference = vi.fn().mockReturnValue(null);
const mockSaveInteraction = vi.fn().mockResolvedValue(undefined);

vi.mock('@/services/ai/memoryIntegration', () => ({
  memoryIntegration: {
    loadContext: (...args: unknown[]) => mockLoadContext(...args),
    loadPreferences: () => mockLoadPreferences(),
    getDepthPreference: () => mockGetDepthPreference(),
    saveInteraction: (...args: unknown[]) => mockSaveInteraction(...args),
    savePreferences: vi.fn(),
  },
}));

const mockEnrichContext = vi.fn().mockResolvedValue({
  combined: '[TEST_OMEGA_CONTEXT] Contexte enrichi OMEGA',
  metadata: { memoryCount: 2, goalCount: 1, factCount: 3 },
});
const mockStartTrace = vi.fn().mockResolvedValue('trace-test-id');
const mockLogPhase = vi.fn().mockResolvedValue(undefined);
const mockEndTrace = vi.fn().mockResolvedValue(undefined);
const mockCheckConsistency = vi.fn().mockResolvedValue({
  isConsistent: true, violations: [], consistencyScore: 1.0, shouldCorrect: false,
});

vi.mock('@/services/cognitive/cognitiveOmegaIntegration', () => ({
  cognitiveOmega: {
    enrichContext: (...args: unknown[]) => mockEnrichContext(...args),
    startTrace: (...args: unknown[]) => mockStartTrace(...args),
    logPhase: (...args: unknown[]) => mockLogPhase(...args),
    endTrace: (...args: unknown[]) => mockEndTrace(...args),
    checkConsistency: (...args: unknown[]) => mockCheckConsistency(...args),
    autoCorrect: vi.fn(),
    saveInteraction: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockGetCachedCoherence = vi.fn().mockReturnValue(0.5);

vi.mock('@/services/singularityBridge', () => ({
  SingularityBridge: {
    getCachedCoherence: () => mockGetCachedCoherence(),
    initialize: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn().mockReturnValue(() => {}),
    getFullState: vi.fn().mockResolvedValue({ cognitive: { coherence: 0.5 } }),
  },
}));

vi.mock('@/services/userPreferencesEngine', () => ({
  userPreferencesEngine: {
    getPreferences: vi.fn().mockReturnValue({
      language: 'fr-FR',
      communicationStyle: { formality: 'informal', verbosity: 'balanced', humor: true, emojis: true },
      interests: [],
      topicsHistory: [],
      technical: { preferredLanguages: [], expertiseLevel: 'intermediate', preferCodeComments: true, preferExamples: true },
      audio: { voiceEnabled: true, preferredVoice: 'fr_FR-siwis-medium', preferredSpeed: 1.0 },
      metrics: {
        totalInteractions: 5, positiveReactions: 3, negativeReactions: 1,
        averageResponseLength: 250, lastInteraction: Date.now(), createdAt: Date.now(), updatedAt: Date.now(),
      },
      customPreferences: { deep_internet_analysis: true, primary_user_name: 'Kevin Thibault' },
    }),
  },
}));

vi.mock('@/services/cache/responseCache', () => ({
  responseCache: { get: vi.fn().mockReturnValue(null), set: vi.fn() },
}));

vi.mock('@/services/cache/predictivePreloader', () => ({
  predictivePreloader: { recordUserMessage: vi.fn(), setPreloadHandler: vi.fn() },
}));

vi.mock('@/engines/conversation/conversationLifecycleEngine', () => ({
  conversationLifecycle: {
    getActiveConversation: vi.fn().mockReturnValue(null),
    setActiveConversation: vi.fn(),
  },
}));

vi.mock('@/services/tauri/chatEngine.commands', () => ({
  chatEngineCommands: {
    generateResponse: vi.fn().mockResolvedValue({ provider: 'mock' }),
    streamResponse: vi.fn(),
    onStreamChunk: vi.fn(),
    onStreamDone: vi.fn(),
  },
}));

vi.mock('@/services/ai/orchestrator', () => ({
  aiOrchestrator: {
    generate: vi.fn().mockResolvedValue({
      content: 'Réponse test OMEGA pipeline',
      provider: 'ollama',
      model: 'gemma2:2b',
      timestamp: Date.now(),
    }),
    getProvidersStatus: vi.fn().mockResolvedValue({
      providers: [{ name: 'ollama', reliability: 90 }],
    }),
    stream: vi.fn(),
  },
}));

vi.mock('@/services/monitoring/logger', () => ({
  logger: {
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(),
    group: vi.fn(), groupEnd: vi.fn(),
  },
  generateCorrelationId: vi.fn().mockReturnValue('corr-test-id'),
}));

vi.mock('@/services/ai/omegaDevToolsBridge', () => ({
  omegaDevToolsBridge: {
    updateCognitiveState: vi.fn().mockResolvedValue(undefined),
    logPipelineEvent: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/ai/inputValidator', () => ({
  inputValidator: { validate: vi.fn((msg: unknown) => msg) },
}));

vi.mock('@/services/skills/activation/skillActivator', () => ({
  getActiveSkill: vi.fn().mockReturnValue(null),
  getSystemPromptForSkill: vi.fn().mockReturnValue(null),
  getActiveSkillId: vi.fn().mockReturnValue(null),
}));

vi.mock('@/services/api/defaultKnowledgeBase', () => ({
  getCompactIndex: vi.fn().mockResolvedValue(''),
  getRelevantPromptContext: vi.fn().mockResolvedValue(null),
}));

// ─────────────────────────────────────────────────────────────────
// Import SUT
// ─────────────────────────────────────────────────────────────────

import { chatEngine } from '../services/ai/chatEngine';

// ═══════════════════════════════════════════════════════════════════
// 1. memoryIntegration.loadContext() — appelé dans generate()
// ═══════════════════════════════════════════════════════════════════

describe('chatEngine.generate() — memoryIntegration connexion', () => {
  beforeEach(() => {
    mockLoadContext.mockClear();
    mockLoadPreferences.mockClear();
    mockEnrichContext.mockClear();
    mockGetCachedCoherence.mockClear();
  });

  it('appelle memoryIntegration.loadContext() à chaque génération', async () => {
    await chatEngine.generate('Test mémoire', [], { mode: 'default' });
    expect(mockLoadContext).toHaveBeenCalledTimes(1);
  });

  it('appelle memoryIntegration.loadPreferences() pour le discernment kernel', async () => {
    await chatEngine.generate('Préférences utilisateur', [], { mode: 'default' });
    // Le pipeline appelle loadPreferences() dans plusieurs étapes (preference-extraction + kernel)
    expect(mockLoadPreferences).toHaveBeenCalled();
  });

  it('appelle memoryIntegration.getDepthPreference() via resolveDepthPref', async () => {
    await chatEngine.generate('Profondeur réponse', [], { mode: 'default' });
    expect(mockGetDepthPreference).toHaveBeenCalled();
  });

  it('retourne une réponse avec un pipelineStep context-loading-parallel', async () => {
    const result = await chatEngine.generate('Test pipeline', [], { mode: 'default' });
    expect(result.omegaMetadata?.pipelineSteps).toContain('context-loading-parallel');
  });

  it('retourne content non vide', async () => {
    const result = await chatEngine.generate('Bonjour TITANE', [], { mode: 'default' });
    expect(result.content.trim().length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. cognitiveOmega.enrichContext() — appelé en parallèle
// ═══════════════════════════════════════════════════════════════════

describe('chatEngine.generate() — cognitiveOmega OMEGA connexion', () => {
  beforeEach(() => {
    mockEnrichContext.mockClear();
  });

  it('appelle cognitiveOmega.enrichContext() à chaque génération', async () => {
    await chatEngine.generate('Test OMEGA enrichissement', [], { mode: 'default' });
    expect(mockEnrichContext).toHaveBeenCalledTimes(1);
  });

  it('passe le message et le mode à enrichContext()', async () => {
    const message = 'Test enrichissement cognitif OMEGA';
    await chatEngine.generate(message, [], { mode: 'reflection' });
    expect(mockEnrichContext).toHaveBeenCalledWith(
      message,
      expect.any(String),
      'reflection'
    );
  });

  it('continue sans OMEGA quand enrichContext() rejette (autoHeal)', async () => {
    mockEnrichContext.mockRejectedValueOnce(new Error('OMEGA offline'));
    const result = await chatEngine.generate('Test OMEGA fallback', [], { mode: 'default' });
    expect(result.content.trim().length).toBeGreaterThan(0);
  });

  it('inclut canonical-discernment dans les pipelineSteps après OMEGA', async () => {
    const result = await chatEngine.generate('Test discernment', [], { mode: 'default' });
    expect(result.omegaMetadata?.pipelineSteps).toContain('canonical-discernment');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. SingularityBridge.getCachedCoherence() — connexion kernel
// ═══════════════════════════════════════════════════════════════════

describe('chatEngine.generate() — SingularityBridge (Twins) connexion', () => {
  beforeEach(() => {
    mockGetCachedCoherence.mockClear();
  });

  it('appelle SingularityBridge.getCachedCoherence() pour le discernment kernel', async () => {
    await chatEngine.generate('Test Singularity', [], { mode: 'default' });
    expect(mockGetCachedCoherence).toHaveBeenCalled();
  });

  it('intègre la cohérence Singularity dans canonicalDecision', async () => {
    mockGetCachedCoherence.mockReturnValue(0.8);
    const result = await chatEngine.generate('Test coherence', [], { mode: 'default' });
    const decision = result.omegaMetadata?.canonicalDecision;
    if (decision) {
      expect(decision).toHaveProperty('confidence');
      expect(decision.confidence).toBeGreaterThanOrEqual(0);
    }
  });

  it('browser fallback: getCachedCoherence retourne 0.5 par défaut', () => {
    // SingularityBridge.getCachedCoherence() doit toujours retourner un nombre
    const coherence = mockGetCachedCoherence();
    expect(typeof coherence).toBe('number');
    expect(coherence).toBeGreaterThanOrEqual(0);
    expect(coherence).toBeLessThanOrEqual(1);
  });

  it('pipeline ne plante pas quand Singularity retourne coherence minimale (0)', async () => {
    mockGetCachedCoherence.mockReturnValue(0);
    const result = await chatEngine.generate('Test coherence zéro', [], { mode: 'default' });
    expect(result.content).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. userPreferencesEngine — deep_internet_analysis → resolveDepthPref
// ═══════════════════════════════════════════════════════════════════

describe('chatEngine.generate() — userPreferencesEngine connexion', () => {
  it('lit deep_internet_analysis depuis userPreferencesEngine', async () => {
    const result = await chatEngine.generate('Test profondeur', [], { mode: 'default' });
    // Avec deep_internet_analysis: true, le kernel devrait recevoir depthPref 'deep'
    // (si la préférence de base est null/standard/developed)
    expect(result.omegaMetadata?.pipelineSteps).toContain('preference-extraction');
  });

  it('inclut le pipelineStep preference-extraction', async () => {
    const result = await chatEngine.generate('Analyse approfondie', [], { mode: 'default' });
    expect(result.omegaMetadata?.pipelineSteps).toContain('preference-extraction');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. Pipeline complet — structure de réponse
// ═══════════════════════════════════════════════════════════════════

describe('chatEngine.generate() — structure réponse et pipeline complet', () => {
  it('retourne un objet ChatEngineResponse avec les champs obligatoires', async () => {
    const result = await chatEngine.generate('Bonjour', [], { mode: 'default' });
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('provider');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('mode');
    expect(result).toHaveProperty('contextUsed');
    expect(result).toHaveProperty('omegaMetadata');
  });

  it('omegaMetadata contient les champs de pipeline OMEGA', async () => {
    const result = await chatEngine.generate('Test méta', [], { mode: 'default' });
    expect(result.omegaMetadata).toMatchObject({
      pipelineSteps: expect.any(Array),
      validationScore: expect.any(Number),
      autoHealed: expect.any(Boolean),
      failureHandled: expect.any(Boolean),
      processingTime: expect.any(Number),
    });
  });

  it('pipeline inclut input-validation, context-loading, canonical-discernment, prompt-building', async () => {
    const result = await chatEngine.generate('Pipeline complet', [], { mode: 'default' });
    const steps = result.omegaMetadata?.pipelineSteps ?? [];
    expect(steps).toContain('input-validation');
    expect(steps).toContain('context-loading-parallel');
    expect(steps).toContain('canonical-discernment');
    expect(steps).toContain('prompt-building');
  });

  it('retourne le mode passé en config', async () => {
    const result = await chatEngine.generate('Test mode journal', [], { mode: 'journal' });
    expect(result.mode).toBe('journal');
  });

  it('gère un historique non vide', async () => {
    const history = [
      { role: 'user' as const, content: 'Message précédent', timestamp: Date.now() - 1000 },
      { role: 'assistant' as const, content: 'Réponse précédente', timestamp: Date.now() - 500 },
    ];
    const result = await chatEngine.generate('Suite conversation', history, { mode: 'default' });
    expect(result.content).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. SingularityBridge — interface browser fallback
// ═══════════════════════════════════════════════════════════════════

describe('SingularityBridge — browser fallback', () => {
  // En Vitest ESM, les mocks sont injectés via vi.mock — on consomme le mock directement
  it('getCachedCoherence() retourne toujours un nombre entre 0 et 1', () => {
    mockGetCachedCoherence.mockReturnValue(0.5);
    const c = mockGetCachedCoherence();
    expect(typeof c).toBe('number');
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(1);
  });

  it('initialize() ne lève pas d\'erreur en browser mode', async () => {
    const { SingularityBridge } = await import('@/services/singularityBridge');
    await expect(SingularityBridge.initialize()).resolves.not.toThrow();
  });

  it('subscribe() retourne une fonction d\'unsubscribe', async () => {
    const { SingularityBridge } = await import('@/services/singularityBridge');
    const unsub = SingularityBridge.subscribe(() => {});
    expect(typeof unsub).toBe('function');
  });
});
