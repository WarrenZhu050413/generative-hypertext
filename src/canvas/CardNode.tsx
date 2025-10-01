import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Card } from '@/types/card';
import DOMPurify from 'isomorphic-dompurify';
import { windowManager } from '@/services/windowManager';
import { saveCard } from '@/utils/storage';

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
  const contentEditRef = useRef<HTMLTextAreaElement>(null);
  const titleEditRef = useRef<HTMLInputElement>(null);

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

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(card.content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  // Extract plain text for preview
  const getTextPreview = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return truncateText(text, 200);
  };

  const handleOpenWindow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node drag
    windowManager.openWindow(card);
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

      // Reload to show updated content
      window.location.reload();
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
    <div style={styles.card} onDoubleClick={handleDoubleClick}>
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

      {/* Title */}
      <div style={styles.title}>{truncateText(card.metadata.title, 80)}</div>

      {/* Content Preview */}
      <div style={styles.content}>
        <div style={styles.contentText}>{getTextPreview()}</div>
      </div>

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
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    cursor: 'move',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
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
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  contentText: {
    fontSize: '13px',
    color: '#5C4D42',
    lineHeight: '1.5',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 6,
    WebkitBoxOrient: 'vertical',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
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
};