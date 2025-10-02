/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useState, useRef, useEffect } from 'react';

export interface ContextInputModalProps {
  buttonLabel: string;
  buttonIcon: string;
  onSubmit: (context: string) => void;
  onCancel: () => void;
}

export const ContextInputModal: React.FC<ContextInputModalProps> = ({
  buttonLabel,
  buttonIcon,
  onSubmit,
  onCancel,
}) => {
  const [context, setContext] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Add small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    onSubmit(context.trim());
  };

  const handleSkip = () => {
    onSubmit(''); // Empty = use default prompt
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div css={overlayStyles} onClick={onCancel} data-testid="context-modal">
      <div css={modalStyles} onClick={e => e.stopPropagation()}>
        <h3 css={titleStyles}>
          {buttonIcon} {buttonLabel}
        </h3>
        <p css={descStyles}>
          Add optional context to refine your request:
        </p>
        <input
          ref={inputRef}
          type="text"
          value={context}
          onChange={e => setContext(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 'the historical context', 'technical details'"
          css={inputStyles}
          data-testid="context-input"
        />
        <div css={buttonRowStyles}>
          <button onClick={handleSkip} css={skipButtonStyles} data-testid="skip-btn">
            Skip
          </button>
          <button onClick={handleSubmit} css={submitButtonStyles} data-testid="submit-btn">
            Generate →
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
const overlayStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const modalStyles = css`
  background: linear-gradient(135deg, rgba(250, 247, 242, 1) 0%, rgba(242, 235, 225, 1) 100%);
  border: 2px solid #FFD700;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const titleStyles = css`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #8B0000;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const descStyles = css`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #5C4D42;
  line-height: 1.5;
`;

const inputStyles = css`
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 2px solid rgba(139, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #3E3226;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FFD700;
  }

  &::placeholder {
    color: #A89684;
  }
`;

const buttonRowStyles = css`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
`;

const skipButtonStyles = css`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(139, 0, 0, 0.3);
  border-radius: 6px;
  background: white;
  color: #8B0000;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 0, 0, 0.05);
    border-color: #8B0000;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const submitButtonStyles = css`
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #8B0000, #CD5C5C);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;
