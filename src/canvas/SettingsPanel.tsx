/**
 * Settings Panel Component
 *
 * Provides a comprehensive settings interface for:
 * - Keyboard shortcuts customization
 * - Theme preferences
 * - Storage management
 * - Export/import configuration
 */

import React, { useState, useEffect } from 'react';
import {
  ShortcutConfig,
  formatShortcut,
  loadShortcutsConfig,
  saveShortcutsConfig,
  DEFAULT_SHORTCUTS,
  ShortcutCategory,
} from '@/utils/keyboardShortcuts';
import type { StorageStats } from '@/types/card';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StorageStats | null;
  onRefreshStats: () => Promise<void>;
}

type SettingsTab = 'shortcuts' | 'theme' | 'storage' | 'advanced';

const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  navigation: 'Navigation',
  canvas: 'Canvas',
  filters: 'Filters',
  view: 'View Controls',
};

export function SettingsPanel({ isOpen, onClose, stats, onRefreshStats }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('shortcuts');
  const [shortcutsConfig, setShortcutsConfig] = useState<ShortcutConfig>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings on mount
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const config = await loadShortcutsConfig();
      setShortcutsConfig(config);

      // Load theme preference
      const result = await chrome.storage.local.get('nabokov_theme');
      setTheme(result.nabokov_theme || 'light');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveShortcuts = async () => {
    try {
      setIsSaving(true);
      await saveShortcutsConfig(shortcutsConfig);
      setSaveMessage('Shortcuts saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save shortcuts:', error);
      setSaveMessage('Failed to save shortcuts');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleShortcut = (id: string) => {
    const current = shortcutsConfig[id];
    const defaultShortcut = DEFAULT_SHORTCUTS[id];

    setShortcutsConfig({
      ...shortcutsConfig,
      [id]: {
        key: current?.key || defaultShortcut.key,
        modifier: current?.modifier || defaultShortcut.modifier,
        enabled: !(current?.enabled ?? true),
      },
    });
  };

  const handleExportSettings = async () => {
    try {
      const data = await chrome.storage.local.get(null);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nabokov-settings-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await chrome.storage.local.set(data);
      setSaveMessage('Settings imported successfully');
      loadSettings();
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to import settings:', error);
      setSaveMessage('Failed to import settings');
    }
  };

  const handleClearStorage = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }

    try {
      await chrome.storage.local.clear();
      setSaveMessage('Storage cleared successfully');
      onRefreshStats();
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      setSaveMessage('Failed to clear storage');
    }
  };

  const handleExportData = async () => {
    try {
      const result = await chrome.storage.local.get('nabokov_cards');
      const cards = result.nabokov_cards || [];
      const jsonString = JSON.stringify(cards, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nabokov-cards-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getUsagePercent = (): number => {
    if (!stats) return 0;
    return (stats.bytesUsed / stats.quotaBytes) * 100;
  };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.panel} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        {/* Header */}
        <div style={styles.header}>
          <h2 id="settings-title" style={styles.title}>
            Settings
          </h2>
          <button style={styles.closeButton} onClick={onClose} aria-label="Close settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={activeTab === 'shortcuts' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => setActiveTab('shortcuts')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={styles.tabIcon}>
              <path
                d="M5 7h10M5 10h10M5 13h6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Shortcuts
          </button>
          <button
            style={activeTab === 'theme' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => setActiveTab('theme')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={styles.tabIcon}>
              <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.66 4.34l-1.41 1.41M5.75 14.25l-1.41 1.41M15.66 15.66l-1.41-1.41M5.75 5.75L4.34 4.34"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Theme
          </button>
          <button
            style={activeTab === 'storage' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => setActiveTab('storage')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={styles.tabIcon}>
              <rect
                x="3"
                y="4"
                width="14"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Storage
          </button>
          <button
            style={activeTab === 'advanced' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => setActiveTab('advanced')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={styles.tabIcon}>
              <path
                d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M16.5 10c0-.4 0-.7-.1-1l1.4-.9c.2-.1.3-.4.2-.6l-1.5-2.6c-.1-.2-.3-.3-.5-.2l-1.7.7c-.3-.2-.6-.4-.9-.5l-.3-1.8c0-.2-.2-.4-.4-.4H9.3c-.2 0-.4.2-.4.4l-.3 1.8c-.3.1-.6.3-.9.5l-1.7-.7c-.2-.1-.4 0-.5.2l-1.5 2.6c-.1.2 0 .5.2.6l1.4.9c-.1.3-.1.6-.1 1s0 .7.1 1l-1.4.9c-.2.1-.3.4-.2.6l1.5 2.6c.1.2.3.3.5.2l1.7-.7c.3.2.6.4.9.5l.3 1.8c0 .2.2.4.4.4h2.8c.2 0 .4-.2.4-.4l.3-1.8c.3-.1.6-.3.9-.5l1.7.7c.2.1.4 0 .5-.2l1.5-2.6c.1-.2 0-.5-.2-.6l-1.4-.9c.1-.3.1-.6.1-1z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Advanced
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeTab === 'shortcuts' && (
            <div style={styles.tabContent}>
              <p style={styles.description}>
                Customize keyboard shortcuts to match your workflow. Toggle shortcuts on/off or
                modify them to your preference.
              </p>

              {(['navigation', 'view', 'filters', 'canvas'] as ShortcutCategory[]).map((category) => {
                const shortcuts = Object.entries(DEFAULT_SHORTCUTS)
                  .filter(([_, s]) => s.category === category)
                  .map(([shortcutId, s]) => ({ shortcutId, ...s }));

                if (shortcuts.length === 0) return null;

                return (
                  <div key={category} style={styles.shortcutCategory}>
                    <h3 style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</h3>
                    <div style={styles.shortcutList}>
                      {shortcuts.map((shortcut) => {
                        const config = shortcutsConfig[shortcut.shortcutId];
                        const isEnabled = config?.enabled ?? true;

                        return (
                          <div key={shortcut.shortcutId} style={styles.shortcutRow}>
                            <div style={styles.shortcutInfo}>
                              <span style={styles.shortcutDesc}>{shortcut.description}</span>
                              <kbd style={styles.kbd}>
                                {formatShortcut(
                                  config?.key || shortcut.key,
                                  config?.modifier || shortcut.modifier
                                )}
                              </kbd>
                            </div>
                            <label style={styles.toggle}>
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => handleToggleShortcut(shortcut.shortcutId)}
                                style={styles.checkbox}
                              />
                              <span style={styles.toggleSlider} />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div style={styles.actions}>
                <button style={styles.primaryButton} onClick={handleSaveShortcuts} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Shortcuts'}
                </button>
                {saveMessage && <span style={styles.saveMessage}>{saveMessage}</span>}
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div style={styles.tabContent}>
              <p style={styles.description}>Customize the appearance of your canvas.</p>
              <div style={styles.themeSection}>
                <h3 style={styles.sectionTitle}>Color Theme</h3>
                <div style={styles.themeOptions}>
                  <label style={styles.themeOption}>
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={theme === 'light'}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                      style={styles.radio}
                    />
                    <div style={styles.themeCard}>
                      <div style={styles.themePreview}>
                        <div style={{ ...styles.themePreviewInner, background: '#FAF7F2' }} />
                      </div>
                      <span style={styles.themeLabel}>Light (Default)</span>
                    </div>
                  </label>
                  <label style={styles.themeOption}>
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={theme === 'dark'}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                      style={styles.radio}
                    />
                    <div style={styles.themeCard}>
                      <div style={styles.themePreview}>
                        <div style={{ ...styles.themePreviewInner, background: '#2B2520' }} />
                      </div>
                      <span style={styles.themeLabel}>Dark (Coming Soon)</span>
                    </div>
                  </label>
                </div>
                <p style={styles.note}>Note: Dark theme support is under development</p>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div style={styles.tabContent}>
              <p style={styles.description}>
                Monitor your storage usage and manage your data.
              </p>

              {stats && (
                <div style={styles.storageStats}>
                  <h3 style={styles.sectionTitle}>Storage Usage</h3>
                  <div style={styles.storageBar}>
                    <div
                      style={{
                        ...styles.storageBarFill,
                        width: `${getUsagePercent()}%`,
                        background:
                          getUsagePercent() > 80
                            ? '#E74C3C'
                            : getUsagePercent() > 50
                            ? '#F39C12'
                            : '#27AE60',
                      }}
                    />
                  </div>
                  <div style={styles.storageInfo}>
                    <span style={styles.storageText}>
                      {formatBytes(stats.bytesUsed)} / {formatBytes(stats.quotaBytes)}
                    </span>
                    <span style={styles.storagePercent}>{getUsagePercent().toFixed(1)}%</span>
                  </div>
                  <div style={styles.storageDetails}>
                    <div style={styles.statRow}>
                      <span style={styles.statLabel}>Total Cards:</span>
                      <span style={styles.statValue}>{stats.totalCards}</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.storageActions}>
                <h3 style={styles.sectionTitle}>Data Management</h3>
                <button style={styles.secondaryButton} onClick={handleExportData}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 14V4M10 4L6 8M10 4l4 4M4 16h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Export All Cards
                </button>
                <button style={styles.dangerButton} onClick={handleClearStorage}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 7h10M8 7V5a1 1 0 011-1h2a1 1 0 011 1v2M6 7v8a2 2 0 002 2h4a2 2 0 002-2V7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Clear All Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div style={styles.tabContent}>
              <p style={styles.description}>
                Advanced settings for power users. Import/export your configuration and settings.
              </p>

              <div style={styles.advancedSection}>
                <h3 style={styles.sectionTitle}>Configuration</h3>
                <button style={styles.secondaryButton} onClick={handleExportSettings}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 14V4M10 4L6 8M10 4l4 4M4 16h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Export Settings
                </button>
                <label style={styles.secondaryButton}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 6v8M10 6l-4 4M10 6l4 4M4 16h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Import Settings
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    style={styles.fileInput}
                  />
                </label>
              </div>

              <div style={styles.aboutSection}>
                <h3 style={styles.sectionTitle}>About</h3>
                <div style={styles.aboutInfo}>
                  <div style={styles.aboutRow}>
                    <span style={styles.aboutLabel}>Version:</span>
                    <span style={styles.aboutValue}>0.1.0</span>
                  </div>
                  <div style={styles.aboutRow}>
                    <span style={styles.aboutLabel}>Extension:</span>
                    <span style={styles.aboutValue}>Nabokov Web Clipper</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(62, 50, 38, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.2s ease-out',
  },
  panel: {
    background: 'linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 100%)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(92, 77, 66, 0.2), 0 0 0 1px rgba(184, 156, 130, 0.3)',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    borderBottom: '2px solid rgba(184, 156, 130, 0.2)',
    background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%)',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: '#3E3226',
    letterSpacing: '-0.5px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#8B7355',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '16px 32px 0',
    borderBottom: '2px solid rgba(184, 156, 130, 0.2)',
    background: 'rgba(250, 247, 242, 0.5)',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: 'none',
    background: 'transparent',
    color: '#8B7355',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.2s',
  },
  activeTab: {
    background: 'rgba(212, 175, 55, 0.1)',
    color: '#5C4D42',
    borderBottom: '3px solid #D4AF37',
  },
  tabIcon: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '32px',
  },
  tabContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  description: {
    fontSize: '15px',
    color: '#8B7355',
    lineHeight: '1.6',
    marginBottom: '32px',
    margin: '0 0 32px 0',
  },
  shortcutCategory: {
    marginBottom: '32px',
  },
  categoryTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 700,
    color: '#5C4D42',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    paddingBottom: '8px',
    borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
  },
  shortcutList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  shortcutRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    border: '1px solid rgba(184, 156, 130, 0.2)',
  },
  shortcutInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  shortcutDesc: {
    fontSize: '14px',
    color: '#3E3226',
    fontWeight: 500,
    flex: 1,
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    fontSize: '13px',
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 600,
    color: '#5C4D42',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F0E8 100%)',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(92, 77, 66, 0.1)',
    minWidth: '60px',
    justifyContent: 'center',
  },
  toggle: {
    position: 'relative',
    width: '48px',
    height: '24px',
    cursor: 'pointer',
  },
  checkbox: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  toggleSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(184, 156, 130, 0.3)',
    borderRadius: '24px',
    transition: '0.3s',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '2px solid rgba(184, 156, 130, 0.2)',
  },
  primaryButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #D4AF37 0%, #C19B2E 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
  },
  secondaryButton: {
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.8)',
    color: '#5C4D42',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    marginBottom: '12px',
  },
  dangerButton: {
    padding: '12px 24px',
    background: 'rgba(231, 76, 60, 0.1)',
    color: '#C0392B',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  saveMessage: {
    fontSize: '14px',
    color: '#27AE60',
    fontWeight: 500,
  },
  themeSection: {
    marginBottom: '32px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 700,
    color: '#5C4D42',
  },
  themeOptions: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  themeOption: {
    cursor: 'pointer',
  },
  radio: {
    display: 'none',
  },
  themeCard: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '2px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '8px',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  themePreview: {
    width: '120px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
    border: '1px solid rgba(184, 156, 130, 0.3)',
  },
  themePreviewInner: {
    width: '100%',
    height: '100%',
  },
  themeLabel: {
    fontSize: '14px',
    color: '#5C4D42',
    fontWeight: 600,
  },
  note: {
    fontSize: '13px',
    color: '#8B7355',
    fontStyle: 'italic',
    margin: 0,
  },
  storageStats: {
    marginBottom: '32px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    border: '1px solid rgba(184, 156, 130, 0.2)',
  },
  storageBar: {
    width: '100%',
    height: '12px',
    background: 'rgba(184, 156, 130, 0.2)',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  storageInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  storageText: {
    fontSize: '14px',
    color: '#5C4D42',
    fontWeight: 600,
  },
  storagePercent: {
    fontSize: '14px',
    color: '#8B7355',
    fontWeight: 500,
  },
  storageDetails: {
    paddingTop: '16px',
    borderTop: '1px solid rgba(184, 156, 130, 0.2)',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#8B7355',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '14px',
    color: '#3E3226',
    fontWeight: 600,
  },
  storageActions: {
    marginBottom: '32px',
  },
  advancedSection: {
    marginBottom: '32px',
  },
  fileInput: {
    display: 'none',
  },
  aboutSection: {
    marginBottom: '32px',
  },
  aboutInfo: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    border: '1px solid rgba(184, 156, 130, 0.2)',
  },
  aboutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  aboutLabel: {
    fontSize: '14px',
    color: '#8B7355',
    fontWeight: 500,
  },
  aboutValue: {
    fontSize: '14px',
    color: '#3E3226',
    fontWeight: 600,
  },
};