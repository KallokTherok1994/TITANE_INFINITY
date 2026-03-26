# Carte de la chaîne runtime chat

## Chaîne prouvée
1. `ConversationSection` affiche et persiste `selectedProvider`
2. `useConversationEngine.sendMessage()` appelle `processMessage()`
3. `processMessage()` construit le payload IPC
4. `tauriClient.conversationGenerate()` encapsule sous `args`
5. Tauri reçoit `conversation_generate`
6. `src-tauri/src/conversation_engine/commands.rs` convertit `provider` vers `AIConfig.provider_preference`
7. `engine.process_message()` exécute la lane OMEGA

## Verrou prouvé avant patch
- `ConversationSection` gardait un `selectedProvider`
- `processMessage()` écrasait toujours par `const provider = 'auto'`
- résultat: la sélection UI n'était pas consommée par la chaîne d'envoi active

## Niveau de vérité par couche
- provider selector UI: DECLARED
- provider status UI: DECLARED
- active provider store localStorage: CONFIGURED
- send chain frontend: TRAVERSED
- Tauri invoke: TRAVERSED
- backend chat command: DECLARED
- router: DECLARED
- final response path: TRAVERSED partiellement via tests

## Unknown
- traversée desktop réelle via clic utilisateur dans cette session: unknown
