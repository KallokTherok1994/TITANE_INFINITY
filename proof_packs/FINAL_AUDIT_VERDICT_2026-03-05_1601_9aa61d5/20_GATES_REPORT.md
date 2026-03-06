# 20_GATES_REPORT — Rapport Gates Final
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Table des Gates

| Gate | Status | Preuve | Commandes | Artefacts |
|------|--------|--------|-----------|-----------|
| **G_BOOT_TRUTH** | ✅ PASS | SHA 9aa61d5, clean | `git status` | — |
| **G_VERSION_SYNC** | ✅ PASS | 27.2.0 × 4 manifests | grep version × 4 | 16_VERSIONS_SYNC_REPORT.md |
| **G_TAURI_ONLY** | ✅ PASS | exit 1 in package.json, 0 serveurs web | grep express/fastify | 09_INVARIANTS_SCAN_REPORT.md |
| **G_ALLOWLIST** | ✅ PASS | 6 capabilities + 18KB allowlist | ls capabilities/ | 08_ALLOWLIST_CAPABILITIES_REPORT.md |
| **G_FALLBACK_LOCAL** | ✅ PASS | localhost:11434 + ollamaTransport.ts | grep localhost:11434 | 06_SURFACE_NETWORK_REPORT.md |
| **G_RING_INTEGRITY_TS** | ✅ PASS | engine-isolation.test.ts (CI) | grep forbidden imports | 05_RING_INTEGRITY_REPORT.md |
| **G_RING_INTEGRITY_RUST** | ❌ **FAIL** | summarizer.rs:315, embeddings.rs:216 | grep http_client | 05_RING_INTEGRITY_REPORT.md |
| **G_ONE_DOOR** | ❌ **FAIL** | Ring 2 HTTP bypass overdrive | grep HttpClient::new | 06_SURFACE_NETWORK_REPORT.md |
| **G_UI_NO_WEB** | ⚠️ RISK | selfHealingObserver.ts:431 | grep window.fetch= | 06_SURFACE_NETWORK_REPORT.md |
| **G_IPC_CANONICAL** | ⚠️ APPROX | CommandResult != {ok,content,error} | grep CommandResult | 07_IPC_CANON_REPORT.md |
| **G_TIMEOUTS** | ⚠️ PARTIAL | overdrive ✅ / 1261 commands NON PROUVÉ | cat chat_orchestrator | 07_IPC_CANON_REPORT.md |
| **G_GITGUARDIAN** | ❌ **FAIL** | runs 22726019959, 22725956940 | GitHub API | 14_CI_WORKFLOWS_REVIEW.md |
| **G_CI_APPROVAL** | 🟡 BLOCKED_APPROVAL | action_required × 10 | GitHub API | 14_CI_WORKFLOWS_REVIEW.md |
| **G_TESTS_X3** | 🔴 BLOCKED | pnpm absent | pnpm test × 3 | 11_TESTS_X3.md |
| **G_FORMAT_X3** | 🔴 BLOCKED | pnpm absent | pnpm format:check × 3 | 11_TESTS_X3.md |
| **G_LINT_X3** | 🔴 BLOCKED | pnpm absent | pnpm lint × 3 | 11_TESTS_X3.md |
| **G_TYPECHECK_X3** | 🔴 BLOCKED | pnpm absent | pnpm check × 3 | 11_TESTS_X3.md |
| **G_CARGO_TESTS_X3** | 🔴 BLOCKED | GTK absent | cargo test × 3 | 11_TESTS_X3.md |
| **G_BUILD_X3** | 🔴 BLOCKED | GTK absent | pnpm build × 3 | 12_BUILD_X3.md |
| **G_E2E_X3** | 🔴 BLOCKED_E2E_RUNTIME | binary absent | playwright × 3 | 13_E2E_X3.md |
| **G_IPC_CONTRACT** | 🔴 BLOCKED | node_modules absent | guard:ipc-contract × 3 | 11_TESTS_X3.md |
| **G_TOPOLOGY** | ✅ PASS | 42 workflows + 16 packs + 7 registres | find/ls | 03_REPO_TOPOLOGY.md |
| **G_PROOF_ARTIFACTS** | ✅ PASS | 16 packs, 8 MAP, 7 JSONL | find proof_packs | 15_PROOF_ARTIFACTS_INDEX.md |
| **G_AH_RULE_CAPTURED** | ✅ PASS | AH-2026-03-05-0004 | detect_recurrence.sh | autoheal_rules.jsonl |
| **G_AH_RECURRENCE_GUARD** | ✅ PASS | detect_recurrence.sh PASS | bash detect_recurrence | autoheal_rules.jsonl |
| **G_MAP_INDEX** | ✅ PASS | docs/MAP_INDEX.md | ls docs/MAP_*.md | 15_PROOF_ARTIFACTS_INDEX.md |
| **G_MAP_ARCHITECTURE** | ✅ PASS | docs/MAP_ARCHITECTURE_4RING.md | ls | — |
| **G_MAP_SURFACES** | ✅ PASS | docs/MAP_SURFACES_NETWORK.md | ls | — |
| **G_MAP_IPC** | ✅ PASS | docs/MAP_IPC_COMMANDS.md | ls | — |
| **G_MAP_TESTS_GATES** | ✅ PASS | docs/MAP_TESTS_GATES.md | ls | — |
| **G_MERMAID_4** | ✅ PASS | 4 .mmd sources + MAP_MERMAID_OVERVIEW.md | ls docs/diagrams/ | — |
| **G_MAP_ANTI_DRIFT** | ✅ PASS | scripts/verify/enforce-invariants-governed.sh | ls | — |

---

## Distribution

| Status | Count | % |
|--------|-------|---|
| ✅ PASS | 16 | 49% |
| ❌ FAIL | 3 | 9% |
| ⚠️ RISK/APPROX/PARTIAL | 3 | 9% |
| 🔴 BLOCKED | 8 | 24% |
| 🟡 BLOCKED_APPROVAL | 1 | 3% |
| — | 2 | 6% |

---

## Conditions pour passer à PASS

```
Fixes requis:
  FIX-001 → G_RING_INTEGRITY_RUST: PASS
  FIX-001 → G_ONE_DOOR: PASS
  FIX-003 → G_UI_NO_WEB: PASS
  FIX-006 + env → G_TESTS_X3, G_BUILD_X3, G_CARGO_TESTS_X3: PASS
  GitGuardian investigation → G_GITGUARDIAN: PASS
  KallokTherok1994 approval → G_CI_APPROVAL: PASS
  E2E binary → G_E2E_X3: PASS
```
