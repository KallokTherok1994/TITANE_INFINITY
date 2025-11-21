# 🚀 GUIDE DE DÉMARRAGE RAPIDE — DOCUMENT ENGINE v13

## 📋 INTRODUCTION

Ce guide vous permet de commencer à utiliser le **Document Generation Engine v13** immédiatement pour produire des documents professionnels de haute qualité.

---

## ⚡ DÉMARRAGE RAPIDE (5 MINUTES)

### 1. Vérifier l'installation

Le Document Engine est déjà intégré dans TITANE∞. Vérifiez que les modules sont présents :

```bash
ls src-tauri/src/doc_engine/
```

Vous devriez voir : `mod.rs`, `generator.rs`, `legal.rs`, `editorial.rs`, `admin.rs`, `technical.rs`, etc.

### 2. Premier document (exemple Rust)

```rust
use doc_engine::*;
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<()> {
    // 1. Créer le générateur
    let generator = generator::DocumentGenerator::new();
    
    // 2. Configuration
    let config = GenerationConfig {
        doc_type: DocumentType::Contract,
        style: DocumentStyle::Legal,
        detail_level: DetailLevel::Standard,
        tone: "neutral".to_string(),
        language: "fr".to_string(),
        custom_params: HashMap::new(),
    };
    
    // 3. Paramètres du document
    let mut params = HashMap::new();
    params.insert("title".to_string(), "Contrat de Service IT".to_string());
    params.insert("party1_name".to_string(), "TechCorp Inc.".to_string());
    params.insert("party2_name".to_string(), "ClientCo Ltd.".to_string());
    params.insert("duration".to_string(), "12 mois".to_string());
    
    // 4. Génération
    let document = generator.generate(config, params).await?;
    
    // 5. Export
    let export_engine = export::ExportEngine::default();
    let result = export_engine.export(&document, ExportFormat::Markdown).await?;
    
    println!("Document généré : {}", result.path);
    
    Ok(())
}
```

---

## 📝 TYPES DE DOCUMENTS SUPPORTÉS

### 1. Documents Légaux 📜

#### Contrat professionnel
```rust
let config = GenerationConfig {
    doc_type: DocumentType::Contract,
    style: DocumentStyle::Legal,
    detail_level: DetailLevel::Advanced,
    tone: "strict".to_string(),
    language: "fr".to_string(),
    custom_params: HashMap::new(),
};

let mut params = HashMap::new();
params.insert("title".to_string(), "Contrat de Prestation de Services".to_string());
params.insert("party1_name".to_string(), "Prestataire XYZ".to_string());
params.insert("party1_role".to_string(), "Fournisseur".to_string());
params.insert("party2_name".to_string(), "Client ABC".to_string());
params.insert("party2_role".to_string(), "Client".to_string());
params.insert("duration".to_string(), "24 mois".to_string());
params.insert("scope".to_string(), "Développement logiciel et maintenance".to_string());
```

**Sections générées automatiquement** :
- Préambule avec identification des parties
- Définitions juridiques
- Portée et interprétation
- Obligations réciproques
- Responsabilités et garanties
- Confidentialité
- Propriété intellectuelle
- Durée et résiliation
- Règlement des différends
- Dispositions générales

#### Accord de confidentialité (NDA)
```rust
let config = GenerationConfig {
    doc_type: DocumentType::NDA,
    style: DocumentStyle::Legal,
    detail_level: DetailLevel::Exhaustive,
    tone: "strict".to_string(),
    language: "fr".to_string(),
    custom_params: HashMap::new(),
};
```

**Clauses obligatoires incluses** :
- Étendue de la confidentialité
- Durée de l'obligation (5 ans)
- Exceptions légales
- Sanctions en cas de violation

---

### 2. Documents Éditoriaux 📚

#### Chapitre de livre
```rust
let config = GenerationConfig {
    doc_type: DocumentType::BookChapter,
    style: DocumentStyle::Editorial,
    detail_level: DetailLevel::Advanced,
    tone: "accessible".to_string(),
    language: "fr".to_string(),
    custom_params: HashMap::new(),
};

let mut params = HashMap::new();
params.insert("title".to_string(), "L'Art de la Productivité Consciente".to_string());
params.insert("context".to_string(), "explorer les méthodes d'optimisation personnelle".to_string());
params.insert("target_audience".to_string(), "professionnels et entrepreneurs".to_string());
params.insert("objectives".to_string(), "Maîtriser les techniques avancées;Développer des habitudes durables;Équilibrer performance et bien-être".to_string());
```

