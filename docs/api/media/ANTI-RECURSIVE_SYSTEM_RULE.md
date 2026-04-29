# Anti-Recursive System Rule (Constitutional Governance)

**Scope:** TITANE_INFINITY system-wide  
**Authority:** Derived from Mermaid governance lifecycle (V1→V19 lessons)  
**Status:** BINDING (applies to all future governance subsystems)  
**Effective:** 2026-02-22  

---

## 1. Problem Statement

### Governance System Drift
Bounded, well-scoped governance subsystems (like Mermaid diagram governance) naturally tend to:
- Self-perpetuate through monitoring cadences and maintenance cycles
- Create implicit ongoing obligations even when dormant
- Resist full archival/retirement without explicit termination design

### Risk: Pattern Re-creation
Without structural constraints, TITANE_INFINITY could accumulate multiple micro-governance systems:
- Schema validation subsystem (versions V1→Vn)
- Performance metrics governance (versions V1→Vn)
- Security audit subsystem (versions V1→Vn)
- etc.

Each potentially requiring equivalent sealing/archival complexity, creating **governance subsystem proliferation**.

### Lesson from Mermaid (V1→V19)
The Mermaid pattern demonstrated that:
1. Bounded subsystems are legitimate when scope is clear
2. But "sealed dormant" ≠ "archived" (residual maintenance duty remains)
3. True archival requires **upfront design for retirement** (not retrofit)
4. Pattern can be prevented by constitutionalizing exit-criteria-first design

---

## 2. Constitutional Rule

### Rule Statement
**No governance subsystem (scoped micro-system with versioning, guards, cadence, or certification gates) may be created or operated without explicit predefined archival criteria and reactivation conditions.**

### Five Pillars

#### Pillar 1: Upfront Exit Design
**Definition:** Archival criteria must be declared *before or during* initial design (V1 phase), not after sealing.

**Required Criteria:**
- When is the subsystem considered "goal-complete" or "stable"?
- What version number signals completion (e.g., V12)?
- What operational state indicates readiness for sealing (V13)?
- What events trigger mandatory reactivation from archive?

**Validation:**
- Design document must include "Archival Plan" section
- Archival plan reviewed before Phase 1 operational deployment
- Plan must be non-trivial (not "archive when done")

#### Pillar 2: No "Dormant with Cadence" States
**Definition:** Eliminate intermediate states where a subsystem is sealed/dormant but still has periodic monitoring or maintenance obligations.

**Prohibited Patterns:**
- "Dormant, review quarterly" → Becomes VN, VN+1, VN+2...
- "Sealed, check for drift every sprint" → Becomes active operational duty
- "Monitor reactivation triggers as part of platform checks" → Ongoing maintenance

**Allowed States:**
- **ACTIVE:** Full operational cadence, versioning, gates
- **ARCHIVED:** Passive only, trigger-based reactivation, zero recurrence

**Implementation:**
- Subsystem must explicitly choose ACTIVE or ARCHIVED at each phase boundary
- "Dormant" is a temporary transition state only (max 1 sprint)
- No subsystem can remain in dormant state across releases

#### Pillar 3: Explicit Reactivation Conditions
**Definition:** Archive must publish exactly which conditions allow future reactivation.

**Required Format:**
```
REACTIVATION CONDITIONS (Passive Only):
1. [Condition A]: Business justification required
2. [Condition B]: Business justification required
3. [Condition C]: Business justification required
4. [Condition D]: Business justification required
```

**Conditions Must Be:**
- Mutually exclusive (avoid overlapping triggers)
- Specific and measurable (not vague)
- Tied to deliverable scope, not maintenance burden
- Maximal 3-4 conditions (more indicates poor archival design)

**Example (Mermaid V19):**
- API surface changes impacting diagram semantics
- Infrastructure/provider changes requiring updates
- Architectural changes with diagram implications
- Proven bugs in baseline logic

#### Pillar 4: Archival Documentation Requirement
**Definition:** Any archived subsystem must generate a single archival summary document.

**Required Content:**
- System name, version range (V1→Vn), lifecycle duration
- Why it was created and why it was archived
- Archival timestamp and HEAD SHA
- Reactivation conditions and process
- Reference to all supporting docs and evidence packs

**Format:**
- Markdown, placed in `docs/governance/` or subsystem root
- Named `[SUBSYSTEM]_ARCHIVE_NOTE.md` or `[SUBSYSTEM]_GOVERNANCE_PATTERN_LESSONS.md`
- Immutable after creation (no edits post-archival)

#### Pillar 5: No Residual Maintenance Cadence
**Definition:** Post-archival, the subsystem generates zero operational burden to active CI, monitoring systems, or team processes.

**Validation Gates:**
- Subsystem's scripts do not run in regular `pnpm` tasks
- Subsystem's guards do not appear in PR gates (unless triggered by reactivation condition)
- Subsystem's status reports do not generate alerts or notifications
- Team calendar has no recurring check-in or review for the archived subsystem

**Exception:**
Reactivation condition checks (e.g., "watch for API changes") are allowed as lightweight passive sentries, but must not spawn active subsystem governance operations.

---

## 3. Application Checklist

### For Each Proposed Governance Subsystem

