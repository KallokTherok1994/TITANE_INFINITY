/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v27.3Ω — OLLAMA PROVIDER (TAURI GATEWAY)
 *   PHASE OMEGA PROXY SEAL: Tauri-only gateway
 *   Provider Ollama avec protection maximale + Always Respond
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse, AIConfig } from '../types';
import { DEFAULT_AI_CONFIG } from '../types';
import {
  SecureAIService,
  type SecureAIRequest,
  type SecureAIResponse,
  type ChatResponse,
} from '@/lib/security';
import { autoHealEngine } from '../autoHealEngine';
import { memoryIntegration } from '../memoryIntegration'; // ✨ v21 - Memory integration
import type { MemoryContext } from '../memoryIntegration'; // ✨ v21
import { createLogger } from '@/utils/logger'; // ✨ v21.1 - Conditional logging

// ✅ v27.2Ω: Import unified transport layer (dual mode HTTP + IPC)
import { ollamaCheckHealth, ollamaGenerate } from '../transports/ollamaTransport';
import { titaneLocalProvider } from './titaneLocal';

const logger = createLogger('Ollama'); // ✨ v21.1
const runtimeConfig = (globalThis as any)?.__TITANE_RUNTIME_CONFIG__ || {};

// ✅ AUDIT FIX #3: Boot ready gate — tracks if Ollama initialized successfully
export let IS_OLLAMA_READY = false;

// ✅ PROD FIX v27.0.2: Default Ollama Configuration
export const DEFAULT_OLLAMA_CONFIG = {
  port: 11434,
  model: 'gemma2:2b',
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  num_predict: 128,
  repeat_penalty: 1.1,
  timeout_ms: 60000,
  connect_timeout_ms: 5000,
  retry_count: 3,
  retry_delay_ms: 1000,
  auto_start: true,
  check_on_startup: true,
  fallback_provider: 'titane-local',
} as const;

export function getOllamaConfig() {
  // 1. Try environment variables first
  const envModel =
    typeof process !== 'undefined' ? (process as any).env?.OLLAMA_MODEL : undefined;
  const envEndpoint =
    typeof process !== 'undefined' ? (process as any).env?.OLLAMA_ENDPOINT : undefined;

  if (envModel || envEndpoint) {
    return {
      ...DEFAULT_OLLAMA_CONFIG,
      ...(envModel && { model: envModel.trim() }),
      ...(envEndpoint && { endpoint: envEndpoint.trim() }),
    };
  }

  // 2. Try localStorage (persisted user config)
  try {
    const stored =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('titane_ollama_config')
        : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_OLLAMA_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('[Ollama] Failed to load stored config:', err);
  }

  // 3. Return defaults
  return { ...DEFAULT_OLLAMA_CONFIG };
}

export function setOllamaConfig(config: Partial<typeof DEFAULT_OLLAMA_CONFIG>) {
  try {
    const current = getOllamaConfig();
    const updated = { ...current, ...config };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('titane_ollama_config', JSON.stringify(updated));
      console.log('[Ollama] Configuration updated and persisted:', config);
    }
    return true;
  } catch (err) {
    console.error('[Ollama] Failed to save config:', err);
    return false;
  }
}

const OLLAMA_MODEL =
  typeof runtimeConfig.ollamaModel === 'string' &&
  runtimeConfig.ollamaModel.trim().length > 0
    ? runtimeConfig.ollamaModel.trim()
    : getOllamaConfig().model;
const isTestEnv = typeof process !== 'undefined' && Boolean((process as any).env?.VITEST);

// OMEGA: Endpoint health tracking
let endpointHealthy: boolean | null = null;
let lastHealthCheck = 0;
let errorCount = 0;
const HEALTH_CHECK_INTERVAL = 45000; // 45 secondes
const MAX_ENDPOINT_ERRORS = 5;

const CIRCUIT_FAILURE_WINDOW_MS = 60000;
const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_OPEN_MS = 120000;
let circuitOpenUntil = 0;
let failureTimestamps: number[] = [];

/**
 * OMEGA: Initialize Ollama provider at startup (v27.2Ω)
 * Tests endpoint health via unified transport (HTTP dev / IPC prod)
 */
export async function initializeOllama(): Promise<boolean> {
  logger.debug('🚀 Initializing Ollama provider (gateway)...');

  try {
    const healthResult = await ollamaCheckHealth();
    const healthy = healthResult.ok;

    endpointHealthy = healthy;
    IS_OLLAMA_READY = healthy; // ✅ AUDIT FIX #3: Set boot ready gate
    lastHealthCheck = Date.now();

    if (healthy) {
      errorCount = 0;
      logger.info('✅ Health check passed (gateway)');
      logger.debug(`📦 Model: ${OLLAMA_MODEL}`);
    } else {
      logger.warn('⚠️ Endpoint offline (gateway)');
      if (!healthResult.ok && healthResult.error) {
        logger.warn(`❌ ${healthResult.error.message}`);
      }
      logger.warn('🔄 Falling back to local provider');
    }

    return healthy;
  } catch (error) {
    IS_OLLAMA_READY = false; // ✅ AUDIT FIX #3: Mark not ready on error
    handleOllamaError(error, 'initialization', { transport: 'gateway' });
    logger.error('❌ Initialization failed:', error);
    return false;
  }
}

