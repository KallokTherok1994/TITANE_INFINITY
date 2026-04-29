// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — DEFAULT KNOWLEDGE BASE INITIALIZER
//   Charge la base de connaissance par défaut au démarrage.
//   Les données sont embarquées via include_str!() pour garantir
//   leur disponibilité immédiate à l'installation, sans réseau.
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

// ─────────────────────────────────────────────────────────────────
// EMBEDDED DEFAULT KNOWLEDGE (compile-time inclusion)
// include_str!() paths are relative to this source file
// ─────────────────────────────────────────────────────────────────

const ENGINES_CATALOG: &str =
    include_str!("../../data/knowledge_base/default/engines_catalog.json");
const IPC_COMMANDS_CATALOG: &str =
    include_str!("../../data/knowledge_base/default/ipc_commands_catalog.json");
const SYSTEM_ARCHITECTURE: &str =
    include_str!("../../data/knowledge_base/default/system_architecture.json");
const IDENTITY_PROFILE: &str =
    include_str!("../../data/knowledge_base/default/identity_profile.json");
const CAPABILITIES_MATRIX: &str =
    include_str!("../../data/knowledge_base/default/capabilities_matrix.json");
const RESPONSE_GUIDELINES: &str =
    include_str!("../../data/knowledge_base/default/response_guidelines.json");
const OPERATIONAL_KNOWLEDGE: &str =
    include_str!("../../data/knowledge_base/default/operational_knowledge.json");
// ── v30.0.0 expansion — phase 1 ────────────────────────────────────────────
const CONSTITUTION_ETHICS: &str =
    include_str!("../../data/knowledge_base/default/constitution_ethics.json");
const MEMORY_SYSTEM_DEEP: &str =
    include_str!("../../data/knowledge_base/default/memory_system_deep.json");
const AI_PROVIDERS_GUIDE: &str =
    include_str!("../../data/knowledge_base/default/ai_providers_guide.json");
const FRONTEND_MODULES: &str =
    include_str!("../../data/knowledge_base/default/frontend_modules.json");
const DIGITAL_TWIN_SYMBIOSIS: &str =
    include_str!("../../data/knowledge_base/default/digital_twin_symbiosis.json");
const SECURITY_PRIVACY: &str =
    include_str!("../../data/knowledge_base/default/security_privacy.json");
const CLOUD_MULTIMODAL: &str =
    include_str!("../../data/knowledge_base/default/cloud_multimodal.json");
const TROUBLESHOOTING_FAQ: &str =
    include_str!("../../data/knowledge_base/default/troubleshooting_faq.json");
const LEARNING_PROMPTS: &str =
    include_str!("../../data/knowledge_base/default/learning_prompts.json");
const SERVICES_BACKEND: &str =
    include_str!("../../data/knowledge_base/default/services_backend.json");
// ── v30.0.0 expansion — phase 2 (réflexion approfondie, en français) ───────
const SINGULARITY_OS_DETAIL: &str =
    include_str!("../../data/knowledge_base/default/singularity_os_detail.json");
const OMEGA_PIPELINE_DETAIL: &str =
    include_str!("../../data/knowledge_base/default/omega_pipeline_detail.json");
const AGENTS_MULTI_SYSTEME: &str =
    include_str!("../../data/knowledge_base/default/agents_multi_systeme.json");
const META_MODE_TITANE: &str =
    include_str!("../../data/knowledge_base/default/meta_mode_titane.json");
const APPRENTISSAGE_EVOLUTION: &str =
    include_str!("../../data/knowledge_base/default/apprentissage_evolution.json");
const HYPER_INTELLIGENCE: &str =
    include_str!("../../data/knowledge_base/default/hyper_intelligence.json");
const META_ORCHESTRATEUR: &str =
    include_str!("../../data/knowledge_base/default/meta_orchestrateur.json");
const PHILOSOPHIE_COGNITIVE: &str =
    include_str!("../../data/knowledge_base/default/philosophie_cognitive.json");
// ── v30.0.0 expansion — phase 3 (conversation, mémoire, twin, style) ────────
const CONVERSATION_ENGINE_DETAIL: &str =
    include_str!("../../data/knowledge_base/default/conversation_engine_detail.json");
const MEMORY_OS_DETAIL: &str =
    include_str!("../../data/knowledge_base/default/memory_os_detail.json");
const NUMERIC_TWIN_DETAIL: &str =
    include_str!("../../data/knowledge_base/default/numeric_twin_detail.json");
const DIGITAL_TWIN_V14_DETAIL: &str =
    include_str!("../../data/knowledge_base/default/digital_twin_v14_detail.json");
const STYLE_EXPRESSION_KEVIN: &str =
    include_str!("../../data/knowledge_base/default/style_expression_kevin.json");
const TITANE_IDENTITY_KERNEL_V31: &str =
    include_str!("../../data/knowledge_base/default/titane_identity_kernel_v31.json");
const TITANE_RUNTIME_RULES_V31: &str =
    include_str!("../../data/knowledge_base/default/titane_runtime_rules_v31.json");
const TITANE_PUBLIC_POSITIONING_V31: &str =
    include_str!("../../data/knowledge_base/default/titane_public_positioning_v31.json");
const INTELLIGENCE_EMOTIONNELLE: &str =
    include_str!("../../data/knowledge_base/default/intelligence_emotionnelle.json");
const COHERENCE_IDENTITAIRE: &str =
    include_str!("../../data/knowledge_base/default/coherence_identitaire.json");
const REALISME_CONVERSATIONNEL: &str =
    include_str!("../../data/knowledge_base/default/realisme_conversationnel.json");
// ── v30.0.0 expansion — phase 11 (organisation/finance/e-commerce/SEO/devweb/branding/marketing) ─
const ORGANISATION_PERSONNELLE: &str =
    include_str!("../../data/knowledge_base/default/organisation_personnelle.json");
const FINANCE_ENTREPRISE: &str =
    include_str!("../../data/knowledge_base/default/finance_entreprise.json");
const ECOMMERCE_FONDAMENTAUX: &str =
    include_str!("../../data/knowledge_base/default/ecommerce_fondamentaux.json");
const SEO_REFERENCEMENT: &str =
    include_str!("../../data/knowledge_base/default/seo_referencement.json");
const DEVELOPPEMENT_WEB: &str =
    include_str!("../../data/knowledge_base/default/developpement_web.json");
const BRANDING_IDENTITE: &str =
    include_str!("../../data/knowledge_base/default/branding_identite.json");
const MARKETING_DIGITAL: &str =
    include_str!("../../data/knowledge_base/default/marketing_digital.json");

// ── v30.0.0 expansion — phase 10 (administration, communication, stratégie) ─
const ADMINISTRATION_PUBLIQUE: &str =
    include_str!("../../data/knowledge_base/default/administration_publique.json");
const MANAGEMENT_ADMINISTRATION: &str =
    include_str!("../../data/knowledge_base/default/management_administration.json");
const COMMUNICATION_INSTITUTIONNELLE: &str =
    include_str!("../../data/knowledge_base/default/communication_institutionnelle.json");
const COMMUNICATION_CRISE: &str =
    include_str!("../../data/knowledge_base/default/communication_crise.json");
const STRATEGIE_ENTREPRISE: &str =
    include_str!("../../data/knowledge_base/default/strategie_entreprise.json");
const STRATEGIE_CONCURRENTIELLE: &str =
    include_str!("../../data/knowledge_base/default/strategie_concurrentielle.json");
const GESTION_PROJET_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/gestion_projet_avancee.json");
const NEGOCIATION_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/negociation_avancee.json");

// ── v30.0.0 expansion — phase 9 (rédaction pro, analyse, qualité, notariat) ─
const REDACTION_PROFESSIONNELLE: &str =
    include_str!("../../data/knowledge_base/default/redaction_professionnelle.json");
const ANALYSE_PROFESSIONNELLE: &str =
    include_str!("../../data/knowledge_base/default/analyse_professionnelle.json");
const MANAGEMENT_QUALITE: &str =
    include_str!("../../data/knowledge_base/default/management_qualite.json");
const METIER_QUALITE: &str = include_str!("../../data/knowledge_base/default/metier_qualite.json");
const DROIT_NOTARIAL_FONDAMENTAUX: &str =
    include_str!("../../data/knowledge_base/default/droit_notarial_fondamentaux.json");
const ACTES_NOTARIAUX: &str =
    include_str!("../../data/knowledge_base/default/actes_notariaux.json");
const DROIT_IMMOBILIER_NOTARIAL: &str =
    include_str!("../../data/knowledge_base/default/droit_immobilier_notarial.json");
const REDACTION_ACTES_JURIDIQUES: &str =
    include_str!("../../data/knowledge_base/default/redaction_actes_juridiques.json");

// ── v30.0.0 expansion — phase 8 (musculation, sommeil, chronobiologie, cognitif, productivité, finances, entrepreneuriat, sexualité) ─
const MUSCULATION_FORCE: &str =
    include_str!("../../data/knowledge_base/default/musculation_force.json");
const SOMMEIL_OPTIMISE: &str =
    include_str!("../../data/knowledge_base/default/sommeil_optimise.json");
const CHRONOBIOLOGIE_RYTHMES: &str =
    include_str!("../../data/knowledge_base/default/chronobiologie_rythmes.json");
const PERFORMANCE_COGNITIVE: &str =
    include_str!("../../data/knowledge_base/default/performance_cognitive.json");
const GESTION_TEMPS_PRODUCTIVITE: &str =
    include_str!("../../data/knowledge_base/default/gestion_temps_productivite.json");
const FINANCES_PERSONNELLES: &str =
    include_str!("../../data/knowledge_base/default/finances_personnelles.json");
const ENTREPRENEURIAT_MINDSET: &str =
    include_str!("../../data/knowledge_base/default/entrepreneuriat_mindset.json");
const SEXUALITE_INTIMITE: &str =
    include_str!("../../data/knowledge_base/default/sexualite_intimite.json");

// ── v30.0.0 expansion — phase 7 (nutrition avancée, callisthénie, méditation, yoga) ─
const NUTRITION_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/nutrition_avancee.json");
const CALISTHENIE: &str = include_str!("../../data/knowledge_base/default/calisthenie.json");
const MEDITATION_PRATIQUE: &str =
    include_str!("../../data/knowledge_base/default/meditation_pratique.json");
const YOGA_PRATIQUE: &str = include_str!("../../data/knowledge_base/default/yoga_pratique.json");

// ── v30.0.0 expansion — phase 6 (approfondissement santé naturelle & communication) ──
const ENERGETIQUE_SOINS_CORPS: &str =
    include_str!("../../data/knowledge_base/default/energetique_soins_corps.json");
const SANTE_FEMININE_NATURELLE: &str =
    include_str!("../../data/knowledge_base/default/sante_feminine_naturelle.json");
const LONGEVITE_ANTI_AGING: &str =
    include_str!("../../data/knowledge_base/default/longevite_anti_aging.json");
const COACHING_LEADERSHIP: &str =
    include_str!("../../data/knowledge_base/default/coaching_leadership.json");
