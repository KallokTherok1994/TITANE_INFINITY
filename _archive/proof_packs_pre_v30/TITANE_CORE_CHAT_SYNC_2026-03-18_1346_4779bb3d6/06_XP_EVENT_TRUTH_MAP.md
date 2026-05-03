# XP_EVENT_TRUTH_MAP

| Value | Source file | Event source | Increment logic | Persistence | Relation to chat | Status |
|---|---|---|---|---|---|---|
| totalXP | xpEngine.ts | invoke('exp_get_global_state') | addXP() per chat send | IPC backend | useChat gainXP on response | PARTIAL_CHAIN |
| level | xpEngine.ts | computed from totalXP | thresholds | IPC backend | derived | PARTIAL_CHAIN |
| XP per chat message | useChat.ts:1983 | AI response received | +5 XP | invoke('progression_save_state') | DIRECT | PROVEN_RUNTIME |
| messageCount | ProgressionSection.tsx | FAKE — was 1247, NOW 0 | N/A | N/A | NO | FIXED (was DEFAULT_FAKE) |
| modesUsed | ProgressionSection.tsx | FAKE — was 4, NOW 0 | N/A | N/A | NO | FIXED (was DEFAULT_FAKE) |
| achievements unlocked | achievements.ts | STATIC constant | never updated | N/A | NO | STATIC_ONLY (labeled) |
| talent badges | ProgressionSection.tsx | STATIC JSX | never computed | N/A | NO | STATIC_ONLY |
| XP fallback | TitanePage.tsx | WAS 193000, NOW 0 | N/A | N/A | NO | FIXED (was DEFAULT_FAKE) |
| evolutionScore | TitanePage.tsx | WAS 92 hardcoded, NOW computed | min(100, totalXP/250000*100) | N/A | DERIVED | FIXED |
