# TITANE∞ — Conventions (FR)

**Version :** 28.0.0  
**Statut :** DOC_ONLY  
**Date :** 2026-03-17

---

## Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers TypeScript | camelCase | `conversationEngine.ts` |
| Composants React | PascalCase | `ChatPanel.tsx` |
| Fichiers de test | `.test.ts` ou `.spec.ts` | `chat.test.ts` |
| Scripts shell | kebab-case | `detect_recurrence.sh` |
| Répertoires | kebab-case ou snake_case | `audio-center/`, `proof_packs/` |
| IDs AutoHeal | `AH-YYYY-MM-DD-[DESCRIPTION]` | `AH-2026-03-17-FIX-001` |

---

## Conventions de code

### TypeScript

- Mode strict activé (`tsconfig.json`)
- Pas de `any` implicite
- Pas d'`import` circulaires entre rings
- Préférer `const` à `let`
- Gestion d'erreurs : toujours retourner une erreur lisible à l'utilisateur

### Rust

- Edition 2021
- Pas de `unwrap()` non contrôlé — utiliser `expect()` avec message ou propager l'erreur
- Tous les handlers IPC retournent `{ ok: bool, content?, error? }`
- Arc<Mutex<T>> pour le partage d'état concurrentiel

---

## Discipline documentaire

### Règle no-fiction

Ne jamais écrire qu'une fonctionnalité est :
- stable
- complète
- production-ready
- auto-réparante
- synchronisée
- sécurisée
- automatisée
- validée

...sauf si cette affirmation est directement supportée par une preuve dans le dépôt.

**Toujours utiliser les étiquettes de statut :** PROVEN | QUALIFIED | PARTIAL | BLOCKED | LEGACY | DOC_ONLY | PLANNED

### Mise à jour de version

1. Modifier `package.json` → `version`
2. Modifier `src-tauri/Cargo.toml` → `version`
3. Ajouter une entrée dans `CHANGELOG.md`
4. Mettre à jour `README.md` si nécessaire

### Discipline bilingue

- Chaque document FR doit avoir un lien vers son équivalent EN
- Chaque document EN doit avoir un lien vers son équivalent FR
- Pas de divergence sémantique silencieuse entre les versions linguistiques

---

## Discipline AutoHeal

Pour chaque correctif appliqué :

1. Ajouter une entrée dans `scripts/autoheal/autoheal_rules.jsonl`
2. Le champ `prevention_test` doit contenir la sous-chaîne `detect_recurrence`
3. Exécuter `bash scripts/autoheal/detect_recurrence.sh`
4. Exécuter `bash scripts/verify_instructions.sh`

---

## Conventions de commit

```
type(scope): description courte

feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation uniquement
refactor: refactoring sans changement de comportement
test: ajout/modification de tests
ci: changements CI/CD
chore: tâches de maintenance
seal: session de scellement gouvernancée
```

---

*Documentation en anglais : [docs/dev/en/conventions.md](../en/conventions.md)*
