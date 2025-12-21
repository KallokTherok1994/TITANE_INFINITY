# 🚀 Guide de démarrage rapide — TITANE_INFINITY

**Version :** 26.2.0  
**Date :** 2025-12-21

---

## ✅ Prérequis

- **Linux** (repo actuel : Ubuntu)  
- **Rust** (pour Tauri) : `rustc --version` doit fonctionner
- **Node.js** : le repo fournit une toolchain locale (recommandée)
- **pnpm** : obligatoire (le repo bloque `npm install`)

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
pnpm test -- --run      # Tests frontend
pnpm run test:tauri     # Tests Tauri/Rust
pnpm run build          # Build Vite
```

---

## 🩺 Diagnostic rapide

### Erreur : "Ce repo utilise pnpm" / install bloqué

Cause : utilisation de `npm install`.  
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

---

## 🛠️ Script utilitaire

Le repo fournit aussi :

```bash
./titane.sh repair
```

(utile si l’environnement Node/Rust ou les dépendances sont dans un état incohérent)
