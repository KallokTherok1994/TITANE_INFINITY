// TITANE∞ v13 - Vector Store with HNSW
// Stockage vectoriel haute performance avec index HNSW (Hierarchical Navigable Small World)

use instant_distance::{Builder, HnswMap, Point, Search};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, BufWriter};
use std::path::{Path, PathBuf};

/// Point vectoriel avec identifiant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorPoint {
    pub id: String,
    pub vector: Vec<f32>,
    pub metadata: HashMap<String, String>,
}

impl Point for VectorPoint {
    fn distance(&self, other: &Self) -> f32 {
        cosine_distance(&self.vector, &other.vector)
    }
}

/// Store vectoriel HNSW
pub struct VectorStore {
    dimensions: usize,
    points: HashMap<String, VectorPoint>,
    hnsw_index: Option<HnswMap<VectorPoint, String>>,
    index_path: PathBuf,
}

impl VectorStore {
    /// Crée un nouveau vector store
    pub fn new(dimensions: usize, index_path: PathBuf) -> Self {
        Self {
            dimensions,
            points: HashMap::new(),
            hnsw_index: None,
            index_path,
        }
    }

    /// Ajoute un point vectoriel
    pub fn add_point(&mut self, point: VectorPoint) -> Result<(), VectorStoreError> {
        if point.vector.len() != self.dimensions {
            return Err(VectorStoreError::DimensionMismatch {
                expected: self.dimensions,
                got: point.vector.len(),
            });
        }

        self.points.insert(point.id.clone(), point);
        // L'index sera reconstruit lors du prochain build()
        self.hnsw_index = None;
        Ok(())
    }

    /// Ajoute plusieurs points en batch
    pub fn add_points(&mut self, points: Vec<VectorPoint>) -> Result<(), VectorStoreError> {
        for point in points {
            self.add_point(point)?;
        }
        Ok(())
    }

    /// Construit l'index HNSW
    pub fn build_index(&mut self) -> Result<(), VectorStoreError> {
        if self.points.is_empty() {
            return Err(VectorStoreError::EmptyStore);
        }

        let points_vec: Vec<VectorPoint> = self.points.values().cloned().collect();
        let values: Vec<String> = points_vec.iter().map(|p| p.id.clone()).collect();

        let hnsw = Builder::default()
            .seed(42)
            .build(points_vec, values);

        self.hnsw_index = Some(hnsw);
        Ok(())
    }

    /// Recherche kNN (k plus proches voisins)
    pub fn search_knn(
        &self,
        query_vector: &[f32],
        k: usize,
    ) -> Result<Vec<SearchResultKNN>, VectorStoreError> {
        if query_vector.len() != self.dimensions {
            return Err(VectorStoreError::DimensionMismatch {
                expected: self.dimensions,
                got: query_vector.len(),
            });
        }

        let hnsw = self
            .hnsw_index
            .as_ref()
            .ok_or(VectorStoreError::IndexNotBuilt)?;

        // Crée un point temporaire pour la recherche
        let query_point = VectorPoint {
            id: "__query__".to_string(),
            vector: query_vector.to_vec(),
            metadata: HashMap::new(),
        };

        let mut search = Search::default();
        let results = hnsw.search(&query_point, &mut search);

        let mut knn_results = Vec::new();
        for item in results.into_iter().take(k) {
            if let Some(point) = self.points.get(item.value) {
                let distance = cosine_distance(query_vector, &point.vector);
                let similarity = 1.0 - distance;

                knn_results.push(SearchResultKNN {
                    id: point.id.clone(),
                    similarity,
                    distance,
                    metadata: point.metadata.clone(),
                });
            }
        }

        Ok(knn_results)
    }

    /// Recherche avec filtre
    pub fn search_filtered(
        &self,
        query_vector: &[f32],
        k: usize,
        filter: impl Fn(&HashMap<String, String>) -> bool,
    ) -> Result<Vec<SearchResultKNN>, VectorStoreError> {
        let mut all_results = self.search_knn(query_vector, k * 3)?; // Sur-échantillonne
        all_results.retain(|r| filter(&r.metadata));
        all_results.truncate(k);
        Ok(all_results)
    }

