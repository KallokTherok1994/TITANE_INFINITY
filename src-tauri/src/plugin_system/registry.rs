use crate::plugin_system::{CoreDependency, CoreError, CoreInfo, CoreModule, CoreResult, EventBus, CoreEvent};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Registry pour gérer tous les cores du système
pub struct CoreRegistry {
    cores: Arc<RwLock<HashMap<String, Arc<RwLock<Box<dyn CoreModule>>>>>>,
    dependency_graph: Arc<RwLock<DependencyGraph>>,
    event_bus: Arc<EventBus>,
}

impl CoreRegistry {
    pub fn new(event_bus: Arc<EventBus>) -> Self {
        Self {
            cores: Arc::new(RwLock::new(HashMap::new())),
            dependency_graph: Arc::new(RwLock::new(DependencyGraph::new())),
            event_bus,
        }
    }

    /// Enregistre un nouveau core avec vérification des dépendances
    pub async fn register_core(&self, core: Box<dyn CoreModule>) -> CoreResult<()> {
        let name = core.name().to_string();
        let deps = core.dependencies();

        // Vérifier dépendances requises
        for dep in &deps {
            if !dep.optional {
                self.check_dependency_available(&dep).await?;
            }
        }

        // Ajouter au graphe de dépendances
        {
            let mut graph = self.dependency_graph.write().await;
            graph.add_node(&name, deps.clone());
        }

        // Stocker core
        {
            let mut cores = self.cores.write().await;
            cores.insert(name.clone(), Arc::new(RwLock::new(core)));
        }

        // Émettre événement
        self.event_bus
            .emit(CoreEvent::Registered { name })
            .await;

        Ok(())
    }

    /// Vérifie si une dépendance est disponible
    async fn check_dependency_available(&self, dep: &CoreDependency) -> CoreResult<()> {
        let cores = self.cores.read().await;

        if !cores.contains_key(&dep.name) {
            return Err(CoreError::DependencyNotFound(format!(
                "Required dependency '{}' not found",
                dep.name
            )));
        }

        // TODO: Vérifier version requirement (semver)

        Ok(())
    }

    /// Désenregistre un core
    pub async fn unregister_core(&self, name: &str) -> CoreResult<()> {
        // Vérifier qu'aucun autre core ne dépend de celui-ci
        {
            let graph = self.dependency_graph.read().await;
            let dependents = graph.find_dependents(name);

            if !dependents.is_empty() {
                return Err(CoreError::RuntimeError(format!(
                    "Cannot unregister '{}': required by {:?}",
                    name, dependents
                )));
            }
        }

        // Shutdown core
        {
            let mut cores = self.cores.write().await;
            if let Some(core_ref) = cores.remove(name) {
                let mut core = core_ref.write().await;
                core.shutdown().await?;
            }
        }

        // Retirer du graphe
        {
            let mut graph = self.dependency_graph.write().await;
            graph.remove_node(name);
        }

        self.event_bus
            .emit(CoreEvent::Unregistered {
                name: name.to_string(),
            })
            .await;

        Ok(())
    }

    /// Récupère un core par son nom
    pub async fn get_core(&self, name: &str) -> Option<Arc<RwLock<Box<dyn CoreModule>>>> {
        let cores = self.cores.read().await;
        cores.get(name).cloned()
    }

    /// Liste tous les cores enregistrés
    pub async fn list_cores(&self) -> Vec<CoreInfo> {
        let cores = self.cores.read().await;
        let mut infos = Vec::new();

        for core_ref in cores.values() {
            let core = core_ref.read().await;
            let health = core.health_check().await;

            infos.push(CoreInfo {
                name: core.name().to_string(),
                version: core.version().to_string(),
                description: core.description().to_string(),
                capabilities: core.capabilities(),
                dependencies: core.dependencies(),
                status: health.status,
            });
        }

        infos
    }

    /// Résout l'ordre d'initialisation (topological sort)
    pub async fn get_initialization_order(&self) -> CoreResult<Vec<String>> {
        let graph = self.dependency_graph.read().await;
        graph.topological_sort()
    }

    /// Compte le nombre de cores enregistrés
    pub async fn count(&self) -> usize {
        let cores = self.cores.read().await;
        cores.len()
    }
}

/// Graphe de dépendances pour résolution d'ordre
pub struct DependencyGraph {
    nodes: HashMap<String, Vec<CoreDependency>>,
}