const RELATIONS_HUMAINES_PROFONDES: &str =
    include_str!("../../data/knowledge_base/default/relations_humaines_profondes.json");
const SPIRITUALITE_SENS_EXISTENCE: &str =
    include_str!("../../data/knowledge_base/default/spiritualite_sens_existence.json");
const IMMUNITE_PREVENTION_NATURELLE: &str =
    include_str!("../../data/knowledge_base/default/immunite_prevention_naturelle.json");
const ECRITURE_EXPRESSION_CREATRICE: &str =
    include_str!("../../data/knowledge_base/default/ecriture_expression_creatrice.json");

// ── v30.0.0 expansion — phase 5 (développement personnel, naturopathie, médecine naturelle) ──
const DEVELOPPEMENT_PERSONNEL: &str =
    include_str!("../../data/knowledge_base/default/developpement_personnel.json");
const NATUROPATHIE_FONDAMENTAUX: &str =
    include_str!("../../data/knowledge_base/default/naturopathie_fondamentaux.json");
const MEDECINE_HOLLISTIQUE: &str =
    include_str!("../../data/knowledge_base/default/medecine_hollistique.json");
const NUTRITION_SANTE_NATURELLE: &str =
    include_str!("../../data/knowledge_base/default/nutrition_sante_naturelle.json");
const PLANTES_MEDICINALES_AROMATHERAPIE: &str =
    include_str!("../../data/knowledge_base/default/plantes_medicinales_aromatherapie.json");
const COMMUNICATION_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/communication_avancee.json");
const BIEN_ETRE_MENTAL_STRESS: &str =
    include_str!("../../data/knowledge_base/default/bien_etre_mental_stress.json");
const SANTE_CORPS_NATURELLE: &str =
    include_str!("../../data/knowledge_base/default/sante_corps_naturelle.json");
// ── v30.0.0 expansion — phase 14 (art, artisanat, rénovation, sciences, biologie, technologie, politique, décoration, photographie, botanique, faune, chakras, astrologie) ─
const ART_HISTOIRE_PRATIQUE: &str =
    include_str!("../../data/knowledge_base/default/art_histoire_pratique.json");
const ARTISANAT_CREATION_MANUELLE: &str =
    include_str!("../../data/knowledge_base/default/artisanat_creation_manuelle.json");
const RENOVATION_BRICOLAGE_HABITAT: &str =
    include_str!("../../data/knowledge_base/default/renovation_bricolage_habitat.json");
const SCIENCE_PHYSIQUE_CHIMIE: &str =
    include_str!("../../data/knowledge_base/default/science_physique_chimie.json");
const BIOLOGIE_SCIENCES_VIVANT: &str =
    include_str!("../../data/knowledge_base/default/biologie_sciences_vivant.json");
const TECHNOLOGIE_INNOVATION_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/technologie_innovation_avancee.json");
const POLITIQUE_GEOPOLITIQUE: &str =
    include_str!("../../data/knowledge_base/default/politique_geopolitique.json");
const DECORATION_INTERIEURE_DESIGN: &str =
    include_str!("../../data/knowledge_base/default/decoration_interieure_design.json");
const PHOTOGRAPHIE_ANALYSE_IMAGE: &str =
    include_str!("../../data/knowledge_base/default/photographie_analyse_image.json");
const ARBRES_PLANTES_FLEURS: &str =
    include_str!("../../data/knowledge_base/default/arbres_plantes_fleurs.json");
const ANIMAUX_OISEAUX_FAUNE: &str =
    include_str!("../../data/knowledge_base/default/animaux_oiseaux_faune.json");
const CHAKRAS_ENERGIE_SPIRITUELLE: &str =
    include_str!("../../data/knowledge_base/default/chakras_energie_spirituelle.json");
const ASTROLOGIE_NUMEROLOGIE: &str =
    include_str!("../../data/knowledge_base/default/astrologie_numerologie.json");

// ── v30.0.0 expansion — phase 13 VISIONNAIRE_2.0 (bourse/crypto/immobilier/ecommerce/dropship/freelance/infoproduits/automation/fiscalité/mindset argent) ─
const BOURSE_TRADING_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/bourse_trading_avance.json");
const CRYPTO_BLOCKCHAIN_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/crypto_blockchain_avance.json");
const INVESTISSEMENT_IMMOBILIER_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/investissement_immobilier_avance.json");
const ECOMMERCE_SCALING_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/ecommerce_scaling_avance.json");
const DROPSHIPPING_PRINT_ON_DEMAND: &str =
    include_str!("../../data/knowledge_base/default/dropshipping_print_on_demand.json");

// ── v31.2.0 expansion — phase 20 (facebook-ads-avancé, google-ads-avancé, boutique-mode-déco, art-canvas, wix, fiche-produit-seo) ─
const FACEBOOK_BUSINESS_MARKETING_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/facebook_business_marketing_avance.json");
const GOOGLE_ADS_MARKETING_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/google_ads_marketing_avance.json");
const BOUTIQUE_MODE_DECORATION_EN_LIGNE: &str =
    include_str!("../../data/knowledge_base/default/boutique_mode_decoration_en_ligne.json");
const VENTE_ART_CANVAS_EN_LIGNE: &str =
    include_str!("../../data/knowledge_base/default/vente_art_canvas_en_ligne.json");
const WIX_PLATEFORME_ECOMMERCE: &str =
    include_str!("../../data/knowledge_base/default/wix_plateforme_ecommerce.json");
const FICHE_PRODUIT_REDACTION_SEO_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/fiche_produit_redaction_seo_avancee.json");

// ── v31.3.0 expansion — phase 21 (printful/etsy, email-automation, pinterest/tiktok, seo-technique, CRO, analytics-kpis) ─
const PRINTFUL_ETSY_INTEGRATION_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/printful_etsy_integration_avancee.json");
const EMAIL_MARKETING_ECOMMERCE_AUTOMATION: &str =
    include_str!("../../data/knowledge_base/default/email_marketing_ecommerce_automation.json");
const PINTEREST_TIKTOK_MARKETING_ECOMMERCE: &str =
    include_str!("../../data/knowledge_base/default/pinterest_tiktok_marketing_ecommerce.json");
const SEO_TECHNIQUE_ECOMMERCE_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/seo_technique_ecommerce_avance.json");
const CONVERSION_RATE_OPTIMIZATION: &str =
    include_str!("../../data/knowledge_base/default/conversion_rate_optimization.json");
const ANALYTICS_KPIS_ECOMMERCE_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/analytics_kpis_ecommerce_avance.json");

// ── v31.3.0 expansion — phase 22 (réseaux-sociaux-organique, publicité-retargeting, dropshipping-pod, service-client, identité-visuelle, finances-trésorerie) ─
const RESEAUX_SOCIAUX_CONTENU_ORGANIQUE: &str =
    include_str!("../../data/knowledge_base/default/reseaux_sociaux_contenu_organique.json");
const PUBLICITE_RETARGETING_STRATEGIES: &str =
    include_str!("../../data/knowledge_base/default/publicite_retargeting_strategies.json");
const DROPSHIPPING_PRINT_ON_DEMAND_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/dropshipping_print_on_demand_avance.json");
const SERVICE_CLIENT_EXCELLENCE_ECOMMERCE: &str =
    include_str!("../../data/knowledge_base/default/service_client_excellence_ecommerce.json");
const CREATION_IDENTITE_VISUELLE_MARQUE: &str =
    include_str!("../../data/knowledge_base/default/creation_identite_visuelle_marque.json");
const FINANCES_TRESORERIE_ECOMMERCE: &str =
    include_str!("../../data/knowledge_base/default/finances_tresorerie_ecommerce.json");

// ── v31.2.13 expansion — phase 23 (lancement-produit, psychologie-achat, automatisation, tendances-design, wholesale-b2b, strategie-prix, multi-canal, copywriting) ─
const LANCEMENT_PRODUIT_CAMPAGNE_MARKETING: &str =
    include_str!("../../data/knowledge_base/default/lancement_produit_campagne_marketing.json");
const PSYCHOLOGIE_ACHAT_NEUROMARKETING: &str =
    include_str!("../../data/knowledge_base/default/psychologie_achat_neuromarketing.json");
const AUTOMATISATION_WORKFLOWS_ECOMMERCE: &str =
    include_str!("../../data/knowledge_base/default/automatisation_workflows_ecommerce.json");
const TENDANCES_MARCHE_DESIGN_2025_2026: &str =
    include_str!("../../data/knowledge_base/default/tendances_marche_design_2025_2026.json");
const WHOLESALE_B2B_BOUTIQUES_PHYSIQUES: &str =
    include_str!("../../data/knowledge_base/default/wholesale_b2b_boutiques_physiques.json");
const STRATEGIE_PRIX_RENTABILITE_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/strategie_prix_rentabilite_avancee.json");
const MARKETPLACE_MULTI_CANAL_EXPANSION: &str =
    include_str!("../../data/knowledge_base/default/marketplace_multi_canal_expansion.json");
const COPYWRITING_PERSUASIF_VENTE: &str =
    include_str!("../../data/knowledge_base/default/copywriting_persuasif_vente.json");

const FREELANCE_CONSULTING_PREMIUM: &str =
    include_str!("../../data/knowledge_base/default/freelance_consulting_premium.json");
const INFOPRODUITS_FORMATIONS_EN_LIGNE: &str =
    include_str!("../../data/knowledge_base/default/infoproduits_formations_en_ligne.json");
const AUTOMATISATION_REVENUS_PASSIFS: &str =
    include_str!("../../data/knowledge_base/default/automatisation_revenus_passifs.json");
const FISCALITE_OPTIMISATION_PATRIMOINE: &str =
    include_str!("../../data/knowledge_base/default/fiscalite_optimisation_patrimoine.json");
const MINDSET_FINANCIER_WEALTH: &str =
    include_str!("../../data/knowledge_base/default/mindset_financier_wealth.json");

// ── v30.0.0 expansion — phase 15 (charisme/séduction, ikigai/valeurs, SN polyvagal, neurosciences/conscience, réseaux sociaux, histoire/civilisations, peuples anciens, religions/mythologies, cycles lune, géologie) ─
const CHARISME_SEDUCTION_PRESENCE: &str =
    include_str!("../../data/knowledge_base/default/charisme_seduction_presence.json");
const IKIGAI_VALEURS_SENS: &str =
    include_str!("../../data/knowledge_base/default/ikigai_valeurs_sens.json");
const SYSTEME_NERVEUX_POLYVAGAL: &str =
    include_str!("../../data/knowledge_base/default/systeme_nerveux_polyvagal.json");
const NEUROSCIENCES_CONSCIENCE: &str =
    include_str!("../../data/knowledge_base/default/neurosciences_conscience.json");
const RESEAUX_SOCIAUX_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/reseaux_sociaux_avance.json");
const HISTOIRE_CIVILISATIONS: &str =
    include_str!("../../data/knowledge_base/default/histoire_civilisations.json");
const PEUPLES_ANCIENS_MYSTIQUES: &str =
    include_str!("../../data/knowledge_base/default/peuples_anciens_mystiques.json");
const RELIGIONS_ET_MYTHOLOGIES: &str =
    include_str!("../../data/knowledge_base/default/religions_et_mythologies.json");
