/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ThinkingPanel - Panneau de réflexion OMEGA en temps réel
 * Affiche les étapes de réflexion pendant la génération
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Loader2, Check } from 'lucide-react';
import './ThinkingPanel.css';

interface ThinkingStep {
  id: string;
  type: 'analysis' | 'reasoning' | 'synthesis' | 'validation';
  content: string;
  status: 'pending' | 'active' | 'complete';
  timestamp: number;
}

interface ThinkingPanelProps {
  isThinking: boolean;
  steps?: ThinkingStep[];
  onClose?: () => void;
}

export const ThinkingPanel: React.FC<ThinkingPanelProps> = ({
  isThinking,
  steps = [],
  onClose,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // v26.2 - Auto-expand active steps for visibility
  useEffect(() => {
    const activeStep = steps.find(s => s.status === 'active');
    if (activeStep) {
      setExpandedSteps(prev => new Set([...prev, activeStep.id]));
    }
  }, [steps]);

  const toggleStep = (id: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStepIcon = (type: ThinkingStep['type'], status: ThinkingStep['status']) => {
    if (status === 'complete') {
      return <Check className="thinking-step-icon complete" size={16} />;
    }
    if (status === 'active') {
      return <Loader2 className="thinking-step-icon active spin" size={16} />;
    }

    switch (type) {
      case 'analysis':
        return <Brain className="thinking-step-icon" size={16} />;
      case 'reasoning':
        return <Sparkles className="thinking-step-icon" size={16} />;
      case 'synthesis':
        return <Sparkles className="thinking-step-icon" size={16} />;
      case 'validation':
        return <Check className="thinking-step-icon" size={16} />;
      default:
        return <Brain className="thinking-step-icon" size={16} />;
    }
  };

  const getStepLabel = (type: ThinkingStep['type']) => {
    switch (type) {
      case 'analysis':
        return 'Analyse';
      case 'reasoning':
        return 'Raisonnement';
      case 'synthesis':
        return 'Synthèse';
      case 'validation':
        return 'Validation';
      default:
        return 'Réflexion';
    }
  };

  if (!isThinking && steps.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="thinking-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="thinking-header">
          <div className="thinking-header-content">
            <Brain className="thinking-header-icon" size={20} />
            <h3 className="thinking-title">
              Réflexion OMEGA
              {isThinking && (
                <span className="thinking-status">
                  <Loader2 className="spin" size={14} />
                  En cours...
                </span>
              )}
            </h3>
          </div>
          {onClose && (
            <button className="thinking-close" onClick={onClose} aria-label="Fermer">
              ×
            </button>
          )}
        </div>

        {/* Steps */}
        <div className="thinking-steps">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`thinking-step ${step.status}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleStep(step.id)}
            >
              <div className="thinking-step-header">
                {getStepIcon(step.type, step.status)}
                <span className="thinking-step-label">{getStepLabel(step.type)}</span>
                <span className="thinking-step-chevron">
                  {expandedSteps.has(step.id) ? '▼' : '▶'}
                </span>
              </div>

              <AnimatePresence>
                {expandedSteps.has(step.id) && (
                  <motion.div
                    className="thinking-step-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p>{step.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Placeholder when thinking */}
          {isThinking && steps.length === 0 && (
            <motion.div
              className="thinking-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="spin" size={24} />
              <p>OMEGA analyse votre demande...</p>
            </motion.div>
          )}
        </div>

        {/* Footer with stats */}
        {steps.length > 0 && (
          <div className="thinking-footer">
            <span className="thinking-stat">
              {steps.filter(s => s.status === 'complete').length} / {steps.length} étapes
            </span>
            <span className="thinking-stat">
              Durée: {Math.round((Date.now() - steps[0].timestamp) / 1000)}s
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Hook to manage thinking steps
 */
export function useThinkingSteps() {
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const addStep = (type: ThinkingStep['type'], content: string) => {
    const step: ThinkingStep = {
      id: `step-${Date.now()}-${Math.random()}`,
      type,
      content,
      status: 'active',
      timestamp: Date.now(),
    };

    setSteps(prev => [...prev.map(s => ({ ...s, status: 'complete' as const })), step]);
  };

  const completeCurrentStep = () => {
    setSteps(prev =>
      prev.map(s => (s.status === 'active' ? { ...s, status: 'complete' as const } : s))
    );
  };

  const startThinking = () => {
    setIsThinking(true);
    setSteps([]);
  };

  const stopThinking = () => {
    setIsThinking(false);
    completeCurrentStep();
  };

  const reset = () => {
    setSteps([]);
    setIsThinking(false);
  };

  return {
    steps,
    isThinking,
    addStep,
    completeCurrentStep,
    startThinking,
    stopThinking,
    reset,
  };
}
