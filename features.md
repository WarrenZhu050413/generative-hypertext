# Features & TODOs for NabokovsWeb

## Generated from continuous literature review
## Last updated: 2025-10-01

---

## Priority 1: Critical Missing Features

### F1.1: Undo/Redo System
**Source**: DirectGPT paper (CHI 2024)
**Research evidence**: Reversible operations essential for exploratory work
**Status**: ❌ Not implemented
**Implementation**:
- Add undo/redo for card generation
- Add undo/redo for card edits (content, position, connections)
- Add undo/redo for deletions
- Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z
- Visual undo history timeline (optional)
**Technical approach**:
- Implement command pattern with history stack
- Store diffs rather than full state snapshots for efficiency
- Persist undo history to chrome.storage.local
**Priority**: HIGH - users fear making mistakes without undo

### F1.2: Change Highlighting
**Source**: DirectGPT, user notes from 2025-09-23
**Research evidence**: Users need to see what changed to understand AI actions
**Status**: ❌ Not implemented
**Implementation**:
- When card content is edited/generated, highlight changes for 3-5 seconds
- Visual diff indicator showing before/after
- Animation drawing attention to new cards when generated
- Option to view change history for a card
**Technical approach**:
- Use diff algorithm (diff-match-patch library)
- CSS animations for highlights
- Store previous versions in card metadata
**Priority**: HIGH - critical for transparency and trust

### F1.3: Multiple Workspaces / Saved Views
**Source**: Ted Nelson's evolutionary structures, user notes from 2025-10-01
**Research evidence**: "Accept any arrangement users impose, allow multiple simultaneous organizations"
**Status**: ❌ Not implemented
**Current limitation**: Single canvas with one spatial arrangement
**Implementation**:
- Workspace tabs (like browser tabs)
- Each workspace has own canvas state (zoom, pan, visible cards)
- Cards can appear in multiple workspaces
- Save/restore workspace snapshots
- Export/import workspace configurations
**Technical approach**:
- Extend `nabokov_canvas_state` storage schema with workspace array
- Each workspace stores: name, card visibility, positions, zoom, pan
- UI: Workspace switcher in toolbar
**Priority**: HIGH - enables organizing same cards different ways for different tasks

---

## Priority 2: Interaction Enhancements

### F2.1: Clickable Terms within Cards (Touchable Graphics)
**Source**: Hyperties system, user notes from 2025-10-01
**Research evidence**: Graphics with embedded clickable words enable progressive disclosure
**Status**: ❌ Not implemented
**Implementation**:
- Detect key terms/entities in card content (NER or LLM-based)
- Make terms clickable
- Click spawns new detail card with explanation/expansion
- Detail card auto-connects to parent
- Visual indication of clickable terms (subtle underline/color)
**Technical approach**:
- Run NER on card content when created
- Wrap entities in `<span class="clickable-term" data-term="...">`
- Click handler → Claude API query "Explain [term] in context of [parent card content]"
- Generate new card with response
**Priority**: MEDIUM-HIGH - enables fractal exploration

### F2.2: Sub-Element Selection within Cards
**Source**: Observation on selection as primary interaction, user notes
**Research evidence**: Selection more powerful than description
**Status**: ❌ Not implemented
**Current limitation**: Can only interact with whole cards
**Implementation**:
- Select text/images within card content
- Right-click selected content → context menu
- Actions: "Explain this", "Generate related card", "Find similar", "Summarize"
- Selected content becomes context for LLM query
**Technical approach**:
- Listen for `selectionchange` events on card content
- Store selected text in state
- Context menu component with action buttons
- Pass selection to Claude API with card context
**Priority**: MEDIUM-HIGH - natural interaction pattern

### F2.3: Spatial Proximity as Implicit Feedback
**Source**: Information foraging theory, spatial hypertext research
**Research evidence**: Spatial arrangement reveals relationships
**Status**: ❌ Not implemented
**Current**: Manual positioning only
**Implementation**:
- Track card positions over time
- Detect clusters (cards consistently near each other)
- Suggest connections between clustered cards
- Offer to auto-tag cards in same cluster
- Visual indicator showing "these cards seem related"
**Technical approach**:
- Background job analyzing card positions
- K-means or DBSCAN clustering algorithm
- Cluster stability metric (cards stay together over sessions)
- UI: Dotted outline around detected clusters, suggestion panel
**Priority**: MEDIUM - reduces manual connection work

