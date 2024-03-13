// const request = indexedDB.open("myDatabase", 1);
// let db;

// request.onsuccess = function (event) {
//   db = event.target.result;
//   console.log("Database opened successfully");
// };

// request.onerror = function (event) {
//   console.error("Error opening database:", event.target.error);
// };

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log("onUpdated", tab.id, tab.status, tab.url);
//   if (
//     tab.id === a.id &&
//     tab.status === "complete" &&
//     tab.url !== "chrome://newtab/"
//   ) {
//     console.time("time");

//   }
// });

// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.get(activeInfo.tabId, (tab) => {
//     if (a === null) a = tab;
//     else {
//       if (tab.id !== a.id) {
//         console.log(a.url);
//         console.timeEnd("time");
//         a = tab;
//       }
//     }
//     //console.log(".get", a); //tab.id, tab.status, tab.url);
//   });
// });

let currentWebsite = null;
let startTime = null;
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
    // console.log("onUpdated", tab.id, tab.status, tab.url);
    // if (
    //   tab.id === a.id &&
    //   tab.status === "complete" &&
    //   tab.url !== "chrome://newtab/"
    // ) {
    //   console.time("time");
    // }
    if (
      currentWebsite?.id &&
      tabId == currentWebsite.id &&
      tab.status === "complete" &&
      tab.url !== "chrome://newtab/"
    ) {
      currentWebsite.url = tab.url;
      startTime = Date.now();
      //console.log("page has been updated with proper url ", currentWebsite.url);
    }
  });
  chrome.tabs.onActivated.addListener((activeInfo) => {
    // NEW WEBSITE, CHANGE WEBSITE
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (!currentWebsite) {
        currentWebsite = tab;
      } else {
        if (tab.id !== currentWebsite.id) {
          let endTime = Date.now();
          let timeSpent = endTime - startTime;
          console.log("time spent on ", currentWebsite.url, " is ", timeSpent);
          currentWebsite = tab;
        }
      }
      // if (a === null) a = tab;
      // else {
      //   if (tab.id !== a.id) {
      //     console.log(a.url);
      //     console.timeEnd("time");
      //     a = tab;
      //   }
      // }
      // console.log(".get", tab.id, tab.status, tab.url ?? "none");
    });
  });

  // const db = event.target.result;
  // const transaction = db.transaction(["tabData"], "readwrite");
  // const objectStore = transaction.objectStore("tabData");
  // const data = { id: 1, xyz: "abc" };
  // const putRequest = objectStore.put(data);
  // putRequest.onsuccess = function (event) {
  //   console.log("Data added to IndexedDB for tab ID:");
  // };
  // putRequest.onerror = function (event) {
  //   console.error("Error adding data to IndexedDB:", event.target.error);
  // };
  // const getRequest = objectStore.get(1);
  // getRequest.onsuccess = function (event) {
  //   console.log(event.target.result);
  // };
  // chrome.tabs.onActivated.addListener(async (activeInfo) => {
  //   const transaction = db.transaction(["tabData"], "readwrite");
  //   const objectStore = transaction.objectStore("tabData");
  //   const data = { tabId: activeInfo.tabId, property: "value" };
  //   const addRequest = objectStore.put(data, activeInfo.tabId);
  //   addRequest.onsuccess = function (event) {
  //     console.log("Data added to IndexedDB for tab ID:", activeInfo.tabId);
  //   };
  //   addRequest.onerror = function (event) {
  //     console.error("Error adding data to IndexedDB:", event.target.error);
  //   };
  // });
  // chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  //   const transaction = db.transaction(["tabData"], "readwrite");
  //   const objectStore = transaction.objectStore("tabData");
  //   const getRequest = objectStore.get(tabId);
  //   getRequest.onsuccess = function (event) {
  //     const existingData = event.target.result;
  //     if (existingData) {
  //       existingData.property = "modifiedValue";
  //       const updateRequest = objectStore.put(existingData, tabId);
  //       updateRequest.onsuccess = function (event) {
  //         console.log("Data updated in IndexedDB for tab ID:", tabId);
  //       };
  //       updateRequest.onerror = function (event) {
  //         console.error(
  //           "Error updating data in IndexedDB:",
  //           event.target.error
  //         );
  //       };
  //     }
  //   };
  //   getRequest.onerror = function (event) {
  //     console.error("Error getting data from IndexedDB:", event.target.error);
  //   };
  // });
};

request.onerror = function (event) {
  console.error("Error opening database:", event.target.error);
};
