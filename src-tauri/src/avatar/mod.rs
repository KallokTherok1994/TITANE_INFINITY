// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v23–v24 — AVATAR MODULE
//   Immersive Avatar Engine + Full-Body Engine + Commands + Self-Test
// ═══════════════════════════════════════════════════════════════════════════════

pub mod appearance_commands; // v24.5 — Tauri Appearance Commands
pub mod appearance_state; // v24.5 — Appearance State
pub mod appearance_taxonomy_engine; // v24.9 — Taxonomy Engine
pub mod avatar_commands;
pub mod avatar_display_state; // v24.12 — Display State (Floating Window)
pub mod avatar_floating_commands;
pub mod avatar_selftest;
pub mod fullbody; // v24 — Full-Body Avatar Engine
pub mod fullbody_commands; // v24 — Tauri Commands
pub mod fullbody_selftest; // v24 — Self-Tests
pub mod immersive_avatar_engine; // v24.12 — Floating Window Commands

pub use immersive_avatar_engine::{
    AvatarEngineGlobal, ExpressionModel, FacialExpression, ImmersiveAvatarEngine,
    ImmersiveVoiceProfile, LipSyncModel, ProsodyControl,
};

pub use fullbody::{
    get_fullbody_engine, AvatarStateBinding, AvatarStateSnapshot, BodyPostureAI, BodyProfile,
    ConversationalContext, ExpressionBridge, FullBodyAvatarEngine, Gesture, LipSyncFeed,
    MotionLayer, PostureConfiguration, PostureType, SkeletonModel, SkeletonSnapshot,
};

pub use appearance_state::{
    AccessoriesState, AppearanceUpdateRequest, AvatarAppearanceState, CustomStyle, Formality,
    HairLength, HairState, MakeupState, OutfitState, StyleState,
};

pub use appearance_taxonomy_engine::*;

pub use appearance_commands::{get_appearance_engine, get_appearance_state};

pub use avatar_display_state::{
    calculate_anchored_position, get_display_state, parse_anchor_position, reset_display_state,
    set_display_state, update_display_state, AnchorPosition, AvatarDisplayMode, AvatarDisplayState,
    AvatarDisplayStateUpdate,
};
