/**
 * TITANE_INFINITY v19.3.0 — useParticles Hook
 * React hook for managing particle system with canvas
 *
 * Features:
 * - Automatic canvas setup and resize handling
 * - Particle system lifecycle management
 * - Render loop with RAF
 * - Performance monitoring
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { ParticleSystem, ParticleSystemConfig } from '@/particles/ParticleSystem';
import type { ParticlePattern } from '@/design-system/visual-states';

export interface UseParticlesReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  particleSystem: ParticleSystem | null;
  particleCount: number;
  setPattern: (pattern: ParticlePattern) => void;
  setColors: (colors: string[]) => void;
  setEmissionRate: (rate: number) => void;
  clear: () => void;
}

/**
 * Hook to manage particle system with automatic canvas setup
 *
 * @param config - Particle system configuration
 * @param autoStart - Automatically start particle system (default: true)
 * @returns Particle system management interface
 */
export function useParticles(
  config: Partial<ParticleSystemConfig> = {},
  autoStart = true
): UseParticlesReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef<number>(0);
  const [particleCount, setParticleCount] = useState(0);

  // Initialize particle system
  useEffect(() => {
    const particleSystem = new ParticleSystem(config);
    particleSystemRef.current = particleSystem;

    // Subscribe to particle count updates
    const handleUpdate = (data: { particleCount: number }) => {
      setParticleCount(data.particleCount);
    };

    particleSystem.on('update', handleUpdate);

    return () => {
      particleSystem.off('update', handleUpdate);
      particleSystem.destroy();
      particleSystemRef.current = null;
    };
  }, [config]); // Re-create if config changes

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const particleSystem = particleSystemRef.current;

    if (!canvas || !particleSystem) return;

    const particleConfig = config as Record<string, unknown>;
    const particleCount = (particleConfig.particleCount as number | undefined) ?? 100;
    const velocity = (particleConfig.velocity as number | undefined) ?? 1;
    const lifespan = (particleConfig.lifespan as number | undefined) ?? 5000;

    particleSystem.setEmissionRate(particleCount / 2);
    if ('setVelocity' in particleSystem) {
      (particleSystem as unknown as { setVelocity: (v: number) => void }).setVelocity(
        velocity
      );
    }
    if ('setLifespan' in particleSystem) {
      (particleSystem as unknown as { setLifespan: (l: number) => void }).setLifespan(
        lifespan
      );
    }

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      particleSystem.setCanvas(canvas);
      particleSystem.updateDimensions();
    };

    updateCanvasSize();

    // Handle resize
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [config]);

  // Render loop
  const renderLoop = useCallback((timestamp: number) => {
    const particleSystem = particleSystemRef.current;
    if (!particleSystem) return;

    const deltaTime = timestamp - lastTime.current;
    lastTime.current = timestamp;

    // Update and render
    particleSystem.update(deltaTime);
    particleSystem.render();

    // Continue loop
    rafId.current = requestAnimationFrame(renderLoop);
  }, []);

  // Start/stop render loop
  useEffect(() => {
    const particleSystem = particleSystemRef.current;
    if (!particleSystem) return;

    if (autoStart) {
      particleSystem.start();
      lastTime.current = performance.now();
      rafId.current = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      particleSystem.stop();
    };
  }, [autoStart, renderLoop]);

  // Control methods
  const setPattern = useCallback((pattern: ParticlePattern) => {
    particleSystemRef.current?.setPattern(pattern);
  }, []);

  const setColors = useCallback((colors: string[]) => {
    particleSystemRef.current?.setColors(colors);
  }, []);

  const setEmissionRate = useCallback((rate: number) => {
    particleSystemRef.current?.setEmissionRate(rate);
  }, []);

  const clear = useCallback(() => {
    particleSystemRef.current?.clear();
  }, []);

  return {
    canvasRef,
    particleSystem: particleSystemRef.current,
    particleCount,
    setPattern,
    setColors,
    setEmissionRate,
    clear,
  };
}

export default useParticles;
