# ROLLBACK

## PRODUCT
- No product rollback in lane D, but to revert the bounded snapshot IPC alignment:
  - git restore -- src-tauri/src/persistence/commands.rs src-tauri/src/system/persona_engine/mod.rs src-tauri/tauri.conf.json src-tauri/capabilities/persistence.json src-tauri/src/main.rs src/lib/security.ts

## GOVERNANCE
- git restore -- docs/governance/LOCAL_PERSISTENCE_RUNTIME_PROOF_SPEC.md
- git restore -- registry/proofpack-index.jsonl

## PERSISTENCE / TEST ARTIFACTS
- Remove proof pack only: rm -rf "$PACK"
- Keep runtime logs under reports/tauri_memory_e2e for audit.

## LTM IMPACT
- Snapshot emission remains blocked in mock backend; LTM remains derived and unsealed.
