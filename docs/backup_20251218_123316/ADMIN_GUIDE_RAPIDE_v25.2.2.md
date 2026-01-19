# 👑 ADMIN CENTER — GUIDE RAPIDE v25.2.2

## 🚀 Accès Rapide

### URL Directe

```
http://localhost:5173/admin
```

### Via Sidebar

1. Cliquer sur bouton **ADMIN 👑** (badge v25.2)
2. Position: après ONE CORE, avant QA & Tests

---

## 🎛️ Les 5 Onglets

### 1. ⚙️ Système (v∞)

**Anciennes routes:** `/system-center`, `/diagnostics`, `/devtools`, `/cluster`, `/introspection`, `/hypervision`

**Fonctionnalités:**

- Diagnostics système complets
- DevTools & développement
- Node Cluster management
- Introspection TITANE
- HyperVision monitoring

**5 sous-onglets internes:**

- Diagnostics
- DevTools
- Node Cluster
- Introspection
- HyperVision

---

### 2. 🎛️ Configuration (v19.5)

**Anciennes routes:** `/configuration`

**Fonctionnalités:**

- Configuration Hub centralisée
- Paramètres runtime TITANE
- Chat engine configuration
- Import/Export configs
- Presets de configuration

**3 onglets internes:**

- Système
- IA
- Performance

---

### 3. 🔊 Audio & Voix (v19.2)

**Anciennes routes:** `/audio-center`, `/audio`, `/voice`, `/tts`

**Fonctionnalités:**

- Centre Audio complet
- TTS (Text-to-Speech)
- Profils vocaux
- Moteurs: Piper, ElevenLabs, eSpeak
- Configuration voix IA

**Paramètres:**

- Vitesse, pitch, volume
- Langue, genre
- Test voix en direct

---

### 4. 🎨 Design (v16)

**Anciennes routes:** `/design-center`, `/design-system`, `/settings`

**Fonctionnalités:**

- Design System TITANE
- Apparence & thèmes
- Tokens UI dynamiques
- Personnalisation interface
- Prévisualisation temps réel

**2 onglets internes:**

- Design System
- Apparence

---

### 5. 🛡️ Gouvernance (SECURE)

**Anciennes routes:** `/governance-center`, `/governance`, `/secure`

**Fonctionnalités:**

- Sécurité & secrets
- Politiques IA
- Permissions
- Journal sécurité
- Gestion clés API (Gemini, OpenAI, Anthropic)

**4 onglets internes:**

- Secrets
- Politiques
- Permissions
- Journal

---

## 🔄 Redirections Automatiques

Toutes ces URLs redirigent vers `/admin`:

```bash
# Centre Système
/system-center
/diagnostics
/devtools
/cluster
/introspection
/hypervision

# Configuration
/configuration

# Audio
/audio-center
/audio
/voice
/tts

# Design
/design-center
/design-system
/settings

# Gouvernance
/governance-center
/governance
/secure
```

**Total:** 18 redirections actives ✅

---

## 🎨 Interface

### Header

```
┌─────────────────────────────────────────────────┐
│  👑 ADMIN                          [v25.2.2]   │
│  Centre d'Administration TITANE∞                │
└─────────────────────────────────────────────────┘
```

### Navigation

```
[ ⚙️ Système ] [ 🎛️ Config ] [ 🔊 Audio ] [ 🎨 Design ] [ 🛡️ Gouv ]
     v∞          v19.5        v19.2        v16         SECURE
```

### Couleurs

