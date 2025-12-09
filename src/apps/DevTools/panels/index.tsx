/**
 * Panel stubs - To be implemented
 */

import React, { useState } from 'react';
import { useMemoryOS } from '../hooks/useMemoryOS';

export const MemoryInspector: React.FC = () => {
  const { stats, loading, semanticSearch, getMemoriesByTier, clusterMemories, compressSimilar } = useMemoryOS();
  const [activeTab, setActiveTab] = useState<'STM' | 'MTM' | 'LTM' | 'Vector' | 'Clusters'>('STM');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [tierMemories, setTierMemories] = useState<any[]>([]);

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await semanticSearch(searchQuery, 10);
    setSearchResults(results);
  };

  const handleLoadTier = async (tier: 'STM' | 'MTM' | 'LTM') => {
    const memories = await getMemoriesByTier(tier, 50);
    setTierMemories(memories);
  };

  const handleCluster = async () => {
    const result = await clusterMemories();
    if (result) {
      alert(`Clustered into ${result.clusters.length} groups (silhouette: ${result.silhouette_score.toFixed(3)})`);
    }
  };

  const handleCompress = async () => {
    const count = await compressSimilar(0.95);
    alert(`Compressed ${count} similar memories`);
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace' }}>
      <h2>🧠 Memory Inspector</h2>
      
      {/* Stats */}
      {loading ? (
        <p>Loading stats...</p>
      ) : stats ? (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          <div><strong>STM:</strong> {stats.stm_count} | <strong>MTM:</strong> {stats.mtm_count} | <strong>LTM:</strong> {stats.ltm_count}</div>
          <div><strong>Total Memories:</strong> {stats.total_memories}</div>
          {stats.vector_entries !== undefined && (
            <div><strong>Vector Index:</strong> {stats.vector_entries} entries ({stats.vector_dimension}D)</div>
          )}
        </div>
      ) : null}

      {/* Tabs */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        {(['STM', 'MTM', 'LTM', 'Vector', 'Clusters'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'Vector' && tab !== 'Clusters') {
                handleLoadTier(tab);
              }
            }}
            style={{
              padding: '8px 16px',
              background: activeTab === tab ? '#007acc' : '#e0e0e0',
              color: activeTab === tab ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'Vector' ? (
        <div>
          <h3>🔍 Semantic Search</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter query..."
              style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button
              onClick={handleSemanticSearch}
              style={{ padding: '8px 16px', background: '#007acc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Search
            </button>
          </div>
          <div>
            {searchResults.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {searchResults.map((result, idx) => (
                  <li key={idx} style={{ marginBottom: '12px', padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <div><strong>ID:</strong> {result.id}</div>
                    <div><strong>Score:</strong> {result.score.toFixed(3)}</div>
                    <div><strong>Content:</strong> {result.content.substring(0, 200)}...</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#888' }}>No results yet. Try a semantic search.</p>
            )}
          </div>
        </div>
      ) : activeTab === 'Clusters' ? (
        <div>
          <h3>📊 Clustering</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={handleCluster} style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cluster Memories
            </button>
            <button onClick={handleCompress} style={{ padding: '8px 16px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Compress Similar
            </button>
          </div>
          <p style={{ color: '#888' }}>Clustering will group similar memories. Compression will merge duplicates.</p>
        </div>
      ) : (
        <div>
          <h3>{activeTab} Memories</h3>
          {tierMemories.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tierMemories.map((mem, idx) => (
                <li key={idx} style={{ marginBottom: '12px', padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
                  <div><strong>ID:</strong> {mem.id}</div>
                  <div><strong>Importance:</strong> {mem.importance.toFixed(2)}</div>
                  <div><strong>Accessed:</strong> {mem.accessed_count} times</div>
                  <div><strong>Content:</strong> {mem.content.substring(0, 150)}...</div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#888' }}>No memories in {activeTab}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export const EngineInspector: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2>⚙️ Engine Inspector</h2>
      <p style={{ color: '#888' }}>Coming soon: Engine states and controls</p>
    </div>
  );
};

export const SelfHealingPanel: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2>🩹 Self-Healing Dashboard</h2>
      <p style={{ color: '#888' }}>Coming soon: Incidents and healing actions</p>
    </div>
  );
};

export const EventTimeline: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2>⏱️ Event Timeline</h2>
      <p style={{ color: '#888' }}>Coming soon: Real-time event stream</p>
    </div>
  );
};

export const VoiceMonitor: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2>🎤 Voice Monitor</h2>
      <p style={{ color: '#888' }}>Coming soon: ASR/TTS latency and waveforms</p>
    </div>
  );
};

export const SystemHealthPanel: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2>❤️ System Health</h2>
      <p style={{ color: '#888' }}>Coming soon: CPU/RAM/Disk monitoring</p>
    </div>
  );
};
