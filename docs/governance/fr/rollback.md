# TITANE∞ — Rollback (FR)

**Version :** 28.0.0  
**Statut :** PROVEN  
**Date :** 2026-03-17

---

## Principe

Chaque modification gouvernée doit avoir un rollback explicite, basé sur `git restore` ou `git revert`.

**Règle :** Toujours documenter le rollback dans le proof pack ou l'entrée AutoHeal.

---

## Commandes de rollback

### Rollback docs

```bash
git restore -- docs/
```

### Rollback fichier spécifique

```bash
git restore -- path/to/file.ts
```

### Rollback tous les changements non commités

```bash
git restore -- .
```

### Rollback du dernier commit

```bash
git revert HEAD --no-commit
git commit -m "revert: description"
```

### Rollback d'un commit spécifique

```bash
git revert <sha> --no-commit
git commit -m "revert: description de ce qui est annulé"
```

---

## Rollback de la surface IPC

```bash
# IPC contract
git restore -- docs/IPC_CONTRACT.md src/services/api/chat.ts

# Allowlist
git restore -- src-tauri/allowlist.whitelist.stable.json

# Commandes Rust
git restore -- src-tauri/src/main.rs
```

---

## Rollback de configuration Tauri

```bash
git restore -- tauri.base.json src-tauri/tauri.conf.json
```

---

## Rollback des instructions de gouvernance

```bash
git restore -- .github/copilot-instructions.md .github/instructions/titane.instructions.md
git restore -- .github/prompts .github/agents src/AGENTS.md src-tauri/AGENTS.md
git restore -- scripts/verify governance
```

---

## Format du rollback dans AutoHeal

Chaque entrée AutoHeal doit contenir :

```json
{
  "rollback": "git restore -- fichier1.ts fichier2.ts"
}
```

---

## Vérification post-rollback

Après tout rollback :

```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
pnpm run check
pnpm run lint
```

---

*Documentation en anglais : [docs/governance/en/rollback.md](../en/rollback.md)*
