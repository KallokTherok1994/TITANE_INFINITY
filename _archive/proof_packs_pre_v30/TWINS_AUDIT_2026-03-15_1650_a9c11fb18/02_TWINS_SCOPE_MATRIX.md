# 02 — TWINS SCOPE MATRIX

| CANDIDATE_ID | KIND | PATH | SYMBOL_OR_LABEL | WHY_RELEVANT | DIRECT_EVIDENCE | PROVEN | PRIMARY | STATUS |
|---|---|---|---|---|---|---|---|---|
| T-01 | page | src/pages/TwinsPage.tsx | TwinsPage | Page hôte du Numeric Twin Engine | App.tsx:231-232, route /twins | YES | YES | PRIMARY |
| T-02 | component | src/components/twin/TwinEvolutionPanel.tsx | TwinEvolutionPanel | Composant central de l'UI twin | Import dans TwinsPage.tsx | YES | YES | PRIMARY |
| T-03 | hook | src/hooks/useTwinIdentity.ts | useTwinIdentity | Hook identité twin (IPC identity) | Import dans TwinEvolutionPanel | YES | NO | SECONDARY |
| T-04 | hook | src/hooks/useTwinEvolution.ts | useTwinEvolution | Hook évolution+fusion (IPC evol/fusion) | Import dans TwinEvolutionPanel | YES | NO | SECONDARY |
| T-05 | hook | src/hooks/useTwinBehavior.ts | useTwinBehavior | Hook observation comportementale | Défini, JAMAIS importé | YES | NO | SECONDARY (dead) |
| T-06 | service | src/services/api/numericTwin.ts | numericTwinService | Service IPC centralisé | Import dans useTwinIdentity/useTwinEvolution | YES | NO | SECONDARY |
| T-07 | types | src/types/numericTwin.ts | TwinState, FusionIndex, etc. | Types TS pour tout le scope twin | Import dans service + hooks | YES | NO | SECONDARY |
| T-08 | route | src/App.tsx:1246 | /twins | Route React Router | App.tsx lazy TwinsPage + ErrorBoundary | YES | NO | SECONDARY |
| T-09 | route | src/App.tsx:1253 | /twin → /twins | Redirect de compatibilité | App.tsx Navigate | YES | NO | SECONDARY |
| T-10 | nav | src/App.tsx:909-913 | id:'twins', label:'TWIN' | Item navigation sidebar | createTopNavItems | YES | NO | SECONDARY |
| T-11 | whitelist | src/lib/security.ts:916-923 | 8 twin_* commands | Whitelist secureInvoke | Lignes 916-923 | YES | NO | SECONDARY |
| T-12 | command | src-tauri/src/numeric_twin/twin_commands.rs | 8 #[tauri::command] | Handlers Rust | Lignes 1953-1962 main.rs | YES | NO | SECONDARY |
| T-13 | state | src-tauri/src/main.rs:864 | NumericTwinState | Managed state Tauri | main.rs:864 .manage() | YES | NO | SECONDARY |
| T-14 | engine | src-tauri/src/numeric_twin/mod.rs | NumericTwinEngine | Moteur Rust 6 sous-moteurs | pub mod numeric_twin lib.rs:259 | YES | NO | SECONDARY |
| T-15 | legacy | src-tauri/src/digital_twin_v14_1/ | digital_twin_v14_1 | Ancienne version | Présent mais non exposé IPC | YES | NO | LEGACY |
| T-16 | bridge | src-tauri/src/meta_mode_engine/digital_twin_bridge.rs | digital_twin_bridge | Bridge meta-mode → twin | meta_mode_engine scope | YES | NO | SECONDARY |
| T-17 | test | e2e/, tests/ | aucun | Test twins dédié | Aucun fichier trouvé | NO | NO | UNKNOWN (gap) |
| T-18 | doc | proof_packs/ | AH-2026-03-15-TWINS-001/002 | Autoheal précédents | autoheal_rules.jsonl | YES | NO | SECONDARY |
