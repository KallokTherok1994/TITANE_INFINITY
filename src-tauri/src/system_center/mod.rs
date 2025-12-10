//! TITANE∞ v∞ — System Center Module
//!
//! Module unifié pour l'observabilité système :
//! - Diagnostics rapides/complets
//! - Logs et télémétrie
//! - Node Cluster (Mesh)
//! - Introspection code
//! - HyperVision monitoring
//!
//! © 2025 TITANE Team. All rights reserved.

pub mod cluster;
pub mod diagnostics;
pub mod hypervision;
pub mod introspection;
pub mod logs;

// Re-exports pour faciliter l'importation
pub use cluster::*;
pub use diagnostics::*;
pub use hypervision::*;
pub use introspection::*;
pub use logs::*;
