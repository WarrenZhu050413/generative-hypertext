# IMMEDIATE BUGS & IMPROVEMENTS

## Critical Issues (User-Reported)

### 1. Fix Card Content Scrolling (BLOCKING)

**Problem**: Scrolling inside card content area is broken
**Impact**: Users cannot read full content
**Priority**: P0 - Must fix immediately
**Status**: Not working

### 2. Replace API Key System with Claude Agent SDK

**Current**: Manual API key entry + direct REST API calls (`claudeAPIService.ts`)
**Needed**: Use `@anthropic-ai/claude-agent-sdk` instead. Look at https://docs.claude.com/en/api/agent-sdk/typescript.md for the documentation for the SDK
**Benefits**:

- Simpler authentication
- Better integration with Claude ecosystem
- Follows official patterns
  **Files to Update**:
- Remove: `src/services/apiConfig.ts`, `src/services/claudeAPIService.ts`
- Remove: `src/components/APISettings.tsx`
- Update: `src/services/beautificationService.ts` to use Agent SDK
  **Note**: Keep graceful fallback to mocks when SDK not configured
  Look at

### 3. Persistent Chat in Card Data Structure

**Current**: May not be fully persisting conversation context
**Needed**: Verify all chat conversations, contexts, and history are stored in `Card.conversation` array
**Verification Steps**:

- Check that chat messages save to chrome.storage
- Verify conversation history loads on card re-open
- Ensure multi-turn context is maintained
  **Card Fields**: `conversation?: Message[]` in `src/types/card.ts`

### 4. CSS-Style Resize Handles for Cards

**Current**: Dropdown with S/M/L/XL presets (clunky)
**Needed**: Bottom-right corner drag handle (like CSS `resize`)
**Behavior**:

- Direct drag to resize (no presets)
- Text content should scale/reflow with card size
- Save custom dimensions to `Card.size`
- More intuitive interaction
  **Remove**:
- `sizePreset` dropdown from CardNode header
- `SIZE_PRESETS` from `src/utils/cardSizes.ts`
  **Add**:
- React Flow resize functionality or custom drag handle
- Dynamic text scaling based on card dimensions

### 5. Card Layout Space Allocation

**Problem**: Too much space for UI chrome, not enough for content
**Needed**:

- Increase default space for text content area
- Decrease space for "Continue Chat" button and other UI elements
- Better content-to-chrome ratio
  **Files**: `src/canvas/CardNode.tsx` styles

### 6. Action Buttons on All Card Types

**Problem**: Chat cards and generated cards missing action buttons
**Current**: Only regular clipped cards have "Learn More" and other buttons
**Needed**: All card types (chat, generated, note, image, clipped) should have:

- Custom action buttons
- Button configuration UI
- Consistent interaction model
  **Implementation**: Check `cardType` and ensure buttons render for all types

### 7. Fix Collapse Button to Collapse Entire Card

**Problem**: Collapse button only collapses content inside card, not the card body itself
**Current**: Content area shrinks but card maintains same overall dimensions
**Needed**: When collapsed, entire card should shrink to minimal height (just header visible)
**Behavior**:

- Collapsed: Show only header (title, metadata, action buttons)
- Hide: Content area, footer, tags, all body elements
- Card dimensions should shrink accordingly
- Save collapse state to `Card.collapsed` field
  **Files**: `src/canvas/CardNode.tsx` - update collapse logic and styles

---

# FEATURE BACKLOG

