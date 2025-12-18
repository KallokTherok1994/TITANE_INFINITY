/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — AGENT MANAGER COMPONENT
 * Interface de gestion des agents multi-IA
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { AgentsAPIService } from '../../services/agents/agents.api';
import {
  AgentConfig,
  AgentRole,
  AgentIAPermission,
  AgentRoleLabels,
  AgentIAPermissionLabels,
  AgentRoleDescriptions,
  RecommendedPermissionsByRole,
  CreateAgentRequest,
} from '../../services/agents/agents.types';

/**
 * Composant principal de gestion des agents
 */
export const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Chargement initial des agents
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AgentsAPIService.listAgents();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (
    agentId: string,
    newPermission: AgentIAPermission
  ) => {
    try {
      await AgentsAPIService.updateAgentPermission({
        agent_id: agentId,
        new_permission: newPermission,
      });
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="agent-manager-loading">
        <div className="spinner"></div>
        <p>Chargement des agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-manager-error">
        <h3>❌ Erreur</h3>
        <p>{error}</p>
        <button onClick={loadAgents}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="agent-manager">
      <div className="agent-manager-header">
        <h2>🤖 Gestionnaire Multi-Agents v∞.19.3Ω</h2>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Créer un Agent
        </button>
      </div>

      <div className="agent-manager-stats">
        <div className="stat-card">
          <span className="stat-value">{agents.length}</span>
          <span className="stat-label">Agents actifs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {agents.filter(a => a.ia_permission === AgentIAPermission.NoExternal).length}
          </span>
          <span className="stat-label">Locaux uniquement</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {agents.filter(a => a.ia_permission === AgentIAPermission.AllExternal).length}
          </span>
          <span className="stat-label">Accès complet</span>
        </div>
      </div>

      <div className="agents-grid">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onSelect={setSelectedAgent}
            onUpdatePermission={handleUpdatePermission}
          />
        ))}
      </div>

      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onUpdatePermission={handleUpdatePermission}
        />
      )}

      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadAgents}
        />
      )}
    </div>
  );
};

/**
 * Carte d'affichage d'un agent
 */
interface AgentCardProps {
  agent: AgentConfig;
  onSelect: (agent: AgentConfig) => void;
  onUpdatePermission: (agentId: string, permission: AgentIAPermission) => Promise<void>;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, onUpdatePermission }) => {
  const roleLabel = AgentRoleLabels[agent.role];
  const permissionLabel = AgentIAPermissionLabels[agent.ia_permission];

  void onUpdatePermission;

  return (
    <div className="agent-card" onClick={() => onSelect(agent)}>
      <div className="agent-card-header">
        <h3>{agent.name}</h3>
        <span className={`badge priority-${agent.priority}`}>P{agent.priority}</span>
      </div>

      <div className="agent-card-body">
        <div className="agent-role">{roleLabel}</div>
        <p className="agent-description">{agent.description}</p>
        <div className="agent-permission">{permissionLabel}</div>
      </div>

      <div className="agent-card-footer">
        <span className="agent-tags">
          {agent.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </span>
        <span className={`status ${agent.active ? 'active' : 'inactive'}`}>
          {agent.active ? '🟢' : '🔴'}
        </span>
      </div>
    </div>
  );
};

/**
 * Modal de détails d'un agent
 */
interface AgentDetailModalProps {
  agent: AgentConfig;
  onClose: () => void;
  onUpdatePermission: (agentId: string, permission: AgentIAPermission) => Promise<void>;
}

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onUpdatePermission,
}) => {
  const [selectedPermission, setSelectedPermission] = useState(agent.ia_permission);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await onUpdatePermission(agent.id, selectedPermission);
      onClose();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(
        'Failed to update agent permission',
        { component: 'AgentManager', action: 'updatePermission', agentId: agent.id },
        error
      );
    } finally {
      setUpdating(false);
    }
  };

  const recommendedPermission = RecommendedPermissionsByRole[agent.role];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{agent.name}</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Rôle</h3>
            <p>{AgentRoleLabels[agent.role]}</p>
            <p className="description-text">{AgentRoleDescriptions[agent.role]}</p>
          </div>

          <div className="detail-section">
            <h3>Description</h3>
            <p>{agent.description}</p>
          </div>

          <div className="detail-section">
            <h3>Permission IA actuelle</h3>
            <div className="permission-selector">
              {Object.values(AgentIAPermission).map(permission => (
                <label
                  key={permission}
                  className={`permission-option ${
                    selectedPermission === permission ? 'selected' : ''
                  } ${permission === recommendedPermission ? 'recommended' : ''}`}
                >
                  <input
                    type="radio"
                    value={permission}
                    checked={selectedPermission === permission}
                    onChange={e =>
                      setSelectedPermission(e.target.value as AgentIAPermission)
                    }
                  />
                  <span>{AgentIAPermissionLabels[permission]}</span>
                  {permission === recommendedPermission && (
                    <span className="recommended-badge">Recommandé</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>Métadonnées</h3>
            <ul className="metadata-list">
              <li>
                <strong>ID:</strong> {agent.id}
              </li>
              <li>
                <strong>Priorité:</strong> {agent.priority}
              </li>
              <li>
                <strong>Statut:</strong> {agent.active ? 'Actif' : 'Inactif'}
              </li>
              <li>
                <strong>Créé le:</strong>{' '}
                {new Date(agent.created_at).toLocaleString('fr-FR')}
              </li>
              <li>
                <strong>Modifié le:</strong>{' '}
                {new Date(agent.updated_at).toLocaleString('fr-FR')}
              </li>
            </ul>
          </div>

          {agent.tags.length > 0 && (
            <div className="detail-section">
              <h3>Tags</h3>
              <div className="tags-list">
                {agent.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={updating}>
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleUpdate}
            disabled={updating || selectedPermission === agent.ia_permission}
          >
            {updating ? 'Mise à jour...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal de création d'agent
 */
interface CreateAgentModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    description: '',
    role: AgentRole.Conversational,
    priority: 5,
    tags: [],
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      setCreating(true);
      setError(null);
      await AgentsAPIService.createAgent(formData);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de création');
    } finally {
      setCreating(false);
    }
  };

  const recommendedPermission = RecommendedPermissionsByRole[formData.role as AgentRole];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un nouvel agent</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label>Nom de l&apos;agent *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Assistant Créatif"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le rôle et les responsabilités de l'agent"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Rôle *</label>
            <select
              value={formData.role}
              onChange={e =>
                setFormData({ ...formData, role: e.target.value as AgentRole })
              }
            >
              {Object.entries(AgentRoleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="form-hint">
              {AgentRoleDescriptions[formData.role as AgentRole]}
            </p>
            <p className="form-hint">
              Permission recommandée: {AgentIAPermissionLabels[recommendedPermission]}
            </p>
          </div>

          <div className="form-group">
            <label>Priorité</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={e =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
            />
            <p className="form-hint">1 = plus haute priorité, 10 = plus basse priorité</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={creating}>
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating || !formData.name || !formData.description}
          >
            {creating ? 'Création...' : "Créer l'agent"}
          </button>
        </div>
      </div>
    </div>
  );
};
