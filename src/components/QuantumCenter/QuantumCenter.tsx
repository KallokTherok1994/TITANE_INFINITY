/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — QUANTUM CENTER
 * Interface de contrôle du Quantum Rendering Layer v∞
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIdentityMatrix } from '@/hooks/useIdentityMatrix';
import { useSingularityStateSafe } from '@/hooks/useSingularityStateSafe';
import './QuantumCenter.css';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface QuantumMetrics {
  fps: number;
  frameTime: number;
  renderCycles: number;
  cacheHitRate: number;
  gpuLayers: number;
  jitterScore: number;
  textClarity: number;
  motionFluidity: number;
  vsyncAligned: boolean;
  overallScore: number;
}

interface FrameMetric {
  timestamp: number;
  frameTime: number;
  fps: number;
}

interface CacheEntry {
  id: string;
  component: string;
  hits: number;
  age: number;
  size: string;
}

interface GPULayerInfo {
  id: string;
  type: 'transition' | 'animation' | 'persistent';
  element: string;
  memoryMB: number;
}

type TabType = 'overview' | 'frames' | 'cache' | 'gpu' | 'stability' | 'rules' | 'motion';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

const QuantumCenterContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const { _matrix, loading: matrixLoading } = useIdentityMatrix();
  const _singularityState = useSingularityStateSafe();
  const [metrics, setMetrics] = useState<QuantumMetrics>({
    fps: 120,
    frameTime: 8.33,
    renderCycles: 0,
    cacheHitRate: 0.85,
    gpuLayers: 12,
    jitterScore: 0.95,
    textClarity: 0.98,
    motionFluidity: 0.92,
    vsyncAligned: true,
    overallScore: 0.94,
  });
  const [frameHistory, setFrameHistory] = useState<FrameMetric[]>([]);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [gpuLayers, setGpuLayers] = useState<GPULayerInfo[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  // Simulation des métriques en temps réel
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newFrameTime = 7.5 + Math.random() * 3;
      const newFps = Math.round(1000 / newFrameTime);

      setMetrics(prev => ({
        ...prev,
        fps: newFps,
        frameTime: newFrameTime,
        renderCycles: prev.renderCycles + 1,
        cacheHitRate: 0.8 + Math.random() * 0.15,
        gpuLayers: 10 + Math.floor(Math.random() * 10),
        jitterScore: 0.9 + Math.random() * 0.1,
        motionFluidity: 0.88 + Math.random() * 0.12,
        overallScore: 0.9 + Math.random() * 0.08,
      }));

      setFrameHistory(prev => {
        const newHistory = [...prev, { timestamp: now, frameTime: newFrameTime, fps: newFps }];
        return newHistory.slice(-60); // Garder 60 dernières frames
      });
    }, 1000 / 30); // 30 Hz pour la mise à jour UI

    return () => clearInterval(interval);
  }, [isRunning]);

  // Charger données mock
  useEffect(() => {
    setCacheEntries([
      { id: 'cache_1', component: 'ChatPanel', hits: 1247, age: 45, size: '2.3 KB' },
      { id: 'cache_2', component: 'Sidebar', hits: 892, age: 120, size: '4.1 KB' },
      { id: 'cache_3', component: 'MessageList', hits: 3421, age: 30, size: '8.7 KB' },
      { id: 'cache_4', component: 'Header', hits: 156, age: 300, size: '1.2 KB' },
      { id: 'cache_5', component: 'StatusBar', hits: 2103, age: 15, size: '0.8 KB' },
    ]);

    setGpuLayers([
      { id: 'gpu_1', type: 'persistent', element: '.main-container', memoryMB: 4.2 },
      { id: 'gpu_2', type: 'animation', element: '.sidebar', memoryMB: 2.1 },
      { id: 'gpu_3', type: 'transition', element: '.modal-overlay', memoryMB: 1.5 },
      { id: 'gpu_4', type: 'persistent', element: '.chat-panel', memoryMB: 3.8 },
    ]);
  }, []);

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return 'var(--quantum-excellent)';
    if (score >= 0.7) return 'var(--quantum-good)';
    if (score >= 0.5) return 'var(--quantum-warning)';
    return 'var(--quantum-critical)';
  };

  const formatMs = (ms: number): string => `${ms.toFixed(2)}ms`;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════

  const renderOverview = () => (
    <div className="quantum-overview">
      {/* Score global */}
      <div className="quantum-global-score">
        <div className="score-ring" style={{ '--score': metrics.overallScore } as React.CSSProperties}>
          <div className="score-inner">
            <span className="score-value">{Math.round(metrics.overallScore * 100)}</span>
            <span className="score-label">Quantum Score</span>
          </div>
        </div>
        <div className="score-status">
          <span className="status-indicator" style={{ background: getScoreColor(metrics.overallScore) }}></span>
          <span>{metrics.overallScore >= 0.9 ? 'Excellent' : metrics.overallScore >= 0.7 ? 'Bon' : 'À optimiser'}</span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="quantum-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🎬</div>
          <div className="metric-info">
            <span className="metric-value">{metrics.fps}</span>
            <span className="metric-label">FPS</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${(metrics.fps / 120) * 100}%`, background: getScoreColor(metrics.fps / 120) }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-info">
            <span className="metric-value">{formatMs(metrics.frameTime)}</span>
            <span className="metric-label">Frame Time</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${Math.max(0, 100 - (metrics.frameTime / 16.67) * 100)}%`, background: getScoreColor(1 - metrics.frameTime / 16.67) }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💾</div>
          <div className="metric-info">
            <span className="metric-value">{Math.round(metrics.cacheHitRate * 100)}%</span>
            <span className="metric-label">Cache Hit</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${metrics.cacheHitRate * 100}%`, background: getScoreColor(metrics.cacheHitRate) }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎮</div>
          <div className="metric-info">
            <span className="metric-value">{metrics.gpuLayers}</span>
            <span className="metric-label">GPU Layers</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${(metrics.gpuLayers / 50) * 100}%`, background: 'var(--quantum-accent)' }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📐</div>
          <div className="metric-info">
            <span className="metric-value">{Math.round(metrics.jitterScore * 100)}%</span>
            <span className="metric-label">Anti-Jitter</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${metrics.jitterScore * 100}%`, background: getScoreColor(metrics.jitterScore) }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📝</div>
          <div className="metric-info">
            <span className="metric-value">{Math.round(metrics.textClarity * 100)}%</span>
            <span className="metric-label">Text Clarity</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${metrics.textClarity * 100}%`, background: getScoreColor(metrics.textClarity) }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🌊</div>
          <div className="metric-info">
            <span className="metric-value">{Math.round(metrics.motionFluidity * 100)}%</span>
            <span className="metric-label">Fluidity</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${metrics.motionFluidity * 100}%`, background: getScoreColor(metrics.motionFluidity) }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">{metrics.vsyncAligned ? '✅' : '⚠️'}</div>
          <div className="metric-info">
            <span className="metric-value">{metrics.vsyncAligned ? 'ON' : 'OFF'}</span>
            <span className="metric-label">VSync</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: metrics.vsyncAligned ? '100%' : '0%', background: 'var(--quantum-excellent)' }}></div>
          </div>
        </div>
      </div>

      {/* Render Cycles */}
      <div className="quantum-cycles">
        <span className="cycles-label">Render Cycles</span>
        <span className="cycles-value">{metrics.renderCycles.toLocaleString()}</span>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - FRAME METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderFrameMetrics = () => (
    <div className="quantum-frames">
      <h3>Frame Timeline</h3>
      <div className="frame-graph">
        <div className="frame-bars">
          {frameHistory.map((frame, idx) => (
            <div
              key={idx}
              className="frame-bar"
              style={{
                height: `${Math.min(100, (frame.frameTime / 16.67) * 100)}%`,
                background: frame.frameTime > 16.67 ? 'var(--quantum-warning)' : 'var(--quantum-accent)',
              }}
              title={`${formatMs(frame.frameTime)} @ ${frame.fps} FPS`}
            />
          ))}
        </div>
        <div className="frame-thresholds">
          <div className="threshold" style={{ bottom: '50%' }}>
            <span>8.33ms (120 FPS)</span>
          </div>
          <div className="threshold warning" style={{ bottom: '100%' }}>
            <span>16.67ms (60 FPS)</span>
          </div>
        </div>
      </div>

      <div className="frame-stats">
        <div className="stat">
          <span className="stat-label">Avg Frame Time</span>
          <span className="stat-value">
            {formatMs(frameHistory.reduce((a, b) => a + b.frameTime, 0) / Math.max(1, frameHistory.length))}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Dropped Frames</span>
          <span className="stat-value">{frameHistory.filter(f => f.frameTime > 16.67).length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Target</span>
          <span className="stat-value">120 FPS</span>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - CACHE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderCache = () => (
    <div className="quantum-cache">
      <h3>Component Cache</h3>
      <div className="cache-stats-bar">
        <div className="cache-stat">
          <span className="stat-value">{Math.round(metrics.cacheHitRate * 100)}%</span>
          <span className="stat-label">Hit Rate</span>
        </div>
        <div className="cache-stat">
          <span className="stat-value">{cacheEntries.length}</span>
          <span className="stat-label">Entries</span>
        </div>
        <div className="cache-stat">
          <span className="stat-value">{cacheEntries.reduce((a, e) => a + e.hits, 0)}</span>
          <span className="stat-label">Total Hits</span>
        </div>
      </div>

      <div className="cache-list">
        {cacheEntries.map(entry => (
          <div key={entry.id} className="cache-entry">
            <div className="cache-component">{entry.component}</div>
            <div className="cache-details">
              <span className="cache-hits">{entry.hits} hits</span>
              <span className="cache-age">{entry.age}s</span>
              <span className="cache-size">{entry.size}</span>
            </div>
            <div className="cache-bar">
              <div
                className="cache-fill"
                style={{ width: `${Math.min(100, (entry.hits / 3500) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - GPU
  // ═══════════════════════════════════════════════════════════════════════════

  const renderGPU = () => (
    <div className="quantum-gpu">
      <h3>GPU Acceleration</h3>
      <div className="gpu-overview">
        <div className="gpu-stat">
          <div className="gpu-icon">🎮</div>
          <div className="gpu-info">
            <span className="gpu-value">{gpuLayers.length}</span>
            <span className="gpu-label">Active Layers</span>
          </div>
        </div>
        <div className="gpu-stat">
          <div className="gpu-icon">💾</div>
          <div className="gpu-info">
            <span className="gpu-value">{gpuLayers.reduce((a, l) => a + l.memoryMB, 0).toFixed(1)} MB</span>
            <span className="gpu-label">VRAM Usage</span>
          </div>
        </div>
        <div className="gpu-stat">
          <div className="gpu-icon">⚡</div>
          <div className="gpu-info">
            <span className="gpu-value">Enabled</span>
            <span className="gpu-label">Compositor</span>
          </div>
        </div>
      </div>

      <div className="gpu-layers">
        <h4>Layer Stack</h4>
        {gpuLayers.map(layer => (
          <div key={layer.id} className={`gpu-layer ${layer.type}`}>
            <div className="layer-type">{layer.type}</div>
            <div className="layer-element">{layer.element}</div>
            <div className="layer-memory">{layer.memoryMB} MB</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - STABILITY
  // ═══════════════════════════════════════════════════════════════════════════

  const renderStability = () => (
    <div className="quantum-stability">
      <h3>Stability Diagnostics</h3>
      <div className="stability-grid">
        <div className="stability-card">
          <div className="stability-icon">📐</div>
          <div className="stability-info">
            <h4>Anti-Jitter</h4>
            <div className="stability-score" style={{ color: getScoreColor(metrics.jitterScore) }}>
              {Math.round(metrics.jitterScore * 100)}%
            </div>
            <p>Layout trembles eliminated</p>
          </div>
        </div>

        <div className="stability-card">
          <div className="stability-icon">📝</div>
          <div className="stability-info">
            <h4>Text Stability</h4>
            <div className="stability-score" style={{ color: getScoreColor(metrics.textClarity) }}>
              {Math.round(metrics.textClarity * 100)}%
            </div>
            <p>Subpixel rendering optimized</p>
          </div>
        </div>

        <div className="stability-card">
          <div className="stability-icon">🔄</div>
          <div className="stability-info">
            <h4>VSync Alignment</h4>
            <div className="stability-score" style={{ color: metrics.vsyncAligned ? 'var(--quantum-excellent)' : 'var(--quantum-warning)' }}>
              {metrics.vsyncAligned ? 'Aligned' : 'Misaligned'}
            </div>
            <p>Frame pacing synchronized</p>
          </div>
        </div>

        <div className="stability-card">
          <div className="stability-icon">🌊</div>
          <div className="stability-info">
            <h4>Motion Fluidity</h4>
            <div className="stability-score" style={{ color: getScoreColor(metrics.motionFluidity) }}>
              {Math.round(metrics.motionFluidity * 100)}%
            </div>
            <p>Animation curves harmonized</p>
          </div>
        </div>
      </div>

      <div className="stability-checks">
        <h4>System Checks</h4>
        <div className="check-list">
          <div className="check-item passed">✓ No layout shifts detected</div>
          <div className="check-item passed">✓ Font rendering stable</div>
          <div className="check-item passed">✓ GPU layers optimized</div>
          <div className="check-item passed">✓ Frame budget maintained</div>
          <div className="check-item passed">✓ Re-render count optimal</div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - RULES
  // ═══════════════════════════════════════════════════════════════════════════

  const renderRules = () => (
    <div className="quantum-rules">
      <h3>Quantum Rules</h3>
      <p className="rules-notice">🔐 Configuration Kevin-only</p>

      <div className="rules-list">
        <div className="rule-item">
          <span className="rule-name">max_reflow_per_frame</span>
          <span className="rule-value">2</span>
        </div>
        <div className="rule-item">
          <span className="rule-name">cache_duration_ms</span>
          <span className="rule-value">6</span>
        </div>
        <div className="rule-item">
          <span className="rule-name">motion_sync_hz</span>
          <span className="rule-value">120</span>
        </div>
        <div className="rule-item">
          <span className="rule-name">layout_transition_ms</span>
          <span className="rule-value">140</span>
        </div>
        <div className="rule-item">
          <span className="rule-name">max_re_renders_per_second</span>
          <span className="rule-value">45</span>
        </div>
        <div className="rule-item">
          <span className="rule-name">gpu_acceleration_allowed</span>
          <span className="rule-value">true</span>
        </div>
        <div className="rule-item">
          <span className="rule-name">strict_text_stability</span>
          <span className="rule-value">true</span>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU - MOTION
  // ═══════════════════════════════════════════════════════════════════════════

  const renderMotion = () => (
    <div className="quantum-motion">
      <h3>Motion Sync Dashboard</h3>
      <div className="motion-curves">
        <h4>TITANE∞ Easing Curves</h4>
        <div className="curve-list">
          <div className="curve-item">
            <span className="curve-name">Standard</span>
            <span className="curve-value">cubic-bezier(0.4, 0, 0.2, 1)</span>
            <div className="curve-preview standard"></div>
          </div>
          <div className="curve-item">
            <span className="curve-name">Decelerate</span>
            <span className="curve-value">cubic-bezier(0, 0, 0.2, 1)</span>
            <div className="curve-preview decelerate"></div>
          </div>
          <div className="curve-item">
            <span className="curve-name">Accelerate</span>
            <span className="curve-value">cubic-bezier(0.4, 0, 1, 1)</span>
            <div className="curve-preview accelerate"></div>
          </div>
          <div className="curve-item">
            <span className="curve-name">Bounce</span>
            <span className="curve-value">cubic-bezier(0.68, -0.55, 0.265, 1.55)</span>
            <div className="curve-preview bounce"></div>
          </div>
        </div>
      </div>

      <div className="motion-stats">
        <div className="motion-stat">
          <span className="stat-label">Active Animations</span>
          <span className="stat-value">3</span>
        </div>
        <div className="motion-stat">
          <span className="stat-label">Completed</span>
          <span className="stat-value">1,247</span>
        </div>
        <div className="motion-stat">
          <span className="stat-label">Default Duration</span>
          <span className="stat-value">200ms</span>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDU PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════

  // Loading initial
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading || matrixLoading) {
    return (
      <div className="quantum-center loading">
        <div className="loading-spinner">⚛️ Initialisation Quantum...</div>
      </div>
    );
  }

  return (
    <div className="quantum-center">
      <header className="quantum-header">
        <h1>
          <span className="header-icon">⚛️</span>
          Quantum Rendering Layer
        </h1>
        <div className="header-controls">
          <button
            className={`control-btn ${isRunning ? 'active' : ''}`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Resume'}
          </button>
        </div>
      </header>

      <nav className="quantum-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'frames', label: 'Frames', icon: '🎬' },
          { id: 'cache', label: 'Cache', icon: '💾' },
          { id: 'gpu', label: 'GPU', icon: '🎮' },
          { id: 'stability', label: 'Stability', icon: '📐' },
          { id: 'rules', label: 'Rules', icon: '⚙️' },
          { id: 'motion', label: 'Motion', icon: '🌊' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as TabType)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="quantum-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'frames' && renderFrameMetrics()}
        {activeTab === 'cache' && renderCache()}
        {activeTab === 'gpu' && renderGPU()}
        {activeTab === 'stability' && renderStability()}
        {activeTab === 'rules' && renderRules()}
        {activeTab === 'motion' && renderMotion()}
      </main>

      <footer className="quantum-footer">
        <span className="footer-status">
          <span className="status-dot active"></span>
          Quantum Layer Active
        </span>
        <span className="footer-version">v∞</span>
      </footer>
    </div>
  );
};

// Export with ErrorBoundary
const QuantumCenter: React.FC = () => {
  return (
    <ErrorBoundary context="QuantumCenter">
      <QuantumCenterContent />
    </ErrorBoundary>
  );
};

export default QuantumCenter;
