# Memory: Continuous Literature Review for NabokovsWeb

## Session Started: 2025-10-01

---

## Core Research Context

### Project: Nabokov Web Clipper
A Chrome extension for capturing web content and organizing it on a visual canvas. Built with React, TypeScript, React Flow, and Claude API integration.

**Citation**: Zhu, F. W., Agrawala, M., & Mysore, G. J. (2024). Nabokov: Organize Web Content with LLM-Powered Visual Canvas. UIST '24 Companion, Article 42, 1-3.

### Research Question (INTERACT)
How do we design interfaces that support **exploratory information seeking** and **non-linear knowledge construction** with LLM-powered tools?

---

## Foundational Principles (from user's notes)

### 1. Output-as-Input Principle
**Source**: Shneiderman (1994) - "Visual Information Seeking: Tight Coupling of Dynamic Query Filters with Starfield Displays"
- **Key insight**: Tight coupling between query components where output fosters input
- **Applied to Nabokov**: Every generated card/element becomes manipulable input for further exploration
- **Why crucial**: Maintains "information scent" during foraging, enables staying in flow state

### 2. Spatial Hypertext & Incremental Formalization
**Source**: Shipman & Marshall (1993-1999)
- **Key insight**: Users didn't use typed links; they used **spatial arrangement** to show relationships
- **Formality Considered Harmful**: Enter info informally, formalize ONLY when structure becomes clear
- **Applied to Nabokov**: Card positioning on canvas reveals emerging organization without premature categorization

### 3. Exploratory Search: Lookup → Learn → Investigate
**Source**: Marchionini (2006) - "Exploratory Search: From Finding to Understanding"
- **Lookup**: Discrete fact-finding (most databases handle this)
- **Learn**: Acquiring knowledge (some specialized tools)
- **Investigate**: Deep synthesis, still mostly manual/mental
- **Applied to Nabokov**: Focus on supporting **investigate** level with UI-as-service for rapid synthesis

### 4. Epistemic Actions
**Source**: Kirsh (1994) - "On Distinguishing Epistemic from Pragmatic Action"
- **Pragmatic actions**: Change world to achieve goal
- **Epistemic actions**: Change world to **improve cognition**
- **Applied to Nabokov**: Element-level interactions are epistemic - they help users think, not just accomplish tasks

### 5. Information Foraging Theory
**Source**: Pirolli & Card (1999)
- **Scent**: Cues that guide information seeking
- **Patches**: Clustered information sources
- **Sensemaking loop**: Iterative foraging + synthesis
- **Applied to Nabokov**: Progressive disclosure maintains scent across foraging-synthesis cycles

### 6. Distributed Cognition & Extended Mind
**Source**: Hutchins (1995), Clark & Chalmers (1998)
- **Key insight**: Cognition doesn't end at skull - extends into artifacts and environment
- **Applied to Nabokov**: Canvas + cards serve as external cognitive architecture
- **Trade-off noted**: Cognitive offloading improves immediate performance but may reduce deep learning

---

## Current System Capabilities

### Implemented
- ✅ Element capture from web pages (Cmd+Shift+E)
- ✅ Spatial canvas with React Flow
- ✅ Card relationships via arrows/connections
- ✅ Claude API integration for chat and generation
- ✅ Screenshot capture and storage (IndexedDB)
- ✅ Card types: clipped, note, generated, image
- ✅ Inline editing with DOMPurify sanitization
- ✅ Custom action buttons with template prompts
- ✅ Beautification service (two modes: recreate-design, organize-content)
- ✅ Image drag-and-drop upload
- ✅ Floating chat windows
- ✅ Keyboard shortcuts for navigation

### Architecture Strengths
- Shadow DOM isolation for content script
- Event-driven refresh pattern (no full page reloads)
- Separation of storage: metadata (chrome.storage) vs screenshots (IndexedDB)
- Non-blocking screenshot capture (graceful failure)
- Progressive enhancement approach

---

## Research Observations Log

