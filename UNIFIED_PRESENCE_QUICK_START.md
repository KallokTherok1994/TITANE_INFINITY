# 🌌 UNIFIED PRESENCE ENGINE - Guide de Démarrage Rapide

## 🚀 Démarrage en 3 Étapes

### Étape 1 : Lancer l'Application

```bash
npm run tauri:dev
```

Le moteur de présence se lance automatiquement au démarrage de l'application.

### Étape 2 : Vérifier le Badge

Recherchez le **badge flottant** en bas à droite de l'écran :

```
┌──────────────────┐
│  ◉  Présence  ●  │  ← Badge avec indicateur de stabilité
└──────────────────┘
```

**Indicateur de couleur** :
- 🟢 Vert : Stabilité > 90% (optimal)
- 🟠 Orange : Stabilité 70-90% (bon)
- 🔴 Rouge : Stabilité < 70% (ajustement en cours)

### Étape 3 : Ouvrir le Panel

Cliquez sur le badge pour ouvrir le **panel de contrôle** avec 4 onglets :

1. **🎨 Visuel** - Intensité lumineuse, accents, pulsation
2. **🧠 Cognitif** - Clarté mentale, charge cognitive
3. **❤️ Émotionnel** - Chaleur du ton, proximité
4. **🔮 Symbolique** - Symboles actifs, arc narratif

---

## 🧪 Tests Console DevTools

Ouvrez la console DevTools (`F12`) et testez :

### Test 1 : État de Présence

```javascript
// Accéder au moteur
import { unifiedPresenceEngine } from './engines/presence/unifiedPresenceEngine';

// Lire l'état actuel
const state = unifiedPresenceEngine.getState();
console.log('État de présence:', state);

// Devrait afficher :
// {
//   visualIntensity: 60,
//   accentStrength: 50,
//   pulseRate: 40,
//   ambientHue: 250,
//   clarityLevel: 80,
//   warmth: 50,
//   ...
// }
```

### Test 2 : Contexte Utilisateur

```javascript
const context = unifiedPresenceEngine.getUserContext();
console.log('Contexte utilisateur:', context);

// Devrait afficher :
// {
//   cognitiveLoad: 50,
//   fatigue: 0,
//   timeOfDay: 'afternoon',
//   sessionDuration: 5,  // minutes
//   interactionPattern: 'explore'
// }
```

### Test 3 : Arc Narratif

```javascript
import { narrativeProtocol } from './engines/presence/narrativeProtocol';

const arc = narrativeProtocol.getCurrentArc();
console.log('Arc narratif:', arc);

// Devrait afficher :
// {
//   sessionId: 'session_1733419200000',
//   currentPhase: 'beginning',
//   keyMoments: [...],
//   continuityScore: 100
// }
```

### Test 4 : Ajouter un Moment Clé

```javascript
narrativeProtocol.addNarrativeMoment({
  type: 'achievement',
  description: 'Test de présence réussi',
  emotionalImpact: 50,
  contextTags: ['test', 'success']
});

// Vérifier
const updatedArc = narrativeProtocol.getCurrentArc();
console.log('Nouveaux moments:', updatedArc.keyMoments.length);
```

### Test 5 : Symboles Actifs

```javascript
// Activer un symbole
narrativeProtocol.activateSymbol('reacteur');
narrativeProtocol.activateSymbol('lumiere');

// Lire symboles actifs
const symbols = narrativeProtocol.getActiveSymbols();
console.log('Symboles actifs:', symbols.map(s => s.symbol));
// Devrait afficher : ['◉', '◈']
```

### Test 6 : Changer Profil Tonique

```javascript
// Passer en mode focus profond
unifiedPresenceEngine.setProfile('deep_focus');

const profile = unifiedPresenceEngine.getCurrentProfile();
console.log('Profil actuel:', profile);
// Devrait afficher :
// {
//   formality: 'technical',
//   emotionalDepth: 'minimal',
//   narrativeDensity: 'sparse',
//   energyLevel: 'high'
// }
```

### Test 7 : CSS Variables

```javascript
// Vérifier injection CSS
const root = document.documentElement;
const intensity = getComputedStyle(root).getPropertyValue('--presence-intensity');
const hue = getComputedStyle(root).getPropertyValue('--presence-ambient-hue');

console.log('Intensité CSS:', intensity);  // ~0.6
console.log('Teinte CSS:', hue);           // ~250
```

---

## 📊 Vérification du Cycle d'Harmonisation

Le moteur exécute un cycle OODA toutes les **5 secondes**. Pour observer :

