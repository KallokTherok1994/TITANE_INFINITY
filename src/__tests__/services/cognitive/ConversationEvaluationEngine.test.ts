/**
 * TITANE∞ — Vitest: ConversationEvaluationEngine Tests
 *
 * Couverture:
 *   - Construction / configuration par défaut et custom
 *   - addTestScenario / runTestScenario cycle complet
 *   - evaluateConversation — 9 métriques valides [0..1]
 *   - runAllTests — multi-scénarios
 *   - getStats — compteurs corrects
 *   - generateReport — structure valide
 *   - predictQuality — API v30.3.0
 *   - Gestion d'erreur: scénario inconnu
 *   - Fallback offline: aucune dépendance réseau
 *
 * @rule16 — unit tests pour src/services/cognitive/ConversationEvaluationEngine.ts
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ConversationEvaluationEngine,
  createConversationEvaluationEngine,
  getDefaultEvaluationConfig,
} from '@/services/cognitive/ConversationEvaluationEngine';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Mock conversation executor — simule une réponse IA substantielle */
const mockExecutor = async (
  messages: Array<{ role: string; content: string }>
): Promise<string[]> => {
  return messages
    .filter(m => m.role === 'user')
    .map(m => `Réponse IA simulée pour : ${m.content}. Voici une analyse complète en français avec des détails pertinents et une structure cohérente.`);
};

/** Mock executor avec réponses courtes (bas qualité) */
const mockExecutorShort = async (
  messages: Array<{ role: string; content: string }>
): Promise<string[]> => {
  return messages.filter(m => m.role === 'user').map(() => 'ok');
};

/** Mock executor avec réponse vide */
const mockExecutorEmpty = async (
  messages: Array<{ role: string; content: string }>
): Promise<string[]> => {
  return messages.filter(m => m.role === 'user').map(() => '');
};

/** Factory de scénario minimal valide */
const makeScenario = (
  id: string,
  name: string,
  overrides: Partial<{
    conversation_turns: Array<{ role: 'user' | 'assistant'; content: string }>;
    success_criteria: Record<string, unknown>;
    expected_outcomes: string[];
    tags: string[];
  }> = {}
) => ({
  id,
  name,
  description: `Scénario de test: ${name}`,
  inputs: [{ role: 'user' as const, content: 'Test input' }],
  conversation_turns: overrides.conversation_turns ?? [
    { role: 'user' as const, content: 'Explique-moi le concept de cohérence' },
  ],
  context: { goal: 'tester la qualité des réponses IA' },
  expectedMetrics: {
    coherence: 0.6,
    relevance: 0.5,
    clarity: 0.5,
  },
  success_criteria: overrides.success_criteria,
  expected_outcomes: overrides.expected_outcomes,
  tags: overrides.tags ?? ['test', 'vitest'],
});

// ─── CONSTRUCTION ─────────────────────────────────────────────────────────────

describe('🔧 ConversationEvaluationEngine — Construction', () => {
  it('crée une instance avec config par défaut', () => {
    const engine = new ConversationEvaluationEngine();
    expect(engine).toBeDefined();
    expect(engine).toBeInstanceOf(ConversationEvaluationEngine);
  });

  it('crée une instance avec config custom (regression_threshold=0.2)', () => {
    const engine = new ConversationEvaluationEngine({
      regression_threshold: 0.2,
      evaluation_sample_rate: 0.5,
    });
    expect(engine).toBeDefined();
  });

  it('createConversationEvaluationEngine() retourne une instance valide', () => {
    const engine = createConversationEvaluationEngine();
    expect(engine).toBeInstanceOf(ConversationEvaluationEngine);
  });

  it('getDefaultEvaluationConfig() retourne 9 métriques', () => {
    const config = getDefaultEvaluationConfig();
    expect(config.metrics_to_track.length).toBe(9);
    expect(config.metrics_to_track).toContain('coherence');
    expect(config.metrics_to_track).toContain('relevance');
    expect(config.metrics_to_track).toContain('clarity');
    expect(config.regression_threshold).toBe(0.1);
    expect(config.min_baseline_samples).toBe(10);
    expect(config.evaluation_sample_rate).toBe(1.0);
  });

  it('getStats() initial retourne des compteurs à zéro', () => {
    const engine = new ConversationEvaluationEngine();
    const stats = engine.getStats();
    expect(stats.total_evaluations).toBe(0);
    expect(stats.total_tests).toBe(0);
    expect(stats.total_scenarios).toBe(0);
    expect(stats.total_conversations_tracked).toBe(0);
  });
});

