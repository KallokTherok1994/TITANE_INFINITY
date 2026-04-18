> 2026-04-18 — Knowledge base runtime snapshot truth: la chaîne canonique `src/services/api/defaultKnowledgeBase.ts -> invokeWithRetry('knowledge_base_runtime_snapshot') -> src-tauri/src/knowledge_base_default.rs` tente maintenant une lecture gouvernée de `/data/knowledge_base/default` au runtime avant de retomber sur la KB embarquée. Le contrat reste One Door et `{ ok, content, error }`, la sélection exclut toujours les fichiers privés Kevin, et le fallback frontend bundle ne s active qu après échec des deux voies IPC canoniques.

> 2026-04-18 — Conversation canonical discernment alignment: la surface conversation standard src/services/conversationEngine.ts ne choisit plus seulement son provider et son profil via un stub local. Elle consomme maintenant src/services/ai/canonicalDiscernmentKernel.ts avec memoryIntegration, la sante providers de aiOrchestrator et la coherence SingularityBridge, puis transmet cette decision canonique dans conversation_generate, omega_trace_meta et les marqueurs runtime du chat. Le chemin standard se rapproche ainsi de l autorite deja appliquee par src/services/ai/chatEngine.ts, tout en conservant le contrat IPC unique conversation_generate.

> 2026-04-18 — Conversation metadata continuity alignment: src-tauri/src/conversation_engine/commands.rs et src/services/conversationEngine.ts partagent maintenant la même vérité de metadata conversation pour provider_used et citations. Le backend sérialise explicitement ces champs dans metadata, la couche frontend sait encore retomber honnêtement sur meta.provider_used et trace.citations pendant une phase transitoire, et src/hooks/useConversationEngine.ts les persiste ensuite sur la surface UI active sans reformulation silencieuse.

> 2026-04-18 — Window zoom finite-value truth: `src-tauri/src/commands/window_controls_commands.rs` traite maintenant `window_set_zoom` comme une surface n acceptant que des niveaux de zoom finis. Les valeurs `NaN` ou infinies sont rabattues sur `1.0` avant stockage et emission de l evenement `zoom-change`, ce qui garde la voie CSS frontend sur une echelle canonique et exploitable.

> 2026-04-18 — Memory telemetry env-lock truth: `src-tauri/src/memory/telemetry.rs` traite maintenant le mutex de test `ENV_LOCK` comme une barriere de serialisation recuperable et non comme une source de cascade d echecs. Les tests qui partagent l environnement recuperent desormais le guard meme si un test precedent a empoisonne le mutex, ce qui garde la lane telemetry focalisee sur le vrai echec initial.

> 2026-04-18 — Telemetry CSV timestamp truth: `src-tauri/src/api/telemetry_api.rs` traite maintenant `parse_csv_line` comme une surface de donnees qui exige un timestamp non vide, et non comme un parseur permissif de colonnes minimales. Les lignes CSV avec colonne `timestamp` vide ou blanche sont rejetees avant toute construction de `ProductionHealthSample`, ce qui garde `parse_and_summarize` aligne sur une verite de telemetry horodatee.

> 2026-04-18 — Unified memory tier list-order truth: `src-tauri/src/unified_memory_v2/persistence.rs` traite maintenant `MemoryPersistence::list_tier` comme une surface backend deterministe et non comme un simple reflet de l ordre natif de `read_dir`. Les ids `.json` retournes sont tries avant reponse, ce qui garde `load_tier` et `clear_tier` alignes sur le contenu logique du tier plutot que sur l ordre variable du filesystem.

> 2026-04-18 — IO service list-order truth: `src-tauri/src/services/io_service.rs` traite maintenant `IoService::list_dir` comme une surface backend deterministe et non comme un simple reflet de l ordre natif de `read_dir`. Les chemins retournes sont tries avant reponse, ce qui garde les consommateurs runtime alignes sur le contenu logique du repertoire plutot que sur l ordre variable du filesystem.

> 2026-04-18 — Sandbox list-order truth: `src-tauri/src/security/sandbox.rs` traite maintenant `FileImportSandbox::list_files` comme une surface runtime deterministe, et non comme un simple reflet de l ordre natif de `read_dir`. Les noms de fichiers sandbox sont tries lexicographiquement avant reponse, ce qui garde `secure_list_files` stable pour un meme contenu de repertoire et borne les deltas UI/tests a de vraies mutations de fichiers.

> 2026-04-18 — Sandbox list-empty truth: `src-tauri/src/security/sandbox.rs` traite maintenant l absence de repertoire sandbox comme un etat vide legitime pour `FileImportSandbox::list_files`, et non comme une erreur d I/O. `secure_list_files` peut donc interroger la sandbox avant le premier import sans dependre d une initialisation prealable implicite.

> 2026-04-18 — Sandbox import-parent truth: `src-tauri/src/security/sandbox.rs` traite maintenant l ecriture de `FileImportSandbox::import_file` comme responsable de l existence du dossier cible. L import runtime cree le parent avant `fs::write`, ce qui garde `secure_import_file` operable meme quand l appelant n a pas prechauffe la sandbox.

