# P1.16 — ALIGNMENT / FIXES

## Product: NO_CHANGES

**LANE B does not touch product code.** All mutations are in:
- Filesystem (delete garbage files)
- `.gitignore` (add two patterns)
- `documentation/` staging (git add)
- `docs/governance/` (new spec doc)
- `registry/proofpack-index.jsonl` (append)

---

## `.gitignore` Update Required

**Current state**: `.claude/` and `PLANS/` are not in `.gitignore`.

**Required append**:
```
# Claude Code local config (machine-specific)
.claude/

# Local planning documents (not product deliverables)
PLANS/
```

**Verification after append**:
```bash
grep -E "^\.claude/|^PLANS/" .gitignore
# Expected: .claude/ and PLANS/ both present
```

---

## `documentation/` Track Required

**Current state**: `documentation/` is untracked (3 scaffold files).

**Required action**: `git add documentation/`

**Verification**: `git status --short | grep "^A  documentation"` → non-empty

---

## Governance Spec to Create

**File**: `docs/governance/POST_COMMIT_HYGIENE_BOUNDARY_SPEC.md`

**Content**: Local-only boundary definitions for `.claude/` and `PLANS/`, canonical reference for future hygiene decisions.

---

## No Autoheal Rules Needed

The garbage artifacts are tool-generated ephemera — no recurring pattern that warrants an autoheal rule. The boundary spec (`.gitignore`) is sufficient prevention.
