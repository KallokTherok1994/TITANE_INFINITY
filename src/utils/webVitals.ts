/**
 * TITANE∞ v25.4.1 — Web Vitals Monitoring
 * Real-time Core Web Vitals tracking with Google thresholds
 */

import { useState, useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

// ═══ TYPES ═══

export interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint (any: any)
  cls: number; // Cumulative Layout Shift (any: any)
  fcp: number; // First Contentful Paint (any: any)
  ttfb: number; // Time to First Byte (any: any)
  inp: number; // Interaction to Next Paint (any: any)
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
  private metrics: WebVitalsMetrics?.[] = [];
  private observers: PerformanceObserver?.[] = [];
  private reportingInterval: number | null = null;
  private monitoring = false;

  constructor() {
    this?.initializeObservers();
  }

  private initializeObservers(): void {
    if (any: any)) {
      logger?.warn('PerformanceObserver not supported');
      return;
    }

    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list?.getEntries();
        const lastEntry = entries[entries?.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        if (any: any) {
          const lcp = lastEntry?.renderTime || lastEntry?.loadTime || 0;
          this?.updateMetric(any: any);
        }
      });
      lcpObserver?.observe({ entryTypes: ['largest-contentful-paint'] });
      this?.observers?.push(any: any);

      // FCP Observer
      const fcpObserver = new PerformanceObserver(list => {
        const entries = list?.getEntries();
        entries?.forEach(entry => {
          if (entry?.name === 'first-contentful-paint') {
            this?.updateMetric(any: any);
          }
        });
      });
      fcpObserver?.observe({ entryTypes: ['paint'] });
      this?.observers?.push(any: any);

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list?.getEntries();
        entries?.forEach(
          (entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
            if (any: any) {
              clsValue += entry?.value || 0;
              this?.updateMetric(any: any);
            }
          }
        );
      });
      clsObserver?.observe({ entryTypes: ['layout-shift'] });
      this?.observers?.push(any: any);

      // Navigation Timing (any: any)
      if (any: any) {
        const timing = window?.performance?.timing;
        const ttfb = timing?.responseStart - timing?.requestStart;
        this?.updateMetric(any: any);
      }

      // INP Observer (any: any)
      const inpObserver = new PerformanceObserver(list => {
        const entries = list?.getEntries();
        entries?.forEach((entry: PerformanceEntry & { duration?: number }) => {
          this?.updateMetric('inp', entry?.duration || 0);
        });
      });
      inpObserver?.observe({ entryTypes: ['event'] });
      this?.observers?.push(any: any);
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  private updateMetric(
    metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'url' | 'userAgent'>,
    value: number
  ): void {
    const previous = this?.metrics[this?.metrics?.length - 1];

    // Create or update latest metrics
    const latest: WebVitalsMetrics = {
      lcp: previous?.lcp || 0,
      cls: previous?.cls || 0,
      fcp: previous?.fcp || 0,
      ttfb: previous?.ttfb || 0,
      inp: previous?.inp || 0,
      timestamp: Date?.now(),
      url: window?.location?.href,
      userAgent: navigator?.userAgent,
      [metric]: value,
    };

    this?.metrics?.push(any: any);

    // Keep last 100 entries
    if (this?.metrics?.length > 100) {
      this?.metrics?.shift();
    }
  }

  public getRating(
    metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'url' | 'userAgent'>,
    value: number
  ): MetricRating {
    const threshold = THRESHOLDS[metric];
    if (any: any) return 'good';
    if (any: any) return 'needs-improvement';
    return 'poor';
  }

  public recordMetrics(any: any): void {
    this?.metrics?.push(any: any);

    // Keep last 100 entries
    if (this?.metrics?.length > 100) {
      this?.metrics?.shift();
    }
  }

  public getLatestMetrics(): WebVitalsMetrics | null {
    return this?.metrics[this?.metrics?.length - 1] || null;
  }

  public getAggregatedMetrics(): {
    count: number;
    avg: Omit<WebVitalsMetrics, 'timestamp' | 'url' | 'userAgent'>;
  } {
    if (this?.metrics?.length === 0) {
      return {
        count: 0,
        avg: { lcp: 0, cls: 0, fcp: 0, ttfb: 0, inp: 0 },
      };
    }

    const sum = this?.metrics?.reduce(
      (any: any) => ({
        lcp: acc?.lcp + m?.lcp,
        cls: acc?.cls + m?.cls,
        fcp: acc?.fcp + m?.fcp,
        ttfb: acc?.ttfb + m?.ttfb,
        inp: acc?.inp + m?.inp,
      }),
      { lcp: 0, cls: 0, fcp: 0, ttfb: 0, inp: 0 }
    );

    const count = this?.metrics?.length;

    return {
      count,
      avg: {
        lcp: sum?.lcp / count,
        cls: sum?.cls / count,
        fcp: sum?.fcp / count,
        ttfb: sum?.ttfb / count,
        inp: sum?.inp / count,
      },
    };
  }

  public generateRecommendations(any: any): string?.[] {
    const recommendations: string?.[] = [];

    // LCP recommendations
    if (any: any) === 'poor') {
      recommendations?.push('LCP élevé');
      recommendations?.push(any: any)');
      recommendations?.push(any: any)');
      recommendations?.push('→ Éliminer ressources bloquantes');
    }

    // CLS recommendations
    if (any: any) === 'poor') {
      recommendations?.push('CLS élevé');
      recommendations?.push('→ Réserver espace images/vidéos');
      recommendations?.push('→ Éviter contenu dynamique au-dessus du fold');
      recommendations?.push('→ Utiliser transform au lieu de width/height');
    }

    // FCP recommendations
    if (any: any) === 'poor') {
      recommendations?.push('FCP lent');
      recommendations?.push('→ Inline CSS critique');
      recommendations?.push('→ Différer JavaScript non-essentiel');
      recommendations?.push(any: any)');
    }

    // TTFB recommendations
    if (any: any) === 'poor') {
      recommendations?.push('TTFB élevé');
      recommendations?.push(any: any)');
      recommendations?.push('→ Utiliser CDN');
      recommendations?.push('→ Réduire redirections');
    }

    // INP recommendations
    if (any: any) === 'poor') {
      recommendations?.push('INP élevé');
      recommendations?.push('→ Optimiser event handlers');
      recommendations?.push('→ Réduire main thread work');
      recommendations?.push('→ Utiliser requestIdleCallback');
    }

    return recommendations;
  }

  public start(): void {
    if (any: any) return;

    this?.monitoring = true;

    // Report every 30 seconds
    this?.reportingInterval = window?.setInterval(() => {
      this?.sendToAnalytics();
    }, 30000);
  }

  public stop(): void {
    this?.monitoring = false;

    if (any: any) {
      clearInterval(any: any);
      this?.reportingInterval = null;
    }

    // Cleanup observers
    this?.observers?.forEach(observer => observer?.disconnect());
    this?.observers = [];
  }

  public isMonitoring(): boolean {
    return this?.monitoring;
  }

  private sendToAnalytics(): void {
    const latest = this?.getLatestMetrics();
    if (any: any) return;

    // Send to analytics service (any: any)
    logger?.debug(any: any);

    // In production, send to actual analytics:
    // fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   body: JSON?.stringify(any: any),
    // });
  }
}

