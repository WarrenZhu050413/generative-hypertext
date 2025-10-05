/** @jsxImportSource @emotion/react */
/**
 * Element Chat Window
 *
 * Persistent chat window attached to a specific page element.
 * Automatically saves conversation history and window state.
 */

import { css } from '@emotion/react';
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import type { ElementChatSession, ChatMessage } from '@/types/elementChat';
import type { ElementDescriptor } from '@/services/elementIdService';
import type { Card } from '@/types/card';
import { ImageUploadZone } from '@/shared/components/ImageUpload/ImageUploadZone';
import { fileToBase64, getImageDimensions, isImageFile } from '@/utils/imageUpload';
import { findElementByDescriptor } from '@/services/elementIdService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ElementChatWindowProps {
  /** Element's chat ID */
  elementId: string;
  /** Element descriptors for positioning and context */
  elementDescriptors?: ElementDescriptor[];
  /** Primary element descriptor (fallback for legacy calls) */
  elementDescriptor?: ElementDescriptor;
  /** Existing chat session (if reopening) */
  existingSession?: ElementChatSession | null;
  /** Callback when window is closed */
  onClose: () => void;
  /** Initial position (if creating new window) */
  initialPosition?: { x: number; y: number };
  /** Selected text for text-contextual chat */
  selectedText?: string;
}

type PendingImage = {
  dataURL: string;
  width: number;
  height: number;
};

interface QueuedMessage {
  id: string;
  content: string;
  images?: PendingImage[];
  createdAt: number;
}

/**
 * ElementChatWindow Component
 */
