# 🚀 DEPLOYMENT GUIDE — TITANE∞ SYSTEM CENTER AUTOFIX v21

## Quick Start (5 minutes)

```bash
# 1. Vérifier les fichiers créés
ls -la src/services/systemCenter/
ls -la src/hooks/
ls -la src/features/system-center/

# 2. Compiler
pnpm run build

# 3. Tester
pnpm run test

# 4. Lancer dev
pnpm run dev
```

---

## Installation Complète

### Étape 1: Fichiers Créés

Les fichiers suivants ont été créés :

```
src/
├── services/
│   └── systemCenter/
│       ├── SystemCenterAutoFix.ts      ← Engine principal
│       └── SystemAPI.ts                ← API unifiée
│
├── hooks/
│   └── useSystemCenterAutoFix.ts       ← Hook React
│
├── features/
│   └── system-center/
│       ├── SystemCenterPageWithAutoFix.example.tsx  ← Exemple intégration
│       └── SystemCenterAutoFix.css                  ← Styles
│
└── docs/
    └── SYSTEM_CENTER_AUTOFIX_ENGINE_v21.md          ← Documentation
```

### Étape 2: Dependencies

Aucune dépendance externe requise. Le système utilise :
- React hooks (useState, useEffect, useCallback)
- Framer Motion (déjà présent)
- secureInvoke de @/lib/security (déjà présent)

### Étape 3: Integration dans Projet

#### Option A: Remplacer SystemCenterPage existant

```bash
# Backup ancien fichier
mv src/features/system-center/SystemCenterPage.tsx \
   src/features/system-center/SystemCenterPage.backup.tsx

# Utiliser nouvelle version
cp src/features/system-center/SystemCenterPageWithAutoFix.example.tsx \
   src/features/system-center/SystemCenterPage.tsx
```

#### Option B: Ajouter comme nouvelle page

```typescript
// src/App.tsx ou routes
import { SystemCenterPageWithAutoFix } from '@/features/system-center/SystemCenterPageWithAutoFix.example';

// Ajouter route
<Route path="/system-center-v21" element={<SystemCenterPageWithAutoFix />} />
```

#### Option C: Intégrer dans composant existant

```typescript
import { useSystemCenterAutoFix } from '@/hooks/useSystemCenterAutoFix';

export const YourComponent = () => {
  const {
    systemHealth,
    hasErrors,
    autoRepair,
    uxOutput
  } = useSystemCenterAutoFix();

  // Utiliser les données...
};
```

---

## Configuration

### 1. Whitelist de Commandes

Le système utilise automatiquement `ALLOWED_COMMANDS` de `src/lib/security.ts`.

**Vérifier la whitelist actuelle** :
```bash
grep -A 200 "export const ALLOWED_COMMANDS" src/lib/security.ts | head -50
```

**Ajouter des commandes manquantes** :
```typescript
// src/lib/security.ts
export const ALLOWED_COMMANDS = new Set<string>([
  // ... existing commands
  
  // Diagnostics (si manquants)
  'get_system_health',
  'get_module_health',
  'get_helios_metrics',
  
  // Monitoring (si manquants)
  'engines_monitoring_get_metrics',
  'engines_monitoring_get_dashboard',
  'performance_get_metrics',
]);
```

### 2. Commandes Invalides Connues

Pour ajouter de nouveaux mappings de commandes invalides :

```typescript
// src/services/systemCenter/SystemCenterAutoFix.ts

// Dans INVALID_COMMAND_ALTERNATIVES
'votre_commande_invalide': {
  invalidCommand: 'votre_commande_invalide',
  alternatives: ['commande_safe_1', 'commande_safe_2'],
  domain: 'diagnostics', // ou 'monitoring', 'config', 'cognition'
},
```

### 3. Domaines de Commandes

Pour ajouter un nouveau domaine :

```typescript
// src/services/systemCenter/SystemCenterAutoFix.ts

// Dans DOMAIN_COMMAND_MAP
votre_domaine: [
  'primary_command',        // ← Essayée en premier
  'fallback_command_1',
  'fallback_command_2',
],
```

---

## Tests

### Tests Unitaires

