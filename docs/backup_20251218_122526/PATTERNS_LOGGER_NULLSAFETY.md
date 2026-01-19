# 📚 Patterns Logger & Null Safety — TITANE∞

**Version**: v24.3.3  
**Date**: 2025-01-XX  
**Statut**: ✅ Patterns validés en production

---

## 🎯 Vue d'Ensemble

Ce document établit les **patterns obligatoires** pour :

1. **Logging centralisé** : Remplacement de tous les `console.*` par `logger.*`
2. **Null safety** : Gestion des types `T | null` provenant du backend Rust
3. **Error handling** : Utilisation de ErrorBoundary unifiée

---

## 📝 Pattern 1 : Logger Centralisé

### Import Requis

```typescript
import { logger } from './lib/logger';
// ou
import { logger } from '@/lib/logger';
```

### Syntaxe Obligatoire

```typescript
logger.error(
  'Message d\'erreur clair et concis',
  {
    component: 'NomComposant',    // REQUIS : Identifiant du composant
    action: 'nomMethode',         // OPTIONNEL : Méthode/action en cours
    service?: 'NomService',       // OPTIONNEL : Service concerné
    ...autresContextes            // OPTIONNEL : Contextes additionnels
  },
  error                           // OPTIONNEL : Objet Error natif
);
```

### Exemples Réels

#### Erreur Simple (sans Error object)

```typescript
// ❌ AVANT
console.warn('React DevTools unavailable');

// ✅ APRÈS
logger.warn('React DevTools unavailable in production build', {
  component: 'Main',
  action: 'checkDevTools',
});
```

#### Erreur avec Exception

```typescript
// ❌ AVANT
console.error('Failed to load tokens:', error);

// ✅ APRÈS
logger.error(
  'Failed to load tokens',
  {
    component: 'UIThemeProvider',
    action: 'loadTokens',
  },
  error
);
```

#### Erreur avec Service

```typescript
// ❌ AVANT
console.error('❌ [OLLAMA] Failed to initialize:', error);

// ✅ APRÈS
logger.error(
  'Failed to initialize OLLAMA',
  {
    component: 'App',
    service: 'Ollama',
  },
  error as Error
);
```

#### Erreur dans Event Handler

```typescript
// ❌ AVANT
window.addEventListener('error', event => {
  console.error('Uncaught error:', event.error);
});

// ✅ APRÈS
window.addEventListener('error', event => {
  logger.error(
    'Global error caught',
    {
      component: 'Main',
      action: 'globalErrorHandler',
    },
    event.error
  );
});
```

#### Erreur dans Promise Rejection

```typescript
// ❌ AVANT
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});

// ✅ APRÈS
window.addEventListener('unhandledrejection', event => {
  logger.error(
    'Unhandled promise rejection',
    {
      component: 'Main',
      action: 'unhandledRejection',
    },
    event.reason
  );
});
```

### Niveaux de Log Disponibles

```typescript
logger.error('Message', context, error); // Erreurs critiques
logger.warn('Message', context); // Avertissements
logger.info('Message', context); // Informations
logger.debug('Message', context); // Debug (dev uniquement)
```

### Règles de Nommage

| Contexte      | Règle                                        | Exemple                                                |
| ------------- | -------------------------------------------- | ------------------------------------------------------ |
| **component** | PascalCase, nom du composant React ou module | `'UIThemeProvider'`, `'Main'`, `'App'`                 |
| **action**    | camelCase, nom de la méthode ou action       | `'loadTokens'`, `'initEngine'`, `'globalErrorHandler'` |
| **service**   | PascalCase, nom du service externe           | `'Ollama'`, `'CognitiveCache'`, `'UIPolish'`           |

### Guards NODE_ENV

Le logger gère automatiquement `NODE_ENV` :

- **Development** : Tous les logs affichés dans console
- **Production** : `console.*` désactivés, logs routés vers backend monitoring

**Vous n'avez PAS à ajouter de guards manuels** :

```typescript
// ❌ NE PAS FAIRE
if (import.meta.env.DEV) {
  logger.error('Message', context, error);
}

// ✅ FAIRE
logger.error('Message', context, error); // Guards automatiques
```

---

