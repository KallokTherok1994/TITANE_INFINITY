# 🧪 GUIDE DE TEST — COGNITIVE LAYOUT ENGINE v∞

**Date**: 2025-12-05
**Version**: TITANE∞ v27.0
**Objectif**: Valider l'intégration complète du système cognitif adaptatif

---

## 🚀 DÉMARRAGE

### Lancer l'application
```bash
cd /home/titane/Documents/TITANE_INFINITY
pnpm run tauri:dev
```

### Vérifications au démarrage
✅ Console: `🧠 [COGNITIVE] Starting Cognitive Layout Engine...`
✅ Badge visible en bas à droite (🧠 icon)
✅ Aucune erreur TypeScript
✅ Body attribute: `data-ui-mode="neutral"`

---

## 📋 TESTS FONCTIONNELS

### Test 1: Badge & Panneau de Contrôle

**Objectif**: Vérifier l'UI de contrôle

**Étapes**:
1. Cliquer sur le badge 🧠 en bas à droite
2. Vérifier ouverture du panneau
3. Observer les sections:
   - Mode actuel (avec icône)
   - Signaux cognitifs (⚡ Énergie, 🎯 Focus, 🧠 Charge)
   - Suggestions (si disponibles)
   - Sélecteur de mode manuel

**Résultat attendu**:
- Panneau s'ouvre sans erreur
- Signaux affichés avec valeurs réalistes (0.0-1.0)
- Mode actuel = "Neutre" (⚖️)

---

### Test 2: Changement Manuel de Mode

**Objectif**: Tester l'application manuelle des modes

**Étapes**:
1. Ouvrir panneau Cognitive Layout
2. Sélectionner **"Focus Profond"** (🎯)
3. Observer les changements UI:
   - Sidebar devient compacte
   - Panels secondaires masqués
   - Espacement augmenté
   - Animations désactivées
4. Vérifier `body[data-ui-mode="focus_deep"]` dans DevTools
5. Tester chaque mode:
   - 🔍 Exploration
   - 📊 Monitoring
   - 🔧 Maintenance
   - 🎓 Coaching
   - ⚖️ Neutre

**Résultat attendu**:
- Chaque mode applique sa configuration CSS
- Transitions fluides
- Préférence sauvegardée (localStorage)

---

### Test 3: Visualisation Temps Réel

**Objectif**: Tester le composant `<CognitiveVisualizer />`

**Étapes**:
1. Ouvrir panneau Cognitive Layout
2. Cliquer sur "Visualiser" (si disponible) ou ajouter composant:
   ```tsx
   import { CognitiveVisualizer } from '@/components/cognitive/CognitiveVisualizer';
   <CognitiveVisualizer />
   ```
3. Observer:
   - Jauges de signaux (⚡🎯🧠)
   - Graphique historique (10 minutes)
   - Contexte actuel (module, rôle, tâche)
   - Statistiques (changements mode, acceptance)

**Résultat attendu**:
- Jauges animées
- Graphique se remplit toutes les 10s
- Données cohérentes

---

### Test 4: Adaptation Automatique (Simulation)

**Objectif**: Tester la boucle OODA et suggestions

**Étapes**:
1. Ouvrir DevTools Console
2. Simuler fatigue:
   ```javascript
   const engine = window.cognitiveLayoutEngine ||
                  require('@/engines/cognitive/cognitiveLayoutEngine').cognitiveLayoutEngine;

   // Forcer signaux fatigue
   const state = engine.getState();
   state.signals.sessionDuration = 95; // > 90 min
   state.signals.energyLevel = 0.25;   // < 0.3
   state.signals.fatigueEstimated = true;
   ```
3. Attendre cycle OODA (30s) OU forcer:
   ```javascript
   engine.observe(); // Méthode privée, peut ne pas marcher
   ```
4. Observer notification suggestion

**Résultat attendu**:
- Notification apparaît: "💡 Suggestion: Mode Focus Deep recommandé"
- Boutons: "Accepter" / "Refuser"
- Si accepté → mode change
- Si refusé → `manualOverrides` incrémenté

---

### Test 5: Intégration Helios

**Objectif**: Vérifier connexion backend Helios

**Étapes**:
1. Ouvrir DevTools Console
2. Attendre 60s (cycle Helios)
3. Filtrer logs: `[CognitiveLayout] 🌅`
4. Observer:
   ```
   [CognitiveLayout] 🌅 Helios: energyScore=0.72, fatigue=false
   ```
5. Vérifier dans panneau: ⚡ Énergie reflète la valeur

**Résultat attendu**:
- Logs Helios visibles toutes les 60s
- Score énergie réaliste (basé CPU/RAM)
- Fallback temps-réel si API indisponible

