# IPC Invocations Index

**Date:** 2026-02-07  
**Source:** `src/lib/tauriCommands.ts` (canonical registry)  
**Total Commands:** 180+

---

## Command Registry Source

**File:** `src/lib/tauriCommands.ts` (275 lines)  
**Purpose:** Canonical source of all Tauri IPC commands (PHASE_2 invariant)

**Invariants:**
- ✅ No duplication elsewhere in codebase
- ✅ No new command introduced without audit
- ✅ Each command has typed wrapper in `tauriClient.ts`

---

## Command Categories (Top Groups)

### Chat & Conversation (10+ commands)
- `CHAT_SEND_MESSAGE` - Send chat message
- `CHAT_GET_PROVIDERS_STATUS` - Get AI provider status
- `CHAT_MODE_CHANGE` - Change chat mode
- `CHAT_MODE_SYNC` - Sync chat mode state
- `CONVERSATION_GENERATE` - Generate conversation (OMEGA v2)
- `CONVERSATION_RESET` - Reset conversation
- `DELETE_CONVERSATION` - Delete conversation

### Memory & State (15+ commands)
- `CLEAR_ALL_MEMORY` - Clear all memory
- `CLEAR_MEMORY_CACHE` - Clear memory cache
- `MEMORY_GET_STATE` - Get memory state
- `MEMORY_SAVE_STATE` - Save memory state
- `DELETE_STATE` - Delete state
- `LOAD_STATE` - Load state
- `SAVE_STATE` - Save state snapshot

### AutoHeal (20+ commands)
- `AUTOHEAL_INIT_COGNITIVE` - Init cognitive module
- `AUTOHEAL_INIT_NARRATIVE` - Init narrative engine
- `AUTOHEAL_INIT_TTS` - Init TTS engine
- `AUTOHEAL_CLEAR_NARRATIVE` - Clear narrative
- `AUTOHEAL_CLEAR_PIPELINE` - Clear processing pipeline
- `AUTOHEAL_RESET_COGNITIVE` - Reset cognitive state
- `AUTOHEAL_RESYNC_STATE` - Resync global state
- `AUTOHEAL_REBUILD_MEMORY_INDEX` - Rebuild memory index
- `AUTOHEAL_START_PIPELINE` - Start processing pipeline
- `AUTOHEAL_STOP_PIPELINE` - Stop pipeline

### Agenda & Timeline (5 commands)
- `AGENDA_SAVE_EVENT` - Save agenda event
- `AGENDA_DELETE_EVENT` - Delete agenda event
- `AGENDA_SYNC` - Sync agenda
- `ADD_TIMELINE_EVENT` - Add timeline event

### Dev Tools (10+ commands)
- `DEV_GET_LOGS` - Get system logs
- `DEV_RUN_COMMAND` - Execute dev command
- `DEV_APPLY_PATCH` - Apply code patch
- `DEV_INSPECT_FILE` - Inspect file
- `DEVTOOLS_ENABLE` - Enable dev tools
- `DEVTOOLS_DISABLE` - Disable dev tools
- `CLEAR_LOGS` - Clear logs
- `CLEAR_SYSTEM_LOGS` - Clear system logs

### Engines & Monitoring (10+ commands)
- `ENGINE_INIT` - Initialize engine
- `ENGINE_STOP` - Stop engine
- `ENGINE_TICK` - Engine tick
- `ENGINE_SINGULARITY_RESET` - Reset singularity engine
- `ENGINES_MONITORING_GET_DASHBOARD` - Get monitoring dashboard
- `GET_SYSTEM_HEALTH` - Get system health
- `ORCHESTRATION_GET_UNIFIED_STATE` - Get orchestration state
- `ORCHESTRATION_GET_COGNITIVE_STATE` - Get cognitive state

### CrashGuard & Emergency (7 commands)
- `CRASHGUARD_CLEAR_MEMORY` - Emergency memory clear
- `CRASHGUARD_EMERGENCY_ROLLBACK` - Emergency rollback
- `CRASHGUARD_EMERGENCY_SHUTDOWN` - Emergency shutdown
- `CRASHGUARD_RESET_PIPELINE` - Reset pipeline
- `CRASHGUARD_RESTART_MODULE` - Restart module

### Audio/Voice/TTS (10+ commands)
- `CALIBRATE_TITANE_VOICE` - Calibrate TITANE voice
- `CANCEL_RECORDING` - Cancel audio recording
- TTS operations (multiple commands)

### Configuration (5+ commands)
- `CP_SET_AI_CONFIG` - Set AI config
- `CP_SET_DESIGN_CONFIG` - Set design config
- `CP_TOGGLE_MODULE` - Toggle module
- `DELETE_CONFIG_PRESET` - Delete config preset
- `CLOUD_UPDATE_CONFIG` - Update cloud config

### Onboarding & Setup (2 commands)
- `IS_ONBOARDING_COMPLETE` - Check onboarding status
- `COMPLETE_ONBOARDING` - Mark onboarding complete

---

## Invocation Pattern

### Standard Invocation
```typescript
import { secureInvoke } from '@/lib/security';

const result = await secureInvoke('command_name', { args });
```

### Typed Client Usage (Recommended)
```typescript
import { tauriClient } from '@/lib/tauriClient';

const state = await tauriClient.memoryGetState();
const health = await tauriClient.getSystemHealth();
```

---

## Command Validation

### Security Layer
- **File:** `src/lib/security.ts`
- **Function:** `secureInvoke(command, args)`
- **Checks:**
  - Command exists in registry
  - Arguments valid (no injection)
  - Not in VOID_COMMANDS for expected return

### VOID Commands (Return null/undefined)
~60 commands return void (fire-and-forget pattern)

Examples:
- `CLEAR_ALL_MEMORY`
- `AUTOHEAL_CLEAR_PIPELINE`
- `COMPLETE_ONBOARDING`

---

## Total IPC Commands: 180+

**Next:** 31-ipc-contracts-by-command.md (detailed schemas)
