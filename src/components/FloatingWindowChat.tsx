/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useEffect } from 'react';
import type { FloatingWindowChatProps } from '@/types/window';

export function FloatingWindowChat({
  messages,
  currentInput,
  isStreaming,
  onSendMessage,
  onInputChange,
  onStopStreaming,
  onClearChat,
}: FloatingWindowChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && !isStreaming) {
      onSendMessage(currentInput);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div css={styles.container}>
      {/* Messages List */}
      <div css={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div css={styles.emptyState}>
            Start a conversation about this content...
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              css={[
                styles.message,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <div css={styles.messageRole}>
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div css={styles.messageContent}>
                {message.content}
                {message.streaming && <span css={styles.cursor}>▊</span>}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form css={styles.inputForm} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          css={styles.input}
          disabled={isStreaming}
          data-testid="chat-input"
          className="chat-input"
        />
        <div css={styles.controls}>
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              css={[styles.button, styles.stopButton]}
              data-testid="stop-streaming-btn"
            >
              ⏹ Stop
            </button>
          ) : (
            <>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={onClearChat}
                  css={[styles.button, styles.clearButton]}
                  data-testid="clear-chat-btn"
                  title="Clear conversation"
                >
                  🗑
                </button>
              )}
              <button
                type="submit"
                css={[styles.button, styles.sendButton]}
                disabled={!currentInput.trim() || isStreaming}
                data-testid="send-btn"
              >
                ↑
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    height: 200px;
    border-top: 1px solid rgba(184, 156, 130, 0.3);
    background: rgba(250, 247, 242, 0.5);
  `,

  messagesContainer: css`
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(184, 156, 130, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(139, 0, 0, 0.3);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(139, 0, 0, 0.5);
    }
  `,

  emptyState: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #a89684;
    font-size: 13px;
    font-style: italic;
  `,

  message: css`
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 13px;
    line-height: 1.5;
  `,

  userMessage: css`
    flex-direction: row-reverse;
  `,

  assistantMessage: css`
    flex-direction: row;
  `,

  messageRole: css`
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  `,

  messageContent: css`
    flex: 1;
    padding: 6px 10px;
    border-radius: 8px;
    background: white;
    border: 1px solid rgba(184, 156, 130, 0.2);
    color: #3e3226;
    max-width: 80%;

    .user-message & {
      background: linear-gradient(135deg, rgba(139, 0, 0, 0.05), rgba(212, 175, 55, 0.05));
      border-color: rgba(212, 175, 55, 0.3);
    }
  `,

  cursor: css`
    animation: blink 1s infinite;
    margin-left: 2px;

    @keyframes blink {
      0%,
      50% {
        opacity: 1;
      }
      51%,
      100% {
        opacity: 0;
      }
    }
  `,

  inputForm: css`
    display: flex;
    gap: 6px;
    padding: 8px;
    background: white;
    border-top: 1px solid rgba(184, 156, 130, 0.2);
  `,

  input: css`
    flex: 1;
    padding: 8px 12px;
    border: 1px solid rgba(184, 156, 130, 0.3);
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: #8b0000;
      box-shadow: 0 0 0 2px rgba(139, 0, 0, 0.1);
    }

    &:disabled {
      background: rgba(0, 0, 0, 0.05);
      cursor: not-allowed;
    }

    &::placeholder {
      color: #a89684;
    }
  `,

  controls: css`
    display: flex;
    gap: 4px;
  `,

  button: css`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
    padding: 0;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,

  sendButton: css`
    background: linear-gradient(135deg, #8b0000, #cd5c5c);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(139, 0, 0, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,

  stopButton: css`
    background: #cd5c5c;
    color: white;

    &:hover {
      background: #8b0000;
    }
  `,

  clearButton: css`
    background: rgba(0, 0, 0, 0.05);
    color: #666;

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  `,
};
