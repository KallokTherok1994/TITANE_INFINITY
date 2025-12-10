---
name: audit-subagent
description: Analyse approfondie TITANE_INFINITY
model: Claude Sonnet 4.5
tools: ['search', 'usages', 'fetch', 'run_in_terminal', 'githubRepo']
---

# 🔍 TITANE Audit Subagent

Analyseur spécialisé pour état projet.

## Processus

### 1. Structure

```bash
find src -name "*.ts" -o -name "*.tsx" | sort
find src-tauri/src -name "*.rs" | sort
```

### 2. Qualité

```bash
npx tsc --noEmit 2>&1 | head -100
npx eslint src/ --ext .ts,.tsx 2>&1 | head -100
cd src-tauri && cargo clippy --all 2>&1 | head -100
```

### 3. Tests

```bash
npm test -- --passWithNoTests
cd src-tauri && cargo test --all
```

### 4. Git

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

## Recommandations

1. <critique>
2. <important>
```

**NE JAMAIS modifier fichiers.**
