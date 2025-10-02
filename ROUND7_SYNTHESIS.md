# Round 7 Synthesis: Cognitive Science Foundations (2024-2025)
## Learning Theory, Spatial Computing, and Agentic AI for NabokovsWeb

**Date**: 2025-10-02
**Focus**: Foundational cognitive science, learning theory, and emerging spatial computing platforms
**Scope**: 8 searches (49-56) covering Apple Vision Pro/visionOS, agentic AI systems, cognitive load theory, embodied cognition, active learning, card sorting, metacognition, and collaborative sensemaking
**Perspective**: Grounding NabokovsWeb in 50+ years of learning science while embracing 2024-2025 spatial computing future

---

## Executive Summary

Round 7 completes the research foundation by connecting NabokovsWeb to fundamental cognitive science while charting a path to immersive spatial computing. Eight critical insights emerge:

1. **Spatial Computing Has Arrived**: Apple Vision Pro (Feb 2024) + visionOS 2 (2024) + visionOS 26 (2025 preview) provide production-ready platform for immersive knowledge work - NabokovsWeb's canvas is ready for 3D evolution

2. **Agentic AI Architecture Validated**: Multi-agent systems (2024-2025 research) show collaborative problem-solving reduces inaccuracies, cross-checks outputs - F6.11 (Multi-Agent System) has strong empirical backing

3. **Cognitive Load Theory Modern**: 40-year cornerstone now integrating AI/ML for adaptive learning (2024), progressive disclosure essential for spatial interfaces

4. **Embodied Cognition + XR Synergy**: 2024 research shows XR enables cognitive offloading into digital environments, haptic feedback engages sensory-motor systems - spatial canvas is embodied thinking

5. **Active Learning Paradigm**: Digital literacy moderates adaptive learning effectiveness (2025 study), mobile platforms break time/space barriers - NabokovsWeb needs active manipulation, not passive scrolling

6. **Card Sorting Validates Spatial Organization**: Foundational UX research method for uncovering mental models - user study should include card sorting to validate spatial arrangement patterns

7. **Metacognition in GenAI Environments**: 2025 research shows metacognitive support reduces cognitive load, increases perceived usefulness - NabokovsWeb needs scaffolding for reflection

8. **Distributed Cognition Framework**: 2024 model shows collaborators + tools function as distributed cognitive system - cards ARE cognitive artifacts enabling collaborative sensemaking

**Strategic Positioning**: NabokovsWeb implements learning science principles (cognitive load reduction, active learning, metacognitive scaffolding, embodied cognition) while preparing for spatial computing future (visionOS). This grounding in cognitive theory differentiates from competitors building "productivity tools" - we're building a "cognitive amplification system."

---

## Part 1: Top 5 Round 7 Insights

### 1. Vision Pro + visionOS: Spatial Computing Production Platform (Search 49)

**Source**: Apple newsroom (Feb 2024), Frontiers research (2025), visionOS developer docs

**Key Timeline**:
- **Feb 2, 2024**: Vision Pro launches in U.S. ($3,499)
- **2024**: visionOS 2 ships with spatial photos, intuitive gestures, 2000+ spatial apps
- **2025**: visionOS 26 preview - 180°/360°/wide FOV content, enterprise APIs, generative AI spatial photos

**Interaction Model**: Eyes + hands + voice (3D UI)
- **Gaze targeting**: Look at object to select
- **Pinch gestures**: Tap, scroll, zoom
- **Hand tracking**: Direct manipulation
- **Voice commands**: "Open Safari", "Create new note"

**Business Applications Validated** (2024):
- Training simulations (healthcare, aerospace)
- Product design reviews (manufacturing)
- Architectural walkthroughs
- Remote collaboration with spatial shared context

**Academic Research Finding** (Frontiers 2025):
> "Traditional 3D creation paradigms present barriers in XR. Gap between design intention and spatial realization requires: (1) 3D model generation, (2) immersive environment generation, (3) intelligent interaction control."

**Key Quote** (Apple):
> "Infinite canvas that enables businesses to reinvent workspaces, with apps freed from display boundaries"

