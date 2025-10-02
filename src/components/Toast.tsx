/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useEffect } from 'react';

export type ToastType = 'loading' | 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose?: () => void;
  duration?: number; // Auto-close after duration (ms), 0 = no auto-close
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 0,
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'loading':
        return loadingToastStyles;
      case 'success':
        return successToastStyles;
      case 'error':
        return errorToastStyles;
      case 'info':
        return infoToastStyles;
    }
  };

  return (
    <div css={[toastBaseStyles, getStyles()]}>
      <div css={iconStyles}>
        {type === 'loading' ? (
          <div css={spinnerStyles} />
        ) : (
          <span>{getIcon()}</span>
        )}
      </div>
      <div css={messageStyles}>{message}</div>
      {onClose && type !== 'loading' && (
        <button onClick={onClose} css={closeButtonStyles}>
          ✕
        </button>
      )}
    </div>
  );
};

// Base styles
const toastBaseStyles = css`
  position: fixed;
  bottom: 24px;
  right: 24px;
  min-width: 320px;
  max-width: 480px;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10001;
  animation: slideIn 0.3s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const loadingToastStyles = css`
  background: linear-gradient(135deg, rgba(250, 247, 242, 0.98), rgba(242, 235, 225, 0.98));
  border: 2px solid #FFD700;
  color: #3E3226;
`;

const successToastStyles = css`
  background: linear-gradient(135deg, rgba(232, 245, 233, 0.98), rgba(200, 230, 201, 0.98));
  border: 2px solid #66BB6A;
  color: #1B5E20;
`;

const errorToastStyles = css`
  background: linear-gradient(135deg, rgba(255, 235, 238, 0.98), rgba(255, 205, 210, 0.98));
  border: 2px solid #EF5350;
  color: #B71C1C;
`;

const infoToastStyles = css`
  background: linear-gradient(135deg, rgba(227, 242, 253, 0.98), rgba(187, 222, 251, 0.98));
  border: 2px solid #42A5F5;
  color: #0D47A1;
`;

const iconStyles = css`
  font-size: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const spinnerStyles = css`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(139, 0, 0, 0.1);
  border-top: 3px solid #8B0000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const messageStyles = css`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
`;

const closeButtonStyles = css`
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: inherit;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;
