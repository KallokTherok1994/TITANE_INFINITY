# GAP MATRIX (post-patch)

| Page | Surface | Pre-patch | Post-patch |
|---|---|---|---|
| Identity | ModeMatrix ACTIF badge | LYING_UI | DISPLAY_ONLY (hardcoded default removed) |
| Identity | PersonaEditor → systemPrompt | LYING_UI | PARTIAL_CHAIN (localStorage→prompt wired) |
| Identity | IdentityCenter | BLOCKED_BY_ENV | BLOCKED_BY_ENV |
| Identity | evolutionScore | DEFAULT_FAKE | PARTIAL_CHAIN (derived from XP) |
| Identity | ModeMatrix mode selection | DISPLAY_ONLY | DISPLAY_ONLY |
| XP | totalXP display | PARTIAL_CHAIN | PARTIAL_CHAIN |
| XP | level display | PARTIAL_CHAIN | PARTIAL_CHAIN |
| XP | XP gain on chat send | PROVEN_RUNTIME | PROVEN_RUNTIME |
| XP | messageCount=1247 | DEFAULT_FAKE | DISPLAY_ONLY (0, labeled) |
| XP | XP fallback=193000 | DEFAULT_FAKE | DISPLAY_ONLY (0, honest) |
| XP | achievements unlocked | STATIC_ONLY | STATIC_ONLY (no change — needs separate lock) |
| XP | talent badges | STATIC_ONLY | STATIC_ONLY |
| Transformation | Roadmap data | DISPLAY_ONLY | DISPLAY_ONLY |
| Transformation | v27 feature "PersonaEditor→systemPrompt" | LYING_UI | DISPLAY_ONLY (label corrected) |
| Transformation | DISPLAY_ONLY banner | PRESENT | PRESENT ✅ |
