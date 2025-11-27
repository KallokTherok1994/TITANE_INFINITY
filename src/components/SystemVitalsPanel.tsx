/**
 * TITANE∞ v15.0 — System Vitals Panel
 * ═══════════════════════════════════════
 *
 * Panneau de visualisation des métriques système en temps réel
 * Phase 6: UI/UX Design System
 */

import React, { useEffect, useState } from 'react';
import { secureInvoke } from '@/lib/security';
import { Activity, Cpu, Database, HardDrive, Zap } from 'lucide-react';

interface CpuStatus {
  global_usage: number;
  core_count: number;
  per_core_usage: number[];
  temperature: number | null;
  is_throttling: boolean;
  recommendation: string;
}

interface HarmoniaMetrics {
  cpu: CpuStatus;
  throttling: {
    active: boolean;
    watch_delay_ms: number;
  };
  timestamp: number;
}

interface CompactionStats {
  files_processed: number;
  total_entries_before: number;
  total_entries_after: number;
  duplicates_removed: number;
  total_size_before_bytes: number;
  total_size_after_bytes: number;
  average_compression_ratio: number;
}

export const SystemVitalsPanel: React.FC = () => {
  const [harmoniaMetrics, setHarmoniaMetrics] = useState<HarmoniaMetrics | null>(null);
  const [compactionStats, setCompactionStats] = useState<CompactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Récupération des métriques
  const fetchMetrics = async () => {
    try {
      const metrics = await secureInvoke<HarmoniaMetrics>('get_harmonia_metrics');
      setHarmoniaMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch Harmonia metrics:', error);
    }
  };

  // Auto-refresh toutes les 2 secondes
  useEffect(() => {
    fetchMetrics();
    setLoading(false);

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Compactage mémoire
  const handleCompactMemory = async () => {
    try {
      const stats = await secureInvoke<CompactionStats>('auto_compact_memory');
      setCompactionStats(stats);
      alert(`Memory compacted!\nFiles: ${stats.files_processed}\nDuplicates removed: ${stats.duplicates_removed}`);
    } catch (error) {
      console.error('Failed to compact memory:', error);
      alert('Memory compaction failed. See console for details.');
    }
  };

  if (loading || !harmoniaMetrics) {
    return (
      <div className="p-6 bg-slate-900 rounded-lg">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 animate-pulse text-cyan-400" />
          <span className="text-slate-300">Loading system vitals...</span>
        </div>
      </div>
    );
  }

  const { cpu, throttling } = harmoniaMetrics;
  const cpuColor = cpu.is_throttling ? 'text-red-400' : cpu.global_usage > 60 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">System Vitals</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded text-sm ${
              autoRefresh ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={fetchMetrics}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* CPU Status */}
      <div className="p-6 bg-slate-900 rounded-lg border border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className={`w-8 h-8 ${cpuColor}`} />
            <div>
              <h3 className="text-lg font-bold text-white">CPU Harmonia</h3>
              <p className="text-sm text-slate-400">{cpu.core_count} cores</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${cpuColor}`}>
              {cpu.global_usage.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {cpu.is_throttling ? '⚠️ THROTTLING' : '✅ OPTIMAL'}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700">
          <p className="text-sm text-slate-300">
            <Zap className="w-4 h-4 inline mr-2 text-yellow-400" />
            {cpu.recommendation}
          </p>
        </div>

        {/* Throttling Info */}
        {throttling.active && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded">
            <p className="text-sm text-red-300">
              🔥 Active throttling: watchers delay set to {throttling.watch_delay_ms}ms
            </p>
          </div>
        )}

        {/* Per-core usage */}
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">Per-core usage:</p>
          <div className="grid grid-cols-4 gap-2">
            {cpu.per_core_usage.map((usage, index) => (
              <div key={index} className="bg-slate-800 rounded p-2">
                <div className="text-xs text-slate-400">Core {index}</div>
                <div className={`text-sm font-semibold ${usage > 80 ? 'text-red-400' : usage > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {usage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Compactor */}
      <div className="p-6 bg-slate-900 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Memory Compactor</h3>
              <p className="text-sm text-slate-400">Optimize cognitive memory</p>
            </div>
          </div>
          <button
            onClick={handleCompactMemory}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold"
          >
            Compact Now
          </button>
        </div>

        {compactionStats && (
          <div className="mt-4 p-4 bg-slate-800 rounded border border-slate-700">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Files Processed</p>
                <p className="text-white font-semibold">{compactionStats.files_processed}</p>
              </div>
              <div>
                <p className="text-slate-400">Duplicates Removed</p>
                <p className="text-white font-semibold">{compactionStats.duplicates_removed}</p>
              </div>
              <div>
                <p className="text-slate-400">Compression</p>
                <p className="text-white font-semibold">{compactionStats.average_compression_ratio.toFixed(2)}%</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <p className="text-xs text-slate-400">
                {(compactionStats.total_size_before_bytes / 1024).toFixed(2)} KB →{' '}
                {(compactionStats.total_size_after_bytes / 1024).toFixed(2)} KB
                (saved {((compactionStats.total_size_before_bytes - compactionStats.total_size_after_bytes) / 1024).toFixed(2)} KB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Engine Badges */}
      <div className="p-6 bg-slate-900 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Active Engines</h3>
        <div className="flex flex-wrap gap-2">
          <EngineBadge name="Helios" status="active" color="yellow" />
          <EngineBadge name="Nexus" status="active" color="blue" />
          <EngineBadge name="Harmonia" status={cpu.is_throttling ? 'throttling' : 'active'} color="purple" />
          <EngineBadge name="Sentinel" status="active" color="red" />
          <EngineBadge name="Memory" status="active" color="green" />
          <EngineBadge name="SelfHeal++" status="standby" color="cyan" />
        </div>
      </div>
    </div>
  );
};

interface EngineBadgeProps {
  name: string;
  status: 'active' | 'standby' | 'throttling';
  color: 'yellow' | 'blue' | 'purple' | 'red' | 'green' | 'cyan';
}

const EngineBadge: React.FC<EngineBadgeProps> = ({ name, status, color }) => {
  const colorClasses = {
    yellow: 'bg-yellow-900/30 border-yellow-600 text-yellow-300',
    blue: 'bg-blue-900/30 border-blue-600 text-blue-300',
    purple: 'bg-purple-900/30 border-purple-600 text-purple-300',
    red: 'bg-red-900/30 border-red-600 text-red-300',
    green: 'bg-green-900/30 border-green-600 text-green-300',
    cyan: 'bg-cyan-900/30 border-cyan-600 text-cyan-300',
  };

  const statusIcon = {
    active: '✅',
    standby: '⏸️',
    throttling: '⚠️',
  };

  return (
    <div className={`px-3 py-1 rounded border ${colorClasses[color]} text-sm font-medium`}>
      {statusIcon[status]} {name}
    </div>
  );
};

export default SystemVitalsPanel;
