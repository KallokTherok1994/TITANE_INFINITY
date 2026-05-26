/**
 * TITANE∞ — Canonical Global Test Setup (Rule 16 Compliant)
 * Unified setup file for all Vitest configurations
 * FIX: Consolidated from 4 scattered setup files into 1 canonical location
 *
 * Includes:
 * - Jest-dom matchers + vitest integration
 * - DOM polyfills (ArrayBuffer, SharedArrayBuffer)
 * - React cleanup after each test
 * - Global mocks (window.matchMedia, IntersectionObserver, Tauri, Fetch)
 * - Test wrapper (QueryClientProvider)
 */

/* eslint-disable no-console */

import '@testing-library/jest-dom';
import { expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';

const happyDomApi = (globalThis as { happyDOM?: { settings?: Record<string, unknown> } })
  .happyDOM;
if (happyDomApi?.settings) {
  happyDomApi.settings.disableCSSFileLoading = true;
  happyDomApi.settings.handleDisabledFileLoadingAsSuccess = true;
}

console.log = vi.fn();
console.info = vi.fn();
console.debug = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();

const tauriCoreInvokeMock = vi.hoisted(() =>
  vi.fn(async (cmd: string, args?: unknown) =>
    (
      globalThis as typeof globalThis & {
        __TAURI__?: {
          core: { invoke: (cmd: string, args?: unknown) => Promise<unknown> };
        };
      }
    ).__TAURI__?.core.invoke(cmd, args)
  )
);

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

let testMetaSyncCount = 0;
let testFusionState = {
  fusion_integrity: 0.92,
  sync_score: 0.93,
  pipeline_health: 0.94,
  total_syncs: 0,
};

const createFusionState = () => ({
  ...testFusionState,
});

const resetFusionState = () => {
  testFusionState = {
    fusion_integrity: 0.92,
    sync_score: 0.93,
    pipeline_health: 0.94,
    total_syncs: 0,
  };
};

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
        case 'health_check':
          return {
            providers_online: ['ollama'],
            providers_degraded: [],
            provider_errors: {},
            memory_entries: 0,
            memory_tokens: 0,
            auto_tts_enabled: true,
            timestamp: new Date().toISOString(),
          };
        case 'memory_get_stats':
          return { totalInteractions: 0, totalEntries: 0 };
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
            global_coherence: 0.88,
          };
        case 'singularity_get_global_coherence':
          return 0.88;
        case 'singularity_get_fusion_state':
          return createFusionState();
        case 'singularity_perform_sync':
          testFusionState.total_syncs += 1;
          testFusionState.sync_score = Math.min(1, testFusionState.sync_score + 0.01);
          return testFusionState.sync_score;
        case 'singularity_check_integrity':
          return testFusionState.fusion_integrity;
        case 'singularity_create_snapshot':
          return `snapshot-${Date.now()}`;
        case 'singularity_get_metrics':
          return { uptime: 1, total_events: testFusionState.total_syncs };
        case 'singularity_get_diagnostics':
          return createFusionState();
        case 'singularity_reset':
          resetFusionState();
          return undefined;
        case 'singularity_restore_snapshot':
          resetFusionState();
          return undefined;
        case 'cognitive_get_map':
          return { nodes: [], edges: [] };
        case 'meta_get_state':
          return { focus: 0.82, stability: 0.9, syncCount: testMetaSyncCount };
        case 'meta_trigger_sync':
          testMetaSyncCount += 1;
          return { syncCount: testMetaSyncCount };
        case 'meta_get_alignment':
          return { cognitive: true, symbolic: true, physical: true };
        case 'get_timeline':
          return [
            { id: 'timeline-1', timestamp: '2026-01-01T00:00:00.000Z' },
            { id: 'timeline-2', timestamp: '2026-01-01T00:00:01.000Z' },
          ];
        case 'add_timeline_event':
          return { id: 'timeline-test' };
        case 'parse_document':
          return { ok: true };
        case 'chat_get_providers_status':
          return { ollama: { available: true, model: 'gemma2:2b' } };
        case 'qa_run_all':
          return { ok: true };
        case 'get_ai_status':
          return { status: 'ready', providers: ['gemini', 'ollama'] };
        case 'get_logs':
          return [];
        case 'experience_get_state':
        case 'xp_get_state':
          return { level: 1, xp: 0, categories: {} };
        case 'pipeline_analyze_intention':
          return { primary: 'question', confidence: 0.9 };
        case 'pipeline_generate_cognitive_response':
          return { text: 'Réponse test TITANE', confidence: 0.9 };
        case 'pipeline_prepare_tts':
          return { duration: 1, audio_data: 'base64-audio' };
        case 'pipeline_get_stats':
          return { total_processed: 1, success_rate: 1 };
        case 'pipeline_validate':
          return true;
        case 'autofix_detect_rust_warnings':
        case 'autofix_detect_typescript_errors':
        case 'autofix_get_history':
        case 'autoheal_detect_broken_modules':
        case 'autoheal_get_history':
        case 'crashguard_detect_threats':
        case 'crashguard_get_active_threats':
          return [];
        case 'autofix_get_stats':
          return { total_issues_detected: 0, total_issues_fixed: 0, fix_success_rate: 1 };
        case 'autoheal_heal_cognitive_module':
          return { module_type: 'cognitive', success: true };
        case 'autoheal_resync_state':
        case 'autofix_reset':
        case 'autoheal_reset':
        case 'performance_reset_optimizations':
        case 'performance_throttle_cpu':
        case 'performance_optimize_gpu':
        case 'performance_compress_memory':
        case 'speak_text':
          return undefined;
        case 'performance_get_metrics':
          return { cpu_usage: 12, gpu_usage: 4, memory_usage: 38, fps: 120 };
        case 'crashguard_get_stats':
          return 'stable';
        case 'test_invalid':
          throw new Error('test_invalid failed');
        case 'test_1':
        case 'test_2':
        case 'test_3':
          return {};
        case 'conversation_generate': {
          const payload = (_args ?? {}) as {
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

vi.mock('@tauri-apps/api/core', () => ({
  invoke: tauriCoreInvokeMock,
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: async () => () => undefined,
  once: async () => () => undefined,
  emit: async () => undefined,
}));

// ─────────────────────────────────────────────────────────────────
// DOM Polyfills (ArrayBuffer, SharedArrayBuffer)
// ─────────────────────────────────────────────────────────────────
(() => {
  const defineGetter = (proto: object, key: string, getter: () => unknown) => {
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc) {
      Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: false,
        get: getter,
      });
    }
  };

  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.prototype) {
    defineGetter(ArrayBuffer.prototype, 'resizable', () => false);
    defineGetter(ArrayBuffer.prototype, 'maxByteLength', function (this: ArrayBuffer) {
      return this.byteLength;
    });
  }

  if (typeof SharedArrayBuffer !== 'undefined' && SharedArrayBuffer.prototype) {
    defineGetter(SharedArrayBuffer.prototype, 'growable', () => false);
    defineGetter(
      SharedArrayBuffer.prototype,
      'maxByteLength',
      function (this: SharedArrayBuffer) {
        return this.byteLength;
      }
    );
  }
})();

