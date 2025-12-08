/**
 * TITANE∞ v20Ω — Titane OS
 * Système d'exploitation cognitif unifié
 */

import type {
  OSStatus,
  OSConfig,
  OSDiagnostics,
  Engine,
  Plugin,
  LifecycleHook,
  LifecyclePhase,
} from './types';
import { DEFAULT_OS_CONFIG } from './types';

import { EventBus, getEventBus } from './bus/EventBus';
import { MessageBus, getMessageBus } from './bus/MessageBus';
import { EngineRegistry, getEngineRegistry } from './registry/EngineRegistry';
import { ServiceRegistry, getServiceRegistry } from './registry/ServiceRegistry';
import { TauriBridge, getTauriBridge } from './bridge/TauriBridge';
import { StateBridge, getStateBridge } from './bridge/StateBridge';
import { LifecycleManager, getLifecycleManager } from './lifecycle/LifecycleManager';
import { ConfigManager, getConfigManager } from './config/ConfigManager';

/**
 * Système d'exploitation TITANE∞
 */
export class TitaneOS {
  // Configuration
  private config: OSConfig;

  // Status
  private status: OSStatus = 'initializing';
  private startTime = 0;

  // Sous-systèmes
  readonly eventBus: EventBus;
  readonly messageBus: MessageBus;
  readonly engines: EngineRegistry;
  readonly services: ServiceRegistry;
  readonly tauriBridge: TauriBridge;
  readonly stateBridge: StateBridge;
  readonly lifecycle: LifecycleManager;
  readonly configManager: ConfigManager;

  // Plugins
  private plugins: Map<string, Plugin> = new Map();

