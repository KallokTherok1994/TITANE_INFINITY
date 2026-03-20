# 20_ROLLBACK

## Minimal rollback (functional patch only)

```bash
git restore -- src/services/conversationEngine.ts
git restore -- src-tauri/src/conversation_engine/commands.rs
git restore -- scripts/e2e/run-online-chat-proof-ui.sh
git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js
git restore -- tests/e2e/provider-flow.test.ts
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

## Proof/doc rollback only

```bash
git restore -- TEST_STACK_DISCOVERY.md UI_SURFACE_MAP.md ACTION_RUNTIME_MAP.md TARGET_AUTHORITY_MAP.md MEMORY_TRUTH_MAP.md GAP_MATRIX.md INTERFACE_TRUTH_MATRIX.md
git restore -- proof_packs/TOTAL_SYSTEM_AUDIT_2026-03-20_1324_94b0cc401
git restore -- proof_packs/TITANE_TOTAL_MEMORY_CERT_2026-03-20_0946_b7ed74cf1
```

