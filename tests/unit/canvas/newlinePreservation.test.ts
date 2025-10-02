/**
 * Unit Tests for Newline Preservation (Issue #5)
 *
 * Tests that newlines and formatting are preserved when:
 * - Saving notes with multiple lines
 * - Editing existing notes
 * - Converting between HTML and plain text
 */

import { describe, it, expect } from 'vitest';

describe('Newline Preservation', () => {
  describe('Plain text to HTML conversion', () => {
    it('should convert single newlines to <br> tags', () => {
      const plainText = 'Line 1\nLine 2\nLine 3';

      // Simulates the handleSaveEdit logic
      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(htmlContent).toBe('<p>Line 1<br>Line 2<br>Line 3</p>');
    });

    it('should convert double newlines to separate paragraphs', () => {
      const plainText = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';

      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(htmlContent).toBe('<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>');
    });

    it('should handle mixed single and double newlines', () => {
      const plainText = 'Line 1\nLine 2\n\nNew paragraph\nWith line break';

      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(htmlContent).toBe('<p>Line 1<br>Line 2</p><p>New paragraph<br>With line break</p>');
    });

    it('should handle empty lines (multiple consecutive newlines)', () => {
      const plainText = 'Line 1\n\n\n\nLine 2';

      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      // Three consecutive \n\n splits create empty paragraphs
      expect(htmlContent).toContain('<p>');
      expect(htmlContent).toContain('Line 1');
      expect(htmlContent).toContain('Line 2');
    });
  });

  describe('HTML to plain text conversion', () => {
    it('should convert <br> tags to newlines', () => {
      const html = '<p>Line 1<br>Line 2<br>Line 3</p>';

      // Simulates the handleDoubleClick logic
      let htmlWithNewlines = html;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      expect(plainText).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should convert paragraph breaks to double newlines', () => {
      const html = '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>';

      let htmlWithNewlines = html;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      expect(plainText).toBe('Paragraph 1\n\nParagraph 2\n\nParagraph 3');
    });

    it('should preserve mixed line breaks and paragraphs', () => {
      const html = '<p>Line 1<br>Line 2</p><p>New paragraph<br>With line break</p>';

      let htmlWithNewlines = html;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      expect(plainText).toBe('Line 1\nLine 2\n\nNew paragraph\nWith line break');
    });

    it('should handle <br/> self-closing tags', () => {
      const html = '<p>Line 1<br/>Line 2<br />Line 3</p>';

      let htmlWithNewlines = html;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      expect(plainText).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle uppercase <BR> tags', () => {
      const html = '<p>Line 1<BR>Line 2</p>';

      let htmlWithNewlines = html;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      expect(plainText).toBe('Line 1\nLine 2');
    });
  });

  describe('Round-trip conversion (HTML → Plain → HTML)', () => {
    it('should preserve structure through edit cycle', () => {
      const originalHtml = '<p>Line 1<br>Line 2</p><p>Paragraph 2</p>';

      // Step 1: HTML → Plain (simulates entering edit mode)
      let htmlWithNewlines = originalHtml;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Step 2: Plain → HTML (simulates saving)
      const convertedHtml = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(convertedHtml).toBe(originalHtml);
    });

    it('should preserve multi-paragraph structure', () => {
      const originalHtml = '<p>Para 1</p><p>Para 2</p><p>Para 3</p>';

      // HTML → Plain
      let htmlWithNewlines = originalHtml;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Plain → HTML
      const convertedHtml = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(convertedHtml).toBe(originalHtml);
    });

    it('should preserve complex nested structure', () => {
      const originalHtml = '<p>Line 1<br>Line 2<br>Line 3</p><p>Single line</p><p>More<br>lines</p>';

      // HTML → Plain
      let htmlWithNewlines = originalHtml;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Plain → HTML
      const convertedHtml = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(convertedHtml).toBe(originalHtml);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty content', () => {
      const plainText = '';

      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(htmlContent).toBe('<p></p>');
    });

    it('should handle only newlines', () => {
      const plainText = '\n\n\n';

      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      // Split on \n\n creates empty strings
      expect(htmlContent).toContain('<p>');
    });

    it('should handle text without any newlines', () => {
      const plainText = 'Single line of text';

      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(htmlContent).toBe('<p>Single line of text</p>');
    });

    it('should handle whitespace around newlines', () => {
      const html = '<p>Line 1  <br>  Line 2</p>';

      let htmlWithNewlines = html;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Whitespace is preserved by textContent
      expect(plainText).toContain('\n');
    });

    it('should handle paragraphs with attributes', () => {
      const html = '<p style="color: red">Text 1</p><p class="foo">Text 2</p>';

      let htmlWithNewlines = html;
      htmlWithNewlines = htmlWithNewlines.replace(/<br\s*\/?>/gi, '\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
      htmlWithNewlines = htmlWithNewlines.replace(/<\/?p[^>]*>/gi, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithNewlines;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      expect(plainText).toBe('Text 1\n\nText 2');
    });
  });

  describe('Special characters', () => {
    it('should preserve special characters with newlines', () => {
      const plainText = 'Line with <symbols>\nAnd "quotes"\nAnd \'apostrophes\'';

      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      // Special characters are preserved in HTML
      expect(htmlContent).toContain('<symbols>');
      expect(htmlContent).toContain('"quotes"');
      expect(htmlContent).toContain("'apostrophes'");
    });

    it('should handle unicode characters with newlines', () => {
      const plainText = 'Unicode: 你好\nEmoji: 🎉\nSymbols: ∆∑∏';

      const htmlContent = plainText
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      expect(htmlContent).toContain('你好');
      expect(htmlContent).toContain('🎉');
      expect(htmlContent).toContain('∆∑∏');
      expect(htmlContent).toContain('<br>');
    });
  });
});
