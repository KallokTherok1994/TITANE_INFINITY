# 03 — TWINS CALL CHAIN MATRIX

| STEP_ID | LAYER | FILE | SYMBOL | INPUT | OUTPUT | SIDE_EFFECT | ERROR_MODE | RISK | PROVEN |
|---|---|---|---|---|---|---|---|---|---|
| CC-01 | Navigation | src/App.tsx:909 | nav item 'twins' | user click | navigate('/twins') | none | none | LOW | YES |
| CC-02 | Router | src/App.tsx:1246 | Route path="/twins" | URL /twins | render TwinsPage (lazy) | Suspense | ErrorBoundary | LOW | YES |
| CC-03 | Page | src/pages/TwinsPage.tsx | TwinsPage | none | render TwinEvolutionPanel | none | ErrorBoundary parent | LOW | YES |
| CC-04 | Component | src/components/twin/TwinEvolutionPanel.tsx | TwinEvolutionPanel | isAdmin, compact | renders 4 tabs | useEffect fetch | error banner | MEDIUM | YES |
| CC-05 | Hook | src/hooks/useTwinIdentity.ts | useTwinIdentity | none | identity, coreValues, humanStyle, fusionIndex | fetchIdentity on mount | setError → banner | MEDIUM | YES |
| CC-06 | Hook | src/hooks/useTwinEvolution.ts | useTwinEvolution | none | evolutionProfile, fusionIndex, growthTrends, suggestions | fetchData on mount | setError → banner | MEDIUM | YES |
| CC-07 | Service | src/services/api/numericTwin.ts | getIdentity() | none | TwinIdentityCore | none | throw error | MEDIUM | YES |
| CC-08 | Service | src/services/api/numericTwin.ts | getEvolutionProfile() | none | TwinEvolutionProfile | none | throw error | MEDIUM | YES |
| CC-09 | Service | src/services/api/numericTwin.ts | getFusionIndex() | none | FusionIndex | none | throw error | MEDIUM | YES |
| CC-10 | IPC | src/lib/security.ts | secureInvoke('twin_get_identity') | {} | TwinIdentityCore | whitelist check, logging | throw Error | MEDIUM | YES |
| CC-11 | IPC | src/lib/security.ts | secureInvoke('twin_get_fusion_index') | {} | FusionIndex | whitelist check, logging | throw Error | MEDIUM | YES |
| CC-12 | Tauri | src-tauri/src/main.rs:864 | NumericTwinState::manage | startup | state available | in-memory engine init | panic on startup | LOW | YES |
| CC-13 | Rust | src-tauri/src/numeric_twin/twin_commands.rs | twin_get_identity | State<NumericTwinState> | TwinIdentityCoreResponse | none | Err(String) | LOW | YES |
| CC-14 | Rust | src-tauri/src/numeric_twin/twin_commands.rs | twin_get_fusion_index | State<NumericTwinState> | FusionIndexResponse | none | Err(String) | LOW | YES |
| CC-15 | Rust | src-tauri/src/numeric_twin/mod.rs | NumericTwinEngine::get_state() | &self | TwinState | none | never panics | LOW | YES |

## Contradictions détectées

| ID | TYPE | DESCRIPTION | STATUS |
|---|---|---|---|
| CONTR-01 | RESOLVED | numeric_twin déclaré dans lib.rs mais commandes gérées dans main.rs — conforme: lib.rs est module stub mobile, main.rs est entry desktop | CONTRADICTION_RESOLVED |
| CONTR-02 | RESOLVED | TwinEvolutionPanelType dans index.ts exporte le default — la composante a bien un `export default TwinEvolutionPanel` à la fin | CONTRADICTION_RESOLVED |
| CONTR-03 | OPEN | useTwinBehavior défini et exporté mais jamais importé nulle part | CONTRADICTION_OPEN (dead code) |
