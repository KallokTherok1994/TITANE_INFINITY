/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 Phase 4 - Typing Indicator
 * Indicateur de saisie animé pour Chat IA
 * ═══════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion';

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
    gemini: 'var(--color-info-500)',
    openai: 'var(--color-text-secondary)',
    claude: 'var(--color-violet-500)',
    ollama: 'var(--color-success-500)',
    local: 'var(--color-text-muted)',
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

  const color = providerColors[provider];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${color}40`,
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(10px)',
        marginBottom: 'var(--space-4)',
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: 'var(--text-sm)',
          color,
          fontWeight: 600,
        }}
      >
        {providerLabels[provider]}
      </span>

      {/* Animated dots */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
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
              borderRadius: 'var(--radius-full)',
              backgroundColor: color,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
