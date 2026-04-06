# 22 - Confidence Decision Log

| Decision | Confiance | Action |
|---|---|---|
| stop E2E chat x3 (boucle longue) | C3_HIGH | interrompre et classer BLOCKED_BY_ENV |
| stop relaunch smoke x3 (blocage) | C2_MEDIUM | interrompre et classer BLOCKED_BY_ENV |
| memory restore x3 | C3_HIGH | executer complet |
| provider slow/fail x3 | C3_HIGH | executer complet |
| patch code | C1_LOW/C2_MEDIUM melange sans causal unique | interdit (pas de patch) |
