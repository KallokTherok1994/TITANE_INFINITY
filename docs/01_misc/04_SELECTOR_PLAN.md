# Selector Fix Plan — Phase B

## Current Selector Status

**Failing Selector**: `.chat-bubble-trigger`  
**Location**: Tests query for this CSS class  
**Current Status**: Element not found in DOM at test time  
**Test File**: e2e/desktop/ai-verification.full.e2e.js

## Search Results
## Test File References

## Source Component References
src/components/chat/ChatBubble-ArcReactor.css:83:.chat-bubble-trigger {
src/components/chat/ChatBubble-ArcReactor.css:112:.chat-bubble-trigger.bottom-right {
src/components/chat/ChatBubble-ArcReactor.css:116:.chat-bubble-trigger.bottom-left {
src/components/chat/ChatBubble-ArcReactor.css:120:.chat-bubble-trigger svg {
src/components/chat/ChatBubble-ArcReactor.css:129:.chat-bubble-trigger::before {
src/components/chat/ChatBubble-ArcReactor.css:138:.chat-bubble-trigger::after {
src/components/chat/ChatBubble-ArcReactor.css:148:.chat-bubble-trigger > * {
src/components/chat/ChatBubble-ArcReactor.css:154:.chat-bubble-trigger:hover {
src/components/chat/ChatBubble-ArcReactor.css:593:  .chat-bubble-trigger {
src/components/chat/ChatBubble-ArcReactor.css:598:  .chat-bubble-trigger svg {
src/components/chat/ChatBubble-ArcReactor.css:608:.chat-bubble-trigger.dragging,
src/components/chat/ChatBubble-ArcReactor.css:619:.chat-bubble-trigger.dragging {
src/components/chat/ChatBubble-ArcReactor.css:628:.chat-bubble-trigger:not(.dragging) {
src/components/chat/ChatBubble.tsx:343:            className={`chat-bubble-trigger ${position} ${isDragging ? 'dragging' : ''}`}

## Broader Chat Component Search

## Fix Strategy

**Preferred Solution**: Add `data-testid="chat-bubble-trigger"` to the chat entry point component  
**Rationale**: 
- data-testid is stable and specific
- Decouples test selectors from CSS class names
- Survives CSS refactors

**Implementation**:
1. Locate the actual chat entry/trigger element in src/components or src/pages
2. Add data-testid="chat-bubble-trigger" attribute
3. Update E2E test to query [data-testid="chat-bubble-trigger"] instead of .chat-bubble-trigger

**Max Attempts**: 3 iterations
