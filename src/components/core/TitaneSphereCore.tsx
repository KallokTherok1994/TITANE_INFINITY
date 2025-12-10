/**
 * TITANE∞ v21 — Sphere Core Component
 * Noyau visuel central avec polish signature
 *
 * Features:
 * - Sphere centrale respirante avec Identity Pulse
 * - Anneaux orbitaux avec phase shift et resonance
 * - Ombres dynamiques basées sur intensity + emotional colorimetry
 * - Micro-déformations de surface (living surface effect)
 * - Glow directionnel adaptatif (cursor/orientation based)
 * - GPU-accelerated rendering
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  IdentityPulse,
  type PulseWaveform,
} from '@/visual-engine/signature/IdentityPulse';
import {
  OrbitalSignature,
  type OrbitalSnapshot,
} from '@/visual-engine/signature/OrbitalSignature';
import { CognitiveState, EmotionalTone } from '@/design-system/visual-states';

export interface TitaneSphereConfig {
  size: number; // px diameter
  cognitiveState: CognitiveState;
  emotionalTone: EmotionalTone;
  intensity: number; // 0-1
  enableDynamicShadows: boolean;
  enableMicroDeformations: boolean;
  enableDirectionalGlow: boolean;
  enablePhaseShift: boolean;
}

export interface TitaneSphereProps {
  config: TitaneSphereConfig;
  className?: string;
}

const DEFAULT_CONFIG: TitaneSphereConfig = {
  size: 200,
  cognitiveState: CognitiveState.IDLE,
  emotionalTone: EmotionalTone.CALM,
  intensity: 0.5,
  enableDynamicShadows: true,
  enableMicroDeformations: true,
  enableDirectionalGlow: true,
  enablePhaseShift: true,
};

export const TitaneSphereCore: React.FC<TitaneSphereProps> = ({
  config = DEFAULT_CONFIG,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const identityPulseRef = useRef<IdentityPulse | null>(null);
  const orbitalSignatureRef = useRef<OrbitalSignature | null>(null);

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Initialize signature engines
  useEffect(() => {
    identityPulseRef.current = new IdentityPulse();
    orbitalSignatureRef.current = new OrbitalSignature(3, config.size * 0.6);

    return () => {
      identityPulseRef.current = null;
      orbitalSignatureRef.current = null;
    };
  }, [config.size]);

  // Update signature engines on state change
  useEffect(() => {
    identityPulseRef.current?.updateState(
      config.cognitiveState,
      config.emotionalTone,
      config.intensity
    );
    orbitalSignatureRef.current?.updateState(
      config.cognitiveState,
      config.emotionalTone,
      config.intensity
    );
  }, [config.cognitiveState, config.emotionalTone, config.intensity]);

  // Track mouse position for directional glow
  useEffect(() => {
    if (!config.enableDirectionalGlow) return;

    const handleMouseMove = (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [config.enableDirectionalGlow]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = config.size / 2;
    const centerY = config.size / 2;

    const render = () => {
      const timestamp = Date.now();

      // Update signature engines
      const pulseWaveform: PulseWaveform = identityPulseRef.current?.update(
        timestamp
      ) || {
        glowIntensity: 0.5,
        scale: 1.0,
        hue: 0,
        saturation: 0,
        deformation: 0,
        phase: 0,
        velocity: 0,
        timestamp,
        deltaTime: 0,
      };

      const orbitalSnapshot: OrbitalSnapshot = orbitalSignatureRef.current?.update(
        timestamp
      ) || {
        rings: [],
        coherence: 1.0,
        energy: 0.5,
        timestamp,
        deltaTime: 0,
      };

      // Clear canvas
      ctx.clearRect(0, 0, config.size, config.size);

      // ──────────────────────────────────────────────────────────
      // 1. DYNAMIC SHADOWS (based on intensity + emotional color)
      // ──────────────────────────────────────────────────────────
      if (config.enableDynamicShadows) {
        const shadowIntensity = config.intensity * pulseWaveform.glowIntensity;
        const shadowBlur = 20 + shadowIntensity * 30;
        const shadowColor = `hsla(${pulseWaveform.hue}, ${pulseWaveform.saturation * 100}%, 50%, ${shadowIntensity * 0.6})`;

        ctx.save();
        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = shadowColor;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // ──────────────────────────────────────────────────────────
      // 2. CENTRAL SPHERE with MICRO-DEFORMATIONS
      // ──────────────────────────────────────────────────────────
      const baseRadius = (config.size / 2) * 0.4 * pulseWaveform.scale;
      const deformationAmount = config.enableMicroDeformations
        ? pulseWaveform.deformation
        : 0;

      ctx.save();
      ctx.beginPath();

      // Draw deformed circle (living surface)
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const deformation =
          Math.sin(angle * 3 + pulseWaveform.phase) * deformationAmount * 5;
        const radius = baseRadius + deformation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Fill with gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        baseRadius
      );
      gradient.addColorStop(
        0,
        `hsla(${pulseWaveform.hue}, ${pulseWaveform.saturation * 100}%, 70%, 1)`
      );
      gradient.addColorStop(
        0.7,
        `hsla(${pulseWaveform.hue}, ${pulseWaveform.saturation * 100}%, 50%, 0.8)`
      );
      gradient.addColorStop(
        1,
        `hsla(${pulseWaveform.hue}, ${pulseWaveform.saturation * 100}%, 30%, 0.4)`
      );

      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.restore();

      if (config.enableDynamicShadows) {
        ctx.restore();
      }

      // ──────────────────────────────────────────────────────────
      // 3. DIRECTIONAL ADAPTIVE GLOW (cursor-based)
      // ──────────────────────────────────────────────────────────
      if (config.enableDirectionalGlow) {
        const dx = mousePosition.x - centerX;
        const dy = mousePosition.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = config.size;

        if (distance < maxDistance) {
          const influence = 1 - distance / maxDistance;
          const glowAngle = Math.atan2(dy, dx);

          const glowX = centerX + Math.cos(glowAngle) * baseRadius * 0.8;
          const glowY = centerY + Math.sin(glowAngle) * baseRadius * 0.8;

          const glowGradient = ctx.createRadialGradient(
            glowX,
            glowY,
            0,
            glowX,
            glowY,
            baseRadius * 0.6
          );

          glowGradient.addColorStop(
            0,
            `hsla(${pulseWaveform.hue}, 80%, 80%, ${influence * 0.6})`
          );
          glowGradient.addColorStop(1, `hsla(${pulseWaveform.hue}, 80%, 80%, 0)`);

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = glowGradient;
          ctx.fillRect(0, 0, config.size, config.size);
          ctx.restore();
        }
      }

      // ──────────────────────────────────────────────────────────
      // 4. ORBITAL RINGS with PHASE SHIFT
      // ──────────────────────────────────────────────────────────
      orbitalSnapshot.rings.forEach((ring, index) => {
        const phaseShiftOffset = config.enablePhaseShift ? index * 0.3 : 0;
        const adjustedAngle = ring.angle + phaseShiftOffset;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(adjustedAngle);

        // Ring path
        ctx.beginPath();
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);

        // Gradient stroke
        const ringGradient = ctx.createLinearGradient(-ring.radius, 0, ring.radius, 0);
        ringGradient.addColorStop(0, `hsla(${pulseWaveform.hue}, 60%, 60%, 0)`);
        ringGradient.addColorStop(
          0.5,
          `hsla(${pulseWaveform.hue}, 60%, 60%, ${ring.opacity})`
        );
        ringGradient.addColorStop(1, `hsla(${pulseWaveform.hue}, 60%, 60%, 0)`);

        ctx.strokeStyle = ringGradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      });

      // ──────────────────────────────────────────────────────────
      // 5. COHERENCE INDICATOR (subtle ring pulse)
      // ──────────────────────────────────────────────────────────
      const coherenceRadius = baseRadius * (1.5 + orbitalSnapshot.coherence * 0.3);
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, coherenceRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${pulseWaveform.hue}, 50%, 50%, ${orbitalSnapshot.coherence * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config, mousePosition]);

  return (
    <canvas
      ref={canvasRef}
      width={config.size}
      height={config.size}
      className={`titane-sphere-core ${className}`}
      style={{
        display: 'block',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    />
  );
};

export default TitaneSphereCore;
