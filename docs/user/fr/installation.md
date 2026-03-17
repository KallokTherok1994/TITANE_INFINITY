# TITANE∞ — Installation (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Systèmes supportés

> Statut : PROVEN pour v27.0.5 (dernière release binaire publiée)

| Système | Support | Notes |
|---|---|---|
| Ubuntu 20.04+ | ✅ PROVEN | AppImage + DEB testés |
| Debian 11+ | ✅ PROVEN | DEB testé |
| Linux Mint 20+ | ✅ PROVEN | AppImage testé |
| Pop!_OS 20.04+ | ✅ PROVEN | AppImage testé |
| Windows | ⚠️ PARTIAL | Support déclaré, non prouvé en CI |
| macOS | ⚠️ PARTIAL | Support déclaré, non prouvé en CI |

---

## Option A — Installer le binaire publié (Linux, recommandé)

### 1. Télécharger la dernière release

```bash
# DEB (Debian/Ubuntu)
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_amd64.deb

# AppImage (universel Linux)
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/Titan-Stable_27.0.5_amd64.AppImage
```

### 2. Installer

```bash
# Pour le DEB :
sudo dpkg -i TITANE-Infinity_27.0.5_amd64.deb
sudo apt-get install -f  # Résoudre dépendances si nécessaire

# Pour l'AppImage :
chmod +x Titan-Stable_27.0.5_amd64.AppImage
./Titan-Stable_27.0.5_amd64.AppImage
```

### 3. Vérifier les checksums (recommandé)

```bash
cat deployment/latest/SHA256SUMS_v27.0.5.txt
sha256sum -c SHA256SUMS_v27.0.5.txt
```

---

## Option B — Installer depuis les sources (développeurs)

> Pour installer depuis les sources, consultez : [docs/dev/fr/setup-environnement.md](../../../dev/fr/setup-environnement.md)

### Prérequis minimaux

- Node.js ≥ 20.x
- pnpm ≥ 9.x
- Rust (édition 2021)
- Cargo (stable)
- Tauri CLI v2.x

```bash
# Cloner le dépôt
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# Installer les dépendances
pnpm install

# Lancer en mode développement
pnpm run dev
```

---

## Configuration initiale

Après installation, TITANE∞ nécessite la configuration d'au moins un fournisseur IA.

Consultez : [Paramètres, sécurité et confidentialité](./parametres-securite-et-confidentialite.md)

---

## Problèmes d'installation ?

Consultez : [Dépannage](./depannage.md)

---

*Documentation en anglais : [docs/user/en/installation.md](../en/installation.md)*
