# 🔥 SUPER PROMPT #1 — TITANE∞ FRONTEND FINAL FORM

**Correction complète + Finalisation UI/UX + Design System + Responsive + Performance**

---

## 📋 Métadonnées

- **Priorité** : 🔥 P0 (Critique)
- **Complexité** : ⭐⭐⭐⭐ (Élevée)
- **Durée estimée** : 2-4h (selon taille du codebase)
- **Dépendances** : Aucune
- **Output** : Code production-ready + Documentation
- **Outils** : GitHub Copilot Chat + VS Code

---

## 🎯 Objectif

Corriger, simplifier et **FINALISER** l'interface de TITANE∞ pour qu'elle soit :

- ✅ Stable et sans bugs visuels
- ✅ Cohérente avec un Design System unifié
- ✅ Performante (bundle < 500KB, TTI < 1.2s)
- ✅ Responsive (mobile-first)
- ✅ Basée sur **Titane Métallique + Violet Énergie**

---

## 🚀 Super Prompt (Copier-coller dans Copilot Chat)

````markdown
@workspace

Tu es mon copilote expert Frontend/UX senior sur le projet **TITANE_INFINITY**.

Ton rôle : **corriger, simplifier et FINALISER l'interface de TITANE∞** pour qu'elle soit :
- stable,
- cohérente,
- performante,
- responsive,
- basée sur un **Design System unifié**,
- alignée avec l'esthétique **Titane Métallique + Violet Énergie**.

Tu dois travailler SUR le code existant (React + TypeScript + Vite + Tailwind + Tauri) et produire du **code réel**, prêt à être commité.
Pas de pseudo-code, pas de TODO abstrait : des fichiers concrets, complets.

---

## 1. CONTEXTE PROJET (À ANALYSER EN PREMIER)

Parcours le workspace et établis une vision claire de :

1. **Stack** :
   - React 18 + TypeScript
   - Vite
   - Tailwind (présent mais pas encore central)
   - Tauri v2 (pour le shell desktop)
   - Styles actuels : Tailwind + CSS modules + éventuel CSS-in-JS

2. **Structure actuelle** (à détecter) :
   - Dossier `src/`
   - Apps multiples (Chat, DevTools, Settings, System, autres…)
   - Composants UI communs
   - Hooks / utils / stores

3. **Problèmes connus** :
   - Trop d'« apps » parallèles (≈14 concepts)
   - 3 systèmes de styles concurrents
   - Palette non centralisée (couleurs hardcodées)
   - Responsive mobile incomplet ou cassé
   - Bundle trop lourd, pas assez de code splitting

📌 **Objectif de cette section** :
Générer un **court rapport de diagnostic** dans un fichier :

- `docs/frontend/FRONTEND_DIAGNOSTIC_TITANE.md`

Contenu attendu :
- Liste des apps détectées
- Liste des systèmes de styles (où et comment utilisés)
- Résumé des principaux problèmes (architecture, styles, responsive, perf)

---

## 2. ARCHITECTURE CIBLE FRONTEND TITANE∞

Tu dois converger vers cette architecture cible :

```text
src/
 ├─ apps/
 │   ├─ chat/         → Chat principal TITANE∞
 │   ├─ devtools/     → DevTools et monitoring système
 │   ├─ settings/     → Préférences, thèmes, intégrations, personas
 │   └─ system/       → Vue système (process, kernels, health)
 ├─ components/
 │   ├─ ui/           → Boutons, inputs, badges, cards, modals, tabs...
 │   ├─ layout/       → Shell, Sidebar, TopBar, Panels, Drawers, Grid
 │   └─ feedback/     → Toaster, alerts, loaders/skeletons, empty states
 ├─ design-system/
 │   ├─ tokens.ts     → Design tokens en TypeScript
 │   ├─ css-vars.css  → Variables CSS globales (dark mode-ready)
 │   └─ tailwind.config.ts (ou tailwind.config.ts à la racine)
 ├─ hooks/
 ├─ stores/
 └─ utils/
```

🎯 **Mission** :

* Reclasser/réorganiser le minimum nécessaire pour se rapprocher de cette structure,
* Sans tout casser d'un coup : tu privilégies une migration progressive, mais **cohérente**.

---

## 3. DESIGN SYSTEM TITANE∞ — VERSION FINALE

Tu dois créer et/ou consolider un **Design System unique** basé sur :

* **Palette Titane Métallique** (gris/titane, argent, charbon)
* **Violet Énergie** (boutons principaux, accents)
* **Sage / verts subtils** (accents doux, respirations visuelles)
* Couleurs sémantiques : success, error, warning, info

### 3.1. Fichier `src/design-system/css-vars.css`

Crée (ou remplace) un fichier avec :

* Un bloc `:root` contenant toutes les variables CSS :

  * Couleurs primary/secondary/background/surface/border/text
  * Couleurs sémantiques (success, error, warning, info)
  * Radius, spacing, shadow, durations, easing
* Spécial **dark mode** (base Titane∞ = dark) avec éventuel bloc `[data-theme="dark"]`.

Exemples de noms (à utiliser et respecter) :

