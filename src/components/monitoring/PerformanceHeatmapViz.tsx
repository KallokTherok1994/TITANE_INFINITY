/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Phase 7: Performance Heatmap Component
 * Visualisation heatmap latence par service × heure
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { PerformanceHeatmap, HeatmapData, TimePattern } from '../../lib/performanceHeatmap';
import { Activity, TrendingUp, TrendingDown } from '../icons';

interface PerformanceHeatmapProps {
  refreshInterval?: number;
}

export const PerformanceHeatmapViz: React.FC<PerformanceHeatmapProps> = ({
  refreshInterval = 60000, // 1 minute
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [patterns, setPatterns] = useState<TimePattern[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    const updateData = () => {
      const data = PerformanceHeatmap.generateHeatmap();
      setHeatmapData(data);

      if (data.services.length > 0 && !selectedService && data.services[0]) {
        setSelectedService(data.services[0]);
      }

      const allPatterns = PerformanceHeatmap.getAllPatterns();
      setPatterns(allPatterns);
    };

    updateData();
    const interval = setInterval(updateData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, selectedService]);

  if (!heatmapData) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Collecte des données en cours...</p>
      </div>
    );
  }

  // Générer la couleur basée sur la latence (gradient vert → jaune → rouge)
  const getLatencyColor = (latency: number): string => {
    if (latency === 0) return 'bg-gray-100';

    const { maxLatency } = heatmapData;
    const ratio = maxLatency > 0 ? latency / maxLatency : 0;

    if (ratio < 0.3) return 'bg-green-200';
    if (ratio < 0.5) return 'bg-green-300';
    if (ratio < 0.7) return 'bg-yellow-300';
    if (ratio < 0.85) return 'bg-orange-300';
    return 'bg-red-400';
  };

  const formatLatency = (latency: number): string => {
    if (latency === 0) return '-';
    return latency >= 1000 ? `${(latency / 1000).toFixed(1)}s` : `${latency.toFixed(0)}ms`;
  };

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}h`;
  };

  const getPatternIcon = (patternType: TimePattern['patternType']) => {
    switch (patternType) {
      case 'business_hours':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'night_peak':
        return <TrendingDown className="w-4 h-4 text-purple-600" />;
      case 'uniform':
        return <Activity className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPatternLabel = (patternType: TimePattern['patternType']): string => {
    switch (patternType) {
      case 'business_hours':
        return 'Heures Bureau';
      case 'night_peak':
        return 'Pics Nocturnes';
      case 'uniform':
        return 'Uniforme';
      default:
        return 'Irrégulier';
    }
  };

  const selectedPattern = patterns.find((p) => p.service === selectedService);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Heatmap - Latence par Heure
        </h3>

        {/* Service selector */}
        <select
          value={selectedService || ''}
          onChange={(e) => setSelectedService(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
        >
          {heatmapData.services.map((service) => (
            <option key={service} value={service}>
              {service.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 overflow-x-auto">
        <div className="min-w-max">
          {/* Header - Hours */}
          <div className="flex mb-2">
            <div className="w-24 shrink-0"></div>
            <div className="flex gap-1">
              {heatmapData.hours.map((hour) => (
                <div
                  key={hour}
                  className="w-10 text-center text-xs font-medium text-gray-600"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>
          </div>

          {/* Rows - Services */}
          {heatmapData.services.map((service) => (
            <div key={service} className="flex items-center mb-1">
              <div className="w-24 shrink-0 text-xs font-semibold text-gray-700">
                {service.toUpperCase()}
              </div>
              <div className="flex gap-1">
                {heatmapData.hours.map((hour) => {
                  const cell = heatmapData.cells.find(
                    (c) => c.service === service && c.hour === hour
                  );
                  const latency = cell?.avgLatency || 0;

                  return (
                    <div
                      key={`${service}-${hour}`}
                      className={`w-10 h-10 rounded ${getLatencyColor(latency)} flex items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all`}
                      title={`${service} @ ${formatHour(hour)}: ${formatLatency(latency)} (${cell?.sampleCount || 0} samples)`}
                    >
                      {latency > 0 && (
                        <span className="text-gray-900">
                          {latency >= 1000 ? Math.round(latency / 1000) : Math.round(latency)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-xs">
          <span className="font-semibold text-gray-700">Latence:</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-200 rounded"></div>
            <span>Faible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-300 rounded"></div>
            <span>Moyenne</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-300 rounded"></div>
            <span>Élevée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-400 rounded"></div>
            <span>Critique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded"></div>
            <span>Pas de données</span>
          </div>
        </div>
      </div>

      {/* Pattern Analysis */}
      {selectedPattern && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            Analyse Temporelle - {selectedService?.toUpperCase()}
          </h4>

          <div className="grid grid-cols-2 gap-6">
            {/* Pattern Type */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getPatternIcon(selectedPattern.patternType)}
                <span className="text-sm font-medium text-gray-700">Type de Pattern</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {getPatternLabel(selectedPattern.patternType)}
              </div>
            </div>

            {/* Peak Hours */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Heures de Pointe</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedPattern.peakHours.length > 0 ? (
                  selectedPattern.peakHours.map((hour) => (
                    <span
                      key={hour}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold"
                    >
                      {formatHour(hour)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Aucune</span>
                )}
              </div>
            </div>

            {/* Low Hours */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Heures Creuses</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedPattern.lowHours.length > 0 ? (
                  selectedPattern.lowHours.map((hour) => (
                    <span
                      key={hour}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold"
                    >
                      {formatHour(hour)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Aucune</span>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Statistiques</span>
              </div>
              <div className="text-sm text-gray-600">
                {Object.keys(selectedPattern.averageLatencyByHour).filter(
                  (h) => {
                    const latency = selectedPattern.averageLatencyByHour[parseInt(h)];
                    return latency !== undefined && latency > 0;
                  }
                ).length}{' '}
                heures avec données
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Patterns Summary */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Résumé des Patterns</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {patterns.map((pattern) => (
            <div
              key={pattern.service}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedService === pattern.service
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedService(pattern.service)}
            >
              <div className="flex items-center gap-2 mb-2">
                {getPatternIcon(pattern.patternType)}
                <span className="text-xs font-semibold text-gray-700">
                  {pattern.service.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-600">{getPatternLabel(pattern.patternType)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {pattern.peakHours.length} pointe / {pattern.lowHours.length} creuse
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

PerformanceHeatmapViz.displayName = 'PerformanceHeatmapViz';
