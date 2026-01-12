# GitHub Copilot Instructions Setup - Complete Guide

**Date:** 2025-12-20  
**Author:** GitHub Copilot Coding Agent  
**Issue:** #[issue-number] - Set up Copilot instructions

---

## 📋 Overview

This document describes the complete GitHub Copilot instructions setup for TITANE_INFINITY, following [GitHub's best practices for Copilot coding agent](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results).

## ✅ What Was Configured

### 1. Core Instruction Files

#### `.github/copilot-instructions.md`
- **Purpose:** Main repository-level instructions for GitHub Copilot
- **Content:** COPILOT-XS protocol with 3 layers (Rules, Agents, Routing)
- **Scope:** Repository-wide coding guidelines
- **Status:** ✅ Already existed, verified compliant

#### `.github/instructions/titane.instructions.md`
- **Purpose:** Detailed project-specific coding guidelines
- **Content:** 
  - TITANE∞ architecture (4-Ring Model)
  - Stack technique (React, Tauri, Rust, Vitest)
  - OMEGA Pipeline v2 requirements
  - Code conventions for TypeScript and Rust
  - Testing requirements
- **Enhancement:** ✅ **Added YAML frontmatter** for targeted application
  - Applies to: `src/**/*`, `src-tauri/**/*`, `tests/**/*`, `scripts/**/*`
  - Targets file types: `*.ts`, `*.tsx`, `*.rs`, `*.js`
- **Status:** ✅ Enhanced with frontmatter

#### `.copilot-rules-permanent.md`
- **Purpose:** Permanent, non-negotiable rules for TITANE∞
- **Content:**
  - Tauri-only philosophy (no HTTP servers)
  - Local-first architecture (100% offline-ready)
  - External APIs only on explicit request
  - WebKitGTK >= 2.40 requirement
  - GLIBC >= 2.37 requirement
- **Status:** ✅ Already existed, preserved as-is

### 2. Agent Configuration

#### `.github/copilot-agents/`
Specialized agent definitions for different tasks:
- `guardian.agent.md` — Quality and security enforcement
- `dependency-guardian.agent.md` — Safe dependency management
- `architect.agent.md` — Architecture compliance
- `orchestrator.agent.md` — Task coordination
- `agents/` subdirectory with role-specific agents:
  - `security.agent.md`
  - `architecture.agent.md`
  - `code-reviewer.agent.md`
  - `devops.agent.md`
  - `ai-ml-engineer.agent.md`
  - `data-scientist.agent.md`

**Status:** ✅ Already existed, verified complete

#### `.github/copilot-routing.json`
- **Purpose:** Route tasks to appropriate specialist agents
- **Content:** Priority-based routing rules for security, infra, AI/ML, architecture
- **Status:** ✅ Already existed, verified functional

### 3. Agent Skills (NEW)

#### `.github/skills/`
Reusable agent skills for specialized workflows:

- **`README.md`** — Skills directory documentation
- **`architecture-check/`** — Architecture validation skill
  - `instructions.md` — Complete 4-Ring Model validation guide
  - Usage: `@copilot use skill architecture-check`

**Status:** ✅ **NEW** - Created following GitHub best practices

**Benefits:**
- Portable across Copilot CLI, VS Code, and GitHub.com
- Reusable across different coding sessions
- Enables consistent architecture validation

### 4. Validation Automation

#### `.github/copilot-xs/`
Automated validation scripts:
- `scripts/validate.js` — Check for prohibited markers and secrets
- `scripts/precommit.js` — Pre-commit validation hook
- `scripts/agent-status.js` — Verify Copilot XS configuration
- `scripts/security-scan.js` — Security scanning

**NPM Scripts:**
```json
{
  "copilot-xs:validate": "node .github/copilot-xs/scripts/validate.js",
  "copilot-xs:precommit": "node .github/copilot-xs/scripts/precommit.js",
  "copilot-xs:status": "node .github/copilot-xs/scripts/agent-status.js",
  "copilot-xs:security-scan": "node .github/copilot-xs/scripts/security-scan.js",
  "copilot-xs:test": "pnpm run copilot-xs:validate && pnpm run test:all"
}
```

**Status:** ✅ Already existed, verified operational

### 5. Documentation Updates (NEW)

#### `README.md`
- **Added:** New section "GitHub Copilot Instructions"
- **Location:** Under "Développement" section, after "Git Workflow"
- **Content:**
  - Links to all instruction files
  - Validation commands
  - List of specialized agents
  - Link to COPILOT-XS README
- **Status:** ✅ **UPDATED**

#### `CONTRIBUTING.md`
- **Added:** New section "🤖 GitHub Copilot Instructions"
- **Location:** Before "Resources" section
- **Content:**
  - Configuration overview
  - Validation commands
  - Specialized agents list
  - Agent skills usage
  - Recommended workflow
- **Status:** ✅ **UPDATED**

---

## 🎯 Features & Benefits

### For Developers

1. **Consistent Code Generation**
   - Copilot automatically follows project conventions
   - Architecture rules enforced (4-Ring Model)
   - Type safety and error handling patterns

2. **Automated Quality Checks**
   - Pre-commit validation (`copilot-xs:validate`)
   - Secret scanning
   - Prohibited marker detection (TODO, FIXME)

3. **Specialized Assistance**
   - Security-focused agent for sensitive code
   - Architecture agent for structural decisions
   - Dependency agent for safe package management

4. **Reusable Skills**
   - Architecture validation on-demand
   - Portable across different tools
   - Extensible for new workflows

### For GitHub Copilot

1. **Context-Aware Suggestions**
   - YAML frontmatter targets specific directories
   - Different rules for src/, src-tauri/, tests/
   - File-type specific guidelines

2. **Routing Intelligence**
   - Security tasks → Security Auditor agent
   - Infrastructure → DevOps Engineer agent
   - Architecture → Systems Architect agent

3. **Validation Integration**
   - Built-in validation before commits
   - Automated status checks
   - Clear pass/fail feedback

---

## 📚 How to Use

### For Manual Development

1. **Enable GitHub Copilot** in your IDE (VS Code recommended)

2. **Index Workspace** (VS Code):
   ```
   Cmd/Ctrl + Shift + P → "Index workspace"
   ```

3. **Start Coding** — Copilot will automatically use the instructions

4. **Validate Before Commit:**
   ```bash
   pnpm run copilot-xs:validate
   ```

### For Copilot Coding Agent

1. **Assign an Issue** to `@copilot` on GitHub

2. **Copilot Reviews Instructions** automatically:
   - Reads `.github/copilot-instructions.md`
   - Applies `.github/instructions/titane.instructions.md` rules
   - Respects `.copilot-rules-permanent.md` constraints

3. **Agent Routes Task** via `.github/copilot-routing.json`

4. **Validation Runs** automatically via `copilot-xs:validate`

### Using Agent Skills

```bash
# In GitHub Copilot chat or PR comment
@copilot use skill architecture-check

# Copilot will validate architecture compliance
# and provide detailed feedback
```

---

## 🔧 Configuration Options

### Validation Scope

```bash
# Validate only staged files (default)
pnpm run copilot-xs:validate

# Validate all files
COPILOT_XS_SCOPE=all pnpm run copilot-xs:validate
```

### Secret Scanning

```bash
# Disable secret scanning
COPILOT_XS_SECRET_SCAN=0 pnpm run copilot-xs:validate

# Scan secrets in tests too
COPILOT_XS_SECRET_SCAN_IN_TESTS=1 pnpm run copilot-xs:validate

# Adjust minimum characters for secret detection
COPILOT_XS_SECRET_MIN_CHARS=64 pnpm run copilot-xs:validate

# Allowlist specific patterns
COPILOT_XS_SECRET_ALLOW_REGEX='example|dummy' pnpm run copilot-xs:validate
```

### Prohibited Markers

```bash
# Custom prohibited terms
COPILOT_XS_PROHIBITED='TODO,FIXME,HACK' pnpm run copilot-xs:validate

# Allow prohibited markers in tests
COPILOT_XS_ALLOW_PROHIBITED_IN_TESTS=1 pnpm run copilot-xs:validate
```

---

## 📈 Verification

### Status Check

```bash
pnpm run copilot-xs:status
```

**Expected Output:**
```
🎯 COPILOT-XS STATUS REPORT

✅ Layer 1: Instructions
✅ Layer 2: Agent roster
✅ Layer 3: Routing
✅ Layer 3: Workflow
✅ Automation: validate.js
✅ Automation: precommit.js

🚀 System Status: OPERATIONAL
```

### Validation Check

```bash
pnpm run copilot-xs:validate
```

**Expected Output:**
```
✅ COPILOT-XS VALIDATION PASSED
```

---

## 🎨 Architecture Alignment

The Copilot instructions are fully aligned with TITANE∞'s **4-Ring Architecture**:

### Ring 1: Core (Types & Constants)
- Enforced: Zero imports
- Validated: Type purity
- Instructions apply: Type definitions, interfaces

### Ring 2: Engines (Pure Logic)
- Enforced: Ring 1 imports only
- Validated: No I/O operations
- Instructions apply: Business logic, algorithms

### Ring 3: Services (I/O Layer)
- Enforced: Ring 1+2 imports only
- Validated: I/O abstraction
- Instructions apply: API calls, storage, Tauri commands

### Ring 4: OS/UI (System Layer)
- Allowed: All imports
- Validated: UI conventions
- Instructions apply: React components, Tauri backend

---

## 🔐 Security Considerations

1. **Secret Scanning:** Automatic detection of potential secrets
2. **Input Validation:** Guidelines for sanitizing user inputs
3. **OWASP Compliance:** Security checklist for sensitive operations
4. **Tauri-Only:** No HTTP servers = reduced attack surface
5. **Local-First:** No external dependencies by default

---

## 🚀 Next Steps

### For Contributors

1. ✅ Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. ✅ Review [.github/copilot-instructions.md](../.github/copilot-instructions.md)
3. ✅ Run `pnpm run copilot-xs:status` to verify setup
4. ✅ Start coding with Copilot assistance

### For Maintainers

1. 🔄 Keep instructions updated with architecture changes
2. 🔄 Add new skills for recurring workflows
3. 🔄 Monitor Copilot-generated code quality
4. 🔄 Refine agent routing based on task outcomes

---

## 📖 References

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Copilot Custom Instructions](https://github.blog/changelog/2025-07-23-github-copilot-coding-agent-now-supports-instructions-md-custom-instructions/)
- [Agent Skills Documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [TITANE∞ Architecture Documentation](../docs/ARCHITECTURE.md)
- [COPILOT-XS Protocol](../.github/copilot-xs/README.md)

---

## ✅ Summary

This setup provides:
- ✅ Repository-level instructions (`.github/copilot-instructions.md`)
- ✅ Detailed project guidelines (`.github/instructions/titane.instructions.md`)
- ✅ YAML frontmatter for targeted application
- ✅ Permanent rules (`.copilot-rules-permanent.md`)
- ✅ Specialized agents (`.github/copilot-agents/`)
- ✅ Agent routing (`.github/copilot-routing.json`)
- ✅ Reusable skills (`.github/skills/`)
- ✅ Automated validation (`copilot-xs:validate`)
- ✅ Documentation in README and CONTRIBUTING

**Status:** ✅ **COMPLETE** - ✅ Tech-Ready (Dev) | Production: ⛔ EN ATTENTE (autorisation requise) use with GitHub Copilot

---

**For questions or improvements, please open an issue or PR.**
