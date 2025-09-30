/**
 * ChatModal Component
 *
 * A modal dialog for re-engaging with cards in the Canvas, allowing users
 * to continue conversations and interact with clipped content.
 * Features Chinese aesthetic styling with paper-like textures and gold accents.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import type { Card, Message, ChatContext } from '@/types/card';
import { mockClaudeAPI } from '../utils/mockClaudeAPI';

// ============================================================================
// Types
// ============================================================================

export interface ChatModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
}

// ============================================================================
// Animations
// ============================================================================

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;

const slideInMessage = keyframes`
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

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  background: linear-gradient(135deg, #F5F5DC 0%, #FFF8DC 100%);
  border: 2px solid #D4AF37;
  border-radius: 16px;
  box-shadow:
    0 16px 64px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.3s ease-out;
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 85vh;
  }
`;

const Header = styled.div`
  padding: 16px 20px;
  background: linear-gradient(180deg, #DC143C 0%, #B71C1C 100%);
  color: #FFF8DC;
  border-bottom: 2px solid #D4AF37;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const CardDomain = styled.div`
  font-size: 12px;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CloseButton = styled.button`
  background: rgba(255, 248, 220, 0.2);
  border: 1px solid rgba(255, 248, 220, 0.4);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FFF8DC;
  font-size: 20px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 16px;

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
  padding: 20px;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 31px,
    rgba(212, 175, 55, 0.08) 31px,
    rgba(212, 175, 55, 0.08) 32px
  );
  min-height: 200px;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(212, 175, 55, 0.1);
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #D4AF37;
    border-radius: 5px;

    &:hover {
      background: #C4A037;
    }
  }
`;

const MessageBubble = styled.div<{ role: 'user' | 'assistant' }>`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  animation: ${slideInMessage} 0.3s ease-out;
`;

const MessageContent = styled.div<{ role: 'user' | 'assistant' }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;

  ${props => props.role === 'user' ? `
    background: linear-gradient(135deg, #DC143C 0%, #B71C1C 100%);
    color: #FFF8DC;
    border: 1px solid rgba(212, 175, 55, 0.3);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  ` : `
    background: rgba(255, 255, 255, 0.95);
    color: #2C2C2C;
    border: 1px solid #D4AF37;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  `}

  @media (max-width: 768px) {
    max-width: 90%;
  }
`;

const MessageTimestamp = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 6px;
  padding: 0 4px;
`;

const TypingIndicator = styled.div`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
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
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.6);
  border-top: 2px solid #D4AF37;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  max-height: 150px;
  padding: 12px 14px;
  border: 2px solid #D4AF37;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: #FFFEF8;
  color: #2C2C2C;
  transition: all 0.2s ease;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #DC143C;
    box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.1);
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InputActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HintText = styled.div`
  font-size: 11px;
  color: #888;
  font-style: italic;
  flex: 1;
`;

const SendButton = styled.button<{ disabled: boolean }>`
  padding: 10px 24px;
  background: linear-gradient(135deg, #DC143C 0%, #B71C1C 100%);
  color: #FFF8DC;
  border: 2px solid #D4AF37;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  white-space: nowrap;

  ${props => props.disabled ? `
    opacity: 0.5;
    cursor: not-allowed;
  ` : `
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }
  `}
`;

const Footer = styled.div`
  padding: 12px 20px;
  background: rgba(255, 248, 220, 0.3);
  border-top: 1px solid rgba(212, 175, 55, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #8B7355;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8B7355;
  text-align: center;
  gap: 12px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  max-width: 300px;
`;

// ============================================================================
// Component
// ============================================================================

export const ChatModal: React.FC<ChatModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Initialize messages from card conversation
  useEffect(() => {
    if (card && card.conversation) {
      setMessages(card.conversation);
    } else {
      setMessages([]);
    }
  }, [card]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isOpen]);

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !card) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const chatContext: ChatContext = {
        cardId: card.id,
        messages: updatedMessages,
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
      const finalMessages = updatedMessages.concat([{
        id: assistantMessageId,
        role: 'assistant' as const,
        content: fullResponse,
        timestamp: Date.now(),
      }]);

      setMessages(finalMessages);

      // Save conversation back to card
      onUpdateCard(card.id, { conversation: finalMessages });

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
  }, [input, isLoading, messages, card, onUpdateCard]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [handleSend, onClose]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!card) return null;

  return (
    <Overlay
      ref={overlayRef}
      isOpen={isOpen}
      onClick={handleOverlayClick}
    >
      <ModalDialog onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <Header>
          <HeaderInfo>
            <CardTitle>{card.metadata.title}</CardTitle>
            <CardDomain>{card.metadata.domain}</CardDomain>
          </HeaderInfo>
          <CloseButton onClick={onClose} title="Close">
            ✕
          </CloseButton>
        </Header>

        {/* Message List */}
        <MessageList ref={messageListRef}>
          {messages.length === 0 ? (
            <EmptyState>
              <EmptyIcon>💬</EmptyIcon>
              <EmptyText>
                Start a conversation about this card. Ask questions, request summaries, or explore the content.
              </EmptyText>
            </EmptyState>
          ) : (
            messages.map(message => (
              <MessageBubble key={message.id} role={message.role}>
                <MessageContent role={message.role}>
                  {message.content}
                </MessageContent>
                <MessageTimestamp>
                  {formatTime(message.timestamp)}
                </MessageTimestamp>
              </MessageBubble>
            ))
          )}

          {isLoading && (
            <MessageBubble role="assistant">
              <TypingIndicator>
                Claude is thinking
              </TypingIndicator>
            </MessageBubble>
          )}
        </MessageList>

        {/* Input Area */}
        <InputArea>
          <TextArea
            ref={textAreaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this card..."
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

        {/* Footer */}
        <Footer>
          <div>Created: {new Date(card.createdAt).toLocaleDateString()}</div>
          <div>{messages.length} message{messages.length !== 1 ? 's' : ''}</div>
        </Footer>
      </ModalDialog>
    </Overlay>
  );
};

export default ChatModal;