// Background service worker for Nabokov Web Clipper

chrome.runtime.onInstalled.addListener(() => {
  console.log('Nabokov Web Clipper installed');

  // Create context menu
  chrome.contextMenus.create({
    id: 'clip-to-canvas',
    title: 'Clip to Canvas',
    contexts: ['selection', 'image', 'link', 'page']
  });
});

// Handle keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'activate-selector') {
    // Get the active tab and send message to activate element selector
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'ACTIVATE_SELECTOR'
        }).catch(err => {
          console.error('Failed to send message to content script:', err);
        });
      }
    });
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'clip-to-canvas' && tab?.id) {
    // Send message to content script to start clipping
    chrome.tabs.sendMessage(tab.id, {
      type: 'START_CLIPPING',
      data: {
        selectionText: info.selectionText,
        linkUrl: info.linkUrl,
        srcUrl: info.srcUrl,
        pageUrl: info.pageUrl
      }
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // Open canvas in new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/canvas/index.html')
    });
  }
});

// Handle messages from content scripts or canvas
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[background] Received message:', message.type);

  if (message.type === 'OPEN_CANVAS') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/canvas/index.html')
    });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CAPTURE_SCREENSHOT') {
    console.log('[background] Handling CAPTURE_SCREENSHOT');
    // Capture visible tab screenshot
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        console.log('[background] Capturing visible tab:', tabs[0].id);
        chrome.tabs.captureVisibleTab(
          tabs[0].windowId,
          { format: 'png' },
          (dataUrl) => {
            if (chrome.runtime.lastError) {
              console.error('[background] Capture error:', chrome.runtime.lastError.message);
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message
              });
            } else {
              console.log('[background] Capture successful, data URL length:', dataUrl?.length);
              sendResponse({
                success: true,
                dataUrl: dataUrl
              });
            }
          }
        );
      } else {
        console.error('[background] No active tab found');
        sendResponse({
          success: false,
          error: 'No active tab found'
        });
      }
    });
    return true; // Keep message channel open for async response
  }

  console.warn('[background] Unknown message type:', message.type);
  sendResponse({ success: false, error: 'Unknown message type' });
  return false;
});