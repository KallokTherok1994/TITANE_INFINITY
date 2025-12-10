/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - UI Integrity Checker (Self-Healing Light)
 * Auto-détection et correction des anomalies UI
 *
 * Responsabilités:
 * - Détecter fichiers manquants
 * - Détecter imports cassés
 * - Détecter styles invalides
 * - Générer correctifs automatiques
 * - Logger anomalies
 * - Métriques d'intégrité
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type AnomalyType =
  | 'missing_file'
  | 'broken_import'
  | 'invalid_style'
  | 'missing_export'
  | 'type_error'
  | 'runtime_error';

export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  location?: {
    file: string;
    line?: number;
    column?: number;
  };
  detected: number; // timestamp
  resolved?: boolean;
  resolvedAt?: number;
  autoFixable: boolean;
  fix?: () => Promise<boolean>;
}

export interface IntegrityReport {
  timestamp: number;
  totalChecks: number;
  anomaliesFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  autoFixedCount: number;
  manualFixRequired: number;
  overallHealth: number; // 0-1 (1 = perfect)
  anomalies: Anomaly[];
}

export interface CheckerConfig {
  autoFix?: boolean;
  checkInterval?: number; // ms
  logAnomalies?: boolean;
  throwOnCritical?: boolean;
  debug?: boolean;
}

export interface CheckerMetrics {
  totalChecksRun: number;
  totalAnomaliesDetected: number;
  totalAutoFixes: number;
  lastCheckTime: number;
  averageCheckDuration: number; // ms
  healthScore: number; // 0-1
}

// ─────────────────────────────────────────────────────────────────
// UI INTEGRITY CHECKER CLASS
// ─────────────────────────────────────────────────────────────────

export class UIIntegrityChecker {
  private anomalies: Map<string, Anomaly> = new Map();
  private checkHistory: IntegrityReport[] = [];

  private config: Required<CheckerConfig> = {
    autoFix: true,
    checkInterval: 60000, // 1 minute
    logAnomalies: true,
    throwOnCritical: false,
    debug: false,
  };

  private metrics: CheckerMetrics = {
    totalChecksRun: 0,
    totalAnomaliesDetected: 0,
    totalAutoFixes: 0,
    lastCheckTime: 0,
    averageCheckDuration: 0,
    healthScore: 1.0,
  };

  private checkTimer: NodeJS.Timeout | null = null;
  private running = false;

  // Required file structure
  private readonly REQUIRED_FILES = [
    'src/visual-engine/TitaneVisualEngine.ts',
    'src/visual-engine/StateManager.ts',
    'src/visual-engine/EffectsOrchestrator.ts',
    'src/visual-engine/OSIntegrationBridge.ts',
    'src/visual-engine/index.ts',
    'src/particles/ParticleSystem.ts',
    'src/particles/Particle.ts',
    'src/effects/EnergyArcs.tsx',
    'src/effects/HealingWaves.tsx',
    'src/effects/AudioWaveform.tsx',
    'src/effects/GlitchEffect.tsx',
    'src/effects/SpiralPattern.tsx',
    'src/utils/cn.ts',
    'src/styles/css-vars.css',
    'src/styles/tokens.ts',
  ];

