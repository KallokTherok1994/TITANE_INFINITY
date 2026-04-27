/**
 * TITANE∞ — Tests RateLimiter (Phase F1)
 * Services critiques AI — checkLimit, recordRequest, reset, getStats
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

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
  rateLimiter,
  DEFAULT_RATE_CONFIG,
  PROVIDER_RATE_CONFIGS,
} from '@/services/ai/rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    rateLimiter.resetAll();
    vi.clearAllMocks();
  });

  afterEach(() => {
    rateLimiter.resetAll();
  });

  // ── DEFAULT_RATE_CONFIG ───────────────────────────────────────
  describe('DEFAULT_RATE_CONFIG', () => {
    it('requestsPerMinute > 0', () => {
      expect(DEFAULT_RATE_CONFIG.requestsPerMinute).toBeGreaterThan(0);
    });

    it('requestsPerHour > requestsPerMinute', () => {
      expect(DEFAULT_RATE_CONFIG.requestsPerHour).toBeGreaterThan(
        DEFAULT_RATE_CONFIG.requestsPerMinute
      );
    });

    it('cooldownMs > 0', () => {
      expect(DEFAULT_RATE_CONFIG.cooldownMs).toBeGreaterThan(0);
    });
  });

  // ── checkLimit — requête autorisée ───────────────────────────
  describe('checkLimit() — requête autorisée', () => {
    it('autorise la première requête pour un nouveau provider', () => {
      const status = rateLimiter.checkLimit('fresh-provider');
      expect(status.allowed).toBe(true);
    });

    it('retourne remainingRequests > 0 initialement', () => {
      const status = rateLimiter.checkLimit('prov-remaining');
      expect(status.remainingRequests).toBeGreaterThan(0);
    });

    it('retourne remainingTokens > 0 initialement', () => {
      const status = rateLimiter.checkLimit('prov-tokens');
      expect(status.remainingTokens).toBeGreaterThan(0);
    });

    it('retourne resetTime dans le futur', () => {
      const before = Date.now();
      const status = rateLimiter.checkLimit('prov-reset');
      expect(status.resetTime).toBeGreaterThan(before);
    });
  });

  // ── recordRequest + compteurs ─────────────────────────────────
  describe('recordRequest()', () => {
    it('enregistre une requête et réduit remainingRequests', () => {
      const prov = 'prov-record';
      const before = rateLimiter.checkLimit(prov).remainingRequests;
      rateLimiter.recordRequest(prov, 100);
      const after = rateLimiter.checkLimit(prov).remainingRequests;
      expect(after).toBeLessThan(before);
    });

    it('met à jour lastRequest dans getStats()', () => {
      const prov = 'prov-stats-ts';
      const before = Date.now();
      rateLimiter.recordRequest(prov, 100);
      const stats = rateLimiter.getStats(prov);
      expect(stats.lastRequest).toBeGreaterThanOrEqual(before);
    });

    it('getStats() retourne le provider correct', () => {
      rateLimiter.recordRequest('prov-stat-check', 500);
      const stats = rateLimiter.getStats('prov-stat-check');
      expect(stats.provider).toBe('prov-stat-check');
    });
  });

  // ── acquire() — check+record combiné ────────────────────────
  describe('acquire() — check+record combiné', () => {
    it('retourne allowed=true et enregistre la requête', () => {
      const status = rateLimiter.acquire('prov-combined', 200);
      expect(status.allowed).toBe(true);
      const stats = rateLimiter.getStats('prov-combined');
      expect(stats.requestsThisMinute).toBeGreaterThan(0);
    });
  });

  // ── dépassement de limite par minute ─────────────────────────
  describe('dépassement requestsPerMinute', () => {
    it('bloque quand requestsPerMinute est atteint', () => {
      const prov = 'prov-minute-limit';
      // Pour ce test, utiliser un provider avec une limite très basse
      // La config par défaut = 60 req/min; forcer via reset + enregistrement massif
      // Utiliser le mécanisme de reset + simulation de saturation manuelle
      // On enregistre jusqu'au seuil
      const rpmLimit = DEFAULT_RATE_CONFIG.requestsPerMinute;
      for (let i = 0; i < rpmLimit + 5; i++) {
        rateLimiter.recordRequest(prov, 100);
      }
      const status = rateLimiter.checkLimit(prov);
      expect(status.allowed).toBe(false);
      expect(status.reason).toMatch(/rate limit|exceeded|cooldown/i);
    });
  });

  // ── reset() ──────────────────────────────────────────────────
  describe('reset()', () => {
    it('reset() réinitialise les compteurs pour un provider', () => {
      const prov = 'prov-reset-test';
      rateLimiter.recordRequest(prov, 500);
      rateLimiter.reset(prov);
      const stats = rateLimiter.getStats(prov);
      expect(stats.requestsThisMinute).toBe(0);
    });
  });

  // ── resetAll() ───────────────────────────────────────────────
  describe('resetAll()', () => {
    it('resetAll() vide tous les compteurs', () => {
      rateLimiter.recordRequest('prov-a', 100);
      rateLimiter.recordRequest('prov-b', 200);
      rateLimiter.resetAll();
      expect(rateLimiter.getStats('prov-a').requestsThisMinute).toBe(0);
      expect(rateLimiter.getStats('prov-b').requestsThisMinute).toBe(0);
    });
  });

  // ── getAllStats() ─────────────────────────────────────────────
  describe('getAllStats()', () => {
    it('retourne une Map de stats pour tous les providers enregistrés', () => {
      rateLimiter.recordRequest('prov-map-x', 50);
      const all = rateLimiter.getAllStats();
      expect(all instanceof Map).toBe(true);
      expect(all.has('prov-map-x')).toBe(true);
    });
  });

  // ── PROVIDER_RATE_CONFIGS ─────────────────────────────────────
  describe('PROVIDER_RATE_CONFIGS', () => {
    it('claude a une limite par minute', () => {
      expect(PROVIDER_RATE_CONFIGS['claude']?.requestsPerMinute).toBeGreaterThan(0);
    });

    it('openai a requestsPerHour défini', () => {
      expect(PROVIDER_RATE_CONFIGS['openai']?.requestsPerHour).toBeGreaterThan(0);
    });
  });
});
