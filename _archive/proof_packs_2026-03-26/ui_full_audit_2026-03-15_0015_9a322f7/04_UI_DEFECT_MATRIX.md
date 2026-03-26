# UI DEFECT MATRIX — Phase 3/4

## Défauts actifs (réels)

| ID | Fichier | Ligne | Classification | Sévérité | Action |
|---|---|---|---|---|---|
| D-01a | VaultStatus.tsx | ~47 | ERROR_NOT_SURFACED | P2 | FIXED — actionError state |
| D-01b | VaultStatus.tsx | ~61 | ERROR_NOT_SURFACED | P2 | FIXED — actionError state |
| D-01c | VaultStatus.tsx | ~73 | ERROR_NOT_SURFACED | P2 | FIXED — actionError state |
| D-01d | VaultStatus.tsx | ~86 | ERROR_NOT_SURFACED | P2 | FIXED — actionError state |
| D-02 | SyncLogs.tsx | ~32 | ERROR_NOT_SURFACED | P2 | FIXED — loadError state |
| D-03 | DevPage.tsx | ~650 | MOCK_LEAK orchestration | P2 | FIXED — orchestrationDegraded badge |

## Défauts acceptés (non bloquants)

| ID | Fichier | Classification | Justification |
|---|---|---|---|
| D-04 | DetectionOverlay.tsx | MOCK_LEAK (canvas) | isActive=false → mock boxes jamais dessinées en production |
| D-05 | TimePage TimelineSection | DISPLAY_ONLY | Subtitle mentionne explicitement "DISPLAY_ONLY — curated" |
| D-06 | DesignSystemPage | disabled + onChange=⇒{} | Page showcase démo — comportement intentionnel |
| D-07 | MemorySearchPanel | mock-notice | Badge UI honest affiché |

## Scan complet — Aucun autre défaut critique trouvé

| Catégorie | Verdict |
|---|---|
| BUTTON_WITHOUT_HANDLER | 0 trouvés |
| TAB_WITHOUT_CONTENT | 0 trouvés |
| ROUTE_WITHOUT_REAL_VIEW | 0 trouvés |
| FALSE_SUCCESS (toasts) | 0 trouvés |
| DISABLED_FOREVER (critique) | 0 trouvés |
| IPC_NOT_CONNECTED | 0 trouvés (commandes Rust enregistrées) |
| PERSISTENCE_BROKEN | 0 trouvés (localStorage + Tauri IPC) |
| CONTRAST_FAILURE | 0 bloquants (contrast.ts utilitaire en place) |

## Chaînes causales validées

| Surface | Chaîne | Verdict |
|---|---|---|
| Chat send | ConversationSection → useConversationEngine → processMessage → tauriClient → Rust | PASS |
| Config save | ConfigurationHub → tauriClient.updateChatEngineConfig → Rust | PASS |
| Audio TTS | toggleAudioEnabled → ttsEngineService → secureInvoke tts_* → Rust | PASS |
| Gouvernance secrets | SecretsTab → governanceService → safeInvoke → Rust | PASS |
| Prod health | ProductionHealthPanel → useProductionHealthTelemetry → IPC | PASS |
| Dev commands | handleExecuteCommand → oneCore.executeCommand → tauriClient | PASS |
| Cloud vault | VaultStatus → tauriClient.cloudBackupVault → Rust cloud commands | PASS |
