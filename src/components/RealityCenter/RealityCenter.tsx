/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — REALITY CENTER (OPUS #19)
 * Interface de contrôle du Reality Rendering Layer
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './RealityCenter.css';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface RenderConfig {
  mode: string;
  resolution_x: number;
  resolution_y: number;
  fov: number;
  near_clip: number;
  far_clip: number;
  antialiasing: boolean;
  shadows: boolean;
  reflections: boolean;
  ambient_occlusion: boolean;
  bloom: boolean;
  target_fps: number;
}

interface RealityRendererState {
  active: boolean;
  scene_count: number;
  active_scene_id: string | null;
  entity_count: number;
  light_count: number;
  fps: number;
  frame_time_ms: number;
  render_config: RenderConfig;
  physics_enabled: boolean;
  spatial_enabled: boolean;
}

interface FrameStats {
  frame_number: number;
  frame_time_ms: number;
  fps: number;
  draw_calls: number;
  triangles: number;
  entities_rendered: number;
}

interface CreateEntityParams {
  name: string;
  entity_type: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  tags?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const StatsCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}> = ({ label, value, unit, color = 'var(--quantum-primary)' }) => (
  <div className="reality-stats-card">
    <div className="stats-label">{label}</div>
    <div className="stats-value" style={{ color }}>
      {value}
      {unit && <span className="stats-unit">{unit}</span>}
    </div>
  </div>
);

const ToggleSwitch: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="reality-toggle">
    <span className="toggle-label">{label}</span>
    <div className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider" />
    </div>
  </label>
);

