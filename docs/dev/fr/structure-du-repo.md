# TITANE∞ — Structure du Dépôt (FR)

**Version :** 30.0.0  
**Statut :** PROVEN  
**Date :** 2026-04-11

---

## Répertoires principaux

```
TITANE_INFINITY/
├── src/                    # Frontend React + TypeScript (Ring 4 UI)
│   ├── types/              # Ring 1 — Contrats de type
│   ├── engines/            # Ring 2 — Logique pure
│   ├── services/           # Ring 3 — Orchestration I/O
│   ├── features/           # Fonctionnalités (audio, chat, etc.)
│   ├── components/         # Composants React réutilisables
│   ├── hooks/              # Hooks React
│   ├── lib/                # Librairies utilitaires
│   └── ...
├── src-tauri/              # Backend Rust + config Tauri (Ring 4 OS/IPC)
│   ├── src/                # Code source Rust
│   ├── Cargo.toml          # Dépendances Rust + version
│   ├── tauri.conf.json     # Config Tauri principale
│   └── allowlist.whitelist.stable.json  # Allowlist IPC stable
├── docs/                   # Documentation (flat + structurée)
│   ├── user/               # Docs utilisateur (fr/ + en/)
│   ├── dev/                # Docs développeur (fr/ + en/)
│   ├── governance/         # Docs gouvernance (fr/ + en/)
│   ├── reference/          # Docs référence (fr/ + en/)
│   └── ...                 # Nombreux fichiers historiques
├── tests/                  # Tests unitaires et intégration
├── e2e/                    # Tests E2E (Playwright + WDIO desktop)
├── scripts/                # Scripts de vérification, gates, autoheal
│   ├── autoheal/           # Système AutoHeal + detect_recurrence.sh
│   ├── gates/              # Gates de gouvernance (G1, G2, G3, etc.)
│   ├── verify/             # Scripts de vérification
│   └── ...
├── governance/             # Schémas et règles de gouvernance
├── proof_packs/            # Packs de preuves (append-only)
├── registry/               # Registre d'événements (append-only)
├── reports/                # Rapports de run
├── deployment/             # Scripts et configs de déploiement
├── memory/                 # Fichiers de mémoire persistée
├── orchestration/          # Orchestration et coordination
├── runtime/                # Runtime configs
├── legacy/                 # Code legacy conservé
├── .github/                # Workflows CI, instructions, prompts
│   ├── workflows/          # CI/CD (ci.yml, rust.yml, etc.)
│   ├── instructions/       # Instructions Copilot
│   └── prompts/            # Prompts Copilot
├── package.json            # Dépendances frontend + scripts (VERSION CANONIQUE)
├── pnpm-lock.yaml          # Lock file pnpm
├── tauri.base.json         # Config Tauri de base
├── README.md               # README principal (entrée canonique)
├── CHANGELOG.md            # Historique des changements
└── ...
```

---

## Fichiers clés

| Fichier | Rôle | Autorité |
|---|---|---|
| `package.json` | Version canonique + scripts | SOURCE DE VERSION PRINCIPALE |
| `src-tauri/Cargo.toml` | Version Rust + dépendances | Doit correspondre à package.json |
| `CHANGELOG.md` | Historique des versions | Corrobore la version |
| `README.md` | Entrée principale | Surface canonique |
| `tauri.base.json` | Config Tauri de base | Critique |
| `src-tauri/allowlist.whitelist.stable.json` | IPC allowlist stable | Critique — ne pas modifier sans gate |
| `scripts/verify_instructions.sh` | Gate d'instructions principal | Doit passer PASS=20 FAIL=0 |
| `scripts/autoheal/autoheal_rules.jsonl` | Registre AutoHeal | Append-only |

---

## Fichiers legacy notables (à la racine)

| Fichier | Statut | Notes |
|---|---|---|
| `TITANE_INFINITY-main.zip` | LEGACY | Archive ancienne version |
| `titane-infinity@16.2.3` | LEGACY | Placeholder vide |
| `titane-infinity@9.0.0` | LEGACY | Placeholder vide |
| `*.txt` (rapports) | LEGACY | Rapports historiques |
| `*.sh` (scripts racine) | LEGACY | Scripts de déploiement anciens |

---

*Documentation en anglais : [docs/dev/en/repo-structure.md](../en/repo-structure.md)*
