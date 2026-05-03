]633;E;{   echo "# Bootstrap"\x3b   echo "- Timestamp UTC: $TS"\x3b   echo ""\x3b   echo "## Commandes"\x3b   echo "1. git status"\x3b   echo "2. git rev-parse --short HEAD"\x3b   echo "3. git log -1 --oneline"\x3b   echo "4. node -v"\x3b   echo "5. pnpm -v"\x3b   echo "6. rustc -V"\x3b   echo "7. cargo -V"\x3b   echo "8. pnpm tauri -v || tauri -V || echo TAURI_MISSING"\x3b   echo ""\x3b   echo "## Sorties"\x3b   echo '```text'\x3b   echo "$ git status"\x3b git status\x3b   echo "$ git rev-parse --short HEAD"\x3b git rev-parse --short HEAD\x3b   echo "$ git log -1 --oneline"\x3b git log -1 --oneline\x3b   echo "$ node -v"\x3b node -v\x3b   echo "$ pnpm -v"\x3b pnpm -v\x3b   echo "$ rustc -V"\x3b rustc -V\x3b   echo "$ cargo -V"\x3b cargo -V\x3b   echo "$ pnpm tauri -v || tauri -V || echo TAURI_MISSING"\x3b   (pnpm tauri -v || tauri -V || echo "TAURI_MISSING")\x3b   echo '```'\x3b } >> "$BOOT";4a32d084-ebc3-40d0-a337-66c1b6517978]633;C# Bootstrap
- Timestamp UTC: 2026-03-04T18:00:58Z

## Commandes
1. git status
2. git rev-parse --short HEAD
3. git log -1 --oneline
4. node -v
5. pnpm -v
6. rustc -V
7. cargo -V
8. pnpm tauri -v || tauri -V || echo TAURI_MISSING

## Sorties
```text
$ git status
Sur la branche seal/vΩ5-20260303-98262da88
Votre branche est à jour avec 'origin/seal/vΩ5-20260303-98262da88'.

Fichiers non suivis:
  (utilisez "git add <fichier>..." pour inclure dans ce qui sera validé)
	proof_packs/TESTS_ZERO_OMISSION_2026-03-04_1300_4a3ab09a5/

aucune modification ajoutée à la validation mais des fichiers non suivis sont présents (utilisez "git add" pour les suivre)
$ git rev-parse --short HEAD
4a3ab09a5
$ git log -1 --oneline
4a3ab09a5 chore(runtime): update diagnostics snapshots
$ node -v
v24.0.0
$ pnpm -v
10.30.2
$ rustc -V
rustc 1.91.1 (ed61e7d7e 2025-11-07)
$ cargo -V
cargo 1.91.1 (ea2d97820 2025-10-10)
$ pnpm tauri -v || tauri -V || echo TAURI_MISSING
TAURI_MISSING
```
