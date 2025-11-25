// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   PERMISSION SYSTEM — Super-Prompt K
//   Hiérarchie: ROOT → SYSTEM → IA → USER
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Rôles hiérarchiques du système
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Role {
    /// ROOT - Accès total (Kevin uniquement)
    Root,
    /// SYSTEM - Moteurs internes TITANE∞
    System,
    /// IA - Modules cognitifs, persona, analyse
    Ia,
    /// USER - Interface utilisateur
    User,
}

impl Role {
    /// Vérifier hiérarchie (rôle1 >= rôle2)
    pub fn can_override(&self, other: &Role) -> bool {
        let level = match self {
            Role::Root => 4,
            Role::System => 3,
            Role::Ia => 2,
            Role::User => 1,
        };
        let other_level = match other {
            Role::Root => 4,
            Role::System => 3,
            Role::Ia => 2,
            Role::User => 1,
        };
        level >= other_level
    }
}

/// Actions sécurisées du système
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum SecureAction {
    // Mémoire
    MemoryRead,
    MemoryWrite,
    MemoryDelete,
    MemoryEncrypt,
    MemoryDecrypt,

    // Fichiers
    FileRead,
    FileWrite,
    FileDelete,
    FileImport,
    FileExport,

    // SingularityState
    StateRead,
    StateWrite,
    StateReset,
    StateBackup,
    StateRestore,

    // Moteurs
    EngineStart,
    EngineStop,
    EngineReconfigure,
    EngineHealthCheck,

    // XP & Progression
    XpGain,
    XpRead,
    XpModify,
    TalentUnlock,

    // Système
    SystemShutdown,
    SystemRestart,
    SystemUpdate,
    SystemMigration,
    SystemAudit,

    // Permissions
    PermissionView,
    PermissionModify,
    RoleEscalate,

    // IA
    IaGenerate,
    IaAnalyze,
    IaLearn,
    IaMemoryAccess,

    // Configuration
    ConfigRead,
    ConfigWrite,

    // Cryptographie
    CryptoEncrypt,
    CryptoDecrypt,
    CryptoSign,
    CryptoVerify,
}

/// Matrice de permissions (action → rôles autorisés)
pub type PermissionMatrix = HashMap<String, Vec<Role>>;

lazy_static::lazy_static! {
    /// Matrice globale de permissions
    pub static ref PERMISSIONS: PermissionMatrix = build_permission_matrix();
}

