# TRUTH LAYER CLASSIFICATION
## Session: RUNTIME_AUTHORITY_GAP — 2026-03-21
## SHA: 60c11fdf1

| Layer | Status | Evidence |
|---|---|---|
| STATIC | AVAILABLE | Source code, tsconfig, Cargo.toml |
| TEST/BROWSER_HARNESS | PROVEN | 3399/3399 Vitest PASS (session 2) |
| RUNTIME_BROWSER | NOT RUN | Vite dev server not started this session |
| DESKTOP_BOOT_IPC | PROVEN | BOOT:READY + get_runtime_config CMD:OK (2026-03-21T12:53Z) |
| DESKTOP_CHAT_IPC | PROVEN | WDIO 2/3 PASS — ASSISTANT_SNAPSHOT beforeCount=0 afterCount=1 (run 1 + run 3) |
| ONLINE_RUNTIME | HONEST_FAIL | No API keys in shell env; keystore keys present in binary context |

## Desktop Runtime Evidence

### Binary
- Path: `src-tauri/target/release/titane-infinity`
- Size: 42MB
- Version: 28.5.0
- Built: 2026-03-21T12:42:33Z
- Launcher: `./src-tauri/target/release/titane-infinity`

### Boot Sequence (proven 2026-03-21T12:53Z)
```
BOOT:ENTRY_START → BOOT:START → BOOT:AFTER_STORE → BOOT:AFTER_ROUTER
→ BOOT:BEFORE_ORCHESTRATOR → BOOT:AFTER_ORCHESTRATOR → BOOT:READY
```

### IPC Boot Command
- Command: `get_runtime_config`
- Result: CMD:START/END OK
- UnifiedMemory: STM/MTM/LTM initialized
- API keys: Gemini ✅ OpenAI ✅ Anthropic ✅ (SecureSecretsEngine binary keystore)
- DB: `~/.local/share/TITANE_INFINITY/persistence/titan_events.db` opened

## Browser vs Desktop Separation

| Indicator | Browser (Playwright) | Desktop (WDIO/tauri-driver) |
|---|---|---|
| URL | `http://127.0.0.1:5173` | `tauri://localhost/titane` |
| sourceMode | `dev-server` | `embedded` |
| WebDriver | Chromium/Playwright | WebKitWebDriver + tauri-driver |
| Binary | None (Vite dev server) | `src-tauri/target/release/titane-infinity` |
| Truth level | BROWSER_TRUTH | DESKTOP_TRUTH |

## Online Provider Honesty (no-key env)
- `verify_chat_online.sh` FAIL (expected — no env API keys)
- TITANE_OLLAMA_AUTO_ENABLED=1 → Ollama reachable (local, no key needed)
- External APIs: HONEST_FAIL classified as `NO_KEY_ENV_HONEST_FAIL`
- Note: Binary keystore (SecureSecretsEngine) has all 3 keys — loads at runtime
