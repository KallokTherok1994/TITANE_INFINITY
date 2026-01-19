/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v19.5.2 — React Performance Profiler                    ║
 * ║   PHASE 4.3: Runtime performance measurement component            ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React, { Profiler, ProfilerOnRenderCallback, useEffect, useState } from 'react';

/**
 * Performance metrics collected by the profiler
 */
export interface PerformanceMetrics {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number; // Time spent rendering the component (ms)
  baseDuration: number; // Estimated time to render without memoization (ms)
  startTime: number; // When React began rendering this update
  commitTime: number; // When React committed this update
  interactions: Set<any>; // Set of interactions for this update
}

/**
 * Aggregate performance stats for a component
 */
export interface PerformanceStats {
  componentId: string;
  renderCount: number;
  totalRenderTime: number;
  avgRenderTime: number;
  minRenderTime: number;
  maxRenderTime: number;
  mountTime: number;
  updateTimes: number[];
  lastRendered: number;
}

// Global store for performance metrics
const performanceStore = new Map<string, PerformanceMetrics[]>();
const statsStore = new Map<string, PerformanceStats>();

/**
 * Record a performance metric
 */
function recordMetric(metric: PerformanceMetrics) {
  const metrics = performanceStore.get(metric.id) || [];
  metrics.push(metric);
  performanceStore.set(metric.id, metrics);

  // Update stats
  updateStats(metric);
}

/**
 * Update aggregate stats
 */
function updateStats(metric: PerformanceMetrics) {
  const existingStats = statsStore.get(metric.id);

  if (!existingStats) {
    // First render (mount)
    statsStore.set(metric.id, {
      componentId: metric.id,
      renderCount: 1,
      totalRenderTime: metric.actualDuration,
      avgRenderTime: metric.actualDuration,
      minRenderTime: metric.actualDuration,
      maxRenderTime: metric.actualDuration,
      mountTime: metric.actualDuration,
      updateTimes: [],
      lastRendered: metric.commitTime,
    });
  } else {
    // Update
    const renderCount = existingStats.renderCount + 1;
    const totalRenderTime = existingStats.totalRenderTime + metric.actualDuration;
    const avgRenderTime = totalRenderTime / renderCount;
    const minRenderTime = Math.min(existingStats.minRenderTime, metric.actualDuration);
    const maxRenderTime = Math.max(existingStats.maxRenderTime, metric.actualDuration);
    const updateTimes = [...existingStats.updateTimes, metric.actualDuration];

    statsStore.set(metric.id, {
      ...existingStats,
      renderCount,
      totalRenderTime,
      avgRenderTime,
      minRenderTime,
      maxRenderTime,
      updateTimes,
      lastRendered: metric.commitTime,
    });
  }
}

/**
 * Get performance stats for a component
 */
export function getComponentStats(componentId: string): PerformanceStats | undefined {
  return statsStore.get(componentId);
}

/**
 * Get all performance stats
 */
export function getAllStats(): PerformanceStats[] {
  return Array.from(statsStore.values());
}

/**
 * Get performance metrics for a component
 */
export function getComponentMetrics(componentId: string): PerformanceMetrics[] {
  return performanceStore.get(componentId) || [];
}

/**
 * Clear all performance data
 */
export function clearPerformanceData() {
  performanceStore.clear();
  statsStore.clear();
}

/**
 * Export performance data as JSON
 */
export function exportPerformanceData() {
  const stats = getAllStats();
  const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-stats-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Log performance summary to console
 */
export function logPerformanceSummary() {
  const stats = getAllStats();

  if (stats.length === 0) {
    console.log('📊 No performance data collected yet.');
    return;
  }

  console.log('📊 Performance Summary');
  console.log('═══════════════════════════════════════════════════════');

  // Sort by avg render time (slowest first)
  const sortedStats = [...stats].sort((a, b) => b.avgRenderTime - a.avgRenderTime);

  sortedStats.forEach(stat => {
    console.log(`\n🔍 ${stat.componentId}`);
    console.log(`  • Renders: ${stat.renderCount}`);
    console.log(`  • Avg: ${stat.avgRenderTime.toFixed(2)}ms`);
    console.log(`  • Min: ${stat.minRenderTime.toFixed(2)}ms`);
    console.log(`  • Max: ${stat.maxRenderTime.toFixed(2)}ms`);
    console.log(`  • Mount: ${stat.mountTime.toFixed(2)}ms`);

    if (stat.avgRenderTime > 16) {
      console.warn(`  ⚠️  Slow component (>16ms)`);
    }
  });

  console.log('\n═══════════════════════════════════════════════════════');
}

/**
 * Performance Profiler Component
 */
interface PerformanceProfilerProps {
  id: string;
  children: React.ReactNode;
  enabled?: boolean;
  logRenders?: boolean;
}

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  id,
  children,
  enabled = true,
  logRenders = false,
}) => {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    if (logRenders) {
      console.log(`🔄 ${id} mounted`);
    }
  }, [id, logRenders]);

  const onRender: ProfilerOnRenderCallback = (
    profilerId: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (!enabled) return;

    const metric: PerformanceMetrics = {
      id: profilerId,
      phase: phase === 'nested-update' ? 'update' : phase, // normalize nested-update to update
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions: new Set(), // React 18 doesn&apos;t provide interactions anymore
    };

    recordMetric(metric);
    setRenderCount(prev => prev + 1);

    if (logRenders) {
      console.log(
        `🔄 ${profilerId} (${phase}) - ${actualDuration.toFixed(2)}ms [render #${renderCount + 1}]`
      );
    }

    // Warn if render is slow
    if (actualDuration > 16) {
      console.warn(
        `⚠️  Slow render: ${profilerId} took ${actualDuration.toFixed(2)}ms (target: <16ms)`
      );
    }
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
};

/**
 * Hook to get component performance stats
 */
export function usePerformanceStats(componentId: string) {
  const [stats, setStats] = useState<PerformanceStats | undefined>(() =>
    getComponentStats(componentId)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const latestStats = getComponentStats(componentId);
      if (latestStats) {
        setStats(latestStats);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [componentId]);

  return stats;
}

/**
 * Performance Dashboard Component
 */
export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getAllStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sortedStats = [...stats].sort((a, b) => b.avgRenderTime - a.avgRenderTime);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h2>📊 Performance Dashboard</h2>
      <button onClick={logPerformanceSummary}>Log Summary</button>
      <button onClick={exportPerformanceData}>Export JSON</button>
      <button onClick={clearPerformanceData}>Clear Data</button>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Component</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Renders</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Avg (ms)</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Min (ms)</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Max (ms)</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Mount (ms)</th>
          </tr>
        </thead>
        <tbody>
          {sortedStats.map(stat => (
            <tr key={stat.componentId} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{stat.componentId}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{stat.renderCount}</td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '8px',
                  color: stat.avgRenderTime > 16 ? 'red' : 'green',
                }}
              >
                {stat.avgRenderTime.toFixed(2)}
              </td>
              <td style={{ textAlign: 'right', padding: '8px' }}>
                {stat.minRenderTime.toFixed(2)}
              </td>
              <td style={{ textAlign: 'right', padding: '8px' }}>
                {stat.maxRenderTime.toFixed(2)}
              </td>
              <td style={{ textAlign: 'right', padding: '8px' }}>
                {stat.mountTime.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__TITANE_PERFORMANCE__ = {
    getStats: getAllStats,
    getComponentStats,
    getComponentMetrics,
    clearData: clearPerformanceData,
    exportData: exportPerformanceData,
    logSummary: logPerformanceSummary,
  };
}
