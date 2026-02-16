# IPC Standalone Tools

**Purpose**: Isolated scripts for P3 certification gates (provider meta validation).

**Policy**: Keep + Isolate (per append-only governance; no deletion).

**Status**: Non-production tooling (Ring 4—tests/UI layer).

---

## Scripts Inventory

### ipc-ar20.cjs

**Purpose**: Validate provider meta across AR20 (20-message) gate.

**Usage**:
```bash
node scripts/tools/ipc/ipc-ar20.cjs
```

**Inputs**:
- IPC endpoint: Tauri `conversation_generate` command
- Provider preference: local (OFFLINE_SIM test mode)
- Message count: 20

**Outputs**:
- JSONL summary (provider_used, mode, latency_ms, network_used)
- Overall pass/fail verdict

**Note**: Requires Tauri dev server running (pnpm run dev:tauri).

---

### ipc-offline5.cjs

**Purpose**: Validate OFFLINE_SIM determinism across OFFLINE5 (5-message) gate.

**Usage**:
```bash
OFFLINE_SIM=1 node scripts/tools/ipc/ipc-offline5.cjs
```

**Inputs**:
- Environment: OFFLINE_SIM=1
- Message count: 5

**Outputs**:
- JSONL summary with mode=Offline, network_used=false
- Determinism signature check

**Note**: Requires Tauri dev server running.

---

## Policy: NO-VITE Certification

Per P3-6 certification:
- ✅ These scripts are standalone tools (not blocking production)
- ✅ They require `tauri dev` context (inherent architectural dependency)
- ✅ They are NOT used in certification gates (P3-6 uses pure Rust harness instead)
- ⚠️ **Do not use in strict no-server contexts** (e.g., CI/CD pipelines that ban Vite)

**Recommended**: Use Rust harness (`src-tauri/tests/p3_provider_meta_gates.rs`) for certification; use these scripts for exploratory testing only.

---

## Governance

**Archive Decision**: Keep + Isolate (per P3-7 seal phase).

**Reason**: 
- Scripts pre-date decision to use pure Rust harness
- Preserve as historical record (append-only archive)
- Isolate from smoke tests to avoid confusion (mistaken use in CI/CD)

**Rollback**: If scripts cause issues, revert via git history (scripts will be committed with move operation).

---

**Last Updated**: 2026-02-16 (P3-7 SEAL phase)  
**Authority**: Copilot (Windows AI Studio)
