# TITANE_INFINITY — Cartographie Complète Avancée v30.1.34

> 2026-04-18 — Conversation canonical-kernel authority truth: src/services/conversationEngine.ts appelle maintenant src/services/ai/canonicalDiscernmentKernel.ts sur la voie chat active avec memoryIntegration, santé providers issue de aiOrchestrator.getProvidersStatus() et cohérence SingularityBridge.getCachedCoherence(). La décision canonique pilote le provider backend demandé, le profil runtime utilisé pour aiConfig, et la vérité exposée dans response.cognitive_tags, metadata.links_to_contexts et omega_trace_meta, ce qui rapproche la surface conversation standard du contrat déjà en vigueur dans src/services/ai/chatEngine.ts.

> 2026-04-18 — Conversation governed tool-lane truth: `src/services/conversationEngine.ts` détecte maintenant une capacité tools/functions gouvernée depuis `src/lib/security.ts` (`ALLOWED_COMMANDS`) et `src/services/mcp/MCPOrchestrator.ts` (`getHealth()`), au lieu d imposer `toolAvailable=false`. La route active du chat injecte `GOVERNED_TOOL_LANE_CONTEXT` / `GOVERNED_TOOL_LANE_STATUS`, classifie le `taskType` minimal (`question|instruction|multi-step|code|data`) et projette `tool-lane:*`, `task-type:*`, `tool-action:*`, `web-action:*`, `memory-action:*` et `ask-act-hold:*` dans `response.cognitive_tags` et `metadata.links_to_contexts`, tout en conservant la vérité `execution_mode=governed_not_auto`.

> 2026-04-18 — Conversation advanced-agent runtime truth: `src/services/conversationEngine.ts` agrège maintenant la vérité runtime déjà publiée par `src/services/monitoring/index.ts`, `src/services/diagnostic/index.ts`, `src/services/explainability/index.ts`, `src/services/orchestrator/index.ts` et `src/services/security_active/index.ts`. La route active du chat injecte `ADVANCED_AGENT_RUNTIME_CONTEXT` et `ADVANCED_AGENT_RUNTIME_STATUS`, puis projette `advanced-agents:present` et `agent:*:*` dans `response.cognitive_tags` et `metadata.links_to_contexts`, sans présenter ces signaux comme une boucle de décision agentique complète quand ils ne sont encore que des résumés runtime canoniques.

> 2026-04-18 — Conversation skill and online runtime truth: `src/services/conversationEngine.ts` réaligne maintenant la route active du chat avec la Skill OS déjà présente dans `src/services/skills/activation/skillActivator.ts`, en injectant `ACTIVE_SKILL_CONTEXT` et `ACTIVE_SKILL_STATUS` quand un skill actif existe réellement. Le même service publie aussi `ONLINE_CAPABILITY_CONTEXT` / `ONLINE_CAPABILITY_STATUS` avec la vérité gouvernée `one_door_only=true`, l état `online:available|offline` et la préférence `deep_analysis:enabled|disabled`, puis projette ces signaux dans `response.cognitive_tags` et `metadata.links_to_contexts` consommés par `src/components/sections/ConversationSection.tsx`.

> 2026-04-18 — Conversation context status runtime truth: `src/services/conversationEngine.ts` publie maintenant dans `response.cognitive_tags` et `metadata.links_to_contexts` les statuts réels `runtime-knowledge:*`, `default-kb:*` et `persistent-memory:*`, plus `twins:present` et `cognitive-context:present` quand le `contextEnvelope` actif les contient. La surface active `src/components/sections/ConversationSection.tsx` réutilise déjà `assistant metadata.tags` pour les afficher sans voie parallèle, ce qui rend le branchement mémoire/KB/TWINS visible sur le chat canonique.

> 2026-04-18 — Conversation default knowledge base prompt truth: `src/services/conversationEngine.ts` enrichit maintenant la route active `/titane?tab=conversation` avec un bloc `DEFAULT_KNOWLEDGE_BASE_CONTEXT` dérivé de `src/services/api/defaultKnowledgeBase.ts::getRelevantPromptContext(query, 4)`, en plus de la mémoire runtime et persistante déjà injectées. La vérité canonique n utilise pas l index complet de KB pour éviter un prompt trop large; elle injecte seulement le contexte ciblé par requête et publie aussi `DEFAULT_KNOWLEDGE_BASE_STATUS` quand la KB est vide ou indisponible.

> 2026-04-18 — Conversation inline citations E2E truth: la surface active `/titane?tab=conversation` rend maintenant les citations inline dans `src/components/sections/ConversationSection.tsx`, pas seulement dans la surface de compatibilité `src/components/chat/MessageBubble.tsx`. `src/services/webResearchService.ts` expose un crochet Playwright strictement borné via `__TITANE_E2E_WEB_RESEARCH_MOCK__` et `__TITANE_E2E_WEB_RESEARCH_REPORT__` pour prouver la voie canonique de handoff web inline sans ouvrir de fetch UI direct, et `e2e/critical/chat-interaction.spec.ts` scelle cette vérité sur les testids `message-citations-{index}` / `message-citation-{index}-{citationIndex}`.

> 2026-04-18 — Conversation provider recovery and inline citations truth: `src/hooks/useConversationEngine.ts` ne traite plus `FALLBACK_OFFLINE` comme une indisponibilité provider à reformuler en recovery message. La vérité canonique garde le contenu assistant backend quand la réponse dégradée est valide, ne réserve le message “mode récupération provider” qu à `PROVIDER_UNAVAILABLE`, et projette aussi `providerUsed` / `requestedProvider` dans la metadata de bulle. En parallèle, `src/components/sections/ConversationSection.tsx` transmet maintenant les `report.answer.citations` de la voie gouvernée `webResearch` et les rend sur la surface active via `message-citations-{index}` / `message-citation-{index}-{citationIndex}`, tandis que `src/components/chat/MessageBubble.tsx` reste aligné comme surface de compatibilité.

> 2026-04-18 — Sandbox list-order truth: `src-tauri/src/security/sandbox.rs` retourne maintenant les `safe_name` de `FileImportSandbox::list_files` dans un ordre lexicographique stable. La surface runtime Tauri `secure_list_files` ne depend donc plus de l ordre non deterministe du filesystem pour un meme contenu de sandbox, et la preuve active passe par `security::sandbox::tests::test_list_files_returns_sorted_safe_names`.

> 2026-04-18 — Sandbox list-empty truth: `src-tauri/src/security/sandbox.rs` renvoie maintenant `[]` quand `FileImportSandbox::list_files` est appele avant creation du repertoire sandbox. Les preuves Rust actives couvrent explicitement `security::sandbox::tests::test_list_files_returns_empty_when_directory_missing` et le nominal `security::sandbox::tests::test_list_files_returns_imported_safe_name`.

> 2026-04-18 — Sandbox import-parent truth: `src-tauri/src/security/sandbox.rs` cree maintenant le dossier parent directement dans `FileImportSandbox::import_file` avant l ecriture du fichier sandbox. Les preuves Rust actives couvrent explicitement `security::sandbox::tests::test_import_file_creates_parent_directory` et la non-regression de `security::sandbox::tests::test_import_file`.

> 2026-04-18 — Audit custom-event truth: `src-tauri/src/security/audit.rs` canonise maintenant les labels `AuditEventType::Custom` avant emission du log structure. Les preuves Rust actives couvrent explicitement `security::audit::tests::test_custom_event_type_sanitizes_control_characters`, `security::audit::tests::test_custom_event_type_defaults_empty_value` et la non-regression de `security::audit::tests::test_custom_event_type`.

> 2026-04-18 — Path whitespace truth: `src-tauri/src/security/validation.rs` refuse maintenant les chemins vides apres trim dans `PayloadValidator::validate_path`. Les preuves Rust actives couvrent explicitement `security::validation::tests::test_validate_path_rejects_whitespace_only_path` et la non-regression de `security::validation::tests::test_validate_path`.

> 2026-04-18 — Message control-character truth: `src-tauri/src/security/validation.rs` refuse maintenant les caracteres de controle interdits aussi dans `InputValidator::validate_message`. Les preuves Rust actives couvrent explicitement `security::validation::tests::test_validate_message_rejects_control_characters` et la non-regression de `security::validation::tests::test_validate_message`.

> 2026-04-18 — Audit logger parent-directory truth: `src-tauri/src/security/audit.rs` garantit maintenant l existence du dossier parent avant append d un log structure. Les preuves Rust actives couvrent la creation automatique de la racine via `security::audit::tests::test_audit_logger_creates_parent_directory` et la non-regression nominale de `security::audit::tests::test_audit_event_creation`.

> 2026-04-18 — Audit user-id canonicalization truth: `src-tauri/src/security/audit.rs` canonise maintenant `AuditEvent.user_id` avant toute emission de journal structure. Les preuves Rust actives couvrent la suppression des caracteres de controle dans `security::audit::tests::test_audit_event_sanitizes_user_id`, le fallback `anonymous` pour un identifiant vide apres nettoyage, et la non-regression nominale de `security::audit::tests::test_audit_event_creation`.

> 2026-04-18 — HTML sanitization escape-order truth: `src-tauri/src/security/validation.rs` et `src-tauri/src/secure_commands.rs` publient maintenant la meme verite de sanitation HTML: `&` est encode avant `<`, `>`, guillemets et apostrophes. Les preuves Rust actives couvrent la non-regression de `security::validation::tests::test_sanitize_html` et la surface runtime `secure_commands::tests::test_sanitize_html`, avec absence de double-escape sur `&lt;script`.

> 2026-04-18 — Shell guard long-flag truth: `src-tauri/src/security/shell_guard.rs` protege les surfaces runtime qui passent par `execute_verified` (`audio/asr`, `tts/local_tts`, `tts/online_tts`, `ai/ollama`, `overdrive/voice_engine`) contre des arguments traversal deguises en faux flags longs. Les preuves Rust actives couvrent le rejet de `--output=../../etc/passwd`, l acceptation d un vrai flag `--keep-going` et la non-regression du nominal deja safe.

> 2026-04-18 — Storage filename sanitization truth: `src-tauri/src/security/storage_guard.rs` ne laisse plus `sanitize_filename` produire un nom vide ou cache seulement compose de points. Les preuves Rust actives couvrent la normalisation de `../../etc/passwd` vers `etcpasswd`, la conservation du nominal texte simple, et le fallback `file_<checksum>` pour une entree entierement invalide.

> 2026-04-18 — Secure secrets key truth: `src-tauri/src/security/secrets_engine.rs` valide maintenant centralement les cles du coffre chiffre avant toute operation `set/get/has/clear`. Les preuves Rust actives couvrent le rejet d une cle invalide contenant des espaces, le rejet d une cle > 128 caracteres et le maintien du round-trip nominal sur `gemini_api_key`.

> 2026-04-18 — Rate limiter user-id truth: `src-tauri/src/security/rate_limit.rs` valide maintenant `user_id` avant toute insertion dans la map interne du limiter. Les preuves Rust actives couvrent le rejet d un identifiant vide ou blanc, le rejet d un identifiant > 128 caracteres dans `get_stats`, et le maintien du nominal `test_rate_limit_basic` avec la nouvelle garde active.

