// ⚡ TITANE∞ v21 — Hooks pour les moteurs visuels
// Hooks React pour utiliser Glow Engine, Motion Engine, State Engine

import { useState, useEffect, useMemo, useCallback } from 'react';
import { glowEngine, GlowConfig } from './GLOW_ENGINE';
import { motionEngine, MotionConfig, MotionType } from './MOTION_ENGINE';
import { stateEngine, SystemState, StateVisualConfig } from './STATE_ENGINE';
import { DS_COLORS } from './DS_COLORS';

// 🌟 Hook: useGlowEngine
// Génère un glow data-driven pour un module
export function useGlowEngine(moduleName: string, value: number) {
  const [glowStyles, setGlowStyles] = useState<Record<string, string>>({});

  useEffect(() => {
    const glowConfig = glowEngine.generateModuleGlow(moduleName, value);
    if (glowConfig) {
      const styles = glowEngine.generateGlowCSS(glowConfig);
      setGlowStyles(styles);
    }
  }, [moduleName, value]);

  return glowStyles;
}

// 🌊 Hook: useMotionEngine
// Génère un mouvement data-driven pour un module
export function useMotionEngine(moduleName: string, value: number) {
  const [motionStyles, setMotionStyles] = useState<Record<string, string>>({});

  useEffect(() => {
    const motionConfig = motionEngine.getModuleMotion(moduleName, value);
    if (motionConfig) {
      const styles = motionEngine.generateMotionCSS(motionConfig);
      setMotionStyles(styles);
    }
  }, [moduleName, value]);

  return motionStyles;
}

