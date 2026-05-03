# 08 — AUTO-FIX DECISIONS

**Timestamp:** 2026-03-11T14:08:00Z

## Décisions de correction prises en V18

### Fix 1 — focus-visible TITANE inline tabs

| Champ | Valeur |
|---|---|
| ID | F-TAB-FOCUS-V17 |
| Fichier cible | `src/pages/TitanePage-local.css` |
| Type de fix | CSS minimal, non-breaking |
| Décision | AUTO-APPLIED |
| Justification | WCAG 2.4.7 Level AA — indicateur de focus requis sur tous les éléments interactifs au clavier |
| Rollback | Supprimer le bloc `:focus-visible` — aucun impact fonctionnel |

```diff
+.titane-inline-tabs button:focus-visible {
+  outline: 2px solid var(--titanium-accent-cool, #9ca3af);
+  outline-offset: 2px;
+  box-shadow: 0 0 0 4px rgba(156, 163, 175, 0.22);
+}
```

## Décisions d'exclusion

| Éléments | Décision | Justification |
|---|---|---|
| `.v18_ui_excellence_web_audit.mjs` | NON-COMMITÉ | Harness de test local uniquement, non-productif |
| Logs `.log` bruts > 100KB | NON-COMMITÉS | Gitignorés ; JSON metrics suffisants comme preuve |

## AutoHeal

Entrée ajoutée à `scripts/autoheal/autoheal_rules.jsonl` :
```json
{
  "id": "AH-2026-03-11-0704",
  "pattern": "focus-visible absent on interactive inline tab buttons",
  "fix": "Add :focus-visible outline rule to .titane-inline-tabs button",
  "file": "src/pages/TitanePage-local.css",
  "severity": "important"
}
```
