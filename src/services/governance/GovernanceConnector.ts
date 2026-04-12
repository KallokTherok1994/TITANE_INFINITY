/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — Governance Connector
 *   Interface unifiée pour la configuration et validation des providers
 *   Phase 1 minimal : Vérification clés API, activation providers
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';

export type ProviderId = 'openai' | 'claude' | 'gemini' | 'ollama' | 'local' | 'tauri';

export interface ProviderStatus {
  id: ProviderId;
  name: string;
  isConfigured: boolean; // Clé API présente
  isActive: boolean; // Provider activé par l'utilisateur
  isHealthy: boolean; // Dernière vérification de santé OK
  lastChecked: number | null;
  error?: string;
  // v30.3.0: Provider reliability metrics for graduated fitness scoring
  successCount: number; // Total successful requests
  failureCount: number; // Total failed requests
  lastFailure: number | null; // Timestamp of last failure
  consecutiveFailures: number; // Consecutive failures without success
}

export interface GovernanceConfig {
  providers: Record<ProviderId, ProviderStatus>;
  defaultProvider: ProviderId;
  fallbackOrder: ProviderId[];
  autoFallback: boolean;
}

// Storage keys
const STORAGE_KEY_CONFIG = 'titane_governance_config';
const _STORAGE_KEY_ACTIVE_PROVIDERS = 'titane_active_providers';

// Providers configuration par défaut
const DEFAULT_PROVIDERS: Record<
  ProviderId,
  Omit<ProviderStatus, 'isConfigured' | 'isHealthy' | 'lastChecked'>
> = {
  local: {
    id: 'local',
    name: 'TITANE Local',
    isActive: true,
    successCount: 0,
    failureCount: 0,
    lastFailure: null,
    consecutiveFailures: 0,
  },
  tauri: {
    id: 'tauri',
    name: 'Tauri Backend',
    isActive: true,
    successCount: 0,
    failureCount: 0,
    lastFailure: null,
    consecutiveFailures: 0,
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local LLM)',
    isActive: true,
    successCount: 0,
    failureCount: 0,
    lastFailure: null,
    consecutiveFailures: 0,
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    isActive: false,
    successCount: 0,
    failureCount: 0,
    lastFailure: null,
    consecutiveFailures: 0,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT-4',
    isActive: false,
    successCount: 0,
    failureCount: 0,
    lastFailure: null,
    consecutiveFailures: 0,
  },
  claude: {
    id: 'claude',
    name: 'Anthropic Claude',
    isActive: false,
    successCount: 0,
    failureCount: 0,
    lastFailure: null,
    consecutiveFailures: 0,
  },
};

// Fallback order par défaut (local-first)
const DEFAULT_FALLBACK_ORDER: ProviderId[] = [
  'local',
  'tauri',
  'ollama',
  'gemini',
  'openai',
  'claude',
];

/**
 * Governance Connector v20.0Ω
 *
 * Responsabilités :
 * - Vérification de la configuration des providers
 * - Gestion de l'activation/désactivation
 * - Ordre de fallback
 * - Health checks
 */
