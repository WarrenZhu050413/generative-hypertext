/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useRef, useEffect } from 'react';
import type { Message, ImageAttachment } from '@/shared/types/chat';

/**
 * Props for BaseChatUI component
 */
export interface BaseChatUIProps {
  /** Array of chat messages */
  messages: Message[];
  /** Current input value */
  currentInput: string;
  /** Whether a response is currently streaming */
  isStreaming: boolean;
  /** Current streaming content (if streaming) */
  streamingContent?: string;
  /** Pending images to attach to next message */
  pendingImages?: ImageAttachment[];
  /** Callback when user sends a message */
  onSendMessage: () => void;
  /** Callback when input value changes */
  onInputChange: (value: string) => void;
  /** Callback to stop streaming */
  onStopStreaming: () => void;
  /** Callback to clear all messages */
  onClearChat: () => void;
  /** Callback to remove a pending image */
  onRemoveImage?: (index: number) => void;
  /** Placeholder text for input field */
  placeholder?: string;
  /** Whether to show save conversation controls */
  showSaveControls?: boolean;
  /** Callback to save conversation */
  onSaveConversation?: () => void;
  /** Whether auto-save on close is enabled */
  autoSaveOnClose?: boolean;
  /** Callback when auto-save toggle changes */
  onToggleAutoSave?: (enabled: boolean) => void;
}

/**
 * Base Chat UI Component
 * Shared chat interface used across all chat contexts
 * (Floating Windows, Inline Chat, Side Panel)
 */