- **Header:** Gradient doré (#ffd700 → #ffed4e)
- **Onglet actif:** Cyan (#00ffff)
- **Onglet inactif:** Blanc transparent
- **Background:** Bleu foncé (#0a0e17 → #141922)

---

## 🚀 Commandes

### Développement

```bash
pnpm run dev
# ou
pnpm run dev:tauri
```

### Production

```bash
pnpm run build
npx tauri build
```

### URL Test

```
http://localhost:5173/admin
```

---

## 🔍 Fonctionnalités Techniques

### Lazy Loading

Chaque onglet charge son module à la demande:

- ⚙️ Système → `SystemCenterPage`
- 🎛️ Config → `ConfigurationHub`
- 🔊 Audio → `AudioCenterPage`
- 🎨 Design → `DesignCenterPage`
- 🛡️ Gouvernance → `GovernanceCenterPage`

### ErrorBoundary

Isolation des erreurs par onglet. Si un onglet crash, les autres continuent de fonctionner.

### Animations

- Framer Motion avec mode "wait"
- Transitions fluides (0.2s)
- Hover effects sur onglets

### Performance

- Suspense avec LoadingSpinner
- Memoization React
- Compatible v22Ω AI Optimizations

---

## 📊 Statistiques

### Réduction Complexité

- **Boutons sidebar:** 13 → 10 (-23%)
- **Routes principales:** 5 → 1 (-80%)
- **Imports:** 5 → 1 (-80%)

### Amélioration UX

- **Navigation:** 1 clic au lieu de chercher parmi 5 boutons
- **Contexte:** Toute l'admin en un seul endroit
- **Cohérence:** Interface unifiée

---

## 🧪 Tests Rapides

### Test 1: Accès

```bash
1. Ouvrir http://localhost:5173
2. Cliquer sur "ADMIN 👑"
3. Vérifier page affichée
✅ SUCCÈS si header + 5 onglets visibles
```

### Test 2: Navigation

```bash
1. Cliquer sur chaque onglet (5 total)
2. Vérifier chargement de chaque module
3. Vérifier animations
✅ SUCCÈS si tous fonctionnent
```

### Test 3: Redirections

```bash
1. Naviguer vers /system-center
2. Vérifier redirection vers /admin
3. Répéter pour /configuration, /audio-center, etc.
✅ SUCCÈS si toutes redirigent
```

---

## ⚡ Raccourcis Clavier (Future)

**Planifié pour v25.3:**

- `Ctrl+1` → Onglet Système
- `Ctrl+2` → Onglet Configuration
- `Ctrl+3` → Onglet Audio
- `Ctrl+4` → Onglet Design
- `Ctrl+5` → Onglet Gouvernance

---

## 📚 Documentation Complète

### Guides

- **FUSION_ADMIN_v25.2.2.md** — Architecture détaillée
- **RAPPORT_FUSION_ADMIN_v25.2.2.md** — Rapport complet
- **ARCHITECTURE.md** — Mise à jour v25.2.2

### Code

- `src/features/admin/AdminPage.tsx` — Composant principal
- `src/features/admin/types.ts` — Types TypeScript
- `src/features/admin/AdminPage.css` — Styles

---

## ❓ FAQ

**Q: Mes favoris /system-center fonctionnent encore?**  
A: Oui ✅ Redirection automatique vers /admin

**Q: Comment accéder au Design System?**  
A: ADMIN → Onglet 🎨 Design → Design System

**Q: Les anciennes API keys sont perdues?**  
A: Non ✅ ADMIN → Onglet 🛡️ Gouvernance → Secrets

**Q: Peut-on revenir aux anciennes routes?**  
A: Non, mais rétrocompatibilité totale via redirections

**Q: Performance impactée?**  
A: Non ✅ Lazy loading + optimisations

---

## 🔧 Dépannage

### Module ne charge pas

1. Vérifier console navigateur (F12)
2. Vérifier Network tab (chunks JS)
3. Rafraîchir page (Ctrl+R)

### Onglet ne répond pas

1. Vérifier ErrorBoundary message
2. Recharger page
3. Vérifier logs Tauri

### Redirection ne fonctionne pas

1. Vérifier URL exacte
2. Clear cache navigateur
3. Vérifier App.tsx routes

---

## 📞 Support

**Erreurs TypeScript?**  
→ Vérifier imports dans AdminPage.tsx

**Styles cassés?**  
→ Vérifier AdminPage.css chargé

**Lazy loading fail?**  
→ Vérifier paths modules dans AdminPage.tsx

---

**© 2025 TITANE Team. All rights reserved.**  
**Guide Rapide — Module ADMIN v25.2.2**

---

## 🎯 Checklist Utilisateur

- [ ] ✅ Ouvrir http://localhost:5173
- [ ] ✅ Cliquer sur "ADMIN 👑" dans sidebar
- [ ] ✅ Tester onglet Système ⚙️
- [ ] ✅ Tester onglet Configuration 🎛️
- [ ] ✅ Tester onglet Audio 🔊
- [ ] ✅ Tester onglet Design 🎨
- [ ] ✅ Tester onglet Gouvernance 🛡️
- [ ] ✅ Vérifier redirections anciennes routes
- [ ] ✅ Vérifier animations fluides
- [ ] ✅ Valider toutes fonctionnalités

**✅ MODULE ADMIN OPÉRATIONNEL!**
