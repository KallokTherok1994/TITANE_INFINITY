# 09_PRIMARY_LOCK

## Chosen Primary Lock
**REGISTRY_DRIFT** — registry/ui-events.jsonl and registry/proofpack-index.jsonl had no entries for the TWINS menu fusion (commit 51efc2536). CHANGELOG.md was also missing the navigation section.

## Evidence
- `registry/ui-events.jsonl`: last entry dated 2026-03-15, no TWINS nav fusion event
- `registry/proofpack-index.jsonl`: last entry 2026-03-21T03:05:20Z (PREPROD audit), missing TWINS fusion pack
- `CHANGELOG.md`: [28.5.0] section had provider/memory entries but no nav fusion entry
- `proof_packs/TITANE_TWINS_MENU_FUSION_2026-03-21_0310_a3212d6fb/` existed but was not indexed

## Why This Was the Real Lock (not others)
- Code: tsc EXIT 0, cargo EXIT 0 — no code defects
- Tests: 27/27 x3 — no test failures
- Runtime chains: all previously certified, no regression
- Desktop: consistently DESKTOP_UNPROVEN (same as all prior sessions — not a new regression)
- Prod tokens: not provided (expected, policy gate)

## Fix Applied
1. Appended `registry/ui-events.jsonl` — TWINS fusion nav event
2. Appended `registry/proofpack-index.jsonl` — TWINS fusion proof pack entry
3. Prepended `CHANGELOG.md` — v29.2 Navigation Fusion section

## Status: FIXED ✅
