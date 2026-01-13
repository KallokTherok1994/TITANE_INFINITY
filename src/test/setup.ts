/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — VITEST SETUP
 *   Configuration globale tests (mocks, matchers, cleanup)
 * ═══════════════════════════════════════════════════════════════════
 */

// @ts-nocheck
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import fs from 'node:fs';
import path from 'node:path';

// Interdit `process.exit()` dans les tests : ça termine Vitest prématurément et empêche
// la génération des rapports (notamment couverture). On préfère un crash explicite avec stack.
if (typeof process !== 'undefined' && typeof process.exit === 'function') {
  const originalExit = process.exit.bind(process);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__TITANE_ORIGINAL_PROCESS_EXIT__ ??= originalExit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process as any).exit = (code?: number) => {
    throw new Error(
      `process.exit(${code ?? 'undefined'}) was called during Vitest execution (forbidden)`
    );
  };
}

// Empêche la suppression du dossier coverage pendant l'exécution des tests.
// Sinon, le provider v8 peut échouer en écrivant les fragments `.tmp/coverage-*.json`.
(() => {
  const coverageRoot = path.join(process.cwd(), 'coverage');

  const ensureNotCoveragePath = (target: unknown, op: string) => {
    const value = typeof target === 'string' ? target : String(target ?? '');
    if (value.includes(coverageRoot)) {
      throw new Error(
        `Forbidden filesystem operation (${op}) on coverage path: ${value}`
      );
    }
  };

  const wrapSync = <T extends (...args: any[]) => any>(op: string, fn: T): T => {
    return ((...args: any[]) => {
      ensureNotCoveragePath(args[0], op);
      return fn(...args);
    }) as T;
  };

  if (typeof (fs as any).rmSync === 'function') {
    (fs as any).rmSync = wrapSync('fs.rmSync', (fs as any).rmSync);
  }
  if (typeof (fs as any).rmdirSync === 'function') {
    (fs as any).rmdirSync = wrapSync('fs.rmdirSync', (fs as any).rmdirSync);
  }
  if (typeof (fs as any).unlinkSync === 'function') {
    (fs as any).unlinkSync = wrapSync('fs.unlinkSync', (fs as any).unlinkSync);
  }
})();

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

