# 06 — PREUVE SUPPRESSION .venv / android / build_logs

## .venv/ (7.7G) — Gitignored Python venv

Vérification: `.venv` listé dans `.gitignore`.
Vérification références actives: aucune référence directe à `.venv/` dans scripts actifs.
(Les scripts référencent `venv-parler-tts/`, un venv différent.)

```bash
rm -rf .venv/    # 7.7G supprimé
```

## src-tauri/gen/android/app/build/ (2.3G) — Gitignored Android artifacts

Vérification: `src-tauri/gen/` gitignored.

```bash
rm -rf src-tauri/gen/android/app/build/   # 2.3G supprimé
```

## build_logs/ (48K) — Gitignored residue

Vérification: `build_logs/` listée dans git clean preview comme gitignored.

```bash
rm -rf build_logs/   # 48K supprimé
```

## Libéré total phase D-F: ~10G

## G_SAFE_DELETE_PROOF: PASS (tous gitignorés + reproductibles)
