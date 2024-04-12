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
