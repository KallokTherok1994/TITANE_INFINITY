// TITANE∞ v12 - Dashboard Page
import { useEffect, useState } from 'react';
import { Panel, Card, Badge } from '../ui/components';
import { useTitaneCore } from '../hooks';
import './Dashboard.css';

export const Dashboard = () => {
  const { systemStatus, loading, error } = useTitaneCore();
  const [uptime, setUptime] = useState('0s');

  useEffect(() => {
    if (systemStatus?.uptime) {
      const hours = Math.floor(systemStatus.uptime / 3600);
      const minutes = Math.floor((systemStatus.uptime % 3600) / 60);
      const seconds = systemStatus.uptime % 60;
      setUptime(`${hours}h ${minutes}m ${seconds}s`);
    }
  }, [systemStatus]);

  const modulesList = systemStatus?.modules || [];

  if (loading && !systemStatus) {
    return <div className="dashboard__loading">Chargement du système...</div>;
  }

  if (error) {
    return <div className="dashboard__error">Erreur: {error}</div>;
  }

  return (
    <div className="dashboard">
      <Panel title="Vue d'ensemble du système" elevated>
        <div className="dashboard__grid">
          <Card title="Statut Système" hoverable>
            <div className="dashboard__stat">
              <Badge variant={systemStatus?.status === 'operational' ? 'success' : 'warning'}>
                {systemStatus?.status || 'Unknown'}
              </Badge>
              <p className="dashboard__stat-label">Uptime: {uptime}</p>
            </div>
          </Card>

          <Card title="Modules actifs" hoverable>
            <div className="dashboard__stat">
              <span className="dashboard__stat-value">
                {modulesList.filter(m => m.status).length}/{modulesList.length}
              </span>
              <p className="dashboard__stat-label">Modules opérationnels</p>
            </div>
          </Card>
        </div>
      </Panel>

      <Panel title="Modules TITANE∞" elevated className="dashboard__modules">
        <div className="dashboard__modules-grid">
          {modulesList.map((module) => (
            <Card
              key={module.name}
              title={module.name}
              hoverable
              className="dashboard__module-card"
            >
              <Badge variant={module.status ? 'success' : 'danger'}>
                {module.status ? 'Actif' : 'Inactif'}
              </Badge>
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  );
};
