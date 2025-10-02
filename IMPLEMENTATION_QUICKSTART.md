# NabokovsWeb: Implementation Quick Start Guide

**Purpose**: Actionable 8-10 week roadmap to competitive parity based on 32 research sources analyzed across 4 rounds
**Date**: 2025-10-02
**For**: Warren (developer) to begin implementation immediately

---

## TL;DR: What to Do Next

### This Week (Week 1)
1. **Typed Node System** - 1 day - Refactor to discriminated unions
2. **History Tracking** - 1 day - Foundation for undo + navigable history
3. **Backlinks Panel** - 4 hours - Competitive parity
4. **Storage Quota** - 2 hours - Prevent data loss

**Total**: 2.75 days → Foundation complete

### Weeks 3-6
- **Semantic Embeddings** (3-4 days): $0.01/1000 cards, unlocks search/suggestions/clustering/duplicates
- **Multilevel Abstraction** (4-5 days): React Flow parent nodes, scales to 100+ cards
- **Graph View** (3-4 days): Cytoscape.js, competitive expectation
- **Undo/Redo** (2-3 days): User confidence

### Months 2-3
- Navigable history UI (research novelty)
- Smart properties (Notion-style)
- Inline annotations (educational use case)

### Month 4
- User study (EASS scale, N=40)

---

## Key Research Findings

### 1. Current Architecture is Optimal ✅
**No refactoring needed.** chrome.storage.local + IndexedDB validated by Round 4.
- chrome.storage.local: Card metadata (syncs across devices)
- IndexedDB: Screenshots (local-only, 10x faster for large objects)
- Chrome 2024 Snappy compression automatic

**Action**: Focus on features, not infrastructure

---

### 2. Semantic Embeddings Have Highest ROI 🎯
**$0.01 per 1000 cards** unlocks 4+ features:
1. Semantic search (find without exact keywords)
2. Connection suggestions (spatial + semantic hybrid)
3. Topic clustering (no manual tags)
4. Duplicate detection (similarity > 0.95)

**Why affordable**: OpenAI text-embedding-3-small $0.00002/1K tokens
- 1000 cards × 500 tokens = 500K tokens = $0.01
- Cached forever (recompute only on edit)
- Client-side similarity (cosine) free

**Implementation**: See ROUND4_SYNTHESIS.md Pattern 4 for full code

**Priority**: HIGH (Weeks 3-4)

---

### 3. React Flow Already Supports Hierarchy 🏗️
**Parent/child nodes built-in** - no new library needed
- `parentId` field links child to parent
- `extent: 'parent'` constrains child to parent bounds
- Collapse/expand groups scales to 100+ cards
- Addresses Sensecape multilevel abstraction gap

**Code Example**:
```typescript
// Parent (group) node
{
  id: 'group-1',
  type: 'group',
  position: { x: 100, y: 100 },
  data: { label: 'Research Topic', collapsed: false }
}

// Child card
{
  id: 'card-1',
  parentId: 'group-1',
  position: { x: 20, y: 20 },  // Relative to parent
  extent: 'parent'  // Can't drag outside
}
```

**Priority**: CRITICAL (Week 5, after embeddings)

---

### 4. Cytoscape.js for Graph View 📊
**Order of magnitude better** than vis.js for knowledge graphs
- Force-directed layout reveals clusters
- Handles 1000+ nodes smoothly
- Analytics: find hubs, islands, paths
- Roam/Obsidian users expect this

**Implementation**: See ROUND4_SYNTHESIS.md Pattern 3 for full code

**Priority**: HIGH (Week 6)

---

### 5. Foundation Enables Everything 🧱
**Week 1 foundation unlocks all future features**

**Typed Nodes**:
- Discriminated unions for card types
- Type safety prevents bugs
- Foundation for multilevel abstraction

**History Tracking**:
- Foundation for undo/redo
- Foundation for navigable history (VKB-style)
- Circular buffer (1000 events max)

**Backlinks Panel**:
- Competitive parity (Roam/Obsidian standard)
- Trivial: `connections.filter(c => c.target === cardId)`

**Storage Quota**:
- Prevent data loss
- `navigator.storage.estimate()` on load

**Priority**: CRITICAL (Do first)

---

## Three Most Important Code Patterns

### Pattern 1: Typed Nodes (TypeScript Discriminated Unions)

```typescript
type ClippedCardNode = Node<{
  card: Card & { cardType: 'clipped' }
  screenshotId: string  // Required
}, 'clippedCard'>

type GeneratedCardNode = Node<{
  card: Card & { cardType: 'generated' }
  parentCardId: string  // Required
  generationContext: GenerationContext
}, 'generatedCard'>

type GroupNode = Node<{
  label: string
  collapsed: boolean
  childIds: string[]
}, 'group'>

type AppNode = ClippedCardNode | GeneratedCardNode | NoteCardNode | ImageCardNode | GroupNode
```

**Why**: Type safety, self-documenting, enables multilevel abstraction

---

### Pattern 2: Semantic Embeddings Service

