# 14_ROLLBACK — Plan de Rollback

**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z

---

## Rollback Session Courante (audit-only)

```bash
# Supprimer le proof pack (si souhaité)
rm -rf proof_packs/AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089/

# Restaurer autoheal_rules.jsonl (si nécessaire)
# Note: append-only par constitution — ne pas supprimer les entrées existantes
git restore -- scripts/autoheal/autoheal_rules.jsonl  # uniquement si non commis
```

---

## Rollback par FIX (une fois implémentés)

### FIX-001 — Ring 2 I/O extraction

```bash
git restore -- \
  src-tauri/src/engines/unified_memory/summarizer.rs \
  src-tauri/src/engines/unified_memory/embeddings.rs
# Vérifier: grep -n "use http_client" src-tauri/src/engines/unified_memory/*.rs → 2 lignes si rollback OK
```

### FIX-002 — Test Ring 2 no-I/O Rust

```bash
git restore -- src-tauri/tests/unified_memory_tests.rs
```

### FIX-003 — window.fetch monkey-patch removal

```bash
git restore -- src/services/selfHealing/selfHealingObserver.ts
# Vérifier: grep -n "window.fetch\s*=" src/services/selfHealing/selfHealingObserver.ts → 1 ligne
```

### FIX-004 — Bridge IPC documentation

```bash
git restore -- scripts/verify/enforce-ipc-canonical.sh
git restore -- docs/MAP_IPC_COMMANDS.md
```

### FIX-005 — Ring 2 Rust architecture test

```bash
git restore -- src-tauri/tests/ring2_architecture_test.rs
git restore -- src-tauri/Cargo.toml
```

### FIX-006 — Dev setup script

```bash
git restore -- scripts/setup/setup-dev.sh
git restore -- README.md
```

---

## Rollback Global (si nécessaire)

```bash
# Revert sur le commit avant les FIX
git revert <fix-commit-sha>

# Ou retourner au tag stable
git checkout -b rollback/v27.2.0 v27.2.0
```

---

## Restauration Allowlist/Capabilities (si touchés)

```bash
git restore -- src-tauri/capabilities/
git restore -- src-tauri/allowlist.whitelist.stable.json
git restore -- src-tauri/tauri.conf.json
```

**Note**: Ces fichiers ne sont PAS modifiés dans ce proof pack.

---

## État Post-Audit

```bash
$ git status --porcelain=v1
?? proof_packs/AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089/
```

**Aucun fichier source modifié. Rollback trivial (supprimer le dossier).**
