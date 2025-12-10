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

import { metricsEngine } from './metricsEngine';
import { autoHealEngine } from './autoHealEngine';
import { aiOrchestrator } from './orchestrator';

const isDev = process.env.NODE_ENV === 'development';

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
  recommendations: string[];
  autoFixAvailable: boolean;
}

export interface HealthReport {
  timestamp: number;
  overall: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  alerts: HealthAlert[];
  providers: {
    name: string;
    status: 'healthy' | 'degraded' | 'critical' | 'offline';
    successRate: number;
    avgLatency: number;
  }[];
  recommendations: string[];
  uptime: number;
}

// ─────────────────────────────────────────────────────────────────
// HEALTH MONITOR CLASS
// ─────────────────────────────────────────────────────────────────

class AIHealthMonitor {
  private alerts: HealthAlert[] = [];
  private readonly MAX_ALERTS = 50;
  private monitoringInterval: number | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // 30s

  /**
   * Démarrer la surveillance continue
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      isDev && console.log('[HEALTH MONITOR] Already running');
      return;
    }

    isDev && console.log('[HEALTH MONITOR] Starting continuous monitoring...');

    this.monitoringInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.CHECK_INTERVAL_MS);

    // Check immédiat
    this.performHealthCheck();
  }

  /**
   * Arrêter la surveillance
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      isDev && console.log('[HEALTH MONITOR] Stopped');
    }
  }

  /**
   * Effectuer un check de santé complet
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const metricsHealth = metricsEngine.getHealthStats();
      const autoHealStats = autoHealEngine.getStats();
      const orchestratorHealth = await aiOrchestrator.healthCheck();

      // Analyser et générer alertes si nécessaire
      this.analyzeMetrics(metricsHealth);
      this.analyzeAutoHeal(autoHealStats);
      this.analyzeOrchestrator(orchestratorHealth);

      // Nettoyage vieilles alertes
      this.cleanupOldAlerts();

      isDev &&
        console.log(
          `[HEALTH MONITOR] Check complete: ${this.alerts.length} active alerts`
        );
    } catch (error) {
      isDev && console.error('[HEALTH MONITOR] Check failed:', error);
    }
  }

  /**
   * Analyser métriques et générer alertes
   */
  private analyzeMetrics(health: ReturnType<typeof metricsEngine.getHealthStats>): void {
    // Taux de succès critique
    if (health.successRate < 80) {
      this.addAlert({
        severity: 'critical',
        component: 'metrics',
        title: 'Taux de succès critique',
        description: `Le taux de succès global est de ${health.successRate.toFixed(1)}% (< 80%)`,
        recommendations: [
          'Vérifier la disponibilité des providers',
          'Examiner les clés API',
          "Consulter les logs d'erreurs",
        ],
        autoFixAvailable: false,
      });
    } else if (health.successRate < 90) {
      this.addAlert({
        severity: 'warning',
        component: 'metrics',
        title: 'Taux de succès dégradé',
        description: `Le taux de succès global est de ${health.successRate.toFixed(1)}% (< 90%)`,
        recommendations: [
          "Surveiller l'évolution",
          'Vérifier les providers les moins performants',
        ],
        autoFixAvailable: false,
      });
    }

    // Latence élevée
    if (health.avgLatency > 10000) {
      this.addAlert({
        severity: 'warning',
        component: 'metrics',
        title: 'Latence élevée détectée',
        description: `Latence moyenne: ${(health.avgLatency / 1000).toFixed(1)}s (> 10s)`,
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
  private analyzeAutoHeal(stats: ReturnType<typeof autoHealEngine.getStats>): void {
    // Trop d'erreurs
    if (stats.totalErrors > 50) {
      this.addAlert({
        severity: 'warning',
        component: 'autoheal',
        title: "Nombre d'erreurs élevé",
        description: `${stats.totalErrors} erreurs détectées`,
        recommendations: ['Auto-heal actif et fonctionnel', "Surveiller l'évolution"],
        autoFixAvailable: true,
      });
    }

    // Taux de guérison faible
    if (stats.successRate < 70 && stats.totalHeals > 0) {
      this.addAlert({
        severity: 'critical',
        component: 'autoheal',
        title: 'Efficacité auto-heal dégradée',
        description: `Taux de guérison: ${stats.successRate.toFixed(1)}% (< 70%)`,
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
    health: Awaited<ReturnType<typeof aiOrchestrator.healthCheck>>
  ): void {
    if (health.overall === 'critical') {
      this.addAlert({
        severity: 'critical',
        component: 'orchestrator',
        title: 'État orchestrator critique',
        description: 'La majorité des providers sont défaillants',
        recommendations: health.recommendations,
        autoFixAvailable: true,
      });
    } else if (health.overall === 'degraded') {
      this.addAlert({
        severity: 'warning',
        component: 'orchestrator',
        title: 'État orchestrator dégradé',
        description: 'Certains providers rencontrent des problèmes',
        recommendations: health.recommendations,
        autoFixAvailable: false,
      });
    }

    // Providers individuels
    health.providers.forEach(provider => {
      if (!provider.available && provider.name !== 'ollama') {
        // ollama peut être offline (optionnel)
        this.addAlert({
          severity: 'warning',
          component: 'provider',
          title: `Provider ${provider.name} indisponible`,
          description: `Le provider ${provider.name} ne répond pas`,
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
   * Ajouter une alerte (dédupliquée)
   */
  private addAlert(alertData: Omit<HealthAlert, 'id' | 'timestamp'>): void {
    // Vérifier si alerte similaire existe déjà (dernière heure)
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const existingSimilar = this.alerts.find(
      a =>
        a.title === alertData.title &&
        a.component === alertData.component &&
        now - a.timestamp < oneHour
    );

    if (existingSimilar) {
      return; // Ne pas dupliquer
    }

    const alert: HealthAlert = {
      id: `alert_${now}_${Math.random().toString(36).substring(7)}`,
      timestamp: now,
      ...alertData,
    };

    this.alerts.push(alert);

    // Limiter nombre d'alertes
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS);
    }

    isDev &&
      console.log(`[HEALTH MONITOR] 🚨 ${alert.severity.toUpperCase()}: ${alert.title}`);
  }

  /**
   * Nettoyer vieilles alertes (> 24h)
   */
  private cleanupOldAlerts(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24h

    this.alerts = this.alerts.filter(a => now - a.timestamp < maxAge);
  }

  /**
   * Obtenir rapport de santé complet
   */
  async getHealthReport(): Promise<HealthReport> {
    const metricsHealth = metricsEngine.getHealthStats();
    const metrics = metricsEngine.getAggregatedMetrics();
    const orchestratorHealth = await aiOrchestrator.healthCheck();

    // Calculer score global
    let score = 100;

    // Déduire selon taux de succès
    if (metricsHealth.successRate < 95) {
      score -= (95 - metricsHealth.successRate) * 2;
    }

    // Déduire selon latence
    if (metricsHealth.avgLatency > 5000) {
      score -= Math.min(20, (metricsHealth.avgLatency - 5000) / 500);
    }

    // Déduire selon alertes
    const criticalAlerts = this.alerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = this.alerts.filter(a => a.severity === 'warning').length;
    score -= criticalAlerts * 10 + warningAlerts * 3;

    score = Math.max(0, Math.min(100, score));

    // Déterminer état global
    let overall: HealthReport['overall'] = 'healthy';
    if (score < 50) {
      overall = 'critical';
    } else if (score < 80) {
      overall = 'degraded';
    }

    return {
      timestamp: Date.now(),
      overall,
      score: Math.round(score),
      alerts: [...this.alerts].sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      providers: metrics.providers.map(p => ({
        name: p.provider,
        status:
          p.successRate > 90 && p.avgLatency < 5000
            ? 'healthy'
            : p.successRate > 70 && p.avgLatency < 10000
              ? 'degraded'
              : p.successRate < 50
                ? 'critical'
                : 'offline',
        successRate: p.successRate,
        avgLatency: p.avgLatency,
      })),
      recommendations: [
        ...metricsHealth.recommendations,
        ...orchestratorHealth.recommendations,
      ],
      uptime: metrics.uptime,
    };
  }

  /**
   * Obtenir alertes actives
   */
  getActiveAlerts(): HealthAlert[] {
    return [...this.alerts].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Marquer alerte comme résolue
   */
  resolveAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    isDev && console.log(`[HEALTH MONITOR] Alert ${alertId} resolved`);
  }

  /**
   * Nettoyer toutes les alertes
   */
  clearAlerts(): void {
    this.alerts = [];
    isDev && console.log('[HEALTH MONITOR] All alerts cleared');
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const aiHealthMonitor = new AIHealthMonitor();
export default aiHealthMonitor;
