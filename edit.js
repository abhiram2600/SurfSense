import { defaultValues, storageKeys } from "./utils.js";

const clearSiteData = () => {
  let sitesData = { domain: [], webPage: [] };
  chrome.storage.local.set({ sitesData: sitesData }, () => {
    loadContent();
  });
};

const loadContent = () => {
  chrome.storage.local.get(
    (storageKeys.SITESDATA,
    (result) => {
      let sitesData = result.sitesData || defaultValues.sitesData;
      let siteListContainer = document.getElementById("siteList");
      siteListContainer.innerHTML = "";
      let combinedData = sitesData.webPage.concat(sitesData.domain);
      combinedData.forEach(({ id, url }) => {
        let siteListItem = document.createElement("div");
        siteListItem.classList.add("site-list-item");

        let urlElement = document.createElement("div");
        urlElement.classList.add("site-list-item-url");
        urlElement.textContent = url;

        let buttonElement = document.createElement("button");
        buttonElement.classList.add("site-list-item-button");
        buttonElement.textContent = "Remove";
        buttonElement.addEventListener("click", () => {
          removeSite(id);
        });

        siteListItem.appendChild(urlElement);
        siteListItem.appendChild(buttonElement);

        siteListContainer.appendChild(siteListItem);
      });
    })
  );
};

const removeSite = (id) => {
  chrome.storage.local.get(storageKeys.SITESDATA, (result) => {
    let sitesData = result.sitesData || defaultValues.sitesData;
    let url;
    sitesData.webPage = sitesData.webPage.filter((item) => item.id !== id);
    sitesData.domain = sitesData.domain.filter((item) => item.id !== id);

    chrome.storage.local.set({ sitesData: sitesData }, () => {
      loadContent();
    });
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

document.getElementById("clearAllButton").addEventListener("click", () => {
  clearSiteData();
});

document.getElementById("backButton").addEventListener("click", () => {
  backButton();
});
