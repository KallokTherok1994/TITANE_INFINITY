# BOOTSTRAP

generated_at=2026-03-05T12:52:36Z
pack=proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729

## git status --porcelain=v1

M docs/tests/UI_COVERAGE_MAP.md
M e2e/desktop/page-objects/uiPages.po.js
M e2e/desktop/ui-driver.wdio.js
M e2e/desktop/ui-ultra-full.e2e.js
M e2e/desktop/ui-ultra-smoke.e2e.js
M scripts/autoheal/autoheal_rules.jsonl
M scripts/e2e/run-desktop-suite.js
M src/hooks/useAudioSettings.ts
?? docs/MAP_UI_CHAT.md
?? proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729/
?? proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/
?? proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/
?? proof_packs/cross_platform_2026-03-05_0715_749530729/

## git rev-parse --short HEAD

749530729

## git log -20 --oneline

749530729 ci(prod): add ALSA dev package for tauri build job
bccee8b17 ci(prod): fix build dependency order and dedupe setup steps
0845eadb0 ci(prod): install build native deps before pnpm install
9f01e8723 fix(ci): unblock final100 format gate and stabilize launch checks
948914340 fix(check): resolve EngineSingularityState typing blocker for final100
420407b62 ci(prod): add libpng-dev for pnpm native deps in deploy pipeline
9da44f9cf ci(prod): require node 22 for final100/build in deploy workflow
36a1d22bb ci(prod): build tauri bundles in workflow_dispatch + tag-only artifact checks
6ac5679a6 ci: fix MAIN deploy/p6/mermaid workflow drift + autoheal
587e20e89 ci(gitguardian): remove invalid secrets context from job if
5dba46491 ci(gitguardian): reduce workflow permissions to read-only
a888ae07d ci(gitguardian): add explicit pass path when API key is missing
2b996a5c0 ci(gitguardian): include seal branches in push trigger
d31ef69f2 release(prod): publish 27.2.0 latest artifacts and checksums
dab17b847 chore(autoheal): append AH-2026-03-05-0004 and resolve registry conflict
f920f862a feat(e2e): add clickElementSafely helper to ui-driver
a96c978be chore(final): verification finale — proof pack UI_E2E_ULTRA + ui-driver helpers
5d5a89e08 docs(seal): VERDICT FINAL SCELLÉ — FIXPACK_20260304 PASS
8d7d0076b fix(ts): resolve EngineSingularityState type error in selfHealingEngine (Ring2 pure) feat(e2e): add desktop WDIO UI driver + smoke/full test suites docs(tests): add UI_COVERAGE_MAP with testid mapping
155bf644b chore(testids): format + stage UI testid additions (app-ready, ipc-ready, chat-ready, chat-error, chat-message)

## node/pnpm

v24.0.0
10.30.2

## rustc/cargo

rustc 1.91.1 (ed61e7d7e 2025-11-07)
cargo 1.91.1 (ea2d97820 2025-10-10)

## playwright

Version 1.58.2

## wdio

9.24.0