## 🛡️ Pattern 2 : Null Safety

### Contexte

Le backend Rust utilise `Option<T>` qui se traduit en `T | null` côté TypeScript.

**Règle** : **Toujours** vérifier null avant accès aux propriétés.

### Pattern de Base

```typescript
// ❌ DANGEREUX (crash si data null)
const processData = (data: Data | null) => {
  console.log(data.property); // CRASH si data === null
};

// ✅ SÉCURISÉ
const processData = (data: Data | null) => {
  if (!data) {
    logger.warn('Data is null, using defaults', {
      component: 'ComponentName',
      action: 'processData',
    });
    return DEFAULT_DATA;
  }
  // Safe to access data.property
  console.log(data.property);
};
```

### Pattern Complet avec Nested Properties

```typescript
// ❌ DANGEREUX (crash si data ou data.nested null)
const processNested = (data: Data | null) => {
  const value = data.nested.property; // CRASH
};

// ✅ SÉCURISÉ
const processNested = (data: Data | null) => {
  if (!data || !data.nested) {
    logger.warn('Data or nested is null', {
      component: 'ComponentName',
      action: 'processNested',
    });
    return DEFAULT_VALUE;
  }
  const value = data.nested.property; // Safe
};
```

### Exemple Réel : UIThemeProvider

```typescript
const applyTokensToDOM = (tokens: UIThemeTokens | null) => {
  // Guard 1 : Vérifier tokens
  if (!tokens) {
    logger.warn('Skipping DOM application - tokens is null', {
      component: 'UIThemeProvider',
      action: 'applyTokensToDOM',
    });
    return;
  }

  // Guard 2 : Vérifier nested property
  if (!tokens.colors) {
    logger.warn('Skipping DOM application - tokens.colors is null', {
      component: 'UIThemeProvider',
      action: 'applyTokensToDOM',
    });
    return;
  }

  // Safe : tokens ET tokens.colors sont définis
  const root = document.documentElement;
  Object.entries(tokens.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};
```

### Fallbacks Recommandés

```typescript
// Option 1 : Return early
const process = (data: Data | null) => {
  if (!data) return;
  // ... process data
};

// Option 2 : Return default value
const process = (data: Data | null): ProcessedData => {
  if (!data) return DEFAULT_PROCESSED_DATA;
  // ... process data
  return result;
};

// Option 3 : Use default in-place
const process = (data: Data | null) => {
  const safeData = data ?? DEFAULT_DATA;
  // ... process safeData (never null)
};
```

### Reducer Pattern avec Fallback

```typescript
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      // Fallback si payload null
      return {
        ...state,
        data: action.payload ?? DEFAULT_DATA,
      };
    default:
      return state;
  }
};
```

---

## ⚡ Pattern 3 : ErrorBoundary Unifiée

### Import Requis

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';
// ou
import { ErrorBoundary } from '@/components/ErrorBoundary';
```

### Usage de Base

```typescript
<ErrorBoundary context="root">
  <App />
</ErrorBoundary>
```

### Props Disponibles

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode; // REQUIS : Composants enfants
  context?: string; // OPTIONNEL : Contexte d'erreur (ex: 'root', 'feature-x')
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // OPTIONNEL : Callback custom
  fallback?: React.ReactNode; // OPTIONNEL : UI de remplacement
}
```

### Exemple avec Callback

```typescript
<ErrorBoundary
  context="root"
  onError={(error, errorInfo) => {
    logger.error('ErrorBoundary caught error', {
      component: 'Main',
      action: 'errorBoundary'
    }, error);

    // Analytics, reporting, etc.
    analytics.trackError(error, errorInfo);
  }}
>
  <App />
</ErrorBoundary>
```

### Exemple avec Fallback Custom

```typescript
<ErrorBoundary
  context="feature-x"
  fallback={
    <div className="error-fallback">
      <h1>⚠️ Feature X Unavailable</h1>
      <p>Please contact support.</p>
    </div>
  }
>
  <FeatureX />
</ErrorBoundary>
```

### Nesting ErrorBoundaries

