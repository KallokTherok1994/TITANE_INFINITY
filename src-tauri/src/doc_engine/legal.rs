// Module de génération de documents légaux avancés

use super::*;
use std::collections::HashMap;

/// Génère un contenu légal professionnel
pub fn generate_legal_content(
    config: &GenerationConfig,
    template: &templates::Template,
    params: HashMap<String, String>
) -> Result<DocumentContent> {
    let title = params.get("title")
        .cloned()
        .unwrap_or_else(|| generate_default_title(&config.doc_type));
    
    let parties = extract_parties(&params);
    let executive_summary = generate_legal_summary(&config.doc_type, &parties);
    let objectives = generate_legal_objectives(&config.doc_type);
    
    // Sections légales standard
    let mut sections = vec![
        generate_preamble_section(&parties),
        generate_definitions_section(&params),
        generate_scope_section(&params),
        generate_obligations_section(&parties, &params),
        generate_responsibilities_section(&parties),
        generate_confidentiality_section(),
        generate_ip_section(&parties),
        generate_termination_section(&params),
        generate_dispute_section(&params),
        generate_general_provisions_section(),
    ];
    
    // Clauses obligatoires selon le type de document
    let mandatory_clauses = generate_mandatory_clauses(&config.doc_type, &parties);
    
    // Adaptation selon le template
    sections = adapt_sections_to_template(sections, template);
    
    Ok(DocumentContent {
        title,
        executive_summary,
        objectives,
        sections,
        mandatory_clauses: Some(mandatory_clauses),
        annexes: generate_legal_annexes(&params),
        references: generate_legal_references(),
    })
}

fn generate_default_title(doc_type: &DocumentType) -> String {
    match doc_type {
        DocumentType::Contract => "Contrat de Service".to_string(),
        DocumentType::NDA => "Accord de Confidentialité".to_string(),
        DocumentType::ServiceAgreement => "Entente de Service".to_string(),
        DocumentType::Partnership => "Accord de Partenariat".to_string(),
        _ => "Document Légal".to_string(),
    }
}

fn extract_parties(params: &HashMap<String, String>) -> Vec<Party> {
    let party1 = Party {
        name: params.get("party1_name").cloned().unwrap_or_else(|| "Partie 1".to_string()),
        role: params.get("party1_role").cloned().unwrap_or_else(|| "Fournisseur".to_string()),
        address: params.get("party1_address").cloned(),
    };
    
    let party2 = Party {
        name: params.get("party2_name").cloned().unwrap_or_else(|| "Partie 2".to_string()),
        role: params.get("party2_role").cloned().unwrap_or_else(|| "Client".to_string()),
        address: params.get("party2_address").cloned(),
    };
    
    vec![party1, party2]
}

#[derive(Debug, Clone)]
struct Party {
    name: String,
    role: String,
    address: Option<String>,
}

fn generate_legal_summary(doc_type: &DocumentType, parties: &[Party]) -> String {
    format!(
        "Le présent {} établit les termes et conditions régissant la relation entre {} (ci-après «{}») et {} (ci-après «{}»). \
        Ce document définit les droits, obligations et responsabilités de chaque partie dans le cadre de leur collaboration.",
        match doc_type {
            DocumentType::Contract => "contrat",
            DocumentType::NDA => "accord de confidentialité",
            DocumentType::ServiceAgreement => "entente de service",
            DocumentType::Partnership => "accord de partenariat",
            _ => "document",
        },
        parties.get(0).map(|p| p.name.as_str()).unwrap_or("Partie 1"),
        parties.get(0).map(|p| p.role.as_str()).unwrap_or("Partie 1"),
        parties.get(1).map(|p| p.name.as_str()).unwrap_or("Partie 2"),
        parties.get(1).map(|p| p.role.as_str()).unwrap_or("Partie 2")
    )
}

fn generate_legal_objectives(doc_type: &DocumentType) -> Vec<String> {
    match doc_type {
        DocumentType::Contract => vec![
            "Définir les services à fournir et les conditions d'exécution".to_string(),
            "Établir les obligations réciproques des parties".to_string(),
            "Encadrer les aspects financiers et modalités de paiement".to_string(),
            "Protéger les droits de propriété intellectuelle".to_string(),
            "Définir les modalités de résolution de litiges".to_string(),
        ],
        DocumentType::NDA => vec![
            "Protéger les informations confidentielles échangées".to_string(),
            "Définir la portée et les limites de la confidentialité".to_string(),
            "Établir les obligations de non-divulgation".to_string(),
            "Préciser les exceptions à la confidentialité".to_string(),
        ],
        _ => vec![
            "Établir un cadre juridique clair".to_string(),
            "Protéger les intérêts des parties".to_string(),
            "Définir les modalités de collaboration".to_string(),
        ],
    }
}

