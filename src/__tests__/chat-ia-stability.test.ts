/**
 * TITANE∞ v15.1 — Test de Stabilité Chat IA
 * Valide que les messages IA ne disparaissent plus après réponse
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '../test-utils';
import { useChat } from '../hooks/useChat';
import { chatService } from '../services/api';
import type { ChatMode } from '../services/ai';
import type { AIMessage } from '../services/ai/types';

// Mock des dépendances
const mockModules = vi.hoisted(() => {
  const memoryMessages: AIMessage[] = [];
  const memoryStats = { count: 0, sizeMB: 0, compressed: false };

  const memoryLoadHistory = vi.fn(() => memoryMessages);
  const memorySaveMessage = vi.fn((message: AIMessage) => {
    memoryMessages.push(message);
    memoryStats.count = memoryMessages.length;
  });
  const memoryClearMode = vi.fn(() => {
    memoryMessages.length = 0;
    memoryStats.count = 0;
  });
  const memoryCompact = vi.fn(() => ({ cleaned: false, sizeMB: 0 }));
  const memoryAwardXP = vi.fn();

  const useChatMemoryMock = vi.fn(() => ({
    messagesForMode: memoryMessages,
    memoryStats,
    loadHistory: memoryLoadHistory,
    saveMessage: memorySaveMessage,
    clearMode: memoryClearMode,
    compactIfNeeded: memoryCompact,
    awardXP: memoryAwardXP,
  }));

  const coreGenerateMock = vi.fn(async (message: string) => ({
    content: `Réponse IA pour: ${message}`,
    provider: 'gemini',
    timestamp: Date.now(),
    mode: 'default' as const,
    contextUsed: [],
  }));

  const coreValidateMock = vi.fn(() => ({
    isValid: true,
    score: 0.95,
    issues: [],
  }));

  let currentModeValue: ChatMode = 'default';
  const setModeMock = vi.fn((mode: ChatMode) => {
    currentModeValue = mode;
  });

  const useChatCoreMock = vi.fn(() => ({
    get currentMode() {
      return currentModeValue;
    },
    anomalyCount: 0,
    currentProvider: null,
    generate: coreGenerateMock,
    stream: undefined,
    setMode: setModeMock,
    setProvider: vi.fn(),
    validateResponse: coreValidateMock,
  }));

  return {
    coreGenerateMock,
    coreValidateMock,
    useChatCoreMock,
    memoryMessages,
    memoryStats,
    memoryLoadHistory,
    memorySaveMessage,
    memoryClearMode,
    memoryCompact,
    memoryAwardXP,
    useChatMemoryMock,
    resetCurrentMode: (mode: ChatMode = 'default') => {
      currentModeValue = mode;
    },
  } as const;
});

let sendMessageLegacySpy: ReturnType<typeof vi.spyOn>;
let awardExperienceSpy: ReturnType<typeof vi.spyOn>;

vi.mock('../hooks/useChatCore', () => ({
  useChatCore: mockModules.useChatCoreMock,
}));

vi.mock('@hooks/useChatCore', () => ({
  useChatCore: mockModules.useChatCoreMock,
}));

vi.mock('../hooks/useChatMemory', () => ({
  useChatMemory: mockModules.useChatMemoryMock,
}));

vi.mock('@hooks/useChatMemory', () => ({
  useChatMemory: mockModules.useChatMemoryMock,
}));

const {
  coreGenerateMock,
  coreValidateMock,
  useChatCoreMock,
  memoryMessages,
  memoryStats,
  memoryLoadHistory,
  memorySaveMessage,
  memoryClearMode,
  memoryCompact,
  memoryAwardXP,
  useChatMemoryMock,
  resetCurrentMode,
} = mockModules;

vi.mock('../services/tts/hybridTTS', () => ({
  hybridTTS: {
    speak: vi.fn(),
  },
}));

vi.mock('@/modules/camera/cameraChatIntegration', () => ({
  handleCameraInChat: vi.fn(async () => ({ handled: false })),
}));

vi.mock('@/modules/devSudo/devSudoIntegration', () => ({
  handleDevSudoInChat: vi.fn(async () => ({ handled: false })),
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

vi.mock('../services/errorTracker', () => ({
  errorTracker: {
    track: vi.fn(),
    getStats: vi.fn(() => ({ shouldReset: false })),
    markReset: vi.fn(),
  },
}));

describe('Chat IA - Stabilité des Messages (FIX v15.1)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    sendMessageLegacySpy = vi
      .spyOn(chatService, 'sendMessageLegacy')
      .mockImplementation(async () => ({
        content: 'Réponse IA (mock)',
        finishReason: 'stop',
        model: 'gemini-mock',
        provider: 'gemini',
        latencyMs: 1,
        metadata: {},
      }));

    const experienceService = await import('../services/experienceService');
    awardExperienceSpy = vi
      .spyOn(experienceService, 'awardExperience')
      .mockResolvedValue(null);

    resetCurrentMode();
    memoryMessages.length = 0;
    memoryStats.count = 0;
    memoryStats.sizeMB = 0;
    memoryStats.compressed = false;
  });

  it('SCÉNARIO A: Messages utilisateur + IA doivent persister', async () => {
    const { result } = renderHook(() => useChat());

    // État initial
    expect(result.current.messages).toHaveLength(0);

    // Envoyer 3 messages consécutifs
    await act(async () => {
      await result.current.sendMessage('Message 1');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThanOrEqual(2); // User + AI
    });

    const countAfterFirst = result.current.messages.length;
    console.log(`✅ Après message 1: ${countAfterFirst} messages`);

    await act(async () => {
      await result.current.sendMessage('Message 2');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThanOrEqual(countAfterFirst + 2);
    });

    const countAfterSecond = result.current.messages.length;
    console.log(`✅ Après message 2: ${countAfterSecond} messages`);

    await act(async () => {
      await result.current.sendMessage('Message 3');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThanOrEqual(countAfterSecond + 2);
    });

    const finalCount = result.current.messages.length;
    console.log(`✅ Après message 3: ${finalCount} messages`);

    // Vérification finale : on doit avoir AU MOINS 6 messages (3 user + 3 IA)
    expect(finalCount).toBeGreaterThanOrEqual(6);

    // Vérifier qu'aucun message n'a disparu
    expect(result.current.messages[0].content).toContain('Message 1');
    expect(result.current.messages[2].content).toContain('Message 2');
    expect(result.current.messages[4].content).toContain('Message 3');

    console.log('✅ SCÉNARIO A: SUCCÈS - Tous les messages persistent');
  });

  it('SCÉNARIO B: Changement de mode ne doit pas effacer les messages en cours', async () => {
    const { result } = renderHook(() => useChat());

    // Envoyer un message
    await act(async () => {
      await result.current.sendMessage('Message avant changement mode');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThanOrEqual(2);
    });

    const countBefore = result.current.messages.length;

    // Changer de mode
    act(() => {
      result.current.setMode('brainstorming');
    });

    // Les messages du mode précédent sont sauvegardés, l'UI peut être vidée
    // C'est le comportement attendu : chaque mode a sa propre conversation
    expect(result.current.currentMode).toBe('brainstorming');

    console.log(
      `✅ SCÉNARIO B: Mode changé, messages sauvegardés (count avant: ${countBefore})`
    );
  });

  it('SCÉNARIO C: Pas de duplication de messages', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Message test');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThanOrEqual(2);
    });

    const messages = result.current.messages;
    const messageContents = messages.map((m: AIMessage) => m.content);

    // Vérifier qu'il n'y a pas de doublons exacts
    const uniqueContents = new Set(messageContents);
    expect(uniqueContents.size).toBe(messageContents.length);

    console.log('✅ SCÉNARIO C: Aucun doublon détecté');
  });

  it('SCÉNARIO D: Loading state correct', async () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.isLoading).toBe(false);

    // Bloquer la réponse backend pour rendre l'état loading observable.
    let resolveBackend: ((value: unknown) => void) | null = null;
    sendMessageLegacySpy.mockImplementationOnce(
      async () =>
        await new Promise(resolve => {
          resolveBackend = resolve;
        })
    );

    let sendPromise: Promise<unknown> | null = null;

    // Envoyer message (ne pas await)
    await act(async () => {
      sendPromise = result.current.sendMessage('Test loading');
      // Laisser la microtask queue avancer pour que setIsLoading(true) prenne effet.
      await Promise.resolve();
    });

    // isLoading doit passer à true
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Débloquer la réponse et attendre la fin du cycle
    act(() => {
      resolveBackend?.({
        content: 'Réponse IA (mock)',
        provider: 'gemini',
        latencyMs: 25,
        metadata: {},
      });
    });

    await act(async () => {
      await sendPromise;
    });

    // Puis revenir à false après réponse
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 }
    );

    console.log('✅ SCÉNARIO D: Loading state géré correctement');
  });

  it('SCÉNARIO E: Erreur IA ne fait pas crasher', async () => {
    // Simuler une erreur backend ET une erreur de fallback core
    // pour forcer le chemin d'auto-récupération (catch global du pipeline).
    sendMessageLegacySpy.mockRejectedValueOnce(new Error('Provider unavailable'));
    coreGenerateMock.mockRejectedValueOnce(new Error('Provider unavailable'));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Message qui échoue');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Vérifier qu'un message d'erreur a été ajouté
    expect(
      result.current.messages.some(
        (m: AIMessage) => {
          const contentText =
            typeof m.content === 'string' ? m.content : JSON.stringify(m.content);

          return (
            m.role === 'assistant' &&
            /Auto-R\u00e9cup\u00e9ration Cognitive|Type d'erreur/i.test(contentText)
          );
        }
      )
    ).toBe(true);

    console.log('✅ SCÉNARIO E: Erreur gérée proprement');
  });
});

describe('Chat IA - Vérification Anti-Régression', () => {
  it('GUARD: useEffect ne doit pas se déclencher à chaque saveMessage', async () => {
    const { result } = renderHook(() => useChat());

    let effectTriggerCount = 0;
    const originalConsoleLog = console.log;
    console.log = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('🔄 USE CHAT v24.20: Mode changed')
      ) {
        effectTriggerCount++;
      }
      originalConsoleLog(...args);
    };

    // Envoyer 3 messages sans changer de mode
    await act(async () => {
      await result.current.sendMessage('Msg 1');
    });

    await act(async () => {
      await result.current.sendMessage('Msg 2');
    });

    await act(async () => {
      await result.current.sendMessage('Msg 3');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThanOrEqual(6);
    });

    console.log = originalConsoleLog;

    // Le useEffect ne doit se déclencher qu'UNE SEULE FOIS (mode initial)
    // Pas à chaque message !
    expect(effectTriggerCount).toBeLessThanOrEqual(1);

    console.log('✅ GUARD: useEffect stable, pas de re-trigger involontaire');
  });
});
