# ROLLBACK

## 1) PRODUCT
- No product rollback required (no src/ or src-tauri changes).

## 2) GOVERNANCE
- Rollback spec update:
  - git restore -- docs/governance/LOCAL_PERSISTENCE_RUNTIME_PROOF_SPEC.md

## 3) RUNTIME / TEST ARTIFACTS
- Remove proof pack:
  - rm -rf proof_packs/POST_SEALED_LOCAL_PERSISTENCE_RUNTIME_RESTORE_FIX_2026-03-28_1627_e88264039

## 4) CLEANUP
- Accidental artifacts removed: B{Restore, CE[Conversation, CREATE[Append, IPC[IPC], Match, Mismatch, No, RESTORE{Restore, Yes
- Rollback: re-create zero-byte placeholders if needed (documented list above).

## 5) LTM IMPACT
- No change to LTM canonicality; remains derived unless future runtime proof succeeds.
