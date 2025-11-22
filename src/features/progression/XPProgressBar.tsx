/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - XP Progress Bar
 * Barre de progression d'expérience avec animation
 * ═══════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { colors, spacing, radius } from '@themes/tokens';

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
  const progress = Math.min((currentXP / requiredXP) * 100, 100);

  return (
    <div style={{ width: '100%' }}>
      {/* Level & XP Info */}
      {showDetails && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: spacing[2],
            fontSize: '0.875rem',
          }}
        >
          <span style={{ color: colors.rubis.primary[400], fontWeight: 600 }}>
            Niveau {level}
          </span>
          <span style={{ color: colors.neutral[400] }}>
            {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        style={{
          position: 'relative',
          height: '24px',
          background: colors.neutral[900],
          borderRadius: radius.full,
          overflow: 'hidden',
          border: `1px solid ${colors.rubis.primary[900]}`,
        }}
      >
        {/* Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${colors.rubis.primary[600]}, ${colors.rubis.primary[500]})`,
            borderRadius: radius.full,
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
              background: `linear-gradient(90deg, transparent, ${colors.neutral[100]}33, transparent)`,
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
            color: progress > 50 ? colors.neutral[900] : colors.neutral[100],
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
