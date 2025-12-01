/** * TITANE∞ vΩ — DevOps Dashboard * Dashboard de développement intégré */ import {
  useEffect,
  useState,
  useCallback,
} from 'react';
import { invoke } from '@tauri-apps/api/core';
import './DevOpsDashboard.css';
interface DevOpsStats {
  cpu: string;
  memory: string;
  processes: number;
  uptime: string;
}
interface BuildStatus {
  running: boolean;
  success: boolean;
  error: string | null;
  duration: number;
}
export default function DevOpsDashboard() {
  const [stats, setStats] = useState<DevOpsStats>({
    cpu: '0%',
    memory: '0 MB',
    processes: 0,
    uptime: '0s',
  });
  const [logs, setLogs] = useState<string>('TITANE DevOps Dashboard\n\n');
  const [busy, setBusy] = useState(false);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    running: false,
    success: false,
    error: null,
    duration: 0,
  });
  const appendLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => `${prev}[${timestamp}] ${message}\n`);
  }, []);
  const runCommand = useCallback(
    async (cmd: string, label: string) => {
      setBusy(true);
      setBuildStatus({ running: true, success: false, error: null, duration: 0 });
      appendLog(`Execution: ${label}...`);
      const startTime = Date.now();
      try {
        const result = await invoke<string>('devops_run', { cmd });
        const duration = Date.now() - startTime;
        appendLog(`Success: ${label} (${duration}ms)`);
        appendLog(result);
        setBuildStatus({ running: false, success: true, error: null, duration });
      } catch (err) {
        const duration = Date.now() - startTime;
        const errorMsg = err instanceof Error ? err.message : String(err);
        appendLog(`Error: ${label} (${duration}ms)`);
        appendLog(`Error: ${errorMsg}`);
        setBuildStatus({ running: false, success: false, error: errorMsg, duration });
      } finally {
        setBusy(false);
      }
    },
    [appendLog]
  );
  const updateStats = useCallback(async () => {
    try {
      const data = await invoke<DevOpsStats>('devops_stats');
      setStats(data);
    } catch (err) {
      console.error('[DevOpsDashboard] Failed to fetch stats:', err);
    }
  }, []);
  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 1500);
    return () => clearInterval(interval);
  }, [updateStats]);
  const handleVerify = () => runCommand('npm run verify', 'Verify');
  const handleBuildFrontend = () => runCommand('npm run build', 'Build Frontend');
  const handleBuildTauri = () => runCommand('npm run tauri:build', 'Build Tauri');
  const handleClean = () => runCommand('rm -rf node_modules dist', 'Clean');
  const handleDeploy = () => runCommand('bash scripts/autobuild_full.sh', 'Deploy');
  const handleClearLogs = () => setLogs('TITANE DevOps Dashboard\n\n');
  return (
    <div className="devops-dashboard">
      {' '}
      <div className="devops-header">
        {' '}
        <h1>TITANE DevOps Dashboard</h1>{' '}
        <div className="header-status">
          {' '}
          {buildStatus.running && <span className="status-running">En cours...</span>}{' '}
          {!buildStatus.running && buildStatus.success && (
            <span className="status-success">Succès</span>
          )}{' '}
          {!buildStatus.running && buildStatus.error && (
            <span className="status-error">Erreur</span>
          )}{' '}
        </div>{' '}
      </div>{' '}
      <div className="devops-stats">
        {' '}
        <div className="stat-card">
          {' '}
          <div className="stat-label">CPU</div>{' '}
          <div className="stat-value">{stats.cpu}</div>{' '}
        </div>{' '}
        <div className="stat-card">
          {' '}
          <div className="stat-label">Mémoire</div>{' '}
          <div className="stat-value">{stats.memory}</div>{' '}
        </div>{' '}
        <div className="stat-card">
          {' '}
          <div className="stat-label">Processus</div>{' '}
          <div className="stat-value">{stats.processes}</div>{' '}
        </div>{' '}
        <div className="stat-card">
          {' '}
          <div className="stat-label">Disponibilité</div>{' '}
          <div className="stat-value">{stats.uptime}</div>{' '}
        </div>{' '}
      </div>{' '}
      <div className="devops-actions">
        {' '}
        <button disabled={busy} onClick={handleVerify} className="action-btn">
          {' '}
          Vérifier{' '}
        </button>{' '}
        <button disabled={busy} onClick={handleBuildFrontend} className="action-btn">
          {' '}
          Compiler Frontend{' '}
        </button>{' '}
        <button disabled={busy} onClick={handleBuildTauri} className="action-btn">
          {' '}
          Compiler Tauri{' '}
        </button>{' '}
        <button disabled={busy} onClick={handleClean} className="action-btn">
          {' '}
          Nettoyer{' '}
        </button>{' '}
        <button disabled={busy} onClick={handleDeploy} className="action-btn">
          {' '}
          Déployer{' '}
        </button>{' '}
      </div>{' '}
      <div className="devops-logs-container">
        {' '}
        <div className="logs-header">
          {' '}
          <h2>Logs de compilation</h2>{' '}
          <button onClick={handleClearLogs} className="clear-logs-btn">
            Effacer
          </button>{' '}
        </div>{' '}
        <textarea className="devops-logs" value={logs} readOnly spellCheck={false} />{' '}
      </div>{' '}
    </div>
  );
}
