/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Metrics Alert System
 * Détection seuils critiques + toast notifications
 * ═══════════════════════════════════════════════════════════════
 */

import { ServiceMetrics } from './serviceMetrics';
import { useUIStore } from '../stores/uiStore';

export interface AlertThresholds {
  errorRate: number; // 0-1, ex: 0.10 pour 10%
  avgLatency: number; // ms, ex: 5000 pour 5s
  retryRate: number; // 0-1, ex: 0.50 pour 50%
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  errorRate: 0.1, // 10%
  avgLatency: 5000, // 5s
  retryRate: 0.5, // 50%
};

export interface AlertEvent {
  type: 'error_rate' | 'latency' | 'retry_rate';
  severity: 'warning' | 'critical';
  service: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

/**
 * Vérifier seuils pour un service
 */
export function checkServiceAlerts(
  service: string,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): AlertEvent[] {
  const alerts: AlertEvent[] = [];

  try {
    const stats = ServiceMetrics.getServiceStats(service);

    // Error Rate
    if (stats.errorRate >= thresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        severity: stats.errorRate >= thresholds.errorRate * 2 ? 'critical' : 'warning',
        service,
        value: stats.errorRate,
        threshold: thresholds.errorRate,
        message: `Taux d'erreurs élevé: ${(stats.errorRate * 100).toFixed(1)}% (seuil: ${(thresholds.errorRate * 100).toFixed(0)}%)`,
        timestamp: Date.now(),
      });
    }

    // Average Latency
    if (stats.averageLatency >= thresholds.avgLatency) {
      alerts.push({
        type: 'latency',
        severity:
          stats.averageLatency >= thresholds.avgLatency * 2 ? 'critical' : 'warning',
        service,
        value: stats.averageLatency,
        threshold: thresholds.avgLatency,
        message: `Latence élevée: ${stats.averageLatency}ms (seuil: ${thresholds.avgLatency}ms)`,
        timestamp: Date.now(),
      });
    }

    // Retry Rate
    const retryRate = stats.totalCalls > 0 ? stats.totalRetries / stats.totalCalls : 0;
    if (retryRate >= thresholds.retryRate) {
      alerts.push({
        type: 'retry_rate',
        severity: retryRate >= thresholds.retryRate * 1.5 ? 'critical' : 'warning',
        service,
        value: retryRate,
        threshold: thresholds.retryRate,
        message: `Taux de retry élevé: ${(retryRate * 100).toFixed(1)}% (seuil: ${(thresholds.retryRate * 100).toFixed(0)}%)`,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error(`Erreur vérification alertes ${service}:`, error);
  }

  return alerts;
}

/**
 * Vérifier seuils globaux
 */
export function checkGlobalAlerts(
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): AlertEvent[] {
  const alerts: AlertEvent[] = [];

  try {
    const globalStats = ServiceMetrics.getGlobalStats();

    // Global Error Rate
    if (globalStats.globalErrorRate >= thresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        severity:
          globalStats.globalErrorRate >= thresholds.errorRate * 2
            ? 'critical'
            : 'warning',
        service: 'global',
        value: globalStats.globalErrorRate,
        threshold: thresholds.errorRate,
        message: `Taux d'erreurs global élevé: ${(globalStats.globalErrorRate * 100).toFixed(1)}%`,
        timestamp: Date.now(),
      });
    }

    // Global Avg Latency
    if (globalStats.globalAvgLatency >= thresholds.avgLatency) {
      alerts.push({
        type: 'latency',
        severity:
          globalStats.globalAvgLatency >= thresholds.avgLatency * 2
            ? 'critical'
            : 'warning',
        service: 'global',
        value: globalStats.globalAvgLatency,
        threshold: thresholds.avgLatency,
        message: `Latence globale élevée: ${globalStats.globalAvgLatency}ms`,
        timestamp: Date.now(),
      });
    }

    // Global Retry Rate
    const globalRetryRate =
      globalStats.totalMetrics > 0
        ? globalStats.totalRetries / globalStats.totalMetrics
        : 0;
    if (globalRetryRate >= thresholds.retryRate) {
      alerts.push({
        type: 'retry_rate',
        severity: globalRetryRate >= thresholds.retryRate * 1.5 ? 'critical' : 'warning',
        service: 'global',
        value: globalRetryRate,
        threshold: thresholds.retryRate,
        message: `Taux de retry global élevé: ${(globalRetryRate * 100).toFixed(1)}%`,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Erreur vérification alertes globales:', error);
  }

  return alerts;
}

/**
 * Afficher toast pour alerte
 */
export function showAlert(alert: AlertEvent): void {
  const { addToast } = useUIStore.getState();

  addToast({
    type: alert.severity === 'critical' ? 'error' : 'warning',
    message: `${alert.service.toUpperCase()}: ${alert.message}`,
    duration: alert.severity === 'critical' ? 10000 : 5000,
  });
}

/**
 * Moniteur automatique avec vérification périodique
 */
export class AlertMonitor {
  private static instance: AlertMonitor | null = null;
  private intervalId: number | null = null;
  private lastAlerts: Map<string, number> = new Map();
  private cooldownMs = 60000; // 1 minute entre alertes identiques

  private constructor() {}

  static getInstance(): AlertMonitor {
    if (!AlertMonitor.instance) {
      AlertMonitor.instance = new AlertMonitor();
    }
    return AlertMonitor.instance;
  }

  /**
   * Démarrer monitoring
   */
  start(checkIntervalMs = 10000, thresholds: AlertThresholds = DEFAULT_THRESHOLDS): void {
    if (this.intervalId) {
      console.warn('Alert monitor déjà démarré');
      return;
    }

    console.log('Démarrage alert monitor:', { checkIntervalMs, thresholds });

    this.intervalId = window.setInterval(() => {
      this.checkAllServices(thresholds);
    }, checkIntervalMs);
  }

  /**
   * Arrêter monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Alert monitor arrêté');
    }
  }

  /**
   * Vérifier tous les services
   */
  private checkAllServices(thresholds: AlertThresholds): void {
    const now = Date.now();

    // Alertes globales
    const globalAlerts = checkGlobalAlerts(thresholds);
    for (const alert of globalAlerts) {
      this.processAlert(alert, now);
    }

    // Alertes par service
    const services: Array<
      'memory' | 'chat' | 'voice' | 'persona' | 'system' | 'evolution'
    > = ['memory', 'chat', 'voice', 'persona', 'system', 'evolution'];

    for (const service of services) {
      const alerts = checkServiceAlerts(service, thresholds);
      for (const alert of alerts) {
        this.processAlert(alert, now);
      }
    }
  }

  /**
   * Traiter alerte avec cooldown
   */
  private processAlert(alert: AlertEvent, now: number): void {
    const key = `${alert.service}-${alert.type}`;
    const lastTime = this.lastAlerts.get(key) || 0;

    // Cooldown
    if (now - lastTime < this.cooldownMs) {
      return;
    }

    // Afficher toast
    showAlert(alert);

    // Enregistrer timestamp
    this.lastAlerts.set(key, now);
  }

  /**
   * Clear cooldowns
   */
  clearCooldowns(): void {
    this.lastAlerts.clear();
  }
}

export default AlertMonitor;