### F2.4: Automatic Prompt → Button Conversion
**Source**: DirectGPT paper - "Rapid Operations Through Prompts Reused as Tools"
**Research evidence**: Successful prompts become reusable tools
**Status**: ⚠️ Partial (custom buttons exist, but manual creation only)
**Current**: User can create custom buttons manually
**Enhancement**:
- After chat interaction, suggest "Save as button?"
- Extract prompt template from conversation
- Auto-populate button config with title, prompt, connection type
- One-click to add to toolbar
**Technical approach**:
- Parse last user message in successful chat
- Detect template patterns (references to card content/title)
- Show modal: "This seems useful - save as button?"
- Add to `defaultButtons` config
**Priority**: MEDIUM - lowers barrier to customization

---

## Priority 3: Sensemaking & Organization

### F3.1: Visual Connection Suggestions
**Source**: Spatial hypertext, information foraging
**Research evidence**: Systems should help users discover implicit relationships
**Status**: ❌ Not implemented
**Implementation**:
- Analyze card content similarity (embeddings)
- Suggest potential connections between cards
- Show suggestions as dotted/dashed lines
- User can accept (make solid) or dismiss
- Consider temporal proximity (cards created near same time)
**Technical approach**:
- Generate embeddings for card content (OpenAI/Anthropic embeddings API)
- Cosine similarity above threshold → suggestion
- Store suggestions separately from actual connections
- UI: Different edge style for suggestions vs confirmed connections
**Priority**: MEDIUM - helps users see non-obvious patterns

### F3.2: Card Clustering / Auto-Organization
**Source**: Spatial hypertext, incremental formalization
**Research evidence**: Support informal organization, formalize when ready
**Status**: ❌ Not implemented
**Implementation**:
- Analyze card content to detect themes
- Suggest clustering: "These 5 cards seem to be about X"
- Offer to auto-arrange cluster spatially
- User can accept/modify/reject
- Named clusters become implicit groups
**Technical approach**:
- Topic modeling on card contents (LDA or LLM-based)
- Force-directed graph layout for spatial arrangement
- Store cluster memberships as special tag
**Priority**: LOW-MEDIUM - useful for large collections

### F3.3: Timeline View
**Source**: Temporal organization patterns, user's browsing research
**Research evidence**: Multiple ways to view same information
**Status**: ❌ Not implemented
**Implementation**:
- Alternative view showing cards on timeline
- Sort by createdAt or updatedAt
- Filter by date range
- See evolution of ideas over time
- Switch between spatial canvas and timeline views
**Technical approach**:
- New view component using card createdAt timestamps
- Horizontal timeline with cards positioned by date
- Same card data, different visualization
- Toggle in toolbar: Canvas / Timeline / Graph
**Priority**: LOW-MEDIUM - complements spatial view

### F3.4: Graph View (Network Visualization)
**Source**: Connections between cards, relationship visualization
**Research evidence**: Different representations suit different tasks
**Status**: ❌ Not implemented (React Flow can do this, but not exposed)
**Implementation**:
- View cards as nodes, connections as edges
- Force-directed layout showing relationship structure
- Highlight paths between cards
- Identify central/peripheral cards
- Detect disconnected clusters
**Technical approach**:
- React Flow already supports graph layout
- Apply force-directed layout algorithm
- Centrality metrics (PageRank, degree)
- Toggle layout: Spatial (free-form) / Graph (force-directed)
**Priority**: LOW-MEDIUM - useful for relationship analysis

---

## Priority 4: Learning & Annotation

