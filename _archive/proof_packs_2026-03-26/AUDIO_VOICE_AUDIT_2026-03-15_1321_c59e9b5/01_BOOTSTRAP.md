# 01_BOOTSTRAP.md — Environnement système

## Date: 2026-03-15T13:21:56Z

## SHA: c59e9b5b3

## git status

Sur la branche MAIN — copie de travail propre

## git log -20 --oneline

c59e9b5b3 chore: commit tout le lot restant
ba6098c0e chore(release-proof): seal v28 go gates and launcher alignment
795c081be fix(android): add [lib] crate-type for Tauri mobile .so generation
0d90c92f1 fix(android): guard avatar_floating_commands — desktop-only window APIs
fbeaa2bbb fix(android): reqwest default-features=false to exclude native-tls/openssl-sys
f4c2e3282 test(e2e): use data-testid selector for max-tokens input with DOM fallback
734a33055 test(android): LOT-A4 — update db path resolver unit test
541208f75 test(e2e): stabilize preprod_admin_config test helpers + testId selector
5928fc237 fix(android): LOT-A6 — register tauri-plugin-fs Rust side
37981db36 fix(android): LOT-A4 — conversation_engine db path persistent on Android
7e782ffbe fix(android): LOT-A3/A5 — reqwest rustls-tls, remove remote.urls from capabilities
c86f581a4 docs(proof): seal FINAL_PREPROD_UI_RUNTIME_CERTIFICATION proof pack + autoheal entries
0844939eb docs(proof): verdict FINAL session ANDROID — 12 fixes, QUALIFIED, roadmap env
f112e2594 fix(android): PHASE E/G — hardcoded UI paths via VITE_WORKSPACE_DIR
41d2b3be9 fix(android): PHASE D — UI mobile safe-area + zoom media query
8297bfbca docs(proof): mise à jour verdict final session Android QUALIFIED + roadmap env
c5abe3eb2 fix(android): guard Ollama auto-start spawn — desktop only
4c9799994 fix(android): Ollama endpoint env-configurable pour Android LAN
b7b086daf fix(android): guard STOPLINE#5 cpal + STOPLINE#4 pre_boot path
c1b5c5d23 feat(android): bootstrap cartographie + guard STOPLINE#4 devops

## Versions

- node: v18.19.1 (AVERTISSEMENT: <20.0.0 — pnpm tauri inaccessible via pnpm global)
- pnpm: 10.30.2
- cargo: 1.94.0
- rustc: 1.94.0
- pnpm tauri: ERR_PNPM_UNSUPPORTED_ENGINE (Node v18 < v20 requis)

## Structure src-tauri/src/audio/

asr.rs | capture.rs | commands.rs | mod.rs | recorder.rs | recording_engine.rs | streaming_engine.rs | vad.rs | voice_fingerprint.rs | whisper_streaming.rs

## Structure src-tauri/src/commands/

whisper_commands.rs (et 30+ autres commands)

## Note critique

pnpm tauri build / pnpm run test non exécutables depuis le shell shell (Node v18).
cargo test en cours de compilation (très long, non utilisé pour verdict — BLOCKED).
