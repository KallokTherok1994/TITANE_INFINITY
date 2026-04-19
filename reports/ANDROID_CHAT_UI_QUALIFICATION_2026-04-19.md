# ANDROID_CHAT_UI_QUALIFICATION_2026-04-19

Date: 2026-04-19
Scope: Android conversation UI/runtime truth, Ollama endpoint qualification, browser+device proof

## Facts

- La surface canonique /titane?tab=conversation reste la seule autorite UI pour le chat Android.
- La lane Android browser ajoute trois preuves runtime cibles: quota `RATE_LIMIT`, continuite connaissance+memoire sur la lane mock canonique, et citations inline online.
- La lane Android device capture maintenant la configuration runtime installee dans `runtime_settings_v1.json` et la republie aussi en `runtime_config.json`.
- `scripts/e2e/validate-android-backends.sh` exige desormais un `ollamaUrl` LAN non-loopback, un `ollamaModel` explicite, un endpoint `${ollamaUrl}/api/tags` vivant et la presence du modele configure dans l inventaire reel.

## Executed Proofs

- `bash scripts/e2e/validate-android-backends.sh`: PASS, 7 checks passed, 0 failed.
- `runTests tests/unit/scripts/androidBackendValidationScript.test.ts`: PASS, 6 tests passed.
- `corepack pnpm exec playwright test e2e/android/android-build-ui.browser.spec.ts --project=chromium --project=chromium-android-ui --reporter=line`: PASS, 44 tests passed.
- `TITANE_E2E_ANDROID_DEVICE=1 corepack pnpm exec playwright test e2e/android/android-build-ui.device.spec.ts --reporter=line`: PASS, 1 test passed.

## Observed Runtime Truth

- Runtime config Android lue sur l application installee: `ollamaUrl=http://192.168.2.16:11434`, `ollamaModel=llama3.1:latest`.
- Endpoint probe: `http://192.168.2.16:11434/api/tags` repond avec JSON valide et annonce `llama3.1:latest`.
- Les nouvelles preuves Android browser sont vertes sur les deux projets `chromium` et `chromium-android-ui`.

## Verdict

PASS — La qualification Android chat/UI ajoute une preuve honnete sur quota mobile, memoire/connaissance mock canonique, citations inline et ciblage Ollama/model de l APK installee, sans modifier la topologie conversationnelle active.