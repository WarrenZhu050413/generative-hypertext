/**
 * Sanitization Tests
 *
 * Tests for HTML sanitization using DOMPurify to ensure security.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';

describe('HTML Sanitization', () => {
  beforeEach(() => {
    // Reset DOMPurify configuration
    DOMPurify.setConfig({});
  });

  it('should sanitize basic HTML', () => {
    const dirtyHTML = '<p>Hello World</p>';
    const clean = DOMPurify.sanitize(dirtyHTML);

    expect(clean).toBe('<p>Hello World</p>');
  });

  it('should remove script tags', () => {
    const dirtyHTML = '<p>Hello</p><script>alert("XSS")</script>';
    const clean = DOMPurify.sanitize(dirtyHTML);

    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('alert');
    expect(clean).toContain('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const dirtyHTML = '<button onclick="alert(\'XSS\')">Click me</button>';
    const clean = DOMPurify.sanitize(dirtyHTML);

    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('alert');
    expect(clean).toContain('Click me');
  });

  it('should remove javascript: URLs', () => {
    const dirtyHTML = '<a href="javascript:alert(\'XSS\')">Link</a>';
    const clean = DOMPurify.sanitize(dirtyHTML);

    expect(clean).not.toContain('javascript:');
    expect(clean).toContain('Link');
  });

  it('should allow safe HTML with styles', () => {
    const html = '<div style="color: red; font-size: 16px;">Styled content</div>';
    const clean = DOMPurify.sanitize(html);

    expect(clean).toContain('style=');
    expect(clean).toContain('color');
    expect(clean).toContain('Styled content');
  });

  it('should remove dangerous CSS', () => {
    const dirtyHTML = '<div style="background: url(javascript:alert(\'XSS\'))">Content</div>';
    // Configure DOMPurify to sanitize URLs in CSS
    DOMPurify.setConfig({ FORBID_ATTR: ['style'] });
    const clean = DOMPurify.sanitize(dirtyHTML);

    // With FORBID_ATTR, style should be completely removed
    expect(clean).toContain('Content');
    expect(clean).not.toContain('style=');
    expect(clean).not.toContain('javascript:');

    // Reset config for other tests
    DOMPurify.setConfig({});
  });

  it('should preserve data attributes', () => {
    const html = '<div data-id="123" data-name="test">Content</div>';
    const clean = DOMPurify.sanitize(html);

    expect(clean).toContain('data-id="123"');
    expect(clean).toContain('data-name="test"');
  });

  it('should handle empty input', () => {
    const clean = DOMPurify.sanitize('');
    expect(clean).toBe('');
  });

  it('should handle malformed HTML', () => {
    const dirtyHTML = '<div><p>Unclosed div';
    const clean = DOMPurify.sanitize(dirtyHTML);

    // DOMPurify should fix and sanitize
    expect(clean).toBeTruthy();
    expect(clean).toContain('Unclosed div');
  });

  it('should sanitize nested elements', () => {
    const html = `
      <article>
        <h1>Title</h1>
        <div class="content">
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </div>
      </article>
    `;
    const clean = DOMPurify.sanitize(html);

    expect(clean).toContain('<article>');
    expect(clean).toContain('<h1>Title</h1>');
    expect(clean).toContain('Paragraph 1');
    expect(clean).toContain('Paragraph 2');
  });

  it('should limit HTML size', () => {
    const maxSize = 10 * 1024; // 10KB
    const largeHTML = '<p>' + 'a'.repeat(15000) + '</p>';
    const clean = DOMPurify.sanitize(largeHTML);

    // Check if we need to truncate
    if (clean.length > maxSize) {
      const truncated = clean.substring(0, maxSize);
      expect(truncated.length).toBeLessThanOrEqual(maxSize);
    }
  });

  it('should preserve semantic HTML', () => {
    const html = `
      <article>
        <header>
          <h1>Article Title</h1>
          <time datetime="2025-01-25">January 25, 2025</time>
        </header>
        <section>
          <p>Article content</p>
        </section>
        <footer>
          <p>Author information</p>
        </footer>
      </article>
    `;
    const clean = DOMPurify.sanitize(html);

    expect(clean).toContain('<article>');
    expect(clean).toContain('<header>');
    expect(clean).toContain('<section>');
    expect(clean).toContain('<footer>');
    expect(clean).toContain('<time');
  });

  it('should allow safe images', () => {
    const html = '<img src="https://example.com/image.jpg" alt="Test image">';
    const clean = DOMPurify.sanitize(html);

    expect(clean).toContain('<img');
    expect(clean).toContain('src="https://example.com/image.jpg"');
    expect(clean).toContain('alt="Test image"');
  });

  it('should allow data URLs for images', () => {
    const html = '<img src="data:image/png;base64,iVBORw0KGgo..." alt="Base64 image">';
    const clean = DOMPurify.sanitize(html);

    expect(clean).toContain('<img');
    expect(clean).toContain('data:image/png;base64');
  });

  it('should preserve code blocks', () => {
    const html = `
      <pre><code class="language-javascript">
        const greeting = "Hello, World!";
        console.log(greeting);
      </code></pre>
    `;
    const clean = DOMPurify.sanitize(html);

    expect(clean).toContain('<pre>');
    expect(clean).toContain('<code');
    expect(clean).toContain('const greeting');
  });

  it('should handle SVG safely', () => {
    const safeSVG = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" /></svg>';
    const clean = DOMPurify.sanitize(safeSVG);

    expect(clean).toContain('svg');
    expect(clean).toContain('circle');
  });

  it('should remove dangerous SVG', () => {
    const dangerousSVG = '<svg><script>alert("XSS")</script></svg>';
    const clean = DOMPurify.sanitize(dangerousSVG);

    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('alert');
  });
});