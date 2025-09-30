/**
 * Keyboard Shortcuts Help Overlay
 *
 * Shows a modal with all available keyboard shortcuts, grouped by category.
 * Features Chinese aesthetic styling and platform-specific shortcut display.
 */

import React, { useEffect } from 'react';
import {
  KeyboardShortcut,
  formatShortcut,
  getModifierKey,
  ShortcutCategory,
} from '@/utils/keyboardShortcuts';

interface KeyboardHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  navigation: 'Navigation',
  canvas: 'Canvas',
  filters: 'Filters',
  view: 'View Controls',
};

const CATEGORY_ORDER: ShortcutCategory[] = ['navigation', 'view', 'filters', 'canvas'];

export function KeyboardHelp({ shortcuts, isOpen, onClose }: KeyboardHelpProps) {
  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = CATEGORY_ORDER.reduce(
    (acc, category) => {
      acc[category] = shortcuts.filter(
        (s) => s.category === category && s.enabled !== false
      );
      return acc;
    },
    {} as Record<ShortcutCategory, KeyboardShortcut[]>
  );

  const platformModifier = getModifierKey();

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick} role="presentation">
      <div
        style={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-help-title"
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 id="keyboard-help-title" style={styles.title}>
            Keyboard Shortcuts
          </h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Close help"
            title="Close (Esc)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Platform indicator */}
        <div style={styles.platformInfo}>
          <span style={styles.platformLabel}>Platform:</span>
          <span style={styles.platformValue}>{platformModifier} key</span>
        </div>

        {/* Shortcuts by category */}
        <div style={styles.content}>
          {CATEGORY_ORDER.map((category) => {
            const categoryShortcuts = groupedShortcuts[category];
            if (!categoryShortcuts || categoryShortcuts.length === 0) return null;

            return (
              <div key={category} style={styles.category}>
                <h3 style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</h3>
                <div style={styles.shortcutList}>
                  {categoryShortcuts.map((shortcut) => (
                    <div key={shortcut.id} style={styles.shortcutItem}>
                      <span style={styles.description}>{shortcut.description}</span>
                      <kbd style={styles.kbd}>
                        {formatShortcut(shortcut.key, shortcut.modifier)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerText}>
            Press <kbd style={styles.inlineKbd}>?</kbd> to show this help anytime
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(62, 50, 38, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    background: 'linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 100%)',
    borderRadius: '16px',
    boxShadow: `
      0 10px 40px rgba(92, 77, 66, 0.2),
      0 0 0 1px rgba(184, 156, 130, 0.3)
    `,
    width: '90%',
    maxWidth: '720px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    borderBottom: '2px solid rgba(184, 156, 130, 0.2)',
    background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%)',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: '#3E3226',
    letterSpacing: '-0.5px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#8B7355',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  platformInfo: {
    padding: '16px 32px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    background: 'rgba(212, 175, 55, 0.08)',
    borderBottom: '1px solid rgba(184, 156, 130, 0.15)',
  },
  platformLabel: {
    fontSize: '14px',
    color: '#8B7355',
    fontWeight: 500,
  },
  platformValue: {
    fontSize: '14px',
    color: '#3E3226',
    fontWeight: 600,
    padding: '2px 8px',
    background: 'rgba(212, 175, 55, 0.15)',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.3)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px 32px',
  },
  category: {
    marginBottom: '32px',
  },
  categoryTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 700,
    color: '#5C4D42',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    paddingBottom: '8px',
    borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
  },
  shortcutList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  shortcutItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    border: '1px solid rgba(184, 156, 130, 0.2)',
    transition: 'all 0.2s',
  },
  description: {
    fontSize: '15px',
    color: '#3E3226',
    fontWeight: 500,
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    fontSize: '14px',
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 600,
    color: '#5C4D42',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F0E8 100%)',
    border: '2px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(92, 77, 66, 0.1)',
    minWidth: '60px',
    justifyContent: 'center',
  },
  footer: {
    padding: '16px 32px',
    borderTop: '2px solid rgba(184, 156, 130, 0.2)',
    background: 'rgba(212, 175, 55, 0.05)',
  },
  footerText: {
    fontSize: '14px',
    color: '#8B7355',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  inlineKbd: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    fontSize: '13px',
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 600,
    color: '#5C4D42',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '4px',
  },
};