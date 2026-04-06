# 08 — CRASH AND RISK MATRIX

## Risques inventoriés (session locale, lecture seule sur code)

| Risk | Surface | Trigger | Impact | Proof | Fix maintenant? | Priority |
|------|---------|---------|--------|-------|-----------------|----------|
| ACTIVE_CRASH | — | — | — | Aucun crash actif détecté | N/A | — |
| CRASH_POTENTIAL (Rust .unwrap) | src-tauri/src/ (non-test) | Valeur None/Err sur 168 appels .unwrap() | Panic → crash Tauri process | 168 .unwrap() comptés | Non (pré-existant, hors scope session) | P2 |
| CRASH_POTENTIAL (Rust .expect) | src-tauri/src/ (non-test) | Valeur None/Err sur 1246 .expect() | Panic → crash Tauri process | 1246 .expect() comptés | Non (pré-existant, scope distinct) | P2 |
| NULL_PATH_RISK | src/ (TS) | 268 `as any` casts dans frontend | Runtime type error silencieux | 268 comptés | Non (lint: EXIT=0, tests PASS) | P3 |
| STALE_ARTIFACT_RISK | memory/system_state.json | Lecture état moteur v14.0.0 au lieu de v28 | UI ou moteur lit version périmée | last_update: 2025-11-25 | Non (runtime file, écrasé au prochain run) | P3 |
| TARGET_MISMATCH_RISK | — | — | — | Aucun mismatch détecté dans scope session | N/A | — |
| IPC_CONTRACT_RISK | src/lib/ipcContract.ts | Command non-whitelistée invoquée | BLOCKED par secureInvoke | ipcContract.ts présent + secureInvoke wrapper | N/A | — |
| TIMEOUT_MASKING_RISK | e2e/desktop/ | Session WebKit invalide après ~40s TTS | PARTIAL verdict (connu, autoheal AH-2026-03-17-E2E-002 existant) | Autoheal entry présente | Non (guard ajouté in E2E) | P2 |
| RETRY_LEAK_RISK | — | — | — | Aucun retry non-borné détecté dans scope | N/A | — |
| FALLBACK_LIAR_RISK | src-tauri stubs | Stub DEGRADED retourne {status:"degraded"} | UI voit DEGRADED honnête | FIX-016 réel: stubs honnêtes | N/A | — |
| UI_DRIFT_RISK | registry/ui-events.jsonl | UI change sans enregistrement | Drift doc/UI | 120 entrées, dernière 2026-03-15 | N/A (scope session = governance) | P3 |
| DEFAULT_VALUE_LIAR_RISK | memory/system_state.json | Engines falsely "active" from stale state | UI affiche "actif" pour moteurs stales | Fichier daté 2025-11-25 | Non (P3, pré-existant) | P3 |
| NOOP_HEAL_RISK | — | — | — | Non détecté | N/A | — |
| DOC_OVERRUN_RISK | docs/ | 3 dernières sessions ont ajouté ~90 docs | Docs > runtime | Alignement vérifié DOCS_CANON + AUDIT | N/A | — |
| MEMORY_OVERSALE_RISK | memory/ | system_state.json v14 vs runtime v28 | Fausse impression de LTM opérationnelle | Statut: MEMORY_PARTIAL (state-at-rest stale) | Non | P2 |
| DUPLICATE_ID_RISK | autoheal_rules.jsonl | Double entrée id identique → governance FAIL | verify_instructions FAIL | **FERMÉ par ce fix** | DÉJÀ FAIT | P1 → CLOSED |

## Synthèse

- **P0 ACTIF:** Aucun
- **P1 FERMÉ:** Doublon AH ID → governance gate restaurée PASS=20 FAIL=0
- **P2 pré-existants:** .unwrap/.expect (Rust), stale memory, E2E webkit session
- **P3 cosmétiques/hors-scope:** as-any casts TS, ui-events.jsonl drift
