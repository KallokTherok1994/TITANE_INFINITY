/**
 * TITANE∞ OS - Section Modules
 * Activation/désactivation des engines
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';

interface ModuleStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export const ModulesSection: React.FC = () => {
  const [modules, setModules] = useState<ModuleStatus[]>([]);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const modulesList = await secureInvoke<ModuleStatus[]>('get_modules_status');
      setModules(modulesList);
    } catch (error) {
      console.error('Erreur chargement modules:', error);
    }
  };

  const toggleModule = async (moduleId: string) => {
    try {
      await secureInvoke('cp_toggle_module', { module_id: moduleId });
      await loadModules();
    } catch (error) {
      console.error('Erreur toggle module:', error);
    }
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Modules</h2>
        <button className="cp-button secondary" onClick={loadModules}>
          🔄 Actualiser
        </button>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Engines disponibles</h3>
        <div className="cp-card-content">
          {modules.map(module => (
            <div key={module.id} className="cp-switch-row">
              <div className="cp-switch-label">
                <div className="cp-switch-title">
                  <span style={{ marginRight: '8px' }}>{module.icon}</span>
                  {module.name}
                </div>
                <div className="cp-switch-description">{module.description}</div>
              </div>
              <div
                className={`cp-switch ${module.enabled ? 'active' : ''}`}
                onClick={() => toggleModule(module.id)}
              >
                <div className="cp-switch-thumb" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