---

### Test 6: Intégration Nexus

**Objectif**: Vérifier connexion backend Nexus

**Étapes**:
1. Ouvrir plusieurs modules (Chat, Dashboard, Diagnostics)
2. Observer logs Nexus toutes les 30s
3. Vérifier contexte dans visualiseur:
   - Module actuel détecté
   - Priority calculée (critical/important/normal)
4. Ouvrir module Diagnostics → état devrait passer à "debugging"

**Résultat attendu**:
- Logs Nexus: `[CognitiveLayout] 🔗 Nexus: priority=normal, state=exploring`
- Adaptation suggérée si priority=critical

---

### Test 7: Persistence Memory

**Objectif**: Tester sauvegarde préférences

**Étapes**:
1. Changer mode 3 fois (ex: Focus → Exploration → Monitoring)
2. Accepter 2 suggestions, refuser 1
3. Ouvrir DevTools → Application → Local Storage
4. Chercher clés:
   - `titane-cognitive-layout-preferences`
   - `titane-cognitive-layout-history`
5. Vérifier contenu JSON
6. Rafraîchir page (F5)
7. Vérifier préférences restaurées

**Résultat attendu**:
- Préférences sauvegardées:
  ```json
  {
    "favoriteModes": { "focus_deep": 1, "exploration": 1, ... },
    "acceptedSuggestions": 2,
    "manualOverrides": 1,
    "savedAt": 1733396400000
  }
  ```
- Historique restauré après reload

---

### Test 8: Contexte Module (Chat OMEGA)

**Objectif**: Tester détection automatique contexte

**Étapes**:
1. Naviguer vers `/chat`
2. Ouvrir panneau Cognitive Layout
3. Observer "Module: Chat OMEGA"
4. Taper message long (> 200 chars) → taskType devrait être "writing"
5. Envoyer message → taskType passe à "execution"
6. Vérifier suggestion adaptée au contexte

**Résultat attendu**:
- Contexte mis à jour automatiquement
- Suggestions pertinentes (writing → focus_deep)

---

### Test 9: CSS Variables Dynamiques

**Objectif**: Vérifier injection CSS

**Étapes**:
1. Activer mode Focus Deep
2. Ouvrir DevTools → Inspect `<html>` ou `<body>`
3. Vérifier CSS variables:
   ```css
   --ui-whitespace: 0.8;
   --ui-font-scale: 1.1;
   --ui-contrast: 0.7;
   --ui-accent-colors: 0.3;
   ```
4. Changer pour Monitoring
5. Vérifier nouvelles valeurs:
   ```css
   --ui-whitespace: 0.2;
   --ui-font-scale: 0.9;
   --ui-contrast: 1.0;
   ```

**Résultat attendu**:
- Variables injectées dans `:root`
- Composants React utilisent variables
- Transitions fluides

---

### Test 10: Analytics & Debug

**Objectif**: Tester outils de monitoring

**Étapes**:
1. Console:
   ```javascript
   const engine = cognitiveLayoutEngine;
   engine.debugInfo();
   ```
2. Observer output:
   ```
   🧠 [CognitiveLayout] Debug Info
     Current Mode: focus_deep
     Context: { currentModule: "Chat OMEGA", ... }
     Signals: { energyLevel: 0.72, ... }
     Preferences: { favoriteModes: {...}, ... }
     Analytics: { totalModeChanges: 5, acceptanceRate: "66.7%", ... }
   ```
3. Vérifier analytics:
   ```javascript
   const analytics = engine.getAnalytics();
   console.log(analytics);
   ```

**Résultat attendu**:
- Debug info complètes
- Métriques précises
- Acceptance rate calculé correctement

---

## 🎯 CRITÈRES DE VALIDATION

### Fonctionnalités Core ✅

- [ ] Badge visible et cliquable
- [ ] Panneau de contrôle fonctionnel
- [ ] 6 modes applicables manuellement
- [ ] CSS adaptatif appliqué
- [ ] Body attribute `data-ui-mode` correct

### Intégrations Backend ✅

- [ ] Helios: logs toutes les 60s
- [ ] Nexus: logs toutes les 30s
- [ ] Memory: persistence localStorage
- [ ] Fallbacks gracieux si APIs down

### Adaptation Automatique ✅

- [ ] Boucle OODA fonctionne (30s)
- [ ] Suggestions émises (confiance < 70%)
- [ ] Auto-apply (confiance > 70%)
- [ ] Apprentissage préférences
- [ ] Respect refus utilisateur

### Performance ✅

