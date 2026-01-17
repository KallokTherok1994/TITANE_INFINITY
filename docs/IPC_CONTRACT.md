# IPC CONTRACT — TITANE∞ Chat

## Contrat Backend→Frontend
- Réponse: `{ok: boolean, content?: string, error?: {code: string, message: string, recoverable: boolean}, meta?: {correlationId: string, provider: string, latencyMs: number}}`
- Erreurs: Toujours {ok:false}, pas de silence/panic.

## Frontend
- Pas de bulle vide.
- Timeout 30s: Erreur UI + bouton "Réessayer".

## Backend
- Erreurs converties en {ok:false}.