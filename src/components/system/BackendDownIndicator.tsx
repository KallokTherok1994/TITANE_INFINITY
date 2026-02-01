// ═══════════════════════════════════════════════════════════════════
// TITANE∞ v∞ — BACKEND DOWN INDICATOR
// UI vΩ Phase F: Mode Dégradé Local-First
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, X, Info } from 'lucide-react';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

// ─────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────

export interface BackendDownIndicatorProps {
  /** Position du banner (top = fixed top, inline = dans le flow) */
  position?: 'top' | 'inline';

  /** Permet de fermer le banner? */
  dismissible?: boolean;

  /** Classname additionnelle */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

/**
 * Banner global indiquant que les backends sont indisponibles
 *
 * Contrat Phase F: Mode Dégradé Local-First
 * - Détecte backend down automatiquement via useBackendHealth
 * - Affiche message explicite "moteur indisponible" (pas d'erreur brute)
 * - Aucun crash UI si services down
 * - CTA Retry pour recheck manuel
 *
 * @usage
 * ```tsx
 * // Dans App.tsx ou AppShell
 * <BackendDownIndicator position="top" dismissible />
 * ```
 */
export const BackendDownIndicator: React.FC<BackendDownIndicatorProps> = ({
  position = 'top',
  dismissible = true,
  className,
}) => {
  const {
    allBackendsDown,
    tauriStatus,
    ollamaStatus,
    unavailableReason,
    recheckHealth,
  } = useBackendHealth();

  const [dismissed, setDismissed] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────

  const handleRetry = async () => {
    setIsRechecking(true);
    logger.info('[BackendDownIndicator] 🔄 User triggered recheck');

    try {
      await recheckHealth();
    } catch (error) {
      logger.error('[BackendDownIndicator] Recheck failed', { error });
    } finally {
      setIsRechecking(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    logger.debug('[BackendDownIndicator] Banner dismissed');
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────

  // Ne pas afficher si dismissed ou si au moins 1 backend OK
  if (dismissed || !allBackendsDown) {
    return null;
  }

  const isFixedTop = position === 'top';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="backend-down-banner"
        initial={{ opacity: 0, y: isFixedTop ? -64 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isFixedTop ? -64 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        role="alert"
        aria-live="assertive"
        className={cn(
          'w-full bg-yellow-600/20 border-l-4 border-yellow-500 backdrop-blur-sm',
          'px-6 py-4 shadow-lg',
          isFixedTop && 'fixed top-0 left-0 right-0 z-50',
          className
        )}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Icon + Message */}
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle
              className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-yellow-100 mb-1">
                ⚠️ Moteurs IA indisponibles
              </h3>

              <p className="text-sm text-yellow-200/90 leading-relaxed">
                {unavailableReason === 'ollama-offline' && (
                  <>
                    Le serveur Ollama local est hors ligne. Veuillez démarrer Ollama pour
                    utiliser le chat IA.
                  </>
                )}
                {unavailableReason === 'tauri-backend-down' && (
                  <>
                    Le backend Rust est indisponible. Veuillez vérifier les logs ou
                    redémarrer l'application.
                  </>
                )}
                {unavailableReason === 'unknown-error' && (
                  <>
                    Les moteurs IA sont temporairement indisponibles. Veuillez réessayer
                    dans quelques instants.
                  </>
                )}
              </p>

              {/* Diagnostic info (collapsed by default) */}
              <details className="mt-2 text-xs text-yellow-300/70">
                <summary className="cursor-pointer hover:text-yellow-200 transition-colors inline-flex items-center gap-1">
                  <Info className="w-3 h-3" aria-hidden="true" />
                  Diagnostic technique
                </summary>
                <div className="mt-2 pl-4 space-y-1 font-mono">
                  <div>Backend Tauri: {tauriStatus}</div>
                  <div>Backend Ollama: {ollamaStatus}</div>
                  <div>Raison: {unavailableReason}</div>
                </div>
              </details>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Retry Button */}
            <button
              onClick={handleRetry}
              disabled={isRechecking}
              aria-label="Réessayer la connexion"
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600',
                'text-yellow-950 font-medium text-sm',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-yellow-900',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <RefreshCw
                className={cn('w-4 h-4', isRechecking && 'animate-spin')}
                aria-hidden="true"
              />
              <span>{isRechecking ? 'Vérification...' : 'Réessayer'}</span>
            </button>

            {/* Dismiss Button */}
            {dismissible && (
              <button
                onClick={handleDismiss}
                aria-label="Masquer ce message"
                className={cn(
                  'p-2 rounded-lg',
                  'bg-yellow-500/20 hover:bg-yellow-500/30 active:bg-yellow-500/40',
                  'text-yellow-200',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-yellow-900'
                )}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

BackendDownIndicator.displayName = 'BackendDownIndicator';
