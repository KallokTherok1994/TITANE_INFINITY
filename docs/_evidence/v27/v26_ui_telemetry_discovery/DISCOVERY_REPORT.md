# 🔍 V26-UI TELEMETRY DISCOVERY REPORT

**Date:** 2026-02-22  
**Phase:** V26-UI Production Telemetry Integration  
**Status:** DISCOVERY COMPLETE  
**Evidence Base:** `/docs/_evidence/v27/v26_ui_telemetry_discovery/`

---

## Executive Summary

**Decision:** **Source B (Tauri IPC + Local CSV Read-Only)**

**Rationale:** Architecture is 100% Tauri-based (no HTTP backend /api found). All commands use Tauri's IPC pattern. Perfect fit for reading `/tmp/titane_production_week1.csv` via a read-only Tauri command.

**Integration Point:** AdminPage system (add new tab "production-health") or extend "system" tab  

**Estimated Effort:** 4-5 files, Rings 1-3, ~2 hours implementation

---

## Discovery Findings

### A) UI Architecture

**Router:** React Router (BrowserRouter) in `src/App.tsx` (line 900+)

**Current Routes:**
- `/admin` → AdminPage (hub for 5 sub-modules: system, config, audio, design, governance)
- `/fusion` → PerfectFusionDashboard
- `/optimization` → UltimateOptimizationDashboard
- `/orchestration-center` → OrchestrationMetaCenter
- `/dev` → DevPage

**Admin Structure:**
- File: `src/features/admin/AdminPage.tsx` (tab-based system)
- Tabs: system | config | audio | design | governance
- Pattern: Lazy-loaded sub-components with ErrorBoundary + Suspense
- Ideal for: Adding new tab or extending "system" tab

**UI Pages Found:**
- boot-diagnostics.ts ← Diagnostics module exists
- performa anceEngine types ← Performance tracking infrastructure
- AutoHealErrorBoundary ← Error handling in place
- ErrorBoundary + Suspense pattern established

### B) Backend/IPC Architecture

**Type:** 100% Tauri IPC-based (no HTTP backend)