```typescript
// embeddingService.ts
export const embeddingService = {
  async generateEmbedding(card: Card): Promise<number[]> {
    const text = this.extractText(card);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });

    const embedding = response.data[0].embedding;  // 1536-dim vector
    await this.updateCache(card.id, embedding);  // Cache forever
    return embedding;
  },

  async findSimilar(targetCard: Card, allCards: Card[], threshold = 0.80) {
    const targetEmbedding = await this.generateEmbedding(targetCard);

    const similarities = await Promise.all(
      allCards.map(async (card) => {
        const embedding = await this.generateEmbedding(card);
        const similarity = this.cosineSimilarity(targetEmbedding, embedding);
        return { card, similarity };
      })
    );

    return similarities
      .filter(({ similarity }) => similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  },

  cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
};
```

**Why**: Single integration unlocks 4+ features, very affordable

---

### Pattern 3: Hybrid Connection Suggestions (Spatial + Semantic)

```typescript
async function suggestConnections(cards: Card[], connections: Connection[]) {
  // 1. Spatial clustering (DBSCAN)
  const spatialClusters = dbscanClustering(
    cards.map(c => c.position!),
    { epsilon: 200, minPoints: 3 }
  );

  // 2. Semantic similarity
  const semanticPairs = [];
  for (const card of cards) {
    const similar = await embeddingService.findSimilar(card, cards, 0.85);
    similar.forEach(({ card: similarCard, similarity }) => {
      semanticPairs.push({ cardA: card, cardB: similarCard, similarity });
    });
  }

  // 3. Prioritize BOTH spatially close AND semantically similar
  const suggestions = semanticPairs
    .filter(({ cardA, cardB }) => {
      const clusterA = findCluster(cardA.id, spatialClusters);
      const clusterB = findCluster(cardB.id, spatialClusters);
      return clusterA === clusterB;  // Same spatial cluster
    })
    .map(({ cardA, cardB, similarity }) => ({
      source: cardA.id,
      target: cardB.id,
      connectionType: 'related',
      confidence: similarity * 1.2,  // 20% boost for spatial proximity
      reason: `Same cluster + ${(similarity * 100).toFixed(0)}% similar`
    }));

  return suggestions;
}
```

**Why**: Combines spatial (informal) with semantic (formal) for best suggestions

---

## Week-by-Week Implementation Plan

### Week 1: Foundation
- [ ] Day 1: Typed node system refactor
- [ ] Day 2: History tracking infrastructure
- [ ] Day 2 PM: Backlinks panel (4 hours)
- [ ] Day 2 PM: Storage quota monitoring (2 hours)
- [ ] **Deliverable**: Foundation tests pass, backlinks visible

### Week 2: Buffer / Planning
- [ ] Polish Week 1 work
- [ ] Read ROUND4_SYNTHESIS.md fully
- [ ] Plan embeddings integration
- [ ] Set up OpenAI API key

### Week 3-4: Semantic Layer
- [ ] Week 3: Embedding service implementation
  - [ ] API integration
  - [ ] Caching system
  - [ ] Similarity computation
- [ ] Week 4: UI integration
  - [ ] Semantic search bar
  - [ ] Connection suggestions overlay
  - [ ] Duplicate detection panel
- [ ] **Deliverable**: Semantic search works, suggestions appear

### Week 5: Multilevel Abstraction
- [ ] Parent/child node support
- [ ] Group creation UI
- [ ] Collapse/expand interaction
- [ ] Visual hierarchy (depth shading)
- [ ] **Deliverable**: Can group 20 cards, collapse/expand works

### Week 6: Graph View + Undo/Redo
- [ ] Cytoscape.js integration
- [ ] Graph view component
- [ ] Analytics panel (hubs, islands)
- [ ] Undo/redo system (builds on history tracking)
- [ ] **Deliverable**: Toggle canvas ↔ graph, undo/redo functional

### Weeks 7-8: Polish
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] User testing (N=5)
- [ ] Documentation

### Weeks 9-10: Advanced Features
- [ ] Navigable history UI
- [ ] Smart card properties
- [ ] Inline annotations (if time)

---

## Research Validation Summary

### Theoretical Foundation (60+ years)
- ✅ Spatial hypertext (Shipman 1993-1999)
- ✅ Incremental formalization (VKB)
- ✅ Information foraging (Pirolli & Card 1999)
- ✅ Epistemic actions (Kirsh 1994)

