/**
 * TITANE∞ v27.2Ω — Ollama Transport Layer (Dual Mode)
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
  try {
    // Tauri backend doesn't expose /tags via IPC, use generate as health check
    const testResult = await secureInvoke<{
      content: string;
      latency_ms: number;
      model: string;
      error?: string;
    }>('ollama_generate', {
      req: {
        model: 'gemma2:2b',
        prompt: 'ping',
        timeout_secs: 5,
      },
    });

    if (testResult.error) {
      // ✅ IPC FIX (Ω∞.v1): Classify backend error
      const classification = classifyError(testResult.error);
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
    const result = await secureInvoke<{
      content: string;
      latency_ms: number;
      model: string;
      error?: string;
    }>('ollama_generate', {
      req: {
        model: req.model,
        prompt: req.prompt,
        system_prompt: req.system,
        temperature: req.temperature,
        timeout_secs: req.timeout_secs || 30,
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
