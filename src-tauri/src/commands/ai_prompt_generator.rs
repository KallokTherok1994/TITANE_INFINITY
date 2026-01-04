// TITANE∞ v25.4.2 - AI Prompt Generator Command
// Génération de system prompts via IA (Ollama local)

use serde::{Deserialize, Serialize};
use std::time::Instant;

/// Request pour génération de prompt
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratePromptRequest {
    pub concept: String,
    pub expertise: Option<String>, // "beginner", "intermediate", "advanced", "expert"
    pub tone: Option<String>,      // "professional", "casual", "friendly", "formal"
    pub include_examples: Option<bool>,
    pub max_tokens: Option<u32>,
}

/// Response de génération
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratePromptResponse {
    pub prompt: String,
    pub generated_by: String,
    pub model: String,
    pub latency_ms: u64,
    pub success: bool,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn generate_mode_prompt(
    request: GeneratePromptRequest,
) -> Result<GeneratePromptResponse, String> {
    let start = Instant::now();

    // Validate input
    if request.concept.trim().is_empty() {
        return Ok(GeneratePromptResponse {
            prompt: String::new(),
            generated_by: "validation".to_string(),
            model: "none".to_string(),
            latency_ms: start.elapsed().as_millis() as u64,
            success: false,
            error: Some("Concept cannot be empty".to_string()),
        });
    }

    let expertise = request.expertise.unwrap_or_else(|| "advanced".to_string());
    let tone = request.tone.unwrap_or_else(|| "professional".to_string());
    let include_examples = request.include_examples.unwrap_or(true);
    let max_tokens = request.max_tokens.unwrap_or(500);

    // Construct meta-prompt pour génération
    let meta_prompt = format!(
        r#"Generate a system prompt for an AI assistant specialized in: {concept}

Requirements:
- Expertise level: {expertise}
- Tone: {tone}
- Include concrete examples: {examples}
- Be concise but comprehensive

The system prompt should define:
1. The AI's role and expertise
2. Key characteristics and approach
3. Communication principles
4. {examples_section}

Format the response as a complete, ready-to-use system prompt."#,
        concept = request.concept,
        expertise = expertise,
        tone = tone,
        examples = if include_examples { "yes" } else { "no" },
        examples_section = if include_examples {
            "Concrete examples or use cases"
        } else {
            "General guidelines"
        }
    );

    // Try Ollama API first
    match call_ollama_api(&meta_prompt, max_tokens).await {
        Ok(generated_text) => {
            let latency = start.elapsed().as_millis() as u64;
            Ok(GeneratePromptResponse {
                prompt: generated_text,
                generated_by: "ollama".to_string(),
                model: "llama3.1".to_string(),
                latency_ms: latency,
                success: true,
                error: None,
            })
        }
        Err(ollama_error) => {
            eprintln!(
                "[AI Prompt Generator] Ollama failed: {}, falling back to template",
                ollama_error
            );

            // Fallback: Template-based generation
            let fallback_prompt =
                generate_template_prompt(&request.concept, &expertise, &tone, include_examples);

            let latency = start.elapsed().as_millis() as u64;
            Ok(GeneratePromptResponse {
                prompt: fallback_prompt,
                generated_by: "template".to_string(),
                model: "fallback".to_string(),
                latency_ms: latency,
                success: true,
                error: Some(format!("Ollama unavailable: {}", ollama_error)),
            })
        }
    }
}

/// Call Ollama API for completion
async fn call_ollama_api(prompt: &str, max_tokens: u32) -> Result<String, String> {
    use reqwest::Client;
    use serde_json::json;

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    let ollama_url = std::env::var("OLLAMA_BASE_URL")
        .or_else(|_| std::env::var("OLLAMA_URL"))
        .unwrap_or_else(|_| "http://127.0.0.1:11434".to_string());

    let model = std::env::var("OLLAMA_DEFAULT_MODEL")
        .or_else(|_| std::env::var("OLLAMA_MODEL"))
        .unwrap_or_else(|_| "llama3.1".to_string());

    let request_body = json!({
        "model": model,
        "prompt": prompt,
        "stream": false,
        "options": {
            "num_predict": max_tokens,
            "temperature": 0.7,
            "top_p": 0.9,
        }
    });

    let response = client
        .post(format!("{}/api/generate", ollama_url))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Ollama request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama returned status: {}", response.status()));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    response_json["response"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "No 'response' field in Ollama output".to_string())
}

/// Template-based prompt generation (fallback)
fn generate_template_prompt(
    concept: &str,
    expertise: &str,
    tone: &str,
    include_examples: bool,
) -> String {
    let intro = match expertise {
        "beginner" => format!("Tu es un assistant IA accessible et pédagogique, spécialisé dans {}. Tu expliques les concepts de manière simple.", concept),
        "intermediate" => format!("Tu es un assistant IA compétent, spécialisé dans {}. Tu fournis des explications claires avec des détails techniques appropriés.", concept),
        "advanced" | "expert" => format!("Tu es un expert de haut niveau dans le domaine de {}. Tu fournis des analyses approfondies et des insights avancés.", concept),
        _ => format!("Tu es un assistant IA spécialisé dans {}.", concept),
    };

    let tone_desc = match tone {
        "professional" => "Ton langage est professionnel, précis et structuré.",
        "casual" => "Ton langage est décontracté, accessible et engageant.",
        "friendly" => "Ton langage est chaleureux, encourageant et bienveillant.",
        "formal" => "Ton langage est formel, académique et rigoureux.",
        _ => "Ton langage est clair et adapté au contexte.",
    };

    let examples_section = if include_examples {
        format!(
            "\n\nExemples d'application:\n- Analyse de problèmes liés à {}\n- Conseil stratégique sur {}\n- Résolution de défis dans {}",
            concept, concept, concept
        )
    } else {
        String::new()
    };

    format!(
        r#"{}

Tes caractéristiques principales:
- Expertise approfondie et actualisée dans {}
- Communication claire et adaptée à l'utilisateur
- Approche structurée et méthodique
- Propositions concrètes et actionnables

{}

Ton rôle est d'accompagner l'utilisateur en fournissant:
1. Des analyses détaillées et pertinentes
2. Des recommandations pratiques
3. Des explications structurées
4. Un soutien adapté aux besoins spécifiques

{}

Principes de communication:
- Comprendre précisément la demande
- Structurer les réponses de manière logique
- Fournir des exemples concrets quand pertinent
- Encourager la réflexion et l'autonomie de l'utilisateur"#,
        intro, concept, tone_desc, examples_section
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_template_generation() {
        let prompt =
            generate_template_prompt("développement web", "advanced", "professional", true);

        assert!(prompt.contains("développement web"));
        assert!(prompt.contains("expert de haut niveau"));
        assert!(prompt.contains("Exemples d'application"));
    }

    #[test]
    fn test_beginner_prompt() {
        let prompt = generate_template_prompt("cuisine française", "beginner", "friendly", false);

        assert!(prompt.contains("cuisine française"));
        assert!(prompt.contains("accessible et pédagogique"));
        assert!(!prompt.contains("Exemples d'application"));
    }
}
