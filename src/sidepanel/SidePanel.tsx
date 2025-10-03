/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useState, useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Card } from '@/types/card';
import { useCards } from '@/shared/hooks/useCards';
import { useCardOperations } from '@/shared/hooks/useCardOperations';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { ImageUploadZone, FilePickerButton } from '@/shared/components/ImageUpload';
import { useFontSize } from '@/shared/hooks/useFontSize';
import { FontSizeSelector } from '@/components/FontSizeSelector';
import { SidePanelChat } from './SidePanelChat';
import { saveCard } from '@/utils/storage';

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
  const { fontSizeValues } = useFontSize();

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

  // Handle save conversation to canvas
  const handleSaveToCanvas = async (card: Card) => {
    try {
      await saveCard(card);
      console.log('[SidePanel] Conversation saved to canvas:', card.id);
      // Broadcast update event for canvas to refresh
      window.dispatchEvent(new CustomEvent('nabokov:cards-updated'));
      refreshCards();
    } catch (error) {
      console.error('[SidePanel] Error saving to canvas:', error);
      throw error;
    }
  };

  // Handle save conversation to stash
  const handleSaveToStash = async (card: Card) => {
    try {
      await saveCard(card);
      console.log('[SidePanel] Conversation saved to stash:', card.id);
      // Broadcast stash update event
      window.dispatchEvent(new CustomEvent('nabokov:stash-updated'));
      refreshCards();
    } catch (error) {
      console.error('[SidePanel] Error saving to stash:', error);
      throw error;
    }
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCardTypeBadge = (cardType?: string) => {
    const type = cardType || 'clipped';
    const badges = {
      image: { label: 'Image', emoji: '📷' },
      note: { label: 'Note', emoji: '📝' },
      generated: { label: 'Generated', emoji: '✨' },
      clipped: { label: 'Clipped', emoji: '🌐' },
    };
    return badges[type as keyof typeof badges] || badges.clipped;
  };

  return (
    <ImageUploadZone onImageUpload={handleImageDrop}>
      <div css={containerStyles}>
        {/* Header */}
        <div css={headerStyles}>
          <h1 css={titleStyles}>📦 Stashed Cards</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FontSizeSelector />
            <button onClick={handleOpenCanvas} css={openCanvasButtonStyles} title="Open Canvas">
              🗺️ Canvas
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <SidePanelChat
          onSaveToCanvas={handleSaveToCanvas}
          onSaveToStash={handleSaveToStash}
        />

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
            const badge = getCardTypeBadge(card.cardType);

            // Sanitize content
            const contentToDisplay = card.beautifiedContent || card.content;
            const sanitizedContent = contentToDisplay
              ? DOMPurify.sanitize(contentToDisplay, {
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
                {/* Compact Header - Single line */}
                <div css={compactHeaderStyles}>
                  <div css={headerInfoStyles}>
                    {card.metadata.favicon && <span css={faviconStyles}>{card.metadata.favicon}</span>}
                    <span css={domainStyles}>{card.metadata.domain}</span>
                    <span css={separatorStyles}>•</span>
                    <span css={dateStyles}>{formatDate(card.createdAt)}</span>
                  </div>
                  <div css={actionButtonsStyles}>
                    <button onClick={() => handleRestore(card)} css={iconButtonStyles} title="Restore to canvas">
                      ↩️
                    </button>
                    <button onClick={() => handleDelete(card)} css={iconButtonStyles} title="Delete permanently">
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Compact Title with tags inline */}
                <div css={compactTitleRowStyles}>
                  <span css={getCompactTitleStyles(fontSizeValues.title)} title={card.metadata.title}>
                    {truncateText(card.metadata.title, 60)}
                  </span>
                  {card.tags && card.tags.length > 0 && (
                    <div css={inlineTagsStyles}>
                      {card.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} css={compactTagStyles}>{tag}</span>
                      ))}
                      {card.tags.length > 3 && <span css={compactTagStyles}>+{card.tags.length - 3}</span>}
                    </div>
                  )}
                </div>

                {/* CRITICAL: Image Display for Image Cards */}
                {card.cardType === 'image' && card.imageData ? (
                  <div css={imageContainerStyles}>
                    <img
                      src={card.imageData}
                      alt={card.metadata.title}
                      css={imageStyles}
                    />
                  </div>
                ) : (
                  /* Content Display for Non-Image Cards */
                  card.content && (
                    <>
                      <div
                        css={isExpanded ? getContentExpandedStyles(fontSizeValues.content) : getContentCollapsedStyles(fontSizeValues.content)}
                      >
                        {/* Render markdown if beautified, otherwise show HTML */}
                        {card.beautifiedContent ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({node, ...props}) => <h2 css={getMarkdownH1(fontSizeValues.h1)} {...props} />,
                              h2: ({node, ...props}) => <h3 css={getMarkdownH2(fontSizeValues.h2)} {...props} />,
                              h3: ({node, ...props}) => <h4 css={getMarkdownH3(fontSizeValues.h3)} {...props} />,
                              p: ({node, ...props}) => <p css={markdownP} {...props} />,
                              ul: ({node, ...props}) => <ul css={markdownUl} {...props} />,
                              ol: ({node, ...props}) => <ol css={markdownOl} {...props} />,
                              li: ({node, ...props}) => <li css={markdownLi} {...props} />,
                              strong: ({node, ...props}) => <strong css={markdownStrong} {...props} />,
                              code: ({node, ...props}) => <code css={getMarkdownCode(fontSizeValues.code)} {...props} />,
                            }}
                          >
                            {card.beautifiedContent}
                          </ReactMarkdown>
                        ) : (
                          <div
                            css={getContentHTMLStyles(fontSizeValues.contentHTML)}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                          />
                        )}
                      </div>

                      {/* Expand/Collapse Button */}
                      {sanitizedContent.length > 200 && (
                        <button
                          onClick={() => toggleCardExpansion(card.id)}
                          css={expandButtonStyles}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      )}
                    </>
                  )
                )}
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

