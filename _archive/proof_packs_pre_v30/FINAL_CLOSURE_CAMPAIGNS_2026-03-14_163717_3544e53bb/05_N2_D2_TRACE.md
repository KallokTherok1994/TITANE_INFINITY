# 05 N2 D2 TRACE

## N2 x3 (post-fix)

From `raw/01_n2_x3.log`:

- Run1: `mode=REMOTE reason=TIMEOUT provider=timeout-degraded` + `fallback_used=true`
- Run2: `mode=REMOTE reason=TIMEOUT provider=timeout-degraded` + `fallback_used=true`
- Run3: `mode=REMOTE reason=TIMEOUT provider=timeout-degraded` + `fallback_used=true`

## D2 forced-offline

From `raw/03_n2_forced_offline.log`:

- `mode=OFFLINE reason=FALLBACK_OFFLINE provider=offline`
- deterministic offline wording observed

From `raw/04_wrapper_last.log`:

- wrapper loaded env file
- `TAURI_BINARY_PATH(input)=.../src-tauri/target/release/titane-infinity`
- `TITANE_CONVERSATION_TIMEOUT_SECS=5`
- `OFFLINE_SIM=1`
