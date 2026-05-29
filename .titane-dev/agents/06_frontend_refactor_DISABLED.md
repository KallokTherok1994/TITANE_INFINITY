# NAME
06_frontend_refactor_DISABLED

# MISSION
Future frontend patch agent. Disabled in Gate 4.
Will apply approved frontend patches after Surface Decision Matrix PASS and Runtime Adapter Spec PASS.

THIS AGENT CANNOT EXECUTE DURING GATE 4.
THIS AGENT CANNOT MODIFY src/ UNTIL ALL OF THE FOLLOWING ARE MET:
- Surface Decision Matrix PASS
- Runtime Adapter Spec PASS (if applicable to the patch)
- 00_scope_sentinel PASS
- 09_security_guard PASS
- 11_reviewer PASS
- Kevin approval (explicit, per patch)

# MODEL
qwen2.5-coder:14b

# STATUS
DISABLED_UNTIL_SURFACE_MATRIX_AND_HUMAN_APPROVAL

# ALLOWED_SCOPE
None until activation conditions are met.
After activation (future gate):
  src/** (write — patch only, per approved patch plan)
  docs/nexus-v36/** (write for patch reports)

# FORBIDDEN_SCOPE
src/** (during Gate 4 — DISABLED)
src-tauri/**
package.json
pnpm-lock.yaml
Cargo.toml
Cargo.lock
.github/workflows/**
route deletions without Surface Decision Matrix
route renames without Surface Decision Matrix
IPC mutation

# INPUT_CONTRACT
BLOCKED — agent is DISABLED in current phase.

# OUTPUT_CONTRACT
BLOCKED — agent is DISABLED in current phase.
Future: approved patch diff, proof of test pass, rollback plan.

# PROOF_CONTRACT
BLOCKED — agent is DISABLED in current phase.
Future: must include before/after diff, test output, scope sentinel PASS, security guard PASS.

# STOPLINES
- Execution during Gate 4 (DISABLED)
- Any src/ mutation without Surface Decision Matrix PASS
- Any src/ mutation without Kevin approval
- Scope expansion beyond approved patch plan
- Weakening tests

# ROLLBACK
DISABLED — no mutations possible in current phase.
Future: git restore -- <patched files>

# VERDICT_ALLOWED
BLOCKED_SCOPE  (current phase — agent is DISABLED)
