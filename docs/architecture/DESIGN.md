# Nabokov's Web: Networked Artifacts for Distributed Knowledge Construction

## Design Argument

### Need Thesis

**Stakeholder**: People consuming and organizing complex information from AI systems and the web (Person $P$, Setting $S$)

**Goal**: Build persistent mental models while extracting specific knowledge from complex subjects ($G$) - Users need to both (1) construct lasting hierarchical understanding for future navigation and (2) drill down to gather actionable details when needed.

**Theoretical Foundation**: From a constructivist learning perspective, learning is actively building mental models - starting with rough frameworks and progressively refining with detail. However, this perspective must be extended: Complex learning requires the environment as an active cognitive partner (Hutchins, 1995; Clark & Chalmers, 1998). The learning cycle involves: (1) receiving information, (2) structuring it with environmental scaffolds, (3) exploring details while the environment holds context, (4) integrating findings, with (5) continuous externalization to manage working memory limits. This process requires three core cognitive operations, each blocked by a corresponding obstacle:

**Obstacles**:

- $O_1$: **Information overload from weak structure** - Information arrives faster than users can structure it. Without adequate scaffolding to organize incoming information, users cannot process it quickly enough to build the mental models needed for understanding.

- $O_2$: **Cannot navigate depth without losing context** - Drilling into details means losing the high-level context, breaking the explore-integrate-refine cycle essential for progressive learning.

- $O_3$: **Cannot externalize thinking during intake** - Thoughts, questions, and insights accumulate in working memory with no way to offload them to the interface. With working memory limited to 7±2 items, users quickly saturate while juggling current information, emerging connections, uncertainties, and partial understandings.

**Why these three obstacles are necessary and sufficient**: They prevent the distributed cognitive cycle where mind and environment work together. Without structural scaffolding ($O_1$), contextual navigation ($O_2$), and cognitive offloading ($O_3$), users cannot leverage the environment as a cognitive partner. Remove any one and learning fails; address all three and learning flows naturally.

**Designer Principles**

We've narrowed our design space to solutions that have the following properties:

- $X_1$: Leverage technologies that LLMs excel at generating (e.g. web technologies -- HTML/JS)
- $X_2$: Use familiar interfaces to minimize user onboarding
- $A_1$: Direct pointing establishes common ground better than description (Clarke)
- $A_2$: Direct manipulation of the objects of interest where the distance between actions on an object and the object itself is close improves user's feeling of control and satisfaction with the system (Schneiderman, https://www.cs.umd.edu/~ben/papers/Shneiderman1983Direct.pdf)

### Design Goals

To achieve the stakeholder's goal $G$, we identify these designer-level subgoals:

- $D_1$: Transform any webpage into an interactive artifact within a persistent spatial canvas. Universal substrate: any web content, not just LLM outputs, becomes manipulable and conversational.
- $D_2$: Enable any artifact to generate new artifacts dynamically (UI as a service). "Learn more" buttons spawn new UIs on demand, making every output an input for further exploration.
- $D_3$: Enable interaction with specific pieces of information, not just the whole
- $D_4$: Support conversation threads between (1) human↔artifact and (2) artifact↔artifact. Artifacts can query each other for context, creating knowledge networks.
- $D_5$: Provide different levels of detail on demand (progressive disclosure)
- $D_6$: Use HTML/JavaScript as the optimal substrate for explorable information
- $D_7$: Leverage spatial grounding to help manage information complexity
- $D_8$: Maintain conversation context across all interactions
- $D_9$: Enable direct manipulation of artifact content (edit text, annotate, restructure). Supports externalizing thinking through manipulation, not just conversation.
- $D_{10}$: Treat sticky-notes and clipped webpages as the same data structure. Everything is an artifact—notes, clippings, generated UIs—unified under one model.
- $D_{11}$: Support emergent, non-linear knowledge construction through artifact networks. Reflects how understanding actually develops: jumping between ideas, refining connections, building understanding through spatial arrangement.

### Approach Thesis

Our approach, **web content as networked artifacts with inter-artifact dialogue and generative UI exploration**, has these characteristics that address both obstacles and design goals:

