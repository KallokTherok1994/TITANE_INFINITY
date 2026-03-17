# TITANE∞ — Workflows (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## Docs-only workflow (PATH_SIMPLE)

For documentation-only changes:

```bash
# 1. Create branch
git checkout -b docs/my-change

# 2. Edit docs files only
# (only .md files, no runtime code)

# 3. Verify (docs only — no runtime tests required)
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# 4. Commit
git add docs/
git commit -m "docs: describe the change"

# 5. Push and open PR
```

---

## Standard developer workflow

```bash
# 1. Create branch from MAIN
git checkout MAIN
git pull
git checkout -b feat/my-feature

# 2. Develop
pnpm run dev

# 3. Continuous verification
pnpm run check          # TypeScript
pnpm run lint           # ESLint
pnpm run format:check   # Prettier
pnpm run test           # Vitest

# 4. Before commit — full check
pnpm run verify
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# 5. Commit
git add -p  # Selective review of changes
git commit -m "feat: description"

# 6. Push
git push origin feat/my-feature
```

---

## Bugfix workflow

```bash
# 1. Identify bug — clearly document the symptom

# 2. Create branch
git checkout -b fix/bug-description

# 3. Fix — minimal change

# 4. AutoHeal capture (MANDATORY)
# Add entry to scripts/autoheal/autoheal_rules.jsonl
# Format: see existing entries in the file
# prevention_test field MUST contain "detect_recurrence"

# 5. Verify
pnpm run test
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# 6. Commit
git commit -m "fix: describe the fix"
```

---

## Validation workflow

```bash
# Full check before PR
pnpm run verify:final100

# Individual gates
pnpm run verify:tauri-only
pnpm run verify:online-first
pnpm run verify:tauri-configs
pnpm run verify:instructions
bash scripts/gates/g1-no-offline-without-reason.sh
bash scripts/gates/g3-legacy-divergence.sh
bash scripts/autoheal/detect_recurrence.sh
```

---

## Release workflow

> **RESTRICTED** — Requires PROD governance tokens.

```
Required token: GO_FOR_PROD_BUILD__TITANE_INFINITY
Required token: GO_FOR_PROD_DEPLOY__TITANE_INFINITY
```

Without these tokens: **STOP-THE-LINE**

---

## Rollback workflow

```bash
# Rollback a specific file
git restore -- path/to/file.ts

# Rollback all docs
git restore -- docs/

# Full rollback from known commit
git revert HEAD --no-commit
git commit -m "revert: description"
```

---

*French documentation: [docs/dev/fr/workflows.md](../fr/workflows.md)*
