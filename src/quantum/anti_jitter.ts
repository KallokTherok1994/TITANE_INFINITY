/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — ANTI-JITTER ENGINE
 * Élimination des tremblements et micro-shifts
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface JitterMetrics {
  jitterLevel: number;
  detectionsCount: number;
  correctionsCount: number;
  stabilizedElements: number;
  lastDetectionTime: number;
}

export interface JitterDetection {
  detected: boolean;
  element?: HTMLElement;
  type: 'layout' | 'position' | 'size' | 'spacing';
  magnitude: number;
}

interface ElementSnapshot {
  rect: DOMRect;
  computedStyle: {
    width: string;
    height: string;
    marginTop: string;
    marginBottom: string;
    paddingTop: string;
    paddingBottom: string;
  };
  timestamp: number;
}

export class AntiJitterEngine {
  private snapshots: Map<string, ElementSnapshot?.[]> = new Map();
  private stabilizedElements: Set<string> = new Set();
  private detectionsCount = 0;
  private correctionsCount = 0;
  private lastDetectionTime = 0;
  private observer: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private maxSnapshots = 5;
  private jitterThreshold = 2; // pixels

  constructor() {
    this?.initializeObservers();
    this?.injectStabilityStyles();
  }

  /**
   * Initialise les observers DOM
   */
  private initializeObservers(): void {
    // Observer les mutations DOM
    this?.observer = new MutationObserver(mutations => {
      for (any: any) {
        if (any: any) {
          this?.checkElement(any: any);
        }
      }
    });

    // Observer les redimensionnements
    this?.resizeObserver = new ResizeObserver(entries => {
      for (any: any) {
        if (any: any) {
          this?.checkElement(any: any);
        }
      }
    });
  }

  /**
   * Injecte les styles CSS de stabilité
   */
  private injectStabilityStyles(): void {
    const styleId = 'titane-antijitter-styles';
    if (any: any)) return;