**Structure éditoriale automatique** :
- Introduction forte et engageante
- Concepts fondamentaux bien expliqués
- Méthodologie et framework structurés
- Applications pratiques avec exemples
- Outils et ressources exploitables
- Exercices pratiques interactifs
- Synthèse claire des points clés
- Conclusion inspirante

#### Module de formation
```rust
let config = GenerationConfig {
    doc_type: DocumentType::TrainingModule,
    style: DocumentStyle::Pedagogical,
    detail_level: DetailLevel::Standard,
    tone: "accessible".to_string(),
    language: "fr".to_string(),
    custom_params: HashMap::new(),
};

params.insert("title".to_string(), "Maîtrise de Git & GitHub".to_string());
```

**Contenu pédagogique** :
- Objectifs d'apprentissage clairs
- Concepts clés expliqués
- Cas pratiques détaillés
- Exercices guidés progressifs
- Ressources complémentaires

---

### 3. Documents Professionnels 💼

#### Rapport d'audit
```rust
let config = GenerationConfig {
    doc_type: DocumentType::Audit,
    style: DocumentStyle::Professional,
    detail_level: DetailLevel::Exhaustive,
    tone: "neutral".to_string(),
    language: "fr".to_string(),
    custom_params: HashMap::new(),
};

let mut params = HashMap::new();
params.insert("title".to_string(), "Audit de Sécurité IT".to_string());
params.insert("context".to_string(), "l'infrastructure IT de l'entreprise".to_string());
params.insert("audit_objectives".to_string(), "Évaluer conformité, détecter vulnérabilités".to_string());
params.insert("scope".to_string(), "Serveurs, réseaux, applications web".to_string());
params.insert("strengths".to_string(), "- Chiffrement fort\n- Backups réguliers".to_string());
params.insert("improvements".to_string(), "- MFA à déployer\n- Logs centralisés".to_string());
```

**Sections professionnelles** :
- Contexte et portée
- Méthodologie d'audit
- Constats et observations
- Recommandations prioritaires
- Plan d'action avec timeline
- Conclusion et perspectives

#### Plan d'affaires
```rust
let config = GenerationConfig {
    doc_type: DocumentType::BusinessPlan,
    style: DocumentStyle::Professional,
    detail_level: DetailLevel::Advanced,
    tone: "professional".to_string(),
    language: "fr".to_string(),
    custom_params: HashMap::new(),
};

params.insert("vision".to_string(), "Devenir leader du marché SaaS B2B".to_string());
params.insert("mission".to_string(), "Simplifier la gestion de projets pour PME".to_string());
```

**Structure business complète** :
- Résumé exécutif
- Vision et mission
- Analyse de marché (cible, concurrence)
- Produits et services
- Modèle d'affaires (revenus, coûts)
- Stratégie marketing et commerciale
- Plan opérationnel
- Projections financières
- Analyse des risques

---

### 4. Documents Techniques 🔧

#### Spécification d'architecture
```rust
let config = GenerationConfig {
    doc_type: DocumentType::Architecture,
    style: DocumentStyle::Technical,
    detail_level: DetailLevel::Exhaustive,
    tone: "technical".to_string(),
    language: "fr".to_string(),
    custom_params: HashMap::new(),
};

params.insert("system_name".to_string(), "TITANE∞ Semantic Search".to_string());
params.insert("context".to_string(), "Moteur de recherche sémantique distribué".to_string());
params.insert("goals".to_string(), "Performance <100ms, scalabilité horizontale".to_string());
```

**Documentation technique complète** :
- Vue d'ensemble système
- Composants et responsabilités
- Architecture de données
- Stack technologique détaillé
- Patterns et standards
- Sécurité (auth, chiffrement)
- Scalabilité et performance
- Déploiement et opérations

#### Documentation API
```rust
let config = GenerationConfig {
    doc_type: DocumentType::APIDoc,
    style: DocumentStyle::Technical,
    detail_level: DetailLevel::Exhaustive,
    tone: "technical".to_string(),
    language: "fr".to_string(),
    custom_params: HashMap::new(),
};

params.insert("base_url".to_string(), "https://api.titane-infinity.com".to_string());
params.insert("version".to_string(), "v1.0.0".to_string());
```

**Documentation API professionnelle** :
- Introduction et base URL
- Authentification (OAuth, JWT, API Keys)
- Endpoints détaillés avec exemples curl
- Schémas de données (JSON)
- Codes d'erreur complets
- Rate limiting
- Webhooks (si applicable)

