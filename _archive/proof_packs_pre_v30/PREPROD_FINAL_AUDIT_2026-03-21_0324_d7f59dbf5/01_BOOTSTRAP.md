# 01_BOOTSTRAP

## Git State
- Branch: MAIN
- HEAD: d7f59dbf5 ("preprod seal: fix capability-coverage validator accuracy + proof pack")
- 18 commits ahead of origin/MAIN
- Working tree: CLEAN

## Tooling
| Tool | Version | Required | Status |
|------|---------|----------|--------|
| node | v18.19.1 | >=20.0.0 | ⚠️ BLOCKED_BY_ENV |
| pnpm | 10.30.2 | >=9.0.0 | ✅ OK |
| cargo | 1.94.0 | — | ✅ OK |
| rustc | 1.94.0 | — | ✅ OK |
| pnpm tauri | ERR_NODE_VERSION | — | ⚠️ BLOCKED_BY_ENV |

## Compile Gates
- tsc --noEmit: EXIT 0 ✅
- cargo check: EXIT 0 ✅

## Governance Gates
- verify_instructions.sh: PASS=20 FAIL=0 ✅
- detect_recurrence.sh: PASS entries=489 ✅

## Key Docs Read
- CHANGELOG.md ✅
- docs/README.md ✅
- registry/ui-events.jsonl ✅
- registry/proofpack-index.jsonl ✅
- proof_packs/LOCAL_PROD_GATE_SEAL_2026-03-21_2307_a3212d6fb/ ✅ (prior audit)
