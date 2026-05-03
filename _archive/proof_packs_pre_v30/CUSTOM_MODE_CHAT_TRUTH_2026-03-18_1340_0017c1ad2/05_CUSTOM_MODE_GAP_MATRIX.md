# CUSTOM MODE GAP MATRIX

| Surface | Classification (pre-fix) | Classification (post-fix) |
|---------|--------------------------|--------------------------|
| Modal open action | PROVEN_RUNTIME | PROVEN_RUNTIME |
| Text input / concept | PROVEN_RUNTIME | PROVEN_RUNTIME |
| Template buttons/cards | PROVEN_RUNTIME | PROVEN_RUNTIME |
| Generate button → Tauri IPC | PARTIAL_CHAIN (Tauri may fail, fallback exists) | PARTIAL_CHAIN |
| Save/create action | PROVEN_RUNTIME | PROVEN_RUNTIME |
| Mode list (dropdown shows custom modes) | PROVEN_RUNTIME | PROVEN_RUNTIME |
| Active mode badge/label | PROVEN_VISIBLE_ONLY | PROVEN_RUNTIME |
| Chat header mode indicator | PROVEN_VISIBLE_ONLY | PROVEN_RUNTIME |
| Prompt/policy builder (getSystemPrompt) | CHAT_CONSUMPTION_MISSING | PROVEN_RUNTIME |
| Provider/router bridge | FALLBACK_MASKING | PROVEN_RUNTIME |
| Chat request payload systemPrompt | FALLBACK_MASKING | PROVEN_RUNTIME |
| Persistence (localStorage load) | PERSISTENCE_MISSING (registry not filled) | PROVEN_RUNTIME |
| Fallback labeling in UI | FALLBACK_MASKING | PARTIAL_CHAIN (no explicit UI label; acceptable) |

## Root cause tested

| Hypothesis | Result |
|------------|--------|
| H1 Generate button path broken | NOT ROOT CAUSE — button fires, Tauri fallback exists |
| H2 Generation output broken | NOT ROOT CAUSE — template/fallback prompt produced |
| H3 Persistence broken | PARTIAL — mode saved to localStorage correctly |
| H4 Activation broken | NOT ROOT CAUSE — setMode() updates currentMode correctly |
| H5 Chat consumption broken | **ROOT CAUSE** — getSystemPrompt() never found custom mode |
| H6 Fallback masking | **ROOT CAUSE** — SYSTEM_PROMPTS.default used silently |
| H7 Source-of-truth drift | **ROOT CAUSE** — localStorage custom modes not registered in chatModes.config.ts |
