use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use std::time::SystemTime;
use tokio::sync::RwLock;

/// Macro for safe mutex locking with auto-recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[Metrics] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

/// Type de métrique
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MetricType {
    Counter,   // Valeur qui ne fait qu'augmenter
    Gauge,     // Valeur qui peut monter et descendre
    Histogram, // Distribution de valeurs
}

/// Point de métrique avec timestamp
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricPoint {
    pub value: f64,
    #[serde(with = "systemtime_serde")]
    pub timestamp: SystemTime,
    pub labels: HashMap<String, String>,
}

/// Série temporelle de métriques
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricSeries {
    pub name: String,
    pub metric_type: MetricType,
    pub values: VecDeque<MetricPoint>,
    pub max_points: usize,
}

impl MetricSeries {
    pub fn new(name: String, metric_type: MetricType, max_points: usize) -> Self {
        Self {
            name,
            metric_type,
            values: VecDeque::with_capacity(max_points),
            max_points,
        }
    }

    pub fn add_point(&mut self, value: f64, labels: HashMap<String, String>) {
        let point = MetricPoint {
            value,
            timestamp: SystemTime::now(),
            labels,
        };

        if self.values.len() >= self.max_points {
            self.values.pop_front();
        }

        self.values.push_back(point);
    }

    pub fn last_value(&self) -> Option<f64> {
        self.values.back().map(|p| p.value)
    }

    pub fn average(&self) -> f64 {
        if self.values.is_empty() {
            return 0.0;
        }

        let sum: f64 = self.values.iter().map(|p| p.value).sum();
        sum / self.values.len() as f64
    }

    pub fn max(&self) -> Option<f64> {
        self.values
            .iter()
            .map(|p| p.value)
            .fold(None, |max, v| Some(max.map_or(v, |m: f64| m.max(v))))
    }

    pub fn min(&self) -> Option<f64> {
        self.values
            .iter()
            .map(|p| p.value)
            .fold(None, |min, v| Some(min.map_or(v, |m: f64| m.min(v))))
    }
}

/// Collecteur de métriques
pub struct MetricsCollector {
    metrics: Arc<RwLock<HashMap<String, MetricSeries>>>,
}

impl MetricsCollector {
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Incrémente un compteur
    pub async fn increment_counter(&self, name: &str, labels: HashMap<String, String>) {
        let mut metrics = self.metrics.write().await;

        let series = metrics
            .entry(name.to_string())
            .or_insert_with(|| MetricSeries::new(name.to_string(), MetricType::Counter, 1000));

        let last_value = series.last_value().unwrap_or(0.0);
        series.add_point(last_value + 1.0, labels);
    }

    /// Incrémente un compteur d'une valeur spécifique
    pub async fn increment_counter_by(
        &self,
        name: &str,
        value: f64,
        labels: HashMap<String, String>,
    ) {
        let mut metrics = self.metrics.write().await;

        let series = metrics
            .entry(name.to_string())
            .or_insert_with(|| MetricSeries::new(name.to_string(), MetricType::Counter, 1000));

        let last_value = series.last_value().unwrap_or(0.0);
        series.add_point(last_value + value, labels);
    }

    /// Met à jour une gauge
    pub async fn set_gauge(&self, name: &str, value: f64, labels: HashMap<String, String>) {
        let mut metrics = self.metrics.write().await;

        let series = metrics
            .entry(name.to_string())
            .or_insert_with(|| MetricSeries::new(name.to_string(), MetricType::Gauge, 1000));

        series.add_point(value, labels);
    }

    /// Enregistre une valeur histogram (durée, latence, etc.)
    pub async fn record_histogram(&self, name: &str, value: f64, labels: HashMap<String, String>) {
        let mut metrics = self.metrics.write().await;

        let series = metrics
            .entry(name.to_string())
            .or_insert_with(|| MetricSeries::new(name.to_string(), MetricType::Histogram, 1000));

        series.add_point(value, labels);
    }

    /// Récupère une série complète
    pub async fn get_metric_series(&self, name: &str) -> Option<MetricSeries> {
        let metrics = self.metrics.read().await;
        metrics.get(name).cloned()
    }

    /// Liste toutes les métriques
    pub async fn list_metrics(&self) -> Vec<String> {
        let metrics = self.metrics.read().await;
        metrics.keys().cloned().collect()
    }

    /// Récupère toutes les métriques d'un core spécifique
    pub async fn get_core_metrics(&self, core_name: &str) -> Vec<MetricSeries> {
        let metrics = self.metrics.read().await;
        let prefix = format!("{}.", core_name);

        metrics
            .iter()
            .filter(|(name, _)| name.starts_with(&prefix))
            .map(|(_, series)| series.clone())
            .collect()
    }

    /// Compte le nombre de métriques
    pub async fn count(&self) -> usize {
        let metrics = self.metrics.read().await;
        metrics.len()
    }

