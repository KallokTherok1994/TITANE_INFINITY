# TITANE∞ — Dépannage (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Problèmes d'installation

### `dpkg -i` échoue avec des dépendances manquantes

```bash
# Résoudre les dépendances manquantes
sudo apt-get install -f
```

### L'AppImage ne se lance pas

```bash
# Vérifier les permissions
chmod +x Titan-Stable_27.0.5_amd64.AppImage

# Vérifier les dépendances FUSE
sudo apt-get install libfuse2

# Lancer avec log
./Titan-Stable_27.0.5_amd64.AppImage --verbose 2>&1 | head -50
```

---

## Problèmes au lancement

### L'application ne démarre pas (depuis les sources)

```bash
# Vérifier Node.js
node --version  # Doit être ≥ 20.x

# Vérifier pnpm
pnpm --version

# Vérifier Rust
rustc --version

# Vérifier Tauri CLI
tauri --version

# Nettoyer et réinstaller
pnpm run clean:all
pnpm install
pnpm run dev
```

### Erreur "pnpm non trouvé"

```bash
# Installer pnpm
npm install -g pnpm
# ou
curl -fsSL https://get.pnpm.io/install.sh | sh
```

### Erreur de compilation Rust

```bash
# Mettre à jour Rust
rustup update stable

# Installer les dépendances système (Linux)
sudo apt-get install libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev libssl-dev libasound2-dev
```

---

## Problèmes de fournisseur IA

### "Aucune réponse" ou timeout

1. Vérifiez votre connexion Internet
2. Vérifiez que la clé API est correcte dans les Paramètres
3. Testez le fournisseur directement (ex : curl vers l'API OpenAI)
4. Essayez un autre fournisseur

### Ollama ne répond pas

```bash
# Vérifier que Ollama est actif
curl http://127.0.0.1:11434/api/tags

# Si non actif, démarrer Ollama
ollama serve
# ou
pnpm run ollama:start

# Vérifier les modèles disponibles
ollama list
```

---

## Problèmes audio

### Le microphone ne fonctionne pas

1. Vérifiez les permissions microphone dans les paramètres système
2. Vérifiez que l'application Tauri a accès au microphone (permissions Tauri)
3. Redémarrez l'application après avoir accordé les permissions

### Le TTS ne produit pas de son

1. Vérifiez le volume système
2. Vérifiez que le profil vocal est configuré dans les Paramètres
3. Consultez les logs DevTools pour les erreurs TTS

---

## Problèmes d'interface

### L'interface est blanche / ne charge pas

```bash
# Vérifier les erreurs console (DevTools du navigateur intégré Tauri)
# En mode dev : F12 ou Ctrl+Shift+I pour ouvrir les DevTools
```

### Les messages ne s'affichent pas

1. Vérifiez la connexion Internet
2. Vérifiez que le fournisseur est joignable
3. Regardez les logs dans le centre DevTools

---

## Collecter les informations pour un rapport de bug

Avant de soumettre une issue, collectez :

```bash
# Informations système
node --version
pnpm --version
rustc --version 2>/dev/null || echo "N/A"
uname -a

# Logs application
# DevTools → Logs (dans l'interface TITANE∞)
```

**Signaler une issue :** https://github.com/KallokTherok1994/TITANE_INFINITY/issues

---

*Documentation en anglais : [docs/user/en/troubleshooting.md](../en/troubleshooting.md)*
