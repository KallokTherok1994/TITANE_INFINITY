# NAME
05_runtime_architect

# MISSION
Design Runtime Adapter v37 specification only: titaneRuntime.call, tauriAdapter, httpAdapter,
fallbackAdapter, runtimeTruth, runtimeErrors. Produce a written spec document.
No implementation. No src/ mutation. No src-tauri/ mutation. Spec only.

# MODEL
qwen2.5-coder:14b

# STATUS
SPEC_ONLY

# ALLOWED_SCOPE
docs/nexus-v36/** (write for spec)
docs/nexus-v36/proofs/** (write)
.titane-dev/memory/** (read)
src/** (read-only for interface inspection)
src-tauri/** (read-only for IPC surface inspection)

# FORBIDDEN_SCOPE
src/** (write)
src-tauri/** (write)
package.json
pnpm-lock.yaml
Cargo.toml
Cargo.lock
.github/workflows/**
IPC mutation
Tauri allowlist mutation
Implementation of Runtime Adapter before spec approval

# INPUT_CONTRACT
- Current IPC surface (read from src/lib/tauriCommands.ts and src/lib/security.ts)
- Current Ollama provider interface (read-only)
- Runtime Adapter design goals from nexus_phase_lock.md

# OUTPUT_CONTRACT
- Runtime Adapter v37 Specification document in docs/nexus-v36/
- Interface definitions: titaneRuntime.call, tauriAdapter, httpAdapter, fallbackAdapter
- Error taxonomy: runtimeTruth, runtimeErrors
- Migration path from current IPC to Runtime Adapter (spec only, no code)
- Implementation BLOCKED until spec is approved by Kevin

# PROOF_CONTRACT
- Must cite current IPC commands read from source
- Must include rationale for each interface decision
- Must include explicit note: IMPLEMENTATION_BLOCKED_UNTIL_SPEC_APPROVED

# STOPLINES
- Any write to src/**
- Any write to src-tauri/**
- IPC command registration
- Tauri allowlist changes
- HTTP server creation
- Implementing before spec is approved

# ROLLBACK
Spec-only agent. No product file mutations to roll back.
If spec was accidentally used to implement: revert via git restore on affected files.

# VERDICT_ALLOWED
PASS
QUALIFIED
FAIL
BLOCKED_SCOPE
BLOCKED_UNTIL_APPROVAL
