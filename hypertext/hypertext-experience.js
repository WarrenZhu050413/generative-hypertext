(function (global) {
const BASE_STYLES = `
:root {
  --hx-red-start: #b23232;
  --hx-red-end: #a32020;
  --hx-paper: #fdf8f6;
  --hx-panel: #f7efed;
  --hx-border: rgba(178, 60, 60, 0.55);
  --hx-shadow: 0 18px 38px rgba(170, 34, 34, 0.18);
  --hx-ink: #2c1f1f;
  --hx-muted: rgba(255, 240, 240, 0.75);
}

.hx-palette, .hx-chat-tooltip {
  font-family: "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--hx-ink);
}

.hx-highlight {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: currentColor;
  outline: none;
  touch-action: manipulation;
}

.hx-highlight.loading {
  color: #6c6c6c;
}

.hx-highlight.ready-inline {
  color: #8b0000;
}

.hx-highlight.ready-reference,
.hx-highlight.ready-url {
  color: #1a73e8;
}

.hx-highlight:focus-visible {
  outline: 2px solid rgba(26, 115, 232, 0.6);
  outline-offset: 2px;
}

.hx-highlight.error {
  color: #b22222;
}

.hx-highlight:not(.loading):hover {
  text-decoration-thickness: 2px;
}

.hx-palette {
  position: absolute;
  background: #ffffff;
  border: 1px solid rgba(139, 0, 0, 0.25);
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  padding: 12px 14px;
  width: 280px;
  font-size: 13px;
  z-index: 2147483000;
  display: none;
}

.hx-palette h3 {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #8b0000;
}

.hx-palette label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  color: #666;
  margin-top: 6px;
}

.hx-palette input[type="text"] {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid rgba(139, 0, 0, 0.25);
  border-radius: 4px;
  font-size: 12px;
  margin-top: 4px;
}

.hx-palette-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.hx-palette button {
  flex: 1;
  padding: 7px 0;
  border: 0;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  background: #8b0000;
  color: white;
}

.hx-chat-tooltip {
  position: absolute;
  background: var(--hx-paper);
  border-radius: 12px;
  border: 1px solid var(--hx-border);
  box-shadow: var(--hx-shadow);
  width: 380px;
  height: 480px;
  min-width: 320px;
  max-width: min(480px, calc(100vw - 24px));
  min-height: 400px;
  max-height: calc(100vh - 24px);
  display: none;
  flex-direction: column;
  z-index: 2147483000;
  opacity: 1;
  transition: opacity 0.15s ease;
  overflow: hidden;
}

.hx-chat-tooltip[data-size="small"] {
  font-size: 11px;
}

.hx-chat-tooltip[data-size="large"] {
  font-size: 15.5px;
}

.hx-chat-tooltip[data-size="xlarge"] {
  font-size: 18px;
}

.hx-chat-tooltip.is-pinned {
  box-shadow: 0 22px 48px rgba(139, 0, 0, 0.32);
  border-color: rgba(139, 0, 0, 0.48);
}

.hx-chat-tooltip__header {
  background: linear-gradient(135deg, var(--hx-red-start), var(--hx-red-end));
  color: #fff8f4;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.hx-chat-tooltip.dragging .hx-chat-tooltip__header {
  cursor: grabbing;
}

.hx-chat-tooltip__drag-area {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 0;
  align-items: flex-start;
}

.hx-chat-tooltip__title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.hx-chat-tooltip__title {
  margin: 0;
  font-size: 13px;
  letter-spacing: -0.12px;
  font-weight: 600;
  color: #fff8f4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hx-chat-tooltip__subtitle {
  margin: 0;
  font-size: 11px;
  color: var(--hx-muted);
}

.hx-chat-tooltip__header-actions {
  display: flex;
  gap: 6px;
}

.hx-chat-tooltip__size-toggle,
.hx-chat-tooltip__icon {
  border: 1px solid rgba(255, 230, 230, 0.4);
  border-radius: 6px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff6f4;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.hx-chat-tooltip__size-toggle:hover,
.hx-chat-tooltip__icon:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.26);
}

.hx-chat-tooltip__icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Pin button active state styling */
.hx-chat-tooltip__icon[data-action="pin"].is-active {
  background: rgba(178, 50, 50, 0.18);
  border-color: rgba(177, 60, 60, 0.6);
}

.hx-chat-tooltip__icon[data-action="pin"].is-active:hover {
  background: rgba(178, 50, 50, 0.25);
  border-color: rgba(177, 60, 60, 0.75);
}

.hx-chat-tooltip__body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 10px;
  padding: 12px 12px 14px;
  background: var(--hx-panel);
  height: 100%;
}

.hx-chat-tooltip__meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #7b4545;
}

.hx-chat-tooltip__list {
  background: #ffffff;
  border: 1px solid rgba(177, 60, 60, 0.22);
  border-radius: 9px;
  padding: 10px 12px;
  display: grid;
  gap: 8px;
  font-size: 13px;
  line-height: 1.45;
  overflow-y: auto;
}

.hx-chat-tooltip__list ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.hx-chat-tooltip__item {
  display: grid;
  gap: 2px;
  border-bottom: 1px dashed rgba(177, 60, 60, 0.18);
  padding-bottom: 6px;
}

.hx-chat-tooltip__item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.hx-chat-tooltip__role {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #a12323;
  display: flex;
  justify-content: space-between;
}

.hx-chat-tooltip__content {
  color: var(--hx-ink);
  word-break: break-word;
}

.hx-chat-tooltip__composer {
  display: grid;
  gap: 8px;
}

.hx-chat-tooltip__textarea {
  width: 100%;
  min-height: 44px;
  border: 1px solid rgba(150, 70, 70, 0.35);
  border-radius: 8px;
  padding: 7px 11px;
  font-size: 12.5px;
  line-height: 1.4;
  resize: none;
  background: #f7f6f5;
  color: var(--hx-ink);
}

.hx-chat-tooltip[data-size="small"] .hx-chat-tooltip__textarea {
  font-size: 11px;
  line-height: 1.4;
}

.hx-chat-tooltip[data-size="large"] .hx-chat-tooltip__textarea {
  font-size: 14px;
  line-height: 1.45;
}

.hx-chat-tooltip[data-size="xlarge"] .hx-chat-tooltip__textarea {
  font-size: 16px;
  line-height: 1.5;
}

.hx-chat-tooltip__textarea:focus {
  outline: none;
  border-color: var(--hx-red-start);
  box-shadow: 0 0 0 2px rgba(178, 50, 50, 0.15);
}

.hx-chat-tooltip__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  color: #7a4d4d;
}

.hx-chat-tooltip__send {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--hx-red-start), var(--hx-red-end));
  color: #fff8f6;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(178, 50, 50, 0.18);
}

.hx-chat-tooltip__send:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(178, 50, 50, 0.28);
}

.hx-chat-tooltip__send:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hx-chat-tooltip__hint {
  font-size: 10px;
  color: #906060;
}

.hx-chat-tooltip__list::-webkit-scrollbar {
  width: 6px;
}

.hx-chat-tooltip__list::-webkit-scrollbar-track {
  background: rgba(177, 60, 60, 0.08);
}

.hx-chat-tooltip__list::-webkit-scrollbar-thumb {
  background: rgba(177, 60, 60, 0.35);
  border-radius: 3px;
}

.hx-chat-tooltip__list::-webkit-scrollbar-thumb:hover {
  background: rgba(177, 60, 60, 0.5);
}

.hx-chat-tooltip__resize {
  position: absolute;
  bottom: 0;
  right: 0;
  pointer-events: none;
}

.hx-chat-tooltip__resize-grip {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1.5px solid rgba(139, 0, 0, 0.5);
  background: rgba(139, 0, 0, 0.15);
  cursor: se-resize;
  position: relative;
  transition: all 0.15s ease;
  pointer-events: auto;
  transform: translate(50%, 50%);
}

.hx-chat-tooltip__resize-grip:hover {
  background: rgba(139, 0, 0, 0.25);
  border-color: rgba(139, 0, 0, 0.65);
  transform: translate(50%, 50%) scale(1.05);
}

.hx-chat-tooltip__resize-grip::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 1.5px;
  background: rgba(139, 0, 0, 0.6);
  right: 4px;
  bottom: 10px;
  transform: rotate(-45deg);
  border-radius: 1px;
}

.hx-chat-tooltip__resize-grip::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 1.5px;
  background: rgba(139, 0, 0, 0.6);
  right: 6px;
  bottom: 6px;
  transform: rotate(-45deg);
  border-radius: 1px;
}

.hx-chat-tooltip.resizing .hx-chat-tooltip__resize-grip {
  background: rgba(139, 0, 0, 0.3);
  border-color: rgba(139, 0, 0, 0.75);
  transform: translate(50%, 50%) scale(1.1);
}

.hx-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Streaming state: change entire tooltip background */
.hx-chat-tooltip.is-streaming {
  background: rgba(255, 242, 238, 1);
  border-color: rgba(177, 60, 60, 0.6);
  box-shadow: 0 18px 38px rgba(177, 60, 60, 0.15), inset 0 0 0 1px rgba(177, 60, 60, 0.1);
}

.hx-chat-tooltip.is-streaming .hx-chat-tooltip__header {
  background: linear-gradient(135deg, rgba(177, 60, 60, 0.85), rgba(163, 32, 32, 0.9));
  box-shadow: 0 2px 8px rgba(177, 60, 60, 0.2);
}

/* Streaming text indicator styling */
.hx-streaming-text {
  color: #b83c1f;
  font-weight: 500;
  font-style: italic;
}

/* Markdown content styling */
.hx-chat-tooltip__content p {
  margin: 0 0 0.75em 0;
}

.hx-chat-tooltip__content p:last-child {
  margin-bottom: 0;
}

.hx-chat-tooltip__content strong {
  font-weight: 600;
  color: var(--hx-ink);
}

.hx-chat-tooltip__content em {
  font-style: italic;
}

.hx-chat-tooltip__content code {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  background: rgba(177, 60, 60, 0.08);
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.9em;
}

.hx-chat-tooltip__content pre {
  background: rgba(177, 60, 60, 0.05);
  border: 1px solid rgba(177, 60, 60, 0.15);
  border-radius: 6px;
  padding: 8px 10px;
  margin: 0.5em 0;
  overflow-x: auto;
}

.hx-chat-tooltip__content pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.85em;
}

.hx-chat-tooltip__content ul,
.hx-chat-tooltip__content ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.hx-chat-tooltip__content li {
  margin: 0.25em 0;
}

.hx-chat-tooltip__content blockquote {
  border-left: 3px solid rgba(177, 60, 60, 0.3);
  margin: 0.75em 0;
  padding-left: 1em;
  color: rgba(44, 31, 31, 0.8);
  font-style: italic;
}

.hx-chat-tooltip__content h1,
.hx-chat-tooltip__content h2,
.hx-chat-tooltip__content h3,
.hx-chat-tooltip__content h4,
.hx-chat-tooltip__content h5,
.hx-chat-tooltip__content h6 {
  margin: 1em 0 0.5em 0;
  font-weight: 600;
  color: var(--hx-red-end);
  line-height: 1.3;
}

.hx-chat-tooltip__content h1 { font-size: 1.4em; }
.hx-chat-tooltip__content h2 { font-size: 1.3em; }
.hx-chat-tooltip__content h3 { font-size: 1.2em; }
.hx-chat-tooltip__content h4 { font-size: 1.1em; }
.hx-chat-tooltip__content h5 { font-size: 1.05em; }
.hx-chat-tooltip__content h6 { font-size: 1em; }

.hx-chat-tooltip__content a {
  color: var(--hx-red-end);
  text-decoration: underline;
  text-decoration-color: rgba(177, 60, 60, 0.4);
  transition: text-decoration-color 0.2s ease;
}

.hx-chat-tooltip__content a:hover {
  text-decoration-color: var(--hx-red-end);
}
`
const DEFAULT_TRUNCATED_CONTEXT_CHARS = 200000;

function buildDefaultContext(doc, session, shouldTruncate) {
  const win = doc.defaultView;
  const url = win && win.location ? win.location.href : '';
  const title = doc.title || '';
  const bodyText = doc.body ? doc.body.innerText.trim() : '';
  const selectionText = session?.subject ? session.subject.trim() : '';

  const headerParts = [
    url ? `URL: ${url}` : '',
    title ? `Title: ${title}` : '',
    '--- FULL PAGE TEXT ---'
  ];

  let pageContent = bodyText;
  if (shouldTruncate && pageContent.length > DEFAULT_TRUNCATED_CONTEXT_CHARS) {
    pageContent = `${pageContent.slice(0, DEFAULT_TRUNCATED_CONTEXT_CHARS)}\n[Context truncated at ${DEFAULT_TRUNCATED_CONTEXT_CHARS} characters]`;
  }

  const selectionParts = [
    '--- CURRENT SELECTION ---',
    selectionText
  ];

  return [...headerParts, pageContent, ...selectionParts]
    .filter(part => part !== null && part !== undefined)
    .join('\n');
}

function injectStyles(doc) {
  if (doc.getElementById('hx-hypertext-styles')) return;
  const style = doc.createElement('style');
  style.id = 'hx-hypertext-styles';
  style.textContent = BASE_STYLES;
  doc.head.appendChild(style);
}

function buildPalette(doc) {
  const palette = doc.createElement('div');
  palette.className = 'hx-palette';
  palette.innerHTML = `
    <h3>Hypertext this selection</h3>
    <div class="hx-selected-text" style="font-size:12px;color:#333;margin-bottom:6px;"></div>
    <label for="hx-instruction-input">Instructions (optional)</label>
    <input id="hx-instruction-input" type="text" placeholder="e.g. Explain in plain language" />
    <div class="hx-palette-actions">
      <button id="hx-generate-button">Generate Hypertext</button>
      <button id="hx-toggle-truncation" type="button">Enable truncation</button>
    </div>
  `;
  return {
    palette,
    selectedTextEl: palette.querySelector('.hx-selected-text'),
    instructionInput: palette.querySelector('#hx-instruction-input'),
    generateButton: palette.querySelector('#hx-generate-button'),
    toggleTruncationButton: palette.querySelector('#hx-toggle-truncation')
  };
}

function buildTooltip(doc, idSuffix = '') {
  const inputId = idSuffix ? `hx-chat-input-${idSuffix}` : 'hx-chat-input';
  const tooltip = doc.createElement('div');
  tooltip.className = 'hx-chat-tooltip';
  tooltip.setAttribute('role', 'dialog');
  tooltip.setAttribute('aria-hidden', 'true');
  tooltip.setAttribute('data-tooltip-id', idSuffix);
  tooltip.innerHTML = `
    <header class="hx-chat-tooltip__header">
      <div class="hx-chat-tooltip__drag-area" data-role="drag-handle" title="Drag tooltip" aria-label="Drag tooltip">
        <div class="hx-chat-tooltip__title-group">
          <h2 class="hx-chat-tooltip__title"></h2>
          <p class="hx-chat-tooltip__subtitle"></p>
        </div>
      </div>
      <div class="hx-chat-tooltip__header-actions">
        <button class="hx-chat-tooltip__icon" data-action="decrease-size" aria-label="Decrease text size" title="Decrease text size">A−</button>
        <button class="hx-chat-tooltip__icon" data-action="increase-size" aria-label="Increase text size" title="Increase text size">A+</button>
        <button class="hx-chat-tooltip__icon" data-action="pin" title="Pin chat" aria-pressed="false">📌</button>
        <button class="hx-chat-tooltip__icon" data-action="regenerate" title="Regenerate">⟳</button>
      </div>
    </header>
    <div class="hx-chat-tooltip__body">
      <div class="hx-chat-tooltip__meta">
        <span class="hx-chat-tooltip__meta-context"></span>
        <span class="hx-chat-tooltip__meta-time"></span>
      </div>
      <div class="hx-chat-tooltip__list" role="log" aria-live="polite">
        <ul></ul>
      </div>
      <div class="hx-chat-tooltip__composer">
        <label class="hx-sr-only" for="${inputId}">Compose follow-up</label>
        <textarea id="${inputId}" class="hx-chat-tooltip__textarea" data-role="input" placeholder="Continue Nabokov’s cadence…" aria-label="Compose follow-up"></textarea>
        <div class="hx-chat-tooltip__footer">
          <span class="hx-chat-tooltip__hint">Enter send · Shift+Enter newline · Esc closes</span>
          <button class="hx-chat-tooltip__send" data-action="send">Send</button>
        </div>
      </div>
    </div>
    <div class="hx-chat-tooltip__resize">
      <span class="hx-chat-tooltip__resize-grip" data-role="resize-handle" title="Resize tooltip" aria-label="Resize tooltip" tabindex="0"></span>
    </div>
  `;
  const titleEl = tooltip.querySelector('.hx-chat-tooltip__title');
  const subtitleEl = tooltip.querySelector('.hx-chat-tooltip__subtitle');
  const metaContextEl = tooltip.querySelector('.hx-chat-tooltip__meta-context');
  const metaTimeEl = tooltip.querySelector('.hx-chat-tooltip__meta-time');
  const listEl = tooltip.querySelector('.hx-chat-tooltip__list ul');
  const inputEl = tooltip.querySelector('[data-role="input"]');
  const sendButton = tooltip.querySelector('[data-action="send"]');
  const regenerateButton = tooltip.querySelector('[data-action="regenerate"]');
  const pinButton = tooltip.querySelector('[data-action="pin"]');
  const decreaseSizeBtn = tooltip.querySelector('[data-action="decrease-size"]');
  const increaseSizeBtn = tooltip.querySelector('[data-action="increase-size"]');
  return {
    tooltip,
    titleEl,
    subtitleEl,
    metaContextEl,
    metaTimeEl,
    listEl,
    inputEl,
    sendButton,
    regenerateButton,
    pinButton,
    decreaseSizeBtn,
    increaseSizeBtn,
    dragHandle: tooltip.querySelector('[data-role="drag-handle"]'),
    resizeHandle: tooltip.querySelector('[data-role="resize-handle"]')
  };
}

const VIEWPORT_MARGIN = 12;
const MIN_TOOLTIP_WIDTH = 260;
const MAX_TOOLTIP_WIDTH = 520;
const MIN_TOOLTIP_HEIGHT = 260;
const MAX_TOOLTIP_HEIGHT = 640;
const DEFAULT_TOOLTIP_WIDTH = 360;
const DEFAULT_TOOLTIP_HEIGHT = 360;
const SIZE_LEVELS = ['small', 'normal', 'large', 'xlarge'];
const DEFAULT_SIZE = 'normal';
const TOOLTIP_BASE_Z_INDEX = 2147483000;
const AUTO_CLOSE_DELAY_MS = Math.round(150 * 1.3);

function applyTextSizePreference(tooltip, size) {
  if (!tooltip) return;
  const nextSize = SIZE_LEVELS.includes(size) ? size : DEFAULT_SIZE;
  tooltip.dataset.size = nextSize;
}

function updateSizeButtonStates(decreaseSizeBtn, increaseSizeBtn, size) {
  if (!decreaseSizeBtn && !increaseSizeBtn) return;
  const levels = SIZE_LEVELS;
  const appliedSize = levels.includes(size) ? size : DEFAULT_SIZE;
  const currentIndex = levels.indexOf(appliedSize);
  if (decreaseSizeBtn) {
    decreaseSizeBtn.disabled = currentIndex <= 0;
  }
  if (increaseSizeBtn) {
    increaseSizeBtn.disabled = currentIndex === -1 ? false : currentIndex >= levels.length - 1;
  }
}

function clampToViewport(left, top, width, height, { win = window, doc = document, margin = VIEWPORT_MARGIN } = {}) {
  const safeDoc = doc || window.document;
  const scrollX = win?.scrollX ?? safeDoc?.documentElement?.scrollLeft ?? safeDoc?.body?.scrollLeft ?? 0;
  const scrollY = win?.scrollY ?? safeDoc?.documentElement?.scrollTop ?? safeDoc?.body?.scrollTop ?? 0;
  const viewportWidth = win?.innerWidth ?? safeDoc?.documentElement?.clientWidth ?? width;
  const viewportHeight = win?.innerHeight ?? safeDoc?.documentElement?.clientHeight ?? height;
  const minLeft = scrollX + margin;
  const minTop = scrollY + margin;
  const maxLeft = scrollX + viewportWidth - width - margin;
  const maxTop = scrollY + viewportHeight - height - margin;
  const clampedLeft = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));
  const clampedTop = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop));
  return {
    left: Math.round(Number.isFinite(clampedLeft) ? clampedLeft : left),
    top: Math.round(Number.isFinite(clampedTop) ? clampedTop : top)
  };
}

