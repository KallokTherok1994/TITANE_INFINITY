/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — AUDIO DIAGNOSTICS PANEL
 *   Panneau de diagnostic et réglages audio unifié
 *   Design System TITANE∞ Monochrome v∞
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { useAudioSettings, type AudioDiagnosticStep } from '@/hooks/useAudioSettings';
import './AudioDiagnosticsPanel.css';

interface AudioDiagnosticsPanelProps {
  className?: string;
  onClose?: () => void;
  compact?: boolean;
}

export const AudioDiagnosticsPanel = ({
  className = '',
  onClose,
  compact = false,
}: AudioDiagnosticsPanelProps) => {
  const {
    inputDevices,
    outputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    permissions,
    isLoading,
    isTesting,
    isDiagnosing,
    healthSummary,
    micTestResult,
    speakerTestResult,
    diagnosticSteps,
    refreshDevices,
    selectInputDevice,
    selectOutputDevice,
    requestMicrophonePermission,
    testMicrophone,
    testSpeaker,
    runDiagnostics,
    resetAudioSystem,
    lastError,
    clearError,
  } = useAudioSettings();

  const [activeTab, setActiveTab] = useState<'devices' | 'diagnostics' | 'health'>(
    'devices'
  );

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  const getHealthIcon = () => {
    switch (healthSummary.status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getHealthLabel = () => {
    switch (healthSummary.status) {
      case 'healthy':
        return 'Système audio OK';
      case 'degraded':
        return 'Fonctionnement dégradé';
      case 'error':
        return 'Problème audio détecté';
      default:
        return 'État inconnu';
    }
  };

  const getPermissionIcon = () => {
    switch (permissions.microphone) {
      case 'granted':
        return '🎤✓';
      case 'denied':
        return '🎤✗';
      case 'prompt':
        return '🎤?';
      default:
        return '🎤';
    }
  };

  const getStepIcon = (step: AudioDiagnosticStep) => {
    switch (step.status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '•';
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className={`audio-diagnostics-panel ${compact ? 'compact' : ''} ${className}`}>
      {/* Header */}
      <div className="adp-header">
        <div className="adp-title">
          <span className="adp-icon">🔊</span>
          <h3>Audio & Voix</h3>
          <span className={`adp-health-badge ${healthSummary.status}`}>
            {getHealthIcon()} {getHealthLabel()}
          </span>
        </div>
        {onClose && (
          <button className="adp-close" onClick={onClose} title="Fermer">
            ✕
          </button>
        )}
      </div>

      {/* Error Banner */}
      {lastError && (
        <div className="adp-error-banner">
          <span>⚠️ {lastError}</span>
          <button onClick={clearError}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="adp-tabs">
        <button
          className={`adp-tab ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          📱 Périphériques
        </button>
        <button
          className={`adp-tab ${activeTab === 'diagnostics' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagnostics')}
        >
          🔧 Diagnostic
        </button>
        <button
          className={`adp-tab ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          💚 Santé
        </button>
      </div>

      {/* Content */}
      <div className="adp-content">
        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="adp-devices">
            {/* Permission Status */}
            <div className="adp-section">
              <div className="adp-section-header">
                <span>{getPermissionIcon()}</span>
                <span>Permission Microphone</span>
              </div>
              <div className="adp-permission-status">
                {permissions.microphone === 'granted' && (
                  <div className="permission-granted">
                    <span>✅ Permission accordée</span>
                    <p className="permission-help success">
                      Le microphone est prêt à être utilisé.
                    </p>
                  </div>
                )}
                {permissions.microphone === 'denied' && (
                  <div className="permission-denied">
                    <span>⚠️ Microphone non accessible</span>
                    <p className="permission-help">
                      Vérifiez que le microphone est correctement branché et actif.
                      <br />
                      Sur Linux, vérifiez les paramètres audio du système
                      (PipeWire/PulseAudio).
                      <br />
                      <code>pavucontrol</code> permet de configurer les périphériques.
                    </p>
                    <button
                      className="adp-btn secondary"
                      onClick={requestMicrophonePermission}
                    >
                      🔄 Réessayer le test
                    </button>
                  </div>
                )}
                {permissions.microphone === 'prompt' && (
                  <div className="permission-prompt">
                    <p className="permission-help">
                      Cliquez pour tester l'accès au microphone.
                    </p>
                    <button
                      className="adp-btn primary"
                      onClick={requestMicrophonePermission}
                    >
                      🎤 Tester le microphone
                    </button>
                  </div>
                )}
                {permissions.microphone === 'unavailable' && (
                  <div className="permission-unavailable">
                    <span>⚠️ Microphone non détecté</span>
                    <p className="permission-help">
                      Aucun microphone actif détecté par le système.
                      <br />
                      Branchez un microphone et cliquez sur Réessayer.
                    </p>
                    <button
                      className="adp-btn secondary"
                      onClick={requestMicrophonePermission}
                    >
                      🔄 Réessayer
                    </button>
                  </div>
                )}
                {permissions.microphone === 'checking' && (
                  <div className="permission-checking">
                    <span>⏳ Vérification en cours...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Microphone Selection */}
            <div className="adp-section">
              <div className="adp-section-header">
                <span>🎤</span>
                <span>Microphone</span>
                <button
                  className="adp-btn-icon"
                  onClick={() => refreshDevices()}
                  disabled={isLoading}
                  title="Actualiser"
                >
                  🔄
                </button>
              </div>
              <select
                className="adp-select"
                value={selectedInputDevice}
                onChange={e => selectInputDevice(e.target.value)}
                disabled={isLoading}
              >
                {Array.isArray(inputDevices) &&
                  inputDevices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.name} {device.isDefault ? '(Par défaut)' : ''}
                    </option>
                  ))}
              </select>
              <div className="adp-device-actions">
                <button
                  className="adp-btn"
                  onClick={() => testMicrophone()}
                  disabled={isTesting || permissions.microphone !== 'granted'}
                >
                  {isTesting ? '⏳ Test...' : '🎤 Tester le micro'}
                </button>
                {micTestResult && (
                  <div
                    className={`adp-test-result ${micTestResult.success ? 'success' : 'error'}`}
                  >
                    {micTestResult.success
                      ? `✅ OK ${micTestResult.signalToNoise ? `(SNR: ${micTestResult.signalToNoise.toFixed(1)}dB)` : ''}`
                      : `❌ ${micTestResult.errorMessage || 'Échec'}`}
                  </div>
                )}
              </div>
            </div>

            {/* Speaker Selection */}
            <div className="adp-section">
              <div className="adp-section-header">
                <span>🔊</span>
                <span>Haut-parleur</span>
              </div>
              <select
                className="adp-select"
                value={selectedOutputDevice}
                onChange={e => selectOutputDevice(e.target.value)}
                disabled={isLoading}
              >
                {Array.isArray(outputDevices) &&
                  outputDevices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.name} {device.isDefault ? '(Par défaut)' : ''}
                    </option>
                  ))}
              </select>
              <div className="adp-device-actions">
                <button
                  className="adp-btn"
                  onClick={() => testSpeaker()}
                  disabled={isTesting}
                >
                  {isTesting ? '⏳ Test...' : '🔊 Tester les HP'}
                </button>
                {speakerTestResult && (
                  <div
                    className={`adp-test-result ${speakerTestResult.success ? 'success' : 'error'}`}
                  >
                    {speakerTestResult.success
                      ? `✅ OK ${speakerTestResult.provider ? `(${speakerTestResult.provider})` : ''}`
                      : `❌ ${speakerTestResult.errorMessage || 'Échec'}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diagnostics Tab */}
        {activeTab === 'diagnostics' && (
          <div className="adp-diagnostics">
            <div className="adp-section">
              <p className="adp-section-desc">
                Lancez un diagnostic complet pour identifier et résoudre les problèmes
                audio.
              </p>
              <button
                className="adp-btn primary full-width"
                onClick={runDiagnostics}
                disabled={isDiagnosing}
              >
                {isDiagnosing ? '🔄 Diagnostic en cours...' : '🔧 Lancer le diagnostic'}
              </button>
            </div>

            {/* Diagnostic Steps */}
            {diagnosticSteps.length > 0 && (
              <div className="adp-section">
                <div className="adp-steps">
                  {diagnosticSteps.map(step => (
                    <div key={step.id} className={`adp-step ${step.status}`}>
                      <span className="adp-step-icon">{getStepIcon(step)}</span>
                      <div className="adp-step-content">
                        <span className="adp-step-name">{step.name}</span>
                        {step.message && (
                          <span className="adp-step-message">{step.message}</span>
                        )}
                        {step.details && (
                          <p className="adp-step-details">{step.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Button */}
            <div className="adp-section">
              <button
                className="adp-btn danger"
                onClick={resetAudioSystem}
                disabled={isDiagnosing}
              >
                🔄 Réinitialiser le système audio
              </button>
              <p className="adp-help-text">
                Remet les paramètres audio par défaut et recharge les périphériques.
              </p>
            </div>
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="adp-health">
            <div className="adp-section">
              <div className={`adp-health-card ${healthSummary.status}`}>
                <div className="adp-health-icon">{getHealthIcon()}</div>
                <div className="adp-health-info">
                  <h4>{getHealthLabel()}</h4>
                  <p className="adp-health-time">
                    Dernière vérification:{' '}
                    {healthSummary.lastCheck
                      ? new Date(healthSummary.lastCheck).toLocaleTimeString('fr-FR')
                      : 'Jamais'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="adp-section">
              <h4>État des composants</h4>
              <div className="adp-status-grid">
                <div
                  className={`adp-status-item ${healthSummary.microphoneOk ? 'ok' : 'error'}`}
                >
                  <span>{healthSummary.microphoneOk ? '✅' : '❌'}</span>
                  <span>Microphone</span>
                </div>
                <div
                  className={`adp-status-item ${healthSummary.speakerOk ? 'ok' : 'error'}`}
                >
                  <span>{healthSummary.speakerOk ? '✅' : '❌'}</span>
                  <span>Haut-parleur</span>
                </div>
                <div
                  className={`adp-status-item ${healthSummary.permissionsOk ? 'ok' : 'error'}`}
                >
                  <span>{healthSummary.permissionsOk ? '✅' : '❌'}</span>
                  <span>Permissions</span>
                </div>
              </div>
            </div>

            {/* Issues List */}
            {healthSummary.issues.length > 0 && (
              <div className="adp-section">
                <h4>Problèmes détectés</h4>
                <ul className="adp-issues-list">
                  {healthSummary.issues.map((issue, i) => (
                    <li key={i}>⚠️ {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Actions */}
            <div className="adp-section">
              <h4>Actions rapides</h4>
              <div className="adp-quick-actions">
                <button
                  className="adp-btn"
                  onClick={runDiagnostics}
                  disabled={isDiagnosing}
                >
                  🔧 Diagnostiquer
                </button>
                <button className="adp-btn" onClick={refreshDevices} disabled={isLoading}>
                  🔄 Actualiser
                </button>
                <button className="adp-btn" onClick={resetAudioSystem}>
                  ↩️ Réinitialiser
                </button>
              </div>
            </div>

            {/* OPUS-FIX v∞: Auto-Réparation */}
            <div className="adp-section">
              <h4>🩺 Auto-Réparation</h4>
              <p className="adp-help-text" style={{ marginBottom: '0.75rem' }}>
                Lance un diagnostic complet avec tentative de réparation automatique des
                problèmes détectés.
              </p>
              <button
                className="adp-btn primary"
                onClick={async () => {
                  try {
                    const { audioHealthService } = await import(
                      '@/services/audio/audioHealthCheck'
                    );
                    const result = await audioHealthService.diagnoseAndRepair();
                    console.log('[AudioDiagnosticsPanel] Auto-repair result:', result);
                    // Rafraîchir l'UI après réparation
                    await runDiagnostics();
                  } catch (error) {
                    console.error('[AudioDiagnosticsPanel] Auto-repair failed:', error);
                  }
                }}
                disabled={isDiagnosing}
              >
                🩺 Lancer Auto-Réparation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioDiagnosticsPanel;
