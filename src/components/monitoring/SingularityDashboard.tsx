/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ SINGULARITY DASHBOARD v∞
 *
 *   Dashboard unifié de monitoring temps réel pour SingularityEngine
 *   - Métriques système en temps réel
 *   - État des 20 engines
 *   - Champ de singularité visuel
 *   - Alertes et anomalies
 *   - Consciousness level indicator
 *
 *   Design System: Monochrome TITANE (#C4C4C4 / #727B81)
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSingularity } from '@/hooks/useSingularity';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface EngineMetric {
  name: string;
  layer: 'physical' | 'cognitive' | 'symbolic' | 'adaptive' | 'meta' | 'singularity';
  status: 'active' | 'idle' | 'error' | 'disabled';
  health: number; // 0-100
  lastUpdate: number;
  metrics?: {
    updateCount: number;
    avgUpdateTime: number;
    errors: number;
  };
}

interface SystemMetrics {
  cpu_usage_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  uptime_seconds: number;
}

interface DashboardProps {
  refreshInterval?: number;
  compact?: boolean;
  showEngineDetails?: boolean;
  showSingularityField?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════

const COLORS = {
  primary: '#C4C4C4',
  secondary: '#727B81',
  background: '#0A0A0A',
  surface: '#141414',
  text: '#F5F5F5',
  muted: '#808080',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  accent: '#6366F1',
};

const LAYER_COLORS: Record<EngineMetric['layer'], string> = {
  physical: '#22C55E',
  cognitive: '#3B82F6',
  symbolic: '#8B5CF6',
  adaptive: '#F59E0B',
  meta: '#EC4899',
  singularity: '#C4C4C4',
};

// ═══════════════════════════════════════════════════════════════════
// CONSCIOUSNESS INDICATOR
// ═══════════════════════════════════════════════════════════════════

const ConsciousnessIndicator = memo(function ConsciousnessIndicator({
  level,
  autoCoherence,
}: {
  level: number;
  autoCoherence: number;
}) {
  const percentage = Math.min(100, Math.round(level * 25));
  const coherencePercent = Math.round(autoCoherence * 100);

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${COLORS.secondary}33`,
      }}
    >
      <h3
        style={{
          color: COLORS.primary,
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Consciousness Level
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Circular indicator */}
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
          }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke={COLORS.secondary}
              strokeWidth="6"
              opacity={0.2}
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke={COLORS.primary}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.2} 220`}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                color: COLORS.text,
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {level.toFixed(1)}
            </div>
            <div
              style={{
                color: COLORS.muted,
                fontSize: '10px',
              }}
            >
              / 4.0
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: COLORS.muted, fontSize: '12px' }}>
                Auto-Coherence
              </span>
              <span style={{ color: COLORS.text, fontSize: '12px' }}>
                {coherencePercent}%
              </span>
            </div>
            <div
              style={{
                height: '4px',
                background: COLORS.secondary + '33',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${coherencePercent}%`,
                  background: COLORS.accent,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: COLORS.muted, fontSize: '12px' }}>Consciousness</span>
              <span style={{ color: COLORS.text, fontSize: '12px' }}>{percentage}%</span>
            </div>
            <div
              style={{
                height: '4px',
                background: COLORS.secondary + '33',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: COLORS.primary,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// SINGULARITY FIELD VISUALIZER
// ═══════════════════════════════════════════════════════════════════

const SingularityFieldVisualizer = memo(function SingularityFieldVisualizer({
  field,
}: {
  field: {
    energy: number;
    motion: number;
    symbolism: number;
    depth: number;
    presence: number;
  };
}) {
  const dimensions = [
    { name: 'Energy', value: field.energy, color: '#22C55E' },
    { name: 'Motion', value: field.motion, color: '#3B82F6' },
    { name: 'Symbolism', value: field.symbolism, color: '#8B5CF6' },
    { name: 'Depth', value: field.depth, color: '#F59E0B' },
    { name: 'Presence', value: field.presence, color: '#EC4899' },
  ];

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${COLORS.secondary}33`,
      }}
    >
      <h3
        style={{
          color: COLORS.primary,
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Singularity Field
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {dimensions.map(dim => (
          <div key={dim.name}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: COLORS.muted, fontSize: '12px' }}>{dim.name}</span>
              <span style={{ color: COLORS.text, fontSize: '12px' }}>
                {Math.round(dim.value * 100)}%
              </span>
            </div>
            <div
              style={{
                height: '6px',
                background: COLORS.secondary + '33',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${dim.value * 100}%`,
                  background: dim.color,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// ENGINE GRID
// ═══════════════════════════════════════════════════════════════════

const EngineGrid = memo(function EngineGrid({
  engines,
  showDetails,
}: {
  engines: EngineMetric[];
  showDetails: boolean;
}) {
  const groupedByLayer = engines.reduce(
    (acc, engine) => {
      if (!acc[engine.layer]) {
        acc[engine.layer] = [];
      }
      acc[engine.layer].push(engine);
      return acc;
    },
    {} as Record<EngineMetric['layer'], EngineMetric[]>
  );

  const layerOrder: EngineMetric['layer'][] = [
    'singularity',
    'meta',
    'adaptive',
    'symbolic',
    'cognitive',
    'physical',
  ];

  const getStatusIcon = (status: EngineMetric['status']) => {
    switch (status) {
      case 'active':
        return '●';
      case 'idle':
        return '○';
      case 'error':
        return '✕';
      case 'disabled':
        return '◌';
    }
  };

  const getStatusColor = (status: EngineMetric['status']) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'idle':
        return COLORS.muted;
      case 'error':
        return COLORS.error;
      case 'disabled':
        return COLORS.secondary;
    }
  };

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${COLORS.secondary}33`,
      }}
    >
      <h3
        style={{
          color: COLORS.primary,
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Engine Status ({engines.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {layerOrder.map(layer => {
          const layerEngines = groupedByLayer[layer] || [];
          if (layerEngines.length === 0) return null;

          return (
            <div key={layer}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    background: LAYER_COLORS[layer],
                  }}
                />
                <span
                  style={{
                    color: COLORS.muted,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {layer}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: showDetails
                    ? 'repeat(auto-fill, minmax(200px, 1fr))'
                    : 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '8px',
                }}
              >
                {layerEngines.map(engine => (
                  <div
                    key={engine.name}
                    style={{
                      background: COLORS.background,
                      borderRadius: '8px',
                      padding: showDetails ? '12px' : '8px',
                      border: `1px solid ${LAYER_COLORS[layer]}33`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          color: COLORS.text,
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {engine.name}
                      </span>
                      <span
                        style={{
                          color: getStatusColor(engine.status),
                          fontSize: '10px',
                        }}
                      >
                        {getStatusIcon(engine.status)}
                      </span>
                    </div>

                    {showDetails && engine.metrics && (
                      <div
                        style={{
                          marginTop: '8px',
                          display: 'flex',
                          gap: '12px',
                        }}
                      >
                        <div style={{ fontSize: '10px', color: COLORS.muted }}>
                          <span style={{ color: COLORS.text }}>
                            {engine.metrics.avgUpdateTime.toFixed(1)}
                          </span>
                          ms
                        </div>
                        <div style={{ fontSize: '10px', color: COLORS.muted }}>
                          <span
                            style={{
                              color:
                                engine.metrics.errors > 0 ? COLORS.error : COLORS.text,
                            }}
                          >
                            {engine.metrics.errors}
                          </span>{' '}
                          err
                        </div>
                      </div>
                    )}

                    {/* Health bar */}
                    <div
                      style={{
                        marginTop: '6px',
                        height: '2px',
                        background: COLORS.secondary + '33',
                        borderRadius: '1px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${engine.health}%`,
                          background:
                            engine.health > 80
                              ? COLORS.success
                              : engine.health > 50
                                ? COLORS.warning
                                : COLORS.error,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// SYSTEM METRICS CARD
// ═══════════════════════════════════════════════════════════════════

const SystemMetricsCard = memo(function SystemMetricsCard({
  metrics,
  lastUpdate,
}: {
  metrics: SystemMetrics | null;
  lastUpdate: number;
}) {
  if (!metrics) {
    return (
      <div
        style={{
          background: COLORS.surface,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${COLORS.secondary}33`,
        }}
      >
        <div style={{ color: COLORS.muted, textAlign: 'center' }}>
          Loading system metrics...
        </div>
      </div>
    );
  }

  const memoryPercent = Math.round(
    (metrics.memory_used_mb / metrics.memory_total_mb) * 100
  );

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const timeSinceUpdate = Math.round((Date.now() - lastUpdate) / 1000);

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${COLORS.secondary}33`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            color: COLORS.primary,
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          System Metrics
        </h3>
        <span style={{ color: COLORS.muted, fontSize: '10px' }}>
          Updated {timeSinceUpdate}s ago
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
      >
        {/* CPU */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span style={{ color: COLORS.muted, fontSize: '12px' }}>CPU</span>
            <span
              style={{
                color:
                  metrics.cpu_usage_percent > 80
                    ? COLORS.error
                    : metrics.cpu_usage_percent > 50
                      ? COLORS.warning
                      : COLORS.text,
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {metrics.cpu_usage_percent.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              height: '4px',
              background: COLORS.secondary + '33',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${metrics.cpu_usage_percent}%`,
                background:
                  metrics.cpu_usage_percent > 80
                    ? COLORS.error
                    : metrics.cpu_usage_percent > 50
                      ? COLORS.warning
                      : COLORS.success,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Memory */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span style={{ color: COLORS.muted, fontSize: '12px' }}>Memory</span>
            <span
              style={{
                color:
                  memoryPercent > 90
                    ? COLORS.error
                    : memoryPercent > 70
                      ? COLORS.warning
                      : COLORS.text,
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {metrics.memory_used_mb.toFixed(0)} / {metrics.memory_total_mb.toFixed(0)}{' '}
              MB
            </span>
          </div>
          <div
            style={{
              height: '4px',
              background: COLORS.secondary + '33',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${memoryPercent}%`,
                background:
                  memoryPercent > 90
                    ? COLORS.error
                    : memoryPercent > 70
                      ? COLORS.warning
                      : COLORS.success,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Uptime */}
        <div
          style={{
            gridColumn: 'span 2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: `1px solid ${COLORS.secondary}33`,
          }}
        >
          <span style={{ color: COLORS.muted, fontSize: '12px' }}>Uptime</span>
          <span style={{ color: COLORS.text, fontSize: '12px', fontWeight: 500 }}>
            {formatUptime(metrics.uptime_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const SingularityDashboard = memo(function SingularityDashboard({
  refreshInterval = 5000,
  compact = false,
  showEngineDetails = true,
  showSingularityField = true,
}: DashboardProps) {
  const singularity = useSingularity();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [engines, setEngines] = useState<EngineMetric[]>([]);

  // Fetch system metrics
  const fetchSystemMetrics = useCallback(async () => {
    try {
      const result = await secureInvoke<SystemMetrics>('get_system_metrics');
      setSystemMetrics(result);
      setLastUpdate(Date.now());
    } catch {
      // Fallback mock data
      setSystemMetrics({
        cpu_usage_percent: Math.random() * 30 + 10,
        memory_used_mb: 800 + Math.random() * 200,
        memory_total_mb: 16384,
        uptime_seconds: Math.floor(Date.now() / 1000) % 86400,
      });
      setLastUpdate(Date.now());
    }
  }, []);

  // Generate engine data from singularity state
  useEffect(() => {
    const engineList: EngineMetric[] = [
      // Singularity Layer
      {
        name: 'SingularityEngine',
        layer: 'singularity',
        status: singularity.isInitialized ? 'active' : 'idle',
        health: Math.round(singularity.formStability * 100),
        lastUpdate: singularity.timestamp,
        metrics: {
          updateCount: 0,
          avgUpdateTime: 0,
          errors: 0,
        },
      },
      // Meta Layer
      {
        name: 'MetaEngine',
        layer: 'meta',
        status: 'active',
        health: Math.round((singularity.overmind?.selfUnderstanding || 0.8) * 100),
        lastUpdate: Date.now(),
      },
      {
        name: 'WholenessEngine',
        layer: 'meta',
        status: 'active',
        health: Math.round((singularity.convergence?.convergenceLevel || 0.7) * 100),
        lastUpdate: Date.now(),
      },
      // Adaptive Layer
      {
        name: 'EvolutionEngine',
        layer: 'adaptive',
        status: 'active',
        health: 85,
        lastUpdate: Date.now(),
      },
      {
        name: 'IntegrationEngine',
        layer: 'adaptive',
        status: 'active',
        health: 90,
        lastUpdate: Date.now(),
      },
      {
        name: 'MemoryEngine',
        layer: 'adaptive',
        status: 'active',
        health: 95,
        lastUpdate: Date.now(),
      },
      // Symbolic Layer
      {
        name: 'PersonaEngine',
        layer: 'symbolic',
        status: 'active',
        health: Math.round((singularity.unity?.persona?.presenceLevel || 0.7) * 100),
        lastUpdate: Date.now(),
      },
      {
        name: 'IdentityEngine',
        layer: 'symbolic',
        status: 'active',
        health: 88,
        lastUpdate: Date.now(),
      },
      {
        name: 'BehaviorEngine',
        layer: 'symbolic',
        status: 'active',
        health: 92,
        lastUpdate: Date.now(),
      },
      // Cognitive Layer
      {
        name: 'DeductionEngine',
        layer: 'cognitive',
        status: 'active',
        health: 94,
        lastUpdate: Date.now(),
      },
      {
        name: 'DecisionEngine',
        layer: 'cognitive',
        status: 'active',
        health: 91,
        lastUpdate: Date.now(),
      },
      {
        name: 'RealityEngine',
        layer: 'cognitive',
        status: 'idle',
        health: 85,
        lastUpdate: Date.now(),
      },
      // Physical Layer
      {
        name: 'SecurityEngine',
        layer: 'physical',
        status: 'active',
        health: 100,
        lastUpdate: Date.now(),
      },
      {
        name: 'PerformanceEngine',
        layer: 'physical',
        status: 'active',
        health: 95,
        lastUpdate: Date.now(),
      },
      {
        name: 'TTSEngine',
        layer: 'physical',
        status: 'idle',
        health: 90,
        lastUpdate: Date.now(),
      },
      {
        name: 'AudioEngine',
        layer: 'physical',
        status: 'idle',
        health: 88,
        lastUpdate: Date.now(),
      },
    ];

    setEngines(engineList);
  }, [singularity]);

  // Refresh interval
  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchSystemMetrics, refreshInterval]);

  return (
    <div
      style={{
        background: COLORS.background,
        minHeight: compact ? 'auto' : '100vh',
        padding: compact ? '16px' : '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              color: COLORS.text,
              fontSize: compact ? '18px' : '24px',
              fontWeight: 600,
              margin: 0,
            }}
          >
            TITANE∞ Singularity Dashboard
          </h1>
          <p
            style={{
              color: COLORS.muted,
              fontSize: '12px',
              margin: '4px 0 0',
            }}
          >
            Real-time monitoring • {engines.filter(e => e.status === 'active').length}{' '}
            engines active
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: singularity.isInitialized ? COLORS.success : COLORS.warning,
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ color: COLORS.muted, fontSize: '12px' }}>
            {singularity.isInitialized ? 'Online' : 'Initializing'}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Consciousness Indicator */}
        <ConsciousnessIndicator
          level={singularity.consciousness}
          autoCoherence={singularity.autoCoherence}
        />

        {/* System Metrics */}
        <SystemMetricsCard metrics={systemMetrics} lastUpdate={lastUpdate} />

        {/* Singularity Field */}
        {showSingularityField && <SingularityFieldVisualizer field={singularity.field} />}
      </div>

      {/* Engine Grid */}
      <div style={{ marginTop: '16px' }}>
        <EngineGrid engines={engines} showDetails={showEngineDetails} />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: `1px solid ${COLORS.secondary}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: COLORS.muted, fontSize: '10px' }}>
          TITANE∞ v∞ • Signature: {singularity.signature?.slice(0, 20)}...
        </span>
        <span style={{ color: COLORS.muted, fontSize: '10px' }}>
          Last sync: {new Date(singularity.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
});

export default SingularityDashboard;
