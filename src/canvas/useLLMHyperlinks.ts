/**
 * Custom hook for LLM-Generated Hyperlinks functionality
 * Handles text selection, generation, and child card creation
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Card } from '@/types/card';
import {
  getCardTextSelection,
  onSelectionChange,
  clearSelection,
  type TextSelection,
} from '@/utils/textSelection';
import {
  generateChildCard,
  type GenerationType,
  type GenerationResult,
} from '@/services/childCardGenerator';
import { instantExpandChild } from '@/utils/instantExpansion';
import { createExpandableLink, flashLink } from '@/utils/expandableLinks';
import { generateId } from '@/utils/storage';

export interface UseLLMHyperlinksOptions {
  card: Card;
  onToast: (message: string, type: 'loading' | 'success' | 'error') => void;
}

export function useLLMHyperlinks({ card, onToast }: UseLLMHyperlinksOptions) {
  const [currentSelection, setCurrentSelection] = useState<TextSelection | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generationType, setGenerationType] = useState<GenerationType>('explanation');
  const [streamingContent, setStreamingContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Listen for selection changes
  useEffect(() => {
    const cleanup = onSelectionChange(card.id, (selection) => {
      setCurrentSelection(selection);
    });

    return cleanup;
  }, [card.id]);

  // Handle Cmd+L keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+L (Mac) or Ctrl+L (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        handleGenerateTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSelection]);

  /**
   * Trigger generation modal
   */
  const handleGenerateTrigger = useCallback(() => {
    const selection = getCardTextSelection(card.id);

    if (!selection) {
      onToast('Please select some text first', 'error');
      return;
    }

    setCurrentSelection(selection);
    setShowGenerateModal(true);
    setStreamingContent('');
  }, [card.id, onToast]);

  /**
   * Start generating child card
   */
  const handleGenerate = useCallback(async () => {
    if (!currentSelection) return;

    setIsGenerating(true);
    setStreamingContent('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const generator = generateChildCard({
        selection: currentSelection,
        parentCard: card,
        generationType,
        signal: controller.signal,
      });

      for await (const chunk of generator) {
        setStreamingContent((prev) => prev + chunk);
      }

      // Generator returns final result
      const result = await generator.next();
      if (result.done && result.value) {
        // Generation complete, but don't accept yet - let user review
      }
    } catch (error: any) {
      if (error.message !== 'Generation cancelled') {
        console.error('[useLLMHyperlinks] Generation error:', error);
        onToast('Failed to generate content', 'error');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [currentSelection, card, generationType, onToast]);

  /**
   * Regenerate with current settings
   */
  const handleRegenerate = useCallback(() => {
    setStreamingContent('');
    handleGenerate();
  }, [handleGenerate]);

  /**
   * Accept generated content and create child card
   */
  const handleAccept = useCallback(async () => {
    if (!currentSelection || !streamingContent) return;

    try {
      onToast('Creating child card...', 'loading');

      // Parse the streamed content to get structured result
      // For now, create a simple result from the streamed text
      const result: GenerationResult = {
        title: `${generationType}: ${currentSelection.text.substring(0, 50)}...`,
        content: `<p>${streamingContent}</p>`,
        tags: [generationType, 'ai-generated'],
      };

      // Create child card with instant expansion
      const childCard = await instantExpandChild({
        parentCard: card,
        generationResult: result,
        selection: currentSelection,
        generationType,
      });

      // Create expandable link
      const linkId = generateId();
      await createExpandableLink({
        id: linkId,
        parentCardId: card.id,
        childCardId: childCard.id,
        anchorText: currentSelection.text,
        startOffset: currentSelection.startOffset,
        endOffset: currentSelection.endOffset,
        createdAt: Date.now(),
      });

      // Flash the link
      flashLink(linkId);

      onToast('Child card created! ✨', 'success');

      // Clean up
      setShowGenerateModal(false);
      setStreamingContent('');
      clearSelection();
      setCurrentSelection(null);
    } catch (error) {
      console.error('[useLLMHyperlinks] Error creating child card:', error);
      onToast('Failed to create child card', 'error');
    }
  }, [currentSelection, streamingContent, generationType, card, onToast]);

  /**
   * Cancel generation/modal
   */
  const handleCancel = useCallback(() => {
    // Abort generation if in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setShowGenerateModal(false);
    setStreamingContent('');
    setIsGenerating(false);
    clearSelection();
    setCurrentSelection(null);
  }, []);

  return {
    currentSelection,
    showGenerateModal,
    generationType,
    streamingContent,
    isGenerating,
    setGenerationType,
    handleGenerateTrigger,
    handleGenerate,
    handleRegenerate,
    handleAccept,
    handleCancel,
  };
}
