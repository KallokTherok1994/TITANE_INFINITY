/**
 * TITANE∞ v∞ Phase 7 - HyperVision
 * Super-Prompt R: Real-time system monitoring & anomaly detection
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';

interface SystemMetrics {
  timestamp: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_rx: number;
  network_tx: number;
  active_processes: number;
  coherence: number;
  stability: number;
}

interface LayerMetrics {
  layer_id: number;
  name: string;
  health: number;
  load: number;
  errors: number;
  warnings: number;
}

const LAYER_NAMES = ['Physical', 'Network', 'Logic', 'Memory', 'Security'];

const HyperVisionDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [layers, setLayers] = useState<LayerMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<SystemMetrics[]>([]);

  useEffect(() => {
    if (isMonitoring) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const startMonitoring = async () => {
    try {
      await secureInvoke('hypervision_start');
      setIsMonitoring(true);
    } catch (err) {
      console.error('Failed to start monitoring:', err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await secureInvoke<SystemMetrics>('get_system_metrics');
      setMetrics(data);
      setHistory(prev => [...prev.slice(-29), data]);

      // Mock layer data
      setLayers(LAYER_NAMES.map((name, idx) => ({
        layer_id: idx,
        name,
        health: 85 + Math.random() * 15,
        load: 30 + Math.random() * 40,
        errors: Math.floor(Math.random() * 3),
        warnings: Math.floor(Math.random() * 8)
      })));
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const getHealthColor = (value: number) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 70) return 'text-yellow-400';
    if (value >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const _getHealthBg = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    if (value >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600">
            HyperVision
          </h1>
          <p className="text-gray-400 mt-2">Phase 7: Real-time System Monitoring</p>
        </div>

        {!isMonitoring && (
          <button
            onClick={startMonitoring}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            🚀 Start Monitoring
          </button>
        )}

        {isMonitoring && (
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="font-semibold">MONITORING ACTIVE</span>
          </div>
        )}
      </div>

      {!isMonitoring ? (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 border border-blue-500/30 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-white mb-2">Start System Monitoring</h2>
          <p className="text-gray-400">Click the button above to begin real-time system observation</p>
        </div>
      ) : (
        <>
          {/* Main Metrics Grid */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="text-gray-400 text-sm mb-2">CPU Usage</div>
                <div className={`text-3xl font-bold ${getHealthColor(100 - metrics.cpu_usage)}`}>
                  {metrics.cpu_usage.toFixed(1)}%
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="text-gray-400 text-sm mb-2">Memory Usage</div>
                <div className={`text-3xl font-bold ${getHealthColor(100 - metrics.memory_usage)}`}>
                  {metrics.memory_usage.toFixed(1)}%
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="text-gray-400 text-sm mb-2">Coherence</div>
                <div className={`text-3xl font-bold ${getHealthColor(metrics.coherence)}`}>
                  {metrics.coherence.toFixed(1)}%
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
                <div className="text-gray-400 text-sm mb-2">Stability</div>
                <div className={`text-3xl font-bold ${getHealthColor(metrics.stability)}`}>
                  {metrics.stability.toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* 5-Layer Scanner */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">5-Layer System Scanner</h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {layers.map((layer) => (
                <div
                  key={layer.layer_id}
                  className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50 hover:border-blue-500/50 transition-all"
                >
                  <div className="text-center mb-3">
                    <div className="text-white font-semibold mb-2">{layer.name}</div>
                    <div className={`text-2xl font-bold ${getHealthColor(layer.health)}`}>
                      {layer.health.toFixed(0)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Load</div>
                      <div className="bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2 transition-all"
                          style={{ width: `${layer.load}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">⚠️ {layer.errors}</span>
                      <span className="text-yellow-400">⚡ {layer.warnings}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics History Graph */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Metrics History</h2>

            <div className="relative h-64 bg-gray-900/50 rounded-xl p-4">
              {history.length > 1 ? (
                <svg className="w-full h-full">
                  {/* CPU Line */}
                  <polyline
                    points={history.map((m, i) => {
                      const x = (i / (history.length - 1)) * 100;
                      const y = 100 - m.cpu_usage;
                      return `${x}%,${y}%`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />

                  {/* Memory Line */}
                  <polyline
                    points={history.map((m, i) => {
                      const x = (i / (history.length - 1)) * 100;
                      const y = 100 - m.memory_usage;
                      return `${x}%,${y}%`;
                    }).join(' ')}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Collecting data...
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500" />
                <span className="text-sm text-gray-400">CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500" />
                <span className="text-sm text-gray-400">Memory</span>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          {metrics && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="text-gray-400 text-sm mb-2">Disk Usage</div>
                <div className="text-2xl font-bold text-white">{metrics.disk_usage.toFixed(1)}%</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="text-gray-400 text-sm mb-2">Network RX/TX</div>
                <div className="text-lg font-bold text-white">
                  ↓{(metrics.network_rx / 1024).toFixed(1)} / ↑{(metrics.network_tx / 1024).toFixed(1)} KB/s
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="text-gray-400 text-sm mb-2">Active Processes</div>
                <div className="text-2xl font-bold text-white">{metrics.active_processes}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HyperVisionDashboard;
