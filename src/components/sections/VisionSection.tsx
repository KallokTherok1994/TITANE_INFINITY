/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * VisionSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Camera preview, detection overlay, vision metrics
 */

import React, { useState, useCallback, memo } from 'react';
import { Grid, Stack } from '@components/layout';
import { Button } from '../ui';
import { Card } from '@/ui';
import { CameraPreview } from '@/components/vision/CameraPreview';
import { TMetric, TSectionHeader } from '@/design-system';
import { Camera } from 'lucide-react';
import { colors, spacing, fontSizes } from '@themes/tokens';
import {
  useVisionStore,
  selectIsCameraActive,
  selectIsObservationActive,
  selectEnergyLevel,
  selectTensionLevel,
  selectEngagementLevel,
  selectConfidence,
} from '@/stores/useVisionStore';
import { detectEnvironment } from '@/core/tauri/environment';
import { createLogger } from '@/utils/logger';

const pageLogger = createLogger('VisionSection');

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type VisionSectionProps = Record<string, never>;

type VisualLevel = 'low' | 'medium' | 'high';

interface StatusIndicatorProps {
  active: boolean;
  label: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const _levelToPercent = (level: VisualLevel): number => {
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

const _levelToLabel = (level: VisualLevel): string => {
  switch (level) {
    case 'low':
      return 'Faible';
    case 'medium':
      return 'Moyen';
    case 'high':
      return 'Élevé';
    default:
      return '—';
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const StatusIndicator: React.FC<StatusIndicatorProps> = memo(({ active, label }) => (
  <div className={`titane-status-indicator ${active ? 'active' : ''}`}>
    <span className="status-dot" />
    <span className="status-label">{label}</span>
  </div>
));
StatusIndicator.displayName = 'StatusIndicator';

// Lazy-load heavy components
const LazyDetectionOverlay = React.lazy(() =>
  import('@/features/vision/DetectionOverlay').then(m => ({
    default: m.DetectionOverlay,
  }))
);

const LazyVisionMetricsChart = React.lazy(() =>
  import('@/features/vision/VisionMetricsChart').then(m => ({
    default: m.VisionMetricsChart,
  }))
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const VisionSection: React.FC<VisionSectionProps> = memo(() => {
  const env = detectEnvironment();

  // ═══ VISION STORE ═══
  const isCameraActive = useVisionStore(selectIsCameraActive);
  const isObservationActive = useVisionStore(selectIsObservationActive);
  const energyLevel = useVisionStore(selectEnergyLevel);
  const tensionLevel = useVisionStore(selectTensionLevel);
  const engagementLevel = useVisionStore(selectEngagementLevel);
  const confidence = useVisionStore(selectConfidence);
  const enableVision = useVisionStore(s => s.enableVision);
  const requestCameraPermission = useVisionStore(s => s.requestCameraPermission);
  const startCamera = useVisionStore(s => s.startCamera);

  // ═══ STATE ═══
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ═══ HANDLERS ═══
  const handleStartVision = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    try {
      const permission = await requestCameraPermission();
      if (permission !== 'granted') {
        setError('Permission caméra refusée. Autorisez la caméra pour activer Vision.');
        return;
      }

      const enabled = await enableVision();
      if (!enabled) {
        setError('Activation Vision annulée ou impossible.');
        return;
      }

      const started = await startCamera();
      if (!started) {
        setError('Impossible de démarrer la caméra.');
        return;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      pageLogger.error('Vision start failed', e);
    } finally {
      setIsStarting(false);
    }
  }, [enableVision, requestCameraPermission, startCamera]);

  // ═══ RENDER ═══
  return (
    <div className="titane-section titane-section-vision">
      <TSectionHeader
        title="📷 Vision & Perception"
        subtitle="Analyse visuelle et estimation affective en temps réel"
      />

      <Grid columns={2} gap={4}>
        {/* Camera Preview avec Detection Overlay */}
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Caméra & Détections</h3>
          <StatusIndicator active={isCameraActive} label="Caméra Active" />

          <div className="vision-camera-container">
            {env.isTauri ? (
              <div style={{ position: 'relative' }}>
                {!isCameraActive && (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}
                  >
                    <div style={{ color: colors.neutral[400] }}>
                      Opt-in requis: activez Vision puis démarrez la caméra.
                    </div>
                    {error && (
                      <div style={{ color: colors.semantic.error[400] }}>{error}</div>
                    )}
                    <div style={{ display: 'flex', gap: spacing[3] }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleStartVision}
                        disabled={isStarting}
                      >
                        {isStarting ? 'Activation...' : 'Activer Vision & Caméra'}
                      </Button>
                    </div>
                  </div>
                )}

                <CameraPreview position="bottom-left" />
                <React.Suspense fallback={null}>
                  <LazyDetectionOverlay />
                </React.Suspense>
              </div>
            ) : (
              <div className="vision-placeholder">
                <Camera size={48} color={colors.neutral[400]} />
                <p style={{ color: colors.neutral[400], marginTop: spacing[4] }}>
                  Disponible en mode Tauri uniquement
                </p>
              </div>
            )}
          </div>

          <div className="vision-ethical-disclaimer" style={{ marginTop: spacing[4] }}>
            <h4>⚠️ Information Importante</h4>
            <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
              Le module Vision est <strong>100% local</strong> — aucune donnée n&apos;est
              envoyée vers le cloud.
            </p>
          </div>
        </Card>

        {/* Vision Stats */}
        <Card>
          <h3 style={{ marginBottom: spacing[4] }}>Métriques Vision</h3>

          <Stack direction="vertical" gap={3}>
            <TMetric
              label="Observation"
              value={isObservationActive ? 'Active' : 'Inactive'}
              color={isObservationActive ? 'success' : 'warning'}
            />
            <TMetric
              label="Énergie (indice)"
              value={`${_levelToLabel(energyLevel)} (${_levelToPercent(energyLevel)}%)`}
              color="success"
            />
            <TMetric
              label="Tension (indice)"
              value={`${_levelToLabel(tensionLevel)} (${_levelToPercent(tensionLevel)}%)`}
              color="warning"
            />
            <TMetric
              label="Engagement (indice)"
              value={`${_levelToLabel(engagementLevel)} (${_levelToPercent(engagementLevel)}%)`}
              color="info"
            />
            <TMetric
              label="Confiance"
              value={`${Math.round((confidence || 0) * 100)}%`}
              color="primary"
            />
          </Stack>
        </Card>
      </Grid>

      {/* Vision Metrics Charts */}
      <div style={{ marginTop: spacing[6] }}>
        <h3 style={{ marginBottom: spacing[4] }}>📈 Graphiques de Métriques</h3>
        <React.Suspense fallback={null}>
          <LazyVisionMetricsChart />
        </React.Suspense>
      </div>
    </div>
  );
});

VisionSection.displayName = 'VisionSection';
