# TITANE∞ — Documentation Développeur (FR)

**Version :** 30.0.0  
**Statut :** PARTIAL  
**Date :** 2026-04-11

> Documentation canonique pour les développeurs contribuant à TITANE∞.

---

## Navigation

| Document | Description |
|---|---|
| [Setup de l'environnement](./setup-environnement.md) | Installation et configuration de l'environnement de développement |
| [Architecture](./architecture.md) | Architecture 4-Ring, IPC, politique réseau |
| [Structure du dépôt](./structure-du-repo.md) | Répertoires et organisation des fichiers |
| [Commandes](./commandes.md) | Référence des commandes de développement |
| [Workflows](./workflows.md) | Workflows de développement, bugfix, release |
| [Tests, preuves et gates](./tests-preuves-et-gates.md) | Stratégie de test et gouvernance des gates |
| [Build, release et rollback](./build-release-et-rollback.md) | Pipeline de build et procédures de rollback |
| [Observabilité et debug](./observabilite-et-debug.md) | Logs, diagnostics, proof packs |
| [Conventions](./conventions.md) | Standards de code et documentation |
| [Dépannage développeur](./depannage-dev.md) | Problèmes courants en développement |

---

## Prérequis rapides

```bash
node --version   # ≥ 20.x
pnpm --version   # ≥ 9.x
rustc --version  # Rust 2021 edition
tauri --version  # Tauri CLI v2.x
```

---

## Démarrage express

```bash
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
pnpm install
pnpm run dev
```

---

*Documentation en anglais : [docs/dev/en/README.md](../en/README.md)*
