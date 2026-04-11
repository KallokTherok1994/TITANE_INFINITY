/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — CHAT ENGINE TESTS
 *   Tests unitaires pour chatEngine.ts
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { chatEngine } from '@/services/ai/chatEngine';
import { memoryIntegration } from '@/services/ai/memoryIntegration';
import { cognitiveOmega } from '@/services/cognitive/cognitiveOmegaIntegration';
import { chatEngineCommands } from '@/services/tauri/chatEngine.commands';
import * as defaultKnowledgeBase from '@/services/api/defaultKnowledgeBase';

const EMPTY_MEMORY_CONTEXT = {
  activeProjects: [],
  recentDecisions: [],
  relevantKnowledge: [],
  activeRituals: [],
  timeline: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ChatEngine — calculateImportance', () => {
  test('reflection mode returns high importance (0.8)', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('reflection', 'Test message');
    expect(importance).toBe(0.8);
  });

  test('creation mode returns 0.7', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('creation', 'Test message');
    expect(importance).toBe(0.7);
  });

  test('strategy mode returns 0.7', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('strategy', 'Test message');
    expect(importance).toBe(0.7);
  });

  test('emergency mode returns highest importance (0.9)', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('emergency', 'Test message');
    expect(importance).toBe(0.9);
  });

  test('quick mode returns low importance (0.2)', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('quick', 'Test message');
    expect(importance).toBe(0.2);
  });

  test('standard mode returns 0.4', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Test message');
    expect(importance).toBe(0.4);
  });

  test('default mode returns 0.3', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('default', 'Test message');
    expect(importance).toBe(0.3);
  });

  test('omega mode returns 0.5', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('omega', 'Test message');
    expect(importance).toBe(0.5);
  });

  test('debug_cognitive mode returns 0.6', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('debug_cognitive', 'Test message');
    expect(importance).toBe(0.6);
  });
});

describe('ChatEngine — importance boosting keywords', () => {
  test('keyword "décision" boosts importance by 0.1', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'standard',
      'Prise de décision importante'
    );
    expect(importance).toBe(0.5); // 0.4 + 0.1
  });

  test('keyword "important" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Message important');
    expect(importance).toBe(0.5); // 0.4 + 0.1
  });

  test('keyword "urgent" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'standard',
      'Action urgente requise'
    );
    expect(importance).toBe(0.5);
  });

  test('keyword "critique" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Situation critique');
    expect(importance).toBe(0.5);
  });

  test('keyword "projet" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Avancement du projet');
    expect(importance).toBe(0.5);
  });

  test('keyword "objectif" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'standard',
      'Atteinte des objectifs'
    );
    expect(importance).toBe(0.5);
  });

  test('multiple keywords boost importance only once', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'standard',
      'Décision importante et urgente pour le projet'
    );
    expect(importance).toBe(0.5); // 0.4 + 0.1 (not +0.3)
  });
});

describe('ChatEngine — length-based importance boost', () => {
  test('short message (<200 chars) does not boost importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Short message');
    expect(importance).toBe(0.4); // Base only
  });

  test('long message (>200 chars) boosts importance by 0.05', () => {
    const longMessage = 'A'.repeat(201);
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', longMessage);
    expect(importance).toBe(0.45); // 0.4 + 0.05
  });

  test('long message with keyword gets both boosts', () => {
    const longMessage = 'Décision importante. ' + 'A'.repeat(200);
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', longMessage);
    expect(importance).toBe(0.55); // 0.4 + 0.1 (keyword) + 0.05 (length)
  });
});

describe('ChatEngine — importance capping', () => {
  test('importance never exceeds 1.0', () => {
    const longMessageWithKeywords =
      'Décision importante urgente critique projet objectif. ' + 'A'.repeat(200);
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'emergency',
      longMessageWithKeywords
    );
    expect(importance).toBe(1.0); // Capped at 1.0, not 0.9 + 0.1 + 0.05 = 1.05
  });

  test('reflection mode with all boosts caps at 1.0', () => {
    const maxMessage = 'Décision importante. ' + 'A'.repeat(200);
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('reflection', maxMessage);
    expect(importance).toBeCloseTo(0.95, 2); // 0.8 + 0.1 + 0.05, < 1.0
  });

  test('emergency mode with keyword reaches exactly 1.0', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('emergency', 'Décision critique');
    expect(importance).toBe(1.0); // 0.9 + 0.1 = 1.0
  });
});

