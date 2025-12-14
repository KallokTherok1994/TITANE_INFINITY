/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v21.5 — UNIFIED API GATEWAY (Cognitive Integration)
 * Architecture unifiée pour l'orchestration IA
 * ═══════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * DESIGN PRINCIPLES
 * ─────────────────────────────────────────────────────────────────
 * 1. Single Source of Truth: Un seul orchestrateur
 * 2. Cognitive Integration: Cache connecté à SingularityKernel
 * 3. Rust-Native: Performance maximale, sécurité type-safe
 * 4. Observable: Traces complètes, metrics unifiés
 * 5. Extensible: Nouveau provider = 1 trait impl
 */

// ═══════════════════════════════════════════════════════════════════
// TYPES CORE
// ═══════════════════════════════════════════════════════════════════

/**
 * Configuration globale du Gateway
 */
interface GatewayConfig {
  /** Provider par défaut */
  defaultProvider: 'gemini' | 'openai' | 'claude' | 'ollama';

  /** Stratégie de fallback */
  fallbackStrategy: 'cascade' | 'round-robin' | 'cognitive';

  /** Cache cognitif activé */
  cognitiveCacheEnabled: boolean;

  /** Seuil de conscience pour cache (0-100) */
  consciousnessThreshold: number;

  /** Timeout global (ms) */
  globalTimeout: number;

  /** Retry max attempts */
  maxRetries: number;

  /** Circuit breaker config */
  circuitBreaker: {
    failureThreshold: number; // Échecs avant ouverture
    recoveryTimeout: number; // ms avant retry
    halfOpenRequests: number; // Requêtes test en half-open
  };

  /** Rate limiting */
  rateLimit: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    costBudget: number; // $ par heure
  };
}

/**
 * Requête unifiée vers le Gateway
 */
interface UnifiedChatRequest {
  /** Message utilisateur */
  message: string;

  /** Historique conversation */
  history: Array<{ role: 'user' | 'assistant'; content: string }>;

  /** Mode chat (défini contexte/température) */
  mode?: 'conversational' | 'technical' | 'creative' | 'coaching';

  /** Provider forcé (override auto-selection) */
  forceProvider?: 'gemini' | 'openai' | 'claude' | 'ollama';

  /** Configuration override */
  config?: {
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
  };

  /** Métadonnées cognitive */
  cognitiveContext?: {
    userStress?: number; // 0-100
    sessionCoherence?: number; // 0-100
    importance?: number; // 0-100
  };
}

/**
 * Réponse unifiée du Gateway
 */
interface UnifiedChatResponse {
  /** Contenu généré */
  content: string;

  /** Provider utilisé */
  provider: 'gemini' | 'openai' | 'claude' | 'ollama';

  /** Métadonnées provider */
  metadata: {
    model: string;
    tokens?: number;
    latencyMs: number;
    finishReason?: string;
  };

  /** Provenance cache */
  cached: boolean;

  /** Nombre de retries */
  retries: number;

  /** Fallback utilisé */
  fallback?: {
    originalProvider: string;
    reason: string;
  };

  /** Qualité cognitive */
  cognitive: {
    coherenceScore: number; // 0-100
    consciousnessLevel: number; // 0-100
    validatedBy: string[]; // ['nexus', 'sentinel', 'autoHeal']
  };

  /** Trace complète */
  trace: {
    traceId: string;
    steps: Array<{
      name: string;
      durationMs: number;
      success: boolean;
    }>;
  };
}

// ═══════════════════════════════════════════════════════════════════
// COGNITIVE CACHE INTERFACE
// ═══════════════════════════════════════════════════════════════════

/**
 * Cache intelligent connecté à SingularityKernel
 */
interface CognitiveCache {
  /**
   * Obtenir entrée si valide cognitivement
   */
  get(
    key: string,
    context: {
      consciousness: number;
      coherence: number;
    }
  ): Promise<UnifiedChatResponse | null>;

  /**
   * Stocker avec TTL adaptatif
   */
  set(
    key: string,
    value: UnifiedChatResponse,
    options: {
      pattern?: string; // Pattern singularité détecté
      frequency?: number; // Fréquence d'utilisation 0-1
    }
  ): Promise<void>;

  /**
   * Invalider cache si incohérence
   */
  invalidateIfIncoherent(consciousnessThreshold: number): Promise<number>;

  /**
   * Stats cognitive
   */
  getStats(): {
    size: number;
    hitRate: number;
    avgTTL: number;
    cognitiveHits: number; // Hits validés par conscience
    cognitiveBypass: number; // Bypass pour incohérence
  };
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER ROUTER
// ═══════════════════════════════════════════════════════════════════

/**
 * Sélection intelligente du provider
 */
interface ProviderRouter {
  /**
   * Sélectionner provider optimal
   */
  selectProvider(
    request: UnifiedChatRequest,
    context: {
      availableProviders: string[];
      circuitState: Map<string, 'closed' | 'open' | 'half-open'>;
      recentLatencies: Map<string, number[]>;
      costBudgetRemaining: number;
    }
  ): Promise<{
    provider: string;
    reason: string;
    confidence: number;
  }>;

