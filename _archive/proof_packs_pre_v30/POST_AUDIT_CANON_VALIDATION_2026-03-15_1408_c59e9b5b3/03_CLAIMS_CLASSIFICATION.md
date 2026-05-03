# 03_CLAIMS_CLASSIFICATION.md — POST_AUDIT_CANON_VALIDATION
# Date: 2026-03-15T14:08:00Z | SHA: c59e9b5b3

## Critical Claims — Full Classification

| Claim | Class | Source | Correction Applied |
|-------|-------|--------|--------------------|
| 401 commands @ SHA c59e9b5b3 | PROVEN_BY_DIRECT_EVIDENCE | Python re.findall on main.rs, stash-confirmed | Replaces "378" |
| 408 commands current workspace | PROVEN_BY_DIRECT_EVIDENCE | Python re.findall on main.rs | Includes AUDIO +7 |
| "378" was grep truncation artifact | PROVEN_BY_DIRECT_EVIDENCE | Compare grep-A vs Python results | RETRACTED |
| handlers.rs macro NOT invoked | PROVEN_BY_DIRECT_EVIDENCE | grep "mod handlers\|use handlers\|generate_titane_handlers!()" in main.rs → 0 results | C003 downgraded |
| canon-events.jsonl was invalid JSON | PROVEN_BY_DIRECT_EVIDENCE | python3 json.loads() failed on original | FIXED |
| IPC wrapper CanonicalIpcResult{ok,content,error} | PROVEN_BY_DIRECT_EVIDENCE | src/utils/invoke.ts direct read | Confirmed |
| No raw fetch in src/ | PROVEN_BY_DIRECT_EVIDENCE | grep -r "fetch\|axios\|XMLHttpRequest" src/ | Confirmed |
| 5 memory files | PROVEN_BY_DIRECT_EVIDENCE | ls memory/ | Confirmed |
| 261 autoheal entries | PROVEN_BY_DIRECT_EVIDENCE | wc -l scripts/autoheal/autoheal_rules.jsonl | After AH-CANON-001 |
| 160 proof_packs directories | PROVEN_BY_DIRECT_EVIDENCE | ls proof_packs/ \| wc -l | Confirmed |
| tauri.conf.json dirty (beforeBuildCommand="true") | PROVEN_BY_DIRECT_EVIDENCE | direct file read | C001 OPEN P1 |
| 4-Ring architecture respected | INFERRED | src/ directory structure + AGENTS.md | Not runtime-confirmed |
| One Door network operational | INFERRED | grep + httpClient.ts | Not E2E confirmed |
| Build succeeds | UNVERIFIED | cargo check NOT run | BLOCKED by tauri.conf.json |
| E2E tests pass | UNVERIFIED | E2E not run | BLOCKED |
| Runtime stability STABLE | UNVERIFIED | No runtime proof | CANNOT CLAIM |
