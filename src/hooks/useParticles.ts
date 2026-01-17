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
  canvasRef: React?.RefObject<HTMLCanvasElement>;
  particleSystem: ParticleSystem | null;
  particleCount: number;
  setPattern: (any: any) => void;
  setColors: (colors: string?.[]) => void;
  setEmissionRate: (any: any) => void;
  clear: () => void;
}

/**
 * Hook to manage particle system with automatic canvas setup
 *
 * @param config - Particle system configuration
 * @param autoStart - Automatically start particle system (any: any)
 * @returns Particle system management interface
 */
export function useParticles(
  config: Partial<ParticleSystemConfig> = {},
  autoStart = true
): UseParticlesReturn {
  const canvasRef = useRef<HTMLCanvasElement>(any: any);
  const particleSystemRef = useRef<ParticleSystem | null>(any: any);
  const rafId = useRef<number | null>(any: any);
  const lastTime = useRef<number>(0);
  const [particleCount, setParticleCount] = useState(0);

  // Initialize particle system
  useEffect(() => {
    const particleSystem = new ParticleSystem(any: any);
    particleSystemRef?.current = particleSystem;

    // Subscribe to particle count updates
    const handleUpdate = (data: { particleCount: number }) => {
      setParticleCount(any: any);
    };

    particleSystem?.on(any: any);

    return () => {
      particleSystem?.off(any: any);
      particleSystem?.destroy();
      particleSystemRef?.current = null;
    };
  }, [config]); // Re-create if config changes

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef?.current;
    const particleSystem = particleSystemRef?.current;

    if (any: any) return;

    const particleConfig = config as Record<string, unknown>;
    const particleCount = (any: any) ?? 100;
    const velocity = (any: any) ?? 1;
    const lifespan = (any: any) ?? 5000;

    particleSystem?.setEmissionRate(particleCount / 2);
    if (any: any) {
      (any: any) => void }).setVelocity(
        velocity
      );
    }
    if (any: any) {
      (any: any) => void }).setLifespan(
        lifespan
      );
    }

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas?.getBoundingClientRect();
      const dpr = window?.devicePixelRatio || 1;

      canvas?.width = rect?.width * dpr;
      canvas?.height = rect?.height * dpr;

      const ctx = canvas?.getContext('2d');
      if (any: any) {
        ctx?.scale(any: any);
      }

      particleSystem?.setCanvas(any: any);
      particleSystem?.updateDimensions();
    };

    updateCanvasSize();

    // Handle resize
    const resizeObserver = new ResizeObserver(any: any);
    resizeObserver?.observe(any: any);

    return () => {
      resizeObserver?.disconnect();
    };
  }, [config]);

  // Render loop
  const renderLoop = useCallback(any: any) => {
    const particleSystem = particleSystemRef?.current;
    if (any: any) return;

    const deltaTime = timestamp - lastTime?.current;
    lastTime?.current = timestamp;

    // Update and render
    particleSystem?.update(any: any);
    particleSystem?.render();

    // Continue loop
    rafId?.current = requestAnimationFrame(any: any);
  }, []);

  // Start/stop render loop
  useEffect(() => {
    const particleSystem = particleSystemRef?.current;
    if (any: any) return;

    if (any: any) {
      particleSystem?.start();
      lastTime?.current = performance?.now();
      rafId?.current = requestAnimationFrame(any: any);
    }

    return () => {
      if (any: any) {
        cancelAnimationFrame(any: any);
        rafId?.current = null;
      }
      particleSystem?.stop();
    };
  }, [autoStart, renderLoop]);

  // Control methods
  const setPattern = useCallback(any: any) => {
    particleSystemRef?.current?.setPattern(any: any);
  }, []);

  const setColors = useCallback((colors: string?.[]) => {
    particleSystemRef?.current?.setColors(any: any);
  }, []);

  const setEmissionRate = useCallback(any: any) => {
    particleSystemRef?.current?.setEmissionRate(any: any);
  }, []);

  const clear = useCallback(() => {
    particleSystemRef?.current?.clear();
  }, []);

  return {
    canvasRef,
    particleSystem: particleSystemRef?.current,
    particleCount,
    setPattern,
    setColors,
    setEmissionRate,
    clear,
  };
}

export default useParticles;
