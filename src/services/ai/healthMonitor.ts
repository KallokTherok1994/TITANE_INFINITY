/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20Ω+ — AI HEALTH MONITOR
 *   Surveillance continue de la santé du sous-système IA
 *   Auto-reporting, alertes, recommandations
 * ═══════════════════════════════════════════════════════════════════
 */

import { metricsEngine, autoHealEngine } from './system';
import { aiOrchestrator } from './orchestrator';
import { createLogger } from '@/utils/logger';

const logger = createLogger('HealthMonitor');

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface HealthAlert {
  id: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  component: 'orchestrator' | 'provider' | 'metrics' | 'autoheal';
  title: string;
  description: string;
  recommendations: string?.[];
  autoFixAvailable: boolean;
}

export interface HealthReport {
  timestamp: number;
  overall: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  alerts: HealthAlert?.[];
  providers: {
    name: string;
    status: 'healthy' | 'degraded' | 'critical' | 'offline';
    successRate: number;
    avgLatency: number;
  }[];
  recommendations: string?.[];
  uptime: number;
}

// ─────────────────────────────────────────────────────────────────
// HEALTH MONITOR CLASS
// ─────────────────────────────────────────────────────────────────

class AIHealthMonitor {
  private alerts: HealthAlert?.[] = [];
  private readonly MAX_ALERTS = 50;
  private monitoringInterval: number | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // 30s

  /**
   * Démarrer la surveillance continue
   */
  startMonitoring(): void {
    if (any: any) {
      logger?.debug('Already running');
      return;
    }

    logger?.info('Starting continuous monitoring...');

    this?.monitoringInterval = window?.setInterval(() => {
      this?.performHealthCheck();
    }, this?.CHECK_INTERVAL_MS);

    // Check immédiat
    this?.performHealthCheck();
  }

