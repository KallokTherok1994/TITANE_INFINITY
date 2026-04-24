# Component Inventory by Feature

**Date:** 2026-02-07  
**Scope:** Feature-level component breakdown and UI states

---

## Feature 1: Chat System

### User Goal
Interact with AI through natural language conversation with multi-provider support.

### Components (29 total)
**Core (5):**
- `MessageBubble` - Individual message display
- `MessageList` - List container for messages
- `MessageListOptimized` - Performance-optimized list
- `VirtualMessageList` - Virtualized scrolling (large conversations)
- `ChatInput` - Message composition area

**Tools (4):**
- `ChatToolbar` - Action buttons bar
- `FileUploadButton` - File attachment control
- `ChatFileImport` - File import dialog
- `DictationButton` - Voice input trigger

**UX (6):**
- `ChatModeSelector` - Mode switching (Normal/Code/Creative)
- `ModeBadge` - Visual mode indicator
- `ConversationsButton` - Sidebar toggle
- `ConversationsSidebar` - Conversation history panel
- `MemoryViewer` - Contextual memory display
- `TypingIndicator` - AI typing animation

**Features (9):**
- `AutomationPanel` - Automated task execution
- `EvolutionTracker` - AI evolution metrics
- `MemoryDashboard` - Memory state visualization
- `ContextUsage` - Token usage display
- `ToolResult` - Tool execution result display
- `ThinkingPanel` - AI reasoning visualization
- `ChatProviderSelector` - AI provider switcher
- `ChatMessage` - Message component wrapper
- `ChatFeedback` - Rating/feedback UI

**Diagnostics (5):**
- `ChatFallback` - Error recovery UI
- `ChatDiagnostic` - Debug information panel
- `ChatDebugPanel` - Developer diagnostics
- `ChatErrorBoundary` - Chat-specific error boundary
- `ChatConnectionStatus` - Connection health indicator

### UI States
- **Empty:** "Start a conversation" placeholder
- **Loading:** Typing indicator, skeleton messages
- **Success:** Messages displayed with metadata
- **Error:** Error banner with retry action
- **Offline:** "Reconnecting..." overlay
- **Streaming:** Real-time message rendering

### Error States
- **Network Error:** "Connection lost. Retry?"
- **API Error:** "Provider unavailable. Switch provider?"
- **Rate Limit:** "Too many requests. Wait X seconds."
- **Timeout:** "Response timed out. Retry?"
- **Invalid Input:** "Message too long / empty."

---

## Feature 2: System Monitoring

### User Goal
Monitor system health, performance, and engine states in real-time.

### Components (27 total)
**Dashboards (5):**
- `SystemHealthMonitor` - Overall system health
- `SingularityDashboard` - Singularity engine state
- `AnomalyDashboard` - Anomaly detection
- `PredictiveAlertsDashboard` - Predictive warnings
- `PerformanceDashboard` - Performance metrics

**Cards (9):**
- `MetricsCard` - Generic metrics display
- `SystemStatusCard` - System status summary
- `LogsCard` - Recent logs widget
- `ErrorsCard` - Error alerts widget
- `LivingEnginesCard` - Engine health cards
- `CognitiveModuleCard` - Cognitive module state
- `ModuleCard` - Generic module card
- `MetricCard` - Single metric card
- `EngineCard` - Engine status card

**Headers (3):**
- `MonitoringHeader` - Monitoring page header
- `GlobalMetricsSummary` - Top-level summary
- `ServiceMetricsPanel` - Service-specific metrics

**DevTools (10):**
- `LogViewer` - Log streaming viewer
- `MetricsDisplay` - Metrics graph display
- `CoreHealthMonitor` - Core health status
- `EventStream` - Real-time event feed
- `MemoryTree` - Memory hierarchy tree
- `LogLine` - Individual log entry
- `LogFilters` - Log filtering controls
- `SectionHeader` - Section divider
- `StatusPill` - Status badge
- `TrendGraph` - Trend visualization

### UI States
- **Healthy:** Green indicators, all metrics normal
- **Degraded:** Yellow warnings, some issues
- **Critical:** Red alerts, action required
- **Unknown:** Gray indicators, no data
- **Loading:** Skeleton cards, pulsing indicators

### Error States
- **Data Fetch Error:** "Unable to load metrics"
- **Subscription Error:** "Real-time updates paused"
- **Threshold Breach:** "CPU usage critical: 95%"

---

## Feature 3: Developer Tools

