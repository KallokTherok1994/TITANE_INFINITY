/**
 * TITANE∞ OS - Section Mémoire
 * Gestion du stockage et des caches
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';

interface MemoryStats {
  total_size: number;
  used_size: number;
  cache_size: number;
  vector_count: number;
}

export const MemorySection: React.FC = () => {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const memoryStats = await secureInvoke<MemoryStats>('get_memory_stats');
      setStats(memoryStats);
    } catch (error) {
      console.error('Erreur chargement stats mémoire:', error);
    }
  };

  const clearCache = async () => {
    setClearing(true);
    try {
      await secureInvoke('clear_memory_cache');
      await loadStats();
    } catch (error) {
      console.error('Erreur nettoyage cache:', error);
    } finally {
      setClearing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Mémoire</h2>
        <div className="cp-section-actions">
          <button className="cp-button secondary" onClick={loadStats}>
            🔄 Actualiser
          </button>
          <button className="cp-button danger" onClick={clearCache} disabled={clearing}>
            {clearing ? '⏳ Nettoyage...' : '🗑️ Vider le cache'}
          </button>
        </div>
      </div>

      <div className="cp-grid cp-grid-3">
        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">Taille totale</span>
          <span className="cp-stat-value">{formatBytes(stats?.total_size || 0)}</span>
        </div>

        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">Utilisé</span>
          <span className="cp-stat-value">{formatBytes(stats?.used_size || 0)}</span>
        </div>

        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">Cache</span>
          <span className="cp-stat-value">{formatBytes(stats?.cache_size || 0)}</span>
        </div>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Vecteurs embeddings</h3>
        <div className="cp-card-content">
          <div className="cp-info-row">
            <span className="cp-info-label">Nombre de vecteurs</span>
            <span className="cp-info-value">{stats?.vector_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