    /// Sauvegarde l'index sur disque
    pub fn save(&self) -> Result<(), VectorStoreError> {
        // Crée le répertoire si nécessaire
        if let Some(parent) = self.index_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| VectorStoreError::IoError(e.to_string()))?;
        }

        // Sauvegarde les points
        let points_path = self.index_path.with_extension("points.json");
        let file = File::create(&points_path).map_err(|e| VectorStoreError::IoError(e.to_string()))?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &self.points)
            .map_err(|e| VectorStoreError::SerializationError(e.to_string()))?;

        // Sauvegarde l'index HNSW (si construit)
        if let Some(_hnsw) = &self.hnsw_index {
            // Note: instant-distance ne supporte pas la sérialisation directe
            // On reconstruira l'index au chargement
            // Alternativement, on pourrait utiliser bincode pour sérialiser les points
        }

        Ok(())
    }

    /// Charge l'index depuis le disque
    pub fn load(index_path: PathBuf) -> Result<Self, VectorStoreError> {
        let points_path = index_path.with_extension("points.json");
        
        if !points_path.exists() {
            return Err(VectorStoreError::IoError("Index file not found".to_string()));
        }

        let file = File::open(&points_path).map_err(|e| VectorStoreError::IoError(e.to_string()))?;
        let reader = BufReader::new(file);
        let points: HashMap<String, VectorPoint> = serde_json::from_reader(reader)
            .map_err(|e| VectorStoreError::SerializationError(e.to_string()))?;

        // Détermine les dimensions depuis le premier point
        let dimensions = points
            .values()
            .next()
            .map(|p| p.vector.len())
            .unwrap_or(384);

        let mut store = Self {
            dimensions,
            points,
            hnsw_index: None,
            index_path,
        };

        // Reconstruit l'index HNSW
        if !store.points.is_empty() {
            store.build_index()?;
        }

        Ok(store)
    }

    /// Retourne le nombre de points
    pub fn len(&self) -> usize {
        self.points.len()
    }

    /// Vérifie si le store est vide
    pub fn is_empty(&self) -> bool {
        self.points.is_empty()
    }

    /// Supprime un point
    pub fn remove_point(&mut self, id: &str) -> Option<VectorPoint> {
        let removed = self.points.remove(id);
        if removed.is_some() {
            self.hnsw_index = None; // Invalide l'index
        }
        removed
    }

    /// Met à jour un point
    pub fn update_point(&mut self, point: VectorPoint) -> Result<(), VectorStoreError> {
        if point.vector.len() != self.dimensions {
            return Err(VectorStoreError::DimensionMismatch {
                expected: self.dimensions,
                got: point.vector.len(),
            });
        }

        self.points.insert(point.id.clone(), point);
        self.hnsw_index = None; // Invalide l'index
        Ok(())
    }

    /// Optimise l'index (reconstruction complète)
    pub fn optimize(&mut self) -> Result<(), VectorStoreError> {
        self.build_index()
    }
}

/// Résultat de recherche kNN
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResultKNN {
    pub id: String,
    pub similarity: f32,
    pub distance: f32,
    pub metadata: HashMap<String, String>,
}

/// Erreurs du vector store
#[derive(Debug)]
pub enum VectorStoreError {
    DimensionMismatch { expected: usize, got: usize },
    IndexNotBuilt,
    EmptyStore,
    IoError(String),
    SerializationError(String),
}

impl std::fmt::Display for VectorStoreError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            VectorStoreError::DimensionMismatch { expected, got } => {
                write!(f, "Dimension mismatch: expected {}, got {}", expected, got)
            }
            VectorStoreError::IndexNotBuilt => write!(f, "HNSW index not built"),
            VectorStoreError::EmptyStore => write!(f, "Vector store is empty"),
            VectorStoreError::IoError(e) => write!(f, "IO error: {}", e),
            VectorStoreError::SerializationError(e) => write!(f, "Serialization error: {}", e),
        }
    }
}

impl std::error::Error for VectorStoreError {}

/// Calcule la distance cosinus entre deux vecteurs
pub fn cosine_distance(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() {
        return 1.0; // Distance maximale si dimensions différentes
    }

    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let magnitude_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let magnitude_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if magnitude_a == 0.0 || magnitude_b == 0.0 {
        return 1.0;
    }

    let similarity = dot_product / (magnitude_a * magnitude_b);
    1.0 - similarity.clamp(-1.0, 1.0)
}

/// Calcule la similarité cosinus (1 - distance)
pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    1.0 - cosine_distance(a, b)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cosine_distance() {
        let v1 = vec![1.0, 0.0, 0.0];
        let v2 = vec![1.0, 0.0, 0.0];
        assert!((cosine_distance(&v1, &v2) - 0.0).abs() < 0.001);

        let v3 = vec![1.0, 0.0, 0.0];
        let v4 = vec![0.0, 1.0, 0.0];
        assert!((cosine_distance(&v3, &v4) - 1.0).abs() < 0.001);
    }

    #[test]
    fn test_vector_store_basic() {
        let temp_dir = std::env::temp_dir();
        let index_path = temp_dir.join("test_vector_store");
        let mut store = VectorStore::new(3, index_path);

        let point = VectorPoint {
            id: "doc1".to_string(),
            vector: vec![1.0, 0.0, 0.0],
            metadata: HashMap::new(),
        };

        assert!(store.add_point(point).is_ok());
        assert_eq!(store.len(), 1);
    }

    #[test]
    fn test_vector_store_search() {
        let temp_dir = std::env::temp_dir();
        let index_path = temp_dir.join("test_vector_search");
        let mut store = VectorStore::new(3, index_path);

        // Ajoute des points
        for i in 0..10 {
            let point = VectorPoint {
                id: format!("doc{}", i),
                vector: vec![i as f32, 0.0, 0.0],
                metadata: HashMap::new(),
            };
            store.add_point(point).unwrap();
        }

        // Construit l'index
        store.build_index().unwrap();

        // Recherche
        let query = vec![5.0, 0.0, 0.0];
        let results = store.search_knn(&query, 3).unwrap();

        assert_eq!(results.len(), 3);
        assert_eq!(results[0].id, "doc5");
    }
}
