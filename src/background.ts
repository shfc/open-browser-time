import { formatDate } from "./utils";

const dataVersion = 1;

let activeTab: string | null = null;
let startTime: number | null = null;



// Save time spent on the active tab
function saveTime(domain: string | null) {
  if (!domain || !startTime) return;

  const elapsedTime = Date.now() - startTime;
  // use today as the default date, in local time
  const currentDate = formatDate(new Date());

  console.debug(`Time spent: ${Math.floor(elapsedTime / 1000)}s on domain: ${domain}`);

  chrome.storage.local.get([currentDate], (data) => {
    const dailyData = data[currentDate] || {}; // Get existing data or initialize an empty object

    dailyData[domain] = (dailyData[domain] || 0) + elapsedTime;

    chrome.storage.local.set({ [currentDate]: dailyData });
  });

  startTime = null; // Reset start time
}

// Track active tab and start time
function updateActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;

    try {
      const url = new URL(tab.url);
      const domain = url.hostname;

      if (activeTab !== domain) {
        if (activeTab) {
          saveTime(activeTab); // Save time for the previous tab
        }

        activeTab = domain;
        startTime = Date.now(); // Start time for the new tab
      }
    } catch (error) {
      console.error("Error parsing URL:", error);
    }
  });
}

// Periodic save to ensure data consistency
function periodicSave() {
  if (activeTab && startTime) {
    saveTime(activeTab);
    startTime = Date.now(); // Reset start time for the active tab
  }
}

function initInstall() {
  chrome.storage.local.get(["dataVer"], (data) => {
    if (data["dataVer"] === dataVersion) return;
    else if (data["dataVer"] > dataVersion) {
      // TODO: Backup data before clearing
      console.log("Older version detected, resetting data");
      // chrome.storage.local.clear();
    } else if (data["dataVer"] < dataVersion) {
      console.log("Newer version detected, updating data version");
      // TODO: Add migration logic here
    } else {
      // First time install
      chrome.storage.local.set({ ["dataVer"]: dataVersion });
    }
  });
}

chrome.runtime.onStartup.addListener(initInstall);

// Listen for tab updates and focus changes
chrome.tabs.onActivated.addListener(updateActiveTab);
chrome.windows.onFocusChanged.addListener(updateActiveTab);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("tabId",tabId);
  if (tab.active && changeInfo.status === "complete") {
    updateActiveTab();
  }
});

// Save periodically every minute
setInterval(periodicSave, 60000);
