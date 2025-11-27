// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v23 — AVATAR MODULE
//   Immersive Avatar Engine + Commands + Self-Test
// ═══════════════════════════════════════════════════════════════════════════════

pub mod immersive_avatar_engine;
pub mod avatar_commands;
pub mod avatar_selftest;

pub use immersive_avatar_engine::{
    ImmersiveAvatarEngine,
    ImmersiveVoiceProfile,
    ProsodyControl,
    LipSyncModel,
    ExpressionModel,
    FacialExpression,
    AvatarEngineGlobal,
};
