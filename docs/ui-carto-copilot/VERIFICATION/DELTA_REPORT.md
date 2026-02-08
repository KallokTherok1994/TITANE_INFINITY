# DELTA_REPORT — Kevin V5 vs UI Cartography

Date (UTC): 2026-02-08

## Sources
- Baseline (zip): docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/
- Baseline (pdf): docs/reference/kevin-v5/ANALYSE-AGENTGPT.pdf
- Current cartography: docs/ui-carto-copilot/

---

## 1) Navigation / écrans / routes

**Baseline proof**
- docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/01_NAVIGATION_MAP.md (L1-L167)
- docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/architecture/NAVIGATION_ROUTES.md (L1-L140)

**Current proof**
- docs/ui-carto-copilot/10-navigation/11-sections-map.md (L1-L200)
- docs/ui-carto-copilot/10-navigation/12-routes-map.md (L1-L200)

**Delta notes (factuel)**
- Baseline: cartographie narrative des sections et sous-onglets.
- Current: tables détaillées par tabs/sections et routes.
- Reconciliation requise pour un mapping 1:1 des tabs/sections et routes.

---

## 2) Composants UI & architecture

**Baseline proof**
- docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/architecture/SHELL_GLOBAL.md (L1-L109)

**Current proof**
- docs/ui-carto-copilot/10-navigation/13-layout-shell.md (L1-L140)
- docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md (L1-L200)

**Delta notes (factuel)**
- Baseline décrit le shell global, navigation et widgets persistants.
- Current détaille AppShell et widgets persistants avec sources de composants.
- Alignement à vérifier sur la liste des widgets et zones persistantes.

---

## 3) Contrats IPC / invocation / wrappers

**Baseline proof**
- docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/architecture/CONTRACTS_UI_BACKEND.md (L1-L75)

**Current proof**
- docs/ui-carto-copilot/30-contracts/30-ipc-invocations-index.md (L1-L140)

**Delta notes (factuel)**
- Baseline spécifie des contrats de réponse et règles UI.
- Current inventorie les commandes IPC et patrons d’invocation.
- Convergence à documenter entre contrats et catalogue d’invocation.

---

## 4) États UI (loading/error/empty)

**Baseline proof**
- docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/06_STATE_FLOWS.md
- docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/07_ERRORS_WARNINGS_BLOCKERS.md

**Current proof**
- docs/ui-carto-copilot/35-states/38-empty-loading-error-catalog.md (L1-L220)

**Delta notes (factuel)**
- Baseline couvre flux d’état et erreurs/avertissements.
- Current fournit un catalogue détaillé des états UI.
- Cartographie de correspondance à établir (noms d’états, règles d’affichage).

---

## 5) Observabilité (boot markers, error boundaries)

**Baseline proof**
- docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/architecture/OBSERVABILITY.md (L1-L40)

**Current proof**
- docs/ui-carto-copilot/40-observability/40-boot-pipeline.md (L1-L24)
- docs/ui-carto-copilot/40-observability/41-error-boundaries.md (L1-L30)

**Delta notes (factuel)**
- Baseline définit marqueurs de boot et diagnostic.
- Current décrit boot pipeline et architecture d’ErrorBoundary.
- Alignement à vérifier sur la liste des marqueurs et périmètre des boundaries.

---

## 6) Gouvernance (freeze gates, registres, exceptions)

**Baseline proof**
- docs/reference/kevin-v5/_extracted/TITANE_UI_CARTOGRAPHY_v4/issues/ISSUES_REGISTER.md

**Current proof**
- docs/ui-carto-copilot/50-audit/50-issues-register.md (L1-L120)
- docs/ui-carto-copilot/VERIFICATION/UI_FREEZE_GATES.md (L1-L120)

**Delta notes (factuel)**
- Baseline fournit un registre d’issues.
- Current fournit registre d’issues et règles de freeze.
- Harmonisation des registres et statuts à effectuer.
