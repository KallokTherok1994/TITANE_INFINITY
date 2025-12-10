/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v24 - Compact XP Bar
 * Barre XP compacte pour Sidebar avec navigation vers Progression
 * ═══════════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { useExperience } from '../../hooks/useExperience';
import { useAnimation } from '../../contexts/AnimationContext';

// ─────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────

export interface CompactXPBarProps {
  /** Callback au clic (navigate to /progression) */
  onClick?: () => void;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const CompactXPBar = ({ onClick }: CompactXPBarProps): JSX.Element => {
  const { totalXp, level, progress, isLoading } = useExperience();
  const { animationConfig, shouldReduceMotion } = useAnimation();

  // Protection contre valeurs undefined
  const safeXp = totalXp ?? 0;
  const safeLevel = level ?? 1;
  const safeProgress = progress ?? 0;

  if (isLoading) {
    return (
      <div
        style={{
          padding: '8px 12px',
          background: 'rgba(114, 123, 129, 0.1)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#727b81',
          textAlign: 'center',
        }}
      >
        Chargement XP...
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      style={{
        padding: '12px',
        background: 'rgba(114, 123, 129, 0.1)',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid rgba(114, 123, 129, 0.2)',
      }}
      whileHover={
        onClick && !shouldReduceMotion
          ? {
              background: 'rgba(114, 123, 129, 0.15)',
              borderColor: 'rgba(147, 179, 153, 0.5)',
            }
          : undefined
      }
      whileTap={onClick && !shouldReduceMotion ? { scale: 0.98 } : undefined}
      transition={{ duration: animationConfig.duration }}
    >
      {/* Level Badge + Total XP */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#c4c4c4',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              background: 'linear-gradient(135deg, #727b81, #93b399)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#000',
            }}
          >
            NIV. {safeLevel}
          </span>
          <span style={{ color: '#727b81', fontSize: '0.75rem' }}>
            {safeXp.toLocaleString()} XP
          </span>
        </div>

        {onClick && (
          <span
            style={{
              fontSize: '0.875rem',
              color: '#93b399',
              opacity: 0.7,
            }}
          >
            →
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'rgba(114, 123, 129, 0.2)',
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #727b81, #93b399)',
            borderRadius: '3px',
            boxShadow: '0 0 8px rgba(147, 179, 153, 0.5)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(safeProgress * 100, 100)}%` }}
          transition={{
            duration: animationConfig.skipAnimation
              ? 0
              : Math.max(animationConfig.duration * 3, 0.6),
            ease: 'easeOut',
          }}
        />
      </div>

      {/* Progress Text */}
      <div
        style={{
          marginTop: '6px',
          fontSize: '0.6875rem',
          color: '#727b81',
          textAlign: 'center',
        }}
      >
        {(safeProgress * 100).toFixed(0)}% vers Niv. {safeLevel + 1}
      </div>
    </motion.div>
  );
};
