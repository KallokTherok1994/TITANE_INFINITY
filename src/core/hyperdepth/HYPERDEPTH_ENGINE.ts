// ⚡ TITANE∞ v22 — HyperDepth Engine
// Système de profondeur multi-couche dynamique

import { DS_COLORS, rgba } from '../visual/DS_COLORS';
import { DS_CONSTANTS } from '../visual/DS_CONSTANTS';
import { SystemState, stateEngine } from '../visual/STATE_ENGINE';

// 🌌 Couches de profondeur
export type DepthLayer = 'background' | 'glow' | 'mesh' | 'overlay';

// 🎨 Configuration d'une couche
export interface LayerConfig {
  id: string;
  layer: DepthLayer;
  opacity: number; // 0-1
  blur: number; // px
  intensity: number; // 0-1
  animated: boolean;
  animationSpeed?: number; // ms
}

// 🧬 Configuration complète HyperDepth
export interface HyperDepthConfig {
  layers: LayerConfig[];
  globalIntensity: number; // 0-1
  stateAdaptive: boolean; // Adapte selon l'état système
}

// 🌠 HyperDepth Engine principal
export class HyperDepthEngine {
  private layers: Map<string, LayerConfig> = new Map();
  private globalIntensity: number = 0.3;
  private stateAdaptive: boolean = true;

  constructor() {
    this.initializeDefaultLayers();
    this.subscribeToStateChanges();
  }

  /**
   * Initialiser les couches par défaut
   */
  private initializeDefaultLayers(): void {
    const defaultLayers: LayerConfig[] = [
      {
        id: 'background-grain',
        layer: 'background',
        opacity: DS_CONSTANTS.opacity.subtle,
        blur: 0,
        intensity: 0.2,
        animated: false,
      },
      {
        id: 'background-gradient',
        layer: 'background',
        opacity: DS_CONSTANTS.opacity.medium,
        blur: 0,
        intensity: 0.4,
        animated: true,
        animationSpeed: DS_CONSTANTS.animationSpeed.verySlow,
      },
      {
        id: 'glow-ambient',
        layer: 'glow',
        opacity: DS_CONSTANTS.opacity.subtle,
        blur: DS_CONSTANTS.blur.large,
        intensity: 0.3,
        animated: true,
        animationSpeed: DS_CONSTANTS.timing.breath,
      },
      {
        id: 'glow-focused',
        layer: 'glow',
        opacity: DS_CONSTANTS.opacity.medium,
        blur: DS_CONSTANTS.blur.medium,
        intensity: 0.5,
        animated: true,
        animationSpeed: DS_CONSTANTS.animationSpeed.medium,
      },
      {
        id: 'mesh-grid',
        layer: 'mesh',
        opacity: DS_CONSTANTS.opacity.ghost,
        blur: 0,
        intensity: 0.15,
        animated: false,
      },
      {
        id: 'mesh-organic',
        layer: 'mesh',
        opacity: DS_CONSTANTS.opacity.subtle,
        blur: DS_CONSTANTS.blur.min,
        intensity: 0.2,
        animated: true,
        animationSpeed: DS_CONSTANTS.animationSpeed.slow,
      },
    ];

    defaultLayers.forEach((layer) => this.layers.set(layer.id, layer));
  }

  /**
   * S'abonner aux changements d'état système
   */
  private subscribeToStateChanges(): void {
    if (this.stateAdaptive) {
      stateEngine.onStateChange((state, config) => {
        this.adaptToState(state);
      });
    }
  }

  /**
   * Adapter les couches selon l'état système
   */
  private adaptToState(state: SystemState): void {
    const stateConfig = stateEngine.getStateConfig(state);

    // Ajuster l'intensité globale
    this.globalIntensity = stateConfig.intensity;

    // Ajuster les couches glow
    this.layers.forEach((layer) => {
      if (layer.layer === 'glow') {
        layer.intensity = stateConfig.intensity;
        layer.blur = stateConfig.blur;
        layer.opacity = stateConfig.opacity * 0.5;
      }
    });
  }

  /**
   * Obtenir une couche spécifique
   */
  getLayer(layerId: string): LayerConfig | undefined {
    return this.layers.get(layerId);
  }

