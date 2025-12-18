/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.1 — AURA ORCHESTRATOR HOOK
 *   Système de gestion et synchronisation globale des effets Aura
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

export type AuraIntensity = 'minimal' | 'low' | 'medium' | 'high' | 'maximum';
export type AuraMode = 'disabled' | 'static' | 'dynamic' | 'reactive' | 'quantum';
export type AuraTheme = 'default' | 'ocean' | 'sunset' | 'forest' | 'fire' | 'rainbow';

export interface AuraConfig {
  enabled: boolean;
  intensity: AuraIntensity;
  mode: AuraMode;
  theme: AuraTheme;
  particlesEnabled: boolean;
  particleCount: number;
  connectionDistance: number;
  mouseAttraction: boolean;
  fps: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

export interface AuraActivity {
  id: string;
  type: 'message' | 'xp' | 'vision' | 'mode-switch' | 'milestone' | 'interaction';
  timestamp: number;
  intensity: number;
}

interface AuraOrchestratorState {
  // Configuration
  config: AuraConfig;

  // État runtime
  globalIntensity: number;
  activeActivities: AuraActivity[];
  performanceMetrics: {
    fps: number;
    lastFrame: number;
    dropFrames: number;
  };

  // Actions
  setEnabled: (enabled: boolean) => void;
  setIntensity: (intensity: AuraIntensity) => void;
  setMode: (mode: AuraMode) => void;
  setTheme: (theme: AuraTheme) => void;
  setParticlesEnabled: (enabled: boolean) => void;
  setQuality: (quality: AuraConfig['quality']) => void;

