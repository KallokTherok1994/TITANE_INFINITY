# Implementation Plan — LOCK 5: DESKTOP_SCOPED_OPERATOR_V1

## Overview

Build the first truthful desktop perception layer (PERCEPTION_STACK sub-lock) for TITANE∞. This closes the single causal lock preventing LOCK 5 progress: no way to perceive desktop surface truthfully.

## Current State

- `screen_capture`: ABSENT
- `active_window_discovery`: ABSENT
- `raw_input_injection`: ABSENT
- `window_controls`: REACHABLE (foundation)
- `kill_switch`: REACHABLE (backend ready)
- `pause_resume`: ABSENT
- `handoff`: ABSENT

## Scope

Minimal truthful desktop perception layer:

1. Active window discovery (window title, process name)
2. Window title/process read
3. Allowed surface model
4. Denied zone model
5. Session binding to session_authority

**NOT in scope** (future sub-locks):

- Screenshot capture (CRITICAL risk, requires separate sub-lock)
- Raw input injection (CRITICAL risk, requires separate sub-lock)
- Kill/pause/handoff UI (CONTROL_SURFACES sub-lock)

## Files

### New Files

1. `src/services/operator/desktopTypes.ts`
   - DesktopPerception interface
   - DesktopSession interface
   - DesktopOperatorConfig interface
   - DesktopSurfaceInfo interface
   - DesktopScopeCategory enum

2. `src/services/operator/desktopPerception.ts`
   - openDesktopSession()
   - closeDesktopSession()
   - getDesktopSessionStatus()
   - desktopGetActiveWindow()
   - desktopListWindows()
   - desktopGetConfig()
   - isDesktopPerceptionAvailable()

3. `src-tauri/src/commands/desktop_perception.rs`
   - desktop_open_session
   - desktop_close_session
   - desktop_get_session_status
   - desktop_get_active_window
   - desktop_list_windows
   - desktop_get_config

4. `src/__tests__/services/operator/desktopPerception.test.ts`
   - Tests for session lifecycle
   - Tests for active window discovery
   - Tests for capability classification honesty

### Modified Files

5. `src/services/operator/types.ts`
   - Add desktop_perception to KNOWN_CAPABILITIES

6. `src-tauri/src/commands/capability_commands.rs`
   - Add desktop_perception to static registry

7. `src-tauri/src/main.rs`
   - Register desktop_perception commands

## Functions

### New Functions

**TypeScript**:

- `openDesktopSession(allowedSurfaces?: string[]): Promise<DesktopSession>`
- `closeDesktopSession(sessionId: string): Promise<boolean>`
- `getDesktopSessionStatus(sessionId: string): Promise<DesktopSession>`
- `desktopGetActiveWindow(sessionId: string): Promise<DesktopPerceptionResult>`
- `desktopListWindows(sessionId: string): Promise<DesktopPerceptionResult>`
- `getDesktopOperatorConfig(): Promise<DesktopOperatorConfig>`
- `isDesktopPerceptionAvailable(): Promise<boolean>`

**Rust**:

- `desktop_open_session()` — Create governed desktop perception session
- `desktop_close_session()` — Close session
- `desktop_get_session_status()` — Get session state
- `desktop_get_active_window()` — Get active window info (title, process)
- `desktop_list_windows()` — List visible windows
- `desktop_get_config()` — Get operator config

## Dependencies

No new external dependencies. Uses existing:

- `@tauri-apps/api` (invoke)
- `serde` (Rust serialization)
- `chrono` (Rust timestamps)
- `std::process::Command` (Rust system calls)

## Testing

### Test Strategy

- Unit tests for TypeScript service (mocked IPC)
- Integration tests for Rust commands
- x3 rerun for critical truth paths

### Test Files

- `src/__tests__/services/operator/desktopPerception.test.ts`

### Test Cases

1. Session open/close lifecycle
2. Active window discovery returns honest truth
3. Window list returns honest truth
4. Capability classification updates honestly
5. Denied surfaces remain blocked

## Implementation Order

1. Create `desktopTypes.ts` (types)
2. Create `desktop_perception.rs` (Rust backend)
3. Register commands in `main.rs`
4. Create `desktopPerception.ts` (frontend service)
5. Update `types.ts` (add capabilities)
6. Update `capability_commands.rs` (add to registry)
7. Create `desktopPerception.test.ts` (tests)
8. Run tests
9. Create proof pack
10. Issue verdict
