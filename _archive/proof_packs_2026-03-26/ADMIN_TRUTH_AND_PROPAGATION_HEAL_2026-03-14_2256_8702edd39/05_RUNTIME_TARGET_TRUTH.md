# RUNTIME TARGET TRUTH

Runtime cible confirme:

- Frontend route `/admin` via `src/App.tsx`.
- Chargement onglets via `src/features/admin/AdminPage.tsx`.
- Services backend via Tauri IPC quand runtime Tauri est disponible.

Contrainte prouvee:

- En execution Playwright web (Vite), certaines surfaces (Configuration) passent en mode degrade truthful quand Tauri est absent.
