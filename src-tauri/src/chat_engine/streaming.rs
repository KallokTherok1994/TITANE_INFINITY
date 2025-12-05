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

    let mut chunks = Vec::new();
    let mut ordinal: u32 = 0;

    for slice in text.as_bytes().chunks(chunk_size) {
        let content = String::from_utf8_lossy(slice).to_string();
        chunks.push(StreamChunk {
            conversation_id: conversation_id.to_string(),
            message_id: message_id.to_string(),
            ordinal,
            content,
            done: false,
        });
        ordinal += 1;
    }

    chunks
}
