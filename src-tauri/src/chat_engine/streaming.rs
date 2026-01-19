use tokio::sync::mpsc;

use super::types::StreamChunk;

pub type StreamSender = mpsc::Sender<StreamChunk>;
pub type StreamReceiver = mpsc::Receiver<StreamChunk>;

pub fn new_stream_channel(buffer: usize) -> (StreamSender, StreamReceiver) {
    mpsc::channel(buffer)
}

pub fn chunk_text(
    text: &str,
    chunk_size: usize,
    conversation_id: &str,
    message_id: &str,
) -> Vec<StreamChunk> {
    if text.is_empty() {
        return Vec::new();
    }

    // Pre-allocate capacity to avoid reallocations
    let estimated_chunks = (text.len() + chunk_size - 1) / chunk_size;
    let mut chunks = Vec::with_capacity(estimated_chunks);
    let mut ordinal: u32 = 0;
    
    // Cache &str allocations (use .to_owned() instead of .to_string())
    let conv_id = conversation_id.to_owned();
    let msg_id = message_id.to_owned();

    for slice in text.as_bytes().chunks(chunk_size) {
        let content = String::from_utf8_lossy(slice).to_string();
        chunks.push(StreamChunk {
            conversation_id: conv_id.clone(),
            message_id: msg_id.clone(),
            ordinal,
            content,
            done: false,
        });
        ordinal += 1;
    }

    chunks
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_stream_channel() {
        let (tx, mut rx) = new_stream_channel(10);

        // Sender should be able to send
        let chunk = StreamChunk {
            conversation_id: "conv".to_string(),
            message_id: "msg".to_string(),
            ordinal: 0,
            content: "test".to_string(),
            done: false,
        };

        // Use try_send for non-async test
        assert!(tx.try_send(chunk).is_ok());

        // Receiver should be able to receive
        let received = rx.try_recv();
        assert!(received.is_ok());
        let received = received.expect("receiver should be able to receive");
        assert_eq!(received.content, "test");
    }

    #[test]
    fn test_new_stream_channel_buffer_size() {
        let (tx, _rx) = new_stream_channel(3);

        // Should be able to send up to buffer size
        for i in 0..3 {
            let chunk = StreamChunk {
                conversation_id: "c".to_string(),
                message_id: "m".to_string(),
                ordinal: i,
                content: format!("chunk {}", i),
                done: false,
            };
            assert!(tx.try_send(chunk).is_ok());
        }

        // Fourth send should fail (buffer full)
        let overflow_chunk = StreamChunk {
            conversation_id: "c".to_string(),
            message_id: "m".to_string(),
            ordinal: 3,
            content: "overflow".to_string(),
            done: false,
        };
        assert!(tx.try_send(overflow_chunk).is_err());
    }

    #[test]
    fn test_chunk_text_empty() {
        let chunks = chunk_text("", 100, "conv", "msg");
        assert!(chunks.is_empty());
    }

    #[test]
    fn test_chunk_text_single_chunk() {
        let chunks = chunk_text("Hello", 100, "conv-1", "msg-1");

        assert_eq!(chunks.len(), 1);
        assert_eq!(chunks[0].conversation_id, "conv-1");
        assert_eq!(chunks[0].message_id, "msg-1");
        assert_eq!(chunks[0].ordinal, 0);
        assert_eq!(chunks[0].content, "Hello");
        assert!(!chunks[0].done);
    }

    #[test]
    fn test_chunk_text_multiple_chunks() {
        let text = "Hello World!"; // 12 chars
        let chunks = chunk_text(text, 5, "conv", "msg");

        assert_eq!(chunks.len(), 3); // "Hello", " Worl", "d!"
        assert_eq!(chunks[0].ordinal, 0);
        assert_eq!(chunks[1].ordinal, 1);
        assert_eq!(chunks[2].ordinal, 2);
    }

    #[test]
    fn test_chunk_text_exact_boundary() {
        let text = "ABCDEF"; // 6 chars
        let chunks = chunk_text(text, 3, "conv", "msg");

        assert_eq!(chunks.len(), 2);
        assert_eq!(chunks[0].content, "ABC");
        assert_eq!(chunks[1].content, "DEF");
    }

    #[test]
    fn test_chunk_text_ordinals_sequential() {
        let text = "A".repeat(100);
        let chunks = chunk_text(&text, 10, "conv", "msg");

        assert_eq!(chunks.len(), 10);
        for (i, chunk) in chunks.iter().enumerate() {
            assert_eq!(chunk.ordinal, i as u32);
        }
    }

    #[test]
    fn test_chunk_text_preserves_ids() {
        let chunks = chunk_text("Test message", 3, "my-conv-id", "my-msg-id");

        for chunk in &chunks {
            assert_eq!(chunk.conversation_id, "my-conv-id");
            assert_eq!(chunk.message_id, "my-msg-id");
        }
    }

    #[test]
    fn test_chunk_text_done_always_false() {
        let chunks = chunk_text("Some text", 2, "c", "m");

        for chunk in &chunks {
            assert!(!chunk.done);
        }
    }

    #[test]
    fn test_chunk_text_single_char_chunks() {
        let text = "ABC";
        let chunks = chunk_text(text, 1, "c", "m");

        assert_eq!(chunks.len(), 3);
        assert_eq!(chunks[0].content, "A");
        assert_eq!(chunks[1].content, "B");
        assert_eq!(chunks[2].content, "C");
    }

    #[test]
    fn test_chunk_text_chunk_size_larger_than_text() {
        let chunks = chunk_text("Hi", 1000, "c", "m");

        assert_eq!(chunks.len(), 1);
        assert_eq!(chunks[0].content, "Hi");
    }

    #[test]
    fn test_chunk_text_unicode_handling() {
        // UTF-8 multi-byte characters
        let text = "Héllo"; // é is 2 bytes
        let chunks = chunk_text(text, 10, "c", "m");

        assert_eq!(chunks.len(), 1);
        // Content should be preserved even with multi-byte chars
        assert!(chunks[0].content.contains("H"));
    }

    #[test]
    fn test_chunk_text_long_text() {
        let text = "X".repeat(10000);
        let chunks = chunk_text(&text, 100, "c", "m");

        assert_eq!(chunks.len(), 100);

        // Verify total content
        let total_len: usize = chunks.iter().map(|c| c.content.len()).sum();
        assert_eq!(total_len, 10000);
    }

    #[tokio::test]
    async fn test_stream_channel_async() {
        let (tx, mut rx) = new_stream_channel(5);

        let chunk = StreamChunk {
            conversation_id: "async-conv".to_string(),
            message_id: "async-msg".to_string(),
            ordinal: 0,
            content: "async content".to_string(),
            done: false,
        };

        tx.send(chunk)
            .await
            .expect("sending stream chunk should succeed");

        let received = rx
            .recv()
            .await
            .expect("receiving stream chunk should succeed");
        assert_eq!(received.content, "async content");
    }

    #[tokio::test]
    async fn test_stream_channel_multiple_messages() {
        let (tx, mut rx) = new_stream_channel(10);

        for i in 0..5 {
            let chunk = StreamChunk {
                conversation_id: "c".to_string(),
                message_id: "m".to_string(),
                ordinal: i,
                content: format!("msg-{}", i),
                done: i == 4,
            };
            tx.send(chunk)
                .await
                .expect("sending stream chunk should succeed");
        }

        for i in 0..5 {
            let received = rx
                .recv()
                .await
                .expect("receiving stream chunk should succeed");
            assert_eq!(received.ordinal, i);
            assert_eq!(received.content, format!("msg-{}", i));
        }
    }
}
