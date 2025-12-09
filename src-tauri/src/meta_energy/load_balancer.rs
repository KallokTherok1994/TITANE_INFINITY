//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — LOAD BALANCER
//! Super Prompt #20 — Équilibrage de charge cognitive
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::{HashMap, VecDeque};
use super::energy_model::{EnergyDimension, EnergyState};

/// Distribution de charge
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LoadDistribution {
    pub allocations: HashMap<EnergyDimension, f32>,
    pub total_load: f32,
    pub balance_score: f32,
    pub bottleneck: Option<EnergyDimension>,
}

impl LoadDistribution {
    pub fn empty() -> Self {
        Self {
            allocations: HashMap::new(),
            total_load: 0.0,
            balance_score: 1.0,
            bottleneck: None,
        }
    }

    /// Calcule le score d'équilibre (1.0 = parfait)
    pub fn calculate_balance(&mut self) {
        if self.allocations.is_empty() {
            self.balance_score = 1.0;
            return;
        }

        let values: Vec<f32> = self.allocations.values().cloned().collect();
        let mean = values.iter().sum::<f32>() / values.len() as f32;

        if mean == 0.0 {
            self.balance_score = 1.0;
            return;
        }

        let variance = values.iter()
            .map(|v| (v - mean).powi(2))
            .sum::<f32>() / values.len() as f32;

        let std_dev = variance.sqrt();
        self.balance_score = (1.0 - std_dev / mean).max(0.0);

        // Identifier le goulot d'étranglement
        self.bottleneck = self.allocations.iter()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(k, _)| *k);
    }
}

/// Métriques de charge
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct LoadMetrics {
    pub current_load: f32,
    pub peak_load: f32,
    pub average_load: f32,
    pub load_variance: f32,
    pub overload_count: u64,
    pub redistribution_count: u64,
}

/// Demande de charge
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LoadRequest {
    pub id: String,
    pub operation: String,
    pub required_dimensions: Vec<(EnergyDimension, f32)>,
    pub priority: u8,
    pub timestamp: u64,
}

impl LoadRequest {
    pub fn new(operation: &str, requirements: Vec<(EnergyDimension, f32)>) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            operation: operation.to_string(),
            required_dimensions: requirements,
            priority: 5,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
        }
    }

    pub fn with_priority(mut self, priority: u8) -> Self {
        self.priority = priority;
        self
    }

    pub fn total_load(&self) -> f32 {
        self.required_dimensions.iter().map(|(_, v)| v).sum()
    }
}

/// Résultat d'allocation de charge
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AllocationResult {
    pub request_id: String,
    pub approved: bool,
    pub allocated: HashMap<EnergyDimension, f32>,
    pub adjusted: bool,
    pub adjustment_reason: Option<String>,
    pub queued: bool,
}

/// Équilibreur de charge
pub struct LoadBalancer {
    current_distribution: RwLock<LoadDistribution>,
    pending_requests: RwLock<VecDeque<LoadRequest>>,
    active_allocations: RwLock<HashMap<String, LoadRequest>>,
    metrics: RwLock<LoadMetrics>,
    load_history: RwLock<VecDeque<f32>>,
    max_history: usize,
    config: LoadBalancerConfig,
}

impl LoadBalancer {
    pub fn new() -> Self {
        Self {
            current_distribution: RwLock::new(LoadDistribution::empty()),
            pending_requests: RwLock::new(VecDeque::new()),
            active_allocations: RwLock::new(HashMap::new()),
            metrics: RwLock::new(LoadMetrics::default()),
            load_history: RwLock::new(VecDeque::new()),
            max_history: 100,
            config: LoadBalancerConfig::default(),
        }
    }

    pub fn with_config(config: LoadBalancerConfig) -> Self {
        Self {
            current_distribution: RwLock::new(LoadDistribution::empty()),
            pending_requests: RwLock::new(VecDeque::new()),
            active_allocations: RwLock::new(HashMap::new()),
            metrics: RwLock::new(LoadMetrics::default()),
            load_history: RwLock::new(VecDeque::new()),
            max_history: 100,
            config,
        }
    }

