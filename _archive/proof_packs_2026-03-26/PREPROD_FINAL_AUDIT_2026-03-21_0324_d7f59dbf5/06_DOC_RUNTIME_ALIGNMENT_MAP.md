# 06_DOC_RUNTIME_ALIGNMENT_MAP

| Doc | Claim | Runtime Evidence | Stale? | Action |
|-----|-------|-----------------|--------|--------|
| CHANGELOG.md (v28.5.0) | Provider reset, LTM, memory backup — all correct | ✅ cargo check, prior sessions | No | Added TWINS fusion section ✅ |
| README.md | v28.5.0 status, native freshness gate added | ✅ valid | No | OK |
| docs/README.md | Build command with proper token format; freshness gate added | ✅ valid | No | OK |
| registry/ui-events.jsonl | Missing TWINS fusion event | — | YES → FIXED ✅ | Entry appended |
| registry/proofpack-index.jsonl | Missing TWINS proof pack | — | YES → FIXED ✅ | Entry appended |
| proof_packs/LOCAL_PROD_GATE_SEAL | Verdict: QUALIFIED + PROD_BLOCKED | ✅ still valid | No (pre-TWINS) | Still valid as pre-TWINS baseline |
| proof_packs/TITANE_TWINS_MENU_FUSION | Nav fusion proof | ✅ tsc/vitest | No | Registered now ✅ |

## Assessment
All critical docs/registry now aligned with code truth.
No stale authoritative doc remains uncorrected.
