/**
 * Tests du provider Anthropic Claude
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { claudeProvider, CLAUDE_MODELS } from '../claude';
import { secureInvoke } from '@/lib/security';

// Mock Tauri secureInvoke
vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

describe('Claude Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAvailable()', () => {
    it('devrait retourner true si la clé est configurée', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: true,
        data: { configured: true },
      });

      const result = await claudeProvider.isAvailable();

      expect(result).toBe(true);
      expect(secureInvoke).toHaveBeenCalledWith('get_anthropic_key_status');
    });

    it("devrait retourner false si la clé n'est pas configurée", async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: true,
        data: { configured: false },
      });

      const result = await claudeProvider.isAvailable();

      expect(result).toBe(false);
    });

    it("devrait retourner false en cas d'erreur backend", async () => {
      vi.mocked(secureInvoke).mockRejectedValue(new Error('Backend error'));

      const result = await claudeProvider.isAvailable();

      expect(result).toBe(false);
    });

    it('devrait retourner false si la réponse est invalide', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
      });

      const result = await claudeProvider.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('generate()', () => {
    it('devrait générer une réponse avec succès', async () => {
      const mockResponse = {
        ok: true,
        data: {
          content: 'Réponse de test Claude',
          model: 'claude-3-5-sonnet-20241022',
          tokens: 58,
          stopReason: 'end_turn',
        },
        error: null,
      };

      vi.mocked(secureInvoke).mockResolvedValue(mockResponse);

      const result = await claudeProvider.generate('Question test');

      expect(result.content).toBe('Réponse de test Claude');
      expect(result.provider).toBe('claude');
      expect(result.model).toBe('claude-3-5-sonnet-20241022');
      expect(result.tokens).toBe(58);
      expect(result.metadata?.latencyMs).toBeGreaterThanOrEqual(0);
      expect(secureInvoke).toHaveBeenCalledWith('chat_generate_claude', {
        message: 'Question test',
        history: [],
        config: expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
          temperature: 0.7,
        }),
      });
    });

    it('devrait rejeter un message vide', async () => {
      await expect(claudeProvider.generate('')).rejects.toThrow('Message vide');
      await expect(claudeProvider.generate('   ')).rejects.toThrow('Message vide');
    });

    it('devrait gérer une clé API invalide (401)', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'invalid_api_key: clé invalide',
      });

      await expect(claudeProvider.generate('Test')).rejects.toThrow(
        'Clé API Anthropic invalide'
      );
    });

    it('devrait gérer un rate limit (429)', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'rate_limit_exceeded',
      });

      await expect(claudeProvider.generate('Test')).rejects.toThrow(
        'Limite de taux Anthropic atteinte'
      );
    });

    it('devrait gérer un timeout', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'Request timed out after 30s',
      });

      await expect(claudeProvider.generate('Test')).rejects.toThrow(
        "Délai d'attente Claude dépassé"
      );
    });

    it('devrait gérer une surcharge serveur (529)', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'overloaded_error: Serveurs surchargés',
      });

      await expect(claudeProvider.generate('Test')).rejects.toThrow(
        'Serveurs Claude surchargés'
      );
    });

    it('devrait gérer un quota insuffisant', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'insufficient_quota: Quota épuisé',
      });

      await expect(claudeProvider.generate('Test')).rejects.toThrow(
        'Quota Anthropic épuisé'
      );
    });

    it("devrait convertir l'historique correctement", async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: true,
        data: { content: 'Réponse', model: 'claude-3-sonnet' },
        error: null,
      });

      const history = [
        { role: 'user' as const, content: 'Bonjour', timestamp: 1000 },
        { role: 'assistant' as const, content: 'Salut', timestamp: 2000 },
      ];

      await claudeProvider.generate('Question', history);

      expect(secureInvoke).toHaveBeenCalledWith('chat_generate_claude', {
        message: 'Question',
        history: [
          { role: 'user', content: 'Bonjour' },
          { role: 'assistant', content: 'Salut' },
        ],
        config: expect.any(Object),
      });
    });

    it('devrait accepter une config personnalisée', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: true,
        data: { content: 'OK', model: 'claude-3-opus' },
        error: null,
      });

      await claudeProvider.generate('Test', [], {
        model: 'claude-3-opus-20240229',
        temperature: 0.9,
        maxTokens: 4096,
      });

      expect(secureInvoke).toHaveBeenCalledWith('chat_generate_claude', {
        message: 'Test',
        history: [],
        config: expect.objectContaining({
          model: 'claude-3-opus-20240229',
          temperature: 0.9,
          maxTokens: 4096,
        }),
      });
    });
  });

  describe('testConnection()', () => {
    it('devrait réussir le test de connexion', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: true,
        data: { content: 'Test OK', model: 'claude-3-5-sonnet-20241022' },
        error: null,
      });

      const result = await claudeProvider.testConnection!();

      expect(result.success).toBe(true);
      expect(result.message).toContain('Claude opérationnel');
      expect(result.message).toContain('claude-3-5-sonnet');
    });

    it('devrait échouer le test de connexion', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'Connexion échouée',
      });

      const result = await claudeProvider.testConnection!();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erreur Claude');
    });
  });

  describe('getStats()', () => {
    it('devrait retourner les statistiques du provider', () => {
      const stats = claudeProvider.getStats!();

      expect(stats).toEqual({
        provider: 'claude',
        models: CLAUDE_MODELS,
        defaultModel: 'claude-3-5-sonnet-20241022',
      });
    });
  });

  describe('Métadonnées', () => {
    it('devrait avoir le bon nom de provider', () => {
      expect(claudeProvider.name).toBe('claude');
    });
  });
});
