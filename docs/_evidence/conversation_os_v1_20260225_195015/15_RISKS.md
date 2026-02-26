# 15_RISKS.md

## Self-check Loop (audit final automatique)

### Scans obligatoires
- UI no-web:
  - `rg -n "fetch\(|axios\(" src`
- Backend HTTP unique:
  - `rg -n "reqwest|ureq" src-tauri`
- Écritures DB directes (patterns):
  - `rg -n "INSERT INTO|UPDATE|DELETE FROM" src src-tauri`
- Legacy entrypoints:
  - `rg -n "chat_send_message|legacy|orchestrator" src src-tauri`

## Registre anomalies

### A1 — Déterminisme hash RouterDecision non prouvé x3
- Sévérité: High
- Action: instrumenter hash décision et exécuter run1/run2/run3.
- Verdict conformité: BLOCKING

### A2 — Matrice failure simulations incomplète
- Sévérité: High
- Action: exécuter FS-01..FS-12 avec logs+traces.
- Verdict conformité: BLOCKING

### A3 — Baseline performance non consolidée
- Sévérité: Medium
- Action: renseigner `12_PERFORMANCE_METRICS.md` avec mesures horodatées.
- Verdict conformité: BLOCKING

## Memory governance v1 (règles)
- Aucune écriture mémoire hors “Persist stage”.
- Snapshots FR canoniques datés + hash.
- Retrieval log `memory_used[]` avec IDs + raisons.
- `top_k` borné.

## Release qualification protocol (checklist)
- git clean (hors evidence): PASS
- flags documentés: PASS
- rollback écrit: PASS
- aucun TODO critique: FAIL (A1/A2/A3)
- aucun secret: PASS
- build/test reproductible: PARTIAL PASS

## Verdict conformité
- **BLOCKED** tant que A1/A2/A3 ne sont pas fermées.
- Ring impacté: **Ring 4 (Modules/UI) + Ring 3 (Services)**
- Statut changement: **QUALIFIED**
