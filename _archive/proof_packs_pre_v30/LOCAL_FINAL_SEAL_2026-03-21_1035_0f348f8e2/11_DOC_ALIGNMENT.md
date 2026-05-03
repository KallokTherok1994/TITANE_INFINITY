# Doc/README/Registry Alignment — Step 8

## README.md version references (grep 28.4|28.5|28.6)
- README.md line 6: **Version:** v28.5.0 (repository authority)
- README.md line 7: **Status:** Production Ready ✅ (release preparation v28.5.0)
- Multiple v28.5.0 references — will be updated post-seal via README bump (out of scope for this seal)

## CHANGELOG.md head -50
- [28.5.0] - 2026-03-21 (Navigation Fusion + Provider + Memory Reliability)
- Circuit breaker fix, LTM persistence, memory injection confirmed

## registry/ contents
autofix-autoheal-rules.jsonl, closure-events.jsonl, canon-events.jsonl,
heavy-artifacts-manifest.jsonl, local-only-historical-residue.jsonl,
REGISTRY_APPEND_TITANE_FINAL.jsonl, REGISTRY_APPEND_TITANE_Ω∞.jsonl,
chat-events.jsonl, chat-mem-phases.jsonl, proofpack-index.jsonl,
repo-events.jsonl, ui-events.jsonl

## registry/repo-events.jsonl tail -3
(last entry: repo-production-005 2026-02-19T03:02:51Z approval)

## Version sources
- src-tauri/tauri.conf.json: "version": "28.6.0" (bumped)
- package.json: "version": "28.6.0" (bumped)
- src-tauri/Cargo.toml: version = "28.6.0" (bumped)
