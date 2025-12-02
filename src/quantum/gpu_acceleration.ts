/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — GPU ACCELERATION DRIVER
 * Activation GPU contrôlée pour transitions et animations
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface GPUMetrics {
  isEnabled: boolean;
  activeLayers: number;
  totalLayersCreated: number;
  estimatedMemoryMB: number;
  utilizationScore: number;
}

interface GPULayer {
  element: HTMLElement | null;
  createdAt: number;
  type: 'transition' | 'animation' | 'persistent';
}

export class GPUAccelerator {
  private enabled: boolean;
  private layers: Map<string, GPULayer> = new Map();
  private totalCreated = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // CSS optimisations GPU
  private readonly GPU_STYLES = {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
    willChange: 'auto',
  };

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  /**
   * Initialise l'accélérateur GPU
   */
  initialize(): void {
    if (!this.enabled) return;

    // Appliquer styles globaux pour GPU
    this.injectGlobalStyles();

    // Démarrer le cleanup périodique
    this.startCleanup();

    console.log('[GPUAccelerator] Initialized');
  }

  /**
   * Injecte les styles CSS globaux pour optimisation GPU
   */
  private injectGlobalStyles(): void {
    const styleId = 'titane-gpu-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* TITANE∞ GPU Acceleration Layer */
      .titane-gpu-layer {
        transform: translateZ(0);
        backface-visibility: hidden;
        will-change: transform, opacity;
      }

      .titane-gpu-transition {
        transform: translateZ(0);
        transition-property: transform, opacity;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      .titane-gpu-stable {
        contain: layout style paint;
      }

      /* Optimisation des animations */
      @media (prefers-reduced-motion: no-preference) {
        .titane-gpu-layer {
          will-change: transform, opacity;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .titane-gpu-layer {
          will-change: auto;
          transition: none !important;
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Prépare un élément pour le rendu GPU
   */
  prepareElement(elementId: string): void {
    if (!this.enabled) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    this.activateLayer(element);
  }

  /**
   * Active un layer GPU sur un élément
   */
  activateLayer(element: HTMLElement, type: 'transition' | 'animation' | 'persistent' = 'transition'): void {
    if (!this.enabled) return;

    const id = element.id || `gpu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Ajouter la classe GPU
    element.classList.add('titane-gpu-layer');

    // Appliquer styles inline si nécessaire
    if (type === 'persistent') {
      element.style.transform = this.GPU_STYLES.transform;
      element.style.backfaceVisibility = this.GPU_STYLES.backfaceVisibility;
    }

    // Enregistrer le layer
    this.layers.set(id, {
      element: element,
      createdAt: Date.now(),
      type,
    });

    this.totalCreated++;
  }

  /**
   * Désactive un layer GPU
   */
  deactivateLayer(element: HTMLElement): void {
    element.classList.remove('titane-gpu-layer', 'titane-gpu-transition');
    element.style.willChange = 'auto';
    element.style.transform = '';

    // Supprimer de la map
    for (const [id, layer] of this.layers.entries()) {
      const el = layer.element;
      if (el === element) {
        this.layers.delete(id);
        break;
      }
    }
  }

  /**
   * Optimise une transition spécifique
   */
  optimizeTransition(element: HTMLElement, duration: number, properties: string[]): void {
    if (!this.enabled) return;

    element.classList.add('titane-gpu-transition');
    element.style.willChange = properties.join(', ');
    element.style.transitionDuration = `${duration}ms`;

    // Auto-cleanup après transition
    const cleanup = () => {
      element.style.willChange = 'auto';
      element.classList.remove('titane-gpu-transition');
    };

    element.addEventListener('transitionend', cleanup, { once: true });

    // Fallback cleanup
    setTimeout(cleanup, duration + 100);
  }

  /**
   * Nettoyage des layers inutilisés
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 5000; // 5 secondes

    for (const [id, layer] of this.layers.entries()) {
      const element = layer.element;

      // Supprimer si l'élément n'existe plus
      if (!element || !document.contains(element)) {
        this.layers.delete(id);
        continue;
      }

      // Supprimer les layers de transition anciens
      if (layer.type === 'transition' && now - layer.createdAt > maxAge) {
        this.deactivateLayer(element);
      }
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => this.cleanup(), 2000);
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Récupère l'utilisation GPU estimée
   */
  getUtilization(): number {
    // Estimation basée sur le nombre de layers actifs
    const activeLayers = this.getActiveLayerCount();
    const maxLayers = 50; // Seuil raisonnable
    return Math.min(1, activeLayers / maxLayers);
  }

  private getActiveLayerCount(): number {
    let count = 0;
    for (const layer of this.layers.values()) {
      if (layer.element && document.contains(layer.element)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Récupère les métriques GPU
   */
  getMetrics(): GPUMetrics {
    const activeLayers = this.getActiveLayerCount();

    // Estimation mémoire (~2MB par layer composite)
    const estimatedMemoryMB = activeLayers * 2;

    return {
      isEnabled: this.enabled,
      activeLayers,
      totalLayersCreated: this.totalCreated,
      estimatedMemoryMB,
      utilizationScore: this.getUtilization(),
    };
  }

  /**
   * Active/désactive l'accélération GPU
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      // Désactiver tous les layers
      for (const layer of this.layers.values()) {
        const element = layer.element;
        if (element) {
          this.deactivateLayer(element);
        }
      }
      this.layers.clear();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export default GPUAccelerator;
