# P10.2 Restore - Scope

**Mode**: CONSTITUTIONAL / PROOF-DRIVEN / STOP-THE-LINE

**Objective**: Restore missing P10.2 proof pack files from git HEAD, prove correctness, seal recovery.

**Scope**:
- Restore tracked files EXACTLY as committed (no reconstruction)
- Prove restore correctness (file list, hashes)
- Document restore process (command-by-command)
- Seal restore proof pack (doc-only)
- Append registry entry

**Authorized Operations**:
- git restore / git checkout (read-only recovery of tracked files)
- Verification commands (stat, find, sha256sum)
- Proof pack creation and documentation
- Registry append

**Forbidden**:
- Any modifications to src/**, src-tauri/**, tauri.conf.json, allowlist
- pnpm-lock.yaml changes
- Unnecessary builds or runtime tests during restore phase

**Stop-the-Line Conditions**:
- Any tracked file changed outside restoration path
- pnpm-lock.yaml modified
- Unexpected file changes detected
- Restore command fails

---

**UTC Start**: 2026-02-18T12:44:58+00:00
**Restore Pack**: P10_2_RESTORE_FROM_GIT_20260218_124458
**Linked Recovery**: P10.R_PROOF_PACK_RECOVERY_20260218_122138
