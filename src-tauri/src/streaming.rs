// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v21.1Ω — STREAMING IPC FOR REAL-TIME RESPONSES
//   Super-Prompt B3: Reduce TTFT from 430ms to <100ms
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tauri::ipc::Channel;
use tokio_stream::Stream;
use tokio_stream::StreamExt;

use crate::error::{TitaneError, TitaneResult};

// ═══════════════════════════════════════════════════════════════
//   STREAMING TYPES
// ═══════════════════════════════════════════════════════════════

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct StreamChunk {
    /// Chunk content (token, sentence, or metadata)
    pub chunk: String,
    /// Type of chunk
    pub chunk_type: ChunkType,
    /// Optional metadata
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<ChunkMetadata>,
    /// Timestamp
    pub timestamp: i64,
}

#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ChunkType {
    /// Individual token
    Token,
    /// Complete sentence
    Sentence,
    /// Complete paragraph
    Paragraph,
    /// Metadata update (e.g., thinking status)
    Metadata,
    /// Stream complete
    Complete,
    /// Error occurred
    Error,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct ChunkMetadata {
    /// Current processing stage
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stage: Option<String>,
    /// Processing confidence (0.0-1.0)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub confidence: Option<f32>,
    /// Token position in stream
    #[serde(skip_serializing_if = "Option::is_none")]
    pub position: Option<usize>,
    /// Total tokens (if known)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_tokens: Option<usize>,
}

// ═══════════════════════════════════════════════════════════════
//   STREAMING METRICS
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamingMetrics {
    /// Time to first token (ms)
    pub time_to_first_token: u64,
    /// Time to last token (ms)
    pub time_to_last_token: u64,
    /// Total tokens streamed
    pub total_tokens: usize,
    /// Average token latency (ms)
    pub average_token_latency: f64,
    /// Chunks sent
    pub chunks_sent: usize,
}

