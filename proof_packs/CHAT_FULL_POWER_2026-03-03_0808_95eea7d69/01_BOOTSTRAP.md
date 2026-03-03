# 01_BOOTSTRAP

Timestamp: 2026-03-03T08:08:06-05:00
HEAD: 95eea7d69

## git status
Sur la branche MAIN
Votre branche est à jour avec 'origin/MAIN'.

Fichiers non suivis:
  (utilisez "git add <fichier>..." pour inclure dans ce qui sera validé)
	proof_packs/CHAT_FULL_POWER_2026-03-03_0808_95eea7d69/

aucune modification ajoutée à la validation mais des fichiers non suivis sont présents (utilisez "git add" pour les suivre)

## git rev-parse --short HEAD
95eea7d69

## git log -20 --oneline
95eea7d69 Merge pull request #163 from KallokTherok1994/auto/exec-p0-p16-20260302-2034-cbc8f61
34046ca98 feat(hardline): add G0-G18 gate scripts for RC certification
53168e759 feat(hardline): add FINAL+++ runner and final audit orchestration
cbc8f617a docs(release): add GitHub release notes for v27.2.0-prod-release-20260302
76ea68401 release(prod): stabilize startup path and publish qualification proof packs
57e48984f docs(proof): seal online prod start x3 pass
5889560f3 docs(release): add short note for PROD_START_FIX_AUTH
6d4c8efc7 fix(boot): qualify PROD start and seal watchdog proof x3
4e17a79e8 docs(proof): finalize PROD isolation pack with strict x3 same-context closure
6c47b0253 test(e2e): harden Playwright webServer node path
9383521a1 docs(registry): append structure reorg seal event
760e75bd3 docs(structure): canonical rules, target and migration plan
846e05b38 docs(registry): append structure audit seal event
f1b5eb378 docs(evidence): add seal tag trace to structure verdict
c83f07f75 docs(structure): audit gouvernance + gate anti-drift
429d6b457 docs: canonical markdown reorg (inventory + index + evidence)
d43248367 chore: quarantine working tree before docs reorg
8d4d43e10 docs(governance): seal V3 mapping canon and proof-pack sync
c1a781b2a docs(seal): append cleanup addendum and include remaining map docs
81ccac554 docs(map): add generated architecture/network indexes

## tree/find src-tauri/src/chat_engine
src-tauri/src/chat_engine/memory.rs
src-tauri/src/chat_engine/streaming.rs
src-tauri/src/chat_engine/mod.rs
src-tauri/src/chat_engine/config.rs
src-tauri/src/chat_engine/errors.rs
src-tauri/src/chat_engine/commands.rs
src-tauri/src/chat_engine/types.rs
src-tauri/src/chat_engine/providers.rs
src-tauri/src/chat_engine/speech.rs

