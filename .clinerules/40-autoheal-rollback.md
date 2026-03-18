# AUTOHEAL & ROLLBACK — CLINE INTEGRATION RULES

**CONSTITUTIONAL SOURCE**: Copilot Rules 10, 12  
**PURPOSE**: Enforce AutoHeal capture and rollback requirements in Cline operations  
**AUTHORITY**: Operationalizes `.clinerules/00-kernel.md` Constitutional Rule 10

---

## AUTOHEAL CAPTURE — MANDATORY PER FIX

### Constitutional Requirement (Rule 10)
**For each fix, append one entry to `scripts/autoheal/autoheal_rules.jsonl`**

Then run:
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`

### Qualifying Fix Detection (Cline Implementation)
PostToolUse hook must detect operations that qualify as "fixes":

- **File modifications** that resolve identified problems
- **Configuration changes** that address reported issues  
- **Dependencies updates** that resolve conflicts
- **Architecture corrections** that restore compliance
- **Error handling additions** that prevent failures

---

## AUTOHEAL JSONL SCHEMA — FULL COMPLIANCE

### Required Schema (per user memory)
**Full JSONL schema MANDATORY**:
```json
{
  "id": "unique_identifier",
  "date": "YYYY-MM-DD",  
  "scope": "affected_component",
  "symptom": "observed_problem",
  "root_cause": "underlying_cause",
  "fix": "solution_applied", 
  "prevention_test": "validation_method",
  "commands": ["command1", "command2"],
  "files_changed": ["file1", "file2"],
  "rollback": "revert_instructions"
}
```

**Schema enforcement**: Shorthand rows will fail governance immediately

### AutoHeal ID Generation
Format: `AH-YYYY-MM-DD-HHMM-<scope>-<counter>`
Example: `AH-2026-03-18-1450-CLINE-ALIGNMENT-001`

---

## HOOK INTEGRATION — POSTTOOLUSE ENHANCEMENT

### Existing PostToolUse Capability  
Currently logs operations to `.clinerules/logs/operations.log`

### Enhanced AutoHeal Integration
```bash
# Add to existing PostToolUse logic after operation logging:

# Detect qualifying fixes
if [[ "$tool_name" =~ ^(write_to_file|execute_command)$ ]] && [[ "$success" == "true" ]]; then
  
  # Extract operation context
  files_modified=$(echo "$input" | jq -r '.postToolUse.filesModified // []')
  operation_desc=$(echo "$input" | jq -r '.postToolUse.description // ""')
  
  # Check if operation qualifies as a fix
  if detect_fix_operation "$operation_desc" "$files_modified"; then
    
    # Generate AutoHeal entry
    generate_autoheal_entry \
      --scope="$detected_scope" \
      --symptom="$detected_symptom" \
      --files="$files_modified" \
      --operation="$operation_desc"
      
    # Run required validation
    run_autoheal_validation
  fi
