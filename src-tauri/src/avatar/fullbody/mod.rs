// Copyright © 2025 TITANE∞ — Full-Body Module Exports
// License: Proprietary — TITANE OS

pub mod fullbody_engine;
pub mod posture_ai;

pub use fullbody_engine::{
    FullBodyAvatarEngine, BodyProfile, SkeletonModel, Gesture,
    MotionLayer, ExpressionBridge, LipSyncFeed, AvatarStateBinding,
    AvatarStateSnapshot, SkeletonSnapshot, get_fullbody_engine,
};

pub use posture_ai::{
    BodyPostureAI, PostureType, PostureConfiguration, ConversationalContext,
};
