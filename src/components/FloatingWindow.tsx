/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import type { Card } from '@/types/card';
import type { WindowState } from '@/types/window';
import { FloatingWindowChat } from './FloatingWindowChat';
import { windowManager } from '@/services/windowManager';
import { chatService } from '@/services/chatService';

/**
 * Props for FloatingWindow component
 */
export interface FloatingWindowProps {
  card: Card;
  windowState: WindowState;
}

/**
 * Floating window component
 * Displays card content with chat interface at bottom
 */
export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  card,
  windowState
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState('');

  // Restore scroll position on mount/maximize
  useEffect(() => {
    if (contentRef.current && !windowState.minimized) {
      contentRef.current.scrollTop = windowState.scrollPosition;
    }
  }, [windowState.minimized, windowState.scrollPosition]);

  // Handle scroll position changes
  const handleScroll = () => {
    if (contentRef.current) {
      windowManager.updateScrollPosition(card.id, contentRef.current.scrollTop);
    }
  };

  // Handle send message
  const handleSendMessage = async (message: string) => {
    windowManager.updateStreamingState(card.id, true);
    windowManager.updateChatInput(card.id, '');

    try {
      const stream = chatService.sendMessage(card.id, message, card.content);

      for await (const chunk of stream) {
        setStreamingContent(prev => prev + chunk);
        // Update conversation in window manager
        const conversation = chatService.getConversation(card.id);
        windowManager.updateConversationMessages(card.id, conversation);
      }
    } catch (error) {
      console.error('[FloatingWindow] Error streaming response:', error);
    } finally {
      windowManager.updateStreamingState(card.id, false);
      setStreamingContent('');
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    windowManager.updateChatInput(card.id, value);
  };

  // Handle stop streaming
  const handleStopStreaming = () => {
    chatService.stopStreaming(card.id);
    windowManager.updateStreamingState(card.id, false);
    setStreamingContent('');
  };

  // Handle clear chat
  const handleClearChat = async () => {
    if (confirm('Clear all messages in this conversation?')) {
      await chatService.clearConversation(card.id);
      windowManager.updateConversationMessages(card.id, []);
    }
  };

  // Handle close
  const handleClose = () => {
    windowManager.closeWindow(card.id);
  };

  // Handle minimize
  const handleMinimize = () => {
    windowManager.minimizeWindow(card.id);
  };

  // Handle bring to front
  const handleMouseDown = () => {
    windowManager.bringToFront(card.id);
  };

  // Handle drag stop
  const handleDragStop = (_e: any, data: { x: number; y: number }) => {
    windowManager.updatePosition(card.id, data.x, data.y);
  };

  return (
    <Draggable
      handle=".window-header"
      position={windowState.position}
      onStop={handleDragStop}
      bounds="parent"
    >
      <div
        css={windowStyles(windowState.minimized, windowState.zIndex)}
        onMouseDown={handleMouseDown}
      >
        <div className="window-header" css={headerStyles}>
          <div css={titleStyles}>
            <span css={faviconStyles}>
              {card.metadata.favicon ? (
                <img src={card.metadata.favicon} alt="" />
              ) : (
                '📄'
              )}
            </span>
            <span css={titleTextStyles}>{card.metadata.title}</span>
          </div>
          <div css={controlsStyles}>
            <button
              onClick={handleMinimize}
              css={controlButtonStyles}
              title="Minimize"
            >
              −
            </button>
            <button
              onClick={handleClose}
              css={controlButtonStyles}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div
          ref={contentRef}
          css={contentStyles}
          onScroll={handleScroll}
        >
          <div
            dangerouslySetInnerHTML={{ __html: card.content }}
          />

          {card.metadata.url && (
            <div css={metadataStyles}>
              <a
                href={card.metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                css={linkStyles}
              >
                View original →
              </a>
            </div>
          )}
        </div>

        <FloatingWindowChat
          cardId={card.id}
          cardContent={card.content}
          messages={windowState.conversationMessages}
          currentInput={windowState.chatInput}
          isStreaming={windowState.isStreaming}
          onSendMessage={handleSendMessage}
          onInputChange={handleInputChange}
          onStopStreaming={handleStopStreaming}
          onClearChat={handleClearChat}
        />
      </div>
    </Draggable>
  );
};

// Styles
const windowStyles = (minimized: boolean, zIndex: number) => css`
  position: absolute;
  display: ${minimized ? 'none' : 'flex'};
  flex-direction: column;
  background: white;
  border: 2px solid #FFD700;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: ${zIndex};
  width: 600px;
  height: 500px;
  pointer-events: auto;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

const headerStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, #8B0000, #CD5C5C);
  color: white;
  cursor: move;
  user-select: none;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
`;

const titleStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const faviconStyles = css`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 16px;
    height: 16px;
  }
`;

const titleTextStyles = css`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const controlsStyles = css`
  display: flex;
  gap: 4px;
`;

const controlButtonStyles = css`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 18px;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const contentStyles = css`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 0, 0, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 0, 0, 0.5);
  }

  /* Content styling */
  h1, h2, h3, h4, h5, h6 {
    margin: 12px 0 8px 0;
    color: #8B0000;
  }

  p {
    margin: 8px 0;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 24px;
  }

  li {
    margin: 4px 0;
  }

  a {
    color: #8B0000;
    text-decoration: none;
    border-bottom: 1px solid rgba(139, 0, 0, 0.3);

    &:hover {
      border-bottom-color: #8B0000;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  code {
    background: rgba(255, 215, 0, 0.1);
    padding: 2px 4px;
    border-radius: 2px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
  }

  pre {
    background: rgba(255, 215, 0, 0.05);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
    }
  }
`;

const metadataStyles = css`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const linkStyles = css`
  color: #8B0000;
  font-size: 13px;
  text-decoration: none;
  border-bottom: 1px solid rgba(139, 0, 0, 0.3);

  &:hover {
    border-bottom-color: #8B0000;
  }
`;