* `--color-bg-primary`
* `--color-bg-elevated`
* `--color-border-subtle`
* `--color-text-primary`
* `--color-accent-violet`
* `--shadow-soft`, `--shadow-strong`
* `--radius-sm | md | lg | full`

Intègre explicitement la logique visuelle Titane∞ :

* Backgrounds : charbon foncé / graphite
* Surfaces : gris métalliques
* Accents : violet profond + glow subtil
* Rare accents sage (pour zones de respiration)

### 3.2. Fichier `src/design-system/tokens.ts`

Crée un module TypeScript exportant les mêmes tokens en objet JS/TS :

```ts
export const colors = {
  bg: {
    primary: "var(--color-bg-primary)",
    elevated: "var(--color-bg-elevated)",
    // ...
  },
  text: {
    primary: "var(--color-text-primary)",
    muted: "var(--color-text-muted)",
    // ...
  },
  accent: {
    violet: "var(--color-accent-violet)",
    // ...
  },
  semantic: {
    success: "var(--color-semantic-success)",
    error: "var(--color-semantic-error)",
    // ...
  },
};

// Idem pour radius, spacing, shadows, etc.
```

📌 **Ce fichier doit devenir la source de vérité TypeScript** pour tous les composants UI.

### 3.3. Tailwind — configuration alignée sur les tokens

Mets à jour `tailwind.config.(ts|cjs)` pour :

* Utiliser les **CSS variables** comme base :

  * `colors`, `borderRadius`, `boxShadow`, `spacing`, `fontSize`, etc.
* Définir les breakpoints :

  * `sm`: 375px
  * `md`: 768px
  * `lg`: 1024px
  * `xl`: 1280px

Ajoute :

* Des utilitaires pour scrollbar, focus-ring, transitions cohérentes.

🎯 **Objectif** :
Tout nouveau composant doit pouvoir se construire uniquement avec :

* Tailwind + CSS vars + quelques classes utilitaires.

---

## 4. UNIFICATION DES STYLES (SUPPRESSION DU CHAOS CSS)

Tu dois :

1. **Identifier** :

   * Tous les `*.module.css`
   * Tous les blocs CSS-in-JS éventuels (Emotion, styled-components, etc.)
   * Les fichiers `.css` globaux redondants

2. **Plan d'action** :

   * Pour chaque composant critique (layout global, boutons, inputs, cartes, modals…) :

     * Remplacer le style existant par :

       * des classes Tailwind,
       * ou des classes utilitaires basées sur les variables CSS (via `@apply` si nécessaire).
   * Réduire progressivement l'usage de CSS modules / CSS-in-JS jusqu'à :

     * **0 CSS-in-JS**,
     * CSS modules seulement là où nécessaire (et idéalement très peu).

3. **Priorité** :

   * Layout global
   * Navigation (Sidebar, TopBar, Mobile Nav)
   * Chat area
   * DevTools panel
   * Settings de base

À chaque refactor de composant :

* Tu simplifie la structure HTML,
* Tu appliques la palette Titane∞,
* Tu relies tout aux tokens (pas de couleurs hardcodées type `#000`, `#111`).

---

## 5. LAYOUT TITANE∞ — SHELL + SIDEBAR + CHAT + DEVTOOLS

Tu dois construire une base de layout générique :

### 5.1. Créer `src/components/layout/AppShell.tsx`

Responsibilities :

* Gestion du **layout principal 3 colonnes** sur desktop :

  * Sidebar (gauche)
  * Chat (centre)
  * DevTools (droite)
* Gestion du **layout 2 colonnes** sur tablette
* Gestion du **layout 1 colonne + navigation mobile** sur smartphone

Caractéristiques :

* Dark mode natif
* Utilisation intensive de Tailwind + tokens
* Zones clairement nommées (`data-region="sidebar"`, etc.)

### 5.2. Créer/Adapter :

* `Sidebar.tsx`

  * Liste des conversations
  * Search bar
  * Bouton « Nouveau »
  * Section raccourcis (DevTools, Settings, System)

* `TopBar.tsx`

  * Titre de l'espace
  * Indicateurs (status kernel, mémoire, etc.) en mode badge
  * Accès rapide vers Settings / System

* `MainChat.tsx`

  * Zone de messages
  * Input docké en bas
  * Support des états :

    * vide
    * en cours (stream)
    * erreur
    * historique long

* `DevToolsDock.tsx`

  * Panel collapsible à droite sur desktop
  * Drawer sur mobile/tablette
  * Affichages : logs, métriques, status engines

* `MobileNav.tsx`

  * Navigation bottom pour mobile : Chat / DevTools / Settings / System
  * Icônes + libellés courts
  * Utilise la palette (accent violet, surface métallique)

🎯 **Objectif** :
En un seul coup d'œil, on comprend :

* où écrire,
* où lire les réponses,
* où monitorer,
* où configurer.

---

## 6. RESPONSIVE DESIGN — MOBILE-FIRST

Implémente un comportement clair :

* **Mobile (≤ 480px)** :

  * 1 seule zone visible à la fois (Chat OU DevTools OU Settings)
  * Navigation via `MobileNav` (bottom)
  * Sidebar accessible via bouton/menu

