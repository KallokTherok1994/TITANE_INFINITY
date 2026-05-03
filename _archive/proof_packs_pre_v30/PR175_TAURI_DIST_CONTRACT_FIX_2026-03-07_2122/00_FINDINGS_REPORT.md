# RAPPORT — CONTRAT DIST TAURI : resource path '../dist' doesn't exist

**Session:** PR175_TAURI_DIST_CONTRACT_FIX_2026-03-07_2122  
**Date:** 2026-03-07T21:22:00Z  
**PR:** #175 — copilot/audit-cleanup-autofix-workflows → MAIN

---

## A) EXEC_MODE: CLOUD (logs CI GitHub Actions run 22807190842)

## B) SCOPE_RING: R4 (.github/workflows/rust.yml, src-tauri/tauri.conf.json, src-tauri/build.rs)

## C) RISK: P1 (dernier check bloquant le merge)

## D) PLAN (4 étapes)

1. Récupérer logs du job `build` (run 22807190842, dernier commit dfb471d)
2. Identifier la ligne exacte d'erreur : `resource path '../dist' doesn't exist`
3. Tracer la chaîne : `tauri.conf.json::frontendDist` → `tauri_build::build()` → validation compile-time
4. Appliquer le pattern canonique du repo (rust-docker.yml) : créer `dist/index.html` placeholder

## E) CAUSE RACINE PROUVÉE

### Log exact (run 22807190842 / job 66158148206)

```
  process didn't exit successfully: `.../build-script-build` (exit status: 1)
  resource path `../dist` doesn't exist
##[error]Process completed with exit code 101.
```

### Chaîne causale complète

| Composant | Valeur | État |
|-----------|--------|------|
| `src-tauri/tauri.conf.json` | `build.frontendDist: "../dist"` | Référence `dist/` à la racine du repo |
| `src-tauri/build.rs` | `tauri_build::build()` | Valide `frontendDist` à la compilation |
| Vite (vite.config.ts) | `outDir` implicite = `dist/` | Écrit dans `dist/` mais JAMAIS exécuté dans `rust.yml` |
| `rust.yml` step Build | `cargo build --verbose` | Lance sans créer `dist/` → FAIL exit 1 |

### Classification (règle I9)

- Type de défaillance : **workflow missing deps** — l'ordre des étapes est incorrect.  
- Le frontend n'est jamais buildé avant `cargo build`.
- `dist/` n'existe pas sur le runner au moment de la compilation Rust.

## F) PATTERN CANONIQUE DU REPO

`rust-docker.yml` (step "Ensure Frontend Dist Placeholder") :
```yaml
- name: 🧱 Ensure Frontend Dist Placeholder
  run: |
    mkdir -p dist
    if [ ! -f dist/index.html ]; then
      echo '<!doctype html><html><body>CI placeholder</body></html>' > dist/index.html
    fi
```

Ce pattern est la référence officielle dans ce repo pour les jobs Rust CI qui ne font pas un build Tauri complet.

## G) FIX APPLIQUÉ

Ajout du step "Ensure frontend dist placeholder" dans `rust.yml`, entre l'install des deps système et `cargo build` :

```diff
+     - name: Ensure frontend dist placeholder
+       run: |
+         mkdir -p dist
+         if [ ! -f dist/index.html ]; then
+           echo '<!doctype html><html><body>CI placeholder</body></html>' > dist/index.html
+         fi
      - name: Build
        run: cargo build --verbose
        working-directory: src-tauri
```

## H) VÉRIFICATION LOCALE

| Check | Résultat |
|-------|---------|
| `npx prettier --check .github/workflows/rust.yml` | PASS |
| `detect_recurrence.sh` | PASS (132 entries) |
| `verify_instructions.sh` | PASS=20 FAIL=0 |
| Registry events | 23 |

## I) ROLLBACK

```bash
git restore -- .github/workflows/rust.yml
# Supprimer l'entry AH-0092 du JSONL si nécessaire
```

## J) IMPACTS SUR LES CHECKS VERTS

Aucun check précédemment vert n'est modifié. Le step ajouté est idempotent (if [ ! -f ]).
