# 🧠 Custom Instructions pour Cline - TITANE∞

**Ces instructions sont automatiquement chargées par Cline à chaque session.**

---

## 🎯 Ton & Style de Communication

- **Langue:** Français (sauf code/comments techniques en anglais)
- **Ton:** Professionnel, précis, concis
- **Emojis:** Autorisés pour clarté visuelle (📋, ✅, ❌, ⚠️, 🔧, etc.)
- **Format:** Markdown structuré avec sections claires

---

## 🚨 Règles Non-Négociables

### 1. Mode PLAN Obligatoire

**TOUJOURS analyser avant d'agir:**
1. Comprendre le contexte complet
2. Identifier les dépendances et impacts
3. Proposer un plan d'action détaillé
4. Attendre validation humaine
5. Exécuter étape par étape

**Jamais d'action automatique sans:**
- Plan approuvé
- Vérification des impacts
- Confirmation explicite

### 2. Déploiement INTERDIT

**❌ COMMANDES BLOQUÉES (sans "GO FOR PRODUCTION DEPLOY"):**
- `pnpm run build`
- `tauri build`
- `./runtime/stable/build.sh`
- Toute génération AppImage/DEB
- Installation système (`dpkg`, `sudo`)

**✅ MODE DEV UNIQUEMENT:**
- `pnpm run dev`
- Tests (`pnpm test`, `pnpm run test:all`)
- Validation (`pnpm run copilot-xs:validate`)
- Linting/formatting

### 3. Pas de ANY TypeScript

**Interdit:** `any`, types implicites  
**Requis:** Types stricts, interfaces explicites

```typescript
// ❌ INTERDIT
const data: any = await fetch();

// ✅ REQUIS
interface ApiResponse {
  status: number;
  data: string[];
}
const data: ApiResponse = await fetch();
```

### 4. Tests Obligatoires

**Avant toute modification importante:**
```bash
pnpm run check     # TypeScript
pnpm run lint      # ESLint
pnpm test -- --run # Tests unitaires
```

**Si modification backend Rust:**
```bash
pnpm run test:rust
```

---

## 💻 Workflow Standard

### Étape 1: Analyse
```
"Je vais analyser [contexte] avant de proposer des modifications"
```
- Lire les fichiers pertinents
- Identifier les patterns existants
- Vérifier les dépendances

### Étape 2: Plan
```markdown
## 📋 Plan d'Action

### Modifications proposées:
1. [Action 1] → Impact: [description]
2. [Action 2] → Impact: [description]

### Fichiers affectés:
- `src/components/X.tsx` (modification)
- `src/types/Y.ts` (ajout)

### Tests requis:
- Test unitaire pour fonction X
- Test d'intégration pour workflow Y

### Validation:
- [ ] TypeScript check
- [ ] Linting
- [ ] Tests passent

**Demande approbation avant exécution**
```

### Étape 3: Exécution (après approval)
- Appliquer modifications une par une
- Vérifier après chaque étape
- Reporter tout problème immédiatement

### Étape 4: Validation
```bash
pnpm run check
pnpm run lint
pnpm test -- --run
```

---

## 🔍 Analyse de Code

### Avant toute modification:

1. **Lire le contexte complet**
   - Fichier cible
   - Fichiers liés (imports/exports)
   - Tests existants
   - Documentation

2. **Identifier les patterns**
   - Style de code utilisé
   - Conventions de nommage
   - Architecture existante
   - Dépendances

3. **Vérifier l'impact**
   - Breaking changes ?
   - Autres fichiers affectés ?
   - Tests à mettre à jour ?
   - Documentation à modifier ?

### Pendant la modification:

1. **Cohérence**
   - Respecter style existant
   - Réutiliser utilitaires/components
   - Éviter duplication

2. **Qualité**
   - Types stricts
   - Error handling
   - Edge cases
   - Performance

3. **Documentation**
   - JSDoc pour fonctions publiques
   - Comments pour logique complexe
   - README si nouvelle feature

---

## 📚 Références Rapides

### Structure Projet

```
src/
├── components/      # UI React components
├── services/       # Business logic
│   ├── ai/        # AI providers
│   ├── memory/    # Memory management
│   └── cognitive/ # Cognitive kernels
├── hooks/         # React hooks
├── types/         # TypeScript types
└── utils/         # Utilities

src-tauri/
├── src/
│   ├── api_hub/   # API orchestration
│   ├── memory/    # Memory core (Rust)
│   └── lib.rs     # Entry point
└── Cargo.toml
```

### Routes Actives (v25.4.0)

```
/chat   → Chat IA
/titane → Core TITANE
/time   → Temporal Center
/stats  → Statistics
/admin  → Administration
/dev    → Development Center
```

### Imports Standard

```typescript
// 1. React/External
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// 2. Internal (@/ paths)
import { service } from '@/services/ai/Service';
import type { Type } from '@/types/types';

// 3. Relative (si nécessaire)
import { helper } from './utils';

// 4. Styles
import './styles.css';
```

### Naming

```typescript
// Classes/Types/Interfaces: PascalCase
class MyClass {}
interface MyInterface {}
type MyType = string;

// Functions/Variables: camelCase
function myFunction() {}
const myVariable = 10;

// Constants: UPPER_SNAKE_CASE
const MAX_VALUE = 100;
const API_ENDPOINT = '/api';

// React Components: PascalCase
export const MyComponent: React.FC = () => {};
```

### Error Handling

