# 01 — BOOTSTRAP
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

---

## Git State

```
HEAD: 7973fbdec
Branch: MAIN (origin/MAIN, origin/HEAD)
Working tree: CLEAN (0 uncommitted changes)
```

### git log -20 --oneline
```
7973fbdec docs(proof): SESSION_COMPLETE — all 5 audit locks closed, VERDICT DONE
861a3252e docs(proof): finalize playwright memory cert pack + provider-flow e2e updates
8f7da8dc1 fix(stores): LOCK4+LOCK5 — memory backend sync and chat mode persistence
ae8201650 docs(proof): staged playwright memory cert pack + matrices + autoheal updates
6abe58bac fix(chain): LOCK1-REPAIR — wire backendResponse.meta.provider_used to ChatResponse
0000bdeee docs(proof): LOCK_FIXES proof pack + audit maps — 4 commits, VERDICT DONE
beeeab935 fix(diagnostics): LOCK3 — system health polling from backend truth
a73459f3b fix(storage): LOCK2 — unify conversation ID to canonical key
0dd11f69e fix(ui): LOCK1 — display actual provider from ProviderDecisionMeta
b7ed74cf1 fix(truth): G1+G2+G3 — memory injection truth, history load markers, E2E harness stability
94b0cc401 docs: mise à jour CHANGELOG + README pour rebuild v28.0.0 (2026-03-20)
1e10f5ba6 fix(cline): sober hooks — remove fake-PASS, fix prod tokens, reduce noise
f3939e2bc (tag: v28.0.0) docs(proof): proof pack PROD_BUILD v28.0.0 — DONE
9771870e0 deploy(prod): build v28.0.0 PROD — AppImage 90M + DEB 21M
944671540 docs(proof): mise à jour proof pack CLINE_RECERT — état final STABLE
d08dfd942 fix(hooks): supprimer bloc auto-capture JSONL défectueux dans PostToolUse
901fdfbc2 recert(cline): purge surface active .clinerules — 3 artefacts historiques
d9c3dceb9 fix(desktop): utiliser nom d'icône XDG standard
4c0ab5f51 deploy(v28.0.0): artifacts with OMEGA icons
8cc47a2e7 feat(icons): nouvelle icône OMEGA v28.0.0
```

---

## Tooling Versions

| Tool   | Version           | Status                                     |
|--------|-------------------|--------------------------------------------|
| node   | v18.19.1          | ⚠️ INCOMPATIBLE — requires >=20.0.0        |
| pnpm   | 10.30.2           | ✅ present                                  |
| cargo  | 1.94.0            | ✅ present                                  |
| rustc  | 1.94.0 (1.94.0)   | ✅ present                                  |
| pnpm tauri | N/A          | ⚠️ blocked by node incompatibility         |

**BLOCKED_BY_ENV:** Node.js runtime eval execution cannot proceed until Node >=20 is installed.
This does NOT block the governance scaffold creation (pure files/JSON/scripts).

To fix Node:
```bash
# Install Node 20+ via nvm (no sudo required)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20
nvm use 20
```

---

## Repo Structure Mapping

### Directories confirmed present:
- `src/` — React frontend (~291 components, 90+ hooks, 24 stores, 30+ services)
- `src-tauri/src/` — Rust backend (~105+ subdirs, IPC, memory, chat, providers)
- `scripts/` — 50+ subdirectories (autoheal, verify, gates, ci, e2e, etc.)
- `e2e/` — WebdriverIO E2E tests
- `tests/` — Unit/integration tests
- `proof_packs/` — Existing proof packs (15+)
- `registry/` — 13 registry files (jsonl)
- `.github/agents/` — 10 agent definitions
- `.github/prompts/` — 8 prompt definitions
- `docs/` — Documentation

### Directories confirmed ABSENT:
- `evals/` — NOT FOUND (this is the single real lock)
