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

pub mod diagnostics;
pub mod logs;
pub mod cluster;
pub mod introspection;
pub mod hypervision;

// Re-exports pour faciliter l'importation
pub use diagnostics::*;
pub use logs::*;
pub use cluster::*;
pub use introspection::*;
pub use hypervision::*;
