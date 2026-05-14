# ROLLBACK

To rollback this qualification lot only:

git restore -- e2e/android/android-build-ui.browser.spec.ts e2e/android/android-build-ui.device.spec.ts scripts/e2e/validate-android-backends.sh tests/unit/scripts/androidBackendValidationScript.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md OLLAMA_RUNTIME_MAP.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/ANDROID_CHAT_UI_QUALIFICATION_2026-04-19.md proof_packs/ANDROID_CHAT_UI_QUALIFICATION_2026-04-19/GATE_REPORT.md proof_packs/ANDROID_CHAT_UI_QUALIFICATION_2026-04-19/VERDICT.md proof_packs/ANDROID_CHAT_UI_QUALIFICATION_2026-04-19/ROLLBACK.md

Notes:

- Do not restore `memory/memory_core_state.json`; it is runtime-local and unrelated.
- Do not restore the current unstaged `src-tauri/tauri.conf.json` drift here; it predates this lot and must be handled separately.