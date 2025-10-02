/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useState, useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import type { Card } from '@/types/card';
import { useCards } from '@/shared/hooks/useCards';
import { useCardOperations } from '@/shared/hooks/useCardOperations';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { ImageUploadZone, FilePickerButton } from '@/shared/components/ImageUpload';

export const SidePanel: React.FC = () => {
  // Use shared hooks
  const { cards: allCards, isLoading, refreshCards } = useCards(true); // Include stashed
  const { restoreCard, deleteCard } = useCardOperations(refreshCards);
  const { handleImageUpload, isUploading } = useImageUpload(
    (card) => {
      console.log('[SidePanel] Image uploaded:', card.id);
      refreshCards();
    },
    { stashImmediately: true } // Images uploaded in side panel go to stash
  );

  // Filter to only stashed cards
  const stashedCards = useMemo(
    () => allCards.filter(card => card.stashed),
    [allCards]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const handleRestore = async (card: Card) => {
    try {
      await restoreCard(card.id);
      console.log('[SidePanel] Card restored:', card.metadata.title);
    } catch (error) {
      console.error('[SidePanel] Error restoring card:', error);
      alert('Failed to restore card');
    }
  };

  const handleDelete = async (card: Card) => {
    if (!confirm(`Permanently delete "${card.metadata.title}"?`)) {
      return;
    }

    try {
      await deleteCard(card.id);
      console.log('[SidePanel] Card deleted:', card.metadata.title);
    } catch (error) {
      console.error('[SidePanel] Error deleting card:', error);
      alert('Failed to delete card');
    }
  };

  const handleImageDrop = async (file: File) => {
    try {
      await handleImageUpload(file);
    } catch (error) {
      console.error('[SidePanel] Image upload failed:', error);
      alert('Failed to upload image');
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      try {
        await handleImageUpload(file);
      } catch (error) {
        console.error('[SidePanel] Image upload failed:', file.name, error);
      }
    }
  };

  const handleOpenCanvas = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/canvas/index.html'),
    });
  };

  // Filter cards by search query
  const filteredCards = stashedCards.filter((card) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      card.metadata.title.toLowerCase().includes(query) ||
      card.metadata.domain.toLowerCase().includes(query) ||
      card.content?.toLowerCase().includes(query) ||
      card.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const getContentPreview = (content: string | undefined) => {
    if (!content) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <ImageUploadZone onImageUpload={handleImageDrop}>
      <div css={containerStyles}>
        {/* Header */}
        <div css={headerStyles}>
          <h1 css={titleStyles}>📦 Stashed Cards</h1>
          <button onClick={handleOpenCanvas} css={openCanvasButtonStyles} title="Open Canvas">
            🗺️ Canvas
          </button>
        </div>

        {/* Upload Button */}
        <div css={uploadSectionStyles}>
          <FilePickerButton
            onFilesSelected={handleFilesSelected}
            multiple
            label="📁 Upload Images"
            disabled={isUploading}
          />
          {isUploading && <span css={uploadingTextStyles}>Uploading...</span>}
        </div>

        {/* Search Bar */}
        <div css={searchBarStyles}>
          <input
            type="text"
            placeholder="Search stashed cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            css={searchInputStyles}
          />
        </div>

        {/* Card List */}
      <div css={cardListStyles}>
        {isLoading ? (
          <div css={loadingStyles}>Loading...</div>
        ) : filteredCards.length === 0 ? (
          <div css={emptyStateStyles}>
            {searchQuery ? (
              <>
                <p>No cards match "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')} css={clearSearchButtonStyles}>
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p>No stashed cards yet</p>
                <p css={hintStyles}>Stash cards from the canvas to keep them out of sight</p>
              </>
            )}
          </div>
        ) : (
          filteredCards.map((card) => {
            const isExpanded = expandedCards.has(card.id);
            const sanitizedContent = card.content
              ? DOMPurify.sanitize(card.content, {
                  ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li',
                    'article', 'section', 'header', 'footer', 'nav', 'aside',
                    'blockquote', 'pre', 'code'
                  ],
                  ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'id'],
                })
              : '';

            return (
              <div key={card.id} css={cardItemStyles}>
                {/* Card Header */}
                <div css={cardHeaderStyles}>
                  {card.metadata.favicon && <span css={faviconStyles}>{card.metadata.favicon}</span>}
                  <span css={domainStyles}>{card.metadata.domain}</span>
                  <span css={dateStyles}>{formatDate(card.createdAt)}</span>
                </div>

                {/* Card Title */}
                <div css={cardTitleStyles}>{card.metadata.title}</div>

                {/* Content Preview or Full Content */}
                {card.content && (
                  <div>
                    {isExpanded ? (
                      <div css={contentExpandedStyles} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                    ) : (
                      <div css={contentPreviewStyles}>{getContentPreview(card.content)}</div>
                    )}
                    {card.content.length > 100 && (
                      <button
                        onClick={() => toggleCardExpansion(card.id)}
                        css={expandButtonStyles}
                      >
                        {isExpanded ? '▲ Show less' : '▼ Show more'}
                      </button>
                    )}
                  </div>
                )}

                {/* Card Tags */}
                {card.tags && card.tags.length > 0 && (
                  <div css={tagsStyles}>
                    {card.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} css={tagStyles}>
                        {tag}
                      </span>
                    ))}
                    {card.tags.length > 3 && <span css={tagStyles}>+{card.tags.length - 3}</span>}
                  </div>
                )}

                {/* Actions */}
                <div css={actionsStyles}>
                  <button onClick={() => handleRestore(card)} css={restoreButtonStyles}>
                    ↩️ Restore
                  </button>
                  <button onClick={() => handleDelete(card)} css={deleteButtonStyles}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      {!isLoading && stashedCards.length > 0 && (
        <div css={footerStyles}>
          {filteredCards.length} of {stashedCards.length} cards
        </div>
      )}
    </div>
    </ImageUploadZone>
  );
};