function positionTooltip(tooltip, anchor, session, {
  force = false,
  win = window,
  doc = document,
  margin = VIEWPORT_MARGIN
} = {}) {
  if (!tooltip || !anchor) return;
  if (tooltip.style.display === 'none') return;
  if (!force && tooltip.dataset.pinned === 'true') return;

  const rect = anchor.getBoundingClientRect?.();
  if (!rect || (rect.width === 0 && rect.height === 0)) return;

  const tooltipRect = tooltip.getBoundingClientRect?.();
  const tooltipWidth = tooltipRect?.width || tooltip.offsetWidth || DEFAULT_TOOLTIP_WIDTH;
  const tooltipHeight = tooltipRect?.height || tooltip.offsetHeight || DEFAULT_TOOLTIP_HEIGHT;
  const scrollX = win?.scrollX ?? doc?.documentElement?.scrollLeft ?? doc?.body?.scrollLeft ?? 0;
  const scrollY = win?.scrollY ?? doc?.documentElement?.scrollTop ?? doc?.body?.scrollTop ?? 0;
  const viewportWidth = win?.innerWidth ?? doc?.documentElement?.clientWidth ?? tooltipWidth;
  const viewportHeight = win?.innerHeight ?? doc?.documentElement?.clientHeight ?? tooltipHeight;

  let left = rect.left + scrollX;
  let top = rect.bottom + scrollY + 10;

  if (left + tooltipWidth > scrollX + viewportWidth - margin) {
    left = scrollX + viewportWidth - tooltipWidth - margin;
  }
  if (left < scrollX + margin) {
    left = scrollX + margin;
  }

  if (top + tooltipHeight > scrollY + viewportHeight - margin) {
    top = rect.top + scrollY - tooltipHeight - 10;
  }
  if (top < scrollY + margin) {
    top = scrollY + margin;
  }

  left = Math.round(left);
  top = Math.round(top);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.dataset.pinned = 'false';

  if (session) {
    session.tooltipPosition = { left, top };
    session.tooltipPositionedByUser = false; // Clear manual positioning flag when auto-positioning
  }
}

