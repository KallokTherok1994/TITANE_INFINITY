/**
 * TITANE_INFINITY v∞.37 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   EXPRESSION MONITOR COMPONENT v∞.37
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import {
  useUnifiedExpression,
  useExpressionSync,
  useExpressionSyncDetails,
} from '@/hooks/useExpressionOrchestration';

interface ExpressionMonitorProps {
  className?: string;
}

export const ExpressionMonitor: React.FC<ExpressionMonitorProps> = ({
  className = '',
}) => {
  const expression = useUnifiedExpression();
  const globalSync = useExpressionSync();
  const syncDetails = useExpressionSyncDetails();

  const getSyncColor = (score: number): string => {
    if (score >= 0.85) return 'text-green-500';
    if (score >= 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSyncLabel = (score: number): string => {
    if (score >= 0.85) return 'Excellent';
    if (score >= 0.7) return 'Bon';
    if (score >= 0.5) return 'Moyen';
    return 'Faible';
  };

  return (
    <div className={`expression-monitor p-4 bg-gray-900/50 rounded-lg ${className}`}>
      <h3 className="text-lg font-bold mb-4 text-white">Expression Engine</h3>

      {/* Global Sync */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">Synchronisation Globale</span>
          <span className={`font-bold ${getSyncColor(globalSync)}`}>
            {(globalSync * 100).toFixed(0)}% ({getSyncLabel(globalSync)})
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              globalSync >= 0.85
                ? 'bg-green-500'
                : globalSync >= 0.7
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${globalSync * 100}%` }}
          />
        </div>
      </div>

      {/* Detailed Sync */}
      <div className="space-y-3 mb-6">
        <SyncMeter
          label="Voix ↔ Halo"
          score={syncDetails.voiceHaloSync}
        />
        <SyncMeter
          label="Voix ↔ Narratif"
          score={syncDetails.voiceNarrativeSync}
        />
        <SyncMeter
          label="Halo ↔ Narratif"
          score={syncDetails.haloNarrativeSync}
        />
      </div>

      {/* Voice Stats */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Voix</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Rate:</span>{' '}
            <span className="text-white">{expression.voice.prosody.rate.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500">Pitch:</span>{' '}
            <span className="text-white">{expression.voice.prosody.pitch.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500">Warmth:</span>{' '}
            <span className="text-white">
              {(expression.voice.timbre.warmth * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">Clarity:</span>{' '}
            <span className="text-white">
              {(expression.voice.timbre.clarity * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Halo Stats */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Halo</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Pattern:</span>
            <span className="text-xs text-white font-mono">
              {expression.halo.pattern}
            </span>
          </div>
          <div className="flex gap-2">
            <ColorSwatch color={expression.halo.colors.primary} label="1" />
            <ColorSwatch color={expression.halo.colors.secondary} label="2" />
            <ColorSwatch color={expression.halo.colors.accent} label="3" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Intensity:</span>{' '}
              <span className="text-white">
                {(expression.halo.dynamics.intensity * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Pulsation:</span>{' '}
              <span className="text-white">
                {(expression.halo.dynamics.pulsation * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Stats */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Narratif</h4>
        <div className="space-y-1 text-xs">
          <div>
            <span className="text-gray-500">Style:</span>{' '}
            <span className="text-white font-mono">
              {expression.narrative.style.primary}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Flow:</span>{' '}
            <span className="text-white font-mono">
              {expression.narrative.structure.paragraphFlow}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Poeticism:</span>{' '}
            <span className="text-white">
              {(expression.narrative.style.poeticism * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const SyncMeter: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{(score * 100).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            score >= 0.85
              ? 'bg-green-500'
              : score >= 0.7
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
    </div>
  );
};

const ColorSwatch: React.FC<{ color: string; label: string }> = ({ color, label }) => {
  return (
    <div className="flex items-center gap-1">
      <div
        className="w-6 h-6 rounded border border-gray-600"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};