## rg target patterns
src-tauri/src/chat_engine/providers.rs:69:pub fn build_ai_request(prompt: String, temperature: f32, max_tokens: usize) -> AIRequest {
src-tauri/src/chat_engine/providers.rs:72:        temperature,
src-tauri/src/chat_engine/providers.rs:90:        assert_eq!(request.temperature, 0.7);
src-tauri/src/chat_engine/providers.rs:102:    fn test_build_ai_request_zero_temperature() {
src-tauri/src/chat_engine/providers.rs:104:        assert_eq!(request.temperature, 0.0);
src-tauri/src/chat_engine/providers.rs:108:    fn test_build_ai_request_high_temperature() {
src-tauri/src/chat_engine/providers.rs:110:        assert_eq!(request.temperature, 2.0);
src-tauri/src/chat_engine/types.rs:21:pub struct ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:25:    pub temperature: f32,
src-tauri/src/chat_engine/types.rs:26:    pub max_output_tokens: usize,
src-tauri/src/chat_engine/types.rs:31:impl ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:41:        if !(0.0..=2.0).contains(&self.temperature) {
src-tauri/src/chat_engine/types.rs:45:        if self.max_output_tokens == 0 || self.max_output_tokens > 8096 {
src-tauri/src/chat_engine/types.rs:46:            return Err("max_output_tokens must be between 1 and 8096".to_string());
src-tauri/src/chat_engine/types.rs:159:    // ChatRequestPayload Tests
src-tauri/src/chat_engine/types.rs:164:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:168:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:169:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:179:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:183:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:184:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:197:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:201:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:202:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:213:    fn test_chat_request_payload_temperature_too_low() {
src-tauri/src/chat_engine/types.rs:214:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:218:            temperature: -0.5,
src-tauri/src/chat_engine/types.rs:219:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:230:    fn test_chat_request_payload_temperature_too_high() {
src-tauri/src/chat_engine/types.rs:231:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:235:            temperature: 2.5,
src-tauri/src/chat_engine/types.rs:236:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:248:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:252:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:253:            max_output_tokens: 0,
src-tauri/src/chat_engine/types.rs:260:        assert!(result.unwrap_err().contains("max_output_tokens"));
src-tauri/src/chat_engine/types.rs:265:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:269:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:270:            max_output_tokens: 10000,
src-tauri/src/chat_engine/types.rs:277:        assert!(result.unwrap_err().contains("max_output_tokens"));
src-tauri/src/chat_engine/types.rs:281:    fn test_chat_request_payload_boundary_temperature() {
src-tauri/src/chat_engine/types.rs:283:        let payload_low = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:287:            temperature: 0.0,
src-tauri/src/chat_engine/types.rs:288:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:295:        let payload_high = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:299:            temperature: 2.0,
src-tauri/src/chat_engine/types.rs:300:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:310:        let payload_min = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:314:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:315:            max_output_tokens: 1,
src-tauri/src/chat_engine/types.rs:322:        let payload_max = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:326:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:327:            max_output_tokens: 8096,
src-tauri/src/chat_engine/types.rs:336:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:340:            temperature: 0.5,
src-tauri/src/chat_engine/types.rs:341:            max_output_tokens: 500,
src-tauri/src/chat_engine/types.rs:347:        assert_eq!(cloned.temperature, 0.5);
src-tauri/src/chat_engine/types.rs:352:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:356:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:357:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:362:        assert!(debug_str.contains("ChatRequestPayload"));
src-tauri/src/chat_engine/types.rs:367:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:371:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:372:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:378:            serde_json::to_string(&payload).expect("serialize ChatRequestPayload should succeed");
src-tauri/src/chat_engine/types.rs:379:        let restored: ChatRequestPayload =
src-tauri/src/chat_engine/types.rs:380:            serde_json::from_str(&json).expect("deserialize ChatRequestPayload should succeed");
src-tauri/src/chat_engine/commands.rs:9:    ChatCompletionPayload, ChatEngine, ChatEngineError, ChatRequestPayload, EngineHealthReport,
src-tauri/src/chat_engine/commands.rs:20:    payload: ChatRequestPayload,
src-tauri/src/chat_engine/commands.rs:29:    payload: ChatRequestPayload,
src-tauri/src/chat_engine/config.rs:5:pub struct ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:15:    pub memory_flush_interval: Duration,
src-tauri/src/chat_engine/config.rs:20:impl Default for ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:27:            memory_flush_interval: Duration::from_millis(350),
src-tauri/src/chat_engine/config.rs:39:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:44:        assert_eq!(config.memory_flush_interval, Duration::from_millis(350));
src-tauri/src/chat_engine/config.rs:50:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:59:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:61:        assert!(debug_str.contains("ChatEngineConfig"));
src-tauri/src/chat_engine/config.rs:67:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:72:            memory_flush_interval: Duration::from_millis(500),
src-tauri/src/chat_engine/config.rs:84:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:91:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:92:        assert_eq!(config.memory_flush_interval.as_millis(), 350);
src-tauri/src/chat_engine/config.rs:97:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:104:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:109:            memory_flush_interval: Duration::from_millis(1),
src-tauri/src/chat_engine/config.rs:119:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:124:            memory_flush_interval: Duration::from_secs(10),
src-tauri/src/chat_engine/mod.rs:16:use streaming::{chunk_text, new_stream_channel, StreamReceiver, StreamSender};
src-tauri/src/chat_engine/mod.rs:31:pub use config::ChatEngineConfig;
src-tauri/src/chat_engine/mod.rs:35:    ChatCompletionPayload, ChatRequestPayload, EngineHealthReport, ProviderPreference, StreamChunk,
src-tauri/src/chat_engine/mod.rs:40:    config: ChatEngineConfig,
src-tauri/src/chat_engine/mod.rs:54:        config: ChatEngineConfig,
src-tauri/src/chat_engine/mod.rs:69:        mut payload: ChatRequestPayload,
src-tauri/src/chat_engine/mod.rs:95:            payload.temperature,
src-tauri/src/chat_engine/mod.rs:96:            payload.max_output_tokens,
src-tauri/src/chat_engine/mod.rs:148:        mut payload: ChatRequestPayload,
src-tauri/src/chat_engine/mod.rs:174:            payload.temperature,
src-tauri/src/chat_engine/mod.rs:175:            payload.max_output_tokens,
src-tauri/src/chat_engine/mod.rs:180:        let (sender, receiver) = new_stream_channel(32);
src-tauri/src/chat_engine/mod.rs:198:                    let chunks = chunk_text(
src-tauri/src/chat_engine/mod.rs:356:    config: Option<ChatEngineConfig>,
src-tauri/src/chat_engine/streaming.rs:8:pub fn new_stream_channel(buffer: usize) -> (StreamSender, StreamReceiver) {
src-tauri/src/chat_engine/streaming.rs:12:pub fn chunk_text(
src-tauri/src/chat_engine/streaming.rs:45:    fn test_new_stream_channel() {
src-tauri/src/chat_engine/streaming.rs:46:        let (tx, mut rx) = new_stream_channel(10);
src-tauri/src/chat_engine/streaming.rs:68:    fn test_new_stream_channel_buffer_size() {
src-tauri/src/chat_engine/streaming.rs:69:        let (tx, _rx) = new_stream_channel(3);
src-tauri/src/chat_engine/streaming.rs:95:    fn test_chunk_text_empty() {
src-tauri/src/chat_engine/streaming.rs:96:        let chunks = chunk_text("", 100, "conv", "msg");
src-tauri/src/chat_engine/streaming.rs:101:    fn test_chunk_text_single_chunk() {
src-tauri/src/chat_engine/streaming.rs:102:        let chunks = chunk_text("Hello", 100, "conv-1", "msg-1");
src-tauri/src/chat_engine/streaming.rs:113:    fn test_chunk_text_multiple_chunks() {
src-tauri/src/chat_engine/streaming.rs:115:        let chunks = chunk_text(text, 5, "conv", "msg");
src-tauri/src/chat_engine/streaming.rs:124:    fn test_chunk_text_exact_boundary() {
src-tauri/src/chat_engine/streaming.rs:126:        let chunks = chunk_text(text, 3, "conv", "msg");
src-tauri/src/chat_engine/streaming.rs:134:    fn test_chunk_text_ordinals_sequential() {
src-tauri/src/chat_engine/streaming.rs:136:        let chunks = chunk_text(&text, 10, "conv", "msg");
src-tauri/src/chat_engine/streaming.rs:145:    fn test_chunk_text_preserves_ids() {
src-tauri/src/chat_engine/streaming.rs:146:        let chunks = chunk_text("Test message", 3, "my-conv-id", "my-msg-id");
src-tauri/src/chat_engine/streaming.rs:155:    fn test_chunk_text_done_always_false() {
src-tauri/src/chat_engine/streaming.rs:156:        let chunks = chunk_text("Some text", 2, "c", "m");
src-tauri/src/chat_engine/streaming.rs:164:    fn test_chunk_text_single_char_chunks() {
src-tauri/src/chat_engine/streaming.rs:166:        let chunks = chunk_text(text, 1, "c", "m");
src-tauri/src/chat_engine/streaming.rs:175:    fn test_chunk_text_chunk_size_larger_than_text() {
src-tauri/src/chat_engine/streaming.rs:176:        let chunks = chunk_text("Hi", 1000, "c", "m");
src-tauri/src/chat_engine/streaming.rs:183:    fn test_chunk_text_unicode_handling() {
src-tauri/src/chat_engine/streaming.rs:186:        let chunks = chunk_text(text, 10, "c", "m");
src-tauri/src/chat_engine/streaming.rs:194:    fn test_chunk_text_long_text() {
src-tauri/src/chat_engine/streaming.rs:196:        let chunks = chunk_text(&text, 100, "c", "m");
src-tauri/src/chat_engine/streaming.rs:207:        let (tx, mut rx) = new_stream_channel(5);
src-tauri/src/chat_engine/streaming.rs:230:        let (tx, mut rx) = new_stream_channel(10);
src-tauri/src/chat_engine/memory.rs:96:        self.enforce_retention(conversation);
src-tauri/src/chat_engine/memory.rs:104:    fn enforce_retention(&self, conversation: &mut Conversation) {
src/__tests__/chatModes.config.test.ts:64:        expect(mode.temperature).toBeGreaterThanOrEqual(0);
src/__tests__/chatModes.config.test.ts:65:        expect(mode.temperature).toBeLessThanOrEqual(1);
src/__tests__/chatModes.config.test.ts:238:      expect(legacy.temperature).toBe(extended.temperature);
src/__tests__/chatModes.config.test.ts:258:    it('should have appropriate temperature for each mode type', () => {
src/__tests__/chatModes.config.test.ts:259:      // Creative modes should have higher temperature
src/__tests__/chatModes.config.test.ts:260:      expect(CHAT_MODES_CONFIG.brainstorming.temperature).toBeGreaterThanOrEqual(0.8);
src/__tests__/chatModes.config.test.ts:262:      // Technical modes should have lower temperature
src/__tests__/chatModes.config.test.ts:263:      expect(CHAT_MODES_CONFIG.dev.temperature).toBeLessThanOrEqual(0.6);
src/__tests__/chatModes.config.test.ts:264:      expect(CHAT_MODES_CONFIG.admin.temperature).toBeLessThanOrEqual(0.5);
src/__tests__/chatModes.config.test.ts:265:      expect(CHAT_MODES_CONFIG.audit.temperature).toBeLessThanOrEqual(0.6);
src-tauri/src/control_panel_commands.rs:49:    pub temperature: f32,
src-tauri/src/control_panel_commands.rs:117:    temperature: f32,
src-tauri/src/control_panel_commands.rs:125:            temperature: sanitize_temperature(self.temperature),
src-tauri/src/control_panel_commands.rs:135:            temperature: 0.7,
src-tauri/src/control_panel_commands.rs:154:fn sanitize_temperature(value: f32) -> f32 {
src-tauri/src/control_panel_commands.rs:247:        temperature: stored.temperature,
src-tauri/src/control_panel_commands.rs:260:        temperature,
src-tauri/src/control_panel_commands.rs:267:        temperature: sanitize_temperature(temperature),
src-tauri/src/control_panel_commands.rs:300:        "[ControlPanel] Gemini config saved (model={}, temperature={:.2}, max_tokens={})",
src-tauri/src/control_panel_commands.rs:302:        sanitized.temperature,
src-tauri/src/commands/chat_modes.rs:180:    pub temperature: f32,
src-tauri/src/commands/chat_modes.rs:194:                temperature: 0.7,
src-tauri/src/commands/chat_modes.rs:203:                temperature: 0.9,
src-tauri/src/commands/chat_modes.rs:212:                temperature: 0.5,
src-tauri/src/commands/chat_modes.rs:221:                temperature: 0.4,
src-tauri/src/commands/chat_modes.rs:231:                temperature: 0.7,
src-tauri/src/commands/ia_commands.rs:29:    pub temperature: Option<f32>,
src-tauri/src/commands/ia_commands.rs:163:        temperature: 0.0,
src-tauri/src/commands/ia_commands.rs:199:        temperature: request.temperature.unwrap_or(0.7),
src-tauri/src/commands/ai_chat.rs:156:    temperature: Option<f32>,
src-tauri/src/commands/ai_chat.rs:191:        temperature: temperature.unwrap_or(0.7),
src-tauri/src/commands/ai_chat.rs:266:    temperature: Option<f32>,
src-tauri/src/commands/ai_chat.rs:289:        temperature: temperature.unwrap_or(0.7),
src-tauri/src/commands/ai_chat.rs:334:        let chunk_text = chunk_words.join(" ");
src-tauri/src/commands/ai_chat.rs:342:                "chunk": chunk_text,
src-tauri/src/commands/ollama_command.rs:17:    pub temperature: Option<f32>,
src-tauri/src/commands/ollama_command.rs:64:    // Add temperature if provided
src-tauri/src/commands/ollama_command.rs:65:    if let Some(temp) = req.temperature {
src-tauri/src/commands/ollama_command.rs:67:            "temperature": temp,
src-tauri/src/commands/ollama_command.rs:139:            temperature: Some(0.7),
src-tauri/src/commands/ollama_command.rs:146:        assert_eq!(req.temperature, Some(0.7));
src-tauri/src/commands/tests_ai_chat.rs:217:        // Phase 1 Stabilisation: Paramètres temperature/max_tokens
src-tauri/src/commands/glm46v_commands.rs:33:    pub temperature: Option<f32>,
src-tauri/src/commands/ai_prompt_generator.rs:139:            "temperature": 0.7,
src-tauri/src/harmonia_engine.rs:26:    pub temperature: Option<f32>,
src-tauri/src/harmonia_engine.rs:124:            temperature: None, // sysinfo ne fournit pas toujours la température
src-tauri/src/harmonia_engine.rs:186:                temperature: None,
src-tauri/src/commands/copilot_commands.rs:38:    pub temperature: Option<f32>,
src-tauri/src/commands/copilot_commands.rs:152:        temperature: request.config.as_ref().and_then(|c| c.temperature),
src-tauri/src/commands/copilot_commands.rs:364:                temperature: Some(0.7),
src-tauri/src/commands/chat_generate_commands.rs:33:    pub temperature: Option<f32>,
src-tauri/src/semantic/indexer.rs:190:            let chunk_text: String = chars[start..end].iter().collect();
src-tauri/src/semantic/indexer.rs:192:            if chunk_text.trim().len() >= self.config.min_chunk_size {
src-tauri/src/semantic/indexer.rs:194:                    &chunk_text,
src-tauri/src/engines/unified_memory/summarizer.rs:321:            "temperature": 0.3
src-tauri/src/fusion_commands_week2.rs:176:    pub temperature: Option<f32>,
src-tauri/src/fusion_commands_week2.rs:222:    let temperature = request.temperature.unwrap_or(0.7);
src-tauri/src/fusion_commands_week2.rs:223:    if temperature < 0.0 || temperature > 2.0 {
src-tauri/src/fusion_commands_week2.rs:240:            format!("{}:{}:{}", model, request.prompt, temperature)
src-tauri/src/fusion_commands_week2.rs:267:        temperature
src-tauri/src/fusion_commands_week2.rs:275:            format!("{}:{}:{}", model, request.prompt, temperature)
src-tauri/src/fusion_commands_week2.rs:447:            temperature: Some(0.7),
src-tauri/src/fusion_commands_week2.rs:469:            temperature: None,
src-tauri/src/fusion_commands_week2.rs:481:    fn test_ia_response_invalid_temperature() {
src-tauri/src/fusion_commands_week2.rs:487:            temperature: Some(3.0), // Out of range
src-tauri/src/api_hub/anthropic.rs:70:            temperature: request.temperature,
src-tauri/src/api_hub/anthropic.rs:130:            temperature: request.temperature,
src-tauri/src/api_hub/anthropic.rs:195:            temperature: request.temperature,
src-tauri/src/api_hub/anthropic.rs:232:            temperature: Some(0.3),
src-tauri/src/api_hub/anthropic.rs:256:            temperature: Some(0.5),
src-tauri/src/api_hub/anthropic.rs:323:    temperature: Option<f32>,
src-tauri/src/api_hub/anthropic.rs:391:            temperature: None,
src-tauri/src/api_hub/temporal_integration_tests.rs:113:            temperature: None,
src-tauri/src/api_hub/temporal_integration_tests.rs:245:            temperature: None,
src-tauri/src/api_hub/safety_bridge.rs:414:            temperature: None,
src-tauri/src/api_hub/safety_bridge.rs:437:            temperature: None,
src-tauri/src/api_hub/safety_bridge.rs:456:            temperature: None,
src-tauri/src/api_hub/openai.rs:73:            temperature: request.temperature,
src-tauri/src/api_hub/openai.rs:129:            temperature: request.temperature,
src-tauri/src/api_hub/openai.rs:368:    temperature: Option<f32>,
src-tauri/src/api_hub/openai.rs:464:            temperature: None,
src-tauri/src/api_hub/multimodal_router.rs:128:            temperature: Some(0.7),
src-tauri/src/api_hub/multimodal_router.rs:180:                temperature: Some(0.5),
src-tauri/src/api_hub/multimodal_router.rs:215:                temperature: None,
src-tauri/src/api_hub/multimodal_router.rs:259:            temperature: Some(0.7),
src-tauri/src/api_hub/multimodal_router.rs:352:                temperature: Some(0.7),
src-tauri/src/api_hub/multimodal_router.rs:435:                temperature: Some(0.7),
src-tauri/src/api_hub/multimodal_router.rs:480:            temperature: Some(0.5),
src-tauri/src/local_provider_refactor.rs:21:    pub temperature: f32,
src-tauri/src/local_provider_refactor.rs:36:            temperature: 0.7,
src-tauri/src/local_provider_refactor.rs:88:        if !(0.0..=2.0).contains(&self.config.temperature) {
src-tauri/src/local_provider_refactor.rs:90:                format!("Invalid temperature: {} (must be 0.0-2.0)", self.config.temperature),
src-tauri/src/local_provider_refactor.rs:120:                temperature: self.config.temperature,
src-tauri/src/local_provider_refactor.rs:294:    temperature: f32,
src-tauri/src/local_provider_refactor.rs:336:    fn test_invalid_temperature() {
src-tauri/src/local_provider_refactor.rs:338:            temperature: 3.0,
src-tauri/src/api_hub/config.rs:21:    pub default_temperature: f32,
src-tauri/src/api_hub/config.rs:53:            default_temperature: 0.7,
src-tauri/src/api_hub/config.rs:246:        assert!((config.default_temperature - 0.7).abs() < 0.01);
src-tauri/src/api_hub/copilot.rs:23:    pub temperature: Option<f32>,
src-tauri/src/api_hub/copilot.rs:131:            temperature: Some(0.0),
src-tauri/src/api_hub/mod.rs:103:    pub temperature: Option<f32>,
src-tauri/src/api_hub/mod.rs:345:            temperature: None,
src-tauri/src/api_hub/mod.rs:373:            temperature: Some(0.7),
src-tauri/src/api_hub/mod.rs:398:            temperature: Some(0.5),
src-tauri/src/api_hub/router.rs:442:            temperature: None,
src-tauri/src/api_hub/router.rs:468:            temperature: None,
src-tauri/src/api_hub/router.rs:492:            temperature: None,
src-tauri/src/api_hub/router.rs:683:            temperature: None,
src-tauri/src/api_hub/router.rs:707:            temperature: None,
src-tauri/src/api_hub/router.rs:731:            temperature: None,
src-tauri/src/api_hub/router.rs:755:            temperature: None,
src-tauri/src/api_hub/gemini.rs:67:                temperature: request.temperature,
src-tauri/src/api_hub/gemini.rs:68:                max_output_tokens: request.max_tokens,
src-tauri/src/api_hub/gemini.rs:124:                temperature: request.temperature,
src-tauri/src/api_hub/gemini.rs:125:                max_output_tokens: request.max_tokens,
src-tauri/src/api_hub/gemini.rs:179:                temperature: Some(0.3),
src-tauri/src/api_hub/gemini.rs:180:                max_output_tokens: request.max_tokens,
src-tauri/src/api_hub/gemini.rs:286:                temperature: request.temperature,
src-tauri/src/api_hub/gemini.rs:287:                max_output_tokens: request.max_tokens,
src-tauri/src/api_hub/gemini.rs:413:    temperature: Option<f32>,
src-tauri/src/api_hub/gemini.rs:415:    max_output_tokens: Option<u32>,
src-tauri/src/api_hub/gemini.rs:459:            temperature: None,
src-tauri/src/conversation_engine/commands.rs:462:                temperature: 0.7,
src-tauri/src/conversation_engine/pipeline.rs:419:            temperature: config.temperature,
src-tauri/src/conversation_engine/types.rs:377:    pub temperature: f32,
src-tauri/src/conversation_engine/types.rs:395:            temperature: 0.7,
src-tauri/src/conversation_engine/types.rs:985:        assert_eq!(config.temperature, 0.7);
src-tauri/src/conversation_engine/types.rs:996:            temperature: 0.9,
src-tauri/src/conversation_engine/types.rs:1000:        assert_eq!(config.temperature, 0.9);
src-tauri/src/conversation_engine/types.rs:1008:        assert!(json.contains("temperature"));
src-tauri/src/gemini_provider_refactor.rs:18:    pub temperature: f32,
src-tauri/src/gemini_provider_refactor.rs:46:    pub temperature: f32,
src-tauri/src/gemini_provider_refactor.rs:47:    pub max_output_tokens: u32,
src-tauri/src/gemini_provider_refactor.rs:107:        if self.config.temperature < 0.0 || self.config.temperature > 2.0 {
src-tauri/src/gemini_provider_refactor.rs:109:                format!("Invalid temperature: {}. Must be 0.0-2.0", self.config.temperature)
src-tauri/src/gemini_provider_refactor.rs:166:                temperature: self.config.temperature,
src-tauri/src/gemini_provider_refactor.rs:167:                max_output_tokens: self.config.max_tokens,
src-tauri/src/gemini_provider_refactor.rs:223:                temperature: 0.1,
src-tauri/src/gemini_provider_refactor.rs:224:                max_output_tokens: 10,
src-tauri/src/gemini_provider_refactor.rs:270:            temperature: 0.7,
src-tauri/src/gemini_provider_refactor.rs:283:            temperature: 0.7,
src-tauri/src/gemini_provider_refactor.rs:294:    fn test_invalid_temperature() {
src-tauri/src/gemini_provider_refactor.rs:298:            temperature: 3.0, // Invalid: > 2.0
src-tauri/src/gemini_provider_refactor.rs:313:            temperature: 0.7,
src-tauri/src/gemini_provider_refactor.rs:341:            temperature: 0.7,
src-tauri/src/gemini_provider_refactor.rs:361:            temperature: 0.7,
src-tauri/src/ia/anthropic_claude.rs:23:    pub temperature: f32,
src-tauri/src/ia/anthropic_claude.rs:50:    temperature: f32,
src-tauri/src/ia/anthropic_claude.rs:107:            temperature: request.temperature.clamp(0.0, 1.0),
src-tauri/src/ia/unified_engine.rs:63:    pub temperature: f32,
src-tauri/src/ia/unified_engine.rs:219:            temperature: request.temperature,
src-tauri/src/ia/unified_engine.rs:252:            temperature: request.temperature,
src-tauri/src/ia/unified_engine.rs:271:        // - Mapping: Convert UnifiedIARequest → AIRequest (prompt, model, temperature)
src-tauri/src/ia/openai_gpt.rs:22:    pub temperature: f32,
src-tauri/src/ia/openai_gpt.rs:46:    temperature: f32,
src-tauri/src/ia/openai_gpt.rs:113:            temperature: request.temperature.clamp(0.0, 2.0),
src-tauri/src/ollama_provider_refactor.rs:19:    pub temperature: f32,
src-tauri/src/ollama_provider_refactor.rs:30:            temperature: 0.7,
src-tauri/src/ollama_provider_refactor.rs:50:    pub temperature: f32,
src-tauri/src/ollama_provider_refactor.rs:122:        if config.temperature < 0.0 || config.temperature > 2.0 {
src-tauri/src/ollama_provider_refactor.rs:124:                format!("Invalid temperature: {} (must be 0.0-2.0)", config.temperature)
src-tauri/src/ollama_provider_refactor.rs:148:                temperature: self.config.temperature,
src-tauri/src/ollama_provider_refactor.rs:370:    fn test_ollama_invalid_config_temperature() {
src-tauri/src/ollama_provider_refactor.rs:372:            temperature: 3.0, // Invalid: >2.0
src-tauri/src/main.rs:836:                            temperature: 0.7,
src-tauri/src/singularity_state/layers.rs:60:    pub temperature: f32,           // Celsius
src-tauri/src/singularity_state/layers.rs:72:            temperature: 0.0,
src-tauri/src/singularity_state/layers.rs:450:        assert_eq!(state.temperature, 0.0);
src-tauri/src/singularity_state/layers.rs:462:            temperature: 45.0,
src-tauri/src/overdrive/semantic_kernel.rs:193:    //   - temperature: 0.7 (balanced creativity/determinism)
src-tauri/src/mock_commands.rs:43:    pub temperature: Option<f32>,
src-tauri/src/mock_commands.rs:44:    pub max_output_tokens: Option<u32>,
src-tauri/src/mock_commands.rs:106:        "temperature": 0.0,
src-tauri/src/mock_commands.rs:356:    let chunk_text = response_text.clone();
src-tauri/src/mock_commands.rs:363:            "content": chunk_text,
src-tauri/src/mock_commands.rs:504:            "temperature": 55.0,
src-tauri/src/mock_commands.rs:562:            "temperature": 55.0,
src-tauri/src/mock_commands.rs:652:            "temperature": 50.0,
src-tauri/src/overdrive/chat_orchestrator.rs:719:            "temperature": 0.7,
src-tauri/src/overdrive/chat_orchestrator.rs:864:            "temperature": 0.7,
src-tauri/src/overdrive/chat_orchestrator.rs:968:        "temperature": 0.7,
src-tauri/src/overdrive/chat_orchestrator.rs:1120:        "temperature": 0.7,
src-tauri/src/overdrive/chat_orchestrator.rs:1549:    _temperature: Option<f32>,
src-tauri/src/overdrive/chat_orchestrator.rs:1580:    _temperature: Option<f32>,
src-tauri/src/overdrive/chat_orchestrator.rs:1684:    for chunk_text in full_content
src-tauri/src/overdrive/chat_orchestrator.rs:1689:        let chunk: String = chunk_text.iter().collect();
src-tauri/src/overdrive/chat_orchestrator.rs:1783:            "temperature": 0.7,
src-tauri/src/config/presets.rs:71:    let chat_engine = super::ChatEngineConfig::default();
src-tauri/src/config/io.rs:15:use super::{ChatEngineConfig, ConfigSnapshot, RuntimeConfig};
src-tauri/src/config/io.rs:71:    let chat_engine = ChatEngineConfig::default();
src-tauri/src/config/io.rs:145:    super::update::validate_temperature(config.chat_engine.temperature)?;
src-tauri/src/config/update.rs:26: * ChatEngineConfigUpdate
src-tauri/src/config/update.rs:28: * Structure pour mettre à jour la ChatEngineConfig
src-tauri/src/config/update.rs:32:pub struct ChatEngineConfigUpdate {
src-tauri/src/config/update.rs:36:    pub temperature: Option<f32>,
src-tauri/src/config/update.rs:135:pub fn validate_temperature(temperature: f32) -> Result<(), String> {
src-tauri/src/config/update.rs:136:    if temperature < 0.0 {
src-tauri/src/config/update.rs:140:    if temperature > 2.0 {
src-tauri/src/config/update.rs:202:/// (nécessiterait un state management pour ChatEngineConfig).
src-tauri/src/config/update.rs:211:pub async fn update_chat_engine_config(update: ChatEngineConfigUpdate) -> Result<(), String> {
src-tauri/src/config/update.rs:230:    if let Some(temperature) = update.temperature {
src-tauri/src/config/update.rs:231:        validate_temperature(temperature)?;
src-tauri/src/config/update.rs:232:        log::info!("✅ [CONFIG] Temperature validated: {}", temperature);
src-tauri/src/config/update.rs:236:    // - State: Store in global ChatEngineConfig singleton wrapped in Arc<RwLock>
src-tauri/src/config/update.rs:238:    //   * Update: CHAT_CONFIG.write().await.set_temperature(temperature);
src-tauri/src/config/update.rs:304:    fn test_validate_temperature() {
src-tauri/src/config/update.rs:305:        assert!(validate_temperature(0.0).is_ok());
src-tauri/src/config/update.rs:306:        assert!(validate_temperature(0.7).is_ok());
src-tauri/src/config/update.rs:307:        assert!(validate_temperature(1.0).is_ok());
src-tauri/src/config/update.rs:308:        assert!(validate_temperature(2.0).is_ok());
src-tauri/src/config/update.rs:309:        assert!(validate_temperature(-0.1).is_err());
src-tauri/src/config/update.rs:310:        assert!(validate_temperature(2.5).is_err());
src-tauri/src/config/mod.rs:35:pub struct ChatEngineConfig {
src-tauri/src/config/mod.rs:39:    pub temperature: f32,
src-tauri/src/config/mod.rs:42:impl Default for ChatEngineConfig {
src-tauri/src/config/mod.rs:48:            temperature: 0.7,
src-tauri/src/config/mod.rs:62:    pub chat_engine: ChatEngineConfig,
src-tauri/src/config/mod.rs:71:    pub fn new(runtime: RuntimeConfig, chat_engine: ChatEngineConfig) -> Self {
src-tauri/src/config/mod.rs:120:    let chat_engine = ChatEngineConfig::default();
src-tauri/src/config/mod.rs:157:        let chat = ChatEngineConfig::default();
src/__tests__/omega/conversation-manager.test.ts:203:      temperature: 0.9,
src/__tests__/omega/conversation-manager.test.ts:209:    expect(() => conversationManager.updateConfig({ temperature: 0.5 })).not.toThrow();
src-tauri/src/cycle_engine/cognitive_rhythm.rs:19:    pub creative_temperature: f32, // 0.0 - 1.0 (randomness)
src-tauri/src/cycle_engine/cognitive_rhythm.rs:31:                creative_temperature: 0.8,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:39:                creative_temperature: 0.3,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:47:                creative_temperature: 0.5,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:55:                creative_temperature: 0.4,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:63:                creative_temperature: 0.6,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:71:                creative_temperature: 0.2,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:106:        assert_eq!(params.creative_temperature, 0.8);
src-tauri/src/cycle_engine/cognitive_rhythm.rs:286:    fn test_creative_temperature_range() {
src-tauri/src/cycle_engine/cognitive_rhythm.rs:299:            assert!(params.creative_temperature >= 0.0 && params.creative_temperature <= 1.0);
src-tauri/src/cycle_engine/omega_integration.rs:49:            creativity_weight: rhythm.creative_temperature,
src-tauri/src/cycle_engine/commands.rs.disabled:80:    pub creative_temperature: f32,
src-tauri/src/cycle_engine/commands.rs.disabled:100:        creative_temperature: rhythm.creative_temperature,
src-tauri/src/ai/cache.rs:127:    fn generate_cache_key(prompt: &str, temperature: f32, max_tokens: u32) -> u64 {
src-tauri/src/ai/cache.rs:130:        temperature.to_bits().hash(&mut hasher);
src-tauri/src/ai/cache.rs:139:        temperature: f32,
src-tauri/src/ai/cache.rs:146:        let key = Self::generate_cache_key(prompt, temperature, max_tokens);
src-tauri/src/ai/cache.rs:182:        temperature: f32,
src-tauri/src/ai/cache.rs:190:        let key = Self::generate_cache_key(prompt, temperature, max_tokens);
src-tauri/src/ai/api.rs:25:    temperature: Option<f32>,
src-tauri/src/ai/api.rs:36:        temperature,
src-tauri/src/ai/api.rs:64:        temperature: None,
src-tauri/src/ai/api.rs:95:        temperature: None,
src-tauri/src/ai/api.rs:147:        temperature: None,
src-tauri/src/ai/orchestrator_multi.rs:296:            temperature: Some(0.7),
src-tauri/src/ai/fusion.rs:79:                temperature_used: primary.metadata.temperature_used,
src-tauri/src/ai/fusion.rs:113:                temperature_used: primary.metadata.temperature_used,
src-tauri/src/ai/fusion.rs:139:                temperature_used: primary.metadata.temperature_used,
src-tauri/src/ai/fusion.rs:205:                temperature_used: Some(0.7),
src/test/setup.ts:518:        physical: { battery: 0.78, temperature: 36.8 },
src-tauri/src/ai/providers/claude.rs:44:        temperature: f32,
src-tauri/src/ai/providers/claude.rs:54:            temperature,
src-tauri/src/ai/providers/claude.rs:97:        let temperature = req.temperature.unwrap_or(0.7);
src-tauri/src/ai/providers/claude.rs:101:            .call_claude_api(model, &req.prompt, temperature, max_tokens)
src-tauri/src/ai/providers/claude.rs:122:                temperature_used: Some(temperature),
src-tauri/src/ai/providers/claude.rs:158:    temperature: f32,
src-tauri/src/ai/providers/titane_engine.rs:176:                temperature_used: Some(0.7),
src-tauri/src/ai/providers/titane_engine.rs:238:            temperature: None,
src-tauri/src/ai/providers/openai.rs:44:        temperature: f32,
src-tauri/src/ai/providers/openai.rs:54:            temperature,
src-tauri/src/ai/providers/openai.rs:96:        let temperature = req.temperature.unwrap_or(0.7);
src-tauri/src/ai/providers/openai.rs:100:            .call_openai_api(model, &req.prompt, temperature, max_tokens)
src-tauri/src/ai/providers/openai.rs:120:                temperature_used: Some(temperature),
src-tauri/src/ai/providers/openai.rs:155:    temperature: f32,
src-tauri/src/ai/providers/local.rs:47:        temperature: f32,
src-tauri/src/ai/providers/local.rs:53:            options: OllamaOptions { temperature },
src-tauri/src/ai/providers/local.rs:89:        let temperature = req.temperature.unwrap_or(0.7);
src-tauri/src/ai/providers/local.rs:92:            .call_ollama_api(model, &req.prompt, temperature)
src-tauri/src/ai/providers/local.rs:111:                temperature_used: Some(temperature),
src-tauri/src/ai/providers/local.rs:159:    temperature: f32,
src-tauri/src/ai/router_intelligent.rs:221:            temperature: None,
src-tauri/src/ai/router_intelligent.rs:246:            temperature: None,
src-tauri/src/ai/router_intelligent.rs:263:            temperature: None,
src-tauri/src/ai/mod.rs:37:    pub temperature: Option<f32>,
src-tauri/src/ai/mod.rs:81:    pub temperature_used: Option<f32>,
src-tauri/src/ai/mod.rs:96:    pub temperature: f32,
src-tauri/src/ai/evaluator.rs:294:            temperature: None,
src/utils/tauriProtector.ts:32:      temperature: 0,
src-tauri/src/ai/router.rs:138:                request.temperature,
src-tauri/src/ai/router.rs:168:            request.temperature,
src-tauri/src/ai/router.rs:179:                request.temperature,
src-tauri/src/ai/router.rs:210:                temperature: request.temperature,
src-tauri/src/ai/router.rs:336:                temperature: request.temperature,
src-tauri/src/ai/gemini.rs:33:    temperature: f32,
src-tauri/src/ai/gemini.rs:35:    max_output_tokens: usize,
src-tauri/src/ai/gemini.rs:105:                temperature: request.temperature,
src-tauri/src/ai/gemini.rs:106:                max_output_tokens: request.max_tokens,
src-tauri/src/ai/gemini.rs:152:        // - Event emission: Emit tauri event for each chunk: emit("gemini:stream", chunk_text)
src-tauri/src/ai/ollama.rs:75:    pub temperature: Option<f32>,
src-tauri/src/ai/ollama.rs:162:    if let Some(temp) = request.temperature {
src-tauri/src/ai/ollama.rs:163:        options.insert("temperature".to_string(), serde_json::json!(temp));
src-tauri/src/ai/ollama.rs:224:    if let Some(temp) = request.temperature {
src-tauri/src/ai/ollama.rs:225:        options.insert("temperature".to_string(), serde_json::json!(temp));
src-tauri/src/ai/ollama.rs:346:        temperature: None,
src-tauri/src/ai/ollama.rs:458:    temperature: f32,
src-tauri/src/ai/ollama.rs:523:                temperature: request.temperature,
src-tauri/src/control_panel_commands/tests.rs:123:        assert!((0.0..=1.0).contains(&config.temperature));
src-tauri/src/control_panel_commands/tests.rs:142:            temperature: 0.7,
src-tauri/src/control_panel_commands/tests.rs:152:        assert!((stored.temperature - 0.7).abs() < f32::EPSILON);
src-tauri/src/control_panel_commands/tests.rs:179:            temperature: 0.3,
src-tauri/src/control_panel_commands/tests.rs:190:            temperature: 0.6,
src-tauri/src/control_panel_commands/tests.rs:201:        assert!((stored.temperature - 0.6).abs() < f32::EPSILON);
src/pages/ConfigurationHub.tsx:27:interface ChatEngineConfig {
src/pages/ConfigurationHub.tsx:31:  temperature: number;
src/pages/ConfigurationHub.tsx:36:  chat_engine: ChatEngineConfig;
src/pages/ConfigurationHub.tsx:54:  const [editedChatEngine, setEditedChatEngine] = useState<Partial<ChatEngineConfig>>({});
src/pages/ConfigurationHub.tsx:117:    field: keyof ChatEngineConfig,
src/pages/ConfigurationHub.tsx:156:        await tauriClient.updateChatEngineConfig({
src/pages/ConfigurationHub.tsx:183:        setValidationErrors({ 'chat_engine.temperature': errorMsg });
src/pages/ConfigurationHub.tsx:402:    temperature: editedChatEngine.temperature ?? config.chat_engine.temperature,
src/pages/ConfigurationHub.tsx:748:                value={currentChatEngine.temperature}
src/pages/ConfigurationHub.tsx:753:                onChange={value => handleChatEngineFieldChange('temperature', value)}
src/pages/ConfigurationHub.tsx:754:                validationError={validationErrors['chat_engine.temperature']}
src/components/ChatDiagnostic.tsx:353:        temperature?: number;
src/components/ChatDiagnostic.tsx:359:        temperature: payload.temperature,
src/pages/Helios.tsx:28:  temperature?: number;
src/pages/Helios.tsx:99:        {metrics?.temperature !== undefined && (
src/pages/Helios.tsx:103:            value={extractNumber(metrics.temperature, 0)}
src/components/psyche/DeepPsychePanel.tsx:390:                        {energyFieldState.temperatureText}
src/core/ARCHITECTURE_TYPES_v∞.ts:163:  temperature: number;
src/core/ARCHITECTURE_TYPES_v∞.ts:220:  temperature: number;
src/core/ARCHITECTURE_TYPES_v∞.ts:321:  temperature?: number;
src/pages/Stats.tsx:40:  temperature?: number;
src/pages/Stats.tsx:143:  const temperature = extractNumber(heliosMetrics?.temperature);
src/pages/Stats.tsx:257:          {temperature !== undefined && temperature > 0 && (
src/pages/Stats.tsx:260:              value={`${temperature.toFixed(1)}°C`}
src/pages/Stats.tsx:263:              variant={temperature < 70 ? 'success' : 'warning'}
src/types/singularityState.ts:112:  temperature: number;
src/types/aiModel.ts:40:    temperature?: number;
src/types/aiModel.ts:72:      temperature: 0.7,
src/types/aiModel.ts:86:      temperature: 0.7,
src/types/aiModel.ts:100:      temperature: 0.7,
src/types/aiModel.ts:115:      temperature: 0.7,
src/types/aiModel.ts:205:  temperature?: number;
src-tauri/src/chat_engine/providers.rs:69:pub fn build_ai_request(prompt: String, temperature: f32, max_tokens: usize) -> AIRequest {
src-tauri/src/chat_engine/providers.rs:72:        temperature,
src-tauri/src/chat_engine/providers.rs:90:        assert_eq!(request.temperature, 0.7);
src-tauri/src/chat_engine/providers.rs:102:    fn test_build_ai_request_zero_temperature() {
src-tauri/src/chat_engine/providers.rs:104:        assert_eq!(request.temperature, 0.0);
src-tauri/src/chat_engine/providers.rs:108:    fn test_build_ai_request_high_temperature() {
src-tauri/src/chat_engine/providers.rs:110:        assert_eq!(request.temperature, 2.0);
src-tauri/src/chat_engine/types.rs:21:pub struct ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:25:    pub temperature: f32,
src-tauri/src/chat_engine/types.rs:26:    pub max_output_tokens: usize,
src-tauri/src/chat_engine/types.rs:31:impl ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:41:        if !(0.0..=2.0).contains(&self.temperature) {
src-tauri/src/chat_engine/types.rs:45:        if self.max_output_tokens == 0 || self.max_output_tokens > 8096 {
src-tauri/src/chat_engine/types.rs:46:            return Err("max_output_tokens must be between 1 and 8096".to_string());
src-tauri/src/chat_engine/types.rs:159:    // ChatRequestPayload Tests
src-tauri/src/chat_engine/types.rs:164:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:168:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:169:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:179:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:183:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:184:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:197:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:201:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:202:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:213:    fn test_chat_request_payload_temperature_too_low() {
src-tauri/src/chat_engine/types.rs:214:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:218:            temperature: -0.5,
src-tauri/src/chat_engine/types.rs:219:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:230:    fn test_chat_request_payload_temperature_too_high() {
src-tauri/src/chat_engine/types.rs:231:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:235:            temperature: 2.5,
src-tauri/src/chat_engine/types.rs:236:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:248:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:252:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:253:            max_output_tokens: 0,
src-tauri/src/chat_engine/types.rs:260:        assert!(result.unwrap_err().contains("max_output_tokens"));
src-tauri/src/chat_engine/types.rs:265:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:269:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:270:            max_output_tokens: 10000,
src-tauri/src/chat_engine/types.rs:277:        assert!(result.unwrap_err().contains("max_output_tokens"));
src-tauri/src/chat_engine/types.rs:281:    fn test_chat_request_payload_boundary_temperature() {
src-tauri/src/chat_engine/types.rs:283:        let payload_low = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:287:            temperature: 0.0,
src-tauri/src/chat_engine/types.rs:288:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:295:        let payload_high = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:299:            temperature: 2.0,
src-tauri/src/chat_engine/types.rs:300:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:310:        let payload_min = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:314:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:315:            max_output_tokens: 1,
src-tauri/src/chat_engine/types.rs:322:        let payload_max = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:326:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:327:            max_output_tokens: 8096,
src-tauri/src/chat_engine/types.rs:336:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:340:            temperature: 0.5,
src-tauri/src/chat_engine/types.rs:341:            max_output_tokens: 500,
src-tauri/src/chat_engine/types.rs:347:        assert_eq!(cloned.temperature, 0.5);
src-tauri/src/chat_engine/types.rs:352:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:356:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:357:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:362:        assert!(debug_str.contains("ChatRequestPayload"));
src-tauri/src/chat_engine/types.rs:367:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:371:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:372:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:378:            serde_json::to_string(&payload).expect("serialize ChatRequestPayload should succeed");
src-tauri/src/chat_engine/types.rs:379:        let restored: ChatRequestPayload =
src-tauri/src/chat_engine/types.rs:380:            serde_json::from_str(&json).expect("deserialize ChatRequestPayload should succeed");
src/core/STATE_ARCHITECTURE.ts:44: * - physical: { cpu, ram, disk, network, temperature }
src-tauri/src/chat_engine/commands.rs:9:    ChatCompletionPayload, ChatEngine, ChatEngineError, ChatRequestPayload, EngineHealthReport,
src-tauri/src/chat_engine/commands.rs:20:    payload: ChatRequestPayload,
src-tauri/src/chat_engine/commands.rs:29:    payload: ChatRequestPayload,
src/components/physiological/PhysiologicalPanel.tsx:527:    <div className="temperature-bar-container">
src/components/physiological/PhysiologicalPanel.tsx:528:      <div className="temperature-bar">
src/components/physiological/PhysiologicalPanel.tsx:529:        <div className="temperature-gradient" />
src/components/physiological/PhysiologicalPanel.tsx:530:        <div className="temperature-indicator" style={{ left: `${position * 100}%` }} />
src/components/physiological/PhysiologicalPanel.tsx:532:      <div className="temperature-labels">
src-tauri/src/chat_engine/config.rs:5:pub struct ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:15:    pub memory_flush_interval: Duration,
src-tauri/src/chat_engine/config.rs:20:impl Default for ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:27:            memory_flush_interval: Duration::from_millis(350),
src-tauri/src/chat_engine/config.rs:39:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:44:        assert_eq!(config.memory_flush_interval, Duration::from_millis(350));
src-tauri/src/chat_engine/config.rs:50:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:59:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:61:        assert!(debug_str.contains("ChatEngineConfig"));
src-tauri/src/chat_engine/config.rs:67:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:72:            memory_flush_interval: Duration::from_millis(500),
src-tauri/src/chat_engine/config.rs:84:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:91:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:92:        assert_eq!(config.memory_flush_interval.as_millis(), 350);
src-tauri/src/chat_engine/config.rs:97:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:104:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:109:            memory_flush_interval: Duration::from_millis(1),
src-tauri/src/chat_engine/config.rs:119:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:124:            memory_flush_interval: Duration::from_secs(10),
src/components/physiological/PhysiologicalPanel.css:324:.temperature-bar-container {
src/components/physiological/PhysiologicalPanel.css:328:.temperature-bar {
src/components/physiological/PhysiologicalPanel.css:336:.temperature-gradient {
src/components/physiological/PhysiologicalPanel.css:342:.temperature-indicator {
src/components/physiological/PhysiologicalPanel.css:354:.temperature-labels {
src/core/services/index.ts:28:  ChatEngineConfig,
src-tauri/src/chat_engine/mod.rs:16:use streaming::{chunk_text, new_stream_channel, StreamReceiver, StreamSender};
src-tauri/src/chat_engine/mod.rs:31:pub use config::ChatEngineConfig;
src-tauri/src/chat_engine/mod.rs:35:    ChatCompletionPayload, ChatRequestPayload, EngineHealthReport, ProviderPreference, StreamChunk,
src-tauri/src/chat_engine/mod.rs:40:    config: ChatEngineConfig,
src-tauri/src/chat_engine/mod.rs:54:        config: ChatEngineConfig,
src-tauri/src/chat_engine/mod.rs:69:        mut payload: ChatRequestPayload,
src-tauri/src/chat_engine/mod.rs:95:            payload.temperature,
src-tauri/src/chat_engine/mod.rs:96:            payload.max_output_tokens,
src-tauri/src/chat_engine/mod.rs:148:        mut payload: ChatRequestPayload,
src-tauri/src/chat_engine/mod.rs:174:            payload.temperature,
src-tauri/src/chat_engine/mod.rs:175:            payload.max_output_tokens,
src-tauri/src/chat_engine/mod.rs:180:        let (sender, receiver) = new_stream_channel(32);
src-tauri/src/chat_engine/mod.rs:198:                    let chunks = chunk_text(
src-tauri/src/chat_engine/mod.rs:356:    config: Option<ChatEngineConfig>,
src-tauri/src/chat_engine/streaming.rs:8:pub fn new_stream_channel(buffer: usize) -> (StreamSender, StreamReceiver) {
src-tauri/src/chat_engine/streaming.rs:12:pub fn chunk_text(
src-tauri/src/chat_engine/streaming.rs:45:    fn test_new_stream_channel() {
src-tauri/src/chat_engine/streaming.rs:46:        let (tx, mut rx) = new_stream_channel(10);
src-tauri/src/chat_engine/streaming.rs:68:    fn test_new_stream_channel_buffer_size() {
src-tauri/src/chat_engine/streaming.rs:69:        let (tx, _rx) = new_stream_channel(3);
src-tauri/src/chat_engine/streaming.rs:95:    fn test_chunk_text_empty() {
src-tauri/src/chat_engine/streaming.rs:96:        let chunks = chunk_text("", 100, "conv", "msg");
src-tauri/src/chat_engine/streaming.rs:101:    fn test_chunk_text_single_chunk() {
src-tauri/src/chat_engine/streaming.rs:102:        let chunks = chunk_text("Hello", 100, "conv-1", "msg-1");
src-tauri/src/chat_engine/streaming.rs:113:    fn test_chunk_text_multiple_chunks() {
src-tauri/src/chat_engine/streaming.rs:115:        let chunks = chunk_text(text, 5, "conv", "msg");
src-tauri/src/chat_engine/streaming.rs:124:    fn test_chunk_text_exact_boundary() {
src-tauri/src/chat_engine/streaming.rs:126:        let chunks = chunk_text(text, 3, "conv", "msg");
src-tauri/src/chat_engine/streaming.rs:134:    fn test_chunk_text_ordinals_sequential() {
src-tauri/src/chat_engine/streaming.rs:136:        let chunks = chunk_text(&text, 10, "conv", "msg");
src-tauri/src/chat_engine/streaming.rs:145:    fn test_chunk_text_preserves_ids() {
src-tauri/src/chat_engine/streaming.rs:146:        let chunks = chunk_text("Test message", 3, "my-conv-id", "my-msg-id");
src-tauri/src/chat_engine/streaming.rs:155:    fn test_chunk_text_done_always_false() {
src-tauri/src/chat_engine/streaming.rs:156:        let chunks = chunk_text("Some text", 2, "c", "m");
src-tauri/src/chat_engine/streaming.rs:164:    fn test_chunk_text_single_char_chunks() {
src-tauri/src/chat_engine/streaming.rs:166:        let chunks = chunk_text(text, 1, "c", "m");
src-tauri/src/chat_engine/streaming.rs:175:    fn test_chunk_text_chunk_size_larger_than_text() {
src-tauri/src/chat_engine/streaming.rs:176:        let chunks = chunk_text("Hi", 1000, "c", "m");
src-tauri/src/chat_engine/streaming.rs:183:    fn test_chunk_text_unicode_handling() {
src-tauri/src/chat_engine/streaming.rs:186:        let chunks = chunk_text(text, 10, "c", "m");
src-tauri/src/chat_engine/streaming.rs:194:    fn test_chunk_text_long_text() {
src-tauri/src/chat_engine/streaming.rs:196:        let chunks = chunk_text(&text, 100, "c", "m");
src-tauri/src/chat_engine/streaming.rs:207:        let (tx, mut rx) = new_stream_channel(5);
src-tauri/src/chat_engine/streaming.rs:230:        let (tx, mut rx) = new_stream_channel(10);
src-tauri/src/chat_engine/memory.rs:96:        self.enforce_retention(conversation);
src-tauri/src/chat_engine/memory.rs:104:    fn enforce_retention(&self, conversation: &mut Conversation) {
src/ui/pages/ChatIA/ModeEditor.tsx:234:          temperature: 0.7,
src/core/singularity/SingularityFusionCore.ts:65:    temperature: number;
src/core/singularity/SingularityFusionCore.ts:261:        temperature: 0.0,
src/core/singularity/SingularityFusionCore.ts:511:          (this.state.physical.temperature / 100) * 0.3)
src/types/tauri.ts:96:  temperature?: number;
src/types/conversation.ts:60:  temperature: number;
src/components/conversation/ModeBuilder.tsx:24:  temperature: number;
src/components/conversation/ModeBuilder.tsx:56:    temperature: 0.7,
src/components/conversation/ModeBuilder.tsx:223:      temperature: mode.temperature || 0.7,
src/components/conversation/ModeBuilder.tsx:351:                value={mode.temperature || 0.7}
src/components/conversation/ModeBuilder.tsx:353:                  setMode(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))
src/components/conversation/ModeBuilder.tsx:356:              <span className="temperature-value">{mode.temperature?.toFixed(1)}</span>
src/components/conversation/ModeBuilder.tsx:396:                <span>Température: {mode.temperature}</span>
src/components/conversation/ModeBuilder.css:289:.temperature-value {
src/core/types/cognitive.types.ts:98:  temperature?: number;
src/core/types/system.types.ts:84:    temperature?: number; // °C
src/ui/pages/ControlPanel/sections/AISection.tsx:14:  temperature: number;
src/ui/pages/ControlPanel/sections/AISection.tsx:24:  temperature: 0.7,
src/ui/pages/ControlPanel/sections/AISection.tsx:39:    temperature: DEFAULT_CONFIG.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:71:        temperature: aiConfig.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:77:        temperature: aiConfig.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:158:        temperature: config.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:167:        temperature: payload.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:190:          temperature: config.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:198:        temperature: config.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:214:      !Number.isFinite(config.temperature) ||
src/ui/pages/ControlPanel/sections/AISection.tsx:215:      config.temperature < 0 ||
src/ui/pages/ControlPanel/sections/AISection.tsx:216:      config.temperature > 1
src/ui/pages/ControlPanel/sections/AISection.tsx:228:  }, [config.temperature, config.max_tokens]);
src/ui/pages/ControlPanel/sections/AISection.tsx:237:    if (Math.abs(config.temperature - persistedConfig.temperature) > Number.EPSILON) {
src/ui/pages/ControlPanel/sections/AISection.tsx:247:    config.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:250:    persistedConfig.temperature,
src/ui/pages/ControlPanel/sections/AISection.tsx:314:              Température: {config.temperature.toFixed(1)}
src/ui/pages/ControlPanel/sections/AISection.tsx:321:              value={config.temperature}
src/ui/pages/ControlPanel/sections/AISection.tsx:323:                setConfig({ ...config, temperature: parseFloat(e.target.value) })
src/modules/fusion/DatasetBuilder.ts:303:PARAMETER temperature 0.7
src/core/prompts/providers.ts:13:    temperature: 0.4,
src/core/prompts/providers.ts:19:    temperature: 0.5,
src/core/prompts/providers.ts:25:    temperature: 0.55,
src/core/prompts/providers.ts:31:    temperature: 0.5,
src/core/prompts/providers.ts:37:    temperature: 0.6,
src/core/prompts/providers.ts:43:    temperature: 0.4,
src/core/prompts/types.ts:51:  temperature?: number;
src/hooks/useDeepPsyche.ts:290:  temperatureText: string;
src/hooks/useDeepPsyche.ts:295:    energyField.temperature < -0.3
src/hooks/useDeepPsyche.ts:297:      : energyField.temperature < 0.3
src/hooks/useDeepPsyche.ts:299:        : energyField.temperature < 0.7
src/hooks/useDeepPsyche.ts:305:    isCold: energyField.temperature < -0.3,
src/hooks/useDeepPsyche.ts:306:    isWarm: energyField.temperature >= 0.3 && energyField.temperature < 0.7,
src/hooks/useDeepPsyche.ts:307:    isHot: energyField.temperature >= 0.7,
src/hooks/useDeepPsyche.ts:308:    temperatureText: tempText,
src/components/chat/ModeBadge.tsx:46:  temperature: number | string;
src/components/chat/ModeBadge.tsx:54:  temperature,
src/components/chat/ModeBadge.tsx:65:        <span className="mode-badge__tooltip-temp">🌡️ Temp: {temperature}</span>
src/components/chat/ModeBadge.tsx:154:          temperature={modeConfig.temperature}
src/modules/devSudo/devSudoHandler.ts:2620:        temperature: 0.7,
src/services/aiChatClient.ts:90:   * @param options Options (model, temperature, etc.)
src/services/aiChatClient.ts:98:      temperature?: number;
src/services/aiChatClient.ts:168:      temperature?: number;
src/modules/devSudo/devSudoSingularityHandlers.ts:278:   • Paramètres: Logic depth, temperature
src/modules/performance/AdvancedPerformanceMonitor.ts:43:  temperature?: number; // Celsius
src/services/api/chat.ts:134:  temperature?: number;
src/services/tauri/chatEngine.commands.ts:29:  temperature: 0.7,
src/services/tauri/chatEngine.commands.ts:65:  temperature?: number;
src/services/tauri/chatEngine.commands.ts:173:    temperature: args.temperature ?? DEFAULTS.temperature,
src/services/tauri/chatEngine.commands.ts:174:    max_output_tokens: args.maxOutputTokens ?? DEFAULTS.maxTokens,
src/services/conversationEngine.ts:94:    temperature: number;
src/modules/devSudo/devSudoBuiltins.ts:537:        temperature: 0.7,
src/modules/dataCollector/DataCollectorEngine.ts:523:PARAMETER temperature 0.7
src/types/ai.d.ts:44:  temperature?: number;
src/lib/fusion/commands-week2.ts:29: *   temperature: 0.7,
src/lib/fusion/commands-week2.ts:73:    temperature?: number;
src/lib/fusion/commands-week2.ts:96:    temperature?: number;
src/lib/fusion/commands-week2.ts:120:    temperature?: number;
src/types/backend.d.ts:113:  temperature?: number;
src/services/ai/__tests__/ConversationManager.test.ts:224:        temperature: 0.5,
src/services/ai/__tests__/ConversationManager.test.ts:229:      expect(config.temperature).toBe(0.5);
src/services/ai/__tests__/ConversationManager.test.ts:234:      manager.updateConfig({ temperature: 0.9 });
src/services/ai/__tests__/ConversationManager.test.ts:237:      expect(config.temperature).toBe(0.9);
src/lib/fusion/types-week2.ts:22:  temperature?: number;
src/services/ai/transports/ollamaTransport.ts:42:  temperature?: number;
src/services/ai/transports/ollamaTransport.ts:167:        temperature: req.temperature,
src/lib/tauriClient.ts:2756:  async updateChatEngineConfig(params?: unknown): Promise<unknown> {
src/services/ai/gateway/types.ts:80:    temperature?: number;
src/engines/embodiment/embodiedPresenceEngine.ts:108:  temperature: number;
src/engines/embodiment/embodiedPresenceEngine.ts:231:        temperature: 0,
src/engines/embodiment/embodiedPresenceEngine.ts:392:        this.state.energyField.temperature = -0.2;
src/engines/embodiment/embodiedPresenceEngine.ts:398:        this.state.energyField.temperature = 0.5;
src/engines/embodiment/embodiedPresenceEngine.ts:404:        this.state.energyField.temperature = 0.7;
src/engines/embodiment/embodiedPresenceEngine.ts:410:        this.state.energyField.temperature = -0.1;
src/services/ai/chatModes.ts:21:  temperature: number;
src/services/ai/chatModes.ts:32:    temperature: 0.7,
src/services/ai/chatModes.ts:60:    temperature: 0.9,
src/services/ai/chatModes.ts:88:    temperature: 0.7,
src/services/ai/chatModes.ts:116:    temperature: 0.6,
src/services/ai/chatModes.ts:144:    temperature: 0.7,
src/services/ai/chatModes.ts:172:    temperature: 0.6,
src/engines/output/unifiedMultimodalOutputEngine.ts:443:    // Mapper temperature (-1 à 1) vers warmth
src/engines/output/unifiedMultimodalOutputEngine.ts:444:    const warmth = embodied.energyField.temperature;
src/services/ai/chatModes.config.ts:133:  temperature: number;
src/services/ai/chatModes.config.ts:279:    temperature: 0.7,
src/services/ai/chatModes.config.ts:331:    temperature: 0.8,
src/services/ai/chatModes.config.ts:383:    temperature: 0.9,
src/services/ai/chatModes.config.ts:435:    temperature: 0.7,
src/services/ai/chatModes.config.ts:487:    temperature: 0.6,
src/services/ai/chatModes.config.ts:539:    temperature: 0.7,
src/services/ai/chatModes.config.ts:591:    temperature: 0.6,
src/services/ai/chatModes.config.ts:644:    temperature: 0.7,
src/services/ai/chatModes.config.ts:698:    temperature: 0.5,
src/services/ai/chatModes.config.ts:753:    temperature: 0.4,
src/services/ai/chatModes.config.ts:807:    temperature: 0.6,
src/services/ai/chatModes.config.ts:860:    temperature: 0.5,
src/services/ai/chatModes.config.ts:897:    temperature: 0.9,
src/services/ai/chatModes.config.ts:926:    temperature: 0.4,
src/services/ai/chatModes.config.ts:955:    temperature: 0.7,
src/services/ai/chatModes.config.ts:984:    temperature: 0.5,
src/services/ai/chatModes.config.ts:1013:    temperature: 0.8,
src/services/ai/chatModes.config.ts:1110:    typeof c.temperature === 'number' &&
src/services/ai/chatModes.config.ts:1111:    c.temperature >= 0 &&
src/services/ai/chatModes.config.ts:1112:    c.temperature <= 1 &&
src/services/ai/chatModes.config.ts:1129:  temperature: number;
src/services/ai/chatModes.config.ts:1138:    temperature: extended.temperature,
src/services/ai/index.ts:39:  type ChatEngineConfig,
src/services/orchestration/compat/aiCompat.ts:64:    temperature?: number;
src/services/orchestration/compat/aiCompat.ts:90:        temperature: params.temperature,
src/services/orchestration/compat/aiCompat.ts:173:    temperature?: number;
src/services/orchestration/compat/aiCompat.ts:200:        temperature: params.temperature,
src/visual-engine/OSIntegrationBridge.ts:79:  temperature: number; // celsius
src/services/ai/providers/gemini.ts:35:  temperature: number;
src/services/ai/providers/gemini.ts:41:  temperature: 0.7,
src/services/ai/providers/gemini.ts:124:                    temperature: finalConfig.temperature,
src/services/ai/providers/__tests__/openai.test.ts:94:          temperature: 0.7,
src/services/ai/providers/__tests__/openai.test.ts:185:        temperature: 0.9,
src/services/ai/providers/__tests__/openai.test.ts:194:          temperature: 0.9,
src/services/ai/providers/__tests__/claude.test.ts:94:          temperature: 0.7,
src/services/ai/providers/__tests__/claude.test.ts:197:        temperature: 0.9,
src/services/ai/providers/__tests__/claude.test.ts:206:          temperature: 0.9,
src/services/ai/providers/claude.ts:152:  temperature?: number;
src/services/ai/providers/claude.ts:160:  temperature: 0.7,
src/services/ai/providers/openai.ts:149:  temperature?: number;
src/services/ai/providers/openai.ts:158:  temperature: 0.7,
src/services/ai/providers/glm46v.ts:277:        temperature: finalConfig.temperature,
src/services/ai/providers/copilot.ts:31:  temperature: number;
src/services/ai/providers/copilot.ts:37:  temperature: 0.7,
src/services/ai/providers/copilot.ts:147:                  temperature: finalConfig.temperature,
src/services/ia/ia.types.ts:58:  temperature?: number;
src/services/ai/providers/ollama.ts:88:  temperature: 0.7,
src/services/ai/providers/ollama.ts:514:        temperature: finalConfig.temperature,
src/services/ai/providers/ollama.ts:532:              temperature: finalConfig.temperature,
src/services/singularityConnections.ts:199:          temperature: this.estimateTemperature(helios.cpu_usage), // CPU thermal estimation
src/services/singularityConnections.ts:451:   * Estimate CPU temperature based on usage (0-100°C normalized to 0-1)
src/services/singularityConnections.ts:454:    // CPU usage → temperature estimation
src/services/mcp/MCPCognitiveIntegration.ts:69:      temperature?: number;
src/services/mcp/MCPCognitiveIntegration.ts:81:          temperature: options?.temperature,
src/services/mcp/MCPCognitiveIntegration.ts:130:          temperature: options?.temperature,
src/services/ai/types.ts:166:  temperature?: number;
src/services/ai/types.ts:177:  temperature: 0.7,
src/services/chat/toolCaller.ts:140:        temperature: 20,
src/services/ai/chatClient.ts:29:  temperature?: number;
src/services/ai/chatClient.ts:128:    temperature = 0.7,
src/services/ai/chatClient.ts:180:      temperature,
src/services/ai/chatClient.ts:202:            temperature,
src/services/ai/chatClient.ts:291:            temperature,
src/services/ai/ConversationManager.ts:59:      temperature: 0.7,
src/services/ai/chatEngine.ts:93:export interface ChatEngineConfig {
src/services/ai/chatEngine.ts:145:  private config: ChatEngineConfig = { mode: 'default' };
src/services/ai/chatEngine.ts:157:  setMode(mode: ChatMode, config?: Partial<ChatEngineConfig>): void {
src/services/ai/chatEngine.ts:247:    config?: Partial<ChatEngineConfig>
src/services/ai/chatEngine.ts:908:    config: Partial<ChatEngineConfig> | undefined,
src/services/ai/chatEngine.ts:981:    finalConfig: ChatEngineConfig;
src/services/ai/chatEngine.ts:1012:        temperature:
src/services/ai/chatEngine.ts:1013:          finalConfig.aiConfig?.temperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7,
src/services/ai/chatEngine.ts:1138:    finalConfig: ChatEngineConfig;
src/services/ai/chatEngine.ts:1155:    finalConfig: ChatEngineConfig;
src/services/ai/chatEngine.ts:1199:      temperature:
src/services/ai/chatEngine.ts:1200:        finalConfig.aiConfig?.temperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7,
src/services/ai/chatEngine.ts:1480:    config?: Partial<ChatEngineConfig>
src/services/ai/chatEngine.ts:1896:  private postProcess(response: AIResponse, config: ChatEngineConfig): AIResponse {
