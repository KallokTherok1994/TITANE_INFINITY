/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 Phase 4 - Provider Status Panel
 * Indicateurs temps réel de santé des AI providers
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui';
import { colors, spacing, radius, shadows, fontSizes } from '@themes/tokens';
import { apiResponseCache } from '@/services/ai/apiCache';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface ProviderStatus {
  name: string;
  emoji: string;
  color: string;
  status: 'online' | 'offline' | 'degraded';
  latency?: number;
  cacheHitRate?: number;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const ProviderStatusPanel = (): JSX.Element => {
  const [providers, setProviders] = useState<ProviderStatus[]>([
    {
      name: 'Gemini',
      emoji: '🤖',
      color: colors.saphir.primary[500],
      status: 'online',
      latency: 0,
      cacheHitRate: 0,
    },
    {
      name: 'GPT-4o',
      emoji: '✨',
      color: colors.rubis.primary[500],
      status: 'online',
      latency: 0,
      cacheHitRate: 0,
    },
    {
      name: 'Claude',
      emoji: '🧠',
      color: colors.emeraude.primary[600],
      status: 'online',
      latency: 0,
      cacheHitRate: 0,
    },
    {
      name: 'Ollama',
      emoji: '🦉',
      color: colors.emeraude.primary[500],
      status: 'offline',
      latency: 0,
      cacheHitRate: 0,
    },
  ]);

  // ✨ v21 Phase 4: Mise à jour des stats cache
  useEffect(() => {
    const updateStats = () => {
      const stats = apiResponseCache.getStats();
      const hitRate =
        stats.hits + stats.misses > 0
          ? (stats.hits / (stats.hits + stats.misses)) * 100
          : 0;

      setProviders(prev =>
        prev.map(p => ({
          ...p,
          cacheHitRate: hitRate,
        }))
      );
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'online':
        return colors.emeraude.primary[500];
      case 'degraded':
        return colors.rubis.primary[500];
      case 'offline':
        return colors.neutral[600];
    }
  };

  const getStatusLabel = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'online':
        return '✓ Actif';
      case 'degraded':
        return '⚠ Ralenti';
      case 'offline':
        return '✗ Hors ligne';
    }
  };

  return (
    <div
      style={{
        padding: spacing[4],
        backgroundColor: colors.neutral[900],
        borderRadius: radius.lg,
        border: `1px solid ${colors.neutral[800]}`,
        boxShadow: shadows.lg,
      }}
    >
      <h3
        style={{
          fontSize: fontSizes.lg,
          fontWeight: 600,
          color: colors.neutral[100],
          marginBottom: spacing[4],
        }}
      >
        📊 État des Providers IA
      </h3>

      <div
        style={{
          display: 'grid',
          gap: spacing[3],
        }}
      >
        {providers.map(provider => (
          <motion.div
            key={provider.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing[3],
              backgroundColor: `${provider.color}10`,
              borderRadius: radius.md,
              border: `1px solid ${provider.color}30`,
            }}
          >
            {/* Provider Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <span style={{ fontSize: fontSizes.xl }}>{provider.emoji}</span>
              <div>
                <div
                  style={{
                    fontSize: fontSizes.sm,
                    fontWeight: 600,
                    color: provider.color,
                  }}
                >
                  {provider.name}
                </div>
                <div style={{ fontSize: fontSizes.xs, color: colors.neutral[400] }}>
                  {provider.latency ? `${provider.latency}ms` : '–'}
                </div>
              </div>
            </div>

            {/* Status & Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              {/* Cache Hit Rate */}
              {provider.status === 'online' && provider.cacheHitRate !== undefined && (
                <Badge
                  style={{
                    backgroundColor: `${colors.saphir.primary[500]}20`,
                    color: colors.saphir.primary[400],
                    fontSize: fontSizes.xs,
                  }}
                >
                  📦 {provider.cacheHitRate.toFixed(0)}% cache
                </Badge>
              )}

              {/* Status Badge */}
              <Badge
                style={{
                  backgroundColor: `${getStatusColor(provider.status)}20`,
                  color: getStatusColor(provider.status),
                  borderColor: getStatusColor(provider.status),
                  fontSize: fontSizes.xs,
                }}
              >
                {getStatusLabel(provider.status)}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Cache Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          marginTop: spacing[4],
          padding: spacing[3],
          backgroundColor: `${colors.saphir.primary[500]}10`,
          borderRadius: radius.md,
          border: `1px solid ${colors.saphir.primary[500]}30`,
        }}
      >
        <div style={{ fontSize: fontSizes.sm, color: colors.neutral[300] }}>
          <strong style={{ color: colors.saphir.primary[400] }}>Cache Global:</strong>{' '}
          {apiResponseCache.size()} entrées • Économies estimées:{' '}
          <span style={{ color: colors.emeraude.primary[400] }}>
            ~{((apiResponseCache.getStats().hits * 0.005) / 100).toFixed(2)}€
          </span>
        </div>
      </motion.div>
    </div>
  );
};
