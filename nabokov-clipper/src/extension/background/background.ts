/**
 * Background service worker for Nabokov Web Clipper
 * Handles keyboard shortcuts and cross-extension messaging
 */

// Listen for keyboard command to activate element selector
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'activate-selector') {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      if (!tab?.id) {
        console.error('No active tab found');
        return;
      }

      // Check if the tab has a valid URL (not chrome:// or chrome-extension://)
      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
        console.warn('Cannot inject content script into chrome:// or chrome-extension:// pages');
        return;
      }

      // Send message to content script to activate selector
      await chrome.tabs.sendMessage(tab.id, {
        type: 'ACTIVATE_SELECTOR'
      });

    } catch (error) {
      console.error('Error activating selector:', error);

      // If content script is not loaded, try to inject it
      if (error instanceof Error && error.message.includes('Receiving end does not exist')) {
        console.log('Content script not loaded, attempting injection...');

        try {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
          });

          if (tab?.id) {
            // Inject content script
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });

            // Try sending message again after brief delay
            setTimeout(async () => {
              try {
                await chrome.tabs.sendMessage(tab.id!, {
                  type: 'ACTIVATE_SELECTOR'
                });
              } catch (retryError) {
                console.error('Failed to activate selector after injection:', retryError);
              }
            }, 100);
          }
        } catch (injectionError) {
          console.error('Failed to inject content script:', injectionError);
        }
      }
    }
  }
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Nabokov Web Clipper installed successfully');
  } else if (details.reason === 'update') {
    console.log('Nabokov Web Clipper updated to version', chrome.runtime.getManifest().version);
  }
});

// Keep service worker alive (optional, for debugging)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'alive' });
  }
  return true;
});

export {};