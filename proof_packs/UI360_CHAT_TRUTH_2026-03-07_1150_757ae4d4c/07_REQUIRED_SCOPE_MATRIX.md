# 07_REQUIRED_SCOPE_MATRIX

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R2+R3+R4 required critical paths
C) RISK: P0
D) PLAN: execute baseline authority x3 -> classify each required gate
E) PROOFS: `09_BASELINE_RUN_X3.log`, `12_REVALIDATION_X3.log`, `12D_REVALIDATION_TIMEOUTFIX_CLEAN_X3.log`, `12E_FULL_RUNTIME_VALIDATION.log`, `12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log`, `15_GATES_REPORT.md`
F) ROLLBACK: `git restore -- proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/07_REQUIRED_SCOPE_MATRIX.md`

| Scope | Current Status | Proof Level | Priority |
|---|---|---|---|
| App boot | PASS | PROVEN_RUNTIME | REQUIRED |
| Main navigation | PASS | PROVEN_RUNTIME | REQUIRED |
| Route reachability | PASS | PROVEN_RUNTIME | REQUIRED |
| Main module hub (`/titane`) | PASS | PROVEN_RUNTIME | REQUIRED |
| Chat render | PASS | PROVEN_RUNTIME | REQUIRED |
| Provider selector behavior | PASS | PROVEN_RUNTIME | REQUIRED |
| Send flow | PASS | PROVEN_RUNTIME | REQUIRED |
| Response or streaming path | PASS | PROVEN_RUNTIME | REQUIRED |
| Error honesty | PASS | PROVEN_RUNTIME | REQUIRED |
| Retry/regenerate if present | PASS | PROVEN_RUNTIME | REQUIRED |
| History/session restore | PASS | PROVEN_RUNTIME | REQUIRED |
| Memory indicators/actions | PASS | PROVEN_RUNTIME | REQUIRED |
| Backend/frontend truth (critical controls) | PASS | PROVEN_RUNTIME | REQUIRED |
| UI no direct web/network | PASS | PROVEN_STATIC_ONLY | REQUIRED |
| No silent fallback | PASS | PROVEN_RUNTIME | REQUIRED |
| No fake-green | PASS | PROVEN_RUNTIME | REQUIRED |

## Matrix Verdict
- Required-scope deterministic smoke qualification: `PASS`
- Evidence: `12D_REVALIDATION_TIMEOUTFIX_CLEAN_X3.log` (`3/3 PASS`).
- Extended required evidence: `12E_FULL_RUNTIME_VALIDATION.log` (full desktop runtime pass with provider/error-path/history markers).
- Targeted closure evidence: `12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log` (retry action marker, memory tab markers, provider selector marker, full spec PASS).
- Broader required-scope completeness: `PASS` (all required controls classified as proven runtime/static).
