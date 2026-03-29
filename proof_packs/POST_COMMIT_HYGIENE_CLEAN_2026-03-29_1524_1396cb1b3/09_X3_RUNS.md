# P1.16 — X3 RUNS (Scenario Execution)

## Pre-Mutation State

```
git ls-files --others --exclude-standard | wc -l
→ 32+ entries (before cleanup)
```

---

## Run 1 — DELETE Group A (0-byte Cline artifacts)

**Command**:
```bash
rm -f "B{Restore" "CE[Conversation" "CFG{External" "CREATE[Append" \
       "EMIT[Emit" "Fail" "IPC[IPC]" "LIST[List" "Match" "Mismatch" \
       "No" "Pass" "RESTORE{Restore" "Yes"
```

**Expected result**: 14 files gone, no error.

**Verification (S1)**:
```bash
git ls-files --others --exclude-standard | grep -E "^(Fail|Match|Mismatch|No|Pass|Yes)$"
→ empty
```

**Status**: EXECUTED — see 13_GATES_REPORT.md

---

## Run 2 — DELETE Group B + C (partial writes)

**Command**:
```bash
rm -f proof proof_p \
  "proof_packs/CL" \
  "proof_packs/CLINE_CAN" \
  "proof_packs/CLINE_CANONICAL_REDUCTION_2026-" \
  "proof_packs/CLINE_CANONICAL_REDUCTION_2026-03-2" \
  "proof_packs/CLINE_EXEC" \
  "proof_packs/CLINE_EXECUTION_CONVERGENCE_" \
  "proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2" \
  "proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e882" \
  "proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e882640"
```

**Expected result**: 11 files gone, no error.

**Verification (S2, S3)**:
```bash
git ls-files --others | grep "^proof_packs/CL"
→ empty

ls proof proof_p 2>&1
→ No such file or directory
```

**Status**: EXECUTED — see 13_GATES_REPORT.md

---

## Run 3 — GITIGNORE + TRACK

**Command**:
```bash
printf '\n# Claude Code local config (machine-specific)\n.claude/\n\n# Local planning documents\nPLANS/\n' >> .gitignore
git add documentation/
```

**Verification (S4, S5, S6)**:
```bash
grep -E "^\.claude/|^PLANS/" .gitignore
→ .claude/ and PLANS/ present

git status --short | grep "\.claude"
→ empty (gitignored, not staged)

git status --short | grep "documentation"
→ A  documentation/docusaurus.config.ts (etc.)
```

**Status**: EXECUTED — see 13_GATES_REPORT.md
