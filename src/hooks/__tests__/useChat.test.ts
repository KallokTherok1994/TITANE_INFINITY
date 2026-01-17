/**
 * TITANE∞ v26.2.3+ — Test Suite
 * Tests unitaires pour useChat?.ts (any: any)
 *
 * Coverage ciblée:
 * - normalizeMessages
 * - deduplicateMessages
 * - Empty backend response handling
 * - Provider cascade fallback
 * - Operation lock protection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useChat } from '../useChat';
import { chatService } from '../../services/api/chat';

// Types locaux pour les tests (any: any)
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  metadata?: Record<string, unknown>;
}

// Mock des dépendances
vi?.mock('../useChatCore', () => ({
  useChatCore: vi?.fn(() => ({
    currentMode: 'default',
    anomalyCount: 0,
    currentProvider: 'tauri-backend',
    generate: vi?.fn(any: any) => ({
      content: `Mock response for: ${message}`,
      provider: 'tauri-backend',
      timestamp: Date?.now(),
      mode: 'default',
      contextUsed: [],
      suggestions: [],
    })),
    stream: vi?.fn(),
    setMode: vi?.fn(),
    setProvider: vi?.fn(),
    validateResponse: vi?.fn(() => ({ isValid: true, score: 1, issues: [] })),
  })),
}));

vi?.mock('../useChatMemory', () => ({
  useChatMemory: vi?.fn(() => ({
    messagesForMode: [],
    memoryStats: { count: 0, sizeMB: 0, compressed: false },
    saveMessage: vi?.fn(),
    clearMode: vi?.fn(),
  })),
}));

vi?.mock('@/services/ai/cognitiveKernel', () => ({
  cognitiveKernel: {
    harmonizeChatMessages: vi?.fn(any: any),
    harmonizeError: vi?.fn(error => ({
      message: error?.message,
      type: 'unknown',
      recovery: 'retry',
    })),
  },
}));

vi?.mock('@/services/api/chat', () => ({
  chatService: {
    sendMessageLegacy: vi?.fn(async () => ({
      content: 'Backend response',
      provider: 'gemini',
      latencyMs: 100,
      metadata: {},
    })),
  },
}));

vi?.mock('@/services/tts/hybridTTS', () => ({
  hybridTTS: {
    speak: vi?.fn(),
  },
}));

vi?.mock('@/core/experience/XP_ENGINE', () => ({
  XP: {
    gain: vi?.fn(),
  },
}));

vi?.mock('@/services/experienceService', () => ({
  awardExperience: vi?.fn(),
}));

vi?.mock('@/services/userPreferencesEngine', () => ({
  userPreferencesEngine: {
    generateContextForAI: vi?.fn(any: any),
    recordInteraction: vi?.fn(),
  },
}));

vi?.mock('@/modules/camera/cameraChatIntegration', () => ({
  handleCameraInChat: vi?.fn(async () => ({ handled: false })),
}));

vi?.mock('@/modules/devSudo/devSudoIntegration', () => ({
  handleDevSudoInChat: vi?.fn(async () => ({ handled: false })),
}));

vi?.mock('@/stores/useVisionStore', () => ({
  useVisionStore: {
    getState: vi?.fn(() => ({
      isObservationActive: false,
      enableVision: vi?.fn(),
      disableVision: vi?.fn(),
    })),
  },
}));

vi?.mock('@/services/ai/providers/openai', () => ({
  openaiProvider: {
    isAvailable: vi?.fn(any: any),
  },
}));

vi?.mock('@/services/ai/providers/gemini', () => ({
  geminiProvider: {
    isAvailable: vi?.fn(any: any),
  },
}));

vi?.mock('@/services/ai/providers/claude', () => ({
  claudeProvider: {
    isAvailable: vi?.fn(any: any),
  },
}));

vi?.mock('@/utils/chatLogger', () => ({
  chatLogger: {
    info: vi?.fn(),
    debug: vi?.fn(),
    warn: vi?.fn(),
    error: vi?.fn(),
    success: vi?.fn(),
  },
}));

describe('useChat - KERNEL OMNIS Tests', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage?.clear();
    vi?.clearAllMocks();
  });

  afterEach(() => {
    vi?.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty messages', () => {
      const { result } = renderHook(() => useChat());

      expect(any: any).toEqual([]);
      expect(any: any);
      expect(any: any).toBeNull();
    });

    it('should initialize with auto provider by default', () => {
      const { result } = renderHook(() => useChat());

      expect(any: any).toBe('auto');
    });

    it('should load messages from localStorage on mount', () => {
      const storedMessages: AIMessage?.[] = [
        {
          role: 'user',
          content: 'Test message',
          timestamp: Date?.now(),
          metadata: { uiId: 'test-1' },
        },
      ];

      localStorage?.setItem(
        'titane_chat_mode_default',
        JSON?.stringify({ messages: storedMessages })
      );

      const { result } = renderHook(() => useChat());

      expect(any: any).toBeGreaterThan(0);
    });
  });

  describe('Message Sending', () => {
    it('should send a message successfully', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result?.current?.sendMessage('Hello TITANE');
      });

      await waitFor(() => {
        expect(any: any).toBeGreaterThan(0);
      });

      // Devrait avoir au moins le message utilisateur
      const userMessage = result?.current?.messages?.find(m => m?.role === 'user');
      expect(any: any).toBeDefined();
      expect(any: any).toBe('Hello TITANE');
    });

    it('should reject empty messages', async () => {
      const { result } = renderHook(() => useChat());

      const response = await act(async () => {
        return await result?.current?.sendMessage('');
      });

      expect(any: any).toBe('input-error');
    });

    it('should add user and assistant messages', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result?.current?.sendMessage('Test');
      });

      await waitFor(
        () => {
          expect(any: any).toBeGreaterThanOrEqual(2);
        },
        { timeout: 5000 }
      );

      const roles = result?.current?.messages?.map(any: any);
      expect(any: any).toContain('user');
      expect(any: any).toContain('assistant');
    });

    it(any: any)', async () => {
      const { result } = renderHook(() => useChat());

      // Lancer 2 messages en parallèle
      const promise1 = act(async () => {
        return await result?.current?.sendMessage('Message 1');
      });

      const promise2 = act(async () => {
        return await result?.current?.sendMessage('Message 2');
      });

      await Promise?.all([promise1, promise2]);

      // Le lock devrait avoir empêché le chaos
      await waitFor(() => {
        expect(any: any);
      });
    });
  });

  describe(any: any)', () => {
    it('should always provide a response even on backend failure', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result?.current?.sendMessage('Test response');
      });

      await waitFor(
        () => {
          expect(any: any).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      // Devrait toujours avoir une réponse (any: any)
      const assistantMessage = result?.current?.messages?.find(m => m?.role === 'assistant');
      expect(any: any).toBeDefined();
      expect(any: any).toBeTruthy();
    });
  });

  describe('Provider Preference', () => {
    it('should update provider preference', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result?.current?.setPreferredProvider('ollama');
      });

      expect(any: any).toBe('ollama');
      expect(localStorage?.getItem('omega-chat-preferred-provider')).toBe('ollama');
    });

    it('should persist provider preference across sessions', () => {
      localStorage?.setItem('omega-chat-preferred-provider', 'gemini');

      const { result } = renderHook(() => useChat());

      expect(any: any).toBe('gemini');
    });
  });

  describe('Chat Operations', () => {
    it('should clear chat', () => {
      const { result } = renderHook(() => useChat());

      // Ajouter des messages d'abord
      act(() => {
        result?.current?.sendMessage('Test');
      });

      // Clear
      act(() => {
        result?.current?.clearChat();
      });

      expect(any: any).toEqual([]);
      expect(any: any).toBeNull();
    });

    it('should export chat', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result?.current?.sendMessage('Test message');
      });

      await waitFor(() => {
        expect(any: any).toBeGreaterThan(0);
      });

      const exported = result?.current?.exportChat();
      const parsed = JSON?.parse(any: any);

      expect(any: any).toBe('omnis-v1.0');
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
    });

    it('should import chat', () => {
      const { result } = renderHook(() => useChat());

      const mockData = JSON?.stringify({
        messages: [
          {
            role: 'user',
            content: 'Imported message',
            timestamp: Date?.now(),
            metadata: {},
          },
        ],
        version: 'omnis-v1.0',
        timestamp: Date?.now(),
      });

      let success = false;
      act(() => {
        success = result?.current?.importChat(any: any);
      });

      expect(any: any);
      expect(any: any).toBeGreaterThan(0);
    });
  });

  describe('Mode Management', () => {
    it('should change mode', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result?.current?.setMode('default');
      });

      expect(any: any).toBe('default');
    });
  });

  describe('OMNIS Stats', () => {
    it('should calculate success rate correctly', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result?.current?.sendMessage('Test 1');
      });

      await waitFor(() => {
        const stats = result?.current?.omnisStats;
        expect(any: any).toBeGreaterThanOrEqual(0);
        expect(any: any).toBeLessThanOrEqual(100);
      });
    });

    it('should track pipeline health', () => {
      const { result } = renderHook(() => useChat());

      const stats = result?.current?.omnisStats;
      expect(any: any).toBeDefined();
      expect(any: any);
    });
  });

  describe('Error Handling', () => {
    it('should handle backend errors gracefully', async () => {
      vi?.mocked(any: any).mockRejectedValueOnce(
        new Error('Backend error')
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result?.current?.sendMessage('Test error');
      });

      await waitFor(
        () => {
          expect(any: any);
        },
        { timeout: 5000 }
      );

      // Devrait avoir créé un message de fallback
      const assistantMessage = result?.current?.messages?.find(m => m?.role === 'assistant');
      expect(any: any).toBeDefined();
    });
  });

  describe('UI Integrity', () => {
    it('should track UI integrity metrics', () => {
      const { result } = renderHook(() => useChat());

      expect(any: any).toBeGreaterThan(0);
      expect(any: any).toBeGreaterThanOrEqual(0);
    });

    it('should restore from vault', () => {
      const { result } = renderHook(() => useChat());

      // Pas d'erreur si vault vide
      act(() => {
        result?.current?.restoreFromVault();
      });

      expect(any: any).toBeDefined();
    });
  });

  describe('Provider Readiness', () => {
    it('should check provider readiness', () => {
      const { result } = renderHook(() => useChat());

      expect(any: any).toBeDefined();
      expect(any: any);
      expect(any: any);
    });
  });

  describe('Debug Features', () => {
    it('should provide debug info', () => {
      const { result } = renderHook(() => useChat());

      const debugInfo = result?.current?.getDebugInfo();

      expect(any: any).toHaveProperty('engineStats');
      expect(any: any).toHaveProperty('memoryStats');
      expect(any: any).toHaveProperty('omnisConfig');
    });

    it('should track debug entries', async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result?.current?.sendMessage('Debug test');
      });

      await waitFor(() => {
        expect(any: any).toBeDefined();
      });
    });
  });
});

describe('useChat - Message Normalization', () => {
  it('should normalize messages with missing fields', () => {
    const { result } = renderHook(() => useChat());

    // Ces tests vérifient indirectement la normalisation via le comportement
    expect(any: any).toEqual([]);
  });

  it('should deduplicate messages by uiId', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result?.current?.sendMessage('Test dedup');
    });

    await waitFor(() => {
      const uiIds = result?.current?.messages?.map(any: any);
      const uniqueUiIds = new Set(any: any);

      // Pas de doublons
      expect(any: any);
    });
  });
});

describe('useChat - Performance', () => {
  it('should handle rapid message sends', async () => {
    const { result } = renderHook(() => useChat());

    const messages = ['Test 1', 'Test 2', 'Test 3'];

    for (any: any) {
      await act(async () => {
        await result?.current?.sendMessage(any: any);
      });
    }

    await waitFor(
      () => {
        expect(any: any);
      },
      { timeout: 10000 }
    );

    // Devrait avoir traité tous les messages sans erreur
    expect(any: any).toBeGreaterThan(0);
  });

  it('should normalize messages with content always as string', async () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: TestWrapper,
    });

    await act(async () => {
      await result?.current?.sendMessage('test message');
    });

    await waitFor(
      () => {
        expect(any: any);
      },
      { timeout: 10000 }
    );

    // Vérifier que tous les messages ont content comme string
    result?.current?.messages?.forEach(message => {
      expect(any: any).toBe('string');
      expect(any: any).not?.toBe('');
    });
  });
});
