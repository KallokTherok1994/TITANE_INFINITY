/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — HeliosView
 * Visualisation système (CPU, RAM, Disk, Uptime, Load Average)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { useSystemStore } from '../../stores/systemStore';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import type { HealthStatus } from '../../services/tauri/backend-v17.2.types';

export function HeliosView() {
  const { helios, health, loading, error, fetchHelios, fetchHealth } = useSystemStore();

  useEffect(() => {
    fetchHelios();
    fetchHealth();
    
    const interval = setInterval(() => {
      fetchHelios();
      fetchHealth();
    }, 2000); // Update every 2s

    return () => clearInterval(interval);
  }, [fetchHelios, fetchHealth]);

  if (loading && !helios) {
    return <Card className="p-8 text-center">Chargement...</Card>;
  }

  if (error) {
    return <Card className="p-8 text-center text-red-500">Erreur: {error}</Card>;
  }

  if (!helios) {
    return null;
  }

  const getHealthColor = (status: HealthStatus | null): string => {
    switch (status) {
      case 'Healthy': return 'green';
      case 'Warning': return 'yellow';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  const getCPUColor = (usage: number): string => {
    if (usage >= 90) return 'red';
    if (usage >= 75) return 'yellow';
    return 'green';
  };

  const getRAMColor = (usage: number): string => {
    if (usage >= 90) return 'red';
    if (usage >= 80) return 'yellow';
    return 'green';
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}j ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Helios — Monitoring Système</h2>
        {health && (
          <Badge color={getHealthColor(health)}>{health}</Badge>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CPU Usage */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">CPU Usage</span>
            <Badge color={getCPUColor(helios.cpu_usage)} size="sm">
              {helios.cpu_usage.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                helios.cpu_usage >= 90
                  ? 'bg-red-500'
                  : helios.cpu_usage >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${helios.cpu_usage}%` }}
            />
          </div>
        </Card>

        {/* RAM Usage */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">RAM Usage</span>
            <Badge color={getRAMColor(helios.ram_usage)} size="sm">
              {helios.ram_usage.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                helios.ram_usage >= 90
                  ? 'bg-red-500'
                  : helios.ram_usage >= 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${helios.ram_usage}%` }}
            />
          </div>
        </Card>

        {/* Disk Usage */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Disk Usage</span>
            <Badge color="blue" size="sm">
              {helios.disk_usage[0].toFixed(1)} GB
            </Badge>
          </div>
          <div className="text-xs text-gray-500">
            Total: {helios.disk_usage[1].toFixed(1)} GB ({helios.disk_usage[2].toFixed(1)}%)
          </div>
        </Card>

        {/* Uptime */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Uptime</span>
            <span className="text-lg font-semibold">{formatUptime(helios.uptime)}</span>
          </div>
        </Card>

        {/* Load Average */}
        <Card className="p-6 col-span-1 md:col-span-2">
          <div className="text-sm text-gray-400 mb-2">Load Average</div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-gray-500">1 min</div>
              <div className="text-lg font-semibold">{helios.load_average[0].toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">5 min</div>
              <div className="text-lg font-semibold">{helios.load_average[1].toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">15 min</div>
              <div className="text-lg font-semibold">{helios.load_average[2].toFixed(2)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center">
        Dernière mise à jour: {new Date(helios.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
