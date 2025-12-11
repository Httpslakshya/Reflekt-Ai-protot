// Background service worker for Reflekt AI

// Handle Alarms (Triggered 15-20 mins after usage)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('feedback-')) {
    const promptHash = alarm.name.split('feedback-')[1];

    chrome.storage.local.get(['pendingFeedback'], (result) => {
      const pending = result.pendingFeedback || {};
      if (pending[promptHash]) {
        chrome.notifications.create(alarm.name, {
          type: 'basic',
          iconUrl: 'icon.png', // Ensure you have an icon file or remove this line
          title: 'Reflekt AI Feedback',
          message: 'How was the AI output? Click to give feedback.',
          priority: 2,
          buttons: [{ title: 'Give Feedback' }, { title: 'Skip' }]
        });
      }
    });
  }
});

// Handle Notification Clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId.startsWith('feedback-')) {
    const promptHash = notificationId.split('feedback-')[1];
    
    if (buttonIndex === 0) {
      // "Give Feedback" clicked - Open popup with query param
      // Note: Programmatically opening popup is restricted, so we open a window or wait for user.
      // Since we can't force open the popup, we'll save a flag that asks for feedback next time they open it.
      chrome.storage.local.get(['pendingFeedback'], (result) => {
        const pending = result.pendingFeedback || {};
        if (pending[promptHash]) {
          pending[promptHash].needsAction = true;
          chrome.storage.local.set({ pendingFeedback: pending });
        }
      });
      
      // Ideally, we would open a tab if we can't open popup
      // chrome.tabs.create({ url: `index.html?view=feedback&hash=${promptHash}` });
    } else {
      // "Skip" clicked - clean up
      chrome.storage.local.get(['pendingFeedback'], (result) => {
        const pending = result.pendingFeedback || {};
        delete pending[promptHash];
        chrome.storage.local.set({ pendingFeedback: pending });
      });
    }
    chrome.notifications.clear(notificationId);
  }
});

// Clear notification if clicked anywhere else
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('feedback-')) {
    chrome.notifications.clear(notificationId);
  }
});