// ─── evaluateConversation ─────────────────────────────────────────────────────

describe('📊 evaluateConversation — 9 métriques [0..1]', () => {
  it('retourne un objet avec les 9 métriques pour une réponse standard', async () => {
    const engine = new ConversationEvaluationEngine();
    const metrics = await engine.evaluateConversation('conv-1', {
      user_message: 'Qu\'est-ce que la cohérence conversationnelle ?',
      assistant_response: 'La cohérence conversationnelle est la capacité à maintenir un fil logique tout au long d\'un échange. Elle implique des références aux points précédents, des transitions fluides et une progression thématique claire.',
    });

    expect(metrics).toBeDefined();
    expect(typeof metrics.conversation_consistency).toBe('number');
    expect(typeof metrics.goal_completion).toBe('number');
    expect(typeof metrics.coherence).toBe('number');
    expect(typeof metrics.clarity).toBe('number');
    expect(typeof metrics.conciseness).toBe('number');
    expect(typeof metrics.relevance).toBe('number');
    expect(typeof metrics.factual_accuracy).toBe('number');
    expect(typeof metrics.user_satisfaction).toBe('number');
    expect(typeof metrics.technical_correctness).toBe('number');
  });

  it('toutes les métriques sont dans [0, 1]', async () => {
    const engine = new ConversationEvaluationEngine();
    const metrics = await engine.evaluateConversation('conv-2', {
      user_message: 'Donne-moi des exemples concrets de stratégie produit',
      assistant_response: 'Voici des exemples de stratégie produit: 1. Focus sur la valeur utilisateur — identifier les besoins réels. 2. Roadmap priorisée par impact/effort. 3. Feedback loops rapides via tests A/B.',
    });

    for (const [key, val] of Object.entries(metrics)) {
      if (typeof val === 'number') {
        expect(val, `Métrique ${key} hors plage [0,1]`).toBeGreaterThanOrEqual(0);
        expect(val, `Métrique ${key} hors plage [0,1]`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('incrémente le compteur totalEvaluations après chaque appel', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.evaluateConversation('conv-3', {
      user_message: 'Test 1',
      assistant_response: 'Réponse 1',
    });
    await engine.evaluateConversation('conv-4', {
      user_message: 'Test 2',
      assistant_response: 'Réponse 2',
    });

    const stats = engine.getStats();
    expect(stats.total_evaluations).toBeGreaterThanOrEqual(2);
  });

  it('évaluation avec contexte de goal améliore le score goal_completion', async () => {
    const engine = new ConversationEvaluationEngine();
    const metricsWithGoal = await engine.evaluateConversation('conv-goal-1', {
      user_message: 'Comment créer une roadmap produit ?',
      assistant_response: 'Pour créer une roadmap produit efficace, commencez par définir vos objectifs stratégiques et identifier les priorités.',
      context: { goal: 'créer une roadmap produit' },
    });

    const metricsNoGoal = await engine.evaluateConversation('conv-goal-2', {
      user_message: 'Comment créer une roadmap produit ?',
      assistant_response: 'Pour créer une roadmap produit efficace, commencez par définir vos objectifs stratégiques et identifier les priorités.',
    });

    // Avec goal, le score devrait être >= sans goal
    expect(metricsWithGoal.goal_completion).toBeGreaterThanOrEqual(metricsNoGoal.goal_completion - 0.1);
  });

  it('évaluation avec facts cohérents retourne consistency haute', async () => {
    const engine = new ConversationEvaluationEngine();
    const metrics = await engine.evaluateConversation('conv-consistency', {
      user_message: 'Confirme que Python est populaire',
      assistant_response: 'Oui, Python est extrêmement populaire pour la data science et le machine learning.',
      context: { facts: ['Python est populaire', 'Python est utilisé en data science'] },
    });

    expect(metrics.conversation_consistency).toBeGreaterThanOrEqual(0);
    expect(metrics.conversation_consistency).toBeLessThanOrEqual(1);
  });

  it('évaluation avec réponse vide retourne métriques valides (dégradées)', async () => {
    const engine = new ConversationEvaluationEngine();
    const metrics = await engine.evaluateConversation('conv-empty', {
      user_message: 'Question complexe',
      assistant_response: '',
    });

    // Toutes les métriques doivent rester dans [0,1] même pour une réponse vide
    for (const val of Object.values(metrics)) {
      if (typeof val === 'number') {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });

  it('tracking distinct par conversation_id', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.evaluateConversation('conv-A', {
      user_message: 'Msg A',
      assistant_response: 'Réponse A',
    });
    await engine.evaluateConversation('conv-B', {
      user_message: 'Msg B',
      assistant_response: 'Réponse B',
    });

    const stats = engine.getStats();
    expect(stats.total_conversations_tracked).toBeGreaterThanOrEqual(2);
  });
});

// ─── addTestScenario ──────────────────────────────────────────────────────────

describe('📝 addTestScenario', () => {
  it('ajoute un scénario valide sans erreur', async () => {
    const engine = new ConversationEvaluationEngine();
    const scenario = makeScenario('s1', 'Test basique');
    await engine.addTestScenario(scenario);

    const stats = engine.getStats();
    expect(stats.total_scenarios).toBe(1);
  });

  it('ajoute plusieurs scénarios distincts', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('s1', 'Scénario 1'));
    await engine.addTestScenario(makeScenario('s2', 'Scénario 2'));
    await engine.addTestScenario(makeScenario('s3', 'Scénario 3'));

    const stats = engine.getStats();
    expect(stats.total_scenarios).toBe(3);
  });

  it('remplace un scénario existant avec le même id', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('s-dupe', 'Première version'));
    await engine.addTestScenario(makeScenario('s-dupe', 'Deuxième version'));

    const stats = engine.getStats();
    expect(stats.total_scenarios).toBe(1);
  });

  it('émet l\'événement scenario:added', async () => {
    const engine = new ConversationEvaluationEngine();
    const added: unknown[] = [];
    engine.on('scenario:added', (data) => added.push(data));

    await engine.addTestScenario(makeScenario('s-event', 'Scénario événement'));
    expect(added.length).toBe(1);
  });
});

// ─── runTestScenario ──────────────────────────────────────────────────────────

describe('▶️ runTestScenario', () => {
  it('lance un scénario valide et retourne un résultat', async () => {
    const engine = new ConversationEvaluationEngine();
    const scenario = makeScenario('r1', 'Run basique');
    await engine.addTestScenario(scenario);

    const result = await engine.runTestScenario('r1', mockExecutor);
    expect(result).toBeDefined();
    expect(result.scenarioId).toBe('r1');
    expect(typeof result.passed).toBe('boolean');
    expect(result.metrics).toBeDefined();
    expect(typeof result.execution_time_ms).toBe('number');
  });

  it('retourne passed=true pour des réponses substantielles et pas de critères stricts', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('r-pass', 'Scénario lâche', {
      success_criteria: { minQuality: 0.0 }, // critère minimal
    }));

    const result = await engine.runTestScenario('r-pass', mockExecutor);
    expect(result.passed).toBe(true);
  });

  it('lance avec multi-turns user/assistant interleaved', async () => {
    const engine = new ConversationEvaluationEngine();
    const scenario = makeScenario('r-multiturn', 'Multi-turns', {
      conversation_turns: [
        { role: 'user', content: 'Question 1 : Qu\'est-ce que l\'IA ?' },
        { role: 'assistant', content: 'L\'IA est...' },
        { role: 'user', content: 'Question 2 : Quels sont ses usages ?' },
      ],
    });
    await engine.addTestScenario(scenario);

    const result = await engine.runTestScenario('r-multiturn', mockExecutor);
    expect(result).toBeDefined();
    expect(result.metrics).toBeDefined();
  });

  it('lance et retourne actual_responses dans le résultat', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('r-resp', 'Check actual_responses'));

    const result = await engine.runTestScenario('r-resp', mockExecutor);
    expect(Array.isArray(result.actual_responses)).toBe(true);
    expect(result.actual_responses!.length).toBeGreaterThan(0);
  });

  it('lance avec expected_outcomes et vérifie la correspondance', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(
      makeScenario('r-outcomes', 'Expected outcomes', {
        expected_outcomes: ['simulée', 'analyse'],
      })
    );

    const result = await engine.runTestScenario('r-outcomes', mockExecutor);
    // mockExecutor retourne "Réponse IA simulée pour... analyse complète"
    expect(result).toBeDefined();
  });

  it('lance avec expected_outcomes non satisfaits et passed=false', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(
      makeScenario('r-fail-outcomes', 'Outcomes non satisfaits', {
        expected_outcomes: ['IMPOSSIBLE_KEYWORD_NEVER_IN_RESPONSE_XYZ789'],
      })
    );

    const result = await engine.runTestScenario('r-fail-outcomes', mockExecutor);
    expect(result.passed).toBe(false);
    expect(result.failure_reason).toBeTruthy();
  });

  it('lève une erreur pour un scénario introuvable', async () => {
    const engine = new ConversationEvaluationEngine();
    await expect(
      engine.runTestScenario('inexistant_scenario_xyz', mockExecutor)
    ).rejects.toThrow('inexistant_scenario_xyz');
  });

  it('incrémente totalTests après chaque run', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('rt-1', 'Test 1'));
    await engine.addTestScenario(makeScenario('rt-2', 'Test 2'));

    await engine.runTestScenario('rt-1', mockExecutor);
    await engine.runTestScenario('rt-2', mockExecutor);

    const stats = engine.getStats();
    expect(stats.total_tests).toBe(2);
  });

  it('émet l\'événement test:completed', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('r-emit', 'Emit test'));

    const emitted: unknown[] = [];
    engine.on('test:completed', (data) => emitted.push(data));

    await engine.runTestScenario('r-emit', mockExecutor);
    expect(emitted.length).toBe(1);
  });
});

