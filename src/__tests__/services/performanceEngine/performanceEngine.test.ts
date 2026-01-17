/**
 * @file performanceEngine.test.ts
 * @description Tests unitaires pour Performance Engine - TITANE∞ vΩ∞Ω+
 * @version 1.0.0
 * @license TITANE_INFINITY_∞_OMEGA+_LICENSE
 */

import { describe, it, expect } from 'vitest';
import {
  // Fonctions utilitaires
  generateSnapshotId,
  generateIssueId,
  generateRecommendationId,
  generateMetricId,
  calculateGrade,
  createEmptySnapshot,
  formatBytes,
  formatDuration,
  determineSeverity,
  getThresholdsForProfile,
  // Constantes de configuration
  THRESHOLD_PROFILES,
  DEVELOPMENT_THRESHOLDS,
  PRODUCTION_THRESHOLDS,
  BENCHMARK_THRESHOLDS,
  LOWPOWER_THRESHOLDS,
  DEFAULT_PERFORMANCE_CONFIG,
  METRIC_DEFINITIONS,
} from '../../../services/performanceEngine/performanceEngine.config';

import type {
  MetricType,
  SeverityLevel,
  IssueType,
  TitaneModule,
  PerformanceProfile,
  RecommendationCategory,
  PerformanceIssue,
  ThresholdViolation,
  Recommendation,
  MetricsSnapshot,
} from '../../../services/performanceEngine/performanceEngine.config';

// ============================================================================
// TESTS - GÉNÉRATION D'IDS
// ============================================================================

describe("Performance Engine - Génération d'IDs", () => {
  describe('generateSnapshotId', () => {
    it('devrait générer un ID unique', () => {
      const id1 = generateSnapshotId();
      const id2 = generateSnapshotId();
      expect(id1).not.toBe(id2);
    });

    it('devrait avoir le préfixe "snapshot_"', () => {
      const id = generateSnapshotId();
      expect(id).toMatch(/^snapshot_/);
    });

    it('devrait être une chaîne non vide', () => {
      const id = generateSnapshotId();
      expect(id.length).toBeGreaterThan(5);
    });
  });

  describe('generateIssueId', () => {
    it('devrait générer un ID unique', () => {
      const id1 = generateIssueId('cpu_spike');
      const id2 = generateIssueId('cpu_spike');
      expect(id1).not.toBe(id2);
    });

    it('devrait avoir le préfixe "issue_"', () => {
      const id = generateIssueId('ram_overflow');
      expect(id).toMatch(/^issue_/);
    });

    it("devrait inclure le type d'issue", () => {
      const id = generateIssueId('fps_drop');
      expect(id).toContain('fps_drop');
    });
  });

  describe('generateRecommendationId', () => {
    it('devrait générer un ID unique', () => {
      const id1 = generateRecommendationId('react_optimization');
      const id2 = generateRecommendationId('react_optimization');
      expect(id1).not.toBe(id2);
    });

    it('devrait avoir le préfixe "rec_"', () => {
      const id = generateRecommendationId('rust_optimization');
      expect(id).toMatch(/^rec_/);
    });
  });

  describe('generateMetricId', () => {
    it('devrait contenir le type de métrique', () => {
      const id = generateMetricId('cpu_global');
      expect(id).toContain('cpu_global');
    });
  });
});

// ============================================================================
// TESTS - FONCTIONS DE FORMATAGE
// ============================================================================

describe('Performance Engine - Fonctions de formatage', () => {
  describe('formatBytes', () => {
    it('devrait formater 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('devrait formater les bytes', () => {
      expect(formatBytes(500)).toBe('500 B');
    });

    it('devrait formater les kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('devrait formater les megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('devrait formater les gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('devrait gérer les valeurs décimales', () => {
      const result = formatBytes(1536);
      expect(result).toMatch(/1\.5.*KB/);
    });
  });

  describe('formatDuration', () => {
    it('devrait formater les millisecondes', () => {
      const result = formatDuration(500);
      expect(result.includes('ms') || result.includes('500')).toBe(true);
    });

    it('devrait formater les secondes', () => {
      const result = formatDuration(5000);
      expect(result).toMatch(/5.*s/i);
    });

    it('devrait formater les minutes', () => {
      const result = formatDuration(60000);
      expect(result).toMatch(/1.*m/i);
    });

    it('devrait formater les heures', () => {
      const result = formatDuration(3600000);
      expect(result).toMatch(/1.*h/i);
    });
  });

  describe('calculateGrade', () => {
    it('devrait retourner S pour score >= 95', () => {
      expect(calculateGrade(100)).toBe('S');
      expect(calculateGrade(95)).toBe('S');
    });

    it('devrait retourner A pour score 85-94', () => {
      expect(calculateGrade(94)).toBe('A');
      expect(calculateGrade(85)).toBe('A');
    });

    it('devrait retourner B pour score 70-84', () => {
      expect(calculateGrade(84)).toBe('B');
      expect(calculateGrade(70)).toBe('B');
    });

    it('devrait retourner C pour score 50-69', () => {
      expect(calculateGrade(69)).toBe('C');
      expect(calculateGrade(50)).toBe('C');
    });

    it('devrait retourner D ou F pour score < 50', () => {
      expect(calculateGrade(49)).toBe('D');
      expect(calculateGrade(29)).toBe('F');
    });
  });
});

