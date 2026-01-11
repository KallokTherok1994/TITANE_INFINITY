/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 Phase 4 - Typing Indicator
 * Indicateur de saisie animé pour Chat IA
 * ═══════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';
import { colors, spacing, radius, shadows } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface TypingIndicatorProps {
  provider?: 'gemini' | 'openai' | 'claude' | 'ollama' | 'local';
  show?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const TypingIndicator = ({
  provider = 'gemini',
  show = true,
}: TypingIndicatorProps): JSX.Element | null => {
  if (!show) return null;

  const providerLabels = {
    gemini: '🤖 Gemini réfléchit',
    openai: '✨ GPT-4o réfléchit',
    claude: '🧠 Claude réfléchit',
    ollama: '🦉 Ollama réfléchit',
    local: '🏠 TITANE réfléchit',
  };

  const providerColors = {
    gemini: colors.saphir.primary[500],
    openai: colors.rubis.primary[500],
    claude: colors.emeraude.primary[600],
    ollama: colors.emeraude.primary[500],
    local: colors.neutral[500],
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'reverse' as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        padding: spacing[3],
        backgroundColor: `${colors.neutral[900]}cc`,
        borderRadius: radius.lg,
        border: `1px solid ${providerColors[provider]}40`,
        boxShadow: shadows.md,
        backdropFilter: 'blur(10px)',
        marginBottom: spacing[4],
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: '0.875rem',
          color: providerColors[provider],
          fontWeight: 600,
        }}
      >
        {providerLabels[provider]}
      </span>

      {/* Animated dots */}
      <div
        style={{
          display: 'flex',
          gap: spacing[1],
          alignItems: 'center',
        }}
      >
        {[0, 0.2, 0.4].map((delay, index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{
              ...dotTransition,
              delay,
            }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: radius.full,
              backgroundColor: providerColors[provider],
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