fn build_permission_matrix() -> PermissionMatrix {
    let mut matrix = HashMap::new();

    // ═══════════════════════════════════════════════════════════════
    // MÉMOIRE
    // ═══════════════════════════════════════════════════════════════
    matrix.insert(
        "memory_read".to_string(),
        vec![Role::Root, Role::System, Role::Ia],
    );
    matrix.insert(
        "memory_write".to_string(),
        vec![Role::Root, Role::System, Role::Ia],
    );
    matrix.insert("memory_delete".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("memory_encrypt".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("memory_decrypt".to_string(), vec![Role::Root, Role::System]);

    // ═══════════════════════════════════════════════════════════════
    // FICHIERS
    // ═══════════════════════════════════════════════════════════════
    matrix.insert(
        "file_read".to_string(),
        vec![Role::Root, Role::System, Role::User],
    );
    matrix.insert("file_write".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("file_delete".to_string(), vec![Role::Root, Role::System]);
    matrix.insert(
        "file_import".to_string(),
        vec![Role::Root, Role::System, Role::User],
    );
    matrix.insert(
        "file_export".to_string(),
        vec![Role::Root, Role::System, Role::User],
    );

    // ═══════════════════════════════════════════════════════════════
    // SINGULARITY STATE
    // ═══════════════════════════════════════════════════════════════
    matrix.insert(
        "state_read".to_string(),
        vec![Role::Root, Role::System, Role::Ia, Role::User],
    );
    matrix.insert("state_write".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("state_reset".to_string(), vec![Role::Root]);
    matrix.insert("state_backup".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("state_restore".to_string(), vec![Role::Root]);

    // ═══════════════════════════════════════════════════════════════
    // MOTEURS
    // ═══════════════════════════════════════════════════════════════
    matrix.insert("engine_start".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("engine_stop".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("engine_reconfigure".to_string(), vec![Role::Root]);
    matrix.insert(
        "engine_health_check".to_string(),
        vec![Role::Root, Role::System],
    );

    // ═══════════════════════════════════════════════════════════════
    // XP & PROGRESSION
    // ═══════════════════════════════════════════════════════════════
    matrix.insert("xp_gain".to_string(), vec![Role::Root, Role::System]);
    matrix.insert(
        "xp_read".to_string(),
        vec![Role::Root, Role::System, Role::Ia, Role::User],
    );
    matrix.insert("xp_modify".to_string(), vec![Role::Root]);
    matrix.insert("talent_unlock".to_string(), vec![Role::Root, Role::System]);

    // ═══════════════════════════════════════════════════════════════
    // SYSTÈME
    // ═══════════════════════════════════════════════════════════════
    matrix.insert("system_shutdown".to_string(), vec![Role::Root]);
    matrix.insert("system_restart".to_string(), vec![Role::Root]);
    matrix.insert("system_update".to_string(), vec![Role::Root]);
    matrix.insert("system_migration".to_string(), vec![Role::Root]);
    matrix.insert("system_audit".to_string(), vec![Role::Root, Role::System]);

    // ═══════════════════════════════════════════════════════════════
    // PERMISSIONS
    // ═══════════════════════════════════════════════════════════════
    matrix.insert(
        "permission_view".to_string(),
        vec![Role::Root, Role::System],
    );
    matrix.insert("permission_modify".to_string(), vec![Role::Root]);
    matrix.insert("role_escalate".to_string(), vec![Role::Root]);

    // ═══════════════════════════════════════════════════════════════
    // IA
    // ═══════════════════════════════════════════════════════════════
    matrix.insert(
        "ia_generate".to_string(),
        vec![Role::Root, Role::System, Role::Ia],
    );
    matrix.insert(
        "ia_analyze".to_string(),
        vec![Role::Root, Role::System, Role::Ia],
    );
    matrix.insert(
        "ia_learn".to_string(),
        vec![Role::Root, Role::System, Role::Ia],
    );
    matrix.insert(
        "ia_memory_access".to_string(),
        vec![Role::Root, Role::System, Role::Ia],
    );

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    matrix.insert(
        "config_read".to_string(),
        vec![Role::Root, Role::System, Role::User],
    );
    matrix.insert("config_write".to_string(), vec![Role::Root]);

    // ═══════════════════════════════════════════════════════════════
    // CRYPTOGRAPHIE
    // ═══════════════════════════════════════════════════════════════
    matrix.insert("crypto_encrypt".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("crypto_decrypt".to_string(), vec![Role::Root, Role::System]);
    matrix.insert("crypto_sign".to_string(), vec![Role::Root]);
    matrix.insert("crypto_verify".to_string(), vec![Role::Root, Role::System]);

    matrix
}

/// Vérifier si un rôle a la permission pour une action
pub fn check_permission(action: &str, role: Role) -> bool {
    PERMISSIONS
        .get(action)
        .is_some_and(|roles| roles.contains(&role))
}

/// Exiger une permission (erreur si refusée)
pub fn require_permission(action: &str, role: Role) -> Result<(), String> {
    if check_permission(action, role) {
        Ok(())
    } else {
        Err(format!(
            "Permission denied: {:?} cannot perform '{}'",
            role, action
        ))
    }
}

/// Vérifier intégrité des permissions au boot
pub fn verify_permissions() -> Result<(), String> {
    // Vérifier que ROOT a toujours accès total
    let critical_actions = vec![
        "system_shutdown",
        "system_update",
        "permission_modify",
        "role_escalate",
        "state_reset",
    ];

    for action in critical_actions {
        let roles = PERMISSIONS.get(action).ok_or_else(|| {
            format!(
                "Critical action '{}' not defined in permission matrix",
                action
            )
        })?;

        if !roles.contains(&Role::Root) {
            return Err(format!(
                "SECURITY VIOLATION: ROOT must have access to '{}'",
                action
            ));
        }
    }

    log::info!(
        "✅ Permission matrix verified: {} actions",
        PERMISSIONS.len()
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_role_hierarchy() {
        assert!(Role::Root.can_override(&Role::System));
        assert!(Role::Root.can_override(&Role::Ia));
        assert!(Role::Root.can_override(&Role::User));
        assert!(Role::System.can_override(&Role::Ia));
        assert!(Role::System.can_override(&Role::User));
        assert!(!Role::User.can_override(&Role::System));
    }

    #[test]
    fn test_permissions() {
        assert!(check_permission("memory_write", Role::System));
        assert!(check_permission("state_reset", Role::Root));
        assert!(!check_permission("state_reset", Role::User));
        assert!(!check_permission("permission_modify", Role::Ia));
    }

    #[test]
    fn test_require_permission() {
        assert!(require_permission("file_read", Role::User).is_ok());
        assert!(require_permission("system_shutdown", Role::User).is_err());
    }
}
