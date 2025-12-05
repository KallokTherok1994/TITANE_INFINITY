/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ SINGULARITY FIELD CANVAS v∞
 *
 *   Visualisation Canvas du champ de singularité
 *   - Animation fluide 60fps
 *   - Particules réactives
 *   - Représentation des 6 layers
 *   - Connections inter-engines
 *
 *   Design System: Monochrome TITANE (#C4C4C4 / #727B81)
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useRef, useEffect, useCallback, memo } from 'react';
import { useSingularity } from '@/hooks/useSingularity';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  layer: number;
  energy: number;
  hue: number;
}

interface Connection {
  from: number;
  to: number;
  strength: number;
}

interface FieldCanvasProps {
  width?: number;
  height?: number;
  particleCount?: number;
  showConnections?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const COLORS = {
  background: '#0A0A0A',
  primary: '#C4C4C4',
  secondary: '#727B81',
  text: '#F5F5F5',
};

const LAYER_COLORS = [
  { h: 142, s: 70, l: 45 }, // Physical - Green
  { h: 217, s: 90, l: 60 }, // Cognitive - Blue
  { h: 271, s: 80, l: 65 }, // Symbolic - Purple
  { h: 38, s: 90, l: 55 },  // Adaptive - Orange
  { h: 330, s: 80, l: 60 }, // Meta - Pink
  { h: 0, s: 0, l: 77 },    // Singularity - Silver
];

const LAYER_NAMES = [
  'Physical',
  'Cognitive',
  'Symbolic',
  'Adaptive',
  'Meta',
  'Singularity',
];

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const SingularityFieldCanvas = memo(function SingularityFieldCanvas({
  width = 600,
  height = 400,
  particleCount = 120,
  showConnections = true,
  showLabels = true,
  interactive = true,
}: FieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  const singularity = useSingularity(false);

  // Initialize particles
  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    const particlesPerLayer = Math.floor(particleCount / 6);

    for (let layer = 0; layer < 6; layer++) {
      const layerRadius = ((layer + 1) / 6) * (Math.min(width, height) / 2 - 40);
      const color = LAYER_COLORS[layer];

      for (let i = 0; i < particlesPerLayer; i++) {
        const angle = (i / particlesPerLayer) * Math.PI * 2 + Math.random() * 0.5;
        const distance = layerRadius * (0.8 + Math.random() * 0.4);

        particles.push({
          x: width / 2 + Math.cos(angle) * distance,
          y: height / 2 + Math.sin(angle) * distance,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: 2 + Math.random() * 3,
          layer,
          energy: 0.5 + Math.random() * 0.5,
          hue: color.h,
        });
      }
    }

    particlesRef.current = particles;

    // Generate connections
    const connections: Connection[] = [];
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        if (Math.abs(particles[i].layer - particles[j].layer) <= 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 60) {
            connections.push({
              from: i,
              to: j,
              strength: 1 - distance / 60,
            });
          }
        }
      }
    }
    connectionsRef.current = connections;
  }, [width, height, particleCount]);

  // Update particle positions
  const updateParticles = useCallback(() => {
    const particles = particlesRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    const mouse = mouseRef.current;

    // Get singularity field values
    const field = singularity.field || {
      energy: 0.7,
      motion: 0.7,
      symbolism: 0.7,
      depth: 0.7,
      presence: 0.7,
    };

    const motionFactor = field.motion;
    const energyFactor = field.energy;

    particles.forEach((particle, _index) => {
      // Layer orbital force
      const layerRadius = ((particle.layer + 1) / 6) * (Math.min(width, height) / 2 - 40);
      const dx = particle.x - centerX;
      const dy = particle.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Orbital motion
      const angle = Math.atan2(dy, dx);
      const orbitalSpeed = 0.002 * motionFactor * (6 - particle.layer + 1);

      // Apply orbital velocity
      particle.vx += Math.cos(angle + Math.PI / 2) * orbitalSpeed;
      particle.vy += Math.sin(angle + Math.PI / 2) * orbitalSpeed;

      // Spring force to maintain layer distance
      const springForce = (layerRadius - distance) * 0.001;
      particle.vx += (dx / distance) * springForce;
      particle.vy += (dy / distance) * springForce;

      // Mouse interaction
      if (interactive && mouse.active) {
        const mouseDx = particle.x - mouse.x;
        const mouseDy = particle.y - mouse.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

        if (mouseDistance < 100) {
          const repulsion = (100 - mouseDistance) * 0.002;
          particle.vx += (mouseDx / mouseDistance) * repulsion;
          particle.vy += (mouseDy / mouseDistance) * repulsion;
        }
      }

      // Apply consciousness/coherence effect
      const consciousness = singularity.consciousness || 1;
      const coherenceFactor = consciousness / 4;

      // Higher coherence = more stable particles
      particle.vx *= 0.98 - coherenceFactor * 0.01;
      particle.vy *= 0.98 - coherenceFactor * 0.01;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update energy based on singularity
      particle.energy = 0.5 + energyFactor * 0.5;

      // Boundary wrapping
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;
    });

    // Update connections
    const connections = connectionsRef.current;
    connections.length = 0;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        if (Math.abs(particles[i].layer - particles[j].layer) <= 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            connections.push({
              from: i,
              to: j,
              strength: 1 - dist / 60,
            });
          }
        }
      }
    }
  }, [width, height, interactive, singularity.field, singularity.consciousness]);

  // Render frame
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = particlesRef.current;
    const connections = connectionsRef.current;

    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Draw layer rings
    const centerX = width / 2;
    const centerY = height / 2;

    for (let layer = 0; layer < 6; layer++) {
      const layerRadius = ((layer + 1) / 6) * (Math.min(width, height) / 2 - 40);
      const color = LAYER_COLORS[layer];

      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw connections
    if (showConnections) {
      connections.forEach((connection) => {
        const from = particles[connection.from];
        const to = particles[connection.to];
        const avgLayer = Math.floor((from.layer + to.layer) / 2);
        const color = LAYER_COLORS[avgLayer];

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${connection.strength * 0.3})`;
        ctx.lineWidth = connection.strength * 2;
        ctx.stroke();
      });
    }

    // Draw particles
    particles.forEach((particle) => {
      const color = LAYER_COLORS[particle.layer];
      const glow = particle.energy * 10;

      // Glow effect
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius + glow
      );
      gradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${particle.energy})`);
      gradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius + glow, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
      ctx.fill();
    });

    // Draw labels
    if (showLabels) {
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';

      for (let layer = 0; layer < 6; layer++) {
        const layerRadius = ((layer + 1) / 6) * (Math.min(width, height) / 2 - 40);
        const color = LAYER_COLORS[layer];

        ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.7)`;
        ctx.fillText(LAYER_NAMES[layer], centerX, centerY - layerRadius - 8);
      }
    }

    // Draw center (Singularity core)
    const corePulse = 0.5 + Math.sin(Date.now() / 500) * 0.2;
    const coreSize = 8 + corePulse * 4;

    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize + 10);
    coreGradient.addColorStop(0, `rgba(196, 196, 196, ${corePulse})`);
    coreGradient.addColorStop(1, 'rgba(196, 196, 196, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreSize + 10, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.primary;
    ctx.fill();

    // Draw info overlay
    const consciousness = singularity.consciousness || 0;
    const coherence = singularity.autoCoherence || 0;

    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.secondary;
    ctx.fillText(`Consciousness: ${consciousness.toFixed(2)}/4`, 10, 20);
    ctx.fillText(`Coherence: ${(coherence * 100).toFixed(0)}%`, 10, 35);
  }, [width, height, showConnections, showLabels, singularity.consciousness, singularity.autoCoherence]);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, render]);

  // Initialize and start animation
  useEffect(() => {
    initParticles();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, animate]);

  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      style={{
        background: COLORS.background,
        borderRadius: '12px',
        cursor: interactive ? 'crosshair' : 'default',
      }}
    />
  );
});

export default SingularityFieldCanvas;
