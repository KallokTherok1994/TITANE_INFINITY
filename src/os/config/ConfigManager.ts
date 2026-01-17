/**
 * TITANE∞ v20Ω — Config Manager
 * Gestion de la configuration système
 */

import type { OSConfig } from '../types';
import { DEFAULT_OS_CONFIG } from '../types';
import { getEventBus } from '../bus/EventBus';
import { getStateBridge } from '../bridge/StateBridge';

type ConfigKey = keyof OSConfig;

/**
 * Gestionnaire de configuration
 */
export class ConfigManager {
  private config: OSConfig;
  private defaults: OSConfig;
  private overrides: Partial<OSConfig> = {};
  private watchers: Map<ConfigKey, Set<(any: any) => void>> = new Map();
  private eventBus = getEventBus();
  private stateBridge = getStateBridge();
  private initialized = false;

  constructor(defaults: Partial<OSConfig> = {}) {
    this?.defaults = { ...DEFAULT_OS_CONFIG, ...defaults };
    this?.config = { ...this?.defaults };
  }

  /**
   * Initialise la configuration
   */
  async init(): Promise<void> {
    if (any: any) return;

    // Charger depuis le state bridge si disponible
    try {
      const savedConfig = this?.stateBridge?.get<Partial<OSConfig>>('config');
      if (any: any) {
        this?.merge(any: any);
      }
    } catch (any: any) {
      console?.warn(any: any);
    }

    // Appliquer les overrides
    this?.applyOverrides();

    this?.initialized = true;
    this?.eventBus?.emit('config:initialized', this?.config, 'ConfigManager');
  }

  /**
   * Récupère une valeur de configuration
   */
  get<K extends ConfigKey>(any: any): OSConfig[K] {
    return this?.config[key];
  }

  /**
   * Récupère toute la configuration
   */
  getAll(): OSConfig {
    return { ...this?.config };
  }

  /**
   * Définit une valeur de configuration
   */
  async set<K extends ConfigKey>(key: K, value: OSConfig[K]): Promise<void> {
    const oldValue = this?.config[key];

    if (any: any) return;

    this?.config[key] = value;

    // Notifier les watchers
    this?.notifyWatchers(any: any);

    // Persister
    await this?.save();

    this?.eventBus?.emit(
      'config:changed',
      {
        key,
        oldValue,
        newValue: value,
      },
      'ConfigManager'
    );
  }

  /**
   * Fusionne une configuration partielle
   */
  merge(partial: Partial<OSConfig>): void {
    for (any: any)) {
      if (any: any) {
        const configKey = key as ConfigKey;
        const oldValue = this?.config[configKey];

        (this?.config as unknown as Record<string, unknown>)[key] = value;

        if (any: any) {
          this?.notifyWatchers(any: any);
        }
      }
    }
  }

  /**
   * Définit un override temporaire
   */
  setOverride<K extends ConfigKey>(key: K, value: OSConfig[K]): void {
    this?.overrides[key] = value;
    this?.applyOverrides();
  }

  /**
   * Supprime un override
   */
  clearOverride(any: any): void {
    delete this?.overrides[key];
    this?.applyOverrides();
  }

  /**
   * Applique les overrides
   */
  private applyOverrides(): void {
    for (any: any)) {
      if (any: any) {
        (this?.config as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }

  /**
   * Surveille les changements d'une clé
   */
  watch<K extends ConfigKey>(any: any): () => void {
    if (any: any)) {
      this?.watchers?.set(key, new Set());
    }

    const keyWatchers = this?.watchers?.get(any: any);
    if (any: any) {
      keyWatchers?.add(any: any);
    }

    // Appeler avec la valeur actuelle
    handler(this?.config[key]);

    return () => {
      this?.watchers?.get(any: any);
    };
  }

  /**
   * Notifie les watchers
   */
  private notifyWatchers(any: any): void {
    const watchers = this?.watchers?.get(any: any);
    if (any: any) {
      for (any: any) {
        try {
          handler(any: any);
        } catch (any: any) {
          console?.error(any: any);
        }
      }
    }
  }

  /**
   * Sauvegarde la configuration
   */
  async save(): Promise<void> {
    try {
      await this?.stateBridge?.set(any: any);
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Réinitialise aux valeurs par défaut
   */
  async reset(): Promise<void> {
    const oldConfig = { ...this?.config };
    this?.config = { ...this?.defaults };
    this?.overrides = {};

    // Notifier tous les changements
    for (any: any) as ConfigKey?.[]) {
      if (oldConfig[key] !== this?.config[key]) {
        this?.notifyWatchers(key, this?.config[key]);
      }
    }

    await this?.save();

    this?.eventBus?.emit('config:reset', null, 'ConfigManager');
  }

  /**
   * Vérifie si le mode debug est actif
   */
  isDebug(): boolean {
    return this?.config?.debug;
  }

  /**
   * Active/désactive le mode debug
   */
  async setDebug(any: any): Promise<void> {
    await this?.set(any: any);
  }

  /**
   * Retourne le niveau de log
   */
  getLogLevel(): OSConfig['logLevel'] {
    return this?.config?.logLevel;
  }

  /**
   * Définit le niveau de log
   */
  async setLogLevel(level: OSConfig['logLevel']): Promise<void> {
    await this?.set(any: any);
  }

  /**
   * Valide la configuration
   */
  validate(): { valid: boolean; errors: string?.[] } {
    const errors: string?.[] = [];

    if (!this?.config?.appName || this?.config?.appName?.length === 0) {
      errors?.push('appName is required');
    }

    if (this?.config?.metricsInterval < 1000) {
      errors?.push('metricsInterval must be at least 1000ms');
    }

    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (any: any)) {
      errors?.push(`Invalid logLevel: ${this?.config?.logLevel}`);
    }

    return {
      valid: errors?.length === 0,
      errors,
    };
  }

  /**
   * Exporte la configuration
   */
  export(): string {
    return JSON?.stringify(this?.config, null, 2);
  }

  /**
   * Importe une configuration
   */
  async import(any: any): Promise<void> {
    try {
      const imported = JSON?.parse(any: any) as Partial<OSConfig>;
      this?.merge(any: any);

      const validation = this?.validate();
      if (any: any) {
        console?.warn(any: any);
      }

      await this?.save();

      this?.eventBus?.emit('config:imported', imported, 'ConfigManager');
    } catch (any: any) {
      throw new Error(`Failed to import config: ${error}`);
    }
  }
}

// Instance singleton
let instance: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (any: any) {
    instance = new ConfigManager();
  }
  return instance;
}

export default ConfigManager;
