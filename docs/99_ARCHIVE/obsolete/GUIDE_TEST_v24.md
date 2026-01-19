# 🚀 GUIDE DE TEST - Living Engines v24

## 🎯 Démarrage Rapide

### 1. Installer les dépendances (si nécessaire)
```bash
cd /home/titane/Documents/TITANE_INFINITY
pnpm install
```

### 2. Lancer l'application
```bash
pnpm run dev
```

### 3. Ouvrir dans navigateur
```
http://localhost:5173
```

### 4. Naviguer vers DevTools
Cliquer sur **"🔧 DevTools"** dans la sidebar

---

## ✅ Ce que vous devriez voir

### Console Browser (F12)
```
🌟 TITANE∞ v24 - Persona Engine Initialized
🎭 Persona: clair
⚡ Glow: 1.15
🧠 Cognitive Load: 0.60
[DEBUG] System tick at 11:30:45 | Mood: clair
[DEBUG] System tick at 11:30:50 | Mood: clair
...
```

### Page DevTools
1. **Carte "🌟 Living Engines v21-v24"** avec :
   - Section Persona Engine (mood, temperament, présence, posture)
   - Section Visual Engines (glow, motion, depth, sound avec barres)
   - Section Cognitive Engines (cognitive load, rhythm score)
   - Section Holography Engines (status, particles)

2. **Glow animé** sur la carte (pulse toutes les 3 secondes)

3. **Barres de progression animées** qui se mettent à jour en temps réel

4. **Logs système** avec mood affiché : `[DEBUG] System tick at XX:XX:XX | Mood: clair`

---

## 🧪 Tests à effectuer

### Test 1 : Vérifier l'initialisation
- ✅ Console affiche "Persona Engine Initialized"
- ✅ Carte Living Engines affichée (pas de spinner)
- ✅ Toutes les métriques affichent des valeurs

### Test 2 : Vérifier les updates temps réel
- ✅ Les barres bougent légèrement (valeurs changent)
- ✅ Les logs s'ajoutent toutes les 5 secondes
- ✅ Le mood peut changer (clair, vibrant, attentif, etc.)

### Test 3 : Vérifier les métriques dynamiques
- ✅ Glow entre 0.8x et 1.5x
- ✅ Motion entre 0.8x et 1.5x
- ✅ Cognitive Load entre 0% et 100%
- ✅ Presence Level entre 0% et 100%

### Test 4 : Vérifier la performance
- ✅ Ouvrir DevTools browser (F12) → Performance
- ✅ Enregistrer 10 secondes
- ✅ Vérifier FPS stable (>50 FPS idéalement)
- ✅ Vérifier pas de memory leak

---

## 🐛 Dépannage

### Problème : Carte Living Engines affiche "Loading..."
**Solution** : 
- Vérifier console pour erreurs
- Vérifier que `/src/core/` existe
- Lancer `pnpm run dev` à nouveau

### Problème : Erreurs TypeScript dans console
**Solution** :
```bash
pnpm run type-check
```
Si erreurs, vérifier les imports dans `/src/hooks/useLivingEngines.ts`

### Problème : Métriques ne bougent pas
**Solution** :
- Vérifier interval dans `useLivingEngines(100)` (100ms)
- Vérifier que Persona Engine s'initialise (console log)
- Vérifier que `useEffect` update loop s'exécute

### Problème : Performance basse
**Solution** :
- Augmenter interval : `useLivingEngines(500)` au lieu de 100ms
- Vérifier CPU/Memory du navigateur
- Fermer autres onglets

---

## 📊 Métriques attendues

### Persona Engine
- **Mood** : clair, vibrant, attentif, alerte, neutre, dormant
- **Temperament** : serene, focused, alert, dormant
- **Présence** : 0-100% (typiquement 60-80%)
- **Posture** : attentive, relaxed, vigilant, minimal

### Visual Engines
- **Glow** : 1.0x (neutre) à 1.5x (intense)
- **Motion** : 1.0x (normal) à 1.3x (rapide)
- **Depth** : 0.5 (moyen) à 0.9 (profond)
- **Sound** : 0.5 (moyen) à 1.0 (fort)

### Cognitive Engines
- **Cognitive Load** : 0-100% (basé sur mood intensity)
- **Rhythm Score** : 20-100% (basé sur presence level)

---

## 🎥 Créer une vidéo démo

### Étapes
1. Lancer l'application
2. Naviguer vers DevTools
3. Ouvrir OBS ou autre logiciel de capture
4. Enregistrer 30 secondes montrant :
   - Carte Living Engines avec métriques animées
   - Console avec logs système
   - Changements de mood si possible

### Bonus
- Changer de page et revenir → Vérifier que état persiste
- Rafraîchir page → Vérifier réinitialisation correcte

---

## ✅ Validation Finale

Checklist avant de considérer terminé :

- [ ] Application démarre sans erreur
- [ ] Page DevTools affiche carte Living Engines
- [ ] Console affiche logs Persona Engine
- [ ] Métriques s'actualisent en temps réel
- [ ] Barres de progression animées
- [ ] Glow animé sur la carte
- [ ] Performance acceptable (>30 FPS)
- [ ] 0 erreurs TypeScript
- [ ] 0 erreurs runtime console

---

**Si tous les tests passent → INTEGRATION UI v24 VALIDÉE ✅**

Prochaine étape recommandée :
- Option A : Améliorer visuels (appliquer multiplicateurs dans plus de composants)
- Option B : Implémenter Phase 11 Semiotics Engine
- Option C : Créer tests automatisés pour Persona Engine
