# GUIDE DE STANDARDISATION DES TESTS — TITANE INFINITY

**Version**: v26.4.0  
**Date**: 2026-01-26  
**Objectif**: Standardiser tous les tests DevTools pour atteindre 95%+ de réussite

## 📋 CONTEXTE

**Situation actuelle**:

- 211 échecs / 2875 tests (92.7% passants)
- 4 fichiers standardisés avec succès (+8 tests passants)
- ~54 fichiers DevTools restants à standardiser

**Preuve de concept**: Dashboard, Metrics, Logs, OmegaPipeline ✅

## 🎯 PATTERN DE STANDARDISATION

### 1. Structure du Mock du Store

**AVANT** (incorrect):

```tsx
vi.mock('@/apps/devtools/components/CoreHealthMonitor', () => ({
  CoreHealthMonitor: () => <div>Mock</div>,
}));
```

**APRÈS** (correct):

```tsx
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    systemHealth: 'healthy',
    engines: [{ id: 'helios', name: 'Helios', status: 'running' }],
    metrics: {
      'cpu-usage': {
        id: 'cpu-usage',
        label: 'CPU Usage',
        value: 34,
        unit: '%',
        trend: 'up',
        history: [30, 32, 34],
      },
    },
    logs: [],
    errors: [],
  }),
}));
```

### 2. Mock des Composants Enfants

```tsx
vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title }: any) => <div data-testid="section-header">{title}</div>,
  MetricCard: ({ label }: any) => (
    <div data-testid={`metric-${label.replace(/\s+/g, '-')}`}>{label}</div>
  ),
  StatusPill: ({ label }: any) => <span data-testid="status-pill">{label}</span>,
  EngineCard: ({ engine }: any) => (
    <div data-testid={`engine-${engine.id}`}>{engine.name}</div>
  ),
}));
```

### 3. Tests Alignés sur Vraie Structure

**AVANT** (incorrect):

```tsx
it('should render dashboard', () => {
  render(<Dashboard />);
  expect(screen.getByTestId('core-health')).toBeInTheDocument(); // ❌ N'existe pas
});
```

**APRÈS** (correct):

```tsx
it('should render dashboard with header', () => {
  render(<Dashboard />);
  expect(screen.getByTestId('section-header')).toBeInTheDocument(); // ✅ Existe vraiment
  expect(screen.getByText('System Dashboard')).toBeInTheDocument();
});
```

## 📁 TEMPLATES PAR TYPE DE SECTION

### Template: Dashboard / Overview Section

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from '@/apps/devtools/sections/Component';

vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    // Données spécifiques à la section
    systemHealth: 'healthy',
    engines: [...],
    // etc.
  }),
}));

vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title }: any) => <div data-testid="section-header">{title}</div>,
  // Autres composants utilisés
}));

describe('Component Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render section with header', () => {
      render(<Component />);
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Component />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
```

### Template: Metrics Section

```tsx
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    metrics: {
      'metric-id': {
        id: 'metric-id',
        label: 'Metric Name',
        value: 42,
        unit: 'ms',
        trend: 'stable',
        history: [40, 41, 42],
      },
    },
    timeRange: '2m',
    setTimeRange: vi.fn(),
  }),
}));

it('should display metric cards', () => {
  render(<Metrics />);
  expect(screen.getByTestId('metric-Metric-Name')).toBeInTheDocument();
});
```

### Template: Logs Section

```tsx
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    logs: [
      {
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        source: 'helios',
        message: 'Test log',
      },
    ],
    autoScrollLogs: true,
    setAutoScrollLogs: vi.fn(),
    clearLogs: vi.fn(),
  }),
}));

it('should display log lines', () => {
  render(<Logs />);
  expect(screen.getByTestId('log-1')).toBeInTheDocument();
});
```

### Template: Pipeline Section

```tsx
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    currentPipeline: [
      { id: 'step1', status: 'complete', duration: 50 },
      { id: 'step2', status: 'running', duration: 120 },
    ],
    pipelineHistory: [
      [
        { id: 'step1', status: 'complete', duration: 45 },
        { id: 'step2', status: 'complete', duration: 110 },
      ],
    ],
  }),
}));
```

## 🔧 CORRECTIONS COMMUNES

### 1. data-testid Manquants

**Problème**: Tests cherchent des `data-testid` qui n'existent pas  
**Solution**: Utiliser les `data-testid` existants ou mocker les composants

```tsx
// Au lieu de chercher 'metric-CPU'
expect(screen.getByTestId('metric-CPU')).toBeInTheDocument(); // ❌

// Utiliser le format correct généré
expect(screen.getByTestId('metric-CPU-Usage')).toBeInTheDocument(); // ✅
```

### 2. Timestamps Dynamiques dans Snapshots

**Problème**: Snapshots échouent à cause de timestamps changeants  
**Solution**: Mocker `Date()` dans `setup.ts`

```ts
// src/__tests__/setup.ts
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-26T12:00:00Z'));
});

afterAll(() => {
  vi.useRealTimers();
});
```

### 3. Propriétés Undefined

**Problème**: `Cannot read properties of undefined`  
**Solution**: Ajouter guards null-safe

```tsx
// Au lieu de
{
  data.length;
} // ❌

// Utiliser
{
  (data || []).length;
} // ✅
{
  data?.length || 0;
} // ✅
```

## 📊 CONVENTION data-testid

```
section-header       → En-tête de section
metric-{Label}       → Carte métrique (Label avec tirets au lieu d'espaces)
engine-{id}          → Carte moteur
log-{id}             → Ligne de log
status-pill          → Indicateur de statut
```

## ✅ CHECKLIST DE STANDARDISATION

Pour chaque fichier de test :

- [ ] Mock du store DevTools avec données réalistes
- [ ] Mock des composants enfants utilisés
- [ ] Tests alignés sur vraie structure DOM
- [ ] data-testid corrects et existants
- [ ] Guards null-safe pour propriétés optionnelles
- [ ] Snapshots sans timestamps dynamiques
- [ ] beforeEach() pour cleanup des mocks
- [ ] Tests passent localement

## 🚀 PROCÉDURE D'APPLICATION

1. **Identifier** le fichier de test à standardiser
2. **Analyser** le composant source (structure, props, store)
3. **Appliquer** le template approprié
4. **Vérifier** avec `pnpm test -- --testPathPattern="NomFichier"`
5. **Commit** les changements
6. **Répéter** pour le fichier suivant

## 📈 OBJECTIF

**Cible**: 95%+ tests passants (< 150 échecs)  
**Méthode**: Standardiser 10 fichiers par jour  
**Durée estimée**: 5-6 jours

---

**Pattern validé sur**: Dashboard, Metrics, Logs, OmegaPipeline ✅  
**Réduction des échecs**: -3.7% (8 tests) en 4 fichiers  
**Projection**: -45% avec standardisation complète
