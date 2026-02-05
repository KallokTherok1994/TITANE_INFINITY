use std::sync::Arc;
/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — CONVERSATION ENGINE COMMANDS
 * Commandes Tauri pour le Conversation Engine
 * ═══════════════════════════════════════════════════════════════════
 */
use tauri::State;
use uuid::Uuid;

use super::types::*;
use super::ConversationEngineState;

type CommandResult<T> = Result<T, String>;

// ═══════════════════════════════════════════════════════════════════
// OMEGA PIPELINE COMMANDS (Frontend API)
// ═══════════════════════════════════════════════════════════════════

/// Créer une nouvelle conversation OMEGA
#[tauri::command]
pub async fn create_new_conversation(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<String> {
    // Générer un nouvel ID de conversation
    let conversation_id = Uuid::new_v4().to_string();

    // Initialiser la conversation dans le memory engine
    // (pour l'instant, on retourne juste l'ID - le memory engine créera l'entrée au premier message)

    Ok(conversation_id)
}

/// Générer une réponse via le pipeline OMEGA complet
#[tauri::command]
pub async fn conversation_generate(
    engine: State<'_, Arc<ConversationEngineState>>,
    message: String,
    conversation_id: String,
    mode: Option<String>,
    provider: Option<String>,
    system_prompt: Option<String>, // Ajout: system prompt personnalisé
    request_id: Option<String>,
) -> CommandResult<serde_json::Value> {
    // Convertir le mode string en ConversationMode
    let conversation_mode = match mode.as_deref() {
        Some("coach") => ConversationMode::Default, // Coach = Default avec personnalité
        Some("strategist") => ConversationMode::Planning,
        Some("brainstorming") => ConversationMode::Brainstorming,
        Some("synthesis") => ConversationMode::Synthesis,
        Some("journal") => ConversationMode::Journal,
        Some("debug_cognitive") => ConversationMode::DebugCognitive,
        _ => ConversationMode::Default,
    };

    let req_id = request_id.unwrap_or_else(|| format!("req_{}", Uuid::new_v4()));
    log::info!(
        "[Ω:CMD] 📨 Request | req_id={} | msg_len={} | conv_id={} | mode={:?}",
        req_id,
        message.len(),
        conversation_id,
        conversation_mode
    );

    // Créer la requête OMEGA
    let request = ConversationRequest {
        user_message: message,
        conversation_id: Some(conversation_id.clone()),
        mode: conversation_mode,
        ai_config: provider.map(|p| {
            let provider_pref = match p.as_str() {
                "gemini" => super::types::ProviderPreference::Gemini,
                "ollama" => super::types::ProviderPreference::Ollama,
                "openai" | "gpt" => super::types::ProviderPreference::OpenAI,
                "claude" | "anthropic" => super::types::ProviderPreference::Claude,
                "local" => super::types::ProviderPreference::Local,
                _ => super::types::ProviderPreference::Auto,
            };
            AIConfig {
                temperature: 0.7,
                max_tokens: None,
                provider_preference: provider_pref,
            }
        }),
        emotion_context: None,
        custom_system_prompt: system_prompt, // ✨ Ajout du system prompt personnalisé
    };

    // Traiter via le pipeline OMEGA complet
    let start_time = std::time::Instant::now();
    let response = engine
        .process_message(request)
        .await
        .map_err(|e| e.to_string())?;
    let latency_ms = start_time.elapsed().as_millis() as u64;

    // ✅ FIX AUDIT: Validation content non-vide AVANT serialization
    if response.assistant_message.trim().is_empty() {
        log::error!("[Ω:CMD] ❌ AI generated empty response");
        return Err("AI response content is empty".to_string());
    }

    log::info!(
        "[Ω:CMD] ✅ Success | req_id={} | msg_id={} | content_len={} | latency={}ms",
        req_id,
        response.message_id,
        response.assistant_message.len(),
        latency_ms
    );

    // Construire la réponse JSON compatible avec le frontend
    Ok(serde_json::json!({
        "content": response.assistant_message,
        "conversationId": response.conversation_id,
        "messageId": response.message_id,
        "frenchMasteryApplied": true, // OMEGA utilise toujours FrenchMastery
        "latencyMs": latency_ms,
        "metadata": {
            "intention": format!("{:?}", response.detected_intention),
            "emotion": format!("{:?}", response.detected_emotion),
            "cognitiveTags": response.cognitive_tags,
            "cognitiveSummary": response.cognitive_summary,
            "requestId": req_id,
        }
    }))
}

/// Traiter un message (ancienne interface - conservée pour compatibilité)
#[tauri::command]
pub async fn conversation_process_message(
    engine: State<'_, Arc<ConversationEngineState>>,
    user_message: String,
    conversation_id: Option<String>,
    mode: Option<String>,
) -> CommandResult<ConversationResponse> {
    log::info!(
        "[conversation_process_message] 📨 Request received | msg_len={} | conv_id={:?} | mode={:?}",
        user_message.len(),
        conversation_id,
        mode
    );

    let mode = match mode.as_deref() {
        Some("brainstorming") => ConversationMode::Brainstorming,
        Some("synthesis") => ConversationMode::Synthesis,
        Some("planning") => ConversationMode::Planning,
        Some("journal") => ConversationMode::Journal,
        Some("debug_cognitive") => ConversationMode::DebugCognitive,
        _ => ConversationMode::Default,
    };

    let request = ConversationRequest {
        user_message: user_message.clone(),
        conversation_id: conversation_id.clone(),
        mode,
        ai_config: None,
        emotion_context: None,
        custom_system_prompt: None,
    };

    log::info!(
        "[conversation_process_message] 🚀 Processing through engine | mode={:?}",
        request.mode
    );

    match engine.process_message(request).await {
        Ok(response) => {
            log::info!(
                "[conversation_process_message] ✅ Success | msg_id={} | tokens={}",
                response.message_id,
                response.metadata.tokens_used
            );
            Ok(response)
        }
        Err(e) => {
            log::error!(
                "[conversation_process_message] ❌ Error | msg='{}' | error={}",
                user_message.chars().take(50).collect::<String>(),
                e
            );
            Err(e.to_string())
        }
    }
}

/// Health check du système
#[tauri::command]
pub async fn conversation_health_check(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<ConversationHealthReport> {
    engine.health_check().await.map_err(|e| e.to_string())
}

/// Obtenir statistiques mémoire
#[tauri::command]
pub async fn conversation_memory_stats(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<serde_json::Value> {
    let stats = engine.self_healing.read().await.stats();

    Ok(serde_json::json!({
        "total_processed": stats.total_processed,
        "total_anomalies": stats.total_anomalies,
        "last_scan": stats.last_scan,
    }))
}

// ═══════════════════════════════════════════════════════════════════
// FRENCH MASTERY POST-PROCESSOR COMMANDS
// ═══════════════════════════════════════════════════════════════════

/// Post-traiter une réponse en français avancé
#[tauri::command]
pub async fn conversation_french_postprocess(
    engine: State<'_, Arc<ConversationEngineState>>,
    context: String,
    draft_response: String,
    mode: Option<String>,
    tone: Option<String>,
    length: Option<String>,
    technical_level: Option<String>,
) -> CommandResult<super::french_mastery::FrenchMasteryResponse> {
    use super::french_mastery::*;

    let processing_mode = match mode.as_deref() {
        Some("correction") => ProcessingMode::Correction,
        Some("simplification") => ProcessingMode::Simplification,
        Some("enrichment") => ProcessingMode::Enrichment,
        Some("double") => ProcessingMode::Double,
        _ => ProcessingMode::Optimization, // Par défaut
    };

    let tone_value = match tone.as_deref() {
        Some("warm") => Tone::Warm,
        Some("professional") => Tone::Professional,
        _ => Tone::Neutral,
    };

    let length_value = match length.as_deref() {
        Some("short") => Length::Short,
        Some("long") => Length::Long,
        _ => Length::Medium,
    };

    let tech_level = match technical_level.as_deref() {
        Some("beginner") => TechnicalLevel::Beginner,
        Some("expert") => TechnicalLevel::Expert,
        _ => TechnicalLevel::Intermediate,
    };

    let request = FrenchMasteryRequest {
        context,
        draft_response,
        mode: processing_mode,
        constraints: PostProcessingConstraints {
            tone: tone_value,
            length: length_value,
            technical_level: tech_level,
        },
    };

    engine
        .french_mastery
        .process(request)
        .await
        .map_err(|e| e.to_string())
}

/// Appliquer le réalisme conversationnel (Super Prompt #4)
#[tauri::command]
pub async fn conversation_realism_process(
    engine: State<'_, Arc<ConversationEngineState>>,
    context: String,
    user_message: String,
    draft_response: String,
    conversation_history: Vec<String>,
    recent_topics: Vec<String>,
) -> CommandResult<super::realism::RealismResponse> {
    use super::realism::RealismRequest;

    let request = RealismRequest {
        context,
        user_message,
        draft_response,
        conversation_history,
        recent_topics,
    };

    Ok(engine.realism.process(request).await)
}

/// Appliquer la subtilité émotionnelle (Super Prompt #5)
#[tauri::command]
pub async fn conversation_emotional_process(
    engine: State<'_, Arc<ConversationEngineState>>,
    context: String,
    user_message: String,
    draft_response: String,
    conversation_velocity: usize,
    message_history: Vec<String>,
) -> CommandResult<super::emotional_subtlety::EmotionalResponse> {
    use super::emotional_subtlety::EmotionalRequest;

    let request = EmotionalRequest {
        context,
        user_message,
        draft_response,
        conversation_velocity,
        message_history,
    };

    Ok(engine.emotional_subtlety.process(request).await)
}

/// Appliquer la cohérence comportementale (Super Prompt #6)
#[tauri::command]
pub async fn conversation_behavioral_check(
    engine: State<'_, Arc<ConversationEngineState>>,
    response_draft: String,
    conversation_context: String,
    previous_responses: Vec<String>,
    user_message: String,
) -> CommandResult<super::behavioral_consistency::BehavioralResponse> {
    use super::behavioral_consistency::BehavioralRequest;

    let request = BehavioralRequest {
        response_draft,
        conversation_context,
        previous_responses,
        user_message,
    };

    Ok(engine.behavioral_consistency.process(request).await)
}

/// Traiter du texte avec le moteur littéraire (Super Prompt #7)
#[tauri::command]
pub async fn literary_engine_process(
    engine: State<'_, Arc<ConversationEngineState>>,
    text_type: String,
    intensity: String,
    target_length: Option<usize>,
    draft: String,
    reference_style: Option<Vec<String>>,
    mode: String,
) -> CommandResult<serde_json::Value> {
    use crate::conversation_engine::literary_engine::{
        LiteraryContext, LiteraryIntensity, LiteraryRequest, TextType, WritingMode,
    };

    let text_type = match text_type.as_str() {
        "post" => TextType::Post,
        "book_paragraph" => TextType::BookParagraph,
        "poetry" => TextType::Poetry,
        "intro" => TextType::Intro,
        "chapter" => TextType::Chapter,
        "manifesto" => TextType::Manifesto,
        "web_page" => TextType::WebPage,
        other => TextType::Other(other.to_string()),
    };

    let intensity = match intensity.as_str() {
        "sober" => LiteraryIntensity::Sober,
        "poetic" => LiteraryIntensity::Poetic,
        _ => LiteraryIntensity::Balanced,
    };

    let mode = match mode.as_str() {
        "literary_smoothing" => WritingMode::LiterarySmoothing,
        "literary_enhanced" => WritingMode::LiteraryEnhanced,
        "poetic_version" => WritingMode::PoeticVersion,
        "double_version" => WritingMode::DoubleVersion,
        _ => WritingMode::AdaptToMedium,
    };

    let request = LiteraryRequest {
        context: LiteraryContext {
            text_type,
            intensity,
            target_length,
        },
        draft,
        reference_style,
        mode,
    };

    let literary_engine = engine.literary_engine.read().await;
    let response = literary_engine.process(request);

    serde_json::to_value(&response).map_err(|e| e.to_string())
}

/// Mettre à jour le profil de style littéraire
#[tauri::command]
pub async fn literary_engine_update_style(
    engine: State<'_, Arc<ConversationEngineState>>,
    new_texts: Vec<String>,
) -> CommandResult<serde_json::Value> {
    let mut literary_engine = engine.literary_engine.write().await;
    literary_engine.update_style_profile(new_texts);

    let profile = literary_engine.get_style_profile();
    serde_json::to_value(profile).map_err(|e| e.to_string())
}

/// Obtenir le profil de style actuel
#[tauri::command]
pub async fn literary_engine_get_style_profile(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<serde_json::Value> {
    let literary_engine = engine.literary_engine.read().await;
    let profile = literary_engine.get_style_profile();
    serde_json::to_value(profile).map_err(|e| e.to_string())
}

/// Intégrer un texte dans l'anthologie interne (Super Prompt #8)
#[tauri::command]
pub async fn anthology_integrate_text(
    engine: State<'_, Arc<ConversationEngineState>>,
    text: String,
    source: String,
    author_provided_tags: Option<Vec<String>>,
) -> CommandResult<serde_json::Value> {
    use crate::conversation_engine::anthology_engine::AnthologyIntegrationRequest;

    let request = AnthologyIntegrationRequest {
        text,
        source,
        author_provided_tags,
    };

    let mut anthology_engine = engine.anthology_engine.write().await;
    let response = anthology_engine.integrate_text(request);

    serde_json::to_value(&response).map_err(|e| e.to_string())
}

/// Obtenir l'ADN littéraire actuel
#[tauri::command]
pub async fn anthology_get_literary_dna(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<serde_json::Value> {
    let anthology_engine = engine.anthology_engine.read().await;
    let dna = anthology_engine.get_literary_dna();
    serde_json::to_value(dna).map_err(|e| e.to_string())
}

/// Rechercher des extraits par tag
#[tauri::command]
pub async fn anthology_search_by_tag(
    engine: State<'_, Arc<ConversationEngineState>>,
    tag: String,
) -> CommandResult<serde_json::Value> {
    let anthology_engine = engine.anthology_engine.read().await;
    let excerpts = anthology_engine.search_by_tag(&tag);
    serde_json::to_value(&excerpts).map_err(|e| e.to_string())
}

/// Rechercher des extraits par couche
#[tauri::command]
pub async fn anthology_search_by_layer(
    engine: State<'_, Arc<ConversationEngineState>>,
    layer: String,
) -> CommandResult<serde_json::Value> {
    use crate::conversation_engine::anthology_engine::AnthologyLayer;

    let layer = match layer.as_str() {
        "literary_fragments" => AnthologyLayer::LiteraryFragments,
        "lexical_fields" => AnthologyLayer::LexicalFields,
        "stylistic_signatures" => AnthologyLayer::StylisticSignatures,
        "metaphors_images" => AnthologyLayer::MetaphorsImages,
        "founding_themes" => AnthologyLayer::FoundingThemes,
        "models_methodologies" => AnthologyLayer::ModelsMethodologies,
        "literary_dna" => AnthologyLayer::LiteraryDNA,
        _ => return Err("Invalid layer".to_string()),
    };

    let anthology_engine = engine.anthology_engine.read().await;
    let excerpts = anthology_engine.search_by_layer(layer);
    serde_json::to_value(&excerpts).map_err(|e| e.to_string())
}

/// Obtenir les top N champs lexicaux
#[tauri::command]
pub async fn anthology_get_top_lexical_fields(
    engine: State<'_, Arc<ConversationEngineState>>,
    n: usize,
) -> CommandResult<Vec<(String, usize)>> {
    let anthology_engine = engine.anthology_engine.read().await;
    Ok(anthology_engine.get_top_lexical_fields(n))
}

/// Obtenir les statistiques de l'anthologie
#[tauri::command]
pub async fn anthology_get_statistics(
    engine: State<'_, Arc<ConversationEngineState>>,
) -> CommandResult<serde_json::Value> {
    let anthology_engine = engine.anthology_engine.read().await;
    let stats = anthology_engine.get_statistics();
    serde_json::to_value(&stats).map_err(|e| e.to_string())
}
