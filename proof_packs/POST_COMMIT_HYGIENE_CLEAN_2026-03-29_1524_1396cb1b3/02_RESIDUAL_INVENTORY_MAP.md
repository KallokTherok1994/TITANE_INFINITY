# P1.16 — RESIDUAL INVENTORY MAP

## Source: `git ls-files --others --exclude-standard`

### Group A — 0-byte Cline flow node artifacts (root dir)

| File | Size | Created | Origin |
|------|------|---------|--------|
| `B{Restore` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `CE[Conversation` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `CFG{External` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `CREATE[Append` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `EMIT[Emit` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `Fail` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `IPC[IPC]` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `LIST[List` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `Match` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `Mismatch` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `No` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `Pass` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `RESTORE{Restore` | 0B | 2026-03-28 17:29 | Cline flow node truncation |
| `Yes` | 0B | 2026-03-28 17:29 | Cline flow node truncation |

**Count**: 14 files | **Total size**: 0 bytes

### Group B — Partial Cline write artifacts (proof_packs/)

| File | Size | Origin |
|------|------|--------|
| `proof_packs/CL` | 1412B | Partial Cline write — truncated proof_pack dir name |
| `proof_packs/CLINE_CAN` | 2302B | Partial Cline write |
| `proof_packs/CLINE_CANONICAL_REDUCTION_2026-` | 943B | Partial Cline write |
| `proof_packs/CLINE_CANONICAL_REDUCTION_2026-03-2` | 1808B | Partial Cline write |
| `proof_packs/CLINE_EXEC` | 1080B | Partial Cline write |
| `proof_packs/CLINE_EXECUTION_CONVERGENCE_` | 1324B | Partial Cline write |
| `proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2` | 1043B | Partial Cline write |
| `proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e882` | 2184B | Partial Cline write |
| `proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e882640` | 899B | Partial Cline write |

**Count**: 9 files | **Total size**: ~12.9 kB

### Group C — Partial proof session writes (root dir)

| File | Size | Origin |
|------|------|--------|
| `proof` | 999B | Partial Cline write — truncated proof_pack path |
| `proof_p` | 1733B | Partial Cline write — truncated proof_pack path |

**Count**: 2 files | **Total size**: ~2.7 kB

### Group D — Local-only tool config (.claude/)

| File | Size | Decision |
|------|------|----------|
| `.claude/settings.json` | ~500B | GITIGNORE — Claude Code local config, not repo-owned |
| `.claude/settings.local.json` | ~200B | GITIGNORE — Claude Code local config, not repo-owned |

**Count**: 2 files | **Commit-eligible**: NO

### Group E — Internal planning (PLANS/)

| File | Size | Decision |
|------|------|----------|
| `PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md` | ~4kB | GITIGNORE — local planning doc, not product |

**Count**: 1 file | **Commit-eligible**: NO

### Group F — Docusaurus scaffold (documentation/)

| File | Size | Decision |
|------|------|----------|
| `documentation/docusaurus.config.ts` | ~2kB | TRACK — linked to scripts/sync-docs.sh |
| `documentation/package.json` | ~800B | TRACK — Docusaurus deps |
| `documentation/sidebars.ts` | ~400B | TRACK — sidebar config |

**Count**: 3 files | **Commit-eligible**: YES

### Group G — Already gitignored

| File | Rule | Status |
|------|------|--------|
| `memory-optimization.log` | `*.log` | Already covered ✓ |

---

## Summary Totals

| Group | Count | Action |
|-------|-------|--------|
| A — 0-byte Cline artifacts (root) | 14 | DELETE |
| B — Partial Cline writes (proof_packs/) | 9 | DELETE |
| C — Partial proof session writes | 2 | DELETE |
| D — Claude Code config | 2 | GITIGNORE |
| E — Local planning | 1 | GITIGNORE |
| F — Docusaurus scaffold | 3 | TRACK (git add) |
| G — Gitignored | 1 | NO-OP |
| **TOTAL** | **32** | |
