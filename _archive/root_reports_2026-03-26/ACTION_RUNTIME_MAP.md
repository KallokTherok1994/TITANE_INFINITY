# ACTION_RUNTIME_MAP

## User-to-Model Action Path (One Door)

1. UI user types into `chat-input` and triggers `chat-send`.
2. Frontend chat orchestration builds request in `src/services/conversationEngine.ts`.
3. Frontend sends canonical IPC request through Tauri client (`secureInvoke` path).
4. Backend command entry point: `conversation_generate` in `src-tauri/src/conversation_engine/commands.rs`.
5. Backend loads conversation history (`load_conversation_history`) and runs conversation pipeline.
6. AI routing resolves provider (Ollama in current local profile), then returns assistant content.
7. Backend response metadata and trace are returned to frontend.
8. UI renders assistant row and runtime panel with provider/network/reason attributes.

## Memory-related action path

1. Frontend attempts persistent context (`persistentMemoryGetContext`) before generation.
2. Prompt includes explicit persistent memory state marker.
3. Backend loads historical conversation context from `conversation_os_v1.db`.
4. Backend metadata now includes history load status/count/error markers.
5. UI receives runtime metadata and renders resulting assistant output.

## Evidence markers used in desktop proof

- `[PROOF] scenario=S1 run=...`
- `[PROVIDER_USED_DOM] Ollama`
- `[UI_PANEL_ALIGNMENT] {...}`
- `[ASSISTANT_TEXT] ...`
