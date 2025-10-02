/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import type { PageContext } from '@/services/pageContextCapture';
import type { ElementContext } from '@/services/elementContextCapture';
import { formatPageContextAsPrompt, capturePageContext } from '@/services/pageContextCapture';
import { formatElementContextAsPrompt } from '@/services/elementContextCapture';
import { fileToBase64, getImageDimensions, isImageFile } from '@/utils/imageUpload';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: Array<{
    dataURL: string;      // "data:image/png;base64,..."
    width: number;        // Original dimensions
    height: number;
  }>;
}

export interface InlineChatWindowProps {
  onClose: () => void;
  initialContext: PageContext | ElementContext;
  elementPosition?: { x: number; y: number }; // For positioning near element
  onSaveToCanvas?: (messages: Message[]) => Promise<void>;
}

/**
 * Type guard to check if context is ElementContext
 */
function isElementContext(context: PageContext | ElementContext): context is ElementContext {
  return 'element' in context;
}

/**
 * Inline Chat Window
 * Floating draggable window for chatting with web pages or specific elements
 */
export const InlineChatWindow: React.FC<InlineChatWindowProps> = ({
  onClose,
  initialContext,
  elementPosition,
  onSaveToCanvas
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 420, height: 550 });
  const [pendingImages, setPendingImages] = useState<Array<{
    dataURL: string;
    width: number;
    height: number;
  }>>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Determine context type
  const isElement = isElementContext(initialContext);
  const contextTitle = isElement
    ? `<${initialContext.element.tagName}>${initialContext.element.id ? `#${initialContext.element.id}` : ''}`
    : initialContext.title;

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
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleImageDrop = async (file: File) => {
    try {
      console.log('[InlineChatWindow] Processing image:', file.name);

      // Validate file is an image
      if (!isImageFile(file)) {
        console.error('[InlineChatWindow] Invalid file type:', file.type);
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

      console.log('[InlineChatWindow] Image added to pending:', dimensions);
    } catch (error) {
      console.error('[InlineChatWindow] Image processing failed:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && pendingImages.length === 0) || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim() || '(Image attached)',
      images: pendingImages.length > 0 ? [...pendingImages] : undefined
    };

    setInputValue('');
    setPendingImages([]); // Clear pending images

    // Add user message
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      const hasImages = userMessage.images && userMessage.images.length > 0;

      // Format context based on type
      const systemPrompt = isElement
        ? formatElementContextAsPrompt(initialContext)
        : formatPageContextAsPrompt(initialContext);

      if (hasImages) {
        // Use vision API for messages with images (non-streaming)
        const { claudeAPIService } = await import('@/services/claudeAPIService');

        // Transform to Claude's multimodal format
        const claudeMessages = newMessages.map(m => ({
          role: m.role,
          content: m.images && m.images.length > 0
            ? [
                // Images first
                ...m.images.map(img => {
                  const mediaType = img.dataURL.match(/data:([^;]+);/)?.[1] || 'image/png';
                  const base64Data = img.dataURL.split(',')[1];
                  return {
                    type: 'image' as const,
                    source: {
                      type: 'base64' as const,
                      media_type: mediaType,
                      data: base64Data
                    }
                  };
                }),
                // Text last
                { type: 'text' as const, text: m.content }
              ]
            : m.content // Text-only message
        }));

        console.log('[InlineChatWindow] Sending multimodal message with', userMessage.images?.length, 'images');

        const response = await claudeAPIService.sendMessage(
          claudeMessages,
          { system: systemPrompt, maxTokens: 4096 }
        );

        setMessages([...newMessages, { role: 'assistant', content: response }]);
      } else {
        // Text-only - use streaming API (existing code)
        const { chatWithPage } = await import('@/services/claudeAPIService');

        let assistantContent = '';
        const stream = await chatWithPage(
          systemPrompt,
          newMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        );

        // Stream response
        for await (const chunk of stream) {
          assistantContent += chunk;
          setStreamingContent(assistantContent);
        }

        setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
        setStreamingContent('');
      }
    } catch (error) {
      console.error('[InlineChatWindow] Error sending message:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '❌ Error: Could not connect to API. Please check your backend is running or API key is configured.' }
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRecapture = () => {
    const newContext = capturePageContext();
    console.log('[InlineChatWindow] Recaptured page context:', newContext.title);
    // For now, just log. In the future, we could update the context
  };

  const handleSave = async () => {
    if (onSaveToCanvas && messages.length > 0) {
      await onSaveToCanvas(messages);
      onClose();
    }
  };

  // Calculate initial position
  const defaultPosition = elementPosition
    ? {
        // Position near element, but ensure it fits on screen
        x: Math.min(elementPosition.x + 20, window.innerWidth - 450),
        y: Math.max(20, Math.min(elementPosition.y - 100, window.innerHeight - 600))
      }
    : { x: window.innerWidth - 450, y: 50 };

  return (
    <ImageUploadZone onImageUpload={handleImageDrop}>
      <Rnd
        default={{
          x: defaultPosition.x,
          y: defaultPosition.y,
          width: windowSize.width,
          height: windowSize.height
        }}
        size={{
          width: windowSize.width,
          height: collapsed ? 40 : windowSize.height
        }}
        onResizeStop={(_e, _dir, ref, _delta, position) => {
          setWindowSize({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height)
          });
        }}
        minWidth={300}
        minHeight={200}
        bounds="parent"
        dragHandleClassName="drag-handle"
        enableResizing={!collapsed && {
          bottom: true,
          bottomRight: true,
          bottomLeft: true,
          right: true,
          left: true,
          top: false,
          topRight: false,
          topLeft: false
        }}
      >
      <div css={containerStyles(collapsed, windowSize.width, windowSize.height)}>
        {/* Header */}
        <div css={headerStyles} className="drag-handle">
          <div css={headerTitleStyles}>
            <span css={iconStyles}>{isElement ? '🎯' : '💬'}</span>
            <span>{isElement ? 'Chat with Element' : 'Chat with Page'}</span>
          </div>
          <div css={headerActionsStyles}>
            <button
              css={headerButtonStyles}
              onClick={handleRecapture}
              title="Refresh page context"
            >
              📋
            </button>
            {onSaveToCanvas && (
              <button
                css={headerButtonStyles}
                onClick={handleSave}
                title="Save conversation to canvas"
                disabled={messages.length === 0}
              >
                📌
              </button>
            )}
            <button
              css={headerButtonStyles}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand" : "Collapse to header"}
            >
              {collapsed ? '▼' : '▲'}
            </button>
            <button
              css={headerButtonStyles}
              onClick={onClose}
              title="Close chat"
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
              <div css={emptyIconStyles}>{isElement ? '🎯' : '💬'}</div>
              <div css={emptyTitleStyles}>
                {isElement ? 'Chat about this element' : 'Chat with this page'}
              </div>
              <div css={emptyDescStyles}>
                {isElement
                  ? 'Ask questions about this element, its purpose, or how it works.'
                  : 'Ask questions, request summaries, or discuss the content on this page.'}
              </div>
              <div css={emptyHintStyles}>
                <strong>{isElement ? 'Element' : 'Page'}:</strong> {contextTitle}
              </div>
              {isElement && initialContext.element.text && (
                <div css={emptyHintStyles} style={{ marginTop: '8px' }}>
                  <strong>Text:</strong> {initialContext.element.text.substring(0, 100)}
                  {initialContext.element.text.length > 100 ? '...' : ''}
                </div>
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              css={messageStyles(message.role)}
            >
              <div css={messageRoleStyles}>
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>

              {/* Display attached images */}
              {message.images && message.images.length > 0 && (
                <div css={messageImagesStyles}>
                  {message.images.map((img, idx) => (
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

        {/* Pending Images Preview */}
        {!collapsed && pendingImages.length > 0 && (
          <div css={imagePreviewContainerStyles}>
            {pendingImages.map((img, idx) => (
              <div key={idx} css={imagePreviewStyles}>
                <img src={img.dataURL} css={thumbnailStyles} alt={`Pending image ${idx + 1}`} />
                <button
                  onClick={() => setPendingImages(prev =>
                    prev.filter((_, i) => i !== idx)
                  )}
                  css={removeImageButtonStyles}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        {!collapsed && (
        <div css={inputContainerStyles}>
          <textarea
            ref={inputRef}
            css={textareaStyles}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Ask about this page..."
            disabled={isStreaming}
            rows={2}
          />
          <button
            css={sendButtonStyles}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isStreaming}
          >
            {isStreaming ? '⏸' : '➤'}
          </button>
        </div>
        )}
      </div>
      </Rnd>
    </ImageUploadZone>
  );
};

// ============================================================================
// Styles
// ============================================================================

const containerStyles = (collapsed: boolean, width: number, height: number) => css`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 215, 0, 0.02));
  border: 2px solid #8B0000;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 999999;
  pointer-events: auto; /* Override parent's pointer-events: none */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  transition: height 0.3s ease;
`;

const headerStyles = css`
  background: linear-gradient(135deg, #8B0000, #CD5C5C);
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
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
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
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 3px;
  padding: 3px 8px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 215, 0, 0.5);
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
    background: rgba(139, 0, 0, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(139, 0, 0, 0.5);
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
  color: #8B0000;
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
  background: rgba(139, 0, 0, 0.05);
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
    background: linear-gradient(135deg, rgba(139, 0, 0, 0.1), rgba(255, 215, 0, 0.05));
    border-left: 3px solid #8B0000;
    margin-left: 20px;
  ` : css`
    background: rgba(0, 0, 0, 0.03);
    border-left: 3px solid #FFD700;
    margin-right: 20px;
  `}
`;

const messageRoleStyles = css`
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8B0000;
  margin-bottom: 4px;
`;

const messageContentStyles = css`
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
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

const inputContainerStyles = css`
  border-top: 1px solid rgba(139, 0, 0, 0.2);
  padding: 10px;
  display: flex;
  gap: 8px;
  background: rgba(245, 245, 220, 0.3);
  flex-shrink: 0;
`;

const textareaStyles = css`
  flex: 1;
  border: 1px solid rgba(139, 0, 0, 0.2);
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: #8B0000;
    box-shadow: 0 0 0 2px rgba(139, 0, 0, 0.1);
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
  }
`;

const sendButtonStyles = css`
  background: linear-gradient(135deg, #8B0000, #CD5C5C);
  color: white;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-end;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(139, 0, 0, 0.3);
    border-color: #FFD700;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ============================================================================
// Image Upload Styles
// ============================================================================

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
