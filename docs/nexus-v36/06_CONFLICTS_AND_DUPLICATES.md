# GATE 6 — CONFLICTS AND DUPLICATES

**Project:** TITANE_INFINITY

---

## Conflicts Found

### CONFLICT_01 — Session vs. Prompt Pre-flight (Non-Blocking)

**Classification:** SESSION_CONFLICT (not doctrinal)  
**Source A:** `.github/prompts/ollama-dev-session.prompt.md` step 5: `pnpm run verify:ollama:dev:live`  
**Source B:** This session — user rejected this command → BLOCKED_USER_STOP  
**Resolution:** None needed. The prompt is correct for normal sessions. The block is a per-session user decision, not a doctrinal conflict. Resume the command when Kevin approves.

### No Other Conflicts Found

No two doctrinal layers define contradictory invariants.

---

## Duplicates Found

### DUPLICATE_01 — Proof-before-verdict stated in multiple layers

**L1:** copilot-instructions.md Rule 2  
**CLAUDE.md:** "Proof before verdict. No PASS without real command output..."  
**Assessment:** INTENTIONAL_DUPLICATION — reinforcement, not conflict. Both state the same rule. No cleanup needed.

### DUPLICATE_02 — AutoHeal requirement stated in multiple layers

**L1:** Rule 10  
**CLAUDE.md:** "AutoHeal mandatory"  
**titane.instructions.md:** references AutoHeal  
**Assessment:** INTENTIONAL_DUPLICATION — reinforcement. No conflict.

### DUPLICATE_03 — gemma2:2b product baseline stated in multiple layers

**L1:** References model boundary  
**L4:** ollama-dev-chat-boundary.agent.md explicitly requires gemma2:2b  
**titane.instructions.md:** "TITANE Chat must always use gemma2:2b as default"  
**Assessment:** INTENTIONAL_DUPLICATION — defense in depth. No conflict.

---

## Dangerous Patterns for NEXUS

None found. No instruction in any layer:
- Creates NexusPage before Surface Decision Matrix
- Allows src/ mutation before Gate 10
- Changes product model defaults
- Bypasses proof requirements
- Skips scope validation
