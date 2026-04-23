import { useExperience } from '../hooks/useExperience';
import { motion } from 'framer-motion';

export function Experience() {
  const {
    state,
    isLoading,
    totalXp,
    level,
    xpForNextLevel,
    progress,
    domains,
  } = useExperience();

  // Pour la démo, pas de gestion d'erreur spécifique
  if (isLoading || !state) {
    return (
      <div className="experience-page" data-testid="page-experience">
        <h1>⚡ PROGRESSION TITANE∞</h1>
        <p>Chargement de la progression...</p>
      </div>
    );
  }

  return (
    <div className="experience-page" data-testid="page-experience">

      <motion.div
        className="exp-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
      
        <p>Évolution intelligente et persistante</p>
        <p className="exp-source-label" style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 4 }}>
          Source: moteur XP canonique (Tauri Rust)
        </p>
      </motion.div>


      <motion.div
        className="exp-stats-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="exp-stat-card">
          <div className="exp-stat-label">Niveau</div>
          <div className="exp-stat-value">{level}</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">XP Total</div>
          <div className="exp-stat-value">{totalXp.toLocaleString()}</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">XP vers prochain niveau</div>
          <div className="exp-stat-value">{xpForNextLevel}</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">Progression</div>
          <div className="exp-stat-value">{(progress * 100).toFixed(1)}%</div>
        </div>
      </motion.div>


      <motion.div
        className="exp-domains-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <h2>🎯 Domaines de Compétence</h2>
        {domains.length === 0 ? (
          <p className="exp-loading">Chargement des domaines...</p>
        ) : (
          <div className="exp-domains-grid">
            {domains.map(domain => (
              <motion.div
                key={domain.category}
                className={`exp-domain-card exp-domain-card--${domain.category}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="exp-domain-header">
                  <span className="exp-domain-icon">{domain.icon}</span>
                  <span className="exp-domain-label">{domain.category}</span>
                  <span className="exp-domain-level">Nv.{domain.level}</span>
                </div>
                <div className="exp-domain-progress">
                  <div
                    className="exp-domain-progress-fill"
                    style={{
                      width: `${Math.min(domain.progress * 100, 100)}%`,
                      background: domain.color,
                    }}
                  />
                </div>
                <div className="exp-domain-stats">
                  <span className="exp-domain-xp">{domain.total_exp.toLocaleString()} XP</span>
                  <span className="exp-domain-category">{domain.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
