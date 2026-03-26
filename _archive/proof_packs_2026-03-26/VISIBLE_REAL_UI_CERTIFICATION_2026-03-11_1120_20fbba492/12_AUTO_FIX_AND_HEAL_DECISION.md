# 12 — AUTO FIX AND HEAL DECISION

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Politique AutoHeal (Rule 10)

Chaque fix doit être accompagné d'une entrée dans `scripts/autoheal/autoheal_rules.jsonl`.

## Décision pour cette session

### Fix TDZ (P1_BUILD_CHUNKS_FIX) — DÉJÀ APPLIQUÉ

Ce fix était la cause racine de FAIL V20+V21. Il est confirmé comme **actif et efficace** dans 27.2.0.

| Attribut | Valeur |
|----------|--------|
| Type | Build config (vite.config.ts) |
| Statut | APPLIQUÉ (build 27.2.0 vérifiable) |
| AutoHeal | Entrée existante ou à créer |

### Fix SEND_DISABLED_AFTER_TYPING — NON APPLIQUÉ (cette session)

**Motif**: Rule 1 (minimal patch only). Ce fix nécessite une modification de composant React contrôlé.
Risque: modifier le comportement du chat pourrait introduire une régression fonctionnelle.
Décision: **NON-AUTOFIX** — documenté dans doc 07 comme P1 fix pour session V23.

### Fix REASONING_PROGRESS_ABSENT — NON APPLIQUÉ (cette session)

**Motif**: Rule 1. Nécessite de trouver le bon composant source et d'ajouter `data-testid`.
Décision: **NON-AUTOFIX** — documenté dans doc 07 comme P2 fix pour session V23.

### Fix DOUBLE_SCROLL — NON APPLIQUÉ (cette session)

**Motif**: Rule 1. Audit CSS requis — changement de portée large.
Décision: **NON-AUTOFIX** — documenté dans doc 07 comme P4 fix.

## Entrée AutoHeal à ajouter

```jsonl
{"rule_id":"V22_TDZ_FIXED_27_2_0","session":"V22","date":"2026-03-11","category":"build","symptom":"ReferenceError: Cannot access before initialization (TDZ)","fix":"vite.config.ts: if (id.includes('/services/')) return 'core-runtime'","result":"MODE_B_REAL_UI confirmed","status":"HEALED","appimage_version":"27.2.0"}
{"rule_id":"V22_SEND_DISABLED_DOCUMENTED","session":"V22","date":"2026-03-11","category":"chat_ux","symptom":"send button disabled after JS el.value set","fix":"TODO: use React's native value setter + InputEvent in V23","result":"FRICTION — not blocking","status":"DOCUMENTED_FOR_V23","priority":"P1"}
{"rule_id":"V22_REASONING_PROGRESS_ABSENT","session":"V22","date":"2026-03-11","category":"chat_ux","symptom":"[data-testid=reasoning-progress] not found in DOM","fix":"TODO: add data-testid to ReasoningProgress component in V23","result":"FRICTION — not blocking","status":"DOCUMENTED_FOR_V23","priority":"P2"}
```

## Résumé

| Fix | Appliqué | AutoHeal | Session |
|-----|----------|----------|---------|
| TDZ build chunks | OUI (27.2.0) | A créer | V22 |
| SEND_DISABLED | NON | A créer | V23 |
| REASONING_ABSENT | NON | A créer | V23 |
| DOUBLE_SCROLL | NON | Aucune | V23+ |

**Verdict AutoHeal: DOCUMENTED — 3 entrées à ajouter dans autoheal_rules.jsonl**