describe('ChatEngine — edge cases', () => {
  test('empty message returns mode base importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', '');
    expect(importance).toBe(0.4);
  });

  test('case-insensitive keyword matching', () => {
    // @ts-expect-error: accessing private method for testing
    const importanceUpper = chatEngine.calculateImportance(
      'standard',
      'DÉCISION IMPORTANTE'
    );
    // @ts-expect-error: accessing private method for testing
    const importanceLower = chatEngine.calculateImportance(
      'standard',
      'décision importante'
    );
    expect(importanceUpper).toBe(importanceLower);
    expect(importanceUpper).toBe(0.5);
  });

  test('unknown mode defaults to 0.3', () => {
    // @ts-expect-error: accessing private method for testing with invalid mode
    const importance = chatEngine.calculateImportance('unknown_mode', 'Test');
    expect(importance).toBe(0.3); // Fallback
  });
});

describe('ChatEngine — ordered memory persistence truth', () => {
  test('skips cognitive save when persistent memory write fails', async () => {
    const persistentSpy = vi
      .spyOn(memoryIntegration, 'saveInteraction')
      .mockRejectedValue(new Error('persistent-write-failed'));
    const cognitiveSpy = vi
      .spyOn(cognitiveOmega, 'saveInteraction')
      .mockResolvedValue(undefined);

    // @ts-expect-error: testing private method directly
    const result = await chatEngine.saveMemoryArtifacts({
      conversationId: 'conv_test',
      userMessage: 'Message utilisateur',
      assistantResponse: 'Reponse assistant',
      mode: 'default',
      memoryContext: EMPTY_MEMORY_CONTEXT,
      pipelineStartTime: Date.now(),
    });

    expect(result).toMatchObject({
      persistentStatus: 'rejected',
      cognitiveStatus: 'skipped',
      autoHealed: true,
    });
    expect(persistentSpy).toHaveBeenCalledTimes(1);
    expect(cognitiveSpy).not.toHaveBeenCalled();
  });

  test('runs cognitive save only after persistent memory succeeds', async () => {
    const steps: string[] = [];

    const persistentSpy = vi
      .spyOn(memoryIntegration, 'saveInteraction')
      .mockImplementation(async () => {
        steps.push('persistent');
      });
    const cognitiveSpy = vi
      .spyOn(cognitiveOmega, 'saveInteraction')
      .mockImplementation(async () => {
        steps.push('cognitive');
      });

    // @ts-expect-error: testing private method directly
    const result = await chatEngine.saveMemoryArtifacts({
      conversationId: 'conv_test',
      userMessage: 'Message utilisateur',
      assistantResponse: 'Reponse assistant',
      mode: 'default',
      memoryContext: EMPTY_MEMORY_CONTEXT,
      pipelineStartTime: Date.now(),
      provider: 'ollama',
      model: 'llama3.2',
    });

    expect(result).toMatchObject({
      persistentStatus: 'fulfilled',
      cognitiveStatus: 'fulfilled',
      autoHealed: false,
    });
    expect(persistentSpy).toHaveBeenCalledTimes(1);
    expect(cognitiveSpy).toHaveBeenCalledTimes(1);
    expect(steps).toEqual(['persistent', 'cognitive']);
  });
});

