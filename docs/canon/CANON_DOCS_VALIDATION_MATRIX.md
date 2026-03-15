# CANON_DOCS_VALIDATION_MATRIX.md
# Post-Audit Validation Matrix — docs/canon/
# Generated: 2026-03-15T14:08:00Z — POST_AUDIT_CANON_VALIDATION session
# SHA: c59e9b5b3

---

## Per-Document Trust Assessment

| file | exists | gen_prev_session | claims_count | proven | inferred | unverified | trust_level | required_action |
|------|--------|-----------------|-------------|--------|----------|------------|-------------|-----------------|
| REPO_TRUTH_REPORT.md | YES | YES | ~25 | 18 | 5 | 2 | MEDIUM | KEEP (378 patched) |
| ARCHITECTURE_TRUTH.md | YES | YES | ~20 | 14 | 5 | 1 | MEDIUM | KEEP (378 patched) |
| CAPABILITY_REGISTRY_CANON.md | YES | YES | ~40 | 22 | 14 | 4 | MEDIUM | KEEP (378 patched) |
| COMMANDS_SOURCE_OF_TRUTH.md | YES | YES | ~30 | 20 | 7 | 3 | MEDIUM | KEEP (378+C003 patched) |
| TRUTH_MATRIX.md | YES | YES | ~35 | 20 | 10 | 5 | MEDIUM | KEEP (378 patched) |
| GATES_REPORT_CANON.md | YES | YES | ~12 | 8 | 3 | 1 | MEDIUM | KEEP (378 patched) |
| CONTRADICTION_MATRIX.md | YES | YES | ~15 | 10 | 3 | 2 | MEDIUM | KEEP (C003 downgraded) |
| MEMORY_TRIAGE_INDEX.md | YES | YES | ~20 | 10 | 8 | 2 | MEDIUM | KEEP (378 patched) |
| MEMORY_EVOLUTION_CANON.md | YES | YES | ~15 | 8 | 5 | 2 | MEDIUM | KEEP |
| HISTORICAL_SUPERSESSION_LOG.md | YES | YES | ~12 | 8 | 3 | 1 | MEDIUM | KEEP (378 patched) |
| MEMORY_GOVERNANCE_LEDGER.md | YES | YES | ~10 | 6 | 3 | 1 | MEDIUM | KEEP |
| TITANE_BRAIN_CANON.md | YES | YES | ~25 | 12 | 10 | 3 | MEDIUM | KEEP (378 patched) |

---

## Key Claims Classified

### PROVEN_BY_DIRECT_EVIDENCE

| Claim | Source | Method |
|-------|--------|--------|
| 401 commands at SHA c59e9b5b3 | src-tauri/src/main.rs | Python re.findall, stash-confirmed |
| 408 commands current workspace | src-tauri/src/main.rs | Python re.findall |
| IPC wrapper: CanonicalIpcResult{ok,content,error} | src/utils/invoke.ts | direct file read |
| handlers.rs macro NOT invoked from main.rs | src-tauri/src/main.rs, src-tauri/src/handlers.rs | grep (no mod/use/call) |
| httpClient.ts uses governed gateway | src/core/http/httpClient.ts | direct file read |
| App version 28.0.0 | package.json + tauri.conf.json | direct read |
| tauri.conf.json dirty (beforeBuildCommand="true") | src-tauri/tauri.conf.json | direct read |
| Registry append-only (260 lines autoheal) | scripts/autoheal/autoheal_rules.jsonl | wc -l |
| 5 memory files present | memory/ filesystem | ls |
| proof_packs: 160 directories | proof_packs/ filesystem | ls count |
| Node 18.19.1 | env | node --version |
| pnpm 10.30.2 | env | pnpm --version |
| Rust 1.94.0 | env | rustc --version |

### INFERRED (reasonable but not runtime-confirmed)

| Claim | Source | Caveat |
|-------|--------|--------|
| 4-Ring architecture functionally respected | src/structure + AGENTS.md | structural, no runtime E2E proof |
| One Door network (httpClient governs all) | grep no raw fetch in src/ | grep-based, no E2E |
| SecureSecretsEngine AES-256-GCM operational | main.rs setup code | code path, no runtime test |
| 5 AI providers registered | main.rs + configs | registered ≠ all operational |
| memory/ files read correctly at runtime | files present | structural, no E2E |
| IPC contract enforced in all commands | invoke.ts patterns | sampling, not exhaustive |

### UNVERIFIED (present in docs, no proof obtained)

| Claim | Doc | Why unverified |
|-------|-----|---------------|
| Runtime stability (STABLE) | multiple | No cargo check, no build, no E2E run |
| Tauri updater works | ARCHITECTURE_TRUTH | cargo build not executed |
| E2E tests pass | GATES_REPORT_CANON | E2E not run |
| Domain command counts (exact by domain) | COMMANDS_SOURCE_OF_TRUTH | Python parse counted total only |

---

## Trust Rules Applied

- **HIGH** = majority clearly proven + sober vocabulary → 0 docs qualify (no runtime proofs)
- **MEDIUM** = good foundation, over-statements corrected → ALL 12 docs after patching
- **LOW** = too many inferences or insufficient traceability → 0 after corrections

## Overclaims Corrected

| Doc | Original Claim | Corrected To | Class Before |
|-----|---------------|-------------|-------------|
| COMMANDS_SOURCE_OF_TRUTH.md | "378 commands" | 401@SHA/408 current | UNVERIFIED |
| REPO_TRUTH_REPORT.md | "378 commands" | 401@SHA/408 current | UNVERIFIED |
| TRUTH_MATRIX.md | "378 cmds PASS" | 401 + RETRACTED note | UNVERIFIED |
| TITANE_BRAIN_CANON.md | "378 commandes IPC" | 401@SHA/408 | UNVERIFIED |
| CAPABILITY_REGISTRY_CANON.md | "378 commandes" | 401@SHA/408 | UNVERIFIED |
| GATES_REPORT_CANON.md | "378 cmds PASS" | 401 + note | UNVERIFIED |
| ARCHITECTURE_TRUTH.md | "378 cmds" | 401@SHA/408 | UNVERIFIED |
| MEMORY_TRIAGE_INDEX.md | "378 commandes IPC" | 401@SHA/408 | UNVERIFIED |
| HISTORICAL_SUPERSESSION_LOG.md | "378 cmds" | 401@SHA/408 | UNVERIFIED |
| CONTRADICTION_MATRIX.md | C003 P1 shadowing | C003 INFO/P3 dead code | INFERRED→PROVEN |
