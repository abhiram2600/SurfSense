import {
  defaultValues,
  parseTime,
  storageKeys,
  modifySitesInfoData,
  modifySitesInfoType,
} from "./utils.js";

const loadToWebsite = (data, id, isPreviousDayData) => {
  let siteListContainer = document.getElementById(id);

  if (data.length === 0) {
    siteListContainer.innerHTML = "Nothing Yet";
    return;
  }
  data.sort((a, b) => b.timeSpent - a.timeSpent);
  data = data.slice(0, 5);
  siteListContainer.innerHTML = "";
  data.forEach(({ url, timeSpent }) => {
    if (Math.floor(timeSpent) <= 0) return;
    let siteListItem = document.createElement("div");
    siteListItem.classList.add("site-list-item");

    let urlElement = document.createElement("div");
    urlElement.classList.add("site-list-item-url");
    urlElement.textContent = url;

    let timeSpentElement = document.createElement("div");
    timeSpentElement.classList.add("site-list-item-url");
    timeSpentElement.textContent = parseTime(Math.floor(timeSpent));

    let buttonElement = document.createElement("button");
    buttonElement.classList.add("site-list-item-button");
    buttonElement.textContent = "X";
    buttonElement.addEventListener("click", () => {
      removeSiteData(url, id, isPreviousDayData);
    });

    siteListItem.appendChild(urlElement);
    siteListItem.appendChild(timeSpentElement);
    siteListItem.appendChild(buttonElement);

    siteListContainer.appendChild(siteListItem);
  });
  if (siteListContainer.innerHTML === "") {
    siteListContainer.innerHTML = "Nothing Yet";
  }
};

const removeSiteData = (url, id, isPreviousDayData) => {
  chrome.storage.local.get(
    isPreviousDayData ? storageKeys.PREVIOUSSITESINFO : storageKeys.SITESINFO,
    (result) => {
      let sitesInfo = isPreviousDayData
        ? result.previousSitesInfo
        : result.sitesInfo;
      if (id === "siteListProd") {
        sitesInfo.prod = modifySitesInfoData(
          sitesInfo.prod,
          url,
          modifySitesInfoType.REMOVE
        );
      } else {
        sitesInfo.nonProd = modifySitesInfoData(
          sitesInfo.nonProd,
          url,
          modifySitesInfoType.REMOVE
        );
      }
      chrome.storage.local.set(
        { [isPreviousDayData ? "previousSitesInfo" : "sitesInfo"]: sitesInfo },
        () => {
          loadContent(isPreviousDayData);
        }
      );
    }
  );
};

const loadContent = (isPreviousDayData = false) => {
  chrome.storage.local.get(storageKeys.ISPREVIOUSDAYDATA, (result) => {
    if (result.isPreviousDayData || isPreviousDayData) {
      chrome.storage.local.set({ isPreviousDayData: false });
      chrome.storage.local.get(storageKeys.PREVIOUSSITESINFO, (result) => {
        result = result.previousSitesInfo || defaultValues.sitesInfo;
        loadToWebsite(result.prod.urlArr, "siteListProd", true);
        loadToWebsite(result.nonProd.urlArr, "siteListNonProd", true);
      });
    } else {
      chrome.storage.local.get(storageKeys.SITESINFO, (result) => {
        result = result.sitesInfo || defaultValues.sitesInfo;
        loadToWebsite(result.prod.urlArr, "siteListProd", false);
        loadToWebsite(result.nonProd.urlArr, "siteListNonProd", false);
      });
    }
  });
};

const backButton = () => {
  try {
    chrome.tabs.executeScript(null, {
      code: (() => {
        window.history.back();
      })(),
    });
  } catch (err) {}
};

document.addEventListener("DOMContentLoaded", () => {
  loadContent();
});

document.getElementById("backButton").addEventListener("click", () => {
  backButton();
});
