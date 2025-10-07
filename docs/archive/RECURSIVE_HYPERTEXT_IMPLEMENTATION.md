# Recursive Hypertext Implementation

## Summary
Implemented recursive hypertext (hypertext tooltips within hypertext tooltips) with correct z-index stacking, auto-pinning, and lifecycle management.

## Implementation Details

### 1. Parent Detection (`getParentSessionFromSelection`)
```javascript
// Lines 2087-2102
function getParentSessionFromSelection(activeRange, sessions) {
  if (!activeRange) return null;
  let el = activeRange.commonAncestorContainer;
  if (el.nodeType === Node.TEXT_NODE) {
    el = el.parentElement;
  }
  const parentTooltip = el?.closest('.hx-chat-tooltip');
  if (!parentTooltip) return null;
  const parentSessionId = parentTooltip.dataset.sessionId;
  return parentSessionId ? sessions.get(parentSessionId) : null;
}
```

### 2. Session Object Updates
Added to session object (lines 2327-2348):
- `parentSessionId` - ID of parent session (null if root)
- `childSessionIds` - Set of child session IDs
- `nestingLevel` - Depth in nesting hierarchy (0 = root)
- `parentWasPinned` - Parent's pin state before auto-pin
- `targetZIndex` - Calculated z-index for this tooltip

### 3. Auto-Pin Parent (lines 2278-2306)
```javascript
// In applyHypertext()
const parentWasPinned = parentSession ? parentSession.isPinned : false;

if (parentSession && !parentSession.isPinned) {
  const parentController = controllerFor(parentSession);
  if (parentController) {
    parentController.setPinned(true);
    console.log('[Hypertext] Auto-pinned parent tooltip');
  }
}

// Calculate target z-index
let targetZIndex = TOOLTIP_BASE_Z_INDEX;
if (parentSession) {
  const parentController = controllerFor(parentSession);
  if (parentController) {
    const parentZ = parseInt(
      parentController.element.style.zIndex || TOOLTIP_BASE_Z_INDEX,
      10
    );
    targetZIndex = parentZ + 1;
  }
}
```

### 4. Z-Index Coordination (lines 976-1041)
```javascript
// In createTooltipController()
// Set z-index BEFORE any other operations
if (session.nestingLevel > 0 && session.targetZIndex) {
  tooltip.style.zIndex = String(session.targetZIndex);
  currentZIndex = session.targetZIndex;
  tooltip.dataset.nested = 'true';
  tooltip.dataset.nestingLevel = String(session.nestingLevel);
}

// Hierarchy-aware bringToFront()
function bringToFront() {
  let targetZ = Math.max(appliedZ, TOOLTIP_BASE_Z_INDEX);

  // If has parent, stay above it
  if (session.parentSessionId && session.targetZIndex) {
    const parentSession = getSession(session.parentSessionId);
    if (parentSession) {
      const parentController = getController(parentSession.id);
      if (parentController) {
        const parentZ = parseInt(parentController.element.style.zIndex, 10);
        targetZ = Math.max(session.targetZIndex, parentZ + 1);
      }
    }
  }

  // If has children, stay below them
  if (session.childSessionIds && session.childSessionIds.size > 0) {
    let minChildZ = Infinity;
    session.childSessionIds.forEach(childId => {
      const childController = getController(childId);
      if (childController) {
        const childZ = parseInt(childController.element.style.zIndex, 10);
        minChildZ = Math.min(minChildZ, childZ);
      }
    });
    if (minChildZ !== Infinity) {
      targetZ = Math.min(targetZ, minChildZ - 1);
    }
  }

  currentZIndex = targetZ;
  tooltip.style.zIndex = String(currentZIndex);
  if (session.nestingLevel > 0) {
    session.targetZIndex = targetZ;
  }
}
```

### 5. Lifecycle Management (lines 2112-2138)
```javascript
// In closeChat()
// Close all child sessions first
if (targetSession.childSessionIds && targetSession.childSessionIds.size > 0) {
  targetSession.childSessionIds.forEach(childId => {
    closeChat({ force: true, sessionId: childId });
  });
  targetSession.childSessionIds.clear();
}

// Restore parent's pin state
if (targetSession.parentSessionId) {
  const parentSession = sessions.get(targetSession.parentSessionId);
  if (parentSession) {
    if (parentSession.childSessionIds) {
      parentSession.childSessionIds.delete(targetSession.id);
    }

    // Only unpin if parent wasn't already pinned AND no other children remain
    if (!targetSession.parentWasPinned && parentSession.isPinned) {
      const parentController = controllerFor(parentSession);
      if (parentController && parentSession.childSessionIds.size === 0) {
        parentController.setPinned(false);
        console.log('[Hypertext] Restored parent pin state (unpinned)');
      }
    }
  }
}
```

### 6. Depth Limiting (lines 2267-2276)
```javascript
const nestingLevel = parentSession ? parentSession.nestingLevel + 1 : 0;
if (nestingLevel >= 5) {
  const shouldOpenChatPage = win.confirm(
    'Maximum nesting depth (5) reached. Open in chat page instead?'
  );
  if (shouldOpenChatPage && parentSession) {
    openChatPageFromSession(parentSession, null);
  }
  return;
}
```

## Key Fixes

### Problem: Z-Index Override
**Root Cause (identified by Codex):** When clicking parent tooltip to select text for nested hypertext, parent's `bringToFront()` overwrites z-index with global counter, putting parent on top of child.

**Solution:** Made `bringToFront()` hierarchy-aware:
- Child tooltips: enforce `z-index >= parent z-index + 1`
- Parent tooltips: enforce `z-index <= min(child z-indices) - 1`
- Sync `session.targetZIndex` to maintain nesting offset

## Testing

### Manual Test Steps
1. Open http://localhost:8080/demo/test_recursive_hypertext.html
2. Select text → `Cmd+Shift+K` → Generate hypertext (Level 1)
3. Select text inside tooltip → Generate hypertext (Level 2)
4. Open DevTools console
5. Run: `document.querySelectorAll('.hx-chat-tooltip').forEach((t, i) => console.log(\`Tooltip \${i} z-index: \${t.style.zIndex}\`))`

### Expected Results
- ✅ Level 1 tooltip: z-index ≈ 2147483000
- ✅ Level 2 tooltip: z-index = Level 1 + 1
- ✅ Level 2 appears **above** Level 1 visually
- ✅ Parent auto-pins when child opens (📍 icon)
- ✅ Parent stays below child when clicked
- ✅ Parent unpins when child closes (if wasn't manually pinned)
- ✅ Depth limit at 5 levels with confirm dialog

### Console Messages
```
[Hypertext] Auto-pinned parent tooltip
[Hypertext] Restored parent pin state (unpinned)
```

## Files Changed
- `hypertext/hypertext-experience.js` - All implementation changes
- `demo/test_recursive_hypertext.html` - Test page with instructions
- `tests/hypertext-recursive.spec.mjs` - Playwright test (UI timing issues)

## Notes
- This is a standalone JavaScript module (no build step)
- Changes are immediately active when served via http-server
- Z-index base is 2147483000, max depth 5 = 2147483005 (well below max)
- Parent/child relationships tracked bidirectionally
- Cascade delete ensures no orphaned tooltips
