# IDENTITY_EFFECT_MAP

| Control | Selected in UI? | Persisted | Consumed by prompt? | Consumed by response policy? | Decorative? | Status |
|---|---|---|---|---|---|---|
| Persona name | YES | localStorage | YES (post-patch) | NO | NO | PARTIAL_CHAIN |
| Tone preset | YES | localStorage | YES (post-patch) | NO | NO | PARTIAL_CHAIN |
| Formality slider | YES | localStorage | YES (post-patch) | NO | NO | PARTIAL_CHAIN |
| Creativity slider | YES | localStorage | YES (post-patch) | NO | NO | PARTIAL_CHAIN |
| Empathy slider | YES | localStorage | YES (post-patch) | NO | NO | PARTIAL_CHAIN |
| Technicality slider | YES | localStorage | YES (post-patch) | NO | NO | PARTIAL_CHAIN |
| Emoji toggle | YES | localStorage | YES (post-patch) | NO | NO | PARTIAL_CHAIN |
| Explanations selector | YES | localStorage | YES (post-patch) | NO | NO | PARTIAL_CHAIN |
| Mode matrix selection | YES (local) | NOT PERSISTED | NO | NO | YES | DISPLAY_ONLY |
| ACTIF badge (ModeMatrix) | WAS DEFAULT | N/A | NO | NO | WAS LYING_UI | FIXED (no default) |
| IdentityCenter | TAURI-ONLY | Tauri store | PARTIAL | PARTIAL | NO | BLOCKED_BY_ENV |
