/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 Phase 4 - Provider Status Panel
 * Indicateurs de santé dérivés du backend réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui';

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
    color: 'var(--color-violet-500)',
  },
  gemini: {
    name: 'Gemini',
    emoji: '✨',
    color: 'var(--color-info-500)',
  },
  local: {
    name: 'Fallback local',
    emoji: '🛟',
    color: 'var(--color-text-muted)',
  },
  ollama: {
    name: 'Ollama',
    emoji: '🦙',
    color: 'var(--color-success-500)',
  },
  openai: {
    name: 'GPT-4o',
    emoji: '🤖',
    color: 'var(--color-text-secondary)',
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
    color: 'var(--color-text-secondary)',
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
        return 'var(--color-success-500)';
      case 'degraded':
        return 'var(--color-text-secondary)';
      case 'offline':
        return 'var(--color-text-disabled)';
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
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
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
            fontSize: 'var(--text-xs)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: pollingActive
              ? 'rgba(16, 185, 129, 0.12)'
              : 'rgba(100, 116, 139, 0.12)',
            color: pollingActive ? 'var(--color-success-500)' : 'var(--color-text-muted)',
            border: pollingActive
              ? '1px solid rgba(16, 185, 129, 0.4)'
              : '1px solid rgba(100, 116, 139, 0.4)',
            whiteSpace: 'nowrap',
          }}
        >
          {pollingActive ? '🟢 Live backend' : '⏸ Snapshot backend'}
        </span>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 'var(--space-3)',
            color: 'var(--color-warning-500)',
            fontSize: 'var(--text-xs)',
          }}
          data-testid="provider-status-panel-error"
        >
          {error}
        </div>
      )}

      {displayProviders.length === 0 ? (
        <div
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
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
            gap: 'var(--space-3)',
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
                padding: 'var(--space-3)',
                backgroundColor: `${provider.color}10`,
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${provider.color}30`,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <span style={{ fontSize: 'var(--text-xl)' }}>{provider.emoji}</span>
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: provider.color,
                    }}
                  >
                    {provider.name}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {provider.latency
                      ? `${provider.latency}ms`
                      : provider.error || 'Indisponible'}
                  </div>
                </div>
              </div>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                {provider.status !== 'offline' && (
                  <Badge
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      color: 'var(--color-info-500)',
                      fontSize: 'var(--text-xs)',
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
                    fontSize: 'var(--text-xs)',
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
