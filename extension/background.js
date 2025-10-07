chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'toggle-hypertext') return;
  if (!tab || typeof tab.id !== 'number') {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'HYPERTEXT_TRIGGER' });
  } catch (error) {
    console.warn('[hypertext background] Failed to dispatch trigger', error);
  }
});