// Bloque par défaut le réseau dans les tests unitaires.
// Les tests peuvent override ce mock si nécessaire.
const fetchMock = vi.fn(async (input: any) => {
  const url = getFetchUrl(input);

  if (url.includes('localhost:11434') && url.endsWith('/api/tags')) {
    return createMockResponse(JSON.stringify({ models: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return createMockResponse(
    JSON.stringify({ error: 'network disabled in unit tests', url }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
});

vi.stubGlobal('fetch', fetchMock);

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readonly url: string;
  readyState = MockWebSocket.CONNECTING;

  onopen: ((ev: any) => void) | null = null;
  onmessage: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;
  onclose: ((ev: any) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    queueMicrotask(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.({ type: 'open' });
    });
  }

  send(_data: any) {
    // no-op
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ type: 'close', code, reason });
  }
}

vi.stubGlobal('WebSocket', MockWebSocket as any);

type FusionState = {
  fusion_integrity: number;
  sync_score: number;
  pipeline_health: number;
  total_syncs: number;
};

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const createInitialFusionState = (): FusionState => ({
  fusion_integrity: 0.92,
  sync_score: 0.93,
  pipeline_health: 0.94,
  total_syncs: 0,
});

const createInitialAutofixStats = () => ({
  total_issues_detected: 0,
  total_issues_fixed: 0,
  fix_success_rate: 1,
});

const createInitialFileStore = () => [
  {
    name: 'template-nda.txt',
    category: 'legal',
    content: 'NDA template',
    metadata: { version: 1 },
  },
];

const createInitialTimelineEvents = () => {
  const now = Date.now();
  return [
    {
      id: 'timeline-0',
      type: 'system_init',
      description: 'System boot completed',
      timestamp: new Date(now - 2000).toISOString(),
    },
    {
      id: 'timeline-1',
      type: 'self_check',
      description: 'Self-check successful',
      timestamp: new Date(now - 1000).toISOString(),
    },
  ];
};

const createInitialMemoryStats = () => ({
  totalInteractions: 0,
  totalEntries: 0,
});

const createInitialMemoryProjects = () => [
  { id: 'proj-omega', title: 'Omega Hardening', status: 'active' },
  { id: 'proj-avatar', title: 'Avatar Upgrade', status: 'active' },
];

const createInitialMetaState = () => ({
  focus: 0.82,
  stability: 0.9,
  awareness: 0.88,
  lastSync: null as string | null,
});

const createInitialMetaAlignment = () => ({
  cognitive: true,
  symbolic: true,
  physical: true,
});

const createInitialMetaMetrics = () => ({
  loops: 0,
  avgLatency: 125,
  drift: 0.04,
});

const performanceMetrics = {
  cpu_usage: 12,
  gpu_usage: 4,
  memory_usage: 38,
  fps: 120,
};

const defaultBrokenModules = () => [
  { module: 'cognitive', severity: 'high' },
  { module: 'avatar', severity: 'medium' },
];

let fusionState = createInitialFusionState();
let autofixStats = createInitialAutofixStats();
let autofixHistory: Array<{ type: string; timestamp: number; summary: string }> = [];
let autohealHistory: Array<{ module: string; success: boolean; timestamp: number }> = [];
let brokenModules = defaultBrokenModules();
const snapshots = new Map<string, FusionState>();
let storedFiles: Array<{
  name: string;
  category: string;
  content: string;
  metadata?: Record<string, unknown>;
}> = createInitialFileStore();
let timelineEvents: Array<{
  id?: string;
  type: string;
  description?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}> = createInitialTimelineEvents();
let memoryStatsState = createInitialMemoryStats();
let memoryProjects = createInitialMemoryProjects();
let memoryInteractions: Array<Record<string, unknown>> = [];
let metaState = createInitialMetaState();
let metaAlignment = createInitialMetaAlignment();
let metaMetrics = createInitialMetaMetrics();

const resetMockTauriState = () => {
  fusionState = createInitialFusionState();
  autofixStats = createInitialAutofixStats();
  autofixHistory = [];
  autohealHistory = [];
  brokenModules = defaultBrokenModules();
  snapshots.clear();
  storedFiles = createInitialFileStore();
  timelineEvents = createInitialTimelineEvents();
  memoryStatsState = createInitialMemoryStats();
  memoryProjects = createInitialMemoryProjects();
  memoryInteractions = [];
  metaState = createInitialMetaState();
  metaAlignment = createInitialMetaAlignment();
  metaMetrics = createInitialMetaMetrics();
};

const handleTauriInvoke = async (
  command: string,
  payload: Record<string, any> = {}
): Promise<unknown> => {
  switch (command) {
    case 'test_1':
    case 'test_2':
    case 'test_3':
      return { ok: true, command };
    case 'test_invalid':
      throw new Error('Simulated Tauri failure for invalid test command');
    case 'get_system_health':
      return {
        status: 'green',
        services: {
          memory: 'ok',
          ai: 'ok',
          timeline: 'ok',
          fusion: 'ok',
        },
        timestamp: Date.now(),
      };
    case 'memory_save_chat_interaction': {
      memoryStatsState.totalInteractions += 1;
      if (payload?.interaction) {
        memoryInteractions.push(clone(payload.interaction));
      }
      return { saved: true };
    }
    case 'memory_get_stats':
      return {
        total_entries: memoryStatsState.totalEntries,
        total_interactions: memoryStatsState.totalInteractions,
        projects_tracked: memoryProjects.length,
      };
    case 'memory_store':
      memoryStatsState.totalEntries += 1;
      return `mock_${Date.now()}`;
    case 'add_timeline_event': {
      const eventId = `timeline-${timelineEvents.length}`;
      const event = {
        id: eventId,
        type: payload?.event?.type ?? 'generic',
        description: payload?.event?.description ?? 'timeline_event',
        metadata: payload?.event?.metadata,
        timestamp: new Date().toISOString(),
      };
      timelineEvents.push(event);
      return { id: eventId, ...event };
    }
    case 'secure_list_files':
      return clone(storedFiles);
    case 'store_file': {
      // Support legacy payload shape: { file: { name, category, content, metadata } }
      const legacyFile = payload?.file;

      // Support current payload shape: { path, category, content }
      const path = typeof payload?.path === 'string' ? payload.path : undefined;
      const category =
        typeof payload?.category === 'string' ? payload.category : undefined;
      const content = typeof payload?.content === 'string' ? payload.content : undefined;

      const normalized = legacyFile?.name
        ? {
            name: legacyFile.name,
            category: legacyFile.category ?? 'general',
            content: legacyFile.content ?? '',
            metadata: legacyFile.metadata,
          }
        : path
          ? {
              name: path,
              category: category ?? 'general',
              content: content ?? '',
              metadata: undefined,
            }
          : null;

      if (normalized?.name) {
        storedFiles = [
          ...storedFiles.filter(f => f.name !== normalized.name),
          normalized,
        ];
      }
      memoryStatsState.totalEntries += 1;
      return { stored: true };
    }
    case 'get_files_by_category': {
      const category = payload?.category;
      return clone(storedFiles.filter(file => !category || file.category === category));
    }
    case 'memory_get_active_projects':
      return clone(memoryProjects);
    case 'detect_file_format': {
      const filePath = String(payload?.file_path ?? payload?.filePath ?? '');
      const lower = filePath.toLowerCase();
      if (lower.endsWith('.json')) return 'JSON';
      if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'Markdown';
      if (lower.endsWith('.txt')) return 'PlainText';
      if (lower.endsWith('.pdf')) return 'PDF';
      if (lower.endsWith('.docx')) return 'DOCX';
      return 'Unknown';
    }
    case 'parse_document': {
      // Real Tauri API uses { file_path }, but older tests used { content, format }.
      let content = '';

      const filePath = payload?.file_path ?? payload?.filePath;
      if (typeof filePath === 'string' && filePath.length > 0) {
        try {
          const fs = await import('node:fs/promises');
          content = await fs.readFile(filePath, 'utf8');
        } catch {
          content = '';
        }
      } else {
        content = String(payload?.content ?? '');
      }

      const firstLine = content.split(/\r?\n/).find(Boolean) ?? 'Untitled';
      const lower = content.toLowerCase();
      const categories: string[] = [];
      if (
        lower.includes('function') ||
        lower.includes('class') ||
        lower.includes('impl')
      ) {
        categories.push('code');
      }
      if (lower.includes('config') || lower.includes('settings')) {
        categories.push('configuration');
      }
      if (lower.includes('bug') || lower.includes('fix')) {
        categories.push('development');
      }
      if (lower.includes('doc') || lower.includes('guide') || lower.includes('readme')) {
        categories.push('documentation');
      }
      if (categories.length === 0) categories.push('general');

      const format = await handleTauriInvoke('detect_file_format', {
        file_path: payload?.file_path ?? payload?.filePath ?? '',
      });

      return {
        id: `doc_${Date.now()}`,
        title:
          String(firstLine)
            .replace(/^#+\s*/, '')
            .trim() || 'Untitled',
        content,
        format,
        metadata: {
          author: null,
          created: null,
          modified: null,
          size_bytes: content.length,
          language: 'en',
          keywords: [],
        },
        categories,
        confidence: 0.9,
        timestamp: Date.now(),
      };
    }
    case 'memory_get_state':
      return {
        entries: memoryStatsState.totalEntries,
        projects: clone(memoryProjects),
      };
    case 'singularity_get_global_coherence':
      return Number(
        (
          (fusionState.fusion_integrity +
            fusionState.sync_score +
            fusionState.pipeline_health) /
          3
        ).toFixed(2)
      );
    case 'meta_get_state':
      return clone(metaState);
    case 'meta_trigger_sync': {
      metaState.lastSync = new Date().toISOString();
      metaState.focus = Math.min(1, metaState.focus + 0.01);
      metaMetrics.loops += 1;
      return { status: 'synced', timestamp: metaState.lastSync };
    }
    case 'meta_get_alignment':
      return clone(metaAlignment);
    case 'meta_get_report':
      return {
        last_sync: metaState.lastSync,
        focus: metaState.focus,
        alignment: clone(metaAlignment),
        loops: metaMetrics.loops,
      };
    case 'singularity_check_coherence':
      return Number(
        (
          (fusionState.fusion_integrity +
            fusionState.sync_score +
            fusionState.pipeline_health) /
          3
        ).toFixed(2)
      );
    case 'meta_selftest_all':
      return {
        status: 'pass',
        tests: [
          { name: 'meta-loop-stability', passed: true },
          { name: 'alignment-check', passed: true },
        ],
      };
    case 'meta_get_monitoring_metrics':
      return clone(metaMetrics);
    case 'write_snapshot': {
      const snapshotId = `timeline-${Date.now().toString(36)}`;
      memoryStatsState.totalEntries += 1;
      return { snapshotId };
    }
    case 'singularity_get_fusion_state':
      return clone(fusionState);
    case 'cognitive_get_map':
      return {
        nodes: [{ id: 'cortex', status: 'active' }],
        edges: [],
      };
    case 'singularity_perform_sync': {
      fusionState.total_syncs += 1;
      fusionState.fusion_integrity = Math.min(1, fusionState.fusion_integrity + 0.01);
      fusionState.sync_score = Math.min(1, fusionState.sync_score + 0.01);
      fusionState.pipeline_health = Math.min(1, fusionState.pipeline_health + 0.005);
      return fusionState.sync_score;
    }
    case 'singularity_check_integrity':
      return fusionState.fusion_integrity;
    case 'singularity_create_snapshot': {
      const snapshotId = `snapshot-${Date.now().toString(36)}`;
      snapshots.set(snapshotId, clone(fusionState));
      return snapshotId;
    }
    case 'singularity_restore_snapshot': {
      const snapshotId =
        typeof payload?.snapshotId === 'string' ? payload.snapshotId : null;
      if (snapshotId && snapshots.has(snapshotId)) {
        fusionState = clone(snapshots.get(snapshotId)!);
      }
      return null;
    }
    case 'singularity_reset':
      resetMockTauriState();
      return undefined;
    case 'singularity_get_metrics':
      return {
        uptime: 123456,
        total_events: fusionState.total_syncs * 5,
        sync_accuracy: fusionState.sync_score,
      };
    case 'singularity_get_diagnostics':
      return {
        fusion_integrity: fusionState.fusion_integrity,
        sync_score: fusionState.sync_score,
        pipeline_health: fusionState.pipeline_health,
      };
    case 'pipeline_analyze_intention':
      return {
        primary: 'information_request',
        confidence: 0.95,
        original: payload?.message,
      };
    case 'pipeline_generate_cognitive_response':
      return {
        text: `Réponse TITANE∞: ${payload?.message ?? 'message'}`,
        confidence: 0.93,
      };
    case 'pipeline_prepare_tts':
      return {
        duration: Math.max(1, String(payload?.text ?? '').length) * 12,
        audio_data: 'mock-audio-data',
      };
    case 'pipeline_get_stats':
      return {
        total_processed: 42,
        success_rate: 0.98,
      };
    case 'pipeline_validate':
      return true;
    case 'autofix_detect_rust_warnings':
      return [{ file: 'src/main.rs', warning: 'clippy::await_holding_lock' }];
    case 'autofix_detect_typescript_errors':
      return [{ file: 'src/app.tsx', message: 'Type mismatch' }];
    case 'autofix_get_stats':
      return clone(autofixStats);
    case 'autofix_get_history':
      return clone(autofixHistory);
    case 'autofix_reset':
      autofixStats = createInitialAutofixStats();
      autofixHistory = [];
      return undefined;
    case 'autoheal_detect_broken_modules':
      return clone(brokenModules);
    case 'autoheal_heal_cognitive_module':
      brokenModules = brokenModules.filter(mod => mod.module !== 'cognitive');
      autohealHistory.push({ module: 'cognitive', success: true, timestamp: Date.now() });
      return { module_type: 'cognitive', success: true };
    case 'autoheal_heal_avatar_module':
      brokenModules = brokenModules.filter(mod => mod.module !== 'avatar');
      autohealHistory.push({ module: 'avatar', success: true, timestamp: Date.now() });
      return { module_type: 'avatar', success: true };
    case 'autoheal_get_history':
      return clone(autohealHistory);
    case 'autoheal_resync_state':
      return { status: 'ok' };
    case 'autoheal_reset':
      brokenModules = defaultBrokenModules();
      autohealHistory = [];
      return undefined;
    case 'performance_get_metrics':
      return clone(performanceMetrics);
    case 'performance_throttle_cpu':
    case 'performance_optimize_gpu':
    case 'performance_compress_memory':
    case 'performance_reset_optimizations':
      return undefined;
    case 'crashguard_detect_threats':
    case 'crashguard_get_active_threats':
      return [];
    case 'crashguard_get_stats':
      return 'OK';
    case 'singularity_get_state':
    case 'singularity_get_full_state': {
      const coherence = Number(
        (
          (fusionState.fusion_integrity +
            fusionState.sync_score +
            fusionState.pipeline_health) /
          3
        ).toFixed(2)
      );
      return {
        ...clone(fusionState),
        physical: { battery: 0.78, temperature: 36.8 },
        cognitive: { stability: 0.92, attention: 0.85 },
        meta: { timestamp: Date.now() },
        global_coherence: coherence,
      };
    }
    case 'chat_send_message':
      return {
        content: 'Réponse mock TITANE∞',
        provider: 'mock',
        suggestions: ['Continuer'],
      };
    case 'create_new_conversation':
      return `mock-conv-${Date.now()}`;
    case 'conversation_generate': {
      const envelope = (payload ?? {}) as {
        request?: { conversation_id?: string; config?: { provider?: string } };
        conversation_id?: string;
        provider?: string;
      };
      const conversationId =
        envelope.request?.conversation_id ??
        envelope.conversation_id ??
        'mock-conversation';
      const provider = envelope.request?.config?.provider ?? envelope.provider ?? 'mock';
      return {
        content: 'Réponse mock TITANE∞',
        conversationId,
        messageId: 'mock-message',
        frenchMasteryApplied: true,
        latencyMs: 5,
        metadata: {
          provider,
        },
      };
    }
    case 'experience_update_state':
      return { updated: true };
    case 'get_gemini_key_status':
    case 'get_openai_key_status':
    case 'get_anthropic_key_status':
      return {
        ok: true,
        data: { configured: false },
      };
    case 'chat_get_providers_status':
      return {
        gemini: { healthy: true, latency_ms: 320 },
        ollama: { healthy: true, latency_ms: 110 },
        fallback: { healthy: true },
      };
    case 'qa_run_all':
      return {
        passed: true,
        suites: [],
      };
    case 'get_timeline':
      return clone(timelineEvents);
    default:
      console.warn(`[vitest] No mock handler for command "${command}"`);
      return undefined;
  }
};

// NOTE: `vi.mock()` factories are hoisted by Vitest.
// Any variables they reference must be created via `vi.hoisted()`.
// Use `var` to avoid TDZ issues when Vitest hoists `vi.mock()` above declarations.
// The `vi.hoisted()` callback runs before mock factories, so these assignments are safe.
// eslint-disable-next-line no-var
var invokeMock: ReturnType<typeof vi.fn>;
// eslint-disable-next-line no-var
var tauriEventListenMock: ReturnType<typeof vi.fn>;
// eslint-disable-next-line no-var
var tauriEventEmitMock: ReturnType<typeof vi.fn>;

vi.hoisted(() => {
  invokeMock = vi.fn();
  tauriEventListenMock = vi.fn();
  tauriEventEmitMock = vi.fn();
});

invokeMock.mockImplementation(handleTauriInvoke);

// Mock Tauri API (évite erreurs "window.__TAURI__ undefined")
interface MockWindow extends Window {
  __TAURI__?: {
    invoke: typeof invokeMock;
    event: {
      listen: ReturnType<typeof vi.fn>;
      emit: ReturnType<typeof vi.fn>;
    };
  };
}

global.window = global.window || ({} as MockWindow);
(global.window as MockWindow).__TAURI__ = {
  invoke: invokeMock,
  event: {
    listen: tauriEventListenMock,
    emit: tauriEventEmitMock,
  },
  tauri: {
    invoke: invokeMock,
  },
};

// Cleanup automatique après chaque test
afterEach(() => {
  cleanup();
  resetMockTauriState();
  invokeMock.mockClear();
  invokeMock.mockImplementation(handleTauriInvoke);
  tauriEventListenMock.mockClear();
  tauriEventEmitMock.mockClear();
});

// Mock @tauri-apps/api
vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: tauriEventListenMock,
  emit: tauriEventEmitMock,
}));