(() => {
  const identityMatrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  const transformValue = {
    baseVal: {
      consolidate: () => ({ matrix: identityMatrix }),
      createSVGTransformFromMatrix: () => ({ matrix: identityMatrix }),
      getItem: () => ({ matrix: identityMatrix }),
      numberOfItems: 1,
    },
  };

  const installTransformPolyfill = (proto: object | undefined) => {
    if (!proto) return;
    Object.defineProperty(proto, 'transform', {
      configurable: true,
      get() {
        return transformValue;
      },
    });
  };

  installTransformPolyfill(
    typeof SVGElement !== 'undefined' ? SVGElement.prototype : undefined
  );
  installTransformPolyfill(
    typeof SVGGraphicsElement !== 'undefined' ? SVGGraphicsElement.prototype : undefined
  );
  installTransformPolyfill(
    typeof SVGGElement !== 'undefined' ? SVGGElement.prototype : undefined
  );

  if (typeof SVGElement !== 'undefined') {
    if (typeof SVGElement.prototype.getBBox !== 'function') {
      SVGElement.prototype.getBBox = () =>
        ({ x: 0, y: 0, width: 1024, height: 768 }) as DOMRect;
    }
  }

  if (typeof SVGSVGElement !== 'undefined') {
    if (typeof SVGSVGElement.prototype.createSVGMatrix !== 'function') {
      SVGSVGElement.prototype.createSVGMatrix = () => identityMatrix as DOMMatrix;
    }
    if (typeof SVGSVGElement.prototype.createSVGTransformFromMatrix !== 'function') {
      SVGSVGElement.prototype.createSVGTransformFromMatrix = () =>
        ({ matrix: identityMatrix }) as SVGTransform;
    }
    Object.defineProperty(SVGSVGElement.prototype, 'width', {
      configurable: true,
      get() {
        return { baseVal: { value: 1024 } };
      },
    });
    Object.defineProperty(SVGSVGElement.prototype, 'height', {
      configurable: true,
      get() {
        return { baseVal: { value: 768 } };
      },
    });
  }
})();

