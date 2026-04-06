# Patchset Summary

<!-- APPEND-ONLY: Add new entries below with ## timestamp header -->

## Template — Fill in per session

**Session ID:** `{{SESSION_ID}}`  
**Date:** `{{DATE_UTC}}`  
**Scope:** `{{SCOPE}}`  
**Ring(s) impacted:** `{{RINGS}}`  
**Status:** `EXPERIMENTAL | QUALIFIED | STABLE`

### Patches Applied

| #   | Description | File(s)    | Ring     | Test proof  |
| --- | ----------- | ---------- | -------- | ----------- |
| 1   | `{{DESC}}`  | `{{FILE}}` | `Ring N` | `{{PROOF}}` |

### Invariants verified

- [ ] I1 Tauri-only
- [ ] I2 Online-first governed (UI => no direct network)
- [ ] I3 4-Ring strict
- [ ] I4 Allowlist deny-by-default
- [ ] I5 Build x3 proof
- [ ] I6 Tests x3, no skips
- [ ] I7 Zero silence
- [ ] I8 Proof pack append-only
- [ ] I9 Rollback documented

---

<!-- Append new entries above this line -->
