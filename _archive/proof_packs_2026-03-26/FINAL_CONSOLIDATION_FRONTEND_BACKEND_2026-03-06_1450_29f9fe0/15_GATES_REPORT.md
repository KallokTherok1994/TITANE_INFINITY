# 15 — RAPPORT DES GATES
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

| Gate | Statut | Preuve | Fichier | Commande |
|------|--------|--------|---------|---------|
| G_BOOTSTRAP_COMPLETE | ✅ PASS | SHA 29f9fe0, état dépôt connu | `01_BOOTSTRAP.md` | `git rev-parse --short HEAD` |
| G_SCOPE_FROZEN | ✅ PASS | Budget défini, engagement no-refactor | `02_SCOPE_FREEZE.md` | — |
| G_EXISTING_AUDITS_INVENTORIED | ✅ PASS | 27 packs inventoriés, classifiés | `03_EXISTING_AUDITS_INVENTORY.md` | `ls proof_packs/` |
| G_TRUTH_MODEL_CONSOLIDATED | ✅ PASS | 6 surfaces de vérité documentées | `04_CONSOLIDATED_TRUTH_MODEL.md` | — |
| G_FINDINGS_NORMALIZED | ✅ PASS | 19 findings, 6 FIXED, 9 P2, 2 BLOCKED | `05_NORMALIZED_FINDINGS_REGISTER.md` | — |
| G_DUPLICATES_RESOLVED | ✅ PASS | Aucune contradiction, doublons classifiés | `06_DUPLICATES_AND_CONTRADICTIONS.md` | — |
| G_PRIORITY_BACKLOG_DEFINED | ✅ PASS | 0 P0, 1 P1 (F-006), 6 P2 | `07_FINAL_PRIORITY_BACKLOG.md` | — |
| G_PATCHES_BOUNDED | ✅ PASS | 3 passes bornées, max 1 fichier modifié (session 3) | `08_EXECUTION_PLAN.md` | — |
| G_TRUTH_SURFACES_UPDATED | ✅ PASS | 30 cmd + 1 état, chat_generate retiré | `10_TRUTH_SURFACES_UPDATED.md` | `grep -c` |
| G_DOCS_REGISTRY_ALIGNED | ✅ PASS | AutoHeal à jour, capabilities alignées | `11_DOCS_AND_REGISTRY_ALIGNMENT.md` | — |
| G_NO_FRONTEND_OPEN_WEB | ✅ PASS | 0 fetch direct — Wikipedia via IPC web_research | `12_SCANS.log` | `grep fetch src/` |
| G_NO_GHOST_COMMANDS | ✅ PASS | chat_generate retiré de l'allowlist | `12_SCANS.log` | `grep chat_generate chat_ai.json` |
| G_NO_INACTIVE_BUT_USED_COMMANDS | ✅ PASS | 30 commandes P1 corrigées | `09_PATCHES_APPLIED.md` | `grep -c cmd main.rs` |
| G_IPC_CANONICAL_HONEST | ✅ PASS | {ok,content,error} — normalisation legacy | `04_CONSOLIDATED_TRUTH_MODEL.md` | — |
| G_NO_UI_BACKEND_CONTRADICTION | ✅ PASS | CP/SelfHeal/Identity/Audio UI → backend aligné | `10_TRUTH_SURFACES_UPDATED.md` | — |
| G_NO_PLACEHOLDER_LIES | ✅ PASS | webResearch: URLs via IPC, pas de fetch direct | `12_SCANS.log` | — |
| G_CAPABILITIES_ALIGNED | ✅ PASS | chat_generate retiré, deny-by-default intact | `09_PATCHES_APPLIED.md` | `python3 json.tool` |
| G_REQUIRED_TESTS_PASS | ⚠️ BLOCKED_ENV | vitest non disponible localement | `13_TESTS_X3.log` | CI qualifie |
| G_REQUIRED_BUILDS_PASS | ⚠️ BLOCKED_ENV | glib-2.0 manquant dans sandbox | `14_BUILD_X3.log` | CI qualifie |
| G_SELF_AUDIT_CLEAN | ✅ PASS | Re-check toutes surfaces — aucune contradiction | `12_SCANS.log` | grep verification |
| G_PROOF_PACK_COMPLETE | ✅ PASS | 19 fichiers requis créés | Ce répertoire | `ls proof_packs/FINAL_*` |
| G_AH_RULE_CAPTURED_FOR_EACH_FIX | ✅ PASS | AH-0044 ajouté | `scripts/autoheal/autoheal_rules.jsonl` | `detect_recurrence.sh` |
| G_AH_RECURRENCE_GUARD_PASS | ✅ PASS | detect_recurrence.sh → PASS | — | `bash scripts/autoheal/detect_recurrence.sh` |
| G_MAP_ANTI_DRIFT_RULE_PRESENT | ✅ PASS | AutoHeal prevention_test inclut grep guards | `scripts/autoheal/autoheal_rules.jsonl` | — |

---

## Résumé

| Statut | Nb |
|--------|----|
| ✅ PASS | 22 |
| ⚠️ BLOCKED_ENV | 2 (tests + build — qualifiés par CI) |
| ❌ FAIL | 0 |

**VERDICT : PASS (sous réserve de qualification CI pour build/tests)**
