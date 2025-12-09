//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT COMMUNICATION
//! Super Prompt #19 — Communication inter-agents
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::VecDeque;
use super::agent::AgentId;

/// Priorité de message
#[derive(Clone, Copy, Debug, PartialEq, Eq, Ord, PartialOrd, Serialize, Deserialize)]
pub enum MessagePriority {
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3,
    Critical = 4,
}

impl Default for MessagePriority {
    fn default() -> Self {
        Self::Normal
    }
}

/// Type de message
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum MessageType {
    /// Requête (attend une réponse)
    Request,
    /// Réponse à une requête
    Response,
    /// Notification (sans réponse attendue)
    Notification,
    /// Broadcast à tous les agents
    Broadcast,
    /// Événement système
    SystemEvent,
    /// Erreur
    Error,
}

/// Message inter-agent
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub from: AgentId,
    pub to: AgentId,
    pub message_type: MessageType,
    pub content: String,
    pub data: Option<serde_json::Value>,
    pub priority: MessagePriority,
    pub timestamp: u64,
    pub reply_to: Option<String>,
    pub ttl_ms: u64,
    pub delivered: bool,
    pub read: bool,
}

impl Message {
    pub fn new(from: AgentId, to: AgentId, content: &str, priority: MessagePriority) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            from,
            to,
            message_type: MessageType::Notification,
            content: content.to_string(),
            data: None,
            priority,
            timestamp: Self::now(),
            reply_to: None,
            ttl_ms: 60000,
            delivered: false,
            read: false,
        }
    }

    pub fn request(from: AgentId, to: AgentId, content: &str) -> Self {
        let mut msg = Self::new(from, to, content, MessagePriority::Normal);
        msg.message_type = MessageType::Request;
        msg
    }

    pub fn response(from: AgentId, to: AgentId, content: &str, reply_to: &str) -> Self {
        let mut msg = Self::new(from, to, content, MessagePriority::Normal);
        msg.message_type = MessageType::Response;
        msg.reply_to = Some(reply_to.to_string());
        msg
    }

    pub fn broadcast(from: AgentId, content: &str) -> Self {
        let mut msg = Self::new(from, "broadcast".to_string(), content, MessagePriority::Normal);
        msg.message_type = MessageType::Broadcast;
        msg
    }

    pub fn with_data(mut self, data: serde_json::Value) -> Self {
        self.data = Some(data);
        self
    }

    pub fn with_priority(mut self, priority: MessagePriority) -> Self {
        self.priority = priority;
        self
    }

    pub fn with_ttl(mut self, ttl_ms: u64) -> Self {
        self.ttl_ms = ttl_ms;
        self
    }

    pub fn is_expired(&self) -> bool {
        Self::now() > self.timestamp + self.ttl_ms
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Bus de messages
pub struct MessageBus {
    queues: RwLock<std::collections::HashMap<AgentId, VecDeque<Message>>>,
    history: RwLock<VecDeque<Message>>,
    max_queue_size: usize,
    max_history_size: usize,
    running: RwLock<bool>,
    stats: RwLock<MessageBusStats>,
}

impl MessageBus {
    pub fn new(max_queue_size: usize) -> Self {
        Self {
            queues: RwLock::new(std::collections::HashMap::new()),
            history: RwLock::new(VecDeque::new()),
            max_queue_size,
            max_history_size: 1000,
            running: RwLock::new(false),
            stats: RwLock::new(MessageBusStats::default()),
        }
    }

    /// Démarre le bus
    pub async fn start(&self) {
        *self.running.write().await = true;
    }

    /// Arrête le bus
    pub async fn stop(&self) {
        *self.running.write().await = false;
    }

    /// Envoie un message
    pub async fn send(&self, mut message: Message) {
        let mut queues = self.queues.write().await;
        let mut stats = self.stats.write().await;

        // Gérer le broadcast
        if message.message_type == MessageType::Broadcast {
            // Pour le broadcast, on envoie à tous les agents enregistrés
            let recipients: Vec<AgentId> = queues.keys().cloned().collect();
            for to in recipients {
                if to != message.from {
                    let mut msg_copy = message.clone();
                    msg_copy.to = to.clone();
                    msg_copy.id = uuid::Uuid::new_v4().to_string();

                    let queue = queues.entry(to).or_insert_with(VecDeque::new);
                    if queue.len() < self.max_queue_size {
                        queue.push_back(msg_copy);
                        stats.messages_sent += 1;
                    } else {
                        stats.messages_dropped += 1;
                    }
                }
            }
        } else {
            // Message direct
            let queue = queues.entry(message.to.clone()).or_insert_with(VecDeque::new);

            if queue.len() < self.max_queue_size {
                message.delivered = true;
                queue.push_back(message.clone());
                stats.messages_sent += 1;
            } else {
                stats.messages_dropped += 1;
            }
        }

        // Ajouter à l'historique
        let mut history = self.history.write().await;
        history.push_back(message);
        while history.len() > self.max_history_size {
            history.pop_front();
        }
    }

    /// Reçoit les messages pour un agent
    pub async fn receive(&self, agent_id: &AgentId) -> Vec<Message> {
        let mut queues = self.queues.write().await;
        let mut stats = self.stats.write().await;

        if let Some(queue) = queues.get_mut(agent_id) {
            let messages: Vec<_> = queue.drain(..).collect();
            stats.messages_received += messages.len() as u64;
            messages
        } else {
            Vec::new()
        }
    }

    /// Reçoit le premier message de priorité haute
    pub async fn receive_priority(&self, agent_id: &AgentId) -> Option<Message> {
        let mut queues = self.queues.write().await;

        if let Some(queue) = queues.get_mut(agent_id) {
            // Trouver le message de plus haute priorité
            let highest_idx = queue.iter()
                .enumerate()
                .max_by_key(|(_, m)| m.priority)
                .map(|(i, _)| i);

            if let Some(idx) = highest_idx {
                return queue.remove(idx);
            }
        }

        None
    }

    /// Compte les messages en attente
    pub async fn pending_count(&self, agent_id: &AgentId) -> usize {
        let queues = self.queues.read().await;
        queues.get(agent_id).map(|q| q.len()).unwrap_or(0)
    }

    /// Vérifie s'il y a des messages
    pub async fn has_messages(&self, agent_id: &AgentId) -> bool {
        self.pending_count(agent_id).await > 0
    }

    /// Nettoie les messages expirés
    pub async fn cleanup_expired(&self) {
        let mut queues = self.queues.write().await;
        let mut stats = self.stats.write().await;

        for queue in queues.values_mut() {
            let before = queue.len();
            queue.retain(|m| !m.is_expired());
            stats.messages_expired += (before - queue.len()) as u64;
        }
    }

    /// Récupère l'historique
    pub async fn history(&self, limit: usize) -> Vec<Message> {
        let history = self.history.read().await;
        history.iter().rev().take(limit).cloned().collect()
    }

    /// Récupère les messages entre deux agents
    pub async fn conversation(&self, agent_a: &AgentId, agent_b: &AgentId) -> Vec<Message> {
        let history = self.history.read().await;
        history.iter()
            .filter(|m| {
                (&m.from == agent_a && &m.to == agent_b) ||
                (&m.from == agent_b && &m.to == agent_a)
            })
            .cloned()
            .collect()
    }

    /// Statistiques
    pub async fn stats(&self) -> MessageBusStats {
        self.stats.read().await.clone()
    }

    /// Enregistre un agent
    pub async fn register_agent(&self, agent_id: &AgentId) {
        let mut queues = self.queues.write().await;
        queues.entry(agent_id.clone()).or_insert_with(VecDeque::new);
    }

    /// Désenregistre un agent
    pub async fn unregister_agent(&self, agent_id: &AgentId) {
        let mut queues = self.queues.write().await;
        queues.remove(agent_id);
    }
}

impl Default for MessageBus {
    fn default() -> Self {
        Self::new(100)
    }
}

/// Statistiques du bus
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct MessageBusStats {
    pub messages_sent: u64,
    pub messages_received: u64,
    pub messages_dropped: u64,
    pub messages_expired: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_creation() {
        let msg = Message::new(
            "agent1".to_string(),
            "agent2".to_string(),
            "Hello",
            MessagePriority::Normal,
        );

        assert!(!msg.is_expired());
    }

    #[tokio::test]
    async fn test_message_bus() {
        let bus = MessageBus::default();
        bus.register_agent(&"agent1".to_string()).await;
        bus.register_agent(&"agent2".to_string()).await;

        let msg = Message::new(
            "agent1".to_string(),
            "agent2".to_string(),
            "Hello",
            MessagePriority::Normal,
        );

        bus.send(msg).await;

        assert!(bus.has_messages(&"agent2".to_string()).await);
        let received = bus.receive(&"agent2".to_string()).await;
        assert_eq!(received.len(), 1);
        assert_eq!(received[0].content, "Hello");
    }
}
