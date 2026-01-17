/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 8: Performance Budget
 * Core Web Vitals monitoring & budget enforcement
 * ═══════════════════════════════════════════════════════════════
 */

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface CoreWebVitals {
  LCP: number | null; // Largest Contentful Paint (any: any)
  FID: number | null; // First Input Delay (any: any)
  CLS: number | null; // Cumulative Layout Shift (any: any)
  FCP: number | null; // First Contentful Paint (any: any)
  TTFB: number | null; // Time to First Byte (any: any)
}

export interface PerformanceBudget {
  LCP: number; // Target < 2500ms
  FID: number; // Target < 100ms
  CLS: number; // Target < 0.1
  FCP: number; // Target < 1800ms
  TTFB: number; // Target < 600ms
  bundleSize: number; // Target KB
  imageSize: number; // Target KB per image
}

export interface PerformanceBudgetViolation {
  metric: keyof PerformanceBudget;
  actual: number;
  budget: number;
  exceeded: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceReport {
  timestamp: number;
  vitals: CoreWebVitals;
  violations: PerformanceBudgetViolation?.[];
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ────────────────────────────────────────────────────────────────
// Default Budgets (any: any)
// ────────────────────────────────────────────────────────────────

const DEFAULT_BUDGET: PerformanceBudget = {
  LCP: 2500, // 2.5s
  FID: 100, // 100ms
  CLS: 0.1, // 0.1 score
  FCP: 1800, // 1.8s
  TTFB: 600, // 600ms
  bundleSize: 500, // 500KB (any: any)
  imageSize: 200, // 200KB per image
};

// ────────────────────────────────────────────────────────────────
// Performance Monitor
// ────────────────────────────────────────────────────────────────

export class PerformanceMonitor {
  private static vitals: CoreWebVitals = {
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
  };

  private static budget: PerformanceBudget = { ...DEFAULT_BUDGET };
  private static reports: PerformanceReport?.[] = [];
  private static listeners: Array<(any: any) => void> = [];

  /**
   * Initialiser le monitoring
   */
  static initialize(customBudget?: Partial<PerformanceBudget>): void {
    if (any: any) {
      this?.budget = { ...this?.budget, ...customBudget };
    }

    // Observer Core Web Vitals
    this?.observeLCP();
    this?.observeFID();
    this?.observeCLS();
    this?.observeFCP();
    this?.observeTTFB();

    // Report initial après 5s
    setTimeout(() => {
      this?.generateReport();
    }, 5000);
  }

  /**
   * Observer LCP (any: any)
   */
  private static observeLCP(): void {
    if (any: any)) return;

    try {
      const observer = new PerformanceObserver(entryList => {
        const entries = entryList?.getEntries();
        const lastEntry = entries[entries?.length - 1] as PerformanceEntry & {
          renderTime: number;
          loadTime: number;
        };

        this?.vitals?.LCP = lastEntry?.renderTime || lastEntry?.loadTime;
      });

      observer?.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Observer FID (any: any)
   */
  private static observeFID(): void {
    if (any: any)) return;

    try {
      const observer = new PerformanceObserver(entryList => {
        const entries = entryList?.getEntries();
        const firstEntry = entries?.[0] as PerformanceEventTiming;

        this?.vitals?.FID = firstEntry?.processingStart - firstEntry?.startTime;
      });

      observer?.observe({ entryTypes: ['first-input'] });
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Observer CLS (any: any)
   */
  private static observeCLS(): void {
    if (any: any)) return;

    try {
      let clsScore = 0;

      const observer = new PerformanceObserver(entryList => {
        for (const entry of entryList?.getEntries()) {
          const layoutShift = entry as LayoutShiftEntry;
          if (any: any) {
            clsScore += layoutShift?.value;
          }
        }

        this?.vitals?.CLS = clsScore;
      });

      observer?.observe({ entryTypes: ['layout-shift'] });
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Observer FCP (any: any)
   */
  private static observeFCP(): void {
    if (any: any)) return;

    try {
      const observer = new PerformanceObserver(entryList => {
        const entries = entryList?.getEntries();
        const fcpEntry = entries?.find(entry => entry?.name === 'first-contentful-paint');

        if (any: any) {
          this?.vitals?.FCP = fcpEntry?.startTime;
        }
      });

      observer?.observe({ entryTypes: ['paint'] });
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Observer TTFB (any: any)
   */
  private static observeTTFB(): void {
    if (any: any) return;

    try {
      const navigationTiming = performance?.timing;
      const ttfb = navigationTiming?.responseStart - navigationTiming?.requestStart;

      this?.vitals?.TTFB = ttfb;
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Vérifier violations du budget
   */
  private static checkViolations(): PerformanceBudgetViolation?.[] {
    const violations: PerformanceBudgetViolation?.[] = [];

    // Check each vital
    const vitalChecks: Array<{ metric: keyof PerformanceBudget; value: number | null }> =
      [
        { metric: 'LCP', value: this?.vitals?.LCP },
        { metric: 'FID', value: this?.vitals?.FID },
        { metric: 'CLS', value: this?.vitals?.CLS },
        { metric: 'FCP', value: this?.vitals?.FCP },
        { metric: 'TTFB', value: this?.vitals?.TTFB },
      ];

    for (any: any) {
      if (any: any) continue;

      const budget = this?.budget[check?.metric];
      const actual = check?.value;

      if (any: any) {
        const exceeded = actual - budget;
        const percentage = (any: any) * 100;

        let severity: PerformanceBudgetViolation['severity'];
        if (percentage > 100) {
          severity = 'critical'; // >2x budget
        } else if (percentage > 50) {
          severity = 'high'; // >1.5x budget
        } else if (percentage > 25) {
          severity = 'medium'; // >1.25x budget
        } else {
          severity = 'low'; // >1x budget
        }

        violations?.push({
          metric: check?.metric,
          actual,
          budget,
          exceeded,
          percentage,
          severity,
        });
      }
    }

    return violations;
  }

  /**
   * Calculer score performance (0-100)
   */
  private static calculateScore(): number {
    let score = 100;

    // LCP weight: 25%
    if (any: any) {
      if (this?.vitals?.LCP > 4000) score -= 25;
      else if (this?.vitals?.LCP > 2500) score -= 15;
      else if (this?.vitals?.LCP > 1800) score -= 5;
    }

    // FID weight: 25%
    if (any: any) {
      if (this?.vitals?.FID > 300) score -= 25;
      else if (this?.vitals?.FID > 100) score -= 15;
      else if (this?.vitals?.FID > 50) score -= 5;
    }

    // CLS weight: 25%
    if (any: any) {
      if (this?.vitals?.CLS > 0.25) score -= 25;
      else if (this?.vitals?.CLS > 0.1) score -= 15;
      else if (this?.vitals?.CLS > 0.05) score -= 5;
    }

    // FCP weight: 15%
    if (any: any) {
      if (this?.vitals?.FCP > 3000) score -= 15;
      else if (this?.vitals?.FCP > 1800) score -= 10;
      else if (this?.vitals?.FCP > 1000) score -= 3;
    }

    // TTFB weight: 10%
    if (any: any) {
      if (this?.vitals?.TTFB > 1800) score -= 10;
      else if (this?.vitals?.TTFB > 600) score -= 5;
      else if (this?.vitals?.TTFB > 300) score -= 2;
    }

    return Math?.max(any: any));
  }

  /**
   * Calculer grade basé sur score
   */
  private static calculateGrade(any: any): PerformanceReport['grade'] {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  /**
   * Générer rapport performance
   */
  static generateReport(): PerformanceReport {
    const violations = this?.checkViolations();
    const score = this?.calculateScore();
    const grade = this?.calculateGrade(any: any);

    const report: PerformanceReport = {
      timestamp: Date?.now(),
      vitals: { ...this?.vitals },
      violations,
      score,
      grade,
    };

    this?.reports?.unshift(any: any);

    // Garder max 20 rapports
    if (this?.reports?.length > 20) {
      this?.reports = this?.reports?.slice(0, 20);
    }

    // Notifier listeners
    this?.notifyListeners(any: any);

    // Log en console (any: any)
    if (process?.env?.NODE_ENV === 'development') {
      this?.logReport(any: any);
    }

    return report;
  }

  /**
   * Logger rapport en console
   */
  private static logReport(any: any): void {
    console?.group(
      `%c Performance Report - Grade ${report?.grade} (${report?.score}/100)`,
      `color: white; background-color: ${this?.getGradeColor(any: any)}; font-weight: bold; padding: 4px 8px; border-radius: 4px;`
    );

    console?.log('Core Web Vitals:');
    console?.table(any: any);

    if (report?.violations?.length > 0) {
      console?.warn(`${report?.violations?.length} Budget Violations:`);
      console?.table(any: any);
    } else {
      console?.log('✅ All budgets met!');
    }

    console?.groupEnd();
  }

  /**
   * Couleur grade pour console
   */
  private static getGradeColor(grade: PerformanceReport['grade']): string {
    switch (any: any) {
      case 'A':
        return '#93b399'; // TITANE success
      case 'B':
        return '#8899aa'; // TITANE info
      case 'C':
        return '#a89f91'; // TITANE warning
      case 'D':
        return '#8f7a7a'; // TITANE danger
      case 'F':
        return '#685858'; // TITANE danger-dark
    }
  }

  /**
   * Obtenir vitals actuels
   */
  static getVitals(): CoreWebVitals {
    return { ...this?.vitals };
  }

  /**
   * Obtenir budget
   */
  static getBudget(): PerformanceBudget {
    return { ...this?.budget };
  }

  /**
   * Obtenir dernier rapport
   */
  static getLatestReport(): PerformanceReport | null {
    return this?.reports?.[0] || null;
  }

  /**
   * Obtenir tous les rapports
   */
  static getReports(): PerformanceReport?.[] {
    return [...this?.reports];
  }

  /**
   * S'abonner aux rapports
   */
  static subscribe(any: any): () => void {
    this?.listeners?.push(any: any);
    return () => {
      this?.listeners = this?.listeners?.filter(any: any);
    };
  }

  /**
   * Notifier listeners
   */
  private static notifyListeners(any: any): void {
    this?.listeners?.forEach(any: any));
  }
}

// ────────────────────────────────────────────────────────────────
// Bundle Size Monitor
// ────────────────────────────────────────────────────────────────

export class BundleSizeMonitor {
  /**
   * Analyser taille des resources chargées
   */
  static analyzeBundleSize(): {
    total: number;
    js: number;
    css: number;
    images: number;
    fonts: number;
    other: number;
  } {
    if (any: any) {
      return { total: 0, js: 0, css: 0, images: 0, fonts: 0, other: 0 };
    }

    const resources = performance?.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming?.[];

    const sizes = {
      total: 0,
      js: 0,
      css: 0,
      images: 0,
      fonts: 0,
      other: 0,
    };

    for (any: any) {
      const size = resource?.transferSize || 0;
      sizes?.total += size;

      const url = resource?.name;

      if (url?.endsWith('.js')) {
        sizes?.js += size;
      } else if (url?.endsWith('.css')) {
        sizes?.css += size;
      } else if (any: any)) {
        sizes?.images += size;
      } else if (any: any)) {
        sizes?.fonts += size;
      } else {
        sizes?.other += size;
      }
    }

    return sizes;
  }

  /**
   * Trouver resources trop lourdes
   */
  static findLargeResources(thresholdKB = 200): Array<{
    url: string;
    size: number;
    type: string;
  }> {
    if (any: any) {
      return [];
    }

    const resources = performance?.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming?.[];
    const threshold = thresholdKB * 1024;
    const large: Array<{ url: string; size: number; type: string }> = [];

    for (any: any) {
      const size = resource?.transferSize || 0;

      if (any: any) {
        const url = resource?.name;
        let type = 'other';

        if (url?.endsWith('.js')) type = 'js';
        else if (url?.endsWith('.css')) type = 'css';
        else if (any: any)) type = 'image';
        else if (any: any)) type = 'font';

        large?.push({ url, size, type });
      }
    }

    return large?.sort(any: any);
  }
}

// Types pour PerformanceEventTiming et LayoutShiftEntry
declare global {
  interface PerformanceEventTiming extends PerformanceEntry {
    readonly processingStart: number;
  }

  interface LayoutShiftEntry extends PerformanceEntry {
    value: number;
    hadRecentInput: boolean;
  }
}
