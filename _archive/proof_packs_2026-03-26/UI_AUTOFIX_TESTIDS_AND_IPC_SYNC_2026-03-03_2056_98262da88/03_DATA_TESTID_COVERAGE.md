]633;E;{   echo "# G_DATA_TESTID_PRESENT"\x3b   echo "DATE=$(date -Iseconds)"\x3b   echo\x3b   echo "## Coverage scan"\x3b   rg "data-testid=" src/pages src/components src/features --glob "*.tsx" --glob "*.ts" --stats || true\x3b   echo\x3b   COUNT=$(rg "data-testid=" src/pages src/components src/features --glob "*.tsx" --glob "*.ts" -c | awk -F: '{s+=$2} END {print s+0}')\x3b   if [ "$COUNT" -gt 0 ]\x3b then     echo "G_DATA_TESTID_PRESENT=PASS ($COUNT)"\x3b   else     echo "G_DATA_TESTID_PRESENT=FAIL (0)"\x3b   fi\x3b } > "$PACK_DIR/03_DATA_TESTID_COVERAGE.md";b362c643-1bdc-4404-baa1-2ca9e491a839]633;C# G_DATA_TESTID_PRESENT
DATE=2026-03-03T20:59:04-05:00

## Coverage scan
src/pages/TitanePage.tsx:      <Container size="xl" className="titane-page" data-testid="page-titane">
src/pages/TitanePage.tsx:                data-testid="tab-conversation"
src/pages/TitanePage.tsx:                data-testid="tab-overview"
src/pages/TitanePage.tsx:                data-testid="tab-vision"
src/pages/TitanePage.tsx:                data-testid="tab-identity"
src/pages/TitanePage.tsx:                data-testid="tab-memory"
src/pages/TitanePage.tsx:                data-testid="tab-memory-evolution"
src/pages/TitanePage.tsx:                data-testid="tab-progression"
src/pages/TitanePage.tsx:                data-testid="tab-transformation"
src/pages/TitanePage.tsx:            data-testid="page-titane-content"
src/features/production-health/ProductionHealthPanel.tsx:            data-testid="production-health-refresh"
src/features/production-health/ProductionHealthPanel.tsx:      <div className="production-health-panel" data-testid="production-health-panel">
src/pages/ConfigurationHub.tsx:    <div className="module-page" data-testid="page-configuration-hub">
src/pages/ConfigurationHub.tsx:                data-testid="btn-config-refresh"
src/pages/ConfigurationHub.tsx:                data-testid="btn-config-export"
src/pages/ConfigurationHub.tsx:                data-testid="btn-config-import"
src/pages/ConfigurationHub.tsx:                data-testid="btn-config-save-preset"
src/pages/ConfigurationHub.tsx:                  data-testid="select-config-preset"
src/pages/ConfigurationHub.tsx:                data-testid="btn-config-edit"
src/pages/ConfigurationHub.tsx:                data-testid="btn-config-cancel"
src/pages/ConfigurationHub.tsx:                data-testid="btn-config-save"
src/pages/ConfigurationHub.tsx:          data-testid="tab-config-system"
src/pages/ConfigurationHub.tsx:          data-testid="tab-config-ai"
src/pages/ConfigurationHub.tsx:          data-testid="tab-config-performance"
src/pages/DevPage.tsx:            data-testid={`btn-dev-operation-${op.id}`}
src/pages/DevPage.tsx:          data-testid="btn-dev-execute-operation"
src/pages/DevPage.tsx:            data-testid={`btn-dev-command-${cmd.id}`}
src/pages/DevPage.tsx:              data-testid={`btn-dev-run-suite-${suite.id}`}
src/pages/DevPage.tsx:                data-testid={`btn-dev-ack-alert-${alert.id}`}
src/pages/DevPage.tsx:    <div className="dev-page" data-testid="page-dev">
src/pages/DevPage.tsx:          data-testid="btn-dev-refresh"
src/pages/DevPage.tsx:            data-testid={`tab-dev-${section.id}`}
src/pages/DevPage.tsx:          <div data-testid="page-dev-diagnostic">
src/pages/TimePage.tsx:      data-testid="page-time"
src/pages/TimePage.tsx:            data-testid={`tab-time-${tab.id}`}
src/pages/TimePage.tsx:          data-testid="btn-time-view-week"
src/pages/TimePage.tsx:          data-testid="btn-time-view-month"
src/pages/TimePage.tsx:            data-testid="input-time-planning-prompt"
src/pages/TimePage.tsx:              data-testid="btn-time-generate-plan"
src/pages/TimePage.tsx:              data-testid="btn-time-add-manual"
src/pages/TimePage.tsx:          data-testid="btn-time-nav-past"
src/pages/TimePage.tsx:          data-testid="btn-time-nav-present"
src/pages/TimePage.tsx:          data-testid="btn-time-nav-future"
src/pages/TimePage.tsx:          data-testid="btn-time-create-snapshot"
src/pages/TimePage.tsx:                data-testid={`btn-snapshot-select-${snapshot.id}`}
src/pages/TimePage.tsx:              data-testid="btn-time-restore-snapshot"
src/pages/TimePage.tsx:              data-testid="btn-time-compare-snapshot"
src/pages/TimePage.tsx:              data-testid="btn-time-delete-snapshot"
src/pages/ResearchPage.tsx:  <div className="rp-citation" data-testid={`citation-${index}`}>
src/pages/ResearchPage.tsx:        <span className="rp-locator-text" data-testid={`locator-text-${index}`}>
src/pages/ResearchPage.tsx:        data-testid="trace-toggle"
src/pages/ResearchPage.tsx:        <div className="rp-trace-body" data-testid="trace-body">
src/pages/ResearchPage.tsx:      <div className="rp-root" data-testid="research-page">
src/pages/ResearchPage.tsx:        <form className="rp-form" onSubmit={handleSubmit} data-testid="research-form">
src/pages/ResearchPage.tsx:              data-testid="research-question"
src/pages/ResearchPage.tsx:                data-testid="research-mode"
src/pages/ResearchPage.tsx:                  data-testid="research-target-url"
src/pages/ResearchPage.tsx:                data-testid="research-seed-urls"
src/pages/ResearchPage.tsx:              data-testid="research-sandbox"
src/pages/ResearchPage.tsx:              data-testid="research-submit"
src/pages/ResearchPage.tsx:                data-testid="research-reset"
src/pages/ResearchPage.tsx:          <div className="rp-error-banner" data-testid="research-error" role="alert">
src/pages/ResearchPage.tsx:          <div className="rp-results" data-testid="research-results">
src/pages/ResearchPage.tsx:            <div className="rp-mode-badge" data-testid="research-mode-badge">
src/pages/ResearchPage.tsx:              data-testid="research-verdict"
src/pages/ResearchPage.tsx:            <section className="rp-section" data-testid="research-answer-section">
src/pages/ResearchPage.tsx:              <div className="rp-answer-text" data-testid="research-answer">
src/pages/ResearchPage.tsx:              <section className="rp-section" data-testid="research-sources-section">
src/pages/ResearchPage.tsx:              <section className="rp-section" data-testid="research-limitations-section">
src/components/config/ConfigFieldEditable.tsx:          data-testid={testId}
src/components/config/ConfigFieldEditable.tsx:          data-testid={testId}
src/components/config/ConfigFieldEditable.tsx:        data-testid={testId}
src/pages/Stats.tsx:    <div className="module-page" data-testid="page-stats">
src/components/ui/switch.tsx:        data-testid={dataTestId}
src/features/chat/ChatProviderSelector.tsx:          data-testid="select-chat-provider"
src/components/debug/TracePanel.tsx:      <div data-testid="trace-panel-empty" style={{ fontSize: '0.75rem', opacity: 0.7 }}>
src/components/debug/TracePanel.tsx:      data-testid="trace-panel"
src/components/debug/TracePanel.tsx:        data-testid="trace-panel-json"
src/components/layout/TopNav.tsx:      data-testid="nav-top-main"
src/components/layout/TopNav.tsx:              data-testid={`nav-${item.id}`}
src/components/layout/TopNav.tsx:              data-testid="btn-nav-more"
src/components/layout/TopNav.tsx:                        data-testid={`nav-${item.id}`}
src/features/admin/AdminPage.tsx:    <div className="admin-page" data-testid="page-admin">
src/features/admin/AdminPage.tsx:            data-testid={`tab-admin-${tab.id}`}
src/features/admin/AdminPage.tsx:      <main className="admin-content" data-testid="page-admin-content">
src/features/transformation/TransformationRoadmap.tsx:      <div className="roadmap-stats" data-testid="roadmap-stats">
src/features/audio-center/AudioCenterPage.tsx:        data-testid={testId}
src/features/audio-center/AudioCenterPage.tsx:      data-testid="page-audio-center"
src/features/audio-center/AudioCenterPage.tsx:            data-testid="btn-audio-refresh-devices"
src/features/audio-center/AudioCenterPage.tsx:              data-testid={`tab-audio-${tab.id}`}
src/features/audio-center/AudioCenterPage.tsx:                data-testid="btn-audio-test-speaker"
src/features/audio-center/AudioCenterPage.tsx:                data-testid="btn-audio-test-microphone"
src/features/audio-center/AudioCenterPage.tsx:                  data-testid="input-elevenlabs-api-key"
src/features/audio-center/AudioCenterPage.tsx:                  data-testid="select-audio-language"
src/features/audio-center/AudioCenterPage.tsx:                  data-testid="toggle-audio-auto-fallback"
src/features/identity/ModeMatrix.tsx:              data-testid={`mode-card-${mode.id}`}
src/features/identity/ModeMatrix.tsx:                <div className="lock-overlay" data-testid={`lock-overlay-${mode.id}`}>
src/components/sections/ConversationSection.tsx:      data-testid="page-conversation"
src/components/sections/ConversationSection.tsx:              data-testid="select-conversation-mode"
src/components/sections/ConversationSection.tsx:              data-testid="btn-export-json"
src/components/sections/ConversationSection.tsx:              data-testid="btn-export-markdown"
src/components/sections/ConversationSection.tsx:              data-testid="btn-copy-chat"
src/components/sections/ConversationSection.tsx:              data-testid="toggle-audio-tts"
src/components/sections/ConversationSection.tsx:              data-testid="toggle-voice-input"
src/components/sections/ConversationSection.tsx:              data-testid="btn-mode-builder"
src/components/sections/ConversationSection.tsx:              data-testid="btn-health-check"
src/components/sections/ConversationSection.tsx:              data-testid="btn-clear-chat"
src/components/sections/ConversationSection.tsx:              data-testid="input-conversation-search"
src/components/sections/ConversationSection.tsx:            data-testid="select-conversation-role"
src/components/sections/ConversationSection.tsx:            data-testid="chat-input"
src/components/sections/ConversationSection.tsx:            data-testid="chat-send"

111 matches
111 matched lines
17 files contained matches
391 files searched
9395 bytes printed
3408998 bytes searched
0.001549 seconds spent searching
0.006528 seconds

G_DATA_TESTID_PRESENT=PASS (111)
