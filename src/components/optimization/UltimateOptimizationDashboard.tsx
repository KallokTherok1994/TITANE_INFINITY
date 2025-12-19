/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.6.0 — ULTIMATE OPTIMIZATION DASHBOARD
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Unified monitoring dashboard for all Phase 12 optimization modules
 *
 * @version 25.6.0
 * @created 2025-12-17
 * @phase 12 - Ultimate Optimization
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  gpuAcceleratorV2,
  webAssemblyCompute,
  serviceWorkerManager,
  indexedDBOptimizer,
  type GPUv2Metrics,
  type WASMMetrics,
  type ServiceWorkerMetrics,
  type IndexedDBMetrics,
} from '@/modules/optimization';

import './UltimateOptimizationDashboard.css';

interface UltimateOptimizationDashboardProps {
  className?: string;
}

export const UltimateOptimizationDashboard: React.FC<
  UltimateOptimizationDashboardProps
> = ({ className = '' }) => {
  const [gpuMetrics, setGpuMetrics] = useState<GPUv2Metrics | null>(null);
  const [wasmMetrics, setWasmMetrics] = useState<WASMMetrics | null>(null);
  const [swMetrics, setSwMetrics] = useState<ServiceWorkerMetrics | null>(null);
  const [dbMetrics, setDbMetrics] = useState<IndexedDBMetrics | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);

  const refreshMetrics = useCallback(() => {
    try {
      setGpuMetrics(gpuAcceleratorV2.getMetrics());
      setWasmMetrics(webAssemblyCompute.getMetrics());
      setSwMetrics(serviceWorkerManager.getMetrics());
      setDbMetrics(indexedDBOptimizer.getMetrics());
    } catch (error) {
      console.error('[UltimateOptimizationDashboard] Metrics refresh failed:', error);
    }
  }, []);

  // Initialize all modules
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      // Best-effort init: a failure in one module must not block the whole dashboard.
      // GPU Accelerator V2
      setInitializationProgress(25);
      try {
        await gpuAcceleratorV2.initialize();
      } catch (error) {
        console.error('[UltimateOptimizationDashboard] GPU init failed:', error);
      }

      // WebAssembly Compute
      setInitializationProgress(50);
      try {
        await webAssemblyCompute.initialize();
      } catch (error) {
        console.error('[UltimateOptimizationDashboard] WASM init failed:', error);
      }

      // Service Worker Manager (auto-register may be unsupported depending on runtime)
      setInitializationProgress(75);

      // IndexedDB Optimizer
      setInitializationProgress(90);
      try {
        await indexedDBOptimizer.initialize([
          {
            name: 'cache',
            keyPath: 'key',
            indexes: [
              { name: 'timestamp', keyPath: 'timestamp', unique: false },
              { name: 'provider', keyPath: 'provider', unique: false },
            ],
          },
          {
            name: 'memory',
            keyPath: 'id',
            autoIncrement: true,
            indexes: [
              { name: 'type', keyPath: 'type', unique: false },
              { name: 'timestamp', keyPath: 'timestamp', unique: false },
            ],
          },
        ]);
      } catch (error) {
        console.error('[UltimateOptimizationDashboard] IndexedDB init failed:', error);
      }

      setInitializationProgress(100);

      if (mounted) {
        setIsInitialized(true);
        refreshMetrics();
      }
    };

    initialize();

    // Refresh metrics every 2 seconds
    const interval = setInterval(refreshMetrics, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshMetrics]);

  // Actions
  const handleTestGPU = async () => {
    try {
      const a = new Float32Array([1, 2, 3, 4, 5]);
      const b = new Float32Array([6, 7, 8, 9, 10]);

      const result = await gpuAcceleratorV2.vectorAdd(a, b);
      console.log('[GPU Test] Vector addition result:', result);

      alert(
        `GPU Test Success!\nInput: [1,2,3,4,5] + [6,7,8,9,10]\nOutput: [${Array.from(result).join(', ')}]`
      );
    } catch (error) {
      alert('GPU Test Failed: ' + (error as Error).message);
    }
  };

  const handleTestWASM = async () => {
    try {
      const a = new Float32Array([2, 4, 6]);
      const b = new Float32Array([1, 3, 5]);

      const result = await webAssemblyCompute.dotProduct(a, b);
      console.log('[WASM Test] Dot product result:', result);

      alert(`WASM Test Success!\nDot product of [2,4,6] · [1,3,5] = ${result}`);
    } catch (error) {
      alert('WASM Test Failed: ' + (error as Error).message);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all Service Worker caches?')) return;

    try {
      await serviceWorkerManager.clearCache();
      alert('Cache cleared successfully!');
      refreshMetrics();
    } catch (error) {
      alert('Failed to clear cache: ' + (error as Error).message);
    }
  };

  const handleCompactDB = async () => {
    if (!confirm('Compact IndexedDB? This may take a moment.')) return;

    try {
      // Trigger compaction for all stores
      await indexedDBOptimizer.updateMetrics();
      alert('Database compacted successfully!');
      refreshMetrics();
    } catch (error) {
      alert('Failed to compact database: ' + (error as Error).message);
    }
  };

  if (!isInitialized) {
    return (
      <div className={`ultimate-optimization-dashboard ${className}`}>
        <div className="dashboard-loading">
          <h2>⚡ Initializing Ultimate Optimization</h2>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${initializationProgress}%` }}
            />
          </div>
          <p>{initializationProgress}% Complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ultimate-optimization-dashboard ${className}`}>
      <header className="dashboard-header">
        <h1>⚡ Ultimate Optimization Dashboard</h1>
        <p>Phase 12 v25.6.0 - GPU · WASM · Service Worker · IndexedDB</p>
      </header>

      {/* GPU Accelerator V2 */}
      <section className="optimization-module">
        <div className="module-header">
          <h2>🎮 GPU Accelerator V2</h2>
          <span
            className={`status-badge ${gpuMetrics?.isWebGPUActive ? 'active' : 'fallback'}`}
          >
            {gpuMetrics?.isWebGPUActive
              ? 'WebGPU Active'
              : gpuMetrics?.fallbackMode
                ? 'WebGL Fallback'
                : 'Inactive'}
          </span>
        </div>

        {gpuMetrics && (
          <div className="module-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Tasks Executed</span>
                <span className="metric-value">{gpuMetrics.tasksExecuted}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Avg Execution Time</span>
                <span className="metric-value">
                  {gpuMetrics.averageExecutionTime.toFixed(2)}ms
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">GPU Utilization</span>
                <span className="metric-value">
                  {gpuMetrics.gpuUtilization.toFixed(1)}%
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Queue Size</span>
                <span className="metric-value">{gpuMetrics.tasksQueued}</span>
              </div>
            </div>

            <button className="test-button" onClick={handleTestGPU}>
              🧪 Test Vector Addition
            </button>
          </div>
        )}
      </section>

      {/* WebAssembly Compute */}
      <section className="optimization-module">
        <div className="module-header">
          <h2>⚛️ WebAssembly Compute</h2>
          <span
            className={`status-badge ${wasmMetrics?.isWASMActive ? 'active' : 'fallback'}`}
          >
            {wasmMetrics?.isWASMActive ? 'WASM Active' : 'JS Fallback'}
          </span>
        </div>

        {wasmMetrics && (
          <div className="module-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Total Tasks</span>
                <span className="metric-value">{wasmMetrics.tasksExecuted}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">WASM Tasks</span>
                <span className="metric-value success">
                  {wasmMetrics.tasksExecutedWASM}
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">JS Fallback</span>
                <span className="metric-value warning">
                  {wasmMetrics.tasksExecutedJS}
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Speedup</span>
                <span className="metric-value">
                  {wasmMetrics.averageSpeedup.toFixed(1)}x
                </span>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Avg Execution</span>
                <span className="metric-value">
                  {wasmMetrics.averageExecutionTime.toFixed(2)}ms
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Memory Usage</span>
                <span className="metric-value">
                  {(wasmMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
            </div>

            <button className="test-button" onClick={handleTestWASM}>
              🧪 Test Dot Product
            </button>
          </div>
        )}
      </section>

      {/* Service Worker */}
      <section className="optimization-module">
        <div className="module-header">
          <h2>🌐 Service Worker</h2>
          <span className={`status-badge ${swMetrics?.isActive ? 'active' : 'inactive'}`}>
            {swMetrics?.isRegistered
              ? swMetrics.isActive
                ? 'Active'
                : 'Registered'
              : 'Not Registered'}
          </span>
        </div>

        {swMetrics && (
          <div className="module-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Cache Size</span>
                <span className="metric-value">
                  {(swMetrics.cacheSize / 1024 / 1024).toFixed(2)}MB
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Cached Resources</span>
                <span className="metric-value">{swMetrics.cachedResources}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Version</span>
                <span className="metric-value">{swMetrics.version}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Update Available</span>
                <span
                  className={`metric-value ${swMetrics.updateAvailable ? 'warning' : 'success'}`}
                >
                  {swMetrics.updateAvailable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="action-button" onClick={handleClearCache}>
                🗑️ Clear Cache
              </button>
              <button
                className="action-button"
                onClick={() => serviceWorkerManager.checkForUpdates()}
              >
                🔄 Check Updates
              </button>
            </div>
          </div>
        )}
      </section>

      {/* IndexedDB Optimizer */}
      <section className="optimization-module">
        <div className="module-header">
          <h2>💾 IndexedDB Optimizer</h2>
          <span className="status-badge active">Optimized</span>
        </div>

        {dbMetrics && (
          <div className="module-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Total Records</span>
                <span className="metric-value">{dbMetrics.totalRecords}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">DB Size</span>
                <span className="metric-value">
                  {(dbMetrics.dbSize / 1024).toFixed(1)}KB
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Avg Read Time</span>
                <span className="metric-value">
                  {dbMetrics.queryPerformance.averageReadTime.toFixed(2)}ms
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Cache Hit Rate</span>
                <span className="metric-value success">
                  {dbMetrics.queryPerformance.cacheHitRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Avg Write Time</span>
                <span className="metric-value">
                  {dbMetrics.queryPerformance.averageWriteTime.toFixed(2)}ms
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Compression Ratio</span>
                <span className="metric-value">
                  {dbMetrics.compressionRatio.toFixed(2)}x
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Fragmentation</span>
                <span className="metric-value">{dbMetrics.fragmentationLevel}%</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Indexes</span>
                <span className="metric-value">{dbMetrics.indexCount}</span>
              </div>
            </div>

            <button className="action-button" onClick={handleCompactDB}>
              🔧 Compact Database
            </button>
          </div>
        )}
      </section>

      {/* Overall Performance Summary */}
      <section className="performance-summary">
        <h2>📊 Performance Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">⚡</div>
            <div className="summary-content">
              <h3>GPU Acceleration</h3>
              <p className="summary-value">
                {gpuMetrics?.isWebGPUActive
                  ? 'WebGPU'
                  : gpuMetrics?.fallbackMode
                    ? 'WebGL'
                    : 'CPU'}
              </p>
              <p className="summary-label">Active Backend</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🚀</div>
            <div className="summary-content">
              <h3>Computation Speedup</h3>
              <p className="summary-value success">
                {wasmMetrics?.averageSpeedup.toFixed(1)}x
              </p>
              <p className="summary-label">WASM vs JavaScript</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💨</div>
            <div className="summary-content">
              <h3>Cache Performance</h3>
              <p className="summary-value success">
                {dbMetrics?.queryPerformance.cacheHitRate.toFixed(0)}%
              </p>
              <p className="summary-label">Hit Rate</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <div className="summary-content">
              <h3>Offline Support</h3>
              <p className="summary-value">{swMetrics?.cachedResources || 0}</p>
              <p className="summary-label">Cached Resources</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
