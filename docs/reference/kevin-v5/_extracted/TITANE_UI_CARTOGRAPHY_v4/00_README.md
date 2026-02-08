# TITANE∞ — Cartographie UI/UX (v3, ultra-détaillée)

Objectif : fournir une **carte complète, exploitable par dev/agents**, de l’interface TITANE∞ (shell, navigation, pages, composants, états, erreurs), + **recommandations**, **risques**, **gates** et **matrice de tests**.

> Source : captures d’écran (DEV + TITANE + TIME) et signaux visibles (toasts, erreurs, fallback, widgets).

---

## 1) Comment utiliser ce dossier

### Pour débugger vite (triage)
1. Ouvrir `issues/ISSUES_REGISTER.md` (liste priorisée + symptômes + hypothèses).
2. Aller à `architecture/CONTRACTS_UI_BACKEND.md` (contrats attendus).
3. Vérifier la page concernée dans `pages/...`.
4. Exécuter les scénarios dans `qa/TEST_MATRIX.md`.

### Pour améliorer l’UX
- Lire `architecture/SHELL_GLOBAL.md` puis `components/PATTERNS_UX.md`.
- Appliquer les recommandations dans `recommendations/UX_ROADMAP.md`.

### Pour sceller Beta (anti-régression)
- Appliquer `qa/GATES_RELEASE.md` + `qa/SMOKE_CHECKLIST.md`.
- Ajouter traces obligatoires : `architecture/OBSERVABILITY.md`.

---

## 2) Structure

- `architecture/`
  - Shell global, navigation, layout cognitif, états, contrats, observabilité
- `pages/`
  - Cartographie page par page (DEV/TITANE/TIME/etc.)
- `components/`
  - Bibliothèque de composants, tokens, patterns, accessibilité
- `issues/`
  - Registre des erreurs/warnings/blocages visibles et potentiels
- `qa/`
  - Matrice de tests (smoke, e2e, non-régression), checklists, gates
- `data/`
  - JSON route map, index des captures, dictionnaires d’états

---

## 3) Principes non négociables (rappel)
- **Zéro silence** (UI, IPC, chat, états chargement) : un écran ne doit jamais « rester vide » sans explication + action.
- **Local-first / Tauri-only** : aucun hard-dependency cloud pour booter l’UI.
- **Always Respond** côté chat : réponse ou erreur explicite dans l’UI.

