import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Card } from '@/types/card';
import DOMPurify from 'isomorphic-dompurify';

interface CardNodeProps {
  data: {
    card: Card;
  };
}

export const CardNode = memo(({ data }: CardNodeProps) => {
  const card = data?.card;

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

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {card.metadata.favicon && (
            <img
              src={card.metadata.favicon}
              alt=""
              style={styles.favicon}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div style={styles.domain}>{card.metadata.domain}</div>
        </div>
        <div style={styles.headerRight}>
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
};