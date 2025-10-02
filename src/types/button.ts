/**
 * Button types for card action buttons
 */

import type { ConnectionType } from './connection';

export interface CardButton {
  id: string;
  label: string;
  icon: string;
  prompt: string; // Template with {{content}}, {{title}}, {{customContext}}
  connectionType: ConnectionType;
  enabled: boolean;
}
