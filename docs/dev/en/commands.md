# TITANE∞ — Commands (EN)

**Version:** 28.0.0  
**Status:** PROVEN  
**Date:** 2026-03-17

> Full commands reference: [docs/reference/en/commands-reference.md](../../reference/en/commands-reference.md)

---

## Essential commands

```bash
# Install dependencies
pnpm install

# Dev mode
pnpm run dev

# TypeScript check
pnpm run check

# Lint
pnpm run lint

# Format check
pnpm run format:check

# Unit tests
pnpm run test

# Rust tests
pnpm run test:rust

# Full verification
pnpm run verify

# AutoHeal gates
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

---

## Build

```bash
# Frontend build
pnpm run build

# Full production build
pnpm run build:production
```

---

*Full reference: [docs/reference/en/commands-reference.md](../../reference/en/commands-reference.md)*  
*French documentation: [docs/dev/fr/commandes.md](../fr/commandes.md)*
