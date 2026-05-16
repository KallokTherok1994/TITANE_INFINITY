/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - XP Progress Bar
 * Barre de progression d'expérience avec animation
 * ═══════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface XPProgressBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  showDetails?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const XPProgressBar = ({
  currentXP,
  requiredXP,
  level,
  showDetails = true,
}: XPProgressBarProps): JSX.Element => {
  const { animationConfig } = useAnimation();
  // NaN guard: if requiredXP is 0 or negative, treat as 100% complete
  const progress = requiredXP > 0 ? Math.min((currentXP / requiredXP) * 100, 100) : 0;

  return (
    <div style={{ width: '100%' }}>
      {/* Level & XP Info */}
      {showDetails && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-2)',
            fontSize: '0.875rem',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Niveau {level}
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        style={{
          position: 'relative',
          height: '24px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--color-bg-secondary)',
        }}
      >
        {/* Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: animationConfig.skipAnimation
              ? 0
              : Math.max(animationConfig.duration * 5, 1),
            ease: 'easeOut',
          }}
          style={{
            height: '100%',
            background:
              'linear-gradient(90deg, var(--color-text-disabled), var(--color-text-secondary))',
            borderRadius: 'var(--radius-full)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shine effect */}
          <motion.div
            animate={{
              x: ['0%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, var(--color-text-primary)33, transparent)',
            }}
          />
        </motion.div>

        {/* Percentage Text */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color:
              progress > 50 ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
            textShadow: progress > 50 ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
            zIndex: 1,
          }}
        >
          {progress.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};