export const ElementChatWindow: React.FC<ElementChatWindowProps> = ({
  elementId,
  elementDescriptors,
  elementDescriptor,
  existingSession,
  onClose,
  initialPosition,
  selectedText
}) => {
  const descriptorCandidates = useMemo(() => {
    if (existingSession?.elementDescriptors && existingSession.elementDescriptors.length > 0) {
      return existingSession.elementDescriptors;
    }
    if (elementDescriptors && elementDescriptors.length > 0) {
      return elementDescriptors;
    }
    if (existingSession?.elementDescriptor) {
      return [existingSession.elementDescriptor];
    }
    if (elementDescriptor) {
      return [elementDescriptor];
    }
    return [] as ElementDescriptor[];
  }, [existingSession, elementDescriptors, elementDescriptor]);

  const primaryDescriptor = descriptorCandidates[0];

  if (!primaryDescriptor) {
    console.error('[ElementChatWindow] Missing element descriptor for chat window');
    return null;
  }

  const descriptorList = useMemo(() => {
    if (descriptorCandidates.length === 0) {
      return [primaryDescriptor];
    }
    return descriptorCandidates;
  }, [descriptorCandidates, primaryDescriptor]);

  const descriptorMap = useMemo(() => {
    const map = new Map<string, ElementDescriptor>();
    descriptorList.forEach(descriptor => {
      map.set(descriptor.chatId, descriptor);
    });
    return map;
  }, [descriptorList]);
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
  const [anchorOffset, setAnchorOffset] = useState<{ x: number; y: number } | null>(
    existingSession?.windowState?.anchorOffset || null
  );
  const [queueExpanded, setQueueExpanded] = useState(
    existingSession?.windowState?.queueExpanded ?? false
  );
  const [clearPreviousAssistant, setClearPreviousAssistant] = useState(
    existingSession?.windowState?.clearPreviousAssistant ?? false
  );
  const [activeAnchorChatId, setActiveAnchorChatId] = useState(
    existingSession?.windowState?.activeAnchorChatId ?? primaryDescriptor.chatId
  );

  // Message queue for queueing messages sent during streaming
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [activeQueuedId, setActiveQueuedId] = useState<string | null>(null);
  const [anchorElementMissing, setAnchorElementMissing] = useState(false);

  // Image upload support
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<ElementChatSession | null>(existingSession || null);
  const isMountedRef = useRef(true);
  const anchorElementRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const positionRef = useRef(position);
  const windowSizeRef = useRef(windowSize);
  const collapsedRef = useRef(collapsed);
  const anchorOffsetRef = useRef<{ x: number; y: number } | null>(anchorOffset);
  const queueExpandedRef = useRef(queueExpanded);
  const clearPreviousAssistantRef = useRef(clearPreviousAssistant);
  const messageQueueRef = useRef<QueuedMessage[]>(messageQueue);
  const isProcessingQueueRef = useRef(isProcessingQueue);
  const isDraggingRef = useRef(false);
  const processQueueRef = useRef<(() => void) | null>(null);
  const activeAnchorChatIdRef = useRef(activeAnchorChatId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    windowSizeRef.current = windowSize;
  }, [windowSize]);

  useEffect(() => {
    collapsedRef.current = collapsed;
  }, [collapsed]);

  useEffect(() => {
    anchorOffsetRef.current = anchorOffset;
  }, [anchorOffset]);

  useEffect(() => {
    queueExpandedRef.current = queueExpanded;
  }, [queueExpanded]);

  useEffect(() => {
    clearPreviousAssistantRef.current = clearPreviousAssistant;
  }, [clearPreviousAssistant]);

  useEffect(() => {
    messageQueueRef.current = messageQueue;
  }, [messageQueue]);

  useEffect(() => {
    isProcessingQueueRef.current = isProcessingQueue;
  }, [isProcessingQueue]);

  const renderMarkdown = useCallback(
    (content: string) => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    ),
    []
  );

  useEffect(() => {
    activeAnchorChatIdRef.current = activeAnchorChatId;
  }, [activeAnchorChatId]);

  const ensureAnchorPosition = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    const priorityDescriptors: ElementDescriptor[] = [];
    if (activeAnchorChatIdRef.current) {
      const preferred = descriptorMap.get(activeAnchorChatIdRef.current);
      if (preferred) {
        priorityDescriptors.push(preferred);
      }
    }

    descriptorList.forEach(descriptor => {
      if (!priorityDescriptors.includes(descriptor)) {
        priorityDescriptors.push(descriptor);
      }
    });

    let resolvedDescriptor: ElementDescriptor | null = null;
    let element: HTMLElement | null = null;

    for (const descriptor of priorityDescriptors) {
      if (!descriptor) {
        continue;
      }
      const candidate = findElementByDescriptor(descriptor);
      if (candidate) {
        resolvedDescriptor = descriptor;
        element = candidate;
        break;
      }
    }

    if (!element) {
      anchorElementRef.current = null;
      if (!anchorElementMissing) {
        setAnchorElementMissing(true);
      }
      return;
    }

    anchorElementRef.current = element;

    if (anchorElementMissing) {
      setAnchorElementMissing(false);
    }

    if (resolvedDescriptor && resolvedDescriptor.chatId !== activeAnchorChatIdRef.current) {
      setActiveAnchorChatId(resolvedDescriptor.chatId);
    }

    const rect = element.getBoundingClientRect();

    if (!anchorOffsetRef.current) {
      const inferredOffset = {
        x: positionRef.current.x - rect.left,
        y: positionRef.current.y - rect.top
      };
      setAnchorOffset(inferredOffset);
      anchorOffsetRef.current = inferredOffset;
    }

    if (anchorOffsetRef.current && !isDraggingRef.current) {
      const nextPosition = {
        x: rect.left + anchorOffsetRef.current.x,
        y: rect.top + anchorOffsetRef.current.y
      };

      if (
        Math.abs(nextPosition.x - positionRef.current.x) > 0.5 ||
        Math.abs(nextPosition.y - positionRef.current.y) > 0.5
      ) {
        setPosition(nextPosition);
      }
    }
  }, [anchorElementMissing, descriptorList, descriptorMap]);

  useLayoutEffect(() => {
    ensureAnchorPosition();

    const handleUpdate = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        ensureAnchorPosition();
      });
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && anchorElementRef.current) {
      resizeObserver = new ResizeObserver(handleUpdate);
      resizeObserver.observe(anchorElementRef.current);
    }

    const mutationObserver = new MutationObserver(handleUpdate);
    mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      mutationObserver.disconnect();
    };
  }, [ensureAnchorPosition]);

  useEffect(() => {
    ensureAnchorPosition();
  }, [anchorOffset, ensureAnchorPosition]);

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

  /**
   * Save chat session (debounced)
   */
  const saveSession = useCallback((updatedMessages?: ChatMessage[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { saveElementChat, createElementChatSession } = await import('@/services/elementChatService');

        let session = sessionRef.current;
        if (!session) {
          session = createElementChatSession(
            elementId,
            window.location.href,
            primaryDescriptor,
            {
              position: positionRef.current,
              size: windowSizeRef.current,
              collapsed: collapsedRef.current,
              anchorOffset: anchorOffsetRef.current || undefined,
              queueExpanded: queueExpandedRef.current,
              clearPreviousAssistant: clearPreviousAssistantRef.current,
              activeAnchorChatId: activeAnchorChatIdRef.current
            },
            descriptorList
          );
          sessionRef.current = session;
        }

        session.messages = updatedMessages || messagesRef.current;
        session.windowState = {
          position: positionRef.current,
          size: windowSizeRef.current,
          collapsed: collapsedRef.current,
          anchorOffset: anchorOffsetRef.current || undefined,
          queueExpanded: queueExpandedRef.current,
          clearPreviousAssistant: clearPreviousAssistantRef.current,
          activeAnchorChatId: activeAnchorChatIdRef.current
        };

        await saveElementChat(session);
        console.log('[ElementChatWindow] Session saved:', elementId);
      } catch (error) {
        console.error('[ElementChatWindow] Failed to save session:', error);
      }
    }, 500);
  }, [primaryDescriptor, descriptorList, elementId]);

  // Save when messages, position, size, or collapsed state changes
  useEffect(() => {
    if (messages.length > 0 || sessionRef.current) {
      saveSession();
    }
  }, [messages, position, windowSize, collapsed, anchorOffset, queueExpanded, clearPreviousAssistant, saveSession]);

  const sendMessageToAPI = useCallback(
    async (userMessage: string, images: PendingImage[] = []) => {
      const trimmedMessage = userMessage.trim();
      const contentForStorage = trimmedMessage || (images.length > 0 ? '(Image attached)' : '');

      try {
        const { addMessageToChat, createElementChatSession } = await import('@/services/elementChatService');

        let session = sessionRef.current;
        if (!session) {
          session = createElementChatSession(
            elementId,
            window.location.href,
            primaryDescriptor,
            {
              position: positionRef.current,
              size: windowSizeRef.current,
              collapsed: collapsedRef.current,
              anchorOffset: anchorOffsetRef.current || undefined,
              queueExpanded: queueExpandedRef.current,
              clearPreviousAssistant: clearPreviousAssistantRef.current,
              activeAnchorChatId: activeAnchorChatIdRef.current
            },
            descriptorList
          );
          sessionRef.current = session;
        }

        await addMessageToChat(session, 'user', contentForStorage);

        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: 'user',
          content: contentForStorage,
          timestamp: Date.now(),
          images: images.length > 0 ? images : undefined
        };

        const newMessages: ChatMessage[] = [...messagesRef.current, newMessage];
        setMessages(newMessages);
        messagesRef.current = newMessages;
        setIsStreaming(true);

        const { chatWithPage } = await import('@/services/claudeAPIService');

        let systemPrompt: string;

        if (selectedText) {
          systemPrompt = `You are helping the user understand and discuss a specific text selection from a web page.\n\nSelected text:\n"${selectedText}"\n\nPage: ${window.location.href}\nPage title: ${document.title}\n\nAnswer questions about this text, explain concepts, provide context, or help the user understand its meaning.`;
        } else {
          systemPrompt = `You are chatting about page elements.\n\nPrimary element: <${primaryDescriptor.tagName}>${primaryDescriptor.id ? ` id="${primaryDescriptor.id}"` : ''}${primaryDescriptor.classes.length > 0 ? ` class="${primaryDescriptor.classes.join(' ')}"` : ''}\nText content: ${primaryDescriptor.textPreview}\nAttached elements (${descriptorList.length} total): ${descriptorList
            .map(descriptor => `<${descriptor.tagName}>${descriptor.id ? `#${descriptor.id}` : ''}`)
            .join(', ')}\n\nPage: ${window.location.href}\nPage title: ${document.title}\n\nAnswer questions about these elements, their purpose, or how they work.`;
        }

        let assistantContent = '';
        const stream = await chatWithPage(
          systemPrompt,
          [...newMessages].map(m => ({
            role: m.role,
            content: m.content,
            images: m.images
          }))
        );

        for await (const chunk of stream) {
          assistantContent += chunk;
          if (!isMountedRef.current) {
            return;
          }
          setStreamingContent(assistantContent);
        }

        if (!isMountedRef.current) {
          return;
        }

        if (clearPreviousAssistantRef.current && session.messages.length > 0) {
          for (let i = session.messages.length - 1; i >= 0; i--) {
            if (session.messages[i].role === 'assistant') {
              session.messages.splice(i, 1);
              break;
            }
          }
        }

        await addMessageToChat(session, 'assistant', assistantContent);

        const baseMessages = clearPreviousAssistantRef.current
          ? (() => {
              const cloned = [...newMessages];
              for (let i = cloned.length - 1; i >= 0; i--) {
                if (cloned[i].role === 'assistant') {
                  cloned.splice(i, 1);
                  break;
                }
              }
              return cloned;
            })()
          : newMessages;

        const finalMessages: ChatMessage[] = [
          ...baseMessages,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            role: 'assistant',
            content: assistantContent,
            timestamp: Date.now()
          }
        ];

        setMessages(finalMessages);
        messagesRef.current = finalMessages;
        setStreamingContent('');

      } catch (error) {
        console.error('[ElementChatWindow] Error sending message:', error);
        if (!isMountedRef.current) {
          return;
        }
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: 'assistant',
          content: '❌ Error: Could not connect to API. Please check your backend is running or API key is configured.',
          timestamp: Date.now()
        };
        setMessages(prev => {
          const next = [...prev, errorMessage];
          messagesRef.current = next;
          return next;
        });
      } finally {
        if (!isMountedRef.current) {
          return;
        }
        setIsStreaming(false);
        if (messageQueueRef.current.length > 0 && !isProcessingQueueRef.current && processQueueRef.current) {
          processQueueRef.current();
        }
      }
    }, [primaryDescriptor, descriptorList, elementId, selectedText]);

