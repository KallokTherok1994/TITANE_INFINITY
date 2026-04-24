# TARGET CLINE ARCHITECTURE — CONSTITUTIONAL ALIGNMENT

## EXEC_MODE: GOVERNED_AUDIT

## SCOPE_RING: INSTRUCTION_AUTHORITY

## PRINCIPLE: Mirror Copilot Constitutional Authority

## PATCH_POLICY: Minimal only — resolve contradictions, preserve functionality

---

## CORE PRINCIPLE: CONSTITUTIONAL MIRRORING

Cline must mirror and operationalize the Copilot kernel, never redefine it.

**Source of Truth**: `.github/copilot-instructions.md` (constitutional kernel)  
**Cline Role**: Operationalize Copilot rules for Cline execution environment  
**Forbidden**: Creating second doctrine or competing authority

---

## TARGET STRUCTURE: `.clinerules/` MODULAR SYSTEM

### Phase 1: Critical Alignment (Apply Now)

```
.clinerules/
├── 00-kernel.md              # CRITICAL: Mirror copilot-instructions.md
├── 20-proof-gates-verdicts.md # Status vocabulary enforcement
├── 40-autoheal-rollback.md   # AutoHeal integration rules
└── hooks/                    # Enhanced existing hooks
    ├── TaskStart             # + status vocabulary
    ├── PostToolUse           # + AutoHeal integration
    └── PreToolUse            # + architecture validation
```

### Phase 2: Complete Coverage (Future)

```
.clinerules/
├── 10-execution-workflow.md   # Bootstrap → verify → report workflow
├── 30-architecture-network.md # 4-Ring + One Door + IPC contract
├── 50-agents-compat.md       # Agent authority + routing integration
├── 60-paths-frontend.md      # Path rules mirroring .github/instructions/
├── 61-paths-backend.md       # Tauri-specific rules
├── 62-paths-tests.md         # E2E rules
├── 63-paths-docs.md          # Documentation rules
└── workflows/                # Future: workflow-specific rules
```

---

## CRITICAL FILE 1: `.clinerules/00-kernel.md`

**Purpose**: Mirror Copilot constitutional kernel for Cline execution
**Source**: `.github/copilot-instructions.md`
**Rule**: Must preserve all constitutional invariants

### Content Requirements

- All 12 numbered rules from Copilot kernel
- Same status vocabulary: PASS/FAIL/BLOCKED/BLOCKED_APPROVAL/DONE/SEALED
- Same architecture invariants: 4-Ring, One Door, IPC contract
- Same proof requirements: proof-before-verdict, NO_SKIPS
- Same AutoHeal requirements: append + validate per fix
- Cline-specific operationalization instructions

### Cline-Specific Additions (Allowed)

- How to enforce rules in Cline hook system
- File path mappings for Cline operations
- Hook integration requirements
- Validator scripts to run

---

## CRITICAL FILE 2: `.clinerules/20-proof-gates-verdicts.md`

**Purpose**: Enforce Copilot status vocabulary in Cline operations
**Source**: Copilot Rules 2, 8, 9

### Content Requirements

- Status vocabulary definitions
- PASS criteria: proof artifacts required
- FAIL criteria: stop-the-line triggers
- BLOCKED criteria: cannot proceed indicators
- DONE/SEALED criteria: validator requirements
- NO_SKIPS enforcement: no narrative bypass allowed

### Hook Integration

- PostToolUse must classify all operations
- TaskStart must check prerequisites
- UserPromptSubmit must validate gates

---

## CRITICAL FILE 3: `.clinerules/40-autoheal-rollback.md`

**Purpose**: Enforce AutoHeal capture per Copilot Rule 10
**Source**: Copilot Rule 10, 12

### Content Requirements

- AutoHeal capture triggers
- JSONL schema requirements (user memory: full schema mandatory)
- Required validation commands:
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
- Rollback plan requirements
- Proof pack generation rules

### Hook Integration

- PostToolUse must detect qualifying fixes
- Generate AutoHeal entries automatically
- Track rollback points per session

---

## ENHANCED HOOKS: MINIMAL MODIFICATIONS

### TaskStart Enhancement

**Current**: Project detection + context injection
**Add**: Status vocabulary enforcement, constitutional reference

```bash
# Add to existing logic:
context+="CONSTITUTIONAL_AUTHORITY: .clinerules/00-kernel.md (mirrors .github/copilot-instructions.md)\n"
context+="STATUS_VOCABULARY: PASS/FAIL/BLOCKED/BLOCKED_APPROVAL/DONE/SEALED\n"
context+="PROOF_REQUIRED: No PASS without executable proof\n"
```

### PostToolUse Enhancement

**Current**: Performance monitoring + learning
**Add**: Status classification, AutoHeal capture

```bash
# Add to existing logic:
# 1. Classify operation using status vocabulary
# 2. Detect qualifying fixes for AutoHeal
# 3. Append to autoheal_rules.jsonl if applicable
# 4. Run validators for session evidence
```

### PreToolUse Enhancement

**Current**: (content unknown, inspect needed)
**Add**: Architecture boundary validation

```bash
# Add architecture checks:
# 1. Validate 4-Ring boundaries for file operations
# 2. Check One Door network compliance
# 3. Verify IPC contract compliance
# 4. BLOCK operations that violate architecture
```

---

## PATCH STRATEGY: INCREMENTAL GOVERNANCE

### Patch Order (Based on Contradiction Priority)

1. **Create .clinerules/00-kernel.md** (resolves C1: dual authority)
2. **Enhance PostToolUse** (resolves C2: status vocab + C4: AutoHeal)
3. **Create .clinerules/20-proof-gates-verdicts.md** (resolves C3: proof discipline)
4. **Enhance PreToolUse** (resolves C5: architecture validation)
5. **Create .clinerules/40-autoheal-rollback.md** (completes AutoHeal integration)

### Multi-Phase Rollout

**Phase 1**: Resolve critical contradictions (Patches 1-5)
**Phase 2**: Add remaining modular files for complete coverage  
**Phase 3**: Workflow-specific enhancements

### Validation Requirements

- Run `scripts/verify_instructions.sh` after each patch
- Generate proof artifacts for each modification
- Maintain git rollback capability at all times

---

## COMPATIBILITY PRESERVATION

### Must Preserve

- Existing hook functionality (project detection, performance monitoring)
- Existing blocked commands (deployment safeguards)
- Cline-specific configuration preferences (French, plan mode, etc.)
- Integration with existing scripts (install-hooks.sh, test-complete.sh)

### Must Not Break

- VS Code Cline extension compatibility
- Task VS command routing
- Terminal integration
- File operation approvals

---

## SUCCESS CRITERIA

### Alignment Verification

- No contradictions between Cline and Copilot rules
- Unified status vocabulary in use
- Proof discipline enforced by hooks
- AutoHeal integration operational
- Architecture boundary validation active

### Operational Verification

- `scripts/verify_instructions.sh` PASS
- All gates report PASS or explicit BLOCKED with next action
- Proof pack generated with required artifacts
- Rollback plan available and tested

### Maintenance Verification

- Future Copilot kernel updates easily propagated to Cline
- No instruction authority drift
- Clear precedence hierarchy maintained

---

## STATUS: TARGET_ARCHITECTURE_DEFINED

**Next Phase**: Apply minimal patches in priority order
**Validation Gateway**: scripts/verify_instructions.sh after each patch  
**Rollback Points**: Git commits between each patch for granular revert capability
