/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useState, useEffect, useRef } from 'react';
import type { GenerationType } from '@/services/childCardGenerator';

export interface GenerateChildModalProps {
  selectedText: string;
  generationType: GenerationType;
  streamingContent: string;
  isGenerating: boolean;
  onTypeChange: (type: GenerationType) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  onAccept: () => void;
  onCancel: () => void;
}

/**
 * Modal for generating child cards from selected text
 * Shows streaming LLM output in real-time
 */
export const GenerateChildModal: React.FC<GenerateChildModalProps> = ({
  selectedText,
  generationType,
  streamingContent,
  isGenerating,
  onTypeChange,
  onGenerate,
  onRegenerate,
  onAccept,
  onCancel,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (previewRef.current && isGenerating) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [streamingContent, isGenerating]);

  // Track if content has been generated
  useEffect(() => {
    if (streamingContent && !isGenerating) {
      setHasGenerated(true);
    }
  }, [streamingContent, isGenerating]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && hasGenerated && !isGenerating) {
        onAccept();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasGenerated, isGenerating, onCancel, onAccept]);

  const generationTypes: { value: GenerationType; label: string; icon: string }[] = [
    { value: 'explanation', label: 'Explanation', icon: '📝' },
    { value: 'definition', label: 'Definition', icon: '📖' },
    { value: 'deep-dive', label: 'Deep Dive', icon: '🔍' },
    { value: 'examples', label: 'Examples', icon: '💡' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        css={backdropStyles}
        onClick={hasGenerated && !isGenerating ? onAccept : undefined}
        data-testid="modal-backdrop"
      />

      {/* Modal */}
      <div css={modalStyles} data-testid="generate-child-modal">
        {/* Header */}
        <div css={headerStyles}>
          <h3 css={titleStyles}>✨ Generate Child Card</h3>
          <button
            onClick={onCancel}
            css={closeButtonStyles}
            title="Close (Esc)"
            data-testid="close-btn"
          >
            ✕
          </button>
        </div>

        {/* Selected Text Preview */}
        <div css={sectionStyles}>
          <div css={labelStyles}>Selected Text:</div>
          <div css={selectedTextStyles} data-testid="selected-text">
            "{selectedText}"
          </div>
        </div>

        {/* Generation Type Selector */}
        <div css={sectionStyles}>
          <div css={labelStyles}>Generation Type:</div>
          <div css={typeSelectorStyles}>
            {generationTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => onTypeChange(type.value)}
                css={[
                  typeButtonStyles,
                  generationType === type.value && typeButtonActiveStyles,
                ]}
                disabled={isGenerating}
                data-testid={`type-${type.value}`}
              >
                <span css={typeIconStyles}>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Streaming Preview Pane */}
        <div css={sectionStyles}>
          <div css={labelStyles}>
            {isGenerating ? 'Generating...' : hasGenerated ? 'Generated Content:' : 'Preview:'}
          </div>
          <div
            ref={previewRef}
            css={previewPaneStyles}
            data-testid="preview-pane"
          >
            {streamingContent ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: streamingContent.replace(/\n/g, '<br>'),
                }}
              />
            ) : (
              <div css={placeholderStyles}>
                Click "Generate" to create content...
              </div>
            )}
            {isGenerating && (
              <span css={cursorStyles}>█</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div css={actionsStyles}>
          <button
            onClick={onCancel}
            css={cancelButtonStyles}
            data-testid="cancel-btn"
          >
            Cancel
          </button>

          {hasGenerated && !isGenerating && (
            <button
              onClick={onRegenerate}
              css={regenerateButtonStyles}
              data-testid="regenerate-btn"
            >
              🔄 Regenerate
            </button>
          )}

          {!hasGenerated && !isGenerating ? (
            <button
              onClick={onGenerate}
              css={generateButtonStyles}
              data-testid="generate-btn"
            >
              ✨ Generate
            </button>
          ) : hasGenerated && !isGenerating ? (
            <button
              onClick={onAccept}
              css={acceptButtonStyles}
              data-testid="accept-btn"
            >
              ✓ Accept
            </button>
          ) : null}
        </div>

        {/* Hints */}
        <div css={hintsStyles}>
          {isGenerating ? (
            <span>Streaming response...</span>
          ) : hasGenerated ? (
            <span>Press Enter to accept, Esc to cancel</span>
          ) : (
            <span>Select a generation type and click Generate</span>
          )}
        </div>
      </div>
    </>
  );
};

// Styles
const backdropStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9998;
`;

const modalStyles = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(250, 247, 242, 0.98) 0%, rgba(242, 235, 225, 0.98) 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(92, 77, 66, 0.2);
  border: 1px solid rgba(184, 156, 130, 0.3);
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 9999;
  font-family: system-ui, -apple-system, sans-serif;
`;

const headerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(212, 175, 55, 0.3);
`;

const titleStyles = css`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #3E3226;
`;

const closeButtonStyles = css`
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(139, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: #8B0000;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 0, 0, 0.2);
  }
`;

const sectionStyles = css`
  margin-bottom: 16px;
`;

const labelStyles = css`
  font-size: 13px;
  font-weight: 600;
  color: #5C4D42;
  margin-bottom: 8px;
`;

const selectedTextStyles = css`
  padding: 12px;
  background: rgba(255, 215, 0, 0.1);
  border-left: 3px solid #FFD700;
  border-radius: 4px;
  font-size: 14px;
  color: #3E3226;
  line-height: 1.5;
  font-style: italic;
`;

const typeSelectorStyles = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const typeButtonStyles = css`
  padding: 10px 12px;
  border: 1px solid rgba(184, 156, 130, 0.3);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #5C4D42;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    background: rgba(255, 215, 0, 0.05);
    border-color: rgba(212, 175, 55, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const typeButtonActiveStyles = css`
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(212, 175, 55, 0.15));
  border-color: #D4AF37;
  color: #3E3226;
  font-weight: 600;
`;

const typeIconStyles = css`
  font-size: 16px;
`;

const previewPaneStyles = css`
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: white;
  border: 1px solid rgba(184, 156, 130, 0.3);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #3E3226;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 0, 0, 0.3);
    border-radius: 4px;
  }
`;

const placeholderStyles = css`
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 40px 20px;
`;

const cursorStyles = css`
  display: inline-block;
  animation: blink 1s infinite;
  color: #8B0000;

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const actionsStyles = css`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(184, 156, 130, 0.2);
`;

const baseButtonStyles = css`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const cancelButtonStyles = css`
  ${baseButtonStyles}
  background: rgba(0, 0, 0, 0.05);
  color: #666;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const regenerateButtonStyles = css`
  ${baseButtonStyles}
  background: rgba(212, 175, 55, 0.15);
  color: #8B7355;
  border: 1px solid rgba(212, 175, 55, 0.3);

  &:hover:not(:disabled) {
    background: rgba(212, 175, 55, 0.25);
    border-color: #D4AF37;
  }
`;

const generateButtonStyles = css`
  ${baseButtonStyles}
  background: linear-gradient(135deg, #D4AF37, #FFD700);
  color: #3E3226;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
  }
`;

const acceptButtonStyles = css`
  ${baseButtonStyles}
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
  }
`;

const hintsStyles = css`
  margin-top: 12px;
  text-align: center;
  font-size: 11px;
  color: #A89684;
  font-style: italic;
`;
