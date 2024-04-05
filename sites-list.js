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

    siteListItem.appendChild(urlElement);
    siteListItem.appendChild(timeSpentElement);

    siteListContainer.appendChild(siteListItem);
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
