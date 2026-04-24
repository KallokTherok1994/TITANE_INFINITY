# 01 BOOTSTRAP

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Git State

```
HEAD: e91124efc (MAIN)
Branch: MAIN
Tag: origin/MAIN
```

## Modified files (uncommitted)

```
 M src-tauri/src/audio/commands.rs              ← PATCH-01 appliqué
 M scripts/autoheal/autoheal_rules.jsonl        ← AH-2026-03-15-0211
 M e2e/desktop/admin-design-truth.wdio.test.js
 M e2e/desktop/chat-ar20.wdio.test.js
 M e2e/desktop/page-objects/uiPages.po.js
 M e2e/desktop/ui-connectivity-critical.wdio.test.js
 M e2e/desktop/ui-driver.wdio.js
 M e2e/desktop/ui-ultra-smoke.e2e.js
 M e2e/desktop/v22_visible_real_ui_cert.wdio.test.js
 M e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js
 M e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js
 M scripts/e2e/run-desktop-suite.js
 M scripts/update-desktop-icon.sh
 M src-tauri/data/ui_theme.json
 M src-tauri/tauri.conf.json
 M src/components/twin/TwinEvolutionPanel.tsx
 M src/config/aiTimeouts.config.ts
 M src/features/audio-center/AudioCenterPage.tsx
 M src/features/audio-center/services/audioService.ts
 M src/features/chat/ThinkingPanel.tsx
 M src/features/design-center/DesignCenterPage.tsx
 (+ 9 autres non liés à l'audio)
```

## Cible runtime réelle

- Mode: Tauri desktop (production binary target)
- Rings impactés: R2 (src-tauri/src/audio/ commands), R3 (IPC), R4 (frontend audio-center)
- Surfaces réseau: aucune (audio est local)
- Binary cible: src-tauri/target/release/titane-infinity

## Commandes Tauri audio attendues (toutes présentes)

- get_audio_output_devices
- get_audio_input_devices
- set_audio_output_device
- set_audio_input_device
- test_microphone
- test_tts (utilisé pour testSpeaker)
- tts_speak / tts_stop
- get_audio_device_config / save_audio_device_config

## Log -20

```
e91124efc fix(runtime): align stable version authority
4e47effcc fix(deploy): stabilize certified artifact metadata
a987137c8 chore(governance): capture prod retry incident + seal proof addendum
023f4d2a8 chore(deploy): retry certified prod deploy to latest
10bee2e17 fix(rust): remove sync fork() from async Ollama hot-path
2e095f145 chore(snapshots): update 5 stale snapshots
13dc15d5e fix(tests): align timeout + menu tests
c53dc2592 fix(e2e): stabilize admin design truth-chain desktop cert
f537051a1 chore: apply pending changes
3f8900a28 docs(proof): DEV_STATS_FUSION v29.1
dcbbf5ded fix(audio): AUDIO_CERT_2026-03-15 lot-3 — isMuted detection
af6e2cd89 fix(telemetry): ADMIN_SANTE_PROD_RUNTIME_2026-03-15
2cdd4bb15 fix(audio-video): AUDIO_VIDEO_CERT_2026-03-15
073644a19 feat(dev): DEV_STATS_FUSION v29.1
24fd31fc4 fix(design): UIThemeProvider silent fallback
4a77788ee fix(audio): AUDIO_CERT_2026-03-15 lot-2 — device-targeted capture/playback
45ded9460 fix(audio): AUDIO_CERT_2026-03-15 — wpctl discovery, canonical AudioDeviceConfig
```
