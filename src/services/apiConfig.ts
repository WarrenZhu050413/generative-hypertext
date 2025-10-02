/**
 * API Configuration Service
 * Manages Claude API key storage and retrieval
 */

const API_KEY_STORAGE_KEY = 'nabokov_claude_api_key';

export interface APIConfig {
  apiKey: string | null;
}

/**
 * API Configuration Service
 * Manages secure storage of API keys in chrome.storage.local
 */
export class APIConfigService {
  /**
   * Get the stored API key
   */
  async getAPIKey(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get(API_KEY_STORAGE_KEY);
      return result[API_KEY_STORAGE_KEY] || null;
    } catch (error) {
      console.error('[APIConfig] Error retrieving API key:', error);
      return null;
    }
  }

  /**
   * Set the API key
   */
  async setAPIKey(apiKey: string): Promise<void> {
    try {
      await chrome.storage.local.set({ [API_KEY_STORAGE_KEY]: apiKey });
      console.log('[APIConfig] API key saved successfully');
    } catch (error) {
      console.error('[APIConfig] Error saving API key:', error);
      throw error;
    }
  }

  /**
   * Check if API key is configured
   */
  async hasAPIKey(): Promise<boolean> {
    const apiKey = await this.getAPIKey();
    return apiKey !== null && apiKey.trim().length > 0;
  }

  /**
   * Clear the stored API key
   */
  async clearAPIKey(): Promise<void> {
    try {
      await chrome.storage.local.remove(API_KEY_STORAGE_KEY);
      console.log('[APIConfig] API key cleared');
    } catch (error) {
      console.error('[APIConfig] Error clearing API key:', error);
      throw error;
    }
  }
}

// Singleton instance
export const apiConfigService = new APIConfigService();