// Styles
const containerStyles = css`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, rgba(250, 247, 242, 1) 0%, rgba(242, 235, 225, 1) 100%);
  font-family: system-ui, -apple-system, sans-serif;
`;

const headerStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 2px solid rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), transparent);
`;

const titleStyles = css`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #3e3226;
`;

const openCanvasButtonStyles = css`
  padding: 6px 12px;
  background: linear-gradient(135deg, #d4af37, #ffd700);
  color: #3e3226;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
  }
`;

const uploadSectionStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(76, 175, 80, 0.05);
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
`;

const uploadingTextStyles = css`
  font-size: 13px;
  color: #666;
  font-style: italic;
`;

const searchBarStyles = css`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(184, 156, 130, 0.2);
`;

const searchInputStyles = css`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(184, 156, 130, 0.3);
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
  }

  &::placeholder {
    color: #a89684;
  }
`;

const cardListStyles = css`
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 0, 0, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 0, 0, 0.5);
  }
`;

const loadingStyles = css`
  text-align: center;
  padding: 40px 20px;
  color: #8b7355;
  font-size: 14px;
`;

const emptyStateStyles = css`
  text-align: center;
  padding: 60px 20px;
  color: #8b7355;

  p {
    margin: 8px 0;
    font-size: 14px;
  }
`;

const hintStyles = css`
  font-size: 12px;
  color: #a89684;
  font-style: italic;
`;

const clearSearchButtonStyles = css`
  margin-top: 16px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(184, 156, 130, 0.3);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const cardItemStyles = css`
  background: white;
  border: 1px solid rgba(184, 156, 130, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(92, 77, 66, 0.1);
    border-color: rgba(212, 175, 55, 0.3);
  }
`;

const cardHeaderStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 11px;
  color: #8b7355;
`;

const faviconStyles = css`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`;

const domainStyles = css`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
`;

const dateStyles = css`
  color: #a89684;
  font-size: 10px;
`;

const cardTitleStyles = css`
  font-size: 13px;
  font-weight: 600;
  color: #3e3226;
  margin-bottom: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const contentPreviewStyles = css`
  font-size: 12px;
  color: #5c4d42;
  line-height: 1.5;
  margin-bottom: 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  border-left: 2px solid rgba(212, 175, 55, 0.3);
`;

const contentExpandedStyles = css`
  font-size: 12px;
  color: #5c4d42;
  line-height: 1.5;
  margin-bottom: 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  border-left: 2px solid rgba(212, 175, 55, 0.5);
  max-height: 400px;
  overflow-y: auto;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 0, 0, 0.4);
  }

  /* Preserve formatting from HTML content */
  p {
    margin: 0 0 8px 0;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 12px 0 6px 0;
    color: #3e3226;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  a {
    color: #d4af37;
    text-decoration: underline;
  }
`;

const expandButtonStyles = css`
  font-size: 11px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid rgba(184, 156, 130, 0.3);
  border-radius: 4px;
  color: #8b7355;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  width: 100%;
  font-weight: 500;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: rgba(212, 175, 55, 0.5);
  }
`;

const tagsStyles = css`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const tagStyles = css`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(212, 175, 55, 0.15);
  color: #8b7355;
  font-weight: 500;
  border: 1px solid rgba(212, 175, 55, 0.3);
`;

const actionsStyles = css`
  display: flex;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(184, 156, 130, 0.15);
`;

const restoreButtonStyles = css`
  flex: 1;
  padding: 6px 8px;
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(46, 125, 50, 0.3);
  }
`;

const deleteButtonStyles = css`
  flex: 1;
  padding: 6px 8px;
  background: rgba(139, 0, 0, 0.1);
  color: #8b0000;
  border: 1px solid rgba(139, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 0, 0, 0.2);
    transform: translateY(-1px);
  }
`;

const footerStyles = css`
  padding: 12px 16px;
  border-top: 1px solid rgba(184, 156, 130, 0.2);
  text-align: center;
  font-size: 12px;
  color: #8b7355;
  background: linear-gradient(to top, rgba(255, 215, 0, 0.03), transparent);
`;
