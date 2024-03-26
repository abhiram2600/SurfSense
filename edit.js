const clearSiteData = () => {
  let sitesData = { domain: [], webPage: [] };
  chrome.storage.local.set({ sitesData: sitesData }, () => {
    console.log("Site cleared");
    loadContent();
  });
};

const loadContent = () => {
  chrome.storage.local.get(
    ("sitesData",
    (result) => {
      let sitesData = result.sitesData || { domain: [], webPage: [] };
      let ulElement = document.getElementById("siteList");
      ulElement.innerHTML = "";
      let combinedData = sitesData.webPage.concat(sitesData.domain);
      combinedData.forEach(({ id, url }) => {
        let liElement = document.createElement("li");

        let pElement = document.createElement("p");
        pElement.textContent = url;

        let buttonElement = document.createElement("button");
        buttonElement.textContent = "Remove";
        buttonElement.addEventListener("click", () => {
          removeSite(id);
        });

        liElement.appendChild(pElement);
        liElement.appendChild(buttonElement);

        ulElement.appendChild(liElement);
      });
    })
  );
};

const removeSite = (id) => {
  chrome.storage.local.get("sitesData", (result) => {
    let sitesData = result.sitesData || { domain: [], webPage: [] };
    sitesData.webPage = sitesData.webPage.filter((item) => item.id !== id);
    sitesData.domain = sitesData.domain.filter((item) => item.id !== id);
    chrome.storage.local.set({ sitesData: sitesData }, () => {
      console.log("Site removed:", id);
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
