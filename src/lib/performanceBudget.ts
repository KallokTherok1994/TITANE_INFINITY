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
  LCP: number | null; // Largest Contentful Paint (ms)
  FID: number | null; // First Input Delay (ms)
  CLS: number | null; // Cumulative Layout Shift (score)
  FCP: number | null; // First Contentful Paint (ms)
  TTFB: number | null; // Time to First Byte (ms)
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
  violations: PerformanceBudgetViolation[];
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ────────────────────────────────────────────────────────────────
// Default Budgets (Google Recommendations)
// ────────────────────────────────────────────────────────────────

const DEFAULT_BUDGET: PerformanceBudget = {
  LCP: 2500, // 2.5s
  FID: 100, // 100ms
  CLS: 0.1, // 0.1 score
  FCP: 1800, // 1.8s
  TTFB: 600, // 600ms
  bundleSize: 500, // 500KB (gzipped)
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
  private static reports: PerformanceReport[] = [];
  private static listeners: Array<(report: PerformanceReport) => void> = [];

  /**
   * Initialiser le monitoring
   */
  static initialize(customBudget?: Partial<PerformanceBudget>): void {
    if (customBudget) {
      this.budget = { ...this.budget, ...customBudget };
    }

    // Observer Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();

    // Report initial après 5s
    setTimeout(() => {
      this.generateReport();
    }, 5000);
  }

  /**
   * Observer LCP (Largest Contentful Paint)
   */
  private static observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime: number;
          loadTime: number;
        };

        this.vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.error('LCP observer failed:', e);
    }
  }

  /**
   * Observer FID (First Input Delay)
   */
  private static observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0] as PerformanceEventTiming;

        this.vitals.FID = firstEntry.processingStart - firstEntry.startTime;
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.error('FID observer failed:', e);
    }
  }

  /**
   * Observer CLS (Cumulative Layout Shift)
   */
  private static observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsScore = 0;

      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const layoutShift = entry as LayoutShiftEntry;
          if (!layoutShift.hadRecentInput) {
            clsScore += layoutShift.value;
          }
        }

        this.vitals.CLS = clsScore;
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.error('CLS observer failed:', e);
    }
  }

  /**
   * Observer FCP (First Contentful Paint)
   */
  private static observeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');

        if (fcpEntry) {
          this.vitals.FCP = fcpEntry.startTime;
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.error('FCP observer failed:', e);
    }
  }

  /**
   * Observer TTFB (Time to First Byte)
   */
  private static observeTTFB(): void {
    if (!window.performance || !window.performance.timing) return;

    try {
      const navigationTiming = performance.timing;
      const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;

      this.vitals.TTFB = ttfb;
    } catch (e) {
      console.error('TTFB observer failed:', e);
    }
  }

  /**
   * Vérifier violations du budget
   */
  private static checkViolations(): PerformanceBudgetViolation[] {
    const violations: PerformanceBudgetViolation[] = [];

    // Check each vital
    const vitalChecks: Array<{ metric: keyof PerformanceBudget; value: number | null }> = [
      { metric: 'LCP', value: this.vitals.LCP },
      { metric: 'FID', value: this.vitals.FID },
      { metric: 'CLS', value: this.vitals.CLS },
      { metric: 'FCP', value: this.vitals.FCP },
      { metric: 'TTFB', value: this.vitals.TTFB },
    ];

    for (const check of vitalChecks) {
      if (check.value === null) continue;

      const budget = this.budget[check.metric];
      const actual = check.value;

      if (actual > budget) {
        const exceeded = actual - budget;
        const percentage = (exceeded / budget) * 100;

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

        violations.push({
          metric: check.metric,
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
    if (this.vitals.LCP !== null) {
      if (this.vitals.LCP > 4000) score -= 25;
      else if (this.vitals.LCP > 2500) score -= 15;
      else if (this.vitals.LCP > 1800) score -= 5;
    }

    // FID weight: 25%
    if (this.vitals.FID !== null) {
      if (this.vitals.FID > 300) score -= 25;
      else if (this.vitals.FID > 100) score -= 15;
      else if (this.vitals.FID > 50) score -= 5;
    }

    // CLS weight: 25%
    if (this.vitals.CLS !== null) {
      if (this.vitals.CLS > 0.25) score -= 25;
      else if (this.vitals.CLS > 0.1) score -= 15;
      else if (this.vitals.CLS > 0.05) score -= 5;
    }

    // FCP weight: 15%
    if (this.vitals.FCP !== null) {
      if (this.vitals.FCP > 3000) score -= 15;
      else if (this.vitals.FCP > 1800) score -= 10;
      else if (this.vitals.FCP > 1000) score -= 3;
    }

    // TTFB weight: 10%
    if (this.vitals.TTFB !== null) {
      if (this.vitals.TTFB > 1800) score -= 10;
      else if (this.vitals.TTFB > 600) score -= 5;
      else if (this.vitals.TTFB > 300) score -= 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculer grade basé sur score
   */
  private static calculateGrade(score: number): PerformanceReport['grade'] {
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
    const violations = this.checkViolations();
    const score = this.calculateScore();
    const grade = this.calculateGrade(score);

    const report: PerformanceReport = {
      timestamp: Date.now(),
      vitals: { ...this.vitals },
      violations,
      score,
      grade,
    };

    this.reports.unshift(report);

    // Garder max 20 rapports
    if (this.reports.length > 20) {
      this.reports = this.reports.slice(0, 20);
    }

    // Notifier listeners
    this.notifyListeners(report);

    // Log en console (dev only)
    if (process.env.NODE_ENV === 'development') {
      this.logReport(report);
    }

    return report;
  }

  /**
   * Logger rapport en console
   */
  private static logReport(report: PerformanceReport): void {
    console.group(
      `%c Performance Report - Grade ${report.grade} (${report.score}/100)`,
      `color: white; background-color: ${this.getGradeColor(report.grade)}; font-weight: bold; padding: 4px 8px; border-radius: 4px;`
    );

    console.log('Core Web Vitals:');
    console.table(report.vitals);

    if (report.violations.length > 0) {
      console.warn(`${report.violations.length} Budget Violations:`);
      console.table(report.violations);
    } else {
      console.log('✅ All budgets met!');
    }

    console.groupEnd();
  }

  /**
   * Couleur grade pour console
   */
  private static getGradeColor(grade: PerformanceReport['grade']): string {
    switch (grade) {
      case 'A':
        return '#10b981';
      case 'B':
        return '#3b82f6';
      case 'C':
        return '#f59e0b';
      case 'D':
        return '#ef4444';
      case 'F':
        return '#7f1d1d';
    }
  }

  /**
   * Obtenir vitals actuels
   */
  static getVitals(): CoreWebVitals {
    return { ...this.vitals };
  }

  /**
   * Obtenir budget
   */
  static getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  /**
   * Obtenir dernier rapport
   */
  static getLatestReport(): PerformanceReport | null {
    return this.reports[0] || null;
  }

  /**
   * Obtenir tous les rapports
   */
  static getReports(): PerformanceReport[] {
    return [...this.reports];
  }

  /**
   * S'abonner aux rapports
   */
  static subscribe(listener: (report: PerformanceReport) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notifier listeners
   */
  private static notifyListeners(report: PerformanceReport): void {
    this.listeners.forEach((listener) => listener(report));
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
    if (!window.performance || !window.performance.getEntriesByType) {
      return { total: 0, js: 0, css: 0, images: 0, fonts: 0, other: 0 };
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const sizes = {
      total: 0,
      js: 0,
      css: 0,
      images: 0,
      fonts: 0,
      other: 0,
    };

    for (const resource of resources) {
      const size = resource.transferSize || 0;
      sizes.total += size;

      const url = resource.name;

      if (url.endsWith('.js')) {
        sizes.js += size;
      } else if (url.endsWith('.css')) {
        sizes.css += size;
      } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url)) {
        sizes.images += size;
      } else if (/\.(woff|woff2|ttf|eot|otf)$/i.test(url)) {
        sizes.fonts += size;
      } else {
        sizes.other += size;
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
    if (!window.performance || !window.performance.getEntriesByType) {
      return [];
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const threshold = thresholdKB * 1024;
    const large: Array<{ url: string; size: number; type: string }> = [];

    for (const resource of resources) {
      const size = resource.transferSize || 0;

      if (size > threshold) {
        const url = resource.name;
        let type = 'other';

        if (url.endsWith('.js')) type = 'js';
        else if (url.endsWith('.css')) type = 'css';
        else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url)) type = 'image';
        else if (/\.(woff|woff2|ttf|eot|otf)$/i.test(url)) type = 'font';

        large.push({ url, size, type });
      }
    }

    return large.sort((a, b) => b.size - a.size);
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