function renderConversation(session, elements, {
  doc,
  renderMarkdown = value => value,
  formatTimestamp = () => '',
  maxVisibleMessages = 6
} = {}) {
  if (!session || !elements || !doc) return;
  const {
    tooltip,
    listEl,
    titleEl,
    subtitleEl,
    metaContextEl,
    metaTimeEl,
    inputEl,
    sendButton,
    regenerateButton
  } = elements;

  if (!listEl || !tooltip) return;

  listEl.textContent = '';
  listEl.setAttribute('aria-busy', session.isStreaming ? 'true' : 'false');

  const fragment = doc.createDocumentFragment();
  const messages = session.messages.slice(-maxVisibleMessages);

  messages.forEach(message => {
    const item = doc.createElement('li');
    item.className = 'hx-chat-tooltip__item';

    const roleLine = doc.createElement('div');
    roleLine.className = 'hx-chat-tooltip__role';
    const timestamp = formatTimestamp(message.timestamp);
    const roleLabel = message.role === 'user' ? 'You' : 'Assistant';
    roleLine.innerHTML = `<span>${roleLabel}</span><span>${timestamp}</span>`;
    item.appendChild(roleLine);

    const content = doc.createElement('div');
    content.className = 'hx-chat-tooltip__content';

    if (message.role === 'assistant' && message.display && typeof message.display === 'object') {
      const { explanation, url } = message.display;
      const text = explanation || (url ? 'Reference available.' : 'Generated response unavailable.');
      content.innerHTML = renderMarkdown(text);
      if (url) {
        const link = doc.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = ' Source';
        link.style.marginLeft = '4px';
        content.appendChild(link);
      }
    } else {
      const text = typeof message.display === 'string' ? message.display : '(no content)';
      content.innerHTML = renderMarkdown(text);
    }

    item.appendChild(content);
    fragment.appendChild(item);
  });

  if (session.isStreaming) {
    const streamingItem = doc.createElement('li');
    streamingItem.className = 'hx-chat-tooltip__item';
    streamingItem.setAttribute('role', 'status');
    streamingItem.setAttribute('aria-live', 'polite');

    const roleLine = doc.createElement('div');
    roleLine.className = 'hx-chat-tooltip__role';
    roleLine.innerHTML = `<span>Assistant</span><span>${formatTimestamp(Date.now())}</span>`;

    const content = doc.createElement('div');
    content.className = 'hx-chat-tooltip__content';
    content.innerHTML = '<span class="hx-sr-only">Generating response, please wait. </span><span class="hx-streaming-text">Generating…</span>';

    streamingItem.appendChild(roleLine);
    streamingItem.appendChild(content);
    fragment.appendChild(streamingItem);
  }

  listEl.appendChild(fragment);
  listEl.scrollTop = listEl.scrollHeight;

  if (titleEl) {
    titleEl.textContent = session.subject ? `${session.subject} · Hypertext` : 'Hypertext';
  }
  if (subtitleEl) {
    const pill = session.lastResult?.pillText || 'Inline insight';
    subtitleEl.textContent = pill;
  }
  if (metaContextEl) {
    const focusLabel = session.lastResult?.pillText || session.subject || 'Active selection';
    metaContextEl.textContent = `Focus: ${focusLabel}`;
  }
  if (metaTimeEl) {
    metaTimeEl.textContent = session.lastUpdatedAt ? formatTimestamp(session.lastUpdatedAt) : '';
  }

  if (inputEl) {
    inputEl.value = session.draft || '';
  }
  if (sendButton) {
    sendButton.disabled = Boolean(session.isStreaming);
  }
  if (regenerateButton) {
    regenerateButton.disabled = Boolean(session.isStreaming || !session.lastResult);
  }

  if (tooltip) {
    tooltip.classList.toggle('is-streaming', Boolean(session.isStreaming));
  }
}

