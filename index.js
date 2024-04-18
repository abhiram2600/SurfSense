import {
  defaultValues,
  linkType,
  parseTime,
  storageKeys,
  modifySitesInfoData,
  modifySitesInfoType,
  messageType,
} from "./utils.js";

const editSitesInfo = (url) => {
  chrome.storage.local.get(storageKeys.SITESINFO, (result) => {
    let sitesInfo = result.sitesInfo || defaultValues.sitesInfo;
    sitesInfo = modifySitesInfoData(
      sitesInfo,
      url,
      modifySitesInfoType.MODIFY,
      modifySitesInfoType.SUBTYPE.MODIFYADDLIST
    );
    chrome.storage.local.set({ sitesInfo });
    loadContent();
  });
};

const addToStorage = (site, type) => {
  chrome.storage.local.get(
    (storageKeys.SITESDATA,
    (result) => {
      let sitesData = result.sitesData || defaultValues.sitesData;
      if (type === linkType.DOMAIN) {
        const existingSite = sitesData.domain.find((item) => item.url === site);
        if (existingSite) {
          return;
        }
        sitesData.domain.push({ url: site });
      } else {
        const existingSite = sitesData.webPage.find(
          (item) => item.url === site
        );
        if (existingSite) {
          return;
        }

        sitesData.webPage.push({ url: site });
      }
      chrome.storage.local.set({ sitesData }, () => {
        let element = document.getElementById(
          type === linkType.DOMAIN ? "doneDomain" : "doneUrl"
        );
        element.style.display = "block";

        setTimeout(function () {
          element.style.display = "none";
        }, 1500);
        if (type === linkType.DOMAIN) {
          editSitesInfo(site);
        }
      });
    })
  );
};

const getCurrentURL = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tabs[0].url;
  return url;
};

const addWebsite = async () => {
  try {
    const url = await getCurrentURL();
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    addToStorage(domain, linkType.DOMAIN);
  } catch (error) {
    console.error("Error getting current URL", error);
  }
};

const addCurrentWebpage = async () => {
  try {
    const url = await getCurrentURL();
    addToStorage(url, linkType.WEBPAGE);
  } catch (error) {
    console.error("Error getting current URL", error);
  }
};

const loadContent = () => {
  chrome.runtime.sendMessage({ action: messageType.ONSTART });
  chrome.storage.local.get(storageKeys.SITESINFO, (result) => {
    let sitesInfo = result.sitesInfo || defaultValues.sitesInfo;
    document.getElementById("prodTime").innerText = parseTime(
      Math.floor(sitesInfo.prod.time)
    );
    document.getElementById("nonProdTime").innerText = parseTime(
      Math.floor(sitesInfo.nonProd.time)
    );
  });
};

const setPreviousDayDataFlag = async (e) => {
  e.preventDefault();
  await chrome.storage.local.set({ isPreviousDayData: true });
  try {
    window.location.href = e.target.href;
  } catch (e) {}
};

document.addEventListener("DOMContentLoaded", () => {
  loadContent();
});

document
  .getElementById("addWebsiteButton")
  .addEventListener("click", addWebsite);

document
  .getElementById("addCurrentWebpageButton")
  .addEventListener("click", addCurrentWebpage);

document
  .getElementById("previousDay")
  .addEventListener("click", setPreviousDayDataFlag);

// // For testing only
// const resetEverything = () => {
//   chrome.storage.local.set({ sitesInfo: defaultValues.sitesInfo });
//   chrome.storage.local.set({ currentWebsite: defaultValues.currentWebsite });
//   chrome.storage.local.set({ sitesData: defaultValues.sitesData });
// };

// document.getElementById("reset").addEventListener("click", resetEverything);
