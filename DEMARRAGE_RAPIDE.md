# 🚀 Guide de démarrage rapide — TITANE_INFINITY

**Version :** 26.2.0  
**Date :** 2025-12-21

---
# 🚀 Guide de démarrage rapide — TITANE_INFINITY

**Version :** 26.2.0  
**Date :** 2025-12-21

---

## ✅ Prérequis

- **Linux** (repo actuel : Ubuntu)
- **Rust** (pour Tauri) : `rustc --version` doit fonctionner
- **Node.js** : le repo fournit une toolchain locale (recommandée)
- **pnpm** : via Corepack (le repo bloque `npm install`)

---

## ⚡ Démarrage express (recommandé)

### 1) Utiliser la toolchain Node du repo

```bash
export PATH="$PWD/.tools/node/current/bin:$PATH"
node -v
corepack -v
```

### 2) Installer les dépendances (pnpm)

```bash
corepack enable
pnpm -v
pnpm install
```

### 3) Lancer en mode dev (Tauri + Vite)

```bash
pnpm run dev
```

---

## 🧪 Commandes utiles

```bash
pnpm run check          # TypeScript
pnpm run lint           # ESLint
pnpm run lint:fix       # ESLint fix
pnpm run test           # Tests Vitest (run)
pnpm run test:tauri     # Tests Tauri/Rust
pnpm run build          # Build Vite
```

---

## 🩺 Diagnostic rapide

### Erreur : "Ce repo utilise pnpm" / install bloqué

Cause : tentative d’utiliser `npm install`.  
Solution :

```bash
corepack enable
pnpm install
```

### Erreur : modules manquants (react, vite, eslint…)

Cause : dépendances non installées.  
Solution :

```bash
pnpm install
```

### Erreurs TypeScript / ESLint

```bash
pnpm run check
pnpm run lint
```

---

## 🛠️ Option : script utilitaire

Le repo fournit `./titane.sh` (utile si l’environnement ou les dépendances sont incohérents) :

```bash
./titane.sh repair
```

