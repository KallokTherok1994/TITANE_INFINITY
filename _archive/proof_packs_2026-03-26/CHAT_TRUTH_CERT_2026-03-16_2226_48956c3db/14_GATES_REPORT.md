# 14 — GATES REPORT

| Gate                               | Verdict       | Justification                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G_CHAT_ACTIVE_CHAIN_PROVEN         | **PASS**      | useChat.ts → chatService.sendMessage() → invokeWithRetry('conversation_generate') → conversation_engine::commands::conversation_generate → OMEGA pipeline → SQLite persist. Chaîne complète prouvée par code.                                      |
| G_CHAT_UI_NOT_FAKE                 | **PASS**      | ChatService.sendMessage() appelle réellement Tauri IPC. E2E mock bounded (window flag uniquement). Aucun canned answer détecté.                                                                                                                    |
| G_IPC_FRONT_BACK_PARITY            | **PASS**      | conversation_generate: frontend = backend. chat_stream_message: frontend = backend. Aucune dérive de nommage. ipcContract.ts + validateIpcPayload() actifs.                                                                                        |
| G_PROVIDER_META_TRUTHFUL           | **PASS**      | ensure_provider_meta() en backend. p3_provider_meta_gates x3 = 4/4 PASS. Metadata provider injectée dans réponse.                                                                                                                                  |
| G_FALLBACK_HONEST                  | **PASS**      | FORCE_LOCAL_PROVIDER + policy_verdict.allow_external_ai gate → forçage local avec log::warn explicite. Aucune réponse canned détectée.                                                                                                             |
| G_STM_REAL                         | **PARTIAL**   | useState/useRef réel en session. ImmediateMemory Rust réel (IMPROVE-005: add_to_immediate() actif). Non persistent au refresh.                                                                                                                     |
| G_MTM_REAL_OR_PARTIAL              | **PARTIAL**   | chatMemoryCompactor.ts → localStorage. Write path prouvée (ligne 174). Compaction réelle. Pas de sync backend.                                                                                                                                     |
| G_LTM_HONESTLY_CLASSIFIED          | **PASS**      | SQLite LTM prouvée. load_conversation_history() unconditional (IMPROVE-003). useLTMContext pour UI display seulement. Flag CONVOS_MEMORY_LTM documenté mais non-gating.                                                                            |
| G_ROUTE_MODULE_CONTEXT_PROVEN      | **PASS**      | publishActiveModuleContext() appelé à chaque navigation (App.tsx:296). readActiveModuleContext() → buildSingleDoorEnvelope() → context_envelope dans payload conversation_generate. extract_context_binding() côté backend extrait moduleId/route. |
| G_TWINS_RELATION_PROVEN_OR_BLOCKED | **BLOCKED**   | TWINS: UI (TwinsPage) + backend (twin\_\* commands) présents mais AUCUNE connexion au pipeline chat. Classificé BLOCKED (non connecté = attendu selon scope actuel).                                                                               |
| G_TIME_RELATION_PROVEN_OR_BLOCKED  | **BLOCKED**   | TIME: TimePage fonctionnel, cognitive state en localStorage, mais AUCUNE injection dans context_envelope ou conversation_generate. Classificé BLOCKED.                                                                                             |
| G_TAURI_AUTHORITY_ALIGNED          | **PASS**      | chat_ai.json contient conversation_generate et chat_stream_message. Scoped à window "main". send_message stub absent de la capability.                                                                                                             |
| G_CAPABILITIES_NOT_OVEREXPOSED     | **PASS**      | Toutes capabilities scoped à "main" uniquement. permissions=["core:default"]. Aucune exposition multi-fenêtre.                                                                                                                                     |
| G_NO_CRITICAL_LEGACY_BYPASS        | **QUALIFIED** | send_message = stub documenté, non exposé en capability. overdrive::chat_send_message = deprecated annoté. Aucun bypass critique actif sur chemin prod.                                                                                            |
| G_AUTOHEAL_NON_LYING               | **PASS**      | scripts/autoheal/ append-only, detect_recurrence.sh = PASS. Auto-heal dans useConversationEngine.ts est bounded + logged. Aucun fake-success détecté.                                                                                              |
| G_TRACE_COVERAGE_SUFFICIENT        | **PARTIAL**   | Chaîne send/receive = tracée. LTM load/write = tracée. Policy gate = tracée. TWINS/TIME enrichment = absents (déconnexion confirmée).                                                                                                              |
| G_RELEVANT_RETESTS_STABLE          | **PASS**      | p3_provider_meta_gates x3 = 4/4. cargo check x2 = PASS. detect_recurrence x3 = PASS. Frontend typecheck BLOCKED (Node.js v18 env).                                                                                                                 |
| G_ROLLBACK_CLEAR                   | **PASS**      | Rollback documenté dans 15_ROLLBACK.md. git restore cible fichiers précis.                                                                                                                                                                         |

## Résumé

| Verdict   | Nombre |
| --------- | ------ |
| PASS      | 12     |
| PARTIAL   | 3      |
| BLOCKED   | 2      |
| QUALIFIED | 1      |
| FAIL      | 0      |
| UNKNOWN   | 0      |

---

## Gates R3 (2026-03-16 continuation)

| Gate                        | Statut            | Preuve                                                                                              |
| --------------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| G_NO_CRITICAL_LEGACY_BYPASS | QUALIFIED→PARTIAL | Mock guard actif dans tryBackendPipeline; Cargo.toml default=mock reste (risque résiduel documenté) |
| G_AUTOHEAL_NON_LYING        | PASS              | AH entry AH-MOCK-BACKEND-RESPONSE-2026-03-16 ajouté; detect_recurrence entries=342                  |
| detect_recurrence           | PASS              | PASS=18                                                                                             |
| verify_instructions         | PASS              | PASS=20 FAIL=0                                                                                      |

**Verdict gates R3:** QUALIFIED (mock guard actif; défaut Cargo.toml non modifié — risque résiduel documenté)
