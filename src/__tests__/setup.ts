/**
 * Setup global test environment
 * Configuration pour @testing-library/jest-dom et autres extensions Vitest
 */

import '@testing-library/jest-dom/vitest';
import { expect, beforeAll, afterAll } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Silence console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock stores Zustand globalement
import { vi } from 'vitest';

// Mock store DevTools avec données réalistes (chemin correct)
vi.mock('../apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: vi.fn(() => ({
    metrics: {
      cpu: 45.5,
      memory: 1024,
      fps: 60,
      latency: 12,
      uptime: 3600,
    },
    status: 'healthy',
    errors: [],
    logs: [],
    engines: {
      helios: { status: 'running', performance: 0.95 },
      singularity: { status: 'running', coherence: 0.88 },
      fusion: { status: 'running', efficiency: 0.92 },
    },
  })),
}));

// Mock Tauri invoke pour tous les tests
type TauriMock = {
  core: {
    invoke: (cmd: string, _args?: unknown) => Promise<unknown>;
  };
  event: {
    listen: () => Promise<{ then: () => void; catch: () => void }>;
    once: () => Promise<{ then: () => void; catch: () => void }>;
    emit: () => Promise<void>;
  };
};

global.__TAURI__ = {
  core: {
    invoke: async (cmd: string, _args?: unknown) => {
      // Mock responses pour commandes courantes
      switch (cmd) {
        case 'chat_create_conversation':
        case 'create_new_conversation':
          return { conversationId: 'test-conv-id', success: true };
        case 'get_dashboard_metrics':
          return {
            error_count: 0,
            warning_count: 0,
            total_logs: 123,
            active_cores: 4,
            system_health: 1.0,
          };
        case 'get_admin_vitals':
          return {
            cpu_process: 0,
            cpu_global: 0,
            ram_process: 0,
            ram_process_percent: 0,
            ram_system_used: 0,
            ram_system_total: 0,
            io_read_rate: 0,
            io_write_rate: 0,
            tauri_latency: 0,
            threads_active: 0,
            uptime: 0,
          };
        case 'engines_monitoring_get_metrics':
        case 'get_system_health':
        case 'get_helios_metrics':
          return { cpu: 34, memory: 512, fps: 60, status: 'healthy' };
        case 'memory_get_active_projects':
        case 'memory_get_recent_decisions':
        case 'memory_get_knowledge':
        case 'memory_get_active_rituals':
          return [];
        case 'memory_get_state':
          return { stm: [], mtm: [], ltm: [] };
        case 'singularity_get_state':
        case 'singularity_get_full_state':
          return {
            physical: { health: 0.9 },
            cognitive: { coherence: 0.8 },
            symbolic: { alignment: 0.85 },
            adaptive: { plasticity: 0.75 },
            meta: { awareness: 0.7 },
          };
        case 'get_ai_status':
          return { status: 'ready', providers: ['gemini', 'ollama'] };
        case 'get_logs':
          return [];
        case 'experience_get_state':
        case 'xp_get_state':
          return { level: 1, xp: 0, categories: {} };
        case 'conversation_generate': {
          const payload = (args ?? {}) as {
            conversationId?: string;
            conversation_id?: string;
          };
          if (Object.prototype.hasOwnProperty.call(payload, 'conversation_id')) {
            throw new Error(
              'IPC contract error: snake_case key "conversation_id" not allowed'
            );
          }
          return {
            content: 'Réponse mock TITANE∞',
            conversationId: payload.conversationId ?? 'mock-conversation',
            messageId: `mock-${Date.now()}`,
            frenchMasteryApplied: true,
            latencyMs: 5,
          };
        }
        default:
          // Retourner un objet vide par défaut au lieu de null
          return {};
      }
    },
  },
  event: {
    listen: async () => ({ then: () => {}, catch: () => {} }),
    once: async () => ({ then: () => {}, catch: () => {} }),
    emit: async () => {},
  },
} as TauriMock;
