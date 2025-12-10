---
name: TITANE Orchestration Configuration
version: 19.4.3
created: 2025-12-06
---

# ⚙️ TITANE Copilot Orchestra — Configuration & Setup

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /path/to/TITANE_INFINITY/orchestration
npm install
```

This installs:

- `yaml` : Parse roadmap files
- `chalk` : Colored terminal output
- `clipboardy` : Copy prompts to clipboard
- `ts-node` : Run TypeScript scripts directly
- TypeScript dev dependencies

### 2. Check Status

```bash
npm run status
```

Shows overall progress, phase breakdown, and next task.

### 3. Get Next Task

```bash
npm run next
```

Generates formatted prompt for next task, copies to clipboard.

### 4. Update Progress

```bash
npm run update -- P3-1-1        # Mark P3-1-1 as done
npm run update -- P3-1-2 in-progress  # Mark as in-progress
```

## 📂 Directory Structure

```
TITANE_INFINITY/
├── .github/
│   ├── agents/                      (Copilot agent definitions)
│   │   ├── titane-conductor.agent.md       (Main orchestrator)
│   │   ├── audit-subagent.agent.md         (Code analysis)
│   │   ├── implement-subagent.agent.md     (TDD implementation)
│   │   └── review-subagent.agent.md        (Quality review)
│   │
│   └── instructions/                (Global project instructions)
│       └── titane.instructions.md          (Architecture, standards)
│
└── orchestration/                   (Orchestration system)
    ├── package.json                 (Dependencies + scripts)
    ├── roadmap.yaml                 (Task definitions & tracking)
    ├── scripts/                     (Helper utilities)
    │   ├── generate-next-prompt.ts  (Find & format next task)
    │   ├── update-state.ts          (Update task status)
    │   └── batch-progress.ts        (Show overall progress)
    └── templates/                   (Task templates - optional)
        ├── task-template.md
        ├── plan-template.md
        └── report-template.md
```

## 🎯 Agents Overview

### 🧠 Titane Conductor

**Role** : Master orchestrator for entire TITANE workflow

**Responsibility** :

- Plan phases (PLANNING → IMPLEMENTATION → REVIEW → COMMIT)
- Delegate to subagents
- Manage workflow transitions
- Report progress
- Handle escalations

**Tools** : edit_file, run_in_terminal, search, usages
**Handoffs** :

- 🔍 `audit-subagent` : For code analysis & audits
- ⚙️ `implement-subagent` : For TDD-strict implementation
- ✅ `review-subagent` : For quality review & validation

**Key Command** : Invoke in Copilot Chat with task ID or phase goal

---

### 🔍 Audit Subagent

**Role** : Code analysis and quality auditing

**Responsibility** :

- Scan codebase structure
- Check TypeScript/Rust compilation
- Run linters (clippy, eslint)
- Validate architecture
- Generate audit reports

**Tools** : search, usages, run_in_terminal
**Constraint** : Audit-only, NO code modifications

**Trigger** : When code quality review needed

---

### ⚙️ Implement Subagent

**Role** : TDD-strict development

**Responsibility** :

- Write tests first (RED)
- Implement minimal code (GREEN)
- Refactor for quality (REFACTOR)
- Ensure all tests pass
- Document code

**Tools** : edit_file, run_in_terminal
**Constraint** : MANDATORY TDD workflow

**Trigger** : When implementing new features or fixes

---

### ✅ Review Subagent

**Role** : Quality validation and approval

**Responsibility** :

- Check compilation (cargo check, tsc)
- Validate tests pass
- Run linters with zero tolerance
- Verify architecture compliance
- Approve or request changes

**Tools** : search, run_in_terminal
**Constraint** : NO approval if tests fail or warnings present

**Trigger** : After implementation before commit

## 📋 Typical Workflow

### Phase 1 : PLANNING

```
1. Conductor reads task from roadmap.yaml
2. Conductor creates plan in plans/<task-id>-plan.md
3. Conductor pauses → User reviews plan
4. User approves → proceed to Phase 2
```

### Phase 2 : IMPLEMENTATION

```
1. Conductor delegates to implement-subagent
2. Subagent implements using TDD
   - Write tests (RED)
   - Write code (GREEN)
   - Refactor (REFACTOR)
   - Run full test suite
3. Subagent reports completion
4. Proceed to Phase 3
```

### Phase 3 : REVIEW

```
1. Conductor delegates to review-subagent
2. Subagent checks:
   - Compilation status
   - Test suite pass/fail
   - Linter warnings
   - Architecture compliance
3. Subagent reports: APPROVED, NEEDS_REVISION, or FAILED
4. If APPROVED → Phase 4; else Phase 2 (with feedback)
```

### Phase 4 : COMMIT

```
1. Conductor generates commit message
2. User runs: git add . && git commit -m "..."
3. Conductor updates roadmap status
4. Create report in plans/<task-id>-complete.md
```

### Phase 5 : ITERATION

```
1. Loop to Phase 2 for next micro-phase
2. Or loop to next task if complete
```

## 🛠️ Adding New Tasks

### Step 1 : Define in Roadmap

Edit `orchestration/roadmap.yaml`:

```yaml
- id: P3-X-Y
  title: 'Feature Name'
  description: 'Detailed description of what to implement'
  priority: 'P0' # P0=critical, P1=high, P2=normal
  status: 'todo'
  dependencies: ['P3-X-Z'] # tasks that must complete first
  estimatedTime: '3h'
  files: 2
  tests: 4
