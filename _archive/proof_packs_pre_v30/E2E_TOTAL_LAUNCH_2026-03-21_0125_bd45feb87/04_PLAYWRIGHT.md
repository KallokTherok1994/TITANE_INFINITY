# Playwright Browser E2E Results

Command: pnpm exec playwright test e2e --reporter=line
Project: chromium (Vite dev server http://127.0.0.1:5173)

BEFORE FIXES: 34 passed / 10 failed
AFTER FIXES:  39 passed / 5 failed

RESOLVED DEFECTS:
  D1: PATCH-010-policy-gate.spec.ts — [role="main"] CSS attribute selector matched nothing
      AppShell <main> has no explicit role="main" attribute (only implicit HTML semantic)
      FIX: added role="main" to AppShell.tsx <main> element
  D2: total-dev-smoke.spec.ts (all 9) — BrowserRouter + hash URL (#/total-dev) = root, TotalDevPage never rendered
      FIX: s/#\/total-dev/\/total-dev/g (HTML5 history routes, no hash)
  D3: total-dev-smoke.spec.ts — waitForLoadState('networkidle') caused Vite server crash
      App polls Ollama continuously → networkidle never reached → test timeout → Vite killed
      FIX: s/networkidle/load/g
  D4: total-dev-smoke.spec.ts — text=TOTAL_DEV strict mode violation (3 matches)
      FIX: .first() appended to locator
  D5: total-dev-smoke.spec.ts — text=LOCKED strict mode violation (2 matches)
      FIX: .first() appended to locator
  D6: total-dev-smoke.spec.ts — input[placeholder*="code"] not found
      Actual placeholder: "Token unlock..."
      FIX: input[placeholder*="unlock"]

REMAINING BLOCKED (5 tests, product constraint):
  total-dev-smoke: Tabs, ChatDevPanel, ConsoleDevPanel, DevActionsPanel, No console errors
  REASON: All require TOTAL_DEV UNLOCK state, validated via Tauri IPC + Rust SHA-256
  In browser E2E mode (no Tauri), IPC fails → LOCKED state persists → tabs not rendered
  CLASSIFICATION: DESKTOP_TARGET_UNPROVEN — must be certified via e2e:desktop (WDIO)

FINAL SCORE: 39/44 PASS | 5 BLOCKED_TAURI
