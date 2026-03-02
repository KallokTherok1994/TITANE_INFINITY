# NETWORK + CAPABILITIES AUDIT

- One-door ciblé via services/api + tauri client central.
- Écarts détectés: occurrences `invoke` et URLs dans `src/**` nécessitent tri (commentaires/tests/docs inclus).
- Capabilities présentes dans `src-tauri/capabilities/*.json`; certaines remote URLs explicites (chat_ai).
- Verdict sécurité réseau/capabilities: NON PASS tant que tri complet + réduction minimale prouvée non effectués.
