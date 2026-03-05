# 19_ROLLBACK — Plan Rollback
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Rollback Session Courante (audit-only)

```bash
# Aucune modification code source — rollback trivial
rm -rf proof_packs/FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5/

# AutoHeal entry (append-only par constitution — ne pas supprimer)
# Si nécessaire:
# git restore -- scripts/autoheal/autoheal_rules.jsonl  # uniquement si non commis
```

---

## Rollback si Aucune Modif (idéal — ce run)

```bash
git status  # → nothing to commit, working tree clean
# Aucune action requise
```

---

## Rollback par FIX (une fois implémentés)

### FIX-001 — Ring 2 I/O extraction
```bash
git revert <FIX-001-commit-sha>
# OU
git restore -- \
  src-tauri/src/engines/unified_memory/summarizer.rs \
  src-tauri/src/engines/unified_memory/embeddings.rs
git rm --ignore-unmatch src-tauri/src/services/unified_memory_http.rs
```

### FIX-002 — Test Ring 2 Rust
```bash
git revert <FIX-002-commit-sha>
# OU
git rm --ignore-unmatch src-tauri/tests/ring2_architecture_test.rs
```

### FIX-003 — window.fetch monkey-patch
```bash
git revert <FIX-003-commit-sha>
# OU
git restore -- src/services/selfHealing/selfHealingObserver.ts
```

### FIX-004 — Bridge exceptions documentation
```bash
git revert <FIX-004-commit-sha>
# OU
git restore -- docs/MAP_IPC_COMMANDS.md
git restore -- scripts/verify/enforce-ipc-canonical.sh  # si modifié
```

### FIX-005 — Architecture test Rust
```bash
git revert <FIX-005-commit-sha>
# OU
git rm --ignore-unmatch src-tauri/tests/ring2_architecture_test.rs
```

### FIX-006 — Dev setup script
```bash
git revert <FIX-006-commit-sha>
# OU
git rm --ignore-unmatch scripts/setup/setup-dev.sh
git restore -- README.md
```

### FIX-007 — CommandResult doc
```bash
git revert <FIX-007-commit-sha>
# OU
git restore -- docs/MAP_IPC_COMMANDS.md
```

---

## Rollback Global (revert range)

```bash
# Identifier le SHA avant le premier FIX
git log --oneline | head -n 10

# Revert tous les commits FIX
git revert <FIX-001>..<FIX-007> --no-edit

# OU retourner au tag stable
git checkout -b rollback/v27.2.0 v27.2.0
```

---

## Restauration Allowlist/Capabilities (si touchés)

```bash
# Non modifiés dans ce pack — restauration préventive:
git restore -- src-tauri/capabilities/
git restore -- src-tauri/allowlist.whitelist.stable.json
git restore -- src-tauri/tauri.conf.json
```

---

## État Post-Audit

```
$ git status --porcelain=v1
?? proof_packs/FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5/
```

**Aucun fichier source modifié. Rollback = supprimer le dossier proof_packs/FINAL_AUDIT_VERDICT...**
