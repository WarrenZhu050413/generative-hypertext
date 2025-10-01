/**
 * Connection storage utilities for card-to-card relationships
 */

import type { CardConnection } from '@/types/connection';

const CONNECTIONS_KEY = 'card_connections';

/**
 * Save all connections to chrome.storage.local
 */
export async function saveConnections(connections: CardConnection[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [CONNECTIONS_KEY]: connections });
    console.log(`[connectionStorage] Saved ${connections.length} connections`);
  } catch (error) {
    console.error('[connectionStorage] Error saving connections:', error);
    throw error;
  }
}

/**
 * Load all connections from chrome.storage.local
 */
export async function loadConnections(): Promise<CardConnection[]> {
  try {
    const result = await chrome.storage.local.get(CONNECTIONS_KEY);
    const connections = result[CONNECTIONS_KEY] || [];
    console.log(`[connectionStorage] Loaded ${connections.length} connections`);
    return connections;
  } catch (error) {
    console.error('[connectionStorage] Error loading connections:', error);
    return [];
  }
}

/**
 * Add a single connection
 */
export async function addConnection(connection: CardConnection): Promise<void> {
  try {
    const connections = await loadConnections();
    connections.push(connection);
    await saveConnections(connections);
  } catch (error) {
    console.error('[connectionStorage] Error adding connection:', error);
    throw error;
  }
}

/**
 * Remove a connection by ID
 */
export async function removeConnection(connectionId: string): Promise<void> {
  try {
    const connections = await loadConnections();
    const filtered = connections.filter(c => c.id !== connectionId);
    await saveConnections(filtered);
  } catch (error) {
    console.error('[connectionStorage] Error removing connection:', error);
    throw error;
  }
}

/**
 * Remove all connections involving a specific card
 */
export async function removeConnectionsByCard(cardId: string): Promise<void> {
  try {
    const connections = await loadConnections();
    const filtered = connections.filter(c => c.source !== cardId && c.target !== cardId);
    await saveConnections(filtered);
  } catch (error) {
    console.error('[connectionStorage] Error removing connections by card:', error);
    throw error;
  }
}

/**
 * Get all connections for a specific card
 */
export async function getConnectionsForCard(cardId: string): Promise<CardConnection[]> {
  try {
    const connections = await loadConnections();
    return connections.filter(c => c.source === cardId || c.target === cardId);
  } catch (error) {
    console.error('[connectionStorage] Error getting connections for card:', error);
    return [];
  }
}
