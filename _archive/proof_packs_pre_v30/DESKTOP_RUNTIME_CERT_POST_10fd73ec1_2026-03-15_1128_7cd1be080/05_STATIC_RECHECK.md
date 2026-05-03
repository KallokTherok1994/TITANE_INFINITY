# 05_STATIC_RECHECK (L1)

## A. ChatPage.tsx

| Vérification | Résultat | L1 |
|---|---|---|
| ChatWindow importé | `import { ChatWindow }` ligne 17 | STATIC_OK |
| ChatWindow monté | `<ChatWindow />` ligne 85 | STATIC_OK |
| Route /chat accessible | routes présentes | STATIC_OK |
| Imports cassés | lint PASS | STATIC_OK |

## B. main.rs — generate_response

| Vérification | Résultat | L1 |
|---|---|---|
| `#[cfg(feature = "mock")] mock_commands::generate_response` | ligne 1314-1315 | STATIC_OK |
| `#[cfg(all(not(mock),full))] chat_engine::commands::generate_response` | ligne 1316-1317 | STATIC_OK |
| Import `use titane_infinity::mock_commands` | ligne 34-35 | STATIC_OK |
| Cargo default = mock | Cargo.toml ligne 111 | STATIC_OK |

## C. Chat chain source

Chemin primaire frontend:
```
ChatWindow → useChat → chatEngine.ts::generate()
  → tryBackendPipeline() → chatEngineCommands.generateResponse()
  → invoke('generate_response', payload)
  → mock_commands::generate_response → "(MOCK) Réponse instantanée pour: {msg}"
  catch(err) → null → fallback: aiOrchestrator.generate()
```

Chemin OMEGA (backend IPC direct):
```
conversation_generate → ConversationEngineState
  → OMEGA fail (Pipeline not initialized — runtime prouvé)
  → legacy pipeline → AI Router → Ollama gemma2:2b
  → SMOKE_OK (runtime prouvé)
```

**La réponse du chat UI sera mock, PAS Ollama, sauf si tryBackendPipeline échoue et que l'orchestrateur frontend appelle Ollama via conversation_generate.**

## D. CameraPage

| Vérification | Résultat | L1 |
|---|---|---|
| `estimationCount > 0` gate | ligne 264 | STATIC_OK |
| `landmarksDetected` gate | ligne 329 | STATIC_OK |
| Disclaimer "en cours de développement" | lignes 314, 321, 354 | STATIC_OK |
| Ethical disclaimer permanent | ligne 45 | STATIC_OK |
| Modèle ML actif? | NON — feature onnx inactive | STATIC_BROKEN (pré-existant) |