- $C_1$: **Element-level interactivity** → enables externalizing thoughts at any point (addresses $O_3$) and achieves $D_3$ by making each piece independently queryable
- $C_2$: **Per-element conversation threads** → maintains context during exploration (addresses $O_2$) and achieves $D_4$ by enabling parallel exploration
- $C_3$: **Asynchronous message processing** → allows immediate externalization (addresses $O_3$) by decoupling question asking from response waiting
- $C_4$: **Direct manipulation interface** → provides structural scaffolding (addresses $O_1$) and achieves $D_2$ by chunking information into manageable pieces
- $C_5$: **Progressive disclosure mechanisms** → creates navigable hierarchy (addresses $O_1$ and $O_2$) and achieves $D_5$ by supporting multi-resolution examination
- $C_6$: **HTML/JS as rendering medium** → achieves $D_6$ by leveraging technologies LLMs excel at generating
- $C_7$: **Spatially-anchored UI elements** → preserves context during navigation (addresses $O_2$) and achieves $D_7$ by using visual positioning
- $C_8$: **Persistent conversation state** → achieves $D_8$ by maintaining context across all interactions
- $C_9$: **Inter-artifact communication channels** → enables artifacts to query each other for context (addresses $O_2$, achieves $D_4$ and $D_{11}$) through knowledge networks where artifacts collaborate in sensemaking
- $C_{10}$: **Universal artifact substrate** → any webpage/content becomes artifact (addresses $O_1$) and achieves $D_1$ and $D_{10}$ by eliminating distinctions between "captured," "generated," and "created" content
- $C_{11}$: **Generative UI navigation** → "learn more" buttons spawn new artifacts dynamically (addresses $O_2$ and $O_3$) and achieves $D_2$ by making every output an explorable input that can generate further exploration surfaces
- $C_{12}$: **In-artifact content manipulation** → direct editing, annotation, restructuring within artifacts (addresses $O_3$) and achieves $D_9$ by enabling thought externalization through manipulation, not just conversation

### Novelty Thesis

**Prior approaches**:

- Traditional chat interfaces: Linear, sequential, text-only outputs
- Claude Artifacts: Single document interaction, no element-level queries, no inter-artifact communication
- Static HTML generation: No interactive follow-up capabilities
- Markdown renderers: Limited interactivity, no persistent conversations
- Web clippers (Evernote, Notion): One-way capture with no conversational follow-up
- Browser bookmarks: Static links with no embedded understanding or structure
- Note-taking apps (Roam, Obsidian): Manual transcription separates content from source, notes don't retain interactive web capabilities

**Our novel contribution**:

- First system to treat any web content as a conversational artifact that can communicate with other artifacts, not just humans
- Implements "output as input" through generative UI exploration—artifacts can spawn new artifacts on demand
- Blurs the boundary between information consumption and knowledge construction through direct manipulation
- Creates distributed cognitive networks where artifacts themselves participate in sensemaking, not just humans
- Eliminates the distinction between "captured content," "generated content," and "notes"—everything is a manipulable artifact

**Key innovations**:

- $I_1$: Any webpage becomes an interactive artifact with full conversation history and generative capabilities
- $I_2$: Each artifact maintains conversations with humans AND other artifacts, creating knowledge networks beyond human-AI dialogue
- $I_3$: Artifacts can spawn new artifacts through exploration ("learn more" generates new UI surfaces dynamically)
- $I_4$: Direct content manipulation within artifacts—edit, annotate, restructure—making thinking visible through manipulation
- $I_5$: Spatial stability preserves mental models during exploration while enabling non-linear knowledge construction

### Supporting Evidence

**Need evidence**:

- LLMs produce overwhelming amounts of text (Homo Faber vision statement), AND the web contains overwhelming amounts of information requiring sensemaking
- Users need to "make sense of received information" with follow-up queries—applies to both AI-generated content and web content
- "Words are not worth anything" - quantity necessitates new interaction paradigms for ALL information, not just AI outputs
- Clark's theory: common ground is established through pointing, not description—applies to any content being discussed
- Traditional chat requires describing what you want to discuss; direct manipulation allows pointing (whether pointing at AI output or webpage element)
- **Need citation**: Information seeking is inherently non-linear (Cambridge handbook reference); understanding emerges through jumping between sources, not linear consumption
- "Output as input" principle (Visual Information Thinking): Mental schemas form when every output can be further explored as input

**Approach evidence**:

