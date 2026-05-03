Status: PASS

Contradiction matrix:

1) doc vs runtime
- Issue: `check_autofix_autoheal_registry` failed while prior narratives implied healthy governance continuity.
- Evidence: runtime FAIL message `Last fix has no corresponding new AutoFix/AutoHeal rule entry`.
- Status: RESOLVED.
- Resolution: append-only entries `AH-2026-03-07-0084` and `AH-0020`.

2) doc vs doc
- Issue: multiple historical packs contain competing final claims (`SEALED`, `PASS`, old counters).
- Evidence: inventory scans across `proof_packs/**` and `docs/archive/**`.
- Status: NEEDS_NORMALIZATION.
- Handling: constrained to scoped pack; historical claims left archived.

3) map vs repo reality
- Issue: many map/index files claim broad completeness at different timestamps.
- Evidence: `raw/canon_docs_map_mermaid_refs.txt` (254 references).
- Status: OPEN (contained).
- Handling: declare this pack maps as scoped canon for this session only.

4) registry vs fix history
- Issue: latest signature.paths did not include active tracked files.
- Evidence: validator FAIL before patchset 2.
- Status: RESOLVED.

5) mermaid vs canonical state
- Issue: risk of regenerating diagrams without canon need.
- Evidence: mermaid validators already PASS.
- Status: RESOLVED (KEEP/NORMALIZE only; no diagram rewrite).

6) instructions vs validators
- Issue: potential drift between instruction doctrine and scripts.
- Evidence: `verify_instructions.sh` summary PASS=20 FAIL=0.
- Status: RESOLVED.

7) progress claims vs completed steps
- Issue: risk of over-claiming full repo convergence in dirty workspace.
- Evidence: `git_status_sb.txt` shows active tracked/untracked changes.
- Status: RESOLVED by scoped wording.

8) seal claims vs missing artifacts
- Issue: workspace not clean; global seal would be inflated.
- Evidence: dirty tracked files outside this pack.
- Status: RESOLVED as `SEAL_ELIGIBILITY: NOT_ELIGIBLE`.

9) archived status vs active references
- Issue: archived docs still referenced by grep scans.
- Evidence: many hits under `docs/archive/**`, `proof_packs/**`.
- Status: OPEN (contained; non-blocking for scoped verdict).

10) duplicate final verdicts
- Issue: multiple historical `VERDICT.md` exist.
- Evidence: inventory over `proof_packs/**`.
- Status: NEEDS_NORMALIZATION (contained by local canon declaration).