> 2026-04-18 — Audit custom-event truth: `src-tauri/src/security/audit.rs` traite maintenant `AuditEventType::Custom` comme un libelle gouverne et non comme une chaine libre. Le constructeur nettoie les caracteres de controle, borne le libelle a 128 caracteres et rabat le resultat vide sur `custom`, ce qui aligne `security::commands::log_audit_event` et les autres producteurs runtime d audit sur des types d evenement JSON canoniques.

> 2026-04-18 — Path whitespace truth: `src-tauri/src/security/validation.rs` traite maintenant `PayloadValidator::validate_path` comme une garde de chemin non vide aussi apres trim, et non comme une simple chaine non nulle. Les chemins purement blancs sont refuses avant tout controle scheme/traversal/absolu, ce qui garde `secure_commands` et `security::sandbox` sur une verite de nom de chemin canonique.

> 2026-04-18 — Message control-character truth: `src-tauri/src/security/validation.rs` traite maintenant `InputValidator::validate_message` comme une garde d entree alignee sur `PayloadValidator::validate_string`. Les messages utilisateur/runtime contenant des caracteres de controle interdits sont refuses avant les controles de longueur et de patterns, ce qui garde `commands/chat` et `SecurityManager` sur une verite unique d entree texte.

> 2026-04-18 — Audit logger parent-directory truth: `src-tauri/src/security/audit.rs` traite maintenant la cible de journal d audit comme une sortie persistante qui doit garantir l existence de sa racine avant append. `AuditLogger::log` cree desormais le dossier parent si necessaire, ce qui preserve la preuve runtime produite par `security::commands`, `main`, `ai/ollama` et `overdrive` au lieu d echouer quand la racine de logs n existe pas encore.

> 2026-04-18 — Governance Ollama authority truth: la commande canonique `ai_check_ollama_status` reste l unique porte IPC pour l état Ollama consommé par la gouvernance UI. `src-tauri/src/ai/ollama.rs` résout désormais l URL et le modèle effectifs depuis `runtime_config` (persisté > env > défaut), classe l endpoint en `local_loopback` ou `remote_cloudflare/custom_remote`, et publie cette vérité enrichie jusqu à `src/features/governance-center/hooks/useGovernance.ts` sans nouvelle surface réseau frontend.

> 2026-04-18 — Ollama runtime propagation truth: `src/hooks/useBackendHealth.ts` et `src/pages/ConfigurationHub.tsx` consomment maintenant la même porte IPC `ai_check_ollama_status` pour afficher le statut Ollama hors Governance. La santé backend garde un fallback local provider-only quand Tauri n est pas disponible, mais la classification `endpointKind/endpointSource/networkUsed/health` reste dérivée de la vérité backend dès que cette voie existe.

> 2026-04-18 — Ollama transport health truth: `src/services/ai/transports/ollamaTransport.ts` ne déduit plus la santé d un simple `ping_ollama` suivi d une liste de modèles statique. La couche transport interroge désormais `ai_check_ollama_status` pour récupérer la disponibilité réelle et l inventaire runtime des modèles, ce qui réaligne la chaîne transport -> provider sur la même vérité backend que les surfaces Governance, health et configuration.

> 2026-04-18 — Conversation model truth propagation: la chaîne frontend `conversationEngine -> useConversationEngine -> ConversationSection` relaie maintenant aussi `model_requested`, `model_used` et `fallback_used` issus des métadonnées runtime au lieu de s arrêter à `provider_used`. La surface conversation active peut donc afficher le modèle demandé, le modèle effectivement exécuté et l activation éventuelle d un fallback sans créer un second contrat parallèle à l IPC.

> 2026-04-18 — Audit user-id canonicalization truth: `src-tauri/src/security/audit.rs` traite maintenant `AuditEvent.user_id` comme un identifiant de journal structure gouverne et non comme une chaine libre. `AuditEvent::new` supprime les caracteres de controle, tronque a 128 caracteres et rabat sur `anonymous` quand rien de journalisable ne subsiste, ce qui borne les journaux runtime produits par `security::commands`, `main`, `ai/ollama` et `overdrive` a des identifiants JSON canoniques.

> 2026-04-18 — HTML sanitization escape-order truth: `src-tauri/src/security/validation.rs` encode maintenant `&` avant les autres caracteres HTML sensibles dans `sanitize_html`, ce qui evite de retransformer `&lt;script&gt;` en `&amp;lt;script&amp;gt;` et garde la surface runtime `src-tauri/src/secure_commands.rs` alignee sur une sanitation XSS idempotente.

> 2026-04-18 — Shell guard long-flag truth: `src-tauri/src/security/shell_guard.rs` ne traite plus tout argument commencant par `--` comme un simple flag exempt de controle traversal. Les noms de flags longs restent autorises seulement s ils sont composes de caracteres ASCII alphanumeriques ou `-`, tandis que des formes avec valeur integree comme `--output=../../etc/passwd` sont rejetees avant toute execution shell.

> 2026-04-18 — Storage filename sanitization truth: `src-tauri/src/security/storage_guard.rs` traite maintenant `sanitize_filename` comme une derivee de nom de fichier non cache et non vide. Les points de tete/queue sont retires apres filtrage, et un fallback deterministe `file_<checksum>` est genere si aucun caractere autorise ne subsiste, ce qui empeche les cibles ambiguës comme `.json` pour des cles entierement invalides.

