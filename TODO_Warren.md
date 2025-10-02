1. I want to be able to command-click so that I can highlight multiple elements to capture, not just one.
2. How do you deselect after selecting multiple (I want a visual indicator when a card is selected in canvas and a way to deselect it easily)
3. I want ways for you to easily add tags
4. Double click on edges to add
5. **[P1 - HIGH]** Implement Bidirectional Links / Backlinks Panel (F0.1)
   - Estimated: 0.5 days (3-4 hours)
   - Critical gap: competitive parity with Roam/Obsidian
   - Implementation plan: `claude_html/plan_bidirectional_links.html`
   - Tasks:
     - Add `getIncomingConnections()` to `connectionStorage.ts`
     - Create `BacklinksPanel.tsx` component (collapsible)
     - Integrate into `CardNode.tsx` with navigation
     - Add unit + E2E tests

6. **[P0 - CRITICAL]** History/Versioning System (F1.1) - 4-5 weeks total
   - Critical gap: Pattern 5 from research (VKB, DirectGPT, Upwelling all have this)
   - Impact: User confidence, error recovery, epistemic agency, GDPR compliance

   ### Phase 1: Command Pattern Undo/Redo (2-3 days) - CRITICAL
   - Estimated: 2-3 days
   - Files to create:
     - `src/services/historyManager.ts` (core command pattern)
     - `src/commands/CardCommands.ts` (Create/Update/Delete/Move/Resize/Stash)
     - `src/commands/ConnectionCommands.ts` (Create/Update/Delete)
     - `src/commands/CompositeCommands.ts` (Batch/Composite operations)
   - Features:
     - Undo/redo stacks with max 100 commands
     - Keyboard shortcuts: `Cmd/Ctrl+Z` (undo), `Cmd/Ctrl+Shift+Z` (redo)
     - Persist last 20 commands in chrome.storage.local
     - Toast notifications for undo/redo feedback
     - Debounce rapid edits into single command

   ### Phase 2: Card Version History (3-4 days) - HIGH
   - Estimated: 3-4 days
   - Files to create:
     - `src/services/versionService.ts` (card versioning)
     - `src/components/VersionPanel.tsx` (version history sidebar)
     - `src/components/DiffViewer.tsx` (diff visualization)
     - `src/utils/diffEngine.ts` (text diffing with diff-match-patch)
   - Features:
     - Store versions in IndexedDB ('nabokov-history' db, 'card-versions' store)
     - Create versions on: manual edits, AI ops, major changes
     - Store diffs (not full content) for efficiency
     - Timeline view with restore/compare functionality
     - Side-by-side diff viewer with inline highlights

   ### Phase 3: Canvas Snapshot History (2-3 days) - MEDIUM
   - Estimated: 2-3 days
   - Files to create:
     - `src/services/snapshotService.ts` (canvas snapshots)
     - `src/components/SnapshotViewer.tsx` (snapshot preview/restore)
     - `src/utils/snapshotCompression.ts` (compression utils)
   - Features:
     - Store in IndexedDB ('canvas-snapshots' store)
     - Triggers: manual, before bulk ops, every 30 min, before AI
     - Preview mode (read-only overlay)
     - Selective restore vs full restore
     - Retain last 50 snapshots, auto-prune older

   ### Phase 4: Temporal Navigation UI (3-4 days) - MEDIUM
   - Estimated: 3-4 days
   - Files to create:
     - `src/components/HistoryTimeline.tsx` (bottom panel timeline)
     - `src/components/VersionPanel.tsx` (enhancement)
   - Features:
     - Horizontal timeline with zoom controls
     - Color-coded events (manual/auto/AI)
     - "Travel in time" mode with date/time picker
     - Playback controls for history navigation

   ### Phase 5: Storage & Performance (2-3 days) - HIGH
   - Estimated: 2-3 days
   - Tasks:
     - 3-tier storage: hot (chrome.storage), warm (IndexedDB), cold (export)
     - CompressionStream for 70-80% size reduction
     - Lazy loading for history components
     - IndexedDB indexes: cardId, timestamp, changeType
     - Auto-pruning: >90 days or >1000 versions
     - Quota monitoring: warn at 80%, prune at 90%

   ### Phase 6: Advanced Features (4-5 days) - OPTIONAL
   - Estimated: 4-5 days
   - Features:
     - Branching history (Git-like)
     - Collaborative history with user attribution
     - AI-powered insights ("what changed today?")

   ### Success Metrics:
   - >50% users use undo at least once per session
   - >20% users restore versions
   - Undo/redo latency <100ms
   - Version load time <500ms
   - Snapshot restore <1s for 100-card canvas
   - History storage <20% of total usage

   ### Critical Gaps Addressed:
   - ✅ User confidence and error recovery
   - ✅ Competitive parity with VKB, DirectGPT, Upwelling
   - ✅ Epistemic agency enhancement (EASS scale)
   - ✅ GDPR compliance (data portability via history export)
