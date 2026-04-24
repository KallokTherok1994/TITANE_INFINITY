# 03_CHAT_SURFACE_MAP

## Routes / Pages Chat

| Route   | Component               | Hook/Store         | Backend path                      | Autorité réelle            | Statut |
| ------- | ----------------------- | ------------------ | --------------------------------- | -------------------------- | ------ |
| `/chat` | `src/ui/pages/Chat.tsx` | `useChat` (hooks/) | `chatEngine.ts → orchestrator.ts` | `chatEngine.ts:generate()` | ACTIVE |

## Composants Chat

| Composant              | Rôle                | Connecté engine ?  |
| ---------------------- | ------------------- | ------------------ |
| `ChatWindow.tsx`       | Conteneur principal | Via hook           |
| `ChatInput.tsx`        | Saisie + envoi      | Via hook           |
| `ChatModeSelector.tsx` | Sélection mode      | `useChatModeStore` |
| `MessageBubble.tsx`    | Affichage message   | Props              |
| `MessageList.tsx`      | Liste messages      | Props              |
| `ModeBadge.tsx`        | Badge mode actif    | Props              |
| `ModelSelector.tsx`    | Sélection modèle    | Store              |
| `ChatToolbar.tsx`      | Outils toolbar      | Partial            |

## Services

| Service                               | Rôle                                      | Autorité                 |
| ------------------------------------- | ----------------------------------------- | ------------------------ |
| `src/services/ai/chatEngine.ts`       | Pipeline principal                        | AUTORITÉ CENTRALE        |
| `src/services/ai/orchestrator.ts`     | Sélection provider + génération           | AUTHORITÉ PROVIDER       |
| `src/services/ai/responsePolicy.ts`   | Politique réponse ← NOUVEAU               | AUTORITÉ RESPONSE POLICY |
| `src/services/ai/chatModes.config.ts` | Config modes (maxTokens, temp, profileId) | SOURCE VÉRITÉ MODES      |
| `src/core/prompts/index.ts`           | Build system prompt                       | AUTORITÉ PROMPT          |

## Visible controls (UI)

- `ChatModeSelector` : sélection mode (default/reflection/creation/strategy/omega/...)
- `ModelSelector` : sélection provider (auto/ollama/gemini/local)
- Aucun contrôle de profil DIRECT/BALANCED/DEEP/ARCHITECT exposé — **non prévu dans ce patch minimal**
