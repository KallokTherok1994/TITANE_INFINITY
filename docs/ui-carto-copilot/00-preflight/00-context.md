# PHASE A: PREFLIGHT — Context & Fingerprint

**Date:** 2026-02-07  
**Audit ID:** TITANE_UI_CARTOGRAPHY_AUDIT_MAX  
**Version:** vΩ.UI.CARTO.AUDIT.MAX.YAML.1  
**Mode:** AUTO_EXEC  
**Scope:** FRONTEND_UI_ONLY

---

## System Context

### Git Status
- **Commit Hash:** `096429913abc907c53c558fb2d0730e84672bf9a`
- **Branch:** `copilot/audit-ui-cartography-max`
- **Dirty Status:** Clean (0 uncommitted files)
- **Last Commit:** "Initial plan"

### Environment Versions

#### Node.js & Package Manager
- **Node Version:** v24.13.0
- **pnpm Version:** 10.28.2 (packageManager)
- **Package Manager Enforcement:** ✅ Enforced via preinstall script

#### Framework Versions (from package.json)
- **React:** ^19.2.4
- **React DOM:** ^19.2.4
- **Vite:** ^7.3.1
- **TypeScript:** ^5.9.3
- **Tauri CLI:** ^2.9.6
- **Tauri API:** ^2.9.1

#### Tauri Backend
- **Tauri Version (Cargo):** 27.0.1
- **Rust Version:** 1.83 (documented in .copilot-rules-permanent.md)
- **Tauri Config:** `src-tauri/Cargo.toml` exists

#### Testing Frameworks
- **Vitest:** 4.0.18
- **Playwright:** ^1.58.1
- **@testing-library/react:** ^16.3.2
- **@testing-library/jest-dom:** ^6.9.1

### Operating System
- **OS:** Linux (Ubuntu 24.04 - GitHub Actions runner)
- **Kernel:** 6.11.0-1018-azure #18~24.04.1-Ubuntu
- **Architecture:** x86_64

### Project Metadata
- **Project Name:** titane-infinity
- **Version:** 27.0.1
- **Description:** TITANE∞ v27.0.1 - Cognitive Operating System: Production Hotfix (vΩ.1 Boot + vΩ.2 UI Loading)
- **License:** SEE LICENSE.md (Proprietary)
- **Type:** module (ES Modules)

---

## UI Launch Commands

### Development Mode (MANDATORY per .copilot-rules-permanent.md)
```bash
# Primary dev command (Titan-Dev)
pnpm run dev:tauri

# With Ollama (local LLM)
pnpm run dev:tauri:no-ollama

# Full local dev with Ollama
bash scripts/dev/full_local_tauri_ollama.sh -- tauri dev --config runtime/dev/tauri.conf.json --no-watch
```

### Build Commands (PRODUCTION FORBIDDEN until explicit approval)
```bash
# ❌ FORBIDDEN without authorization from Kevin Thibault
pnpm run build
pnpm run build:production

# Reason: RÈGLE CRITIQUE #1 — MODE DÉVELOPPEMENT PERMANENT
# Date Added: 2026-01-02
```

### Testing Commands
```bash
# Unit tests (Vitest)
pnpm run test

# E2E tests (Playwright)
pnpm run test:e2e

# Rust tests (cargo test)
pnpm run test:rust

# All tests
pnpm run test:all

# Coverage
pnpm run test:coverage
```

### Verification Commands
```bash
# Linting
pnpm run lint

# Type checking
pnpm run check

# Format check
pnpm run format:check

# Comprehensive verification
pnpm run verify
```

---

## Critical Rules in Effect

### RÈGLE CRITIQUE #1 — MODE DÉVELOPPEMENT PERMANENT (2026-01-02)
**Authority:** Kevin Thibault (Créateur TITANE∞)

**Interdictions absolues:**
- ❌ NE JAMAIS déployer AppImage/DEB sans autorisation écrite explicite
- ❌ NE JAMAIS lancer builds de production (Titan-Stable, bundles, packages)
- ❌ NE JAMAIS exécuter `pnpm run build`, `tauri build`, tâche "🔵 Build Titan-Stable"

**Mode de travail OBLIGATOIRE:**
- ✅ Titan-Dev uniquement (tâche "🟢 Launch Titan-Dev")
- ✅ Console / Scripts / Terminal pour tous les tests
- ✅ Paramètres de sécurité MINIMAUX (dev-friendly)

### RÈGLE CRITIQUE #2 — REGISTRE UI OBLIGATOIRE (2026-02-02)
**Obligation:** TOUTE modification UI DOIT être enregistrée dans `registry/ui-events.jsonl`
- Append-only (JSONL)
- Champs obligatoires complets
- Gate `GATE_UI_INDEX` doit passer avant validation QUALIFIED/STABLE

### RÈGLE CRITIQUE #3 — FERMETURE DES PORTS (2026-01-05)
**Obligation:** FERMER IMMÉDIATEMENT tout port ou terminal marqué comme déprécié ou non autorisé

---

## Audit Execution Context

### Current Working Directory
```
/home/runner/work/TITANE_INFINITY/TITANE_INFINITY
```

### Documentation Root
```
docs/ui-carto-copilot/
```

### Audit Execution
- **Automated:** YES
- **Manual Review:** NO (fully automated audit)
- **Output Format:** Markdown (traceability required per L0_VERITE_PREUVES)

---

## Next Steps

✅ PHASE A: PREFLIGHT complete  
⏭️ Proceed to PHASE B: NAVIGATION (10-navigation/)