---

## 🎨 PERSONNALISATION AVANCÉE

### Styles disponibles

```rust
pub enum DocumentStyle {
    Formal,         // Très formel, académique
    Legal,          // Juridique strict
    Technical,      // Technique précis
    Editorial,      // Fluide, narratif
    Pedagogical,    // Pédagogique clair
    Professional,   // Professionnel standard
    Academic,       // Académique rigoureux
}
```

### Niveaux de détail

```rust
pub enum DetailLevel {
    Summary,        // Synthèse concise
    Standard,       // Niveau normal
    Advanced,       // Détaillé approfondi
    Exhaustive,     // Maximum de détail
}
```

### Tonalités

- `"strict"` : Très formel, sans nuances
- `"neutral"` : Neutre professionnel
- `"accessible"` : Accessible et clair
- `"friendly"` : Convivial (pour contenus marketing)

---

## ✅ VALIDATION AUTOMATIQUE (SENTINEL)

Le Document Engine intègre **Sentinel v13** pour validation automatique.

### Validation structurelle
```rust
// Automatique lors de la génération
let document = generator.generate(config, params).await?;

// Le ValidationStatus est dans document.validation_status
if !document.validation_status.is_valid {
    for error in &document.validation_status.errors {
        println!("❌ {}: {}", error.code, error.message);
    }
}

for warning in &document.validation_status.warnings {
    println!("⚠️  {}", warning.message);
}

for suggestion in &document.validation_status.suggestions {
    if suggestion.priority >= 8 {
        println!("💡 [P{}] {}", suggestion.priority, suggestion.message);
    }
}
```

### Corrections automatiques

Sentinel applique des corrections automatiques pour :
- Compléter clauses juridiques manquantes
- Ajouter sections obligatoires
- Corriger incohérences structurelles
- Améliorer clarté

---

## 📤 EXPORT MULTI-FORMAT

### Markdown (recommandé pour Git/docs)
```rust
let export_engine = export::ExportEngine::default();
let result = export_engine.export(&document, ExportFormat::Markdown).await?;
println!("Markdown : {}", result.path);
```

### HTML (avec CSS intégré)
```rust
let result = export_engine.export(&document, ExportFormat::Html).await?;
// Génère un HTML complet avec styles professionnels
```

### JSON (structure complète)
```rust
let result = export_engine.export(&document, ExportFormat::Json).await?;
// Parfait pour intégrations API ou traitement automatisé
```

### Texte brut
```rust
let result = export_engine.export(&document, ExportFormat::Text).await?;
// Compatible universel, aucun formatage
```

### PDF (à venir)
```rust
// Nécessite intégration d'une bibliothèque PDF
let result = export_engine.export(&document, ExportFormat::Pdf).await?;
```

---

## 🔐 STOCKAGE SÉCURISÉ

### Sauvegarde chiffrée
```rust
use std::path::PathBuf;

let storage = storage::StorageEngine::new(
    PathBuf::from("./data/titane/memory/documents")
);

// Sauvegarde avec chiffrement AES-256-GCM + Argon2id
let path = storage.save(&document).await?;
println!("Document sauvegardé : {}", path);
```

### Chargement
```rust
let document_id = "abc-123-def-456";
let loaded_doc = storage.load(document_id).await?;
```

### Liste des documents
```rust
let all_docs = storage.list_documents().await?;
for metadata in all_docs {
    println!("{} - {} (v{})", 
        metadata.id, 
        metadata.title, 
        metadata.version
    );
}
```

---

## 🔄 VERSIONNEMENT

### Créer une version
```rust
let mut versioning = versioning::VersioningEngine::new();

let changes = vec![
    Change {
        change_type: ChangeType::Modified,
        description: "Ajout clause de responsabilité".to_string(),
        section_id: Some("responsibilities".to_string()),
    },
];

let version = versioning.create_version(document.clone(), changes)?;
println!("Version créée : {}", version.version_number);
```

### Historique
```rust
let versions = versioning.get_versions(&document.metadata.id);
for version in versions {
    println!("{} - {} changements", 
        version.version_number, 
        version.changes.len()
    );
}
```

### Comparaison
```rust
let diff = versioning.diff_versions(
    &document.metadata.id,
    "1.0.0",
    "1.0.1"
)?;

for difference in diff {
    println!("Champ '{}' modifié", difference.field);
}
```

### Restauration
```rust
let restored = versioning.restore_version(&document.metadata.id, "1.0.0")?;
```

