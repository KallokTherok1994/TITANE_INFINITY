# CAPABILITY MATRIX

| Capacité | Doc | Code | Wiring | Runtime | Visible UI | Stable ×3 | Statut |
|---|---|---|---|---|---|---|---|
| Conversation OMEGA (conversation_generate) | ✅ | ✅ | ✅ IPC enregistré | ⚠️ UNKNOWN | ✅ UI | UNKNOWN | **PARTIAL** |
| Multi-provider chat (Ollama) | ✅ | ✅ | ✅ IPC + HTTP | ⚠️ UNKNOWN | ✅ | UNKNOWN | **PARTIAL** |
| Multi-provider cloud (Gemini/OpenAI/Claude) | ✅ | ✅ | ✅ IPC | ❌ key-gated | ✅ config | UNKNOWN | **PARTIAL** |
| STM (ShortTermMemory) | ✅ | ✅ | ✅ UnifiedMemory init | ⚠️ UNKNOWN | ❌ hidden | UNKNOWN | **PARTIAL** |
| MTM (MidTermMemory) | ✅ | ✅ | ⚠️ via Consolidator | ⚠️ UNKNOWN | ❌ hidden | UNKNOWN | **PARTIAL** |
| LTM (LongTermMemory) | ✅ | ✅ | ⚠️ env flag off | ❌ disabled default | ❌ hidden | UNKNOWN | **PARTIAL** |
| Persistent Memory v19.2Ω | ✅ | ✅ | ✅ setup hook | ⚠️ UNKNOWN | ✅ admin | UNKNOWN | **PARTIAL** |
| Conversation history SQLite | ✅ | ✅ | ✅ IPC load_conversation_history | ⚠️ UNKNOWN | ✅ chat | UNKNOWN | **PARTIAL** |
| AutoFix / AutoHeal | ✅ | ✅ | ✅ ~45 cmds + 20+ rules | ⚠️ UNKNOWN | ✅ admin | UNKNOWN | **PARTIAL** |
| Security AES-256-GCM | ✅ | ✅ | ✅ setup hook | ⚠️ P0 passphrase | ❌ hidden | UNKNOWN | **PARTIAL** |
| Router intelligent | ⚠️ DOC | ✅ stats-based | ✅ conversation_engine | ⚠️ UNKNOWN | ❌ | UNKNOWN | **PARTIAL** |
| Streaming IA | ⚠️ DOC | ❌ TODO | ❌ non livré | ❌ | ❌ | NO | **STUB** |
| send_message | ✅ | ❌ STUB | ❌ retourne Err | ❌ | ❌ | NO | **FAIL** |
| web_research | ⚠️ | ❌ P1 STUB | ❌ BLOCKED réseau | ❌ | ❌ | NO | **STUB** |
| Evolution Engine state | ⚠️ | ❌ STUB | ❌ Phase 5.2 | ❌ | ❌ | NO | **STUB** |
| Tool calling (weather/stock) | ❌ | ❌ STUB | ❌ console.log | ❌ | ❌ | NO | **STUB** |
| Voice Engine | ✅ | ✅ | ✅ 17 cmds | ⚠️ UNKNOWN | ✅ UI | UNKNOWN | **PARTIAL** |
| TTS hybride | ✅ | ✅ | ✅ localhost:8765 | ⚠️ UNKNOWN | ✅ | UNKNOWN | **PARTIAL** |
| Avatar system | ✅ | ✅ | ✅ ~35 cmds | ⚠️ UNKNOWN | ✅ | UNKNOWN | **PARTIAL** |
| Admin/Governance | ✅ | ✅ | ✅ governance cmds | ⚠️ UNKNOWN | ✅ admin | UNKNOWN | **PARTIAL** |
| E2E Tests WDIO | ✅ | ✅ | ✅ wdio config | ⚠️ INSTABLE | N/A | ⚠️ | **PARTIAL** |
| Unit Tests Vitest | ✅ | ✅ | ✅ configs | ⚠️ UNKNOWN | N/A | UNKNOWN | **PARTIAL** |
| Cargo Tests Rust | ✅ | ✅ | ✅ inline tests | ⚠️ UNKNOWN | N/A | UNKNOWN | **PARTIAL** |

**RÈGLE APPLIQUÉE**: Sans preuve runtime = PARTIAL. Avec fallback masquant = FAIL/STUB.
