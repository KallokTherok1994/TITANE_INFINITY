# 17_GATES_REPORT

| Gate | Statut | Preuve |
|------|--------|--------|
| G_HEAD_TARGET_CONFIRMED | PASS | Binary compilé après HEAD, mtime binary > mtime main.rs |
| G_NODE_VERSION_TRUTH | BLOCKED | .nvmrc=22, actif=v20.20.0 — MISMATCH accepté (builds passent) |
| G_FEATURE_TRUTH | PASS | nm + strings: mock_commands::generate_response compilé, Cargo default=mock |
| G_GENERATE_RESPONSE_ACTIVE | PASS | L2 binary strings: "generate_response" dans table commandes enregistrées |
| G_CHAT_STATIC_TRUTH | PASS | ChatWindow monté, send_message non-mensonger, lint PASS |
| G_CHAT_RUNTIME_TRUTH | BLOCKED | generate_response enregistré (L2), UI interaction (L4) non prouvée en BACKGROUND |
| G_PROVIDER_META_TRUTH | PASS | mock active, Ollama disponible, API keys chargées (runtime log) |
| G_NETWORK_META_TRUTH | PASS | Ollama endpoint available (log), online check OK |
| G_MEMORY_META_TRUTH | PASS | UnifiedMemory initialized STM/MTM/LTM (runtime log) |
| G_CAMERA_STATIC_HONESTY | PASS | Jauges gated, disclaimers présents, ethical disclaimer permanent |
| G_DEVICE_ENUM_TRUTH | BLOCKED | /dev/video* absent — BLOCKED_HARDWARE |
| G_CAMERA_PREVIEW_TRUTH | BLOCKED | BLOCKED_HARDWARE |
| G_FRAME_TRUTH | BLOCKED | BLOCKED_HARDWARE |
| G_BODY_ANALYSIS_TRUTH | FAIL | NO_REAL_ANALYSIS — feature onnx inactive, estimationCount=0 constant |
| G_ENERGY_CLAIM_TRUTH | FAIL | SYMBOLIC_ONLY — visualEnergyLevel='medium' constante, masquée UI |
| G_TESTS_X3 | PASS | 36 frontend × 3 PASS (EXIT=0 × 3), 52 Rust × 3 PASS |
| G_BUILD_X3 | PASS | pnpm run build × 3 EXIT=0 |
| G_E2E_X3 | BLOCKED | Smoke conversation_generate × 2 PASS, UI E2E BLOCKED (BACKGROUND) |
| G_NO_SCOPE_DRIFT | PASS | Aucun patch dans cette session, proof pack seulement |
| G_ROLLBACK_READY | PASS | git restore -- src-tauri/src/main.rs (trivial) |

## Résumé gates

- PASS: 12
- FAIL: 2 (body/energy — pré-existants)
- BLOCKED: 6 (runtime/hardware/node — inhérents au mode)
