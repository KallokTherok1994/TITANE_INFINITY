# 02_TWINS_SCOPE_MATRIX

## Cible primaire: Numeric Twin Engine (vΩ∞)

| Composant | Chemin | Type | Statut |
|---|---|---|---|
| TwinEvolutionPanel | `src/components/twin/TwinEvolutionPanel.tsx` | UI Component | ✅ Existe |
| TwinEvolutionPanel.css | `src/components/twin/TwinEvolutionPanel.css` | Styles | ✅ Existe |
| twin/index.ts | `src/components/twin/index.ts` | Export barrel | ✅ Existe |
| useTwinBehavior | `src/hooks/useTwinBehavior.ts` | Hook React | ✅ Existe |
| useTwinEvolution | `src/hooks/useTwinEvolution.ts` | Hook React | ✅ Existe |
| useTwinIdentity | `src/hooks/useTwinIdentity.ts` | Hook React | ✅ Existe |
| numericTwinService | `src/services/api/numericTwin.ts` | Service IPC | ✅ Existe |
| numericTwin types | `src/types/numericTwin.ts` | Types TS | ✅ Existe |
| twin_commands.rs | `src-tauri/src/numeric_twin/twin_commands.rs` | IPC handlers | ✅ Existe |
| operational_twin.rs | `src-tauri/src/numeric_twin/operational_twin.rs` | Core engine | ✅ Existe |
| cognitive_modeler.rs | `src-tauri/src/numeric_twin/cognitive_modeler.rs` | Sub-engine | ✅ Existe |
| creative_mirror.rs | `src-tauri/src/numeric_twin/creative_mirror.rs` | Sub-engine | ✅ Existe |
| evolution_syncer.rs | `src-tauri/src/numeric_twin/evolution_syncer.rs` | Sub-engine | ✅ Existe |
| identity_collector.rs | `src-tauri/src/numeric_twin/identity_collector.rs` | Sub-engine | ✅ Existe |
| numeric_twin/mod.rs | `src-tauri/src/numeric_twin/mod.rs` | Module root | ✅ Existe |

## Preuves de l'identification
- Terme "twin" présent dans: src/hooks/useTwinBehavior.ts, useTwinEvolution.ts, useTwinIdentity.ts
- Module Rust `src-tauri/src/numeric_twin/` avec 8 commandes Tauri
- Types TypeScript `src/types/numericTwin.ts` (311 lignes, 20+ interfaces)
- Service `src/services/api/numericTwin.ts` invoquant 8 commandes IPC `twin_*`

## Équivalents sémantiques vérifiés
- "Digital Twin" / "Numeric Twin" / "n numérique" / "symbiose Kevin ↔ TITANE"
- Terme dans code: `NumericTwinEngine`, `NumericTwinState`, `TwinState`
- Pas de page/route dédiée — composant `TwinEvolutionPanel` non monté dans routing
