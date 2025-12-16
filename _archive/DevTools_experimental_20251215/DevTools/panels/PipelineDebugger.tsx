/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — Pipeline Debugger Panel                         ║
 * ║   Visualize OMEGA pipeline execution in real-time                  ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { usePipelineEvents } from '../hooks/usePipelineEvents';
import { Badge } from '../components/Badge';
import './PipelineDebugger.css';

export const PipelineDebugger: React.FC = () => {
  const {
    current_step,
    completed_steps,
    pipeline_completed,
    pipeline_duration_ms,
    error,
    resetPipeline,
  } = usePipelineEvents();

  return (
    <div className="pipeline-debugger">
      <div className="panel-header">
        <h2 className="panel-title">🔀 OMEGA Pipeline Debugger</h2>
        <div className="panel-actions">
          <button className="btn btn-secondary" onClick={resetPipeline}>
            Reset
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="card">
        <h3>Current Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Pipeline Status:</span>
            <Badge variant={pipeline_completed ? 'success' : 'info'}>
              {pipeline_completed ? 'Completed' : 'Running'}
            </Badge>
          </div>
          <div className="status-item">
            <span className="status-label">Total Duration:</span>
            <span className="status-value">{pipeline_duration_ms}ms</span>
          </div>
          <div className="status-item">
            <span className="status-label">Steps Completed:</span>
            <span className="status-value">{completed_steps.length}</span>
          </div>
          {error && (
            <div className="status-item">
              <span className="status-label">Error:</span>
              <Badge variant="error">{error}</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Current Step */}
      {current_step && (
        <div className="card">
          <h3>🔄 Current Step</h3>
          <div className="step-details">
            <div className="step-header">
              <span className="step-name">{current_step.step_name}</span>
              <Badge variant="info">Running</Badge>
            </div>
            <div className="step-meta">
              <span>
                Engine: <strong>{current_step.engine_id}</strong>
              </span>
              <span>
                Started: {new Date(current_step.started_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Completed Steps */}
      <div className="card">
        <h3>✅ Completed Steps</h3>
        {completed_steps.length === 0 ? (
          <p className="empty-message">No steps completed yet</p>
        ) : (
          <div className="steps-list">
            {completed_steps.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{step.step_id}</div>
                <div className="step-content">
                  <div className="step-header">
                    <span className="step-name">{step.step_name}</span>
                    <Badge variant={step.status === 'completed' ? 'success' : 'error'}>
                      {step.status}
                    </Badge>
                  </div>
                  <div className="step-meta">
                    <span>Engine: {step.engine_id}</span>
                    <span>Duration: {step.duration_ms || 0}ms</span>
                  </div>
                  {step.error && <div className="step-error">❌ {step.error}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
