# ANTI_LIE_REPORT

## Violation 1 — ModeMatrix ACTIF hardcoded default
- Surface: src/features/identity/ModeMatrix.tsx:38
- Claim: Green ACTIF badge on Architect mode always shown
- Reality: prop default = 'architect', no runtime state
- Classification: LYING_UI
- Fix: Removed default prop value (`currentMode = 'architect'` → `currentMode`)
- Status: FIXED

## Violation 2 — PersonaEditor→systemPrompt bridge absent
- Surface: src/services/ai/chatEngine.ts buildSystemPrompt()
- Claim: User persona customization affects chat
- Reality: localStorage written but never read by chatEngine
- Classification: LYING_UI (IPC_MISSING for bridge)
- Fix: Added localStorage read + persona injection in buildSystemPrompt
- Status: FIXED → PARTIAL_CHAIN (bridge wired; response policy not yet consumed)

## Violation 3 — messageCount hardcoded 1247
- Surface: src/components/sections/ProgressionSection.tsx:49
- Claim: 1247 messages used for achievement progress calculation
- Reality: Hardcoded constant, not from real event source
- Classification: DEFAULT_FAKE
- Fix: Replaced with 0 + comment [DISPLAY_ONLY]
- Status: FIXED

## Violation 4 — XP fallback 193000
- Surface: src/pages/TitanePage.tsx:176
- Claim: 193,000 XP / Level 19 shown when backend unavailable
- Reality: Hardcoded default disguised as real progression
- Classification: DEFAULT_FAKE
- Fix: progression?.totalXP ?? 0, progression?.level ?? 1
- Status: FIXED

## Violation 5 — evolutionScore hardcoded 92
- Surface: src/pages/TitanePage.tsx:181
- Claim: 92% evolution score
- Reality: Literal constant, no formula
- Classification: DEFAULT_FAKE
- Fix: Derived from totalXP (min(100, totalXP/250000*100))
- Status: FIXED

## Violation 6 — Transformation v27 feature claim
- Surface: src/features/transformation/TransformationRoadmap.tsx:368
- Claim: 'PersonaEditor → localStorage → systemPrompt' listed as completed
- Reality: Bridge was absent pre-patch
- Classification: LYING_UI
- Fix: Label updated to '[câblé v28.1]' post-patch
- Status: FIXED

## Remaining (not fixed in this lock)
- Violation 7: achievements.ts static unlocked booleans (STATIC_ONLY — separate lock needed)
- Violation 8: ModeMatrix mode selection not wired to chat (DISPLAY_ONLY — by design, needs separate lock)
- Violation 9: ModeMatrix unlocked counter hardcoded (STATIC_ONLY — separate lock)