> 2026-04-18 — Secure secrets key truth: `src-tauri/src/security/secrets_engine.rs` traite maintenant la cle de secret comme une entree canonique du coffre chiffre et non comme un identifiant libre. `set_secret`, `get_secret`, `has_secret` et `clear_secret` refusent desormais les cles vides, avec espaces, caracteres de controle, caracteres hors `[A-Za-z0-9_-]` ou > 128 caracteres avant toute mutation ou lecture du store chiffre.

> 2026-04-18 — Rate limiter user-id truth: `src-tauri/src/security/rate_limit.rs` traite maintenant le `user_id` comme une cle de memoire gouvernee et non comme une chaine libre. `check`, `get_stats` et `reset` refusent desormais les identifiants vides ou blancs, les caracteres de controle et les charges > 128 caracteres avant toute insertion/suppression/lecture dans la table de requetes, ce qui borne la croissance memoire du limiter a des cles canoniques.

> 2026-04-18 — PayloadValidator path-scheme truth: `src-tauri/src/security/validation.rs` traite maintenant `validate_path` comme une garde locale de chemin relatif plat, en refusant explicitement les entrees de type scheme `://` en plus du traversal et des chemins absolus. `validate_file_extension` se realigne sur cette meme verite de chemin avant de verifier l extension, ce qui empeche d accepter `../secret.txt` ou `file:///tmp/test.txt` sur la seule base de `.txt`.

> 2026-04-18 — Permission audit field truth: `src-tauri/src/security/permission_guard.rs` traite maintenant `action` et `source` comme des champs d audit exportables et non comme des chaines arbitraires de confiance. La surface retire les bytes de controle non visibles avant journalisation et borne chaque champ a 256 caracteres, ce qui preserve l export JSON et bloque le log poisoning sans changer la decision de permission elle-meme.

> 2026-04-18 — Storage guard relative-path truth: `src-tauri/src/security/storage_guard.rs` borne maintenant `validate_and_resolve` a des chemins relatifs seulement. Les entrees de type scheme `://` et tous les chemins absolus/rooted sont refusees avant toute resolution, ce qui aligne l implementation sur le contrat annonce par l API et ses services de persistance JSON.

> 2026-04-18 — Config import file truth: `src-tauri/src/config/io.rs` traite maintenant `import_config` comme une lecture locale de fichier JSON de configuration, et non comme une ouverture arbitraire de chemin texte. La surface refuse desormais les chemins vides, NUL, schemes `://`, segments `..`, symlinks, non-fichiers, extensions non `.json` et charges > 1 MiB avant toute lecture puis parse du snapshot importe.

> 2026-04-18 — Piper voice id path truth: `src-tauri/src/audio/commands.rs` et `src-tauri/src/tts/local_tts.rs` qualifient maintenant localement les `voice_id` / `request.voice` avant toute reconstruction de `~/.local/share/piper/voices/{voice}.onnx`. La surface refuse les identifiants vides, les composants de chemin (`/`, `\\`, `..`) et les caracteres hors `[A-Za-z0-9_-]`, ce qui borne la resolution de modele Piper a un nom canonique plat.

> 2026-04-18 — Telemetry CSV source truth: `src-tauri/src/api/telemetry_api.rs` traite maintenant `read_production_week1_csv` comme une lecture locale de fichier de preuve et non comme une confiance aveugle dans un chemin fixe de `temp_dir()`. La surface qualifie d abord la cible via `symlink_metadata`, refuse les symlinks, les non-fichiers et les charges > 10 MiB, puis seulement relit et parse le CSV attendu.

> 2026-04-18 — Secure engine secret-file permission truth: `src-tauri/src/secure_engine.rs` traite maintenant `write_secret_file` comme une surface d ecriture de secrets locale qui doit fixer explicitement les permissions du fichier final. Sur Unix, la charge chiffree est ecrite puis requalifiee en `0600`, ce qui aligne la persistance secrete sur une verite proprietaire-seul au lieu de laisser le mode final dependre uniquement de l umask du processus.

> 2026-04-18 — File import sandbox flat-name truth: `src-tauri/src/security/sandbox.rs` traite maintenant les `safe_name` de lecture/suppression comme de simples noms de fichiers plats emis par l import, et non comme des chemins relatifs generiques. La surface refuse desormais tout nom contenant des separateurs ou des composants autres qu un basename unique avant de joindre `sandbox_path`.

> 2026-04-18 — StorageGuard ancestor containment truth: `src-tauri/src/security/storage_guard.rs` ne fait plus confiance au seul parent immediat quand une cible n existe pas encore. La garde remonte maintenant jusqu au plus proche ancetre existant, le canonicalise, puis refuse toute ecriture/lecture/suppression si cet ancetre sort de `data_root`, ce qui bloque les echappements via repertoire symlinké suivi de sous-dossiers inexistants.

> 2026-04-17 — Persistence backup import truth: `src-tauri/src/persistence/backup.rs` ne rejoint plus aveuglement `data_dir` avec un `file_name` relu depuis le payload d archive. L import borne maintenant la restauration aux deux surfaces persistence canoniques `titan_events.db.events.json` et `titan_events.db.snapshots.json`, rejette les noms vides, NUL, absolus, traversants ou contenant des separateurs, puis couvre la regression par des tests Rust de rejet traversal et d import nominal.

