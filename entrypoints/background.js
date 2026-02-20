export default defineBackground(() => {
  console.log('[GitHub UI Extension] Background script loaded');

  // Handle messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_SIDEPANEL') {
      // Open the side panel
      chrome.sidePanel.open({ windowId: sender.tab.windowId })
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // Keep channel open for async response
    }
    
    if (message.type === 'OPEN_IN_SIDEPANEL') {
      // Forward to side panel (it will handle this)
      sendResponse({ success: true });
    }
  });
});
