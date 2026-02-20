export default defineBackground(() => {
  console.log('GitHub UI Extension background loaded');
  
  // Strip X-Frame-Options headers so we can iframe GitHub pages
  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const headers = details.responseHeaders?.filter(header => {
        const name = header.name.toLowerCase();
        return name !== 'x-frame-options' && name !== 'content-security-policy';
      });
      
      return { responseHeaders: headers };
    },
    { urls: ['https://github.com/*'] },
    ['blocking', 'responseHeaders']
  );
  
  // Handle messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_TAB') {
      chrome.tabs.create({ url: message.url, active: true });
      sendResponse({ success: true });
    }
  });
});