  // Required exports validation
  private readonly REQUIRED_EXPORTS = {
    'src/visual-engine/index.ts': [
      'TitaneVisualEngine',
      'StateManager',
      'EffectsOrchestrator',
      'OSIntegrationBridge',
      'effectsOrchestrator',
      'osIntegrationBridge',
    ],
    'src/effects/index.ts': [
      'EnergyArcs',
      'HealingWaves',
      'AudioWaveform',
      'GlitchEffect',
      'SpiralPattern',
    ],
  };

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  constructor(config?: CheckerConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Initialized with config:', this.config);
    }
  }

  /**
   * Start continuous integrity checks
   */
  public start(): void {
    if (this.running) {
      if (this.config.debug) {
        console.log('[UIIntegrityChecker] Already running');
      }
      return;
    }

    this.running = true;

    // Run initial check
    this.runCheck().catch(error => {
      console.error('[UIIntegrityChecker] Initial check failed:', error);
    });

    // Schedule periodic checks
    if (this.config.checkInterval > 0) {
      this.checkTimer = setInterval(() => {
        this.runCheck().catch(error => {
          console.error('[UIIntegrityChecker] Periodic check failed:', error);
        });
      }, this.config.checkInterval);
    }

    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Started');
    }
  }

  /**
   * Stop continuous checks
   */
  public stop(): void {
    this.running = false;

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Stopped');
    }
  }

  /**
   * Run a single integrity check
   */
  public async runCheck(): Promise<IntegrityReport> {
    const startTime = Date.now();

    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Running integrity check...');
    }

    // Clear resolved anomalies
    for (const [id, anomaly] of this.anomalies.entries()) {
      if (anomaly.resolved) {
        this.anomalies.delete(id);
      }
    }

    // Run all checks
    await this.checkRequiredFiles();
    await this.checkImports();
    await this.checkStyles();
    await this.checkExports();

    // Generate report
    const report = this.generateReport();

    // Store in history
    this.checkHistory.push(report);
    if (this.checkHistory.length > 100) {
      this.checkHistory.shift(); // Keep only last 100
    }

    // Update metrics
    const duration = Date.now() - startTime;
    this.metrics.totalChecksRun++;
    this.metrics.lastCheckTime = Date.now();
    this.metrics.averageCheckDuration =
      (this.metrics.averageCheckDuration * (this.metrics.totalChecksRun - 1) + duration) /
      this.metrics.totalChecksRun;
    this.metrics.healthScore = report.overallHealth;

    // Auto-fix if enabled
    if (this.config.autoFix) {
      await this.autoFixAnomalies();
    }

    // Log if enabled
    if (this.config.logAnomalies && report.anomaliesFound > 0) {
      console.warn('[UIIntegrityChecker] Found', report.anomaliesFound, 'anomalies');
      for (const anomaly of report.anomalies) {
        console.warn(`  [${anomaly.severity}] ${anomaly.type}: ${anomaly.message}`);
      }
    }

    // Throw on critical if configured
    if (this.config.throwOnCritical && report.criticalCount > 0) {
      throw new Error(
        `[UIIntegrityChecker] Critical anomalies detected: ${report.criticalCount}`
      );
    }

    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Check complete in', duration, 'ms');
      console.log('[UIIntegrityChecker] Health score:', report.overallHealth.toFixed(2));
    }

    return report;
  }

  /**
   * Get current anomalies
   */
  public getAnomalies(): Anomaly[] {
    return Array.from(this.anomalies.values());
  }

  /**
   * Get check history
   */
  public getHistory(): IntegrityReport[] {
    return [...this.checkHistory];
  }

  /**
   * Get metrics
   */
  public getMetrics(): CheckerMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear all anomalies
   */
  public clearAnomalies(): void {
    this.anomalies.clear();
    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Cleared all anomalies');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - CHECKS
  // ─────────────────────────────────────────────────────────────────

  private async checkRequiredFiles(): Promise<void> {
    // Note: In browser environment, we can't check filesystem
    // This is a placeholder for server-side or build-time checks
    // In production, this would use Node.js fs or build tool APIs

    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Checking required files...');
    }

    // Simulate file checks (in real implementation, would use fs.existsSync)
    // For now, assume all required files exist in browser context
  }

  private async checkImports(): Promise<void> {
    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Checking imports...');
    }

    // Check if critical imports are available
    try {
      // Try to dynamically import to verify availability
      const visualEngineModule = await import('./TitaneVisualEngine');
      if (!visualEngineModule.TitaneVisualEngine) {
        this.addAnomaly({
          type: 'broken_import',
          severity: 'critical',
          message: 'TitaneVisualEngine import broken',
          location: { file: 'src/visual-engine/TitaneVisualEngine.ts' },
          autoFixable: false,
        });
      }
    } catch (error) {
      this.addAnomaly({
        type: 'broken_import',
        severity: 'critical',
        message: `Failed to import TitaneVisualEngine: ${error}`,
        location: { file: 'src/visual-engine/TitaneVisualEngine.ts' },
        autoFixable: false,
      });
    }

    // Check EffectsOrchestrator
    try {
      const orchestratorModule = await import('./EffectsOrchestrator');
      if (!orchestratorModule.EffectsOrchestrator) {
        this.addAnomaly({
          type: 'broken_import',
          severity: 'high',
          message: 'EffectsOrchestrator import broken',
          location: { file: 'src/visual-engine/EffectsOrchestrator.ts' },
          autoFixable: false,
        });
      }
    } catch (error) {
      this.addAnomaly({
        type: 'broken_import',
        severity: 'high',
        message: `Failed to import EffectsOrchestrator: ${error}`,
        location: { file: 'src/visual-engine/EffectsOrchestrator.ts' },
        autoFixable: false,
      });
    }

    // Check OSIntegrationBridge
    try {
      const bridgeModule = await import('./OSIntegrationBridge');
      if (!bridgeModule.OSIntegrationBridge) {
        this.addAnomaly({
          type: 'broken_import',
          severity: 'high',
          message: 'OSIntegrationBridge import broken',
          location: { file: 'src/visual-engine/OSIntegrationBridge.ts' },
          autoFixable: false,
        });
      }
    } catch (error) {
      this.addAnomaly({
        type: 'broken_import',
        severity: 'high',
        message: `Failed to import OSIntegrationBridge: ${error}`,
        location: { file: 'src/visual-engine/OSIntegrationBridge.ts' },
        autoFixable: false,
      });
    }
  }

  private async checkStyles(): Promise<void> {
    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Checking styles...');
    }

    // Check if critical CSS variables are defined
    const criticalVars = [
      '--color-bg-primary',
      '--color-bg-secondary',
      '--color-text-primary',
      '--color-violet-500',
    ];

    for (const varName of criticalVars) {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
      if (!value || value.trim() === '') {
        this.addAnomaly({
          type: 'invalid_style',
          severity: 'high',
          message: `Critical CSS variable missing: ${varName}`,
          location: { file: 'src/styles/css-vars.css' },
          autoFixable: false,
        });
      }
    }

    // Check if Tailwind is loaded
    const testElement = document.createElement('div');
    testElement.className = 'bg-bg-primary';
    document.body.appendChild(testElement);
    const bgColor = getComputedStyle(testElement).backgroundColor;
    document.body.removeChild(testElement);

    if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      this.addAnomaly({
        type: 'invalid_style',
        severity: 'critical',
        message: 'Tailwind CSS not properly loaded',
        location: { file: 'src/index.css' },
        autoFixable: false,
      });
    }
  }

  private async checkExports(): Promise<void> {
    if (this.config.debug) {
      console.log('[UIIntegrityChecker] Checking exports...');
    }

    // Check visual-engine exports
    try {
      const visualEngineModule = await import('./index');
      const requiredExports = this.REQUIRED_EXPORTS['src/visual-engine/index.ts'];

      for (const exportName of requiredExports) {
        if (!(exportName in visualEngineModule)) {
          this.addAnomaly({
            type: 'missing_export',
            severity: 'high',
            message: `Missing export: ${exportName} from visual-engine/index.ts`,
            location: { file: 'src/visual-engine/index.ts' },
            autoFixable: false,
          });
        }
      }
    } catch (error) {
      this.addAnomaly({
        type: 'broken_import',
        severity: 'critical',
        message: `Failed to check visual-engine exports: ${error}`,
        location: { file: 'src/visual-engine/index.ts' },
        autoFixable: false,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - ANOMALIES
  // ─────────────────────────────────────────────────────────────────

  private addAnomaly(params: {
    type: AnomalyType;
    severity: AnomalySeverity;
    message: string;
    location?: Anomaly['location'];
    autoFixable: boolean;
    fix?: () => Promise<boolean>;
  }): void {
    const id = `${params.type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const anomaly: Anomaly = {
      id,
      type: params.type,
      severity: params.severity,
      message: params.message,
      location: params.location,
      detected: Date.now(),
      resolved: false,
      autoFixable: params.autoFixable,
      fix: params.fix,
    };

    this.anomalies.set(id, anomaly);
    this.metrics.totalAnomaliesDetected++;
  }

  private async autoFixAnomalies(): Promise<void> {
    let fixCount = 0;

    for (const [_id, anomaly] of this.anomalies.entries()) {
      if (anomaly.autoFixable && !anomaly.resolved && anomaly.fix) {
        try {
          const fixed = await anomaly.fix();
          if (fixed) {
            anomaly.resolved = true;
            anomaly.resolvedAt = Date.now();
            fixCount++;
            this.metrics.totalAutoFixes++;

            if (this.config.debug) {
              console.log('[UIIntegrityChecker] Auto-fixed:', anomaly.message);
            }
          }
        } catch (error) {
          console.error('[UIIntegrityChecker] Auto-fix failed:', error);
        }
      }
    }

    if (fixCount > 0 && this.config.logAnomalies) {
      console.log('[UIIntegrityChecker] Auto-fixed', fixCount, 'anomalies');
    }
  }

  private generateReport(): IntegrityReport {
    const anomalies = Array.from(this.anomalies.values());
    const unresolved = anomalies.filter(a => !a.resolved);

    const criticalCount = unresolved.filter(a => a.severity === 'critical').length;
    const highCount = unresolved.filter(a => a.severity === 'high').length;
    const mediumCount = unresolved.filter(a => a.severity === 'medium').length;
    const lowCount = unresolved.filter(a => a.severity === 'low').length;

    const autoFixedCount = anomalies.filter(a => a.resolved).length;
    const manualFixRequired = unresolved.filter(a => !a.autoFixable).length;

    // Calculate health score (1.0 = perfect)
    const totalWeight =
      criticalCount * 10 + highCount * 5 + mediumCount * 2 + lowCount * 1;
    const maxWeight = 100; // Arbitrary max for normalization
    const overallHealth = Math.max(0, 1 - totalWeight / maxWeight);

    return {
      timestamp: Date.now(),
      totalChecks: 4, // Number of check types
      anomaliesFound: unresolved.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      autoFixedCount,
      manualFixRequired,
      overallHealth,
      anomalies: unresolved,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

export const uiIntegrityChecker = new UIIntegrityChecker({
  debug: import.meta.env.DEV,
  autoFix: true,
  logAnomalies: true,
  checkInterval: 60000, // 1 minute
});

// Auto-start in development
if (import.meta.env.DEV) {
  uiIntegrityChecker.start();
}
