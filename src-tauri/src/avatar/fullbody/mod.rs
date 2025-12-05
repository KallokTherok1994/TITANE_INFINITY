// Copyright © 2025 TITANE∞ — Full-Body Module Exports
// License: Proprietary — TITANE OS

pub mod fullbody_engine;
pub mod posture_ai;

pub use fullbody_engine::{
    get_fullbody_engine, AvatarStateBinding, AvatarStateSnapshot, BodyProfile, ExpressionBridge,
    FullBodyAvatarEngine, Gesture, LipSyncFeed, MotionLayer, SkeletonModel, SkeletonSnapshot,
};

pub use posture_ai::{BodyPostureAI, ConversationalContext, PostureConfiguration, PostureType};
