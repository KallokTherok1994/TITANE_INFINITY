Sur la branche MAIN
Votre branche est à jour avec 'origin/MAIN'.

Modifications qui seront validées :
  (utilisez "git restore --staged <fichier>..." pour désindexer)
	modifié :         scripts/autoheal/autoheal_rules.jsonl
	modifié :         src-tauri/src/conversation_engine/commands.rs
	modifié :         src-tauri/src/conversation_engine/omega_integration.rs
	modifié :         src-tauri/src/conversation_engine/types.rs
	modifié :         src-tauri/src/main.rs
	modifié :         src/components/sections/ConversationSection.tsx
	modifié :         src/components/sections/MemorySection.tsx
	modifié :         src/main.tsx
	modifié :         src/pages/ChatPage.tsx
	modifié :         src/pages/Memory.tsx
	modifié :         src/pages/TitanePage.tsx
	modifié :         src/services/ai/providers/ollama.ts
	modifié :         src/services/conversationEngine.ts

Fichiers non suivis:
  (utilisez "git add <fichier>..." pour inclure dans ce qui sera validé)
	proof_packs/WEBKIT_BOOT_OLLAMA_AUTOHEAL_2026-03-16_2131_ea50a6493/

ea50a6493 PATCH-011/012/013/014: LTM wired to OMEGA pipeline + all UI pages/modules
c0ed304b7 fix(governance): PATCH-010 — enforce policy_verdict.allow_external_ai at provider selection
ac16ac061 docs(proof): SEAL — ULTRA MASTER AUDIT final verdict with full gate matrix
2edab5cf3 docs(proof): add architecture proof — OMEGA→AIRouter real call chain proven
4539d5af6 fix(truth): PATCH-009 — truth label on run_governed_search feature gate
 scripts/autoheal/autoheal_rules.jsonl |  4 +++
 src/hooks/useLTMContext.ts            | 67 +++++++++++++++++++++++++++++++++++
 2 files changed, 71 insertions(+)
