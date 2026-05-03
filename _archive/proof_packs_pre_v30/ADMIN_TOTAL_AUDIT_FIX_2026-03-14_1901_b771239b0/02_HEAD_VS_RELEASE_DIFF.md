# 02_HEAD_VS_RELEASE_DIFF

Baseline release truth:
- tag/baseline: `v27.2.0-prod-release-20260302`
- commit: `76ea6840103507856256490cd0e51338ec01b819`

Compared target:
- HEAD: `936d25f26`

Proof:
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/04_git_diff_release_head_stat.txt`
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt`

## High-Level Delta
`git diff --stat 76ea6840103507856256490cd0e51338ec01b819..HEAD` reports:
- `32170 files changed`
- `1134319 insertions(+)`
- `1211692 deletions(-)`

Proof excerpt:
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/22_diff_tail_and_scan_counts.txt`

## Required Scope Delta Presence
Coverage counts for mandatory scope paths (from precomputed pack evidence):
- `src`: `88`
- `src-tauri`: `83`
- `e2e`: `24`
- `tests`: `1`
- `.github/workflows`: `33`
- `registry`: `6`
- `proof_packs`: `3528`
- `docs`: `26443`

Proof:
- `proof_packs/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/10_diff_required_scope_counts.txt`

## Classification (Current)
- Diff is massive and cross-cutting across all required rings/scopes.
- No release truth is assumed valid at HEAD without requalification.
- Admin/runtime/provider/audio/omega sections require targeted classification in subsequent phases (`04`, `05`, `06`).

Status:
- `G_HEAD_VS_RELEASE_DIFF_CLASSIFIED`: `PARTIAL` (global classification done, component-level Admin truth-chain pending)
