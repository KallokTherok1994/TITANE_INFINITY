# 09 — RUNTIME TRACE INDEX

No runtime traces available (static analysis + unit test mode).

Desktop traces: BLOCKED (G_DESKTOP_TARGET_TRUTH = BLOCKED)

Unit test coverage (as runtime proxy):
- B1-B7: localStorage → envelope chain verified
- C1-C3: context binding contract verified (mirrors Rust extract_context_binding)
- D1-D2: effect classification documented (PROMPT_EFFECT_PROVEN / RESPONSE_EFFECT_UNPROVEN)

For desktop runtime traces, run Tauri build and check logs in:
- logs/tauri_*.log
- reports/e2e_desktop_twins_*.log