fi
```

### Fix Detection Logic
```bash
detect_fix_operation() {
  local desc="$1"
  local files="$2"
  
  # Pattern matching for qualifying fixes:
  if [[ "$desc" =~ (fix|resolve|correct|patch|heal|address) ]] ||
     [[ "$files" =~ (bug|error|issue|conflict|violation) ]]; then
    return 0  # Qualifying fix detected
  fi
  
  return 1  # Not a qualifying fix
}
```

---

## AUTOHEAL ENTRY GENERATION

### Automated Field Population
```bash
generate_autoheal_entry() {
  local scope="$1" 
  local symptom="$2"
  local files="$3"
  local operation="$4"
  
  # Generate unique ID
  local timestamp=$(date +%Y-%m-%d-%H%M)
  local counter=$(get_daily_counter)
  local id="AH-${timestamp}-CLINE-${counter}"
  
  # Build JSONL entry
  cat >> scripts/autoheal/autoheal_rules.jsonl << EOF
{
  "id": "${id}",
  "date": "$(date +%Y-%m-%d)",
  "scope": "${scope}",
  "symptom": "${symptom}",
  "root_cause": "$(detect_root_cause)",  
  "fix": "${operation}",
  "prevention_test": "$(suggest_prevention_test)", 
  "commands": $(generate_commands_array),
  "files_changed": ${files},
  "rollback": "$(generate_rollback_instructions)"
}
EOF
}
```

### Scope Detection Rules
- **cline-hooks**: Modifications to `.clinerules/hooks/`
- **cline-config**: Changes to `.cline/` configuration
- **constitutional**: Changes affecting `.clinerules/00-kernel.md` 
- **proof-gates**: Changes to `.clinerules/20-proof-gates-verdicts.md`
- **autoheal**: Changes to AutoHeal integration itself

---

## REQUIRED VALIDATION COMMANDS

### AutoHeal Validation Sequence
```bash
run_autoheal_validation() {
  echo "Running AutoHeal validation sequence..."
  
  # 1. Check recurrence detection
  if ! bash scripts/autoheal/detect_recurrence.sh; then
    echo "STATUS: FAIL - AutoHeal recurrence detection failed"
    return 1
  fi
  
  # 2. Verify instructions consistency  
  if ! bash scripts/verify_instructions.sh; then
    echo "STATUS: FAIL - Instructions verification failed"
    return 1
  fi
  
  echo "STATUS: PASS - AutoHeal validation completed"
  return 0
}
```

### Validation Failure Handling
- **FAIL** classification if validation commands fail
- **Stop-the-line** enforcement per Constitutional Rule 8
- **Human escalation** required for resolution

---

## ROLLBACK REQUIREMENTS — CONSTITUTIONAL RULE 12

### Session Evidence Requirements  
Each governed session must produce:
- **Gate report**: Proof of constitutional compliance
- **Rollback plan**: Specific revert instructions  
- **Final unique verdict**: PASS/FAIL/BLOCKED/DONE/SEALED

### Rollback Plan Generation
```bash
generate_rollback_instructions() {
  local files_changed="$1"
  
  # Git-based rollback for file changes
  if [[ -n "$files_changed" ]]; then
    echo "git checkout -- $files_changed"
  fi
  
  # Config rollback for Cline settings
  if [[ "$files_changed" =~ \.cline/ ]]; then
    echo "; .cline/config-optimized.sh"  
  fi
  
  # Hook rollback for rule changes
  if [[ "$files_changed" =~ \.clinerules/ ]]; then
    echo "; .clinerules/install-hooks.sh"
  fi
}
```

### Proof Pack Integration  
When session reaches **SEALED** status:
- Generate proof pack in `proof_packs/CLINE_SESSION_<timestamp>/`
- Include all AutoHeal entries from session
- Include rollback plan and validation logs
- Provide final unique verdict

---

## RECURRENCE DETECTION INTEGRATION

### Integration with detect_recurrence.sh  
PostToolUse must ensure AutoHeal entries are compatible:
- **Unique IDs** prevent duplication
- **Full schema** prevents parsing failures
- **Proper JSON** formatting maintained

### Recurrence Alert Handling
If `detect_recurrence.sh` identifies recurring patterns:
- **BLOCKED** status until pattern addressed
- **Escalation** to review prevention tests
- **Documentation** of pattern in proof pack

---

## CONTINUOUS IMPROVEMENT FEATURES 

### AutoHeal Learning Integration
```bash
# Enhance PostToolUse with learning from AutoHeal patterns:

learn_from_autoheal() {
  local recent_entries=$(tail -n 10 scripts/autoheal/autoheal_rules.jsonl)
  
  # Detect common symptom patterns
  # Suggest proactive prevention tests  
  # Update hook detection logic
  
  # Example: If many TypeScript errors, enhance PreToolUse validation
}
```

### Prevention Test Suggestions
Based on detected scope and symptom:
- **cline-hooks**: Test hook execution with sample inputs
- **constitutional**: Run constitutional compliance validators
- **architecture**: Execute boundary validation checks  

---

## STATUS: AUTOHEAL_INTEGRATION_DEFINED
**Implementation**: PostToolUse hook captures qualifying fixes automatically
**Validation**: Required scripts run after each AutoHeal entry  
**Evidence**: Full JSONL schema compliance + rollback plans generated