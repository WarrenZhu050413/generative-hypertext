# Manual Testing Checklist: Image Drop Fix for InlineChatWindow

## Prerequisites
1. ✅ Build completed: `npm run build`
2. ✅ Type check passed: Zero TypeScript errors
3. ✅ Unit tests passed: 360 passed (1 pre-existing timeout unrelated to changes)
4. ✅ E2E tests passed: 17/17 passed

## Extension Reload
- [ ] Navigate to `chrome://extensions`
- [ ] Click reload (🔄) on "Nabokov Web Clipper"
- [ ] Refresh any open Canvas pages

## Test 1: InlineChatWindow Image Drop (PRIMARY FIX)

### Setup
1. Open any webpage (e.g., https://example.com)
2. Press `Ctrl+Shift+C` to open inline chat window
3. Prepare a test image file (PNG or JPEG) on your desktop

### Test Case 1.1: Drag Image into Content Area
- [ ] Drag image file from desktop over the chat content area
- [ ] **Expected**: Gold overlay appears with "📁 Drop image to upload" message
- [ ] **Expected**: Overlay has dark background with blur effect
- [ ] Drop the image
- [ ] **Expected**: Image preview appears above input box
- [ ] **Expected**: Browser does NOT open image in new tab ⚠️ **CRITICAL**
- [ ] **Expected**: Image has ✕ remove button in top-right corner

### Test Case 1.2: Drag Header (Window Movement)
- [ ] Drag the chat window by clicking and dragging the **header** (red gradient area with 💬 icon)
- [ ] **Expected**: Window moves with cursor
- [ ] **Expected**: No image upload triggered
- [ ] **Expected**: Header remains draggable

### Test Case 1.3: Multiple Images
- [ ] Drag one image into chat → verify preview
- [ ] Drag another image into chat → verify second preview
- [ ] **Expected**: Both images show in preview area
- [ ] Click ✕ on first image
- [ ] **Expected**: First image removed, second remains

### Test Case 1.4: Send Message with Image
- [ ] Add image via drag-drop
- [ ] Type "What is in this image?"
- [ ] Click send button (➤)
- [ ] **Expected**: Message sent with image attached
- [ ] **Expected**: Image displays in message history
- [ ] **Expected**: Response from Claude Vision API (if backend/API configured)

### Test Case 1.5: Image-Only Message
- [ ] Add image via drag-drop
- [ ] Do NOT type any text
- [ ] Click send button
- [ ] **Expected**: Message sent with default text "(Image attached)"
- [ ] **Expected**: Image displays in message history

### Test Case 1.6: Drag Non-Image File
- [ ] Drag a .txt or .pdf file into chat
- [ ] **Expected**: No overlay appears
- [ ] **Expected**: No upload triggered
- [ ] **Expected**: Console warning: "[InlineChatWindow] No image files found in drop"

### Test Case 1.7: Window Resize
- [ ] Resize window by dragging edges/corners
- [ ] **Expected**: Window resizes smoothly
- [ ] **Expected**: Drag-drop still works after resize
- [ ] **Expected**: Content area scales correctly

### Test Case 1.8: Window Collapse/Expand
- [ ] Click collapse button (▲) in header
- [ ] **Expected**: Window collapses to header only
- [ ] Click expand button (▼)
- [ ] **Expected**: Window expands to full size
- [ ] **Expected**: Drag-drop works after expand

## Test 2: Canvas Image Drop (Regression Check)

### Test Case 2.1: Canvas Direct Drop Still Works
- [ ] Open Canvas page
- [ ] Drag image file onto canvas (not onto a card)
- [ ] **Expected**: "🖼️ Drop images here" overlay appears
- [ ] Drop the image
- [ ] **Expected**: New card created with image
- [ ] **Expected**: Card displays image inline

## Test 3: Edge Cases

### Test Case 3.1: Very Large Image
- [ ] Drag a high-resolution image (>5MB) into chat
- [ ] **Expected**: Image processes (may take a moment)
- [ ] **Expected**: Image preview shows correctly
- [ ] **Expected**: No crashes or errors

### Test Case 3.2: Multiple Windows Open
- [ ] Open inline chat on one page
- [ ] Open Canvas in another tab
- [ ] Drag images into both
- [ ] **Expected**: Each window handles drops independently
- [ ] **Expected**: No conflicts or shared state issues

### Test Case 3.3: Rapid Drag Events
- [ ] Drag image in and out of window rapidly (without dropping)
- [ ] **Expected**: Overlay appears/disappears smoothly
- [ ] **Expected**: No flickering or state issues

## Test 4: Console Verification

### Open DevTools Console
- [ ] No errors related to image drop
- [ ] Look for these logs when dropping image:
  ```
  [InlineChatWindow] Processing image: <filename>
  [InlineChatWindow] Image added to pending: {width: X, height: Y}
  ```
- [ ] When sending message with image:
  ```
  [InlineChatWindow] Sending multimodal message with 1 images
  ```

## Known Limitations (Expected Behavior)

1. **Playwright Tests**: Cannot test actual file drag-drop due to security restrictions
2. **Browser Default**: Our fix relies on `preventDefault()` executing before browser sees the drop event
3. **File Picker**: Not yet implemented for InlineChatWindow (only drag-drop works)

## Success Criteria

✅ **PASS**: All test cases marked with checkboxes completed successfully

❌ **FAIL**: Any of these occur:
- Browser opens image in new tab when dropping
- Drag overlay doesn't appear
- Window header is not draggable
- Images don't appear in preview
- Console shows errors

## If Tests Fail

1. Check browser console for errors
2. Verify extension reloaded after build
3. Try hard refresh (Cmd/Ctrl + Shift + R)
4. Check that build completed without warnings
5. Review implementation in `src/components/InlineChatWindow.tsx`:
   - Lines 120-155: Drag event handlers
   - Lines 357-371: Content wrapper with handlers
   - Lines 874-899: Drag overlay styles

## Report Results

After testing, report:
- [ ] All tests passed ✅
- [ ] Browser/OS tested: _____________
- [ ] Any issues encountered: _____________
- [ ] Screenshots/videos (if issues): _____________
