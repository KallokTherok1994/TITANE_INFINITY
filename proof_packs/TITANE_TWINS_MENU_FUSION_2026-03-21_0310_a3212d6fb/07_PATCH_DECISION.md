# 07_PATCH_DECISION

## Primary Lock
**Lock #9: TWINS still behaves as a side-module although menu says TITANE**
TWINS was in the overflow Plus menu with no explicit parent relationship to TITANE.
The nav structure (flat TopNavItem list) had TWINS as a peer of TITANE, not a child.

## Chosen Fusion Model
**OPTION B — TITANE > Symbiose tab**

## Files Touched
1. `src/pages/TitanePage.tsx` — additive: symbiose tab (TabId, handlers, JSX, renderActiveSection)
2. `src/App.tsx` — subtractive: remove twins from topNavSections; change /twins and /twin to redirect; remove TwinsPage lazy import

## Not Touched (intentionally)
- `src/pages/TwinsPage.tsx` — preserved (backward-compatible, no longer nav-routed)
- `src/components/twin/TwinEvolutionPanel.tsx` — unchanged
- `src/hooks/useTwinIdentity.ts` — unchanged
- `src/hooks/useTwinEvolution.ts` — unchanged
- `src/services/api/numericTwin.ts` — unchanged
- `src/services/chat/chatMemorySingleDoor.ts` — unchanged
- `src-tauri/src/numeric_twin/twin_commands.rs` — unchanged
- `src-tauri/src/main.rs` — unchanged
- Capabilities/allowlist — unchanged

## Semantic Label
Tab label chosen: "🔀 Symbiose"
- "Symbiose" is grounded in existing repo language: TwinsPage.tsx header says "symbiose Kevin ↔ TITANE"
- Naming is consistent with conversation_engine prompt string and type descriptions
- testid: `tab-symbiose`

## Invariants Satisfied
- I1 Tauri-first: backend IPC chain unchanged ✅
- I2 No fake fusion: TwinEvolutionPanel actually mounts in symbiose tab ✅
- I3 No broken continuity: /twins → /titane redirect in place ✅
- I4 No broad refactor: 2 files, additive ✅
- I5 No fake TITANE ownership: TwinEvolutionPanel is the real component ✅
- I6 No silent route loss: /twins redirects, not deleted ✅
- I7 No fake chat integration: PROMPT_EFFECT_PROVEN, RESPONSE_EFFECT_UNPROVEN explicitly classified ✅
