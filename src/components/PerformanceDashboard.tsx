/**
 * TITANE∞ v24.3.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 📊 PERFORMANCE DASHBOARD
 * Dashboard temps réel des optimisations de performance
 * Impact: Visibilité totale sur cache, latence, hit rate
 */

import React, { useEffect, useState } from 'react';
import { responseCache } from '@/services/cache/responseCache';
import { predictivePreloader } from '@/services/cache/predictivePreloader';
import { cachePersistence } from '@/services/cache/cachePersistence';

interface PerformanceMetrics {
  cache: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
  };
  preloader: {
    queueSize: number;
    isProcessing: boolean;
    patternsDetected: number;
    topPatterns: Array<{ message: string; count: number }>;
  };
  persistence: {
    entryCount: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  };
}

export const PerformanceDashboard: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      const cacheStats = responseCache.getStats();
      const preloaderStats = predictivePreloader.getStats();
      const persistenceStats = await cachePersistence.getStats();

      setMetrics({
        cache: cacheStats,
        preloader: preloaderStats,
        persistence: persistenceStats,
      });
    } catch (error) {
      console.error('[PerformanceDashboard] Failed to refresh metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshMetrics();

    // Auto-refresh every 2 seconds
    const interval = setInterval(refreshMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="performance-dashboard loading">
        <div className="spinner"></div>
        <p>Loading performance metrics...</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="performance-dashboard-compact">
        <div className="metric">
          <span className="label">Cache:</span>
          <span className="value">
            {metrics.cache.size} entries ({(metrics.cache.hitRate * 100).toFixed(1)}% hit)
          </span>
        </div>
        <div className="metric">
          <span className="label">Queue:</span>
          <span className="value">
            {metrics.preloader.queueSize} items
            {metrics.preloader.isProcessing && ' (processing...)'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h3>⚡ Performance Dashboard v24.3.2</h3>
        <button onClick={refreshMetrics} disabled={isRefreshing} className="refresh-btn">
          {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Cache Metrics */}
      <div className="metrics-section">
        <h4>🧠 Response Cache</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Cache Size</div>
            <div className="metric-value">{metrics.cache.size}</div>
            <div className="metric-subtext">entries in memory</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Hit Rate</div>
            <div
              className="metric-value"
              style={{
                color:
                  metrics.cache.hitRate > 0.6
                    ? '#10b981'
                    : metrics.cache.hitRate > 0.4
                      ? '#f59e0b'
                      : '#ef4444',
              }}
            >
              {(metrics.cache.hitRate * 100).toFixed(1)}%
            </div>
            <div className="metric-subtext">
              {metrics.cache.hits} hits / {metrics.cache.misses} misses
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Evictions</div>
            <div className="metric-value">{metrics.cache.evictions}</div>
            <div className="metric-subtext">LRU removals</div>
          </div>
        </div>
      </div>

      {/* Preloader Metrics */}
      <div className="metrics-section">
        <h4>🔮 Predictive Preloader</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Queue Size</div>
            <div className="metric-value">{metrics.preloader.queueSize}</div>
            <div className="metric-subtext">
              {metrics.preloader.isProcessing ? '🟢 Processing...' : '⚪ Idle'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Patterns Detected</div>
            <div className="metric-value">{metrics.preloader.patternsDetected}</div>
            <div className="metric-subtext">unique user patterns</div>
          </div>

          <div className="metric-card wide">
            <div className="metric-label">Top Patterns</div>
            <div className="patterns-list">
              {metrics.preloader.topPatterns.length > 0 ? (
                metrics.preloader.topPatterns.map((pattern, idx) => (
                  <div key={idx} className="pattern-item">
                    <span className="pattern-text">{pattern.message}</span>
                    <span className="pattern-count">×{pattern.count}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No patterns detected yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Persistence Metrics */}
      <div className="metrics-section">
        <h4>💾 IndexedDB Persistence</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Stored Entries</div>
            <div className="metric-value">{metrics.persistence.entryCount}</div>
            <div className="metric-subtext">entries in IndexedDB</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Storage Size</div>
            <div className="metric-value">
              {(metrics.persistence.totalSize / 1024).toFixed(1)} KB
            </div>
            <div className="metric-subtext">total database size</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Age Range</div>
            <div className="metric-value">
              {metrics.persistence.oldestEntry
                ? `${Math.floor((Date.now() - metrics.persistence.oldestEntry) / 1000 / 60)}m`
                : 'N/A'}
            </div>
            <div className="metric-subtext">oldest entry age</div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="metrics-section">
        <h4>💡 Performance Tips</h4>
        <div className="tips-list">
          {metrics.cache.hitRate < 0.4 && (
            <div className="tip warning">
              ⚠️ Low hit rate ({(metrics.cache.hitRate * 100).toFixed(0)}%). Try asking
              similar questions to benefit from cache.
            </div>
          )}
          {metrics.cache.hitRate > 0.6 && (
            <div className="tip success">
              ✅ Great hit rate! Cache is working efficiently (
              {(metrics.cache.hitRate * 100).toFixed(0)}%).
            </div>
          )}
          {metrics.cache.size >= 90 && (
            <div className="tip info">
              ℹ️ Cache is almost full ({metrics.cache.size}/100). Oldest entries will be
              evicted soon.
            </div>
          )}
          {metrics.preloader.queueSize > 5 && (
            <div className="tip info">
              ℹ️ Preloader is actively preparing {metrics.preloader.queueSize} responses.
            </div>
          )}
          {metrics.persistence.totalSize > 1024 * 1024 && (
            <div className="tip warning">
              ⚠️ Large persistence size (
              {(metrics.persistence.totalSize / 1024 / 1024).toFixed(1)} MB). Consider
              clearing old entries.
            </div>
          )}
        </div>
      </div>

      <style>{`
        .performance-dashboard {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .dashboard-header h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .metrics-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .metrics-section h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.15);
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }

        .metric-card.wide {
          grid-column: span 2;
          text-align: left;
        }

        .metric-label {
          font-size: 12px;
          text-transform: uppercase;
          opacity: 0.8;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 4px;
        }

        .metric-subtext {
          font-size: 12px;
          opacity: 0.7;
        }

        .patterns-list {
          max-height: 120px;
          overflow-y: auto;
        }

        .pattern-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .pattern-text {
          font-size: 13px;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pattern-count {
          font-weight: 700;
          margin-left: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
        }

        .no-data {
          opacity: 0.6;
          font-style: italic;
          font-size: 13px;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tip {
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.4;
        }

        .tip.warning {
          background: rgba(245, 158, 11, 0.2);
          border-left: 3px solid #f59e0b;
        }

        .tip.success {
          background: rgba(16, 185, 129, 0.2);
          border-left: 3px solid #10b981;
        }

        .tip.info {
          background: rgba(59, 130, 246, 0.2);
          border-left: 3px solid #3b82f6;
        }

        .performance-dashboard-compact {
          background: rgba(102, 126, 234, 0.1);
          border-left: 3px solid #667eea;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 13px;
          display: flex;
          gap: 16px;
        }

        .performance-dashboard-compact .metric {
          display: flex;
          gap: 6px;
        }

        .performance-dashboard-compact .label {
          font-weight: 600;
          opacity: 0.8;
        }

        .performance-dashboard-compact .value {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default PerformanceDashboard;
