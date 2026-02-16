# Production Build Policy

**Authority**: TITANE∞ Governance (P4-1A)  
**Effective**: 2026-02-16 23:21:37 UTC  
**Status**: 🔒 LOCKED (Production-Safe Build Path)

---

## Executive Summary

This document establishes the **official production build contract** for TITANE∞.

**Core Rule**: Production builds MUST use `build:prod-safe` to prevent system-level side-effects.

**Why**: Post-build hook (`scripts/post-build.sh`) executes system mutations incompatible with CI/production environments (desktop registry updates, cache invalidation, user home modifications).

---

## 1. Official Build Commands

### Development (Local)

```bash
pnpm run build
```

**Effect**:
- Runs `vite build`
- Executes `scripts/post-build.sh` (post-build hook)
- Updates desktop icon registry
- Suitable for **local development only**

**Restrictions**: Do not use in CI/production

---

### Production (CI/Production)

```bash
pnpm run build:prod-safe
```

**Equivalent To**:
```bash
NPM_CONFIG_IGNORE_SCRIPTS=1 vite build
```

**Effect**:
- Skips ALL npm lifecycle scripts (preinstall, postbuild, etc.)
- Runs bare `vite build` only
- Produces `dist/` directory
- Zero system mutations
- **Safe for CI/production** ✅

**Requirement**: **MANDATORY** for P4-1 production builds

---

## 2. Why `postbuild` is Forbidden in Production

### The Problem

`postbuild` script chain:
```
postbuild: "bash scripts/post-build.sh"
  └─ calls: scripts/update-desktop-icon.sh
     ├─ writes: $HOME/.local/share/applications/*.desktop
     ├─ executes: update-desktop-database (system cache)
     ├─ executes: gtk-update-icon-cache (system cache)
     └─ creates: $HOME/.titane/logs/
```

### Why It's Incompatible with Production

| Aspect | Impact | Risk |
|--------|--------|------|
| **User System Mutation** | Modifies user application menu | HIGH |
| **System Cache Update** | Requires desktop environment running | HIGH |
| **User Home Creation** | Creates `/home/builduser/.titane/` | MEDIUM |
| **Reversibility** | Requires manual cleanup | CRITICAL |
| **CI Headless** | Fails silently or requires X11 | CRITICAL |
| **Unattended Build** | Not suitable for automation | CRITICAL |

**Verdict**: Incompatible with production safety contract.

---

## 3. Build Mode Invariants

### Must Always Be True

✅ **Invariant 1**: `build:prod-safe` exists  
✅ **Invariant 2**: `build:prod-safe` contains `NPM_CONFIG_IGNORE_SCRIPTS=1` + `vite build`  
✅ **Invariant 3**: `postbuild` hook is **never removed**  (kept for local development)  
✅ **Invariant 4**: Production builds never execute postbuild (guarded by env)  
✅ **Invariant 5**: No production build runs without explicit build token  
✅ **Invariant 6**: Archive (`deployment/latest/certification/`) remains immutable  

### Verification

**Gate**: `guard-prod-safe-build.mjs`

```bash
pnpm run build:prod-safe:verify
```

**Output**:
- ✅ PROD_BUILD_MODE_LOCKED (all invariants hold)
- ❌ BLOCKED (invariant broken)

---

## 4. Token Gates (P4)

### P4-1: Production Build

**Token Required**:
```
GO_FOR_PROD_BUILD__TITANE_INFINITY=<token>
```

**Command**:
```bash
export GO_FOR_PROD_BUILD__TITANE_INFINITY=<token>
pnpm run build:prod-safe
```

**What Happens**:
1. Frontend build: `vite build` → `dist/`
2. Backend build: `cargo build --release` → `src-tauri/target/release/`
3. Tauri bundle: `tauri build --release` → Final AppImage/DEB

**No post-build hook executes** (environment variable prevents it)

---

### P4-2: Artifact Validation

**What's Checked**:
- ✅ Build artifacts exist (dist/, binary, bundle)
- ✅ File counts match expectations
- ✅ SHA256 checksums verify
- ✅ No system mutations detected
- ✅ Archive remains immutable

**Gate**: Artifact validation proof pack required

---

### P4-3: Production Deploy

