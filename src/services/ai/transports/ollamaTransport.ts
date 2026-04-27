/**
 * TITANE∞ v30.0.0 — Ollama Transport Layer (Dual Mode)
 *
 * Universal Ollama transport supporting:
 * - Mode gouverné: IPC Tauri uniquement ('ollama_generate')
 *
 * This module provides the SINGLE SOURCE OF TRUTH for all Ollama communications.
 * NO OTHER code should call Ollama directly.
 */

import { secureInvoke } from '@/lib/security';
import { createLogger } from '@/utils/logger';
import type { AiResult, AiOk, AiErr } from '../types';
import { classifyError, isAbortError } from '@/lib/errorClassification';
import { getProviderTimeout } from '@/config/aiTimeouts.config';
import { tauriClient } from '@/lib/tauriClient';
import { isRemoteContext } from '@/lib/transport';

const logger = createLogger('OllamaTransport');

// ============================================================
// ENVIRONMENT DETECTION
// ============================================================

/**
 * Détecte si l'app tourne dans Tauri (production) ou web/dev.
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

function isBrowserProxyEnvironment(): boolean {
  return typeof window !== 'undefined' && !isTauriEnvironment() && !isRemoteContext();
}

const OLLAMA_API_BASE = ['/', 'api', 'ollama'].join('/').replace('//', '/');

const TRANSPORT_MODE: string =
  typeof window === 'undefined'
    ? 'IPC'
    : isTauriEnvironment()
      ? 'IPC'
      : isRemoteContext()
        ? 'REMOTE_GATEWAY'
        : 'BROWSER_PROXY';

const HEALTH_CACHE_TTL_MS = 10_000;
let lastHealthCheckTs = 0;
let lastHealthCheckOk = false;
let lastHealthError: string | null = null;
let lastHealthModels: OllamaTagsResponse['models'] = [];

logger.info(`🚀 Ollama Transport Mode: ${TRANSPORT_MODE}`);

// ============================================================
// TYPES
// ============================================================

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
  timeout_secs?: number;
  /** Context window override. `undefined` → model-aware default (model_context_window in Rust). */
  num_ctx?: number;
}

export interface OllamaTagsResponse {
  models: Array<{
    name: string;
    modified_at: string;
    size: number;
  }>;
}

export interface OllamaGenerateResponse {
  content: string;
  model: string;
  latency_ms?: number;
  // Real Ollama runtime metrics (nanoseconds from Ollama API)
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  done_reason?: string;
}

interface NormalizedOllamaStatus {
  available: boolean;
  models: string[];
  url: string;
  model: string;
  health: string;
}

function normalizeOllamaStatus(raw: unknown): NormalizedOllamaStatus {
  if (!raw || typeof raw !== 'object') {
    return {
      available: false,
      models: [],
      url: 'unknown',
      model: 'unknown',
      health: 'not_checked',
    };
  }

  const payload = raw as Record<string, unknown>;
  const content =
    typeof payload.ok === 'boolean' &&
    payload.content &&
    typeof payload.content === 'object'
      ? (payload.content as Record<string, unknown>)
      : payload;

  const models = Array.isArray(content.models)
    ? content.models.filter((entry): entry is string => typeof entry === 'string')
    : [];

  return {
    available: Boolean(content.available),
    models,
    url: typeof content.url === 'string' ? content.url : 'unknown',
    model: typeof content.model === 'string' ? content.model : 'unknown',
    health: typeof content.health === 'string' ? content.health : 'not_checked',
  };
}

// ============================================================
// HTTP TRANSPORT
// ============================================================
// Désactivé en mode gouverné: toute requête réseau passe par IPC backend.

/**
 * HTTP: Health check (/tags)
 */
