import { useState, useCallback } from 'react';
import type { Message, ImageAttachment } from '@/shared/types/chat';

/**
 * Options for useChatMessages hook
 */
export interface UseChatMessagesOptions {
  /** System prompt / context for the conversation */
  systemPrompt: string;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Return type for useChatMessages hook
 */
export interface UseChatMessagesReturn {
  /** Array of messages in the conversation */
  messages: Message[];
  /** Current input value */
  inputValue: string;
  /** Whether a response is currently streaming */
  isStreaming: boolean;
  /** Current streaming content */
  streamingContent: string;
  /** Pending images to attach to next message */
  pendingImages: ImageAttachment[];
  /** Set the input value */
  setInputValue: (value: string) => void;
  /** Send a message */
  sendMessage: () => Promise<void>;
  /** Stop streaming */
  stopStreaming: () => void;
  /** Clear all messages */
  clearChat: () => void;
  /** Add a pending image */
  addPendingImage: (image: ImageAttachment) => void;
  /** Remove a pending image */
  removePendingImage: (index: number) => void;
}

/**
 * Hook for managing chat messages and state
 * Handles message state, streaming, and image attachments
 */
export function useChatMessages(options: UseChatMessagesOptions): UseChatMessagesReturn {
  const { systemPrompt, onError } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [pendingImages, setPendingImages] = useState<ImageAttachment[]>([]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() && pendingImages.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim() || '(Image attached)',
      timestamp: Date.now(),
      images: pendingImages.length > 0 ? [...pendingImages] : undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setPendingImages([]);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const hasImages = userMessage.images && userMessage.images.length > 0;

      if (hasImages) {
        // Multimodal message (non-streaming)
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

        console.log('[useChatMessages] Sending multimodal message');

        const response = await claudeAPIService.sendMessage(
          claudeMessages,
          { system: systemPrompt, maxTokens: 4096 }
        );

        setMessages([...newMessages, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        }]);
      } else {
        // Text-only message (streaming)
        const { chatWithPage } = await import('@/services/claudeAPIService');

        let content = '';
        const stream = await chatWithPage(
          systemPrompt,
          newMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        );

        // Stream response
        for await (const chunk of stream) {
          content += chunk;
          setStreamingContent(content);
        }

        setMessages([...newMessages, {
          id: Date.now().toString(),
          role: 'assistant',
          content,
          timestamp: Date.now()
        }]);
        setStreamingContent('');
      }
    } catch (error) {
      console.error('[useChatMessages] Error sending message:', error);
      setMessages([
        ...newMessages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '❌ Error: Could not connect to API. Please check your backend is running or API key is configured.',
          timestamp: Date.now()
        }
      ]);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [messages, inputValue, pendingImages, systemPrompt, onError]);

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    setStreamingContent('');
    // Note: Actual stream abortion would require storing the stream reference
    // For now, just stop updating the UI
  }, []);

  /**
   * Clear all messages
   */
  const clearChat = useCallback(() => {
    if (messages.length > 0 && confirm('Clear conversation?')) {
      setMessages([]);
      setStreamingContent('');
    }
  }, [messages.length]);

  /**
   * Add a pending image
   */
  const addPendingImage = useCallback((image: ImageAttachment) => {
    setPendingImages(prev => [...prev, image]);
  }, []);

  /**
   * Remove a pending image
   */
  const removePendingImage = useCallback((index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    messages,
    inputValue,
    isStreaming,
    streamingContent,
    pendingImages,
    setInputValue,
    sendMessage,
    stopStreaming,
    clearChat,
    addPendingImage,
    removePendingImage
  };
}
