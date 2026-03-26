# 16 Rollback

## Rollback Plan

### Binary Change

- **Scope**: TAURI_BINARY_PATH env only — NOT a system-wide binary replacement
- **No system changes made**: `/usr/bin/titane-infinity` was NOT modified
- **Rollback**: N/A — no destructive change made
- **Original state preserved**: stale /usr/bin/titane-infinity still present

### Proof Pack

- **Rollback**: `git revert` the proof pack commit
- **Effect**: removes pack files from repo, does not change source

### AutoHeal Entry

- **Rollback**: remove last line from `scripts/autoheal/autoheal_rules.jsonl`
- **Effect**: removes AH-2026-03-11-0809 entry

### Build Artifacts

- **BUILD ARTIFACTS NOT COMMITTED** — new binary at CARGO_TARGET_DIR is ephemeral
- **Rollback**: delete `/home/titane-os/Documents/GitHub/REPO_CLONE_TEST/TITANE_INFINITY/src-tauri/target/release/titane-infinity`
- **Effect**: system reverts to /usr/bin/titane-infinity (stale) fallback

## Rollback Severity: LOW

Because:
1. No system-wide binary replaced
2. No source code changed
3. No deployment artifacts modified
4. TAURI_BINARY_PATH is session-scoped env var

## Rollback Command (if needed)

```bash
# Remove build artifacts
rm -f /home/titane-os/Documents/GitHub/REPO_CLONE_TEST/TITANE_INFINITY/src-tauri/target/release/titane-infinity

# Revert pack commit
git revert <V16_COMMIT_SHA>
```

## Verdict

ROLLBACK_LOW_RISK — no destructive changes
