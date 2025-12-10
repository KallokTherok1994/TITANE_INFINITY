#![allow(unused_imports)]
#![allow(dead_code)]
// Message Bus System
use crate::agents::AgentId;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentMessage {
    Request {
        from: AgentId,
        to: AgentId,
        payload: String,
    },
    Response {
        from: AgentId,
        to: AgentId,
        payload: String,
    },
    Broadcast {
        from: AgentId,
        payload: String,
    },
    Shutdown,
}

pub struct MessageChannel {
    sender: mpsc::UnboundedSender<AgentMessage>,
    receiver: mpsc::UnboundedReceiver<AgentMessage>,
}

impl MessageChannel {
    pub fn new() -> Self {
        let (sender, receiver) = mpsc::unbounded_channel();
        Self { sender, receiver }
    }
    pub async fn send(&self, msg: AgentMessage) -> Result<(), String> {
        self.sender
            .send(msg)
            .map_err(|e| format!("Send error: {}", e))
    }
    pub async fn recv(&mut self) -> Option<AgentMessage> {
        self.receiver.recv().await
    }
}

pub struct MessageBus {
    channels: std::collections::HashMap<AgentId, MessageChannel>,
}

impl MessageBus {
    pub fn new() -> Self {
        Self {
            channels: std::collections::HashMap::new(),
        }
    }
    pub fn register_agent(&mut self, id: AgentId) -> MessageChannel {
        let channel = MessageChannel::new();
        self.channels.insert(id, channel);
        MessageChannel::new()
    }
}