  // Métriques
  private metricsIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<OSConfig> = {}) {
    this.config = { ...DEFAULT_OS_CONFIG, ...config };

    // Initialiser les sous-systèmes (singletons)
    this.eventBus = getEventBus();
    this.messageBus = getMessageBus();
    this.engines = getEngineRegistry();
    this.services = getServiceRegistry();
    this.tauriBridge = getTauriBridge();
    this.stateBridge = getStateBridge();
    this.lifecycle = getLifecycleManager();
    this.configManager = getConfigManager();

    // Enregistrer les hooks de cycle de vie par défaut
    this.registerDefaultHooks();
  }

  /**
   * Enregistre les hooks par défaut
   */
  private registerDefaultHooks(): void {
    // Pre-init: initialiser les ponts
    this.lifecycle.on('pre-init', async () => {
      await this.tauriBridge.init();
      await this.stateBridge.init();
      await this.configManager.init();
    });

    // Init: initialiser les moteurs
    this.lifecycle.on('init', async () => {
      await this.engines.initAll();
    });

    // Start: démarrer les moteurs et services
    this.lifecycle.on('start', async () => {
      await this.engines.startAll();
      this.services.startHealthChecks();

      if (this.config.metrics) {
        this.startMetricsCollection();
      }
    });

    // Stop: arrêter proprement
    this.lifecycle.on('stop', async () => {
      this.stopMetricsCollection();
      this.services.stopHealthChecks();
      await this.engines.stopAll();
    });

    // Gestion des erreurs
    this.lifecycle.onError((error, phase) => {
      this.log('error', `Lifecycle error in ${phase}:`, error);
      this.eventBus.emit('os:error', { error, phase }, 'TitaneOS');
    });
  }

  /**
   * Initialise l'OS
   */
  async init(): Promise<void> {
    this.log('info', 'Initializing TITANE∞ OS...');
    this.status = 'initializing';

    try {
      await this.lifecycle.init();
      this.status = 'ready';
      this.log('info', 'TITANE∞ OS initialized');
      this.eventBus.emit('os:ready', null, 'TitaneOS');
    } catch (error) {
      this.status = 'error';
      this.log('error', 'Failed to initialize OS:', error);
      throw error;
    }
  }

  /**
   * Démarre l'OS
   */
  async start(): Promise<void> {
    if (this.status !== 'ready' && this.status !== 'paused') {
      throw new Error(`Cannot start from status: ${this.status}`);
    }

    this.log('info', 'Starting TITANE∞ OS...');
    this.startTime = Date.now();

    try {
      await this.lifecycle.start();
      this.status = 'running';
      this.log('info', 'TITANE∞ OS started');
      this.eventBus.emit('os:started', { startTime: this.startTime }, 'TitaneOS');
    } catch (error) {
      this.status = 'error';
      this.log('error', 'Failed to start OS:', error);
      throw error;
    }
  }

  /**
   * Arrête l'OS
   */
  async stop(): Promise<void> {
    this.log('info', 'Stopping TITANE∞ OS...');

    try {
      await this.lifecycle.stop();
      this.status = 'shutdown';
      this.log('info', 'TITANE∞ OS stopped');
      this.eventBus.emit('os:stopped', { uptime: this.getUptime() }, 'TitaneOS');
    } catch (error) {
      this.status = 'error';
      this.log('error', 'Failed to stop OS:', error);
      throw error;
    }
  }

  /**
   * Met en pause l'OS
   */
  pause(): void {
    if (this.status !== 'running') {
      throw new Error(`Cannot pause from status: ${this.status}`);
    }

    this.status = 'paused';
    this.stopMetricsCollection();
    this.eventBus.emit('os:paused', null, 'TitaneOS');
  }

  /**
   * Reprend l'OS
   */
  resume(): void {
    if (this.status !== 'paused') {
      throw new Error(`Cannot resume from status: ${this.status}`);
    }

    this.status = 'running';
    if (this.config.metrics) {
      this.startMetricsCollection();
    }
    this.eventBus.emit('os:resumed', null, 'TitaneOS');
  }

  /**
   * Redémarre l'OS
   */
  async restart(): Promise<void> {
    this.log('info', 'Restarting TITANE∞ OS...');
    await this.stop();
    this.status = 'ready';
    await this.start();
    this.eventBus.emit('os:restarted', null, 'TitaneOS');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistre un moteur
   */
  registerEngine(engine: Engine): void {
    this.engines.register(engine);
    this.log('debug', `Registered engine: ${engine.metadata.id}`);
  }

  /**
   * Désenregistre un moteur
   */
  unregisterEngine(engineId: string): boolean {
    const result = this.engines.unregister(engineId);
    if (result) {
      this.log('debug', `Unregistered engine: ${engineId}`);
    }
    return result;
  }

  /**
   * Récupère un moteur
   */
  getEngine(engineId: string): Engine | undefined {
    return this.engines.get(engineId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVICE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistre un service
   */
  registerService<T>(id: string, name: string, instance: T): void {
    this.services.register(
      { id, name, version: this.config.version },
      instance
    );
    this.log('debug', `Registered service: ${id}`);
  }

  /**
   * Récupère un service
   */
  getService<T>(serviceId: string): T | undefined {
    return this.services.get<T>(serviceId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLUGIN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Installe un plugin
   */
  async installPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already installed`);
    }

    this.log('info', `Installing plugin: ${plugin.name} v${plugin.version}`);

    try {
      await plugin.install(this);
      this.plugins.set(plugin.id, plugin);
      this.eventBus.emit('plugin:installed', { plugin: plugin.id }, 'TitaneOS');
    } catch (error) {
      this.log('error', `Failed to install plugin ${plugin.id}:`, error);
      throw error;
    }
  }

  /**
   * Désinstalle un plugin
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    this.log('info', `Uninstalling plugin: ${pluginId}`);

    try {
      if (plugin.uninstall) {
        await plugin.uninstall(this);
      }
      this.plugins.delete(pluginId);
      this.eventBus.emit('plugin:uninstalled', { plugin: pluginId }, 'TitaneOS');
    } catch (error) {
      this.log('error', `Failed to uninstall plugin ${pluginId}:`, error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE HOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajoute un hook de cycle de vie
   */
  on(phase: LifecyclePhase, hook: LifecycleHook): () => void {
    return this.lifecycle.on(phase, hook);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Démarre la collecte de métriques
   */
  private startMetricsCollection(): void {
    if (this.metricsIntervalId) return;

    this.metricsIntervalId = setInterval(() => {
      const diagnostics = this.getDiagnostics();
      this.eventBus.emit('os:metrics', diagnostics, 'TitaneOS');
    }, this.config.metricsInterval);
  }

  /**
   * Arrête la collecte de métriques
   */
  private stopMetricsCollection(): void {
    if (this.metricsIntervalId) {
      clearInterval(this.metricsIntervalId);
      this.metricsIntervalId = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DIAGNOSTICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retourne les diagnostics système
   */
  getDiagnostics(): OSDiagnostics {
    const engineCounts = this.engines.countByStatus();
    const serviceCounts = this.services.countByStatus();
    const eventStats = this.eventBus.getStats();

    return {
      status: this.status,
      uptime: this.getUptime(),
      engines: {
        total: this.engines.size,
        running: engineCounts.running,
        errors: engineCounts.error,
      },
      services: {
        total: this.services.size,
        available: serviceCounts.available,
        degraded: serviceCounts.degraded,
      },
      events: {
        published: eventStats.published,
        handled: eventStats.handled,
        failed: eventStats.failed,
      },
      memory: {
        used: this.getMemoryUsage(),
        limit: 0, // Pas de limite définie
      },
    };
  }

  /**
   * Retourne l'uptime
   */
  getUptime(): number {
    return this.startTime > 0 ? Date.now() - this.startTime : 0;
  }

  /**
   * Retourne le statut
   */
  getStatus(): OSStatus {
    return this.status;
  }

  /**
   * Retourne l'utilisation mémoire estimée
   */
  private getMemoryUsage(): number {
    // @ts-expect-error Performance memory API
    if (typeof performance !== 'undefined' && performance.memory) {
      // @ts-expect-error Performance memory API
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Log un message
   */
  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    ...args: unknown[]
  ): void {
    if (!this.config.logging) return;

    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex < configLevelIndex) return;

    const prefix = `[TITANE∞ OS]`;
    const timestamp = new Date().toISOString();

    switch (level) {
      case 'debug':
        console.debug(`${timestamp} ${prefix}`, message, ...args);
        break;
      case 'info':
        console.info(`${timestamp} ${prefix}`, message, ...args);
        break;
      case 'warn':
        console.warn(`${timestamp} ${prefix}`, message, ...args);
        break;
      case 'error':
        console.error(`${timestamp} ${prefix}`, message, ...args);
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATIC INSTANCE
  // ═══════════════════════════════════════════════════════════════════════════

  private static instance: TitaneOS | null = null;

  /**
   * Retourne l'instance globale
   */
  static getInstance(config?: Partial<OSConfig>): TitaneOS {
    if (!TitaneOS.instance) {
      TitaneOS.instance = new TitaneOS(config);
    }
    return TitaneOS.instance;
  }

  /**
   * Réinitialise l'instance globale
   */
  static resetInstance(): void {
    TitaneOS.instance = null;
  }
}

export default TitaneOS;
