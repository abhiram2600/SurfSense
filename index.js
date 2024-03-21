const uniqueId = () => {
  const dateString = Date.now().toString(36).substring(2, 9);
  const randomness = Math.random().toString(36).substring(2, 9);
  return dateString + randomness;
};

const addToStorage = (site) => {
  chrome.storage.local.get(
    ("sitesData",
    (result) => {
      let sitesData = result.sitesData || [];
      const existingSite = sitesData.find((item) => item.url === site);
      if (existingSite) {
        return;
      }
      const uuid = uniqueId();

      sitesData.push({ id: uuid, url: site });
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
    addToStorage(domain);
  } catch (error) {
    console.error("Error getting current URL", error);
  }
};

const addCurrentWebpage = async () => {
  try {
    const url = getCurrentURL();
    //addToStorage(url);
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
