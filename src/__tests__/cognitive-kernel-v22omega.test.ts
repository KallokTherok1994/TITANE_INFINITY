// @ts-nocheck
/**
 * TITANE∞ v22Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v22Ω — COGNITIVE KERNEL VALIDATION TESTS
 *   Tests unitaires pour le noyau cognitif
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { cognitiveKernel } from '@/services/ai/cognitiveKernel';

describe('Cognitive Kernel v22Ω — Phase A: Champ Cognitif Local', () => {
  beforeEach(() => {
    cognitiveKernel.initialize();
  });

  test('1️⃣ Kernel initialise correctement', () => {
    const principles = cognitiveKernel.getPrinciples();

    expect(principles).toBeDefined();
    expect(principles.clarity).toBe(100);
    expect(principles.robustness).toBe(100);
    expect(principles.coherence).toBe(100);
    expect(principles.parsimony).toBe(100);
    expect(principles.adaptation).toBe(100);
    expect(principles.continuity).toBe(100);
  });

  test('2️⃣ Principes cognitifs sont bien définis', () => {
    const principles = cognitiveKernel.getPrinciples();

    expect(Object.keys(principles)).toHaveLength(6);
    Object.values(principles).forEach(value => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });
});

describe('Cognitive Kernel v22Ω — Phase B: États Cognitifs', () => {
  beforeEach(() => {
    cognitiveKernel.initialize();
  });

  test('3️⃣ Mise à jour état environnement', () => {
    cognitiveKernel.updateEnvironmentState({
      averageLatency: 1500,
      responseQuality: 85,
      errorFrequency: 2,
      chatStability: 95,
    });

    const report = cognitiveKernel.getCognitiveReport();
    expect(report.environment.averageLatency).toBe(1500);
    expect(report.environment.responseQuality).toBe(85);
    expect(report.environment.chatStability).toBe(95);
  });

  test('4️⃣ Mise à jour état intention', () => {
    cognitiveKernel.updateIntentionState({
      goal: 'best-response',
      priority: 'quality',
      avoidErrors: true,
    });

    const report = cognitiveKernel.getCognitiveReport();
    expect(report.intention.goal).toBe('best-response');
    expect(report.intention.priority).toBe('quality');
    expect(report.intention.avoidErrors).toBe(true);
  });

  test('5️⃣ Enregistrement mémoire éphémère (providers)', () => {
    cognitiveKernel.recordInMemory('provider', { provider: 'openai' });
    cognitiveKernel.recordInMemory('provider', { provider: 'claude' });

    const report = cognitiveKernel.getCognitiveReport();
    expect(report.memory.recentProviders).toContain('openai');
    expect(report.memory.recentProviders).toContain('claude');
    expect(report.memory.recentProviders.length).toBeLessThanOrEqual(5);
  });

  test('6️⃣ Enregistrement mémoire éphémère (erreurs)', () => {
    cognitiveKernel.recordInMemory('error', { pattern: 'timeout' });
    cognitiveKernel.recordInMemory('error', { pattern: 'timeout' });
    cognitiveKernel.recordInMemory('error', { pattern: 'network' });

    const report = cognitiveKernel.getCognitiveReport();
    expect(report.memory.errorPatterns).toBeGreaterThan(0);
  });
});

describe('Cognitive Kernel v22Ω — Phase C: Processus Cognitif', () => {
  beforeEach(() => {
    cognitiveKernel.initialize();
    cognitiveKernel.updateEnvironmentState({
      providerHealth: new Map([
        ['openai', 90],
        ['claude', 85],
        ['gemini', 80],
      ]),
      averageLatency: 2000,
      responseQuality: 90,
      errorFrequency: 1,
      chatStability: 95,
      governanceStatus: 'configured',
    });
  });

  test('7️⃣ Processus cognitif exécute correctement', () => {
    const decision = cognitiveKernel.executeCognitiveProcess({
      message: 'Test message',
      providers: ['openai', 'claude', 'gemini'],
      metrics: { totalRequests: 10, successRate: 90 },
    });

    expect(decision).toBeDefined();
    expect(decision.provider).toBeDefined();
    expect(decision.reason).toBeDefined();
    expect(decision.confidence).toBeGreaterThanOrEqual(0);
    expect(decision.confidence).toBeLessThanOrEqual(100);
    expect(Array.isArray(decision.alternatives)).toBe(true);
    expect(Array.isArray(decision.adaptations)).toBe(true);
  });

  test('8️⃣ Décision cognitive privilégie providers sains', () => {
    const decision = cognitiveKernel.executeCognitiveProcess({
      message: 'Test',
      providers: ['openai', 'claude', 'gemini'],
      metrics: {},
    });

    // OpenAI a la meilleure santé (90), devrait être choisi ou dans les alternatives
    const allProviders = [decision.provider, ...decision.alternatives];
    expect(allProviders).toContain('openai');
  });

  test('9️⃣ Score de cohérence calculé correctement', () => {
    const decision = cognitiveKernel.executeCognitiveProcess({
      message: 'Test',
      providers: ['openai'],
      metrics: {},
    });

    expect(decision.coherenceScore).toBeGreaterThanOrEqual(0);
    expect(decision.coherenceScore).toBeLessThanOrEqual(100);
  });
});

describe('Cognitive Kernel v22Ω — Phase D: Cohérence Transversale', () => {
  test('🔟 Harmonisation messages chat', () => {
    const messages = [
      { role: 'user' as const, content: 'Bonjour  ', timestamp: Date.now() },
      { role: 'assistant' as const, content: 'Salut', timestamp: Date.now() },
    ];

    const harmonized = cognitiveKernel.harmonizeChatMessages(messages);

    expect(harmonized).toHaveLength(2);
    expect(harmonized[0].content).toBe('Bonjour.'); // Trimmed + punctuation
    expect(harmonized[0].metadata?.structured).toBe(true);
    expect(harmonized[0].metadata?.coherenceScore).toBeDefined();
  });

  test('1️⃣1️⃣ Harmonisation erreurs', () => {
    const error = new Error('Connection timeout after 5000ms');
    const harmonized = cognitiveKernel.harmonizeError(error);

    expect(harmonized.type).toBe('timeout');
    expect(harmonized.userFriendly).toBe(true);
    expect(harmonized.recovery).toBeDefined();
    expect(harmonized.message).toBeDefined();
  });

  test('1️⃣2️⃣ Classification erreurs correcte', () => {
    const errors = [
      { message: 'Rate limit exceeded', expectedType: 'rate-limit' },
      { message: 'Network connection failed', expectedType: 'network' },
      { message: 'Invalid API key', expectedType: 'auth' },
      { message: 'Request timeout', expectedType: 'timeout' },
    ];

    errors.forEach(({ message, expectedType }) => {
      const harmonized = cognitiveKernel.harmonizeError(new Error(message));
      expect(harmonized.type).toBe(expectedType);
    });
  });
});

describe('Cognitive Kernel v22Ω — Phase E: Auto-Optimisation', () => {
  beforeEach(() => {
    cognitiveKernel.initialize();
    cognitiveKernel.updateEnvironmentState({
      providerHealth: new Map([['openai', 70]]),
      averageLatency: 2000,
      responseQuality: 80,
      errorFrequency: 2,
      chatStability: 85,
      governanceStatus: 'configured',
    });
  });

  test('1️⃣3️⃣ Mise à jour préférences providers (succès)', () => {
    cognitiveKernel.updateProviderPreferences('openai', true, 1500);

    const report = cognitiveKernel.getCognitiveReport();
    const openaiHealth = report.environment.providerHealth.get('openai');
    expect(openaiHealth).toBeGreaterThan(70); // Augmenté après succès
  });

  test('1️⃣4️⃣ Mise à jour préférences providers (échec)', () => {
    cognitiveKernel.updateProviderPreferences('openai', false, 5000);

    const report = cognitiveKernel.getCognitiveReport();
    const openaiHealth = report.environment.providerHealth.get('openai');
    expect(openaiHealth).toBeLessThan(70); // Diminué après échec
  });

  test('1️⃣5️⃣ Auto-simplification fonctionne', () => {
    // Ajouter des adaptations anciennes
    cognitiveKernel.recordInMemory('adaptation', { type: 'test', impact: 5 });

    const simplifications = cognitiveKernel.autoSimplify();
    expect(Array.isArray(simplifications)).toBe(true);
  });
});

describe('Cognitive Kernel v22Ω — Phase F: Validation Cognitive', () => {
  test('1️⃣6️⃣ Validation santé cognitive', () => {
    cognitiveKernel.initialize();
    cognitiveKernel.updateEnvironmentState({
      providerHealth: new Map([
        ['openai', 80],
        ['claude', 75],
      ]),
      averageLatency: 2000,
      responseQuality: 85,
      errorFrequency: 2,
      chatStability: 90,
      governanceStatus: 'configured',
    });

    const health = cognitiveKernel.validateCognitiveHealth();

    expect(health.thinking).toBeDefined();
    expect(health.behaving).toBeDefined();
    expect(health.stable).toBeDefined();
    expect(Array.isArray(health.issues)).toBe(true);
  });

  test('1️⃣7️⃣ Rapport cognitif complet', () => {
    cognitiveKernel.initialize();

    const report = cognitiveKernel.getCognitiveReport();

    expect(report.principles).toBeDefined();
    expect(report.environment).toBeDefined();
    expect(report.intention).toBeDefined();
    expect(report.memory).toBeDefined();
    expect(report.health).toBeDefined();
    expect(report.coherenceScore).toBeDefined();

    expect(report.coherenceScore).toBeGreaterThanOrEqual(0);
    expect(report.coherenceScore).toBeLessThanOrEqual(100);
  });

  test('1️⃣8️⃣ Rapport mémoire contient données correctes', () => {
    cognitiveKernel.initialize();
    cognitiveKernel.recordInMemory('provider', { provider: 'openai' });
    cognitiveKernel.recordInMemory('error', { pattern: 'timeout' });
    cognitiveKernel.recordInMemory('adaptation', { type: 'test', impact: 5 });

    const report = cognitiveKernel.getCognitiveReport();

    expect(report.memory.recentProviders.length).toBeGreaterThan(0);
    expect(report.memory.errorPatterns).toBeGreaterThan(0);
    expect(report.memory.adaptations).toBeGreaterThan(0);
  });
});
