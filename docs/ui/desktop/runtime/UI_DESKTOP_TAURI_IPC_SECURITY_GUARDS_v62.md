# UI_DESKTOP_TAURI_IPC_SECURITY_GUARDS_v62

**Mission:** TITANE UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62  
**Date:** 2026-05-10 | **Version:** v33.0.12

---

## Security Guard Layers

### Layer 1: Production Gate
```typescript
// Bridge ONLY registers when localStorage flag is explicitly set
function isE2EProbeEnabled(): boolean {
  return typeof window !== 'undefined' && 
         window.localStorage?.getItem('TITANE_E2E_PROBE') === '1';
}
```
In production: flag never set → bridge never registers → zero attack surface.

### Layer 2: Allowlist Gate
Only 8 pre-approved commandIds accepted. Any unknown commandId returns `COMMAND_NOT_ALLOWLISTED` with `ok=false`.

### Layer 3: Destructive Pattern Guard
17 destructive patterns blocked before any IPC call:
```
delete, remove, drop, purge, erase, clear, reset, wipe,
write, set_, put_, push_, update, mutate, execute, run_, send_
```
CommandId matching any pattern returns `COMMAND_BLOCKED_DESTRUCTIVE` with `ok=false`. No IPC call attempted.

### Layer 4: Response Redaction
```typescript
function redactMessage(msg: string): string {
  return msg
    .replace(/\/home\/[^/\s"']+/g, '/home/[REDACTED]')
    .replace(/\/Users\/[^/\s"']+/g, '/Users/[REDACTED]')
    .replace(/(token|secret|password|key|auth)[=:\s][^\s"']+/gi, '$1=[REDACTED]')
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [REDACTED]');
}
```

### Layer 5: Response Shape Only
Raw values never returned to WDIO. Only field names (keys) returned:
```typescript
function extractResponseShape(obj: unknown): string[] {
  // Returns Object.keys() only — never values
}
```

### Layer 6: Single Write
`window.__TITANE_E2E_IPC_PROBE__` registered with:
```typescript
Object.defineProperty(window, WINDOW_KEY, {
  value: bridgeApi,
  writable: false,    // Cannot be overwritten
  configurable: false // Cannot be deleted or redefined
});
```

---

## Unit Test Coverage

22 tests in `e2eIpcProbeBridge.test.ts`:
- Production guard: no flag → no registration
- Unknown commandId → `COMMAND_NOT_ALLOWLISTED`
- Destructive commandId → `COMMAND_BLOCKED_DESTRUCTIVE`
- Response shape stability
- Redaction applied to errorMessageRedacted
- getLastResult / clearLastResult
