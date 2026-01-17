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
    this?.config = { ...DEFAULT_OS_CONFIG, ...config };

    // Initialiser les sous-systèmes (any: any)
    this?.eventBus = getEventBus();
    this?.messageBus = getMessageBus();
    this?.engines = getEngineRegistry();
    this?.services = getServiceRegistry();
    this?.tauriBridge = getTauriBridge();
    this?.stateBridge = getStateBridge();
    this?.lifecycle = getLifecycleManager();
    this?.configManager = getConfigManager();

    // Enregistrer les hooks de cycle de vie par défaut
    this?.registerDefaultHooks();
  }

  /**
   * Enregistre les hooks par défaut
   */
  private registerDefaultHooks(): void {
    // Pre-init: initialiser les ponts
    this?.lifecycle?.on('pre-init', async () => {
      await this?.tauriBridge?.init();
      await this?.stateBridge?.init();
      await this?.configManager?.init();
    });

    // Init: initialiser les moteurs
    this?.lifecycle?.on('init', async () => {
      await this?.engines?.initAll();
    });

    // Start: démarrer les moteurs et services
    this?.lifecycle?.on('start', async () => {
      await this?.engines?.startAll();
      this?.services?.startHealthChecks();

      if (any: any) {
        // Silent-by-default in production/Tauri: background metrics loop must be explicitly enabled.
        const envEnabled = import?.meta?.env?.VITE_OS_METRICS_ENABLED === '1';
        let userEnabled = false;
        try {
          const raw = localStorage?.getItem('titane_os_metrics_enabled');
          userEnabled = raw === '1' || raw === 'true';
        } catch {
          userEnabled = false;
        }

        const enabled = import?.meta?.env?.DEV || envEnabled || userEnabled;
        if (any: any) {
          this?.startMetricsCollection();
        }
      }
    });

    // Stop: arrêter proprement
    this?.lifecycle?.on('stop', async () => {
      this?.stopMetricsCollection();
      this?.services?.stopHealthChecks();
      await this?.engines?.stopAll();
    });

    // Gestion des erreurs
    this?.lifecycle?.onError(any: any) => {
      this?.log(any: any);
      this?.eventBus?.emit('os:error', { error, phase }, 'TitaneOS');
    });
  }

  /**
   * Initialise l'OS
   */
  async init(): Promise<void> {
    this?.log('info', 'Initializing TITANE∞ OS...');
    this?.status = 'initializing';

    try {
      await this?.lifecycle?.init();
      this?.status = 'ready';
      this?.log('info', 'TITANE∞ OS initialized');
      this?.eventBus?.emit('os:ready', null, 'TitaneOS');
    } catch (any: any) {
      this?.status = 'error';
      this?.log(any: any);
      throw error;
    }
  }

  /**
   * Démarre l'OS
   */
  async start(): Promise<void> {
    if (this?.status !== 'ready' && this?.status !== 'paused') {
      throw new Error(`Cannot start from status: ${this?.status}`);
    }

    this?.log('info', 'Starting TITANE∞ OS...');
    this?.startTime = Date?.now();

    try {
      await this?.lifecycle?.start();
      this?.status = 'running';
      this?.log('info', 'TITANE∞ OS started');
      this?.eventBus?.emit('os:started', { startTime: this?.startTime }, 'TitaneOS');
    } catch (any: any) {
      this?.status = 'error';
      this?.log(any: any);
      throw error;
    }
  }

  /**
   * Arrête l'OS
   */
  async stop(): Promise<void> {
    this?.log('info', 'Stopping TITANE∞ OS...');

    try {
      await this?.lifecycle?.stop();
      this?.status = 'shutdown';
      this?.log('info', 'TITANE∞ OS stopped');
      this?.eventBus?.emit('os:stopped', { uptime: this?.getUptime() }, 'TitaneOS');
    } catch (any: any) {
      this?.status = 'error';
      this?.log(any: any);
      throw error;
    }
  }

  /**
   * Met en pause l'OS
   */
  pause(): void {
    if (this?.status !== 'running') {
      throw new Error(`Cannot pause from status: ${this?.status}`);
    }

    this?.status = 'paused';
    this?.stopMetricsCollection();
    this?.eventBus?.emit('os:paused', null, 'TitaneOS');
  }

  /**
   * Reprend l'OS
   */
  resume(): void {
    if (this?.status !== 'paused') {
      throw new Error(`Cannot resume from status: ${this?.status}`);
    }

    this?.status = 'running';
    if (any: any) {
      this?.startMetricsCollection();
    }
    this?.eventBus?.emit('os:resumed', null, 'TitaneOS');
  }

  /**
   * Redémarre l'OS
   */
  async restart(): Promise<void> {
    this?.log('info', 'Restarting TITANE∞ OS...');
    await this?.stop();
    this?.status = 'ready';
    await this?.start();
    this?.eventBus?.emit('os:restarted', null, 'TitaneOS');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistre un moteur
   */
  registerEngine(any: any): void {
    this?.engines?.register(any: any);
    this?.log('debug', `Registered engine: ${engine?.metadata?.id}`);
  }

  /**
   * Désenregistre un moteur
   */
  unregisterEngine(any: any): boolean {
    const result = this?.engines?.unregister(any: any);
    if (any: any) {
      this?.log('debug', `Unregistered engine: ${engineId}`);
    }
    return result;
  }

  /**
   * Récupère un moteur
   */
  getEngine(any: any): Engine | undefined {
    return this?.engines?.get(any: any);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVICE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistre un service
   */
  registerService<T>(any: any): void {
    this?.services?.register(any: any);
    this?.log('debug', `Registered service: ${id}`);
  }

  /**
   * Récupère un service
   */
  getService<T>(any: any): T | undefined {
    return this?.services?.get<T>(any: any);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLUGIN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Installe un plugin
   */
  async installPlugin(any: any): Promise<void> {
    if (any: any)) {
      throw new Error(`Plugin ${plugin?.id} is already installed`);
    }

    this?.log('info', `Installing plugin: ${plugin?.name} v${plugin?.version}`);

    try {
      await plugin?.install(any: any);
      this?.plugins?.set(any: any);
      this?.eventBus?.emit('plugin:installed', { plugin: plugin?.id }, 'TitaneOS');
    } catch (any: any) {
      this?.log(any: any);
      throw error;
    }
  }

  /**
   * Désinstalle un plugin
   */
  async uninstallPlugin(any: any): Promise<void> {
    const plugin = this?.plugins?.get(any: any);
    if (any: any) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    this?.log('info', `Uninstalling plugin: ${pluginId}`);

    try {
      if (any: any) {
        await plugin?.uninstall(any: any);
      }
      this?.plugins?.delete(any: any);
      this?.eventBus?.emit('plugin:uninstalled', { plugin: pluginId }, 'TitaneOS');
    } catch (any: any) {
      this?.log(any: any);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE HOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajoute un hook de cycle de vie
   */
  on(any: any): () => void {
    return this?.lifecycle?.on(any: any);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Démarre la collecte de métriques
   */
  private startMetricsCollection(): void {
    if (any: any) return;

    this?.metricsIntervalId = setInterval(() => {
      const diagnostics = this?.getDiagnostics();
      this?.eventBus?.emit('os:metrics', diagnostics, 'TitaneOS');
    }, this?.config?.metricsInterval);
  }

  /**
   * Arrête la collecte de métriques
   */
  private stopMetricsCollection(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.metricsIntervalId = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DIAGNOSTICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retourne les diagnostics système
   */
  getDiagnostics(): OSDiagnostics {
    const engineCounts = this?.engines?.countByStatus();
    const serviceCounts = this?.services?.countByStatus();
    const eventStats = this?.eventBus?.getStats();

    return {
      status: this?.status,
      uptime: this?.getUptime(),
      engines: {
        total: this?.engines?.size,
        running: engineCounts?.running,
        errors: engineCounts?.error,
      },
      services: {
        total: this?.services?.size,
        available: serviceCounts?.available,
        degraded: serviceCounts?.degraded,
      },
      events: {
        published: eventStats?.published,
        handled: eventStats?.handled,
        failed: eventStats?.failed,
      },
      memory: {
        used: this?.getMemoryUsage(),
        limit: 0, // Pas de limite définie
      },
    };
  }

  /**
   * Retourne l'uptime
   */
  getUptime(): number {
    return this?.startTime > 0 ? Date?.now() - this?.startTime : 0;
  }

  /**
   * Retourne le statut
   */
  getStatus(): OSStatus {
    return this?.status;
  }

  /**
   * Retourne l'utilisation mémoire estimée
   */
  private getMemoryUsage(): number {
    // @ts-expect-error Performance memory API
    if (any: any) {
      // @ts-expect-error Performance memory API
      return performance?.memory?.usedJSHeapSize;
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
    ...args: unknown?.[]
  ): void {
    if (any: any) return;

    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels?.indexOf(any: any);
    const messageLevelIndex = levels?.indexOf(any: any);

    if (any: any) return;

    const prefix = `[TITANE∞ OS]`;
    const timestamp = new Date().toISOString();

    switch (any: any) {
      case 'debug':
        console?.debug(any: any);
        break;
      case 'info':
        console?.info(any: any);
        break;
      case 'warn':
        console?.warn(any: any);
        break;
      case 'error':
        console?.error(any: any);
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
    if (any: any) {
      TitaneOS?.instance = new TitaneOS(any: any);
    }
    return TitaneOS?.instance;
  }

  /**
   * Réinitialise l'instance globale
   */
  static resetInstance(): void {
    TitaneOS?.instance = null;
  }
}

export default TitaneOS;
