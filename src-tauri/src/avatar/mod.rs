// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v23–v24 — AVATAR MODULE
//   Immersive Avatar Engine + Full-Body Engine + Commands + Self-Test
// ═══════════════════════════════════════════════════════════════════════════════

pub mod immersive_avatar_engine;
pub mod avatar_commands;
pub mod avatar_selftest;
pub mod fullbody; // v24 — Full-Body Avatar Engine
pub mod fullbody_commands; // v24 — Tauri Commands
pub mod fullbody_selftest; // v24 — Self-Tests
pub mod appearance_state; // v24.5 — Appearance State
pub mod appearance_taxonomy_engine; // v24.9 — Taxonomy Engine
pub mod appearance_commands; // v24.5 — Tauri Appearance Commands
pub mod avatar_display_state; // v24.12 — Display State (Floating Window)
pub mod avatar_floating_commands; // v24.12 — Floating Window Commands

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

pub use appearance_state::{
    AvatarAppearanceState,
    OutfitState,
    StyleState,
    AccessoriesState,
    HairState,
    MakeupState,
    CustomStyle,
    AppearanceUpdateRequest,
    Formality,
    HairLength,
};

pub use appearance_taxonomy_engine::*;

pub use appearance_commands::{
    get_appearance_engine,
    get_appearance_state,
};

pub use avatar_display_state::{
    AvatarDisplayState,
    AvatarDisplayMode,
    AnchorPosition,
    AvatarDisplayStateUpdate,
    get_display_state,
    set_display_state,
    update_display_state,
    reset_display_state,
    calculate_anchored_position,
    parse_anchor_position,
};