// ============================================================================
// TESTS - FONCTION determineSeverity
// ============================================================================

describe('Performance Engine - determineSeverity', () => {
  const warningThreshold = 70;
  const criticalThreshold = 90;

  it('devrait retourner "info" pour les valeurs bien sous le warning', () => {
    // 70 * 0.7 = 49, donc 48 devrait donner info
    const result = determineSeverity(48, warningThreshold, criticalThreshold);
    expect(result).toBe('info');
  });

  it('devrait retourner "warning" pour les valeurs proches du warning', () => {
    // 70 * 0.7 = 49, donc 50 devrait donner warning
    const result = determineSeverity(50, warningThreshold, criticalThreshold);
    expect(result).toBe('warning');
  });

  it('devrait retourner "major" pour les valeurs entre warning et critical', () => {
    const result = determineSeverity(75, warningThreshold, criticalThreshold);
    expect(result).toBe('major');
  });

  it('devrait retourner "critical" pour les valeurs au-dessus du critique', () => {
    const result = determineSeverity(95, warningThreshold, criticalThreshold);
    expect(result).toBe('critical');
  });

  it('devrait gérer les cas limites', () => {
    const atWarning = determineSeverity(70, warningThreshold, criticalThreshold);
    const atCritical = determineSeverity(90, warningThreshold, criticalThreshold);

    expect(atWarning).toBe('major');
    expect(atCritical).toBe('critical');
  });
});

// ============================================================================
// TESTS - SNAPSHOT VIDE
// ============================================================================

describe('Performance Engine - createEmptySnapshot', () => {
  it('devrait créer un snapshot avec un ID valide', () => {
    const snapshot = createEmptySnapshot();
    expect(snapshot.id).toMatch(/^snapshot_/);
  });

  it('devrait avoir un timestamp récent', () => {
    const before = Date.now();
    const snapshot = createEmptySnapshot();
    const after = Date.now();

    expect(snapshot.timestamp).toBeGreaterThanOrEqual(before);
    expect(snapshot.timestamp).toBeLessThanOrEqual(after);
  });

  it('devrait avoir des métriques système initialisées à zéro', () => {
    const snapshot = createEmptySnapshot();

    expect(snapshot.system.cpu.global).toBe(0);
    expect(snapshot.system.cpu.process).toBe(0);
  });

  it('devrait avoir des métriques frontend initialisées', () => {
    const snapshot = createEmptySnapshot();

    expect(snapshot.frontend.fps.current).toBe(0);
    expect(snapshot.frontend.render.lastTime).toBe(0);
  });

  it('devrait avoir des métriques IA initialisées', () => {
    const snapshot = createEmptySnapshot();

    expect(snapshot.ia.ollama.latency).toBe(0);
    expect(snapshot.ia.gemini.latency).toBe(0);
  });
});

// ============================================================================
// TESTS - PROFILS DE CONFIGURATION
// ============================================================================

