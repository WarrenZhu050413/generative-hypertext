/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useState, useEffect, useMemo } from 'react';
import { BaseChatUI } from '@/shared/components/Chat/BaseChatUI';
import { useChatMessages } from '@/shared/hooks/useChatMessages';
import { generateId } from '@/utils/storage';
import type { Card } from '@/types/card';

/**
 * Props for SidePanelChat component
 */
export interface SidePanelChatProps {
  onSaveToCanvas: (card: Card) => Promise<void>;
  onSaveToStash: (card: Card) => Promise<void>;
}

/**
 * Chat component for the side panel
 * Provides a collapsible chat interface with page context
 */
export const SidePanelChat: React.FC<SidePanelChatProps> = ({
  onSaveToCanvas,
  onSaveToStash
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pageContext, setPageContext] = useState<{ url: string; title: string }>({
    url: '',
    title: ''
  });

  // Get current page context on mount and when expanded
  useEffect(() => {
    const getPageContext = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.title) {
          setPageContext({
            url: tab.url,
            title: tab.title
          });
        }
      } catch (error) {
        console.error('[SidePanelChat] Error getting page context:', error);
      }
    };

    if (isExpanded) {
      getPageContext();
    }
  }, [isExpanded]);

  // Create system prompt from page context
  const systemPrompt = useMemo(() => {
    if (pageContext.url && pageContext.title) {
      return `You are helping the user understand and work with the current page: "${pageContext.title}" (${pageContext.url}). Provide helpful, concise responses.`;
    }
    return 'You are a helpful assistant. Provide concise, informative responses.';
  }, [pageContext]);

  // Initialize chat messages hook
  const {
    messages,
    inputValue,
    isStreaming,
    streamingContent,
    setInputValue,
    sendMessage,
    stopStreaming,
    clearChat
  } = useChatMessages({
    systemPrompt,
    onError: (error) => {
      console.error('[SidePanelChat] Chat error:', error);
    }
  });

  // Handle save conversation to canvas or stash
  const handleSaveConversation = async (destination: 'canvas' | 'stash') => {
    if (messages.length === 0) {
      alert('No conversation to save');
      return;
    }

    try {
      // Format conversation as HTML
      const conversationHTML = messages.map(msg => {
        const role = msg.role === 'user' ? 'You' : 'Assistant';
        const timestamp = new Date(msg.timestamp).toLocaleString();

        // Include images if present
        const imageHTML = msg.images?.map(img =>
          `<img src="${img.dataURL}" alt="Message attachment" style="max-width: 100%; margin: 8px 0; border-radius: 4px;" />`
        ).join('') || '';

        return `
          <div style="margin-bottom: 16px; padding: 12px; background: ${msg.role === 'user' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(139, 0, 0, 0.05)'}; border-radius: 8px;">
            <div style="font-weight: 600; color: #8B7355; margin-bottom: 4px; font-size: 12px;">
              ${role} - ${timestamp}
            </div>
            ${imageHTML}
            <div style="color: #3E3226; line-height: 1.5;">
              ${msg.content.replace(/\n/g, '<br>')}
            </div>
          </div>
        `;
      }).join('');

      // Create new card
      const newCard: Card = {
        id: generateId(),
        content: conversationHTML,
        cardType: 'note',
        stashed: destination === 'stash',
        metadata: {
          url: pageContext.url || '',
          title: `Chat: ${pageContext.title || 'Side Panel Conversation'}`,
          domain: new URL(pageContext.url || 'https://example.com').hostname,
          favicon: '💬',
          timestamp: Date.now(),
        },
        position: undefined, // Will be auto-positioned on canvas
        size: { width: 400, height: 300 },
        starred: false,
        tags: ['chat', 'side-panel'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        conversation: messages,
      };

      // Save card using provided handlers
      if (destination === 'canvas') {
        await onSaveToCanvas(newCard);
        alert('Conversation saved to canvas!');
      } else {
        await onSaveToStash(newCard);
        alert('Conversation saved to stash!');
      }

      // Clear chat after saving
      clearChat();
    } catch (error) {
      console.error('[SidePanelChat] Error saving conversation:', error);
      alert('Failed to save conversation');
    }
  };

  // Handle refresh context
  const handleRefreshContext = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.title) {
        setPageContext({
          url: tab.url,
          title: tab.title
        });
        alert('Page context refreshed!');
      }
    } catch (error) {
      console.error('[SidePanelChat] Error refreshing context:', error);
    }
  };

  return (
    <div css={containerStyles}>
      {/* Header - Always visible */}
      <div css={headerStyles} onClick={() => setIsExpanded(!isExpanded)}>
        <div css={titleStyles}>
          <span css={iconStyles}>💬</span>
          <span>Chat with Page</span>
          {pageContext.title && (
            <span css={contextIndicatorStyles} title={pageContext.url}>
              ({pageContext.title.substring(0, 30)}...)
            </span>
          )}
        </div>
        <button
          css={expandButtonStyles}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Chat Content - Collapsible */}
      {isExpanded && (
        <div css={chatContentStyles}>
          {/* Action buttons */}
          <div css={actionBarStyles}>
            <button
              css={actionButtonStyles}
              onClick={handleRefreshContext}
              title="Refresh page context"
            >
              🔄 Refresh Context
            </button>
            <div css={saveButtonsStyles}>
              <button
                css={saveButtonStyles('canvas')}
                onClick={() => handleSaveConversation('canvas')}
                disabled={messages.length === 0}
                title="Save conversation to canvas"
              >
                🎨 To Canvas
              </button>
              <button
                css={saveButtonStyles('stash')}
                onClick={() => handleSaveConversation('stash')}
                disabled={messages.length === 0}
                title="Save conversation to stash"
              >
                📥 To Stash
              </button>
            </div>
          </div>

          {/* Chat UI */}
          <div css={chatWrapperStyles}>
            <BaseChatUI
              messages={messages}
              currentInput={inputValue}
              isStreaming={isStreaming}
              streamingContent={streamingContent}
              pendingImages={[]} // Side panel doesn't support images yet
              onSendMessage={sendMessage}
              onInputChange={setInputValue}
              onStopStreaming={stopStreaming}
              onClearChat={clearChat}
              placeholder={pageContext.title ? `Ask about "${pageContext.title}"...` : 'Ask a question...'}
              showSaveControls={false} // We handle saves with our own buttons
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyles = css`
  border-bottom: 2px solid rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg, rgba(255, 248, 240, 0.5), rgba(250, 245, 238, 0.5));
`;

const headerStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.05);
  }
