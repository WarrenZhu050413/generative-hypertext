/** @jsxImportSource @emotion/react */
import React, { useRef, useEffect } from 'react';
import type { Card } from '@/types/card';

interface OverflowMenuProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onBeautify: (e?: React.MouseEvent) => void | Promise<void>;
  onFillIn: (e?: React.MouseEvent) => void | Promise<void>;
  onOpenWindow: (e?: React.MouseEvent) => void | Promise<void>;
  onStash: (e?: React.MouseEvent) => void | Promise<void>;
  onToggleStar: (e?: React.MouseEvent) => void | Promise<void>;
  onButtonSettings: (e?: React.MouseEvent) => void | Promise<void>;
  connectionCount: number;
  position?: { top: number; right: number };
}

export const OverflowMenu: React.FC<OverflowMenuProps> = ({
  card,
  isOpen,
  onClose,
  onBeautify,
  onFillIn,
  onOpenWindow,
  onStash,
  onToggleStar,
  onButtonSettings,
  connectionCount,
  position = { top: 40, right: 12 },
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add slight delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: position.top,
        right: position.right,
        background: 'white',
        border: '1px solid rgba(184, 156, 130, 0.3)',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '6px 0',
        minWidth: '200px',
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
      data-testid="overflow-menu"
    >
      {/* Beautify - only for non-image cards with content */}
      {card.cardType !== 'image' && card.content && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBeautify();
            onClose();
          }}
          style={styles.menuItem}
          data-testid="overflow-beautify"
        >
          <span style={styles.menuIcon}>✨</span>
          <span style={styles.menuText}>Beautify Content</span>
          {card.beautifiedContent && (
            <span style={styles.menuBadge}>✓</span>
          )}
        </button>
      )}

      {/* Fill-In - only if connections exist */}
      {connectionCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFillIn();
            onClose();
          }}
          style={styles.menuItem}
          data-testid="overflow-fill-in"
        >
          <span style={styles.menuIcon}>🔗</span>
          <span style={styles.menuText}>
            Fill-In ({connectionCount} connection{connectionCount !== 1 ? 's' : ''})
          </span>
        </button>
      )}

      {/* Open Window */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenWindow();
          onClose();
        }}
        style={styles.menuItem}
        data-testid="overflow-open-window"
      >
        <span style={styles.menuIcon}>🗖</span>
        <span style={styles.menuText}>Open as Window</span>
      </button>

      <div style={styles.divider} />

      {/* Stash */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStash();
          onClose();
        }}
        style={styles.menuItem}
        data-testid="overflow-stash"
      >
        <span style={styles.menuIcon}>📥</span>
        <span style={styles.menuText}>Stash to Side Panel</span>
      </button>

      {/* Toggle Star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar();
          onClose();
        }}
        style={styles.menuItem}
        data-testid="overflow-toggle-star"
      >
        <span style={styles.menuIcon}>{card.starred ? '⭐' : '☆'}</span>
        <span style={styles.menuText}>{card.starred ? 'Unstar' : 'Star'}</span>
      </button>

      <div style={styles.divider} />

      {/* Button Settings */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onButtonSettings();
          onClose();
        }}
        style={styles.menuItem}
        data-testid="overflow-button-settings"
      >
        <span style={styles.menuIcon}>⚙️</span>
        <span style={styles.menuText}>Button Settings</span>
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  menuItem: {
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#3E3226',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  menuIcon: {
    fontSize: '14px',
    width: '16px',
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuBadge: {
    fontSize: '11px',
    color: '#D4AF37',
    fontWeight: 600,
  },
  divider: {
    height: '1px',
    background: 'rgba(184, 156, 130, 0.2)',
    margin: '4px 0',
  },
};