const CYCLES_NATURELS_ENERGIE_LUNE: &str =
    include_str!("../../data/knowledge_base/default/cycles_naturels_energie_lune.json");
const GEOLOGIE_MINERAUX_TERRE: &str =
    include_str!("../../data/knowledge_base/default/geologie_mineraux_terre.json");

// ── v30.0.0 expansion — phase 16 (langages prog, outils dev, Firebase/cloud, Adobe design, Office, Google Workspace, formats fichiers, IA pratique, Unity/game dev, web design UI/UX) ─
const LANGAGES_PROGRAMMATION_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/langages_programmation_avance.json");
const ENVIRONNEMENTS_DEV_OUTILS: &str =
    include_str!("../../data/knowledge_base/default/environnements_dev_outils.json");
const FIREBASE_BACKEND_CLOUD: &str =
    include_str!("../../data/knowledge_base/default/firebase_backend_cloud.json");
const DESIGN_GRAPHIQUE_ADOBE: &str =
    include_str!("../../data/knowledge_base/default/design_graphique_adobe.json");
const SUITE_OFFICE_MICROSOFT: &str =
    include_str!("../../data/knowledge_base/default/suite_office_microsoft.json");
const SUITE_GOOGLE_WORKSPACE: &str =
    include_str!("../../data/knowledge_base/default/suite_google_workspace.json");
const FORMATS_FICHIERS_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/formats_fichiers_avance.json");
const INTELLIGENCE_ARTIFICIELLE_PRATIQUE: &str =
    include_str!("../../data/knowledge_base/default/intelligence_artificielle_pratique.json");
const DEVELOPPEMENT_JEUX_UNITY: &str =
    include_str!("../../data/knowledge_base/default/developpement_jeux_unity.json");
const WEB_DESIGN_UI_UX: &str =
    include_str!("../../data/knowledge_base/default/web_design_ui_ux.json");
const SYNCHRONISATION_ORCHESTRATION: &str =
    include_str!("../../data/knowledge_base/default/synchronisation_orchestration.json");

// ── v30.0.0 expansion — phase 17 (bourse, crypto, cuisine, droit, énergie, jeux vidéo, musique, voyage) ─
const BOURSE_TRADING: &str = include_str!("../../data/knowledge_base/default/bourse_trading.json");
const CRYPTO_BLOCKCHAIN: &str =
    include_str!("../../data/knowledge_base/default/crypto_blockchain.json");
const CUISINE_GASTRONOMIE: &str =
    include_str!("../../data/knowledge_base/default/cuisine_gastronomie.json");
const DROIT_CONTRATS_PRATIQUE: &str =
    include_str!("../../data/knowledge_base/default/droit_contrats_pratique.json");
const ENERGIE_RENOUVELABLE: &str =
    include_str!("../../data/knowledge_base/default/energie_renouvelable.json");
const JEUX_VIDEO_CULTURE: &str =
    include_str!("../../data/knowledge_base/default/jeux_video_culture.json");
const MUSIQUE_THEORIE_PRATIQUE: &str =
    include_str!("../../data/knowledge_base/default/musique_theorie_pratique.json");
const VOYAGE_EXPLORATION: &str =
    include_str!("../../data/knowledge_base/default/voyage_exploration.json");

// ── v30.0.0 expansion — phase 12 (finance avancée, revenus, applications, copywriting, sites web, poésie, droit, vie pro/perso, coaching, médecine naturelle, revenus en ligne, peak performance, santé mentale, growth marketing) ─
const STRATEGIES_REVENUS_MONETISATION: &str =
    include_str!("../../data/knowledge_base/default/strategies_revenus_monetisation.json");
const INVESTISSEMENT_PATRIMOINE: &str =
    include_str!("../../data/knowledge_base/default/investissement_patrimoine.json");
const CREATION_APPLICATIONS_SAAS: &str =
    include_str!("../../data/knowledge_base/default/creation_applications_saas.json");
const COPYWRITING_CONTENT_MARKETING: &str =
    include_str!("../../data/knowledge_base/default/copywriting_content_marketing.json");
const CREATION_SITES_WEB_PRATIQUE: &str =
    include_str!("../../data/knowledge_base/default/creation_sites_web_pratique.json");
const POESIE_ECRITURE_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/poesie_ecriture_avancee.json");
const DROIT_PRATIQUE_QUOTIDIEN: &str =
    include_str!("../../data/knowledge_base/default/droit_pratique_quotidien.json");
const EQUILIBRE_VIE_PRO_PERSO: &str =
    include_str!("../../data/knowledge_base/default/equilibre_vie_pro_perso.json");
const COACHING_TRANSFORMATION_PERSONNELLE: &str =
    include_str!("../../data/knowledge_base/default/coaching_transformation_personnelle.json");
const MEDECINE_NATURELLE_PRATIQUE: &str =
    include_str!("../../data/knowledge_base/default/medecine_naturelle_pratique.json");
const REVENUS_EN_LIGNE_AFFILIATION: &str =
    include_str!("../../data/knowledge_base/default/revenus_en_ligne_affiliation.json");
const PLEIN_POTENTIEL_PEAK_PERFORMANCE: &str =
    include_str!("../../data/knowledge_base/default/plein_potentiel_peak_performance.json");
const SANTE_MENTALE_THERAPIES: &str =
    include_str!("../../data/knowledge_base/default/sante_mentale_therapies.json");
const MARKETING_AFFILIATION_GROWTH: &str =
    include_str!("../../data/knowledge_base/default/marketing_affiliation_growth.json");

// ── v30.0.0 expansion — phase 4 (communication & psychologie FR) ────────────
const COMMUNICATION_INTERPERSONNELLE: &str =
    include_str!("../../data/knowledge_base/default/communication_interpersonnelle.json");
const PSYCHOLOGIE_COGNITIVE: &str =
    include_str!("../../data/knowledge_base/default/psychologie_cognitive.json");
const PSYCHOLOGIE_EMOTIONNELLE: &str =
    include_str!("../../data/knowledge_base/default/psychologie_emotionnelle.json");
const PSYCHOLOGIE_MOTIVATION: &str =
    include_str!("../../data/knowledge_base/default/psychologie_motivation.json");
const PSYCHOLOGIE_COMPORTEMENTALE: &str =
    include_str!("../../data/knowledge_base/default/psychologie_comportementale.json");
const COMMUNICATION_PERSUASION: &str =
    include_str!("../../data/knowledge_base/default/communication_persuasion.json");
const PSYCHOLOGIE_RELATIONS: &str =
    include_str!("../../data/knowledge_base/default/psychologie_relations.json");
const PSYCHOLOGIE_PERFORMANCE: &str =
    include_str!("../../data/knowledge_base/default/psychologie_performance.json");
// ── v30.1.0 expansion — connaissances avancées bien-être, neurosciences, thérapies ──
const NEUROCHIMIE_BONHEUR: &str =
    include_str!("../../data/knowledge_base/default/neurochimie_bonheur.json");
const LANGAGE_CORPOREL_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/langage_corporel_avance.json");
const COMMUNICATION_PROFESSIONNELLE_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/communication_professionnelle_avancee.json");
const CHIROPRATIQUE_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/chiropratique_avancee.json");
const ACUPUNCTURE_ACUPRESSION_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/acupuncture_acupression_avancee.json");
const PHYSIOTHERAPIE_OSTEOPATHIE_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/physiotherapie_osteopathie_avancee.json");
const MASSAGE_THERAPEUTIQUE_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/massage_therapeutique_avance.json");
const YOGA_KUNDALINI_MAITRE: &str =
    include_str!("../../data/knowledge_base/default/yoga_kundalini_maitre.json");
const THERAPIES_ALTERNATIVES_CREATIVES: &str =
    include_str!("../../data/knowledge_base/default/therapies_alternatives_creatives.json");
const PHYTOTHERAPIE_REMEDES_ELIXIRS: &str =
    include_str!("../../data/knowledge_base/default/phytotherapie_remedes_elixirs.json");
const CERVEAU_HUMAIN_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/cerveau_humain_avance.json");
const DEPRESSION_BURNOUT_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/depression_burnout_avance.json");
const GESTION_ENERGIE_VITALITE: &str =
    include_str!("../../data/knowledge_base/default/gestion_energie_vitalite.json");
const CULTURE_JAPONAISE_SAGESSE: &str =
    include_str!("../../data/knowledge_base/default/culture_japonaise_sagesse.json");
// v30.1.0 expansion — phase 19 (MTC avancée, Ayurveda, microbiome, hormones, respiration, Qi Gong, hypnose/PNL, trauma/résilience, détox/jeûne, réflexologie, sophrologie, santé masculine, médecine fonctionnelle, aromathérapie, psychologie positive)
const MEDECINE_TRADITIONNELLE_CHINOISE_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/medecine_traditionnelle_chinoise_avancee.json");
const AYURVEDA_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/ayurveda_avance.json");
const MICROBIOME_AXE_INTESTIN_CERVEAU: &str =
    include_str!("../../data/knowledge_base/default/microbiome_axe_intestin_cerveau.json");
const SYSTEME_HORMONAL_ENDOCRINIEN: &str =
    include_str!("../../data/knowledge_base/default/systeme_hormonal_endocrinien.json");
const RESPIRATION_PRANAYAMA_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/respiration_pranayama_avance.json");
const QI_GONG_TAI_CHI_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/qi_gong_tai_chi_avance.json");
const HYPNOTHERAPIE_PNL_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/hypnotherapie_pnl_avancee.json");
const TRAUMATISME_RESILIENCE_AVANCE: &str =
    include_str!("../../data/knowledge_base/default/traumatisme_resilience_avance.json");
const DETOX_JEUNE_PURIFICATION: &str =
    include_str!("../../data/knowledge_base/default/detox_jeune_purification.json");
const REFLEXOLOGIE_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/reflexologie_avancee.json");
const SOPHROLOGIE_RELAXATION_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/sophrologie_relaxation_avancee.json");
const SANTE_MASCULINE_NATURELLE: &str =
    include_str!("../../data/knowledge_base/default/sante_masculine_naturelle.json");
const MEDECINE_FONCTIONNELLE_INTEGRATIVE: &str =
    include_str!("../../data/knowledge_base/default/medecine_fonctionnelle_integrative.json");
const AROMATHERAPIE_AVANCEE: &str =
    include_str!("../../data/knowledge_base/default/aromatherapie_avancee.json");
const PSYCHOLOGIE_POSITIVE_SCIENCE_BONHEUR: &str =
    include_str!("../../data/knowledge_base/default/psychologie_positive_science_bonheur.json");
// v30.1.0 expansion — phase 20 (PNL maître, hypnose maître, thérapie systémique, coaching génératif, TCC 3e vague, AT/psychogénéalogie)
const PNL_MAITRE_PRATICIEN: &str =
    include_str!("../../data/knowledge_base/default/pnl_maitre_praticien.json");
const HYPNOSE_MAITRE_PRATICIEN: &str =
    include_str!("../../data/knowledge_base/default/hypnose_maitre_praticien.json");
