// Default Values ///////////

const getDefaultSitesInfo = () => {
  return { prod: { urlArr: [], time: 0 }, nonProd: { urlArr: [], time: 0 } };
};

const getDefaultCurrentWebsiteData = () => {
  return {
    id: null,
    url: null,
    status: loadStatus.EMPTY,
    startTime: null,
  };
};

////////////////////////////

// URL Filter /////////////

const urlParser = (url) => {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  return domain;
};

//If URL found in the pattern, return true. Else, return false.
const urlFilter = (currentWebsite) => {
  if (!currentWebsite.url) {
    return false;
  }
  let url = currentWebsite.url;
  let pattern = /^chrome:\/\//;
  if (pattern.test(url)) {
    return true;
  }
  return false;
};

//////////////////////////////

// Constants /////////////////

const loadStatus = {
  INITIAL: "initial",
  LOADED: "loaded",
  EMPTY: "empty",
};

//////////////////////////////

// CurrentWebsiteData Operations

const getCurrentWebsiteFromStore = async () => {
  const currentWebsiteData = await new Promise((resolve, reject) => {
    chrome.storage.local.get("currentWebsite", (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.currentWebsite || getDefaultCurrentWebsiteData());
      }
    });
  });
  return currentWebsiteData;
};

const setCurrentWebsiteToStore = async (data) => {
  chrome.storage.local.set({ currentWebsite: data }, () => {
    console.log("currentwebsite data updated");
  });
};

const setCurrentWebsite = ({ currentWebsite, tabId, tabUrl, tabStatus }) => {
  currentWebsite.id = tabId ?? currentWebsite.id;
  currentWebsite.url = tabUrl;
  currentWebsite.status = tabStatus;
  setCurrentWebsiteToStore(currentWebsite);
};

/////////////////////////////

// Timer Operations /////////

const startTimer = (currentWebsite) => {
  currentWebsite.startTime = Date.now();
  setCurrentWebsiteToStore(currentWebsite);
};

const stopTimer = (currentWebsite) => {
  if (!currentWebsite.url || urlFilter(currentWebsite)) {
    return;
  }
  let endTime = Date.now();
  let timeSpent = (endTime - currentWebsite.startTime) / 60000;

  // Minimum 1 minute should be spent on a website for it to be considered
  // const minimumTime = 1;
  // if (timeSpent < minimumTime) {
  //   return;
  // }

  // console.log("time spent on ", currentWebsite.url, " is ", timeSpent);
  saveDataToStore(currentWebsite.url, timeSpent);
};

//////////////////////////////

// Get/Set Data (sitesInfo, sitesData) From Store. Custom Operations to Aid this functionality //

const getDataFromStore = async () => {
  try {
    const sitesData = await new Promise((resolve, reject) => {
      chrome.storage.local.get("sitesData", (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.sitesData || { domain: [], webPage: [] });
        }
      });
    });

    const sitesInfo = await new Promise((resolve, reject) => {
      chrome.storage.local.get("sitesInfo", (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.sitesInfo || getDefaultSitesInfo());
        }
      });
    });

    return { sitesData, sitesInfo };
  } catch (error) {
    console.error("Error fetching data from storage:", error);
    return {
      sitesData: { domain: [], webPage: [] },
      sitesInfo: getDefaultSitesInfo(),
    };
  }
};

/*
Functionality:-
If a certain url is in array, find the index in the arr and append time
if it is not there, create a new object of url and time and append to the arr
*/
const customArrOperation = (arr, url, time) => {
  let idx = arr.urlArr.findIndex((item) => item.url === url);
  if (idx !== -1) {
    arr.urlArr[idx].timeSpent += time;
  } else {
    let data = { url: url, timeSpent: time };
    arr.urlArr.push(data);
  }
  arr.time += time;
  return arr;
};

const saveDataSetOperation = (data) => {
  chrome.storage.local.set({ sitesInfo: data }, () => {
    console.log("saved", data);
  });
};

const saveDataToStore = async (url, timeSpent) => {
  const { sitesData, sitesInfo } = await getDataFromStore();
  const parsedUrl = urlParser(url);

  const { domain, webPage } = sitesData;

  let idx = webPage.findIndex((item) => item.url === url);
  // check if the current URL is listed in the webpage prod list
  if (idx !== -1) {
    sitesInfo.prod = customArrOperation(sitesInfo.prod, url, timeSpent);
  }
  // else check if the current URL is listed in the domain prod list
  else {
    let idxd = domain.findIndex((item) => item.url === parsedUrl);
    if (idxd !== -1) {
      sitesInfo.prod = customArrOperation(sitesInfo.prod, parsedUrl, timeSpent);
    }
    // it means it is not a productive site, add it to unproductive list
    else {
      sitesInfo.nonProd = customArrOperation(
        sitesInfo.nonProd,
        parsedUrl,
        timeSpent
      );
    }
  }
  saveDataSetOperation(sitesInfo);
};

///////////////////////////////////////////

// Main Logic /////////////////////////////

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const currentWebsite = await getCurrentWebsiteFromStore();
  // NEW WEBSITE, UPDATE WEBSITE, RELOAD WEBSITE
  if (
    currentWebsite?.id &&
    tabId == currentWebsite.id &&
    tab.url &&
    tab.status === "complete"
  ) {
    // in case of new tab, setting a url
    if (currentWebsite.status === loadStatus.INITIAL) {
      setCurrentWebsite({
        currentWebsite,
        tabUrl: tab.url,
        tabStatus: loadStatus.LOADED,
      });
      startTimer(currentWebsite);
    } else if (
      currentWebsite.status === loadStatus.LOADED &&
      currentWebsite.url !== tab.url
    ) {
      stopTimer(currentWebsite);
      setCurrentWebsite({
        currentWebsite,
        tabUrl: tab.url,
        tabStatus: loadStatus.LOADED,
      });
      startTimer(currentWebsite);
    }
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  // NEW WEBSITE, CHANGE WEBSITE

  /* For tab change */
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    const currentWebsite = await getCurrentWebsiteFromStore();
    if (tab.id !== currentWebsite.id) {
      stopTimer(currentWebsite);
    }
    setCurrentWebsite({
      currentWebsite,
      tabId: tab.id,
      tabUrl: tab.url ?? null,
      tabStatus: loadStatus.INITIAL,
    });
    startTimer(currentWebsite);
  });
});

////////////////////////////////////////
