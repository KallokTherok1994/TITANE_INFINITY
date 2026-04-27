/**
 * TITANE∞ — Remote Key Agent
 *
 * Autonomous agent that manages the TITANE remote API key lifecycle:
 *   - Auto-initialises: detects existing keys, creates a default key if none present
 *   - Stores the session secret in memory (never persisted to disk by the agent)
 *   - Emits typed events: onCreate | onRevoke | onRotate | onError | onReady
 *   - Provides reactive state: AgentKeyState
 *
 * Rule 16: backed by unit tests in tests/unit/remoteKeyAgent.test.ts
 */

import {
  remoteKeyCreate,
  remoteKeyList,
  remoteKeyRevoke,
  remoteKeyRotate,
  type RemoteKeyEntry,
} from './index';

// ── Types ────────────────────────────────────────────────────────────────────

export type AgentKeyStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AgentKeyState {
  status: AgentKeyStatus;
  keys: RemoteKeyEntry[];
  /** Secret displayed once after create/rotate — cleared on next list refresh */
  lastSecretOnce: string | null;
  lastKeyIdOnce: string | null;
  error: string | null;
}

export type AgentKeyEvent =
  | { type: 'onCreate'; key_id: string; secret_once: string; label: string }
  | { type: 'onRevoke'; key_id: string }
  | { type: 'onRotate'; old_key_id: string; new_key_id: string; new_secret_once: string }
  | { type: 'onError'; message: string }
  | { type: 'onReady'; keys: RemoteKeyEntry[] };

export type AgentKeyListener = (event: AgentKeyEvent) => void;

// ── Agent class ──────────────────────────────────────────────────────────────

export class RemoteKeyAgent {
  private _state: AgentKeyState = {
    status: 'idle',
    keys: [],
    lastSecretOnce: null,
    lastKeyIdOnce: null,
    error: null,
  };

  private _listeners: Set<AgentKeyListener> = new Set();
  private _stateListeners: Set<(state: AgentKeyState) => void> = new Set();
  private _initialized = false;

  // ── Subscriptions ────────────────────────────────────────────────────────

  /** Subscribe to typed lifecycle events */
  onEvent(listener: AgentKeyListener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /** Subscribe to full state changes */
  onStateChange(listener: (state: AgentKeyState) => void): () => void {
    this._stateListeners.add(listener);
    listener({ ...this._state });
    return () => this._stateListeners.delete(listener);
  }

  get state(): AgentKeyState {
    return { ...this._state };
  }

  // ── Init ─────────────────────────────────────────────────────────────────

  /**
   * Auto-initialise: list existing keys.
   * If no key exists, auto-creates a default "TITANE-Default" key.
   */
  async init(): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;
    this._setState({ status: 'loading', error: null });

    try {
      const result = await remoteKeyList();
      if (!result.ok) throw new Error(result.error ?? 'list failed');

      const keys = result.keys ?? [];

      if (keys.length === 0) {
        // Auto-create default key
        await this._autoCreateDefault();
      } else {
        this._setState({ status: 'ready', keys, lastSecretOnce: null, lastKeyIdOnce: null });
        this._emit({ type: 'onReady', keys });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._setState({ status: 'error', error: msg });
      this._emit({ type: 'onError', message: msg });
    }
  }

  // ── Public commands ───────────────────────────────────────────────────────

  /** Create a new named API key */
  async createKey(label: string, scopes?: string[]): Promise<string | null> {
    this._setState({ status: 'loading', error: null });
    try {
      const result = await remoteKeyCreate(label, scopes);
      if (!result.ok || !result.secret_once || !result.key_id) {
        throw new Error(result.error ?? 'create failed');
      }
      this._emit({ type: 'onCreate', key_id: result.key_id, secret_once: result.secret_once, label });
      await this._refresh(result.secret_once, result.key_id);
      return result.secret_once;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._setState({ status: 'error', error: msg });
      this._emit({ type: 'onError', message: msg });
      return null;
    }
  }

  /** Revoke a key by id */
  async revokeKey(key_id: string): Promise<boolean> {
    this._setState({ status: 'loading', error: null });
    try {
      const result = await remoteKeyRevoke(key_id);
      if (!result.ok) throw new Error(result.error ?? 'revoke failed');
      this._emit({ type: 'onRevoke', key_id });
      await this._refresh(null, null);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._setState({ status: 'error', error: msg });
      this._emit({ type: 'onError', message: msg });
      return false;
    }
  }

  /** Rotate a key — returns new plaintext secret (once) */
  async rotateKey(key_id: string): Promise<string | null> {
    this._setState({ status: 'loading', error: null });
    try {
      const result = await remoteKeyRotate(key_id);
      if (!result.ok || !result.new_secret_once || !result.new_key_id) {
        throw new Error(result.error ?? 'rotate failed');
      }
      this._emit({
        type: 'onRotate',
        old_key_id: key_id,
        new_key_id: result.new_key_id,
        new_secret_once: result.new_secret_once,
      });
      await this._refresh(result.new_secret_once, result.new_key_id);
      return result.new_secret_once;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._setState({ status: 'error', error: msg });
      this._emit({ type: 'onError', message: msg });
      return null;
    }
  }

  /** Manually refresh key list */
  async refresh(): Promise<void> {
    await this._refresh(this._state.lastSecretOnce, this._state.lastKeyIdOnce);
  }

  /** Clear the session secret from memory */
  clearSecret(): void {
    this._setState({ lastSecretOnce: null, lastKeyIdOnce: null });
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private async _autoCreateDefault(): Promise<void> {
    const result = await remoteKeyCreate('TITANE-Default', ['Admin', 'Chat', 'Memory', 'System']);
    if (!result.ok || !result.secret_once || !result.key_id) {
      throw new Error(result.error ?? 'auto-create default key failed');
    }
    this._emit({
      type: 'onCreate',
      key_id: result.key_id,
      secret_once: result.secret_once,
      label: 'TITANE-Default',
    });
    await this._refresh(result.secret_once, result.key_id);
  }

  private async _refresh(secretOnce: string | null, keyIdOnce: string | null): Promise<void> {
    const result = await remoteKeyList();
    const keys = result.ok ? (result.keys ?? []) : [];
    this._setState({
      status: 'ready',
      keys,
      lastSecretOnce: secretOnce,
      lastKeyIdOnce: keyIdOnce,
      error: null,
    });
    if (result.ok) this._emit({ type: 'onReady', keys });
  }

  private _setState(partial: Partial<AgentKeyState>): void {
    this._state = { ...this._state, ...partial };
    this._stateListeners.forEach(l => l({ ...this._state }));
  }

  private _emit(event: AgentKeyEvent): void {
    this._listeners.forEach(l => l(event));
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

/** Singleton agent instance — shared across the Tauri app */
export const remoteKeyAgent = new RemoteKeyAgent();
