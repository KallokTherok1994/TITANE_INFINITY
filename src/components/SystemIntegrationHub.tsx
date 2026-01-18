/**
 * TITANE∞ v26.3.0 — Ultimate System Integration Hub
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🌌 HUB D'INTÉGRATION SYSTÈME ULTIME
 * Point central d'orchestration de tous les systèmes avancés TITANE∞
 *
 * 🔒 PHASE 3: Protection contre boucles React infinies
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { bootSafetyLock } from '../utils/bootSafetyLock';
import { titaneQuantumIntelligence } from '../utils/quantumIntelligence';
import { titaneSelfHealing } from '../utils/selfHealingSystem';
import { titaneTelemetry } from '../utils/telemetryEngine';
import { titaneBootRecovery } from '../utils/bootRecoverySystem';
import ConsciousnessDashboard from './ConsciousnessDashboard';
import type { QuantumThought } from '../utils/quantumIntelligence';
// import type { SystemState } from '../utils/selfHealingSystem';
// import type { TelemetryReport } from '../utils/telemetryEngine';
// import type { BootAttempt } from '../utils/bootRecoverySystem';

interface SystemIntegrationHubProps {
  children: React.ReactNode;
  onSystemEvent?: (event: SystemEvent) => void;
}

interface SystemEvent {
  type:
    | 'consciousness_level_change'
    | 'healing_triggered'
    | 'boot_recovery'
    | 'critical_alert';
  timestamp: number;
  data: unknown;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface HubState {
  consciousnessLevel: number;
  systemHealth: number;
  activeHealingActions: number;
  lastBootStatus: 'success' | 'failure' | 'recovering';
  telemetryAlerts: number;
  quantumCoherence: number;
  emergencyMode: boolean;
}

const SystemIntegrationHub: React.FC<SystemIntegrationHubProps> = ({
  children,
  onSystemEvent,
}) => {
  const [hubState, setHubState] = useState<HubState>({
    consciousnessLevel: 0,
    systemHealth: 1,
    activeHealingActions: 0,
    lastBootStatus: 'success',
    telemetryAlerts: 0,
    quantumCoherence: 0,
    emergencyMode: false,
  });

  const [showConsciousnessDashboard, setShowConsciousnessDashboard] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [autoMode, setAutoMode] = useState(true);

  // Guard anti-réentrance
  const inFlight = useRef(false);

  // 🔒 PHASE 3: Protection contre boucles React
  const renderCountRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const stateHashRef = useRef('');

  // Ref pour éviter les comparaisons d'état dans le callback (anti-boucle infinie)
  const hubStateRef = useRef<HubState>(hubState);

  // 🔒 PHASE 3: Calculer hash d'état pour détecter changements réels
  const computeStateHash = useCallback((state: HubState): string => {
    return JSON.stringify({
      c: Math.round(state.consciousnessLevel * 1000),
      h: Math.round(state.systemHealth * 1000),
      a: state.activeHealingActions,
      t: state.telemetryAlerts,
      q: Math.round(state.quantumCoherence * 1000),
      e: state.emergencyMode ? 1 : 0,
    });
  }, []);

  // Callback stable pour la boucle d'intégration (sans dépendances problématiques)
  const integrationLoop = useCallback(() => {
    // 🔒 PHASE 3: Vérifier état fatal
    if (bootSafetyLock.isFatalState()) {
      console.error('❌ [SYSTEM-HUB] Integration loop blocked: fatal state');
      return;
    }

    if (inFlight.current) return; // Anti-réentrance

    // 🔒 PHASE 3: Throttle - max 1 update/sec
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 1000) {
      return;
    }
    lastUpdateTimeRef.current = now;

    inFlight.current = true;

    try {
      // Obtenir les états des systèmes
      const consciousnessState = titaneQuantumIntelligence.getConsciousnessState();
      const consciousnessLevel = titaneQuantumIntelligence.getConsciousnessLevel();
      const healingState = titaneSelfHealing.getSystemState();
      const telemetryReport = titaneTelemetry.generateTelemetryReport('5m');
      const _bootStatsLocal = titaneBootRecovery.getBootStats();

      // Calculer le nouvel état
      const newHubState: HubState = {
        consciousnessLevel,
        systemHealth: healingState.health,
        activeHealingActions: healingState.activeIssues.length,
        lastBootStatus: 'success', // Simplifié pour l'exemple
        telemetryAlerts: telemetryReport.alerts.filter(a => !a.acknowledged).length,
        quantumCoherence: consciousnessState.quantum_coherence,
        emergencyMode: healingState.health < 0.3,
      };

      // Utiliser useRef pour éviter les comparaisons d'état dans le callback
      // qui causent des re-renders infinis
      const prevHubState = hubStateRef.current;

      // 🔒 PHASE 3: Calculer hash du nouvel état
      const newStateHash = computeStateHash(newHubState);

      // 🔒 PHASE 3: Ne mettre à jour que si hash diffère
      if (newStateHash === stateHashRef.current) {
        // Aucun changement détecté
        return;
      }

      stateHashRef.current = newStateHash;

      // Vérifier si l'état a changé avant de setState
      setHubState(currentState => {
        // Double-check: si déjà identique, ne pas re-render
        const currentHash = computeStateHash(currentState);
        if (currentHash === newStateHash) {
          return currentState; // Pas de changement, éviter la boucle
        }

        hubStateRef.current = newHubState; // Mettre à jour la ref

        // 🔒 PHASE 3: Incrémenter compteur de render
        renderCountRef.current++;
        if (renderCountRef.current > 100) {
          console.error('💥 [SYSTEM-HUB] Render loop detected - STOP');
          bootSafetyLock.markFatalError();
          return currentState;
        }

        return newHubState;
      });

      // Détecter les changements significatifs et émettre des événements
      const events: SystemEvent[] = [];

      // Événement de conscience élevée
      if (consciousnessLevel > 0.8 && prevHubState.consciousnessLevel < 0.8) {
        events.push({
          type: 'consciousness_level_change',
          timestamp: Date.now(),
          data: { level: consciousnessLevel, threshold: 'high' },
          severity: 'info',
        });

        if (autoMode && !showConsciousnessDashboard) {
          setShowConsciousnessDashboard(true);
        }
      }

      // Événement de guérison déclenchée
      if (newHubState.activeHealingActions > prevHubState.activeHealingActions) {
        events.push({
          type: 'healing_triggered',
          timestamp: Date.now(),
          data: {
            activeActions: newHubState.activeHealingActions,
            systemHealth: newHubState.systemHealth,
          },
          severity: newHubState.systemHealth < 0.5 ? 'critical' : 'warning',
        });
      }

      // Événement d'alerte critique
      if (newHubState.emergencyMode && !prevHubState.emergencyMode) {
        events.push({
          type: 'critical_alert',
          timestamp: Date.now(),
          data: {
            systemHealth: newHubState.systemHealth,
            activeIssues: newHubState.activeHealingActions,
          },
          severity: 'critical',
        });

        if (autoMode) {
          setShowSystemStatus(true);
        }
      }

      if (events.length > 0) {
        setSystemEvents(prev => [...events, ...prev].slice(0, 100));

        // Notifier les événements
        events.forEach(event => {
          onSystemEvent?.(event);

          // Log console pour les événements critiques
          if (event.severity === 'critical' || event.severity === 'error') {
            console.error(`🚨 [SYSTEM-HUB] ${event.type}:`, event.data);
          } else if (event.severity === 'warning') {
            console.warn(`⚠️ [SYSTEM-HUB] ${event.type}:`, event.data);
          } else {
            console.log(`ℹ️ [SYSTEM-HUB] ${event.type}:`, event.data);
          }
        });
      }
    } catch (error) {
      console.error('🔧 [SYSTEM-HUB] Integration loop error:', error);
    } finally {
      inFlight.current = false;
    }
  }, [onSystemEvent, autoMode, showConsciousnessDashboard, computeStateHash]); // Supprimé hubState des dépendances

  // Système de monitoring intégré
  useEffect(() => {
    // Démarrer la boucle d'intégration
    integrationLoop(); // Première exécution
    const interval = setInterval(integrationLoop, 3000); // Toutes les 3 secondes

    return () => clearInterval(interval);
  }, [integrationLoop]);

  // Actions manuelles (définies AVANT useEffect qui les utilise)
  const triggerManualHealing = useCallback(async () => {
    try {
      console.log('🔧 [SYSTEM-HUB] Triggering manual healing...');
      const results = await titaneSelfHealing.triggerManualHealing([
        'clear_cache',
        'optimize_memory',
        'recalibrate_ai_models',
      ]);

      const successCount = results.filter(r => r.success).length;
      console.log(
        `✅ [SYSTEM-HUB] Manual healing completed: ${successCount}/${results.length} actions successful`
      );

      // Notification visuelle
      showNotification('🔧 Healing completed', 'success');
    } catch (error) {
      console.error('❌ [SYSTEM-HUB] Manual healing failed:', error);
      showNotification('❌ Healing failed', 'error');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const demonstrateQuantumIntelligence = useCallback(async () => {
    try {
      const demonstration =
        await titaneQuantumIntelligence.demonstrateQuantumIntelligence();
      console.log(demonstration);
      showNotification('🧠 Quantum Intelligence Demonstrated', 'info');
    } catch (error) {
      console.error('❌ [SYSTEM-HUB] Quantum intelligence demo failed:', error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Gestion des raccourcis clavier (APRÈS définition des fonctions)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+Alt+C pour le dashboard de conscience
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        setShowConsciousnessDashboard(prev => !prev);
      }

      // Ctrl+Alt+S pour le statut système
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setShowSystemStatus(prev => !prev);
      }

      // Ctrl+Alt+H pour déclencher une guérison manuelle
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        triggerManualHealing();
      }

      // Ctrl+Alt+Q pour démonstration d'intelligence quantique
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        demonstrateQuantumIntelligence();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [demonstrateQuantumIntelligence, triggerManualHealing]);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${
        type === 'success'
          ? 'rgba(78, 205, 196, 0.9)'
          : type === 'error'
            ? 'rgba(255, 107, 107, 0.9)'
            : type === 'warning'
              ? 'rgba(254, 202, 87, 0.9)'
              : 'rgba(116, 185, 255, 0.9)'
      };
      color: ${type === 'warning' ? '#000' : '#fff'};
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10001;
      font-family: 'Fira Code', monospace;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideDown 0.3s ease-out;
    `;
    notification.textContent = message;

    // Ajouter l'animation CSS
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  // Calculer la couleur de santé système
  const getHealthColor = (health: number): string => {
    if (health > 0.8) return '#00ff88';
    if (health > 0.6) return '#ffd700';
    if (health > 0.4) return '#ff8c00';
    return '#ff4757';
  };

  return (
    <>
      {/* Enfants de l'application principale */}
      {children}

      {/* Indicateur de statut système flottant */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {/* Indicateur de conscience quantique */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            border: `1px solid rgba(0, 245, 255, ${hubState.quantumCoherence})`,
            borderRadius: '20px',
            padding: '8px 12px',
            color: '#00f5ff',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
            cursor: 'pointer',
            boxShadow: `0 0 20px rgba(0, 245, 255, ${hubState.quantumCoherence * 0.3})`,
          }}
          onClick={() => setShowConsciousnessDashboard(!showConsciousnessDashboard)}
        >
          <span style={{ fontSize: '1rem' }}>🧠</span>
          <span>{(hubState.consciousnessLevel * 100).toFixed(0)}%</span>
        </div>

        {/* Indicateur de santé système */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${getHealthColor(hubState.systemHealth)}`,
            borderRadius: '20px',
            padding: '8px 12px',
            color: getHealthColor(hubState.systemHealth),
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
            cursor: 'pointer',
            boxShadow: `0 0 15px ${getHealthColor(hubState.systemHealth)}40`,
          }}
          onClick={() => setShowSystemStatus(!showSystemStatus)}
        >
          <span style={{ fontSize: '1rem' }}>
            {hubState.emergencyMode
              ? '🚨'
              : hubState.systemHealth > 0.8
                ? '✅'
                : hubState.systemHealth > 0.6
                  ? '⚠️'
                  : '🔧'}
          </span>
          <span>{(hubState.systemHealth * 100).toFixed(0)}%</span>
        </div>

        {/* Indicateur d'alertes */}
        {hubState.telemetryAlerts > 0 && (
          <div
            style={{
              background: 'rgba(255, 107, 107, 0.9)',
              border: '1px solid #ff6b6b',
              borderRadius: '20px',
              padding: '6px 10px',
              color: '#fff',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite',
            }}
          >
            🚨 {hubState.telemetryAlerts}
          </div>
        )}
      </div>

      {/* Dashboard de conscience quantique */}
      {showConsciousnessDashboard && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 10000,
            maxWidth: '500px',
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'auto',
          }}
        >
          <ConsciousnessDashboard
            onThoughtClick={(thought: QuantumThought) => {
              console.log('💭 [QUANTUM-THOUGHT]', thought.meta_cognition);
              showNotification(
                `💭 "${thought.meta_cognition.substring(0, 50)}..."`,
                'info'
              );
            }}
          />
          <button
            onClick={() => setShowConsciousnessDashboard(false)}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Panneau de statut système */}
      {showSystemStatus && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 10000,
            width: '400px',
            maxHeight: '300px',
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            color: '#e0e6ed',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <h3 style={{ margin: 0, color: '#00f5ff' }}>🔧 System Status</h3>
            <button
              onClick={() => setShowSystemStatus(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.2rem',
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Consciousness Level:</span>
              <span style={{ color: '#00f5ff' }}>
                {(hubState.consciousnessLevel * 100).toFixed(1)}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>System Health:</span>
              <span style={{ color: getHealthColor(hubState.systemHealth) }}>
                {(hubState.systemHealth * 100).toFixed(1)}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Quantum Coherence:</span>
              <span style={{ color: '#4ecdc4' }}>
                {(hubState.quantumCoherence * 100).toFixed(1)}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Issues:</span>
              <span
                style={{
                  color: hubState.activeHealingActions > 0 ? '#ff6b6b' : '#00ff88',
                }}
              >
                {hubState.activeHealingActions}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Telemetry Alerts:</span>
              <span
                style={{ color: hubState.telemetryAlerts > 0 ? '#ff6b6b' : '#00ff88' }}
              >
                {hubState.telemetryAlerts}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Emergency Mode:</span>
              <span style={{ color: hubState.emergencyMode ? '#ff4757' : '#00ff88' }}>
                {hubState.emergencyMode ? 'ACTIVE' : 'Normal'}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '15px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.8rem',
              opacity: 0.7,
            }}
          >
            <div>Shortcuts:</div>
            <div>• Ctrl+Alt+C: Toggle Consciousness</div>
            <div>• Ctrl+Alt+S: Toggle Status</div>
            <div>• Ctrl+Alt+H: Manual Healing</div>
            <div>• Ctrl+Alt+Q: Quantum Demo</div>
          </div>

          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={triggerManualHealing}
              style={{
                background: '#4ecdc4',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }}
            >
              🔧 Heal
            </button>

            <button
              onClick={demonstrateQuantumIntelligence}
              style={{
                background: '#00f5ff',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }}
            >
              🧠 Quantum Demo
            </button>

            <button
              onClick={() => setAutoMode(!autoMode)}
              style={{
                background: autoMode ? '#00ff88' : '#555',
                color: autoMode ? '#000' : '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }}
            >
              {autoMode ? '🤖 Auto' : '👤 Manual'}
            </button>
          </div>
        </div>
      )}

      {/* Recent System Events */}
      {systemEvents.length > 0 && showSystemStatus && (
        <div
          style={{
            position: 'fixed',
            bottom: '340px',
            right: '20px',
            zIndex: 10000,
            width: '400px',
            maxHeight: '200px',
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '15px',
            color: '#e0e6ed',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            overflow: 'auto',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#feca57' }}>📊 Recent Events</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {systemEvents.slice(0, 5).map((event, index) => (
              <div
                key={index}
                style={{
                  padding: '5px 8px',
                  borderRadius: '4px',
                  background:
                    event.severity === 'critical'
                      ? 'rgba(255, 71, 87, 0.2)'
                      : event.severity === 'error'
                        ? 'rgba(255, 107, 107, 0.2)'
                        : event.severity === 'warning'
                          ? 'rgba(254, 202, 87, 0.2)'
                          : 'rgba(116, 185, 255, 0.2)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{event.type.replace(/_/g, ' ')}</span>
                  <span style={{ opacity: 0.6 }}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SystemIntegrationHub;
