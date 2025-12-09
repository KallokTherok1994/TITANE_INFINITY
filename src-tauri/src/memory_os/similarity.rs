// ═══════════════════════════════════════════════════════════════
//   SIMILARITY FUNCTIONS — Cosine, Euclidean, Dot Product
// ═══════════════════════════════════════════════════════════════

use crate::memory_os::types::{MemoryOSError, MemoryOSResult};

/// Similarity metric
#[derive(Debug, Clone, Copy)]
pub enum SimilarityMetric {
    Cosine,
    Euclidean,
    DotProduct,
}

/// Calculate similarity between two vectors
pub fn similarity(a: &[f32], b: &[f32], metric: SimilarityMetric) -> MemoryOSResult<f32> {
    if a.len() != b.len() {
        return Err(MemoryOSError::SearchError(format!(
            "Vector dimension mismatch: {} vs {}",
            a.len(),
            b.len()
        )));
    }
    
    match metric {
        SimilarityMetric::Cosine => Ok(cosine_similarity(a, b)),
        SimilarityMetric::Euclidean => Ok(euclidean_distance(a, b)),
        SimilarityMetric::DotProduct => Ok(dot_product(a, b)),
    }
}

/// Cosine similarity (returns value between -1 and 1)
pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot = dot_product(a, b);
    let norm_a = vector_norm(a);
    let norm_b = vector_norm(b);
    
    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }
    
    dot / (norm_a * norm_b)
}

/// Euclidean distance (lower is more similar)
pub fn euclidean_distance(a: &[f32], b: &[f32]) -> f32 {
    a.iter()
        .zip(b.iter())
        .map(|(x, y)| {
            let diff = x - y;
            diff * diff
        })
        .sum::<f32>()
        .sqrt()
}

/// Dot product
pub fn dot_product(a: &[f32], b: &[f32]) -> f32 {
    a.iter().zip(b.iter()).map(|(x, y)| x * y).sum()
}

/// Vector L2 norm
pub fn vector_norm(v: &[f32]) -> f32 {
    v.iter().map(|x| x * x).sum::<f32>().sqrt()
}

/// Normalize vector to unit length
pub fn normalize(v: &mut [f32]) {
    let norm = vector_norm(v);
    if norm > 0.0 {
        for val in v.iter_mut() {
            *val /= norm;
        }
    }
}

/// Convert distance to similarity score (0.0 - 1.0)
pub fn distance_to_similarity(distance: f32, metric: SimilarityMetric) -> f32 {
    match metric {
        SimilarityMetric::Cosine => {
            // Cosine distance is in [0, 2], convert to similarity [0, 1]
            (1.0 - distance / 2.0).max(0.0).min(1.0)
        }
        SimilarityMetric::Euclidean => {
            // Euclidean: use exponential decay
            (-distance / 10.0).exp()
        }
        SimilarityMetric::DotProduct => {
            // Dot product: assume normalized vectors, convert from [-1, 1] to [0, 1]
            (distance + 1.0) / 2.0
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_cosine_similarity() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        let c = vec![0.0, 1.0, 0.0];
        
        assert!((cosine_similarity(&a, &b) - 1.0).abs() < 1e-6);
        assert!((cosine_similarity(&a, &c) - 0.0).abs() < 1e-6);
    }
    
    #[test]
    fn test_euclidean_distance() {
        let a = vec![0.0, 0.0];
        let b = vec![3.0, 4.0];
        
        let dist = euclidean_distance(&a, &b);
        assert!((dist - 5.0).abs() < 1e-6);
    }
    
    #[test]
    fn test_normalize() {
        let mut v = vec![3.0, 4.0];
        normalize(&mut v);
        
        let norm = vector_norm(&v);
        assert!((norm - 1.0).abs() < 1e-6);
    }
}
