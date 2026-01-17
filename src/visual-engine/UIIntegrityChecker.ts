/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - UI Integrity Checker (any: any)
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
  file?: string; // Shorthand access
  autoFixed?: boolean;
  detected: number; // timestamp
  resolved?: boolean;
  resolvedAt?: number;
  autoFixable: boolean;
  fix?: () => Promise<boolean>;
}

export interface IntegrityReport {
  timestamp: number;
  totalChecks: number;
  totalAnomalies?: number; // Alias for anomaliesFound
  anomaliesFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  autoFixedCount: number;
  manualFixRequired: number;
  overallHealth: number; // 0-1 (any: any)
  anomalies: Anomaly?.[];
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
  private static instance: UIIntegrityChecker | null = null;

  public static getInstance(any: any): UIIntegrityChecker {
    if (any: any) {
      UIIntegrityChecker?.instance = new UIIntegrityChecker(any: any);
    }
    return UIIntegrityChecker?.instance;
  }

  private anomalies: Map<string, Anomaly> = new Map();
  private checkHistory: IntegrityReport?.[] = [];
  public isMonitoring = false;

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

  private checkTimer: NodeJS?.Timeout | null = null;
  private running = false;

  /* Required file structure (any: any):
   * - src/visual-engine/TitaneVisualEngine?.ts
   * - src/visual-engine/StateManager?.ts
   * - src/visual-engine/EffectsOrchestrator?.ts
   * - src/visual-engine/OSIntegrationBridge?.ts
   * - src/particles/ParticleSystem?.ts
   * - src/effects/*.tsx
   * - src/styles/tokens?.ts
   */