### User Goal
Debug, inspect, and optimize the TITANE∞ system.

### Components (16 total)
- `LogViewer` - Comprehensive log viewer
- `LogLine` - Formatted log entry
- `LogFilters` - Filter by level/source
- `EventStream` - Real-time event log
- `MetricsDisplay` - Performance metrics
- `MetricCard` - Single metric widget
- `TrendGraph` - Temporal trends
- `CoreHealthMonitor` - Core system health
- `EngineCard` - Engine diagnostics
- `MemoryTree` - Memory structure tree
- `SectionHeader` - Section separator
- `StatusPill` - Status badge
- `DevToolsPanel` - Main dev panel
- `DevToolsTabs` - Tab navigation
- `DevToolsLazy` - Lazy-loaded variant
- `ConsoleMonitorDashboard` - Console capture

### UI States
- **Active:** Live log streaming, real-time updates
- **Paused:** Logs frozen, manual refresh
- **Filtered:** Subset of logs shown
- **Empty:** "No logs to display"
- **Overflow:** "Log buffer full, clearing old entries"

### Error States
- **Console Hijack Failed:** "Unable to capture console"
- **Memory Exceeded:** "Dev tools disabled (low memory)"

---

## Feature 4: Experience/XP System

### User Goal
Track progression, earn XP, unlock features, view achievements.

### Components (11 total)
- `GlobalExpBar` - Persistent XP bar (top/bottom)
- `ExpPanel` - Detailed XP breakdown panel
- `TalentTree` - Skill tree visualization
- `XPBar` - Compact XP progress bar
- `TimelineChart` - XP history timeline
- `CompactXPBar` - Mini XP widget
- `AchievementCard` - Achievement display
- `XPProgressBar` - Progress bar component
- `MilestoneMarker` - Milestone indicator
- `LevelUpAnimation` - Level-up celebration
- `TalentNode` - Talent tree node

### UI States
- **Progress:** XP bar filling animation
- **Level Up:** Celebration animation + notification
- **Milestone Reached:** Badge animation
- **Talent Unlocked:** Glow effect + sound
- **Empty:** "No XP earned yet"

### Error States
- **XP Fetch Error:** "Unable to load progression"
- **Talent Unlock Failed:** "Failed to unlock talent"

---

## Feature 5: Administration

### User Goal
Configure system settings, manage AI providers, design system, governance.

### Components (15+ total across 5 tabs)
**System Tab:**
- `SystemCenterPage` - System center main page
- `DiagnosticsPanel` - System diagnostics
- `ClusterManager` - Cluster management

**Config Tab:**
- `ConfigurationHub` - Configuration main page
- `ConfigEditor` - JSON config editor
- `ConfigValidator` - Config validation

**Audio Tab:**
- `AudioCenterPage` - Audio center main page
- `TTSSelector` - TTS engine selector
- `VoiceProfileEditor` - Voice profile config

**Design Tab:**
- `DesignCenterPage` - Design system page
- `ThemeEditor` - Theme customization
- `TokensEditor` - Design tokens editor

**Governance Tab:**
- `GovernanceCenterPage` - Governance main page
- `APIProviderCard` - Provider config card
- `SecretsManager` - Secrets management

### UI States
- **View:** Read-only display
- **Edit:** Editable fields
- **Saving:** Loading spinner on save button
- **Saved:** Checkmark + "Saved" message
- **Dirty:** "Unsaved changes" warning

### Error States
- **Validation Error:** "Invalid configuration format"
- **Save Failed:** "Failed to save settings. Retry?"
- **Permission Error:** "Insufficient permissions"

---

## Component Categories Summary

| Feature | Components | UI States | Error States | IPC Dependencies |
|---------|------------|-----------|--------------|------------------|
| **Chat** | 29 | 6 | 5 | `chat_send_message`, `conversation_*` |
| **Monitoring** | 27 | 5 | 3 | `get_system_health`, `orchestration_*` |
| **DevTools** | 16 | 5 | 2 | `log_*`, `metrics_*` |
| **Experience** | 11 | 5 | 2 | `xp_*`, `progression_*` |
| **Admin** | 15+ | 5 | 3 | Provider-specific, config_* |
| **Navigation** | 9 | 2 | 1 | None (UI-only) |
| **Layout** | 6 | 2 | 0 | None |
| **Persistent** | 6 | 4 | 2 | Various |

**Total:** 119+ documented components (subset of 296 total)

---

**Next:** 21-inventory-by-filetree.md (complete file tree)
