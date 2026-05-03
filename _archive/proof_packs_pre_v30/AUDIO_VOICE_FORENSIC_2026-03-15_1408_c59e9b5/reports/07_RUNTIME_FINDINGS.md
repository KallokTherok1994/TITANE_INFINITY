# 07 — FINDINGS RUNTIME

## LANE_RUNTIME : PARTIELLEMENT DISPONIBLE

cargo et rustc disponibles (1.94.0), mais aucun build exécuté dans cette session.
aplay disponible, devices détectés.

## Items Nécessitant Runtime — BLOCKED_ENV

| Item | Preuve Requise | Statut |
|---|---|---|
| Confirmer BUILD_PROVEN pour mock stubs | cargo build --features "custom-protocol,mock,audio-capture" | BLOCKED_ENV |
| IPC stop_speaking fonctionnel | app running + invoke test | BLOCKED_ENV |
| IPC is_speaking fonctionnel | app running + invoke test | BLOCKED_ENV |
| TTS piper/espeak subprocess | piper/espeak installé + paplay/aplay | BLOCKED_ENV (pactl absent) |
| STT whisper transcription | openai-whisper installé (~/.local/bin/whisper) | BLOCKED_ENV |
| cpal capture device | libasound2-dev + device actif | BLOCKED_ENV |
| VAD détection temps réel | audio stream + frames | BLOCKED_ENV |
| Wake word detection | audio stream + "TITANE" | BLOCKED_ENV |

## Commande de Validation Runtime Recommandée (< 30 min)
```bash
cargo build --features "custom-protocol,mock,audio-capture" 2>&1 | grep -E "error|warning" | head -30
```

## Résultat Attendu
Si mock stubs correctement appliqués → PASS compilation.
Si erreur symbol not found → patch manquant à identifier.
