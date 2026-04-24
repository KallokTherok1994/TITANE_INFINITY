import { useMemo, useState } from 'react';
import { useExperience } from '../hooks/useExperience';
import { motion } from 'framer-motion';

export function Experience() {
  const { state, isLoading, totalXp, level, xpForNextLevel, progress, domains } =
    useExperience();
  const [filter, setFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const result: Record<string, { count: number; total: number }> = {};
    for (const event of state.history) {
      if (!result[event.source]) {
        result[event.source] = { count: 0, total: 0 };
      }
      (result[event.source] as { count: number; total: number }).count += 1;
      (result[event.source] as { count: number; total: number }).total += event.amount;
    }
    return result;
  }, [state.history]);

  const sources = useMemo(() => Object.keys(stats).sort(), [stats]);
  const chatEvents = useMemo(
    () => state.history.filter(event => isChatExperienceSource(event.source)),
    [state.history]
  );
  const chatXpTotal = useMemo(
    () => chatEvents.reduce((sum, event) => sum + event.amount, 0),
    [chatEvents]
  );
  const latestChatEvent = chatEvents[0];

  const filteredHistory = useMemo(() => {
    if (filter === 'all') {
      return state.history;
    }
    return state.history.filter(event => event.source === filter);
  }, [filter, state.history]);

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
        <h1>⚡ PROGRESSION TITANE∞</h1>
        <p>Évolution intelligente et persistante</p>
        <p
          className="exp-source-label"
          data-testid="experience-runtime-source"
          style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 4 }}
        >
          Source: service XP canonique (Tauri IPC + localStorage fallback)
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
          <div className="exp-stat-value" data-testid="experience-level">
            {level}
          </div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">XP Total</div>
          <div className="exp-stat-value" data-testid="experience-total-xp">
            {totalXp.toLocaleString()}
          </div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">Prochain palier XP</div>
          <div className="exp-stat-value" data-testid="experience-next-level-xp">
            {xpForNextLevel.toLocaleString()}
          </div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">Progression</div>
          <div className="exp-stat-value" data-testid="experience-progress">
            {(progress * 100).toFixed(1)}%
          </div>
        </div>
      </motion.div>

      <motion.div
        className="exp-sources-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <h2>Statistiques</h2>
        <ul className="exp-stats-advanced" data-testid="experience-stats-advanced">
          <li>{`XP total: ${totalXp.toLocaleString()}`}</li>
          <li>{`Niveau actuel: ${level}`}</li>
          <li>{`XP prochain niveau: ${xpForNextLevel.toLocaleString()}`}</li>
          <li>{`Progression: ${(progress * 100).toFixed(1)}%`}</li>
        </ul>
      </motion.div>

      <motion.div
        className="exp-sources-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        data-testid="experience-chat-sync-summary"
      >
        <h2>XP généré par le chat</h2>
        <div className="exp-sources-grid">
          <div className="exp-source-card">
            <div className="exp-source-name">Conversation TITANE</div>
            <div className="exp-source-stats">
              <span data-testid="experience-chat-xp-total">
                {`+${chatXpTotal.toLocaleString()} XP`}
              </span>
              <span
                className="exp-source-count"
                data-testid="experience-chat-event-count"
              >
                {`${chatEvents.length} gain${chatEvents.length > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
          <div className="exp-source-card">
            <div className="exp-source-name">Dernier gain chat</div>
            <div className="exp-source-stats">
              <span data-testid="experience-chat-last-gain">
                {latestChatEvent
                  ? `+${latestChatEvent.amount.toLocaleString()} XP`
                  : 'Aucun gain'}
              </span>
              <span className="exp-source-count">
                {latestChatEvent ? formatSource(latestChatEvent.source) : 'Chat'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="exp-domains-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2>🎯 Domaines de Compétence</h2>
        {domains.length === 0 ? (
          <p className="exp-loading">Chargement des domaines...</p>
        ) : (
          <div className="exp-domains-grid">
            {domains.map(domain => (
              <motion.div
                key={domain.id}
                className={`exp-domain-card exp-domain-card--${domain.category}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="exp-domain-header">
                  <span className="exp-domain-icon">{domain.icon}</span>
                  <span className="exp-domain-label">{domain.label}</span>
                  <span className="exp-domain-level">Nv.{domain.level}</span>
                </div>
                <div className="exp-domain-progress">
                  <div
                    className="exp-domain-progress-fill"
                    style={{
                      width: `${domainProgressPercent(domain)}%`,
                    }}
                  />
                </div>
                <div className="exp-domain-stats">
                  <span className="exp-domain-xp">{domain.xp.toLocaleString()} XP</span>
                  <span className="exp-domain-category">{domain.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        className="exp-filters"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
          data-testid="experience-filter-all"
        >
          {`Tout (${state.history.length})`}
        </button>
        {sources.map(source => {
          const sourceStat = stats[source];
          if (!sourceStat) {
            return null;
          }

          return (
            <button
              key={source}
              className={filter === source ? 'active' : ''}
              onClick={() => setFilter(source)}
              data-testid={`experience-filter-${source}`}
            >
              {`${formatSource(source)} (${sourceStat.count})`}
            </button>
          );
        })}
      </motion.div>

      <motion.div
        className="exp-history"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2>Historique XP</h2>
        <div className="exp-history-list" data-testid="experience-history-list">
          {filteredHistory.length === 0 ? (
            <div className="exp-event exp-history-item">
              <span className="exp-event-source">Aucun événement pour ce filtre.</span>
            </div>
          ) : (
            filteredHistory.map(event => (
              <div
                key={event.id}
                className="exp-event exp-history-item"
                data-testid="experience-history-item"
              >
                <span className="exp-event-time">
                  {new Date(event.timestamp).toLocaleString('fr-FR')}
                </span>
                <span className="exp-event-amount">{`+${event.amount} XP`}</span>
                <span className="exp-event-source">{formatSource(event.source)}</span>
                <span className="exp-event-desc">{event.domainId}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

function isChatExperienceSource(source: string): boolean {
  return source.startsWith('chat_');
}

function domainProgressPercent(domain: { xp: number; level: number }): number {
  const currentLevelXp = domain.level ** 2 * 100;
  const nextLevelXp = (domain.level + 1) ** 2 * 100;
  const xpInLevel = Math.max(0, domain.xp - currentLevelXp);
  const xpNeeded = Math.max(1, nextLevelXp - currentLevelXp);
  return Math.min((xpInLevel / xpNeeded) * 100, 100);
}

function formatSource(source: string): string {
  const map: Record<string, string> = {
    chat_message: '💬 Message chat',
    chat_quality_bonus: '✨ Bonus qualité',
    chat_titane_response: '🤖 Réponse TITANE',
    chat_conversation_streak: '🔥 Série conversationnelle',
    file_import: '📁 Import fichier',
    system_event: '⚙️ Événement système',
    memory_ingestion: '🧠 Ingestion mémoire',
    project_completion: '🏁 Complétion projet',
    cognitive_analysis: '🔍 Analyse cognitive',
  };
  return map[source] ?? source;
}