// CRITICAL: Compact Card Styles - Maximize content space
const cardItemStyles = css`
  background: linear-gradient(135deg, rgba(250, 247, 242, 0.98) 0%, rgba(242, 235, 225, 0.98) 100%);
  border-radius: 8px;
  box-shadow:
    0 1px 4px rgba(92, 77, 66, 0.08),
    0 4px 12px rgba(92, 77, 66, 0.1);
  border: 1px solid rgba(184, 156, 130, 0.2);
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    box-shadow:
      0 2px 6px rgba(92, 77, 66, 0.12),
      0 6px 16px rgba(92, 77, 66, 0.14);
    border-color: rgba(212, 175, 55, 0.4);
  }
`;

// Compact header - everything on one line
const compactHeaderStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(184, 156, 130, 0.1);
`;

const headerInfoStyles = css`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  font-size: 9px;
  color: #A89684;
`;

const faviconStyles = css`
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  font-size: 12px;
`;

const domainStyles = css`
  font-size: 9px;
  color: #8B7355;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const separatorStyles = css`
  color: #D4AF37;
  font-size: 8px;
  margin: 0 2px;
`;

const dateStyles = css`
  font-size: 9px;
  color: #A89684;
  white-space: nowrap;
`;

// Action buttons in header (icon-only)
const actionButtonsStyles = css`
  display: flex;
  gap: 4px;
`;

const iconButtonStyles = css`
  background: transparent;
  border: none;
  padding: 2px 4px;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
  transition: all 0.15s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  &:first-of-type:hover {
    filter: drop-shadow(0 0 3px rgba(46, 125, 50, 0.6));
  }

  &:last-of-type:hover {
    filter: drop-shadow(0 0 3px rgba(139, 0, 0, 0.6));
  }
`;

// Compact title row with inline tags
const compactTitleRowStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  min-height: 20px;
  border-bottom: 1px solid rgba(184, 156, 130, 0.08);
`;

// Converted to function to accept dynamic font sizes
const getCompactTitleStyles = (fontSize: string) => css`
  font-size: ${fontSize};
  font-weight: 600;
  color: #3E3226;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`;