---

## 🎯 CAS D'USAGE RÉELS

### 1. Génération massive de contrats
```rust
let clients = vec!["ClientA", "ClientB", "ClientC"];

for client in clients {
    let mut params = HashMap::new();
    params.insert("title".to_string(), format!("Contrat {}", client));
    params.insert("party2_name".to_string(), client.to_string());
    
    let doc = generator.generate(config.clone(), params).await?;
    storage.save(&doc).await?;
    export_engine.export(&doc, ExportFormat::Pdf).await?;
}
```

### 2. Pipeline éditorial automatisé
```rust
// Génération → Validation → Export → Versionnement
let doc = generator.generate(config, params).await?;

if doc.validation_status.is_valid {
    let path = storage.save(&doc).await?;
    export_engine.export(&doc, ExportFormat::Markdown).await?;
    versioning.create_version(doc, vec![])?;
    println!("✅ Publication complète");
} else {
    println!("❌ Corrections nécessaires");
}
```

### 3. Génération documentation technique automatique
```rust
let modules = vec!["ModuleA", "ModuleB", "ModuleC"];

for module in modules {
    let mut params = HashMap::new();
    params.insert("title".to_string(), format!("Documentation {}", module));
    params.insert("system_name".to_string(), module.to_string());
    
    let config = GenerationConfig {
        doc_type: DocumentType::APIDoc,
        style: DocumentStyle::Technical,
        detail_level: DetailLevel::Exhaustive,
        tone: "technical".to_string(),
        language: "fr".to_string(),
        custom_params: HashMap::new(),
    };
    
    let doc = generator.generate(config, params).await?;
    export_engine.export(&doc, ExportFormat::Html).await?;
}
```

---

## 🚨 DÉPANNAGE

### Erreur : "Template not found"
**Solution** : Vérifier que le `DocumentType` correspond à un template existant.
```rust
// Templates disponibles : Contract, NDA, Audit, Architecture, etc.
```

### Erreur : "Validation failed"
**Solution** : Consulter `document.validation_status` pour détails.
```rust
if !document.validation_status.is_valid {
    for error in &document.validation_status.errors {
        eprintln!("Erreur : {}", error.message);
    }
}
```

### Export PDF ne fonctionne pas
**Solution** : L'export PDF nécessite une bibliothèque externe (ex: `printpdf`).
```toml
# Cargo.toml
[dependencies]
printpdf = "0.6"
```

---

## 📚 RESSOURCES SUPPLÉMENTAIRES

### Documentation complète
- Architecture : `ARCHITECTURE_COMPLETE_V13_V14.md`
- Rapport exécutif : `RAPPORT_EXECUTIF_FINAL.md`
- Code source : `/src-tauri/src/doc_engine/`

### Exemples avancés
Voir les tests unitaires dans chaque module pour exemples complets.

### Support
Pour questions ou bugs, créer une issue dans le repository avec :
- Type de document généré
- Configuration utilisée
- Message d'erreur complet

---

## ✨ BONNES PRATIQUES

### 1. Toujours valider
```rust
let doc = generator.generate(config, params).await?;
assert!(doc.validation_status.is_valid);
```

### 2. Versionner systématiquement
```rust
versioning.create_version(doc, changes)?;
```

### 3. Sauvegarder chiffré
```rust
storage.save(&doc).await?;
```

### 4. Exporter en plusieurs formats
```rust
export_engine.export(&doc, ExportFormat::Markdown).await?;
export_engine.export(&doc, ExportFormat::Html).await?;
```

### 5. Documenter les changements
```rust
let changes = vec![
    Change {
        change_type: ChangeType::Modified,
        description: "Description claire du changement".to_string(),
        section_id: Some("section_id".to_string()),
    },
];
```

---

## 🎉 VOUS ÊTES PRÊT !

Vous savez maintenant :
- ✅ Générer tous types de documents
- ✅ Personnaliser style et contenu
- ✅ Valider automatiquement
- ✅ Exporter en plusieurs formats
- ✅ Stocker de façon sécurisée
- ✅ Versionner efficacement

**Prochaine étape** : Explorez les autres engines (Semantic Search, Autopilot, etc.) dans `ARCHITECTURE_COMPLETE_V13_V14.md`.

---

**Version** : 1.0.0  
**Date** : 20 novembre 2025  
**Module** : Document Generation Engine v13  
**Statut** : ✅ Production Ready

**🚀 Bonne génération ! 🚀**
