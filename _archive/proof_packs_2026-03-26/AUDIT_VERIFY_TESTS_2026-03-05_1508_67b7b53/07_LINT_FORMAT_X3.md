# 07_LINT_FORMAT_X3 — Lint & Format x3

**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## Statut Global: BLOCKED

`pnpm` non disponible, `node_modules` absents.

---

## Scripts Réels Découverts (package.json)

```bash
"lint":          "eslint \"src/**/*.{ts,tsx,js,jsx}\""
"lint:fix":      "eslint \"src/**/*.{ts,tsx,js,jsx}\" --fix"
"lint:staged":   "lint-staged"
"format":        "prettier --write ."
"format:check":  "prettier --check ."
"check":         "tsc --noEmit"
```

---

## Run 1 — ESLint

```
[15:09:20] $ node_modules/.bin/eslint "src/**/*.{ts,tsx}"
timeout: failed to run command 'node_modules/.bin/eslint': No such file or directory
STATUS: BLOCKED
```

## Run 2 — Prettier Check

```
[15:09:20] $ node_modules/.bin/prettier --check .
timeout: failed to run command 'node_modules/.bin/prettier': No such file or directory
STATUS: BLOCKED
```

## Run 3 — TypeScript Check

```
[15:09:20] $ node_modules/.bin/tsc --noEmit
timeout: failed to run command 'node_modules/.bin/tsc': No such file or directory
STATUS: BLOCKED
```

---

## Rust Lint (cargo fmt + clippy)

```
[15:09:25] $ cd src-tauri && cargo fmt --all -- --check
error: failed to run custom build command for `glib-sys v0.18.1`
  The system library `glib-2.0` required by crate `glib-sys` was not found.
STATUS: BLOCKED (GTK/glib-2.0 absent)

[15:09:25] $ cargo clippy --all-targets --all-features -D warnings
Same error — BLOCKED
```

---

## G_LINT_FORMAT_X3 = BLOCKED

| Suite        | Commande                     | Runs | Statut  |
| ------------ | ---------------------------- | ---- | ------- |
| ESLint       | `pnpm run lint`              | 0/3  | BLOCKED |
| Prettier     | `pnpm run format:check`      | 0/3  | BLOCKED |
| TypeScript   | `pnpm run check`             | 0/3  | BLOCKED |
| cargo fmt    | `cargo fmt --all -- --check` | 0/3  | BLOCKED |
| cargo clippy | `cargo clippy -D warnings`   | 0/3  | BLOCKED |

**Prérequis pour débloquer:**

```bash
npm install -g pnpm@10.28.2 && pnpm install --frozen-lockfile
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev
```

**NON PROUVÉ**: Statut lint/format — impossible sans prérequis.
