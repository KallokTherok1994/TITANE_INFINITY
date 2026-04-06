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

const IS_TAURI = isTauriEnvironment();
const TRANSPORT_MODE = 'IPC';

const HEALTH_CACHE_TTL_MS = 10_000;
let lastHealthCheckTs = 0;
let lastHealthCheckOk = false;
let lastHealthError: string | null = null;

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

// ============================================================
// HTTP TRANSPORT
// ============================================================
// Désactivé en mode gouverné: toute requête réseau passe par IPC backend.

/**
 * HTTP: Health check (/tags)
 */
async function httpCheckHealth(): Promise<AiResult<OllamaTagsResponse>> {
  return ipcCheckHealth();
}

/**
 * HTTP: Generate completion
 */
async function httpGenerate(
  req: OllamaGenerateRequest
): Promise<AiResult<OllamaGenerateResponse>> {
  return ipcGenerate(req);
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
          models: [{ name: 'gemma2:2b', modified_at: '', size: 0 }],
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
    // Use lightweight backend ping command to avoid expensive /generate probes.
    await secureInvoke<number>('ping_ollama');
    lastHealthCheckTs = now;
    lastHealthCheckOk = true;
    lastHealthError = null;

    // Health check passed, return fake tags response
    return {
      ok: true,
      provider: 'ollama',
      content: {
        models: [{ name: 'gemma2:2b', modified_at: '', size: 0 }],
      },
    };
  } catch (error) {
    // ✅ IPC FIX (Ω∞.v1): Distinguish IPC errors from Ollama errors
    const classification = classifyError(error);
    const isAbort = isAbortError(error);
    lastHealthCheckTs = now;
    lastHealthCheckOk = false;
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
  return ipcCheckHealth();
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
  return ipcGenerate(req);
}

/**
 * Get transport mode for debugging
 */
export function getTransportMode(): 'IPC' | 'HTTP' {
  return TRANSPORT_MODE;
}