> 2026-04-18 — PayloadValidator path and extension truth: `src-tauri/src/security/validation.rs` refuse maintenant explicitement les chemins `scheme://...` dans `validate_path`, et `validate_file_extension` requalifie d abord la cible par cette meme garde avant tout controle d extension. Les preuves Rust actives couvrent le rejet d un `file:///tmp/test.txt`, le rejet d un `../secret.txt`, et le maintien du nominal `folder/file.txt`.

> 2026-04-18 — Permission audit field truth: `src-tauri/src/security/permission_guard.rs` nettoie maintenant `action` et `source` avant insertion dans `PermissionAudit`. Les preuves Rust actives couvrent explicitement le rejet des bytes de controle dans les champs exportes et le bornage strict a `256` caracteres pour empecher le log poisoning ou des exports JSON demesures.

> 2026-04-18 — Storage guard relative-path truth: `src-tauri/src/security/storage_guard.rs` accepte maintenant uniquement des chemins relatifs sandboxes dans `validate_and_resolve`. Les preuves Cargo actives couvrent le rejet d un `file:///...` et le rejet d un chemin absolu meme deja situe sous la racine sandbox.

> 2026-04-18 — Config import file truth: `src-tauri/src/config/io.rs` qualifie maintenant `import_config` sur un vrai fichier JSON local canonique avant toute lecture. Les preuves Rust actives couvrent l acceptation d un fichier `.json` nominal, le rejet d un traversal, le rejet d un symlink et le rejet d une charge > 1 MiB.

> 2026-04-18 — Piper voice id path truth: `src-tauri/src/audio/commands.rs` rejette maintenant les `voice_id` Piper vides, traversants ou non canoniques avant toute construction de `~/.local/share/piper/voices/{voice}.onnx`, et `src-tauri/src/tts/local_tts.rs` applique la meme garde au chemin local TTS. Les preuves Rust actives passent par `audio::commands::tests::test_piper_voice_id_accepts_canonical_value`, `test_piper_voice_id_rejects_path_traversal` et `test_piper_voice_id_rejects_non_canonical_characters`.

> 2026-04-18 — Chat layout zoom authority runtime truth: `src/hooks/zoomScale.ts` ne s appuie plus sur `document.documentElement.style.zoom` comme autorite active; la mise a l echelle canonique passe par `--titane-ui-scale` et la taille de police racine, pendant que `src/components/layout/AppShell.tsx` reste parent-bound avec un seul offset TopNav fixe. `src/components/sections/ConversationSection.tsx` requalifie en plus `--conversation-vh` via `ResizeObserver` et une synchronisation differee pour suivre les resizes WRY natifs, et la lane desktop remet maintenant la baseline zoom a `1.0` apres activation effective de la surface conversation pour eliminer l etat persistant entre runs. Les preuves ciblées sont PASS en unitaire, Playwright navigateur et WDIO desktop sur la sequence `100% -> 110% -> 100% -> 90%` puis resize compact, avec `--conversation-vh` aligne sur la hauteur effective visible.

> 2026-04-18 — Telemetry CSV source qualification truth: `src-tauri/src/api/telemetry_api.rs` qualifie maintenant le CSV `production_week1.csv` de `temp_dir()` avant toute lecture via `read_production_week1_csv`. La surface refuse explicitement les repertoires, symlinks et fichiers > 10 MiB, et les preuves Rust couvrent le rejet d un repertoire, le rejet d un symlink Unix et le maintien du nominal `test_summarize_valid_csv`.

> 2026-04-18 — Secure engine secret-file permission truth: `src-tauri/src/secure_engine.rs` applique maintenant un verrouillage explicite des permissions sur `write_secret_file` apres ecriture du payload secret. Les preuves d integration dans `src-tauri/tests/secure_engine_tests.rs` couvrent la creation automatique du parent, le round-trip `write_secret_file`/`read_secret_file`, et sur Unix la verite `0600` proprietaire-seul du fichier `secret.enc`.

> 2026-04-18 — File import sandbox flat-name truth: `src-tauri/src/security/sandbox.rs` distingue maintenant la garde de `filename` a l import de la garde de `safe_name` a la relecture/suppression. Les preuves Rust couvrent explicitement le rejet de `nested/escape.txt` pour `read_file` et `delete_file`, tout en gardant le flux nominal `import_file("test.txt", ...)` vert.

> 2026-04-18 — AppShell below-baseline zoom clamp truth: `src/components/layout/AppShell.tsx` ne contre-echelle plus le shell global pour des niveaux de zoom TopNav inferieurs a `1.0`. La compensation width/height/paddingTop passe par `max(var(--titane-ui-scale, 1), 1)`, ce qui supprime l expansion `1440 / 0.9 = 1600` reproduite sur la surface conversation fullscreen dans le navigateur tout en gardant la compensation necessaire au-dessus de `100%`. Les preuves browser `e2e/critical/chat-layout-viewport.spec.ts` couvrent maintenant explicitement la sequence `100% -> 110% -> 100% -> 90%`; la lane WRY embarquee reste non certifiee car le binaire cible ne charge pas `index.html`.

> 2026-04-18 — StorageGuard ancestor containment truth: `src-tauri/src/security/storage_guard.rs` remonte maintenant jusqu au plus proche ancetre existant avant de qualifier une cible absente, au lieu de canonicaliser seulement le parent immediat. Les preuves Rust couvrent explicitement le rejet d une ecriture `linked_out/newdir/escape.txt` quand `linked_out` est un symlink vers l exterieur de la sandbox, ainsi que le maintien du flux nominal `safe_write`/`safe_read`.

> 2026-04-17 — Persistence backup import truth: `src-tauri/src/persistence/backup.rs` restaure maintenant les archives persistence uniquement vers `titan_events.db.events.json` et `titan_events.db.snapshots.json` sous `data_dir`. La surface rejette les noms d entree vides, NUL, absolus, traversants ou contenant des separateurs avant toute ecriture, et les preuves Rust couvrent explicitement le rejet d une entree `../escape.json` ainsi qu un import nominal des deux fichiers autorises.

> 2026-04-17 — Update migration path truth: `src-tauri/src/updates/update_engine.rs` applique une garde locale sur `migration_id` avant toute reconstruction de chemin sous `update_dir/migrations/`. Les preuves Rust couvrent le rejet d un traversal, le rejet d un chemin absolu et l acceptation d un id simple qui n echoue ensuite que sur l absence du script attendu.

> 2026-04-17 — Neural LTM path truth: `src-tauri/src/neural_memory/ltm.rs` applique une garde locale sur `entry.id` puis sur `metadata.file_path` avant toute reconstruction de chemin sous `entries/`. Les preuves Rust couvrent le rejet d un id traversal a l ecriture, d un traversal injecte dans l index a la lecture et d un chemin absolu injecte dans l index a la suppression.

> 2026-04-17 — Memory OS LTM metadata path truth: `src-tauri/src/memory_os/ltm.rs` applique une garde locale sur `metadata.file_path` avant toute reconstruction de chemin sous `entries/`. Les preuves Rust couvrent le rejet d un traversal et d un chemin absolu injectes via l index disque.

> 2026-04-17 — Unified memory persistence path truth: `src-tauri/src/unified_memory_v2/persistence.rs` applique une garde locale sur `id` et `tier` avant toute construction de chemin disque. Les preuves Rust couvrent le rejet d un traversal d id, le rejet d un tier absolu et un round-trip valide sur `stm/entry-1.json`.

> 2026-04-17 — Vault file id truth: `src-tauri/src/security/vault_engine.rs` applique une garde locale sur les `file_id` avant toute construction de chemin `.enc` ou `.sha256`. Les preuves Rust couvrent le rejet d un traversal et d un chemin absolu pour confirmer que la surface ne peut plus sortir de `vault/encrypted/` via un identifiant externe.

> 2026-04-17 — Time-travel snapshot id truth: `src-tauri/src/time/travel_engine.rs` applique une garde locale sur les `snapshot id` avant toute lecture ou suppression de fichiers `.snapshot`. Les preuves Rust couvrent le rejet d un traversal et d un chemin absolu afin de confirmer que la surface ne peut plus sortir de `vault/snapshots/` via un identifiant externe.

> 2026-04-17 — Config presets path truth: `src-tauri/src/config/presets.rs` ne valide plus seulement le nom de preset a l ecriture. La surface applique la meme verification a `load_config_preset` et `delete_config_preset`, et les preuves Rust couvrent l acceptation d un nom simple ainsi que le rejet d un traversal et d un chemin imbrique.

> 2026-04-17 — Backend self-test memory truth: `src-tauri/src/backend_selftest.rs` remplace la verification memoire ad hoc basee sur `std::fs::metadata("memory")` par une preuve active sur un stockage temporaire. La surface cree un `MemoryStorage` ephemere, sauvegarde puis recharge une conversation de test, et supprime ensuite le repertoire de probe; une regression Rust verifie qu aucun fichier de fuite ne subsiste.

> 2026-04-17 — MemoryStorage path truth: `src-tauri/src/memory/storage.rs` ne derive plus directement le nom de fichier depuis `conversation_id`. La surface rejette maintenant les ids vides, absolus, rootes, traversants ou contenant des separateurs de chemin avant tout acces a `storage_dir`, et les preuves Rust couvrent explicitement le rejet d un traversal `../escaped` ainsi que d un id absolu.

> 2026-04-17 — StorageService listing truth: `src-tauri/src/services/storage_service.rs` aligne maintenant `list_keys()` sur la verite de `StorageGuard` en listant la racine de stockage avec `.` plutot qu avec un chemin vide rejeté. La surface continue de s appuyer sur `sanitize_filename`, ne remonte que les fichiers `.json`, et les preuves Rust couvrent enumeration et round-trip de persistance.

> 2026-04-17 — CacheService sandbox truth: `src-tauri/src/services/cache_service.rs` rejette maintenant les cibles hors sandbox meme quand elles imitent lexicalement la racine (`sandbox_evil`). La garde remonte jusqu au plus proche ancetre existant, le canonicalise, refuse les segments parent `..`, puis n autorise la cible finale que si sa reconstruction reste strictement dans `sandbox_root` canonique.

> 2026-04-17 — IOService base-path truth: `src-tauri/src/services/io_service.rs` borne maintenant toutes ses operations filesystem a `base_path` canonique. Les chemins relatifs sont resolves sous cette racine, les segments parent `..` et les chemins absolus hors racine sont rejetes, et l ecriture de nouvelles cibles internes reconstruit la cible depuis l ancetre existant le plus proche pour rester gouvernee meme quand les sous-dossiers n existent pas encore.

> 2026-04-18 — Knowledge parser local document truth: `src-tauri/src/knowledge/parser.rs` valide maintenant `parse_document` et `detect_file_format` sur un vrai fichier local canonique avant toute lecture ou detection. La surface refuse les chemins vides, NUL, schemes `://`, segments parent `..`, repertoires, cibles absentes et fichiers sensibles (`.env`, `.pem`, `.key`, certificats, coffres), puis traite exclusivement la cible fichier resolue.

> 2026-04-18 — ShellGuard canonical command truth: `src-tauri/src/security/shell_guard.rs` refuse maintenant les commandes fournies comme chemins de binaire et non comme simples noms whitelistés. `execute_verified` revalide puis execute le nom whitelisté retourné par `validate_command`, ce qui supprime le contournement par basename autorisé sur chemin arbitraire.