> 2026-04-17 — Update migration path truth: `src-tauri/src/updates/update_engine.rs` valide maintenant localement `migration_id` avant de reconstruire `migrations/{id}.json` sous `update_dir`. Les ids vides, absolus, traversants ou contenant des separateurs sont rejetes avant toute lecture disque dans `run_migration`.

> 2026-04-17 — Neural LTM path truth: `src-tauri/src/neural_memory/ltm.rs` valide maintenant localement `entry.id` avant toute ecriture de `entries/{id}.json`, puis revalide `metadata.file_path` relu de l index avant `load` et `remove`. La surface refuse les ids et chemins vides, absolus, traversants, contenant des separateurs ou differents du nom attendu `{id}.json`.

> 2026-04-17 — Memory OS LTM metadata path truth: `src-tauri/src/memory_os/ltm.rs` ne fait plus confiance au `metadata.file_path` relu depuis `ltm_index.json`. Les operations `load`, `delete` et `remove` verifient maintenant que le chemin est un simple nom de fichier attendu `uuid.json`, sans racine ni traversal, avant toute E/S sous `entries/`.

> 2026-04-17 — Unified memory persistence path truth: `src-tauri/src/unified_memory_v2/persistence.rs` valide maintenant les `id` et `tier` avant de reconstruire `data_dir/{tier}/{id}.json`. Les appels `load`, `delete`, `list_tier`, `load_tier` et `clear_tier` rejettent les ids contenant des composants de chemin et les tiers hors du triplet canonique `stm|mtm|ltm`.

> 2026-04-17 — Vault file id truth: `src-tauri/src/security/vault_engine.rs` valide maintenant explicitement les `file_id` avant de reconstruire `vault/encrypted/{file_id}.enc` et son checksum associe. Les operations `save`, `load`, `delete` et `verify_file_integrity` rejettent les ids vides, absolus, traversants ou contenant des separateurs pour maintenir toute E/S dans la racine du vault.

> 2026-04-17 — Time-travel snapshot id truth: `src-tauri/src/time/travel_engine.rs` valide maintenant explicitement les `snapshot id` fournis a `restore_snapshot`, `load_snapshot` et `delete_snapshot` avant de reconstruire `vault/snapshots/{id}.snapshot`. Les ids vides, absolus, traversants ou contenant des separateurs sont rejetes localement pour maintenir l acces disque dans la racine canonique du moteur.

> 2026-04-17 — Config presets path truth: `src-tauri/src/config/presets.rs` factorise maintenant `validate_preset_name()` et l applique a `save_config_preset`, `load_config_preset` et `delete_config_preset`. Les trois commandes partagent ainsi la meme garde contre les noms vides ou contenant des separateurs de chemin, ce qui supprime l asymetrie precedente entre sauvegarde et relecture/suppression.

> 2026-04-17 — Backend self-test memory truth: `src-tauri/src/backend_selftest.rs` ne sonde plus la sante memoire en creant ou verifiant un dossier `memory` dans le cwd. Le self-test utilise maintenant un `MemoryStorage` ephemere sous `temp_dir`, verifie un vrai round-trip conversationnel, puis supprime explicitement la racine de probe pour garantir zero effet de bord workspace.

> 2026-04-17 — MemoryStorage path truth: `src-tauri/src/memory/storage.rs` valide maintenant explicitement les `conversation_id` avant de construire le chemin persistant `.json.enc`. Les ids vides, absolus, rootes, contenant `..`, `/`, `\` ou un byte nul sont rejetes en `ValidationError`, ce qui supprime les ecritures/lectures/suppressions hors `storage_dir` sans changer le format de stockage ni le modele conversationnel.

> 2026-04-17 — StorageService listing truth: `src-tauri/src/services/storage_service.rs` ne demande plus a `StorageGuard` de lister un chemin vide invalide. La surface liste maintenant explicitement la racine de stockage via `.` pour rester compatible avec la garde securisee, et les tests qualifient a la fois le round-trip JSON et l enumeration des seules cles `.json`.

> 2026-04-17 — CacheService sandbox truth: `src-tauri/src/services/cache_service.rs` ne valide plus sa voie fallback sandbox par simple prefixe textuel. Quand la cible n existe pas encore, le service remonte maintenant jusqu au plus proche ancetre existant, le canonicalise, rejette les segments `..`, puis reconstruit la cible seulement si cet ancetre reste strictement dans la sandbox de recherche canonique.

> 2026-04-17 — IOService base-path truth: `src-tauri/src/services/io_service.rs` ne resolve plus les chemins relatifs contre le cwd du processus. Le service ancre maintenant toute lecture/ecriture/suppression/listing sur `base_path` canonique, rejette les segments `..` et les chemins absolus hors racine autorisee, et permet l ecriture de nouvelles cibles internes en reconstruisant leur chemin a partir du plus proche ancetre existant dans la racine gouvernee.

> 2026-04-18 — Knowledge parser local document truth: `src-tauri/src/knowledge/parser.rs` traite maintenant `parse_document` et `detect_file_format` comme des surfaces d ingestion de documents locaux reels, et non comme un parseur de chemins textuels bruts. Les commandes refusent desormais les chemins vides, NUL, schemes `://`, segments `..`, repertoires, cibles non-fichier, fichiers absents et fichiers sensibles (`.env`, `.pem`, `.key`, certificats, coffres), puis operent sur le chemin canonique du document valide.

