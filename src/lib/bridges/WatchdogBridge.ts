/**
 * TITANE∞ v17.3.0 - WatchdogBridge
 *
 * Bridge TypeScript vers WatchdogEngine Rust
 * Gère scan anomalies, auto-réparation, monitoring
 *
 * @module WatchdogBridge
 */

import { secureInvoke } from '@/lib/security';
import type { CognitiveState } from './CognitiveBridge';

// ═══════════════════════════════════════════════════════════════
// TYPES (mirror des types Rust)
// ═══════════════════════════════════════════════════════════════

/**
 * Niveau d'alerte
 */
export enum AlertLevel {
  Info = 'Info',
  Warn = 'Warn',
  Error = 'Error',
  Critical = 'Critical'
}

/**
 * Type d'anomalie détectée
 */
export enum AnomalyType {
  CognitiveOverload = 'CognitiveOverload',
  LowCoherence = 'LowCoherence',
  HashMismatch = 'HashMismatch',
  InvalidTransition = 'InvalidTransition',
  NaNDetected = 'NaNDetected',
  OutOfBounds = 'OutOfBounds',
  SingularityMismatch = 'SingularityMismatch',
  HistoryOverflow = 'HistoryOverflow',
  InvalidTimestamp = 'InvalidTimestamp'
}

/**
 * Action de réparation
 */
export enum FixAction {
  Sanitize = 'Sanitize',
  Rollback = 'Rollback',
  PartialReset = 'PartialReset',
  RecalculateCoherence = 'RecalculateCoherence',
  NoAction = 'NoAction'
}

/**
 * Alerte watchdog
 */
export interface WatchdogAlert {
  level: AlertLevel;
  message: string;
  context: string;
  timestamp: string; // ISO8601
  action_taken: string | null;
}

/**
 * Résultat scan
 */
export interface ScanResult {
  anomalies: Array<{
    anomaly_type: AnomalyType;
    alert: WatchdogAlert;
  }>;
  is_clean: boolean;
  max_alert_level: AlertLevel | null;
}

/**
 * Résultat fix
 */
export interface FixResult {
  actions_taken: FixAction[];
  remaining_issues: number;
  success: boolean;
  message: string;
}

/**
 * Test individuel watchdog
 */
export interface WatchdogSelfTest {
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Résultat self-test watchdog
 */
export interface WatchdogSelfTestResult {
  tests: WatchdogSelfTest[];
  pass_rate: number;
  timestamp: string; // ISO8601
}

/**
 * État SingularityState (simplifié)
 */
export interface SingularityState {
  awareness: number;
  coherence_global: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════

/**
 * Vérifie si un objet est un ScanResult valide
 */
export function isScanResult(obj: unknown): obj is ScanResult {
  if (!obj || typeof obj !== 'object') return false;
  const result = obj as Record<string, unknown>;

  return (
    Array.isArray(result.anomalies) &&
    typeof result.is_clean === 'boolean' &&
    (result.max_alert_level === null || typeof result.max_alert_level === 'string')
  );
}

/**
 * Vérifie si un objet est un FixResult valide
 */
export function isFixResult(obj: unknown): obj is FixResult {
  if (!obj || typeof obj !== 'object') return false;
  const result = obj as Record<string, unknown>;

  return (
    Array.isArray(result.actions_taken) &&
    typeof result.remaining_issues === 'number' &&
    typeof result.success === 'boolean' &&
    typeof result.message === 'string'
  );
}

/**
 * Vérifie si un objet est un WatchdogSelfTestResult valide
 */
export function isWatchdogSelfTestResult(obj: unknown): obj is WatchdogSelfTestResult {
  if (!obj || typeof obj !== 'object') return false;
  const result = obj as Record<string, unknown>;

  return (
    Array.isArray(result.tests) &&
    typeof result.pass_rate === 'number' &&
    typeof result.timestamp === 'string'
  );
}

/**
 * Vérifie si un objet est un SingularityState valide
 */
export function isSingularityState(obj: unknown): obj is SingularityState {
  if (!obj || typeof obj !== 'object') return false;
  const state = obj as Record<string, unknown>;

  return (
    typeof state.awareness === 'number' &&
    typeof state.coherence_global === 'number' &&
    typeof state.timestamp === 'number'
  );
}

// ═══════════════════════════════════════════════════════════════
// ANTI-LOOP PROTECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Protection anti-boucle infinie pour auto-repair
 */
class AntiLoopProtection {
  private static readonly MAX_FIX_ATTEMPTS = 3;
  private static readonly COOLDOWN_MS = 5000;

  private attemptCount = 0;
  private lastAttemptTime = 0;

  /**
   * Vérifie si une tentative de fix est autorisée
   */
  canAttemptFix(): boolean {
    const now = Date.now();

    // Reset counter après cooldown
    if (now - this.lastAttemptTime > AntiLoopProtection.COOLDOWN_MS) {
      this.attemptCount = 0;
    }

    // Bloque si trop de tentatives
    if (this.attemptCount >= AntiLoopProtection.MAX_FIX_ATTEMPTS) {
      console.error('[WatchdogBridge] Max fix attempts reached - entering safe mode');
      return false;
    }

    return true;
  }

