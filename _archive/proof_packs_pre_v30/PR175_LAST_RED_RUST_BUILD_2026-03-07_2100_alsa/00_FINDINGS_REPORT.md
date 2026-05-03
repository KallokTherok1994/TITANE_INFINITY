# RAPPORT — DERNIER CHECK ROUGE : Rust / build

**Session:** PR175_LAST_RED_RUST_BUILD_2026-03-07_2100_alsa  
**Date:** 2026-03-07T21:00:00Z  
**PR:** #175 — copilot/audit-cleanup-autofix-workflows → MAIN

---

## A) EXEC_MODE: CLOUD (logs CI GitHub Actions run 22804486086)

## B) SCOPE_RING: R4 (.github/workflows/rust.yml)

## C) RISK: P1 (dernier check bloquant le merge)

## D) PLAN (3 étapes)

1. Récupérer logs du job `build` (run 22804486086, attempt 2)
2. Identifier la librairie système manquante depuis l'erreur pkg-config
3. Ajouter la dépendance manquante dans `rust.yml` step `apt-get install`

## E) CAUSE RACINE PROUVÉE

### Log exact (run 22804486086 / job 66151360046)

```
error: failed to run custom build command for `alsa-sys v0.3.1`

Caused by:
  process didn't exit successfully: .../alsa-sys-e710fdff4df19978/build-script-build (exit status: 101)
  --- stdout
  cargo:warning=
  pkg-config exited with status code 1
  > PKG_CONFIG_ALLOW_SYSTEM_LIBS=1 ... pkg-config --libs --cflags alsa

  The system library `alsa` required by crate `alsa-sys` was not found.
  The file `alsa.pc` needs to be installed and the PKG_CONFIG_PATH environment variable must contain its parent directory.

##[error]Process completed with exit code 101.
```

### Diagnostic

- La session précédente (AH-0090) avait installé : `libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev`
- Ces packages couvrent glib/gobject/gtk/webkit → glib-sys et gobject-sys : **PASS**
- `alsa-sys v0.3.1` est une dépendance transitive Tauri (audio Linux) requérant `libasound2-dev`
- `libasound2-dev` **absent** de la liste apt-get précédente → FAIL

### Classification (règle I9)

- Type de défaillance : **platform package issue** (paquet système Linux manquant)
- Pas de mauvaise `working-directory`, pas de `command` incorrecte, pas de config Cargo

## F) FIX APPLIQUÉ

```diff
-          sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev
+          sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev
```

**Fichier:** `.github/workflows/rust.yml`

## G) VÉRIFICATION LOCALE

| Check | Résultat |
|-------|---------|
| `npx prettier --check .github/workflows/rust.yml` | PASS |
| `detect_recurrence.sh` | PASS (131 entries) |
| `verify_instructions.sh` | PASS=20 FAIL=0 |
| Registry events | 22 |

## H) ROLLBACK

```bash
git restore -- .github/workflows/rust.yml
# + supprimer dernier entry AH-0091 du JSONL si nécessaire
```

## I) CHECKS SKIPPÉS — CLASSIFICATION

Non applicable pour cette session (focus strict : dernier check rouge Rust).  
Les checks déjà verts restent inchangés.
