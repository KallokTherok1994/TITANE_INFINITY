# V25 Runtime And UI Visible Truth

Runtime target actually used:
- `src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.2.0_amd64.AppImage`

Wrapper witness:
- `TAURI_BINARY_PATH` points to the rebuilt AppImage.
- `OFFLINE_SIM=0` was exported by wrapper.
- Source: `proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/tauri-wrapper.log`

Visible UI truth:
- `currentUrl=tauri://localhost/titane`
- `uiVisible=true`
- `whiteScreen=false`
- `inputPresent=true`
- `sendPresent=true`

Conclusion:
- UI shell/boot are not the blocker in V25.
- Real blocker is chat fullstack response quality and runtime state coherence.

## Rebuild confirmation

- Build proof: `proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/raw/02_tauri_build_appimage_v25.log`
- Postbuild run proof: `proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/raw/03_v25_run_chat_postbuild.log`

Postbuild visible truth remains:
- UI healthy and interactive
- response path still offline degraded (`OFFLINE/FALLBACK_OFFLINE/simulated`)