Créer : `src/services/systemCenter/__tests__/SystemCenterAutoFix.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { SystemCenterAutoFixEngine } from '../SystemCenterAutoFix';
import * as securityModule from '@/lib/security';

// Mock secureInvoke
vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

describe('SystemCenterAutoFixEngine', () => {
  let engine: SystemCenterAutoFixEngine;

  beforeEach(() => {
    engine = new SystemCenterAutoFixEngine();
    vi.clearAllMocks();
  });

  describe('analyzeError', () => {
    it('should detect SECURITY_WHITELIST errors', () => {
      const error = new Error('Command "test_cmd" is not in whitelist');
      const detected = engine.analyzeError(error);

      expect(detected.category).toBe('SECURITY_WHITELIST');
      expect(detected.originalCommand).toBe('test_cmd');
    });

    it('should detect API_NOT_FOUND errors', () => {
      const error = new Error('Command test_cmd not found');
      const detected = engine.analyzeError(error);

      expect(detected.category).toBe('API_NOT_FOUND');
    });

    it('should detect MODULE_NOT_INITIALIZED errors', () => {
      const error = new Error('Module not initialized');
      const detected = engine.analyzeError(error);

      expect(detected.category).toBe('MODULE_NOT_INITIALIZED');
    });
  });

  describe('autoFix', () => {
    it('should fix SECURITY_WHITELIST with alternative command', async () => {
      const error = {
        category: 'SECURITY_WHITELIST' as const,
        originalCommand: 'sc_run_quick_diagnostics',
        errorMessage: 'Test error',
        timestamp: Date.now(),
      };

      vi.mocked(securityModule.secureInvoke).mockResolvedValueOnce({ success: true });

      const fix = await engine.autoFix(error);

      expect(fix.success).toBe(true);
      expect(fix.newCommand).toBe('get_system_health');
      expect(fix.appliedFix).toBe('WHITELIST_REPLACED');
    });

    it('should fallback to get_system_health on command failure', async () => {
      const error = {
        category: 'SECURITY_WHITELIST' as const,
        originalCommand: 'unknown_command',
        errorMessage: 'Test error',
        timestamp: Date.now(),
      };

      const fix = await engine.autoFix(error);

      expect(fix.success).toBe(false);
      expect(fix.appliedFix).toBe('WHITELIST_NO_ALTERNATIVE');
    });
  });

  describe('getFixHistory', () => {
    it('should track fix history', async () => {
      const error = {
        category: 'SECURITY_WHITELIST' as const,
        originalCommand: 'sc_run_quick_diagnostics',
        errorMessage: 'Test',
        timestamp: Date.now(),
      };

      vi.mocked(securityModule.secureInvoke).mockResolvedValueOnce({});
      await engine.autoFix(error);

      const history = engine.getFixHistory();
      expect(history.length).toBe(1);
      expect(history[0].success).toBe(true);
    });
  });
});
```

### Tests d'Intégration

Créer : `src/services/systemCenter/__tests__/SystemAPI.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import SystemAPI from '../SystemAPI';
import * as securityModule from '@/lib/security';

vi.mock('@/lib/security');

describe('SystemAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSystemHealth', () => {
    it('should return system health on success', async () => {
      const mockHealth = {
        status: 'healthy',
        modules: [],
        overallScore: 0.9,
        timestamp: Date.now(),
      };

      vi.mocked(securityModule.secureInvoke).mockResolvedValueOnce(mockHealth);

      const result = await SystemAPI.getSystemHealth();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHealth);
    });

    it('should auto-fix on command failure', async () => {
      vi.mocked(securityModule.secureInvoke)
        .mockRejectedValueOnce(new Error('Command not found'))
        .mockResolvedValueOnce({ fallback: true });

      const result = await SystemAPI.getSystemHealth();

      expect(result.autoFixed).toBe(true);
      expect(result.replacedBy).toBeDefined();
    });
  });

  describe('getMonitoringMetrics', () => {
    it('should try multiple commands and return first success', async () => {
      vi.mocked(securityModule.secureInvoke)
        .mockRejectedValueOnce(new Error('First failed'))
        .mockResolvedValueOnce({ cpu: 50, memory: 60 });

      const result = await SystemAPI.getMonitoringMetrics();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return fallback metrics if all commands fail', async () => {
      vi.mocked(securityModule.secureInvoke).mockRejectedValue(new Error('All failed'));

      const result = await SystemAPI.getMonitoringMetrics();

      expect(result.success).toBe(true);
      expect(result.autoFixed).toBe(true);
      expect(result.data).toMatchObject({
        cpu: 0,
        memory: 0,
        engines: [],
      });
    });
  });
});
```

