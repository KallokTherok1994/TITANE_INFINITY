/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TITANE INFINITY - Performance Dashboard                                      ║
 * ║  Interface principale de visualisation des performances                       ║
 * ║  Version: Ω∞Ω+ | SUPER PROMPT #8                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Cpu,
  HardDrive,
  Gauge,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Settings,
  BarChart3,
  Zap,
  Brain,
  Box,
} from 'lucide-react';
import { getPerformanceEngine } from '../../services/performanceEngine';
import type {
  DashboardData,
  PerformanceIssue,
  Recommendation,
  PerformanceGrade,
  SeverityLevel,
} from '../../services/performanceEngine';
import type { TrendDirection } from '../../services/performanceEngine/analyzerEngine';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface PerformanceDashboardProps {
  className?: string;
  refreshInterval?: number;
  showRecommendations?: boolean;
  onIssueClick?: (issue: PerformanceIssue) => void;
  onRecommendationApply?: (rec: Recommendation) => void;
}

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════════════════════════

const GRADE_COLORS: Record<PerformanceGrade, string> = {
  S: 'text-emerald-400',
  A: 'text-green-400',
  B: 'text-lime-400',
  C: 'text-yellow-400',
  D: 'text-orange-400',
  F: 'text-red-400',
};

const GRADE_BG_COLORS: Record<PerformanceGrade, string> = {
  S: 'bg-emerald-400/20',
  A: 'bg-green-400/20',
  B: 'bg-lime-400/20',
  C: 'bg-yellow-400/20',
  D: 'bg-orange-400/20',
  F: 'bg-red-400/20',
};

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: 'text-red-400 bg-red-400/20',
  major: 'text-orange-400 bg-orange-400/20',
  warning: 'text-yellow-400 bg-yellow-400/20',
  info: 'text-blue-400 bg-blue-400/20',
};

const TREND_ICONS: Record<TrendDirection, React.ReactNode> = {
  improving: <TrendingDown className="w-4 h-4 text-green-400" />,
  stable: <Minus className="w-4 h-4 text-gray-400" />,
  degrading: <TrendingUp className="w-4 h-4 text-red-400" />,
  unknown: <Minus className="w-4 h-4 text-gray-500" />,
};

// ════════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Indicateur de grade de performance
 */
const GradeIndicator: React.FC<{
  grade: PerformanceGrade;
  score: number;
}> = ({ grade, score }) => (
  <div className="flex flex-col items-center">
    <div
      className={`text-5xl font-bold ${GRADE_COLORS[grade]} ${GRADE_BG_COLORS[grade]}
                  w-20 h-20 rounded-full flex items-center justify-center`}
    >
      {grade}
    </div>
    <div className="mt-2 text-sm text-gray-400">Score: {score}/100</div>
  </div>
);

