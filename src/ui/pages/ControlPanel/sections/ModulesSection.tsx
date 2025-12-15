/**
 * TITANE∞ OS v24.7 - Section Modules
 * Activation/désactivation des engines
 * Optimisé avec ControlPanelToggle
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import { ControlPanelToggle } from '../components/ControlPanelToggle';

interface ModuleStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export const ModulesSection: React.FC = () => {
  const [modules, setModules] = useState<ModuleStatus[]>([]);

  const loadModules = useCallback(async () => {
    try {
      const modulesList = await secureInvoke<ModuleStatus[]>('get_modules_status');
      setModules(modulesList);
    } catch (error) {
      console.error('Erreur chargement modules:', error);
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const toggleModule = useCallback(
    async (moduleId: string) => {
      try {
        await secureInvoke('cp_toggle_module', { module_id: moduleId });
        await loadModules();
      } catch (error) {
        console.error('Erreur toggle module:', error);
      }
    },
    [loadModules]
  );

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
            <ControlPanelToggle
              key={module.id}
              checked={module.enabled}
              onChange={() => toggleModule(module.id)}
              title={module.name}
              description={module.description}
              icon={module.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
