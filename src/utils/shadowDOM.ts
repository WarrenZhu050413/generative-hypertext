/**
 * Shadow DOM Utilities with Emotion Styling Support
 *
 * This module provides utilities for creating and managing Shadow DOM with Emotion CSS-in-JS styling.
 * It enables style isolation for React components in browser extension contexts while maintaining
 * full Emotion styling capabilities.
 *
 * @module shadowDOM
 */

import React, { ReactElement, ComponentType } from 'react';
import ReactDOM from 'react-dom/client';
import createCache, { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

/**
 * Chinese aesthetic color palette inspired by traditional ink painting
 * and classical Chinese design principles
 */
export const CHINESE_AESTHETIC_COLORS = {
  // Primary ink tones
  ink: '#2C3E50',           // Deep ink black (墨黑)
  inkLight: '#5D6D7E',      // Light ink gray (淡墨)
  inkWash: '#95A5A6',       // Ink wash (水墨)

  // Paper and background
  rice: '#FDF6E3',          // Rice paper (宣纸)
  silk: '#F8F4E8',          // Aged silk (绢)
  bamboo: '#E8DCC4',        // Bamboo paper (竹纸)

  // Traditional pigments
  cinnabar: '#C23B22',      // Cinnabar red (朱砂)
  indigo: '#2E4057',        // Indigo blue (靛青)
  ochre: '#D4A574',         // Yellow ochre (赭石)
  verdigris: '#5B8C85',     // Verdigris green (石绿)
  azurite: '#4A7C8C',       // Azurite blue (石青)

  // Accents
  gold: '#D4AF37',          // Gold leaf (金箔)
  lotus: '#F4C2C2',         // Lotus pink (荷花粉)
  jade: '#87CEEB',          // Jade (玉)
  plum: '#8B4789',          // Plum blossom (梅花)

  // Neutrals
  mist: '#E8E8E8',          // Morning mist (晨雾)
  stone: '#A8A8A8',         // Stone gray (石灰)
  shadow: 'rgba(44, 62, 80, 0.1)', // Shadow (阴影)
};

/**
 * Global styles for Shadow DOM content incorporating Chinese aesthetic principles
 *
 * Features:
 * - Traditional color palette
 * - Typography inspired by classical Chinese calligraphy
 * - Subtle textures reminiscent of rice paper
 * - Harmonious spacing based on 8px grid system
 */
export const CHINESE_AESTHETIC_STYLES = `
  :host {
    /* CSS Custom Properties for Chinese Aesthetic */
    --color-ink: ${CHINESE_AESTHETIC_COLORS.ink};
    --color-ink-light: ${CHINESE_AESTHETIC_COLORS.inkLight};
    --color-ink-wash: ${CHINESE_AESTHETIC_COLORS.inkWash};
    --color-rice: ${CHINESE_AESTHETIC_COLORS.rice};
    --color-silk: ${CHINESE_AESTHETIC_COLORS.silk};
    --color-bamboo: ${CHINESE_AESTHETIC_COLORS.bamboo};
    --color-cinnabar: ${CHINESE_AESTHETIC_COLORS.cinnabar};
    --color-indigo: ${CHINESE_AESTHETIC_COLORS.indigo};
    --color-ochre: ${CHINESE_AESTHETIC_COLORS.ochre};
    --color-verdigris: ${CHINESE_AESTHETIC_COLORS.verdigris};
    --color-azurite: ${CHINESE_AESTHETIC_COLORS.azurite};
    --color-gold: ${CHINESE_AESTHETIC_COLORS.gold};
    --color-lotus: ${CHINESE_AESTHETIC_COLORS.lotus};
    --color-jade: ${CHINESE_AESTHETIC_COLORS.jade};
    --color-plum: ${CHINESE_AESTHETIC_COLORS.plum};
    --color-mist: ${CHINESE_AESTHETIC_COLORS.mist};
    --color-stone: ${CHINESE_AESTHETIC_COLORS.stone};
    --color-shadow: ${CHINESE_AESTHETIC_COLORS.shadow};

    /* Spacing system (8px grid) */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-xxl: 48px;

    /* Typography */
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    --font-size-sm: 12px;
    --font-size-base: 14px;
    --font-size-lg: 16px;
    --font-size-xl: 20px;
    --font-size-xxl: 24px;

    /* Border radius */
    --radius-sm: 2px;
    --radius-md: 4px;
    --radius-lg: 8px;

    /* Shadows - subtle like ink wash */
    --shadow-sm: 0 1px 2px var(--color-shadow);
    --shadow-md: 0 2px 8px var(--color-shadow);
    --shadow-lg: 0 4px 16px var(--color-shadow);

    /* Transitions */
    --transition-fast: 150ms ease-in-out;
    --transition-base: 250ms ease-in-out;
    --transition-slow: 350ms ease-in-out;
  }

  /* Base styles for content */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body, #root {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--color-ink);
    background-color: var(--color-rice);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Scrollbar styling with Chinese aesthetic */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-bamboo);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-ink-wash);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-ink-light);
  }

  /* Typography elements */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    color: var(--color-ink);
    margin-bottom: var(--spacing-md);
  }

  h1 { font-size: var(--font-size-xxl); }
  h2 { font-size: var(--font-size-xl); }
  h3 { font-size: var(--font-size-lg); }

  p {
    margin-bottom: var(--spacing-sm);
  }

  a {
    color: var(--color-azurite);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--color-indigo);
    text-decoration: underline;
  }

  /* Button styling with Chinese aesthetic */
  button {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-ink-wash);
    border-radius: var(--radius-md);
    background-color: var(--color-silk);
    color: var(--color-ink);
    cursor: pointer;
    transition: all var(--transition-base);
  }

  button:hover {
    background-color: var(--color-bamboo);
    border-color: var(--color-ink-light);
    box-shadow: var(--shadow-sm);
  }

  button:active {
    transform: translateY(1px);
    box-shadow: none;
  }

  /* Input styling */
  input, textarea, select {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    padding: var(--spacing-sm);
    border: 1px solid var(--color-ink-wash);
    border-radius: var(--radius-md);
    background-color: var(--color-rice);
    color: var(--color-ink);
    transition: border-color var(--transition-fast);
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--color-azurite);
    box-shadow: 0 0 0 3px rgba(74, 124, 140, 0.1);
  }

  /* Card-like containers */
  .card {
    background-color: var(--color-silk);
    border: 1px solid var(--color-bamboo);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-base);
  }

  .card:hover {
    box-shadow: var(--shadow-md);
  }
`;

/**
 * Result of creating a shadow root with style support
 */
export interface ShadowRootResult {
  /** The created shadow root */
  shadowRoot: ShadowRoot;
  /** Emotion cache for styling within the shadow DOM */
  styleCache: EmotionCache;
  /** The container div for React mounting */
  container: HTMLDivElement;
}

/**
 * Creates a shadow root with Emotion style cache injection
 *
 * This function creates a shadow DOM with mode 'open' and sets up an Emotion cache
 * that targets the shadow root for style injection. This enables CSS-in-JS styling
 * within the isolated shadow DOM context.
 *
 * @param hostElement - The DOM element to attach the shadow root to
 * @param options - Optional configuration for shadow root creation
 * @returns Object containing the shadow root and Emotion style cache
 *
 * @example
 * ```typescript
 * const container = document.createElement('div');
 * document.body.appendChild(container);
 *
 * const { shadowRoot, styleCache } = createShadowRoot(container);
 *
 * // Now you can use shadowRoot and styleCache with React and Emotion
 * ```
 */
export function createShadowRoot(
  hostElement: HTMLElement | string,
  options?: {
    /** Whether to inject Chinese aesthetic base styles */
    injectBaseStyles?: boolean;
    /** Custom nonce for CSP compliance */
    nonce?: string;
  }
): ShadowRootResult {
  const { injectBaseStyles = true, nonce } = options || {};

  // Handle string ID
  let host: HTMLElement;
  if (typeof hostElement === 'string') {
    let existingHost = document.getElementById(hostElement);
    if (!existingHost) {
      existingHost = document.createElement('div');
      existingHost.id = hostElement;
      document.body.appendChild(existingHost);
    }
    host = existingHost;
  } else {
    host = hostElement;
  }

  // Check if shadow root already exists
  let shadowRoot = host.shadowRoot;

  if (!shadowRoot) {
    // Create new shadow root
    shadowRoot = host.attachShadow({ mode: 'open' });
  }

  // Create Emotion cache that targets the shadow root
  const styleCache = createCache({
    key: 'shadow',
    container: shadowRoot as unknown as HTMLElement,
    nonce,
    // Prepend styles to allow user overrides
    prepend: true,
  });

  // Create container for React
  const container = document.createElement('div');
  container.id = 'root';
  shadowRoot.appendChild(container);

  // Inject base styles if requested
  if (injectBaseStyles && shadowRoot.childNodes.length === 1) {
    injectGlobalStyles(shadowRoot, CHINESE_AESTHETIC_STYLES);
  }

  return { shadowRoot, styleCache, container };
}

/**
 * Mounts a React component inside a shadow DOM with Emotion support
 *
 * This function creates an Emotion cache provider and mounts a React component
 * using React 18's createRoot API. It ensures that all Emotion-generated styles
 * are properly injected into the shadow DOM.
 *
 * @param shadowRoot - The shadow root to mount the component in
 * @param component - The React element to render
 * @param options - Optional configuration
 * @returns Cleanup function that unmounts the component
 *
 * @example
 * ```typescript
 * const { shadowRoot, styleCache } = createShadowRoot(container);
 *
 * const cleanup = mountReactInShadow(
 *   shadowRoot,
 *   <App />,
 *   { styleCache }
 * );
 *
 * // Later, to unmount:
 * cleanup();
 * ```
 */
export function mountReactInShadow(
  shadowRoot: ShadowRoot,
  component: ReactElement,
  options?: {
    /** Optional pre-created Emotion cache (if not provided, one will be created) */
    styleCache?: EmotionCache;
    /** Custom nonce for CSP compliance */
    nonce?: string;
  }
): () => void {
  const { styleCache: providedCache, nonce } = options || {};

  // Create or use provided Emotion cache
  const styleCache = providedCache || createCache({
    key: 'shadow-react',
    container: shadowRoot as unknown as HTMLElement,
    nonce,
    prepend: true,
  });

  // Create a container div for React
  const reactContainer = document.createElement('div');
  reactContainer.id = 'react-root';
  shadowRoot.appendChild(reactContainer);

  // Create React root and render with Emotion cache provider
  const root = ReactDOM.createRoot(reactContainer);

  root.render(
    React.createElement(
      CacheProvider,
      { value: styleCache },
      component
    )
  );

  // Return cleanup function
  return () => {
    root.unmount();
    if (reactContainer.parentNode) {
      reactContainer.parentNode.removeChild(reactContainer);
    }
  };
}

/**
 * Injects global CSS styles into a shadow DOM
 *
 * This function creates a style element and injects CSS string into the shadow DOM.
 * It prevents duplicate injection by checking for existing style tags with the same ID.
 *
 * @param shadowRoot - The shadow root to inject styles into
 * @param styles - CSS string to inject
 * @param options - Optional configuration
 *
 * @example
 * ```typescript
 * injectGlobalStyles(shadowRoot, `
 *   .my-custom-class {
 *     color: var(--color-ink);
 *     padding: var(--spacing-md);
 *   }
 * `);
 * ```
 */
export function injectGlobalStyles(
  shadowRoot: ShadowRoot,
  styles: string,
  options?: {
    /** Unique ID for the style tag (prevents duplicates) */
    id?: string;
    /** Custom nonce for CSP compliance */
    nonce?: string;
  }
): void {
  const { id = 'shadow-global-styles', nonce } = options || {};

  // Check if styles with this ID already exist
  const existingStyle = shadowRoot.getElementById(id);
  if (existingStyle) {
    // Update existing styles
    existingStyle.textContent = styles;
    return;
  }

  // Create new style element
  const styleElement = document.createElement('style');
  styleElement.id = id;
  styleElement.textContent = styles;

  if (nonce) {
    styleElement.setAttribute('nonce', nonce);
  }

  // Prepend to shadow root to allow component styles to override
  shadowRoot.insertBefore(styleElement, shadowRoot.firstChild);
}

/**
 * Higher-Order Component that automatically wraps a component in shadow DOM
 *
 * This HOC provides automatic style isolation for any React component. It creates
 * a shadow root, mounts the component inside it, and handles cleanup on unmount.
 *
 * @param Component - The React component to isolate
 * @param options - Optional configuration
 * @returns Wrapped component with shadow DOM isolation
 *
 * @example
 * ```typescript
 * const IsolatedButton = isolateStyles(({ onClick, children }) => (
 *   <button onClick={onClick}>{children}</button>
 * ));
 *
 * // Use like a normal component
 * <IsolatedButton onClick={handleClick}>Click Me</IsolatedButton>
 * ```
 */
export function isolateStyles<P extends object>(
  Component: ComponentType<P>,
  options?: {
    /** Whether to inject Chinese aesthetic base styles */
    injectBaseStyles?: boolean;
    /** Custom nonce for CSP compliance */
    nonce?: string;
    /** Custom container class name */
    containerClassName?: string;
  }
): ComponentType<P> {
  const { injectBaseStyles = true, nonce, containerClassName } = options || {};

  return function IsolatedComponent(props: P) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const cleanupRef = React.useRef<(() => void) | null>(null);

    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Create shadow root with style cache
      const { shadowRoot, styleCache } = createShadowRoot(container, {
        injectBaseStyles,
        nonce,
      });

      // Mount React component in shadow DOM
      cleanupRef.current = mountReactInShadow(
        shadowRoot,
        React.createElement(Component, props),
        { styleCache, nonce }
      );

      // Cleanup on unmount
      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    }, [props]);

    return React.createElement('div', {
      ref: containerRef,
      className: containerClassName,
      style: { display: 'contents' },
    });
  };
}

