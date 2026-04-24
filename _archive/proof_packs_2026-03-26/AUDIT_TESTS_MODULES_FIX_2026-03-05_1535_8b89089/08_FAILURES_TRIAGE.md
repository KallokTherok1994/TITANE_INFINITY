# 08_FAILURES_TRIAGE — Triage des Échecs

**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z

---

## BLOCKED_APPROVAL (CI)

| Workflow                               | Run ID      | Status          | Cause                       | Action Requise                  |
| -------------------------------------- | ----------- | --------------- | --------------------------- | ------------------------------- |
| TITANE∞ CI/CD Unified Pipeline v26.3.0 | 22725110137 | action_required | Approbation humaine requise | KallokTherok1994 doit approuver |
| Mermaid Verify                         | 22725110148 | action_required | Idem                        | Idem                            |
| CodeQL                                 | 22725110209 | action_required | Idem                        | Idem                            |
| P0-1 Secrets Guard                     | 22725110205 | action_required | Idem                        | Idem                            |
| Gitleaks                               | 22725110347 | action_required | Idem                        | Idem                            |
| P4-Constitution                        | 22725110171 | action_required | Idem                        | Idem                            |
| P5-Runtime                             | 22725110267 | action_required | Idem                        | Idem                            |
| P6-Capability                          | 22725110246 | action_required | Idem                        | Idem                            |
| Release-Certification                  | 22725110330 | action_required | Idem                        | Idem                            |

**Classification: BLOCKED_APPROVAL** — Code est vert mais l'approbation est requise.
**Copilot ne peut pas lever ce blocage** — décision humaine uniquement.

---

## GitGuardian (FAIL réel)

| Workflow        | Run ID      | Status      | Cause Probable                             |
| --------------- | ----------- | ----------- | ------------------------------------------ |
| gitguardian.yml | 22725107837 | **failure** | Secret détecté ou faux positif GitGuardian |

**Note**: GitGuardian échoue régulièrement sur des faux positifs (patterns de test/config).
Statut: **BLOCKED** (non prouvable sans logs CI — job n'expose pas les détails via GitHub API dans ce contexte).

---

## Violations Statiques (prouvées)

| ID       | Module      | Fichier                                              | Ligne        | Type                      | Sévérité |
| -------- | ----------- | ---------------------------------------------------- | ------------ | ------------------------- | -------- |
| FAIL-001 | Ring 2 Rust | `src-tauri/src/engines/unified_memory/summarizer.rs` | 298, 315     | Ring 2 I/O HTTP           | P0       |
| FAIL-002 | Ring 2 Rust | `src-tauri/src/engines/unified_memory/embeddings.rs` | 213, 216     | Ring 2 I/O HTTP           | P0       |
| RISK-001 | SelfHealing | `src/services/selfHealing/selfHealingObserver.ts`    | 431          | window.fetch monkey-patch | P1       |
| RISK-002 | TauriBridge | `src/os/bridge/TauriBridge.ts`                       | 32, 162, 172 | invoke() hors canonical   | P1       |
| RISK-003 | StateBridge | `src/os/bridge/StateBridge.ts`                       | 84, 116, 225 | invoke() hors canonical   | P1       |

---

## Lacunes de Couverture Test (sans test couvrant)

| Module                           | Test Manquant                | Impact                                                            |
| -------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `unified_memory/summarizer.rs`   | Test Ring 2 no-I/O Rust      | La violation HTTP n'est pas détectée automatiquement              |
| `unified_memory/embeddings.rs`   | Idem                         | Idem                                                              |
| `selfHealingObserver.ts:431`     | Test governance monkey-patch | La monkey-patch est testée mais pas son impact sur la gouvernance |
| `TauriBridge.ts` (invoke direct) | Test contrat IPC bridges     | Les bridges contournent le contrat sans gate                      |

---

## Triage Par Ring

| Ring             | Statut              | Problèmes                                              |
| ---------------- | ------------------- | ------------------------------------------------------ |
| R1 Types         | ✅ OK               | Aucun                                                  |
| R2 Engines TS    | ✅ OK               | engine-isolation.test.ts passe (exception whitelistée) |
| R2 Engines Rust  | ❌ FAIL             | HTTP direct dans unified_memory                        |
| R3 Services TS   | ⚠️ RISK             | selfHealingObserver monkey-patch                       |
| R3 Services Rust | ✅ OK               | overdrive gateway correct                              |
| R3 Bridges       | ⚠️ SUSPICION        | invoke() direct (non prouvé problème contrat)          |
| R4 UI            | ✅ OK               | httpClient.ts bloque prod                              |
| CI               | 🟡 BLOCKED_APPROVAL | action_required sur tous les workflows                 |
