# Shell global & structure de l’application

## 1) Barres de navigation

### 1.1 Barre top (Global Header)
Éléments observés :
- Branding **TITANE∞** (gauche).
- Menu principal (centre) : `TITANE` · `TIME` · `STATS` · `ADMIN` · `DEV` · `Plus`.
- Bouton d’action contextualisé (droite) : bouton vert (ex. « Activer / Démarrer / ... » selon page).

Hypothèses structure :
- Header persistant (`AppShell`), route-level layout.
- Droite : zone d’actions (CTA) + statut utilisateur/session.

### 1.2 Sous-navigation (DEV)
Sous `DEV`, un bandeau de tabs :
- `Vue d'ensemble`
- `Dev Tools`
- `Command Center`
- `System Commands`
- `Q&A Tests`
- `Orchestration`
- `Security`
- `Metrics`
- `Ultimate Optimization`

Chaque onglet charge une page-dashboard (cards + actions).

### 1.3 Sous-navigation (TITANE)
Dans la zone TITANE (pages internes), un bandeau de modules (boutons/pills) :
- `Chat`, `VAD`, `Vision`, `Identité`, `Mémoire`, `Évolution`, `XP`, `Transform`
(+ parfois un bandeau « Le Cœur du Système » ou équivalent)

### 1.4 Sous-navigation (TIME)
Sous `TIME`, pills :
- `Maintenant`
- `Agenda`
- `Timeline`
- `Snapshots`
- `Intelligence`
- `Flow` (ou équivalent)

---

## 2) Patterns transverses

### 2.1 Fond & style
- Fond spatial « étoiles » (canvas / bg image).
- Grilles de cards centrées avec largeur max, marges généreuses.
- Thème sombre, accents néon (vert/bleu/violet), tokens typés.

### 2.2 Widget flottant : “Cognitive Layout”
Présent sur la majorité des pages :
- Mini-card “Cognitive Layout”
- Toggle “Adaptation auto”
- Icônes : expand / collapse / settings (selon état)

Rôle :
- Contrôler le layout adaptatif (densité, focus, reflow).
- Peut devenir un point de panne si ses états/props sont invalides → doit être ultra robuste (null-safe).

### 2.3 Toast/Console overlay (bas-droite)
- “BOOT BEACON” / “App render” / route / flags → marqueur de boot.
- “Console Monitor” parfois affiché.

Exigence :
- En PROD aussi : au minimum un mode diagnostic activable (local-first) pour éviter l’aveuglement.

---

## 3) Layout & hiérarchie

Structure recommandée (modèle) :
- `<AppShell>`
  - `<GlobalHeader/>`
  - `<SubNav/>` (selon section)
  - `<PageContainer>`
    - `<PageTitle/>` (si nécessaire)
    - `<DashboardGrid/>` (cards)
  - `<FloatingWidgets/>` (Cognitive Layout, Console Monitor)
  - `<Toasts/>`
  - `<ErrorBoundary/>` (global + par page)

---

## 4) États globaux incontournables
- `booting` → `ready` → `degraded` → `offline`
- `provider_status` (OpenAI/Claude/Gemini/Ollama/MockLocal)
- `memory_status` (STM/MTM/LTM, taille, erreurs)
- `orchestration_status` (pipelines actifs, queue)
- `security_status` (alerts, allowlist)
- `tests_status` (couverture, suites, dernier run)

Chaque état doit avoir :
- un **badge** + un **détail** + une **action** (resolve/retry/open logs).