**PRE-CREATION GATE:**
- [ ] System scope is sharply bounded and specific (not enterprise-wide)
- [ ] Exit criteria are defined in design doc (not deferred)
- [ ] Reactivation conditions are listed (min 1, max 4)
- [ ] Archival process is documented (not assumed)
- [ ] Expected duration or completion version is estimated

**PRE-DEPLOYMENT GATE:**
- [ ] Archival plan reviewed in PR comments or architecture forum
- [ ] Team acknowledges retention/archival cost
- [ ] Version numbering includes terminal phase (e.g., "V1→V12 then ARCHIVED")

**SEALING PHASE (Post-Completion):**
- [ ] System reaches declared completion version (e.g., V12)
- [ ] Archival criteria are assessed (all met? Y/N)
- [ ] If YES: Proceed to terminal seal → archival sequence
- [ ] If NO: Document blockers and defer archival with explicit review date

**ARCHIVAL (Terminal Phase):**
- [ ] Single archival summary document created and immutable
- [ ] Archival timestamp and HEAD SHA recorded
- [ ] All active scripts/tasks/monitors removed or disabled
- [ ] Reactivation conditions published
- [ ] PASS validation run (subsystem generates zero new CI operations)

---

## 4. Spirit vs. Letter

### What This Rule Protects
- **Against:** Governance subsystem proliferation and implicit maintenance burden
- **For:** Intentional, bounded, well-exit-planned micro-systems
- **Not:** Preventing legitimate scoped governance (e.g., Mermaid was legitimate)

### What This Rule Allows
- Create bounded subsystems with clear scope
- Version and maintain them actively during their lifecycle
- Seal and retire them with dignity
- Reactivate them if trigger conditions are met

### What This Rule Prevents
- "Dormant forever" states with residual cadence
- Unplanned governance subsystem accumulation
- Retrofit archival (design for exit upfront)
- Silent maintenance burden growth

---

## 5. Precedent: Mermaid Governance (V1→V19)

### How Mermaid Would Score Against This Rule

**Pillar 1 (Upfront Exit Design):** ⚠️ Partial
- No archival plan in V1 design doc
- Exit criteria emerged after V12 stability
- Retrofit archival (V13→V19 sequence)

**Pillar 2 (No "Dormant with Cadence"):** ❌ Failed Initially
- V13→V18: System was dormant but had monitoring cadence
- V19: Corrected by formalizing full archive (no cadence)

**Pillar 3 (Explicit Reactivation):** ✅ Full
- MERMAID_ARCHIVE_NOTE.md lists 4 reactivation conditions

**Pillar 4 (Archival Documentation):** ✅ Full
- MERMAID_GOVERNANCE_PATTERN_LESSONS.md + MERMAID_ARCHIVE_NOTE.md
- Additional: GOVERNANCE_PATTERN_LESSONS.md (this file's context)

**Pillar 5 (No Residual Cadence):** ✅ Full  
- V19 archival eliminates all; no CI burden

### Lessons Applied to This Rule
The Mermaid pattern's retrofit progression → this constitutional rule ensures future subsystems are designed for exit from day 1.

---

## 6. Enforcement

### Who Enforces?
- **Design Phase:** Architecture council or platform team (code review)
- **Archival Phase:** Same team (verify pre-archival gates)
- **Post-Archival:** Passive validation scripts only (no active enforcement team burden)

### How?
- Add "governance subsystem" checklist to PR template for subsystem creation
- Require explicit "Exit Plan" section in design docs
- Link to this rule in governance setup docs
- Annual passive compliance check (scan for orphaned subsystems)

### Penalty for Violation
- STOP-THE-LINE: Subsystem creation PR blocked until checklist is complete
- Retrofit archival planned if subsystem is created without exit criteria
- Public logging of violations (to prevent pattern invisibility)

---

## 7. Alternatives Considered & Rejected

### Alternative 1: "No Subsystem Governance at All"
- ❌ Too restrictive; Mermaid pattern was legitimate and valuable
- ❌ Prevents useful bounded enhancements

### Alternative 2: "Unlimited Subsystems, No Exit Plan"
- ❌ Default pattern precedent (status quo, leads to proliferation)
- ❌ Creates implicit ongoing burden

### Alternative 3: "Required Annual Archival Review"
- ❌ Still implies maintenance cadence
- ❌ Doesn't solve the "dormant with cadence" problem

### Chosen Approach
**Upfront exit design + explicit archival sequence + zero residual cadence** — ensures subsystems are bounded, intentional, and retire cleanly.

---

## 8. References

- **GOVERNANCE_PATTERN_LESSONS.md:** Mermaid lifecycle (V1→V19) in detail
- **MERMAID_ARCHIVE_NOTE.md:** Specific archival facts and reactivation conditions
- **MERMAID_TERMINAL_SEAL.md:** Terminal seal authority and non-negotiables
- **.github/copilot-instructions.md:** System-wide governance invariants

---

## 9. Version & History

| Version | Date | Update | Authority |
|---------|------|--------|-----------|
| 1.0 | 2026-02-22 | Initial constitutional rule (derived from Mermaid V1→V19 pattern) | Copilot (V20 implementation) |

---

**Status:** BINDING (Constitutional) | **Scope:** TITANE_INFINITY system-wide | **Next Review:** Not planned (archival reference)
