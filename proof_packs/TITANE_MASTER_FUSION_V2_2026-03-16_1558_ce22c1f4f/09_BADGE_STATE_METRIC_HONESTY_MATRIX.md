# 09 - Badge State Metric Honesty Matrix

| Surface | Risque de mensonge | Preuve | Statut |
|---|---|---|---|
| provider ok | verifie via test-chat-system x3 | logs 31_PROVIDER... | PASS |
| memory restored | verifie via chat_restore_x3 x3 | logs 30_MEMORY... | PASS |
| mode chat actif | assistant absent en E2E | logs 27_E2E... | BLOCKED |
| relaunch durable | non prouve | logs 29_RELAUNCH... | BLOCKED |
