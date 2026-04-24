# 09_BUILD_X3 — Build x3

**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## Statut Global: BLOCKED

---

## Scripts Build Découverts (package.json)

```bash
"build":            "vite build"
"build:prod-safe":  "NPM_CONFIG_IGNORE_SCRIPTS=1 vite build"
"build:production": "pnpm run lint && pnpm run format:check && pnpm run ollama:bundle && vite build && tauri build && bash scripts/post-build.sh"
"build:tauri:e2e":  "pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && vite build && tauri build --config src-tauri/tauri.conf.json"
```

---

## Run 1 — Frontend Build (`pnpm build`)

```
[15:09:20] $ pnpm build
bash: pnpm: command not found
EXIT: 127 — BLOCKED
```

## Run 2 — TypeScript Only (`npx tsc --noEmit`)

```
[15:09:20] $ npx tsc --noEmit
npx: could not resolve binary — node_modules absent
EXIT: 1 — BLOCKED
```

## Run 3 — Cargo Check (Rust)

```
[15:09:25] $ cd src-tauri && cargo check --message-format=short

warning: glib-sys@0.18.1:
error: failed to run custom build command for `glib-sys v0.18.1`
  process didn't exit successfully (exit status: 1)
  The system library `glib-2.0` required by crate `glib-sys` was not found.
  The file `glib-2.0.pc` needs to be installed.
  PKG_CONFIG_PATH is not set.

Same error for `gobject-2.0` (gobject-sys).
EXIT: 1 — BLOCKED (GTK/glib-2.0 absent)
```

---

## Observations Statiques (sans exécution)

| Observation                                     | Source                           | Confiance |
| ----------------------------------------------- | -------------------------------- | --------- |
| Vite config présent et complet                  | `vite.config.ts` (23KB)          | HIGH      |
| tsconfig.json strict mode activé                | `tsconfig.json`                  | HIGH      |
| reqwest 0.11 (potentiellement obsolète)         | `src-tauri/Cargo.toml`           | MEDIUM    |
| Artifacts build pré-compilés disponibles        | `deployment/latest/` (240MB LFS) | HIGH      |
| Profil release optimisé (lto=thin, opt-level=3) | `src-tauri/Cargo.toml`           | HIGH      |

---

## G_BUILD_X3 = BLOCKED

| Build            | Runs | Statut  | Raison              |
| ---------------- | ---- | ------- | ------------------- |
| Vite (frontend)  | 0/3  | BLOCKED | pnpm absent         |
| TypeScript check | 0/3  | BLOCKED | node_modules absent |
| Cargo check      | 0/3  | BLOCKED | GTK/glib-2.0 absent |
| Tauri build      | 0/3  | BLOCKED | GTK + pnpm absent   |
| Build prod-safe  | 0/3  | BLOCKED | pnpm absent         |

**Prérequis build:**

```bash
# Frontend
npm install -g pnpm@10.28.2 && pnpm install --frozen-lockfile
pnpm run build  # vite build only

# Rust
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev pkg-config
cargo check --all-targets
```

**NON PROUVÉ**: Succès ou échec des builds.
