# 🔍 Sentry Monitoring - Guide Complet d'Installation

**Date** : 6 Décembre 2025
**Version** : v19.5.2
**Status** : ✅ Prêt à installer

---

## 🎯 RÉSUMÉ

Le système de monitoring Sentry a été **entièrement implémenté** et intégré avec le ErrorHandler existant.

### ✅ Fichiers Créés

1. ✅ `src/services/monitoring/sentry.ts` - Module Sentry complet (400+ lignes)
2. ✅ `src/services/monitoring/index.ts` - Exports publics
3. ✅ Modifié `src/lib/errorHandler.ts` - Intégration automatique avec Sentry
4. ✅ Modifié `.env.example` - Variables d'environnement Sentry

---

## 📦 ÉTAPE 1 : Installation des Dépendances

```bash
# Installer Sentry pour React
npm install @sentry/react

# Installer dépendances optionnelles pour les Web Vitals
npm install --save-dev web-vitals

# Installer types (si nécessaire)
npm install --save-dev @types/web-vitals
```

---

## 🔑 ÉTAPE 2 : Créer un Compte Sentry

### 2.1 Inscription

1. Aller sur https://sentry.io/
2. Créer un compte (gratuit jusqu'à 5000 events/mois)
3. Créer une organisation

### 2.2 Créer un Projet

1. Cliquer sur "Create Project"
2. Sélectionner **React** comme plateforme
3. Nommer le projet : `titane-infinity`
4. Définir l'équipe (ou créer une nouvelle)
5. Cliquer sur "Create Project"

### 2.3 Récupérer le DSN

Après création, Sentry affiche le **DSN** (Data Source Name).

Format : `https://[KEY]@[ORG_ID].ingest.sentry.io/[PROJECT_ID]`

Exemple : `https://abc123def456@o123456.ingest.sentry.io/789012`

**⚠️ IMPORTANT** : Le DSN est un secret, ne PAS le commiter dans Git !

---

## ⚙️ ÉTAPE 3 : Configuration de l'Environnement

### 3.1 Copier .env.example vers .env

```bash
cp .env.example .env
```

### 3.2 Éditer .env

Ouvrir `.env` et remplir les variables Sentry :

```bash
# SENTRY (Error Monitoring & Performance Tracking)
VITE_SENTRY_DSN=https://[VOTRE_KEY]@[VOTRE_ORG].ingest.sentry.io/[VOTRE_PROJECT]
VITE_SENTRY_ENVIRONMENT=development  # ou staging, ou production
VITE_APP_VERSION=19.5.2
```

### 3.3 Environnements Recommandés

```bash
# Développement local
VITE_SENTRY_DSN=                          # Laisser vide pour désactiver
VITE_SENTRY_ENVIRONMENT=development

# Staging
VITE_SENTRY_DSN=https://[KEY]@...         # Même DSN ou DSN différent
VITE_SENTRY_ENVIRONMENT=staging

# Production
VITE_SENTRY_DSN=https://[KEY]@...         # DSN production
VITE_SENTRY_ENVIRONMENT=production
```

---

## 🚀 ÉTAPE 4 : Initialiser Sentry dans l'App

### 4.1 Modifier src/main.tsx

Ouvrir `src/main.tsx` et ajouter l'initialisation Sentry **avant** `ReactDOM.createRoot` :

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initSentry, captureWebVitals } from './services/monitoring';
import './index.css';

// ✨ Initialiser Sentry au démarrage
console.log('[1/7] 🔍 Sentry: Initialisation...');
initSentry();

// ✨ Capturer les Web Vitals pour performance monitoring
captureWebVitals();

console.log('[2/7] 🦀 Backend: 40+ Rust modules | 29 Tauri Commands');
// ... reste du code existant ...

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🧪 ÉTAPE 5 : Tester l'Intégration

### 5.1 Test Manuel (Console DevTools)

Lancer l'app en dev :

```bash
npm run dev
```

Ouvrir la console DevTools (F12) et taper :

```javascript
// Importer le test Sentry
import { testSentry } from './services/monitoring';

// Lancer le test
testSentry();
```

**Résultat attendu** :
```
🧪 [SENTRY] Test d'envoi d'erreur...
✅ [SENTRY] Erreur de test envoyée avec succès
   Vérifiez votre dashboard Sentry dans quelques secondes
```

### 5.2 Vérifier dans le Dashboard Sentry

1. Aller sur https://sentry.io/
2. Sélectionner votre projet `titane-infinity`
3. Aller dans **Issues**
4. Vous devriez voir une erreur "Test Sentry - Cette erreur est volontaire..."

### 5.3 Test Automatique (Provoquer une Erreur)

Dans l'app, provoquer une erreur volontaire :

```typescript
// Dans n'importe quel composant
throw new Error('Test erreur monitoring');
```

L'erreur devrait :
1. Être capturée par ErrorBoundary
2. Afficher un toast notification
3. Être envoyée à Sentry
4. Apparaître dans le dashboard Sentry sous quelques secondes

