// background.js

let userPoints = 0;
let userConfigurations = [];
let aiSuggestions = [
  { site: 'example.com', suggestion: 'Enable automation for faster interactions.' },
  { site: 'shopping.com', suggestion: 'Apply discounts automatically during checkout.' }
];

// Listen for tab updates to track browsing behavior and provide AI suggestions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkForAISuggestions(tab.url);
  }
});

// Check browsing behavior to provide intelligent suggestions
function checkForAISuggestions(url) {
  let matchingSuggestion = aiSuggestions.find(suggestion => url.includes(suggestion.site));
  if (matchingSuggestion) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'AI Suggestion',
      message: matchingSuggestion.suggestion,
      priority: 1
    });
  }
}

// Reward points for using the extension
function rewardUserPoints(action) {
  userPoints += 10;  // Increment by 10 for each key action
  chrome.storage.sync.set({ userPoints });
  checkForRewards();  // Check if any reward is unlocked
}

// Check if user has unlocked rewards
function checkForRewards() {
  if (userPoints >= 100) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Reward Unlocked!',
      message: 'You have unlocked a new theme or customization!',
      priority: 1
    });
  }
}

// Allow users to export configurations
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportConfig') {
    const exportData = JSON.stringify(userConfigurations);
    sendResponse({ config: exportData });
  }
});

// Allow users to import configurations
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'importConfig') {
    userConfigurations = JSON.parse(request.config);
    chrome.storage.sync.set({ userConfigurations });
    sendResponse({ success: true });
  }
});
