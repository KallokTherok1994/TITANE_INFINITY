# ROLLBACK

Command:

`git restore -- src/components/sections/MemorySection.tsx src/components/chat/MemoryDashboard.tsx src/features/memory/MemoryTreeViewer.tsx src/features/memory/MemorySearchPanel.tsx src/features/governance-center/GovernanceCenterPage.tsx src/__tests__/components/sections/MemorySection.test.tsx src/__tests__/components/chat/MemoryDashboard.test.tsx src/__tests__/features/memory/MemoryVisualization.test.tsx src/__tests__/features/memory/MemorySearch.test.tsx src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap src/features/governance-center/__tests__/GovernanceCenterPage.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_MEMORY_GOVERNANCE_ZERO.md proof_packs/A11Y_REDUCTION_2026-05-14_MEMORY_GOVERNANCE_ZERO`

Expected rollback effect:
- Restaure les surfaces mémoire et gouvernance-center à l état antérieur à la fermeture a11y finale.
- Retire le rapport et le proof pack de cette tranche.