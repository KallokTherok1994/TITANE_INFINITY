# 03 REPO REALITY MAP
## Active release-relevant surfaces
- src-tauri/src/main.rs — entry + invoke_handler!
- src-tauri/src/overdrive/chat_orchestrator.rs — chat IPC
- src-tauri/src/core/modules/unified_memory.rs — LTM engine
- src-tauri/src/conversation_engine/commands.rs — live chat path
- src-tauri/capabilities/chat_ai.json — IPC allow list
- CHANGELOG.md — version history
- scripts/autoheal/autoheal_rules.jsonl — governance

## Artifact locations
- dist/ (browser build, blocked by Node v18)
- src-tauri/target/release/ (Tauri binary — not built this session)
- release/ — not present
- dist-28.0.0.tar.gz — stale archive from prior release

## Workflow locations
- .github/workflows/ — not audited this session (supply chain BLOCKED)

## Dirty workspace risk
LOW for our session files.
MEDIUM for other agents' unstaged changes (App.tsx, TitanePage.tsx).