export class GovernanceConnector {
  private config: GovernanceConfig;
  private initialized = false;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Charge la configuration depuis localStorage
   */
  private loadConfig(): GovernanceConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GovernanceConfig>;
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.error('[GovernanceConnector] Erreur chargement config:', error);
    }

    return this.getDefaultConfig();
  }

  /**
   * Fusionne une config partielle avec les valeurs par défaut
   */
  private mergeWithDefaults(partial: Partial<GovernanceConfig>): GovernanceConfig {
    const defaultConfig = this.getDefaultConfig();

    return {
      ...defaultConfig,
      ...partial,
      providers: {
        ...defaultConfig.providers,
        ...(partial.providers || {}),
      },
    };
  }

  /**
   * Retourne la configuration par défaut
   */
  private getDefaultConfig(): GovernanceConfig {
    const providers: Record<ProviderId, ProviderStatus> = {} as Record<
      ProviderId,
      ProviderStatus
    >;

    for (const [id, base] of Object.entries(DEFAULT_PROVIDERS)) {
      providers[id as ProviderId] = {
        ...base,
        isConfigured: id === 'local' || id === 'tauri', // Local et Tauri sont toujours configurés
        isHealthy: true,
        lastChecked: null,
      };
    }

    return {
      providers,
      defaultProvider: 'local',
      fallbackOrder: [...DEFAULT_FALLBACK_ORDER],
      autoFallback: true,
    };
  }

  /**
   * Sauvegarde la configuration
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (error) {
      console.error('[GovernanceConnector] Erreur sauvegarde config:', error);
    }
  }

  /**
   * Initialise le connector (vérifie l'état des providers)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Vérifier les clés API configurées via Tauri
    await this.checkProviderConfigurations();

    this.initialized = true;
  }

  /**
   * Vérifie les configurations de providers via le backend
   */
  private async checkProviderConfigurations(): Promise<void> {
    try {
      // Vérifier Gemini
      const geminiStatus = await secureInvoke<{
        is_configured: boolean;
        is_valid: boolean;
      }>('check_gemini_key');
      if (geminiStatus) {
        this.config.providers.gemini.isConfigured = geminiStatus.is_configured;
        this.config.providers.gemini.isHealthy = geminiStatus.is_valid;
      }
    } catch {
      // Gemini non configuré
      this.config.providers.gemini.isConfigured = false;
    }

    try {
      // Vérifier OpenAI
      const openaiStatus = await secureInvoke<{
        is_configured: boolean;
        is_valid: boolean;
      }>('check_openai_key');
      if (openaiStatus) {
        this.config.providers.openai.isConfigured = openaiStatus.is_configured;
        this.config.providers.openai.isHealthy = openaiStatus.is_valid;
      }
    } catch {
      this.config.providers.openai.isConfigured = false;
    }

    try {
      // Vérifier Anthropic/Claude
      const anthropicStatus = await secureInvoke<{
        is_configured: boolean;
        is_valid: boolean;
      }>('check_anthropic_key');
      if (anthropicStatus) {
        this.config.providers.claude.isConfigured = anthropicStatus.is_configured;
        this.config.providers.claude.isHealthy = anthropicStatus.is_valid;
      }
    } catch {
      this.config.providers.claude.isConfigured = false;
    }

    try {
      // Vérifier Ollama (local)
      const ollamaStatus = await secureInvoke<{ available: boolean }>(
        'ai_check_ollama_status'
      );
      if (ollamaStatus) {
        this.config.providers.ollama.isConfigured = ollamaStatus.available;
        this.config.providers.ollama.isHealthy = ollamaStatus.available;
      }
    } catch {
      this.config.providers.ollama.isConfigured = true; // Assume available
    }

    // Local et Tauri sont toujours configurés
    this.config.providers.local.isConfigured = true;
    this.config.providers.local.isHealthy = this.config.providers.local.isConfigured;
    this.config.providers.tauri.isConfigured = true;
    this.config.providers.tauri.isHealthy = this.config.providers.tauri.isConfigured;

    this.saveConfig();
  }

  /**
   * Retourne le statut d'un provider
   */
  getProviderStatus(id: ProviderId): ProviderStatus | null {
    return this.config.providers[id] || null;
  }

  /**
   * Retourne tous les providers
   */
  getAllProviders(): ProviderStatus[] {
    return Object.values(this.config.providers);
  }

  /**
   * Retourne les providers disponibles (configurés et actifs)
   */
  getAvailableProviders(): ProviderStatus[] {
    return Object.values(this.config.providers).filter(p => p.isConfigured && p.isActive);
  }

  /**
   * Active/désactive un provider
   */
  setProviderActive(id: ProviderId, active: boolean): boolean {
    const provider = this.config.providers[id];
    if (!provider) return false;

    // Ne pas désactiver le local (toujours actif comme fallback)
    if (id === 'local' && !active) {
      console.warn('[GovernanceConnector] Le provider local ne peut pas être désactivé');
      return false;
    }

    provider.isActive = active;
    this.saveConfig();
    return true;
  }

  /**
   * Définit le provider par défaut
   */
  setDefaultProvider(id: ProviderId): boolean {
    const provider = this.config.providers[id];
    if (!provider || !provider.isConfigured || !provider.isActive) {
      return false;
    }

    this.config.defaultProvider = id;
    this.saveConfig();
    return true;
  }

  /**
   * Retourne le provider par défaut
   */
  getDefaultProvider(): ProviderId {
    return this.config.defaultProvider;
  }

  /**
   * Retourne l'ordre de fallback
   */
  getFallbackOrder(): ProviderId[] {
    return this.config.fallbackOrder.filter(id => {
      const provider = this.config.providers[id];
      return provider && provider.isConfigured && provider.isActive;
    });
  }

  /**
   * Définit l'ordre de fallback
   */
  setFallbackOrder(order: ProviderId[]): void {
    this.config.fallbackOrder = order;
    this.saveConfig();
  }

  /**
   * v30.3.0: Fitness-scored provider selection with exponential recovery
   * Replaces linear fallback iteration with graduated fitness scoring:
   * fitness = success_rate(0.40) + availability(0.30) + recovery(0.30)
   */
  selectProvider(preferredId?: ProviderId): ProviderId {
    // Si un provider préféré est spécifié et disponible, l'utiliser
    if (preferredId) {
      const preferred = this.config.providers[preferredId];
      if (
        preferred &&
        preferred.isConfigured &&
        preferred.isActive &&
        preferred.isHealthy
      ) {
        return preferredId;
      }
    }

    // Compute fitness score for each available provider
    const scored: Array<{ id: ProviderId; fitness: number }> = [];

    for (const id of this.config.fallbackOrder) {
      const provider = this.config.providers[id];
      if (!provider || !provider.isConfigured || !provider.isActive) continue;

      // Factor 1: Success rate (0-1) — with Laplace smoothing for new providers
      const totalRequests = provider.successCount + provider.failureCount;
      const successRate =
        totalRequests > 0
          ? (provider.successCount + 1) / (totalRequests + 2) // Laplace smoothing
          : 0.5; // New provider gets neutral score

      // Factor 2: Availability — exponential recovery from unhealthy state
      let availabilityScore: number;
      if (provider.isHealthy) {
        availabilityScore = 1.0;
      } else if (provider.lastFailure) {
        // Exponential recovery: 50% at 30s, 75% at 60s, 90% at 120s, 95% at 180s
        const timeSinceFailure = Date.now() - provider.lastFailure;
        const recoveryHalfLife = 30000; // 30 seconds
        availabilityScore = 1 - Math.exp((-0.693 * timeSinceFailure) / recoveryHalfLife);
        // Penalty for consecutive failures: each consecutive failure doubles the recovery time
        const consecutivePenalty = Math.pow(0.8, provider.consecutiveFailures);
        availabilityScore *= consecutivePenalty;
      } else {
        availabilityScore = 0.3; // Unknown state
      }

      // Factor 3: Recency penalty for recent failures
      const recencyScore = provider.lastFailure
        ? Math.min(1.0, (Date.now() - provider.lastFailure) / 120000) // Full recovery after 2 min
        : 1.0;

      // Weighted fitness score
      const fitness = successRate * 0.4 + availabilityScore * 0.3 + recencyScore * 0.3;

      scored.push({ id, fitness });
    }

    // Sort by fitness descending
    scored.sort((a, b) => b.fitness - a.fitness);

    // Return best fitness provider, or default, or local
    const best = scored[0];
    if (best && best.fitness > 0.2) {
      return best.id;
    }

    // Absolute fallback
    return 'local';
  }

  /**
   * v30.3.0: Marks provider unhealthy with graduated reliability tracking
   * Tracks consecutive failures for exponential backoff in recovery
   */
  markProviderUnhealthy(id: ProviderId, error?: string): void {
    const provider = this.config.providers[id];
    if (provider) {
      provider.isHealthy = false;
      provider.lastChecked = Date.now();
      provider.error = error;
      provider.failureCount = (provider.failureCount || 0) + 1;
      provider.lastFailure = Date.now();
      provider.consecutiveFailures = (provider.consecutiveFailures || 0) + 1;
      this.saveConfig();
    }
  }

  /**
   * v30.3.0: Marks provider healthy and resets consecutive failure counter
   * Successful requests build up the success rate for fitness scoring
   */
  markProviderHealthy(id: ProviderId): void {
    const provider = this.config.providers[id];
    if (provider) {
      provider.lastChecked = Date.now();
      provider.error = undefined;
      provider.isHealthy = provider.isConfigured && provider.isActive;
      provider.successCount = (provider.successCount || 0) + 1;
      provider.consecutiveFailures = 0; // Reset consecutive on success
      this.saveConfig();
    }
  }

  /**
   * Vérifie si un provider peut être utilisé
   */
  canUseProvider(id: ProviderId): boolean {
    const provider = this.config.providers[id];
    return !!provider && provider.isConfigured && provider.isActive && provider.isHealthy;
  }

  /**
   * Active/désactive le fallback automatique
   */
  setAutoFallback(enabled: boolean): void {
    this.config.autoFallback = enabled;
    this.saveConfig();
  }

  /**
   * Retourne la configuration complète (pour debug/export)
   */
  getConfig(): GovernanceConfig {
    return { ...this.config };
  }

  /**
   * Réinitialise la configuration
   */
  resetConfig(): void {
    this.config = this.getDefaultConfig();
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  }
}

// Singleton
let governanceConnectorInstance: GovernanceConnector | null = null;

export function getGovernanceConnector(): GovernanceConnector {
  if (!governanceConnectorInstance) {
    governanceConnectorInstance = new GovernanceConnector();
  }
  return governanceConnectorInstance;
}

export default GovernanceConnector;
