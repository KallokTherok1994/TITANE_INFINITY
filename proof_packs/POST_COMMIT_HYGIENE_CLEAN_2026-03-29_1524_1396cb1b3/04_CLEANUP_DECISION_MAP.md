# P1.16 — CLEANUP DECISION MAP

## Decision Table

| Action | Target | Command | Risk | Reversible |
|--------|--------|---------|------|------------|
| DELETE | 14 root 0-byte Cline artifacts | `rm -f "B{Restore" "CE[Conversation" "CFG{External" "CREATE[Append" "EMIT[Emit" "Fail" "IPC[IPC]" "LIST[List" "Match" "Mismatch" "No" "Pass" "RESTORE{Restore" "Yes"` | LOW — 0 bytes, no content | Trivial (no content to restore) |
| DELETE | `proof_packs/CL` + 8 siblings | `rm -f proof_packs/CL "proof_packs/CLINE_CAN" ...` | LOW — partial writes, no complete data | None needed |
| DELETE | `proof` + `proof_p` | `rm -f proof proof_p` | LOW — partial writes | None needed |
| GITIGNORE | `.claude/` | Append `.claude/` to `.gitignore` | LOW | `git restore .gitignore` |
| GITIGNORE | `PLANS/` | Append `PLANS/` to `.gitignore` | LOW | `git restore .gitignore` |
| TRACK | `documentation/` | `git add documentation/` | LOW | `git rm -r --cached documentation/` |

---

## Pre-Condition Check

Before executing mutations:

| Check | Status |
|-------|--------|
| All Group A files confirmed 0 bytes | CONFIRMED (ls -la verified) |
| Group B files are partial path strings (not complete dirs) | CONFIRMED (file sizes 899B-2302B, are files not dirs) |
| Group C files are partial writes | CONFIRMED (999B, 1733B) |
| `documentation/` linkage to `sync-docs.sh` confirmed | CONFIRMED |
| `.gitignore` exists and is readable | TO VERIFY |
| HEAD = 1396cb1b3 | CONFIRMED (bootstrap) |

---

## Execution Order

1. DELETE Group A (0-byte artifacts) — no state change, pure cleanup
2. DELETE Group B (partial proof_pack files) — no state change
3. DELETE Group C (proof, proof_p) — no state change
4. GITIGNORE `.claude/` + `PLANS/` — single append to .gitignore
5. TRACK `documentation/` — `git add documentation/`
6. Create `docs/governance/POST_COMMIT_HYGIENE_BOUNDARY_SPEC.md`
7. Append P1.16 to registry
8. Commit all changes

---

## No-Touch List

The following untracked items in the original bootstrap are NOT in scope:
- `docs/governance/` files already committed (tracked in P1.13–P1.15 commits)
- `proof_packs/` complete directories (all tracked/committed already)
- `evals/harness/` — present in git status but already committed (not in `git ls-files --others`)
- `scripts/cleanup-console-log.mjs` — tracked by git status as modified, not untracked
- `scripts/sync-docs.sh` — tracked, not in scope
