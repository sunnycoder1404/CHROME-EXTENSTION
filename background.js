// background.js

let userPoints = 0;
let userConfigurations = [];
let aiSuggestions = [
  { site: 'example.com', suggestion: 'Enable automation for faster interactions.' },
  { site: 'shopping.com', suggestion: 'Apply discounts automatically during checkout.' }
];

// Load user data from storage on initialization
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['userPoints', 'userConfigurations'], (data) => {
    userPoints = data.userPoints || 0;
    userConfigurations = data.userConfigurations || [];
  });
});

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
      iconUrl: 'icons/icon128.png',
      title: 'AI Suggestion',
      message: matchingSuggestion.suggestion,
      priority: 1
    });
  }
}

// Reward points for using the extension
function rewardUserPoints(action) {
  const pointsForAction = getPointsForAction(action);
  userPoints += pointsForAction;
  chrome.storage.sync.set({ userPoints }, () => {
    checkForRewards();
  });
}

// Determine points awarded for different actions
function getPointsForAction(action) {
  switch (action) {
    case 'automation_enabled':
      return 20;
    case 'theme_change':
      return 15;
    default:
      return 10;
  }
}

// Check if user has unlocked rewards
function checkForRewards() {
  if (userPoints >= 100 && !hasUnlockedReward('theme')) {
    unlockReward('theme', 'You have unlocked a new theme!');
  }
}

// Unlock a reward and notify the user
function unlockReward(rewardType, message) {
  chrome.storage.sync.get({ unlockedRewards: [] }, (data) => {
    let unlockedRewards = data.unlockedRewards;
    if (!unlockedRewards.includes(rewardType)) {
      unlockedRewards.push(rewardType);
      chrome.storage.sync.set({ unlockedRewards }, () => {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Reward Unlocked!',
          message: message,
          priority: 1
        });
      });
    }
  });
}

// Check if a reward has already been unlocked
function hasUnlockedReward(rewardType) {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ unlockedRewards: [] }, (data) => {
      resolve(data.unlockedRewards.includes(rewardType));
    });
  });
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
    try {
      userConfigurations = JSON.parse(request.config);
      chrome.storage.sync.set({ userConfigurations }, () => {
        sendResponse({ success: true });
      });
    } catch (error) {
      sendResponse({ success: false, error: 'Invalid configuration data.' });
    }
  }
  return true; // Required for async response
});

// Listen for browser action clicks
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'popup.html' });
});

// Helper to reset user points and configurations
function resetUserData() {
  userPoints = 0;
  userConfigurations = [];
  chrome.storage.sync.set({ userPoints, userConfigurations });
}

// Automated data backup every 24 hours
setInterval(() => {
  chrome.storage.sync.set({ backupData: { userPoints, userConfigurations } });
}, 24 * 60 * 60 * 1000);
