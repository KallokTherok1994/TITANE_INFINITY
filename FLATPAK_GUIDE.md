# 🚀 GUIDE RAPIDE — VS Code Flatpak

## Problème résolu

VS Code installé via Flatpak ne peut pas accéder directement à Node.js, pnpm et Cargo installés sur votre système hôte.

## ✅ Solution : Wrappers flatpak-spawn

J'ai créé des scripts wrapper qui permettent d'exécuter les commandes depuis le système hôte.

---

## 📋 Commandes disponibles

### 🚀 Lancer l'application en mode dev
```bash
./tauri-flatpak.sh dev
```

### 🔨 Build de production
```bash
./tauri-flatpak.sh build
```

### 🔍 Vérifier la compilation Rust
```bash
./tauri-flatpak.sh check
```

### 🧪 Lancer les tests
```bash
./tauri-flatpak.sh test
```

### ✅ Validation complète du projet
```bash
./tauri-flatpak.sh validate
```

---

## 📦 Gestion des dépendances Node.js

### Installer les dépendances
```bash
./pnpm-host.sh install
```

### Ajouter une dépendance
```bash
./pnpm-host.sh add nom-du-package
```

### Mettre à jour
```bash
./pnpm-host.sh update
```

---

## ✅ État actuel du système

Vérifications effectuées :

- ✅ **Node.js v22.21.0** installé sur système hôte
- ✅ **pnpm v10.23.0** installé sur système hôte
- ✅ **Cargo v1.91.1** installé sur système hôte
- ✅ **WebKit 2.48.7 (4.1)** installé sur système hôte
- ✅ **Dépendances Node.js** installées (434ms)
- ✅ **Compilation Rust** réussie (70 warnings, 0 erreur)
- ✅ **Validation complète** : 8/8 tests passés

---

## 🎯 Pour développer

**Workflow recommandé :**

1. **Éditer le code** dans VS Code normalement
2. **Tester en temps réel** :
   ```bash
   ./tauri-flatpak.sh dev
   ```
3. **Valider avant commit** :
   ```bash
   ./tauri-flatpak.sh validate
   ```

---

## 🔧 Dépannage

### Si "command not found"
```bash
chmod +x tauri-flatpak.sh pnpm-host.sh
```

### Si problème de PATH
Les wrappers ajoutent automatiquement `source ~/.cargo/env` pour Cargo.

### Pour exécuter une commande custom
```bash
flatpak-spawn --host bash -c "cd '$PWD' && source ~/.cargo/env && votre_commande"
```

---

## 📝 Notes techniques

**Pourquoi ces wrappers ?**

VS Code Flatpak tourne dans un environnement sandbox isolé. `flatpak-spawn --host` permet d'exécuter des commandes sur le système hôte, en dehors du sandbox.

**Fichiers créés :**
- `tauri-flatpak.sh` — Wrapper principal pour Tauri
- `pnpm-host.sh` — Wrapper pour pnpm

**Avantages :**
- ✅ Pas besoin de quitter VS Code
- ✅ Utilise les outils du système hôte
- ✅ Pas de duplication d'installation
- ✅ Performances natives

---

## 🎉 Tout est prêt !

TITANE∞ v17 est maintenant **100% opérationnel** depuis VS Code Flatpak.

Pour lancer l'application :
```bash
./tauri-flatpak.sh dev
```

**Bon développement ! 🚀**
