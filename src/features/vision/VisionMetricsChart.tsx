/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * VisionMetricsChart - Graphiques métriques Vision en temps réel
 * Utilise les données du useVisionStore pour afficher détection, affect, body language
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useVisionStore } from '@/stores/useVisionStore';
import { Camera, Activity, Brain, User } from 'lucide-react';
import './VisionMetricsChart.css';

interface VisionMetricsChartProps {
  timeRange?: number; // Minutes de données à afficher
  showDetection?: boolean;
  showAffect?: boolean;
  showBodyLanguage?: boolean;
}

export const VisionMetricsChart: React.FC<VisionMetricsChartProps> = ({
  timeRange = 10,
  showDetection = true,
  showAffect = true,
  showBodyLanguage = true,
}) => {
  // Pour l'instant, utilise des données mock
  // TODO: Décommenter quand les propriétés seront ajoutées au visionStore
  // const { detectionHistory, affectHistory, bodyLanguageMetrics, isActive } = useVisionStore();
  const isActive = false; // Mock

  // Suppress unused warning
  void timeRange;

  // Données pour graphique détection
  const detectionData = useMemo(() => {
    // Toujours utiliser mock data pour l'instant
    return generateMockDetectionData(20);
    // TODO: Activer quand detectionHistory existe
    // if (!detectionHistory?.length) {
    //   return generateMockDetectionData(20);
    // }
    // return detectionHistory.slice(-20).map((item: any, _i: number) => ({
    //   time: new Date(item.timestamp).toLocaleTimeString('fr-FR', {
    //     hour: '2-digit',
    //     minute: '2-digit',
    //   }),
    //   confidence: item.confidence * 100,
    //   objects: item.objectCount || 0,
    // }));
  }, []);

  // Données pour graphique affect
  const affectData = useMemo(() => {
    // Toujours utiliser mock data pour l'instant
    return generateMockAffectData(20);
    // TODO: Activer quand affectHistory existe
    // if (!affectHistory?.length) {
    //   return generateMockAffectData(20);
    // }
    // return affectHistory.slice(-20).map((item: any, _i: number) => ({
    //   time: new Date(item.timestamp).toLocaleTimeString('fr-FR', {
    //     hour: '2-digit',
    //     minute: '2-digit',
    //   }),
    //   valence: (item.valence || 0.5) * 100,
    //   arousal: (item.arousal || 0.5) * 100,
    //   engagement: (item.engagement || 0.5) * 100,
    // }));
  }, []);

  // Données pour radar body language
  const bodyLanguageData = useMemo(() => {
    // Toujours utiliser mock data pour l'instant
    return generateMockBodyLanguageData();
    // TODO: Activer quand bodyLanguageMetrics existe
    // if (!bodyLanguageMetrics) {
    //   return generateMockBodyLanguageData();
    // }
    // return [
    //   { metric: 'Posture', value: bodyLanguageMetrics.posture || 75 },
    //   { metric: 'Gestes', value: bodyLanguageMetrics.gestures || 60 },
    //   { metric: 'Expression', value: bodyLanguageMetrics.facial || 85 },
    //   { metric: 'Regard', value: bodyLanguageMetrics.gaze || 70 },
    //   { metric: 'Mouvement', value: bodyLanguageMetrics.movement || 50 },
    // ];
  }, []);

  // Custom Tooltip avec types corrects
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name?: string;
      value?: number;
      color?: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="vision-chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map(
            (entry: { name?: string; value?: number; color?: string }, index: number) => (
              <p key={index} className="tooltip-value" style={{ color: entry.color }}>
                {entry.name}: <strong>{Math.round(entry.value || 0)}%</strong>
              </p>
            )
          )}
        </div>
      );
    }
    return null;
  };

  if (!isActive) {
    return (
      <div className="vision-metrics-inactive">
        <Camera size={48} className="inactive-icon" />
        <p>Vision inactive — Activez la caméra pour voir les métriques</p>
      </div>
    );
  }

  return (
    <div className="vision-metrics-container">
      {/* Detection Chart */}
      {showDetection && (
        <div className="vision-chart-card">
          <div className="vision-chart-header">
            <Activity className="chart-icon" size={18} />
            <h4>Détection & Confiance</h4>
            <span className="chart-badge good">Active</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={detectionData}>
              <defs>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="confidence"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorConfidence)"
                name="Confiance"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Affect Chart */}
      {showAffect && (
        <div className="vision-chart-card">
          <div className="vision-chart-header">
            <Brain className="chart-icon" size={18} />
            <h4>Estimation Affective</h4>
            <span className="chart-badge">Temps Réel</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={affectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="valence"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Valence"
              />
              <Line
                type="monotone"
                dataKey="arousal"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Arousal"
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Body Language Radar */}
      {showBodyLanguage && (
        <div className="vision-chart-card">
          <div className="vision-chart-header">
            <User className="chart-icon" size={18} />
            <h4>Body Language</h4>
            <span className="chart-badge info">Analyse</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={bodyLanguageData}>
              <PolarGrid stroke="rgba(100, 116, 139, 0.2)" />
              <PolarAngleAxis dataKey="metric" stroke="#cbd5e1" fontSize={11} />
              <PolarRadiusAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#a855f7"
                strokeWidth={2}
                fill="#a855f7"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// Mock data generators (used when no real data available)
function generateMockDetectionData(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - (count - i));
    return {
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      confidence: 70 + Math.random() * 25,
      objects: Math.floor(Math.random() * 5),
    };
  });
}

function generateMockAffectData(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - (count - i));
    return {
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      valence: 45 + Math.random() * 35,
      arousal: 40 + Math.random() * 40,
      engagement: 50 + Math.random() * 30,
    };
  });
}

function generateMockBodyLanguageData() {
  return [
    { metric: 'Posture', value: 75 },
    { metric: 'Gestes', value: 60 },
    { metric: 'Expression', value: 85 },
    { metric: 'Regard', value: 70 },
    { metric: 'Mouvement', value: 50 },
  ];
}
