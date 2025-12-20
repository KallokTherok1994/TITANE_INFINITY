/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ OPUS #11 — EMBEDDED DOCS ENGINE v∞
 * Système de documentation auto-généré embarqué
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ce module fournit:
 * - Extraction automatique des docstrings Rust
 * - Génération de documentation pour les commandes Tauri
 * - API introspection pour le frontend
 * - Documentation contextuelle in-app
 */
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Documentation d'une commande Tauri
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandDoc {
    /// Nom de la commande (ex: "titan_state_get")
    pub name: String,
    /// Description courte
    pub summary: String,
    /// Description détaillée
    pub description: String,
    /// Module parent
    pub module: String,
    /// Catégorie fonctionnelle
    pub category: CommandCategory,
    /// Paramètres attendus
    pub params: Vec<ParamDoc>,
    /// Type de retour
    pub returns: ReturnDoc,
    /// Exemples d'utilisation
    pub examples: Vec<ExampleDoc>,
    /// Tags pour recherche
    pub tags: Vec<String>,
    /// Version d'ajout
    pub since: String,
    /// Deprecated?
    pub deprecated: Option<DeprecationInfo>,
}

/// Catégorie de commande
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CommandCategory {
    /// Gestion de l'état (state)
    State,
    /// Mémoire et persistance
    Memory,
    /// IA et chat
    AI,
    /// Audio et TTS
    Audio,
    /// Système de fichiers
    FileSystem,
    /// Sécurité et crypto
    Security,
    /// DevTools et diagnostics
    DevTools,
    /// Paramètres utilisateur
    Settings,
    /// Métriques et analytics
    Metrics,
    /// Réseau et API
    Network,
    /// Autres
    Other,
}

/// Documentation d'un paramètre
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParamDoc {
    /// Nom du paramètre
    pub name: String,
    /// Type TypeScript correspondant
    pub ts_type: String,
    /// Description
    pub description: String,
    /// Requis?
    pub required: bool,
    /// Valeur par défaut
    pub default: Option<String>,
}

/// Documentation du retour
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReturnDoc {
    /// Type TypeScript
    pub ts_type: String,
    /// Description
    pub description: String,
    /// Peut échouer?
    pub can_fail: bool,
    /// Types d'erreurs possibles
    pub error_types: Vec<String>,
}

/// Exemple d'utilisation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExampleDoc {
    /// Titre de l'exemple
    pub title: String,
    /// Code TypeScript
    pub code: String,
    /// Description
    pub description: String,
}

/// Info de dépréciation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeprecationInfo {
    /// Version de dépréciation
    pub since: String,
    /// Alternative recommandée
    pub replacement: Option<String>,
    /// Raison
    pub reason: String,
}

/// Documentation d'un module
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleDoc {
    /// Nom du module
    pub name: String,
    /// Description
    pub description: String,
    /// Commandes dans ce module
    pub commands: Vec<String>,
    /// Sous-modules
    pub submodules: Vec<String>,
}

/// Registre complet de documentation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocsRegistry {
    /// Version de l'API
    pub api_version: String,
    /// Version de TITANE
    pub titane_version: String,
    /// Timestamp de génération
    pub generated_at: u64,
    /// Commandes par nom
    pub commands: HashMap<String, CommandDoc>,
    /// Modules
    pub modules: HashMap<String, ModuleDoc>,
    /// Index de recherche (tag -> commandes)
    pub search_index: HashMap<String, Vec<String>>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur de documentation embarqué
pub struct DocsEngine {
    registry: DocsRegistry,
}

impl DocsEngine {
    /// Créer un nouveau moteur avec la documentation pré-chargée
    pub fn new() -> Self {
        let mut engine = Self {
            registry: DocsRegistry {
                api_version: "2.0".to_string(),
                titane_version: env!("CARGO_PKG_VERSION").to_string(),
                generated_at: chrono::Utc::now().timestamp_millis() as u64,
                commands: HashMap::new(),
                modules: HashMap::new(),
                search_index: HashMap::new(),
            },
        };

        // Charger la documentation statique
        engine.load_builtin_docs();
        engine
    }