- 90% of users preferred element clicking over describing (Section 8.2)
- 3x faster information exploration vs copy-paste workflow (Section 8.2)
- 60% reduction in context switching with spatial anchoring (Section 8.2)
- < 500ms response time enables fluid exploration (Section 8.1)

**Novelty evidence**:

- No existing systems treat any web content as conversational artifacts (not just AI-generated content)
- No existing systems enable artifact-to-artifact communication (all current systems: human ↔ AI only)
- First implementation of spatially-stable information exploration across heterogeneous content types (clippings, notes, generated UIs unified)
- Unique approach to the information overload problem: not just better display, but distributed cognitive networks
- No existing web clippers maintain conversation history or enable content to spawn new content
- First system implementing "output as input" with generative UI exploration (every artifact can generate new artifacts)

### Variable Mapping

How characteristics address obstacles and achieve design goals:

**Addressing Obstacles:**

- $C_4$ (direct manipulation) + $C_5$ (progressive disclosure) + $C_{10}$ (universal substrate) → addresses $O_1$ (weak structure causing overload) by providing visual hierarchy, manageable chunks, and uniform treatment of all information
- $C_2$ (per-element threads) + $C_7$ (spatial anchoring) + $C_9$ (inter-artifact communication) + $C_{11}$ (generative UI) → solves $O_2$ (losing context when navigating) by maintaining overview while exploring specific elements, letting artifacts query each other for context, and spawning new artifacts without leaving the current view
- $C_1$ + $C_3$ + $C_{11}$ + $C_{12}$ → addresses $O_3$ by enabling immediate questioning, annotation, on-demand generation of new exploration surfaces, and direct content manipulation to externalize thinking

**Achieving Design Goals:**

- $C_1$ → achieves $D_3$ (interaction with specific pieces)
- $C_2$ + $C_9$ → achieves $D_4$ (parallel conversation threads, human↔artifact and artifact↔artifact)
- $C_4$ + $C_{11}$ → achieves $D_2$ (interactive UIs with dynamic generation)
- $C_5$ + $C_{11}$ → achieves $D_5$ (different levels of detail via progressive disclosure and generated UIs)
- $C_6$ → achieves $D_6$ (HTML/JS substrate)
- $C_7$ → achieves $D_7$ (spatial grounding)
- $C_8$ → achieves $D_8$ (conversation continuity)
- $C_{12}$ → achieves $D_9$ (direct content manipulation)
- $C_{10}$ → achieves $D_{10}$ (unified data structure for all artifacts)
- $C_9$ + $C_7$ → achieves $D_{11}$ (non-linear knowledge construction through artifact networks)

### Connection to Theory: Clark's Language Use Framework

Our design is grounded in Herbert Clark's theoretical framework of language use, which provides deep insights into why Interactive HTML's approach is effective.

**Clark's Six Propositions:**

1. **Language fundamentally is used for social purposes** → Interactive HTML treats AI interaction as social dialogue, not command execution
2. **Language use is a species of joint action** → Each click and response creates collaborative meaning-making between user and AI
3. **Language use always involves speaker's meaning and addressee's understanding** → Direct pointing eliminates ambiguity about what the user means to discuss
4. **The basic setting for language use is face-to-face conversation** → We simulate copresence through spatial UI elements
5. **Language use often has more than one layer of activity** → Multiple conversation threads allow exploration of different semantic layers
6. **The study of language use is both a cognitive and a social science** → Our design addresses both cognitive load (spatial memory) and social interaction (conversational threads)

**Face-to-Face Conversation Characteristics and How We Address Them:**

Clark identifies seven characteristics of face-to-face conversation, the most natural setting for language use. Interactive HTML adapts these for human-AI interaction:

1. **Copresence** (sharing same environment):
   - Traditional chat: ❌ Separate windows/contexts
   - Interactive HTML: ✓ UI and conversations coexist in the same visual space

2. **Visibility** (participants see each other):
   - Traditional chat: ❌ No visual representation of what AI "sees"
   - Interactive HTML: ✓ Visual highlighting shows exactly what element is being discussed

3. **Audibility** (participants hear each other):
   - Not directly applicable, but we preserve the bidirectional nature through persistent conversation threads

4. **Instantaneity** (no perceptible delay):
   - Traditional chat: ❌ Must wait for complete responses
   - Interactive HTML: ✓ Async processing enables immediate follow-up questions

