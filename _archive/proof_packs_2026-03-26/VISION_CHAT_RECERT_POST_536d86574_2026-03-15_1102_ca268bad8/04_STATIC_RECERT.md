# 04_STATIC_RECERT

## A. ChatPage.tsx

| Vérification | Résultat | Classe |
|---|---|---|
| ChatWindow importé | `import { ChatWindow } from '../components/ChatWindow'` ligne 17 | STATIC_OK |
| ChatWindow monté | `<ChatWindow />` ligne 85 | STATIC_OK |
| Placeholder commentaire retiré | Oui — remplacé par composant réel | STATIC_OK |
| Route `/chat` accessible | Route présente dans App.tsx | STATIC_OK |
| Imports cassés | aucun — lint PASS | STATIC_OK |
| ChatWindow composant existe | src/components/ChatWindow/index.tsx présent | STATIC_OK |

**Bilan ChatPage: STATIC_OK**

## B. chat.rs

| Vérification | Résultat | Classe |
|---|---|---|
| send_message retourne Err | `Err("send_message: not implemented — use conversation_generate")` ligne 39 | STATIC_OK |
| Callers de send_message en runtime | compliance test no-legacy-chat-send: PASS — aucun usage runtime | STATIC_OK |
| Caller qui attend success silencieux | AH-2026-03-15-CHAT-001 — send_message était legacy; callers migrés | STATIC_OK |
| send_message toujours enregistré | Oui (évite erreur IPC "command not found") | STATIC_OK |

**Bilan chat.rs: STATIC_OK**

## C. CameraPage.tsx

| Vérification | Résultat | Classe |
|---|---|---|
| Jauges affect gated `estimationCount > 0` | ligne 264: `{estimationCount > 0 && (` | STATIC_OK |
| Stats body gated `landmarksDetected` | ligne 329: `{landmarksDetected && (` | STATIC_OK |
| Disclaimer "en cours de développement" | présent quand modèle absent | STATIC_OK |
| UI implique toujours analyse réelle ailleurs | Non vérifié sur toute la page — PARTIAL | STATIC_PARTIAL |
| Modèle ML chargé? | NON — aucun import ML, feature `onnx` inactive | STATIC_BROKEN (pré-existant) |

**Bilan CameraPage: STATIC_PARTIAL (analyse réelle impossible, UI conditionnée mais pas honnête partout)**

## D. FINDING CRITIQUE: generate_response IPC

| Vérification | Résultat | Classe |
|---|---|---|
| generate_response défini dans chat_engine/commands.rs | OUI — ligne 18 | STATIC_OK |
| generate_response dans generate_handler![] (main.rs) | NON — absent après scan Python exhaustif | STATIC_BROKEN |
| COMMANDS.generate = 'generate_response' | OUI (chatEngine.commands.ts ligne 18) | STATIC_OK |
| Fallback si generate_response échoue | OUI — catch → null → aiOrchestrator | STATIC_OK |

**Conclusion IPC:** Chemin IPC primaire (`invokeCommand('generate_response')`) mort en runtime Tauri.
Fallback aiOrchestrator actif → réponse rendue mais via orchestrateur frontend, pas via Tauri backend conversation_generate.
