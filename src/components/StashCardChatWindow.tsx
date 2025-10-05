import React from 'react';
import type { Card } from '@/types/card';

export interface StashCardChatWindowProps {
  card: Card;
  onClose: () => void;
  onSaveToCanvas: (card: Card) => Promise<void>;
  onSaveToStash: (card: Card) => Promise<void>;
}

/**
 * Minimal placeholder for stash chat window.
 * This stub keeps legacy side-panel integrations compiling without reintroducing
 * the heavier chat stack that existed in a later revision.
 */
export const StashCardChatWindow: React.FC<StashCardChatWindowProps> = ({ onClose }) => {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: '1px solid rgba(139, 0, 0, 0.25)',
        borderRadius: 8,
        background: 'rgba(139, 0, 0, 0.08)',
        color: '#3E3226',
      }}
    >
      <strong>Chat unavailable in this build.</strong>
      <p style={{ marginTop: 8, fontSize: 12 }}>
        The full stash chat experience was introduced in a later revision. You can still
        review saved cards here; close this panel to continue.
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: 8,
          padding: '6px 12px',
          border: '1px solid rgba(139, 0, 0, 0.35)',
          background: 'rgba(255, 255, 255, 0.85)',
          color: '#8B0000',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </div>
  );
};
