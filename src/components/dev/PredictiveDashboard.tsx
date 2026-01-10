/**
 * TITANE∞ - Predictive Console Dashboard
 *
 * Dashboard avancé avec prédictions ML-like et analyse de corrélations
 */

import React, { useEffect, useState } from 'react';
import { predictiveEngine } from '@/services/monitoring/predictiveEngine';
import type {
  SystemHealthPrediction,
  ErrorCorrelation,
  ErrorPattern,
} from '@/services/monitoring/predictiveEngine';

export const PredictiveDashboard: React.FC = () => {
  const [healthPrediction, setHealthPrediction] = useState<SystemHealthPrediction | null>(
    null
  );
  const [correlations, setCorrelations] = useState<ErrorCorrelation[]>([]);
  const [patterns, setPatterns] = useState<ErrorPattern[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Update predictions every 5 seconds
    const interval = setInterval(() => {
      const prediction = predictiveEngine.predictSystemHealth();
      const topCorrelations = predictiveEngine.getTopCorrelations(5);
      const detectedPatterns = predictiveEngine.getPatterns();

      setHealthPrediction(prediction);
      setCorrelations(topCorrelations);
      setPatterns(detectedPatterns.slice(0, 5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-24 right-4 z-9999 bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all font-mono text-sm"
      >
        🔮 Predictive AI
      </button>
    );
  }

  const healthColor =
    healthPrediction && healthPrediction.overallHealth > 70
      ? 'text-green-400'
      : healthPrediction && healthPrediction.overallHealth > 40
        ? 'text-yellow-400'
        : 'text-red-400';

  return (
    <div className="fixed bottom-24 right-4 z-9999 bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg shadow-2xl p-4 max-w-md max-h-125 overflow-y-auto font-mono text-xs">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-purple-500/20">
        <h3 className="text-sm font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🔮 Predictive Intelligence
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {healthPrediction && (
        <div className="space-y-3">
          {/* System Health */}
          <div className="bg-gray-800/50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">System Health</span>
              <span className={`font-bold ${healthColor}`}>
                {healthPrediction.overallHealth.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  healthPrediction.overallHealth > 70
                    ? 'bg-green-500'
                    : healthPrediction.overallHealth > 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${healthPrediction.overallHealth}%` }}
              />
            </div>
          </div>

          {/* Criticality Score */}
          <div className="bg-gray-800/50 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Criticality</span>
              <span className="text-red-400 font-bold">
                {healthPrediction.criticalityScore.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-linear-to-r from-orange-500 to-red-500 transition-all"
                style={{ width: `${healthPrediction.criticalityScore}%` }}
              />
            </div>
          </div>

          {/* Time to Failure */}
          {healthPrediction.timeToFailure && (
            <div className="bg-red-900/30 border border-red-500/30 rounded p-3">
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠️ Predicted Failure:</span>
                <span className="text-white font-bold">
                  {Math.round(healthPrediction.timeToFailure / 60000)}min
                </span>
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {healthPrediction.riskFactors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-purple-400 font-bold">Risk Factors</h4>
              {healthPrediction.riskFactors.map((risk, idx) => (
                <div key={idx} className="bg-gray-800/30 rounded p-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{risk.factor}</span>
                    <span
                      className={`font-bold ${
                        risk.trend === 'increasing'
                          ? 'text-red-400'
                          : risk.trend === 'decreasing'
                            ? 'text-green-400'
                            : 'text-yellow-400'
                      }`}
                    >
                      {risk.trend === 'increasing'
                        ? '📈'
                        : risk.trend === 'decreasing'
                          ? '📉'
                          : '➡️'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div
                      className="h-1 rounded-full bg-red-500"
                      style={{ width: `${risk.weight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {healthPrediction.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-green-400 font-bold">💡 Recommendations</h4>
              <ul className="space-y-1">
                {healthPrediction.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-gray-300 text-xs">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Correlations */}
          {correlations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-cyan-400 font-bold">🔗 Error Correlations</h4>
              {correlations.slice(0, 3).map((corr, idx) => (
                <div key={idx} className="bg-gray-800/30 rounded p-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-gray-300 text-xs flex-1 mr-2">
                      {corr.pattern.substring(0, 40)}...
                    </span>
                    <span className="text-purple-400 font-bold">×{corr.frequency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">{corr.category}</span>
                    <span
                      className={`font-bold ${
                        corr.predictedImpact === 'critical'
                          ? 'text-red-400'
                          : corr.predictedImpact === 'high'
                            ? 'text-orange-400'
                            : corr.predictedImpact === 'medium'
                              ? 'text-yellow-400'
                              : 'text-green-400'
                      }`}
                    >
                      {corr.predictedImpact.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detected Patterns */}
          {patterns.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-pink-400 font-bold">🧠 ML Patterns</h4>
              {patterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className={`rounded p-2 ${
                    pattern.leadsToCrash
                      ? 'bg-red-900/30 border border-red-500/30'
                      : 'bg-gray-800/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-xs">
                      {pattern.sequence.join(' → ')}
                    </span>
                    <span className="text-purple-400 font-bold">
                      ×{pattern.frequency}
                    </span>
                  </div>
                  {pattern.leadsToCrash && (
                    <span className="text-red-400 text-xs font-bold">
                      ⚠️ LEADS TO CRASH
                    </span>
                  )}
                  <div className="text-gray-500 text-xs mt-1">
                    Avg: {(pattern.averageTimespan / 1000).toFixed(1)}s
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