## 1. LLM-Generated Hyperlinks On-the-Fly (11-14h) ✨ AUGMENTED READING - THIS IS THE DREAM

    **Concept**: Highlight any text → Press Cmd+L → LLM instantly generates child card
    that explains/elaborates → Child emanates from parent. Your canvas responds to
    curiosity in real-time. Every phrase becomes a portal to deeper understanding.

    This combines Ted Nelson's "stretchtext", Engelbart's intellect augmentation,
    and Bush's associative knowledge trails into ONE magical interaction.


    ┌─────────────────────────────────────────────────────────────────────┐
    │                    THE MAGIC WORKFLOW                               │
    └─────────────────────────────────────────────────────────────────────┘

    STEP 1: User highlights interesting text
    ┌─────────────────────────────────────────────┐
    │ 📄 Card: Machine Learning Overview        │
    ├─────────────────────────────────────────────┤
    │ Modern ML relies heavily on techniques     │
    │ like ⟪gradient descent⟫ to optimize        │  ← User highlights this
    │ neural networks...                         │
    └─────────────────────────────────────────────┘


    STEP 2: User presses Cmd+L (or right-clicks)
    ┌─────────────────────────────────────────────┐
    │ 📄 Card: Machine Learning Overview        │
    ├─────────────────────────────────────────────┤
    │ Modern ML relies heavily on techniques     │
    │ like ⟪gradient descent⟫ to optimize        │
    │ neural networks...                         │
    │                         ╔═══════════════════════════╗
    │                         ║ ✨ Generate Child Card   ║
    │                         ║ "gradient descent"        ║
    │                         ║                           ║
    │                         ║ Type: ▼ Explanation       ║
    │                         ║ [Generate] [Cancel]       ║
    │                         ╚═══════════════════════════╝
    └─────────────────────────────────────────────┘


    STEP 3: LLM generates content (streaming, 2-3 seconds)
    ╔════════════════════════════════╗
    ║ ⏳ Generating...              ║
    ║                                ║
    ║ Gradient descent is an         ║
    ║ optimization algorithm that    ║
    ║ iteratively adjusts █          ║  ← Streams in real-time
    ╚════════════════════════════════╝


    STEP 4: Child card emanates with golden glow animation
    ┌─────────────────────────────────────────────┐
    │ 📄 Card: Machine Learning Overview        │
    ├─────────────────────────────────────────────┤
    │ Modern ML relies heavily on techniques     │
    │ like gradient descent to optimize          │  ╔════════════════════════════════╗
    │ neural networks...                         │──▶║ 📝 Gradient Descent          ║
    │      ⤷ clickable link now                  │  ║                                ║
    └─────────────────────────────────────────────┘  ║ Gradient descent is an         ║
                                                     ║ optimization algorithm that    ║
                                                     ║ iteratively adjusts parameters ║
                                                     ║ to minimize a loss function... ║
                                                     ║                                ║
                                                     ║ [Generated by Claude ✨]       ║
                                                     ╚════════════════════════════════╝


    ┌─────────────────────────────────────────────────────────────────────┐
    │                  FUNCTIONAL SPECIFICATIONS                          │
    └─────────────────────────────────────────────────────────────────────┘

    FS-1: TEXT SELECTION DETECTION
    ───────────────────────────────
    • Listen to selectionchange events within card content
    • Capture selected text + DOM Range + position offsets
    • Extract surrounding context (100 chars before/after) for better LLM generation
    • Verify selection is within current card boundaries
    • Minimum selection length: 2 characters
    • Handle multi-word and phrase selections

    Implementation: src/utils/textSelection.ts
    - getCardTextSelection(cardId) → TextSelection | null
    - highlightSelection(selection) → visual feedback


    FS-2: KEYBOARD & CONTEXT MENU TRIGGERS
    ───────────────────────────────────────
    Keyboard Shortcuts:
    • Cmd+L (Ctrl+L on Windows) - Generate child from selection
    • Cmd+Shift+L - Generate with type picker modal
    • Esc - Cancel generation modal

    Right-Click Menu:
    • When text is selected, show context menu option
    • "✨ Generate Child Card" → Opens generation modal
    • Options: Explanation | Definition | Deep-dive | Examples


    FS-3: LLM GENERATION PIPELINE
    ──────────────────────────────
    Generation Types:
    • Explanation: General overview (default)
    • Definition: Precise, technical definition
    • Deep-dive: Comprehensive analysis with examples
    • Examples: Practical use cases and applications

    Context-Aware Prompting:
    • Include parent card title, URL, domain
    • Include parent card tags for topical context
    • Include surrounding text (100 chars before/after)
    • Structured JSON response: {title, content, tags}

    Streaming:
    • Real-time display as LLM generates
    • Character-by-character or chunk streaming
    • Cancel button during generation
    • Progress indicator

    Implementation: src/services/childCardGenerator.ts
    - generateChildCard*(request) → AsyncGenerator<string, GenerationResult>


    FS-4: GENERATION MODAL UI
    ──────────────────────────
    Modal Elements:
    • Selected text preview (highlighted)
    • Generation type selector (explanation/definition/deep-dive/examples)
    • Streaming preview pane (shows LLM output in real-time)
    • Loading spinner during generation
    • Actions: [Regenerate] [Accept] [Cancel]

    UX:
    • Auto-dismiss on click outside (accepts generation)
    • Escape key to cancel
    • Enter key to accept
    • Can regenerate with different type
    • Backdrop blur for focus

    Implementation: src/components/GenerateChildModal.tsx


    FS-5: INSTANT EXPANSION WITH EMANATION ANIMATION
    ──────────────────────────────────────────────────
    Card Creation:
    • Generate unique ID for child card
    • Set parentCardId reference
    • Inherit parent's URL, domain, favicon
    • Apply LLM-suggested tags
    • Mark cardType as 'generated'
    • Save generationMetadata (model, prompt, selectedText, timestamp)

    Positioning:
    • Place child 400px to right of parent
    • Same Y-coordinate as parent (aligned horizontally)
    • If space occupied, find next available slot

    Animation Sequence (800ms total):
    1. Child starts at parent position, scale(0.1), opacity 0, blur(10px)
    2. Golden glow effect: box-shadow with rgba(255, 215, 0, 0.8)
    3. Animate to final position with cubic-bezier(0.34, 1.56, 0.64, 1)
    4. Scale to 1, opacity to 1, blur to 0
    5. Fade out glow over 500ms

    Connection Creation:
    • Auto-create arrow from parent → child
    • Store connection in chrome.storage.local
    • Connection type: 'generated' (distinct from manual connections)

    Implementation: src/utils/instantExpansion.ts


    FS-6: EXPANDABLE LINK CREATION
    ────────────────────────────────
    Link Data Model:
    interface ExpandableLink {
      id: string;
      parentCardId: string;
      childCardId: string;
      anchorText: string;        // "gradient descent"
      startOffset: number;        // Position in parent content
      endOffset: number;
    }

    Visual Styling:
    • Underline with distinct color (Chinese red)
    • Hover effect: background highlight
    • Cursor: pointer
    • Flash effect on creation (2-second golden highlight)

    Behavior:
    • Click link → Focus/pan to child card
    • Hover link → Show tooltip with child card preview
    • Multiple links can point to same child

    Storage:
    • Save to chrome.storage.local under 'expandable_links'
    • Reconstruct links when rendering card content

    Implementation: src/utils/expandableLinks.ts


    FS-7: RECURSIVE GENERATION
    ───────────────────────────
    • Children can have their own children
    • Build deep knowledge hierarchies organically
    • Each generation inherits ancestor chain context
    • Example: "gradient descent" → "learning rate" → "adaptive learning rate"

    Ancestor Context:
    • Gather all parent, grandparent, etc. cards
    • Include in LLM prompt for coherence
    • Max depth: 5 levels to prevent context overflow


    ┌─────────────────────────────────────────────────────────────────────┐
    │                    WHY THIS IS REVOLUTIONARY                        │
    └─────────────────────────────────────────────────────────────────────┘

    ✅ ZERO FRICTION
       Curiosity → Answer in 3 seconds. No manual searching, no tab switching.

    ✅ AUGMENTS READING IN REAL-TIME
       Every unfamiliar term becomes instant learning opportunity.

    ✅ CONTEXTUAL INTELLIGENCE
       LLM uses parent card's full context - not generic definitions.

    ✅ VISUAL KNOWLEDGE GRAPH
       Canvas visualizes emerging understanding as you explore.

    ✅ SERENDIPITOUS DISCOVERY
       Following highlights creates unexpected learning pathways.

    ✅ NO PLANNING REQUIRED
       Unlike manual note-taking, this works spontaneously during reading.

    ✅ INFINITELY RECURSIVE
       Deep dives create cascading knowledge hierarchies.

    ✅ CANVAS AS THINKING TOOL
       System amplifies curiosity, creates "trails of association" (Bush, 1945).


    ┌─────────────────────────────────────────────────────────────────────┐
    │                  IMPLEMENTATION PHASES                              │
    └─────────────────────────────────────────────────────────────────────┘

    PHASE 1: Selection & Triggers (2h)
    ───────────────────────────────────
    □ Create textSelection.ts utility
      - getCardTextSelection() with context extraction
      - highlightSelection() visual feedback
    □ Add selectionchange listener to CardNode
    □ Implement Cmd+L keyboard shortcut handler
    □ Add right-click context menu integration
    □ Track currentSelection state in CardNode


    PHASE 2: LLM Generation Service (3h)
    ─────────────────────────────────────
    □ Create childCardGenerator.ts service
      - generateChildCard() AsyncGenerator with streaming
      - buildPrompt() with context awareness
      - parseResponse() JSON extraction
    □ Support 4 generation types (explanation/definition/deep-dive/examples)
    □ Include parent metadata in prompts
    □ Handle API errors gracefully
    □ Unit tests for prompt building


    PHASE 3: Generation Modal UI (2h)
    ──────────────────────────────────
    □ Create GenerateChildModal.tsx component
      - Selected text preview
      - Type selector dropdown
      - Streaming preview pane with auto-scroll
      - Loading spinner during generation
    □ Wire up to childCardGenerator service
    □ Implement streaming state management
    □ Add Regenerate/Accept/Cancel actions
    □ CSS styling with Chinese aesthetic


    PHASE 4: Instant Expansion & Animation (2-3h)
    ──────────────────────────────────────────────
    □ Create instantExpansion.ts utility
      - instantExpandChild() main orchestrator
      - animateEmanation() with golden glow effect
      - flashExpandLink() highlight effect
    □ Implement child card positioning logic
    □ Auto-create connection/arrow parent → child
    □ Trigger canvas refresh event
    □ Test animation timing and smoothness


    PHASE 5: Expandable Links (2h)
    ───────────────────────────────
    □ Define ExpandableLink data model
    □ Create expandableLinks.ts storage utility
      - createExpandableLink()
      - getLinksForCard()
      - deleteLink()
    □ Render links in card content (inject <span> elements)
    □ Add click handler to focus child card
    □ CSS styling for links (underline, hover, flash)
    □ Save/load links from chrome.storage.local


    PHASE 6: Integration & Polish (2-3h)
    ─────────────────────────────────────
    □ Wire all components together in CardNode
    □ Add generationMetadata tracking to Card type
    □ Implement error handling and edge cases
    □ Add loading states and progress indicators
    □ Keyboard shortcut documentation
    □ E2E tests for complete workflow
    □ Performance optimization for large cards


    PHASE 7: Advanced Features (2-3h) - OPTIONAL
    ─────────────────────────────────────────────
    □ Multi-generation mode (select multiple terms, generate all)
    □ Generation history panel (see all LLM-generated cards)
    □ Recursive generation with ancestor context
    □ Link preview tooltips on hover
    □ Batch generation UI
    □ Custom generation prompts (user templates)


    ┌─────────────────────────────────────────────────────────────────────┐
    │                         USE CASES                                   │
    └─────────────────────────────────────────────────────────────────────┘

    USE CASE 1: Research Paper Reading
    ──────────────────────────────────
    Reading: "Neural Architecture Search with Reinforcement Learning"
    → Highlight "differentiable architecture search" → Cmd+L
    → Child card appears with explanation
    → Continue reading
    → Highlight "DARTS" → Cmd+L
    → Another child with deep dive
    Result: Visual map of paper's key concepts built while reading


    USE CASE 2: Learning New Framework
    ───────────────────────────────────
    Reading: React documentation on useEffect
    → Highlight "dependency array" → Cmd+L → Examples generated
    → Highlight "cleanup function" → Cmd+L → When/why to use
    → Highlight "stale closure" → Cmd+L → Deep dive on problem
    Result: Full mental model of useEffect built incrementally


    USE CASE 3: News Article Analysis
    ──────────────────────────────────
    Reading: "Fed raises interest rates to combat inflation"
    → Highlight "federal funds rate" → Cmd+L → Mechanism explained
    → Highlight "quantitative tightening" → Cmd+L → Policy tool breakdown
    → Highlight "dual mandate" → Cmd+L → Historical context
    Result: Canvas reveals economic relationships and context


    USE CASE 4: Code Exploration
    ────────────────────────────
    Reading: Complex Redux codebase
    → Highlight "middleware chain" → Cmd+L → How middleware works
    → Highlight "redux-thunk" → Cmd+L → Async action patterns
    → Highlight "action creator" → Cmd+L → Best practices
    Result: Visual documentation of architecture emerges


    ┌─────────────────────────────────────────────────────────────────────┐
    │                    SUCCESS METRICS                                  │
    └─────────────────────────────────────────────────────────────────────┘

    Usage Metrics:
    • Highlights per card (avg)
    • Generation success rate (accepted vs cancelled)
    • Generation type distribution (explanation vs definition vs deep-dive vs examples)
    • Time from highlight to generation (should be ~3 seconds)

    Quality Metrics:
    • Regeneration frequency (lower = better quality)
    • Child card retention (not deleted immediately)
    • Link click-through rate (how often users revisit generated content)

    Engagement Metrics:
    • Recursive generation depth (children of children)
    • Cards with generated children (% of total cards)
    • Generated cards as % of total knowledge graph

