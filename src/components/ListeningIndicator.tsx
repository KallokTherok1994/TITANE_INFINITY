/**
 * 👂 ListeningIndicator.tsx - Indicateur d'écoute premium style Siri/ChatGPT
 * Halo rotatif + respiration + transitions audio/thinking
 */

import React from 'react';
import { motion } from 'framer-motion';
import './ListeningIndicator.css';

interface ListeningIndicatorProps {
  /** État actif */
  active?: boolean;
  /** Mode: 'listening' | 'thinking' | 'processing' */
  mode?: 'listening' | 'thinking' | 'processing';
  /** Taille */
  size?: number;
  /** Intensité (0-1) */
  intensity?: number;
}

export const ListeningIndicator: React.FC<ListeningIndicatorProps> = ({
  active = false,
  mode = 'listening',
  size = 120,
  intensity = 0.8,
}) => {
  const getColors = () => {
    switch (mode) {
      case 'listening':
        return {
          primary: '#06b6d4',
          secondary: '#0ea5e9',
          glow: '#67e8f9',
        };
      case 'thinking':
        return {
          primary: '#8b5cf6',
          secondary: '#a78bfa',
          glow: '#c4b5fd',
        };
      case 'processing':
        return {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          glow: '#fcd34d',
        };
    }
  };

  const colors = getColors();

  const orbCount = mode === 'thinking' ? 8 : 6;
  const rotationSpeed = mode === 'thinking' ? 2 : 4;

  return (
    <div 
      className="listening-indicator"
      style={{ width: size, height: size }}
    >
      {!active && (
        <motion.div
          className="listening-idle"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: size * 0.4,
            height: size * 0.4,
            backgroundColor: colors.primary,
          }}
        />
      )}

      {active && (
        <>
          {/* Halo rotatif principal */}
          <motion.div
            className="listening-halo"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: rotationSpeed,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              width: size,
              height: size,
              borderColor: colors.primary,
            }}
          >
            {/* Orbes sur le cercle */}
            {[...Array(orbCount)].map((_, i) => {
              const angle = (i / orbCount) * Math.PI * 2;
              const x = Math.cos(angle) * (size / 2 - 10);
              const y = Math.sin(angle) * (size / 2 - 10);

              return (
                <motion.div
                  key={`orb-${i}`}
                  className="listening-orb"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    backgroundColor: i % 2 === 0 ? colors.primary : colors.secondary,
                    boxShadow: `0 0 12px ${colors.glow}`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [intensity, intensity * 1.2, intensity],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * (1 / orbCount),
                    ease: 'easeInOut',
                  }}
                />
              );
            })}
          </motion.div>

          {/* Cercle central pulsatif */}
          <motion.div
            className="listening-core"
            style={{
              backgroundColor: colors.primary,
              boxShadow: `
                0 0 20px ${colors.glow},
                0 0 40px ${colors.glow}80,
                inset 0 0 20px ${colors.glow}40
              `,
            }}
            animate={{
              scale: mode === 'thinking' ? [1, 1.1, 1] : [1, 1.05, 1],
            }}
            transition={{
              duration: mode === 'thinking' ? 0.8 : 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Anneaux de respiration */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              className="listening-ring"
              style={{
                borderColor: colors.secondary,
              }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Particules flottantes (mode thinking) */}
          {mode === 'thinking' && (
            <div className="listening-particles">
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const radius = size * 0.6;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={`particle-${i}`}
                    className="thinking-particle"
                    style={{
                      backgroundColor: colors.glow,
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: [0, x, 0],
                      y: [0, y, 0],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Label mode */}
      <div className="listening-label">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0.5 }}
          style={{ color: colors.primary }}
        >
          {mode === 'listening' && '👂 Écoute...'}
          {mode === 'thinking' && '🧠 Réflexion...'}
          {mode === 'processing' && '⚙️ Traitement...'}
        </motion.span>
      </div>
    </div>
  );
};

export default ListeningIndicator;
