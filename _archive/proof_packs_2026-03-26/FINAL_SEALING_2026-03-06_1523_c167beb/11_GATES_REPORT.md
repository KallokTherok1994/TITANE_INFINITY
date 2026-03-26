# 11 — GATES REPORT
## FINAL_SEALING_2026-03-06_1523_c167beb

---

| Gate | Statut | Preuve | Log |
|------|--------|--------|-----|
| G_BOOTSTRAP_COMPLETE | ✅ PASS | SHA c167beb, env doc | `01_BOOTSTRAP.md` |
| G_COMMAND_ALIGNMENT | ✅ PASS | 416 registered, 268 P2 in budget | `02_COMMAND_ALIGNMENT.md` |
| G_IPC_CONTRACT_CANONICAL | ✅ PASS | {ok,content,error} — invoke.ts | `03_IPC_CONTRACT.md` |
| G_RUNTIME_TRUTH | ✅ PASS | providers status, mode, fallback honest | `04_RUNTIME_TRUTH.md` |
| G_FEATURE_TRUTH | ✅ PASS | P1 features aligned, P2 documented | `05_FEATURE_TRUTH.md` |
| G_CAPABILITIES_ALIGNED | ✅ PASS | chat_generate removed, deny-by-default | `06_CAPABILITIES.md` |
| G_NO_FRONTEND_OPEN_WEB | ✅ PASS | 0 fetch direct, URLs via IPC | `07_ARCHITECTURE_SCANS.md` |
| G_NO_GHOST_COMMANDS | ✅ PASS | chat_generate=0 in chat_ai.json | `07_ARCHITECTURE_SCANS.md` |
| G_NO_INACTIVE_COMMAND_USAGE | ✅ PASS | 30 P1 commands now registered | `02_COMMAND_ALIGNMENT.md` |
| G_TESTS_PASS | ⚠️ BLOCKED_ENV | vitest not available locally | `08_TESTS.log` |
| G_BUILDS_PASS | ⚠️ BLOCKED_ENV | glib-2.0 missing in sandbox | `09_BUILDS.log` |
| G_SELF_AUDIT_CLEAN | ✅ PASS | 0 contradictions | `10_SELF_AUDIT.md` |
| G_PRETTIER_PASS | ✅ PASS | `npx prettier --check "."` → all files ✅ | `07_ARCHITECTURE_SCANS.md` |
| G_AH_RULE_CAPTURED | ✅ PASS | AH-0045 ajouté | `scripts/autoheal/autoheal_rules.jsonl` |
| G_AH_RECURRENCE_GUARD | ✅ PASS | detect_recurrence.sh → PASS | — |

---

## Résumé

| Statut | Nb |
|--------|----|
| ✅ PASS | 13 |
| ⚠️ BLOCKED_ENV | 2 (tests+build — qualifiés par CI) |
| ❌ FAIL | 0 |

**VERDICT GATES: PASS (sous réserve CI pour tests+build)**
