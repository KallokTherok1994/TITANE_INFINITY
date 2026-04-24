# 14_ROLLBACK — Plan de Rollback Safe

**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## Session Courante: Audit-Only (Zéro Modification)

Cette session est 100% lecture seule. Les seuls fichiers créés sont dans `proof_packs/AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53/` et l'entrée AutoHeal.

```bash
# Rollback de cette session (supprimer le proof pack et l'entrée AutoHeal)
rm -rf proof_packs/AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53/

# Si l'entrée AutoHeal doit être retirée (edit manuel du JSONL car append-only)
# Attention: autoheal_rules.jsonl est append-only par constitution — ne pas supprimer
```

---

## Rollbacks des Recommandations (si implémentées)

### R1 — Déplacer HTTP Ring 2 → Ring 3 (Rust)

```bash
git restore -- \
  src-tauri/src/engines/unified_memory/summarizer.rs \
  src-tauri/src/engines/unified_memory/embeddings.rs
# Vérifier: grep -n "use http_client" src-tauri/src/engines/unified_memory/*.rs
```

### R2 — Supprimer monkey-patch fetch

```bash
git restore -- src/services/selfHealing/selfHealingObserver.ts
# Vérifier: grep -n "window.fetch\s*=" src/services/selfHealing/selfHealingObserver.ts
# → 0 si rollback réussi, 1 (ligne 431) si restauré
```

### R3 — TauriBridge/StateBridge

```bash
git restore -- src/os/bridge/TauriBridge.ts src/os/bridge/StateBridge.ts
```

### R4 — Setup script

```bash
git restore -- scripts/setup/setup-dev.sh README.md
```

### R5 — Workflows CI

```bash
git restore -- .github/workflows/
# Ou restaurer workflows archivés:
mv .github/workflows/archive/cosmic-*.yml .github/workflows/
```

### R6 — reqwest bump

```bash
git restore -- src-tauri/Cargo.toml src-tauri/Cargo.lock
```

### R7 — SHA256SUMS

```bash
git restore -- src-tauri/SHA256SUMS_v27.2.0
# Recréer le v19.5.2 si nécessaire
```

---

## Rollback Global (Tags)

```bash
# Lister les tags stables
git tag -l | sort -V | tail -n 10

# Créer une branche de rollback depuis tag stable
git checkout -b rollback/v27.0.x v27.0.x

# Restaurer un fichier depuis un commit précédent
git show <commit_sha>:<path/to/file> > path/to/file
```

---

## Commandes Safe (Audit-Only)

Ces commandes sont sans risque (lecture seule):

```bash
git status --porcelain=v1      # Vérifier propreté working tree
git diff HEAD --name-only      # Voir changements
git log --oneline -10          # Voir historique
cat src-tauri/Cargo.toml       # Lire fichier
grep -rn "pattern" src/        # Recherche
find . -name "*.ts" | wc -l    # Comptage
```

---

## État Post-Audit

```bash
$ git status --porcelain=v1
?? proof_packs/AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53/  (nouveau, non commis)
```

**Aucun fichier source modifié. Aucun code de production touché.**
