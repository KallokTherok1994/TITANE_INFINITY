/**
 * TITANE∞ — Remote Key Agent
 *
 * Autonomous agent that manages the TITANE remote API key lifecycle:
 *   - Auto-initialises: detects existing keys, creates a default key if none present
 *   - Stores the session secret in memory (never persisted to disk by the agent)
 *   - Emits typed events: onCreate | onRevoke | onRotate | onError | onReady
 *   - Provides reactive state: AgentKeyState
 *   - AI-powered analysis via Ollama (gemma2:2b / titane-key-agent)
 *   - Persistent configuration via AgentConfig (localStorage)
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

import {
  loadAgentConfig,
  saveAgentConfig,
  appendUsageLog,
  readUsageLog,
  type AgentConfig,
} from './AgentConfig';

import {
  AgentAI,
  type AiAnalysisResult,
  type AiLabelSuggestion,
  type KeySummary,
} from './AgentAI';

// ── Types ────────────────────────────────────────────────────────────────────

export type AgentKeyStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AgentKeyState {
  status: AgentKeyStatus;
  keys: RemoteKeyEntry[];
  /** Secret displayed once after create/rotate — cleared on next list refresh */
  lastSecretOnce: string | null;
  lastKeyIdOnce: string | null;
  error: string | null;
  /** Latest AI analysis result — null until analyzeWithAI() is called */
  lastAnalysis: AiAnalysisResult | null;
}

export type AgentKeyEvent =
  | { type: 'onCreate'; key_id: string; secret_once: string; label: string }
  | { type: 'onRevoke'; key_id: string }
  | { type: 'onRotate'; old_key_id: string; new_key_id: string; new_secret_once: string }
  | { type: 'onError'; message: string }
  | { type: 'onReady'; keys: RemoteKeyEntry[] }
  | { type: 'onAnalysis'; result: AiAnalysisResult }
  | { type: 'onConfigUpdate'; config: AgentConfig };

export type AgentKeyListener = (event: AgentKeyEvent) => void;

// ── Agent class ──────────────────────────────────────────────────────────────

export class RemoteKeyAgent {
  private _state: AgentKeyState = {
    status: 'idle',
    keys: [],
    lastSecretOnce: null,
    lastKeyIdOnce: null,
    error: null,
    lastAnalysis: null,
  };

  private _listeners: Set<AgentKeyListener> = new Set();
  private _stateListeners: Set<(state: AgentKeyState) => void> = new Set();
  private _initialized = false;

  /** Agent configuration (loaded from localStorage on first access) */
  private _config: AgentConfig = loadAgentConfig();

  /** AI intelligence layer */
  private _ai: AgentAI = new AgentAI(this._config);

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
      if (!result || !result.ok) throw new Error(result?.error ?? 'list failed');

      const keys = result.keys ?? [];

