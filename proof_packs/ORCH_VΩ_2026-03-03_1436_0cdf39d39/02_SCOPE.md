# 02_SCOPE

## FLOW RÉEL (constaté)
- UI Ring 4: `src/pages/ConfigurationHub.tsx` appelle `tauriClient` et traite les enveloppes IPC avec erreur visible.
- UI/Service Ring 4->3: `src/services/tauri/chatEngine.commands.ts` passe par `secureInvoke` (`generate_response`, `stream_response`, `get_chat_request_defaults`).
- IPC One Door: commandes enregistrées dans `src-tauri/src/main.rs` (register invoke handler, pas d’appel réseau direct UI).
- Backend Ring 4 (Tauri): `src-tauri/src/config/update.rs` expose `IpcEnvelope<T> { ok, content, error }` pour lecture/écriture config chat.
- Chat engine backend: `src-tauri/src/chat_engine/commands.rs` expose `generate_response`, `stream_response`, `save_memory`, `load_memory`, `reset_memory`.

## RING MAP (échantillon vérifié)
- Ring 4 UI/Modules: `src/pages/ConfigurationHub.tsx`, `src/hooks/useChat.ts`.
- Ring 3 Services: `src/services/tauri/chatEngine.commands.ts`, `src/services/api/chat.ts`.
- Ring 4 OS/IPC: `src-tauri/src/main.rs`, `src-tauri/src/config/update.rs`, `src-tauri/src/chat_engine/*`.

## CONTRADICTIONS / RISQUES
- `rg` global sur `src/` retourne des usages `fetch/http` hors flux chat canonique; ces occurrences ne prouvent pas une violation du flux chat One Door.
- Build strict TypeScript (`pnpm run check`) échoue sur erreurs préexistantes hors périmètre ORCH (voir `06_BUILD_X3.log`).

## STATUT SCOPE
- Scope ORCH: PREUVE COLLECTÉE
- Code runtime modifié: NON