**Tokens Required** (Two-step):
```
GO_FOR_PROD_BUILD__TITANE_INFINITY=<token1>
GO_FOR_PROD_DEPLOY__TITANE_INFINITY=<token2>
```

**Actions**:
1. Create git tag: `v<version>-prod`
2. Push tag to origin (explicit, no `--follow-tags`)
3. Append registry entry
4. Create P4 deployment proof pack

**Confirmation**: Manual two-step (pause between P4-2 and P4-3)

---

## 5. Git Tag/Push Policy

### Forbidden

❌ `git push --follow-tags` (implicit tag inclusion)  
❌ `git push origin` without explicit tag name  
❌ ANY tag creation without P4-3 deploy authorization  

### Allowed

✅ `git push origin v<version>-prod` (explicit tag, P4-3 only)  
✅ Append registry (governance record)  
✅ Proof pack documentation (Ring 0)  

### Prevention

**Policy Enforcement**:
- Git config checks (no `push.followTags`)
- Explicit tag name required in all P4-3 push commands
- Proof pack captures exact push command

---

## 6. Rollback Procedures

### Scenario 1: Pre-Commit Rollback

If pre-build validation fails:
```bash
git restore -- package.json scripts/guards/ docs/PRODUCTION_BUILD_POLICY.md
```

### Scenario 2: Post-Commit Rollback

If committed but needs reversal:
```bash
git revert --no-edit <commit-hash>
```

### Scenario 3: Clean Slate (if needed)

```bash
# Remove P4-1A changes
git restore -- package.json
git restore -- scripts/guards/
git restore -- docs/PRODUCTION_BUILD_POLICY.md
git restore -- docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md

# Verify clean
git status
# Expected: "working tree clean" or only untracked deployment/ folder
```

---

## 7. Governance Records

### Registry Entry (P4-1A)

**Timestamp**: 2026-02-16T23:21:37Z  
**Entry**: P4-1A Production Build Mode Hardening  
**Status**: LOCKED (postbuild neutralized via build:prod-safe)  
**Proof Pack**: reports/ai_local_vΩ3/P4_1A_BUILD_MODE_HARDENING_<UTC>/

### Verification Commands

```bash
# Verify policy locked
pnpm run build:prod-safe:verify

# Verify build:prod-safe script exists
grep "build:prod-safe" package.json

# Verify postbuild retained
grep "postbuild" package.json

# Verify no system mutations
ls -la ~/.local/share/applications/ | grep titane
# Expected: (empty output after P4-1 build)
```

---

## 8. Frequently Asked Questions

### Q: Can I use `pnpm build` in CI?
**A**: No. Always use `pnpm run build:prod-safe` in CI/production.

### Q: Why not modify postbuild directly?
**A**: Append-only governance policy. All changes non-destructive, reversible via git.

### Q: What if post-build fails in CI?
**A**: Not an issue. Post-build is skipped (`NPM_CONFIG_IGNORE_SCRIPTS=1`).

### Q: Can I remove `build:prod-safe:verify`?
**A**: No. It's a governance gate. Removing it violates policy.

### Q: How do I test post-build locally?
**A**: Use `pnpm build` (not `build:prod-safe`). This only runs locally.

---

## 9. Summary

| Item | Status | Notes |
|------|--------|-------|
| `build:prod-safe` | ✅ Implemented | Production-safe build command |
| `postbuild` | ✅ Retained | Local development, CI skipped |
| `build:prod-safe:verify` | ✅ Implemented | Governance gate |
| Archive immutable | ✅ Maintained | P3-7 seal remains locked |
| Registry append-only | ✅ Maintained | P4-1A entry added |
| Token gates | ✅ Required | GO_FOR_PROD_BUILD, GO_FOR_PROD_DEPLOY |

---

## 10. Authority

**Document**: PRODUCTION_BUILD_POLICY.md  
**Authority**: Copilot (AUTO mode, stop-the-line strict)  
**Governance**: P4-1A Production Build Mode Hardening  
**Effective Date**: 2026-02-16T23:21:37Z  
**Status**: 🔒 LOCKED FOR PRODUCTION

---

**Last Updated**: 2026-02-16T23:21:37Z  
**Next Review**: After P4-1 successful production build
