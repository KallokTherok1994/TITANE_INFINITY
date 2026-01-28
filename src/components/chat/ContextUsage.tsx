/**
 * TITANE∞ — Context Usage Display
 * Affiche l'utilisation du contexte (tokens) et les alertes
 *
 * v26.4.0 (Sprint 6 Phase 3)
 */

import React, { useMemo } from 'react';
import type { AIMessage } from '../../services/ai/types';
import { getTokenCounter } from '../../services/chat/tokenCounter';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface ContextUsageProps {
  messages: AIMessage[];
  currentModel: string;
  compact?: boolean;
  showCost?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const ContextUsage: React.FC<ContextUsageProps> = ({
  messages,
  currentModel,
  compact = false,
  showCost = false,
  className = '',
  style = {},
}) => {
  const tokenCounter = useMemo(() => getTokenCounter(), []);

  // Calculer l'utilisation
  const usage = useMemo(() => {
    return tokenCounter.checkContextUsage(messages, currentModel);
  }, [messages, currentModel, tokenCounter]);

  // Déterminer la couleur selon l'utilisation
  const getColor = (): string => {
    if (usage.isOverLimit) return '#ef4444'; // red-500
    if (usage.isNearLimit) return '#f59e0b'; // amber-500
    if (usage.percentage > 0.7) return '#eab308'; // yellow-500
    return '#10b981'; // green-500
  };

  // Calculer le coût si demandé
  const cost = useMemo(() => {
    if (!showCost) return null;
    return tokenCounter.estimateCost(usage.tokenCount, currentModel);
  }, [showCost, usage.tokenCount, currentModel, tokenCounter]);

  // Mode compact: juste les chiffres
  if (compact) {
    return (
      <div
        className={`context-usage-compact ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: getColor(),
          fontWeight: 500,
          ...style,
        }}
        title={`${usage.tokenCount.total.toLocaleString()} / ${usage.limit.toLocaleString()} tokens (${(usage.percentage * 100).toFixed(1)}%)`}
      >
        <span style={{ opacity: 0.7 }}>🔢</span>
        <span>
          {tokenCounter.formatTokenCount(usage.tokenCount.total)} / {tokenCounter.formatTokenCount(usage.limit)}
        </span>
        {usage.isNearLimit && (
          <span style={{ fontSize: '14px' }}>⚠️</span>
        )}
      </div>
    );
  }

  // Mode complet: avec barre de progression
  return (
    <div
      className={`context-usage ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        backgroundColor: 'rgba(24, 24, 27, 0.6)',
        borderRadius: '12px',
        border: `1px solid ${getColor()}40`,
        ...style,
      }}
    >
      {/* En-tête */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <span style={{ color: 'rgba(250, 250, 250, 0.9)' }}>
          Utilisation du contexte
        </span>
        <span style={{ color: getColor() }}>
          {(usage.percentage * 100).toFixed(1)}%
        </span>
      </div>

      {/* Barre de progression */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '6px',
          backgroundColor: 'rgba(114, 123, 129, 0.2)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${Math.min(usage.percentage * 100, 100)}%`,
            backgroundColor: getColor(),
            borderRadius: '3px',
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
      </div>

      {/* Détails */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'rgba(250, 250, 250, 0.6)',
        }}
      >
        <span>
          {usage.tokenCount.total.toLocaleString()} tokens
        </span>
        <span>
          Limite: {usage.limit.toLocaleString()}
        </span>
      </div>

      {/* Breakdown input/output */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          color: 'rgba(250, 250, 250, 0.5)',
        }}
      >
        <span>
          📥 Input: {tokenCounter.formatTokenCount(usage.tokenCount.input)}
        </span>
        <span>
          📤 Output: {tokenCounter.formatTokenCount(usage.tokenCount.output)}
        </span>
      </div>

      {/* Coût estimé */}
      {showCost && cost && (
        <div
          style={{
            marginTop: '4px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(114, 123, 129, 0.2)',
            fontSize: '12px',
            color: 'rgba(250, 250, 250, 0.6)',
          }}
        >
          💰 Coût estimé: ${cost.totalCost.toFixed(4)}
          {cost.totalCost > 0 && (
            <span style={{ marginLeft: '8px', fontSize: '11px', opacity: 0.7 }}>
              (${cost.inputCost.toFixed(4)} in / ${cost.outputCost.toFixed(4)} out)
            </span>
          )}
        </div>
      )}

      {/* Alerte si près de la limite */}
      {usage.isNearLimit && !usage.isOverLimit && (
        <div
          style={{
            marginTop: '4px',
            padding: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>⚠️</span>
          <span>Contexte bientôt saturé. Pensez à archiver les anciens messages.</span>
        </div>
      )}

      {/* Alerte si au-dessus de la limite */}
      {usage.isOverLimit && (
        <div
          style={{
            marginTop: '4px',
            padding: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🚨</span>
          <span>Limite de contexte dépassée! Archivez des messages ou changez de modèle.</span>
        </div>
      )}
    </div>
  );
};

export default ContextUsage;
