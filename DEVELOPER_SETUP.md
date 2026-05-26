# TITANE∞ — Guide d'installation développeur

> Status after Windows migration: Windows native is now the default primary development rail. Use `docs/windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md` as the canonical Windows setup and proof guide. This document remains a cross-platform reference; for Windows-first quickstart follow the Windows guide.

**Version:** v35.1.9 | **Dernière mise à jour:** 2026-05-21

## Prérequis

| Outil        | Version minimum | Installation recommandée                                      |
| ------------ | --------------- | ------------------------------------------------------------- |
| Node.js      | 20 LTS          | `fnm install 20` ou `nvm install 20`                          |
| pnpm         | 10.30.2         | `corepack enable && corepack prepare pnpm@10.30.2 --activate` |
| Rust         | 1.77 stable     | `rustup update stable`                                        |
| Tauri CLI v2 | ^2.0            | `cargo install tauri-cli --version '^2'`                      |
| Git          | 2.40+           | gestionnaire de paquets OS                                    |
| Ollama       | 0.4+            | [ollama.ai](https://ollama.ai)                                |

---

## Prérequis Windows 11 (rail primaire)

> Windows 11 est le DEV_HOST primaire. Voir le guide canonique : [`docs/windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md`](docs/windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md).

| Composant                                     | Requis      | Notes                                                     |
| --------------------------------------------- | ----------- | --------------------------------------------------------- |
| Microsoft C++ Build Tools 2022                | Obligatoire | Charge de travail C++ + Windows SDK + chaîne MSVC         |
| Microsoft Edge WebView2 Runtime               | Obligatoire | Inclus Windows 11 ; installer manuellement sur Windows 10 |
| Rust toolchain MSVC                           | Obligatoire | `x86_64-pc-windows-msvc` via `rustup`                     |
| WiX Toolset v3                                | Pour MSI    | Requis pour `tauri build --bundles msi`                   |
| Windows VBSCRIPT (fonctionnalité optionnelle) | Pour MSI    | Peut être requis par le compilateur WiX                   |
| `icon.ico` multi-résolution                   | Obligatoire | Autorité icône Windows                                    |

> **Commandes PowerShell-first.** Utiliser `corepack pnpm` — jamais `npm install`.

---

## Dépendances système Linux (Ubuntu/Debian)

```bash
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl wget file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libglib2.0-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  xdg-utils
```

---

## Installation du projet

```bash
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
corepack pnpm install
```

---

## Configuration de l'environnement

```bash
cp .env.example .env
```

Éditez `.env` pour configurer les clés API (providers IA externes optionnels) :

```
# Providers IA externes (optionnels — fallback vers Ollama local si absent)
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...

# Ollama (local — valeurs par défaut si Ollama tourne sur 127.0.0.1:11434)
VITE_OLLAMA_BASE_URL=http://127.0.0.1:11434
```

Pour activer les providers externes en dev :

```bash
VITE_ENABLE_EXTERNAL_AI=1 pnpm run dev
```

---

## Commandes de développement

```bash
pnpm run dev            # Lancer l'app en mode développement (Vite + Tauri)
pnpm run check          # Vérification TypeScript (tsc --noEmit)
pnpm run lint           # ESLint
pnpm run test --run     # Tests Vitest (non-interactif, tous les fichiers)
pnpm run build          # Build Vite frontend
pnpm run format:check   # Vérification Prettier (sans modification)
```

Build natif Tauri (binaire desktop — on demand) :

```bash
cargo tauri build --config src-tauri/tauri.conf.json
```

---

## Configuration VS Code (recommandée)

Extensions à installer :

| Extension                 | Identifiant                 |
| ------------------------- | --------------------------- |
| Tauri                     | `tauri-apps.tauri-vscode`   |
| Rust Analyzer             | `rust-lang.rust-analyzer`   |
| ESLint                    | `dbaeumer.vscode-eslint`    |
| Prettier                  | `esbenp.prettier-vscode`    |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` |

Le fichier `.vscode/settings.json` du projet configure automatiquement :

- `editor.formatOnSave` avec Prettier
- `chat.mcp.enabled: true` pour les agents MCP

---

## Configuration MCP et Ollama (développement)

Le fichier `.vscode/mcp.json` définit les serveurs MCP disponibles pour GitHub Copilot et les agents Claude Code. Aucune configuration manuelle requise si vous utilisez VS Code avec les extensions ci-dessus.

Vérification de la frontière Ollama :

```bash
pnpm run verify:ollama:boundary
```

Modèles Ollama utilisés :

- **Chat TITANE (runtime produit)** : `gemma2:2b`
- **Dev/Copilot (VS Code conversation)** : `qwen3.5:9b`

---

## Design system (référence)

Avant de modifier des composants ou du CSS, consultez :

- [`.claude/frontend-ui-ux-guidelines.md`](.claude/frontend-ui-ux-guidelines.md) — règles du design system
- [`docs/ui/DESIGN_SYSTEM.md`](docs/ui/DESIGN_SYSTEM.md) — référence tokens + a11y

Règle principale : ne jamais utiliser de valeurs hex hardcodées ou de classes `gray-*`/`slate-*`. Utiliser exclusivement les tokens `titanium-*` ou les CSS custom properties `var(--color-*)`.

---

## Guide de tests

```bash
# Tous les tests (mode non-interactif)
pnpm run test --run

# Un fichier spécifique
pnpm vitest run src/__tests__/services/ai/canonicalDiscernmentKernel.test.ts

# Avec coverage
pnpm vitest run --coverage

# Watch mode (développement)
pnpm vitest
```

Tests Rust :

```bash
cargo test --bin titane-infinity
```

---

## Troubleshooting

**pnpm install échoue avec des erreurs Rust/native**

```bash
rustup update stable
cargo clean
pnpm install
```

**L'app ne démarre pas (WebKit/GTK manquant)**

Vérifier que toutes les dépendances système Linux sont installées (voir section ci-dessus).

**Erreur `EPERM` ou conflit node_modules**

```bash
rm -rf node_modules
pnpm install
```

**Tauri ne trouve pas le binaire Rust**

Vérifier que `~/.cargo/bin` est dans le `PATH`, puis :

```bash
cargo tauri dev --config src-tauri/tauri.conf.json
```

**Tests échouent après un merge**

```bash
pnpm run check   # Vérifier les erreurs TypeScript en premier
pnpm run test --run
```

**Reset complet de l'environnement de dev**

```bash
rm -rf node_modules dist src-tauri/target
pnpm install
cargo build --manifest-path src-tauri/Cargo.toml
```
