/**
 * TITANE∞ v30.0.0 — Online Capabilities Diagnostic
 * Displays Internet + AI Provider status
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ZapOff, Wifi, WifiOff, Globe, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';
import { tauriClient } from '@/lib/tauriClient';

interface ApiEndpointStatus {
  name: string;
  endpoint: string;
  reachable: boolean;
  latency_ms?: number;
}

interface InternetConnectivity {
  online: boolean;
  dns_resolvable: boolean;
  api_reachable: ApiEndpointStatus[];
}

interface ProviderOnlineStatus {
  name: string;
  configured: boolean;
  can_reach: boolean;
  error?: string;
}

interface OnlineCapabilities {
  internet: InternetConnectivity;
  providers: ProviderOnlineStatus[];
  timestamp: string;
  summary: string;
}

export const OnlineDiagnostic: React.FC = () => {
  const [capabilities, setCapabilities] = useState<OnlineCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkCapabilities = async () => {
    if (!isTauriRuntimeAvailable()) {
      setErrorMessage('Diagnostic online indisponible hors runtime Tauri.');
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      setErrorMessage(null);
      const result = (await tauriClient.checkOnlineCapabilities()) as OnlineCapabilities;
      if (result) {
        setCapabilities(result);
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error('Failed to check online capabilities:', error);
      const message = error instanceof Error ? error.message : String(error);
      setCapabilities(null);
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void checkCapabilities();
    // Auto-refresh every 30s
    const interval = setInterval(() => {
      void checkCapabilities();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin">
          <Zap size={24} className="text-blue-500" />
        </div>
        <span className="ml-2 text-sm text-titanium-text-secondary">
          Vérification des capacités online...
        </span>
      </div>
    );
  }

  if (!capabilities) {
    const diagnosticMessage = !isTauriRuntimeAvailable()
      ? 'Diagnostic disponible uniquement en runtime Tauri (non accessible en mode navigateur)'
      : errorMessage?.includes('not in whitelist') ||
          errorMessage?.includes('not allowed') ||
          errorMessage?.includes('capability') ||
          errorMessage?.includes('check_online_capabilities')
        ? 'Impossible de vérifier les capacités online — la voie frontend/Tauri pour check_online_capabilities n est pas alignée'
        : errorMessage
          ? `Impossible de vérifier les capacités online — ${errorMessage}`
          : 'Impossible de vérifier les capacités online.';

    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-500">
          <AlertCircle size={18} />
          <span>{diagnosticMessage}</span>
        </div>
      </div>
    );
  }

  const availableProviders = capabilities.providers.filter(p => p.can_reach).length;
  const allAvailable =
    capabilities.internet.online && availableProviders === capabilities.providers.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 bg-titanium-bg-elevated rounded-lg border border-titanium-border-default"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-titanium-text-primary">
          Diagnostic Capacités Online
        </h3>
        <button
          onClick={() => void checkCapabilities()}
          disabled={refreshing}
          className={cn(
            'px-3 py-1 rounded text-xs font-medium transition-colors',
            refreshing
              ? 'bg-gray-500/20 text-gray-500 cursor-wait'
              : 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
          )}
        >
          {refreshing ? 'Vérification...' : 'Actualiser'}
        </button>
      </div>

      {/* Summary */}
      <div
        className={cn(
          'p-3 rounded-lg text-sm font-medium flex items-center gap-2',
          allAvailable
            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
        )}
      >
        {allAvailable ? (
          <Zap size={18} className="animate-pulse" />
        ) : (
          <ZapOff size={18} />
        )}
        <span>{capabilities.summary}</span>
      </div>

      {/* Internet Connectivity */}
      <div className="border-t border-titanium-border-default pt-3">
        <h4 className="text-xs font-semibold text-titanium-text-secondary mb-2 flex items-center gap-2">
          {capabilities.internet.online ? (
            <Wifi size={14} className="text-green-500" />
          ) : (
            <WifiOff size={14} className="text-red-500" />
          )}
          Internet
        </h4>

        <div className="space-y-2">
          {/* DNS Resolution */}
          <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-titanium-bg-base rounded">
            <span className="text-titanium-text-secondary">Résolution DNS</span>
            <span
              className={cn(
                'font-medium',
                capabilities.internet.dns_resolvable ? 'text-green-500' : 'text-red-500'
              )}
            >
              {capabilities.internet.dns_resolvable ? '✓ OK' : '✗ Défaut'}
            </span>
          </div>

          {/* Endpoints */}
          {capabilities.internet.api_reachable.map(endpoint => (
            <div
              key={endpoint.name}
              className="flex items-center justify-between text-xs px-2 py-1.5 bg-titanium-bg-base rounded"
            >
              <span className="text-titanium-text-secondary">{endpoint.name}</span>
              <div className="flex items-center gap-2">
                {endpoint.latency_ms && (
                  <span className="text-titanium-text-tertiary flex items-center gap-1">
                    <Clock size={12} />
                    {endpoint.latency_ms}ms
                  </span>
                )}
                <span
                  className={cn(
                    'font-medium',
                    endpoint.reachable ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {endpoint.reachable ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Providers */}
      <div className="border-t border-titanium-border-default pt-3">
        <h4 className="text-xs font-semibold text-titanium-text-secondary mb-2 flex items-center gap-2">
          <Zap size={14} />
          Fournisseurs IA ({availableProviders}/{capabilities.providers.length})
        </h4>

        <div className="space-y-2">
          {capabilities.providers.map(provider => (
            <div
              key={provider.name}
              className="flex items-center justify-between text-xs px-2 py-1.5 bg-titanium-bg-base rounded"
            >
              <div className="flex-1">
                <span className="text-titanium-text-secondary">{provider.name}</span>
                {provider.error && (
                  <div className="text-xs text-red-400 mt-0.5">{provider.error}</div>
                )}
              </div>
              <span
                className={cn(
                  'font-medium',
                  provider.can_reach
                    ? 'text-green-500'
                    : provider.configured
                      ? 'text-yellow-500'
                      : 'text-gray-500'
                )}
              >
                {provider.can_reach
                  ? '✓ Online'
                  : provider.configured
                    ? '~ Config'
                    : '- Setup'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      {lastCheck && (
        <div className="text-xs text-titanium-text-tertiary text-center pt-2 border-t border-titanium-border-default">
          Dernière vérification: {lastCheck.toLocaleTimeString('fr-FR')}
        </div>
      )}
    </motion.div>
  );
};
