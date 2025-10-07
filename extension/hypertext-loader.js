(() => {
  if (window.__hypertextInitialized) return;
  if (typeof window.createHypertextExperience !== 'function') {
    console.error('[hypertext-loader] createHypertextExperience not found');
    return;
  }

  window.__hypertextInitialized = true;

  let triggerFromExternal = null;

  const trigger = () => {
    if (typeof triggerFromExternal === 'function') {
      triggerFromExternal();
    }
  };

  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === 'HYPERTEXT_TRIGGER') {
        trigger();
      }
    });
  }

  window.hypertextExperience = window.createHypertextExperience({
    backendUrl: window.HYPERTEXT_BACKEND_URL || 'http://localhost:3100',
    contextProvider: (session, options) => {
      const doc = document;
      const url = window?.location?.href || '';
      const title = doc.title || '';
      const bodyText = doc.body ? doc.body.innerText.trim() : '';
      const selectionText = session?.subject ? session.subject.trim() : '';
      const shouldTruncate = Boolean(options?.truncateContext);
      const TRUNCATE_CHARS = 200000;

      const headerParts = [
        url ? `URL: ${url}` : '',
        title ? `Title: ${title}` : '',
        '--- FULL PAGE TEXT ---'
      ];

      let pageContent = bodyText;
      if (shouldTruncate && pageContent.length > TRUNCATE_CHARS) {
        pageContent = `${pageContent.slice(0, TRUNCATE_CHARS)}\n[Context truncated at ${TRUNCATE_CHARS} characters]`;
      }

      const selectionParts = [
        '--- CURRENT SELECTION ---',
        selectionText
      ];

      return [...headerParts, pageContent, ...selectionParts]
        .filter(part => part !== null && part !== undefined)
        .join('\n');
    },
    autoOpenTooltipOnHover: true,
    hotkey: () => false,
    registerExternalTrigger: (fn) => {
      triggerFromExternal = fn;
    }
  });
})();