### Lancer les Tests

```bash
# Tests unitaires uniquement
pnpm run test -- SystemCenterAutoFix

# Tests avec coverage
pnpm run test:coverage

# Watch mode
pnpm run test:watch
```

---

## Validation Post-Déploiement

### Checklist (30 points)

#### ✅ Compilation

- [ ] `pnpm run build` réussit sans erreur
- [ ] Aucun warning TypeScript
- [ ] Aucun import manquant

#### ✅ Runtime

- [ ] Page Centre Système charge sans crash
- [ ] Hook `useSystemCenterAutoFix` s'initialise
- [ ] Diagnostic système retourne résultat
- [ ] Auto-repair fonctionne sur erreur simulée

#### ✅ UI/UX

- [ ] Status badges affichés correctement
- [ ] Boutons actions fonctionnels
- [ ] Health summary visible
- [ ] Monitoring metrics affichées
- [ ] UX propre générée
- [ ] Détails techniques repliables
- [ ] Historique auto-fix visible

#### ✅ AutoFix

- [ ] Détection SECURITY_WHITELIST fonctionne
- [ ] Détection API_NOT_FOUND fonctionne
- [ ] Détection MODULE_NOT_INITIALIZED fonctionne
- [ ] Mapping commandes correctes appliquées
- [ ] Fallback get_system_health fonctionne
- [ ] Historique des corrections enregistré

#### ✅ Intégration

- [ ] SystemAPI retourne résultats cohérents
- [ ] Commandes whitelists respectées
- [ ] ErrorBoundary protège composants
- [ ] Aucune régression autres modules

#### ✅ Performance

- [ ] Temps chargement < 2s
- [ ] Auto-fix < 100ms
- [ ] UX generation < 50ms
- [ ] Aucun memory leak détecté

#### ✅ Sécurité

- [ ] Aucune commande non whitelist utilisée
- [ ] Audit logging fonctionnel
- [ ] Fallbacks sécurisés appliqués

### Script de Validation

Créer : `scripts/validate-autofix.sh`

```bash
#!/bin/bash

echo "🔍 TITANE∞ System Center AutoFix — Validation"
echo "=============================================="

# 1. Vérifier fichiers
echo ""
echo "1️⃣ Vérification fichiers..."
FILES=(
  "src/services/systemCenter/SystemCenterAutoFix.ts"
  "src/services/systemCenter/SystemAPI.ts"
  "src/hooks/useSystemCenterAutoFix.ts"
  "src/features/system-center/SystemCenterPageWithAutoFix.example.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MANQUANT"
    exit 1
  fi
done

# 2. Compilation TypeScript
echo ""
echo "2️⃣ Compilation TypeScript..."
pnpm run type-check
if [ $? -eq 0 ]; then
  echo "  ✅ Compilation OK"
else
  echo "  ❌ Erreurs TypeScript"
  exit 1
fi

# 3. Tests
echo ""
echo "3️⃣ Tests unitaires..."
pnpm run test -- SystemCenterAutoFix --run
if [ $? -eq 0 ]; then
  echo "  ✅ Tests OK"
else
  echo "  ❌ Tests échoués"
  exit 1
fi

# 4. Whitelist check
echo ""
echo "4️⃣ Vérification whitelist..."
REQUIRED_COMMANDS=(
  "get_system_health"
  "get_module_health"
  "get_helios_metrics"
)

for cmd in "${REQUIRED_COMMANDS[@]}"; do
  if grep -q "\"$cmd\"" src/lib/security.ts; then
    echo "  ✅ $cmd"
  else
    echo "  ⚠️  $cmd manquante (ajouter à whitelist)"
  fi
done

# 5. Build test
echo ""
echo "5️⃣ Build production..."
pnpm run build
if [ $? -eq 0 ]; then
  echo "  ✅ Build OK"
else
  echo "  ❌ Build échoué"
  exit 1
fi

echo ""
echo "=============================================="
echo "✅ Validation complète réussie!"
echo ""
echo "Prochaines étapes:"
echo "  1. pnpm run dev"
echo "  2. Naviguer vers /system-center"
echo "  3. Tester diagnostic"
echo "  4. Simuler erreur (commande invalide)"
echo "  5. Vérifier auto-repair"
```

### Utilisation Script

```bash
chmod +x scripts/validate-autofix.sh
./scripts/validate-autofix.sh
```

