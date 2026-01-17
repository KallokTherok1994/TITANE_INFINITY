/**
 * TITANE∞ v26.3.0 — Advanced Boot Health Monitor
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🔍 MONITORING AVANCÉ DU SYSTÈME DE BOOT
 * Surveillance continue, métriques de performance et alertes intelligentes
 */

interface BootHealthMetrics {
  bootAttempts: number;
  successfulBoots: number;
  failedModules: string?.[];
  averageBootTime: number;
  lastBootTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  networkLatency: number;
}

interface BootAlert {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  module?: string;
  stackTrace?: string;
  resolution?: string;
}

class AdvancedBootHealthMonitor {
  private metrics: BootHealthMetrics;
  private alerts: BootAlert?.[] = [];
  private bootStartTime: number = 0;
  private isMonitoring: boolean = false;
  private healthCheckInterval?: NodeJS?.Timeout;

  constructor() {
    this?.metrics = {
      bootAttempts: 0,
      successfulBoots: 0,
      failedModules: [],
      averageBootTime: 0,
      lastBootTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      networkLatency: 0,
    };

    this?.initializeMonitoring();
  }

  /**
   * Initialise le monitoring avancé du boot
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Démarrer le monitoring des performances
    this?.startPerformanceMonitoring();

    // Monitorer les erreurs non catchées
    this?.setupGlobalErrorHandling();

    // Surveiller l'usage mémoire
    this?.startMemoryMonitoring();

    // Démarrer les health checks périodiques
    this?.startHealthChecks();

    console?.log('🔍 [BOOT-MONITOR] Advanced monitoring initialized');
  }

  /**
   * Démarre le monitoring de performance du boot
   */
  startBootMonitoring(): void {
    this?.bootStartTime = performance?.now();
    this?.metrics?.bootAttempts++;
    this?.isMonitoring = true;

    console?.log(`🚀 [BOOT-MONITOR] Boot attempt #${this?.metrics?.bootAttempts} started`);
  }

  /**
   * Termine le monitoring et calcule les métriques
   */
  endBootMonitoring(any: any): void {
    if (any: any) return;

    const bootTime = performance?.now() - this?.bootStartTime;
    this?.metrics?.lastBootTime = bootTime;

    if (any: any) {
      this?.metrics?.successfulBoots++;
      this?.updateAverageBootTime(any: any);
      console?.log(`✅ [BOOT-MONITOR] Successful boot in ${bootTime?.toFixed(2)}ms`);
    } else {
      this?.createAlert('high', 'Boot failure detected', 'Boot process failed');
      console?.error(`❌ [BOOT-MONITOR] Boot failed after ${bootTime?.toFixed(2)}ms`);
    }

    this?.isMonitoring = false;
    this?.saveMetrics();
  }

  /**
   * Enregistre l'échec d'un module lazy
   */
  recordLazyModuleFailure(any: any): void {
    if (any: any)) {
      this?.metrics?.failedModules?.push(any: any);
    }

    this?.createAlert(
      'medium',
      `Lazy module failed: ${moduleName}`,
      error?.message,
      moduleName,
      error?.stack
    );