function createTooltipController(session, doc, win, sharedConfig = {}) {
  if (!session) {
    throw new Error('createTooltipController requires a session object.');
  }
  if (!doc || !doc.body) {
    throw new Error('createTooltipController requires a document with a body element.');
  }

  const scopedWin = win || doc.defaultView || globalThis;

  const {
    getNextZIndex,
    renderConversation: renderConversationFn = renderConversation,
    applyTextSizePreference: applyTextSizePreferenceFn = applyTextSizePreference,
    updateSizeButtonStates: updateSizeButtonStatesFn = updateSizeButtonStates,
    clampToViewport: clampToViewportFn = clampToViewport,
    positionTooltip: positionTooltipFn = positionTooltip,
    sizeLevels = SIZE_LEVELS,
    defaultSize = DEFAULT_SIZE,
    autoCloseDelay = AUTO_CLOSE_DELAY_MS,
    tooltipMargin = VIEWPORT_MARGIN,
    readStoredTextSize,
    storeTextSize,
    onSend,
    onRegenerate,
    onDraftChange,
    onPinnedChange,
    onAutoClose,
    onShow,
    onHide,
    onDestroy
  } = sharedConfig;

  const tooltipNodes = buildTooltip(doc, session.id);
  const {
    tooltip,
    titleEl,
    subtitleEl,
    metaContextEl,
    metaTimeEl,
    listEl,
    inputEl,
    sendButton,
    regenerateButton,
    pinButton,
    decreaseSizeBtn,
    increaseSizeBtn,
    dragHandle,
    resizeHandle
  } = tooltipNodes;

  let dragState = null;
  let resizeState = null;
  let closeTimeout = null;
  let currentZIndex = TOOLTIP_BASE_Z_INDEX;
  let active = false;
  let controllerApi = null;

  // Set z-index based on nesting BEFORE any other operations
  if (session.nestingLevel > 0 && session.targetZIndex) {
    tooltip.style.zIndex = String(session.targetZIndex);
    currentZIndex = session.targetZIndex;
    tooltip.dataset.nested = 'true';
    tooltip.dataset.nestingLevel = String(session.nestingLevel);
  }

  const textSize = typeof readStoredTextSize === 'function'
    ? readStoredTextSize(session)
    : (session.tooltipSizePreference || defaultSize);
  applyTextSizePreferenceFn(tooltip, textSize);
  updateSizeButtonStatesFn(decreaseSizeBtn, increaseSizeBtn, tooltip.dataset.size || defaultSize);

  function bringToFront() {
    // Calculate next z-index respecting parent/child hierarchy
    let nextZ = typeof getNextZIndex === 'function'
      ? getNextZIndex()
      : ++currentZIndex;
    const appliedZ = Number.isFinite(nextZ) ? nextZ : ++currentZIndex;
    let targetZ = Math.max(appliedZ, TOOLTIP_BASE_Z_INDEX);

    // If this session has a parent, respect the nesting order
    if (session.parentSessionId && session.targetZIndex) {
      const getSession = sharedConfig?.getSession;
      const getController = sharedConfig?.getController;

      if (getSession && getController) {
        const parentSession = getSession(session.parentSessionId);
        if (parentSession) {
          const parentController = getController(parentSession.id);
          if (parentController) {
            const parentZ = parseInt(parentController.element.style.zIndex || TOOLTIP_BASE_Z_INDEX, 10);
            // Child must stay above parent - use the original target or parent + 1
            targetZ = Math.max(session.targetZIndex, parentZ + 1);
          }
        }
      }
    }

    // If this session has children, stay below them
    if (session.childSessionIds && session.childSessionIds.size > 0) {
      const getController = sharedConfig?.getController;
      if (getController) {
        let minChildZ = Infinity;
        session.childSessionIds.forEach(childId => {
          const childController = getController(childId);
          if (childController) {
            const childZ = parseInt(childController.element.style.zIndex || TOOLTIP_BASE_Z_INDEX, 10);
            minChildZ = Math.min(minChildZ, childZ);
          }
        });
        if (minChildZ !== Infinity) {
          // Parent must stay below all children
          targetZ = Math.min(targetZ, minChildZ - 1);
        }
      }
    }

    currentZIndex = targetZ;
    tooltip.style.zIndex = String(currentZIndex);

    // Keep session.targetZIndex in sync for nested tooltips
    if (session.nestingLevel > 0) {
      session.targetZIndex = targetZ;
    }
  }

  function cancelClose() {
    if (closeTimeout) {
      scopedWin.clearTimeout(closeTimeout);
      closeTimeout = null;
    }
  }

  function scheduleClose(delay = autoCloseDelay) {
    cancelClose();
    if (session.isPinned) return;
    closeTimeout = scopedWin.setTimeout(() => {
      closeTimeout = null;
      const hoverAnchor = session.wrapper?.matches?.(':hover');
      const hoverTooltip = tooltip.matches?.(':hover');
      if (session.isPinned || hoverAnchor || hoverTooltip || tooltip.classList.contains('dragging') || tooltip.classList.contains('resizing')) {
        return;
      }
      if (typeof onAutoClose === 'function') {
        onAutoClose(session, controllerApi);
      } else {
        hide();
      }
    }, delay);
  }

  function focusInput() {
    inputEl?.focus();
  }

  function applyPinnedUi(pinned) {
    const nextPinned = Boolean(pinned);
    tooltip.dataset.pinned = nextPinned ? 'true' : 'false';
    tooltip.classList.toggle('is-pinned', nextPinned);
    if (pinButton) {
      pinButton.classList.toggle('is-active', nextPinned);
      pinButton.setAttribute('aria-pressed', nextPinned ? 'true' : 'false');
      pinButton.title = nextPinned ? 'Unpin chat' : 'Pin chat';
      pinButton.textContent = nextPinned ? '📍' : '📌';
    }
  }

  function setPinned(pinned) {
    const prevPinned = Boolean(session.isPinned);
    const nextPinned = Boolean(pinned);
    session.isPinned = nextPinned;
    applyPinnedUi(nextPinned);
    if (typeof onPinnedChange === 'function' && nextPinned !== prevPinned) {
      onPinnedChange(session, nextPinned);
    }
  }

  function setActive(nextActive) {
    active = Boolean(nextActive);
    tooltip.classList.toggle('is-active', active);
    if (active) {
      bringToFront();
    }
  }

  function position(anchor = session.wrapper, options = {}) {
    if (!anchor) return;
    positionTooltipFn(tooltip, anchor, session, {
      doc,
      win: scopedWin,
      margin: options.margin ?? tooltipMargin,
      force: options.force ?? false
    });
  }

  function show({ anchor = session.wrapper, force = false } = {}) {
    tooltip.dataset.sessionId = session.id;
    tooltip.style.display = 'flex';
    tooltip.style.opacity = '0';
    tooltip.setAttribute('aria-hidden', 'false');
    tooltip.classList.remove('dragging', 'resizing');
    bringToFront();
    applyPinnedUi(session.isPinned);

    if (session.tooltipSize?.width) {
      tooltip.style.width = `${session.tooltipSize.width}px`;
    } else {
      tooltip.style.width = '';
    }

    if (session.tooltipSize?.height) {
      tooltip.style.height = `${session.tooltipSize.height}px`;
    } else {
      tooltip.style.height = '';
    }

    const useManualPosition = session.tooltipPosition && (session.isPinned || session.tooltipPositionedByUser) && !force;

    if (useManualPosition) {
      tooltip.style.left = `${session.tooltipPosition.left}px`;
      tooltip.style.top = `${session.tooltipPosition.top}px`;
    } else if (anchor) {
      position(anchor, { force: true });
    } else if (session.tooltipPosition) {
      tooltip.style.left = `${session.tooltipPosition.left}px`;
      tooltip.style.top = `${session.tooltipPosition.top}px`;
    } else {
      tooltip.style.left = '0px';
      tooltip.style.top = '0px';
    }

    const raf = scopedWin?.requestAnimationFrame || globalThis.requestAnimationFrame;
    raf?.(() => {
      if (useManualPosition) {
        // Clamp manually-positioned or pinned tooltips to viewport
        const width = tooltip.offsetWidth || MIN_TOOLTIP_WIDTH;
        const height = tooltip.offsetHeight || MIN_TOOLTIP_HEIGHT;
        const desiredLeft = session.tooltipPosition?.left ?? tooltip.offsetLeft;
        const desiredTop = session.tooltipPosition?.top ?? tooltip.offsetTop;
        const clamped = clampToViewportFn(desiredLeft, desiredTop, width, height, {
          win: scopedWin,
          doc,
          margin: tooltipMargin
        });
        tooltip.style.left = `${clamped.left}px`;
        tooltip.style.top = `${clamped.top}px`;
        session.tooltipPosition = clamped;
      } else if (anchor) {
        position(anchor, { force });
      }
      tooltip.style.opacity = '1';
    });

    if (typeof onShow === 'function') {
      onShow(session);
    }
  }

  function hide() {
    cancelClose();
    tooltip.style.display = 'none';
    tooltip.style.opacity = '';
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.classList.remove('dragging', 'resizing');
    tooltip.classList.remove('is-pinned');
    delete tooltip.dataset.sessionId;
    active = false;
    if (typeof onHide === 'function') {
      onHide(session);
    }
  }

  function saveGeometry(targetSession = session) {
    if (!targetSession) return;
    const width = Math.round(tooltip.offsetWidth || 0);
    const height = Math.round(tooltip.offsetHeight || 0);
    const left = Math.round(tooltip.offsetLeft || 0);
    const top = Math.round(tooltip.offsetTop || 0);
    if (width > 0 && height > 0) {
      targetSession.tooltipSize = { width, height };
    }
    targetSession.tooltipPosition = { left, top };
  }

  function handleDragStart(event) {
    if (!dragHandle || tooltip.style.display === 'none') return;
    if (typeof event.button === 'number' && event.button !== 0 && event.pointerType !== 'touch' && event.pointerType !== 'pen') {
      return;
    }
    cancelClose();
    dragHandle.setPointerCapture?.(event.pointerId);
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: tooltip.offsetLeft,
      startTop: tooltip.offsetTop
    };
    tooltip.classList.add('dragging');
    event.preventDefault();
  }

  function handleDragMove(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    const width = tooltip.offsetWidth || MIN_TOOLTIP_WIDTH;
    const height = tooltip.offsetHeight || MIN_TOOLTIP_HEIGHT;
    const targetLeft = dragState.startLeft + dx;
    const targetTop = dragState.startTop + dy;
    const { left, top } = clampToViewportFn(targetLeft, targetTop, width, height, { win: scopedWin, doc });
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    session.tooltipPosition = { left, top };
    event.preventDefault();
  }

  function handleDragEnd(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (dragHandle?.hasPointerCapture?.(event.pointerId)) {
      dragHandle.releasePointerCapture(event.pointerId);
    }
    tooltip.classList.remove('dragging');
    saveGeometry();
    session.tooltipPositionedByUser = true;
    dragState = null;
    event.preventDefault();
  }

  function handleResizeStart(event) {
    if (!resizeHandle || tooltip.style.display === 'none') return;
    if (typeof event.button === 'number' && event.button !== 0 && event.pointerType !== 'touch' && event.pointerType !== 'pen') {
      return;
    }
    cancelClose();
    resizeHandle.setPointerCapture?.(event.pointerId);
    resizeState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: tooltip.offsetWidth || MIN_TOOLTIP_WIDTH,
      startHeight: tooltip.offsetHeight || MIN_TOOLTIP_HEIGHT,
      startLeft: tooltip.offsetLeft,
      startTop: tooltip.offsetTop
    };
    tooltip.classList.add('resizing');
    event.preventDefault();
  }

  function handleResizeMove(event) {
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;
    const dx = event.clientX - resizeState.startX;
    const dy = event.clientY - resizeState.startY;
    const viewportMaxWidth = Math.min(
      MAX_TOOLTIP_WIDTH,
      Math.max(MIN_TOOLTIP_WIDTH, (scopedWin?.innerWidth ?? MIN_TOOLTIP_WIDTH) - 2 * VIEWPORT_MARGIN)
    );
    const viewportMaxHeight = Math.min(
      MAX_TOOLTIP_HEIGHT,
      Math.max(MIN_TOOLTIP_HEIGHT, (scopedWin?.innerHeight ?? MIN_TOOLTIP_HEIGHT) - 2 * VIEWPORT_MARGIN)
    );
    const width = Math.round(Math.min(Math.max(resizeState.startWidth + dx, MIN_TOOLTIP_WIDTH), viewportMaxWidth));
    const height = Math.round(Math.min(Math.max(resizeState.startHeight + dy, MIN_TOOLTIP_HEIGHT), viewportMaxHeight));

    tooltip.style.width = `${width}px`;
    tooltip.style.height = `${height}px`;

    const { left, top } = clampToViewportFn(resizeState.startLeft, resizeState.startTop, width, height, { win: scopedWin, doc });
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    session.tooltipPosition = { left, top };
    session.tooltipSize = { width, height };

    event.preventDefault();
  }

  function handleResizeEnd(event) {
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;
    if (resizeHandle?.hasPointerCapture?.(event.pointerId)) {
      resizeHandle.releasePointerCapture(event.pointerId);
    }
    tooltip.classList.remove('resizing');
    saveGeometry();
    session.tooltipPositionedByUser = true;
    resizeState = null;
    event.preventDefault();
  }

  function render(sessionOverride = session) {
    if (!sessionOverride) return;
    renderConversationFn(sessionOverride, {
      tooltip,
      listEl,
      titleEl,
      subtitleEl,
      metaContextEl,
      metaTimeEl,
      inputEl,
      sendButton,
      regenerateButton
    }, {
      doc,
      renderMarkdown: sharedConfig.renderMarkdown,
      formatTimestamp: sharedConfig.formatTimestamp,
      maxVisibleMessages: sharedConfig.maxVisibleMessages
    });
  }

  function handleSend() {
    const text = inputEl?.value?.trim();
    if (!text) return;
    if (inputEl) {
      inputEl.value = '';
    }
    session.draft = '';
    if (typeof onSend === 'function') {
      onSend(session, text);
    }
  }

  function handleRegenerate() {
    if (typeof onRegenerate === 'function') {
      onRegenerate(session);
    }
  }

  function handleDraftInput() {
    session.draft = inputEl?.value ?? '';
    if (typeof onDraftChange === 'function') {
      onDraftChange(session, session.draft);
    }
  }

  function changeSize(delta) {
    const levels = Array.isArray(sizeLevels) && sizeLevels.length ? sizeLevels : SIZE_LEVELS;
    const currentSize = tooltip.dataset.size || defaultSize;
    const currentIndex = levels.indexOf(currentSize);
    const nextIndex = currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= levels.length) return;
    const nextSize = levels[nextIndex];
    applyTextSizePreferenceFn(tooltip, nextSize);
    updateSizeButtonStatesFn(decreaseSizeBtn, increaseSizeBtn, nextSize);
    if (typeof storeTextSize === 'function') {
      storeTextSize(nextSize, session);
    } else {
      session.tooltipSizePreference = nextSize;
    }
  }

  const tooltipMouseLeaveHandler = () => scheduleClose();

  function cleanup() {
    cancelClose();
    dragHandle?.removeEventListener('pointerdown', handleDragStart);
    dragHandle?.removeEventListener('pointermove', handleDragMove);
    dragHandle?.removeEventListener('pointerup', handleDragEnd);
    dragHandle?.removeEventListener('pointercancel', handleDragEnd);

    resizeHandle?.removeEventListener('pointerdown', handleResizeStart);
    resizeHandle?.removeEventListener('pointermove', handleResizeMove);
    resizeHandle?.removeEventListener('pointerup', handleResizeEnd);
    resizeHandle?.removeEventListener('pointercancel', handleResizeEnd);

    decreaseSizeBtn?.removeEventListener('click', decreaseSizeHandler);
    increaseSizeBtn?.removeEventListener('click', increaseSizeHandler);
    pinButton?.removeEventListener('click', pinHandler);
    sendButton?.removeEventListener('click', handleSend);
    regenerateButton?.removeEventListener('click', handleRegenerate);
    inputEl?.removeEventListener('input', handleDraftInput);
    inputEl?.removeEventListener('keydown', inputKeydownHandler);
    tooltip.removeEventListener('mouseenter', cancelClose);
    tooltip.removeEventListener('mouseleave', tooltipMouseLeaveHandler);
    tooltip.removeEventListener('click', tooltipClickHandler);
  }

  const decreaseSizeHandler = () => changeSize(-1);
  const increaseSizeHandler = () => changeSize(1);
  const pinHandler = () => setPinned(!session.isPinned);
  const tooltipClickHandler = () => {
    // Bring tooltip to front on any click
    bringToFront();
  };
  const inputKeydownHandler = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  dragHandle?.addEventListener('pointerdown', handleDragStart);
  dragHandle?.addEventListener('pointermove', handleDragMove);
  dragHandle?.addEventListener('pointerup', handleDragEnd);
  dragHandle?.addEventListener('pointercancel', handleDragEnd);

  resizeHandle?.addEventListener('pointerdown', handleResizeStart);
  resizeHandle?.addEventListener('pointermove', handleResizeMove);
  resizeHandle?.addEventListener('pointerup', handleResizeEnd);
  resizeHandle?.addEventListener('pointercancel', handleResizeEnd);

  decreaseSizeBtn?.addEventListener('click', decreaseSizeHandler);
  increaseSizeBtn?.addEventListener('click', increaseSizeHandler);
  pinButton?.addEventListener('click', pinHandler);
  sendButton?.addEventListener('click', handleSend);
  regenerateButton?.addEventListener('click', handleRegenerate);
  inputEl?.addEventListener('input', handleDraftInput);
  inputEl?.addEventListener('keydown', inputKeydownHandler);

  tooltip.addEventListener('mouseenter', cancelClose);
  tooltip.addEventListener('mouseleave', tooltipMouseLeaveHandler);
  tooltip.addEventListener('click', tooltipClickHandler);

  controllerApi = {
    element: tooltip,
    render,
    show,
    hide,
    position,
    setPinned,
    setActive,
    get isActive() {
      return active;
    },
    focusInput,
    scheduleClose,
    cancelClose,
    saveGeometry,
    destroy() {
      cleanup();
      tooltip.remove();
      active = false;
      if (typeof onDestroy === 'function') {
        onDestroy(session);
      }
    }
  };

  return controllerApi;
}