```typescript
// Async functions
async function fetchData(): Promise<Data> {
  try {
    const result = await invoke<Data>('command');
    return result;
  } catch (error) {
    console.error('Failed:', error);
    throw new Error(`Fetch failed: ${error}`);
  }
}

// Validation
function process(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid type');
  }
  if (!input.trim()) {
    throw new Error('Empty input');
  }
  return input.toUpperCase();
}
```

---

## 🧪 Tests

### Template Test Unitaire

```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should handle normal case', () => {
    expect(myFunction(10)).toBe(20);
  });

  it('should handle edge case', () => {
    expect(myFunction(0)).toBe(0);
  });

  it('should throw on invalid input', () => {
    expect(() => myFunction(-1)).toThrow();
  });
});
```

### Commandes Tests

```bash
# Frontend
pnpm test                 # Run tests
pnpm run test:watch       # Watch mode
pnpm run test:coverage    # Coverage

# Backend Rust
pnpm run test:rust        # Cargo test
cd src-tauri && cargo test

# E2E
pnpm run test:e2e         # Playwright

# All
pnpm run test:all         # Complete suite
```

---

## 🔒 Sécurité

### Checklist

- [ ] Pas de secrets hardcodés
- [ ] Inputs validés/sanitized
- [ ] Error messages pas trop verbeux
- [ ] Pas de eval() ou dangerouslySetInnerHTML
- [ ] Dependencies à jour et sûres

### Patterns

```typescript
// ❌ BAD
const apiKey = "sk-1234567890";

// ✅ GOOD
const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) throw new Error('Missing API key');

// ❌ BAD
const html = `<div>${userInput}</div>`;

// ✅ GOOD
const sanitized = DOMPurify.sanitize(userInput);
```

---

## 📊 Performance

### Checklist

- [ ] useMemo pour calculs coûteux
- [ ] useCallback pour callbacks
- [ ] Lazy loading pour components lourds
- [ ] Éviter re-renders inutiles
- [ ] Optimiser loops

### Patterns React

```typescript
// ✅ Memoization
const result = useMemo(
  () => expensiveCalc(data),
  [data]
);

// ✅ Callback stable
const handler = useCallback(
  () => doSomething(id),
  [id]
);

// ✅ Lazy loading
const HeavyComponent = lazy(
  () => import('./HeavyComponent')
);

// ✅ Conditional render
{items.length > 0 && (
  <List items={items} />
)}
```

---

## 🎨 UI/UX

### Principes

- ✅ Mobile-first responsive
- ✅ Dark mode support
- ✅ Accessibility (ARIA labels)
- ✅ Loading states
- ✅ Error states
- ✅ Empty states

### TailwindCSS

```tsx
// ✅ Responsive
<div className="w-full md:w-1/2 lg:w-1/3">

// ✅ Dark mode
<div className="bg-white dark:bg-gray-900">

// ✅ States
<button className="hover:bg-blue-600 active:scale-95">

// ✅ Composition
<div className="flex items-center justify-between p-4">
```

---

## 💬 Communication

### Format Réponse Standard

```markdown
## [Titre de la Réponse]

**Contexte:** [Comprendre la demande]

**Analyse:** [Ce que j'ai trouvé/vérifié]

**Plan:** [Ce que je propose]
1. Action 1
2. Action 2
3. Action 3

**Impact:** [Fichiers modifiés, risques, breaking changes]

**Validation:** [Tests à faire]

**Demande:** [Approbation/clarification si nécessaire]
```

### Demander Clarification

**Quand:**
- Contexte incomplet
- Multiple solutions possibles
- Impact important/incertain
- Breaking changes potentiels

**Comment:**
```markdown
## 🤔 Clarification Nécessaire

**Situation:** [Description]

**Options:**
1. Option A: [avantages/inconvénients]
2. Option B: [avantages/inconvénients]

**Ma recommandation:** [Avec justification]

**Question:** [Quelle approche préférez-vous ?]
```

---

## 🚀 Productivité

### Raccourcis Mentaux

1. **Avant chaque action:** "Est-ce que j'ai tout le contexte ?"
2. **Avant chaque commit:** "Les tests passent-ils ?"
3. **Avant chaque modification:** "Est-ce cohérent avec l'existant ?"
4. **Avant chaque déploiement:** "AI-JE 'GO FOR PRODUCTION DEPLOY' ?"

### Commandes Fréquentes

```bash
# Dev rapide
pnpm run dev

# Check rapide
pnpm run check && pnpm run lint

# Test rapide
pnpm test -- --run

# Validation complète
pnpm run copilot-xs:validate

# Tout vérifier
pnpm run verify
```

### Fichiers Référence

- `.clinerules` → Règles complètes
- `ARCHITECTURE.md` → Structure projet
- `CODE_STYLE.md` → Standards de code
- `.github/copilot-instructions.md` → Règles critiques
- `.cline/deployment-safeguards.json` → Safeguards sécurité

---

## 🎯 Objectif Final

**Produire du code:**
- ✅ Fonctionnel et testé
- ✅ Performant et sécurisé
- ✅ Maintenable et documenté
- ✅ Cohérent avec l'existant
- ✅ Respectueux des règles TITANE∞

**En tant que Cline:**
- 🧠 Analyser avant d'agir
- 📋 Planifier méthodiquement
- 🤝 Communiquer clairement
- ✅ Valider systématiquement
- 🔒 Respecter les safeguards

---

**Version:** 1.0.0  
**Created:** 2026-01-03  
**Owner:** Kevin Thibault  

*Ces instructions guident Cline pour travailler efficacement et en sécurité sur TITANE∞.*