- [ ] Pas de lag interface
- [ ] Mémoire stable (< 5MB)
- [ ] CPU minimal (< 2%)
- [ ] Pas de fuites mémoire

### UX ✅

- [ ] Transitions fluides
- [ ] Notifications claires
- [ ] Feedback immédiat
- [ ] Pas de faux positifs excessifs

---

## 🐛 DEBUGGING COURANT

### Problème 1: Badge non visible

**Causes possibles**:
- CSS non chargé
- Composant non monté
- Z-index conflit

**Solution**:
```typescript
// Vérifier dans App.tsx
<CognitiveLayoutControl /> // Doit être présent

// Vérifier CSS chargé
import './components/cognitive/CognitiveLayoutControl.css';
```

---

### Problème 2: Mode ne change pas

**Causes possibles**:
- `applyMode()` échoue
- CSS variables non injectées
- Conflit avec autre système

**Solution**:
```javascript
// DevTools Console
const engine = cognitiveLayoutEngine;
engine.applyMode('focus_deep', 'manual');
console.log(document.body.getAttribute('data-ui-mode'));
```

---

### Problème 3: Helios/Nexus non connectés

**Causes possibles**:
- API backend indisponible
- `secureInvoke()` échoue
- Permissions manquantes

**Solution**:
```javascript
// Tester API directement
import { secureInvoke } from '@/lib/security';
const helios = await secureInvoke('get_helios_state');
console.log(helios);

// Si null → API down → fallback actif (normal)
```

---

### Problème 4: Suggestions spam

**Causes possibles**:
- Seuil confiance trop bas (< 70%)
- Règles trop sensibles
- Pas de cooldown

**Solution**:
```typescript
// Ajuster dans cognitiveLayoutEngine.ts
private adaptationThreshold = 0.75; // Au lieu de 0.7

// Ou désactiver temporairement
engine.disableAdaptation();
```

---

## 📊 MÉTRIQUES À COLLECTER

### Session Test (1h)

| Métrique | Valeur Cible |
|----------|--------------|
| Mode changes | 3-8 |
| Suggestions émises | 2-5 |
| Acceptance rate | > 60% |
| False positives | < 2 |
| Performance impact | < 5% CPU |

### Exemple Rapport
```
Session: 2025-12-05 10:00-11:00
Modules: Dashboard (20min), Chat (30min), Diagnostics (10min)

Modes utilisés:
- Neutral: 20min (33%)
- Focus Deep: 25min (42%)
- Exploration: 15min (25%)

Adaptations:
- Suggestions: 4 (3 acceptées, 1 refusée)
- Auto-apply: 1 (fatigue détectée)
- Acceptance rate: 75%

Signaux moyens:
- Énergie: 0.68
- Focus: 0.74
- Charge: 0.42
```

---

## ✅ CHECKLIST FINALE

### Avant Production
- [ ] Tous les tests passent
- [ ] Acceptance rate > 60% sur 10 sessions
- [ ] Aucune erreur console
- [ ] Performance validée (Lighthouse)
- [ ] Documentation utilisateur écrite
- [ ] Vidéo démo enregistrée

### Post-Déploiement
- [ ] Monitoring actif (Sentry/LogRocket)
- [ ] Analytics configurées (Mixpanel/Amplitude)
- [ ] Feedback utilisateur collecté
- [ ] Hotfixes déployés si nécessaire
- [ ] ML training data collectée (1000+ adaptations)

---

## 🎓 GUIDE UTILISATEUR

### Pour Kevin (Quick Start)

**Activer le système**:
- Le badge 🧠 apparaît automatiquement en bas à droite
- Cliquer pour voir l'état cognitif actuel

**Utilisation quotidienne**:
1. **Mode Focus** → Pour écriture longue, livres, modèles
2. **Mode Exploration** → Pour navigation, découverte modules
3. **Mode Monitoring** → Pour surveillance systèmes, métriques
4. **Mode Maintenance** → Pour debug, configuration technique
5. **Mode Coaching** → Pour préparation séances, protocoles

**Suggestions automatiques**:
- Notification apparaît si adaptation recommandée
- "Accepter" → applique le mode suggéré
- "Refuser" → système apprend et évite suggestion future
- Après 3-5 acceptations, système applique automatiquement

**Visualisation**:
- Cliquer "Visualiser" dans panneau
- Jauges temps réel: ⚡ Énergie, 🎯 Focus, 🧠 Charge
- Graphique historique: évolution dernières 10 minutes
- Alertes: fatigue détectée, blocage identifié

---

**Guide créé**: 2025-12-05
**Version**: TITANE∞ v27.0
**Auteur**: GitHub Copilot (Claude Sonnet 4.5)
**Statut**: ✅ Ready for Testing
