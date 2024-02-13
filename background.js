let savedCode = ""; // Variable to store the source code

// Listen for messages from the content script or popup script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "saveCode") {
        // Convert the source code to a string
        const sourceCodeString = JSON.stringify(message.sourceCode);

        // Save the source code
        savedCode = String(sourceCodeString);
        console.log("Saved source code:", savedCode);

        // Check for adult content or content restricted to age under 18
        const contentRestrictedPattern = /(?:porn|adult content|age\s*restricted\s*18)/i;

         // Get the current tab's URL
         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTabUrl = tabs[0]?.url || ""; // Get the URL or an empty string if not available

            if (contentRestrictedPattern.test(savedCode)) {
                // Send a notification
                sendNotification("Site contains adult content or is age-restricted.");
                blockSiteAccess(currentTabUrl);
            } else {
                // Send a notification when no adult content is found
                sendNotification("No adult content found in the site content.");
            }
        });

        // const url="http://fb.com";
        // if (contentRestrictedPattern.test(savedCode)) {
        //     // Send a notification
        //     sendNotification("Site contains adult content or is age-restricted.");
        //     blockSiteAccess(url);
        // } else {
        //     // Send a notification when no adult content is found
        //     sendNotification("No adult content found in the site content.");
        // }

        // You can perform additional processing or saving logic here
    }
});

// Example: You might want to expose a function to retrieve the saved code
function getSavedCode() {
    return savedCode;
}

function downloadCode(code) {
    console.log("Code for download:", code);

    chrome.downloads.download({
        url: 'data:text/html;charset=utf-8,' + encodeURIComponent(code),
        filename: 'saved_code.html',
        saveAs: false
    }, function (downloadId) {
        if (chrome.runtime.lastError) {
            console.error("Download error:", chrome.runtime.lastError);
        } else {
            console.log("Download successful. Download ID:", downloadId);
        }
    });
}

function sendNotification(message) {
    // Use chrome.notifications API to send a notification
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/fortify16.png',
        title: 'Notification Title',
        message: message
    });
}

function blockSiteAccess(url) {
    // Fetch the list of blocked URLs from storage
    chrome.storage.sync.get({ blockedUrls: [] }, (result) => {
      const blockedUrls = result.blockedUrls || [];
  
      // Add the new URL to the blocked list if not already present
      if (!blockedUrls.includes(url)) {
        blockedUrls.push(url);
  
        // Update the blocked list in storage
        chrome.storage.sync.set({ blockedUrls: blockedUrls }, () => {
          console.log(`Site access blocked for URL: ${url}`);
        });
      }
    });
  }
  