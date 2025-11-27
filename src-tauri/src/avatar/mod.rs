// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v23–v24 — AVATAR MODULE
//   Immersive Avatar Engine + Full-Body Engine + Commands + Self-Test
// ═══════════════════════════════════════════════════════════════════════════════

pub mod immersive_avatar_engine;
pub mod avatar_commands;
pub mod avatar_selftest;
pub mod fullbody; // v24 — Full-Body Avatar Engine
pub mod fullbody_commands; // v24 — Tauri Commands

pub use immersive_avatar_engine::{
    ImmersiveAvatarEngine,
    ImmersiveVoiceProfile,
    ProsodyControl,
    LipSyncModel,
    ExpressionModel,
    FacialExpression,
    AvatarEngineGlobal,
};

pub use fullbody::{
    FullBodyAvatarEngine,
    BodyProfile,
    SkeletonModel,
    Gesture,
    MotionLayer,
    ExpressionBridge,
    LipSyncFeed,
    AvatarStateBinding,
    AvatarStateSnapshot,
    SkeletonSnapshot,
    BodyPostureAI,
    PostureType,
    PostureConfiguration,
    ConversationalContext,
    get_fullbody_engine,
};
