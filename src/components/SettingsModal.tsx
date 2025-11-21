/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE INFINITY v16.1 - SETTINGS MODAL (AI MODE CONFIGURATION)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Modal de configuration du mode AI : Local / Cloud / Hybrid
 * Gestion des providers, confirmations, et status
 * 
 * @module SettingsModal
 * @version 16.1.0
 * @date 2025-11-21
 */

import { useState, useEffect } from 'react';
import {
  getAIConfig,
  enableCloudMode,
  disableCloudMode,
  checkInternetConnection,
  isOnlineModeEnabled,
  type AIConfig
} from '../config/offline-first';
import { getApprovalStatus, resetAllApprovals } from '../utils/cloudAPIConfirmation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [config, setConfig] = useState<AIConfig>(getAIConfig());
  const [isOnline, setIsOnline] = useState(false);
  const [approvals, setApprovals] = useState<{session: string[], permanent: string[]}>({
    session: [],
    permanent: []
  });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getAIConfig());
      setIsOnline(isOnlineModeEnabled());
      setApprovals(getApprovalStatus());
    }
  }, [isOpen]);

  const handleCheckInternet = async () => {
    setChecking(true);
    const online = await checkInternetConnection();
    setIsOnline(online);
    setChecking(false);
  };

  const handleModeChange = (mode: 'local' | 'cloud' | 'hybrid') => {
    if (mode === 'local') {
      disableCloudMode();
    } else {
      // Par défaut gemini pour cloud/hybrid
      const cloudProvider = config.provider === 'gemini' || config.provider === 'openai' 
        ? config.provider 
        : 'gemini';
      enableCloudMode(cloudProvider);
    }
    setConfig(getAIConfig());
    setIsOnline(isOnlineModeEnabled());
  };

  const handleProviderChange = (provider: 'ollama' | 'gemini' | 'openai' | 'local') => {
    if (config.mode !== 'local' && (provider === 'gemini' || provider === 'openai')) {
      enableCloudMode(provider);
    }
    setConfig(getAIConfig());
  };

  const handleResetApprovals = () => {
    if (confirm('Réinitialiser toutes les approbations cloud ?')) {
      resetAllApprovals();
      setApprovals(getApprovalStatus());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h2>⚙️ Configuration AI</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Status Internet */}
        <div className="settings-section">
          <h3>📡 Status Internet</h3>
          <div className="status-row">
            <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
            </span>
            <button 
              className="btn-secondary"
              onClick={handleCheckInternet}
              disabled={checking}
            >
              {checking ? '⏳ Vérification...' : '🔄 Vérifier'}
            </button>
          </div>
        </div>

        {/* Mode AI */}
        <div className="settings-section">
          <h3>🤖 Mode AI</h3>
          <div className="mode-selector">
            <button
              className={`mode-btn ${config.mode === 'local' ? 'active' : ''}`}
              onClick={() => handleModeChange('local')}
            >
              <div className="mode-icon">🏠</div>
              <div className="mode-label">Local</div>
              <div className="mode-desc">100% offline</div>
            </button>
            
            <button
              className={`mode-btn ${config.mode === 'cloud' ? 'active' : ''}`}
              onClick={() => handleModeChange('cloud')}
            >
              <div className="mode-icon">🌐</div>
              <div className="mode-label">Cloud</div>
              <div className="mode-desc">APIs externes</div>
            </button>
            
            <button
              className={`mode-btn ${config.mode === 'hybrid' ? 'active' : ''}`}
              onClick={() => handleModeChange('hybrid')}
            >
              <div className="mode-icon">⚡</div>
              <div className="mode-label">Hybrid</div>
              <div className="mode-desc">Local + Cloud</div>
            </button>
          </div>
        </div>

        {/* Provider Selection */}
        {config.mode !== 'local' && (
          <div className="settings-section">
            <h3>🔌 Provider Cloud</h3>
            <select 
              className="provider-select"
              value={config.provider}
              onChange={(e) => handleProviderChange(e.target.value as any)}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>
        )}

        {/* Confirmations */}
        <div className="settings-section">
          <h3>🔐 Confirmations Cloud</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.requireOnlineConfirmation}
              onChange={() => {
                // Toggle sera implémenté via config update
                console.log('Toggle confirmation');
              }}
            />
            <span>Demander confirmation avant chaque appel API cloud</span>
          </label>
        </div>

        {/* Approbations */}
        {(approvals.session.length > 0 || approvals.permanent.length > 0) && (
          <div className="settings-section">
            <h3>✅ Approbations Actives</h3>
            
            {approvals.permanent.length > 0 && (
              <div className="approvals-list">
                <div className="approvals-label">⭐ Permanentes:</div>
                {approvals.permanent.map(p => (
                  <span key={p} className="approval-tag permanent">{p}</span>
                ))}
              </div>
            )}
            
            {approvals.session.length > 0 && (
              <div className="approvals-list">
                <div className="approvals-label">🔄 Session:</div>
                {approvals.session.map(p => (
                  <span key={p} className="approval-tag session">{p}</span>
                ))}
              </div>
            )}
            
            <button 
              className="btn-danger"
              onClick={handleResetApprovals}
            >
              🗑️ Réinitialiser toutes les approbations
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="settings-footer">
          <p className="settings-info">
            🛡️ Mode OFFLINE FIRST activé - Vos données restent locales par défaut
          </p>
          <button className="btn-primary" onClick={onClose}>
            ✅ Fermer
          </button>
        </div>
      </div>

      <style>{`
        .settings-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(8px);
        }

        .settings-modal-content {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #00d9ff;
          border-radius: 20px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 80px rgba(0, 217, 255, 0.4);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid rgba(0, 217, 255, 0.3);
        }

        .settings-header h2 {
          color: #00d9ff;
          margin: 0;
          font-size: 28px;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 32px;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .close-btn:hover {
          color: #ff3366;
          transform: rotate(90deg);
        }

        .settings-section {
          margin-bottom: 32px;
        }

        .settings-section h3 {
          color: #ffffff;
          font-size: 20px;
          margin: 0 0 16px 0;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-indicator {
          flex: 1;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
        }

        .status-indicator.online {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
          border: 2px solid #4CAF50;
        }

        .status-indicator.offline {
          background: rgba(255, 51, 102, 0.2);
          color: #ff3366;
          border: 2px solid #ff3366;
        }

        .mode-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .mode-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .mode-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(0, 217, 255, 0.5);
          transform: translateY(-2px);
        }

        .mode-btn.active {
          background: rgba(0, 217, 255, 0.2);
          border-color: #00d9ff;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
        }

        .mode-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .mode-label {
          color: #ffffff;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .mode-desc {
          color: #aaaaaa;
          font-size: 12px;
        }

        .provider-select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .provider-select:hover {
          border-color: #00d9ff;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .approvals-list {
          margin-bottom: 16px;
        }

        .approvals-label {
          color: #aaaaaa;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .approval-tag {
          display: inline-block;
          padding: 6px 12px;
          margin: 4px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
        }

        .approval-tag.permanent {
          background: rgba(0, 217, 255, 0.2);
          color: #00d9ff;
          border: 1px solid #00d9ff;
        }

        .approval-tag.session {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
          border: 1px solid #4CAF50;
        }

        .btn-primary, .btn-secondary, .btn-danger {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #00d9ff;
          color: #1a1a2e;
          width: 100%;
        }

        .btn-primary:hover {
          background: #00b8dd;
          transform: scale(1.02);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-danger {
          background: #ff3366;
          color: #ffffff;
          width: 100%;
        }

        .btn-danger:hover {
          background: #dd2244;
        }

        .settings-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid rgba(0, 217, 255, 0.3);
        }

        .settings-info {
          color: #ffaa00;
          font-size: 14px;
          text-align: center;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