> 2026-04-18 — ShellGuard canonical command truth: `src-tauri/src/security/shell_guard.rs` n accepte plus une commande path-like dont seul le basename est whitelisté. La garde refuse maintenant les chemins de binaire (`/tmp/espeak`, `./whisper`) et execute uniquement le nom whitelisté validé, afin d eviter qu un chemin arbitraire ne contourne la politique shell via un basename autorisé.

> 2026-04-18 — Developer Mode patch validation truth: `src-tauri/src/engines/developer_mode.rs` traite maintenant `dev_mode_validate_patch` comme une validation locale bornee au workspace canonique et non comme un simple filtre textuel sur `patch.file`. La commande refuse desormais les chemins vides, NUL, schemes `://`, segments `..` et chemins absolus hors workspace, puis evalue l extension autorisee sur la cible resolue.

> 2026-04-18 — TOTAL_DEV file read truth: `src-tauri/src/commands/total_dev_commands.rs` traite maintenant `total_dev_read_file` comme une lecture locale workspace-only avec resolution canonique partagee, et non comme une canonicalisation brute du chemin fourni. La commande refuse desormais les chemins vides, NUL, schemes `://`, segments `..`, chemins absolus hors workspace et extensions sensibles canonisees, tout en renvoyant encore un resultat structure pour les fichiers absents a l interieur du repo.

> 2026-04-18 — Hybrid patch surface truth: `src-tauri/src/commands/hybrid.rs` traite maintenant `dev_apply_patch` comme une ecriture locale gouvernee sur fichiers existants du workspace canonique et non comme un patch arbitraire sur le filesystem. La commande refuse desormais les chemins vides, NUL, schemes `://`, segments `..`, chemins absolus hors workspace et cibles non fichier, tout en conservant sa semantique de remplacement borne par lignes.

> 2026-04-18 — Stub filesystem bridge truth: `src-tauri/src/commands/stub_commands.rs` traite maintenant `fs_exists` et `read_json_file` comme des lectures workspace-only et non comme un pont filesystem arbitraire. Les deux commandes refusent les chemins vides, NUL, schemes `://`, segments `..` et chemins absolus hors workspace; `read_json_file` exige en plus un vrai fichier `.json` et rejette les charges > 2 MiB. La voie frontend gouvernee est realignee via `src/lib/security.ts` et `allowed_commands.json`.

> 2026-04-18 — Hybrid file inspection workspace-bound truth: `src-tauri/src/commands/hybrid.rs` traite maintenant `dev_inspect_file` comme une surface d inspection locale bornee au workspace canonique et non comme une lecture de fichier arbitraire. La commande refuse les chemins vides, NUL, schemes `://`, segments `..` et chemins absolus hors workspace, tout en conservant la semantique dev utile pour les fichiers existants ou absents a l interieur du repo.

> 2026-04-16 — GitHub Copilot rate-limit resilience: `src-tauri/src/api_hub/copilot.rs` applique désormais un retry borné et gouverné (`Retry-After` + backoff exponentiel plafonné) avant d’échouer, pour classer durablement les 429 GitHub comme blocage temporaire et non comme erreur logique du code.
> 2026-04-15 — Chat runtime: les budgets par défaut de `ChatRequestDefaults` et du profil frontend ont été relevés jusqu’au plafond backend utile (`32768`) pour éviter les sorties tronquées par défaut, tout en conservant la borne IPC/Rust comme garde-fou structurel.
> 2026-04-16 — Discipline anti-dérive issue de l’audit v30.1.x: toute évolution frontend/backend doit désormais être qualifiée contre six risques récurrents observés sur la série 30.1.0+ — désynchronisation artefacts/launchers, manque de couverture E2E sur flows secondaires, drift frontend/backend entre UI, IPC et runtime packagé, scripts post-build bloqués par privilèges interactifs, contamination d’environnement backend, et traçabilité incomplète des corrections. Ces six points doivent être traités comme des invariants d’architecture opérationnelle, pas comme de la documentation optionnelle.
> 2026-04-16 — Agents avancés qualification truth: les dashboards avancés ne doivent plus faire croire à un runtime complet lorsqu il n existe pas encore. La vérité canonique passe désormais par `src/services/agents/advancedAgentCatalog.ts`, qui publie un statut gouverné (`planned|partial|qualified`), des preuves visibles, des blockers et une prochaine action; les surfaces UI service et leurs alias `src/components/*Dashboard.tsx` doivent rester alignés sur cette source unique.
> 2026-04-16 — Agents avancés runtime surface truth: `src/components/layout/AppShell.tsx` monte désormais `AgentDashboardsPanel` sur la surface applicative canonique, ce qui fait de la présence runtime de `agent-dashboards-panel` et de ses cinq dashboards un invariant observable de la lane Playwright, pas un simple détail d export.
> 2026-04-17 — Ollama/Cline alignment truth: la pile locale gouvernée est désormais réalignée sur `http://127.0.0.1:11434` et `gemma2:2b` du frontend au backend, en passant par les scripts, les preuves E2E Windows, le registre champion/challenger et les safeguards Cline. Les actions critiques de build/deploy peuvent rester soumises à une demande explicite, mais aucun token/passphrase local ne doit contredire la doctrine Rule 11.
> 2026-04-18 — Ollama fallback and Cline safeguard truth: les surfaces actives `src/main.tsx`, `src/pages/ConfigurationHub.tsx` et `src-tauri/src/config/update.rs` publient maintenant le meme fallback Ollama canonique (`http://127.0.0.1:11434`, `gemma2:2b`) afin d'eviter toute divergence frontend/backend quand la runtime config est partielle. Cote Cline, les hooks rappellent la regle « demande explicite utilisateur » pour build/deploy sans aucun token gate local, et le validateur d'alignement couvre maintenant ces hooks ainsi que les fallbacks UI/Rust actifs.
> 2026-04-17 — Advanced agents runtime signal truth: les services `src/services/monitoring/`, `src/services/diagnostic/`, `src/services/explainability/`, `src/services/orchestrator/` et `src/services/security_active/` enrichissent maintenant leur statut gouverné avec les signaux runtime/configuration déjà présents dans le repo, au lieu d afficher uniquement des stubs de qualification.
> 2026-04-17 — Security audit bridge truth: `src-tauri/src/security_audit_bridge.rs` ajoute deux commandes IPC gouvernées, `security_audit_sync_journal` et `security_audit_publish_signed_export`, pour persister un journal sécurité fédéré et publier un export signé dans `app_data_dir()/security_active`. Cette extension reste Tauri-only, n’ouvre aucun chemin réseau direct et conserve le contrat IPC `{ ok, content, error }` via `IpcResponse`.
> 2026-04-17 — Security audit bridge desktop runtime truth: le bridge sécurité est désormais exposé par le runtime desktop par défaut du workspace, y compris quand le binaire courant reste en mode `mock`, afin que la voie canonique Tauri puisse persister le journal fédéré et publier l export signé en AppData sans dépendre de la lane `full` actuellement cassée ailleurs. La preuve native WDIO est maintenant PASS sur `src-tauri/target/debug/titane-infinity` et sur `/usr/bin/titane-infinity` après rebuild 30.1.34, avec AppData commun qualifié et binaire installé strictement aligné sur le hash du binaire release local.

