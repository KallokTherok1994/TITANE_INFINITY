/**
 * TITANE_INFINITY v∞.37 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   HOLOPRESENCE VISUAL COMPONENT v∞.37
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef } from 'react';
import { useHoloPresence, useHoloPresenceActions } from '@/hooks/useHoloPresence';

interface HoloPresenceVisualizerProps {
  width?: number;
  height?: number;
  className?: string;
}

export const HoloPresenceVisualizer: React.FC<HoloPresenceVisualizerProps> = ({
  width = 400,
  height = 400,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const holoState = useHoloPresence();
  const actions = useHoloPresenceActions();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { visuals, particles, animation } = holoState;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw main shape
      const shapeSize = visuals.size * 150; // Scale to pixels

      ctx.save();
      ctx.globalAlpha = visuals.opacity;
      ctx.filter = `blur(${visuals.blur * 5}px)`;

      // Main shape (simplified sphere/circle for now)
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        shapeSize
      );
      gradient.addColorStop(0, visuals.colors.primary);
      gradient.addColorStop(0.5, visuals.colors.secondary);
      gradient.addColorStop(1, visuals.colors.accent);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, shapeSize, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect
      if (visuals.glow > 0.3) {
        ctx.shadowBlur = visuals.glow * 30;
        ctx.shadowColor = visuals.colors.glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shapeSize, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Draw particles (simplified)
      ctx.save();
      for (let i = 0; i < Math.min(particles.count, 50); i++) {
        const angle = (i / particles.count) * Math.PI * 2 + Date.now() / 1000;
        const distance = particles.spread * shapeSize * 1.5;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        ctx.fillStyle = particles.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, y, particles.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [holoState, width, height]);

  return (
    <div className={`holo-presence-visualizer ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="holo-canvas"
      />
      <div className="holo-controls">
        <button onClick={() => actions.flash()}>Flash</button>
        <button onClick={() => actions.pulse()}>Pulse</button>
        <button onClick={() => actions.burst()}>Burst</button>
      </div>
    </div>
  );
};
