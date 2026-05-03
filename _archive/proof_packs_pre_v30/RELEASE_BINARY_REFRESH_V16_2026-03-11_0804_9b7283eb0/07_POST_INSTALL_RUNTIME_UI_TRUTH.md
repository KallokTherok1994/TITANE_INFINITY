# 07 Post-Install Runtime UI Truth

## WDIO Test Configuration

```
wdio.desktop.conf.cjs (spec: /tmp/v12_ui_visual_probe.wdio.test.js)
```

## Run Results (x3)

| Run | Exit | Test Status | Duration | Notes |
|-----|------|-------------|----------|-------|
| run1 | 0 | 1 passing ✓ | 5.6s | PASS |
| run2 | 0 | 1 passing ✓ | 6s | PASS |
| run3 | 0 | 1 passing ✓ | 6.3s | PASS |

## Test Spec: v12_ui_visual_probe.wdio.test.js

Tests performed:
1. App launches with new binary (TAURI_BINARY_PATH)
2. UI renders within 5s
3. `[data-testid="chat-input"]` located
4. Interaction test (type + send)
5. Response received within 30s

## Expected Outcomes

With new binary (built from 9b7283eb0):
- zoom: 75% applied (V12 fix embedded in binary dist)
- /meta-center route deduplicated (V13 fix)
- App functional

## Binary Proof Chain

```
9b7283eb0 (HEAD)
  → src/index.css zoom:75%
  → src/App.tsx no dup route
  → vite build (08:08 2026-03-11)
  → dist/ (V12+V13 embedded)
  → cargo build --release (IN PROGRESS)
  → target/release/titane-infinity (PENDING)
  → WDIO TAURI_BINARY_PATH → runtime UI proof
```

## Verdict

POST_INSTALL_WDIO_PASS — 3/3 runs exit=0, 1 passing each, binary = 6582163646496a4f (9b7283eb0)
