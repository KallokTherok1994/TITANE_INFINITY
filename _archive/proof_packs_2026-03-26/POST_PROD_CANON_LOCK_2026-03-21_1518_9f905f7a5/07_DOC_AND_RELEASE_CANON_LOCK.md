# Doc and Release Canon Lock

## Alignment Verification

| Surface | v28.6.0 Reference | Status |
|---------|-------------------|--------|
| root README.md | Version, status, artifacts all v28.6.0 | LOCKED ✅ |
| docs/README.md | Title, badge, version statement all v28.6.0 (patched this session) | LOCKED ✅ |
| CHANGELOG.md | [28.6.0] entry at top | LOCKED ✅ |
| RELEASE_v28.6.0_SEALED.txt | Present, tokens, SHA, gates documented | LOCKED ✅ |
| RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt | SHA256 checksums, BUILD_DATE, GIT_SHA | LOCKED ✅ |
| registry/ui-events.jsonl | PROD_RELEASE v28.6.0 event appended (5bd4a6448) | LOCKED ✅ |
| titane-infinity.desktop | Exec path → v28.6.0 AppImage | LOCKED ✅ |
| PREPROD_LOCAL_FINAL_GATE proof pack | 15 files, committed 54478c390 | LOCKED ✅ |
| OMEGA_RUNTIME_RECERT proof pack | 700f0ba92 — QUALIFIED | LOCKED ✅ |
| POST_PROD_TRUTH_RECONCILIATION pack | d15e2a692 — SEALED | LOCKED ✅ |
| docs/90_release/ | v28.5.0 doc present; no v28.6.0 doc (seal is in root) | PARTIAL — non-blocking |

## Registry Append-Only Integrity
- 512 entries in autoheal_rules.jsonl
- detect_recurrence: G_AH_RECURRENCE_GUARD_PASS
- No destructive rewrites

## Conclusion
All critical doc/release surfaces are locked to v28.6.0.
One partial: docs/90_release/ missing v28.6.0 doc — SHOULD_FIX_NEXT_CYCLE, not blocking.