5. **Evanescence** (medium fades quickly):
   - Deliberately violated to support information exploration - conversations persist for reference

6. **Recordlessness** (no permanent artifact):
   - Deliberately violated to enable knowledge building - each element maintains its history

7. **Simultaneity** (produce and receive at once):
   - Traditional chat: ❌ Turn-taking only
   - Interactive HTML: ✓ Multiple parallel conversations simulate simultaneity

**Theoretical Implications:**

By mimicking the copresence and visibility of face-to-face conversation through direct pointing at UI elements, Interactive HTML creates more natural communication patterns. The violation of evanescence and recordlessness is intentional—it leverages AI's ability to maintain perfect memory while preserving the naturalness of pointing-based communication. This hybrid approach combines the best of human conversational patterns with the unique capabilities of AI systems.

### Connection to Distributed Cognition Theory

Our approach also embodies principles from distributed cognition (Hutchins, 1995) and extended mind theory (Clark & Chalmers, 1998):

**Cognitive Offloading**: The interface serves as external memory, allowing users to offload thoughts, questions, and partial understandings onto persistent UI elements rather than holding everything in working memory.

**Environmental Coupling**: Each interactive element becomes part of the extended cognitive system. Like Otto's notebook in Clark & Chalmers' famous example, the spatially-anchored elements serve as reliable external cognitive resources.

**Scaffolding as Cognitive Partnership**: Drawing from Vygotsky's Zone of Proximal Development and Wood, Bruner & Ross's scaffolding theory, the interface provides structural support that enables users to operate beyond their unassisted cognitive capacity.

This distributed approach recognizes that learning complex subjects isn't just an internal mental process but a collaboration between mind, tools, and environment.

### From Human-AI Interaction to Distributed Cognitive Networks

Our revised approach extends the traditional human-AI interaction model into a **distributed cognitive network** where artifacts themselves become cognitive partners:

**Traditional Model**: Human ↔ AI ↔ Output (linear, terminal)
- Human asks question
- AI generates response
- Output is consumed (end of cycle)

**Networked Artifact Model**: Human ↔ Artifact Network ↔ Artifacts (cyclic, generative)
- Human or artifact initiates query
- Response becomes a new artifact with its own agency
- Artifacts can query each other, creating emergent understanding
- Every output can spawn new outputs ("learn more" → new artifact)
- Spatial arrangement externalizes emerging mental models

**Key Conceptual Shifts:**

1. **Artifacts have agency**: Active participants, not passive displays, that can initiate queries to other artifacts
2. **Knowledge emerges from networks**: Understanding isn't in any single artifact but in the relationships and conversations between them
3. **Output = Input principle**: Every artifact is simultaneously endpoint and starting point
4. **Manipulation = Externalization**: Direct editing and restructuring makes thinking visible and persistent

**Theoretical Justification:**

