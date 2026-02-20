export default defineBackground(() => {
  console.log('GitHub UI Extension background script loaded');

  // Future: This is where the message bus will live
  // for communicating with the local CLI process
  
  // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   if (message.type === 'CLI_COMMAND') {
  //     // Handle CLI commands
  //   }
  // });
});
