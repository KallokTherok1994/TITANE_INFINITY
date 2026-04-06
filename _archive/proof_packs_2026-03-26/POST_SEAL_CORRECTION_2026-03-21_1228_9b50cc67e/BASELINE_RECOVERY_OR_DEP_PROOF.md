# BASELINE RECOVERY OR DEP PROOF
## Proof Pack: POST_SEAL_CORRECTION_2026-03-21_1228_9b50cc67e

---

## Decision: DEP_PROOF (no restore needed)

### Rationale
The three dirty files were already committed as `9b50cc67e` (patch/minor dep update).
No restore was required. The baseline is the new HEAD.

### Proof of Safe Baseline

**A) Working tree clean:**
```
$ git status
rien à valider, la copie de travail est propre
```

**B) HEAD verified:**
```
$ git rev-parse --short HEAD
9b50cc67e
```

**C) Gates from dep update commit (verbatim from commit message):**
```
Gates: tsc PASS (0 errors) | vitest 229 files / 3384 tests PASS
```

**D) Current session vitest run (post-correction, includes new tests):**
```
Test Files: 231 passed (231)
Tests:      3399 passed (3399)
Duration:   130.97s
Exit code:  0
```

**E) Rust test suite:**
```
running 10 tests — ok. 10 passed; 0 failed; 0 ignored
running 3 tests  — ok. 3 passed; 0 failed; 0 ignored
running 10 tests — ok. 10 passed; 0 failed; 0 ignored
running 17 tests — ok. 3 passed; 0 failed; 14 ignored
Exit code: 0
```

**F) verify_instructions.sh:**
```
SUMMARY: PASS=20 FAIL=0
```

**G) detect_recurrence.sh:**
```
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=505
```

### Rollback Command (if needed)
```bash
git reset --hard ed231b636  # revert to pre-dep-update sealed HEAD v28.5.0
```

### Baseline Status
`PROVEN` — 3399/3399 tests pass, working tree clean, no breaking changes introduced.
