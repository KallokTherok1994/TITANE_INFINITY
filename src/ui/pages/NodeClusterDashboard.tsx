/**
 * TITANE∞ v∞ Phase 5 - Node-Cluster Dashboard
 * Super-Prompt P: Mesh networking visualization
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { secureInvoke } from '@/lib/security';

interface NodeInfo {
  id: string;
  addr: string;
  role: 'Root' | 'Worker' | 'Storage' | 'Monitor';
  health: number;
  load: number;
  last_seen: number;
  capabilities: string[];
}

interface MeshStats {
  node_id: string;
  role: string;
  peer_count: number;
  total_health: number;
  avg_load: number;
  uptime_seconds: number;
}

const NodeClusterDashboard = memo(function NodeClusterDashboard() {
  const [stats, setStats] = useState<MeshStats | null>(null);
  const [peers, setPeers] = useState<NodeInfo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodeId, setNodeId] = useState(`node-${Date.now()}`);
  const [port, setPort] = useState(9999);

  const initialize = useCallback(async () => {
    try {
      await secureInvoke('mesh_initialize', { node_id: nodeId, port });
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(`Initialization failed: ${err}`);
    }
  }, [nodeId, port]);

  useEffect(() => {
    if (isInitialized) {
      const fetchData = async () => {
        if (!isInitialized) return;

        try {
          const data = await secureInvoke<MeshStats>('mesh_get_stats');
          setStats(data);
          // Mock peers for now (backend will return actual peers later)
          setPeers([
            {
              id: data.node_id,
              addr: `127.0.0.1:${port}`,
              role: data.role as 'Root' | 'Worker',
              health: 95,
              load: 45,
              last_seen: Date.now(),
              capabilities: ['compute', 'storage'],
            },
          ]);
        } catch (err) {
          console.error('Failed to fetch stats:', err);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 2000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, port]);

  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case 'Root':
        return 'text-purple-400';
      case 'Worker':
        return 'text-blue-400';
      case 'Storage':
        return 'text-green-400';
      case 'Monitor':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  }, []);

  const getHealthColor = useCallback((health: number) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 70) return 'bg-yellow-500';
    if (health >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Node-Cluster Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Phase 5 : Réseau maillé distribué</p>
      </div>

      {/* Initialization Panel */}
      {!isInitialized && (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-purple-500/30">
          <h2 className="text-xl font-semibold text-white mb-4">
            Initialiser la couche Mesh
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">ID du nœud</label>
              <input
                type="text"
                value={nodeId}
                onChange={e => setNodeId(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                placeholder="node-12345"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Port</label>
              <input
                type="number"
                value={port}
                onChange={e => setPort(parseInt(e.target.value))}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                placeholder="9999"
              />
            </div>
          </div>
          <button
            onClick={initialize}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Démarrer le réseau Mesh
          </button>
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Stats Overview */}
      {isInitialized && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="text-gray-400 text-sm mb-2">ID du nœud</div>
            <div className="text-white text-xl font-bold truncate">{stats.node_id}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
            <div className="text-gray-400 text-sm mb-2">Rôle</div>
            <div className={`text-xl font-bold ${getRoleColor(stats.role)}`}>
              {stats.role}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <div className="text-gray-400 text-sm mb-2">Pairs</div>
            <div className="text-white text-xl font-bold">{stats.peer_count}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
            <div className="text-gray-400 text-sm mb-2">Charge moy.</div>
            <div className="text-white text-xl font-bold">
              {stats.avg_load.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Peer List */}
      {isInitialized && (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <h2 className="text-xl font-semibold text-white mb-4">Pairs actifs</h2>
          <div className="space-y-3">
            {peers.map(peer => (
              <div
                key={peer.id}
                className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold">{peer.id}</div>
                    <div className="text-gray-400 text-sm">{peer.addr}</div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(peer.role)}`}
                  >
                    {peer.role}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Santé</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2">
                        <div
                          className={`${getHealthColor(peer.health)} rounded-full h-2 transition-all`}
                          style={{ width: `${peer.health}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">
                        {peer.health}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Charge</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2 transition-all"
                          style={{ width: `${peer.load}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">{peer.load}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 flex-wrap">
                  {peer.capabilities.map(cap => (
                    <span
                      key={cap}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Visualization Placeholder */}
      {isInitialized && (
        <div className="mt-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <h2 className="text-xl font-semibold text-white mb-4">Network Topology</h2>
          <div className="bg-gray-900/50 rounded-xl h-64 flex items-center justify-center text-gray-500">
            Topology visualization (coming soon with D3.js)
          </div>
        </div>
      )}
    </div>
  );
});

export default NodeClusterDashboard;
