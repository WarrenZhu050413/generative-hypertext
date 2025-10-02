/** @jsxImportSource @emotion/react */
import { useState, useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import type { Card, FillInStrategy } from '@/types/card';
import { getConnectedCards } from '@/services/connectionContextService';
import { fillInFromConnections, previewFillIn } from '@/services/fillInService';

interface FillInModalProps {
  card: Card;
  allCards: Card[];
  onClose: () => void;
  onAccept: (content: string, sourceCardIds: string[], strategy: FillInStrategy, userGuidance?: string) => void;
}

export function FillInModal({ card, allCards, onClose, onAccept }: FillInModalProps) {
  const [connectedCards, setConnectedCards] = useState<Card[]>([]);
  const [strategy, setStrategy] = useState<FillInStrategy>('replace');
  const [userGuidance, setUserGuidance] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [sourceCardIds, setSourceCardIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load connected cards on mount
  useEffect(() => {
    async function loadConnected() {
      try {
        const connected = await getConnectedCards(card.id, allCards, 'both');
        setConnectedCards(connected);
        if (connected.length === 0) {
          setError('No connected cards found. Connect this card to other notes first.');
        }
      } catch (err) {
        console.error('[FillInModal] Error loading connected cards:', err);
        setError('Failed to load connected cards');
      }
    }
    loadConnected();
  }, [card.id, allCards]);

  // Auto-scroll preview as content streams in
  useEffect(() => {
    if (previewRef.current && isGenerating) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [generatedContent, isGenerating]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && generatedContent) {
        handleAccept();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generatedContent]);

  const handleGenerate = async () => {
    if (connectedCards.length === 0) {
      setError('No connected cards available');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const stream = fillInFromConnections(card, allCards, {
        strategy,
        userGuidance: userGuidance.trim() || undefined,
        signal: abortControllerRef.current.signal,
      });

      let fullContent = '';
      let finalResult = null;

      for await (const chunk of stream) {
        if (typeof chunk === 'string') {
          fullContent += chunk;
          setGeneratedContent(fullContent);
        } else {
          // This is the final result
          finalResult = chunk;
        }
      }

      // Get source card IDs from connected cards directly
      const connectedCards = await import('../services/connectionContextService').then(m =>
        m.getConnectedCards(card.id, allCards, 'both')
      );
      setSourceCardIds(connectedCards.map(c => c.id));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('[FillInModal] Generation error:', err);
        setError(err.message || 'Failed to generate content');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleAccept = () => {
    if (generatedContent) {
      onAccept(generatedContent, sourceCardIds, strategy, userGuidance.trim() || undefined);
      onClose();
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onClose();
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const strategyDescriptions = {
    replace: 'Discard existing content and generate fresh synthesis',
    append: 'Keep existing content and add new synthesis below',
    merge: 'Intelligently integrate new information with existing content',
  };

  return (
    <div css={styles.backdrop} onClick={handleCancel}>
      <div css={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div css={styles.header}>
          <h2 css={styles.title}>🔗 Fill In from Connections</h2>
          <button css={styles.closeButton} onClick={handleCancel}>
            ✕
          </button>
        </div>

        {error && (
          <div css={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* Connected Cards List */}
        <div css={styles.section}>
          <h3 css={styles.sectionTitle}>
            Connected Cards ({connectedCards.length})
          </h3>
          <div css={styles.cardsList}>
            {connectedCards.map((c) => (
              <div key={c.id} css={styles.connectedCard}>
                <div css={styles.cardTitle}>{c.metadata.title}</div>
                <div css={styles.cardMeta}>
                  {c.cardType || 'clipped'} • {c.metadata.domain}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Selector */}
        <div css={styles.section}>
          <h3 css={styles.sectionTitle}>Strategy</h3>
          <div css={styles.strategyButtons}>
            {(['replace', 'append', 'merge'] as FillInStrategy[]).map((s) => (
              <button
                key={s}
                css={[
                  styles.strategyButton,
                  strategy === s && styles.strategyButtonActive,
                ]}
                onClick={() => setStrategy(s)}
                disabled={isGenerating}
              >
                <div css={styles.strategyLabel}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </div>
                <div css={styles.strategyDesc}>{strategyDescriptions[s]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Guidance */}
        <div css={styles.section}>
          <h3 css={styles.sectionTitle}>Optional Guidance</h3>
          <textarea
            css={styles.guidanceInput}
            placeholder="e.g., &quot;Focus on practical applications&quot;, &quot;Explain like I'm a beginner&quot;"
            value={userGuidance}
            onChange={(e) => setUserGuidance(e.target.value)}
            disabled={isGenerating}
            rows={2}
          />
        </div>

        {/* Preview Pane */}
        {(isGenerating || generatedContent) && (
          <div css={styles.section}>
            <h3 css={styles.sectionTitle}>
              {isGenerating ? '⏳ Generating...' : '✅ Generated Content'}
            </h3>
            <div css={styles.preview} ref={previewRef}>
              {generatedContent ? (
                <div css={styles.previewContent}>{generatedContent}</div>
              ) : (
                <div css={styles.previewPlaceholder}>Generating...</div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div css={styles.actions}>
          {!isGenerating && !generatedContent && (
            <>
              <button
                css={styles.generateButton}
                onClick={handleGenerate}
                disabled={connectedCards.length === 0}
              >
                Generate
              </button>
              <button css={styles.cancelButton} onClick={handleCancel}>
                Cancel
              </button>
            </>
          )}
          {isGenerating && (
            <button css={styles.cancelButton} onClick={handleCancel}>
              Cancel Generation
            </button>
          )}
          {!isGenerating && generatedContent && (
            <>
              <button css={styles.acceptButton} onClick={handleAccept}>
                Accept
              </button>
              <button css={styles.regenerateButton} onClick={handleRegenerate}>
                Regenerate
              </button>
              <button css={styles.cancelButton} onClick={handleCancel}>
                Discard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `,
  modal: css`
    background: linear-gradient(135deg, #f5f0e8 0%, #fff8f0 100%);
    border: 2px solid rgba(139, 0, 0, 0.2);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 24px;
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  `,
  title: css`
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #8b0000;
  `,
  closeButton: css`
    background: none;
    border: none;
    font-size: 24px;
    color: #8b7355;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(139, 0, 0, 0.1);
      color: #8b0000;
    }
  `,
  error: css`
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.3);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 16px;
    color: #8b0000;
    font-size: 14px;
  `,
  section: css`
    margin-bottom: 20px;
  `,
  sectionTitle: css`
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #8b7355;
  `,
  cardsList: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
    padding: 12px;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(139, 115, 85, 0.2);
    border-radius: 6px;
  `,
  connectedCard: css`
    padding: 8px 12px;
    background: white;
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 4px;
  `,
  cardTitle: css`
    font-weight: 500;
    color: #8b0000;
    margin-bottom: 4px;
  `,
  cardMeta: css`
    font-size: 12px;
    color: #8b7355;
  `,
  strategyButtons: css`
    display: flex;
    gap: 12px;
  `,
  strategyButton: css`
    flex: 1;
    padding: 12px;
    background: white;
    border: 2px solid rgba(139, 115, 85, 0.2);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover:not(:disabled) {
      border-color: rgba(212, 175, 55, 0.5);
      background: rgba(212, 175, 55, 0.05);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  strategyButtonActive: css`
    border-color: #d4af37;
    background: rgba(212, 175, 55, 0.15);
  `,
  strategyLabel: css`
    font-weight: 600;
    color: #8b0000;
    margin-bottom: 4px;
  `,
  strategyDesc: css`
    font-size: 12px;
    color: #8b7355;
    line-height: 1.4;
  `,
  guidanceInput: css`
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 6px;
    background: white;
    font-family: inherit;
    font-size: 14px;
    color: #333;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: #d4af37;
    }

    &::placeholder {
      color: #999;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  preview: css`
    max-height: 300px;
    overflow-y: auto;
    padding: 16px;
    background: white;
    border: 1px solid rgba(139, 115, 85, 0.2);
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  `,
  previewContent: css`
    white-space: pre-wrap;
    word-wrap: break-word;
  `,
  previewPlaceholder: css`
    color: #999;
    font-style: italic;
  `,
  actions: css`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
  `,
  generateButton: css`
    padding: 10px 24px;
    background: linear-gradient(135deg, #8b0000 0%, #a00000 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  acceptButton: css`
    padding: 10px 24px;
    background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
    }
  `,
  regenerateButton: css`
    padding: 10px 24px;
    background: linear-gradient(135deg, #d4af37 0%, #f0c65a 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
  `,
  cancelButton: css`
    padding: 10px 24px;
    background: white;
    color: #8b7355;
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(139, 115, 85, 0.1);
      border-color: rgba(139, 115, 85, 0.5);
    }
  `,
};