// Mark environment for React ACT
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// ─────────────────────────────────────────────────────────────────
// React Cleanup + Stylesheet Isolation
// ─────────────────────────────────────────────────────────────────
(() => {
  const shouldBlockStylesheet = (node: Node): boolean => {
    if (!(node instanceof HTMLLinkElement)) return false;
    if (node.rel !== 'stylesheet') return false;
    const href = node.href || node.getAttribute('href') || '';
    return (
      href.includes('fonts.googleapis.com') ||
      href.includes('localhost:3000/assets/') ||
      href.includes('127.0.0.1:3000/assets/')
    );
  };

  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.appendChild = function appendChildPatched<T extends Node>(
    this: Node,
    node: T
  ): T {
    if (shouldBlockStylesheet(node)) return node;
    return originalAppendChild.call(this, node) as T;
  };

  Node.prototype.insertBefore = function insertBeforePatched<T extends Node>(
    this: Node,
    node: T,
    child: Node | null
  ): T {
    if (shouldBlockStylesheet(node)) return node;
    return originalInsertBefore.call(this, node, child) as T;
  };
})();

afterEach(() => {
  cleanup();
  [console.log, console.info, console.debug, console.warn, console.error].forEach(
    method => {
      if ('mockClear' in method && typeof method.mockClear === 'function') {
        method.mockClear();
      }
    }
  );
  // Clear CSS variables and classes to prevent test bleed
  document.documentElement.removeAttribute('style');
  document.documentElement.removeAttribute('class');
  // Clear fake timers to prevent fork worker hangs on Windows
  vi.clearAllTimers();
});

// ─────────────────────────────────────────────────────────────────
// Fetch Mock (Node.js compatibility)
// ─────────────────────────────────────────────────────────────────
type MockResponseInit = {
  status?: number;
  headers?: Record<string, string>;
};

const createMockResponse = (body: string, init: MockResponseInit = {}) => {
  const status = init.status ?? 200;
  const headers = init.headers ?? { 'Content-Type': 'application/json' };

  if (typeof Response !== 'undefined') {
    return new Response(body, { status, headers });
  }

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
    json: async () => JSON.parse(body),
    text: async () => body,
    blob: async () => new Blob([body], { type: headers['Content-Type'] ?? 'text/plain' }),
  };
};

const getFetchUrl = (input: any): string => {
  if (typeof input === 'string') return input;
  if (typeof URL !== 'undefined' && input instanceof URL) return input.toString();
  if (input?.url) return String(input.url);
  return String(input);
};

const testFetch = vi.fn((url: any, _options?: any) => {
  const urlStr = getFetchUrl(url);
  if (
    urlStr.includes('localhost:3000/assets/') ||
    urlStr.includes('fonts.googleapis.com') ||
    urlStr.endsWith('.css')
  ) {
    return Promise.resolve(
      createMockResponse('', { headers: { 'Content-Type': 'text/css' } })
    );
  }
  // Mock common API endpoints
  if (urlStr.includes('/api/')) {
    return Promise.resolve(createMockResponse(JSON.stringify({ ok: true })));
  }
  return Promise.resolve(createMockResponse(JSON.stringify({ error: 'Not mocked' })));
});
global.fetch = testFetch;
if (typeof window !== 'undefined') {
  window.fetch = testFetch as unknown as typeof window.fetch;
}

// ─────────────────────────────────────────────────────────────────
// React Query Test Wrapper
// ─────────────────────────────────────────────────────────────────
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: globalQueryClient }, children);

TestWrapper.displayName = 'TestWrapper';

(globalThis as any).__TEST_WRAPPER__ = TestWrapper;