function defaultHotkey(event) {
  const key = event.key?.toLowerCase();
  return (event.metaKey || event.ctrlKey) && event.shiftKey && key === 'k';
}

function sanitizeSelectionText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function formatAssistantDisplay(result) {
  if (!result) {
    return {
      explanation: 'No response.',
      url: null,
      linkLabel: null
    };
  }

  const explanation = typeof result.explanation === 'string' ? result.explanation.trim() : '';
  const url = typeof result.url === 'string' ? result.url.trim() : '';
  let linkLabel = null;

  if (url) {
    try {
      const parsed = new URL(url);
      linkLabel = parsed.hostname.replace(/^www\./i, '');
    } catch (error) {
      linkLabel = url;
    }
  }

  let explanationText = explanation;
  if (!explanationText) {
    explanationText = url ? 'Reference available. See link below.' : 'Generated response unavailable.';
  }

  return {
    explanation: explanationText,
    url: url || null,
    linkLabel: linkLabel
  };
}

function parseHypertextJson(rawText) {
  const cleaned = rawText
    .replace(/^```json/gim, '')
    .replace(/```$/gim, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in backend response.');
  }
  const candidate = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (error) {
    const normalized = candidate
      .replace(/“|”/g, '"')
      .replace(/‘|’/g, "'")
      .replace(/\r?\n/g, '\n');
    return JSON.parse(normalized);
  }
}

function buildSystemPrompt() {
  return [
    'You are a helpful AI assistant. You have been given the full context of the webpage (URL, title, and page content) along with the user\'s selected text. Answer their questions using this context.',
    'Respond with a single JSON object that matches this schema:',
    '{',
    '  "pillText": string,',
    '  "mode": "inline" | "reference",',
    '  "explanation"?: string,',
    '  "url"?: string',
    '}',
    'Rules:',
    '1. Return JSON only. No extra commentary or Markdown fences.',
    '2. If mode is "inline", include "explanation" (plain text; use \\n for newlines). Provide enough context and detail to be genuinely helpful - don\'t be overly brief. Write naturally, but stay focused and relevant.',
    '3. If mode is "reference", include "url" and add an "explanation" to summarize or contextualize the link.',
    '4. Only emit "url" values you are confident exist. Prefer reputable, well-known sources and never guess.',
    '5. You may include both "explanation" and "url" together when you have reliable information for each.',
    '6. Keep pillText under 45 characters.',
    '7. Use double quotes for all JSON keys and strings.',
    '8. If the user provides custom instructions, follow them exactly even if they request playful or unconventional output.'
  ].join('\n');
}

function createHyperlinkSpan(doc, subject) {
  const span = doc.createElement('span');
  span.className = 'hx-highlight loading';
  span.textContent = subject;
  span.setAttribute('role', 'link');
  span.setAttribute('tabindex', '0');
  span.setAttribute('aria-haspopup', 'dialog');
  span.setAttribute('aria-expanded', 'false');
  return span;
}