> 2026-04-17 — Frontend circular dependency gate truth: le corridor HMR critique dispose maintenant d un gate structurel canonique `verify:frontend-circular-deps`, implemente par `scripts/verify/verify_frontend_circular_deps.sh` et branche a la CI unifiee. Ce gate borne volontairement le scan aux zones `src/hooks`, `src/contexts`, `src/utils`, `src/config` et `src/types`, avec exclusion du passif hors lot, afin de verrouiller la regression qui a deja provoque le loop HMR sans pretendre solder d un coup tous les cycles historiques des services.

> 2026-04-17 — TOTAL_DEV governed console truth: `src-tauri/src/commands/total_dev_commands.rs` ne traite plus `total_dev_run_command` comme une console a prefixes ouverts. La surface reste verrouillee par session unlock, mais n accepte maintenant que des commandes exactes de la allowlist gouvernee, refuse les operateurs shell et renvoie les lectures de fichiers vers `total_dev_read_file` au lieu de laisser `cat src*` servir de bypass implicite.

> 2026-04-17 — TOTAL_DEV governed git truth: `src-tauri/src/commands/total_dev_commands.rs` traite maintenant `total_dev_git_op` comme une surface d inspection locale read-only et non plus comme un mini shell git a ecriture directe. Les operations mutantes (`add`, `commit`, `push`, `restore`, `stash`, `fetch`) sont retirees de la allowlist backend, les arguments restants sont qualifies exactement par operation, et `src/pages/TotalDevPage.tsx` expose cette restriction directement dans le panneau Git.

## Agent Anti-Régression

L’agent anti-régression qualifie l’état visible du self-healing, consolide les signaux runtime, performance, UI et configuration, puis oriente les contrôles à exécuter avant toute fermeture de phase. Il s’intègre au dashboard anti-régression UI canonique (Ring 3/4) monté dans l’Admin et au service `selfHealingService` (Ring 3), qui délègue ensuite au moteur self-healing existant.

- **Rôle** : Qualification anti-régression, classification des signaux, pilotage des contrôles, verrouillage de la surface canonique.
- **Flux** : Admin UI → SelfHealingDashboard → selfHealingService → SelfHealing IO Adapter → moteur self-healing.
- **Gates** : Sélecteurs stables, tests unitaires façade, E2E dédié, mappings UI/cartographie, intégration AutoHeal.

## Agent de Sécurité Active

L’agent de sécurité active détecte les anomalies réseau, effectue du sandboxing, orchestre la réponse automatisée aux menaces et supervise les autres agents pour garantir la résilience. Il s’intègre à un dashboard sécurité UI (Ring 3/4) et au moteur de sécurité active (Ring 2), avec accès direct au kernel (Ring 0) pour la gestion des alertes critiques.

- **Rôle** : Détection d’intrusion, sandboxing, réponse automatisée, supervision croisée.
- **Flux** : Sécurité Dashboard UI → Security Active Engine → Kernel Rust (gestion) → Alertes/Logs.
- **Gates** : Détection d’intrusion, logs de sécurité, tests E2E de résilience, intégration autoheal.