```typescript
// Root level
<ErrorBoundary context="root" onError={globalErrorHandler}>
  <App>
    {/* Feature level */}
    <ErrorBoundary context="feature-x">
      <FeatureX />
    </ErrorBoundary>

    <ErrorBoundary context="feature-y">
      <FeatureY />
    </ErrorBoundary>
  </App>
</ErrorBoundary>
```

**Règle** : Errors remontent jusqu'au premier ErrorBoundary parent.

---

## 🔄 Pattern 4 : Vite Fast Refresh

### Règle Export

**Tous les exports non-component DOIVENT être avant `export default`.**

```typescript
// ✅ CORRECT - Fast Refresh fonctionne
export const useCustomHook = () => {
  /* ... */
};
export const CONSTANT = 42;
export const helperFunction = () => {
  /* ... */
};

export default function Component() {
  // ... component code
}
```

```typescript
// ❌ INCORRECT - Fast Refresh cassé
export default function Component() {
  // ... component code
}

export const useCustomHook = () => {
  /* ... */
}; // ❌ Après default
```

### Cas Particulier : Re-exports

```typescript
// ✅ CORRECT
export { SomeComponent } from './SomeComponent';
export { useHook } from './useHook';

export default function MainComponent() {
  // ...
}
```

---

## 📋 Checklist de Migration

### Pour chaque fichier à migrer :

- [ ] **Import logger** ajouté en haut du fichier
- [ ] **Tous les `console.error`** remplacés par `logger.error`
- [ ] **Tous les `console.warn`** remplacés par `logger.warn`
- [ ] **Tous les `console.log`** critiques remplacés par `logger.info`
- [ ] **Contexte structuré** ajouté (`component`, `action`, `service`)
- [ ] **Null checks** ajoutés pour types `T | null`
- [ ] **Fallbacks** définis pour données nullables
- [ ] **ErrorBoundary** utilisée si composant React critique
- [ ] **Exports** organisés (hooks/constants avant default)
- [ ] **TypeScript** compile (`npx tsc --noEmit --skipLibCheck`)
- [ ] **Tests** passent (si tests existants)

---

## 🚨 Anti-Patterns à Éviter

### ❌ Console.\* Direct

```typescript
// ❌ NE JAMAIS FAIRE
console.error('Error:', error);
console.warn('Warning');
console.log('Info');

// ✅ TOUJOURS FAIRE
logger.error('Error', context, error);
logger.warn('Warning', context);
logger.info('Info', context);
```

### ❌ Accès Direct sans Null Check

```typescript
// ❌ NE JAMAIS FAIRE
const process = (data: Data | null) => {
  return data.property; // CRASH si data null
};

// ✅ TOUJOURS FAIRE
const process = (data: Data | null) => {
  if (!data) return DEFAULT_VALUE;
  return data.property;
};
```

### ❌ Multiple ErrorBoundary Implementations

```typescript
// ❌ NE JAMAIS FAIRE
// Créer ErrorBoundary custom dans chaque feature

// ✅ TOUJOURS FAIRE
// Utiliser @/components/ErrorBoundary partout
import { ErrorBoundary } from '@/components/ErrorBoundary';
```

### ❌ Guards NODE_ENV Manuels

```typescript
// ❌ NE JAMAIS FAIRE
if (import.meta.env.DEV) {
  logger.error('Error', context, error);
}

// ✅ TOUJOURS FAIRE
logger.error('Error', context, error); // Guards automatiques
```

### ❌ Exports Désordonnés

```typescript
// ❌ NE JAMAIS FAIRE
export default function Component() {
  /* ... */
}
export const useHook = () => {
  /* ... */
}; // Casse Fast Refresh

// ✅ TOUJOURS FAIRE
export const useHook = () => {
  /* ... */
};
export default function Component() {
  /* ... */
}
```

---

## 📊 Exemples de Migrations Complètes

### Migration 1 : Composant Simple

**AVANT** :

```typescript
import React from 'react';

const MyComponent = ({ data }: { data: Data | null }) => {
  if (!data) {
    console.warn('No data provided');
    return null;
  }

  const handleClick = () => {
    try {
      processData(data);
    } catch (error) {
      console.error('Failed to process:', error);
    }
  };

  return <button onClick={handleClick}>Process</button>;
};

export default MyComponent;
```

**APRÈS** :