### Modern Convergence (2023-2025)
- ✅ Sensecape (UIST '23): Spatial LLM interfaces
- ✅ Orca (arXiv '24): Malleable webpages
- ✅ DirectGPT (CHI '24): Continuous objects
- ✅ Epistemic agency (Phil. AI '25): EASS scale

### Technical Feasibility (2024)
- ✅ React Flow: Parent nodes built-in
- ✅ Cytoscape.js: Best for knowledge graphs
- ✅ Embeddings: $0.01/1000 cards
- ✅ IndexedDB: Chrome 2024 Snappy compression

### Competitive Gap Analysis (Round 5)
**Missing from NabokovsWeb**:
- ❌ Backlinks panel (universal in Roam/Obsidian)
- ❌ Multilevel abstraction (Sensecape has it)
- ❌ Graph view (competitive expectation)
- ❌ Undo/redo (DirectGPT emphasized)

**Unique to NabokovsWeb**:
- ✅ Element-level web capture (granular, not full pages)
- ✅ Persistent spatial artifacts (cards accumulate, not regenerate)
- ✅ Epistemic agency preservation (measurable via EASS)

---

## Publication Readiness

### After Tier 1+2 (8 weeks)
**System has**:
- Novel combination (spatial hypertext + LLMs + web capture)
- Competitive features (backlinks, graph, embeddings)
- Research foundation (60 years + modern validation)

### After User Study (Month 4)
**Paper has**:
- Empirical validation (EASS scores, foraging metrics)
- Technical contribution (hybrid spatial-semantic suggestions)
- Theoretical grounding (epistemic agency framework)

### Publication Targets
- **UIST 2025** (October submission): Technical contribution focus
- **CHI 2026** (September submission): HCI + user study focus
- **ACM ToCHI 2026** (April submission): Extended version with deep analysis

---

## Files to Reference

1. **ROUND4_SYNTHESIS.md** (1900+ lines)
   - Full technical patterns with code
   - All 5 patterns explained
   - 2 complete examples (suggestions, smart properties)

2. **memory.md** (3000+ lines)
   - All 32 searches documented
   - Round-by-round synthesis
   - Research observations

3. **features.md** (709 lines)
   - All features with priorities
   - Implementation specs
   - Testing requirements

4. **RESEARCH_SUMMARY.md** (385 lines)
   - Strategic roadmap
   - Publication opportunities
   - Competitive analysis

5. **This file** (you're reading it)
   - Quick reference
   - Week-by-week plan
   - Most important patterns

---

## Critical Decisions Already Made

### Library Choices ✅
- **Graph view**: Cytoscape.js (not vis.js or D3)
  - Reason: Order of magnitude better performance
- **Embeddings**: OpenAI text-embedding-3-small (not Cohere or local)
  - Reason: Best quality/cost ratio, 1536 dims
- **Clustering**: DBSCAN (not k-means)
  - Reason: No need to specify cluster count, finds arbitrary shapes
- **Storage**: chrome.storage.local + IndexedDB (keep as-is)
  - Reason: Already optimal, Round 4 validated

### Architecture Patterns ✅
- **Node types**: Discriminated unions (not flat any)
- **Connection suggestions**: Hybrid (spatial + semantic)
- **History**: Event-based circular buffer (not full snapshots)
- **Undo/redo**: Command pattern (not state snapshots)

### Research Strategy ✅
- **User study**: Between-subjects (Nabokov vs. ChatGPT)
- **Metrics**: EASS scale + foraging metrics + retention
- **Timeline**: Month 4 (after Tier 2+3 complete)
- **Publication**: UIST 2025 or CHI 2026

---

## Questions & Answers

### Q: Why not start with graph view?
**A**: Foundation first. Graph view needs typed nodes (foundation) and benefits from embeddings (semantic). Following dependency order saves time.

### Q: Is $0.01/1000 cards really affordable?
**A**: Yes. 100 users × 100 cards each = 10,000 cards = $10 total. One-time cost (cached forever). Compare: Claude API calls cost $0.003/request, way more expensive.

### Q: Why parent/child nodes instead of separate grouping system?
**A**: React Flow built-in, no new library. Proven pattern. Saves development time. Addresses Sensecape research gap directly.

### Q: Can we skip backlinks panel?
**A**: No. Universal in Roam/Obsidian. Users expect it. Technically trivial (4 hours). Competitive parity requirement.

### Q: What if embeddings don't work well?
**A**: Fallback: spatial clustering only. But research shows embeddings effective (Semantic Scholar, Notion AI, others use them). Low risk.

---

## Final Checklist Before Starting

- [ ] Read ROUND4_SYNTHESIS.md (at least Part 1-3)
- [ ] Understand tiered roadmap (Foundation → High-value → Advanced)
- [ ] Have OpenAI API key ready (for embeddings, Weeks 3-4)
- [ ] git checkout -b foundation/typed-nodes (start Week 1)
- [ ] npm install (ensure dependencies current)
- [ ] npm run type-check (ensure clean start)

---

## Success Metrics

### Week 1
- All foundation tests pass
- Backlinks panel shows incoming connections
- Storage quota warning appears at 80%
- TypeScript errors eliminated

### Week 6
- Semantic search returns relevant cards
- Connection suggestions appear as dotted lines
- Groups collapse/expand smoothly
- Graph view renders 100+ cards
- Undo/redo works for card operations

### Month 4
- User study completes (N=40)
- EASS scores: Nabokov > ChatGPT (p<0.05)
- Foraging efficiency: comparable or better
- Retention: higher after 1 week

---

**Ready to start? Begin with Typed Node System (Day 1).**

**Good luck!** 🚀
