/**
 * MyClassRoom - Chrome Extension Service Worker (Manifest V3)
 * Handles Side Panel lifecycle, Context Menus, and Extension messaging
 */

// Initialize on extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[MyClassRoom Service Worker] Extension installed.');

  // Set side panel default behavior (opens on action or context menu)
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch((err) => {
      console.warn('Could not set side panel behavior:', err);
    });
  }

  // Create Right-Click Context Menu item
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: 'open_myclassroom_sidepanel',
      title: '🎙️ Open MyClassRoom Voice Translator',
      contexts: ['all']
    });
  }
});

// Context Menu Click Handler -> Open Right Side Panel
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'open_myclassroom_sidepanel' && tab?.id) {
      if (chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ tabId: tab.id }).catch((err) => {
          console.warn('[Service Worker] Error opening side panel:', err);
        });
      }
    }
  });
}

// Inter-extension communication hub
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    const tabId = sender.tab ? sender.tab.id : message.tabId;
    if (tabId && chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId }).then(() => {
        sendResponse({ success: true });
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true; // Keep channel open for async response
    }
  }

  if (message.type === 'PING') {
    sendResponse({ status: 'alive' });
  }
});
