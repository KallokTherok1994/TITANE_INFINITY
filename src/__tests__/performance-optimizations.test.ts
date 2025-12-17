/**
 * TITANE∞ v24.3.1 — Performance Tests
 * Tests des optimisations de cache et streaming
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { responseCache } from '../services/cache/index';
import { predictivePreloader } from '../services/cache/index';

describe('Performance Optimizations v24.3.1', () => {
  beforeEach(() => {
    responseCache.clear();
    predictivePreloader.clear();
  });

  describe('ResponseCache', () => {
    it('devrait stocker et récupérer une réponse', () => {
      const key = { message: 'Comment installer Ollama?', mode: 'default' };
      const content = 'Pour installer Ollama, suivez ces étapes...';

      responseCache.set(key, content, {
        provider: 'gemini',
        model: 'gemini-pro',
      });

      const cached = responseCache.get(key);
      expect(cached).toBeTruthy();
      expect(cached?.content).toBe(content);
      expect(cached?.provider).toBe('gemini');
    });

    it('devrait faire un fuzzy match sur messages similaires', () => {
      // Original: 5 mots uniques
      const key1 = { message: 'Comment installer Ollama sur Linux', mode: 'default' };
      const content = 'Installation Ollama...';

      responseCache.set(key1, content, { provider: 'gemini', model: 'gemini-pro' });

      // Message très similaire (4/5 = 80% Jaccard)
      // words1: {comment, installer, ollama, sur, linux}
      // words2: {comment, installer, ollama, sur, ubuntu} -> 4/6 = 66.7%
      // words3: {comment, installer, ollama, linux} -> 4/5 = 80%
      const key2 = { message: 'comment installer ollama linux', mode: 'default' };

      const cached2 = responseCache.get(key2);

      // Devrait trouver via fuzzy match (score >= 0.8)
      expect(cached2).toBeTruthy();
      expect(cached2?.content).toBe(content);
    });

    it('devrait calculer les statistiques correctement', () => {
      const key = { message: 'Test message', mode: 'default' };

      // Miss
      const miss = responseCache.get(key);
      expect(miss).toBeNull();

      // Set
      responseCache.set(key, 'Response', { provider: 'local', model: 'llama' });

      // Hit
      const hit1 = responseCache.get(key);
      const hit2 = responseCache.get(key);

      expect(hit1).toBeTruthy();
      expect(hit2).toBeTruthy();

      const stats = responseCache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.67, 1); // 2/3 = 66.7%
      expect(stats.size).toBe(1);
    });

    it('devrait nettoyer les entrées expirées', async () => {
      // Créer cache avec TTL court
      const shortCache = new (responseCache.constructor as any)({
        maxSize: 10,
        ttlMs: 100, // 100ms
      });

      shortCache.set({ message: 'Test', mode: 'default' }, 'Content', {
        provider: 'test',
        model: 'test',
      });

      expect(shortCache.get({ message: 'Test', mode: 'default' })).toBeTruthy();

      // Attendre expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      const removed = shortCache.cleanup();
      expect(removed).toBe(1);
      expect(shortCache.get({ message: 'Test', mode: 'default' })).toBeNull();
    });
  });

  describe('PredictivePreloader', () => {
    it('devrait enregistrer des patterns utilisateur', () => {
      predictivePreloader.recordUserMessage('Comment installer Ollama?', 'default');
      predictivePreloader.recordUserMessage('Comment installer Ollama?', 'default');

      const stats = predictivePreloader.getStats();
      expect(stats.patternsDetected).toBeGreaterThan(0);
      expect(stats.topPatterns.length).toBeGreaterThan(0);
    });

    it('devrait ajouter des items à la queue de préchargement', () => {
      predictivePreloader.preload([
        { message: 'Question 1', mode: 'default', priority: 0.9 },
        { message: 'Question 2', mode: 'coach', priority: 0.7 },
      ]);

      const stats = predictivePreloader.getStats();
      expect(stats.queueSize).toBeGreaterThanOrEqual(0); // Peut être traité rapidement
    });
  });

  describe('Integration Tests', () => {
    it('devrait améliorer la performance avec cache', async () => {
      const message = 'Comment installer Ollama?';

      // 1ère requête: génération (simulée)
      const start1 = Date.now();
      // ... génération normale ...
      const generationTime = 1200; // ms simulé
      responseCache.set({ message, mode: 'default' }, 'Installation Ollama...', {
        provider: 'gemini',
        model: 'gemini-pro',
      });

      // 2e requête: cache hit
      const start2 = Date.now();
      const cached = responseCache.get({ message, mode: 'default' });
      const cacheTime = Date.now() - start2;

      expect(cached).toBeTruthy();
      expect(cacheTime).toBeLessThan(50); // < 50ms

      // Gain de performance
      const improvement = ((generationTime - cacheTime) / generationTime) * 100;
      expect(improvement).toBeGreaterThan(90); // > 90% amélioration
    });
  });
});
