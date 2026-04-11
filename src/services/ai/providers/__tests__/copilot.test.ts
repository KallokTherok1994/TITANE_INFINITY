/**
 * Tests du provider GitHub Copilot
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { secureInvoke } from '@/lib/security';

// Mock Tauri secureInvoke
vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

// Mock retryStrategy — pass-through to test core logic
vi.mock('../../retryStrategy', () => ({
  withRetry: async (fn: () => Promise<unknown>) => await fn(),
  getRetryConfig: () => ({ retries: 1 }),
}));

// Mock apiCache — pass-through to test core logic
vi.mock('../../apiCache', () => ({
  withCache: async (
    _provider: string,
    _msg: string,
    _history: unknown[],
    fn: () => Promise<unknown>,
    _ttl?: number
  ) => await fn(),
  CACHE_TTL: { TECHNICAL: 300000 },
}));

// Mock statusCache — pass-through to test core logic
vi.mock('../../statusCache', () => {
  class MockStatusCache {
    async get(
      fetcher: () => Promise<unknown>,
      _fallback: () => unknown
    ) {
      return await fetcher();
    }
  }
  return { StatusCache: MockStatusCache };
});

// Mock autoHealEngine
vi.mock('../../autoHealEngine', () => ({
  autoHealEngine: {
    detectError: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after mocks
import {
  copilotProvider,
  COPILOT_MODELS,
  isValidGitHubToken,
  setCopilotApiKey,
  getCopilotStatus,
} from '../copilot';

describe('Copilot Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAvailable()', () => {
    it('devrait retourner true si le token est configuré et status ok', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        configured: true,
        status: 'ok',
      });

      const result = await copilotProvider.isAvailable();

      expect(result).toBe(true);
      expect(secureInvoke).toHaveBeenCalledWith('get_copilot_key_status');
    });

    it("devrait retourner false si le token n'est pas configuré", async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        configured: false,
        status: 'missing',
      });

      const result = await copilotProvider.isAvailable();

      expect(result).toBe(false);
    });

    it("devrait retourner false en cas d'erreur backend", async () => {
      vi.mocked(secureInvoke).mockRejectedValue(new Error('Backend error'));

      const result = await copilotProvider.isAvailable();

      expect(result).toBe(false);
    });

    it('devrait retourner false si status non-ok', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        configured: true,
        status: 'error',
      });

      const result = await copilotProvider.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('generate()', () => {
    it('devrait générer une réponse avec succès', async () => {
      const mockResponse = {
        ok: true,
        data: {
          content: 'Réponse de test Copilot',
          model: 'gpt-4',
          tokens: 35,
          finish_reason: 'stop',
        },
        error: null,
      };

      vi.mocked(secureInvoke).mockResolvedValue(mockResponse);

      const result = await copilotProvider.generate('Question test');

      expect(result.content).toBe('Réponse de test Copilot');
      expect(result.provider).toBe('copilot');
      expect(result.model).toBe('gpt-4');
      expect(result.tokens).toBe(35);
      expect(result.metadata?.latencyMs).toBeGreaterThanOrEqual(0);
      expect(secureInvoke).toHaveBeenCalledWith('chat_generate_copilot', {
        message: 'Question test',
        history: [],
        config: expect.objectContaining({
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });
    });

    it('devrait rejeter un message vide', async () => {
      await expect(copilotProvider.generate('')).rejects.toThrow('Message vide');
      await expect(copilotProvider.generate('   ')).rejects.toThrow('Message vide');
    });

    it('devrait gérer une erreur Copilot (ok=false)', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'Erreur Copilot inconnue',
      });

      await expect(copilotProvider.generate('Test')).rejects.toThrow(
        'Erreur Copilot inconnue'
      );
    });

    it('devrait gérer un rate limit (429)', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: false,
        data: null,
        error: 'rate limit exceeded (429)',
      });

      await expect(copilotProvider.generate('Test')).rejects.toThrow(
        'rate limit exceeded (429)'
      );
    });

    it('devrait gérer une erreur réseau', async () => {
      vi.mocked(secureInvoke).mockRejectedValue(new Error('Network error'));

      await expect(copilotProvider.generate('Test')).rejects.toThrow('Network error');
    });

    it("devrait convertir l'historique correctement", async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: true,
        data: { content: 'Réponse', model: 'gpt-4' },
        error: null,
      });

      const history = [
        { role: 'user' as const, content: 'Bonjour', timestamp: 1000 },
        { role: 'assistant' as const, content: 'Salut', timestamp: 2000 },
      ];

      await copilotProvider.generate('Question', history);

      expect(secureInvoke).toHaveBeenCalledWith('chat_generate_copilot', {
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
        data: { content: 'OK', model: 'gpt-4o' },
        error: null,
      });

      await copilotProvider.generate('Test', [], {
        model: 'gpt-4o',
        temperature: 0.9,
        maxTokens: 4096,
      });

      expect(secureInvoke).toHaveBeenCalledWith('chat_generate_copilot', {
        message: 'Test',
        history: [],
        config: expect.objectContaining({
          model: 'gpt-4o',
          temperature: 0.9,
          max_tokens: 4096,
        }),
      });
    });

    it('devrait utiliser le modèle par défaut si data.model est absent', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        ok: true,
        data: { content: 'Réponse sans modèle' },
        error: null,
      });

      const result = await copilotProvider.generate('Test');

      expect(result.model).toBe('gpt-4');
    });
  });

  describe('testConnection()', () => {
    it('devrait réussir le test de connexion', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        success: true,
        message: 'Copilot connection OK',
        latency_ms: 150,
        available_models: ['gpt-4', 'gpt-4o'],
      });

      const result = await copilotProvider.testConnection!();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Copilot connection OK');
      expect(result.latency).toBe(150);
      expect(secureInvoke).toHaveBeenCalledWith('test_copilot_connection');
    });

    it('devrait échouer le test de connexion', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        success: false,
        message: 'Token invalide',
      });

      const result = await copilotProvider.testConnection!();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Token invalide');
    });

    it("devrait gérer une erreur d'exception", async () => {
      vi.mocked(secureInvoke).mockRejectedValue(new Error('Connexion refusée'));

      const result = await copilotProvider.testConnection!();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Connexion refusée');
    });
  });

  describe('Métadonnées', () => {
    it('devrait avoir le bon nom de provider', () => {
      expect(copilotProvider.name).toBe('copilot');
    });

    it('devrait exporter les modèles Copilot', () => {
      expect(COPILOT_MODELS).toContain('gpt-4');
      expect(COPILOT_MODELS).toContain('gpt-4o');
      expect(COPILOT_MODELS).toContain('gpt-3.5-turbo');
      expect(COPILOT_MODELS).toHaveLength(3);
    });
  });

  describe('isValidGitHubToken()', () => {
    it('devrait accepter les tokens ghp_', () => {
      expect(isValidGitHubToken('ghp_abcdef1234567890abcdef')).toBe(true);
    });

    it('devrait accepter les tokens github_pat_', () => {
      expect(isValidGitHubToken('github_pat_abcdef1234567890')).toBe(true);
    });

    it('devrait accepter les tokens gho_', () => {
      expect(isValidGitHubToken('gho_abcdef1234567890abcdef')).toBe(true);
    });

    it('devrait rejeter un token vide', () => {
      expect(isValidGitHubToken('')).toBe(false);
    });

    it('devrait rejeter un token trop court', () => {
      expect(isValidGitHubToken('ghp_abc')).toBe(false);
    });

    it('devrait rejeter un token au format inconnu', () => {
      expect(isValidGitHubToken('sk-abcdef1234567890abcdef')).toBe(false);
      expect(isValidGitHubToken('random_token_value_here')).toBe(false);
    });
  });

  describe('setCopilotApiKey()', () => {
    it('devrait configurer la clé avec succès', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        configured: true,
        status: 'ok',
        message: 'Token enregistré',
      });

      const result = await setCopilotApiKey('ghp_test1234567890abcdef');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Token enregistré');
      expect(secureInvoke).toHaveBeenCalledWith('chat_set_copilot_key', {
        apiKey: 'ghp_test1234567890abcdef',
      });
    });

    it('devrait gérer un échec de configuration', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        configured: false,
        status: 'error',
        message: 'Format invalide',
      });

      const result = await setCopilotApiKey('bad-token');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Format invalide');
    });

    it("devrait gérer une erreur d'exception", async () => {
      vi.mocked(secureInvoke).mockRejectedValue(new Error('Backend unreachable'));

      const result = await setCopilotApiKey('ghp_test1234567890abcdef');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Backend unreachable');
    });
  });

  describe('getCopilotStatus()', () => {
    it('devrait retourner le statut complet quand configuré', async () => {
      vi.mocked(secureInvoke).mockResolvedValue({
        configured: true,
        status: 'ok',
      });

      const result = await getCopilotStatus();

      expect(result.configured).toBe(true);
      expect(result.available).toBe(true);
      expect(result.status).toBe('ok');
    });

    it("devrait gérer une erreur d'exception", async () => {
      vi.mocked(secureInvoke).mockRejectedValue(new Error('Status check failed'));

      const result = await getCopilotStatus();

      expect(result.configured).toBe(false);
      expect(result.available).toBe(false);
      expect(result.status).toBe('error');
    });
  });
});
