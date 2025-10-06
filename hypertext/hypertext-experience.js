(function (global) {
const BASE_STYLES = `
.hx-palette, .hx-chat-tooltip {
  font-family: "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif;
  color: #1a1a1a;
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
  background: rgba(255, 255, 255, 0.98);
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
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(139, 0, 0, 0.3);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.24);
  padding: 14px;
  width: 320px;
  max-width: min(460px, calc(100vw - 32px));
  min-width: 260px;
  min-height: 220px;
  max-height: calc(100vh - 24px);
  display: none;
  flex-direction: column;
  gap: 12px;
  z-index: 2147483000;
  opacity: 1;
  transition: opacity 0.15s ease;
  overflow: hidden;
}

.hx-chat-tooltip__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.hx-chat-tooltip.dragging .hx-chat-tooltip__header {
  cursor: grabbing;
}

.hx-chat-tooltip__title {
  margin: 0;
  font-size: 14px;
  color: #8b0000;
  font-weight: 700;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hx-chat-tooltip__header-actions {
  display: inline-flex;
  gap: 6px;
}

.hx-chat-tooltip__drag-area {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.hx-chat-tooltip__drag-icon {
  width: 16px;
  height: 12px;
  border-radius: 2px;
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(139, 0, 0, 0.6) 0,
    rgba(139, 0, 0, 0.6) 2px,
    transparent 2px,
    transparent 4px
  );
  flex-shrink: 0;
}

.hx-chat-tooltip__icon {
  border: 0;
  background: transparent;
  color: #8b0000;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s ease, color 0.2s ease;
}

.hx-chat-tooltip__icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hx-chat-tooltip__icon:not(:disabled):hover {
  background: rgba(139, 0, 0, 0.08);
}

.hx-chat-history {
  flex: 1 1 auto;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  padding: 10px 12px;
  background: rgba(245, 245, 245, 0.9);
}

.hx-chat-entry {
  margin-bottom: 10px;
}

.hx-chat-entry:last-child {
  margin-bottom: 0;
}

.hx-chat-entry__role {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #666;
}

.hx-chat-entry__text {
  margin-top: 2px;
  font-size: 13px;
  white-space: pre-wrap;
}

.hx-chat-entry__text .hx-chat-entry__paragraph {
  margin: 0 0 6px 0;
  white-space: pre-wrap;
}

.hx-chat-entry__text .hx-chat-entry__paragraph:last-child {
  margin-bottom: 0;
}

.hx-chat-entry__link {
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  font-size: 13px;
  color: #1a73e8;
  text-decoration: none;
  padding: 2px 0;
}

.hx-chat-entry__link:focus-visible {
  outline: 2px solid rgba(26, 115, 232, 0.6);
  outline-offset: 2px;
}

.hx-chat-entry__link:hover {
  text-decoration: underline;
}

.hx-chat-tooltip__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
}

.hx-chat-tooltip__resize-grip {
  width: 18px;
  height: 18px;
  border: 1px solid rgba(139, 0, 0, 0.3);
  border-radius: 4px;
  background: rgba(139, 0, 0, 0.08);
  cursor: se-resize;
  position: relative;
  flex-shrink: 0;
}

.hx-chat-tooltip__resize-grip::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(139, 0, 0, 0.6);
  border-bottom: 2px solid rgba(139, 0, 0, 0.6);
  border-radius: 0 0 2px 0;
}

.hx-chat-tooltip.resizing .hx-chat-tooltip__resize-grip {
  background: rgba(139, 0, 0, 0.18);
}

.hx-chat-tooltip__resize-grip:focus-visible {
  outline: 2px solid rgba(139, 0, 0, 0.45);
  outline-offset: 2px;
}

.hx-chat-entry.streaming .hx-chat-entry__text {
  color: #666;
  font-style: italic;
}

.hx-chat-composer {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: flex-start;
}

.hx-chat-composer textarea {
  flex: 0 1 calc(50% - 4px);
  width: calc(50% - 4px);
  max-width: calc(50% - 4px);
  min-width: 0;
  min-height: 80px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  padding: 8px;
  font-size: 13px;
  resize: vertical;
}

.hx-chat-send {
  flex: 0 0 calc(30% - 4px);
  max-width: calc(30% - 4px);
  min-width: 0;
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: #8b0000;
  color: white;
  font-size: 13px;
  cursor: pointer;
  align-self: stretch;
}

.hx-chat-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}`;

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

function buildTooltip(doc) {
  const tooltip = doc.createElement('div');
  tooltip.className = 'hx-chat-tooltip';
  tooltip.setAttribute('role', 'dialog');
  tooltip.setAttribute('aria-hidden', 'true');
  tooltip.innerHTML = `
    <header class="hx-chat-tooltip__header">
      <div class="hx-chat-tooltip__drag-area" data-role="drag-handle" title="Drag tooltip" aria-label="Drag tooltip">
        <span class="hx-chat-tooltip__drag-icon" aria-hidden="true"></span>
        <h2 class="hx-chat-tooltip__title"></h2>
      </div>
      <div class="hx-chat-tooltip__header-actions">
        <button class="hx-chat-tooltip__icon" data-action="regenerate" title="Regenerate">⟳</button>
        <button class="hx-chat-tooltip__icon" data-action="close" title="Close">×</button>
      </div>
    </header>
    <div class="hx-chat-history"></div>
    <div class="hx-chat-composer">
      <textarea data-role="input" placeholder="Add follow-up instructions..."></textarea>
      <button class="hx-chat-send" data-action="send">Send</button>
    </div>
    <div class="hx-chat-tooltip__footer">
      <span class="hx-chat-tooltip__resize-grip" data-role="resize-handle" title="Resize tooltip" aria-label="Resize tooltip" tabindex="0"></span>
    </div>
  `;
  const titleEl = tooltip.querySelector('.hx-chat-tooltip__title');
  const historyEl = tooltip.querySelector('.hx-chat-history');
  const inputEl = tooltip.querySelector('[data-role="input"]');
  const sendButton = tooltip.querySelector('[data-action="send"]');
  const closeButton = tooltip.querySelector('[data-action="close"]');
  const regenerateButton = tooltip.querySelector('[data-action="regenerate"]');
  return {
    tooltip,
    titleEl,
    historyEl,
    inputEl,
    sendButton,
    closeButton,
    regenerateButton,
    dragHandle: tooltip.querySelector('[data-role="drag-handle"]'),
    resizeHandle: tooltip.querySelector('[data-role="resize-handle"]')
  };
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
    'You are Nabokov\'s Hypertext Generator.',
    'Respond with a single JSON object that matches this schema:',
    '{',
    '  "pillText": string,',
    '  "mode": "inline" | "reference",',
    '  "explanation"?: string,',
    '  "url"?: string',
    '}',
    'Rules:',
    '1. Return JSON only. No extra commentary or Markdown fences.',
    '2. If mode is "inline", include "explanation" (plain text; use \\n for newlines).',
    '3. If mode is "reference", include "url" and add an "explanation" when helpful to summarize or contextualize the link.',
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
    registerExternalTrigger
  } = options;

  const doc = customDocument || document;
  const win = doc.defaultView || window;

  if (!doc || !doc.body) {
    throw new Error('createHypertextExperience requires a document with a body element.');
  }

  injectStyles(doc);

  const {
    palette,
    selectedTextEl,
    instructionInput,
    generateButton,
    toggleTruncationButton
  } = buildPalette(doc);
  const {
    tooltip,
    titleEl,
    historyEl,
    inputEl,
    sendButton,
    closeButton,
    regenerateButton,
    dragHandle,
    resizeHandle
  } = buildTooltip(doc);

  doc.body.appendChild(palette);
  doc.body.appendChild(tooltip);

  const sessions = new Map();
  let hyperlinkCounter = 0;
  let activeSelection = '';
  let activeRange = null;
  let activeChatSession = null;
  let palettePinned = false;
  let cachedRange = null;
  let cachedText = '';
  let tooltipCloseTimeout = null;
  let truncateContext = false;
  let dragState = null;
  let resizeState = null;

  const PILL_STATES = ['loading', 'ready-inline', 'ready-reference', 'ready-url', 'error'];
  const VIEWPORT_MARGIN = 12;
  const MIN_TOOLTIP_WIDTH = 260;
  const MAX_TOOLTIP_WIDTH = 520;
  const MIN_TOOLTIP_HEIGHT = 220;
  const MAX_TOOLTIP_HEIGHT = 640;
  const DEFAULT_TOOLTIP_WIDTH = 360;
  const DEFAULT_TOOLTIP_HEIGHT = 320;

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

  function saveTooltipGeometry(session) {
    if (!session) return;
    const width = Math.round(tooltip.offsetWidth || 0);
    const height = Math.round(tooltip.offsetHeight || 0);
    const left = Math.round(tooltip.offsetLeft || 0);
    const top = Math.round(tooltip.offsetTop || 0);
    if (width > 0 && height > 0) {
      session.tooltipSize = { width, height };
    }
    session.tooltipPosition = { left, top };
  }

  function clampToViewport(left, top, width, height) {
    const scrollX = win.scrollX || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0;
    const scrollY = win.scrollY || doc.documentElement.scrollTop || doc.body.scrollTop || 0;
    const viewportWidth = win.innerWidth;
    const viewportHeight = win.innerHeight;
    const minLeft = scrollX + VIEWPORT_MARGIN;
    const minTop = scrollY + VIEWPORT_MARGIN;
    const maxLeft = scrollX + viewportWidth - width - VIEWPORT_MARGIN;
    const maxTop = scrollY + viewportHeight - height - VIEWPORT_MARGIN;
    const clampedLeft = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));
    const clampedTop = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop));
    return { left: Math.round(clampedLeft), top: Math.round(clampedTop) };
  }

  function shouldHandlePointer(event) {
    if (typeof event.button === 'number' && event.button !== 0) {
      return event.pointerType === 'touch' || event.pointerType === 'pen';
    }
    return true;
  }

  function beginDrag(event) {
    if (!dragHandle || tooltip.style.display === 'none') return;
    if (!shouldHandlePointer(event)) return;
    cancelTooltipClose();
    tooltip.dataset.pinned = 'true';
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
    const { left, top } = clampToViewport(targetLeft, targetTop, width, height);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.dataset.pinned = 'true';
    if (activeChatSession) {
      activeChatSession.tooltipPosition = { left, top };
    }
    event.preventDefault();
  }

  function endDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (dragHandle.hasPointerCapture?.(event.pointerId)) {
      dragHandle.releasePointerCapture(event.pointerId);
    }
    tooltip.classList.remove('dragging');
    if (activeChatSession) {
      saveTooltipGeometry(activeChatSession);
    }
    dragState = null;
    event.preventDefault();
  }

  function beginResize(event) {
    if (!resizeHandle || tooltip.style.display === 'none') return;
    if (!shouldHandlePointer(event)) return;
    cancelTooltipClose();
    tooltip.dataset.pinned = 'true';
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
    const viewportMaxWidth = Math.min(MAX_TOOLTIP_WIDTH, Math.max(MIN_TOOLTIP_WIDTH, win.innerWidth - 2 * VIEWPORT_MARGIN));
    const viewportMaxHeight = Math.min(MAX_TOOLTIP_HEIGHT, Math.max(MIN_TOOLTIP_HEIGHT, win.innerHeight - 2 * VIEWPORT_MARGIN));
    const rawWidth = resizeState.startWidth + dx;
    const rawHeight = resizeState.startHeight + dy;
    const width = Math.round(Math.min(Math.max(rawWidth, MIN_TOOLTIP_WIDTH), viewportMaxWidth));
    const height = Math.round(Math.min(Math.max(rawHeight, MIN_TOOLTIP_HEIGHT), viewportMaxHeight));

    tooltip.style.width = `${width}px`;
    tooltip.style.height = `${height}px`;

    const { left, top } = clampToViewport(resizeState.startLeft, resizeState.startTop, width, height);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.dataset.pinned = 'true';

    if (activeChatSession) {
      activeChatSession.tooltipPosition = { left, top };
      activeChatSession.tooltipSize = { width, height };
    }

    event.preventDefault();
  }

  function endResize(event) {
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;
    if (resizeHandle.hasPointerCapture?.(event.pointerId)) {
      resizeHandle.releasePointerCapture(event.pointerId);
    }
    tooltip.classList.remove('resizing');
    if (activeChatSession) {
      saveTooltipGeometry(activeChatSession);
    }
    resizeState = null;
    event.preventDefault();
  }

  if (dragHandle) {
    dragHandle.addEventListener('pointerdown', beginDrag);
    dragHandle.addEventListener('pointermove', handleDragMove);
    dragHandle.addEventListener('pointerup', endDrag);
    dragHandle.addEventListener('pointercancel', endDrag);
  }

  if (resizeHandle) {
    resizeHandle.addEventListener('pointerdown', beginResize);
    resizeHandle.addEventListener('pointermove', handleResizeMove);
    resizeHandle.addEventListener('pointerup', endResize);
    resizeHandle.addEventListener('pointercancel', endResize);
  }

  function renderConversation(session) {
    if (!session) return;
    historyEl.textContent = '';
    const fragment = doc.createDocumentFragment();

    session.messages.forEach(message => {
      const entryEl = doc.createElement('div');
      entryEl.className = 'hx-chat-entry';

      const roleEl = doc.createElement('div');
      roleEl.className = 'hx-chat-entry__role';
      roleEl.textContent = message.role === 'user' ? 'User' : 'Assistant';
      entryEl.appendChild(roleEl);

      const textEl = doc.createElement('div');
      textEl.className = 'hx-chat-entry__text';

      if (message.role === 'assistant' && message.display && typeof message.display === 'object') {
        const { explanation, url, linkLabel } = message.display;
        if (explanation) {
          const paragraph = doc.createElement('p');
          paragraph.className = 'hx-chat-entry__paragraph';
          paragraph.textContent = explanation;
          textEl.appendChild(paragraph);
        }
        if (url) {
          const link = doc.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener';
          link.className = 'hx-chat-entry__link';
          link.textContent = linkLabel || url;
          link.setAttribute('role', 'link');
          link.title = url;
          textEl.appendChild(link);
        }
        if (!explanation && !url) {
          const fallback = doc.createElement('p');
          fallback.className = 'hx-chat-entry__paragraph';
          fallback.textContent = 'Generated response unavailable.';
          textEl.appendChild(fallback);
        }
      } else {
        const raw = typeof message.display === 'string' ? message.display : '(no content)';
        const paragraph = doc.createElement('p');
        paragraph.className = 'hx-chat-entry__paragraph';
        paragraph.textContent = raw;
        textEl.appendChild(paragraph);
      }

      entryEl.appendChild(textEl);
      fragment.appendChild(entryEl);
    });

    historyEl.appendChild(fragment);

    if (session.isStreaming) {
      const streamingEntry = doc.createElement('div');
      streamingEntry.className = 'hx-chat-entry streaming';

      const roleEl = doc.createElement('div');
      roleEl.className = 'hx-chat-entry__role';
      roleEl.textContent = 'Assistant';
      streamingEntry.appendChild(roleEl);

      const textEl = doc.createElement('div');
      textEl.className = 'hx-chat-entry__text';
      const paragraph = doc.createElement('p');
      paragraph.className = 'hx-chat-entry__paragraph';
      paragraph.textContent = 'Generating…';
      textEl.appendChild(paragraph);
      streamingEntry.appendChild(textEl);

      historyEl.appendChild(streamingEntry);
    }

    titleEl.textContent = `${session.subject} · Hypertext`;
    inputEl.value = session.draft || '';
    sendButton.disabled = session.isStreaming;
    regenerateButton.disabled = session.isStreaming || !session.lastResult;
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  function positionTooltip(anchor, { force = false } = {}) {
    if (!anchor || tooltip.style.display === 'none') return;
    if (!force && tooltip.dataset.pinned === 'true') return;

    const rect = anchor.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return;

    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = win.innerWidth;
    const viewportHeight = win.innerHeight;
    const scrollX = win.scrollX || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0;
    const scrollY = win.scrollY || doc.documentElement.scrollTop || doc.body.scrollTop || 0;

    const tooltipWidth = tooltipRect.width || tooltip.offsetWidth || 320;
    const tooltipHeight = tooltipRect.height || tooltip.offsetHeight || 240;

    let left = rect.left + scrollX;
    let top = rect.bottom + scrollY + 10;

    if (left + tooltipWidth > scrollX + viewportWidth - VIEWPORT_MARGIN) {
      left = scrollX + viewportWidth - tooltipWidth - VIEWPORT_MARGIN;
    }
    if (left < scrollX + VIEWPORT_MARGIN) {
      left = scrollX + VIEWPORT_MARGIN;
    }

    if (top + tooltipHeight > scrollY + viewportHeight - VIEWPORT_MARGIN) {
      top = rect.top + scrollY - tooltipHeight - 10;
    }
    if (top < scrollY + VIEWPORT_MARGIN) {
      top = scrollY + VIEWPORT_MARGIN;
    }

    left = Math.round(left);
    top = Math.round(top);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.dataset.pinned = 'false';

    if (activeChatSession) {
      activeChatSession.tooltipPosition = { left, top };
    }
  }

  function showTooltip(session) {
    if (!session) return;
    cancelTooltipClose();
    tooltip.dataset.sessionId = session.id;
    tooltip.style.display = 'flex';
    tooltip.style.opacity = '0';
    tooltip.setAttribute('aria-hidden', 'false');
    tooltip.classList.remove('dragging', 'resizing');

    if (session.tooltipSize && session.tooltipSize.width) {
      tooltip.style.width = `${session.tooltipSize.width}px`;
    } else {
      tooltip.style.width = '';
    }

    if (session.tooltipSize && session.tooltipSize.height) {
      tooltip.style.height = `${session.tooltipSize.height}px`;
    } else {
      tooltip.style.height = '';
    }

    if (session.tooltipPosition) {
      const { left, top } = session.tooltipPosition;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.dataset.pinned = 'true';
    } else {
      tooltip.style.left = '0px';
      tooltip.style.top = '0px';
      tooltip.dataset.pinned = 'false';
    }

    win.requestAnimationFrame(() => {
      if (tooltip.dataset.pinned === 'true') {
        const width = tooltip.offsetWidth || MIN_TOOLTIP_WIDTH;
        const height = tooltip.offsetHeight || MIN_TOOLTIP_HEIGHT;
        const desiredLeft = session.tooltipPosition?.left ?? tooltip.offsetLeft;
        const desiredTop = session.tooltipPosition?.top ?? tooltip.offsetTop;
        const clamped = clampToViewport(desiredLeft, desiredTop, width, height);
        tooltip.style.left = `${clamped.left}px`;
        tooltip.style.top = `${clamped.top}px`;
        session.tooltipPosition = clamped;
      } else {
        positionTooltip(session.wrapper, { force: true });
      }
      tooltip.style.opacity = '1';
    });
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
    tooltip.style.opacity = '';
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.classList.remove('dragging', 'resizing');
    delete tooltip.dataset.sessionId;
  }

  function cancelTooltipClose() {
    if (tooltipCloseTimeout) {
      win.clearTimeout(tooltipCloseTimeout);
      tooltipCloseTimeout = null;
    }
  }

  function scheduleTooltipClose(delay = 150) {
    cancelTooltipClose();
    tooltipCloseTimeout = win.setTimeout(() => {
      tooltipCloseTimeout = null;
      const hoverAnchor = activeChatSession && activeChatSession.wrapper && activeChatSession.wrapper.matches(':hover');
      const hoverTooltip = tooltip.matches(':hover');
      if (!hoverAnchor && !hoverTooltip && !tooltip.classList.contains('dragging') && !tooltip.classList.contains('resizing')) {
        closeChat();
      }
    }, delay);
  }

  function openChat(session, { autoFocus = true } = {}) {
    if (!session) return;
    if (activeChatSession && activeChatSession !== session) {
      activeChatSession.wrapper?.setAttribute('aria-expanded', 'false');
    }
    activeChatSession = session;
    session.wrapper?.setAttribute('aria-expanded', 'true');
    renderConversation(session);
    showTooltip(session);
    if (autoFocus) {
      inputEl.focus();
    }
  }

  function closeChat() {
    if (!activeChatSession && tooltip.style.display === 'none') return;
    cancelTooltipClose();
    if (activeChatSession?.wrapper) {
      activeChatSession.wrapper.setAttribute('aria-expanded', 'false');
    }
    activeChatSession = null;
    hideTooltip();
  }

  async function runHypertext(session, mode, instructions) {
    if (session.isStreaming) return;
    session.isStreaming = true;
    if (activeChatSession === session) {
      renderConversation(session);
      positionTooltip(session.wrapper);
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
          renderConversation(session);
          positionTooltip(session.wrapper);
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
        renderConversation(session);
        positionTooltip(session.wrapper);
      }
      return;
    }

    if (mode !== 'regenerate') {
      session.lastUserMessage = userContent;
      session.messages.push({ role: 'user', content: userContent, display: userDisplay });
      requestMessages.push({ role: 'user', content: userContent });
    }

    if (activeChatSession === session) {
      renderConversation(session);
      positionTooltip(session.wrapper);
    }

    try {
      const result = await streamHypertext(requestMessages);
      const assistantDisplay = formatAssistantDisplay(result);
      session.messages.push({ role: 'assistant', content: JSON.stringify(result), display: assistantDisplay });
      updateWrapperWithResult(session, result);
    } catch (error) {
      const message = error.message || 'Failed to generate hypertext.';
      session.messages.push({ role: 'assistant', content: message, display: `Error: ${message}` });
      setPillState(session, 'error', message);
    } finally {
      session.isStreaming = false;
      if (activeChatSession === session) {
        renderConversation(session);
        positionTooltip(session.wrapper);
      }
    }
  }

  function applyHypertext(instructions) {
    if (!activeRange || !activeSelection) return;
    if (selectionValidator && !selectionValidator(activeRange, activeSelection)) {
      return;
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
      tooltipPosition: null,
      tooltipSize: null
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
        desiredHeight
      );
      session.tooltipPosition = initialPosition;
      session.tooltipSize = { width: desiredWidth, height: desiredHeight };
    }

    sessions.set(sessionId, session);

    if (paletteRect) {
      openChat(session, { autoFocus: false });
    }

    hidePalette();

    wrapper.addEventListener('click', event => {
      const url = wrapper.dataset.url;
      if (session.isStreaming) {
        event.preventDefault();
        openChat(session, { autoFocus: false });
        return;
      }
      if (url && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        win.open(url, '_blank', 'noopener');
        return;
      }
      event.preventDefault();
      openChat(session);
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
        if (session.isStreaming) {
          openChat(session, { autoFocus: false });
        } else {
          openChat(session);
        }
      }
    });

    if (autoOpenTooltipOnHover) {
      wrapper.addEventListener('mouseenter', () => {
        openChat(session, { autoFocus: false });
      });
      wrapper.addEventListener('mouseleave', () => {
        scheduleTooltipClose();
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
    if (tooltip.style.display !== 'none') {
      closeChat();
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
    if (tooltip.style.display !== 'none') {
      const withinTooltip = tooltip.contains(event.target);
      const withinAnchor = activeChatSession && activeChatSession.wrapper && activeChatSession.wrapper.contains(event.target);
      if (!withinTooltip && !withinAnchor) {
        scheduleTooltipClose(0);
      }
    }
  };

  const handleScroll = () => {
    if (activeChatSession && tooltip.style.display !== 'none') {
      positionTooltip(activeChatSession.wrapper);
    }
  };

  const handleResize = () => {
    if (activeChatSession && tooltip.style.display !== 'none') {
      positionTooltip(activeChatSession.wrapper);
    }
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

  closeButton.addEventListener('click', () => {
    closeChat();
  });

  tooltip.addEventListener('mouseenter', () => {
    cancelTooltipClose();
  });

  tooltip.addEventListener('mouseleave', () => {
    scheduleTooltipClose();
  });

  sendButton.addEventListener('click', () => {
    if (!activeChatSession) return;
    const text = inputEl.value.trim();
    if (!text) return;
    activeChatSession.draft = '';
    runHypertext(activeChatSession, 'append', text);
  });

  regenerateButton.addEventListener('click', () => {
    if (!activeChatSession) return;
    runHypertext(activeChatSession, 'regenerate');
  });

  inputEl.addEventListener('input', () => {
    if (!activeChatSession) return;
    activeChatSession.draft = inputEl.value;
  });

  inputEl.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      sendButton.click();
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
    tooltip.remove();
    sessions.clear();
    hidePalette();
    hideTooltip();
  };

  return {
    applyHypertext,
    destroy,
    getSessions: () => new Map(sessions),
    getPaletteElement: () => palette,
    getTooltipElement: () => tooltip,
    triggerFromExternal: attemptHypertextFromSelection
  };
}

global.createHypertextExperience = createHypertextExperience;
})(window);