// 🎭 Hook: useSystemState
// Gère l'état système global avec configuration visuelle
export function useSystemState(initialState: SystemState = 'null') {
  const [state, setState] = useState<SystemState>(initialState);
  const [config, setConfig] = useState<StateVisualConfig>(stateEngine.getStateConfig(initialState));

  useEffect(() => {
    // S'abonner aux changements d'état
    const unsubscribe = stateEngine.onStateChange((newState, newConfig) => {
      setState(newState);
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  const updateState = useCallback((newState: SystemState) => {
    stateEngine.setState(newState);
  }, []);

  const updateStateFromMetrics = useCallback(
    (metrics: { cpu?: number; memory?: number; errors?: number; connections?: number }) => {
      const newState = stateEngine.determineStateFromMetrics(metrics);
      stateEngine.setState(newState);
    },
    []
  );

  return {
    state,
    config,
    updateState,
    updateStateFromMetrics,
  };
}

// ✨ Hook: useLiveGlow
// Glow vivant qui réagit à une valeur en temps réel
export function useLiveGlow(value: number, colorModule: keyof typeof DS_COLORS) {
  const glowVariables = useMemo(() => {
    const colorConfig = DS_COLORS[colorModule];
    if (!colorConfig || typeof colorConfig === 'string') return {};
    if (!('hex' in colorConfig) || !('rgb' in colorConfig)) return {};

    const intensity = value / 100;
    const blur = 8 + intensity * 12;

    return {
      '--live-glow-color': colorConfig.hex,
      '--live-glow-rgb': colorConfig.rgb,
      '--live-glow-intensity': intensity.toString(),
      '--live-glow-blur': `${blur}px`,
    };
  }, [value, colorModule]);

  return glowVariables;
}

// 💫 Hook: useLivePulse
// Pulse vivant synchronisé avec une métrique
export function useLivePulse(value: number, minSpeed: number = 3000, maxSpeed: number = 500) {
  const pulseSpeed = useMemo(() => {
    const normalized = Math.max(0, Math.min(100, value)) / 100;
    return Math.round(minSpeed - normalized * (minSpeed - maxSpeed));
  }, [value, minSpeed, maxSpeed]);

  return {
    '--pulse-speed': `${pulseSpeed}ms`,
  };
}

// 🎨 Hook: useModuleGlow
// Glow complet pour un module cognitif (variables CSS)
export function useModuleGlow(moduleName: string, value: number) {
  const glowVariables = useMemo(() => {
    return glowEngine.generateModuleGlowVariables(moduleName, value);
  }, [moduleName, value]);

  return glowVariables;
}

// 🌀 Hook: useStateGlow
// Glow selon l'état système
export function useStateGlow(state: SystemState) {
  const glowConfig = useMemo(() => {
    return glowEngine.generateStateGlow(state);
  }, [state]);

  const glowStyles = useMemo(() => {
    return glowEngine.generateGlowCSS(glowConfig);
  }, [glowConfig]);

  return glowStyles;
}

// 🎭 Hook: useStateMotion
// Mouvement selon l'état système
export function useStateMotion(state: SystemState) {
  const motionConfig = useMemo(() => {
    return motionEngine.generateStateMotion(state);
  }, [state]);

  const motionStyles = useMemo(() => {
    return motionEngine.generateMotionCSS(motionConfig);
  }, [motionConfig]);

  return motionStyles;
}

// 🔥 Hook: useDualToneGlow
// Glow dual-tone (signature TITANE∞)
export function useDualToneGlow(
  primaryModule: keyof typeof DS_COLORS,
  secondaryModule: keyof typeof DS_COLORS,
  intensity: number = 0.3
) {
  const dualGlow = useMemo(() => {
    const primary = DS_COLORS[primaryModule];
    const secondary = DS_COLORS[secondaryModule];

    if (!primary || !secondary || typeof primary === 'string' || typeof secondary === 'string') {
      return {};
    }
    if (!('rgb' in primary) || !('rgb' in secondary)) {
      return {};
    }

    const boxShadow = glowEngine.generateDualToneGlow(primary.rgb, secondary.rgb, intensity);

    return {
      boxShadow,
      '--dual-primary-rgb': primary.rgb,
      '--dual-secondary-rgb': secondary.rgb,
      '--dual-intensity': intensity.toString(),
    };
  }, [primaryModule, secondaryModule, intensity]);

  return dualGlow;
}

// 🧬 Hook: useAdaptiveMotion
// Mouvement adaptatif selon valeur (amplitude variable)
export function useAdaptiveMotion(
  type: MotionType,
  value: number,
  minAmplitude: number = 2,
  maxAmplitude: number = 8
) {
  const motionConfig = useMemo(() => {
    return motionEngine.createDataDrivenMotion(type, value, minAmplitude, maxAmplitude);
  }, [type, value, minAmplitude, maxAmplitude]);

  const motionStyles = useMemo(() => {
    return motionEngine.generateMotionCSS(motionConfig);
  }, [motionConfig]);

  return motionStyles;
}

// 🎨 Hook: useCombinedVisuals
// Combine glow + motion pour un module (hook complet)
export function useCombinedVisuals(moduleName: string, value: number) {
  const glowStyles = useGlowEngine(moduleName, value);
  const motionStyles = useMotionEngine(moduleName, value);

  const combinedStyles = useMemo(() => {
    return {
      ...glowStyles,
      ...motionStyles,
    };
  }, [glowStyles, motionStyles]);

  return combinedStyles;
}

// 📊 Hook: useSystemMetrics
// Gestion des métriques système avec état visuel automatique
export function useSystemMetrics(initialMetrics?: {
  cpu?: number;
  memory?: number;
  errors?: number;
  connections?: number;
}) {
  const [metrics, setMetrics] = useState(initialMetrics || { cpu: 0, memory: 0, errors: 0, connections: 0 });
  const { state, config } = useSystemState();

  useEffect(() => {
    stateEngine.setState(stateEngine.determineStateFromMetrics(metrics));
  }, [metrics]);

  const updateMetrics = useCallback((newMetrics: Partial<typeof metrics>) => {
    setMetrics((prev) => ({ ...prev, ...newMetrics }));
  }, []);

  return {
    metrics,
    updateMetrics,
    state,
    visualConfig: config,
  };
}
