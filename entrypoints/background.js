export default defineBackground(() => {
  console.log('%c[GitHub UI Extension] Background script loaded', 'color: #238636; font-weight: bold');
  
  // Strip X-Frame-Options headers so we can iframe GitHub pages
  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      console.log('%c[GitHub UI Extension] Intercepting request:', 'color: #58a6ff', details.url);
      
      const originalHeaders = details.responseHeaders || [];
      console.log('[GitHub UI Extension] Original headers:', originalHeaders.map(h => h.name));
      
      const headers = originalHeaders.filter(header => {
        const name = header.name.toLowerCase();
        const blocked = name === 'x-frame-options' || name === 'content-security-policy';
        if (blocked) {
          console.log('%c[GitHub UI Extension] BLOCKED HEADER:', 'color: #f85149; font-weight: bold', name, header.value);
        }
        return !blocked;
      });
      
      console.log('[GitHub UI Extension] Filtered headers:', headers.map(h => h.name));
      
      return { responseHeaders: headers };
    },
    { urls: ['https://github.com/*'] },
    ['blocking', 'responseHeaders']
  );
  
  console.log('%c[GitHub UI Extension] Header stripping registered', 'color: #238636; font-weight: bold');
  
  // Handle messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_TAB') {
      chrome.tabs.create({ url: message.url, active: true });
      sendResponse({ success: true });
    }
  });
});
