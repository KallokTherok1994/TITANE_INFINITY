/**
 * TITANE∞ OS v24.7 - Section Mises à jour
 * Auto-update et gestion des versions
 * Optimisé avec useCallback
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';

interface UpdateInfo {
  current_version: string;
  latest_version: string;
  update_available: boolean;
  changelog: string;
}

export const UpdatesSection: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);

  const checkForUpdates = useCallback(async () => {
    setChecking(true);
    try {
      const info = await secureInvoke<UpdateInfo>('check_for_updates');
      setUpdateInfo(info);
    } catch (error) {
      console.error('Erreur vérification updates:', error);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const installUpdate = useCallback(async () => {
    setUpdating(true);
    try {
      await secureInvoke('install_update');
      await checkForUpdates();
    } catch (error) {
      console.error('Erreur installation update:', error);
    } finally {
      setUpdating(false);
    }
  }, [checkForUpdates]);

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Mises à jour</h2>
        <button
          className="cp-button secondary"
          onClick={checkForUpdates}
          disabled={checking}
          aria-busy={checking}
        >
          {checking ? '⏳ Vérification...' : '🔍 Vérifier'}
        </button>
      </div>

      <div className="cp-grid cp-grid-2">
        <div className="cp-card">
          <h3 className="cp-card-title">Version actuelle</h3>
          <div className="cp-card-content">
            <div className="cp-info-row">
              <span className="cp-info-label">Version installée</span>
              <span className="cp-info-value">
                {updateInfo?.current_version || 'v19.1.0'}
              </span>
            </div>
            <div className="cp-info-row">
              <span className="cp-info-label">Dernière version</span>
              <span className="cp-info-value">
                {updateInfo?.latest_version || 'v19.1.0'}
              </span>
            </div>
          </div>
        </div>

        <div className="cp-card">
          <h3 className="cp-card-title">État</h3>
          <div className="cp-card-content">
            {updateInfo?.update_available ? (
              <>
                <span className="cp-badge warning" role="status">
                  <span className="cp-badge-dot" />
                  Mise à jour disponible
                </span>
                <button
                  className="cp-button"
                  onClick={installUpdate}
                  disabled={updating}
                  aria-busy={updating}
                  style={{ marginTop: '16px' }}
                >
                  {updating ? '⏳ Installation...' : '⬇️ Installer la mise à jour'}
                </button>
              </>
            ) : (
              <span className="cp-badge success" role="status">
                <span className="cp-badge-dot" />À jour
              </span>
            )}
          </div>
        </div>
      </div>

      {updateInfo?.changelog && (
        <div className="cp-card">
          <h3 className="cp-card-title">Changelog</h3>
          <div className="cp-card-content">
            <pre className="cp-changelog">{updateInfo.changelog}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
