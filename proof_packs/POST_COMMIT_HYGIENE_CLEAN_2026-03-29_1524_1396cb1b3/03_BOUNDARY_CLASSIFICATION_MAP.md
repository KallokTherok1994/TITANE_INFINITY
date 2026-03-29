# P1.16 — BOUNDARY CLASSIFICATION MAP

## Classification Axes

For each residual, two axes determine the action:
1. **Origin**: tool artifact vs. intentional vs. local-only
2. **Product linkage**: is the file referenced by product code or scripts?

---

## Full Classification Table

| File / Group | Origin | Product-linked | Category | Verdict |
|---|---|---|---|---|
| `B{Restore` (+ 13 siblings) | Cline flow node truncation | NO | GARBAGE | DELETE |
| `proof_packs/CL` (+ 8 siblings) | Cline partial write | NO | GARBAGE | DELETE |
| `proof` | Cline partial write | NO | GARBAGE | DELETE |
| `proof_p` | Cline partial write | NO | GARBAGE | DELETE |
| `.claude/settings.json` | Claude Code tool config | NO | LOCAL_ONLY | GITIGNORE |
| `.claude/settings.local.json` | Claude Code tool config | NO | LOCAL_ONLY | GITIGNORE |
| `PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md` | Local planning | NO | LOCAL_ONLY | GITIGNORE |
| `documentation/docusaurus.config.ts` | Intentional scaffold | YES — `scripts/sync-docs.sh` | INTENTIONAL_SCAFFOLD | TRACK |
| `documentation/package.json` | Intentional scaffold | YES — `scripts/sync-docs.sh` | INTENTIONAL_SCAFFOLD | TRACK |
| `documentation/sidebars.ts` | Intentional scaffold | YES — `scripts/sync-docs.sh` | INTENTIONAL_SCAFFOLD | TRACK |

---

## Boundary Definitions

### GARBAGE
- Files that carry no information value
- Zero-byte or partial-write artifacts from Cline tool execution failures
- No recovery possible (incomplete paths/names)
- Safe to delete without any rollback concern

### LOCAL_ONLY
- Files that are machine-specific or tool-specific
- Should never be committed to the shared repo
- Must be added to `.gitignore` to prevent accidental future commits

### INTENTIONAL_SCAFFOLD
- Files deliberately created for a specific documented purpose
- Linked to a tracked script (`sync-docs.sh`)
- Must be tracked in git to be functional for other developers

---

## Linkage Evidence: documentation/ → sync-docs.sh

```bash
# scripts/sync-docs.sh (key lines)
# Builds the Docusaurus documentation site in documentation/
# Requires: documentation/package.json, documentation/docusaurus.config.ts
# Output: documentation/build/
```

The `documentation/` directory is the source tree for the Docusaurus build pipeline.
`documentation/package.json` declares `"name": "titane-infinity-docs"` — intentional.

---

## Boundary Spec Status

| Boundary | Documented | Location |
|----------|------------|----------|
| `.claude/` — Claude Code config | This proof pack | `docs/governance/POST_COMMIT_HYGIENE_BOUNDARY_SPEC.md` (to create) |
| `PLANS/` — Local planning | This proof pack | `docs/governance/POST_COMMIT_HYGIENE_BOUNDARY_SPEC.md` (to create) |
| `documentation/` — Docusaurus scaffold | `sync-docs.sh` comments + this proof pack | Tracked ✓ |
