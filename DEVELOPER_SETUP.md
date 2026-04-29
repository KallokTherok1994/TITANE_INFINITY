# TITANE∞ — Guide d'installation développeur

## Environnement requis

| Outil | Version minimum | Installation |
|---|---|---|
| Node.js | 20 LTS | `fnm install 20` ou `nvm install 20` |
| pnpm | 8+ | `corepack enable pnpm` |
| Rust | 1.77 stable | `rustup update stable` |
| Tauri CLI v2 | ^2.0 | `cargo install tauri-cli --version '^2'` |
| Ollama | 0.4+ | [ollama.ai](https://ollama.ai) |
| Git | 2.40+ | Gestionnaire de paquets OS |

### Linux — Dépendances système (Ubuntu/Debian)

```bash
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl wget file \
  libssl-dev libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libglib2.0-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  xdg-utils
```

## Installation du projet

```bash
# 1. Cloner
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installer les dépendances Node
pnpm install

# 3. Vérifier Rust
cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | tail -3
# Attendu : "Finished ... target(s) in ..."
```

## Préparer Ollama

```bash
# Démarrer Ollama (si pas en service)
ollama serve &

# Télécharger le modèle officiel TITANE∞
ollama pull gemma2:2b

# Vérifier la connectivité
curl -s http://127.0.0.1:11434/api/version | python3 -m json.tool
```

## Lancer l'application

### Mode développement (recommandé)

```bash
pnpm run tauri dev
# Ouvre la fenêtre Tauri avec hot-reload Vite
```

### Vite seul (tests frontend rapides)

```bash
pnpm run dev
# Accessible sur http://localhost:1420
```

### Storybook (développement composants)

```bash
pnpm storybook
# Accessible sur http://localhost:6006
```

## Build production

```bash
# Build complet AppImage + DEB
pnpm run tauri build

# Artefacts générés :
# src-tauri/target/release/bundle/appimage/titane-infinity_*.AppImage
# src-tauri/target/release/bundle/deb/titane-infinity_*_amd64.deb
```

## Structure du projet

```
TITANE_INFINITY/
├── src/                    # Frontend React/TypeScript (Ring 3/4)
│   ├── components/         # Composants UI (194 fichiers)
│   ├── contexts/           # React contexts (AnimationContext, LoggingContext)
│   ├── engines/            # Moteurs frontend (Ring 3)
│   ├── hooks/              # React hooks
│   ├── services/           # Services métier (Ring 3)
│   ├── stores/             # État global (Zustand)
│   ├── types/              # Types TypeScript partagés
│   └── utils/              # Utilitaires (invoke.ts = One Door)
├── src-tauri/              # Backend Rust (Ring 1/2)
│   └── src/
│       ├── audio/          # Commandes audio IPC
│       ├── cognitive/      # Moteur cognitif
│       ├── knowledge_base/ # Base de connaissances (211+ domaines)
│       ├── meta/           # Monitoring + explainability
│       └── operators/      # Operators (browser, desktop, ide)
├── data/                   # Données statiques JSON (@data alias)
├── config/                 # Configurations JSON (@config alias)
├── docs/                   # Documentation technique
│   ├── api/                # Typedoc HTML généré
│   └── diagrams/           # Diagrammes Mermaid
├── e2e/                    # Tests E2E Playwright
├── scripts/                # Scripts build/autoheal/governance
│   └── autoheal/           # AutoHeal JSONL + detect_recurrence
└── src/stories/            # Stories Storybook
```

## Alias d'import configurés

```ts
import { Component } from '@/components/MyComponent';      // → src/components/
import { useHook } from '@/hooks/useHook';                 // → src/hooks/
import { safeInvokeCanonical } from '@/utils/invoke';      // ONE DOOR obligatoire
import data from '@data/knowledge_base/entry.json';        // → data/
import cfg from '@config/championChallenger.json';         // → config/
```

## Tests

```bash
# Vitest (tous les tests frontend)
pnpm vitest run

# Test ciblé
pnpm vitest run src/__tests__/omega-provider-tests.test.ts

# Tests Rust
cargo test --manifest-path src-tauri/Cargo.toml

# Tests Rust ciblés (knowledge base)
cargo test --manifest-path src-tauri/Cargo.toml --lib -- knowledge_base_default::tests

# E2E Playwright (dev server requis dans un autre terminal)
pnpm run test:e2e
```

## Gouvernance (obligatoire avant tout commit)

```bash
# 1. Détecter les régressions AutoHeal
bash scripts/autoheal/detect_recurrence.sh
# Attendu : PASS: G_AH_RECURRENCE_GUARD_PASS

# 2. Vérifier les instructions kernel
bash scripts/verify_instructions.sh
# Attendu : SUMMARY: PASS=33 FAIL=0
```

## Variables d'environnement

| Variable | Valeur par défaut | Usage |
|---|---|---|
| `VITE_OLLAMA_URL` | `http://127.0.0.1:11434` | URL serveur Ollama |
| `VITE_OLLAMA_MODEL` | `gemma2:2b` | Modèle Ollama |
| `VITE_APP_ENV` | `development` | Environnement |
| `TITANE_E2E_ANDROID_DEVICE` | `0` | Active les tests E2E Android |

## Erreurs courantes

### `typedoc: not found`
```bash
# Utiliser npx pour la génération des docs
npx --yes typedoc --options typedoc.json
```

### `cargo check` échoue avec `E0603`
Vérifier que les modules Rust sont correctement déclarés dans `mod.rs` et `lib.rs`.

### Port 1420 déjà utilisé
```bash
lsof -ti :1420 | xargs kill -9
```

### Ollama non accessible
```bash
systemctl --user start ollama  # si service systemd
# ou
ollama serve &                  # démarrage manuel
```