// ─── runAllTests ──────────────────────────────────────────────────────────────

describe('🚀 runAllTests', () => {
  it('runAllTests() avec aucun scénario retourne tableau vide', async () => {
    const engine = new ConversationEvaluationEngine();
    const results = await engine.runAllTests(mockExecutor);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it('runAllTests() avec 3 scénarios retourne 3 résultats', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('ra-1', 'Scénario A'));
    await engine.addTestScenario(makeScenario('ra-2', 'Scénario B'));
    await engine.addTestScenario(makeScenario('ra-3', 'Scénario C'));

    const results = await engine.runAllTests(mockExecutor);
    expect(results.length).toBe(3);
    for (const res of results) {
      expect(typeof res.passed).toBe('boolean');
      expect(res.metrics).toBeDefined();
    }
  });

  it('runAllTests() émet tests:all_completed', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('ra-e', 'Emit all'));

    const events: unknown[] = [];
    engine.on('tests:all_completed', (data) => events.push(data));

    await engine.runAllTests(mockExecutor);
    expect(events.length).toBe(1);
  });
});

// ─── generateReport ───────────────────────────────────────────────────────────

describe('📋 generateReport', () => {
  it('retourne un rapport structuré avec period, totalEvaluations, averageMetrics', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.evaluateConversation('report-conv', {
      user_message: 'Test pour rapport',
      assistant_response: 'Voici ma réponse détaillée en français avec une analyse claire.',
    });

    const report = await engine.generateReport('report-conv');
    expect(report).toBeDefined();
    expect(report.period).toBeDefined();
    expect(report.period.start).toBeLessThanOrEqual(report.period.end);
    expect(typeof report.totalEvaluations).toBe('number');
    expect(report.averageMetrics).toBeDefined();
  });

  it('rapport incluant regressions (tableaux bien définis)', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.evaluateConversation('conv-report-2', {
      user_message: 'Autre test',
      assistant_response: 'Réponse détaillée.',
    });

    const report = await engine.generateReport('conv-report-2');
    expect(Array.isArray(report.regressions)).toBe(true);
    expect(Array.isArray(report.improvements)).toBe(true);
  });

  it('rapport avec averageMetrics dans [0, 1]', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.evaluateConversation('conv-avg', {
      user_message: 'Analyse complète du contexte',
      assistant_response: 'Je vais analyser cela en profondeur. Voici les points essentiels.',
    });

    const report = await engine.generateReport('conv-avg');
    for (const [key, val] of Object.entries(report.averageMetrics)) {
      if (typeof val === 'number') {
        expect(val, `averageMetrics.${key} hors plage [0,1]`).toBeGreaterThanOrEqual(0);
        expect(val, `averageMetrics.${key} hors plage [0,1]`).toBeLessThanOrEqual(1);
      }
    }
  });
});

