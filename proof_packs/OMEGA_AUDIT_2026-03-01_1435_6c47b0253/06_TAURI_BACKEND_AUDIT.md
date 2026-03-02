# TAURI BACKEND AUDIT

- Entrée backend détectée: `src-tauri/src/main.rs`.
- Config Tauri active et capabilities déclarées dans `src-tauri/tauri.conf.json`.
- IPC canonique côté frontend via `src/lib/tauriClient.ts` + `secureInvoke`/`serviceInvoker`.
- Écart structurel: surface allow/permissions très large dans `tauri.conf.json` (review deny-by-default incomplète).
- Build prod x3 non exécuté (tokens stricts absents).