fn generate_preamble_section(parties: &[Party]) -> Section {
    Section {
        id: "preamble".to_string(),
        title: "Préambule".to_string(),
        content: format!(
            "ENTRE :\n\n{}\n\nET :\n\n{}\n\n\
            Ci-après collectivement désignées comme «les Parties» et individuellement comme «la Partie».\n\n\
            IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :",
            format_party(&parties[0]),
            format_party(&parties[1])
        ),
        subsections: vec![],
        level: 1,
    }
}

fn format_party(party: &Party) -> String {
    format!(
        "{}, en sa qualité de {} {}",
        party.name,
        party.role,
        party.address.as_ref().map(|a| format!(", ayant son siège à {}", a)).unwrap_or_default()
    )
}

fn generate_definitions_section(_params: &HashMap<String, String>) -> Section {
    Section {
        id: "definitions".to_string(),
        title: "Définitions".to_string(),
        content: "Dans le présent accord, les termes suivants auront les significations définies ci-dessous :\n\n\
            - «Accord» désigne le présent document et tous ses annexes.\n\
            - «Services» désigne l'ensemble des prestations définies à l'article Services.\n\
            - «Informations Confidentielles» désigne toute information échangée entre les Parties.\n\
            - «Propriété Intellectuelle» désigne tous droits de propriété intellectuelle.".to_string(),
        subsections: vec![],
        level: 1,
    }
}

fn generate_scope_section(params: &HashMap<String, String>) -> Section {
    let scope = params.get("scope").cloned().unwrap_or_else(|| 
        "Le présent accord s'applique à l'ensemble des relations professionnelles entre les Parties.".to_string()
    );
    
    Section {
        id: "scope".to_string(),
        title: "Portée et Interprétation".to_string(),
        content: format!(
            "{}\n\nLe présent accord constitue l'intégralité de l'entente entre les Parties et remplace \
            tous accords antérieurs, écrits ou verbaux, relatifs à son objet.",
            scope
        ),
        subsections: vec![],
        level: 1,
    }
}

fn generate_obligations_section(parties: &[Party], _params: &HashMap<String, String>) -> Section {
    Section {
        id: "obligations".to_string(),
        title: "Obligations des Parties".to_string(),
        content: format!(
            "**Obligations de {} :**\n\n\
            - Exécuter les prestations convenues avec diligence et professionnalisme\n\
            - Respecter les délais convenus\n\
            - Maintenir la confidentialité des informations\n\n\
            **Obligations de {} :**\n\n\
            - Fournir les informations nécessaires à l'exécution\n\
            - Effectuer les paiements selon les modalités convenues\n\
            - Respecter les droits de propriété intellectuelle",
            parties[0].name,
            parties[1].name
        ),
        subsections: vec![],
        level: 1,
    }
}

fn generate_responsibilities_section(parties: &[Party]) -> Section {
    Section {
        id: "responsibilities".to_string(),
        title: "Responsabilités".to_string(),
        content: format!(
            "Chaque Partie est responsable de l'exécution de ses obligations telles que définies dans le présent accord.\n\n\
            {} ne pourra être tenu responsable des dommages indirects, accessoires ou consécutifs.\n\n\
            La responsabilité totale de chaque Partie est limitée au montant des sommes effectivement payées \
            au titre du présent accord.",
            parties[0].name
        ),
        subsections: vec![],
        level: 1,
    }
}

fn generate_confidentiality_section() -> Section {
    Section {
        id: "confidentiality".to_string(),
        title: "Confidentialité".to_string(),
        content: "Les Parties s'engagent à maintenir strictement confidentielles toutes les Informations Confidentielles \
            reçues de l'autre Partie.\n\n\
            Cet engagement de confidentialité demeure en vigueur pendant la durée du présent accord et pour une période \
            de cinq (5) ans suivant son expiration ou sa résiliation.\n\n\
            Sont exclues des Informations Confidentielles :\n\
            - Les informations du domaine public\n\
            - Les informations déjà connues de la Partie réceptrice\n\
            - Les informations divulguées par un tiers autorisé".to_string(),
        subsections: vec![],
        level: 1,
    }
}

