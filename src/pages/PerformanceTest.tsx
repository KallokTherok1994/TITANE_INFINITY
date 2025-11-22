/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — PERFORMANCE TEST PAGE
 *   Test automatisé des performances Living Engines
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef } from 'react';
import { useLivingEngines } from '../hooks';
import './DevTools.v20.css';

interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  frameTime: number;
  renderCount: number;
  updateTime: number;
  memoryUsed: number;
  timestamp: number;
}

export const PerformanceTest = () => {
  const livingEngines = useLivingEngines(100);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    avgFps: 0,
    minFps: Infinity,
    maxFps: 0,
    frameTime: 0,
    renderCount: 0,
    updateTime: 0,
    memoryUsed: 0,
    timestamp: Date.now(),
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const renderStartRef = useRef(performance.now());

  // FPS Counter
  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        fpsHistoryRef.current.push(currentFps);

        // Keep last 10 seconds
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }

        const avgFps = Math.round(
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
        );
        const minFps = Math.min(...fpsHistoryRef.current);
        const maxFps = Math.max(...fpsHistoryRef.current);

        setMetrics(prev => ({
          ...prev,
          fps: currentFps,
          avgFps,
          minFps,
          maxFps,
          frameTime: delta / frameCountRef.current,
          renderCount: prev.renderCount + frameCountRef.current,
          timestamp: Date.now(),
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      frameCountRef.current++;
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Memory monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if ((performance as any).memory) {
        const memoryMB = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
        setMetrics(prev => ({ ...prev, memoryUsed: memoryMB }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Measure update time
  useEffect(() => {
    const start = performance.now();
    renderStartRef.current = start;

    return () => {
      const end = performance.now();
      const updateTime = end - renderStartRef.current;
      setMetrics(prev => ({ ...prev, updateTime }));
    };
  }, [livingEngines.state]);

  const getStatus = (value: number, good: number, warning: number) => {
    if (value >= good) return 'good';
    if (value >= warning) return 'warning';
    return 'critical';
  };

  const fpsStatus = getStatus(metrics.fps, 55, 45);
  const avgFpsStatus = getStatus(metrics.avgFps, 55, 45);

  return (
    <div className="devtools-page" style={{ background: '#0a0e1a' }}>
      {/* Header */}
      <div style={{
        padding: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '0.5rem'
        }}>
          ⚡ Performance Test — TITANE∞ v24
        </h1>
        <p style={{ color: '#8892a6', fontSize: '0.95rem' }}>
          Real-time performance monitoring with Living Engines (100ms update interval)
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        padding: '2rem'
      }}>
        {/* FPS Card */}
        <div className="living-engines-card">
          <div className="living-engines-card__header">
            <h3 className="living-engines-card__title">🎯 FPS (Current)</h3>
            <span className={`living-engines-card__badge living-engines-card__badge--${fpsStatus}`}>
              {metrics.fps}
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              {metrics.fps}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8892a6' }}>
              Target: ≥55 FPS
            </div>
            <div style={{
              marginTop: '1rem',
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((metrics.fps / 60) * 100, 100)}%`,
                height: '100%',
                background: fpsStatus === 'good' ? '#10b981' : fpsStatus === 'warning' ? '#f59e0b' : '#ef4444',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Average FPS */}
        <div className="living-engines-card">
          <div className="living-engines-card__header">
            <h3 className="living-engines-card__title">📊 Average FPS</h3>
            <span className={`living-engines-card__badge living-engines-card__badge--${avgFpsStatus}`}>
              {metrics.avgFps}
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              {metrics.avgFps}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8892a6' }}>Min</div>
                <div style={{ fontSize: '1.25rem', color: '#10b981' }}>{metrics.minFps === Infinity ? '-' : metrics.minFps}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8892a6' }}>Max</div>
                <div style={{ fontSize: '1.25rem', color: '#3b82f6' }}>{metrics.maxFps}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Frame Time */}
        <div className="living-engines-card">
          <div className="living-engines-card__header">
            <h3 className="living-engines-card__title">⏱️ Frame Time</h3>
            <span className="living-engines-card__badge">
              {metrics.frameTime.toFixed(2)}ms
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              {metrics.frameTime.toFixed(2)}ms
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8892a6' }}>
              Target: &lt;16.67ms (60 FPS)
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#8892a6', marginBottom: '0.25rem' }}>
                Status: {metrics.frameTime < 16.67 ? '✅ Good' : metrics.frameTime < 22 ? '⚠️ Warning' : '❌ Critical'}
              </div>
            </div>
          </div>
        </div>

        {/* Update Time */}
        <div className="living-engines-card">
          <div className="living-engines-card__header">
            <h3 className="living-engines-card__title">🔄 Update Time</h3>
            <span className="living-engines-card__badge">
              {metrics.updateTime.toFixed(2)}ms
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              {metrics.updateTime.toFixed(2)}ms
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8892a6' }}>
              Living Engines update (100ms interval)
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#8892a6' }}>
                Status: {metrics.updateTime < 50 ? '✅ Optimal' : '⚠️ Slow'}
              </div>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="living-engines-card">
          <div className="living-engines-card__header">
            <h3 className="living-engines-card__title">💾 Memory</h3>
            <span className="living-engines-card__badge">
              {metrics.memoryUsed.toFixed(0)}MB
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              {metrics.memoryUsed.toFixed(1)}MB
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8892a6' }}>
              JS Heap Size
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#8892a6' }}>
                {metrics.memoryUsed > 0 ? 'Monitoring active' : 'Not available in this browser'}
              </div>
            </div>
          </div>
        </div>

        {/* Render Count */}
        <div className="living-engines-card">
          <div className="living-engines-card__header">
            <h3 className="living-engines-card__title">🎨 Render Count</h3>
            <span className="living-engines-card__badge">
              {metrics.renderCount}
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              {metrics.renderCount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8892a6' }}>
              Total frames rendered
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#8892a6' }}>
                Since page load
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Living Engines State Preview */}
      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        <div className="living-engines-card">
          <div className="living-engines-card__header">
            <h3 className="living-engines-card__title">🌟 Living Engines State</h3>
            <span className="living-engines-card__badge">
              {livingEngines.state.systemState}
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8892a6', marginBottom: '0.25rem' }}>Glow</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>
                  {(livingEngines.state.glow * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8892a6', marginBottom: '0.25rem' }}>Motion</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
                  {(livingEngines.state.motion * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8892a6', marginBottom: '0.25rem' }}>Depth</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6' }}>
                  {(livingEngines.state.depth * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8892a6', marginBottom: '0.25rem' }}>Sound</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b' }}>
                  {(livingEngines.state.sound * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8892a6', marginBottom: '0.25rem' }}>Cognitive Load</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ef4444' }}>
                  {(livingEngines.state.cognitiveLoad * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#8892a6', marginBottom: '0.25rem' }}>Rhythm Score</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#14b8a6' }}>
                  {livingEngines.state.rhythmScore.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        <div className="living-engines-card">
          <div className="living-engines-card__header">
            <h3 className="living-engines-card__title">📋 Performance Summary</h3>
            <span className="living-engines-card__badge living-engines-card__badge--good">
              {metrics.avgFps >= 55 && metrics.frameTime < 16.67 ? 'EXCELLENT' :
               metrics.avgFps >= 45 ? 'GOOD' : 'NEEDS OPTIMIZATION'}
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#8892a6' }}>Target FPS (≥55)</span>
                <span style={{
                  color: metrics.avgFps >= 55 ? '#10b981' : metrics.avgFps >= 45 ? '#f59e0b' : '#ef4444',
                  fontWeight: 600
                }}>
                  {metrics.avgFps >= 55 ? '✅ PASSED' : metrics.avgFps >= 45 ? '⚠️ WARNING' : '❌ FAILED'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#8892a6' }}>Frame Time (&lt;16.67ms)</span>
                <span style={{
                  color: metrics.frameTime < 16.67 ? '#10b981' : metrics.frameTime < 22 ? '#f59e0b' : '#ef4444',
                  fontWeight: 600
                }}>
                  {metrics.frameTime < 16.67 ? '✅ PASSED' : metrics.frameTime < 22 ? '⚠️ WARNING' : '❌ FAILED'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#8892a6' }}>Update Time (&lt;50ms)</span>
                <span style={{
                  color: metrics.updateTime < 50 ? '#10b981' : '#f59e0b',
                  fontWeight: 600
                }}>
                  {metrics.updateTime < 50 ? '✅ PASSED' : '⚠️ WARNING'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#8892a6' }}>Memory Stable</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>
                  ✅ MONITORING
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
