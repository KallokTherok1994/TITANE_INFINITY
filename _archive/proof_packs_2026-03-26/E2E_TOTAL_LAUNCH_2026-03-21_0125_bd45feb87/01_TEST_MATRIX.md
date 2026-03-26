# TEST_MATRIX

| Layer | Runner | Config | Tests | Result |
|-------|--------|--------|-------|--------|
| Vitest unit/integration | pnpm exec vitest run | vitest.config.ts | 3384 | PASS 229/229 files |
| Rust unit | cargo test --lib | src-tauri/ | 4456 | PASS 4456/4456 |
| Playwright browser | playwright test e2e | playwright.config.ts | 44 | 39 PASS / 5 BLOCKED_TAURI |
| Playwright tests/e2e | playwright test (chromium-tests-e2e) | playwright.config.ts | included above | PASS |
| WDIO desktop | pnpm e2e:desktop | wdio.desktop.conf.cjs | NOT RUN (requires tauri-driver + built binary) | DESKTOP_TARGET_UNPROVEN |

TARGET_AUTHORITY_MAP:
- browser truth: Playwright chromium (Vite dev server, no Tauri IPC)
- desktop truth: WDIO (Tauri binary, tauri-driver) — NOT run (requires explicit e2e:desktop build gate)
- Rust truth: cargo test --lib
- TS/React truth: Vitest (happy-dom)
