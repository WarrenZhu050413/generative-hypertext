/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import type { CardButton } from '@/types/button';
import { DEFAULT_BUTTONS } from '@/config/defaultButtons';
import type { ConnectionType } from '@/types/connection';

const CUSTOM_BUTTONS_KEY = 'nabokov_custom_buttons';

interface ButtonSettingsProps {
  onClose: () => void;
}

export function ButtonSettings({ onClose }: ButtonSettingsProps) {
  const [buttons, setButtons] = useState<CardButton[]>([]);
  const [editingButton, setEditingButton] = useState<CardButton | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load buttons on mount
  useEffect(() => {
    loadButtons();
  }, []);

  const loadButtons = async () => {
    try {
      const result = await chrome.storage.local.get(CUSTOM_BUTTONS_KEY);
      const customButtons: CardButton[] = result[CUSTOM_BUTTONS_KEY] || [];
      // Merge default and custom buttons
      const allButtons = [...DEFAULT_BUTTONS, ...customButtons];
      setButtons(allButtons);
    } catch (error) {
      console.error('[ButtonSettings] Error loading buttons:', error);
      setButtons(DEFAULT_BUTTONS);
    }
  };

  const saveButtons = async (updatedButtons: CardButton[]) => {
    try {
      // Split into default and custom
      const customButtons = updatedButtons.filter(
        (btn) => !DEFAULT_BUTTONS.find((db) => db.id === btn.id)
      );
      await chrome.storage.local.set({ [CUSTOM_BUTTONS_KEY]: customButtons });
      setButtons(updatedButtons);
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('nabokov:buttons-updated'));
    } catch (error) {
      console.error('[ButtonSettings] Error saving buttons:', error);
    }
  };

  const handleCreateNew = () => {
    const newButton: CardButton = {
      id: `custom-${Date.now()}`,
      label: 'New Button',
      icon: '⭐',
      prompt: 'Based on: {{title}}\n\nContent: {{content}}\n\nContext: {{customContext}}',
      connectionType: 'related',
      enabled: true,
    };
    setEditingButton(newButton);
    setIsCreating(true);
  };

  const handleSaveEdit = () => {
    if (!editingButton) return;

    let updatedButtons: CardButton[];
    if (isCreating) {
      updatedButtons = [...buttons, editingButton];
    } else {
      updatedButtons = buttons.map((btn) =>
        btn.id === editingButton.id ? editingButton : btn
      );
    }

    saveButtons(updatedButtons);
    setEditingButton(null);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingButton(null);
    setIsCreating(false);
  };

  const handleDelete = (buttonId: string) => {
    // Can't delete default buttons
    if (DEFAULT_BUTTONS.find((btn) => btn.id === buttonId)) {
      alert('Cannot delete default buttons. You can disable them instead.');
      return;
    }

    if (confirm('Delete this button?')) {
      const updatedButtons = buttons.filter((btn) => btn.id !== buttonId);
      saveButtons(updatedButtons);
    }
  };

  const handleToggleEnabled = (buttonId: string) => {
    const updatedButtons = buttons.map((btn) =>
      btn.id === buttonId ? { ...btn, enabled: !btn.enabled } : btn
    );
    saveButtons(updatedButtons);
  };

  const isDefaultButton = (buttonId: string) => {
    return DEFAULT_BUTTONS.some((btn) => btn.id === buttonId);
  };

  return (
    <div css={styles.backdrop} onClick={onClose}>
      <div css={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div css={styles.header}>
          <h2 css={styles.title}>⚙️ Button Settings</h2>
          <button css={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {!editingButton && (
          <>
            <div css={styles.description}>
              Customize action buttons that appear on cards. Default buttons cannot be deleted
              but can be disabled.
            </div>

            <button css={styles.createButton} onClick={handleCreateNew}>
              + Create New Button
            </button>

            <div css={styles.buttonsList}>
              {buttons.map((button) => (
                <div key={button.id} css={styles.buttonItem}>
                  <div css={styles.buttonInfo}>
                    <div css={styles.buttonHeader}>
                      <span css={styles.buttonIcon}>{button.icon}</span>
                      <span css={styles.buttonLabel}>{button.label}</span>
                      {isDefaultButton(button.id) && (
                        <span css={styles.defaultBadge}>Default</span>
                      )}
                    </div>
                    <div css={styles.buttonMeta}>
                      Connection: {button.connectionType} | Status:{' '}
                      {button.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div css={styles.buttonActions}>
                    <button
                      css={styles.toggleButton}
                      onClick={() => handleToggleEnabled(button.id)}
                    >
                      {button.enabled ? '👁️' : '🚫'}
                    </button>
                    <button
                      css={styles.editButton}
                      onClick={() => {
                        setEditingButton({ ...button });
                        setIsCreating(false);
                      }}
                    >
                      ✏️
                    </button>
                    {!isDefaultButton(button.id) && (
                      <button
                        css={styles.deleteButton}
                        onClick={() => handleDelete(button.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {editingButton && (
          <div css={styles.editor}>
            <h3 css={styles.editorTitle}>
              {isCreating ? 'Create New Button' : 'Edit Button'}
            </h3>

            <div css={styles.formGroup}>
              <label css={styles.label}>Label</label>
              <input
                css={styles.input}
                type="text"
                value={editingButton.label}
                onChange={(e) =>
                  setEditingButton({ ...editingButton, label: e.target.value })
                }
                placeholder="Button label"
              />
            </div>

            <div css={styles.formGroup}>
              <label css={styles.label}>Icon (emoji)</label>
              <input
                css={styles.input}
                type="text"
                value={editingButton.icon}
                onChange={(e) =>
                  setEditingButton({ ...editingButton, icon: e.target.value })
                }
                placeholder="📚"
                maxLength={2}
              />
            </div>

            <div css={styles.formGroup}>
              <label css={styles.label}>Connection Type</label>
              <select
                css={styles.select}
                value={editingButton.connectionType}
                onChange={(e) =>
                  setEditingButton({
                    ...editingButton,
                    connectionType: e.target.value as ConnectionType,
                  })
                }
              >
                <option value="references">References</option>
                <option value="generated-from">Generated From</option>
                <option value="related">Related</option>
                <option value="contradicts">Contradicts</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div css={styles.formGroup}>
              <label css={styles.label}>
                Prompt Template
                <span css={styles.hint}>
                  Variables: {'{{content}}'}, {'{{title}}'}, {'{{customContext}}'}
                </span>
              </label>
              <textarea
                css={styles.textarea}
                value={editingButton.prompt}
                onChange={(e) =>
                  setEditingButton({ ...editingButton, prompt: e.target.value })
                }
                rows={8}
                placeholder="Enter your prompt template..."
              />
            </div>

            <div css={styles.editorActions}>
              <button css={styles.saveButton} onClick={handleSaveEdit}>
                Save
              </button>
              <button css={styles.cancelButton} onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  backdrop: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `,
  modal: css`
    background: linear-gradient(135deg, #f5f0e8 0%, #fff8f0 100%);
    border: 2px solid rgba(139, 0, 0, 0.2);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 24px;
    margin: auto;
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  `,
  title: css`
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #8b0000;
  `,
  closeButton: css`
    background: none;
    border: none;
    font-size: 24px;
    color: #8b7355;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(139, 0, 0, 0.1);
      color: #8b0000;
    }
  `,
  description: css`
    color: #8b7355;
    margin-bottom: 16px;
    font-size: 14px;
  `,
  createButton: css`
    padding: 10px 20px;
    background: linear-gradient(135deg, #8b0000 0%, #a00000 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 20px;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
    }
  `,
  buttonsList: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  buttonItem: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: white;
    border: 1px solid rgba(139, 115, 85, 0.2);
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba(212, 175, 55, 0.5);
      background: rgba(212, 175, 55, 0.05);
    }
  `,
  buttonInfo: css`
    flex: 1;
  `,
  buttonHeader: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  `,
  buttonIcon: css`
    font-size: 18px;
  `,
  buttonLabel: css`
    font-weight: 600;
    color: #8b0000;
  `,
  defaultBadge: css`
    font-size: 10px;
    padding: 2px 6px;
    background: rgba(212, 175, 55, 0.2);
    color: #8b7355;
    border-radius: 4px;
    font-weight: 600;
  `,
  buttonMeta: css`
    font-size: 12px;
    color: #8b7355;
  `,
  buttonActions: css`
    display: flex;
    gap: 8px;
  `,
  toggleButton: css`
    background: none;
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(139, 115, 85, 0.1);
    }
  `,
  editButton: css`
    background: none;
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(212, 175, 55, 0.1);
    }
  `,
  deleteButton: css`
    background: none;
    border: 1px solid rgba(139, 0, 0, 0.3);
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(139, 0, 0, 0.1);
    }
  `,
  editor: css`
    padding: 16px 0;
  `,
  editorTitle: css`
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #8b0000;
  `,
  formGroup: css`
    margin-bottom: 16px;
  `,
  label: css`
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #8b7355;
    font-size: 14px;
  `,
  hint: css`
    margin-left: 8px;
    font-weight: normal;
    color: #999;
    font-size: 12px;
  `,
  input: css`
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 6px;
    background: white;
    font-family: inherit;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #d4af37;
    }
  `,
  select: css`
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 6px;
    background: white;
    font-family: inherit;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #d4af37;
    }
  `,
  textarea: css`
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 6px;
    background: white;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: #d4af37;
    }
  `,
  editorActions: css`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
  `,
  saveButton: css`
    padding: 10px 24px;
    background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
    }
  `,
  cancelButton: css`
    padding: 10px 24px;
    background: white;
    color: #8b7355;
    border: 1px solid rgba(139, 115, 85, 0.3);
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(139, 115, 85, 0.1);
    }
  `,
};
