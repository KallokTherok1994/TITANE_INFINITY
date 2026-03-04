# 02_SCOPE

Timestamp: 2026-03-03T13:14:00-05:00

## Périmètre audité

- Backend Rust/Tauri:
	- `src-tauri/src/chat_engine/config.rs`
	- `src-tauri/src/chat_engine/memory.rs`
	- `src-tauri/src/chat_engine/mod.rs`
	- `src-tauri/src/chat_engine/streaming.rs`
	- `src-tauri/src/config/mod.rs`
	- `src-tauri/src/config/update.rs`
	- `src-tauri/src/commands/security.rs`
	- `src-tauri/src/main.rs`
- Frontend TS/React:
	- `src/pages/ConfigurationHub.tsx`
	- `src/lib/tauriCommands.ts`
	- `src/lib/tauriClient.ts`
	- `src/lib/security.ts`
	- `src/services/tauri/chatEngine.commands.ts`
	- `src/services/ai/chatEngine.ts`
	- `src/services/api/chat.ts`
	- `src/services/tauriClient.ts`
- Gouvernance UI registry:
	- `registry/ui-events.jsonl`

## Flux canonique vérifié (One Door)

1. UI (`ConfigurationHub`) déclenche des actions via `tauriClient.*`.
2. `tauriClient` route vers commandes IPC canonisées (`tauriCommands`).
3. Tauri exécute des `#[tauri::command]` côté backend (`config/update.rs`, `main.rs`).
4. Services/engines backend appliquent la logique + persistance.
5. Réponse en enveloppe canonique `{ ok, content, error }` vers UI.

Preuves:
- Appels UI via `tauriClient` détectés dans `ConfigurationHub.tsx`.
- Commandes Tauri présentes dans `config/update.rs`.
- Contrat enveloppe structuré dans `config/update.rs` (`ok/content/error`).

## Surfaces réseau et gouvernance

- Aucun appel web direct détecté dans `src/pages/ConfigurationHub.tsx` (pas de `fetch`, `axios`, `http://`, `https://`).
- Flux de recherche gouvernée backend présent dans `conversation_engine/commands.rs` via `SearchGatewayService::default_governed()`.
- Fallback local explicite côté recherche gouvernée (erreur explicite si backend full indisponible).

## Chantiers fonctionnels couverts

- Rétention mémoire: conservation des messages récents (tail) au lieu des plus anciens.
- Flush mémoire: debounce + coalescence + APIs flush immédiat.
- Streaming: chunking UTF-8 sûr + découpage lisible.
- Configuration unifiée backend: chat engine + request defaults + profils.
- Synchronisation UI↔backend des réglages chat.
- Durcissement parsing JSON metadata stream (éviter `Bad Unicode escape`).

## Sortie scope

- Scope couvert: PASS.
- Hors scope volontaire: build/deploy PROD (interdit sans token exact de politique).

