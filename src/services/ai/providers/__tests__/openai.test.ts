/**
 * Tests du provider OpenAI
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { openaiProvider, OPENAI_MODELS } from '../openai';
import { secureInvoke } from '@/lib/security';

// Mock Tauri secureInvoke
vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

describe('OpenAI Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAvailable()', () => {
    it('devrait retourner true si la clé est configurée', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: true,
        data: { configured: true },
      });

      const result = await openaiProvider.isAvailable();

      expect(result).toBe(true);
      expect(invoke).toHaveBeenCalledWith('get_openai_key_status');
    });

    it("devrait retourner false si la clé n'est pas configurée", async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: true,
        data: { configured: false },
      });

      const result = await openaiProvider.isAvailable();

      expect(result).toBe(false);
    });

    it("devrait retourner false en cas d'erreur backend", async () => {
      vi.mocked(invoke).mockRejectedValue(new Error('Backend error'));

      const result = await openaiProvider.isAvailable();

      expect(result).toBe(false);
    });

    it('devrait retourner false si la réponse est invalide', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: false,
        data: null,
      });

      const result = await openaiProvider.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('generate()', () => {
    it('devrait générer une réponse avec succès', async () => {
      const mockResponse = {
        ok: true,
        data: {
          content: 'Réponse de test OpenAI',
          model: 'gpt-4o',
          tokens: 42,
          finishReason: 'stop',
        },
        error: null,
      };

      vi.mocked(invoke).mockResolvedValue(mockResponse);

      const result = await openaiProvider.generate('Question test');

      expect(result.content).toBe('Réponse de test OpenAI');
      expect(result.provider).toBe('openai');
      expect(result.model).toBe('gpt-4o');
      expect(result.tokens).toBe(42);
      expect(result.metadata?.latencyMs).toBeGreaterThanOrEqual(0);
      expect(invoke).toHaveBeenCalledWith('chat_generate_openai', {
        message: 'Question test',
        history: [],
        config: expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.7,
        }),
      });
    });

    it('devrait rejeter un message vide', async () => {
      await expect(openaiProvider.generate('')).rejects.toThrow('Message vide');
      await expect(openaiProvider.generate('   ')).rejects.toThrow('Message vide');
    });

    it('devrait gérer une clé API invalide (401)', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'invalid_api_key: clé invalide',
      });

      await expect(openaiProvider.generate('Test')).rejects.toThrow(
        'Clé API OpenAI invalide'
      );
    });

    it('devrait gérer un rate limit (429)', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'rate_limit_exceeded',
      });

      await expect(openaiProvider.generate('Test')).rejects.toThrow(
        'Limite de taux OpenAI atteinte'
      );
    });

    it('devrait gérer un timeout', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'Request timed out after 30s',
      });

      await expect(openaiProvider.generate('Test')).rejects.toThrow(
        "Délai d'attente OpenAI dépassé"
      );
    });

    it('devrait gérer un quota insuffisant', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'insufficient_quota: Quota épuisé',
      });

      await expect(openaiProvider.generate('Test')).rejects.toThrow(
        'Quota OpenAI épuisé'
      );
    });

    it("devrait convertir l'historique correctement", async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: true,
        data: { content: 'Réponse', model: 'gpt-4o' },
        error: null,
      });

      const history = [
        { role: 'user' as const, content: 'Bonjour', timestamp: 1000 },
        { role: 'assistant' as const, content: 'Salut', timestamp: 2000 },
      ];

      await openaiProvider.generate('Question', history);

      expect(invoke).toHaveBeenCalledWith('chat_generate_openai', {
        message: 'Question',
        history: [
          { role: 'user', content: 'Bonjour' },
          { role: 'assistant', content: 'Salut' },
        ],
        config: expect.any(Object),
      });
    });

    it('devrait accepter une config personnalisée', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: true,
        data: { content: 'OK', model: 'gpt-4' },
        error: null,
      });

      await openaiProvider.generate('Test', [], {
        model: 'gpt-4',
        temperature: 0.9,
        maxTokens: 4096,
      });

      expect(invoke).toHaveBeenCalledWith('chat_generate_openai', {
        message: 'Test',
        history: [],
        config: expect.objectContaining({
          model: 'gpt-4',
          temperature: 0.9,
          maxTokens: 4096,
        }),
      });
    });
  });

  describe('testConnection()', () => {
    it('devrait réussir le test de connexion', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: true,
        data: { content: 'Test OK', model: 'gpt-4o-mini' },
        error: null,
      });

      const result = await openaiProvider.testConnection!();

      expect(result.success).toBe(true);
      expect(result.message).toContain('OpenAI opérationnel');
      expect(result.message).toContain('gpt-4o-mini');
    });

    it('devrait échouer le test de connexion', async () => {
      vi.mocked(invoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'Connexion échouée',
      });

      const result = await openaiProvider.testConnection!();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erreur OpenAI');
    });
  });

  describe('getStats()', () => {
    it('devrait retourner les statistiques du provider', () => {
      const stats = openaiProvider.getStats!();

      expect(stats).toEqual({
        provider: 'openai',
        models: OPENAI_MODELS,
        defaultModel: 'gpt-4o-mini',
      });
    });
  });

  describe('Métadonnées', () => {
    it('devrait avoir le bon nom de provider', () => {
      expect(openaiProvider.name).toBe('openai');
    });
  });
});