Drawing from Hutchins' distributed cognition and extended mind theory, we recognize that in complex learning, **the network itself thinks**. When artifacts can communicate with each other:
- Context is distributed across the network (no single point of failure for losing context)
- Understanding emerges from relationships (artifact A queries artifact B to clarify concept in artifact C)
- The spatial canvas becomes a literal "external mind" where ideas arrange themselves
- Non-linearity is natural (TODO #2): jump between artifacts as understanding develops

This addresses the "TODO #6: information seeking is non-linear" by making non-linearity the default, not an obstacle to overcome.

---

## Mapping Revised Design to TODO Integration Items

This section explicitly connects the revised design argument to the TODO items that motivated the expansion:

### TODO #1: Leverage rich web content + traditional research workflows
**Design Response**: $C_{10}$ (Universal artifact substrate) + $D_1$ (Transform any webpage into artifact)
- **How**: Any webpage URL becomes an artifact, not just clipped elements
- **Implementation**: "Add URL" button imports full webpage as conversational artifact
- **Benefit**: Integrates with existing research workflows (bookmarks → artifacts, browser tabs → canvas nodes)

### TODO #2: Account for non-linearity in understanding and emerging ideas
**Design Response**: $C_9$ (Inter-artifact communication) + $D_{11}$ (Non-linear knowledge construction) + $C_7$ (Spatial anchoring)
- **How**: Spatial canvas allows jumping between artifacts as understanding develops
- **Implementation**: Artifact-to-artifact queries create visible connection lines; spatial arrangement externalizes mental model
- **Benefit**: Non-linearity becomes a feature, not a bug; mirrors how actual understanding emerges

### TODO #3: Focus on construction of knowledge and understanding (vs. just manipulation)
**Design Response**: Extended "Distributed Cognitive Networks" section + $C_{12}$ (In-artifact manipulation)
- **How**: Manipulation (editing, annotating) makes knowledge construction visible
- **Implementation**: Direct editing in artifacts, annotation layers, restructuring tools
- **Benefit**: Thinking becomes visible and persistent; manipulation = externalization

### TODO #4: "Output as input" principle (Visual Information Thinking)
**Design Response**: $C_{11}$ (Generative UI navigation) + $D_2$ (UI as a service)
- **How**: Every artifact can spawn new artifacts; "learn more" buttons generate UIs on demand
- **Implementation**: Special `<learn-more>` elements trigger artifact generation; every output has conversation capability
- **Benefit**: Exploration never terminates; continuous flow from consumption → generation → exploration

### TODO #5: Overview-Detail interfaces for mental schema formation
**Design Response**: $C_5$ (Progressive disclosure) + $C_{11}$ (Generative UI) + $C_7$ (Spatial anchoring)
- **How**: High-level overview on canvas, drill into detail by generating/opening artifacts
- **Implementation**: Canvas shows card previews; clicking opens full artifact; "learn more" generates detail views
- **Benefit**: Maintains overview while exploring depth (addresses $O_2$)

### TODO #6: Information seeking is non-linear
**Design Response**: New "Distributed Cognitive Networks" framework
- **How**: Artifacts can be explored in any order; spatial arrangement shows relationships
- **Implementation**: Non-linear navigation via spatial canvas + artifact-to-artifact queries
- **Benefit**: System supports the natural non-linear pattern of information seeking

### Important New Capability #1: Direct manipulation of HTML text
**Design Response**: $C_{12}$ (In-artifact content manipulation) + $D_9$
- **How**: Artifacts have editable regions, not just read-only displays
- **Implementation**: ContentEditable regions within artifacts, annotation overlays
- **Status**: Requires implementation (not in current Chrome extension)

### Important New Capability #2: "Learn more" buttons generate UIs on the fly
**Design Response**: $C_{11}$ (Generative UI navigation) + $D_2$ (UI as a service)
- **How**: Special interactive elements trigger LLM to generate new artifact UI
- **Implementation**: `<learn-more>` custom elements → LLM generates HTML → new artifact created
- **Status**: Requires implementation (major new feature)

### Important New Capability #3: Sticky-notes = same data structure as webpages
**Design Response**: $C_{10}$ (Universal artifact substrate) + $D_{10}$
- **How**: Everything is a `Card` artifact—notes, clippings, generated UIs
- **Implementation**: "New Note" button creates blank artifact; same conversation/manipulation capabilities
- **Status**: Partially implemented (Card type exists, needs note creation UI)

### Important New Capability #4: Files and screenshots as first-class artifacts
**Design Response**: $C_{10}$ (Universal artifact substrate) + $D_{10}$ + $D_1$ (Any content as artifact)
- **How**: Drag-and-drop files/screenshots → create `Card` artifact with file data
- **Inspiration**: tldraw computer treats images, text, audio as "components" with equal status on canvas
- **Implementation**:
  - Drag-drop zone on canvas accepts File objects
  - Images/screenshots: Store in IndexedDB (like current screenshot storage), render inline in card
  - PDFs: Extract first page as preview, store file reference, enable PDF.js viewer
  - Documents: Extract text content, store as `card.content`, preserve original file
  - All files: Same conversation/annotation capabilities as webpage artifacts
- **Technical Pattern** (from research):
  ```typescript
  const { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: ['image/*', 'application/pdf', 'text/*'],
    async onRootDrop(e) {
      const items = await Promise.all(
        e.items.filter(isFileDropItem).map(async item => ({
          id: generateId(),
          file: await item.getFile(),
          url: URL.createObjectURL(await item.getFile()),
          name: item.name,
          type: item.type
        }))
      );
      // Convert to Card artifacts
      createFileArtifacts(items);
    }
  });
  ```
- **Card Type Extension**:
  ```typescript
  interface Card {
    // ... existing fields
    fileData?: {
      fileName: string;
      fileType: string;
      fileSize: number;
      fileUrl: string; // IndexedDB reference or blob URL
      extractedText?: string; // For PDFs, docs
    };
  }
  ```
- **Status**: Requires implementation (new feature)

---

## Design Evolution Summary

### Original Design (UIST '24 Paper)
**Scope**: LLM-generated HTML outputs
**Interaction**: Human ↔ AI-generated element
**Purpose**: Make sense of AI responses through element-level interaction
**Innovation**: Element-level conversations instead of document-level

### Revised Design (Post-TODO Integration)
**Scope**: Any web content + AI-generated content + notes
**Interaction**: Human ↔ Artifact Network ↔ Artifacts (with artifact-to-artifact communication)
**Purpose**: Distributed knowledge construction through networked artifacts
**Innovation**: Artifacts as cognitive partners that can communicate with each other and generate new artifacts

### Key Conceptual Expansions

| Dimension | Original | Revised |
|-----------|----------|---------|
| **What is an artifact?** | AI-generated HTML | Any webpage, note, file, screenshot, or generated UI |
| **Who converses?** | Human ↔ Artifact | Human ↔ Artifact AND Artifact ↔ Artifact |
| **What can artifacts do?** | Display content, answer questions | Display, generate new artifacts, query other artifacts, be directly edited |
| **Information flow** | Linear (generate → consume) | Cyclic (consume → manipulate → generate → explore) |
| **Knowledge location** | In individual artifacts | In the network of relationships between artifacts |
| **Mental model** | Spatial canvas for visual organization | Distributed cognitive network for thinking |
| **Input sources** | Web clipping only | Web clipping, file uploads, screenshots, notes, AI generation |

### Implementation Roadmap

**Phase 1: Current Implementation (Nabokov's Web Chrome Extension)**
- ✅ Element capture from webpages
- ✅ Spatial canvas with React Flow
- ✅ Per-card conversation history
- ✅ Card data structure

**Phase 1.5: AI-as-Backend Infrastructure (CardMutationAPI)** - *Inspired by Claude Imagine*
- [ ] Implement CardMutationAPI for post-creation artifact manipulation
- [ ] Define custom interactive elements (`<learn-more>`, `<artifact-ref>`)
- [ ] Background worker routes element interactions to Claude
- [ ] Claude responds with DOM operations (not just text responses)
- [ ] **Technical Architecture**:
  ```typescript
  interface CardMutationAPI {
    // Core DOM operations (Claude Imagine-style)
    replaceContent(selector: string, html: string): void;
    appendSection(html: string): void;
    setAttribute(selector: string, attr: string, value: string): void;

    // Knowledge construction operations
    highlight(text: string, note?: string): void;
    annotate(selector: string, annotation: string): void;
    collapse(selector: string): void;
    expand(selector: string): void;

    // Inter-artifact operations
    injectReference(sourceArtifactId: string, excerpt: string): void;
    createConnection(targetArtifactId: string): void;
  }
  ```
- [ ] Custom elements handled by background worker:
  ```html
  <learn-more topic="distributed cognition" context="artifact-id">
  <artifact-ref target="artifact-456" query="What does this say about X?">
  <expand-section section="details">
  ```
- **Key Insight**: AI is not just a content generator but architectural infrastructure that operates the artifact network through surgical DOM manipulations (~3s response time sufficient for knowledge construction)

**Phase 2: Universal Artifact Substrate** ($C_{10}$, $D_1$, $D_{10}$)
- [ ] Import any URL as full-page artifact
- [ ] Create blank note artifacts
- [ ] **Drag-and-drop file and screenshot uploads** (images, PDFs, documents)
- [ ] File storage in IndexedDB with metadata extraction
- [ ] Unify clippings, notes, files, generated UIs under single `Card` type

**Phase 3: Generative UI Navigation** ($C_{11}$, $D_2$) - *Builds on CardMutationAPI*
- [ ] Special `<learn-more>` elements in artifacts (handled by CardMutationAPI)
- [ ] LLM generates new artifact UI on demand
- [ ] "Every output becomes input" implementation
- [ ] User clicks custom element → Claude generates HTML → CardMutationAPI appends new artifact to canvas

**Phase 4: In-Artifact Manipulation** ($C_{12}$, $D_9$) - *Powered by CardMutationAPI*
- [ ] ContentEditable regions within artifacts
- [ ] Annotation layer overlays (via `CardMutationAPI.annotate()`)
- [ ] Restructuring tools (reorder, highlight, collapse sections)
- [ ] User highlights text → CardMutationAPI.highlight() → Claude wraps in `<mark>` with note
- [ ] Direct manipulation makes thinking visible through surgical DOM edits

**Phase 5: Inter-Artifact Communication** ($C_9$, $D_4$, $D_{11}$) - *Uses CardMutationAPI for context injection*
- [ ] Message routing between artifacts (background worker as router)
- [ ] Artifact agents can query other artifacts via `<artifact-ref>` elements
- [ ] Visual connection lines showing artifact relationships
- [ ] Context propagation: Artifact A queries B → Claude extracts relevant excerpt → CardMutationAPI.injectReference() inserts into A
- [ ] Distributed cognitive network where artifacts collaborate in sensemaking

### Alignment with Theoretical Foundations

The revised design **deepens** alignment with distributed cognition and extended mind theory:

**Original**: Environment as display surface for AI outputs (weak extended mind—mostly passive storage)

**Revised**: Environment as active cognitive partner where artifacts participate in sensemaking (strong extended mind—active cognitive processing distributed across the network)

The key insight: **The network itself thinks.** When artifacts can communicate with each other, query for context, and spawn new artifacts, the system becomes a genuine cognitive partner, not just an enhanced display technology.

### Research Implications

This revision positions Nabokov's Web at the intersection of:
- **Human-AI Interaction**: Expanding from 1:1 (human↔AI) to many:many (human↔artifact network↔artifacts)
- **Knowledge Management**: Moving beyond hierarchical organization to networked, emergent understanding
- **Distributed Cognition**: Demonstrating that cognitive processes can be meaningfully distributed across human + AI + interface
- **Information Seeking**: Embracing non-linearity as the natural pattern, not an obstacle to overcome

The TODO items didn't just add features—they revealed a more fundamental conceptual model where **artifacts are cognitive partners, not just information containers**.

---

## Future Features

### Inspired by Ted Nelson's Hypertext Vision (1965)

#### 1. Parallel Documents with Visual Connections

**Concept**: Display two related artifacts side-by-side with visual lines connecting corresponding sections. Clicking a section in one artifact highlights and scrolls to the aligned section in the other.

**Use Cases**:
- Compare different captures from the same website over time
- View original webpage alongside annotated/edited version
- Compare translations or different editions side-by-side
- Align research notes with source material

**Implementation Approach**:
- Create "link pairs" at paragraph or heading level
- Store alignments in card metadata: `card.alignments: Array<{targetCardId: string, sourceSection: string, targetSection: string}>`
- Render visual connection lines (SVG overlays) between aligned sections when both cards are visible
- Click handler highlights both sections and scrolls them into view simultaneously

**Technical Details**:
```typescript
interface CardAlignment {
  sourceCardId: string;
  targetCardId: string;
  alignments: Array<{
    sourceSelector: string;  // CSS selector or text match
    targetSelector: string;
    linkType: 'translation' | 'version' | 'annotation' | 'reference';
  }>;
}
```

**UI/UX**:
- "Compare Mode" button on cards enables side-by-side view
- Drag to create alignment links between sections
- Visual connection lines fade in/out based on scroll position
- Color-code by link type (blue for versions, gold for annotations, etc.)

---

#### 2. Multiple Versions with Linked Passages

**Concept**: Track the evolution of cards over time. When a card is edited, preserve the previous version and maintain links between corresponding paragraphs/sections across versions. Enable side-by-side version comparison with visual highlighting of changes.

**Use Cases**:
- Track how your understanding of a topic evolved
- Compare your annotations/edits across multiple revision sessions
- See which parts of captured content changed when revisiting a webpage
- Understand the progression of your thinking on a research question

**Implementation Approach**:
- Store version history in `card.versions: Array<CardVersion>`
- Each version contains: `{timestamp, content, metadata, parentVersion, linkedSections}`
- Paragraph/section linking tracks conceptual relationships (not just text diffs)
- UI shows version timeline with branch points for major revisions

**Technical Details**:
```typescript
interface CardVersion {
  versionId: string;
  timestamp: number;
  content: string;  // Full HTML content at this version
  metadata: ClipMetadata;
  parentVersionId?: string;  // For tracking lineage
  linkedSections: Array<{
    sectionId: string;
    parentSectionId?: string;  // Links to equivalent section in parent version
    changeType: 'added' | 'modified' | 'removed' | 'unchanged';
  }>;
  versionLabel?: string;  // User-assigned label (e.g., "Initial capture", "After discussion with Alice")
}

interface Card {
  // ... existing fields
  currentVersionId: string;
  versions: CardVersion[];
  versionGraph?: {
    // For tracking non-linear version history (branches)
    nodes: Array<{versionId: string, label: string}>;
    edges: Array<{from: string, to: string, type: 'revision' | 'branch'}>;
  };
}
```

**UI/UX**:
- Version history panel shows timeline of all versions
- "Compare Versions" mode shows two versions side-by-side
- Hover over section in one version highlights corresponding section in other version
- Visual diff markers show added/removed/modified text
- Branch visualization for non-linear version history (if card was duplicated and both evolved)

**Key Innovation** (inspired by Nelson):
- Links track *conceptual relationships* between paragraphs, not just text similarity
- Paragraph 3 in v2 "knows" it evolved from Paragraph 2 in v1 (even if heavily rewritten)
- User can explicitly mark sections as "equivalent" across versions

---

#### 3. Card Merge and Split Operations (Inspired by Double Cuffs)

**Concept**: Enable merging multiple cards into a single composite card, while preserving the ability to "unmerge" them back into separate cards later. This supports combining related captures/notes while maintaining their individual identities.

**Use Cases**:
- Merge multiple captures from same webpage into comprehensive view
- Combine related research notes into a single document
- Create composite views temporarily for analysis, then split back apart
- Group cards by topic/project without losing individual card structure

**Original Double Cuffs Behavior** (from your description):
- User could merge related cards together
- System tracked the original cards' identities
- User could later "unmerge" to split them back into separate cards

**Implementation Approach**:
- Merged card stores references to all constituent cards
- Each constituent card preserved in full (via `card.mergedFrom` array)
- Split operation recreates original cards from stored references
- Canvas shows merged card as single node, but can "explode" into original cards

**Technical Details**:
```typescript
interface Card {
  // ... existing fields
  isMerged?: boolean;
  mergedFrom?: Array<{
    cardId: string;           // Original card ID
    cardSnapshot: Card;       // Full snapshot of original card at merge time
    mergePosition: number;    // Order within merged card (for split reconstruction)
  }>;
  mergeHistory?: Array<{
    timestamp: number;
    operation: 'merge' | 'split';
    involvedCards: string[];
  }>;
}
```

**UI/UX**:
- "Merge Cards" button appears when multiple cards are selected
- Merged card has visual indicator (e.g., layered icon) showing it's composite
- "Unmerge" button on merged cards to split back into originals
- Canvas animation: merge = cards flying together, split = explosion into original positions
- Merged card content can be:
  - **Sequential**: Original cards' content shown in sequence with dividers
  - **Tabbed**: Each original card becomes a tab within merged card
  - **Synthesized**: LLM generates new combined content (with original cards accessible via "Sources" panel)

**Advanced Features**:
- Partial merge: Merge only specific sections from each card
- Merge styles: Choose how merged content should be presented (sequential, tabbed, synthesized)
- Merge as new card: Create merged card while preserving originals as separate cards
- Smart merge suggestions: System suggests related cards that could be merged

**Merge Conflicts**:
- If user edits merged card, system tracks which parts came from which original
- On split: (1) restore originals (discard edits), or (2) distribute edits back to originals

---

### Implementation Priority

**High Priority** (aligns with Phase 2-3):
- Version tracking with linked passages (foundational for knowledge construction)
- Basic merge/split operations (user-requested feature)

**Medium Priority** (aligns with Phase 4-5):
- Parallel document view with visual connections (requires stable inter-artifact communication)

**Implementation Notes**:
- All three features share common infrastructure: section/paragraph identification, metadata tracking, visual linking
- Version tracking should come first as it provides foundation for the others
- Merge/split operations can initially be simpler (no advanced merge styles) and enhanced later
- Parallel view requires React Flow enhancements for coordinated scrolling and connection lines
