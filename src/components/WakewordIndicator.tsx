/**
 * 🎙️ WakewordIndicator.tsx - Indicateur visuel hotword "TITANE"
 * Animation premium en attente du mot d'activation
 */

import React from 'react';
import { motion } from 'framer-motion';
import './WakewordIndicator.css';

interface WakewordIndicatorProps {
  /** Mot d'activation */
  keyword?: string;
  /** État: 'waiting' | 'detecting' | 'activated' */
  state?: 'waiting' | 'detecting' | 'activated';
  /** Confidence de détection (0-1) */
  confidence?: number;
  /** Taille */
  size?: number;
}

export const WakewordIndicator: React.FC<WakewordIndicatorProps> = ({
  keyword = 'TITANE',
  state = 'waiting',
  confidence = 0,
  size = 160,
}) => {
  const getColors = () => {
    switch (state) {
      case 'waiting':
        return {
          primary: '#64748b',
          glow: '#94a3b8',
          text: '#cbd5e1',
        };
      case 'detecting':
        return {
          primary: '#f59e0b',
          glow: '#fbbf24',
          text: '#fef3c7',
        };
      case 'activated':
        return {
          primary: '#10b981',
          glow: '#34d399',
          text: '#d1fae5',
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      className="wakeword-indicator"
      style={{ width: size, height: size }}
    >
      {/* Cercle principal */}
      <motion.div
        className="wakeword-circle"
        style={{
          width: size,
          height: size,
          borderColor: colors.primary,
        }}
        animate={{
          scale: state === 'waiting' ? [1, 1.05, 1] : [1, 1.1, 1],
          opacity: state === 'waiting' ? [0.3, 0.5, 0.3] : [0.6, 1, 0.6],
        }}
        transition={{
          duration: state === 'waiting' ? 3 : 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Ondes de détection */}
      {state === 'detecting' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`wave-${i}`}
              className="wakeword-wave"
              style={{
                borderColor: colors.glow,
              }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 2, 2.5],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      {/* Effet activation */}
      {state === 'activated' && (
        <motion.div
          className="wakeword-activation"
          style={{
            backgroundColor: colors.primary,
            boxShadow: `0 0 40px ${colors.glow}`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 2],
            opacity: [1, 0.5, 0],
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Icône micro */}
      <div 
        className="wakeword-icon"
        style={{ color: colors.primary }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
          
          {/* Ondes sonores */}
          {state !== 'waiting' && (
            <>
              <motion.path
                d="M17 8c0-1.5-0.5-3-1.5-4"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.path
                d="M7 8c0-1.5 0.5-3 1.5-4"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Mot-clé */}
      <div className="wakeword-label">
        <motion.div
          className="wakeword-keyword"
          style={{ color: colors.text }}
          animate={{
            scale: state === 'activated' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          {keyword}
        </motion.div>

        {/* Barre de confidence */}
        {state === 'detecting' && (
          <motion.div
            className="wakeword-confidence-bar"
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: colors.primary,
            }}
          />
        )}
      </div>

      {/* Instructions */}
      <div 
        className="wakeword-instructions"
        style={{ color: colors.text }}
      >
        {state === 'waiting' && '💬 Dites "TITANE" pour activer'}
        {state === 'detecting' && '🎤 Détection en cours...'}
        {state === 'activated' && '✅ Activé ! Parlez maintenant'}
      </div>
    </div>
  );
};

export default WakewordIndicator;