### F4.1: Inline Annotations / Marginalia
**Source**: Digital annotation research, user notes on annotation scaffolds
**Research evidence**: Collaborative annotation improves reading performance
**Status**: ❌ Not implemented
**Implementation**:
- Allow users to annotate specific parts of card content
- Highlights + notes attached to text ranges
- Annotations visible on hover or always-on (user choice)
- Export annotations separately or with content
**Technical approach**:
- Use range-based annotation library (e.g., Annotator.js pattern)
- Store annotations in card metadata: `annotations: Array<{range, text, timestamp}>`
- CSS for highlight rendering
**Priority**: MEDIUM - supports active reading

### F4.2: Card Combination / Fusion
**Source**: Nabokov Cards paper (bottom-up creativity), user notes from 2025-09-29
**Research evidence**: "Fragments combine into larger ideas", "drag onto another to combine"
**Status**: ❌ Not implemented
**Implementation**:
- Drag one card onto another → combine
- LLM generates fusion based on both card contents
- Options: Synthesize, Compare, Merge, Find Connections
- Result is new card, originals preserved
- New card links back to source cards
**Technical approach**:
- Detect card drop on another card (React Flow onNodeDrop)
- Show combination modal with options
- Claude API prompt: "Synthesize these two pieces: [card1] [card2]"
- Create new generated card with `parentCardId` as array
**Priority**: MEDIUM - enables emergent knowledge construction

### F4.3: Export Individual Cards as JSON/Markdown
**Source**: User notes from 2025-09-29 - "Every HTML element should be exportable"
**Research evidence**: Modular export supports reuse across contexts
**Status**: ⚠️ Partial (can export canvas state, but not individual cards easily)
**Enhancement**:
- Right-click card → "Export as..."
- Formats: JSON, Markdown, HTML, Plain Text
- Include metadata, connections, annotations (user choice)
- Copy to clipboard or download file
**Technical approach**:
- Context menu on cards
- Serialization functions for each format
- Markdown template with frontmatter for metadata
**Priority**: MEDIUM - supports integration with other tools

### F4.4: Batch Operations on Selected Cards
**Source**: Standard UI pattern, efficiency need
**Status**: ⚠️ Partial (can delete multiple, but limited actions)
**Enhancement**:
- Multi-select cards (Shift+click, Cmd+click)
- Batch actions: Tag, Delete, Export, Combine, Change Color
- Selected count indicator
- Keyboard shortcut for "Select all"
**Technical approach**:
- React Flow supports multi-selection (already works)
- Toolbar shows batch action buttons when multiple selected
- Apply action to all selected nodes
**Priority**: LOW-MEDIUM - quality of life improvement

---

## Priority 5: AI Integration Enhancements

### F5.1: Streaming Follow-up Suggestions
**Source**: Conversational grounding research, LLM clarification patterns
**Research evidence**: LLMs 3x less likely to initiate clarification than humans
**Status**: ❌ Not implemented
**Current**: User must think of next question
**Implementation**:
- After generating card, AI suggests 2-3 follow-up questions
- Suggestions appear as clickable chips/buttons
- Click → immediately generates answer as new card
- Suggestions based on card content and user's apparent intent
**Technical approach**:
- After card generation, second Claude API call: "Given [content], suggest 3 natural follow-up questions"
- Store suggestions in card metadata
- Render as buttons below card
- Click → trigger card generation with suggestion as prompt
**Priority**: MEDIUM-HIGH - reduces cognitive load, maintains flow

### F5.2: Contextual Detail Levels (Malleable Overview-Detail)
**Source**: Malleable Overview-Detail Interfaces paper
**Research evidence**: Users need to customize how much info in overview vs detail
**Status**: ⚠️ Partial (fixed preview length)
**Current**: All cards show same amount of preview
**Enhancement**:
- User can set global detail level: Minimal / Moderate / Full
- Per-card override (this card always full, that card always minimal)
- Context-aware: Cards user is actively working with → more detail
- Cards on periphery → less detail (automatic)
**Technical approach**:
- CSS classes for detail levels
- Card component reads global setting + per-card override
- Viewport-based detail adjustment (cards in center get more detail)
- Settings panel for global preference
**Priority**: LOW-MEDIUM - helps with information density

