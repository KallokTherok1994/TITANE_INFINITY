# 03_DISCOVERY_MAP

## Table source-of-truth

| Surface UI | Fichier UI | Store/Hook | Service TS | Commande Tauri/Backend | Type/Contract | Statut |
|---|---|---|---|---|---|---|
| Durée (timer loading) | ThinkingPanel.tsx:559 | Chat.tsx:629 (useState elapsedTime) | useChat.ts:latencyMs | conversation_generate | number (secondes) | PATCHÉE |
| Durée (post-response) | ThinkingPanel.tsx:559 | Chat.tsx:providerStatus.latency | useChat.ts:debugEntry.latencyMs | conversation_generate | number (ms, converti /1000) | PATCHÉE |
| Fichier Système | ThinkingPanel.tsx:732 | runtimeThinking.memoryTrace.systemPromptSources | Chat.tsx:hardcoded 6 sources | N/A (static) | string[] | PATCHÉE (class conditionnelle) |
| Score qualité | ThinkingPanel.tsx:587 | runtimeThinking.qualityScore | omegaMetadata?.validationScore | conversation_generate / omegaMetadata | number\|null | PATCHÉE (fallback computation) |
| XP/Progression total | ThinkingPanel.tsx:644+ | useExperience() → experience.state | experienceService.ts | persistent_memory_get_stats | ExperienceState | PASS (real data) |
| XP gain par tour | ThinkingPanel.tsx:626 | xpTrace.lastGainAmount | useChat.ts:awardExperience('chat',5,...) | N/A (localStorage) | number | PATCHÉE |
| Scroll molette | ThinkingPanel.css | N/A | N/A | N/A | CSS overflow-y | PATCHÉE |
| Auto-heal flag | ThinkingPanel.tsx:384 | runtimeThinking.autoHealed | omegaMetadata?.autoHealed | conversation_generate | boolean | HONEST (false quand non piped) |

## Chaîne causale résumée
1. `useChat.ts` → `sendMessage()` → IPC `conversation_generate` → `ConversationResponse`
2. `useChat.ts` → `debugEntry` → `debugEntries[0]` → `Chat.tsx runtimeThinking`
3. `runtimeThinking` → props → `ThinkingPanel`
4. `ThinkingPanel` → render OMEGA Journal

## Point de rupture identifié pour la durée
`elapsedTime={isLoading ? elapsedTime : undefined}` — `providerStatus.latency` disponible mais non câblé

## Point de rupture identifié pour le score
`omegaMetadata.validationScore` attendu mais `ConversationMetadata` Rust ne sérialise pas ce champ.  
Backend calcule `quality_score` dans `src-tauri/src/omega/merger.rs` mais ne l'expose pas en IPC.
