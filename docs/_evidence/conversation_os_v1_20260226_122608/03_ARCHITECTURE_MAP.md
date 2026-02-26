# 03_ARCHITECTURE_MAP.md

Date (UTC): 2026-02-26

## Ring 1 — Types
- Types conversation/meta côté `src/` et `src-tauri/src/conversation_engine/types.rs`.
- Rôle: schéma, contrats, métadonnées.

## Ring 2 — Engines (logique pure)
- `src-tauri/src/engines/conversation_os/router.rs`
- `src-tauri/src/engines/conversation_os/policy.rs`
- `src-tauri/src/engines/conversation_os/resilience.rs`
- `src-tauri/src/engines/conversation_os/memory.rs`
- `src-tauri/src/engines/conversation_os/search.rs`

## Ring 3 — Services (I/O contrôlé)
- `src-tauri/src/services/network_gateway.rs` (HTTP gouverné)
- `src-tauri/src/services/search_gateway.rs` (search via gateway)
- `src-tauri/src/services/db_service.rs` (append-only store)

## Ring 4 — Modules/UI/IPC
- `src-tauri/src/conversation_engine/commands.rs` (`conversation_generate`)
- Frontend conversation UI et client IPC canonique côté `src/`

## Pipeline canonique observé
`conversation_generate` → Router → Policy → Resilience → Memory → Search(normalize) → Persist → Trace.

## Zones legacy à surveiller
- `src-tauri/src/overdrive/chat_orchestrator.rs` (deprecated mais présent)
- Multiples commandes Tauri historiques (surface large à contrôler par gate reachability)

