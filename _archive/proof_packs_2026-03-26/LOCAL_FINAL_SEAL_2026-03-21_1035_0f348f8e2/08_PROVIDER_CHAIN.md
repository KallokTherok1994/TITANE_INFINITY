# Provider Chain Verification — Step 5

## errorClassification.ts patterns
45:  /state not managed/i,
46:  /state not found/i,
47:  /type.*not.*managed/i,
→ PRESENT ✅

## chat_orchestrator.rs patterns
29:fn is_ollama_auto_enabled() -> bool {
31:    // Can be explicitly disabled via env var TITANE_OLLAMA_AUTO_DISABLED=1
33:    !env_flag_true("TITANE_OLLAMA_AUTO_DISABLED")
395:        failures.insert(provider.to_string(), 0);
418:    failures.insert(provider.to_string(), 0);
560:    let ollama_auto_enabled = requested_provider == "auto" && is_ollama_auto_enabled();
1668:    let allow_ollama_probe = is_ollama_auto_enabled();
1807:            if is_ollama_auto_enabled() {
→ PRESENT ✅

## IPC contract (conversation_engine/commands.rs)
27:pub struct ConversationGenerateArgs {
210:pub async fn conversation_generate(
213:    args: ConversationGenerateArgs,
215:    let ConversationGenerateArgs {
409:        "phase": "conversation_generate",
→ PRESENT ✅