/**
 * Construit le prompt pour Ollama (legacy - sans mémoire)
 * @deprecated Use buildPromptWithMemory() instead
 */
function _buildPrompt(message: string, history: AIMessage[]): string {
  const recentHistory = history.slice(-5);

  if (recentHistory.length === 0) {
    return `Tu es TITANE∞, une IA cognitive avancée. Réponds en français de manière professionnelle et précise.

Utilisateur: ${message}

TITANE∞:`;
  }

  const contextLines = recentHistory.map(
    msg => `${msg.role === 'user' ? 'Utilisateur' : 'TITANE∞'}: ${msg.content}`
  );

  return `Tu es TITANE∞, une IA cognitive avancée. Réponds en français de manière professionnelle et précise.

Contexte récent:
${contextLines.join('\n')}

Utilisateur: ${message}

TITANE∞:`;
}

/**
 * ✨ v21 - Construit le prompt enrichi avec mémoire STM/MTM/LTM
 */
async function buildPromptWithMemory(
  message: string,
  history: AIMessage[]
): Promise<string> {
  const recentHistory = history.slice(-5);

  // Charger contexte mémoire
  let memoryContext: MemoryContext | null = null;
  try {
    memoryContext = await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: true,
      includeKnowledge: true,
      includeRituals: false,
      includeTimeline: false,
      maxProjects: 3,
      maxDecisions: 5,
      maxKnowledge: 10,
      timeWindow: '7d',
    });
  } catch (error) {
    logger.warn('Failed to load memory context', error);
  }

  // Construire sections du prompt
  const sections: string[] = [];

  // System prompt
  sections.push(
    `Tu es TITANE∞ v21, un OS cognitif personnel développé pour Kevin Thibault.`,
    ``,
    `IDENTITÉ:`,
    `- Système local-first (priorité absolue à la vie privée)`,
    `- Multi-IA orchestré (Ollama local, Claude, OpenAI en backup)`,
    `- Mémoire persistante (STM/MTM/LTM)`,
    `- Auto-évolution cognitive`,
    ``,
    `PRINCIPES:`,
    `- Local-first: toujours privilégier Ollama quand possible`,
    `- Mémoire vivante: utiliser le contexte passé pour répondre`,
    `- Précision technique: réponses structurées, claires, sourcées`,
    `- Français: langue par défaut`,
    ``,
    `STYLE:`,
    `- Réponses structurées (titres, listes, sections)`,
    `- Ton professionnel mais accessible`,
    `- Citer la mémoire quand pertinent`,
    `- Admettre quand tu ne sais pas`
  );

  // Contexte mémoire
  if (memoryContext) {
    sections.push(``, `📋 CONTEXTE MÉMOIRE:`);

    if (memoryContext.activeProjects?.length > 0) {
      const projectNames = memoryContext.activeProjects
        .map(p => p.title)
        .filter(Boolean)
        .join(', ');
      if (projectNames) {
        sections.push(`Projets actifs: ${projectNames}`);
      }
    }

    if (memoryContext.recentDecisions?.length > 0) {
      const decisions = memoryContext.recentDecisions
        .slice(0, 3)
        .map(d => d.title)
        .filter(Boolean)
        .join('; ');
      if (decisions) {
        sections.push(`Décisions récentes: ${decisions}`);
      }
    }

    if (memoryContext.relevantKnowledge?.length > 0) {
      const knowledgeCount = memoryContext.relevantKnowledge.length;
      sections.push(`Base de connaissances: ${knowledgeCount} entrées disponibles`);
    }
  }

  // Conversation récente
  if (recentHistory.length > 0) {
    sections.push(``, `💬 CONVERSATION RÉCENTE:`);
    const contextLines = recentHistory.map(
      msg => `${msg.role === 'user' ? 'Utilisateur' : 'TITANE∞'}: ${msg.content}`
    );
    sections.push(...contextLines);
  }

  // Message utilisateur
  sections.push(``, `Utilisateur: ${message}`, ``, `TITANE∞:`);

  return sections.join('\n');
}

/**
 * OMEGA: Test endpoint health with timeout (v27.2Ω)
 * Uses unified transport layer (HTTP dev / IPC prod)
 */
async function checkEndpointHealth(): Promise<boolean> {
  try {
    const result = await ollamaCheckHealth();
    return result.ok;
  } catch (error) {
    handleOllamaError(error, 'health_check', { transport: 'gateway' });
    return false;
  }
}

