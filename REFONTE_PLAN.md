# 🚀 PLAN DE REFONTE FRONTEND TITANE∞ v17.1

**Status:** 📋 PLANIFICATION  
**Durée estimée:** 2-3 semaines  
**Risque:** MOYEN (refonte majeure avec app fonctionnelle)

---

## ⚠️ STRATÉGIE RECOMMANDÉE

Étant donné que l'application est **100% fonctionnelle** actuellement, nous adoptons une approche **progressive** :

### Approche Sécurisée (Recommandée)

1. ✅ **Création structure parallèle** (ne touche pas à l'existant)
2. ✅ **Migration feature par feature** (testable à chaque étape)
3. ✅ **Flag features** (switch entre ancien/nouveau)
4. ✅ **Validation continue** (tests automatiques)
5. ✅ **Rollback facile** (git branches)

###

 Approche Agressive (Non recommandée)

❌ Tout refactoriser d'un coup → Risque élevé de régression

---

## 📅 PLANNING DÉTAILLÉ

### Semaine 1 : Fondations

**Jour 1-2 : Configuration & Structure**
- [x] Architecture documentée (ARCHITECTURE.md)
- [ ] tsconfig.json en mode strict
- [ ] Configuration ESLint + Prettier personnalisée
- [ ] Aliases TypeScript (`@ui`, `@features`, etc.)
- [ ] Création dossiers structure
- [ ] Service Tauri isolé dans `src/services/tauri/`

**Jour 3-4 : Design System Base**
- [ ] Tokens de design (`themes/tokens/`)
- [ ] Primitives UI de base (Button, Card, Input)
- [ ] Hook `useTheme()` v1
- [ ] CSS global optimisé

**Jour 5 : Tests & Validation**
- [ ] Tests unitaires primitives UI
- [ ] Storybook setup basique
- [ ] Validation TypeScript strict
- [ ] Documentation inline

### Semaine 2 : Design System & Thèmes

**Jour 6-7 : UI Kit Complet**
- [ ] Toutes primitives UI (Modal, Tooltip, Select, etc.)
- [ ] Variants et states complets
- [ ] Accessibilité (aria-labels, focus)
- [ ] Storybook enrichi

**Jour 8-9 : Theme Engine**
- [ ] 4 thèmes (Rubis, Saphir, Émeraude, Diamant)
- [ ] Transitions fluides
- [ ] Persistance LocalStorage
- [ ] Preview switcher

**Jour 10 : Layout System**
- [ ] Shell layout refactorisé
- [ ] Sidebar intelligente
- [ ] Header modulaire
- [ ] Grid 12 colonnes responsive

### Semaine 3 : Features & Optimisation

**Jour 11-12 : Migration Features**
- [ ] Feature Chat refactorisée
- [ ] Feature Dashboard refactorisée
- [ ] Feature Memory refactorisée
- [ ] Tests intégration

**Jour 13-14 : Performance**
- [ ] Lazy loading routes
- [ ] Code splitting
- [ ] React Query setup
- [ ] Optimisation re-renders

**Jour 15 : Polish & Documentation**
- [ ] Bug fixes
- [ ] Documentation finale
- [ ] Tests E2E
- [ ] Release notes

---

## 🎯 LIVRABLES PAR PHASE

### Phase 1 - Fondations ✅ EN COURS

**Fichiers à créer:**

```
src/
├── app/
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   ├── router/
│   │   └── AppRouter.tsx
│   └── App.tsx (refactorisé)
│
├── services/
│   └── tauri/
│       ├── commands.ts
│       ├── types.ts
│       └── validation.ts
│
├── themes/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   └── index.ts
│
└── ui/ (refactorisé)
    ├── Button/
    ├── Card/
    └── index.ts
```

**Scripts à ajouter:**

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

**Configuration à modifier:**

- `tsconfig.json` : strict mode + aliases
- `.eslintrc.cjs` : règles personnalisées
- `vite.config.ts` : aliases + optimisations

---

## 🛠️ COMMANDES UTILES

### Installation dépendances nouvelles

```bash
# Design System
./pnpm-host.sh add zustand zod framer-motion clsx

# Dev tools
./pnpm-host.sh add -D @storybook/react @storybook/addon-essentials
./pnpm-host.sh add -D @types/node vite-tsconfig-paths

# Linting
./pnpm-host.sh add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
./pnpm-host.sh add -D eslint-config-prettier eslint-plugin-react-hooks

# Tests
./pnpm-host.sh add -D vitest @testing-library/react @testing-library/user-event
```

### Développement

```bash
# Lancer app (mode actuel)
./tauri-flatpak.sh dev

# Type checking
./pnpm-host.sh run type-check

# Linting
./pnpm-host.sh run lint

# Storybook (quand configuré)
./pnpm-host.sh run storybook
```

---

## ⚡ QUICK WINS IMMÉDIATS

Ces améliorations peuvent être faites **maintenant** sans risque :

### 1. TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2. Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@ui/*": ["./src/ui/*"],
      "@components/*": ["./src/components/*"],
      "@features/*": ["./src/features/*"],
      "@services/*": ["./src/services/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@stores/*": ["./src/stores/*"],
      "@themes/*": ["./src/themes/*"],
      "@utils/*": ["./src/utils/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

### 3. ESLint Configuration

```js
// .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

---

## 🎯 PROCHAINES ACTIONS IMMÉDIATES

**Ce que nous pouvons faire MAINTENANT :**

1. ✅ **Scripts Flatpak corrigés** (déjà fait)
2. ✅ **Architecture documentée** (déjà fait)
3. ⏳ **Installer dépendances nouvelles** (zustand, zod, framer-motion)
4. ⏳ **Configurer TypeScript strict**
5. ⏳ **Créer premiers tokens de design**
6. ⏳ **Créer premières primitives UI**

**Voulez-vous que je continue avec les étapes 3-6 ?**

---

## 📝 NOTES IMPORTANTES

### ⚠️ Points d'attention

- **Ne pas casser l'existant** : Créer en parallèle, migrer progressivement
- **Tester à chaque étape** : Validation continue
- **Git branches** : Une branch par feature
- **Commits atomiques** : Petits commits logiques
- **Documentation inline** : Documenter au fur et à mesure

### ✅ Avantages de cette approche

- Risque minimal de régression
- Testable à chaque étape
- Rollback facile si problème
- Équipe peut continuer à développer
- Apprentissage progressif de la nouvelle architecture

### 📊 Métriques de succès

- [ ] 0 régression fonctionnelle
- [ ] TypeScript strict mode actif
- [ ] 90%+ couverture tests UI
- [ ] Bundle size < actuel
- [ ] Performance >= actuelle
- [ ] Storybook complet

---

**Prêt à démarrer ? Confirmez et je lance la Phase 1 complète ! 🚀**
