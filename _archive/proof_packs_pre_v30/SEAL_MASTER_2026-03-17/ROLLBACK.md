# TITANE∞ SEAL MASTER — ROLLBACK PLAN

**Session:** MASTER_OPERATOR_PROMPT_V2  
**Date:** 2026-03-17

---

## Minimal Rollback Per Fix

### FIX-001 (IPC remaps)
```bash
git restore --source HEAD~15 -- src/services/tauri/backend-v17.2.commands.ts
```

### FIX-002 (Rust .expect removal)
```bash
git restore --source HEAD~14 -- src-tauri/src/main.rs
```

### FIX-003/006 (TS type alignment)
```bash
git restore --source HEAD~13 -- src/services/tauri/backend-v17.2.types.ts src/stores/systemStore.ts
```

### FIX-004 (LTM history)
```bash
git restore --source HEAD~12 -- src-tauri/src/conversation_engine/pipeline.rs
```

### FIX-005 (UI field crashes)
```bash
git restore --source HEAD~11 -- src/features/kernel/SentinelAlerts.tsx src/features/kernel/HarmoniaFlow.tsx src/features/kernel/NexusMesh.tsx src/features/kernel/MemoryGraph.tsx
```

### FIX-007 (OMC remapping)
```bash
git restore --source HEAD~10 -- src/lib/tauriCommands.ts src/pages/OrchestrationMetaCenter.tsx
```

### FIX-008 (VoiceProfiles)
```bash
git restore --source HEAD~9 -- src-tauri/src/identity/voice_profile.rs
git rm -- src/features/audio-center/titaneVoiceProfiles.ts src/features/audio-center/AudioCenterPage.tsx
```

### FIX-009 to FIX-015 (bulk IPC registrations)
```bash
git restore --source HEAD~8 -- src-tauri/src/main.rs src-tauri/src/lib.rs
```

## Full Rollback (all fixes)
```bash
git revert HEAD~15..HEAD --no-commit
git commit -m "revert(ipc+types+pipeline): rollback FIX-001 to FIX-015 SEAL-MASTER"
```
