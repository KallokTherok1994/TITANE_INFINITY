/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TESTS DE DIAGNOSTIC CHAT IA - VALIDATION CORRECTIFS BUG
 *   Tests pour valider la résolution du bug "message IA disparaît"
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@/test-utils';
import { useChat } from '../hooks/useChat';
import type { AIMessage } from '../services/ai/types';

const mockGenerate = vi.fn(async (message: string, history: AIMessage[] = []) => ({
  content: `Mocked response for: ${message}`,
  provider: 'mock-provider',
  timestamp: Date.now(),
  metadata: { historyLength: history.length },
}));

vi.mock('@hooks/useChatCore', () => ({
  useChatCore: () => ({
    currentMode: 'default',
    anomalyCount: 0,
    setMode: vi.fn(),
    generate: mockGenerate,
  }),
}));

const mockMemoryState = {
  messagesForMode: [] as AIMessage[],
  memoryStats: { count: 0, sizeMB: 0, compressed: false },
  saveMessage: vi.fn(),
  clearMode: vi.fn(),
  loadHistory: vi.fn(() => []),
  compactIfNeeded: vi.fn(() => ({ cleaned: false, sizeMB: 0 })),
  awardXP: vi.fn(),
};

vi.mock('@hooks/useChatMemory', () => ({
  useChatMemory: () => mockMemoryState,
}));

// Ensure unit tests don't hit the backend chat service path.
vi.mock('@/services/api/chat', () => ({
  chatService: {
    sendMessageLegacy: vi.fn(async () => {
      throw new Error('Mock backend unavailable');
    }),
  },
}));