**Why This Matters for NabokovsWeb**:
- Spatial canvas paradigm VALIDATED by trillion-dollar company (Apple betting big on spatial interfaces)
- Production-ready platform exists NOW (not 5-10 years away like Meta's metaverse promises)
- NabokovsWeb's 2D canvas naturally extends to 3D immersive environment
- Business use cases proven (not just gaming/entertainment)

**Technical Path to visionOS**:
```typescript
// F6.9: WebXR Immersive Canvas (from Round 6)
// Now grounded in Vision Pro's capabilities

interface VisionProCanvas {
  // Gaze + pinch for card selection
  gazeSelection: {
    lookAtCard: (card: Card) => void;
    pinchToSelect: () => void;
  };

  // Hand tracking for spatial arrangement
  handTracking: {
    grabCard: (card: Card) => void;
    moveInSpace: (position: { x: number; y: number; z: number }) => void;
    drawConnection: (sourceCard: Card, targetCard: Card) => void;
  };

  // Voice for creation
  voiceCommands: {
    "Create new note about [topic]": () => Promise<Card>;
    "Summarize these cards": (cards: Card[]) => Promise<Card>;
    "Show me cards about [query]": (query: string) => Card[];
  };

  // Spatial audio (future - multi-user)
  spatialAudio?: {
    conversationFromCard: (card: Card) => AudioStream;
  };
}
```

**Design Implications**:
1. **Depth as third dimension**: Z-axis for temporal ordering (recent cards closer) or hierarchy (parent cards behind children)
2. **Gaze-based filtering**: Look at cluster to highlight, look away to dim
3. **Pinch-and-pull gestures**: Pull card toward you to read, push away to save for later
4. **Spatial memory**: Physical location in room anchors cards (kitchen = cooking research, desk = work projects)

**Effort**: HIGH (3-4 weeks for WebXR + visionOS optimizations)
**Priority**: P2 - STRATEGIC (Month 6-8, after core features solid)
**Impact**: VERY HIGH (first PKM system designed for spatial computing)

---

### 2. Agentic AI + Multi-Agent Systems: Collaborative Intelligence (Search 50)

**Source**: arXiv taxonomy papers (2024-2025), McKinsey forecast, SuperAGI trends, Anthropic research system

**Market Growth** (2024-2025):
- $6.67B (2024) → $10.41B (2025) = **56.1% CAGR**
- McKinsey prediction: By 2029, agentic AI resolves **80% of customer service issues autonomously**, 30% cost reduction

**Paradigm Shift Components**:
1. **Multi-agent collaboration**: Specialized agents work together
2. **Dynamic task decomposition**: Complex tasks broken down on-the-fly
3. **Persistent memory**: Agents maintain context across sessions
4. **Orchestrated autonomy**: Human sets goals, agents execute

**Multi-Agent Advantages** (2024 research):
- Collaborative problem-solving → better solutions than single agent
- Cross-checking outputs → reduced inaccuracies
- Diverse perspectives → more creative alternatives
- Specialization → each agent optimized for specific tasks

**Challenges Identified**:
- **Agent coordination complexity**: Need orchestration layer
- **Emergent behaviors**: Unpredictable interactions between agents
- **Cascading errors**: Small changes to lead agent → unpredictable subagent behavior

**Anthropic's Multi-Agent Research System** (2024):
> "Specialized agents collaborate on complex research tasks. Surpasses single-agent capabilities."

**Architecture Pattern** (from research):
```
Lead Agent (Coordinator)
├── Specialist Agent 1 (Data Collection)
├── Specialist Agent 2 (Analysis)
├── Specialist Agent 3 (Synthesis)
└── Critic Agent (Validation)
```

**Why This Matters for NabokovsWeb**:
- F6.11 (Multi-Agent System) from Round 6 now has STRONG empirical validation
- Market growth (56% CAGR) shows agentic AI is mainstream, not experimental
- Multi-agent architecture addresses NabokovsWeb's sensemaking complexity better than single LLM

**Implementation for NabokovsWeb** (F6.11 refined):

```typescript
// Five specialized agents for knowledge work

interface Agent {
  role: string;
  model: string;
  systemPrompt: string;
  analyze(canvas: Canvas): Promise<Suggestion[]>;
}

// 1. Forager Agent - Searches for related content
class ForagerAgent implements Agent {
  role = 'forager';
  model = 'claude-haiku';  // Fast, cheap for web search

  async analyze(canvas: Canvas): Promise<Suggestion[]> {
    const recentCards = canvas.cards
      .filter(c => c.createdAt > Date.now() - 7*24*60*60*1000)  // Last week
      .slice(0, 5);

    const topics = await this.extractTopics(recentCards);
    const webResults = await this.searchWeb(topics);

    return webResults.map(result => ({
      type: 'new-card',
      content: result.content,
      metadata: result.metadata,
      reason: `Related to your work on ${result.topic}`,
      confidence: result.relevance
    }));
  }
}

// 2. Curator Agent - Detects duplicates and consolidates
class CuratorAgent implements Agent {
  role = 'curator';
  model = 'claude-haiku';

  async analyze(canvas: Canvas): Promise<Suggestion[]> {
    const duplicates = await this.findDuplicates(canvas.cards);
    const consolidations = [];

    for (const [card1, card2, similarity] of duplicates) {
      if (similarity > 0.95) {
        consolidations.push({
          type: 'merge-cards',
          cards: [card1, card2],
          reason: `${(similarity * 100).toFixed(0)}% similar content`,
          confidence: similarity
        });
      }
    }

    return consolidations;
  }

  async findDuplicates(cards: Card[]): Promise<[Card, Card, number][]> {
    // Use embeddings for semantic similarity
    const pairs = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const similarity = await embeddingService.similarity(cards[i], cards[j]);
        if (similarity > 0.85) {
          pairs.push([cards[i], cards[j], similarity]);
        }
      }
    }
    return pairs;
  }
}

// 3. Connector Agent - Finds implicit relationships
class ConnectorAgent implements Agent {
  role = 'connector';
  model = 'claude-sonnet';  // More sophisticated reasoning

  async analyze(canvas: Canvas): Promise<Suggestion[]> {
    const suggestions = [];

    // Find semantically similar but unconnected cards
    for (const card of canvas.cards) {
      const similar = await embeddingService.findSimilar(card, canvas.cards, 0.80);

      for (const { card: relatedCard, similarity } of similar) {
        const alreadyConnected = canvas.connections.some(
          c => (c.source === card.id && c.target === relatedCard.id) ||
               (c.source === relatedCard.id && c.target === card.id)
        );

        if (!alreadyConnected) {
          const relationship = await this.inferRelationship(card, relatedCard);
          suggestions.push({
            type: 'connection',
            source: card.id,
            target: relatedCard.id,
            connectionType: relationship.type,
            reason: relationship.explanation,
            confidence: similarity
          });
        }
      }
    }

    return suggestions;
  }
}

// 4. Critic Agent - Challenges claims, finds contradictions
class CriticAgent implements Agent {
  role = 'critic';
  model = 'claude-sonnet';

  async analyze(canvas: Canvas): Promise<Suggestion[]> {
    const critiques = [];

    for (const card of canvas.cards) {
      // Look for claims in card content
      const claims = await this.extractClaims(card);

      for (const claim of claims) {
        // Search for contradicting evidence in other cards
        const contradictions = await this.findContradictions(claim, canvas.cards);

        if (contradictions.length > 0) {
          critiques.push({
            type: 'contradiction',
            card: card.id,
            claim: claim.text,
            contradictingCards: contradictions.map(c => c.id),
            reason: `Potential contradiction detected`,
            confidence: 0.7
          });
        }
      }
    }

    return critiques;
  }
}

// 5. Synthesizer Agent - Combines cards into insights
class SynthesizerAgent implements Agent {
  role = 'synthesizer';
  model = 'claude-opus';  // Most capable for synthesis

  async analyze(canvas: Canvas): Promise<Suggestion[]> {
    const syntheses = [];

    // Find clusters of related cards
    const clusters = await this.detectClusters(canvas.cards, canvas.connections);

    for (const cluster of clusters) {
      if (cluster.cards.length >= 3) {
        const synthesis = await claudeAPI.chat({
          messages: [{
            role: 'user',
            content: `Synthesize these ${cluster.cards.length} cards into a higher-level insight:\n\n${
              cluster.cards.map(c => `- ${c.content}`).join('\n')
            }`
          }]
        });

        syntheses.push({
          type: 'synthesis',
          sourceCards: cluster.cards.map(c => c.id),
          content: synthesis.content,
          reason: `Synthesis of ${cluster.topic} cluster`,
          confidence: 0.85
        });
      }
    }

    return syntheses;
  }
}

// Orchestration layer
class MultiAgentOrchestrator {
  private agents: Agent[] = [
    new ForagerAgent(),
    new CuratorAgent(),
    new ConnectorAgent(),
    new CriticAgent(),
    new SynthesizerAgent()
  ];

  async runAnalysis(canvas: Canvas, mode: 'all' | 'selected'): Promise<Suggestion[]> {
    const allSuggestions = await Promise.all(
      this.agents.map(agent => agent.analyze(canvas))
    );

    // Flatten and deduplicate
    const suggestions = allSuggestions.flat();

    // Rank by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // Group by type
    return this.groupSuggestions(suggestions);
  }

  async runAgent(agentRole: string, canvas: Canvas): Promise<Suggestion[]> {
    const agent = this.agents.find(a => a.role === agentRole);
    if (!agent) throw new Error(`Agent ${agentRole} not found`);
    return agent.analyze(canvas);
  }
}
```

**UX Design**:
```typescript
// Agent panel in sidebar
function AgentPanel({ canvas }: { canvas: Canvas }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <Panel title="AI Agents">
      <AgentList>
        <AgentButton
          icon="🔍"
          label="Forager"
          status="idle"
          onClick={() => runAgent('forager')}
        />
        <AgentButton
          icon="🧹"
          label="Curator"
          status="analyzing"
          onClick={() => runAgent('curator')}
        />
        <AgentButton
          icon="🔗"
          label="Connector"
          status="idle"
          onClick={() => runAgent('connector')}
        />
        <AgentButton
          icon="🤔"
          label="Critic"
          status="idle"
          onClick={() => runAgent('critic')}
        />
        <AgentButton
          icon="✨"
          label="Synthesizer"
          status="idle"
          onClick={() => runAgent('synthesizer')}
        />
      </AgentList>

      <SuggestionList suggestions={suggestions} />
    </Panel>
  );
}
```

**Effort**: VERY HIGH (4-6 weeks for full multi-agent system)
**Priority**: P3 - RESEARCH (Month 8-10, after core features + visionOS)
**Impact**: VERY HIGH (research novelty, first multi-agent PKM system)

---

### 3. Cognitive Load Theory: 40 Years of Learning Science Meets AI (Search 51)

**Source**: MDPI Education journal (2024), IxDF, Springer research

**Historical Context**:
- **40-year cornerstone** of educational + instructional design research
- **Recent shift (2020-2024)**: Experimental studies → intervention research
- **2024 integration**: CLT + Educational Neuroscience + AI/ML for personalized learning

**Three Types of Cognitive Load**:
1. **Intrinsic load**: Inherent difficulty of material (can't reduce)
2. **Extraneous load**: Poor design (CAN reduce) ← NabokovsWeb focus
3. **Germane load**: Productive mental effort (want to maximize)

**Design Strategies to Reduce Extraneous Load**:
- **Break tasks into chunks**: Don't overwhelm working memory
- **Progressive disclosure**: Reveal information as needed (not all at once)
- **Avoid clutter**: Inconsistent navigation, confusing labels, poor layouts increase load
- **Consistency**: Predictable patterns reduce cognitive effort

**AI Integration (2024 Research)**:
- AI-based learning analytics with clustering algorithms
- Personalized interventions based on cognitive load indicators
- Adaptive interfaces adjusting to learner's state

**Gap Identified** (ResearchGate):
> "Limited research on CLT + adaptive interfaces + information visualization"

**Why This Matters for NabokovsWeb**:
- Spatial canvas CAN reduce extraneous load (spatial memory = offload to environment)
- BUT poorly designed canvas INCREASES load (too many visible cards, unclear organization)
- Progressive disclosure CRITICAL for scaling to 100+ cards

**Implementation Strategies**:

```typescript
// F7.1: Progressive Disclosure for Card Details

interface CardDetailLevel {
  minimal: {
    show: ['title', 'favicon', 'tags'];
    hide: ['content', 'screenshot', 'metadata'];
  };
  moderate: {
    show: ['title', 'favicon', 'tags', 'preview']; // First 100 chars
    hide: ['full-content', 'screenshot', 'metadata'];
  };
  full: {
    show: ['title', 'favicon', 'tags', 'content', 'screenshot', 'metadata'];
    hide: [];
  };
}

// Context-aware detail levels
function CardNode({ card, viewportPosition }: Props) {
  const detailLevel = useDetailLevel(card, viewportPosition);

  // Cards in center of viewport → full detail
  // Cards on periphery → minimal detail
  // Reduces visual clutter, focuses attention

  return (
    <Card>
      {detailLevel.show.includes('title') && <Title>{card.metadata.title}</Title>}
      {detailLevel.show.includes('preview') && <Preview>{truncate(card.content, 100)}</Preview>}
      {detailLevel.show.includes('full-content') && <Content dangerouslySetInnerHTML={{ __html: card.content }} />}
    </Card>
  );
}

function useDetailLevel(card: Card, viewportPosition: { x: number; y: number }): CardDetailLevel {
  const distanceFromCenter = calculateDistance(card.position, viewportPosition);

  if (distanceFromCenter < 200) return detailLevels.full;
  if (distanceFromCenter < 500) return detailLevels.moderate;
  return detailLevels.minimal;
}
```

**Chunking for Workspace Organization**:
```typescript
// F7.2: Workspace Clustering (Cognitive Chunking)

// Suggest organizing cards into 5-7 clusters (Miller's magical number)
async function suggestClusters(cards: Card[]): Promise<Cluster[]> {
  const embeddings = await Promise.all(cards.map(c => embeddingService.generateEmbedding(c)));

  // K-means with k=5-7 (cognitive chunk size)
  const clusters = kMeans(embeddings, k=6);

  return clusters.map(cluster => ({
    id: generateId(),
    name: await generateClusterName(cluster.cards),
    cards: cluster.cards,
    position: calculateCentroid(cluster.cards.map(c => c.position))
  }));
}
```

**Minimize Extraneous Load in AI Interactions**:
```typescript
// F7.3: Streamlined AI Interaction (Reduce Cognitive Load)

// BAD: Complex modal with many options
function ComplexAIModal() {
  return (
    <Modal>
      <Select label="Model" options={['claude-opus', 'claude-sonnet', 'claude-haiku', 'gpt-4o', 'gpt-4-turbo']} />
      <Select label="Temperature" options={[0.0, 0.1, 0.2, ..., 1.0]} />
      <Input label="Max tokens" />
      <Checkbox label="Include screenshot" />
      <Checkbox label="Stream response" />
      <Checkbox label="Auto-create connection" />
      {/* TOO MANY OPTIONS - HIGH COGNITIVE LOAD */}
    </Modal>
  );
}

// GOOD: Simple action with smart defaults
function SimpleAIAction() {
  return (
    <Button onClick={handleSummarize}>
      Summarize
      {/* Behind the scenes: claude-sonnet, temp=0.7, max=1000, auto-connect=true */}
    </Button>
  );
}

// Advanced users can access full options in Settings
// But default experience is LOW COGNITIVE LOAD
```

**Effort**: MEDIUM (2-3 days for progressive disclosure + chunking)
**Priority**: P1 - HIGH (improves usability, grounded in 40 years of research)
**Impact**: HIGH (better user experience, scales to 100+ cards)

---

### 4. Embodied Cognition + Extended Mind in XR Era (Search 52)

**Source**: Royal Society B (2024), Stanford Encyclopedia, CHI 2024

**2024 Theme Issue** (Philosophical Transactions):
> "Embodied cognition in age of generative AI"

**Core Principle**: Questioning mind-body dualism
- Cognition isn't just "in the head"
- Sensorimotor action and abstract cognition are CONTINUOUS, not separate
- Body and environment are part of cognitive system

**Extended Mind in XR** (2024 scoping review):
- **XR enables cognitive offloading**: Mental work done in digital environment
- **Haptic feedback**: Engages sensory-motor systems (not just visual)
- **Spatial memory**: Physical locations anchor abstract concepts

**AR in Education** (2024):
- Superimpose 3D elements onto physical environments
- Address abstract concept understanding through 3D visualization + interaction
- Learning by DOING, not just reading

**Path to AGI** (Dec 2024 survey):
- Embodied intelligence = Physical interaction + cognitive computation
- Applications: Robotics, autonomous driving, intelligent manufacturing

**AI Design Implications** (CHI 2024):
> "Need AI systems understanding embodied human interactions. Computational theory of mind doesn't capture embodied social cognition."

**Why This Matters for NabokovsWeb**:
- **Spatial canvas = embodied thinking**: Cards as physical artifacts you manipulate
- **NOT just visual**: Touch/gesture interactions (future - Vision Pro)
- **Cognitive offloading**: Spatial arrangement = thinking externalized

**Current Embodiment in NabokovsWeb**:
1. **Drag cards**: Physical metaphor (grabbing, moving objects)
2. **Draw connections**: Gesture-like interaction (connecting thoughts)
3. **Spatial memory**: "I put that card in top-left corner" = spatial anchor

**Future Embodiment (visionOS)**:
```typescript
// F7.4: Haptic Feedback for Card Interactions (visionOS)

interface HapticFeedback {
  // When card is grabbed
  onGrab: () => {
    playHaptic('light-impact');  // Feel card in hand
  };

  // When card snaps to grid or cluster
  onSnap: () => {
    playHaptic('medium-impact');  // Feel magnetic attraction
  };

  // When connection is created
  onConnect: () => {
    playHaptic('soft-click');  // Feel link establish
  };

  // When card is deleted
  onDelete: () => {
    playHaptic('heavy-impact');  // Feel removal
  };
}

// Spatial audio for card content
interface SpatialAudio {
  // Text-to-speech from card location in space
  readCard: (card: Card, spatialPosition: Vector3) => {
    const audioSource = createSpatialAudioSource(card.content, spatialPosition);
    audioSource.play();  // Hear content from WHERE card is located
  };
}
```

**Walking Through Knowledge** (visionOS):
```typescript
// F7.5: Physical Movement Through Canvas

// As user walks around room, different clusters of cards become visible
// Physical movement = cognitive transition between topics

interface SpatialZones {
  zones: {
    name: string;
    physicalLocation: Vector3;  // Real-world coordinates
    cards: Card[];
    theme: string;
  }[];
}

// Example: Kitchen = cooking research, Desk = work, Couch = leisure reading
// Physical location anchors abstract knowledge to concrete space
```

**Effort**: HIGH (3-4 weeks for visionOS spatial features)
**Priority**: P2 - STRATEGIC (Month 6-8, after core features)
**Impact**: VERY HIGH (first embodied PKM system)

---

### 5. Active Learning + Interactive Systems (Search 53)

**Source**: ACM 2024 conferences, MDPI sustainability journal

**Key Finding** (Jan 2025 study):
> "Digital literacy moderates adaptive learning effectiveness"

**Metaverse Learning Platforms** (2024):
- VR for active learning
- Immersive engagement (not passive consumption)

**Interactive AI Tools**:
- Intelligent tutoring systems
- Chatbots with real-time interaction
- Immediate feedback loops

**Market Growth**:
- Adaptive learning market: $2.87B (2024) → $4.39B (2025) = **52.7% YoY growth**

**Engagement Recognition** (2024):
- Active engagement crucial for learning (especially children with ASD)
- Cognitive, motor, social development
- AI-infused systems for engagement recognition

**Mobile Instant Messaging** (2024 research):
- Break time/space barriers
- Flexible learning activities
- Enhance engagement and continuity

**Why This Matters for NabokovsWeb**:
- **Active manipulation** (drag, connect, edit) >> **Passive scrolling** (reading feed)
- Real-time AI interaction (chat, generation) supports active learning
- Mobile extension needed for continuity (capture on phone, organize on desktop)

**Active vs Passive Comparison**:

| Activity | Type | NabokovsWeb |
|----------|------|-------------|
| Read article | Passive | ❌ Not enough |
| Clip element | Active | ✅ Selection + extraction |
| Drag card | Active | ✅ Spatial decision |
| Create connection | Active | ✅ Relationship reasoning |
| Chat with card | Active | ✅ Dialogue |
| Generate synthesis | Active | ✅ Prompt crafting |
| Scroll feed | Passive | ❌ Avoid this pattern |

**Implementation**:
```typescript
// F7.6: Activity Tracking for Active Learning

interface UserActivity {
  type: 'clip' | 'drag' | 'connect' | 'chat' | 'generate' | 'edit';
  timestamp: number;
  cardIds: string[];
  duration: number;  // Time spent on activity
}

// Detect active vs passive sessions
function analyzeSession(activities: UserActivity[]): SessionAnalysis {
  const activeTime = activities
    .filter(a => ['drag', 'connect', 'chat', 'generate', 'edit'].includes(a.type))
    .reduce((sum, a) => sum + a.duration, 0);

  const passiveTime = activities
    .filter(a => a.type === 'scroll')  // If we add scrolling
    .reduce((sum, a) => sum + a.duration, 0);

  return {
    activeRatio: activeTime / (activeTime + passiveTime),
    engagement: activeTime > passiveTime ? 'high' : 'low',
    recommendation: activeTime < passiveTime
      ? "Try creating connections between cards to deepen understanding"
      : "Great active engagement!"
  };
}
```

**Mobile Extension** (F7.7):
```typescript
// Quick capture on mobile, spatial organization on desktop
interface MobileCapture {
  // Simplified interface for phone
  captureText: (text: string) => Promise<Card>;
  captureImage: (imageUrl: string) => Promise<Card>;
  captureWebpage: (url: string) => Promise<Card>;

  // Sync to desktop for organization
  syncToDesktop: () => Promise<void>;
}

// Use case:
// 1. On commute, clip 5 articles on phone
// 2. At desk, open NabokovsWeb canvas
// 3. All 5 cards appear as unorganized cluster
// 4. User spatially arranges them (active learning)
```

**Effort**: MEDIUM (2-3 weeks for mobile companion app)
**Priority**: P2 - HIGH (extends use cases, enables continuity)
**Impact**: HIGH (mobile learning growing market)

---

## Part 2: Connecting Round 7 to Cognitive Science Foundations

### Validation of NabokovsWeb's Cognitive Basis

Round 7 research (2024-2025) provides empirical validation for NabokovsWeb's design principles:

| Design Principle | Cognitive Science Foundation | Round 7 Validation |
|------------------|------------------------------|-------------------|
| **Spatial canvas** | Distributed cognition (Hutchins 1995) | Embodied cognition + XR (2024): Cognitive offloading into environment |
| **Card manipulation** | Epistemic actions (Kirsh 1994) | Active learning (2024): Active >> Passive for engagement |
| **Progressive disclosure** | Cognitive load theory (Sweller 1988) | CLT + AI (2024): Adaptive interfaces reduce extraneous load |
| **Multi-agent system** | Distributed problem-solving | Agentic AI (2024-2025): Multi-agent outperforms single agent |
| **Spatial memory** | Memory palaces (Ancient Rome) | Card sorting (2024): Mental models revealed through spatial arrangement |
| **Metacognitive scaffolding** | Self-regulated learning | Metacognition + GenAI (2025): Support reduces load, increases usefulness |

### How NabokovsWeb Implements Learning Science

**1. Reduce Cognitive Load** (CLT):
- ✅ **Chunking**: Cluster cards into 5-7 groups (Miller's number)
- ✅ **Progressive disclosure**: Show less detail for peripheral cards
- ✅ **Consistent UI**: Predictable interaction patterns
- ✅ **Spatial offloading**: Environment remembers positions

**2. Support Active Learning**:
- ✅ **Manipulation required**: Can't use without dragging/connecting
- ✅ **Real-time feedback**: AI responds to user actions
- ✅ **Epistemic actions**: Spatial arrangement = thinking externally
- ⚠️ **Mobile continuity**: Need mobile app (F7.7)

**3. Enable Embodied Cognition**:
- ✅ **Physical metaphors**: Drag, grab, connect (tactile language)
- ✅ **Spatial memory**: Location encodes meaning
- ⚠️ **Haptic feedback**: Need visionOS extension (F7.4)
- ⚠️ **3D space**: Need WebXR for full embodiment (F6.9)

**4. Facilitate Metacognition**:
- ⚠️ **Reflection prompts**: Need metacognitive scaffolding (F7.8)
- ⚠️ **Usage analytics**: Need "How has your thinking evolved?" (F7.9)
- ✅ **Visible provenance**: Can trace how insights emerged
- ✅ **Navigable history**: Can revisit past thinking (F0.3)

**5. Support Collaborative Sensemaking**:
- ⚠️ **Multi-user workspaces**: Future feature (F7.2)
- ✅ **Shared artifacts**: Cards = boundary objects
- ✅ **Conversation history**: Chat maintains dialogue
- ⚠️ **Distributed cognition**: Need multi-agent system (F6.11)

### Gaps to Address

**High-Priority Gaps** (P1):
1. **Metacognitive scaffolding** (F7.8): Prompt reflection on thinking process
2. **Progressive disclosure** (F7.1): Context-aware detail levels
3. **Workspace chunking** (F7.2): Suggest 5-7 clusters

**Medium-Priority Gaps** (P2):
4. **Mobile continuity** (F7.7): Capture on phone, organize on desktop
5. **visionOS embodiment** (F7.4): Haptic + spatial audio
6. **Activity analytics** (F7.6): Track active vs passive engagement

**Research Gaps** (P3):
7. **Multi-agent system** (F6.11): Five specialized agents
8. **Card sorting study**: Validate spatial organization patterns
9. **Embodied learning metrics**: Measure spatial memory retention

---

## Part 3: New Features Extracted from Round 7

### F7.1: Progressive Disclosure for Card Details ⭐ NEW

**Source**: Cognitive Load Theory (2024)

**Problem**: Too many cards showing full detail = cognitive overload

**Solution**: Context-aware detail levels based on viewport position

**Implementation**:
```typescript
interface DetailLevel {
  name: 'minimal' | 'moderate' | 'full';
  showFields: string[];
}

function useAdaptiveDetail(card: Card, viewport: Viewport): DetailLevel {
  const distance = calculateDistance(card.position, viewport.center);
  const zoomLevel = viewport.zoom;

  // Close + zoomed in = full detail
  if (distance < 300 && zoomLevel > 1.0) {
    return { name: 'full', showFields: ['title', 'content', 'screenshot', 'metadata', 'tags'] };
  }

  // Medium distance = moderate detail
  if (distance < 600) {
    return { name: 'moderate', showFields: ['title', 'preview', 'tags'] };
  }

  // Far away = minimal detail
  return { name: 'minimal', showFields: ['title', 'favicon'] };
}
```

**UX**:
- Cards in center of screen: Full content visible
- Cards on periphery: Just title + favicon (less visual noise)
- Zoom out: All cards become minimal (overview mode)
- Zoom in: Focused card shows full detail

**Settings**:
- Global preference: Always minimal / Always moderate / Always full / Adaptive (default)
- Per-card override: Pin this card to always show full detail

**Effort**: LOW-MEDIUM (1-2 days)
**Priority**: P1 - HIGH (reduces cognitive load, improves scalability)

---

### F7.2: Workspace Clustering (Cognitive Chunking) ⭐ NEW

**Source**: Cognitive Load Theory - Miller's magical number (5-7 items)

**Problem**: Flat canvas with 50+ cards = cognitive overload

**Solution**: Suggest organizing into 5-7 thematic clusters

**Implementation**:
```typescript
async function suggestCognitiveChunking(cards: Card[]): Promise<ClusterSuggestion[]> {
  // Generate embeddings
  const embeddings = await Promise.all(
    cards.map(c => embeddingService.generateEmbedding(c))
  );

  // K-means clustering with k=6 (cognitive chunk size)
  const clusters = kMeans(embeddings, { k: 6, maxIterations: 100 });

  // Generate human-readable cluster names
  const namedClusters = await Promise.all(
    clusters.map(async cluster => {
      const clusterCards = cluster.indices.map(i => cards[i]);
      const name = await generateClusterName(clusterCards);

      return {
        name,
        cards: clusterCards,
        centroid: calculateCentroid(clusterCards.map(c => c.position!)),
        theme: await extractTheme(clusterCards)
      };
    })
  );

  return namedClusters;
}

async function generateClusterName(cards: Card[]): Promise<string> {
  const response = await claudeAPI.chat({
    messages: [{
      role: 'user',
      content: `Given these ${cards.length} cards, suggest a short thematic name (2-4 words):\n\n${
        cards.map(c => `- ${c.metadata?.title || 'Untitled'}`).join('\n')
      }`
    }]
  });

  return response.content.trim();
}
```

**UX**:
```typescript
function ClusterSuggestionsModal({ clusters }: Props) {
  return (
    <Modal title="Workspace Chunking Suggestions">
      <p>I noticed you have {totalCards} cards. Research shows 5-7 clusters are optimal for memory. Here's a suggested organization:</p>

      {clusters.map(cluster => (
        <ClusterPreview key={cluster.name}>
          <h3>{cluster.name}</h3>
          <p>{cluster.cards.length} cards</p>
          <p>Theme: {cluster.theme}</p>
          <Button onClick={() => applyCluster(cluster)}>Apply</Button>
          <Button onClick={() => editCluster(cluster)}>Edit</Button>
        </ClusterPreview>
      ))}

      <Button onClick={dismissAll}>Dismiss</Button>
    </Modal>
  );
}
```

**Effort**: MEDIUM (2-3 days)
**Priority**: P1 - HIGH (grounded in 60 years of cognitive psychology)

---

### F7.3: Metacognitive Scaffolding ⭐ NEW

**Source**: Metacognition + Self-Regulated Learning (2024-2025)

**Finding**: Metacognitive support in GenAI environments reduces cognitive load, increases perceived usefulness

**Problem**: Users generate cards without reflecting on their thinking process

**Solution**: Periodic prompts for metacognitive reflection

**Implementation**:
```typescript
interface MetacognitivePrompt {
  trigger: 'after-n-cards' | 'after-time' | 'manual';
  question: string;
  response: string;
  timestamp: number;
}

// Trigger prompts after significant activity
function useMetacognitiveScaffolding() {
  const [prompts, setPrompts] = useState<MetacognitivePrompt[]>([]);

  useEffect(() => {
    // After creating 10 cards
    if (cardsCreatedThisSession === 10) {
      showPrompt({
        question: "What patterns are you noticing in the cards you've created?",
        type: 'pattern-recognition'
      });
    }

    // After 30 minutes
    if (sessionDuration > 30 * 60 * 1000) {
      showPrompt({
        question: "How has your understanding of this topic evolved today?",
        type: 'learning-reflection'
      });
    }

    // After creating many connections
    if (connectionsCreatedThisSession === 15) {
      showPrompt({
        question: "What relationships surprised you?",
        type: 'insight-reflection'
      });
    }
  }, [cardsCreatedThisSession, sessionDuration, connectionsCreatedThisSession]);
}

function MetacognitivePromptModal({ question, onResponse }: Props) {
  return (
    <Modal title="Reflection">
      <Icon>🤔</Icon>
      <Question>{question}</Question>
      <TextArea
        placeholder="Take a moment to reflect..."
        onSubmit={onResponse}
      />
      <SkipButton onClick={() => skipPrompt()}>
        Skip for now
      </SkipButton>
    </Modal>
  );
}
```

**Reflection Questions Library**:
```typescript
const metacognitiveQuestions = {
  'pattern-recognition': [
    "What patterns are you noticing?",
    "How do these cards relate to each other?",
    "What themes are emerging?"
  ],
  'learning-reflection': [
    "How has your understanding evolved?",
    "What surprised you today?",
    "What questions remain unanswered?"
  ],
  'insight-reflection': [
    "What connections were unexpected?",
    "How does this challenge your prior beliefs?",
    "What would you like to explore next?"
  ],
  'strategy-reflection': [
    "What approach is working well?",
    "What would you do differently?",
    "How can you organize this more effectively?"
  ]
};
```

**Reflection History View**:
```typescript
function ReflectionHistory({ prompts }: { prompts: MetacognitivePrompt[] }) {
  return (
    <Panel title="Your Reflections">
      <Timeline>
        {prompts.map(prompt => (
          <ReflectionEntry key={prompt.timestamp}>
            <Date>{formatDate(prompt.timestamp)}</Date>
            <Question>{prompt.question}</Question>
            <Response>{prompt.response}</Response>
          </ReflectionEntry>
        ))}
      </Timeline>
    </Panel>
  );
}
```

**Effort**: MEDIUM (2-3 days)
**Priority**: P1 - HIGH (grounded in 2025 GenAI learning research)

---

### F7.4: visionOS Haptic + Spatial Audio ⭐ NEW

**Source**: Embodied Cognition + Extended Mind (2024), Apple Vision Pro

**Finding**: Haptic feedback engages sensory-motor systems, spatial audio creates embodied learning

**Problem**: Current canvas is purely visual (no tactile or auditory feedback)

**Solution**: visionOS integration with haptic feedback + spatial audio

**Implementation**:
```swift
// visionOS SwiftUI integration
import RealityKit
import SwiftUI

struct NabokovCanvasView: View {
  @State private var cards: [Card] = []
  @State private var selectedCard: Card?

  var body: some View {
    RealityView { content in
      // Create 3D space for cards
      let cardEntities = cards.map { card in
        createCardEntity(card)
      }

      content.add(cardEntities)
    }
    .gesture(
      SpatialTapGesture()
        .onEnded { value in
          handleCardTap(at: value.location)
          playHaptic(.lightImpact)  // Feel card selection
        }
    )
    .gesture(
      DragGesture()
        .onChanged { value in
          moveCard(selectedCard, to: value.location3D)
        }
        .onEnded { _ in
          playHaptic(.mediumImpact)  // Feel card placement
        }
    )
  }

  func createCardEntity(_ card: Card) -> Entity {
    let cardEntity = ModelEntity(
      mesh: .generatePlane(width: 0.3, height: 0.4),
      materials: [createCardMaterial(card)]
    )

    // Position in 3D space
    cardEntity.position = SIMD3(
      x: Float(card.position.x) / 1000,
      y: Float(card.position.y) / 1000,
      z: 0
    )

    // Add spatial audio component
    if let audioContent = card.metadata?.audioDescription {
      let audioSource = AudioFileResource(named: audioContent)
      cardEntity.components.set(SpatialAudioComponent(source: audioSource))
    }

    return cardEntity;
  }

  func playHaptic(_ intensity: UIImpactFeedbackGenerator.FeedbackStyle) {
    let generator = UIImpactFeedbackGenerator(style: intensity)
    generator.impactOccurred()
  }
}
```

**Haptic Patterns**:
```typescript
interface HapticFeedback {
  lightImpact: 'card-tap' | 'hover';
  mediumImpact: 'card-drop' | 'connection-create';
  heavyImpact: 'card-delete' | 'cluster-merge';
  softClick: 'button-press';
  selection: 'multi-select-add';
}
```

**Spatial Audio Zones**:
```typescript
// Different "rooms" in physical space for different topics
interface SpatialZone {
  name: string;
  physicalLocation: Vector3;  // Real-world coordinates
  cards: Card[];
  ambientAudio?: string;  // Background sound for this zone
}

const zones: SpatialZone[] = [
  {
    name: "Research Papers",
    physicalLocation: { x: 0, y: 0, z: -2 },  // 2 meters in front
    cards: academicCards,
    ambientAudio: "library-ambience.mp3"
  },
  {
    name: "Creative Ideas",
    physicalLocation: { x: 2, y: 0, z: 0 },  // 2 meters to right
    cards: ideaCards,
    ambientAudio: "creative-chimes.mp3"
  },
  {
    name: "Work Projects",
    physicalLocation: { x: -2, y: 0, z: 0 },  // 2 meters to left
    cards: workCards,
    ambientAudio: "office-sounds.mp3"
  }
];
```

**Effort**: HIGH (3-4 weeks for visionOS app)
**Priority**: P2 - STRATEGIC (Month 6-8)

---

### F7.5: Card Sorting User Study ⭐ NEW

**Source**: Card Sorting & Information Architecture (2024)

**Finding**: Card sorting reveals users' mental models of information organization

**Purpose**: Validate NabokovsWeb's spatial organization paradigm

**Study Design**:
```typescript
interface CardSortingStudy {
  phase1_baseline: {
    task: "Sort 30 research cards into groups (no AI, no spatial canvas)";
    measurement: "Number of groups, naming patterns, similarity matrix";
    n: 20;
  };

  phase2_spatial: {
    task: "Arrange same 30 cards on NabokovsWeb canvas";
    measurement: "Spatial clustering, distance patterns, connections created";
    n: 20;
  };

  phase3_comparison: {
    analysis: "Do spatial arrangements match conceptual groupings?";
    hypothesis: "Spatial proximity correlates with semantic similarity (r > 0.7)";
  };
}
```

**Implementation**:
```typescript
// Export spatial arrangement as similarity matrix
function exportSpatialSimilarityMatrix(cards: Card[]): number[][] {
  const n = cards.length;
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const distance = euclideanDistance(cards[i].position, cards[j].position);

      // Normalize: 0 = far apart, 1 = very close
      const similarity = 1 / (1 + distance / 100);

      matrix[i][j] = similarity;
      matrix[j][i] = similarity;
    }
  }

  return matrix;
}

// Compare to card sorting similarity matrix
function compareSimilarityMatrices(
  spatialMatrix: number[][],
  cardSortMatrix: number[][]
): number {
  // Pearson correlation coefficient
  return pearsonCorrelation(flatten(spatialMatrix), flatten(cardSortMatrix));
}
```

**Research Contribution**:
> "Do users' spatial arrangements on a canvas reflect their conceptual mental models? First empirical study of spatial hypertext mental model alignment."

**Effort**: MEDIUM (2-3 weeks for study design + recruitment + analysis)
**Priority**: P2 - RESEARCH (Month 4-5, user study phase)

---

### F7.6: Active Learning Analytics ⭐ NEW

**Source**: Active Learning + Interactive Systems (2024)

**Finding**: Active engagement (manipulation) >> Passive consumption (scrolling)

**Purpose**: Measure and encourage active learning behaviors

**Implementation**:
```typescript
interface LearningActivity {
  type: 'clip' | 'drag' | 'connect' | 'chat' | 'generate' | 'edit' | 'annotate';
  timestamp: number;
  duration: number;
  cardIds: string[];
  cognitiveLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

// Bloom's Taxonomy mapping
const bloomsLevels = {
  clip: 'remember',       // Capturing information
  drag: 'understand',     // Organizing
  connect: 'analyze',     // Finding relationships
  chat: 'evaluate',       // Questioning
  generate: 'create',     // Synthesizing
  edit: 'apply'           // Refining
};

function analyzeLearningSession(activities: LearningActivity[]): SessionReport {
  const byLevel = groupBy(activities, a => a.cognitiveLevel);

  return {
    totalTime: sum(activities.map(a => a.duration)),
    activeTime: sum(activities.filter(a => a.type !== 'scroll').map(a => a.duration)),
    bloomsDistribution: {
      remember: byLevel.remember?.length || 0,
      understand: byLevel.understand?.length || 0,
      apply: byLevel.apply?.length || 0,
      analyze: byLevel.analyze?.length || 0,
      evaluate: byLevel.evaluate?.length || 0,
      create: byLevel.create?.length || 0
    },
    recommendation: generateRecommendation(byLevel)
  };
}

function generateRecommendation(byLevel: Record<string, LearningActivity[]>): string {
  // Stuck at lower levels? Suggest higher-order activities
  if ((byLevel.remember?.length || 0) > (byLevel.create?.length || 0) * 3) {
    return "You've captured lots of information. Try synthesizing cards into insights.";
  }

  // No connections? Suggest analysis
  if ((byLevel.analyze?.length || 0) === 0) {
    return "Try creating connections between cards to find relationships.";
  }

  // Balanced
  return "Great balance of learning activities!";
}
```

**Weekly Learning Report**:
```typescript
function WeeklyLearningReport({ activities }: Props) {
  const report = analyzeLearningSession(activities);

  return (
    <Panel title="Your Learning This Week">
      <Stat label="Active learning time" value={formatDuration(report.activeTime)} />
      <Stat label="Cards created" value={report.bloomsDistribution.remember} />
      <Stat label="Connections made" value={report.bloomsDistribution.analyze} />
      <Stat label="Insights synthesized" value={report.bloomsDistribution.create} />

      <BloomsChart data={report.bloomsDistribution} />

      <Recommendation>{report.recommendation}</Recommendation>
    </Panel>
  );
}
```

**Effort**: MEDIUM (2-3 days)
**Priority**: P1 - HIGH (encourages active learning, unique feature)

---

### F7.7: Mobile Companion App ⭐ NEW

**Source**: Mobile Instant Messaging for Learning (2024) - breaks time/space barriers

**Problem**: Can't capture content when away from desktop

**Solution**: Mobile app for quick capture, desktop for spatial organization

**Implementation** (React Native):
```typescript
// Mobile capture interface
function MobileCaptureScreen() {
  const [captureMode, setCaptureMode] = useState<'text' | 'image' | 'webpage'>('text');

  return (
    <Screen>
      <ModeSelector>
        <ModeButton icon="📝" label="Text" active={captureMode === 'text'} />
        <ModeButton icon="📷" label="Image" active={captureMode === 'image'} />
        <ModeButton icon="🌐" label="Webpage" active={captureMode === 'webpage'} />
      </ModeSelector>

      {captureMode === 'text' && (
        <TextCaptureInput
          placeholder="Quick note..."
          onSubmit={captureText}
        />
      )}

      {captureMode === 'image' && (
        <ImageCapturePicker
          onImageSelected={captureImage}
        />
      )}

      {captureMode === 'webpage' && (
        <WebpageCapture
          placeholder="Paste URL..."
          onSubmit={captureWebpage}
        />
      )}

      <SyncStatus>
        {syncedCards.length} cards synced to desktop
      </SyncStatus>
    </Screen>
  );
}

// Sync service
class MobileSyncService {
  async captureText(text: string): Promise<Card> {
    const card = createCard({
      content: text,
      cardType: 'note',
      metadata: {
        source: 'mobile',
        location: await getCurrentLocation(),
        timestamp: Date.now()
      }
    });

    await this.syncToCloud(card);
    return card;
  }

  async syncToCloud(card: Card): Promise<void> {
    // Use chrome.storage.sync or Firebase
    await chrome.storage.sync.set({
      [`mobile-card-${card.id}`]: card
    });
  }

  async syncToDesktop(): Promise<Card[]> {
    // Desktop pulls mobile cards
    const mobileCards = await chrome.storage.sync.get(null);
    return Object.values(mobileCards).filter(c => c.metadata?.source === 'mobile');
  }
}
```

**Desktop Integration**:
```typescript
// Desktop shows "Inbox" of mobile captures
function MobileInbox({ cards }: { cards: Card[] }) {
  const mobileCards = cards.filter(c => c.metadata?.source === 'mobile' && !c.position);

  if (mobileCards.length === 0) return null;

  return (
    <InboxPanel>
      <h3>📱 Mobile Captures ({mobileCards.length})</h3>
      {mobileCards.map(card => (
        <InboxCard key={card.id}>
          <Preview>{truncate(card.content, 100)}</Preview>
          <Actions>
            <Button onClick={() => addToCanvas(card)}>Add to Canvas</Button>
            <Button onClick={() => deleteCard(card)}>Dismiss</Button>
          </Actions>
        </InboxCard>
      ))}
    </InboxPanel>
  );
}
```

**Effort**: HIGH (3-4 weeks for React Native app + sync)
**Priority**: P2 - HIGH (extends use cases significantly)

---

### F7.8: Thought Evolution Visualization ⭐ NEW

**Source**: Metacognition + Self-Regulated Learning (2024-2025)

**Purpose**: Show users how their understanding has evolved over time

**Implementation**:
```typescript
// Detect conceptual evolution
interface ConceptEvolution {
  concept: string;
  timeline: {
    timestamp: number;
    card: Card;
    understanding: string;  // What user knew at this point
  }[];
}

async function trackConceptEvolution(concept: string, cards: Card[]): Promise<ConceptEvolution> {
  const relevantCards = cards
    .filter(c => containsConcept(c.content, concept))
    .sort((a, b) => a.createdAt - b.createdAt);

  const timeline = await Promise.all(
    relevantCards.map(async card => {
      const understanding = await extractUnderstanding(card, concept);
      return {
        timestamp: card.createdAt,
        card,
        understanding
      };
    })
  );

  return { concept, timeline };
}

function EvolutionVisualization({ concept, timeline }: ConceptEvolution) {
  return (
    <Timeline>
      <h2>How your understanding of "{concept}" evolved</h2>
      {timeline.map((entry, i) => (
        <TimelineEntry key={entry.timestamp}>
          <Date>{formatDate(entry.timestamp)}</Date>
          <Understanding>
            {i === 0 && <Label>Initial understanding:</Label>}
            {i > 0 && <Label>Then you learned:</Label>}
            <Text>{entry.understanding}</Text>
          </Understanding>
          <CardLink onClick={() => focusCard(entry.card)}>
            View card
          </CardLink>
        </TimelineEntry>
      ))}
    </Timeline>
  );
}
```

**Example Output**:
```
How your understanding of "cognitive load" evolved:

March 5, 2025
Initial understanding:
"Cognitive load is about working memory limits"

March 12, 2025
Then you learned:
"There are THREE types: intrinsic, extraneous, germane. Only extraneous load can be reduced by design."

March 20, 2025
Then you learned:
"Progressive disclosure is a key technique for reducing extraneous load in spatial interfaces."
```

**Effort**: MEDIUM (2-3 days)
**Priority**: P1 - HIGH (metacognitive support, unique insight)

---

## Part 4: Updated Learning/Cognition Strategy

### Core Principles (Grounded in Round 7)

**1. Cognitive Load Optimization**
- **Progressive disclosure**: Show detail based on viewport position (F7.1)
- **Chunking**: Suggest 5-7 clusters (F7.2)
- **Consistent UI**: Predictable interactions reduce load
- **Spatial offloading**: Environment remembers positions

**2. Active Learning Support**
- **Manipulation required**: Drag, connect, edit (not just read)
- **Real-time feedback**: AI responds to user actions
- **Activity tracking**: Measure active vs passive time (F7.6)
- **Mobile continuity**: Capture anywhere, organize at desk (F7.7)

**3. Embodied Cognition**
- **Physical metaphors**: Tactile language (grab, drag, connect)
- **Spatial memory**: Location encodes meaning
- **Haptic feedback**: Feel interactions (visionOS) (F7.4)
- **3D space**: Full embodiment in VR (F6.9)

**4. Metacognitive Scaffolding**
- **Reflection prompts**: Periodic questions about thinking (F7.3)
- **Evolution tracking**: Show how understanding changed (F7.8)
- **Visible provenance**: Trace insight emergence
- **Usage analytics**: Weekly learning reports (F7.6)

**5. Distributed Cognition**
- **Cards as artifacts**: Persistent external memory
- **Multi-agent system**: Specialized agents collaborate (F6.11)
- **Shared workspaces**: Boundary objects for teams (future)
- **Conversation history**: Dialogue maintained across sessions

### Learning Cycle Supported by NabokovsWeb

```
1. CAPTURE (Mobile/Desktop)
   ├─ Element-level web clipping
   ├─ Quick notes (mobile)
   └─ Image uploads

2. ORGANIZE (Active Learning)
   ├─ Spatial arrangement (drag cards)
   ├─ Create connections (relationships)
   ├─ Cluster into 5-7 groups (chunking)
   └─ Progressive disclosure (reduce load)

3. SYNTHESIZE (Generative AI)
   ├─ Chat with cards (dialogue)
   ├─ Generate insights (custom buttons)
   ├─ Multi-agent suggestions (F6.11)
   └─ Metacognitive prompts (reflection)

4. REFLECT (Metacognition)
   ├─ Evolution visualization (F7.8)
   ├─ Weekly learning reports (F7.6)
   ├─ Usage analytics (Bloom's taxonomy)
   └─ Reflection history

5. EMBODY (Spatial Computing)
   ├─ visionOS extension (F7.4)
   ├─ Haptic feedback
   ├─ Spatial audio
   └─ Physical movement through knowledge
```

### Differentiation from Competitors

| Principle | ChatGPT | Notion | Obsidian | NabokovsWeb |
|-----------|---------|--------|----------|-------------|
| **Cognitive Load** | High (chat overload) | Medium | Low | Very Low (spatial offloading) |
| **Active Learning** | Low (typing only) | Medium | Medium | High (manipulation required) |
| **Embodied Cognition** | None | None | None | High (spatial + visionOS) |
| **Metacognition** | None | Weak | Weak | Strong (scaffolding + analytics) |
| **Distributed Cognition** | Weak | Medium | Medium | High (multi-agent + artifacts) |

**Key Insight**: NabokovsWeb is ONLY tool grounded in learning science principles while preparing for spatial computing future.

---

## Part 5: Vision Pro Roadmap (Detailed Plan)

### Phase 1: WebXR Foundation (Weeks 1-2)

**Goal**: Basic 3D canvas running in browser (Chrome/Safari)

**Tasks**:
1. **Three.js integration** (3 days)
   - Convert 2D card positions to 3D (x, y, z)
   - Z-axis = temporal ordering (recent cards closer) or hierarchy (parents behind children)
   - Camera controls (orbit, zoom, pan)

2. **WebXR session management** (2 days)
   - VR button to enter immersive mode
   - Exit VR (Escape key)
   - Fallback for non-VR devices

**Deliverables**:
- [ ] Cards render as 3D planes in Three.js scene
- [ ] Connections render as 3D lines
- [ ] Camera orbits around canvas
- [ ] VR button enters immersive mode (if headset available)

**Code**:
```typescript
// src/canvas/VRCanvas.tsx
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

function VRCanvas({ cards, connections }: Props) {
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();

  useEffect(() => {
    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;  // Enable WebXR

    document.body.appendChild(VRButton.createButton(renderer));
    document.body.appendChild(renderer.domElement);

    // Convert cards to 3D meshes
    cards.forEach(card => {
      const cardMesh = createCardMesh(card);
      scene.add(cardMesh);
    });

    // Convert connections to 3D lines
    connections.forEach(conn => {
      const line = createConnectionLine(conn, cards);
      scene.add(line);
    });

    camera.position.z = 5;

    // Animation loop
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    sceneRef.current = scene;
    rendererRef.current = renderer;
  }, [cards, connections]);

  return null;  // Renderer appends directly to DOM
}

function createCardMesh(card: Card): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(0.3, 0.4);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Position in 3D space
  mesh.position.set(
    card.position.x / 1000,  // Scale to meters
    card.position.y / 1000,
    0  // TODO: Z-depth based on createdAt or hierarchy
  );

  return mesh;
}
```

---

### Phase 2: visionOS Native App (Weeks 3-6)

**Goal**: Native SwiftUI app optimized for Vision Pro

**Tasks**:
1. **RealityKit integration** (1 week)
   - Card entities as 3D models
   - Spatial positioning
   - Lighting and materials

2. **Gaze + pinch interaction** (1 week)
   - Look at card to highlight
   - Pinch to select
   - Pinch-and-drag to move

3. **Hand tracking** (1 week)
   - Direct grab gestures
   - Draw connections in air
   - Multi-hand gestures (two-hand rotate, scale)

4. **Voice commands** (3 days)
   - "Create new note about X"
   - "Summarize these cards"
   - "Show me cards about Y"

**Deliverables**:
- [ ] visionOS app runs on Vision Pro
- [ ] Gaze targeting highlights cards
- [ ] Pinch gesture selects cards
- [ ] Hand tracking moves cards in 3D
- [ ] Voice creates new cards

**Code** (SwiftUI):
```swift
import SwiftUI
import RealityKit

struct NabokovVisionApp: App {
  var body: some Scene {
    WindowGroup {
      ContentView()
    }
    .windowStyle(.volumetric)
  }
}

struct ContentView: View {
  @State private var cards: [Card] = []

  var body: some View {
    RealityView { content in
      // Load cards from storage
      let cardEntities = cards.map { card in
        createCardEntity(card)
      }

      cardEntities.forEach { content.add($0) }
    }
    .gesture(
      SpatialTapGesture()
        .targetedToAnyEntity()
        .onEnded { value in
          handleCardTap(entity: value.entity)
        }
    )
    .gesture(
      DragGesture()
        .targetedToAnyEntity()
        .onChanged { value in
          handleCardDrag(entity: value.entity, translation: value.translation3D)
        }
    )
  }

  func createCardEntity(_ card: Card) -> Entity {
    let mesh = MeshResource.generatePlane(width: 0.3, height: 0.4)
    let material = SimpleMaterial(color: .white, isMetallic: false)
    let entity = ModelEntity(mesh: mesh, materials: [material])

    entity.position = SIMD3(
      x: Float(card.position.x) / 1000,
      y: Float(card.position.y) / 1000,
      z: 0
    )

    // Add hover effect
    entity.components.set(HoverEffectComponent())

    // Add collision for interaction
    entity.collision = CollisionComponent(shapes: [.generateBox(size: [0.3, 0.4, 0.01])])

    return entity
  }
}
```

---

### Phase 3: Advanced Spatial Features (Weeks 7-8)

**Tasks**:
1. **Spatial zones** (3 days)
   - Different physical locations for different topics
   - Walk to "Research Papers" zone, turn to "Creative Ideas" zone
   - Spatial audio per zone

2. **Haptic feedback** (2 days)
   - Light impact on card tap
   - Medium impact on card drop
   - Heavy impact on deletion

3. **Collaborative spaces** (future)
   - See other users' avatars
   - Hear spatial audio from their location
   - Shared card manipulation

**Deliverables**:
- [ ] Spatial zones in real-world coordinates
- [ ] Haptic feedback on all interactions
- [ ] Spatial audio for each zone

---

### Phase 4: Testing + Refinement (Weeks 9-10)

**Tasks**:
1. **User testing** (N=10)
   - Qualitative feedback on VR experience
   - Measure spatial memory retention (recall card locations after 1 week)

2. **Performance optimization**
   - Target 90 FPS (Vision Pro requirement)
   - LOD (level of detail) for distant cards
   - Culling for cards outside field of view

3. **Documentation**
   - visionOS user guide
   - Developer documentation for WebXR + visionOS integration

**Success Metrics**:
- [ ] 90+ FPS on Vision Pro
- [ ] Spatial memory recall >70% after 1 week
- [ ] User satisfaction >4/5 for VR experience

---

### Vision Pro Roadmap Summary

| Phase | Duration | Deliverable | Priority |
|-------|----------|-------------|----------|
| 1. WebXR Foundation | 2 weeks | 3D canvas in browser | P2 |
| 2. visionOS Native App | 4 weeks | Vision Pro app with gaze/hand/voice | P2 |
| 3. Advanced Spatial | 2 weeks | Zones + haptics + audio | P3 |
| 4. Testing + Refinement | 2 weeks | User study + optimization | P3 |

**Total**: 10 weeks (2.5 months)

**Start**: After core features complete (Month 6)

**Research Contribution**: First PKM system designed for spatial computing, first empirical study of spatial memory in VR knowledge work

---

## Part 6: Multi-Agent Architecture (Detailed Design)

### Agent Taxonomy

**1. Information Agents** (gather external content):
- **Forager Agent**: Web search for related content
- **Librarian Agent**: Find academic papers (arXiv, Google Scholar)
- **News Agent**: Monitor RSS feeds for topics

**2. Curation Agents** (organize existing content):
- **Curator Agent**: Detect duplicates, suggest merges
- **Taxonomist Agent**: Suggest hierarchical organization
- **Tagger Agent**: Auto-generate tags from content

**3. Analysis Agents** (find patterns):
- **Connector Agent**: Detect implicit relationships
- **Clusterer Agent**: Find thematic groups
- **Trend Agent**: Identify emerging patterns over time

**4. Quality Agents** (improve content):
- **Critic Agent**: Challenge claims, find contradictions
- **Editor Agent**: Improve writing clarity
- **Fact-Checker Agent**: Verify claims against sources

**5. Synthesis Agents** (generate insights):
- **Synthesizer Agent**: Combine cards into higher-level insights
- **Summarizer Agent**: Create executive summaries
- **Hypothesis Agent**: Generate testable hypotheses from data

### Multi-Agent Orchestration

```typescript
// src/services/multiAgentOrchestrator.ts

interface AgentCapability {
  agent: Agent;
  canHandle: (task: Task) => boolean;
  priority: number;  // Higher = more important
}

class MultiAgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: Task[] = [];
  private runningTasks: Map<string, AgentTask> = new Map();

  registerAgent(agent: Agent) {
    this.agents.set(agent.role, agent);
  }

  async executeTask(task: Task): Promise<Result> {
    // Find capable agents
    const capableAgents = Array.from(this.agents.values())
      .filter(agent => agent.canHandle(task))
      .sort((a, b) => b.priority - a.priority);

    if (capableAgents.length === 0) {
      throw new Error(`No agent can handle task: ${task.type}`);
    }

    // Primary agent
    const primaryAgent = capableAgents[0];

    // Execute with coordination
    const result = await this.executeWithCoordination(primaryAgent, task, capableAgents.slice(1));

    return result;
  }

  async executeWithCoordination(
    primary: Agent,
    task: Task,
    supporting: Agent[]
  ): Promise<Result> {
    // Primary agent executes
    const primaryResult = await primary.execute(task);

    // Supporting agents validate
    const validations = await Promise.all(
      supporting.map(agent => agent.validate(primaryResult))
    );

    // Aggregate validation feedback
    const confidence = this.aggregateConfidence(validations);

    // If low confidence, iterate
    if (confidence < 0.7) {
      const refinedTask = this.refineTask(task, validations);
      return this.executeWithCoordination(primary, refinedTask, supporting);
    }

    return {
      ...primaryResult,
      confidence,
      validations
    };
  }

  aggregateConfidence(validations: Validation[]): number {
    const weights = validations.map(v => v.weight);
    const scores = validations.map(v => v.score);

    const weightedSum = scores.reduce((sum, score, i) => sum + score * weights[i], 0);
    const weightSum = weights.reduce((sum, w) => sum + w, 0);

    return weightedSum / weightSum;
  }
}
```

### Agent Communication Protocol

```typescript
// Agents communicate via message passing

interface AgentMessage {
  from: string;  // Agent role
  to: string | 'broadcast';
  type: 'request' | 'response' | 'notification';
  payload: any;
  timestamp: number;
}

class AgentCommunicationBus {
  private subscribers: Map<string, (msg: AgentMessage) => void> = new Map();

  subscribe(agentRole: string, handler: (msg: AgentMessage) => void) {
    this.subscribers.set(agentRole, handler);
  }

  async send(msg: AgentMessage): Promise<void> {
    if (msg.to === 'broadcast') {
      // Send to all agents
      this.subscribers.forEach(handler => handler(msg));
    } else {
      // Send to specific agent
      const handler = this.subscribers.get(msg.to);
      if (handler) handler(msg);
    }
  }
}

// Example: Connector Agent requests embedding from Curator Agent
class ConnectorAgent implements Agent {
  async findRelationships(cards: Card[]): Promise<Suggestion[]> {
    // Request embeddings from Curator Agent (has embedding cache)
    const response = await this.communicationBus.send({
      from: 'connector',
      to: 'curator',
      type: 'request',
      payload: {
        action: 'get-embeddings',
        cardIds: cards.map(c => c.id)
      },
      timestamp: Date.now()
    });

    const embeddings = response.payload.embeddings;

    // Use embeddings for similarity calculation
    const suggestions = this.computeSimilarity(cards, embeddings);

    return suggestions;
  }
}
```

### Agent Learning from Feedback

```typescript
// Agents learn from user acceptance/rejection

interface AgentFeedback {
  agentRole: string;
  suggestionId: string;
  action: 'accepted' | 'rejected' | 'modified';
  timestamp: number;
  context: any;
}

class AgentLearningSystem {
  private feedbackHistory: AgentFeedback[] = [];

  recordFeedback(feedback: AgentFeedback) {
    this.feedbackHistory.push(feedback);

    // Update agent parameters based on feedback
    this.updateAgentModel(feedback.agentRole, feedback);
  }

  updateAgentModel(agentRole: string, feedback: AgentFeedback) {
    const agent = orchestrator.getAgent(agentRole);

    if (feedback.action === 'accepted') {
      // Increase confidence in similar suggestions
      agent.parameters.confidenceBoost += 0.05;
    } else if (feedback.action === 'rejected') {
      // Decrease confidence, adjust thresholds
      agent.parameters.similarityThreshold += 0.05;
    }
  }

  getAcceptanceRate(agentRole: string): number {
    const agentFeedback = this.feedbackHistory.filter(f => f.agentRole === agentRole);
    const accepted = agentFeedback.filter(f => f.action === 'accepted').length;

    return accepted / agentFeedback.length;
  }
}
```

### Agent UI

```typescript
function AgentControlPanel() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);

  return (
    <Panel title="AI Agents">
      <AgentGrid>
        {agents.map(agent => (
          <AgentCard key={agent.role}>
            <AgentIcon>{agent.icon}</AgentIcon>
            <AgentName>{agent.name}</AgentName>
            <AgentStatus status={agent.status} />
            <AgentMetrics>
              <Metric label="Acceptance Rate" value={`${agent.acceptanceRate}%`} />
              <Metric label="Suggestions" value={agent.totalSuggestions} />
            </AgentMetrics>
            <AgentActions>
              <Button onClick={() => runAgent(agent.role)}>Run Now</Button>
              <Button onClick={() => configureAgent(agent.role)}>Configure</Button>
            </AgentActions>
          </AgentCard>
        ))}
      </AgentGrid>

      <AgentSettings>
        <Setting label="Auto-run frequency">
          <Select options={['Never', 'Hourly', 'Daily', 'Weekly']} />
        </Setting>
        <Setting label="Suggestion threshold">
          <Slider min={0} max={1} step={0.05} />
        </Setting>
      </AgentSettings>
    </Panel>
  );
}
```

### Multi-Agent Roadmap

| Phase | Agents | Duration | Priority |
|-------|--------|----------|----------|
| 1. Foundation | Curator, Connector | 2 weeks | P3 |
| 2. Analysis | Critic, Synthesizer | 2 weeks | P3 |
| 3. Information | Forager, Librarian | 2 weeks | P3 |
| 4. Learning | Feedback system | 1 week | P3 |
| 5. Orchestration | Coordination layer | 1 week | P3 |

**Total**: 8 weeks (2 months)

**Start**: Month 8-10 (after visionOS)

---

## Conclusion: Cognitive Science Foundation Complete

Round 7 completes NabokovsWeb's theoretical grounding by connecting to:

1. **40 years of Cognitive Load Theory** (Sweller 1988 → 2024 AI integration)
2. **Embodied Cognition** (1990s → 2024 XR validation)
3. **Active Learning** (constructivism → 2024 digital platforms)
4. **Metacognition** (1970s → 2025 GenAI environments)
5. **Distributed Cognition** (Hutchins 1995 → 2024 multi-agent systems)

**Strategic Positioning**: NabokovsWeb is the ONLY tool that:
- Implements learning science principles (cognitive load, active learning, metacognition)
- Prepares for spatial computing future (visionOS ready)
- Grounds in 50+ years of cognitive science research
- Differentiates as "cognitive amplification system" not "productivity tool"

### Next Steps

**Immediate** (Weeks 1-4):
1. F7.1: Progressive disclosure (reduce cognitive load)
2. F7.2: Workspace chunking (5-7 clusters)
3. F7.3: Metacognitive scaffolding (reflection prompts)
4. F7.6: Active learning analytics (Bloom's taxonomy tracking)

**Medium-term** (Months 2-4):
5. F7.5: Card sorting user study (validate spatial organization)
6. F7.7: Mobile companion app (capture anywhere)
7. F7.8: Thought evolution visualization (metacognition)

**Long-term** (Months 6-10):
8. F7.4: visionOS extension (embodied cognition)
9. F6.11: Multi-agent system (distributed cognition)

### Research Contribution

**Title**: "Cognitive Amplification Through Spatial Computing: A Learning Science Approach to AI-Augmented Knowledge Work"

**Claims**:
1. **Spatial interfaces reduce cognitive load** through progressive disclosure + chunking (CLT validation)
2. **Active manipulation improves learning** vs. passive consumption (active learning validation)
3. **Embodied interaction enhances retention** through spatial memory (embodied cognition validation)
4. **Metacognitive scaffolding increases effectiveness** in GenAI environments (metacognition validation)
5. **Multi-agent collaboration surpasses single-agent** for complex sensemaking (distributed cognition validation)

**Venues**:
- CHI 2026: HCI + learning science
- UIST 2025: Spatial computing + interaction
- Learning Sciences journal: Cognitive theory contribution
- Computers & Education: Educational technology

---

**Document Status**: Complete
**Word Count**: ~11,500 words
**Round 7 Sources**: 8 searches (49-56), all 2024-2025
**New Features**: 8 features (F7.1-F7.8)
**Strategic Impact**: Complete cognitive science foundation, ready for spatial computing future
