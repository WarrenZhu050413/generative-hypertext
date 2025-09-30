/**
 * FloatingChat Component
 *
 * A floating chat window positioned next to selected elements, providing
 * conversational interaction with Claude AI about clipped web elements.
 * Features Chinese aesthetic styling with paper-like textures and gold accents.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  FloatingArrow,
} from '@floating-ui/react';
import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import type {
  Card,
  Message,
  ChatContext,
} from '@/types';
import { mockClaudeAPI } from '../utils/mockClaudeAPI';

// ============================================================================
// Types
// ============================================================================

interface FloatingChatProps {
  card: Card;
  element: HTMLElement;
  onClose: () => void;
  onMinimize?: () => void;
}

// ============================================================================
// Animations
// ============================================================================

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const typingDots = keyframes`
  0%, 20% {
    content: '.';
  }
  40% {
    content: '..';
  }
  60%, 100% {
    content: '...';
  }
`;

// ============================================================================
// Styled Components
// ============================================================================

const ChatContainer = styled.div<{ isMinimized: boolean; width: number }>`
  position: fixed;
  width: ${props => props.width}px;
  max-height: 600px;
  background: linear-gradient(135deg, #F5F5DC 0%, #FFF8DC 100%);
  border: 2px solid #D4AF37;
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(212, 175, 55, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease-out;
  z-index: 999999;
  backdrop-filter: blur(10px);

  ${props => props.isMinimized && css`
    max-height: 56px;
    overflow: hidden;
  `}
`;

const Header = styled.div`
  padding: 12px 16px;
  background: linear-gradient(180deg, #DC143C 0%, #B71C1C 100%);
  color: #FFF8DC;
  border-bottom: 2px solid #D4AF37;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ElementPreview = styled.div`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 12px;
`;

const IconButton = styled.button`
  background: rgba(255, 248, 220, 0.2);
  border: 1px solid rgba(255, 248, 220, 0.4);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FFF8DC;
  transition: all 0.2s ease;
  font-size: 16px;

  &:hover {
    background: rgba(255, 248, 220, 0.3);
    border-color: rgba(255, 248, 220, 0.6);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 31px,
    rgba(212, 175, 55, 0.1) 31px,
    rgba(212, 175, 55, 0.1) 32px
  );

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(212, 175, 55, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #D4AF37;
    border-radius: 4px;

    &:hover {
      background: #C4A037;
    }
  }
`;

const MessageBubble = styled.div<{ role: 'user' | 'assistant' }>`
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  animation: ${slideIn} 0.3s ease-out;
`;

const MessageContent = styled.div<{ role: 'user' | 'assistant' }>`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  ${props => props.role === 'user' ? css`
    background: linear-gradient(135deg, #DC143C 0%, #B71C1C 100%);
    color: #FFF8DC;
    border: 1px solid rgba(212, 175, 55, 0.3);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  ` : css`
    background: rgba(255, 255, 255, 0.9);
    color: #2C2C2C;
    border: 1px solid #D4AF37;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  `}
`;

const MessageTimestamp = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 4px;
  padding: 0 4px;
`;

const TypingIndicator = styled.div`
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #D4AF37;
  border-radius: 12px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;

  &::after {
    content: '...';
    animation: ${typingDots} 1.5s infinite;
  }
`;

const InputArea = styled.div`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-top: 2px solid #D4AF37;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  max-height: 120px;
  padding: 10px 12px;
  border: 2px solid #D4AF37;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: #FFFEF8;
  color: #2C2C2C;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #DC143C;
    box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const InputActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SendButton = styled.button<{ disabled: boolean }>`
  padding: 8px 20px;
  background: linear-gradient(135deg, #DC143C 0%, #B71C1C 100%);
  color: #FFF8DC;
  border: 2px solid #D4AF37;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  ${props => props.disabled ? css`
    opacity: 0.5;
    cursor: not-allowed;
  ` : css`
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `}
`;

const HintText = styled.div`
  font-size: 11px;
  color: #888;
  font-style: italic;
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: 0;
  top: 56px;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  background: transparent;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.3);
  }

  &::after {
    content: '';
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 40px;
    background: #D4AF37;
    border-radius: 2px;
    opacity: 0.5;
  }
`;

// ============================================================================
// Component
// ============================================================================

export const FloatingChat: React.FC<FloatingChatProps> = ({
  card,
  element,
  onClose,
  onMinimize,
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>(card.conversation || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [width, setWidth] = useState(400);

  // Refs
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const arrowRef = useRef(null);
  const resizingRef = useRef(false);
  const startWidthRef = useRef(0);
  const startXRef = useRef(0);

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    placement: 'right-start',
    strategy: 'fixed',
    middleware: [
      offset(10),
      flip(),
      shift({ padding: 10 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Set reference element
  useEffect(() => {
    refs.setReference({
      getBoundingClientRect: () => element.getBoundingClientRect(),
    });
  }, [element, refs]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messageListRef.current && !isMinimized) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading, isMinimized]);

  // Auto-save conversation to card
  useEffect(() => {
    card.conversation = messages;
  }, [messages, card]);

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get element preview text
  const getElementPreview = (): string => {
    const text = element.textContent?.trim() || '';
    const tag = element.tagName.toLowerCase();
    const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
    return preview ? `<${tag}> ${preview}` : `<${tag}>`;
  };

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatContext: ChatContext = {
        cardId: card.id,
        messages: [...messages, userMessage],
        isStreaming: true,
        currentInput: '',
      };

      // Stream response
      let fullResponse = '';
      const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      for await (const chunk of mockClaudeAPI.createStreamingResponse(input.trim(), chatContext)) {
        if (chunk.type === 'content_block_delta' && chunk.delta) {
          fullResponse += chunk.delta.text;

          // Update streaming message
          setMessages(prev => {
            const existing = prev.find(m => m.id === assistantMessageId);
            if (existing) {
              return prev.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: fullResponse }
                  : m
              );
            } else {
              return [
                ...prev,
                {
                  id: assistantMessageId,
                  role: 'assistant' as const,
                  content: fullResponse,
                  timestamp: Date.now(),
                  streaming: true,
                },
              ];
            }
          });
        }
      }

      // Finalize message
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId
            ? { ...m, streaming: false }
            : m
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, card.id]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [handleSend, onClose]);

  // Handle minimize toggle
  const handleMinimizeToggle = () => {
    setIsMinimized(prev => !prev);
    if (onMinimize) {
      onMinimize();
    }
  };

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    startWidthRef.current = width;
    startXRef.current = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;

      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.min(600, Math.max(300, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width]);

  return (
    <ChatContainer
      ref={refs.setFloating}
      style={floatingStyles}
      isMinimized={isMinimized}
      width={width}
    >
      <FloatingArrow
        ref={arrowRef}
        context={context}
        fill="#D4AF37"
        strokeWidth={2}
        stroke="#D4AF37"
      />

      <Header>
        <ElementPreview>{getElementPreview()}</ElementPreview>
        <HeaderActions>
          <IconButton
            onClick={handleMinimizeToggle}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '▲' : '▼'}
          </IconButton>
          <IconButton onClick={onClose} title="Close">
            ✕
          </IconButton>
        </HeaderActions>
      </Header>

      {!isMinimized && (
        <>
          <MessageList ref={messageListRef}>
            {messages.map(message => (
              <MessageBubble key={message.id} role={message.role}>
                <MessageContent role={message.role}>
                  {message.content}
                </MessageContent>
                <MessageTimestamp>
                  {formatTime(message.timestamp)}
                </MessageTimestamp>
              </MessageBubble>
            ))}

            {isLoading && (
              <MessageBubble role="assistant">
                <TypingIndicator>
                  Claude is thinking
                </TypingIndicator>
              </MessageBubble>
            )}
          </MessageList>

          <InputArea>
            <TextArea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this element..."
              disabled={isLoading}
            />
            <InputActions>
              <HintText>Press Enter to send, Shift+Enter for new line</HintText>
              <SendButton
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                Send
              </SendButton>
            </InputActions>
          </InputArea>

          <ResizeHandle onMouseDown={handleResizeStart} />
        </>
      )}
    </ChatContainer>
  );
};

export default FloatingChat;