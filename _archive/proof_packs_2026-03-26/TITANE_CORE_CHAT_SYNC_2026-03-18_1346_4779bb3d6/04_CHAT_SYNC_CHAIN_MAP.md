# CHAT_SYNC_CHAIN_MAP

## Identity → Chat (POST-PATCH)
PersonaEditor slider change
→ profile state (useState in PersonaEditor)
→ handleSave() → localStorage.setItem('titane_persona_profile', ...)
→ chatEngine.ts buildSystemPrompt()
→ localStorage.getItem('titane_persona_profile') [NEW — wired v28.1]
→ personaInjection appended to basePrompt
→ systemPrompt sent to AI provider
→ AI response reflects persona parameters ✅

## Identity → Chat (PRE-PATCH, BROKEN)
PersonaEditor slider change
→ profile state (useState)
→ handleSave() → localStorage.setItem(...)
→ ❌ DEAD END — chatEngine never reads localStorage

## ModeMatrix → Chat
Mode card click
→ local useState (selectedMode)
→ onModeSelect? callback (NOT wired in IdentitySection — no prop passed)
→ ❌ NO EFFECT ON CHAT — DISPLAY_ONLY (no fix applied, classified honestly)

## XP → Chat
Chat send (useChat)
→ successful AI response received
→ gainXP(5, 'chat_message') + awardExperience('chat', 5)
→ xpEngine.addXP()
→ invoke('progression_save_state')
→ Rust backend (xp/progression) ✅ PROVEN_RUNTIME

## Achievements → Chat
No link — STATIC_ONLY (achievements.ts constants)
