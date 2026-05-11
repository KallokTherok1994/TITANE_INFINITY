# UI_VISUAL_SURFACE_INVENTORY_v78

**Created:** 2026-05-11  
**Audit Phase:** Section E - Visual Surface Inventory  
**Source of Truth:** uiSurfaceRegistry.ts, App.tsx, current-production-route-proof.jsonl

---

## CANONICAL ROUTES AUDIT MATRIX

| Route | Status (Registry) | Status (Current Proof) | Tabs | Page Component | Navigation | v78 Visual Capture Plan |
|-------|------------------|----------------------|------|---|---|---|
| /titane | core-canonical | PROD_ROUTE_ACTIVE | 6 | TitanePage | Main (TITANE) | Screenshot + tabs |
| /experience | canonical | PROD_ROUTE_ACTIVE | 5+ | ExperiencePage | Main (TITANE) | Screenshot + tabs |
| /time | canonical | PROD_ROUTE_ACTIVE | 5 | TimePage | Main (TIME) | Screenshot + tabs |
| /admin | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 7 | AdminPage | Main (ADMIN) | Screenshot + tabs + guard disclosure |
| /dev | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 5 | DevPage | Main (DEV) | Screenshot + tabs + guard disclosure |
| /fusion | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 4 | FusionPage | Main (FUSION) | Screenshot + tabs + guard disclosure |
| /cloud | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | CloudPage | Hidden | Screenshot + guard disclosure |
| /reality-center | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 3 | RealityCenterPage | Hidden | Screenshot + tabs + guard disclosure |
| /hyper-center | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 3 | HyperCenterPage | Hidden | Screenshot + tabs + guard disclosure |
| /quantum-center | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 3 | QuantumCenterPage | Hidden | Screenshot + tabs + guard disclosure |
| /twins | canonical | PROD_ROUTE_ACTIVE | 4 | TwinsPage | Main (TWINS) | Screenshot + tabs |
| /doc-center | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 4 | DocCenterPage | Main | Screenshot + tabs + guard disclosure |
| /optimization | canonical | PROD_ROUTE_ACTIVE | 2 | OptimizationPage | Main (OPTIMIZE) | Screenshot + tabs |
| /total-dev | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 3 | TotalDevPage | Hidden | Screenshot + tabs + guard + locked badge |
| /orchestration-intelligence | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | OrchestratorPage | Hidden | Screenshot + guard disclosure |
| /orchestration-center | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | OrchestratorPage | Hidden | Screenshot + guard disclosure |
| /singularity | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | SingularityPage | Hidden | Screenshot + guard disclosure |
| /sentinel | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | SentinelPage | Hidden | Screenshot + guard disclosure |
| /watchdog | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | WatchdogPage | Hidden | Screenshot + guard disclosure |
| /selfheal | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | SelfHealPage | Hidden | Screenshot + guard disclosure |
| /adaptive | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | AdaptivePage | Hidden | Screenshot + guard disclosure |
| /memory | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | 4 | MemoryPage | Hidden | Screenshot + tabs + guard disclosure |
| /research | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | ResearchPage | Hidden | Screenshot + guard disclosure |
| /skills | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | SkillsPage | Hidden | Screenshot + guard disclosure |
| /knowledge | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | KnowledgePage | Hidden | Screenshot + guard disclosure |
| /creation | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | CreationPage | Hidden | Screenshot + guard disclosure |
| /evolution | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | EvolutionPage | Hidden | Screenshot + guard disclosure |
| /performance | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | PerformancePage | Hidden | Screenshot + guard disclosure |
| /htf | canonical | PROD_ROUTE_GUARDED_WITH_UI_PROOF | N/A | HTFPage | Hidden | Screenshot + guard disclosure |

---

## LEGACY REDIRECTS & ALIASES

Confirmed in current-production-route-proof.jsonl as PROD_ROUTE_LEGACY_REDIRECT_CONFIRMED:

| Legacy Route | Redirects To | Status | v78 Screenshot |
|---|---|---|---|
| /chat | /titane?tab=conversation | Legacy alias | Yes |
| /doc | /doc-center | Legacy alias | Yes |
| /vault | ? | Unresolved | Investigate |
| /cloud-sync | /cloud | Possible alias | Yes if reachable |
| /memory-evo | /titane?tab=memory | Legacy transformation | Yes |
| /memory-evolution | /titane?tab=memory | Legacy transformation | Yes |

---

## MAIN MENU NAVIGATION (8 Primary Surfaces)

| Menu Position | Label | Route | Component | Current Status | v78 Capture |
|---|---|---|---|---|---|
| 1 | TITANE | /titane | TitanePage | ACTIVE | Main screenshot + provider selector + mode selector |
| 2 | TIME | /time | TimePage | ACTIVE | Main screenshot + Now/Agenda/Timeline tabs |
| 3 | ADMIN | /admin | AdminPage | GUARDED | Main screenshot + all admin tabs + guard disclosure |
| 4 | DEV | /dev | DevPage | GUARDED | Main screenshot + dev tabs + guard disclosure |
| 5 | FUSION | /fusion | FusionPage | GUARDED | Main screenshot + fusion tabs + guard disclosure |
| 6 | TWINS | /twins | TwinsPage | ACTIVE | Main screenshot + twins tabs |
| 7 | OPTIMIZE | /optimization | OptimizationPage | ACTIVE | Main screenshot + optimize tabs |
| 8 | TOTAL_DEV | /total-dev | TotalDevPage | GUARDED | Main screenshot + dev tabs + locked badge + guard |

