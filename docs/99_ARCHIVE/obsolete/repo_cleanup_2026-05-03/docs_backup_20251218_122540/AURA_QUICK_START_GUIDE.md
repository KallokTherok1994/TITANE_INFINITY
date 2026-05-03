# 🚀 TITANE∞ v25.3.1 — QUICK START GUIDE

## ✅ AURA SYSTEM INSTALLATION COMPLETE

### Nouveaux Fichiers Créés

1. `src/hooks/useAuraOrchestrator.ts` (450 lines) — Store Zustand central
2. `src/components/aura/AuraControlPanel.tsx` (280 lines) — Interface utilisateur
3. `src/components/aura/AuraControlPanel.css` (580 lines) — Styles panneau
4. `src/hooks/useAuraPerformanceMonitor.tsx` (150 lines) — Monitoring FPS
5. `AURA_COMPLETE_DEVELOPMENT_REPORT_v25.3.1.md` — Documentation complète

### Fichiers Modifiés

1. `src/App.tsx` — Integration AuraControlPanel + AuraConnectedParticles
2. `src-tauri/src/commands/ai_prompt_generator.rs` — Fix compilation Rust

---

## 🎮 COMMENT UTILISER LE SYSTÈME AURA

### 1. Lancer l'Application

```bash
pnpm run dev
```

### 2. Ouvrir le Panneau de Contrôle

- **Toggle Button**: Bouton flottant violet ✨ en bas à droite
- **Clic**: Ouvre le panneau de contrôle complet

### 3. Réglages Disponibles

#### Quick Presets (Rapide)

Cliquez sur un preset pour configuration instantanée:

- **Minimal**: 50 particules, intensité basse (économie performance)
- **Balanced**: 75 particules, intensité moyenne (recommandé)
- **Performance**: 50 particules optimisées (mobile)
- **Quality**: 125 particules, intensité haute (desktop)
- **Maximum**: 150 particules, ultra qualité (high-end)

#### Intensity Slider

- **5 niveaux**: minimal → low → medium → high → maximum
- **Effet**: Contrôle l'opacité et l'intensité globale des effets
- **Valeur temps réel**: Affichée en % sous le slider

#### Mode Selector

- **Disabled**: Désactive tous les effets
- **Static**: Effets fixes sans animation
- **Dynamic**: Animations basiques (recommandé)
- **Reactive**: Répond aux interactions utilisateur
- **Quantum**: Mode avancé avec particles réactives

#### Theme Switcher

Choisissez parmi 6 thèmes:

- **Default**: Violet + Cyan + Bleu (signature TITANE∞)
- **Ocean**: Cyan + Bleu + Violet (calme, professionnel)
- **Sunset**: Rose + Orange + Rouge (chaleureux, créatif)
- **Forest**: Vert + Lime + Cyan (naturel, apaisant)
- **Fire**: Rouge + Orange + Jaune (énergique, dynamique)
- **Rainbow**: Multi-couleurs (festif, expressif)

**Preview**: Cercle de couleur à gauche de chaque thème

#### Quantum Particles

- **Toggle**: Enable/Disable le background de particules
- **Count**: Affiche le nombre de particules actives
- **Auto-adjusté**: Basé sur l'intensité sélectionnée

#### Quality Settings

Ajuste la qualité vs performance:

- **Low**: 30 FPS, 50 particules (devices faibles)
- **Medium**: 45 FPS, 75 particules (mobile standard)
- **High**: 60 FPS, 100 particules (desktop standard)
- **Ultra**: 60 FPS+, 150 particules (high-end GPU)

#### Performance Metrics

- **FPS**: Affichage temps réel du framerate
- **Recommended**: Qualité recommandée automatiquement
- **Auto-Adjustment**: Système réduit qualité si FPS < 30

#### Reset Button

- Restaure configuration par défaut
- Utile si performances dégradées

---

## 🎨 EFFETS AURA VISIBLES

### 1. **Chat Messages** (Conversation)

- **Aura violet** (assistant) et **cyan** (utilisateur)
- **Glassmorphism**: Fond flou semi-transparent
- **Hover glow**: Intensification au survol

### 2. **Stats Cards** (Vue d'Ensemble)

- **Couleurs dynamiques**: Basées sur data-value (high/medium/low)
- **High**: Vert émeraude (succès)
- **Medium**: Cyan (normal)
- **Low**: Orange ambre (attention)

### 3. **Vision Scan** (Vision & Perception)

- **Conic-gradient rotation**: Radar qui tourne (4s)
- **Scan line**: Ligne horizontale qui traverse (3s)
- **Mode actif uniquement**: Si caméra enabled

### 4. **XP Progress Bar** (Progression)

