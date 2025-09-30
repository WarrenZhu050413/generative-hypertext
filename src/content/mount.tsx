import React from 'react';
import ReactDOM from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import { ElementSelector } from '../components/ElementSelector';
import { createShadowRoot } from '../utils/shadowDOM';

let shadowRoot: ShadowRoot | null = null;
let reactRoot: ReactDOM.Root | null = null;

export function mountElementSelector() {
  // Don't mount if already mounted
  if (shadowRoot && reactRoot) {
    return;
  }

  // Create shadow root for isolated styles
  const { shadowRoot: newShadowRoot, styleCache, container } = createShadowRoot('nabokov-selector-root');
  shadowRoot = newShadowRoot;

  // Create React root and render with Emotion cache
  reactRoot = ReactDOM.createRoot(container);
  reactRoot.render(
    <React.StrictMode>
      <CacheProvider value={styleCache}>
        <ElementSelector onClose={unmountElementSelector} />
      </CacheProvider>
    </React.StrictMode>
  );
}

export function unmountElementSelector() {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }

  if (shadowRoot) {
    const host = shadowRoot.host;
    host.parentNode?.removeChild(host);
    shadowRoot = null;
  }
}