function createHypertextExperience(options = {}) {
  const {
    document: customDocument,
    backendUrl = 'http://localhost:3100',
    contextProvider,
    hotkey = defaultHotkey,
    selectionValidator,
    autoOpenTooltipOnHover = true,
    registerExternalTrigger,
    chatPageUrl = 'demo/simple_chat_page.html'
  } = options;

  const doc = customDocument || document;
  const win = doc.defaultView || window;

  if (!doc || !doc.body) {
    throw new Error('createHypertextExperience requires a document with a body element.');
  }

  // Markdown rendering support: Load marked and DOMPurify from CDN
  let markedLib = null;
  let DOMPurifyLib = null;
  let markdownLibsLoaded = false;

  function loadMarkdownLibraries() {
    if (markdownLibsLoaded) return Promise.resolve();

    return Promise.all([
      new Promise((resolve, reject) => {
        if (win.marked) {
          markedLib = win.marked;
          resolve();
          return;
        }
        const script = doc.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked@16.0.0/marked.min.js';
        script.onload = () => {
          markedLib = win.marked;
          resolve();
        };
        script.onerror = reject;
        doc.head.appendChild(script);
      }),
      new Promise((resolve, reject) => {
        if (win.DOMPurify) {
          DOMPurifyLib = win.DOMPurify;
          resolve();
          return;
        }
        const script = doc.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js';
        script.onload = () => {
          DOMPurifyLib = win.DOMPurify;
          resolve();
        };
        script.onerror = reject;
        doc.head.appendChild(script);
      })
    ]).then(() => {
      markdownLibsLoaded = true;
    }).catch(error => {
      console.warn('[Hypertext] Failed to load markdown libraries:', error);
    });
  }

  function renderMarkdown(text) {
    if (!text) return '';

    // If libraries aren't loaded yet, at minimum convert newlines to <br> tags
    if (!markdownLibsLoaded || !markedLib || !DOMPurifyLib) {
      // Basic escaping to prevent XSS, then convert newlines
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return escaped.replace(/\n/g, '<br>');
    }

    try {
      // Parse markdown to HTML
      const rawHtml = markedLib.parse(text, { breaks: true, gfm: true });

      // Sanitize HTML to prevent XSS
      const cleanHtml = DOMPurifyLib.sanitize(rawHtml, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false
      });

      return cleanHtml;
    } catch (error) {
      console.warn('[Hypertext] Markdown rendering failed:', error);
      // Fallback: escape and convert newlines
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return escaped.replace(/\n/g, '<br>');
    }
  }

  // Load markdown libraries asynchronously on initialization
  loadMarkdownLibraries();

  injectStyles(doc);

  const {
    palette,
    selectedTextEl,
    instructionInput,
    generateButton,
    toggleTruncationButton
  } = buildPalette(doc);
  doc.body.appendChild(palette);

  const sessions = new Map();
  const controllers = new Map();
  let currentZIndex = 2147483000;
  const getNextZIndex = () => ++currentZIndex;
  let hyperlinkCounter = 0;
  let activeSelection = '';
  let activeRange = null;
  let activeChatSession = null;
  let palettePinned = false;
  let cachedRange = null;
  let cachedText = '';
  let truncateContext = false;

  const PILL_STATES = ['loading', 'ready-inline', 'ready-reference', 'ready-url', 'error'];
  const TEXT_SIZE_STORAGE_KEY = 'hypertext:inlineSize';
  const MAX_VISIBLE_MESSAGES = 6;

  const controllerFor = session => (session ? controllers.get(session.id) || null : null);
  const controllerById = sessionId => (sessionId ? controllers.get(sessionId) || null : null);

  function renderSessionTooltip(session) {
    const controller = controllerFor(session);
    if (controller) {
      controller.render(session);
    }
  }

  function positionSessionTooltip(session, options = {}) {
    const controller = controllerFor(session);
    if (!controller) return;
    const anchor = options.anchor ?? session?.wrapper;
    controller.position(anchor, options);
  }

  function showSessionTooltip(session, options = {}) {
    const controller = controllerFor(session);
    if (!controller) return;
    controller.show({ anchor: options.anchor ?? session?.wrapper, force: options.force ?? false });
  }

  function focusSessionInput(session) {
    const controller = controllerFor(session);
    controller?.focusInput();
  }

  function createControllerForSession(session) {
    if (!session) return null;
    let controller = controllers.get(session.id);
    if (controller) return controller;

    controller = createTooltipController(session, doc, win, {
      getNextZIndex,
      renderMarkdown,
      formatTimestamp,
      maxVisibleMessages: MAX_VISIBLE_MESSAGES,
      readStoredTextSize,
      storeTextSize,
      applyTextSizePreference,
      updateSizeButtonStates,
      clampToViewport,
      tooltipMargin: VIEWPORT_MARGIN,
      // Helpers for parent session lookup
      getSession: (id) => sessions.get(id),
      getController: (id) => controllers.get(id),
      onSend: (ctrlSession, text) => runHypertext(ctrlSession, 'append', text),
      onRegenerate: ctrlSession => runHypertext(ctrlSession, 'regenerate'),
      onDraftChange: (ctrlSession, draft) => {
        ctrlSession.draft = draft;
      },
      onPinnedChange: (ctrlSession, pinned) => {
        ctrlSession.wrapper?.setAttribute('data-pinned', pinned ? 'true' : 'false');
        if (pinned) {
          cancelTooltipClose(ctrlSession);
        } else if (activeChatSession === ctrlSession) {
          scheduleTooltipClose(AUTO_CLOSE_DELAY_MS, ctrlSession);
        }
      },
      onAutoClose: ctrlSession => {
        closeChat({ sessionId: ctrlSession.id });
      },
      onShow: ctrlSession => {
        ctrlSession.wrapper?.setAttribute('aria-expanded', 'true');
      },
      onHide: ctrlSession => {
        if (activeChatSession !== ctrlSession) {
          ctrlSession.wrapper?.setAttribute('aria-expanded', 'false');
        }
      },
      onDestroy: ctrlSession => {
        controllers.delete(ctrlSession.id);
      }
    });

    controllers.set(session.id, controller);
    doc.body.appendChild(controller.element);
    return controller;
  }

  function readStoredTextSize() {
    try {
      const value = win.localStorage?.getItem(TEXT_SIZE_STORAGE_KEY);
      return SIZE_LEVELS.includes(value) ? value : DEFAULT_SIZE;
    } catch (error) {
      return DEFAULT_SIZE;
    }
  }

  function storeTextSize(value) {
    if (!SIZE_LEVELS.includes(value)) {
      console.warn(`[Hypertext] Invalid size: ${value}, defaulting to ${DEFAULT_SIZE}`);
      value = DEFAULT_SIZE;
    }
    try {
      win.localStorage?.setItem(TEXT_SIZE_STORAGE_KEY, value);
    } catch (error) {
      console.warn('[Hypertext] Failed to store text size:', error);
    }
  }

  function formatContextOutput(raw) {
    if (!truncateContext || typeof raw !== 'string') {
      return raw;
    }
    if (raw.length <= DEFAULT_TRUNCATED_CONTEXT_CHARS) {
      return raw;
    }
    return `${raw.slice(0, DEFAULT_TRUNCATED_CONTEXT_CHARS)}\n[Context truncated at ${DEFAULT_TRUNCATED_CONTEXT_CHARS} characters]`;
  }

  function getContext(session) {
    if (typeof contextProvider === 'function') {
      try {
        const value = contextProvider(session, { truncateContext });
        if (typeof value === 'string' && value.trim().length) {
          return formatContextOutput(value);
        }
      } catch (error) {
        console.warn('[Hypertext] contextProvider threw an error:', error);
      }
    }
    return buildDefaultContext(doc, session, truncateContext);
  }

  function updateTruncationButton() {
    if (!toggleTruncationButton) return;
    toggleTruncationButton.textContent = truncateContext ? 'Disable truncation' : 'Enable truncation';
    toggleTruncationButton.setAttribute('aria-pressed', truncateContext ? 'true' : 'false');
  }

  if (toggleTruncationButton) {
    updateTruncationButton();
    toggleTruncationButton.addEventListener('click', () => {
      truncateContext = !truncateContext;
      updateTruncationButton();
    });
  }

  function hidePalette() {
    palette.style.display = 'none';
    palettePinned = false;
    activeSelection = '';
    activeRange = null;
  }

  function cacheSelection(range, text) {
    cachedRange = range ? range.cloneRange() : null;
    cachedText = text || '';
  }

  function setPillState(session, state, errorMessage) {
    const { wrapper } = session;
    PILL_STATES.forEach(flag => wrapper.classList.remove(flag));
    if (state) {
      wrapper.classList.add(state);
      wrapper.dataset.state = state;
    } else {
      delete wrapper.dataset.state;
    }

    wrapper.removeAttribute('title');
    wrapper.removeAttribute('aria-busy');
    wrapper.removeAttribute('aria-label');

    if (state === 'loading') {
      wrapper.setAttribute('aria-busy', 'true');
      wrapper.title = 'Loading…';
      wrapper.setAttribute('aria-label', 'Loading hypertext');
    } else if (state && state.startsWith('ready') && session.lastResult?.pillText) {
      if (session.lastResult?.pillText) {
        wrapper.title = session.lastResult.pillText;
        wrapper.setAttribute('aria-label', session.lastResult.pillText);
      }
    } else if (state === 'error' && errorMessage) {
      wrapper.title = errorMessage;
      wrapper.setAttribute('aria-label', `Hypertext error: ${errorMessage}`);
    }
  }

  function buildInitialPrompt(session, instructions) {
    return [
      `Selection: "${session.subject}"`,
      'Context (may be truncated):',
      session.context ? session.context : '(no additional context)',
      instructions ? `Custom instructions: ${instructions}` : 'Custom instructions: (none provided)',
      'Decide whether the user would benefit more from an inline explanation or an external reference link. Follow the custom instructions exactly.',
      'Respond with JSON as described in the system prompt.'
    ].join('\n');
  }

  function buildFollowupPrompt(session, instructions) {
    return [
      `Selection: "${session.subject}"`,
      instructions ? `Follow-up request: ${instructions}` : 'Follow-up request: (none provided)',
      'Continue the previous conversation and respond with JSON as described in the system prompt.'
    ].join('\n');
  }

  async function streamHypertext(messages) {
    const payload = {
      messages,
      options: {
        system: buildSystemPrompt(),
        maxTokens: 512,
        temperature: 0.6
      }
    };

    const response = await fetch(`${backendUrl}/api/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Backend response body is empty.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let resultText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data) continue;
        if (data === '[DONE]') {
          buffer = '';
          break;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.delta?.text) {
            resultText += parsed.delta.text;
          }
        } catch (error) {
          console.warn('[Hypertext] Failed to parse SSE chunk:', data);
        }
      }
    }

    if (!resultText.trim()) {
      throw new Error('Backend returned an empty response.');
    }

    return parseHypertextJson(resultText);
  }

  function updateWrapperWithResult(session, result) {
    const { wrapper } = session;
    const pillText = (result.pillText || session.subject || 'Hypertext').trim();
    const explanation = typeof result.explanation === 'string' ? result.explanation.trim() : '';
    const url = typeof result.url === 'string' ? result.url.trim() : '';
    const mode = result.mode || (url ? 'reference' : 'inline');

    session.lastResult = {
      ...result,
      mode,
      pillText,
      explanation,
      url
    };

    session.lastUpdatedAt = Date.now();
    wrapper.dataset.kind = mode;
    wrapper.dataset.pillText = pillText;

    if (explanation) {
      wrapper.dataset.content = explanation;
    } else {
      delete wrapper.dataset.content;
    }

    if (url) {
      wrapper.dataset.url = url;
    } else {
      delete wrapper.dataset.url;
    }

    if (url) {
      setPillState(session, 'ready-reference');
    } else if (explanation) {
      setPillState(session, 'ready-inline');
    } else {
      setPillState(session, null);
    }
  }

  function resolveReadyState(result) {
    if (!result) return null;
    const hasUrl = typeof result.url === 'string' ? result.url.trim().length > 0 : Boolean(result.url);
    const hasExplanation = typeof result.explanation === 'string' ? result.explanation.trim().length > 0 : Boolean(result.explanation);
    if (hasUrl) return 'ready-reference';
    if (hasExplanation) return 'ready-inline';
    return null;
  }

  function formatTimestamp(value) {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  }

  function trimMessages(session, max = 50) {
    if (!session || !Array.isArray(session.messages)) return;
    if (session.messages.length > max) {
      session.messages.splice(0, session.messages.length - max);
    }
  }

  function extractDisplayText(message) {
    if (!message) return '';
    if (message.role === 'assistant' && message.display && typeof message.display === 'object') {
      const { explanation, url } = message.display;
      if (explanation) return explanation;
      if (url) return `Reference: ${url}`;
      return 'Generated response unavailable.';
    }
    if (typeof message.display === 'string') {
      return message.display;
    }
    if (typeof message.content === 'string') {
      return message.content;
    }
    return '';
  }

  function buildChatPayload(session) {
    if (!session) return null;
    const transcript = session.messages.slice(-50).map(item => ({
      role: item.role,
      content: extractDisplayText(item),
      timestamp: item.timestamp || null
    }));
    const latestAssistant = session.messages.slice().reverse().find(msg => msg.role === 'assistant');
    const summary = extractDisplayText(latestAssistant) || session.lastResult?.pillText || '';

    /**
     * Focus label collection - determines the "Focus: ..." metadata shown in chat UI.
     * Priority chain (first available value is used):
     * 1. session.lastResult?.pillText - The suggested pill text from LLM hypertext generation
     *    (e.g., "Gradient Reference", "Kinbote's interventions")
     * 2. session.subject - The subject set when opening the tooltip/palette
     *    (typically derived from highlighted text or page context)
     * 3. 'Active selection' - Default fallback when no context is available
     *
     * This label appears in:
     * - Chat tooltip metadata section (line ~1355)
     * - Full chat page handoff payload (below, line ~1256)
     * - Used to help users track what selection/context the conversation is about
     */
    const focusLabel = session.lastResult?.pillText || session.subject || 'Active selection';
    const controller = controllerFor(session);
    const textSize = controller?.element?.dataset?.size || readStoredTextSize();
    const payload = {
      subject: session.subject || 'Hypertext Chat',
      transcript,
      textSize,
      sourceUrl: doc.defaultView?.location?.href || '',
      timestamp: new Date().toISOString(),
      draft: session.draft || '',
      lastResult: session.lastResult || null,
      summary,
      focus: focusLabel
    };
    return payload;
  }

  function openChatPageFromSession(session, event) {
    const payload = buildChatPayload(session);
    if (!payload) return;
    try {
      win.sessionStorage?.setItem('hypertext:handoff', JSON.stringify(payload));
    } catch (error) {
      console.warn('[Hypertext] Failed to persist chat payload:', error);
    }
    closeChat({ force: true });
    const target = event?.shiftKey ? '_self' : '_blank';
    let resolvedUrl = chatPageUrl;
    try {
      resolvedUrl = new URL(chatPageUrl, win.location.href).toString();
    } catch (error) {
      /* ignore resolution errors */
    }
    try {
      win.open(resolvedUrl, target, 'noopener');
    } catch (error) {
      console.warn('[Hypertext] Failed to open chat page:', error);
    }
  }

  function cancelTooltipClose(session = activeChatSession) {
    const controller = controllerFor(session);
    controller?.cancelClose();
  }

  function scheduleTooltipClose(delay = AUTO_CLOSE_DELAY_MS, session = activeChatSession) {
    const controller = controllerFor(session);
    controller?.scheduleClose(delay);
  }

  function openChat(session, { autoFocus = true } = {}) {
    if (!session) return;

    if (activeChatSession && activeChatSession !== session) {
      const previousController = controllerFor(activeChatSession);
      previousController?.setActive(false);
      activeChatSession.wrapper?.setAttribute('aria-expanded', 'false');
    }

    const controller = createControllerForSession(session);
    if (!controller) return;

    controllers.forEach(ctrl => {
      if (ctrl !== controller && ctrl.isActive) {
        ctrl.setActive(false);
      }
    });

    activeChatSession = session;
    session.wrapper?.setAttribute('aria-expanded', 'true');

    controller.setActive(true);
    controller.cancelClose();
    controller.render(session);
    controller.show({ anchor: session.wrapper });

    if (autoFocus) {
      controller.focusInput();
    }
  }

  function getParentSessionFromSelection(activeRange, sessions) {
    if (!activeRange) return null;

    // Walk up from selection to find parent tooltip
    let el = activeRange.commonAncestorContainer;
    if (el.nodeType === Node.TEXT_NODE) {
      el = el.parentElement;
    }

    const parentTooltip = el?.closest('.hx-chat-tooltip');
    if (!parentTooltip) return null;

    // Find session matching this tooltip
    const parentSessionId = parentTooltip.dataset.sessionId;
    return parentSessionId ? sessions.get(parentSessionId) : null;
  }

  function closeChat({ force = false, sessionId = null } = {}) {
    const targetSession = sessionId ? sessions.get(sessionId) : activeChatSession;
    if (!targetSession) return;

    // Close all child sessions first (before checking if pinned)
    if (targetSession.childSessionIds && targetSession.childSessionIds.size > 0) {
      targetSession.childSessionIds.forEach(childId => {
        closeChat({ force: true, sessionId: childId });
      });
      targetSession.childSessionIds.clear();
    }

    if (!force && targetSession.isPinned) {
      return;
    }

    // Restore parent's pin state if this was a nested tooltip
    if (targetSession.parentSessionId) {
      const parentSession = sessions.get(targetSession.parentSessionId);
      if (parentSession) {
        // Remove this child from parent's tracking
        if (parentSession.childSessionIds) {
          parentSession.childSessionIds.delete(targetSession.id);
        }

        // Restore parent's original pin state
        if (!targetSession.parentWasPinned && parentSession.isPinned) {
          const parentController = controllerFor(parentSession);
          if (parentController && parentSession.childSessionIds.size === 0) {
            parentSession.isPinned = false;
            parentController.setPinned(false);
            console.log('[Hypertext] Restored parent pin state (unpinned)');
          }
        }
      }
    }

    if (force) {
      targetSession.isPinned = false;
    }

    const controller = controllerFor(targetSession);
    if (controller) {
      controller.cancelClose();
      controller.hide();
      controller.setActive(false);
      if (force || !targetSession.isPinned) {
        controller.destroy();
        controllers.delete(targetSession.id);
      }
    }

    if (targetSession.wrapper) {
      targetSession.wrapper.setAttribute('aria-expanded', 'false');
      targetSession.wrapper.removeAttribute('data-pinned');
    }

    if (targetSession === activeChatSession) {
      activeChatSession = null;
    }
  }

  async function runHypertext(session, mode, instructions) {
    if (session.isStreaming) return;
    session.isStreaming = true;
    if (activeChatSession === session) {
      renderSessionTooltip(session);
      positionSessionTooltip(session, { anchor: session.wrapper });
    }
    setPillState(session, 'loading');

    const requestMessages = session.messages.map(m => ({ role: m.role, content: m.content }));
    let userContent = null;
    let userDisplay = null;

    if (mode === 'initial') {
      userContent = buildInitialPrompt(session, instructions);
      userDisplay = instructions || '(no custom instructions)';
      session.lastInstructions = instructions || '';
    } else if (mode === 'append') {
      if (!instructions) {
        session.isStreaming = false;
        if (activeChatSession === session) {
          renderSessionTooltip(session);
          positionSessionTooltip(session, { anchor: session.wrapper });
        }
        setPillState(session, resolveReadyState(session.lastResult));
        return;
      }
      userContent = buildFollowupPrompt(session, instructions);
      userDisplay = instructions;
      session.lastInstructions = instructions;
    } else if (mode === 'regenerate') {
      if (session.messages.length && session.messages[session.messages.length - 1].role === 'assistant') {
        session.messages.pop();
        requestMessages.pop();
      }
      userContent = session.lastUserMessage || buildInitialPrompt(session, session.lastInstructions || '');
      userDisplay = session.lastInstructions || '(no custom instructions)';
    }

    if (!userContent) {
      session.isStreaming = false;
      if (activeChatSession === session) {
        renderSessionTooltip(session);
        positionSessionTooltip(session, { anchor: session.wrapper });
      }
      return;
    }

    if (mode !== 'regenerate') {
      const timestamp = Date.now();
      session.lastUserMessage = userContent;
      session.lastUpdatedAt = timestamp;
      session.messages.push({ role: 'user', content: userContent, display: userDisplay, timestamp });
      trimMessages(session);
      requestMessages.push({ role: 'user', content: userContent });
    }

    if (activeChatSession === session) {
      renderSessionTooltip(session);
      positionSessionTooltip(session, { anchor: session.wrapper });
    }

    try {
      const result = await streamHypertext(requestMessages);
      const assistantDisplay = formatAssistantDisplay(result);
      session.lastUpdatedAt = Date.now();
      session.messages.push({ role: 'assistant', content: JSON.stringify(result), display: assistantDisplay, timestamp: session.lastUpdatedAt });
      trimMessages(session);
      updateWrapperWithResult(session, result);
    } catch (error) {
      const message = error.message || 'Failed to generate hypertext.';
      session.lastUpdatedAt = Date.now();
      session.messages.push({ role: 'assistant', content: message, display: `Error: ${message}`, timestamp: session.lastUpdatedAt });
      trimMessages(session);
      setPillState(session, 'error', message);
    } finally {
      session.isStreaming = false;
      if (activeChatSession === session) {
        renderSessionTooltip(session);
        positionSessionTooltip(session, { anchor: session.wrapper });
      }
      // Auto-pin tooltip after initial generation
      if (mode === 'initial' && !session.isPinned) {
        session.isPinned = true;
        const controller = controllerFor(session);
        if (controller) {
          controller.setPinned(true);
        }
      }
    }
  }

  function applyHypertext(instructions) {
    if (!activeRange || !activeSelection) return;
    if (selectionValidator && !selectionValidator(activeRange, activeSelection)) {
      return;
    }

    // Detect parent session
    const parentSession = getParentSessionFromSelection(activeRange, sessions);

    // Check nesting depth
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

    // Store parent's current pin state
    const parentWasPinned = parentSession ? parentSession.isPinned : false;

    // Auto-pin parent tooltip to prevent it from closing
    if (parentSession && !parentSession.isPinned) {
      const parentController = controllerFor(parentSession);
      if (parentController) {
        parentController.setPinned(true);
        console.log('[Hypertext] Auto-pinned parent tooltip');
      }
    }

    // Calculate target z-index before creating tooltip
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

    // Advance global currentZIndex to ensure no conflicts
    if (targetZIndex > currentZIndex) {
      currentZIndex = targetZIndex;
    }

    const paletteRect = palette.style.display !== 'none' ? palette.getBoundingClientRect() : null;
    const scrollX = win.scrollX || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0;
    const scrollY = win.scrollY || doc.documentElement.scrollTop || doc.body.scrollTop || 0;

    const subject = activeSelection;
    const wrapper = createHyperlinkSpan(doc, subject);
    const sessionId = `hyper-${++hyperlinkCounter}`;
    wrapper.dataset.id = sessionId;

    const fragment = activeRange.extractContents();
    wrapper.textContent = '';
    if (fragment.childNodes.length) {
      wrapper.appendChild(fragment);
    } else {
      wrapper.textContent = subject;
    }
    activeRange.insertNode(wrapper);
    (win.getSelection && win.getSelection())?.removeAllRanges?.();

    const session = {
      id: sessionId,
      subject,
      context: getContext({ id: sessionId, subject }),
      wrapper,
      messages: [],
      lastResult: null,
      lastUserMessage: null,
      lastInstructions: instructions || '',
      isStreaming: false,
      draft: '',
      isPinned: false,
      tooltipPosition: null,
      tooltipSize: null,
      lastUpdatedAt: Date.now(),
      // Parent/child tracking
      parentSessionId: parentSession?.id || null,
      childSessionIds: new Set(),
      nestingLevel,
      parentWasPinned,
      targetZIndex
    };

    if (paletteRect) {
      const paletteWidth = Math.round(paletteRect.width);
      const paletteHeight = Math.round(paletteRect.height);
      const desiredWidth = Math.min(
        MAX_TOOLTIP_WIDTH,
        Math.max(DEFAULT_TOOLTIP_WIDTH, paletteWidth)
      );
      const desiredHeight = Math.min(
        MAX_TOOLTIP_HEIGHT,
        Math.max(DEFAULT_TOOLTIP_HEIGHT, paletteHeight)
      );
      const initialPosition = clampToViewport(
        Math.round(paletteRect.left + scrollX),
        Math.round(paletteRect.top + scrollY),
        desiredWidth,
        desiredHeight,
        { win, doc }
      );
      session.tooltipPosition = initialPosition;
      session.tooltipSize = { width: desiredWidth, height: desiredHeight };
    }

    sessions.set(sessionId, session);

    // Link parent/child
    if (parentSession) {
      if (!parentSession.childSessionIds) {
        parentSession.childSessionIds = new Set();
      }
      parentSession.childSessionIds.add(sessionId);
    }

    if (paletteRect) {
      openChat(session, { autoFocus: false });
    }

    hidePalette();

    wrapper.addEventListener('click', event => {
      const url = wrapper.dataset.url;
      if (url && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        win.open(url, '_blank', 'noopener');
        return;
      }
      event.preventDefault();
      openChatPageFromSession(session, event);
    });

    wrapper.addEventListener('keydown', event => {
      const url = wrapper.dataset.url;
      if (url && event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        win.open(url, '_blank', 'noopener');
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openChatPageFromSession(session, event);
      }
    });

    if (autoOpenTooltipOnHover) {
      wrapper.addEventListener('mouseenter', () => {
        openChat(session, { autoFocus: false });
      });
      wrapper.addEventListener('mouseleave', () => {
        scheduleTooltipClose(AUTO_CLOSE_DELAY_MS, session);
      });
    }

    runHypertext(session, 'initial', instructions);
  }

  // Event bindings
  const handleSelectionChange = () => {
    const sel = win.getSelection ? win.getSelection() : doc.getSelection?.();
    if (sel && !sel.isCollapsed) {
      const range = sel.getRangeAt(0).cloneRange();
      cacheSelection(range, sel.toString());
    } else if (!palettePinned) {
      hidePalette();
    }
  };

  const attemptHypertextFromSelection = () => {
    let sel = win.getSelection ? win.getSelection() : doc.getSelection?.();
    let range = sel && !sel.isCollapsed ? sel.getRangeAt(0) : null;
    let text = sel && !sel.isCollapsed ? sel.toString() : '';

    if ((!range || !sanitizeSelectionText(text)) && cachedRange) {
      range = cachedRange.cloneRange();
      text = cachedText;
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range.cloneRange());
      }
    }

    text = sanitizeSelectionText(text);
    if (!range || !text) {
      return false;
    }

    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return false;
    palette.style.left = `${Math.max(rect.left + (win.scrollX || 0) - 12, 12)}px`;
    palette.style.top = `${rect.bottom + (win.scrollY || 0) + 12}px`;
    palette.style.display = 'block';
    palettePinned = true;
    activeSelection = text;
    selectedTextEl.textContent = `“${activeSelection}”`;
    instructionInput.value = '';
    win.setTimeout(() => instructionInput.focus(), 0);
    activeRange = range.cloneRange();
    cacheSelection(range, activeSelection);
    return true;
  };

  const handleHotkeyDown = event => {
    if (!hotkey(event)) return;
    event.preventDefault();
    attemptHypertextFromSelection();
  };

  const handleEscapeKey = event => {
    if (event.key !== 'Escape') return;
    const activeController = controllerFor(activeChatSession);
    if (activeController && activeController.element.style.display !== 'none') {
      closeChat({ force: true });
      return;
    }
    if (palette.style.display === 'block') {
      hidePalette();
    }
  };

  const handleMouseDown = event => {
    if (palette.style.display === 'block' && !palette.contains(event.target)) {
      hidePalette();
    }
    controllers.forEach((controller, sessionId) => {
      const session = sessions.get(sessionId);
      if (!session) return;
      const element = controller.element;
      if (!element || element.style.display === 'none') return;
      const withinTooltip = element.contains(event.target);
      const withinAnchor = session.wrapper?.contains?.(event.target);
      if (!withinTooltip && !withinAnchor) {
        controller.scheduleClose(0);
      }
    });
  };

  const handleScroll = () => {
    controllers.forEach((controller, sessionId) => {
      const session = sessions.get(sessionId);
      if (!session) return;
      if (controller.element.style.display === 'none') return;
      controller.position(session.wrapper);
    });
  };

  const handleResize = () => {
    controllers.forEach((controller, sessionId) => {
      const session = sessions.get(sessionId);
      if (!session) return;
      if (controller.element.style.display === 'none') return;
      controller.position(session.wrapper);
    });
  };

  doc.addEventListener('selectionchange', handleSelectionChange);
  doc.addEventListener('keydown', handleHotkeyDown);
  doc.addEventListener('keydown', handleEscapeKey);
  doc.addEventListener('mousedown', handleMouseDown);
  win.addEventListener('scroll', handleScroll, true);
  win.addEventListener('resize', handleResize);

  if (typeof registerExternalTrigger === 'function') {
    registerExternalTrigger(() => {
      attemptHypertextFromSelection();
    });
  }

  generateButton.addEventListener('click', () => {
    if (!activeSelection) return;
    applyHypertext(instructionInput.value.trim());
  });

  instructionInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      generateButton.click();
    }
  });

  const destroy = () => {
    doc.removeEventListener('selectionchange', handleSelectionChange);
    doc.removeEventListener('keydown', handleHotkeyDown);
    doc.removeEventListener('keydown', handleEscapeKey);
    doc.removeEventListener('mousedown', handleMouseDown);
    win.removeEventListener('scroll', handleScroll, true);
    win.removeEventListener('resize', handleResize);
    palette.remove();
    controllers.forEach(controller => {
      controller.destroy();
    });
    controllers.clear();
    sessions.clear();
    hidePalette();
    activeChatSession = null;
  };

  return {
    applyHypertext,
    destroy,
    getSessions: () => new Map(sessions),
    getPaletteElement: () => palette,
    getTooltipElement: () => controllerFor(activeChatSession)?.element || null,
    triggerFromExternal: attemptHypertextFromSelection
  };
}

global.createTooltipController = createTooltipController;
global.createHypertextExperience = createHypertextExperience;
})(window);
