# TITANE Desktop Control Inventory v50

Generated: 2026-05-10T04:31:07.054Z  
Mission: UI_DESKTOP_FULL_COVERAGE_v50  

> Static shape from registry. Dynamic DOM inventory from `ui-desktop-control-inventory.wdio.test.js`.

## Summary

| Metric | Count |
|---|---|
| Routes | 29 |
| Tab buttons | 22 |
| Visible actions (from registry) | 48 |
| Safe actions | 35 |
| Sensitive/guarded actions | 13 |

## Per-Route Control Inventory

### /titane (TitanePage)

Root: `[data-testid="page-titane"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Tabs (6)**:
- `[data-testid="tab-conversation"]` → Conversation (ACTIVE_PARTIAL)
- `[data-testid="tab-overview"]` → Overview (ACTIVE_PARTIAL)
- `[data-testid="tab-vision"]` → Vision (ACTIVE_PARTIAL)
- `[data-testid="tab-memory"]` → Memory (ACTIVE_PARTIAL)
- `[data-testid="tab-progression"]` → Progression (ACTIVE_PARTIAL)
- `[data-testid="tab-transformation"]` → Transformation (ACTIVE_PARTIAL)

**Actions (4)**:
- ⚠️ `send_message` → "Send message" [WIRED_LIVE] → EXTERNAL_NETWORK_SKIP_WITH_PROOF
- ⚠️ `switch_provider` → "Switch AI provider" [WIRED_LIVE] → EXTERNAL_NETWORK_SKIP_WITH_PROOF
- ✅ `analyze_image` → "Analyze image" [WIRED_FALLBACK] → FALLBACK_EXPECTED
- ✅ `switch_tab` → "Switch tab" [DISPLAY_ONLY] → READ_ONLY_CLICK

### /experience (Experience)

Root: `[data-testid="page-experience"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `read_progression` → "Read XP state" [DISPLAY_ONLY] → READ_ONLY_CLICK

### /time (TimePage)

Root: `[data-testid="page-time"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Tabs (5)**:
- `[data-testid="tab-time-now"]` → Now (ACTIVE_PARTIAL)
- `[data-testid="tab-time-agenda"]` → Agenda (ACTIVE_PARTIAL)
- `[data-testid="tab-time-timeline"]` → Timeline (ACTIVE_PARTIAL)
- `[data-testid="tab-time-snapshots"]` → Snapshots (ACTIVE_PARTIAL)
- `[data-testid="tab-time-cognitive"]` → Cognitive (ACTIVE_PARTIAL)

**Actions (5)**:
- ✅ `read_time_context` → "Read time context" [WIRED_LIVE] → SAFE_CLICK
- ⚠️ `save_event` → "Save agenda event" [WIRED_LIVE] → REQUIRES_CONFIRMATION
- ⚠️ `delete_event` → "Delete agenda event" [WIRED_LIVE] → REQUIRES_CONFIRMATION
- ⚠️ `restore_snapshot` → "Restore snapshot" [WIRED_FALLBACK] → REQUIRES_CONFIRMATION
- ✅ `force_snapshot` → "Force snapshot" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /admin (AdminPage)

Root: `[data-testid="page-admin"]`  
Truth: LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI | Status: ACTIVE_PARTIAL

**Tabs (6)**:
- `[data-testid="tab-admin-system"]` → System (ACTIVE_PARTIAL)
- `[data-testid="tab-admin-config"]` → Config (ACTIVE_PARTIAL)
- `[data-testid="tab-admin-audio"]` → Audio (ACTIVE_PARTIAL)
- `[data-testid="tab-admin-design"]` → Design (DISPLAY_ONLY)
- `[data-testid="tab-admin-governance"]` → Governance (ACTIVE_PARTIAL)
- `[data-testid="tab-admin-production-health"]` → Production Health (ACTIVE_PARTIAL)

**Actions (3)**:
- ✅ `load_panels` → "Load admin panels" [WIRED_FALLBACK] → FALLBACK_EXPECTED
- ✅ `audio_devices` → "List audio devices" [WIRED_LIVE] → SAFE_CLICK
- ⚠️ `check_ollama` → "Check Ollama status" [WIRED_LIVE] → EXTERNAL_NETWORK_SKIP_WITH_PROOF

### /dev (DevPage)

Root: `[data-testid="page-dev"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Tabs (5)**:
- `[data-testid="tab-dev-overview"]` → Overview (ACTIVE_PARTIAL)
- `[data-testid="tab-dev-diagnostics"]` → Diagnostics (ACTIVE_PARTIAL)
- `[data-testid="tab-dev-operations"]` → Operations (ACTIVE_PARTIAL)
- `[data-testid="tab-dev-validation"]` → Validation (ACTIVE_PARTIAL)
- `[data-testid="tab-dev-security"]` → Security (ACTIVE_PARTIAL)

**Actions (2)**:
- ✅ `refresh_dev_state` → "Refresh dev state" [WIRED_FALLBACK] → FALLBACK_EXPECTED
- ✅ `run_autofix` → "Run autofix" [WIRED_LIVE] → SAFE_CLICK

### /fusion (PerfectFusionDashboard)

Root: `[data-testid="page-fusion"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `refresh_fusion` → "Refresh fusion state" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /optimization (UltimateOptimizationDashboard)

Root: `[data-testid="page-optimization"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `refresh_metrics` → "Refresh performance metrics" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /total-dev (TotalDevPage)

Root: `[data-testid="page-total-dev"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ⚠️ `dev_chat` → "Dev AI chat" [WIRED_LIVE] → EXTERNAL_NETWORK_SKIP_WITH_PROOF

### /orchestration-intelligence (OrchestrationIntelligenceCenter)

Root: `[data-testid="page-orchestration-intelligence"]`  
Truth: SIMULATED_UI | Status: SIMULATED_UI

**Actions (1)**:
- ✅ `switch_tab` → "Switch tab" [DISPLAY_ONLY] → READ_ONLY_CLICK

**Known blockers**: SIMULATED_UI — no live backend data

### /orchestration-center (OrchestrationMetaCenter)

Root: `[data-testid="page-orchestration-meta-center"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (2)**:
- ✅ `get_orchestrator_state` → "Get orchestrator state" [WIRED_FALLBACK] → FALLBACK_EXPECTED
- ✅ `run_cycle` → "Run orchestration cycle" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /reality-center (RealityCenter)

Root: `[data-testid="page-reality-center"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (2)**:
- ✅ `render_frame` → "Render frame" [WIRED_FALLBACK] → FALLBACK_EXPECTED
- ✅ `toggle_physics` → "Toggle physics" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /hyper-center (HyperCenter)

Root: `[data-testid="page-hyper-center"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (2)**:
- ✅ `think` → "Hyper Think" [WIRED_FALLBACK] → FALLBACK_EXPECTED
- ✅ `reason` → "Hyper Reason" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /quantum-center (QuantumCenter)

Root: `[data-testid="page-quantum-center"]`  
Truth: SIMULATED_UI | Status: SIMULATED_UI

**Actions (1)**:
- ✅ `toggle_runtime` → "Toggle quantum runtime UI" [DISPLAY_ONLY] → READ_ONLY_CLICK

**Known blockers**: SIMULATED_UI — no live backend data

### /twins (TwinsPage)

Root: `[data-testid="page-twins"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `load_twins` → "Load twins page" [DISPLAY_ONLY] → READ_ONLY_CLICK

### /cloud (CloudCenter)

Root: `[data-testid="page-cloud-center"]`  
Truth: LIVE_TAURI | Status: ACTIVE_PARTIAL

**Actions (4)**:
- ⚠️ `get_status` → "Get cloud status" [WIRED_LIVE] → EXTERNAL_NETWORK_SKIP_WITH_PROOF
- ⚠️ `sync_push` → "Sync push" [WIRED_LIVE] → REQUIRES_CONFIRMATION
- ⚠️ `sync_pull` → "Sync pull" [WIRED_LIVE] → REQUIRES_CONFIRMATION
- ⚠️ `verify_integrity` → "Verify integrity" [WIRED_LIVE] → EXTERNAL_NETWORK_SKIP_WITH_PROOF

### /memory (Memory)

Root: `[data-testid="page-memory"]`  
Truth: LIVE_TAURI_SERVICE_BRIDGE | Status: ACTIVE_PARTIAL

**Actions (4)**:
- ✅ `read_memory` → "Read memory entries" [WIRED_LIVE] → SAFE_CLICK
- ✅ `write_entry` → "Write memory entry" [WIRED_LIVE] → SAFE_CLICK
- ⚠️ `delete_entry` → "Delete memory entry" [WIRED_LIVE] → REQUIRES_CONFIRMATION
- ✅ `get_stats` → "Get memory stats" [WIRED_LIVE] → SAFE_CLICK

### /research (ResearchPage)

Root: `[data-testid="research-page"]`  
Truth: LIVE_TAURI_GOVERNED | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `run_research` → "Run web research" [WIRED_LIVE] → SAFE_CLICK

### /doc-center (DocCenterPage)

Root: `[data-testid="doc-center-page"]`  
Truth: LIVE_TAURI_GOVERNED | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ⚠️ `export_docx` → "Export DOCX" [WIRED_LIVE] → REQUIRES_CONFIRMATION

### /singularity (SingularityMonitor)

Root: `[data-testid="page-singularity-monitor"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `get_state` → "Get singularity state" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /sentinel (Sentinel)

Root: `[data-testid="page-sentinel"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `subscribe` → "Subscribe sentinel events" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /watchdog (Watchdog)

Root: `[data-testid="page-watchdog"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `subscribe` → "Subscribe watchdog events" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /selfheal (SelfHeal)

Root: `[data-testid="page-selfheal"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `subscribe` → "Subscribe selfheal events" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /adaptive (AdaptiveEngine)

Root: `[data-testid="page-adaptive-engine"]`  
Truth: LIVE_TAURI_WITH_FALLBACK | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `subscribe` → "Subscribe adaptive events" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /skills (SkillManager)

Root: `[data-testid="page-skills"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Actions (2)**:
- ✅ `list_skills` → "List skills" [WIRED_FALLBACK] → FALLBACK_EXPECTED
- ✅ `activate_skill` → "Activate skill" [WIRED_FALLBACK] → FALLBACK_EXPECTED

### /knowledge (KnowledgeFusionPage)

Root: `[data-testid="page-knowledge"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `knowledge_refresh` → "Refresh knowledge" [TEMPLATE_ONLY] → SAFE_CLICK

### /creation (CreationStudio)

Root: `[data-testid="page-creation-studio"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `creation_refresh` → "Refresh creation" [TEMPLATE_ONLY] → SAFE_CLICK

### /evolution (EvolutionMonitor)

Root: `[data-testid="page-evolution-monitor"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

**Actions (1)**:
- ✅ `evolution_refresh` → "Refresh evolution" [TEMPLATE_ONLY] → SAFE_CLICK

### /performance (PerformanceTest)

Root: `[data-testid="page-performance-test"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: DISPLAY_ONLY

**Actions (1)**:
- ✅ `run_probe` → "Run performance probe" [TEMPLATE_ONLY] → SAFE_CLICK

**Known blockers**: DISPLAY_ONLY — read-only state, no interactive writes

### /htf (HTFPage)

Root: `[data-testid="page-htf"]`  
Truth: MIXED_LIVE_AND_STATIC | Status: ACTIVE_PARTIAL

