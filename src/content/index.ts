// Content script for Nabokov Web Clipper
import { mountElementSelector } from './mount';

console.log('Nabokov Web Clipper content script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'START_CLIPPING') {
    // Mount the element selector UI
    mountElementSelector();
    sendResponse({ success: true });
  }

  return true;
});

// Initialize on load if needed
// mountElementSelector();