---

## HIDDEN PRIORITY ROUTES (Not in Main Menu, But Actionable)

| Route | Component | Access Method | Guard Status | v78 Capture |
|---|---|---|---|---|
| /cloud | CloudPage | Plus menu / hidden | GUARDED | Yes |
| /reality-center | RealityCenterPage | Hidden in menu | GUARDED | Yes |
| /hyper-center | HyperCenterPage | Hidden in menu | GUARDED | Yes |
| /quantum-center | QuantumCenterPage | Hidden in menu | GUARDED | Yes |
| /memory | MemoryPage | Hidden in menu | GUARDED | Yes |
| /doc-center | DocCenterPage | Sidebar or menu | GUARDED | Yes |
| /research | ResearchPage | Hidden | GUARDED | Yes |
| /orchestration-center | OrchestratorPage | Hidden | GUARDED | Yes |
| /orchestration-intelligence | OrchestratorPage | Hidden | GUARDED | Yes |

---

## TAB FAMILIES PER PAGE

### /titane Tabs (6)
1. **Conversation** — Live AI chat, provider truth banner, mode selector, message actions
2. **Overview** — Dashboard cards, XP state, metrics
3. **Vision** — Camera/image analysis, fallback state
4. **Memory** — Persistent memory panels (sub-tabs: overview, dashboard, tree, search)
5. **Progression** — XP/capability tree
6. **Transformation** — Evolution/cognitive evo

### /time Tabs (5)
1. **Now** — Current time context, cognitive engine output
2. **Agenda** — Planned events, add/edit/delete actions
3. **Timeline** — Day/week/month timeline view
4. **Snapshots** — Captured cognitive snapshots, restore/force actions
5. **Cognitive** — Cognitive engine internals

### /admin Tabs (7)
1. **System** — System status, device info, environment
2. **Config** — Configuration hub, settings, preferences
3. **Audio & Voix** — Audio device selector, voice config
4. **Design** — UI theme, layout, CSS overrides
5. **Governance** — Governance rules, SBOM, compliance
6. **Production Health** — Prod metrics, error logs, performance
7. **DevTools/Introspection** — State inspector, IPC monitor

### /dev Tabs (5)
1. **Overview** — Dev state, runtime info, backend health
2. **Diagnostics** — Error logs, warnings, anomalies
3. **Operations** — IPC commands, feature flags, config
4. **Validation** — Test runners, health checks
5. **Security** — Capability list, allowlist, audit logs

### /fusion Tabs (4)
1. **Sync** — Coherence score, harmony metrics
2. **Consciousness** — Entropy measure, active engines
3. **Cards** — Engine cards, readiness states
4. **Actions** — Sync buttons, control actions

### /twins Tabs (4)
1. **Fusion** — Identity fusion state
2. **Values** — Core values/identity
3. **Evolution** — Twin evolution track
4. **Admin** — Twin configuration

### /optimization Tabs (2)
1. **Performance** — FPS, CPU, animation metrics, score
2. **Recommendations** — Performance tips, apply buttons

### /total-dev Tabs (3)
1. **Locked Badge** — Visible unlock requirement
2. **Token Input** — Unlock token field
3. **Dev Chat** — Dev-only AI chat panel (no frontend secret exposure)

---

## AGENT OVERLAY & CONTEXT SURFACES

Visible on all pages (when enabled):

| Element | Status | v78 Capture |
|---|---|---|
| Agent overlay panel | Present | Screenshot shows overlay state |
| Provider selector | Active | Screenshot shows current provider + truth |
| Mode selector | Active | Screenshot shows current mode + locked state if /total-dev |
| Runtime truth banner | Visible | Screenshot shows banner content |
| Chat composer | Visible | Screenshot shows composer state |
| Message actions | Visible | Screenshot shows message controls |
| Top nav active state | Visible | Screenshot shows nav highlighting |

---

## CURRENT PRODUCTION PROOF SUMMARY

**Total Routes Captured:** 35 routes  
**Active Routes:** 11 (fully live)  
**Guarded Routes:** 18 (protected with disclosure)  
**Legacy Redirects:** 6 (confirmed aliases)  

---

## v78 VISUAL CAPTURE SCOPE

**Mandatory (Must Capture):**
- All 8 main menu pages + tabs
- At least 10 of 18 guarded routes (priority: /cloud, /reality-center, /hyper-center, /quantum-center, /memory, /doc-center, /research, /orchestration-center)
- Truth badges/disclosures where required
- Agent overlay state (present/absent/collapsed)
- Top nav active indicator
- Tab navigation visibility
- Guard/degradation disclosures

**Optional (If Time/Environment Allows):**
- All 28 canonical routes
- All legacy redirects (/chat, /doc, etc.)
- Desktop/Tauri equivalent captures

**Screenshot Artifacts:**
- Per-route full-page screenshot
- Per-route viewport screenshot (critical for mobile responsiveness)
- Save to: `artifacts/ui-visual/screenshots/v78/production/<page-id>.png`

---

**Status:** INVENTORY_COMPLETE — Ready to execute Section F (Production Visual Capture Spec).
