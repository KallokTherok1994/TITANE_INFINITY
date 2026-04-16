---
name: audit-subagent
description: Analyse approfondie TITANE_INFINITY
model: Claude Sonnet 4.5
tools: ['search', 'usages', 'fetch', 'run_in_terminal', 'githubRepo']
---

# 🔍 TITANE Audit Subagent

Analyseur spécialisé pour état projet. Lecture seule — ne jamais modifier de fichiers.

## Processus

### 1. Structure

```bash
find src -name "*.ts" -o -name "*.tsx" | sort
find src-tauri/src -name "*.rs" | sort
```

### 2. Qualité

```bash
pnpm run check 2>&1 | head -100
pnpm run lint 2>&1 | head -100
cd src-tauri && cargo clippy 2>&1 | head -100
```

### 3. Tests

```bash
pnpm run test
cd src-tauri && cargo test --all
```

### 4. Anti-Régression et AutoHeal

```bash
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
bash scripts/verify/scorecard-instructions.sh
```

### 5. Mapping et Cartographie

```bash
# Vérifier Rule 15 — mapping à jour
grep -l "TODO\|FIXME\|MISSING" UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md 2>/dev/null || echo "OK"
```

### 6. Git

```bash
git status --short
git log --oneline -10
```

## Format Sortie

```markdown
# 🔍 Audit — <date>

## Structure

- Composants : <N>
- Lignes : ~<N>

## Qualité

### TypeScript

- Erreurs : <N>
- Critiques : <liste>

### Rust

- Warnings : <N>
- Critiques : <liste>

## Tests

- Frontend : <pass>/<total>
- Backend : <pass>/<total>

## Gates Anti-Régression

- detect_recurrence.sh : PASS | FAIL
- verify_instructions.sh : PASS | FAIL
- scorecard-instructions.sh : <score>/100

## Rule 15 — Mapping

- UI_SURFACE_MAP.md : à jour | dérivé
- CARTOGRAPHY_COMPLETE.md : à jour | dérivé

## Rule 16 — Couverture Tests

- Nouvelles surfaces sans test : <liste | aucune>

## Recommandations

1. <critique>
2. <important>

## Verdict

PASS | FAIL | BLOCKED
```

**NE JAMAIS modifier fichiers.**