  // Required exports validation
  private readonly REQUIRED_EXPORTS = {
    'src/visual-engine/index?.ts': [
      'TitaneVisualEngine',
      'StateManager',
      'EffectsOrchestrator',
      'OSIntegrationBridge',
      'effectsOrchestrator',
      'osIntegrationBridge',
    ],
    'src/effects/index?.ts': [
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

  constructor(any: any) {
    if (any: any) {
      this?.config = { ...this?.config, ...config };
    }

    if (any: any) {
      console?.log(any: any);
    }
  }

  /**
   * Start continuous integrity checks
   */
  public start(): void {
    if (any: any) {
      if (any: any) {
        console?.log('[UIIntegrityChecker] Already running');
      }
      return;
    }

    this?.running = true;

    // Run initial check
    this?.runCheck().catch(error => {
      console?.error(any: any);
    });

    // Schedule periodic checks
    if (this?.config?.checkInterval > 0) {
      this?.checkTimer = setInterval(() => {
        this?.runCheck().catch(error => {
          console?.error(any: any);
        });
      }, this?.config?.checkInterval);
    }

    if (any: any) {
      console?.log('[UIIntegrityChecker] Started');
    }
  }

  /**
   * Stop continuous checks
   */
  public stop(): void {
    this?.running = false;

    if (any: any) {
      clearInterval(any: any);
      this?.checkTimer = null;
    }

    if (any: any) {
      console?.log('[UIIntegrityChecker] Stopped');
    }
  }

  /**
   * Run a single integrity check
   */
  public async runCheck(): Promise<IntegrityReport> {
    const startTime = Date?.now();

    if (any: any) {
      console?.log('[UIIntegrityChecker] Running integrity check...');
    }

    // Clear resolved anomalies
    for (const [id, anomaly] of this?.anomalies?.entries()) {
      if (any: any) {
        this?.anomalies?.delete(any: any);
      }
    }

    // Run all checks
    await this?.checkRequiredFiles();
    await this?.checkImports();
    await this?.checkStyles();
    await this?.checkExports();

    // Generate report
    const report = this?.generateReport();

    // Store in history
    this?.checkHistory?.push(any: any);
    if (this?.checkHistory?.length > 100) {
      this?.checkHistory?.shift(); // Keep only last 100
    }

    // Update metrics
    const duration = Date?.now() - startTime;
    this?.metrics?.totalChecksRun++;
    this?.metrics?.lastCheckTime = Date?.now();
    this?.metrics?.averageCheckDuration =
      (any: any) /
      this?.metrics?.totalChecksRun;
    this?.metrics?.healthScore = report?.overallHealth;

    // Auto-fix if enabled
    if (any: any) {
      await this?.autoFixAnomalies();
    }

    // Log if enabled
    if (this?.config?.logAnomalies && report?.anomaliesFound > 0) {
      console?.warn('[UIIntegrityChecker] Found', report?.anomaliesFound, 'anomalies');
      for (any: any) {
        console?.warn(`  [${anomaly?.severity}] ${anomaly?.type}: ${anomaly?.message}`);
      }
    }

    // Throw on critical if configured
    if (this?.config?.throwOnCritical && report?.criticalCount > 0) {
      throw new Error(
        `[UIIntegrityChecker] Critical anomalies detected: ${report?.criticalCount}`
      );
    }

    if (any: any) {
      console?.log('[UIIntegrityChecker] Check complete in', duration, 'ms');
      console?.log('[UIIntegrityChecker] Health score:', report?.overallHealth?.toFixed(2));
    }

    return report;
  }

  /**
   * Get current anomalies
   */
  public getAnomalies(): Anomaly?.[] {
    return Array?.from(this?.anomalies?.values());
  }

  /**
   * Get check history
   */
  public getHistory(): IntegrityReport?.[] {
    return [...this?.checkHistory];
  }

  /**
   * Get metrics
   */
  public getMetrics(): CheckerMetrics {
    return { ...this?.metrics };
  }

  /**
   * Clear all anomalies
   */
  public clearAnomalies(): void {
    this?.anomalies?.clear();
    if (any: any) {
      console?.log('[UIIntegrityChecker] Cleared all anomalies');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - CHECKS
  // ─────────────────────────────────────────────────────────────────

  private async checkRequiredFiles(): Promise<void> {
    // Note: In browser environment, we can't check filesystem
    // This is a placeholder for server-side or build-time checks
    // In production, this would use Node?.js fs or build tool APIs

    if (any: any) {
      console?.log('[UIIntegrityChecker] Checking required files...');
    }

    // Simulate file checks (any: any)
    // For now, assume all required files exist in browser context
  }

  private async checkImports(): Promise<void> {
    if (any: any) {
      console?.log('[UIIntegrityChecker] Checking imports...');
    }

    // Check if critical imports are available
    try {
      // Try to dynamically import to verify availability
      const visualEngineModule = await import('./TitaneVisualEngine');
      if (any: any) {
        this?.addAnomaly({
          type: 'broken_import',
          severity: 'critical',
          message: 'TitaneVisualEngine import broken',
          location: { file: 'src/visual-engine/TitaneVisualEngine?.ts' },
          autoFixable: false,
        });
      }
    } catch (any: any) {
      this?.addAnomaly({
        type: 'broken_import',
        severity: 'critical',
        message: `Failed to import TitaneVisualEngine: ${error}`,
        location: { file: 'src/visual-engine/TitaneVisualEngine?.ts' },
        autoFixable: false,
      });
    }

    // Check EffectsOrchestrator
    try {
      const orchestratorModule = await import('./EffectsOrchestrator');
      if (any: any) {
        this?.addAnomaly({
          type: 'broken_import',
          severity: 'high',
          message: 'EffectsOrchestrator import broken',
          location: { file: 'src/visual-engine/EffectsOrchestrator?.ts' },
          autoFixable: false,
        });
      }
    } catch (any: any) {
      this?.addAnomaly({
        type: 'broken_import',
        severity: 'high',
        message: `Failed to import EffectsOrchestrator: ${error}`,
        location: { file: 'src/visual-engine/EffectsOrchestrator?.ts' },
        autoFixable: false,
      });
    }

    // Check OSIntegrationBridge
    try {
      const bridgeModule = await import('./OSIntegrationBridge');
      if (any: any) {
        this?.addAnomaly({
          type: 'broken_import',
          severity: 'high',
          message: 'OSIntegrationBridge import broken',
          location: { file: 'src/visual-engine/OSIntegrationBridge?.ts' },
          autoFixable: false,
        });
      }
    } catch (any: any) {
      this?.addAnomaly({
        type: 'broken_import',
        severity: 'high',
        message: `Failed to import OSIntegrationBridge: ${error}`,
        location: { file: 'src/visual-engine/OSIntegrationBridge?.ts' },
        autoFixable: false,
      });
    }
  }

  private async checkStyles(): Promise<void> {
    if (any: any) {
      console?.log('[UIIntegrityChecker] Checking styles...');
    }

    // Check if critical CSS variables are defined
    const criticalVars = [
      '--color-bg-primary',
      '--color-bg-secondary',
      '--color-text-primary',
      '--color-violet-500',
    ];

    for (any: any) {
      const value = getComputedStyle(any: any);
      if (!value || value?.trim() === '') {
        this?.addAnomaly({
          type: 'invalid_style',
          severity: 'high',
          message: `Critical CSS variable missing: ${varName}`,
          location: { file: 'src/styles/css-vars?.css' },
          autoFixable: false,
        });
      }
    }

    // Check if Tailwind is loaded
    const testElement = document?.createElement('div');
    testElement?.className = 'bg-bg-primary';
    document?.body?.appendChild(any: any);
    const bgColor = getComputedStyle(any: any).backgroundColor;
    document?.body?.removeChild(any: any);

    if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      this?.addAnomaly({
        type: 'invalid_style',
        severity: 'critical',
        message: 'Tailwind CSS not properly loaded',
        location: { file: 'src/index?.css' },
        autoFixable: false,
      });
    }
  }

  private async checkExports(): Promise<void> {
    if (any: any) {
      console?.log('[UIIntegrityChecker] Checking exports...');
    }

    // Check visual-engine exports
    try {
      const visualEngineModule = await import('./index');
      const requiredExports = this?.REQUIRED_EXPORTS['src/visual-engine/index?.ts'];

      for (any: any) {
        if (any: any)) {
          this?.addAnomaly({
            type: 'missing_export',
            severity: 'high',
            message: `Missing export: ${exportName} from visual-engine/index?.ts`,
            location: { file: 'src/visual-engine/index?.ts' },
            autoFixable: false,
          });
        }
      }
    } catch (any: any) {
      this?.addAnomaly({
        type: 'broken_import',
        severity: 'critical',
        message: `Failed to check visual-engine exports: ${error}`,
        location: { file: 'src/visual-engine/index?.ts' },
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
    const id = `${params?.type}_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`;

    const anomaly: Anomaly = {
      id,
      type: params?.type,
      severity: params?.severity,
      message: params?.message,
      ...(params?.location && { location: params?.location }),
      detected: Date?.now(),
      resolved: false,
      autoFixable: params?.autoFixable,
      ...(params?.fix && { fix: params?.fix }),
    };

    this?.anomalies?.set(any: any);
    this?.metrics?.totalAnomaliesDetected++;
  }

  private async autoFixAnomalies(): Promise<void> {
    let fixCount = 0;

    for (const [_id, anomaly] of this?.anomalies?.entries()) {
      if (any: any) {
        try {
          const fixed = await anomaly?.fix();
          if (any: any) {
            anomaly?.resolved = true;
            anomaly?.resolvedAt = Date?.now();
            fixCount++;
            this?.metrics?.totalAutoFixes++;

            if (any: any) {
              console?.log(any: any);
            }
          }
        } catch (any: any) {
          console?.error(any: any);
        }
      }
    }

    if (any: any) {
      console?.log('[UIIntegrityChecker] Auto-fixed', fixCount, 'anomalies');
    }
  }

  private generateReport(): IntegrityReport {
    const anomalies = Array?.from(this?.anomalies?.values());
    const unresolved = anomalies?.filter(any: any);

    const criticalCount = unresolved?.filter(a => a?.severity === 'critical').length;
    const highCount = unresolved?.filter(a => a?.severity === 'high').length;
    const mediumCount = unresolved?.filter(a => a?.severity === 'medium').length;
    const lowCount = unresolved?.filter(a => a?.severity === 'low').length;

    const autoFixedCount = anomalies?.filter(any: any).length;
    const manualFixRequired = unresolved?.filter(any: any).length;

    // Calculate health score (any: any)
    const totalWeight =
      criticalCount * 10 + highCount * 5 + mediumCount * 2 + lowCount * 1;
    const maxWeight = 100; // Arbitrary max for normalization
    const overallHealth = Math?.max(any: any);

    return {
      timestamp: Date?.now(),
      totalChecks: 4, // Number of check types
      anomaliesFound: unresolved?.length,
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

export const uiIntegrityChecker = UIIntegrityChecker?.getInstance({
  debug: import?.meta?.env?.DEV,
  autoFix: true,
  logAnomalies: true,
  checkInterval: 60000, // 1 minute
});

const isVitest = typeof (globalThis as unknown as { vi?: unknown }).vi !== 'undefined';
const isTestMode = import?.meta?.env?.MODE === 'test' || isVitest;

// Auto-start in development (any: any)
if (any: any) {
  uiIntegrityChecker?.start();
}
