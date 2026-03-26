# 02_SCOPE.md — Cartographie des surfaces Android

## Surface Android Native
- Init Android: ABSENT (tauri android init jamais exécuté)
- src-tauri/android/: ABSENT
- src-tauri/gen/: EXISTS mais contient uniquement schemas/ (pas de projet Android)
- AndroidManifest.xml: ABSENT
- build.gradle: ABSENT
- Signing config: ABSENT

## Surface UI (frontend)
- Framework: React + TypeScript + Tailwind CSS
- Responsive: non qualifié pour mobile (desktop-first)
- Safe-area: non implémenté
- Viewport mobile: non qualifié
- Touch targets: non qualifiés
- Keyboard mobile: non qualifié
- src/: ~5 000+ fichiers TS/TSX

## Surface IPC
- Tauri v2 invoke() utilisé dans ~20+ fichiers src/
- Contrat {ok, content, error}: présent dans les types, vérification runtime partielle
- Timeouts: présents dans certains handlers, non uniformes
- Commandes exposées: ~60+ (voir main.rs handler)

## Surface Réseau
- One Door: IPC → Rust reqwest → Ollama/Gemini (CONFORME I1/I2/I6)
- Ollama endpoint: `http://127.0.0.1:11434` (par défaut)
- Configurable via env var: `OLLAMA_BASE_URL` ou `OLLAMA_URL` ✓
- Gemini: via `https://generativelanguage.googleapis.com` (backend Rust)
- UI réseau direct: BLOQUÉ par httpClient.ts TAURI-ONLY mode ✓

## Surface Storage
- app_data_dir(): utilisé correctement pour la majorité des paths ✓
- STOPLINE #4: devops.rs — `/home/titane/Documents/TITANE_INFINITY` hardcodé ✗
- STOPLINE #4: pre_boot_validation.rs — dirs::home_dir() + "Documents/TITANE_INFINITY" ✗
- main.rs logs: dirs::home_dir().join(".titane").join("logs") — fallback desktop ✗ (mineur)
- rusqlite bundled: compatible Android ✓
- identity.json, memory, vault: via app_data_dir() ✓

## Surface Android Native (plugins)
- tauri-plugin-dialog 2.6: Android OK ✓
- tauri-plugin-clipboard-manager 2.0: Android OK ✓
- cpal 0.15 (audio): OPTIONAL mais pas de garde mobile — STOPLINE #5 ✗
- ort (ONNX): OPTIONAL, pas de garde mobile (moins critique)

## Écarts bloquants priorisés
1. [P0-ENV] Android SDK/NDK/Java absent → build impossible
2. [P0-ENV] Rust targets Android non installés
3. [P1-CODE] STOPLINE #4: devops.rs hardcoded path (commandes DevOps inutiles sur Android)
4. [P1-CODE] STOPLINE #5: cpal audio commands sans garde mobile
5. [P2-CODE] Ollama URL localhost → besoin config LAN pour Android (env var présente)
6. [P2-UI] CSS responsive/safe-area non qualifié
7. [P2-UI] Touch targets non vérifiés

## Lots priorisés
- LOT_ENV: Prérequis Android SDK (action utilisateur)
- LOT_GUARD_DEVOPS: Guard devops commands (30 min, POSSIBLE)
- LOT_GUARD_CPAL: Guard audio/cpal commands mobile (30 min, POSSIBLE)
- LOT_ANDROID_INIT: `tauri android init` (BLOCKED environnement)
- LOT_OLLAMA_ANDROID: Config Ollama LAN documentation (30 min, POSSIBLE)
- LOT_UI_MOBILE: CSS safe-area + responsive (après init)