### F5.3: Conversational Context Anchoring
**Source**: Grounding research, boundary objects concept
**Research evidence**: Shared representation essential for effective collaboration
**Status**: ⚠️ Partial (FloatingWindowChat shows card, but limited context)
**Enhancement**:
- Chat window shows not just target card, but connected cards
- User can expand/collapse context
- "Include this card in context" button for any card
- Visual indicator of what's in LLM context
- Token count display
**Technical approach**:
- FloatingWindowChat maintains context set (Set<cardId>)
- Render context cards as thumbnails
- Build prompt with all context cards
- Show token count estimate
**Priority**: MEDIUM - improves grounding

### F5.4: Screenshot Analysis for Generated Cards
**Source**: Existing beautification service uses vision API
**Status**: ⚠️ Partial (screenshots captured, vision used for beautification)
**Enhancement**:
- When generating card from parent, include parent's screenshot in context
- "What's in this image?" button for image cards
- Visual question answering: Select image + ask question
- Compare screenshots: "How are these two images different?"
**Technical approach**:
- Extend cardGenerationService to include screenshot in API call
- Add vision-specific action buttons
- Use Claude's vision API with screenshot data
**Priority**: MEDIUM - leverages existing screenshots better

---

## Priority 6: Performance & Scalability

### F6.1: Virtual Rendering for Large Canvases
**Source**: Performance concern as card count grows
**Status**: ❌ Not implemented
**Current**: All cards render always (React Flow handles some optimization)
**Implementation**:
- Only render cards in viewport + small buffer
- Lazy load card content on demand
- Placeholder cards for off-screen nodes
- Minimap shows all cards, main canvas shows subset
**Technical approach**:
- React Flow's built-in viewport optimization
- Lazy loading for card.content (don't render HTML until visible)
- IntersectionObserver for triggering content load
**Priority**: LOW - only needed for 100+ cards

### F6.2: Incremental Loading / Pagination
**Source**: Performance for large collections
**Status**: ❌ Not implemented
**Current**: All cards loaded on canvas mount
**Implementation**:
- Load recently accessed cards first
- Lazy load older cards as user scrolls/searches
- Search index for fast filtering without loading all cards
- "Load more" or infinite scroll pattern
**Technical approach**:
- Partition cards by access time or creation time
- IndexedDB cursor for paginated queries
- Search index in separate storage key
**Priority**: LOW - only needed for 500+ cards

### F6.3: Web Worker for Embedding Computation
**Source**: Performance concern for similarity calculations
**Status**: ❌ Not implemented
**Current**: No embeddings computed
**Future need**: When implementing F3.1 (connection suggestions)
**Implementation**:
- Compute embeddings in Web Worker (don't block UI)
- Cache embeddings in IndexedDB
- Incremental recomputation (only new/changed cards)
**Technical approach**:
- Service worker or dedicated web worker for background tasks
- OpenAI embeddings API or local model
- IndexedDB cache with card content hash as key
**Priority**: LOW - only needed when implementing similarity features

---

## Priority 7: Collaboration & Sharing

### F7.1: Export Workspace as Shareable HTML
**Source**: Standalone viewing need
**Status**: ❌ Not implemented
**Implementation**:
- Export entire canvas as single HTML file
- Includes all cards, connections, positions
- Interactive (pan/zoom) but read-only
- Self-contained (no external dependencies)
**Technical approach**:
- Template HTML with embedded React Flow viewer
- Serialize all card data as JSON in script tag
- Include inline CSS
- Generate and download file
**Priority**: LOW - nice to have for sharing

### F7.2: Collaborative Workspaces (Multi-user)
**Source**: CSCW research, collaborative annotation research
**Status**: ❌ Not implemented (complex, requires backend)
**Future possibility**: Real-time collaboration like Figma
**Implementation**:
- Real-time sync between users on same workspace
- See others' cursors and selections
- Conflict resolution for simultaneous edits
- Presence indicators
**Technical approach**:
- Requires backend (WebSocket or CRDT library like Yjs)
- Operational Transform or CRDT for sync
- Out of scope for Chrome extension (would need web app version)
**Priority**: VERY LOW - significant architecture change

---

## Priority 8: Developer Experience & Code Quality

### F8.1: Comprehensive Error Boundaries
**Source**: Production readiness
**Status**: ⚠️ Partial (some try-catch, but no UI error boundaries)
**Implementation**:
- React Error Boundaries for all major components
- Graceful degradation when card rendering fails
- User-visible error messages with recovery options
- Error reporting (telemetry opt-in)
**Technical approach**:
- Wrap Canvas, CardNode, ChatModal in ErrorBoundary
- Fallback UI with "Retry" button
- Log errors to console with context
**Priority**: MEDIUM - improves reliability

### F8.2: Improved Type Safety for Card Schema
**Source**: Code quality, maintenance
**Status**: ⚠️ TypeScript used but card schema has many optional fields
**Enhancement**:
- Stricter types for different card types (branded types)
- Type guards for card types
- Schema migration system for storage changes
- Validation on card creation/load
**Technical approach**:
- Discriminated union: `type Card = ClippedCard | NoteCard | GeneratedCard | ImageCard`
- Each type has required fields for its variant
- Zod or similar for runtime validation
**Priority**: LOW-MEDIUM - prevents bugs

### F8.3: Automated Integration Tests for AI Features
**Source**: Testing complex AI interactions
**Status**: ⚠️ E2E tests exist but don't cover AI flows fully
**Enhancement**:
- Test card generation with mock API
- Test conversation flows
- Test edge cases (empty content, very long content)
- Visual regression tests for card rendering
**Technical approach**:
- Playwright tests with mocked Claude API responses
- Fixtures for various card types
- Percy or similar for visual regression
**Priority**: LOW-MEDIUM - ensures quality

---

## Backlog: Research-Inspired Ideas (Not Yet Scoped)

### B1: Adaptive Interface Based on Task Type
**Source**: Fluid interaction research, context-aware UIs
**Idea**: Detect if user is in "foraging" mode (creating many cards) vs "sensemaking" mode (connecting/organizing) and adapt UI accordingly

### B2: Federated Learning for Personal Models
**Source**: Privacy-preserving AI
**Idea**: Train small local model on user's card collection to improve suggestions without sending data to cloud

### B3: Voice Input for Card Creation
**Source**: Multimodal interaction research
**Idea**: Speak notes, AI transcribes and creates card

### B4: Integration with External Knowledge Bases
**Source**: Linked data, Semantic Web
**Idea**: Connect cards to Wikidata, arXiv, academic databases for enrichment

### B5: Progressive Summarization Pipeline
**Source**: Tiago Forte's PARA method, progressive summarization
**Idea**: Multi-pass highlighting/summarization of card content, with increasing levels of distillation

### B6: Spaced Repetition Integration
**Source**: Learning science, flashcard systems
**Idea**: Mark cards for review, surface them at spaced intervals to aid retention

### B7: Automatic Literature Review Assistant
**Source**: Academic research tools (PaperBridge, etc.)
**Idea**: Given topic, automatically search, clip, and organize relevant papers on canvas

---

## Implementation Guidelines

### Before Implementing Any Feature:
1. Check if related code already exists (e.g., custom buttons for F2.4)
2. Verify it aligns with core principles (output-as-input, incremental formalization, epistemic actions)
3. Consider cognitive load impact (does it add clarity or clutter?)
4. Check browser API compatibility (Chrome extension constraints)
5. Plan for graceful degradation if AI/network fails

### Testing Requirements:
- Unit tests for pure logic
- E2E tests for user workflows
- Manual testing with realistic content
- Performance testing with large card collections

### Documentation Requirements:
- Update CLAUDE.md with architectural changes
- Add usage examples to README if user-facing
- Update types/card.ts if schema changes
- Log decisions in memory.md

---

## Feature Request Process

When literature review discovers new relevant research:
1. Add observation to memory.md
2. If actionable, add feature here with research source cited
3. Prioritize based on: User value × Feasibility × Alignment with principles
4. Mark status: ❌ Not started | ⚠️ Partial | ✅ Complete
5. Update status as implemented