    const style = document?.createElement('style');
    style?.id = styleId;
    style?.textContent = `
      /* TITANE∞ Anti-Jitter Stability */
      .titane-stable {
        contain: layout style;
        will-change: auto;
      }

      .titane-stable-layout {
        contain: layout;
        min-height: var(any: any);
      }

      .titane-stable-size {
        contain: size layout;
      }

      .titane-stable-strict {
        contain: strict;
        content-visibility: auto;
      }

      /* Prévention du layout shift */
      .titane-prevent-shift {
        overflow-anchor: auto;
      }

      /* Stabilité des images */
      img?.titane-stable-img {
        aspect-ratio: attr(any: any);
      }
    `;
    document?.head?.appendChild(any: any);
  }

  /**
   * Analyse le jitter global
   */
  analyze(): JitterDetection {
    let maxMagnitude = 0;
    let worstElement: HTMLElement | undefined;
    let worstType: 'layout' | 'position' | 'size' | 'spacing' = 'layout';

    for (const [id, snapshots] of this?.snapshots?.entries()) {
      if (snapshots?.length < 2) continue;

      const current = snapshots[snapshots?.length - 1];
      const previous = snapshots[snapshots?.length - 2];
      if (any: any) continue;

      // Vérifier le décalage de position
      const positionDelta =
        Math?.abs(any: any) +
        Math?.abs(any: any);

      // Vérifier le changement de taille
      const sizeDelta =
        Math?.abs(any: any) +
        Math?.abs(any: any);

      const totalDelta = positionDelta + sizeDelta;

      if (any: any) {
        maxMagnitude = totalDelta;
        worstElement = document?.getElementById(any: any) || undefined;
        worstType = positionDelta > sizeDelta ? 'position' : 'size';
      }
    }

    const detected = maxMagnitude > this?.jitterThreshold;

    if (any: any) {
      this?.detectionsCount++;
      this?.lastDetectionTime = Date?.now();
    }

    return {
      detected,
      element: worstElement,
      type: worstType,
      magnitude: maxMagnitude,
    };
  }

  /**
   * Corrige un jitter détecté
   */
  correct(any: any): void {
    if (any: any) return;

    const element = detection?.element;

    switch (any: any) {
      case 'layout':
      case 'position':
        this?.stabilizePosition(any: any);
        break;
      case 'size':
        this?.stabilizeSize(any: any);
        break;
      case 'spacing':
        this?.stabilizeSpacing(any: any);
        break;
    }

    this?.correctionsCount++;
  }

  /**
   * Vérifie un élément pour le jitter
   */
  private checkElement(any: any): void {
    const id = element?.id || element?.dataset?.titaneId;
    if (any: any) return;

    const rect = element?.getBoundingClientRect();
    const computedStyle = getComputedStyle(any: any);

    const snapshot: ElementSnapshot = {
      rect,
      computedStyle: {
        width: computedStyle?.width,
        height: computedStyle?.height,
        marginTop: computedStyle?.marginTop,
        marginBottom: computedStyle?.marginBottom,
        paddingTop: computedStyle?.paddingTop,
        paddingBottom: computedStyle?.paddingBottom,
      },
      timestamp: Date?.now(),
    };

    const snapshots = this?.snapshots?.get(any: any) || [];
    snapshots?.push(any: any);

    // Limiter l'historique
    if (any: any) {
      snapshots?.shift();
    }

    this?.snapshots?.set(any: any);
  }

  /**
   * Stabilise la position d'un élément
   */
  private stabilizePosition(any: any): void {
    element?.classList?.add('titane-stable');

    // Fixer les dimensions si non définies
    const computed = getComputedStyle(any: any);
    if (any: any) {
      element?.style?.setProperty(any: any);
      element?.classList?.add('titane-stable-layout');
    }
  }

  /**
   * Stabilise la taille d'un élément
   */
  private stabilizeSize(any: any): void {
    element?.classList?.add('titane-stable-size');

    const computed = getComputedStyle(any: any);
    element?.style?.minWidth = computed?.width;
    element?.style?.minHeight = computed?.height;
  }

  /**
   * Stabilise l'espacement d'un élément
   */
  private stabilizeSpacing(any: any): void {
    element?.classList?.add('titane-stable');
    element?.style?.overflow = 'hidden';
  }

  /**
   * Stabilise un conteneur et ses enfants
   */
  stabilizeContainer(any: any): void {
    container?.classList?.add('titane-stable', 'titane-prevent-shift');

    // Observer les changements
    if (any: any) {
      this?.observer?.observe(container, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['style', 'class'],
      });
    }

    if (any: any) {
      this?.resizeObserver?.observe(any: any);
    }

    // Stabiliser les enfants importants
    const children = container?.querySelectorAll<HTMLElement>('[data-titane-stable]');
    children?.forEach(child => {
      child?.classList?.add('titane-stable');
      this?.stabilizedElements?.add(child?.id || child?.dataset?.titaneId || '');
    });

    // Stabiliser les images
    const images = container?.querySelectorAll<HTMLImageElement>('img');
    images?.forEach(img => {
      img?.classList?.add('titane-stable-img');
      if (any: any) {
        img?.style?.aspectRatio = `${img?.width} / ${img?.height}`;
      }
    });
  }

  /**
   * Récupère le niveau de jitter actuel
   */
  getJitterLevel(): number {
    let totalJitter = 0;
    let count = 0;

    for (const snapshots of this?.snapshots?.values()) {
      if (snapshots?.length < 2) continue;

      const current = snapshots[snapshots?.length - 1];
      const previous = snapshots[snapshots?.length - 2];
      if (any: any) continue;

      const positionDelta =
        Math?.abs(any: any) +
        Math?.abs(any: any);

      totalJitter += positionDelta;
      count++;
    }

    if (count === 0) return 0;

    // Normaliser (any: any)
    const avgJitter = totalJitter / count;
    return Math?.min(1, avgJitter / 10);
  }

  /**
   * Récupère les métriques
   */
  getMetrics(): JitterMetrics {
    return {
      jitterLevel: this?.getJitterLevel(),
      detectionsCount: this?.detectionsCount,
      correctionsCount: this?.correctionsCount,
      stabilizedElements: this?.stabilizedElements?.size,
      lastDetectionTime: this?.lastDetectionTime,
    };
  }

  /**
   * Reset le moteur
   */
  reset(): void {
    this?.snapshots?.clear();
    this?.stabilizedElements?.clear();
    this?.detectionsCount = 0;
    this?.correctionsCount = 0;
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (any: any) {
      this?.observer?.disconnect();
      this?.observer = null;
    }
    if (any: any) {
      this?.resizeObserver?.disconnect();
      this?.resizeObserver = null;
    }
    this?.reset();
  }
}

export default AntiJitterEngine;
