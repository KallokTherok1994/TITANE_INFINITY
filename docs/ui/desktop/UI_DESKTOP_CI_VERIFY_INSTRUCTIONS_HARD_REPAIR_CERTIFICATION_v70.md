# UI_DESKTOP_CI_VERIFY_INSTRUCTIONS_HARD_REPAIR_CERTIFICATION_v70

TITANE UI_DESKTOP_CI_VERIFY_INSTRUCTIONS_HARD_REPAIR_v70
- Execution mode: DURABLE
- Branch: MAIN
- HEAD before: 61e197ecc6fefd0d26ba0bd3ff8d6bd91591662e
- HEAD after: 7eebc018f350c3378f6eac3fe6d53c7a1644236a
- Remote HEAD: 7eebc018f350c3378f6eac3fe6d53c7a1644236a
- Ahead/behind: 0/0
- Failed CI runs: 25640906760, 25641083408, 25641251992, 25641278346
- Failed gates: G_VSCODE_AGENT_WORKFLOW_PASS, G_OLLAMA_BOUNDARY_PASS
- Root cause: CI/local parity gap at Verify Copilot Instructions with missing workflow preflight wiring and hidden sub-validator diagnostics in CI logs
- Workflow preflight: ADDED (step "CI environment preflight for instruction validators" runs `bash scripts/verify/ci-env-preflight.sh` before verify_instructions)
- Subgate diagnostics: ADDED (`run_subgate` helper in scripts/verify_instructions.sh with CI-bounded diagnostics output)
- Validator repairs: `scripts/verify/verify-ollama-copilot-boundary.sh` migrated from direct `rg` to `_rg_compat` shim (`rg_has`) to keep static policy checks CI-portable without weakening intent
- Local validators: PASS (`ci-env-preflight`, `verify-vscode-agent-workflow`, `verify-ollama-copilot-boundary`, `verify_instructions`) in normal and `CI=true GITHUB_ACTIONS=true` modes
- Full local gates: PASS (J1-J13 completed; `verify_instructions` PASS=52 FAIL=0)
- Docs corrected: v69 closure and strategic docs now explicitly state remote CI failure pending parity closure
- AutoHeal: 4 entries appended and validated (AH-v70-CI-VERIFY-INSTRUCTIONS-PARITY-HARD-REPAIR-2026, AH-v70-VSCODE-AGENT-WORKFLOW-STATIC-CI-SAFE-2026, AH-v70-OLLAMA-BOUNDARY-STATIC-CI-SAFE-2026, AH-v70-SUBGATE-DIAGNOSTIC-OUTPUT-2026)
- New CI run: 25641606396
- New CI status: success
- Blockers: None
- Final verdict: UI_DESKTOP_CI_VERIFY_INSTRUCTIONS_HARD_REPAIR_CI_GREEN