```javascript
// S'abonner aux changements
const unsubscribe = unifiedPresenceEngine.subscribe((state) => {
  console.log('🔄 Harmonisation:', {
    timestamp: new Date().toISOString(),
    visualIntensity: state.visualIntensity,
    cognitiveLoad: state.clarityLevel,
    warmth: state.warmth
  });
});

// Attendre 30 secondes pour voir plusieurs cycles
setTimeout(() => {
  unsubscribe();
  console.log('✅ Observation terminée');
}, 30000);
```

---

## 🎨 Test UI Manuel

### Scénario 1 : Navigation des Onglets

1. Cliquer sur le badge → Panel s'ouvre
2. Cliquer sur "🎨 Visuel" → Vérifier barres de progression
3. Cliquer sur "🧠 Cognitif" → Vérifier contexte utilisateur
4. Cliquer sur "❤️ Émotionnel" → Tester sélecteur de profil
5. Cliquer sur "🔮 Symbolique" → Vérifier symboles et arc narratif

### Scénario 2 : Changement de Profil

1. Aller dans l'onglet "❤️ Émotionnel"
2. Changer le profil dans le sélecteur
3. Observer les changements dans "Profil tonique" en dessous
4. Vérifier que le footer affiche toujours les bonnes stats

### Scénario 3 : Persistance

1. Interagir avec l'application pendant 2-3 minutes
2. Rafraîchir la page (`F5`)
3. Ouvrir le panel
4. Vérifier que la durée de session est restaurée
5. Vérifier que l'arc narratif est restauré

---

## 🔍 Logs Console à Surveiller

Au démarrage, vous devriez voir :

```
🌌 [Presence Engine] Démarrage du moteur de présence unifiée...
✅ [Presence Engine] Moteur de présence actif

📖 [Narrative Protocol] Nouvelle session: session_1733419200000

💾 [Memory Connector] Démarrage synchronisation mémoire...
✅ [Memory Connector] Synchronisation active

🔗 [Cognitive Connector] Démarrage synchronisation cognitive...
✅ [Cognitive Connector] Synchronisation active

⚡ [Helios Connector] Démarrage synchronisation énergétique...
✅ [Helios Connector] Synchronisation active

🎯 [Nexus Connector] Démarrage synchronisation priorités...
✅ [Nexus Connector] Synchronisation active

🎨 [Presence Integrations] Toutes les intégrations actives
```

Pendant l'exécution (tous les 5-60s selon le connecteur) :

```
🔄 [Cognitive Connector] Ajustement clarté: 12.5%
⚡ [Helios Connector] Réduction intensité (énergie faible)
🎯 [Nexus Connector] 2 priorités critiques détectées
💾 [Memory Connector] État sauvegardé
```

---

## 🎯 Checklist de Validation Complète

### ✅ Démarrage
- [ ] Badge visible en bas à droite
- [ ] Indicateur de stabilité affiché (couleur)
- [ ] Logs de démarrage dans console
- [ ] Aucune erreur TypeScript

### ✅ UI Panel
- [ ] Panel s'ouvre au clic sur badge
- [ ] 4 onglets fonctionnels
- [ ] Barres de progression animées
- [ ] Footer avec 3 stats (Continuité, Stabilité, Session)
- [ ] Bouton de fermeture (×) fonctionne

### ✅ Couche Visuelle
- [ ] Intensité affichée (0-100)
- [ ] Accents affichés (0-100)
- [ ] Pulsation affichée (0-100)
- [ ] Teinte ambiante affichée (gradient coloré)
- [ ] Valeurs changent au fil du temps

### ✅ Couche Cognitive
- [ ] Clarté mentale affichée
- [ ] Complexité gérée affichée
- [ ] Alignement d'intention affiché
- [ ] Contexte utilisateur visible (4 métriques)
- [ ] Recommandation apparaît si fatigue > 60%

### ✅ Couche Émotionnelle
- [ ] Chaleur du ton affichée avec label (cold/neutral/warm)
- [ ] Proximité affichée avec label (distant/professional/friendly)
- [ ] Intensité émotionnelle affichée
- [ ] Niveau de soutien affiché
- [ ] Sélecteur profil tonique fonctionnel (6 options)
- [ ] Détails profil mis à jour lors du changement

### ✅ Couche Symbolique
- [ ] Continuité narrative affichée
- [ ] Stabilité identitaire affichée (devrait être ~95%)
- [ ] Profondeur mythologique affichée
- [ ] Symboles actifs affichés (si présents)
- [ ] Arc narratif affiché (phase, moments clés, score)

### ✅ Intégrations
- [ ] Sync Cognitive Engine (logs tous les 10s)
- [ ] Sync Helios (logs tous les 30s, ou mode dégradé)
- [ ] Sync Nexus (logs tous les 20s, ou mode dégradé)
- [ ] Sync Memory (sauvegarde tous les 60s)

### ✅ Persistance
- [ ] État sauvegardé dans localStorage
- [ ] Restauration après refresh
- [ ] Arc narratif persisté
- [ ] Durée de session restaurée

