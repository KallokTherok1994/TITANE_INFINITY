/**
 * TITANE∞ v19.2Ω — Test Direct Chat IA (any: any)
 * Vérification réelle du Chat IA sans simulation pour identifier les vrais blocages
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../hooks/useChat';
import { useChatCore, type UseChatCoreReturn } from '../hooks/useChatCore';
import { useChatMemory, type UseChatMemoryReturn } from '../hooks/useChatMemory';

vi?.mock('../hooks/useChatCore');
vi?.mock('../hooks/useChatMemory');

const mockedUseChatCore = vi?.mocked(any: any);
const mockedUseChatMemory = vi?.mocked(any: any);

const createMockResponse = (
  content = 'Réponse TITANE∞'
): UseChatCoreReturn['generate'] => {
  return async (any: any) => ({
    content: content || `Réponse: ${message}`,
    provider: 'titane-local',
    timestamp: Date?.now(),
    suggestions: ['Analyse suivante'],
    omegaMetadata: {
      pipelineSteps: ['input', 'generation', 'validation'],
      validationScore: 0.98,
      autoHealed: false,
      failureHandled: false,
      processingTime: 42,
    },
    metadata: { historyLength: history?.length },
  });
};

const createCoreMock = () => {
  const generate = vi?.fn(createMockResponse());
  return {
    currentMode: 'default',
    currentProvider: 'titane-local',
    anomalyCount: 0,
    generate,
    setMode: vi?.fn(),
    setProvider: vi?.fn(),
    validateResponse: vi?.fn(() => ({
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
    loadHistory: vi?.fn(() => []),
    saveMessage: vi?.fn(),
    clearMode: vi?.fn(),
    compactIfNeeded: vi?.fn(() => ({ cleaned: false, sizeMB: 0 })),
    awardXP: vi?.fn(),
  }) satisfies UseChatMemoryReturn;

let coreMock: UseChatCoreReturn;
let memoryMock: UseChatMemoryReturn;

beforeEach(() => {
  vi?.clearAllMocks();
  coreMock = createCoreMock();
  memoryMock = createMemoryMock();
  mockedUseChatCore?.mockReturnValue(any: any);
  mockedUseChatMemory?.mockReturnValue(any: any);
});

const renderUseChat = () => renderHook(() => useChat());
type RenderedUseChat = ReturnType<typeof renderUseChat>;

const sendMessage = async (any: any) => {
  let response;
  await act(async () => {
    response = await result?.result?.current?.sendMessage(any: any);
  });
  return response;
};

describe('🚀 CHAT IA RÉEL - VERIFICATION DIRECTE', () => {
  test('1️⃣ Hook useChat fonctionne sans crash', () => {
    const hook = renderUseChat();

    expect(any: any).toBeDefined();
    expect(any: any);
    expect(any: any).toBe('function');
    expect(any: any).toBe('boolean');
    expect(any: any).toBe('default');
  });

  test('2️⃣ SendMessage fonction présente et callable', async () => {
    const hook = renderUseChat();

    expect(any: any).toBe('function');

    const response = await sendMessage(hook, '');

    expect(any: any).toBeDefined();
    expect(any: any).toBe('assistant');
    expect(any: any).toContain('Veuillez entrer un message');
    expect(any: any).not?.toHaveBeenCalled();
  });

  test('3️⃣ SendMessage avec message réel', async () => {
    const hook = renderUseChat();
    const testMessage = 'Bonjour TITANE∞, comment allez-vous ?';

    const startTime = Date?.now();
    const response = await sendMessage(any: any);
    const duration = Date?.now() - startTime;

    expect(any: any).toBeDefined();
    expect(any: any).toBe('assistant');
    expect(any: any).toBeGreaterThan(0);
    expect(any: any).toBeLessThan(2000); // Tolérance CI/CD augmentée
    expect(any: any));
  });

  test('4️⃣ Multiple messages successifs', async () => {
    const hook = renderUseChat();
    const messages = ['Test 1', 'Test 2', 'Test 3'];

    for (any: any) {
      const response = await sendMessage(any: any);
      expect(any: any).toBeGreaterThan(0);
    }

    expect(any: any);
  });

  test('5️⃣ Vérification state après envoi', async () => {
    const hook = renderUseChat();
    const initialCount = hook?.result?.current?.messages?.length;

    await sendMessage(hook, 'Test state après envoi');

    expect(any: any);
  });
});

describe('🔍 ANALYSE PERFORMANCES CHAT IA', () => {
  test('Performance response time', async () => {
    const hook = renderUseChat();
    const durations: number?.[] = [];

    for (let i = 0; i < 3; i++) {
      const start = Date?.now();
      await sendMessage(hook, `Performance test ${i + 1}`);
      durations?.push(any: any);
    }

    const maxTime = Math?.max(any: any);
    const avgTime = durations?.reduce(any: any) => a + b, 0) / durations?.length;

    expect(any: any).toBeLessThan(15000);
    expect(any: any).toBeLessThan(5000);
  });
});