---

## Orchestrateur Dynamique Agent

L’agent orchestrateur dynamique répartit intelligemment les tâches entre les agents TITANE, adapte la charge en temps réel, gère les priorités et optimise l’utilisation des ressources. Il s’intègre à un dashboard UI (Ring 3/4) et au moteur d’orchestration (Ring 2), avec accès direct au kernel (Ring 0) pour la gestion des ressources critiques.

- **Rôle** : Répartition dynamique, gestion de la charge, adaptation, priorisation.
- **Flux** : Orchestration Dashboard UI → Orchestrator Engine → Kernel Rust (gestion) → Logs/Métriques.
- **Gates** : Preuve de répartition optimale, logs d’orchestration, tests E2E de charge, intégration autoheal.

---

# ARCHITECTURE.md — TITANE_INFINITY

> 2026-04-16 — Security audit federation truth: `src/services/security_active/` reste en Ring 3 et n ouvre aucun nouveau chemin réseau. La fédération multi-session est bornée au journal UI local via les `sessionId` déjà présents dans `UILogger`, les filtres de sévérité vivent exclusivement dans le dashboard canonique, et l export de corrélations de confinement est un artefact JSON local persistant dans le navigateur courant. Cette extension enrichit l audit sans contourner One Door ni simuler un backend partagé.

> 2026-04-17 — Runtime hook isolation and hybrid shell hardening truth: la réduction du blast radius HMR passe désormais aussi par une discipline d import runtime. Les points d entrée actifs de Ring 4 n importent plus le barrel racine `src/hooks/index.ts`, qui reste une surface de compatibilite principalement orientee tests/migration, et les hooks physiologiques ont ete extraits dans `src/hooks/usePhysiological.ts`. En Ring 0/1, `src-tauri/src/commands/hybrid.rs` applique maintenant une allowlist stricte sur `dev_run_command`, refuse les operateurs shell et execute les commandes autorisees depuis la racine workspace canonique au lieu de relayer un pseudo-shell libre.

> 2026-04-16 — Advanced-agent bounded refresh truth: la phase live suivante reste entièrement Ring 3 et local-first. `src/services/orchestrator/` maintient une série temporelle locale bornée dans le navigateur pour la charge providers, et `src/services/security_active/` maintient un journal local borné pour acquittement/historique/corrélation des événements sécurité. Les dashboards correspondants déclenchent uniquement un refresh périodique borné de leur service dédié; aucun second chemin réseau ni backend ad hoc n est introduit.

> 2026-04-16 — Advanced-agent live runtime surfaces: les services Ring 3 `src/services/orchestrator/`, `src/services/explainability/` et `src/services/security_active/` publient maintenant des snapshots runtime synchrones consommés directement par leurs dashboards canoniques. La vérité active reste bornée au frontend gouverné: métriques locales et santé providers pour l orchestrateur, trace conversationnelle persistée pour l explainability, et corrélation alertes/logs/politiques de confinement pour la sécurité active, sans créer de second chemin réseau hors One Door.

**Version:** 30.1.34  
**Date:** 2026-04-17T11:43:00Z  
**Classification:** CANON

---

## Scripts de lancement et d’installation

- **Linux** : `scripts/launch/launch-titane.sh`, `scripts/launch/start_dev.sh`
- **Windows** :
  - `scripts/launch/launch-titane.ps1` (lancement principal)
  - `scripts/launch/launch-titane.bat` (batch)
  - `scripts/launch/launch-ollama.ps1` (**installation Ollama + modèles IA**)
- **Backend Ollama** : la boucle locale canonique cote Rust utilise `127.0.0.1:11434` et le fallback streaming gouverne `gemma2:2b` pour eviter les derives de resolution `localhost` ou de modele dans les lanes desktop gouvernees.
- **Android** : voir `titane-android/`

... (voir détails dans chaque README)

---

## Vue d'ensemble

TITANE_INFINITY est un **OS cognitif Tauri-only** (React/TypeScript + Rust/Tauri v2).

| Dimension             | Valeur                           |
| --------------------- | -------------------------------- |
| Runtime               | Tauri v2 — desktop uniquement    |
| Frontend              | React 18 + TypeScript 5.5 strict |
| Backend               | Rust 2021 — `src-tauri/`         |
| Fichiers TS/TSX       | **1 668**                        |
| Fichiers Rust         | **880**                          |
| Commandes IPC uniques | **1135**                         |
| Stores Zustand        | **18**                           |
| Hooks React custom    | **110**                          |
| Pages                 | **41**                           |
| Composants            | **226**                          |

---

## Architecture 4-Ring

