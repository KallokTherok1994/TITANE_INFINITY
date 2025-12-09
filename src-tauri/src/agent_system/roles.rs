//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT ROLES
//! Super Prompt #19 — Définition des rôles et permissions
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Rôle d'un agent
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Role {
    /// Peut lire des données
    Reader,
    /// Peut écrire des données
    Writer,
    /// Peut exécuter des actions
    Executor,
    /// Peut coordonner d'autres agents
    Coordinator,
    /// Peut superviser des agents
    Supervisor,
    /// Accès admin
    Admin,
    /// Peut accéder à des ressources externes
    ExternalAccess,
    /// Peut créer des agents
    AgentCreator,
    /// Peut modifier la configuration
    ConfigManager,
    /// Rôle de sécurité
    SecurityOfficer,
}

impl Role {
    /// Retourne les permissions associées au rôle
    pub fn permissions(&self) -> Vec<Permission> {
        match self {
            Self::Reader => vec![
                Permission::ReadData,
                Permission::ViewAgents,
            ],
            Self::Writer => vec![
                Permission::ReadData,
                Permission::WriteData,
                Permission::CreateEntries,
            ],
            Self::Executor => vec![
                Permission::ExecuteTasks,
                Permission::ReadData,
            ],
            Self::Coordinator => vec![
                Permission::ExecuteTasks,
                Permission::AssignTasks,
                Permission::ViewAgents,
                Permission::ReadData,
            ],
            Self::Supervisor => vec![
                Permission::ExecuteTasks,
                Permission::AssignTasks,
                Permission::ViewAgents,
                Permission::ModifyAgents,
                Permission::ReadData,
                Permission::WriteData,
            ],
            Self::Admin => vec![
                Permission::ReadData,
                Permission::WriteData,
                Permission::ExecuteTasks,
                Permission::AssignTasks,
                Permission::ViewAgents,
                Permission::ModifyAgents,
                Permission::CreateAgents,
                Permission::DeleteAgents,
                Permission::ModifyConfig,
            ],
            Self::ExternalAccess => vec![
                Permission::AccessExternal,
                Permission::ReadData,
            ],
            Self::AgentCreator => vec![
                Permission::CreateAgents,
                Permission::ViewAgents,
            ],
            Self::ConfigManager => vec![
                Permission::ModifyConfig,
                Permission::ReadData,
            ],
            Self::SecurityOfficer => vec![
                Permission::ViewAuditLogs,
                Permission::ModifySecuritySettings,
                Permission::ViewAgents,
                Permission::ReadData,
            ],
        }
    }

    /// Vérifie si le rôle a une permission
    pub fn has_permission(&self, permission: &Permission) -> bool {
        self.permissions().contains(permission)
    }
}

/// Permission
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Permission {
    // Data permissions
    ReadData,
    WriteData,
    DeleteData,
    CreateEntries,

    // Task permissions
    ExecuteTasks,
    AssignTasks,
    CancelTasks,

    // Agent permissions
    ViewAgents,
    ModifyAgents,
    CreateAgents,
    DeleteAgents,

    // External access
    AccessExternal,
    AccessAPIs,

    // Config permissions
    ModifyConfig,
    ViewConfig,

    // Security permissions
    ViewAuditLogs,
    ModifySecuritySettings,

    // System permissions
    SystemShutdown,
    SystemRestart,
}

/// Définition d'un rôle custom
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RoleDefinition {
    pub name: String,
    pub description: String,
    pub permissions: HashSet<Permission>,
    pub inherits_from: Vec<Role>,
    pub priority: u8,
}

impl RoleDefinition {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            description: String::new(),
            permissions: HashSet::new(),
            inherits_from: Vec::new(),
            priority: 5,
        }
    }

    /// Ajoute une permission
    pub fn add_permission(&mut self, permission: Permission) {
        self.permissions.insert(permission);
    }

    /// Ajoute un rôle parent
    pub fn add_parent(&mut self, role: Role) {
        self.inherits_from.push(role);
    }

    /// Récupère toutes les permissions (incluant héritées)
    pub fn all_permissions(&self) -> HashSet<Permission> {
        let mut all = self.permissions.clone();

        for parent in &self.inherits_from {
            for perm in parent.permissions() {
                all.insert(perm);
            }
        }

        all
    }

    /// Vérifie si le rôle a une permission
    pub fn has_permission(&self, permission: &Permission) -> bool {
        self.all_permissions().contains(permission)
    }
}

/// Ensemble de rôles
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct RoleSet {
    roles: HashSet<Role>,
    custom_roles: Vec<RoleDefinition>,
}

impl RoleSet {
    pub fn new() -> Self {
        Self::default()
    }

    /// Ajoute un rôle
    pub fn add(&mut self, role: Role) {
        self.roles.insert(role);
    }

    /// Ajoute un rôle custom
    pub fn add_custom(&mut self, role: RoleDefinition) {
        self.custom_roles.push(role);
    }

    /// Vérifie si l'ensemble a un rôle
    pub fn has(&self, role: &Role) -> bool {
        self.roles.contains(role)
    }

    /// Récupère toutes les permissions de l'ensemble
    pub fn all_permissions(&self) -> HashSet<Permission> {
        let mut all = HashSet::new();

        for role in &self.roles {
            for perm in role.permissions() {
                all.insert(perm);
            }
        }

        for custom in &self.custom_roles {
            for perm in custom.all_permissions() {
                all.insert(perm);
            }
        }

        all
    }

    /// Vérifie si l'ensemble a une permission
    pub fn has_permission(&self, permission: &Permission) -> bool {
        self.all_permissions().contains(permission)
    }

    /// Nombre de rôles
    pub fn len(&self) -> usize {
        self.roles.len() + self.custom_roles.len()
    }

    /// Est vide?
    pub fn is_empty(&self) -> bool {
        self.roles.is_empty() && self.custom_roles.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_role_permissions() {
        let admin = Role::Admin;
        assert!(admin.has_permission(&Permission::CreateAgents));
        assert!(admin.has_permission(&Permission::ModifyConfig));
    }

    #[test]
    fn test_role_set() {
        let mut set = RoleSet::new();
        set.add(Role::Reader);
        set.add(Role::Executor);

        assert!(set.has(&Role::Reader));
        assert!(set.has_permission(&Permission::ReadData));
        assert!(set.has_permission(&Permission::ExecuteTasks));
        assert!(!set.has_permission(&Permission::CreateAgents));
    }

    #[test]
    fn test_custom_role() {
        let mut role = RoleDefinition::new("CustomRole");
        role.add_permission(Permission::ReadData);
        role.add_parent(Role::Executor);

        assert!(role.has_permission(&Permission::ReadData));
        assert!(role.has_permission(&Permission::ExecuteTasks)); // From parent
    }
}
