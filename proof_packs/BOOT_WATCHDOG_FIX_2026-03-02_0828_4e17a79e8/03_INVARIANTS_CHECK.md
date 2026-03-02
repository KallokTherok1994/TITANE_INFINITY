# INVARIANTS CHECK

## G_FRONTEND_NO_WEB (direct UI network primitives)

Command pattern:

```text
fetch\(|axios\.|new WebSocket\(|XMLHttpRequest|navigator\.sendBeacon
```

Scope/results:

```text
src/components/diagnostics/SplashWatchdog.tsx -> No matches found
src/components/** -> No matches found
src/pages/** -> No matches found
```

Verdict: PASS (no direct UI network primitive found in scanned UI scope).

## G_RING_INTEGRITY (architecture gate)

Command:

```text
pnpm test:architecture
```

Result:

```text
Test Files  1 passed (1)
Tests       3 passed (3)
```

Verdict: PASS.

## G_UI_REGISTRY_APPEND_ONLY

Command:

```text
git --no-pager diff -- registry/ui-events.jsonl
```

Evidence:

```text
@@ -100,3 +100,5 @@
+{"id":"ui-event-2026-03-02T10:40:00Z-splash-watchdog-boot-ready-alignment", ...}
+{"id":"ui-event-2026-03-02T13:05:00Z-splash-watchdog-no-silent-infinite-loading", ...}
```

Verdict: PASS (append-only additions; no deletions in diff hunk).