* **Tablet (768px)** :

  * Sidebar + Chat
  * DevTools accessible en drawer/overlay

* **Desktop (≥ 1024px)** :

  * Sidebar | Chat | DevTools en colonnes
  * Settings/System en vues dédiées mais même shell

Utilise Tailwind pour :

* `hidden`, `flex`, `grid`, `lg:flex`, `md:grid`, etc.
* Pas de media queries hardcodées dans du CSS custom sauf cas très spécifiques.

---

## 7. PERFORMANCE UI — CLEANUP & OPTIMISATION

Tu dois :

1. **Activer le code splitting** là où nécessaire :

   * Lazy-load des apps `DevTools` et `Settings` via `React.lazy`/`Suspense`.
2. **Supprimer** les dépendances inutiles côté frontend :

   * Libs de UI non utilisées
   * Polices non indispensables chargées en dur
3. **Limiter** les re-renders :

   * Utiliser `memo`/`useMemo`/`useCallback` avec parcimonie mais intelligemment
   * Découper les gros composants en sous-parties stables
4. **Prévoir** des loaders/design skeletons pour :

   * Chat initial
   * DevTools panel
   * Settings lourds

Objectif :

* **Bundle final < 500KB** (sans compter fonts)
* **Time-To-Interactive < 1.2s** sur machine raisonnable

---

## 8. RÈGLES GÉNÉRALES DE TRAVAIL

* Tu travailles **fichier par fichier**, en expliquant brièvement les modifications dans les commentaires ou dans la description de sortie.
* Tu ne laisses **aucun `TODO` vague** : soit tu fais, soit tu documentes précisément ce qui reste.
* Tu respectes le **style TypeScript strict** (types explicites, pas de `any`).
* Tu gardes la structure de code **lisible** et **simple** :

  * composant clair,
  * props typées,
  * logique bien séparée (UI vs logique).

---

## 9. OUTPUT ATTENDU (DANS CETTE SESSION)

1. Le fichier :

   * `docs/frontend/FRONTEND_DIAGNOSTIC_TITANE.md`

2. Les fichiers de base du Design System :

   * `src/design-system/css-vars.css`
   * `src/design-system/tokens.ts`
   * Mise à jour de `tailwind.config.(ts|cjs)`

3. Le squelette des composants de layout :

   * `src/components/layout/AppShell.tsx`
   * `src/components/layout/Sidebar.tsx`
   * `src/components/layout/TopBar.tsx`
   * `src/components/layout/MainChat.tsx`
   * `src/components/layout/DevToolsDock.tsx`
   * `src/components/layout/MobileNav.tsx`

4. Un court résumé de ce que tu as modifié (en fin de réponse) sous forme de changelog.

Tu peux proposer des ajustements, mais tu dois **toujours livrer du code immédiatement exploitable**.

Commence maintenant par :

1. Lire la structure existante
2. Générer `FRONTEND_DIAGNOSTIC_TITANE.md`
3. Ensuite enchaîner sur le Design System puis le layout.
````

---

## ✅ Checklist Post-Application

Après avoir appliqué ce super prompt avec Copilot :

- [ ] Le fichier `docs/frontend/FRONTEND_DIAGNOSTIC_TITANE.md` existe et est complet
- [ ] Le Design System est créé dans `src/design-system/`
- [ ] `tailwind.config.ts` est mis à jour avec les tokens
- [ ] Les composants de layout de base existent et compilent
- [ ] Un `npm run build` ou `pnpm build` passe sans erreur
- [ ] Un `npm run lint` ou `pnpm lint` ne révèle pas de problèmes critiques
- [ ] L'interface charge en mode dev (`npm run dev`)
- [ ] Le dark mode (base Titane) s'affiche correctement
- [ ] La palette Titane Métallique + Violet est visible

---

## 🔄 Itérations possibles

Si le super prompt ne couvre pas tout en une fois :

1. **Itération 1** : Diagnostic + Design System seulement
2. **Itération 2** : Layout principal (AppShell, Sidebar, TopBar)
3. **Itération 3** : Composants spécifiques (Chat, DevTools, MobileNav)
4. **Itération 4** : Responsive + Performance

---

## 📚 Ressources liées

- [DESIGN_SYSTEM_TITANE.md](../../DESIGN_SYSTEM_TITANE.md)
- [FRONTEND_PERFORMANCE_AUDIT_v19.3.md](../../FRONTEND_PERFORMANCE_AUDIT_v19.3.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md)

---

## 🐛 Troubleshooting

### Copilot ne génère que du pseudo-code

➡️ Reformuler en insistant sur « code réel, production-ready, pas de TODO »

### Les fichiers générés ne correspondent pas à la structure

➡️ Préciser dans le prompt les chemins absolus exacts (`src/design-system/css-vars.css`)

### Le build casse après application

➡️ Vérifier les imports, les chemins relatifs, les exports manquants

### La palette Titane n'apparaît pas

➡️ S'assurer que `css-vars.css` est importé dans `main.tsx` ou `App.tsx`

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-09
**Auteur** : TITANE∞ Core Team
