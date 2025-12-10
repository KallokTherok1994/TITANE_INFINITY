/**
 * TITANE∞ v19.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v19.1.0 - SYSTEM SELF-TEST CENTRALIZED
 *   Auto-diagnostic complet de tous les modules
 * ═══════════════════════════════════════════════════════════════
 */

import { tts_selftest, tts_get_diagnostic } from './ttsSelfTest';
import { fileImport_selftest, fileImport_get_diagnostic } from './fileImportSelfTest';
import { xp_selftest, xp_get_diagnostic } from './xpSelfTest';

/**
 * Types de statut
 */
export type ModuleStatus = 'ok' | 'warn' | 'error' | 'skip';

/**
 * Résultat d'un module
 */
export interface ModuleSelfTestResult {
  name: string;
  status: ModuleStatus;
  available: boolean;
  latency_ms: number;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Résultat système complet
 */
export interface SystemSelfTestResult {
  timestamp: number;
  totalLatency_ms: number;
  modulesCount: number;
  modules: {
    tts: ModuleSelfTestResult;
    fileImport: ModuleSelfTestResult;
    xp: ModuleSelfTestResult;
  };
  summary: {
    ok: number;
    warn: number;
    error: number;
    skip: number;
  };
}

/**
 * Exécute tous les self-tests
 */
export async function runAllTests(): Promise<SystemSelfTestResult> {
  console.log('===================================');
  console.log('TITANE INFINITY v19.1.0 SELF-TEST');
  console.log('===================================\n');

  const startTime = performance.now();

  // TTS
  let ttsResult: ModuleSelfTestResult;
  try {
    const tts = await tts_selftest();
    ttsResult = {
      name: 'TTS (Synthese Vocale)',
      status: tts.available ? (tts.engine === 'webspeech' ? 'warn' : 'ok') : 'error',
      available: tts.available,
      latency_ms: tts.latency_ms,
      message: tts.error || `Provider: ${tts.engine}`,
      error: tts.error,
      details: tts.details as Record<string, unknown>,
    };
  } catch (error) {
    ttsResult = {
      name: 'TTS (Synthese Vocale)',
      status: 'error',
      available: false,
      latency_ms: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // FileImport
  let fileImportResult: ModuleSelfTestResult;
  try {
    const fileImport = await fileImport_selftest();
    fileImportResult = {
      name: 'File Import',
      status: fileImport.available
        ? fileImport.tauriBackendAvailable
          ? 'ok'
          : 'warn'
        : 'error',
      available: fileImport.available,
      latency_ms: fileImport.latency_ms,
      message:
        fileImport.error ||
        `Extensions: ${fileImport.supportedExtensions.length}, Max: ${(fileImport.maxSize / 1024 / 1024).toFixed(2)} MB`,
      error: fileImport.error,
      details: {
        supportedExtensions: fileImport.supportedExtensions,
        maxSize: fileImport.maxSize,
        tauriBackendAvailable: fileImport.tauriBackendAvailable,
      },
    };
  } catch (error) {
    fileImportResult = {
      name: 'File Import',
      status: 'error',
      available: false,
      latency_ms: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // XP
  let xpResult: ModuleSelfTestResult;
  try {
    const xp = await xp_selftest();
    xpResult = {
      name: 'XP System',
      status: xp.available ? (xp.persistenceWorking ? 'ok' : 'warn') : 'error',
      available: xp.available,
      latency_ms: xp.latency_ms,
      message:
        xp.error ||
        `Level ${xp.currentLevel}, ${xp.totalXP} XP, ${xp.historyCount} events`,
      error: xp.error,
      details: {
        currentLevel: xp.currentLevel,
        totalXP: xp.totalXP,
        progressPercent: xp.progressPercent,
        xpToNextLevel: xp.xpToNextLevel,
        historyCount: xp.historyCount,
        persistenceWorking: xp.persistenceWorking,
      },
    };
  } catch (error) {
    xpResult = {
      name: 'XP System',
      status: 'error',
      available: false,
      latency_ms: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const totalLatency = Math.round(performance.now() - startTime);

  // Calculer summary
  const allResults = [ttsResult, fileImportResult, xpResult];
  const summary = {
    ok: allResults.filter(r => r.status === 'ok').length,
    warn: allResults.filter(r => r.status === 'warn').length,
    error: allResults.filter(r => r.status === 'error').length,
    skip: allResults.filter(r => r.status === 'skip').length,
  };

  // Log résultats
  console.log('\n=== RESULTS ===');
  console.log('TTS:', ttsResult.status.toUpperCase(), '-', ttsResult.message);
  console.log(
    'FileImport:',
    fileImportResult.status.toUpperCase(),
    '-',
    fileImportResult.message
  );
  console.log('XP:', xpResult.status.toUpperCase(), '-', xpResult.message);
  console.log('\n=== SUMMARY ===');
  console.log(`OK: ${summary.ok}, WARN: ${summary.warn}, ERROR: ${summary.error}`);
  console.log(`Total latency: ${totalLatency}ms\n`);

  return {
    timestamp: Date.now(),
    totalLatency_ms: totalLatency,
    modulesCount: 3,
    modules: {
      tts: ttsResult,
      fileImport: fileImportResult,
      xp: xpResult,
    },
    summary,
  };
}

/**
 * Obtient diagnostic rapide (sans tests complets)
 */
export async function getSystemDiagnostic(): Promise<{
  status: 'ok' | 'warn' | 'error';
  message: string;
  modules: {
    tts: { status: ModuleStatus; message: string };
    fileImport: { status: ModuleStatus; message: string };
    xp: { status: ModuleStatus; message: string };
  };
}> {
  try {
    const [tts, fileImport, xp] = await Promise.all([
      tts_get_diagnostic(),
      fileImport_get_diagnostic(),
      Promise.resolve(xp_get_diagnostic()),
    ]);

    // Statut global
    let globalStatus: 'ok' | 'warn' | 'error' = 'ok';
    const statuses = [tts.status, fileImport.status, xp.status];

    if (statuses.includes('error')) {
      globalStatus = 'error';
    } else if (statuses.includes('warn')) {
      globalStatus = 'warn';
    }

    const errorCount = statuses.filter(s => s === 'error').length;
    const warnCount = statuses.filter(s => s === 'warn').length;

    let message = 'Tous les systemes operationnels';
    if (errorCount > 0) {
      message = `${errorCount} systeme(s) en erreur`;
    } else if (warnCount > 0) {
      message = `${warnCount} avertissement(s)`;
    }

    return {
      status: globalStatus,
      message,
      modules: {
        tts: { status: tts.status, message: tts.message },
        fileImport: { status: fileImport.status, message: fileImport.message },
        xp: { status: xp.status, message: xp.message },
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      modules: {
        tts: { status: 'error', message: 'Non teste' },
        fileImport: { status: 'error', message: 'Non teste' },
        xp: { status: 'error', message: 'Non teste' },
      },
    };
  }
}

/**
 * Export vers JSON (pour logs)
 */
export function exportTestResults(results: SystemSelfTestResult): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Sauvegarde résultats dans localStorage
 */
export function saveTestResults(results: SystemSelfTestResult): void {
  try {
    localStorage.setItem('titane_selftest_last_run', JSON.stringify(results));
    console.log('[SystemSelfTest] Results saved to localStorage');
  } catch (error) {
    console.error('[SystemSelfTest] Failed to save results:', error);
  }
}

/**
 * Charge derniers résultats depuis localStorage
 */
export function loadLastTestResults(): SystemSelfTestResult | null {
  try {
    const stored = localStorage.getItem('titane_selftest_last_run');
    if (stored) {
      return JSON.parse(stored) as SystemSelfTestResult;
    }
  } catch (error) {
    console.error('[SystemSelfTest] Failed to load results:', error);
  }
  return null;
}
