# GATE REPORT

VERDICT: PASS

## Product proof

`runTests` targeted slice:

`<summary passed=12 failed=0 />`

`pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`:

`[a11y:titane-conversation] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:admin-system] blocking=1 (c=0 s=1 m=0 mn=0)`
`[a11y:dev-overview] blocking=2 (c=0 s=2 m=0 mn=0)`
`[a11y:time] blocking=1 (c=0 s=1 m=0 mn=0)`
`[a11y:monitoring] blocking=2 (c=0 s=2 m=0 mn=0)`
`[a11y:dashboard] blocking=0 (c=0 s=0 m=0 mn=0)`
`[a11y:memory] blocking=3 (c=1 s=2 m=0 mn=0)`
`[a11y:governance-center] blocking=1 (c=0 s=1 m=0 mn=0)`
`[a11y:orchestration-center] blocking=1 (c=0 s=1 m=0 mn=0)`
`[a11y:research] blocking=1 (c=0 s=1 m=0 mn=0)`
`[a11y:aggregate] blocking=12 baseline=30`
`12 passed (48.4s)`

## Governance gates

`pnpm verify:registry`:

`Changed files: 14`
`No watched files changed - registry sync not required`
`registry-integrity: PASS`
`registry-quality: PASS`

`bash scripts/autoheal/detect_recurrence.sh`:

`PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
`PASS: G_AH_RECURRENCE_GUARD_PASS`
`INFO: entries=1968`

`bash scripts/verify_instructions.sh`:

`PASS: G_DOC_COPILOT_INSTRUCTIONS_PRESENT`
`PASS: G_DOC_WORKFLOW_PRESENT`
`PASS: G_DOC_CHECKLIST_PRESENT`
`PASS: G_DEVSAFE_CANONICAL_LAUNCHER_EXISTS`
`PASS: G_DEVSAFE_CHECKLIST_REFERENCES_LAUNCHER`
`PASS: G_DEVSAFE_CHECKLIST_NODE_REQUIREMENT_VISIBLE`
`PASS: G_FRONTMATTER_docs-registry.instructions.md`
`PASS: G_FRONTMATTER_frontend.instructions.md`
`PASS: G_FRONTMATTER_hybrid-memory-dispatch.instructions.md`
`PASS: G_FRONTMATTER_tauri.instructions.md`
`PASS: G_FRONTMATTER_temporal-modules.instructions.md`
`PASS: G_FRONTMATTER_tests-e2e.instructions.md`
`PASS: G_FRONTMATTER_titane.instructions.md`
`PASS: G_MERMAID_SYNTAX_MIN`
`PASS: G_AUTOHEAL_FILE_README.md`
`PASS: G_AUTOHEAL_FILE_autoheal_rules.jsonl`
`PASS: G_AUTOHEAL_FILE_apply_autoheal.sh`
`PASS: G_AUTOHEAL_FILE_detect_recurrence.sh`
`INFO: autoheal-jsonl-valid`
`PASS: G_AUTOHEAL_JSONL_VALID`
`PASS: G_MARKER_VERDICT_UNIQUE`
`PASS: G_MARKER_STOPLINE`
`PASS: G_MARKER_NO_SKIPS`
`PASS: G_MARKER_PROOF_PACK`
`PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH`
`PASS: G_RULE11_NO_TOKEN_GATE`
`PASS: G_RULE14_BUILD_ALL_PRESENT`
`PASS: G_RULE15_MAPPING_OBLIGATION_PRESENT`
`PASS: G_RULE16_TEST_MATRIX_PRESENT`
`PASS: G_RULE15_FAIL_ON_MISSING_MAPPING`
`PASS: G_RULE16_BLOCKED_WITHOUT_TESTS`
`PASS: G_ADVANCED_AGENTS_AUDIT_SCRIPT_PRESENT`
`PASS: G_VSCODE_AGENT_WORKFLOW_SCRIPT_PRESENT`
`PASS: G_LOG_ANALYSIS_REPORT_SCRIPT_PRESENT`
`PASS: G_LOG_ANALYSIS_REPORT_AUDIT_PASS`
`PASS: G_REGLE_CRITIQUE_ARCHIVED`
`PASS: G_AH_RECURRENCE_GUARD_PASS`
`PASS: G_PROMPT_FRONTMATTER_PASS`
`PASS: G_VSCODE_AGENT_WORKFLOW_PASS`
`PASS: G_KERNEL_BUDGET_PASS`
`PASS: G_INSTRUCTION_LAYERS_PASS`
`PASS: G_NO_DOCTRINE_DUPLICATION_PASS`
`PASS: G_STATUS_VOCAB_PASS`
`PASS: G_AGENTS_INDEX_PASS`
`PASS: G_PROMPT_FILES_INDEX_PASS`
`PASS: G_LOCAL_MARKERS_PASS`
`PASS: G_ADVANCED_AGENTS_PASS`
`PASS: G_OLLAMA_BOUNDARY_PASS`
`PASS: G_AGENT_TOOLING_PASS`
`PASS: G_SOURCE_MAP_SCRIPT_PRESENT`
`PASS: G_SOURCE_MAP_PASS`
`PASS: G_AUTOPILOT_BOUNDS_SCRIPT_PRESENT`
`PASS: G_AUTOPILOT_BOUNDS_PASS`
`SUMMARY: PASS=52 FAIL=0`