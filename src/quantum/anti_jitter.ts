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
  private snapshots: Map<string, ElementSnapshot[]> = new Map();
  private stabilizedElements: Set<string> = new Set();
  private detectionsCount = 0;
  private correctionsCount = 0;
  private lastDetectionTime = 0;
  private observer: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private maxSnapshots = 5;
  private jitterThreshold = 2; // pixels

  constructor() {
    this.initializeObservers();
    this.injectStabilityStyles();
  }

  /**
   * Initialise les observers DOM
   */
  private initializeObservers(): void {
    // Observer les mutations DOM
    this.observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          this.checkElement(mutation.target);
        }
      }
    });

    // Observer les redimensionnements
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target instanceof HTMLElement) {
          this.checkElement(entry.target);
        }
      }
    });
  }

  /**
   * Injecte les styles CSS de stabilité
   */
  private injectStabilityStyles(): void {
    const styleId = 'titane-antijitter-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* TITANE∞ Anti-Jitter Stability */
      .titane-stable {
        contain: layout style;
        will-change: auto;
      }

      .titane-stable-layout {
        contain: layout;
        min-height: var(--titane-min-height, auto);
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
      img.titane-stable-img {
        aspect-ratio: attr(width) / attr(height);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Analyse le jitter global
   */
  analyze(): JitterDetection {
    let maxMagnitude = 0;
    let worstElement: HTMLElement | undefined;
    let worstType: 'layout' | 'position' | 'size' | 'spacing' = 'layout';

    for (const [id, snapshots] of this.snapshots.entries()) {
      if (snapshots.length < 2) continue;

      const current = snapshots[snapshots.length - 1];
      const previous = snapshots[snapshots.length - 2];

      // Vérifier le décalage de position
      const positionDelta =
        Math.abs(current.rect.top - previous.rect.top) +
        Math.abs(current.rect.left - previous.rect.left);

      // Vérifier le changement de taille
      const sizeDelta =
        Math.abs(current.rect.width - previous.rect.width) +
        Math.abs(current.rect.height - previous.rect.height);

      const totalDelta = positionDelta + sizeDelta;

      if (totalDelta > maxMagnitude && totalDelta > this.jitterThreshold) {
        maxMagnitude = totalDelta;
        worstElement = document.getElementById(id) || undefined;
        worstType = positionDelta > sizeDelta ? 'position' : 'size';
      }
    }

    const detected = maxMagnitude > this.jitterThreshold;

    if (detected) {
      this.detectionsCount++;
      this.lastDetectionTime = Date.now();
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
  correct(detection: JitterDetection): void {
    if (!detection.detected || !detection.element) return;

    const element = detection.element;

    switch (detection.type) {
      case 'layout':
      case 'position':
        this.stabilizePosition(element);
        break;
      case 'size':
        this.stabilizeSize(element);
        break;
      case 'spacing':
        this.stabilizeSpacing(element);
        break;
    }

    this.correctionsCount++;
  }

  /**
   * Vérifie un élément pour le jitter
   */
  private checkElement(element: HTMLElement): void {
    const id = element.id || element.dataset.titaneId;
    if (!id) return;

    const rect = element.getBoundingClientRect();
    const computedStyle = getComputedStyle(element);

    const snapshot: ElementSnapshot = {
      rect,
      computedStyle: {
        width: computedStyle.width,
        height: computedStyle.height,
        marginTop: computedStyle.marginTop,
        marginBottom: computedStyle.marginBottom,
        paddingTop: computedStyle.paddingTop,
        paddingBottom: computedStyle.paddingBottom,
      },
      timestamp: Date.now(),
    };

    const snapshots = this.snapshots.get(id) || [];
    snapshots.push(snapshot);

    // Limiter l'historique
    if (snapshots.length > this.maxSnapshots) {
      snapshots.shift();
    }

    this.snapshots.set(id, snapshots);
  }

  /**
   * Stabilise la position d'un élément
   */
  private stabilizePosition(element: HTMLElement): void {
    element.classList.add('titane-stable');

    // Fixer les dimensions si non définies
    const computed = getComputedStyle(element);
    if (!element.style.minHeight) {
      element.style.setProperty('--titane-min-height', computed.height);
      element.classList.add('titane-stable-layout');
    }
  }

  /**
   * Stabilise la taille d'un élément
   */
  private stabilizeSize(element: HTMLElement): void {
    element.classList.add('titane-stable-size');

    const computed = getComputedStyle(element);
    element.style.minWidth = computed.width;
    element.style.minHeight = computed.height;
  }

  /**
   * Stabilise l'espacement d'un élément
   */
  private stabilizeSpacing(element: HTMLElement): void {
    element.classList.add('titane-stable');
    element.style.overflow = 'hidden';
  }

  /**
   * Stabilise un conteneur et ses enfants
   */
  stabilizeContainer(container: HTMLElement): void {
    container.classList.add('titane-stable', 'titane-prevent-shift');

    // Observer les changements
    if (this.observer) {
      this.observer.observe(container, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['style', 'class'],
      });
    }

    if (this.resizeObserver) {
      this.resizeObserver.observe(container);
    }

    // Stabiliser les enfants importants
    const children = container.querySelectorAll<HTMLElement>('[data-titane-stable]');
    children.forEach(child => {
      child.classList.add('titane-stable');
      this.stabilizedElements.add(child.id || child.dataset.titaneId || '');
    });

    // Stabiliser les images
    const images = container.querySelectorAll<HTMLImageElement>('img');
    images.forEach(img => {
      img.classList.add('titane-stable-img');
      if (img.width && img.height) {
        img.style.aspectRatio = `${img.width} / ${img.height}`;
      }
    });
  }

  /**
   * Récupère le niveau de jitter actuel
   */
  getJitterLevel(): number {
    let totalJitter = 0;
    let count = 0;

    for (const snapshots of this.snapshots.values()) {
      if (snapshots.length < 2) continue;

      const current = snapshots[snapshots.length - 1];
      const previous = snapshots[snapshots.length - 2];

      const positionDelta =
        Math.abs(current.rect.top - previous.rect.top) +
        Math.abs(current.rect.left - previous.rect.left);

      totalJitter += positionDelta;
      count++;
    }

    if (count === 0) return 0;

    // Normaliser (10px = jitter max)
    const avgJitter = totalJitter / count;
    return Math.min(1, avgJitter / 10);
  }

  /**
   * Récupère les métriques
   */
  getMetrics(): JitterMetrics {
    return {
      jitterLevel: this.getJitterLevel(),
      detectionsCount: this.detectionsCount,
      correctionsCount: this.correctionsCount,
      stabilizedElements: this.stabilizedElements.size,
      lastDetectionTime: this.lastDetectionTime,
    };
  }

  /**
   * Reset le moteur
   */
  reset(): void {
    this.snapshots.clear();
    this.stabilizedElements.clear();
    this.detectionsCount = 0;
    this.correctionsCount = 0;
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.reset();
  }
}

export default AntiJitterEngine;
