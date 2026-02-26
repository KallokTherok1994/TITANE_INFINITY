# 12_PERFORMANCE_METRICS.md

## Performance Stability Constraint

### Mesures minimales à collecter
- latence offline
- latence online
- latence écriture DB
- latence snapshot
- latence recherche
- seuil circuit breaker

### Méthode
- Logs horodatés + timings dans `TraceFrame`.
- Chaque métrique doit inclure `p50`, `p95`, `max`, fenêtre temporelle.

### Gabarit de capture
- `offline_latency_ms`: UNKNOWN
- `online_latency_ms`: UNKNOWN
- `db_write_latency_ms`: UNKNOWN
- `snapshot_latency_ms`: UNKNOWN
- `search_latency_ms`: UNKNOWN
- `circuit_breaker_threshold`: UNKNOWN

### Règle de stabilité
- Une variation > x5 sans justification = **BLOCKED**.

### Commandes recommandées
- `rg -n "TraceFrame|latency|timing|duration" src src-tauri`
- `cargo test --manifest-path src-tauri/Cargo.toml -- --nocapture`
- `pnpm test -- --runInBand`

### Statut actuel
- Instrumentation de base présente partiellement.
- Baseline chiffrée unifiée non consolidée dans ce fichier: **BLOCKED**.
- Ring impacté: **Ring 3 (Services)**
- Statut changement: **EXPERIMENTAL**
