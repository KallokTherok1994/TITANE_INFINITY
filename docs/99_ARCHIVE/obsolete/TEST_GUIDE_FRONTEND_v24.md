# 🧪 TITANE∞ v24 — GUIDE DE TEST FRONTEND

**Date** : 22 novembre 2025  
**Serveur** : Python HTTP lancé sur port 8080  
**URL** : http://localhost:8080

---

## ✅ SERVEUR ACTIF

```bash
# Serveur HTTP Python lancé
cd /home/titane/Documents/TITANE_INFINITY/dist
python3 -m http.server 8080
```

**Status** : 🟢 ONLINE  
**Port** : 8080  
**Mode** : Web-only (pas de backend Tauri)

---

## 🔍 TESTS À EFFECTUER

### 1. Accès Page Principale
**URL** : http://localhost:8080

**À vérifier** :
- [ ] Page charge sans erreur 404
- [ ] HTML s'affiche
- [ ] CSS chargé (styles visibles)
- [ ] JavaScript chargé (pas d'erreur console)
- [ ] Favicon visible
- [ ] Titre : "TITANE∞ v17.1.1 - Design System Complete"

**Console navigateur** :
- Ouvrir DevTools (F12)
- Onglet Console
- Chercher messages d'initialisation
- Noter warnings/errors

---

### 2. Navigation
**Pages à tester** :
- http://localhost:8080/ (Home)
- http://localhost:8080/devtools (DevTools page)
- http://localhost:8080/design-system (si existe)
- http://localhost:8080/demo (si existe)

**À vérifier** :
- [ ] Routing fonctionne
- [ ] Pas de 404 sur navigation
- [ ] Header/Navigation visible
- [ ] Footer (si présent)

---

### 3. DevTools Page (CRITIQUE)
**URL** : http://localhost:8080/devtools

**Living Engines Card** :
- [ ] Card visible
- [ ] Titre "Living Engines v24"
- [ ] Mood display (Neutre/Clair/etc.)
- [ ] Posture display (Relaxed/Attentive/etc.)
- [ ] Temperament display (Serene/Focused/etc.)
- [ ] Glow multiplier value (0.8-1.5)
- [ ] Motion multiplier value
- [ ] Sound multiplier value
- [ ] Depth multiplier value
- [ ] Presence level bar
- [ ] Reactivity bar
- [ ] Stability bar
- [ ] Attention bar

**Animations** :
- [ ] Barres animées (progressbar fill)
- [ ] Glow effect visible
- [ ] Transitions smooth
- [ ] 60 FPS (pas de lag)

**Console logs attendus** :
```javascript
🌟 TITANE∞ v24 - Persona Engine (TypeScript) Initialized
[PersonaEngine] State: Neutre
[PersonaEngine] Glow: 1.00
```

---

### 4. Design System (si disponible)
**URL** : http://localhost:8080/design-system

**Components à tester** :
- [ ] Switch (7 variants)
- [ ] Checkbox
- [ ] Radio buttons
- [ ] Slider
- [ ] Select dropdown
- [ ] Toggle
- [ ] Buttons

**Interactions** :
- [ ] Clicks fonctionnent
- [ ] States change (checked/unchecked)
- [ ] Hover effects
- [ ] Focus states (accessibility)
- [ ] Animations smooth

---

### 5. Performance

**Ouvrir DevTools Performance tab** :
1. Start recording
2. Navigate to /devtools
3. Wait 10 seconds
4. Stop recording

**Métriques à vérifier** :
- [ ] FPS ≥ 55 (idéal 60)
- [ ] CPU usage < 10%
- [ ] No layout thrashing
- [ ] No memory leaks (heap stable)

**Lighthouse audit** :
- Performance score ≥ 90
- Accessibility ≥ 90
- Best Practices ≥ 90

---

### 6. Console Inspection

**Ouvrir Console (F12)** :

**Commandes à tester** :
```javascript
// Vérifier objets globaux
console.log(window.__TAURI__)  // undefined (mode web)
console.log(window.location.href)

// Si Persona Engine exposé globalement
console.log(window.personaEngine)  // ou rechercher dans React DevTools

// React DevTools (si extension installée)
// Inspecter composant LivingEnginesCard
// Voir props et state en temps réel
```

---

### 7. Responsive Design

**Tester différentes tailles** :
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**DevTools** : Toggle device toolbar (Ctrl+Shift+M)

**À vérifier** :
- [ ] Layout adapte
- [ ] Pas de overflow horizontal
- [ ] Text lisible
- [ ] Buttons accessible
- [ ] Cards stackent correctement

---

### 8. Accessibility

**Keyboard navigation** :
- [ ] Tab fonctionne (focus visible)
- [ ] Enter/Space activent buttons
- [ ] Esc ferme modals (si présent)
- [ ] Focus trap dans modals

**Screen reader** (si disponible) :
- [ ] Headings structurés (h1, h2, etc.)
- [ ] Labels sur inputs
- [ ] Alt text sur images
- [ ] ARIA attributes présents

**Contrast** :
- [ ] Text readable (WCAG AA)
- [ ] Colors distinguishable
- [ ] Focus indicators visible

---

## 🐛 DEBUGGING

### Si page ne charge pas :
1. Vérifier serveur actif : `ps aux | grep python3`
2. Vérifier port : `netstat -tuln | grep 8080`
3. Tester curl : `curl http://localhost:8080`
4. Vérifier firewall : `sudo ufw status`

### Si erreurs console :
1. Noter le message exact
2. Vérifier Network tab (404s?)
3. Vérifier fichiers manquants
4. Checker CORS errors
5. Logs : Screenshot ou copier text

### Si animations lag :
1. Performance tab → Frame rate
2. CPU throttling dans DevTools
3. Disable extensions navigateur
4. Tester autre navigateur (Chrome/Firefox)

### Si Persona Engine inactif :
1. Console : chercher "Initialized"
2. React DevTools : inspecter useLivingEngines
3. Vérifier update loop (100ms interval)
4. Console.log dans le code (si besoin rebuild)

---

## 📊 RAPPORT DE TEST

**Template à remplir** :

```markdown
# Test Frontend TITANE∞ v24
Date : [DATE]
Navigateur : [Chrome/Firefox/Safari]
Version : [XX.X]

## Chargement
- [ ] Page principale charge
- [ ] Assets chargés (JS/CSS)
- [ ] Pas d'erreurs console

## Navigation
- [ ] /devtools accessible
- [ ] Routing fonctionne
- [ ] Pas de 404

## Living Engines Card
- [ ] Visible
- [ ] Mood affiché
- [ ] Multipliers affichés
- [ ] Barres animées

## Performance
- FPS : [XX]
- CPU : [X%]
- Memory : [XXX MB]
- Lighthouse Performance : [XX/100]

## Bugs trouvés
1. [Description]
2. [Description]

## Notes
[Observations supplémentaires]
```

---

## 🎯 RÉSULTAT ATTENDU

### Mode Web (TypeScript Fallback) ✅
**Ce qui devrait fonctionner** :
- ✅ UI s'affiche
- ✅ Navigation OK
- ✅ Living Engines Card visible
- ✅ Persona Engine TypeScript actif
- ✅ Update loop (100ms)
- ✅ Mood changes
- ✅ Visual multipliers
- ✅ Animations smooth

**Limitations attendues** :
- ❌ Pas de commandes Tauri (window.__TAURI__ undefined)
- ❌ Backend Rust inaccessible
- ⚠️ Fallback sur TypeScript engine (moins performant)

### Ce qui prouve que ça marche :
1. **Console log** : "Persona Engine (TypeScript) Initialized"
2. **Mood change** : De Neutre → Clair/Attentif selon activité
3. **Glow varie** : Entre 0.8 et 1.5
4. **Barres animées** : Reactivity, Stability, Attention bougent
5. **60 FPS** : Smooth animations

---

## 📸 SCREENSHOTS À CAPTURER

1. **Page principale** (home)
2. **DevTools page** — Vue complète
3. **Living Engines Card** — En détail
4. **Console** — Logs initialisation
5. **Performance tab** — Frame rate
6. **Lighthouse scores**
7. **Responsive** — Mobile view

**Destination** : `/docs/screenshots/` ou GitHub issue

---

## 🚀 APRÈS LES TESTS

### Si tout fonctionne ✅
**Prochaine étape** : Installer Node.js pour :
- Live reload pendant dev
- Rebuild avec nouvelles features
- Tests avec backend Rust (Tauri)

### Si bugs trouvés 🐛
**Actions** :
1. Documenter précisément (screenshots + logs)
2. Créer issues GitHub
3. Prioriser fixes critiques
4. Planning corrections

### Si backend Rust nécessaire
**Installer Tauri complet** :
```bash
# Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
npm install -g pnpm

# Dépendances Tauri
sudo apt install libwebkit2gtk-4.1-dev (si système natif)

# Launch
cargo tauri dev
```

---

## 🎬 VIDÉO DÉMO

**Une fois tests OK**, créer vidéo 30-60s :

**Plan** :
1. (5s) Intro — Logo TITANE∞
2. (10s) Navigation vers /devtools
3. (15s) Living Engines Card en action
4. (10s) Mood changes en temps réel
5. (10s) Performance metrics (60 FPS)
6. (5s) Design System showcase (si temps)
7. (5s) Outro — "v24 Ready"

**Tools** :
- OBS Studio / SimpleScreenRecorder
- Format : 1080p MP4
- Upload : GitHub Releases ou README

---

**Status** : 🟢 Serveur HTTP ONLINE  
**URL** : http://localhost:8080  
**Mode** : Web-only (TypeScript fallback)  
**Next** : Ouvrir navigateur et tester !

🧪 **Let's Test!** 🚀
