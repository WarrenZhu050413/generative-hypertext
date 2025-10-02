/**
 * API Settings Modal
 * Allows users to configure their Claude API key
 */

import React, { useState, useEffect } from 'react';
import { apiConfigService } from '@/services/apiConfig';
import { claudeAPIService } from '@/services/claudeAPIService';

interface APISettingsProps {
  onClose: () => void;
}

export const APISettings: React.FC<APISettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAPIKey();
  }, []);

  const loadAPIKey = async () => {
    try {
      const key = await apiConfigService.getAPIKey();
      setSavedKey(key);
      if (key) {
        // Show masked version
        setApiKey('•'.repeat(20));
      }
    } catch (error) {
      console.error('[APISettings] Error loading API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey || apiKey.trim().length === 0) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    // Don't save if it's just the masked placeholder
    if (apiKey === '•'.repeat(20)) {
      setMessage({ type: 'success', text: 'API key already saved' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await apiConfigService.setAPIKey(apiKey);
      setSavedKey(apiKey);
      setMessage({ type: 'success', text: 'API key saved successfully!' });

      // Mask the key in the input
      setTimeout(() => {
        setApiKey('•'.repeat(20));
      }, 1000);
    } catch (error) {
      console.error('[APISettings] Error saving API key:', error);
      setMessage({ type: 'error', text: 'Failed to save API key' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setMessage(null);

    try {
      const isWorking = await claudeAPIService.testConnection();

      if (isWorking) {
        setMessage({ type: 'success', text: 'Connection successful! ✓' });
      } else {
        setMessage({ type: 'error', text: 'Connection failed. Please check your API key.' });
      }
    } catch (error) {
      console.error('[APISettings] Error testing connection:', error);
      setMessage({ type: 'error', text: 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear your API key?')) {
      return;
    }

    try {
      await apiConfigService.clearAPIKey();
      setApiKey('');
      setSavedKey(null);
      setMessage({ type: 'success', text: 'API key cleared' });
    } catch (error) {
      console.error('[APISettings] Error clearing API key:', error);
      setMessage({ type: 'error', text: 'Failed to clear API key' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div style={styles.header}>
          <h2 style={styles.title}>Claude API Settings</h2>
          <button onClick={onClose} style={styles.closeButton} title="Close">
            ✕
          </button>
        </div>

        <div style={styles.content}>
          {isLoading ? (
            <div style={styles.loading}>Loading...</div>
          ) : (
            <>
              <div style={styles.section}>
                <label style={styles.label}>
                  API Key
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    Get your API key →
                  </a>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  style={styles.input}
                  autoFocus
                />
                <div style={styles.hint}>
                  Your API key is stored locally and never sent anywhere except to Anthropic's API.
                </div>
              </div>

              {message && (
                <div
                  style={{
                    ...styles.message,
                    ...(message.type === 'success' ? styles.messageSuccess : styles.messageError),
                  }}
                >
                  {message.text}
                </div>
              )}

              <div style={styles.buttonGroup}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={styles.saveButton}
                >
                  {isSaving ? 'Saving...' : 'Save API Key'}
                </button>

                {savedKey && (
                  <>
                    <button
                      onClick={handleTest}
                      disabled={isTesting}
                      style={styles.testButton}
                    >
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                      onClick={handleClear}
                      style={styles.clearButton}
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>

              <div style={styles.info}>
                <strong>Features enabled with API key:</strong>
                <ul style={styles.featureList}>
                  <li>🎨 AI Beautification (Recreate Design mode with vision)</li>
                  <li>📋 AI Beautification (Organize Content mode)</li>
                  <li>💬 Enhanced chat with Claude Sonnet 4</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.footerHint}>
            Cmd+Enter to save • Esc to close
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    background: 'linear-gradient(135deg, rgba(250, 247, 242, 0.98) 0%, rgba(242, 235, 225, 0.98) 100%)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(184, 156, 130, 0.2)',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#3E3226',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#8B7355',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#8B7355',
  },
  section: {
    marginBottom: '24px',
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 600,
    color: '#3E3226',
    marginBottom: '8px',
  },
  link: {
    fontSize: '13px',
    fontWeight: 400,
    color: '#D4AF37',
    textDecoration: 'none',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '6px',
    background: 'white',
    color: '#3E3226',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
  },
  hint: {
    fontSize: '12px',
    color: '#A89684',
    marginTop: '8px',
    lineHeight: '1.4',
  },
  message: {
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  messageSuccess: {
    background: 'rgba(76, 175, 80, 0.1)',
    color: '#2e7d32',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  messageError: {
    background: 'rgba(244, 67, 54, 0.1)',
    color: '#c62828',
    border: '1px solid rgba(244, 67, 54, 0.3)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  saveButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
    color: '#3E3226',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  testButton: {
    padding: '12px 20px',
    background: 'white',
    color: '#3E3226',
    border: '1px solid rgba(184, 156, 130, 0.3)',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  clearButton: {
    padding: '12px 20px',
    background: 'white',
    color: '#8B0000',
    border: '1px solid rgba(139, 0, 0, 0.2)',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  info: {
    marginTop: '24px',
    padding: '16px',
    background: 'rgba(212, 175, 55, 0.05)',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    fontSize: '13px',
    color: '#5C4D42',
  },
  featureList: {
    marginTop: '8px',
    marginBottom: 0,
    paddingLeft: '20px',
    lineHeight: '1.8',
  },
  footer: {
    padding: '12px 24px',
    borderTop: '1px solid rgba(184, 156, 130, 0.2)',
    textAlign: 'center',
  },
  footerHint: {
    fontSize: '11px',
    color: '#A89684',
    fontStyle: 'italic',
  },
};
