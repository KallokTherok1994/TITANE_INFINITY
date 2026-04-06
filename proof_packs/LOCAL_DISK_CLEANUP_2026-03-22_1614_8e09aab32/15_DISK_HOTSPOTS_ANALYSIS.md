# 15 — ANALYSE DES POINTS CHAUDS DISQUE

## État avant nettoyage — Top 10

| Rang | Chemin | Taille |
|---|---|---|
| 1 | src-tauri/target/release/ | 125G |
| 2 | src-tauri/target/debug/ | 46G |
| 3 | .git/ | 20G |
| 4 | deployment/latest/builds/target-run-2/ | 8.8G |
| 5 | deployment/latest/builds/target-run-1/ | 8.8G |
| 6 | deployment/latest/builds/target-run-3/ | 6.3G |
| 7 | .venv/ | 7.7G |
| 8 | REPO_CLONE_TEST/ (voisin) | 17G |
| 9 | src-tauri/gen/android/app/build/ | 2.3G |
| 10 | node_modules/ | 1.1G |

## Catégories de déchets identifiées

1. **Caches Rust incrémentaux** (release/incremental 111G) — jamais purgés
2. **Debug build complet** (46G) — résidu de développement
3. **Builds deployment répétés** (3x target-run-*) — surpoids reproductibilité
4. **Python venv** (7.7G) — non actif
5. **Android build** (2.3G) — résidu cross-compilation
6. **Clone périmé** (17G) — non synchronisé depuis ~2 mois

## Root cause principale

`cargo build --release` génère un cache incrémental (111G) qui n'est jamais purgé.
Solution: ajouter `cargo clean` systématique après chaque release build.

## G_DISK_HOTSPOTS_IDENTIFIED: PASS
