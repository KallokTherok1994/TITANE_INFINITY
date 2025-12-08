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
  private watchers: Map<ConfigKey, Set<(value: unknown) => void>> = new Map();
  private eventBus = getEventBus();
  private stateBridge = getStateBridge();
  private initialized = false;

  constructor(defaults: Partial<OSConfig> = {}) {
    this.defaults = { ...DEFAULT_OS_CONFIG, ...defaults };
    this.config = { ...this.defaults };
  }

  /**
   * Initialise la configuration
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Charger depuis le state bridge si disponible
    try {
      const savedConfig = this.stateBridge.get<Partial<OSConfig>>('config');
      if (savedConfig) {
        this.merge(savedConfig);
      }
    } catch (error) {
      console.warn('[ConfigManager] Failed to load saved config:', error);
    }

    // Appliquer les overrides
    this.applyOverrides();

    this.initialized = true;
    this.eventBus.emit('config:initialized', this.config, 'ConfigManager');
  }

  /**
   * Récupère une valeur de configuration
   */
  get<K extends ConfigKey>(key: K): OSConfig[K] {
    return this.config[key];
  }

  /**
   * Récupère toute la configuration
   */
  getAll(): OSConfig {
    return { ...this.config };
  }

  /**
   * Définit une valeur de configuration
   */
  async set<K extends ConfigKey>(key: K, value: OSConfig[K]): Promise<void> {
    const oldValue = this.config[key];

    if (oldValue === value) return;

    this.config[key] = value;

    // Notifier les watchers
    this.notifyWatchers(key, value);

    // Persister
    await this.save();

    this.eventBus.emit('config:changed', {
      key,
      oldValue,
      newValue: value,
    }, 'ConfigManager');
  }

  /**
   * Fusionne une configuration partielle
   */
  merge(partial: Partial<OSConfig>): void {
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined) {
        const configKey = key as ConfigKey;
        const oldValue = this.config[configKey];

        (this.config as Record<string, unknown>)[key] = value;

        if (oldValue !== value) {
          this.notifyWatchers(configKey, value);
        }
      }
    }
  }

  /**
   * Définit un override temporaire
   */
  setOverride<K extends ConfigKey>(key: K, value: OSConfig[K]): void {
    this.overrides[key] = value;
    this.applyOverrides();
  }

  /**
   * Supprime un override
   */
  clearOverride(key: ConfigKey): void {
    delete this.overrides[key];
    this.applyOverrides();
  }

  /**
   * Applique les overrides
   */
  private applyOverrides(): void {
    for (const [key, value] of Object.entries(this.overrides)) {
      if (value !== undefined) {
        (this.config as Record<string, unknown>)[key] = value;
      }
    }
  }

  /**
   * Surveille les changements d'une clé
   */
  watch<K extends ConfigKey>(
    key: K,
    handler: (value: OSConfig[K]) => void
  ): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }

    this.watchers.get(key)!.add(handler as (value: unknown) => void);

    // Appeler avec la valeur actuelle
    handler(this.config[key]);

    return () => {
      this.watchers.get(key)?.delete(handler as (value: unknown) => void);
    };
  }

  /**
   * Notifie les watchers
   */
  private notifyWatchers(key: ConfigKey, value: unknown): void {
    const watchers = this.watchers.get(key);
    if (watchers) {
      for (const handler of watchers) {
        try {
          handler(value);
        } catch (error) {
          console.error(`[ConfigManager] Watcher error for ${key}:`, error);
        }
      }
    }
  }

  /**
   * Sauvegarde la configuration
   */
  async save(): Promise<void> {
    try {
      await this.stateBridge.set('config', this.config);
    } catch (error) {
      console.error('[ConfigManager] Failed to save config:', error);
    }
  }

  /**
   * Réinitialise aux valeurs par défaut
   */
  async reset(): Promise<void> {
    const oldConfig = { ...this.config };
    this.config = { ...this.defaults };
    this.overrides = {};

    // Notifier tous les changements
    for (const key of Object.keys(this.defaults) as ConfigKey[]) {
      if (oldConfig[key] !== this.config[key]) {
        this.notifyWatchers(key, this.config[key]);
      }
    }

    await this.save();

    this.eventBus.emit('config:reset', null, 'ConfigManager');
  }

  /**
   * Vérifie si le mode debug est actif
   */
  isDebug(): boolean {
    return this.config.debug;
  }

  /**
   * Active/désactive le mode debug
   */
  async setDebug(enabled: boolean): Promise<void> {
    await this.set('debug', enabled);
  }

  /**
   * Retourne le niveau de log
   */
  getLogLevel(): OSConfig['logLevel'] {
    return this.config.logLevel;
  }

  /**
   * Définit le niveau de log
   */
  async setLogLevel(level: OSConfig['logLevel']): Promise<void> {
    await this.set('logLevel', level);
  }

  /**
   * Valide la configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.appName || this.config.appName.length === 0) {
      errors.push('appName is required');
    }

    if (this.config.metricsInterval < 1000) {
      errors.push('metricsInterval must be at least 1000ms');
    }

    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(this.config.logLevel)) {
      errors.push(`Invalid logLevel: ${this.config.logLevel}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Exporte la configuration
   */
  export(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Importe une configuration
   */
  async import(json: string): Promise<void> {
    try {
      const imported = JSON.parse(json) as Partial<OSConfig>;
      this.merge(imported);

      const validation = this.validate();
      if (!validation.valid) {
        console.warn('[ConfigManager] Imported config has errors:', validation.errors);
      }

      await this.save();

      this.eventBus.emit('config:imported', imported, 'ConfigManager');
    } catch (error) {
      throw new Error(`Failed to import config: ${error}`);
    }
  }
}

// Instance singleton
let instance: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!instance) {
    instance = new ConfigManager();
  }
  return instance;
}

export default ConfigManager;
