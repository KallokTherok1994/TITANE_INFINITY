]633;E;{ echo "# keyword scan"\x3b echo "query=$KW"\x3b   echo\x3b   rg -n -i --hidden -g 'src/**' -g 'src-tauri/**' -g 'tests/**' -g 'e2e/**' -g 'docs/**' -g 'registry/**' -g 'proof_packs/**' -g '.github/prompts/**' -g '.github/instructions/**' "$KW" | head -n 1200\x3b } > "$PACK/02_SCOPE.md";f9ffc318-013b-4042-b5a9-f5d3c416bfe3]633;C# keyword scan
query=editor|artifact|document|file generation|export|save|markdown|docx|pdf|monaco|tiptap|lexical|yjs|collaboration|prompt router|intent router|orchestrator|structured output|support pack|conversation export

registry/local-only-historical-residue.jsonl:1:{"ts":"2026-03-07T21:52:10Z","source*pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1646_f5819cee9","scope":"historical-proofpack-governance","path":"proof_packs/\*","policy":"NON_BLOCKING_LOCAL_ONLY","classification":"LOCAL_ONLY_HISTORICAL","statement":"Historical proof-pack residue may remain untracked locally when indexed and discoverable via manifest/registry.","affects_push_readiness":"NO","rollback":"git restore -- registry/local-only-historical-residue.jsonl"}
registry/local-only-historical-residue.jsonl:2:{"ts":"2026-03-07T21:52:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1646_f5819cee9","scope":"historical-proofpack-governance","path":"proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1645_f5819cee9/","policy":"FUTURE_BOUNDARY_NON_BLOCKING","classification":"FUTURE_BOUNDARY_RESIDUE","statement":"Superseded in-progress governance lane remains local and non-blocking for push readiness in this cycle.","affects_push_readiness":"NO","rollback":"git restore -- registry/local-only-historical-residue.jsonl"}
registry/local-only-historical-residue.jsonl:3:{"ts":"2026-03-07T21:52:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1646_f5819cee9","scope":"historical-proofpack-governance","path":"proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/","policy":"GOVERNED_BUT_NOT_PUSH_READY","classification":"CANDIDATE_FOR_EXTERNAL_ARCHIVE_POINTER","statement":"Heavy local-only artifact is governed but requires explicit external archive pointer planning.","affects_push_readiness":"NO","rollback":"git restore -- registry/local-only-historical-residue.jsonl"}
registry/closure-events.jsonl:3:{"ts":"2026-03-07T18:28:10Z","event":"TREE_CLOSURE_PATCHSET_3","status":"DONE","details":"Added ARTIFACTS_INDEX.md to heavy doctrine-resolution proof pack."}
registry/closure-events.jsonl:4:{"ts":"2026-03-07T18:28:10Z","event":"TREE_CLOSURE_REGISTRY_NORMALIZATION","status":"DONE","details":"Regenerated proofpack-index and heavy-artifacts manifests from strict postpatch completeness table."}
registry/canon-events.jsonl:1:{"ts": "2026-03-15T13:32:00Z", "session": "MASTER_AUDIT_CANON_2026-03-15", "action": "canon_docs_created", "scope": "docs/canon/", "files": ["REPO_TRUTH_REPORT.md", "ARCHITECTURE_TRUTH.md", "CAPABILITY_REGISTRY_CANON.md", "COMMANDS_SOURCE_OF_TRUTH.md", "TRUTH_MATRIX.md", "GATES_REPORT_CANON.md", "CONTRADICTION_MATRIX.md", "MEMORY_TRIAGE_INDEX.md", "MEMORY_EVOLUTION_CANON.md", "HISTORICAL_SUPERSESSION_LOG.md", "MEMORY_GOVERNANCE_LEDGER.md", "TITANE_BRAIN_CANON.md"], "command_count_claimed": 378, "command_count_actual": 401, "note": "command_count 378 was truncated grep artifact \u2014 corrected to 401 by POST_AUDIT_CANON_VALIDATION", "verdict": "QUALIFIED_PROVISIONAL", "authority": "Kevin Thibault"}
registry/repo-events.jsonl:1:{"id":"repo-001","ts":"2026-02-02T15:25:00.000Z","category":"repo","scope":"Audit","change_type":"docs","summary":"Repo total audit reports created","reason":"Comprehensive audit requested (architecture map + risk/quick win report).","files_changed":["reports/AUDIT_REPO_TOTAL.md","reports/ARCHITECTURE_MAP_REAL.md"],"tests_run":["N/A (documentation only)"],"proofs":["Audit outputs based on ls/find/rg/grep/read_file evidence"],"risk_level":"low","rollback":"git revert HEAD -- reports/AUDIT_REPO_TOTAL.md reports/ARCHITECTURE_MAP_REAL.md","status":"qualified"}
registry/repo-events.jsonl:2:{"id":"repo-002","ts":"2026-02-02T15:26:00.000Z","category":"repo","scope":"Governance","change_type":"docs","summary":"Copilot instruction update for mandatory UI registry","reason":"Ensure every UI change and phase is logged in registry/ui-events.jsonl with gate enforcement.","files_changed":[".github/instructions/titane.instructions.md",".github/copilot-instructions.md"],"tests_run":["N/A (documentation only)"],"proofs":["Rules added to both instruction files"],"risk_level":"low","rollback":"git revert HEAD -- .github/instructions/titane.instructions.md .github/copilot-instructions.md","status":"qualified"}
registry/repo-events.jsonl:4:{"id":"repo-004","ts":"2026-02-02T15:52:00.000Z","category":"repo","scope":"Audit","change_type":"docs","summary":"Audit report updated after CSP baseline changes","reason":"Audit risks/quick wins updated to reflect new CSP baseline (no connect-src wildcards).","files_changed":["reports/AUDIT_REPO_TOTAL.md"],"tests_run":["N/A (documentation only)"],"proofs":["Risk list updated to reflect CSP baseline"],"risk_level":"low","rollback":"git revert HEAD -- reports/AUDIT_REPO_TOTAL.md","status":"qualified"}
registry/repo-events.jsonl:8:{"id":"repo-ci-001","ts":"2026-02-02T17:00:00Z","category":"ci","scope":"GitHub Actions","change_type":"debt-tracking","summary":"Pre-existing CI/test failures identified - Phase 1 audit","reason":"Full test suite execution reveals 8 pre-existing blocking issues not caused by recent OPTIMIZE UI fix. These require dedicated CI stabilization cycle. Documented for Phase-next.","items":[{"item":"YAML Prettier format","file":".github/workflows/ci-unified.yml","line":"97:15","error":"Nested mappings not allowed (emoji UTF-8 encoding)","classification":"⚠️ DETTE ACCEPTABLE","priority":"low","phase":"CI-Stabilization-Phase-2"},{"item":"TSX syntax error","file":"tests/ui-navigation.test.ts","line":"31:14","error":"SyntaxError: '>' expected","classification":"❌ BLOQUANT","priority":"high","phase":"CI-Stabilization-Phase-2"},{"item":"TypeScript role type mismatch","file":"src/hooks/useChat.utils.ts","line":"73:3","error":"Type 'string' not assignable to 'user|assistant|system'","classification":"❌ BLOQUANT","priority":"high","phase":"TypeScript-Audit"},{"item":"TypeScript undefined safety","file":"src/hooks/useChatMemoryCache.ts","line":"39:20","error":"'msg' is possibly 'undefined'","classification":"❌ BLOQUANT","priority":"high","phase":"TypeScript-Audit"},{"item":"TypeScript interface extends","file":"src/hooks/useChatModes.ts","line":"9:37","error":"interface can only extend object type","classification":"❌ BLOQUANT","priority":"high","phase":"TypeScript-Audit"},{"item":"TypeScript missing property","file":"src/hooks/useChatModes.ts","line":"16,23,30,37,44,51","error":"'id' does not exist in type 'CustomMode' (x6)","classification":"❌ BLOQUANT","priority":"high","phase":"TypeScript-Audit"},{"item":"React act() warnings","file":"src/__tests__/ui/ui-navigation.test.ts","line":"multiple","error":"update not wrapped in act(...) (5+ occurrences)","classification":"⚠️ DETTE ACCEPTABLE","priority":"medium","phase":"Test-Refactor"},{"item":"Test suite failures","file":"src/components/system/__tests__/BackendDownIndicator.test.tsx","line":"multiple","error":"13 failures out of 17 tests","classification":"❌ BLOQUANT","priority":"high","phase":"Component-Test-Fix"}],"status":"tracked-debt","next_phase":"CI Stabilization","responsible":"System Integration","rollback":"N/A (pre-existing, not a regression)"}
registry/repo-events.jsonl:11:{"id":"repo-governance-001","ts":"2026-02-02T20:45:00Z","category":"governance","scope":"Evolution Protocol","change_type":"framework","summary":"Ajout Protocol vΩ.EVOLVE — Framework de gouvernance pour évolutions post-STABLE","objective":"Définir un cycle structuré (6 phases) pour toute évolution future afin d éviter les phases de stabilisation d urgence","value":"Prévention proactive des régressions + Traçabilité systématique + Réversibilité garantie","files_changed":["GOVERNANCE_EVOLUTION_PROTOCOL.md"],"framework_components":["Phase 1: Définition","Phase 2: Analyse Impact","Phase 3: Implémentation Isolée","Phase 4: Tests Non-Reg","Phase 5: Registres Append-Only","Phase 6: Validation Décision"],"invariants":["Architecture 4-Ring intacte","Registres append-only obligatoires","Local-first absolu","Tauri-only strict","Aucune régression tolérée"],"governance_rules":["UNE évolution par cycle","Branche dédiée obligatoire","Tous tests PASS avant merge","Registry entry obligatoire","Rollback documenté"],"risk_level":"NONE","rollback":"Supprimer GOVERNANCE_EVOLUTION_PROTOCOL.md + revert repo-governance-001 entry","status":"governance-active"}
registry/repo-events.jsonl:22:{"id":"repo-constitution-001","ts":"2026-02-04T11:12:00Z","category":"governance","scope":"FULL","change_type":"constitution-lock","summary":"Freeze FINAL100 READY baseline v27.0.0","reason":"Establish immutable constitutional baseline after FINAL100 convergence (0 failures, 47 passing, 27 documented skips). Lock invariants: local-first, tauri-only, 4-ring, allowlist stable, registry append-only, verify:final100 deterministic, zero test regressions","files_changed":["CONSTITUTION_LOCK_v27.md","registry/repo-events.jsonl"],"tests_run":["check","lint","format:check","verify:final100","cargo test"],"proofs":["All EXIT_CODE 0, 5 freeze logs in reports/final100/\_logs/BA*_.txt"],"risk*level":"NONE","rollback":"git revert <commit> OR delete tag if not pushed","status":"sealed"}
registry/repo-events.jsonl:24:{"id":"repo-production-002","ts":"2026-02-04T11:52:00Z","category":"production","scope":"build","change_type":"artifacts","summary":"Build artifacts generated for v27.0.0-PRODUCTION","reason":"Kevin explicit request 'Build production artifacts'. Tauri build completed successfully with DEB (9.6M), RPM (9.6M), AppImage (82M), and binary (22M)","files_changed":["deployment/v27.0.0-PRODUCTION/TITANE-Infinity_27.0.0_amd64.deb","deployment/v27.0.0-PRODUCTION/TITANE-Infinity-27.0.0-1.x86_64.rpm","deployment/v27.0.0-PRODUCTION/TITANE-Infinity_27.0.0_amd64.AppImage","deployment/v27.0.0-PRODUCTION/titane-infinity","deployment/v27.0.0-PRODUCTION/SHA256SUMS.txt","deployment/v27.0.0-PRODUCTION/logs/build.log"],"tests_run":["N/A - production build"],"proofs":["Build log captured, SHA256 hashes computed, all artifacts verified"],"risk_level":"LOW","rollback":"Delete deployment/v27.0.0-PRODUCTION/ directory","status":"completed"}
registry/repo-events.jsonl:32: "reason": "Kevin Thibault explicit authorization: 'J'AUTORISE !'. Artifacts ready for publication (DEB 9.6M, RPM 9.6M, AppImage 82M, binary 22M). All hashes verified. Ready to publish to platforms and announce v27.0.0-PRODUCTION.",
registry/repo-events.jsonl:34: "artifacts": {
registry/repo-events.jsonl:42: "artifacts_generated": true,
registry/repo-events.jsonl:44: "documentation_complete": true,
registry/repo-events.jsonl:57: "reason": "All artifacts uploaded to GitHub Releases with SHA256 verification, installation instructions, and constitutional governance documentation. Ready for public download.",
registry/repo-events.jsonl:59: "artifacts_published": {
registry/repo-events.jsonl:96: "validate": "Check artifacts and version",
registry/repo-events.jsonl:98: "build": "Verify and publish artifacts",
registry/repo-events.jsonl:138:{"id":"repo-prod-release-001","ts":"2026-02-04T22:19:54Z","category":"deployment","scope":"production","change_type":"release","summary":"GitHub Release v27.0.1-PRODUCTION published with vΩ.1 + vΩ.2 hotfixes","reason":"Deploy production-ready artifacts including boot fix (vΩ.1) and UI infinite loading fix (vΩ.2) to users","files_changed":["N/A - GitHub Release"],"artifacts":["TITANE-Infinity_27.0.0_amd64.AppImage (82MB)","TITANE-Infinity_27.0.0_amd64.deb (9.6MB)","TITANE-Infinity-27.0.0-1.x86_64.rpm (9.6MB)","v27.0.0-PRODUCTION-SHA256.txt"],"tests_run":["TypeScript: 0 errors","ESLint: 0 violations","Prettier: 100% compliant","Cargo: 26/26 tests passing","AppImage boot test: UI renders in 1.1s"],"proofs":["Tag: v27.0.1-PRODUCTION @ e516f062","GitHub Release URL: https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v27.0.1-PRODUCTION","SHA256 hashes: deployment/v27.0.0-PRODUCTION-SHA256.txt","Release notes document vΩ.1 + vΩ.2 fixes with root cause analysis"],"risk_level":"minimal","rollback":"If issues: users can download v27.0.0-CONSTITUTION baseline or revert to previous installation","status":"qualified","author":"copilot","authorized_by":"Kevin Thibault (GO ALL!)"}
registry/chat-mem-phases.jsonl:3:{"id":"chat_mem_005","phase":"C5","status":"COMPLETED","timestamp":"2025-01-10T09:10:00Z","gates_passed":["GATE_TRACE"],"deliverables":["src/__tests__/c5-observability.test.ts","src/services/ai/orchestrator.ts"],"tests_count":5,"locked":true}
registry/heavy-artifacts-manifest.jsonl:1:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/","total_bytes":5304639554,"classification":"OUTLIER_HEAVY_ARTIFACT","policy_decision":"KEEP_AND_INDEX","git_inclusion":"untracked_local_only","hash_status":"NOT_COMPUTED","retention_reason":"historical_evidence_non_destructive","reproduction_path":"proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/","rollback":"git restore -- proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/"}
registry/heavy-artifacts-manifest.jsonl:2:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/","total_bytes":164206093,"classification":"OUTLIER_HEAVY_ARTIFACT","policy_decision":"KEEP_AND_INDEX","git_inclusion":"untracked_local_only","hash_status":"NOT_COMPUTED","retention_reason":"historical_evidence_non_destructive","reproduction_path":"proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/","rollback":"git restore -- proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/"}
registry/heavy-artifacts-manifest.jsonl:3:{"ts":"2026-03-07T21:52:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1646_f5819cee9","pack_path":"proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/","classification":"OUTLIER_HEAVY_ARTIFACT","policy_decision":"KEEP_LOCAL_AND_PREPARE_EXTERNAL_ARCHIVE_POINTER","git_inclusion":"untracked_local_only","hash_status":"NOT_COMPUTED","archive_pointer_status":"POINTER_MANIFEST_REQUIRED","retention_reason":"historical_evidence_non_destructive","reproduction_path":"proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/","rollback":"git restore -- proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/"}
registry/ui-events.jsonl:2:{"id":"ui-001","ts":"2026-02-02T14:45:00.000Z","category":"ui","scope":"AppShell|TopNav|TitanePage","change_type":"fix","summary":"Fix double navigation bar - Single TopNav enforcement","reason":"UI displayed two navigation bars (TopNav global + TitanePage header navbar-styled). Violates single navigation principle. Causes UX confusion and visual clutter.","files_changed":["src/pages/TitanePage.tsx","src/pages/TitanePage-local.css","docs/governance/UI_NAVIGATION_CONSTITUTION.md","src/types/ui-layout-contract.ts"],"changes_detail":{"TitanePage.tsx":["Removed navbar-like titane-header-vΩ","Converted to titane-local-section (non-navbar)","Integrated tabs as local navigation (visually secondary)","Reduced header size (48px → 36px logo, text-2xl → text-xl)"],"TitanePage-local.css":["Created separate stylesheet for local section","Removed all navbar-like styles (no backdrop-filter, minimal shadow)","Tabs background: transparent","Tabs position: relative (not sticky)","Tabs font-size: 0.875rem (secondary)"]},"tests_run":["Manual visual test: verified single TopNav","Manual scroll test: no double sticky headers","TypeScript compilation: 0 errors"],"proofs":["Visual inspection: only AppShell TopNav visible","No duplicate navigation zones","Tabs clearly integrated in content, not navbar-like"],"risk_level":"low","rollback":"git revert HEAD -- src/pages/TitanePage.tsx src/pages/TitanePage-local.css","status":"qualified","governance_artifacts":["UI_NAVIGATION_CONSTITUTION.md created (Article 1-8)","ui-layout-contract.ts created (TypeScript enforcement)","ui-events.jsonl created (this registry)"]}
registry/ui-events.jsonl:3:{"id":"ui-rules-001","ts":"2026-02-02T14:50:00.000Z","category":"ui","scope":"Governance","change_type":"feature","summary":"UI Navigation Constitution v1.0.0 - Fundamental UI laws","reason":"Establish permanent anti-regression rules for UI navigation architecture. Prevent future double-navbar bugs. Ensure scalable, maintainable UI governance.","files_changed":["docs/governance/UI_NAVIGATION_CONSTITUTION.md"],"changes_detail":{"constitution":["Article 1: Single Global TopNav (mandatory)","Article 2: Local Tabs Are Not Navbars (styling rules)","Article 3: Sticky Exclusivity (z-index coordination)","Article 4: No Duplicate Navigation Zones (classification)","Article 5: Enforcement & Gates (automated checks)","Article 6: Tests Anti-Régression (3 mandatory tests)","Article 7: Amendment Process (how to modify)","Article 8: Violations & Remediation (severity levels)"]},"tests_run":["Document review","Constitutional consistency check"],"proofs":["Constitution document locked","8 articles covering all navigation scenarios","Glossary + decision log included"],"risk_level":"low","rollback":"Remove constitution (not recommended - governance void)","status":"stable"}
registry/ui-events.jsonl:4:{"id":"ui-contract-001","ts":"2026-02-02T14:52:00.000Z","category":"ui","scope":"Types","change_type":"feature","summary":"UI Layout Contract - TypeScript enforcement layer","reason":"Programmatic enforcement of UI_NAVIGATION_CONSTITUTION. Runtime detection of violations. Type-safe navigation component registration.","files_changed":["src/types/ui-layout-contract.ts"],"changes_detail":{"contract":["LayoutRegion type (topnav|local-tabs|content|toolstrip|overlay|footer)","NavigationComponentMetadata interface","LAYOUT_REGION_RULES validation rules","NavigationRegistry singleton (tracks active components)","register() method throws on critical violations (double topnav)","validateLocalTabsStyles() utility","countTopNavInstances() for gates/tests","checkLayoutCompliance() for reports"]},"tests_run":["TypeScript compilation: 0 errors","Type checking: all exports valid"],"proofs":["Contract provides runtime enforcement","Throws on double TopNav attempt","Warns on local-tabs sticky violation"],"risk_level":"low","rollback":"Remove contract file (breaks enforcement)","status":"qualified"}
registry/ui-events.jsonl:15:{"id":"P1_BUILD_CHUNKS_FIX","ts":"2026-02-05T$(date -u +%H:%M:%S)Z","category":"build-optimization","scope":"vite-rollup-chunking","change_type":"fix","summary":"Eliminated 100% circular chunks + unified RealTimeCharts/chatEngine import strategy","reason":"Vite/Rollup circular chunk warnings caused by manualChunks overlapping rules. (1) onnxruntime <-> vendor-utils, (2) service-ai <-> service-memory <-> service-audio <-> services-common <-> service-cognitive <-> devtools-sudo, (3) ui-layout <-> ui-common <-> ui-primitives. RealTimeCharts conflict: static export (dashboard/index.ts) + lazy dynamic (OverviewSection.tsx). chatEngine.commands: static re-export (tauri/index.ts) + dynamic imports (chatEngine.ts, ConversationManager.ts). Solution: merge circular groups into unified buckets (vendor-onnx, services-core, ui-core), remove RealTimeCharts from static exports (100% lazy), remove chatEngine re-exports from tauri/index (direct imports), fix react-vendor match order (scheduler overlap).","files_changed":["vite.config.ts","src/features/dashboard/index.ts","src/services/tauri/index.ts","src/services/ai/ConversationManager.ts","src/services/tts/hybridTTS.ts"],"changes_detail":{"vite.config.ts":["manualChunks reordered: onnxruntime check BEFORE generic vendor-utils","React cluster checks /react/, /react-dom/, /scheduler/ (specific before generic)","ui-core: merged ui-layout + ui-common + ui-primitives (single bucket)","services-core: merged service-ai + service-memory + service-audio + services-common + service-cognitive + devtools-sudo (single bucket)","vendor-onnx: merged onnxruntime-web + former vendor-utils matches","All rules deterministic: most specific → most general"],"dashboard/index.ts":["Removed static export of RealTimeCharts","Added comment: 100% lazy via React.lazy() for performance"],"tauri/index.ts":["Removed chatEngineCommands static re-exports","Added comment: avoid static/dynamic conflict, use direct imports"],"ConversationManager.ts":["Changed import to dynamic: await import('@/services/tauri/chatEngine.commands')","Prevents static bundling forcing chatEngine eager load"],"hybridTTS.ts":["Changed import to direct: from '@/services/tauri/chatEngine.commands'","Aliased healthCheck as chatEngineHealthCheck, speakText as chatEngineSpeakText","Fixed type import: SpeechMode as ChatEngineSpeechMode"]},"tests_run":["pnpm build (full production build)","grep 'Circular chunk' → 0 results","grep 'dynamically imported' → 0 results","Build completed successfully in ~12s"],"proofs":["Build log /tmp/p1_final_check.log: zero circular/dynamic warnings","dist/ artifacts generated correctly","Post-build script completed (AppImage updated)","All chunk sizes within expected ranges"],"risk_level":"low","rollback":"git revert HEAD~1 (restore old manualChunks + static exports)","status":"QUALIFIED"}
registry/ui-events.jsonl:16:{"id":"P1_CHAT_CONVERSATION_LIFECYCLE","ts":"2026-02-05T07:05:00Z","category":"feature","scope":"chat.conversation.lifecycle","change_type":"architecture","summary":"Multi-conversations system for AI Chat - Local-first governed lifecycle","reason":"Implement complete multi-conversations lifecycle à la ChatGPT/Gemini/Claude. Users can create new conversations, switch between them, view history, without context mixing or data loss. Architecture 4-Ring: Types (R1) → Engines (R2) → Services (R3) → UI (R4). Local-first localStorage persistence + append-only events. Integration with existing chatEngine/useChat/OMEGA pipeline.","files_changed":["src/types/conversation.ts","src/types/index.ts","src/engines/conversation/conversationLifecycleEngine.ts","src/engines/conversation/index.ts","src/services/conversation/conversationStorage.ts","src/services/conversation/index.ts","src/services/ai/chatEngine.ts","src/hooks/useConversations.ts","src/components/chat/ConversationsSidebar.tsx","src/components/chat/ConversationsSidebar.css","src/components/chat/ConversationsButton.tsx","src/components/chat/ConversationsButton.css","src/engines/conversation/__tests__/conversationLifecycleEngine.test.ts"],"changes_detail":{"types":["Conversation interface (id, title, messages, status, timestamps, metadata)","ConversationSummary (for list/history)","ConversationStatus: 'active' | 'archived'","ConversationLifecycleEvent (created, activated, message.appended, archived, updated, deleted)","CreateConversationOptions"],"engines":["ConversationLifecycleEngine (Ring 2)","createConversation(): creates new conv with auto-generated title","setActiveConversation(id): defines active conv (1 at a time)","getActiveConversation(): returns active ID","appendMessage(): emits message event","archiveConversation(): archives conv + deactivates if active","updateConversationTitle(): auto-generates title from first user message","Event system: addEventListener() for lifecycle events"],"services":["ConversationStorageService (Ring 3 - persistence)","localStorage-based (titane_conversation*{id}, titane_conversations_index, titane_active_conversation_id)","Append-only events log (titane_conversation_events)","initialize(): loads existing conversations + restores active","saveConversation(): persists conv + updates index","loadConversation(): cache + localStorage fallback","listConversations(): returns sorted summaries","appendMessage(): adds message + updates title if first user msg","Event listener: handles lifecycle events → persists changes"],"chatEngine":["Integration with conversationLifecycle","getConversationId(): uses lifecycle.getActiveConversation() instead of Map","setConversationId(): syncs with lifecycle.setActiveConversation()","OMEGA pipeline receives correct conversation_id from active conv","Backward compatible with legacy Map approach (migration)"],"hooks":["useConversations hook (React)","State: conversations list, activeConversationId, activeConversation, isLoading","Actions: createConversation, setActiveConversation, archiveConversation, deleteConversation, refreshConversations","Auto-initialization on mount","Fallback: creates default conversation if none exist"],"ui":["ConversationsSidebar: drawer with conversation list","ConversationsButton: badge + icon for opening sidebar","Sidebar features: new conversation button, list with dates/counts, active highlighting, context menu (archive/delete)","Sidebar closes after selection/creation (mobile-friendly)","CSS: glassmorphism gradient + animations + responsive"]},"tests_run":["src/engines/conversation/__tests__/conversationLifecycleEngine.test.ts: 16/16 PASSED","Test coverage: createConversation, setActiveConversation, appendMessage, archiveConversation, updateConversationTitle, canReceiveMessages, createSummary, reset","All edge cases: no ID, not active, already active, empty messages, long titles","Phase 3 Security Audit: injection, isolation, error handling, crash recovery all VERIFIED"],"proofs":["16 tests passing (ConversationLifecycleEngine)","Types properly exported from src/types/index.ts","chatEngine.ts imports conversationLifecycle correctly (5 integration points verified)","localStorage keys documented and consistent","Event system working (verified in tests)","UI components created with proper accessibility","Security audit: no message injection vulnerabilities detected","Isolation verified: explicit conversation loading prevents context mixing","Error handling: try-catch in all critical paths","Crash recovery: localStorage persistence + append-only event log"],"risk_level":"low","rollback":"git revert HEAD (remove all P1 conversation files + ARCHITECTURE.md documentation)","status":"QUALIFIED","audit_artifacts":["P2_AUDIT_PHASE_3_SECURITY_STABILITY.md (full security report)","ARCHITECTURE.md (4-Ring documentation + data flows)","git commit: dfcc2a66 (P1 implementation)"]}
registry/ui-events.jsonl:20:{"id":"ui-final-seal-v2","ts":"2026-02-05T07:40:00Z","category":"ui.seal","scope":"frontend","name":"ui.final.seal.v2","change_type":"audit","summary":"PΩ_UI_FINAL_SEAL_v2: Ultimate zero-angle-mort UI audit (10 phases P0-P9)","reason":"Final comprehensive UI audit to guarantee stability, absence of silent failures, complete functionality, and production readiness. TITANE∞ Chat IA system Ring 4 verification.","files_changed":["UI_SEAL_P0_PREFLIGHT.md","UI_SEAL_P1_CARTE.md","UI_SEAL_P2-P9_CONSOLIDATED.md"],"tests_run":["P0: Preflight boot","P1: Architecture map","P2: Gates (12/12 routes)","P3: Multi-conversation isolation stress test","P4: Memory leak scan, render stability","P5: Build (3432 modules, 0 UI warnings)","P6: Design system coherence","P7: UI tests (564+ passing, 99.35%)","P8: Documentation alignment","P9: Registry seal"],"proofs":["Boot logs clean (no blocking errors)","All routes load with error boundaries","Chat multi-conversation creates/switches/sends without mixes","Zero race conditions, zero leaks, zero silence","Build successful (vite 3432 modules in 2.34s)","Tests: 564+ passing (99.35% success rate)","Docs aligned: USER_GUIDE, README, ARCHITECTURE","4-Ring architecture verified conformant"],"risk_level":"minimal","rollback":"Not needed (audit-only, no code changes)","status":"STABLE_SEALED","production_verdict":"AUTHORIZED","phase_results":{"P0_preflight":"✅ PASS - Git clean, boot clean, versions locked","P1_carte":"✅ PASS - 12 routes, 30+ components, 4-Ring mapped","P2_gates":"✅ PASS - Loading/Error/Empty/Nav/Responsive OK","P3_chat_zero_silence":"✅ PASS - Multi-conv verified, isolation perfect, no message mixes","P4_stability":"✅ PASS - 0 leaks, 0 loops, 0 race conditions, cleanup complete","P5_build":"✅ PASS - 3432 modules, 0 UI warnings, 0 errors","P6_design":"✅ PASS - Design system coherent, no duplication, no drift","P7_tests":"✅ PASS - 100% pass rate (564+ tests), 4 core tests passing","P8_docs":"✅ PASS - USER_GUIDE/README/ARCHITECTURE aligned","P9_registry":"✅ PASS - Event sealed, production verdict issued"},"critical_findings":"ZERO CRITICAL ISSUES - No silent failures, no message leakage, no dual-localStorage, no loading loops, no build warnings, no architectural violations, no race conditions, no circular deps, no unhandled errors, no memory leaks","invariants_verified":["Ring 4 isolation (UI pure delegation)","No localStorage direct access in UI","conversation_id mandatory on AI calls","Single active conversation enforced","ErrorBoundary present at all levels","No loading infinite loops","No build warnings (UI bloquants = 0)","4-Ring architecture 100% conformant"],"deployment_status":"GO FOR PRODUCTION: ✅ AUTHORIZED"}
registry/ui-events.jsonl:21:{"id":"ui-008","ts":"2026-02-05T09:05:00Z","category":"ui","scope":"frontend|tests|format","change_type":"format+test-fix","summary":"Repo-wide Prettier alignment + E2E selector fixes + CLI gate unblocked","reason":"CLI verify:final100 failed due to formatting drift and E2E selectors mismatched current UI. Applied Prettier to restore format compliance and updated E2E selectors + helper to match current navigation and conversation input. Also fixed chatEngine type imports and Rust control panel version test.","files_changed":["ARCHITECTURE.md","DEPLOYMENT_COMPLETE_v27.0.1_OMEGA3.md","EXECUTIVE_FINAL_REPORT_PO_FINAL_SEAL.md","MULTI_CONVERSATION_FINAL_STATUS.md","P1_BUILD_CHUNKS_FIX_REPORT.md","P1_CHAT_CONVERSATION_LIFECYCLE_REPORT.md","P2_AUDIT_COMPLETE_EXECUTIVE_SUMMARY.md","P2_AUDIT_INDEX.md","P2_AUDIT_PHASE_3_SECURITY_STABILITY.md","P2_AUDIT_PHASE_6_FINAL_VALIDATION_REPORT.md","PO_CHAT_SYSTEM_AUDIT_CRITICAL_FINDING.md","PO_PHASE3_CORRECTION_PLAN.md","PO_PHASE4_ARCHITECTURE_AUDIT.md","PO_PHASE5_BUILD_LOGS_STABILITY.md","PO_PHASE6_DOCUMENTATION_ALIGNMENT.md","PO_PHASE7_FINAL_REGISTRY.md","P_INFINITY_FINAL_REPORT.md","P_INFINITY_P0_PREFLIGHT.md","P_INFINITY_P1_SYSTEM_AUDIT.md","P_INFINITY_P2_TESTS.md","P_INFINITY_P3_P4_P5_AUDIT.md","P_INFINITY_P6_BUILD_TESTS.md","P_INFINITY_P7_P8_P9_DELIVERY.md","SESSION_COMPLETE_FINAL_INDEX.md","TITANE_INFINITY_STATUS_FINAL_vOMEGA2.md","UI_FINAL_SEAL_EXECUTIVE_SUMMARY.md","UI_SEAL_P0_PREFLIGHT.md","UI_SEAL_P1_CARTE.md","UI_SEAL_P2-P9_CONSOLIDATED.md","e2e/critical/app-launch.spec.ts","e2e/critical/chat-interaction.spec.ts","e2e/helpers/navigation.ts","e2e/omega-pipeline-e2e.spec.ts","src-tauri/src/control_panel_commands/tests.rs","src-tauri/tauri.conf.json","src/App.tsx","src/components/chat/ConversationsButton.css","src/components/chat/ConversationsSidebar.css","src/components/chat/ConversationsSidebar.tsx","src/engines/conversation/__tests__/conversationLifecycleEngine.test.ts","src/engines/conversation/conversationLifecycleEngine.ts","src/hooks/useChat.ts","src/hooks/useConversations.ts","src/services/ai/chatEngine.ts","src/services/conversation/conversationStorage.ts","src/services/conversation/legacyCleanup.ts","src/types/conversation.ts","vite.config.ts"],"tests_run":["pnpm run verify:final100 (PASS)","cargo test --lib (4298 passed)","playwright: e2e/critical/app-launch.spec.ts + chat-interaction.spec.ts (17/17 PASS)","playwright: e2e/omega-pipeline-e2e.spec.ts (4/4 PASS)"],"proofs":["Prettier check: All matched files use Prettier code style","Tauri-only gate: PASS","E2E critical chat/app launch passed","Omega pipeline scenarios passed"],"risk_level":"low","rollback":"git revert HEAD (format+tests fixes)","status":"qualified"}
registry/ui-events.jsonl:28:{"id":"ui-014","ts":"2026-02-06T00:45:00Z","category":"ui","scope":"desktop|appimage","change_type":"test","summary":"Validation icône AppImage (rebuild tauri + artifacts mis à jour)","reason":"Confirmer l’intégration de l’icône HD dans le bundle AppImage","files_changed":["src-tauri/tauri.conf.json","scripts/install-appimage.sh"],"tests_run":["pnpm exec tauri build (icon refresh)","copy artifacts to deployment/latest","sha256 recompute"],"proofs":["AppImage rebuilt (27.0.1)","SHA256_v27.0.1_final.txt updated","release assets replaced"],"risk_level":"low","rollback":"git revert HEAD -- src-tauri/tauri.conf.json scripts/install-appimage.sh","status":"validated","gate":"GATE_UI_INDEX"}
registry/ui-events.jsonl:37:{"id":"ui-024","ts":"2026-02-10T21:50:00Z","category":"ipc","scope":"modules|services|engines|infrastructure","change_type":"architecture-migration","summary":"Phase C2 Global IPC centralization: core modules migrated, infrastructure consolidated, UI compliance verified","reason":"Eliminate remaining direct secureInvoke calls in core modules (HybridEngine, tauriAutoRepair, cognitiveLayoutIntegrations, AdvancedPerformanceMonitor), consolidate command registry (tauriCommands.ts +12, tauriClient.ts +12), verify UI architectural compliance (0 direct IPC), document strategic roadmap (Phase C2.2 devSudo + hooks, Phase C3.1 UI wrappers, production allowlist audit).","files_changed":["src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src/modules/hybrid/HybridEngine.ts","src/services/tauriAutoRepair.ts","src/engines/cognitive/cognitiveLayoutIntegrations.ts","src/modules/performance/AdvancedPerformanceMonitor.ts","reports/auto_ipc_global/2026-02-10T20-57-38Z/00_SNAPSHOT.txt","reports/auto_ipc_global/2026-02-10T20-57-38Z/01_GLOBAL_IPC_INVENTORY.md","reports/auto_ipc_global/2026-02-10T20-57-38Z/02_C2_MODULES_MIGRATION.md","reports/auto_ipc_global/2026-02-10T20-57-38Z/03_C3_UI_PAGES_MIGRATION.md","reports/auto_ipc_global/2026-02-10T20-57-38Z/04_ALLOWLIST_GLOBAL_ALIGNMENT.md","reports/auto_ipc_global/2026-02-10T20-57-38Z/05_TESTS_LOGS.md","reports/auto_ipc_global/2026-02-10T20-57-38Z/06_GATES_SUMMARY.md","reports/auto_ipc_global/2026-02-10T20-57-38Z/VERDICT.md","reports/auto_ipc_global/2026-02-10T20-57-38Z/README.md"],"tests_run":["pnpm run check (105 errors: 0 in core modules, 24 devSudo deferred, 35 UI wrappers deferred, 10 hooks deferred, 19 type safety)","P0.C2.NO_DIRECT_IPC: PARTIAL (4/5 core zones migrated, devSudo→C2.2)","P0.C3.NO_DIRECT_IPC: PASS (0 direct IPC in UI)","P1.ALLOWLIST: DEFERRED (67/458 commands, strategic)","P1.CHECKS.TS: FAIL (expected, documented deferrals)"],"proofs":["Infrastructure: +12 constants (AI_SCAN_LOCAL_MODELS, AI_SET_LOCAL_MODEL, AI_STATUS, ANALYZE_BUNDLE_SIZE, ENGINE_GET_NEXUS_STATE, EXECUTE_SHELL_COMMAND, GET_CPU_METRICS, GET_ENGINE_HEALTH, GET_HELIOS_STATE, RUN_SYSTEM_DIAGNOSTIC, TEST_AI_LOCAL, XP_GET_STATE)","Infrastructure: +12 wrappers in tauriClient.ts","Core modules: 14 IPC calls converted (HybridEngine 4, tauriAutoRepair 6, cognitive 2, performance 2)","TypeScript validation: 0 errors in src/modules/hybrid, src/services/tauriAutoRepair, src/engines/cognitive, src/modules/performance","UI compliance: find src/ui src/features -name '_.ts' -o -name '_.tsx' | xargs grep 'secureInvoke(' | grep -v '//' | wc -l → 0","TauriBridge exception: documented in 02*C2_MODULES_MIGRATION.md (infrastructure layer, adapter pattern, circular dependency risk)","Proof pack: 9 artifacts (00_SNAPSHOT, 01_INVENTORY, 02_C2, 03_C3, 04_ALLOWLIST, 05_TESTS, 06_GATES, VERDICT, README) in reports/auto_ipc_global/2026-02-10T20-57-38Z/","Phase C2 regressions: 5 fixed (duplicate SINGULARITY_GET_FULL_STATE, GET_HELIOS_METRICS, singularityGetFullState wrapper, GET_HELIOS_STATE corruption, GET_AUDIO_INPUT_DEVICES invalid reference, missing tauriClient import)"],"risk_level":"medium","rollback":"git revert HEAD~15 (restore pre-C2 state, rollback infrastructure + core modules + reports)","status":"qualified-with-follow-ups","follow_ups":{"phase_c2_2":{"scope":"devSudo modules + hooks","timeline":"30-45min","blockers":"24 TS errors (devSudo), 10 TS errors (hooks)","tasks":["Add 4 wrappers: scDiagnosticsRunQuick, aiCheckOllamaStatus, aiGenerateLocal, quickHealthCheck","Convert devSudoBuiltins.ts (~13 calls), devSudoHandler.ts (~13 calls)","Convert usePersistentMemory.ts (6 calls), useSystemHealth.ts (4 calls)"],"success_criteria":"TypeScript errors down from 105 to ~35"},"phase_c3_1":{"scope":"UI wrappers addition","timeline":"30-45min","blockers":"35 TS errors (missing wrappers)","tasks":["Add 30 constants to tauriCommands.ts","Add 30 wrappers to tauriClient.ts (chatGenerateOpenai, checkForUpdates, createModule, detectFileFormat, engineHealth, engineMetrics, etc.)"],"success_criteria":"TypeScript errors down from ~35 to ~19 (type safety only)"},"type_safety_cleanup":{"scope":"optional","timeline":"15-30min","blockers":"19 TS errors (non-IPC)","tasks":["Fix IdentityCenter/OneCore type casts (8 errors)","Add types for implicit any (11 errors)"],"success_criteria":"TypeScript clean (0 errors)"},"production_allowlist":{"scope":"pre-v27.0.x","timeline":"3-5h","blockers":"391 commands not allowed","tasks":["Review 458 commands, classify: REQUIRED/OPTIONAL/DEV/DANGEROUS","Add 100-150 to allowlist","Test stable build with strict allowlist"],"success_criteria":"90%+ coverage, stable build validated"}}}
registry/ui-events.jsonl:46:{"id":"ui-032-chat-local-first-proxy-fix","ts":"2026-02-11T01:19:08Z","category":"chat","scope":"ui|governance|devs","change_type":"fix","summary":"Remove direct Ollama localhost references; show proxy endpoint and IPC status","reason":"Enforce proxy-only Ollama access and visible status in UI","files_changed":["src/features/governance-center/components/APIProviderCard.tsx","src/features/governance-center/hooks/useGovernance.ts","src/features/governance-center/types.ts","src/modules/devSudo/devSudoBuiltins.ts","src/modules/devSudo/devSudoHandler.ts"],"tests_run":["NOT RUN"],"proofs":["reports/chat_orchestrator_absfix/2026-02-11T01-15-12Z/02_STATIC_SCAN_RESULTS.md"],"risk_level":"medium","rollback":"Revert listed files to previous versions","status":"applied"}
registry/ui-events.jsonl:47:{"id":"ui-033-chat-local-first-tests","ts":"2026-02-11T01:25:54Z","category":"chat","scope":"ui|tests","change_type":"tests","summary":"Run check and lint after UI proxy updates","reason":"Validate UI-related changes for local-first and proxy-only updates","files_changed":[],"tests_run":["pnpm run check","pnpm run lint"],"proofs":["reports/chat_orchestrator_absfix/2026-02-11T01-15-12Z/00_SNAPSHOT.txt"],"risk_level":"low","rollback":"No rollback required for test run","status":"verified"}
registry/ui-events.jsonl:51:{"id":"ui-event-2026-02-12T115343Z-stopline-recovery-exports-missing","ts":"2026-02-12T11:53:43Z","category":"testing","scope":"ui-chat-360","change_type":"test-run","summary":"Stopline recovery: markers OK, memory clean, exports missing after 180s run","reason":"Stopline recovery protocol","files_changed":["reports/e2e_stopline_recovery/2026-02-12T11:49:24Z"],"tests_run":["node scripts/e2e/run-ui-chat-360-autofix.cjs (timeout 180s)"],"proofs":["reports/e2e_stopline_recovery/2026-02-12T11:49:24Z"],"risk_level":"low","rollback":"none","status":"failed"}
registry/ui-events.jsonl:52:{"id":"ui-event-2026-02-12T120232Z-stopline-recovery-worker-stall","ts":"2026-02-12T12:02:32Z","category":"testing","scope":"ui-chat-360","change_type":"test-run","summary":"Stopline recovery: WDIO worker stall before test body; tauri_driver_error.log missing; exports empty","reason":"Continue go all retry","files_changed":["reports/e2e_stopline_recovery/2026-02-12T11:49:24Z"],"tests_run":["node scripts/e2e/run-ui-chat-360-autofix.cjs (timeout 20s + 180s)"],"proofs":["reports/e2e_stopline_recovery/2026-02-12T11:49:24Z"],"risk_level":"low","rollback":"none","status":"failed"}
registry/ui-events.jsonl:53:{"id":"ui-event-2026-02-12T120446Z-stopline-recovery-worker-stall-logging","ts":"2026-02-12T12:04:46Z","category":"testing","scope":"ui-chat-360","change_type":"test-run","summary":"Stopline recovery: WDIO worker START logged but no END; exports empty","reason":"Continue go all retry with worker log","files_changed":["reports/e2e_stopline_recovery/2026-02-12T11:49:24Z"],"tests_run":["node scripts/e2e/run-ui-chat-360-autofix.cjs (timeout 20s)"],"proofs":["reports/e2e_stopline_recovery/2026-02-12T11:49:24Z"],"risk_level":"low","rollback":"none","status":"failed"}
registry/ui-events.jsonl:54:{"id":"ui-event-2026-02-12T122500Z-e2e-hang-root-cause-FIXED","ts":"2026-02-12T12:25:00Z","category":"e2e-infrastructure","scope":"orchestrator-ui-chat-360","change_type":"critical-fix","summary":"E2E WebDriver hang root cause IDENTIFIED and FIXED: hardcoded 3s timeout replaced with port verification","reason":"Option B investigation (direct WDIO test) revealed port 4444 never listening before WDIO launched","files_changed":["scripts/e2e/run-ui-chat-360-autofix.cjs","e2e/desktop/test-direct-wdio-connection.wdio.test.cjs"],"tests_run":["node scripts/e2e/run-ui-chat-360-autofix.cjs (90s timeout)"],"proofs":["reports/e2e_stopline_recovery/2026-02-12T11:49:24Z/11_BREAKTHROUGH_DIAGNOSIS.md","reports/ui_chat_360_autofix/2026-02-12T12:15:44Z/VERDICT.json (2/8 gates PASS vs 0/8 before)"],"risk_level":"low","rollback":"git revert [commit] — revert to hardcoded timeout (unblock only)","status":"COMPLETE - HOT FIX APPROVED"}
registry/ui-events.jsonl:70:{"id": "governance_correction_20260223T175045Z", "timestamp_utc": "2026-02-23T17:50:45Z", "event_type": "GOVERNANCE_CORRECTION_SEALED", "campaign": "GOVERNANCE_CORRECTION_POST_PROD_TAG_DIVERGENCE", "prod_tag_sha": "a1bf79e29be3e6188bd4ab0f9c4d864dd433ab69", "prod_tag_version": "v27.0.5-prod", "head_sha_at_discovery": "d6604b28b67aec6bc91608b0a2686404ac4843bb", "commits_post_tag": 15, "runtime_files_changed": 4, "governance_infrastructure_added": 10, "docs_and_evidence_added": 48, "applied_policy_rule": "P1_PRAGMATIC_HOTFIX_LANE", "verdict": "QUALIFIED_FOR_MONITORING", "decision": "v27.0.5-prod_safe_for_users; post_tag_work_reserved_for_v27_1; v27_0_6_hotfix_lane_reserved_for_emergency_only", "proof_pack_location": "runs/GOVERNANCE_CORRECTION_20260223_174525/", "proof_pack_sha256_config": "3468182b3a2d7cd915c216bc4e04f22c1676ccce8af9ce1f84d1d3ea5d2c7c11", "immutability_guarantee": "v27.0.5-prod_tag_never_modified; production_artifacts_frozen; governance_pack_sealed_with_hashes", "next_phase": "POST-PROD_OPS_PHASE_2_MONITORING_GOVERNED", "status": "ready_to_unblock_phases_2_through_7"}
registry/ui-events.jsonl:72:{"id": "post_prod_ops_phase4_truth_center_complete_20260223T175750Z", "timestamp_utc": "2026-02-23T17:57:50Z", "event_type": "PHASE_4_TRUTH_CENTER_VERDICT", "campaign": "POST-PROD_OPS_CONTINUOUS_GOVERNANCE", "phase": 4, "prod_version": "v27.0.5-prod", "prod_tag_sha": "a1bf79e29be3e6188bd4ab0f9c4d864dd433ab69", "canonical_state": "synchronized", "tag_immutability": "verified_locked", "artifact_signatures": "all_verified_match", "registry_integrity": "append_only_intact", "governance_gates": "9_of_9_verified", "policy_rules": "p0_p1_p2_active", "verdict": "PASS_SEALED_FOR_PRODUCTION", "next_phase_ready": true, "next_phase_options": ["PHASE_5_HOTFIX_LANE", "PHASE_6_AUTONOMY_AUDIT", "PHASE_7_NEXT_VERSION"], "proof_pack_location": "runs/POST_PROD_OPS_PHASE4_TRUTH_CENTER_20260223_175700/"}
registry/ui-events.jsonl:102:{"id":"ui-040","ts":"2026-02-28T13:22:00Z","category":"ui","scope":"routing|singularity|ipc-discipline","change_type":"fix","summary":"Supprime la redirection dupliquée /singularity vers /dev et force le client IPC canonique pour identity_set_matrix","reason":"Éviter une route masquée (UI mapping incohérent) et supprimer un invoke direct hors client canonique TS↔Tauri.","files_changed":["src/App.tsx","src/core/identity/defaultIdentityMatrix.ts","docs/ui/UI_MAP.md","docs/ui/IA_FLOW.mmd"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm run test:architecture x3","pnpm run test:compliance x3","vitest src/tests/e2e/titane_e2e.test.ts x3"],"proofs":["/singularity route unique vers SingularityMonitor","saveIdentityMatrix utilise tauriClient.identitySetMatrix","Cartographie Mermaid UI/IA ajoutée"],"risk_level":"low","rollback":"git restore -- src/App.tsx src/core/identity/defaultIdentityMatrix.ts docs/ui/UI_MAP.md docs/ui/IA_FLOW.mmd registry/ui-events.jsonl","status":"qualified"}
registry/ui-events.jsonl:114:{"id":"ui-event-2026-03-11T16:25:00Z-v24-runtime-reasoning-instrumentation","session":"V24","category":"ui","scope":"chat|reasoning-progress|topology|e2e-selectors","change_type":"fix","summary":"Add runtime-truth reasoning progress instrumentation with stable selectors/state/topology in chat UI.","reason":"V24 visible runtime audit repeatedly reported `reasoningProgressState=ABSENT` and missing stable selectors for proof-level detection.","files_changed":["src/features/chat/ThinkingPanel.tsx","src/ui/pages/Chat.tsx"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm run check (PASS)","pnpm exec eslint src/ui/pages/Chat.tsx src/features/chat/ThinkingPanel.tsx (PASS)","WDIO V24 AppImage run_postfix_1/run_postfix_2/run_postfix_3 (PASS suite, friction unchanged)"],"proofs":["reasoning panel now exposes data-testid=reasoning-progress and data-state","step/topology nodes now expose stable data-testid attributes","AppImage reruns prove distributed artifact remains unchanged without rebuild"],"risk_level":"low","rollback":"git restore -- src/features/chat/ThinkingPanel.tsx src/ui/pages/Chat.tsx registry/ui-events.jsonl","status":"pending-validation"}
registry/ui-events.jsonl:115:{"id":"ui-event-2026-03-11T17:26:00Z-v24-visible-runtime-final-seal","session":"V24","category":"proof","scope":"chat|reasoning-progress|topology|offline-fallback|wdio","change_type":"validation","summary":"Seal V24 visible runtime chat proof on rebuilt AppImage: reasoning progress/state/testid/topology detected and only non-blocking harness friction remains.","reason":"Close V24 with executable proof on a rebuilt artifact that includes the source fixes, and remove the false global offline error signal after successful degraded responses.","files_changed":["src/hooks/useConversationEngine.ts","src/features/chat/ThinkingPanel.tsx","src/components/sections/ConversationSection.tsx","e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js"],"ring":"Ring 4","stability_status":"SEALED","tests_run":["pnpm run check (PASS)","targeted eslint on touched files (PASS)","tauri build --bundles appimage (PASS)","WDIO V24 run_postbuild_final (PASS)","WDIO V24 run_postbuild_topology (PASS)"],"proofs":["run_postbuild_final: reasoningProgressState=done, reasoningProgressTestIdPresent=true, dominantClassification=UI_MINOR_NON_BLOCKING","run_postbuild_topology: reasoningProgressHasTopology=true","visible offline error banner removed while assistant provider tags still expose degraded OFFLINE/FALLBACK_OFFLINE truth"],"risk_level":"low","rollback":"git restore -- src/hooks/useConversationEngine.ts src/features/chat/ThinkingPanel.tsx src/components/sections/ConversationSection.tsx e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js registry/ui-events.jsonl","status":"sealed"}
registry/ui-events.jsonl:117:{"id":"ui-event-2026-03-11T23:40:00Z-v37-appshell-clean-exec","session":"V37","category":"execution","scope":"layout|appshell|overflow","change_type":"fix+execution","summary":"Executed clean MAIN port of AppShell width constraints to remove zoom-induced root overflow.","reason":"Carry validated V33/V34 UI closure through a minimal real execution chain to MAIN.","files_changed":["src/components/layout/AppShell.tsx","src/components/layout/AppShellWithDevTools.tsx"],"ring":"Ring 4","tests_run":["tauri build on clean branch (PASS)","WDIO v22 runtime/ui (PASS)","WDIO v25 interaction (PASS)"],"proofs":["MAIN commit pushed","artifact identity captured in V37 pack","WDIO logs captured in V37 pack"],"risk_level":"low","rollback":"git revert <main_commit_sha>","status":"executed"}
registry/ui-events.jsonl:118:{"id":"ui-event-2026-03-14T00:39:39Z-v26-runtime-truth-panel-and-progress-visibility","ts":"2026-03-14T00:39:39Z","category":"ui","scope":"chat|runtime-truth|testability","change_type":"fix","summary":"Expose a stable runtime truth panel/attrs in chat UI and keep loading signal visible long enough for deterministic runtime-progress probes","reason":"V26 runtime truth gate was blocked by missing `chat-runtime-state` and later by transient progress visibility on fast responses.","files_changed":["src/components/sections/ConversationSection.tsx","src/pages/TitanePage.css"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["get_errors targeted UI files (PASS)","OFFLINE_SIM=0 TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/v26_real_online_chat_truth.wdio.test.js (PASS)","bash scripts/autoheal/detect_recurrence.sh (PASS)","bash scripts/verify_instructions.sh (PASS)"],"proofs":["Added `data-testid=chat-runtime-state`, `chat-runtime-summary`, and `chat-runtime-badge` in chat surface","Runtime attrs exported on assistant message nodes: provider/mode/reason/class/network/orchestrator/memory","V26 metrics now show providerTruthOnline=true, networkProved=true, orchestratorProved=true, memoryProved=true, blockers=[] and verdict=PASS","Added loading grace window to avoid false `RUNTIME_PROGRESS_NOT_VISIBLE` when responses are very fast"],"risk_level":"low","rollback":"git restore -- src/components/sections/ConversationSection.tsx src/pages/TitanePage.css registry/ui-events.jsonl","status":"validated"}
registry/ui-events.jsonl:119:{"id":"ui-event-2026-03-14T00:39:39Z-v26-runtime-truth-panel-and-progress-visibility","ts":"2026-03-14T00:39:39Z","category":"ui","scope":"chat|runtime-truth|testability","change_type":"fix","summary":"Expose a stable runtime truth panel/attrs in chat UI and keep loading signal visible long enough for deterministic runtime-progress probes","reason":"V26 runtime truth gate was blocked by missing `chat-runtime-state` and later by transient progress visibility on fast responses.","files_changed":["src/components/sections/ConversationSection.tsx","src/pages/TitanePage.css"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["get_errors targeted UI files (PASS)","OFFLINE_SIM=0 TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/v26_real_online_chat_truth.wdio.test.js (PASS)","bash scripts/autoheal/detect_recurrence.sh (PASS)","bash scripts/verify_instructions.sh (PASS)"],"proofs":["Added `data-testid=chat-runtime-state`, `chat-runtime-summary`, and `chat-runtime-badge` in chat surface","Runtime attrs exported on assistant message nodes: provider/mode/reason/class/network/orchestrator/memory","V26 metrics now show providerTruthOnline=true, networkProved=true, orchestratorProved=true, memoryProved=true, blockers=[] and verdict=PASS","Added loading grace window to avoid false `RUNTIME_PROGRESS_NOT_VISIBLE` when responses are very fast"],"risk_level":"low","rollback":"git restore -- src/components/sections/ConversationSection.tsx src/pages/TitanePage.css registry/ui-events.jsonl","status":"validated"}
registry/REGISTRY_APPEND_TITANE*Ω∞.jsonl:1:{"id":"TITANE*Ω∞_ABSOLUTE_FINAL","status":"SEALED","timestamp":"2025-02-05T09:25:58Z","version":"v27.0.0","cycle":"Ω∞ ABSOLUTE FINAL","authority":"TITANE∞ Constitutional Instance","pipeline":"Ω∞-0 through Ω∞-9 COMPLETE","phases_complete":8,"gates_passed":7,"tests_executed":111,"tests_passed":111,"tests_failed":0,"tests_skipped":0,"build_errors":0,"build_warnings":0,"typescript_errors":0,"proof_count":9,"artifact_count":5,"artifacts":["TITANE_ABSOLUTE_ASSURANCE_REPORT.md","TITANE_ABSOLUTE_FIXLOG.md","TITANE_ABSOLUTE_PROOFS.md","TITANE_ABSOLUTE_TEST_RESULTS.md","REGISTRY_APPEND_TITANE*Ω∞.jsonl"],"gates":["GATE_CONTRACT","GATE_UI","GATE_LATENCY","GATE_MEMORY","GATE_TRACE","GATE_TESTS","GATE_RELEASE"],"test_breakdown":{"c1_contracts":15,"c2_anti_silence":17,"c3_latency":17,"c4_memory":19,"c5_observability":20,"c6_baseline":23},"build_status":"SUCCESS","typescript_status":"0 ERRORS","deployment_status":"APPROVED","system_state":"STABLE & SEALED","constitutional_verification":"COMPLETE","assumptions_count":0,"omissions_count":0,"regressions_count":0,"locked":true,"recommendation":"DEPLOY TO PRODUCTION IMMEDIATELY","final_certification":"All claims verified through code execution, test assertions, and type verification. No supposition. All proven. System ready for production deployment."}
src/api/tauriClient.ts:44:export async function tauri<T>(
src/api/tauriClient.ts:86:export async function tauriWithRetry<T>(
src/api/tauriClient.ts:137:export async function tauriBatch<T = unknown>(
src/api/tauriClient.ts:158:export function isTauriAvailable(): boolean {
src/constants/timeouts.ts:10:export const API_TIMEOUTS = {
src/constants/timeouts.ts:24:export const REFRESH_INTERVALS = {
src/constants/timeouts.ts:38:export const CACHE_TTL = {
src/constants/timeouts.ts:50:export const UI_DELAYS = {
src/vite-env.d.ts:5: export default content;
src/vite-env.d.ts:10: export default content;
registry/autofix-autoheal-rules.jsonl:1:{"id":"AH-0001","date":"2026-03-04","scope":["docs","workflow","tests","tooling"],"signature":{"symptom":"Absence de règle constitutionnelle gate-enforced pour capturer chaque fix dans AutoFix/AutoHeal","marker":"G_AH_RULE_CAPTURED_FOR_EACH_FIX missing","paths":[".github/copilot-instructions.md",".github/copilot-setup-checklist.md",".github/copilot-workflow.mermaid",".github/instructions/tests-e2e.instructions.md",".github/instructions/titane.instructions.md","scripts/qa/check_autofix_autoheal_registry.mjs","registry/autofix-autoheal-rules.jsonl"]},"root_cause":"La gouvernance documentaire ne forçait pas une capture append-only normalisée + validator après chaque fix.","remediation":{"actions":["Ajouter la règle FIX → CAPTURE → PREVENT FOREVER dans la constitution Copilot","Ajouter la gate G_AH_RULE_CAPTURED_FOR_EACH_FIX","Créer un registre append-only AutoFix/AutoHeal en JSONL","Créer un validator bloquant pour schéma + couverture du dernier fix","Mettre à jour checklist/workflow/tests-e2e/titane instructions"],"bounded_attempts":3,"cooldown_sec":0},"verification":{"commands":["node scripts/qa/check_autofix_autoheal_registry.mjs","git diff --name-only"],"pass_markers":["PASS: JSONL_VALID","PASS: REQUIRED_FIELDS_PRESENT","PASS: LAST_FIX_CAPTURED","PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX"]},"prevention":{"gate_added":"G_AH_RULE_CAPTURED_FOR_EACH_FIX","tests_added_or_updated":["scripts/qa/check_autofix_autoheal_registry.mjs"]},"rollback":["git restore -- .github/copilot-instructions.md .github/copilot-setup-checklist.md .github/copilot-workflow.mermaid .github/instructions/tests-e2e.instructions.md .github/instructions/titane.instructions.md scripts/qa/check_autofix_autoheal_registry.mjs registry/autofix-autoheal-rules.jsonl"]}
registry/autofix-autoheal-rules.jsonl:11:{"id":"AH-0011","date":"2026-03-06","scope":["e2e","wdio","desktop-smoke","runtime-readiness"],"signature":{"symptom":"Desktop smoke x3 was unstable in MAIN_DEV_ALL_TESTS due to launcher and readiness assumptions","marker":"08_E2E_DESKTOP_SMOKE_X3.log -> run_x3 SUMMARY: PASS=3/3 FAIL=0/3 after targeted fixes","paths":["e2e/desktop/ui-ultra-smoke.e2e.js","e2e/desktop/ui-driver.wdio.js","proof_packs/MAIN_DEV_ALL_TESTS_2026-03-06_0808_77d1644cd/08_E2E_DESKTOP_SMOKE_X3.log","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl"]},"root_cause":"The smoke launcher initially used a brittle shell form and the harness required strict ipc-ready visibility plus an unstable page in the smoke route sequence.","remediation":{"actions":["Use explicit env+pnpm invocation for WDIO smoke run","Exclude `optimization` from stable smoke page loop","Accept interactive top-nav as readiness fallback when `ipc-ready` exists but is hidden"],"bounded_attempts":3,"cooldown_sec":0},"verification":{"commands":["env TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-main-dev-e2e/memory TITANE_LOG_DIR=/tmp/titane-main-dev-e2e/logs TITANE_E2E_ARTIFACTS_DIR=proof_packs/MAIN_DEV_ALL_TESTS_2026-03-06_0808_77d1644cd/artifacts/smoke WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js pnpm -s e2e:desktop:run","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh","node scripts/qa/check_autofix_autoheal_registry.mjs"],"pass_markers":["VERDICT: PASS (3/3)","PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX","PASS: G_AH_RECURRENCE_GUARD_PASS","PASS: LAST_FIX_CAPTURED"]},"prevention":{"gate_added":"G_AH_RULE_CAPTURED_FOR_EACH_FIX","tests_added_or_updated":["e2e/desktop/ui-ultra-smoke.e2e.js","e2e/desktop/ui-driver.wdio.js"]},"rollback":["git restore -- e2e/desktop/ui-ultra-smoke.e2e.js e2e/desktop/ui-driver.wdio.js scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl"]}
registry/autofix-autoheal-rules.jsonl:12:{"id":"AH-0012","date":"2026-03-06","scope":["docs","conflict-marker-hygiene","merge-safety"],"signature":{"symptom":"A tracked documentation file still contained literal Git conflict tokens, creating false positives in strict conflict scans","marker":"No tracked files matching '^<<<<<<< ' or '^>>>>>>> ' after doc tokenization","paths":["docs/01_misc/VERIFICATION_FINALE_v26.2.2.md","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl"]},"root_cause":"Historical example content used raw merge delimiters (`<<<<<<<`, `=======`, `>>>>>>>`) instead of neutral placeholders in a docs snippet.","remediation":{"actions":["Replace literal conflict delimiters with neutral placeholder tokens in the documentation snippet","Capture the fix in both append-only AutoHeal registries","Re-run recurrence and registry validators before commit"],"bounded_attempts":3,"cooldown_sec":0},"verification":{"commands":["git grep -n '^<<<<<<< ' -- . || true","git grep -n '^>>>>>>> ' -- . || true","bash scripts/autoheal/detect_recurrence.sh","node scripts/qa/check_autofix_autoheal_registry.mjs","bash scripts/verify_instructions.sh"],"pass_markers":["PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX","PASS: G_AH_RECURRENCE_GUARD_PASS","PASS: LAST_FIX_CAPTURED"]},"prevention":{"gate_added":"G_AH_RULE_CAPTURED_FOR_EACH_FIX","tests_added_or_updated":["scripts/autoheal/detect_recurrence.sh","scripts/qa/check_autofix_autoheal_registry.mjs"]},"rollback":["git restore -- docs/01_misc/VERIFICATION_FINALE_v26.2.2.md scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl"]}
registry/autofix-autoheal-rules.jsonl:16:{"id":"AH-0016","date":"2026-03-06","scope":["deployment","publish-metadata","checksums","sizes","manifest"],"signature":{"symptom":"`deployment/latest` generic metadata no longer matched actual v27.2.0 binaries","marker":"Hashes from `sha256sum` match `MANIFEST.json`, `SHA256SUMS.txt`, and `CHECKSUMS.sha256`; sizes match `SIZES.txt`","paths":["deployment/latest/MANIFEST.json","deployment/latest/SHA256SUMS.txt","deployment/latest/CHECKSUMS.sha256","deployment/latest/SIZES.txt","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl"]},"root_cause":"Generic latest metadata was stale after deploy reruns and was not re-synced against artifact truth.","remediation":{"actions":["Update manifest appimage/deb sha256 and deployment timestamp/commit","Refresh `SHA256SUMS.txt` and `CHECKSUMS.sha256` with current v27.2.0 hashes","Refresh `SIZES.txt` with current byte sizes"],"bounded_attempts":3,"cooldown_sec":0},"verification":{"commands":["sha256sum deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage deployment/latest/TITANE-Infinity_27.2.0_amd64.deb deployment/latest/TITANE-Infinity-27.2.0-1.x86_64.rpm","bash scripts/autoheal/detect_recurrence.sh","node scripts/qa/check_autofix_autoheal_registry.mjs","bash scripts/verify_instructions.sh"],"pass_markers":["PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX","PASS: LAST_FIX_CAPTURED","SUMMARY: PASS=20 FAIL=0"]},"prevention":{"gate_added":"G_AH_RULE_CAPTURED_FOR_EACH_FIX","tests_added_or_updated":["scripts/qa/check_autofix_autoheal_registry.mjs"]},"rollback":["git restore -- deployment/latest/MANIFEST.json deployment/latest/SHA256SUMS.txt deployment/latest/CHECKSUMS.sha256 deployment/latest/SIZES.txt scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl"]}
registry/autofix-autoheal-rules.jsonl:17:{"id":"AH-0017","date":"2026-03-06","scope":["docs","readme","deployment-manifests","metadata-coherence"],"signature":{"symptom":"README/release docs and deployment manifests diverged from current live v27.2.0 artifact metadata after production reruns","marker":"Live metadata sections now reference 0e7bfe39/1c1f15de/4a1601a7 and MANIFEST branch is MAIN","paths":["README.md","docs/90_release/DEPLOYMENT_v27.2.0_COMPLETE.md","deployment/latest/MANIFEST.json","deployment/latest/MANIFEST_v27.2.0.json","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl"]},"root_cause":"Operational redeploy and metadata refreshes were not fully propagated to user-facing docs and versioned manifest file.","remediation":{"actions":["Refresh README latest deployment context and checksum links","Refresh release v27.2.0 artifact table and add explicit post-deploy refresh note","Sync MANIFEST branch/hashes and MANIFEST_v27.2.0 artifact hashes/sizes"],"bounded_attempts":3,"cooldown_sec":0},"verification":{"commands":["rg -n '0e7bfe39|1c1f15de|4a1601a7|runtime revalidated 2026-03-06|Post-Deploy Refresh \\(2026-03-06\\)' README.md docs/90_release/DEPLOYMENT_v27.2.0_COMPLETE.md deployment/latest/MANIFEST_.json -S","sha256sum deployment/latest/TITANE-Infinity*27.2.0_amd64.AppImage deployment/latest/TITANE-Infinity_27.2.0_amd64.deb deployment/latest/TITANE-Infinity-27.2.0-1.x86_64.rpm","bash scripts/autoheal/detect_recurrence.sh","node scripts/qa/check_autofix_autoheal_registry.mjs","bash scripts/verify_instructions.sh"],"pass_markers":["PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX","PASS: LAST_FIX_CAPTURED","SUMMARY: PASS=20 FAIL=0"]},"prevention":{"gate_added":"G_AH_RULE_CAPTURED_FOR_EACH_FIX","tests_added_or_updated":["scripts/qa/check_autofix_autoheal_registry.mjs"]},"rollback":["git restore -- README.md docs/90_release/DEPLOYMENT_v27.2.0_COMPLETE.md deployment/latest/MANIFEST.json deployment/latest/MANIFEST_v27.2.0.json scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl"]}
registry/autofix-autoheal-rules.jsonl:18:{"id":"AH-0018","date":"2026-03-06","scope":["release","docs","tag-prep","post-deploy"],"signature":{"symptom":"No single release-note artifact existed for post-deploy stabilization state on MAIN","marker":"`RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06.md` is linked from README and deployment v27.2.0 doc","paths":["docs/90_release/RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06.md","README.md","docs/90_release/DEPLOYMENT_v27.2.0_COMPLETE.md","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl"]},"root_cause":"Post-deploy evidence was spread across commits and manifests without a dedicated release-note handoff file.","remediation":{"actions":["Create a dedicated post-deploy release note with commit/hashes/smoke evidence","Link the note in README timeline and deployment v27.2.0 documentation","Capture governed fix in both AutoHeal registries"],"bounded_attempts":3,"cooldown_sec":0},"verification":{"commands":["rg -n 'RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06|v27.2.0-main-sync-20260306|smoke_stable_appimage|smoke_stable_installed' README.md docs/90_release/DEPLOYMENT_v27.2.0_COMPLETE.md docs/90_release/RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06.md -S","bash scripts/autoheal/detect_recurrence.sh","node scripts/qa/check_autofix_autoheal_registry.mjs","bash scripts/verify_instructions.sh"],"pass_markers":["PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX","PASS: LAST_FIX_CAPTURED","SUMMARY: PASS=20 FAIL=0"]},"prevention":{"gate_added":"G_AH_RULE_CAPTURED_FOR_EACH_FIX","tests_added_or_updated":["scripts/qa/check_autofix_autoheal_registry.mjs"]},"rollback":["git restore -- docs/90_release/RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06.md README.md docs/90_release/DEPLOYMENT_v27.2.0_COMPLETE.md scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl"]}
registry/REGISTRY_APPEND_TITANE_FINAL.jsonl:1:{"id":"TITANE_OMEGA_v27.0.0","status":"SEALED","timestamp":"2025-02-05T09:25:58Z","version":"v27.0.0","cycle":"Ω FINAL","phases_complete":8,"gates_passed":7,"tests_passing":111,"tests_failing":0,"build_errors":0,"typescript_errors":0,"artifact_count":6,"deliverables":["TITANE_GLOBAL_DISCOVERY.md","TITANE_GLOBAL_AUDIT.md","TITANE_GLOBAL_PATCH_PLAN.md","TITANE_GLOBAL_PROOFS.md","TITANE_GLOBAL_TEST_RESULTS.md","REGISTRY_APPEND_TITANE_FINAL.jsonl"],"gates":["GATE_CONTRACT","GATE_UI","GATE_LATENCY","GATE_MEMORY","GATE_TRACE","GATE_TESTS","GATE_RELEASE"],"test_results":{"c1_contracts":15,"c2_anti_silence":17,"c3_latency":17,"c4_memory":19,"c5_observability":20,"c6_baseline":23,"total":111},"build_status":"SUCCESS","typescript_status":"0 ERRORS","deployment_approval":"SIGNED","locked":true,"authority":"TITANE∞ Constitutional Instance","recommendation":"DEPLOY TO PRODUCTION IMMEDIATELY"}
registry/proofpack-index.jsonl:1:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/AUTHORIZED_TRIGGER_ACTIVATION_2026-03-07_0838_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/AUTHORIZED_TRIGGER_ACTIVATION_2026-03-07_0838_757ae4d4c/"}
registry/proofpack-index.jsonl:2:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/BASELINE_MONITOR_MODE_2026-03-07_1300_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/BASELINE_MONITOR_MODE_2026-03-07_1300_757ae4d4c/"}
registry/proofpack-index.jsonl:3:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/"}
registry/proofpack-index.jsonl:4:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/"}
registry/proofpack-index.jsonl:5:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/"}
registry/proofpack-index.jsonl:6:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/GOVERNED_IDLE_CHARTER_2026-03-07_0830_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/GOVERNED_IDLE_CHARTER_2026-03-07_0830_757ae4d4c/"}
registry/proofpack-index.jsonl:7:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/HYGIENE_RERUN_KEEP_UNTRACKED_2026-03-07_1233_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/HYGIENE_RERUN_KEEP_UNTRACKED_2026-03-07_1233_757ae4d4c/"}
registry/proofpack-index.jsonl:8:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/IDLE_REENTRY_AFTER_TRIGGER_REJECTION_2026-03-07_0844_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/IDLE_REENTRY_AFTER_TRIGGER_REJECTION_2026-03-07_0844_757ae4d4c/"}
registry/proofpack-index.jsonl:9:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/NEXT_CYCLE_ENTRY_GATE_2026-03-07_1254_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/NEXT_CYCLE_ENTRY_GATE_2026-03-07_1254_757ae4d4c/"}
registry/proofpack-index.jsonl:10:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/OMEGA_DORMANT_MASTER_TEMPLATE_2026-03-07_0850_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/OMEGA_DORMANT_MASTER_TEMPLATE_2026-03-07_0850_757ae4d4c/"}
registry/proofpack-index.jsonl:11:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/POST_MERGE_VALIDATION_2026-03-07_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/POST_MERGE_VALIDATION_2026-03-07_757ae4d4c/"}
registry/proofpack-index.jsonl:12:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/POST_SEAL_BASELINE_CANONIZATION_2026-03-07_1245_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/POST_SEAL_BASELINE_CANONIZATION_2026-03-07_1245_757ae4d4c/"}
registry/proofpack-index.jsonl:13:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/PR_CI_UNBLOCK_2026-03-06_1847_5a48aa005/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/PR_CI_UNBLOCK_2026-03-06_1847_5a48aa005/"}
registry/proofpack-index.jsonl:14:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/PR_MAIN_SEAL_READINESS_2026-03-06_1752_5a48aa005/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/PR_MAIN_SEAL_READINESS_2026-03-06_1752_5a48aa005/"}
registry/proofpack-index.jsonl:15:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/"}
registry/proofpack-index.jsonl:16:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/PROD_BUILD_DEPLOY_2026-03-07_1407_757ae4d4c9/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/PROD_BUILD_DEPLOY_2026-03-07_1407_757ae4d4c9/"}
registry/proofpack-index.jsonl:17:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/PROD_BUILD_DEPLOY_RETRY_2026-03-07_1417_757ae4d4c9/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/PROD_BUILD_DEPLOY_RETRY_2026-03-07_1417_757ae4d4c9/"}
registry/proofpack-index.jsonl:18:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/PROD_IDLE_GUARD_2026-03-07_1554_757ae4d4c9/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/PROD_IDLE_GUARD_2026-03-07_1554_757ae4d4c9/"}
registry/proofpack-index.jsonl:19:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9/"}
registry/proofpack-index.jsonl:20:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/SEAL_READINESS_2026-03-07_1309_0af062e88/","classification":"STALE","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/SEAL_READINESS_2026-03-07_1309_0af062e88/"}
registry/proofpack-index.jsonl:21:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/SENTINEL_STANDBY_MODE_2026-03-07_1305_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/SENTINEL_STANDBY_MODE_2026-03-07_1305_757ae4d4c/"}
registry/proofpack-index.jsonl:22:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/TERMINAL_IDLE_ARCHIVE_2026-03-07_0855_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/TERMINAL_IDLE_ARCHIVE_2026-03-07_0855_757ae4d4c/"}
registry/proofpack-index.jsonl:23:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/","classification":"INCOMPLETE","completeness":"INCOMPLETE","incomplete_reason":"INTERRUPTED","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/"}
registry/proofpack-index.jsonl:24:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/","classification":"STALE","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/"}
registry/proofpack-index.jsonl:25:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/"}
registry/proofpack-index.jsonl:26:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/WAKE_PROTOCOL_READY_STATE_2026-03-07_0815_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/WAKE_PROTOCOL_READY_STATE_2026-03-07_0815_757ae4d4c/"}
registry/proofpack-index.jsonl:27:{"ts":"2026-03-07T18:28:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88","pack_path":"proof_packs/WORKSPACE_HYGIENE_AND_SEAL_2026-03-07_0711_757ae4d4c/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"dirty_tree_top_level","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/WORKSPACE_HYGIENE_AND_SEAL_2026-03-07_0711_757ae4d4c/"}
registry/proofpack-index.jsonl:28:{"ts":"2026-03-07T21:52:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1646_f5819cee9","pack_path":"proof_packs/COMMIT_BOUNDARY_2026-03-07_1602_0af062e88/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"untracked_historical_residue","retention_rule":"append_only_proof_pack","residue_policy":"LOCAL_ONLY_HISTORICAL","push_impact":"NON_BLOCKING_LOCAL_ONLY","rollback":"git restore -- proof_packs/COMMIT_BOUNDARY_2026-03-07_1602_0af062e88/"}
registry/proofpack-index.jsonl:29:{"ts":"2026-03-07T21:52:10Z","source_pack":"/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1646_f5819cee9","pack_path":"proof_packs/UNTRACKED_RESIDUE_CLEARANCE_2026-03-07_1630_870348944/","classification":"HISTORICAL_BUT_VALID","completeness":"COMPLETE","incomplete_reason":"N/A","tracked_scope":"untracked_historical_residue","retention_rule":"append_only_proof_pack","residue_policy":"LOCAL_ONLY_HISTORICAL","push_impact":"NON_BLOCKING_LOCAL_ONLY","rollback":"git restore -- proof_packs/UNTRACKED_RESIDUE_CLEARANCE_2026-03-07_1630_870348944/"}
registry/proofpack-index.jsonl:35:{"ts":"2026-03-14T01:02:29Z","source_pack":"proof_packs/PROD_DEPLOY_TOKEN_EXEC_2026-03-13_2057_5b164aa87","pack_path":"proof_packs/PROD_DEPLOY_TOKEN_EXEC_2026-03-13_2057_5b164aa87/","classification":"PROD_TOKEN_EXECUTION","completeness":"COMPLETE","tracked_scope":"token_authorized_prod_build_and_deploy_with_artifact_proof","retention_rule":"append_only_proof_pack","rollback":"git restore -- proof_packs/PROD_DEPLOY_TOKEN_EXEC_2026-03-13_2057_5b164aa87"}
e2e/live-provider-test.spec.ts:119: const messages = document.querySelectorAll(
e2e/PATCH-010-e2e-final.spec.ts:119: ' ✅ [3] 3 API keys loaded to ChatOrchestrator (Gemini, OpenAI, Anthropic)'
src/**tests**/apps/devtools/**snapshots**/DevToolsApp.test.tsx.snap:3:exports[`DevToolsApp > Snapshot > should match snapshot 1`] = `
src/__tests__/apps/devtools/sections/OmegaPipeline.test.tsx:51:      expect(screen.getByTestId('section-header')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/OmegaPipeline.test.tsx:52:      expect(screen.getByText('Omega Pipeline')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/OmegaPipeline.test.tsx:58:      expect(screen.getByText('Current Execution')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/OmegaPipeline.test.tsx:65:      expect(screen.getByText(/Total:/i)).toBeInTheDocument();
e2e/desktop/online-chat-proof.wdio.test.js:241:        const readyState = await browser.execute(() => document.readyState);
src/__tests__/apps/devtools/sections/Logs.test.tsx:51:      expect(screen.getByTestId('section-header')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:52:      expect(screen.getByText('System Logs')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:58:      expect(screen.getByTestId('log-viewer')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:64:      expect(screen.getByTestId('log-filters')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:72:      expect(screen.getByTestId('log-1')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:73:      expect(screen.getByTestId('log-2')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:79:      expect(screen.getByText('Test log 1')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:80:      expect(screen.getByText('Test error')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:89:      expect(filters).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Logs.test.tsx:96:      expect(filterButton).toBeInTheDocument();
e2e/desktop/audio-tts-runtime-controls.wdio.test.js:8:  ensureArtifactsDir,
e2e/desktop/audio-tts-runtime-controls.wdio.test.js:19:const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
e2e/desktop/audio-tts-runtime-controls.wdio.test.js:20:  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
e2e/desktop/audio-tts-runtime-controls.wdio.test.js:23:const METRICS_FILE = path.join(ARTIFACTS_DIR, 'audio_tts_runtime_controls_metrics.json');
e2e/desktop/audio-tts-runtime-controls.wdio.test.js:72:  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
e2e/desktop/audio-tts-runtime-controls.wdio.test.js:166:    await ensureArtifactsDir();
src/__tests__/apps/devtools/sections/Metrics.test.tsx:80:      expect(screen.getByTestId('section-header')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Metrics.test.tsx:81:      expect(screen.getByText('System Metrics')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Metrics.test.tsx:87:      expect(screen.getByTestId('metric-IPC-Latency-P50')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Metrics.test.tsx:88:      expect(screen.getByTestId('metric-IPC-Latency-P90')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Metrics.test.tsx:89:      expect(screen.getByTestId('metric-CPU-Usage')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Metrics.test.tsx:90:      expect(screen.getByTestId('metric-Memory-Usage')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Errors.test.tsx:67:      expect(screen.getByTestId('section-header')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Errors.test.tsx:72:      expect(screen.getByText(/Connection timeout/i)).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Errors.test.tsx:73:      expect(screen.getByText(/Memory limit exceeded/i)).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Errors.test.tsx:79:      expect(screen.getByText(/Connection timeout/i)).toBeInTheDocument();
e2e/desktop/ui-driver.wdio.js:5:const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
e2e/desktop/ui-driver.wdio.js:6:  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
e2e/desktop/ui-driver.wdio.js:236:export async function ensureArtifactsDir() {
e2e/desktop/ui-driver.wdio.js:237:  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
e2e/desktop/ui-driver.wdio.js:240:export async function captureFailureScreenshot(testName = 'unknown') {
e2e/desktop/ui-driver.wdio.js:241:  await ensureArtifactsDir();
e2e/desktop/ui-driver.wdio.js:249:    ARTIFACTS_DIR,
e2e/desktop/ui-driver.wdio.js:253:    await browser.saveScreenshot(screenshotPath);
e2e/desktop/ui-driver.wdio.js:264:export async function waitForDisplayed(selector, timeout = DEFAULT_TIMEOUT) {
e2e/desktop/ui-driver.wdio.js:270:export async function openApp() {
e2e/desktop/ui-driver.wdio.js:275:export async function waitAppReady() {
e2e/desktop/ui-driver.wdio.js:335:export async function gotoTopNavPage(page) {
e2e/desktop/ui-driver.wdio.js:384:export async function clickAllTabs(tabSelectors = []) {
e2e/desktop/ui-driver.wdio.js:429:export async function toggleAllVisibleCheckboxes() {
e2e/desktop/ui-driver.wdio.js:453:export async function fillAllVisibleInputs(sample = 'e2e-sample') {
e2e/desktop/ui-driver.wdio.js:492:export async function sendChatAndAssertNoSilence(message, timeoutMs = 45000) {
e2e/desktop/ui-driver.wdio.js:671:export async function retryLatestUserMessageAndAssertNoSilence(timeoutMs = 45000) {
e2e/desktop/ui-driver.wdio.js:766:export async function getCurrentPathname() {
e2e/desktop/ui-ultra-smoke.e2e.js:6:  ensureArtifactsDir,
e2e/desktop/ui-ultra-smoke.e2e.js:20:    await ensureArtifactsDir();
src/__tests__/apps/devtools/sections/__snapshots__/Dashboard.test.tsx.snap:3:exports[`DevTools Dashboard Section > Snapshot > should match snapshot 1`] = `
src/**tests**/apps/devtools/sections/**snapshots**/Engines.test.tsx.snap:3:exports[`DevTools Engines Section > Snapshot > should match snapshot 1`] = `
src/__tests__/apps/devtools/sections/__snapshots__/Logs.test.tsx.snap:3:exports[`DevTools Logs Section > Snapshot > should match snapshot 1`] = `
src/**tests**/apps/devtools/sections/**snapshots**/Errors.test.tsx.snap:3:exports[`DevTools Errors Section > Snapshot > should match snapshot 1`] = `
src/__tests__/apps/devtools/sections/__snapshots__/Metrics.test.tsx.snap:3:exports[`DevTools Metrics Section > Snapshot > should match snapshot 1`] = `
e2e/AGENTS.md:10:- Required export artifacts must be present.
e2e/AGENTS.md:16:- Required export artifacts.
src/**tests**/apps/devtools/sections/**snapshots**/Memory.test.tsx.snap:3:exports[`DevTools Memory Section > Snapshot > should match snapshot 1`] = `e2e/desktop/audio-settings-persistence.wdio.test.js:29:const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
e2e/desktop/audio-settings-persistence.wdio.test.js:30:  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
e2e/desktop/audio-settings-persistence.wdio.test.js:33:const METRICS_FILE = path.join(ARTIFACTS_DIR, 'audio_settings_persistence_metrics.json');
e2e/desktop/audio-settings-persistence.wdio.test.js:48:  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
e2e/desktop/audio-settings-persistence.wdio.test.js:131:    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:85:    const testIdCandidates = Array.from(document.querySelectorAll('[data-testid]'))
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:92:      document.querySelectorAll('textarea, input, [contenteditable="true"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:114:    const headings = Array.from(document.querySelectorAll('h1'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:159:    const testIdCandidates = Array.from(document.querySelectorAll('[data-testid]'))
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:166:      document.querySelectorAll('textarea, input, [contenteditable="true"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:186:    const headings = Array.from(document.querySelectorAll('h1'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:208:    const byTestId = Array.from(document.querySelectorAll('[data-testid]')).find(el =>
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:214:    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:256:    const byTestId = Array.from(document.querySelectorAll('[data-testid]')).find(el =>
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:261:    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:287:      document.querySelectorAll('[data-testid="assistant-message"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:292:    const allElements = Array.from(document.querySelectorAll('div, article, section'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:315:    const byTestId = document.querySelector('[data-testid="nav-chat"]');
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:320:      document.querySelectorAll('a, button, [role="link"], [role="button"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:376:      title: document.title,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:390:      title: document.title,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:393:      h1Texts: Array.from(document.querySelectorAll('h1')).map(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:454:        const testIdCandidates = Array.from(document.querySelectorAll('[data-testid]'))
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:462:          document.querySelectorAll('textarea, input, [contenteditable="true"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:482:        const headings = Array.from(document.querySelectorAll('h1'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:512:        const testIdCandidates = Array.from(document.querySelectorAll('[data-testid]'))
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:521:          document.querySelectorAll('textarea, input, [contenteditable="true"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:542:        const headings = Array.from(document.querySelectorAll('h1'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:560:        const byTestId = Array.from(document.querySelectorAll('[data-testid]')).find(el =>
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:565:        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:604:        const byTestId = Array.from(document.querySelectorAll('[data-testid]')).find(el =>
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:609:        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:629:          document.querySelectorAll('[data-testid="assistant-message"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:634:          document.querySelectorAll('div, article, section')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:654:        const byTestId = document.querySelector('[data-testid="nav-chat"]');
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:658:          document.querySelectorAll('a, button, [role="link"], [role="button"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:709:          title: document.title,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:717:          title: document.title,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:720:          h1Texts: Array.from(document.querySelectorAll('h1')).map(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:760:        textareaCount: document.querySelectorAll('textarea').length,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:777:        const el = document.querySelector(selector);
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:785:        document.querySelectorAll(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:959:          .saveScreenshot(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:960:            path.join(REPORT_DIR, 'artifacts',`detection_retry*${attempt}.png`)
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:999:        title: document.title,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1000:        textareaCount: document.querySelectorAll('textarea').length,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1001:        buttonCount: document.querySelectorAll('button').length,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1002:        bodyClasses: document.body.className,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1116:      .saveScreenshot(path.join(REPORT_DIR, 'artifacts', `timeout_${Date.now()}.png`))
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1160:  const filepath = path.join(REPORT_DIR, 'exports', filename);
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1175: * Write markdown file
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1177:function writeMarkdown(filename, content) {
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1180:  console.log(`✅ Markdown written: ${filename}`);
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1190:      (document.body && (document.body.innerText || document.body.textContent)) || '';
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1191:    const buttons = Array.from(document.querySelectorAll('button'))
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1195:      document.querySelectorAll(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1201:    const dataTestIds = Array.from(document.querySelectorAll('[data-testid]'))
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1204:    const h1Texts = Array.from(document.querySelectorAll('h1'))
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1211:      title: document.title,
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1268:      const skipCandidate = Array.from(document.querySelectorAll('button, a')).find(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1275:      const nextCandidate = Array.from(document.querySelectorAll('button, a')).find(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1286:      document.querySelectorAll('a, button, [role="button"], [role="link"]')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1328: * Build markdown for page classification
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1330:function buildPageClassificationMarkdown(report) {
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1446:                    (document.body &&
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1447:                      (document.body.innerText || document.body.textContent || '')) ||
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1451:                    document.querySelector('[data-testid="chat-input"], textarea')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1454:                    document.querySelectorAll('[data-testid]').length > 0;
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1496:            const nextButton = Array.from(document.querySelectorAll('button, a')).find(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1600:      fs.mkdirSync(path.join(REPORT_DIR, 'exports'), { recursive: true });
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1601:      fs.mkdirSync(path.join(REPORT_DIR, 'artifacts'), { recursive: true });
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1659:      await browser.saveScreenshot(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:1660:        path.join(REPORT_DIR, 'artifacts', 'dom_initial_state.png')
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:2054:          await browser.saveScreenshot(
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:2057:              'artifacts',
src/__tests__/apps/devtools/sections/__snapshots__/OmegaPipeline.test.tsx.snap:3:exports[`DevTools OmegaPipeline Section > Snapshot > should match snapshot 1`] = `
src/__tests__/apps/devtools/sections/Engines.test.tsx:70:      expect(screen.getByTestId('section-header')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Engines.test.tsx:75:      expect(screen.getByTestId('engine-chat-engine')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Engines.test.tsx:76:      expect(screen.getByTestId('engine-memory-engine')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Engines.test.tsx:77:      expect(screen.getByTestId('engine-fusion-engine')).toBeInTheDocument();
e2e/desktop/chat-mic-accessibility.wdio.test.js:23:const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
e2e/desktop/chat-mic-accessibility.wdio.test.js:24:  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
e2e/desktop/chat-mic-accessibility.wdio.test.js:27:const METRICS_FILE = path.join(ARTIFACTS_DIR, 'chat_mic_accessibility_metrics.json');
e2e/desktop/chat-mic-accessibility.wdio.test.js:42:  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
e2e/desktop/chat-mic-accessibility.wdio.test.js:71:    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:18:const RUN_ARTIFACTS = process.env.RUN_ARTIFACTS || '/tmp/v24_artifacts';
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:23:fs.mkdirSync(RUN_ARTIFACTS, { recursive: true });
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:50:  orchestratorSyncState: 'UNKNOWN',
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:87:    await browser.saveScreenshot(fp);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:130:function saveMetrics(suffix) {
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:132:    const f = path.join(RUN_ARTIFACTS, `${RUN_ID}\_v24_metrics${suffix || ''}.json`);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:134:    console.log(`[METRICS] saved => ${f}`);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:136:    console.warn('[METRICS] save failed:', e.message);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:144:    const appRoot = document.getElementById('root');
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:149:    const splashEl = document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:164:      document.querySelectorAll(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:170:    const inputEl = document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:175:    const sendEl = document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:189:    const providerReady = !!document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:192:    const memoryInd = !!document.querySelector('[data-memory], [data-testid*="memory"]');
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:193:    const orchestratorInd = !!document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:194:      '[data-orchestrator], [data-testid*="orchestrator"]'
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:196:    const chatActiveInd = !!document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:200:    const progressComp = document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:204:    const progressHasTestId = !!document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:213:    const progressTopologyCount = document.querySelectorAll(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:218:    const scrollContainers = Array.from(document.querySelectorAll('*')).filter(el => {
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:227:    const bodyOverflow = getComputedStyle(document.body).overflow;
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:228:    const htmlOverflow = getComputedStyle(document.documentElement).overflow;
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:233:    const focusStyle = document.querySelector('[class*="focus"], [class*="Focus"]');
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:234:    const tabFocusRulePresent = !!(focusStyle || document.styleSheets.length > 0);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:236:    const hasVisibleText = document.body.innerText.trim().length > 10;
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:237:    const hasVisibleElements = document.body.children.length > 0 && rootChildren > 0;
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:240:    const errorBanner = document.querySelector(
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:292:      orchestratorInd,
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:306:      bodyText: document.body.innerText.slice(0, 400),
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:308:      pageTitle: document.title,
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:447:    M.orchestratorSyncState = r1.orchestratorInd ? 'VISIBLE' : 'NOT_DETECTABLE_FROM_DOM';
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:477:    saveMetrics('_s1');
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:511:        const els = document.querySelectorAll(sel);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:524:      const navEl = document.querySelector('nav, [role="navigation"], header');
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:554:      const lenBefore = await browser.execute(() => document.body.innerHTML.length);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:564:      const lenTime = await browser.execute(() => document.body.innerHTML.length);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:639:          const el = document.querySelector(sel);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:686:          const el = document.querySelector(sel);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:703:              const el = document.querySelector(sel);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:736:                const el = document.querySelector(sel);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:764:          const lenBefore = await browser.execute(() => document.body.innerHTML.length);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:766:            const el = document.querySelector(sel);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:797:          const lenAfter = await browser.execute(() => document.body.innerHTML.length);
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:920:          document.querySelectorAll('[class*="error" i], [role="alert"]')
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:923:          document.querySelectorAll('[class*="overlay"], [class*="modal"]')
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:925:        const scrollEls = Array.from(document.querySelectorAll('*')).filter(el => {
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:948:          inputCount: document.querySelectorAll('textarea, input[type="text"]').length,
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:949:          buttonCount: document.querySelectorAll('button:not([disabled])').length,
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:950:          scriptCount: document.scripts.length,
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:951:          stylesheetCount: document.styleSheets.length,
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:953:          bodyOverflow: getComputedStyle(document.body).overflow,
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:954:          htmlOverflow: getComputedStyle(document.documentElement).overflow,
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:986:      saveMetrics('');
e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js:1008:        saveMetrics('_s5_session_crash');
e2e/critical/engine-navigation.spec.ts:16:  'Orchestrator',
e2e/critical/engine-navigation.spec.ts:92:  test('orchestrator controls are present', async ({ page }) => {
e2e/critical/engine-navigation.spec.ts:93:    // Look for orchestrator-related controls
e2e/critical/engine-navigation.spec.ts:94:    const orchestratorMentions = await page
e2e/critical/engine-navigation.spec.ts:98:    // Orchestrator should be referenced somewhere
e2e/critical/engine-navigation.spec.ts:99:    expect(orchestratorMentions).toBeGreaterThanOrEqual(0);
src/__tests__/apps/devtools/sections/Memory.test.tsx:58:      expect(screen.getByTestId('section-header')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:59:      expect(screen.getByText(/Memory Explorer/i)).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:64:      expect(screen.getByTestId('memory-tree')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:69:      expect(screen.getByTestId('node-stm')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:70:      expect(screen.getByTestId('node-mtm')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:71:      expect(screen.getByTestId('node-ltm')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:76:      expect(screen.getByText(/150 entries/i)).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:77:      expect(screen.getByText(/500 entries/i)).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:78:      expect(screen.getByText(/2000 entries/i)).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Memory.test.tsx:86:      expect(purgeBtn).toBeInTheDocument();
e2e/critical/system-resilience.spec.ts:158:      document.body.getBoundingClientRect();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:67:      expect(screen.getByTestId('section-header')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:68:      expect(screen.getByText('System Dashboard')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:75:      expect(metricsDisplay).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:81:      expect(screen.getByText('System Health')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:82:      expect(screen.getByTestId('status-pill')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:90:      expect(screen.getByTestId('metric-card-IPC-Latency-P50')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:91:      expect(screen.getByTestId('metric-card-CPU-Usage')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:99:      expect(screen.getByTestId('engine-helios')).toBeInTheDocument();
src/__tests__/apps/devtools/sections/Dashboard.test.tsx:100:      expect(screen.getByTestId('engine-nexus')).toBeInTheDocument();
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:13:const ARTIFACTS_DIR = process.env.RUN_ARTIFACTS || '/tmp/v20_run3_artifacts';
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:16:fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:33:    await browser.saveScreenshot(p);
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:42:    const splash = document.querySelector('.loading-splash');
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:43:    const root = document.getElementById('root');
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:68:    const allBtns = document.querySelectorAll('button');
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:72:    const allInputs = document.querySelectorAll('input,textarea');
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:76:    const allTabs = document.querySelectorAll('[role="tab"]');
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:82:    document
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:104:      Object.entries(document.documentElement.dataset)
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:142:    const outPath = path.join(ARTIFACTS_DIR, `${RUN_ID}\_cert_metrics.json`);
e2e/desktop/v20_desktop_cert_audit.wdio.test.js:260:        const s = document.querySelector('.loading-splash');
src/__tests__/apps/devtools/DevToolsApp.test.tsx:59:      expect(title).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:66:      expect(subtitle).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:73:      expect(statusDot).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:80:      expect(main).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:100:        expect(tab).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:118:      expect(screen.getByTestId('tabs-component')).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:124:      expect(screen.getByTestId('tabs-component')).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:134:        expect(screen.getByTestId('tabs-content')).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:143:      expect(metricsTab).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:146:      expect(logsTab).toBeInTheDocument();
src/__tests__/apps/devtools/DevToolsApp.test.tsx:189:        expect(screen.getByTestId('tabs-component')).toBeInTheDocument();
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:3: * Scope: visible chat truth with runtime panel, provider/network/orchestrator verification
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:12:const RUN_ARTIFACTS = process.env.RUN_ARTIFACTS || '/tmp/v26_artifacts';
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:17:fs.mkdirSync(RUN_ARTIFACTS, { recursive: true });
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:55:  orchestratorProved: false,
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:75:  await browser.saveScreenshot(filePath);
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:80:function saveMetrics() {
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:81:  const output = path.join(RUN_ARTIFACTS, `${RUN_ID}_v26_metrics.json`);
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:83:  console.log(`[METRICS] saved => ${output}`);
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:89:      const input = document.querySelector('[data-testid="chat-input"]');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:90:      const send = document.querySelector('[data-testid="chat-send"]');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:91:      const loading = document.querySelector('[data-testid="chat-loading"]');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:92:      const error = document.querySelector('[data-testid="chat-error"]');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:93:      const health = document.querySelector('[data-testid="btn-health-check"]');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:94:      const reasoning = document.querySelector('[data-testid="reasoning-progress"]');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:95:      const runtimePanel = document.querySelector('[data-testid="chat-runtime-state"]');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:96:      const runtimeSummary = document.querySelector(
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:101:        document.querySelectorAll(
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:109:        document.querySelectorAll('[data-testid="chat-message-assistant"]')
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:131:            orchestratorState: lastAssistantContainer.getAttribute(
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:132:              'data-orchestrator-state'
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:144:            orchestratorState: runtimePanel.getAttribute('data-orchestrator-state'),
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:158:      const visibleText = (document.body.textContent || '').trim();
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:180:        reasoningTopologyCount: document.querySelectorAll(
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:252:      document.querySelectorAll('button, [role="tab"], a, [data-testid*="chat" i]')
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:291:  const orchestratorState = String(
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:292:    attrs.orchestratorState || msgAttrs.orchestratorState || ''
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:319:  M.orchestratorProved =
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:320:    orchestratorState === 'running' || orchestratorState === 'initialized';
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:329:  if (!M.orchestratorProved) M.classifications.push('ORCHESTRATOR_NOT_PROVED');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:370:  if (!M.orchestratorProved) {
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:371:    M.blockers.push('ORCHESTRATOR_NOT_PROVED');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:432:      saveMetrics();
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:455:          const node = document.querySelector(sel);
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:489:      saveMetrics();
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:495:      const button = document.querySelector(sel);
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:580:      const button = document.querySelector('[data-testid="btn-health-check"]');
e2e/desktop/v26_real_online_chat_truth.wdio.test.js:601:    saveMetrics();
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:29:const EXPORTS_DIR = path.join(REPORT_DIR, 'exports');
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:32:for (const d of [REPORT_DIR, SCREEN_DIR, EXPORTS_DIR, LOGS_DIR]) {
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:72:  const fp = path.join(EXPORTS_DIR, filename);
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:94:    await browser.saveScreenshot(filepath);
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:185:          const ready = await browser.execute(() => document.readyState);
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:208:    const byTestId = document.querySelector('[data-testid="chat-input"]');
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:217:      document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:251:    const byTestId = document.querySelector('[data-testid="chat-send"]');
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:254:    const buttons = Array.from(document.querySelectorAll('button'));
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:282:    const msgs = document.querySelectorAll('[data-testid="chat-message-assistant"]');
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:285:    const roleContainers = document.querySelectorAll(
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:356:          const spinner = document.querySelector(
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:376:        document.querySelectorAll(
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:383:        document.querySelectorAll('[data-testid="chat-message-assistant"]')
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:798:          const el = document.querySelector(
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:1101:        'get_orchestrator_status',
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:1259:          document.querySelectorAll(
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:1280:              document.querySelectorAll(
e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs:1457:        root_cause: `See reports/chat_ia_complete_simulation/${REPORT_TS}/exports/ for detailed per-phase JSON reports`,
e2e/desktop/tts-buffer-runtime-truth.wdio.test.js:18:  ensureArtifactsDir,
e2e/desktop/tts-buffer-runtime-truth.wdio.test.js:23:const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
e2e/desktop/tts-buffer-runtime-truth.wdio.test.js:24:  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
e2e/desktop/tts-buffer-runtime-truth.wdio.test.js:27:const METRICS_FILE = path.join(ARTIFACTS_DIR, 'tts_generate_buffer_metrics.json');
e2e/desktop/tts-buffer-runtime-truth.wdio.test.js:49:  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
e2e/desktop/tts-buffer-runtime-truth.wdio.test.js:87:    ensureArtifactsDir(ARTIFACTS_DIR);
e2e/desktop/chat-ar20.wdio.test.js:179:          const readyState = await browser.execute(() => document.readyState);
e2e/desktop/chat-ar20.wdio.test.js:350:// Save results to report file
e2e/desktop/chat-ar20.wdio.test.js:351:function saveResults() {
e2e/desktop/chat-ar20.wdio.test.js:354:  console.log(`\n✅ Report saved: ${REPORT_FILE}`);
e2e/desktop/chat-ar20.wdio.test.js:374:        const readyState = await browser.execute(() => document.readyState);
e2e/desktop/chat-ar20.wdio.test.js:415:    saveResults();
e2e/desktop/total-dev.wdio.test.js:5:  ensureArtifactsDir,
e2e/desktop/total-dev.wdio.test.js:111:    await ensureArtifactsDir();
src/__tests__/apps/Settings/Settings.test.tsx:37:      expect(title).toBeInTheDocument();
src/__tests__/apps/Settings/Settings.test.tsx:52:      expect(section).toBeInTheDocument();
src/__tests__/apps/Settings/Settings.test.tsx:63:      expect(section).toBeInTheDocument();
src/__tests__/apps/Settings/Settings.test.tsx:73:      expect(switcher).toBeInTheDocument();
src/__tests__/apps/Settings/Settings.test.tsx:91:      expect(container.querySelector('.settings')).toBeInTheDocument();
src/__tests__/apps/Settings/Settings.test.tsx:92:      expect(container.querySelector('header')).toBeInTheDocument();
src/__tests__/apps/Settings/Settings.test.tsx:102:      expect(screen.getByText('settings.title')).toBeInTheDocument();
src/__tests__/apps/Settings/Settings.test.tsx:103:      expect(screen.getByText('settings.general')).toBeInTheDocument();
src/__tests__/apps/Settings/Settings.test.tsx:104:      expect(screen.getByText('settings.appearance')).toBeInTheDocument();
e2e/desktop/total-dev-debug.wdio.test.js:21:      const bodyHTML = document.body.innerHTML.substring(0, 1000);
e2e/desktop/total-dev-debug.wdio.test.js:22:      const h = document.querySelector('[data-testid="total-dev-header"]');
e2e/desktop/total-dev-debug.wdio.test.js:23:      const lock = document.querySelector('[data-testid="lock-badge"]');
e2e/desktop/total-dev-debug.wdio.test.js:24:      const panel = document.querySelector('.total-dev-unlock-panel');
e2e/desktop/total-dev-debug.wdio.test.js:25:      const allDataTestIds = Array.from(document.querySelectorAll('[data-testid]')).map(
e2e/desktop/total-dev-debug.wdio.test.js:36:        bodyClass: document.body.className,
e2e/desktop/total-dev-debug.wdio.test.js:57:      header: !!document.querySelector('[data-testid="total-dev-header"]'),
e2e/desktop/total-dev-debug.wdio.test.js:58:      lock: !!document.querySelector('[data-testid="lock-badge"]'),
e2e/desktop/total-dev-debug.wdio.test.js:59:      panel: !!document.querySelector('.total-dev-unlock-panel'),
e2e/desktop/total-dev-debug.wdio.test.js:75:      header: !!document.querySelector('[data-testid="total-dev-header"]'),
e2e/desktop/total-dev-debug.wdio.test.js:76:      lock: !!document.querySelector('[data-testid="lock-badge"]'),
e2e/desktop/total-dev-debug.wdio.test.js:77:      panel: !!document.querySelector('.total-dev-unlock-panel'),
e2e/desktop/total-dev-debug.wdio.test.js:94:        const more = document.querySelector('[data-testid="btn-nav-more"]');
e2e/desktop/total-dev-debug.wdio.test.js:95:        const totalDev = document.querySelector('[data-testid="nav-total-dev"]');
e2e/desktop/total-dev-debug.wdio.test.js:96:        const menu = document.querySelector('[role="menu"]');
e2e/desktop/total-dev-debug.wdio.test.js:102:          navIds: Array.from(document.querySelectorAll('[data-testid^="nav-"]'))
e2e/desktop/smoke.wdio.test.js:4:  it('loads the app root document', async () => {
src/__tests__/apps/Settings/__snapshots__/Settings.test.tsx.snap:3:exports[`Settings Page > Snapshot > should match snapshot 1`] = `
e2e/live-component-wait.spec.ts:29:      buttons: document.querySelectorAll('button').length,
e2e/live-component-wait.spec.ts:30:      inputs: document.querySelectorAll('input').length,
e2e/live-component-wait.spec.ts:31:      textareas: document.querySelectorAll('textarea').length,
e2e/live-component-wait.spec.ts:32:      divs: document.querySelectorAll('div').length,
e2e/live-component-wait.spec.ts:33:      forms: document.querySelectorAll('form').length,
e2e/live-component-wait.spec.ts:34:      contenteditable: document.querySelectorAll('[contenteditable]').length,
e2e/live-component-wait.spec.ts:36:        textbox: document.querySelectorAll('[role="textbox"]').length,
e2e/live-component-wait.spec.ts:37:        button: document.querySelectorAll('[role="button"]').length,
e2e/live-component-wait.spec.ts:38:        main: document.querySelectorAll('[role="main"]').length,
e2e/live-component-wait.spec.ts:51:    const cedit = document.querySelectorAll('[contenteditable]');
e2e/live-component-wait.spec.ts:62:    const messageInputs = document.querySelectorAll(
e2e/live-component-wait.spec.ts:86:  console.log(`[LIVE-PROVIDER] Screenshot saved to ${screenshotPath}`);
e2e/live-component-wait.spec.ts:90:    document.documentElement.outerHTML.substring(0, 2000)
e2e/live-component-wait.spec.ts:98:      documentReady: document.readyState,
e2e/live-component-wait.spec.ts:99:      bodyExists: !!document.body,
e2e/live-component-wait.spec.ts:101:      appElement: !!document.getElementById('root') || !!document.getElementById('app'),
e2e/features/audio-center.spec.ts:165:  test('Audio Center: save settings button', async ({ page }) => {
e2e/features/audio-center.spec.ts:166:    // Look for save button
e2e/features/audio-center.spec.ts:167:    const saveButton = page
e2e/features/audio-center.spec.ts:169:        'button:has-text("Enregistrer"), button:has-text("Save"), button:has-text("Sauvegarder")'
e2e/features/audio-center.spec.ts:173:    if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
e2e/features/audio-center.spec.ts:174:      await saveButton.click();
e2e/features/audio-center.spec.ts:180:      console.log('⚠️ Save button not found (settings may auto-save)');
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:18:const RUN_ARTIFACTS = process.env.RUN_ARTIFACTS || '/tmp/v22_artifacts';
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:23:fs.mkdirSync(RUN_ARTIFACTS, { recursive: true });
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:48:  orchestratorSyncState: 'UNKNOWN',
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:77:    await browser.saveScreenshot(fp);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:120:function saveMetrics(suffix) {
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:122:    const f = path.join(RUN_ARTIFACTS, `${RUN_ID}\_v22_metrics${suffix || ''}.json`);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:124:    console.log(`[METRICS] saved => ${f}`);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:126:    console.warn('[METRICS] save failed:', e.message);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:134:    const appRoot = document.getElementById('root');
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:139:    const splashEl = document.querySelector(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:154:      document.querySelectorAll(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:160:    const inputEl = document.querySelector(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:165:    const sendEl = document.querySelector(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:179:    const providerReady = !!document.querySelector(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:182:    const memoryInd = !!document.querySelector('[data-memory], [data-testid*="memory"]');
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:183:    const orchestratorInd = !!document.querySelector(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:184:      '[data-orchestrator], [data-testid*="orchestrator"]'
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:186:    const chatActiveInd = !!document.querySelector(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:190:    const progressComp = document.querySelector(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:196:    const scrollContainers = Array.from(document.querySelectorAll('*')).filter(el => {
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:205:    const bodyOverflow = getComputedStyle(document.body).overflow;
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:206:    const htmlOverflow = getComputedStyle(document.documentElement).overflow;
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:211:    const focusStyle = document.querySelector('[class*="focus"], [class*="Focus"]');
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:212:    const tabFocusRulePresent = !!(focusStyle || document.styleSheets.length > 0);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:214:    const hasVisibleText = document.body.innerText.trim().length > 10;
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:215:    const hasVisibleElements = document.body.children.length > 0 && rootChildren > 0;
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:218:    const errorBanner = document.querySelector(
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:270:      orchestratorInd,
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:280:      bodyText: document.body.innerText.slice(0, 400),
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:282:      pageTitle: document.title,
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:381:    M.orchestratorSyncState = r1.orchestratorInd ? 'VISIBLE' : 'NOT_DETECTABLE_FROM_DOM';
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:407:    saveMetrics('_s1');
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:441:        const els = document.querySelectorAll(sel);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:454:      const navEl = document.querySelector('nav, [role="navigation"], header');
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:484:      const lenBefore = await browser.execute(() => document.body.innerHTML.length);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:494:      const lenTime = await browser.execute(() => document.body.innerHTML.length);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:569:          const el = document.querySelector(sel);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:591:            const el = document.querySelector(sel);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:623:          const el = document.querySelector(sel);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:636:          const lenBefore = await browser.execute(() => document.body.innerHTML.length);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:638:            const el = document.querySelector(sel);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:644:          const lenAfter = await browser.execute(() => document.body.innerHTML.length);
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:764:          document.querySelectorAll('[class*="error" i], [role="alert"]')
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:767:          document.querySelectorAll('[class*="overlay"], [class*="modal"]')
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:774:          inputCount: document.querySelectorAll('textarea, input[type="text"]').length,
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:775:          buttonCount: document.querySelectorAll('button:not([disabled])').length,
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:776:          scriptCount: document.scripts.length,
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:777:          stylesheetCount: document.styleSheets.length,
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:801:      saveMetrics('');
e2e/desktop/v22_visible_real_ui_cert.wdio.test.js:816:        saveMetrics('_s5_session_crash');
src/__tests__/chat-ia-stability.test.ts:21:  const memorySaveMessage = vi.fn((message: AIMessage) => {
src/__tests__/chat-ia-stability.test.ts:36:    saveMessage: memorySaveMessage,
src/__tests__/chat-ia-stability.test.ts:81:    memorySaveMessage,
src/__tests__/chat-ia-stability.test.ts:118:  memorySaveMessage,
src/__tests__/chat-ia-stability.test.ts:372:  it('GUARD: useEffect ne doit pas se déclencher à chaque saveMessage', async () => {
e2e/PATCH-010-policy-gate.spec.ts:78:  console.log('✅ [2/5] bootstrap_api_keys() → ChatOrchestrator: VALIDATED');
e2e/PATCH-010-policy-gate.spec.ts:79:  console.log('✅ [3/5] ChatOrchestrator State: VALIDATED (3 keys present)');
src/__tests__/e2e-performance.test.ts:7:import { aiOrchestrator } from '../services/ai/orchestrator';
src/__tests__/e2e-performance.test.ts:22:    const result = await aiOrchestrator.generate('Performance test', []);
src/__tests__/e2e-performance.test.ts:40:    const result = await aiOrchestrator.generate('Test with history', largeHistory);
src/__tests__/e2e-performance.test.ts:53:      const result = await aiOrchestrator.generate(message, []);
src/__tests__/e2e-performance.test.ts:64:      aiOrchestrator.generate('Burst test', [])
e2e/desktop/memory-conversations.wdio.test.js:97: * Helper: Save results to JSON report
e2e/desktop/memory-conversations.wdio.test.js:99:function saveResults() {
e2e/desktop/memory-conversations.wdio.test.js:102:  console.log(`\n✅ Memory Conversations Report saved: ${REPORT_FILE}`);
e2e/desktop/memory-conversations.wdio.test.js:119:        const readyState = await browser.execute(() => document.readyState);
e2e/desktop/memory-conversations.wdio.test.js:153:    saveResults();
e2e/desktop/online-chat-proof-ui.wdio.test.js:32:    const scripts = Array.from(document.querySelectorAll('script[src]'))
e2e/desktop/online-chat-proof-ui.wdio.test.js:271:    const nodes = Array.from(document.querySelectorAll(sel));
e2e/desktop/online-chat-proof-ui.wdio.test.js:279:    const root = document.getElementById('root');
e2e/desktop/online-chat-proof-ui.wdio.test.js:280:    const testIds = Array.from(document.querySelectorAll('[data-testid]'))
e2e/desktop/online-chat-proof-ui.wdio.test.js:284:    const textareas = Array.from(document.querySelectorAll('textarea'))
e2e/desktop/online-chat-proof-ui.wdio.test.js:293:      title: document.title,
e2e/desktop/online-chat-proof-ui.wdio.test.js:294:      bodyTextHead: (document.body?.innerText || '').slice(0, 400),
e2e/desktop/online-chat-proof-ui.wdio.test.js:295:      htmlHead: (document.documentElement?.outerHTML || '').slice(0, 800),
e2e/desktop/online-chat-proof-ui.wdio.test.js:432:  return await browser.execute(sel => document.querySelectorAll(sel).length, selector);
e2e/desktop/online-chat-proof-ui.wdio.test.js:437:    const panel = document.querySelector('[data-testid="chat-runtime-state"]');
e2e/desktop/online-chat-proof-ui.wdio.test.js:438:    const summary = document.querySelector('[data-testid="chat-runtime-summary"]');
e2e/desktop/online-chat-proof-ui.wdio.test.js:439:    const ipcReady = document.querySelector('[data-testid="ipc-ready"]');
e2e/desktop/online-chat-proof-ui.wdio.test.js:440:    const assistantRows = document.querySelectorAll(
e2e/desktop/online-chat-proof-ui.wdio.test.js:449:      ? document.querySelectorAll(responseSelector)
e2e/desktop/online-chat-proof-ui.wdio.test.js:576:      const readyState = await browser.execute(() => document.readyState);
e2e/desktop/online-chat-proof-ui.wdio.test.js:583:    { timeout: 30000, interval: 500, timeoutMsg: 'Document not ready' }
e2e/desktop/online-chat-proof-ui.wdio.test.js:613:          const root = document.getElementById('root');
e2e/desktop/online-chat-proof-ui.wdio.test.js:616:            !!document.querySelector('[data-testid="chat-bubble-trigger"]') ||
e2e/desktop/online-chat-proof-ui.wdio.test.js:617:            !!document.querySelector('[data-testid="chat-bubble-input"]') ||
e2e/desktop/online-chat-proof-ui.wdio.test.js:618:            !!document.querySelector('#chat-window-textarea') ||
e2e/desktop/online-chat-proof-ui.wdio.test.js:619:            !!document.querySelector('#chat-input-textarea') ||
e2e/desktop/online-chat-proof-ui.wdio.test.js:620:            !!document.querySelector('[data-testid="chat-input"]');
e2e/desktop/online-chat-proof-ui.wdio.test.js:672:    const el = document.querySelector(sel);
e2e/desktop/online-chat-proof-ui.wdio.test.js:685:        return document.querySelector(sel)?.value || '';
e2e/desktop/online-chat-proof-ui.wdio.test.js:689:        const button = document.querySelector(sel);
e2e/desktop/online-chat-proof-ui.wdio.test.js:902:      const assistantMsgs = document.querySelectorAll(
e2e/desktop/online-chat-proof-ui.wdio.test.js:934:      const assistantMsgs = document.querySelectorAll(
e2e/desktop/online-chat-proof-ui.wdio.test.js:988:        const panel = document.querySelector('[data-testid="chat-runtime-state"]');
e2e/desktop/online-chat-proof-ui.wdio.test.js:989:        const assistantMsgs = document.querySelectorAll(
e2e/desktop/test-direct-wdio-connection.wdio.test.cjs:4: * Bypasses orchestrator; runs directly via wdio CLI
e2e/desktop/admin-design-truth.wdio.test.js:97:    const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
e2e/desktop/admin-design-truth.wdio.test.js:207:    await clickSafe('.dc-btn-save');
e2e/desktop/admin-design-truth.wdio.test.js:208:    const postSaveStatus = await detectDesignStatus();
e2e/desktop/admin-design-truth.wdio.test.js:209:    assert.ok(postSaveStatus === 'runtime-active' || postSaveStatus === 'fallback');
e2e/desktop/admin-design-truth.wdio.test.js:221:    if (postSaveStatus === 'runtime-active' && reloadStatus === 'runtime-active') {
e2e/desktop/ui-connectivity-critical.wdio.test.js:112:      'btn-export-json',
e2e/desktop/ui-connectivity-critical.wdio.test.js:113:      'btn-export-markdown',
e2e/.eslintrc.cjs:1:module.exports = {
e2e/desktop/v20_dom_diag.wdio.test.js:25:      const allEls = Array.from(document.querySelectorAll('*'));
e2e/desktop/v20_dom_diag.wdio.test.js:83:      for (const ss of Array.from(document.styleSheets)) {
e2e/desktop/v20_dom_diag.wdio.test.js:96:      const bodyChildSummary = Array.from(document.body?.children || []).map(e => ({
e2e/desktop/v20_dom_diag.wdio.test.js:104:        document.getElementById('root') ||
e2e/desktop/v20_dom_diag.wdio.test.js:105:        document.getElementById('app') ||
e2e/desktop/v20_dom_diag.wdio.test.js:106:        document.body;
src/__tests__/features/memory/MemorySearch.test.tsx:39:      expect(screen.getByPlaceholderText(/recherche sémantique/i)).toBeInTheDocument();
src/__tests__/features/memory/MemorySearch.test.tsx:44:      expect(screen.getByText('Architecture TITANE')).toBeInTheDocument();
src/__tests__/features/memory/MemorySearch.test.tsx:45:      expect(screen.getByText('Session active')).toBeInTheDocument();
src/__tests__/features/memory/MemorySearch.test.tsx:60:      expect(screen.getByText('Architecture TITANE')).toBeInTheDocument();
src/__tests__/features/memory/MemorySearch.test.tsx:61:      expect(screen.queryByText('Session active')).not.toBeInTheDocument();
src/__tests__/features/memory/MemorySearch.test.tsx:74:      expect(screen.getByText('Session active')).toBeInTheDocument();
src/__tests__/features/memory/MemorySearch.test.tsx:75:      expect(screen.queryByText('Architecture TITANE')).not.toBeInTheDocument();
e2e/desktop/memory-dashboard-runtime-proof.wdio.test.js:23:function saveResults() {
e2e/desktop/memory-dashboard-runtime-proof.wdio.test.js:26:  console.log(`\n✅ Memory Dashboard Runtime Proof saved: ${REPORT_FILE}`);
e2e/desktop/memory-dashboard-runtime-proof.wdio.test.js:117:      async () => (await browser.execute(() => document.readyState)) === 'complete',
e2e/desktop/memory-dashboard-runtime-proof.wdio.test.js:126:  after(() => saveResults());
e2e/desktop/ai-verification.full.e2e.js:121:      const readyState = document.readyState;
e2e/desktop/ai-verification.full.e2e.js:123:        !!document.querySelector('[data-testid="page-titane"]') ||
e2e/desktop/ai-verification.full.e2e.js:124:        !!document.querySelector('[data-testid="nav-top-main"]') ||
e2e/desktop/ai-verification.full.e2e.js:125:        !!document.querySelector('[data-testid="tab-conversation"]') ||
e2e/desktop/ai-verification.full.e2e.js:126:        !!document.querySelector('[data-testid="chat-input"]') ||
e2e/desktop/ai-verification.full.e2e.js:127:        !!document.querySelector('#chat-window-textarea') ||
e2e/desktop/ai-verification.full.e2e.js:128:        !!document.querySelector('#chat-input-textarea') ||
e2e/desktop/ai-verification.full.e2e.js:129:        !!document.querySelector('.chat-bubble-input');
e2e/desktop/ai-verification.full.e2e.js:290:      const candidates = Array.from(document.querySelectorAll('button, a')).filter(el => {
e2e/desktop/ai-verification.full.e2e.js:335:    const nodes = Array.from(document.querySelectorAll(sel));
e2e/desktop/ai-verification.full.e2e.js:354:  return browser.execute(sel => document.querySelectorAll(sel).length, selector);
e2e/desktop/ai-verification.full.e2e.js:378:        const el = document.querySelector(sel);
e2e/desktop/ai-verification.full.e2e.js:395:        const input = document.querySelector(inputSelector);
e2e/desktop/ai-verification.full.e2e.js:396:        const send = document.querySelector(sendSelector);
e2e/desktop/ai-verification.full.e2e.js:449:            const el = document.querySelector(sel);
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:8:const ARTIFACT_DIR =
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:9:  process.env.TITANE_ADMIN_PROP_ARTIFACT_DIR ||
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:214:async function waitSaveButtonEnabled(timeout = 15000) {
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:215:  const saveButton = await $('[data-testid="btn-config-save"]');
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:216:  await saveButton.waitForExist({ timeout });
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:219:      if (!(await saveButton.isExisting())) return false;
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:220:      if (!(await saveButton.isDisplayed())) return false;
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:221:      return await saveButton.isEnabled();
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:226:      timeoutMsg: 'save button did not become enabled after field update',
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:229:  return saveButton;
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:232:async function openAiEditorIfNeeded() {
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:233:  const saveButton = await $('[data-testid="btn-config-save"]');
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:234:  if (await saveButton.isExisting()) {
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:235:    if (await saveButton.isDisplayed()) {
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:444:  const saveButton = await $('[data-testid="btn-config-save"]');
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:445:  if (await saveButton.isExisting()) {
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:446:    await saveButton.waitForDisplayed({ timeout: 10000 });
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:453:  await saveButton.waitForDisplayed({ timeout: 10000 });
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:465:      document.querySelectorAll('div, label, span, p')
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:495:    ensureDir(ARTIFACT_DIR);
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:506:      uiMaxTokensAfterSave: null,
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:507:      uiValueBeforeSave: null,
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:508:      uiValueAfterSave: null,
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:509:      readBackAfterSave: null,
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:525:      metrics.uiValueBeforeSave = uiBefore;
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:559:          const saveButton = await waitSaveButtonEnabled();
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:560:          await clickWithFallback(saveButton);
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:563:          metrics.readBackAfterSave = await getDefaults();
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:565:          await openAiEditorIfNeeded();
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:568:          metrics.uiValueAfterSave = String(
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:573:            metrics.readBackAfterSave.provider,
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:575:            'IPC read-back provider mismatch after UI save'
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:578:            metrics.uiValueAfterSave,
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:580:            'UI provider value mismatch after save/read-back'
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:592:        // failure), use a direct IPC write→readback proof.  The UI save path calls the
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:614:          metrics.readBackAfterSave = readBack;
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:641:          const saveButton = await waitSaveButtonEnabled();
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:642:          await clickWithFallback(saveButton);
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:645:          metrics.readBackAfterSave = await getDefaults();
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:647:          await openAiEditorIfNeeded();
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:650:          metrics.uiMaxTokensAfterSave = Number(await maxTokensAfter.getValue());
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:653:            metrics.readBackAfterSave.maxOutputTokens,
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:655:            'IPC read-back max_output_tokens mismatch after UI save'
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:658:            metrics.uiMaxTokensAfterSave,
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:660:            'UI max_output_tokens value mismatch after save/read-back'
e2e/desktop/preprod_admin_config_propagation.wdio.test.js:688:          path.join(ARTIFACT_DIR, `${RUN_ID}.json`),
e2e/onboarding.test.ts:140:  test('should save preferences correctly', async ({ page }) => {
e2e/desktop/ui-ultra-full.e2e.js:6:  ensureArtifactsDir,
e2e/desktop/ui-ultra-full.e2e.js:53:    await ensureArtifactsDir();
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:12:const RUN_ARTIFACTS = process.env.RUN_ARTIFACTS || '/tmp/v25_artifacts';
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:16:fs.mkdirSync(RUN_ARTIFACTS, { recursive: true });
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:96:  await browser.saveScreenshot(filePath);
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:105:function saveMetrics() {
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:106:  const output = path.join(RUN_ARTIFACTS, `${RUN_ID}_v25_metrics.json`);
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:108:  console.log(`[METRICS] saved => ${output}`);
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:113:    const input = document.querySelector('[data-testid="chat-input"]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:114:    const send = document.querySelector('[data-testid="chat-send"]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:115:    const loading = document.querySelector('[data-testid="chat-loading"]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:116:    const error = document.querySelector('[data-testid="chat-error"]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:117:    const ready = document.querySelector('[data-testid="chat-ready"]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:118:    const reasoning = document.querySelector('[data-testid="reasoning-progress"]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:119:    const reasoningStatus = document.querySelector(
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:122:    const health = document.querySelector('[data-testid="btn-health-check"]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:125:      document.querySelectorAll(
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:131:      document.querySelectorAll(
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:138:      document.querySelectorAll('[data-testid="chat-message-assistant"]')
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:169:      document.querySelector('[data-testid*="debug" i]') ||
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:170:      document.querySelector('[class*="debug" i]') ||
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:171:      document.querySelector('[id*="debug" i]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:179:    const visibleText = (document.body.textContent || '').trim();
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:202:      reasoningTopologyCount: document.querySelectorAll(
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:220:      document.querySelectorAll('button, [role="tab"], a, [data-testid*="chat" i]')
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:318:        saveMetrics();
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:338:            const node = document.querySelector(sel);
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:372:        saveMetrics();
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:378:        const button = document.querySelector(sel);
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:472:          const button = document.querySelector('[data-testid="btn-health-check"]');
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:572:      saveMetrics();
e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js:587:        saveMetrics();
e2e/helpers/navigation.ts:21:export async function openTitane(page: Page): Promise<void> {
e2e/helpers/navigation.ts:36:export async function openAdminTab(page: Page, tabName: RegExp): Promise<void> {
e2e/helpers/navigation.ts:59:export async function closeBootBeaconIfPresent(page: Page): Promise<void> {
src/__tests__/features/memory/__snapshots__/MemoryCard.test.tsx.snap:3:exports[`MemoryPanel Component > Rendering > should match snapshot 1`] = `
e2e/desktop/page-objects/uiPages.po.js:1:export const uiPages = {
e2e/desktop/page-objects/uiPages.po.js:87:export const topLevelPageOrder = [
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:3:exports[`MemoryTreeViewer Component > Snapshot > should match snapshot 1`] = `
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:3:exports[`MemorySearchPanel Component > Snapshot > should match snapshot 1`] = `
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/01_RUNTIME_AND_UI_VISIBLE_TRUTH.md:8:- `OFFLINE_SIM=0` was exported by wrapper.
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/01_RUNTIME_AND_UI_VISIBLE_TRUTH.md:9:- Source: `proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/tauri-wrapper.log`
src/__tests__/features/memory/MemoryCard.test.tsx:62:      expect(screen.getByText(/memory metrics/i)).toBeInTheDocument();
src/__tests__/features/memory/MemoryCard.test.tsx:63:      expect(screen.getByText('STM')).toBeInTheDocument();
src/__tests__/features/memory/MemoryCard.test.tsx:64:      expect(screen.getByText('LTM')).toBeInTheDocument();
src/__tests__/features/memory/MemoryCard.test.tsx:65:      expect(screen.getByText(/42 \/ 100/)).toBeInTheDocument();
src/__tests__/features/memory/MemoryCard.test.tsx:72:      expect(btn).toBeInTheDocument();
src/__tests__/features/memory/MemoryVisualization.test.tsx:38:      expect(screen.getByTestId('mock-tree')).toBeInTheDocument();
src/__tests__/features/memory/MemoryVisualization.test.tsx:39:      expect(screen.getByText('Mémoire TITANE')).toBeInTheDocument();
src/__tests__/features/memory/MemoryVisualization.test.tsx:46:      ).toBeInTheDocument();
src/__tests__/features/memory/MemoryVisualization.test.tsx:47:      expect(screen.getByTitle(/zoom avant/i)).toBeInTheDocument();
src/__tests__/features/memory/MemoryVisualization.test.tsx:48:      expect(screen.getByTitle(/zoom arrière/i)).toBeInTheDocument();
src/__tests__/features/chat/VirtualMessageList.test.tsx:24:      expect(screen.getByText('Message 1')).toBeInTheDocument();
src/__tests__/features/chat/VirtualMessageList.test.tsx:31:      expect(screen.getByText('Message 1')).toBeInTheDocument();
src/__tests__/features/chat/VirtualMessageList.test.tsx:32:      expect(screen.getByText('Message 2')).toBeInTheDocument();
src/__tests__/features/chat/VirtualMessageList.test.tsx:33:      expect(screen.getByText('Message 3')).toBeInTheDocument();
src/__tests__/features/chat/VirtualMessageList.test.tsx:38:      expect(screen.queryByText(/Message/i)).not.toBeInTheDocument();
src/__tests__/features/chat/VirtualMessageList.test.tsx:52:      expect(screen.getByText('Message 0')).toBeInTheDocument();
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/08_FINAL_RISK_REVIEW.md:28:- Risk review is documentation-only.
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/09_SEAL_DECLARATION.md:12:3. Declare final documentary seal.
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json:86:      "path": "proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/screens/run_chat_baseline_s1_before_typing.png"
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json:91:      "path": "proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/screens/run_chat_baseline_s2_input_filled.png"
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json:96:      "path": "proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/screens/run_chat_baseline_s3_just_after_send.png"
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json:101:      "path": "proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/screens/run_chat_baseline_s4_processing_state.png"
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json:106:      "path": "proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/screens/run_chat_baseline_s5_final_response.png"
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json:111:      "path": "proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/screens/run_chat_baseline_s6_runtime_badges.png"
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json:116:      "path": "proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/screens/run_chat_baseline_s7_debug_absent.png"
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/run_chat_baseline_v25_metrics.json:121:      "path": "proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/artifacts/run_chat_baseline/screens/run_chat_baseline_s8_final_stable.png"
src/__tests__/features/chat/ChatMessage.test.tsx:36:      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
src/__tests__/features/chat/ChatMessage.test.tsx:41:      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
src/__tests__/features/chat/ChatMessage.test.tsx:53:      expect(screen.getByText('Hi there!')).toBeInTheDocument();
src/__tests__/features/chat/ChatMessage.test.tsx:54:      expect(screen.getByText(/Local/i)).toBeInTheDocument();
src/__tests__/features/chat/ChatMessage.test.tsx:61:      expect(screen.getByText('System notification')).toBeInTheDocument();
src/__tests__/features/chat/ChatMessage.test.tsx:68:      expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
src/__tests__/features/chat/ChatMessage.test.tsx:77:      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
proof_packs/POST_AUDIT_CANON_VALIDATION_2026-03-15_1408_c59e9b5b3/02_ARTIFACT_INVENTORY.md:1:# 02_ARTIFACT_INVENTORY.md — POST_AUDIT_CANON_VALIDATION
proof_packs/POST_AUDIT_CANON_VALIDATION_2026-03-15_1408_c59e9b5b3/02_ARTIFACT_INVENTORY.md:31:| AUDIO_VOICE_AUDIT_2026-03-15_1321_c59e9b5b3 | 0 (EMPTY) | FAIL — not a usable artifact |
proof_packs/PROD_RELEASE_v28.0.0_2026-03-18/00_RELEASE_MANIFEST.md:23:## Artifacts
proof_packs/PROD_RELEASE_v28.0.0_2026-03-18/00_RELEASE_MANIFEST.md:76:1. ✅ Build artifacts staged
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/01_BOOTSTRAP.md:12:3. Capture baseline pack existence and verdict artifacts.
src/__tests__/features/chat/__snapshots__/TypingIndicator.test.tsx.snap:3:exports[`TypingIndicator Component > Snapshot > should match snapshot 1`] = `
src/__tests__/features/chat/__snapshots__/VirtualMessageList.test.tsx.snap:3:exports[`VirtualMessageList Component > Snapshot > should match snapshot 1`] = `
proof_packs/PROD_RELEASE_v28.0.0_2026-03-18/03_FINAL_VERDICT_SEALED.md:31:## Artifacts Certified
proof_packs/PROD_RELEASE_v28.0.0_2026-03-18/03_FINAL_VERDICT_SEALED.md:64:| **Artifacts present** | ✅ 3/3 | AppImage + 2× DEB |
proof_packs/PROD_RELEASE_v28.0.0_2026-03-18/03_FINAL_VERDICT_SEALED.md:92:- **Contents:** Artifacts + CHECKSUMS.txt + SIZES.txt
proof_packs/PROD_RELEASE_v28.0.0_2026-03-18/03_FINAL_VERDICT_SEALED.md:109:   - Attach binary artifacts (optional, already in deployment/)
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:3:exports[`ChatToolbar Component > Snapshot > should match snapshot 1`] = `
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:8:    accept=".txt,.md,.json,.yaml,.yml,.js,.ts,.tsx,.jsx,.py,.rs,.cpp,.java,.go,.xml,.csv,.png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.doc,.docx"
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/ROLLBACK.md:10:cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/ROLLBACK.md:11:cp -f proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/backup_Titan-Stable_27.0.5_amd64.AppImage deployment/latest/Titan-Stable_27.0.5_amd64.AppImage
src/__tests__/features/chat/__snapshots__/ChatMessage.test.tsx.snap:3:exports[`ChatMessage Component > Snapshot > should match snapshot 1`] = `
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/raw/hygiene_10_FINAL_DECISION.md:31:1. Utiliser ce pack comme dossier de cloture hygiene et, si voulu, lancer la procedure de sealing finale documentaire sans modification technique.
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/01_VERSION_ALIGNMENT.md:12:- Build log: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/02_APPIMAGE_BUILD.log`
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/01_VERSION_ALIGNMENT.md:13:- Build summary: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/02_appimage_build.summary.txt`
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/01_VERSION_ALIGNMENT.md:19:Version alignment is achieved for stable AppImage production artifact naming and content lineage.
src/__tests__/features/chat/TypingIndicator.test.tsx:14:      expect(screen.getByText(/Gemini réfléchit/i)).toBeInTheDocument();
src/__tests__/features/chat/TypingIndicator.test.tsx:19:      expect(screen.queryByText(/réfléchit/i)).not.toBeInTheDocument();
src/__tests__/features/chat/TypingIndicator.test.tsx:24:      expect(screen.getByText(/TITANE réfléchit/i)).toBeInTheDocument();
src/__tests__/features/chat/TypingIndicator.test.tsx:38:      expect(screen.getByText(/Gemini réfléchit/i)).toBeInTheDocument();
src/__tests__/features/chat/ChatToolbar.test.tsx:57:      ).toBeInTheDocument();
src/__tests__/features/chat/ChatToolbar.test.tsx:58:      expect(screen.getByRole('button', { name: /Analyser image/i })).toBeInTheDocument();
src/__tests__/features/chat/ChatToolbar.test.tsx:59:      expect(screen.getByRole('button', { name: /Dictée vocale/i })).toBeInTheDocument();
src/__tests__/features/chat/ChatToolbar.test.tsx:62:      ).toBeInTheDocument();
src/omnis-final-validation.ts:302:      '✅ Documentation complète',
src/omnis-final-validation.ts:469:  async saveReport(report: OMNISFinalReport): Promise<void> {
src/omnis-final-validation.ts:477:export async function runOMNISFinalValidation(): Promise<OMNISFinalReport> {
src/omnis-final-validation.ts:482:  await validator.saveReport(report);
src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx:51:      expect(screen.getByText(/system health/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx:56:      expect(screen.getByText(/last update/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx:61:      expect(await screen.findByText(/cpu usage/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx:63:      expect(screen.getByText(/uptime/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx:64:      expect(screen.getByText(/active engines/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx:81:      expect(await screen.findByText(/unknown error/i)).toBeInTheDocument();
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/04_post_checks.env:7:SMOKE_EVIDENCE_LOG=proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/04_smoke_appimage.log
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/00_bootstrap.env:1:]633;E;{   echo "PACK_DIR=$PACK_DIR"\x3b echo "UTC_NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)"\x3b   echo "BASELINE=757ae4d4c"\x3b   echo "CURRENT_HEAD=$(git rev-parse HEAD)"\x3b echo "CURRENT_BRANCH=$(git branch --show-current)"\x3b   echo "PACKAGE_VERSION=$(jq -r '.version' package.json)"\x3b echo "STABLE_CONFIG_VERSION_BEFORE=$(jq -r '.version' runtime/stable/tauri.conf.json)"\x3b } > "$PACK_DIR/raw/00_bootstrap.env";a9c4563a-1399-4810-9a81-598ee8e26d6c]633;CPACK_DIR=proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/raw/workspace_untracked_proof_only.txt:287:proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/10_E2E_ARTIFACTS_INDEX.md
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/00_EXEC_SUMMARY.md:3:SESSION: PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9
src/**tests**/features/monitoring/**snapshots**/SystemHealthMonitor.test.tsx.snap:3:exports[`SystemHealthMonitor Component > Snapshot > should match snapshot 1`] = `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/00_SCOPE.md:3:- Session:`PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9`proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/00_SCOPE.md:4:- Objective: align stable AppImage artifact version with canonical package version`27.2.0`and redeploy without full pipeline rebuild.
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/00_SCOPE.md:8:  - Artifact expected:`Titan-Stable_27.2.0_amd64.AppImage`.
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/00_SCOPE.md:16:  - Non-artifact functional refactors.
src/__tests__/features/monitoring/SingularityDashboard.test.tsx:65:      expect(screen.getByText(/singularity dashboard/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SingularityDashboard.test.tsx:72:        expect(screen.getByText(/system metrics/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SingularityDashboard.test.tsx:82:        expect(screen.getByText(/45\.0%/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SingularityDashboard.test.tsx:90:      expect(screen.getByText(/consciousness level/i)).toBeInTheDocument();
src/__tests__/features/monitoring/SingularityDashboard.test.tsx:95:      expect(screen.getByText(/singularity field/i)).toBeInTheDocument();
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/VERDICT.md:5:- Session: `PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9`proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/VERDICT.md:11:- Correct artifact produced:`Titan-Stable_27.2.0_amd64.AppImage`.
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/VERDICT.md:12:- Targeted deploy replaced previous `27.0.5`stable artifact.
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/raw/hygiene_VERDICT.md:8:- Finaliser la cloture documentaire/seal sans changement produit.
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/04_POST_DEPLOY_CHECKS.md:13:- Smoke evidence log:`proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/04_smoke_appimage.log`proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/04_POST_DEPLOY_CHECKS.md:19:- Deploy execution log:`proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/03_DEPLOY_EXECUTION.log`
proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/04_POST_DEPLOY_CHECKS.md:20:- Confirmed replacement of old stable artifact:
src/lib/__tests__/UILogger.test.ts:273:      // Manually trigger save (normally batched)
src/lib/__tests__/UILogger.test.ts:274:      logger['saveLogs']();
src/lib/__tests__/UILogger.test.ts:281:      const saved = JSON.parse(mockLocalStorage['titane_ui_logs']);
src/lib/__tests__/UILogger.test.ts:282:      expect(saved).toHaveLength(1);
src/lib/__tests__/UILogger.test.ts:283:      expect(saved[0].message).toBe('Persisted log');
src/lib/__tests__/UILogger.test.ts:309:      logger['saveLogs']();
src/lib/__tests__/UILogger.test.ts:404:  // EXPORT
src/lib/__tests__/UILogger.test.ts:407:  describe('Export', () => {
src/lib/__tests__/UILogger.test.ts:408:    it('should export logs as JSON string', () => {
src/lib/__tests__/UILogger.test.ts:409:      logger.info('Export test 1');
src/lib/__tests__/UILogger.test.ts:410:      logger.warn('Export test 2');
src/lib/__tests__/UILogger.test.ts:412:      const exported = logger.exportLogs();
src/lib/__tests__/UILogger.test.ts:413:      const parsed = JSON.parse(exported);
src/lib/__tests__/UILogger.test.ts:417:      expect(parsed[0].message).toBe('Export test 1');
src/lib/__tests__/UILogger.test.ts:418:      expect(parsed[1].message).toBe('Export test 2');
src/lib/__tests__/UILogger.test.ts:421:    it('should export empty array when no logs', () => {
src/lib/__tests__/UILogger.test.ts:422:      const exported = logger.exportLogs();
src/lib/__tests__/UILogger.test.ts:423:      const parsed = JSON.parse(exported);
src/__tests__/features/voice/__snapshots__/VoiceControl.test.tsx.snap:3:exports[`VoiceControlPanel Component > Snapshot > should match snapshot 1`] = `
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/raw/ci_runs_for_head.json:1:[{"conclusion":"success","databaseId":22798850143,"name":"🌐 Global Distribution Monitor","status":"completed","updatedAt":"2026-03-07T12:14:46Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798850143","workflowName":"🌐 Global Distribution Monitor"},{"conclusion":"success","databaseId":22798227102,"name":"Secret Scan (Gitleaks)","status":"completed","updatedAt":"2026-03-07T11:30:29Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227102","workflowName":"Secret Scan (Gitleaks)"},{"conclusion":"success","databaseId":22798227101,"name":"🚀 P6-CAPABILITY-QUALIFICATION-GATE","status":"completed","updatedAt":"2026-03-07T11:31:07Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227101","workflowName":"🚀 P6-CAPABILITY-QUALIFICATION-GATE"},{"conclusion":"success","databaseId":22798227105,"name":"🤖 AI System Optimization (EVOLUTION)","status":"completed","updatedAt":"2026-03-07T11:32:03Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227105","workflowName":"🤖 AI System Optimization (EVOLUTION)"},{"conclusion":"success","databaseId":22798227109,"name":"🏛️ P5-RUNTIME-GOVERNANCE-GATE","status":"completed","updatedAt":"2026-03-07T11:33:06Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227109","workflowName":"🏛️ P5-RUNTIME-GOVERNANCE-GATE"},{"conclusion":"success","databaseId":22798227086,"name":"CodeQL Security Analysis","status":"completed","updatedAt":"2026-03-07T11:33:51Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227086","workflowName":"CodeQL Security Analysis"},{"conclusion":"success","databaseId":22798227080,"name":"🚀 Auto-Deploy v27.0.0-PRODUCTION","status":"completed","updatedAt":"2026-03-07T11:34:10Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227080","workflowName":"🚀 Auto-Deploy v27.0.0-PRODUCTION"},{"conclusion":"success","databaseId":22798227083,"name":"Rust Tests (Docker)","status":"completed","updatedAt":"2026-03-07T11:48:55Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227083","workflowName":"Rust Tests (Docker)"},{"conclusion":"success","databaseId":22798227093,"name":"📋 Constitution Audit (PHASE_4)","status":"completed","updatedAt":"2026-03-07T11:30:40Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227093","workflowName":"📋 Constitution Audit (PHASE_4)"},{"conclusion":"success","databaseId":22798227088,"name":"P2 Contract Guard","status":"completed","updatedAt":"2026-03-07T11:30:31Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227088","workflowName":"P2 Contract Guard"},{"conclusion":"success","databaseId":22798227094,"name":"GitGuardian Secret Scanning","status":"completed","updatedAt":"2026-03-07T11:30:56Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227094","workflowName":"GitGuardian Secret Scanning"},{"conclusion":"success","databaseId":22798227092,"name":"🏆 RELEASE-CERTIFICATION-GATE-FINAL","status":"completed","updatedAt":"2026-03-07T11:31:02Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227092","workflowName":"🏆 RELEASE-CERTIFICATION-GATE-FINAL"},{"conclusion":"success","databaseId":22798227087,"name":"P0_1_SECRETS - Secret Scan Guard","status":"completed","updatedAt":"2026-03-07T11:31:00Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227087","workflowName":"P0_1_SECRETS - Secret Scan Guard"},{"conclusion":"success","databaseId":22798227070,"name":"🏛️ P4-CONSTITUTION-AUDIT-GATE","status":"completed","updatedAt":"2026-03-07T11:31:10Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227070","workflowName":"🏛️ P4-CONSTITUTION-AUDIT-GATE"},{"conclusion":"success","databaseId":22798227096,"name":"P3 Build Guard","status":"completed","updatedAt":"2026-03-07T11:31:19Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227096","workflowName":"P3 Build Guard"},{"conclusion":"success","databaseId":22798227081,"name":"Mermaid Verify","status":"completed","updatedAt":"2026-03-07T11:31:21Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227081","workflowName":"Mermaid Verify"},{"conclusion":"success","databaseId":22798227082,"name":"🛡️ P3-STABLE-BUILD-GATE","status":"completed","updatedAt":"2026-03-07T11:31:43Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227082","workflowName":"🛡️ P3-STABLE-BUILD-GATE"},{"conclusion":"success","databaseId":22798227077,"name":"Mermaid Governance","status":"completed","updatedAt":"2026-03-07T11:32:05Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227077","workflowName":"Mermaid Governance"},{"conclusion":"success","databaseId":22798227073,"name":"🧠 Artificial Consciousness Matrix","status":"completed","updatedAt":"2026-03-07T11:32:21Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227073","workflowName":"🧠 Artificial Consciousness Matrix"},{"conclusion":"success","databaseId":22798227085,"name":"📋 Registry Guard","status":"completed","updatedAt":"2026-03-07T11:33:02Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227085","workflowName":"📋 Registry Guard"},{"conclusion":"success","databaseId":22798227084,"name":"Deploy Documentation","status":"completed","updatedAt":"2026-03-07T11:33:25Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227084","workflowName":"Deploy Documentation"},{"conclusion":"success","databaseId":22798227097,"name":"TITANE∞ CI/CD Unified Pipeline v26.3.0","status":"completed","updatedAt":"2026-03-07T12:01:54Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798227097","workflowName":"TITANE∞ CI/CD Unified Pipeline v26.3.0"},{"conclusion":"success","databaseId":22798226832,"name":"[MAIN]: merge: ci unblock readiness post blocked_ci","status":"completed","updatedAt":"2026-03-07T11:51:56Z","url":"https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/22798226832","workflowName":"Codespaces Prebuilds"}]
src/**tests**/features/voice/VoiceControl.test.tsx:44: expect(screen.getByRole('button', { name: /mode voix/i })).toBeInTheDocument();
src/**tests**/features/voice/VoiceControl.test.tsx:52: expect(screen.getByText(/mode voix inactif/i)).toBeInTheDocument();
src/**tests**/features/voice/VoiceControl.test.tsx:58: expect(screen.getByText(/web speech api/i)).toBeInTheDocument();
src/**tests**/features/voice/VoiceControl.test.tsx:60: expect(screen.getByText(/disponible/i)).toBeInTheDocument();
src/**tests**/features/voice/VoiceControl.test.tsx:83: expect(screen.getByText(/indisponible/i)).toBeInTheDocument();
src/lib/**tests**/UILogger.integration.ts:149: _ Test 7: Export
src/lib/**tests**/UILogger.integration.ts:151:function testExport() {
src/lib/**tests**/UILogger.integration.ts:152: console.log('\n=== TEST 7: Export ===');
src/lib/**tests**/UILogger.integration.ts:154: const exported = uiLogger.exportLogs();
src/lib/**tests**/UILogger.integration.ts:155: const parsed = JSON.parse(exported);
src/lib/**tests**/UILogger.integration.ts:157: console.log(`✅ Exported ${parsed.length} logs as JSON`);
src/lib/**tests**/UILogger.integration.ts:166:export function runUILoggerTests() {
src/lib/**tests**/UILogger.integration.ts:178: export: testExport(),
src/lib/**tests**/UILogger.integration.ts:205:// Export for external use
src/lib/**tests**/UILogger.integration.ts:206:export {
src/lib/**tests**/UILogger.integration.ts:213: testExport,
proof_packs/V62_RELEASE_PROMOTION_EXECUTION_20260313_075617_8ed1ef72c/ROLLBACK.md:12:- Removes V62 release-execution proof artifacts.
src/lib/ipcContract.ts:5:export type IpcCommandName =
src/lib/ipcContract.ts:105:export function validateIpcPayload<T extends IpcCommandName>(
src/lib/ipcContract.ts:129:export async function invokeStrict<T>(
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/ROLLBACK.md:12:Commande de rollback documentaire uniquement (suppression du pack):
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/raw/workspace_untracked_all.txt:287:proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/10_E2E_ARTIFACTS_INDEX.md
src/lib/errorHandler.ts:20:export function setErrorToastDispatcher(dispatcher: ToastDispatcher | null): void {
src/lib/errorHandler.ts:28:export class NotFoundError extends Error {
src/lib/errorHandler.ts:38:export class NetworkError extends Error {
src/lib/errorHandler.ts:50:export class UnauthorizedError extends Error {
src/lib/errorHandler.ts:57:export class BackendError extends Error {
src/lib/errorHandler.ts:71:export enum ErrorSeverity {
src/lib/errorHandler.ts:78:export interface ErrorContext {
src/lib/errorHandler.ts:85:export interface ClassifiedError {
src/lib/errorHandler.ts:98:export function classifyError(error: unknown, context?: ErrorContext): ClassifiedError {
src/lib/errorHandler.ts:217:export class ErrorHandler {
src/lib/errorHandler.ts:369: _ Export erreurs (pour debugging/support)
src/lib/errorHandler.ts:371: static exportErrors(format: 'json' | 'text' = 'json'): string {
src/lib/errorHandler.ts:395:export async function safeExecute<T>(
src/lib/errorHandler.ts:410:export async function safeExecuteWithFallback<T>(
src/lib/errorHandler.ts:426:export function isRetriableError(error: unknown): boolean {
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/05_INSTALL_VERIFICATION.md:26:- `ACTIVE_LOCAL_ARTIFACT = /home/titane-os/Documents/GitHub/TITANE_INFINITY/runtime/stable/Titan-Stable_27.2.0_amd64.AppImage`
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/raw/git_log_10_oneline.txt:7:5b490d07d chore(registry): sync artifacts for workflow changes (AH-0072)
src/**tests**/edge-cases/ErrorHandling.test.tsx:119: expect(screen.getByText(/error|something went wrong/i)).toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:133: expect(screen.getByText(/specific error message/i)).toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:148: expect(screen.getByText(/error/i)).toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:161: expect(screen.getByText('Success')).toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:177: expect(screen.getByText(/offline|no connection/i)).toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:221: expect(screen.getByText(/syncing|online/i)).toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:239: expect(screen.queryByText(/error|crash/i)).not.toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:274: expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:298: expect(screen.getByText(/error._parsing|invalid data/i)).toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:315: expect(screen.getByText(/invalid|not allowed/i)).toBeInTheDocument();
src/**tests**/edge-cases/ErrorHandling.test.tsx:331: expect(screen.getByText(/timeout|took too long/i)).toBeInTheDocument();
src/lib/notificationSystem.ts:8:export type NotificationType = 'info' | 'warning' | 'error' | 'success';
src/lib/notificationSystem.ts:9:export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
src/lib/notificationSystem.ts:11:export interface NotificationConfig {
src/lib/notificationSystem.ts:19:export interface Notification {
src/lib/notificationSystem.ts:34:export class NotificationSystem {
src/lib/notificationSystem.ts:52: const savedConfig = localStorage.getItem('notification-config');
src/lib/notificationSystem.ts:53: if (savedConfig) {
src/lib/notificationSystem.ts:55: this.config = { ...this.config, ...JSON.parse(savedConfig) };
src/lib/notificationSystem.ts:336:export const NotificationHelpers = {
proof_packs/V62_RELEASE_PROMOTION_EXECUTION_20260313_075617_8ed1ef72c/raw/01_v61_anchor_snapshot.txt:11:WHY=V60 rerun proof and governance are PASS, document contradiction is normalized append-only, but promotion execution remains blocked by non-clean git promotion state and active PROD token gate.
proof_packs/V62_RELEASE_PROMOTION_EXECUTION_20260313_075617_8ed1ef72c/raw/01_v61_anchor_snapshot.txt:14:V61_RELEASE_HOLD_REASON_EXACT=V60 rerun proof and governance are PASS, document contradiction is normalized append-only, but promotion execution remains blocked by non-clean git promotion state and active PROD token gate.
src/lib/predictiveAlerts.ts:15:export type PredictionMetric = 'latency' | 'errorRate' | 'retryRate';
src/lib/predictiveAlerts.ts:16:export type TrendDirection = 'increasing' | 'decreasing' | 'stable';
src/lib/predictiveAlerts.ts:18:export interface Prediction {
src/lib/predictiveAlerts.ts:32:export interface PredictiveAlert {
src/lib/predictiveAlerts.ts:46:export interface PredictionThresholds {
src/lib/predictiveAlerts.ts:70:export class PredictiveAlerts {
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/00_EXEC_SUMMARY.md:5:B) SCOPE_RING: `Ring4 documentary close only`
proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/00_EXEC_SUMMARY.md:27:- Documentary-only run.
src/**tests**/c2-anti-silence.test.tsx:17:// Mock MarkdownContent component
src/**tests**/c2-anti-silence.test.tsx:18:vi.mock('@/components/chat/MarkdownContent', () => ({
src/**tests**/c2-anti-silence.test.tsx:19: MarkdownContent: ({ content }: { content: string }) => (
src/**tests**/c2-anti-silence.test.tsx:20: <div data-testid="markdown-content">{content}</div>
src/**tests**/c2-anti-silence.test.tsx:64: expect(bubbleText).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:83: const typingIndicator = document.querySelector('.typing-indicator');
src/**tests**/c2-anti-silence.test.tsx:84: expect(typingIndicator).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:105: expect(fallback).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:120: // Assert: Content is rendered via MarkdownContent
src/**tests**/c2-anti-silence.test.tsx:121: const markdown = screen.getByTestId('markdown-content');
src/**tests**/c2-anti-silence.test.tsx:122: expect(markdown).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:123: expect(markdown?.textContent).toBe('Bonjour! Comment ça va?');
src/**tests**/c2-anti-silence.test.tsx:157: expect(systemBubble).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:180: expect(bubbleText).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:200: expect(bubble).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:283: expect(text).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:315: expect(text).toBeInTheDocument(`Scenario ${index}: should have text container`);
src/**tests**/c2-anti-silence.test.tsx:339: const indicator = document.querySelector('[aria-label_="génère"]');
src/**tests**/c2-anti-silence.test.tsx:340: expect(indicator).toBeInTheDocument();
src/**tests**/c2-anti-silence.test.tsx:367: expect(bubble).toBeInTheDocument();
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/titane-infinity.desktop.pre:6:Exec=/home/titane-os/Documents/GitHub/TITANE_INFINITY/runtime/stable/Titan-Stable_27.0.5_amd64.AppImage
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/titane-infinity.desktop.pre:7:Icon=/home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/icons/128x128.png
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/titane-infinity.desktop.pre:17:Exec=/home/titane-os/Documents/GitHub/TITANE_INFINITY/runtime/stable/Titan-Stable_27.0.5_amd64.AppImage --dev
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/TITANE-Infinity.desktop.pre:6:Exec=/home/titane-os/Documents/GitHub/TITANE_INFINITY/runtime/stable/Titan-Stable_27.0.5_amd64.AppImage
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/TITANE-Infinity.desktop.pre:7:Icon=/home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/icons/128x128.png
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/TITANE-Infinity.desktop.pre:17:Exec=/home/titane-os/Documents/GitHub/TITANE_INFINITY/runtime/stable/Titan-Stable_27.0.5_amd64.AppImage --dev
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/00_git_status_short.txt:18:?? proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/15_FINAL_VERDICT.md:15:- Healthy real fullstack provider/orchestrator answer for canonical question.
src/**tests**/config/customModeRegistry.test.ts:28: it('A1: registerCustomMode is exported as a function', () => {
src/**tests**/config/customModeRegistry.test.ts:32: it('A2: getSystemPrompt is exported as a function', () => {
src/**tests**/config/customModeRegistry.test.ts:93: it('C1: simulates ModeBuilder.handleSave → registerCustomMode → getSystemPrompt', () => {
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/04_cleanup_scope_matrix.txt:11:- deployment/latest historical artifacts (26.x / 27.0.5 / 27.2.0 sets)
src/lib/tauriCommands.ts:12:export const TAURI_COMMANDS = {
src/lib/tauriCommands.ts:15: AGENDA_SAVE_EVENT: 'agenda_save_event',
src/lib/tauriCommands.ts:16: AGENDA_SAVE_EVENTS: 'agenda_save_events',
src/lib/tauriCommands.ts:172: QA_EXPORT_METRICS_PROMETHEUS: 'qa_export_metrics_prometheus',
src/lib/tauriCommands.ts:219: EVOLUTION_SAVE_STATE: 'evolution_save_state',
src/lib/tauriCommands.ts:257: SAVE_AUDIO_DEVICE_CONFIG: 'save_audio_device_config',
src/lib/tauriCommands.ts:264: EXPORT_CONFIG: 'export_config',
src/lib/tauriCommands.ts:299: KNOWLEDGE_SAVE_STATE: 'knowledge_save_state',
src/lib/tauriCommands.ts:328: MEMORY_SAVE_CHAT_INTERACTION: 'memory_save_chat_interaction',
src/lib/tauriCommands.ts:329: MEMORY_SAVE_ENTRY: 'memory_save_entry',
src/lib/tauriCommands.ts:342: ORCHESTRATOR_RUN_CYCLE: 'orchestrator_run_cycle',
src/lib/tauriCommands.ts:343: ORCHESTRATOR_SET_MODE: 'orchestrator_set_mode',
src/lib/tauriCommands.ts:344: ORCHESTRATOR_GET_STATE: 'orchestrator_get_state',
src/lib/tauriCommands.ts:345: ORCHESTRATOR_GET_METRICS: 'orchestrator_get_metrics',
src/lib/tauriCommands.ts:346: ORCHESTRATOR_INIT: 'orchestrator_init',
src/lib/tauriCommands.ts:355: PARSE_DOCUMENT: 'parse_document',
src/lib/tauriCommands.ts:367: PERSISTENT_MEMORY_EXPORT: 'persistent_memory_export',
src/lib/tauriCommands.ts:378: PROGRESSION_SAVE_STATE: 'progression_save_state',
src/lib/tauriCommands.ts:395: SAVE_CONFIG_PRESET: 'save_config_preset',
src/lib/tauriCommands.ts:399: SAVE_UI_THEME: 'save_ui_theme',
src/lib/tauriCommands.ts:431: SELFHEAL_SAVE_PROFILE: 'selfheal_save_profile',
src/lib/tauriCommands.ts:443: SINGULARITY_SAVE_STATE: 'singularity_save_state',
src/lib/tauriCommands.ts:509:export type TauriCommand = (typeof TAURI_COMMANDS)[keyof typeof TAURI_COMMANDS];
src/lib/tauriCommands.ts:511:export const ALL_TAURI_COMMANDS = Object.values(TAURI_COMMANDS);
src/lib/tauriCommands.ts:513:export function isValidTauriCommand(cmd: string): cmd is TauriCommand {
proof_packs/V62_RELEASE_PROMOTION_EXECUTION_20260313_075617_8ed1ef72c/VERDICT.md:28:NEXT_ACTION_30MIN: Clean promotion scope by explicit user-approved delta strategy, resync to origin/MAIN, export both PROD tokens, then rerun V62 feasibility gate.
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/09_AUTO_FIX_DECISION.md:12:- Rebuild not required (frontend/runtime code used by AppImage run through existing rebuilt artifact path in this session).
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/09_AUTO_FIX_DECISION.md:17:Postbuild artifact truth:
proof_packs/VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25_2026-03-11_1354_6f52ce329/09_AUTO_FIX_DECISION.md:20:- Fixes improved observability and correspondence clarity, but not final provider/orchestrator answer quality.
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/00_EXEC_SUMMARY.md:30:- Rollback local explicite documenté dans `08_LOCAL_ROLLBACK_PLAN.md` et `ROLLBACK.md`.
src/**tests**/ai-orchestrator-neural-fixed.test.ts:3: _ TITANE∞ v26.3.1 — Tests Neural Selection AI Orchestrator
src/**tests**/ai-orchestrator-neural-fixed.test.ts:10:import { aiOrchestrator } from '@/core/services/orchestrator';
src/**tests**/ai-orchestrator-neural-fixed.test.ts:12:describe('AI Orchestrator - Neural Selection (P1 - Corrected)', () => {
src/**tests**/ai-orchestrator-neural-fixed.test.ts:23: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:27: expect(status).toHaveProperty('orchestrator');
src/**tests**/ai-orchestrator-neural-fixed.test.ts:33: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:40: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:48: it('should track orchestrator metrics', async () => {
src/**tests**/ai-orchestrator-neural-fixed.test.ts:49: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:50: const metrics = status.orchestrator;
src/**tests**/ai-orchestrator-neural-fixed.test.ts:64: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:79: const metrics = aiOrchestrator.getDetailedMetrics();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:85: expect(metrics).toHaveProperty('orchestrator');
src/**tests**/ai-orchestrator-neural-fixed.test.ts:89: const metrics = aiOrchestrator.getDetailedMetrics();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:100: const health = await aiOrchestrator.healthCheck();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:114: const health = await aiOrchestrator.healthCheck();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:133: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:165: await expect(aiOrchestrator.getProvidersStatus()).resolves.toBeDefined();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:166: await expect(aiOrchestrator.healthCheck()).resolves.toBeDefined();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:167: expect(() => aiOrchestrator.getDetailedMetrics()).not.toThrow();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:173: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:189: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:190: const metrics = status.orchestrator;
src/**tests**/ai-orchestrator-neural-fixed.test.ts:203: const status = await aiOrchestrator.getProvidersStatus();
src/**tests**/ai-orchestrator-neural-fixed.test.ts:210: // Cohérence: total orchestrator >= somme providers
src/**tests**/ai-orchestrator-neural-fixed.test.ts:218: const status = await aiOrchestrator.getProvidersStatus();
proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/09_FINAL_VERDICT.md:15:3. Documenter risques résiduels et next action.
proof_packs/FINAL_SEAL_2026-03-06_1800_0c913f4/00_FINAL_SEAL_REPORT.md:112:### BLOCKED_ENV (attendus, documentés)
proof_packs/FINAL_SEAL_2026-03-06_1800_0c913f4/00_FINAL_SEAL_REPORT.md:156:| Rollback documenté | ✅ |
proof_packs/TOTAL_DEV_NATIVE_HARNESS_BUILD_2026-03-21_0200_04a0376db/02_SCOPE.md:30:**SCOPE FROZEN:** This document defines immovable boundary for harness mission
src/lib/security/AIInputSanitizer.ts:16:export interface SanitizationResult {
src/lib/security/AIInputSanitizer.ts:31:export interface SanitizationOptions {
src/lib/security/AIInputSanitizer.ts:139:export class AIInputSanitizer {
src/lib/security/AIInputSanitizer.ts:324:// EXPORTS
src/lib/security/AIInputSanitizer.ts:327:export default AIInputSanitizer;
src/**tests**/twins/twins-context-chain.test.ts:186: // This test documents the classification — it does not fake a response assertion.
src/**tests**/twins/twins-context-chain.test.ts:466: it('G7. CLASSIFICATION: PROMPT_EFFECT_PROVEN, RESPONSE_EFFECT_UNPROVEN (documented)', () => {
src/lib/security/AIRateLimiter.ts:14:export interface RateLimitConfig {
src/lib/security/AIRateLimiter.ts:25:export interface RateLimitStatus {
src/lib/security/AIRateLimiter.ts:40:export interface RequestMetrics {
src/lib/security/AIRateLimiter.ts:57:export class AIRateLimiter {
src/lib/security/AIRateLimiter.ts:253:export const globalAIRateLimiter = new AIRateLimiter({
src/lib/security/AIRateLimiter.ts:261:// EXPORTS
src/lib/security/AIRateLimiter.ts:264:export default AIRateLimiter;
proof_packs/AUDIT_SECOND_2026-03-14/15_ROOT_CAUSES_EXPANDED.md:71:**PATCH_CLASS:** GATE_FIX — Create `ring-integrity-gate.sh` that checks for inverse import patterns, OR document that TS/ESLint enforce ring boundaries and create a test for that.  
proof_packs/AUDIT_SECOND_2026-03-14/15_ROOT_CAUSES_EXPANDED.md:95:**PROOFS_AGAINST:** G4 documentation value is real even if non-blocking. CSP risk is genuine even if waived.  
proof_packs/AUDIT_SECOND_2026-03-14/15_ROOT_CAUSES_EXPANDED.md:97:**PATCH_CLASS:** DOCTRINE_FIX — Update priority framework: P1 = hollow gates + harness truth; P2 = local-only documentation gaps.  
src/lib/security/securityConfig.ts:15:export const SECURITY_MODE = {
src/lib/security/securityConfig.ts:39:export const PERMISSIVE_RATE_LIMITS = {
src/lib/security/securityConfig.ts:72:export const PERMISSIVE_SANITIZATION = {
src/lib/security/securityConfig.ts:99:export const TOLERANT_CIRCUIT_BREAKER = {
src/lib/security/securityConfig.ts:120:export const PERMISSIVE_CHAT_INPUT = {
src/lib/security/securityConfig.ts:141:export const UNRESTRICTED_PROVIDER_CONFIG = {
src/lib/security/securityConfig.ts:199:export function isBlockingDisabled(): boolean {
src/lib/security/securityConfig.ts:206:export function isRateLimitingDisabled(): boolean {
src/lib/security/securityConfig.ts:213:export function isStrictSanitizationDisabled(): boolean {
src/lib/security/securityConfig.ts:220:export function getRateLimits() {
src/lib/security/securityConfig.ts:241:export function getSanitizationOptions() {
src/lib/security/securityConfig.ts:259:export function getCircuitBreakerConfig() {
src/lib/security/securityConfig.ts:275:export function getProviderConfig(provider: string) {
src/lib/security/securityConfig.ts:287:// EXPORTS
src/lib/security/securityConfig.ts:290:export default {
proof_packs/AUDIT_SECOND_2026-03-14/17_ACTION_PLAN_CORRECTED.md:35:**Risk:** NONE — documentation only  
proof_packs/AUDIT_SECOND_2026-03-14/17_ACTION_PLAN_CORRECTED.md:63:**Priority:** P1 (documentation + code comment)  
proof_packs/AUDIT_SECOND_2026-03-14/17_ACTION_PLAN_CORRECTED.md:75:**Expected artifact:** `proof_packs/P3_CERT_REAL_YYYYMMDD/` with actual CONV_SEND/CONV_RECV logs
proof_packs/AUDIT_SECOND_2026-03-14/17_ACTION_PLAN_CORRECTED.md:81:**Expected artifact:** Binary hash, AppImage, .deb
proof_packs/AUDIT_SECOND_2026-03-14/17_ACTION_PLAN_CORRECTED.md:87:**Expected artifact:** Chat DOM state, provider tags, runtime panel attributes
proof_packs/AUDIT_SECOND_2026-03-14/17_ACTION_PLAN_CORRECTED.md:93:**Expected artifact:** Playwright test result with response content assertion
src/**tests**/ui/ui-navigation.test.ts:205: const stickyElements = document.querySelectorAll(
proof_packs/AUDIT_SECOND_2026-03-14/14_RISK_MATRIX_EXPANDED.md:31:No crash, data loss, or security breach proven (CSP risk documented but waived in CI)
src/lib/security/SecureAIService.ts:23:export interface SecureAIRequest {
src/lib/security/SecureAIService.ts:48:export interface SecureAIResponse<T = ChatResponse> {
src/lib/security/SecureAIService.ts:71:export type SecureAIServiceFunction<TInput = SecureAIRequest, TOutput = ChatResponse> = (
src/lib/security/SecureAIService.ts:79:export class SecureAIService {
src/lib/security/SecureAIService.ts:399:// EXPORTS
src/lib/security/SecureAIService.ts:402:export default SecureAIService;
proof_packs/AUDIT_SECOND_2026-03-14/13_TRUTH_MATRIX_EXPANDED.md:24:| memory_write | Conversation saved to memory | Source shows write path | ⚠️ PARTIAL | WEAK_PROOF | src/services/unified/SQLiteVectorStore.ts | MEDIUM |
proof_packs/AUDIT_SECOND_2026-03-14/13_TRUTH_MATRIX_EXPANDED.md:34:| release_truth | Latest release matches source | deployment/latest has v27 artifacts | ⚠️ PARTIAL | WEAK_PROOF | ls deployment/latest/ | MEDIUM |
src/lib/security/PolicyFirewallV2.ts:1:export type AttackCategoryV2 =
src/lib/security/PolicyFirewallV2.ts:8:export interface AttackSignalV2 {
src/lib/security/PolicyFirewallV2.ts:14:export interface AttackModelResultV2 {
src/lib/security/PolicyFirewallV2.ts:20:export interface PolicyFirewallOptionsV2 {
src/lib/security/PolicyFirewallV2.ts:26:export interface PolicyFirewallDecisionV2 {
src/lib/security/PolicyFirewallV2.ts:32:export interface ExfilGuardResultV2 {
src/lib/security/PolicyFirewallV2.ts:73:export function evaluateAttackModelV2(input: string): AttackModelResultV2 {
src/lib/security/PolicyFirewallV2.ts:121:export function evaluatePolicyFirewallV2(
src/lib/security/PolicyFirewallV2.ts:160:export function applyExfilGuardsV2(
proof_packs/AUDIT_SECOND_2026-03-14/12_CONTRADICTIONS_EXPANDED.md:75:| **Fix** | Create ring-integrity-gate.sh OR document that ring integrity is enforced by TypeScript module boundaries |
proof_packs/AUDIT_SECOND_2026-03-14/12_CONTRADICTIONS_EXPANDED.md:114:| **Gravity** | LOW — documented waiver exists, CSP risk is real but P2 not P1 |
proof_packs/AUDIT_SECOND_2026-03-14/12_CONTRADICTIONS_EXPANDED.md:117:| **Fix** | No code fix needed. Document waiver in VERDICT. |
src/**tests**/memoryComponents.test.tsx:104: source: 'manual_save',
src/**tests**/memoryComponents.test.tsx:136: ).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:141: expect(screen.getByText('📭')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:150: ).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:155: expect(screen.getByText('Session')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:160: expect(screen.getByText('#test')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:161: expect(screen.getByText('#session')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:172: expect(screen.getByText('5 fois')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:179: expect(screen.getByText(/summary of multiple conversations/i)).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:184: expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:189: expect(screen.getByText('Code')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:196: expect(screen.getByText(/TypeScript best practices/i)).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:201: expect(screen.getByText('Long Terme')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:206: expect(screen.getByText('📋 Résumé')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:207: expect(screen.getByText(/Key TypeScript patterns/i)).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:218: expect(screen.queryByText('⬆️ Promouvoir')).not.toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:265: it('should export entry as JSON', () => {
src/**tests**/memoryComponents.test.tsx:267: fireEvent.click(screen.getByText('📤 Exporter'));
src/**tests**/memoryComponents.test.tsx:280: expect(screen.getByText('⚠️ Confirmer la suppression')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:308: expect(screen.queryByText('⚠️ Confirmer la suppression')).not.toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:323: expect(screen.queryByText('⬆️ Promouvoir')).not.toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:324: expect(screen.queryByText('🗑️ Supprimer')).not.toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:337: it('should still show copy and export buttons', () => {
src/**tests**/memoryComponents.test.tsx:341: expect(screen.getByText('📋 Copier')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:342: expect(screen.getByText('📤 Exporter')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:363: expect(screen.queryByText('⚠️ Confirmer la suppression')).not.toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:374: expect(screen.getByText('▼ Voir tout')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:376: expect(screen.getByText('▲ Réduire')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:402: expect(screen.getByText('✅ Contenu copié')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:406: it('should show notification after export', async () => {
src/**tests**/memoryComponents.test.tsx:408: fireEvent.click(screen.getByText('📤 Exporter'));
src/**tests**/memoryComponents.test.tsx:410: expect(screen.getByText('✅ Entrée exportée')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:418: expect(document.querySelector('.memory-viewer**header')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:423: expect(document.querySelector('.memory-viewer**body')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:428: expect(document.querySelector('.memory-viewer**actions')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:433: expect(screen.getByText('📊 Métadonnées')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:438: expect(screen.getByText('📝 Contenu')).toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:446: expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:455: expect(screen.queryByText('Dernier accès:')).not.toBeInTheDocument();
src/**tests**/memoryComponents.test.tsx:464: expect(screen.queryByText('Mode:')).not.toBeInTheDocument();
src/**tests\_\_/memoryComponents.test.tsx:477: expect(screen.getByText('Expiré')).toBeInTheDocument();
src/lib/security/AIResponseValidator.ts:5: _ Protection contre: réponses malformées, JSON invalid, XSS dans markdown, data leaking
src/lib/security/AIResponseValidator.ts:16:export interface AIValidationResult<T = unknown> {
src/lib/security/AIResponseValidator.ts:36:export const ChatResponseSchema = z.object({
src/lib/security/AIResponseValidator.ts:49:export type ChatResponse = z.infer<typeof ChatResponseSchema>;
src/lib/security/AIResponseValidator.ts:54:export const StreamingChunkSchema = z.object({
src/lib/security/AIResponseValidator.ts:64:export type StreamingChunk = z.infer<typeof StreamingChunkSchema>;
src/lib/security/AIResponseValidator.ts:69:export const MetaModeResponseSchema = z.object({
src/lib/security/AIResponseValidator.ts:80:export type MetaModeResponse = z.infer<typeof MetaModeResponseSchema>;
src/lib/security/AIResponseValidator.ts:87: _ Patterns XSS dans markdown/texte
src/lib/security/AIResponseValidator.ts:125:export class AIResponseValidator {
src/lib/security/AIResponseValidator.ts:364:// EXPORTS
src/lib/security/AIResponseValidator.ts:367:export default AIResponseValidator;
src/lib/utils.ts:13:export function cn(...classes: (string | false | null | undefined)[]): string {
proof_packs/AUDIT_SECOND_2026-03-14/02_FIRST_AUDIT_REVIEW.md:12:| C-02 | "CSP is HIGH priority for current product bug" | 00_EXEC_SUMMARY.md | MISPRIORITIZED | CI runs CSP gate with CSP_ALLOW_UNSAFE=1. This is P2 non-blocking per documented CI waiver. |
proof_packs/AUDIT_SECOND_2026-03-14/01_BOOTSTRAP_REVALIDATION.md:56:| DEPLOYMENT_LATEST | ✅ Directory present | `deployment/latest/` exists with v27 artifacts |
proof_packs/AUDIT_SECOND_2026-03-14/01_BOOTSTRAP_REVALIDATION.md:91:**Implication:** The "G4 FAIL is a HIGH priority blocker" claim from audit 1 is MISPRIORITIZED. G4 is a local-only gate not tracked by CI. Its failure is a local documentation gap, not a CI blocking issue.
src/lib/accessibility.ts:15:export function trapFocus(element: HTMLElement): () => void {
src/lib/accessibility.ts:28: if (document.activeElement === firstElement) {
src/lib/accessibility.ts:34: if (document.activeElement === lastElement) {
src/lib/accessibility.ts:55:export function createFocusRestorer(): () => void {
src/lib/accessibility.ts:56: const previousActiveElement = document.activeElement as HTMLElement | null;
src/lib/accessibility.ts:66:export function useKeyboardListNavigation(
src/lib/accessibility.ts:134:export function getContrastRatio(
src/lib/accessibility.ts:150:export function meetsWCAGAA(
src/lib/accessibility.ts:162:export function meetsWCAGAAA(
src/lib/accessibility.ts:174:export function hexToRGB(hex: string): [number, number, number] {
src/lib/accessibility.ts:185:export function suggestAccessibleColor(
src/lib/accessibility.ts:220:export function generateAriaId(prefix = 'aria'): string {
src/lib/accessibility.ts:227:export function announceToScreenReader(
src/lib/accessibility.ts:231: const announcement = document.createElement('div');
src/lib/accessibility.ts:238: document.body.appendChild(announcement);
src/lib/accessibility.ts:242: document.body.removeChild(announcement);
src/lib/accessibility.ts:249:export function createSROnlyElement(text: string): HTMLSpanElement {
src/lib/accessibility.ts:250: const element = document.createElement('span');
src/lib/accessibility.ts:263:export function isFocusable(element: HTMLElement): boolean {
src/lib/accessibility.ts:275:export function findNextFocusable(
src/lib/accessibility.ts:280: document.querySelectorAll<HTMLElement>(
src/lib/accessibility.ts:299:export class FocusTrap {
src/lib/accessibility.ts:318:export interface AccessibilityIssue {
src/lib/accessibility.ts:328:export function auditAccessibility(): AccessibilityIssue[] {
src/lib/accessibility.ts:332: const images = document.querySelectorAll('img');
src/lib/accessibility.ts:345: const buttons = document.querySelectorAll('button');
src/lib/accessibility.ts:362: const inputs = document.querySelectorAll('input, select, textarea');
src/lib/accessibility.ts:364: const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
src/lib/accessibility.ts:380: const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
src/lib/accessibility.ts:408:export function injectSROnlyStyles(): void {
src/lib/accessibility.ts:410: if (document.getElementById(styleId)) return;
src/lib/accessibility.ts:412: const style = document.createElement('style');
src/lib/accessibility.ts:439: document.head.appendChild(style);
src/**tests**/services/api/evolution.test.ts:76: it('exportHistory() devrait throw sur erreur', async () => {
src/**tests**/services/api/evolution.test.ts:81: await expect(evolutionService.exportHistory('json')).rejects.toThrow(
src/**tests**/services/api/evolution.test.ts:82: 'Export historique échoué'
proof_packs/AUDIT_SECOND_2026-03-14/16_REPRIORITIZATION_REPORT.md:49:G4's missing BASELINE.md, STRUCTURAL_TEST.log, and STRUCTURAL_RUNS_SUMMARY.md are documentation gaps in a local-only gate. The certification evidence that would fill these files comes from `chat-provider-decision-certification-structural.spec.ts` — which is itself synthetic. Fixing G4 evidence by running structural tests would produce **certified simulation**, not **certified product truth**.
proof_packs/AUDIT_SECOND_2026-03-14/16_REPRIORITIZATION_REPORT.md:59:CSP unsafe-inline is a security debt that is explicitly waived in CI with `CSP_ALLOW_UNSAFE=1`. The risk exists but is documented and controlled. Removing unsafe-inline requires build environment testing and is not a quick fix.
proof_packs/AUDIT_SECOND_2026-03-14/16_REPRIORITIZATION_REPORT.md:61:The harness truth issues (simulated P3 cert, disabled E2E, mock in prod) are more dangerous because they provide false confidence that the product works correctly when the testing infrastructure itself is not exercising the real product. This is a form of governance failure more serious than a documented security waiver.
src/lib/metricsCache.ts:29:export class MetricsCache {
src/lib/metricsCache.ts:286:export function stopAutoCleanup() {
src/lib/metricsHistory.ts:10:export interface MetricsSnapshot {
src/lib/metricsHistory.ts:15:export class MetricsHistory {
src/lib/metricsHistory.ts:72:export interface ServiceHistoryPoint {
src/**tests**/services/ai/system.test.ts:28:vi.mock('../../../services/ai/orchestrator', () => {
src/**tests**/services/ai/system.test.ts:30: aiOrchestrator: {
src/**tests**/services/ai/system.test.ts:108: orchestrator: expect.any(Object),
.github/instructions/tauri.instructions.md:27:- Logs E2E/IPC, exports, and config diffs in reports/.
proof_packs/V63_CLEAN_PROMOTION_WINDOW_20260313_121853_8ed1ef72c/13_ROLLBACK.md:3:Minimal rollback for V63 artifacts:
.github/instructions/tests-e2e.instructions.md:10:- Determinisme, selectors stables, exports requis.
.github/instructions/tests-e2e.instructions.md:16:- Export page_classification, chat_dom_map, AR20, OFFLINE5, navigation, stability.
.github/instructions/tests-e2e.instructions.md:19: - `signature`: failing test name + artifact marker (log/export/error marker)
.github/instructions/tests-e2e.instructions.md:33:- Logs with wrapper/guard markers and export files.
.github/instructions/tests-e2e.instructions.md:37:- Stop-the-line if any required export is missing.
.github/instructions/tests-e2e.instructions.md:38:- Missing required exports => `FAIL` + mandatory AutoFix/AutoHeal entry describing prevention.
src/**tests**/services/tts/messageSpeechController.test.ts:8: it('nettoie le markdown avant lecture', () => {
src/lib/security.ts:58:export const VOID_COMMANDS = new Set<string>([
src/lib/security.ts:91: // State save commands
src/lib/security.ts:92: 'state_save',
src/lib/security.ts:94: 'singularity_save_state',
src/lib/security.ts:109: 'selfheal_save_profile',
src/lib/security.ts:112: 'save_ui_theme',
src/lib/security.ts:177:export const NULLABLE_COMMANDS = new Set<string>([
src/lib/security.ts:195:export const ALLOWED_COMMANDS = new Set<string>([
src/lib/security.ts:219: 'save_chat_interaction',
src/lib/security.ts:220: 'memory_save_chat_interaction',
src/lib/security.ts:260: // NOTE: memory_save_entry → remplacé par memory_store
src/lib/security.ts:262: 'memory_save_entry',
src/lib/security.ts:267: 'memory_export',
src/lib/security.ts:300: 'context_save',
src/lib/security.ts:316: 'persistent_memory_export',
src/lib/security.ts:336: // Chat Orchestrator (v18+)
src/lib/security.ts:351: 'save_memory',
src/lib/security.ts:424: 'singularity_save_state',
src/lib/security.ts:527: 'state_save',
src/lib/security.ts:628: 'avatar_save_custom_style',
src/lib/security.ts:661: 'fullbody_export_skeleton',
src/lib/security.ts:794: 'memory_save_entry',
src/lib/security.ts:803: 'selfheal_save_profile',
src/lib/security.ts:840: 'visual_devops_save_session',
src/lib/security.ts:999: 'orchestrator_set_mode',
src/lib/security.ts:1000: 'orchestrator_run_cycle',
src/lib/security.ts:1038: 'save_audio_device_config',
src/lib/security.ts:1041: 'export_config',
src/lib/security.ts:1049: 'save_config_preset',
src/lib/security.ts:1052: 'save_ui_theme',
src/lib/security.ts:1094: 'parse_document',
src/lib/security.ts:1135: 'anthology_get_top_lexical_fields',
src/lib/security.ts:1287:// Chat/orchestrator commands are intentionally permissive so TITANE can
src/lib/security.ts:1288:// interpret rich user prompts and let the orchestrator enforce limits.
src/lib/security.ts:1347:export interface LocalNetworkSecurityConfig {
src/lib/security.ts:1376:export function enableLocalNetworkMode(
src/lib/security.ts:1386:export function disableLocalNetworkMode(): void {
src/lib/security.ts:1394:export function getLocalNetworkConfig(): LocalNetworkSecurityConfig {
src/lib/security.ts:1427:export interface SecureInvokeOptions {
src/lib/security.ts:1440:export interface CommandValidationResult {
src/lib/security.ts:1445:export interface HardeningTestResult {
src/lib/security.ts:1451:export interface HardeningReport {
src/lib/security.ts:1464:export function validateCommand(command: string): CommandValidationResult {
src/lib/security.ts:1493:export function detectInjection(
src/lib/security.ts:1515:export function validatePayloadSize(
src/lib/security.ts:1533:export function detectInfiniteLoop(command: string): CommandValidationResult {
src/lib/security.ts:1595:export function cleanupCallTracking(): void {
src/lib/security.ts:1624:export function stopCallTrackingCleanup() {
src/lib/security.ts:1642:export function isRecord(value: unknown): value is Record<string, unknown> {
src/lib/security.ts:1649:export function isHardeningReport(value: unknown): value is HardeningReport {
src/lib/security.ts:1671:export function isStringArray(value: unknown): value is string[] {
src/lib/security.ts:1678:export function isValidTauriResponse<T>(
src/lib/security.ts:1702:export function validateResponse<T>(
src/lib/security.ts:1737:export function sanitizeResponse<T>(response: T): T {
src/lib/security.ts:1776: _ await secureInvoke('memory_save_entry', {
src/lib/security.ts:1812:export async function secureInvoke<T>(
src/lib/security.ts:2034:export async function runSecuritySelfTest(): Promise<HardeningReport> {
src/lib/security.ts:2055: \* Exporter les statistiques de sécurité frontend
src/lib/security.ts:2057:export function getSecurityStats() {
