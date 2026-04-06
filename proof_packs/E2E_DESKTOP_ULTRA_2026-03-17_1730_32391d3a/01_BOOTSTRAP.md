# 01_BOOTSTRAP.md

## Git State
```
HEAD: 32391d3ab
Branch: MAIN
Modified (unstaged):
  M  e2e/desktop/audio-tts-runtime-controls.wdio.test.js
  M  proof_packs/AUDIO_TTS_CONTINUE_2026-03-17_1519_c02872290/GATE_REPORT.md
  M  proof_packs/AUDIO_TTS_CONTINUE_2026-03-17_1519_c02872290/VERDICT.md
```

## Recent Log (last 5)
```
32391d3ab fix(guard): exclude devSudo diagnostic strings from Ollama direct-access guard
e5515d71f feat(heal+telemetry+persona): wire autoHealEngine to circuitBreaker, activate telemetry at boot, clarify persona path
9b13edcd1 audit(agents): truth-align ecosystem — remove fake defaults, label stubs, archive cosmetic workflows
511be067c fix(ipc): register 13 qa_monitoring + reality_renderer commands [FIX-012]
d818b0e5b fix(ipc): register time_commands::get_travel_stats + delete_snapshot [FIX-011]
```

## Tooling Proof
```
node:    v18.19.1  — INCOMPATIBLE (requires >=20.0.0) — pnpm proceeds with warning
pnpm:    10.30.2
cargo:   1.94.0 (85eff7c80 2026-01-15)
rustc:   1.94.0 (4a4ef493e 2026-03-02)
tauri-driver:   /home/titane-os/.cargo/bin/tauri-driver (present)
WebKitWebDriver: /usr/bin/WebKitWebDriver (present)
@tauri-apps/cli: 2.10.0 (devDeps)
DISPLAY: :1 (env set, Xvfb not running at bootstrap — started for E2E run)
```

## Artifact State
```
Release binary: src-tauri/target/release/titane-infinity
  Size: 37,277,392 bytes
  Modified: 2026-03-17 13:14:10 -0400
  Status: FRESH (same day as HEAD, built before current patches)

AppImage fallback: deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage
  Status: STALE (v27.0.2, HEAD is 32391d3ab = post-v27.0.2)

Dist frontend: dist/ (not checked here — E2E build uses vite build + tauri build)
```

## Governance Gates at Bootstrap
```
bash scripts/autoheal/detect_recurrence.sh → PASS: G_AH_RECURRENCE_GUARD_PASS, entries=392
bash scripts/verify_instructions.sh         → SUMMARY: PASS=20 FAIL=0
```

## BLOCKED_TOOLING Assessment
Node v18 incompatibility: LOW RISK — pnpm/npm scripts still run (engine check is advisory in pnpm).
Display dependency: MUST start Xvfb before desktop E2E.
Install script (if required, without sudo):
```bash
# Node 20+ via nvm (if not available):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc && nvm install 20 && nvm use 20
```