> 2026-04-18 — Developer Mode patch validation truth: `src-tauri/src/engines/developer_mode.rs` borne maintenant `dev_mode_validate_patch` au workspace canonique via une resolution explicite de `patch.file`. La commande refuse les chemins vides, NUL, schemes `://`, segments parent `..` et chemins absolus hors workspace, puis qualifie l extension permise sur la cible resolue au lieu de faire confiance au chemin brut.

> 2026-04-18 — TOTAL_DEV file read truth: `src-tauri/src/commands/total_dev_commands.rs` borne maintenant `total_dev_read_file` au workspace canonique via une resolution explicite avant lecture. La commande refuse les chemins vides, NUL, schemes `://`, segments parent `..`, chemins absolus hors workspace et fichiers sensibles (`.env`, `.key`, `.pem`, `.secret`) apres resolution, puis conserve un resultat structure `ok=false` pour les cibles repo-locales absentes.

> 2026-04-18 — Hybrid patch surface truth: `src-tauri/src/commands/hybrid.rs` borne maintenant `dev_apply_patch` a des fichiers existants du workspace canonique. La resolution refuse les chemins vides, NUL, schemes `://`, segments parent `..`, chemins absolus hors workspace et cibles non fichier, puis applique uniquement le remplacement de lignes demande sur la cible resolue.

> 2026-04-18 — Stub filesystem bridge truth: `src-tauri/src/commands/stub_commands.rs` borne maintenant `fs_exists` et `read_json_file` au workspace canonique. La resolution refuse les chemins vides, NUL, schemes `://`, segments parent `..` et chemins absolus hors workspace; `read_json_file` n accepte plus que des fichiers `.json` <= 2 MiB. `src/lib/security.ts` et `allowed_commands.json` exposent ces deux commandes sur la meme verite gouvernee.

> 2026-04-18 — Hybrid file inspection workspace-bound truth: `src-tauri/src/commands/hybrid.rs` borne maintenant `dev_inspect_file` a la racine workspace canonique. La commande accepte les chemins repo legitimes, garde la lecture des fichiers absents a l interieur du repo, et refuse desormais les chemins vides, NUL, schemes `://`, segments parent `..` et chemins absolus hors workspace via une resolution canonique du parent ou du fichier cible.

> 2026-04-17 — Logging/HMR truth: `src/types/logLevel.ts` devient l autorite canonique pour `LogLevel`, `src/utils/logger.ts` ne declare plus l enum et le re-exporte seulement pour compatibilite, tandis que `src/config/logLevelConfig.ts` consomme ce type partage afin de casser le cycle documente autour du runtime log level manager. `src/contexts/LoggingContext.tsx` ajoute un `LoggingProvider` applicatif et une facade `useLogging`/`useModuleLogger` pour migrer progressivement les hooks et services qui importent encore directement le logger runtime.

> 2026-04-17 — Runtime hooks barrel isolation and hybrid command hardening truth: `src/hooks/usePhysiological.ts` porte maintenant les hooks physiologiques de compatibilite, `src/App.tsx`, `src/components/VitalsPanel.tsx`, `src/components/StatusIndicator.tsx` et `src/components/physiological/PhysiologicalPanel.tsx` importent leurs modules de hooks directement, et `src/__tests__/architecture/no_runtime_hooks_barrel_import.test.ts` interdit tout nouveau runtime import depuis `src/hooks/index.ts`. Cote kernel, `src-tauri/src/commands/hybrid.rs` n execute plus un split shell libre: `dev_run_command` est borne a une allowlist explicite, refuse les operateurs shell et s execute depuis la racine workspace canonique.

> 2026-04-17 — Frontend circular dependency verification truth: `scripts/verify/verify_frontend_circular_deps.sh` devient le garde structurel canonique du corridor HMR frontend. Il execute Madge sur `src/hooks`, `src/contexts`, `src/utils`, `src/config` et `src/types`, exclut le passif hors lot (`services`, `visual-engine`, autres zones legacy), et est expose via `pnpm run verify:frontend-circular-deps` puis consomme dans `.github/workflows/ci-unified.yml`.

> 2026-04-17 — TOTAL_DEV console hardening truth: `src-tauri/src/commands/total_dev_commands.rs` publie maintenant une allowlist exacte pour `total_dev_run_command`, ajoute le rejet explicite des marqueurs shell (`&&`, `||`, `|`, `;`, redirections, retours ligne) et couvre ces refus par des tests Rust internes. Les commandes `cat src*` et variantes larges `git ...`/`pnpm run ...` non repertoriees ne sont plus acceptees par cette surface; la lecture gouvernee de fichiers reste `total_dev_read_file`.

> 2026-04-17 — TOTAL_DEV Git read-only truth: `src-tauri/src/commands/total_dev_commands.rs` borne maintenant `total_dev_git_op` a une allowlist read-only (`status`, `diff`, `log`, `branch`, `show`, `rev-parse`) avec arguments qualifies par operation, et `src/pages/TotalDevPage.tsx` retire les actions `git add`, `commit` et `push` au profit d un message de surface read-only explicite. La cartographie canonique de `/total-dev` expose les selectors `total-dev-git-*` et le marqueur `total-dev-git-readonly-note` comme verite active du panneau Git.

> 2026-04-17 — Conversation effective viewport height truth: `src/components/sections/ConversationSection.tsx` introduit `getEffectiveViewportHeight()` pour calculer `--conversation-vh` a partir de `window.innerHeight / visualViewport.scale` avec garde minimale a `320px`, et surveille maintenant les variations de `visualViewport.scale` et `devicePixelRatio` en plus des `resize`/`orientationchange`. `src/pages/TitanePage.css` retire en parallele les soustractions fixes `-155px/-176px/-82px` sur `.conversation-container` au profit d un dimensionnement parent-bound (`flex: 1 1 auto`, `height: 100%`, `min-height: 0`), tandis que `e2e/critical/chat-layout-viewport.spec.ts` et `e2e/desktop/chat-layout-viewport.wdio.test.js` verifient desormais explicitement que `--conversation-vh` reste alignee sur la hauteur effective et que le bas du chat ne sort plus du viewport sous zoom.

> 2026-04-17 — Agent dashboards conversation-safe dock truth: `src/components/AgentDashboardsPanel.tsx` conserve le montage canonique des cinq dashboards avancés dans `src/components/layout/AppShell.tsx`, mais détecte maintenant la surface fullscreen conversation pour passer en dock compact non-obstructif. Le panneau expose `agent-dashboards-panel-toggle` et `agent-dashboards-panel-content`, reste replié par défaut sur `/titane?tab=conversation`, et les preuves `e2e/critical/chat-layout-viewport.spec.ts` ainsi que `e2e/desktop/chat-layout-viewport.wdio.test.js` vérifient désormais explicitement qu'il n'occulte plus `chat-input` ni `chat-send`.

> 2026-04-17 — Conversation zoom-width containment truth: `src/components/layout/AppShell.tsx` compense maintenant la largeur et la hauteur du shell racine avec `--titane-ui-scale`, tandis que `src/pages/TitanePage.css` et `src/pages/TitanePage-local.css` retirent les restes de sizing `100vw` au profit d’un bornage parent-bound strict (`width/max-width/min-width`). Les preuves `e2e/critical/chat-layout-viewport.spec.ts` et `e2e/desktop/chat-layout-viewport.wdio.test.js` vérifient désormais aussi les bornes gauche/droite de `page-titane`, `tab-conversation`, `chat-messages-scroll-region`, `chat-input` et `chat-send`.

> 2026-04-17 — Security audit IPC bridge truth: `src-tauri/src/security_audit_bridge.rs` introduit les commandes kernel `security_audit_sync_journal` et `security_audit_publish_signed_export` pour ancrer la fédération sécurité active dans `app_data_dir()/security_active` côté Tauri, avec rétention bornée, signature Ed25519 locale et export gouverné écrit sous `exports/`. La surface UI canonique reste `src/services/security_active/SecurityDashboard.tsx`; le bridge backend n’ajoute aucun endpoint réseau ni seconde surface visible.

> 2026-04-17 — Security audit desktop runtime proof truth: les commandes kernel `security_audit_sync_journal` et `security_audit_publish_signed_export` sont maintenant réellement disponibles dans le binaire debug desktop courant du workspace et dans la surface installée `/usr/bin/titane-infinity` après rebuild 30.1.34. La preuve WDIO native écrit `federated_audit_journal.json`, `governed_export_signing_key.json` et des exports signés sous `~/.local/share/com.titane.infinity/security_active/` depuis les deux lanes desktop, sans divergence entre binaire release local et binaire installé.

> 2026-04-17 — Security governed export metadata truth: `src/services/security_active/index.ts` matérialise désormais la dernière preuve signée du bridge Tauri dans une section stable `security-dashboard-governed-export` au lieu de la laisser uniquement dans le JSON brut d export. La surface canonique `src/services/security_active/SecurityDashboard.tsx` publie `exportId`, `exportPath`, `sha256`, `fingerprint`, `publishedAt` et `eventCount` quand le lane gouverné a déjà produit un export, y compris depuis un payload persisté localement si le runtime Tauri n est pas actif au moment du rendu.

> 2026-04-17 — Orchestrator multi-session comparison truth: `src/services/orchestrator/index.ts` ne se limite plus a une serie temporelle locale par onglet; le service conserve maintenant un snapshot borne par session navigateur pour alimenter `orchestrator-dashboard-multi-session-compare` et derive une ventilation `orchestrator-dashboard-champion-breakdown` a partir de `src/services/ai/championChallenger.ts`. `src/services/orchestrator/OrchestratorDashboard.tsx` reste la seule surface canonique et les tests verifies couvrent la comparaison locale ainsi que la ventilation champion/challenger par provider.

> 2026-04-16 — Security audit federation/filter/export truth: `src/services/security_active/index.ts` agrège désormais le journal borné existant avec les `sessionId` du `UILogger` pour exposer une fédération multi-session locale, applique un filtre de sévérité (`all|critical|warning|info`) sur la vue de sécurité active, et génère un export JSON borné des corrélations de confinement persistant dans le navigateur courant. `src/services/security_active/SecurityDashboard.tsx` reste la seule surface canonique de pilotage avec des selectors stables pour filtres, fédération et export.

> 2026-04-16 — Advanced-agent bounded refresh and security audit truth: `src/services/orchestrator/index.ts` persiste désormais une série temporelle locale bornée de snapshots charge/providers pour alimenter `orchestrator-dashboard-live-timeline`, et `src/services/security_active/index.ts` consolide un journal local borné d événements de détection/confinement avec acquittement persistant et résumé de corrélation. Les dashboards `src/services/orchestrator/OrchestratorDashboard.tsx` et `src/services/security_active/SecurityDashboard.tsx` portent eux-mêmes un refresh borné (15s et 10s) au lieu d inventer un flux backend séparé.

> 2026-04-16 — Advanced-agent live runtime surfaces: `src/services/orchestrator/index.ts`, `src/services/explainability/index.ts` et `src/services/security_active/index.ts` n exposent plus seulement une qualification PARTIAL, mais des sections runtime concrètes et stables consommées par leurs dashboards canoniques. L orchestrateur publie des métriques de charge et des snapshots de santé providers dérivés de `metricsEngine`, `autoHealEngine` et `GovernanceConnector`; l explainability publie la chaîne requested -> used -> shown ainsi qu un rapport d inference dérivé de la conversation persistée active; la sécurité active publie des événements de détection et de confinement dérivés de `aiHealthMonitor`, `performanceAlerts`, `PredictiveAlerts`, `UILogger` et de la gouvernance providers.