```

### Step 2 : Create Task Template

In `plans/` directory, create `<task-id>-plan.md`:

```markdown
# Task Plan — <task-id>

## Objective

<2-3 sentence summary>

## Requirements

- Requirement 1
- Requirement 2

## Files to Create/Modify

- `src-tauri/src/...rs` : <description>
- `src/.../...ts` : <description>

## Tests Required

- test_1 : <description>
- test_2 : <description>

## Architecture Considerations

- How it integrates with 9 motors
- State management approach
- Error handling strategy

## Implementation Steps

1. Write failing tests
2. Implement minimal code
3. Refactor for quality
4. Run full test suite

## Success Criteria

- [ ] All tests pass
- [ ] Zero compiler warnings
- [ ] Code documented
- [ ] Architecture validated
```

## 🔄 Workflow Commands

### Check Status

```bash
npm run status
# Shows progress across all phases and tasks
```

### Get Next Task

```bash
npm run next
# Generates prompt for next task, copies to clipboard
```

### Start Task

In Copilot Chat:

```
You are titane-conductor. Task P3-1-1: Implement Orchestrator motor.
Use the prompt from `npm run next` output.
```

### Update After Implementation

```bash
npm run update -- P3-1-1
# Marks P3-1-1 as done, shows next task
```

### Mark as In-Progress

```bash
npm run update -- P3-1-1 in-progress
```

### Mark as Needs Review

```bash
npm run update -- P3-1-1 review
```

## 🧠 Using Agents in VS Code

### Option 1: Chat with Conductor

1. Open Copilot Chat (Cmd/Ctrl + I)
2. Start with: `@titane-conductor <your task or question>`
3. Follow instructions in agent definition
4. Use handoffs to delegate (`/delegate audit-subagent`)

### Option 2: Direct Agent Chat

1. Open Copilot Chat
2. Use `@audit-subagent`, `@implement-subagent`, or `@review-subagent`
3. Ask specific questions (e.g., "Audit current code for quality issues")

### Option 3: Automated via CLI

```bash
# Get next task (which agent to use is indicated)
npm run next
# Copy the prompt into Copilot Chat
```

## 📊 Progress Tracking

### Command Output Examples

**Status View**:

```
📊 TITANE_INFINITY Orchestration Progress

Phase 0: Audit & Baseline
  ✅ 4/4 complete (100%)
  [████████████████████] 100%

Phase 1: Simplification
  ✅ 4/4 complete (100%)
  [████████████████████] 100%

Phase 2: Fusion Implementation
  ✅ 6/6 complete (100%)
  [████████████████████] 100%

Phase 3: Orchestration & Motors
  🔄 1/7 in progress (14%)
  [███░░░░░░░░░░░░░░░░░] 14%

📈 Overall Status
✅ Completed  : 15/39 tasks
🔄 In Progress: 1 tasks
⏳ Remaining  : 23 tasks

[███████░░░░░░░░░░░░░░] 39%

🎯 Next Task
ID    : P3-1-1
Phase : Orchestration & Motors
Title : Design Orchestrator motor
Status: 🔄 in-progress
```

## 🚫 Important Rules

### For Copilot Agents

1. **NEVER modify** old 14 components
2. **ALWAYS respect** 9-motor architecture
3. **MANDATORY** TDD workflow for implementation
4. **MANDATORY** Zero compiler warnings before commit
5. **MANDATORY** Tests first, code second

### For Using This System

1. Run `npm run status` before starting work
2. Always use `npm run next` to get next task
3. Update status with `npm run update` after each task
4. Create plans in `plans/` directory
5. Follow Conductor workflow (PLANNING → IMPLEMENT → REVIEW → COMMIT)

## 🎓 Learning More

- **Architecture** : Read `.github/instructions/titane.instructions.md`
- **Agent Capabilities** : Read `.github/agents/*.agent.md` files
- **Task Details** : Check `orchestration/roadmap.yaml`
- **Code Standards** : See project README and ARCHITECTURE.md

## 🆘 Troubleshooting

### Scripts Won't Run

```bash
# Make sure Node.js and npm are installed
node --version  # Should be >=16
npm --version   # Should be >=8

# Reinstall dependencies
npm install

# Try running script directly
npx ts-node scripts/batch-progress.ts
```

### Roadmap YAML Errors

```bash
# Validate YAML syntax
npm run status  # Will show parsing errors if any

# Check file formatting (must be valid YAML)
cat orchestration/roadmap.yaml
```

### Agents Not Available

- Ensure `.github/agents/*.agent.md` files exist
- Agents must be named exactly as in agent files
- Copilot Chat must have access to workspace

## 📞 Support

For issues or questions:

1. Check this configuration file
2. Read agent definition files
3. Review global instructions
4. Ask in #development channel