**Commands Found (src-tauri/src/api/):**
- chat_commands.rs
- engine_api.rs (with #[tauri::command] macros)
- memory_api.rs (get_memory_state, write_snapshot, etc.)
- system_api.rs
- helios_api.rs
- vector_store_api.rs

**Capability Configuration (tauri.base.json):**
```json
"allow": [
  { "command": "get_system_health" },
  { "command": "get_helios_metrics" },
  { "command": "get_memory_state" },
  ...
]
```

**Security:** Commands are blocklisted in `capabilities` section, no wildcard paths allowed.

### C) Existing API Patterns

**Pattern 1: Query Commands (no params)**
```rust
#[tauri::command]
pub async fn get_system_health() -> Result<SystemHealth, String> { ... }
```

**Pattern 2: State Read Commands**
```rust
#[tauri::command]
pub async fn get_helios_state() -> Result<HeliosState, String> { ... }
```

**Pattern 3: File Operations (restricted)**
```rust
#[tauri::command]
pub async fn read_logs() -> Result<String, String> { ... }
```

**Conclusion:** File system operations exist but are managed carefully. CSP allows localhost for testing only.

### D) File System Access

**Allowlist Status:**
- tauri.base.json contains capabilities with specific commands
- No generic "read any file" permission
- Scope is restricted to: `$APPDATA/**`, `$RESOURCE/**`, `$APPCONFIG/**`, `$APPLOCALDATA/**`

**Challenge:** `/tmp/titane_production_week1.csv` is NOT in these scoped paths.

**Solution Required:**
- Add explicit Tauri command: `read_production_week1_csv()`
- Add to allowlist: `{ "command": "read_production_week1_csv" }`
- No path parameter (fix path = `/tmp/titane_production_week1.csv`)
- Max bytes check (ex: 2MB limit)

### E) Network/API Check

**HTTP Endpoints:** None found in `src/**` that implement /api
- Some tests mock `/api/ollama` but it's a test fixture
- CSP allows `ipc:` (Tauri) and `tauri:` protocols only
- No Express, Fastify, or other HTTP backend detected

**Conclusion:** No production HTTP API. Tauri IPC is the standard.

---

## Integration Plan: V26-UI PRODUCTION HEALTH DASHBOARD

### Option 1 (Recommended): New Tab in AdminPage

**Route:** `/admin?tab=production-health` or tab state managed in AdminPage

**Files to Create/Modify:**
1. `src/features/admin/types.ts` — Add new tab type
2. `src/features/production-health/ProductionHealthPanel.tsx` — NEW
3. `src/features/production-health/types.ts` — NEW (Ring 1 types)
4. `src/features/production-health/useProductionHealthTelemetry.ts` — NEW (Ring 3, service layer)
5. `src-tauri/src/api/telemetry_api.rs` — NEW (Ring 3, Rust backend)
6. `tauri.base.json` — UPDATE (add command to allowlist)
7. `src/features/admin/AdminPage.tsx` — UPDATE (wire tab + import component)

### Option 2 (Alternative): Standalone Page

**Route:** `/production-health` (direct route)

**Files:** Same as Option 1, but add route in App.tsx

**Decision:** **Option 1 chosen** (cleaner, fits admin hub pattern)

---

## Ring Analysis

| Ring | Component | Impact |
|------|-----------|--------|
| **Ring 1** | `ProductionHealthTypes` (status enum, threshold struct, sample struct) | ✅ No runtime logic |
| **Ring 2** | N/A (no pure engine logic for telemetry) | ✅ N/A |
| **Ring 3** | `useProductionHealthTelemetry` (service layer) + `telemetry_api.rs` (Tauri command) | ✅ Controlled I/O |
| **Ring 4** | `ProductionHealthPanel.tsx` (UI + error boundary) | ✅ Observable rendering |

**Rust Runtime (New):** `read_production_week1_csv` command is **runtime** (I/O operation)  
**Status:** Will add to allowlist with strict scope

---

## Data Contract (Ring 1)

```typescript
// src/features/production-health/types.ts

export type ProductionHealthStatus = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export interface ProductionHealthThresholds {
  greenMaxMb: number;      // 213
  yellowMaxMb: number;     // 239
  redMinMb: number;        // 240
  greenMaxGrowthPct: number; // 18
  yellowMaxGrowthPct: number; // 22
}

export interface ProductionHealthSample {
  timestamp: string;       // ISO 8601
  rssInitialMb: number;
  rssCurrentMb: number;
  cpuPercent?: number;
  uptime?: number;         // seconds or hours
  eventLoopLagMs?: number;
  providerTimeouts?: number;
  providerFailovers?: number;
  errorCount?: number;
  crashCount?: number;
}

export interface ProductionHealthSummary {
  status: ProductionHealthStatus;
  thresholds: ProductionHealthThresholds;
  windowStartISO: string;
  windowEndISO: string;
  lastSample: ProductionHealthSample;
  initialRssMb: number;
  growthMb: number;
  growthPercent: number;
  notes?: string;
}
```

---

## Service Layer (Ring 3)

```typescript
// src/features/production-health/useProductionHealthTelemetry.ts

import { useEffect, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { ProductionHealthSummary } from './types';

export function useProductionHealthTelemetry(
  refreshIntervalMs: number = 60000 // 1 min default
) {
  const [data, setData] = useState<ProductionHealthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await invoke<ProductionHealthSummary>(
        'read_production_week1_csv'
      );
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [fetch, refreshIntervalMs]);

  return { data, loading, error, refresh: fetch };
}
```

---

## Rust Backend (Ring 3, Runtime)

```rust
// src-tauri/src/api/telemetry_api.rs

use std::fs;
use serde::{Deserialize, Serialize};
use crate::ProductionHealthSummary; // type import

#[tauri::command]
pub async fn read_production_week1_csv() -> Result<ProductionHealthSummary, String> {
    let csv_path = "/tmp/titane_production_week1.csv";
    
    // Check file exists
    if !std::path::Path::new(csv_path).exists() {
        return Ok(ProductionHealthSummary {
            status: "UNKNOWN".to_string(),
            notes: Some("Waiting for observation data...".to_string()),
            ..Default::default()
        });
    }
    
    // Read file (max 2MB)
    let content = fs::read_to_string(csv_path)
        .map_err(|e| format!("Cannot read CSV: {}", e))?;
    
    if content.len() > 2 * 1024 * 1024 {
        return Err("CSV file too large".to_string());
    }
    
    // Parse + compute thresholds
    let summary = parse_and_summarize(&content)?;
    Ok(summary)
}

fn parse_and_summarize(csv: &str) -> Result<ProductionHealthSummary, String> {
    // Parse CSV, extract first/last row, compute growth, apply thresholds
    // Return ProductionHealthSummary
    todo!()
}
```

---

## UI Component (Ring 4)

```typescript
// src/features/production-health/ProductionHealthPanel.tsx

import React, { useState } from 'react';
import { useProductionHealthTelemetry } from './useProductionHealthTelemetry';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './ProductionHealthPanel.css';

export const ProductionHealthPanel: React.FC = () => {
  const { data, loading, error, refresh } = useProductionHealthTelemetry(60000);
  const [copied, setCopied] = useState(false);

  if (loading && !data) {
    return <div className="ph-loading">Chargement métriques production...</div>;
  }

  if (error && !data) {
    return <div className="ph-error">Erreur: {error}</div>;
  }

  if (!data) {
    return <div className="ph-unknown">Données non disponibles</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GREEN': return '#10b981';
      case 'YELLOW': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const handleCopySnapshot = () => {
    const snapshot = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(snapshot);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ErrorBoundary context="ProductionHealthPanel">
      <div className="production-health-panel">
        <div className="ph-header">
          <h2>Santé Production (V25 Week1)</h2>
          <div className="ph-status-badge" style={{ backgroundColor: getStatusColor(data.status) }}>
            {data.status}
          </div>
        </div>

        <div className="ph-snapshot">
          <div className="ph-row">
            <span className="ph-label">RSS Initial:</span>
            <span className="ph-value">{data.initialRssMb} MB</span>
          </div>
          <div className="ph-row">
            <span className="ph-label">RSS Actuel:</span>
            <span className="ph-value">{data.lastSample.rssCurrentMb} MB</span>
          </div>
          <div className="ph-row">
            <span className="ph-label">Croissance:</span>
            <span className="ph-value">{data.growthMb} MB ({data.growthPercent.toFixed(1)}%)</span>
          </div>
          <div className="ph-row">
            <span className="ph-label">Timestamp:</span>
            <span className="ph-value">{new Date(data.lastSample.timestamp).toLocaleString()}</span>
          </div>
          {data.lastSample.eventLoopLagMs !== undefined && (
            <div className="ph-row">
              <span className="ph-label">Event Loop Lag:</span>
              <span className="ph-value">{data.lastSample.eventLoopLagMs} ms</span>
            </div>
          )}
          {data.lastSample.errorCount !== undefined && (
            <div className="ph-row">
              <span className="ph-label">Erreurs:</span>
              <span className="ph-value">{data.lastSample.errorCount}</span>
            </div>
          )}
        </div>

        <div className="ph-controls">
          <button onClick={refresh} disabled={loading}>
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
          <button onClick={handleCopySnapshot}>
            {copied ? 'Copié!' : 'Copier snapshot'}
          </button>
        </div>

        <div className="ph-notes">
          <p className="ph-source">Source de données: Local CSV (Tauri IPC)</p>
          {data.notes && <p className="ph-note">{data.notes}</p>}
        </div>
      </div>
    </ErrorBoundary>
  );
};
```

---

## Tauri Allowlist Update

```json
// tauri.base.json → capabilities[0].allow[]

{
  "command": "read_production_week1_csv"
}
```

**Scope:** Fixed path only (no parameters)

---

## Files Modification

### 1. `src/features/admin/types.ts` (UPDATE)

Add to `AdminTab` union type:

```typescript
export type AdminTab =
  | 'system'
  | 'config'
  | 'audio'
  | 'design'
  | 'governance'
  | 'production-health'; // NEW
```

Add to `ADMIN_TABS`:

```typescript
{
  id: 'production-health',
  label: 'Santé Prod (V25)',
  icon: '📊',
  description: 'Métriques production Week 1 - Observabilité temps réel',
  badge: 'V26',
},
```

### 2. `src/features/admin/AdminPage.tsx` (UPDATE)

Import new panel + add to TabContent switch:

```typescript
const ProductionHealthPanel = lazy(() =>
  import('../production-health/ProductionHealthPanel').then(m => ({
    default: m.ProductionHealthPanel,
  }))
);

// In TabContent switch:
case 'production-health':
  return (
    <Suspense fallback={<LoadingSpinner message="Chargement santé production..." />}>
      <ErrorBoundary context="AdminProductionHealth">
        <ProductionHealthPanel />
      </ErrorBoundary>
    </Suspense>
  );
```

### 3. `src-tauri/src/api/mod.rs` (UPDATE)

Add module import:

```rust
pub mod telemetry_api;
```

Register command in main.rs or plugin setup:

```rust
.invoke_handler(tauri::generate_handler![
  // existing commands...
  telemetry_api::read_production_week1_csv
])
```

### 4. `tauri.base.json` (UPDATE)

Add to capabilities[0].allow:

```json
{ "command": "read_production_week1_csv" }
```

---

## Implementation Sequence

**Day 1 (Ring 1-3 core):**
1. Create Ring 1 types
2. Create Ring 3 Tauri command + parser
3. Create Ring 3 service hook
4. Update Admin types + tabbing
5. Create UI component (Ring 4)

**Day 2 (Integration):**
1. Wire AdminPage
2. Add Tauri allowlist
3. Build + test
4. E2E tests

**Day 3 (Validation):**
1. Proof pack assembly
2. PASS x3 validation
3. Verdict generation

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| CSV parse error | Try/catch + return UNKNOWN if parse fails |
| File not found | Return UNKNOWN status with "Waiting..." note |
| File corrupted | Validate CSV format before parsing |
| Memory spike (large file) | Max 2MB check in Rust |
| Stale data | Auto-refresh every 60s + manual button |
| Allowlist bypass | Fixed path, no param |

---

## Verdict

**✅ GO FOR IMPLEMENTATION**

- Source: **B (Tauri IPC)** confirmed
- Ring Impact: **1, 3, 4** (plus runtime for command)
- Surface: **AdminPage tab + command**
- Allowlist: **Minor addition** (1 command)
- Complexity: **Low (no async state, simple parser)**
- Proof Required: **Build + test + E2E**

---

**Evidence Base:**
- `A_status.txt` — Git state
- `A_ui_candidates.txt` — UI pages scan
- `A_router_scan.txt` — Routes findings
- `A_api_ipc_scan.txt` — API/IPC patterns
- `A_backend_structure.txt` — Backend structure confirmation

**Next Phase:** IMPLEMENTATION (See V26-UI-IMPLEMENTATION.md)
