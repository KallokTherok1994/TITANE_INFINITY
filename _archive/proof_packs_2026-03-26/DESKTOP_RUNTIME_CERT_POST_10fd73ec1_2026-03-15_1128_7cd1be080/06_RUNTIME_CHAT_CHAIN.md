# 06_RUNTIME_CHAT_CHAIN

## Réponse Q4: Chaîne réellement traversée en runtime desktop

### Chemin attendu (en mode mock, feature active)

```
UI ChatPage → ChatWindow → useChat → chatEngine.generate()
  → tryBackendPipeline() → invokeCommand('generate_response', payload)
  → [TAURI IPC] mock_commands::generate_response
  → "(MOCK) Réponse instantanée pour: {user_message}"
  → content rendu dans ChatWindow
```

### Preuve L2 (binary):
- `generate_response` dans table commandes binaire ✅
- `mock_commands::generate_response` linkée en symbole T ✅

### Preuve L3 (runtime):
- Binary démarre → BOOT:READY atteint ✅
- generate_response disponible via IPC (commande enregistrée) ✅
- Interaction UI directe: BLOCKED_RUNTIME (pas de GUI interaction en BACKGROUND)

### Classification runtime:
- `CHAT_RUNTIME_OK_FALLBACK` — statiquement et L2 prouvé que la chaîne est traversable
- L4 (visible truth) = BLOCKED — pas d'interaction utilisateur directe possible

## Chemin de fallback si generate_response échoue:

```
catch(err) → tryBackendPipeline returns null
  → aiOrchestrator.generate(msg, history, config)
  → [Ollama/Gemini/etc via frontend fetch or conversation_generate]
  → réponse rendue
```

## Chemin conversation_generate (prouvé L3):

```
TITANE_SMOKE_IPC_CONVERSATION_GENERATE=1 → process_message()
  → OMEGA fail (Pipeline not initialized) → legacy pipeline
  → AI Router → LOCAL MODE → Ollama gemma2:2b
  → SMOKE_OK en 1445ms ✅
```

## Verdict runtime chat

| Dimension | Statut | Preuve |
|---|---|---|
| UI montée (ChatWindow) | STATIC_OK | L1 |
| generate_response enregistré | PASS | L2 binary |
| generate_response retourne mock | PASS | L2 source |
| generate_response appelé depuis UI | BLOCKED | L4 non prouvé |
| conversation_generate fonctionne | PASS | L3 SMOKE_OK |
| OMEGA pipeline | FAIL (Pipeline not initialized) | L3 log |
| Ollama fallback | PASS | L3 log |

**Classification: CHAT_RUNTIME_OK_FALLBACK (pour conversation_generate)**
**Classification: CHAT_BLOCKED_RUNTIME (pour generate_response → UI interaction)**