### Observation 1: Selection as Primary Interaction Style
**Date**: 2025-10-01
**Source**: Shneiderman (1994), user notes from 2025-10-01
- Hypertext links = "embedded menus"
- Web legitimized browsing strategies based on selection, navigation, trial-and-error
- **Implication for Nabokov**: Element selector is powerful because it leverages web's natural interaction paradigm
- **Possible enhancement**: Make more elements within cards selectable for sub-queries

### Observation 2: Relevance Feedback Resistance
**Date**: 2025-10-01
**Source**: IR literature via Marchionini (2006)
- Evidence shows relevance feedback (judging returned objects → revised query) is powerful
- **Problem**: People unwilling to take extra step in classic turn-taking model
- **Question**: How can Nabokov provide turn-based interaction that feels natural?
- **Possible solution**: Use spatial arrangement as implicit feedback (cards moved together = relevant)

### Observation 3: Browsing = Incidental Learning
**Date**: 2025-10-01
**Source**: "Finding Facts vs. Browsing Knowledge in Hypertext Systems"
- Quote: "End users rationalize inefficient information-seeking strategies by hoping that incidental learning will have a beneficial cumulative effect"
- Browsing is exploratory, depends on **serendipity**, appropriate for ill-defined problems
- **Implication**: Nabokov should embrace "inefficiency" - support wandering, accidental discovery
- **Design principle**: Don't over-optimize for task completion; optimize for cumulative learning

### Observation 4: Touchable Graphics (Hyperties)
**Date**: 2025-10-01
**Source**: User notes on Hyperties system
- Graphics with embedded clickable words → explanations appear
- **Connection to Nabokov**: Current element selector already does this for web pages
- **Enhancement idea**: Generated card content should also have clickable terms that spawn detail cards

### Observation 5: DirectGPT's Speed Gains
**Date**: 2025-09-30
**Source**: DirectGPT CHI 2024 paper
- Participants 50% faster, used 50% fewer & 72% shorter prompts vs ChatGPT
- **Why**: Continuous object representation, reusable prompts as toolbar buttons, manipulable outputs
- **Already in Nabokov**: Custom action buttons, manipulable cards
- **Missing**: Undo mechanisms (noted as important), highlighting changes

### Observation 6: Prompt Reuse as Tools
**Date**: 2025-09-23
**Source**: DirectGPT paper, user notes
- As soon as prompt finishes executing, add as button in toolbar
- **Nabokov partial implementation**: Custom buttons with templates
- **Enhancement needed**: Automatic button creation from successful chat interactions

### Observation 7: Multiple Simultaneous Organizations
**Date**: 2025-10-01
**Source**: Ted Nelson's evolutionary structures concept
- Quote: "Human ideas constantly collapsing and unfolding. Any field is a bundle of relationships subject to twists, inversions, rearrangement"
- **Nelson's solution**: Accept any arrangement users impose, support rearrangement without data loss, allow multiple simultaneous organizations
- **Nabokov current**: Single spatial arrangement (good), tags (good)
- **Missing**: Multiple workspaces/views of same cards, temporal versions of arrangements

---

## Patterns Identified

### Pattern 1: Progressive Disclosure is Key to Managing Cognitive Load
- Overview-detail interfaces (Meridian paper)
- Details on demand (Shneiderman)
- Malleable interfaces that adjust what's surfaced
- **Nabokov status**: Card previews + expand is basic progressive disclosure
- **Opportunity**: Context-aware detail levels based on user task/query

### Pattern 2: Spatial Arrangement Reveals Implicit Structure
- Spatial hypertext (Shipman & Marshall)
- External representations optimize search (Larkin & Simon)
- Distributed cognition uses physical space
- **Nabokov status**: Free-form canvas positioning
- **Opportunity**: Visual clustering algorithms, connection suggestions based on proximity

### Pattern 3: Multi-Modal Reference > Pure Language
- Deictic gestures essential for communication
- Visual analytics: drawing selection boxes > describing coordinates
- Brickify: "light red" vs "orange" - naming inconsistency problem
- **Nabokov status**: Element selector uses visual selection
- **Opportunity**: Within-card visual reference for follow-up queries