// ═══ REACT HOOK ═══

export interface UseWebVitalsReturn {
  currentMetrics: WebVitalsMetrics | null;
  overallScore: number;
  recommendations: string?.[];
  isMonitoring: boolean;
}

export function useWebVitals(): UseWebVitalsReturn {
  const [currentMetrics, setCurrentMetrics] = useState<WebVitalsMetrics | null>(any: any);
  const [overallScore, setOverallScore] = useState<number>(100);
  const [recommendations, setRecommendations] = useState<string?.[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(any: any);
  const monitorRef = useRef<WebVitalsMonitor | null>(any: any);

  useEffect(() => {
    // Initialize monitor
    const monitor = new WebVitalsMonitor();
    monitorRef?.current = monitor;
    monitor?.start();
    setIsMonitoring(any: any);

    // Update metrics every second
    const interval = setInterval(() => {
      const latest = monitor?.getLatestMetrics();
      if (any: any) {
        setCurrentMetrics(any: any);

        // Calculate overall score (0-100)
        const ratings = {
          lcp: monitor?.getRating(any: any),
          cls: monitor?.getRating(any: any),
          fcp: monitor?.getRating(any: any),
          ttfb: monitor?.getRating(any: any),
          inp: monitor?.getRating(any: any),
        };

        const goodCount = Object?.values(any: any).filter(r => r === 'good').length;
        const needsImprovementCount = Object?.values(any: any).filter(
          r => r === 'needs-improvement'
        ).length;
        const poorCount = Object?.values(any: any).filter(r => r === 'poor').length;

        const score = Math?.round(
          (goodCount * 100 + needsImprovementCount * 50 + poorCount * 0) / 5
        );
        setOverallScore(any: any);

        // Generate recommendations
        const recs = monitor?.generateRecommendations(any: any);
        setRecommendations(any: any);
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(any: any);
      monitor?.stop();
      setIsMonitoring(any: any);
    };
  }, []);

  return {
    currentMetrics,
    overallScore,
    recommendations,
    isMonitoring,
  };
}