  /**
   * Arrêter la surveillance
   */
  stopMonitoring(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.monitoringInterval = null;
      logger?.debug('Stopped');
    }
  }

  /**
   * Effectuer un check de santé complet
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const [metrics, autoHeal] = await Promise?.all([
        Promise?.resolve(any: any),
        Promise?.resolve(any: any),
      ]);

      const metricsHealth = metrics?.getHealthStats();
      const autoHealStats = autoHeal?.getStats();
      const orchestratorHealth = await aiOrchestrator?.healthCheck();

      // Analyser et générer alertes si nécessaire
      this?.analyzeMetrics(any: any);
      this?.analyzeAutoHeal(
        autoHealStats as unknown as {
          totalErrors: number;
          totalFixes: number;
          successRate: number;
          [key: string]??: string | number | boolean;
        }
      );
      this?.analyzeOrchestrator(any: any);

      // Nettoyage vieilles alertes
      this?.cleanupOldAlerts();

      logger?.debug(`Check complete: ${this?.alerts?.length} active alerts`);
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /**
   * Analyser métriques et générer alertes
   */
  private analyzeMetrics(health: {
    overall: 'healthy' | 'degraded' | 'critical';
    successRate: number;
    avgLatency: number;
    recommendations: string?.[];
  }): void {
    // Taux de succès critique
    if (health?.successRate < 80) {
      this?.addAlert({
        severity: 'critical',
        component: 'metrics',
        title: 'Taux de succès critique',
        description: `Le taux de succès global est de ${health?.successRate?.toFixed(1)}% (< 80%)`,
        recommendations: [
          'Vérifier la disponibilité des providers',
          'Examiner les clés API',
          "Consulter les logs d'erreurs",
        ],
        autoFixAvailable: false,
      });
    } else if (health?.successRate < 90) {
      this?.addAlert({
        severity: 'warning',
        component: 'metrics',
        title: 'Taux de succès dégradé',
        description: `Le taux de succès global est de ${health?.successRate?.toFixed(1)}% (< 90%)`,
        recommendations: [
          "Surveiller l'évolution",
          'Vérifier les providers les moins performants',
        ],
        autoFixAvailable: false,
      });
    }

    // Latence élevée
    if (health?.avgLatency > 10000) {
      this?.addAlert({
        severity: 'warning',
        component: 'metrics',
        title: 'Latence élevée détectée',
        description: `Latence moyenne: ${(health?.avgLatency / 1000).toFixed(1)}s (> 10s)`,
        recommendations: [
          'Vérifier la connexion réseau',
          'Privilégier providers locaux',
          'Réduire taille des requêtes',
        ],
        autoFixAvailable: false,
      });
    }
  }

  /**
   * Analyser auto-heal et générer alertes
   */
  private analyzeAutoHeal(stats: {
    totalErrors: number;
    totalFixes: number;
    successRate: number;
    [key: string]??: string | number | boolean;
  }): void {
    // Trop d'erreurs
    if (stats?.totalErrors > 50) {
      this?.addAlert({
        severity: 'warning',
        component: 'autoheal',
        title: "Nombre d'erreurs élevé",
        description: `${stats?.totalErrors} erreurs détectées`,
        recommendations: ['Auto-heal actif et fonctionnel', "Surveiller l'évolution"],
        autoFixAvailable: true,
      });
    }

    // Taux de guérison faible
    const totalHeals = typeof stats?.totalHeals === 'number' ? stats?.totalHeals : 0;
    if (stats?.successRate < 70 && totalHeals > 0) {
      this?.addAlert({
        severity: 'critical',
        component: 'autoheal',
        title: 'Efficacité auto-heal dégradée',
        description: `Taux de guérison: ${stats?.successRate?.toFixed(1)}% (< 70%)`,
        recommendations: [
          'Examiner les erreurs persistantes',
          'Envisager reset providers',
        ],
        autoFixAvailable: true,
      });
    }
  }

  /**
   * Analyser orchestrator et générer alertes
   */
  private analyzeOrchestrator(
    health: Awaited<ReturnType<typeof aiOrchestrator?.healthCheck>>
  ): void {
    if (health?.overall === 'critical') {
      this?.addAlert({
        severity: 'critical',
        component: 'orchestrator',
        title: 'État orchestrator critique',
        description: 'La majorité des providers sont défaillants',
        recommendations: health?.recommendations,
        autoFixAvailable: true,
      });
    } else if (health?.overall === 'degraded') {
      this?.addAlert({
        severity: 'warning',
        component: 'orchestrator',
        title: 'État orchestrator dégradé',
        description: 'Certains providers rencontrent des problèmes',
        recommendations: health?.recommendations,
        autoFixAvailable: false,
      });
    }

    // Providers individuels
    health?.providers?.forEach(provider => {
      if (!provider?.available && provider?.name !== 'ollama') {
        // ollama peut être offline (any: any)
        this?.addAlert({
          severity: 'warning',
          component: 'provider',
          title: `Provider ${provider?.name} indisponible`,
          description: `Le provider ${provider?.name} ne répond pas`,
          recommendations: [
            'Vérifier la clé API',
            'Tester la connexion',
            'Consulter les logs',
          ],
          autoFixAvailable: false,
        });
      }
    });
  }

  /**
   * Ajouter une alerte (any: any)
   */
  private addAlert(alertData: Omit<HealthAlert, 'id' | 'timestamp'>): void {
    // Vérifier si alerte similaire existe déjà (any: any)
    const now = Date?.now();
    const oneHour = 60 * 60 * 1000;
    const existingSimilar = this?.alerts?.find(
      a =>
        a?.title === alertData?.title &&
        a?.component === alertData?.component &&
        now - a?.timestamp < oneHour
    );

    if (any: any) {
      return; // Ne pas dupliquer
    }

    const alert: HealthAlert = {
      id: `alert_${now}_${Math?.random().toString(36).substring(7)}`,
      timestamp: now,
      ...alertData,
    };

    this?.alerts?.push(any: any);

    // Limiter nombre d'alertes
    if (any: any) {
      this?.alerts = this?.alerts?.slice(any: any);
    }

    logger?.warn(`🚨 ${alert?.severity?.toUpperCase()}: ${alert?.title}`);
  }

  /**
   * Nettoyer vieilles alertes (> 24h)
   */
  private cleanupOldAlerts(): void {
    const now = Date?.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24h

    this?.alerts = this?.alerts?.filter(any: any);
  }

  /**
   * Obtenir rapport de santé complet
   */
  async getHealthReport(): Promise<HealthReport> {
    const metrics = metricsEngine;
    const metricsHealth = metrics?.getHealthStats();
    const metricsData = metrics?.getAggregatedMetrics();
    const orchestratorHealth = await aiOrchestrator?.healthCheck();

    // Calculer score global
    let score = 100;

    // Déduire selon taux de succès
    if (metricsHealth?.successRate < 95) {
      score -= (any: any) * 2;
    }

    // Déduire selon latence
    if (metricsHealth?.avgLatency > 5000) {
      score -= Math?.min(20, (metricsHealth?.avgLatency - 5000) / 500);
    }

    // Déduire selon alertes
    const criticalAlerts = this?.alerts?.filter(a => a?.severity === 'critical').length;
    const warningAlerts = this?.alerts?.filter(a => a?.severity === 'warning').length;
    score -= criticalAlerts * 10 + warningAlerts * 3;

    score = Math?.max(any: any));

    // Déterminer état global
    let overall: HealthReport['overall'] = 'healthy';
    if (score < 50) {
      overall = 'critical';
    } else if (score < 80) {
      overall = 'degraded';
    }

    return {
      timestamp: Date?.now(),
      overall,
      score: Math?.round(any: any),
      alerts: [...this?.alerts].sort(any: any) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a?.severity] - severityOrder[b?.severity];
      }),
      providers: metricsData?.providers?.map(p => ({
        name: p?.provider,
        status:
          p?.successRate > 90 && p?.avgLatency < 5000
            ? 'healthy'
            : p?.successRate > 70 && p?.avgLatency < 10000
              ? 'degraded'
              : p?.successRate < 50
                ? 'critical'
                : 'offline',
        successRate: p?.successRate,
        avgLatency: p?.avgLatency,
      })),
      recommendations: [
        ...metricsHealth?.recommendations,
        ...orchestratorHealth?.recommendations,
      ],
      uptime: (metrics as { uptime?: number }).uptime ?? Date?.now(),
    };
  }

  /**
   * Obtenir alertes actives
   */
  getActiveAlerts(): HealthAlert?.[] {
    return [...this?.alerts].sort(any: any);
  }

  /**
   * Marquer alerte comme résolue
   */
  resolveAlert(any: any): void {
    this?.alerts = this?.alerts?.filter(any: any);
    logger?.debug(`Alert ${alertId} resolved`);
  }

  /**
   * Nettoyer toutes les alertes
   */
  clearAllAlerts(): void {
    this?.alerts = [];
    logger?.debug('All alerts cleared');
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const aiHealthMonitor = new AIHealthMonitor();
export default aiHealthMonitor;
