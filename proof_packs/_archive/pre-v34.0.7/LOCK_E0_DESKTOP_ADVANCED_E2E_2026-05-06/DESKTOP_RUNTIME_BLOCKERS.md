# DESKTOP_RUNTIME_BLOCKERS — LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06

## Documented Blockers per Lane

| Lane | Blocker Type | Exact Blocker | Next Action |
|------|-------------|--------------|-------------|
| AI-DESKTOP-03 | LIVE_CONVERSATION | IntelligenceDecisionEnvelope emitted during live conversation only. B2 schema proven via Vitest (26 PASS). | C0 lock: run WDIO with live Ollama + parse console output for envelope |
| AI-DESKTOP-04 | LIVE_CONVERSATION | Provider routing logged during conversation. No live Ollama in E0 headless run. | C0 lock: parse provider routing from wdio console after conversation |
| AI-DESKTOP-05 | OFFLINE_SIM_MISSING | Fallback requires OFFLINE_SIM=1 env wired in WDIO session. Not set in E0. | F0 lock: add OFFLINE_SIM=1 to wdio.desktop.conf.cjs env for offline spec |
| AI-DESKTOP-07 | FEATURE_FLAG | VITE_TITANE_HYBRID_MEMORY_GRAPH_ENABLED=false (default, production). | F1 lock: explicit hybrid-memory activation lock with T4 approval |
| AI-DESKTOP-08 | RUNTIME_STATE | Knowledge items require DB state not guaranteed in E0 headless run. | Contract-proven. F0: seed knowledge item and verify retrieval |
| AI-DESKTOP-09 | UI_SURFACE | Research panel not confirmed reachable without route navigation. | F0: navigate to research surface explicitly in WDIO spec |
| AI-DESKTOP-10 | LIVE_NETWORK | Sourced response requires live network + sourced content. | F0: seeded test with mock sourced content |
| AI-DESKTOP-11 | PIPELINE_MODE | D1 OMEGA handler in shadow mode only. Pipeline trace injection blocked until D2 activation. | D2 activation lock with T4 approval |
| AI-DESKTOP-12 | PIPELINE_MODE | D2 singularity events passive. No visible desktop trace until D3+B2 integration. | D3 activation lock with T4 approval |
| AI-DESKTOP-13 | UI_SURFACE_MISSING | No `data-testid=twin-consent-panel` exists in current build. D3 contract proven (84/84). | D5: build twin consent UI surface with T4 approval |
| AI-DESKTOP-15 | C3_SECURITY_PLANNED | C3 security lane not yet implemented. No injection-blocking contract. | C3 security contract lock: implement injection blocking tests |
| AI-DESKTOP-19 | LIVE_OLLAMA | Online-first trace requires live Ollama round-trip. Not guaranteed in E0 headless. | F0 with TITANE_E2E_OLLAMA_ACTIVE=1 |
| AI-DESKTOP-20-full | MULTI_DEPENDENCY | Full chain blocked pending C0+C1+C2+C3+D0–D4 activations. Smoke PASS. | F0 complete chain lock |

## Binary Policy Blocker

| Blocker | Resolution |
|---------|-----------|
| `STALE_RELEASE_BINARY` — `tauri.conf.json` newer than release binary | Bypassed with `TITANE_ENFORCE_BINARY_FRESHNESS=0` for E0 test run. Production rebuild would restore freshness. |
