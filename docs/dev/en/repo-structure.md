# TITANE∞ — Repo Structure (EN)

**Version:** 33.0.0  
**Status:** ACTIVE STRUCTURE WITH ARCHIVED OBSOLETE SURFACES  
**Date:** 2026-05-03

---

## Main directories

```
TITANE_INFINITY/
├── src/                    # React + TypeScript frontend (Ring 4 UI)
│   ├── types/              # Ring 1 — Type contracts
│   ├── engines/            # Ring 2 — Pure logic
│   ├── services/           # Ring 3 — Governed I/O orchestration
│   ├── features/           # Feature modules (audio, chat, etc.)
│   ├── components/         # Reusable React components
│   ├── hooks/              # React hooks
│   ├── lib/                # Utility libraries
│   └── ...
├── src-tauri/              # Rust backend + Tauri config (Ring 4 OS/IPC)
│   ├── src/                # Rust source code
│   ├── Cargo.toml          # Rust dependencies + version
│   ├── tauri.conf.json     # Main Tauri config
│   └── allowlist.whitelist.stable.json  # Stable IPC allowlist
├── docs/                   # Documentation (flat + structured)
│   ├── user/               # User docs (fr/ + en/)
│   ├── dev/                # Developer docs (fr/ + en/)
│   ├── governance/         # Governance docs (fr/ + en/)
│   ├── reference/          # Reference docs (fr/ + en/)
│   ├── 99_ARCHIVE/         # Canonical archive vault for obsolete docs/backups
│   └── ...                 # Many historical files
├── tests/                  # Unit and integration tests
├── e2e/                    # E2E tests (Playwright + WDIO desktop)
├── scripts/                # Verification scripts, gates, autoheal
│   ├── autoheal/           # AutoHeal system + detect_recurrence.sh
│   ├── gates/              # Governance gates (G1, G2, G3, etc.)
│   ├── verify/             # Verification scripts
│   └── ...
├── governance/             # Governance schemas and rules
├── proof_packs/            # Proof packs (append-only)
├── registry/               # Event registry (append-only)
├── reports/                # Run reports
├── deployment/             # Deployment scripts and configs
├── memory/                 # Persisted memory files
├── orchestration/          # Orchestration and coordination
├── runtime/                # Runtime configs
├── legacy/                 # Kept legacy code
├── _archive/               # Historical archive outside active runtime surface
├── .github/                # CI workflows, instructions, prompts
│   ├── workflows/          # CI/CD (ci.yml, rust.yml, etc.)
│   ├── instructions/       # Copilot instructions
│   └── prompts/            # Copilot prompts
├── package.json            # Frontend deps + scripts (CANONICAL VERSION SOURCE)
├── pnpm-lock.yaml          # pnpm lock file
├── tauri.base.json         # Base Tauri config
├── README.md               # Main README (canonical entry point)
├── CHANGELOG.md            # Change history
└── ...
```

---

## Key files

| File | Role | Authority |
|---|---|---|
| `package.json` | Canonical version + scripts | PRIMARY VERSION SOURCE |
| `src-tauri/Cargo.toml` | Rust version + dependencies | Must match package.json |
| `CHANGELOG.md` | Version history | Corroborates version |
| `README.md` | Main entry point | Canonical surface |
| `tauri.base.json` | Base Tauri config | Critical |
| `src-tauri/allowlist.whitelist.stable.json` | Stable IPC allowlist | Critical — do not modify without gate |
| `scripts/verify_instructions.sh` | Main instruction gate | Must pass PASS=20 FAIL=0 |
| `scripts/autoheal/autoheal_rules.jsonl` | AutoHeal registry | Append-only |

---

## Housekeeping note

As of `2026-05-03`, obsolete repo-cleanup staging and dated docs backups were consolidated into
`docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/`. `documentation/`, `legacy/`, and `_archive/`
remain intentional surfaces and were not removed.

*French documentation: [docs/dev/fr/structure-du-repo.md](../fr/structure-du-repo.md)*
