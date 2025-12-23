/**
 * TITANE∞ v25.4.1 — Web Vitals Monitoring
 * Real-time Core Web Vitals tracking with Google thresholds
 */

import { useState, useEffect, useRef } from 'react';

// ═══ TYPES ═══

export interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint (ms)
  cls: number; // Cumulative Layout Shift (score)
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
  inp: number; // Interaction to Next Paint (ms)
  timestamp: number;
  url: string;
  userAgent: string;
}

export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export interface MetricThreshold {
  good: number;
  poor: number;
}

// ═══ GOOGLE CORE WEB VITALS THRESHOLDS ═══

const THRESHOLDS: Record<
  keyof Omit<WebVitalsMetrics, 'timestamp' | 'url' | 'userAgent'>,
  MetricThreshold
> = {
  lcp: { good: 2500, poor: 4000 }, // ms
  cls: { good: 0.1, poor: 0.25 }, // score
  fcp: { good: 1800, poor: 3000 }, // ms
  ttfb: { good: 800, poor: 1800 }, // ms
  inp: { good: 200, poor: 500 }, // ms
};

// ═══ WEB VITALS MONITOR ═══

export class WebVitalsMonitor {
  private metrics: WebVitalsMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private reportingInterval: number | null = null;
  private monitoring = false;

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('[WebVitals] PerformanceObserver not supported');
      return;
    }

    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        if (lastEntry) {
          const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
          this.updateMetric('lcp', lcp);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // FCP Observer
      const fcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('fcp', entry.startTime);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(
          (entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value || 0;
              this.updateMetric('cls', clsValue);
            }
          }
        );
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Navigation Timing (TTFB)
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const ttfb = timing.responseStart - timing.requestStart;
        this.updateMetric('ttfb', ttfb);
      }

      // INP Observer (Interaction to Next Paint)
      const inpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { duration?: number }) => {
          this.updateMetric('inp', entry.duration || 0);
        });
      });
      inpObserver.observe({ entryTypes: ['event'] });
      this.observers.push(inpObserver);
    } catch (error) {
      console.error('[WebVitals] Observer initialization failed:', error);
    }
  }

  private updateMetric(
    metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'url' | 'userAgent'>,
    value: number
  ): void {
    const previous = this.metrics[this.metrics.length - 1];

    // Create or update latest metrics
    const latest: WebVitalsMetrics = {
      lcp: previous?.lcp || 0,
      cls: previous?.cls || 0,
      fcp: previous?.fcp || 0,
      ttfb: previous?.ttfb || 0,
      inp: previous?.inp || 0,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      [metric]: value,
    };

    this.metrics.push(latest);

    // Keep last 100 entries
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  public getRating(
    metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'url' | 'userAgent'>,
    value: number
  ): MetricRating {
    const threshold = THRESHOLDS[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  public recordMetrics(metrics: WebVitalsMetrics): void {
    this.metrics.push(metrics);

    // Keep last 100 entries
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  public getLatestMetrics(): WebVitalsMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  public getAggregatedMetrics(): {
    count: number;
    avg: Omit<WebVitalsMetrics, 'timestamp' | 'url' | 'userAgent'>;
  } {
    if (this.metrics.length === 0) {
      return {
        count: 0,
        avg: { lcp: 0, cls: 0, fcp: 0, ttfb: 0, inp: 0 },
      };
    }

    const sum = this.metrics.reduce(
      (acc, m) => ({
        lcp: acc.lcp + m.lcp,
        cls: acc.cls + m.cls,
        fcp: acc.fcp + m.fcp,
        ttfb: acc.ttfb + m.ttfb,
        inp: acc.inp + m.inp,
      }),
      { lcp: 0, cls: 0, fcp: 0, ttfb: 0, inp: 0 }
    );

    const count = this.metrics.length;

    return {
      count,
      avg: {
        lcp: sum.lcp / count,
        cls: sum.cls / count,
        fcp: sum.fcp / count,
        ttfb: sum.ttfb / count,
        inp: sum.inp / count,
      },
    };
  }

  public generateRecommendations(metrics: WebVitalsMetrics): string[] {
    const recommendations: string[] = [];

    // LCP recommendations
    if (this.getRating('lcp', metrics.lcp) === 'poor') {
      recommendations.push('LCP élevé');
      recommendations.push('→ Optimiser images (WebP, lazy loading)');
      recommendations.push('→ Réduire temps serveur (CDN)');
      recommendations.push('→ Éliminer ressources bloquantes');
    }

    // CLS recommendations
    if (this.getRating('cls', metrics.cls) === 'poor') {
      recommendations.push('CLS élevé');
      recommendations.push('→ Réserver espace images/vidéos');
      recommendations.push('→ Éviter contenu dynamique au-dessus du fold');
      recommendations.push('→ Utiliser transform au lieu de width/height');
    }

    // FCP recommendations
    if (this.getRating('fcp', metrics.fcp) === 'poor') {
      recommendations.push('FCP lent');
      recommendations.push('→ Inline CSS critique');
      recommendations.push('→ Différer JavaScript non-essentiel');
      recommendations.push('→ Optimiser fonts (font-display: swap)');
    }

    // TTFB recommendations
    if (this.getRating('ttfb', metrics.ttfb) === 'poor') {
      recommendations.push('TTFB élevé');
      recommendations.push('→ Optimiser serveur (cache, compression)');
      recommendations.push('→ Utiliser CDN');
      recommendations.push('→ Réduire redirections');
    }

    // INP recommendations
    if (this.getRating('inp', metrics.inp) === 'poor') {
      recommendations.push('INP élevé');
      recommendations.push('→ Optimiser event handlers');
      recommendations.push('→ Réduire main thread work');
      recommendations.push('→ Utiliser requestIdleCallback');
    }

    return recommendations;
  }

  public start(): void {
    if (this.monitoring) return;

    this.monitoring = true;

    // Report every 30 seconds
    this.reportingInterval = window.setInterval(() => {
      this.sendToAnalytics();
    }, 30000);
  }

  public stop(): void {
    this.monitoring = false;

    if (this.reportingInterval !== null) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }

    // Cleanup observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  public isMonitoring(): boolean {
    return this.monitoring;
  }

  private sendToAnalytics(): void {
    const latest = this.getLatestMetrics();
    if (!latest) return;

    // Send to analytics service (placeholder)
    console.log('[WebVitals] Analytics report:', latest);

    // In production, send to actual analytics:
    // fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   body: JSON.stringify(latest),
    // });
  }
}

// ═══ REACT HOOK ═══

export interface UseWebVitalsReturn {
  currentMetrics: WebVitalsMetrics | null;
  overallScore: number;
  recommendations: string[];
  isMonitoring: boolean;
}

export function useWebVitals(): UseWebVitalsReturn {
  const [currentMetrics, setCurrentMetrics] = useState<WebVitalsMetrics | null>(null);
  const [overallScore, setOverallScore] = useState<number>(100);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const monitorRef = useRef<WebVitalsMonitor | null>(null);

  useEffect(() => {
    // Initialize monitor
    const monitor = new WebVitalsMonitor();
    monitorRef.current = monitor;
    monitor.start();
    setIsMonitoring(true);

    // Update metrics every second
    const interval = setInterval(() => {
      const latest = monitor.getLatestMetrics();
      if (latest) {
        setCurrentMetrics(latest);

        // Calculate overall score (0-100)
        const ratings = {
          lcp: monitor.getRating('lcp', latest.lcp),
          cls: monitor.getRating('cls', latest.cls),
          fcp: monitor.getRating('fcp', latest.fcp),
          ttfb: monitor.getRating('ttfb', latest.ttfb),
          inp: monitor.getRating('inp', latest.inp),
        };

        const goodCount = Object.values(ratings).filter(r => r === 'good').length;
        const needsImprovementCount = Object.values(ratings).filter(
          r => r === 'needs-improvement'
        ).length;
        const poorCount = Object.values(ratings).filter(r => r === 'poor').length;

        const score = Math.round(
          (goodCount * 100 + needsImprovementCount * 50 + poorCount * 0) / 5
        );
        setOverallScore(score);

        // Generate recommendations
        const recs = monitor.generateRecommendations(latest);
        setRecommendations(recs);
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      monitor.stop();
      setIsMonitoring(false);
    };
  }, []);

  return {
    currentMetrics,
    overallScore,
    recommendations,
    isMonitoring,
  };
}