// Inline tags (smaller, fewer shown)
const inlineTagsStyles = css`
  display: flex;
  gap: 3px;
  flex-shrink: 0;
`;

const compactTagStyles = css`
  font-size: 8px;
  padding: 2px 5px;
  border-radius: 3px;
  background: rgba(212, 175, 55, 0.12);
  color: #8B7355;
  font-weight: 500;
  border: 1px solid rgba(212, 175, 55, 0.2);
  white-space: nowrap;
`;

// CRITICAL: Image Display Styles (more compact)
const imageContainerStyles = css`
  width: 100%;
  max-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
  padding: 8px;
  margin: 0 6px 6px 6px;
  border-radius: 6px;
`;

const imageStyles = css`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

// Content Styles (maximize space, minimal padding)
const getContentCollapsedStyles = (fontSize: string) => css`
  max-height: 150px;
  overflow: hidden;
  padding: 8px;
  font-size: ${fontSize};
  color: #5C4D42;
  line-height: 1.5;
  border-left: 2px solid rgba(212, 175, 55, 0.3);
  background: rgba(0, 0, 0, 0.015);
  margin: 0 6px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: linear-gradient(transparent, rgba(242, 235, 225, 0.95));
  }
`;

const getContentExpandedStyles = (fontSize: string) => css`
  max-height: 500px;
  overflow-y: auto;
  padding: 8px;
  font-size: ${fontSize};
  color: #5C4D42;
  line-height: 1.5;
  border-left: 2px solid rgba(212, 175, 55, 0.5);
  background: rgba(0, 0, 0, 0.015);
  margin: 0 6px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 0, 0, 0.2);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 0, 0, 0.4);
  }
`;

const getContentHTMLStyles = (fontSize: string) => css`
  font-size: ${fontSize};
  color: #5C4D42;
  line-height: 1.6;
  word-break: break-word;

  p {
    margin: 0 0 8px 0;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 12px 0 6px 0;
    color: #3E3226;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  a {
    color: #D4AF37;
    text-decoration: underline;
  }
`;

const expandButtonStyles = css`
  width: calc(100% - 12px);
  margin: 4px 6px;
  padding: 3px;
  background: transparent;
  border: 1px solid rgba(184, 156, 130, 0.2);
  border-radius: 3px;
  color: #8B7355;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;

  &:hover {
    background: rgba(212, 175, 55, 0.08);
    border-color: rgba(212, 175, 55, 0.4);
  }
`;

// Markdown Styles (for ReactMarkdown) - more compact
const getMarkdownH1 = (fontSize: string) => css`
  font-size: ${fontSize};
  font-weight: 600;
  color: #8B0000;
  margin: 8px 0 4px 0;
`;

const getMarkdownH2 = (fontSize: string) => css`
  font-size: ${fontSize};
  font-weight: 600;
  color: #8B7355;
  margin: 6px 0 3px 0;
`;

const getMarkdownH3 = (fontSize: string) => css`
  font-size: ${fontSize};
  font-weight: 600;
  color: #5C4D42;
  margin: 4px 0 2px 0;
`;

const markdownP = css`
  margin: 4px 0;
`;

const markdownUl = css`
  margin: 4px 0 4px 16px;
`;

const markdownOl = css`
  margin: 4px 0 4px 16px;
`;

const markdownLi = css`
  margin: 2px 0;
`;

const markdownStrong = css`
  color: #8B0000;
  font-weight: 600;
`;

const getMarkdownCode = (fontSize: string) => css`
  background: rgba(245, 245, 220, 0.5);
  border: 1px solid rgba(184, 156, 130, 0.2);
  padding: 1px 3px;
  border-radius: 2px;
  font-size: ${fontSize};
  font-family: Monaco, Menlo, monospace;
`;

const footerStyles = css`
  padding: 12px 16px;
  border-top: 1px solid rgba(184, 156, 130, 0.2);
  text-align: center;
  font-size: 12px;
  color: #8b7355;
  background: linear-gradient(to top, rgba(255, 215, 0, 0.03), transparent);
`;