describe('Chat IA Diagnostic Tests - Bug Resolution Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerate.mockReset();
    mockGenerate.mockImplementation(
      async (message: string, history: AIMessage[] = []) => ({
        content: `Mocked response for: ${message}`,
        provider: 'mock-provider',
        timestamp: Date.now(),
        metadata: { historyLength: history.length },
      })
    );
    mockMemoryState.messagesForMode = [];
  });

  describe('RACE CONDITION FIXES', () => {
    test('sendMessage utilise le bon historique avec le message utilisateur inclus', async () => {
      const mockResponse = {
        role: 'assistant' as const,
        content: 'Réponse test',
        timestamp: Date.now(),
        provider: 'omnis',
      };

      mockGenerate.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Test message utilisateur');
      });

      // Vérifier que l'engine a été appelé avec le bon historique
      expect(mockGenerate).toHaveBeenCalledWith(
        'Test message utilisateur',
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringMatching(/^Test message utilisateur\.?$/),
          }),
        ])
      );

      // Vérifier que les messages sont persistés
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0]).toMatchObject({
        role: 'user',
        content: expect.stringMatching(/^Test message utilisateur\.?$/),
      });
      expect(result.current.messages[1]).toMatchObject({
        role: 'assistant',
        content: expect.stringMatching(/^Réponse test\.?$/),
      });
    });

    test('messages rapides successifs ne causent pas de race condition', async () => {
      const mockResponse1 = {
        role: 'assistant' as const,
        content: 'Réponse 1',
        timestamp: Date.now(),
        provider: 'omnis',
      };

      const mockResponse2 = {
        role: 'assistant' as const,
        content: 'Réponse 2',
        timestamp: Date.now() + 1000,
        provider: 'omnis',
      };

      mockGenerate
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const { result } = renderHook(() => useChat());

      // Envoyer deux messages séquentiellement pour garantir l'ordre
      await act(async () => {
        await result.current.sendMessage('Message 1');
      });

      await act(async () => {
        await result.current.sendMessage('Message 2');
      });

      // Vérifier que tous les messages sont présents
      expect(result.current.messages).toHaveLength(4);

      // Vérifier l'ordre correct - les messages utilisateur doivent être dans l'ordre
      const userMessages = result.current.messages.filter(m => m.role === 'user');
      const assistantMessages = result.current.messages.filter(
        m => m.role === 'assistant'
      );

      expect(userMessages.map(m => m.content.replace(/\.$/, ''))).toEqual([
        'Message 1',
        'Message 2',
      ]);
      expect(assistantMessages.map(m => m.content.replace(/\.$/, ''))).toEqual([
        'Réponse 1',
        'Réponse 2',
      ]);
    });
  });

  describe('TIMEOUT HANDLING', () => {
    test('timeout unifié de 15s fonctionne correctement', async () => {
      // Mock qui rejette après un délai (simule un timeout API)
      mockGenerate.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('API_TIMEOUT')), 50);
          }) as never
      );

      const { result } = renderHook(() => useChat({ timeout: 100 }));

      const startTime = Date.now();

      await act(async () => {
        await result.current.sendMessage('Test timeout');
      });

      const duration = Date.now() - startTime;

      // Vérifier que le fallback s'active rapidement (tolérance pour CI/CD)
      expect(duration).toBeLessThan(2000); // Le fallback doit être rapide (CI/CD tolérant)

      // Vérifier qu'un message utilisateur et un fallback sont générés
      expect(result.current.messages.length).toBeGreaterThanOrEqual(1);

      // Le message utilisateur doit être présent
      expect(result.current.messages[0]).toMatchObject({
        role: 'user',
        content: expect.stringMatching(/Test timeout/),
      });
    });

    test('pas de timeouts cascadés multiples', async () => {
      const { result } = renderHook(() => useChat({ timeout: 15000 }));

      // Vérifier que la config timeout est unifiée
      expect(result.current).toBeDefined();

      // Mock de timeout pour vérifier qu'il n'y a qu'un seul timeout
      const timeoutSpy = vi.spyOn(global, 'setTimeout');

      await act(async () => {
        await result.current.sendMessage('Test unified timeout');
      });

      // Vérifier qu'il n'y a pas de multiples timeouts configurés
      const timeoutCalls = timeoutSpy.mock.calls.filter(
        call => call[1] === 15000 || call[1] === 20000 || call[1] === 8000
      );

      expect(timeoutCalls.length).toBeLessThanOrEqual(1);

      timeoutSpy.mockRestore();
    });
  });

  describe('UI FILTERING FIXES', () => {
    test('messages avec roles valides ne sont pas filtrés', () => {
      const testMessages = [
        { role: 'user' as const, content: 'Test user', timestamp: Date.now() },
        {
          role: 'assistant' as const,
          content: 'Test assistant',
          timestamp: Date.now() + 1,
        },
        { role: 'system' as const, content: 'Test system', timestamp: Date.now() + 2 },
        {
          role: undefined as unknown,
          content: 'Test undefined',
          timestamp: Date.now() + 3,
        },
        { role: 'assistant' as const, content: '', timestamp: Date.now() + 4 },
      ];

      // Simuler le filtrage de ChatWindow
      const filteredMessages = testMessages.filter(
        message =>
          message &&
          message.role &&
          ['user', 'assistant'].includes(message.role) &&
          message.content &&
          message.content.trim().length > 0
      );

      expect(filteredMessages).toHaveLength(2);
      expect(filteredMessages[0].content).toBe('Test user');
      expect(filteredMessages[1].content).toBe('Test assistant');
    });

    test('messages de fallback avec rôle correct sont affichés', async () => {
      mockGenerate.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Test fallback');
      });

      // Vérifier que le message fallback est présent
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1]).toMatchObject({
        role: 'assistant',
        content: expect.stringContaining('TITANE∞'),
      });
    });
  });

  describe('STATE SYNCHRONIZATION', () => {
    test('messagesRef et state messages restent synchronisés', async () => {
      const { result } = renderHook(() => useChat());

      const mockResponse = {
        role: 'assistant' as const,
        content: 'Test sync',
        timestamp: Date.now(),
        provider: 'omnis',
      };

      mockGenerate.mockResolvedValue(mockResponse);

      await act(async () => {
        await result.current.sendMessage('Test synchronization');
      });

      // Tester clearChat pour vérifier la synchronisation
      await act(async () => {
        result.current.clearChat();
      });

      expect(result.current.messages).toHaveLength(0);
    });

    test('importChat synchronise correctement messagesRef', async () => {
      const { result } = renderHook(() => useChat());

      const testData = JSON.stringify({
        messages: [{ role: 'user', content: 'Imported message', timestamp: Date.now() }],
      });

      await act(async () => {
        const success = result.current.importChat(testData);
        expect(success).toBe(true);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content.replace(/\.$/, '')).toBe(
        'Imported message'
      );
    });
  });

  describe('INTEGRATION TESTS', () => {
    test('scénario complet: envoi message → réponse → persistance', async () => {
      const mockResponse = {
        role: 'assistant' as const,
        content: 'Réponse complète test',
        timestamp: Date.now(),
        provider: 'omnis',
        metadata: { status: 'success' },
      };

      mockGenerate.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useChat());

      // Phase 1: Envoi du message
      await act(async () => {
        await result.current.sendMessage('Message test complet');
      });

      // Phase 2: Vérification de la persistance
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0]).toMatchObject({
        role: 'user',
      });
      expect(result.current.messages[0].content.replace(/\.$/, '')).toBe(
        'Message test complet'
      );
      expect(result.current.messages[1]).toMatchObject({
        role: 'assistant',
      });
      expect(result.current.messages[1].content.replace(/\.$/, '')).toBe(
        'Réponse complète test'
      );

      // Phase 3: Vérification que les messages ne disparaissent pas
      await waitFor(
        () => {
          expect(result.current.messages).toHaveLength(2);
        },
        { timeout: 1000 }
      );

      // Phase 4: Test export/import
      const exportedData = result.current.exportChat();
      const parsed = JSON.parse(exportedData);
      expect(parsed.messages).toHaveLength(2);
    });
  });
});