    /// Vide toutes les métriques
    pub async fn clear(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.clear();
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques agrégées d'une métrique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricStats {
    pub name: String,
    pub count: usize,
    pub average: f64,
    pub min: f64,
    pub max: f64,
    pub last: f64,
}

impl MetricStats {
    pub fn from_series(series: &MetricSeries) -> Self {
        Self {
            name: series.name.clone(),
            count: series.values.len(),
            average: series.average(),
            min: series.min().unwrap_or(0.0),
            max: series.max().unwrap_or(0.0),
            last: series.last_value().unwrap_or(0.0),
        }
    }
}

// Helper pour serialization SystemTime (réutilisé depuis logging)
mod systemtime_serde {
    use serde::{Deserialize, Deserializer, Serialize, Serializer};
    use std::time::{Duration, SystemTime, UNIX_EPOCH};

    pub fn serialize<S>(time: &SystemTime, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let duration = time
            .duration_since(UNIX_EPOCH)
            .unwrap_or(Duration::from_secs(0));
        duration.as_secs().serialize(serializer)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<SystemTime, D::Error>
    where
        D: Deserializer<'de>,
    {
        let secs = u64::deserialize(deserializer)?;
        Ok(UNIX_EPOCH + Duration::from_secs(secs))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_counter_increment() {
        let collector = MetricsCollector::new();

        collector
            .increment_counter("test.counter", HashMap::new())
            .await;
        collector
            .increment_counter("test.counter", HashMap::new())
            .await;
        collector
            .increment_counter("test.counter", HashMap::new())
            .await;

        let series = collector
            .get_metric_series("test.counter")
            .await
            .expect("metric series test.counter should exist");
        assert_eq!(
            series
                .last_value()
                .expect("test.counter should have a last value"),
            3.0
        );
        assert_eq!(series.metric_type, MetricType::Counter);
    }

    #[tokio::test]
    async fn test_gauge_set() {
        let collector = MetricsCollector::new();

        collector.set_gauge("test.cpu", 45.5, HashMap::new()).await;
        collector.set_gauge("test.cpu", 67.2, HashMap::new()).await;

        let series = collector
            .get_metric_series("test.cpu")
            .await
            .expect("metric series test.cpu should exist");
        assert_eq!(
            series
                .last_value()
                .expect("test.cpu should have a last value"),
            67.2
        );
        assert_eq!(series.values.len(), 2);
    }

    #[tokio::test]
    async fn test_histogram_record() {
        let collector = MetricsCollector::new();

        collector
            .record_histogram("test.latency", 10.5, HashMap::new())
            .await;
        collector
            .record_histogram("test.latency", 20.3, HashMap::new())
            .await;
        collector
            .record_histogram("test.latency", 15.7, HashMap::new())
            .await;

        let series = collector
            .get_metric_series("test.latency")
            .await
            .expect("metric series test.latency should exist");
        assert_eq!(series.values.len(), 3);

        let avg = series.average();
        assert!((avg - 15.5).abs() < 0.1); // Moyenne proche de 15.5
    }

    #[tokio::test]
    async fn test_metric_series_stats() {
        let mut series = MetricSeries::new("test".into(), MetricType::Gauge, 100);

        series.add_point(10.0, HashMap::new());
        series.add_point(20.0, HashMap::new());
        series.add_point(30.0, HashMap::new());

        assert_eq!(series.average(), 20.0);
        assert_eq!(series.min().expect("min should exist"), 10.0);
        assert_eq!(series.max().expect("max should exist"), 30.0);
        assert_eq!(series.last_value().expect("last_value should exist"), 30.0);
    }

    #[tokio::test]
    async fn test_list_metrics() {
        let collector = MetricsCollector::new();

        collector
            .set_gauge("helios.cpu", 50.0, HashMap::new())
            .await;
        collector
            .set_gauge("helios.ram", 60.0, HashMap::new())
            .await;
        collector
            .set_gauge("nexus.coherence", 0.9, HashMap::new())
            .await;

        let all = collector.list_metrics().await;
        assert_eq!(all.len(), 3);

        let helios_metrics = collector.get_core_metrics("helios").await;
        assert_eq!(helios_metrics.len(), 2);
    }

    #[tokio::test]
    async fn test_metric_stats() {
        let mut series = MetricSeries::new("test".into(), MetricType::Histogram, 100);

        for i in 1..=10 {
            series.add_point(i as f64, HashMap::new());
        }

        let stats = MetricStats::from_series(&series);
        assert_eq!(stats.count, 10);
        assert_eq!(stats.min, 1.0);
        assert_eq!(stats.max, 10.0);
        assert_eq!(stats.average, 5.5);
        assert_eq!(stats.last, 10.0);
    }

    #[tokio::test]
    async fn test_max_points_respected() {
        let mut series = MetricSeries::new("test".into(), MetricType::Counter, 3);

        for i in 0..5 {
            series.add_point(i as f64, HashMap::new());
        }

        assert_eq!(series.values.len(), 3);
        // Les 3 dernières valeurs: 2, 3, 4
        assert_eq!(series.values[0].value, 2.0);
        assert_eq!(series.values[2].value, 4.0);
    }
}
