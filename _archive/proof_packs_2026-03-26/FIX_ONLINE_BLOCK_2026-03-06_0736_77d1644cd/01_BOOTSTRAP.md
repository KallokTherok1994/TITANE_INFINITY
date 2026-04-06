# Bootstrap

## git status
```
Sur la branche MAIN
Votre branche est a jour avec 'origin/MAIN'.

Fichiers non suivis:
	(utilisez "git add <fichier>..." pour inclure dans ce qui sera valide)
				proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/

aucune modification ajoutee a la validation mais des fichiers non suivis sont presents (utilisez "git add" pour les suivre)
```

## git rev-parse --short HEAD
```
77d1644cd
```

## git log -20 --oneline
```
77d1644cd (HEAD -> MAIN, origin/MAIN, origin/HEAD) chore(proof-packs): add FINAL_PROD_UNLOCK_2026-03-06_0213_b61b1a251
c4c8eff96 fix(ci-unified): stabilize rust toolchain and IPC contract guard
0c003e969 fix(ci-p3): stabilize pnpm bootstrap and sync registry artifacts
15982a7ad fix(ci-registry): sync registry artifacts for consciousness workflow changes
834b0b09b fix(ci-consciousness): handle numpy types in collective json export
9e7d6fca7 fix(ci-consciousness): install numpy in collective intelligence job
956b785e0 fix(ci-format): apply prettier on e2e runner and titane db hooks
bd37e04f9 fix(ci-registry): add missing runtime registry dashboard artifact
37765e04d fix(ci-docs): skip pages deploy when github pages is disabled
2a7e4c0d1 fix(ci-docs): include typedoc markdown plugin in dlx fallback
64c361f35 fix(ci-docs): add typedoc fallback in docs deployment workflow
af6eea437 fix(ci-constitution): remove invoke marker false-positive in config comment
b532d1f57 fix(ci-docs): install libpng-dev before docs dependencies
c497051bf fix(option1-libsql): stabilize full compile and harden e2e governance
b61b1a251 docs(proof): add final fix proof pack 2026-03-05 1146
04788bc66 chore(prod): sync 27.2.0 publish metadata
eb152b718 docs(proof): append add4 gate closure evidence
add4cfb9c docs(proof): append head e505 gate verification
e5050567d docs(proof): refresh final gates report for head 716936920
716936920 fix(ci): sync mermaid status report gate
```

## node -v || true
```
v24.0.0
```

## pnpm -v || true
```
10.30.2
```

## cargo -V || true
```
cargo 1.91.1 (ea2d97820 2025-10-10)
```

## rustc -V || true
```
rustc 1.91.1 (ed61e7d7e 2025-11-07)
```

