/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Tests Complets
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        evolutionEngine.test.ts
 * @version     vΩ∞
 */

import { describe, it, expect, vi } from 'vitest';
import type {
  EvolutionDataPoint,
  EvolutionPattern,
  EvolutionSuggestion,
  EvolutionAction,
  RiskLevel,
  TrendDirection,
  GovernanceRole,
  SuggestionStatus,
  ActionResult,
  EvolutionActionType,
  TitaneModule
} from '../../services/evolutionEngine/evolutionEngine.config';

import {
  generateEvolutionId,
  scoreToGrade,
  determineTrend,
  determineRiskLevel,
  hasPermission,
  isActionWhitelisted,
  createHistoryEntry,
  createDataPoint,
  createSuggestion,
  createAction,
  DEFAULT_EVOLUTION_ENGINE_CONFIG,
  DEFAULT_COLLECTOR_CONFIG,
  DEFAULT_ANALYZER_CONFIG,
  DEFAULT_PLANNER_CONFIG,
  DEFAULT_EXECUTOR_CONFIG,
  DEFAULT_ACTION_WHITELIST,
  DEFAULT_VALIDATION_POLICIES,
  RISK_LEVEL_COLORS,
  TREND_COLORS
} from '../../services/evolutionEngine/evolutionEngine.config';

