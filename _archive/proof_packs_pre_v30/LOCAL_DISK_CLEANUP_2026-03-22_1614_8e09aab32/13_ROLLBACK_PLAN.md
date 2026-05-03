# 13 — PLAN DE ROLLBACK

## Items supprimés — REPRODUCTIBLES (non rollbackables par design)

Ces items sont des caches de compilation reproductibles. Pour les restaurer:

### src-tauri/target/debug/ (46G)
```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
cargo build --manifest-path src-tauri/Cargo.toml
```

### src-tauri/target/release/incremental/ (111G)
```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
cargo build --release --manifest-path src-tauri/Cargo.toml
# Note: rebuilds binaire + incrémental
```

### deployment/latest/builds/target-run-{1,2,3}/ (23.9G)
Ces caches sont générés par `runtime/stable/build.sh`. Reproductibles via rebuild complet.

### .venv/ (7.7G)
```bash
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
```

### src-tauri/gen/android/app/build/ (2.3G)
```bash
cargo tauri android build
```

## Item quarantiné — ROLLBACK disponible

### REPO_CLONE_TEST (17G)
```bash
mv /home/titane-os/Documents/GitHub/_TITANE_LOCAL_ARCHIVE/05_quarantine_pending_delete/REPO_CLONE_TEST_2026-03-22 \
   /home/titane-os/Documents/GitHub/REPO_CLONE_TEST
```

## Worktrees purgés — NON ROLLBACKABLES

Les 4 worktrees prunable étaient inaccessibles avant pruning (permission denied ou /tmp nettoyé).
Rollback non pertinent.

## Aucun fichier produit modifié — git rollback non nécessaire
