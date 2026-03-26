# 06_CHAT_CHAIN_MATRIX

## Réponse Q1: Commit 536d86574 rend ChatPage opérationnel en runtime desktop?

**NON — pas prouvé en runtime.** UI montée statiquement mais:
1. generate_response non enregistré → IPC erreur au premier send
2. Fallback aiOrchestrator possible mais dépend de provider disponible
3. Runtime BLOCKED (pas de Tauri desktop lancé)

## Réponse Q3: send_message non-mensonger sans casser callers?

**OUI** — compliance test `no-legacy-chat-send.test.ts` confirme aucun caller runtime.
send_message était déjà legacy; callers migrés vers conversation_generate ou ChatWindow.

## Réponse Q4: Chaîne chat end-to-end prouvée en runtime desktop?

**NON** — CHAT_BLOCKED_RUNTIME.

Chemin réel:
```
UI input → send → useChat → chatEngine.generate()
  → tryBackendPipeline() → invokeCommand('generate_response')
  → TAURI ERROR (not in handler)
  → catch(null) → FALLBACK: aiOrchestrator.generate()
  → provider (mock/ollama/autre)
  → réponse rendue
```

Chemin primaire Tauri = MORT.
Chemin fallback = possible si provider disponible.

## Matrice chaîne chat

| Étape | Chemin réel | Résultat statique | Résultat runtime |
|---|---|---|---|
| UI input | ChatWindow → useChat | STATIC_OK | BLOCKED (no desktop) |
| send | useChatCore.sendMessage | STATIC_OK | BLOCKED |
| invoke 'generate_response' | chatEngineCommands.generateResponse | STATIC_OK | FAIL (not registered) |
| catch + fallback | chatEngine.ts ~1146 | STATIC_OK | PARTIAL (depends on provider) |
| aiOrchestrator.generate | aiOrchestrator.ts | STATIC_OK | BLOCKED (no desktop) |
| réponse rendue | ChatWindow message list | STATIC_OK | BLOCKED |

**Verdict global chat: CHAT_BLOCKED_RUNTIME**