- **Gradient flow**: Animation de gauche à droite
- **Cursor glow**: Point lumineux qui suit la progression
- **CSS variable**: `--xp-percent` (0-100)

### 5. **Identity Modes** (Identité & ADN)

- **4 modes** avec couleurs distinctes:
  - Creative: Rose + violet
  - Analytical: Bleu + cyan
  - Empathetic: Vert + lime
  - Balanced: Multi-couleurs
- **Switch flash**: Animation 0.5s lors du changement

### 6. **Memory Triple** (Mémoire Triple)

- **3 types** avec vitesses différentes:
  - Short-term: Cyan pulse rapide (2s)
  - Mid-term: Bleu pulse moyen (3s)
  - Long-term: Violet pulse lent (4s)

### 7. **Evolution Timeline** (Évolution Mémoire)

- **Ligne verticale**: Gradient qui flow de haut en bas
- **Drop-shadow**: Glow sur les entrées

### 8. **Transformation Milestones** (Transformation)

- **Rainbow rotation**: Gradient arc-en-ciel qui tourne (8s)
- **Achievement burst**: Explosion lumineuse 0.6s

### 9. **Tabs & Header**

- **Active pulse**: Tab actif pulse doucement
- **Switch flash**: Animation lors du changement de tab

### 10. **Quantum Particles** (Background global)

- **100-150 particules** (selon intensité)
- **Mouse attraction**: Particules attirées par la souris
- **Connexions dynamiques**: Lignes entre particules proches
- **Couleurs thème**: Synchronisées avec thème sélectionné

---

## 📱 RESPONSIVE & ACCESSIBILITÉ

### Mobile Optimizations

- **Blur réduit**: 20px → 12px (performance)
- **Panneau full-width**: S'adapte à l'écran
- **Particles count réduit**: Auto-ajusté

### Accessibility Features

- **Prefers-Reduced-Motion**: Désactive animations si demandé
- **ARIA labels**: Tous les boutons labellisés
- **Keyboard navigation**: Tab/Enter fonctionnent
- **Color contrast**: WCAG 2.1 AA compliant

---

## ⚡ PERFORMANCE TIPS

### Pour Desktop Haute Performance

1. Sélectionnez preset **"Maximum"**
2. Mode: **"Quantum"**
3. Quality: **"Ultra"**
4. Theme: **"Rainbow"** (le plus impressionnant)

### Pour Mobile

1. Sélectionnez preset **"Performance"**
2. Mode: **"Dynamic"**
3. Quality: **"Medium"** ou **"Low"**
4. Theme: **"Default"** (moins de couleurs = moins de calcul)

### Si FPS Bas

1. **Le système auto-ajuste** qualité automatiquement
2. **Manuellement**: Réduire intensity à "Low"
3. **Désactiver particles**: Toggle "Quantum Particles" OFF
4. **Réduire quality**: Passer à "Low" (30 FPS)

### Si Application Lente au Démarrage

- **Cause**: LocalStorage peut retarder hydration
- **Solution**: Cliquer "Reset to Default" dans panneau
- **Permanent**: Vider localStorage (`Ctrl+Shift+Delete`)

---

## 🐛 TROUBLESHOOTING

### Panneau de Contrôle Ne S'Ouvre Pas

1. Vérifier console navigateur (F12)
2. Rechercher erreurs `useAuraOrchestrator`
3. Vider cache navigateur
4. Redémarrer dev server

### Particles Non Visibles

1. Ouvrir panneau contrôle
2. Vérifier "Enable Aura Effects" coché
3. Vérifier "Enable Particles" coché
4. Augmenter "Intensity" slider
5. Vérifier console: erreurs canvas?

### FPS Très Bas (<20)

1. Le système devrait auto-downgrade quality
2. Si pas: Forcer "Quality: Low" manuellement
3. Désactiver particles temporairement
4. Fermer autres applications lourdes
5. Vérifier utilisation GPU (Task Manager)

### Thème Ne Change Pas

1. Vérifier CSS variables appliquées (`--aura-theme-colors`)
2. Inspecter élément `<html>` dans DevTools
3. Forcer refresh (`Ctrl+F5`)
4. Cliquer "Reset to Default"

### Animation Saccadées

1. **Cause probable**: GPU non utilisé
2. **Solution**: Activer accélération matérielle navigateur
3. **Chrome**: `chrome://settings/` → Système → "Utiliser accélération matérielle"
4. **Firefox**: `about:preferences` → Performance

---

## 🔧 DÉVELOPPEMENT & CUSTOMIZATION

### Ajouter un Nouveau Thème

Éditer `src/hooks/useAuraOrchestrator.ts`:

```typescript
const themes = {
  // ... thèmes existants
  myTheme: [
    'rgba(255, 0, 0, 0.8)', // Couleur 1
    'rgba(0, 255, 0, 0.8)', // Couleur 2
    'rgba(0, 0, 255, 0.8)', // Couleur 3
  ],
};
```

Ajouter dans `AuraControlPanel.tsx`:

```typescript
const themes: AuraTheme[] = [
  'default',
  'ocean',
  'sunset',
  'forest',
  'fire',
  'rainbow',
  'myTheme', // ← Nouveau thème
];
```

CSS preview dans `AuraControlPanel.css`:

```css
.theme-preview[data-theme='myTheme'] {
  background: linear-gradient(135deg, #ff0000, #00ff00, #0000ff);
}
```

### Changer Particle Count Par Défaut

Éditer `src/hooks/useAuraOrchestrator.ts`:

```typescript
const INTENSITY_PARTICLE_COUNTS: Record<AuraIntensity, number> = {
  minimal: 25, // ← Réduit de 50 → 25
  low: 50, // ← Réduit de 75 → 50
  medium: 100, // Inchangé
  high: 150, // ← Augmenté de 125 → 150
  maximum: 200, // ← Augmenté de 150 → 200
};
```

### Désactiver Auto-Quality Adjustment

Éditer `src/hooks/useAuraPerformanceMonitor.tsx`:

```typescript
export const useAuraPerformanceMonitor = (
  autoAdjust: boolean = false, // ← Changer true → false
  targetFPS: number = 60
) => {
  // ...
};
```

### Changer Position Panneau Contrôle

Éditer `src/App.tsx`:

```tsx
<AuraControlPanel
  position="top-left" // ← 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  defaultOpen={true} // ← Ouvrir par défaut
/>
```

---

## 📊 MÉTRIQUES DE PERFORMANCE

### Cibles

- **Desktop**: ≥60 FPS
- **Mobile**: ≥30 FPS
- **Frame Time**: <16ms
- **Memory**: <100MB

### Monitoring

1. Ouvrir panneau contrôle
2. Section "Performance"
3. FPS temps réel affiché
4. "Recommended" indique qualité optimale

### Profiling Avancé

```javascript
// Ouvrir console DevTools (F12)

// Mesurer FPS moyen sur 10 secondes
let frames = 0;
let lastTime = performance.now();

const measure = () => {
  frames++;
  const now = performance.now();

  if (now - lastTime > 10000) {
    console.log(`Avg FPS: ${(frames / 10).toFixed(1)}`);
    frames = 0;
    lastTime = now;
  }

  requestAnimationFrame(measure);
};

requestAnimationFrame(measure);
```

---

## 🎓 BEST PRACTICES

### 1. **Choisir Bon Preset Initial**

- **Bureau puissant**: "Quality" ou "Maximum"
- **Laptop standard**: "Balanced"
- **Mobile récent**: "Performance"
- **Device ancien**: "Minimal"

### 2. **Adapter Thème au Contexte**

- **Travail focus**: "Ocean" (calme, professionnel)
- **Créativité**: "Sunset" ou "Rainbow"
- **Lecture longue**: "Forest" (apaisant)
- **Présentation**: "Fire" (énergique)

### 3. **Surveiller FPS**

- Gardez panneau ouvert première fois
- Si FPS < 45: Réduire qualité
- Si FPS stable ≥60: Essayer quality supérieure

### 4. **Économiser Batterie (Mobile)**

- Preset "Minimal"
- Désactiver particles
- Mode "Static" au lieu de "Dynamic"

### 5. **Accessibilité Prioritaire**

- Si utilisateur signale gêne: Désactiver Aura
- Respecter prefers-reduced-motion
- Proposer "Minimal" par défaut

---

## 🚀 PROCHAINES FONCTIONNALITÉS

### Phase 2: Aura Sonore (À venir)

- Synchronisation avec audio TTS
- Visualisation amplitude microphone
- Pulse synchronisé avec parole

### Phase 3: Aura Émotionnelle (À venir)

- Color mapping basé sentiment
- Détection émotions messages
- Transitions douces émotions

### Phase 4: Aura Contextuelle (À venir)

- Auto-theme basé mode TITANE
- Intensity scaling charge cognitive
- Night mode automatique

---

## 📞 SUPPORT

### Problème Persistant?

1. Ouvrir issue GitHub
2. Inclure:
   - Version navigateur
   - Device (CPU, GPU, RAM)
   - Config Aura (export depuis panneau)
   - Screenshots + console logs

### Amélioration Suggérée?

- Créer feature request GitHub
- Décrire use case précis
- Mockups/exemples appréciés

---

**🌟 PROFITEZ DU SYSTÈME AURA v25.3.1 ! ✨**

_Développé avec passion pour TITANE∞_  
_"Modern, Reactive, Performant, Accessible"_