function isCircuitOpen(): boolean {
  return Date.now() < circuitOpenUntil;
}

function recordFailure(): void {
  const now = Date.now();
  failureTimestamps = failureTimestamps.filter(
    ts => now - ts <= CIRCUIT_FAILURE_WINDOW_MS
  );
  failureTimestamps.push(now);
  if (failureTimestamps.length >= CIRCUIT_FAILURE_THRESHOLD) {
    circuitOpenUntil = now + CIRCUIT_OPEN_MS;
  }
}

function resetFailures(): void {
  failureTimestamps = [];
  circuitOpenUntil = 0;
}

async function fallbackToLocal(
  message: string,
  history: AIMessage[],
  reason: string
): Promise<AIResponse> {
  const localResponse = await titaneLocalProvider.generate(message, history);
  return {
    ...localResponse,
    metadata: {
      ...localResponse.metadata,
      fallbackUsed: true,
      fallbackReason: reason,
    },
  };
}

/**
 * OMEGA: Error handler avec auto-heal integration
 */
function handleOllamaError(
  error: unknown,
  context: string,
  metadata?: Record<string, unknown>
): void {
  errorCount++;

  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Auto-heal trigger (direct instance)
  autoHealEngine.heal('ollama', errorObj, 'provider', {
    context,
    errorCount,
    ...metadata,
    timestamp: Date.now(),
  });

  logger.error('Error in Ollama provider', {
    context,
    message: errorObj.message,
    errorCount,
    maxErrors: MAX_ENDPOINT_ERRORS,
  });

  // Mark as unhealthy if too many errors
  if (errorCount >= MAX_ENDPOINT_ERRORS) {
    endpointHealthy = false;
    logger.warn('Endpoint marked unhealthy', { errorCount });
  }
}

