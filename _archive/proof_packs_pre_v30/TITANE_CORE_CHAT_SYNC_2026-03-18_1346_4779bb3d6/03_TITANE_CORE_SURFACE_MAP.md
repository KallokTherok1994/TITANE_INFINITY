# TITANE_CORE_SURFACE_MAP

## Page 1 — Identité & ADN
- Route: /titane (tab=identity)
- Component tree: TitanePage → IdentitySection → [ModeMatrix, PersonaEditor, IdentityCenter(Tauri-only)]
- Visible widgets: mode cards, ACTIF badge, persona sliders (tone/formality/creativity/empathy/technicality/verbosity), Save button
- Expected authority: Active chat persona/mode
- Current authority: LOCAL UI STATE ONLY — no IPC, no store binding
- Visible truth label? NO (pre-patch for ModeMatrix ACTIF)
- Runtime proven? PARTIAL — PersonaEditor save persists to localStorage (post-patch: consumed by chatEngine)
- Desktop proven? NO (BLOCKED_BY_ENV for IdentityCenter; ModeMatrix no desktop test)
- Risk of LYING_UI? HIGH → FIXED (ModeMatrix ACTIF hardcoded removed; PersonaEditor bridge wired)

## Page 2 — Progression & XP
- Route: /titane (tab=progression)
- Component tree: TitanePage → ProgressionSection → [XPProgressBar, AchievementCard×N, TBadge×4(talents), TMetric]
- Visible widgets: XP bar, level, achievements grid, talent badges
- Expected authority: xpEngine (IPC backend) + chat events
- Current authority: PARTIAL — xpEngine real IPC exists; fallback was 193000 XP (FIXED to 0); messageCount was 1247 (FIXED to 0)
- Visible truth label? NO
- Runtime proven? PARTIAL_CHAIN — XP gain on chat send PROVEN_RUNTIME; achievements STATIC_ONLY
- Desktop proven? PARTIAL
- Risk of LYING_UI? MEDIUM → REDUCED (fake fallbacks replaced with honest zeros)

## Page 3 — Transformation
- Route: /titane (tab=transformation)
- Component tree: TitanePage → TransformationSection → [TransformationRoadmap, TBadge×3, TMetric×7]
- Visible widgets: roadmap milestones, evolution tracks, paliers
- Expected authority: DISPLAY_ONLY (self-disclosed in component)
- Current authority: STATIC — generateMockMilestones() hardcoded array
- Visible truth label? YES — 📋 DISPLAY_ONLY banner exists
- Runtime proven? NO — zero IPC calls
- Desktop proven? NO
- Risk of LYING_UI? LOW — banner present; v27 feature label corrected