impl Default for StreamingMetrics {
    fn default() -> Self {
        Self {
            time_to_first_token: 0,
            time_to_last_token: 0,
            total_tokens: 0,
            average_token_latency: 0.0,
            chunks_sent: 0,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   STREAM BUFFER
// ═══════════════════════════════════════════════════════════════

/// Buffering strategy for streaming
pub struct StreamBuffer {
    buffer: String,
    threshold: usize,
    last_flush: std::time::Instant,
    flush_interval: std::time::Duration,
}

impl StreamBuffer {
    pub fn new(threshold: usize, flush_interval_ms: u64) -> Self {
        Self {
            buffer: String::new(),
            threshold,
            last_flush: std::time::Instant::now(),
            flush_interval: std::time::Duration::from_millis(flush_interval_ms),
        }
    }

    /// Push token and return chunk if buffer should flush
    pub fn push(&mut self, token: String) -> Option<String> {
        self.buffer.push_str(&token);

        // Flush if buffer full or time elapsed
        if self.buffer.len() >= self.threshold || self.last_flush.elapsed() > self.flush_interval {
            let chunk = self.buffer.clone();
            self.buffer.clear();
            self.last_flush = std::time::Instant::now();
            Some(chunk)
        } else {
            None
        }
    }

    /// Force flush remaining buffer
    pub fn flush(&mut self) -> Option<String> {
        if self.buffer.is_empty() {
            None
        } else {
            let chunk = self.buffer.clone();
            self.buffer.clear();
            Some(chunk)
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   STREAMING UTILITIES
// ═══════════════════════════════════════════════════════════════

/// Tokenize text into words (simple whitespace split)
pub fn tokenize(text: &str) -> Vec<String> {
    text.split_whitespace().map(|s| format!("{} ", s)).collect()
}

/// Send stream chunk through channel
pub async fn send_chunk(
    channel: &Channel<StreamChunk>,
    chunk: String,
    chunk_type: ChunkType,
    metadata: Option<ChunkMetadata>,
) -> TitaneResult<()> {
    let stream_chunk = StreamChunk {
        chunk,
        chunk_type,
        metadata,
        timestamp: chrono::Utc::now().timestamp_millis(),
    };

    channel
        .send(stream_chunk)
        .map_err(|e| TitaneError::InternalError(format!("Failed to send chunk: {}", e)))
}

/// Create a simple text stream from a string
pub fn create_text_stream(
    text: String,
    buffer_threshold: usize,
    flush_interval_ms: u64,
) -> impl Stream<Item = TitaneResult<StreamChunk>> {
    let tokens = tokenize(&text);
    let mut buffer = StreamBuffer::new(buffer_threshold, flush_interval_ms);
    let mut position = 0;
    let total = tokens.len();

    async_stream::stream! {
        for token in tokens {
            if let Some(chunk) = buffer.push(token) {
                yield Ok(StreamChunk {
                    chunk,
                    chunk_type: ChunkType::Token,
                    metadata: Some(ChunkMetadata {
                        stage: Some("generating".to_string()),
                        confidence: None,
                        position: Some(position),
                        total_tokens: Some(total),
                    }),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                });
                position += 1;
            }
        }

        // Flush remaining
        if let Some(chunk) = buffer.flush() {
            yield Ok(StreamChunk {
                chunk,
                chunk_type: ChunkType::Token,
                metadata: Some(ChunkMetadata {
                    stage: Some("generating".to_string()),
                    confidence: None,
                    position: Some(position),
                    total_tokens: Some(total),
                }),
                timestamp: chrono::Utc::now().timestamp_millis(),
            });
        }

        // Send completion
        yield Ok(StreamChunk {
            chunk: String::new(),
            chunk_type: ChunkType::Complete,
            metadata: Some(ChunkMetadata {
                stage: Some("complete".to_string()),
                confidence: Some(1.0),
                position: Some(total),
                total_tokens: Some(total),
            }),
            timestamp: chrono::Utc::now().timestamp_millis(),
        });
    }
}

/// Stream handler that forwards chunks to a channel
pub async fn stream_to_channel<S>(
    mut stream: S,
    channel: Channel<StreamChunk>,
) -> TitaneResult<StreamingMetrics>
where
    S: Stream<Item = TitaneResult<StreamChunk>> + Unpin,
{
    let start = std::time::Instant::now();
    let mut metrics = StreamingMetrics::default();
    let mut first_token = true;

    while let Some(result) = stream.next().await {
        match result {
            Ok(chunk) => {
                if first_token && chunk.chunk_type == ChunkType::Token {
                    metrics.time_to_first_token = start.elapsed().as_millis() as u64;
                    first_token = false;
                }

                if chunk.chunk_type == ChunkType::Token {
                    metrics.total_tokens += 1;
                }

                metrics.chunks_sent += 1;

                if let Err(e) = channel.send(chunk) {
                    tracing::error!("Failed to send chunk: {}", e);
                    break;
                }
            }
            Err(e) => {
                tracing::error!("Stream error: {}", e);
                let _ = channel.send(StreamChunk {
                    chunk: e.to_string(),
                    chunk_type: ChunkType::Error,
                    metadata: None,
                    timestamp: chrono::Utc::now().timestamp_millis(),
                });
                break;
            }
        }
    }

    metrics.time_to_last_token = start.elapsed().as_millis() as u64;
    if metrics.total_tokens > 0 {
        metrics.average_token_latency =
            metrics.time_to_last_token as f64 / metrics.total_tokens as f64;
    }

    Ok(metrics)
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tokenize() {
        let text = "Hello world from TITANE";
        let tokens = tokenize(text);
        assert_eq!(tokens.len(), 4);
        assert_eq!(tokens[0], "Hello ");
        assert_eq!(tokens[3], "TITANE ");
    }

    #[test]
    fn test_stream_buffer() {
        let mut buffer = StreamBuffer::new(10, 1000);

        // Below threshold
        assert!(buffer.push("hi".to_string()).is_none());

        // Above threshold
        let chunk = buffer.push("world test".to_string());
        assert!(chunk.is_some());
        assert_eq!(
            chunk.expect("chunk should exist once threshold is exceeded"),
            "hiworld test"
        );
    }

    #[test]
    fn test_stream_buffer_flush() {
        let mut buffer = StreamBuffer::new(100, 1000);
        buffer.push("hello".to_string());

        let chunk = buffer.flush();
        assert!(chunk.is_some());
        assert_eq!(
            chunk.expect("flush should return buffered content"),
            "hello"
        );

        // Empty after flush
        assert!(buffer.flush().is_none());
    }

    #[tokio::test]
    async fn test_create_text_stream() {
        let text = "Hello world".to_string();
        let stream = create_text_stream(text, 10, 50);
        tokio::pin!(stream);

        let mut chunks = Vec::new();
        while let Some(result) = stream.next().await {
            if let Ok(chunk) = result {
                chunks.push(chunk);
            }
        }

        // Should have at least 2 chunks (tokens + complete)
        assert!(chunks.len() >= 2);

        // Last chunk should be Complete
        assert_eq!(
            chunks
                .last()
                .expect("stream should produce at least one chunk")
                .chunk_type,
            ChunkType::Complete
        );
    }

    #[test]
    fn test_chunk_metadata() {
        let metadata = ChunkMetadata {
            stage: Some("thinking".to_string()),
            confidence: Some(0.95),
            position: Some(5),
            total_tokens: Some(10),
        };

        let json = serde_json::to_string(&metadata)
            .expect("metadata serialization should succeed");
        assert!(json.contains("thinking"));
        assert!(json.contains("0.95"));
    }
}