describe('ChatEngine — deferred trace start', () => {
  test('resolves trace id without throwing when cognitive trace starts', async () => {
    const traceSpy = vi
      .spyOn(cognitiveOmega, 'startTrace')
      .mockResolvedValue('trace-123');

    // @ts-expect-error: testing private helper directly
    const traceId = await chatEngine.startTraceDeferred('conv_test', 4, 'Bonjour');

    expect(traceSpy).toHaveBeenCalledWith('conv_test', 4, 'Bonjour');
    expect(traceId).toBe('trace-123');
  });

  test('returns undefined when cognitive trace start fails', async () => {
    const traceSpy = vi
      .spyOn(cognitiveOmega, 'startTrace')
      .mockRejectedValue(new Error('trace-failed'));

    // @ts-expect-error: testing private helper directly
    const traceId = await chatEngine.startTraceDeferred('conv_test', 4, 'Bonjour');

    expect(traceSpy).toHaveBeenCalledWith('conv_test', 4, 'Bonjour');
    expect(traceId).toBeUndefined();
  });
});

describe('ChatEngine — default knowledge base integration', () => {
  beforeEach(() => {
    // @ts-expect-error: private state reset for deterministic test
    chatEngine._defaultKbIndex = '';
    // @ts-expect-error: private state reset for deterministic test
    chatEngine._defaultKbLoaded = false;
    // @ts-expect-error: private state reset for deterministic test
    chatEngine._kbLoadPromise = null;
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {},
      configurable: true,
    });
  });

  afterEach(() => {
    // @ts-expect-error: cleanup injected backend marker for tests
    delete window.__TAURI_INTERNALS__;
  });

  test('injects query-relevant knowledge-base excerpts into the backend system prompt', async () => {
    vi.spyOn(memoryIntegration, 'loadContext').mockResolvedValue(EMPTY_MEMORY_CONTEXT);
    vi.spyOn(memoryIntegration, 'loadPreferences').mockReturnValue([]);
    vi.spyOn(memoryIntegration, 'saveInteraction').mockResolvedValue(undefined);
    vi.spyOn(defaultKnowledgeBase, 'getCompactIndex').mockResolvedValue(
      '• system_architecture: Architecture cœur TITANE∞'
    );
    vi.spyOn(defaultKnowledgeBase, 'getRelevantPromptContext').mockResolvedValue(
      '📚 Connaissances pertinentes TITANE∞ :\n• system_architecture — Architecture cœur TITANE∞ | Extrait: One Door network governance'
    );

    const backendSpy = vi
      .spyOn(chatEngineCommands, 'generateResponse')
      .mockResolvedValue({
        content: 'Réponse backend test',
        provider: 'ollama',
        conversationId: 'conv-kb',
        messageId: 'msg-kb',
        timestamp: Date.now(),
        tokenCount: 42,
        latencyMs: 12,
      });

    const response = await chatEngine.generate(
      'Explique-moi l architecture système et le One Door de TITANE',
      []
    );

    expect(response.content).toContain('Réponse backend test');
    expect(backendSpy).toHaveBeenCalledTimes(1);
    expect(backendSpy.mock.calls[0]?.[0]?.systemPrompt).toContain(
      'One Door network governance'
    );
  });

  test('kbCategoryCount uses bullet-line filter — header [LANGUE] does NOT inflate the count', async () => {
    // Phase 17 regression guard (AH-105):
    // _defaultKbIndex now starts with "[LANGUE: Réponds TOUJOURS en français]"
    // followed by N lines starting with "•". The count displayed in the system
    // prompt must equal N (the number of •-lines), NOT N+1 (which split('\n').length gives).
    vi.spyOn(memoryIntegration, 'loadContext').mockResolvedValue(EMPTY_MEMORY_CONTEXT);
    vi.spyOn(memoryIntegration, 'loadPreferences').mockReturnValue([]);
    vi.spyOn(memoryIntegration, 'saveInteraction').mockResolvedValue(undefined);

    // Simulate the Phase 17 compact index format: header + 3 category lines
    const mockCompactIndex =
      '[LANGUE: Réponds TOUJOURS en français]\n' +
      '• system_architecture: Architecture cœur TITANE∞\n' +
      '• synchronisation_orchestration: Pipeline OMEGA, sélection provider\n' +
      '• memory_system_deep: Architecture mémoire STM/MTM/LTM';

    vi.spyOn(defaultKnowledgeBase, 'getCompactIndex').mockResolvedValue(mockCompactIndex);
    vi.spyOn(defaultKnowledgeBase, 'getRelevantPromptContext').mockResolvedValue('');

    const backendSpy = vi
      .spyOn(chatEngineCommands, 'generateResponse')
      .mockResolvedValue({
        content: 'Réponse KB count test',
        provider: 'ollama',
        conversationId: 'conv-kbcount',
        messageId: 'msg-kbcount',
        timestamp: Date.now(),
        tokenCount: 10,
        latencyMs: 5,
      });

    await chatEngine.generate('Parle-moi de la synchronisation OMEGA', []);

    expect(backendSpy).toHaveBeenCalledTimes(1);
    const systemPrompt = backendSpy.mock.calls[0]?.[0]?.systemPrompt ?? '';

    // The system prompt must show "3 catégories", NOT "4 catégories"
    // (4 would be the off-by-one error: 3 bullet lines + 1 header line)
    expect(systemPrompt).toContain('3 catégories');
    expect(systemPrompt).not.toContain('4 catégories');
  });

  test('kbCategoryCount shows correct count when compact index has no header (legacy format)', async () => {
    vi.spyOn(memoryIntegration, 'loadContext').mockResolvedValue(EMPTY_MEMORY_CONTEXT);
    vi.spyOn(memoryIntegration, 'loadPreferences').mockReturnValue([]);
    vi.spyOn(memoryIntegration, 'saveInteraction').mockResolvedValue(undefined);

    // Legacy format: no [LANGUE] header, just bullet lines
    const legacyIndex =
      '• system_architecture: Architecture cœur TITANE∞\n' +
      '• memory_system_deep: Architecture mémoire STM/MTM/LTM';

    vi.spyOn(defaultKnowledgeBase, 'getCompactIndex').mockResolvedValue(legacyIndex);
    vi.spyOn(defaultKnowledgeBase, 'getRelevantPromptContext').mockResolvedValue('');

    const backendSpy = vi
      .spyOn(chatEngineCommands, 'generateResponse')
      .mockResolvedValue({
        content: 'Réponse legacy test',
        provider: 'ollama',
        conversationId: 'conv-legacy',
        messageId: 'msg-legacy',
        timestamp: Date.now(),
        tokenCount: 10,
        latencyMs: 5,
      });

    await chatEngine.generate('Architecture TITANE', []);

    const systemPrompt = backendSpy.mock.calls[0]?.[0]?.systemPrompt ?? '';
    // 2 bullet lines → "2 catégories"
    expect(systemPrompt).toContain('2 catégories');
  });

  test('kbBlock is not injected when compact index is empty', async () => {
    vi.spyOn(memoryIntegration, 'loadContext').mockResolvedValue(EMPTY_MEMORY_CONTEXT);
    vi.spyOn(memoryIntegration, 'loadPreferences').mockReturnValue([]);
    vi.spyOn(memoryIntegration, 'saveInteraction').mockResolvedValue(undefined);
    vi.spyOn(defaultKnowledgeBase, 'getCompactIndex').mockResolvedValue('');
    vi.spyOn(defaultKnowledgeBase, 'getRelevantPromptContext').mockResolvedValue('');

    const backendSpy = vi
      .spyOn(chatEngineCommands, 'generateResponse')
      .mockResolvedValue({
        content: 'Réponse vide-kb test',
        provider: 'ollama',
        conversationId: 'conv-emptykb',
        messageId: 'msg-emptykb',
        timestamp: Date.now(),
        tokenCount: 10,
        latencyMs: 5,
      });

    await chatEngine.generate('Test sans KB', []);

    const systemPrompt = backendSpy.mock.calls[0]?.[0]?.systemPrompt ?? '';
    expect(systemPrompt).not.toContain('catégories');
    expect(systemPrompt).not.toContain('Base de connaissances intégrée');
  });
});
