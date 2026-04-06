# POST-COMMIT HYGIENE BOUNDARY SPEC

**Canonical reference for local-only boundaries in TITANE∞**

| Field | Value |
|-------|-------|
| Established | P1.16 — 2026-03-29 |
| HEAD at creation | 1396cb1b3 |
| Proof pack | proof_packs/POST_COMMIT_HYGIENE_CLEAN_2026-03-29_1524_1396cb1b3/ |

---

## Local-Only Boundaries

### `.claude/`

| Property | Value |
|----------|-------|
| Contents | `settings.json`, `settings.local.json` |
| Owner | Claude Code extension (machine-specific) |
| Commit-eligible | **NO** |
| Gitignore rule | `.claude/` |
| Reason | Per-machine AI assistant config. Different developers have different Claude Code settings. Committing these would cause unwanted override of other developers' local configs. |

### `PLANS/`

| Property | Value |
|----------|-------|
| Contents | Local planning markdown docs (e.g., `PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md`) |
| Owner | Individual developer |
| Commit-eligible | **NO** |
| Gitignore rule | `PLANS/` |
| Reason | Developer-local planning notes. These are scratch pads and evolving plans — not canonical product deliverables. Canonical plans and decisions are documented in `docs/governance/`. |

---

## Intentional Tracked Scaffolds

### `documentation/`

| Property | Value |
|----------|-------|
| Contents | `docusaurus.config.ts`, `package.json` (`titane-infinity-docs`), `sidebars.ts` |
| Owner | Product (documentation pipeline) |
| Commit-eligible | **YES** |
| Linked script | `scripts/sync-docs.sh` |
| Reason | Docusaurus documentation site source tree. Required by the build pipeline. Must be tracked in git. |

---

## Garbage Artifact Classification

Cline AI extension may leave 0-byte flow node artifacts and partial-write files in the repo root or under `proof_packs/`. These are NEVER product files.

**Detection**:
```bash
# 0-byte files in root:
git ls-files --others --exclude-standard | xargs -I{} ls -la {} 2>/dev/null | grep " 0 "

# Partial proof_pack writes (flat files under proof_packs/):
git ls-files --others | grep "^proof_packs/" | while read f; do [ -f "$f" ] && echo "$f"; done
```

**Action**: `rm -f` — no recovery needed, no content exists.

---

## Enforcement

These boundaries are enforced by `.gitignore` rules (for LOCAL_ONLY items) and by the post-commit hygiene protocol (for garbage artifacts). Future hygiene audits should reference this spec.
