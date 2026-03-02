# UX NO-SILENCE AUDIT

- `PageLoadingFallback` affiche alerte après 12s + action utilisateur.
- `useChat` avait un reset failsafe silencieux potentiel; auto-fix appliqué: erreur visible `IPC_TIMEOUT`.
- Contrat UX: plus de fin de loading sans cause affichée sur ce chemin de timeout.
