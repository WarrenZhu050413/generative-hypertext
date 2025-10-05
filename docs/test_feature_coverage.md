# Test Feature Coverage Summary (commit f3557c9)

## End-to-End Suites (Playwright)

- **Extension bootstrap & loading** (`extension-load.spec.ts`) – verifies extension service worker, canvas/sidepanel entrypoints, and error handling during reload.
- **Canvas card operations** (`card-operations.spec.ts`, `card-resize-persistence.spec.ts`, `card-scrolling.spec.ts`) – cover create/delete, duplication offsets, starring UI, tagging, inline editing, collapse/expand persistence, manual resizing, and scroll behavior within cards.
- **Beautification flows** (`beautification.spec.ts`) – trigger organize-content, loading spinners, success/error toasts, Claude API fallback, HTML sanitization, and edge conditions (empty/long content, rebuild prompts).
- **Custom buttons & generation** (`custom-buttons.spec.ts`) – ensures new buttons can be created/configured, trigger card/child generation, interact with connections, respect defaults, and handle management lifecycle.
- **Filtering & search** (`filtering.spec.ts`) – tests search bar, domain/tag/date filters, combined filter logic, persistence across sessions, and UI affordances.
- **Connection editing** (`connection-editing.spec.ts`) – verifies creation, type switching, custom labels, deletion, rendering, and regression cases for visual sync.
- **Image & inline chat workflows** (`inline-chat-images.spec.ts`, `image-upload.spec.ts`, `floating-window-chat.spec.ts`) – cover drag/drop validation, previews, multimodal request formatting, image processing, and floating chat session windows.
- **Keyboard shortcuts & selector activation** (`keyboard-shortcuts.spec.ts`) – asserts stash-mode, canvas-mode, and inline chat shortcuts activate/deactivate selectors with proper indicators and ESC behavior.
- **Stash system** (`stash-operations.spec.ts`, `skip-delete-confirmation.spec.ts`) – stashing/unstashing across contexts, side-panel views, permanent delete, search/filter, persistence of skip-delete preference, and bulk operations.
- **Font-size controls** (`font-size-controls.spec.ts`) – both canvas and sidepanel selectors, applied typography to cards/chat, accessibility constraints, and persistence.
- **Viewport persistence** (`viewport-persistence.spec.ts`) – first-time user defaults, save/restore on reload, resizing edge cases, and regression scenarios.
- **Element capture & contextual chat** (`element-capture.spec.ts`, `element-attached-chat.spec.ts`, `element-chat-enhancements.spec.ts`, `context-input.spec.ts`) – multi-element capture, context extraction, queue handling, chat window orchestration, inline context input, and edge-case recovery.
- **Phase 1 & 2 refinements** (`phase-1-2-refinements.spec.ts`) – comprehensive regression for canvas/sidepanel parity, shared service wiring, image workflows, cross-context sync, and performance checks.
- **Loading, floating windows, misc** (`loading-states.spec.ts`, `floating-windows.spec.ts`, `floating-window-chat.spec.ts`) – progress feedback, minimized/expanded window behavior, and resilience when network/API latency occurs.

## Unit & Component Suites (Vitest)

- **Core services** (`beautificationService.test.ts`, `cardGenerationService.test.ts`, `apiErrorHandling.test.ts`, `autoBeautify.test.ts`, `fontSizeService.test.ts`) – template generation, error pathways, settings persistence, Claude fallback logic, and typography utilities.
- **Canvas utilities** (`canvas/*` tests) – viewport persistence logic, node dimension extraction, native chat button behavior, stash React Flow integration, card size preservation, button layout refactor guards, skeleton loading, newline preservation, etc.
- **Shared chat components** (`shared/components/Chat/BaseChatUI.test.tsx`, `components/InlineChatWindow.test.tsx`) – streaming state management, message formatting, queue flushing, keyboard interactions, accessibility, image attachment validation, and API payload assembly.
- **Keyboard shortcut helpers** (`keyboardShortcuts.test.ts`) – platform detection, formatting, prevention rules, shortcut registration manager, and default mapping coverage.
- **Screenshot utilities** (`screenshot.test.ts`) – ensures mock canvas flows and data URL generation behave predictably.
- **Context input modal** (`ContextInputModal.test.tsx`) – validates modal lifecycle, validation, and submission handling.

## Notes

- This list reflects the repository at commit `f3557c9fe6817a5dde262a11a9e55e3338560cd2`.
- Each entry summarizes the high-level feature(s) asserted in the corresponding test file; granular test names ("should …") are captured within the source.
- Future-version or experimental tests should be archived outside the active tree to avoid polluting this commit’s test matrix.
