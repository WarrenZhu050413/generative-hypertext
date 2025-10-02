/**
 * Element Chat Service
 *
 * Manages persistence of element-attached chat sessions.
 * Stores chat history and window state per element per page.
 */

import type {
  ElementChatSession,
  ElementChatsStorage,
  ChatMessage,
  ChatWindowState,
} from '@/types/elementChat';
import type { ElementDescriptor } from './elementIdService';

/**
 * Generate a unique chat session ID
 */
function generateChatId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `chat-${timestamp}-${random}`;
}

/**
 * Generate storage key for a page URL
 * Uses hash to keep key length manageable
 */
function getStorageKey(pageUrl: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < pageUrl.length; i++) {
    const char = pageUrl.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const hashStr = Math.abs(hash).toString(36);
  return `nabokov_element_chats_${hashStr}`;
}

/**
 * Load all element chats for a page
 */
export async function loadElementChatsForPage(pageUrl: string): Promise<ElementChatsStorage> {
  const key = getStorageKey(pageUrl);

  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      const stored = result[key] as ElementChatsStorage | undefined;

      if (stored) {
        console.log(
          `[elementChatService] Loaded ${Object.keys(stored.sessions).length} chats for page`
        );
        resolve(stored);
      } else {
        // No existing chats for this page
        const emptyStorage: ElementChatsStorage = {
          pageUrl,
          sessions: {},
          lastUpdated: Date.now(),
        };
        resolve(emptyStorage);
      }
    });
  });
}

/**
 * Save element chats for a page
 */
export async function saveElementChatsForPage(storage: ElementChatsStorage): Promise<void> {
  const key = getStorageKey(storage.pageUrl);
  storage.lastUpdated = Date.now();

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: storage }, () => {
      if (chrome.runtime.lastError) {
        console.error('[elementChatService] Save failed:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log(
          `[elementChatService] Saved ${Object.keys(storage.sessions).length} chats for page`
        );
        resolve();
      }
    });
  });
}

/**
 * Load a specific element chat session
 */
export async function loadElementChat(
  elementId: string,
  pageUrl: string
): Promise<ElementChatSession | null> {
  const storage = await loadElementChatsForPage(pageUrl);
  const session = storage.sessions[elementId];

  if (session) {
    console.log(`[elementChatService] Loaded chat for element ${elementId} with ${session.messages.length} messages`);
    return session;
  }

  console.log(`[elementChatService] No existing chat for element ${elementId}`);
  return null;
}

/**
 * Save or update an element chat session
 */
export async function saveElementChat(session: ElementChatSession): Promise<void> {
  session.lastActive = Date.now();

  const storage = await loadElementChatsForPage(session.pageUrl);
  storage.sessions[session.elementId] = session;

  await saveElementChatsForPage(storage);

  console.log(`[elementChatService] Saved chat for element ${session.elementId}`);
}

/**
 * Create a new element chat session
 */
export function createElementChatSession(
  elementId: string,
  pageUrl: string,
  elementDescriptor: ElementDescriptor,
  initialWindowState?: ChatWindowState
): ElementChatSession {
  const session: ElementChatSession = {
    chatId: generateChatId(),
    elementId,
    pageUrl,
    elementDescriptor,
    messages: [],
    windowState: initialWindowState,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };

  console.log(`[elementChatService] Created new chat session for element ${elementId}`);
  return session;
}

/**
 * Add a message to a chat session and save
 */
export async function addMessageToChat(
  session: ElementChatSession,
  role: 'user' | 'assistant',
  content: string
): Promise<ElementChatSession> {
  const message: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
  };

  session.messages.push(message);
  session.lastActive = Date.now();

  await saveElementChat(session);

  console.log(`[elementChatService] Added ${role} message to chat ${session.chatId}`);
  return session;
}

/**
 * Update window state for a chat session
 */
export async function updateChatWindowState(
  session: ElementChatSession,
  windowState: ChatWindowState
): Promise<void> {
  session.windowState = windowState;
  session.lastActive = Date.now();

  await saveElementChat(session);

  console.log(`[elementChatService] Updated window state for chat ${session.chatId}`);
}

/**
 * Delete an element chat session
 */
export async function deleteElementChat(elementId: string, pageUrl: string): Promise<void> {
  const storage = await loadElementChatsForPage(pageUrl);

  if (storage.sessions[elementId]) {
    delete storage.sessions[elementId];
    await saveElementChatsForPage(storage);
    console.log(`[elementChatService] Deleted chat for element ${elementId}`);
  }
}

/**
 * Get all element chat sessions for a page
 */
export async function getAllElementChats(pageUrl: string): Promise<ElementChatSession[]> {
  const storage = await loadElementChatsForPage(pageUrl);
  return Object.values(storage.sessions);
}

/**
 * Check if an element has an existing chat session
 */
export async function hasElementChat(elementId: string, pageUrl: string): Promise<boolean> {
  const session = await loadElementChat(elementId, pageUrl);
  return session !== null;
}

/**
 * Get count of messages in an element's chat
 */
export async function getElementChatMessageCount(
  elementId: string,
  pageUrl: string
): Promise<number> {
  const session = await loadElementChat(elementId, pageUrl);
  return session ? session.messages.length : 0;
}

/**
 * Clear old chat sessions (optional maintenance function)
 * Removes sessions older than specified days with no activity
 */
export async function clearOldChats(pageUrl: string, olderThanDays: number = 30): Promise<number> {
  const storage = await loadElementChatsForPage(pageUrl);
  const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

  let deletedCount = 0;
  const sessions = Object.entries(storage.sessions);

  for (const [elementId, session] of sessions) {
    if (session.lastActive < cutoffTime) {
      delete storage.sessions[elementId];
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    await saveElementChatsForPage(storage);
    console.log(`[elementChatService] Cleared ${deletedCount} old chat sessions`);
  }

  return deletedCount;
}
