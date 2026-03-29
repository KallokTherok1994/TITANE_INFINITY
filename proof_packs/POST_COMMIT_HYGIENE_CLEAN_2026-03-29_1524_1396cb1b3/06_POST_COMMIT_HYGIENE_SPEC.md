# P1.16 — POST-COMMIT HYGIENE SPEC

## Scope

This spec defines the worktree hygiene contract for TITANE∞ post-commit state.

---

## 1. Garbage Artifact Contract

**Rule**: Any 0-byte file or partial-path file at repo root or in `proof_packs/` that is not a known product file is classified as GARBAGE and must be deleted.

**Origin**: Cline AI extension creates these files as flow node artifacts when a write operation is interrupted or malformed.

**Detection**: `git ls-files --others --exclude-standard | xargs ls -la | grep " 0 "`

**Action**: `rm -f` — no staging, no commit needed (files were never tracked).

---

## 2. Local-Only Boundary Contract

**Rule**: Tool configs and local planning documents must never be committed to the shared repository.

| Pattern | Owner | Reason |
|---------|-------|--------|
| `.claude/` | Claude Code extension | Machine-specific AI assistant config |
| `PLANS/` | Developer | Local planning docs, not product deliverables |

**Enforcement**: These patterns must appear in `.gitignore`.

---

## 3. Documentation Scaffold Contract

**Rule**: The `documentation/` directory is the source tree for the Docusaurus documentation site, linked to `scripts/sync-docs.sh`. It must be tracked in git.

**Package identity**: `documentation/package.json` → `"name": "titane-infinity-docs"`

**Build pipeline**: `scripts/sync-docs.sh` → `documentation/` → `documentation/build/`

**Tracking**: `git add documentation/` — scaffold files are product artifacts.

---

## 4. Registry Contract

**Rule**: Every proof pack must be registered in `registry/proofpack-index.jsonl` before its proof pack commit.

**Format**: One JSONL entry per proof pack, with fields: `id`, `date`, `head`, `scope`, `verdict`, `path`.

---

## 5. Proof Pack Hygiene

**Rule**: Partial proof pack writes (truncated directory names or partial content files) are garbage.

**Detection**: `git ls-files --others | grep -E "^proof_packs/[A-Z]" | xargs ls -la | grep -v "^d"`

Files that are flat files (not directories) under `proof_packs/` with names that look like truncated proof pack paths are partial writes and must be deleted.

---

## Applicability

This spec applies at HEAD = 1396cb1b3 and forward. It is the canonical reference for post-commit worktree hygiene decisions.
