# SCANS_SECRETS
./orchestration/scripts/update-state.ts:39:  console.log(chalk.yellow('Usage: pnpm run update <task-id> <completed|failed>'));
./GH_AUTH_GUIDE.md:44:5. Sauvegarder: `echo "ghp_YOUR_TOKEN" > ~/.github/token.txt`
./DEPLOYMENT_REPORT_v27.0.2.md:212:- **gh CLI Auth:** Pré-configurer `GH_TOKEN` dans CI/CD pour releases automatiques
./DEPLOYMENT_READINESS_v27.0.3.txt:35:  Status: ⏳ AWAITING DEPLOY TOKEN
./orchestration/ORCHESTRATION.md:71:        ├── task-template.md
./orchestration/ORCHESTRATION.md:162:2. Conductor creates plan in plans/<task-id>-plan.md
./orchestration/ORCHESTRATION.md:199:4. Create report in plans/<task-id>-complete.md
./orchestration/ORCHESTRATION.md:229:In `plans/` directory, create `<task-id>-plan.md`:
./orchestration/ORCHESTRATION.md:232:# Task Plan — <task-id>
./_archive/omnis_backup_20251215/omnis/hardenedProviders_OMNIS_v1_Clean.ts:45:// GEMINI - OMNIS HARDENED (Vitesse + Intelligence)
./_archive/omnis_backup_20251215/omnis/hardenedProviders_OMNIS_v1_Clean.ts:120:// OPENAI MOCK - OMNIS HARDENED (En attente du vrai provider)
./_archive/omnis_backup_20251215/omnis/hardenedProviders_OMNIS_v1.ts:63: * GEMINI - OMNIS HARDENED (Vitesse + Intelligence)
./_archive/omnis_backup_20251215/omnis/hardenedProviders_OMNIS_v1.ts:148: * OPENAI - OMNIS HARDENED MOCK (En attente du vrai provider)
./P8_2_EXECUTION_COMPLETE.md:135:## TOKEN PROTECTION VERIFICATION
./P8_2_EXECUTION_COMPLETE.md:139:1. ✅ Read from environment variable (`P8_APPROVAL_TOKEN`)
./P8_2_EXECUTION_COMPLETE.md:352:P8_APPROVAL_TOKEN="$NEW_TOKEN" node scripts/ops/p8_record_approval.mjs
./TITANE_FINAL_STATUS_v27.0.0.md:164:- Memory injection cap: `MAX_INJECTION_TOKENS = 500`
./e2e/chat-provider-decision-certification-structural.spec.ts:64:    'NO_API_KEY',
./_archive/2026-01-17/test_vision.py:8:client = openai.OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")
./DEEP_DIVE_ANALYSIS_FINAL_v37.0.0.md:205:   • GEMINI_API_KEY: Documented (not committed) ✅
./DEEP_DIVE_ANALYSIS_FINAL_v37.0.0.md:206:   • OPENAI_API_KEY: Documented (not committed) ✅
./_archive/2026-01-17/final-audit-20260115-120003.md:39:- Note observée : warning `TITANE_SECRETS_PASSPHRASE` manquante → mode bootstrap (stockage séparé). Nécessite une variable d’environnement au runtime pour activer le stockage chiffré principal.
./CHAT_MEM_PROOFS.md:202:  const maxTokens = permissions.contextInjectionLimit || MAX_CONTEXT_INJECTION_TOKENS;
./_archive/2026-01-17/test_text.py:3:client = openai.OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")
./runs/v39/SCANS_SECRETS.md:1:# SCANS SECRETS V39 (RAW - SANITIZED)
./runs/v39/SCANS_SECRETS.md:4:Source canonique: `runs/v39/proof_pack/05_SCANS_SECRETS.md`.
./TITANE_GLOBAL_PROOFS.md:170:const MAX_INJECTION_TOKENS = 500;
./TITANE_GLOBAL_PROOFS.md:177:  if (currentTokens + entryTokens > MAX_INJECTION_TOKENS) {
./runs/v39/proof_pack/08_SHA256SUMS.txt:12:0d4cd7de914054d8940173130923b43e1eb4379a02510315e92ddc46c9d51b91  runs/v39/proof_pack/05_SCANS_INDEX_SECRETS.md
./runs/v39/proof_pack/08_SHA256SUMS.txt:14:e7671808e46976baa105e617daaf0dfa6b240afab9d8d7f1a2c21ab350a94cea  runs/v39/proof_pack/05_SCANS_SECRETS.md
./_archive/chat_consolidation_20251215/ChatIA_legacy.tsx:105:      const geminiConfigured = false; // GEMINI DÉSACTIVÉ
./_archive/chat_consolidation_20251215/ChatIA_legacy.tsx:259:              {/* GEMINI DÉSACTIVÉ - Ne pas utiliser */}
./_archive/chat_consolidation_20251215/ChatIA_legacy.tsx:284:          {/* GEMINI DÉSACTIVÉ */}
./runs/v39/proof_pack/05_SCANS_INDEX_SECRETS.md:1:# 05_SCANS_INDEX_SECRETS.md — INDEX SECRETS V39
./runs/v39/proof_pack/05_SCANS_INDEX_SECRETS.md:3:- Summary: `runs/v39/proof_pack/05_SCANS_SECRETS.md`
./runs/v39/proof_pack/05_SCANS_INDEX_SECRETS.md:4:- Raw scan: `runs/v39/SCANS_SECRETS.md`
./runs/v39/proof_pack/05_SCANS_SECRETS.md:1:# 05_SCANS_SECRETS.md — SCAN SECRETS V39
./runs/v39/proof_pack/05_SCANS_SECRETS.md:5:Source brut: `runs/v39/SCANS_SECRETS.md`
./src-tauri/src/api/chat_commands.rs:19:    pub api_key: Arc<Mutex<Option<String>>>,
./src-tauri/src/api/chat_commands.rs:27:            api_key: Arc::new(Mutex::new(None)),
./src-tauri/src/api/chat_commands.rs:74:pub async fn chat_set_api_key(
./src-tauri/src/api/chat_commands.rs:75:    api_key: String,
./src-tauri/src/api/chat_commands.rs:78:    let mut key = state.api_key.lock().await;
./src-tauri/src/api/chat_commands.rs:79:    *key = Some(api_key);
./src-tauri/src/api/chat_commands.rs:85:    let key = state.api_key.lock().await;
./runs/v39/proof_pack/09_MANIFEST_V39.md:16:- `05_SCANS_SECRETS.md`
./runs/v39/proof_pack/09_MANIFEST_V39.md:17:- `05_SCANS_INDEX_SECRETS.md`
./runs/v39/proof_pack/05_SCANS_INDEX.md:4:- SECRETS: runs/v39/proof_pack/05_SCANS_SECRETS.md
./runs/v39/proof_pack/05_SCANS_INDEX.md:7:- RAW_SECRETS: runs/v39/SCANS_SECRETS.md
./src-tauri/src/commands/ia_commands.rs:15:    SecureSecretsEngine, KEY_CLAUDE, KEY_GEMINI, KEY_OPENAI,
./src-tauri/src/commands/ia_commands.rs:61:pub async fn set_api_key(
./src-tauri/src/commands/ia_commands.rs:75:            .set_secret(KEY_GEMINI, request.key)
./src-tauri/src/commands/ia_commands.rs:99:pub async fn delete_api_key(
./src-tauri/src/commands/ia_commands.rs:106:        "openai" | "gpt" => KEY_OPENAI,
./src-tauri/src/commands/ia_commands.rs:108:        "gemini" => KEY_GEMINI,
./src-tauri/src/commands/ia_commands.rs:146:pub async fn test_api_key(
./src-tauri/src/commands/diagnostic_commands.rs:106:    let openai_configured = state.openai_api_key.read().await.is_some();
./src-tauri/src/commands/diagnostic_commands.rs:120:    let gemini_configured = state.gemini_api_key.read().await.is_some();
./src-tauri/src/commands/diagnostic_commands.rs:134:    let anthropic_configured = state.anthropic_api_key.read().await.is_some();
./src-tauri/src/commands/orchestration_center.rs:134:    // Check if GEMINI_API_KEY is set (either from secrets engine or env var)
./src-tauri/src/commands/orchestration_center.rs:135:    let api_key = if let Some(engine) = secrets {
./src-tauri/src/commands/orchestration_center.rs:136:        match engine.get_secret("gemini_api_key") {
./src-tauri/src/commands/orchestration_center.rs:138:            _ => std::env::var("GEMINI_API_KEY").ok(),
./src-tauri/src/commands/orchestration_center.rs:141:        std::env::var("GEMINI_API_KEY").ok()
./src-tauri/src/commands/orchestration_center.rs:144:    let has_key = api_key.is_some();
./src-tauri/src/commands/orchestration_center.rs:160:    let api_key = api_key.expect("API key checked above");
./src-tauri/src/commands/orchestration_center.rs:166:        api_key
./src-tauri/src/commands/orchestration_center.rs:1064:// GOOGLE CLOUD SERVICES - GEMINI API v∞ (22 services activés)
./src-tauri/src/commands/orchestration_center.rs:1080:    pub api_key_configured: bool,
./src-tauri/src/commands/orchestration_center.rs:1094:    let api_key = match secrets.get_secret("gemini_api_key") {
./src-tauri/src/commands/orchestration_center.rs:1099:                api_key_configured: false,
./src-tauri/src/commands/orchestration_center.rs:1150:        api_key
./src-tauri/src/commands/orchestration_center.rs:1169:        api_key_configured: true,
./src-tauri/src/commands/ai_chat.rs:76:            SecureSecretsEngine::new(std::env::var("TITANE_SECRETS_PASSPHRASE").ok())
./src-tauri/src/commands/ai_chat.rs:80:            .get_secret("gemini_api_key")
./src-tauri/src/commands/ai_chat.rs:83:            .or_else(|| std::env::var("GEMINI_API_KEY").ok());
./src-tauri/src/commands/hybrid.rs:151:            issues.push("Contains task-marker comments".to_string());
./src-tauri/src/commands/hybrid.rs:154:            issues.push("Contains task-marker comments".to_string());
./runs/DOCS_UPGRADE_20260223_203132/PROOF/docs_living_legacy_terms.txt:34:docs/ai/SECRETS_STORAGE.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/docs_truly_living.txt:33:docs/ai/SECRETS_STORAGE.md
./runs/super_prompt_audit_v1/SECTION_2_DIAGNOSTIC_CAUSAL.md:443:- GEMINI_API_KEY=<valid_key>
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1103:./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/AUTHORITY_NOTIFICATION_TEMPLATE.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1104:./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/LOCK.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1105:./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/RESUME_PROCEDURE.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1106:./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/TIMEOUT_POLICY.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1107:./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/VERDICT.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1108:./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/WAIT_STATE_DECLARATION.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1400:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1980:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2087:./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2119:./docs/99_ARCHIVE/sessions/GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2563:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2704:./docs/ai/SECRETS_STORAGE.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:4408:./docs/_evidence/DEPLOYMENT_FINAL_AUTHORIZATION/TOKENS_VERIFIED_FINAL.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:4455:./docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/runs/BUILD_BLOCKED_TOKEN_MISSING.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:4482:./docs/_evidence/RELEASE_PROMOTION_20260221_201727/BUILD_BLOCKED_TOKEN_MISSING.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:4492:./docs/_evidence/RELEASE_PROMOTION_P4_20260223_104213/AUTHORIZATION_TOKENS_VERIFIED.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:4646:./docs/GEMINI_CONFIGURATION.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:4863:./docs/SECRETS.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:5181:./orchestration/templates/task-complete.md
./src-tauri/src/commands/copilot_commands.rs:69:    pub api_key: Arc<RwLock<Option<String>>>,
./src-tauri/src/commands/copilot_commands.rs:101:    let api_key = state.api_key.read().await;
./src-tauri/src/commands/copilot_commands.rs:102:    let key = match api_key.as_ref() {
./src-tauri/src/commands/copilot_commands.rs:112:    drop(api_key);
./src-tauri/src/commands/copilot_commands.rs:199:    api_key: String,
./src-tauri/src/commands/copilot_commands.rs:208:    debug!("chat_set_copilot_key: key length={}", api_key.len());
./src-tauri/src/commands/copilot_commands.rs:211:    if api_key.trim().is_empty() {
./src-tauri/src/commands/copilot_commands.rs:219:    if api_key.len() < 16 {
./src-tauri/src/commands/copilot_commands.rs:228:    if !api_key.starts_with("ghp_")
./src-tauri/src/commands/copilot_commands.rs:229:        && !api_key.starts_with("github_pat_")
./src-tauri/src/commands/copilot_commands.rs:230:        && !api_key.starts_with("gho_")
./src-tauri/src/commands/copilot_commands.rs:243:    let mut key_lock = state.api_key.write().await;
./src-tauri/src/commands/copilot_commands.rs:244:    *key_lock = Some(api_key.clone());
./src-tauri/src/commands/copilot_commands.rs:248:    if let Err(e) = state.secrets_engine.set_secret(KEY_COPILOT, api_key.clone()) {
./src-tauri/src/commands/copilot_commands.rs:277:    let api_key = state.api_key.read().await;
./src-tauri/src/commands/copilot_commands.rs:278:    let configured = api_key.is_some();
./src-tauri/src/commands/copilot_commands.rs:279:    drop(api_key);
./src-tauri/src/commands/copilot_commands.rs:308:    let api_key = state.api_key.read().await;
./src-tauri/src/commands/copilot_commands.rs:309:    let key = match api_key.as_ref() {
./src-tauri/src/commands/copilot_commands.rs:320:    drop(api_key);
./src-tauri/src/commands/chat_generate_commands.rs:53:// GEMINI COMMAND
./src-tauri/src/commands/chat_generate_commands.rs:78:    let has_key = state.gemini_api_key.read().await.is_some();
./src-tauri/src/commands/chat_generate_commands.rs:120:// OPENAI COMMAND
./src-tauri/src/commands/chat_generate_commands.rs:145:    let has_key = state.openai_api_key.read().await.is_some();
./src-tauri/src/commands/chat_generate_commands.rs:187:// CLAUDE/ANTHROPIC COMMAND
./src-tauri/src/commands/chat_generate_commands.rs:212:    let has_key = state.anthropic_api_key.read().await.is_some();
./runs/super_prompt_audit_v1/VERDICT_FINAL.md:104:   2. Ajouter clés API: `GEMINI_API_KEY=sk-...`
./runs/super_prompt_audit_v1/SECTION_1_AUDIT_VERITE.md:158:- **Preuve**: `.env` contient seulement templates (ligne 19: `GEMINI_API_KEY=your_gemini_api_key_here`)
./runs/super_prompt_audit_v1/SECTION_1_AUDIT_VERITE.md:186:  - GEMINI_API_KEY=your_gemini_api_key_here    ← PLACEHOLDER
./runs/super_prompt_audit_v1/SECTION_1_AUDIT_VERITE.md:187:  - OPENAI_API_KEY=your_openai_api_key_here    ← PLACEHOLDER
./runs/super_prompt_audit_v1/SECTION_1_AUDIT_VERITE.md:188:  - ANTHROPIC_API_KEY=your_anthropic_api_key_here ← PLACEHOLDER
./runs/super_prompt_audit_v1/SECTION_1_AUDIT_VERITE.md:286:- `.env` actuel = templates seulement (`your_api_key_here`)
./src-tauri/src/commands/persistent_memory.rs:1139:        "api_key",
./runs/current/SCANS_NETWORK_UI.md:79:src/stories/assets/discord.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177575)"><mask id="mask0_10031_177575" style="mask-type:luminance" width="33" height="25" x="0" y="4" maskUnits="userSpaceOnUse"><path fill="#fff" d="M32.5034 4.00195H0.503906V28.7758H32.5034V4.00195Z"/></mask><g mask="url(#mask0_10031_177575)"><path fill="#5865F2" d="M27.5928 6.20817C25.5533 5.27289 23.3662 4.58382 21.0794 4.18916C21.0378 4.18154 20.9962 4.20057 20.9747 4.23864C20.6935 4.73863 20.3819 5.3909 20.1637 5.90358C17.7042 5.53558 15.2573 5.53558 12.8481 5.90358C12.6299 5.37951 12.307 4.73863 12.0245 4.23864C12.003 4.20184 11.9614 4.18281 11.9198 4.18916C9.63431 4.58255 7.44721 5.27163 5.40641 6.20817C5.38874 6.21578 5.3736 6.22848 5.36355 6.24497C1.21508 12.439 0.078646 18.4809 0.636144 24.4478C0.638667 24.477 0.655064 24.5049 0.677768 24.5227C3.41481 26.5315 6.06609 27.7511 8.66815 28.5594C8.70979 28.5721 8.75392 28.5569 8.78042 28.5226C9.39594 27.6826 9.94461 26.7968 10.4151 25.8653C10.4428 25.8107 10.4163 25.746 10.3596 25.7244C9.48927 25.3945 8.66058 24.9922 7.86343 24.5354C7.80038 24.4986 7.79533 24.4084 7.85333 24.3653C8.02108 24.2397 8.18888 24.109 8.34906 23.977C8.37804 23.9529 8.41842 23.9478 8.45249 23.963C13.6894 26.3526 19.359 26.3526 24.5341 23.963C24.5682 23.9465 24.6086 23.9516 24.6388 23.9757C24.799 24.1077 24.9668 24.2397 25.1358 24.3653C25.1938 24.4084 25.19 24.4986 25.127 24.5354C24.3298 25.0011 23.5011 25.3945 22.6296 25.7232C22.5728 25.7447 22.5476 25.8107 22.5754 25.8653C23.0559 26.7955 23.6046 27.6812 24.2087 28.5213C24.234 28.5569 24.2794 28.5721 24.321 28.5594C26.9357 27.7511 29.5869 26.5315 32.324 24.5227C32.348 24.5049 32.3631 24.4783 32.3656 24.4491C33.0328 17.5506 31.2481 11.5584 27.6344 6.24623C27.6256 6.22848 27.6105 6.21578 27.5928 6.20817ZM11.1971 20.8146C9.62043 20.8146 8.32129 19.3679 8.32129 17.5913C8.32129 15.8146 9.59523 14.368 11.1971 14.368C12.8115 14.368 14.0981 15.8273 14.0729 17.5913C14.0729 19.3679 12.7989 20.8146 11.1971 20.8146ZM21.8299 20.8146C20.2533 20.8146 18.9541 19.3679 18.9541 17.5913C18.9541 15.8146 20.228 14.368 21.8299 14.368C23.4444 14.368 24.7309 15.8273 24.7057 17.5913C24.7057 19.3679 23.4444 20.8146 21.8299 20.8146Z"/></g></g><defs><clipPath id="clip0_10031_177575"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
./runs/current/02_DISCOVER_RAW.md:918:.github/workflows/p4-constitution-audit.yml:173:            echo "✅ P0_1_SECRETS gate active"
./runs/current/02_DISCOVER_RAW.md:943:.github/workflows/p0-1-secrets-guard.yml:56:            echo "P0_1_SECRETS Evidence - $(date -Iseconds)"
./runs/current/02_DISCOVER_RAW.md:946:.github/workflows/p0-1-secrets-guard.yml:70:    name: 🚨 GATE_P0_1_SECRETS
./runs/current/02_DISCOVER_RAW.md:948:.github/workflows/p0-1-secrets-guard.yml:78:            echo "❌ GATE_P0_1_SECRETS: FAIL"
./runs/current/02_DISCOVER_RAW.md:949:.github/workflows/p0-1-secrets-guard.yml:82:          echo "✅ GATE_P0_1_SECRETS: PASS"
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/COMMANDS_RUN.md:113:node scripts/ops/p8_approval_gate.mjs > "$PROOF_DIR/APPROVAL_GATE_TEST_NO_TOKEN.txt" 2>&1 ; \
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/COMMANDS_RUN.md:123:[P8.1 APPROVAL GATE] ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/COMMANDS_RUN.md:139:TEST_TOKEN="550e8400e29b41d4a716446655440000" && \
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/COMMANDS_RUN.md:140:P8_APPROVAL_TOKEN="$TEST_TOKEN" node scripts/ops/p8_approval_gate.mjs > "$PROOF_DIR/APPROVAL_GATE_TEST_WITH_TOKEN.txt" 2>&1 ; \
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/COMMANDS_RUN.md:249:| 2 | Gate: With token | `P8_APPROVAL_TOKEN=uuid node p8_approval_gate.mjs` | 0 | 0 | ✅ PASS |
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/APPROVAL_GATE_TEST_NO_TOKEN.txt:4:[P8.1 APPROVAL GATE] ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/APPROVAL_GATE_TEST_NO_TOKEN.txt:5:[P8.1 APPROVAL GATE]    To proceed, provide token: export P8_APPROVAL_TOKEN=<token>
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/LOCK.md:62:- ❌ P8_APPROVAL_TOKEN not provided → exit 10 (gate blocks)
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/LOCK.md:105:2. **Export token:** `export P8_APPROVAL_TOKEN="<token>"`
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:16:- ✅ P8_APPROVAL_TOKEN present and format valid (UUID or SHA-like string)
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:30:P8_APPROVAL_TOKEN=<uuid> node scripts/ops/p8_approval_gate.mjs   # exit 0
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:55:P8_APPROVAL_TOKEN=<uuid> node scripts/ops/p8_execute_distribution.mjs
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:91:1. Read P8_APPROVAL_TOKEN from environment
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:99:P8_APPROVAL_TOKEN=<uuid> node scripts/ops/p8_record_approval.mjs
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:148:[P8.1 APPROVAL GATE] ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:162:P8_APPROVAL_TOKEN="550e8400e29b41d4a716446655440000" node scripts/ops/p8_approval_gate.mjs
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:217:- ❌ P8_APPROVAL_TOKEN not set → exit 10 (gate blocks)
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/FILES_CREATED.md:228:   export P8_APPROVAL_TOKEN="<token>"
./src-tauri/src/auth/dev_token.rs:5://   AUTH OS — DEV TOKEN MANAGER
./src-tauri/src/auth/keystore.rs:18:    pub api_keys: ApiKeysStore,
./src-tauri/src/auth/keystore.rs:98:        if self.api_keys.openai.is_some() {
./src-tauri/src/auth/keystore.rs:101:        if self.api_keys.anthropic.is_some() {
./src-tauri/src/auth/keystore.rs:104:        if self.api_keys.gemini.is_some() {
./src-tauri/src/auth/keystore.rs:116:            api_keys: ApiKeysStore::default(),
./src-tauri/src/auth/commands.rs:53:pub async fn auth_save_api_keys(keys: ApiKeysInput) -> Result<(), String> {
./src-tauri/src/auth/commands.rs:54:    info!("🔐 AUTH OS → auth_save_api_keys");
./src-tauri/src/auth/commands.rs:56:        error!("❌ AUTH OS → auth_save_api_keys failed: {}", e);
./src-tauri/src/auth/commands.rs:63:pub async fn auth_get_api_keys() -> Result<crate::auth::ApiKeysOutput, String> {
./src-tauri/src/auth/commands.rs:64:    info!("🔐 AUTH OS → auth_get_api_keys");
./src-tauri/src/auth/commands.rs:66:        error!("❌ AUTH OS → auth_get_api_keys failed: {}", e);
./src-tauri/src/auth/commands.rs:73:pub async fn auth_delete_api_key(provider: String) -> Result<(), String> {
./src-tauri/src/auth/commands.rs:74:    info!("🔐 AUTH OS → auth_delete_api_key ({})", provider);
./src-tauri/src/auth/commands.rs:76:        error!("❌ AUTH OS → auth_delete_api_key failed: {}", e);
./src-tauri/src/auth/dto.rs:21:    pub api_keys_configured: bool,
./src-tauri/src/auth/api_keys.rs:20:            keystore.api_keys.openai = Some(openai);
./src-tauri/src/auth/api_keys.rs:23:            keystore.api_keys.anthropic = Some(anthropic);
./src-tauri/src/auth/api_keys.rs:26:            keystore.api_keys.gemini = Some(gemini);
./src-tauri/src/auth/api_keys.rs:39:            openai: keystore.api_keys.openai.as_ref().map(|k| Self::mask_key(k)),
./src-tauri/src/auth/api_keys.rs:41:                .api_keys
./src-tauri/src/auth/api_keys.rs:45:            gemini: keystore.api_keys.gemini.as_ref().map(|k| Self::mask_key(k)),
./src-tauri/src/auth/api_keys.rs:50:    /// Exemple: "sk-1234abcd5678efgh" → "••••efgh"
./src-tauri/src/auth/api_keys.rs:65:            "openai" => keystore.api_keys.openai.clone(),
./src-tauri/src/auth/api_keys.rs:66:            "anthropic" => keystore.api_keys.anthropic.clone(),
./src-tauri/src/auth/api_keys.rs:67:            "gemini" => keystore.api_keys.gemini.clone(),
./src-tauri/src/auth/api_keys.rs:79:            "openai" => keystore.api_keys.openai = None,
./src-tauri/src/auth/api_keys.rs:80:            "anthropic" => keystore.api_keys.anthropic = None,
./src-tauri/src/auth/api_keys.rs:81:            "gemini" => keystore.api_keys.gemini = None,
./src-tauri/src/auth/mod.rs:10:pub mod api_keys;
./src-tauri/src/auth/mod.rs:19:pub use api_keys::ApiKeyManager;
./src-tauri/src/auth/mod.rs:63:        api_keys_configured: keystore.api_keys.is_any_configured(),
./src-tauri/src/auth/mod.rs:64:        openai_configured: keystore.api_keys.openai.is_some(),
./src-tauri/src/auth/mod.rs:65:        anthropic_configured: keystore.api_keys.anthropic.is_some(),
./src-tauri/src/auth/mod.rs:66:        gemini_configured: keystore.api_keys.gemini.is_some(),
./src-tauri/src/gemini_provider_extensions.rs:225:// EPIC 1 MIGRATION NOTES — DAY 3 GEMINI COMPLETION:
./tests/phase6/gate-p6.test.ts:171:        'docs/_evidence/P0_SECRETS_AUDIT.md',
./src-tauri/src/cloud/cloud_vault.rs:155:                "api_keys".to_string(),
./src-tauri/src/cloud/cloud_manifest.json:23:    "api_keys",
./src-tauri/src/cloud/cloud_rules.json:18:        "api_key",
./CHANGELOG.md:1862:  - Storage directory + encryption password (TITANE_SECRETS_PASSPHRASE)
./CHANGELOG.md:1946:- **Validation multi-format**: OpenAI (sk-_, 40+ chars), Claude (sk-ant-_, 50+ chars), Gemini (alphanumeric, 30+ chars)
./CHANGELOG.md:2380:- Providers IA: 100% ✅ (GEMINI_API_KEY, OLLAMA_BASE_URL OK)
./tests/unit/control_panel_commands.test.ts:119:      gemini_api_key: '***MASKED***',
./QUICK_START_TESTING.sh:106:echo "    ┌─ TEST 6: TOKEN COUNTER ─────────────────────────────────────┐"
./src-tauri/src/mock_commands.rs:1276:        "Message reçu: \"{}\"\n\n🤖 **Mode Mock Backend**\nCeci est une réponse simulée du backend Rust. \n\nPour activer le backend sécurisé:\n• Définis `TITANE_SECRETS_PASSPHRASE` puis appelle `chat_set_gemini_key`\n• Ou lance Ollama: `ollama serve`\n\nArchitecture Chat IA v18 fonctionnelle ✅",
./pnpm-lock.yaml:5474:  mdast-util-gfm-task-list-item@2.0.0:
./pnpm-lock.yaml:5542:  micromark-extension-gfm-task-list-item@2.1.0:
./pnpm-lock.yaml:13554:  mdast-util-gfm-task-list-item@2.0.0:
./pnpm-lock.yaml:13570:      mdast-util-gfm-task-list-item: 2.0.0
./pnpm-lock.yaml:13730:  micromark-extension-gfm-task-list-item@2.1.0:
./pnpm-lock.yaml:13745:      micromark-extension-gfm-task-list-item: 2.1.0
./src-tauri/src/config/mod.rs:110:        // - Check: SecureSecretsEngine::has_secret("gemini_api_key").await
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/VERDICT.md:60:[P8.1 APPROVAL GATE] ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/VERDICT.md:68:Command: P8_APPROVAL_TOKEN="550e8400e29b41d4a716446655440000" node scripts/ops/p8_approval_gate.mjs
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/VERDICT.md:104:- **Requirement:** Must be set as `P8_APPROVAL_TOKEN` environment variable
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/VERDICT.md:136:1. ❌ `P8_APPROVAL_TOKEN` not set → **exit 10** (gate blocks)
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/VERDICT.md:151:   export P8_APPROVAL_TOKEN="550e8400-e29b-41d4-a716-446655440000"
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/VERDICT.md:199:P8_APPROVAL_TOKEN="550e8400e29b41d4a716446655440000" \
./deployment/latest/certification/phase8_1/P8_1_APPROVAL_GATE_20260217_225005/VERDICT.md:233:**Next Step:** Provide `P8_APPROVAL_TOKEN` to trigger controlled distribution  
./tests/fixtures/hook-test-input.json:5:  "taskId": "test-task-001",
./tests/fixtures/hook-test-input.json:10:      "taskId": "test-task-001",
./src-tauri/src/security/secrets_engine.rs:2://   TITANE∞ v∞ — SECURE SECRETS ENGINE
./src-tauri/src/security/secrets_engine.rs:24:pub const KEY_OPENAI: &str = "openai_api_key";
./src-tauri/src/security/secrets_engine.rs:25:pub const KEY_CLAUDE: &str = "claude_api_key";
./src-tauri/src/security/secrets_engine.rs:26:pub const KEY_GEMINI: &str = "gemini_api_key";
./src-tauri/src/security/secrets_engine.rs:27:pub const KEY_COPILOT: &str = "copilot_api_key"; // ✨ v26.3 - GitHub Copilot
./src-tauri/src/security/secrets_engine.rs:31:    #[error("Missing secrets passphrase (set TITANE_SECRETS_PASSPHRASE)")]
./src-tauri/src/security/secrets_engine.rs:209:        Self::validate_api_key(&key, "openai")?;
./src-tauri/src/security/secrets_engine.rs:210:        self.set_secret(KEY_OPENAI, key)?;
./src-tauri/src/security/secrets_engine.rs:217:        self.get_secret(KEY_OPENAI)
./src-tauri/src/security/secrets_engine.rs:222:        Self::validate_api_key(&key, "claude")?;
./src-tauri/src/security/secrets_engine.rs:237:        if self.has_secret(KEY_GEMINI)? && self.get_secret(KEY_GEMINI)?.is_some() {
./src-tauri/src/security/secrets_engine.rs:240:        if self.has_secret(KEY_OPENAI)? && self.get_secret(KEY_OPENAI)?.is_some() {
./src-tauri/src/security/secrets_engine.rs:251:    fn validate_api_key(key: &str, provider: &str) -> Result<(), SecretsError> {
./src-tauri/src/security/secrets_engine.rs:258:                // sk-proj-... or sk-...
./src-tauri/src/security/secrets_engine.rs:259:                if !key.starts_with("sk-") {
./src-tauri/src/security/secrets_engine.rs:261:                        "OpenAI key must start with 'sk-'".into(),
./src-tauri/src/security/secrets_engine.rs:269:                // sk-ant-...
./src-tauri/src/security/secrets_engine.rs:270:                if !key.starts_with("sk-ant-") {
./src-tauri/src/security/secrets_engine.rs:272:                        "Claude key must start with 'sk-ant-'".into(),
./MANUEL_UTILISATEUR_COMPLET_v27.0.0.md:1927:await invoke('chat_set_openai_key', { key: 'sk-...' });
./MANUEL_UTILISATEUR_COMPLET_v27.0.0.md:2254:grep -r "api_key" src-tauri/src/
./src-tauri/src/security/security_engine.rs:204:            .set_secret("api_key", "sk-test-123456")
./src-tauri/src/security/security_engine.rs:207:        assert_eq!(engine.get_secret("api_key"), Some(&"sk-test-123456".to_string()));
./src-tauri/src/security/permissions.rs:244:    // SECRETS
./src-tauri/src/security/pre_boot_validation.rs:337:    let passphrase = std::env::var("TITANE_SECRETS_PASSPHRASE")
./src-tauri/src/security/pre_boot_validation.rs:338:        .map_err(|_| "TITANE_SECRETS_PASSPHRASE environment variable is missing".to_string())?;
./src-tauri/src/security/pre_boot_validation.rs:342:        return Err("TITANE_SECRETS_PASSPHRASE must be at least 12 characters".to_string());
./src-tauri/src/security/pre_boot_validation.rs:380:        std::env::set_var("TITANE_SECRETS_PASSPHRASE", "integration-test-pass");
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/02_APPROVAL_GATE_OUTPUT.txt:4:[P8.1 APPROVAL GATE] ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/02_APPROVAL_GATE_OUTPUT.txt:5:[P8.1 APPROVAL GATE]    To proceed, provide token: export P8_APPROVAL_TOKEN=<token>
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:4:Mode: BLOCKED_TOKEN_MISSING
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:36:  env | sort | grep -E '(NODE_|npm_|TAURI_|RUST_|CARGO_|PATH=|PWD=|HOME=|USER=|SHELL=)' | grep -v -E '(TOKEN|SECRET|KEY|PASSWORD)' | head -30
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:39:  if [ -n "$P8_APPROVAL_TOKEN" ]; then
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:40:    echo "P8_APPROVAL_TOKEN=present"
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:42:    echo "P8_APPROVAL_TOKEN=absent"
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:46:Result: ✅ P8_APPROVAL_TOKEN=absent
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:56:Reason: TOKEN_PRESENT=no → per protocol, skip:
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:68:PACK_STATUS: BLOCKED_TOKEN_MISSING
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/COMMANDS_RUN.txt:69:TOKEN_REQUIRED: P8_APPROVAL_TOKEN must be provided to resume
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:12:**STATUS**: ❌ **BLOCKED_TOKEN_MISSING**
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:21:   - P8.5.1 standby pack exists: `P8_5_1_TOKEN_WAIT_20260217_234719/RESUME_PROCEDURE.md` ✅
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:36:   - Environment check: `P8_APPROVAL_TOKEN=absent` ✅
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:41:     - ❌ Token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:46:### ⏭️ Skipped Steps (TOKEN_ABSENT)
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:48:Per protocol ÉTAPE B: *"Si TOKEN_PRESENT=no → STOP (ne pas exécuter preflight/wrapper/record)"*
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:62:**Gate**: `P8_APPROVAL_TOKEN` environment variable not set  
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:87:   export P8_APPROVAL_TOKEN="<token_value>"
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:92:   deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/RESUME_PROCEDURE.md
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:107:**Blocked On**: P8_APPROVAL_TOKEN provision  
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:135:deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/AUTHORITY_NOTIFICATION_TEMPLATE.md
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/09_VERDICT.md:140:**VERDICT**: ❌ **BLOCKED_TOKEN_MISSING**  
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/ENV.txt:14:P8_APPROVAL_TOKEN=absent
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/10_LOCK.md:6:**Status**: BLOCKED_TOKEN_MISSING
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/10_LOCK.md:27:- `09_VERDICT.md` — final verdict (BLOCKED_TOKEN_MISSING)
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/10_LOCK.md:61:## P8_5_RESUME_BLOCKED_TOKEN_MISSING_<timestamp>
./deployment/latest/certification/phase8_5_resume/P8_5_RESUME_WEEK2_20260218_004529/10_LOCK.md:75:1. Export `P8_APPROVAL_TOKEN=<value>`
./deployment/latest/certification/phase6/P6_OPS_READINESS_20260217_173452/SUPPORT_BUNDLE_PLAYBOOK.md:106:    sed -i 's/GO_FOR_PROD_[^ ]*=[^ ]*/[REDACTED_TOKEN]/g' "$f"
./deployment/latest/certification/phase6/P6_OPS_READINESS_20260217_173452/SUPPORT_BUNDLE_PLAYBOOK.md:107:    sed -i 's/\(GITHUB_TOKEN\|API[_KEY]*\|SECRET\)[^ ]*=[^ ]*/\1=[REDACTED]/g' "$f"
./deployment/latest/certification/phase6/P6_OPS_READINESS_20260217_173452/SUPPORT_BUNDLE_PLAYBOOK.md:229:grep -r "GO_FOR_PROD\|GITHUB_TOKEN" /tmp/titane_support_bundle_* || echo "✓ No exposed secrets"
./src-tauri/src/ai/api.rs:175:    let new_orchestrator = MultiAIOrchestrator::with_api_keys(claude_key, openai_key);
./src-tauri/src/ai/orchestrator_multi.rs:46:    pub fn with_api_keys(claude_key: Option<String>, openai_key: Option<String>) -> Self {
./src-tauri/src/ai/orchestrator_multi.rs:267:        let claude_key = std::env::var("ANTHROPIC_API_KEY").ok();
./src-tauri/src/ai/orchestrator_multi.rs:268:        let openai_key = std::env::var("OPENAI_API_KEY").ok();
./src-tauri/src/ai/orchestrator_multi.rs:271:            orchestrator: Arc::new(RwLock::new(MultiAIOrchestrator::with_api_keys(
./src-tauri/src/ai/config_multi.rs:53:    pub api_key: Option<String>,
./src-tauri/src/ai/config_multi.rs:63:            api_key: std::env::var("ANTHROPIC_API_KEY").ok(),
./src-tauri/src/ai/config_multi.rs:92:    pub api_key: Option<String>,
./src-tauri/src/ai/config_multi.rs:102:            api_key: std::env::var("OPENAI_API_KEY").ok(),
./src-tauri/src/ai/providers/claude.rs:14:    api_key: String,
./src-tauri/src/ai/providers/claude.rs:22:    pub fn new(api_key: String) -> Self {
./src-tauri/src/ai/providers/claude.rs:24:            api_key,
./src-tauri/src/ai/providers/claude.rs:60:            .header("x-api-key", &self.api_key)
./src-tauri/src/ai/providers/claude.rs:136:        !self.api_key.is_empty()
./src-tauri/src/ai/providers/openai.rs:14:    api_key: String,
./src-tauri/src/ai/providers/openai.rs:22:    pub fn new(api_key: String) -> Self {
./src-tauri/src/ai/providers/openai.rs:24:            api_key,
./src-tauri/src/ai/providers/openai.rs:60:            .header("Authorization", format!("Bearer {}", self.api_key))
./src-tauri/src/ai/providers/openai.rs:134:        !self.api_key.is_empty()
./src-tauri/src/ai/providers/openai.rs:147:// TYPES OPENAI API
./src-tauri/src/ai/router.rs:42:    pub fn new(gemini_api_key: Option<String>, ollama_model: Option<String>) -> Self {
./src-tauri/src/ai/router.rs:43:        let gemini_client = gemini_api_key.map(|key| Arc::new(GeminiClient::new(key)));
./src-tauri/src/ai/gemini.rs:10:const GEMINI_API_URL: &str =
./src-tauri/src/ai/gemini.rs:59:    api_key: String,
./src-tauri/src/ai/gemini.rs:64:    pub fn new(api_key: String) -> Self {
./src-tauri/src/ai/gemini.rs:70:        Self { api_key, client }
./src-tauri/src/ai/gemini.rs:84:        let url = format!("{}?key={}", GEMINI_API_URL, self.api_key);
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:201:f4f2dfb30 201 (Kevin Thibault 2026-02-17 07:09:01 -0500 201) ## P4_PROD_BLOCKED_MISSING_TOKEN (LOCAL)
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:204:f4f2dfb30 204 (Kevin Thibault 2026-02-17 07:09:01 -0500 204) **Verdict:** ⚪ OUT_OF_SCOPE (BLOCKED_MISSING_TOKEN)  
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:216:f4f2dfb30 216 (Kevin Thibault 2026-02-17 07:09:01 -0500 216) **Verdict:** ⚪ OUT_OF_SCOPE (BLOCKED_MISSING_TOKEN)  
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:497:6b8b73ed9 473 (Kevin Thibault 2026-02-16 18:54:09 -0500 497) **Status**: 🔒 **READY FOR P4-1 PRODUCTION BUILD TOKEN**
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:825:c65a45fdd 825 (Kevin Thibault 2026-02-17 18:43:30 -0500 825) ### P8_5_BLOCKED_TOKEN_MISSING
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:828:c65a45fdd 828 (Kevin Thibault 2026-02-17 18:43:30 -0500 828) **Verdict:** ❌ BLOCKED_TOKEN_MISSING  
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:835:c65a45fdd 835 (Kevin Thibault 2026-02-17 18:43:30 -0500 835) **Notes:** P8_APPROVAL_TOKEN absent; approval gate exit 10; stop-the-line enforced; no distribution executed.
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:839:bbf00a890 839 (Kevin Thibault 2026-02-17 18:48:38 -0500 839) ### P8_5_1_TOKEN_WAIT_STATE
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:842:bbf00a890 842 (Kevin Thibault 2026-02-17 18:48:38 -0500 842) **Verdict:** ⚪ STANDBY_ACTIVE_WAITING_TOKEN  
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:846:bbf00a890 846 (Kevin Thibault 2026-02-17 18:48:38 -0500 846) **Proof Pack:** deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/  
./src-tauri/src/core/legacy.rs:58:/// MemoryCore vΩ.6 — disk-backed persistence with telemetry hooks
./src-tauri/src/services/vector_service.rs:245:    // ── G_TOKENIZE ────────────────────────────────────────────────
./src-tauri/src/core/modules/unified_memory.rs:208:    /// Note: LTM is disk-based, returns empty Vec (use index for metadata)
./src-tauri/src/core/modules/unified_memory.rs:210:        // LTM is disk-based, would need to load from files
./src-tauri/src/services/search_gateway.rs:32:    /// If BRAVE_API_KEY is missing, return explicit CREDENTIALS_MISSING error.
./src-tauri/src/services/search_gateway.rs:34:        let brave_api_key = std::env::var("BRAVE_API_KEY")
./src-tauri/src/services/search_gateway.rs:39:        self.search_with_key(query, max_results, brave_api_key.as_deref())
./src-tauri/src/services/search_gateway.rs:47:        brave_api_key: Option<&str>,
./src-tauri/src/services/search_gateway.rs:60:        match brave_api_key {
./src-tauri/src/services/search_gateway.rs:62:            None => Err("CREDENTIALS_MISSING: BRAVE_API_KEY not configured".to_string()),
./src-tauri/src/services/search_gateway.rs:70:        api_key: &str,
./src-tauri/src/services/search_gateway.rs:83:                vec![("X-Subscription-Token".to_string(), api_key.to_string())],
./src-tauri/src/services/search_gateway.rs:193:    async fn test_search_requires_brave_api_key() {
./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/LOCK.md:11:- node scripts/ops/p8_rollback.mjs --target "week2_launch" --reason "TOKEN_MISSING"
./src-tauri/src/services/rate_limit_service.rs:13:// TOKEN BUCKET (per domain, in-memory)
./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/RESUME_PROCEDURE.md:5:1. export P8_APPROVAL_TOKEN="<token>"
./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/WAIT_STATE_DECLARATION.md:4:Reason: P8_APPROVAL_TOKEN absent
./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/ENV.txt:7:Token status: P8_APPROVAL_TOKEN absent
./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/TIMEOUT_POLICY.md:6:- Append registry entry: P8_5_EXPIRED_NO_TOKEN
./src-tauri/src/control_panel_commands/tests.rs:125:        assert!(config.gemini_api_key.is_empty());
./src-tauri/src/control_panel_commands/tests.rs:140:            gemini_api_key: "test-key-123".to_string(),
./src-tauri/src/control_panel_commands/tests.rs:154:        assert_eq!(stored.gemini_api_key, GEMINI_KEY_SENTINEL);
./src-tauri/src/control_panel_commands/tests.rs:157:            secrets.get_secret("gemini_api_key").expect("secret fetch"),
./src-tauri/src/control_panel_commands/tests.rs:161:        let active_key = orchestrator.gemini_api_key.read().await.clone();
./src-tauri/src/control_panel_commands/tests.rs:177:            gemini_api_key: "secret-abc".to_string(),
./src-tauri/src/control_panel_commands/tests.rs:188:            gemini_api_key: String::new(),
./src-tauri/src/control_panel_commands/tests.rs:199:        assert_eq!(stored.gemini_api_key, "");
./src-tauri/src/control_panel_commands/tests.rs:205:            secrets.get_secret("gemini_api_key").expect("secret fetch"),
./src-tauri/src/control_panel_commands/tests.rs:209:        let active_key = orchestrator.gemini_api_key.read().await.clone();
./deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/VERDICT.md:3:Verdict: STANDBY_ACTIVE_WAITING_TOKEN
./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./src-tauri/src/omega/executor.rs:813:            task_id: "task-123".to_string(),
./src-tauri/src/omega/executor.rs:821:        assert_eq!(result.task_id, "task-123");
./src-tauri/src/omega/executor.rs:979:        let plan = ExecutionPlan::from_routing("task-test".to_string(), &routing, "Do something");
./docs/INDEX_DOCUMENTATION_v26.3.0.md:118:- `set_api_key` - Configuration clé API (sécurisée)
./src-tauri/src/omega/guardrails.rs:108:        forbidden.insert("api_key".to_string());
./src-tauri/src/omega/guardrails.rs:786:        assert!(config.forbidden_patterns.contains("api_key"));
./src-tauri/src/neural_memory/ltm.rs:45:/// Persistent disk-based storage with in-memory index for fast lookup.
./src-tauri/src/tts/elevenlabs_tts.rs:187:    api_key: Option<String>,
./src-tauri/src/tts/elevenlabs_tts.rs:202:            api_key: None,
./src-tauri/src/tts/elevenlabs_tts.rs:209:    pub fn with_api_key(mut self, api_key: impl Into<String>) -> Self {
./src-tauri/src/tts/elevenlabs_tts.rs:210:        self.api_key = Some(api_key.into());
./src-tauri/src/tts/elevenlabs_tts.rs:229:        if let Ok(key) = std::env::var("ELEVENLABS_API_KEY") {
./src-tauri/src/tts/elevenlabs_tts.rs:230:            engine.api_key = Some(key);
./src-tauri/src/tts/elevenlabs_tts.rs:240:        self.api_key.is_some()
./src-tauri/src/tts/elevenlabs_tts.rs:249:        let api_key = self.api_key.as_ref().ok_or_else(|| {
./src-tauri/src/tts/elevenlabs_tts.rs:271:            .header("xi-api-key", api_key)
./src-tauri/src/tts/elevenlabs_tts.rs:369:        let api_key = self
./src-tauri/src/tts/elevenlabs_tts.rs:370:            .api_key
./src-tauri/src/tts/elevenlabs_tts.rs:379:            .header("xi-api-key", api_key)
./src-tauri/src/tts/elevenlabs_tts.rs:398:        let api_key = self
./src-tauri/src/tts/elevenlabs_tts.rs:399:            .api_key
./src-tauri/src/tts/elevenlabs_tts.rs:408:            .header("xi-api-key", api_key)
./src-tauri/src/tts/elevenlabs_tts.rs:427:        let api_key = self
./src-tauri/src/tts/elevenlabs_tts.rs:428:            .api_key
./src-tauri/src/tts/elevenlabs_tts.rs:437:            .header("xi-api-key", api_key)
./src-tauri/src/tts/elevenlabs_tts.rs:538:        let configured = engine.with_api_key("test_key");
./src-tauri/src/tts/online_tts.rs:11:    api_key: Option<String>,
./src-tauri/src/tts/online_tts.rs:17:    pub fn new(api_key: Option<String>) -> Self {
./src-tauri/src/tts/online_tts.rs:19:            api_key,
./docs/QUICKSTART_CHAT_IA.md:12:GEMINI_API_KEY=votre_cle_api_ici
./docs/QUICKSTART_CHAT_IA.md:116:→ Vérifier `GEMINI_API_KEY` dans `.env`
./src-tauri/src/chat_engine/mod.rs:363:        .and_then(|engine| engine.get_secret("gemini_api_key").ok().flatten())
./src-tauri/src/chat_engine/mod.rs:364:        .or_else(|| std::env::var("GEMINI_API_KEY").ok());
./src-tauri/src/overdrive/api_bridge.rs:21:    pub api_key: Option<String>,
./src-tauri/src/overdrive/api_bridge.rs:94:            api_key: None, // À configurer
./src-tauri/src/overdrive/api_bridge.rs:107:            api_key: None,
./src-tauri/src/overdrive/api_bridge.rs:120:            api_key: None,
./src-tauri/src/overdrive/api_bridge.rs:236:    // if let Some(api_key) = &config.api_key {
./src-tauri/src/overdrive/api_bridge.rs:237:    //     req = req.header("Authorization", format!("Bearer {}", api_key));
./src-tauri/src/overdrive/api_bridge.rs:310:    api_key: String,
./src-tauri/src/overdrive/api_bridge.rs:321:        config.api_key = Some(api_key);
./src-tauri/src/audio/commands.rs:807:    let model_path = format!("{}/.local/share/vosk/vosk-model-small-fr-0.22", home);
./src-tauri/src/overdrive/chat_orchestrator.rs:170:    pub gemini_api_key: Arc<RwLock<Option<String>>>,
./src-tauri/src/overdrive/chat_orchestrator.rs:171:    pub openai_api_key: Arc<RwLock<Option<String>>>,
./src-tauri/src/overdrive/chat_orchestrator.rs:172:    pub anthropic_api_key: Arc<RwLock<Option<String>>>,
./src-tauri/src/overdrive/chat_orchestrator.rs:209:        gemini_api_key: Arc::new(RwLock::new(None)),
./src-tauri/src/overdrive/chat_orchestrator.rs:210:        openai_api_key: Arc::new(RwLock::new(None)),
./src-tauri/src/overdrive/chat_orchestrator.rs:211:        anthropic_api_key: Arc::new(RwLock::new(None)),
./src-tauri/src/overdrive/chat_orchestrator.rs:223:pub async fn bootstrap_api_keys(
./src-tauri/src/overdrive/chat_orchestrator.rs:227:    log::info!("[ChatOrchestrator] 🔑 bootstrap_api_keys() called - loading keys from SecureSecretsEngine");
./src-tauri/src/overdrive/chat_orchestrator.rs:231:        .get_secret("gemini_api_key")
./src-tauri/src/overdrive/chat_orchestrator.rs:235:        .get_secret("openai_api_key")
./src-tauri/src/overdrive/chat_orchestrator.rs:239:        .get_secret("anthropic_api_key")
./src-tauri/src/overdrive/chat_orchestrator.rs:245:        *state.gemini_api_key.write().await = Some(key);
./src-tauri/src/overdrive/chat_orchestrator.rs:252:        *state.openai_api_key.write().await = Some(key);
./src-tauri/src/overdrive/chat_orchestrator.rs:259:        *state.anthropic_api_key.write().await = Some(key);
./src-tauri/src/overdrive/chat_orchestrator.rs:265:    log::info!("[ChatOrchestrator] 🔑 bootstrap_api_keys() completed");
./src-tauri/src/overdrive/chat_orchestrator.rs:355:            let api_key = state.openai_api_key.read().await;
./src-tauri/src/overdrive/chat_orchestrator.rs:356:            api_key.is_some()
./src-tauri/src/overdrive/chat_orchestrator.rs:359:            let api_key = state.anthropic_api_key.read().await;
./src-tauri/src/overdrive/chat_orchestrator.rs:360:            api_key.is_some()
./src-tauri/src/overdrive/chat_orchestrator.rs:363:            let api_key = state.gemini_api_key.read().await;
./src-tauri/src/overdrive/chat_orchestrator.rs:364:            api_key.is_some() // Simplifié: si clé présente, considérer disponible
./src-tauri/src/overdrive/chat_orchestrator.rs:680:    let api_key = state.gemini_api_key.read().await;
./src-tauri/src/overdrive/chat_orchestrator.rs:681:    let key = api_key
./src-tauri/src/overdrive/chat_orchestrator.rs:934:    let api_key = state.openai_api_key.read().await;
./src-tauri/src/overdrive/chat_orchestrator.rs:935:    let key = api_key
./src-tauri/src/overdrive/chat_orchestrator.rs:1083:    let api_key = state.anthropic_api_key.read().await;
./src-tauri/src/overdrive/chat_orchestrator.rs:1084:    let key = api_key
./src-tauri/src/audio/recording_engine.rs:252:        // - Vosk: Alternative lightweight ASR, vosk-api crate with VoskRecognizer
./src-tauri/tests/secure_engine_tests.rs:34:    fs::write(&env_path, "FOO=bar\nGEMINI_API_KEY=abc123\n").expect("write env");
./src-tauri/tests/secure_engine_tests.rs:39:    purge_env_key("GEMINI_API_KEY").await.expect("purge env");
./src-tauri/tests/secure_engine_tests.rs:42:    assert!(!contents.contains("GEMINI_API_KEY"));
./src-tauri/src/audio/asr.rs:18:    api_key: Option<String>,
./src-tauri/src/audio/asr.rs:23:    pub fn new(provider: ASRProvider, api_key: Option<String>) -> Self {
./src-tauri/src/audio/asr.rs:26:            api_key,
./src-tauri/src/audio/asr.rs:36:        } else if shell_guard.is_command_available("vosk-transcriber") {
./src-tauri/src/audio/asr.rs:44:            api_key: None,
./src-tauri/src/audio/asr.rs:103:        // NOTE: vosk-transcriber NOT in default whitelist, will fail unless added
./src-tauri/src/audio/asr.rs:107:                "vosk-transcriber",
./src-tauri/src/audio/asr.rs:108:                &["-i", path_str, "-m", "/usr/share/vosk/models/vosk-model-fr"],
./src-tauri/src/audio/asr.rs:121:            ASRProvider::Google => self.api_key.is_some(),
./src-tauri/src/audio/asr.rs:123:            ASRProvider::Vosk => self.shell_guard.is_command_available("vosk-transcriber"),
./src/__tests__/omega-provider-tests.test.ts:25:// OMEGA TEST SUITE 1: GEMINI PROVIDER DOWN
./scripts/certification/run-master-chat-to-prod.sh:238:  if [ -z "${APPROVAL_TOKEN:-}" ]; then
./scripts/certification/run-master-chat-to-prod.sh:246:    log_cmd "   export APPROVAL_TOKEN='GO_FOR_HUMAN_ACCEPTANCE_P11__TITANE_INFINITY'"
./scripts/certification/run-master-chat-to-prod.sh:252:    APPROVAL_TOKEN="$APPROVAL_TOKEN" run_phase "P11" "$script" "P10_8" || return 1
./src-tauri/src/ia/anthropic_claude.rs:14:const ANTHROPIC_VERSION: &str = "2023-06-01";
./src-tauri/src/ia/anthropic_claude.rs:15:const MAX_TOKENS: usize = 4096;
./src-tauri/src/ia/anthropic_claude.rs:76:    api_key: String,
./src-tauri/src/ia/anthropic_claude.rs:81:    pub fn new(api_key: String) -> Self {
./src-tauri/src/ia/anthropic_claude.rs:83:            api_key,
./src-tauri/src/ia/anthropic_claude.rs:108:            max_tokens: request.max_tokens.unwrap_or(MAX_TOKENS),
./src-tauri/src/ia/anthropic_claude.rs:116:            .header("x-api-key", &self.api_key)
./src-tauri/src/ia/anthropic_claude.rs:117:            .header("anthropic-version", ANTHROPIC_VERSION)
./src-tauri/src/ia/unified_engine.rs:124:        if let Ok(Some(_key)) = self.secrets.get_secret("gemini_api_key") {
./src-tauri/src/ia/unified_engine.rs:270:        // - Client: Use GeminiClient::new(api_key) from ai/gemini.rs module
./src-tauri/src/ia/unified_engine.rs:274:        // - API key: Retrieve from SecureSecretsEngine.get_secret("gemini_api_key")
./src-tauri/src/ia/unified_engine.rs:345:            .get_secret("gemini_api_key")
./src-tauri/src/ia/openai_gpt.rs:12:const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";
./src-tauri/src/ia/openai_gpt.rs:14:const MAX_TOKENS: usize = 4096;
./src-tauri/src/ia/openai_gpt.rs:70:    api_key: String,
./src-tauri/src/ia/openai_gpt.rs:75:    pub fn new(api_key: String) -> Self {
./src-tauri/src/ia/openai_gpt.rs:77:            api_key,
./src-tauri/src/ia/openai_gpt.rs:114:            max_tokens: request.max_tokens.or(Some(MAX_TOKENS)),
./src-tauri/src/ia/openai_gpt.rs:121:            .post(OPENAI_API_URL)
./src-tauri/src/ia/openai_gpt.rs:122:            .header("Authorization", format!("Bearer {}", self.api_key))
./src-tauri/src/engines/unified_memory/embeddings.rs:76:            // Header: Authorization: Bearer $OPENAI_API_KEY
./src-tauri/src/engines/unified_memory/embeddings.rs:212:pub async fn embed_openai(text: &str, api_key: &str) -> Result<Vec<f32>, String> {
./src-tauri/src/engines/unified_memory/embeddings.rs:219:        .header("Authorization", format!("Bearer {}", api_key))
./scripts/certification/phases_real/p11_human_acceptance_real.sh:11:APPROVAL_TOKEN="${APPROVAL_TOKEN:-}"
./scripts/certification/phases_real/p11_human_acceptance_real.sh:31:if [ -z "$APPROVAL_TOKEN" ]; then
./scripts/certification/phases_real/p11_human_acceptance_real.sh:32:  log_cmd "❌ FAIL: No approval token provided (APPROVAL_TOKEN env var)"
./scripts/certification/phases_real/p11_human_acceptance_real.sh:36:if [ "$APPROVAL_TOKEN" != "GO_FOR_HUMAN_ACCEPTANCE_P11__TITANE_INFINITY" ]; then
./scripts/certification/phases_real/p11_human_acceptance_real.sh:39:  log_cmd "   Got: $APPROVAL_TOKEN"
./scripts/certification/phases_real/p11_human_acceptance_real.sh:44:log_cmd "   Token: $APPROVAL_TOKEN"
./src-tauri/src/main.rs:507:    let secrets_passphrase = std::env::var("TITANE_SECRETS_PASSPHRASE")
./src-tauri/src/main.rs:530:    let copilot_api_key = secrets_engine
./src-tauri/src/main.rs:536:        api_key: Arc::new(tokio::sync::RwLock::new(copilot_api_key)),
./src-tauri/src/main.rs:542:        copilot_state.api_key.blocking_read().is_some()
./src-tauri/src/main.rs:611:            let password = std::env::var("TITANE_SECRETS_PASSPHRASE")
./src-tauri/src/main.rs:656:            log::info!(" [main.rs] Spawning bootstrap_api_keys task...");
./src-tauri/src/main.rs:660:                log::info!("[main.rs] bootstrap_api_keys task started");
./src-tauri/src/main.rs:661:                overdrive::chat_orchestrator::bootstrap_api_keys(&chat_orch_for_bootstrap, &secrets_for_bootstrap).await;
./src-tauri/src/main.rs:1179:            auth::commands::auth_save_api_keys,
./src-tauri/src/main.rs:1180:            auth::commands::auth_get_api_keys,
./src-tauri/src/main.rs:1181:            auth::commands::auth_delete_api_key,
./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/04_NO_NETWORK_SCAN.txt:148:src-tauri/src/overdrive/chat_orchestrator.rs:1445:    // - Gemini: HEAD request to https://generativelanguage.googleapis.com/v1/models?key={API_KEY}
./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/04_NO_NETWORK_SCAN.txt:162:src-tauri/src/ia/openai_gpt.rs:12:const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";
./src-tauri/src/semantic/embedder.rs:64:        //   Header: x-goog-api-key: {GEMINI_API_KEY}
./src-tauri/src/api_hub/anthropic.rs:2://! TITANE∞ v20Ω — ANTHROPIC PROVIDER
./src-tauri/src/api_hub/anthropic.rs:14:    api_key: String,
./src-tauri/src/api_hub/anthropic.rs:20:    pub fn new(api_key: String) -> Self {
./src-tauri/src/api_hub/anthropic.rs:22:            api_key,
./scripts/verify_ds_tokens.sh:28:echo "🎨 VÉRIFICATION DESIGN SYSTEM TOKENS v14"
./scripts/verify_ds_tokens.sh:39:TOKENS_CSS="src/design-system/tokens.css"
./scripts/verify_ds_tokens.sh:41:if [[ ! -f "$TOKENS_CSS" ]]; then
./scripts/verify_ds_tokens.sh:42:    echo -e "${RED}✗ ERREUR: Fichier $TOKENS_CSS introuvable${NC}"
./scripts/verify_ds_tokens.sh:46:    TOKENS_COUNT=$(grep -c "^[[:space:]]*--ds-" "$TOKENS_CSS" || true)
./scripts/verify_ds_tokens.sh:48:    if [[ $TOKENS_COUNT -ge 350 ]]; then
./scripts/verify_ds_tokens.sh:49:        echo -e "${GREEN}✓${NC} $TOKENS_COUNT tokens CSS définis (>= 350)"
./scripts/verify_ds_tokens.sh:50:    elif [[ $TOKENS_COUNT -ge 300 ]]; then
./scripts/verify_ds_tokens.sh:51:        echo -e "${YELLOW}⚠ AVERTISSEMENT: $TOKENS_COUNT tokens CSS (attendu >= 350)${NC}"
./scripts/verify_ds_tokens.sh:54:        echo -e "${RED}✗ ERREUR: Seulement $TOKENS_COUNT tokens CSS (attendu >= 350)${NC}"
./scripts/verify_ds_tokens.sh:68:        CAT_COUNT=$(grep -c "^[[:space:]]*--ds-$category-" "$TOKENS_CSS" || true)
./scripts/verify_ds_tokens.sh:84:TOKENS_TS="src/design-system/tokens.ts"
./scripts/verify_ds_tokens.sh:86:if [[ ! -f "$TOKENS_TS" ]]; then
./scripts/verify_ds_tokens.sh:87:    echo -e "${RED}✗ ERREUR: Fichier $TOKENS_TS introuvable${NC}"
./scripts/verify_ds_tokens.sh:91:    if grep -q "export const colors" "$TOKENS_TS"; then
./scripts/verify_ds_tokens.sh:98:    if grep -q "export const spacing" "$TOKENS_TS"; then
./scripts/verify_ds_tokens.sh:149:TOKENS_IMPORTS=$(grep -r "from.*tokens" src/components src/features 2>/dev/null | wc -l || true)
./scripts/verify_ds_tokens.sh:151:if [[ $TOKENS_IMPORTS -gt 10 ]]; then
./scripts/verify_ds_tokens.sh:152:    echo -e "${GREEN}✓${NC} $TOKENS_IMPORTS imports de tokens TypeScript"
./scripts/verify_ds_tokens.sh:154:    echo -e "${YELLOW}⚠ AVERTISSEMENT: Seulement $TOKENS_IMPORTS imports de tokens${NC}"
./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:1317:src/stories/assets/discord.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177575)"><mask id="mask0_10031_177575" style="mask-type:luminance" width="33" height="25" x="0" y="4" maskUnits="userSpaceOnUse"><path fill="#fff" d="M32.5034 4.00195H0.503906V28.7758H32.5034V4.00195Z"/></mask><g mask="url(#mask0_10031_177575)"><path fill="#5865F2" d="M27.5928 6.20817C25.5533 5.27289 23.3662 4.58382 21.0794 4.18916C21.0378 4.18154 20.9962 4.20057 20.9747 4.23864C20.6935 4.73863 20.3819 5.3909 20.1637 5.90358C17.7042 5.53558 15.2573 5.53558 12.8481 5.90358C12.6299 5.37951 12.307 4.73863 12.0245 4.23864C12.003 4.20184 11.9614 4.18281 11.9198 4.18916C9.63431 4.58255 7.44721 5.27163 5.40641 6.20817C5.38874 6.21578 5.3736 6.22848 5.36355 6.24497C1.21508 12.439 0.078646 18.4809 0.636144 24.4478C0.638667 24.477 0.655064 24.5049 0.677768 24.5227C3.41481 26.5315 6.06609 27.7511 8.66815 28.5594C8.70979 28.5721 8.75392 28.5569 8.78042 28.5226C9.39594 27.6826 9.94461 26.7968 10.4151 25.8653C10.4428 25.8107 10.4163 25.746 10.3596 25.7244C9.48927 25.3945 8.66058 24.9922 7.86343 24.5354C7.80038 24.4986 7.79533 24.4084 7.85333 24.3653C8.02108 24.2397 8.18888 24.109 8.34906 23.977C8.37804 23.9529 8.41842 23.9478 8.45249 23.963C13.6894 26.3526 19.359 26.3526 24.5341 23.963C24.5682 23.9465 24.6086 23.9516 24.6388 23.9757C24.799 24.1077 24.9668 24.2397 25.1358 24.3653C25.1938 24.4084 25.19 24.4986 25.127 24.5354C24.3298 25.0011 23.5011 25.3945 22.6296 25.7232C22.5728 25.7447 22.5476 25.8107 22.5754 25.8653C23.0559 26.7955 23.6046 27.6812 24.2087 28.5213C24.234 28.5569 24.2794 28.5721 24.321 28.5594C26.9357 27.7511 29.5869 26.5315 32.324 24.5227C32.348 24.5049 32.3631 24.4783 32.3656 24.4491C33.0328 17.5506 31.2481 11.5584 27.6344 6.24623C27.6256 6.22848 27.6105 6.21578 27.5928 6.20817ZM11.1971 20.8146C9.62043 20.8146 8.32129 19.3679 8.32129 17.5913C8.32129 15.8146 9.59523 14.368 11.1971 14.368C12.8115 14.368 14.0981 15.8273 14.0729 17.5913C14.0729 19.3679 12.7989 20.8146 11.1971 20.8146ZM21.8299 20.8146C20.2533 20.8146 18.9541 19.3679 18.9541 17.5913C18.9541 15.8146 20.228 14.368 21.8299 14.368C23.4444 14.368 24.7309 15.8273 24.7057 17.5913C24.7057 19.3679 23.4444 20.8146 21.8299 20.8146Z"/></g></g><defs><clipPath id="clip0_10031_177575"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
./src-tauri/src/api_hub/safety_bridge.rs:75:                "api_key".to_string(),
./src-tauri/src/api_hub/vault_bridge.rs:80:    pub async fn get_api_key(&self, provider: Provider) -> Result<Option<String>, APIHubError> {
./src-tauri/src/api_hub/vault_bridge.rs:128:    pub async fn store_api_key(&self, provider: Provider, key: &str) -> Result<(), APIHubError> {
./src-tauri/src/api_hub/vault_bridge.rs:172:    pub async fn delete_api_key(&self, provider: Provider) -> Result<bool, APIHubError> {
./src-tauri/src/api_hub/vault_bridge.rs:190:    pub async fn rotate_api_key(
./src-tauri/src/api_hub/vault_bridge.rs:253:            Provider::OpenAI => "OPENAI_API_KEY",
./src-tauri/src/api_hub/vault_bridge.rs:254:            Provider::Gemini => "GOOGLE_API_KEY",
./src-tauri/src/api_hub/vault_bridge.rs:255:            Provider::Anthropic => "ANTHROPIC_API_KEY",
./src-tauri/src/api_hub/vault_bridge.rs:256:            Provider::Copilot => "GITHUB_TOKEN", // ✅ P0 FIX
./src-tauri/src/api_hub/vault_bridge.rs:332:            .store_api_key(Provider::OpenAI, "sk-test-key-123")
./src-tauri/src/api_hub/vault_bridge.rs:334:            .expect("store_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:337:            .get_api_key(Provider::OpenAI)
./src-tauri/src/api_hub/vault_bridge.rs:339:            .expect("get_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:341:        assert_eq!(key, "sk-test-key-123");
./src-tauri/src/api_hub/vault_bridge.rs:349:            .store_api_key(Provider::Gemini, "test-key")
./src-tauri/src/api_hub/vault_bridge.rs:351:            .expect("store_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:355:            .delete_api_key(Provider::Gemini)
./src-tauri/src/api_hub/vault_bridge.rs:357:            .expect("delete_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:361:            .get_api_key(Provider::Gemini)
./src-tauri/src/api_hub/vault_bridge.rs:363:            .expect("get_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:373:            .store_api_key(Provider::Anthropic, "old-key")
./src-tauri/src/api_hub/vault_bridge.rs:375:            .expect("store_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:377:            .rotate_api_key(Provider::Anthropic, "new-key")
./src-tauri/src/api_hub/vault_bridge.rs:379:            .expect("rotate_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:382:            .get_api_key(Provider::Anthropic)
./src-tauri/src/api_hub/vault_bridge.rs:384:            .expect("get_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:394:            .store_api_key(Provider::OpenAI, "key1")
./src-tauri/src/api_hub/vault_bridge.rs:396:            .expect("store_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:398:            .get_api_key(Provider::OpenAI)
./src-tauri/src/api_hub/vault_bridge.rs:400:            .expect("get_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:402:            .get_api_key(Provider::OpenAI)
./src-tauri/src/api_hub/vault_bridge.rs:404:            .expect("get_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:416:            .store_api_key(Provider::OpenAI, "key")
./src-tauri/src/api_hub/vault_bridge.rs:418:            .expect("store_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:420:            .get_api_key(Provider::OpenAI)
./src-tauri/src/api_hub/vault_bridge.rs:422:            .expect("get_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:424:            .delete_api_key(Provider::OpenAI)
./src-tauri/src/api_hub/vault_bridge.rs:426:            .expect("delete_api_key should succeed");
./src-tauri/src/api_hub/vault_bridge.rs:435:        let original = "sk-test-secret-key-12345";
./src-tauri/src/api_hub/openai.rs:2://! TITANE∞ v20Ω — OPENAI PROVIDER
./src-tauri/src/api_hub/openai.rs:14:    api_key: String,
./src-tauri/src/api_hub/openai.rs:21:    pub fn new(api_key: String) -> Self {
./src-tauri/src/api_hub/openai.rs:23:            api_key,
./src-tauri/src/api_hub/copilot.rs:58:    api_key: String,
./src-tauri/src/api_hub/copilot.rs:62:    pub fn new(api_key: String) -> Result<Self, String> {
./src-tauri/src/api_hub/copilot.rs:68:        Ok(Self { client, api_key })
./src-tauri/src/api_hub/copilot.rs:80:            .header(header::AUTHORIZATION, format!("Bearer {}", self.api_key))
./src-tauri/src/api_hub/mod.rs:219:        if let Some(key) = self.vault.get_api_key(Provider::OpenAI).await? {
./src-tauri/src/api_hub/mod.rs:225:        if let Some(key) = self.vault.get_api_key(Provider::Gemini).await? {
./src-tauri/src/api_hub/mod.rs:231:        if let Some(key) = self.vault.get_api_key(Provider::Anthropic).await? {
./src-tauri/src/api_hub/gemini.rs:2://! TITANE∞ v20Ω — GEMINI PROVIDER
./src-tauri/src/api_hub/gemini.rs:14:    api_key: String,
./src-tauri/src/api_hub/gemini.rs:20:    pub fn new(api_key: String) -> Self {
./src-tauri/src/api_hub/gemini.rs:22:            api_key,
./src-tauri/src/runtime_config.rs:63:    let gemini_configured = match secrets.has_secret("gemini_api_key") {
./src-tauri/src/secure_engine.rs:2://   TITANE∞ v∞ — SECURE SECRETS CORE
./src-tauri/src/secure_engine.rs:21:    #[error("Missing TITANE_SECRETS_PASSPHRASE environment variable")]
./src-tauri/src/secure_engine.rs:159:    match std::env::var("TITANE_SECRETS_PASSPHRASE") {
./scripts/network/validate-network.sh:104:    if echo "$HTML_CONTENT" | grep -qiE "(sk-|api[_-]?key|secret)"; then
./src/__tests__/ai-subsystem-validation-v20omega.test.ts:86:      const validKey = 'sk-proj-' + 'x'.repeat(40);
./src/__tests__/ai-subsystem-validation-v20omega.test.ts:97:      const validKey = 'sk-ant-' + 'x'.repeat(50);
./src/__tests__/ai-subsystem-validation-v20omega.test.ts:98:      const invalidKey = 'sk-';
./src/__tests__/ai-subsystem-validation-v20omega.test.ts:108:      const key = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';
./src/__tests__/ai-subsystem-validation-v20omega.test.ts:116:      expect(masked.startsWith('sk-')).toBe(true);
./src-tauri/src/gemini_provider_refactor.rs:16:    pub api_key: String,
./src-tauri/src/gemini_provider_refactor.rs:95:        if self.config.api_key.is_empty() {
./src-tauri/src/gemini_provider_refactor.rs:120:            self.config.model, self.config.api_key
./src-tauri/src/gemini_provider_refactor.rs:268:            api_key: "test-key".to_string(),
./src-tauri/src/gemini_provider_refactor.rs:279:    fn test_invalid_api_key() {
./src-tauri/src/gemini_provider_refactor.rs:281:            api_key: "".to_string(),
./src-tauri/src/gemini_provider_refactor.rs:296:            api_key: "test-key".to_string(),
./src-tauri/src/gemini_provider_refactor.rs:311:            api_key: "test-key".to_string(),
./src-tauri/src/gemini_provider_refactor.rs:339:            api_key: "test-key".to_string(),
./src-tauri/src/gemini_provider_refactor.rs:359:            api_key: "test-key".to_string(),
./deployment/latest/certification/p3/proof_packs/P3_1_CONTRACT_20260216_151524/COMMANDS_RUN.txt:135:-rw-rw-r--  1 titane-os titane-os    9890 janv.  3 18:40 GEMINI_CONFIGURATION.md
./scripts/setup-gemini.sh:28:# Vérifier TITANE_SECRETS_PASSPHRASE
./scripts/setup-gemini.sh:29:if ! grep -q "^TITANE_SECRETS_PASSPHRASE=" .env || grep -q "^TITANE_SECRETS_PASSPHRASE=$" .env || grep -q "^TITANE_SECRETS_PASSPHRASE=change" .env; then
./scripts/setup-gemini.sh:30:    echo -e "${YELLOW}⚠️  TITANE_SECRETS_PASSPHRASE non configuré${NC}"
./scripts/setup-gemini.sh:48:    if grep -q "^TITANE_SECRETS_PASSPHRASE=" .env; then
./scripts/setup-gemini.sh:49:        sed -i "s|^TITANE_SECRETS_PASSPHRASE=.*|TITANE_SECRETS_PASSPHRASE=${PASSPHRASE}|" .env
./scripts/setup-gemini.sh:51:        echo "TITANE_SECRETS_PASSPHRASE=${PASSPHRASE}" >> .env
./scripts/setup-gemini.sh:56:    echo -e "${GREEN}✅ TITANE_SECRETS_PASSPHRASE déjà configuré${NC}"
./scripts/setup-gemini.sh:83:if grep -q "^GEMINI_API_KEY=" .env && ! grep -q "^GEMINI_API_KEY=$" .env; then
./scripts/setup-gemini.sh:84:    echo -e "     ${GREEN}✅ GEMINI_API_KEY détecté dans .env${NC}"
./scripts/setup-gemini.sh:90:    echo "        GEMINI_API_KEY=votre_cle_ici"
./scripts/setup-gemini.sh:101:if grep -q "^TITANE_SECRETS_PASSPHRASE=.\+" .env; then
./scripts/setup-gemini.sh:102:    PASS_LEN=$(grep "^TITANE_SECRETS_PASSPHRASE=" .env | cut -d= -f2 | wc -c)
./scripts/setup-gemini.sh:104:        echo -e "${GREEN}✅ TITANE_SECRETS_PASSPHRASE: Configuré (${PASS_LEN} caractères)${NC}"
./scripts/setup-gemini.sh:106:        echo -e "${YELLOW}⚠️  TITANE_SECRETS_PASSPHRASE: Trop court (${PASS_LEN} caractères)${NC}"
./scripts/setup-gemini.sh:109:    echo -e "${RED}❌ TITANE_SECRETS_PASSPHRASE: Non configuré${NC}"
./scripts/setup-gemini.sh:112:if grep -q "^GEMINI_API_KEY=.\+" .env; then
./scripts/setup-gemini.sh:113:    KEY_LEN=$(grep "^GEMINI_API_KEY=" .env | cut -d= -f2 | wc -c)
./scripts/setup-gemini.sh:115:        echo -e "${GREEN}✅ GEMINI_API_KEY: Présent (${KEY_LEN} caractères) - Sera migré${NC}"
./scripts/setup-gemini.sh:117:        echo -e "${YELLOW}⚠️  GEMINI_API_KEY: Semble invalide (${KEY_LEN} caractères)${NC}"
./scripts/setup-gemini.sh:120:    echo -e "${YELLOW}⚠️  GEMINI_API_KEY: Non configuré dans .env${NC}"
./scripts/setup-gemini.sh:125:SECRETS_FILE="$HOME/.local/share/titane-infinity/secrets.enc"
./scripts/setup-gemini.sh:126:if [ -f "$SECRETS_FILE" ]; then
./scripts/setup-gemini.sh:127:    FILE_SIZE=$(stat -f%z "$SECRETS_FILE" 2>/dev/null || stat -c%s "$SECRETS_FILE" 2>/dev/null || echo "0")
./scripts/setup-gemini.sh:129:    echo "   → $SECRETS_FILE"
./scripts/setup-gemini.sh:132:    echo "   → $SECRETS_FILE"
./scripts/setup-gemini.sh:150:echo "  ✓ Changer TITANE_SECRETS_PASSPHRASE en production"
./src-tauri/src/meta_orchestrator/commands.rs:137:        id: format!("task-{}", uuid::Uuid::new_v4()),
./scripts/health/health_check.sh:141:SECRET_PATTERNS="(API_KEY|TOKEN|PASSWORD|SECRET|PRIVATE_KEY)="
./scripts/health/health_check.sh:145:    REAL_SECRETS=$(grep -vE '^#|^[[:space:]]*$' "$envfile" | \
./scripts/health/health_check.sh:146:                   grep -E "$SECRET_PATTERNS" | \
./scripts/health/health_check.sh:149:    if [[ "$REAL_SECRETS" -gt 0 ]]; then
./scripts/test-apis-openai-anthropic.sh:4:# TITANE∞ v∞ - TEST APIS OPENAI & ANTHROPIC
./scripts/test-apis-openai-anthropic.sh:68:    "openai_api_key" \
./scripts/test-apis-openai-anthropic.sh:73:    "anthropic_api_key" \
./src-tauri/src/secure_commands.rs:15:use crate::security::secrets_engine::{KEY_COPILOT, KEY_GEMINI, KEY_OPENAI};
./src-tauri/src/secure_commands.rs:90:const KEY_ANTHROPIC: &str = "anthropic_api_key";
./src-tauri/src/secure_commands.rs:92:const KEY_GITHUB_TOKEN: &str = "github_token";
./src-tauri/src/secure_commands.rs:95:const KNOWN_SECRETS: &[KnownSecret] = &[
./src-tauri/src/secure_commands.rs:97:        key: KEY_GEMINI,
./src-tauri/src/secure_commands.rs:98:        category: "api_key",
./src-tauri/src/secure_commands.rs:101:        key: KEY_OPENAI,
./src-tauri/src/secure_commands.rs:102:        category: "api_key",
./src-tauri/src/secure_commands.rs:105:        key: KEY_ANTHROPIC,
./src-tauri/src/secure_commands.rs:106:        category: "api_key",
./src-tauri/src/secure_commands.rs:110:        category: "api_key",
./src-tauri/src/secure_commands.rs:114:        category: "api_key",
./src-tauri/src/secure_commands.rs:117:        key: KEY_GITHUB_TOKEN,
./src-tauri/src/secure_commands.rs:153:    let configured = secrets.has_secret("gemini_api_key").unwrap_or(false);
./src-tauri/src/secure_commands.rs:156:        .get_secret("gemini_api_key")
./src-tauri/src/secure_commands.rs:177:    api_key: String,
./src-tauri/src/secure_commands.rs:186:    let trimmed = api_key.trim();
./src-tauri/src/secure_commands.rs:187:    if let Err(err) = PayloadValidator::validate_string(trimmed, "api_key", true) {
./src-tauri/src/secure_commands.rs:199:    let previously_configured = secrets.has_secret("gemini_api_key").unwrap_or(false);
./src-tauri/src/secure_commands.rs:202:        .set_secret("gemini_api_key", new_value.clone())
./src-tauri/src/secure_commands.rs:206:        let mut guard = orchestrator.gemini_api_key.write().await;
./src-tauri/src/secure_commands.rs:213:    let env_present = std::env::var("GEMINI_API_KEY").is_ok();
./src-tauri/src/secure_commands.rs:214:    let env_purged = match purge_env_key("GEMINI_API_KEY").await {
./src-tauri/src/secure_commands.rs:216:            info!("[SecureCommands] Purged GEMINI_API_KEY from .env");
./src-tauri/src/secure_commands.rs:222:                    "[SecureCommands] Failed to purge GEMINI_API_KEY from .env: {}",
./src-tauri/src/secure_commands.rs:249:    let provider_enabled = orchestrator.gemini_api_key.read().await.is_some();
./src-tauri/src/secure_commands.rs:250:    let env_present = std::env::var("GEMINI_API_KEY").is_ok();
./src-tauri/src/secure_commands.rs:259:    api_key: String,
./src-tauri/src/secure_commands.rs:268:    let trimmed = api_key.trim();
./src-tauri/src/secure_commands.rs:269:    if let Err(err) = PayloadValidator::validate_string(trimmed, "api_key", true) {
./src-tauri/src/secure_commands.rs:282:    let previously_configured = secrets.has_secret("openai_api_key").unwrap_or(false);
./src-tauri/src/secure_commands.rs:285:        .set_secret("openai_api_key", new_value.clone())
./src-tauri/src/secure_commands.rs:289:        let mut guard = orchestrator.openai_api_key.write().await;
./src-tauri/src/secure_commands.rs:296:    let env_present = std::env::var("OPENAI_API_KEY").is_ok();
./src-tauri/src/secure_commands.rs:297:    let env_purged = match purge_env_key("OPENAI_API_KEY").await {
./src-tauri/src/secure_commands.rs:299:            info!("[SecureCommands] Purged OPENAI_API_KEY from .env");
./src-tauri/src/secure_commands.rs:305:                    "[SecureCommands] Failed to purge OPENAI_API_KEY from .env: {}",
./src-tauri/src/secure_commands.rs:314:        .get_secret("openai_api_key")
./src-tauri/src/secure_commands.rs:340:    let provider_enabled = orchestrator.openai_api_key.read().await.is_some();
./src-tauri/src/secure_commands.rs:341:    let configured = secrets.has_secret("openai_api_key").unwrap_or(false);
./src-tauri/src/secure_commands.rs:343:        .get_secret("openai_api_key")
./src-tauri/src/secure_commands.rs:352:        env_present: std::env::var("OPENAI_API_KEY").is_ok(),
./src-tauri/src/secure_commands.rs:361:    api_key: String,
./src-tauri/src/secure_commands.rs:370:    let trimmed = api_key.trim();
./src-tauri/src/secure_commands.rs:371:    if let Err(err) = PayloadValidator::validate_string(trimmed, "api_key", true) {
./src-tauri/src/secure_commands.rs:384:    let previously_configured = secrets.has_secret("anthropic_api_key").unwrap_or(false);
./src-tauri/src/secure_commands.rs:387:        .set_secret("anthropic_api_key", new_value.clone())
./src-tauri/src/secure_commands.rs:391:        let mut guard = orchestrator.anthropic_api_key.write().await;
./src-tauri/src/secure_commands.rs:400:    let env_present = std::env::var("ANTHROPIC_API_KEY").is_ok();
./src-tauri/src/secure_commands.rs:401:    let env_purged = match purge_env_key("ANTHROPIC_API_KEY").await {
./src-tauri/src/secure_commands.rs:403:            info!("[SecureCommands] Purged ANTHROPIC_API_KEY from .env");
./src-tauri/src/secure_commands.rs:409:                    "[SecureCommands] Failed to purge ANTHROPIC_API_KEY from .env: {}",
./src-tauri/src/secure_commands.rs:418:        .get_secret("anthropic_api_key")
./src-tauri/src/secure_commands.rs:444:    let provider_enabled = orchestrator.anthropic_api_key.read().await.is_some();
./src-tauri/src/secure_commands.rs:445:    let configured = secrets.has_secret("anthropic_api_key").unwrap_or(false);
./src-tauri/src/secure_commands.rs:447:        .get_secret("anthropic_api_key")
./src-tauri/src/secure_commands.rs:456:        env_present: std::env::var("ANTHROPIC_API_KEY").is_ok(),
./src-tauri/src/secure_commands.rs:472:    let mut statuses = Vec::with_capacity(KNOWN_SECRETS.len());
./src-tauri/src/secure_commands.rs:474:    for secret in KNOWN_SECRETS {
./deployment/latest/certification/p3/proof_packs/P3_6_GATES_NO_VITE_20260216_170753/20_no_network_scan_src_tauri.txt:118:src-tauri/src/overdrive/chat_orchestrator.rs:1445:    // - Gemini: HEAD request to https://generativelanguage.googleapis.com/v1/models?key={API_KEY}
./deployment/latest/certification/p3/proof_packs/P3_6_GATES_NO_VITE_20260216_170753/20_no_network_scan_src_tauri.txt:139:src-tauri/src/ia/openai_gpt.rs:12:const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";
./scripts/fix/fix_chat_ia_config.sh:3:# ║  TITANE∞ - FIX CHAT IA - CONFIGURATION API GEMINI          ║
./scripts/fix/fix_chat_ia_config.sh:35:    if grep -q "VITE_GEMINI_API_KEY" .env; then
./scripts/fix/fix_chat_ia_config.sh:36:        echo "✅ VITE_GEMINI_API_KEY déjà configuré"
./scripts/fix/fix_chat_ia_config.sh:38:        echo "⚠️  VITE_GEMINI_API_KEY manquant - ajout nécessaire"
./scripts/fix/fix_chat_ia_config.sh:50:VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
./scripts/fix/fix_chat_ia_config.sh:67:echo "   2. Éditez le fichier .env et remplacez YOUR_API_KEY_HERE par votre clé"
./scripts/fix/fix_chat_ia_config.sh:71:if grep -q "YOUR_API_KEY_HERE" .env 2>/dev/null; then
./scripts/fix/fix_chat_ia_config.sh:536:echo "   Remplacer: YOUR_API_KEY_HERE par votre clé Gemini"
./deployment/latest/certification/p3/proof_packs/P3_6_GATES_NO_VITE_20260216_170753/21_no_network_scan_src.txt:92:src/stories/assets/discord.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177575)"><mask id="mask0_10031_177575" style="mask-type:luminance" width="33" height="25" x="0" y="4" maskUnits="userSpaceOnUse"><path fill="#fff" d="M32.5034 4.00195H0.503906V28.7758H32.5034V4.00195Z"/></mask><g mask="url(#mask0_10031_177575)"><path fill="#5865F2" d="M27.5928 6.20817C25.5533 5.27289 23.3662 4.58382 21.0794 4.18916C21.0378 4.18154 20.9962 4.20057 20.9747 4.23864C20.6935 4.73863 20.3819 5.3909 20.1637 5.90358C17.7042 5.53558 15.2573 5.53558 12.8481 5.90358C12.6299 5.37951 12.307 4.73863 12.0245 4.23864C12.003 4.20184 11.9614 4.18281 11.9198 4.18916C9.63431 4.58255 7.44721 5.27163 5.40641 6.20817C5.38874 6.21578 5.3736 6.22848 5.36355 6.24497C1.21508 12.439 0.078646 18.4809 0.636144 24.4478C0.638667 24.477 0.655064 24.5049 0.677768 24.5227C3.41481 26.5315 6.06609 27.7511 8.66815 28.5594C8.70979 28.5721 8.75392 28.5569 8.78042 28.5226C9.39594 27.6826 9.94461 26.7968 10.4151 25.8653C10.4428 25.8107 10.4163 25.746 10.3596 25.7244C9.48927 25.3945 8.66058 24.9922 7.86343 24.5354C7.80038 24.4986 7.79533 24.4084 7.85333 24.3653C8.02108 24.2397 8.18888 24.109 8.34906 23.977C8.37804 23.9529 8.41842 23.9478 8.45249 23.963C13.6894 26.3526 19.359 26.3526 24.5341 23.963C24.5682 23.9465 24.6086 23.9516 24.6388 23.9757C24.799 24.1077 24.9668 24.2397 25.1358 24.3653C25.1938 24.4084 25.19 24.4986 25.127 24.5354C24.3298 25.0011 23.5011 25.3945 22.6296 25.7232C22.5728 25.7447 22.5476 25.8107 22.5754 25.8653C23.0559 26.7955 23.6046 27.6812 24.2087 28.5213C24.234 28.5569 24.2794 28.5721 24.321 28.5594C26.9357 27.7511 29.5869 26.5315 32.324 24.5227C32.348 24.5049 32.3631 24.4783 32.3656 24.4491C33.0328 17.5506 31.2481 11.5584 27.6344 6.24623C27.6256 6.22848 27.6105 6.21578 27.5928 6.20817ZM11.1971 20.8146C9.62043 20.8146 8.32129 19.3679 8.32129 17.5913C8.32129 15.8146 9.59523 14.368 11.1971 14.368C12.8115 14.368 14.0981 15.8273 14.0729 17.5913C14.0729 19.3679 12.7989 20.8146 11.1971 20.8146ZM21.8299 20.8146C20.2533 20.8146 18.9541 19.3679 18.9541 17.5913C18.9541 15.8146 20.228 14.368 21.8299 14.368C23.4444 14.368 24.7309 15.8273 24.7057 17.5913C24.7057 19.3679 23.4444 20.8146 21.8299 20.8146Z"/></g></g><defs><clipPath id="clip0_10031_177575"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
./scripts/fix/auto_fix_complete.sh:119:    pub api_key: Arc<Mutex<Option<String>>>,
./scripts/fix/auto_fix_complete.sh:127:            api_key: Arc::new(Mutex::new(None)),
./scripts/fix/auto_fix_complete.sh:168:pub async fn chat_set_api_key(
./scripts/fix/auto_fix_complete.sh:169:    api_key: String,
./scripts/fix/auto_fix_complete.sh:172:    let mut key = state.api_key.lock().await;
./scripts/fix/auto_fix_complete.sh:173:    *key = Some(api_key);
./scripts/fix/auto_fix_complete.sh:181:    let key = state.api_key.lock().await;
./scripts/fix/auto_fix_complete.sh:209:    sed -i '/^use /a use api::chat_commands::{ChatState, chat_send_message, chat_get_history, chat_clear_history, chat_set_api_key, chat_check_config};' "$MAIN_RS"
./scripts/fix/auto_fix_complete.sh:226:    sed -i '/generate_handler!\[/a \            chat_send_message,\n            chat_get_history,\n            chat_clear_history,\n            chat_set_api_key,\n            chat_check_config,' "$MAIN_RS"
./scripts/fix/auto_fix_complete.sh:441:    if grep -q "VITE_GEMINI_API_KEY" .env; then
./scripts/fix/auto_fix_complete.sh:444:        echo "📝 Ajout VITE_GEMINI_API_KEY dans .env..."
./scripts/fix/auto_fix_complete.sh:445:        echo "VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE" >> .env
./scripts/fix/auto_fix_complete.sh:452:VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
./scripts/fix/auto_fix_complete.sh:507:echo "1️⃣  CONFIGURER LA CLÉ API GEMINI:"
./scripts/fix/auto_fix_complete.sh:509:echo "   Remplacer: YOUR_API_KEY_HERE par votre clé"
./src-tauri/src/memory_os/memory_os_bridge.rs:57:            api_key: None,
./src-tauri/src/memory_os/memory_os_bridge.rs:327:        // Search in LTM (disk-based, use index)
./src-tauri/src/memory_os/memory_os_bridge.rs:329:            // LTM is disk-based, would need to load content from file
./scripts/security/secret-scan.sh:9:echo "🔒 [SECRET-SCAN] TITANE∞ Production Secret Scanner"
./scripts/security/secret-scan.sh:43:    "SECRETS\\.md$"
./scripts/security/secret-scan.sh:77:    SECRET_CONTENT_PATTERNS=(
./scripts/security/secret-scan.sh:86:    for pattern in "${SECRET_CONTENT_PATTERNS[@]}"; do
./scripts/security/secret-scan.sh:89:            echo "⚠️ PATTERN SECRET détecté dans:"
./scripts/security/secret-scan.sh:120:    echo "✅ SECRET-SCAN: PASS - Aucun secret critique tracké"
./scripts/security/secret-scan.sh:122:    echo "❌ SECRET-SCAN: FAIL - Secrets bloquants détectés"
./src-tauri/src/memory_os/ltm.rs:69:/// - Persistent storage (disk-based)
./src-tauri/src/conversation_engine/commands.rs:177:        has_gemini_credentials: std::env::var("GEMINI_API_KEY")
./src-tauri/src/conversation_engine/commands.rs:180:        has_brave_credentials: std::env::var("BRAVE_API_KEY")
./src-tauri/src/conversation_engine/commands.rs:260:                        "Recherche web indisponible: clé API manquante côté backend. Activez BRAVE_API_KEY pour réactiver la recherche gouvernée.".to_string(),
./src-tauri/src/memory_os/embeddings.rs:29:    pub api_key: Option<String>,
./src-tauri/src/memory_os/embeddings.rs:40:            api_key: None,
./src-tauri/src/memory_os/embeddings.rs:105:        let api_key = self.config.api_key.as_ref().ok_or_else(|| {
./src-tauri/src/memory_os/embeddings.rs:129:            .header("Authorization", format!("Bearer {}", api_key))
./src-tauri/src/memory_os/embeddings.rs:152:        let api_key = self.config.api_key.as_ref().ok_or_else(|| {
./src-tauri/src/memory_os/embeddings.rs:185:            self.config.model, api_key
./src-tauri/src/memory_os/config.rs:45:    pub api_key: Option<String>,
./src-tauri/src/memory_os/config.rs:68:                api_key: None,
./src/__tests__/persistentMemory.test.ts:36:  MAX_CONTEXT_INJECTION_TOKENS,
./src/__tests__/persistentMemory.test.ts:251:      expect(MAX_CONTEXT_INJECTION_TOKENS).toBe(2000);
./src/__tests__/persistentMemory.test.ts:530:      expect(containsSensitiveData('API_KEY=abc123xyz')).toBe(true);
./src/__tests__/persistentMemory.test.ts:928:      p.test('api_key=abc123')
./scripts/diagnostic/status_dashboard.sh:65:  GEMINI_KEY=$(grep VITE_GEMINI_API_KEY .env | cut -d= -f2)
./scripts/diagnostic/status_dashboard.sh:66:  if [ -n "$GEMINI_KEY" ] && [ "$GEMINI_KEY" != "your_api_key_here" ]; then
./scripts/diagnostic/status_dashboard.sh:68:    echo -e "     └─ API Key:       ${GEMINI_KEY:0:25}..."
./scripts/diagnostic/status_dashboard.sh:177:[ -n "$GEMINI_KEY" ] && [ "$GEMINI_KEY" != "your_api_key_here" ] && ((SCORE+=20))
./scripts/diagnostic/e2e_validation_v27.2.1.sh:125:    echo "   $ echo 'GEMINI_API_KEY=<your_key>' >> $PROJECT_ROOT/.env"
./scripts/diagnostic/reproduce_conversation_trace.sh:48:    grep -E "^(GEMINI|OPENAI|ANTHROPIC)_API_KEY" .env 2>/dev/null | sed 's/=.*/=***MASKED***/' || echo "  (aucune clé active)"
./scripts/diagnostic/diagnostic_ia.sh:17:    if grep -q "VITE_GEMINI_API_KEY=" .env; then
./scripts/diagnostic/diagnostic_ia.sh:18:        KEY=$(grep "VITE_GEMINI_API_KEY=" .env | cut -d'=' -f2)
./scripts/diagnostic/diagnostic_ia.sh:19:        if [ -n "$KEY" ] && [ "$KEY" != "your_api_key_here" ]; then
./scripts/diagnostic/diagnostic_ia.sh:20:            echo "✅ VITE_GEMINI_API_KEY configurée (${KEY:0:20}...)"
./scripts/diagnostic/diagnostic_ia.sh:22:            echo "⚠️  VITE_GEMINI_API_KEY vide ou placeholder"
./scripts/diagnostic/diagnostic_ia.sh:25:        echo "❌ VITE_GEMINI_API_KEY manquante dans .env"
./scripts/diagnostic/diagnostic_ia.sh:73:    KEY=$(grep "VITE_GEMINI_API_KEY=" .env | cut -d'=' -f2)
./scripts/diagnostic/diagnostic_ia.sh:75:    if [ -n "$KEY" ] && [ "$KEY" != "your_api_key_here" ]; then
./scripts/diagnostic/diagnostic_ia.sh:99:        echo "   → Ajoute VITE_GEMINI_API_KEY=ta_clé dans .env"
./scripts/diagnostic/diagnostic_ia.sh:114:elif [ -f ".env" ] && grep -q "VITE_GEMINI_API_KEY=" .env; then
./scripts/diagnostic/diagnostic_ia.sh:115:    KEY=$(grep "VITE_GEMINI_API_KEY=" .env | cut -d'=' -f2)
./scripts/diagnostic/diagnostic_ia.sh:116:    if [ -n "$KEY" ] && [ "$KEY" != "your_api_key_here" ]; then
./scripts/diagnostic/diagnostic_ia.sh:117:        echo "✅ GEMINI CONFIGURÉ → Mode cloud (nécessite internet)"
./scripts/diagnostic/diagnostic_ia.sh:130:        echo "  2. Ajouter dans .env: VITE_GEMINI_API_KEY=ta_clé"
./scripts/diagnostic/diagnostic_ia.sh:136:    echo "  • Gemini (cloud): Ajoute VITE_GEMINI_API_KEY dans .env"
./deployment/latest/certification/p3/proof_packs/P3_6_GATES_NO_SERVER_20260216_165207/07_no_network_scan_src_tauri.txt:233:src-tauri/src/ia/openai_gpt.rs:12:const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";
./deployment/latest/certification/p3/proof_packs/P3_6_GATES_NO_SERVER_20260216_165207/07_no_network_scan_src_tauri.txt:273:src-tauri/src/overdrive/chat_orchestrator.rs:1445:    // - Gemini: HEAD request to https://generativelanguage.googleapis.com/v1/models?key={API_KEY}
./scripts/diagnostic/diagnostic_script.sh:107:print_header "SECTION 2/8: CONFIGURATION API GEMINI"
./scripts/diagnostic/diagnostic_script.sh:113:    # Vérifier VITE_GEMINI_API_KEY
./scripts/diagnostic/diagnostic_script.sh:114:    if grep -q "VITE_GEMINI_API_KEY" .env; then
./scripts/diagnostic/diagnostic_script.sh:115:        API_KEY=$(grep VITE_GEMINI_API_KEY .env | cut -d '=' -f2)
./scripts/diagnostic/diagnostic_script.sh:117:        if [ -z "$API_KEY" ]; then
./scripts/diagnostic/diagnostic_script.sh:118:            print_error "VITE_GEMINI_API_KEY vide"
./scripts/diagnostic/diagnostic_script.sh:119:        elif [ "$API_KEY" = "YOUR_API_KEY_HERE" ]; then
./scripts/diagnostic/diagnostic_script.sh:120:            print_error "VITE_GEMINI_API_KEY non configuré (template par défaut)"
./scripts/diagnostic/diagnostic_script.sh:125:            MASKED_KEY="${API_KEY:0:10}..."
./scripts/diagnostic/diagnostic_script.sh:126:            print_ok "VITE_GEMINI_API_KEY configuré: $MASKED_KEY"
./scripts/diagnostic/diagnostic_script.sh:129:            if [[ ! "$API_KEY" =~ ^AIza ]]; then
./scripts/diagnostic/diagnostic_script.sh:134:        print_error "VITE_GEMINI_API_KEY manquant dans .env"
./scripts/diagnostic/diagnostic_script.sh:138:    print_info "Créez .env avec: VITE_GEMINI_API_KEY=votre_clé"
./scripts/diagnostic/diagnostic_script.sh:142:if command -v curl &> /dev/null && [ -n "$API_KEY" ] && [ "$API_KEY" != "YOUR_API_KEY_HERE" ]; then
./scripts/diagnostic/diagnostic_script.sh:147:        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY" \
./src-tauri/src/control_panel_commands.rs:47:    pub gemini_api_key: String,
./src-tauri/src/control_panel_commands.rs:103:// IA CONFIGURATION PERSISTENCE (GEMINI)
./src-tauri/src/control_panel_commands.rs:107:const GEMINI_KEY_SENTINEL: &str = "***MASKED***";
./src-tauri/src/control_panel_commands.rs:108:const DEFAULT_GEMINI_MODEL: &str = "gemini-pro";
./src-tauri/src/control_panel_commands.rs:111:const MIN_TOKENS: u32 = 64;
./src-tauri/src/control_panel_commands.rs:112:const MAX_TOKENS: u32 = 8192;
./src-tauri/src/control_panel_commands.rs:142:    std::env::var("GEMINI_MODEL").unwrap_or_else(|_| DEFAULT_GEMINI_MODEL.to_string())
./src-tauri/src/control_panel_commands.rs:159:    value.clamp(MIN_TOKENS, MAX_TOKENS)
./src-tauri/src/control_panel_commands.rs:238:    let masked_key = match secrets.has_secret("gemini_api_key") {
./src-tauri/src/control_panel_commands.rs:239:        Ok(true) => GEMINI_KEY_SENTINEL.to_string(),
./src-tauri/src/control_panel_commands.rs:245:        gemini_api_key: masked_key,
./src-tauri/src/control_panel_commands.rs:258:        gemini_api_key,
./src-tauri/src/control_panel_commands.rs:264:    let key_input = gemini_api_key.trim().to_string();
./src-tauri/src/control_panel_commands.rs:272:    if key_input == GEMINI_KEY_SENTINEL {
./src-tauri/src/control_panel_commands.rs:276:            .clear_secret("gemini_api_key")
./src-tauri/src/control_panel_commands.rs:279:            let mut guard = orchestrator.gemini_api_key.write().await;
./src-tauri/src/control_panel_commands.rs:288:            .set_secret("gemini_api_key", key_input.clone())
./src-tauri/src/control_panel_commands.rs:291:            let mut guard = orchestrator.gemini_api_key.write().await;
./GUIDE_INSTALLATION_SETUP_v27.0.0.md:514:GEMINI_API_KEY="sk-..."
./GUIDE_INSTALLATION_SETUP_v27.0.0.md:841:api_key_encrypted = "..."
./deployment/latest/certification/p3/proof_packs/P3_6_GATES_NO_SERVER_20260216_165207/08_no_network_scan_src.txt:80:src/stories/assets/discord.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177575)"><mask id="mask0_10031_177575" style="mask-type:luminance" width="33" height="25" x="0" y="4" maskUnits="userSpaceOnUse"><path fill="#fff" d="M32.5034 4.00195H0.503906V28.7758H32.5034V4.00195Z"/></mask><g mask="url(#mask0_10031_177575)"><path fill="#5865F2" d="M27.5928 6.20817C25.5533 5.27289 23.3662 4.58382 21.0794 4.18916C21.0378 4.18154 20.9962 4.20057 20.9747 4.23864C20.6935 4.73863 20.3819 5.3909 20.1637 5.90358C17.7042 5.53558 15.2573 5.53558 12.8481 5.90358C12.6299 5.37951 12.307 4.73863 12.0245 4.23864C12.003 4.20184 11.9614 4.18281 11.9198 4.18916C9.63431 4.58255 7.44721 5.27163 5.40641 6.20817C5.38874 6.21578 5.3736 6.22848 5.36355 6.24497C1.21508 12.439 0.078646 18.4809 0.636144 24.4478C0.638667 24.477 0.655064 24.5049 0.677768 24.5227C3.41481 26.5315 6.06609 27.7511 8.66815 28.5594C8.70979 28.5721 8.75392 28.5569 8.78042 28.5226C9.39594 27.6826 9.94461 26.7968 10.4151 25.8653C10.4428 25.8107 10.4163 25.746 10.3596 25.7244C9.48927 25.3945 8.66058 24.9922 7.86343 24.5354C7.80038 24.4986 7.79533 24.4084 7.85333 24.3653C8.02108 24.2397 8.18888 24.109 8.34906 23.977C8.37804 23.9529 8.41842 23.9478 8.45249 23.963C13.6894 26.3526 19.359 26.3526 24.5341 23.963C24.5682 23.9465 24.6086 23.9516 24.6388 23.9757C24.799 24.1077 24.9668 24.2397 25.1358 24.3653C25.1938 24.4084 25.19 24.4986 25.127 24.5354C24.3298 25.0011 23.5011 25.3945 22.6296 25.7232C22.5728 25.7447 22.5476 25.8107 22.5754 25.8653C23.0559 26.7955 23.6046 27.6812 24.2087 28.5213C24.234 28.5569 24.2794 28.5721 24.321 28.5594C26.9357 27.7511 29.5869 26.5315 32.324 24.5227C32.348 24.5049 32.3631 24.4783 32.3656 24.4491C33.0328 17.5506 31.2481 11.5584 27.6344 6.24623C27.6256 6.22848 27.6105 6.21578 27.5928 6.20817ZM11.1971 20.8146C9.62043 20.8146 8.32129 19.3679 8.32129 17.5913C8.32129 15.8146 9.59523 14.368 11.1971 14.368C12.8115 14.368 14.0981 15.8273 14.0729 17.5913C14.0729 19.3679 12.7989 20.8146 11.1971 20.8146ZM21.8299 20.8146C20.2533 20.8146 18.9541 19.3679 18.9541 17.5913C18.9541 15.8146 20.228 14.368 21.8299 14.368C23.4444 14.368 24.7309 15.8273 24.7057 17.5913C24.7057 19.3679 23.4444 20.8146 21.8299 20.8146Z"/></g></g><defs><clipPath id="clip0_10031_177575"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
./docs/__ARCHIVE_UI_CARTOGRAPHY_VAULT__/ui-carto-copilot/55-nonconformities/55-nonconformities-register.md:195:**Proof:** Documented in `40-observability/45-prod-boot-risk-register.md`
./scripts/checklist-interactive.sh:74:    echo "  2. Ajouter clé OpenAI: sk-proj-..."
./scripts/checklist-interactive.sh:75:    echo "  3. Ajouter clé Anthropic: sk-ant-api03-..."
./CERTIFICATION_PRODUCTION_FINAL.md:43:APPROVAL_TOKEN: GO_FOR_HUMAN_ACCEPTANCE_P11__TITANE_INFINITY
./scripts/audit-complete.sh:96:    if git grep -i -E '(password|secret|api_key|token).*=.*["\047]' -- ':!audit-reports' ':!*.md'; then
./scripts/verify_git_secure.sh:35:if grep -r "API_KEY.*=.*[\"'][a-zA-Z0-9]\{20,\}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "YOUR_API_KEY\|DEMO_KEY\|TEST_KEY"; then
./docs/backup_20251218_122540/PLAN_OPTIMISATION_RESPONSIVE_v25.7.4_ULTIMATE.md:129:   RESPONSIVE DESIGN TOKENS — TITANE∞ v25.7.4
./src/__tests__/c4-memory.test.ts:100:  const MAX_INJECTION_TOKENS = 500;
./src/__tests__/c4-memory.test.ts:103:    const maxTokens = MAX_INJECTION_TOKENS;
./src/__tests__/c4-memory.test.ts:112:    expect(estimatedTokens).toBeGreaterThanOrEqual(MAX_INJECTION_TOKENS / 2);
./src/__tests__/c4-memory.test.ts:113:    expect(estimatedTokens).toBeLessThanOrEqual(MAX_INJECTION_TOKENS);
./src/__tests__/c4-memory.test.ts:117:    expect(currentTokens).toBeLessThanOrEqual(MAX_INJECTION_TOKENS);
./src/__tests__/c4-memory.test.ts:137:      if (currentTokens + entryTokens > MAX_INJECTION_TOKENS) {
./src/__tests__/c4-memory.test.ts:149:    expect(currentTokens).toBeLessThanOrEqual(MAX_INJECTION_TOKENS);
./src/__tests__/c4-memory.test.ts:164:      if (currentTokens + tokens > MAX_INJECTION_TOKENS) {
./src/__tests__/c4-memory.test.ts:184:    const wouldExceed = currentTokens + sixthEntryTokens > MAX_INJECTION_TOKENS;
./src/__tests__/c4-memory.test.ts:257:    const MAX_TOKENS = 500;
./src/__tests__/c4-memory.test.ts:260:      const isValid = tc.memory_inject_tokens <= MAX_TOKENS;
./docs/SESSION_FINAL_2026-01-10.md:378:git push https://TOKEN@github.com/KallokTherok1994/TITANE_INFINITY.git MAIN
./scripts/governance/constitutional-audit.sh:81:echo "📋 L3: ZERO SECRETS - Aucun secret versionné..."
./scripts/governance/constitutional-audit.sh:89:    SECRET_EXIT=$?
./scripts/governance/constitutional-audit.sh:92:    if [ "$SECRET_EXIT" -eq 0 ]; then
./scripts/governance/constitutional-audit.sh:207:    echo "L3 (ZERO SECRETS): $([ -f "$PROJECT_ROOT/scripts/security/secret-scan.sh" ] && echo "VALIDATED" || echo "UNKNOWN")"
./docs/PROD_CERTIFICATION_v26.3.0.md:31:5. [Risk Assessment](#risk-assessment)
./docs/PROD_CERTIFICATION_v26.3.0.md:43:| **L3** | Aucun secret versionné | ✅ COMPLIANT | Secret scan PASS, `docs/SECRETS.md`, `.gitignore` verrouillé |
./docs/PROD_CERTIFICATION_v26.3.0.md:66:- ✅ `docs/SECRETS.md` (existant, validé)
./docs/INSTALLATION_GUIDE_v27.0.0_EN.md:503:GEMINI_API_KEY="sk-..."
./scripts/governance/prod-cert-release.sh:113:- **L3 ZERO SECRETS**: ✅ No secrets in version control
./scripts/governance/prod-cert-release.sh:166:✅ L3 ZERO SECRETS (no versioned secrets)
./docs/USER_ACTION_GUIDE_2026-01-10.md:70:# Password: ghp_YOUR_PERSONAL_ACCESS_TOKEN
./docs/USER_ACTION_GUIDE_2026-01-10.md:103:npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
./docs/CHAT_IA_VOICE_MODE_GUIDE.md:96:GEMINI_API_KEY=votre_cle_api_gemini
./docs/CHAT_IA_VOICE_MODE_GUIDE.md:317:export GEMINI_API_KEY="your-key"
./docs/06_api/TAURI_COMMANDS_REFERENCE.md:241:| `auth_save_api_keys` | Sauvegarde clés API |
./docs/06_api/TAURI_COMMANDS_REFERENCE.md:242:| `auth_get_api_keys` | Récupère clés (masquées) |
./docs/06_api/TAURI_COMMANDS_REFERENCE.md:243:| `auth_delete_api_key` | Supprime clé API |
./docs/backup_20251218_122540/PHASE_5_RESPONSIVE_OPTIMIZATION_COMPLETE_v26.md:197:    mask-image: linear-gradient(
./docs/backup_20251218_122540/QUICK_START_v∞.3.md:46:### 1. 🌐 PROVIDERS IA (GEMINI, OPENAI, ANTHROPIC, OLLAMA)
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:37:### 1️⃣ Reducer - Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:43:case 'SET_TOKENS':
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:47:case 'SET_TOKENS':
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:50:    tokens: action.tokens || DEFAULT_UI_THEME_TOKENS,
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:69:      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:71:      dispatch({ type: 'SET_TOKENS', tokens });
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:78:    dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:100:### 4️⃣ UPDATE_TOKEN & UPDATE_CATEGORY - Guards dans le reducer
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:103:case 'UPDATE_TOKEN': {
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:108:    console.error('[UIThemeReducer] tokens est null dans UPDATE_TOKEN');
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:172:      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:174:      dispatch({ type: 'SET_TOKENS', tokens });
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:180:    dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:210:1. **Backend indisponible** → ✅ Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:211:2. **Backend retourne null** → ✅ Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_122540/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:263:4. **Fallback systématique** → DEFAULT_UI_THEME_TOKENS toujours disponible
./docs/P0_IMPLEMENTATION_REPORT_2026-01-07.md:50:export const MODEL_TOKEN_LIMITS: Record<string, number> = { ... };
./docs/P0_IMPLEMENTATION_REPORT_2026-01-07.md:192:# - GEMINI_API_KEY
./docs/P0_IMPLEMENTATION_REPORT_2026-01-07.md:193:# - OPENAI_API_KEY
./docs/P0_IMPLEMENTATION_REPORT_2026-01-07.md:194:# - ANTHROPIC_API_KEY
./docs/audit/80_rapport_final_100.md:135:Provider::Copilot => "GITHUB_TOKEN",
./docs/audit/80_rapport_final_100.md:215:state.secrets_engine.set_secret(KEY_COPILOT, api_key.clone())  // ✅ RETIRÉ &
./docs/audit/80_rapport_final_100.md:235:3. Fix type: `api_key.clone()` au lieu de `&api_key`
./docs/backup_20251218_122540/COPILOT_SUPER_PROMPTS.md:757:4. Setup secrets (CODECOV_TOKEN, etc.)
./docs/PERFECTION_PLAN.md:42:grep -rn "password\|secret\|api_key\|token" src/ --include="*.ts" | head -20
./docs/backup_20251218_122540/README_v19.5.2_OLD.md:42:- ✅ **Client validation**: Format par provider (OpenAI sk-_, Claude sk-ant-_)
./docs/backup_20251218_122540/README_v19.5.2_OLD.md:123:export OPENAI_API_KEY="sk-..."
./docs/backup_20251218_122540/README_v19.5.2_OLD.md:124:export ANTHROPIC_API_KEY="sk-ant-..."
./docs/backup_20251218_122540/README_v19.5.2_OLD.md:125:export GOOGLE_API_KEY="AIza..."
./docs/backup_20251218_122540/README_v19.5.2_OLD.md:603:- **Configuration** : Créer `.env` avec `VITE_GEMINI_API_KEY=votre_clé`
./docs/REPAIR_PLAYBOOK.md:193:runtime/stable/logs/stable-build-20260116.log:ERROR Failed: GEMINI_API_KEY=AIzaSy...
./docs/GEMINI_CONFIGURATION.md:15:- Problème: TITANE_SECRETS_PASSPHRASE non défini
./docs/GEMINI_CONFIGURATION.md:26:│      TITANE_SECRETS_PASSPHRASE (16+ chars)  │
./docs/GEMINI_CONFIGURATION.md:62:2. Configure TITANE_SECRETS_PASSPHRASE (interactive)
./docs/GEMINI_CONFIGURATION.md:75:TITANE_SECRETS_PASSPHRASE=VoTr3P4ssPhr4s3S3cur1s33!
./docs/GEMINI_CONFIGURATION.md:78:GEMINI_API_KEY=votre_cle_google_gemini_ici
./docs/GEMINI_CONFIGURATION.md:126:Si `GEMINI_API_KEY` est défini dans `.env`:
./docs/GEMINI_CONFIGURATION.md:130:- Log: `[SecureCommands] Purged GEMINI_API_KEY from .env`
./docs/GEMINI_CONFIGURATION.md:140:echo ${#TITANE_SECRETS_PASSPHRASE}
./docs/GEMINI_CONFIGURATION.md:191:    api_key: String,
./docs/GEMINI_CONFIGURATION.md:242:TITANE_SECRETS_PASSPHRASE=
./docs/GEMINI_CONFIGURATION.md:245:GEMINI_API_KEY=
./docs/GEMINI_CONFIGURATION.md:246:GEMINI_MODEL=gemini-pro
./docs/GEMINI_CONFIGURATION.md:304:grep TITANE_SECRETS_PASSPHRASE .env
./docs/GEMINI_CONFIGURATION.md:307:echo "TITANE_SECRETS_PASSPHRASE=VoTr3P4ssPhr4s3" >> .env
./docs/GEMINI_CONFIGURATION.md:349:  1. Définir TITANE_SECRETS_PASSPHRASE dans .env
./docs/audit/21_security_audit.md:52:export OPENAI_API_KEY="..."
./docs/audit/21_security_audit.md:53:export GITHUB_TOKEN="..."
./docs/audit/71_copilot_module_issue.md:92:    pub api_key: Arc<RwLock<Option<String>>>,
./docs/audit/71_copilot_module_issue.md:178:    pub api_key: Arc<RwLock<Option<String>>>,
./docs/audit/71_copilot_module_issue.md:193:    pub api_key: std::sync::Arc<tokio::sync::RwLock<Option<String>>>,
./scripts/maintenance/health-check-enhanced.sh:325:    local secret_patterns=("API_KEY=" "SECRET=" "PASSWORD=" "TOKEN=")
./docs/audit/70_final_verification.md:83:Provider::Copilot => "GITHUB_TOKEN"
./docs/audit/70_final_verification.md:193:| **Vault Bridge** | ✅ Moyen | Gestion sécurisée GITHUB_TOKEN |
./docs/audit/70_final_verification.md:225:   - ✅ Variable environnement GITHUB_TOKEN
./docs/audit/70_final_verification.md:346:   - Guide configuration GITHUB_TOKEN
./docs/audit/90_audit_final_ultra_complet.md:188:    assert_eq!(key, "GITHUB_TOKEN");
./docs/audit/90_audit_final_ultra_complet.md:237:state.secrets_engine.set_secret(KEY_COPILOT, api_key.clone())
./docs/audit/20_backend_audit.md:251:    Provider::OpenAI => "OPENAI_API_KEY",
./docs/audit/20_backend_audit.md:252:    Provider::Gemini => "GEMINI_API_KEY",
./docs/audit/20_backend_audit.md:253:    Provider::Anthropic => "ANTHROPIC_API_KEY",
./docs/audit/20_backend_audit.md:254:    Provider::Copilot => "GITHUB_TOKEN", // ✅ Ajouter
./docs/backup_20251218_122540/RESUME_EXECUTIF_v24.3.3.md:33:- Reducer fallback → `DEFAULT_UI_THEME_TOKENS`
./docs/audit/60_changes_applied.md:212:        Provider::OpenAI => "OPENAI_API_KEY",
./docs/audit/60_changes_applied.md:213:        Provider::Anthropic => "ANTHROPIC_API_KEY",
./docs/audit/60_changes_applied.md:214:        Provider::Gemini => "GEMINI_API_KEY",
./docs/audit/60_changes_applied.md:215:        Provider::Local => "LOCAL_API_KEY",
./docs/audit/60_changes_applied.md:222:        Provider::OpenAI => "OPENAI_API_KEY",
./docs/audit/60_changes_applied.md:223:        Provider::Anthropic => "ANTHROPIC_API_KEY",
./docs/audit/60_changes_applied.md:224:        Provider::Gemini => "GEMINI_API_KEY",
./docs/audit/60_changes_applied.md:225:        Provider::Copilot => "GITHUB_TOKEN",  // ✨ AJOUTÉ
./docs/audit/60_changes_applied.md:226:        Provider::Local => "LOCAL_API_KEY",
./docs/audit/60_changes_applied.md:401:- ✅ Gestion sécurisée GITHUB_TOKEN
./docs/audit/50_master_report.md:596:grep -r "API_KEY.*=.*['\"]" src/
./docs/backup_20251218_122540/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:50:1. **Reducer Fallback** : `DEFAULT_UI_THEME_TOKENS` utilisé si tokens null
./docs/backup_20251218_122540/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:88:- ✅ **Fallback gracieux** : DEFAULT_UI_THEME_TOKENS utilisé automatiquement
./docs/backup_20251218_122540/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:612:- ✅ Fallback DEFAULT_UI_THEME_TOKENS automatique
./scripts/ultra-diagnostic.sh:241:    local sensitive_patterns=("password" "token" "secret" "key" "api_key")
./docs/backup_20251218_122540/VERIFICATION_APPROFONDIE_v26.0.md:134:        "password", "api_key", "secret", "credential"
./docs/backup_20251218_122540/VERIFICATION_APPROFONDIE_v26.0.md:303:## 🔒 SECRETS & CREDENTIALS AUDIT
./docs/backup_20251218_122540/TRANSFORMATION_MASTER_GUIDE.md:21:11. [Risk Management](#11-risk-management)
./docs/OLLAMA_SETUP.md:133:   - Requiert GEMINI_API_KEY
./docs/OLLAMA_SETUP.md:137:   - Requiert OPENAI_API_KEY
./docs/OLLAMA_SETUP.md:141:   - Requiert ANTHROPIC_API_KEY
./docs/COMPLETE_GO_ALL_REPORT_2026-01-07.md:414:let api_key = SecureSecret::new("sk-1234567890abcdef".to_string());
./docs/COMPLETE_GO_ALL_REPORT_2026-01-07.md:418:    let temp = api_key.expose_owned();
./docs/COMPLETE_GO_ALL_REPORT_2026-01-07.md:422:// api_key is zeroized when dropped at end of scope
./docs/diagnostics/IPC_CERTIFICATION_BLOCKED.md:17:- KNOWN_SECRETS array covers 7 secrets (Gemini, OpenAI, Anthropic, Copilot, Ollama, GitHub, backup)
./docs/diagnostics/IPC_CERTIFICATION_BLOCKED.md:29:   - Added SecretStatus struct + KNOWN_SECRETS array in secure_commands.rs
./docs/current/phases/completed/PHASE_5_RESPONSIVE_OPTIMIZATION_COMPLETE_v26.md:197:    mask-image: linear-gradient(
./docs/diagnostics/IPC_FINAL_MATRIX.md:23:- get_secrets_status implemented 2026-02-13: returns Vec<SecretStatus> with camelCase serde mapping, KNOWN_SECRETS array covers 7 secrets (Gemini, OpenAI, Anthropic, Copilot, Ollama URL, GitHub token, backup encryption key).
./docs/diagnostics/IPC_STABLE_SEAL.md:29:- get_secrets_status backend: src-tauri/src/secure_commands.rs (SecretStatus struct, KNOWN_SECRETS array, 7 secrets coverage)
./scripts/verify/verify_chat_online.sh:27:check_env GEMINI_API_KEY
./scripts/verify/verify_chat_online.sh:28:check_env OPENAI_API_KEY
./scripts/verify/verify_chat_online.sh:29:check_env ANTHROPIC_API_KEY
./scripts/verify/verify_chat_online.sh:31:if [[ -n "${GEMINI_API_KEY:-}" ]]; then
./scripts/verify/verify_chat_online.sh:32:  check_http "Gemini API" "curl -fsS -m 5 -H 'x-goog-api-key: ${GEMINI_API_KEY}' https://generativelanguage.googleapis.com/v1beta/models"
./scripts/verify/verify_chat_online.sh:35:if [[ -n "${OPENAI_API_KEY:-}" ]]; then
./scripts/verify/verify_chat_online.sh:36:  check_http "OpenAI API" "curl -fsS -m 5 -H 'Authorization: Bearer ${OPENAI_API_KEY}' https://api.openai.com/v1/models"
./scripts/verify/verify_chat_online.sh:39:if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
./scripts/verify/verify_chat_online.sh:40:  check_http "Anthropic API" "curl -fsS -m 5 -H 'x-api-key: ${ANTHROPIC_API_KEY}' -H 'anthropic-version: 2023-06-01' https://api.anthropic.com/v1/models"
./scripts/verify/verify-gitguardian-integration.sh:135:  if [ -n "$GITGUARDIAN_API_KEY" ]; then
./scripts/verify/verify-gitguardian-integration.sh:136:    echo -e "${GREEN}✅${NC} GITGUARDIAN_API_KEY is set"
./scripts/verify/verify-gitguardian-integration.sh:138:    echo -e "${YELLOW}⚠️${NC}  GITGUARDIAN_API_KEY is not set (required for CI/CD)"
./scripts/verify/verify-gitguardian-integration.sh:142:  echo -e "   ${YELLOW}ℹ️${NC}  For CI/CD, ensure GITGUARDIAN_API_KEY secret is configured"
./scripts/verify/verify-gitguardian-integration.sh:153:  echo "1. Add GITGUARDIAN_API_KEY to GitHub repository secrets"
./docs/VOCAL_MIGRATION_GUIDE.md:331:Configurer `GOOGLE_TTS_API_KEY` dans `.env` :
./docs/VOCAL_MIGRATION_GUIDE.md:334:GOOGLE_TTS_API_KEY=votre_cle_api
./scripts/verify/enforce-invariants-governed.sh:28:  rg -n "(API_KEY|SECRET|TOKEN|BRAVE)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{16,}" -S src src-tauri/src \
./scripts/verify/enforce-invariants-governed.sh:39:echo "HARDCODED_SECRET_ASSIGNMENTS=$secr_count"
./scripts/verify/pre-deployment-check.sh:229:    local secret_patterns=("API_KEY=" "SECRET=" "PASSWORD=" "TOKEN=" "sk-" "-----BEGIN")
./docs/user/features/chat.md:62:API Key: sk-proj-xxxxx
./docs/user/installation.md:66:VITE_OPENAI_API_KEY=sk-...
./docs/user/quickstart.md:132:API Key: sk-proj-...
./docs/user/quickstart.md:145:API Key: sk-ant-...
./docs/05_modules/backend/AI_ROUTER.md:60:    │  STAGE 2: GEMINI API (secondary, ~800-1200ms)    │
./docs/05_modules/backend/AI_ROUTER.md:114:#### `new(gemini_api_key: Option<String>, ollama_model: Option<String>) -> Self`
./docs/05_modules/backend/AI_ROUTER.md:119:- `gemini_api_key` — Optional Gemini API key (si configured)
./docs/05_modules/backend/AI_ROUTER.md:127:    Some("YOUR_GEMINI_API_KEY".to_string()),
./docs/05_modules/backend/AI_ROUTER.md:323:- `new(api_key: String) -> Self` — Create Gemini client
./docs/05_modules/backend/AI_ROUTER.md:698:export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
./docs/05_modules/backend/AI_ROUTER.md:704:export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
./docs/05_modules/backend/AI_ROUTER.md:705:export ANTHROPIC_API_KEY="YOUR_CLAUDE_API_KEY"
./docs/05_modules/backend/AI_ROUTER.md:712:let gemini_api_key = std::env::var("GEMINI_API_KEY").ok();
./docs/05_modules/backend/AI_ROUTER.md:715:let mut ai_router = AIRouter::new(gemini_api_key, ollama_model);
./docs/current/guides/QUICK_START_v∞.3.md:46:### 1. 🌐 PROVIDERS IA (GEMINI, OPENAI, ANTHROPIC, OLLAMA)
./docs/user/DOCUMENTATION_UTILISATEUR_COMPLETE_FINALE.md:1066:API Key: sk-proj-xxxxxxxxxxxxx
./docs/development/GITHUB_COPILOT_SUPER_PROMPTS.md:374:let api_key = env::var("API_KEY").unwrap();
./docs/development/GITHUB_COPILOT_SUPER_PROMPTS.md:379:let api_key = env::var("API_KEY")
./docs/development/GITHUB_COPILOT_SUPER_PROMPTS.md:380:    .map_err(|_| AppError::Config("API_KEY not set".to_string()))?;
./docs/current/architecture/TRANSFORMATION_MASTER_GUIDE.md:21:11. [Risk Management](#11-risk-management)
./scripts/ops/p8_record_approval.mjs:9: *   P8_APPROVAL_TOKEN=<token> node scripts/ops/p8_record_approval.mjs
./scripts/ops/p8_record_approval.mjs:127:  const token = process.env.P8_APPROVAL_TOKEN;
./scripts/ops/p8_record_approval.mjs:130:    console.error(`${LOG_PREFIX} ❌ P8_APPROVAL_TOKEN not set`);
./scripts/ops/p8_approval_gate.mjs:8: * - Reads P8_APPROVAL_TOKEN from environment
./scripts/ops/p8_approval_gate.mjs:26: * Check if P8_APPROVAL_TOKEN is provided and matches expected format
./scripts/ops/p8_approval_gate.mjs:29:  const token = process.env.P8_APPROVAL_TOKEN;
./scripts/ops/p8_approval_gate.mjs:33:      `${LOG_PREFIX} ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)`
./scripts/ops/p8_approval_gate.mjs:36:      `${LOG_PREFIX}    To proceed, provide token: export P8_APPROVAL_TOKEN=<token>`
./scripts/ops/p8_execute_distribution.mjs:205:    const tokenHash = process.env.P8_APPROVAL_TOKEN
./scripts/ops/p8_execute_distribution.mjs:208:          .update(process.env.P8_APPROVAL_TOKEN)
./scripts/ops/p8_execute_distribution.mjs:261:    `   - Run: P8_APPROVAL_TOKEN=<token> node scripts/ops/p8_record_approval.mjs`
./docs/backup_20251218_122540/PLAN_CONTINUATION_v24.3.3.md:180:     it('should fallback to DEFAULT_UI_THEME_TOKENS', () => {
./docs/super-prompts/VISUAL_GUIDE.md:120:    │ COLORS  │    │   TOKENS    │   │ TAILWIND│
./docs/guides/TAURI_FULL_DEPLOY.md:381:TITANE_SECRETS_PASSPHRASE=<auto-généré>
./scripts/test/test-provider-status.sh:55:SECRETS_DIR="$HOME/.local/share/titane-infinity/secrets"
./scripts/test/test-provider-status.sh:56:if [ -d "$SECRETS_DIR" ]; then
./scripts/test/test-provider-status.sh:59:    ls -lh "$SECRETS_DIR"/*.enc 2>/dev/null || echo "  No encrypted secrets found"
./scripts/test/test-bootstrap-api-keys.sh:41:echo "🔍 Logs bootstrap_api_keys:"
./docs/CONTINUATION_STATUS_2026-01-10.md:142:git push https://YOUR_TOKEN@github.com/KallokTherok1994/TITANE_INFINITY.git MAIN
./docs/backup_20251218_122540/CHANGELOG.md:1244:  - Storage directory + encryption password (TITANE_SECRETS_PASSPHRASE)
./docs/backup_20251218_122540/CHANGELOG.md:1328:- **Validation multi-format**: OpenAI (sk-_, 40+ chars), Claude (sk-ant-_, 50+ chars), Gemini (alphanumeric, 30+ chars)
./docs/backup_20251218_122540/CHANGELOG.md:1762:- Providers IA: 100% ✅ (GEMINI_API_KEY, OLLAMA_BASE_URL OK)
./scripts/test/test_ia_v16.sh:26:  GEMINI_KEY=$(grep "GEMINI_API_KEY=" .env | cut -d'=' -f2)
./scripts/test/test_ia_v16.sh:27:  GEMINI_MODEL=$(grep "GEMINI_MODEL=" .env | cut -d'=' -f2)
./scripts/test/test_ia_v16.sh:31:  log "  → Gemini Model: $GEMINI_MODEL"
./scripts/test/test_ia_v16.sh:32:  log "  → Gemini Key: ${GEMINI_KEY:0:20}..."
./scripts/test/test_ia_v16.sh:41:# 2. TEST GEMINI API
./scripts/test/test_ia_v16.sh:45:GEMINI_URL="https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}"
./scripts/test/test_ia_v16.sh:46:GEMINI_RESPONSE=$(curl -s --max-time 10 "$GEMINI_URL" \
./scripts/test/test_ia_v16.sh:52:if [[ "$GEMINI_RESPONSE" =~ "ERROR" ]] || [[ "$GEMINI_RESPONSE" =~ "error" ]]; then
./scripts/test/test_ia_v16.sh:54:  log "   Réponse: $GEMINI_RESPONSE"
./scripts/test/test_ia_v16.sh:57:  log "   Réponse: ${GEMINI_RESPONSE:0:80}..."
./scripts/test/test_api_integration.sh:174:if [ -n "$OPENAI_API_KEY" ]; then
./scripts/test/test_api_integration.sh:175:    test_pass "OPENAI_API_KEY is set (${#OPENAI_API_KEY} chars)"
./scripts/test/test_api_integration.sh:177:    test_skip "OPENAI_API_KEY" "Not configured (Gemini/Ollama fallback will be used)"
./scripts/test/test_api_integration.sh:180:if [ -n "$ANTHROPIC_API_KEY" ]; then
./scripts/test/test_api_integration.sh:181:    test_pass "ANTHROPIC_API_KEY is set (${#ANTHROPIC_API_KEY} chars)"
./scripts/test/test_api_integration.sh:183:    test_skip "ANTHROPIC_API_KEY" "Not configured (Gemini/Ollama fallback will be used)"
./scripts/test/test_api_integration.sh:186:if [ -n "$GEMINI_API_KEY" ]; then
./scripts/test/test_api_integration.sh:187:    test_pass "GEMINI_API_KEY is set (${#GEMINI_API_KEY} chars)"
./scripts/test/test_api_integration.sh:189:    test_skip "GEMINI_API_KEY" "Not configured (Ollama fallback will be used)"
./scripts/test/validate_all.sh:54:test_check "GEMINI_API_KEY configurée" "grep -q 'GEMINI_API_KEY=' .env"
./docs/99_ARCHIVE/guides/GUIDE_ELIMINATION_UNWRAP_PHASE1.md:17:let api_key = api_key.unwrap();
./docs/99_ARCHIVE/guides/GUIDE_ELIMINATION_UNWRAP_PHASE1.md:20:let api_key = api_key.ok_or_else(|| {
./docs/99_ARCHIVE/guides/GUIDE_ELIMINATION_UNWRAP_PHASE1.md:21:    "API key not found: GEMINI_API_KEY not set in environment or secrets".to_string()
./docs/99_ARCHIVE/guides/GUIDE_ELIMINATION_UNWRAP_PHASE1.md:25:**Contexte**: Fonction `ping_gemini_internal()` — Si `api_key` est `None`, unwrap() panic.
./scripts/test/test_chat_ia_backend.sh:77:  GEMINI_KEY=$(grep VITE_GEMINI_API_KEY .env | cut -d= -f2)
./scripts/test/test_chat_ia_backend.sh:78:  if [ -n "$GEMINI_KEY" ] && [ "$GEMINI_KEY" != "your_api_key_here" ]; then
./scripts/test/test_chat_ia_backend.sh:79:    echo -e "   ${GREEN}✓${NC} Gemini API key configured (${GEMINI_KEY:0:20}...)"
./docs/99_ARCHIVE/guides/QUICK_START_v∞.3.md:46:### 1. 🌐 PROVIDERS IA (GEMINI, OPENAI, ANTHROPIC, OLLAMA)
./docs/99_ARCHIVE/guides/GUIDE_RUN_TITANE.md:175:OPENAI_API_KEY=sk-...
./docs/99_ARCHIVE/guides/GUIDE_RUN_TITANE.md:176:ANTHROPIC_API_KEY=sk-ant-...
./docs/99_ARCHIVE/guides/GUIDE_RUN_TITANE.md:177:GOOGLE_API_KEY=AIza...
./docs/99_ARCHIVE/guides/README_v19.5.2_OLD.md:42:- ✅ **Client validation**: Format par provider (OpenAI sk-_, Claude sk-ant-_)
./docs/99_ARCHIVE/guides/README_v19.5.2_OLD.md:123:export OPENAI_API_KEY="sk-..."
./docs/99_ARCHIVE/guides/README_v19.5.2_OLD.md:124:export ANTHROPIC_API_KEY="sk-ant-..."
./docs/99_ARCHIVE/guides/README_v19.5.2_OLD.md:125:export GOOGLE_API_KEY="AIza..."
./docs/99_ARCHIVE/guides/README_v19.5.2_OLD.md:603:- **Configuration** : Créer `.env` avec `VITE_GEMINI_API_KEY=votre_clé`
./docs/RESPONSIVE_OPTIMIZATION_PLAN_v25.md:317:  mask-image: linear-gradient(
./docs/SECURITY_FIX_SESSION_REPORT.md:150:const API_KEY = "sk-1234567890abcdef";
./docs/SECURITY_FIX_SESSION_REPORT.md:153:const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
./docs/SECURITY_FIX_SESSION_REPORT.md:156:const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
./docs/SECURITY_FIX_SESSION_REPORT.md:157:if (!API_KEY) {
./docs/SECURITY_FIX_SESSION_REPORT.md:158:  throw new Error("VITE_OPENAI_API_KEY environment variable is required");
./scripts/ci/check-promotion-stable.sh:226:        "sk-[A-Za-z0-9]+"   # OpenAI style
./docs/backup_20251218_122540/CODE_STYLE.md:82:export const MAX_TOKENS = 4096;
./src/features/governance-center/services/governanceService.ts:103:// SECRETS
./docs/COPILOT_SETUP.md:235:COPILOT_XS_SECRET_SCAN=0 pnpm run copilot-xs:validate
./docs/COPILOT_SETUP.md:238:COPILOT_XS_SECRET_SCAN_IN_TESTS=1 pnpm run copilot-xs:validate
./docs/COPILOT_SETUP.md:241:COPILOT_XS_SECRET_MIN_CHARS=64 pnpm run copilot-xs:validate
./docs/COPILOT_SETUP.md:244:COPILOT_XS_SECRET_ALLOW_REGEX='example|dummy' pnpm run copilot-xs:validate
./docs/AUTH_MIGRATION_PLAN.md:1:# 🔐 TITANE∞ AUTH & DEV TOKEN OS — PLAN DE MIGRATION
./docs/AUTH_MIGRATION_PLAN.md:152:| Gemini | ✅ `chat_set_gemini_key()` OK | ✅ `auth::api_keys::save_api_keys()` | **Wrapper existant** |
./docs/AUTH_MIGRATION_PLAN.md:153:| OpenAI | ✅ `chat_set_openai_key()` OK | ✅ `auth::api_keys::save_api_keys()` | **Wrapper existant** |
./docs/AUTH_MIGRATION_PLAN.md:154:| Anthropic | ✅ `chat_set_anthropic_key()` OK | ✅ `auth::api_keys::save_api_keys()` | **Wrapper existant** |
./docs/AUTH_MIGRATION_PLAN.md:165:| Structure | ⚠️ Non définie (kvstore?) | ✅ `{ dev_token, api_keys, roles, last_update }` | **Créer struct** |
./docs/AUTH_MIGRATION_PLAN.md:175:| API Keys | ✅ 6 commands (set/get x3) OK | ✅ `auth_save_api_keys`, `auth_get_api_keys` unified | **Wrapper** |
./docs/AUTH_MIGRATION_PLAN.md:202:  - [ ] Struct `Keystore` (dev_token, api_keys, roles, last_update)
./docs/AUTH_MIGRATION_PLAN.md:210:- [ ] **Module auth/api_keys.rs**
./docs/AUTH_MIGRATION_PLAN.md:211:  - [ ] `save_api_keys(ApiKeys)` → wrapper `secure_commands`
./docs/AUTH_MIGRATION_PLAN.md:212:  - [ ] `get_api_keys()` → wrapper `secure_commands`
./docs/AUTH_MIGRATION_PLAN.md:213:  - [ ] Validation formats (OpenAI: `sk-*`, Anthropic: `sk-ant-*`, Gemini: alphanum)
./docs/AUTH_MIGRATION_PLAN.md:222:  - [ ] `AuthStatusDto` (dev_mode_active, dev_token_present, has_owner_role, api_keys_configured, etc.)
./docs/AUTH_MIGRATION_PLAN.md:229:  - [ ] `auth_save_api_keys(keys: ApiKeysDto)` → Result<()>
./docs/AUTH_MIGRATION_PLAN.md:230:  - [ ] `auth_get_api_keys()` → Result<ApiKeysDto>
./docs/AUTH_MIGRATION_PLAN.md:232:  - [ ] `chat_set_gemini_key` → appeler `auth::api_keys::save_api_keys` en interne
./docs/AUTH_MIGRATION_PLAN.md:265:  - [ ] Afficher `authStatus.api_keys_configured` global
./docs/AUTH_MIGRATION_PLAN.md:286:  - [ ] Cargo test `auth::api_keys` (all pass)
./docs/AUTH_MIGRATION_PLAN.md:318:- `src-tauri/src/auth/api_keys.rs`
./docs/AUTH_MIGRATION_PLAN.md:359:   - Backend: `auth_save_api_keys()` → chiffre + sauvegarde keystore
./docs/AUTH_MIGRATION_PLAN.md:361:   - Statut: `api_keys_configured: true`
./src/features/governance-center/components/APIProviderCard.tsx:38:    placeholder: 'sk-...',
./src/features/governance-center/components/APIProviderCard.tsx:46:    placeholder: 'sk-ant-...',
./docs/SECURITY_FIX_ACTION_PLAN.md:99:**Issue:** 118 occurrences of "api_key", "password", "secret"
./docs/SECURITY_FIX_ACTION_PLAN.md:116:const API_KEY = "sk-1234567890abcdef";
./docs/SECURITY_FIX_ACTION_PLAN.md:119:const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
./docs/SECURITY_FIX_ACTION_PLAN.md:151:let api_key = Zeroizing::new(String::from("secret"));
./src/features/governance-center/hooks/useGovernance.ts:65:  // SECRETS
./src/features/governance-center/types.ts:53:// SECRETS
./src/features/governance-center/types.ts:70:export type SecretCategory = 'api_key' | 'token' | 'credential' | 'certificate' | 'other';
./src/features/governance-center/types.ts:106:export const KNOWN_SECRETS: {
./src/features/governance-center/types.ts:113:    key: 'gemini_api_key',
./src/features/governance-center/types.ts:115:    category: 'api_key',
./src/features/governance-center/types.ts:119:    key: 'openai_api_key',
./src/features/governance-center/types.ts:121:    category: 'api_key',
./src/features/governance-center/types.ts:125:    key: 'anthropic_api_key',
./src/features/governance-center/types.ts:127:    category: 'api_key',
./src/features/governance-center/types.ts:131:    key: 'copilot_api_key',
./src/features/governance-center/types.ts:133:    category: 'api_key',
./src/features/governance-center/types.ts:140:    category: 'api_key',
./docs/security/GITGUARDIAN.md:29:   - Name: `GITGUARDIAN_API_KEY`
./docs/security/GITGUARDIAN.md:53:export GITGUARDIAN_API_KEY="your-api-key-here"
./docs/security/GITGUARDIAN.md:133:- `GITGUARDIAN_API_KEY`: API key for authentication (required for CI/CD)
./docs/security/GITGUARDIAN.md:191:Check your GITGUARDIAN_API_KEY:
./docs/security/GITGUARDIAN_IMPLEMENTATION.md:133:| `GITGUARDIAN_API_KEY` | API authentication for CI/CD | (required for CI) |
./docs/security/GITGUARDIAN_IMPLEMENTATION.md:222:1. Add `GITGUARDIAN_API_KEY` to GitHub repository secrets
./docs/backup_20251218_122540/REFLEXION_APPROFONDIE_CORRECTIONS_v26.2_COMPLETE.md:296:    token: ${{ secrets.CODECOV_TOKEN }}  # ← AJOUTÉ
./scripts/launch/launch-titane-infinity.sh:10:export TITANE_SECRETS_PASSPHRASE="${TITANE_SECRETS_PASSPHRASE:-TitaneSecure2025}"
./docs/backend/BACKEND_MAP.md:365:- `auth_save_api_keys`, `auth_get_api_keys`, `auth_delete_api_key`
./docs/backend/BACKEND_MAP.md:557:  - `validate_api_key(key: &str) -> Result<()>` — Key format validation
./docs/backend/BACKEND_MAP.md:565:- **Passphrase:** `TITANE_SECRETS_PASSPHRASE` env variable (default: "default-dev-passphrase-change-in-production")
./docs/backend/BACKEND_MAP.md:567:  - `GEMINI_API_KEY`
./docs/backend/BACKEND_MAP.md:568:  - `OPENAI_API_KEY`
./docs/backend/BACKEND_MAP.md:569:  - `ANTHROPIC_API_KEY`
./docs/backend/BACKEND_MAP.md:570:  - `GITHUB_COPILOT_TOKEN`
./docs/backend/BACKEND_MAP.md:572:- **UI Masking:** Frontend displays keys as `sk-***...last4chars`
./src/features/governance-center/tabs/SecretsTab.tsx:6: *   ONGLET SECRETS — Gestion sécurisée des clés API
./src/features/governance-center/tabs/SecretsTab.tsx:14:import { KNOWN_SECRETS as knownSecrets } from '../types';
./src/features/governance-center/tabs/SecretsTab.tsx:634:              .filter(s => s.key !== 'gemini_api_key')
./src/features/governance-center/tabs/SecretsTab.tsx:744:              placeholder="Clé (ex: my_api_key)"
./src/features/governance-center/tabs/SecretsTab.tsx:786:            Définir <code>TITANE_SECRETS_PASSPHRASE</code> dans l&apos;environnement avant
./docs/backup_20251218_122540/ANALYSE_CONTINUE_PERFECTION_v25.7.4_ULTIMATE.md:455:PERCY_TOKEN=xxx npx percy exec -- npx playwright test
./docs/backend/BACKEND_AUDIT_REPORT.md:675:**Documentation:** docs/guides/API_KEY_SETUP.md
./docs/backend/TEST_BASELINE.md:223:   - `ai/providers/openai.rs` — Skipped if `OPENAI_API_KEY` unset
./docs/backend/TEST_BASELINE.md:224:   - `ai/providers/claude.rs` — Skipped if `ANTHROPIC_API_KEY` unset
./docs/backend/TEST_BASELINE.md:225:   - `ai/providers/gemini.rs` — Skipped if `GEMINI_API_KEY` unset
./src/features/design-center/providers/UIThemeProvider.tsx:19:  DEFAULT_UI_THEME_TOKENS,
./src/features/design-center/providers/UIThemeProvider.tsx:30:  | { type: 'SET_TOKENS'; tokens: UIThemeTokens }
./src/features/design-center/providers/UIThemeProvider.tsx:35:  | { type: 'UPDATE_TOKEN'; category: keyof UIThemeTokens; key: string; value: unknown }
./src/features/design-center/providers/UIThemeProvider.tsx:51:    case 'SET_TOKENS':
./src/features/design-center/providers/UIThemeProvider.tsx:54:        tokens: action.tokens || DEFAULT_UI_THEME_TOKENS,
./src/features/design-center/providers/UIThemeProvider.tsx:66:    case 'UPDATE_TOKEN': {
./src/features/design-center/providers/UIThemeProvider.tsx:70:        logger.error('tokens est null dans UPDATE_TOKEN', {
./src/features/design-center/providers/UIThemeProvider.tsx:146:    tokens: DEFAULT_UI_THEME_TOKENS,
./src/features/design-center/providers/UIThemeProvider.tsx:166:        dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./src/features/design-center/providers/UIThemeProvider.tsx:168:        dispatch({ type: 'SET_TOKENS', tokens });
./src/features/design-center/providers/UIThemeProvider.tsx:176:      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./src/features/design-center/providers/UIThemeProvider.tsx:294:      dispatch({ type: 'UPDATE_TOKEN', category, key: String(key), value });
./src/features/design-center/providers/UIThemeProvider.tsx:354:        dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./src/features/design-center/providers/UIThemeProvider.tsx:356:        dispatch({ type: 'SET_TOKENS', tokens });
./src/features/design-center/providers/UIThemeProvider.tsx:366:      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./src/features/design-center/providers/UIThemeProvider.tsx:372:      dispatch({ type: 'SET_TOKENS', tokens: state.previousTokens });
./docs/backend/BACKEND_OPTIMIZATION_PLAN.md:292:      case 'prompt_api_key':
./docs/backend/IPC_CONTRACT.md:486:  key: string;                    // OpenAI API key (sk-...)
./docs/backend/IPC_CONTRACT.md:496:- `INVALID_INPUT`: Key format invalid (not starting with `sk-`, wrong length)
./docs/LOCALSTORAGE_AUDIT_v∞.md:101:Clés: STORAGE_KEY (audio), elevenlabs_api_key
./src/features/design-center/types/designCenter.types.ts:9:// TOKENS UI DYNAMIQUES
./src/features/design-center/types/designCenter.types.ts:337:export const DEFAULT_UI_THEME_TOKENS: UIThemeTokens = {
./src/features/design-center/types/designCenter.types.ts:431:    ...DEFAULT_UI_THEME_TOKENS,
./src/features/design-center/types/designCenter.types.ts:433:    colors: { ...DEFAULT_UI_THEME_TOKENS.colors, ...partial.colors },
./src/features/design-center/types/designCenter.types.ts:434:    typography: { ...DEFAULT_UI_THEME_TOKENS.typography, ...partial.typography },
./src/features/design-center/types/designCenter.types.ts:435:    spacing: { ...DEFAULT_UI_THEME_TOKENS.spacing, ...partial.spacing },
./src/features/design-center/types/designCenter.types.ts:436:    borders: { ...DEFAULT_UI_THEME_TOKENS.borders, ...partial.borders },
./src/features/design-center/types/designCenter.types.ts:437:    animations: { ...DEFAULT_UI_THEME_TOKENS.animations, ...partial.animations },
./src/features/design-center/types/designCenter.types.ts:438:    contrast: { ...DEFAULT_UI_THEME_TOKENS.contrast, ...partial.contrast },
./src/features/design-center/types/designCenter.types.ts:439:    shadows: { ...DEFAULT_UI_THEME_TOKENS.shadows, ...partial.shadows },
./scripts/gates/g8-provider-api-only.sh:50:if grep -q "OLLAMA\|OPENAI\|ANTHROPIC" src-tauri/src/ --include="*.rs" -r 2>/dev/null; then
./scripts/gates/g8-provider-api-only.sh:80:  ENV_COUNT=$(grep -c "PROVIDER\|API_KEY\|ENDPOINT" .env.example 2>/dev/null || true)
./docs/99_ARCHIVE/legacy_reports/PHASE1_STABILISATION_BANNER_v20.0.txt:49:   • AVANT: let api_key = api_key.unwrap();
./docs/99_ARCHIVE/legacy_reports/PHASE1_STABILISATION_BANNER_v20.0.txt:51:   • Impact: Plus de panic si GEMINI_API_KEY non définie
./scripts/gates/g5-ci-wiring.sh:96:TOKEN_MARKERS=(
./scripts/gates/g5-ci-wiring.sh:100:for token_marker in "${TOKEN_MARKERS[@]}"; do
./docs/P1_IMPLEMENTATION_REPORT_2026-01-07.md:308:let api_key = SecureSecret::new("sk-1234567890abcdef".to_string());
./docs/P1_IMPLEMENTATION_REPORT_2026-01-07.md:312:    let temp = api_key.expose_owned();
./docs/P1_IMPLEMENTATION_REPORT_2026-01-07.md:316:// api_key is zeroized when dropped
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:135:    let secrets_passphrase = std::env::var("TITANE_SECRETS_PASSPHRASE")
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:224:│ ├─ gemini_api_key (encrypted)                             │
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:225:│ ├─ openai_api_key (encrypted)                             │
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:226:│ └─ anthropic_api_key (encrypted)                          │
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:244:  Environment : TITANE_SECRETS_PASSPHRASE
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:317:  apiKey: 'sk-proj-...' 
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:323:  apiKey: 'sk-ant-...' 
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:378:   export TITANE_SECRETS_PASSPHRASE="your-strong-passphrase-here"
./docs/99_ARCHIVE/legacy_reports/FIX_API_COMMANDS_DEVTOOLS_v19.3.txt:426:   └─ TITANE_SECRETS_PASSPHRASE       → set or fallback
./docs/99_ARCHIVE/legacy_reports/MISSION_ACCOMPLISHED_v16.2.2.txt:25:     • pub gemini_api_key pour accès main.rs
./docs/99_ARCHIVE/legacy_reports/MISSION_ACCOMPLISHED_v16.2.2.txt:29:     • GEMINI_API_KEY auto-chargée
./docs/COMPLETE_FRONTEND_BACKEND_FUSION_AUDIT.md:444:1. **Hardcoded Secrets Check:** 118 occurrences of "api_key", "password", "secret"
./docs/OPTIMIZATION_ROADMAP_2026.md:165:VITE_OPENAI_API_KEY=sk-your-key-here
./docs/OPTIMIZATION_ROADMAP_2026.md:166:VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
./docs/OPTIMIZATION_ROADMAP_2026.md:167:VITE_GOOGLE_API_KEY=your-google-key-here
./docs/OPTIMIZATION_ROADMAP_2026.md:171:VITE_JWT_SECRET=your-jwt-secret-here
./docs/OPTIMIZATION_ROADMAP_2026.md:174:VITE_CLUSTER_AUTH_TOKEN=your-cluster-token
./docs/OPTIMIZATION_ROADMAP_2026.md:180:const API_KEY = "sk-1234567890abcdef";
./docs/OPTIMIZATION_ROADMAP_2026.md:183:const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
./docs/OPTIMIZATION_ROADMAP_2026.md:184:if (!API_KEY) {
./docs/OPTIMIZATION_ROADMAP_2026.md:185:  throw new Error("VITE_OPENAI_API_KEY environment variable is required");
./docs/OPTIMIZATION_ROADMAP_2026.md:619:          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
./docs/99_ARCHIVE/legacy_reports/STATUS_FINAL_v16.2.2_COMPLETE.txt:67:    ✓ API Key: Configurée .env (YOUR_GEMINI_API_KEY)
./docs/99_ARCHIVE/legacy_reports/STATUS_FINAL_v16.2.2_COMPLETE.txt:96:     Error:    GEMINI_API_KEY non chargée au démarrage
./docs/99_ARCHIVE/legacy_reports/STATUS_FINAL_v16.2.2_COMPLETE.txt:105:  4. ❌ → ✅ gemini_api_key Private
./docs/99_ARCHIVE/legacy_reports/STATUS_FINAL_v16.2.2_COMPLETE.txt:106:     Error:    field 'gemini_api_key' of struct is private
./docs/99_ARCHIVE/legacy_reports/STATUS_FINAL_v16.2.2_COMPLETE.txt:107:     Fix:      pub gemini_api_key ligne 68 chat_orchestrator.rs
./docs/99_ARCHIVE/legacy_reports/DEV_SUDO_v22.0_BANNER.txt:122: │  User: connect gemini        → 🔌 Config .env GEMINI_API_KEY              │
./docs/99_ARCHIVE/legacy_reports/DEV_SUDO_v22.0_BANNER.txt:123: │  User: verify keys           → 🔑 ✅ GEMINI_API_KEY présent               │
./scripts/init-copilot-xs.sh:82:- `COPILOT_XS_SECRET_SCAN` (`1` | `0`, default: `1`)
./scripts/init-copilot-xs.sh:83:- `COPILOT_XS_SECRET_SCAN_IN_TESTS` (`1` | `0`, default: `0`)
./scripts/init-copilot-xs.sh:84:- `COPILOT_XS_SECRET_MIN_CHARS` (default: `48`)
./scripts/init-copilot-xs.sh:85:- `COPILOT_XS_SECRET_ALLOW_REGEX` (regex string; matching lines are ignored)
./docs/ui-carto-copilot/55-nonconformities/55-nonconformities-register.md:195:**Proof:** Documented in `40-observability/45-prod-boot-risk-register.md`
./scripts/validate-apis-complete.sh:133:if [ -f "CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md" ] && \
./docs/99_ARCHIVE/legacy_reports/STATUS_AUDIT_MINUTIEUX_v16.2.2.txt:156:  2. Valider .env complet (GEMINI_API_KEY, OLLAMA_BASE_URL)
./scripts/setup-branch-protection.sh:69:if [ -n "$GITHUB_TOKEN" ]; then
./scripts/setup-branch-protection.sh:74:        -H "Authorization: token $GITHUB_TOKEN" \
./scripts/setup-branch-protection.sh:81:    echo "ℹ️  GitHub API method requires GITHUB_TOKEN environment variable"
./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:95:       api_key: String,
./scripts/registry/registry-lib.js:96:    /sk-[A-Za-z0-9]{20,}/,
./docs/99_ARCHIVE/audits/API_CONFIGURATION_COMPLETE_v24.2.0.md:48:→ Format: `sk-...`
./docs/99_ARCHIVE/audits/API_CONFIGURATION_COMPLETE_v24.2.0.md:53:→ Format: `sk-ant-...`
./docs/99_ARCHIVE/audits/API_CONFIGURATION_COMPLETE_v24.2.0.md:73:5. setOpenAIKey('sk-...')
./docs/99_ARCHIVE/audits/API_CONFIGURATION_COMPLETE_v24.2.0.md:74:6. setAnthropicKey('sk-ant-...')
./docs/99_ARCHIVE/audits/API_CONFIGURATION_COMPLETE_v24.2.0.md:236:chat_set_openai_key({ apiKey: 'sk-...' });
./docs/99_ARCHIVE/audits/API_CONFIGURATION_COMPLETE_v24.2.0.md:240:chat_set_anthropic_key({ apiKey: 'sk-ant-...' });
./src/features/audio-center/services/audioService.ts:112:          key: 'elevenlabs_api_key',
./src/features/audio-center/services/audioService.ts:126:      return Boolean(localStorage.getItem('elevenlabs_api_key'));
./docs/99_ARCHIVE/legacy_reports/RESUME_FINAL_v16.2.2.txt:16:2. ❌ → ✅ GEMINI_API_KEY non chargée
./docs/99_ARCHIVE/legacy_reports/RESUME_FINAL_v16.2.2.txt:22:4. ❌ → ✅ gemini_api_key private
./docs/99_ARCHIVE/legacy_reports/RESUME_FINAL_v16.2.2.txt:23:   Fix: pub gemini_api_key dans ChatOrchestratorState
./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:59:  ✅ Constantes KEY_GEMINI, KEY_OPENAI, KEY_CLAUDE
./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:391:│ zeroize_string(api_key) → secure buffer                 │
./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:403:│ orchestrator.gemini_api_key.write(Some(value))          │
./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:409:│ purge_env_key("GEMINI_API_KEY")                         │
./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:523:4. Create new key → Format: `sk-...`
./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:530:4. Create key → Format: `sk-ant-...`
./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:547:await window.__TAURI_INTERNALS__.invoke('chat_set_openai_key', { apiKey: 'sk-...' });
./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:549:  apiKey: 'sk-ant-...',
./src/features/audio-center/AudioCenterPage.tsx:591:                  placeholder="sk-..."
./docs/99_ARCHIVE/obsolete/CHANGELOG_v16.1_OVERDRIVE.md:137:chat_set_gemini_key(api_key)
./docs/99_ARCHIVE/obsolete/SUMMARY_v21-v23_EXECUTIVE.md:120:## 🎨 DESIGN TOKENS
./docs/99_ARCHIVE/audits/AUDIT_API_CHAT_COMPLET_v21_FINAL.md:108:│    • auth/api_keys.rs (Keystore chiffré)                            │
./docs/99_ARCHIVE/audits/AUDIT_API_CHAT_COMPLET_v21_FINAL.md:170:### 1. GEMINI API (Google)
./docs/99_ARCHIVE/audits/AUDIT_API_CHAT_COMPLET_v21_FINAL.md:207:  // GEMINI DÉSACTIVÉ
./docs/99_ARCHIVE/audits/AUDIT_API_CHAT_COMPLET_v21_FINAL.md:212:  // GEMINI DÉSACTIVÉ
./docs/99_ARCHIVE/audits/AUDIT_API_CHAT_COMPLET_v21_FINAL.md:241:### 2. OPENAI API (GPT)
./docs/99_ARCHIVE/audits/AUDIT_API_CHAT_COMPLET_v21_FINAL.md:295:### 3. ANTHROPIC API (Claude)
./docs/99_ARCHIVE/diagnostics/DIAGNOSTIC_CAUSE_RACINE_IDENTIFIEE.md:27:- ❌ `gemini_api_key`: **EMPTY**
./docs/99_ARCHIVE/diagnostics/DIAGNOSTIC_CAUSE_RACINE_IDENTIFIEE.md:28:- ❌ `openai_api_key`: **EMPTY**
./docs/99_ARCHIVE/diagnostics/DIAGNOSTIC_CAUSE_RACINE_IDENTIFIEE.md:29:- ❌ `anthropic_api_key`: **EMPTY**
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:13:- GEMINI_API_KEY: Non définie
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:14:- OPENAI_API_KEY: Non définie
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:15:- ANTHROPIC_API_KEY: Non définie
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:37:5. Copier la clé (format: `sk-...`)
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:45:5. Copier la clé (format: `sk-ant-...`)
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:92:  apiKey: 'sk-...', // Votre clé OpenAI
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:97:  apiKey: 'sk-ant-...', // Votre clé Anthropic
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:151:   GEMINI_API_KEY=AIza...votre_clé_ici
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:152:   GEMINI_MODEL=gemini-pro
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:154:   OPENAI_API_KEY=sk-...votre_clé_ici
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:156:   ANTHROPIC_API_KEY=sk-ant-...votre_clé_ici
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:227:await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'gemini_api_key' });
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:228:await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'openai_api_key' });
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:229:await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'anthropic_api_key' });
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:250:pub const KEY_GEMINI: &str = "gemini_api_key";
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:251:pub const KEY_OPENAI: &str = "openai_api_key";
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:252:pub const KEY_CLAUDE: &str = "anthropic_api_key";
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:261:- `chat_set_gemini_key(api_key)` → Enregistre et chiffre
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:263:- `chat_set_openai_key(api_key)` → Enregistre et chiffre
./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:265:- `chat_set_anthropic_key(api_key)` → Enregistre et chiffre
./docs/99_ARCHIVE/audits/AUDIT_FRONTEND_CHAT_IA_v24.2.0.md:50:  {/* GEMINI DÉSACTIVÉ */}
./docs/99_ARCHIVE/audits/AUDIT_FRONTEND_CHAT_IA_v24.2.0.md:271:2. `ChatIA.tsx` ligne 258: `{/* GEMINI DÉSACTIVÉ */}`
./docs/99_ARCHIVE/super-prompts/SUPER_PROMPT_17_API_HUB_DESIGN.md:77:│   ├── api_keys.rs                 # API key management
./docs/99_ARCHIVE/obsolete/RECONSTRUCTION_CHAT_v16.0.md:111:VITE_GEMINI_API_KEY=your_gemini_api_key_here
./docs/99_ARCHIVE/obsolete/RECONSTRUCTION_CHAT_v16.0.md:211:   echo "VITE_GEMINI_API_KEY=your_key" >> .env
./scripts/audit/01-security-audit.sh:69:SECRETS_COUNT=$(grep -c "http\|api\|token" "$REPORT_DIR/secrets-scan.txt" || echo "0")
./scripts/audit/01-security-audit.sh:70:echo "   └─ Potential secrets: $SECRETS_COUNT findings"
./scripts/audit/01-security-audit.sh:183:| Secrets Detected | - | $SECRETS_COUNT | - | $([ "$SECRETS_COUNT" -eq 0 ] && echo "✅" || echo "⚠️") |
./scripts/audit/01-security-audit.sh:198:$([ "$SECRETS_COUNT" -gt 5 ] && echo "- ⚠️ **$SECRETS_COUNT potential secrets** - Move to env vars" || echo "- ✅ Secrets properly managed")
./scripts/audit/01-security-audit.sh:240:echo "   ├─ Potential Secrets: $SECRETS_COUNT"
./docs/backup_20251218_122526/PLAN_CONTINUATION_v24.3.3.md:180:     it('should fallback to DEFAULT_UI_THEME_TOKENS', () => {
./scripts/deployment/deploy-fix-complete.sh:219:            echo "TITANE_SECRETS_PASSPHRASE=$PASSPHRASE" >> .env
./scripts/deployment/deploy-fix-complete.sh:220:            success "Generated TITANE_SECRETS_PASSPHRASE"
./scripts/deployment/deploy-fix-complete.sh:230:        if ! grep -q "TITANE_SECRETS_PASSPHRASE" .env; then
./scripts/deployment/deploy-fix-complete.sh:231:            warning "TITANE_SECRETS_PASSPHRASE missing in .env"
./scripts/deployment/deploy-fix-complete.sh:234:                echo "TITANE_SECRETS_PASSPHRASE=$PASSPHRASE" >> .env
./scripts/deployment/deploy-fix-complete.sh:235:                success "Added TITANE_SECRETS_PASSPHRASE to .env"
./scripts/deployment/tauri-full-deploy.sh:387:            echo "TITANE_SECRETS_PASSPHRASE=$PASSPHRASE" >> .env
./docs/99_ARCHIVE/obsolete/GUIDE_FIGMA_v15.5.md:3:## 📋 INSTRUCTIONS IMPORT TOKENS
./docs/backup_20251218_122526/CHANGELOG.md:1244:  - Storage directory + encryption password (TITANE_SECRETS_PASSPHRASE)
./docs/backup_20251218_122526/CHANGELOG.md:1328:- **Validation multi-format**: OpenAI (sk-_, 40+ chars), Claude (sk-ant-_, 50+ chars), Gemini (alphanumeric, 30+ chars)
./docs/backup_20251218_122526/CHANGELOG.md:1762:- Providers IA: 100% ✅ (GEMINI_API_KEY, OLLAMA_BASE_URL OK)
./docs/99_ARCHIVE/obsolete/ROADMAP_TODO_v15.5_to_v16.0.md:370:        .header("x-goog-api-key", &self.gemini_api_key)
./docs/99_ARCHIVE/rapports/SUPER_PROMPTS_STATUS.md:131:│   ├── api_keys.rs           # Gestion clés API
./src/stories/assets/discord.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177575)"><mask id="mask0_10031_177575" style="mask-type:luminance" width="33" height="25" x="0" y="4" maskUnits="userSpaceOnUse"><path fill="#fff" d="M32.5034 4.00195H0.503906V28.7758H32.5034V4.00195Z"/></mask><g mask="url(#mask0_10031_177575)"><path fill="#5865F2" d="M27.5928 6.20817C25.5533 5.27289 23.3662 4.58382 21.0794 4.18916C21.0378 4.18154 20.9962 4.20057 20.9747 4.23864C20.6935 4.73863 20.3819 5.3909 20.1637 5.90358C17.7042 5.53558 15.2573 5.53558 12.8481 5.90358C12.6299 5.37951 12.307 4.73863 12.0245 4.23864C12.003 4.20184 11.9614 4.18281 11.9198 4.18916C9.63431 4.58255 7.44721 5.27163 5.40641 6.20817C5.38874 6.21578 5.3736 6.22848 5.36355 6.24497C1.21508 12.439 0.078646 18.4809 0.636144 24.4478C0.638667 24.477 0.655064 24.5049 0.677768 24.5227C3.41481 26.5315 6.06609 27.7511 8.66815 28.5594C8.70979 28.5721 8.75392 28.5569 8.78042 28.5226C9.39594 27.6826 9.94461 26.7968 10.4151 25.8653C10.4428 25.8107 10.4163 25.746 10.3596 25.7244C9.48927 25.3945 8.66058 24.9922 7.86343 24.5354C7.80038 24.4986 7.79533 24.4084 7.85333 24.3653C8.02108 24.2397 8.18888 24.109 8.34906 23.977C8.37804 23.9529 8.41842 23.9478 8.45249 23.963C13.6894 26.3526 19.359 26.3526 24.5341 23.963C24.5682 23.9465 24.6086 23.9516 24.6388 23.9757C24.799 24.1077 24.9668 24.2397 25.1358 24.3653C25.1938 24.4084 25.19 24.4986 25.127 24.5354C24.3298 25.0011 23.5011 25.3945 22.6296 25.7232C22.5728 25.7447 22.5476 25.8107 22.5754 25.8653C23.0559 26.7955 23.6046 27.6812 24.2087 28.5213C24.234 28.5569 24.2794 28.5721 24.321 28.5594C26.9357 27.7511 29.5869 26.5315 32.324 24.5227C32.348 24.5049 32.3631 24.4783 32.3656 24.4491C33.0328 17.5506 31.2481 11.5584 27.6344 6.24623C27.6256 6.22848 27.6105 6.21578 27.5928 6.20817ZM11.1971 20.8146C9.62043 20.8146 8.32129 19.3679 8.32129 17.5913C8.32129 15.8146 9.59523 14.368 11.1971 14.368C12.8115 14.368 14.0981 15.8273 14.0729 17.5913C14.0729 19.3679 12.7989 20.8146 11.1971 20.8146ZM21.8299 20.8146C20.2533 20.8146 18.9541 19.3679 18.9541 17.5913C18.9541 15.8146 20.228 14.368 21.8299 14.368C23.4444 14.368 24.7309 15.8273 24.7057 17.5913C24.7057 19.3679 23.4444 20.8146 21.8299 20.8146Z"/></g></g><defs><clipPath id="clip0_10031_177575"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:1:# 🚫 API GEMINI DÉSACTIVÉE — Rapport v24.2.1
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:29:// GEMINI DÉSACTIVÉ - Ne pas utiliser
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:40:// GEMINI DÉSACTIVÉ
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:60:const geminiConfigured = false; // GEMINI DÉSACTIVÉ
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:67:  /* GEMINI DÉSACTIVÉ - Ne pas utiliser */
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:80:  /* GEMINI DÉSACTIVÉ */
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:126:    // GEMINI DÉSACTIVÉ
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:131:    // GEMINI DÉSACTIVÉ
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:138:    // GEMINI DÉSACTIVÉ - No-op
./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:285:Task: GEMINI-DEACTIVATION-v24.2.1
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:45:✅ chat_set_gemini_key(api_key, secrets, orchestrator)
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:47:✅ chat_set_openai_key(api_key, secrets, orchestrator)
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:49:✅ chat_set_anthropic_key(api_key, secrets, orchestrator)
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:160:✅ invalid_api_key (401) → "Clé API invalide"
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:189:Line 127: clearGeminiKey() → secureInvoke('cp_set_ai_config', {gemini_api_key: ''})
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:207:Line 121: CHAT_SET_GEMINI_KEY: 'chat_set_gemini_key' ✅
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:264:Line 135: PayloadValidator::validate_string(trimmed, "api_key", true)
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:267:Line 153: secrets.set_secret("gemini_api_key", new_value)
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:269:Line 165: purge_env_key("GEMINI_API_KEY")
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:288:const KEY_GEMINI: &str = "gemini_api_key"
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:289:const KEY_OPENAI: &str = "openai_api_key"
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:290:const KEY_CLAUDE: &str = "anthropic_api_key"
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:422:  secureInvoke('cp_set_ai_config', {config: {gemini_api_key: 'AIza...'}})
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:434:  secure_commands::chat_set_gemini_key(api_key, secrets, orchestrator)
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:438:  PayloadValidator::validate_string(api_key)
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:440:  zeroize_string(api_key) → protection mémoire
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:442:  secrets.set_secret("gemini_api_key", encrypted_value)
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:450:  orchestrator.gemini_api_key.write() → store in memory
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:454:  purge_env_key("GEMINI_API_KEY") → remove from .env
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:486:  secrets.has_secret("gemini_api_key")
./docs/99_ARCHIVE/rapports/API_DEEP_ANALYSIS_v24.2.0.md:488:  secrets.get_secret("gemini_api_key") → decrypt
./docs/backup_20251218_123316/PLAN_CONTINUATION_v24.3.3.md:180:     it('should fallback to DEFAULT_UI_THEME_TOKENS', () => {
./docs/99_ARCHIVE/rapports/SUPER_PROMPTS_COMPLETION_REPORT_v21.1.md:132:- ✅ **L3 Cache**: Disk-based (slow, largest)
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:76:   - OpenAI: sk-* (min 40 chars)
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:77:   - Claude: sk-ant-* (min 50 chars)
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:98:   - Placeholders contextuels: sk-proj-, sk-ant-, AIza...
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:312:2. Coller la clé: sk-proj-...
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:388:✅ chat_set_gemini_key(api_key: String) → SecureResponse<GeminiKeyStatus>
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:390:✅ chat_set_openai_key(api_key: String) → SecureResponse<GeminiKeyStatus>
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:392:✅ chat_set_anthropic_key(api_key: String) → SecureResponse<GeminiKeyStatus>
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:423:       // 1. Récupérer clé via secrets.get_secret("openai_api_key")
./docs/99_ARCHIVE/merged/TITANE_MULTI_PROVIDER_ENGINE_v19.3Ω_COMPLETE.md:439:       // 1. Récupérer clé via secrets.get_secret("anthropic_api_key")
./docs/99_ARCHIVE/merged/TODO_9_FUSION_COMPLETE_REPORT_v24.0.0.md:108:.omc-task-list { grid 5 columns (name, engine, priority, status, progress) }
./docs/99_ARCHIVE/merged/AUDIT_FINAL_PRE_DEPLOIEMENT_v19.2.md:33:- ✅ **API Key**: Configured `YOUR_GEMINI_API_KEY`
./docs/99_ARCHIVE/merged/AUDIT_FINAL_PRE_DEPLOIEMENT_v19.2.md:141:├── GEMINI_API_KEY=YOUR_GEMINI_API_KEY ✅
./docs/99_ARCHIVE/merged/AUDIT_FINAL_PRE_DEPLOIEMENT_v19.2.md:142:├── VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY ✅
./docs/99_ARCHIVE/merged/AUDIT_FINAL_PRE_DEPLOIEMENT_v19.2.md:273:🟢 GEMINI:           CONFIGURED (API key OK)
./docs/backup_20251218_122526/CODE_STYLE.md:82:export const MAX_TOKENS = 4096;
./LAUNCH_CHECKLIST_v27.2.0.md:4:**Authorization Status**: ✅ TOKENS VERIFIED  
./docs/99_ARCHIVE/merged/PHASE_5_COMPLETE_v18.0.md:158:        "Message reçu: \"{}\"\n\n🤖 **Mode Mock Backend**\nCeci est une réponse simulée du backend Rust. \n\nPour des réponses IA réelles:\n• Configure `VITE_GEMINI_API_KEY` dans `.env`\n• Ou lance Ollama: `ollama serve`\n\nArchitecture Chat IA v18 fonctionnelle ✅",
./docs/99_ARCHIVE/merged/PROJECT_GLOBAL_STATISTICS_v19.3.0_FINAL.md:335:1. set_api_key(provider, key) → Result<()>
./docs/99_ARCHIVE/merged/PROJECT_GLOBAL_STATISTICS_v19.3.0_FINAL.md:336:2. get_api_key(provider) → Result<String>
./docs/99_ARCHIVE/merged/PROJECT_GLOBAL_STATISTICS_v19.3.0_FINAL.md:337:3. delete_api_key(provider) → Result<()>
./docs/99_ARCHIVE/merged/PROJECT_GLOBAL_STATISTICS_v19.3.0_FINAL.md:339:5. test_api_key(provider, key) → Result<TestResult>
./docs/backup_20251218_123316/CHANGELOG.md:1244:  - Storage directory + encryption password (TITANE_SECRETS_PASSPHRASE)
./docs/backup_20251218_123316/CHANGELOG.md:1328:- **Validation multi-format**: OpenAI (sk-_, 40+ chars), Claude (sk-ant-_, 50+ chars), Gemini (alphanumeric, 30+ chars)
./docs/backup_20251218_123316/CHANGELOG.md:1762:- Providers IA: 100% ✅ (GEMINI_API_KEY, OLLAMA_BASE_URL OK)
./docs/backup_20251218_122526/REFLEXION_APPROFONDIE_CORRECTIONS_v26.2_COMPLETE.md:296:    token: ${{ secrets.CODECOV_TOKEN }}  # ← AJOUTÉ
./docs/backup_20251218_122526/ANALYSE_CONTINUE_PERFECTION_v25.7.4_ULTIMATE.md:455:PERCY_TOKEN=xxx npx percy exec -- npx playwright test
./docs/99_ARCHIVE/obsolete/CHANGELOG_v16.0.md:126:VITE_GEMINI_API_KEY=your_key_here
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:49:**Problème**: `ping_gemini_internal()` utilisait `GEMINI_API_KEY` depuis les variables d'environnement au lieu du SecureSecretsEngine chiffré.
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:55:    let has_key = std::env::var("GEMINI_API_KEY").is_ok();
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:61:    let api_key = if let Some(engine) = secrets {
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:62:        match engine.get_secret("gemini_api_key") {
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:64:            _ => std::env::var("GEMINI_API_KEY").ok()  // Fallback
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:67:        std::env::var("GEMINI_API_KEY").ok()
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:114:    pub api_key_configured: bool,
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:138:### 4. ✅ Documentation Complète: GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md
./docs/99_ARCHIVE/merged/PERFECTIONNEMENT_FINAL_REPORT_v∞.md:232:6. **GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md** (créé - 423 lignes)
./docs/99_ARCHIVE/obsolete/INTEGRATION_GUIDE_CHAT_IA_v12.md:53:GEMINI_API_KEY=votre_cle_api_gemini
./docs/99_ARCHIVE/obsolete/INTEGRATION_GUIDE_CHAT_IA_v12.md:338:### Erreur "GEMINI_API_KEY not found"
./docs/99_ARCHIVE/obsolete/INTEGRATION_GUIDE_CHAT_IA_v12.md:344:export GEMINI_API_KEY="votre_cle"
./docs/99_ARCHIVE/obsolete/AUDIT_360_RAPPORT_FINAL_v17.md:299:   if (onlineEnabled && GEMINI_API_KEY) {
./docs/backup_20251218_123316/CODE_STYLE.md:82:export const MAX_TOKENS = 4096;
./docs/99_ARCHIVE/merged/VALIDATION_FINALE_TEMPS_REEL_v16.2.2.md:56:GEMINI_API_KEY=YOUR_GEMINI_API_KEY ✅
./docs/99_ARCHIVE/merged/VALIDATION_FINALE_TEMPS_REEL_v16.2.2.md:157:GEMINI_API_KEY=YOUR_GEMINI_API_KEY ✅
./docs/99_ARCHIVE/merged/VALIDATION_FINALE_TEMPS_REEL_v16.2.2.md:164:GEMINI_API_KEY= ❌ (vide)
./docs/backup_20251218_122526/TRANSFORMATION_MASTER_GUIDE.md:21:11. [Risk Management](#11-risk-management)
./docs/backup_20251218_122526/VERIFICATION_APPROFONDIE_v26.0.md:134:        "password", "api_key", "secret", "credential"
./docs/backup_20251218_122526/VERIFICATION_APPROFONDIE_v26.0.md:303:## 🔒 SECRETS & CREDENTIALS AUDIT
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/APPROVAL_GATE_OUTPUT.txt:1:=== ÉTAPE B: APPROVAL GATE (WITHOUT TOKEN) ===
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/APPROVAL_GATE_OUTPUT.txt:8:[P8.1 APPROVAL GATE] ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/APPROVAL_GATE_OUTPUT.txt:9:[P8.1 APPROVAL GATE]    To proceed, provide token: export P8_APPROVAL_TOKEN=<token>
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/APPROVAL_GATE_OUTPUT.txt:19:=== WITH TEST APPROVAL TOKEN ===
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/APPROVAL_GATE_OUTPUT.txt:21:Command: P8_APPROVAL_TOKEN=<TOKEN> node scripts/ops/p8_approval_gate.mjs
./docs/99_ARCHIVE/merged/DEPLOYMENT_FINAL_v19.2_OMEGA.md:86:TITANE_SECRETS_PASSPHRASE (256-bit)
./docs/99_ARCHIVE/phases/PHASE1_STABILISATION_TRACKING.md:108:   - `commands/orchestration_center.rs` (1 critique: `api_key.unwrap()`)
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/EXECUTE_WRAPPER_OUTPUT.txt:58:   - Run: P8_APPROVAL_TOKEN=<token> node scripts/ops/p8_record_approval.mjs
./docs/99_ARCHIVE/obsolete/SYNTHESE_GLOBALE_v21-v∞.md:306:## 🎨 DESIGN TOKENS
./docs/99_ARCHIVE/merged/VERIFICATION_TTS_ASR_AUDIO_FINALE_v16.2.2+.md:288:        let cmd = ShellGuard::sanitize(&["vosk-cli", "--model", "vosk-model-fr"]);
./docs/99_ARCHIVE/merged/VERIFICATION_TTS_ASR_AUDIO_FINALE_v16.2.2+.md:633:        const ALLOWED_BINARIES: &[&str] = &["whisper", "vosk-cli", "ffmpeg"];
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/COMMANDS_RUN.txt:41:Command: P8_APPROVAL_TOKEN=550e8400-e29b-41d4-a716-446655440000 \
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/COMMANDS_RUN.txt:74:Command: P8_APPROVAL_TOKEN=550e8400-e29b-41d4-a716-446655440000 \
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/COMMANDS_RUN.txt:95:Command: P8_APPROVAL_TOKEN=550e8400-e29b-41d4-a716-446655440000 \
./docs/backup_20251218_123316/REFLEXION_APPROFONDIE_CORRECTIONS_v26.2_COMPLETE.md:296:    token: ${{ secrets.CODECOV_TOKEN }}  # ← AJOUTÉ
./deployment/latest/certification/phase8_2/P8_2_BETA_LAUNCH_20260217_230417/ENV.txt:36:P8_APPROVAL_TOKEN: SET (hash verified: a3a9e1ed)
./docs/99_ARCHIVE/merged/POLISSAGE_FINAL_RAPPORT_v15.1+.md:179:✅ GEMINI_API_KEY: Défini (template)
./docs/99_ARCHIVE/merged/POLISSAGE_FINAL_RAPPORT_v15.1+.md:180:✅ GEMINI_MODEL: gemini-pro
./docs/99_ARCHIVE/merged/POLISSAGE_FINAL_RAPPORT_v15.1+.md:181:✅ GEMINI_BASE_URL: Correct
./docs/99_ARCHIVE/merged/POLISSAGE_FINAL_RAPPORT_v15.1+.md:190:Backend: std::env::var("GEMINI_API_KEY") ✓
./docs/99_ARCHIVE/merged/POLISSAGE_FINAL_RAPPORT_v15.1+.md:281:✅ SCÉNARIO A: GEMINI 5 messages
./docs/99_ARCHIVE/merged/POLISSAGE_FINAL_RAPPORT_v15.1+.md:289:✅ SCÉNARIO C: GEMINI OFF → OLLAMA fallback
./docs/99_ARCHIVE/merged/POLISSAGE_FINAL_RAPPORT_v15.1+.md:293:✅ SCÉNARIO D: OLLAMA OFF → GEMINI fallback
./docs/backup_20251218_123316/ANALYSE_CONTINUE_PERFECTION_v25.7.4_ULTIMATE.md:455:PERCY_TOKEN=xxx npx percy exec -- npx playwright test
./docs/99_ARCHIVE/obsolete/UI_UX_CHANGELOG_v15.5.md:505:## 🎨 DESIGN TOKENS
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:21:  - Constantes API keys: `KEY_OPENAI`, `KEY_CLAUDE`, `KEY_GEMINI`
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:23:  - Validation regex: `sk-...` (OpenAI), `sk-ant-...` (Claude)
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:28:  - `set_api_key` - Configuration clé API (OpenAI/Claude/Gemini)
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:29:  - `delete_api_key` - Suppression clé
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:31:  - `test_api_key` - Test validité clé
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:131:if !key.starts_with("sk-") || key.len() < 40 {
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:136:if !key.starts_with("sk-ant-") || key.len() < 50 {
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:161:error!("OpenAI key: {}", api_key); // INTERDIT
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:214:await invoke('set_api_key', {
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:217:    key: 'sk-proj-...'
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:222:await invoke('set_api_key', {
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:225:    key: 'sk-ant-...'
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:261:const isValid = await invoke('test_api_key', {
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:333:- ✅ Masquage clés (`sk-...****`)
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:393:await invoke('set_api_key', {
./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:394:  request: { service: 'openai', key: 'sk-proj-...' }
./deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/01_EXPANSION_GO_NO_GO.md:156:- P8_APPROVAL_TOKEN required for formal execution (next étape B)
./deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/01_EXPANSION_GO_NO_GO.md:163:2. **Étape B (Immediate):** Execute approval gate (P8_APPROVAL_TOKEN required)
./deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/P8_4_PHASE1_CLOSURE.md:91:❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:145:    let api_key = state.gemini_api_key.read().await;
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:146:    let key = api_key.as_ref()
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:314:            state.gemini_api_key.read().await.is_some()
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:514:    return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10);
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:518:    if (!GEMINI_API_KEY) {
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:545:              GEMINI_API_URL,
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:557:                  'x-goog-api-key': GEMINI_API_KEY,
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:884:if let Ok(api_key) = std::env::var("GEMINI_API_KEY") {
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:885:    let mut key = chat_orchestrator_state.gemini_api_key.write().await;
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:886:    *key = Some(api_key);
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:922:  CHAT_SET_GEMINI_KEY: 'chat_set_gemini_key',
./docs/99_ARCHIVE/merged/VERIFICATION_CHAT_IA_API_FINALE_v16.2.2+.md:1104:│    │ GEMINI (gemini-2.0-flash-exp)                       │     │
./deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/COMMANDS_RUN.txt:36:  [P8.1 APPROVAL GATE] ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/COMMANDS_RUN.txt:74:When P8_APPROVAL_TOKEN is provided:
./deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/COMMANDS_RUN.txt:76:P8_APPROVAL_TOKEN="<token>" node scripts/ops/p8_approval_gate.mjs
./deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/COMMANDS_RUN.txt:79:P8_APPROVAL_TOKEN="<token>" node scripts/ops/p8_record_approval.mjs
./docs/99_ARCHIVE/merged/SECURITY_HARDENING_v19_COMPLETE.md:170:1. **Sanitization**: `sk-abc123...` → `[REDACTED]`
./docs/99_ARCHIVE/merged/SUPER_PROMPT_v14_RAPPORT_FINAL.md:112:        "gemini" => state.gemini_api_key.read().await.is_some(),
./docs/backup_20251218_122526/RESUME_EXECUTIF_v24.3.3.md:33:- Reducer fallback → `DEFAULT_UI_THEME_TOKENS`
./docs/99_ARCHIVE/obsolete/LOCAL_DEPLOYMENT_v16.1.md:39:   - Variable : `GEMINI_API_URL`
./docs/99_ARCHIVE/merged/API_CONFIGURATION_COMPLETE_REPORT.md:35:Key: openai_api_key
./docs/99_ARCHIVE/merged/API_CONFIGURATION_COMPLETE_REPORT.md:37:Category: api_key
./docs/99_ARCHIVE/merged/API_CONFIGURATION_COMPLETE_REPORT.md:59:Key: anthropic_api_key
./docs/99_ARCHIVE/merged/API_CONFIGURATION_COMPLETE_REPORT.md:61:Category: api_key
./docs/99_ARCHIVE/merged/API_CONFIGURATION_COMPLETE_REPORT.md:83:Key: gemini_api_key
./docs/99_ARCHIVE/merged/API_CONFIGURATION_COMPLETE_REPORT.md:85:Category: api_key
./docs/99_ARCHIVE/merged/API_CONFIGURATION_COMPLETE_REPORT.md:137:Category: api_key
./docs/99_ARCHIVE/merged/API_CONFIGURATION_COMPLETE_REPORT.md:196:{knownSecrets.filter(s => s.key !== 'gemini_api_key').map((secret) => {
./docs/99_ARCHIVE/merged/SECURITY_HARDENING_P0_COMPLETE.md:179:- `vosk-transcriber` (ASR) — Ajouter si utilisé
./docs/backup_20251218_122526/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:50:1. **Reducer Fallback** : `DEFAULT_UI_THEME_TOKENS` utilisé si tokens null
./docs/backup_20251218_122526/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:88:- ✅ **Fallback gracieux** : DEFAULT_UI_THEME_TOKENS utilisé automatiquement
./docs/backup_20251218_122526/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:612:- ✅ Fallback DEFAULT_UI_THEME_TOKENS automatique
./docs/99_ARCHIVE/merged/PHASES_2-7_EXECUTION_COMPLETE.md:82:cat .env | grep GEMINI
./docs/99_ARCHIVE/merged/PHASES_2-7_EXECUTION_COMPLETE.md:85:echo "VITE_GEMINI_API_KEY=your_key_here" >> .env
./docs/99_ARCHIVE/obsolete/ARCHITECTURE_CHAT_v16.0.txt:166:│   │ PROVIDER 1: GEMINI API                     │                   │
./docs/99_ARCHIVE/obsolete/ARCHITECTURE_CHAT_v16.0.txt:168:│   │ isAvailable() → Check VITE_GEMINI_API_KEY  │                   │
./src/ui/pages/ControlPanel/sections/AISection.tsx:12:  gemini_api_key: string;
./src/ui/pages/ControlPanel/sections/AISection.tsx:18:const GEMINI_KEY_SENTINEL = '***MASKED***';
./src/ui/pages/ControlPanel/sections/AISection.tsx:22:  gemini_api_key: '',
./src/ui/pages/ControlPanel/sections/AISection.tsx:36:    Omit<AIConfig, 'gemini_api_key'>
./src/ui/pages/ControlPanel/sections/AISection.tsx:66:      const masked = aiConfig.gemini_api_key === GEMINI_KEY_SENTINEL;
./src/ui/pages/ControlPanel/sections/AISection.tsx:75:        gemini_api_key: '',
./src/ui/pages/ControlPanel/sections/AISection.tsx:153:      const trimmedKey = config.gemini_api_key.trim();
./src/ui/pages/ControlPanel/sections/AISection.tsx:155:        gemini_api_key:
./src/ui/pages/ControlPanel/sections/AISection.tsx:156:          trimmedKey.length > 0 ? trimmedKey : hasStoredKey ? GEMINI_KEY_SENTINEL : '',
./src/ui/pages/ControlPanel/sections/AISection.tsx:164:      setHasStoredKey(payload.gemini_api_key !== '');
./src/ui/pages/ControlPanel/sections/AISection.tsx:170:      setConfig(current => ({ ...current, gemini_api_key: '' }));
./src/ui/pages/ControlPanel/sections/AISection.tsx:188:          gemini_api_key: '',
./src/ui/pages/ControlPanel/sections/AISection.tsx:201:      setConfig(current => ({ ...current, gemini_api_key: '' }));
./src/ui/pages/ControlPanel/sections/AISection.tsx:231:    if (config.gemini_api_key.trim().length > 0) {
./src/ui/pages/ControlPanel/sections/AISection.tsx:245:    config.gemini_api_key,
./src/ui/pages/ControlPanel/sections/AISection.tsx:285:              value={config.gemini_api_key}
./src/ui/pages/ControlPanel/sections/AISection.tsx:286:              onChange={e => setConfig({ ...config, gemini_api_key: e.target.value })}
./docs/99_ARCHIVE/merged/CORRECTION_WHITELIST_FINALE_v∞.md:164:Clé: sk-proj-4oWlyTR7wTr01a1YM-4SYTvTkqboSiQj0bXWf0rq...
./docs/99_ARCHIVE/merged/CORRECTION_WHITELIST_FINALE_v∞.md:165:Format: sk-proj-...
./docs/99_ARCHIVE/merged/CORRECTION_WHITELIST_FINALE_v∞.md:171:Clé: sk-ant-api03-...
./docs/99_ARCHIVE/merged/CORRECTION_WHITELIST_FINALE_v∞.md:172:Format: sk-ant-api03-...
./docs/99_ARCHIVE/implementations/AI_PROVIDER_INTEGRATION_PHASE1_COMPLETE_v∞.md:154:  placeholder: 'sk-...';
./docs/99_ARCHIVE/implementations/AI_PROVIDER_INTEGRATION_PHASE1_COMPLETE_v∞.md:163:  placeholder: 'sk-ant-...';
./docs/99_ARCHIVE/implementations/AI_PROVIDER_INTEGRATION_PHASE1_COMPLETE_v∞.md:220:**Environment**: Purge automatique des variables (GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY)
./docs/99_ARCHIVE/implementations/ADAPTIVE_TIMEOUT_IMPLEMENTATION_R02.md:326:const TIMEOUT_OPENAI_QUICK: u64 = 8;   // OpenAI typically fastest
./docs/99_ARCHIVE/implementations/ADAPTIVE_TIMEOUT_IMPLEMENTATION_R02.md:328:const TIMEOUT_GEMINI_QUICK: u64 = 15;  // Gemini can be variable
./docs/backup_20251218_123316/TRANSFORMATION_MASTER_GUIDE.md:21:11. [Risk Management](#11-risk-management)
./src/ui/pages/SelfHealingDashboard.tsx:186:        className={`action-risk risk-${riskLevel > 6 ? 'high' : riskLevel > 3 ? 'medium' : 'low'}`}
./docs/backup_20251218_123316/VERIFICATION_APPROFONDIE_v26.0.md:134:        "password", "api_key", "secret", "credential"
./docs/backup_20251218_123316/VERIFICATION_APPROFONDIE_v26.0.md:303:## 🔒 SECRETS & CREDENTIALS AUDIT
./docs/99_ARCHIVE/implementations/MEMORY_INTEGRATION_R04_COMPLETE.md:530:- LTM: **Intact** (disk-persisted) ✅
./docs/99_ARCHIVE/obsolete/ARCHITECTURE_OFFLINE_FIRST_v16.1.md:58:  if (onlineEnabled && GEMINI_API_KEY) {
./src/ui/pages/styles/SelfHealingDashboard.css:525:.action-risk.risk-low {
./src/ui/pages/styles/SelfHealingDashboard.css:530:.action-risk.risk-medium {
./src/ui/pages/styles/SelfHealingDashboard.css:535:.action-risk.risk-high {
./src/ui/pages/Chat.tsx:1502:                        Voir .env pour VITE_GEMINI_API_KEY
./docs/backup_20251218_122526/COPILOT_SUPER_PROMPTS.md:757:4. Setup secrets (CODECOV_TOKEN, etc.)
./docs/99_ARCHIVE/merged/AUDIT_FINAL_v16.0.0.md:155:- ✅ .env: `GEMINI_MODEL=gemini-2.0-flash`
./docs/99_ARCHIVE/versions/v22/TEST_PLAN_DEV_SUDO_v22.0.md:49:23. connect gemini     → Doit afficher config .env GEMINI_API_KEY
./docs/99_ARCHIVE/versions/v22/TEST_PLAN_DEV_SUDO_v22.0.md:52:26. verify keys        → Doit checker GEMINI_API_KEY dans .env
./docs/99_ARCHIVE/versions/v22/TEST_PLAN_DEV_SUDO_v22.0.md:123:→ Expected: "🔑 VERIFY KEYS — ✅/❌ GEMINI_API_KEY"
./docs/99_ARCHIVE/versions/v22/DEV_SUDO_SUPER_PROMPTS_UNIFIED_v22.0.md:244:GEMINI_API_KEY=your_key_here
./docs/99_ARCHIVE/versions/v22/DEV_SUDO_SUPER_PROMPTS_UNIFIED_v22.0.md:256:  ✅ GEMINI_API_KEY
./docs/99_ARCHIVE/versions/v22/DEV_SUDO_SUPER_PROMPTS_UNIFIED_v22.0.md:257:  ❌ OPENAI_API_KEY (optionnel)
./docs/diagrams/sources/network_surface_online_first.mmd:3:    API -->|EXTERNAL| P1[Provider 1 (AUTH/TOKEN + timeout/retry/fallback)]
./docs/diagrams/sources/network_surface_online_first.mmd:4:    API -->|EXTERNAL| P2[Provider 2 (AUTH/TOKEN + timeout/retry/fallback)]
./docs/backup_20251218_122526/QUICK_START_v∞.3.md:46:### 1. 🌐 PROVIDERS IA (GEMINI, OPENAI, ANTHROPIC, OLLAMA)
./docs/backup_20251218_122526/PHASE_5_RESPONSIVE_OPTIMIZATION_COMPLETE_v26.md:197:    mask-image: linear-gradient(
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:179:│  │   ├─ Data leaking (API_KEY, TOKEN, SECRET)                   │
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:220:│  └─ gemini_api_key: Option<String> (runtime config)             │
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:330:"Voici votre API_KEY: sk-abc123..." → SANITIZE
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:621:GEMINI_API_KEY=your_api_key_here
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:622:GEMINI_MODEL=gemini-pro
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:623:GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:643:VITE_GEMINI_API_KEY    // Frontend direct call (optionnel)
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:654:await tauriClient.chatSetGeminiKey('sk-abc123...');
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:659:    api_key: String,
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:662:    let mut key = state.gemini_api_key.write().await;
./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:663:    *key = Some(api_key);
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:37:### 1️⃣ Reducer - Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:43:case 'SET_TOKENS':
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:47:case 'SET_TOKENS':
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:50:    tokens: action.tokens || DEFAULT_UI_THEME_TOKENS,
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:69:      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:71:      dispatch({ type: 'SET_TOKENS', tokens });
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:78:    dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:100:### 4️⃣ UPDATE_TOKEN & UPDATE_CATEGORY - Guards dans le reducer
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:103:case 'UPDATE_TOKEN': {
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:108:    console.error('[UIThemeReducer] tokens est null dans UPDATE_TOKEN');
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:172:      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:174:      dispatch({ type: 'SET_TOKENS', tokens });
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:180:    dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:210:1. **Backend indisponible** → ✅ Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:211:2. **Backend retourne null** → ✅ Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_122526/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:263:4. **Fallback systématique** → DEFAULT_UI_THEME_TOKENS toujours disponible
./docs/backup_20251218_123316/RESUME_EXECUTIF_v24.3.3.md:33:- Reducer fallback → `DEFAULT_UI_THEME_TOKENS`
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:81:set_api_key(request)           // Définir clé
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:82:delete_api_key(service)        // Supprimer clé
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:84:test_api_key(service)          // Tester clé
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:215:await invoke('set_api_key', {
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:216:  request: { service: 'openai', key: 'sk-proj-...' }
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:220:await invoke('test_api_key', { service: 'openai' });
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:239:5. **Masquage clés** dans UI (`sk-proj-****`)
./docs/diagrams/rendered/network_surface_online_first.md:15:    API -->|EXTERNAL| P1[Provider 1 (AUTH/TOKEN + timeout/retry/fallback)]
./docs/diagrams/rendered/network_surface_online_first.md:16:    API -->|EXTERNAL| P2[Provider 2 (AUTH/TOKEN + timeout/retry/fallback)]
./docs/backup_20251218_122526/README_v19.5.2_OLD.md:42:- ✅ **Client validation**: Format par provider (OpenAI sk-_, Claude sk-ant-_)
./docs/backup_20251218_122526/README_v19.5.2_OLD.md:123:export OPENAI_API_KEY="sk-..."
./docs/backup_20251218_122526/README_v19.5.2_OLD.md:124:export ANTHROPIC_API_KEY="sk-ant-..."
./docs/backup_20251218_122526/README_v19.5.2_OLD.md:125:export GOOGLE_API_KEY="AIza..."
./docs/backup_20251218_122526/README_v19.5.2_OLD.md:603:- **Configuration** : Créer `.env` avec `VITE_GEMINI_API_KEY=votre_clé`
./docs/99_ARCHIVE/obsolete/RAPPORT_FINAL_v16.0.txt:109:   VITE_GEMINI_API_KEY=your_key_here         # Recommandé
./docs/99_ARCHIVE/obsolete/RAPPORT_FINAL_v16.0.txt:129:    echo "VITE_GEMINI_API_KEY=votre_clé" >> .env
./docs/backup_20251218_123316/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:50:1. **Reducer Fallback** : `DEFAULT_UI_THEME_TOKENS` utilisé si tokens null
./docs/backup_20251218_123316/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:88:- ✅ **Fallback gracieux** : DEFAULT_UI_THEME_TOKENS utilisé automatiquement
./docs/backup_20251218_123316/RAPPORT_OPTIMISATION_COMPLETE_v24.3.3.md:612:- ✅ Fallback DEFAULT_UI_THEME_TOKENS automatique
./docs/PROVIDER_CAPABILITY_MATRIX.md:12:| gemini | remote | internet | chat, streaming, vision (if enabled) | GEMINI_API_KEY required | optional |
./docs/PROVIDER_CAPABILITY_MATRIX.md:13:| openai | remote | internet | chat, streaming, vision (if enabled) | OPENAI_API_KEY required | optional |
./docs/PROVIDER_CAPABILITY_MATRIX.md:14:| claude | remote | internet | chat, streaming (if enabled) | ANTHROPIC_API_KEY required | optional |
./docs/99_ARCHIVE/merged/AUDIT_FINAL_COMPLET_v19.2_OMEGA.md:159:- ✅ Gemini : opérationnel si `GEMINI_API_KEY` fournie
./docs/99_ARCHIVE/merged/AUDIT_FINAL_COMPLET_v19.2_OMEGA.md:341:- ✅ `.env` : `GEMINI_API_KEY` vide par défaut
./docs/99_ARCHIVE/merged/AUDIT_FINAL_COMPLET_v19.2_OMEGA.md:496:2. ⚠️ Changer `TITANE_SECRETS_PASSPHRASE` avant production
./docs/99_ARCHIVE/merged/AUDIT_FINAL_COMPLET_v19.2_OMEGA.md:497:3. ⚠️ Fournir `GEMINI_API_KEY` si Gemini voulu en prod
./docs/99_ARCHIVE/merged/AUDIT_FINAL_COMPLET_v19.2_OMEGA.md:527:   TITANE_SECRETS_PASSPHRASE=<256-bit-random-hex>
./docs/99_ARCHIVE/merged/AUDIT_FINAL_COMPLET_v19.2_OMEGA.md:528:   GEMINI_API_KEY=<your-api-key>  # Si Gemini activé
./docs/DIAGNOSTIC_COMPLET_ARCHITECTURE_v17.3.0.md:100:│     → isAvailable: Boolean(VITE_GEMINI_API_KEY)            │
./docs/99_ARCHIVE/versions/v14/FRONTEND_BACKEND_COMMAND_MAPPING_v14.md:93:   pub async fn chat_set_gemini_key(state: State<'_, AIChatState>, api_key: String) -> Result<(), String>
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:12:- ✅ ChatOrchestratorState étendu (openai_api_key, anthropic_api_key)
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:40:   - Ajout openai_api_key, anthropic_api_key dans ChatOrchestratorState
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:86:9. **CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md** (1,200+ lignes)
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:89:10. **INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md** (ce fichier)
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:129:User entre clé "sk-abc123..." dans formulaire OpenAI
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:133:governance.setOpenAIKey("sk-abc123...")
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:135:invoke('chat_set_openai_key', { apiKey: "sk-abc123..." })
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:141:  - Update orchestrator.openai_api_key
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:142:  - Purge OPENAI_API_KEY from .env
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:173:     * Authorization: Bearer sk-abc123...
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:183:     * x-api-key: sk-ant-...
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:216:    let api_key = state.openai_api_key.read().await;
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:217:    let key = api_key.as_ref().ok_or_else(|| TAPIError::config("OpenAI API key not configured"))?;
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:295:    let api_key = state.anthropic_api_key.read().await;
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:296:    let key = api_key.as_ref().ok_or_else(|| TAPIError::config("Anthropic API key not configured"))?;
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:373:    api_key: String,
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:383:    let trimmed = api_key.trim();
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:393:    secrets.set_secret("openai_api_key", new_value.clone())?;
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:397:        let mut guard = orchestrator.openai_api_key.write().await;
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:403:    let env_purged = purge_env_key("OPENAI_API_KEY").await.is_ok();
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:522:1. Entrer clé API "sk-..."
./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:527:1. Entrer clé API "sk-ant-..."
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:215:## P4_PROD_BLOCKED_MISSING_TOKEN (LOCAL)
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:218:**Verdict:** ⚪ OUT_OF_SCOPE (BLOCKED_MISSING_TOKEN)  
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:230:**Verdict:** ⚪ OUT_OF_SCOPE (BLOCKED_MISSING_TOKEN)  
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:511:**Status**: 🔒 **READY FOR P4-1 PRODUCTION BUILD TOKEN**
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:839:### P8_5_BLOCKED_TOKEN_MISSING
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:842:**Verdict:** ❌ BLOCKED_TOKEN_MISSING  
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:849:**Notes:** P8_APPROVAL_TOKEN absent; approval gate exit 10; stop-the-line enforced; no distribution executed.
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:853:### P8_5_1_TOKEN_WAIT_STATE
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:856:**Verdict:** ⚪ STANDBY_ACTIVE_WAITING_TOKEN  
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:860:**Proof Pack:** deployment/latest/certification/phase8_5_1/P8_5_1_TOKEN_WAIT_20260217_234719/  
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:896:### P8_5_RESUME_BLOCKED_TOKEN_MISSING_20260218_004529
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:899:**Verdict:** ❌ BLOCKED_TOKEN_MISSING  
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:906:**Resume Path:** P8.5.1/RESUME_PROCEDURE.md (provide P8_APPROVAL_TOKEN and re-execute)  
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASE6_UI_COMPLETE_v∞.md:87:- **OpenAI** : `sk-` prefix, min 40 chars
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASE6_UI_COMPLETE_v∞.md:88:- **Claude** : `sk-ant-` prefix, min 50 chars
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASE6_UI_COMPLETE_v∞.md:186:await IAService.setAPIKey('openai', 'sk-proj-...');
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASE6_UI_COMPLETE_v∞.md:259:// Entrer : sk-proj-...
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASE6_UI_COMPLETE_v∞.md:289:const result2 = IAService.validateKeyFormat('openai', 'sk-proj-abcd1234...');
./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASE6_UI_COMPLETE_v∞.md:301:3. **Masquage des clés** (`sk-proj-****`)
./docs/99_ARCHIVE/merged/STATUS_FINAL_v∞.md:25:- ✅ `GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md` (423 lignes)
./docs/99_ARCHIVE/merged/STATUS_FINAL_v∞.md:46:chat_set_gemini_key(api_key: String) -> SecureResponse<GeminiKeyStatus>
./docs/99_ARCHIVE/merged/STATUS_FINAL_v∞.md:188:- `GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md`
./docs/99_ARCHIVE/merged/STATUS_FINAL_v∞.md:203:│   └── gemini_api_key (chiffré)
./docs/01_architecture/ARCHITECTURE_CURRENT_v24.md:214:│   ├── api_keys.rs            # Gestion clés API
./docs/01_architecture/ARCHITECTURE_CURRENT_v24.md:314:   ├─ Headers: { Authorization: "Bearer sk-..." }
./docs/01_architecture/ARCHITECTURE_CURRENT_v24.md:546:- `auth_save_api_keys` (sauvegarde chiffrée)
./docs/01_architecture/DATA_FLOW_CHAT.md:221:    let api_key = state.openai_api_key.read().await
./docs/01_architecture/DATA_FLOW_CHAT.md:229:        .header("Authorization", format!("Bearer {}", api_key))
./docs/backup_20251218_122526/PLAN_OPTIMISATION_RESPONSIVE_v25.7.4_ULTIMATE.md:129:   RESPONSIVE DESIGN TOKENS — TITANE∞ v25.7.4
./docs/backup_20251218_123316/COPILOT_SUPER_PROMPTS.md:757:4. Setup secrets (CODECOV_TOKEN, etc.)
./docs/SESSION_SUMMARY_PRACTICAL_TOOLS_2026-01-07.md:155:- Task-by-task instructions
./docs/99_ARCHIVE/versions/v19/CERTIFICATION_CHAT_IA_v19.4.0_FINAL.md:343:  "gemini_api_key": "",
./docs/99_ARCHIVE/versions/v19/CERTIFICATION_CHAT_IA_v19.4.0_FINAL.md:344:  "openai_api_key": "",
./docs/99_ARCHIVE/versions/v19/CERTIFICATION_CHAT_IA_v19.4.0_FINAL.md:345:  "anthropic_api_key": ""
./docs/99_ARCHIVE/versions/v19/CERTIFICATION_CHAT_IA_v19.4.0_FINAL.md:369:# Ajouter: "gemini_api_key": "AIzaSy..."
./docs/99_ARCHIVE/versions/v19/CERTIFICATION_CHAT_IA_v19.4.0_FINAL.md:383:# Ajouter: "openai_api_key": "sk-proj-..."
./docs/99_ARCHIVE/versions/v19/CERTIFICATION_CHAT_IA_v19.4.0_FINAL.md:396:# Ajouter: "anthropic_api_key": "sk-ant-..."
./docs/99_ARCHIVE/obsolete/RAPPORT_FULL_AUTOFIX_v12.8.md:104:GEMINI_API_KEY=your_api_key_here
./docs/99_ARCHIVE/obsolete/RAPPORT_FULL_AUTOFIX_v12.8.md:105:GEMINI_MODEL=gemini-pro
./docs/99_ARCHIVE/obsolete/RAPPORT_FULL_AUTOFIX_v12.8.md:106:GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1
./docs/99_ARCHIVE/obsolete/RAPPORT_FULL_AUTOFIX_v12.8.md:117:- ⚠️ Remplacer `your_api_key_here` par vraie clé Gemini si API activée
./docs/99_ARCHIVE/obsolete/RAPPORT_FULL_AUTOFIX_v12.8.md:192:- 💡 Remplacer `your_api_key_here` dans `.env` par votre vraie clé
./docs/backup_20251218_123316/QUICK_START_v∞.3.md:46:### 1. 🌐 PROVIDERS IA (GEMINI, OPENAI, ANTHROPIC, OLLAMA)
./docs/backup_20251218_123316/PHASE_5_RESPONSIVE_OPTIMIZATION_COMPLETE_v26.md:197:    mask-image: linear-gradient(
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:37:### 1️⃣ Reducer - Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:43:case 'SET_TOKENS':
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:47:case 'SET_TOKENS':
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:50:    tokens: action.tokens || DEFAULT_UI_THEME_TOKENS,
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:69:      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:71:      dispatch({ type: 'SET_TOKENS', tokens });
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:78:    dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:100:### 4️⃣ UPDATE_TOKEN & UPDATE_CATEGORY - Guards dans le reducer
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:103:case 'UPDATE_TOKEN': {
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:108:    console.error('[UIThemeReducer] tokens est null dans UPDATE_TOKEN');
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:172:      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:174:      dispatch({ type: 'SET_TOKENS', tokens });
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:180:    dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:210:1. **Backend indisponible** → ✅ Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:211:2. **Backend retourne null** → ✅ Fallback sur DEFAULT_UI_THEME_TOKENS
./docs/backup_20251218_123316/BUGFIX_UI_THEME_PROVIDER_NULL_SAFETY.md:263:4. **Fallback systématique** → DEFAULT_UI_THEME_TOKENS toujours disponible
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:117:│  │  - Keys: openai_api_key, claude_api_key                │  │
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:203:### 3.1 GEMINI (DÉSACTIVÉ)
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:250:### 3.2 OPENAI (ACTIF)
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:285:    api_key: String,
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:376:### 3.3 ANTHROPIC CLAUDE (ACTIF)
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:410:    api_key: String,
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:616:        passphrase: TITANE_SECRETS_PASSPHRASE
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:639:- ✅ `openai_api_key`
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:640:- ✅ `claude_api_key`
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:641:- ⚪ `gemini_api_key` (désactivé mais structure présente)
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:1075:    // Require OPENAI_API_KEY_TEST in env
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:1246:    OPENAI_API_KEY_TEST: ${{ secrets.OPENAI_API_KEY_TEST }}
./docs/99_ARCHIVE/versions/v21/API_CHAT_AUDIT_COMPLETE_v21.md:1247:    ANTHROPIC_API_KEY_TEST: ${{ secrets.ANTHROPIC_API_KEY_TEST }}
./docs/backup_20251218_123316/README_v19.5.2_OLD.md:42:- ✅ **Client validation**: Format par provider (OpenAI sk-_, Claude sk-ant-_)
./docs/backup_20251218_123316/README_v19.5.2_OLD.md:123:export OPENAI_API_KEY="sk-..."
./docs/backup_20251218_123316/README_v19.5.2_OLD.md:124:export ANTHROPIC_API_KEY="sk-ant-..."
./docs/backup_20251218_123316/README_v19.5.2_OLD.md:125:export GOOGLE_API_KEY="AIza..."
./docs/backup_20251218_123316/README_v19.5.2_OLD.md:603:- **Configuration** : Créer `.env` avec `VITE_GEMINI_API_KEY=votre_clé`
./docs/99_ARCHIVE/versions/v21/AUDIT_INTEGRATION_API_CHAT_v21.5.md:144:// ✅ GEMINI COMMAND
./docs/99_ARCHIVE/versions/v21/AUDIT_INTEGRATION_API_CHAT_v21.5.md:162:    let has_key = state.gemini_api_key.read().await.is_some();
./docs/99_ARCHIVE/versions/v21/AUDIT_INTEGRATION_API_CHAT_v21.5.md:204:    let api_key = state.gemini_api_key.read().await;
./docs/99_ARCHIVE/versions/v21/AUDIT_INTEGRATION_API_CHAT_v21.5.md:205:    let key = api_key.as_ref()
./docs/99_ARCHIVE/versions/v21/AUDIT_INTEGRATION_API_CHAT_v21.5.md:348:          if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('401')) {
./docs/99_ARCHIVE/versions/v21/AUDIT_INTEGRATION_API_CHAT_v21.5.md:391:- ✅ **Error handling**: Messages typés (API_KEY_INVALID, RATE_LIMIT, etc.)
./docs/99_ARCHIVE/versions/v21/AUDIT_INTEGRATION_API_CHAT_v21.5.md:1097:      error: 'API_KEY_INVALID',
./docs/99_ARCHIVE/versions/v21/AUDIT_INTEGRATION_API_CHAT_v21.5.md:1282:**Observation**: `GEMINI_DEACTIVATION_v24.2.1.md` indique Gemini désactivé, mais code backend + frontend fonctionnel
./docs/99_ARCHIVE/versions/v19/ETAT_ACTUEL_v19.3.md:80:- OpenAI: `sk-proj-...`
./docs/99_ARCHIVE/versions/v19/ETAT_ACTUEL_v19.3.md:81:- Anthropic: `sk-ant-api03-...`
./docs/99_ARCHIVE/versions/v19/ETAT_ACTUEL_v19.3.md:145:Clé: sk-proj-4oWlyTR7wTr01a1YM-4SYTvTkqboSiQj0bXWf0rq...
./docs/99_ARCHIVE/versions/v19/ETAT_ACTUEL_v19.3.md:150:Clé: sk-ant-api03-...
./docs/99_ARCHIVE/versions/v20/PHASE1_RAPPORT_FINAL_v20.0.md:55:   - Avant: `let api_key = api_key.unwrap();`
./docs/99_ARCHIVE/versions/v20/PHASE1_RAPPORT_FINAL_v20.0.md:57:   - Impact: Plus de panic si `GEMINI_API_KEY` non définie
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE2_INTEGRATION_v19.0.md:58:- **Data leaking**: API keys (sk-..., AIza...), JWT tokens, password patterns
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE2_INTEGRATION_v19.0.md:209:const response = await httpClient.post(GEMINI_API_URL, { contents: [{ parts: [{ text: prompt }] }] });
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE2_INTEGRATION_v19.0.md:219:    const response = await httpClient.post(GEMINI_API_URL, { contents: [...] });
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE2_INTEGRATION_v19.0.md:407:// ['XSS detected in markdown: <script>alert(1)</script>', 'API key detected: sk-abc123...']
./src/services/ai/chatModes.config.ts:504:    capabilities: ['planning', 'task-creation', 'prioritization'],
./src/services/ai/chatModes.config.ts:824:    capabilities: ['strategic-analysis', 'decision-support', 'risk-assessment'],
./docs/ai/PROVIDERS_INVENTORY.md:129:│       ├─ KEY_OPENAI, KEY_CLAUDE, KEY_GEMINI                   │
./docs/ai/PROVIDERS_INVENTORY.md:197:│         SECRETS ENGINE (Encrypted Storage)                      │
./docs/ai/PROVIDERS_INVENTORY.md:213:│    ├─ KEY_OPENAI = "openai_api_key"                           │
./docs/ai/PROVIDERS_INVENTORY.md:214:│    ├─ KEY_CLAUDE = "claude_api_key"                           │
./docs/ai/PROVIDERS_INVENTORY.md:215:│    └─ KEY_GEMINI = "gemini_api_key"                           │
./docs/ai/PROVIDERS_INVENTORY.md:253:  - OpenAI: erreurs typées (invalid_api_key, rate_limit)
./docs/99_ARCHIVE/versions/v15/CHAT_IA_FIX_v15.1_RAPPORT_COMPLET.md:262:🔌 GEMINI
./docs/99_ARCHIVE/versions/v15/CHAT_IA_FIX_v15.1_RAPPORT_COMPLET.md:267:  • GEMINI_API_KEY=your_api_key_here
./docs/99_ARCHIVE/versions/v15/CHAT_IA_FIX_v15.1_RAPPORT_COMPLET.md:268:  • GEMINI_MODEL=gemini-pro
./docs/99_ARCHIVE/versions/v15/CHAT_IA_FIX_v15.1_RAPPORT_COMPLET.md:269:  • GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1
./docs/99_ARCHIVE/versions/v15/CHAT_IA_FIX_v15.1_RAPPORT_COMPLET.md:436:GEMINI_API_KEY=votre_clé_ici
./docs/99_ARCHIVE/versions/v15/CHAT_IA_FIX_v15.1_RAPPORT_COMPLET.md:446:Tauri: std::env::var("GEMINI_API_KEY")
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:272:pub const KEY_OPENAI: &str = "openai_api_key";
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:273:pub const KEY_CLAUDE: &str = "claude_api_key";
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:274:pub const KEY_GEMINI: &str = "gemini_api_key";
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:275:pub const KEY_COPILOT: &str = "copilot_api_key";  // ✨ Nouveau
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:281:            "openai" => KEY_OPENAI,
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:283:            "gemini" => KEY_GEMINI,
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:294:            "openai" => KEY_OPENAI,
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:296:            "gemini" => KEY_GEMINI,
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:466:    └─ onSetKey("sk-copilot-xxxxx")
./docs/ai/UNIFIED_PROVIDERS_ARCH.md:616:- [ ] `/docs/ai/SECRETS_STORAGE.md`
./src/services/ai/providers/gemini.ts:8: *   TITANE∞ v21 — GEMINI PROVIDER (✅ RÉACTIVÉ Phase 1)
./src/services/ai/providers/gemini.ts:24:export const GEMINI_MODELS = [
./src/services/ai/providers/gemini.ts:31:export type GeminiModel = (typeof GEMINI_MODELS)[number];
./src/services/ai/providers/gemini.ts:141:            if (errorMsg.includes('invalid_api_key') || errorMsg.includes('401')) {
./src/services/ai/providers/gemini.ts:235:      models: GEMINI_MODELS,
./docs/ai/PROVIDER_COPILOT.md:25:- ✅ Documentation `SECRETS_STORAGE.md` (20KB - sécurité complète)
./docs/ai/PROVIDER_COPILOT.md:157:    api_key: String,
./docs/ai/PROVIDER_COPILOT.md:161:    pub fn new(api_key: String) -> Result<Self, String> {
./docs/ai/PROVIDER_COPILOT.md:167:        Ok(Self { client, api_key })
./docs/ai/PROVIDER_COPILOT.md:182:            .header(header::AUTHORIZATION, format!("Bearer {}", self.api_key))
./docs/ai/PROVIDER_COPILOT.md:276:pub const KEY_COPILOT: &str = "copilot_api_key";
./docs/ai/PROVIDER_COPILOT.md:281:        "openai" => KEY_OPENAI,
./docs/ai/PROVIDER_COPILOT.md:283:        "gemini" => KEY_GEMINI,
./docs/ai/PROVIDER_COPILOT.md:354:    pub api_key: Arc<RwLock<Option<String>>>,
./docs/ai/PROVIDER_COPILOT.md:380:    let api_key = match state.api_key.read().await.clone() {
./docs/ai/PROVIDER_COPILOT.md:398:    let client = CopilotClient::new(api_key).map_err(|e| e.to_string())?;
./docs/ai/PROVIDER_COPILOT.md:457:    api_key: String,
./docs/ai/PROVIDER_COPILOT.md:465:    if api_key.trim().is_empty() || api_key.len() < 16 {
./docs/ai/PROVIDER_COPILOT.md:472:        .set_secret(KEY_COPILOT, &api_key)
./docs/ai/PROVIDER_COPILOT.md:476:    *state.api_key.write().await = Some(api_key.clone());
./docs/ai/PROVIDER_COPILOT.md:479:    let masked = if api_key.len() > 8 {
./docs/ai/PROVIDER_COPILOT.md:480:        format!("{}...{}", &api_key[..4], &api_key[api_key.len() - 4..])
./docs/ai/PROVIDER_COPILOT.md:525:    let api_key = match state.secrets_engine.get_secret(KEY_COPILOT) {
./docs/ai/PROVIDER_COPILOT.md:535:    let client = CopilotClient::new(api_key).map_err(|e| e.to_string())?;
./docs/ai/PROVIDER_COPILOT.md:563:            api_key: Arc::new(RwLock::new(None)),
./docs/ai/SECRETS_STORAGE.md:1:# SECRETS STORAGE — Gestion Sécurisée des Clés API
./docs/ai/SECRETS_STORAGE.md:113:│          SECRETS ENGINE (Encrypted Storage Layer)               │
./docs/ai/SECRETS_STORAGE.md:131:│    ├─ KEY_OPENAI = "openai_api_key"                           │
./docs/ai/SECRETS_STORAGE.md:132:│    ├─ KEY_CLAUDE = "claude_api_key"                           │
./docs/ai/SECRETS_STORAGE.md:133:│    ├─ KEY_GEMINI = "gemini_api_key"                           │
./docs/ai/SECRETS_STORAGE.md:134:│    └─ KEY_COPILOT = "copilot_api_key"                         │
./docs/ai/SECRETS_STORAGE.md:159:│  │   - Encrypted JSON: { "openai_api_key": "...", ... }    │ │
./docs/ai/SECRETS_STORAGE.md:180:    ├─ Input: "sk-openai-12345678..."
./docs/ai/SECRETS_STORAGE.md:199:    └─ secrets_engine.set_secret(KEY_OPENAI, key)
./docs/ai/SECRETS_STORAGE.md:205:    ├─ Insert: map.insert(KEY_OPENAI, key)
./docs/ai/SECRETS_STORAGE.md:229:    └─ { ok: true, data: { configured: true, masked_key: "sk-...78" } }
./docs/ai/SECRETS_STORAGE.md:261:    ├─ Check key exists: state.openai_api_key.read().await
./docs/ai/SECRETS_STORAGE.md:266:[secrets_engine.get_secret(KEY_OPENAI)]
./docs/ai/SECRETS_STORAGE.md:269:    ├─ Get: map.get(KEY_OPENAI)
./docs/ai/SECRETS_STORAGE.md:308:    ├─ Load key: secrets_engine.get_secret(KEY_OPENAI)
./docs/ai/SECRETS_STORAGE.md:418:export TITANE_SECRETS_PASSPHRASE="my-secure-passphrase-min-16-chars"
./docs/ai/SECRETS_STORAGE.md:446:export TITANE_MIGRATE_SECRETS=1
./docs/ai/SECRETS_STORAGE.md:483:pub const KEY_NEW_PROVIDER: &str = "new_provider_api_key";
./docs/ai/SECRETS_STORAGE.md:560:        engine.set_secret(KEY_OPENAI, "sk-openai-123").unwrap();
./docs/ai/SECRETS_STORAGE.md:561:        engine.set_secret(KEY_GEMINI, "AIza-gemini-456").unwrap();
./docs/ai/SECRETS_STORAGE.md:563:        assert_eq!(engine.get_secret(KEY_OPENAI).unwrap(), Some("sk-openai-123".to_string()));
./docs/ai/SECRETS_STORAGE.md:564:        assert_eq!(engine.get_secret(KEY_GEMINI).unwrap(), Some("AIza-gemini-456".to_string()));
./docs/ai/SECRETS_STORAGE.md:565:        assert_ne!(engine.get_secret(KEY_OPENAI).unwrap(), engine.get_secret(KEY_GEMINI).unwrap());
./docs/backup_20251218_123316/PLAN_OPTIMISATION_RESPONSIVE_v25.7.4_ULTIMATE.md:129:   RESPONSIVE DESIGN TOKENS — TITANE∞ v25.7.4
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:75:## 🔵 GEMINI - À CONFIGURER ⚠️
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:83:  "gemini_api_key": "VOTRE_CLE_ICI",
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:84:  "openai_api_key": "",
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:85:  "anthropic_api_key": ""
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:114:## 🔵 OPENAI - À CONFIGURER ⚠️
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:122:  "gemini_api_key": "",
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:123:  "openai_api_key": "sk-...",
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:124:  "anthropic_api_key": ""
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:153:## 🧠 ANTHROPIC - À CONFIGURER ⚠️
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:161:  "gemini_api_key": "",
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:162:  "openai_api_key": "",
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:163:  "anthropic_api_key": "sk-ant-..."
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:448:  "gemini_api_key": "AIza...",
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:449:  "openai_api_key": "sk-...",
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:450:  "anthropic_api_key": "sk-ant-..."
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:458:GEMINI_API_KEY=AIza...
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:459:OPENAI_API_KEY=sk-...
./docs/99_ARCHIVE/versions/v19/ACTIVATION_CHAT_IA_APIs_v19.3.0.md:460:ANTHROPIC_API_KEY=sk-ant-...
./docs/ai/IMPLEMENTATION_NEXT_STEPS.md:41:curl -H "Authorization: Bearer $GITHUB_TOKEN" \
./docs/ai/IMPLEMENTATION_NEXT_STEPS.md:46:curl -H "Authorization: Bearer $GITHUB_TOKEN" \
./docs/ai/IMPLEMENTATION_NEXT_STEPS.md:125:// Ajouter après KEY_GEMINI
./docs/ai/IMPLEMENTATION_NEXT_STEPS.md:126:pub const KEY_COPILOT: &str = "copilot_api_key";
./docs/ai/IMPLEMENTATION_NEXT_STEPS.md:156:    api_key: Arc::new(RwLock::new(None)),
./src/services/ai/providers/__tests__/openai.test.ts:6:import { openaiProvider, OPENAI_MODELS } from '../openai';
./src/services/ai/providers/__tests__/openai.test.ts:108:        error: 'invalid_api_key: clé invalide',
./src/services/ai/providers/__tests__/openai.test.ts:236:        models: OPENAI_MODELS,
./docs/ai/PROVIDERS_AUDIT_REPORT.md:262:✅ KEY_OPENAI: &str = "openai_api_key"
./docs/ai/PROVIDERS_AUDIT_REPORT.md:263:✅ KEY_GEMINI: &str = "gemini_api_key"
./docs/ai/PROVIDERS_AUDIT_REPORT.md:264:✅ KEY_COPILOT: &str = "copilot_api_key"
./docs/ai/PROVIDERS_AUDIT_REPORT.md:354:✅ OpenAI: sk-* format, min 40 chars
./docs/ai/PROVIDERS_AUDIT_REPORT.md:503:✅ SECRETS_STORAGE.md (20KB)
./src/services/ai/providers/__tests__/claude.test.ts:108:        error: 'invalid_api_key: clé invalide',
./docs/99_ARCHIVE/versions/v19/DEPLOIEMENT_v19.2_PRODUCTION.md:102:VITE_API_GEMINI_KEY=your_gemini_api_key_here
./docs/99_ARCHIVE/versions/v19/DEPLOIEMENT_v19.2_PRODUCTION.md:103:VITE_API_OPENAI_KEY=your_openai_api_key_here
./docs/99_ARCHIVE/versions/v19/DEPLOIEMENT_v19.2_PRODUCTION.md:107:VITE_RATE_LIMIT_TOKENS=100000
./docs/ai/CHAT_PROVIDER_ROUTING.md:442:├─ KEY_OPENAI
./docs/ai/CHAT_PROVIDER_ROUTING.md:443:└─ KEY_GEMINI
./src/services/ai/providers/claude.ts:6: *   TITANE∞ v19.3Ω — ANTHROPIC CLAUDE PROVIDER (SECURE BACKEND PROXY)
./src/services/ai/providers/claude.ts:71:      if (errorMsg.includes('invalid_api_key') || errorMsg.includes('401')) {
./docs/ai/GITHUB_COPILOT_API_RESEARCH.md:146:    "code": "invalid_api_key"
./docs/ai/GITHUB_COPILOT_API_RESEARCH.md:228:curl -H "Authorization: Bearer $GITHUB_TOKEN" \
./docs/ai/GITHUB_COPILOT_API_RESEARCH.md:237:  -H "Authorization: Bearer $GITHUB_TOKEN" \
./docs/ai/GITHUB_COPILOT_API_RESEARCH.md:251:  -H "Authorization: Bearer $GITHUB_TOKEN" \
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/01_LAUNCH_INTENT.md:22:Human approval required: YES (P8_APPROVAL_TOKEN)
./docs/AUDIT_COMPLET_2026-01-09.md:69:- Nullish coalescing pour MODEL_TOKEN_LIMITS
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:46:    pub gemini_api_key: Arc<RwLock<Option<String>>>,
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:47:    pub openai_api_key: Arc<RwLock<Option<String>>>,        // ← NOUVEAU
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:48:    pub anthropic_api_key: Arc<RwLock<Option<String>>>,     // ← NOUVEAU
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:59:        gemini_api_key: Arc::new(RwLock::new(None)),
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:60:        openai_api_key: Arc::new(RwLock::new(None)),        // ← NOUVEAU
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:61:        anthropic_api_key: Arc::new(RwLock::new(None)),     // ← NOUVEAU
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:107:    let api_key = state.openai_api_key.read().await;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:108:    let key = api_key
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:190:- **Header**: `Authorization: Bearer {api_key}`
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:207:    let api_key = state.anthropic_api_key.read().await;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:208:    let key = api_key
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:291:- **Header**: `x-api-key: {api_key}`, `anthropic-version: 2023-06-01`
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:308:    api_key: String,
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:317:    let trimmed = api_key.trim();
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:327:    secrets.set_secret("openai_api_key", new_value.clone())?;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:331:        let mut guard = orchestrator.openai_api_key.write().await;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:337:    let env_purged = purge_env_key("OPENAI_API_KEY").await.is_ok();
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:362:    let provider_enabled = orchestrator.openai_api_key.read().await.is_some();
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:363:    let configured = secrets.has_secret("openai_api_key").unwrap_or(false);
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:365:        .get_secret("openai_api_key")
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:374:        env_present: std::env::var("OPENAI_API_KEY").is_ok(),
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:386:    api_key: String,
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:395:    let trimmed = api_key.trim();
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:405:    secrets.set_secret("anthropic_api_key", new_value.clone())?;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:409:        let mut guard = orchestrator.anthropic_api_key.write().await;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:415:    let env_purged = purge_env_key("ANTHROPIC_API_KEY").await.is_ok();
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:440:    let provider_enabled = orchestrator.anthropic_api_key.read().await.is_some();
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:441:    let configured = secrets.has_secret("anthropic_api_key").unwrap_or(false);
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:443:        .get_secret("anthropic_api_key")
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:452:        env_present: std::env::var("ANTHROPIC_API_KEY").is_ok(),
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:539:            let api_key = state.openai_api_key.read().await;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:540:            api_key.is_some()
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:543:            let api_key = state.anthropic_api_key.read().await;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:544:            api_key.is_some()
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:547:            let api_key = state.gemini_api_key.read().await;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:548:            api_key.is_some()
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:816:   - **OpenAI**: Entrer clé `sk-...` → Sauvegarder
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:817:   - **Anthropic**: Entrer clé `sk-ant-...` → Sauvegarder
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:835:  apiKey: 'sk-YOUR_OPENAI_KEY'
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:842:  apiKey: 'sk-ant-YOUR_ANTHROPIC_KEY'
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:925:purge_env_key("OPENAI_API_KEY").await;
./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:926:purge_env_key("ANTHROPIC_API_KEY").await;
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/LOCK.md:11:- node scripts/ops/p8_rollback.mjs --target "week2_launch" --reason "TOKEN_MISSING"
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/APPROVAL_GATE_OUTPUT.txt:4:[P8.1 APPROVAL GATE] ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/APPROVAL_GATE_OUTPUT.txt:5:[P8.1 APPROVAL GATE]    To proceed, provide token: export P8_APPROVAL_TOKEN=<token>
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE3_UILOGGER_v19.0.md:60:  /sk-[a-zA-Z0-9]{48}/g,                    // OpenAI API keys
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE3_UILOGGER_v19.0.md:73:const input = "User sk-abc123... logged in with token eyJhbGc...";
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE3_UILOGGER_v19.0.md:309:const message = "API call with key sk-abc123xyz... failed";
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE3_UILOGGER_v19.0.md:318:- ✅ OpenAI API keys (`sk-...`)
./docs/99_ARCHIVE/versions/v19/SECURITY_PHASE3_UILOGGER_v19.0.md:626:- Pattern: `sk-abc123...` → `[REDACTED]`
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/RECORD_APPROVAL_OUTPUT.txt:1:NOT RUN: token missing (P8_APPROVAL_TOKEN absent). Stop-the-line.
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/EXECUTE_WRAPPER_OUTPUT.txt:1:NOT RUN: token missing (P8_APPROVAL_TOKEN absent). Stop-the-line.
./docs/maintenance/QUALITY_ASSURANCE_PROTOCOL.md:238:./scripts/qa/scan-secrets.sh --quick || echo "   ❌ SECRETS DETECTED"
./docs/maintenance/QUALITY_ASSURANCE_PROTOCOL.md:331:echo "🔐 SCANNING FOR SECRETS"
./docs/maintenance/QUALITY_ASSURANCE_PROTOCOL.md:336:    "^(sk-|pk_live_|pk_test_)"  # API keys
./docs/maintenance/QUALITY_ASSURANCE_PROTOCOL.md:343:SECRETS_FOUND=0
./docs/maintenance/QUALITY_ASSURANCE_PROTOCOL.md:347:        SECRETS_FOUND=$((SECRETS_FOUND+1))
./docs/maintenance/QUALITY_ASSURANCE_PROTOCOL.md:351:if [ $SECRETS_FOUND -eq 0 ]; then
./docs/maintenance/QUALITY_ASSURANCE_PROTOCOL.md:355:    echo "❌ Found $SECRETS_FOUND potential secrets!"
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/ENV.txt:8:Token status: P8_APPROVAL_TOKEN absent
./docs/99_ARCHIVE/versions/v19/VERIFICATION_COMPLETE_v19.5.2_OMEGA.md:68:let password = std::env::var("TITANE_SECRETS_PASSPHRASE")
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/PREFLIGHT_OUTPUT.txt:1:NOT RUN: token missing (P8_APPROVAL_TOKEN absent). Stop-the-line.
./docs/99_ARCHIVE/complete-reports/CHAT_PIPELINE_SELF_REPAIR_REPORT_v21.md:515:  key: 'sk-...', // Clé API OpenAI
./docs/99_ARCHIVE/complete-reports/CHAT_PIPELINE_SELF_REPAIR_REPORT_v21.md:544:  key: 'sk-ant-...', // Clé API Anthropic
./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:170:    pub api_key: String,
./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:258:      "api_key": "${MISTRAL_API_KEY}",
./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:275:MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:357:5. Copy the key (starts with `sk-`)
./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:458:        api_key:
./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:501:  -H "Authorization: Bearer $MISTRAL_API_KEY" \
./docs/maintenance/PROVIDER_ADDITION_WORKFLOW.md:511:MISTRAL_API_KEY=$MISTRAL_API_KEY cargo test --lib providers::mistral || exit 1
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/VERDICT.md:3:Verdict: BLOCKED_TOKEN_MISSING
./deployment/latest/certification/phase8_5/P8_5_WEEK2_LAUNCH_20260217_234047/VERDICT.md:7:- P8_APPROVAL_TOKEN absent
./src/services/ai/providers/openai.ts:6: *   TITANE∞ v19.3Ω — OPENAI PROVIDER (SECURE BACKEND PROXY)
./src/services/ai/providers/openai.ts:72:      if (errorMsg.includes('invalid_api_key') || errorMsg.includes('401')) {
./src/services/ai/providers/openai.ts:134:export const OPENAI_MODELS = [
./src/services/ai/providers/openai.ts:142:export type OpenAIModel = (typeof OPENAI_MODELS)[number];
./src/services/ai/providers/openai.ts:242:      models: OPENAI_MODELS,
./docs/maintenance/MAINTENANCE_SCHEDULE.md:17:6. [Task Prioritization Matrix](#task-prioritization-matrix)
./docs/99_ARCHIVE/versions/v19/DEPLOYMENT_GUIDE_v19.5.2_PRODUCTION.md:857:          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:50:| `src-tauri/src/auth/api_keys.rs`  | 85     | Save/get API keys (masqué ••••last4)                   | ✅     |
./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:73:| `auth_save_api_keys(keys)`       | `ApiKeysInput`   | `()`            | Sauvegarder API keys      |
./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:74:| `auth_get_api_keys()`            | -                | `ApiKeysOutput` | Récupérer keys (masquées) |
./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:75:| `auth_delete_api_key(provider)`  | `String`         | `()`            | Supprimer key             |
./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:175:- ✅ `src-tauri/src/secure_commands.rs` - Utilisé en interne par `auth::api_keys`
./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:200:cargo test auth::api_keys::tests::test_mask_key
./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:216:- 🔒 **No secrets in logs**: `grep -r "sk-" runtime/dev/logs/` → aucun match
./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:263:API keys:        auth::api_keys (save, get, mask, delete)
./src/services/ai/providers/tauriChat.ts:379:        safeInvokeTauri(TAURI_COMMANDS.CHAT_SET_GEMINI_KEY, { api_key: apiKey.trim() }),
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:41:    pub gemini_api_key: Arc<RwLock<Option<String>>>,      // ✅ Google Gemini 2.0
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:42:    pub openai_api_key: Arc<RwLock<Option<String>>>,      // ✅ OpenAI GPT-4o
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:43:    pub anthropic_api_key: Arc<RwLock<Option<String>>>,   // ✅ Claude 3.5 Sonnet
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:152:    api_key: String,
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:160:- **Purge**: Supprime GEMINI_API_KEY de .env
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:161:- **Update**: ChatOrchestratorState.gemini_api_key
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:176:- Storage key: "openai_api_key"
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:177:- Env var: OPENAI_API_KEY
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:181:- Storage key: "anthropic_api_key"
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:182:- Env var: ANTHROPIC_API_KEY
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:195:Exemple: `sk-1234567890abcdef` → `**ef`
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:417:await invoke('chat_set_gemini_key', { api_key: 'AIza...' });
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:420:secrets.set_secret("gemini_api_key", new_value.clone())?;
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:421:*orchestrator.gemini_api_key.write().await = Some(new_value);
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:666:3. Coller clé (format: `sk-...`)
./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:672:3. Coller clé (format: `sk-ant-...`)
./deployment/latest/certification/P11_PRODUCTION_READINESS_20260218T205943Z/P11_CHECKS.txt:15:titane-os@TITANE-OS:~/Documents/GitHub/TITANE_INFINITY$ grep -r "password\|api_key\|secret" src/ 2>/dev/null | grep -v "node_modules\|\.git" | wc -l | xargs echo "  Potential secrets found:"
./deployment/latest/certification/P11_PRODUCTION_READINESS_20260218T205943Z/P11_CHECKS.txt:16:
  Potential secrets found: 190
./docs/99_ARCHIVE/versions/v24/GUIDE_CONFIG_IA_v24.md:74:   - Copie la clé (format `YOUR_GEMINI_API_KEY`)
./docs/99_ARCHIVE/versions/v24/GUIDE_CONFIG_IA_v24.md:82:   VITE_GEMINI_API_KEY=ta_vraie_clé_ici
./docs/99_ARCHIVE/versions/v24/GUIDE_CONFIG_IA_v24.md:135:2. **Gemini** (si `VITE_GEMINI_API_KEY` configurée)
./docs/99_ARCHIVE/complete-reports/INTEGRATION_COMPLETE_FINAL_REPORT_v∞.3.md:28:### 1. ✅ INTÉGRATION PROVIDERS IA (GEMINI, OPENAI, ANTHROPIC, OLLAMA)
./docs/99_ARCHIVE/versions/v19/DEPLOYMENT_GUIDE_v19.2.md:278:GEMINI_API_KEY=your_api_key_here
./docs/99_ARCHIVE/versions/v19/DEPLOYMENT_GUIDE_v19.2.md:279:GEMINI_MODEL=gemini-2.0-flash-exp
./docs/SUPER_PROMPTS_6_7_8_CONSOLIDATION_PLAN.md:440:- Disk-based index (mmap)
./docs/99_ARCHIVE/versions/v19/RESUME_EXECUTIF_v19.3.md:18:# - OpenAI: sk-proj-...
./docs/99_ARCHIVE/versions/v19/RESUME_EXECUTIF_v19.3.md:19:# - Anthropic: sk-ant-api03-...
./src/services/ai/contextManager.ts:36:export const MODEL_TOKEN_LIMITS: Record<string, number> = {
./src/services/ai/contextManager.ts:159:  if (model in MODEL_TOKEN_LIMITS) {
./src/services/ai/contextManager.ts:160:    const limit = MODEL_TOKEN_LIMITS[model];
./src/services/ai/contextManager.ts:161:    return limit ?? MODEL_TOKEN_LIMITS.default ?? 8192;
./src/services/ai/contextManager.ts:165:  for (const [key, limit] of Object.entries(MODEL_TOKEN_LIMITS)) {
./src/services/ai/contextManager.ts:167:      return limit ?? MODEL_TOKEN_LIMITS.default;
./src/services/ai/contextManager.ts:173:  return MODEL_TOKEN_LIMITS.default ?? 8192;
./docs/99_ARCHIVE/complete-reports/CLOUD_PROVIDERS_INTEGRATION_v24.3.0.md:318:   ⚠️ OPENAI n'est pas configuré. Le système basculera automatiquement
./docs/99_ARCHIVE/complete-reports/CLOUD_PROVIDERS_INTEGRATION_v24.3.0.md:390:   ⚠️ OPENAI n'est pas configuré. Le système basculera...
./docs/99_ARCHIVE/versions/v19/BUILD_PRODUCTION_REPORT_v19.2.md:390:  - Data leaking: API_KEY, TOKEN, SECRET patterns
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:133:  "gemini_api_key": "",
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:134:  "openai_api_key": "",
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:135:  "anthropic_api_key": ""
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:205:   - Create new secret key (starts with `sk-...`)
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:226:   - Create API key (starts with `sk-ant-...`)
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:244:- ✅ Stored in `~/.config/titane-infinity/secrets.enc` (when `TITANE_SECRETS_PASSPHRASE` set)
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:257:export TITANE_SECRETS_PASSPHRASE="your-secure-passphrase-here"
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:308:4. Enter test OpenAI key: `sk-test1234567890ABCDEF` (16+ chars)
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:316:6. Repeat for Anthropic with key: `sk-ant-test1234567890ABCDEF`
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:552:export TITANE_SECRETS_PASSPHRASE="test-passphrase-123"
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:578:  -H "Authorization: Bearer sk-YOUR-KEY" \
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:655:1. ✅ Key format correct? (OpenAI: `sk-...`, Anthropic: `sk-ant-...`)
./docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md:658:4. ✅ `TITANE_SECRETS_PASSPHRASE` set before launch?
./docs/99_ARCHIVE/versions/v19/VALIDATION_SYSTEME_v19.1.0.md:143:echo "VITE_GEMINI_API_KEY=votre_clé_api" > .env
./docs/99_ARCHIVE/complete-reports/CHAT_IA_CRITICAL_VALIDATION_PROOF.md:268:│ 4. OPENAI (cloud) ☁️                                        │
./docs/99_ARCHIVE/complete-reports/CHAT_IA_CRITICAL_VALIDATION_PROOF.md:273:│ 5. GEMINI (cloud) 🌐                                        │
./docs/99_ARCHIVE/complete-reports/CHAT_IA_CRITICAL_VALIDATION_PROOF.md:277:│ 6. ANTHROPIC (cloud) 🧠                                     │
./docs/FINAL_SESSION_SUMMARY_2026-01-07.md:332:let api_key = SecureSecret::new("sk-1234567890abcdef".to_string());
./docs/FINAL_SESSION_SUMMARY_2026-01-07.md:336:    let temp = api_key.expose_owned();
./docs/FINAL_SESSION_SUMMARY_2026-01-07.md:340:// api_key is zeroized when dropped
./docs/GUIDE_PRATIQUE_COMPLET_v26.3.0.md:209:   - **OpenAI:** `sk-proj-...` (https://platform.openai.com)
./docs/GUIDE_PRATIQUE_COMPLET_v26.3.0.md:210:   - **Claude:** `sk-ant-...` (https://console.anthropic.com)
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:45:TITANE_SECRETS_PASSPHRASE="test-deployment-2025" \
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:226:export OPENAI_API_KEY="sk-..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:227:export ANTHROPIC_API_KEY="sk-ant-..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:228:export GOOGLE_API_KEY="AIza..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:365:- OpenAI: sk-...
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:366:- Anthropic: sk-ant-...
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:371:export OPENAI_API_KEY="sk-..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:372:export ANTHROPIC_API_KEY="sk-ant-..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:373:export GOOGLE_API_KEY="AIza..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:449:TITANE_SECRETS_PASSPHRASE="test-deployment-2025" \
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:465:export OPENAI_API_KEY="sk-..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:466:export ANTHROPIC_API_KEY="sk-ant-..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:467:export GOOGLE_API_KEY="AIza..."
./docs/99_ARCHIVE/versions/v19/SMOKE_TEST_REPORT_v19.5.2.md:470:export TITANE_SECRETS_PASSPHRASE="your-secure-passphrase"
./docs/BETA_APPROVAL_LOG.md:50:   P8_APPROVAL_TOKEN=<token> node scripts/ops/p8_record_approval.mjs
./docs/99_ARCHIVE/versions/v24/RESUME_IA_LOCALE_v24.md:62:1. Gemini API      ← Essaie si VITE_GEMINI_API_KEY configurée
./docs/99_ARCHIVE/versions/v24/RESUME_IA_LOCALE_v24.md:92:# Aucune VITE_GEMINI_API_KEY
./docs/99_ARCHIVE/versions/v24/RESUME_IA_LOCALE_v24.md:108:# VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/versions/v24/RESUME_IA_LOCALE_v24.md:230:VITE_GEMINI_API_KEY=ta_clé
./src/utils/tauriCommandMapper.ts:49:  // ═══ GEMINI APIs ═══
./src/utils/secureSecrets.ts:110:  const raw = await safeInvoke<unknown>('chat_set_openai_key', { api_key: apiKey });
./src/utils/secureSecrets.ts:134:  const raw = await safeInvoke<unknown>('chat_set_anthropic_key', { api_key: apiKey });
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:47:    pub gemini_api_key: Arc<RwLock<Option<String>>>,
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:262:        if state.gemini_api_key.read().await.is_some() {
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:306:    api_key: String,
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:317:5. ✅ **Synchronisation**: Update `orchestrator.gemini_api_key`
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:322:  apiKey: 'AIzaSyC_YOUR_API_KEY_HERE'
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:621:engine.store_secret("gemini_api_key", "AIzaSyC...")?;
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:624:let key = engine.retrieve_secret("gemini_api_key")?;
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:627:engine.delete_secret("gemini_api_key")?;
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:1038:- ✅ `GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md` complet
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:1239:- [x] `GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md`
./docs/99_ARCHIVE/versions/v19/AUDIT_COMPLET_CHAT_IA_GOUVERNANCE_v19.2.3+.md:1343:2. `GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md` — Services Google Cloud
./docs/99_ARCHIVE/versions/v24/DESIGN_SYSTEM_v24_QUICK_REF.md:23:## 📐 TOKENS PRINCIPAUX
./docs/99_ARCHIVE/versions/v24/IA_LOCALE_AUTONOME_v24.md:220:VITE_GEMINI_API_KEY=ta_clé_api
./docs/99_ARCHIVE/versions/v24/IA_LOCALE_AUTONOME_v24.md:271:# VITE_GEMINI_API_KEY configurée
./docs/MIGRATION_GUIDE_AI_CONSOLIDATION.md:695:    openai: { apiKey: process.env.OPENAI_API_KEY },
./docs/MIGRATION_GUIDE_AI_CONSOLIDATION.md:696:    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
./src/services/memory/persistentMemory.config.ts:451:export const MAX_CONTEXT_INJECTION_TOKENS = 2000;
./src/services/memory/memoryUtils.ts:29:  MAX_CONTEXT_INJECTION_TOKENS,
./src/services/memory/memoryUtils.ts:537:  const maxTokens = permissions.contextInjectionLimit || MAX_CONTEXT_INJECTION_TOKENS;
./docs/SECRETS.md:1:# TITANE∞ — SECRETS MANAGEMENT
./docs/SECRETS.md:4:**Status** : 🔒 SEALED (Production Certification P0_1_SECRETS)  
./docs/SECRETS.md:11:Procédure **ZÉRO SECRET VERSIONNÉ** pour certification PROD TITANE∞.  
./docs/SECRETS.md:35:- TITANE_SECRETS_PASSPHRASE (runtime encryption)
./docs/SECRETS.md:52:grep -r "OLD_SECRET" .env* 2>/dev/null || echo "Pas trouvé"
./docs/SECRETS.md:58:echo "NEW_API_KEY=nouveau_secret_ici" >> .env.local
./docs/SECRETS.md:67:export TITANE_SECRETS_PASSPHRASE="votre_passphrase_>=12_chars"
./docs/SECRETS.md:68:export GEMINI_API_KEY="votre_clé_gemini"
./docs/SECRETS.md:71:echo "TITANE_SECRETS_PASSPHRASE=passphrase_sécurisée" > .env.local
./docs/SECRETS.md:72:echo "GEMINI_API_KEY=clé_api_gemini" >> .env.local
./docs/SECRETS.md:89:  'git rm --cached --ignore-unmatch FICHIER_SECRET' \
./docs/SECRETS.md:131:TITANE_SECRETS_PASSPHRASE=minimum_12_caracteres_securises
./docs/SECRETS.md:132:GEMINI_API_KEY=votre_cle_google_gemini_api
./docs/SECRETS.md:133:OPENAI_API_KEY=sk-votre_cle_openai_optionnelle
./docs/SECRETS.md:134:CLAUDE_API_KEY=sk-ant-votre_cle_anthropic_optionnelle
./docs/SECRETS.md:144:# Résultat attendu: ✅ SECRET-SCAN: PASS - Aucun secret critique tracké
./src/services/ia/__tests__/ia.api.test.ts:20:      it('should accept valid OpenAI key starting with sk-', () => {
./src/services/ia/__tests__/ia.api.test.ts:21:        const result = IAService.validateKeyFormat('openai', 'sk-1234567890123456');
./src/services/ia/__tests__/ia.api.test.ts:26:      it('should accept valid OpenAI project key starting with sk-proj-', () => {
./src/services/ia/__tests__/ia.api.test.ts:27:        const result = IAService.validateKeyFormat('openai', 'sk-proj-1234567890123456');
./src/services/ia/__tests__/ia.api.test.ts:31:      it('should reject OpenAI key not starting with sk-', () => {
./src/services/ia/__tests__/ia.api.test.ts:34:        expect(result.error).toContain('sk-');
./src/services/ia/__tests__/ia.api.test.ts:39:      it('should accept valid Claude key starting with sk-ant-', () => {
./src/services/ia/__tests__/ia.api.test.ts:40:        const result = IAService.validateKeyFormat('claude', 'sk-ant-1234567890123456');
./src/services/ia/__tests__/ia.api.test.ts:44:      it('should reject Claude key not starting with sk-ant-', () => {
./src/services/ia/__tests__/ia.api.test.ts:45:        const result = IAService.validateKeyFormat('claude', 'sk-1234567890123456');
./src/services/ia/__tests__/ia.api.test.ts:47:        expect(result.error).toContain('sk-ant-');
./src/services/ia/__tests__/ia.api.test.ts:50:      it('should reject Claude key starting with just sk-', () => {
./src/services/ia/__tests__/ia.api.test.ts:51:        const result = IAService.validateKeyFormat('claude', 'sk-proj-1234567890123456');
./src/services/ia/__tests__/ia.api.test.ts:92:        const result = IAService.validateKeyFormat('openai', 'sk-short');
./src/services/ia/__tests__/ia.api.test.ts:98:        const longKey = 'sk-' + 'a'.repeat(520);
./src/services/ia/__tests__/ia.api.test.ts:114:          'sk-1234567890123456'
./src/services/ia/__tests__/ia.api.test.ts:124:      const masked = IAService.maskAPIKey('sk-ant-api123456789xyz');
./src/services/ia/__tests__/ia.api.test.ts:125:      expect(masked).toMatch(/^sk-\*+xyz$/);
./docs/99_ARCHIVE/versions/v16/CHANGELOG_v16.1.0.md:78:| `CHAT_SET_GEMINI_KEY` | `chat_set_gemini_key` | ✅ |
./src/services/ia/ia.types.ts:125:  masked: string; // Ex: "sk-proj-****"
./docs/99_ARCHIVE/versions/v16/ACTIONS_USER_TESTS_v16.2.2.md:161:1. Vérifier `.env` → `GEMINI_API_KEY` présente
./docs/99_ARCHIVE/versions/v16/ACTIONS_USER_TESTS_v16.2.2.md:199:### ✅ Optimal (GEMINI + OLLAMA)
./src/services/ia/ia.api.ts:42:      const result = await secureInvoke<CommandResult<string>>('set_api_key', {
./src/services/ia/ia.api.ts:68:      const result = await secureInvoke<CommandResult<string>>('delete_api_key', {
./src/services/ia/ia.api.ts:100:      const result = await secureInvoke<CommandResult<boolean>>('test_api_key', {
./src/services/ia/ia.api.ts:234:        // OpenAI: commence par "sk-" (clé secrète) ou "sk-proj-" (projet)
./src/services/ia/ia.api.ts:235:        if (!trimmed.startsWith('sk-')) {
./src/services/ia/ia.api.ts:238:            error: 'Clé OpenAI doit commencer par "sk-"',
./src/services/ia/ia.api.ts:244:        // Anthropic: commence par "sk-ant-"
./src/services/ia/ia.api.ts:245:        if (!trimmed.startsWith('sk-ant-')) {
./src/services/ia/ia.api.ts:248:            error: 'Clé Anthropic doit commencer par "sk-ant-"',
./docs/99_ARCHIVE/versions/v17/DEPLOYMENT_PRODUCTION_TAURI_v17.3.0.md:677:          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
./docs/99_ARCHIVE/versions/v17/BACKEND_HARDENING_v17.7.md:537:let gemini_client = gemini_api_key.map(|key| Arc::new(GeminiClient::new(key)));
./docs/99_ARCHIVE/versions/v16/ANALYSE_MODULES_APIs_v16.0.0.md:157:    api_key: String,
./docs/99_ARCHIVE/versions/v16/ANALYSE_MODULES_APIs_v16.0.0.md:162:const GEMINI_API_URL: &str =
./docs/99_ARCHIVE/versions/v16/ANALYSE_MODULES_APIs_v16.0.0.md:167:- `new(api_key: String)` - Constructor
./docs/99_ARCHIVE/versions/v17/DIAGNOSTIC_CHAT_IA_COMPLET_v17.3.0.md:20:   - Variable `VITE_GEMINI_API_KEY` vide dans `.env`
./docs/99_ARCHIVE/versions/v17/DIAGNOSTIC_CHAT_IA_COMPLET_v17.3.0.md:105:const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
./docs/99_ARCHIVE/versions/v17/DIAGNOSTIC_CHAT_IA_COMPLET_v17.3.0.md:106:const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
./docs/99_ARCHIVE/versions/v17/DIAGNOSTIC_CHAT_IA_COMPLET_v17.3.0.md:110:  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10);
./docs/99_ARCHIVE/versions/v17/DIAGNOSTIC_CHAT_IA_COMPLET_v17.3.0.md:213:cat .env | grep VITE_GEMINI_API_KEY
./docs/99_ARCHIVE/versions/v17/DIAGNOSTIC_CHAT_IA_COMPLET_v17.3.0.md:214:# Attendu: VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/versions/v17/DIAGNOSTIC_CHAT_IA_COMPLET_v17.3.0.md:391:   cat .env | grep VITE_GEMINI_API_KEY
./docs/99_ARCHIVE/versions/v16/CHAT_IA_REPAIR_SUCCESS_v16.2.2.md:29:  - Clé: `.env GEMINI_API_KEY` (valide)
./docs/99_ARCHIVE/versions/v16/DIAGNOSTIC_CHAT_IA_v16.2.2.md:143:   - Gemini: Clé API manquante/invalide (.env `VITE_GEMINI_API_KEY`)
./docs/99_ARCHIVE/versions/v16/DIAGNOSTIC_CHAT_IA_v16.2.2.md:181:// Vérifier .env contient: VITE_GEMINI_API_KEY=...
./docs/99_ARCHIVE/versions/v16/DIAGNOSTIC_CHAT_IA_v16.2.2.md:324:   - Vérifier .env `VITE_GEMINI_API_KEY` (doit être `GEMINI_API_KEY` backend?)
./docs/99_ARCHIVE/versions/v16/COMMIT_MESSAGE_v16.2.2_CHAT_FIX.md:14:- `pub gemini_api_key` dans ChatOrchestratorState pour accès depuis main
./docs/99_ARCHIVE/versions/v16/COMMIT_MESSAGE_v16.2.2_CHAT_FIX.md:17:**Problème** : GEMINI_API_KEY non chargée au démarrage
./docs/99_ARCHIVE/versions/v16/COMMIT_MESSAGE_v16.2.2_CHAT_FIX.md:21:- Chargement automatique GEMINI_API_KEY depuis .env
./docs/99_ARCHIVE/versions/v16/COMMIT_MESSAGE_v16.2.2_CHAT_FIX.md:91:  - Chargement GEMINI_API_KEY
./docs/99_ARCHIVE/versions/v16/COMMIT_MESSAGE_v16.2.2_CHAT_FIX.md:97:- Ligne 68 : `pub gemini_api_key` (au lieu de private)
./docs/99_ARCHIVE/versions/v16/COMMIT_MESSAGE_v16.2.2_CHAT_FIX.md:155:- ✅ API key : Configurée `.env GEMINI_API_KEY`
./docs/99_ARCHIVE/versions/v16/COMMIT_MESSAGE_v16.2.2_CHAT_FIX.md:275:- **Gemini API** : Optionnel (.env GEMINI_API_KEY)
./docs/99_ARCHIVE/versions/v16/COMMIT_MESSAGE_v16.2.2_CHAT_FIX.md:314:- [x] GEMINI_API_KEY chargée depuis .env
./src/core/commands/TAURI_COMMANDS.ts:129:  CHAT_SET_GEMINI_KEY: 'chat_set_gemini_key',
./docs/99_ARCHIVE/versions/v16/FIX_CHAT_IA_v16.1.0.md:154:| `CHAT_SET_GEMINI_KEY: 'chat_set_gemini_key'` | `#[tauri::command] pub async fn chat_set_gemini_key(...)` | ✅ |
./docs/99_ARCHIVE/versions/v16/FIX_CHAT_IA_v16.1.0.md:186:    // Headers: x-goog-api-key: <API_KEY>
./docs/99_ARCHIVE/versions/v16/AUDIT_TITANE_v16.2.2_RAPPORT_COMPLET.md:321:if let Ok(api_key) = std::env::var("GEMINI_API_KEY") {
./docs/99_ARCHIVE/versions/v16/AUDIT_TITANE_v16.2.2_RAPPORT_COMPLET.md:322:    let mut key = chat_orchestrator_state.gemini_api_key.write().await;
./docs/99_ARCHIVE/versions/v16/AUDIT_TITANE_v16.2.2_RAPPORT_COMPLET.md:323:    *key = Some(api_key);
./docs/99_ARCHIVE/versions/v17/DEPLOYMENT_CHECKLIST_v17.3.0.md:11:GITHUB_TOKEN                       # Automatique (fourni par GitHub Actions)
./docs/99_ARCHIVE/versions/v17/DEPLOYMENT_CHECKLIST_v17.3.0.md:178:→ Vérifier les permissions du `GITHUB_TOKEN`
./src/core/auth/authClient.ts:77:    const response = await safeInvoke<void>('auth_save_api_keys', { keys });
./src/core/auth/authClient.ts:87:    const response = await safeInvoke<ApiKeysOutput>('auth_get_api_keys');
./src/core/auth/authClient.ts:98:    const response = await safeInvoke<void>('auth_delete_api_key', { provider });
./docs/99_ARCHIVE/versions/v16/FIX_IA_WARNINGS_v16.0.0.md:50:- ✅ Mise à jour `.env`: `GEMINI_MODEL=gemini-2.0-flash`
./docs/99_ARCHIVE/versions/v16/FIX_IA_WARNINGS_v16.0.0.md:53:  const GEMINI_API_URL: &str =
./docs/99_ARCHIVE/versions/v16/FIX_IA_WARNINGS_v16.0.0.md:144:GEMINI_MODEL=gemini-pro                # ❌ Obsolète
./docs/99_ARCHIVE/versions/v16/FIX_IA_WARNINGS_v16.0.0.md:150:GEMINI_MODEL=gemini-2.0-flash          # ✅ Modèle actif
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_REPORT_v17.3.0.txt:274:  ✅ GITHUB_TOKEN                        (fourni par GitHub)
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_AUTH_OS_v1.0.md:35:- [x] api_keys.rs (save/get/mask/delete)
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_AUTH_OS_v1.0.md:46:- [x] auth_save_api_keys(keys) → ()
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_AUTH_OS_v1.0.md:47:- [x] auth_get_api_keys() → ApiKeysOutput
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_AUTH_OS_v1.0.md:48:- [x] auth_delete_api_key(provider) → ()
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_AUTH_OS_v1.0.md:154:auth::api_keys::save_keys(keys) → Ok(())
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_AUTH_OS_v1.0.md:222:   → auth_save_api_keys(keys)
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_AUTH_OS_v1.0.md:232:→ auth::api_keys::get_raw_key("openai")
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_COMPLETE_AUTH_OS_v1.0.md:269:   ├─ api_keys.rs (save/get/mask/delete)
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_v19.5.2_COMPLETE.txt:137:    ⏭️ OPENAI_API_KEY (fallback configured)
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_v19.5.2_COMPLETE.txt:138:    ⏭️ ANTHROPIC_API_KEY (fallback configured)
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_v19.5.2_COMPLETE.txt:139:    ⏭️ GEMINI_API_KEY (fallback configured)
./src/services/chat/tokenCounter.ts:53:// TOKEN ESTIMATION
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUDIT_COMPLET_APPROFONDI_v19.5.2.txt:234:  ⏭️ OPENAI_API_KEY (fallback configured)
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUDIT_COMPLET_APPROFONDI_v19.5.2.txt:235:  ⏭️ ANTHROPIC_API_KEY (fallback configured)
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUDIT_COMPLET_APPROFONDI_v19.5.2.txt:236:  ⏭️ GEMINI_API_KEY (fallback configured)
./docs/99_ARCHIVE/old_sessions/2025-12-10/PHASE_3_CHAT_IA_PIPELINE_v14_COMPLETE.txt:63:- ✅ `set_gemini_key(&mut self, api_key: Option<String>)`
./docs/P1.2_ALERTS_2026-01-07.md:405:      'DD-API-KEY': process.env.DATADOG_API_KEY
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUTH_OS_MIGRATION_SUCCESS.txt:41:   - api_keys.rs (save/get/mask API keys)
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUTH_OS_MIGRATION_SUCCESS.txt:51:   - auth_save_api_keys(keys) → ()
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUTH_OS_MIGRATION_SUCCESS.txt:52:   - auth_get_api_keys() → ApiKeysOutput (masqué ••••last4)
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUTH_OS_MIGRATION_SUCCESS.txt:53:   - auth_delete_api_key(provider) → ()
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUTH_OS_MIGRATION_SUCCESS.txt:122:│ API keys:     auth::api_keys (save, get, mask ••••last4, delete)           │
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUTH_OS_MIGRATION_SUCCESS.txt:137:2. ✅ DEV TOKEN VALIDATED
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUTH_OS_MIGRATION_SUCCESS.txt:185:   3. Click Save → auth_save_api_keys(keys)
./docs/99_ARCHIVE/old_sessions/2025-12-10/AUTH_OS_MIGRATION_SUCCESS.txt:192:   3. Fetch API key via auth::api_keys::get_raw_key(provider)
./src/core/context/LongContextOptimizer.ts:103:  private readonly DEFAULT_MAX_TOKENS = 8000;
./src/core/context/LongContextOptimizer.ts:136:      const maxTokens = options.maxTokens || this.DEFAULT_MAX_TOKENS;
./src/core/context/LongContextOptimizer.ts:485:      const maxTokens = options.maxTokens || this.DEFAULT_MAX_TOKENS;
./docs/99_ARCHIVE/old_sessions/2025-12-10/COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt:161:   [⏭] OPENAI_API_KEY not configured (Gemini/Ollama fallback)
./docs/99_ARCHIVE/old_sessions/2025-12-10/COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt:162:   [⏭] ANTHROPIC_API_KEY not configured (Gemini/Ollama fallback)
./docs/99_ARCHIVE/old_sessions/2025-12-10/COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt:163:   [⏭] GEMINI_API_KEY not configured (Ollama fallback)
./docs/BRANCH_CONSOLIDATION_IMPLEMENTATION.md:14:- ✅ Risk-assessed merge strategies for each branch
./docs/BRANCH_CONSOLIDATION_IMPLEMENTATION.md:145:          token: ${{ secrets.GITHUB_TOKEN }}
./src/modules/devSudo/devSudoExtendedHandlers.ts:498:GEMINI_API_KEY=<VOTRE_CLE_GEMINI>
./src/modules/devSudo/devSudoExtendedHandlers.ts:538:  ${process.env.GEMINI_API_KEY ? '✅' : '❌'} GEMINI_API_KEY
./src/modules/devSudo/devSudoExtendedHandlers.ts:539:  ${process.env.OPENAI_API_KEY ? '✅' : '❌'} OPENAI_API_KEY (optionnel)
./src/modules/devSudo/devSudoExtendedHandlers.ts:545:GEMINI_API_KEY=<VOTRE_CLE_GEMINI>
./src/modules/devSudo/devSudoBackendHandlers.ts:817:2) 🔒 SECRETS MANAGEMENT
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_COMPLETE_MEGA_BANNER_v20.0.txt:278:    ✅ orchestration_center.rs L144 (api_key.unwrap)
./docs/examples/providers.example.json:36:        "apiKey": "YOUR_GEMINI_API_KEY_HERE",
./docs/examples/providers.example.json:65:        "apiKey": "YOUR_ANTHROPIC_API_KEY_HERE",
./src/audit/chat-ia-audit.md:136:**GEMINI Provider Config:**
./docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md:1390:await invoke('chat_set_openai_key', { key: "sk-..." });
./docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md:1689:grep -r "api_key" src-tauri/src/
./docs/RAPPORT_FINAL_PHASES_1-2-3_v17.3.0.md:556:  VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/sessions/THEME_METAL_GUIDE_UTILISATION.md:14:## 🎨 UTILISATION DES TOKENS CSS
./docs/CERTIFICATION_STATUS_FINAL.md:40:- **L3 ZERO SECRETS**: ✅ Secrets sécurisés
./docs/99_ARCHIVE/sessions/RAPPORT_OMEGA_FINALISATION_v16.2.2_COMPLETE.md:142:GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/sessions/RAPPORT_OMEGA_FINALISATION_v16.2.2_COMPLETE.md:143:GEMINI_MODEL=gemini-2.0-flash
./docs/99_ARCHIVE/sessions/RAPPORT_OMEGA_FINALISATION_v16.2.2_COMPLETE.md:144:GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1
./docs/99_ARCHIVE/sessions/RAPPORT_OMEGA_FINALISATION_v16.2.2_COMPLETE.md:383:GEMINI_API_KEY=YOUR_GEMINI_API_KEY  # ✅ Configuré
./docs/99_ARCHIVE/sessions/RAPPORT_OMEGA_FINALISATION_v16.2.2_COMPLETE.md:403:GEMINI_API_KEY=  # ❌ Vide
./docs/99_ARCHIVE/sessions/RAPPORT_OMEGA_FINALISATION_v16.2.2_COMPLETE.md:422:GEMINI_API_KEY=  # ❌ Vide
./docs/04_guides/advanced/TROUBLESHOOTING.md:188:cat .env | grep API_KEY
./docs/04_guides/advanced/TROUBLESHOOTING.md:191:echo "OPENAI_API_KEY=sk-..." >> .env
./docs/04_guides/advanced/TROUBLESHOOTING.md:192:echo "ANTHROPIC_API_KEY=..." >> .env
./runtime/LOGGING_STANDARD.md:91:- API keys : `GEMINI_API_KEY`, `OPENAI_API_KEY`, etc.
./runtime/LOGGING_STANDARD.md:100:❌ DEBUG GEMINI_API_KEY=AIzaSyAbC123...
./runtime/LOGGING_STANDARD.md:101:✅ INFO GEMINI_API_KEY configured (32 chars)
./docs/04_guides/advanced/DEPLOYMENT.md:70:grep "API_KEY" .env.production
./docs/04_guides/advanced/DEPLOYMENT.md:108:OPENAI_API_KEY=sk-prod-xxx
./docs/04_guides/advanced/DEPLOYMENT.md:109:ANTHROPIC_API_KEY=sk-ant-prod-xxx
./docs/04_guides/advanced/DEPLOYMENT.md:110:MISTRAL_API_KEY=xxx
./docs/04_guides/advanced/DEPLOYMENT.md:315:        let openai_key = env::var("OPENAI_API_KEY")
./docs/04_guides/advanced/DEPLOYMENT.md:316:            .map_err(|_| "OPENAI_API_KEY not set")?;
./docs/04_guides/advanced/DEPLOYMENT.md:318:        let anthropic_key = env::var("ANTHROPIC_API_KEY")
./docs/04_guides/advanced/DEPLOYMENT.md:319:            .map_err(|_| "ANTHROPIC_API_KEY not set")?;
./docs/04_guides/advanced/DEPLOYMENT.md:322:        if !openai_key.starts_with("sk-") {
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_COMPLET_v17.3.0.md:65:❌ VITE_GEMINI_API_KEY absente → Gemini skippé
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_COMPLET_v17.3.0.md:144:VITE_GEMINI_API_KEY=
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_COMPLET_v17.3.0.md:152:- ⚠️ VITE_GEMINI_API_KEY vide → **À configurer**
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_COMPLET_v17.3.0.md:439:VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_COMPLET_v17.3.0.md:486:1. Laisser VITE_GEMINI_API_KEY vide
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_COMPLET_v17.3.0.md:546:VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_COMPLET_v17.3.0.md:608:VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY  # Cloud principal
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_COMPLET_v17.3.0.md:725:# Remplacer : VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/baselines/OPTIMIZATION_PLAN_V23.md:144:**Problem:** LTM keeps all entries in memory; should be disk-backed
./runtime/registry/snapshot.json:97:    "GATE_P0_1_SECRETS": {
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_CHAT_IA_v18.md:50:│     ├─ Requires: VITE_GEMINI_API_KEY in .env           │
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_CHAT_IA_v18.md:77:pub async fn chat_set_gemini_key(api_key: String) -> AppResult<()>
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_CHAT_IA_v18.md:117:  CHAT_SET_GEMINI_KEY: 'chat_set_gemini_key',
./docs/99_ARCHIVE/sessions/STATE_MANAGEMENT_FIX_REPORT.md:34:    api_key: String,
./docs/RUNTIME_OBSERVABILITY.md:133:   ❌ DEBUG GEMINI_API_KEY=AIzaSy...
./docs/RUNTIME_OBSERVABILITY.md:134:   ✅ INFO GEMINI_API_KEY configured (32 chars)
./docs/RUNTIME_OBSERVABILITY.md:321:ERROR Failed to auth: Bearer sk-proj-abc123xyz...
./docs/99_ARCHIVE/sessions/SESSION_FINALE_8_DEC_2025_SUPERPROMPTS_v19.3Ω.md:78:- Validation clés: OpenAI (sk-*, 40+ chars), Claude (sk-ant-*, 50+ chars)
./docs/99_ARCHIVE/sessions/SESSION_FINALE_8_DEC_2025_SUPERPROMPTS_v19.3Ω.md:331:✅ chat_set_gemini_key(api_key) → SecureResponse<GeminiKeyStatus>
./docs/99_ARCHIVE/sessions/SESSION_FINALE_8_DEC_2025_SUPERPROMPTS_v19.3Ω.md:333:✅ chat_set_openai_key(api_key) → SecureResponse<GeminiKeyStatus>
./docs/99_ARCHIVE/sessions/SESSION_FINALE_8_DEC_2025_SUPERPROMPTS_v19.3Ω.md:335:✅ chat_set_anthropic_key(api_key) → SecureResponse<GeminiKeyStatus>
./docs/99_ARCHIVE/sessions/SESSION_FINALE_8_DEC_2025_SUPERPROMPTS_v19.3Ω.md:364:    // 1. Récupérer clé: secrets.get_secret("openai_api_key")
./docs/99_ARCHIVE/sessions/SESSION_FINALE_8_DEC_2025_SUPERPROMPTS_v19.3Ω.md:380:    // 1. Récupérer clé: secrets.get_secret("anthropic_api_key")
./docs/99_ARCHIVE/sessions/SESSION_FINALE_8_DEC_2025_SUPERPROMPTS_v19.3Ω.md:436:# → Ajouter clé OpenAI: sk-proj-...
./src/design-system/responsive-tokens.css:8: *   TITANE∞ v25.7.4 — RESPONSIVE DESIGN TOKENS
./src/design-system/titane-fusion.css:146:     CHAT IA v∞ — TOKENS MONOCHROME (remplacement violet/bleu)
./docs/99_ARCHIVE/sessions/TITANE_MEMORY_OS_v20Ω_REPORT.md:124:- **LTM**: Unlimited, disk-persistent JSON files, index-based access
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:71:if let Ok(api_key) = std::env::var("GEMINI_API_KEY") {
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:72:    let mut key = chat_orchestrator_state.gemini_api_key.write().await;
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:73:    *key = Some(api_key);
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:76:    log::warn!("⚠️  GEMINI_API_KEY not found in environment");
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:125:### 5️⃣ gemini_api_key public
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:132:    gemini_api_key: Arc<RwLock<Option<String>>>,  // ❌ private
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:139:    pub gemini_api_key: Arc<RwLock<Option<String>>>,  // ✅ public
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:174:4. Ligne ~204: Chargement `GEMINI_API_KEY`
./docs/99_ARCHIVE/sessions/FIX_STATE_MANAGEMENT_SUCCESS.md:178:1. Ligne ~68: `pub gemini_api_key` (au lieu de private)
./docs/99_ARCHIVE/sessions/MEMORY_CORE_STABILIZATION_PLAN_vOmega6.md:66:- Real disk-backed persistence with bounded size, deduplication, and recovery hooks.
./docs/99_ARCHIVE/sessions/TITANE_TRANSFORMATION_PLAN_VALIDATED.md:6:**Objective:** Risk-assessed, validated plan for 6-week implementation  
./docs/99_ARCHIVE/sessions/PERFORMANCE_BASELINE.md:192:- `validate_api_key` — **Low** (5-15ms, local check)
./docs/99_ARCHIVE/sessions/SUPER_PROMPT_8_COMPLETION_SUMMARY.md:134:  claudeKey: 'sk-ant-api03-...',
./docs/99_ARCHIVE/sessions/SUPER_PROMPT_8_COMPLETION_SUMMARY.md:135:  openaiKey: 'sk-proj-...',
./docs/99_ARCHIVE/sessions/SUPER_PROMPT_8_MULTI_AI_ORCHESTRATOR_REPORT.md:410:    pub api_key: Option<String>,
./docs/99_ARCHIVE/sessions/SUPER_PROMPT_8_MULTI_AI_ORCHESTRATOR_REPORT.md:557:  claudeKey: 'sk-ant-...',
./docs/99_ARCHIVE/sessions/SUPER_PROMPT_8_MULTI_AI_ORCHESTRATOR_REPORT.md:558:  openaiKey: 'sk-...',
./docs/99_ARCHIVE/sessions/SUPER_PROMPT_8_MULTI_AI_ORCHESTRATOR_REPORT.md:832:  claudeKey: 'sk-ant-api03-...',
./docs/99_ARCHIVE/sessions/SUPER_PROMPT_8_MULTI_AI_ORCHESTRATOR_REPORT.md:833:  openaiKey: 'sk-proj-...',
./CHAT_MEM_AUDIT.md:210:Injection function has MAX_CONTEXT_INJECTION_TOKENS constant but no **hard enforcement** that context ≤ budget.
./CHAT_MEM_AUDIT.md:214:const maxTokens = permissions.contextInjectionLimit || MAX_CONTEXT_INJECTION_TOKENS;  // Used for filtering
./docs/99_ARCHIVE/sessions/SESSION_SUMMARY.md:194:pnpm run update <task-id> completed
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:20:❌ VITE_GEMINI_API_KEY absente du .env
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:119:VITE_GEMINI_API_KEY=
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:127:- ⚠️ `VITE_GEMINI_API_KEY` vide → **À CONFIGURER PAR L'UTILISATEUR**
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:221:   - Copier la clé (format: `YOUR_GEMINI_API_KEY`)
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:232:   VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:289:   - Laisser `VITE_GEMINI_API_KEY` vide
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:335:         │      └─ VITE_GEMINI_API_KEY vide
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:349:| **Gemini** | `Boolean(VITE_GEMINI_API_KEY && length > 10)` | Clé API Google | ❌ Clé vide |
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:357:2. "Systèmes IA en mode dégradé. Impossible de générer une réponse pour le moment. Configure VITE_GEMINI_API_KEY ou lance Ollama localement."
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:379:4. ✅ **Configuration .env** → Variables VITE_GEMINI_API_KEY + VITE_OLLAMA_* ajoutées
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:392:VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_REPARATION_CHAT_IA_v17.3.0.md:602:   - VITE_GEMINI_API_KEY (vide)
./docs/99_ARCHIVE/sessions/SECURITY_COMMIT_SUMMARY.md:251:policy.allowed_shell_commands.push("vosk-transcriber".into());
./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:17:### 2. TITANE_SECRETS_PASSPHRASE
./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:59:   GEMINI_API_KEY=votre_cle_api_gemini_ici
./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:91:openssl rand -hex 32  # Pour TITANE_SECRETS_PASSPHRASE
./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:103:TITANE_SECRETS_PASSPHRASE=dev_secrets_12345678
./docs/99_ARCHIVE/sessions/SECURITY_CONFIG_PRODUCTION.md:110:TITANE_SECRETS_PASSPHRASE=<64-char-hex>
./src/lib/__tests__/UILogger.test.ts:111:        'API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234'
./src/lib/__tests__/UILogger.test.ts:116:      expect(logs[0].message).not.toContain('sk-abc123');
./src/lib/__tests__/UILogger.test.ts:179:        'User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
./src/lib/__tests__/UILogger.test.ts:186:      expect(message).not.toContain('sk-abc123');
./src/lib/__tests__/UILogger.integration.ts:37:  logInfo('API key: sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
./src/lib/__tests__/UILogger.integration.ts:45:      !log.message.includes('sk-abc123') &&
./src/pages/TitanePage.css:434:    mask-image: linear-gradient(
./src/pages/TitanePage.css:441:    -webkit-mask-image: linear-gradient(
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:37:    pub gemini_api_key: Arc<RwLock<Option<String>>>,
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:38:    pub openai_api_key: Arc<RwLock<Option<String>>>,        // ✅ NOUVEAU
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:39:    pub anthropic_api_key: Arc<RwLock<Option<String>>>,     // ✅ NOUVEAU
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:78:   - Purge: OPENAI_API_KEY from .env
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:88:   - Purge: ANTHROPIC_API_KEY from .env
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:378:1. **CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md** (1,200+ lignes)
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:383:2. **INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md** (1,300+ lignes)
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:486://    - Entrer: sk-YOUR_OPENAI_KEY
./docs/99_ARCHIVE/sessions/RAPPORT_SESSION_INTEGRATION_COMPLETE_v19.2.3+.md:491://    - Entrer: sk-ant-YOUR_ANTHROPIC_KEY
./src/lib/tauriCommands.ts:58:  CHAT_GENERATE_OPENAI: 'chat_generate_openai',
./src/lib/tauriCommands.ts:296:  HAS_SECRET: 'has_secret',
./src/lib/tauriCommands.ts:364:  PING_GEMINI: 'ping_gemini',
./src/lib/tauriCommands.ts:384:  UPDATE_UI_TOKEN: 'update_ui_token',
./src/pages/OrchestrationMetaCenter.css:597:.omc-task-list {
./src/pages/OrchestrationMetaCenter.css:603:.omc-task-header,
./src/pages/OrchestrationMetaCenter.css:604:.omc-task-row {
./src/pages/OrchestrationMetaCenter.css:612:.omc-task-header {
./src/pages/OrchestrationMetaCenter.css:620:.omc-task-row {
./src/pages/OrchestrationMetaCenter.css:626:.omc-task-progress {
./src/pages/OrchestrationMetaCenter.css:634:.omc-task-progress-bar {
./src/pages/OrchestrationMetaCenter.css:802:  .omc-task-header,
./src/pages/OrchestrationMetaCenter.css:803:  .omc-task-row {
./src/lib/tauriClient.ts:440:      TAURI_COMMANDS.CHAT_GENERATE_OPENAI,
./src/lib/tauriClient.ts:1994:      TAURI_COMMANDS.PING_GEMINI,
./src/lib/tauriClient.ts:2134:      TAURI_COMMANDS.UPDATE_UI_TOKEN,
./src/lib/tauriClient.ts:2274:      TAURI_COMMANDS.HAS_SECRET,
./src/lib/security/AIRateLimiter.ts:75:  private static readonly TOKEN_COSTS = {
./src/lib/security/AIRateLimiter.ts:175:      AIRateLimiter.TOKEN_COSTS[model as keyof typeof AIRateLimiter.TOKEN_COSTS] || 0;
./docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_v19.5.2.md:223:   → Add Secret: GEMINI_API_KEY = xxx
./docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_v19.5.2.md:224:   → Add Secret: OPENAI_API_KEY = xxx
./docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_v19.5.2.md:225:   → Add Secret: ANTHROPIC_API_KEY = xxx
./src/lib/security/AIResponseValidator.ts:104:  /TOKEN[:\s]+[\w-]{20,}/gi,
./src/lib/security/AIResponseValidator.ts:106:  /SECRET[:\s]+\w+/gi,
./docs/99_ARCHIVE/sessions/FIX_TTS_CHAT.md:78:echo "VITE_GEMINI_API_KEY=YOUR_KEY_HERE" > .env
./docs/99_ARCHIVE/sessions/FIX_TTS_CHAT.md:142:  grep VITE_GEMINI_API_KEY .env || echo "⚠️ VITE_GEMINI_API_KEY manquant dans .env"
./docs/99_ARCHIVE/sessions/FIX_TTS_CHAT.md:144:  echo "⚠️ Créer fichier .env avec VITE_GEMINI_API_KEY=YOUR_KEY"
./docs/99_ARCHIVE/sessions/FIX_TTS_CHAT.md:319:   env | grep GEMINI
./src/lib/logger.ts:300:      // 3. Headers: Content-Type: application/json, Authorization: Bearer $ANALYTICS_TOKEN
./docs/99_ARCHIVE/sessions/RAPPORT_v∞_ABC_IMPLEMENTATION_COMPLETE.md:1124:1. Configurer `.env` avec `GEMINI_API_KEY`
./src/lib/UILogger.ts:54:    /sk-[a-zA-Z0-9]{48}/g, // OpenAI API keys
./docs/99_ARCHIVE/sessions/GUIDE_INSTALLATION_WEBKIT.md:191:│     → Requires: VITE_GEMINI_API_KEY         │
./src/pages/SecureSettings.tsx:190:          'Impossible d&apos;enregistrer la clé Gemini. Vérifiez la passphrase TITANE_SECRETS_PASSPHRASE.',
./src/pages/SecureSettings.tsx:357:                  ⚠️ Une valeur GEMINI_API_KEY est toujours présente dans le fichier .env.
./src/pages/SecureSettings.tsx:469:                placeholder="sk-..."
./src/pages/SecureSettings.tsx:544:                placeholder="sk-ant-..."
./src/pages/SecureSettings.tsx:579:            Définir <code>TITANE_SECRETS_PASSPHRASE</code> dans l&apos;environnement
./src/pages/SecureSettings.tsx:590:            <code>GEMINI_API_KEY</code>.
./src/services/selfHealing/selfHealing.config.ts:439:  // IA / OLLAMA / GEMINI
./src/services/selfHealing/selfHealing.config.ts:598:    id: 'disk-full',
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:15:await invoke('set_api_key', {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:18:    key: 'sk-proj-...'  // Votre clé OpenAI
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:22:await invoke('set_api_key', {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:25:    key: 'sk-ant-...'  // Votre clé Claude
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:42:const openaiTest = await invoke('test_api_key', { service: 'openai' });
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:46:const claudeTest = await invoke('test_api_key', { service: 'claude' });
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:158:  await invoke('set_api_key', {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:166:  // Expected: "Clé OpenAI invalide: doit commencer par 'sk-' et avoir min. 40 caractères"
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:173:await invoke('delete_api_key', { service: 'openai' });
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:322:- [ ] Clé OpenAI configurée (`set_api_key`)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:323:- [ ] Clé Claude configurée (`set_api_key`)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:325:- [ ] Clés testées (`test_api_key`)
./docs/99_ARCHIVE/sessions/ORCHESTRATION_MANIFEST.md:30:│   └── task-complete.md
./docs/99_ARCHIVE/sessions/ORCHESTRATION_MANIFEST.md:106:pnpm run update <task-id> <status>
./docs/99_ARCHIVE/sessions/ORCHESTRATION_MANIFEST.md:252:- [x] Create templates (phase-plan, task-complete)
./src/pages/OrchestrationMetaCenter.tsx:526:          <div className="omc-task-list">
./src/pages/OrchestrationMetaCenter.tsx:527:            <div className="omc-task-header">
./src/pages/OrchestrationMetaCenter.tsx:535:              <div key={task.id} className="omc-task-row">
./src/pages/OrchestrationMetaCenter.tsx:536:                <span className="omc-task-name">{task.name}</span>
./src/pages/OrchestrationMetaCenter.tsx:537:                <span className="omc-task-engine">{task.engine}</span>
./src/pages/OrchestrationMetaCenter.tsx:539:                  className="omc-task-priority"
./src/pages/OrchestrationMetaCenter.tsx:546:                <span className="omc-task-status">{task.status}</span>
./src/pages/OrchestrationMetaCenter.tsx:547:                <div className="omc-task-progress">
./src/pages/OrchestrationMetaCenter.tsx:549:                    className="omc-task-progress-bar"
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:26:if let Ok(Some(api_key)) = secrets_engine.get_secret("gemini_api_key") {
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:28:        let mut key = chat_orchestrator_state.gemini_api_key.write().await;
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:29:        *key = Some(api_key.clone());
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:49:- ❌ OpenAI non fonctionnel (clé jamais chargée dans `openai_api_key`)
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:50:- ❌ Anthropic non fonctionnel (clé jamais chargée dans `anthropic_api_key`)
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:65:if let Ok(Some(api_key)) = secrets_engine.get_secret("openai_api_key") {
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:67:        let mut key = chat_orchestrator_state.openai_api_key.write().await;
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:68:        *key = Some(api_key.clone());
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:75:} else if let Ok(env_key) = std::env::var("OPENAI_API_KEY") {
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:76:    match secrets_engine.set_secret("openai_api_key", env_key.clone()) {
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:78:            log::info!("🔐 Migrated OPENAI_API_KEY from environment into SecureSecretsEngine")
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:86:        let mut key = chat_orchestrator_state.openai_api_key.write().await;
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:105:if let Ok(Some(api_key)) = secrets_engine.get_secret("anthropic_api_key") {
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:107:        let mut key = chat_orchestrator_state.anthropic_api_key.write().await;
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:108:        *key = Some(api_key.clone());
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:115:} else if let Ok(env_key) = std::env::var("ANTHROPIC_API_KEY") {
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:116:    match secrets_engine.set_secret("anthropic_api_key", env_key.clone()) {
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:118:            log::info!("🔐 Migrated ANTHROPIC_API_KEY from environment into SecureSecretsEngine")
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:126:        let mut key = chat_orchestrator_state.anthropic_api_key.write().await;
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:164:│  │ GEMINI API KEY                                       │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:166:│  │ ✓ Fallback: Migrate from GEMINI_API_KEY env         │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:167:│  │ ✓ Set in chat_orchestrator_state.gemini_api_key     │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:172:│  │ OPENAI API KEY (✅ AJOUTÉ)                          │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:174:│  │ ✓ Fallback: Migrate from OPENAI_API_KEY env         │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:175:│  │ ✓ Set in chat_orchestrator_state.openai_api_key     │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:180:│  │ ANTHROPIC API KEY (✅ AJOUTÉ)                       │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:182:│  │ ✓ Fallback: Migrate from ANTHROPIC_API_KEY env      │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:183:│  │ ✓ Set in chat_orchestrator_state.anthropic_api_key  │  │
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:218:4. Entrer clé valide: `sk-...` (51 caractères)
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:228:[SecureCommands] Purged OPENAI_API_KEY from .env
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:240:2. Entrer clé valide: `sk-ant-...` (format Anthropic)
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:250:[SecureCommands] Purged ANTHROPIC_API_KEY from .env
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:410:sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:411:Format: sk-proj-[48 caractères alphanumériques]
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:417:sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:418:Format: sk-ant-api03-[48+ caractères]
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:429:  - Authorization: Bearer {api_key}
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:443:  - x-api-key: {api_key}
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:468:**Passphrase**: `TITANE_SECRETS_PASSPHRASE` (variable d'environnement)
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:487:sk-proj-abc123xyz789def456ghi789 → sk-p...h789
./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:540:- `CONFIGURATION_APIS_OPENAI_ANTHROPIC_v∞.md`
./docs/99_ARCHIVE/sessions/QUICK_REFERENCE_APIS_v∞.md:39:- OpenAI: `sk-proj-...`
./docs/99_ARCHIVE/sessions/QUICK_REFERENCE_APIS_v∞.md:40:- Anthropic: `sk-ant-api03-...`
./docs/99_ARCHIVE/sessions/OPUS_DIAG_AUDIO_PERIPHERIQUES_v∞.md:114:│                       │ Vosk fallback (vosk-model-small-fr) │◄─ Fallback│
./docs/99_ARCHIVE/sessions/RAPPORT_KERNEL_EXTENDED_STABILITY_v20Ω.md:114:  const result = await invoke('set_api_key', { request });
./docs/99_ARCHIVE/sessions/GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md:1:# 🌐 GOOGLE CLOUD SERVICES - GEMINI API v∞
./docs/99_ARCHIVE/sessions/GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md:307:  api_key_configured: boolean;
./docs/99_ARCHIVE/sessions/GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md:322:console.log(`🔑 API Key: ${status.api_key_configured ? 'Configured' : 'Missing'}`);
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:24:│   └── api_key_validator.rs     [🆕 NOUVEAU]
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:53:## 🅑 SECURESECRETSENGINE v∞ (Extension GPT + Claude)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:65:pub const KEY_OPENAI: &str = "openai_api_key";
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:66:pub const KEY_CLAUDE: &str = "claude_api_key";
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:67:pub const KEY_GEMINI: &str = "gemini_api_key";
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:72:        self.validate_api_key(&key, "openai")?;
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:73:        self.set_secret(KEY_OPENAI, key)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:78:        self.get_secret(KEY_OPENAI)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:83:        self.validate_api_key(&key, "claude")?;
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:93:    fn validate_api_key(&self, key: &str, provider: &str) -> Result<(), SecretsError> {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:100:                // sk-proj-... ou sk-...
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:101:                if !key.starts_with("sk-") {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:103:                        "OpenAI key must start with 'sk-'".into()
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:113:                // sk-ant-...
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:114:                if !key.starts_with("sk-ant-") {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:116:                        "Claude key must start with 'sk-ant-'".into()
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:142:        if self.get_secret(KEY_GEMINI)?.is_some() {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:145:        if self.get_secret(KEY_OPENAI)?.is_some() {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:185:const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:187:const MAX_TOKENS: usize = 4096;
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:244:    api_key: String,
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:249:    pub fn new(api_key: String) -> Self {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:251:            api_key,
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:288:            max_tokens: request.max_tokens.or(Some(MAX_TOKENS)),
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:295:            .post(OPENAI_API_URL)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:296:            .header("Authorization", format!("Bearer {}", self.api_key))
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:422:const MAX_TOKENS: usize = 4096;
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:482:    api_key: String,
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:487:    pub fn new(api_key: String) -> Self {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:489:            api_key,
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:514:            max_tokens: request.max_tokens.unwrap_or(MAX_TOKENS),
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:521:            .header("x-api-key", &self.api_key)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:736:        if let Ok(Some(_key)) = self.secrets.get_secret("gemini_api_key") {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1083:      await invoke('delete_api_key', { service });
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1093:      const result = await invoke<boolean>('test_api_key', { service });
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1193:            r"sk-[a-zA-Z0-9]{20,}",           // API keys
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1226:        assert!(engine.validate_api_key("sk-proj-abc123...xyz", "openai").is_ok());
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1229:        assert!(engine.validate_api_key("invalid-key", "openai").is_err());
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1232:        assert!(engine.validate_api_key("sk-abc", "openai").is_err());
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1240:        assert!(engine.validate_api_key("sk-ant-api03-abc123...xyz", "claude").is_ok());
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1243:        assert!(engine.validate_api_key("sk-abc", "claude").is_err());
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1300:3. Créer `api_key_validator.rs`
./src/components/security/__tests__/SecurityPanel.test.tsx:384:      expect(content).not.toMatch(/sk-proj-/);
./src/components/security/__tests__/SecurityPanel.test.tsx:385:      expect(content).not.toMatch(/sk-ant-/);
./src/styles/unified-tokens.css:2: * TITANE∞ v24.3.0 — UNIFIED DESIGN TOKENS
./src/styles/titanium-dark-tokens.css:2: * TITANE∞ v26.2.0 — TITANIUM DARK DESIGN TOKENS
./src/styles/tokens.ts:2: * TITANE∞ v8.0 — DESIGN TOKENS (TypeScript)
./src/styles/tokens.ts:277:/* COMPLETE TOKEN OBJECT (for exhaustive access)                     */
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_PHASE5_INTEGRATION_v∞.md:87:pub fn new(gemini_api_key: Option<String>, ollama_model: Option<String>) -> Self {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_PHASE5_INTEGRATION_v∞.md:89:        gemini_client: gemini_api_key.map(|key| Arc::new(GeminiClient::new(key))),
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_PHASE5_INTEGRATION_v∞.md:216:       ├─→ 1. Claude API (sk-ant-...)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_PHASE5_INTEGRATION_v∞.md:217:       ├─→ 2. OpenAI API (sk-proj-...)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_PHASE5_INTEGRATION_v∞.md:286:    Some(gemini_api_key.clone()),  // If available
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_PHASE5_INTEGRATION_v∞.md:361:- ✅ `set_api_key` (openai/claude)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_PHASE5_INTEGRATION_v∞.md:363:- ✅ `test_api_key` (validation)
./src/styles/css-vars.css:2: * TITANE∞ v25.4.2 — CSS CUSTOM PROPERTIES (DESIGN TOKENS)
./src/components/security/AddAPIKeyModal.tsx:57:        return 'sk-proj-...';
./src/components/security/AddAPIKeyModal.tsx:59:        return 'sk-ant-...';
./src/components/security/AddAPIKeyModal.tsx:70:        return 'Clé OpenAI (commence par "sk-proj-" ou "sk-", min. 40 caractères)';
./src/components/security/AddAPIKeyModal.tsx:72:        return 'Clé Anthropic Claude (commence par "sk-ant-", min. 50 caractères)';
./docs/99_ARCHIVE/sessions/RAPPORT_CHAT_IA_v18.md:58:  CHAT_SET_GEMINI_KEY: 'chat_set_gemini_key',
./docs/99_ARCHIVE/sessions/RAPPORT_CHAT_IA_v18.md:315:| **geminiProvider** | API Cloud | 2 | Si VITE_GEMINI_API_KEY | Très haute |
./docs/99_ARCHIVE/sessions/RAPPORT_CHAT_IA_v18.md:577:VITE_GEMINI_API_KEY=your_key_here
./src/components/evolution/EvolutionDashboard.tsx:150:      <div className={`suggestion-card risk-${risk}`}>
./src/components/evolution/EvolutionDashboard.tsx:153:          <span className={`risk-badge badge-${risk}`}>{risk}</span>
./src/components/evolution/EvolutionDashboard.tsx:201:        <span className={`risk-badge badge-${risk}`}>{risk}</span>
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:450:# API GEMINI
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:451:GEMINI_API_KEY=your_api_key_here
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:452:GEMINI_MODEL=gemini-pro
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:453:GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:488:let api_key = state.gemini_api_key.read().await;
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:489:let key = api_key.as_ref().ok_or_else(||
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:505:- ❌ GEMINI_API_KEY peut être absente → erreur runtime seulement
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:512:  "GEMINI_API_KEY"
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:533:git grep -i "sk-" # OpenAI API key pattern
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:754:  delete process.env.GEMINI_API_KEY;
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:1015:État: .env existe MAIS GEMINI_API_KEY manquante
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:1174:grep -q "GEMINI_API_KEY=" .env || echo "⚠️ GEMINI_API_KEY non configurée"
./docs/99_ARCHIVE/sessions/RAPPORT_IRREGULARITES_POTENTIELLES_v16.2.2_FINAL.md:1187:test -n "$GEMINI_API_KEY" || echo "⚠️ GEMINI_API_KEY manquante"
./docs/99_ARCHIVE/sessions/ARCHITECTURE_CURRENT_DETAILED.md:189:- `validate_api_key`
./docs/99_ARCHIVE/sessions/ARCHITECTURE_CURRENT_DETAILED.md:571:- Long-Term Memory (disk-based, sled DB)
./docs/99_ARCHIVE/sessions/CLOUD_SYNC_ENGINE_v∞_REPORT.md:232:  "blocked_keys": ["secrets.*", "api_keys.*", "private.*"],
./docs/99_ARCHIVE/sessions/PHASE2_EXECUTION_GUIDE.md:188:cat .env | grep GEMINI
./docs/99_ARCHIVE/sessions/PHASE2_EXECUTION_GUIDE.md:191:VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/sessions/PHASE2_EXECUTION_GUIDE.md:193:GEMINI_API_KEY=YOUR_GEMINI_API_KEY
./docs/99_ARCHIVE/sessions/PHASE2_EXECUTION_GUIDE.md:200:   echo "GEMINI_API_KEY=YOUR_KEY_HERE" >> .env
./src/components/evolution/EvolutionDashboard.css:435:.suggestion-card.risk-LOW {
./src/components/evolution/EvolutionDashboard.css:438:.suggestion-card.risk-MEDIUM {
./src/components/evolution/EvolutionDashboard.css:441:.suggestion-card.risk-HIGH {
./src/components/evolution/EvolutionDashboard.css:444:.suggestion-card.risk-CRITICAL {
./src/components/evolution/EvolutionDashboard.css:465:.risk-badge {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:19:   pub const KEY_OPENAI: &str = "openai_api_key";
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:20:   pub const KEY_CLAUDE: &str = "claude_api_key";
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:21:   pub const KEY_GEMINI: &str = "gemini_api_key";
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:36:   - `validate_api_key()` - Validation format (regex)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:39:   - OpenAI: `sk-...` (min 40 chars)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:40:   - Claude: `sk-ant-...` (min 50 chars)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:68:pub struct OpenAIClient { api_key, client }
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:92:pub struct ClaudeClient { api_key, client }
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:138:1. ✅ `set_api_key` - Configuration clé (OpenAI/Claude/Gemini)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:139:2. ✅ `delete_api_key` - Suppression clé
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:141:4. ✅ `test_api_key` - Test validité clé
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:173:     * `set_api_key`
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:174:     * `delete_api_key`
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:176:     * `test_api_key`
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:265:- Masquage clés (`sk-...****`)
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:323:   - OpenAI: regex `sk-...` min 40 chars
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:324:   - Claude: regex `sk-ant-...` min 50 chars
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:364:await invoke('set_api_key', {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:365:  request: { service: 'openai', key: 'sk-...' }
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:369:await invoke('set_api_key', {
./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:370:  request: { service: 'claude', key: 'sk-ant-...' }
./docs/99_ARCHIVE/sessions/RAPPORT_FUSION_DESIGN_SYSTEM_v17.3.0.md:172:  /* 📐 LAYOUT TOKENS */
./docs/99_ARCHIVE/sessions/SUPER_PROMPT_8_ARCHITECTURE_VISUAL.md:53:        │  CLAUDE PROVIDER  │     │ OPENAI PROVIDER │      │  LOCAL PROVIDER  │
./docs/99_ARCHIVE/sessions/INTEGRATION_OVERDRIVE_GUIDE.md:138:    let api_key = "YOUR_GEMINI_API_KEY"; // À configurer
./docs/99_ARCHIVE/sessions/INTEGRATION_OVERDRIVE_GUIDE.md:156:        .header("x-goog-api-key", api_key)
./docs/99_ARCHIVE/sessions/INTEGRATION_OVERDRIVE_GUIDE.md:245:let api_key = env::var("GEMINI_API_KEY")
./docs/99_ARCHIVE/sessions/INTEGRATION_OVERDRIVE_GUIDE.md:246:    .map_err(|_| "GEMINI_API_KEY not set")?;
./docs/99_ARCHIVE/sessions/INTEGRATION_OVERDRIVE_GUIDE.md:253:  "gemini_api_key": "YOUR_KEY_HERE"
./docs/99_ARCHIVE/sessions/QUICK_START_GOOGLE_CLOUD.md:143:## 🔐 OBTENIR UNE CLÉ API GEMINI
./docs/99_ARCHIVE/sessions/QUICK_START_GOOGLE_CLOUD.md:229:- `GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md` - Liste complète des 22 services
./src/components/chat/ChatInput.css:115:  -webkit-mask-composite: xor;
./src/components/chat/ChatInput.css:119:  mask-composite: exclude;
./src/components/chat/MessageBubble.css:157:  -webkit-mask-composite: xor;
./src/components/chat/MessageBubble.css:161:  mask-composite: exclude;
./src/components/MetaCenter/MetaCenter.css:343:.meta-task-list {
./src/components/MetaCenter/MetaCenter.css:349:.meta-task-header {
./src/components/MetaCenter/MetaCenter.css:360:.meta-task-row {
./src/components/MetaCenter/MetaCenter.css:370:.meta-task-row:last-child {
./src/components/MetaCenter/MetaCenter.css:374:.meta-task-name {
./src/components/MetaCenter/MetaCenter.css:378:.meta-task-engine {
./src/components/MetaCenter/MetaCenter.css:382:.meta-task-priority {
./src/components/MetaCenter/MetaCenter.css:386:.meta-task-status {
./src/components/MetaCenter/MetaCenter.css:390:.meta-task-progress {
./src/components/MetaCenter/MetaCenter.css:397:.meta-task-progress-bar {
./src/components/MetaCenter/MetaCenter.css:423:  .meta-task-header,
./src/components/MetaCenter/MetaCenter.css:424:  .meta-task-row {
./src/components/MetaCenter/MetaCenter.css:428:  .meta-task-header span:nth-child(n + 3),
./src/components/MetaCenter/MetaCenter.css:429:  .meta-task-row > *:nth-child(n + 3) {
./src/components/MetaCenter/MetaCenter.tsx:165:    <div className="meta-task-row">
./src/components/MetaCenter/MetaCenter.tsx:166:      <span className="meta-task-name">{task.name}</span>
./src/components/MetaCenter/MetaCenter.tsx:167:      <span className="meta-task-engine">{task.engine}</span>
./src/components/MetaCenter/MetaCenter.tsx:169:        className="meta-task-priority"
./src/components/MetaCenter/MetaCenter.tsx:174:      <span className="meta-task-status">{task.status}</span>
./src/components/MetaCenter/MetaCenter.tsx:175:      <div className="meta-task-progress">
./src/components/MetaCenter/MetaCenter.tsx:177:          className="meta-task-progress-bar"
./src/components/MetaCenter/MetaCenter.tsx:437:          <div className="meta-task-list">
./src/components/MetaCenter/MetaCenter.tsx:438:            <div className="meta-task-header">
./src/components/monitoring/SingularityDashboard.tsx:57:// DESIGN TOKENS
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:8726:./MANUEL_UTILISATEUR_COMPLET_v27.0.0.md:1927:await invoke('chat_set_openai_key', { key: 'sk-...' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:8742:./MANUEL_UTILISATEUR_COMPLET_v27.0.0.md:2254:grep -r "api_key" src-tauri/src/
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:12977:./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:50:| `src-tauri/src/auth/api_keys.rs`  | 85     | Save/get API keys (masqué ••••last4)                   | ✅     |
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:12981:./docs/99_ARCHIVE/complete-reports/AUTH_MIGRATION_STATUS.md:175:- ✅ `src-tauri/src/secure_commands.rs` - Utilisé en interne par `auth::api_keys`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14257:./docs/GEMINI_CONFIGURATION.md:111:const { invoke } = window.__TAURI__.core;
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14258:./docs/GEMINI_CONFIGURATION.md:114:await invoke('chat_set_gemini_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14259:./docs/GEMINI_CONFIGURATION.md:119:const status = await invoke('get_gemini_key_status');
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14260:./docs/GEMINI_CONFIGURATION.md:177:**src-tauri/src/security/secrets_engine.rs** (414 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14261:./docs/GEMINI_CONFIGURATION.md:187:**src-tauri/src/secure_commands.rs** (668 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14262:./docs/GEMINI_CONFIGURATION.md:189:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14263:./docs/GEMINI_CONFIGURATION.md:230:**tauri.base.json** (ligne 44)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14264:./docs/GEMINI_CONFIGURATION.md:323:await invoke('chat_set_gemini_key', { apiKey: 'VOTRE_CLE' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14265:./docs/GEMINI_CONFIGURATION.md:330:grep "allow-internal-toggle-devtools" src-tauri/tauri.conf.json
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14266:./docs/GEMINI_CONFIGURATION.md:364:- [src-tauri/src/security/secrets_engine.rs](../src-tauri/src/security/secrets_engine.rs) - Backend chiffrement
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:18248:./docs/_evidence/audit-2026-01-15/tauri_command_names.tsv:43:auth_delete_api_key	src-tauri/src/auth/commands.rs	73	72
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:18250:./docs/_evidence/audit-2026-01-15/tauri_command_names.tsv:45:auth_get_api_keys	src-tauri/src/auth/commands.rs	63	62
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:18255:./docs/_evidence/audit-2026-01-15/tauri_command_names.tsv:50:auth_save_api_keys	src-tauri/src/auth/commands.rs	53	52
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:18389:./docs/_evidence/audit-2026-01-15/tauri_command_names.tsv:184:chat_set_api_key	src-tauri/src/api/chat_commands.rs	74	73
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:18513:./docs/_evidence/audit-2026-01-15/tauri_command_names.tsv:308:delete_api_key	src-tauri/src/commands/ia_commands.rs	99	98
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:19182:./docs/_evidence/audit-2026-01-15/tauri_command_names.tsv:977:set_api_key	src-tauri/src/commands/ia_commands.rs	61	60
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:19305:./docs/_evidence/audit-2026-01-15/tauri_command_names.tsv:1100:test_api_key	src-tauri/src/commands/ia_commands.rs	146	145
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:21001:./docs/AUTH_MIGRATION_PLAN.md:318:- `src-tauri/src/auth/api_keys.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22104:./docs/ai/SECRETS_STORAGE.md:93:│  Tauri Commands (/src-tauri/src/commands/security.rs)         │
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22105:./docs/ai/SECRETS_STORAGE.md:114:│  /src-tauri/src/security/secrets_engine.rs                     │
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22106:./docs/ai/SECRETS_STORAGE.md:419:pnpm run dev:tauri
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22107:./docs/ai/SECRETS_STORAGE.md:447:pnpm run dev:tauri
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22108:./docs/ai/SECRETS_STORAGE.md:482:// /src-tauri/src/security/secrets_engine.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22109:./docs/ai/SECRETS_STORAGE.md:489:// /src-tauri/src/commands/security.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22110:./docs/ai/SECRETS_STORAGE.md:490:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22305:./docs/_evidence/v27/B23_ipc_contract_secure_key_commands_2026-01-14.txt:150:| `chat_set_gemini_key` | `src/features/governance-center/services/governanceService.ts`<br>`src/utils/secureSecrets.ts`<br>`src/services/ai/providers/tauriChat.ts` | `{api_key: string}` | `SecureResponse<GeminiKeyStatus>` | `Err(String)` |
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22833:./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:214:await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22834:./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:222:await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22837:./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:261:const isValid = await invoke('test_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22845:./docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:393:await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22953:./docs/_evidence/v27/E_rg_v26_v27.txt:1095:./src-tauri/src/security/secrets_engine.rs:27:pub const KEY_COPILOT: &str = "copilot_api_key"; // ✨ v26.3 - GitHub Copilot
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22955:./docs/_evidence/v27/E_rg_v26_v27.txt:1098:./src-tauri/src/security/security_engine.rs:25:// SECURE SECRET WRAPPER (v26.2.0 P1)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:23476:./docs/_evidence/v27/A2_find_maxdepth4_sorted.txt:6962:./src-tauri/src/auth/api_keys.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25656:./docs/_evidence/v27/snapshot-20260113-081652/A2_find_maxdepth4.txt:6978:./src-tauri/src/auth/api_keys.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:26924:./docs/99_ARCHIVE/merged/CHAT_IA_AUDIT_FINAL_v19.2_COMPLETE.md:654:await tauriClient.chatSetGeminiKey('sk-abc123...');
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27063:./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:215:await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27064:./docs/99_ARCHIVE/merged/GPT_CLAUDE_PHASES_1-6_COMPLETE_v∞.md:220:await invoke('test_api_key', { service: 'openai' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27145:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:15:await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27146:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:22:await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27148:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:42:const openaiTest = await invoke('test_api_key', { service: 'openai' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27149:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:46:const claudeTest = await invoke('test_api_key', { service: 'claude' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27155:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:158:  await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27156:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:173:await invoke('delete_api_key', { service: 'openai' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27237:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:39:1. **src-tauri/src/overdrive/chat_orchestrator.rs** (+278 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27238:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:46:2. **src-tauri/src/secure_commands.rs** (+206 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27239:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:52:3. **src-tauri/src/main.rs** (+4 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27240:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:109:  loadGeminiStatus(),       ← invoke('get_gemini_key_status')
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27241:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:110:  loadOpenAIStatus(),       ← invoke('get_openai_key_status')      ✨ NOUVEAU
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27242:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:111:  loadAnthropicStatus(),    ← invoke('get_anthropic_key_status')   ✨ NOUVEAU
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27243:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:135:invoke('chat_set_openai_key', { apiKey: "sk-abc123..." })
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27244:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:157:invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27245:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:371:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27246:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:517:pnpm run tauri:dev
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27247:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:535:import { invoke } from '@tauri-apps/api/core';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27248:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:538:const response = await invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27249:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:556:const responseOpenAI = await invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27250:./docs/99_ARCHIVE/merged/INTEGRATION_COMPLETE_API_OPENAI_ANTHROPIC_v19.2.3+.md:566:const responseAnthropic = await invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27323:./src/services/ai/chatModes.config.ts:504:    capabilities: ['planning', 'task-creation', 'prioritization'],
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27329:./src/services/ai/chatModes.config.ts:824:    capabilities: ['strategic-analysis', 'decision-support', 'risk-assessment'],
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27353:./docs/99_ARCHIVE/sessions/GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md:287:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27354:./docs/99_ARCHIVE/sessions/GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md:303:import { invoke } from '@tauri-apps/api/core';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27355:./docs/99_ARCHIVE/sessions/GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md:319:const status = await invoke<GeminiFullStatus>('test_gemini_services');
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27862:./docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md:1390:await invoke('chat_set_openai_key', { key: "sk-..." });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27878:./docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md:1689:grep -r "api_key" src-tauri/src/
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:29865:./docs/99_ARCHIVE/audits/API_VALIDATION_REPORT_v24.2.0.md:547:await window.__TAURI_INTERNALS__.invoke('chat_set_openai_key', { apiKey: 'sk-...' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30106:./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:227:await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'gemini_api_key' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30107:./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:228:await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'openai_api_key' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30108:./docs/99_ARCHIVE/audits/API_CONFIGURATION_GUIDE_v24.2.0.md:229:await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'anthropic_api_key' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30359:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1083:      await invoke('delete_api_key', { service });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30360:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:1093:      const result = await invoke<boolean>('test_api_key', { service });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30422:./docs/99_ARCHIVE/sessions/RAPPORT_KERNEL_EXTENDED_STABILITY_v20Ω.md:114:  const result = await invoke('set_api_key', { request });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:31122:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:364:await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:31123:./docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_PROGRESS_v∞.md:369:await invoke('set_api_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32122:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:26:**Fichier:** `src-tauri/src/main.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32123:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:37:**Fichier:** `src-tauri/tauri.conf.json`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32124:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:57:// const geminiStatus = await invoke<{ ok: boolean; data?: { configured: boolean } }>(
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32125:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:106:  const backendReady = await tauriChatProvider.isAvailable();
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32126:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:109:  const status = await tauriChatProvider.getProvidersStatus();
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32127:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:183:- **1 fichier JSON** (tauri.conf.json)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32128:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:236:1. Décommenter les lignes dans `src-tauri/src/main.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32129:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:237:2. Décommenter les lignes dans `src-tauri/tauri.conf.json`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32130:./docs/99_ARCHIVE/rapports/GEMINI_DEACTIVATION_v24.2.1.md:277:- Removed Gemini permission from tauri.conf.json
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32259:./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:20:**Fichier**: `src-tauri/src/main.rs` (lignes 320-365)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32260:./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:58:**Fichier**: `src-tauri/src/main.rs` (lignes 358-439)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32261:./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:497:cd src-tauri
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32262:./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:505:cargo test --manifest-path src-tauri/Cargo.toml
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32263:./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:531:- `src-tauri/src/main.rs` (lignes 358-439)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32264:./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:534:- `src-tauri/src/overdrive/chat_orchestrator.rs` (lignes 647-920)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:32265:./docs/99_ARCHIVE/sessions/CORRECTION_APIS_OPENAI_ANTHROPIC_v∞.md:535:- `src-tauri/src/secure_commands.rs` (lignes 212-424)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:35847:./docs/99_ARCHIVE/versions/v16/FIX_CHAT_IA_v16.1.0.md:154:| `CHAT_SET_GEMINI_KEY: 'chat_set_gemini_key'` | `#[tauri::command] pub async fn chat_set_gemini_key(...)` | ✅ |
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36409:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:38:**Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36410:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:100:**Localisation**: `src-tauri/src/overdrive/chat_orchestrator.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36411:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:200:**Localisation**: `src-tauri/src/overdrive/chat_orchestrator.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36412:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:301:**Fichier**: `src-tauri/src/secure_commands.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36413:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:306:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36414:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:353:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36415:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:384:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36416:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:431:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36417:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:470:**Fichier**: `src-tauri/src/main.rs` (lignes 618-621)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36418:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:497:**Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36419:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:783:$ cargo check --manifest-path src-tauri/Cargo.toml
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36420:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:813:1. Lancer TITANE∞ : `pnpm run tauri:dev`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36421:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:831:import { invoke } from '@tauri-apps/api/core';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36422:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:834:const openaiResponse = await invoke('chat_set_openai_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36423:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:841:const anthropicResponse = await invoke('chat_set_anthropic_key', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36424:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:846:const chatResponse = await invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36425:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:873:const testOpenAI = await invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36426:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:882:const testAnthropic = await invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36427:./docs/99_ARCHIVE/versions/v19/CONFIGURATION_API_OPENAI_ANTHROPIC_v19.2.3+.md:892:const testAuto = await invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:36619:./docs/99_ARCHIVE/versions/v19/AUDIT_API_COMPLET_v19.3.0.md:417:await invoke('chat_set_gemini_key', { api_key: 'AIza...' });
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:37744:./docs/_evidence/audit-2026-01-15/inventory_files.txt:68131:src-tauri/src/auth/api_keys.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:48553:./docs/_evidence/audit-2026-01-15/inventory_files.txt:78940:src-tauri/target/debug/deps/futures_task-30bd184f61955764.d
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:48554:./docs/_evidence/audit-2026-01-15/inventory_files.txt:78941:src-tauri/target/debug/deps/futures_task-30bd184f61955764.futures_task.48b31f9fbee60add-cgu.0.rcgu.dwo
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:48555:./docs/_evidence/audit-2026-01-15/inventory_files.txt:78942:src-tauri/target/debug/deps/futures_task-873cde9c4c57e834.d
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:54760:./docs/_evidence/audit-2026-01-15/inventory_files.txt:85147:src-tauri/target/debug/deps/libfutures_task-30bd184f61955764.rlib
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:54761:./docs/_evidence/audit-2026-01-15/inventory_files.txt:85148:src-tauri/target/debug/deps/libfutures_task-30bd184f61955764.rmeta
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:54762:./docs/_evidence/audit-2026-01-15/inventory_files.txt:85149:src-tauri/target/debug/deps/libfutures_task-873cde9c4c57e834.rmeta
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:90321:./docs/_evidence/audit-2026-01-15/inventory_files.txt:120708:src-tauri/target/debug/.fingerprint/futures-task-30bd184f61955764/dep-lib-futures_task
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:90322:./docs/_evidence/audit-2026-01-15/inventory_files.txt:120709:src-tauri/target/debug/.fingerprint/futures-task-30bd184f61955764/invoked.timestamp
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:90323:./docs/_evidence/audit-2026-01-15/inventory_files.txt:120710:src-tauri/target/debug/.fingerprint/futures-task-30bd184f61955764/lib-futures_task
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:90324:./docs/_evidence/audit-2026-01-15/inventory_files.txt:120711:src-tauri/target/debug/.fingerprint/futures-task-30bd184f61955764/lib-futures_task.json
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:90325:./docs/_evidence/audit-2026-01-15/inventory_files.txt:120712:src-tauri/target/debug/.fingerprint/futures-task-873cde9c4c57e834/dep-lib-futures_task
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:90326:./docs/_evidence/audit-2026-01-15/inventory_files.txt:120713:src-tauri/target/debug/.fingerprint/futures-task-873cde9c4c57e834/invoked.timestamp
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:90327:./docs/_evidence/audit-2026-01-15/inventory_files.txt:120714:src-tauri/target/debug/.fingerprint/futures-task-873cde9c4c57e834/lib-futures_task
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:90328:./docs/_evidence/audit-2026-01-15/inventory_files.txt:120715:src-tauri/target/debug/.fingerprint/futures-task-873cde9c4c57e834/lib-futures_task.json
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:130084:./docs/_evidence/audit-2026-01-15/inventory_files.txt:160471:src-tauri/target/release/deps/futures_task-67ad0420b3d32eef.d
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:130501:./docs/_evidence/audit-2026-01-15/inventory_files.txt:160888:src-tauri/target/release/deps/libfutures_task-67ad0420b3d32eef.rlib
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:130502:./docs/_evidence/audit-2026-01-15/inventory_files.txt:160889:src-tauri/target/release/deps/libfutures_task-67ad0420b3d32eef.rmeta
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:132437:./docs/_evidence/audit-2026-01-15/inventory_files.txt:162824:src-tauri/target/release/.fingerprint/futures-task-67ad0420b3d32eef/dep-lib-futures_task
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:132438:./docs/_evidence/audit-2026-01-15/inventory_files.txt:162825:src-tauri/target/release/.fingerprint/futures-task-67ad0420b3d32eef/invoked.timestamp
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:132439:./docs/_evidence/audit-2026-01-15/inventory_files.txt:162826:src-tauri/target/release/.fingerprint/futures-task-67ad0420b3d32eef/lib-futures_task
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:132440:./docs/_evidence/audit-2026-01-15/inventory_files.txt:162827:src-tauri/target/release/.fingerprint/futures-task-67ad0420b3d32eef/lib-futures_task.json
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:142870:src/services/ai/providers/__tests__/openai.test.ts:6:import { openaiProvider, OPENAI_MODELS } from '../openai';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:144040:src/features/governance-center/tabs/SecretsTab.tsx:14:import { KNOWN_SECRETS as knownSecrets } from '../types';