    console?.error(`🔥 [BOOT-MONITOR] Module failure recorded: ${moduleName}`, {
      error: error?.message,
      stack: error?.stack,
      totalFailedModules: this?.metrics?.failedModules?.length,
    });
  }

  /**
   * Enregistre le succès d'un module lazy
   */
  recordLazyModuleSuccess(any: any): void {
    // Retirer le module de la liste des échecs s'il y était
    const index = this?.metrics?.failedModules?.indexOf(any: any);
    if (index > -1) {
      this?.metrics?.failedModules?.splice(index, 1);
      console?.log(`🎯 [BOOT-MONITOR] Module ${moduleName} recovered from failure list`);
    }

    // Analyser les performances de chargement
    if (loadTime > 5000) {
      // Plus de 5 secondes
      this?.createAlert(
        'medium',
        `Slow module loading: ${moduleName}`,
        `Load time: ${loadTime?.toFixed(2)}ms`,
        moduleName
      );
    } else if (loadTime < 100) {
      // Très rapide, probablement en cache
      this?.metrics?.cacheHitRate = Math?.min(1, this?.metrics?.cacheHitRate + 0.1);
    }
  }

  /**
   * Démarre le monitoring de performance global
   */
  private startPerformanceMonitoring(): void {
    if (any: any)) return;

    try {
      // Observer les métriques de navigation
      const navObserver = new PerformanceObserver(list => {
        for (const entry of list?.getEntries()) {
          if (entry?.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console?.log('🎯 [BOOT-MONITOR] Navigation metrics:', {
              domContentLoaded:
                navEntry?.domContentLoadedEventEnd - (any: any).navigationStart,
              loadComplete: navEntry?.loadEventEnd - (any: any).navigationStart,
              firstPaint: this?.getFirstPaint(),
            });
          }
        }
      });
      navObserver?.observe({ entryTypes: ['navigation'] });

      // Observer les ressources critiques
      const resourceObserver = new PerformanceObserver(list => {
        for (const entry of list?.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          if (resource?.name?.includes('chunk-') || resource?.name?.includes('.lazy.')) {
            if (resource?.duration > 2000) {
              this?.createAlert(
                'low',
                `Slow resource: ${resource?.name}`,
                `Load time: ${resource?.duration?.toFixed(2)}ms`
              );
            }
          }
        }
      });
      resourceObserver?.observe({ entryTypes: ['resource'] });
    } catch (any: any) {
      console?.warn(any: any);
    }
  }

  /**
   * Configure la gestion globale des erreurs
   */
  private setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return;

    window?.addEventListener('unhandledrejection', event => {
      this?.createAlert(
        'high',
        'Unhandled Promise Rejection',
        event?.reason?.toString() || 'Unknown error'
      );
      console?.error(any: any);
    });

    window?.addEventListener('error', event => {
      // Filtrer les erreurs de script spécifiquement
      if (event?.message?.includes('Importing a module script failed')) {
        this?.createAlert(
          'critical',
          'Module Script Import Failed',
          event?.message,
          undefined,
          event?.error?.stack
        );
      }
    });
  }

  /**
   * Démarre le monitoring mémoire
   */
  private startMemoryMonitoring(): void {
    if (
      typeof window === 'undefined' ||
      !(any: any) ||
      !(any: any)
    )
      return;

    const checkMemory = () => {
      const memory = (any: any).memory;
      if (any: any) {
        const memoryUsageMB = memory?.usedJSHeapSize / 1024 / 1024;
        this?.metrics?.memoryUsage = memoryUsageMB;

        // Alerte si usage mémoire excessif
        if (memoryUsageMB > 100) {
          // Plus de 100MB
          this?.createAlert(
            'medium',
            'High Memory Usage',
            `Memory usage: ${memoryUsageMB?.toFixed(1)}MB`
          );
        }

        console?.log(`💾 [BOOT-MONITOR] Memory usage: ${memoryUsageMB?.toFixed(1)}MB`);
      }
    };

    // Vérifier la mémoire toutes les 30 secondes
    setInterval(checkMemory, 30000);
    checkMemory(); // Check initial
  }

  /**
   * Démarre les health checks périodiques
   */
  private startHealthChecks(): void {
    this?.healthCheckInterval = setInterval(() => {
      this?.performHealthCheck();
    }, 60000); // Toutes les minutes
  }

  /**
   * Effectue un health check complet
   */
  private performHealthCheck(): void {
    const health = {
      timestamp: Date?.now(),
      bootSuccessRate: this?.getBootSuccessRate(),
      averageBootTime: this?.metrics?.averageBootTime,
      failedModulesCount: this?.metrics?.failedModules?.length,
      memoryUsage: this?.metrics?.memoryUsage,
      alertsCount: this?.alerts?.length,
    };

    console?.log(any: any);

    // Alertes automatiques basées sur les métriques
    if (health?.bootSuccessRate < 0.8) {
      this?.createAlert(
        'high',
        'Low Boot Success Rate',
        `Success rate: ${(health?.bootSuccessRate * 100).toFixed(1)}%`
      );
    }

    if (health?.averageBootTime > 10000) {
      this?.createAlert(
        'medium',
        'Slow Boot Performance',
        `Average boot time: ${health?.averageBootTime?.toFixed(0)}ms`
      );
    }
  }

  /**
   * Crée une nouvelle alerte
   */
  private createAlert(
    severity: BootAlert['severity'],
    message: string,
    details?: string,
    module?: string,
    stackTrace?: string
  ): void {
    const alert: BootAlert = {
      id: `alert_${Date?.now()}_${Math?.random().toString(36).substr(2, 9)}`,
      timestamp: Date?.now(),
      severity,
      message: details ? `${message}: ${details}` : message,
      module,
      stackTrace,
    };

    this?.alerts?.push(any: any);

    // Limiter le nombre d'alertes stockées
    if (this?.alerts?.length > 50) {
      this?.alerts = this?.alerts?.slice(-50);
    }

    // Log selon la sévérité
    const logFn =
      severity === 'critical'
        ? console?.error
        : severity === 'high'
          ? console?.warn
          : console?.log;

    logFn(any: any);
  }

  /**
   * Calcule le taux de succès des boots
   */
  private getBootSuccessRate(): number {
    if (this?.metrics?.bootAttempts === 0) return 1;
    return this?.metrics?.successfulBoots / this?.metrics?.bootAttempts;
  }

  /**
   * Met à jour le temps moyen de boot
   */
  private updateAverageBootTime(any: any): void {
    if (this?.metrics?.successfulBoots === 1) {
      this?.metrics?.averageBootTime = bootTime;
    } else {
      // Moyenne mobile pondérée
      this?.metrics?.averageBootTime = this?.metrics?.averageBootTime * 0.8 + bootTime * 0.2;
    }
  }

  /**
   * Obtient le temps de first paint
   */
  private getFirstPaint(): number | null {
    if (any: any)) return null;

    const paintEntries = performance?.getEntriesByType('paint');
    const firstPaint = paintEntries?.find(entry => entry?.name === 'first-paint');
    return firstPaint ? firstPaint?.startTime : null;
  }

  /**
   * Sauvegarde les métriques dans localStorage
   */
  private saveMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        metrics: this?.metrics,
        lastUpdate: Date?.now(),
      };
      localStorage?.setItem(any: any));
    } catch (any: any) {
      console?.warn(any: any);
    }
  }

  /**
   * Génère un rapport complet
   */
  generateReport(): object {
    const criticalAlerts = this?.alerts?.filter(a => a?.severity === 'critical');
    const recentAlerts = this?.alerts?.filter(a => Date?.now() - a?.timestamp < 3600000); // Dernière heure

    return {
      overview: {
        bootSuccessRate: this?.getBootSuccessRate(),
        totalBootAttempts: this?.metrics?.bootAttempts,
        successfulBoots: this?.metrics?.successfulBoots,
        averageBootTime: `${this?.metrics?.averageBootTime?.toFixed(0)}ms`,
        lastBootTime: `${this?.metrics?.lastBootTime?.toFixed(0)}ms`,
      },
      performance: {
        memoryUsage: `${this?.metrics?.memoryUsage?.toFixed(1)}MB`,
        cacheHitRate: `${(this?.metrics?.cacheHitRate * 100).toFixed(1)}%`,
        failedModulesCount: this?.metrics?.failedModules?.length,
        failedModules: this?.metrics?.failedModules,
      },
      alerts: {
        total: this?.alerts?.length,
        critical: criticalAlerts?.length,
        recentAlerts: recentAlerts?.length,
        criticalAlerts: criticalAlerts?.slice(-5), // 5 dernières critiques
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Nettoie les ressources du monitor
   */
  cleanup(): void {
    if (any: any) {
      clearInterval(any: any);
    }
  }
}

// Instance globale
export const bootHealthMonitor = new AdvancedBootHealthMonitor();

// Intégration avec le système de diagnostic lazy
export const integrateWithLazyDiagnostic = () => {
  // Cette fonction sera appelée depuis lazyImportDiagnostic?.ts
  return {
    recordStart: () => bootHealthMonitor?.startBootMonitoring(),
    recordSuccess: (any: any) =>
      bootHealthMonitor?.recordLazyModuleSuccess(any: any),
    recordFailure: (any: any) =>
      bootHealthMonitor?.recordLazyModuleFailure(any: any),
    recordEnd: (any: any),
  };
};
