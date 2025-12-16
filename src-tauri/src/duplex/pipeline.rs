/**
 * 🔄 Duplex Pipeline - Pipeline complet full duplex avec wakeword
 * Orchestre: wakeword → audio input → ASR → IA → TTS → audio output
 * Gestion interruptions, synchronisation, fallback
 */
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

use super::audio_input::{AudioInput, AudioChunk};
use super::audio_output::{AudioOutput, OutputChunk};
use super::sync::{DuplexSync, DuplexState};
use crate::wakeword::{WakewordListener, WakewordTrigger};

pub struct DuplexPipeline {
    wakeword: Arc<WakewordListener>,
    audio_input: Arc<AudioInput>,
    audio_output: Arc<AudioOutput>,
    sync: Arc<DuplexSync>,
    is_active: Arc<Mutex<bool>>,
}

#[derive(Debug, Clone)]
pub enum PipelineEvent {
    WakewordDetected { keyword: String, confidence: f32 },
    UserStartedSpeaking { timestamp: i64 },
    UserStoppedSpeaking { timestamp: i64 },
    TranscriptionReady { text: String },
    AiResponseStarted,
    AiResponseChunk { text: String },
    AiResponseComplete,
    Error { message: String },
}

impl DuplexPipeline {
    pub async fn new() -> Result<Self, String> {
        // Channels
        let (wakeword_tx, mut wakeword_rx) = mpsc::channel::<WakewordTrigger>(10);
        let (audio_in_tx, mut audio_in_rx) = mpsc::channel::<AudioChunk>(100);
        let (audio_out_tx, audio_out_rx) = mpsc::channel::<OutputChunk>(100);
        let (event_tx, _event_rx) = mpsc::channel::<PipelineEvent>(100);

        // Composants
        let wakeword = Arc::new(WakewordListener::new(wakeword_tx));
        let audio_input = Arc::new(AudioInput::new(16000, audio_in_tx));
        let audio_output = Arc::new(AudioOutput::new(audio_out_rx));
        let sync = Arc::new(DuplexSync::new());

        // Écoute wakeword
        let wakeword_clone = Arc::clone(&wakeword);
        let sync_clone = Arc::clone(&sync);
        let audio_input_clone = Arc::clone(&audio_input);
        let event_tx_clone = event_tx.clone();

        tokio::spawn(async move {
            while let Some(trigger) = wakeword_rx.recv().await {
                println!("[Pipeline] Wakeword détecté: {} ({:.0}%)",
                    trigger.keyword, trigger.confidence * 100.0);

                let _ = event_tx_clone.send(PipelineEvent::WakewordDetected {
                    keyword: trigger.keyword.clone(),
                    confidence: trigger.confidence,
                }).await;

                // Activer input audio
                if let Err(e) = audio_input_clone.start().await {
                    eprintln!("[Pipeline] Erreur démarrage audio input: {}", e);
                }
            }
        });

        // Traitement audio input → ASR
        let sync_clone = Arc::clone(&sync);
        let event_tx_clone = event_tx.clone();

        tokio::spawn(async move {
            let mut is_user_speaking = false;
            let mut audio_buffer = Vec::new();

            while let Some(chunk) = audio_in_rx.recv().await {
                // Détection voix
                if chunk.has_voice && !is_user_speaking {
                    is_user_speaking = true;
                    sync_clone.user_started_speaking();

                    let _ = event_tx_clone.send(PipelineEvent::UserStartedSpeaking {
                        timestamp: chunk.timestamp,
                    }).await;
                } else if !chunk.has_voice && is_user_speaking && audio_buffer.len() > 10 {
                    // Fin de parole détectée
                    is_user_speaking = false;
                    sync_clone.user_stopped_speaking();

                    let _ = event_tx_clone.send(PipelineEvent::UserStoppedSpeaking {
                        timestamp: chunk.timestamp,
                    }).await;

                    // Implementation: Real-time ASR integration in audio pipeline
                    // - ASR: Use crate::audio::asr::ASREngine for transcription
                    // - Call: let asr = ASREngine::new(config); let text = asr.transcribe(&audio_buffer).await?;
                    // - Streaming: For long audio, use streaming ASR with partial results
                    // - Latency: Target < 500ms for real-time conversations
                    // - Fallback: Use mock_asr() if ASR unavailable or disabled
                    let transcription = Self::mock_asr(&audio_buffer).await;

                    let _ = event_tx_clone.send(PipelineEvent::TranscriptionReady {
                        text: transcription,
                    }).await;

                    audio_buffer.clear();
                }

                if is_user_speaking {
                    audio_buffer.extend(chunk.samples);
                }
            }
        });

        Ok(Self {
            wakeword,
            audio_input,
            audio_output,
            sync,
            is_active: Arc::new(Mutex::new(false)),
        })
    }

    /// Démarrer le pipeline complet
    pub async fn start(&self) -> Result<(), String> {
        let mut active = match self.is_active.lock() {
            Ok(guard) => guard,
            Err(poisoned) => {
                eprintln!("[Pipeline] Lock poisoned in start(), recovering");
                poisoned.into_inner()
            }
        };
        if *active {
            return Ok(());
        }

        println!("[Pipeline] Démarrage full duplex pipeline...");

        // 1. Démarrer wakeword listener
        self.wakeword.start().await?;

        // 2. Démarrer audio output
        self.audio_output.start().await?;

        *active = true;
        println!("[Pipeline] ✅ Pipeline actif - En attente du mot 'TITANE'");

        Ok(())
    }

    /// Arrêter le pipeline
    pub fn stop(&self) {
        let mut active = match self.is_active.lock() {
            Ok(guard) => guard,
            Err(poisoned) => {
                eprintln!("[Pipeline] Lock poisoned in stop(), recovering");
                poisoned.into_inner()
            }
        };
        if !*active {
            return;
        }

        println!("[Pipeline] Arrêt pipeline...");

        self.wakeword.stop();
        self.audio_input.stop();
        self.audio_output.stop();
        self.sync.reset();

        *active = false;
        println!("[Pipeline] Pipeline arrêté");
    }

    /// Obtenir état duplex
    pub fn get_state(&self) -> DuplexState {
        self.sync.get_state()
    }

    /// Est actif?
    pub fn is_active(&self) -> bool {
        match self.is_active.lock() {
            Ok(guard) => *guard,
            Err(poisoned) => {
                eprintln!("[Pipeline] Lock poisoned in is_active(), recovering");
                *poisoned.into_inner()
            }
        }
    }

    // ===== MOCK FUNCTIONS =====

    async fn mock_asr(_audio: &[f32]) -> String {
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        "Transcription simulée de l'audio".to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_pipeline_creation() {
        let pipeline = DuplexPipeline::new().await;
        assert!(pipeline.is_ok());
    }

    #[tokio::test]
    async fn test_pipeline_start_stop() {
        let pipeline = DuplexPipeline::new().await.unwrap();

        assert!(!pipeline.is_active());

        pipeline.start().await.unwrap();
        assert!(pipeline.is_active());

        pipeline.stop();
        assert!(!pipeline.is_active());
    }
}