> 2026-04-16 — Chat E2E knowledge-memory proof truth: la lane critique Playwright `e2e/critical/chat-interaction.spec.ts` peut maintenant qualifier explicitement la disponibilité d une connaissance runtime seedee et le rappel du dernier échange sur le chemin mock frontend canonique. `src/services/conversationEngine.ts` publie alors des marqueurs visibles `[MOCK_KNOWLEDGE]` et `[MOCK_MEMORY]` sans prétendre exécuter un backend HTTP distinct, et consigne les interactions mockées dans `window.__TITANE_E2E_CHAT_MEMORY_LOG__` pour vérifier honnêtement la persistance de la lane de preuve.

> 2026-04-16 — Advanced agents readiness alignment truth: les surfaces `diagnostic-panel`, `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` ne restent plus documentées comme `planned` dès lors que leurs services dédiés exposent déjà des signaux runtime/configuration vérifiables. Leur statut canonique est désormais `partial`, au même titre que `monitoring-dashboard`, tant que le moteur complet correspondant n est pas encore branché.

> 2026-04-16 — Chat single-door memory/knowledge alignment truth: `src/services/conversationEngine.ts` reste la porte frontend active vers `conversation_generate` via IPC Tauri, sans serveur HTTP dédié pour le chat ni pour Twins. Cette porte active précharge désormais la connaissance runtime issue du Memory Core (`memory_get_knowledge`) dans le `systemPrompt`, conserve le contexte Twins/TIME déjà présent, et persiste chaque interaction réussie via `persistent_memory_write_entry`, afin d éviter une dérive entre mémoire, base de connaissance et chemin conversationnel canonique.

> 2026-04-16 — Monitoring lazy-loader binding truth: `src/services/monitoring/index.ts` n'utilise plus une réexportation directe et un import local concurrent pour `isMonitoringLoaded`. La façade charge désormais explicitement les bindings du lazy-loader puis les réexporte, ce qui réaligne `src/services/monitoring/MonitoringDashboard.tsx` avec la vérité runtime observable sur la surface active et supprime le crash `isMonitoringLoaded is not defined` au rendu du panneau monitoring.

> 2026-04-17 — Monitoring boot initialization truth: `src/hooks/useAppInitialization.ts` déclenche désormais `initMonitoringAsync('boot')` sur la surface applicative canonique, et `src/services/monitoring/monitoringLazyLoader.ts` publie un état runtime lisible par le service monitoring (`requested`, `loading`, `loaded`, `requestSource`, timestamps, dernière erreur). `src/services/monitoring/index.ts` consomme cette vérité pour distinguer un monitoring encore en veille, un bootstrap réellement demandé au boot, et un lazy-loader chargé, au lieu de déduire l état uniquement depuis `isMonitoringLoaded()`.

> 2026-04-17 — Diagnostic/explainability bounded-runtime truth: `src/services/diagnostic/index.ts` ne se limite plus à une synthèse passive; il persiste un rapport d anomalie structurel borné dérivé des alertes, erreurs globales, état Ollama et providers actifs, puis l expose via `diagnostic-panel-diagnostic-report` et `diagnostic-panel-diagnostic-history` sur `src/services/diagnostic/DiagnosticDashboard.tsx`. En parallèle, `src/services/explainability/index.ts` conserve un historique local horodaté des traces `providerMeta` observées sur la conversation active et l expose via `explainability-dashboard-inference-history`, ce qui fait évoluer la surface de la dernière trace isolée vers une série bornée de décisions runtime.

> 2026-04-16 — Advanced agents runtime detail truth: `src/services/explainability/index.ts`, `src/services/orchestrator/index.ts` et `src/services/security_active/index.ts` n exposent plus seulement une synthèse `PARTIAL`; ils publient désormais des sections détaillées à partir de la vérité runtime déjà disponible dans le repo. Explainability lit la conversation persistée pour exposer la chaîne `requested -> used -> shown` et un rapport d'inférence, orchestrator publie métriques live et snapshots providers depuis `metricsEngine`/`GovernanceConnector`, et security active agrège logs UI, alertes health/perf/prédictives et événements de confinement sans simuler de moteur séparé.

> 2026-04-17 — Advanced agents runtime signal truth: les dashboards avancés conservent `src/services/agents/advancedAgentCatalog.ts` comme base de qualification, mais les services dédiés enrichissent maintenant cette base avec les signaux réels déjà disponibles dans le runtime et la configuration canonique du repo. Le monitoring publie métriques/alertes, le diagnostic expose ses signaux passifs et l état Ollama, l explainability vérifie l alignement du registre champion/challenger, l orchestrateur expose les providers/timeouts actifs, et la sécurité active rappelle la voie IPC/One Door réellement en vigueur.

> 2026-04-16 — Advanced agents runtime mount truth: `src/components/layout/AppShell.tsx` monte maintenant `src/components/AgentDashboardsPanel.tsx` dans la surface applicative active. La preuve Playwright attend donc la présence réelle de `agent-dashboards-panel` et des cinq dashboards avancés sur la route de base, au lieu de s appuyer sur des exports non montés.

> 2026-04-16 — Advanced agents qualification truth: `src/services/agents/advancedAgentCatalog.ts` devient la vérité canonique des cinq agents avancés UI. Les dashboards de `src/services/monitoring/MonitoringDashboard.tsx`, `src/services/diagnostic/DiagnosticDashboard.tsx`, `src/services/explainability/ExplainabilityDashboard.tsx`, `src/services/orchestrator/OrchestratorDashboard.tsx` et `src/services/security_active/SecurityDashboard.tsx` n exposent plus des stubs opaques mais un statut gouverné (`data-readiness`), une synthèse, des preuves visibles, des blockers et une prochaine action. Les composants legacy sous `src/components/` sont désormais de simples alias vers ces surfaces canoniques pour éviter toute divergence active.

> 2026-04-17 — Canonical zoom authority and parent-bound shell truth: `src/hooks/zoomScale.ts` publie désormais un événement canonique de changement d’échelle consommé par `TopNav` et `UIReadingProvider`, ce qui supprime les autorités concurrentes de zoom dans la surface active. En parallèle, `src/components/layout/AppShell.tsx`, `src/ui/reading/UIReadingPanel.css`, `src/ui/components/Modal.css`, `src/ui/Modal.tsx`, `src/index.css` et `src/ui/pages/styles/Chat.css` ont été réalignés sur des dimensions parent-bound (`100%`) au lieu de `vh/dvh` rigides, pour que textes et éléments UI restent cohérents sous zoom navigateur, zoom applicatif et runtime Tauri sans redébordement du shell.

> 2026-04-17 — Native Tauri zoom-step and parent-bound truth: `src/hooks/zoomScale.ts`, `src/components/layout/TopNav.tsx` et `src/hooks/useZoomControl.ts` partagent maintenant un pas de zoom additif canonique, ce qui supprime la dérive `1 -> 1.1 -> 0.99`. En parallèle, `src/pages/TitanePage-local.css` force la surface `titane-page--conversation` à rester parent-bound (`width/max-width/min-height` overrides) afin que la vérité runtime Tauri dev garde `/titane?tab=conversation` entièrement visible à `0.8`, `1.0` et `1.1` dans la fenêtre native.

> 2026-04-16 — Surface chat fullscreen/zoom: la vérité canonique desktop/browser ne dépend plus d'un zoom CSS global à 75%. La baseline UI est revenue à 100%, la surface conversation Titane est étirée par son parent fullscreen, et les contrôles de zoom/fullscreen restent portés par les raccourcis navigateur/Tauri au lieu d'un shrink global qui créait des marges noires en HTTP.

> 2026-04-16 — Surface chat bounded-height chain: `src/pages/TitanePage-local.css` borne désormais explicitement la chaîne fullscreen `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container` en `display:flex`, `flex-direction:column` et `height:100%`, afin que le compositeur ne déborde plus sous la fenêtre desktop HTTP quand l’onglet conversation est actif.

> 2026-04-17 — TopNav zoom viewport compensation: `src/hooks/zoomScale.ts` publie maintenant la variable canonique `--titane-ui-scale` en même temps que le zoom inline, et `src/components/layout/AppShell.tsx` compense la hauteur racine ainsi que l’offset TopNav avec cette échelle. La vérité runtime vérifiée est que `/titane?tab=conversation` reste entièrement dans la fenêtre visible sous zoom TopNav réel, sur desktop standard et viewport compact.

> 2026-04-16 — Canonical route-context anti-drift: `src/services/chat/moduleRouteContext.ts` normalise maintenant les alias query-driven vers leur destination canonique complète, pas vers une racine tronquée; `/chat` publie `/titane?tab=conversation`, `/devtools` publie `/admin?tab=system&systemTab=devtools`, et le fallback F12 de `src/main.tsx` navigue directement vers cette surface Admin/DevTools pour empêcher une vérité UI mémoire/diagnostic en retard sur la surface réellement visible.

> 2026-04-16 — Audit anti-dérive v30.1.x: la cartographie canonique doit désormais expliciter qu’une surface visible n’est jamais qualifiée seule. Toute correction ou évolution doit réaligner dans la même phase la surface UI, les tests E2E associés, la chaîne IPC/backend réellement consommée, les artefacts packagés, les launchers installés et les preuves AutoHeal; toute divergence entre une de ces vérités runtime est un état FAIL tant qu’elle n’est pas requalifiée.

> 2026-04-16 — Conversation long-message visibility: `src/components/chat/VirtualizedMessageList.tsx` ne filtre plus les messages assistant tres longs avec une borne fixe 100k avant de choisir la surface de rendu; la liste revient maintenant honnetement a `MessageList` pour les hauteurs naturelles, et l'evenement `titane-message-truncated` n'est emis que lorsqu'une limite explicite est configuree.

> 2026-04-16 — Conversation runtime transparency reply: `src/components/sections/ConversationSection.tsx` detecte maintenant les prompts purement descriptifs demandant le provider reel, l'usage reseau et les capacites d'export de l'UI, puis repond localement a partir de la derniere verite runtime instrumentee au lieu de laisser le modele improviser ou rebasculer vers une voie artefact.

> 2026-04-16 — Conversation transparency routing truth: `src/features/chat/artifactIntent.ts` ne traite plus toute mention d'"export" comme une demande artefact; les questions descriptives sur ce que l'UI permet d'exporter restent dans la voie réponse chat canonique, et seules les demandes explicites d'export/génération de fichier déclenchent le manifeste artefact.
> 2026-04-16 — Conversation fullscreen internal scroll budget: `conversation-container[data-fullscreen='true']` neutralise maintenant le gap vertical hérité entre ses blocs, et `titane-content--conversation` réserve un budget bas safe-area-aware sur mobile compact pour que la zone de messages garde le scroll interne pendant que l’onglet chat et le compositeur restent visibles ensemble.
> 2026-04-16 — Conversation fullscreen persistence: `TitanePage` ne force plus un `scrollIntoView()` du textarea lors de l’activation de l’onglet chat, `titane-page-header--conversation` reste sticky dans le shell fullscreen, et `chat-messages-scroll-region` expose une scrollbar native droite renforcée pour garder visibles le header d’onglet et le repère de défilement sous zoom.
> 2026-04-16 — GitHub Copilot rate-limit resilience: `src-tauri/src/api_hub/copilot.rs` effectue maintenant des retries bornés sur quota GitHub (`429`/`403` rate-limited) avec respect de `Retry-After` et backoff exponentiel plafonné avant remontée d’erreur, afin d’éviter les faux échecs de type code review.
> 2026-04-16 — Canonical anti-regression surface truth: `src/features/admin/AdminPage.tsx` monte désormais `SelfHealingDashboard` comme onglet actif `/admin?tab=anti-regression`; la surface visible canonique expose `self-healing-dashboard` et `anti-regression-summary`, et la classification runtime passe par `src/services/selfHealing/selfHealingService.ts`.