### Pattern 4: Collaboration Between Human and AI Requires Common Ground
- Conversational grounding research (2024): LLMs 3x less likely to initiate clarification
- Boundary objects: shared representation, different understandings
- **Nabokov status**: Cards serve as boundary objects
- **Opportunity**: Better grounding through persistent conversation context anchored to cards

---

## Questions to Explore

### Q1: How to support Nelson's "multiple simultaneous organizations"?
- Current: Single canvas with one spatial arrangement
- Possible: Workspace tabs, saved views, temporal snapshots
- Research needed: Systems that implemented this successfully?

### Q2: How to make spatial arrangement a feedback mechanism?
- Current: Manual card positioning
- Possible: Track proximity over time, suggest connections, auto-cluster
- Research needed: Visual analytics literature on implicit feedback from spatial arrangement

### Q3: How to enable touchable graphics within generated content?
- Current: Cards are atomic units
- Possible: Make terms within cards clickable → spawn detail cards
- Research needed: Inline annotation systems, marginalia tools

### Q4: How to balance cognitive offloading vs. deep learning?
- Research shows: Offloading improves performance but may reduce retention
- Design tension: Support exploration vs. ensure understanding
- Research needed: Learning science on scaffolding withdrawal, desirable difficulties

### Q5: How to implement reversible operations and change highlighting?
- DirectGPT emphasized this
- Current: No undo for card generation, no visual diff
- Research needed: Version control UIs, diff visualization for rich content

---

## Next Research Directions

### Direction 1: Spatial Hypertext + LLMs
- Search for: Recent work combining spatial hypertext concepts with generative AI
- Why: Core Nabokov paradigm, need to see if others have explored this
- Tools: WebSearch first, then Exa for code examples if needed

### Direction 2: Incremental Formalization + Generative UI
- Search for: Systems that generate UI elements dynamically based on emerging structure
- Why: Nabokov generates cards, but could generate other UI affordances
- Anthropic's "Imagine with Claude" (Heli) is relevant

### Direction 3: Information Foraging + AI-Augmented Browsing
- Search for: Recent work on AI tools for information foraging, sensemaking
- Why: Nabokov is fundamentally a foraging/sensemaking tool
- Look for: PaperBridge, CorpusStudio, AbstractExplorer papers

### Direction 4: Annotation + Discussion Scaffolds
- Search for: Social annotation tools, collaborative marginalia
- Why: User notes mentioned annotation scaffolds help learners apply strategies
- Look for: Hypothesis, Perusall, Diigo, academic research on collaborative annotation

### Direction 5: End-User Programming with LLMs
- Search for: Programming by Example (PBE) + LLMs, malleable software + AI
- Why: Nabokov manipulates generated elements; could support user-defined automations
- Geoffrey Litt's work on LLMs + malleable software

---

## Meta-Notes on Continuous Research Process

This memory.md file is updated continuously by a two-agent system:
1. **Search Agent**: Queries literature using WebSearch (primary), supplemented by Exa/Anna's Archive when needed
2. **Thinking Agent**: Synthesizes findings, connects to existing knowledge, proposes features

The process follows: Search → Synthesize → Document → Identify Gaps → Search...

All interesting observations go here. All actionable features go to features.md.

---

## Research Session 1: 2025-10-01 Evening

### Search Round 1: Foundational Topics

#### Search 1: Spatial Hypertext + LLMs
**Query**: "spatial hypertext LLMs generative AI 2024 2025"
**Key Finding**: Most results focused on **geospatial AI** (geographic data, urban planning) rather than spatial hypertext systems
**Relevant Results**:
- **Spatial Text Rendering (STR)** - March 2025: Technique for preserving structural relationships in documents for LLM processing. Bridges gap between complex documents (financial, legal) and text-only LLMs by maintaining spatial layout.
- **Google Geospatial Reasoning**: Gemini LLMs managing complex geospatial data through natural language, generating insights in agentic workflows
- **Generative Spatial AI for Urban Digital Twins** - Jan 2025: Large Flow Model for urban planning using Foundation Models