/**
 * Utility to check if an element is inside a shadow root
 *
 * @param element - The element to check
 * @returns True if the element is in a shadow DOM
 */
export function isInShadowRoot(element: Element): boolean {
  let root: Node | null = element.getRootNode();
  return root instanceof ShadowRoot;
}

/**
 * Gets the shadow root that contains an element
 *
 * @param element - The element to find the shadow root for
 * @returns The shadow root, or null if not in a shadow DOM
 */
export function getShadowRoot(element: Element): ShadowRoot | null {
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root : null;
}

/**
 * Creates a portal target element inside a shadow root
 * Useful for modals, tooltips, and overlays
 *
 * @param shadowRoot - The shadow root to create the portal target in
 * @param id - ID for the portal target element
 * @returns The created portal target element
 *
 * @example
 * ```typescript
 * const portalTarget = createPortalTarget(shadowRoot, 'modal-portal');
 *
 * // Use with React portal
 * ReactDOM.createPortal(<Modal />, portalTarget);
 * ```
 */
export function createPortalTarget(
  shadowRoot: ShadowRoot,
  id: string = 'portal-root'
): HTMLDivElement {
  // Check if portal target already exists
  let portalTarget = shadowRoot.getElementById(id) as HTMLDivElement | null;

  if (!portalTarget) {
    portalTarget = document.createElement('div');
    portalTarget.id = id;
    portalTarget.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      pointer-events: none;
    `;
    shadowRoot.appendChild(portalTarget);
  }

  return portalTarget;
}

/**
 * Type guard to check if a value is a valid ShadowRoot
 */
export function isShadowRoot(value: unknown): value is ShadowRoot {
  return value instanceof ShadowRoot;
}

/**
 * Options for creating a styled shadow component
 */
export interface StyledShadowOptions {
  /** Whether to inject base styles */
  injectBaseStyles?: boolean;
  /** Custom nonce for CSP */
  nonce?: string;
  /** Additional global styles to inject */
  additionalStyles?: string;
  /** Container class name */
  containerClassName?: string;
}

/**
 * Export all utilities as a single object for convenience
 */
export const ShadowDOMUtils = {
  createShadowRoot,
  mountReactInShadow,
  injectGlobalStyles,
  isolateStyles,
  isInShadowRoot,
  getShadowRoot,
  createPortalTarget,
  isShadowRoot,
};

export default ShadowDOMUtils;