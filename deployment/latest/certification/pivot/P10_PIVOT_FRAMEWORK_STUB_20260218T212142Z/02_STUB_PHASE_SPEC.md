# STUB PHASE SPECIFICATION

**Document**: Defines what a STUB phase is and how all 6 stub phases behave.

## Core Principle

A STUB phase is a **minimal placeholder** that:
- Proves the orchestration framework works (pack, seal, registry)
- Never claims production readiness
- Is truthful in all outputs (STUB_PHASE: YES)
- Is deterministic and fast (<1s)
- Performs NO runtime actions (no builds, no tests, no deployments)

## Required STUB Phase Behavior

Each stub phase script MUST:

### 1. Source the Library
```bash
source "$REPO_ROOT/scripts/certification/lib_cert.sh"
```

### 2. Run Prechecks
```bash
prechecks_clean_tree "$PACK_DIR" || exit 1
```

Validates:
- Git tree clean (tracked files)
- No forbidden file modifications

### 3. Create Phase Proof Pack
```bash
PHASE_PACK_DIR=$(mk_pack_dir "$PHASE_ID")
PHASE_LOG="$PHASE_PACK_DIR/PHASE.log"
exec 1> >(tee "$PHASE_LOG")
exec 2>&1
```

### 4. Output Required Keys (to stdout)
Each stub MUST emit:
```
PHASE_ID=P10_4
PHASE_NAME=INFRA IPC STABILIZATION (STUB)
PROOF_PACK_PATH=/absolute/path/to/phase/pack
STUB_PHASE=YES
FINAL_VERDICT=PASS_FRAMEWORK_STUB
```

### 5. Create Phase VERDICT.md
```markdown
# VERDICT: Phase P10.4 (STUB)

**Status**: PASS_FRAMEWORK_STUB  
**Stub Phase**: YES  
**Production Ready**: NO  
**Production Claims**: NONE

This phase validated the orchestration framework only.
No application testing, no infrastructure probes, no real gates.
```

### 6. Exit 0 (PASS)
Stubs always PASS (they're not testing anything).

## What Stubs DO (Ring 4 Only)

✅ **Allowed**:
- File I/O in phase pack directory
- Git operations (precheck)
- SHA256 checksums of static files
- Logging and proof collection
- Creating proof documents

## What Stubs DO NOT (Never)

❌ **Forbidden**:
- Run Tauri app (no `pnpm run dev:tauri`)
- Execute E2E tests (no WebDriver)
- Build anything (no cargo, no pnpm build)
- Launch Ollama or connect to external services
- Measure timing (no liveness probes)
- Modify any source files

## The 6 Stub Phases

| Phase | Stub Name | Time | Proof |
|-------|-----------|------|-------|
| P10.4 | Infra IPC STUB | <0.5s | Binary exists (stat only) |
| P10.3.2R | Desktop E2E STUB | <0.5s | Framework files exist |
| P10.5 | Chat Functional STUB | <0.5s | Precheck only |
| P10.6 | Production Build STUB | <0.5s | Precheck only |
| P10.7 | Packaging Smoke STUB | <0.5s | Precheck only |
| P10.8 | Ops Support STUB | <0.5s | Precheck only |

**Total orchestration time**: <15 seconds

## Registry Entry (Honest)

When each stub phase completes, the master orchestrator appends to registry:
```jsonl
{"phase":"P10_4","timestamp":"2026-02-18T21:21:42Z","status":"PASS","stub":true,"reason":"Framework validation only, no production claims","pack_path":"..."}
```

## Transition: Stub → Real

To upgrade a phase from STUB → REAL (e.g., P10.4 → Real Infra):
1. Create `scripts/certification/phases_real/p10_4_infra_real.sh`  
2. Implement actual gates (IPC probes, timing, etc.)
3. Update master orchestrator to call real version
4. Rerun master (now will take longer, but framework is proven)
5. Commit + append registry

Example upgrade commit message:
```
feat(cert): upgrade P10.4 from STUB to REAL (infra determinism gates)
```

---

**Framework Overhead**: This spec ensures we spend 5 minutes building stubs once, then per-gate upgrades are fast and focused.