```mermaid
flowchart TB
    subgraph Ring4 ["🎨 Ring 4 — UI (React)"]
        Pages["Pages (41)\nApp.tsx, pages/, modules/"]
        Comps["Components (226)"]
    end

    subgraph Ring3 ["💾 Ring 3 — Orchestration"]
        Stores["Stores Zustand (18)"]
        Hooks["Hooks (110)"]
        Services["Services (IPC bridges)"]
        MonitoringUI["Monitoring Dashboard"]
    end

    subgraph Ring2 ["⚙️ Ring 2 — Engines"]
        Engines["src/engines/ (25 domaines)"]
        RustCmd["src-tauri/src/commands/"]
        MonitoringEngine["Monitoring Engine"]
    end

    subgraph Ring1 ["📦 Ring 1 — Types/Data"]
        Types["src/types/"]
        RustData["src-tauri/src/memory/\nsrc-tauri/src/singularity/"]
    end

    subgraph Ring0 ["🔴 Ring 0 — Kernel Rust"]
        MainRs["main.rs (1135 commandes)"]
        Handlers["handlers.rs"]
        SecEng["secure_engine.rs"]
        State["state.rs"]
    end

    Ring4 -->|hooks & stores| Ring3
    Ring3 -->|secureInvoke| Ring0
    Ring2 -->|types| Ring1
    Ring3 -->|engines| Ring2
    MonitoringUI -->|metrics| MonitoringEngine
    MonitoringEngine -->|collect| Ring0

    style Ring0 fill:#dc2626,color:#fff
    style Ring1 fill:#ea580c,color:#fff
    style Ring2 fill:#d97706,color:#fff
    style Ring3 fill:#16a34a,color:#fff
    style Ring4 fill:#2563eb,color:#fff
```

---

## One Door — Chaîne IPC canonique

```
UI Component
  → Hook (useChat, etc.)
  → Service (tauriClient.ts)
  → safeInvokeCanonical (src/utils/invoke.ts)
  → secureInvoke (src/lib/security.ts)
  → safeInvokeTauri (src/utils/tauriProtector.ts)
  → @tauri-apps/api/core invoke()
  → Rust handler (handlers.rs)
  → Command implementation (commands/*)
  → CanonicalIpcResult { ok, content, error }
```

**Invariant** : Aucun `invoke()` direct depuis l'UI. One Door obligatoire.  
**Gate** : `src/__tests__/architecture/one-door-direct-invoke.test.ts`

---

## Documentation

| Document                                                                       | Description                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [`docs/CARTOGRAPHY_COMPLETE.md`](./docs/CARTOGRAPHY_COMPLETE.md)               | Cartographie complète avancée — 4-Ring, IPC, stores, hooks, routes, Rust |
| [`docs/IPC_CATALOG.md`](./docs/IPC_CATALOG.md)                                 | Catalogue exhaustif des 1135+ commandes IPC par domaine                  |
| [`docs/DEPENDENCY_MAP.md`](./docs/DEPENDENCY_MAP.md)                           | Carte des dépendances frontend (pnpm) et backend (Cargo)                 |
| [`docs/CARTOGRAPHY_TITANE_INFINITY.md`](./docs/CARTOGRAPHY_TITANE_INFINITY.md) | Cartographie canonique MAIN — architecture, IPC One Door                 |
| [`docs/ARCHITECTURE_RINGS.md`](./docs/ARCHITECTURE_RINGS.md)                   | Architecture en anneaux détaillée                                        |

---

## Self-Awareness Knowledge Base

TITANE est conscient de sa propre architecture grâce à la base de connaissance interne :

| Fichier                                                                                                                | Description                                 |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [`src/knowledge/self-awareness/architecture-map.json`](./src/knowledge/self-awareness/architecture-map.json)           | Carte structurée complète de l'architecture |
| [`src/knowledge/self-awareness/capabilities-manifest.json`](./src/knowledge/self-awareness/capabilities-manifest.json) | Inventaire complet des capacités            |
| [`src/knowledge/self-awareness/index.ts`](./src/knowledge/self-awareness/index.ts)                                     | Module d'interface pour la self-awareness   |
| [`src/hooks/useSelfAwareness.ts`](./src/hooks/useSelfAwareness.ts)                                                     | Hook React pour l'introspection             |

```typescript
// Usage
import { useSelfAwareness } from '@/hooks/useSelfAwareness';

function MyComponent() {
  const { metrics, allCapabilities, getCommandsByDomain } = useSelfAwareness();
  // metrics.total_ipc_commands === 1135
  // allCapabilities === ['ai_chat', 'voice', 'cognitive', ...]
}
```

---

## Invariants Cardinaux

1. **One Door** : UI → IPC canonique → Backend Rust. Zéro accès réseau direct depuis le frontend.
2. **4-Ring** : pas d'import inverse. Ring 4 ne bypasse pas Ring 3.
3. **IPC Contract** : toute réponse suit `{ ok, content, error }`. Zéro silence.
4. **Tauri-only** : production runtime exclusivement Tauri. Aucun serveur HTTP exposé.

---

## Gates de vérification

bash scripts/gates/ring-integrity-gate.sh

```

---

_TITANE_INFINITY v30.1.34 — Cognitive OS_

## Explainability Agent

L’agent d’explicabilité assure la traçabilité des décisions IA, la génération de logs d’inférences, la justification des choix et l’audit explicable. Il s’intègre à un dashboard UI (Ring 3/4) et au moteur explainability (Ring 2), avec accès direct au kernel (Ring 0) pour la collecte des preuves d’explication.

- **Rôle** : Traçabilité, justification, audit explicable, logs d’inférences.
- **Flux** : Explainability Dashboard UI → Explainability Engine → Kernel Rust (collecte) → Rapports/Explications.
- **Gates** : Génération automatique de rapports d’explicabilité, logs d’inférences, tests E2E sur la traçabilité.

---
```
