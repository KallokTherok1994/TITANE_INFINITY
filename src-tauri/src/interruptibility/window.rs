#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      INTERRUPT WINDOW v13                                    ║
// ║              Génère des fenêtres d'interruption naturelles                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::{NaturalPause, PauseType};
use std::time::Duration;

/// Générateur de fenêtres d'interruption
pub struct InterruptWindow;

impl InterruptWindow {
    /// Analyse un texte et identifie les fenêtres d'interruption naturelles
    pub fn identify_windows(text: &str) -> Vec<NaturalPause> {
        let mut pauses = Vec::new();
        let chars: Vec<char> = text.chars().collect();
        
        for (i, window) in chars.windows(3).enumerate() {
            // Fin de phrase
            if (window[0] == '.' || window[0] == '?' || window[0] == '!') && 
               window[1] == ' ' && 
               window[2].is_uppercase() {
                pauses.push(NaturalPause {
                    position: i + 1,
                    pause_type: if window[0] == '?' {
                        PauseType::RhetoricalQuestion
                    } else {
                        PauseType::SentenceEnd
                    },
                    duration: Duration::from_millis(300),
                });
            }
        }

        // Détection de paragraphes
        for window in text.match_indices("\n\n") {
            pauses.push(NaturalPause {
                position: window.0,
                pause_type: PauseType::ParagraphEnd,
                duration: Duration::from_millis(500),
            });
        }

        // Détection de transitions de sujet
        let transition_markers = [
            "d'autre part",
            "en revanche",
            "par ailleurs",
            "maintenant",
            "ensuite",
            "donc",
            "ainsi",
            "cependant",
        ];

        for marker in transition_markers {
            for (pos, _) in text.match_indices(marker) {
                pauses.push(NaturalPause {
                    position: pos,
                    pause_type: PauseType::TopicTransition,
                    duration: Duration::from_millis(400),
                });
            }
        }

        // Trier par position
        pauses.sort_by_key(|p| p.position);
        pauses
    }

    /// Insère des marqueurs de pause dans le texte
    pub fn insert_pause_markers(text: &str, pauses: &[NaturalPause]) -> String {
        let mut result = String::new();
        let mut last_pos = 0;

        for pause in pauses {
            if pause.position > last_pos && pause.position <= text.len() {
                result.push_str(&text[last_pos..pause.position]);
                
                let marker = match pause.pause_type {
                    PauseType::SentenceEnd => "[PAUSE_SHORT]",
                    PauseType::ParagraphEnd => "[PAUSE_MEDIUM]",
                    PauseType::TopicTransition => "[PAUSE_LONG]",
                    PauseType::RhetoricalQuestion => "[PAUSE_QUESTION]",
                };
                
                result.push_str(marker);
                last_pos = pause.position;
            }
        }

        // Ajouter le reste du texte
        if last_pos < text.len() {
            result.push_str(&text[last_pos..]);
        }

        result
    }

    /// Génère un timing optimal pour le TTS
    pub fn generate_tts_timing(text: &str, speech_speed: f32) -> Vec<TTSSegment> {
        let pauses = Self::identify_windows(text);
        let mut segments = Vec::new();
        let mut last_pos = 0;

        for pause in pauses.iter() {
            if pause.position > last_pos && pause.position <= text.len() {
                let segment_text = &text[last_pos..pause.position];
                let word_count = segment_text.split_whitespace().count();
                let speaking_duration = Duration::from_secs_f32(word_count as f32 / speech_speed);

                segments.push(TTSSegment {
                    text: segment_text.to_string(),
                    speaking_duration,
                    pause_after: pause.duration,
                    pause_type: pause.pause_type.clone(),
                });

                last_pos = pause.position;
            }
        }

        // Dernier segment
        if last_pos < text.len() {
            let segment_text = &text[last_pos..];
            let word_count = segment_text.split_whitespace().count();
            let speaking_duration = Duration::from_secs_f32(word_count as f32 / speech_speed);

            segments.push(TTSSegment {
                text: segment_text.to_string(),
                speaking_duration,
                pause_after: Duration::from_millis(0),
                pause_type: PauseType::SentenceEnd,
            });
        }

        segments
    }

    /// Calcule le temps total estimé
    pub fn estimate_total_time(segments: &[TTSSegment]) -> Duration {
        segments.iter()
            .map(|s| s.speaking_duration + s.pause_after)
            .sum()
    }
}

/// Segment TTS avec timing
#[derive(Debug, Clone)]
pub struct TTSSegment {
    pub text: String,
    pub speaking_duration: Duration,
    pub pause_after: Duration,
    pub pause_type: PauseType,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sentence_end_detection() {
        let text = "First sentence. Second sentence. Third sentence.";
        let pauses = InterruptWindow::identify_windows(text);
        
        let sentence_ends = pauses.iter()
            .filter(|p| matches!(p.pause_type, PauseType::SentenceEnd))
            .count();
        
        assert!(sentence_ends >= 2);
    }

    #[test]
    fn test_paragraph_detection() {
        let text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
        let pauses = InterruptWindow::identify_windows(text);
        
        let paragraphs = pauses.iter()
            .filter(|p| matches!(p.pause_type, PauseType::ParagraphEnd))
            .count();
        
        assert_eq!(paragraphs, 2);
    }

    #[test]
    fn test_transition_detection() {
        let text = "First point. D'autre part, second point. En revanche, third point.";
        let pauses = InterruptWindow::identify_windows(text);
        
        let transitions = pauses.iter()
            .filter(|p| matches!(p.pause_type, PauseType::TopicTransition))
            .count();
        
        assert!(transitions >= 1);
    }

    #[test]
    fn test_pause_marker_insertion() {
        let text = "First. Second. Third.";
        let pauses = InterruptWindow::identify_windows(text);
        let marked = InterruptWindow::insert_pause_markers(text, &pauses);
        
        assert!(marked.contains("[PAUSE_SHORT]"));
    }

    #[test]
    fn test_tts_timing_generation() {
        let text = "First sentence. Second sentence.";
        let segments = InterruptWindow::generate_tts_timing(text, 2.5);
        
        assert!(segments.len() >= 2);
        assert!(segments[0].speaking_duration.as_millis() > 0);
    }

    #[test]
    fn test_total_time_estimation() {
        let segments = vec![
            TTSSegment {
                text: "test".to_string(),
                speaking_duration: Duration::from_secs(2),
                pause_after: Duration::from_millis(300),
                pause_type: PauseType::SentenceEnd,
            },
            TTSSegment {
                text: "test2".to_string(),
                speaking_duration: Duration::from_secs(3),
                pause_after: Duration::from_millis(500),
                pause_type: PauseType::ParagraphEnd,
            },
        ];

        let total = InterruptWindow::estimate_total_time(&segments);
        assert_eq!(total.as_millis(), 5800);
    }
}