const processQueue = useCallback(async () => {
  if (!isMountedRef.current) {
    return;
  }
  if (messageQueueRef.current.length === 0 || isProcessingQueueRef.current) {
    return;
  }

  const [nextMessage, ...rest] = messageQueueRef.current;
  setMessageQueue(rest);
  messageQueueRef.current = rest;

  setIsProcessingQueue(true);
  isProcessingQueueRef.current = true;
  setActiveQueuedId(nextMessage.id);

  await sendMessageToAPI(nextMessage.content, nextMessage.images || []);

  setActiveQueuedId(null);
  setIsProcessingQueue(false);
  isProcessingQueueRef.current = false;

  if (messageQueueRef.current.length > 0) {
    setTimeout(() => {
      void processQueue();
    }, 100);
  }
}, [sendMessageToAPI]);

  useEffect(() => {
    processQueueRef.current = () => {
      void processQueue();
    };
  }, [processQueue]);

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

  const handleRemoveQueuedMessage = (id: string) => {
    setMessageQueue(prev => {
      const next = prev.filter(message => message.id !== id);
      messageQueueRef.current = next;
      return next;
    });
  };

  const handleClearQueue = () => {
    setMessageQueue([]);
    messageQueueRef.current = [];
    setActiveQueuedId(null);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && pendingImages.length === 0) return;

    const content = inputValue.trim() || (pendingImages.length > 0 ? '(Image attached)' : '');
    const imagesToSend = [...pendingImages];
    const queuedMessage: QueuedMessage = {
      id: `queued-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content,
      images: imagesToSend.length > 0 ? imagesToSend : undefined,
      createdAt: Date.now()
    };

    setInputValue('');
    setPendingImages([]);

    if (isStreaming || isProcessingQueueRef.current) {
      console.log('[ElementChatWindow] Queueing message (busy):', queuedMessage.content);
      setMessageQueue(prev => {
        const next = [...prev, queuedMessage];
        messageQueueRef.current = next;
        return next;
      });
      setQueueExpanded(true);
      return;
    }

    await sendMessageToAPI(queuedMessage.content, queuedMessage.images || []);
    if (messageQueueRef.current.length > 0) {
      void processQueue();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragStop = (_e: any, data: { x: number; y: number }) => {
    isDraggingRef.current = false;
    const nextPosition = { x: data.x, y: data.y };
    setPosition(nextPosition);

    if (anchorElementRef.current) {
      const rect = anchorElementRef.current.getBoundingClientRect();
      const offset = {
        x: nextPosition.x - rect.left,
        y: nextPosition.y - rect.top
      };
      setAnchorOffset(offset);
      anchorOffsetRef.current = offset;
    }
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

    if (anchorElementRef.current) {
      const rect = anchorElementRef.current.getBoundingClientRect();
      const offset = {
        x: newPosition.x - rect.left,
        y: newPosition.y - rect.top
      };
      setAnchorOffset(offset);
      anchorOffsetRef.current = offset;
    }
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleClearHistory = async () => {
    if (messagesRef.current.length === 0 && messageQueueRef.current.length === 0) {
      return;
    }

    const confirmed = window.confirm('Clear chat history for this element?');
    if (!confirmed) {
      return;
    }

    try {
      if (sessionRef.current) {
        const { clearElementChatHistory } = await import('@/services/elementChatService');
        sessionRef.current = await clearElementChatHistory(sessionRef.current);
      }

      setMessages([]);
      messagesRef.current = [];
      setStreamingContent('');
      handleClearQueue();
    } catch (error) {
      console.error('[ElementChatWindow] Failed to clear history:', error);
    }
  };

  /**
   * Save conversation to Stash
   */
  const handleSaveToStash = async () => {
    try {
      console.log('[ElementChatWindow] Saving conversation to Stash...');

      // Create card from conversation
      const card = await createCardFromConversation(true);

      console.log('[ElementChatWindow] Conversation saved to Stash successfully');

      // Show success message (could use a toast notification here)
      alert('💾 Conversation saved to Stash!');

    } catch (error) {
      console.error('[ElementChatWindow] Error saving to Stash:', error);
      alert('❌ Failed to save conversation to Stash');
    }
  };

  /**
   * Save conversation to Canvas
   */
  const handleSaveToCanvas = async () => {
    try {
      console.log('[ElementChatWindow] Saving conversation to Canvas...');

      // Create card from conversation
      const card = await createCardFromConversation(false);

      console.log('[ElementChatWindow] Conversation saved to Canvas successfully');

      // Show success message
      alert('🎨 Conversation saved to Canvas!');

    } catch (error) {
      console.error('[ElementChatWindow] Error saving to Canvas:', error);
      alert('❌ Failed to save conversation to Canvas');
    }
  };

  /**
   * Creates a Card from the current conversation
   */
  const createCardFromConversation = async (stashed: boolean) => {
    const { generateId } = await import('@/utils/storage');
    const { upsertCard } = await import('@/shared/services/cardService');

    // Build conversation HTML
    let conversationHTML = '<div class="element-chat-conversation">';

    // Add selected text banner if present
    if (selectedText) {
      conversationHTML += `
        <div style="background: linear-gradient(135deg, rgba(123, 44, 191, 0.1), rgba(199, 125, 255, 0.15));
                    padding: 12px;
                    border-left: 4px solid #9D4EDD;
                    margin-bottom: 16px;
                    border-radius: 4px;">
          <div style="font-weight: 600; color: #7B2CBF; font-size: 11px; text-transform: uppercase; margin-bottom: 8px;">
            📝 Selected Text
          </div>
          <div style="font-style: italic; color: #333; line-height: 1.5;">
            "${selectedText}"
          </div>
        </div>
      `;
    } else {
      // Add element info
      conversationHTML += `
        <div style="background: rgba(123, 44, 191, 0.05);
                    padding: 12px;
                    border-left: 4px solid #7B2CBF;
                    margin-bottom: 16px;
                    border-radius: 4px;">
          <div style="font-weight: 600; color: #7B2CBF; font-size: 11px; text-transform: uppercase; margin-bottom: 8px;">
            💬 Element Context
          </div>
          <div style="font-family: monospace; font-size: 12px; margin-bottom: 4px;">
            Primary: ${elementLabel}
          </div>
          <div style="color: #666; font-size: 12px; margin-bottom: ${descriptorList.length > 1 ? '8px' : '0'};">
            ${elementSummary}
          </div>
          ${descriptorList.length > 1 ? `
            <div style="font-size: 12px; color: #555;">
              <strong>Attached:</strong>
              <ul style="margin: 6px 0 0 16px; padding: 0;">
                ${descriptorList.slice(1).map(descriptor => `
                  <li style="line-height: 1.4;">&lt;${descriptor.tagName}${descriptor.id ? `#${descriptor.id}` : ''}${descriptor.classes.length ? '.' + descriptor.classes.slice(0, 2).join('.') : ''}&gt;</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Add messages
    for (const message of messages) {
      const isUser = message.role === 'user';
      conversationHTML += `
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600;
                      color: ${isUser ? '#7B2CBF' : '#9D4EDD'};
                      font-size: 11px;
                      text-transform: uppercase;
                      margin-bottom: 6px;">
            ${isUser ? 'You' : 'Assistant'}
          </div>
          <div style="background: ${isUser ? 'rgba(123, 44, 191, 0.08)' : 'rgba(157, 78, 221, 0.08)'};
                      padding: 10px;
                      border-radius: 6px;
                      line-height: 1.5;
                      color: #333;">
            ${message.content}
          </div>
        </div>
      `;
    }

    conversationHTML += '</div>';

    // Create card
    const card: Card = {
      id: generateId(),
      content: conversationHTML,
      metadata: {
        url: window.location.href,
        title: selectedText
          ? `Chat: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`
          : `Element Chat: ${elementLabel} – ${elementSummary}`,
        domain: window.location.hostname,
        favicon: '',
        timestamp: Date.now(),
        selector: primaryDescriptor.id ? `#${primaryDescriptor.id}` : primaryDescriptor.tagName,
        selectedText: selectedText
      },
      starred: false,
      tags: ['element-chat'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cardType: 'note' as const,
      stashed: stashed
    };

    // Save card
    await upsertCard(card);

    return card;
  };

  // Element context info
  const elementLabel = useMemo(() => {
    const parts: string[] = [`<${primaryDescriptor.tagName}`];
    if (primaryDescriptor.id) {
      parts.push(`#${primaryDescriptor.id}`);
    }
    if (primaryDescriptor.classes.length > 0) {
      const classes = primaryDescriptor.classes.slice(0, 3).join('.');
      parts.push(`.${classes}`);
      if (primaryDescriptor.classes.length > 3) {
        parts.push('…');
      }
    }
    return `${parts.join('')}>`;
  }, [primaryDescriptor]);

  const elementSummary = useMemo(() => {
    if (selectedText) {
      return selectedText.length > 60 ? `${selectedText.substring(0, 57)}...` : selectedText;
    }
    if (primaryDescriptor.textPreview) {
      return primaryDescriptor.textPreview.length > 60
        ? `${primaryDescriptor.textPreview.substring(0, 57)}...`
        : primaryDescriptor.textPreview;
    }
    return 'No text content';
  }, [primaryDescriptor.textPreview, selectedText]);

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
          <div css={headerTitleStyles} title={primaryDescriptor.cssSelector}>
            <span css={iconStyles}>💬</span>
            <div css={elementInfoStyles}>
              <span css={elementLabelStyles}>{elementLabel}</span>
              <span css={elementSummaryStyles}>{elementSummary}</span>
            </div>
            {hasHistory && <span css={messageCountStyles}>{messages.length}</span>}
          </div>
          <div css={headerActionsStyles}>
            {hasHistory && (
              <>
                <button
                  css={saveButtonStyles}
                  onClick={handleSaveToStash}
                  title="Save conversation to Stash"
                  disabled={isStreaming}
                >
                  📥
                </button>
                <button
                  css={saveButtonStyles}
                  onClick={handleSaveToCanvas}
                  title="Save conversation to Canvas"
                  disabled={isStreaming}
                >
                  🎨
                </button>
              </>
            )}
            <button
              css={headerButtonStyles}
              onClick={handleClearHistory}
              title="Clear chat history"
              disabled={messages.length === 0 && messageQueue.length === 0}
              data-test-id="clear-history"
            >
              🧹
            </button>
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
            >
              ✕
            </button>
          </div>
        </div>

        {!collapsed && (
          <div css={anchorChipRowStyles} data-test-id="element-anchor-list">
            {descriptorList.map((descriptor, index) => (
              <button
                key={descriptor.chatId}
                css={anchorChipStyles(descriptor.chatId === activeAnchorChatId)}
                onClick={() => {
                  activeAnchorChatIdRef.current = descriptor.chatId;
                  setActiveAnchorChatId(descriptor.chatId);
                  anchorOffsetRef.current = null;
                  setAnchorOffset(null);
                  ensureAnchorPosition();
                }}
                type="button"
              >
                #{index + 1} · &lt;{descriptor.tagName}{descriptor.id ? `#${descriptor.id}` : ''}&gt;
              </button>
            ))}
          </div>
        )}

        {/* Selected Text Banner (for text-contextual chat) */}
        {!collapsed && selectedText && (
          <div css={selectedTextBannerStyles}>
            <div css={selectedTextLabelStyles}>
              <span css={selectedTextIconStyles}>📝</span>
              <span>Selected Text</span>
            </div>
            <div css={selectedTextContentStyles}>
              "{selectedText.length > 200 ? selectedText.substring(0, 200) + '...' : selectedText}"
            </div>
          </div>
        )}

        {/* Messages */}
        {!collapsed && (
          <div css={messagesContainerStyles}>
            {messages.length === 0 && (
              <div css={emptyStateStyles}>
                <div css={emptyIconStyles}>{selectedText ? '📝' : '💬'}</div>
                <div css={emptyTitleStyles}>
                  {selectedText ? 'Discuss selected text' : 'Chat with this element'}
                </div>
                <div css={emptyDescStyles}>
                  {selectedText
                    ? 'Ask questions about the selected text, get explanations, or explore its meaning.'
                    : 'Ask questions about this element, its purpose, or how it works.'
                  }
                </div>
                {!selectedText && (
                  <>
                    <div css={emptyHintStyles}>
                      <strong>Element:</strong> {elementLabel}
                    </div>
                    <div css={emptyHintStyles} style={{ marginTop: '8px' }}>
                      <strong>Text:</strong> {elementSummary}
                    </div>
                  </>
                )}
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
                  {renderMarkdown(message.content)}
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <div css={messageStyles('assistant')}>
                <div css={messageRoleStyles}>Assistant</div>
              <div css={messageContentStyles}>
                {renderMarkdown(streamingContent)}
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
            {(messageQueue.length > 0 || isProcessingQueue) && (
              <div css={queueContainerStyles} data-expanded={queueExpanded ? 'true' : 'false'}>
                <div css={queueHeaderStyles}>
                  <button
                    css={queueToggleButtonStyles}
                    onClick={() => setQueueExpanded(prev => !prev)}
                    data-test-id="toggle-queue"
                  >
                    {queueExpanded ? `Hide queue (${messageQueue.length})` : `Show queue (${messageQueue.length})`}
                  </button>
                  <div css={queueHeaderActionsStyles}>
                    {isProcessingQueue && <span css={queueStatusStyles}>Processing…</span>}
                    {messageQueue.length > 0 && (
                      <button
                        css={queueClearButtonStyles}
                        onClick={handleClearQueue}
                        title="Clear queued messages"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {queueExpanded && messageQueue.length > 0 && (
                  <div css={queueListStyles} data-test-id="element-chat-queue-list">
                    {messageQueue.map(message => (
                      <div
                        key={message.id}
                        css={queueItemStyles}
                        data-active={message.id === activeQueuedId ? 'true' : 'false'}
                      >
                        <span css={queueItemTextStyles}>
                          {message.content}
                        </span>
                        <div css={queueItemActionsStyles}>
                          {message.images && message.images.length > 0 && (
                            <span css={queueBadgeStyles}>🖼️ {message.images.length}</span>
                          )}
                          <button
                            css={queueRemoveButtonStyles}
                            onClick={() => handleRemoveQueuedMessage(message.id)}
                            title="Remove from queue"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label css={queuePreferenceStyles}>
              <input
                type="checkbox"
                checked={clearPreviousAssistant}
                onChange={(e) => setClearPreviousAssistant(e.target.checked)}
              />
              <span>Replace last assistant reply when queue sends</span>
            </label>

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
  gap: 8px;
  flex: 1;
  overflow: hidden;
`;

const elementInfoStyles = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 240px;
`;

const elementLabelStyles = css`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  opacity: 0.95;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const elementSummaryStyles = css`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const saveButtonStyles = css`
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(224, 170, 255, 0.4);
  border-radius: 3px;
  padding: 3px 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.4);
    border-color: rgba(224, 170, 255, 0.6);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const selectedTextBannerStyles = css`
  background: linear-gradient(135deg, rgba(123, 44, 191, 0.05), rgba(199, 125, 255, 0.08));
  border-bottom: 2px solid rgba(123, 44, 191, 0.2);
  padding: 10px 12px;
  flex-shrink: 0;
`;

const selectedTextLabelStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 11px;
  color: #7B2CBF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const selectedTextIconStyles = css`
  font-size: 14px;
`;

const selectedTextContentStyles = css`
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  font-style: italic;
  padding: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-left: 3px solid #9D4EDD;
  border-radius: 4px;
  max-height: 100px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(123, 44, 191, 0.3);
    border-radius: 2px;
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
  color: #311c1c;
  word-break: break-word;

  p {
    margin: 0 0 8px 0;
  }

  ul,
  ol {
    margin: 0 0 8px 18px;
    padding: 0;
  }

  li {
    margin-bottom: 4px;
  }

  code {
    background: rgba(177, 60, 60, 0.12);
    padding: 2px 5px;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 12px;
  }

  pre {
    background: rgba(177, 60, 60, 0.08);
    padding: 10px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid rgba(177, 60, 60, 0.2);
  }

  a {
    color: #b02a2a;
    text-decoration: underline;
  }
`;

const cursorStyles = css`
  animation: blink 1s infinite;
  color: #b23232;

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
    background: #b23232;
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

const queueContainerStyles = css`
  background: #f7efed;
  border: 1px solid rgba(177, 60, 60, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const queueHeaderStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const queueToggleButtonStyles = css`
  background: rgba(177, 60, 60, 0.16);
  border: 1px solid rgba(177, 60, 60, 0.32);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: #7a2f2f;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(177, 60, 60, 0.25);
  }
`;

const queueHeaderActionsStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const queueStatusStyles = css`
  font-size: 11px;
  color: #a32020;
`;

const queueClearButtonStyles = css`
  background: rgba(177, 60, 60, 0.12);
  border: 1px solid rgba(177, 60, 60, 0.32);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 11px;
  color: #7a2f2f;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(177, 60, 60, 0.22);
  }
`;

const queueListStyles = css`
  max-height: 160px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(177, 60, 60, 0.35);
    border-radius: 4px;
  }
`;

const queueItemStyles = css`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
  padding: 6px 8px;
  border: 1px solid rgba(177, 60, 60, 0.28);
  border-radius: 8px;
  background: #ffffff;
  font-size: 12px;

  &[data-active='true'] {
    border-color: rgba(177, 60, 60, 0.55);
    box-shadow: 0 0 0 1px rgba(177, 60, 60, 0.3);
  }
`;

const queueItemTextStyles = css`
  flex: 1;
  color: #7a3b3b;
  white-space: pre-wrap;
  word-break: break-word;
`;

const queueItemActionsStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const queueBadgeStyles = css`
  background: rgba(177, 60, 60, 0.16);
  color: #7a2f2f;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 11px;
`;

const queueRemoveButtonStyles = css`
  background: rgba(177, 60, 60, 0.1);
  border: 1px solid rgba(177, 60, 60, 0.3);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 11px;
  color: #912d2d;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(177, 60, 60, 0.18);
  }
`;

const queuePreferenceStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #7a2f2f;
  margin: 4px 0 8px;

  input {
    margin: 0;
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
const anchorChipRowStyles = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px 0 16px;
`;

const anchorChipStyles = (active: boolean) => css`
  border: 1px solid ${active ? 'rgba(177, 50, 50, 0.55)' : 'rgba(177, 50, 50, 0.28)'};
  background: ${active ? 'rgba(177, 50, 50, 0.16)' : 'rgba(177, 50, 50, 0.08)'};
  color: #752525;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(177, 50, 50, 0.55);
    background: rgba(177, 50, 50, 0.2);
  }
`;
