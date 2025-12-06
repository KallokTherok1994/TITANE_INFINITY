/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * 🎤 VoiceButton.tsx - Bouton microphone premium avec anneaux concentriques
 * Press-to-talk ou VAD auto • Shimmer + pulse minimal
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
// import './VoiceButton.css';

interface VoiceButtonProps {
  /** État actif */
  active?: boolean;
  /** Mode: 'push-to-talk' | 'vad-auto' */
  mode?: 'push-to-talk' | 'vad-auto';
  /** Callback activation */
  onActivate?: () => void;
  /** Callback désactivation */
  onDeactivate?: () => void;
  /** Taille */
  size?: number;
  /** Désactivé */
  disabled?: boolean;
  /** Label */
  label?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  active = false,
  mode = 'vad-auto',
  onActivate,
  onDeactivate,
  size = 80,
  disabled = false,
  label,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    if (disabled) return;

    if (mode === 'push-to-talk') {
      setIsPressed(true);
      onActivate?.();
    } else {
      if (active) {
        onDeactivate?.();
      } else {
        onActivate?.();
      }
    }
  };

  const handleRelease = () => {
    if (mode === 'push-to-talk') {
      setIsPressed(false);
      onDeactivate?.();
    }
  };

  const isActive = mode === 'push-to-talk' ? isPressed : active;

  return (
    <div
      className="voice-button-container"
      style={{ width: size + 60, height: size + 60 }}
    >
      {/* Anneaux concentriques animés */}
      {isActive && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              className="voice-button-ring"
              style={{
                width: size + i * 30,
                height: size + i * 30,
              }}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}

      {/* Bouton principal */}
      <motion.button
        type="button"
        className={`voice-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        style={{
          width: size,
          height: size,
        }}
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleRelease();
        }}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handlePress();
          }
        }}
        onKeyUp={(e) => {
          if (disabled) return;
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleRelease();
          }
        }}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        animate={{
          boxShadow: isActive
            ? [
                '0 0 20px rgba(59, 130, 246, 0.4)',
                '0 0 40px rgba(59, 130, 246, 0.6)',
                '0 0 20px rgba(59, 130, 246, 0.4)',
              ]
            : '0 4px 24px rgba(0, 0, 0, 0.12)',
        }}
        transition={{
          boxShadow: {
            duration: 1.5,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut',
          },
          scale: {
            duration: 0.2,
          },
        }}
        disabled={disabled}
        aria-label={isActive ? 'Arrêter l\'enregistrement vocal' : 'Démarrer l\'enregistrement vocal'}
        aria-pressed={isActive}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        title={mode === 'push-to-talk' ? 'Maintenir pour parler (Espace)' : 'Cliquer pour activer/désactiver (Entrée)'}
      >
        {/* Gradient background */}
        <div className="voice-button-gradient" />

        {/* Shimmer effect */}
        {isHovered && !disabled && (
          <motion.div
            className="voice-button-shimmer"
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Icône micro */}
        <svg
          className="voice-button-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isActive ? (
            // Micro actif
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </>
          ) : (
            // Micro inactif
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" opacity="0.5" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" opacity="0.5" />
              <line x1="12" y1="19" x2="12" y2="23" opacity="0.5" />
              <line x1="8" y1="23" x2="16" y2="23" opacity="0.5" />
            </>
          )}
        </svg>

        {/* Pulse central */}
        {isActive && (
          <motion.div
            className="voice-button-pulse"
            animate={{
              scale: [1, 1.5],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.button>

      {/* Label */}
      {label && (
        <div className="voice-button-label">
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {label}
          </motion.span>
        </div>
      )}

      {/* Mode indicator with live region */}
      <div 
        className="voice-button-mode"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">Mode actuel: </span>
        {mode === 'push-to-talk' ? (
          <>
            <span aria-hidden="true">🎙️</span> Push to Talk
          </>
        ) : (
          <>
            <span aria-hidden="true">🤖</span> VAD Auto
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceButton;
