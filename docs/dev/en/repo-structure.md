# TITANE∞ — Repo Structure (EN)

**Version:** 28.0.0  
**Status:** PROVEN  
**Date:** 2026-03-17

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

*French documentation: [docs/dev/fr/structure-du-repo.md](../fr/structure-du-repo.md)*