> 2026-04-16 — Canonical chat surface truth: `src/pages/ChatPage.tsx` est désormais un alias explicite vers `TitanePage`; le router legacy `/chat` redirige maintenant explicitement vers `/titane?tab=conversation`, le router déprécié et le préchargement critique pointent eux aussi vers `TitanePage`, et la surface utilisateur réellement active reste `ConversationSection` sous cette topologie canonique.
> 2026-04-16 — Legacy chat export truth: `src/ui/pages/Chat.tsx` a été réduit à un alias de compatibilité vers `ChatPage`, lui-même alias vers `TitanePage`; les imports hérités restent donc fonctionnels sans réintroduire l’ancienne UI chat autonome.

> 2026-04-16 — Conversation rate-limit provider-flow proof: `tests/e2e/provider-flow.test.ts` réutilise désormais le scénario `window.__TITANE_E2E_CHAT_SCENARIO__='rate_limit'` pour vérifier dans la lane Playwright riche que le panneau runtime expose `provider_used=github-copilot`, `reason_code=RATE_LIMIT`, `mode=OFFLINE` et `network_used=true` sans retomber sur `[MOCK_OK]`.
> 2026-04-15 — Correction de synchronisation conversationnelle: `src/services/conversationEngine.ts` traite désormais `tauri_protector_ipc_fallback` / `CONTRACT_VIOLATION_CLAMPED` comme une désynchronisation backend/frontend récupérable et déclenche le fallback orchestrateur avant de remonter une erreur, afin de préserver une réponse locale valide quand le runtime Tauri est momentanément désaligné.
> 2026-04-15 — Canonicalisation TWINS corrigée: le pont `src/services/chat/moduleRouteContext.ts` publie maintenant `/twins` comme destination canonique pour les alias legacy `/identity|/identity-center|/persona|/twin`; cette note remplace les anciennes correspondances documentaires vers `/titane?tab=twins`.

> 2026-04-16 — Conversation rate-limit E2E proof: `src/services/conversationEngine.ts` supporte maintenant un scénario de mock critique `RATE_LIMIT` piloté par `window.__TITANE_E2E_CHAT_SCENARIO__`, ce qui permet à `e2e/critical/chat-interaction.spec.ts` de vérifier explicitement que la surface runtime expose `reason_code=RATE_LIMIT` et `mode=OFFLINE` sans faux succès `[MOCK_OK]`.
> 2026-04-16 — Conversation rate-limit truth: `buildConversationFallbackMeta` classe désormais explicitement les erreurs de quota (`rate limit`, `429`, `retry after`, `limite de taux`) en `RATE_LIMIT` avec mode `OFFLINE`, et `ConversationSection` traduit ce reason code en état runtime `blocked` pour refléter un blocage temporaire gouverné au lieu d’une erreur générique.
> 2026-04-15 — Conversation fullscreen flex chain: la surface active `ConversationSection` remplit désormais la hauteur fullscreen via la chaîne `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container`, sans réintroduire de hauteur mobile soustractive dédiée; le compositeur bas reste visible sous zoom et en viewport compact.
> 2026-04-15 — Conversation view polish: `ConversationSection` regroupe désormais toolbar, filtres et télémétrie dans un chrome haut unique, compacte la télémétrie dans un layout résumé+badges plus lisible, et renforce la hiérarchie visuelle des bulles assistant/utilisateur pour une lecture plus nette.
> 2026-04-15 — Conversation return-to-bottom CTA: `chat-scroll-to-bottom` devient une petite flèche ronde discrète ancrée au bas de la surface chat, sans libellé visible, afin d’offrir un retour rapide au dernier message sans élargir la zone basse.
> 2026-04-15 — Conversation composer containment: le compositeur bas de `ConversationSection` reste désormais sticky et borné au viewport visible en mode fullscreen, avec un ajustement `safe-area`/hauteur max sur la zone d’écriture; la preuve T17 contrôle explicitement que `composerBottom` reste dans la fenêtre.
> 2026-04-15 — Conversation fullscreen immersive: `ConversationSection` expose désormais `data-fullscreen=true|false` sur `conversation-container` et applique un chrome fullscreen plus marqué sur la toolbar, le panneau runtime, le flux et le compositeur, afin que le mode plein écran reste immédiatement perceptible même hors densité `compact`.
> 2026-04-15 — Android browser-mobile conversation: le mode fullscreen compact de `ConversationSection` ne force plus `height: 100%` sur petit viewport, et `TitanePage-local.css` applique un override mobile dedie pour conserver visible le compositeur; la lane Playwright Android valide l'envoi via le selector stable `chat-send` avec un dispatch DOM natif cote harness afin d'eliminer les faux negatifs de clic synthetique tout en gardant la surface UI intacte.
> 2026-04-15 — Réponses longues chat: `VirtualizedMessageList` conserve `react-window` pour les historiques compacts mais rebascule vers `MessageList` quand un message exige une hauteur naturelle, afin d’éviter la coupure visuelle des réponses longues dans la surface conversation; les budgets par défaut sont alignés sur le plafond backend utile de 32768 pour supprimer les restrictions artificielles basses.
> 2026-04-15 — Conversation fullscreen: densité compacte pilotée par le viewport réel pour préserver la visibilité au zoom, ajout du CTA flottant `chat-scroll-to-bottom`, du sélecteur `chat-messages-scroll-region`, d’un renforcement safe-area et d’une chaîne `flex/min-height/overflow` plus stricte pour maintenir visibles le bas du flux et le compositeur sur desktop/mobile.
> 2026-04-15 — AppShell fullscreen: la chaîne de conteneurs racine React/TITANE conserve maintenant `h-dvh + min-height:0 + flex-column` jusqu’au host scrollable principal, afin que la page conversation fullscreen n’hérite plus d’un wrapper extensible recréant un vide sous le chat.
> 2026-04-15 — Knowledge Fusion: la page `/knowledge` ne signale plus un faux résultat nul au simple choix de fichier; l’avertissement `knowledge-null-result-warning` n’est affiché qu’après une tentative `parseDocument` réellement revenue à `null`, et le vault ignore désormais toute valeur nulle.
> 2026-04-14 — Mise à jour UI: suppression définitive de l’onglet Twins dans `TitanePage`; exposition Twins uniquement via TopNav menu Plus (***) sur la route `/twins` (legacy `/identity|/persona|/twin` -> `/twins`).
> 2026-04-14 — Mise à jour UI chat: suppression des surfaces TWINS de `ConversationSection`; l’entrée dédiée `nav-twins` reste disponible dans le menu Plus de la TopNav vers `/twins`.

> **Mise à jour le 2026-04-14
> Document de référence architecture — généré depuis scan du dépôt

---

## A. Architecture 4-Ring

