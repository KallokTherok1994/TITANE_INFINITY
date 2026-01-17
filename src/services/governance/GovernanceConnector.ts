/**
 * TITANE∞ v20.0Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0Ω — Governance Connector
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
  },
  tauri: {
    id: 'tauri',
    name: 'Tauri Backend',
    isActive: true,
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local LLM)',
    isActive: true,
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    isActive: false,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT-4',
    isActive: false,
  },
  claude: {
    id: 'claude',
    name: 'Anthropic Claude',
    isActive: false,
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
        'check_ollama_status'
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
    this.config.providers.local.isHealthy = true;
    this.config.providers.tauri.isConfigured = true;
    this.config.providers.tauri.isHealthy = true;

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
   * Sélectionne le meilleur provider disponible
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

    // Sinon, utiliser le provider par défaut s'il est disponible
    const defaultProvider = this.config.providers[this.config.defaultProvider];
    if (
      defaultProvider &&
      defaultProvider.isConfigured &&
      defaultProvider.isActive &&
      defaultProvider.isHealthy
    ) {
      return this.config.defaultProvider;
    }

    // Sinon, parcourir l'ordre de fallback
    for (const id of this.config.fallbackOrder) {
      const provider = this.config.providers[id];
      if (provider && provider.isConfigured && provider.isActive && provider.isHealthy) {
        return id;
      }
    }

    // Toujours retourner local comme dernier recours
    return 'local';
  }

  /**
   * Marque un provider comme défaillant (pour le circuit breaker)
   */
  markProviderUnhealthy(id: ProviderId, error?: string): void {
    const provider = this.config.providers[id];
    if (provider) {
      provider.isHealthy = false;
      provider.lastChecked = Date.now();
      provider.error = error;
      this.saveConfig();
    }
  }

  /**
   * Marque un provider comme sain
   */
  markProviderHealthy(id: ProviderId): void {
    const provider = this.config.providers[id];
    if (provider) {
      provider.isHealthy = true;
      provider.lastChecked = Date.now();
      provider.error = undefined;
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
