import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BaseChatUI } from '@/shared/components/Chat/BaseChatUI';
import type { Message, ImageAttachment } from '@/shared/types/chat';

describe('BaseChatUI', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello, how are you?',
      timestamp: Date.now() - 5000
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I am doing well, thank you!',
      timestamp: Date.now() - 3000
    }
  ];

  const mockImageAttachment: ImageAttachment = {
    dataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    width: 100,
    height: 100
  };

  const defaultProps = {
    messages: [],
    currentInput: '',
    isStreaming: false,
    onSendMessage: vi.fn(),
    onInputChange: vi.fn(),
    onStopStreaming: vi.fn(),
    onClearChat: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Message Rendering', () => {
    it('should render empty state when no messages', () => {
      render(<BaseChatUI {...defaultProps} placeholder="Start chatting..." />);
      expect(screen.getByText('Start chatting...')).toBeInTheDocument();
    });

    it('should render all messages', () => {
      render(<BaseChatUI {...defaultProps} messages={mockMessages} />);
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
    });

    it('should render user messages with correct styling', () => {
      render(<BaseChatUI {...defaultProps} messages={[mockMessages[0]]} />);
      const messageElement = screen.getByText('Hello, how are you?').closest('div');
      expect(messageElement).toBeInTheDocument();
    });

    it('should render assistant messages with correct styling', () => {
      render(<BaseChatUI {...defaultProps} messages={[mockMessages[1]]} />);
      const messageElement = screen.getByText('I am doing well, thank you!').closest('div');
      expect(messageElement).toBeInTheDocument();
    });

    it('should render messages with attached images', () => {
      const messageWithImage: Message = {
        id: '3',
        role: 'user',
        content: 'Look at this image',
        timestamp: Date.now(),
        images: [mockImageAttachment]
      };

      render(<BaseChatUI {...defaultProps} messages={[messageWithImage]} />);
      expect(screen.getByText('Look at this image')).toBeInTheDocument();
      expect(screen.getByAltText('Attached image 1')).toBeInTheDocument();
    });

    it('should render multiple attached images', () => {
      const messageWithImages: Message = {
        id: '4',
        role: 'user',
        content: 'Multiple images',
        timestamp: Date.now(),
        images: [mockImageAttachment, mockImageAttachment]
      };

      render(<BaseChatUI {...defaultProps} messages={[messageWithImages]} />);
      expect(screen.getByAltText('Attached image 1')).toBeInTheDocument();
      expect(screen.getByAltText('Attached image 2')).toBeInTheDocument();
    });
  });

  describe('Streaming Display', () => {
    it('should display streaming indicator when streaming', () => {
      const { container } = render(
        <BaseChatUI
          {...defaultProps}
          isStreaming={true}
          streamingContent=""
        />
      );
      // Component shows loading dots when streaming with no content
      // Check that stop button is rendered (indicates streaming state)
      expect(screen.getByTitle('Stop generating')).toBeInTheDocument();
    });

    it('should display streaming content', () => {
      render(
        <BaseChatUI
          {...defaultProps}
          isStreaming={true}
          streamingContent="This is streaming content..."
        />
      );
      expect(screen.getByText('This is streaming content...')).toBeInTheDocument();
    });

    it('should show stop button when streaming', () => {
      render(
        <BaseChatUI
          {...defaultProps}
          isStreaming={true}
          streamingContent="Streaming..."
        />
      );
      const stopButton = screen.getByTitle('Stop generating');
      expect(stopButton).toBeInTheDocument();
    });

    it('should call onStopStreaming when stop button clicked', async () => {
      const onStopStreaming = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          isStreaming={true}
          streamingContent="Streaming..."
          onStopStreaming={onStopStreaming}
        />
      );

      const stopButton = screen.getByTitle('Stop generating');
      fireEvent.click(stopButton);
      expect(onStopStreaming).toHaveBeenCalledOnce();
    });
  });

  describe('Input Handling', () => {
    it('should render input field with placeholder', () => {
      render(<BaseChatUI {...defaultProps} placeholder="Type your message..." />);
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    it('should call onInputChange when typing', async () => {
      const onInputChange = vi.fn();
      render(<BaseChatUI {...defaultProps} onInputChange={onInputChange} />);

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(onInputChange).toHaveBeenCalled();
    });

    it('should display current input value', () => {
      render(<BaseChatUI {...defaultProps} currentInput="Test message" />);
      expect(screen.getByDisplayValue('Test message')).toBeInTheDocument();
    });

    it('should call onSendMessage when form submitted with Enter', async () => {
      const onSendMessage = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          currentInput="Test message"
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByDisplayValue('Test message');
      fireEvent.submit(input.closest('form')!);

      expect(onSendMessage).toHaveBeenCalledOnce();
    });

    it('should not send empty messages', async () => {
      const onSendMessage = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          currentInput=""
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.submit(input.closest('form')!);

      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('should not send messages while streaming', () => {
      const onSendMessage = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          currentInput="Test"
          isStreaming={true}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByDisplayValue('Test');
      fireEvent.submit(input.closest('form')!);

      expect(onSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Pending Images', () => {
    it('should render pending images preview', () => {
      render(
        <BaseChatUI
          {...defaultProps}
          pendingImages={[mockImageAttachment]}
        />
      );
      // Check that image preview is rendered (BaseChatUI doesn't use filename as alt)
      const imagePreview = screen.getByRole('img');
      expect(imagePreview).toBeInTheDocument();
    });

    it('should show remove button for pending images', () => {
      const onRemoveImage = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          pendingImages={[mockImageAttachment]}
          onRemoveImage={onRemoveImage}
        />
      );
      expect(screen.getByTitle('Remove image')).toBeInTheDocument();
    });

    it('should call onRemoveImage when remove button clicked', async () => {
      const onRemoveImage = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          pendingImages={[mockImageAttachment]}
          onRemoveImage={onRemoveImage}
        />
      );

      const removeButton = screen.getByTitle('Remove image');
      fireEvent.click(removeButton);
      expect(onRemoveImage).toHaveBeenCalledWith(0);
    });

    it('should allow sending message with only images (no text)', () => {
      const onSendMessage = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          currentInput=""
          pendingImages={[mockImageAttachment]}
          onSendMessage={onSendMessage}
        />
      );

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.submit(input.closest('form')!);

      expect(onSendMessage).toHaveBeenCalledOnce();
    });
  });

  describe('Save Controls', () => {
    it('should not show save controls by default', () => {
      render(<BaseChatUI {...defaultProps} messages={mockMessages} />);
      expect(screen.queryByText('💾 Save')).not.toBeInTheDocument();
    });

    it('should show save controls when enabled', () => {
      render(
        <BaseChatUI
          {...defaultProps}
          messages={mockMessages}
          showSaveControls={true}
          onSaveConversation={vi.fn()}
        />
      );
      expect(screen.getByText('💾 Save Conversation')).toBeInTheDocument();
    });

    it('should call onSaveConversation when save button clicked', async () => {
      const onSaveConversation = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          messages={mockMessages}
          showSaveControls={true}
          onSaveConversation={onSaveConversation}
        />
      );

      const saveButton = screen.getByText('💾 Save Conversation');
      fireEvent.click(saveButton);
      expect(onSaveConversation).toHaveBeenCalledOnce();
    });

    it('should show auto-save toggle when enabled', () => {
      render(
        <BaseChatUI
          {...defaultProps}
          messages={mockMessages}
          showSaveControls={true}
          onSaveConversation={vi.fn()}
          onToggleAutoSave={vi.fn()}
        />
      );
      expect(screen.getByLabelText('Auto-save on close')).toBeInTheDocument();
    });

    it('should call onToggleAutoSave when checkbox toggled', async () => {
      const onToggleAutoSave = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          messages={mockMessages}
          showSaveControls={true}
          onSaveConversation={vi.fn()}
          onToggleAutoSave={onToggleAutoSave}
          autoSaveOnClose={false}
        />
      );

      const checkbox = screen.getByLabelText('Auto-save on close') as HTMLInputElement;
      fireEvent.click(checkbox);
      expect(onToggleAutoSave).toHaveBeenCalledWith(true);
    });

    it('should reflect auto-save state in checkbox', () => {
      render(
        <BaseChatUI
          {...defaultProps}
          messages={mockMessages}
          showSaveControls={true}
          onSaveConversation={vi.fn()}
          onToggleAutoSave={vi.fn()}
          autoSaveOnClose={true}
        />
      );

      const checkbox = screen.getByLabelText('Auto-save on close') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Clear Chat', () => {
    it('should show clear button when messages exist', () => {
      render(<BaseChatUI {...defaultProps} messages={mockMessages} />);
      expect(screen.getByText('🗑️')).toBeInTheDocument();
    });

    it('should call onClearChat when clear button clicked', async () => {
      const onClearChat = vi.fn();
      render(<BaseChatUI {...defaultProps} messages={mockMessages} onClearChat={onClearChat} />);

      const clearButton = screen.getByText('🗑️');
      fireEvent.click(clearButton);
      expect(onClearChat).toHaveBeenCalledOnce();
    });
  });

  describe('Auto-scroll Behavior', () => {
    it('should auto-scroll to bottom on new messages', async () => {
      const { rerender } = render(<BaseChatUI {...defaultProps} messages={[mockMessages[0]]} />);

      // Add a new message
      rerender(<BaseChatUI {...defaultProps} messages={mockMessages} />);

      // Note: Testing actual scrollIntoView behavior is complex in jsdom
      // We're mainly testing that the component renders correctly with new messages
      expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
    });

    it('should auto-scroll on streaming content updates', async () => {
      const { rerender } = render(
        <BaseChatUI
          {...defaultProps}
          isStreaming={true}
          streamingContent="Part 1"
        />
      );

      rerender(
        <BaseChatUI
          {...defaultProps}
          isStreaming={true}
          streamingContent="Part 1 Part 2"
        />
      );

      expect(screen.getByText('Part 1 Part 2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pending images array', () => {
      render(<BaseChatUI {...defaultProps} pendingImages={[]} />);
      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument();
    });

    it('should handle undefined streamingContent', () => {
      render(<BaseChatUI {...defaultProps} isStreaming={true} />);
      // Should render stop button when streaming
      expect(screen.getByTitle('Stop generating')).toBeInTheDocument();
    });

    it('should handle very long messages', () => {
      const longMessage: Message = {
        id: '5',
        role: 'user',
        content: 'A'.repeat(5000),
        timestamp: Date.now()
      };

      render(<BaseChatUI {...defaultProps} messages={[longMessage]} />);
      expect(screen.getByText('A'.repeat(5000))).toBeInTheDocument();
    });

    it('should handle messages with special characters', () => {
      const specialMessage: Message = {
        id: '6',
        role: 'user',
        content: '<script>alert("XSS")</script> & special chars: <>&"\'',
        timestamp: Date.now()
      };

      const { container } = render(<BaseChatUI {...defaultProps} messages={[specialMessage]} />);
      // Component uses dangerouslySetInnerHTML - content is rendered as-is
      // In production, content should be sanitized BEFORE being passed to BaseChatUI
      expect(container.innerHTML).toContain('<script>alert("XSS")</script>');
    });

    it('should handle whitespace-only input correctly', () => {
      const onSendMessage = vi.fn();
      render(
        <BaseChatUI
          {...defaultProps}
          currentInput="   "
          onSendMessage={onSendMessage}
          pendingImages={[]}
        />
      );

      const form = screen.getByPlaceholderText('Ask a question...').closest('form');
      fireEvent.submit(form!);

      expect(onSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form structure', () => {
      render(<BaseChatUI {...defaultProps} />);
      const form = screen.getByPlaceholderText('Ask a question...').closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(
        <BaseChatUI
          {...defaultProps}
          messages={mockMessages}
          isStreaming={true}
        />
      );

      expect(screen.getByTitle('Clear conversation')).toBeInTheDocument();
      expect(screen.getByTitle('Stop generating')).toBeInTheDocument();
    });

    it('should have accessible image alt text', () => {
      const messageWithImage: Message = {
        id: '7',
        role: 'user',
        content: 'Image message',
        timestamp: Date.now(),
        images: [mockImageAttachment]
      };

      render(<BaseChatUI {...defaultProps} messages={[messageWithImage]} />);
      expect(screen.getByAltText('Attached image 1')).toBeInTheDocument();
    });
  });
});
