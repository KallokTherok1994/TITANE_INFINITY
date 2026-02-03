/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * VisionMetricsChart - Graphiques métriques Vision en temps réel (version CSS pure)
 * Utilise les données du useVisionStore pour afficher détection, affect, body language
 * Note: Simplified version using CSS bars instead of recharts (dependency removed for optimization)
 */

import React, { memo, useMemo } from 'react';
import { useVisionStore } from '@/stores/useVisionStore';
import type { AffectHistoryEntry } from '@/types/visionAffect';
import {
  Camera,
  Activity,
  Brain,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import './VisionMetricsChart.css';

interface VisionMetricsChartProps {
  timeRange?: number;
  showDetection?: boolean;
  showAffect?: boolean;
  showBodyLanguage?: boolean;
}

const levelToPercent = (level: string | null | undefined): number => {
  switch (level) {
    case 'low':
      return 25;
    case 'medium':
      return 50;
    case 'high':
      return 75;
    default:
      return 0;
  }
};

export const VisionMetricsChart: React.FC<VisionMetricsChartProps> = memo(
  ({
    timeRange = 10,
    showDetection = true,
    showAffect = true,
    showBodyLanguage = true,
  }) => {
    const isActive = useVisionStore(
      state => state.isObservationActive && state.visionInput.streamActive
    );
    const affectHistory = useVisionStore(state => state.affectEstimation.history);
    const bodyLanguage = useVisionStore(state => state.bodyLanguage);

    const cutoffTimestamp = useMemo(() => Date.now() - timeRange * 60_000, [timeRange]);
    const recentAffect = useMemo(
      () =>
        (affectHistory || [])
          .filter((item: AffectHistoryEntry) => item.timestamp >= cutoffTimestamp)
          .slice(-20),
      [affectHistory, cutoffTimestamp]
    );

    const avgConfidence = useMemo(() => {
      if (!recentAffect.length) return 0;
      return Math.round(
        (recentAffect.reduce((sum, item) => sum + (item.confidence || 0), 0) /
          recentAffect.length) *
          100
      );
    }, [recentAffect]);

    const avgEnergy = useMemo(() => {
      if (!recentAffect.length) return 0;
      return Math.round(
        recentAffect.reduce((sum, item) => sum + levelToPercent(item.energy), 0) /
          recentAffect.length
      );
    }, [recentAffect]);

    const avgTension = useMemo(() => {
      if (!recentAffect.length) return 0;
      return Math.round(
        recentAffect.reduce((sum, item) => sum + levelToPercent(item.tension), 0) /
          recentAffect.length
      );
    }, [recentAffect]);

    const avgEngagement = useMemo(() => {
      if (!recentAffect.length) return 0;
      return Math.round(
        recentAffect.reduce((sum, item) => sum + levelToPercent(item.engagement), 0) /
          recentAffect.length
      );
    }, [recentAffect]);

    const bodyScores = useMemo(
      () => ({
        posture: Math.round((bodyLanguage.postureScore || 0) * 100),
        movement: Math.round((bodyLanguage.movementScore || 0) * 100),
        gaze: Math.round((bodyLanguage.gazeStabilityScore || 0) * 100),
        facial: Math.round((bodyLanguage.facialActivity || 0) * 100),
        symmetry: Math.round((bodyLanguage.shoulderSymmetry || 0) * 100),
      }),
      [bodyLanguage]
    );

    const trends = useMemo(() => {
      if (recentAffect.length < 10) return { energy: 0, tension: 0, engagement: 0 };
      const first10 = recentAffect.slice(0, 10);
      const last10 = recentAffect.slice(-10);
      const avgFirst = (
        data: AffectHistoryEntry[],
        key: 'energy' | 'tension' | 'engagement'
      ) => data.reduce((sum, item) => sum + levelToPercent(item[key]), 0) / data.length;
      return {
        energy: avgFirst(last10, 'energy') - avgFirst(first10, 'energy'),
        tension: avgFirst(last10, 'tension') - avgFirst(first10, 'tension'),
        engagement: avgFirst(last10, 'engagement') - avgFirst(first10, 'engagement'),
      };
    }, [recentAffect]);

    const getTrendIcon = (value: number) => {
      if (value > 5) return <TrendingUp className="trend-up" size={14} />;
      if (value < -5) return <TrendingDown className="trend-down" size={14} />;
      return <Minus className="trend-stable" size={14} />;
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
        {showDetection && (
          <div className="vision-chart-card">
            <div className="vision-chart-header">
              <Activity className="chart-icon" size={18} />
              <h4>Détection & Confiance</h4>
              <span className="chart-badge good">Active</span>
            </div>
            <div className="vision-simple-chart">
              <div className="metric-row">
                <span className="metric-label">Confiance détection</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar confidence"
                    style={{ width: `${avgConfidence}%` }}
                  />
                  <span className="metric-value">{avgConfidence}%</span>
                </div>
              </div>
              <div className="metric-row">
                <span className="metric-label">Points de données</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar data-points"
                    style={{ width: `${Math.min(recentAffect.length * 5, 100)}%` }}
                  />
                  <span className="metric-value">{recentAffect.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {showAffect && (
          <div className="vision-chart-card">
            <div className="vision-chart-header">
              <Brain className="chart-icon" size={18} />
              <h4>Estimation Affective</h4>
              <span className="chart-badge">Temps Réel</span>
            </div>
            <div className="vision-simple-chart">
              <div className="metric-row">
                <span className="metric-label">
                  Énergie {getTrendIcon(trends.energy)}
                </span>
                <div className="metric-bar-container">
                  <div className="metric-bar energy" style={{ width: `${avgEnergy}%` }} />
                  <span className="metric-value">{avgEnergy}%</span>
                </div>
              </div>
              <div className="metric-row">
                <span className="metric-label">
                  Tension {getTrendIcon(trends.tension)}
                </span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar tension"
                    style={{ width: `${avgTension}%` }}
                  />
                  <span className="metric-value">{avgTension}%</span>
                </div>
              </div>
              <div className="metric-row">
                <span className="metric-label">
                  Engagement {getTrendIcon(trends.engagement)}
                </span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar engagement"
                    style={{ width: `${avgEngagement}%` }}
                  />
                  <span className="metric-value">{avgEngagement}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {showBodyLanguage && (
          <div className="vision-chart-card">
            <div className="vision-chart-header">
              <User className="chart-icon" size={18} />
              <h4>Body Language</h4>
              <span className="chart-badge info">Analyse</span>
            </div>
            <div className="vision-simple-chart">
              <div className="metric-row">
                <span className="metric-label">Posture</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar posture"
                    style={{ width: `${bodyScores.posture}%` }}
                  />
                  <span className="metric-value">{bodyScores.posture}%</span>
                </div>
              </div>
              <div className="metric-row">
                <span className="metric-label">Mouvement</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar movement"
                    style={{ width: `${bodyScores.movement}%` }}
                  />
                  <span className="metric-value">{bodyScores.movement}%</span>
                </div>
              </div>
              <div className="metric-row">
                <span className="metric-label">Regard</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar gaze"
                    style={{ width: `${bodyScores.gaze}%` }}
                  />
                  <span className="metric-value">{bodyScores.gaze}%</span>
                </div>
              </div>
              <div className="metric-row">
                <span className="metric-label">Visage</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar facial"
                    style={{ width: `${bodyScores.facial}%` }}
                  />
                  <span className="metric-value">{bodyScores.facial}%</span>
                </div>
              </div>
              <div className="metric-row">
                <span className="metric-label">Symétrie</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar symmetry"
                    style={{ width: `${bodyScores.symmetry}%` }}
                  />
                  <span className="metric-value">{bodyScores.symmetry}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VisionMetricsChart.displayName = 'VisionMetricsChart';
