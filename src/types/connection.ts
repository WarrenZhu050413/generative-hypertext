/**
 * Types for card-to-card connections (edges)
 */

export type ConnectionType = 'generated-from' | 'references' | 'related' | 'contradicts' | 'custom';

export interface CardConnection {
  id: string;
  source: string; // Source card ID
  target: string; // Target card ID
  type: ConnectionType;
  label?: string;
  metadata?: {
    createdAt: number;
    createdBy: 'user' | 'ai';
    note?: string;
  };
}

export interface SerializedConnection {
  id: string;
  source: string;
  target: string;
  type: ConnectionType;
  label?: string;
  metadata?: {
    createdAt: number;
    createdBy: 'user' | 'ai';
    note?: string;
  };
}
