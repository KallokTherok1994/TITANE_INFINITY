# 01 — VÉRITÉ BOOTSTRAP

## État disque initial

```
Sys. de fichiers  Taille  Utilisé  Dispo  Uti%  Monté sur
/dev/nvme0n1p2    915G    745G     124G   86%   /
```

## Répertoires lourds (mesurés)

| Répertoire | Taille | Statut gitignore |
|---|---|---|
| src-tauri/target/ | 171G | GITIGNORED |
| deployment/latest/ | 25G | PARTIEL |
| .git/ | 20G | CANONIQUE — PROTÉGÉ |
| .venv/ | 7.7G | GITIGNORED |
| node_modules/ | 1.1G | GITIGNORED |
| proof_packs/ | 277M | CANONIQUE — PROTÉGÉ |
| docs/ | 181M | CANONIQUE — PROTÉGÉ |
| build_logs/ | 48K | GITIGNORED |

## Sous-répertoires src-tauri/target/

| Sous-répertoire | Taille |
|---|---|
| release/ | 125G |
| release/incremental/ | 111G |
| debug/ | 46G |
| flycheck0/ | 764K |
| tmp/ | 4K |

## Worktrees détectés

```
/home/titane-os/Documents/GitHub/TITANE_INFINITY              8e09aab32 [MAIN]
/home/titane-os/.cache/titane_fastfs/p2_build_97b566d3_...    97b566d3b prunable
/home/titane-os/.cache/titane_fastfs/p2_bundle/repo           bf79d71a1 prunable
/tmp/TITANE_RELEASE_2850                                       8904d1089 prunable
/tmp/titane_v15_wt_20260311_080118                             7af886eec prunable
```

## G_BOOTSTRAP_TRUTH: PASS