```typescript
import React from 'react';
import { logger } from '@/lib/logger';

const MyComponent = ({ data }: { data: Data | null }) => {
  if (!data) {
    logger.warn('No data provided', {
      component: 'MyComponent'
    });
    return null;
  }

  const handleClick = () => {
    try {
      processData(data);
    } catch (error) {
      logger.error('Failed to process data', {
        component: 'MyComponent',
        action: 'handleClick'
      }, error as Error);
    }
  };

  return <button onClick={handleClick}>Process</button>;
};

export default MyComponent;
```

### Migration 2 : Service avec Backend Calls

**AVANT** :

```typescript
export const loadUserData = async (): Promise<UserData | null> => {
  try {
    const response = await invoke<UserData | null>('load_user_data');
    console.log('User data loaded:', response);
    return response;
  } catch (error) {
    console.error('Failed to load user data:', error);
    return null;
  }
};
```

**APRÈS** :

```typescript
import { logger } from '@/lib/logger';

export const loadUserData = async (): Promise<UserData | null> => {
  try {
    const response = await invoke<UserData | null>('load_user_data');

    if (!response) {
      logger.warn('Backend returned null user data', {
        component: 'UserDataService',
        action: 'loadUserData',
      });
      return null;
    }

    logger.info('User data loaded successfully', {
      component: 'UserDataService',
      action: 'loadUserData',
    });

    return response;
  } catch (error) {
    logger.error(
      'Failed to load user data',
      {
        component: 'UserDataService',
        action: 'loadUserData',
      },
      error as Error
    );
    return null;
  }
};
```

### Migration 3 : Provider avec Context

**AVANT** :

```typescript
export const MyProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchData();
        dispatch({ type: 'LOAD_SUCCESS', payload: data });
      } catch (error) {
        console.error('Failed to load:', error);
        dispatch({ type: 'LOAD_ERROR' });
      }
    };
    loadData();
  }, []);

  return (
    <MyContext.Provider value={state}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
export default MyProvider;
```

**APRÈS** :

```typescript
import { logger } from '@/lib/logger';

// ✅ Exports avant default
export const useMyContext = () => useContext(MyContext);

export default function MyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchData();

        // Null check
        if (!data) {
          logger.warn('Backend returned null data', {
            component: 'MyProvider',
            action: 'loadData'
          });
          dispatch({ type: 'LOAD_SUCCESS', payload: DEFAULT_DATA });
          return;
        }

        dispatch({ type: 'LOAD_SUCCESS', payload: data });
        logger.info('Data loaded successfully', {
          component: 'MyProvider',
          action: 'loadData'
        });
      } catch (error) {
        logger.error('Failed to load data', {
          component: 'MyProvider',
          action: 'loadData'
        }, error as Error);
        dispatch({ type: 'LOAD_ERROR' });
      }
    };
    loadData();
  }, []);

  return (
    <MyContext.Provider value={state}>
      {children}
    </MyContext.Provider>
  );
}
```

---

## 🎓 Ressources Additionnelles

### Documentation Logger

Voir `src/lib/logger.ts` pour :

- Interface complète `Logger`
- Niveaux de log disponibles
- Hooks backend monitoring
- Configuration NODE_ENV

### Documentation ErrorBoundary

Voir `src/components/ErrorBoundary.tsx` pour :

- Props interface `ErrorBoundaryProps`
- Lifecycle methods (`componentDidCatch`, `getDerivedStateFromError`)
- Fallback UI rendering
- Error logging integration

### Documentation Null Safety

Voir `src/features/design-center/providers/UIThemeProvider.tsx` pour :

- Exemple complet de guards null (7 couches)
- Pattern reducer avec fallbacks
- Gestion `Option<T>` backend

---

## ✅ Validation

Après migration d'un fichier :

```bash
# TypeScript
npx tsc --noEmit --skipLibCheck

# Rust (si backend modifié)
cargo check --manifest-path=src-tauri/Cargo.toml

# Build complète (optionnel)
pnpm run build
```

**Attendu** : 0 erreurs, 0 warnings

---

**Document maintenu par** : TITANE Team  
**Dernière mise à jour** : v24.3.3 (2025-01-XX)  
**Statut** : ✅ Patterns validés en production
