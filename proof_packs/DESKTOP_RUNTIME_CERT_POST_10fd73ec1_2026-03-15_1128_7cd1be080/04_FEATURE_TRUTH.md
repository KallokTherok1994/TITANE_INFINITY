# 04_FEATURE_TRUTH

## Définition source (Cargo.toml)
```toml
[features]
default = ["custom-protocol", "mock", "audio-capture"]
mock = []
full = []
```

## Features actives en dev build
- `mock` ACTIVE (dans default)
- `custom-protocol` ACTIVE
- `audio-capture` ACTIVE
- `full` INACTIVE
- `onnx` INACTIVE

## Preuve compilation mock active

### Preuve nm (binary debug symbols):
```
T _ZN15titane_infinity13mock_commands17generate_response17h...
```
→ mock_commands::generate_response linkée comme symbole T (text/code)

### Preuve strings (binary rodata):
```
...ollama_querygenerate_response...
```
→ "generate_response" dans la table des commandes Tauri enregistrées

### Preuve cfg gate en source:
```rust
#[cfg(feature = "mock")]
mock_commands::generate_response,
#[cfg(all(not(feature = "mock"), feature = "full"))]
chat_engine::commands::generate_response,
```
→ mock active → mock_commands::generate_response compilé ET enregistré

## Réponse Q2 et Q3

**Q2:** Feature set actif = `mock` + `custom-protocol` + `audio-capture`
**Q3:** generate_response TRULY registered in compiled handler (binary proof)

## Implication pour chat UI

`generate_response` en mode mock → retourne `(MOCK) Réponse instantanée pour: {msg}`
PAS un appel Ollama — mock pur.

La chaîne Ollama réelle passe par `conversation_generate` (provenu conversionengine → AI Router → Ollama).

## Contradiction flaggée

chatEngine.ts ligne 1037 appelle `generateResponse()` → invoke('generate_response') → mock response.
La réponse CHAT UI sera "mock" et non une vraie réponse IA Ollama.
Ce n'est pas un mensonge si le UI affiche provider='mock'.
Statut: META_PARTIAL (dépend de ce que l'UI affiche à l'utilisateur).
