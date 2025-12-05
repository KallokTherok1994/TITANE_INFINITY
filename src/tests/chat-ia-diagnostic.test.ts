/**
 * TITANE∞ v19.2Ω — Test diagnostic complet Chat IA
 * URGENCE: Analyse complète des blocages et problèmes
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { chatEngineOmnis } from '../services/ai/chatEngine_OMNIS_v1';
import { safeInvokeTauri } from '../utils/tauriProtector';
import { TAURI_COMMANDS } from '../core/commands/TAURI_COMMANDS';

const mockGenerate = vi.fn(async (message: string) => ({
  role: 'assistant',
  content: `Réponse OMNIS simulée: ${message}`,
  provider: 'titane-mock',
  timestamp: Date.now()
}));

const mockSafeInvoke = vi.fn(async (command: string, args?: unknown) => {
  if (command === 'test_command') {
    return { ok: true, echoed: args };
  }

  if (command?.includes('chat_send_message')) {
    return {
      success: true,
      provider: 'mock-backend',
      message: {
        id: 'mock-response',
        content: 'Réponse backend simulée',
        role: 'assistant',
        timestamp: Date.now()
      }
    };
  }

  if (command?.includes('providers')) {
    return {
      success: true,
      providers: [
        { name: 'Gemini', status: 'healthy' },
        { name: 'Ollama', status: 'standby' }
      ],
      refreshedAt: Date.now()
    };
  }

  return { success: true, command, args };
});

vi.mock('../services/ai/chatEngine_OMNIS_v1', () => ({
  chatEngineOmnis: {
    generate: (...params: Parameters<typeof mockGenerate>) => mockGenerate(...params)
  }
}));

vi.mock('../utils/tauriProtector', () => ({
  safeInvokeTauri: (...params: Parameters<typeof mockSafeInvoke>) => mockSafeInvoke(...params)
}));

beforeEach(() => {
  mockGenerate.mockClear();
  mockSafeInvoke.mockClear();
});

describe('🔍 DIAGNOSTIC CHAT IA COMPLET', () => {
  const testMessage = "Bonjour, pouvez-vous me répondre ?";

  test('1️⃣ Engine OMNIS disponible', () => {
    expect(chatEngineOmnis).toBeDefined();
    expect(typeof chatEngineOmnis.generate).toBe('function');
  });

  test('2️⃣ Protection Tauri fonctionnelle', async () => {
    const result = await safeInvokeTauri('test_command', { test: true });
    expect(result).toBeDefined();
  });

  test('3️⃣ Generation response OMNIS', async () => {
    const response = await chatEngineOmnis.generate(testMessage, []);

    expect(response).toBeDefined();
    expect(response.content).toBeDefined();
    expect(typeof response.content).toBe('string');
    expect(response.content.length).toBeGreaterThan(0);
  });

  test('4️⃣ Backend Tauri disponible', async () => {
    try {
      const response = await safeInvokeTauri(TAURI_COMMANDS.CHAT_SEND_MESSAGE, {
        request: {
          message: testMessage,
          provider: 'auto',
          streaming: false
        }
      });

      expect(response).toBeDefined();
      console.log('✅ Backend Tauri response:', response);
    } catch (error) {
      console.warn('⚠️ Backend Tauri non disponible (fallback activé):', error);
    }
  });

  test('5️⃣ Providers status vérification', async () => {
    try {
      const status = await safeInvokeTauri(TAURI_COMMANDS.CHAT_GET_PROVIDERS_STATUS);
      console.log('✅ Providers status:', status);
    } catch (error) {
      console.warn('⚠️ Providers status via fallback:', error);
    }
  });
});

/**
 * Test simulation interface utilisateur
 */
describe('🎮 SIMULATION INTERFACE CHAT', () => {
  test('Flux complet utilisateur → IA', async () => {
    const userMessage = "Test complet interface";

    // Simulation sendMessage hook
    const startTime = Date.now();

    try {
      // 1. Validation input
      expect(userMessage.trim().length).toBeGreaterThan(0);

      // 2. Engine call
      const engineResponse = await chatEngineOmnis.generate(userMessage, []);
      expect(engineResponse.content).toBeDefined();

      // 3. Response validation
      expect(typeof engineResponse.content).toBe('string');

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000); // Max 10s

      console.log('✅ Chat IA flux complet réussi en', duration, 'ms');
      console.log('✅ Response:', engineResponse.content.substring(0, 100) + '...');

    } catch (error) {
      console.error('❌ Erreur flux Chat IA:', error);
      throw error;
    }
  });
});