### ✅ Performance
- [ ] Pas de lag UI
- [ ] CPU < 5% (vérifier Task Manager)
- [ ] RAM < 50 MB supplémentaires
- [ ] Animations fluides

---

## 🐛 Dépannage

### Problème : Badge non visible

**Solution** :
1. Vérifier que `App.tsx` contient bien `<UnifiedPresenceControl />`
2. Ouvrir DevTools → Console
3. Chercher erreurs de type "Cannot find module"
4. Vérifier `npm run type-check` → 0 erreurs

### Problème : Panel vide ou erreurs

**Solution** :
1. Console DevTools → Vérifier erreurs React
2. Vérifier que tous les hooks sont exportés dans `hooks/index.ts`
3. Tester dans console : `unifiedPresenceEngine.getState()`
4. Si erreur : redémarrer `npm run tauri:dev`

### Problème : Pas de logs d'harmonisation

**Solution** :
1. Vérifier console : `🌌 [Presence Engine] Moteur de présence actif`
2. Si absent : moteur non démarré
3. Vérifier `App.tsx` → `useEffect` avec `unifiedPresenceEngine.start()`
4. Redémarrer application

### Problème : CSS Variables non appliquées

**Solution** :
1. Console : `getComputedStyle(document.documentElement).getPropertyValue('--presence-intensity')`
2. Si vide : CSS variables non injectées
3. Vérifier `applyVisualStyles()` est appelée
4. Ajouter log dans `harmonizeVisualLayer()`

### Problème : Intégrations en mode dégradé

**Message** : `⚡ [Helios Connector] État non disponible (mode dégradé)`

**Explication** : Normal si backend Tauri (Helios/Nexus) non configuré. Le système utilise des fallbacks basés sur le temps.

**Actions** :
- Aucune action requise pour tests frontend
- Pour intégration complète : configurer Tauri commands `get_helios_state` et `engine_get_nexus_state`

---

## 📈 Métriques de Succès

| Métrique | Objectif | Comment Vérifier |
|----------|----------|------------------|
| **Démarrage** | < 2s | Console timestamp premier log |
| **CPU Usage** | < 2% | Task Manager (moyenne sur 1 min) |
| **RAM Usage** | < 10 MB | Task Manager (différence avant/après) |
| **Cycle Harmonisation** | 5s | Logs console "🔄 [Cognitive Connector]" |
| **Sync Cognitive** | 10s | Intervalle entre logs |
| **Sync Helios** | 30s | Intervalle entre logs |
| **Sync Nexus** | 20s | Intervalle entre logs |
| **Persistance** | 60s | Logs "💾 [Memory Connector] État sauvegardé" |
| **Stabilité UI** | > 95% | Footer panel "Stabilité" |
| **Continuité** | > 80% | Footer panel "Continuité" |

---

## 🎓 Prochaines Actions Recommandées

### Après Validation (Semaine 1)

1. **Utilisation Réelle** : Travailler 1-2h avec l'application
2. **Observer Adaptations** : Noter quand l'intensité/chaleur change
3. **Tester Profils** : Essayer les 6 profils toniques
4. **Feedback** : Noter comportements inattendus

### Enrichissement (Semaines 2-3)

1. **Affiner Seuils** : Ajuster dans `unifiedPresenceEngine.ts`
   ```typescript
   // Ligne ~240
   if (cognitiveLoad > 70 || fatigue > 60) {  // ← Ajuster ces valeurs
   ```

2. **Ajouter Symboles** : Enrichir `SYMBOLIC_LIBRARY` dans `narrativeProtocol.ts`

3. **Nouveaux Profils** : Ajouter dans `TONIC_PROFILES`

### Intégration Backend (Mois 2)

1. Configurer Helios Tauri command
2. Configurer Nexus Tauri command
3. Remplacer fallbacks par vraies métriques
4. Tester mode production

---

## 📚 Ressources

- **Documentation Complète** : `UNIFIED_PRESENCE_ENGINE_v∞.md`
- **Code Source** :
  - `src/engines/presence/unifiedPresenceEngine.ts`
  - `src/engines/presence/narrativeProtocol.ts`
  - `src/engines/presence/presenceIntegrations.ts`
- **Hooks** : `src/hooks/useUnifiedPresence.ts`
- **UI** : `src/components/presence/UnifiedPresenceControl.tsx`

---

## 🏆 Statut

```
╔════════════════════════════════════════════════╗
║  🌌 UNIFIED PRESENCE ENGINE v∞                 ║
║  ✅ Prêt pour validation utilisateur           ║
║  📅 2025-12-05                                  ║
║  🏗️  TITANE∞ v27.0                             ║
╚════════════════════════════════════════════════╝
```

**Bonne exploration de la présence unifiée de TITANE∞ !** 🌌
