# 🔒 RÈGLES PERMANENTES - KEVIN THIBAULT

**Date d'enregistrement :** 21 novembre 2025  
**Utilisateur :** Kevin Thibault  
**Projet :** TITANE∞ v16.1.0  
**Statut :** RÈGLES ABSOLUES - MÉMORISATION PERMANENTE

---

## ⚠️ RÈGLES CRITIQUES ABSOLUES

### 🚨 RÈGLE #1 : DÉPLOIEMENT 100% TAURI/RUST/CARGO UNIQUEMENT

**INTERDICTIONS ABSOLUES :**
- ❌ **JAMAIS AUCUN SERVEUR HTTP** (python3 -m http.server, vite preview, etc.)
- ❌ **JAMAIS npm run preview**
- ❌ **JAMAIS npm start**
- ❌ **JAMAIS vite dev direct**
- ❌ **JAMAIS aucun déploiement web HTTP**

**MÉTHODES AUTORISÉES UNIQUEMENT :**
- ✅ **Compilation : `cargo build --release` (OBLIGATOIRE)**
- ✅ **Développement : `npm run dev` → `tauri dev` (OBLIGATOIRE)**
- ✅ **Build production : `tauri build` (OBLIGATOIRE)**
- ✅ **Distribution : .deb, .AppImage, .dmg (natif uniquement)**

**ARCHITECTURE IMPOSÉE :**
```
TITANE∞ = Tauri (Frontend WebView) + Rust (Backend) + Cargo (Build)
          ↓
      100% APPLICATION NATIVE
          ↓
      AUCUN SERVEUR HTTP
```

---

### 🌍 RÈGLE #2 : 100% LOCAL-FIRST - FONCTIONNEMENT OFFLINE COMPLET

**PRINCIPE ABSOLU :**
TITANE∞ FONCTIONNE **TOUJOURS** sans connexion internet.

**GARANTIES :**
- ✅ Tous les composants fonctionnent offline
- ✅ Aucune dépendance externe obligatoire
- ✅ Application démarre sans internet
- ✅ Toutes les fonctions de base disponibles hors ligne
- ✅ Données stockées localement (localStorage, IndexedDB)
- ✅ Ollama local prioritaire (pas de cloud requis)

**ARCHITECTURE OFFLINE :**
```
TITANE∞ (Local)
├── Frontend React (WebView Tauri)
├── Backend Rust (IPC local)
├── Ollama Local (AI offline)
├── localStorage (persistance)
└── IndexedDB (données complexes)
```

---

### 🔌 RÈGLE #3 : CONNEXIONS EXTERNES OPTIONNELLES ET AUTOMATIQUES

**CONNEXIONS AUTOMATIQUES (si disponibles) :**
- ✅ **API Gemini** : Connexion automatique si internet + API key
- ✅ **Ollama** : Connexion automatique si disponible localement
- ✅ Détection automatique de la disponibilité
- ✅ Fallback gracieux vers mode offline si indisponible

**FONCTIONS ONLINE (sur demande explicite) :**
- ✅ Activées **UNIQUEMENT** à la demande de Kevin Thibault
- ✅ Recherche web (si demandée)
- ✅ APIs externes (si demandées)
- ✅ Synchronisation cloud (si demandée)

**ARCHITECTURE HYBRIDE :**
```
┌─────────────────────────────────────────┐
│ TITANE∞ (100% Local - Priorité)        │
│  ↓                                      │
│  ├─ Mode Offline (Défaut)              │
│  │   └─ Ollama Local + localStorage    │
│  │                                      │
│  └─ Mode Online (Optionnel)            │
│      ├─ Auto-detect: Gemini API        │
│      ├─ Auto-detect: Ollama Remote     │
│      └─ On-demand: Fonctions web       │
└─────────────────────────────────────────┘
```

---

## 📋 VALIDATION DES RÈGLES

### Checks Automatiques Obligatoires

**Avant chaque démarrage :**
```bash
./enforce-tauri-only.sh
# Doit retourner : Erreurs: 0, Avertissements: 0
```

**Vérifications requises :**
1. ✅ Aucun serveur HTTP actif
2. ✅ package.json : Scripts HTTP bloqués
3. ✅ tauri.conf.json : Pas de devUrl HTTP
4. ✅ vite.config.ts : HMR off, strictPort on
5. ✅ Processus : Aucun python -m http.server
6. ✅ Processus : Aucun vite preview

---

## 🎯 PRÉFÉRENCES UTILISATEUR - KEVIN THIBAULT

### Priorités de Développement

1. **Architecture Native First**
   - Tauri + Rust + Cargo obligatoire
   - Performance native maximale
   - Intégration système profonde

