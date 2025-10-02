/** @jsxImportSource @emotion/react */
/**
 * Element Chat Window
 *
 * Persistent chat window attached to a specific page element.
 * Automatically saves conversation history and window state.
 */

import { css } from '@emotion/react';
import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import type { ElementChatSession, ChatMessage } from '@/types/elementChat';
import type { ElementDescriptor } from '@/services/elementIdService';
import { ImageUploadZone } from '@/shared/components/ImageUpload/ImageUploadZone';
import { fileToBase64, getImageDimensions, isImageFile } from '@/utils/imageUpload';

export interface ElementChatWindowProps {
  /** Element's chat ID */
  elementId: string;
  /** Element descriptor for positioning and context */
  elementDescriptor: ElementDescriptor;
  /** Existing chat session (if reopening) */
  existingSession?: ElementChatSession | null;
  /** Callback when window is closed */
  onClose: () => void;
  /** Initial position (if creating new window) */
  initialPosition?: { x: number; y: number };
}

/**
 * ElementChatWindow Component
 */
export const ElementChatWindow: React.FC<ElementChatWindowProps> = ({
  elementId,
  elementDescriptor,
  existingSession,
  onClose,
  initialPosition
}) => {
  // Load initial messages from existing session
  const [messages, setMessages] = useState<ChatMessage[]>(
    existingSession?.messages || []
  );
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [collapsed, setCollapsed] = useState(
    existingSession?.windowState?.collapsed || false
  );
  const [windowSize, setWindowSize] = useState(
    existingSession?.windowState?.size || { width: 420, height: 550 }
  );
  const [position, setPosition] = useState(
    existingSession?.windowState?.position || initialPosition || { x: 100, y: 100 }
  );

  // Message queue for queueing messages sent during streaming
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Image upload support
  const [pendingImages, setPendingImages] = useState<Array<{
    dataURL: string;
    width: number;
    height: number;
  }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isStreaming) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isStreaming]);

  /**
   * Save chat session (debounced)
   */
  const saveSession = async (updatedMessages?: ChatMessage[]) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 500ms
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { saveElementChat, createElementChatSession } = await import('@/services/elementChatService');
        const { updateChatWindowState } = await import('@/services/elementChatService');

        // Get or create session
        let session = existingSession;
        if (!session) {
          session = createElementChatSession(
            elementId,
            window.location.href,
            elementDescriptor,
            {
              position,
              size: windowSize,
              collapsed
            }
          );
        }

        // Update session
        session.messages = updatedMessages || messages;
        session.windowState = {
          position,
          size: windowSize,
          collapsed
        };

        // Save to storage
        await saveElementChat(session);
        console.log('[ElementChatWindow] Session saved:', elementId);
      } catch (error) {
        console.error('[ElementChatWindow] Failed to save session:', error);
      }
    }, 500);
  };

  // Save when messages, position, size, or collapsed state changes
  useEffect(() => {
    if (messages.length > 0 || collapsed !== (existingSession?.windowState?.collapsed || false)) {
      saveSession();
    }
  }, [messages, position, windowSize, collapsed]);

  const sendMessageToAPI = async (userMessage: string, images: Array<{ dataURL: string; width: number; height: number }> = []) => {
    const currentMessages = messages;

    try {
      // Add user message to chat
      const { addMessageToChat } = await import('@/services/elementChatService');
      let session = existingSession;
      if (!session) {
        const { createElementChatSession } = await import('@/services/elementChatService');
        session = createElementChatSession(
          elementId,
          window.location.href,
          elementDescriptor
        );
      }

      // Add user message
      await addMessageToChat(session, 'user', userMessage);

      // Update local state
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
        images: images.length > 0 ? images : undefined
      };

      const newMessages: ChatMessage[] = [...messages, newMessage];
      setMessages(newMessages);
      setIsStreaming(true);

      // Call Claude API
      const { chatWithPage } = await import('@/services/claudeAPIService');

      // Create system prompt with element context
      const systemPrompt = `You are chatting about a specific element on a web page.

Element: <${elementDescriptor.tagName}>${elementDescriptor.id ? ` id="${elementDescriptor.id}"` : ''}${elementDescriptor.classes.length > 0 ? ` class="${elementDescriptor.classes.join(' ')}"` : ''}
Text content: ${elementDescriptor.textPreview}

Page: ${window.location.href}
Page title: ${document.title}

Answer questions about this element, its purpose, or how it works.`;

      let assistantContent = '';
      const stream = await chatWithPage(
        systemPrompt,
        newMessages.map(m => ({
          role: m.role,
          content: m.content,
          images: m.images // Include images if present
        }))
      );

      // Stream response
      for await (const chunk of stream) {
        assistantContent += chunk;
        setStreamingContent(assistantContent);
      }

      // Add assistant message to chat
      await addMessageToChat(session, 'assistant', assistantContent);

      // Update local state
      const finalMessages: ChatMessage[] = [
        ...newMessages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now()
        }
      ];
      setMessages(finalMessages);
      setStreamingContent('');

    } catch (error) {
      console.error('[ElementChatWindow] Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: '❌ Error: Could not connect to API. Please check your backend is running or API key is configured.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);

      // Process queue if any messages waiting
      if (messageQueue.length > 0 && !isProcessingQueue) {
        setTimeout(() => processQueue(), 100); // Small delay before processing next
      }
    }
  };

  const processQueue = async () => {
    if (messageQueue.length === 0 || isProcessingQueue) return;

    console.log('[ElementChatWindow] Processing message queue, length:', messageQueue.length);
    setIsProcessingQueue(true);

    // Get next message from queue
    const nextMessage = messageQueue[0];
    setMessageQueue(prev => prev.slice(1));

    // Send it
    await sendMessageToAPI(nextMessage);

    setIsProcessingQueue(false);
  };

  const handleImageDrop = async (file: File) => {
    try {
      console.log('[ElementChatWindow] Processing image:', file.name);

      // Validate file is an image
      if (!isImageFile(file)) {
        console.error('[ElementChatWindow] Invalid file type:', file.type);
        return;
      }

      // Convert to base64
      const dataURL = await fileToBase64(file);

      // Get image dimensions
      const dimensions = await getImageDimensions(dataURL);

      // Add to pending images
      setPendingImages(prev => [...prev, {
        dataURL,
        width: dimensions.width,
        height: dimensions.height
      }]);

      console.log('[ElementChatWindow] Image added to pending:', dimensions);
    } catch (error) {
      console.error('[ElementChatWindow] Image processing failed:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && pendingImages.length === 0) return;

    const userMessage = inputValue.trim() || (pendingImages.length > 0 ? '(Image attached)' : '');
    const imagesToSend = [...pendingImages];

    setInputValue('');
    setPendingImages([]); // Clear pending images

    // If currently streaming, add to queue (for now, queue text only - TODO: enhance for images)
    if (isStreaming) {
      console.log('[ElementChatWindow] Queueing message (currently streaming):', userMessage);
      setMessageQueue(prev => [...prev, userMessage]);
      return; // Don't send immediately
    }

    // Otherwise send normally
    await sendMessageToAPI(userMessage, imagesToSend);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDragStop = (_e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleResizeStop = (
    _e: any,
    _dir: any,
    ref: HTMLElement,
    _delta: any,
    newPosition: { x: number; y: number }
  ) => {
    setWindowSize({
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height)
    });
    setPosition(newPosition);
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Element context info
  const elementLabel = `<${elementDescriptor.tagName}>${elementDescriptor.id ? `#${elementDescriptor.id}` : ''}`;
  const hasHistory = messages.length > 0;

  // Calculate header-only height (header padding + content + border)
  const headerOnlyHeight = 44; // 10px top + 10px bottom padding + ~20px content + 4px border

  return (
    <Rnd
      position={position}
      size={{
        width: windowSize.width,
        height: collapsed ? headerOnlyHeight : windowSize.height
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={300}
      minHeight={200}
      bounds="window"
      dragHandleClassName="drag-handle"
      enableResizing={!collapsed ? {
        bottom: true,
        bottomRight: true,
        bottomLeft: true,
        right: true,
        left: true,
        top: false,
        topRight: false,
        topLeft: false
      } : false}
    >
      <div
        css={containerStyles(collapsed)}
        data-collapsed={collapsed ? 'true' : 'false'}
      >
        {/* Header */}
        <div css={headerStyles} className="drag-handle">
          <div css={headerTitleStyles}>
            <span css={iconStyles}>💬</span>
            <span css={elementLabelStyles}>{elementLabel}</span>
            {hasHistory && <span css={messageCountStyles}>{messages.length}</span>}
          </div>
          <div css={headerActionsStyles}>
            <button
              css={headerButtonStyles}
              onClick={handleToggleCollapse}
              title={collapsed ? "Expand" : "Collapse"}
              data-test-id="collapse-button"
            >
              {collapsed ? '▼' : '▲'}
            </button>
            <button
              css={headerButtonStyles}
              onClick={onClose}
              title="Close"
              disabled={isStreaming}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        {!collapsed && (
          <div css={messagesContainerStyles}>
            {messages.length === 0 && (
              <div css={emptyStateStyles}>
                <div css={emptyIconStyles}>💬</div>
                <div css={emptyTitleStyles}>Chat with this element</div>
                <div css={emptyDescStyles}>
                  Ask questions about this element, its purpose, or how it works.
                </div>
                <div css={emptyHintStyles}>
                  <strong>Element:</strong> {elementLabel}
                </div>
                <div css={emptyHintStyles} style={{ marginTop: '8px' }}>
                  <strong>Text:</strong> {elementDescriptor.textPreview || 'No text content'}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                css={messageStyles(message.role)}
              >
                <div css={messageRoleStyles}>
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                {/* Display images if present */}
                {message.images && message.images.length > 0 && (
                  <div css={messageImagesStyles}>
                    {message.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.dataURL}
                        alt="Message attachment"
                        css={messageImageStyles}
                      />
                    ))}
                  </div>
                )}
                <div css={messageContentStyles}>
                  {message.content}
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <div css={messageStyles('assistant')}>
                <div css={messageRoleStyles}>Assistant</div>
                <div css={messageContentStyles}>
                  {streamingContent}
                  <span css={cursorStyles}>▊</span>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isStreaming && !streamingContent && (
              <div css={messageStyles('assistant')}>
                <div css={messageRoleStyles}>Assistant</div>
                <div css={loadingDotsStyles}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        {!collapsed && (
          <>
            {/* Queue indicator */}
            {messageQueue.length > 0 && (
              <div css={queueIndicatorStyles}>
                <span css={queueIconStyles}>📬</span>
                <span css={queueTextStyles}>
                  {messageQueue.length} message{messageQueue.length > 1 ? 's' : ''} queued
                </span>
                <button
                  css={clearQueueButtonStyles}
                  onClick={() => setMessageQueue([])}
                  title="Clear queue"
                >
                  Clear
                </button>
              </div>
            )}

            <div css={inputContainerStyles}>
            <ImageUploadZone onImageUpload={handleImageDrop}>
              <div css={inputWrapperStyles}>
                {/* Image previews */}
                {pendingImages.length > 0 && (
                  <div css={imagePreviewsContainerStyles}>
                    {pendingImages.map((img, idx) => (
                      <div key={idx} css={imagePreviewStyles}>
                        <img src={img.dataURL} alt="Pending upload" css={imagePreviewImgStyles} />
                        <button
                          css={removeImageButtonStyles}
                          onClick={() => {
                            setPendingImages(prev => prev.filter((_, i) => i !== idx));
                          }}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  ref={inputRef}
                  css={textareaStyles}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={isStreaming ? "Composing next message..." : "Ask about this element (drag images here)..."}
                  rows={2}
                />
              </div>
            </ImageUploadZone>
            <button
              css={sendButtonStyles}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() && pendingImages.length === 0}
              title={isStreaming ? "Queue message" : "Send message"}
            >
              {isStreaming ? '➕' : '➤'}
            </button>
          </div>
          </>
        )}
      </div>
    </Rnd>
  );
};

// ============================================================================
// Styles (purple/chat theme)
// ============================================================================

const containerStyles = (collapsed: boolean) => css`
  width: 100%;
  height: ${collapsed ? 'auto' : '100%'};
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(199, 125, 255, 0.02));
  border: 2px solid #7B2CBF;
  border-radius: 8px;
  box-shadow:
    0 8px 32px rgba(123, 44, 191, 0.3),
    0 0 0 1px rgba(199, 125, 255, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 999999;
  pointer-events: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  transition: all 0.3s ease;
  overflow: ${collapsed ? 'hidden' : 'visible'};
`;

const headerStyles = css`
  background: linear-gradient(135deg, #7B2CBF, #9D4EDD);
  color: white;
  padding: 10px 12px;
  border-radius: 6px 6px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
`;

const headerTitleStyles = css`
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const elementLabelStyles = css`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  opacity: 0.95;
`;

const messageCountStyles = css`
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
`;

const iconStyles = css`
  font-size: 16px;
`;

const headerActionsStyles = css`
  display: flex;
  gap: 4px;
`;

const headerButtonStyles = css`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(224, 170, 255, 0.3);
  border-radius: 3px;
  padding: 3px 8px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(224, 170, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const messagesContainerStyles = css`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: white;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(123, 44, 191, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(123, 44, 191, 0.5);
    }
  }
`;

const emptyStateStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
  color: #666;
`;

const emptyIconStyles = css`
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.7;
`;

const emptyTitleStyles = css`
  font-size: 18px;
  font-weight: 600;
  color: #7B2CBF;
  margin-bottom: 8px;
`;

const emptyDescStyles = css`
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const emptyHintStyles = css`
  font-size: 12px;
  color: #999;
  padding: 8px 12px;
  background: rgba(123, 44, 191, 0.05);
  border-radius: 4px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const messageStyles = (role: 'user' | 'assistant') => css`
  margin: 8px 0;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${role === 'user' ? css`
    background: linear-gradient(135deg, rgba(123, 44, 191, 0.1), rgba(199, 125, 255, 0.05));
    border-left: 3px solid #7B2CBF;
    margin-left: 20px;
  ` : css`
    background: rgba(0, 0, 0, 0.03);
    border-left: 3px solid #C77DFF;
    margin-right: 20px;
  `}
`;

const messageRoleStyles = css`
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #7B2CBF;
  margin-bottom: 4px;
`;

const messageContentStyles = css`
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const cursorStyles = css`
  animation: blink 1s infinite;
  color: #7B2CBF;

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
    background: #7B2CBF;
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

const inputContainerStyles = css`
  border-top: 1px solid rgba(123, 44, 191, 0.2);
  padding: 10px;
  display: flex;
  gap: 8px;
  background: rgba(224, 170, 255, 0.05);
  flex-shrink: 0;
`;

const textareaStyles = css`
  flex: 1;
  border: 1px solid rgba(123, 44, 191, 0.2);
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: #7B2CBF;
    box-shadow: 0 0 0 2px rgba(123, 44, 191, 0.1);
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
  }
`;

const sendButtonStyles = css`
  background: linear-gradient(135deg, #7B2CBF, #9D4EDD);
  color: white;
  border: 1px solid rgba(224, 170, 255, 0.3);
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-end;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(123, 44, 191, 0.3);
    border-color: #C77DFF;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const queueIndicatorStyles = css`
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(123, 44, 191, 0.05));
  border-top: 1px solid rgba(123, 44, 191, 0.2);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const queueIconStyles = css`
  font-size: 14px;
`;

const queueTextStyles = css`
  flex: 1;
  color: #7B2CBF;
  font-weight: 500;
`;

const clearQueueButtonStyles = css`
  background: rgba(139, 0, 0, 0.1);
  border: 1px solid rgba(139, 0, 0, 0.2);
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 11px;
  color: #8B0000;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 0, 0, 0.2);
    border-color: rgba(139, 0, 0, 0.4);
  }
`;

const inputWrapperStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const imagePreviewsContainerStyles = css`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 4px;
  background: rgba(123, 44, 191, 0.03);
  border-radius: 3px;
`;

const imagePreviewStyles = css`
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px solid rgba(123, 44, 191, 0.2);
  border-radius: 3px;
  overflow: hidden;
`;

const imagePreviewImgStyles = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const removeImageButtonStyles = css`
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(139, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 0, 0, 1);
    transform: scale(1.1);
  }
`;

const messageImagesStyles = css`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 6px 0;
`;

const messageImageStyles = css`
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid rgba(123, 44, 191, 0.2);
  object-fit: contain;
  background: rgba(0, 0, 0, 0.02);
`;