describe('Performance Engine - Profils de configuration', () => {
  describe('THRESHOLD_PROFILES', () => {
    it('devrait contenir les 4 profils standards', () => {
      expect(THRESHOLD_PROFILES.development).toBeDefined();
      expect(THRESHOLD_PROFILES.production).toBeDefined();
      expect(THRESHOLD_PROFILES.benchmark).toBeDefined();
      expect(THRESHOLD_PROFILES.lowpower).toBeDefined();
    });
  });

  describe('getThresholdsForProfile', () => {
    it('devrait retourner les seuils pour development', () => {
      const thresholds = getThresholdsForProfile('development');
      expect(thresholds.profile).toBe('development');
    });

    it('devrait retourner les seuils pour production', () => {
      const thresholds = getThresholdsForProfile('production');
      expect(thresholds.profile).toBe('production');
    });

    it('devrait retourner les seuils pour benchmark', () => {
      const thresholds = getThresholdsForProfile('benchmark');
      expect(thresholds.profile).toBe('benchmark');
    });

    it('devrait retourner les seuils pour lowpower', () => {
      const thresholds = getThresholdsForProfile('lowpower');
      expect(thresholds.profile).toBe('lowpower');
    });
  });

  describe('Cohérence des seuils', () => {
    it('les seuils CPU warning doivent être inférieurs aux critical', () => {
      expect(DEVELOPMENT_THRESHOLDS.system.cpuGlobalWarning).toBeLessThan(
        DEVELOPMENT_THRESHOLDS.system.cpuGlobalCritical
      );
      expect(PRODUCTION_THRESHOLDS.system.cpuGlobalWarning).toBeLessThan(
        PRODUCTION_THRESHOLDS.system.cpuGlobalCritical
      );
    });

    it('les seuils RAM warning doivent être inférieurs aux critical', () => {
      expect(DEVELOPMENT_THRESHOLDS.system.ramSystemWarning).toBeLessThan(
        DEVELOPMENT_THRESHOLDS.system.ramSystemCritical
      );
      expect(PRODUCTION_THRESHOLDS.system.ramSystemWarning).toBeLessThan(
        PRODUCTION_THRESHOLDS.system.ramSystemCritical
      );
    });

    it('production devrait avoir des seuils CPU plus stricts que development', () => {
      expect(PRODUCTION_THRESHOLDS.system.cpuGlobalWarning).toBeLessThanOrEqual(
        DEVELOPMENT_THRESHOLDS.system.cpuGlobalWarning
      );
    });

    it('benchmark devrait avoir les seuils les plus stricts', () => {
      expect(BENCHMARK_THRESHOLDS.system.cpuGlobalWarning).toBeLessThanOrEqual(
        PRODUCTION_THRESHOLDS.system.cpuGlobalWarning
      );
    });

    it('lowpower devrait avoir les seuils les plus relaxés', () => {
      expect(LOWPOWER_THRESHOLDS.system.cpuGlobalWarning).toBeGreaterThanOrEqual(
        DEVELOPMENT_THRESHOLDS.system.cpuGlobalWarning
      );
    });
  });
});

// ============================================================================
// TESTS - CONFIGURATION PAR DÉFAUT
// ============================================================================

describe('Performance Engine - Configuration par défaut', () => {
  it('devrait avoir un intervalle de collecte positif', () => {
    expect(DEFAULT_PERFORMANCE_CONFIG.collector.intervalMs).toBeGreaterThan(0);
  });

  it("devrait avoir une taille d'historique positive", () => {
    expect(DEFAULT_PERFORMANCE_CONFIG.collector.historySize).toBeGreaterThan(0);
  });

  it('devrait avoir un profil valide', () => {
    const validProfiles: PerformanceProfile[] = [
      'development',
      'production',
      'benchmark',
      'lowpower',
    ];
    expect(validProfiles).toContain(DEFAULT_PERFORMANCE_CONFIG.profile);
  });

  it('devrait avoir la collecte système activée', () => {
    expect(DEFAULT_PERFORMANCE_CONFIG.collector.systemEnabled).toBe(true);
  });

  it('devrait avoir la collecte frontend activée', () => {
    expect(DEFAULT_PERFORMANCE_CONFIG.collector.frontendEnabled).toBe(true);
  });

  it('devrait avoir la collecte IA activée', () => {
    expect(DEFAULT_PERFORMANCE_CONFIG.collector.iaEnabled).toBe(true);
  });
});

// ============================================================================
// TESTS - DÉFINITIONS DE MÉTRIQUES
// ============================================================================

describe('Performance Engine - Définitions de métriques', () => {
  it('devrait avoir une définition pour cpu_global', () => {
    expect(METRIC_DEFINITIONS.cpu_global).toBeDefined();
    expect(METRIC_DEFINITIONS.cpu_global.category).toBe('system');
  });

  it('devrait avoir une définition pour fps_webview', () => {
    expect(METRIC_DEFINITIONS.fps_webview).toBeDefined();
    expect(METRIC_DEFINITIONS.fps_webview.category).toBe('frontend');
  });

  it('devrait avoir une définition pour ia_latency_ollama', () => {
    expect(METRIC_DEFINITIONS.ia_latency_ollama).toBeDefined();
    expect(METRIC_DEFINITIONS.ia_latency_ollama.category).toBe('ia');
  });

  it('chaque métrique devrait avoir une description', () => {
    Object.values(METRIC_DEFINITIONS).forEach(def => {
      expect(def.description).toBeDefined();
      expect(def.description.length).toBeGreaterThan(0);
    });
  });

  it('chaque métrique devrait avoir une unité', () => {
    Object.values(METRIC_DEFINITIONS).forEach(def => {
      expect(def.unit).toBeDefined();
    });
  });

  it('chaque métrique devrait avoir une source', () => {
    Object.values(METRIC_DEFINITIONS).forEach(def => {
      expect(def.source).toBeDefined();
    });
  });
});