      if (keys.length === 0) {
        // Auto-create default key
        await this._autoCreateDefault();
      } else {
        this._setState({
          status: 'ready',
          keys,
          lastSecretOnce: null,
          lastKeyIdOnce: null,
        });
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
      const effectiveScopes = scopes ?? this._config.defaultScopes;
      const result = await remoteKeyCreate(label, effectiveScopes);
      if (!result || !result.ok || !result.secret_once || !result.key_id) {
        throw new Error(result?.error ?? 'create failed');
      }
      this.logUsage({ action: 'create', keyId: result.key_id, label });
      this._emit({
        type: 'onCreate',
        key_id: result.key_id,
        secret_once: result.secret_once,
        label,
      });
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
      if (!result || !result.ok) throw new Error(result?.error ?? 'revoke failed');
      this.logUsage({ action: 'revoke', keyId: key_id });
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
      if (!result || !result.ok || !result.new_secret_once || !result.new_key_id) {
        throw new Error(result?.error ?? 'rotate failed');
      }
      this.logUsage({ action: 'rotate', keyId: key_id });
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

  // ── Configuration ─────────────────────────────────────────────────────────

  /** Return a copy of the current agent configuration */
  getConfig(): AgentConfig {
    return { ...this._config };
  }

  /**
   * Update the agent configuration and persist it to localStorage.
   * Propagates changes to the AI layer immediately.
   */
  configure(partial: Partial<AgentConfig>): AgentConfig {
    this._config = {
      ...this._config,
      ...partial,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    saveAgentConfig(this._config);
    this._ai.updateConfig(this._config);
    this._emit({ type: 'onConfigUpdate', config: { ...this._config } });
    return { ...this._config };
  }

  // ── AI / Training ─────────────────────────────────────────────────────────

  /**
   * Train the agent: sets a new system prompt and model.
   * Equivalent to updating the training section of the config.
   */
  train(systemPrompt: string, model?: string): AgentConfig {
    return this.configure({
      training: {
        ...this._config.training,
        systemPrompt,
        ...(model ? { model } : {}),
      },
    });
  }

  /**
   * Analyse keys + usage log with AI.
   * Returns the analysis and stores it in state.lastAnalysis.
   * Degraded gracefully when Ollama is unreachable.
   */
  async analyzeWithAI(): Promise<AiAnalysisResult> {
    const keySummaries: KeySummary[] = this._state.keys.map(k => ({
      keyId: k.key_id,
      label: k.label,
      scopes: k.scopes ?? [],
      createdAt: new Date((k.created_at ?? 0) * 1000).toISOString(),
      active: k.enabled,
      daysSinceCreation: k.created_at
        ? Math.floor((Date.now() - k.created_at * 1000) / 86_400_000)
        : 0,
    }));

    const usageLog = this._config.enableUsageLog ? readUsageLog() : [];
    const result = await this._ai.analyzeKeyUsage(keySummaries, usageLog);
    this._setState({ lastAnalysis: result });
    this._emit({ type: 'onAnalysis', result });
    return result;
  }

  /**
   * Ask the AI to suggest labels for a given context string.
   */
  async suggestLabels(context: string): Promise<AiLabelSuggestion> {
    return this._ai.suggestLabels(context);
  }

  /**
   * Returns keys that need rotation according to the configured policy.
   */
  getRotationWarnings(): ReturnType<AgentAI['getRotationWarnings']> {
    const keySummaries: KeySummary[] = this._state.keys.map(k => ({
      keyId: k.key_id,
      label: k.label,
      scopes: k.scopes ?? [],
      createdAt: new Date((k.created_at ?? 0) * 1000).toISOString(),
      active: k.enabled,
      daysSinceCreation: k.created_at
        ? Math.floor((Date.now() - k.created_at * 1000) / 86_400_000)
        : 0,
    }));
    return this._ai.getRotationWarnings(keySummaries);
  }

  /** Log a key operation in the usage log (if enabled) */
  logUsage(entry: Parameters<typeof appendUsageLog>[0]): void {
    if (this._config.enableUsageLog) {
      appendUsageLog(entry);
    }
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private async _autoCreateDefault(): Promise<void> {
    const result = await remoteKeyCreate('TITANE-Default', [
      'Admin',
      'Chat',
      'Memory',
      'System',
    ]);
    if (!result || !result.ok || !result.secret_once || !result.key_id) {
      throw new Error(result?.error ?? 'auto-create default key failed');
    }
    this.logUsage({
      action: 'create',
      keyId: result.key_id,
      label: 'TITANE-Default',
      detail: 'auto-init',
    });
    this._emit({
      type: 'onCreate',
      key_id: result.key_id,
      secret_once: result.secret_once,
      label: 'TITANE-Default',
    });
    await this._refresh(result.secret_once, result.key_id);
  }

  private async _refresh(
    secretOnce: string | null,
    keyIdOnce: string | null
  ): Promise<void> {
    const result = await remoteKeyList();
    const keys = result?.ok ? (result.keys ?? []) : [];
    this._setState({
      status: 'ready',
      keys,
      lastSecretOnce: secretOnce,
      lastKeyIdOnce: keyIdOnce,
      error: null,
    });
    if (result?.ok) this._emit({ type: 'onReady', keys });
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
