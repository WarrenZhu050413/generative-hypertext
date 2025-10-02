/** @jsxImportSource @emotion/react */
/**
 * ElementSelector Component for Nabokov Web Clipper
 *
 * A React component that injects into the page as Shadow DOM to enable
 * visual selection of web page elements for clipping.
 *
 * Features:
 * - Visual overlay highlighting hoverable elements
 * - Chinese aesthetic styling (red/gold borders)
 * - Element info tooltip (tag name, classes, dimensions)
 * - Data storage to chrome.storage.local
 * - Keyboard shortcuts (ESC to deactivate)
 * - FloatingChat integration (placeholder for now)
 */

import { useState, useEffect, useCallback } from 'react';
import { css } from '@emotion/react';
import { CHINESE_AESTHETIC_COLORS } from '../utils/shadowDOM';
import { sanitizeHTML, extractRelevantStyles, generateSelector } from '../utils/sanitization';
import { saveCard, generateId } from '../utils/storage';
import type { Card } from '@/types';

/**
 * Props for ElementSelector component
 */
export interface ElementSelectorProps {
  /** Callback fired when an element is successfully captured */
  onCapture?: (card: Card) => void;
  /** Callback fired when selector is closed/deactivated */
  onClose?: () => void;
}

/**
 * Type alias for React.FC to satisfy TypeScript
 */
type FC<P = {}> = (props: P) => JSX.Element | null;

/**
 * Element information for tooltip display
 */
interface ElementInfo {
  tagName: string;
  classes: string[];
  dimensions: { width: number; height: number };
  position: { x: number; y: number };
}

/**
 * ElementSelector Component
 *
 * Provides visual element selection with overlay, tooltip, and capture functionality.
 */