TITANE_INFINITY est organisé en 4 anneaux concentriques, du noyau Rust vers l'interface React. Chaque anneau ne peut importer que des anneaux d'ordre inférieur (pas d'inversion).

```
┌─────────────────────────────────────────────────────────────────────┐
│  Ring 4 — UI Layer (React/TypeScript)                               │
│  Pages · Components · UI Primitives · Hooks                         │
├─────────────────────────────────────────────────────────────────────┤
│  Ring 3 — Store Layer (Zustand)                                     │
│  18 stores + selectors                                              │
├─────────────────────────────────────────────────────────────────────┤
│  Ring 2 — Engine Layer (src-tauri/src/ modules)                     │
│  20+ moteurs Rust : cognitif, mémoire, singularité, audio...        │
├─────────────────────────────────────────────────────────────────────┤
│  Ring 1 — Core Services (src/services/)                             │
│  IPC bridge · 1135 commandes Tauri · AI orchestration               │
├─────────────────────────────────────────────────────────────────────┤
│  Ring 0 — Kernel Rust (main.rs · security · constitution)           │
│  Point d'entrée · Sécurité · Registre des modules                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Ring 0 — Kernel / Rust

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `main.rs` | 2857 | Point d'entrée, invoque ~1135 commandes Tauri via `generate_handler![]` |
| `lib.rs` | — | Registre des modules Rust |
| `error.rs` | — | Définition des erreurs canoniques |
| `error_handling.rs` | — | Gestion centralisée des erreurs |
| `bounded.rs` | — | Contraintes de bornes et limites |
| `engine_trait.rs` | — | Trait abstrait commun à tous les moteurs |
| `state.rs` | — | État global partagé Tauri |
| `handlers.rs` | — | Handlers IPC génériques |

Modules kernel : `kernel/`, `core/`, `security/`, `constitution/`


### Scripts de lancement et d’installation

- **Linux** : `scripts/launch/launch-titane.sh`, `scripts/launch/start_dev.sh`
- **Windows** : 
  - `scripts/launch/launch-titane.ps1` (lancement principal)
  - `scripts/launch/launch-titane.bat` (batch)
  - `scripts/launch/launch-ollama.ps1` (**installation Ollama + modèles IA**)
- **Backend Ollama** : la boucle locale canonique cote Rust cible `127.0.0.1:11434` dans l'orchestrateur desktop et reutilise `gemma2:2b` comme fallback streaming canonique pour stabiliser les probes et generations WDIO/Tauri.
- **Active fallback truth** : `src/main.tsx`, `src/pages/ConfigurationHub.tsx` et `src-tauri/src/config/update.rs` partagent maintenant le meme fallback runtime canonique `http://127.0.0.1:11434` + `gemma2:2b`, et `scripts/verify/verify-ollama-cline-alignment.sh` qualifie explicitement ces surfaces actives ainsi que les hooks Cline associes.
- **Android** : voir `titane-android/`

---

| Service | Lignes | Rôle |
|---------|--------|------|
| `tauriCommands.ts` | — | Wrapper IPC canonical (`invokeTauriCommandCanonical`) |
| `tauriBridge.ts` | — | Bridge Tauri — abstraction bas niveau |
| `tauriClient.ts` | 3456 | Client Tauri complet, toutes commandes IPC |
| `ai/chatEngine.ts` | 3356 | Moteur de chat AI principal |
| `ai/orchestrator.ts` | 2133 | Orchestrateur AI multi-providers |
| `ragService.ts` | — | RAG/semantic search (`safeInvokeCanonical`) |
| `evolutionEngine/` | — | Moteur d'évolution continue |
| `singularityBridge.ts` | — | Pont singularité v1 |
| `singularityBridgeVInfinity.ts` | — | Pont singularité vΩ |
| `conversationEngine.ts` | — | Moteur de conversation |
| `adminEngine/` | — | Moteur d'administration |
| `audio/` | — | Services audio (capture, analyse) |
| `chat/` | — | Services de chat |
| `mcp/` | — | MCP (Model Context Protocol) |
| `voice/` | — | Services voix |
| `agendaService.ts` | — | Gestion agenda/timeline |
| `autoAuditEngine.ts` | — | Audit automatisé |
| `webResearchService.ts` | — | Recherche web |
| `userPreferencesEngine.ts` | — | Préférences utilisateur |
| `experienceService.ts` | — | Gestion XP/expérience |

---

## Agents avancés (v30.1.8)

| Agent | Dossier | Rôle principal |
|-------|---------|---------------|
| Monitoring Agent | monitoring/, src/services/monitoring/ | Supervision temps réel, alerting, logs croisés |
| Auto-Diagnostic Agent | diagnostic/, src/services/diagnostic/ | Analyse proactive, auto-vérification, correction automatique |
| Explainability Agent | explainability/, src/services/explainability/ | Traçabilité IA, justification, audit explicable |
| Orchestrateur Dynamique Agent | orchestrator/, src/services/orchestrator/ | Répartition dynamique, gestion de la charge |
| Agent de Sécurité Active | security_active/, src/services/security_active/ | Détection d’anomalies, sandboxing, réponse automatisée |

Chaque agent est intégré dans la cartographie 4-Ring : UI (dashboard), moteur dédié (Ring 2), accès kernel (Ring 0) si besoin.

---

### Ring 2 — Engine Layer (`src-tauri/src/` modules)

| Moteur | Module | Rôle |
|--------|--------|------|
| Harmonia | `harmonia_engine.rs` | Moteur harmonique — cohérence des centres |
| Cognitif | `cognitive/` | Moteur cognitif — raisonnement |
| Évolution | `evolution/` | Moteur d'évolution continue |
| Singularité | `singularity/` | Moteur singularité — état méta |
| Cycle | `cycle_engine/` | Moteur de cycles d'activité |
| Hyper-Intelligence | `hyper_intelligence/` | Moteur hyper-intelligence |
| Adaptatif | `adaptive/` | Moteur adaptatif (1488L) |
| Overdrive | `overdrive/` | Moteur overdrive haute performance |
| Mémoire | `memory/` | Mémoire multi-niveaux (STM/MTM/LTM) |
| Mémoire évolution | `memory_evolution/` | Évolution et consolidation mémoire |
| Mémoire neurale | `neural_memory/` | Mémoire neurale — patterns |
| Conversation | `conversation_engine/` | Moteur de conversation (2273L commands) |
| Subtilité émotionnelle | `emotional_subtlety` | Sous-module conversation |
| Maîtrise française | `french_mastery` | Sous-module conversation (1434L) |
| TTS | `tts/` | Text-to-Speech |
| Audio | `audio/` | Capture audio (2157L commands) |
| Avatar | `avatar/` | Moteur avatar 3D |
| Multimodal | `multimodal/` | Moteur multimodal (vision + texte) |

### Ring 3 — Store Layer (`src/stores/`)

| Store | Fichiers | État géré |
|-------|---------|-----------|
| Evolution | `evolutionStore.ts` + `evolutionStore.selectors.ts` | État d'évolution, niveau, XP |
| Memory | `memoryStore.ts` + `memoryStore.selectors.ts` | État mémoire (STM/MTM/LTM) |
| System | `systemStore.ts` + `systemStore.selectors.ts` | État système global |
| UI | `uiStore.ts` + `uiStore.selectors.ts` | Toasts, panneaux, notifications |
| Visual Unified | `unifiedVisualStore.ts` + `unifiedVisualStore.selectors.ts` | État visuel unifié |
| Visual | `visualStore.ts` | État visuel basique |
| Visual State | `visualStateStore.ts`, `visualStateStoreV21.ts` | État visuel v21 |
| Effects | `effectsStore.ts` | Effets visuels (particules, aura) |
| Panels | `panelsStore.ts` | État des panneaux UI |
| Chat Mode | `useChatModeStore.ts` | Mode de chat actif |
| Memory Engine | `useMemoryEngineStore.ts` | Moteur mémoire actif |
| Performance | `usePerformanceStore.ts` | Métriques de performance |
| In-Flight Requests | `useRequestInFlightStore.ts` | Requêtes en cours |
| Self-Healing | `useSelfHealingStore.ts` | État auto-guérison |
| TTS Engine | `useTTSEngineStore.ts` | Moteur TTS actif |
| Vision | `useVisionStore.ts` + `useVisionStore.selectors.ts` | État vision/caméra |
| Automation XP | `useAutomationXPStore.ts` | Automation et XP |

### Ring 4 — UI Layer (`src/pages/`, `src/components/`, `src/ui/`)

#### Pages React (45+)

| Page | Description |
|------|-------------|
| `AdaptiveEngine` | Interface moteur adaptatif |
| `AdminPage` | Administration centrale |
| `AgendaPage` | Agenda et timeline |
| `CameraPage` | Interface caméra/vision |
| `ChatPage` | Interface de chat |
| `CloudCenter` | Centre cloud/sync |
| `CognitivePage` | Interface cognitive |
| `ConfigurationHub` | Hub de configuration |
| `CreationStudio` | Studio de création |
| `DashboardPage` | Tableau de bord principal |
| `DesignSystemPage` | Système de design |
| `DesignSystemShowcase` | Showcase design system |
| `DevPage` | Page développeur |
| `DevTools` | Outils de développement |
| `DevToolsLazy` | DevTools chargement différé |
| `DevToolsTabs` | DevTools avec onglets |
| `EvoPage` | Page d'évolution |
| `EvolutionCenterPage` | Centre d'évolution |
| `EvolutionMonitor` | Moniteur d'évolution |
| `Experience` | Page expérience/XP |
| `Harmonia` | Interface Harmonia Engine |
| `Helios` | Interface Helios |
| `Memory` | Interface mémoire |
| `ModulePages` | Pages modules |
| `MonitoringDashboard` | Tableau de bord monitoring |
| `Nexus` | Interface Nexus Engine |
| `OrchestrationMetaCenter` | Centre méta-orchestration |
| `PerfectFusionDashboard` | Tableau fusion parfaite |
| `PerformanceTest` | Tests de performance |
| `ProgressionPage` | Progression |
| `RealityCenter` | Centre réalité |
| `ResearchPage` | Recherche |
| `SecureSettings` | Paramètres sécurité |
| `SelfHeal` | Auto-guérison |
| `Sentinel` | Interface Sentinel |
| `Settings` | Paramètres |
| `SingularityMonitor` | Moniteur singularité |
| `Stats` | Statistiques |
| `TimePage` | Gestion du temps |
| `TimeNavigator` | Navigation temporelle |
| `TitanePage` | Page principale TITANE |
| `TotalDevPage` | Page dev totale |
| `TwinsPage` | Jumeaux numériques |
| `UltimateOptimizationDashboard` | Optimisation ultime |
| `Watchdog` | Interface watchdog |

#### Composants (catégories majeures)

| Catégorie | Composants principaux |
|-----------|-----------------------|
| `sections/` | TwinsSection, ConversationSection, MemorySection, et autres |
| `chat/` | ChatWindow, MessageBubble, ChatDiagnostic, ChatErrorBoundary |
| `dev/` | DevConsole, ConsoleMonitorDashboard, PredictiveDashboard |
| `audio/` | AudioSettings, VoiceControlPanel |
| `evolution/` | EvolutionDashboard, XPBar |
| `cognitive/` | CognitiveDashboard |
| `HyperCenter/` | Centre hyper-intelligence |
| `QuantumCenter/` | Centre quantique |
| `MetaCenter/` | Centre méta |
| `layout/` | AppShell, TopNav |
| `diagnostics/` | BootHealthDashboard, SplashWatchdog |
| `aura/` | QuantumParticles, AuraControlPanel |

#### UI Primitives (`src/ui/`)

`AppLayout` · `Button` · `Badge` · `Card` · `Input` · `Icons` · `Menu` · `Modal` · `Spinner`

---

## B. Catalogue IPC — Résumé

> Voir le catalogue exhaustif : [IPC_CATALOG.md](./IPC_CATALOG.md)

**1135 commandes IPC** réparties en 68 domaines fonctionnels.

| Domaine | Commandes | Domaine | Commandes |
|---------|-----------|---------|-----------|
| AI / Chat | 13 | Logging | 13 |
| API Gateway | 12 | Memory | 114 |
| Adaptive Engine | 7 | Meta-Orchestration | 48 |
| Agents | 7 | Monitoring | 16 |
| Audio | 21 | Multi-AI | 24 |
| Authentication | 26 | Multimodal | 16 |
| Automation | 13 | Network | 9 |
| Avatar | 44 | Ollama | 1 |
| Batch | 3 | OneCore | 11 |
| Browser Agent | 7 | Overdrive | 2 |
| Cache | 6 | Persistent Memory | 12 |
| Capabilities | 4 | Projects | 8 |
| Chat Engine | 30 | QA / Testing | 5 |
| Cloud Sync | 16 | Rate Limiting | 4 |
| Cognitive Engine | 44 | Repair/Healing | 6 |
| Config / Control Panel | 38 | Security | 9 |
| Conversation Engine | 15 | Self-Healing | 31 |
| Cycle Engine | 7 | Semantic Skills | 10 |
| Dashboard | 3 | Singularity | 37 |
| Database | 8 | Snapshots | 5 |
| Desktop Agent | 11 | State Management | 14 |
| DevTools | 24 | System Center | 22 |
| Digital Twin | 8 | TITAN Core | 33 |
| Engines | 40 | Tasks | 4 |
| Evolution | 40 | Temporal Engine | 7 |
| Experience/XP | 23 | Training | 15 |
| Export/Import | 3 | TTS/Voice | 13 |
| Filesystem | 7 | VAD | 7 |
| Fusion Engine | 18 | Voice | 19 |
| Health/Diagnostics | 24 | HyperIntelligence | 11 |
| IDE Agent | 10 | Identity | 38 |
| Introspection | 6 | Jobs | 6 |
| Knowledge Base | 18 | Literary Engine | 9 |
| **TOTAL** | **1135** | | |

---

## C. Carte des Stores Zustand

| Store | Fichier | État (shape) | Sélecteurs exportés |
|-------|---------|--------------|---------------------|
| Evolution | `evolutionStore.ts` | `{ level, xp, history, isRunning }` | `selectEvolutionLevel`, `selectXP`, `selectIsRunning` |
| Memory | `memoryStore.ts` | `{ stm, mtm, ltm, status }` | `selectMemoryStatus`, `selectSTM`, `selectLTM` |
| System | `systemStore.ts` | `{ health, status, version, features }` | `selectSystemHealth`, `selectStatus` |
| UI | `uiStore.ts` | `{ toasts, panels, modals, theme }` | `selectToasts`, `selectActivePanels` |
| Visual Unified | `unifiedVisualStore.ts` | `{ mode, effects, particles, aura }` | `selectVisualMode`, `selectEffects` |
| Visual | `visualStore.ts` | `{ theme, animations, fps }` | — |
| Visual State | `visualStateStore.ts` | `{ state, version }` | — |
| Effects | `effectsStore.ts` | `{ active, intensity, type }` | — |
| Panels | `panelsStore.ts` | `{ open, minimized, positions }` | — |
| Chat Mode | `useChatModeStore.ts` | `{ mode, profile }` | — |
| Memory Engine | `useMemoryEngineStore.ts` | `{ engine, config }` | — |
| Performance | `usePerformanceStore.ts` | `{ fps, latency, memory }` | — |
| In-Flight | `useRequestInFlightStore.ts` | `{ pending, count }` | — |
| Self-Healing | `useSelfHealingStore.ts` | `{ scanning, issues, lastRun }` | — |
| TTS Engine | `useTTSEngineStore.ts` | `{ engine, voice, speed }` | — |
| Vision | `useVisionStore.ts` | `{ active, model, stream }` | `selectVisionActive`, `selectModel` |
| Automation XP | `useAutomationXPStore.ts` | `{ tasks, xp, history }` | — |

---

## D. Carte des Hooks (96 hooks)

### Chat (9 hooks)

| Hook | Rôle |
|------|------|
| `useChat` | Hook principal de chat (2407L) |
| `useChatCore` | Noyau chat — envoi/réception |
| `useChatModes` | Modes de chat (texte, voix, etc.) |
| `useChatStreaming` | Streaming de réponses |
| `useChatUI` | État UI du chat |
| `useChatMemory` | Mémoire contextuelle chat |
| `useChatMemoryCache` | Cache mémoire chat |
| `useAIChatStreaming` | Streaming AI |
| `useGlobalAIChat` | Chat AI global |

### Voice/Audio (12 hooks)

| Hook | Rôle |
|------|------|
| `useVoice` | Hook voix principal |
| `useVoiceEngine` | Moteur voix |
| `useVoiceInput` | Capture voix |
| `useVoiceMode` | Mode voix |
| `useAudioChat` | Chat audio |
| `useAudioSettings` | Paramètres audio |
| `useAudioStreaming` | Streaming audio |
| `useVAD` | Voice Activity Detection |
| `useWhisperStream` | Stream Whisper ASR |
| `useActiveListening` | Écoute active |
| `useTTS` | Text-to-Speech |
| `useTTSWithMicControl` | TTS avec contrôle micro |

### Memory (6 hooks)

| Hook | Rôle |
|------|------|
| `useMemory` | Hook mémoire principal |
| `useMemoryCore` | Noyau mémoire |
| `useMemoryEngine` | Moteur mémoire |
| `useLTMContext` | Contexte LTM |
| `usePersistentMemory` | Mémoire persistante |
| `useUnifiedMemory` | Mémoire unifiée |

### Engines (12 hooks)

| Hook | Rôle |
|------|------|
| `useEngineState` | État des moteurs |
| `useEngineSubscription` | Souscription aux moteurs |
| `useEngineVitals` | Métriques vitales |
| `useLivingEngines` | Moteurs actifs |
| `useFusionEngine` | Moteur de fusion |
| `useHybridEngine` | Moteur hybride |
| `useCognitive` | Interface cognitive |
| `useSingularity` | Interface singularité |
| `useSingularityState` | État singularité |
| `useSingularityStateSafe` | État singularité sécurisé |
| `useSingularityStore` | Store singularité |
| `useSingularitySync` | Sync singularité |

### Identity/Twin (5 hooks)

| Hook | Rôle |
|------|------|
| `useTwinBehavior` | Comportement jumeau |
| `useTwinEvolution` | Évolution jumeau |
| `useTwinIdentity` | Identité jumeau |
| `useIdentity` | Identité principale |
| `useIdentityMatrix` | Matrice identité |

### UI/Layout (11 hooks)

| Hook | Rôle |
|------|------|
| `useAdaptiveFPS` | FPS adaptatif |
| `useCognitiveLayout` | Layout cognitif |
| `useFocusTrap` | Piège de focus accessibilité |
| `useKeyboardShortcuts` | Raccourcis clavier |
| `useMediaQuery` | Media queries responsive |
| `usePanelState` | État des panneaux |
| `useResponsive` | Responsive design |
| `useParticles` | Système de particules |
| `useAuraOrchestrator` | Orchestrateur aura |
| `useAuraPerformanceMonitor` | Moniteur perf aura |

### Performance (4 hooks)

| Hook | Rôle |
|------|------|
| `useAdvancedPerformance` | Performance avancée |
| `usePerformanceMonitor` | Moniteur performance |
| `usePerformanceProfiler` | Profilage performance |
| `useAdaptiveFPS` | FPS adaptatif |

### System (8 hooks)

| Hook | Rôle |
|------|------|
| `useAppInitialization` | Initialisation app |
| `useBackendHealth` | Santé backend |
| `useConnection` | État connexion |
| `useDeviceHealth` | Santé appareil |
| `useDevicePermissions` | Permissions appareil |
| `useSystemHealth` | Santé système |
| `useSystemMonitor` | Moniteur système |

### Other (29 hooks)

| Hook | Rôle |
|------|------|
| `useAutoTimeout` | Timeout automatique |
| `useConversationEngine` | Moteur conversation |
| `useConversations` | Gestion conversations |
| `useDebounce` | Debounce générique |
| `useDeepPsyche` | Interface psyché profonde |
| `useEffects` | Effets visuels |
| `useExperience` | Gestion XP |
| `useExpression` | Expressions avatar |
| `useExpressionOrchestration` | Orchestration expressions |
| `useFileOperations` | Opérations fichiers |
| `useHoloPresence` | Présence holographique |
| `useLazyAvatar` | Avatar chargement différé |
| `useLiveDebugger` | Débogueur live |
| `useLocalStorage` | Stockage local |
| `useMCPOrchestrator` | Orchestrateur MCP |
| `useMultimodalPresence` | Présence multimodale |
| `useOmegaPipeline` | Pipeline Omega |
| `usePhaseSpace` | Espace de phase |
| `usePreferences` | Préférences utilisateur |
| `usePresenceOS` | OS de présence |
| `useProviderStatus` | Statut providers AI |
| `useRAG` | Retrieval Augmented Generation |
| `useSessions` | Gestion sessions |
| `useStoreSync` | Sync des stores |
| `useSystemCenterAutoFix` | Auto-fix system center |
| `useTimeAgenda` | Agenda temporel |
| `useTitaneCore` | Noyau TITANE |
| `useTitaneDb` | Base de données TITANE |
| `useTitaneSphere` | Sphère TITANE |
| `useToast` | Notifications toast |
| `useToolCaller` | Appel d'outils AI |
| `useTopNavigation` | Navigation top |
| `useUnifiedPresence` | Présence unifiée |
| `useUserPreferences` | Préférences utilisateur |
| `useVisualEngine` | Moteur visuel |
| `useVisualEngines` | Moteurs visuels |
| `useVisualState` | État visuel |
| `useVitals` | Métriques vitales |
| `useVocalDevConsole` | Console dev vocale |
| `useWindowControls` | Contrôles fenêtre |
| `useZoomControl` | Contrôle zoom (keyboard: Ctrl+/-/0) |
| `useZoom` (UIReadingEngine) | Zoom TopNav — boutons +/- (v30.1.8, `data-testid: topnav-zoom-in/out`) |

---

## E. Carte des Routes

> Routes définies dans `App.tsx` — toutes les routes sont lazy-loaded sauf exceptions

### Routes actives

| Path | Composant | Lazy |
|------|-----------|------|
| `/` | Redirect → `/titane` | — |
| `/titane` | TitanePage | ✓ |
| `/cognitive` | Redirect -> `/dev?tab=diagnostics` | ✓ |
| `/experience` | Experience | ✓ |
| `/time` | TimePage | ✓ |
| `/admin` | AdminPage | ✓ |
| `/system-center` | Redirect -> `/admin?tab=system` | ✓ |
| `/diagnostics` | Redirect -> `/admin?tab=production-health` | ✓ |
| `/devtools` | Redirect -> `/admin?tab=system&systemTab=devtools` | ✓ |
| `/cluster` | Redirect -> `/admin?tab=production-health` | ✓ |
| `/introspection` | Redirect -> `/admin?tab=system` | ✓ |
| `/hypervision` | Redirect -> `/admin?tab=system` | ✓ |
| `/configuration` | Redirect -> `/admin?tab=config` | ✓ |
| `/design-center` | Redirect -> `/admin?tab=design` | ✓ |
| `/design-system` | Redirect -> `/admin?tab=design` | ✓ |
| `/governance-center` | Redirect -> `/admin?tab=governance` | ✓ |
| `/governance` | Redirect -> `/admin?tab=governance` | ✓ |
| `/secure` | Redirect -> `/admin?tab=governance` | ✓ |
| `/audio-center` | Redirect -> `/admin?tab=audio` | ✓ |
| `/fusion` | FusionPage | ✓ |
| `/optimization` | OptimizationPage | ✓ |
| `/orchestration-intelligence` | OrchestrationIntelligenceCenter | ✓ |
| `/orchestration-center` | OrchestrationMetaCenter | ✓ |
| `/meta-center` | Redirect -> `/orchestration-center` | ✓ |
| `/multi-ai-dashboard` | Redirect -> `/orchestration-center` | ✓ |
| `/nexus-engine` | Redirect -> `/orchestration-center` | ✓ |
| `/harmonia-engine` | Redirect -> `/orchestration-center` | ✓ |
| `/cognitive-state` | Redirect -> `/orchestration-center` | ✓ |
| `/dev` | DevPage | ✓ |
| `/total-dev` | TotalDevPage | ✓ |
| `/command-center` | Redirect -> `/dev?tab=operations` | ✓ |
| `/qa-monitoring` | Redirect -> `/dev?tab=validation` | ✓ |
| `/monitoring` | Redirect -> `/dev?tab=diagnostics` | ✓ |
| `/developer-mode` | Redirect -> `/dev?tab=operations` | ✓ |
| `/dev-mode` | Redirect -> `/dev?tab=operations` | ✓ |
| `/devmode` | Redirect -> `/dev?tab=operations` | ✓ |
| `/orchestration` | Redirect -> `/orchestration-intelligence` | ✓ |
| `/reality-center` | RealityCenter | ✓ |
| `/hyper-center` | HyperCenter | ✓ |
| `/quantum-center` | QuantumCenter | ✓ |
| `/identity-center` | Redirect -> `/twins` | ✓ |
| `/memory-evolution` | Redirect -> `/titane?tab=transformation` | ✓ |
| `/memory-evo` | Redirect -> `/titane?tab=transformation` | ✓ |
| `/cloud` | CloudCenter | ✓ |
| `/knowledge` | KnowledgeFusionPage | ✓ |
| `/creation` | CreationStudio | — |
| `/evolution` | EvolutionMonitor | — |
| `/singularity` | SingularityMonitor | ✓ |
| `/sentinel` | Sentinel | — |
| `/watchdog` | Watchdog | — |
| `/selfheal` | SelfHeal | — |
| `/adaptive` | AdaptiveEngine | — |
| `/memory` | Memory | — |
| `/research` | ResearchPage | — |
| `/skills` | SkillManager | — |
| `/performance` | PerformanceTest | — |

### Redirects

| Source | Destination |
|--------|-------------|
| `/chat` | `/titane?tab=conversation` |
| `/camera` | `/titane` |
| `/evo` | `/titane` |
| `/dashboard` | `/titane` |
| `/evolution-center` | `/titane` |
| `/progression` | `/titane` |
| `/xp` | `/experience` |
| `/stats` | `/dev?tab=diagnostics` |
| `/temporal-center` | `/time` |
| `/agenda` | `/time` |
| `/time-navigator` | `/time` |
| `/settings` | `/admin?tab=config` |
| `/audio` | `/admin?tab=audio` |
| `/voice` | `/admin?tab=audio` |
| `/tts` | `/admin?tab=audio` |
| `/one-core` | `/dev?tab=overview` |
| `/unified` | `/dev?tab=overview` |
| `/qa` | `/dev?tab=validation` |
| `/tests` | `/dev?tab=validation` |
| `/ia-dev` | `/dev?tab=operations` |
| `/reality` | `/reality-center` |
| `/renderer` | `/reality-center` |
| `/hyper` | `/hyper-center` |
| `/intelligence` | `/hyper-center` |
| `/quantum` | `/quantum-center` |
| `/identity-center` | `/twins` |
| `/identity` | `/twins` |
| `/persona` | `/twins` |
| `/twins` | `/twins` |
| `/twin` | `/twins` |
| `/cloud-sync` | `/cloud` |
| `/vault` | `/cloud` |
| `/meta` | `/orchestration-center` |

---

## F. Carte des Services

| Service | Fichier | Rôle | Exports clés |
|---------|---------|------|--------------|
| IPC Canonical | `tauriCommands.ts` | Wrapper IPC officiel | `invokeTauriCommandCanonical`, `invokeTauriCommand` (deprecated) |
| Tauri Bridge | `tauriBridge.ts` | Bridge Tauri bas niveau | `TauriBridgeService` |
| Tauri Client | `tauriClient.ts` (3456L) | Client IPC complet | `TauriClientService` |
| Chat Engine | `ai/chatEngine.ts` (3356L) | Moteur chat AI | `ChatEngine`, `sendMessage`, `streamResponse` |
| AI Orchestrator | `ai/orchestrator.ts` (2133L) | Orchestrateur multi-AI | `AIOrchestrator`, `selectProvider` |
| RAG | `ragService.ts` | Recherche sémantique | `safeInvokeCanonical`, `ragSearch` |
| Evolution Engine | `evolutionEngine/` | Évolution continue | `EvolutionEngine`, `runEvolution` |
| Singularity Bridge | `singularityBridge.ts` | Pont singularité v1 | `SingularityBridge` |
| Singularity vΩ | `singularityBridgeVInfinity.ts` | Pont singularité vΩ | `SingularityBridgeVInfinity` |
| Conversation | `conversationEngine.ts` | Moteur conversation | `ConversationEngine` |
| Agenda | `agendaService.ts` | Agenda/timeline | `AgendaService` |
| Auto Audit | `autoAuditEngine.ts` | Audit automatisé | `AutoAuditEngine` |
| Web Research | `webResearchService.ts` | Recherche web | `WebResearchService` |
| User Prefs | `userPreferencesEngine.ts` | Préférences | `UserPreferencesEngine` |
| Experience | `experienceService.ts` | Gestion XP | `ExperienceService` |

---

## G. Carte du Backend Rust

### Structure des modules `src-tauri/src/`

#### Kernel
`main.rs` · `lib.rs` · `error.rs` · `error_handling.rs` · `bounded.rs` · `engine_trait.rs` · `state.rs` · `handlers.rs`

#### Cognitif
`cognitive/` · `cognitive_learning/` · `hyper_intelligence/` · `behavior_engine/` · `constitution/`

#### Mémoire
`memory/` · `memory_evolution/` · `neural_memory/` · `memory_os/` · `unified_memory_v2/` · `memory_compactor.rs` · `memory_persistence.rs`

#### Singularité & Jumeaux
`singularity/` · `singularity_fusion/` · `omega/` · `digital_twin_v14_1/` · `numeric_twin/`

#### Conversation
`conversation_engine/` · `conversation_os/` · `emotion/`

#### Audio / Voix
`audio/` · `tts/` · `wakeword/` · `duplex/`

#### Avatar
`avatar/`

#### AI / Modèles
`ai/` · `ai_chat/` · `multimodal/` · `gemini_provider_refactor.rs` · `ollama_provider_refactor.rs` · `local_provider_refactor.rs`

#### Évolution
`evolution/`

#### Identité
`identity/`

#### Sécurité
`security/` · `auth/` · `secure_engine.rs` · `secure_commands.rs`

#### Système
`system/` · `system_center/` · `monitoring/` · `cluster/` · `cloud/`

#### Moteurs
`engine/` · `engines/` · `engine_trait.rs` · `overdrive/` · `adaptive/` · `cycle_engine/` · `harmonic_os/` · `harmonia_engine.rs`

#### Meta
`meta/` · `meta_mode_engine/` · `meta_orchestrator/` · `modules/`

#### Agents
`agent_system/` · `agents/` · `multi_agents/`

#### Outils
`api/` · `api_hub/` · `services/` · `ia/` · `ipc/` · `ipc_batcher/`

#### Dev
`devtools/` · `hypervision/` · `introspection/` · `doc_engine/`

#### Config
`config/` · `app/` · `compat/` · `runtime_config.rs`

#### Data
`cache/` · `cache_multilevel.rs` · `knowledge/` · `knowledge_base_default.rs` · `batch/` · `commands/`

#### Autres
`fusion.rs` · `fusion_commands_week*.rs` · `streaming.rs` · `time/` · `temporal_engine/` · `agenda/`

---

## H. Métriques

| Métrique | Valeur |
|---------|--------|
| Fichiers TypeScript/TSX | 1 668 |
| Fichiers Rust (.rs) | 880 |
| Commandes IPC Tauri | 1 135 |
| Stores Zustand | 18 |
| Hooks custom | 96 |
| Pages React | 45+ |
| Composants (dossiers) | 30+ |
| UI Primitives | 8 |
| Modules Rust (dossiers) | 75+ |
| Lignes TypeScript/TSX total | 530 579 |
| Lignes Rust total | 294 556 |
| Plus gros fichier TS | `devSudoHandler.ts` (6 655L) |
| Plus gros fichier Rust | `main.rs` (2 857L) |

### Top 10 — Fichiers TypeScript les plus volumineux

| # | Fichier | Lignes |
|---|---------|--------|
| 1 | `devSudoHandler.ts` | 6 655 |
| 2 | `devSudoBuiltins.ts` | 4 718 |
| 3 | `tauriClient.ts` | 3 456 |
| 4 | `chatEngine.ts` | 3 356 |
| 5 | `useChat.ts` | 2 407 |
| 6 | `ConversationSection.tsx` | 2 323 |
| 7 | `e2e-automated-validation.test.tsx` | 2 205 |
| 8 | `orchestrator.ts` | 2 133 |
| 9 | `security.ts` | 2 124 |
| 10 | `Chat.tsx` (ui/pages) | 1 938 |

### Top 10 — Fichiers Rust les plus volumineux

| # | Fichier | Lignes |
|---|---------|--------|
| 1 | `main.rs` | 2 857 |
| 2 | `chat_orchestrator.rs` | 2 322 |
| 3 | `conversation_engine/commands.rs` | 2 273 |
| 4 | `audio/commands.rs` | 2 157 |
| 5 | `commands/web_research.rs` | 1 971 |
| 6 | `commands/persistent_memory.rs` | 1 562 |
| 7 | `adaptive/adaptive_engine.rs` | 1 488 |
| 8 | `conversation_engine/french_mastery.rs` | 1 434 |
| 9 | `mock_commands.rs` | 1 390 |
| 10 | `memory/pool.rs` | 1 334 |

---

## I. Base de Connaissance Self-Awareness (Mémoire Cognitive)

Cette cartographie est injectée dans la **mémoire cognitive de TITANE** pour qu'il soit conscient de sa propre architecture.

### Fichiers de connaissance (`src/knowledge/self-awareness/`)

| Fichier | Description |
|---------|-------------|
| `architecture-map.json` | Carte structurée complète : rings, IPC, stores, hooks, routes, métriques |
| `capabilities-manifest.json` | Inventaire complet des capacités (chat, voice, cognitive, memory, etc.) |
| `index.ts` | Module TypeScript d'accès à la self-awareness knowledge base |

### Hook React (`src/hooks/useSelfAwareness.ts`)

```typescript
import { useSelfAwareness } from '@/hooks/useSelfAwareness';

function MyComponent() {
  const {
    metrics,           // { total_ts_files, total_rust_files, total_ipc_commands, ... }
    allCapabilities,   // ['ai_chat', 'voice', 'cognitive', 'memory', ...]
    commandCount,      // 916
    stores,            // ['effectsStore', 'evolutionStore', ...]
    hooks,             // ['useAIChatStreaming', 'useChat', ...]
    routes,            // ['/', '/titane', '/memory', ...]
    hasCapability,     // (name: string) => boolean
    getCommandsByDomain, // (domain: string) => string[]
  } = useSelfAwareness();
}
```

### Capacités Connues

| Capacité | Description | Fonctionnalités |
|----------|-------------|-----------------|
| `ai_chat` | Chat IA multi-providers | streaming, suggestions, context-memory |
| `voice` | Voix TTS/STT/VAD/wake-word | tts, stt, vad, wake-word, duplex, lip-sync |
| `cognitive` | Moteur cognitif + évolution | knowledge-vault, evolution-cycles, progression-xp |
| `visual` | Avatar 3D + effets | avatar-3d, lip-sync, expressions, gestures |
| `memory` | Mémoire persistante | snapshots, timeline, knowledge-base, vector-search |
| `singularity` | État unifié 4 couches | 4-layer-state, self-healing, integrity-check, diff |
| `security` | Sécurité end-to-end | aes-gcm, ed25519, argon2, permission-audit |
| `creation` | Studio de création | text, code, image, audio, templates |
| `monitoring` | QA + watchdog + self-heal | test-suites, alerts, performance-reports, auto-fix |
| `evolution` | Auto-amélioration continue | evolution-cycles, xp-accumulation, adaptive-learning |
| `time` | Intelligence temporelle | agenda, calendar, temporal-search |
| `identity` | Identité + twin cognitif | twin-identity, twin-evolution, cognitive-profile |

## [2026-04-16] DevPage route-shell truth

- La route `/dev` expose maintenant le marqueur canonique `page-dev` dès les états `loading` et `error`, avec `data-dev-state=loading|error|ready`.
- Cette vérité de surface retire une dépendance implicite entre présence de page et fin de préchargements secondaires QA/ONE_CORE, ce qui stabilise la qualification desktop WRY sans masquer les erreurs visibles.

## [2026-04-16] Conversation fullscreen shell truth

- La surface conversation fullscreen réutilise désormais une hauteur héritée parent-bound sur `titane-page--conversation` (`flex: 1 1 auto`, `min-height: 0`, `max-height: 100%`) au lieu de conserver une contrainte verticale qui pousse artificiellement le compositeur hors viewport.
- `AppShell` ne doit appliquer qu'une seule compensation TopNav via `paddingTop: calc(4rem + env(safe-area-inset-top, 0px))`; la classe `pt-16` y est incompatible avec la vérité fullscreen.
- Le helper desktop WDIO borne maintenant l'overflow synthétique au budget réel entre toolbar et compositeur pour éviter un faux échec de viewport avant même d'évaluer la surface runtime réelle.