**Analysis**: The term "spatial" in current AI research primarily means "geographic/geometric" not "spatial arrangement as interface paradigm". Traditional spatial hypertext (Shipman/Marshall) appears disconnected from current LLM research. **Opportunity**: Nabokov may be exploring relatively novel territory combining spatial hypertext UI with LLMs.

**Question raised**: Why hasn't spatial hypertext paradigm been integrated with LLMs yet? Possible reasons: (1) hypertext community small, (2) LLM researchers focused on chat UIs, (3) technical challenges of spatial rendering in web contexts.

#### Search 2: Incremental Formalization + Generative UI
**Query**: "incremental formalization generative UI dynamic interface"
**Key Finding**: **Active research area!** CHI 2025 has relevant papers.
**Critical Paper Found**:
- **"Generative and Malleable User Interfaces with Generative and Evolving Task-Driven Data Model"** - CHI 2025
  - LLMs interpret prompts → generate task-driven data model → dynamically evolving UIs
  - UI adapts to users' changing information needs
  - **Challenge identified**: "Need for continuous prompting to make incremental changes"
  - **Our advantage**: Nabokov's spatial canvas + card model may sidestep this - cards persist, incremental changes are new cards

**Industry Perspective** (NN/g, a16z):
- Shift to "outcome-oriented design" - designers define constraints, AI generates UI
- Vercel AI SDK has "Generative UI" primitives
- Recognized as "the future" but implementation patterns still emerging

**Connection to Nabokov**: We're doing incremental formalization through card generation. Each new card is incremental formalization of user's evolving understanding. Unlike systems requiring "continuous prompting," our cards persist and accumulate.

**Action**: Need to read full CHI 2025 paper - may have implementation patterns we can learn from.

#### Search 3: Information Foraging + AI-Augmented Browsing
**Query**: "information foraging AI-augmented browsing sensemaking tools"
**Key Finding**: **Multiple relevant systems exist!** Active research area.

**Critical Systems Found**:

1. **ForSense** - Browser extension for online research
   - Guided by sensemaking theory
   - Integrates multiple stages of research (foraging + structuring)
   - "Machine assistance by leveraging neural-driven machine reading"
   - Published in ACM TIIS (Transactions on Interactive Intelligent Systems)
   - **Difference from Nabokov**: More focused on reading assistance, less on spatial organization

2. **Orca** - AI-augmented prototype browser
   - Novel interactions for "exploration, operation, organization, and synthesis of web content at scale"
   - Evaluations showed "increased appetite for information foraging"
   - Enhanced user control and flexibility in sensemaking
   - **Similarity to Nabokov**: Focus on organization + synthesis, web content
   - **Difference**: Full browser vs. extension

3. **DroidRetriever** - Mobile sensemaking system
   - Cross-application information retrieval
   - Natural language commands → navigate interfaces, capture screenshots, extract/integrate info
   - **Similarity**: Screenshot-based, information integration
   - **Difference**: Mobile-first, cross-app vs. web-focused

4. **InForage** - RL framework (very recent, 2025)
   - Formalizes retrieval-augmented reasoning as information-seeking process
   - Explicitly rewards intermediate retrieval quality
   - LLMs iteratively gather and integrate through adaptive search
   - **This is theoretical/algorithmic work, not a user-facing tool**
   - **Potential application**: Could inform how Nabokov's card generation decides what to retrieve

**Theoretical Foundation Confirmed**:
- "Foraging and structuring are intertwined phases"
- Foraging = gather from diverse sources
- Structuring = schematize into coherent formats (tables, trees)
- **Nabokov's spatial canvas is a structuring interface for foraged content**

**Key Insight**: We're in good company - multiple research groups building AI-augmented foraging tools. But **Nabokov's unique angle**: Spatial arrangement + generative cards + element-level capture.

#### Search 4: Epistemic Actions + Human-AI Interaction
**Query**: "epistemic actions human-AI interaction exploratory search"
**Key Finding**: **Very active philosophical + HCI research**, especially around epistemic agency

