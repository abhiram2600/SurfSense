const urlParser = (url) => {
  // Create a URL object
  const parsedUrl = new URL(url);

  // Extract the domain
  const domain = parsedUrl.hostname;

  return domain;
};
let data = {};

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

const saveDataToStore = (data) => {
  chrome.storage.local.set({ siteInfo: data }, () => {
    console.log("saved");
  });
};

const retrieveData = () => {
  chrome.storage.local.get("siteInfo", (result) => {
    const data = result.siteInfo;
    if (data) {
      console.log("saved data is ", data);
    }
  });
};

const stopTimer = (tb) => {
  let endTime = Date.now();
  let timeSpent = endTime - startTime;
  // uncomment for storage mechnism

  // saveDataToStore({ url: currentWebsite.url, time: timeSpent });
  // retrieveData();

  // -------------------
  console.log("time spent on ", currentWebsite.url, " is ", timeSpent);
  //data[currentWebsite.url] = timeSpent;
  // currentWebsite = tab;
};

const request = indexedDB.open("myDatabase", 1);
request.onupgradeneeded = function (event) {
  const db = event.target.result;

  // Create or upgrade the object store
  const objectStoreName = "tabData";
  db.createObjectStore("tabData", { keyPath: "id" }); // Replace 'tabId' with your desired key path
};

request.onsuccess = function (event) {
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
      // console.log(data);
      //console.log("page has been updated with proper url ", currentWebsite.url);
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
};

request.onerror = function (event) {
  console.error("Error opening database:", event.target.error);
};
