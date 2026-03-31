# 03 — PREUVE WORKTREES

## Avant pruning

```
/home/titane-os/Documents/GitHub/TITANE_INFINITY              8e09aab32 [MAIN]
/home/titane-os/.cache/titane_fastfs/p2_build_97b566d3_...    97b566d3b (detached HEAD) prunable
/home/titane-os/.cache/titane_fastfs/p2_bundle/repo           bf79d71a1 [p2/bundle-phase2a-fastfs] prunable
/tmp/TITANE_RELEASE_2850                                       8904d1089 (detached HEAD) prunable
/tmp/titane_v15_wt_20260311_080118                             7af886eec (detached HEAD) prunable
```

## Commande exécutée

```bash
git worktree prune
```

## Après pruning

```
/home/titane-os/Documents/GitHub/TITANE_INFINITY  8e09aab32 [MAIN]
```

## Résultat

4 worktrees prunable supprimés. 1 actif conservé (MAIN).

## G_WORKTREE_STATUS_PROVEN: PASS