const RenderModeSelector: React.FC<{
  mode: string;
  onChange: (mode: string) => void;
}> = ({ mode, onChange }) => {
  const modes = [
    { id: 'wireframe', label: '🔲 Wireframe', desc: 'Fil de fer' },
    { id: 'solid', label: '🟦 Solid', desc: 'Couleurs unies' },
    { id: 'textured', label: '🎨 Textured', desc: 'Textures' },
    { id: 'pbr', label: '✨ PBR', desc: 'Physiquement réaliste' },
    { id: 'raytraced', label: '💎 Ray Traced', desc: 'Raytracing temps réel' },
    { id: 'pathtraced', label: '🌟 Path Traced', desc: 'Rendu photoréaliste' },
  ];

  return (
    <div className="render-mode-selector">
      <h4>Mode de Rendu</h4>
      <div className="mode-grid">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`mode-button ${mode === m.id ? 'active' : ''}`}
            onClick={() => onChange(m.id)}
            title={m.desc}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const EntityCreator: React.FC<{
  onCreateEntity: (params: CreateEntityParams) => Promise<void>;
}> = ({ onCreateEntity }) => {
  const [name, setName] = useState('New Entity');
  const [entityType, setEntityType] = useState('object');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await onCreateEntity({
        name,
        entity_type: entityType,
        position: [0, 0, 0],
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="entity-creator">
      <h4>Créer une Entité</h4>
      <div className="creator-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'entité"
        />
        <select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
          <option value="object">🔷 Object</option>
          <option value="light">💡 Light</option>
          <option value="camera">📷 Camera</option>
          <option value="particle">✨ Particle</option>
          <option value="volume">📦 Volume</option>
          <option value="audio">🔊 Audio</option>
          <option value="trigger">⚡ Trigger</option>
        </select>
        <button onClick={handleCreate} disabled={creating}>
          {creating ? '⏳ Création...' : '➕ Créer'}
        </button>
      </div>
    </div>
  );
};

const SceneView: React.FC<{
  state: RealityRendererState;
}> = ({ state }) => {
  return (
    <div className="scene-view">
      <div className="scene-viewport">
        <div className="viewport-placeholder">
          <span className="viewport-icon">🎬</span>
          <span className="viewport-text">Reality Viewport</span>
          <span className="viewport-stats">
            {state.fps.toFixed(1)} FPS | {state.frame_time_ms.toFixed(2)}ms
          </span>
        </div>
        <div className="viewport-overlay">
          <div className="overlay-corner top-left">
            Mode: {state.render_config.mode}
          </div>
          <div className="overlay-corner top-right">
            {state.render_config.resolution_x}x{state.render_config.resolution_y}
          </div>
          <div className="overlay-corner bottom-left">
            Entities: {state.entity_count} | Lights: {state.light_count}
          </div>
          <div className="overlay-corner bottom-right">
            Physics: {state.physics_enabled ? '✅' : '❌'}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const RealityCenter: React.FC = () => {
  const [state, setState] = useState<RealityRendererState | null>(null);
  const [frameStats, setFrameStats] = useState<FrameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRender, setAutoRender] = useState(false);
  const [activeTab, setActiveTab] = useState<'scene' | 'settings' | 'physics'>('scene');

  const loadState = useCallback(async () => {
    try {
      const currentState = await invoke<RealityRendererState>('reality_get_state').catch(
        async () => invoke<RealityRendererState>('reality_init')
      );
      setState(currentState);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (!autoRender) return;

    const interval = setInterval(async () => {
      try {
        const stats = await invoke<FrameStats>('reality_render_frame');
        setFrameStats(stats);
        await loadState();
      } catch (err) {
        console.error('Render frame error:', err);
      }
    }, 1000 / 30); // 30 FPS refresh

    return () => clearInterval(interval);
  }, [autoRender, loadState]);

  const handleRenderModeChange = async (mode: string) => {
    try {
      await invoke('reality_set_render_config', { mode });
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleTogglePhysics = async (enabled: boolean) => {
    try {
      await invoke('reality_toggle_physics', { enabled });
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreateEntity = async (params: CreateEntityParams) => {
    try {
      await invoke('reality_add_entity', { params });
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRenderFrame = async () => {
    try {
      const stats = await invoke<FrameStats>('reality_render_frame');
      setFrameStats(stats);
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return (
      <div className="reality-center loading">
        <div className="loading-spinner">🎬</div>
        <p>Initialisation du Reality Renderer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reality-center error">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button onClick={loadState}>🔄 Réessayer</button>
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="reality-center">
      {/* Header */}
      <header className="reality-header">
        <div className="header-title">
          <span className="header-icon">🌌</span>
          <h2>Reality Rendering Layer</h2>
          <span className={`status-badge ${state.active ? 'active' : 'inactive'}`}>
            {state.active ? '● Active' : '○ Inactive'}
          </span>
        </div>
        <div className="header-actions">
          <ToggleSwitch
            label="Auto-Render"
            checked={autoRender}
            onChange={setAutoRender}
          />
          <button className="render-button" onClick={handleRenderFrame}>
            🎬 Render Frame
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="reality-stats-bar">
        <StatsCard
          label="FPS"
          value={state.fps.toFixed(1)}
          color={state.fps >= 60 ? '#00ff88' : state.fps >= 30 ? '#ffaa00' : '#ff4444'}
        />
        <StatsCard label="Frame Time" value={state.frame_time_ms.toFixed(2)} unit="ms" />
        <StatsCard label="Scenes" value={state.scene_count} />
        <StatsCard label="Entities" value={state.entity_count} />
        <StatsCard label="Lights" value={state.light_count} />
        {frameStats && (
          <>
            <StatsCard label="Frame #" value={frameStats.frame_number} />
            <StatsCard label="Draw Calls" value={frameStats.draw_calls} />
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <nav className="reality-tabs">
        <button
          className={activeTab === 'scene' ? 'active' : ''}
          onClick={() => setActiveTab('scene')}
        >
          🎬 Scene
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
        <button
          className={activeTab === 'physics' ? 'active' : ''}
          onClick={() => setActiveTab('physics')}
        >
          🎯 Physics
        </button>
      </nav>

      {/* Tab Content */}
      <main className="reality-content">
        {activeTab === 'scene' && (
          <div className="tab-scene">
            <SceneView state={state} />
            <EntityCreator onCreateEntity={handleCreateEntity} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-settings">
            <RenderModeSelector
              mode={state.render_config.mode.toLowerCase()}
              onChange={handleRenderModeChange}
            />

            <div className="settings-section">
              <h4>Qualité Graphique</h4>
              <div className="settings-grid">
                <ToggleSwitch
                  label="Antialiasing"
                  checked={state.render_config.antialiasing}
                  onChange={(v) =>
                    invoke('reality_set_render_config', { antialiasing: v }).then(loadState)
                  }
                />
                <ToggleSwitch
                  label="Shadows"
                  checked={state.render_config.shadows}
                  onChange={(v) =>
                    invoke('reality_set_render_config', { shadows: v }).then(loadState)
                  }
                />
                <ToggleSwitch
                  label="Reflections"
                  checked={state.render_config.reflections}
                  onChange={() => {}}
                />
                <ToggleSwitch
                  label="Ambient Occlusion"
                  checked={state.render_config.ambient_occlusion}
                  onChange={() => {}}
                />
                <ToggleSwitch
                  label="Bloom"
                  checked={state.render_config.bloom}
                  onChange={() => {}}
                />
              </div>
            </div>

            <div className="settings-section">
              <h4>Résolution</h4>
              <div className="resolution-info">
                <span>
                  {state.render_config.resolution_x} × {state.render_config.resolution_y}
                </span>
                <span className="aspect-ratio">
                  ({(state.render_config.resolution_x / state.render_config.resolution_y).toFixed(2)}:1)
                </span>
              </div>
            </div>

            <div className="settings-section">
              <h4>Camera</h4>
              <div className="camera-info">
                <p>FOV: {state.render_config.fov}°</p>
                <p>
                  Clipping: {state.render_config.near_clip} - {state.render_config.far_clip}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'physics' && (
          <div className="tab-physics">
            <div className="physics-control">
              <h4>Simulation Physique</h4>
              <ToggleSwitch
                label="Physics Enabled"
                checked={state.physics_enabled}
                onChange={handleTogglePhysics}
              />
            </div>

            <div className="physics-status">
              <div className="status-item">
                <span className="status-label">Spatial System:</span>
                <span className={`status-value ${state.spatial_enabled ? 'enabled' : 'disabled'}`}>
                  {state.spatial_enabled ? '✅ Active' : '❌ Disabled'}
                </span>
              </div>
            </div>

            <div className="physics-info">
              <h4>Capacités</h4>
              <ul>
                <li>🎯 Rigid Body Dynamics</li>
                <li>💥 Collision Detection</li>
                <li>🌍 Gravity Simulation</li>
                <li>📐 Spatial Partitioning</li>
                <li>🔍 Raycasting</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="reality-footer">
        <span className="footer-info">
          Reality Rendering Layer v∞ | Scene: {state.active_scene_id || 'None'}
        </span>
        <span className="footer-target">
          Target: {state.render_config.target_fps} FPS
        </span>
      </footer>
    </div>
  );
};

export default RealityCenter;
