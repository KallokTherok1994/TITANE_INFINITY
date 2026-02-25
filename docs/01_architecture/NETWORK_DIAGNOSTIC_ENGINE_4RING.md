# Network Diagnostic Engine — Plan 4-Ring (DOC-ONLY)

> **Statut**: PLAN — doc-only, aucune implémentation runtime.
> Cette phase définit la proposition conforme 4-Ring sans toucher allowlist/capabilities.

---

## Ring 1 — Types (src/types/)

### NetworkStatus

```typescript
export type NetworkStatus =
  | 'ONLINE'        // réseau disponible, au moins un provider joignable
  | 'DEGRADED'      // réseau partiel (latence élevée, perte paquets)
  | 'OFFLINE'       // aucune connectivité externe
  | 'UNKNOWN';      // diagnostic non encore exécuté
```

### NetworkDiagnosticReport

```typescript
export interface NetworkDiagnosticReport {
  status: NetworkStatus;
  /** Score 0-100 : 100 = parfait, 0 = complètement offline */
  score: number;
  /** Niveau de confiance 0.0-1.0 */
  confidence: number;
  /** Résultats par provider */
  providers: ProviderReachability[];
  /** Timestamp ISO 8601 */
  timestamp: string;
  /** Durée du diagnostic en ms */
  duration_ms: number;
  /** Codes de diagnostic stables */
  codes: NetworkDiagnosticCode[];
}
```

### ProviderReachability

```typescript
export interface ProviderReachability {
  provider_id: string;
  reachable: boolean;
  latency_ms: number | null;
  error_code: string | null;
  /** Méthode utilisée: 'ping' | 'healthcheck' | 'dns' */
  method: 'ping' | 'healthcheck' | 'dns';
}
```

### NetworkDiagnosticCode

```typescript
export type NetworkDiagnosticCode =
  | 'NET_DIAG_OK'
  | 'NET_DIAG_DNS_FAIL'
  | 'NET_DIAG_LATENCY_HIGH'
  | 'NET_DIAG_PROVIDER_DOWN'
  | 'NET_DIAG_ALL_PROVIDERS_DOWN'
  | 'NET_DIAG_PARTIAL_CONNECTIVITY'
  | 'NET_DIAG_TIMEOUT'
  | 'NET_DIAG_CACHE_HIT';
```

### Invariants Ring 1

- `status === 'ONLINE'  =>  score >= 50  &&  confidence >= 0.5`
- `status === 'OFFLINE' =>  score === 0`
- `score === 0          =>  status !== 'ONLINE'`
- `providers.every(p => p.reachable) => status !== 'OFFLINE'`

---

## Ring 2 — Engines (src/engines/)

### NetworkDiagnosticEngine

**Responsabilité**: checks purs, sans I/O — consomme des résultats de checks injectés.

```typescript
// src/engines/network/NetworkDiagnosticEngine.ts
interface CheckResult {
  provider_id: string;
  latency_ms: number | null;
  reachable: boolean;
  error?: string;
}

class NetworkDiagnosticEngine {
  /**
   * Calcule un NetworkDiagnosticReport à partir des résultats de checks.
   * Pur (pas d'I/O) — les checks sont fournis par Ring 3.
   */
  computeReport(checks: CheckResult[], durationMs: number): NetworkDiagnosticReport;

  /**
   * Calcule un score 0-100 à partir des checks.
   */
  computeScore(checks: CheckResult[]): number;

  /**
   * Calcule un niveau de confiance 0.0-1.0.
   */
  computeConfidence(checks: CheckResult[]): number;
}
```

### RoutingPolicyEngine

**Responsabilité**: consomme un `NetworkDiagnosticReport` et retourne la politique de routage.

```typescript
// src/engines/network/RoutingPolicyEngine.ts
interface RoutingDecision {
  preferred_mode: 'REMOTE' | 'LOCAL' | 'OFFLINE';
  allow_remote: boolean;
  reason_code: NetworkDiagnosticCode;
}

class RoutingPolicyEngine {
  /**
   * Détermine la décision de routage en fonction du rapport de diagnostic.
   * Pur (pas d'I/O).
   */
  decide(report: NetworkDiagnosticReport): RoutingDecision;
}
```

---

## Ring 3 — Services (src/services/)

### Tauri Commands (liste + signatures)

```rust
// src-tauri/src/commands/network_diagnostic.rs

/// Lance un diagnostic réseau complet (ping + DNS + healthcheck providers).
#[tauri::command]
pub async fn network_diagnose() -> Result<NetworkDiagnosticReport, String>;

/// Retourne le dernier rapport mis en cache (TTL: 30s).
#[tauri::command]
pub async fn network_diagnostic_cached() -> Result<Option<NetworkDiagnosticReport>, String>;

/// Vérifie la joignabilité d'un provider spécifique.
#[tauri::command]
pub async fn network_check_provider(provider_id: String) -> Result<ProviderReachability, String>;
```

### Caching TTL

- Rapport complet: TTL = 30 secondes
- Provider individuel: TTL = 10 secondes
- Sur changement réseau système: invalidation immédiate

### Logs NET_DIAG_*

Format standard:
```
[NET_DIAG_START] provider_count=3 timeout_ms=5000
[NET_DIAG_RESULT] status=ONLINE score=85 confidence=0.9 duration_ms=1200
[NET_DIAG_PROVIDER] provider=gemini reachable=true latency_ms=320
[NET_DIAG_PROVIDER] provider=ollama reachable=true latency_ms=15
[NET_DIAG_PROVIDER] provider=openai reachable=false error=DNS_FAIL
[NET_DIAG_CACHE_HIT] age_ms=12000 status=ONLINE
```

### Surfaces contrôlées

- Uniquement via `tauriClient.networkDiagnose()` (IPC canonique)
- Pas de fetch() direct depuis frontend
- Pas de gestion WiFi OS-level

---

## Ring 4 — UI/Tests

### Page diagnostic (proposition)

```tsx
// src/pages/NetworkDiagnosticPage.tsx (futur)
// - Affiche NetworkDiagnosticReport complet
// - Score + status + providers
// - Bouton "Re-diagnostiquer"
// - data-testid stables: network-status, network-score, provider-list
```

### Intégration Chat banner

Quand `NetworkDiagnosticReport.status === 'OFFLINE'`:
- Banner visible dans le chat: "Mode hors ligne — providers externes indisponibles"
- reason_code affiché: `NET_DIAG_ALL_PROVIDERS_DOWN`

### Tests unitaires/intégration (proposition)

```typescript
describe('NetworkDiagnosticEngine', () => {
  it('score=100 quand tous les providers reachable');
  it('score=0 quand aucun provider reachable');
  it('status=ONLINE implique score>=50');
  it('status=OFFLINE implique score=0');
});

describe('RoutingPolicyEngine', () => {
  it('OFFLINE report → allow_remote=false');
  it('ONLINE report → allow_remote=true');
  it('DEGRADED report → preferred_mode=LOCAL avec allow_remote=true');
});
```

---

## Explicit non-go

❌ **Pas de gestion WiFi OS-level** (wpa_supplicant, NetworkManager, etc.)
❌ **Pas de modification allowlist/capabilities** sans instruction explicite
❌ **Pas de fetch() direct** depuis frontend sans whitelist contrôlée

---

## Rollback

Si implémentation décidée ultérieurement:
```bash
git restore -- src/engines/network/ src/services/network/ src-tauri/src/commands/network_diagnostic.rs
```

---

*Statut: PLAN / DOC-ONLY — Ring 1-4 proposés, non implémentés.*
*Prochaine étape: validation par équipe + gate G5 avant implémentation runtime.*
