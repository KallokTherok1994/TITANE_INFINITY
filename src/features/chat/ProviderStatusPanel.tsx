/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 Phase 4 - Provider Status Panel
 * Indicateurs de santé dérivés du backend réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui';
import { colors, spacing, radius, shadows, fontSizes } from '@themes/tokens';
import { apiResponseCache } from '@/services/ai/apiCache';
import { useProviderStatus } from '@/hooks/useProviderStatus';
import type { ProviderStatus as BackendProviderStatus } from '@/services/tauriClient';

interface RuntimeProviderCard {
  name: string;
  emoji: string;
  color: string;
  status: 'online' | 'offline' | 'degraded';
  latency?: number;
  cacheHitRate?: number;
  error?: string;
}

const PROVIDER_PRESENTATION: Record<
  string,
  Pick<RuntimeProviderCard, 'name' | 'emoji' | 'color'>
> = {
  anthropic: {
    name: 'Claude',
    emoji: '🧠',
    color: colors.emeraude.primary[600],
  },
  gemini: {
    name: 'Gemini',
    emoji: '✨',
    color: colors.saphir.primary[500],
  },
  local: {
    name: 'Fallback local',
    emoji: '🛟',
    color: colors.neutral[400],
  },
  ollama: {
    name: 'Ollama',
    emoji: '🦙',
    color: colors.emeraude.primary[500],
  },
  openai: {
    name: 'GPT-4o',
    emoji: '🤖',
    color: colors.rubis.primary[500],
  },
};

function titleCaseProvider(provider: string): string {
  if (!provider) {
    return 'Provider';
  }

  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export function mapBackendProviderStatus(
  provider: BackendProviderStatus,
  cacheHitRate?: number
): RuntimeProviderCard {
  const presentation = PROVIDER_PRESENTATION[provider.provider] ?? {
    name: titleCaseProvider(provider.provider),
    emoji: '🤖',
    color: colors.neutral[300],
  };

  const status: RuntimeProviderCard['status'] = !provider.available
    ? 'offline'
    : provider.latency_ms >= 3000
      ? 'degraded'
      : 'online';

  return {
    ...presentation,
    status,
    latency: provider.available ? provider.latency_ms : undefined,
    cacheHitRate,
    error: provider.error,
  };
}

export const ProviderStatusPanel = (): JSX.Element => {
  const [pollingActive, setPollingActive] = useState<boolean>(false);
  const [cacheHitRate, setCacheHitRate] = useState<number>(0);
  const { providers, isLoading, error, refresh, checkAll } = useProviderStatus();

  useEffect(() => {
    void checkAll();
  }, [checkAll]);

  useEffect(() => {
    const updateStats = () => {
      const stats = apiResponseCache.getStats();
      const nextHitRate =
        stats.hits + stats.misses > 0
          ? (stats.hits / (stats.hits + stats.misses)) * 100
          : 0;
      setCacheHitRate(nextHitRate);
    };

    updateStats();

    const envEnabled =
      import.meta.env.VITE_PROVIDER_STATUS_PANEL_STATS_POLLING_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem(
        'titane_provider_status_panel_stats_polling_enabled'
      );
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabled = import.meta.env.DEV || envEnabled || userEnabled;
    setPollingActive(enabled);

    if (!enabled) {
      return;
    }

    const interval = setInterval(() => {
      updateStats();
      void refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [refresh]);

  const displayProviders = useMemo(
    () => providers.map(provider => mapBackendProviderStatus(provider, cacheHitRate)),
    [providers, cacheHitRate]
  );

  const getStatusColor = (status: RuntimeProviderCard['status']) => {
    switch (status) {
      case 'online':
        return colors.emeraude.primary[500];
      case 'degraded':
        return colors.rubis.primary[500];
      case 'offline':
        return colors.neutral[600];
    }
  };

  const getStatusLabel = (status: RuntimeProviderCard['status']) => {
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[4],
        }}
      >
        <h3
          style={{
            fontSize: fontSizes.lg,
            fontWeight: 600,
            color: colors.neutral[100],
            margin: 0,
          }}
        >
          📊 État des Providers IA
        </h3>
        <span
          title={
            pollingActive
              ? 'Données actualisées depuis le backend chat'
              : 'Snapshot backend au dernier contrôle explicite'
          }
          style={{
            fontSize: fontSizes.xs,
            padding: '2px 8px',
            borderRadius: radius.full ?? '9999px',
            backgroundColor: pollingActive
              ? `${colors.emeraude.primary[500]}20`
              : `${colors.neutral[600]}20`,
            color: pollingActive ? colors.emeraude.primary[400] : colors.neutral[400],
            border: `1px solid ${pollingActive ? colors.emeraude.primary[500] : colors.neutral[600]}40`,
            whiteSpace: 'nowrap',
          }}
        >
          {pollingActive ? '🟢 Live backend' : '⏸ Snapshot backend'}
        </span>
      </div>

      {error && (
        <div
          style={{
            marginBottom: spacing[3],
            color: colors.rubis.primary[400],
            fontSize: fontSizes.xs,
          }}
          data-testid="provider-status-panel-error"
        >
          {error}
        </div>
      )}

      {displayProviders.length === 0 ? (
        <div
          style={{
            color: colors.neutral[400],
            fontSize: fontSizes.sm,
          }}
          data-testid="provider-status-panel-empty"
        >
          {isLoading
            ? 'Vérification des providers...'
            : 'Aucune donnée backend disponible.'}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: spacing[3],
          }}
        >
          {displayProviders.map(provider => (
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
                    {provider.latency
                      ? `${provider.latency}ms`
                      : provider.error || 'Indisponible'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                {provider.status !== 'offline' && (
                  <Badge
                    style={{
                      backgroundColor: `${colors.saphir.primary[500]}20`,
                      color: colors.saphir.primary[400],
                      fontSize: fontSizes.xs,
                    }}
                  >
                    📦 {provider.cacheHitRate?.toFixed(0) ?? '0'}% cache
                  </Badge>
                )}

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
      )}
    </div>
  );
};
