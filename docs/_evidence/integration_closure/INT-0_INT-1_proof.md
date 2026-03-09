# INT-0 / INT-1 Integration Proof

**Session:** integration_closure_kernel_cert_20260309  
**Date:** 2026-03-09  
**Operator:** GitHub Copilot Agent (governed)

---

## INT-0 — Bootstrap & Lane Truth

| Check | Result |
|-------|--------|
| Branch | `copilot/integrate-commit-for-main` |
| HEAD | `1bf1df8` |
| worktree | clean (single worktree) |
| AutoHeal entries | 144 (last: AH-2026-03-08-0093) |
| verify_instructions | PASS=20 FAIL=0 |
| detect_recurrence | PASS |
| `repro-build-closure` branch | NOT FOUND (scope: lane-only proof, not yet merged to MAIN) |

**Verdict INT-0:** PASS (bootstrap truth established, no false green)

---

## INT-1 — Commit Inventory & Scope Qualification

### Commits Authorized for Integration

| Commit | Description | Status |
|--------|-------------|--------|
| ce13df7f2 | fix(g6): harden reproducibility hash normalization | APPLIED (equivalent patch) |
| 3fa807139 | chore(proof): remove temporary binary probes | APPLIED (no binary probes found — clean state confirmed) |
| 1278f4487 | docs(closure): finalize INT-0/INT-1 integration proof + INT-2 kernel readiness | APPLIED (this document) |

**Note:** Commits were not present in cloned history (shallow repo). Equivalent changes applied per commit description. No product code modified outside authorized scope.

### Scope Impact Assessment

| Area | Change | Ring Impact |
|------|--------|-------------|
| `scripts/gates/g6-build-reproducibility.sh` | Harden `normalize_binary_for_hash`: add `--strip-unneeded`, `objcopy --remove-section=.note.gnu.build-id`, llvm-objcopy fallback | R3 (gates/scripts) — no R1/R2/R4 impact |
| Binary probe cleanup | No binary probes found — confirmed clean | No files changed |
| Docs | This document + INT-2 kernel cert proof pack | R3 (docs/proof) |

### Ring/Network/Allowlist Impact

- No Tauri capability changes
- No network allowlist changes
- No IPC contract changes
- No Ring 1/Ring 2 I/O introduced

**Verdict INT-1:** PASS

---

## Rollback

```
git restore -- scripts/gates/g6-build-reproducibility.sh
git restore -- docs/_evidence/integration_closure/
```
