# UI_DESKTOP_ACCEPTED_DIRTY_REDUCTION_AUDIT_v68

## mission
Reduce accepted-dirty baseline safely and classify residual dirty files honestly.

## scope
- Dirty files observed after v68 gate execution
- Safe restore actions on generated/artifact drift files
- Final accepted-dirty classification

## baseline before reduction
`git status --short` showed dirty entries in:
- backend proof artifacts (v58/v59/v63)
- generated UI docs/manifests
- src-tauri/Cargo.lock
- src-tauri/data/ui_theme.json
- v68 mission files (workflow, script, docs, autoheal, v67 certification date fix)

## actions taken
Executed safe restore on generated/artifact drift files:
- Restored 3 backend artifacts:
  - artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl
  - artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl
  - artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl
- Restored 7 generated docs/manifests:
  - docs/ui/desktop/generated/UI_DESKTOP_ACTION_CLASSIFICATION_v50.md
  - docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.json
  - docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.md
  - docs/ui/desktop/generated/UI_DESKTOP_FRONTEND_BACKEND_MAP_v50.md
  - docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json
  - docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md
  - docs/ui/generated/UI_ROUTE_INVENTORY.md
- Restored:
  - src-tauri/Cargo.lock

## per-item classification
| path | status | v67 classification | can safely restore | can safely commit | should remain ignored | action taken | final classification |
|---|---|---|---|---|---|---|---|
| artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl | M | accepted-dirty pre-existing | yes | no | n/a | restored | CLEANED_SAFE |
| artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl | M | accepted-dirty pre-existing | yes | no | n/a | restored | CLEANED_SAFE |
| artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl | M | accepted-dirty pre-existing | yes | no | n/a | restored | CLEANED_SAFE |
| docs/ui/desktop/generated/* | M | regenerated drift | yes | no | n/a | restored | CLEANED_SAFE |
| docs/ui/generated/UI_ROUTE_INVENTORY.md | M | regenerated drift | yes | no | n/a | restored | CLEANED_SAFE |
| src-tauri/Cargo.lock | M | pre-existing drift | yes | no | n/a | restored | CLEANED_SAFE |
| src-tauri/data/ui_theme.json | M | accepted-dirty pre-existing | no (user/runtime state) | no | n/a | kept untouched | ACCEPTED_DIRTY_USER_STATE |

## final dirty state after reduction
Dirty files remain:
- Mission-intentional modifications:
  - .github/workflows/titane-static-gates.yml
  - scripts/verify/enforce-online-first.sh
  - scripts/autoheal/autoheal_rules.jsonl
  - docs/ui/desktop/UI_DESKTOP_DETERMINISTIC_ARTIFACTS_CI_CLEAN_BASELINE_CERTIFICATION_v67.md
  - v68 audit docs
- Residual accepted-dirty:
  - src-tauri/data/ui_theme.json

## conclusion
- Accepted-dirty was reduced significantly via safe restore.
- A fully pristine worktree is not claimed because `src-tauri/data/ui_theme.json` remains intentionally untouched.

## verdict
PASS

## next step
Proceed with v68 commit using scope-limited staging, excluding `src-tauri/data/ui_theme.json`.

## rollback note
`git restore -- artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl docs/ui/desktop/generated/UI_DESKTOP_ACTION_CLASSIFICATION_v50.md docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.json docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.md docs/ui/desktop/generated/UI_DESKTOP_FRONTEND_BACKEND_MAP_v50.md docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md docs/ui/generated/UI_ROUTE_INVENTORY.md src-tauri/Cargo.lock`
