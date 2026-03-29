# P1.16 — PROOF SCENARIOS

## Scenario Map

| # | Scenario | Expected | Proof Method |
|---|----------|----------|--------------|
| S1 | 0-byte Cline artifacts deleted | `git ls-files --others` no longer shows them | `git ls-files --others --exclude-standard \| grep -E "^(B\{|CE\[|CFG\{|CREATE\[|EMIT\[|Fail|IPC\[|LIST\[|Match|Mismatch|No|Pass|RESTORE\{|Yes)"` → empty |
| S2 | Partial proof_pack files deleted | No flat files named `proof_packs/CL*` or `proof_packs/CLINE_*` | `git ls-files --others \| grep "^proof_packs/CL"` → empty |
| S3 | Partial root writes deleted | `proof` and `proof_p` absent | `ls proof proof_p 2>&1` → "No such file" |
| S4 | `.gitignore` updated | `.claude/` and `PLANS/` present in `.gitignore` | `grep -E "^\.claude/|^PLANS/" .gitignore` → matches |
| S5 | `.claude/` not staged | `.claude/` not in `git status` after gitignore update | `git status --short \| grep "\.claude"` → empty |
| S6 | `documentation/` staged | `documentation/` shows as staged in git | `git status --short \| grep "documentation"` → `A  documentation/...` |
| S7 | `git diff HEAD` clean on product files | No product regressions | `git diff HEAD -- src-tauri/ src/` → empty |
| S8 | Registry entry appended | P1.16 entry in last line of proofpack-index.jsonl | `tail -1 registry/proofpack-index.jsonl \| grep "POST_COMMIT_HYGIENE_CLEAN"` → match |

---

## Success Criteria

All 8 scenarios must pass for verdict = GARBAGE_ARTIFACTS_CLEANED.

If any scenario fails, the verdict is BLOCKED_CLEANUP and the failure scenario is cited.

---

## Non-Scenarios (Explicitly Out of Scope)

- External sync live proof — BLOCKED_ENV (P1.15 chain closed)
- Product code correctness — proven in P1.12/P1.13 chain
- LTM runtime — proven in P1.13d
- Provider runtime — proven in P1.11 chain