2. Chrome Side Panel Stash (8-12h) - WORKSPACE MANAGEMENT
   - Native Chrome Side Panel for stashed cards
   - Always accessible without cluttering canvas
   - Like browser bookmarks/reading list
   - Restore or delete cards from side panel

3. Custom Button System (12-16h)
   - Per-card and global button configurations
   - Settings UI to add/edit/delete buttons
   - Template variable support ({{content}}, {{title}})

4. Fill-In Feature: Connection-Based Knowledge Synthesis (10-15h) - TREMENDOUSLY EXCITING

   **Concept**: Create a sparse note → Connect to existing notes → AI synthesizes and
   develops the idea using all connected content. Transforms passive storage into
   active thinking partner.

   ┌─────────────────────────────────────────────────────────────────────┐
   │ FILL-IN WORKFLOW DIAGRAM │
   └─────────────────────────────────────────────────────────────────────┘

   Step 1: Create Sparse Note
   ┌─────────────────────────┐
   │ 💡 "Neural networks │ ← User: Cmd+N, types minimal idea
   │ for time series" │
   │ │
   │ [Empty - needs filling] │
   └─────────────────────────┘

   Step 2: Draw Connections to Relevant Notes
   ┌──────────────┐
   │ RNN basics │
   │ (from paper) │
   └──────┬───────┘
   │
   ▼
   ┌──────────────────────────┐ ┌──────────────┐
   │ 💡 Neural networks │◄────────│ LSTM gates │
   │ for time series │ │ (clipped) │
   │ │ └──────────────┘
   │ [Empty - needs filling] │
   └──────────────────────────┘
   ▲
   │
   ┌──────┴───────┐
   │ Forecasting │
   │ techniques │
   └──────────────┘

   Step 3: Trigger Fill-In
   User Actions:
   → Right-click card → "Fill in from connections"
   → Click "🔗 Fill In (3 cards)" button in header
   → Keyboard: Cmd+Shift+F

   Step 4: Configure & Generate
   ┌─────────────────────────────────────────────┐
   │ Fill In from Connections │
   │ │
   │ Connected Cards (3): │
   │ • RNN basics │
   │ • LSTM gates │
   │ • Forecasting techniques │
   │ │
   │ Strategy: ▼ Replace │
   │ ○ Replace - Start fresh │
   │ ○ Append - Add to existing │
   │ ○ Merge - Integrate with existing │
   │ │
   │ Optional Guidance: │
   │ ┌─────────────────────────────────────────┐ │
   │ │ "Focus on practical applications" │ │
   │ └─────────────────────────────────────────┘ │
   │ │
   │ [Generate] [Cancel] │
   └─────────────────────────────────────────────┘

   Step 5: AI Synthesizes Content (Streaming)
   ┌────────────────────────────────────────────┐
   │ 💡 Neural networks for time series │
   │ │
   │ Neural networks are particularly well- │
   │ suited for time series forecasting due to │
   │ their ability to capture temporal │
   │ dependencies...█ │ ← Streaming
   │ │
   └────────────────────────────────────────────┘

   Step 6: Review & Save
   ┌────────────────────────────────────────────┐
   │ 💡 Neural networks for time series │
   │ │
   │ [Fully developed content from synthesis] │
   │ │
   │ Sources: RNN basics, LSTM gates, │
   │ Forecasting techniques │
   │ │
   │ [Save] [Regenerate] [Edit] │
   └────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────┐
   │ FUNCTIONAL SPECIFICATIONS │
   └─────────────────────────────────────────────────────────────────────┘

   FS-1: CONNECTION-BASED CONTEXT GATHERING
   ──────────────────────────────────────
   Given: A card with connections (arrows) to other cards
   When: User triggers "Fill In"
   Then: System gathers all connected cards' content and metadata

   Connection Directions:
   • Incoming: Cards pointing TO this card
   • Outgoing: Cards this card points TO
   • Both: Default behavior (bidirectional)

   Context Format:
   [Connected Card 1: "Title"]
   Source: https://example.com
   Type: clipped

   ## [Card content here...]

   [Connected Card 2: "Title"]
   ...

   FS-2: SYNTHESIS STRATEGIES
   ───────────────────────────
   Three modes of integration:

   REPLACE Strategy:
   • Discard existing content
   • Generate fresh synthesis from all connections
   • Use case: Starting from empty/minimal note

   APPEND Strategy:
   • Keep existing content intact
   • Add new synthesized section below
   • Use case: Progressive elaboration, adding new perspectives

   MERGE Strategy:
   • Intelligently integrate new info with existing
   • Preserve key insights from original
   • Use case: Refining/enriching existing draft

   FS-3: STREAMING GENERATION
   ───────────────────────────
   • Real-time preview as LLM generates
   • Character-by-character streaming display
   • Cancel button during generation
   • Progress indicator (tokens/time estimate)

   FS-4: FILL-IN HISTORY & PROVENANCE
   ────────────────────────────────────
   Track every fill-in operation:

   Card.fillInHistory = [
   {
   timestamp: 1234567890,
   sourceCardIds: ['card1', 'card2', 'card3'],
   strategy: 'replace',
   userPrompt: 'Focus on applications',
   previousContent: '[snapshot before fill-in]'
   }
   ]

   Enables:
   • Undo to previous version
   • Audit trail of how note evolved
   • Re-run with different sources
   • Show "Developed from: Card A, Card B, Card C"

   FS-5: USER GUIDANCE
   ────────────────────
   Optional text input for custom instructions:
   • "Focus on technical details"
   • "Compare and contrast the approaches"
   • "Summarize in 3 bullet points"
   • "Explain like I'm a beginner"

   Passed to LLM as additional context

   FS-6: VISUAL FEEDBACK
   ──────────────────────
   Connection Count Badge:
   ┌─────────────────────┐
   │ Card Title [3] │ ← Shows # of connections
   │ │
   └─────────────────────┘

   Active Generation:
   • Connected cards pulse/glow during generation
   • Progress bar in modal
   • Animated typing effect in preview

   Source Attribution:
   • Footnotes showing which card contributed which info
   • Color-coded highlighting (optional)

   ┌─────────────────────────────────────────────────────────────────────┐
   │ TECHNICAL ARCHITECTURE │
   └─────────────────────────────────────────────────────────────────────┘

   Layer 1: Data Model Extensions
   ───────────────────────────────
   interface Card {
   // ... existing fields
   fillInHistory?: FillInHistoryEntry[];
   }

   interface FillInHistoryEntry {
   timestamp: number;
   sourceCardIds: string[];
   strategy: 'replace' | 'append' | 'merge';
   userPrompt?: string;
   previousContent?: string;
   }

   Layer 2: Services
   ─────────────────
   connectionContextService.ts
   • getConnectedCards(cardId, allCards, direction)
   • buildFillInContext(connectedCards) → merged string

   fillInService.ts
   • fillInFromConnections\*(card, allCards, options) → AsyncGenerator
   • buildSystemPrompt(strategy, tone)
   • buildUserPrompt(card, context, guidance)

   Layer 3: UI Components
   ──────────────────────
   FillInModal.tsx
   • Connected cards preview list
   • Strategy selector (replace/append/merge)
   • Optional guidance textarea
   • Streaming preview pane
   • Save/Cancel/Regenerate actions

   CardNode.tsx Integration
   • Show connection count badge on all cards
   • "🔗 Fill In (N)" button when connections > 0
   • Right-click context menu option
   • Keyboard shortcut: Cmd+Shift+F

   Layer 4: Storage
   ────────────────
   • Save fillInHistory to chrome.storage.local
   • Persist strategy preferences
   • Cache last-used guidance prompts

   ┌─────────────────────────────────────────────────────────────────────┐
   │ INTERACTION FLOWS │
   └─────────────────────────────────────────────────────────────────────┘

   FLOW A: Research Synthesis
   ───────────────────────────
   1. User clips 5 research papers on "transformers in NLP"
   2. Creates new note: "Transformer architectures overview"
   3. Draws arrows from new note to all 5 papers
   4. Clicks "🔗 Fill In (5)"
   5. Selects strategy: Replace
   6. Adds guidance: "Focus on architectural innovations"
   7. Clicks Generate
   8. Reviews streaming synthesis
   9. Saves → Comprehensive overview created in seconds

   FLOW B: Progressive Elaboration
   ────────────────────────────────
   1. User has note: "Product idea: AI tutor" (sparse)
   2. Round 1:
      • Connects to "Market research" card
      • Fill in (Replace) → Gets market context
   3. Round 2:
      • Connects to "Technical feasibility" card
      • Fill in (Append) → Adds technical section
   4. Round 3:
      • Connects to "Competitor analysis" card
      • Fill in (Append) → Adds competitive landscape
   5. Result: Fully developed product proposal

   FLOW C: Concept Integration
   ────────────────────────────
   1. User has draft note: "Memory mechanisms in neural networks"
   2. Discovers new paper on "Neural Turing Machines"
   3. Clips paper, connects to existing note
   4. Fill in (Merge) with guidance: "Integrate NTM concept"
   5. System intelligently weaves NTM info into existing structure
   6. User edits to refine integration
   7. Result: Enhanced note with new perspective

   ┌─────────────────────────────────────────────────────────────────────┐
   │ IMPLEMENTATION PHASES │
   └─────────────────────────────────────────────────────────────────────┘

   PHASE 1: Core Infrastructure (4-5h)
   ────────────────────────────────────
   □ Extend Card interface with fillInHistory
   □ Create connectionContextService
   - getConnectedCards() function
   - buildFillInContext() merger
     □ Create fillInService
   - fillInFromConnections() AsyncGenerator
   - System/user prompt builders
     □ Unit tests for context building

   PHASE 2: UI Components (3-4h)
   ──────────────────────────────
   □ Build FillInModal component
   - Connected cards list preview
   - Strategy selector UI
   - Guidance textarea
   - Streaming preview pane
   - Save/cancel/regenerate buttons
     □ Add connection count badge to CardNode
     □ Add "🔗 Fill In" button (conditional on connections > 0)
     □ CSS styling with Chinese aesthetic

   PHASE 3: Integration & Shortcuts (2h)
   ──────────────────────────────────────
   □ Wire up FillInModal to CardNode
   □ Add right-click context menu option
   □ Implement Cmd+Shift+F keyboard shortcut
   □ Connect to canvas state management
   □ Auto-save fillInHistory to storage

   PHASE 4: UX Polish (2-3h)
   ──────────────────────────
   □ Add pulse/glow animation on connected cards during generation
   □ Implement diff view (side-by-side old vs new)
   □ Add progress indicator during generation
   □ Source attribution footnotes
   □ Undo/history timeline UI
   □ Error handling & edge cases

   PHASE 5: Advanced Features (3-4h) - OPTIONAL
   ─────────────────────────────────────────────
   □ Auto-suggest relevant cards to connect
   □ Connection type labels (supports/contradicts/extends)
   □ Selective card inclusion (checkboxes in modal)
   □ Tone controls (academic/creative/concise)
   □ Export synthesis with citations

   ┌─────────────────────────────────────────────────────────────────────┐
   │ WHY THIS IS POWERFUL │
   └─────────────────────────────────────────────────────────────────────┘

   ✅ Active Knowledge Integration
   Not just storing notes - actively synthesizing new insights

   ✅ Low Cognitive Load
   User just draws arrows, AI does the heavy synthesis work

   ✅ Iterative Thinking Support
   Progressive elaboration through multiple fill-in rounds

   ✅ Preserves Agency
   User controls sources, strategy, can edit results

   ✅ Builds on Existing Infrastructure
   Leverages existing connection/arrow system

   ✅ Complements Other Features
   Works alongside expandable cards, multi-card queries, chat

   ✅ Research-Grounded
   Embodies Ted Nelson's "transclusion" and Bush's "trails of association"

   ┌─────────────────────────────────────────────────────────────────────┐
   │ EDGE CASES & VALIDATION │
   └─────────────────────────────────────────────────────────────────────┘

   EDGE-1: No Connected Cards
   ───────────────────────────
   When: User triggers fill-in on isolated card
   Handle: Show friendly error: "Connect this card to other notes first"
   UI: Disable "Fill In" button when connection count = 0

   EDGE-2: Empty Connected Cards
   ──────────────────────────────
   When: Connected cards have no content
   Handle: Filter out empty cards, show warning if all empty
   UI: Show warning icon next to empty cards in preview list

   EDGE-3: Very Large Context
   ───────────────────────────
   When: 20+ connected cards exceed LLM context window
   Handle: Prompt user to select subset OR summarize each card first
   UI: Warning when context > 50k characters, offer selective inclusion

   EDGE-4: Generation Failure
   ───────────────────────────
   When: LLM API fails mid-stream
   Handle: Show partial result, offer retry
   UI: "Generation incomplete - Retry?" button

   EDGE-5: Conflicting Information
   ────────────────────────────────
   When: Connected cards contradict each other
   Guidance: User prompt: "Compare and highlight differences"
   Result: LLM explicitly notes contradictions

   ┌─────────────────────────────────────────────────────────────────────┐
   │ SUCCESS METRICS │
   └─────────────────────────────────────────────────────────────────────┘

   Usage Metrics:
   • % of notes that use fill-in feature
   • Average connections per fill-in operation
   • Frequency of re-fill (iterative elaboration)
   • Strategy distribution (replace vs append vs merge)

   Quality Metrics:
   • User acceptance rate (save vs discard)
   • Manual edit frequency after generation
   • Length of notes before/after fill-in

   Engagement Metrics:
   • Time from note creation to first fill-in
   • Correlation: fill-in usage vs total cards created
   • Fill-in as % of total card modifications
