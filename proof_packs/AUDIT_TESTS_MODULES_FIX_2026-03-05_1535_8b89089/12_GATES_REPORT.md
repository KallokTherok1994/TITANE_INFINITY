# 12_GATES_REPORT — Rapport des Gates
**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z

---

## Gates Applicables

| Gate | Statut | Preuve |
|------|--------|--------|
| **G_BOOT_TRUTH** | ✅ PASS | git clean, SHA 8b89089, env documenté |
| **G_RING_INTEGRITY_TS** | ✅ PASS | engine-isolation.test.ts PASS (BLOCKED local mais CI attendu PASS) |
| **G_RING_INTEGRITY_RUST** | ❌ **FAIL** | summarizer.rs:315, embeddings.rs:216 — HTTP Ring 2 |
| **G_INV_UI_NO_WEB** | ⚠️ RISK | selfHealingObserver.ts:431 monkey-patch |
| **G_INV_ONE_DOOR** | ❌ **FAIL** | Ring 2 HTTP bypass gateway |
| **G_INV_TAURI_ONLY** | ✅ PASS | 0 serveurs web, package.json exit 1 |
| **G_INV_IPC_CANONICAL** | ⚠️ SUSPICION | TauriBridge/StateBridge invoke direct |
| **G_INV_ALLOWLIST** | ✅ PASS | 6 capabilities + 18KB allowlist |
| **G_VERSION_SYNC** | ✅ PASS | 27.2.0 dans 4 fichiers |
| **G_LINT_X3** | 🔴 BLOCKED | pnpm absent |
| **G_FORMAT_X3** | 🔴 BLOCKED | pnpm absent |
| **G_TYPECHECK_X3** | 🔴 BLOCKED | pnpm absent |
| **G_TESTS_X3** | 🔴 BLOCKED | node_modules absent |
| **G_BUILD_X3** | 🔴 BLOCKED | pnpm + GTK absents |
| **G_RUST_TESTS_X3** | 🔴 BLOCKED | GTK absent |
| **G_IPC_CONTRACT** | 🔴 BLOCKED | node_modules absent |
| **G_E2E** | 🔴 BLOCKED_E2E_RUNTIME | Tauri binary absent |
| **G_CI_REVIEW** | 🟡 BLOCKED_APPROVAL | action_required |
| **G_GITGUARDIAN** | ❌ FAIL | gitguardian.yml run 22725107837 = failure |
| **G_PROOF_ARTIFACTS** | ✅ PASS | 15 packs, 7 registres, 8 MAP docs |
| **G_AH_RULE_CAPTURED** | ✅ PASS | AH-2026-03-05-0003 ajouté |
| **G_AH_RECURRENCE** | ✅ PASS | detect_recurrence.sh → PASS |

---

## Mapping Gates

| Zone | PASS | FAIL | RISK | BLOCKED | Total |
|------|------|------|------|---------|-------|
| Invariants | 3 | 2 | 2 | 0 | 7 |
| Exécution | 0 | 0 | 0 | 9 | 9 |
| CI | 0 | 1 | 0 | 2 | 3 |
| Governance | 3 | 0 | 0 | 0 | 3 |
| **Total** | **6** | **3** | **2** | **11** | **22** |

---

## Gates Mapping (constitution §18)

| Gate | Statut |
|------|--------|
| G_MAP_INDEX_PRESENT | ✅ PASS (docs/MAP_INDEX.md) |
| G_MAP_ARCHITECTURE_PRESENT | ✅ PASS (docs/MAP_ARCHITECTURE_4RING.md) |
| G_MAP_SURFACES_PRESENT | ✅ PASS (docs/MAP_SURFACES_NETWORK.md) |
| G_MAP_IPC_COMMANDS_PRESENT | ✅ PASS (docs/MAP_IPC_COMMANDS.md) |
| G_MAP_TESTS_GATES_PRESENT | ✅ PASS (docs/MAP_TESTS_GATES.md) |
| G_MERMAID_PRESENT | ✅ PASS (docs/MAP_MERMAID_OVERVIEW.md + 4 .mmd sources) |
| G_MAP_PROOF_LOG_PRESENT | ✅ PASS (reports/MAP_PROOFS.log) |
| G_MAP_NO_UNKNOWN_CRITICAL | ⚠️ RISK (Ring 2 Rust = UNKNOWN pour tests auto) |
| G_MAP_ANTI_DRIFT_RULE_PRESENT | ✅ PASS (scripts/verify/enforce-invariants-governed.sh) |

---

## Condition de Levée du BLOCKED

Pour passer de BLOCKED → PASS/FAIL:
1. Installer pnpm + GTK
2. `pnpm install --frozen-lockfile`
3. Exécuter `pnpm test`, `cargo test --all`
4. Corriger FIX-001 (Ring 2 I/O Rust)
5. Valider avec `pnpm test:architecture` + `cargo test --test ring2_architecture_test`
6. Re-évaluer verdict
