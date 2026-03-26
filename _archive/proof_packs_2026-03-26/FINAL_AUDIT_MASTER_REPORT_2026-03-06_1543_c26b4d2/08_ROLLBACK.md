# 08 — ROLLBACK
## FINAL_AUDIT_MASTER_REPORT_2026-03-06_1543_c26b4d2

---

## Rollback — CE PACK (DOC-ONLY)

Ce pack est DOC-ONLY. Aucune modification de code n'a été effectuée dans cette session.

```bash
# Rollback du pack master report (cette session uniquement)
git restore -- proof_packs/FINAL_AUDIT_MASTER_REPORT_2026-03-06_1543_c26b4d2/

# Rollback de l'entrée AutoHeal AH-0046 (append-only — retrait ciblé)
python3 -c "
with open('scripts/autoheal/autoheal_rules.jsonl') as f:
    lines = [l for l in f.readlines() if l.strip()]
keep = [l for l in lines if 'AH-2026-03-06-0046' not in l]
with open('scripts/autoheal/autoheal_rules.jsonl', 'w') as f:
    f.writelines([l if l.endswith('\n') else l + '\n' for l in keep])
print('Rolled back AH-0046')
"
```

---

## Rollback global branche (toutes sessions)

```bash
# Sessions précédentes (code changes) — rollback par fichier
git restore -- src-tauri/src/main.rs
git restore -- src-tauri/capabilities/chat_ai.json
git restore -- src/__tests__/architecture/no_offline_first_runtime_import.test.ts
```

---

## Fichiers modifiés dans CETTE session (DOC-ONLY)

| Fichier | Type | Modification |
|---------|------|-------------|
| `scripts/autoheal/autoheal_rules.jsonl` | JSONL | +1 entrée AH-0046 |
| `proof_packs/FINAL_AUDIT_MASTER_REPORT_2026-03-06_1543_c26b4d2/` | Docs | nouveau pack (9 fichiers) |

---

## Référence rollbacks sessions précédentes

| Session | SHA | Fichiers code |
|---------|-----|---------------|
| Session 1 (AUDIT_1416) | 595eb80 | `src-tauri/src/main.rs` (+7 cp_*) |
| Session 2 (CONTINUE_1439) | 29f9fe0 | `src-tauri/src/main.rs` (+23 cmds + state) |
| Session 3 (CONSOLIDATION_1450) | c167beb | `src-tauri/capabilities/chat_ai.json` |
| Session 4 (SEALING_1523) | c26b4d2 | `src/__tests__/architecture/no_offline_first_runtime_import.test.ts` |