    /// Demande une allocation de charge
    pub async fn request_allocation(
        &self,
        request: LoadRequest,
        energy_state: &EnergyState,
    ) -> AllocationResult {
        let total_requested = request.total_load();

        // Vérifier la capacité globale
        if energy_state.global_energy < self.config.min_global_for_allocation {
            return AllocationResult {
                request_id: request.id,
                approved: false,
                allocated: HashMap::new(),
                adjusted: false,
                adjustment_reason: Some("Insufficient global energy".to_string()),
                queued: false,
            };
        }

        // Vérifier chaque dimension
        let mut allocated = HashMap::new();
        let mut adjusted = false;
        let mut adjustment_reason = None;

        for (dimension, required) in &request.required_dimensions {
            let available = energy_state.dimensions
                .get(dimension)
                .map(|l| l.current)
                .unwrap_or(0.0);

            if available >= *required {
                allocated.insert(*dimension, *required);
            } else if available >= required * self.config.min_allocation_ratio {
                // Allocation partielle
                allocated.insert(*dimension, available * 0.8);
                adjusted = true;
                adjustment_reason = Some(format!("{:?} partially allocated", dimension));
            } else {
                // Pas assez de ressources
                return AllocationResult {
                    request_id: request.id,
                    approved: false,
                    allocated: HashMap::new(),
                    adjusted: false,
                    adjustment_reason: Some(format!("{:?} insufficient", dimension)),
                    queued: self.config.queue_on_failure,
                };
            }
        }

        // Enregistrer l'allocation
        let mut active = self.active_allocations.write().await;
        active.insert(request.id.clone(), request.clone());

        // Mettre à jour la distribution
        self.update_distribution(&allocated).await;

        // Mettre à jour les métriques
        let mut metrics = self.metrics.write().await;
        metrics.current_load += total_requested;
        if metrics.current_load > metrics.peak_load {
            metrics.peak_load = metrics.current_load;
        }
        if adjusted {
            metrics.redistribution_count += 1;
        }

        AllocationResult {
            request_id: request.id,
            approved: true,
            allocated,
            adjusted,
            adjustment_reason,
            queued: false,
        }
    }

    /// Libère une allocation
    pub async fn release_allocation(&self, request_id: &str) -> bool {
        let mut active = self.active_allocations.write().await;

        if let Some(request) = active.remove(request_id) {
            let released_load = request.total_load();

            let mut metrics = self.metrics.write().await;
            metrics.current_load = (metrics.current_load - released_load).max(0.0);

            // Mettre à jour la distribution
            let mut dist = self.current_distribution.write().await;
            for (dim, amount) in &request.required_dimensions {
                if let Some(current) = dist.allocations.get_mut(dim) {
                    *current = (*current - amount).max(0.0);
                }
            }
            dist.total_load = (dist.total_load - released_load).max(0.0);
            dist.calculate_balance();

            true
        } else {
            false
        }
    }

    /// Met à jour la distribution
    async fn update_distribution(&self, allocated: &HashMap<EnergyDimension, f32>) {
        let mut dist = self.current_distribution.write().await;

        for (dim, amount) in allocated {
            *dist.allocations.entry(*dim).or_insert(0.0) += amount;
        }

        dist.total_load = dist.allocations.values().sum();
        dist.calculate_balance();
    }

    /// Équilibre la charge entre les dimensions
    pub async fn rebalance(&self, energy_state: &EnergyState) -> Vec<RebalanceAction> {
        let mut dist = self.current_distribution.write().await;
        let mut actions = Vec::new();

        if dist.balance_score >= self.config.rebalance_threshold {
            return actions;
        }

        // Identifier les dimensions surchargées et sous-utilisées
        let mean_load = dist.total_load / dist.allocations.len().max(1) as f32;

        let overloaded: Vec<_> = dist.allocations.iter()
            .filter(|(_, &v)| v > mean_load * 1.3)
            .map(|(k, v)| (*k, *v))
            .collect();

        let underloaded: Vec<_> = dist.allocations.iter()
            .filter(|(_, &v)| v < mean_load * 0.7)
            .map(|(k, v)| (*k, *v))
            .collect();

        // Proposer des transferts
        for (over_dim, over_load) in &overloaded {
            let excess = over_load - mean_load;

            for (under_dim, under_load) in &underloaded {
                let capacity = energy_state.dimensions
                    .get(under_dim)
                    .map(|l| l.current)
                    .unwrap_or(0.0);

                if capacity > *under_load + excess * 0.5 {
                    actions.push(RebalanceAction {
                        from_dimension: *over_dim,
                        to_dimension: *under_dim,
                        amount: excess * 0.3,
                        reason: format!("Balance {:?} to {:?}", over_dim, under_dim),
                    });
                    break;
                }
            }
        }

        // Appliquer les actions (simulé)
        for action in &actions {
            if let Some(from) = dist.allocations.get_mut(&action.from_dimension) {
                *from -= action.amount;
            }
            if let Some(to) = dist.allocations.get_mut(&action.to_dimension) {
                *to += action.amount;
            }
        }

        dist.calculate_balance();

        let mut metrics = self.metrics.write().await;
        metrics.redistribution_count += actions.len() as u64;

        actions
    }