  /**
   * Cascade fallback automatique
   */
  getFallbackChain(failedProvider: string, error: Error): string[];
}

// ═══════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════════

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreaker {
  /**
   * État actuel du circuit
   */
  getState(provider: string): CircuitState;

  /**
   * Enregistrer succès
   */
  recordSuccess(provider: string): void;

  /**
   * Enregistrer échec
   */
  recordFailure(provider: string, error: Error): void;

  /**
   * Vérifier si requête autorisée
   */
  allowRequest(provider: string): boolean;

  /**
   * Reset manuel
   */
  reset(provider: string): void;
}

// ═══════════════════════════════════════════════════════════════════
// METRICS COLLECTOR
// ═══════════════════════════════════════════════════════════════════

/**
 * Métriques unifiées
 */
interface MetricsCollector {
  /**
   * Enregistrer requête
   */
  recordRequest(
    provider: string,
    latencyMs: number,
    success: boolean,
    cached: boolean,
    tokens?: number
  ): void;

  /**
   * Snapshot actuel
   */
  getSnapshot(): {
    requests: {
      total: number;
      success: number;
      failed: number;
      cached: number;
    };
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    providers: Map<
      string,
      {
        requests: number;
        avgLatency: number;
        errorRate: number;
      }
    >;
    cost: {
      totalTokens: number;
      estimatedCost: number; // USD
    };
  };

  /**
   * Reset compteurs
   */
  reset(): void;
}

// ═══════════════════════════════════════════════════════════════════
// API GATEWAY PRINCIPALE
// ═══════════════════════════════════════════════════════════════════

/**
 * Gateway unifié pour toutes les requêtes IA
 */
interface APIGateway {
  /**
   * Initialiser gateway
   */
  initialize(config: GatewayConfig): Promise<void>;

  /**
   * Générer réponse (point d'entrée unique)
   */
  chat(request: UnifiedChatRequest): Promise<UnifiedChatResponse>;

  /**
   * Streaming
   */
  chatStream(
    request: UnifiedChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<UnifiedChatResponse>;

  /**
   * Connecter SingularityKernel (cognitive integration)
   */
  connectSingularityKernel(kernel: {
    getSystemConsciousness: () => { continuityScore: number; holismScore: number };
    getSingularityMemory: () => { conceptualPatterns: Map<string, unknown> };
  }): void;

  /**
   * Health check
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Map<
      string,
      {
        available: boolean;
        latency: number;
        circuitState: CircuitState;
      }
    >;
  }>;

  /**
   * Métriques
   */
  getMetrics(): ReturnType<MetricsCollector['getSnapshot']>;

  /**
   * Shutdown
   */
  shutdown(): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════
// IMPLEMENTATION EXAMPLE (Frontend usage)
// ═══════════════════════════════════════════════════════════════════

/**
 * Exemple d'utilisation depuis chatEngine.ts
 */
export async function exampleUsage() {
  // ✨ v21.5: Appel unifié au lieu de orchestrator.ts complexe
  const response = await invoke<UnifiedChatResponse>('unified_chat', {
    request: {
      message: 'Explique la relativité générale',
      history: [],
      mode: 'technical',
      cognitiveContext: {
        userStress: 30,
        sessionCoherence: 85,
        importance: 90,
      },
    },
  });

  console.log(`Response from ${response.provider} (${response.metadata.latencyMs}ms)`);
  console.log(
    `Cached: ${response.cached}, Coherence: ${response.cognitive.coherenceScore}`
  );

  if (response.fallback) {
    console.warn(
      `Fallback used: ${response.fallback.originalProvider} → ${response.provider}`
    );
  }

  return response.content;
}

// ═══════════════════════════════════════════════════════════════════
// BACKEND RUST STRUCTURE (à implémenter)
// ═══════════════════════════════════════════════════════════════════

/**
 * Structure Rust proposée:
 *
 * src-tauri/src/gateway/
 *   mod.rs              // Public API
 *   config.rs           // GatewayConfig
 *   router.rs           // ProviderRouter impl
 *   cache.rs            // CognitiveCache impl
 *   circuit_breaker.rs  // CircuitBreaker impl
 *   metrics.rs          // MetricsCollector impl
 *   providers/
 *     mod.rs            // Provider trait
 *     gemini.rs         // GeminiProvider impl
 *     openai.rs         // OpenAIProvider impl
 *     claude.rs         // ClaudeProvider impl
 *     ollama.rs         // OllamaProvider impl
 *
 * Commands:
 *   #[tauri::command]
 *   async fn unified_chat(request: UnifiedChatRequest) -> UnifiedChatResponse
 *
 *   #[tauri::command]
 *   async fn gateway_health() -> HealthStatus
 *
 *   #[tauri::command]
 *   async fn gateway_metrics() -> MetricsSnapshot
 */

// ═══════════════════════════════════════════════════════════════════
// COGNITIVE INTEGRATION HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hooks pour connecter SingularityKernel
 */
interface CognitiveIntegration {
  /**
   * Appelé avant sélection provider
   */
  onProviderSelection?: (context: {
    request: UnifiedChatRequest;
    consciousness: number;
    patterns: Map<string, number>; // Patterns détectés
  }) => {
    suggestedProvider?: string;
    adjustedTemperature?: number;
  };

  /**
   * Appelé après réponse
   */
  onResponseGenerated?: (context: {
    response: UnifiedChatResponse;
    consciousness: number;
  }) => {
    cacheDecision: 'cache' | 'skip' | 'extended-ttl';
    qualityAdjustment?: number; // -10 to +10
  };

  /**
   * Appelé sur erreur
   */
  onError?: (context: { provider: string; error: Error; consciousness: number }) => {
    fallbackStrategy: 'immediate' | 'delayed' | 'abort';
    notifyUser: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

export type {
  GatewayConfig,
  UnifiedChatRequest,
  UnifiedChatResponse,
  CognitiveCache,
  ProviderRouter,
  CircuitBreaker,
  MetricsCollector,
  APIGateway,
  CognitiveIntegration,
  CircuitState,
};
