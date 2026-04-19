# CONVERSATION_ASSISTANT_READABILITY_2026-04-18

Date: 2026-04-18
Surface canonique: /titane?tab=conversation
Verdict: PASS

## Symptom

Les réponses TITANE paraissaient incomplètes sur la surface conversation canonique alors qu aucune troncature backend n a été prouvée sur la voie auditée.

## Root Cause

`ConversationSection` rendait les réponses assistant comme du texte brut dans une bulle trop étroite. La structure markdown existante restait donc invisible sur la surface active, et les longues réponses étaient perçues comme compressées ou incomplètes.

## Applied Fix

- `src/components/sections/ConversationSection.tsx` rend désormais les messages assistant via `MarkdownContent` tout en conservant `chat-message-content`.
- `src/pages/TitanePage.css` augmente la largeur utile des bulles assistant, fullscreen et compact.
- `src/components/chat/__tests__/MarkdownContent.test.tsx` verrouille le rendu markdown sans marqueurs bruts.
- `e2e/critical/chat-interaction.spec.ts` verrouille la visibilité d une réponse longue et le rendu markdown assistant sur la surface canonique.

## Proof

- `runTests` sur `MarkdownContent.test.tsx` et `ConversationSection.test.ts`: PASS (42 tests)
- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep "LONG_RESPONSE_VISIBLE_COMPLETE|ASSISTANT_MARKDOWN_RENDERING" --reporter=line`: PASS (2 tests)
- `corepack pnpm -s verify:registry`: PASS
- `bash scripts/autoheal/detect_recurrence.sh`: PASS
- `bash scripts/verify_instructions.sh`: PASS

## Rollback

`git restore -- src/components/sections/ConversationSection.tsx src/pages/TitanePage.css src/components/chat/__tests__/MarkdownContent.test.tsx e2e/critical/chat-interaction.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`