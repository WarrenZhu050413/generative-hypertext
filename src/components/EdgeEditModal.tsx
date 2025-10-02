/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useState } from 'react';
import type { ConnectionType } from '@/types/connection';

/**
 * Props for EdgeEditModal component
 */
export interface EdgeEditModalProps {
  initialType?: ConnectionType;
  initialLabel?: string;
  onSubmit: (type: ConnectionType, label: string) => void;
  onCancel: () => void;
}

/**
 * Modal for editing edge/connection properties
 * Allows user to set connection type and custom label
 */
export const EdgeEditModal: React.FC<EdgeEditModalProps> = ({
  initialType = 'related',
  initialLabel = '',
  onSubmit,
  onCancel,
}) => {
  const [connectionType, setConnectionType] = useState<ConnectionType>(initialType);
  const [label, setLabel] = useState(initialLabel);

  const handleSubmit = () => {
    onSubmit(connectionType, label);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const connectionTypes: { value: ConnectionType; label: string; icon: string; description: string }[] = [
    { value: 'related', label: 'Related', icon: '🔗', description: 'General connection' },
    { value: 'generated-from', label: 'Generated From', icon: '⚡', description: 'AI-generated card' },
    { value: 'references', label: 'References', icon: '📖', description: 'Cites or refers to' },
    { value: 'contradicts', label: 'Contradicts', icon: '⚠️', description: 'Conflicts with' },
    { value: 'custom', label: 'Custom', icon: '✨', description: 'Custom relationship' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        css={overlayStyles}
        onClick={onCancel}
        data-testid="edge-modal-overlay"
      />

      {/* Modal */}
      <div css={modalStyles} data-testid="edge-edit-modal">
        <div css={headerStyles}>
          <h3 css={titleStyles}>Connection Properties</h3>
        </div>

        <div css={contentStyles}>
          {/* Connection Type */}
          <div css={sectionStyles}>
            <label css={labelStyles}>Connection Type</label>
            <div css={typeGridStyles}>
              {connectionTypes.map(type => (
                <label
                  key={type.value}
                  css={typeOptionStyles(connectionType === type.value)}
                  data-testid={`type-option-${type.value}`}
                >
                  <input
                    type="radio"
                    name="connectionType"
                    value={type.value}
                    checked={connectionType === type.value}
                    onChange={() => setConnectionType(type.value)}
                    css={radioInputStyles}
                  />
                  <div css={typeContentStyles}>
                    <span css={typeIconStyles}>{type.icon}</span>
                    <span css={typeLabelStyles}>{type.label}</span>
                    <span css={typeDescStyles}>{type.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Label */}
          <div css={sectionStyles}>
            <label css={labelStyles} htmlFor="edge-label">
              Custom Label (Optional)
            </label>
            <input
              id="edge-label"
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 'supports', 'builds upon', 'example of'"
              css={inputStyles}
              data-testid="edge-label-input"
            />
            <div css={hintStyles}>
              Press Enter to save, Esc to cancel
            </div>
          </div>
        </div>

        <div css={footerStyles}>
          <button
            onClick={onCancel}
            css={cancelButtonStyles}
            data-testid="edge-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            css={submitButtonStyles}
            data-testid="edge-submit-btn"
          >
            Create Connection
          </button>
        </div>
      </div>
    </>
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
  z-index: 10001;
  backdrop-filter: blur(4px);
`;

const modalStyles = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 10002;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
`;

const headerStyles = css`
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 100%);
`;

const titleStyles = css`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #3E3226;
`;

const contentStyles = css`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const sectionStyles = css`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const labelStyles = css`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #5C4D42;
  margin-bottom: 10px;
`;

const typeGridStyles = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
`;

const typeOptionStyles = (selected: boolean) => css`
  position: relative;
  display: block;
  padding: 12px;
  border: 2px solid ${selected ? '#D4AF37' : 'rgba(184, 156, 130, 0.3)'};
  border-radius: 8px;
  background: ${selected ? 'rgba(212, 175, 55, 0.1)' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.6);
    background: rgba(212, 175, 55, 0.05);
  }
`;

const radioInputStyles = css`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const typeContentStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const typeIconStyles = css`
  font-size: 24px;
  margin-bottom: 4px;
`;

const typeLabelStyles = css`
  font-size: 13px;
  font-weight: 600;
  color: #3E3226;
`;

const typeDescStyles = css`
  font-size: 11px;
  color: #8B7355;
  text-align: center;
`;

const inputStyles = css`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(184, 156, 130, 0.3);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #D4AF37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }

  &::placeholder {
    color: #A89684;
  }
`;

const hintStyles = css`
  margin-top: 6px;
  font-size: 12px;
  color: #A89684;
  font-style: italic;
`;

const footerStyles = css`
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #FAF7F2;
`;

const cancelButtonStyles = css`
  padding: 10px 20px;
  background: white;
  color: #5C4D42;
  border: 1px solid rgba(184, 156, 130, 0.3);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(184, 156, 130, 0.1);
    border-color: rgba(184, 156, 130, 0.5);
  }
`;

const submitButtonStyles = css`
  padding: 10px 20px;
  background: linear-gradient(135deg, #D4AF37, #FFD700);
  color: #3E3226;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;
