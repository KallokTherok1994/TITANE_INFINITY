# TITANE∞ — Developer Documentation (EN)

**Version:** 30.0.0  
**Status:** PARTIAL  
**Date:** 2026-04-11

> Canonical guide for TITANE∞ developers and contributors.

---

## Navigation

| Document | Description |
|---|---|
| [Environment Setup](./environment-setup.md) | Install and configure dev environment |
| [Architecture](./architecture.md) | 4-Ring architecture, IPC, network policy |
| [Repo Structure](./repo-structure.md) | Directory layout and key files |
| [Commands](./commands.md) | Development commands reference |
| [Workflows](./workflows.md) | Development, bugfix, release workflows |
| [Tests, Proofs and Gates](./tests-proofs-and-gates.md) | Testing strategy and governance gates |
| [Verdict Runbook](./verdict-runbook.md) | How to choose PASS, FAIL, BLOCKED, DONE, or SEALED |
| [Build, Release and Rollback](./build-release-and-rollback.md) | Build pipeline and rollback procedures |
| [Observability and Debug](./observability-and-debug.md) | Logs, diagnostics, proof packs |
| [Conventions](./conventions.md) | Code and documentation standards |
| [Dev Troubleshooting](./dev-troubleshooting.md) | Common development issues |

---

## Quick prerequisites

```bash
node --version   # ≥ 20.x
pnpm --version   # ≥ 9.x
rustc --version  # Rust 2021 edition
tauri --version  # Tauri CLI v2.x
```

---

## Quick start

```bash
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
pnpm install
pnpm run dev
```

---

*French documentation: [docs/dev/fr/README.md](../fr/README.md)*
