const uniqueId = () => {
  const dateString = Date.now().toString(36).substring(2, 9);
  const randomness = Math.random().toString(36).substring(2, 9);
  return dateString + randomness;
};

const addToStorage = (site, type) => {
  chrome.storage.local.get(
    ("sitesData",
    (result) => {
      let sitesData = result.sitesData || { domain: [], webPage: [] };
      if (type === "domain") {
        const existingSite = sitesData.domain.find((item) => item.url === site);
        if (existingSite) {
          return;
        }
        sitesData.domain.push({ id: uuid, url: site });

        const uuid = uniqueId();
      } else {
        const existingSite = sitesData.webPage.domain.find(
          (item) => item.url === site
        );
        if (existingSite) {
          return;
        }
        const uuid = uniqueId();

        sitesData.webPage.push({ id: uuid, url: site });
      }
      chrome.storage.local.set({ sitesData }, () => {
        console.log("Added website");
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
    addToStorage(domain, "domain");
  } catch (error) {
    console.error("Error getting current URL", error);
  }
};

const addCurrentWebpage = async () => {
  try {
    const url = await getCurrentURL();
    addToStorage(url, "webpage");
  } catch (error) {
    console.error("Error getting current URL", error);
  }
};

document
  .getElementById("addWebsiteButton")
  .addEventListener("click", addWebsite);

document
  .getElementById("addCurrentWebpageButton")
  .addEventListener("click", addCurrentWebpage);

// only for testing

// let ele = document.getElementById("abc");
// ele.textContent = domain;

//
