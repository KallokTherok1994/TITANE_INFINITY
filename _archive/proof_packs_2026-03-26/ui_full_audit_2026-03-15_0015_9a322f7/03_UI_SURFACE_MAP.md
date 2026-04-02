# UI SURFACE MAP — Phase 1

## TitanePage (/titane)

| Onglet | Composant | Dépendances |
|---|---|---|
| Conversation | ConversationSection | useConversationEngine → tauriClient (IPC) |
| Vision | VisionSection | useVisionStore (partiel) |
| Overview | OverviewSection | stats prop |
| Identité | IdentitySection | — |
| Memory Map | MemorySection | stats prop |
| Memory Evolution | MemoryEvolutionSection | — |
| Progression | ProgressionSection | progression, stats |
| Transformation | TransformationSection | — |

## TimePage (/time)

| Section | Composant | Notes |
|---|---|---|
| Timeline | TimelineSection | DISPLAY_ONLY curated (signalé dans subtitle) |
| Snapshots | SnapshotsSection | tauriClient |
| Flow | FlowSection | — |

## AdminPage (/admin)

| Onglet | Composant | Dépendances |
|---|---|---|
| Système | SystemCenterPage | 5 sous-onglets (Diagnostics/DevTools/Cluster/Introspection/HyperVision) |
| Configuration | ConfigurationHub | tauriClient IPC — save/load config |
| Audio & Voix | AudioCenterPage | 4 onglets (voice/devices/diagnostics/advanced) |
| Design | DesignCenterPage | UIThemeProvider — localStorage |
| Gouvernance | GovernanceCenterPage | governanceService → safeInvoke |
| Santé Prod | ProductionHealthPanel | useProductionHealthTelemetry → IPC |

## DevPage (/dev)

| Onglet | Composants | Dépendances |
|---|---|---|
| Vue d'ensemble | OverviewSection | oneCore, qaState, orchestration |
| Diagnostics | OnlineDiagnostic + MetricsSection + StatsSystemPanels + OrchestrationSection | tauriClient IPC |
| Opérations | SystemCommandsSection + CommandCenterSection + DevToolsSection + UltimateOptimizationDashboard | oneCore.executeCommand |
| Validation | QATestsSection | qa.runTestSuite |
| Security | SecuritySection | qa.acknowledgeAlert |

## CloudCenter (/cloud)

| Section | Composant | Dépendances |
|---|---|---|
| Status | CloudCenter index | tauriClient.cloudGetStatus |
| Vault | VaultStatus | tauriClient cloud* |
| Config | SyncConfig | tauriClient.cloudUpdateConfig |
| Logs | SyncLogs | tauriClient.cloudGetSyncHistory |
| Devices | DevicesView | tauriClient.cloudGetDevices |
