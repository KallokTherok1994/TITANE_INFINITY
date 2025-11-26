/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * 🎯 VoiceCircle.tsx - Cercle vocal audio-réactif premium
 * Animation pulsative avec glow dynamique selon volume
 * Spring physics + GPU-accelerated
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useAnimation } from '../contexts/AnimationContext';
import './VoiceCircle.css';

interface VoiceCircleProps {
  /** Volume audio (0-1) */
  volume?: number;
  /** État du mode vocal */
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  /** Taille du cercle en pixels */
  size?: number;
  /** Activer l'audio-réactivité */
  audioReactive?: boolean;
  /** Couleur personnalisée */
  color?: string;
  /** Intensité du glow (0-2) */
  glowIntensity?: number;
}

export const VoiceCircle: React.FC<VoiceCircleProps> = ({
  volume = 0,
  state = 'idle',
  size = 200,
  audioReactive = true,
  color = '#3b82f6',
  glowIntensity = 1,
}) => {
  const { shouldReduceMotion, shouldThrottle } = useAnimation();
  const [energy, setEnergy] = useState(0);
  const animationRef = useRef<number>();

  // Spring physics pour mouvement fluide (adaptatif selon performance)
  const volumeSpring = useSpring(volume, {
    stiffness: shouldReduceMotion ? 100 : shouldThrottle ? 200 : 300,
    damping: shouldReduceMotion ? 50 : shouldThrottle ? 40 : 30,
    mass: 0.5,
  });

  // Transform volume → scale
  const scale = useTransform(volumeSpring, [0, 1], [1, audioReactive ? 1.4 : 1.1]);
  const opacity = useTransform(volumeSpring, [0, 1], [0.6, 1]);

  // Stabiliser animations (limiter à 30 FPS)
  const lastFrameTimeRef = useRef(0);
  const frameDuration = React.useMemo(() => 1000 / 30, []);

  // Animation continue selon état
  useEffect(() => {
    const startTime = Date.now();

    const animate = (timestamp: number) => {
      // Throttle à 30 FPS
      if (timestamp - lastFrameTimeRef.current < frameDuration) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = timestamp;

      const elapsed = Date.now() - startTime;

      switch (state) {
        case 'listening':
          // Pulsation douce
          setEnergy(0.5 + Math.sin(elapsed / 1000) * 0.3);
          break;
        case 'thinking':
          // Rotation énergétique
          setEnergy(0.7 + Math.sin(elapsed / 500) * 0.2);
          break;
        case 'speaking':
          // Pulsation rapide
          setEnergy(0.8 + Math.sin(elapsed / 300) * 0.15);
          break;
        case 'idle':
        default:
          setEnergy(0.3);
          break;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, frameDuration]);  // Couleur dynamique selon état
  const getStateColor = () => {
    switch (state) {
      case 'listening': return '#06b6d4'; // Cyan
      case 'thinking': return '#8b5cf6'; // Purple
      case 'speaking': return '#3b82f6'; // Blue
      default: return color;
    }
  };

  const currentColor = getStateColor();

  return (
    <div
      className="voice-circle-container"
      style={{ width: size, height: size }}
    >
      {/* Anneaux externes (3 layers) */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={`ring-${index}`}
          className="voice-circle-ring"
          style={{
            width: size + index * 40,
            height: size + index * 40,
            opacity: (0.3 - index * 0.08) * energy,
            borderColor: currentColor,
            borderWidth: 2 - index * 0.5,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [(0.3 - index * 0.08) * energy, 0, (0.3 - index * 0.08) * energy],
          }}
          transition={{
            duration: 2 + index * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.3,
          }}
        />
      ))}

      {/* Cercle principal audio-réactif */}
      <motion.div
        className="voice-circle-main"
        style={{
          width: size,
          height: size,
          scale,
          opacity,
          backgroundColor: currentColor,
          boxShadow: `
            0 0 ${20 * glowIntensity}px ${currentColor}40,
            0 0 ${40 * glowIntensity}px ${currentColor}30,
            0 0 ${60 * glowIntensity}px ${currentColor}20,
            inset 0 0 ${30 * glowIntensity}px ${currentColor}40
          `,
        }}
        animate={{
          rotate: state === 'thinking' ? 360 : 0,
        }}
        transition={{
          rotate: {
            duration: 3,
            repeat: state === 'thinking' ? Infinity : 0,
            ease: 'linear',
          },
        }}
      >
        {/* Gradient interne */}
        <div
          className="voice-circle-gradient"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${currentColor}80, ${currentColor}40)`,
          }}
        />

        {/* Particules internes */}
        {audioReactive && volume > 0.3 && (
          <div className="voice-circle-particles">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="voice-particle"
                style={{
                  backgroundColor: currentColor,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.6, 0],
                  x: Math.cos((i / 8) * Math.PI * 2) * 30,
                  y: Math.sin((i / 8) * Math.PI * 2) * 30,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Label état */}
      <div className="voice-circle-label">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: currentColor }}
        >
          {state.toUpperCase()}
        </motion.span>
      </div>
    </div>
  );
};

export default VoiceCircle;
