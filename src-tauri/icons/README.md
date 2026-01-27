# Icônes TITANE INFINITY v26.4.0

## 🎨 Design

L'icône officielle de TITANE INFINITY représente le **symbole ∞ (infini)** stylisé avec un dégradé holographique futuriste.

### Caractéristiques Visuelles
- **Symbole**: ∞ (Infini) — représente les capacités infinies et l'évolution continue
- **Couleurs**: 
  - Bleu Titanium électrique: `rgb(0, 150, 255)`
  - Cyan holographique: `rgb(0, 255, 200)`
  - Fond spatial: `rgb(10, 15, 35)` (bleu très sombre)
- **Effets**: 
  - Dégradé horizontal bleu → cyan
  - Lueur holographique sur les grandes tailles (≥128px)
  - Lissage gaussien pour effet futuriste

## 📦 Fichiers Générés

### Icônes Principales
- `icon.png` (512×512) — Icône principale haute résolution
- `icon.ico` — Format Windows multi-résolutions (16, 32, 48, 64, 128, 256px)
- `icon.icns` — Format macOS multi-résolutions

### Tailles Standard
- `32x32.png` — Petite taille (barre de tâches)
- `64x64.png` — Taille moyenne
- `128x128.png` — Grande taille
- `128x128@2x.png` (256×256) — Retina/HiDPI
- `256x256.png` — Très grande taille

### Windows Store (UWP)
- `Square30x30Logo.png` à `Square310x310Logo.png` (10 tailles)
- `StoreLogo.png` (50×50)

## 🔧 Génération

Les icônes sont générées automatiquement via Python (Pillow):

```bash
# Générer toutes les icônes
python3 generate_titane_icon.py

# Convertir en ICO/ICNS
python3 convert_formats.py
```

### Scripts Disponibles
1. **`generate_titane_icon.py`** — Génère toutes les tailles PNG
2. **`convert_formats.py`** — Convertit PNG → ICO/ICNS

### Dépendances
```bash
pip install Pillow icnsutil
```

## 🎯 Utilisation dans Tauri

Les icônes sont automatiquement utilisées par Tauri via `tauri.conf.json`:

```json
{
  "icon": [
    "icons/32x32.png",
    "icons/128x128.png",
    "icons/128x128@2x.png",
    "icons/icon.icns",
    "icons/icon.ico"
  ],
  "trayIcon": {
    "iconPath": "icons/icon.png"
  }
}
```

## 📏 Spécifications Techniques

| Fichier | Format | Taille | Bits/Pixel | Compression |
|---------|--------|--------|------------|-------------|
| icon.png | PNG | 512×512 | RGBA (32-bit) | Optimisé |
| icon.ico | ICO | Multi | 32-bit | 6 résolutions |
| icon.icns | ICNS | Multi | 32-bit | Format macOS |
| 32x32.png | PNG | 32×32 | RGBA | ~220 bytes |
| 128x128.png | PNG | 128×128 | RGBA | ~375 bytes |
| 256x256.png | PNG | 256×256 | RGBA | ~778 bytes |

## 🔄 Rebuild

Après modification des icônes, rebuild l'application:

```bash
pnpm tauri build
```

Les icônes seront automatiquement intégrées dans:
- **AppImage**: Icône embarquée dans l'exécutable
- **DEB**: `/usr/share/icons/hicolor/` + desktop entry
- **Windows**: Ressource ICO dans l'EXE
- **macOS**: Bundle d'application avec ICNS

## 🎨 Personnalisation

Pour modifier le design, éditez `generate_titane_icon.py`:

```python
# Couleurs
GRADIENT_START = (0, 150, 255)  # Bleu titanium
GRADIENT_END = (0, 255, 200)    # Cyan holographique
BG_COLOR = (10, 15, 35, 255)    # Fond spatial
```

Puis régénérez:
```bash
python3 generate_titane_icon.py
python3 convert_formats.py
```

## 📜 Historique

- **v26.4.0** (2026-01-26) — Création de l'icône officielle
  - Symbole ∞ (infini) stylisé
  - Dégradé bleu titanium → cyan holographique
  - Support complet Windows/Linux/macOS

## 📄 Licence

Icônes © 2026 Kevin Thibault (TITANE∞)  
Propriété de TITANE INFINITY — Tous droits réservés.