  // Activity tracking
  registerActivity: (activity: Omit<AuraActivity, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;

  // Performance
  updateFPS: (fps: number) => void;
  getRecommendedQuality: () => AuraConfig['quality'];

  // Presets
  applyPreset: (
    preset: 'minimal' | 'balanced' | 'performance' | 'quality' | 'maximum'
  ) => void;
  resetToDefault: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   DEFAULT CONFIG
   ═══════════════════════════════════════════════════════════════ */

const DEFAULT_CONFIG: AuraConfig = {
  enabled: true,
  intensity: 'medium',
  mode: 'dynamic',
  theme: 'default',
  particlesEnabled: true,
  particleCount: 100,
  connectionDistance: 120,
  mouseAttraction: true,
  fps: 60,
  quality: 'high',
};

/* ═══════════════════════════════════════════════════════════════
   INTENSITY MAPPING
   ═══════════════════════════════════════════════════════════════ */

const INTENSITY_VALUES: Record<AuraIntensity, number> = {
  minimal: 0.2,
  low: 0.4,
  medium: 0.6,
  high: 0.8,
  maximum: 1.0,
};

const INTENSITY_PARTICLE_COUNTS: Record<AuraIntensity, number> = {
  minimal: 50,
  low: 75,
  medium: 100,
  high: 125,
  maximum: 150,
};

/* ═══════════════════════════════════════════════════════════════
   STORE
   ═══════════════════════════════════════════════════════════════ */

export const useAuraOrchestrator = create<AuraOrchestratorState>()(
  persist(
    (set, get) => ({
      // État initial
      config: DEFAULT_CONFIG,
      globalIntensity: INTENSITY_VALUES.medium,
      activeActivities: [],
      performanceMetrics: {
        fps: 60,
        lastFrame: 0,
        dropFrames: 0,
      },

      // ═══ CONFIGURATION ACTIONS ═══

      setEnabled: enabled => {
        set(state => ({
          config: { ...state.config, enabled },
          globalIntensity: enabled ? INTENSITY_VALUES[state.config.intensity] : 0,
        }));
      },

      setIntensity: intensity => {
        set(state => ({
          config: {
            ...state.config,
            intensity,
            particleCount: INTENSITY_PARTICLE_COUNTS[intensity],
          },
          globalIntensity: INTENSITY_VALUES[intensity],
        }));
      },

      setMode: mode => {
        set(state => ({
          config: { ...state.config, mode },
        }));
      },

      setTheme: theme => {
        set(state => ({
          config: { ...state.config, theme },
        }));

        // Appliquer le thème aux CSS variables
        if (typeof document !== 'undefined') {
          const themes = {
            ocean: [
              'rgba(6, 182, 212, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(124, 58, 237, 0.8)',
            ],
            sunset: [
              'rgba(236, 72, 153, 0.8)',
              'rgba(251, 146, 60, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            forest: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(132, 204, 22, 0.8)',
              'rgba(52, 211, 153, 0.8)',
            ],
            fire: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(251, 146, 60, 0.8)',
              'rgba(253, 224, 71, 0.8)',
            ],
            rainbow: [
              'rgba(124, 58, 237, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(6, 182, 212, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(251, 146, 60, 0.8)',
            ],
            default: [
              'rgba(124, 58, 237, 0.8)',
              'rgba(6, 182, 212, 0.8)',
              'rgba(59, 130, 246, 0.8)',
            ],
          };

          const colors = themes[theme] || themes.default;
          document.documentElement.style.setProperty(
            '--aura-theme-colors',
            colors.join(', ')
          );
        }
      },

      setParticlesEnabled: enabled => {
        set(state => ({
          config: { ...state.config, particlesEnabled: enabled },
        }));
      },

      setQuality: quality => {
        const qualitySettings = {
          low: { particleCount: 50, connectionDistance: 80, fps: 30 },
          medium: { particleCount: 75, connectionDistance: 100, fps: 45 },
          high: { particleCount: 100, connectionDistance: 120, fps: 60 },
          ultra: { particleCount: 150, connectionDistance: 150, fps: 60 },
        };

        const settings = qualitySettings[quality];

        set(state => ({
          config: {
            ...state.config,
            quality,
            particleCount: settings.particleCount,
            connectionDistance: settings.connectionDistance,
            fps: settings.fps,
          },
        }));
      },

      // ═══ ACTIVITY TRACKING ═══

      registerActivity: activity => {
        const newActivity: AuraActivity = {
          ...activity,
          id: `${activity.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        set(state => {
          // Limiter à 10 activités max pour performance
          const activities = [...state.activeActivities, newActivity].slice(-10);

          // Calculer intensité globale basée sur activités récentes (dernière seconde)
          const now = Date.now();
          const recentActivities = activities.filter(a => now - a.timestamp < 1000);
          const intensityBoost = Math.min(
            1,
            recentActivities.reduce((sum, a) => sum + a.intensity, 0) / 5
          );

          return {
            activeActivities: activities,
            globalIntensity: Math.min(1, state.globalIntensity + intensityBoost * 0.2),
          };
        });

        // Auto-decay global intensity
        setTimeout(() => {
          set(state => ({
            globalIntensity: Math.max(
              INTENSITY_VALUES[state.config.intensity],
              state.globalIntensity * 0.95
            ),
          }));
        }, 500);
      },

      clearActivities: () => {
        set({ activeActivities: [] });
      },

      // ═══ PERFORMANCE ═══

      updateFPS: fps => {
        set(state => ({
          performanceMetrics: {
            ...state.performanceMetrics,
            fps,
            lastFrame: Date.now(),
            dropFrames: fps < 30 ? state.performanceMetrics.dropFrames + 1 : 0,
          },
        }));

        // Auto-adjust quality si trop de frames drop
        const { dropFrames } = get().performanceMetrics;
        if (dropFrames > 60) {
          // 1 seconde de frames drop
          const currentQuality = get().config.quality;
          const qualities: AuraConfig['quality'][] = ['low', 'medium', 'high', 'ultra'];
          const currentIndex = qualities.indexOf(currentQuality);

          if (currentIndex > 0) {
            get().setQuality(qualities[currentIndex - 1]!);
            console.warn(
              `🎨 Aura: Auto-downgrade quality to ${qualities[currentIndex - 1]} (low FPS detected)`
            );
          }
        }
      },

      getRecommendedQuality: () => {
        const { fps } = get().performanceMetrics;

        if (fps >= 55) return 'ultra';
        if (fps >= 45) return 'high';
        if (fps >= 30) return 'medium';
        return 'low';
      },

      // ═══ PRESETS ═══

      applyPreset: preset => {
        const presets: Record<string, Partial<AuraConfig>> = {
          minimal: {
            enabled: true,
            intensity: 'minimal',
            mode: 'static',
            particlesEnabled: false,
            quality: 'low',
          },
          balanced: {
            enabled: true,
            intensity: 'medium',
            mode: 'dynamic',
            particlesEnabled: true,
            particleCount: 75,
            quality: 'medium',
          },
          performance: {
            enabled: true,
            intensity: 'low',
            mode: 'dynamic',
            particlesEnabled: true,
            particleCount: 50,
            quality: 'low',
          },
          quality: {
            enabled: true,
            intensity: 'high',
            mode: 'reactive',
            particlesEnabled: true,
            particleCount: 125,
            quality: 'high',
          },
          maximum: {
            enabled: true,
            intensity: 'maximum',
            mode: 'quantum',
            particlesEnabled: true,
            particleCount: 150,
            quality: 'ultra',
          },
        };

        const presetConfig = presets[preset];
        if (presetConfig) {
          set(state => ({
            config: { ...state.config, ...presetConfig },
            globalIntensity: INTENSITY_VALUES[presetConfig.intensity || 'medium'],
          }));
        }
      },

      resetToDefault: () => {
        set({
          config: DEFAULT_CONFIG,
          globalIntensity: INTENSITY_VALUES.medium,
          activeActivities: [],
        });
      },
    }),
    {
      name: 'titane-aura-config',
      version: 1,
      partialize: state => ({ config: state.config }),
    }
  )
);

/* ═══════════════════════════════════════════════════════════════
   REACT HOOK
   ═══════════════════════════════════════════════════════════════ */

/**
 * Hook pour utiliser l'orchestrateur Aura
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const aura = useAura();
 *
 *   const handleClick = () => {
 *     aura.registerActivity({
 *       type: 'interaction',
 *       intensity: 0.5,
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleClick}>
 *       Intensity: {aura.globalIntensity.toFixed(2)}
 *     </button>
 *   );
 * }
 * ```
 */
export const useAura = () => {
  const store = useAuraOrchestrator();

  return {
    // Configuration
    config: store.config,
    enabled: store.config.enabled,
    intensity: store.config.intensity,
    mode: store.config.mode,
    theme: store.config.theme,

    // Runtime
    globalIntensity: store.globalIntensity,
    activities: store.activeActivities,
    metrics: store.performanceMetrics,

    // Actions
    setEnabled: store.setEnabled,
    setIntensity: store.setIntensity,
    setMode: store.setMode,
    setTheme: store.setTheme,
    setParticlesEnabled: store.setParticlesEnabled,
    setQuality: store.setQuality,

    // Activity
    registerActivity: store.registerActivity,
    clearActivities: store.clearActivities,

    // Performance
    updateFPS: store.updateFPS,
    getRecommendedQuality: store.getRecommendedQuality,

    // Presets
    applyPreset: store.applyPreset,
    resetToDefault: store.resetToDefault,
  };
};

/* ═══════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Applique l'intensité globale aux CSS variables
 */
export const applyGlobalAuraIntensity = (intensity: number) => {
  if (typeof document === 'undefined') return;

  document.documentElement.style.setProperty(
    '--global-aura-intensity',
    intensity.toString()
  );
  document.documentElement.style.setProperty(
    '--global-aura-opacity',
    (intensity * 0.7).toString()
  );
};

/**
 * Récupère les couleurs du thème actuel
 */
export const getThemeColors = (theme: AuraTheme): string[] => {
  const themes = {
    ocean: [
      'rgba(6, 182, 212, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(124, 58, 237, 0.8)',
    ],
    sunset: [
      'rgba(236, 72, 153, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(239, 68, 68, 0.8)',
    ],
    forest: [
      'rgba(16, 185, 129, 0.8)',
      'rgba(132, 204, 22, 0.8)',
      'rgba(52, 211, 153, 0.8)',
    ],
    fire: [
      'rgba(239, 68, 68, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(253, 224, 71, 0.8)',
    ],
    rainbow: [
      'rgba(124, 58, 237, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(6, 182, 212, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(251, 146, 60, 0.8)',
    ],
    default: [
      'rgba(124, 58, 237, 0.8)',
      'rgba(6, 182, 212, 0.8)',
      'rgba(59, 130, 246, 0.8)',
    ],
  };

  return themes[theme] || themes.default;
};

export default useAuraOrchestrator;
