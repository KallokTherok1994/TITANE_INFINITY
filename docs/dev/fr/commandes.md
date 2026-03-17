# TITANE∞ — Commandes (FR)

**Version :** 28.0.0  
**Statut :** PROVEN  
**Date :** 2026-03-17

> Référence complète des commandes : [docs/reference/fr/commandes-reference.md](../../reference/fr/commandes-reference.md)

---

## Commandes essentielles

```bash
# Installer les dépendances
pnpm install

# Mode développement
pnpm run dev

# Vérification TypeScript
pnpm run check

# Lint
pnpm run lint

# Format
pnpm run format:check

# Tests unitaires
pnpm run test

# Tests Rust
pnpm run test:rust

# Vérification complète
pnpm run verify

# Gates AutoHeal
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

---

## Build

```bash
# Build frontend
pnpm run build

# Build production complète
pnpm run build:production
```

---

*Référence complète : [docs/reference/fr/commandes-reference.md](../../reference/fr/commandes-reference.md)*