export const ElementSelector: FC<ElementSelectorProps> = ({
  onCapture,
  onClose,
}) => {
  // State management
  const [isActive, setIsActive] = useState(true);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [elementInfo, setElementInfo] = useState<ElementInfo | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [capturedCard, setCapturedCard] = useState<Card | null>(null);
  const [stashImmediately, setStashImmediately] = useState(false);

  // Refs (unused, reserved for future use)
  // const overlayRef = useRef<HTMLDivElement>(null);

  /**
   * Deactivates the selector and cleans up
   */
  const deactivate = useCallback(() => {
    setIsActive(false);
    setHoveredElement(null);
    setElementInfo(null);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  /**
   * Handles keyboard shortcuts
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        deactivate();
      }
    },
    [deactivate]
  );

  /**
   * Handles mouse move over elements
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Don't highlight if we're capturing or showing chat
    if (isCapturing || showFloatingChat) {
      return;
    }

    // Get element at cursor position
    const target = e.target as HTMLElement;

    // Ignore elements that are part of our overlay
    if (target.closest('[data-nabokov-overlay]')) {
      return;
    }

    // Ignore script, style, and other non-visual elements
    const ignoredTags = ['SCRIPT', 'STYLE', 'LINK', 'META', 'HEAD'];
    if (ignoredTags.includes(target.tagName)) {
      return;
    }

    setHoveredElement(target);

    // Update element info for tooltip
    const rect = target.getBoundingClientRect();
    const classes = Array.from(target.classList);

    setElementInfo({
      tagName: target.tagName.toLowerCase(),
      classes,
      dimensions: {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      position: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  }, [isCapturing, showFloatingChat]);

  /**
   * Handles element click for capture
   */
  const handleClick = useCallback(
    async (e: MouseEvent) => {
      // Prevent default action
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;

      // Ignore clicks on our overlay
      if (target.closest('[data-nabokov-overlay]')) {
        return;
      }

      // Set selected element
      setSelectedElement(target);
      setIsCapturing(true);

      try {
        // Generate unique ID for card
        const cardId = generateId();

        // Capture element data
        console.log('[ElementSelector] Capturing element:', target);

        // 1. Sanitize HTML content
        const htmlContent = sanitizeHTML(target.outerHTML);

        // 2. Extract relevant styles
        const styles = extractRelevantStyles(target);

        // 3. Generate CSS selector
        const selector = generateSelector(target);

        // 4. Get surrounding context (parent element snippet)
        const context = target.parentElement
          ? sanitizeHTML(target.parentElement.outerHTML)
          : undefined;

        // 5. Get element metadata
        const rect = target.getBoundingClientRect();
        const classes = Array.from(target.classList);
        const textContent = target.textContent || '';

        // 6. Create card in unified Card format
        const card: Card = {
          id: cardId,
          content: htmlContent,
          metadata: {
            url: window.location.href,
            title: document.title,
            domain: new URL(window.location.href).hostname,
            timestamp: Date.now(),
            tagName: target.tagName.toLowerCase(),
            selector,
            textContent: textContent,
            dimensions: {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          },
          starred: false,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          conversation: [],
          // Additional fields for rendering
          styles,
          context,
          // Stash immediately if checkbox is checked
          stashed: stashImmediately,
        };

        // 7. Save to storage
        console.log('[ElementSelector] Saving card...');

        // Save card to chrome.storage.local
        await saveCard(card);

        console.log('[ElementSelector] Capture successful!', {
          cardId,
        });

        // 8. Show floating chat at element position
        setCapturedCard(card);
        setShowFloatingChat(true);

        // 9. Fire callback
        if (onCapture) {
          onCapture(card);
        }

        // 10. Auto-close after 2 seconds
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 2000);

      } catch (error) {
        console.error('[ElementSelector] Error capturing element:', error);
        alert('Failed to capture element. Please try again.');
      } finally {
        setIsCapturing(false);
      }
    },
    [onCapture]
  );

  /**
   * Set up event listeners
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Add keyboard listener
    window.addEventListener('keydown', handleKeyDown, true);

    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove, true);

    // Add click listener
    window.addEventListener('click', handleClick, true);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('click', handleClick, true);
    };
  }, [isActive, handleKeyDown, handleMouseMove, handleClick]);

  /**
   * Don't render anything if not active
   */
  if (!isActive) {
    return null;
  }

  return (
    <div data-nabokov-overlay css={overlayContainerStyles}>
      {/* Overlay highlight for hovered element */}
      {hoveredElement && !showFloatingChat && (
        <ElementHighlight element={hoveredElement} />
      )}

      {/* Tooltip showing element info */}
      {elementInfo && !showFloatingChat && (
        <ElementTooltip info={elementInfo} />
      )}

      {/* Loading indicator during capture */}
      {isCapturing && (
        <div css={loadingOverlayStyles}>
          <div css={loadingSpinnerStyles}>
            <div css={spinnerDotStyles} />
            <div css={spinnerDotStyles} />
            <div css={spinnerDotStyles} />
          </div>
          <p css={loadingTextStyles}>Capturing element...</p>
        </div>
      )}

      {/* Floating chat component (placeholder) */}
      {showFloatingChat && capturedCard && selectedElement && (
        <FloatingChatPlaceholder
          card={capturedCard}
          element={selectedElement}
          onClose={() => {
            setShowFloatingChat(false);
            deactivate();
          }}
        />
      )}

      {/* Instructions overlay */}
      {!showFloatingChat && (
        <div css={instructionsStyles}>
          <p>Hover over elements to inspect • Click to capture • Press ESC to cancel</p>
          <label css={checkboxLabelStyles}>
            <input
              type="checkbox"
              checked={stashImmediately}
              onChange={(e) => setStashImmediately(e.target.checked)}
              css={checkboxInputStyles}
            />
            <span css={checkboxTextStyles}>📥 Stash immediately (skip canvas)</span>
          </label>
        </div>
      )}
    </div>
  );
};

/**
 * ElementHighlight - Draws a border around the hovered element
 */
const ElementHighlight: FC<{ element: HTMLElement }> = ({ element }) => {
  const rect = element.getBoundingClientRect();

  return (
    <div
      css={highlightStyles}
      style={{
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    />
  );
};

/**
 * ElementTooltip - Shows element information near cursor
 */
const ElementTooltip: FC<{ info: ElementInfo }> = ({ info }) => {
  const { tagName, classes, dimensions, position } = info;

  // Position tooltip above and to the right of cursor
  const tooltipX = position.x + 15;
  const tooltipY = position.y - 60;

  return (
    <div
      css={tooltipStyles}
      style={{
        top: `${tooltipY}px`,
        left: `${tooltipX}px`,
      }}
    >
      <div css={tooltipRowStyles}>
        <strong>{tagName}</strong>
        {classes.length > 0 && (
          <span css={tooltipClassesStyles}>
            .{classes.join('.')}
          </span>
        )}
      </div>
      <div css={tooltipRowStyles}>
        <span css={tooltipDimStyles}>
          {dimensions.width} × {dimensions.height}px
        </span>
      </div>
    </div>
  );
};

/**
 * FloatingChatPlaceholder - Placeholder for FloatingChat component
 * TODO: Replace with actual FloatingChat component
 */
const FloatingChatPlaceholder: FC<{
  card: Card;
  element: HTMLElement;
  onClose: () => void;
}> = ({ card, element, onClose }) => {
  const rect = element.getBoundingClientRect();

  return (
    <div
      css={floatingChatStyles}
      style={{
        top: `${rect.bottom + window.scrollY + 10}px`,
        left: `${rect.left + window.scrollX}px`,
      }}
    >
      <div css={chatHeaderStyles}>
        <h3>Element Captured!</h3>
        <button onClick={onClose} css={chatCloseButtonStyles}>
          ×
        </button>
      </div>
      <div css={chatContentStyles}>
        <p>
          <strong>Tag:</strong> {card.metadata.tagName}
        </p>
        <p>
          <strong>Dimensions:</strong> {card.metadata.dimensions?.width} ×{' '}
          {card.metadata.dimensions?.height}px
        </p>
        <p>
          <strong>Text length:</strong> {card.metadata.textContent?.length} characters
        </p>
        <p css={successTextStyles}>
          Saved to your collection!
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// Emotion CSS Styles with Chinese Aesthetic
// =============================================================================

const overlayContainerStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
`;

const highlightStyles = css`
  position: absolute;
  pointer-events: none;
  border: 3px solid ${CHINESE_AESTHETIC_COLORS.cinnabar};
  box-shadow:
    0 0 0 1px ${CHINESE_AESTHETIC_COLORS.gold},
    0 4px 16px rgba(194, 59, 34, 0.3);
  background-color: rgba(194, 59, 34, 0.05);
  transition: all 150ms ease-in-out;
  z-index: 999998;
  border-radius: 2px;
`;

const tooltipStyles = css`
  position: absolute;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    ${CHINESE_AESTHETIC_COLORS.ink} 0%,
    ${CHINESE_AESTHETIC_COLORS.indigo} 100%
  );
  color: ${CHINESE_AESTHETIC_COLORS.rice};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 0 1px ${CHINESE_AESTHETIC_COLORS.gold};
  z-index: 999999;
  min-width: 120px;
  border: 1px solid ${CHINESE_AESTHETIC_COLORS.gold};
  backdrop-filter: blur(8px);
`;

const tooltipRowStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: ${CHINESE_AESTHETIC_COLORS.gold};
    font-weight: 600;
  }
`;

const tooltipClassesStyles = css`
  font-size: 11px;
  opacity: 0.9;
  color: ${CHINESE_AESTHETIC_COLORS.lotus};
  font-family: 'Courier New', monospace;
`;

const tooltipDimStyles = css`
  font-size: 11px;
  opacity: 0.8;
  color: ${CHINESE_AESTHETIC_COLORS.bamboo};
`;

const instructionsStyles = css`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    135deg,
    ${CHINESE_AESTHETIC_COLORS.indigo} 0%,
    ${CHINESE_AESTHETIC_COLORS.azurite} 100%
  );
  color: ${CHINESE_AESTHETIC_COLORS.rice};
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 0 0 2px ${CHINESE_AESTHETIC_COLORS.gold};
  z-index: 999999;
  pointer-events: auto;
  border: 1px solid ${CHINESE_AESTHETIC_COLORS.gold};
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;

  p {
    margin: 0;
    font-weight: 500;
  }
`;

const checkboxLabelStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const checkboxInputStyles = css`
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: ${CHINESE_AESTHETIC_COLORS.gold};
`;

const checkboxTextStyles = css`
  font-size: 13px;
  font-weight: 500;
  color: ${CHINESE_AESTHETIC_COLORS.rice};
  user-select: none;
`;

const loadingOverlayStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(44, 62, 80, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 1000000;
  pointer-events: auto;
`;

const loadingSpinnerStyles = css`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const spinnerDotStyles = css`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${CHINESE_AESTHETIC_COLORS.gold};
  animation: bounce 1.4s infinite ease-in-out;

  &:nth-of-type(1) {
    animation-delay: -0.32s;
  }

  &:nth-of-type(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const loadingTextStyles = css`
  color: ${CHINESE_AESTHETIC_COLORS.rice};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const floatingChatStyles = css`
  position: absolute;
  background: ${CHINESE_AESTHETIC_COLORS.silk};
  border: 2px solid ${CHINESE_AESTHETIC_COLORS.gold};
  border-radius: 8px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px ${CHINESE_AESTHETIC_COLORS.cinnabar};
  z-index: 1000001;
  pointer-events: auto;
  min-width: 320px;
  max-width: 400px;
  backdrop-filter: blur(8px);
`;

const chatHeaderStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(
    135deg,
    ${CHINESE_AESTHETIC_COLORS.indigo} 0%,
    ${CHINESE_AESTHETIC_COLORS.azurite} 100%
  );
  border-bottom: 1px solid ${CHINESE_AESTHETIC_COLORS.gold};
  border-radius: 6px 6px 0 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${CHINESE_AESTHETIC_COLORS.rice};
  }
`;

const chatCloseButtonStyles = css`
  background: transparent;
  border: none;
  color: ${CHINESE_AESTHETIC_COLORS.rice};
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-in-out;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const chatContentStyles = css`
  padding: 16px;

  p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: ${CHINESE_AESTHETIC_COLORS.ink};
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: ${CHINESE_AESTHETIC_COLORS.indigo};
      font-weight: 600;
    }
  }
`;

const successTextStyles = css`
  margin-top: 12px !important;
  padding-top: 12px;
  border-top: 1px solid ${CHINESE_AESTHETIC_COLORS.bamboo};
  color: ${CHINESE_AESTHETIC_COLORS.verdigris} !important;
  font-weight: 600 !important;
  font-size: 13px !important;
`;

export default ElementSelector;