---

## Troubleshooting

### Problème 1: Hook ne s'initialise pas

**Symptôme** : `systemHealth` reste `null`

**Solutions** :
```typescript
// Vérifier que secureInvoke est importé
import { secureInvoke } from '@/lib/security';

// Vérifier console pour erreurs
useEffect(() => {
  console.log('[AutoFix] Initializing...');
}, []);
```

### Problème 2: Commandes non whitelists

**Symptôme** : Erreurs "Command X not in whitelist"

**Solution** :
```bash
# Ajouter à src/lib/security.ts
export const ALLOWED_COMMANDS = new Set<string>([
  // ... existing
  'get_system_health',
  'get_module_health',
  // ... etc
]);
```

### Problème 3: Auto-fix ne se déclenche pas

**Symptôme** : Erreurs détectées mais pas de réparation

**Solution** :
```typescript
// Forcer auto-repair manuel
const { autoRepair } = useSystemCenterAutoFix();
await autoRepair();

// Vérifier mapping existe
console.log(INVALID_COMMAND_ALTERNATIVES['ma_commande']);
```

### Problème 4: UX_FINAL vide

**Symptôme** : `uxOutput` est `null`

**Solution** :
```typescript
// Forcer génération UX
const { generateUX } = useSystemCenterAutoFix();
generateUX();

// Ou attendre détection erreurs
if (detectedErrors.length > 0) {
  generateUX();
}
```

---

## Monitoring Production

### Métriques à Surveiller

```typescript
// Dans composant
const {
  detectedErrors,
  fixHistory,
  systemHealth,
} = useSystemCenterAutoFix();

// Log métriques
useEffect(() => {
  if (detectedErrors.length > 0) {
    console.warn('[AutoFix] Erreurs détectées:', detectedErrors.length);
  }

  if (fixHistory.length > 0) {
    const successRate = fixHistory.filter(f => f.success).length / fixHistory.length;
    console.log('[AutoFix] Success rate:', successRate * 100, '%');
  }
}, [detectedErrors.length, fixHistory.length]);
```

### Dashboard Admin (optionnel)

Créer : `src/admin/AutoFixDashboard.tsx`

```typescript
export const AutoFixDashboard = () => {
  const { detectedErrors, fixHistory } = useSystemCenterAutoFix();

  const stats = {
    totalErrors: detectedErrors.length,
    fixedErrors: fixHistory.filter(f => f.success).length,
    successRate: fixHistory.length > 0 
      ? (fixHistory.filter(f => f.success).length / fixHistory.length) * 100 
      : 0,
  };

  return (
    <div className="autofix-dashboard">
      <h2>AutoFix Statistics</h2>
      <div className="stats-grid">
        <StatCard label="Erreurs détectées" value={stats.totalErrors} />
        <StatCard label="Réparations réussies" value={stats.fixedErrors} />
        <StatCard label="Taux de succès" value={`${stats.successRate.toFixed(1)}%`} />
      </div>
    </div>
  );
};
```

---

## Maintenance Future

### Ajout Nouvelle Catégorie d'Erreur

1. Ajouter type dans `ErrorCategory`
2. Ajouter détection dans `analyzeError()`
3. Ajouter handler dans `autoFix()`
4. Ajouter tests

### Extension Mappings Commandes

1. Identifier commande invalide récurrente
2. Ajouter dans `INVALID_COMMAND_ALTERNATIVES`
3. Tester fallback
4. Documenter

### Performance Optimization

1. Activer caching résultats :
```typescript
const resultCache = new Map<string, DiagnosticResult>();
```

2. Debounce auto-repair :
```typescript
const debouncedAutoRepair = debounce(autoRepair, 500);
```

3. Lazy load workflows :
```typescript
const workflows = await import('./workflows');
```

---

## Support

### Questions / Issues

- **Documentation** : `docs/SYSTEM_CENTER_AUTOFIX_ENGINE_v21.md`
- **GitHub Issues** : Tag `[AutoFix]`
- **Discord** : Canal `#system-center`

### Contact

- Email: support@titane.ai
- Discord: TITANE∞ Community

---

**Version** : v21.0.0  
**Date** : 9 décembre 2025  
**Status** : ✅ Tech-Ready (Dev) | **Production:** ⛔ EN ATTENTE (autorisation requise)  
**License** : TITANE_INFINITY Proprietary  

© 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