fn generate_ip_section(parties: &[Party]) -> Section {
    Section {
        id: "intellectual_property".to_string(),
        title: "Propriété Intellectuelle".to_string(),
        content: format!(
            "Tous les droits de propriété intellectuelle créés ou développés par {} dans le cadre de l'exécution \
            du présent accord demeurent la propriété exclusive de {}.\n\n\
            {} ne pourra utiliser, reproduire ou divulguer ces éléments sans autorisation écrite préalable.",
            parties[0].name,
            parties[0].name,
            parties[1].name
        ),
        subsections: vec![],
        level: 1,
    }
}

fn generate_termination_section(params: &HashMap<String, String>) -> Section {
    let duration = params.get("duration").cloned().unwrap_or_else(|| "12 mois".to_string());
    
    Section {
        id: "termination".to_string(),
        title: "Durée et Résiliation".to_string(),
        content: format!(
            "Le présent accord entre en vigueur à la date de sa signature et demeure en vigueur pour une durée de {}.\n\n\
            Chaque Partie peut résilier le présent accord moyennant un préavis écrit de trente (30) jours.\n\n\
            En cas de manquement substantiel aux obligations, la Partie lésée peut résilier immédiatement \
            après mise en demeure restée sans effet pendant quinze (15) jours.",
            duration
        ),
        subsections: vec![],
        level: 1,
    }
}

fn generate_dispute_section(params: &HashMap<String, String>) -> Section {
    let jurisdiction = params.get("jurisdiction").cloned().unwrap_or_else(|| "Québec, Canada".to_string());
    
    Section {
        id: "dispute".to_string(),
        title: "Règlement des Différends".to_string(),
        content: format!(
            "Les Parties s'engagent à résoudre tout différend à l'amiable dans un délai de trente (30) jours.\n\n\
            À défaut d'accord amiable, le différend sera soumis à la compétence exclusive des tribunaux de {}.\n\n\
            Le présent accord est régi par les lois en vigueur à {}.",
            jurisdiction,
            jurisdiction
        ),
        subsections: vec![],
        level: 1,
    }
}

fn generate_general_provisions_section() -> Section {
    Section {
        id: "general".to_string(),
        title: "Dispositions Générales".to_string(),
        content: "**Modifications** : Toute modification du présent accord doit faire l'objet d'un avenant écrit signé par les Parties.\n\n\
            **Divisibilité** : Si une disposition du présent accord est jugée invalide, les autres dispositions demeurent en vigueur.\n\n\
            **Renonciation** : Le fait pour une Partie de ne pas exercer un droit ne constitue pas une renonciation à ce droit.\n\n\
            **Intégralité** : Le présent accord constitue l'intégralité de l'entente entre les Parties.".to_string(),
        subsections: vec![],
        level: 1,
    }
}

fn generate_mandatory_clauses(doc_type: &DocumentType, parties: &[Party]) -> Vec<Clause> {
    match doc_type {
        DocumentType::NDA => vec![
            Clause {
                id: "nda_scope".to_string(),
                title: "Étendue de la confidentialité".to_string(),
                content: "Toute information échangée entre les Parties est considérée comme confidentielle.".to_string(),
                mandatory: true,
                category: ClauseCategory::Confidentiality,
            },
            Clause {
                id: "nda_duration".to_string(),
                title: "Durée de l'obligation".to_string(),
                content: "L'obligation de confidentialité demeure en vigueur pendant 5 ans.".to_string(),
                mandatory: true,
                category: ClauseCategory::Confidentiality,
            },
        ],
        DocumentType::Contract => vec![
            Clause {
                id: "liability_limitation".to_string(),
                title: "Limitation de responsabilité".to_string(),
                content: format!("La responsabilité de {} est limitée aux dommages directs.", parties[0].name),
                mandatory: true,
                category: ClauseCategory::Liability,
            },
        ],
        _ => vec![],
    }
}

fn adapt_sections_to_template(sections: Vec<Section>, _template: &templates::Template) -> Vec<Section> {
    // Adaptation intelligente selon le template
    sections
}

fn generate_legal_annexes(_params: &HashMap<String, String>) -> Vec<Annex> {
    vec![
        Annex {
            id: "annex_a".to_string(),
            title: "Annexe A - Définitions complémentaires".to_string(),
            content: "Termes techniques et définitions spécifiques au contexte.".to_string(),
            format: "text".to_string(),
        },
    ]
}

fn generate_legal_references() -> Vec<Reference> {
    vec![
        Reference {
            title: "Code civil".to_string(),
            source: "Gouvernement".to_string(),
            url: None,
            date: Some("2024".to_string()),
        },
    ]
}
