# 08_DEVICE_MATRIX

## Contexte

Hardware camera: NON DISPONIBLE dans environnement de test BACKGROUND.
Certification camera hardware: IMPOSSIBLE.

## Matrice dispositifs (partielle)

| device_label | frontend_detected | selectable | preview_opens | frame_received | stable_x3 | classification | proof_ref |
|---|---|---|---|---|---|---|---|
| [HARDWARE ABSENT] | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | BLOCKED_HARDWARE | 05_RUNTIME_RECERT.md |

## Note

Seule la certification statique (UI conditionnée, disclaimer) peut être obtenue sans hardware.
Toute claim de preview ou frame nécessite execution Tauri native avec camera physique branchée.

**Verdict: BLOCKED_HARDWARE**
