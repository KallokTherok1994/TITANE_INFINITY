# UI VERSION 30.1.27 GIT ANCHOR TRUTH

Date: 2026-04-16
Status: BLOCKED

## Scope

- Verifier si un ancrage Git reconstructible existe reellement pour la version 30.1.27.
- Distinguer la presence d une release note 30.1.27 d un etat runtime/version canonique reellement 30.1.27.

## Findings

- Le fichier [RELEASE_v30.1.27.md](RELEASE_v30.1.27.md) et [RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt](RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt) ont bien ete introduits par le commit `ec1fe5210`.
- Ce commit n est pas une ancre Git honnête pour 30.1.27: ses surfaces de version canoniques sont deja en `30.1.29` dans `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` et `runtime/stable/manifest.json`.
- Conclusion: la release note 30.1.27 documente un build local historique, mais le commit actuellement rattache a cette note ne permet pas de reconstruire un etat repo canonique 30.1.27.

## Evidence

- `git log --oneline --all -- RELEASE_v30.1.27.md` -> `ec1fe5210 fix(chat): canonicalize titane conversation surface`
- `git log --oneline --all -- RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt` -> `ec1fe5210 fix(chat): canonicalize titane conversation surface`
- `git show --stat --summary --oneline ec1fe5210 -- package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json runtime/stable/manifest.json RELEASE_v30.1.27.md RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt` -> ajoute les fichiers release 30.1.27, mais modifie les surfaces canoniques dans le meme commit
- `git show ec1fe5210:package.json | rg '30\\.1\\.27|version'` -> `"version": "30.1.29"`
- `git show ec1fe5210:src-tauri/Cargo.toml | rg '30\\.1\\.27|version'` -> `version = "30.1.29"`
- `git show ec1fe5210:src-tauri/tauri.conf.json | rg '30\\.1\\.27|version'` -> `"version": "30.1.29"`
- `git show ec1fe5210:runtime/stable/manifest.json | rg '30\\.1\\.27|version'` -> `"version": "30.1.29"`

## Practical Impact

- Le blocage 30.1.27 ne peut plus etre formule comme "aucune ancre Git trouvee".
- Le blocage honnête devient: "release note et checksums trouves, mais aucune ancre Git reconstructible 30.1.27 n est disponible dans le repo actuel".
- La prochaine preuve utile reste l une des deux suivantes:
  - recuperer l AppImage 30.1.27 reellement produite, ou
  - retrouver un commit/historique de travail ou les surfaces canoniques sont effectivement en 30.1.27.

## Commands Executed

- `git log --oneline --all -- RELEASE_v30.1.27.md`
- `git log --oneline --all -- RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt`
- `git blame --line-porcelain RELEASE_v30.1.27.md | sed -n '1,40p'`
- `git show --stat --summary --oneline ec1fe5210 -- package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json runtime/stable/manifest.json RELEASE_v30.1.27.md RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt`
- `for f in package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json runtime/stable/manifest.json; do git show ec1fe5210:$f | rg '30\\.1\\.27|version'; done`

## Rollback

- `rm -f reports/UI_VERSION_30.1.27_GIT_ANCHOR_TRUTH_2026-04-16.md`