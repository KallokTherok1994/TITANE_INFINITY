# 07_ANDROID_SMOKE_INDEX.md

## Android Smoke Tests: BLOCKED

Aucun smoke Android exécutable dans cet environnement.

## Tests smoke à effectuer après init Android

1. Build APK debug: `tauri android build --debug`
2. Install sur émulateur: `adb install app-debug.apk`
3. Launch app: `adb shell am start -n com.titane.infinity/.MainActivity`
4. IPC test: ouvrir chat, envoyer message, vérifier réponse
5. Ollama LAN test: configurer OLLAMA_BASE_URL vers machine LAN, vérifier provider
6. Storage test: vérifier que app_data_dir() résout vers /data/data/com.titane.infinity/
7. Provider status test: chat_get_providers_status → état explicite

STATUS: BLOCKED (environnement)
