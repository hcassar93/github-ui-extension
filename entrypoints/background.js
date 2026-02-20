export default defineBackground(() => {
  console.log('GitHub UI Extension background loaded');
  
  // Handle messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_TAB') {
      chrome.tabs.create({ url: message.url, active: true });
      sendResponse({ success: true });
    }
  });
});
