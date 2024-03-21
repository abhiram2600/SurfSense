const clearSiteData = () => {
  chrome.storage.local.remove("sitesData");
  loadContent();
};

const loadContent = () => {
  chrome.storage.local.get(
    ("sitesData",
    (result) => {
      let sitesData = result.sitesData || [];
      let ulElement = document.getElementById("siteList");
      ulElement.innerHTML = "";
      sitesData.forEach(({ id, url }) => {
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
    let sitesData = result.sitesData || [];
    let updatedData = sitesData.filter((item) => item.id !== id);
    chrome.storage.local.set({ sitesData: updatedData }, () => {
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
