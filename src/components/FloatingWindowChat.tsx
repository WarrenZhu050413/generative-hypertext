/** @jsxImportSource @emotion/react */
import React from 'react';
import type { Message } from '@/types/card';
import { BaseChatUI } from '@/shared/components/Chat/BaseChatUI';

/**
 * Props for FloatingWindowChat component
 */
export interface FloatingWindowChatProps {
  cardId: string;
  cardContent: string;
  messages: Message[];
  currentInput: string;
  isStreaming: boolean;
  streamingContent?: string;
  autoSaveOnClose: boolean;
  onSendMessage: () => void;
  onInputChange: (value: string) => void;
  onStopStreaming: () => void;
  onClearChat: () => void;
  onSaveConversation: () => void;
  onToggleAutoSave: (enabled: boolean) => void;
}

/**
 * Chat interface component for floating windows
 * Wraps BaseChatUI with floating window-specific features
 */
export const FloatingWindowChat: React.FC<FloatingWindowChatProps> = ({
  messages,
  currentInput,
  isStreaming,
  streamingContent,
  autoSaveOnClose,
  onSendMessage,
  onInputChange,
  onStopStreaming,
  onClearChat,
  onSaveConversation,
  onToggleAutoSave
}) => {
  return (
    <BaseChatUI
      messages={messages}
      currentInput={currentInput}
      isStreaming={isStreaming}
      streamingContent={streamingContent}
      pendingImages={[]} // Floating windows don't support image upload yet
      onSendMessage={onSendMessage}
      onInputChange={onInputChange}
      onStopStreaming={onStopStreaming}
      onClearChat={onClearChat}
      placeholder="Ask about this card..."
      showSaveControls={true}
      onSaveConversation={onSaveConversation}
      autoSaveOnClose={autoSaveOnClose}
      onToggleAutoSave={onToggleAutoSave}
    />
  );
};