export const ollamaProvider: AIProvider = {
  name: 'ollama',

  async isAvailable(): Promise<boolean> {
    const now = Date.now();

    if (isCircuitOpen()) {
      return false;
    }

    const bypassCache = isTestEnv;

    // OMEGA: Use cached health status if recent (unless test forces re-check)
    if (
      !bypassCache &&
      endpointHealthy !== null &&
      now - lastHealthCheck < HEALTH_CHECK_INTERVAL
    ) {
      return endpointHealthy;
    }

    // OMEGA: If too many errors, consider unavailable
    if (errorCount >= MAX_ENDPOINT_ERRORS) {
      // Reset after some time
      if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL * 5) {
        errorCount = 0;
        endpointHealthy = null;
      } else {
        return false;
      }
    }

    logger.debug('🔍 OMEGA: Checking endpoint health...');

    endpointHealthy = await checkEndpointHealth();
    lastHealthCheck = now;

    if (endpointHealthy) {
      errorCount = 0; // Reset on success
      resetFailures();
    }

    logger.debug(
      `   ${endpointHealthy ? '✅' : '❌'} Ollama endpoint: ${endpointHealthy ? 'healthy' : 'unavailable'}`
    );

    return endpointHealthy;
  },

  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: unknown
  ): Promise<AIResponse> {
    const finalConfig = {
      ...DEFAULT_AI_CONFIG,
      ...(config as Partial<AIConfig> | undefined),
    };

    // 🚨 DEBUG CRITICAL: Log appel Ollama provider
    console.log('[ollamaProvider] 🟢 generate() APPELÉ', {
      message: message.substring(0, 100),
      historyLength: history.length,
      model: OLLAMA_MODEL,
      transport: 'gateway',
      timestamp: new Date().toISOString(),
    });

    if (isCircuitOpen()) {
      return fallbackToLocal(message, history, 'E_PROVIDER_UNAVAILABLE');
    }

    // OMEGA: Pre-check endpoint health
    const isHealthy = await this.isAvailable();
    if (!isHealthy) {
      recordFailure();
      return fallbackToLocal(message, history, 'E_PROVIDER_UNAVAILABLE');
    }

    console.log('[ollamaProvider] ✅ Health check passed, proceeding...');

    // ============================================================
    // SECURE AI REQUEST (OMEGA Enhanced)
    // ============================================================
    const secureRequest: SecureAIRequest = {
      input: message,
      provider: 'ollama',
      model: OLLAMA_MODEL,
      userId:
        (typeof window !== 'undefined' && (window as any).__TITANE_USER_ID__) ||
        'anonymous',
      metadata: {
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
        historyLength: history.length,
        requestId: `ollama-${Date.now()}`,
      },
    };

    try {
      const secureResult: SecureAIResponse<ChatResponse> =
        await SecureAIService.executeSecureChat(secureRequest, async sanitizedMessage => {
          try {
            // ✨ v21 - Use memory-enriched prompt
            const prompt = await buildPromptWithMemory(sanitizedMessage, history);

            // ✅ Gateway via Tauri command
            const generateResult = await ollamaGenerate({
              model: OLLAMA_MODEL,
              prompt,
              temperature: finalConfig.temperature,
              max_tokens: finalConfig.maxTokens,
              timeout_secs: Math.floor((finalConfig.timeout || 30000) / 1000),
            });

            if (!generateResult.ok) {
              recordFailure();
              const error = new Error(generateResult.error.message);
              error.name = generateResult.error.code;
              throw error;
            }

            resetFailures();

            // Return in ChatResponse format
            return {
              content: generateResult.content.content.trim(),
              role: 'assistant' as const,
              timestamp: Date.now(),
              metadata: {
                model: OLLAMA_MODEL,
                transport: 'gateway',
                latency_ms: generateResult.content.latency_ms,
              },
            };
          } catch (error) {
            // 🚨 DEBUG CRITICAL: Log erreur Ollama
            console.error('[ollamaProvider] ❌ Generate error', {
              error: error instanceof Error ? error.message : String(error),
              transport: 'gateway',
              timestamp: new Date().toISOString(),
            });

            throw error;
          }
        });

      // ============================================================
      // SECURITY VALIDATION CHECK (OMEGA Enhanced)
      // ============================================================
      if (!secureResult.success) {
        const errorMsg = secureResult.error || 'Security validation failed';

        if (secureResult.rateLimitExceeded) {
          const rateLimitError = new Error(`Rate limit exceeded — ${errorMsg}`);
          handleOllamaError(rateLimitError, 'rate_limit', { secureResult });
          throw rateLimitError;
        }

        if (secureResult.sanitization?.isBlocked) {
          const patterns = secureResult.sanitization.detectedPatterns.join(', ');
          const sanitizationError = new Error(`Input blocked — Detected: ${patterns}`);
          handleOllamaError(sanitizationError, 'sanitization', { patterns });
          throw sanitizationError;
        }

        if (!secureResult.validation?.isValid) {
          const validationError = new Error(`Response validation failed — ${errorMsg}`);
          handleOllamaError(validationError, 'validation', { secureResult });
          throw validationError;
        }

        const securityError = new Error(errorMsg);
        handleOllamaError(securityError, 'security', { secureResult });
        throw securityError;
      }

      // ============================================================
      // SUCCESS (OMEGA)
      // ============================================================
      const aiResponse: AIResponse = {
        content: secureResult.response.content,
        provider: 'ollama',
        timestamp: Date.now(),
        model: OLLAMA_MODEL,
      };

      // 🚨 DEBUG CRITICAL: Log succès Ollama
      console.log('[ollamaProvider] ✅ Réponse Ollama générée avec succès', {
        contentLength: aiResponse.content.length,
        provider: aiResponse.provider,
        model: aiResponse.model,
        timestamp: new Date().toISOString(),
      });

      // ✨ v21 - Save interaction to memory (async, non-blocking)
      memoryIntegration
        .saveInteraction({
          userMessage: message,
          aiResponse: aiResponse.content,
          mode: 'chat',
        })
        .catch(err => {
          logger.warn('Failed to save interaction to memory', { error: err });
        });

      return aiResponse;
    } catch (error) {
      // OMEGA: Final error handler
      if (error instanceof Error) {
        // Don't double-handle errors already processed
        if (
          !error.message.includes('Ollama:') &&
          !error.message.includes('Rate limit') &&
          !error.message.includes('Input blocked') &&
          !error.message.includes('validation failed')
        ) {
          handleOllamaError(error, 'generate_final', { stage: 'catch_all' });
        }
        return fallbackToLocal(message, history, 'E_PROVIDER_UNAVAILABLE');
      }

      handleOllamaError(new Error('Ollama: Unknown error'), 'generate_unknown', {
        error,
      });
      return fallbackToLocal(message, history, 'E_PROVIDER_UNAVAILABLE');
    }
  },

  /**
   * OMEGA: Reset error state (for auto-heal)
   */
  resetErrors(): void {
    errorCount = 0;
    endpointHealthy = null;
    lastHealthCheck = 0;
    logger.debug('🔄 Errors and health state reset');
  },

  /**
   * OMEGA: Get provider stats
   */
  getStats(): {
    errorCount: number;
    maxErrors: number;
    endpointHealthy: boolean | null;
    lastHealthCheck: number;
  } {
    return {
      errorCount,
      maxErrors: MAX_ENDPOINT_ERRORS,
      endpointHealthy,
      lastHealthCheck,
    };
  },

  // Streaming pour Ollama
  // TODO v27.2Ω: Streaming via transport layer (requires IPC streaming support)
  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    const fallbackResponse = await this.generate(message, history);
    yield fallbackResponse.content;
  },
};

export default ollamaProvider;