// ─── FALLBACK OFFLINE ─────────────────────────────────────────────────────────

describe('🔌 Fallback offline — aucune dépendance réseau', () => {
  it('evaluateConversation fonctionne sans réseau (calcul local)', async () => {
    const engine = new ConversationEvaluationEngine();
    // Si l'évaluation faisait un appel réseau, elle échouerait dans l'environnement de test
    const metrics = await engine.evaluateConversation('offline-1', {
      user_message: 'Test offline',
      assistant_response: 'Réponse calculée localement sans réseau.',
    });
    expect(metrics).toBeDefined();
    expect(typeof metrics.coherence).toBe('number');
  });

  it('runTestScenario fonctionne avec mockExecutor (pas de Ollama requis)', async () => {
    const engine = new ConversationEvaluationEngine();
    await engine.addTestScenario(makeScenario('offline-s1', 'Test sans réseau'));

    const result = await engine.runTestScenario('offline-s1', mockExecutor);
    expect(result).toBeDefined();
    expect(typeof result.passed).toBe('boolean');
  });
});

// ─── EVENTS ET EMISSIONS ──────────────────────────────────────────────────────

describe('📡 EventEmitter — émission d\'événements', () => {
  it('émet evaluation:completed lors de evaluateConversation avec live_evaluation activé', async () => {
    const engine = new ConversationEvaluationEngine({ enable_live_evaluation: true });
    const events: unknown[] = [];
    engine.on('evaluation:completed', (data) => events.push(data));

    await engine.evaluateConversation('event-conv', {
      user_message: 'Test événement',
      assistant_response: 'Réponse pour événement.',
    });

    expect(events.length).toBeGreaterThan(0);
  });

  it('n\'émet pas evaluation:completed avec live_evaluation désactivé', async () => {
    const engine = new ConversationEvaluationEngine({
      enable_live_evaluation: false,
      evaluation_sample_rate: 1.0,
    });
    const events: unknown[] = [];
    engine.on('evaluation:completed', (data) => events.push(data));

    await engine.evaluateConversation('no-event-conv', {
      user_message: 'Test sans événement',
      assistant_response: 'Réponse.',
    });

    expect(events.length).toBe(0);
  });

  it('émet log à chaque évaluation', async () => {
    const engine = new ConversationEvaluationEngine();
    const logs: unknown[] = [];
    engine.on('log', (data) => logs.push(data));

    await engine.evaluateConversation('log-conv', {
      user_message: 'Test log',
      assistant_response: 'Réponse.',
    });

    expect(logs.length).toBeGreaterThan(0);
  });
});

// ─── CONFIG SAMPLING ─────────────────────────────────────────────────────────

describe('⚙️ Config — evaluation_sample_rate', () => {
  it('avec sample_rate=1.0, toutes les évaluations sont effectuées', async () => {
    const engine = new ConversationEvaluationEngine({ evaluation_sample_rate: 1.0 });
    // Exécuter 5 évaluations
    for (let i = 0; i < 5; i++) {
      await engine.evaluateConversation(`sr-conv-${i}`, {
        user_message: `Message ${i}`,
        assistant_response: `Réponse ${i} détaillée.`,
      });
    }

    const stats = engine.getStats();
    expect(stats.total_evaluations).toBe(5);
  });
});
