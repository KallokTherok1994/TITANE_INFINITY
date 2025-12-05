/**
 * TITANE∞ v∞ - HyperEvolution Dashboard
 * Phase V: Prédiction, Accélération, Régénération
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import { Activity, Zap, RefreshCw, AlertTriangle, TrendingUp, Settings } from 'lucide-react';

interface PredictiveIssue {
  id: string;
  category: string;
  severity: string;
  description: string;
  probability: number;
  impact: number;
  predicted_at: number;
  recommendations: string[];
}

interface PredictionReport {
  timestamp: number;
  total_predictions: number;
  critical_count: number;
  high_count: number;
  issues: PredictiveIssue[];
  trends: Record<string, number[]>;
}

interface AccelerationReport {
  timestamp: number;
  targets: Array<{
    module: string;
    current_efficiency: number;
    target_efficiency: number;
    optimizations: Array<{
      name: string;
      impact: number;
      effort: number;
      description: string;
    }>;
  }>;
  total_gain: number;
  execution_speed: number;
}

export const HyperEvolutionDashboard: React.FC = () => {
  const [predictionReport, setPredictionReport] = useState<PredictionReport | null>(null);
  const [accelerationReport, setAccelerationReport] = useState<AccelerationReport | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const report = await secureInvoke<PredictionReport>('hyper_predict_issues');
      setPredictionReport(report);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAcceleration = async () => {
    setLoading(true);
    try {
      const report = await secureInvoke<AccelerationReport>('hyper_accelerate');
      setAccelerationReport(report);
    } catch (error) {
      console.error('Failed to load acceleration:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
    loadAcceleration();
  }, []);

  // Design System TITANE — Couleurs monochromes pour sévérité
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-[#8f7a7a]'; // danger (rouge-gris désaturé)
      case 'high': return 'text-[#a89f91]'; // warning (beige métal)
      case 'medium': return 'text-[#c4c4c4]'; // secondary (argent)
      default: return 'text-[#8899aa]'; // info (bleu-gris)
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#111416] to-[#1a1d20]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-[#93b399]" />
          <h1 className="text-3xl font-bold text-[#c4c4c4] tracking-wide">
            HyperEvolution Engine
          </h1>
          <span className="px-3 py-1 text-xs font-semibold bg-[#93b399]/20 text-[#93b399] rounded-full border border-[#93b399]/30">
            Phase V
          </span>
        </div>
        <p className="text-[#b5b5b5] text-sm">
          Prédiction • Accélération • Régénération • Évolution Ultra-Rapide
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#b5b5b5] text-sm">Prédictions</span>
            <AlertTriangle className="w-5 h-5 text-[#93b399]" />
          </div>
          <div className="text-2xl font-bold text-[#c4c4c4]">
            {predictionReport?.total_predictions || 0}
          </div>
          <div className="text-xs text-[#93b399] mt-1">
            {predictionReport?.critical_count || 0} critiques
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#b5b5b5] text-sm">Accélération</span>
            <Zap className="w-5 h-5 text-[#93b399]" />
          </div>
          <div className="text-2xl font-bold text-[#c4c4c4]">
            {accelerationReport ? `${(accelerationReport.execution_speed * 100).toFixed(0)}%` : '0%'}
          </div>
          <div className="text-xs text-[#93b399] mt-1">
            +{accelerationReport ? (accelerationReport.total_gain * 100).toFixed(0) : 0}% gain
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#b5b5b5] text-sm">Évolution</span>
            <TrendingUp className="w-5 h-5 text-[#93b399]" />
          </div>
          <div className="text-2xl font-bold text-[#c4c4c4]">
            Active
          </div>
          <div className="text-xs text-[#93b399] mt-1">
            Cycle continu
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#c4c4c4]">Prédictions Actives</h2>
          <button
            onClick={loadPredictions}
            disabled={loading}
            className="px-4 py-2 bg-[#727b81] text-[#111416] rounded-lg hover:bg-[#93b399] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {predictionReport?.issues.map((issue, idx) => (
          <div
            key={idx}
            className="mb-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className={`text-sm font-semibold ${getSeverityColor(issue.severity)}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className="ml-2 text-[#b5b5b5] text-sm">• {issue.category}</span>
              </div>
              <div className="text-right text-xs">
                <div className="text-[#93b399]">Impact: {(issue.impact * 100).toFixed(0)}%</div>
                <div className="text-[#b5b5b5]">Prob: {(issue.probability * 100).toFixed(0)}%</div>
              </div>
            </div>
            <p className="text-[#e5e5e5] mb-2">{issue.description}</p>
            {issue.recommendations.length > 0 && (
              <div className="mt-2 pl-4 border-l-2 border-[#93b399]/30">
                {issue.recommendations.map((rec, i) => (
                  <div key={i} className="text-sm text-[#b5b5b5] mb-1">
                    • {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {(!predictionReport || predictionReport.issues.length === 0) && (
          <div className="text-center py-8 text-[#b5b5b5]">
            Aucune prédiction disponible
          </div>
        )}
      </div>

      {/* Acceleration */}
      <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#c4c4c4]">Accélération Système</h2>
          <button
            onClick={loadAcceleration}
            disabled={loading}
            className="px-4 py-2 bg-[#727b81] text-[#111416] rounded-lg hover:bg-[#93b399] transition-colors disabled:opacity-50"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {accelerationReport?.targets.map((target, idx) => (
          <div
            key={idx}
            className="mb-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#c4c4c4] font-semibold">{target.module}</h3>
              <div className="text-right text-sm">
                <div className="text-[#b5b5b5]">
                  {target.current_efficiency.toFixed(0)}% → {target.target_efficiency.toFixed(0)}%
                </div>
              </div>
            </div>
            {target.optimizations.map((opt, i) => (
              <div key={i} className="mb-2 p-2 bg-[rgba(255,255,255,0.01)] rounded">
                <div className="flex items-center justify-between">
                  <span className="text-[#e5e5e5] text-sm font-medium">{opt.name}</span>
                  <span className="text-[#93b399] text-xs">
                    Impact: {(opt.impact * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[#b5b5b5] text-xs mt-1">{opt.description}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
