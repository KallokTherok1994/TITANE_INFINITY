# KEVIN_V5_NORMALIZED — Ω.UI.FINAL.SEAL.ULTIMATE.MAX.v2

Date (UTC): 2026-02-08  
Sources:
- docs/reference/kevin-v5/ANALYSE-AGENTGPT.pdf
- docs/reference/kevin-v5/TITANE_UI_CARTOGRAPHY_v4.zip
- docs/reference/kevin-v5/_normalized/v4_zip_extracted/

## Commandes utilisées (preuves)
```
# Extraction ZIP (sans modifier la source)
mkdir -p docs/reference/kevin-v5/_normalized/v4_zip_extracted
unzip -o docs/reference/kevin-v5/TITANE_UI_CARTOGRAPHY_v4.zip -d docs/reference/kevin-v5/_normalized/v4_zip_extracted

# Extraction PDF (titres/sections/composants)
pdftotext -layout docs/reference/kevin-v5/ANALYSE-AGENTGPT.pdf - | rg -n "AppShell|AppLayout|Sidebar|TitanePage|MessageList|ErrorBoundary|Menu" -m 50
```

---

## NAVIGATION / ÉCRANS

**Top-level (niveau 0)**
- Sections: TITANE, TIME, STATS, ADMIN, DEV, Plus.  
  Preuves: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md#L3-L6), [docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json](docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json#L2-L9)

**DEV (9 sous-sections)**
- Vue d’ensemble, Dev Tools, Command Center, System Commands, Q&A Tests, Orchestration, Security, Metrics, Ultimate Optimization.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md#L10-L66)

**TITANE (modules)**
- Vue d’ensemble, Chat, VAD, Vision, Identité, Mémoire, Évolution, XP, Transform, Audio Center.  
  Preuves: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md#L69-L121), [docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json](docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json#L23-L35)

**TIME (tabs)**
- Maintenant, Agenda, Timeline, Snapshots, Intelligence, Flow.  
  Preuves: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md#L125-L145), [docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json](docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json#L37-L45)

**STATS (écran Global Health observé)**
- Global Health + états UNKNOWN/NaN décrits.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md#L149-L166)

---

## ROUTES / ROUTING

**Route map machine-readable**
- `data/routes_map.json` répertorie top_nav et modules DEV/TITANE/TIME.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json](docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json#L1-L46)

**Navigation routes (page-level)**
- Répétition des sections + structure par niveaux.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/NAVIGATION_ROUTES.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/NAVIGATION_ROUTES.md#L1-L152)

---

## LAYOUTS / SHELL

**Shell global**
- Header global avec menu principal (TITANE/TIME/STATS/ADMIN/DEV/Plus) et zone d’actions.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md#L3-L13)

**Sous-nav**
- DEV tabs, TITANE modules, TIME pills.  
  Preuves: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md#L15-L41)

**Widget flottant**
- Cognitive Layout (widget persist).  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md#L52-L60)

**Overlay de boot/console**
- Boot Beacon / Console Monitor mentionnés comme overlay.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md#L62-L67)

**Hiérarchie recommandée**
- AppShell + ErrorBoundary + FloatingWidgets.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md#L71-L83)

---

## COMPOSANTS / FEATURES

**Patterns UI**
- Cards KPI, tabs/pills, CTA, overlays, widget Cognitive Layout.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/05_COMPONENT_SYSTEM.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/05_COMPONENT_SYSTEM.md#L3-L9)

**Composants mentionnés (PDF AgentGPT)**
- AppShell / AppLayout / Sidebar / TitanePage / MessageList / ErrorBoundary.  
  Preuve (PDF): lignes 337–352 de l’extraction `pdftotext` (sortie console).

---

## ÉTATS UI (loading / empty / error)

**Flow de boot**
- HTML loaded → JS loaded → React mounted → IPC ready → Providers check → Memory init → phase finale.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/06_STATE_FLOWS.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/06_STATE_FLOWS.md#L3-L10)

**Flow de page**
- loading → phase de rendu → degraded → error (libellé source).  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/06_STATE_FLOWS.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/06_STATE_FLOWS.md#L12-L16)

**Principe zéro silence**
- Zéro silence UI/IPC/chat/chargement.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/00_README.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/00_README.md#L44-L47)

---

## ISSUES / WARNINGS / NON-CONFORMITÉS

**Registre erreurs/warnings (priorisé)**
- P0/P1/P2/P3 listés (Ollama, UNKNOWN/NaN, ErrorBoundary, etc.).  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/07_ERRORS_WARNINGS_BLOCKERS.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/07_ERRORS_WARNINGS_BLOCKERS.md#L1-L43)

**Backlog vérifications**
- Auth/session, GOV, IPC allowlist, E2E desktop, etc.  
  Preuve: [docs/reference/kevin-v5/_normalized/v4_zip_extracted/07_ERRORS_WARNINGS_BLOCKERS.md](docs/reference/kevin-v5/_normalized/v4_zip_extracted/07_ERRORS_WARNINGS_BLOCKERS.md#L46-L51)
