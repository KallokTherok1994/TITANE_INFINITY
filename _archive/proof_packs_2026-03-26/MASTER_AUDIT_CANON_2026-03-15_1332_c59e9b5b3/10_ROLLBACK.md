# 10_ROLLBACK.md — Instructions de Rollback

## Rollback Dirty Files (si décision de restaurer)

```bash
git restore -- src-tauri/tauri.conf.json src-tauri/gen/android/gradle.properties
```

## Rollback docs/canon/ (si nécessaire)

```bash
rm -rf docs/canon/
```

## Rollback registry/canon-events.jsonl (si nécessaire)

```bash
# Supprimer la dernière ligne (l'entrée de cet audit)
head -n -1 registry/canon-events.jsonl > /tmp/canon-events.tmp && mv /tmp/canon-events.tmp registry/canon-events.jsonl
```

## Rollback scripts/autoheal/autoheal_rules.jsonl (si nécessaire)

```bash
# Supprimer la dernière ligne (l'entrée AH_CANON_DOCS_2026-03-15)
head -n -1 scripts/autoheal/autoheal_rules.jsonl > /tmp/autoheal.tmp && mv /tmp/autoheal.tmp scripts/autoheal/autoheal_rules.jsonl
```

## Rollback proof pack (si nécessaire)

```bash
rm -rf proof_packs/MASTER_AUDIT_CANON_2026-03-15_1332_c59e9b5b3/
```

## Rollback complet de la session

```bash
# Restaurer dirty files
git restore -- src-tauri/tauri.conf.json src-tauri/gen/android/gradle.properties
# Supprimer tous les nouveaux fichiers
rm -rf docs/canon/
rm -rf proof_packs/MASTER_AUDIT_CANON_2026-03-15_1332_c59e9b5b3/
# Restaurer registries si nécessaire (dernières lignes)
# (voir étapes individuelles ci-dessus)
```
