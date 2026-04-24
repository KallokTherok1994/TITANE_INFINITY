# CLINE-COPILOT INSTRUCTION ALIGNMENT — CROSSWALK MATRIX

## EXEC_MODE: GOVERNED_AUDIT

## SCOPE_RING: INSTRUCTION_AUTHORITY

## RISK: HIGH (Constitutional alignment)

## PLAN: Bootstrap → Discovery → Crosswalk → Minimal Patch → Validate

## PROOFS: Full crosswalk + contradiction map + patch evidence

## ROLLBACK: Git state preserved, clear revert paths

---

## 1. REAL STATE (Bootstrap Truth)

### Repository State

- **Commit ID**: 9fd454545
- **Branch**: MAIN
- **Git Status**: 1 modified file (titane-infinity.desktop)
- **Date**: 2026-03-18 14:49

### Discovered Authority Files

**Copilot Authority:**

- `.github/copilot-instructions.md` (constitutional kernel)
- `.github/copilot-routing.json` (agent routing)
- `.github/instructions/*.instructions.md` (5 files)
- `.github/agents/*.agent.md` (10 files)
- `.github/prompts/*.prompt.md` (8 files)

**Cline Authority:**

- `.clinerules/hooks/` (4 hook files)
- `.clinerules/install-hooks.sh`
- `.clinerules/test-complete.sh`
- `.cline/config-optimized.sh`
- `.cline/deployment-safeguards.json`

**Supporting:**

- `scripts/autoheal/autoheal_rules.jsonl`
- `scripts/autoheal/detect_recurrence.sh`
- `scripts/verify_instructions.sh`

---

## 2. COPILOT AUTHORITY MAP

### Constitutional Kernel

**File**: `.github/copilot-instructions.md`
**Status**: Active constitutional source of truth
**Key Invariants**:

- 12 numbered rules (minimal patch, proof-first, architecture boundaries)
- Status vocabulary: PASS/FAIL/BLOCKED/BLOCKED_APPROVAL/DONE/SEALED
- 4-Ring architecture (strict boundaries, no inverse imports)
- Tauri-only production runtime
- One Door network governance (UI → IPC → Services → Gateway → External)
- IPC contract: `{ ok, content, error }`
- AutoHeal mandatory (append to autoheal_rules.jsonl + run validators)
- Proof pack + rollback required per session

### Agent Routing

**File**: `.github/copilot-routing.json`
**Status**: Active routing authority
**Priorities**: architect-guardian (architecture), tauri-safety, e2e-authority, release-proof, docs-registry, dependency-guardian

### Path-Specific Instructions

**Pattern**: `.github/instructions/*.instructions.md`
**Active Files**:

