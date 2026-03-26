# 08 — PLAN D'EXÉCUTION BORNÉ
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

## Pass 1 — P0 (pas d'items → skip)

Aucun P0 identifié. Pass 1 vide.

---

## Pass 2 — P1 : retrait alias `chat_generate`

**Backlog items :** F-006

**Fichier :** `src-tauri/capabilities/chat_ai.json`

**Changement :**
```diff
- "chat_generate",
```

**Ring impacté :** R4 (capabilities/allowlist)
**Impact réseau :** Nul

**Preuve :**
```bash
grep -v "chat_generate" src-tauri/capabilities/chat_ai.json | grep "chat_"
```

**Rollback :**
```bash
git restore -- src-tauri/capabilities/chat_ai.json
```

---

## Pass 3 — Seal : AutoHeal + proof pack

**Items :**
- AutoHeal AH-2026-03-06-0044
- Proof pack complet (ce document + 18 fichiers)

**Rollback :**
```bash
# Proof pack est append-only — pas de rollback
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

---

## Règle d'arrêt

Après Pass 3 → STOP + verdict final.
Aucune itération supplémentaire autorisée sans nouveau backlog P1 prouvé.
