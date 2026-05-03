# DIFF_FILES

## Files modified

### src/services/ai/chatEngine.ts
- Method: buildSystemPrompt() (~line 1945)
- Change: Added localStorage persona profile injection after basePrompt construction
- Impact: PersonaEditor persona settings now reach AI provider system prompt

### src/features/identity/ModeMatrix.tsx
- Line 38
- Change: `currentMode = 'architect'` → `currentMode` (no default)
- Impact: ACTIF badge no longer shown by default without real active mode

### src/pages/TitanePage.tsx
- Lines 176-181
- Change: totalXP fallback 193000→0, level fallback 19→1, evolutionScore 92→derived formula
- Impact: Honest values shown when IPC unavailable

### src/components/sections/ProgressionSection.tsx
- Lines 49-50
- Change: messageCount 1247→0, modesUsed 4→0 with DISPLAY_ONLY comment
- Impact: Achievement progress no longer uses fake counts

### src/features/transformation/TransformationRoadmap.tsx
- Line 368
- Change: Feature label updated to '[câblé v28.1]' to reflect actual completion status
- Impact: v27 milestone no longer falsely claims PersonaEditor→systemPrompt was completed in v27
