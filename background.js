const urlParser = (url) => {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  return domain;
};

let startTime = null;
const loadStatus = {
  INITIAL: "initial",
  LOADED: "loaded",
  EMPTY: "empty",
};

let currentWebsite = {
  id: null,
  url: null,
  status: loadStatus.EMPTY,
};

const setCurrentWebsite = ({
  tabId = currentWebsite.id,
  tabUrl,
  tabStatus,
}) => {
  currentWebsite.id = tabId;
  currentWebsite.url = tabUrl;
  currentWebsite.status = tabStatus;
};

const startTimer = () => {
  startTime = Date.now();
};

const getDataFromStore = async () => {
  try {
    const sitesData = await new Promise((resolve, reject) => {
      chrome.storage.local.get("sitesData", (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.sitesData || []);
        }
      });
    });

    const sitesInfo = await new Promise((resolve, reject) => {
      chrome.storage.local.get("sitesInfo", (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.sitesInfo || { prod: [], nonProd: [] });
        }
      });
    });

    return { sitesData, sitesInfo };
  } catch (error) {
    console.error("Error fetching data from storage:", error);
    return { sitesData: [], sitesInfo: { prod: [], nonProd: [] } };
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
    console.log("saved");
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
      sitesInfo.unProd = customArrOperation(
        sitesInfo.unProd,
        parsedUrl,
        timeSpent
      );
    }
  }
  saveDataSetOperation(sitesInfo);
};

const stopTimer = (tb) => {
  let endTime = Date.now();
  let timeSpent = endTime - startTime;

  // Minimum 1 minute should be spent on a website for it to be considered
  const minimumTime = 1;
  if (timeSpent / 60000 < minimumTime) {
    return;
  }

  saveDataToStore(currentWebsite, time);
  console.log("time spent on ", currentWebsite.url, " is ", timeSpent);
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // NEW WEBSITE, UPDATE WEBSITE, RELOAD WEBSITE
  if (
    currentWebsite?.id &&
    tabId == currentWebsite.id &&
    tab.url &&
    tab.status === "complete"
  ) {
    // console.log();
    // in case of new tab, setting a url
    if (currentWebsite.status === loadStatus.INITIAL) {
      setCurrentWebsite({ tabUrl: tab.url, tabStatus: loadStatus.LOADED });
      startTimer();
    } else if (
      currentWebsite.status === loadStatus.LOADED &&
      currentWebsite.url !== tab.url
    ) {
      stopTimer();
      setCurrentWebsite({
        tabUrl: tab.url,
        tabStatus: loadStatus.LOADED,
      });
      startTimer();
    }
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  // NEW WEBSITE, CHANGE WEBSITE

  /* For tab change */
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.id !== currentWebsite.id) {
      stopTimer();
    }
    setCurrentWebsite({
      tabId: tab.id,
      tabUrl: tab.url ?? null,
      tabStatus: loadStatus.INITIAL,
    });
    startTimer();
  });
});