    /// Charger la documentation des commandes intégrées
    fn load_builtin_docs(&mut self) {
        // ═══════════════════════════════════════════════════════════════════
        // MODULE: STATE
        // ═══════════════════════════════════════════════════════════════════
        self.register_command(CommandDoc {
            name: "titan_state_get".to_string(),
            summary: "Récupère l'état complet de SingularityState".to_string(),
            description: "Retourne l'intégralité de l'état persistant de TITANE, incluant tous les sous-modules (nexus, memory, harmonia, sentinel, cognition, timeline, autonomy, devops, metrics).".to_string(),
            module: "persistence".to_string(),
            category: CommandCategory::State,
            params: vec![],
            returns: ReturnDoc {
                ts_type: "SingularityState".to_string(),
                description: "État complet sérialisé".to_string(),
                can_fail: true,
                error_types: vec!["StateNotInitialized".to_string(), "SerializationError".to_string()],
            },
            examples: vec![
                ExampleDoc {
                    title: "Récupérer l'état".to_string(),
                    code: r#"const state = await invoke<SingularityState>('titan_state_get');
console.log('XP:', state.nexus.xp.total);"#.to_string(),
                    description: "Récupération simple de l'état".to_string(),
                },
            ],
            tags: vec!["state".to_string(), "core".to_string(), "read".to_string()],
            since: "v14.0.0".to_string(),
            deprecated: None,
        });

        self.register_command(CommandDoc {
            name: "titan_state_update".to_string(),
            summary: "Met à jour une partie de l'état".to_string(),
            description: "Applique une mise à jour partielle à SingularityState. Utilise JSON Merge Patch pour fusionner les changements.".to_string(),
            module: "persistence".to_string(),
            category: CommandCategory::State,
            params: vec![
                ParamDoc {
                    name: "patch".to_string(),
                    ts_type: "Partial<SingularityState>".to_string(),
                    description: "Objet contenant les champs à mettre à jour".to_string(),
                    required: true,
                    default: None,
                },
            ],
            returns: ReturnDoc {
                ts_type: "void".to_string(),
                description: "Succès silencieux".to_string(),
                can_fail: true,
                error_types: vec!["ValidationError".to_string(), "PersistenceError".to_string()],
            },
            examples: vec![
                ExampleDoc {
                    title: "Mettre à jour XP".to_string(),
                    code: r#"await invoke('titan_state_update', {
  patch: {
    nexus: {
      xp: { total: 1500 }
    }
  }
});"#.to_string(),
                    description: "Mise à jour de l'XP utilisateur".to_string(),
                },
            ],
            tags: vec!["state".to_string(), "core".to_string(), "write".to_string()],
            since: "v14.0.0".to_string(),
            deprecated: None,
        });

        // ═══════════════════════════════════════════════════════════════════
        // MODULE: MEMORY
        // ═══════════════════════════════════════════════════════════════════
        self.register_command(CommandDoc {
            name: "titan_memory_doctor_diagnose".to_string(),
            summary: "Lance un diagnostic complet du système mémoire".to_string(),
            description: "Analyse le stockage, le schéma, les backups et la santé globale. Retourne un rapport détaillé avec score et recommandations.".to_string(),
            module: "persistence/memory_doctor".to_string(),
            category: CommandCategory::Memory,
            params: vec![],
            returns: ReturnDoc {
                ts_type: "DoctorReport".to_string(),
                description: "Rapport de diagnostic complet".to_string(),
                can_fail: true,
                error_types: vec!["DiagnosticError".to_string()],
            },
            examples: vec![
                ExampleDoc {
                    title: "Diagnostic rapide".to_string(),
                    code: r#"const report = await invoke<DoctorReport>('titan_memory_doctor_diagnose');
if (report.score < 70) {
  console.warn('Memory health needs attention!');
}"#.to_string(),
                    description: "Vérification de la santé mémoire".to_string(),
                },
            ],
            tags: vec!["memory".to_string(), "diagnostic".to_string(), "health".to_string()],
            since: "v16.2.3".to_string(),
            deprecated: None,
        });

        self.register_command(CommandDoc {
            name: "titan_memory_doctor_heal".to_string(),
            summary: "Lance le self-healing du système mémoire".to_string(),
            description: "Tente de réparer automatiquement les problèmes détectés. Corrige les corruptions mineures, optimise le stockage.".to_string(),
            module: "persistence/memory_doctor".to_string(),
            category: CommandCategory::Memory,
            params: vec![],
            returns: ReturnDoc {
                ts_type: "SelfHealingReport".to_string(),
                description: "Rapport des actions de réparation".to_string(),
                can_fail: true,
                error_types: vec!["HealingError".to_string()],
            },
            examples: vec![],
            tags: vec!["memory".to_string(), "heal".to_string(), "repair".to_string()],
            since: "v16.2.3".to_string(),
            deprecated: None,
        });

        self.register_command(CommandDoc {
            name: "titan_memory_compact".to_string(),
            summary: "Compacte le journal de mémoire".to_string(),
            description: "Fusionne les entrées du journal pour réduire la taille sur disque. Améliore les performances de lecture.".to_string(),
            module: "persistence".to_string(),
            category: CommandCategory::Memory,
            params: vec![],
            returns: ReturnDoc {
                ts_type: "CompactionReport".to_string(),
                description: "Statistiques de compaction".to_string(),
                can_fail: true,
                error_types: vec!["CompactionError".to_string()],
            },
            examples: vec![],
            tags: vec!["memory".to_string(), "optimization".to_string(), "storage".to_string()],
            since: "v14.0.0".to_string(),
            deprecated: None,
        });

        // ═══════════════════════════════════════════════════════════════════
        // MODULE: BACKUP
        // ═══════════════════════════════════════════════════════════════════
        self.register_command(CommandDoc {
            name: "titan_backup_create".to_string(),
            summary: "Crée un backup de l'état actuel".to_string(),
            description:
                "Sauvegarde l'état complet avec métadonnées. Supporte le chiffrement optionnel."
                    .to_string(),
            module: "persistence/backup".to_string(),
            category: CommandCategory::Memory,
            params: vec![ParamDoc {
                name: "description".to_string(),
                ts_type: "string".to_string(),
                description: "Description du backup".to_string(),
                required: false,
                default: Some("\"Manual backup\"".to_string()),
            }],
            returns: ReturnDoc {
                ts_type: "BackupReport".to_string(),
                description: "Informations sur le backup créé".to_string(),
                can_fail: true,
                error_types: vec!["BackupError".to_string(), "StorageError".to_string()],
            },
            examples: vec![],
            tags: vec![
                "backup".to_string(),
                "save".to_string(),
                "persistence".to_string(),
            ],
            since: "v14.0.0".to_string(),
            deprecated: None,
        });

        self.register_command(CommandDoc {
            name: "titan_backup_list".to_string(),
            summary: "Liste tous les backups disponibles".to_string(),
            description:
                "Retourne la liste des backups avec leurs métadonnées (date, taille, description)."
                    .to_string(),
            module: "persistence/backup".to_string(),
            category: CommandCategory::Memory,
            params: vec![],
            returns: ReturnDoc {
                ts_type: "BackupInfo[]".to_string(),
                description: "Liste des backups".to_string(),
                can_fail: true,
                error_types: vec!["BackupError".to_string()],
            },
            examples: vec![],
            tags: vec!["backup".to_string(), "list".to_string()],
            since: "v14.0.0".to_string(),
            deprecated: None,
        });

        self.register_command(CommandDoc {
            name: "titan_backup_restore".to_string(),
            summary: "Restaure un backup".to_string(),
            description: "Remplace l'état actuel par le backup spécifié. ⚠️ DESTRUCTIF - l'état actuel sera perdu.".to_string(),
            module: "persistence/backup".to_string(),
            category: CommandCategory::Memory,
            params: vec![
                ParamDoc {
                    name: "backup_id".to_string(),
                    ts_type: "string".to_string(),
                    description: "ID du backup à restaurer".to_string(),
                    required: true,
                    default: None,
                },
            ],
            returns: ReturnDoc {
                ts_type: "RestoreReport".to_string(),
                description: "Résultat de la restauration".to_string(),
                can_fail: true,
                error_types: vec!["BackupNotFound".to_string(), "RestoreError".to_string()],
            },
            examples: vec![],
            tags: vec!["backup".to_string(), "restore".to_string(), "dangerous".to_string()],
            since: "v14.0.0".to_string(),
            deprecated: None,
        });

        // ═══════════════════════════════════════════════════════════════════
        // MODULE: AI
        // ═══════════════════════════════════════════════════════════════════
        self.register_command(CommandDoc {
            name: "titan_ai_chat".to_string(),
            summary: "Envoie un message au chat IA".to_string(),
            description:
                "Envoie un message et reçoit une réponse de l'IA configurée. Supporte le streaming."
                    .to_string(),
            module: "ai_chat".to_string(),
            category: CommandCategory::AI,
            params: vec![
                ParamDoc {
                    name: "message".to_string(),
                    ts_type: "string".to_string(),
                    description: "Message utilisateur".to_string(),
                    required: true,
                    default: None,
                },
                ParamDoc {
                    name: "provider".to_string(),
                    ts_type: "AIProvider".to_string(),
                    description: "Fournisseur IA à utiliser".to_string(),
                    required: false,
                    default: Some("\"auto\"".to_string()),
                },
            ],
            returns: ReturnDoc {
                ts_type: "ChatResponse".to_string(),
                description: "Réponse de l'IA".to_string(),
                can_fail: true,
                error_types: vec!["APIError".to_string(), "RateLimitError".to_string()],
            },
            examples: vec![],
            tags: vec![
                "ai".to_string(),
                "chat".to_string(),
                "conversation".to_string(),
            ],
            since: "v14.0.0".to_string(),
            deprecated: None,
        });

        // ═══════════════════════════════════════════════════════════════════
        // MODULE: DEVTOOLS
        // ═══════════════════════════════════════════════════════════════════
        self.register_command(CommandDoc {
            name: "titan_docs_search".to_string(),
            summary: "Recherche dans la documentation embarquée".to_string(),
            description: "Recherche par mots-clés dans la documentation des commandes Tauri."
                .to_string(),
            module: "devtools/docs_engine".to_string(),
            category: CommandCategory::DevTools,
            params: vec![ParamDoc {
                name: "query".to_string(),
                ts_type: "string".to_string(),
                description: "Termes de recherche".to_string(),
                required: true,
                default: None,
            }],
            returns: ReturnDoc {
                ts_type: "CommandDoc[]".to_string(),
                description: "Commandes correspondantes".to_string(),
                can_fail: false,
                error_types: vec![],
            },
            examples: vec![],
            tags: vec!["docs".to_string(), "search".to_string(), "help".to_string()],
            since: "v16.2.3".to_string(),
            deprecated: None,
        });

        self.register_command(CommandDoc {
            name: "titan_docs_get".to_string(),
            summary: "Récupère la documentation d'une commande".to_string(),
            description: "Retourne la documentation complète d'une commande Tauri spécifique."
                .to_string(),
            module: "devtools/docs_engine".to_string(),
            category: CommandCategory::DevTools,
            params: vec![ParamDoc {
                name: "command_name".to_string(),
                ts_type: "string".to_string(),
                description: "Nom de la commande".to_string(),
                required: true,
                default: None,
            }],
            returns: ReturnDoc {
                ts_type: "CommandDoc | null".to_string(),
                description: "Documentation ou null si non trouvée".to_string(),
                can_fail: false,
                error_types: vec![],
            },
            examples: vec![],
            tags: vec!["docs".to_string(), "help".to_string()],
            since: "v16.2.3".to_string(),
            deprecated: None,
        });

        self.register_command(CommandDoc {
            name: "titan_docs_list".to_string(),
            summary: "Liste toutes les commandes documentées".to_string(),
            description: "Retourne la liste de toutes les commandes Tauri avec leur documentation."
                .to_string(),
            module: "devtools/docs_engine".to_string(),
            category: CommandCategory::DevTools,
            params: vec![ParamDoc {
                name: "category".to_string(),
                ts_type: "CommandCategory".to_string(),
                description: "Filtrer par catégorie".to_string(),
                required: false,
                default: None,
            }],
            returns: ReturnDoc {
                ts_type: "CommandDoc[]".to_string(),
                description: "Liste des commandes".to_string(),
                can_fail: false,
                error_types: vec![],
            },
            examples: vec![],
            tags: vec!["docs".to_string(), "list".to_string()],
            since: "v16.2.3".to_string(),
            deprecated: None,
        });

        // Construire l'index de recherche
        self.build_search_index();

        // Construire les modules
        self.build_modules();
    }

    /// Enregistrer une commande
    fn register_command(&mut self, doc: CommandDoc) {
        self.registry.commands.insert(doc.name.clone(), doc);
    }

    /// Construire l'index de recherche
    fn build_search_index(&mut self) {
        self.registry.search_index.clear();

        for (name, doc) in &self.registry.commands {
            // Indexer par tags
            for tag in &doc.tags {
                self.registry
                    .search_index
                    .entry(tag.clone())
                    .or_insert_with(Vec::new)
                    .push(name.clone());
            }

            // Indexer par catégorie
            let cat_str = format!("{:?}", doc.category).to_lowercase();
            self.registry
                .search_index
                .entry(cat_str)
                .or_insert_with(Vec::new)
                .push(name.clone());

            // Indexer par module
            self.registry
                .search_index
                .entry(doc.module.clone())
                .or_insert_with(Vec::new)
                .push(name.clone());
        }
    }

    /// Construire la structure des modules
    fn build_modules(&mut self) {
        self.registry.modules.clear();

        // Grouper par module
        let mut module_commands: HashMap<String, Vec<String>> = HashMap::new();

        for (name, doc) in &self.registry.commands {
            module_commands
                .entry(doc.module.clone())
                .or_insert_with(Vec::new)
                .push(name.clone());
        }

        // Créer les modules
        for (module_name, commands) in module_commands {
            let description = match module_name.as_str() {
                "persistence" => "Gestion de l'état et de la persistance",
                "persistence/memory_doctor" => "Diagnostic et réparation de la mémoire",
                "persistence/backup" => "Système de backup et restauration",
                "ai_chat" => "Interface de chat avec l'IA",
                "devtools/docs_engine" => "Documentation embarquée",
                _ => "Module TITANE",
            };

            self.registry.modules.insert(
                module_name.clone(),
                ModuleDoc {
                    name: module_name,
                    description: description.to_string(),
                    commands,
                    submodules: vec![],
                },
            );
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // API PUBLIQUE
    // ═══════════════════════════════════════════════════════════════════════

    /// Rechercher des commandes
    pub fn search(&self, query: &str) -> Vec<&CommandDoc> {
        let query_lower = query.to_lowercase();
        let terms: Vec<&str> = query_lower.split_whitespace().collect();

        let mut results: Vec<&CommandDoc> = Vec::new();
        let mut scores: HashMap<String, i32> = HashMap::new();

        for (name, doc) in &self.registry.commands {
            let mut score = 0;

            // Match sur le nom
            if name.to_lowercase().contains(&query_lower) {
                score += 100;
            }

            // Match sur la description
            if doc.summary.to_lowercase().contains(&query_lower) {
                score += 50;
            }

            // Match sur les termes individuels
            for term in &terms {
                if doc.tags.iter().any(|t| t.to_lowercase().contains(term)) {
                    score += 30;
                }
                if doc.description.to_lowercase().contains(term) {
                    score += 10;
                }
            }

            if score > 0 {
                scores.insert(name.clone(), score);
            }
        }

        // Trier par score
        let mut sorted: Vec<_> = scores.iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(a.1));

        for (name, _) in sorted {
            if let Some(doc) = self.registry.commands.get(name) {
                results.push(doc);
            }
        }

        results
    }

    /// Obtenir une commande par nom
    pub fn get(&self, name: &str) -> Option<&CommandDoc> {
        self.registry.commands.get(name)
    }

    /// Lister toutes les commandes
    pub fn list(&self, category: Option<CommandCategory>) -> Vec<&CommandDoc> {
        self.registry
            .commands
            .values()
            .filter(|doc| match &category {
                Some(cat) => &doc.category == cat,
                None => true,
            })
            .collect()
    }

    /// Lister par module
    pub fn list_by_module(&self, module: &str) -> Vec<&CommandDoc> {
        self.registry
            .commands
            .values()
            .filter(|doc| doc.module == module || doc.module.starts_with(&format!("{}/", module)))
            .collect()
    }

    /// Obtenir le registre complet
    pub fn get_registry(&self) -> &DocsRegistry {
        &self.registry
    }

    /// Générer la documentation Markdown
    pub fn generate_markdown(&self) -> String {
        let mut md = String::new();

        md.push_str("# 📚 TITANE∞ API Documentation\n\n");
        md.push_str(&format!(
            "> Version: {} | API: {}\n\n",
            self.registry.titane_version, self.registry.api_version
        ));
        md.push_str("---\n\n");

        // Table des matières par catégorie
        md.push_str("## 📑 Table des matières\n\n");

        let categories = [
            (CommandCategory::State, "🔄 State"),
            (CommandCategory::Memory, "💾 Memory"),
            (CommandCategory::AI, "🤖 AI"),
            (CommandCategory::Audio, "🔊 Audio"),
            (CommandCategory::Security, "🔐 Security"),
            (CommandCategory::DevTools, "🛠️ DevTools"),
        ];

        for (cat, label) in &categories {
            let cmds: Vec<_> = self.list(Some(cat.clone()));
            if !cmds.is_empty() {
                md.push_str(&format!("### {}\n\n", label));
                for cmd in cmds {
                    md.push_str(&format!(
                        "- [`{}`](#{}): {}\n",
                        cmd.name,
                        cmd.name.replace('_', "-"),
                        cmd.summary
                    ));
                }
                md.push_str("\n");
            }
        }

        md.push_str("---\n\n");
        md.push_str("## 📖 Commandes détaillées\n\n");

        // Détails de chaque commande
        for (_, doc) in &self.registry.commands {
            md.push_str(&format!("### `{}`\n\n", doc.name));
            md.push_str(&format!("**{}**\n\n", doc.summary));
            md.push_str(&format!("{}\n\n", doc.description));

            if !doc.params.is_empty() {
                md.push_str("#### Paramètres\n\n");
                md.push_str("| Nom | Type | Requis | Description |\n");
                md.push_str("|-----|------|--------|-------------|\n");
                for param in &doc.params {
                    let req = if param.required { "✅" } else { "❌" };
                    md.push_str(&format!(
                        "| `{}` | `{}` | {} | {} |\n",
                        param.name, param.ts_type, req, param.description
                    ));
                }
                md.push_str("\n");
            }

            md.push_str("#### Retour\n\n");
            md.push_str(&format!("- **Type**: `{}`\n", doc.returns.ts_type));
            md.push_str(&format!(
                "- **Description**: {}\n\n",
                doc.returns.description
            ));

            if !doc.examples.is_empty() {
                md.push_str("#### Exemples\n\n");
                for ex in &doc.examples {
                    md.push_str(&format!("**{}**\n\n", ex.title));
                    md.push_str(&format!("```typescript\n{}\n```\n\n", ex.code));
                }
            }

            md.push_str(&format!("*Depuis: {}*\n\n", doc.since));
            md.push_str("---\n\n");
        }

        md
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
use std::sync::RwLock;

/// Instance globale du DocsEngine
pub static DOCS_ENGINE: Lazy<RwLock<DocsEngine>> = Lazy::new(|| RwLock::new(DocsEngine::new()));

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_docs_engine_init() {
        let engine = DocsEngine::new();
        assert!(!engine.registry.commands.is_empty());
    }

    #[test]
    fn test_search() {
        let engine = DocsEngine::new();
        let results = engine.search("state");
        assert!(!results.is_empty());
    }

    #[test]
    fn test_get_command() {
        let engine = DocsEngine::new();
        let doc = engine.get("titan_state_get");
        assert!(doc.is_some());
        let doc = doc.expect("titan_state_get doc should exist");
        assert_eq!(doc.category, CommandCategory::State);
    }

    #[test]
    fn test_list_by_category() {
        let engine = DocsEngine::new();
        let state_cmds = engine.list(Some(CommandCategory::State));
        assert!(!state_cmds.is_empty());
    }

    #[test]
    fn test_markdown_generation() {
        let engine = DocsEngine::new();
        let md = engine.generate_markdown();
        assert!(md.contains("# 📚 TITANE∞ API Documentation"));
        assert!(md.contains("titan_state_get"));
    }
}
