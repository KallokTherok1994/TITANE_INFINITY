/**
 * TITANE_INFINITY v∞.19.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.19.3Ω — CAMERA PAGE
 *   Centre de Vision & Analyse Visuelle
 *   Vision Engine + Body Language + Affect Estimation
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useVisionStore, selectIsCameraActive } from '@/stores/useVisionStore';
import { CameraPreview } from '@/components/vision/CameraPreview';
import { detectEnvironment } from '@/core/tauri/environment';
import type { VisualLevel } from '@/types/visionAffect';
import './CameraPage.css';

// ============================================================================
// TYPES
// ============================================================================

interface StatusIndicatorProps {
  active: boolean;
  label: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ active, label }) => (
  <div className={`camera-status-indicator ${active ? 'active' : ''}`}>
    <span className="status-dot" />
    <span className="status-label">{label}</span>
  </div>
);

const EthicalDisclaimer: React.FC = () => (
  <div className="camera-ethical-disclaimer">
    <h4>⚠️ Information Importante</h4>
    <p>
      Le module Vision est <strong>100% local</strong> — aucune donnée n'est envoyée vers
      le cloud.
    </p>
    <p>
      Les analyses émotionnelles sont des <strong>indices approximatifs</strong>, pas des
      diagnostics cliniques.
    </p>
    <p>
      L'activation nécessite votre <strong>consentement explicite</strong> (opt-in).
    </p>
  </div>
);

// ============================================================================
// HELPERS
// ============================================================================

const levelToPercent = (level: VisualLevel): number => {
  switch (level) {
    case 'low':
      return 25;
    case 'medium':
      return 50;
    case 'high':
      return 75;
    default:
      return 50;
  }
};

const levelToColor = (level: VisualLevel): string => {
  switch (level) {
    case 'high':
      return 'var(--titane-accent)';
    case 'medium':
      return 'var(--titane-primary)';
    case 'low':
      return 'var(--titane-secondary)';
    default:
      return 'var(--titane-secondary)';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CameraPage: React.FC = () => {
  const env = detectEnvironment();
  const [error, setError] = useState<string | null>(null);

  // Vision Store
  const isCameraActive = useVisionStore(selectIsCameraActive);
  const visionInput = useVisionStore(s => s.visionInput);
  const bodyLanguage = useVisionStore(s => s.bodyLanguage);
  const affectEstimation = useVisionStore(s => s.affectEstimation);
  const config = useVisionStore(s => s.config);
  const isProcessing = useVisionStore(s => s.isProcessing);
  const lastError = useVisionStore(s => s.lastError);
  const isObservationActive = useVisionStore(s => s.isObservationActive);

  // Actions
  const enableVision = useVisionStore(s => s.enableVision);
  const disableVision = useVisionStore(s => s.disableVision);
  const updateConfig = useVisionStore(s => s.updateConfig);
  const requestCameraPermission = useVisionStore(s => s.requestCameraPermission);
  const startCamera = useVisionStore(s => s.startCamera);
  const stopCamera = useVisionStore(s => s.stopCamera);

  // Handle camera toggle
  const handleToggleCamera = async () => {
    setError(null);
    try {
      if (isCameraActive) {
        stopCamera();
      } else {
        // Request permission first
        const permStatus = await requestCameraPermission();
        if (permStatus === 'granted') {
          await startCamera();
        } else if (permStatus === 'denied') {
          setError(
            "Permission caméra refusée. Veuillez l'autoriser dans les paramètres système."
          );
        }
      }
    } catch (err) {
      setError(`Erreur caméra: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle vision toggle
  const handleToggleVision = async () => {
    setError(null);
    try {
      if (isObservationActive) {
        disableVision();
      } else {
        const success = await enableVision(30 * 60 * 1000); // 30 minutes max
        if (!success) {
          setError("Impossible d'activer le Vision Engine");
        }
      }
    } catch (err) {
      setError(`Erreur Vision: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="camera-page">
      {/* Header */}
      <header className="camera-page-header">
        <h1>📷 Centre Vision</h1>
        <span className="camera-version">Vision Engine v∞</span>
      </header>

      {/* Status Bar */}
      <div className="camera-status-bar">
        <StatusIndicator active={isCameraActive} label="Caméra" />
        <StatusIndicator active={isObservationActive} label="Vision Engine" />
        <StatusIndicator active={isProcessing} label="Analyse" />
        <StatusIndicator active={bodyLanguage.landmarksDetected} label="Body Tracking" />
      </div>

      {/* Error Display */}
      {(error || lastError) && (
        <div className="camera-error">
          <span className="error-icon">⚠️</span>
          <span>{error || lastError?.message}</span>
        </div>
      )}

      {/* Environment Warning */}
      {!env.isTauri && (
        <div className="camera-warning">
          <strong>Note:</strong> En mode navigateur, certaines fonctionnalités peuvent
          être limitées. Pour une expérience complète, utilisez l'application Tauri
          native.
        </div>
      )}

      {/* Main Content */}
      <div className="camera-page-content">
        {/* Left Column: Controls */}
        <div className="camera-controls-panel">
          <h2>Contrôles</h2>

          <div className="control-group">
            <button
              className={`camera-btn ${isCameraActive ? 'active' : ''}`}
              onClick={handleToggleCamera}
              disabled={isProcessing}
            >
              {isCameraActive ? '⏹️ Arrêter Caméra' : '▶️ Démarrer Caméra'}
            </button>

            <button
              className={`camera-btn ${isObservationActive ? 'active' : ''}`}
              onClick={handleToggleVision}
              disabled={!isCameraActive || isProcessing}
            >
              {isObservationActive ? '🔴 Désactiver Vision' : '🟢 Activer Vision Engine'}
            </button>
          </div>

          <div className="control-group">
            <h3>Configuration</h3>
            <label className="config-toggle">
              <input
                type="checkbox"
                checked={config.processingEnabled}
                onChange={e => updateConfig({ processingEnabled: e.target.checked })}
              />
              <span>Traitement actif</span>
            </label>
            <label className="config-toggle">
              <input
                type="checkbox"
                checked={config.debugOverlayEnabled}
                onChange={e => updateConfig({ debugOverlayEnabled: e.target.checked })}
              />
              <span>Overlay Debug</span>
            </label>
          </div>

          <EthicalDisclaimer />
        </div>

        {/* Center: Camera Preview */}
        <div className="camera-preview-container">
          {isCameraActive ? (
            <CameraPreview
              size="large"
              position="top-left"
              showControls={true}
              showLandmarksOverlay={config.debugOverlayEnabled}
              mirrored={true}
            />
          ) : (
            <div className="camera-placeholder">
              <span className="placeholder-icon">📷</span>
              <p>Caméra inactive</p>
              <p className="placeholder-hint">
                Cliquez sur "Démarrer Caméra" pour activer
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Analysis */}
        <div className="camera-analysis-panel">
          <h2>Analyse en Temps Réel</h2>

          {isObservationActive ? (
            <>
              {/* Affect Estimation */}
              <div className="analysis-section">
                <h3>🎭 Indices Visuels (Approximatifs)</h3>
                <div className="affect-meters">
                  <div className="affect-meter">
                    <label>Énergie</label>
                    <div className="meter-bar">
                      <div
                        className="meter-fill"
                        style={{
                          width: `${levelToPercent(affectEstimation.visualEnergyLevel)}%`,
                          backgroundColor: levelToColor(
                            affectEstimation.visualEnergyLevel
                          ),
                        }}
                      />
                    </div>
                    <span>{affectEstimation.visualEnergyLevel}</span>
                  </div>
                  <div className="affect-meter">
                    <label>Tension</label>
                    <div className="meter-bar">
                      <div
                        className="meter-fill"
                        style={{
                          width: `${levelToPercent(affectEstimation.visualTensionLevel)}%`,
                          backgroundColor: levelToColor(
                            affectEstimation.visualTensionLevel
                          ),
                        }}
                      />
                    </div>
                    <span>{affectEstimation.visualTensionLevel}</span>
                  </div>
                  <div className="affect-meter">
                    <label>Engagement</label>
                    <div className="meter-bar">
                      <div
                        className="meter-fill"
                        style={{
                          width: `${levelToPercent(affectEstimation.visualEngagementLevel)}%`,
                          backgroundColor: levelToColor(
                            affectEstimation.visualEngagementLevel
                          ),
                        }}
                      />
                    </div>
                    <span>{affectEstimation.visualEngagementLevel}</span>
                  </div>
                </div>
                <p className="affect-disclaimer">
                  Ces indices sont approximatifs et ne constituent pas un diagnostic.
                </p>
              </div>

              {/* Body Language */}
              <div className="analysis-section">
                <h3>🧍 Langage Corporel</h3>
                <div className="body-stats">
                  <div className="body-stat">
                    <label>Posture</label>
                    <span>{Math.round(bodyLanguage.postureScore * 100)}%</span>
                  </div>
                  <div className="body-stat">
                    <label>Mouvement</label>
                    <span>{Math.round(bodyLanguage.movementScore * 100)}%</span>
                  </div>
                  <div className="body-stat">
                    <label>Stabilité regard</label>
                    <span>{Math.round(bodyLanguage.gazeStabilityScore * 100)}%</span>
                  </div>
                  <div className="body-stat">
                    <label>Confiance</label>
                    <span>{Math.round(bodyLanguage.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Camera Stats */}
              <div className="analysis-section">
                <h3>📊 Statistiques Caméra</h3>
                <div className="camera-stats">
                  <div className="stat-item">
                    <label>Permission</label>
                    <span>{visionInput.permissionStatus}</span>
                  </div>
                  <div className="stat-item">
                    <label>FPS estimé</label>
                    <span>{visionInput.fpsEstimate}</span>
                  </div>
                  <div className="stat-item">
                    <label>Frames traités</label>
                    <span>{visionInput.framesProcessed}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="analysis-placeholder">
              <span className="placeholder-icon">🔒</span>
              <p>Vision Engine désactivé</p>
              <p className="placeholder-hint">
                Activez le Vision Engine pour voir l'analyse en temps réel
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraPage;
