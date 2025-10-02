/**
 * FilePickerButton Component - Button to trigger file picker
 *
 * Provides a button interface for manual file selection
 */

import React, { useRef, ChangeEvent } from 'react';

export interface FilePickerButtonProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  multiple?: boolean;
  accept?: string;
  label?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const FilePickerButton: React.FC<FilePickerButtonProps> = ({
  onFilesSelected,
  multiple = false,
  accept = 'image/*',
  label = '📁 Upload Images',
  disabled = false,
  style,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    try {
      await onFilesSelected(files);
    } catch (error) {
      console.error('[FilePickerButton] Error handling files:', error);
    }

    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        disabled={disabled}
        style={{ ...styles.button, ...style }}
      >
        {label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={styles.hiddenInput}
      />
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  button: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  hiddenInput: {
    display: 'none',
  },
};
