
// TODO: make this an option
chrome.runtime.onStartup.addListener(() => {BoilerKey.login((d)=>{});});

chrome.tabs.onUpdated.addListener(function
  (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.url) {
      console.log(changeInfo.url);
      if (changeInfo.url.indexOf("https://www.purdue.edu/apps/account/cas/login") == 0) {
        BoilerKey.login((status) => {
          if (status) {
          chrome.tabs.update(tabId, {url: changeInfo.url}, () => {
            if (chrome.runtime.lastError) {
              // Something went wrong
              console.log("User closed tab mid authentication");
              // Maybe explain that to the user too?
            }});
          }
        });
      }
    }
  }
);
