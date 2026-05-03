# 01 REENTRY BOOTSTRAP

## Repo Truth
- HEAD: 3544e53bb
- Branch: MAIN
- Status: 15 M files + 2 untracked proof packs

## Continuity from previous sessions
- TIMEOUT_USEFUL_WINDOW_TUNING pack: VERDICT=PASS (backend 20→60s, frontend 75s)
- FINAL_CLOSURE_CAMPAIGNS pack: VERDICT=BLOCKED (Campaign-B all TIMEOUT, 22s)

## Runtime Truth
- Ollama: available (gemma2:2b, qwen2.5, etc.)
- gemma2:2b warm: 2.5s generate
- gemma2:2b with long prompt: 5.9s generate
- Release binary: src-tauri/target/release/titane-infinity (March 14)
- AppImage: deployment/v27.0.2_prod_final/... (March 7, pre-patch)
