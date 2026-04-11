/**
 * TITANE∞ v30.0.0 — Boot Safety Lock
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🔒 VERROU GLOBAL DE BOOT
 * Empêche les boucles infinies et les crash conditions WebKit
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('BootSafety');

/**
 * État global du boot - Module scope (singleton strict)
 */
let bootAlreadyFailed = false;
let bootRecoveryAttempted = false;
let fatalErrorCaptured = false;
let domMutationInProgress = false;
let reactRenderCount = 0;
let lastRenderTime = 0;

const MAX_RENDERS_PER_SECOND = 60;
const _MAX_RECOVERY_ATTEMPTS = 1; // Reserved for future use

/**
 * Boot Safety Lock API
 */
export const bootSafetyLock = {
  /**
   * Marque le boot comme ayant échoué
   */
  markBootFailed(): void {
    if (bootAlreadyFailed) {
      logger.warn('⚠️ [BOOT-LOCK] Boot already marked as failed');
      return;
    }
    bootAlreadyFailed = true;
    logger.error('🚨 [BOOT-LOCK] Boot marked as FAILED');
  },

  /**
   * Vérifie si le boot a déjà échoué
   */
  hasBootFailed(): boolean {
    return bootAlreadyFailed;
  },

  /**
   * Marque qu'une tentative de recovery a été effectuée
   */
  markRecoveryAttempted(): void {
    bootRecoveryAttempted = true;
    logger.warn('🛡️ [BOOT-LOCK] Recovery attempt registered');
  },

  /**
   * Vérifie si recovery est autorisé
   */
  canAttemptRecovery(): boolean {
    if (bootRecoveryAttempted) {
      logger.error('❌ [BOOT-LOCK] Recovery already attempted - DENIED');
      return false;
    }
    if (fatalErrorCaptured) {
      logger.error('❌ [BOOT-LOCK] Fatal error captured - Recovery DENIED');
      return false;
    }
    return true;
  },

  /**
   * Marque une erreur fatale
   */
  markFatalError(): void {
    fatalErrorCaptured = true;
    bootAlreadyFailed = true;
    logger.error('💀 [BOOT-LOCK] FATAL ERROR CAPTURED - ALL RECOVERY DISABLED');
  },

  /**
   * Vérifie si on est en état fatal
   */
  isFatalState(): boolean {
    return fatalErrorCaptured;
  },

  /**
   * Vérifie si une mutation DOM est autorisée
   */
  canMutateDOM(): boolean {
    if (domMutationInProgress) {
      logger.error('❌ [BOOT-LOCK] DOM mutation already in progress - DENIED');
      return false;
    }
    if (fatalErrorCaptured) {
      logger.error('❌ [BOOT-LOCK] Fatal state - DOM mutation DENIED');
      return false;
    }
    return true;
  },

  /**
   * Marque le début d'une mutation DOM
   */
  beginDOMMutation(): boolean {
    if (!this.canMutateDOM()) {
      return false;
    }
    domMutationInProgress = true;
    return true;
  },

  /**
   * Marque la fin d'une mutation DOM
   */
  endDOMMutation(): void {
    domMutationInProgress = false;
  },

  /**
   * Vérifie si un render React est autorisé (anti-boucle)
   */
  canRenderReact(): boolean {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime;

    // Reset counter si plus d'1 seconde depuis le dernier render
    if (timeSinceLastRender > 1000) {
      reactRenderCount = 0;
      lastRenderTime = now;
    }

    reactRenderCount++;

    if (reactRenderCount > MAX_RENDERS_PER_SECOND) {
      logger.error(
        `💥 [BOOT-LOCK] React render loop detected: ${reactRenderCount} renders/sec`
      );
      this.markFatalError();
      return false;
    }

    lastRenderTime = now;
    return true;
  },

  /**
   * Reset complet (pour tests uniquement)
   */
  __unsafeReset(): void {
    bootAlreadyFailed = false;
    bootRecoveryAttempted = false;
    fatalErrorCaptured = false;
    domMutationInProgress = false;
    reactRenderCount = 0;
    lastRenderTime = 0;
    logger.warn('⚠️ [BOOT-LOCK] UNSAFE RESET performed');
  },

  /**
   * Obtenir l'état complet (debug)
   */
  getState(): {
    bootAlreadyFailed: boolean;
    bootRecoveryAttempted: boolean;
    fatalErrorCaptured: boolean;
    domMutationInProgress: boolean;
    reactRenderCount: number;
  } {
    return {
      bootAlreadyFailed,
      bootRecoveryAttempted,
      fatalErrorCaptured,
      domMutationInProgress,
      reactRenderCount,
    };
  },
};

/**
 * Hook window global pour debug
 */
if (typeof window !== 'undefined') {
  (
    window as unknown as { __TITANE_BOOT_LOCK__: typeof bootSafetyLock }
  ).__TITANE_BOOT_LOCK__ = bootSafetyLock;
}
