/**
 * TITANE∞ — Runtime Adapter (NEXUS v36 Pilot)
 *
 * Provides a typed abstraction over the IPC call layer.
 * TauriRuntimeAdapter delegates to secureInvoke (the existing chain).
 * FallbackRuntimeAdapter returns configured mocks for test / browser environments.
 *
 * This is a pilot implementation for the Runtime Adapter v37 spec.
 * It does NOT replace existing call sites — that is v37 work.
 *
 * Usage (future call sites, not yet wired):
 *   import { titaneRuntime } from '@/lib/adapters/titaneRuntime';
 *   const stats = await titaneRuntime.call('persistent_memory_get_stats');
 */

import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';
import { secureInvoke } from '@/lib/security';

// ─── Interface ───────────────────────────────────────────────────────────────

export interface TitaneRuntime {
  call<T = unknown>(command: string, args?: Record<string, unknown>): Promise<T>;
  readonly mode: 'tauri' | 'fallback';
  isAvailable(): boolean;
}

// ─── TauriRuntimeAdapter ─────────────────────────────────────────────────────

class TauriRuntimeAdapter implements TitaneRuntime {
  readonly mode = 'tauri' as const;

  isAvailable(): boolean {
    return isTauriRuntimeAvailable();
  }

  async call<T = unknown>(command: string, args: Record<string, unknown> = {}): Promise<T> {
    return secureInvoke<T>(command, args);
  }
}

// ─── FallbackRuntimeAdapter ──────────────────────────────────────────────────

export class FallbackRuntimeAdapter implements TitaneRuntime {
  readonly mode = 'fallback' as const;
  private readonly mocks: ReadonlyMap<string, unknown>;

  constructor(mocks: Record<string, unknown> = {}) {
    this.mocks = new Map(Object.entries(mocks));
  }

  isAvailable(): boolean {
    return true;
  }

  async call<T = unknown>(command: string): Promise<T> {
    if (this.mocks.has(command)) {
      return this.mocks.get(command) as T;
    }
    throw new Error(`BLOCKED_ENV: '${command}' is not available in fallback mode`);
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createRuntime(mocks?: Record<string, unknown>): TitaneRuntime {
  if (isTauriRuntimeAvailable()) {
    return new TauriRuntimeAdapter();
  }
  return new FallbackRuntimeAdapter(mocks);
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const titaneRuntime: TitaneRuntime = createRuntime();
