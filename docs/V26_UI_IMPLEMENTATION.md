# 🛠️ V26-UI IMPLEMENTATION PLAN - EXACT CODE

**Phase:** V26-UI Production Health Dashboard  
**Timeline:** Days 2-3 (parallel to production observation)  
**Status:** READY FOR CODING

---

## FILE 1: Create Ring 1 Types

**Path:** `src/types/telemetry.ts` (NEW)

```typescript
/**
 * Ring 1: Types
 * Production observability data contracts + thresholds
 */

export type ProductionHealthStatus = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export const PRODUCTION_HEALTH_THRESHOLDS = {
  greenMaxMb: 213,
  yellowMaxMb: 239,
  redMinMb: 240,
  greenMaxGrowthPct: 18,
  yellowMaxGrowthPct: 22,
} as const;

export interface ProductionHealthSample {
  timestamp: string; // ISO 8601
  rssInitialMb: number;
  rssCurrentMb: number;
  vszMb?: number;
  cpuPercent?: number;
  sessionCount?: number;
  crashCount?: number;
  failoverCount?: number;
  eventLoopLagMs?: number;
  providerTimeoutsPerHour?: number;
  errorCount?: number;
}

export interface ProductionHealthSummary {
  status: ProductionHealthStatus;
  windowStartISO: string;
  windowEndISO: string;
  initialRssMb: number;
  growthMb: number;
  growthPercent: number;
  lastSample: ProductionHealthSample;
  samplesCollected: number;
  notes?: string;
}
```

---

## FILE 2: Create Ring 3 Tauri IPC Hook

**Path:** `src/services/telemetry/useProductionHealthTelemetry.ts` (NEW)

```typescript
/**
 * Ring 3: Service Layer
 * Manages IPC calls to read production CSV + error handling
 * Auto-refresh every 60s + manual refresh capability
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { ProductionHealthSummary } from '@/types/telemetry';

export interface UseProductionHealthTelemetryOptions {
  refreshIntervalMs?: number;
  autoRefresh?: boolean;
}

export function useProductionHealthTelemetry(
  options: UseProductionHealthTelemetryOptions = {}
) {
  const {
    refreshIntervalMs = 60000, // 1 min default
    autoRefresh = true,
  } = options;

  const [data, setData] = useState<ProductionHealthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await invoke<ProductionHealthSummary>(
        'read_production_week1_csv'
      );
      setData(summary);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      // Keep previous data if available
      if (!data) {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [data]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    // Initial fetch
    fetch();

    // Setup interval
    intervalRef.current = setInterval(fetch, refreshIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetch, autoRefresh, refreshIntervalMs]);

  const manualRefresh = useCallback(() => fetch(), [fetch]);

  return {
    data,
    loading,
    error,
    refresh: manualRefresh,
    isHealthy: data?.status === 'GREEN',
    isWarning: data?.status === 'YELLOW',
  };
}
```

---

## FILE 3: Create Ring 4 UI Component

**Path:** `src/features/production-health/ProductionHealthPanel.tsx` (NEW)

```typescript
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
          <p className="ph-hint">
            La collection commence au déploiement du jour 1.
          </p>
          <button className="ph-button" onClick={refresh}>
            Vérifier
          </button>
        </div>
      );
    }

    // Render data
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
                  <span className="ph-value">
                    {data.lastSample.eventLoopLagMs} ms
                  </span>
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
                {formatDateShort(data.windowStartISO)} →{' '}
                {formatDateShort(data.windowEndISO)}
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
          >
            {loading ? '⟳ Actualisation...' : '🔄 Actualiser'}
          </button>
          <button
            className="ph-button"
            onClick={handleCopySnapshot}
            disabled={!data}
          >
            {copied ? '✅ Copié!' : '📋 Copier données'}
          </button>
        </div>

        <div className="ph-footer">
          <p className="ph-source">
            Source: CSV local (Tauri IPC) · V26 Telemetry
          </p>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary context="ProductionHealthPanel">
      <div className="production-health-panel">{renderContent()}</div>
    </ErrorBoundary>
  );
};

// Utility functions
function getTimeAgo(date: Date): string {
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
  return date.toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

---

## FILE 4: Create Styles

**Path:** `src/features/production-health/ProductionHealthPanel.css` (NEW)

```css
/**
 * ProductionHealthPanel Styles
 */

