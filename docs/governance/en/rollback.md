# TITANE∞ — Rollback (EN)

**Version:** 28.0.0  
**Status:** PROVEN  
**Date:** 2026-03-17

---

## Principle

Every governed modification must have an explicit rollback based on `git restore` or `git revert`.

**Rule:** Always document the rollback in the proof pack or AutoHeal entry.

---

## Rollback commands

### Docs rollback

```bash
git restore -- docs/
```

### Specific file rollback

```bash
git restore -- path/to/file.ts
```

### Rollback all uncommitted changes

```bash
git restore -- .
```

### Rollback last commit

```bash
git revert HEAD --no-commit
git commit -m "revert: description"
```

### Rollback a specific commit

```bash
git revert <sha> --no-commit
git commit -m "revert: description of what is being undone"
```

---

## IPC surface rollback

```bash
# IPC contract
git restore -- docs/IPC_CONTRACT.md src/services/api/chat.ts

# Allowlist
git restore -- src-tauri/allowlist.whitelist.stable.json

# Rust commands
git restore -- src-tauri/src/main.rs
```

---

## Tauri configuration rollback

```bash
git restore -- tauri.base.json src-tauri/tauri.conf.json
```

---

## Governance instructions rollback

```bash
git restore -- .github/copilot-instructions.md .github/instructions/titane.instructions.md
git restore -- .github/prompts .github/agents src/AGENTS.md src-tauri/AGENTS.md
git restore -- scripts/verify governance
```

---

## Rollback format in AutoHeal

Each AutoHeal entry must contain:

```json
{
  "rollback": "git restore -- file1.ts file2.ts"
}
```

---

## Post-rollback verification

After any rollback:

```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
pnpm run check
pnpm run lint
```

---

*French documentation: [docs/governance/fr/rollback.md](../fr/rollback.md)*