1. `frontend.instructions.md` (applyTo: src/\*\*)
2. `tauri.instructions.md` (applyTo: src-tauri/**, tauri\*.json, runtime/**)
3. `tests-e2e.instructions.md` (applyTo: e2e/**, scripts/e2e/**)
4. `docs-registry.instructions.md` (applyTo: docs/**, reports/**, proof_packs/\*\*)
5. `titane.instructions.md` (global TITANE specifics)

### Specialized Agents

**Pattern**: `.github/agents/*.agent.md`
**Count**: 10 agents (architect-guardian, tauri-safety, e2e-authority, etc.)
**Status**: Execution authority per routing rules

---

## 3. CLINE AUTHORITY MAP

### Hook System

**Directory**: `.clinerules/hooks/`
**Active Hooks**:

1. `TaskStart` - Project detection + context injection
2. `PostToolUse` - Performance monitoring + learning
3. `PreToolUse` - (exists, content unknown)
4. `UserPromptSubmit` - (exists, content unknown)

**Key Rules in TaskStart**:

- Tauri + React + TypeScript project detection
- CRITICAL: NO deployment without explicit authorization
- BLOCKED: 'npm run build', 'tauri build', '🔵 Build Titan-Stable'
- ALLOWED: '🟢 Launch Titan-Dev' (dev mode mandatory)
- References: `.github/copilot-instructions.md`, `.github/instructions/titane.instructions.md`

### Configuration Layer

**Files**:

- `.cline/config-optimized.sh` (CLI config script)
- `.cline/deployment-safeguards.json` (JSON safeguards)

**Key Rules**:

- Mode: plan (not yolo)
- Strict plan mode enabled
- Blocked commands: build/production commands
- Blocked tasks: deployment tasks
- French language preference
- Auto-approval controlled

---

## 4. CONTRADICTIONS DETECTED

### AUTHORITY OVERLAP

**Issue**: Cline hooks reference Copilot instructions but operate independently
**Impact**: Two separate execution authorities
**Evidence**:

- TaskStart references `.github/copilot-instructions.md` but doesn't mirror its rules
- Deployment blocking in both systems but different implementations

### VERDICT VOCABULARY MISMATCH

**Issue**: Copilot uses PASS/FAIL/BLOCKED/DONE/SEALED, Cline hooks don't implement this
**Impact**: No unified status reporting
**Evidence**: PostToolUse logs operations but doesn't classify with status vocabulary

### NO PROOF DISCIPLINE IN CLINE

**Issue**: Copilot requires "proof before verdict", Cline hooks don't enforce this
**Impact**: Cline can proceed without verification
**Evidence**: No gate checking or proof pack requirements in Cline hooks

### NO AUTOHEAL INTEGRATION

**Issue**: Copilot mandates AutoHeal capture, Cline hooks don't implement this
**Impact**: Fixes not captured for recurrence detection
**Evidence**: No autoheal_rules.jsonl integration in PostToolUse

### ARCHITECTURE RULES MISSING

**Issue**: Copilot enforces 4-Ring/One Door/IPC, Cline hooks don't verify these
**Impact**: Architecture drift possible through Cline
**Evidence**: No boundary checking in hooks

---

## 5. TARGET ARCHITECTURE (Requirement)

### Principle: Mirror Copilot Constitutional Authority

Cline must mirror and operationalize Copilot kernel, never redefine it.

### Proposed Structure: `.clinerules/` Modular System

```
.clinerules/
├── 00-kernel.md              # Mirror copilot-instructions.md
├── 10-execution-workflow.md   # Bootstrap → verify → report
├── 20-proof-gates-verdicts.md # Status vocabulary + proof requirements
├── 30-architecture-network.md # 4-Ring + One Door + IPC contract
├── 40-autoheal-rollback.md   # AutoHeal + validator integration
├── 50-agents-compat.md       # Agent authority + AGENTS.md compat
├── 60-paths-frontend.md      # Path rules for src/** (mirror instructions)
├── 61-paths-backend.md       # Path rules for src-tauri/**
├── 62-paths-tests.md         # Path rules for e2e/**
├── 63-paths-docs.md          # Path rules for docs/**/proof_packs/**
├── hooks/                    # Existing hooks (retained + enhanced)
└── install-hooks.sh          # Existing installer
```

### Mandatory Hook Enhancements

1. **TaskStart**: Add status vocabulary enforcement
2. **PostToolUse**: Add AutoHeal integration + proof checking
3. **PreToolUse**: Add architecture boundary validation
4. **UserPromptSubmit**: Add gate pre-checks

---

## 6. PATCH STRATEGY (Minimal)

### PRIMARY CONTRADICTION: Dual Authority

**Root Cause**: Cline hooks operate independently from Copilot constitutional kernel
**Minimal Fix**: Create `.clinerules/00-kernel.md` that mirrors `.github/copilot-instructions.md`

### REQUIRED PATCHES

1. **Create .clinerules/00-kernel.md** - Mirror constitutional rules
2. **Enhance PostToolUse hook** - Add AutoHeal integration
3. **Enhance TaskStart hook** - Add status vocabulary enforcement
4. **Create .clinerules/20-proof-gates-verdicts.md** - Status vocabulary rules
5. **Create .clinerules/40-autoheal-rollback.md** - AutoHeal integration rules

### FORBIDDEN

- Deletion of existing Cline hooks (preserve functionality)
- Broad rewrites (minimal patch only)
- New contradictions (maintain compatibility)
- Weakening of Copilot rules

---

## STATUS: CROSSWALK_COMPLETE

**Next Phase**: Detect precise contradictions + define minimal patches
**Validation Required**: scripts/verify_instructions.sh
**Rollback Plan**: git restore .clinerules/ .cline/
