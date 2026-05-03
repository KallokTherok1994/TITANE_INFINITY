# 15_GATES_REPORT

| Gate | Statut | Preuve |
|------|--------|--------|
| G_COMMIT_PRESENT | PASS | git log: 536d86574 présent |
| G_SOURCE_PATCH_PRESENT | PASS | grep: ChatWindow, not implemented, estimationCount > 0, landmarksDetected — tous confirmés |
| G_CHAT_STATIC_TRUTH | PASS | ChatWindow monté, send_message non-mensonger, imports OK |
| G_CHAT_RUNTIME_TRUTH | BLOCKED | Desktop Tauri non lancé — EXEC_MODE: BACKGROUND |
| G_SEND_MESSAGE_NO_FAKE_SUCCESS | PASS | chat.rs:39 Err("not implemented"), compliance test: PASS |
| G_CAMERA_STATIC_TRUTH | PASS | Jauges conditionnées, disclaimer présent |
| G_DEVICE_ENUM_TRUTH | BLOCKED | Hardware camera absent — BLOCKED_HARDWARE |
| G_CAMERA_PREVIEW_TRUTH | BLOCKED | Hardware camera absent |
| G_FRAME_TRUTH | BLOCKED | Hardware camera absent |
| G_BODY_ANALYSIS_TRUTH | FAIL | estimationCount=0 constant, landmarksDetected=false, aucun modèle ML (feature onnx inactive) |
| G_ENERGY_CLAIM_TRUTH | FAIL | visualEnergyLevel='medium' constant — SYMBOLIC_ONLY, jamais calculé |
| G_TARGETED_TESTS_PASS | PASS | 36/36 frontend PASS, 52 Rust chat PASS |
| G_BUILD_SMOKE_PASS | PASS | pnpm run build EXIT=0 |
| G_E2E_SMOKE_PASS | BLOCKED | E2E desktop non exécuté — BACKGROUND mode |
| G_NO_SCOPE_DRIFT | PASS | Seuls src-tauri/src/main.rs + autoheal_rules.jsonl touchés post-audit |
| G_ROLLBACK_READY | PASS | git restore -- src-tauri/src/main.rs (trivial) |

## Résumé

- PASS: 9
- FAIL: 2 (body/energy analysis = pré-existants, non introduits par 536d86574)
- BLOCKED: 5 (runtime/hardware — inhérent au mode BACKGROUND)

Note: G_BODY_ANALYSIS_TRUTH et G_ENERGY_CLAIM_TRUTH = FAIL pré-existants.
Ils ne sont pas régressés par 536d86574 — ils sont MIEUX exposés (gauges cachées, disclaimer).