  /**
   * Mettre à jour une couche
   */
  updateLayer(layerId: string, updates: Partial<LayerConfig>): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      Object.assign(layer, updates);
    }
  }

  /**
   * Générer le CSS pour une couche background
   */
  generateBackgroundCSS(state: SystemState = 'stable'): Record<string, string> {
    const stateConfig = stateEngine.getStateConfig(state);
    const color1 = DS_COLORS.diamant.variants[950];
    const color2 = DS_COLORS.diamant.variants[900];

    return {
      background: `
        radial-gradient(
          ellipse at top,
          ${rgba(stateConfig.colorRgb, 0.05)},
          transparent 50%
        ),
        linear-gradient(
          180deg,
          ${color1} 0%,
          ${color2} 100%
        )
      `,
      backgroundAttachment: 'fixed',
      '--depth-bg-intensity': this.globalIntensity.toString(),
    };
  }

  /**
   * Générer le CSS pour la couche glow
   */
  generateGlowLayerCSS(state: SystemState = 'stable'): Record<string, string> {
    const stateConfig = stateEngine.getStateConfig(state);
    const glowLayer = this.layers.get('glow-ambient');

    if (!glowLayer) return {};

    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      height: '80%',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${rgba(stateConfig.colorRgb, glowLayer.intensity * 0.3)}, transparent 70%)`,
      filter: `blur(${glowLayer.blur}px)`,
      opacity: glowLayer.opacity.toString(),
      pointerEvents: 'none',
      zIndex: '0',
      animation: glowLayer.animated ? `glow-breathe ${glowLayer.animationSpeed}ms ease-in-out infinite` : 'none',
    };
  }

  /**
   * Générer le CSS pour la couche mesh
   */
  generateMeshLayerCSS(): Record<string, string> {
    const meshLayer = this.layers.get('mesh-grid');
    if (!meshLayer) return {};

    return {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundImage: `
        linear-gradient(${rgba(DS_COLORS.diamant.rgb, meshLayer.intensity)} 1px, transparent 1px),
        linear-gradient(90deg, ${rgba(DS_COLORS.diamant.rgb, meshLayer.intensity)} 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      opacity: meshLayer.opacity.toString(),
      pointerEvents: 'none',
      zIndex: '0',
    };
  }

  /**
   * Générer le CSS complet HyperDepth
   */
  generateCompleteCSS(state: SystemState = 'stable'): {
    background: Record<string, string>;
    glowLayer: Record<string, string>;
    meshLayer: Record<string, string>;
  } {
    return {
      background: this.generateBackgroundCSS(state),
      glowLayer: this.generateGlowLayerCSS(state),
      meshLayer: this.generateMeshLayerCSS(),
    };
  }

  /**
   * Générer les keyframes CSS pour les animations
   */
  generateKeyframes(): string {
    return `
      @keyframes glow-breathe {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: var(--glow-opacity-min, 0.3);
        }
        50% {
          transform: translate(-50%, -50%) scale(1.1);
          opacity: var(--glow-opacity-max, 0.5);
        }
      }

      @keyframes mesh-float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes grain-animate {
        0%, 100% { opacity: 0.03; }
        50% { opacity: 0.05; }
      }
    `;
  }

  /**
   * Définir l'intensité globale
   */
  setGlobalIntensity(intensity: number): void {
    this.globalIntensity = Math.max(0, Math.min(1, intensity));
    this.layers.forEach((layer) => {
      layer.intensity = this.globalIntensity;
    });
  }

  /**
   * Activer/désactiver l'adaptation à l'état
   */
  setStateAdaptive(adaptive: boolean): void {
    this.stateAdaptive = adaptive;
  }

  /**
   * Obtenir la configuration complète
   */
  getConfig(): HyperDepthConfig {
    return {
      layers: Array.from(this.layers.values()),
      globalIntensity: this.globalIntensity,
      stateAdaptive: this.stateAdaptive,
    };
  }

  /**
   * Réinitialiser les couches
   */
  reset(): void {
    this.layers.clear();
    this.globalIntensity = 0.3;
    this.initializeDefaultLayers();
  }
}

// 🌟 Instance singleton
export const hyperDepthEngine = new HyperDepthEngine();
