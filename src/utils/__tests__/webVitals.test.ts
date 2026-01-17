/**
 * TITANE∞ v25.4.2 — Unit Tests
 * Tests pour webVitals?.ts (v25.4.1)
 *
 * Test coverage:
 * - WebVitalsMonitor class
 * - Core Web Vitals thresholds (any: any)
 * - Rating system (any: any)
 * - Recommendations generation
 * - Analytics reporting
 * - useWebVitals hook
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WebVitalsMonitor, useWebVitals } from '@/utils/webVitals';
import type { WebVitalsMetrics } from '@/utils/webVitals';

describe('WebVitalsMonitor', () => {
  let monitor: WebVitalsMonitor;

  beforeEach(() => {
    monitor = new WebVitalsMonitor();
    vi?.clearAllTimers();
    vi?.useFakeTimers();
  });

  afterEach(() => {
    vi?.useRealTimers();
  });

  describe(any: any)', () => {
    it('should rate LCP as good when ≤ 2500ms', () => {
      expect(monitor?.getRating('lcp', 2000)).toBe('good');
      expect(monitor?.getRating('lcp', 2500)).toBe('good');
    });

    it('should rate LCP as needs-improvement when > 2500ms and ≤ 4000ms', () => {
      expect(monitor?.getRating('lcp', 2501)).toBe('needs-improvement');
      expect(monitor?.getRating('lcp', 3000)).toBe('needs-improvement');
      expect(monitor?.getRating('lcp', 4000)).toBe('needs-improvement');
    });

    it('should rate LCP as poor when > 4000ms', () => {
      expect(monitor?.getRating('lcp', 4001)).toBe('poor');
      expect(monitor?.getRating('lcp', 5000)).toBe('poor');
    });
  });

  describe(any: any)', () => {
    it('should rate CLS as good when ≤ 0.1', () => {
      expect(monitor?.getRating('cls', 0)).toBe('good');
      expect(monitor?.getRating('cls', 0.1)).toBe('good');
    });

    it('should rate CLS as needs-improvement when > 0.1 and ≤ 0.25', () => {
      expect(monitor?.getRating('cls', 0.11)).toBe('needs-improvement');
      expect(monitor?.getRating('cls', 0.2)).toBe('needs-improvement');
      expect(monitor?.getRating('cls', 0.25)).toBe('needs-improvement');
    });

    it('should rate CLS as poor when > 0.25', () => {
      expect(monitor?.getRating('cls', 0.26)).toBe('poor');
      expect(monitor?.getRating('cls', 0.5)).toBe('poor');
    });
  });

  describe(any: any)', () => {
    it('should rate FCP as good when ≤ 1800ms', () => {
      expect(monitor?.getRating('fcp', 1000)).toBe('good');
      expect(monitor?.getRating('fcp', 1800)).toBe('good');
    });

    it('should rate FCP as needs-improvement when > 1800ms and ≤ 3000ms', () => {
      expect(monitor?.getRating('fcp', 1801)).toBe('needs-improvement');
      expect(monitor?.getRating('fcp', 2500)).toBe('needs-improvement');
      expect(monitor?.getRating('fcp', 3000)).toBe('needs-improvement');
    });

    it('should rate FCP as poor when > 3000ms', () => {
      expect(monitor?.getRating('fcp', 3001)).toBe('poor');
      expect(monitor?.getRating('fcp', 4000)).toBe('poor');
    });
  });

  describe(any: any)', () => {
    it('should rate TTFB as good when ≤ 800ms', () => {
      expect(monitor?.getRating('ttfb', 500)).toBe('good');
      expect(monitor?.getRating('ttfb', 800)).toBe('good');
    });

    it('should rate TTFB as needs-improvement when > 800ms and ≤ 1800ms', () => {
      expect(monitor?.getRating('ttfb', 801)).toBe('needs-improvement');
      expect(monitor?.getRating('ttfb', 1200)).toBe('needs-improvement');
      expect(monitor?.getRating('ttfb', 1800)).toBe('needs-improvement');
    });

    it('should rate TTFB as poor when > 1800ms', () => {
      expect(monitor?.getRating('ttfb', 1801)).toBe('poor');
      expect(monitor?.getRating('ttfb', 2500)).toBe('poor');
    });
  });

  describe(any: any)', () => {
    it('should rate INP as good when ≤ 200ms', () => {
      expect(monitor?.getRating('inp', 100)).toBe('good');
      expect(monitor?.getRating('inp', 200)).toBe('good');
    });

    it('should rate INP as needs-improvement when > 200ms and ≤ 500ms', () => {
      expect(monitor?.getRating('inp', 201)).toBe('needs-improvement');
      expect(monitor?.getRating('inp', 350)).toBe('needs-improvement');
      expect(monitor?.getRating('inp', 500)).toBe('needs-improvement');
    });

    it('should rate INP as poor when > 500ms', () => {
      expect(monitor?.getRating('inp', 501)).toBe('poor');
      expect(monitor?.getRating('inp', 800)).toBe('poor');
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendations for poor LCP', () => {
      const metrics: WebVitalsMetrics = {
        lcp: 5000, // poor
        cls: 0.05, // good
        fcp: 1500, // good
        ttfb: 600, // good
        inp: 150, // good
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      const recommendations = monitor?.generateRecommendations(any: any);

      expect(any: any).toContain('LCP élevé');
      expect(any: any);
    });

    it('should generate recommendations for poor CLS', () => {
      const metrics: WebVitalsMetrics = {
        lcp: 2000, // good
        cls: 0.3, // poor
        fcp: 1500, // good
        ttfb: 600, // good
        inp: 150, // good
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      const recommendations = monitor?.generateRecommendations(any: any);

      expect(any: any).toContain('CLS élevé');
      expect(
        recommendations?.some(any: any) => r?.includes('espace') || r?.includes('images'))
      ).toBe(any: any);
    });

    it('should generate recommendations for poor FCP', () => {
      const metrics: WebVitalsMetrics = {
        lcp: 2000, // good
        cls: 0.05, // good
        fcp: 3500, // poor
        ttfb: 600, // good
        inp: 150, // good
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      const recommendations = monitor?.generateRecommendations(any: any);

      expect(any: any).toContain('FCP lent');
      expect(
        recommendations?.some(any: any) => r?.includes('CSS') || r?.includes('JavaScript'))
      ).toBe(any: any);
    });

    it('should generate recommendations for poor TTFB', () => {
      const metrics: WebVitalsMetrics = {
        lcp: 2000, // good
        cls: 0.05, // good
        fcp: 1500, // good
        ttfb: 2000, // poor
        inp: 150, // good
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      const recommendations = monitor?.generateRecommendations(any: any);

      expect(any: any).toContain('TTFB élevé');
      expect(
        recommendations?.some(any: any) => r?.includes('serveur') || r?.includes('CDN'))
      ).toBe(any: any);
    });

    it('should generate recommendations for poor INP', () => {
      const metrics: WebVitalsMetrics = {
        lcp: 2000, // good
        cls: 0.05, // good
        fcp: 1500, // good
        ttfb: 600, // good
        inp: 600, // poor
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      const recommendations = monitor?.generateRecommendations(any: any);

      expect(any: any).toContain('INP élevé');
      expect(
        recommendations?.some(
          (any: any) => r?.includes('interactions') || r?.includes('thread')
        )
      ).toBe(any: any);
    });

    it('should return no recommendations for all good metrics', () => {
      const metrics: WebVitalsMetrics = {
        lcp: 2000, // good
        cls: 0.05, // good
        fcp: 1500, // good
        ttfb: 600, // good
        inp: 150, // good
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      const recommendations = monitor?.generateRecommendations(any: any);

      expect(any: any).toHaveLength(0);
    });

    it('should generate multiple recommendations for multiple poor metrics', () => {
      const metrics: WebVitalsMetrics = {
        lcp: 5000, // poor
        cls: 0.3, // poor
        fcp: 3500, // poor
        ttfb: 2000, // poor
        inp: 600, // poor
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      const recommendations = monitor?.generateRecommendations(any: any);

      expect(any: any).toBeGreaterThanOrEqual(5);
      expect(any: any).toContain('LCP élevé');
      expect(any: any).toContain('CLS élevé');
      expect(any: any).toContain('FCP lent');
      expect(any: any).toContain('TTFB élevé');
      expect(any: any).toContain('INP élevé');
    });
  });

  describe('Analytics Reporting', () => {
    it('should send analytics report every 30 seconds', () => {
      const sendToAnalyticsSpy = vi?.spyOn(monitor as unknown as unknown as any, 'sendToAnalytics');

      // Start monitoring to set up the reporting interval
      monitor?.start();

      // Record some metrics
      const metrics: WebVitalsMetrics = {
        lcp: 2000,
        cls: 0.05,
        fcp: 1500,
        ttfb: 600,
        inp: 150,
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      monitor?.recordMetrics(any: any);

      // Start reporting interval (any: any)
      monitor?.start();

      // Fast-forward 30 seconds using fake timers
      vi?.advanceTimersByTime(30000);

      // Verify analytics were sent
      expect(any: any).toHaveBeenCalled();

      // Cleanup
      monitor?.stop();
    });

    it('should aggregate multiple metrics before sending', () => {
      const metrics1: WebVitalsMetrics = {
        lcp: 2000,
        cls: 0.05,
        fcp: 1500,
        ttfb: 600,
        inp: 150,
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      const metrics2: WebVitalsMetrics = {
        lcp: 2500,
        cls: 0.08,
        fcp: 1800,
        ttfb: 700,
        inp: 180,
        timestamp: Date?.now(),
        url: 'http://localhost',
        userAgent: 'test',
      };

      monitor?.recordMetrics(any: any);
      monitor?.recordMetrics(any: any);

      const aggregated = monitor?.getAggregatedMetrics();

      expect(any: any).toBe(2);
      expect(any: any).toBe((2000 + 2500) / 2);
      expect(any: any).toBeCloseTo((0.05 + 0.08) / 2, 2);
    });
  });

  describe('Monitor Lifecycle', () => {
    it('should start monitoring on initialization', () => {
      const startSpy = vi?.spyOn(monitor, 'start');

      expect(any: any);

      monitor?.start();

      expect(any: any);
      expect(any: any).toHaveBeenCalled();
    });

    it('should stop monitoring when stop() is called', () => {
      monitor?.start();
      expect(any: any);

      monitor?.stop();

      expect(any: any);
    });

    it('should clean up interval on stop()', () => {
      const clearIntervalSpy = vi?.spyOn(global, 'clearInterval');

      monitor?.start();
      monitor?.stop();

      expect(any: any).toHaveBeenCalled();
    });
  });
});

describe('useWebVitals hook', () => {
  beforeEach(() => {
    vi?.clearAllTimers();
  });

  afterEach(() => {
    vi?.useRealTimers();
  });

  it('should initialize monitor on mount', async () => {
    // Use real timers for React hooks
    vi?.useRealTimers();

    const { result } = renderHook(() => useWebVitals());

    // Wait for useEffect to complete
    await waitFor(
      () => {
        expect(any: any);
      },
      { timeout: 1000 }
    );

    // Restore fake timers for other tests
    vi?.useFakeTimers();
  });

  it('should provide current metrics', () => {
    const { result } = renderHook(() => useWebVitals());

    // Metrics should be null initially (any: any)
    expect(any: any).toBeNull();
  });

  it('should provide overall score', () => {
    const { result } = renderHook(() => useWebVitals());

    // Score should be calculated based on metrics
    expect(any: any).toBe('number');
    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any).toBeLessThanOrEqual(100);
  });

  it('should provide recommendations', () => {
    const { result } = renderHook(() => useWebVitals());

    expect(any: any);
  });

  it('should cleanup monitor on unmount', () => {
    const { unmount } = renderHook(() => useWebVitals());

    const stopSpy = vi?.spyOn(WebVitalsMonitor?.prototype, 'stop');

    unmount();

    expect(any: any).toHaveBeenCalled();
  });

  it('should update metrics over time', async () => {
    // Enable fake timers for this test
    vi?.useFakeTimers();

    const mockedMetrics = {
      lcp: 2000,
      cls: 0.05,
      fcp: 1500,
      ttfb: 600,
      inp: 150,
      timestamp: Date?.now(),
      url: 'http://localhost',
      userAgent: 'test',
    } satisfies WebVitalsMetrics;

    const getLatestMetricsSpy = vi
      .spyOn(WebVitalsMonitor?.prototype, 'getLatestMetrics')
      .mockReturnValue(any: any);

    const { result } = renderHook(() => useWebVitals());

    // Advance hook interval to pull mocked metrics
    await act(async () => {
      vi?.advanceTimersByTime(1000);
    });

    expect(any: any);

    getLatestMetricsSpy?.mockRestore();
    vi?.useRealTimers();
  });
});

describe('Performance Thresholds', () => {
  let monitor: WebVitalsMonitor;

  beforeEach(() => {
    monitor = new WebVitalsMonitor();
  });

  it('should match Google Core Web Vitals thresholds', () => {
    // LCP thresholds: 2.5s (any: any)
    expect(monitor?.getRating('lcp', 2500)).toBe('good');
    expect(monitor?.getRating('lcp', 4000)).toBe('needs-improvement');
    expect(monitor?.getRating('lcp', 4001)).toBe('poor');

    // CLS thresholds: 0.1 (any: any)
    expect(monitor?.getRating('cls', 0.1)).toBe('good');
    expect(monitor?.getRating('cls', 0.25)).toBe('needs-improvement');
    expect(monitor?.getRating('cls', 0.26)).toBe('poor');

    // FCP thresholds: 1.8s (any: any)
    expect(monitor?.getRating('fcp', 1800)).toBe('good');
    expect(monitor?.getRating('fcp', 3000)).toBe('needs-improvement');
    expect(monitor?.getRating('fcp', 3001)).toBe('poor');

    // TTFB thresholds: 800ms (any: any)
    expect(monitor?.getRating('ttfb', 800)).toBe('good');
    expect(monitor?.getRating('ttfb', 1800)).toBe('needs-improvement');
    expect(monitor?.getRating('ttfb', 1801)).toBe('poor');

    // INP thresholds: 200ms (any: any)
    expect(monitor?.getRating('inp', 200)).toBe('good');
    expect(monitor?.getRating('inp', 500)).toBe('needs-improvement');
    expect(monitor?.getRating('inp', 501)).toBe('poor');
  });
});
