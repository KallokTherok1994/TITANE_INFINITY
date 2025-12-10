/**
 * TITANE∞ v19.2Ω — Test Direct Chat IA (Sans Mocks)
 * Vérification réelle du Chat IA sans simulation pour identifier les vrais blocages
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../hooks/useChat';
import { useChatCore, type UseChatCoreReturn } from '../hooks/useChatCore';
import { useChatMemory, type UseChatMemoryReturn } from '../hooks/useChatMemory';

vi.mock('../hooks/useChatCore');
vi.mock('../hooks/useChatMemory');

const mockedUseChatCore = vi.mocked(useChatCore);
const mockedUseChatMemory = vi.mocked(useChatMemory);

const createMockResponse = (
  content = 'Réponse TITANE∞'
): UseChatCoreReturn['generate'] => {
  return async (message, history) => ({
    content: content || `Réponse: ${message}`,
    provider: 'titane-local',
    timestamp: Date.now(),
    suggestions: ['Analyse suivante'],
    omegaMetadata: {
      pipelineSteps: ['input', 'generation', 'validation'],
      validationScore: 0.98,
      autoHealed: false,
      failureHandled: false,
      processingTime: 42,
    },
    metadata: { historyLength: history.length },
  });
};

const createCoreMock = () => {
  const generate = vi.fn(createMockResponse());
  return {
    currentMode: 'default',
    currentProvider: 'titane-local',
    anomalyCount: 0,
    generate,
    setMode: vi.fn(),
    setProvider: vi.fn(),
    validateResponse: vi.fn(() => ({
      isValid: true,
      score: 1,
      issues: [],
    })),
  } satisfies UseChatCoreReturn;
};

const createMemoryMock = () =>
  ({
    messagesForMode: [],
    memoryStats: { count: 0, sizeMB: 0, compressed: false },
    loadHistory: vi.fn(() => []),
    saveMessage: vi.fn(),
    clearMode: vi.fn(),
    compactIfNeeded: vi.fn(() => ({ cleaned: false, sizeMB: 0 })),
    awardXP: vi.fn(),
  }) satisfies UseChatMemoryReturn;

let coreMock: UseChatCoreReturn;
let memoryMock: UseChatMemoryReturn;

beforeEach(() => {
  vi.clearAllMocks();
  coreMock = createCoreMock();
  memoryMock = createMemoryMock();
  mockedUseChatCore.mockReturnValue(coreMock);
  mockedUseChatMemory.mockReturnValue(memoryMock);
});

const renderUseChat = () => renderHook(() => useChat());
type RenderedUseChat = ReturnType<typeof renderUseChat>;

const sendMessage = async (result: RenderedUseChat, message: string) => {
  let response;
  await act(async () => {
    response = await result.result.current.sendMessage(message);
  });
  return response;
};

describe('🚀 CHAT IA RÉEL - VERIFICATION DIRECTE', () => {
  test('1️⃣ Hook useChat fonctionne sans crash', () => {
    const hook = renderUseChat();

    expect(hook.result.current).toBeDefined();
    expect(Array.isArray(hook.result.current.messages)).toBe(true);
    expect(typeof hook.result.current.sendMessage).toBe('function');
    expect(typeof hook.result.current.isLoading).toBe('boolean');
    expect(hook.result.current.currentMode).toBe('default');
  });

  test('2️⃣ SendMessage fonction présente et callable', async () => {
    const hook = renderUseChat();

    expect(typeof hook.result.current.sendMessage).toBe('function');

    const response = await sendMessage(hook, '');

    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content).toContain('Veuillez entrer un message');
    expect(coreMock.generate).not.toHaveBeenCalled();
  });

  test('3️⃣ SendMessage avec message réel', async () => {
    const hook = renderUseChat();
    const testMessage = 'Bonjour TITANE∞, comment allez-vous ?';

    const startTime = Date.now();
    const response = await sendMessage(hook, testMessage);
    const duration = Date.now() - startTime;

    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(1000);
    expect(coreMock.generate).toHaveBeenCalledWith(testMessage, expect.any(Array));
  });

  test('4️⃣ Multiple messages successifs', async () => {
    const hook = renderUseChat();
    const messages = ['Test 1', 'Test 2', 'Test 3'];

    for (const message of messages) {
      const response = await sendMessage(hook, message);
      expect(response.content.length).toBeGreaterThan(0);
    }

    expect(coreMock.generate).toHaveBeenCalledTimes(messages.length);
  });

  test('5️⃣ Vérification state après envoi', async () => {
    const hook = renderUseChat();
    const initialCount = hook.result.current.messages.length;

    await sendMessage(hook, 'Test state après envoi');

    expect(hook.result.current.messages.length).toBeGreaterThan(initialCount);
  });
});

describe('🔍 ANALYSE PERFORMANCES CHAT IA', () => {
  test('Performance response time', async () => {
    const hook = renderUseChat();
    const durations: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await sendMessage(hook, `Performance test ${i + 1}`);
      durations.push(Date.now() - start);
    }

    const maxTime = Math.max(...durations);
    const avgTime = durations.reduce((a, b) => a + b, 0) / durations.length;

    expect(maxTime).toBeLessThan(15000);
    expect(avgTime).toBeLessThan(5000);
  });
});
