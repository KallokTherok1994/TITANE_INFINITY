# 05 Final Contradiction / Gap Matrix

| Issue | Class | Proof | Blocks Scope100 | Blocks Seal | Blocks Main | Blocks Prod Build | Blocks Prod Deploy | Minimal Action |
|---|---|---|---|---|---|---|---|---|
| Canonical contradiction | NO_GAP | `raw/11_*`, `raw/12_*`, `raw/13_*` | No | No | No | No | No | Keep chain frozen |
| Strict-mode script abort | FIXABLE_NOW (resolved) | `raw/46b_*`, `raw/47b_*`, `raw/50_*`, `raw/51_*` | No | No | No | No | No | Keep minimal patch |
| Pre-deployment blocker set | BLOCKED_GATES | `raw/50_pre_deployment_check_postfix2_quick.log` | Yes | Yes | No | Yes | Yes | Resolve blockers and rerun |
| Preprod before-dev path failure | BLOCKED_ENV | `raw/75_before_dev_failure_tail.txt` | Yes | Yes | No | Yes | Yes | Fix wrapper path and rerun |
| Unexpected tracked drift detected during lane (`runtime/stable/manifest.json`, `titane-infinity.desktop`) | CONTRADICTION | `raw/86_final_git_status_short.txt`, `raw/89_unexpected_changes_diff.patch` | Yes | Yes | Yes | Yes | Yes | Ask user whether to keep or revert these changes before any commit/push | Proceed with commit/push without user decision |
| Mermaid root-path alias missing | NON_BLOCKING | `raw/34_mermaid_status_check.log`, `raw/34b_*` | No | No | No | No | No | Use canonical script path |
