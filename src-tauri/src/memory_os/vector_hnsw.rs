// ═══════════════════════════════════════════════════════════════
//   HNSW VECTOR INDEX IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

use crate::memory_os::{
    MemoryOSError, MemoryOSResult, SearchResult, VectorIndex, VectorIndexConfig,
};
use hnsw_rs::prelude::*;
use std::collections::HashMap;
use std::path::Path;

/// HNSW-based Vector Index
pub struct HnswVectorIndex {
    /// HNSW index (f32, cosine distance)
    hnsw: Hnsw<'static, f32, DistCosine>,
    
    /// ID to internal index mapping
    id_map: HashMap<String, usize>,
    
    /// Internal index to ID mapping
    reverse_map: HashMap<usize, String>,
    
    /// Stored vectors (for retrieval)
    vectors: HashMap<String, Vec<f32>>,
    
    /// Configuration
    config: VectorIndexConfig,
    
    /// Next internal index
    next_idx: usize,
}

impl HnswVectorIndex {
    /// Create new HNSW index
    pub fn new(config: VectorIndexConfig) -> Self {
        let hnsw = Hnsw::<f32, DistCosine>::new(
            config.m,
            config.max_elements,
            config.ef_construction,
            config.ef_construction,
            DistCosine {},
        );
        
        Self {
            hnsw,
            id_map: HashMap::with_capacity(config.max_elements),
            reverse_map: HashMap::with_capacity(config.max_elements),
            vectors: HashMap::with_capacity(config.max_elements),
            config,
            next_idx: 0,
        }
    }
}

impl VectorIndex for HnswVectorIndex {
    fn add_vector(&mut self, id: String, vector: Vec<f32>) -> MemoryOSResult<()> {
        if vector.len() != self.config.dimension {
            return Err(MemoryOSError::VectorIndexError(format!(
                "Vector dimension mismatch: expected {}, got {}",
                self.config.dimension,
                vector.len()
            )));
        }
        
        // Check if ID already exists
        if self.id_map.contains_key(&id) {
            // Update existing vector
            if let Some(&idx) = self.id_map.get(&id) {
                // HNSW doesn't support update, so we need to remove and re-add
                // For now, just update the stored vector
                self.vectors.insert(id.clone(), vector.clone());
                return Ok(());
            }
        }
        
        // Add new vector
        let internal_idx = self.next_idx;
        
        // Insert into HNSW
        self.hnsw.insert((&vector, internal_idx));
        
        // Update mappings
        self.id_map.insert(id.clone(), internal_idx);
        self.reverse_map.insert(internal_idx, id.clone());
        self.vectors.insert(id, vector);
        
        self.next_idx += 1;
        
        Ok(())
    }
    
    fn search(&self, query: &[f32], k: usize) -> MemoryOSResult<Vec<SearchResult>> {
        if query.len() != self.config.dimension {
            return Err(MemoryOSError::SearchError(format!(
                "Query dimension mismatch: expected {}, got {}",
                self.config.dimension,
                query.len()
            )));
        }
        
        // Search HNSW
        let neighbors = self.hnsw.search(query, k, self.config.ef_construction);
        
        // Convert to SearchResult
        let results: Vec<SearchResult> = neighbors
            .iter()
            .filter_map(|neighbor| {
                let internal_idx = neighbor.d_id;
                self.reverse_map.get(&internal_idx).map(|id| {
                    SearchResult::from_distance(id.clone(), neighbor.distance)
                })
            })
            .collect();
        
        Ok(results)
    }
    
    fn remove(&mut self, id: &str) -> MemoryOSResult<()> {
        // HNSW doesn't support efficient removal
        // We mark as removed in our maps
        if let Some(idx) = self.id_map.remove(id) {
            self.reverse_map.remove(&idx);
            self.vectors.remove(id);
        }
        
        Ok(())
    }
    
    fn get_vector(&self, id: &str) -> Option<Vec<f32>> {
        self.vectors.get(id).cloned()
    }
    
    fn dimension(&self) -> usize {
        self.config.dimension
    }
    
    fn size(&self) -> usize {
        self.id_map.len()
    }
    
    fn clear(&mut self) -> MemoryOSResult<()> {
        // Create new HNSW index
        self.hnsw = Hnsw::<f32, DistCosine>::new(
            self.config.m,
            self.config.max_elements,
            self.config.ef_construction,
            self.config.ef_construction,
            DistCosine {},
        );
        
        self.id_map.clear();
        self.reverse_map.clear();
        self.vectors.clear();
        self.next_idx = 0;
        
        Ok(())
    }
    
    fn save(&self, path: &str) -> MemoryOSResult<()> {
        let path = Path::new(path);
        
        // Save metadata only (HNSW binary dump not supported in this version)
        let metadata = HnswMetadata {
            id_map: self.id_map.clone(),
            reverse_map: self.reverse_map.clone(),
            vectors: self.vectors.clone(),
            config: self.config.clone(),
            next_idx: self.next_idx,
        };
        
        let metadata_path = path.with_extension("meta");
        let metadata_json = serde_json::to_string_pretty(&metadata)?;
        std::fs::write(metadata_path, metadata_json)?;
        
        Ok(())
    }
    
    fn load(&mut self, path: &str) -> MemoryOSResult<()> {
        let path = Path::new(path);
        
        // Load metadata
        let metadata_path = path.with_extension("meta");
        let metadata_json = std::fs::read_to_string(metadata_path)?;
        let metadata: HnswMetadata = serde_json::from_str(&metadata_json)?;
        
        // Rebuild HNSW index from vectors (binary load not supported in this version)
        let new_hnsw = Hnsw::<'static, f32, DistCosine>::new(
            metadata.config.m,
            metadata.config.max_elements,
            metadata.config.ef_construction,
            metadata.config.ef_construction,
            DistCosine {},
        );
        
        // Re-insert all vectors
        for (idx, id) in &metadata.reverse_map {
            if let Some(vector) = metadata.vectors.get(id) {
                new_hnsw.insert((vector.as_slice(), *idx));
            }
        }
        
        // Update state
        self.hnsw = new_hnsw;
        self.id_map = metadata.id_map;
        self.reverse_map = metadata.reverse_map;
        self.vectors = metadata.vectors;
        self.config = metadata.config;
        self.next_idx = metadata.next_idx;
        
        Ok(())
    }
}

/// HNSW Metadata for persistence
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct HnswMetadata {
    id_map: HashMap<String, usize>,
    reverse_map: HashMap<usize, String>,
    vectors: HashMap<String, Vec<f32>>,
    config: VectorIndexConfig,
    next_idx: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_hnsw_basic() {
        let config = VectorIndexConfig::new(128);
        let mut index = HnswVectorIndex::new(config);
        
        // Add vectors
        let v1 = vec![1.0; 128];
        let v2 = vec![0.5; 128];
        
        index.add_vector("v1".to_string(), v1.clone()).unwrap();
        index.add_vector("v2".to_string(), v2.clone()).unwrap();
        
        assert_eq!(index.size(), 2);
        
        // Search
        let results = index.search(&v1, 1).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, "v1");
    }
}
