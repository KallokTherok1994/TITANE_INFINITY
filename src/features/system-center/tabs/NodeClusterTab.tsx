/**
 * TITANE∞ v∞ — Node Cluster Tab
 *
 * Onglet du réseau maillé distribué
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNodeCluster } from '../hooks/useNodeCluster';
import type { NodeRole } from '../types/systemCenter.types';

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

const getRoleIcon = (role: NodeRole): string => {
  switch (role) {
    case 'Root': return '👑';
    case 'Worker': return '⚙️';
    case 'Storage': return '💾';
    case 'Monitor': return '👁️';
    default: return '🔵';
  }
};

const formatUptime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

// ══════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════

export const NodeClusterTab: React.FC = () => {
  const {
    stats,
    peers,
    isInitialized,
    isLoading,
    error,
    initialize,
    shutdown,
  } = useNodeCluster(true, 5000);

  const [nodeId, setNodeId] = useState(`node-${Date.now()}`);
  const [port, setPort] = useState(9999);

  const handleInitialize = async () => {
    await initialize(nodeId, port);
  };

  return (
    <div className="sc-cluster">
      {/* Not Initialized State */}
      {!isInitialized && (
        <motion.div
          className="sc-init-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="sc-init-title">🌐 Initialiser le réseau Mesh</h3>
          <p className="sc-init-desc">
            Configurez les paramètres du nœud pour rejoindre le réseau distribué.
          </p>

          <div className="sc-init-form">
            <div className="sc-form-group">
              <label>ID du nœud</label>
              <input
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="sc-input"
                placeholder="node-12345"
              />
            </div>
            <div className="sc-form-group">
              <label>Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 9999)}
                className="sc-input"
                placeholder="9999"
              />
            </div>
          </div>

          <button
            className="sc-btn sc-btn--primary sc-btn--large"
            onClick={handleInitialize}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Initialisation...' : '🚀 Démarrer le réseau'}
          </button>

          {error && (
            <div className="sc-error">
              <span className="sc-error-icon">⚠️</span>
              <span className="sc-error-message">{error}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Initialized State */}
      {isInitialized && stats && (
        <>
          {/* Status Header */}
          <motion.div
            className="sc-cluster-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="sc-cluster-status">
              <span className="sc-cluster-status-dot sc-cluster-status-dot--active" />
              <span>Réseau actif</span>
            </div>
            <button
              className="sc-btn sc-btn--danger sc-btn--small"
              onClick={shutdown}
            >
              ⏹️ Arrêter
            </button>
          </motion.div>

          {/* Stats Grid */}
          <div className="sc-stats-grid">
            <motion.div
              className="sc-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="sc-stat-card-icon">🆔</span>
              <span className="sc-stat-card-label">ID Nœud</span>
              <span className="sc-stat-card-value">{stats.node_id}</span>
            </motion.div>

            <motion.div
              className="sc-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="sc-stat-card-icon">👑</span>
              <span className="sc-stat-card-label">Rôle</span>
              <span className="sc-stat-card-value">{stats.role}</span>
            </motion.div>

            <motion.div
              className="sc-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="sc-stat-card-icon">🔗</span>
              <span className="sc-stat-card-label">Peers</span>
              <span className="sc-stat-card-value">{stats.peer_count}</span>
            </motion.div>

            <motion.div
              className="sc-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="sc-stat-card-icon">⏱️</span>
              <span className="sc-stat-card-label">Uptime</span>
              <span className="sc-stat-card-value">{formatUptime(stats.uptime_seconds)}</span>
            </motion.div>
          </div>

          {/* Peers List */}
          <div className="sc-peers-section">
            <h3 className="sc-section-title">Nœuds connectés ({peers.length})</h3>

            {peers.length === 0 ? (
              <div className="sc-empty-state">
                <span className="sc-empty-icon">🔍</span>
                <p>Aucun peer connecté</p>
                <p className="sc-empty-hint">Les nœuds apparaîtront ici une fois découverts</p>
              </div>
            ) : (
              <div className="sc-peers-grid">
                {peers.map((peer, index) => (
                  <motion.div
                    key={peer.id}
                    className="sc-peer-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="sc-peer-header">
                      <span className="sc-peer-icon">{getRoleIcon(peer.role)}</span>
                      <span className="sc-peer-id">{peer.id}</span>
                    </div>
                    <div className="sc-peer-stats">
                      <div className="sc-peer-stat">
                        <span className="sc-peer-stat-label">Santé</span>
                        <div className="sc-progress">
                          <div
                            className="sc-progress-bar"
                            style={{ width: `${peer.health}%` }}
                          />
                        </div>
                        <span className="sc-peer-stat-value">{peer.health}%</span>
                      </div>
                      <div className="sc-peer-stat">
                        <span className="sc-peer-stat-label">Charge</span>
                        <div className="sc-progress">
                          <div
                            className="sc-progress-bar sc-progress-bar--load"
                            style={{ width: `${peer.load}%` }}
                          />
                        </div>
                        <span className="sc-peer-stat-value">{peer.load}%</span>
                      </div>
                    </div>
                    <div className="sc-peer-addr">{peer.addr}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NodeClusterTab;
