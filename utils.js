export const loadStatus = {
  INITIAL: "initial",
  LOADED: "loaded",
  EMPTY: "empty",
  LOST_FOCUS: "lost_focus",
};

export const linkType = {
  DOMAIN: "domain",
  WEBPAGE: "webpage",
};

export const storageKeys = {
  SITESINFO: "sitesInfo",
  SITESDATA: "sitesData",
  CURRENTWEBSITE: "currentWebsite",
  PREVIOUSSITESINFO: "previousSitesInfo",
  ISPREVIOUSDAYDATA: "isPreviousDayData",
};

export const modifySitesInfoType = {
  REMOVE: "remove",
  MODIFY: "modify",
  SUBTYPE: {
    MODIFYEDITLIST: "modifyEditList",
    MODIFYADDLIST: "modifyAddList",
  },
};

export const messageType = {
  ONSTART: "onStart",
};

export const defaultValues = {
  sitesInfo: {
    prod: { urlArr: [], time: 0 },
    nonProd: { urlArr: [], time: 0 },
  },
  sitesData: {
    domain: [],
    webPage: [],
  },
  currentWebsite: {
    id: null,
    url: null,
    status: loadStatus.EMPTY,
    startTime: null,
    lastAccessedDate: null,
  },
};

export const uniqueId = () => {
  const dateString = Date.now().toString(36).substring(2, 9);
  const randomness = Math.random().toString(36).substring(2, 9);
  return dateString + randomness;
};

export const parseTime = (time) => {
  if (time >= 60) {
    const val = (time / 60).toFixed(1);
    return `${val} ${val > 1 ? "hours" : "hour"}`;
  }
  return `${time} mins`;
};

export const modifySitesInfoData = (data, url, type, subType) => {
  switch (type) {
    case modifySitesInfoType.REMOVE:
      data.urlArr = data.urlArr.filter((item) => {
        if (item.url === url) {
          data.time -= item.timeSpent;
          return false;
        }
        return true;
      });
      return data;
    case modifySitesInfoType.MODIFY:
      let d1, d2;
      if (subType === modifySitesInfoType.SUBTYPE.MODIFYADDLIST) {
        d1 = data.nonProd;
        d2 = data.prod;
      } else {
        d1 = data.prod;
        d2 = data.nonProd;
      }
      let foundElement = null;
      d1.urlArr = d1.urlArr.filter((item) => {
        if (item.url === url) {
          foundElement = item;
          return false;
        }
        return true;
      });
      if (foundElement) {
        d2.urlArr.push(foundElement);
        d1.time -= foundElement.timeSpent;
        d2.time += foundElement.timeSpent;
        if (subType === modifySitesInfoType.SUBTYPE.MODIFYADDLIST) {
          data.nonProd = d1;
          data.prod = d2;
        } else {
          data.prod = d1;
          data.nonProd = d2;
        }
        return data;
      }
      return data;
    default:
      break;
  }
};
