# 04_SCOPE_FLOW

## Flow gouverné observé (réel)

1. **UI**
	- `src/pages/ConfigurationHub.tsx` lit/écrit via `tauriClient.*`
2. **IPC canonique TS**
	- `src/lib/tauriClient.ts` centralise `secureInvoke` (pas d'invoke brut hors client)
3. **Commandes Tauri**
	- `src-tauri/src/config/update.rs`: `get_chat_engine_config`, `set_chat_engine_config`, `get_chat_request_defaults`, `set_chat_request_defaults`
4. **Orchestration chat**
	- `src-tauri/src/chat_engine/mod.rs`: router/provider dispatch, streaming, persistence mémoire
5. **Mémoire / persistance**
	- `src-tauri/src/chat_engine/memory.rs` + `src-tauri/src/memory/storage.rs`
6. **Retour UI**
	- Flux stream chunk/done via events Tauri (`chat_engine/commands.rs`)

## Séquence

`UI -> tauriClient (secureInvoke) -> commands/config/chat_engine -> provider dispatch + memory -> stream/persist -> UI`