async function httpCheckHealth(): Promise<AiResult<OllamaTagsResponse>> {
  const controller = new AbortController();
  const timeoutMs = getProviderTimeout('ollama');
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${OLLAMA_API_BASE}/tags`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        provider: 'ollama',
        error: {
          code: 'OLLAMA_HTTP_FAILED',
          message: `Ollama tags failed (${response.status})`,
          retryable: response.status >= 500,
        },
      };
    }

    const data = (await response.json()) as OllamaTagsResponse;
    return {
      ok: true,
      provider: 'ollama',
      content: {
        models: Array.isArray(data.models) ? data.models : [],
      },
    };
  } catch (error) {
    const classification = classifyError(error);
    const isAbort = isAbortError(error);
    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: isAbort ? 'OLLAMA_ABORTED' : 'OLLAMA_HTTP_EXCEPTION',
        message: isAbort ? 'Requete annulee' : classification.message,
        hint: classification.hint,
        retryable: !isAbort && classification.retryable,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/**
 * HTTP: Generate completion
 */
async function httpGenerate(
  req: OllamaGenerateRequest
): Promise<AiResult<OllamaGenerateResponse>> {
  const controller = new AbortController();
  const timeoutMs =
    (req.timeout_secs ?? Math.ceil(getProviderTimeout('ollama') / 1000)) * 1000;
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${OLLAMA_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: req.model,
        prompt: req.prompt,
        system: req.system,
        stream: false,
        options: {
          temperature: req.temperature,
          num_predict: req.max_tokens,
          num_ctx: req.num_ctx,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        provider: 'ollama',
        error: {
          code: 'OLLAMA_HTTP_FAILED',
          message: `Ollama generate failed (${response.status})`,
          retryable: response.status >= 500,
        },
      };
    }

    const data = (await response.json()) as Record<string, unknown>;
    return {
      ok: true,
      provider: 'ollama',
      content: {
        content: typeof data.response === 'string' ? data.response : '',
        model: typeof data.model === 'string' ? data.model : req.model,
        total_duration:
          typeof data.total_duration === 'number' ? data.total_duration : undefined,
        load_duration:
          typeof data.load_duration === 'number' ? data.load_duration : undefined,
        prompt_eval_count:
          typeof data.prompt_eval_count === 'number' ? data.prompt_eval_count : undefined,
        prompt_eval_duration:
          typeof data.prompt_eval_duration === 'number'
            ? data.prompt_eval_duration
            : undefined,
        eval_count: typeof data.eval_count === 'number' ? data.eval_count : undefined,
        eval_duration:
          typeof data.eval_duration === 'number' ? data.eval_duration : undefined,
        done_reason: typeof data.done_reason === 'string' ? data.done_reason : undefined,
      },
    };
  } catch (error) {
    const classification = classifyError(error);
    const isAbort = isAbortError(error);
    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: isAbort ? 'OLLAMA_ABORTED' : 'OLLAMA_HTTP_EXCEPTION',
        message: isAbort ? 'Requete annulee' : classification.message,
        hint: classification.hint,
        retryable: !isAbort && classification.retryable,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

// ============================================================
// IPC TRANSPORT (TAURI PRODUCTION)
// ============================================================

/**
 * IPC: Health check (via tags command)
 */
async function ipcCheckHealth(): Promise<AiResult<OllamaTagsResponse>> {
  const now = Date.now();
  if (now - lastHealthCheckTs < HEALTH_CACHE_TTL_MS) {
    if (lastHealthCheckOk) {
      return {
        ok: true,
        provider: 'ollama',
        content: {
          models: lastHealthModels,
        },
      };
    }

    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: 'OLLAMA_IPC_FAILED',
        message: lastHealthError ?? 'Ollama unavailable',
        retryable: true,
      },
    };
  }

  try {
    const status = normalizeOllamaStatus(await tauriClient.aiCheckOllamaStatus());

    lastHealthCheckTs = now;
    lastHealthCheckOk = status.available;
    lastHealthModels = status.models.map(name => ({ name, modified_at: '', size: 0 }));
    lastHealthError = status.available
      ? null
      : `Ollama unavailable via ${status.url} (${status.health})`;

    if (status.available) {
      return {
        ok: true,
        provider: 'ollama',
        content: {
          models: lastHealthModels,
        },
      };
    }

    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: 'OLLAMA_IPC_FAILED',
        message: lastHealthError || '',
        retryable: true,
      },
    };
  } catch (error) {
    // ✅ IPC FIX (Ω∞.v1): Distinguish IPC errors from Ollama errors
    const classification = classifyError(error);
    const isAbort = isAbortError(error);
    lastHealthCheckTs = now;
    lastHealthCheckOk = false;
    lastHealthModels = [];
    lastHealthError = classification.message;

    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: isAbort
          ? 'OLLAMA_ABORTED'
          : classification.type === 'ipc'
            ? 'IPC_CONTRACT_ERROR'
            : 'OLLAMA_IPC_FAILED',
        message: isAbort ? 'Requete annulee' : classification.message,
        hint: classification.hint,
        retryable: !isAbort && classification.retryable,
      },
    };
  }
}

/**
 * IPC: Generate completion via Tauri command
 */
async function ipcGenerate(
  req: OllamaGenerateRequest
): Promise<AiResult<OllamaGenerateResponse>> {
  try {
    const defaultTimeoutSecs = Math.max(
      1,
      Math.ceil(getProviderTimeout('ollama') / 1000)
    );

    const result = await secureInvoke<{
      content: string;
      latency_ms: number;
      model: string;
      error?: string;
      total_duration?: number;
      load_duration?: number;
      prompt_eval_count?: number;
      prompt_eval_duration?: number;
      eval_count?: number;
      eval_duration?: number;
      done_reason?: string;
    }>('ollama_generate', {
      req: {
        model: req.model,
        prompt: req.prompt,
        system_prompt: req.system,
        temperature: req.temperature,
        max_tokens: req.max_tokens,
        timeout_secs: req.timeout_secs ?? defaultTimeoutSecs,
        num_ctx: req.num_ctx,
      },
    });

    if (result.error) {
      // ✅ IPC FIX (Ω∞.v1): Classify backend error
      const classification = classifyError(result.error);
      return {
        ok: false,
        provider: 'ollama',
        error: {
          code: classification.type === 'ipc' ? 'IPC_CONTRACT_ERROR' : 'OLLAMA_IPC_ERROR',
          message: classification.message,
          hint: classification.hint,
          retryable: classification.retryable,
        },
      };
    }

    return {
      ok: true,
      provider: 'ollama',
      content: {
        content: result.content,
        model: result.model,
        latency_ms: result.latency_ms,
        total_duration: result.total_duration,
        load_duration: result.load_duration,
        prompt_eval_count: result.prompt_eval_count,
        prompt_eval_duration: result.prompt_eval_duration,
        eval_count: result.eval_count,
        eval_duration: result.eval_duration,
        done_reason: result.done_reason,
      },
    };
  } catch (error) {
    // ✅ IPC FIX (Ω∞.v1): Distinguish IPC errors from Ollama errors
    const classification = classifyError(error);
    const isAbort = isAbortError(error);

    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: isAbort
          ? 'OLLAMA_ABORTED'
          : classification.type === 'ipc'
            ? 'IPC_CONTRACT_ERROR'
            : 'OLLAMA_IPC_EXCEPTION',
        message: isAbort ? 'Requete annulee' : classification.message,
        hint: classification.hint,
        retryable: !isAbort && classification.retryable,
      },
    };
  }
}

// ============================================================
// PUBLIC API (TRANSPORT ABSTRACTION)
// ============================================================

/**
 * Check Ollama availability (health check)
 */
export async function ollamaCheckHealth(): Promise<AiResult<OllamaTagsResponse>> {
  logger.debug(`Health check via ${TRANSPORT_MODE}`);
  return isBrowserProxyEnvironment() ? httpCheckHealth() : ipcCheckHealth();
}

/**
 * Generate text completion via Ollama
 */
export async function ollamaGenerate(
  req: OllamaGenerateRequest
): Promise<AiResult<OllamaGenerateResponse>> {
  logger.debug(`Generate request via ${TRANSPORT_MODE}`, {
    model: req.model,
    promptLen: req.prompt.length,
  });
  return isBrowserProxyEnvironment() ? httpGenerate(req) : ipcGenerate(req);
}

/**
 * Get transport mode for debugging
 */
export function getTransportMode(): string {
  return TRANSPORT_MODE;
}