// Mocks
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({})
}));

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS - CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('EVOLUTION ENGINE — Configuration', () => {
  describe('Configuration par défaut', () => {
    it('devrait avoir une configuration globale valide', () => {
      expect(DEFAULT_EVOLUTION_ENGINE_CONFIG).toBeDefined();
      expect(DEFAULT_EVOLUTION_ENGINE_CONFIG.enabled).toBe(true);
      expect(DEFAULT_EVOLUTION_ENGINE_CONFIG.collector).toBeDefined();
      expect(DEFAULT_EVOLUTION_ENGINE_CONFIG.analyzer).toBeDefined();
      expect(DEFAULT_EVOLUTION_ENGINE_CONFIG.planner).toBeDefined();
      expect(DEFAULT_EVOLUTION_ENGINE_CONFIG.executor).toBeDefined();
    });

    it('devrait avoir une configuration Collector valide', () => {
      expect(DEFAULT_COLLECTOR_CONFIG).toBeDefined();
      expect(DEFAULT_COLLECTOR_CONFIG.enabled).toBe(true);
      expect(DEFAULT_COLLECTOR_CONFIG.collectInterval).toBeGreaterThan(0);
      expect(DEFAULT_COLLECTOR_CONFIG.batchSize).toBeGreaterThan(0);
      expect(DEFAULT_COLLECTOR_CONFIG.maxDataPoints).toBeGreaterThan(0);
      expect(DEFAULT_COLLECTOR_CONFIG.categories.length).toBeGreaterThan(0);
    });

    it('devrait avoir une configuration Analyzer valide', () => {
      expect(DEFAULT_ANALYZER_CONFIG).toBeDefined();
      expect(DEFAULT_ANALYZER_CONFIG.enabled).toBe(true);
      expect(DEFAULT_ANALYZER_CONFIG.analyzeInterval).toBeGreaterThan(0);
      expect(DEFAULT_ANALYZER_CONFIG.minDataPointsForAnalysis).toBeGreaterThan(0);
    });

    it('devrait avoir une configuration Planner valide', () => {
      expect(DEFAULT_PLANNER_CONFIG).toBeDefined();
      expect(DEFAULT_PLANNER_CONFIG.enabled).toBe(true);
      expect(DEFAULT_PLANNER_CONFIG.planInterval).toBeGreaterThan(0);
      expect(DEFAULT_PLANNER_CONFIG.maxSuggestionsPerCycle).toBeGreaterThan(0);
    });

    it('devrait avoir une configuration Executor valide', () => {
      expect(DEFAULT_EXECUTOR_CONFIG).toBeDefined();
      expect(DEFAULT_EXECUTOR_CONFIG.enabled).toBe(true);
      expect(DEFAULT_EXECUTOR_CONFIG.maxConcurrentActions).toBeGreaterThan(0);
      expect(DEFAULT_EXECUTOR_CONFIG.defaultTimeout).toBeGreaterThan(0);
    });
  });

  describe('Whitelist des actions', () => {
    it('devrait avoir une whitelist non vide', () => {
      expect(DEFAULT_ACTION_WHITELIST).toBeDefined();
      expect(DEFAULT_ACTION_WHITELIST.length).toBeGreaterThan(0);
    });

    it('chaque entrée whitelist devrait avoir les champs requis', () => {
      for (const entry of DEFAULT_ACTION_WHITELIST) {
        expect(entry.actionType).toBeDefined();
        expect(entry.allowedTargets).toBeDefined();
        expect(entry.allowedTargets.length).toBeGreaterThan(0);
        expect(entry.maxRisk).toBeDefined();
        expect(entry.requiredRole).toBeDefined();
        expect(entry.cooldownMs).toBeGreaterThanOrEqual(0);
        expect(entry.dailyLimit).toBeGreaterThan(0);
      }
    });
  });

  describe('Politiques de validation', () => {
    it('devrait avoir des politiques définies', () => {
      expect(DEFAULT_VALIDATION_POLICIES).toBeDefined();
      expect(DEFAULT_VALIDATION_POLICIES.length).toBeGreaterThan(0);
    });

    it('chaque politique devrait avoir les champs requis', () => {
      for (const policy of DEFAULT_VALIDATION_POLICIES) {
        expect(policy.id).toBeDefined();
        expect(policy.name).toBeDefined();
        expect(policy.requiredRole).toBeDefined();
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS - FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

describe('EVOLUTION ENGINE — Fonctions Utilitaires', () => {
  describe('generateEvolutionId', () => {
    it('devrait générer des IDs uniques', () => {
      const id1 = generateEvolutionId('test');
      const id2 = generateEvolutionId('test');
      expect(id1).not.toBe(id2);
    });

    it('devrait inclure le préfixe avec underscore', () => {
      const id = generateEvolutionId('pattern');
      expect(id.startsWith('pattern_')).toBe(true);
    });

    it('devrait générer des IDs de longueur suffisante', () => {
      const id = generateEvolutionId('data');
      expect(id.length).toBeGreaterThan(10);
    });
  });

  describe('scoreToGrade', () => {
    it('devrait retourner S pour >= 95', () => {
      expect(scoreToGrade(95)).toBe('S');
      expect(scoreToGrade(100)).toBe('S');
    });

    it('devrait retourner A pour >= 85 et < 95', () => {
      expect(scoreToGrade(85)).toBe('A');
      expect(scoreToGrade(94)).toBe('A');
    });

    it('devrait retourner B pour >= 70 et < 85', () => {
      expect(scoreToGrade(70)).toBe('B');
      expect(scoreToGrade(84)).toBe('B');
    });

    it('devrait retourner C pour >= 55 et < 70', () => {
      expect(scoreToGrade(55)).toBe('C');
      expect(scoreToGrade(69)).toBe('C');
    });

    it('devrait retourner D pour >= 40 et < 55', () => {
      expect(scoreToGrade(40)).toBe('D');
      expect(scoreToGrade(54)).toBe('D');
    });

    it('devrait retourner F pour < 40', () => {
      expect(scoreToGrade(0)).toBe('F');
      expect(scoreToGrade(39)).toBe('F');
    });
  });

  describe('determineTrend', () => {
    // determineTrend nécessite au moins windowSize*2 échantillons pour comparer deux fenêtres
    // windowSize par défaut = 10, donc il faut 20 échantillons minimum

    it('devrait détecter IMPROVING quand les valeurs augmentent significativement', () => {
      // 20 échantillons: 10 anciens bas, 10 récents hauts
      const samples = [
        50, 51, 52, 50, 51, 49, 50, 52, 51, 50, // anciens ~50
        80, 82, 81, 83, 80, 79, 82, 81, 80, 81  // récents ~81 (+60%)
      ];
      const trend = determineTrend(samples);
      expect(trend).toBe('IMPROVING');
    });

    it('devrait détecter DEGRADING quand les valeurs diminuent significativement', () => {
      const samples = [
        80, 82, 81, 83, 80, 79, 82, 81, 80, 81, // anciens ~81
        50, 51, 52, 50, 51, 49, 50, 52, 51, 50  // récents ~50 (-38%)
      ];
      const trend = determineTrend(samples);
      expect(trend).toBe('DEGRADING');
    });

    it('devrait détecter STABLE quand les valeurs sont constantes', () => {
      const samples = [
        50, 51, 49, 50, 52, 51, 50, 49, 51, 50,
        50, 52, 51, 49, 50, 51, 50, 49, 52, 50
      ];
      const trend = determineTrend(samples);
      expect(trend).toBe('STABLE');
    });

    it('devrait détecter VOLATILE quand les valeurs fluctuent beaucoup', () => {
      // Haute volatilité: écart-type élevé par rapport à la moyenne
      const samples = [
        50, 51, 50, 52, 51, 50, 49, 51, 50, 52, // anciens stables
        20, 90, 25, 85, 30, 80, 22, 88, 28, 82  // récents très volatils
      ];
      const trend = determineTrend(samples);
      expect(trend).toBe('VOLATILE');
    });

    it('devrait retourner STABLE pour échantillons insuffisants', () => {
      // Moins de windowSize (10) échantillons
      const trend = determineTrend([1, 2, 3, 4, 5]);
      expect(trend).toBe('STABLE');
    });

    it('devrait gérer un échantillon vide', () => {
      const trend = determineTrend([]);
      expect(trend).toBe('STABLE');
    });
  });

  describe('determineRiskLevel', () => {
    it('devrait retourner CRITICAL pour beaucoup de modules affectés', () => {
      expect(determineRiskLevel(4, 60, true)).toBe('CRITICAL');
    });

    it('devrait retourner HIGH pour impact élevé ou non-réversible', () => {
      expect(determineRiskLevel(3, 35, true)).toBe('HIGH');
      expect(determineRiskLevel(1, 10, false)).toBe('HIGH');
    });

    it('devrait retourner MEDIUM pour impact modéré', () => {
      expect(determineRiskLevel(2, 20, true)).toBe('MEDIUM');
    });

    it('devrait retourner LOW pour impact faible', () => {
      expect(determineRiskLevel(1, 10, true)).toBe('LOW');
    });
  });

  describe('hasPermission', () => {
    it('ADMIN devrait avoir toutes les permissions', () => {
      expect(hasPermission('ADMIN', 'ADMIN')).toBe(true);
      expect(hasPermission('ADMIN', 'DEV')).toBe(true);
      expect(hasPermission('ADMIN', 'USER')).toBe(true);
    });

    it('DEV devrait avoir permission DEV et USER', () => {
      expect(hasPermission('DEV', 'ADMIN')).toBe(false);
      expect(hasPermission('DEV', 'DEV')).toBe(true);
      expect(hasPermission('DEV', 'USER')).toBe(true);
    });

    it('USER devrait avoir seulement permission USER', () => {
      expect(hasPermission('USER', 'ADMIN')).toBe(false);
      expect(hasPermission('USER', 'DEV')).toBe(false);
      expect(hasPermission('USER', 'USER')).toBe(true);
    });

    it('SYSTEM devrait avoir toutes les permissions', () => {
      expect(hasPermission('SYSTEM', 'ADMIN')).toBe(true);
      expect(hasPermission('SYSTEM', 'DEV')).toBe(true);
      expect(hasPermission('SYSTEM', 'USER')).toBe(true);
    });
  });

  describe('isActionWhitelisted', () => {
    it('devrait valider une action autorisée', () => {
      const result = isActionWhitelisted(
        'ADJUST_PARAMETER',
        'performance',
        'LOW',
        DEFAULT_ACTION_WHITELIST
      );
      expect(result.allowed).toBe(true);
    });

    it('devrait rejeter une action non autorisée', () => {
      const result = isActionWhitelisted(
        'UNKNOWN_ACTION' as EvolutionActionType,
        'performance',
        'LOW',
        DEFAULT_ACTION_WHITELIST
      );
      expect(result.allowed).toBe(false);
    });

    it('devrait rejeter si le module n\'est pas autorisé', () => {
      const result = isActionWhitelisted(
        'TOGGLE_MODE',
        'admin' as TitaneModule,
        'LOW',
        DEFAULT_ACTION_WHITELIST
      );
      expect(result.allowed).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS - FACTORIES
// ═══════════════════════════════════════════════════════════════════════════════

describe('EVOLUTION ENGINE — Factories', () => {
  describe('createDataPoint', () => {
    it('devrait créer un point de données valide', () => {
      const dataPoint = createDataPoint(
        'IA_USAGE',
        'prompt',
        'queryCount',
        42,
        { source: 'test' },
        ['test']
      );

      expect(dataPoint.id).toBeDefined();
      expect(dataPoint.timestamp).toBeLessThanOrEqual(Date.now());
      expect(dataPoint.category).toBe('IA_USAGE');
      expect(dataPoint.moduleId).toBe('prompt');
      expect(dataPoint.metric).toBe('queryCount');
      expect(dataPoint.value).toBe(42);
      expect(dataPoint.tags).toContain('test');
    });

    it('devrait utiliser des valeurs par défaut pour tags', () => {
      const dataPoint = createDataPoint(
        'PERFORMANCE',
        'memory',
        'heapUsed',
        1024
      );
      expect(dataPoint.tags).toEqual([]);
    });
  });

  describe('createSuggestion', () => {
    it('devrait créer une suggestion valide', () => {
      const actions: EvolutionAction[] = [];
      const suggestion = createSuggestion(
        'OPTIMIZATION',
        'Test Suggestion',
        'Test description',
        'Test rationale',
        ['performance'],
        'LOW',
        actions
      );

      expect(suggestion.id).toBeDefined();
      expect(suggestion.createdAt).toBeLessThanOrEqual(Date.now());
      expect(suggestion.category).toBe('OPTIMIZATION');
      expect(suggestion.title).toBe('Test Suggestion');
      expect(suggestion.status).toBe('PENDING');
      expect(suggestion.rollbackAvailable).toBe(true);
    });
  });

  describe('createAction', () => {
    it('devrait créer une action valide', () => {
      const action = createAction(
        'ADJUST_PARAMETER',
        'performance',
        'Test action',
        { key: 'value' },
        'LOW',
        true
      );

      expect(action.id).toBeDefined();
      expect(action.type).toBe('ADJUST_PARAMETER');
      expect(action.targetModule).toBe('performance');
      expect(action.risk).toBe('LOW');
      expect(action.reversible).toBe(true);
    });

    it('devrait avoir reversible=true par défaut', () => {
      const action = createAction(
        'CLEAR_CACHE',
        'memory',
        'Clear memory cache',
        {},
        'LOW'
      );
      expect(action.reversible).toBe(true);
    });
  });

  describe('createHistoryEntry', () => {
    it('devrait créer une entrée d\'historique valide', () => {
      const entry = createHistoryEntry(
        'EXECUTE',
        'ADMIN',
        'Applied optimization',
        { test: true },
        'SUCCESS'
      );

      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeLessThanOrEqual(Date.now());
      expect(entry.phase).toBe('EXECUTE');
      expect(entry.actor).toBe('ADMIN');
      expect(entry.result).toBe('SUCCESS');
    });

    it('devrait supporter suggestionId et actionId optionnels', () => {
      const entry = createHistoryEntry(
        'EXECUTE',
        'DEV',
        'Test action',
        {},
        'SUCCESS',
        'sug-123',
        'act-456'
      );

      expect(entry.suggestionId).toBe('sug-123');
      expect(entry.actionId).toBe('act-456');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS - CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

describe('EVOLUTION ENGINE — Constantes', () => {
  describe('RISK_LEVEL_COLORS', () => {
    it('devrait avoir des couleurs pour tous les niveaux', () => {
      expect(RISK_LEVEL_COLORS.LOW).toBeDefined();
      expect(RISK_LEVEL_COLORS.MEDIUM).toBeDefined();
      expect(RISK_LEVEL_COLORS.HIGH).toBeDefined();
      expect(RISK_LEVEL_COLORS.CRITICAL).toBeDefined();
    });

    it('toutes les couleurs devraient être des chaînes hexadécimales valides', () => {
      const hexPattern = /^#[0-9a-fA-F]{6}$/;
      Object.values(RISK_LEVEL_COLORS).forEach(color => {
        expect(color).toMatch(hexPattern);
      });
    });
  });

  describe('TREND_COLORS', () => {
    it('devrait avoir des couleurs pour toutes les tendances', () => {
      expect(TREND_COLORS.IMPROVING).toBeDefined();
      expect(TREND_COLORS.STABLE).toBeDefined();
      expect(TREND_COLORS.DEGRADING).toBeDefined();
      expect(TREND_COLORS.VOLATILE).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS - TYPES
// ═══════════════════════════════════════════════════════════════════════════════

describe('EVOLUTION ENGINE — Types', () => {
  describe('RiskLevel type', () => {
    it('devrait accepter les valeurs valides', () => {
      const risks: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      expect(risks).toHaveLength(4);
    });
  });

  describe('TrendDirection type', () => {
    it('devrait accepter les valeurs valides', () => {
      const trends: TrendDirection[] = ['IMPROVING', 'STABLE', 'DEGRADING', 'VOLATILE'];
      expect(trends).toHaveLength(4);
    });
  });

  describe('GovernanceRole type', () => {
    it('devrait accepter les valeurs valides', () => {
      const roles: GovernanceRole[] = ['USER', 'DEV', 'ADMIN', 'SYSTEM'];
      expect(roles).toHaveLength(4);
    });
  });

  describe('SuggestionStatus type', () => {
    it('devrait accepter les valeurs valides', () => {
      const statuses: SuggestionStatus[] = [
        'PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'ROLLED_BACK', 'EXPIRED'
      ];
      expect(statuses).toHaveLength(6);
    });
  });

  describe('ActionResult type', () => {
    it('devrait accepter les valeurs valides', () => {
      const results: ActionResult[] = [
        'SUCCESS', 'FAILED', 'PARTIAL', 'DENIED', 'ROLLED_BACK'
      ];
      expect(results).toHaveLength(5);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS - HIÉRARCHIE DE SÉCURITÉ
// ═══════════════════════════════════════════════════════════════════════════════

describe('EVOLUTION ENGINE — Hiérarchie de Sécurité', () => {
  it('devrait respecter: Sécurité > Stabilité > Cohérence > Optimisation > Évolution', () => {
    // Tous les modules critiques dans la whitelist devraient nécessiter ADMIN
    const securityModules: TitaneModule[] = ['singularity', 'admin'];

    for (const entry of DEFAULT_ACTION_WHITELIST) {
      for (const module of securityModules) {
        if (entry.allowedTargets.includes(module)) {
          expect(['ADMIN', 'SYSTEM']).toContain(entry.requiredRole);
        }
      }
    }
  });

  it('les politiques de validation devraient exister', () => {
    expect(DEFAULT_VALIDATION_POLICIES.length).toBeGreaterThan(0);

    // Chaque politique devrait avoir un ID unique
    const ids = DEFAULT_VALIDATION_POLICIES.map(p => p.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS - INTÉGRATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('EVOLUTION ENGINE — Intégration', () => {
  describe('Flux complet', () => {
    it('devrait pouvoir créer un flux DataPoint → Pattern → Suggestion → Action', () => {
      // 1. Créer des points de données
      const dataPoints: EvolutionDataPoint[] = [];
      for (let i = 0; i < 10; i++) {
        dataPoints.push(createDataPoint(
          'PERFORMANCE',
          'performance',
          'latency',
          100 + i * 10,
          { source: 'test' },
          ['test']
        ));
      }
      expect(dataPoints).toHaveLength(10);

      // 2. Simuler la détection d'un pattern
      const pattern: EvolutionPattern = {
        id: generateEvolutionId('pattern'),
        type: 'INEFFICIENCY',
        moduleId: 'performance',
        description: 'Latency increasing',
        occurrences: 10,
        firstSeen: dataPoints[0].timestamp,
        lastSeen: dataPoints[9].timestamp,
        confidence: 85,
        impact: 'MEDIUM',
        relatedMetrics: ['latency'],
        suggestedAction: 'Optimize cache'
      };
      expect(pattern.confidence).toBeGreaterThan(80);

      // 3. Créer une action basée sur le pattern
      const action = createAction(
        'ADJUST_PARAMETER',
        'performance',
        'Optimize cache settings',
        { cacheSize: 1024 },
        'LOW',
        true
      );

      // 4. Créer une suggestion avec l'action
      const suggestion = createSuggestion(
        'OPTIMIZATION',
        'Optimize Performance Cache',
        'Cache optimization based on detected latency pattern',
        `Pattern detected: ${pattern.description}`,
        [pattern.moduleId],
        'LOW',
        [action]
      );

      expect(suggestion.status).toBe('PENDING');
      expect(suggestion.actions).toHaveLength(1);

      // 5. Vérifier que l'action est autorisée
      const whitelistCheck = isActionWhitelisted(
        action.type,
        action.targetModule,
        action.risk,
        DEFAULT_ACTION_WHITELIST
      );
      expect(whitelistCheck.allowed).toBe(true);

      // 6. Créer une entrée d'historique
      const historyEntry = createHistoryEntry(
        'EXECUTE',
        'DEV',
        'Executed cache optimization',
        { action: action.parameters },
        'SUCCESS',
        suggestion.id,
        action.id
      );

      expect(historyEntry.result).toBe('SUCCESS');
      expect(historyEntry.suggestionId).toBe(suggestion.id);
      expect(historyEntry.actionId).toBe(action.id);
    });
  });

  describe('Validation de bout en bout', () => {
    it('devrait rejeter une action avec un risque trop élevé pour le module', () => {
      const action = createAction(
        'TOGGLE_MODE',
        'performance',
        'Toggle dangerous mode',
        {},
        'HIGH'
      );

      const result = isActionWhitelisted(
        action.type,
        action.targetModule,
        action.risk,
        DEFAULT_ACTION_WHITELIST
      );

      // TOGGLE_MODE a maxRisk: LOW, donc HIGH devrait être rejeté
      expect(result.allowed).toBe(false);
    });

    it('devrait valider la hiérarchie des permissions', () => {
      // USER ne peut pas faire ce que DEV peut faire
      expect(hasPermission('USER', 'DEV')).toBe(false);
      // DEV ne peut pas faire ce que ADMIN peut faire
      expect(hasPermission('DEV', 'ADMIN')).toBe(false);
      // Mais ADMIN peut tout faire
      expect(hasPermission('ADMIN', 'USER')).toBe(true);
      expect(hasPermission('ADMIN', 'DEV')).toBe(true);
    });
  });
});