export const BaseChatUI: React.FC<BaseChatUIProps> = ({
  messages,
  currentInput,
  isStreaming,
  streamingContent,
  pendingImages = [],
  onSendMessage,
  onInputChange,
  onStopStreaming,
  onClearChat,
  onRemoveImage,
  placeholder = "Ask a question...",
  showSaveControls = false,
  onSaveConversation,
  autoSaveOnClose = false,
  onToggleAutoSave
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!currentInput.trim() && pendingImages.length === 0) || isStreaming) return;
    onSendMessage();
  };

  return (
    <div css={containerStyles}>
      {/* Messages Container */}
      <div css={messagesContainerStyles}>
        {messages.length === 0 ? (
          <div css={emptyStateStyles}>
            {placeholder}
          </div>
        ) : (
          messages.map((msg: Message) => (
            <div
              key={msg.id}
              css={messageStyles(msg.role)}
            >
              {/* Display attached images */}
              {msg.images && msg.images.length > 0 && (
                <div css={messageImagesStyles}>
                  {msg.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.dataURL}
                      css={messageImageStyles}
                      alt={`Attached image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              <div css={messageContentStyles}>
                <div
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              </div>
              {msg.streaming && (
                <span css={streamingIndicatorStyles}>▸</span>
              )}
            </div>
          ))
        )}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <div css={messageStyles('assistant')}>
            <div css={messageContentStyles}>
              {streamingContent}
              <span css={cursorStyles}>▊</span>
            </div>
          </div>
        )}

        {/* Loading indicator when streaming starts */}
        {isStreaming && !streamingContent && (
          <div css={messageStyles('assistant')}>
            <div css={loadingDotsStyles}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pending Images Preview */}
      {pendingImages.length > 0 && (
        <div css={imagePreviewContainerStyles}>
          {pendingImages.map((img, idx) => (
            <div key={idx} css={imagePreviewStyles}>
              <img src={img.dataURL} css={thumbnailStyles} alt={`Pending image ${idx + 1}`} />
              {onRemoveImage && (
                <button
                  onClick={() => onRemoveImage(idx)}
                  css={removeImageButtonStyles}
                  title="Remove image"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Save and Auto-Save Controls */}
      {showSaveControls && (
        <div css={controlsBarStyles}>
          <button
            onClick={onSaveConversation}
            css={saveButtonStyles}
            disabled={messages.length === 0}
            title="Save conversation as a new card"
            data-testid="save-conversation-btn"
          >
            💾 Save Conversation
          </button>

          {onToggleAutoSave && (
            <label css={autoSaveCheckboxStyles}>
              <input
                type="checkbox"
                checked={autoSaveOnClose}
                onChange={e => onToggleAutoSave(e.target.checked)}
                data-testid="auto-save-checkbox"
              />
              <span>Auto-save on close</span>
            </label>
          )}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} css={inputFormStyles}>
        <input
          type="text"
          value={currentInput}
          onChange={e => onInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={isStreaming}
          css={inputStyles(isStreaming)}
        />
        <div css={buttonGroupStyles}>
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              css={stopButtonStyles}
              title="Stop generating"
            >
              ⏹
            </button>
          ) : (
            <button
              type="submit"
              css={sendButtonStyles}
              disabled={!currentInput.trim() && pendingImages.length === 0}
              title="Send message"
            >
              ↑
            </button>
          )}
          <button
            type="button"
            onClick={onClearChat}
            css={clearButtonStyles}
            title="Clear conversation"
          >
            🗑️
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const containerStyles = css`
  border-top: 1px solid #FFD700;
  background: rgba(255, 215, 0, 0.03);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
`;

const messagesContainerStyles = css`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 0, 0, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 0, 0, 0.5);
  }
`;

const emptyStateStyles = css`
  color: #999;
  font-size: 13px;
  font-style: italic;
  text-align: center;
  padding: 20px;
`;

const messageStyles = (role: 'user' | 'assistant') => css`
  padding: 8px 10px;
  border-radius: 6px;
  max-width: 85%;
  font-size: 13px;
  line-height: 1.4;
  align-self: ${role === 'user' ? 'flex-end' : 'flex-start'};
  background: ${role === 'user'
    ? 'rgba(139, 0, 0, 0.1)'
    : 'rgba(255, 215, 0, 0.1)'};
  border-left: 3px solid ${role === 'user'
    ? '#8B0000'
    : '#FFD700'};
`;

const messageContentStyles = css`
  h3 {
    margin: 0 0 6px 0;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin: 4px 0;
  }

  ul, ol {
    margin: 4px 0 4px 20px;
  }

  li {
    margin: 2px 0;
  }

  strong {
    font-weight: 600;
    color: #333;
  }

  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 2px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
  }
`;

const streamingIndicatorStyles = css`
  display: inline-block;
  margin-left: 4px;
  color: #8B0000;
  animation: pulse 1s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const cursorStyles = css`
  animation: blink 1s infinite;
  color: #8B0000;

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const loadingDotsStyles = css`
  display: flex;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 6px;
    height: 6px;
    background: #8B0000;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-of-type(1) {
      animation-delay: -0.32s;
    }

    &:nth-of-type(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const inputFormStyles = css`
  display: flex;
  padding: 8px;
  gap: 4px;
  border-top: 1px solid #ddd;
  background: white;
`;

const inputStyles = (disabled: boolean) => css`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid ${disabled ? '#ddd' : '#FFD700'};
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  opacity: ${disabled ? 0.6 : 1};
  cursor: ${disabled ? 'not-allowed' : 'text'};

  &:focus {
    border-color: #8B0000;
    box-shadow: 0 0 0 2px rgba(139, 0, 0, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const buttonGroupStyles = css`
  display: flex;
  gap: 4px;
`;

const buttonBaseStyles = css`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const sendButtonStyles = css`
  ${buttonBaseStyles}
  background: linear-gradient(135deg, #8B0000, #CD5C5C);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(139, 0, 0, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const stopButtonStyles = css`
  ${buttonBaseStyles}
  background: linear-gradient(135deg, #CD5C5C, #8B0000);
  color: white;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(139, 0, 0, 0.3);
  }
`;

const clearButtonStyles = css`
  ${buttonBaseStyles}
  background: rgba(0, 0, 0, 0.05);
  color: #666;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
  }
`;

const controlsBarStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-top: 1px solid #ddd;
  background: rgba(255, 215, 0, 0.05);
`;

const saveButtonStyles = css`
  padding: 8px 16px;
  background: linear-gradient(135deg, #D4AF37, #FFD700);
  color: #3E3226;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
    background: linear-gradient(135deg, #FFD700, #D4AF37);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const autoSaveCheckboxStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #5C4D42;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    cursor: pointer;
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: #3E3226;
  }
`;

// Image Preview Styles
const imagePreviewContainerStyles = css`
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 215, 0, 0.05);
  border-top: 1px solid rgba(139, 0, 0, 0.1);
  flex-wrap: wrap;
  max-height: 120px;
  overflow-y: auto;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 0, 0, 0.3);
    border-radius: 2px;

    &:hover {
      background: rgba(139, 0, 0, 0.5);
    }
  }
`;

const imagePreviewStyles = css`
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`;

const thumbnailStyles = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid rgba(139, 0, 0, 0.2);
`;

const removeImageButtonStyles = css`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8B0000;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    background: #CD5C5C;
    transform: scale(1.1);
  }
`;

const messageImagesStyles = css`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const messageImageStyles = css`
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid rgba(139, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.5);
`;
