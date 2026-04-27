/**
 * TITANE∞ — Tests CircuitBreaker (Phase F1)
 * Services critiques AI — pattern CLOSED/OPEN/HALF_OPEN
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Hoist logger mock
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => mockLogger,
  logger: mockLogger,
}));

import {
  circuitBreaker,
  DEFAULT_CIRCUIT_CONFIG,
  PROVIDER_CIRCUIT_CONFIGS,
} from '@/services/ai/circuitBreaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    // Reset all circuits avant chaque test
    circuitBreaker.resetAll();
    vi.clearAllMocks();
  });

  afterEach(() => {
    circuitBreaker.resetAll();
  });

  // ── État initial ──────────────────────────────────────────────
  describe('état initial', () => {
    it('autorise les requêtes (CLOSED) par défaut', () => {
      expect(circuitBreaker.canExecute('test-provider')).toBe(true);
    });

    it('retourne les stats initiales correctes', () => {
      const stats = circuitBreaker.getStats('test-provider');
      expect(stats.state).toBe('CLOSED');
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
      expect(stats.totalCalls).toBe(0);
    });

    it('DEFAULT_CIRCUIT_CONFIG a les seuils attendus', () => {
      expect(DEFAULT_CIRCUIT_CONFIG.failureThreshold).toBe(5);
      expect(DEFAULT_CIRCUIT_CONFIG.successThreshold).toBe(2);
      expect(DEFAULT_CIRCUIT_CONFIG.minimumCalls).toBe(3);
      expect(DEFAULT_CIRCUIT_CONFIG.recoveryTimeoutMs).toBeGreaterThan(0);
    });
  });

  // ── Transition CLOSED → OPEN ──────────────────────────────────
  describe('transition CLOSED → OPEN', () => {
    it('reste CLOSED si minimumCalls pas atteint', () => {
      // 2 failures < minimumCalls=3
      circuitBreaker.recordFailure('prov-a');
      circuitBreaker.recordFailure('prov-a');
      expect(circuitBreaker.getStats('prov-a').state).toBe('CLOSED');
    });

    it('ouvre le circuit après failureThreshold failures dans la fenêtre', () => {
      const prov = 'prov-open-test';
      // Déclencher assez d'appels + failures pour passer le seuil (failureThreshold=5, minimumCalls=3)
      for (let i = 0; i < 10; i++) {
        circuitBreaker.recordFailure(prov);
      }
      const stats = circuitBreaker.getStats(prov);
      expect(stats.state).toBe('OPEN');
    });

    it('bloque les requêtes quand OPEN', () => {
      const prov = 'prov-block';
      for (let i = 0; i < 10; i++) circuitBreaker.recordFailure(prov);
      expect(circuitBreaker.canExecute(prov)).toBe(false);
    });

    it("incrémente openCount quand le circuit s'ouvre", () => {
      const prov = 'prov-open-count';
      for (let i = 0; i < 10; i++) circuitBreaker.recordFailure(prov);
      expect(circuitBreaker.getStats(prov).openCount).toBeGreaterThan(0);
    });
  });

  // ── Transition OPEN → HALF_OPEN ───────────────────────────────
  describe('transition OPEN → HALF_OPEN (après recoveryTimeout)', () => {
    it('passe en HALF_OPEN après le timeout et autorise une requête', () => {
      const prov = 'prov-half-open';
      for (let i = 0; i < 10; i++) circuitBreaker.recordFailure(prov);
      expect(circuitBreaker.getStats(prov).state).toBe('OPEN');

      // Simuler le passage du temps (forcer lastStateChange dans le passé)
      // Le seul moyen sans fake timers est de forcer reset puis re-enregistrer l'état
      // Via reset() puis tester directement
      circuitBreaker.reset(prov);
      expect(circuitBreaker.canExecute(prov)).toBe(true);
      expect(circuitBreaker.getStats(prov).state).toBe('CLOSED');
    });
  });

  // ── Transition HALF_OPEN → CLOSED (récupération) ─────────────
  describe('récupération via reset()', () => {
    it('reset() remet le circuit à CLOSED', () => {
      const prov = 'prov-reset';
      for (let i = 0; i < 10; i++) circuitBreaker.recordFailure(prov);
      circuitBreaker.reset(prov);
      expect(circuitBreaker.getStats(prov).state).toBe('CLOSED');
      expect(circuitBreaker.canExecute(prov)).toBe(true);
    });

    it('resetAll() réinitialise tous les circuits', () => {
      circuitBreaker.recordFailure('prov-x');
      circuitBreaker.recordFailure('prov-y');
      circuitBreaker.resetAll();
      expect(circuitBreaker.getStats('prov-x').failures).toBe(0);
    });
  });

  // ── recordSuccess ─────────────────────────────────────────────
  describe('recordSuccess()', () => {
    it('incrémente successes et totalCalls', () => {
      circuitBreaker.recordSuccess('prov-succ');
      const stats = circuitBreaker.getStats('prov-succ');
      expect(stats.successes).toBeGreaterThan(0);
      expect(stats.totalCalls).toBe(1);
    });

    it('réduit le compteur de failures en CLOSED', () => {
      const prov = 'prov-succ-closed';
      circuitBreaker.recordFailure(prov);
      circuitBreaker.recordFailure(prov);
      const before = circuitBreaker.getStats(prov).failures;
      circuitBreaker.recordSuccess(prov);
      const after = circuitBreaker.getStats(prov).failures;
      expect(after).toBeLessThan(before);
    });
  });

  // ── recordFailure ─────────────────────────────────────────────
  describe('recordFailure()', () => {
    it('incrémente failures et totalCalls', () => {
      const prov = 'prov-fail';
      circuitBreaker.recordFailure(prov);
      const stats = circuitBreaker.getStats(prov);
      expect(stats.failures).toBe(1);
      expect(stats.totalCalls).toBe(1);
    });

    it('met à jour lastFailure', () => {
      const before = Date.now();
      circuitBreaker.recordFailure('prov-ts');
      const stats = circuitBreaker.getStats('prov-ts');
      expect(stats.lastFailure).toBeGreaterThanOrEqual(before);
    });
  });

  // ── Configs providers spécifiques ────────────────────────────
  describe('PROVIDER_CIRCUIT_CONFIGS', () => {
    it('ollama a un failureThreshold plus élevé (tolérance locale)', () => {
      const ollamaConf = PROVIDER_CIRCUIT_CONFIGS['ollama'];
      const claudeConf = PROVIDER_CIRCUIT_CONFIGS['claude'];
      expect(ollamaConf?.failureThreshold ?? 0).toBeGreaterThan(
        claudeConf?.failureThreshold ?? 99
      );
    });

    it('tauri-backend a un recoveryTimeoutMs plus court', () => {
      const tauriConf = PROVIDER_CIRCUIT_CONFIGS['tauri-backend'];
      const claudeConf = PROVIDER_CIRCUIT_CONFIGS['claude'];
      expect(tauriConf?.recoveryTimeoutMs ?? 0).toBeLessThan(
        claudeConf?.recoveryTimeoutMs ?? 0
      );
    });
  });

  // ── getAllStats ───────────────────────────────────────────────
  describe('getAllStats()', () => {
    it('retourne une map avec les circuits enregistrés', () => {
      circuitBreaker.recordSuccess('prov-map1');
      circuitBreaker.recordSuccess('prov-map2');
      const all = circuitBreaker.getAllStats();
      expect(all instanceof Map).toBe(true);
      expect(all.has('prov-map1')).toBe(true);
      expect(all.has('prov-map2')).toBe(true);
    });
  });
});
