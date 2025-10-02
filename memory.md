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