    /// Tick de mise à jour
    pub async fn tick(&self) {
        // Enregistrer l'historique de charge
        let metrics = self.metrics.read().await;
        let current = metrics.current_load;
        drop(metrics);

        let mut history = self.load_history.write().await;
        history.push_back(current);
        while history.len() > self.max_history {
            history.pop_front();
        }

        // Calculer la moyenne
        let avg: f32 = history.iter().sum::<f32>() / history.len().max(1) as f32;
        drop(history);

        let mut metrics = self.metrics.write().await;
        metrics.average_load = avg;

        // Variance
        let history = self.load_history.read().await;
        let variance: f32 = history.iter()
            .map(|v| (v - avg).powi(2))
            .sum::<f32>() / history.len().max(1) as f32;
        metrics.load_variance = variance;
    }

    /// Distribution actuelle
    pub async fn distribution(&self) -> LoadDistribution {
        self.current_distribution.read().await.clone()
    }

    /// Métriques
    pub async fn metrics(&self) -> LoadMetrics {
        self.metrics.read().await.clone()
    }

    /// Allocations actives
    pub async fn active_count(&self) -> usize {
        self.active_allocations.read().await.len()
    }

    /// Vérifie si une opération peut être exécutée
    pub async fn can_execute(&self, requirements: &[(EnergyDimension, f32)], state: &EnergyState) -> bool {
        for (dim, required) in requirements {
            let available = state.dimensions
                .get(dim)
                .map(|l| l.current)
                .unwrap_or(0.0);

            if available < *required * self.config.min_allocation_ratio {
                return false;
            }
        }

        state.global_energy >= self.config.min_global_for_allocation
    }

    /// Prédit la charge future
    pub async fn predict_load(&self, operations: &[LoadRequest]) -> f32 {
        let current = self.metrics.read().await.current_load;
        let additional: f32 = operations.iter().map(|r| r.total_load()).sum();
        current + additional
    }
}

impl Default for LoadBalancer {
    fn default() -> Self {
        Self::new()
    }
}

/// Action de rééquilibrage
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RebalanceAction {
    pub from_dimension: EnergyDimension,
    pub to_dimension: EnergyDimension,
    pub amount: f32,
    pub reason: String,
}

/// Configuration du load balancer
#[derive(Clone, Debug)]
pub struct LoadBalancerConfig {
    pub min_global_for_allocation: f32,
    pub min_allocation_ratio: f32,
    pub rebalance_threshold: f32,
    pub queue_on_failure: bool,
    pub max_pending_requests: usize,
}

impl Default for LoadBalancerConfig {
    fn default() -> Self {
        Self {
            min_global_for_allocation: 0.15,
            min_allocation_ratio: 0.5,
            rebalance_threshold: 0.7,
            queue_on_failure: true,
            max_pending_requests: 50,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_load_balancer() {
        let balancer = LoadBalancer::new();
        let distribution = balancer.distribution().await;
        assert_eq!(distribution.balance_score, 1.0);
    }

    #[test]
    fn test_load_request() {
        let request = LoadRequest::new(
            "test_operation",
            vec![(EnergyDimension::Cognitive, 0.2)],
        );
        assert_eq!(request.total_load(), 0.2);
    }
}
