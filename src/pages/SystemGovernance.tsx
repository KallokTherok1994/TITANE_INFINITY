/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   SYSTEM GOVERNANCE — Super-Prompt K8
 *   Interface de gestion des permissions et audit
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import './SystemGovernance.css';

interface AuditEntry {
  timestamp: number;
  action: string;
  role: string;
  caller: string;
  result: 'allowed' | 'denied';
  reason?: string;
}

interface PermissionMatrix {
  [action: string]: string[]; // action -> roles autorisés
}

type _Role = 'ROOT' | 'SYSTEM' | 'IA' | 'USER';

export const SystemGovernance: React.FC = () => {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuditLog();
    loadPermissions();
  }, []);

  const loadAuditLog = async () => {
    try {
      setLoading(true);
      const response = await secureInvoke<{
        ok: boolean;
        data?: AuditEntry[];
        error?: string;
      }>('get_permission_audit');

      if (response.ok && response.data) {
        setAuditLog(response.data.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Failed to load audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      // IMPLEMENTATION: Tauri get_permission_matrix command
      // 1. Backend: #[tauri::command] async fn get_permission_matrix() -> Result<PermissionMatrix>
      // 2. Query: Read from ~/.titane/security/permissions.json or embedded config
      // 3. RBAC logic: Map roles (ROOT, SYSTEM, IA, USER) to operations (file_*, memory_*, etc.)
      // 4. Dynamic permissions: Load from database for enterprise multi-user setups
      // 5. Caching: Cache matrix in backend (TTL: 5min), invalidate on permission changes
      // 6. Fallback: Hardcoded default permissions if file missing/corrupt
      // const matrix = await invoke('get_permission_matrix');
      // setPermissions(matrix);
      // For now, hardcoded default permissions
      setPermissions({
        file_import: ['ROOT', 'SYSTEM', 'USER'],
        file_delete: ['ROOT', 'SYSTEM'],
        memory_write: ['ROOT', 'SYSTEM'],
        chat_generate: ['ROOT', 'SYSTEM', 'IA', 'USER'],
        snapshot_create: ['ROOT', 'SYSTEM'],
        snapshot_restore: ['ROOT'],
        permission_audit: ['ROOT'],
        system_integrity: ['ROOT', 'SYSTEM'],
      });
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'ROOT':
        return '#ff0000';
      case 'SYSTEM':
        return '#ff8800';
      case 'IA':
        return '#00aaff';
      case 'USER':
        return '#00ff88';
      default:
        return '#888888';
    }
  };

  const getResultIcon = (result: 'allowed' | 'denied'): string => {
    return result === 'allowed' ? '✅' : '❌';
  };

  const filteredAuditLog = auditLog.filter(entry => {
    if (filterRole !== 'all' && entry.role !== filterRole) return false;
    if (filterResult !== 'all' && entry.result !== filterResult) return false;
    return true;
  });

  const renderAuditLog = () => {
    return (
      <div className="audit-log">
        <div className="audit-header">
          <h2>📋 Audit Log</h2>
          <div className="audit-filters">
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="ROOT">ROOT</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="IA">IA</option>
              <option value="USER">USER</option>
            </select>
            <select value={filterResult} onChange={e => setFilterResult(e.target.value)}>
              <option value="all">All Results</option>
              <option value="allowed">Allowed</option>
              <option value="denied">Denied</option>
            </select>
            <button onClick={loadAuditLog}>🔄 Actualiser</button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div className="audit-table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Horodatage</th>
                  <th>Action</th>
                  <th>Rôle</th>
                  <th>Appelant</th>
                  <th>Résultat</th>
                  <th>Raison</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLog.map((entry, index) => (
                  <tr key={index} className={entry.result === 'denied' ? 'denied' : ''}>
                    <td>{formatDate(entry.timestamp)}</td>
                    <td>
                      <code>{entry.action}</code>
                    </td>
                    <td>
                      <span
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(entry.role) }}
                      >
                        {entry.role}
                      </span>
                    </td>
                    <td>{entry.caller}</td>
                    <td>
                      <span className={`result-${entry.result}`}>
                        {getResultIcon(entry.result)} {entry.result}
                      </span>
                    </td>
                    <td>{entry.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="audit-stats">
          <p>Total entrées : {filteredAuditLog.length}</p>
          <p>
            Autorisées : {filteredAuditLog.filter(e => e.result === 'allowed').length}
          </p>
          <p>Refusées : {filteredAuditLog.filter(e => e.result === 'denied').length}</p>
        </div>
      </div>
    );
  };

  const renderPermissionMatrix = () => {
    const actions = Object.keys(permissions);

    return (
      <div className="permission-matrix">
        <h2>🔐 Matrice des permissions</h2>
        <p className="warning">⚠️ La modification nécessite les permissions ROOT</p>

        <table className="matrix-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>ROOT</th>
              <th>SYSTEM</th>
              <th>IA</th>
              <th>USER</th>
            </tr>
          </thead>
          <tbody>
            {actions.map(action => {
              const roles = permissions[action];
              return (
                <tr
                  key={action}
                  className={selectedAction === action ? 'selected' : ''}
                  onClick={() => setSelectedAction(action)}
                >
                  <td>
                    <code>{action}</code>
                  </td>
                  <td>
                    <input type="checkbox" checked={roles.includes('ROOT')} disabled />
                  </td>
                  <td>
                    <input type="checkbox" checked={roles.includes('SYSTEM')} disabled />
                  </td>
                  <td>
                    <input type="checkbox" checked={roles.includes('IA')} disabled />
                  </td>
                  <td>
                    <input type="checkbox" checked={roles.includes('USER')} disabled />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="matrix-info">
          <h3>Hiérarchie des rôles</h3>
          <div className="hierarchy">
            <div className="hierarchy-level">
              <span style={{ color: '#ff0000' }}>●</span> ROOT - Accès système complet
            </div>
            <div className="hierarchy-level">
              <span style={{ color: '#ff8800' }}>●</span> SYSTEM - Opérations principales
            </div>
            <div className="hierarchy-level">
              <span style={{ color: '#00aaff' }}>●</span> IA - Opérations IA
            </div>
            <div className="hierarchy-level">
              <span style={{ color: '#00ff88' }}>●</span> USER - Opérations standard
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEscalationAlerts = () => {
    const deniedAttempts = auditLog.filter(e => e.result === 'denied');
    const recentDenied = deniedAttempts.slice(0, 10);

    return (
      <div className="escalation-alerts">
        <h2>🚨 Alertes d'escalade</h2>
        {recentDenied.length === 0 ? (
          <p className="no-alerts">Aucune tentative d'escalade récente</p>
        ) : (
          <div className="alerts-list">
            {recentDenied.map((entry, index) => (
              <div key={index} className="alert-item">
                <span className="alert-icon">⚠️</span>
                <div className="alert-content">
                  <strong>{entry.caller}</strong> attempted <code>{entry.action}</code>
                  <br />
                  <small>
                    {formatDate(entry.timestamp)} - Role: {entry.role}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="system-governance">
      <header className="governance-header">
        <h1>⚖️ Gouvernance Système</h1>
        <p>Gestion des permissions et audit de sécurité pour TITANE∞</p>
      </header>

      <div className="governance-grid">
        <div className="governance-section">{renderAuditLog()}</div>

        <div className="governance-section">{renderPermissionMatrix()}</div>

        <div className="governance-section">{renderEscalationAlerts()}</div>
      </div>
    </div>
  );
};
