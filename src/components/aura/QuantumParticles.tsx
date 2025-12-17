/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.1 — QUANTUM PARTICLES
 *   Background interactif canvas-based avec particules quantiques
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  baseOpacity: number;
}

interface QuantumParticlesProps {
  /** Nombre de particules (default: 100) */
  count?: number;
  /** Connexion distance max (default: 120) */
  connectionDistance?: number;
  /** Mouse attraction radius (default: 150) */
  mouseRadius?: number;
  /** Mouse attraction force (default: 0.02) */
  mouseForce?: number;
  /** Couleurs particules (default: violet + cyan) */
  colors?: string[];
  /** Opacité globale (default: 0.5) */
  opacity?: number;
  /** Activer/désactiver (default: true) */
  enabled?: boolean;
  /** Z-index (default: 0) */
  zIndex?: number;
}

/* ═══════════════════════════════════════════════════════════════
   QUANTUM PARTICLES COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export const QuantumParticles: React.FC<QuantumParticlesProps> = ({
  count = 100,
  connectionDistance = 120,
  mouseRadius = 150,
  mouseForce = 0.02,
  colors = [
    'rgba(124, 58, 237, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(59, 130, 246, 0.8)',
  ],
  opacity = 0.5,
  enabled = true,
  zIndex = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0, active: false });
  const animationFrameId = useRef<number>();

  /* ═══ INITIALIZE PARTICLES ═══ */
  const initParticles = useCallback(
    (width: number, height: number) => {
      particles.current = Array.from({ length: count }, () => {
        const baseOpacity = Math.random() * 0.5 + 0.3;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: baseOpacity,
          baseOpacity,
        };
      });
    },
    [count, colors]
  );

  /* ═══ UPDATE PARTICLE POSITION ═══ */
  const updateParticle = useCallback(
    (p: Particle, width: number, height: number) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce on edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Keep within bounds
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));

      // Mouse attraction
      if (mouse.current.active) {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          const force = ((mouseRadius - dist) / mouseRadius) * mouseForce;
          p.vx += dx * force;
          p.vy += dy * force;

          // Increase opacity near mouse
          p.opacity = Math.min(
            1,
            p.baseOpacity + ((mouseRadius - dist) / mouseRadius) * 0.5
          );
        } else {
          // Fade back to base opacity
          p.opacity += (p.baseOpacity - p.opacity) * 0.05;
        }
      } else {
        // Fade back to base opacity
        p.opacity += (p.baseOpacity - p.opacity) * 0.05;
      }

      // Damping (friction)
      p.vx *= 0.99;
      p.vy *= 0.99;
    },
    [mouseRadius, mouseForce]
  );

  /* ═══ DRAW PARTICLE ═══ */
  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, p: Particle) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color.replace('0.8', p.opacity.toString());
    ctx.fill();

    // Add glow effect
    ctx.shadowBlur = p.size * 3;
    ctx.shadowColor = p.color;
  }, []);

  /* ═══ DRAW CONNECTION ═══ */
  const drawConnection = useCallback(
    (ctx: CanvasRenderingContext2D, p1: Particle, p2: Particle, dist: number) => {
      const opacity = (connectionDistance - dist) / connectionDistance;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(124, 58, 237, ${opacity * 0.3 * p1.opacity * p2.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    [connectionDistance]
  );

  /* ═══ ANIMATION LOOP ═══ */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = 0;

    // Update and draw particles
    particles.current.forEach(p => {
      updateParticle(p, width, height);
      drawParticle(ctx, p);
    });

    // Draw connections
    particles.current.forEach((p1, i) => {
      particles.current.slice(i + 1).forEach(p2 => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          drawConnection(ctx, p1, p2, dist);
        }
      });
    });

    // Continue animation
    animationFrameId.current = requestAnimationFrame(animate);
  }, [enabled, updateParticle, drawParticle, drawConnection, connectionDistance]);

  /* ═══ MOUSE TRACKING ═══ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouse.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled]);

  /* ═══ INITIALIZE & RESIZE ═══ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [enabled, initParticles]);

  /* ═══ START ANIMATION ═══ */
  useEffect(() => {
    if (!enabled) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [enabled, animate]);

  /* ═══ RENDER ═══ */
  if (!enabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex,
        opacity,
      }}
      aria-hidden="true"
    />
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOOKS - useQuantumParticles
   ═══════════════════════════════════════════════════════════════ */

/**
 * Hook pour contrôler les particules quantiques
 * Usage:
 *   const particles = useQuantumParticles();
 *   particles.setEnabled(true);
 *   particles.setIntensity(0.8);
 */
export const useQuantumParticles = () => {
  const [enabled, setEnabled] = React.useState(true);
  const [intensity, setIntensity] = React.useState(0.5);

  return {
    enabled,
    setEnabled,
    intensity,
    setIntensity,
  };
};

/* ═══════════════════════════════════════════════════════════════
   PRESETS - Configuration prédéfinies
   ═══════════════════════════════════════════════════════════════ */

export const QuantumParticlesPresets = {
  /** Minimal - Performance optimale */
  minimal: {
    count: 50,
    connectionDistance: 80,
    mouseRadius: 100,
    mouseForce: 0.015,
    opacity: 0.3,
  },

  /** Default - Équilibré */
  default: {
    count: 100,
    connectionDistance: 120,
    mouseRadius: 150,
    mouseForce: 0.02,
    opacity: 0.5,
  },

  /** Intense - Maximum wow effect */
  intense: {
    count: 150,
    connectionDistance: 150,
    mouseRadius: 200,
    mouseForce: 0.03,
    opacity: 0.7,
  },

  /** Rainbow - Multi-couleurs */
  rainbow: {
    count: 120,
    connectionDistance: 130,
    mouseRadius: 180,
    mouseForce: 0.025,
    opacity: 0.6,
    colors: [
      'rgba(124, 58, 237, 0.8)', // Violet
      'rgba(59, 130, 246, 0.8)', // Blue
      'rgba(6, 182, 212, 0.8)', // Cyan
      'rgba(16, 185, 129, 0.8)', // Emerald
      'rgba(251, 146, 60, 0.8)', // Amber
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   EXPORT DEFAULT
   ═══════════════════════════════════════════════════════════════ */

export default QuantumParticles;