const THERAPIE_SYSTEMIQUE_FAMILIALE: &str =
    include_str!("../../data/knowledge_base/default/therapie_systemique_familiale.json");
const COACHING_GENERATIF_DILTS_GILLIGAN: &str =
    include_str!("../../data/knowledge_base/default/coaching_generatif_dilts_gilligan.json");
const TCC_TROISIEME_VAGUE: &str =
    include_str!("../../data/knowledge_base/default/tcc_troisieme_vague.json");
const ANALYSE_TRANSACTIONNELLE_PSYCHOGENEALOGIE: &str = include_str!(
    "../../data/knowledge_base/default/analyse_transactionnelle_psychogenealogie.json"
);
// ── v31.3.1 expansion — phase 24 (psychologie toxique, profils, manipulation) ──
const PSYCHOLOGIE_TOXIQUE_PROFILS: &str =
    include_str!("../../data/knowledge_base/default/psychologie_toxique_profils.json");
// ── v31.3.2 expansion — phase 25 (stratégies protection, récupération abus) ──
const STRATEGIES_PROTECTION_MANIPULATION: &str =
    include_str!("../../data/knowledge_base/default/strategies_protection_manipulation.json");
// ── v31.3.3 expansion — phase 26 (traumatologie complexe, C-PTSD, polyvagal, 4F) ──
const TRAUMATOLOGIE_COMPLEXE: &str =
    include_str!("../../data/knowledge_base/default/traumatologie_complexe.json");
// ── v31.3.4 expansion — phase 26 (neuroscience de l'attachement, styles adultes) ──
const NEUROSCIENCE_ATTACHEMENT: &str =
    include_str!("../../data/knowledge_base/default/neuroscience_attachement.json");
// ── v31.3.5 expansion — phase 27 (dépendance affective, codépendance, trauma bonding, fawn) ──
const DEPENDANCE_AFFECTIVE_CODEPENDANCE: &str =
    include_str!("../../data/knowledge_base/default/dependance_affective_codependance.json");
// ── v31.3.6 expansion — phase 27 (EMDR, IFS, SE, AEDP, schema therapy modes) ──
const THERAPIES_TRAUMA_AVANCEES: &str =
    include_str!("../../data/knowledge_base/default/therapies_trauma_avancees.json");
// ── v31.3.7 expansion — phase 28 (CNV, OSBD, assertivité, Gottman) ──
const COMMUNICATION_NON_VIOLENTE_RELATIONS: &str =
    include_str!("../../data/knowledge_base/default/communication_non_violente_relations.json");
// ── v31.3.8 expansion — phase 28 (deuil, rupture, transitions majeures) ──
const DEUIL_RUPTURE_TRANSITIONS: &str =
    include_str!("../../data/knowledge_base/default/deuil_rupture_transitions.json");
// ── v31.3.9 expansion — phase 29 (TCC, Beck, CBT, ACT, MBCT, protocoles) ──
const THERAPIES_COGNITIVES_COMPORTEMENTALES: &str =
    include_str!("../../data/knowledge_base/default/therapies_cognitives_comportementales.json");
// ── v31.3.10 expansion — phase 29 (santé mentale, résilience, burnout, PERMA) ──
const SANTE_MENTALE_PREVENTION_RESILIENCE: &str =
    include_str!("../../data/knowledge_base/default/sante_mentale_prevention_resilience.json");
// ── v31.4.1 expansion — phase 30 (neurodiversité : ADHD, TSA, HPI) ──
const NEURODIVERSITE_ADHD_AUTISME_HPI: &str =
    include_str!("../../data/knowledge_base/default/neurodiversite_adhd_autisme_hpi.json");
// ── v31.4.2 expansion — phase 30 (DBT avancé : distress tolerance, colère, honte) ──
const EMOTION_REGULATION_DBT_ADVANCED: &str =
    include_str!("../../data/knowledge_base/default/emotion_regulation_dbt_advanced.json");
// ── v31.4.3 expansion — phase 31 (thérapies humanistes et existentielles) ──
const THERAPIES_HUMANISTES_EXISTENTIELLES: &str =
    include_str!("../../data/knowledge_base/default/therapies_humanistes_existentielles.json");
// ── v31.4.4 expansion — phase 31 (psychodynamique : mécanismes de défense) ──
const PSYCHODYNAMIQUE_MECANISMES_DEFENSE: &str =
    include_str!("../../data/knowledge_base/default/psychodynamique_mecanismes_defense.json");
// ── v31.4.5 expansion — phase 32 (addiction et entretien motivationnel) ──
const ADDICTION_ENTRETIEN_MOTIVATIONNEL: &str =
    include_str!("../../data/knowledge_base/default/addiction_entretien_motivationnel.json");
// ── v31.4.6 expansion — phase 32 (intimité, sexualité, couples EFT) ──
const INTIMITE_SEXUALITE_COUPLES_EFT: &str =
    include_str!("../../data/knowledge_base/default/intimite_sexualite_couples_eft.json");
// ── v31.4.7 expansion — phase 33 (développement enfant et parentalité) ──
const DEVELOPPEMENT_ENFANT_PARENTALITE: &str =
    include_str!("../../data/knowledge_base/default/developpement_enfant_parentalite.json");
// ── v31.4.8 expansion — phase 33 (psychosomatique corps-esprit) ──
const PSYCHOSOMATIQUE_CORPS_ESPRIT: &str =
    include_str!("../../data/knowledge_base/default/psychosomatique_corps_esprit.json");

// ── HTF module — L'Humain à tout faire ──────────────────────────────────────
const HTF_MODULE_IDENTITY: &str =
    include_str!("../../data/knowledge_base/default/htf_module_identity.json");
const HTF_FORMATION_MANUEL: &str =
    include_str!("../../data/knowledge_base/default/htf_formation_manuel.json");
const HTF_ESTIMATION_RULES: &str =
    include_str!("../../data/knowledge_base/default/htf_estimation_rules.json");
const HTF_SERVICES_CATALOGUE: &str =
    include_str!("../../data/knowledge_base/default/htf_services_catalogue.json");
const HTF_SOUMISSION_TEMPLATE: &str =
    include_str!("../../data/knowledge_base/default/htf_soumission_template.json");

// ─────────────────────────────────────────────────────────────────
// LAZY STATIC CACHE — parsed once, reused on every call
// ─────────────────────────────────────────────────────────────────

static KB_CACHE: OnceLock<(HashMap<String, KnowledgeBaseEntry>, Vec<String>)> = OnceLock::new();
const RUNTIME_KB_EXCLUDED_IDS: &[&str] = &[
    "kevin_book_registry_v30",
    "kevin_owner_profile_v30",
    "kevin_public_corpus_v30",
    "kevin_workflow_v30",
];

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

/// Single entry in the default knowledge base.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeBaseEntry {
    pub id: String,
    pub category: String,
    pub version: String,
    pub description: String,
    pub content: serde_json::Value,
}

