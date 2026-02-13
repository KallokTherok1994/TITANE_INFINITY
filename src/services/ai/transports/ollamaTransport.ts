/**
 * TITANE∞ v27.2Ω — Ollama Transport Layer (Dual Mode)
 * 
 * Universal Ollama transport supporting:
 * - Dev mode: HTTP fetch via Vite proxy (/api/ollama → 127.0.0.1:11434)
 * - Production: Tauri IPC invoke ('ollama_generate')
 * 
 * This module provides the SINGLE SOURCE OF TRUTH for all Ollama communications.
 * NO OTHER code should call Ollama directly.
 */

import { invoke } from '@tauri-apps/api/core';
import { createLogger } from '@/utils/logger';
import type { AiResult, AiOk, AiErr } from '../types';

const logger = createLogger('OllamaTransport');

// ============================================================
// ENVIRONMENT DETECTION
// ============================================================

/**
 * Détecte si l'app tourne dans Tauri (production) ou web/dev
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

const IS_TAURI = isTauriEnvironment();
const TRANSPORT_MODE = IS_TAURI ? 'IPC' : 'HTTP';

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
// HTTP TRANSPORT (DEV MODE — VITE PROXY)
// ============================================================

const OLLAMA_API_BASE = '/api/ollama';
const FETCH_TIMEOUT_MS = 30000; // 30s

/**
 * Construit une URL relative pour le proxy Vite
 */
function getOllamaURL(endpoint: string): string {
  return `${OLLAMA_API_BASE}${endpoint}`;
}

/**
 * HTTP fetch avec timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * HTTP: Health check (/tags)
 */
async function httpCheckHealth(): Promise<AiResult<OllamaTagsResponse>> {
  try {
    const response = await fetchWithTimeout(
      getOllamaURL('/tags'),
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
      8000 // 8s health check timeout
    );

    if (!response.ok) {
      return {
        ok: false,
        provider: 'ollama',
        error: {
          code: 'OLLAMA_HTTP_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          hint: 'Vérifie que Ollama est démarré et accessible.',
          retryable: true,
        },
      };
    }

    const data = await response.json();
    return {
      ok: true,
      provider: 'ollama',
      content: data,
    };
  } catch (error) {
    const err = error as Error;
    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: err.name === 'AbortError' ? 'OLLAMA_TIMEOUT' : 'OLLAMA_UNREACHABLE',
        message: err.name === 'AbortError' 
          ? 'Délai de réponse dépassé (8s)' 
          : `Connexion impossible: ${err.message}`,
        hint: 'Ollama est indisponible. Démarre le service puis réessaie.',
        retryable: true,
      },
    };
  }
}

/**
 * HTTP: Generate completion
 */
async function httpGenerate(
  req: OllamaGenerateRequest
): Promise<AiResult<OllamaGenerateResponse>> {
  try {
    const timeoutMs = (req.timeout_secs || 30) * 1000;
    
    const response = await fetchWithTimeout(
      getOllamaURL('/generate'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: req.model,
          prompt: req.prompt,
          system: req.system,
          stream: false,
          options: {
            temperature: req.temperature,
            num_predict: req.max_tokens,
          },
        }),
      },
      timeoutMs
    );

    if (!response.ok) {
      return {
        ok: false,
        provider: 'ollama',
        error: {
          code: 'OLLAMA_HTTP_ERROR',
          message: `HTTP ${response.status}`,
          hint: 'Vérifie que Ollama fonctionne correctement.',
          retryable: response.status >= 500,
        },
      };
    }

    const data = await response.json();

    if (!data.response) {
      return {
        ok: false,
        provider: 'ollama',
        error: {
          code: 'OLLAMA_EMPTY_RESPONSE',
          message: 'Réponse vide reçue du modèle',
          hint: 'Réessaie ou choisis un autre modèle.',
          retryable: true,
        },
      };
    }

    return {
      ok: true,
      provider: 'ollama',
      content: {
        content: data.response.trim(),
        model: req.model,
      },
    };
  } catch (error) {
    const err = error as Error;
    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: err.name === 'AbortError' ? 'OLLAMA_TIMEOUT' : 'OLLAMA_UNREACHABLE',
        message: err.name === 'AbortError'
          ? `Délai de réponse dépassé (${req.timeout_secs || 30}s)`
          : `Connexion impossible: ${err.message}`,
        hint: 'Ollama est indisponible (service local). Démarre Ollama puis réessaie.',
        retryable: true,
      },
    };
  }
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
    const testResult = await invoke<{
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
      return {
        ok: false,
        provider: 'ollama',
        error: {
          code: 'OLLAMA_IPC_ERROR',
          message: testResult.error,
          hint: 'Ollama est indisponible (service local). Démarre Ollama puis réessaie.',
          retryable: true,
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
    const err = error as Error;
    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: 'OLLAMA_IPC_FAILED',
        message: `Invoke failed: ${err.message}`,
        hint: 'Le service Ollama local n\'est pas accessible.',
        retryable: true,
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
    const result = await invoke<{
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
      return {
        ok: false,
        provider: 'ollama',
        error: {
          code: 'OLLAMA_IPC_ERROR',
          message: result.error,
          hint: result.error.includes('offline')
            ? 'Ollama est indisponible. Démarre le service puis réessaie.'
            : 'Une erreur est survenue. Réessaie ou vérifie les logs.',
          retryable: true,
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
    const err = error as Error;
    return {
      ok: false,
      provider: 'ollama',
      error: {
        code: 'OLLAMA_IPC_EXCEPTION',
        message: `Invoke exception: ${err.message}`,
        hint: 'Le backend Tauri n\'a pas pu appeler Ollama. Vérifie que le service est démarré.',
        retryable: true,
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
  return IS_TAURI ? ipcCheckHealth() : httpCheckHealth();
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
  return IS_TAURI ? ipcGenerate(req) : httpGenerate(req);
}

/**
 * Get transport mode for debugging
 */
export function getTransportMode(): 'IPC' | 'HTTP' {
  return TRANSPORT_MODE;
}
