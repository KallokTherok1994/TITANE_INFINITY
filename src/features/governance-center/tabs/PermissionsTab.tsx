/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   ONGLET PERMISSIONS — Matrice et audit des permissions
 *   Visualisation des rôles ROOT > SYSTEM > IA > USER
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo } from 'react';
import { Card, Button } from '@/ui';
import type { PermissionMatrix, PermissionAudit, Role, AuditStatus } from '../types';

interface PermissionsTabProps {
  permissionMatrix: PermissionMatrix;
  permissionAudit: PermissionAudit[];
  loading: boolean;
  onClearAudit: () => Promise<unknown>;
  onRefresh: () => void;
}

const roleColors: Record<Role, string> = {
  Root: '#ff0000',
  System: '#ff8800',
  Ia: '#00aaff',
  User: '#00ff88',
};

const roleLabels: Record<Role, { label: string; icon: string }> = {
  Root: { label: 'ROOT', icon: '👑' },
  System: { label: 'SYSTEM', icon: '⚙️' },
  Ia: { label: 'IA', icon: '🤖' },
  User: { label: 'USER', icon: '👤' },
};

const statusIcons: Record<AuditStatus, string> = {
  Allowed: '✅',
  Denied: '❌',
  Alert: '⚠️',
};

// Catégories de permissions pour un affichage groupé
const permissionCategories = [
  { id: 'memory', label: 'Mémoire', icon: '💾', pattern: /^memory_/ },
  { id: 'file', label: 'Fichiers', icon: '📁', pattern: /^file_/ },
  { id: 'state', label: 'État', icon: '🔄', pattern: /^state_/ },
  { id: 'engine', label: 'Moteurs', icon: '⚡', pattern: /^engine_/ },
  { id: 'xp', label: 'XP', icon: '⭐', pattern: /^(xp_|talent_)/ },
  { id: 'system', label: 'Système', icon: '🖥️', pattern: /^system_/ },
  { id: 'permission', label: 'Permissions', icon: '🛡️', pattern: /^(permission_|role_)/ },
  { id: 'ia', label: 'IA', icon: '🤖', pattern: /^ia_/ },
  { id: 'config', label: 'Config', icon: '⚙️', pattern: /^config_/ },
  { id: 'crypto', label: 'Crypto', icon: '🔐', pattern: /^crypto_/ },
  { id: 'secret', label: 'Secrets', icon: '🔑', pattern: /^secret_/ },
];

export const PermissionsTab: React.FC<PermissionsTabProps> = ({
  permissionMatrix,
  permissionAudit,
  loading,
  onClearAudit,
  onRefresh,
}) => {
  const [view, setView] = useState<'matrix' | 'audit'>('matrix');
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AuditStatus | 'all'>('all');

  // Grouper les permissions par catégorie
  const groupedPermissions = useMemo(() => {
    const actions = Object.keys(permissionMatrix);
    const groups: Record<string, string[]> = {};

    for (const action of actions) {
      let category = 'other';
      for (const cat of permissionCategories) {
        if (cat.pattern.test(action)) {
          category = cat.id;
          break;
        }
      }
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(action);
    }

    return groups;
  }, [permissionMatrix]);

  // Filtrer l'audit
  const filteredAudit = useMemo(() => {
    return permissionAudit
      .filter((entry) => {
        if (filterRole !== 'all' && entry.role !== filterRole) return false;
        if (filterStatus !== 'all' && entry.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100); // Limiter à 100 entrées
  }, [permissionAudit, filterRole, filterStatus]);

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header avec toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant={view === 'matrix' ? 'primary' : 'ghost'}
            onClick={() => setView('matrix')}
          >
            🛡️ Matrice
          </Button>
          <Button
            variant={view === 'audit' ? 'primary' : 'ghost'}
            onClick={() => setView('audit')}
          >
            📋 Audit ({permissionAudit.length})
          </Button>
        </div>
        <Button variant="ghost" onClick={onRefresh} disabled={loading}>
          Rafraîchir
        </Button>
      </div>

      {/* Vue Matrice */}
      {view === 'matrix' && (
        <>
          {/* Légende des rôles */}
          <Card style={{ padding: '12px' }}>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
              {(['Root', 'System', 'Ia', 'User'] as Role[]).map((role) => (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{roleLabels[role].icon}</span>
                  <span style={{ fontWeight: 500, color: roleColors[role] }}>
                    {roleLabels[role].label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Groupes de permissions */}
          {permissionCategories.map((category) => {
            const actions = groupedPermissions[category.id];
            if (!actions || actions.length === 0) return null;

            return (
              <Card key={category.id}>
                <header style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{category.icon}</span>
                  <h4 style={{ margin: 0 }}>{category.label}</h4>
                  <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '0.85rem' }}>
                    {actions.length} actions
                  </span>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {actions.sort().map((action) => {
                    const roles = permissionMatrix[action] || [];
                    return (
                      <div
                        key={action}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: 'var(--color-surface, #1a1a2e)',
                        }}
                      >
                        <code style={{ flex: 1, fontSize: '0.85rem' }}>{action}</code>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {(['Root', 'System', 'Ia', 'User'] as Role[]).map((role) => (
                            <span
                              key={role}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                background: roles.includes(role)
                                  ? `${roleColors[role]}30`
                                  : 'rgba(255,255,255,0.05)',
                                color: roles.includes(role) ? roleColors[role] : 'rgba(255,255,255,0.2)',
                                fontWeight: roles.includes(role) ? 600 : 400,
                              }}
                              title={`${roleLabels[role].label}: ${roles.includes(role) ? 'Autorisé' : 'Refusé'}`}
                            >
                              {role.charAt(0)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </>
      )}

      {/* Vue Audit */}
      {view === 'audit' && (
        <>
          {/* Filtres */}
          <Card style={{ padding: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Rôle:</span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as Role | 'all')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--color-surface)',
                    color: 'inherit',
                  }}
                >
                  <option value="all">Tous</option>
                  <option value="Root">ROOT</option>
                  <option value="System">SYSTEM</option>
                  <option value="Ia">IA</option>
                  <option value="User">USER</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Statut:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as AuditStatus | 'all')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--color-surface)',
                    color: 'inherit',
                  }}
                >
                  <option value="all">Tous</option>
                  <option value="Allowed">Autorisé</option>
                  <option value="Denied">Refusé</option>
                  <option value="Alert">Alerte</option>
                </select>
              </div>
              <Button
                variant="ghost"
                style={{ marginLeft: 'auto' }}
                onClick={onClearAudit}
                disabled={loading}
              >
                🗑️ Effacer l'audit
              </Button>
            </div>
          </Card>

          {/* Liste audit */}
          <Card>
            <div style={{ maxHeight: '500px', overflow: 'auto' }}>
              {filteredAudit.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                  Aucune entrée d'audit
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.85rem' }}>Date</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.85rem' }}>Action</th>
                      <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.85rem' }}>Rôle</th>
                      <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.85rem' }}>Statut</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.85rem' }}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAudit.map((entry, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: entry.status === 'Denied' ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '8px', fontSize: '0.8rem', opacity: 0.7 }}>
                          {formatTimestamp(entry.timestamp)}
                        </td>
                        <td style={{ padding: '8px' }}>
                          <code style={{ fontSize: '0.85rem' }}>{entry.action}</code>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: `${roleColors[entry.role]}20`,
                              color: roleColors[entry.role],
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {entry.role}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          {statusIcons[entry.status]}
                        </td>
                        <td style={{ padding: '8px', fontSize: '0.8rem', opacity: 0.7 }}>
                          {entry.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default PermissionsTab;
