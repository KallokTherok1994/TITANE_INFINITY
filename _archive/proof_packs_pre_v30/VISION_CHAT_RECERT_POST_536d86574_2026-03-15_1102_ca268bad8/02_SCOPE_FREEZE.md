# 02_SCOPE_FREEZE

Scope primaire autorisé:
- src/pages/CameraPage.tsx ✓
- src/pages/ChatPage.tsx ✓
- src-tauri/src/commands/chat.rs ✓
- tests/**/chat* ✓
- proof_packs/VISION_CHAT_* ✓
- scripts/autoheal/autoheal_rules.jsonl (si nouveau guard justifié) ✓

Scope secondaire investigué (nécessaire pour répondre Q1-Q6):
- src/services/ai/chatEngine.ts (fallback chain proof)
- src/services/tauri/chatEngine.commands.ts (COMMANDS.generate)
- src-tauri/src/main.rs (generate_handler![] verification)
- src-tauri/src/chat_engine/commands.rs (generate_response definition)

Scope INTERDIT non touché:
- architecture refactor ✓ (non touché)
- pages non liées ✓ (non touché)
- memory system ✓ (non touché)
- orchestrator redesign ✓ (non touché)
