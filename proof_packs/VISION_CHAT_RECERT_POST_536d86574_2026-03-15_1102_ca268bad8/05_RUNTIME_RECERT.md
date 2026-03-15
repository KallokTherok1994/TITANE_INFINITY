# 05_RUNTIME_RECERT

**EXEC_MODE: BACKGROUND — desktop Tauri non lancé en runtime réel**

## Protocole smoke applicable (sans harness E2E)

Le desktop Tauri ne peut pas être lancé automatiquement dans ce contexte BACKGROUND.
Verdict runtime = BLOCKED sur tous les chemins requérant exécution Tauri native.

## Classification runtime par chaîne

### Chat

| Étape | Attendu | Résultat | Classe |
|---|---|---|---|
| ChatPage visible | ChatWindow montée | Statiquement OK, runtime BLOCKED | CHAT_PARTIAL |
| Saisie message | Input visible | Statiquement OK | CHAT_PARTIAL |
| Envoi message | invoke('generate_response') | generate_response NOT in handler → FAIL IPC | CHAT_BACKEND_BLOCKED |
| Fallback | aiOrchestrator.generate() | Statiquement présent, fallback attend provider | CHAT_PARTIAL |
| Réponse rendue | Contenu visible | Dépend du provider disponible (Ollama/mock) | CHAT_BLOCKED_RUNTIME |

**Verdict runtime chat: CHAT_BLOCKED_RUNTIME** (no Tauri desktop evidence)

### Camera

| Étape | Attendu | Résultat | Classe |
|---|---|---|---|
| Énumération devices | navigator.mediaDevices.enumerateDevices() | Hardware absent → NO_DEVICE probable | BLOCKED_HARDWARE |
| Sélection device | Sélecteur UI | Statiquement OK | BLOCKED_HARDWARE |
| Preview | getUserMedia() | BLOCKED_HARDWARE | BLOCKED_HARDWARE |
| Frame | Canvas / WebGL | BLOCKED_HARDWARE | BLOCKED_HARDWARE |
| Analyse | Aucun modèle ML | SYMBOLIC_ONLY | BLOCKED_HARDWARE |

**Verdict runtime camera: BLOCKED_HARDWARE**

## Protocole smoke manuel (reproductible)

```bash
# Pré-requis: Tauri desktop dispo
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20
pnpm run tauri dev 2>&1 | tee /tmp/tauri_smoke.log

# Marqueur attendu: "[chat][smoke] ChatWindow mounted"
# Marqueur attendu: "[chatEngine] → Appel aiOrchestrator.generate()"
# Marqueur attendu: "[chatEngine] ← Réponse orchestrator reçue"
```
