import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Card } from '@/types/card';
import DOMPurify from 'isomorphic-dompurify';
import { windowManager } from '@/services/windowManager';
import { saveCard } from '@/utils/storage';
import { ContextInputModal } from '@/components/ContextInputModal';
import { Toast, ToastType } from '@/components/Toast';
import { cardGenerationService } from '@/services/cardGenerationService';
import { beautificationService } from '@/services/beautificationService';
import { DEFAULT_BUTTONS } from '@/config/defaultButtons';
import type { CardButton } from '@/types/button';
import type { SizePreset } from '@/utils/cardSizes';
import { SIZE_LABELS } from '@/utils/cardSizes';
import type { BeautificationMode } from '@/types/card';

interface CardNodeProps {
  data: {
    card: Card;
  };
}

export const CardNode = memo(({ data }: CardNodeProps) => {
  const card = data?.card;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showContextModal, setShowContextModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState<CardButton | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showBeautifyMenu, setShowBeautifyMenu] = useState(false);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const contentEditRef = useRef<HTMLTextAreaElement>(null);
  const titleEditRef = useRef<HTMLInputElement>(null);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!card) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Sanitize HTML content (if exists - image cards may not have content)
  // Use beautified content if available, otherwise use original content
  const contentToDisplay = card.beautifiedContent || card.content;
  const sanitizedContent = contentToDisplay
    ? DOMPurify.sanitize(contentToDisplay, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'article', 'section', 'header', 'footer', 'nav', 'aside',
          'blockquote', 'pre', 'code'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'id'],
      })
    : '';

  // Extract plain text for preview
  const getTextPreview = () => {
    if (!sanitizedContent) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return truncateText(text, 200);
  };

  const handleOpenWindow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node drag
    windowManager.openWindow(card);
  };

  const handleToggleCollapse = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node drag

    try {
      const updatedCard: Card = {
        ...card,
        collapsed: !card.collapsed,
        updatedAt: Date.now(),
      };

      await saveCard(updatedCard);

      // Dispatch event to refresh cards
      window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    } catch (error) {
      console.error('[CardNode] Error toggling collapse:', error);
    }
  };

  const handleSizeChange = async (size: SizePreset) => {
    try {
      const updatedCard: Card = {
        ...card,
        sizePreset: size,
        updatedAt: Date.now(),
      };

      await saveCard(updatedCard);
      setShowSizeMenu(false);

      // Dispatch event to refresh cards
      window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    } catch (error) {
      console.error('[CardNode] Error changing size:', error);
    }
  };

  const handleBeautify = async (mode: BeautificationMode) => {
    try {
      setShowBeautifyMenu(false);
      setIsBeautifying(true);

      setToast({
        message: `Beautifying content (${mode === 'recreate-design' ? 'Recreate Design' : 'Organize Content'})...`,
        type: 'loading',
      });

      await beautificationService.beautifyCard(card.id, mode);

      setToast({
        message: 'Content beautified! ✨',
        type: 'success',
      });

      setTimeout(() => {
        setToast(null);
      }, 3000);
    } catch (error) {
      console.error('[CardNode] Error beautifying card:', error);
      setToast({
        message: `Failed to beautify: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });

      setTimeout(() => {
        setToast(null);
      }, 5000);
    } finally {
      setIsBeautifying(false);
    }
  };

  const handleRevertBeautification = async () => {
    try {
      setShowBeautifyMenu(false);
      setIsBeautifying(true);

      setToast({
        message: 'Reverting to original content...',
        type: 'loading',
      });

      await beautificationService.revertBeautification(card.id);

      setToast({
        message: 'Reverted to original content',
        type: 'success',
      });

      setTimeout(() => {
        setToast(null);
      }, 3000);
    } catch (error) {
      console.error('[CardNode] Error reverting beautification:', error);
      setToast({
        message: `Failed to revert: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });

      setTimeout(() => {
        setToast(null);
      }, 5000);
    } finally {
      setIsBeautifying(false);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Extract plain text from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    setEditContent(plainText);
    setEditTitle(card.metadata.title);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Convert plain text to HTML with paragraphs
      const htmlContent = editContent
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      const updatedCard: Card = {
        ...card,
        content: htmlContent,
        metadata: {
          ...card.metadata,
          title: editTitle,
        },
        updatedAt: Date.now(),
      };

      await saveCard(updatedCard);
      setIsEditing(false);

      // Dispatch event to refresh cards
      window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    } catch (error) {
      console.error('[CardNode] Error saving edits:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveEdit();
    }
  };

  // Focus content editor when entering edit mode
  useEffect(() => {
    if (isEditing && contentEditRef.current) {
      contentEditRef.current.focus();
      contentEditRef.current.select();
    }
  }, [isEditing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, []);

  const handleButtonClick = (button: CardButton) => {
    setSelectedButton(button);
    setShowContextModal(true);
  };

  const handleContextSubmit = async (context: string) => {
    if (!selectedButton) return;

    // Close modal first
    setShowContextModal(false);
    setSelectedButton(null);

    // Show loading toast
    setToast({
      message: `Generating "${selectedButton.label}" card...`,
      type: 'loading',
    });

    // Set timeout for generation (15 seconds)
    generationTimeoutRef.current = setTimeout(() => {
      setToast({
        message: 'Card generation is taking longer than expected. Please wait...',
        type: 'info',
      });
    }, 15000);

    try {
      // Generate new card from button action
      await cardGenerationService.generateCardFromButton(card, selectedButton, context);

      // Clear timeout
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }

      // Show success toast
      setToast({
        message: 'Card generated successfully! ✨',
        type: 'success',
      });

      // Auto-close success toast after 3 seconds
      setTimeout(() => {
        setToast(null);
      }, 3000);

      // Dispatch event to refresh cards
      window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
    } catch (error) {
      console.error('[CardNode] Error generating card:', error);

      // Clear timeout
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }

      // Show error toast
      setToast({
        message: `Failed to generate card: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });

      // Auto-close error toast after 5 seconds
      setTimeout(() => {
        setToast(null);
      }, 5000);
    }
  };

  const handleContextCancel = () => {
    setShowContextModal(false);
    setSelectedButton(null);
  };

  if (isEditing) {
    return (
      <div style={styles.card} onKeyDown={handleKeyDown}>
        {/* Edit Mode Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {card.metadata.favicon && (
              <span style={styles.favicon}>
                {card.metadata.favicon}
              </span>
            )}
            <div style={{
              ...styles.domain,
              ...(card.cardType === 'note' ? styles.noteDomain : {}),
            }}>
              {card.metadata.domain}
            </div>
          </div>
          <div style={styles.editButtons}>
            <button
              onClick={handleSaveEdit}
              style={styles.saveButton}
              title="Save (Cmd+Enter)"
            >
              ✓
            </button>
            <button
              onClick={handleCancelEdit}
              style={styles.cancelButton}
              title="Cancel (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Editable Title */}
        <input
          ref={titleEditRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          style={styles.titleEdit}
          placeholder="Card title..."
        />

        {/* Editable Content */}
        <textarea
          ref={contentEditRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          style={styles.contentEdit}
          placeholder="Card content..."
          onWheel={(e) => {
            // Prevent scroll from bubbling to canvas
            const target = e.currentTarget;
            const canScrollDown = target.scrollTop < target.scrollHeight - target.clientHeight;
            const canScrollUp = target.scrollTop > 0;
            const isScrollingDown = e.deltaY > 0;
            const isScrollingUp = e.deltaY < 0;

            if ((isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp)) {
              e.stopPropagation();
            }
          }}
        />

        {/* Footer with hints */}
        <div style={styles.editFooter}>
          <div style={styles.editHint}>Cmd+Enter to save, Esc to cancel</div>
        </div>

        {/* Handles for connections */}
        <Handle
          type="source"
          position={Position.Right}
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.card,
        ...(card.collapsed ? styles.cardCollapsed : {}),
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {card.metadata.favicon && (
            <span style={styles.favicon}>
              {card.metadata.favicon}
            </span>
          )}
          <div style={{
            ...styles.domain,
            ...(card.cardType === 'note' ? styles.noteDomain : {}),
          }}>
            {card.metadata.domain}
          </div>
        </div>
        <div style={styles.headerRight}>
          {/* Beautification control (only for non-image cards with content) */}
          {card.cardType !== 'image' && card.content && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBeautifyMenu(!showBeautifyMenu);
                }}
                style={{
                  ...styles.beautifyButton,
                  ...(card.beautifiedContent ? styles.beautifyButtonActive : {})
                }}
                title={card.beautifiedContent ? 'Beautified (click to change)' : 'Beautify content with AI'}
                data-testid="beautify-btn"
                disabled={isBeautifying}
              >
                ✨
              </button>
              {showBeautifyMenu && (
                <div style={styles.beautifyMenu} data-testid="beautify-menu">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBeautify('recreate-design');
                    }}
                    style={styles.beautifyMenuItem}
                    data-testid="beautify-recreate-design"
                  >
                    <span style={styles.beautifyMenuLabel}>🎨 Recreate Design</span>
                    <span style={styles.beautifyMenuDesc}>Match visual appearance</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBeautify('organize-content');
                    }}
                    style={styles.beautifyMenuItem}
                    data-testid="beautify-organize-content"
                  >
                    <span style={styles.beautifyMenuLabel}>📋 Organize Content</span>
                    <span style={styles.beautifyMenuDesc}>Structure information</span>
                  </button>
                  {card.beautifiedContent && (
                    <>
                      <div style={styles.beautifyMenuDivider} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevertBeautification();
                        }}
                        style={styles.beautifyMenuItemRevert}
                        data-testid="beautify-revert"
                      >
                        <span style={styles.beautifyMenuLabel}>↩️ Revert</span>
                        <span style={styles.beautifyMenuDesc}>Restore original</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Size control */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSizeMenu(!showSizeMenu);
              }}
              style={styles.sizeButton}
              title={`Size: ${card.sizePreset || 'M'}`}
              data-testid="size-btn"
            >
              {card.sizePreset || 'M'}
            </button>
            {showSizeMenu && (
              <div style={styles.sizeMenu} data-testid="size-menu">
                {(['S', 'M', 'L', 'XL'] as SizePreset[]).map(size => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSizeChange(size);
                    }}
                    style={{
                      ...styles.sizeMenuItem,
                      ...(card.sizePreset === size || (!card.sizePreset && size === 'M') ? styles.sizeMenuItemActive : {}),
                    }}
                    data-testid={`size-option-${size}`}
                  >
                    <span style={styles.sizeMenuLabel}>{size}</span>
                    <span style={styles.sizeMenuDesc}>{SIZE_LABELS[size]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleToggleCollapse}
            style={styles.collapseButton}
            title={card.collapsed ? 'Expand card' : 'Collapse card'}
            data-testid="collapse-btn"
          >
            {card.collapsed ? '▼' : '▲'}
          </button>
          <button
            onClick={handleOpenWindow}
            style={styles.openWindowButton}
            title="Open as floating window"
            data-testid="open-window-btn"
          >
            🗖
          </button>
          {card.starred && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4AF37">
              <path d="M8 1L10.163 5.382L15 6.089L11.5 9.494L12.326 14.305L8 12.032L3.674 14.305L4.5 9.494L1 6.089L5.837 5.382L8 1Z" />
            </svg>
          )}
        </div>
      </div>

      {/* Title - Always shown, but styled differently when collapsed */}
      <div style={{
        ...styles.title,
        ...(card.collapsed ? styles.titleCollapsed : {}),
      }}>
        {truncateText(card.metadata.title, 80)}
      </div>

      {/* Content - Only shown when not collapsed */}
      {!card.collapsed && (
        <>
          {/* Image Card: Display Image */}
          {card.cardType === 'image' && card.imageData ? (
            <div style={styles.imageContainer}>
              <img
                src={card.imageData}
                alt={card.metadata.title}
                style={styles.image}
              />
            </div>
          ) : (
            /* Content Preview for non-image cards */
            <div
              className="card-content-scrollable"
              style={styles.content}
              onWheel={(e) => {
                // Prevent scroll from bubbling to canvas (which would zoom)
                // Only if there's actual scrollable content
                const target = e.currentTarget;
                const canScrollDown = target.scrollTop < target.scrollHeight - target.clientHeight;
                const canScrollUp = target.scrollTop > 0;
                const isScrollingDown = e.deltaY > 0;
                const isScrollingUp = e.deltaY < 0;

                if ((isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp)) {
                  e.stopPropagation();
                }
              }}
            >
              {/* If beautified, render HTML; otherwise show text preview */}
              {card.beautifiedContent ? (
                <div
                  style={styles.contentHTML}
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              ) : (
                <div style={styles.contentText}>{getTextPreview()}</div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.timestamp}>{formatDate(card.createdAt)}</div>
            {card.tags && card.tags.length > 0 && (
              <div style={styles.tags}>
                {card.tags.slice(0, 3).map((tag: string, i: number) => (
                  <span key={i} style={styles.tag}>
                    {tag}
                  </span>
                ))}
                {card.tags.length > 3 && (
                  <span style={styles.tag}>+{card.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>

          {/* Continue Chat Button for Generated Cards */}
          {card.cardType === 'generated' && (
            <div style={styles.continueChatContainer}>
              <button
                onClick={handleOpenWindow}
                style={styles.continueChatButton}
                title="Continue chatting with this card"
                data-testid="continue-chat-btn"
              >
                💬 Continue Chat
              </button>
            </div>
          )}

          {/* Action Buttons (only for non-image and non-generated cards) */}
          {card.cardType !== 'image' && card.cardType !== 'generated' && (
            <div style={styles.actionButtons}>
              {DEFAULT_BUTTONS.filter(btn => btn.enabled).map(button => (
                <button
                  key={button.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleButtonClick(button);
                  }}
                  style={styles.actionButton}
                  title={button.label}
                  data-testid={`action-btn-${button.id}`}
                >
                  {button.icon}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Context Input Modal */}
      {showContextModal && selectedButton && (
        <ContextInputModal
          buttonLabel={selectedButton.label}
          buttonIcon={selectedButton.icon}
          onSubmit={handleContextSubmit}
          onCancel={handleContextCancel}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === 'loading' ? 0 : 0} // Don't auto-close loading, handle manually
        />
      )}

      {/* Handles for connections (hidden but needed for React Flow) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
});

CardNode.displayName = 'CardNode';

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(250, 247, 242, 0.98) 0%, rgba(242, 235, 225, 0.98) 100%)',
    borderRadius: '12px',
    boxShadow: `
      0 2px 8px rgba(92, 77, 66, 0.08),
      0 8px 24px rgba(92, 77, 66, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.5)
    `,
    border: '1px solid rgba(184, 156, 130, 0.2)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    cursor: 'move',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  cardCollapsed: {
    height: 'auto',
    minHeight: '56px',
    padding: '12px 16px',
    gap: '0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(184, 156, 130, 0.15)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  favicon: {
    width: '16px',
    height: '16px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  domain: {
    fontSize: '12px',
    color: '#8B7355',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  title: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#3E3226',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  titleCollapsed: {
    fontSize: '13px',
    WebkitLineClamp: 1,
    marginTop: '4px',
  },
  content: {
    flex: 1,
    minHeight: '100px',
    maxHeight: '300px', // Increased from 140px for better readability
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '8px', // Space for scrollbar
    // Custom scrollbar styling
    scrollbarWidth: 'thin', // Firefox
    scrollbarColor: 'rgba(139, 0, 0, 0.3) transparent', // Firefox
  },
  contentText: {
    fontSize: '13px',
    color: '#5C4D42',
    lineHeight: '1.5',
    // Remove line clamp to show full content with scrolling
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  contentHTML: {
    fontSize: '13px',
    color: '#5C4D42',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    // Let the beautified HTML control its own styling
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '6px',
    borderTop: '1px solid rgba(184, 156, 130, 0.15)',
    marginTop: 'auto',
  },
  timestamp: {
    fontSize: '11px',
    color: '#A89684',
    fontWeight: 500,
  },
  tags: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    background: 'rgba(212, 175, 55, 0.15)',
    color: '#8B7355',
    fontWeight: 500,
    border: '1px solid rgba(212, 175, 55, 0.3)',
  },
  openWindowButton: {
    width: '20px',
    height: '20px',
    padding: '0',
    border: 'none',
    background: 'rgba(139, 0, 0, 0.1)',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    transition: 'all 0.2s ease',
  },
  collapseButton: {
    width: '20px',
    height: '20px',
    padding: '0',
    border: 'none',
    background: 'rgba(212, 175, 55, 0.15)',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#8B7355',
    transition: 'all 0.2s ease',
  },
  noteDomain: {
    fontWeight: 600,
    color: '#8B0000',
  },
  editButtons: {
    display: 'flex',
    gap: '4px',
  },
  saveButton: {
    width: '24px',
    height: '24px',
    padding: '0',
    border: 'none',
    background: 'rgba(0, 128, 0, 0.1)',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#008000',
    transition: 'all 0.2s ease',
  },
  cancelButton: {
    width: '24px',
    height: '24px',
    padding: '0',
    border: 'none',
    background: 'rgba(139, 0, 0, 0.1)',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#8B0000',
    transition: 'all 0.2s ease',
  },
  titleEdit: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#3E3226',
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '4px',
    padding: '8px',
    outline: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  contentEdit: {
    flex: 1,
    fontSize: '13px',
    color: '#5C4D42',
    lineHeight: '1.5',
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '4px',
    padding: '8px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  editFooter: {
    paddingTop: '8px',
    borderTop: '1px solid rgba(184, 156, 130, 0.15)',
    marginTop: 'auto',
  },
  editHint: {
    fontSize: '10px',
    color: '#A89684',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButtons: {
    display: 'flex',
    gap: '4px',
    paddingTop: '6px',
    borderTop: '1px solid rgba(184, 156, 130, 0.15)',
    marginTop: '4px',
    justifyContent: 'center',
  },
  actionButton: {
    width: '28px',
    height: '28px',
    padding: '0',
    border: '1px solid rgba(139, 0, 0, 0.2)',
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), white)',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '8px',
    background: 'rgba(0, 0, 0, 0.02)',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  continueChatContainer: {
    paddingTop: '6px',
    borderTop: '1px solid rgba(184, 156, 130, 0.15)',
    marginTop: '4px',
    display: 'flex',
    justifyContent: 'center',
  },
  continueChatButton: {
    padding: '4px 12px',
    background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
    color: '#3E3226',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  sizeButton: {
    width: '24px',
    height: '20px',
    padding: '0',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 600,
    color: '#5C4D42',
    transition: 'all 0.2s ease',
  },
  sizeMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    background: 'white',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    minWidth: '140px',
    overflow: 'hidden',
  },
  sizeMenuItem: {
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  sizeMenuItemActive: {
    background: 'rgba(212, 175, 55, 0.1)',
  },
  sizeMenuLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#3E3226',
  },
  sizeMenuDesc: {
    fontSize: '11px',
    color: '#8B7355',
  },
  beautifyButton: {
    width: '24px',
    height: '20px',
    padding: '0',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    transition: 'all 0.2s ease',
  },
  beautifyButtonActive: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(212, 175, 55, 0.15))',
    border: '1px solid rgba(212, 175, 55, 0.5)',
  },
  beautifyMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    background: 'white',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    minWidth: '200px',
    overflow: 'hidden',
  },
  beautifyMenuItem: {
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  beautifyMenuItemRevert: {
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    background: 'rgba(139, 0, 0, 0.05)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  beautifyMenuLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#3E3226',
  },
  beautifyMenuDesc: {
    fontSize: '10px',
    color: '#8B7355',
    fontWeight: 400,
  },
  beautifyMenuDivider: {
    height: '1px',
    background: 'rgba(184, 156, 130, 0.2)',
    margin: '4px 0',
  },
};