`;

const titleStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #3e3226;
`;

const iconStyles = css`
  font-size: 16px;
`;

const contextIndicatorStyles = css`
  font-size: 11px;
  color: #8b7355;
  font-weight: 400;
  font-style: italic;
`;

const expandButtonStyles = css`
  background: transparent;
  border: none;
  color: #8b7355;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
  }
`;

const chatContentStyles = css`
  display: flex;
  flex-direction: column;
  height: 400px; // Fixed height for chat
  border-top: 1px solid rgba(184, 156, 130, 0.2);
`;

const actionBarStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(184, 156, 130, 0.15);
`;

const actionButtonStyles = css`
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(184, 156, 130, 0.3);
  border-radius: 4px;
  color: #5c4d42;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: rgba(212, 175, 55, 0.5);
  }
`;

const saveButtonsStyles = css`
  display: flex;
  gap: 6px;
`;

const saveButtonStyles = (type: 'canvas' | 'stash') => css`
  padding: 4px 8px;
  background: ${type === 'canvas'
    ? 'linear-gradient(135deg, rgba(139, 0, 0, 0.1), rgba(205, 92, 92, 0.1))'
    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1))'
  };
  border: 1px solid ${type === 'canvas'
    ? 'rgba(139, 0, 0, 0.3)'
    : 'rgba(76, 175, 80, 0.3)'
  };
  border-radius: 4px;
  color: ${type === 'canvas' ? '#8b0000' : '#2e7d32'};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${type === 'canvas'
      ? 'linear-gradient(135deg, rgba(139, 0, 0, 0.2), rgba(205, 92, 92, 0.2))'
      : 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(129, 199, 132, 0.2))'
    };
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const chatWrapperStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;