**Critical Concepts**:

1. **Epistemic Agency** = Individual's control over personal beliefs
   - Seven dimensions: prediction, decision-making, perception, memory, counterfactual thinking, belief updating, meta-reflection
   - **Concern in AI context**: Conversational AI may threaten epistemic agency through manipulation
   - **Nabokov implication**: Spatial canvas + persistent cards may **preserve epistemic agency** better than chat because user controls arrangement, persistence, connections

2. **Epistemic Relationships are Dynamic** (2025 research)
   - Not static roles (human vs. AI)
   - Context-dependent co-construction of knowledge
   - Need frameworks capturing how humans + AI co-construct knowledge
   - **Nabokov alignment**: Cards as boundary objects, human arranges spatially, AI generates content, together construct understanding

3. **Interaction Patterns in AI-Assisted Learning**:
   - **AISQ** (AI-led Supported Exploratory Questioning): Structured, guided, supportive
   - **LII** (Learner-Initiated Inquiry): Inquiry-driven, exploratory, engaging
   - **Nabokov supports both**: Custom buttons = AISQ, Open chat = LII

4. **Epistemic Uncertainty vs. Aleatoric Uncertainty**:
   - Aleatoric: Inherent variability in outcomes (randomness)
   - Epistemic: Limitations in AI system's knowledge (knowable but unknown)
   - Communicating these types affects user trust
   - **Nabokov opportunity**: Could indicate confidence levels in generated cards

**Philosophy Papers Found** (recent 2025):
- "AI and Epistemic Agency: How AI Influences Belief Revision"
- "The Manipulation Problem: Conversational AI as a Threat to Epistemic Agency"
- "Reflection-Bench: Evaluating Epistemic Agency in Large Language Models"

**Key Insight**: Strong philosophical concern that conversational AI reduces human epistemic agency. **Nabokov's design may be more epistemically empowering** because:
- User controls spatial arrangement (agency over organization)
- Cards persist (not transient chat)
- User decides which cards to generate, when (agency over knowledge construction)
- Multiple cards allow comparison (agency over belief updating)

---

### Synthesis from Round 1

#### What We Learned:

1. **Nabokov may be in relatively unexplored territory** combining spatial hypertext paradigm with LLMs (most "spatial AI" is geospatial, not UI)

2. **Generative UI is hot topic** (CHI 2025, industry), with incremental formalization as recognized challenge - our card-based approach may offer solution

3. **AI-augmented browsing/foraging is active research area** with multiple systems (ForSense, Orca, DroidRetriever) - we should study these for design patterns

4. **Epistemic agency is major concern** in human-AI interaction research - Nabokov's design may preserve agency better than chat-based systems

#### Gaps Identified:

1. Need to **read full CHI 2025 Generative Malleable UI paper** - likely has implementation insights
2. Need to **find ForSense, Orca papers** - understand their interaction patterns
3. Need to explore **annotation + sensemaking tools** (Hypothesis, Perusall) - may inform inline annotation feature
4. Need to search **"spatial arrangement interface" + "knowledge construction"** - find theoretical grounding for our canvas paradigm
5. Need to explore **"boundary objects" + "collaborative sensemaking"** - cards as boundary objects between human + AI

#### Features to Consider (documented in features.md):

Based on these findings, several features gain support:
- F1.3 (Multiple Workspaces) - aligns with generative UI adaptability
- F2.3 (Spatial Proximity as Feedback) - aligns with foraging theory
- F4.1 (Inline Annotations) - aligns with sensemaking research
- F5.1 (Streaming Follow-ups) - aligns with epistemic agency (but must preserve user control)
- New: **Epistemic Confidence Indicators** - show AI uncertainty levels

---

### Next Search Targets (Round 2):

1. Find and read **CHI 2025 Generative Malleable UI full paper**
2. Search for **ForSense, Orca, DroidRetriever full papers**
3. Search **"spatial arrangement" + "sensemaking" + "interface"**
4. Search **"annotation tools" + "collaborative learning"**
5. Search **"boundary objects" + "CSCW" + "AI"**
6. Search **Ted Nelson evolutionary structures implementation**
7. Search **"prompt reuse" + "end-user programming"**

