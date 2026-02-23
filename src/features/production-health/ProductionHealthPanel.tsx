/**
 * Ring 4: UI Component
 * Displays production health metrics in AdminPage tab
 * Includes error boundary, loading states, manual refresh
 */

import React, { useState } from 'react';
import { useProductionHealthTelemetry } from '@/services/telemetry/useProductionHealthTelemetry';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { ProductionHealthStatus } from '@/types/telemetry';
import './ProductionHealthPanel.css';

const getStatusColor = (status: ProductionHealthStatus): string => {
  switch (status) {
    case 'GREEN':
      return '#10b981';
    case 'YELLOW':
      return '#f59e0b';
    case 'RED':
      return '#ef4444';
    case 'UNKNOWN':
    default:
      return '#9ca3af';
  }
};

const getStatusLabel = (status: ProductionHealthStatus): string => {
  switch (status) {
    case 'GREEN':
      return '✅ Optimal';
    case 'YELLOW':
      return '⚠️ Attention';
    case 'RED':
      return '❌ Problème';
    case 'UNKNOWN':
    default:
      return '❓ Inconnu';
  }
};

export const ProductionHealthPanel: React.FC = () => {
  const { data, loading, error, refresh } = useProductionHealthTelemetry({
    refreshIntervalMs: 60000,
    autoRefresh: true,
  });

  const [copied, setCopied] = useState(false);

  const handleCopySnapshot = () => {
    if (!data) return;
    const snapshot = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(snapshot);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (loading && !data) {
      return (
        <div className="ph-state ph-loading">
          <div className="ph-spinner" />
          <p>Chargement des métriques production...</p>
        </div>
      );
    }

    if (error && !data) {
      return (
        <div className="ph-state ph-error">
          <p className="ph-error-title">⚠️ Erreur de chargement</p>
          <p className="ph-error-message">{error}</p>
          <button className="ph-button ph-button-retry" onClick={refresh}>
            Réessayer
          </button>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="ph-state ph-unknown">
          <p>Les données de production ne sont pas encore disponibles.</p>
          <p className="ph-hint">La collection commence au déploiement du jour 1.</p>
          <button className="ph-button" onClick={refresh}>
            Vérifier
          </button>
        </div>
      );
    }

    const lastUpdateTime = new Date(data.lastSample.timestamp);
    const timeAgo = getTimeAgo(lastUpdateTime);

    return (
      <div className="ph-content">
        <div className="ph-header">
          <h3 className="ph-title">Production V25 Week 1</h3>
          <div
            className="ph-status-badge"
            style={{ backgroundColor: getStatusColor(data.status) }}
          >
            {getStatusLabel(data.status)}
          </div>
        </div>

        <div className="ph-metrics">
          <div className="ph-metric-group ph-group-memory">
            <div className="ph-metric-row">
              <span className="ph-label">RSS Initial:</span>
              <span className="ph-value">{data.initialRssMb} MB</span>
            </div>
            <div className="ph-metric-row">
              <span className="ph-label">RSS Actuel:</span>
              <span className="ph-value">{data.lastSample.rssCurrentMb} MB</span>
            </div>
            <div className="ph-metric-row ph-row-growth">
              <span className="ph-label">Croissance:</span>
              <span className="ph-value">
                +{data.growthMb} MB ({data.growthPercent.toFixed(1)}%)
              </span>
            </div>
          </div>

          {(data.lastSample.eventLoopLagMs !== undefined ||
            data.lastSample.providerTimeoutsPerHour !== undefined ||
            data.lastSample.errorCount !== undefined) && (
            <div className="ph-metric-group ph-group-resilience">
              {data.lastSample.eventLoopLagMs !== undefined && (
                <div className="ph-metric-row">
                  <span className="ph-label">Event Loop Lag:</span>
                  <span className="ph-value">{data.lastSample.eventLoopLagMs} ms</span>
                </div>
              )}
              {data.lastSample.providerTimeoutsPerHour !== undefined && (
                <div className="ph-metric-row">
                  <span className="ph-label">Provider Timeouts/h:</span>
                  <span className="ph-value">
                    {data.lastSample.providerTimeoutsPerHour}
                  </span>
                </div>
              )}
              {data.lastSample.errorCount !== undefined && (
                <div className="ph-metric-row">
                  <span className="ph-label">Erreurs:</span>
                  <span className="ph-value">{data.lastSample.errorCount}</span>
                </div>
              )}
            </div>
          )}

          <div className="ph-metric-group ph-group-metadata">
            <div className="ph-metric-row">
              <span className="ph-label">Dernière mise à jour:</span>
              <span className="ph-value">{timeAgo}</span>
            </div>
            <div className="ph-metric-row">
              <span className="ph-label">Fenêtre:</span>
              <span className="ph-value ph-value-small">
                {formatDateShort(data.windowStartIso)} →{' '}
                {formatDateShort(data.windowEndIso)}
              </span>
            </div>
            {data.samplesCollected !== undefined && (
              <div className="ph-metric-row">
                <span className="ph-label">Échantillons:</span>
                <span className="ph-value">{data.samplesCollected}</span>
              </div>
            )}
          </div>
        </div>

        {data.notes && (
          <div className="ph-notes">
            <p className="ph-note-content">{data.notes}</p>
          </div>
        )}

        <div className="ph-controls">
          <button
            className="ph-button ph-button-primary"
            onClick={refresh}
            disabled={loading}
            data-testid="production-health-refresh"
          >
            {loading ? '⟳ Actualisation...' : '🔄 Actualiser'}
          </button>
          <button className="ph-button" onClick={handleCopySnapshot} disabled={!data}>
            {copied ? '✅ Copié!' : '📋 Copier données'}
          </button>
        </div>

        <div className="ph-footer">
          <p className="ph-source">Source: CSV local (Tauri IPC) · V26 Telemetry</p>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary context="ProductionHealthPanel">
      <div className="production-health-panel" data-testid="production-health-panel">
        {renderContent()}
      </div>
    </ErrorBoundary>
  );
};

function getTimeAgo(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return 'Date invalide';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `À l'instant`;
  if (diffMin < 60) return `Il y a ${diffMin}m`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  return date.toLocaleDateString('fr-FR');
}

function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return 'n/a';
  }

  return date.toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
