# PROOF GATES & VERDICTS — CLINE ENFORCEMENT RULES

**CONSTITUTIONAL SOURCE**: Copilot Rules 2, 8, 9  
**PURPOSE**: Enforce status vocabulary and proof discipline in Cline operations
**AUTHORITY**: Operationalizes `.clinerules/00-kernel.md` requirements

---

## STATUS VOCABULARY — MANDATORY CLASSIFICATION

### Required Vocabulary (Constitutional)
All Cline operations must classify using exactly these status values:

- **PASS**: Executable proof provided, all gates satisfied
- **FAIL**: Explicit failure, stop-the-line triggered  
- **BLOCKED**: Cannot proceed, next action <= 30 minutes required
- **BLOCKED_APPROVAL**: Awaiting human authorization
- **DONE**: Task completed with validation
- **SEALED**: Session completed with proof pack and rollback

**Verdict unique is mandatory** — each operation gets exactly one status.

---

## PROOF REQUIREMENTS — NO NARRATIVE BYPASS

### Rule: Proof Before Verdict (Constitutional Rule 2)
- **No PASS without executable proof**
- **No DONE/SEALED without relevant checks** 
- Proof artifacts required: logs, outputs, validator results, file evidence

### Rule: NO_SKIPS Policy (Constitutional Rule 9)  
- **Required checks cannot be skipped by narrative**
- If a check cannot run: classify **BLOCKED** with next action <= 30 minutes
- No "looks good" or "should work" classifications

---

## GATE DEFINITIONS — CLINE IMPLEMENTATION

### PASS Criteria
- All required proof artifacts exist
- Validators executed successfully  
- No stop-the-line conditions detected
- Evidence available for review

**Hook Implementation**: PostToolUse verifies proof before PASS classification

### FAIL Criteria  
- Operation failed with evidence
- Stop-the-line condition triggered
- Constitutional invariant violated
- Required check failed

**Hook Implementation**: Immediate FAIL classification, operation blocking

### BLOCKED Criteria
- Cannot proceed due to dependencies
- Missing authorization tokens
- External service unavailable  
- Next action defined (<= 30 minutes)

**Hook Implementation**: Clear next action provided to user

### BLOCKED_APPROVAL Criteria
- Human authorization required
- PROD token gate triggered  
- Deployment safeguard triggered
- Awaiting explicit approval

**Hook Implementation**: TaskStart detects approval requirements

### DONE Criteria  
- Task completed successfully
- All relevant checks passed
- Evidence captured  
- No outstanding blockers

**Hook Implementation**: PostToolUse validates completion evidence

### SEALED Criteria
- Session completed with full evidence
- Proof pack generated
- Rollback plan available
- Final verdict issued

**Hook Implementation**: Session-end processing with proof pack

---

## STOP-THE-LINE ENFORCEMENT — CONSTITUTIONAL RULE 8

### Trigger Conditions
- Invariant violation detected
- Mandatory gate FAIL
- Unresolved contradiction  
- Missing required proof

### Implementation  
- **Immediate operation blocking**
- **FAIL classification mandatory**
- **Do not attempt to continue**
- **Escalate to human resolution**

**Hook Integration**: PreToolUse and PostToolUse implement stop-the-line

---

## HOOK INTEGRATION REQUIREMENTS

### TaskStart Hook
- Check prerequisite gates before operation
- Detect BLOCKED_APPROVAL conditions
- Inject constitutional context
- Classify session initiation: PASS/BLOCKED

```bash  
# Classification logic:
if [[ missing_authorization ]]; then
  status="BLOCKED_APPROVAL"
elif [[ prerequisites_failed ]]; then  
  status="BLOCKED"
else
  status="PASS"
fi
```

### PreToolUse Hook  
- Validate constitutional boundaries
- Check architecture compliance
- Detect stop-the-line conditions
- Classify pre-operation: PASS/BLOCKED/FAIL

```bash
# Architecture validation:
if [[ violates_4ring_boundary ]]; then
  status="FAIL" 
  stop_the_line=true
elif [[ missing_proof_artifacts ]]; then
  status="BLOCKED"
else
  status="PASS" 
fi
```

### PostToolUse Hook
- Verify proof artifacts exist
- Classify operation outcome
- Capture evidence for gates
- Implement AutoHeal integration

```bash
# Proof verification:  
if [[ proof_artifacts_exist && validators_passed ]]; then
  status="PASS"
elif [[ operation_failed_with_evidence ]]; then
  status="FAIL"
elif [[ needs_additional_checks ]]; then  
  status="BLOCKED"
else
  status="DONE"
fi
```

### UserPromptSubmit Hook
- Pre-validate gate requirements  
- Check for NO_SKIPS violations
- Classify prompt readiness: PASS/BLOCKED

---

## VALIDATOR INTEGRATION

### Required Validation Commands
- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
- Architecture boundary checkers (when available)

### Validation Classification
- **Validator PASS**: Evidence of successful validation
- **Validator FAIL**: Stop-the-line, classify operation as FAIL
- **Validator BLOCKED**: Missing dependencies, classify as BLOCKED

### Evidence Requirements
All validations must produce:
- Exit code (0 = success, non-zero = failure)
- Output logs for proof artifacts
- Timestamp and operation context  
- File references for rollback

---

## PROOF ARTIFACT STANDARDS

### Required Artifacts by Operation Type
- **File Changes**: Git diff, before/after snapshots
- **Command Execution**: stdout/stderr logs, exit codes
- **Validation**: Validator outputs, pass/fail evidence  
- **Architecture**: Boundary check results
- **Network**: IPC contract compliance evidence

### Storage Requirements
- Proof artifacts in session-scoped directories
- Persistent proof in `proof_packs/` for SEALED sessions
- Rollback artifacts for all DONE/SEALED operations

---

## ESCALATION PROCEDURES

### BLOCKED Resolution
- Document next action (<= 30 minutes)
- Provide specific remediation steps
- Maintain operation blocking until resolved

### FAIL Resolution  
- Stop-the-line immediately 
- Document failure evidence
- Require human intervention for constitutional violations

### BLOCKED_APPROVAL Resolution
- Document exact authorization required
- Block operation until explicit human approval
- Verify authorization tokens when provided

---

## STATUS: PROOF_GATES_DEFINED
**Implementation**: Cline hooks enforce constitutional proof requirements
**Validation**: scripts/verify_instructions.sh validates rule implementation  
**Integration**: Status vocabulary mandatory in all hook classifications