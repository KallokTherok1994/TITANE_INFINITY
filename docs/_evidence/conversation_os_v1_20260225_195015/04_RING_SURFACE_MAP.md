# 04_RING_SURFACE_MAP.md

## Ring 1 — Types
- `src/types/conversation_os.ts`
- `src/types/index.ts`
- Rôle: contrats de données Conversation OS.

## Ring 2 — Engines (pure logic)
- `src-tauri/src/engines/conversation_os/router.rs`
- `src-tauri/src/engines/conversation_os/policy.rs`
- `src-tauri/src/engines/conversation_os/resilience.rs`
- `src-tauri/src/engines/conversation_os/memory.rs`
- `src-tauri/src/engines/conversation_os/search.rs`
- Rôle: décisions déterministes sans I/O direct.

## Ring 3 — Services (I/O contrôlé)
- `src-tauri/src/services/db_service.rs`
- `src-tauri/src/services/network_gateway.rs`
- `src-tauri/src/services/search_gateway.rs`
- `src-tauri/src/services/embeddings_service.rs`
- Rôle: persistance + réseau gouverné.

## Ring 4 — Modules/UI + Orchestration
- `src-tauri/src/conversation_engine/commands.rs`
- `src/components/debug/TracePanel.tsx`
- `src/components/debug/ChatDebugPanel.tsx`
- `src/components/debug/index.ts`
- `registry/ui-events.jsonl`
- Rôle: orchestration bout-en-bout + visibilité trace.