  /**
   * Enregistre une tentative de fix
   */
  recordAttempt(): void {
    this.attemptCount++;
    this.lastAttemptTime = Date.now();
  }

  /**
   * Reset compteur (après succès)
   */
  reset(): void {
    this.attemptCount = 0;
    this.lastAttemptTime = 0;
  }
}

// ═══════════════════════════════════════════════════════════════
// WATCHDOG BRIDGE
// ═══════════════════════════════════════════════════════════════

export class WatchdogBridge {
  private static antiLoop = new AntiLoopProtection();

  /**
   * Lance le self-test complet du WatchdogEngine
   *
   * @returns {Promise<WatchdogSelfTestResult>} Résultat tests (5 tests)
   * @throws {Error} Si la commande Tauri échoue
   */
  static async runSelfTest(): Promise<WatchdogSelfTestResult> {
    try {
      const result = await secureInvoke<unknown>('watchdog_run_selftest');

      if (!isWatchdogSelfTestResult(result)) {
        throw new Error('Invalid WatchdogSelfTestResult received from Rust');
      }

      return result;
    } catch (error) {
      console.error('[WatchdogBridge] runSelfTest failed:', error);
      throw new Error(`Watchdog self-test failed: ${error}`);
    }
  }

  /**
   * Scan complet système cognitif (7 étapes validation)
   *
   * @param {CognitiveState} cognitiveState - État cognitif
   * @param {SingularityState} singularityState - État singularité
   * @returns {Promise<ScanResult>} Résultat scan avec anomalies
   * @throws {Error} Si states invalides ou commande Tauri échoue
   */
  static async scan(
    cognitiveState: CognitiveState,
    singularityState: SingularityState
  ): Promise<ScanResult> {
    // Validation TypeScript
    if (!isSingularityState(singularityState)) {
      throw new Error('Invalid SingularityState: missing required fields');
    }

    try {
      const result = await secureInvoke<unknown>('watchdog_scan', {
        cognitiveState,
        singularityState
      });

      if (!isScanResult(result)) {
        throw new Error('Invalid ScanResult received from Rust');
      }

      return result;
    } catch (error) {
      console.error('[WatchdogBridge] scan failed:', error);
      throw new Error(`Watchdog scan failed: ${error}`);
    }
  }

  /**
   * Auto-réparation intelligente (3-tier strategy)
   *
   * @param {CognitiveState} cognitiveState - État cognitif à réparer
   * @param {ScanResult} scanResult - Résultat scan précédent
   * @returns {Promise<FixResult>} Résultat réparation
   * @throws {Error} Si anti-loop bloque ou commande Tauri échoue
   */
  static async fix(
    cognitiveState: CognitiveState,
    scanResult: ScanResult
  ): Promise<FixResult> {
    // Anti-loop protection
    if (!this.antiLoop.canAttemptFix()) {
      throw new Error('Max fix attempts reached - system in safe mode');
    }

    this.antiLoop.recordAttempt();

    try {
      const result = await secureInvoke<unknown>('watchdog_fix', {
        cognitiveState,
        scanResult
      });

      if (!isFixResult(result)) {
        throw new Error('Invalid FixResult received from Rust');
      }

      // Reset anti-loop si succès
      if (result.success) {
        this.antiLoop.reset();
      }

      return result;
    } catch (error) {
      console.error('[WatchdogBridge] fix failed:', error);
      throw new Error(`Watchdog fix failed: ${error}`);
    }
  }

  /**
   * Scan + Fix automatique (workflow complet)
   *
   * @param {CognitiveState} cognitiveState - État cognitif
   * @param {SingularityState} singularityState - État singularité
   * @returns {Promise<{ scanResult: ScanResult; fixResult?: FixResult }>}
   */
  static async scanAndFix(
    cognitiveState: CognitiveState,
    singularityState: SingularityState
  ): Promise<{
    scanResult: ScanResult;
    fixResult?: FixResult;
  }> {
    // Scan
    const scanResult = await this.scan(cognitiveState, singularityState);

    // Fix si anomalies
    if (!scanResult.is_clean) {
      const fixResult = await this.fix(cognitiveState, scanResult);
      return { scanResult, fixResult };
    }

    return { scanResult };
  }

  /**
   * Quick scan (critical checks seulement - fast)
   * Note: Pas encore exposé en commande Tauri (TODO)
   */
  static async quickScan(
    cognitiveState: CognitiveState,
    singularityState: SingularityState
  ): Promise<ScanResult> {
    // Pour l'instant, utilise scan complet
    // TODO: Ajouter quick_scan command si besoin performance
    return this.scan(cognitiveState, singularityState);
  }

  /**
   * Reset anti-loop protection (emergency)
   */
  static resetAntiLoop(): void {
    this.antiLoop.reset();
    console.info('[WatchdogBridge] Anti-loop protection reset');
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default WatchdogBridge;
