/**
 * TITANE∞ v19.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v19.1.0 - XP SYSTEM SELF-TEST
 *   Auto-diagnostic barre XP + XP Engine
 * ═══════════════════════════════════════════════════════════════
 */

import { XP } from '@/core/experience/XP_ENGINE';

export interface XPSelfTestResult {
  available: boolean;
  currentLevel: number;
  totalXP: number;
  progressPercent: number;
  xpToNextLevel: number;
  historyCount: number;
  persistenceWorking: boolean;
  latency_ms: number;
  error?: string;
}

/**
 * Test complet du système XP
 */
export async function xp_selftest(): Promise<XPSelfTestResult> {
  console.log('XP SELF-TEST: Starting...');

  const startTime = performance.now();

  try {
    // 1. Vérifier état initial
    const initialState = { ...XP.state };
    console.log('État XP initial:', {
      level: initialState.level,
      total: initialState.total,
      history: initialState.history.length,
    });

    // 2. Test gain XP
    const testAmount = 10;
    XP.gain(testAmount, 'selftest', 'Test système XP');

    const afterGain = { ...XP.state };
    console.log('Après gain +10 XP:', {
      level: afterGain.level,
      total: afterGain.total,
    });

    // 3. Vérifier calcul progression
    const progress = XP.getProgressToNextLevel();
    const xpToNext = XP.getXPToNextLevel();
    console.log('Progression:', progress.toFixed(2), '%');
    console.log('XP vers niveau suivant:', xpToNext);

    // 4. Test persistence (localStorage)
    let persistenceWorking = false;
    try {
      XP.persist();
      const saved = localStorage.getItem('xp_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        persistenceWorking = parsed.total === afterGain.total;
        console.log('Persistence localStorage:', persistenceWorking ? 'OK' : 'FAIL');
      }
    } catch (error) {
      console.warn('Persistence test échoué:', error);
    }

    // 5. Restaurer état initial (annuler test)
    XP.state.total = initialState.total;
    XP.state.level = initialState.level;
    XP.state.history = initialState.history;
    XP.persist();
    console.log('État restauré');

    const latency = Math.round(performance.now() - startTime);

    console.log('[XP SELF-TEST] SUCCESS');
    console.log('Level:', initialState.level);
    console.log('XP Total:', initialState.total);
    console.log('Latency:', latency, 'ms');

    return {
      available: true,
      currentLevel: initialState.level,
      totalXP: initialState.total,
      progressPercent: XP.getProgressToNextLevel(),
      xpToNextLevel: XP.getXPToNextLevel(),
      historyCount: initialState.history.length,
      persistenceWorking,
      latency_ms: latency,
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('[XP SELF-TEST] FAILED');
    console.error('Error:', errorMessage);

    return {
      available: false,
      currentLevel: 0,
      totalXP: 0,
      progressPercent: 0,
      xpToNextLevel: 0,
      historyCount: 0,
      persistenceWorking: false,
      latency_ms: latency,
      error: errorMessage,
    };
  }
}

/**
 * Test rapide XP disponibilité
 */
export function xp_quick_check(): boolean {
  try {
    return typeof XP !== 'undefined' && typeof XP.state !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Diagnostic formaté pour UI
 */
export function xp_get_diagnostic(): {
  status: 'ok' | 'warn' | 'error';
  message: string;
  details: {
    level: number;
    totalXP: number;
    progress: number;
    historySize: number;
  };
} {
  try {
    if (!xp_quick_check()) {
      return {
        status: 'error',
        message: 'XP Engine non disponible',
        details: {
          level: 0,
          totalXP: 0,
          progress: 0,
          historySize: 0,
        },
      };
    }

    const progress = XP.getProgressToNextLevel();

    // Vérifier cohérence
    if (XP.state.level < 1 || XP.state.total < 0) {
      return {
        status: 'error',
        message: 'État XP corrompu (valeurs invalides)',
        details: {
          level: XP.state.level,
          totalXP: XP.state.total,
          progress: 0,
          historySize: XP.state.history.length,
        },
      };
    }

    // Warning si historique trop grand
    if (XP.state.history.length > 900) {
      return {
        status: 'warn',
        message: 'Historique XP presque saturé (>900 événements)',
        details: {
          level: XP.state.level,
          totalXP: XP.state.total,
          progress,
          historySize: XP.state.history.length,
        },
      };
    }

    return {
      status: 'ok',
      message: `XP Engine opérationnel (Level ${XP.state.level})`,
      details: {
        level: XP.state.level,
        totalXP: XP.state.total,
        progress,
        historySize: XP.state.history.length,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: {
        level: 0,
        totalXP: 0,
        progress: 0,
        historySize: 0,
      },
    };
  }
}
