/**
 * TITANE_INFINITY v19.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.4 — WAKE WORD INDICATOR
 *
 *   Indicateur visuel pour les états d'attention wake word:
 *   - inactive: transparent
 *   - armed: glow blue pulsant (écoute passive)
 *   - wake_detected: glow strong green (wake détecté)
 *   - awaiting_command: pulsation forte (en attente commande)
 *   - processing: animation rotation (traitement)
 *   - responding: glow purple (IA parle)
 *   - cooldown: fade out
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { type AttentionState } from '@/services/voice/attentionEngine';
import { cn } from '@/lib/utils';

interface WakeWordIndicatorProps {
  /** État d'attention actuel */
  attentionState: AttentionState;

  /** Taille de l'indicateur */
  size?: 'sm' | 'md' | 'lg';

  /** Afficher le label de l'état */
  showLabel?: boolean;

  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Configuration des états visuels
 */
const STATE_CONFIG: Record<AttentionState, {
  color: string;
  glow: string;
  animation: string;
  label: string;
  icon: string;
}> = {
  inactive: {
    color: 'bg-gray-400',
    glow: '',
    animation: '',
    label: 'Inactif',
    icon: '○',
  },
  armed: {
    color: 'bg-blue-500',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    animation: 'animate-pulse',
    label: 'Écoute',
    icon: '👂',
  },
  wake_detected: {
    color: 'bg-green-500',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.8)]',
    animation: 'animate-ping',
    label: 'Détecté',
    icon: '✓',
  },
  awaiting_command: {
    color: 'bg-yellow-500',
    glow: 'shadow-[0_0_25px_rgba(234,179,8,0.7)]',
    animation: 'animate-pulse',
    label: 'Commande ?',
    icon: '🎤',
  },
  processing: {
    color: 'bg-purple-500',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
    animation: 'animate-spin',
    label: 'Traitement',
    icon: '⚙️',
  },
  responding: {
    color: 'bg-purple-600',
    glow: 'shadow-[0_0_25px_rgba(147,51,234,0.7)]',
    animation: 'animate-pulse',
    label: 'Réponse',
    icon: '💬',
  },
  cooldown: {
    color: 'bg-gray-500',
    glow: 'shadow-[0_0_10px_rgba(107,114,128,0.4)]',
    animation: 'animate-pulse',
    label: 'Repos',
    icon: '⏸️',
  },
};

/**
 * Tailles de l'indicateur
 */
const SIZE_CONFIG = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *   COMPOSANT
 * ═══════════════════════════════════════════════════════════════════
 */
export const WakeWordIndicator: React.FC<WakeWordIndicatorProps> = ({
  attentionState,
  size = 'md',
  showLabel = true,
  className,
}) => {

  const config = STATE_CONFIG[attentionState];
  const sizeClass = SIZE_CONFIG[size];

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Indicateur circulaire */}
      <div className="relative flex items-center justify-center">
        {/* Glow externe */}
        {config.glow && (
          <div
            className={cn(
              'absolute inset-0 rounded-full',
              config.color,
              config.glow,
              config.animation
            )}
            style={{
              filter: 'blur(8px)',
              opacity: 0.6,
            }}
          />
        )}

        {/* Cercle principal */}
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full',
            'transition-all duration-300',
            sizeClass,
            config.color,
            config.glow,
            config.animation
          )}
        >
          {/* Icône */}
          <span className="text-white text-lg font-bold">
            {config.icon}
          </span>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {config.label}
        </span>
      )}
    </div>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *   VARIANTE COMPACTE (pour navbar)
 * ═══════════════════════════════════════════════════════════════════
 */
export const WakeWordBadge: React.FC<{
  attentionState: AttentionState;
  onClick?: () => void;
}> = ({ attentionState, onClick }) => {

  const config = STATE_CONFIG[attentionState];

  // Ne rien afficher si inactive
  if (attentionState === 'inactive') {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'transition-all duration-300',
        'hover:scale-105',
        config.color,
        config.glow,
        config.animation
      )}
      title={config.label}
    >
      <span className="text-white text-sm">{config.icon}</span>
      <span className="text-white text-xs font-medium">{config.label}</span>
    </button>
  );
};

export default WakeWordIndicator;
