# TITANE∞ — Gouvernance de l’environnement de développement

## Objet

Rendre l’environnement de développement reproductible, gouverné et anti-dérive.

## Principes

- L’IDE fait partie de la surface gouvernée.
- La surface active doit être minimale.
- Une fonction critique = un seul outil autorité actif.

## IA — un seul agent autorité

- Un seul agent IA exécutant est autorisé à la fois (écriture, exécution, commit).
- Les autres agents IA doivent être désactivés au niveau workspace.
- Toute exception doit être documentée, justifiée et réversible.

## E2E — un seul runner autorité

- Un seul runner E2E autorité à la fois.
- Runner autorisé : WebdriverIO ou Playwright (jamais les deux actifs simultanément).
- Chaque rapport E2E doit nommer explicitement le runner autorité utilisé.

## Socle recommandé TITANE∞ (VS Code)

- rust-analyzer
- CodeLLDB
- Tauri
- Even Better TOML
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- pnpm (helper uniquement si utilisé)
- Path IntelliSense
- Error Lens
- YAML
- DotENV
- Git : conserver 1–2 outils (GitLens ou GitHub Pull Requests)

## À éviter / supprimer si non requis pour TITANE∞

- Extensions de langages hors scope (C/C++/Go/Unity/Firefox Debugger/.NET/Python).
- TypeScript Nightly et extensions TS expérimentales.
- Outils Remote/Containers non utilisés.
- Doublons de runner Vitest.
- Extensions “open in browser” si elles encouragent une dérive hors Tauri-only.

## Activation / désactivation (workspace)

- Activer uniquement les extensions nécessaires au cycle courant.
- Désactiver les agents IA non autorité et les runners E2E non autorité dans le workspace.
- Réévaluer la liste à chaque changement de périmètre.

## Gestion des exceptions

- Toute exception doit être tracée dans un document de gouvernance avec : date, motif, portée, durée, rollback.
- Une exception sans justification explicite est invalide.