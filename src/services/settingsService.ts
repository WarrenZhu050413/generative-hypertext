/**
 * Settings Service
 * Manages user preferences and application settings
 */

const SETTINGS_STORAGE_KEY = 'nabokov_settings';

export interface AppSettings {
  autoBeautify: boolean; // Automatically beautify cards when captured
  autoBeautifyMode?: 'organize-content'; // Which beautification mode to use
}

const DEFAULT_SETTINGS: AppSettings = {
  autoBeautify: false,
  autoBeautifyMode: 'organize-content',
};

export class SettingsService {
  /**
   * Get all settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const result = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
      return {
        ...DEFAULT_SETTINGS,
        ...(result[SETTINGS_STORAGE_KEY] || {}),
      };
    } catch (error) {
      console.error('[SettingsService] Error retrieving settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update settings
   */
  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = {
        ...currentSettings,
        ...settings,
      };
      await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: newSettings });
      console.log('[SettingsService] Settings updated:', newSettings);

      // Dispatch event for any listeners
      window.dispatchEvent(new CustomEvent('nabokov:settings-updated', {
        detail: newSettings,
      }));
    } catch (error) {
      console.error('[SettingsService] Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Get auto-beautify setting
   */
  async getAutoBeautify(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.autoBeautify;
  }

  /**
   * Set auto-beautify setting
   */
  async setAutoBeautify(enabled: boolean): Promise<void> {
    await this.updateSettings({ autoBeautify: enabled });
  }

  /**
   * Get auto-beautify mode
   */
  async getAutoBeautifyMode(): Promise<'organize-content'> {
    const settings = await this.getSettings();
    return settings.autoBeautifyMode || 'organize-content';
  }

  /**
   * Reset all settings to defaults
   */
  async resetSettings(): Promise<void> {
    try {
      await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: DEFAULT_SETTINGS });
      console.log('[SettingsService] Settings reset to defaults');

      window.dispatchEvent(new CustomEvent('nabokov:settings-updated', {
        detail: DEFAULT_SETTINGS,
      }));
    } catch (error) {
      console.error('[SettingsService] Error resetting settings:', error);
      throw error;
    }
  }
}

// Singleton instance
export const settingsService = new SettingsService();