impl DependencyGraph {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
        }
    }

    pub fn add_node(&mut self, name: &str, dependencies: Vec<CoreDependency>) {
        self.nodes.insert(name.to_string(), dependencies);
    }

    pub fn remove_node(&mut self, name: &str) {
        self.nodes.remove(name);
    }

    /// Trouve tous les cores qui dépendent d'un core donné
    pub fn find_dependents(&self, target: &str) -> Vec<String> {
        let mut dependents = Vec::new();

        for (core_name, deps) in &self.nodes {
            for dep in deps {
                if dep.name == target {
                    dependents.push(core_name.clone());
                    break;
                }
            }
        }

        dependents
    }

    /// Tri topologique pour ordre d'initialisation
    pub fn topological_sort(&self) -> CoreResult<Vec<String>> {
        let mut result = Vec::new();
        let mut visited = std::collections::HashSet::new();
        let mut temp_visited = std::collections::HashSet::new();

        for node in self.nodes.keys() {
            if !visited.contains(node) {
                self.visit_node(
                    node,
                    &mut visited,
                    &mut temp_visited,
                    &mut result,
                )?;
            }
        }

        result.reverse();
        Ok(result)
    }

    fn visit_node(
        &self,
        node: &str,
        visited: &mut std::collections::HashSet<String>,
        temp_visited: &mut std::collections::HashSet<String>,
        result: &mut Vec<String>,
    ) -> CoreResult<()> {
        if temp_visited.contains(node) {
            return Err(CoreError::RuntimeError(format!(
                "Circular dependency detected involving '{}'",
                node
            )));
        }

        if visited.contains(node) {
            return Ok(());
        }

        temp_visited.insert(node.to_string());

        if let Some(deps) = self.nodes.get(node) {
            for dep in deps {
                if !dep.optional {
                    self.visit_node(&dep.name, visited, temp_visited, result)?;
                }
            }
        }

        temp_visited.remove(node);
        visited.insert(node.to_string());
        result.push(node.to_string());

        Ok(())
    }
}

impl Default for DependencyGraph {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_trait::async_trait;
    use crate::plugin_system::{CoreContext, CoreHealth, CoreModule};

    struct MockCore {
        name: String,
        deps: Vec<CoreDependency>,
    }

    #[async_trait]
    impl CoreModule for MockCore {
        fn name(&self) -> &str {
            &self.name
        }

        fn version(&self) -> &str {
            "1.0.0"
        }

        fn description(&self) -> &str {
            "Mock core"
        }

        fn dependencies(&self) -> Vec<CoreDependency> {
            self.deps.clone()
        }

        async fn initialize(&mut self, _context: &CoreContext) -> CoreResult<()> {
            Ok(())
        }

        async fn shutdown(&mut self) -> CoreResult<()> {
            Ok(())
        }

        async fn health_check(&self) -> CoreHealth {
            CoreHealth::healthy()
        }
    }

    #[tokio::test]
    async fn test_dependency_graph_topological_sort() {
        let mut graph = DependencyGraph::new();

        // A depends on nothing
        graph.add_node("A", vec![]);

        // B depends on A
        graph.add_node(
            "B",
            vec![CoreDependency {
                name: "A".into(),
                version_req: "^1.0.0".into(),
                optional: false,
            }],
        );

        // C depends on B
        graph.add_node(
            "C",
            vec![CoreDependency {
                name: "B".into(),
                version_req: "^1.0.0".into(),
                optional: false,
            }],
        );

        let order = graph.topological_sort().unwrap();

        // A devrait être avant B, B avant C
        let a_pos = order.iter().position(|x| x == "A").unwrap();
        let b_pos = order.iter().position(|x| x == "B").unwrap();
        let c_pos = order.iter().position(|x| x == "C").unwrap();

        assert!(a_pos < b_pos);
        assert!(b_pos < c_pos);
    }

    #[tokio::test]
    async fn test_dependency_graph_circular_detection() {
        let mut graph = DependencyGraph::new();

        // A depends on B
        graph.add_node(
            "A",
            vec![CoreDependency {
                name: "B".into(),
                version_req: "^1.0.0".into(),
                optional: false,
            }],
        );

        // B depends on A (circular!)
        graph.add_node(
            "B",
            vec![CoreDependency {
                name: "A".into(),
                version_req: "^1.0.0".into(),
                optional: false,
            }],
        );

        let result = graph.topological_sort();
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_find_dependents() {
        let mut graph = DependencyGraph::new();

        graph.add_node("A", vec![]);
        graph.add_node(
            "B",
            vec![CoreDependency {
                name: "A".into(),
                version_req: "^1.0.0".into(),
                optional: false,
            }],
        );
        graph.add_node(
            "C",
            vec![CoreDependency {
                name: "A".into(),
                version_req: "^1.0.0".into(),
                optional: false,
            }],
        );

        let dependents = graph.find_dependents("A");
        assert_eq!(dependents.len(), 2);
        assert!(dependents.contains(&"B".to_string()));
        assert!(dependents.contains(&"C".to_string()));
    }
}