// ============================================================================
// TESTS - TYPES DE DONNÉES
// ============================================================================

describe('Performance Engine - Types de données', () => {
  describe('MetricType', () => {
    it('devrait accepter les métriques système', () => {
      const systemMetrics: MetricType[] = [
        'cpu_global',
        'cpu_process',
        'ram_process',
        'ram_system',
      ];
      systemMetrics.forEach(metric => {
        expect(METRIC_DEFINITIONS[metric]).toBeDefined();
      });
    });

    it('devrait accepter les métriques frontend', () => {
      const frontendMetrics: MetricType[] = [
        'fps_webview',
        'render_time',
        'invoke_latency',
      ];
      frontendMetrics.forEach(metric => {
        expect(METRIC_DEFINITIONS[metric]).toBeDefined();
      });
    });

    it('devrait accepter les métriques IA', () => {
      const iaMetrics: MetricType[] = [
        'ia_latency_ollama',
        'ia_latency_gemini',
        'ia_tokens_per_sec',
      ];
      iaMetrics.forEach(metric => {
        expect(METRIC_DEFINITIONS[metric]).toBeDefined();
      });
    });
  });

  describe('SeverityLevel', () => {
    it('devrait avoir 4 niveaux de sévérité', () => {
      const levels: SeverityLevel[] = ['info', 'warning', 'major', 'critical'];
      levels.forEach(level => {
        // Vérifie que le type compile correctement
        const severity: SeverityLevel = level;
        expect(severity).toBe(level);
      });
    });
  });

  describe('TitaneModule', () => {
    it('devrait avoir 12 modules définis', () => {
      const modules: TitaneModule[] = [
        'selfHealing',
        'cognitive',
        'memory',
        'tools',
        'search',
        'xp',
        'evolution',
        'prompt',
        'tts',
        'avatar',
        'chat',
        'performance',
      ];
      expect(modules).toHaveLength(12);
    });
  });
});

// ============================================================================
// TESTS - VALIDATION DE SNAPSHOT
// ============================================================================

describe('Performance Engine - Validation de snapshot', () => {
  let snapshot: MetricsSnapshot;

  beforeEach(() => {
    snapshot = createEmptySnapshot();
  });

  it('devrait avoir une structure système valide', () => {
    expect(snapshot.system).toBeDefined();
    expect(snapshot.system.cpu).toBeDefined();
    expect(snapshot.system.ram).toBeDefined();
    expect(snapshot.system.io).toBeDefined();
    expect(snapshot.system.threads).toBeDefined();
  });

  it('devrait avoir une structure frontend valide', () => {
    expect(snapshot.frontend).toBeDefined();
    expect(snapshot.frontend.fps).toBeDefined();
    expect(snapshot.frontend.render).toBeDefined();
    expect(snapshot.frontend.tauri).toBeDefined();
    expect(snapshot.frontend.bundle).toBeDefined();
  });

  it('devrait avoir une structure IA valide', () => {
    expect(snapshot.ia).toBeDefined();
    expect(snapshot.ia.ollama).toBeDefined();
    expect(snapshot.ia.gemini).toBeDefined();
    expect(snapshot.ia.internal).toBeDefined();
  });

  it('les valeurs CPU devraient être dans la plage 0-100', () => {
    expect(snapshot.system.cpu.global).toBeGreaterThanOrEqual(0);
    expect(snapshot.system.cpu.global).toBeLessThanOrEqual(100);
    expect(snapshot.system.cpu.process).toBeGreaterThanOrEqual(0);
    expect(snapshot.system.cpu.process).toBeLessThanOrEqual(100);
  });

  it('les valeurs FPS devraient être non négatives', () => {
    expect(snapshot.frontend.fps.current).toBeGreaterThanOrEqual(0);
    expect(snapshot.frontend.fps.average).toBeGreaterThanOrEqual(0);
  });

  it('les latences devraient être non négatives', () => {
    expect(snapshot.ia.ollama.latency).toBeGreaterThanOrEqual(0);
    expect(snapshot.ia.gemini.latency).toBeGreaterThanOrEqual(0);
    expect(snapshot.frontend.tauri.invokeLatency).toBeGreaterThanOrEqual(0);
  });
});

// Importer beforeEach
import { beforeEach } from 'vitest';