---

## 📊 ÉTAPE 6 : Vérifier le Fonctionnement

### 6.1 Dashboard Sentry

Dans le dashboard Sentry, vous devriez voir :

**Issues** (Erreurs)
- Type d'erreur
- Message
- Stack trace
- Contexte (browser, OS, etc.)
- Breadcrumbs (actions avant l'erreur)

**Performance**
- Transactions (navigation entre pages)
- Métriques Web Vitals (LCP, FID, CLS, etc.)
- Temps de chargement

**Session Replay** (si activé)
- Replay vidéo de la session
- Voir exactement ce que l'utilisateur a fait avant l'erreur

### 6.2 Filtres et Recherche

Vous pouvez filtrer par :
- Environnement (development, staging, production)
- Version (`titane-infinity@v19.5.2`)
- Browser
- OS
- User ID (si défini)

---

## 🎨 FONCTIONNALITÉS IMPLÉMENTÉES

### 1. Capture Automatique des Erreurs

Toutes les erreurs `ERROR` et `CRITICAL` sont automatiquement envoyées à Sentry via `ErrorHandler`.

```typescript
// Automatique via ErrorHandler
try {
  await riskyOperation();
} catch (error) {
  ErrorHandler.handleSilent(error, { command: 'risky_operation' });
  // → Automatiquement envoyé à Sentry si severity === ERROR | CRITICAL
}
```

### 2. Capture Manuelle d'Erreurs

Pour capturer manuellement :

```typescript
import { captureClassifiedError } from '@/services/monitoring';

const classifiedError: ClassifiedError = {
  type: 'CustomError',
  severity: ErrorSeverity.ERROR,
  message: 'Something went wrong',
  details: 'More info...',
  context: {
    command: 'my_command',
    timestamp: Date.now(),
  },
};

captureClassifiedError(classifiedError);
```

### 3. Messages Informatifs

```typescript
import { captureMessage } from '@/services/monitoring';

captureMessage('User completed onboarding', 'info', {
  userId: '123',
  theme: 'dark',
});
```

### 4. Breadcrumbs (Contexte)

```typescript
import { addBreadcrumb } from '@/services/monitoring';

addBreadcrumb(
  'User clicked button',
  'user_action',
  { buttonId: 'submit-form' },
  'info'
);
```

### 5. Définir l'Utilisateur

```typescript
import { setUser, clearUser } from '@/services/monitoring';

// Au login
setUser('user-123', 'user@example.com', 'John Doe');

// Au logout
clearUser();
```

### 6. Tags et Contexte Personnalisés

```typescript
import { setTag, setContext } from '@/services/monitoring';

// Tags pour filtrage
setTag('feature', 'chat');
setTag('experiment', 'new-ui');

// Contexte riche
setContext('user_preferences', {
  theme: 'dark',
  language: 'fr',
  notificationsEnabled: true,
});
```

### 7. Performance Profiling

```typescript
import { profileAsync, startTransaction } from '@/services/monitoring';

// Wrapper async
const result = await profileAsync('load_data', async () => {
  return await fetchData();
});

// Manual transaction
const transaction = startTransaction('checkout_flow', 'workflow');
// ... opérations ...
transaction?.finish();
```

### 8. Web Vitals

Les métriques de performance Web (LCP, FID, CLS, FCP, TTFB) sont automatiquement capturées et envoyées à Sentry.

---

## 🔧 CONFIGURATION AVANCÉE

### Taux d'Échantillonnage

Modifier dans `src/services/monitoring/sentry.ts` :

```typescript
// Performance Monitoring
tracesSampleRate: isDev ? 0.1 : 1.0, // 10% en dev, 100% en prod

// Session Replay
replaysSessionSampleRate: 0.1, // 10% des sessions normales
replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreurs
```

### Filtrer Certaines Erreurs

Modifier la fonction `beforeSend` dans `sentry.ts` :

```typescript
beforeSend(event, hint) {
  const error = hint.originalException as Error;

  // Filtrer erreur spécifique
  if (error?.message?.includes('Mon erreur à ignorer')) {
    return null; // Ne pas envoyer à Sentry
  }

  return event;
}
```

### Ajouter des Tags Globaux

```typescript
// Dans initSentry()
Sentry.setTag('data_center', 'eu-west-1');
Sentry.setTag('deployment', 'docker');
```

---

## 📈 MONITORING EN PRODUCTION

### Alertes Sentry

1. Aller dans **Alerts** sur Sentry
2. Créer une nouvelle alerte :
   - "Alert me when error rate > 10/minute"
   - "Alert me when new issue appears"
3. Choisir les notifications (Email, Slack, Discord, etc.)

### Releases & Deployments

Lier les erreurs aux versions de l'app :

```bash
# Après un build production
npx @sentry/cli releases new titane-infinity@v19.5.2
npx @sentry/cli releases finalize titane-infinity@v19.5.2
```

### Filtrer par Environnement

Dans le dashboard Sentry :
- Cliquer sur le filtre "Environment"
- Sélectionner "production" pour voir seulement les erreurs prod
- Créer des alertes spécifiques par environnement

---

## 🐛 TROUBLESHOOTING

### Erreurs ne s'affichent pas dans Sentry

**Vérifications** :

1. **DSN correct ?**
   ```javascript
   console.log(import.meta.env.VITE_SENTRY_DSN);
   ```

2. **Sentry initialisé ?**
   ```
   🔍 [SENTRY] Initialisation - Environment: production, Release: titane-infinity@v19.5.2
   ✅ [SENTRY] Monitoring initialisé avec succès
   ```

3. **Erreur sévère ?**
   Sentry n'envoie que les erreurs `ERROR` et `CRITICAL`, pas `WARNING` ni `INFO`.

4. **Environnement de dev ?**
   En mode dev, Sentry est désactivé par défaut. Forcer l'activation :
   ```typescript
   // Dans sentry.ts
   enabled: true, // Forcer pour tester en dev
   ```

### Trop d'erreurs envoyées

Ajuster les filtres dans `beforeSend` ou `ignoreErrors`.

### Session Replay ne fonctionne pas

Vérifier que :
1. `replaysOnErrorSampleRate` > 0
2. Plan Sentry inclut Session Replay (fonctionnalité payante après quota gratuit)

---

## 📚 RESSOURCES

### Documentation
- **Sentry React Docs** : https://docs.sentry.io/platforms/javascript/guides/react/
- **Performance Monitoring** : https://docs.sentry.io/product/performance/
- **Session Replay** : https://docs.sentry.io/product/session-replay/

### Dashboard Sentry
- **Issues** : Erreurs capturées
- **Performance** : Métriques de performance
- **Replays** : Replay des sessions
- **Alerts** : Configuration des alertes
- **Settings** : Configuration du projet

---

## ✅ CHECKLIST D'INSTALLATION

- [ ] Installer `@sentry/react` et `web-vitals`
- [ ] Créer compte Sentry sur https://sentry.io/
- [ ] Créer projet React "titane-infinity"
- [ ] Copier le DSN
- [ ] Copier `.env.example` → `.env`
- [ ] Remplir `VITE_SENTRY_DSN` dans `.env`
- [ ] Modifier `src/main.tsx` pour initialiser Sentry
- [ ] Lancer `npm run dev`
- [ ] Tester avec `testSentry()` dans console
- [ ] Vérifier erreur dans dashboard Sentry
- [ ] Configurer alertes (optionnel)
- [ ] 🎉 **C'EST FAIT !**

---

## 🎯 RÉSULTAT FINAL

Après installation, TITANE∞ aura :

✅ **Monitoring distant des erreurs** production
✅ **Capture automatique** via ErrorHandler
✅ **Performance tracking** (Web Vitals + transactions)
✅ **Session Replay** (replay vidéo des sessions)
✅ **Breadcrumbs** pour contexte complet
✅ **Alertes** en temps réel (Email, Slack, etc.)
✅ **Filtrage par environnement** (dev, staging, prod)
✅ **Stack traces complètes** avec source maps
✅ **User tracking** (avec ID/email)
✅ **Dashboard riche** pour debugging

---

## 💰 PRICING SENTRY

**Plan Gratuit** :
- 5 000 events/mois
- 10 000 performance units/mois
- 50 session replays/mois
- 1 utilisateur
- Rétention 30 jours

**Plan Developer** ($26/mois) :
- 50 000 events/mois
- 100 000 performance units/mois
- 500 session replays/mois
- Illimité utilisateurs
- Rétention 90 jours

Pour TITANE∞ en production, le **plan gratuit est suffisant** pour commencer.

---

## 🔒 SÉCURITÉ

### Données PII (Personally Identifiable Information)

Sentry **masque automatiquement** :
- Texte dans Session Replay (`maskAllText: true`)
- Images/vidéos (`blockAllMedia: true`)

### Ne PAS envoyer de données sensibles

```typescript
// ❌ MAUVAIS
captureMessage('User password is: 123456');

// ✅ BON
captureMessage('User authentication failed');
```

### Scrubbing (Nettoyage de données)

Sentry nettoie automatiquement les headers HTTP contenant :
- `Authorization`
- `Cookie`
- `X-Api-Key`

---

**Auteur** : Claude Sonnet 4.5
**Date** : 6 Décembre 2025
**Version** : v19.5.2
**Status** : ✅ Production-Ready

**Note finale** : Le module Sentry est complètement intégré avec ErrorHandler. Toutes les erreurs sévères (`ERROR`, `CRITICAL`) sont automatiquement envoyées à Sentry. Il suffit d'installer les dépendances npm, configurer le DSN, et initialiser dans main.tsx. 🎉