/**
 * Carte de métrique avec jauge
 */
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  max?: number;
  trend?: TrendDirection;
  warning?: number;
  critical?: number;
  inverted?: boolean;
}> = ({ icon, label, value, unit, max = 100, trend, warning = 70, critical = 85, inverted = false }) => {
  // Pour FPS, inverted = true (plus haut = mieux)
  const percentage = inverted
    ? Math.min(100, (value / max) * 100)
    : Math.min(100, (value / max) * 100);

  const getColor = () => {
    if (inverted) {
      // Plus haut = mieux (FPS)
      if (value >= warning) return 'bg-green-400';
      if (value >= critical) return 'bg-yellow-400';
      return 'bg-red-400';
    } else {
      // Plus bas = mieux (CPU, RAM)
      if (value < warning) return 'bg-green-400';
      if (value < critical) return 'bg-yellow-400';
      return 'bg-red-400';
    }
  };

  return (
    <motion.div
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-gray-400">{icon}</div>
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        {trend && TREND_ICONS[trend]}
      </div>

      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-bold text-white">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-sm text-gray-400 mb-1">{unit}</span>
      </div>

      {/* Barre de progression */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

/**
 * Liste des problèmes de performance
 */
const IssuesList: React.FC<{
  issues: PerformanceIssue[];
  onIssueClick?: (issue: PerformanceIssue) => void;
}> = ({ issues, onIssueClick }) => {
  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <CheckCircle className="w-5 h-5 mr-2" />
        Aucun problème détecté
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
      <AnimatePresence mode="popLayout">
        {issues.map((issue) => (
          <motion.div
            key={issue.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors
                       ${SEVERITY_COLORS[issue.severity]} border-current/30
                       hover:bg-current/10`}
            onClick={() => onIssueClick?.(issue)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            layout
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">{issue.title}</div>
                  <div className="text-xs opacity-75">{issue.description}</div>
                </div>
              </div>
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded">
                {issue.severity}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Panel de recommandations
 */
const RecommendationsPanel: React.FC<{
  recommendations: Recommendation[];
  onApply?: (rec: Recommendation) => void;
}> = ({ recommendations, onApply }) => {
  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Zap className="w-5 h-5 mr-2" />
        Aucune recommandation
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
      {recommendations.slice(0, 5).map((rec) => (
        <motion.div
          key={rec.id}
          className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium text-sm text-blue-300">{rec.title}</div>
              <div className="text-xs text-gray-400 mt-1">{rec.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded
                ${rec.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                  rec.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  rec.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'}`}>
                {rec.impact}
              </span>
              {rec.autoApplicable && onApply && (
                <button
                  className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30
                           rounded text-blue-400 transition-colors"
                  onClick={() => onApply(rec)}
                >
                  Appliquer
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Mini graphique sparkline
 */
const Sparkline: React.FC<{
  data: { timestamp: number; value: number }[];
  color?: string;
  height?: number;
}> = ({ data, color = '#3b82f6', height = 40 }) => {
  if (data.length === 0) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((d.value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════════

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  refreshInterval = 1000,
  showRecommendations = true,
  onIssueClick,
  onRecommendationApply,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const engine = useMemo(() => getPerformanceEngine(), []);

  // Rafraîchir les données
  const refresh = useCallback(() => {
    try {
      const dashboardData = engine.getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('[PerformanceDashboard] Erreur rafraîchissement:', error);
    }
  }, [engine]);

  // Rafraîchissement automatique
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    refresh(); // Initial

    return () => clearInterval(interval);
  }, [autoRefresh, refresh, refreshInterval]);

  // Rafraîchissement manuel
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await engine.runCycle();
    refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [engine, refresh]);

  // Appliquer une recommandation
  const handleApplyRecommendation = useCallback(async (rec: Recommendation) => {
    const success = await engine.applyRecommendation(rec.id);
    if (success) {
      refresh();
      onRecommendationApply?.(rec);
    }
  }, [engine, refresh, onRecommendationApply]);

  if (!data) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Performance Monitor</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'
            }`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Désactiver auto-refresh' : 'Activer auto-refresh'}
          >
            <Gauge className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Paramètres"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grade et Score */}
      <div className="flex items-center justify-center mb-6">
        <GradeIndicator grade={data.grade} score={data.healthScore} />
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<Cpu className="w-5 h-5" />}
          label="CPU"
          value={data.metrics?.cpu ?? 0}
          unit="%"
          trend={data.trends.cpu}
          warning={70}
          critical={85}
        />
        <MetricCard
          icon={<HardDrive className="w-5 h-5" />}
          label="RAM"
          value={data.metrics?.ram ?? 0}
          unit="%"
          trend={data.trends.ram}
          warning={70}
          critical={85}
        />
        <MetricCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="FPS"
          value={data.metrics?.fps ?? 60}
          unit="fps"
          max={120}
          trend={data.trends.fps}
          warning={30}
          critical={20}
          inverted={true}
        />
        <MetricCard
          icon={<Brain className="w-5 h-5" />}
          label="IA Latency"
          value={data.metrics?.iaLatency ?? 0}
          unit="ms"
          max={10000}
          trend={data.trends.iaLatency}
          warning={3000}
          critical={5000}
        />
      </div>

      {/* Graphiques historiques */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-2">CPU History</div>
          <Sparkline data={data.history.cpu} color="#ef4444" />
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-2">RAM History</div>
          <Sparkline data={data.history.ram} color="#f59e0b" />
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-2">FPS History</div>
          <Sparkline data={data.history.fps} color="#22c55e" />
        </div>
      </div>

      {/* Issues et Recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Issues */}
        <div className="bg-gray-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="font-medium text-white">
              Problèmes ({data.issues.length})
            </h3>
          </div>
          <IssuesList issues={data.issues} onIssueClick={onIssueClick} />
        </div>

        {/* Recommandations */}
        {showRecommendations && (
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">
                Recommandations ({data.recommendations.length})
              </h3>
            </div>
            <RecommendationsPanel
              recommendations={data.recommendations}
              onApply={handleApplyRecommendation}
            />
          </div>
        )}
      </div>

      {/* Footer avec tendance globale */}
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Box className="w-4 h-4" />
          <span>Tendance globale:</span>
          {TREND_ICONS[data.trends.overall]}
          <span className={
            data.trends.overall === 'improving' ? 'text-green-400' :
            data.trends.overall === 'degrading' ? 'text-red-400' :
            'text-gray-400'
          }>
            {data.trends.overall === 'improving' ? 'En amélioration' :
             data.trends.overall === 'degrading' ? 'En dégradation' :
             data.trends.overall === 'stable' ? 'Stable' : 'Inconnu'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Dernière mise à jour: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