/// Result of knowledge base initialization.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeBaseInitResult {
    pub success: bool,
    pub entries_loaded: usize,
    pub categories_loaded: Vec<String>,
    pub errors: Vec<String>,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KnowledgeBaseRuntimeSnapshot {
    pub source: String,
    pub source_path: Option<String>,
    pub fallback_used: bool,
    pub entry_count: usize,
    pub errors: Vec<String>,
    pub entries: HashMap<String, KnowledgeBaseEntry>,
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────

/// Default knowledge base for TITANE∞.
///
/// Contains pre-seeded knowledge about all engines, IPC commands,
/// system architecture, identity, capabilities, response guidelines,
/// and operational knowledge. Available immediately at installation
/// time — no network, no database, no setup required.
pub struct DefaultKnowledgeBase;

impl DefaultKnowledgeBase {
    const SOURCES: &'static [(&'static str, &'static str)] = &[
        ("engines_catalog", ENGINES_CATALOG),
        ("ipc_commands_catalog", IPC_COMMANDS_CATALOG),
        ("system_architecture", SYSTEM_ARCHITECTURE),
        ("identity_profile", IDENTITY_PROFILE),
        ("capabilities_matrix", CAPABILITIES_MATRIX),
        ("response_guidelines", RESPONSE_GUIDELINES),
        ("operational_knowledge", OPERATIONAL_KNOWLEDGE),
        // v30.0.0 expansion — phase 1
        ("constitution_ethics", CONSTITUTION_ETHICS),
        ("memory_system_deep", MEMORY_SYSTEM_DEEP),
        ("ai_providers_guide", AI_PROVIDERS_GUIDE),
        ("frontend_modules", FRONTEND_MODULES),
        ("digital_twin_symbiosis", DIGITAL_TWIN_SYMBIOSIS),
        ("security_privacy", SECURITY_PRIVACY),
        ("cloud_multimodal", CLOUD_MULTIMODAL),
        ("troubleshooting_faq", TROUBLESHOOTING_FAQ),
        ("learning_prompts", LEARNING_PROMPTS),
        ("services_backend", SERVICES_BACKEND),
        // v30.0.0 expansion — phase 2 (réflexion approfondie, en français)
        ("singularity_os_detail", SINGULARITY_OS_DETAIL),
        ("omega_pipeline_detail", OMEGA_PIPELINE_DETAIL),
        ("agents_multi_systeme", AGENTS_MULTI_SYSTEME),
        ("meta_mode_titane", META_MODE_TITANE),
        ("apprentissage_evolution", APPRENTISSAGE_EVOLUTION),
        ("hyper_intelligence", HYPER_INTELLIGENCE),
        ("meta_orchestrateur", META_ORCHESTRATEUR),
        ("philosophie_cognitive", PHILOSOPHIE_COGNITIVE),
        // v30.0.0 expansion — phase 3 (conversation, mémoire, twin, style)
        ("conversation_engine_detail", CONVERSATION_ENGINE_DETAIL),
        ("memory_os_detail", MEMORY_OS_DETAIL),
        ("numeric_twin_detail", NUMERIC_TWIN_DETAIL),
        ("digital_twin_v14_detail", DIGITAL_TWIN_V14_DETAIL),
        ("style_expression_kevin", STYLE_EXPRESSION_KEVIN),
        ("titane_identity_kernel_v31", TITANE_IDENTITY_KERNEL_V31),
        ("titane_runtime_rules_v31", TITANE_RUNTIME_RULES_V31),
        (
            "titane_public_positioning_v31",
            TITANE_PUBLIC_POSITIONING_V31,
        ),
        ("intelligence_emotionnelle", INTELLIGENCE_EMOTIONNELLE),
        ("coherence_identitaire", COHERENCE_IDENTITAIRE),
        ("realisme_conversationnel", REALISME_CONVERSATIONNEL),
        // v30.0.0 expansion — phase 4 (communication & psychologie FR)
        (
            "communication_interpersonnelle",
            COMMUNICATION_INTERPERSONNELLE,
        ),
        ("psychologie_cognitive", PSYCHOLOGIE_COGNITIVE),
        ("psychologie_emotionnelle", PSYCHOLOGIE_EMOTIONNELLE),
        ("psychologie_motivation", PSYCHOLOGIE_MOTIVATION),
        ("psychologie_comportementale", PSYCHOLOGIE_COMPORTEMENTALE),
        ("communication_persuasion", COMMUNICATION_PERSUASION),
        ("psychologie_relations", PSYCHOLOGIE_RELATIONS),
        ("psychologie_performance", PSYCHOLOGIE_PERFORMANCE),
        // v30.0.0 expansion — phase 5 (développement personnel, naturopathie, médecine naturelle, communication avancée)
        ("developpement_personnel", DEVELOPPEMENT_PERSONNEL),
        ("naturopathie_fondamentaux", NATUROPATHIE_FONDAMENTAUX),
        ("medecine_hollistique", MEDECINE_HOLLISTIQUE),
        ("nutrition_sante_naturelle", NUTRITION_SANTE_NATURELLE),
        (
            "plantes_medicinales_aromatherapie",
            PLANTES_MEDICINALES_AROMATHERAPIE,
        ),
        ("communication_avancee", COMMUNICATION_AVANCEE),
        ("bien_etre_mental_stress", BIEN_ETRE_MENTAL_STRESS),
        ("sante_corps_naturelle", SANTE_CORPS_NATURELLE),
        // v30.0.0 expansion — phase 11 (organisation/finance/e-commerce/SEO/devweb/branding/marketing)
        ("organisation_personnelle", ORGANISATION_PERSONNELLE),
        ("finance_entreprise", FINANCE_ENTREPRISE),
        ("ecommerce_fondamentaux", ECOMMERCE_FONDAMENTAUX),
        ("seo_referencement", SEO_REFERENCEMENT),
        ("developpement_web", DEVELOPPEMENT_WEB),
        ("branding_identite", BRANDING_IDENTITE),
        ("marketing_digital", MARKETING_DIGITAL),
        // v30.0.0 expansion — phase 10 (administration, communication, stratégie)
        ("administration_publique", ADMINISTRATION_PUBLIQUE),
        ("management_administration", MANAGEMENT_ADMINISTRATION),
        (
            "communication_institutionnelle",
            COMMUNICATION_INSTITUTIONNELLE,
        ),
        ("communication_crise", COMMUNICATION_CRISE),
        ("strategie_entreprise", STRATEGIE_ENTREPRISE),
        ("strategie_concurrentielle", STRATEGIE_CONCURRENTIELLE),
        ("gestion_projet_avancee", GESTION_PROJET_AVANCEE),
        ("negociation_avancee", NEGOCIATION_AVANCEE),
        // v30.0.0 expansion — phase 9 (rédaction pro, analyse, qualité, notariat)
        ("redaction_professionnelle", REDACTION_PROFESSIONNELLE),
        ("analyse_professionnelle", ANALYSE_PROFESSIONNELLE),
        ("management_qualite", MANAGEMENT_QUALITE),
        ("metier_qualite", METIER_QUALITE),
        ("droit_notarial_fondamentaux", DROIT_NOTARIAL_FONDAMENTAUX),
        ("actes_notariaux", ACTES_NOTARIAUX),
        ("droit_immobilier_notarial", DROIT_IMMOBILIER_NOTARIAL),
        ("redaction_actes_juridiques", REDACTION_ACTES_JURIDIQUES),
        // v30.0.0 expansion — phase 8 (musculation, sommeil, chronobiologie, cognitif, productivité, finances, entrepreneuriat, sexualité)
        ("musculation_force", MUSCULATION_FORCE),
        ("sommeil_optimise", SOMMEIL_OPTIMISE),
        ("chronobiologie_rythmes", CHRONOBIOLOGIE_RYTHMES),
        ("performance_cognitive", PERFORMANCE_COGNITIVE),
        ("gestion_temps_productivite", GESTION_TEMPS_PRODUCTIVITE),
        ("finances_personnelles", FINANCES_PERSONNELLES),
        ("entrepreneuriat_mindset", ENTREPRENEURIAT_MINDSET),
        ("sexualite_intimite", SEXUALITE_INTIMITE),
        // v30.0.0 expansion — phase 7 (nutrition avancée, callisthénie, méditation, yoga)
        ("nutrition_avancee", NUTRITION_AVANCEE),
        ("calisthenie", CALISTHENIE),
        ("meditation_pratique", MEDITATION_PRATIQUE),
        ("yoga_pratique", YOGA_PRATIQUE),
        // v30.0.0 expansion — phase 6 (approfondissement santé naturelle & communication)
        ("energetique_soins_corps", ENERGETIQUE_SOINS_CORPS),
        ("sante_feminine_naturelle", SANTE_FEMININE_NATURELLE),
        ("longevite_anti_aging", LONGEVITE_ANTI_AGING),
        ("coaching_leadership", COACHING_LEADERSHIP),
        ("relations_humaines_profondes", RELATIONS_HUMAINES_PROFONDES),
        ("spiritualite_sens_existence", SPIRITUALITE_SENS_EXISTENCE),
        (
            "immunite_prevention_naturelle",
            IMMUNITE_PREVENTION_NATURELLE,
        ),
        (
            "ecriture_expression_creatrice",
            ECRITURE_EXPRESSION_CREATRICE,
        ),
        // v30.0.0 expansion — phase 12 (finance avancée, revenus, applications, copywriting, sites web, poésie, droit, vie pro/perso, coaching, médecine naturelle, revenus en ligne, peak performance, santé mentale, growth marketing)
        (
            "strategies_revenus_monetisation",
            STRATEGIES_REVENUS_MONETISATION,
        ),
        ("investissement_patrimoine", INVESTISSEMENT_PATRIMOINE),
        ("creation_applications_saas", CREATION_APPLICATIONS_SAAS),
        (
            "copywriting_content_marketing",
            COPYWRITING_CONTENT_MARKETING,
        ),
        ("creation_sites_web_pratique", CREATION_SITES_WEB_PRATIQUE),
        ("poesie_ecriture_avancee", POESIE_ECRITURE_AVANCEE),
        ("droit_pratique_quotidien", DROIT_PRATIQUE_QUOTIDIEN),
        ("equilibre_vie_pro_perso", EQUILIBRE_VIE_PRO_PERSO),
        (
            "coaching_transformation_personnelle",
            COACHING_TRANSFORMATION_PERSONNELLE,
        ),
        ("medecine_naturelle_pratique", MEDECINE_NATURELLE_PRATIQUE),
        ("revenus_en_ligne_affiliation", REVENUS_EN_LIGNE_AFFILIATION),
        (
            "plein_potentiel_peak_performance",
            PLEIN_POTENTIEL_PEAK_PERFORMANCE,
        ),
        ("sante_mentale_therapies", SANTE_MENTALE_THERAPIES),
        ("marketing_affiliation_growth", MARKETING_AFFILIATION_GROWTH),
        // v30.0.0 expansion — phase 13 VISIONNAIRE_2.0 (bourse/crypto/immobilier/ecommerce/dropship/freelance/infoproduits/automation/fiscalité/mindset argent)
        ("bourse_trading_avance", BOURSE_TRADING_AVANCE),
        ("crypto_blockchain_avance", CRYPTO_BLOCKCHAIN_AVANCE),
        (
            "investissement_immobilier_avance",
            INVESTISSEMENT_IMMOBILIER_AVANCE,
        ),
        ("ecommerce_scaling_avance", ECOMMERCE_SCALING_AVANCE),
        ("dropshipping_print_on_demand", DROPSHIPPING_PRINT_ON_DEMAND),
        // v31.2.0 expansion — phase 20 (facebook-ads-avancé, google-ads-avancé, boutique-mode-déco, art-canvas, wix, fiche-produit-seo)
        (
            "facebook_business_marketing_avance",
            FACEBOOK_BUSINESS_MARKETING_AVANCE,
        ),
        (
            "google_ads_marketing_avance",
            GOOGLE_ADS_MARKETING_AVANCE,
        ),
        (
            "boutique_mode_decoration_en_ligne",
            BOUTIQUE_MODE_DECORATION_EN_LIGNE,
        ),
        ("vente_art_canvas_en_ligne", VENTE_ART_CANVAS_EN_LIGNE),
        ("wix_plateforme_ecommerce", WIX_PLATEFORME_ECOMMERCE),
        (
            "fiche_produit_redaction_seo_avancee",
            FICHE_PRODUIT_REDACTION_SEO_AVANCEE,
        ),
        // v31.3.0 expansion — phase 21 (printful/etsy, email-automation, pinterest/tiktok, seo-technique, CRO, analytics-kpis)
        (
            "printful_etsy_integration_avancee",
            PRINTFUL_ETSY_INTEGRATION_AVANCEE,
        ),
        (
            "email_marketing_ecommerce_automation",
            EMAIL_MARKETING_ECOMMERCE_AUTOMATION,
        ),
        (
            "pinterest_tiktok_marketing_ecommerce",
            PINTEREST_TIKTOK_MARKETING_ECOMMERCE,
        ),
        (
            "seo_technique_ecommerce_avance",
            SEO_TECHNIQUE_ECOMMERCE_AVANCE,
        ),
        (
            "conversion_rate_optimization",
            CONVERSION_RATE_OPTIMIZATION,
        ),
        (
            "analytics_kpis_ecommerce_avance",
            ANALYTICS_KPIS_ECOMMERCE_AVANCE,
        ),
        // v31.3.0 expansion — phase 22 (réseaux-sociaux-organique, publicité-retargeting, dropshipping-pod, service-client, identité-visuelle, finances-trésorerie)
        (
            "reseaux_sociaux_contenu_organique",
            RESEAUX_SOCIAUX_CONTENU_ORGANIQUE,
        ),
        (
            "publicite_retargeting_strategies",
            PUBLICITE_RETARGETING_STRATEGIES,
        ),
        (
            "dropshipping_print_on_demand_avance",
            DROPSHIPPING_PRINT_ON_DEMAND_AVANCE,
        ),
        (
            "service_client_excellence_ecommerce",
            SERVICE_CLIENT_EXCELLENCE_ECOMMERCE,
        ),
        (
            "creation_identite_visuelle_marque",
            CREATION_IDENTITE_VISUELLE_MARQUE,
        ),
        (
            "finances_tresorerie_ecommerce",
            FINANCES_TRESORERIE_ECOMMERCE,
        ),
        // v31.2.13 expansion — phase 23
        (
            "lancement_produit_campagne_marketing",
            LANCEMENT_PRODUIT_CAMPAGNE_MARKETING,
        ),
        (
            "psychologie_achat_neuromarketing",
            PSYCHOLOGIE_ACHAT_NEUROMARKETING,
        ),
        (
            "automatisation_workflows_ecommerce",
            AUTOMATISATION_WORKFLOWS_ECOMMERCE,
        ),
        (
            "tendances_marche_design_2025_2026",
            TENDANCES_MARCHE_DESIGN_2025_2026,
        ),
        (
            "wholesale_b2b_boutiques_physiques",
            WHOLESALE_B2B_BOUTIQUES_PHYSIQUES,
        ),
        (
            "strategie_prix_rentabilite_avancee",
            STRATEGIE_PRIX_RENTABILITE_AVANCEE,
        ),
        (
            "marketplace_multi_canal_expansion",
            MARKETPLACE_MULTI_CANAL_EXPANSION,
        ),
        ("copywriting_persuasif_vente", COPYWRITING_PERSUASIF_VENTE),
        ("freelance_consulting_premium", FREELANCE_CONSULTING_PREMIUM),
        (
            "infoproduits_formations_en_ligne",
            INFOPRODUITS_FORMATIONS_EN_LIGNE,
        ),
        (
            "automatisation_revenus_passifs",
            AUTOMATISATION_REVENUS_PASSIFS,
        ),
        (
            "fiscalite_optimisation_patrimoine",
            FISCALITE_OPTIMISATION_PATRIMOINE,
        ),
        ("mindset_financier_wealth", MINDSET_FINANCIER_WEALTH),
        // v30.0.0 expansion — phase 14 (art, artisanat, rénovation, sciences, biologie, technologie, politique, décoration, photographie, botanique, faune, chakras, astrologie)
        ("art_histoire_pratique", ART_HISTOIRE_PRATIQUE),
        ("artisanat_creation_manuelle", ARTISANAT_CREATION_MANUELLE),
        ("renovation_bricolage_habitat", RENOVATION_BRICOLAGE_HABITAT),
        ("science_physique_chimie", SCIENCE_PHYSIQUE_CHIMIE),
        ("biologie_sciences_vivant", BIOLOGIE_SCIENCES_VIVANT),
        (
            "technologie_innovation_avancee",
            TECHNOLOGIE_INNOVATION_AVANCEE,
        ),
        ("politique_geopolitique", POLITIQUE_GEOPOLITIQUE),
        ("decoration_interieure_design", DECORATION_INTERIEURE_DESIGN),
        ("photographie_analyse_image", PHOTOGRAPHIE_ANALYSE_IMAGE),
        ("arbres_plantes_fleurs", ARBRES_PLANTES_FLEURS),
        ("animaux_oiseaux_faune", ANIMAUX_OISEAUX_FAUNE),
        ("chakras_energie_spirituelle", CHAKRAS_ENERGIE_SPIRITUELLE),
        ("astrologie_numerologie", ASTROLOGIE_NUMEROLOGIE),
        // phase 15
        ("charisme_seduction_presence", CHARISME_SEDUCTION_PRESENCE),
        ("ikigai_valeurs_sens", IKIGAI_VALEURS_SENS),
        ("systeme_nerveux_polyvagal", SYSTEME_NERVEUX_POLYVAGAL),
        ("neurosciences_conscience", NEUROSCIENCES_CONSCIENCE),
        ("reseaux_sociaux_avance", RESEAUX_SOCIAUX_AVANCE),
        ("histoire_civilisations", HISTOIRE_CIVILISATIONS),
        ("peuples_anciens_mystiques", PEUPLES_ANCIENS_MYSTIQUES),
        ("religions_et_mythologies", RELIGIONS_ET_MYTHOLOGIES),
        ("cycles_naturels_energie_lune", CYCLES_NATURELS_ENERGIE_LUNE),
        ("geologie_mineraux_terre", GEOLOGIE_MINERAUX_TERRE),
        // phase 16
        (
            "langages_programmation_avance",
            LANGAGES_PROGRAMMATION_AVANCE,
        ),
        ("environnements_dev_outils", ENVIRONNEMENTS_DEV_OUTILS),
        ("firebase_backend_cloud", FIREBASE_BACKEND_CLOUD),
        ("design_graphique_adobe", DESIGN_GRAPHIQUE_ADOBE),
        ("suite_office_microsoft", SUITE_OFFICE_MICROSOFT),
        ("suite_google_workspace", SUITE_GOOGLE_WORKSPACE),
        ("formats_fichiers_avance", FORMATS_FICHIERS_AVANCE),
        (
            "intelligence_artificielle_pratique",
            INTELLIGENCE_ARTIFICIELLE_PRATIQUE,
        ),
        ("developpement_jeux_unity", DEVELOPPEMENT_JEUX_UNITY),
        ("web_design_ui_ux", WEB_DESIGN_UI_UX),
        (
            "synchronisation_orchestration",
            SYNCHRONISATION_ORCHESTRATION,
        ),
        // v30.0.0 expansion — phase 17 (bourse, crypto, cuisine, droit, énergie, jeux vidéo, musique, voyage)
        ("bourse_trading", BOURSE_TRADING),
        ("crypto_blockchain", CRYPTO_BLOCKCHAIN),
        ("cuisine_gastronomie", CUISINE_GASTRONOMIE),
        ("droit_contrats_pratique", DROIT_CONTRATS_PRATIQUE),
        ("energie_renouvelable", ENERGIE_RENOUVELABLE),
        ("jeux_video_culture", JEUX_VIDEO_CULTURE),
        ("musique_theorie_pratique", MUSIQUE_THEORIE_PRATIQUE),
        ("voyage_exploration", VOYAGE_EXPLORATION),
        // v30.1.0 expansion — connaissances avancées bien-être, neurosciences, thérapies
        ("neurochimie_bonheur", NEUROCHIMIE_BONHEUR),
        ("langage_corporel_avance", LANGAGE_CORPOREL_AVANCE),
        (
            "communication_professionnelle_avancee",
            COMMUNICATION_PROFESSIONNELLE_AVANCEE,
        ),
        ("chiropratique_avancee", CHIROPRATIQUE_AVANCEE),
        (
            "acupuncture_acupression_avancee",
            ACUPUNCTURE_ACUPRESSION_AVANCEE,
        ),
        (
            "physiotherapie_osteopathie_avancee",
            PHYSIOTHERAPIE_OSTEOPATHIE_AVANCEE,
        ),
        ("massage_therapeutique_avance", MASSAGE_THERAPEUTIQUE_AVANCE),
        ("yoga_kundalini_maitre", YOGA_KUNDALINI_MAITRE),
        (
            "therapies_alternatives_creatives",
            THERAPIES_ALTERNATIVES_CREATIVES,
        ),
        (
            "phytotherapie_remedes_elixirs",
            PHYTOTHERAPIE_REMEDES_ELIXIRS,
        ),
        ("cerveau_humain_avance", CERVEAU_HUMAIN_AVANCE),
        ("depression_burnout_avance", DEPRESSION_BURNOUT_AVANCE),
        ("gestion_energie_vitalite", GESTION_ENERGIE_VITALITE),
        ("culture_japonaise_sagesse", CULTURE_JAPONAISE_SAGESSE),
        // v30.1.0 expansion — phase 19 (santé avancée, MTC, Ayurveda, microbiome, hormones, respiration, Qi Gong, hypnose/PNL, trauma, détox, réflexologie, sophrologie, santé masculine, médecine fonctionnelle, aromathérapie, psychologie positive)
        (
            "medecine_traditionnelle_chinoise_avancee",
            MEDECINE_TRADITIONNELLE_CHINOISE_AVANCEE,
        ),
        ("ayurveda_avance", AYURVEDA_AVANCE),
        (
            "microbiome_axe_intestin_cerveau",
            MICROBIOME_AXE_INTESTIN_CERVEAU,
        ),
        ("systeme_hormonal_endocrinien", SYSTEME_HORMONAL_ENDOCRINIEN),
        ("respiration_pranayama_avance", RESPIRATION_PRANAYAMA_AVANCE),
        ("qi_gong_tai_chi_avance", QI_GONG_TAI_CHI_AVANCE),
        ("hypnotherapie_pnl_avancee", HYPNOTHERAPIE_PNL_AVANCEE),
        (
            "traumatisme_resilience_avance",
            TRAUMATISME_RESILIENCE_AVANCE,
        ),
        ("detox_jeune_purification", DETOX_JEUNE_PURIFICATION),
        ("reflexologie_avancee", REFLEXOLOGIE_AVANCEE),
        (
            "sophrologie_relaxation_avancee",
            SOPHROLOGIE_RELAXATION_AVANCEE,
        ),
        ("sante_masculine_naturelle", SANTE_MASCULINE_NATURELLE),
        (
            "medecine_fonctionnelle_integrative",
            MEDECINE_FONCTIONNELLE_INTEGRATIVE,
        ),
        ("aromatherapie_avancee", AROMATHERAPIE_AVANCEE),
        (
            "psychologie_positive_science_bonheur",
            PSYCHOLOGIE_POSITIVE_SCIENCE_BONHEUR,
        ),
        // v30.1.0 expansion — phase 20 (PNL maître, hypnose maître, thérapie systémique, coaching génératif, TCC 3e vague, AT/psychogénéalogie)
        ("pnl_maitre_praticien", PNL_MAITRE_PRATICIEN),
        ("hypnose_maitre_praticien", HYPNOSE_MAITRE_PRATICIEN),
        (
            "therapie_systemique_familiale",
            THERAPIE_SYSTEMIQUE_FAMILIALE,
        ),
        (
            "coaching_generatif_dilts_gilligan",
            COACHING_GENERATIF_DILTS_GILLIGAN,
        ),
        ("tcc_troisieme_vague", TCC_TROISIEME_VAGUE),
        (
            "analyse_transactionnelle_psychogenealogie",
            ANALYSE_TRANSACTIONNELLE_PSYCHOGENEALOGIE,
        ),
        // v31.3.1 expansion — phase 24 (psychologie toxique, profils, manipulation)
        (
            "psychologie_toxique_profils",
            PSYCHOLOGIE_TOXIQUE_PROFILS,
        ),
        // v31.3.2 expansion — phase 25 (stratégies protection, récupération abus)
        (
            "strategies_protection_manipulation",
            STRATEGIES_PROTECTION_MANIPULATION,
        ),
        // v31.3.3+31.3.4 expansion — phase 26 (traumatologie complexe + neuroscience attachement)
        (
            "traumatologie_complexe",
            TRAUMATOLOGIE_COMPLEXE,
        ),
        (
            "neuroscience_attachement",
            NEUROSCIENCE_ATTACHEMENT,
        ),
        // v31.3.5+31.3.6 expansion — phase 27 (dépendance affective + thérapies trauma avancées)
        (
            "dependance_affective_codependance",
            DEPENDANCE_AFFECTIVE_CODEPENDANCE,
        ),
        (
            "therapies_trauma_avancees",
            THERAPIES_TRAUMA_AVANCEES,
        ),
        // v31.3.7+31.3.8 expansion — phase 28 (CNV + deuil/rupture)
        (
            "communication_non_violente_relations",
            COMMUNICATION_NON_VIOLENTE_RELATIONS,
        ),
        (
            "deuil_rupture_transitions",
            DEUIL_RUPTURE_TRANSITIONS,
        ),
        // v31.3.9+31.3.10 expansion — phase 29 (TCC + santé mentale/résilience)
        (
            "therapies_cognitives_comportementales",
            THERAPIES_COGNITIVES_COMPORTEMENTALES,
        ),
        (
            "sante_mentale_prevention_resilience",
            SANTE_MENTALE_PREVENTION_RESILIENCE,
        ),
        // v31.4.1+31.4.2 expansion — phase 30 (neurodiversité + DBT avancé)
        (
            "neurodiversite_adhd_autisme_hpi",
            NEURODIVERSITE_ADHD_AUTISME_HPI,
        ),
        (
            "emotion_regulation_dbt_advanced",
            EMOTION_REGULATION_DBT_ADVANCED,
        ),
        // v31.4.3+31.4.4 expansion — phase 31 (humaniste/existentiel + psychodynamique)
        (
            "therapies_humanistes_existentielles",
            THERAPIES_HUMANISTES_EXISTENTIELLES,
        ),
        (
            "psychodynamique_mecanismes_defense",
            PSYCHODYNAMIQUE_MECANISMES_DEFENSE,
        ),
        // v31.4.5+31.4.6 expansion — phase 32 (addiction/EM + intimité/sexualité/EFT)
        (
            "addiction_entretien_motivationnel",
            ADDICTION_ENTRETIEN_MOTIVATIONNEL,
        ),
        (
            "intimite_sexualite_couples_eft",
            INTIMITE_SEXUALITE_COUPLES_EFT,
        ),
        // v31.4.7+31.4.8 expansion — phase 33 (développement enfant/parentalité + psychosomatique)
        (
            "developpement_enfant_parentalite",
            DEVELOPPEMENT_ENFANT_PARENTALITE,
        ),
        (
            "psychosomatique_corps_esprit",
            PSYCHOSOMATIQUE_CORPS_ESPRIT,
        ),
        // HTF module — L'Humain à tout faire
        ("htf_module_identity", HTF_MODULE_IDENTITY),
        ("htf_formation_manuel", HTF_FORMATION_MANUEL),
        ("htf_estimation_rules", HTF_ESTIMATION_RULES),
        ("htf_services_catalogue", HTF_SERVICES_CATALOGUE),
        ("htf_soumission_template", HTF_SOUMISSION_TEMPLATE),
    ];

    /// Load all default knowledge entries from embedded JSON.
    ///
    /// Results are parsed once and cached via `OnceLock`. Subsequent calls
    /// return a clone of the cached data without re-parsing.
    /// Parse errors are collected and returned separately.
    pub fn load_all() -> (HashMap<String, KnowledgeBaseEntry>, Vec<String>) {
        let cached = KB_CACHE.get_or_init(|| {
            let mut entries: HashMap<String, KnowledgeBaseEntry> = HashMap::new();
            let mut errors: Vec<String> = Vec::new();

            for (id, json_str) in Self::SOURCES {
                match serde_json::from_str::<serde_json::Value>(json_str) {
                    Ok(value) => {
                        let category = value
                            .get("category")
                            .and_then(|v| v.as_str())
                            .unwrap_or(id)
                            .to_string();
                        let version = value
                            .get("version")
                            .and_then(|v| v.as_str())
                            .unwrap_or("v30.0.0")
                            .to_string();
                        let description = value
                            .get("description")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();

                        let entry = KnowledgeBaseEntry {
                            id: id.to_string(),
                            category: category.clone(),
                            version,
                            description,
                            content: value,
                        };
                        entries.insert(category, entry);
                    }
                    Err(e) => {
                        errors.push(format!("Failed to parse '{}': {}", id, e));
                    }
                }
            }

            (entries, errors)
        });
        cached.clone()
    }

    /// Initialize the default knowledge base and return a result summary.
    ///
    /// This is the main entry point called at app startup.
    /// Logs success or warning for each category via `log::info!` / `log::warn!`.
    pub fn initialize() -> KnowledgeBaseInitResult {
        let (entries, errors) = Self::load_all();
        let entries_loaded = entries.len();
        let mut categories_loaded: Vec<String> = entries.keys().cloned().collect();
        categories_loaded.sort();
        let success = errors.is_empty();

        if success {
            log::info!(
                "[KnowledgeBase] ✅ Default knowledge base v30.0.0 initialized: {} categories",
                entries_loaded
            );
        } else {
            log::warn!(
                "[KnowledgeBase] ⚠️  Default knowledge base initialized with {} errors",
                errors.len()
            );
            for err in &errors {
                log::warn!("[KnowledgeBase]   ✗ {}", err);
            }
        }

        KnowledgeBaseInitResult {
            success,
            entries_loaded,
            categories_loaded,
            errors,
            version: "v30.0.0".to_string(),
        }
    }

    /// Get a specific knowledge entry by category ID.
    pub fn get_entry(category: &str) -> Option<KnowledgeBaseEntry> {
        let (entries, _) = Self::load_all();
        entries.get(category).cloned()
    }

    /// List all category IDs available in the default knowledge base.
    pub fn list_categories() -> Vec<String> {
        let (entries, _) = Self::load_all();
        let mut cats: Vec<String> = entries.keys().cloned().collect();
        cats.sort();
        cats
    }

    /// Check whether all default knowledge entries parse correctly.
    pub fn validate() -> bool {
        let (_, errors) = Self::load_all();
        errors.is_empty()
    }

    fn runtime_default_dir_candidates() -> Vec<PathBuf> {
        let mut candidates = Vec::new();

        if let Ok(env_path) = std::env::var("TITANE_KNOWLEDGE_BASE_DIR") {
            let env_path = PathBuf::from(env_path);
            if env_path.ends_with("default") {
                candidates.push(env_path);
            } else {
                candidates.push(env_path.join("default"));
            }
        }

        if let Ok(current_dir) = std::env::current_dir() {
            candidates.push(current_dir.join("data/knowledge_base/default"));
            candidates.push(current_dir.join("knowledge_base/default"));
        }

        candidates.push(
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("..")
                .join("data/knowledge_base/default"),
        );

        candidates
    }

    fn resolve_runtime_default_dir() -> Option<PathBuf> {
        Self::runtime_default_dir_candidates()
            .into_iter()
            .find(|candidate| candidate.is_dir())
    }

    fn load_entries_from_directory(
        dir: &Path,
    ) -> (HashMap<String, KnowledgeBaseEntry>, Vec<String>) {
        let mut entries: HashMap<String, KnowledgeBaseEntry> = HashMap::new();
        let mut errors: Vec<String> = Vec::new();

        let read_dir = match fs::read_dir(dir) {
            Ok(read_dir) => read_dir,
            Err(error) => {
                errors.push(format!("Failed to read '{}': {}", dir.display(), error));
                return (entries, errors);
            }
        };

        let mut file_paths: Vec<PathBuf> = read_dir
            .filter_map(|entry| entry.ok().map(|value| value.path()))
            .filter(|path| path.extension().and_then(|ext| ext.to_str()) == Some("json"))
            .collect();
        file_paths.sort();

        for file_path in file_paths {
            let Some(stem) = file_path
                .file_stem()
                .and_then(|value| value.to_str())
                .map(|value| value.to_string())
            else {
                continue;
            };

            if RUNTIME_KB_EXCLUDED_IDS.contains(&stem.as_str()) {
                continue;
            }

            match fs::read_to_string(&file_path) {
                Ok(raw) => match serde_json::from_str::<serde_json::Value>(&raw) {
                    Ok(value) => {
                        let category = value
                            .get("category")
                            .and_then(|candidate| candidate.as_str())
                            .unwrap_or(&stem)
                            .to_string();
                        let version = value
                            .get("version")
                            .and_then(|candidate| candidate.as_str())
                            .unwrap_or("v30.0.0")
                            .to_string();
                        let description = value
                            .get("description")
                            .and_then(|candidate| candidate.as_str())
                            .unwrap_or("")
                            .to_string();

                        entries.insert(
                            category.clone(),
                            KnowledgeBaseEntry {
                                id: stem,
                                category,
                                version,
                                description,
                                content: value,
                            },
                        );
                    }
                    Err(error) => errors.push(format!(
                        "Failed to parse '{}': {}",
                        file_path.display(),
                        error
                    )),
                },
                Err(error) => errors.push(format!(
                    "Failed to read '{}': {}",
                    file_path.display(),
                    error
                )),
            }
        }

        (entries, errors)
    }

    pub fn load_runtime_snapshot() -> KnowledgeBaseRuntimeSnapshot {
        if let Some(runtime_dir) = Self::resolve_runtime_default_dir() {
            let (entries, errors) = Self::load_entries_from_directory(&runtime_dir);
            if !entries.is_empty() {
                return KnowledgeBaseRuntimeSnapshot {
                    source: "runtime_disk".to_string(),
                    source_path: Some(runtime_dir.display().to_string()),
                    fallback_used: false,
                    entry_count: entries.len(),
                    errors,
                    entries,
                };
            }
        }

        let (entries, errors) = Self::load_all();
        KnowledgeBaseRuntimeSnapshot {
            source: "embedded_default".to_string(),
            source_path: None,
            fallback_used: true,
            entry_count: entries.len(),
            errors,
            entries,
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// IPC COMMANDS
// ─────────────────────────────────────────────────────────────────

/// Return the full default knowledge base as a JSON string.
#[tauri::command]
pub fn knowledge_base_get_all() -> Result<String, String> {
    let (entries, errors) = DefaultKnowledgeBase::load_all();
    if !errors.is_empty() {
        log::warn!(
            "[KnowledgeBase] knowledge_base_get_all: {} parse errors",
            errors.len()
        );
    }
    serde_json::to_string(&entries).map_err(|e| format!("Serialization error: {}", e))
}

/// Return a specific knowledge category as a JSON string.
#[tauri::command]
pub fn knowledge_base_get_category(category: String) -> Result<String, String> {
    match DefaultKnowledgeBase::get_entry(&category) {
        Some(entry) => {
            serde_json::to_string(&entry).map_err(|e| format!("Serialization error: {}", e))
        }
        None => Err(format!(
            "Category '{}' not found in default knowledge base",
            category
        )),
    }
}

/// List all available knowledge categories.
#[tauri::command]
pub fn knowledge_base_list_categories() -> Result<Vec<String>, String> {
    Ok(DefaultKnowledgeBase::list_categories())
}

/// Validate the integrity of all default knowledge entries.
#[tauri::command]
pub fn knowledge_base_validate() -> Result<bool, String> {
    Ok(DefaultKnowledgeBase::validate())
}

#[tauri::command]
pub fn knowledge_base_runtime_snapshot() -> Result<serde_json::Value, String> {
    let snapshot = DefaultKnowledgeBase::load_runtime_snapshot();
    Ok(serde_json::json!({
        "ok": true,
        "content": snapshot,
        "error": null,
    }))
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn test_knowledge_base_loads_all_categories() {
        let result = DefaultKnowledgeBase::initialize();
        assert!(
            result.success,
            "Default knowledge base must load without errors: {:?}",
            result.errors
        );
        let listed_categories = DefaultKnowledgeBase::list_categories();
        assert_eq!(
            result.entries_loaded,
            listed_categories.len(),
            "Initialized knowledge category count must match the canonical category registry"
        );
        assert!(
            result.entries_loaded >= 211,
            "Default knowledge base unexpectedly shrank below the governed baseline"
        );
    }

    #[test]
    fn test_knowledge_base_validate() {
        assert!(
            DefaultKnowledgeBase::validate(),
            "All JSON entries must be valid"
        );
    }

    #[test]
    fn test_knowledge_base_list_categories() {
        let cats = DefaultKnowledgeBase::list_categories();
        assert!(!cats.is_empty(), "Must have at least one category");
        let expected = vec![
            "actes_notariaux",
            "administration_publique",
            "agents_multi_systeme",
            "ai_providers_guide",
            "analyse_professionnelle",
            "animaux_oiseaux_faune",
            "apprentissage_evolution",
            "arbres_plantes_fleurs",
            "art_histoire_pratique",
            "artisanat_creation_manuelle",
            "astrologie_numerologie",
            "automatisation_revenus_passifs",
            "bien_etre_mental_stress",
            "biologie_sciences_vivant",
            "bourse_trading_avance",
            "branding_identite",
            "calisthenie",
            "capabilities_matrix",
            "chakras_energie_spirituelle",
            "charisme_seduction_presence",
            "chronobiologie_rythmes",
            "cloud_multimodal",
            "coaching_leadership",
            "coaching_transformation_personnelle",
            "coherence_identitaire",
            "communication_avancee",
            "communication_crise",
            "communication_institutionnelle",
            "communication_interpersonnelle",
            "communication_persuasion",
            "constitution_ethics",
            "conversation_engine_detail",
            "copywriting_content_marketing",
            "creation_applications_saas",
            "creation_sites_web_pratique",
            "crypto_blockchain_avance",
            "cycles_naturels_energie_lune",
            "decoration_interieure_design",
            "developpement_personnel",
            "developpement_web",
            "design_graphique_adobe",
            "developpement_jeux_unity",
            "digital_twin_symbiosis",
            "digital_twin_v14_detail",
            "droit_immobilier_notarial",
            "droit_notarial_fondamentaux",
            "droit_pratique_quotidien",
            "dropshipping_print_on_demand",
            "ecommerce_fondamentaux",
            "ecommerce_scaling_avance",
            "ecriture_expression_creatrice",
            "energetique_soins_corps",
            "engines_catalog",
            "environnements_dev_outils",
            "entrepreneuriat_mindset",
            "equilibre_vie_pro_perso",
            "finance_entreprise",
            "finances_personnelles",
            "fiscalite_optimisation_patrimoine",
            "firebase_backend_cloud",
            "formats_fichiers_avance",
            "freelance_consulting_premium",
            "frontend_modules",
            "gestion_projet_avancee",
            "gestion_temps_productivite",
            "geologie_mineraux_terre",
            "histoire_civilisations",
            "hyper_intelligence",
            "identity_profile",
            "immunite_prevention_naturelle",
            "infoproduits_formations_en_ligne",
            "intelligence_emotionnelle",
            "intelligence_artificielle_pratique",
            "ipc_commands_catalog",
            "ikigai_valeurs_sens",
            "investissement_patrimoine",
            "investissement_immobilier_avance",
            "langages_programmation_avance",
            "learning_prompts",
            "longevite_anti_aging",
            "management_administration",
            "management_qualite",
            "marketing_digital",
            "marketing_affiliation_growth",
            "medecine_hollistique",
            "medecine_naturelle_pratique",
            "meditation_pratique",
            "memory_os_detail",
            "memory_system_deep",
            "meta_mode_titane",
            "meta_orchestrateur",
            "metier_qualite",
            "mindset_financier_wealth",
            "musculation_force",
            "naturopathie_fondamentaux",
            "dependance_affective_codependance",
            "negociation_avancee",
            "neuroscience_attachement",
            "neurosciences_conscience",
            "numeric_twin_detail",
            "nutrition_avancee",
            "nutrition_sante_naturelle",
            "omega_pipeline_detail",
            "operational_knowledge",
            "organisation_personnelle",
            "performance_cognitive",
            "peuples_anciens_mystiques",
            "philosophie_cognitive",
            "photographie_analyse_image",
            "plantes_medicinales_aromatherapie",
            "plein_potentiel_peak_performance",
            "poesie_ecriture_avancee",
            "politique_geopolitique",
            "psychologie_toxique_profils",
            "psychologie_cognitive",
            "psychologie_comportementale",
            "psychologie_emotionnelle",
            "psychologie_motivation",
            "psychologie_performance",
            "psychologie_relations",
            "realisme_conversationnel",
            "religions_et_mythologies",
            "redaction_actes_juridiques",
            "redaction_professionnelle",
            "relations_humaines_profondes",
            "renovation_bricolage_habitat",
            "reseaux_sociaux_avance",
            "response_guidelines",
            "revenus_en_ligne_affiliation",
            "sante_corps_naturelle",
            "sante_feminine_naturelle",
            "sante_mentale_therapies",
            "science_physique_chimie",
            "security_privacy",
            "seo_referencement",
            "services_backend",
            "sexualite_intimite",
            "singularity_os_detail",
            "sommeil_optimise",
            "spiritualite_sens_existence",
            "strategie_concurrentielle",
            "strategie_entreprise",
            "strategies_protection_manipulation",
            "strategies_revenus_monetisation",
            "systeme_nerveux_polyvagal",
            "suite_google_workspace",
            "suite_office_microsoft",
            "style_expression_kevin",
            "synchronisation_orchestration",
            "system_architecture",
            "communication_non_violente_relations",
            "deuil_rupture_transitions",
            "emotion_regulation_dbt_advanced",
            "neurodiversite_adhd_autisme_hpi",
            "addiction_entretien_motivationnel",
            "developpement_enfant_parentalite",
            "intimite_sexualite_couples_eft",
            "psychodynamique_mecanismes_defense",
            "psychosomatique_corps_esprit",
            "sante_mentale_prevention_resilience",
            "technologie_innovation_avancee",
            "therapies_cognitives_comportementales",
            "therapies_humanistes_existentielles",
            "therapies_trauma_avancees",
            "traumatologie_complexe",
            "troubleshooting_faq",
            "web_design_ui_ux",
            "yoga_pratique",
        ];
        for cat in &expected {
            assert!(
                cats.contains(&cat.to_string()),
                "Missing expected category: {}",
                cat
            );
        }
    }

    #[test]
    fn test_knowledge_base_engines_catalog() {
        let entry = DefaultKnowledgeBase::get_entry("engines_catalog");
        assert!(entry.is_some(), "engines_catalog must exist");
        let e = entry.unwrap();
        assert_eq!(e.version, "v30.1.0");
        let engines = e
            .content
            .get("engines")
            .expect("engines_catalog must have 'engines' field")
            .as_array()
            .expect("'engines' must be an array");
        assert!(
            engines.len() >= 10,
            "Must have at least 10 engines catalogued, found {}",
            engines.len()
        );
    }

    #[test]
    fn test_knowledge_base_identity_profile() {
        let entry = DefaultKnowledgeBase::get_entry("identity_profile");
        assert!(entry.is_some(), "identity_profile must exist");
        let e = entry.unwrap();
        assert!(
            e.content.get("identity").is_some(),
            "identity_profile must have 'identity' field"
        );
    }

    #[test]
    fn test_knowledge_base_titane_identity_kernel_v31() {
        let entry = DefaultKnowledgeBase::get_entry("titane_identity_kernel_v31");
        assert!(entry.is_some(), "titane_identity_kernel_v31 must exist");
        let e = entry.unwrap();
        assert_eq!(e.version, "v30.1.35");
        assert!(
            e.content.get("titane_identity_kernel").is_some(),
            "titane_identity_kernel_v31 must expose titane_identity_kernel"
        );
    }

    #[test]
    fn test_knowledge_base_titane_runtime_rules_v31() {
        let entry = DefaultKnowledgeBase::get_entry("titane_runtime_rules_v31");
        assert!(entry.is_some(), "titane_runtime_rules_v31 must exist");
        let e = entry.unwrap();
        assert_eq!(e.version, "v30.1.36");
        assert!(
            e.content.get("titane_runtime_rules").is_some(),
            "titane_runtime_rules_v31 must expose titane_runtime_rules"
        );
    }

    #[test]
    fn test_knowledge_base_titane_public_positioning_v31() {
        let entry = DefaultKnowledgeBase::get_entry("titane_public_positioning_v31");
        assert!(entry.is_some(), "titane_public_positioning_v31 must exist");
        let e = entry.unwrap();
        assert_eq!(e.version, "v30.1.36");
        assert!(
            e.content.get("titane_public_positioning").is_some(),
            "titane_public_positioning_v31 must expose titane_public_positioning"
        );
    }

    #[test]
    fn test_knowledge_base_system_architecture() {
        let entry = DefaultKnowledgeBase::get_entry("system_architecture");
        assert!(entry.is_some(), "system_architecture must exist");
        let e = entry.unwrap();
        let arch = e
            .content
            .get("architecture_4_rings")
            .expect("Must have 'architecture_4_rings'");
        assert!(
            arch.get("ring0_core_kernel").is_some(),
            "Architecture must define ring0_core_kernel"
        );
        assert!(
            e.content.get("ipc_protocol").is_some(),
            "Architecture must define ipc_protocol"
        );
    }

    #[test]
    fn test_knowledge_base_ipc_commands_catalog() {
        let entry = DefaultKnowledgeBase::get_entry("ipc_commands_catalog");
        assert!(entry.is_some(), "ipc_commands_catalog must exist");
        let e = entry.unwrap();
        let cats = e.content.get("categories").expect("Must have 'categories'");
        assert!(cats.get("ai_chat").is_some(), "Must have ai_chat commands");
        assert!(cats.get("memory").is_some(), "Must have memory commands");
        assert!(
            cats.get("singularity").is_some(),
            "Must have singularity commands"
        );
    }

    #[test]
    fn test_load_entries_from_directory_skips_private_runtime_files() {
        let unique_suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be monotonic enough for test temp dir")
            .as_nanos();
        let dir = std::env::temp_dir().join(format!("titane-kb-runtime-{unique_suffix}"));
        fs::create_dir_all(&dir).expect("create temp runtime KB dir");

        let kept_path = dir.join("system_architecture.json");
        let excluded_path = dir.join("kevin_owner_profile_v30.json");

        fs::write(
            &kept_path,
            r#"{
                "category": "system_architecture",
                "version": "v30.1.35",
                "description": "Architecture",
                "content": {"rings": 4}
            }"#,
        )
        .expect("write kept file");
        fs::write(
            &excluded_path,
            r#"{
                "category": "kevin_owner_profile_v30",
                "version": "v30.1.35",
                "description": "Private",
                "content": {"scope": "private"}
            }"#,
        )
        .expect("write excluded file");

        let (entries, errors) = DefaultKnowledgeBase::load_entries_from_directory(&dir);
        assert!(errors.is_empty());
        assert_eq!(entries.len(), 1);
        assert!(entries.contains_key("system_architecture"));
        assert!(!entries.contains_key("kevin_owner_profile_v30"));

        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_runtime_snapshot_uses_runtime_disk_when_workspace_data_exists() {
        let snapshot = DefaultKnowledgeBase::load_runtime_snapshot();

        assert!(snapshot.entry_count >= 193);
        assert_eq!(snapshot.entry_count, snapshot.entries.len());
        assert!(!snapshot.entries.is_empty());

        if snapshot.source == "runtime_disk" {
            assert!(!snapshot.fallback_used);
            assert!(snapshot.source_path.is_some());
        }
    }
}