2. **Offline-First Absolu**
   - Fonctionnement 100% sans internet
   - Données locales persistantes
   - Ollama local prioritaire

3. **Connexions Intelligentes**
   - Gemini API : Auto-connect si disponible
   - Ollama : Local + remote auto-detect
   - Fonctions online : Sur demande explicite

4. **Sécurité et Confidentialité**
   - Données locales uniquement par défaut
   - Pas de télémétrie
   - Pas de tracking
   - Contrôle total utilisateur

---

## 🚀 COMMANDES AUTORISÉES

### Développement
```bash
# ✅ AUTORISÉ - Lancement dev Tauri
npm run dev

# ✅ AUTORISÉ - Build frontend
npm run build

# ✅ AUTORISÉ - Check TypeScript
npm run type-check

# ✅ AUTORISÉ - Validation Tauri-only
./enforce-tauri-only.sh
```

### Production
```bash
# ✅ AUTORISÉ - Compilation Rust
cd src-tauri
cargo build --release

# ✅ AUTORISÉ - Build Tauri complet
npm run tauri build

# ✅ AUTORISÉ - Distribution native
tauri build --target all
```

---

## ❌ COMMANDES INTERDITES

### Interdictions Absolues
```bash
# ❌ INTERDIT - Serveur HTTP Python
python3 -m http.server

# ❌ INTERDIT - Vite preview HTTP
npm run preview

# ❌ INTERDIT - npm start HTTP
npm start

# ❌ INTERDIT - Vite dev direct
vite dev

# ❌ INTERDIT - Serveurs web
serve dist/
http-server dist/
```

**Conséquence :** Ces commandes doivent retourner `exit 1` avec message d'erreur explicite.

---

## 🔐 MÉMORISATION PERMANENTE

Ces règles sont **ENREGISTRÉES DE MANIÈRE PERMANENTE** et doivent être respectées pour :

1. ✅ Toute génération de code future
2. ✅ Tout déploiement
3. ✅ Toute modification de configuration
4. ✅ Toute documentation
5. ✅ Toute assistance technique

**Référence rapide :**
- Utilisateur : **Kevin Thibault**
- Projet : **TITANE∞**
- Déploiement : **Tauri/Rust/Cargo UNIQUEMENT**
- Mode : **100% Local-First**
- Connexions : **Gemini+Ollama Auto, Online On-Demand**

---

## 📊 ARCHITECTURE FINALE VALIDÉE

```
┌───────────────────────────────────────────────────────────────┐
│                    TITANE∞ v16.1.0                            │
│                  Kevin Thibault - 2025                        │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│              🔒 COUCHE DÉPLOIEMENT (NATIF)                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Tauri 2.9.0 (WebView Native)                           │  │
│  │  + Rust Backend (IPC Local)                            │  │
│  │  + Cargo Build System                                  │  │
│  │  = APPLICATION NATIVE .deb / .AppImage / .dmg          │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│              🌍 COUCHE OFFLINE-FIRST (100%)                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ • Ollama Local (AI offline prioritaire)                │  │
│  │ • localStorage (persistance données)                   │  │
│  │ • IndexedDB (données complexes)                        │  │
│  │ • Fonctionnement complet sans internet                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│          🔌 COUCHE ONLINE (OPTIONNELLE)                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Auto-Connect (si disponible):                          │  │
│  │  • API Gemini (détection auto)                         │  │
│  │  • Ollama Remote (détection auto)                      │  │
│  │                                                          │  │
│  │ On-Demand (Kevin Thibault uniquement):                 │  │
│  │  • Recherche web                                        │  │
│  │  • APIs externes                                        │  │
│  │  • Synchronisation cloud                               │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## ✅ VALIDATION FINALE

**Ces règles sont maintenant :**
- ✅ Enregistrées dans `REGLES_PERMANENTES_KEVIN_THIBAULT.md`
- ✅ Appliquées dans package.json (scripts HTTP bloqués)
- ✅ Appliquées dans tauri.conf.json (pas de devUrl)
- ✅ Appliquées dans vite.config.ts (HMR off)
- ✅ Validées par `enforce-tauri-only.sh`
- ✅ Documentées pour référence permanente

**Commande de lancement validée :**
```bash
npm run dev
# → Lance tauri dev (Application native)
# → Mode 100% local-first
# → Gemini+Ollama auto-connect si disponibles
# → Aucun serveur HTTP
```

---

**🔒 MÉMORISATION PERMANENTE CONFIRMÉE**  
**Date :** 21 novembre 2025  
**Utilisateur :** Kevin Thibault  
**Statut :** RÈGLES ABSOLUES ENREGISTRÉES ✅