---

### Thinking Agent Synthesis (Round 1)

**Completed**: Comprehensive analysis of findings, architectural proposals, and strategic recommendations

**Three Most Impactful Insights**:

1. **Spatial Hypertext + LLMs is Unexplored Territory**
   - Competitive advantage: NabokovsWeb pioneering novel interaction paradigm
   - No recent papers combining Shipman/Marshall spatial hypertext with generative AI
   - Position explicitly as bridging this gap

2. **Cards Preserve Epistemic Agency Better Than Chat**
   - Addresses ethical concerns about AI manipulation
   - User controls arrangement, persistence, generation timing
   - Clear differentiation from ChatGPT-style interfaces

3. **Incremental Formalization Through Card Accumulation Solves Known Problems**
   - CHI 2025 identified "continuous prompting" as challenge
   - Cards persist and accumulate → context embedded in spatial arrangement
   - Alternative architectural pattern to generative UI

**Proposed Architectural Improvements**:

1. **Multi-Workspace Architecture** (HIGH priority)
   - Extend storage schema with workspace array
   - Same card in multiple workspaces, different positions
   - Workspace templates for different activities

2. **Spatial Proximity as Intelligent Feedback** (MEDIUM-HIGH priority)
   - DBSCAN clustering on card positions
   - Track stability over time
   - Non-intrusive suggestions for connections

3. **Contextual Card Detail Levels with Mode Detection** (MEDIUM priority)
   - Detect foraging vs. sensemaking mode from user actions
   - Adapt UI detail levels based on mode
   - Foraging: minimal detail, rapid capture
   - Sensemaking: preview detail, connections visible

**Risks & Mitigation**:

1. **Cognitive Offloading vs. Deep Learning**
   - Risk: Over-helpful AI reduces engagement
   - Mitigation: Optional "Learning Mode", reflection prompts, progressive scaffolding

2. **Spatial Arrangement Complexity at Scale**
   - Risk: 100+ cards become overwhelming
   - Mitigation: Hierarchical workspaces, semantic zoom, temporary context collapse

3. **LLM-Generated Connections Override User Understanding**
   - Risk: AI-imposed structure violates incremental formalization
   - Mitigation: Suggestions not assertions, explain reasoning, easy dismiss

4. **Multiple Workspaces Fragment Knowledge**
   - Risk: Inconsistent annotations, lost global context
   - Mitigation: Canonical card state, cross-workspace view, workspace-specific annotations

**Implementation Roadmap**:

**Immediate (this sprint)**:
- Read CHI 2025, ForSense, Orca papers
- Prototype multi-workspace MVP (2 workspaces max)
- Implement epistemic confidence indicators

**Short-term (2-4 weeks)**:
- Build spatial proximity analysis (background service)
- Implement undo/redo system (critical foundation)

**Medium-term (1-2 months)**:
- Develop mode detection system (foraging vs. sensemaking)
- Add clickable terms (touchable graphics)
- Publish research findings

**Strategic Positioning**:

Core value proposition: **"Spatial thinking environment that preserves human epistemic agency while leveraging AI generative power"**

Unique position:
- Interface: Spatial hypertext (not chat, not linear)
- Cognitive model: Incremental formalization through persistent artifacts
- AI role: Generative assistant respecting user's organizational authority
- Foundation: Information foraging + distributed cognition + epistemic actions

Key differentiators:
1. Epistemic empowerment (user controls structure)
2. Spatial intelligence (arrangement reveals understanding)
3. Incremental formalization (start informal, formalize when ready)
4. Fractal exploration (element → card → detail → deeper)

**Publication Opportunities**:
1. "Spatial Hypertext Meets Large Language Models" (CHI/UIST/DIS)
2. "Preserving Epistemic Agency in AI-Augmented Knowledge Work" (ACM ToCHI)
3. "Incremental Formalization Through Persistent Artifacts" (UIST)

---
