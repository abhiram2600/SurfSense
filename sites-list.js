const loadToWebsite = (data, id) => {
  if (data.length === 0) {
    return;
  }
  data.sort((a, b) => b.timeSpent - a.timeSpent);
  data = data.slice(0, 5);
  let siteListContainer = document.getElementById(id);
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
    timeSpentElement.textContent = `${Math.floor(timeSpent)} ${
      timeSpent > 1 ? "mins" : "min"
    }`;

    let buttonElement = document.createElement("button");
    buttonElement.classList.add("site-list-item-button");
    buttonElement.textContent = "X";
    buttonElement.addEventListener("click", () => {
      removeSiteData(url, id);
    });

    siteListItem.appendChild(urlElement);
    siteListItem.appendChild(timeSpentElement);
    siteListItem.appendChild(buttonElement);

    siteListContainer.appendChild(siteListItem);
  });
};

const removeSiteData = (url, id) => {
  chrome.storage.local.get("sitesInfo", (result) => {
    let sitesInfo = result.sitesInfo;
    if (id === "siteListProd") {
      sitesInfo.prod.urlArr = sitesInfo.prod.urlArr.filter((item) => {
        //true is removed
        if (item.url === url) {
          sitesInfo.prod.time -= item.timeSpent;
          return false;
        }
        return true;
      });
    } else {
      sitesInfo.nonProd.urlArr = sitesInfo.nonProd.urlArr.filter((item) => {
        if (item.url === url) {
          sitesInfo.nonProd.time -= item.timeSpent;
          return false;
        }
        return true;
      });
    }
    chrome.storage.local.set({ sitesInfo: sitesInfo }, () => {
      loadContent();
    });
  });
};

const loadContent = () => {
  chrome.storage.local.get("sitesInfo", (result) => {
    result = result.sitesInfo || {
      prod: { urlArr: [], time: 0 },
      nonProd: { urlArr: [], time: 0 },
    };
    loadToWebsite(result.prod.urlArr, "siteListProd");
    loadToWebsite(result.nonProd.urlArr, "siteListNonProd");
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