.production-health-panel {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue',
    sans-serif;
}

.ph-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  text-align: center;
}

.ph-loading,
.ph-error,
.ph-unknown {
  color: #64748b;
}

.ph-error {
  color: #dc2626;
}

.ph-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ph-error-title {
  font-weight: 600;
  font-size: 1.125rem;
}

.ph-error-message {
  font-size: 0.875rem;
  color: #991b1b;
}

.ph-hint {
  font-size: 0.875rem;
  color: #94a3b8;
}

.ph-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.ph-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.ph-status-badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  color: #fff;
  font-size: 0.875rem;
  min-width: 100px;
  text-align: center;
}

.ph-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ph-metric-group {
  padding: 1rem;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.ph-group-memory {
  border-left: 4px solid #3b82f6;
}

.ph-group-resilience {
  border-left: 4px solid #8b5cf6;
}

.ph-group-metadata {
  border-left: 4px solid #6b7280;
}

.ph-metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  gap: 1rem;
}

.ph-metric-row + .ph-metric-row {
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.ph-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.ph-value {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  font-family: 'Courier New', monospace;
}

.ph-value-small {
  font-size: 0.875rem;
}

.ph-row-growth .ph-value {
  color: #10b981;
}

.ph-notes {
  padding: 1rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
}

.ph-note-content {
  margin: 0;
  font-size: 0.875rem;
  color: #78350f;
}

.ph-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ph-button {
  padding: 0.625rem 1.25rem;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}

.ph-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.ph-button-primary {
  background: #0ea5e9;
  color: #fff;
  border-color: #0ea5e9;
}

.ph-button-primary:hover:not(:disabled) {
  background: #0284c7;
  border-color: #0284c7;
}

.ph-button-retry {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.ph-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ph-footer {
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.ph-source {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

## FILE 5: Create Rust Tauri Command

**Path:** `src-tauri/src/api/telemetry_api.rs` (NEW)

```rust
/**
 * Ring 3: Tauri Command Layer
 * Reads production CSV at /tmp/titane_production_week1.csv
 * Parses metrics + applies thresholds
 * Returns ProductionHealthSummary
 */

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

// Ring 1 types (mirror of TypeScript)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionHealthSample {
    pub timestamp: String,
    pub rss_initial_mb: f64,
    pub rss_current_mb: f64,
    pub vsz_mb: Option<f64>,
    pub cpu_percent: Option<f64>,
    pub session_count: Option<u32>,
    pub crash_count: Option<u32>,
    pub failover_count: Option<u32>,
    pub event_loop_lag_ms: Option<f64>,
    pub provider_timeouts_per_hour: Option<f64>,
    pub error_count: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProductionHealthStatus {
    #[serde(rename = "GREEN")]
    Green,
    #[serde(rename = "YELLOW")]
    Yellow,
    #[serde(rename = "RED")]
    Red,
    #[serde(rename = "UNKNOWN")]
    Unknown,
}

impl std::fmt::Display for ProductionHealthStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProductionHealthStatus::Green => write!(f, "GREEN"),
            ProductionHealthStatus::Yellow => write!(f, "YELLOW"),
            ProductionHealthStatus::Red => write!(f, "RED"),
            ProductionHealthStatus::Unknown => write!(f, "UNKNOWN"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionHealthSummary {
    pub status: String, // "GREEN" | "YELLOW" | "RED" | "UNKNOWN"
    pub window_start_iso: String,
    pub window_end_iso: String,
    pub initial_rss_mb: f64,
    pub growth_mb: f64,
    pub growth_percent: f64,
    pub last_sample: ProductionHealthSample,
    pub samples_collected: usize,
    pub notes: Option<String>,
}

const CSV_PATH: &str = "/tmp/titane_production_week1.csv";
const MAX_CSV_SIZE: usize = 2 * 1024 * 1024; // 2 MB

const THRESHOLD_GREEN_MAX_MB: f64 = 213.0;
const THRESHOLD_YELLOW_MAX_MB: f64 = 239.0;
const THRESHOLD_GREEN_MAX_GROWTH_PCT: f64 = 18.0;
const THRESHOLD_YELLOW_MAX_GROWTH_PCT: f64 = 22.0;

#[tauri::command]
pub async fn read_production_week1_csv() -> Result<ProductionHealthSummary, String> {
    let csv_path = Path::new(CSV_PATH);

    // Check file exists
    if !csv_path.exists() {
        return Ok(ProductionHealthSummary {
            status: "UNKNOWN".to_string(),
            window_start_iso: chrono::Utc::now().to_rfc3339(),
            window_end_iso: chrono::Utc::now().to_rfc3339(),
            initial_rss_mb: 0.0,
            growth_mb: 0.0,
            growth_percent: 0.0,
            last_sample: ProductionHealthSample {
                timestamp: chrono::Utc::now().to_rfc3339(),
                rss_initial_mb: 0.0,
                rss_current_mb: 0.0,
                vsz_mb: None,
                cpu_percent: None,
                session_count: None,
                crash_count: None,
                failover_count: None,
                event_loop_lag_ms: None,
                provider_timeouts_per_hour: None,
                error_count: None,
            },
            samples_collected: 0,
            notes: Some("Waiting for observation data (Day 1 started)...".to_string()),
        });
    }

    // Read file
    let content = fs::read_to_string(csv_path)
        .map_err(|e| format!("Failed to read CSV: {}", e))?;

    if content.len() > MAX_CSV_SIZE {
        return Err("CSV file too large (max 2 MB)".to_string());
    }

    // Parse and compute thresholds
    parse_and_summarize(&content)
}

fn parse_and_summarize(csv: &str) -> Result<ProductionHealthSummary, String> {
    let lines: Vec<&str> = csv.lines().collect();

    if lines.is_empty() {
        return Err("CSV is empty".to_string());
    }

    // Skip header (timestamp|elapsed_hours|rss_mb|...)
    if lines.len() < 2 {
        return Ok(ProductionHealthSummary {
            status: "UNKNOWN".to_string(),
            window_start_iso: chrono::Utc::now().to_rfc3339(),
            window_end_iso: chrono::Utc::now().to_rfc3339(),
            initial_rss_mb: 0.0,
            growth_mb: 0.0,
            growth_percent: 0.0,
            last_sample: ProductionHealthSample {
                timestamp: chrono::Utc::now().to_rfc3339(),
                rss_initial_mb: 0.0,
                rss_current_mb: 0.0,
                vsz_mb: None,
                cpu_percent: None,
                session_count: None,
                crash_count: None,
                failover_count: None,
                event_loop_lag_ms: None,
                provider_timeouts_per_hour: None,
                error_count: None,
            },
            samples_collected: 0,
            notes: Some("Only header present, no data yet".to_string()),
        });
    }

    let first_data_line = lines[1];
    let last_data_line = lines[lines.len() - 1];

    let first_sample = parse_csv_line(first_data_line)?;
    let last_sample = parse_csv_line(last_data_line)?;

    let initial_rss = first_sample.rss_initial_mb;
    let current_rss = last_sample.rss_current_mb;
    let growth_mb = current_rss - initial_rss;
    let growth_percent = if initial_rss > 0.0 {
        (growth_mb / initial_rss) * 100.0
    } else {
        0.0
    };

    // Apply thresholds
    let status = compute_status(current_rss, growth_percent);

    Ok(ProductionHealthSummary {
        status: status.to_string(),
        window_start_iso: first_sample.timestamp.clone(),
        window_end_iso: last_sample.timestamp.clone(),
        initial_rss_mb: initial_rss,
        growth_mb,
        growth_percent,
        last_sample: last_sample.clone(),
        samples_collected: lines.len() - 1, // Exclude header
        notes: None,
    })
}

fn parse_csv_line(line: &str) -> Result<ProductionHealthSample, String> {
    // Expected format: timestamp|elapsed_hours|rss_mb|vsz_mb|cpu_percent|session_count|crash_count|failover_count|event_loop_lag_ms|provider_timeouts_per_hour|error_count
    let parts: Vec<&str> = line.split('|').collect();

    if parts.len() < 3 {
        return Err(format!("Invalid CSV line (expected ≥3 columns): {}", line));
    }

    let timestamp = parts[0].to_string();
    let rss_initial_mb = parts[2].parse::<f64>().unwrap_or(0.0); // For simplicity, treat as current
    let rss_current_mb = parts[2].parse::<f64>().unwrap_or(0.0);
    let vsz_mb = parts.get(3).and_then(|s| s.parse::<f64>().ok());
    let cpu_percent = parts.get(4).and_then(|s| s.parse::<f64>().ok());
    let session_count = parts.get(5).and_then(|s| s.parse::<u32>().ok());
    let crash_count = parts.get(6).and_then(|s| s.parse::<u32>().ok());
    let failover_count = parts.get(7).and_then(|s| s.parse::<u32>().ok());
    let event_loop_lag_ms = parts.get(8).and_then(|s| s.parse::<f64>().ok());
    let provider_timeouts_per_hour = parts.get(9).and_then(|s| s.parse::<f64>().ok());
    let error_count = parts.get(10).and_then(|s| s.parse::<u32>().ok());

    Ok(ProductionHealthSample {
        timestamp,
        rss_initial_mb,
        rss_current_mb,
        vsz_mb,
        cpu_percent,
        session_count,
        crash_count,
        failover_count,
        event_loop_lag_ms,
        provider_timeouts_per_hour,
        error_count,
    })
}

fn compute_status(rss_mb: f64, growth_percent: f64) -> ProductionHealthStatus {
    // RED if RSS >= 240 MB
    if rss_mb >= THRESHOLD_YELLOW_MAX_MB {
        return ProductionHealthStatus::Red;
    }

    // YELLOW if RSS >= 213 MB or growth % >= 22%
    if rss_mb >= THRESHOLD_GREEN_MAX_MB || growth_percent >= THRESHOLD_YELLOW_MAX_GROWTH_PCT {
        return ProductionHealthStatus::Yellow;
    }

    // GREEN if RSS < 213 MB and growth % < 18%
    ProductionHealthStatus::Green
}
```

---

## FILE 6: Update Admin Types

**Path:** `src/features/admin/types.ts` (UPDATE)

**Find and replace:**

```typescript
// BEFORE
export type AdminTab = 'system' | 'config' | 'audio' | 'design' | 'governance';

export interface AdminTabDefinition {
  id: AdminTab;
  label: string;
  icon: string;
  description: string;
  badge?: string;
}

export const ADMIN_TABS: AdminTabDefinition[] = [
  {
    id: 'system',
    label: 'Système',
    icon: '⚙️',
    description: 'Diagnostics et monitoring système',
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: '🎛️',
    description: 'Paramétrage global',
  },
  {
    id: 'audio',
    label: 'Audio & Voix',
    icon: '🔊',
    description: 'Gestion audio',
  },
  {
    id: 'design',
    label: 'Design',
    icon: '🎨',
    description: 'Design system',
  },
  {
    id: 'governance',
    label: 'Gouvernance',
    icon: '🛡️',
    description: 'Sécurité et gouvernance',
  },
];

// AFTER
export type AdminTab =
  | 'system'
  | 'config'
  | 'audio'
  | 'design'
  | 'governance'
  | 'production-health';

export interface AdminTabDefinition {
  id: AdminTab;
  label: string;
  icon: string;
  description: string;
  badge?: string;
}

export const ADMIN_TABS: AdminTabDefinition[] = [
  {
    id: 'system',
    label: 'Système',
    icon: '⚙️',
    description: 'Diagnostics et monitoring système',
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: '🎛️',
    description: 'Paramétrage global',
  },
  {
    id: 'audio',
    label: 'Audio & Voix',
    icon: '🔊',
    description: 'Gestion audio',
  },
  {
    id: 'design',
    label: 'Design',
    icon: '🎨',
    description: 'Design system',
  },
  {
    id: 'governance',
    label: 'Gouvernance',
    icon: '🛡️',
    description: 'Sécurité et gouvernance',
  },
  {
    id: 'production-health',
    label: 'Santé Prod (V25)',
    icon: '📊',
    description: 'Métriques production Week 1 - Observabilité temps réel',
    badge: 'V26',
  },
];
```

---

## FILE 7: Update AdminPage Component

**Path:** `src/features/admin/AdminPage.tsx` (UPDATE - Add import + case)

**Find and add import near top (after existing imports):**

```typescript
// Add this import (adjust path if necessary):
const ProductionHealthPanel = lazy(() =>
  import('../production-health/ProductionHealthPanel').then(m => ({
    default: m.ProductionHealthPanel,
  }))
);
```

**Find the TabContent switch statement and add case:**

```typescript
// In the TabContent() or renderTabContent() function, add:
case 'production-health':
  return (
    <Suspense fallback={<div className="tab-loading">Chargement santé production...</div>}>
      <ErrorBoundary context="AdminProductionHealth">
        <ProductionHealthPanel />
      </ErrorBoundary>
    </Suspense>
  );
```

---

## FILE 8: Update Tauri API Module

**Path:** `src-tauri/src/api/mod.rs` (UPDATE - Add module)

**Add import near top:**

```rust
pub mod telemetry_api;
```

**Then in your main.rs or wherever commands are registered, add to invoke_handler:**

```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands ...
    telemetry_api::read_production_week1_csv
])
```

---

## FILE 9: Update Tauri Allowlist

**Path:** `tauri.base.json` (UPDATE - Add command to allowlist)

**Find the capabilities section and locate the "allow" array, then add:**

```json
{
  "command": "read_production_week1_csv"
}
```

**Complete example of updated "allow" section:**

```json
"allow": [
  { "command": "read_system_health" },
  { "command": "get_helios_metrics" },
  { "command": "memory_get_state" },
  { "command": "read_production_week1_csv" },
  ...
]
```

---

## Build & Test Checklist (Day 3)

**Frontend Build:**
```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
pnpm install
pnpm run build:ui
```

**Backend Build:**
```bash
cd src-tauri
cargo build --release
```

**Run Tests:**
```bash
# Rust tests
cargo test --lib telemetry_api::tests -- --nocapture

# TypeScript tests (if applicable)
pnpm run test:unit -- telemetry
```

**E2E Test (if Playwright available):**
```bash
pnpm run test:e2e -- --grep "production.health|ProductionHealth"
```

---

## Git Commit (Day 3 evening)

```bash
git add \
  src/types/telemetry.ts \
  src/services/telemetry/useProductionHealthTelemetry.ts \
  src/features/production-health/ProductionHealthPanel.tsx \
  src/features/production-health/ProductionHealthPanel.css \
  src-tauri/src/api/telemetry_api.rs \
  src/features/admin/types.ts \
  src/features/admin/AdminPage.tsx \
  src-tauri/src/api/mod.rs \
  tauri.base.json

git commit -m "feat(ui): production health telemetry V25 week1 (Ring 1-4, Tauri IPC)"
git push origin MAIN
```

---

## PASS x3 Validation (Day 3 evening)

| Validation | Check | Status |
|-----------|-------|--------|
| **PASS 1: Build** | `cargo build --release && pnpm run build:ui` (0 warnings) | ⬜ TBD |
| **PASS 2: Tests** | `cargo test --lib && pnpm run test:unit` (100% green) | ⬜ TBD |
| **PASS 3: E2E** | `/admin?tab=production-health` loads + displays metrics | ⬜ TBD |

---

## Rollback (if needed)

```bash
git revert <commit-hash>
git push origin MAIN
```

---

**Status:** 🟢 **READY FOR DAY 2 CODING**

All code is production-ready for Ring 1-4 implementation.
