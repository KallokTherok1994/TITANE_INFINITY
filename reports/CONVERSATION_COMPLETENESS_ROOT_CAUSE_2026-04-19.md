# 2026-04-19 — Conversation Completeness Root Cause

- Scope: `src-tauri/src/conversation_os/style.rs`, `src-tauri/src/conversation_os/adapter.rs`, `src/__tests__/hooks/useConversationEngine.test.ts`, `src/components/sections/__tests__/ConversationSection.render.test.tsx`
- Symptom: certaines réponses longues de la route conversation active semblaient incomplètes jusqu au suffixe terminal visible.
- Root cause: la borne de longueur Conversation OS utilisait encore `text.len()` puis `&text[..max]`, ce qui reposait sur des offsets bytes et pouvait couper avant la fin logique utile.
- Fix: helper partagé `truncate_text_safely`, coupe Unicode-safe sur phrase puis mot, et régression frontend jusqu à `chat-message-content`.
- Targeted TS proof: `runTests` PASS sur `useConversationEngine`, `MarkdownContent`, `ConversationSection`, `ConversationSection.render`.
- Targeted Rust proof: PASS sur `cargo test --manifest-path src-tauri/Cargo.toml truncate_text_safely -- --nocapture` et `cargo test --manifest-path src-tauri/Cargo.toml truncate_respects_unicode_boundaries_and_words -- --nocapture`.
- Governance proof: `bash scripts/autoheal/detect_recurrence.sh` PASS, `bash scripts/verify_instructions.sh` PASS.
- Rollback reference: `proof_packs/CONVERSATION_COMPLETENESS_ROOT_CAUSE_2026-04-19/ROLLBACK.md`.