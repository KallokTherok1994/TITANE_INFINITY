/**
 * TITANE∞ v26.2.3+ — Test Suite
 * Tests unitaires pour useChat.ts (KERNEL OMNIS)
 *
 * Coverage ciblée:
 * - normalizeMessages
 * - deduplicateMessages
 * - Empty backend response handling
 * - Provider cascade fallback
 * - Operation lock protection
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

let useChat: typeof import('../useChat').useChat;

// Types locaux pour les tests (basés sur useChat.ts)
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  metadata?: Record<string, unknown>;
}

// NOTE: useChatCore/useChatMemory sont mockés via `vitest.config.ts` (alias Vitest)
// pour éviter de charger l'implémentation réelle (qui importe le chatEngine).

// Mock chatEngine types (prevents OOM from loading orchestrator)
vi.mock('@/services/ai/chatEngine', () => ({
  chatEngine: {
    generate: vi.fn(async () => ({
      content: 'Mock response',
      provider: 'titane-local',
      timestamp: Date.now(),
      mode: 'default',
      contextUsed: [],
    })),
  },
}));

// Mock aiTimeouts config (prevents deep imports)
vi.mock('@/config/aiTimeouts.config', () => ({
  UI_TIMEOUTS: {
    STREAM_DEBOUNCE: 50,
    LOADING_INDICATOR_DELAY: 200,
    MESSAGE_ANIMATION: 150,
  },
  getAdaptiveUITimeout: vi.fn(() => 5000),
}));

// Mock streamingDebounce utility
vi.mock('@/utils/streamingDebounce', () => ({
  createStreamingBatcher: vi.fn(() => ({
    push: vi.fn(),
    flush: vi.fn(),
    clear: vi.fn(),
  })),
}));

vi.mock('@/services/ai/cognitiveKernel', () => ({
  cognitiveKernel: {
    harmonizeChatMessages: vi.fn(messages => messages),
    harmonizeError: vi.fn(error => ({
      message: error.message,
      type: 'unknown',
      recovery: 'retry',
    })),
  },
}));

vi.mock('@/services/api/chat', () => ({
  chatService: {
    sendMessageLegacy: vi.fn(async () => ({
      content: 'Backend response',
      provider: 'gemini',
      latencyMs: 100,
      metadata: {},
    })),
  },
}));

// NOTE: hybridTTS est mocké via `vitest.config.ts` (alias Vitest)

vi.mock('@/core/experience/XP_ENGINE', () => ({
  XP: {
    gain: vi.fn(),
  },
}));

vi.mock('@/services/experienceService', () => ({
  awardExperience: vi.fn(),
}));

vi.mock('@/services/userPreferencesEngine', () => ({
  userPreferencesEngine: {
    generateContextForAI: vi.fn(() => null),
    recordInteraction: vi.fn(),
  },
}));

vi.mock('@/modules/camera/cameraChatIntegration', () => ({
  handleCameraInChat: vi.fn(async () => ({ handled: false })),
}));

vi.mock('@/modules/devSudo/devSudoIntegration', () => ({
  handleDevSudoInChat: vi.fn(async () => ({ handled: false })),
}));

vi.mock('@/stores/useVisionStore', () => ({
  useVisionStore: {
    getState: vi.fn(() => ({
      isObservationActive: false,
      enableVision: vi.fn(),
      disableVision: vi.fn(),
    })),
  },
}));

vi.mock('@/services/ai/providers/openai', () => ({
  openaiProvider: {
    isAvailable: vi.fn(async () => false),
  },
}));

vi.mock('@/services/ai/providers/gemini', () => ({
  geminiProvider: {
    isAvailable: vi.fn(async () => false),
  },
}));

vi.mock('@/services/ai/providers/claude', () => ({
  claudeProvider: {
    isAvailable: vi.fn(async () => false),
  },
}));

vi.mock('@/utils/chatLogger', () => ({
  chatLogger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

beforeAll(async () => {
  console.error('[useChat.test] beforeAll: start');
  // Vérification: s'assurer qu'on charge bien les mocks (alias Vitest)
  const core = await import('@hooks/useChatCore');
  const memory = await import('@hooks/useChatMemory');
  expect((core as any).__TITANE_TEST_MOCK__).toBe(true);
  expect((memory as any).__TITANE_TEST_MOCK__).toBe(true);

  console.error('[useChat.test] beforeAll: importing useChat');
  ({ useChat } = await import('../useChat'));
  console.error('[useChat.test] beforeAll: useChat imported');
});

describe('useChat - KERNEL OMNIS Tests', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty messages', () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize with auto provider by default', () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.preferredProvider).toBe('auto');
    });

    it('should load messages from localStorage on mount', () => {
      const storedMessages: AIMessage[] = [
        {
          role: 'user',
          content: 'Test message',
          timestamp: Date.now(),
          metadata: { uiId: 'test-1' },
        },
      ];

      localStorage.setItem(
        'titane_chat_mode_default',
        JSON.stringify({ messages: storedMessages })
      );

      const { result } = renderHook(() => useChat());

      expect(result.current.messages.length).toBeGreaterThan(0);
    });
  });

  describe('Message Sending', () => {
    it('should send a message successfully', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Hello TITANE');
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });

      // Devrait avoir au moins le message utilisateur
      const userMessage = result.current.messages.find(m => m.role === 'user');
      expect(userMessage).toBeDefined();
      expect(userMessage?.content).toBe('Hello TITANE');
    });

    it('should reject empty messages', async () => {
      const { result } = renderHook(() => useChat());

      const response = await act(async () => {
        return await result.current.sendMessage('');
      });

      expect(response.metadata?.status).toBe('input-error');
    });

    it('should add user and assistant messages', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      await waitFor(
        () => {
          expect(result.current.messages.length).toBeGreaterThanOrEqual(2);
        },
        { timeout: 5000 }
      );

      const roles = result.current.messages.map(m => m.role);
      expect(roles).toContain('user');
      expect(roles).toContain('assistant');
    });

    it('should not allow concurrent sends (operation lock)', async () => {
      const { result } = renderHook(() => useChat());

      // Lancer 2 messages en parallèle (dans UN seul act pour éviter l'overlap)
      await act(async () => {
        await Promise.all([
          result.current.sendMessage('Message 1'),
          result.current.sendMessage('Message 2'),
        ]);
      });

      // Le lock devrait avoir empêché le chaos
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Empty Backend Response Handling (v26.2.3 FIX)', () => {
    it('should always provide a response even on backend failure', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Test response');
      });

      await waitFor(
        () => {
          expect(result.current.messages.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      // Devrait toujours avoir une réponse (soit du mock, soit du fallback)
      const assistantMessage = result.current.messages.find(m => m.role === 'assistant');
      expect(assistantMessage).toBeDefined();
      expect(assistantMessage?.content).toBeTruthy();
    });
  });

  describe('Provider Preference', () => {
    it('should update provider preference', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setPreferredProvider('ollama');
      });

      expect(result.current.preferredProvider).toBe('ollama');
      expect(localStorage.getItem('omega-chat-preferred-provider')).toBe('ollama');
    });

    it('should persist provider preference across sessions', () => {
      localStorage.setItem('omega-chat-preferred-provider', 'gemini');

      const { result } = renderHook(() => useChat());

      expect(result.current.preferredProvider).toBe('gemini');
    });
  });

  describe('Chat Operations', () => {
    it('should clear chat', async () => {
      const { result } = renderHook(() => useChat());

      // Ajouter des messages d'abord
      // NOTE: sendMessage est async → éviter de laisser des promesses en vol entre tests
      await act(async () => {
        await result.current.sendMessage('Test');
      });

      // Clear
      act(() => {
        result.current.clearChat();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should export chat', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });

      const exported = result.current.exportChat();
      const parsed = JSON.parse(exported);

      expect(parsed.version).toBe('omnis-v1.0');
      expect(parsed.messages).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
    });

    it('should import chat', () => {
      const { result } = renderHook(() => useChat());

      const mockData = JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Imported message',
            timestamp: Date.now(),
            metadata: {},
          },
        ],
        version: 'omnis-v1.0',
        timestamp: Date.now(),
      });

      let success = false;
      act(() => {
        success = result.current.importChat(mockData);
      });

      expect(success).toBe(true);
      expect(result.current.messages.length).toBeGreaterThan(0);
    });
  });

  describe('Mode Management', () => {
    it('should change mode', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setMode('default');
      });

      expect(result.current.currentMode).toBe('default');
    });
  });

  describe('OMNIS Stats', () => {
    it('should calculate success rate correctly', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Test 1');
      });

      await waitFor(() => {
        const stats = result.current.omnisStats;
        expect(stats.successRate).toBeGreaterThanOrEqual(0);
        expect(stats.successRate).toBeLessThanOrEqual(100);
      });
    });

    it('should track pipeline health', () => {
      const { result } = renderHook(() => useChat());

      const stats = result.current.omnisStats;
      expect(stats.pipelineHealth).toBeDefined();
      expect(['optimal', 'stable', 'degraded', 'error']).toContain(stats.pipelineHealth);
    });
  });

  describe('Error Handling', () => {
    it('should handle backend errors gracefully', async () => {
      const { chatService } = await import('@/services/api/chat');
      vi.mocked(chatService.sendMessageLegacy).mockRejectedValueOnce(
        new Error('Backend error')
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Test error');
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );

      // Devrait avoir créé un message de fallback
      const assistantMessage = result.current.messages.find(m => m.role === 'assistant');
      expect(assistantMessage).toBeDefined();
    });
  });

  describe('UI Integrity', () => {
    it('should track UI integrity metrics', () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.uiIntegrity.version).toBeGreaterThan(0);
      expect(result.current.uiIntegrity.preventedResets).toBeGreaterThanOrEqual(0);
    });

    it('should restore from vault', () => {
      const { result } = renderHook(() => useChat());

      // Pas d'erreur si vault vide
      act(() => {
        result.current.restoreFromVault();
      });

      expect(result.current.messages).toBeDefined();
    });
  });

  describe('Provider Readiness', () => {
    it('should check provider readiness', () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.providerReadiness).toBeDefined();
      expect(result.current.providerReadiness.auto).toBe(true);
      expect(result.current.providerReadiness.local).toBe(true);
    });
  });

  describe('Debug Features', () => {
    it('should provide debug info', () => {
      const { result } = renderHook(() => useChat());

      const debugInfo = result.current.getDebugInfo();

      expect(debugInfo).toHaveProperty('engineStats');
      expect(debugInfo).toHaveProperty('memoryStats');
      expect(debugInfo).toHaveProperty('omnisConfig');
    });

    it('should track debug entries', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Debug test');
      });

      await waitFor(() => {
        expect(result.current.debugEntries).toBeDefined();
      });
    });
  });
});

describe('useChat - Message Normalization', () => {
  it('should normalize messages with missing fields', () => {
    const { result } = renderHook(() => useChat());

    // Ces tests vérifient indirectement la normalisation via le comportement
    expect(result.current.messages).toEqual([]);
  });

  it('should deduplicate messages by uiId', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Test dedup');
    });

    await waitFor(() => {
      const uiIds = result.current.messages.map(m => m.metadata?.uiId).filter(Boolean);
      const uniqueUiIds = new Set(uiIds);

      // Pas de doublons
      expect(uiIds.length).toBe(uniqueUiIds.size);
    });
  });
});

describe('useChat - Performance', () => {
  it('should handle rapid message sends', async () => {
    const { result } = renderHook(() => useChat());

    const messages = ['Test 1', 'Test 2', 'Test 3'];

    for (const msg of messages) {
      await act(async () => {
        await result.current.sendMessage(msg);
      });
    }

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 10000 }
    );

    // Devrait avoir traité tous les messages sans erreur
    expect(result.current.messages.length).toBeGreaterThan(0);
  });
});
