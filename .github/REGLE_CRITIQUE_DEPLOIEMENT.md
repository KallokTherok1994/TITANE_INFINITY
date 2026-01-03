# ⚠️ RÈGLE CRITIQUE — MODE DÉVELOPPEMENT PERMANENT

**AUTORITÉ:** Kevin Thibault (Créateur TITANE∞)  
**DATE EFFECTIVE:** 2 janvier 2026  
**PRIORITÉ:** ABSOLUE — Non-négociable

---

## 🚫 INTERDICTIONS ABSOLUES

Jusqu'à nouvelle autorisation écrite explicite de Kevin Thibault :

### ❌ NE JAMAIS déployer en production
- **AppImage** (.AppImage)
- **DEB packages** (.deb)
- **RPM packages** (.rpm)
- Tout format de distribution binaire

### ❌ NE JAMAIS exécuter ces commandes
```bash
# INTERDITS:
npm run build
tauri build
cargo build --release
./runtime/stable/build.sh
```

### ❌ NE JAMAIS lancer ces tâches VS Code
- 🔵 Build Titan-Stable
- 📦 Package Production
- 🚀 Deploy AppImage
- 📦 Install DEB
- Toute tâche de build/bundle/deploy production

---

## ✅ MODE DE TRAVAIL OBLIGATOIRE

### Mode Développement UNIQUEMENT

**Environnement autorisé:**
```bash
# ✅ AUTORISÉ:
npm run dev              # Titan-Dev (Vite)
./runtime/dev/run-dev.sh # Script dev complet
cargo run                # Rust debug mode
```

**Tâches VS Code autorisées:**
- ✅ 🟢 Launch Titan-Dev
- ✅ 🧪 Run All Tests
- ✅ 📊 Dev Logs (Vite/Tauri)
- ✅ 🧹 Clean Working State

### Paramètres de développement

**Philosophie:** Minimiser les restrictions pour fluidité maximale

**Configuration dev-friendly:**
- Sécurité minimale (pas de blocages inutiles)
- Logs verbeux (RUST_LOG=debug)
- Hot-reload actif
- Pas de validation stricte en dev
- Permissions maximales pour tests

---

## 📋 CONDITIONS POUR AUTORISATION PRODUCTION

Le déploiement production nécessite **TOUTES** ces conditions :

### 1️⃣ Tests Unitaires/Intégration
```bash
npm test -- --run          # React/TS tests
✅ Résultat: 100/100 passés
```

### 2️⃣ Tests Rust
```bash
cd src-tauri && cargo test
✅ Résultat: 100% success, 0 failed
```

### 3️⃣ Tests E2E Playwright
```bash
npm run test:e2e
✅ Résultat: 3/3 scénarios OMEGA v2 passés
```

### 4️⃣ Validation COPILOT-XS
```bash
npm run copilot-xs:test
✅ Résultat: EXIT:0 (pas d'erreurs)
```

### 5️⃣ Autorisation Formelle

**Message explicite requis de Kevin Thibault:**
```
GO FOR PRODUCTION DEPLOY
J'autorise le build de:
- [ ] AppImage v[VERSION]
- [ ] DEB package v[VERSION]
Signature: Kevin Thibault
Date: [DATE]
```

---

## 🎯 RATIONALE

### Pourquoi cette règle ?

1. **Prévention bugs en production**
   - Les builds stables doivent être parfaits
   - Aucune régression acceptée en production
   - Un seul bug peut ruiner l'expérience utilisateur

2. **Cycle de validation complet**
   - Tests CLI: stabilité des composants
   - Tests Rust: fiabilité backend
   - Tests E2E: workflows utilisateur complets
   - Validation humaine: jugement expert nécessaire

3. **Séparation claire dev/prod**
   - Dev: expérimentation libre, itérations rapides
   - Prod: stabilité absolue, qualité maximale
   - Ne pas mélanger les deux environnements

4. **Contrôle qualité**
   - Seul le créateur peut autoriser une release
   - Évite les déploiements précipités
   - Garantit la cohérence de la vision

---

## 🔧 RÉPONSE AUX DEMANDES AMBIGUËS

### Si l'utilisateur dit "build" sans préciser :

**❌ NE PAS ASSUMER** qu'il veut un build production  
**✅ TOUJOURS DEMANDER:**
```
Clarification nécessaire:
- Build DEV (Titan-Dev) ? ✅ Autorisé
- Build PROD (AppImage/DEB) ? ❌ Interdit sans autorisation explicite

Quelle version souhaitez-vous ?
```

### Si l'utilisateur dit "deploy" :

**❌ NE PAS LANCER** de build automatiquement  
**✅ RAPPELER LA RÈGLE:**
```
⚠️ RÈGLE CRITIQUE: Déploiement production interdit
Mode actuel: DÉVELOPPEMENT UNIQUEMENT

Pour autoriser un deploy production:
1. Tests: 100/100 passés
2. Message explicite: "GO FOR PRODUCTION DEPLOY"

Voulez-vous lancer Titan-Dev à la place ?
```

---

## 📝 HISTORIQUE

### 2026-01-02 — Création de la règle
**Contexte:** Build production lancé par erreur suite à demande ambiguë  
**Action:** Création de cette règle permanente  
**Objectif:** Clarifier mode dev vs mode prod  

---

## ✅ CHECKLIST AGENT IA

Avant TOUTE action de build/deploy, vérifier :

- [ ] L'utilisateur a-t-il dit "GO FOR PRODUCTION DEPLOY" ?
- [ ] Tous les tests sont-ils à 100/100 ?
- [ ] Y a-t-il une autorisation écrite explicite ?
- [ ] Le contexte indique-t-il clairement "production" ?

**SI UN SEUL "NON" → MODE DEV UNIQUEMENT**

---

**Signature règle:** Kevin Thibault, Créateur TITANE∞  
**Date effective:** 2 janvier 2026  
**Révision:** Nécessite autorisation écrite du créateur
